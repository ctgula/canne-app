import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';
import { notifyOrderStatusChange } from '@/lib/notifications';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Handle business logic side effects
async function handleSideEffects(supabase: any, orderData: any, currentStatus: string, newStatus: string, reason?: string) {
  try {
    // Payout management
    if (currentStatus === 'paid' && newStatus === 'assigned') {
      // Create payout row if not exists
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
            amount_cents: 800, // $8 base payout
            status: 'queued',
            created_at: new Date().toISOString()
          });
      }
    }
    
    // Handle delivered to refunded - block payout
    if (currentStatus === 'delivered' && newStatus === 'refunded') {
      await supabase
        .from('payouts')
        .update({ status: 'blocked' })
        .eq('order_id', orderData.id)
        .eq('status', 'queued');
    }
    
    // Handle reverting payouts for canceled/refunded orders
    if (['paid', 'assigned'].includes(currentStatus) && ['refunded', 'canceled'].includes(newStatus)) {
      await supabase
        .from('payouts')
        .update({ status: 'blocked' })
        .eq('order_id', orderData.id)
        .eq('status', 'queued');
    }
    
    // Discord notifications for admin actions
    if (['delivered', 'refunded', 'canceled', 'undelivered'].includes(newStatus)) {
      await sendDiscordNotification(orderData, currentStatus, newStatus, reason);
    }
    
  } catch (error) {
    console.error('Error handling side effects:', error);
    // Don't fail the main operation for side effect errors
  }
}

// Log audit trail for status changes
async function logAuditTrail(supabase: any, orderId: string, fromStatus: string, toStatus: string, reason?: string, adminAction?: boolean) {
  try {
    await supabase
      .from('order_status_events')
      .insert({
        order_id: orderId,
        old_status: fromStatus,
        new_status: toStatus,
        note: reason || null,
        changed_by: adminAction ? 'admin' : 'system'
      });
  } catch (error) {
    console.error('Error logging audit trail:', error);
    // Don't fail the main operation for audit logging errors
  }
}

// Send Discord notification for important status changes
async function sendDiscordNotification(orderData: any, fromStatus: string, toStatus: string, reason?: string) {
  try {
    const webhookUrl = process.env.DISCORD_WEBHOOK;
    if (!webhookUrl) return;
    
    const statusEmojis: Record<string, string> = {
      delivered: '✅',
      undelivered: '❌',
      refunded: '💰',
      canceled: '🚫'
    };
    
    const embed = {
      title: `${statusEmojis[toStatus] || '📋'} Order Status Changed`,
      color: toStatus === 'delivered' ? 0x00ff00 : toStatus === 'refunded' ? 0xff9900 : 0xff0000,
      fields: [
        { name: 'Order', value: orderData.short_code, inline: true },
        { name: 'From', value: fromStatus.replace('_', ' ').toUpperCase(), inline: true },
        { name: 'To', value: toStatus.replace('_', ' ').toUpperCase(), inline: true },
        { name: 'Amount', value: `$${(orderData.amount_cents / 100).toFixed(2)}`, inline: true },
        { name: 'Customer', value: orderData.customer_phone || 'N/A', inline: true },
        { name: 'Time', value: new Date().toLocaleString(), inline: true }
      ],
      footer: { text: 'Cannè Admin System' }
    };
    
    if (reason) {
      embed.fields.push({ name: 'Reason', value: reason, inline: false });
    }
    
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'Cannè Status Bot',
        embeds: [embed]
      })
    });
  } catch (error) {
    console.error('Error sending Discord notification:', error);
  }
}

// Valid status transitions
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

