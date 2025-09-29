import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: Request) {
  try {
    const { order_ids, new_status, reason, admin_action } = await request.json();
    
    if (!order_ids || !Array.isArray(order_ids) || order_ids.length === 0 || !new_status) {
      return NextResponse.json({ 
        error: 'Order IDs array and new status are required' 
      }, { status: 400 });
    }

    // Validate required reason for destructive actions
    const requiresReason = ['undelivered', 'refunded', 'canceled'].includes(new_status);
    if (requiresReason && !reason?.trim()) {
      return NextResponse.json({ 
        error: `Reason is required for status: ${new_status}` 
      }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get all orders to validate transitions
    const { data: orders, error: fetchError } = await supabase
      .from('cashapp_payments')
      .select('*')
      .in('id', order_ids);

    if (fetchError || !orders || orders.length === 0) {
      console.error('Error fetching orders:', fetchError);
      return NextResponse.json({ error: 'Orders not found' }, { status: 404 });
    }

    // Validate all transitions are valid
    const validTransitions: Record<string, string[]> = {
      'awaiting_payment': ['verifying', 'paid', 'canceled'],
      'verifying': ['awaiting_payment', 'paid', 'refunded', 'canceled'],
      'paid': ['verifying', 'assigned', 'refunded', 'canceled'],
      'assigned': ['paid', 'delivered', 'undelivered', 'refunded', 'canceled'],
      'delivered': ['assigned', 'refunded'],
      'undelivered': ['assigned', 'delivered', 'refunded', 'canceled'],
      'refunded': ['verifying', 'paid'],
      'canceled': ['awaiting_payment', 'verifying']
    };

    const invalidTransitions = orders.filter(order => 
      !validTransitions[order.status]?.includes(new_status)
    );

    if (invalidTransitions.length > 0) {
      return NextResponse.json({ 
        error: `Invalid transitions found for orders: ${invalidTransitions.map(o => o.short_code).join(', ')}` 
      }, { status: 400 });
    }

    const results = {
      successful: [] as string[],
      failed: [] as { order_id: string, error: string }[]
    };

    // Process each order individually to handle side effects
    for (const order of orders) {
      try {
        // Handle side effects for each order
        await handleBulkSideEffects(supabase, order, order.status, new_status, reason);

        // Update the order status
        const { error: updateError } = await supabase
          .from('cashapp_payments')
          .update({ 
            status: new_status,
            updated_at: new Date().toISOString(),
            ...(reason && { admin_notes: reason }),
            ...(admin_action && { last_admin_action: new Date().toISOString() })
          })
          .eq('id', order.id);

        if (updateError) {
          console.error(`Error updating order ${order.short_code}:`, updateError);
          results.failed.push({ 
            order_id: order.id, 
            error: 'Failed to update status' 
          });
        } else {
          results.successful.push(order.short_code);
          
          // Log audit trail
          await logBulkAuditTrail(supabase, order.id, order.status, new_status, reason, admin_action);
        }
      } catch (error) {
        console.error(`Error processing order ${order.short_code}:`, error);
        results.failed.push({ 
          order_id: order.id, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }

    // Send bulk Discord notification
    if (results.successful.length > 0) {
      await sendBulkDiscordNotification(results.successful, new_status, reason);
    }

    return NextResponse.json({ 
      success: true,
      message: `Bulk status change completed. ${results.successful.length} successful, ${results.failed.length} failed.`,
      results
    });
  } catch (error) {
    console.error('Error in bulk-change-status route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Handle side effects for bulk operations
async function handleBulkSideEffects(supabase: any, orderData: any, currentStatus: string, newStatus: string, reason?: string) {
  try {
    // Same side effects as individual changes
    if (currentStatus === 'paid' && newStatus === 'assigned') {
      const { data: existingPayout } = await supabase
        .from('payouts')
        .select('id')
        .eq('order_id', orderData.id)
        .single();
      
      if (!existingPayout && orderData.driver_id) {
        await supabase
          .from('payouts')
          .insert({
            order_id: orderData.id,
            driver_id: orderData.driver_id,
            amount_cents: 800,
            status: 'queued',
            created_at: new Date().toISOString()
          });
      }
    }
    
    if (currentStatus === 'delivered' && newStatus === 'refunded') {
      await supabase
        .from('payouts')
        .update({ status: 'blocked', blocked_reason: reason || 'Order refunded' })
        .eq('order_id', orderData.id)
        .eq('status', 'queued');
    }
    
    if (['paid', 'assigned'].includes(currentStatus) && ['refunded', 'canceled'].includes(newStatus)) {
      await supabase
        .from('payouts')
        .update({ status: 'reverted', blocked_reason: reason || `Order ${newStatus}` })
        .eq('order_id', orderData.id)
        .in('status', ['queued', 'pending']);
    }
  } catch (error) {
    console.error('Error handling bulk side effects:', error);
  }
}

// Log audit trail for bulk operations
async function logBulkAuditTrail(supabase: any, orderId: string, fromStatus: string, toStatus: string, reason?: string, adminAction?: boolean) {
  try {
    await supabase
      .from('order_audit_log')
      .insert({
        order_id: orderId,
        action: 'bulk_status_change',
        from_status: fromStatus,
        to_status: toStatus,
        reason: reason,
        admin_action: adminAction || false,
        timestamp: new Date().toISOString(),
        metadata: {
          user_agent: 'admin_panel_bulk',
          ip_address: 'internal'
        }
      });
  } catch (error) {
    console.error('Error logging bulk audit trail:', error);
  }
}

// Send Discord notification for bulk changes
async function sendBulkDiscordNotification(orderCodes: string[], newStatus: string, reason?: string) {
  try {
    const webhookUrl = process.env.DISCORD_WEBHOOK;
    if (!webhookUrl) return;
    
    const statusEmojis: Record<string, string> = {
      delivered: '✅',
      undelivered: '❌',
      refunded: '💰',
      canceled: '🚫',
      paid: '💳',
      assigned: '🚚',
      verifying: '🔍'
    };
    
    const embed = {
      title: `${statusEmojis[newStatus] || '📋'} Bulk Status Change`,
      color: 0x8B5CF6, // Purple for bulk actions
      fields: [
        { name: 'Status', value: newStatus.replace('_', ' ').toUpperCase(), inline: true },
        { name: 'Orders Updated', value: orderCodes.length.toString(), inline: true },
        { name: 'Time', value: new Date().toLocaleString(), inline: true },
        { name: 'Orders', value: orderCodes.slice(0, 10).join(', ') + (orderCodes.length > 10 ? `... (+${orderCodes.length - 10} more)` : ''), inline: false }
      ],
      footer: { text: 'Cannè Admin System - Bulk Action' }
    };
    
    if (reason) {
      embed.fields.push({ name: 'Reason', value: reason, inline: false });
    }
    
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'Cannè Bulk Action Bot',
        embeds: [embed]
      })
    });
  } catch (error) {
    console.error('Error sending bulk Discord notification:', error);
  }
}