export async function POST(request: Request) {
  try {
    const { short_code, new_status, reason, admin_action } = await request.json();
    
    if (!short_code || !new_status) {
      return NextResponse.json({ error: 'Short code and new status are required' }, { status: 400 });
    }

    // Validate required reason for destructive actions
    const requiresReason = ['undelivered', 'refunded', 'canceled'].includes(new_status);
    if (requiresReason && !reason?.trim()) {
      return NextResponse.json({ 
        error: `Reason is required for status: ${new_status}` 
      }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get current order details
    const { data: orderData, error: fetchError } = await supabase
      .from('cashapp_payments')
      .select('*')
      .eq('short_code', short_code)
      .single();

    if (fetchError || !orderData) {
      console.error('Error fetching order:', fetchError);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const currentStatus = orderData.status;

    // Check if transition is valid
    if (!validTransitions[currentStatus]?.includes(new_status)) {
      return NextResponse.json({ 
        error: `Invalid status transition from ${currentStatus} to ${new_status}` 
      }, { status: 400 });
    }

    // Handle inventory decrement when order becomes paid (use RPC directly, not admin route)
    if (currentStatus !== 'paid' && new_status === 'paid' && orderData.order_id) {
      try {
        const { data: items } = await supabase
          .from('order_items')
          .select('product_id, quantity')
          .eq('order_id', orderData.order_id);

        if (items && items.length > 0) {
          for (const item of items) {
            await supabase.rpc('decrement_stock', {
              p_product_id: item.product_id,
              p_quantity: item.quantity,
            });
          }
        }
      } catch (inventoryError) {
        console.error('Error decrementing inventory:', inventoryError);
        // Log but don't block — admin can reconcile manually
      }
    }

    // Handle side effects before status update
    await handleSideEffects(supabase, orderData, currentStatus, new_status, reason);

    // Update the cashapp_payments status
    const { error: updateError } = await supabase
      .from('cashapp_payments')
      .update({ 
        status: new_status,
        updated_at: new Date().toISOString()
      })
      .eq('short_code', short_code);

    if (updateError) {
      console.error('Error updating order status:', updateError);
      return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
    }

    // Sync status to linked orders table so tracking page stays current
    if (orderData.order_id) {
      const orderStatusMap: Record<string, string> = {
        'awaiting_payment': 'awaiting_payment',
        'verifying': 'verifying',
        'paid': 'paid',
        'assigned': 'assigned',
        'delivered': 'delivered',
        'undelivered': 'undelivered',
        'refunded': 'refunded',
        'canceled': 'canceled',
      };
      const mappedStatus = orderStatusMap[new_status] || new_status;
      await supabase
        .from('orders')
        .update({ status: mappedStatus, updated_at: new Date().toISOString() })
        .eq('id', orderData.order_id);
    }

    // Log audit trail
    await logAuditTrail(supabase, orderData.id, currentStatus, new_status, reason, admin_action);

    // Handle special status changes
    try {
      switch (new_status) {
        case 'paid':
          await notifyOrderStatusChange.paid(
            {
              phone: orderData.customer_phone,
              email: orderData.customer_email,
              name: orderData.customer_name
            },
            {
              shortCode: orderData.short_code,
              amount: orderData.amount_cents,
              address: orderData.delivery_address
            }
          );
          break;
        
        case 'delivered':
          await notifyOrderStatusChange.delivered(
            {
              phone: orderData.customer_phone,
              email: orderData.customer_email,
              name: orderData.customer_name
            },
            {
              shortCode: orderData.short_code,
              amount: orderData.amount_cents,
              address: orderData.delivery_address
            }
          );
          break;
        
        case 'assigned':
          // If changing back to assigned, we might need driver info
          if (orderData.driver_id) {
            const { data: driverData } = await supabase
              .from('drivers')
              .select('*')
              .eq('id', orderData.driver_id)
              .single();
            
            if (driverData) {
              await notifyOrderStatusChange.assigned(
                {
                  phone: orderData.customer_phone,
                  email: orderData.customer_email,
                  name: orderData.customer_name
                },
                {
                  name: driverData.name,
                  phone: driverData.phone,
                  email: driverData.email
                },
                {
                  shortCode: orderData.short_code,
                  address: orderData.delivery_address,
                  eta: "30-45 minutes"
                }
              );
            }
          }
          break;
        
        case 'refunded':
          // Handle refund notifications if needed
          break;
      }
    } catch (notificationError) {
      console.error('Failed to send status change notification:', notificationError);
      // Don't fail the request if notification fails
    }

    return NextResponse.json({ 
      success: true, 
      message: `Order status changed from ${currentStatus} to ${new_status}`,
      previous_status: currentStatus,
      new_status: new_status
    });
  } catch (error) {
    console.error('Error in change-status route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
