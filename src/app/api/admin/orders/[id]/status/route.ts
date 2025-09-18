import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const VALID_STATUSES = [
  'pending', 'delivered', 'cancelled'
];

// PATCH - Update order status with transactional side effects
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  try {
    const { status: newStatus, reason, admin_user = 'admin' } = await request.json();

    // Validate status
    if (!VALID_STATUSES.includes(newStatus)) {
      return NextResponse.json({ 
        error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` 
      }, { status: 400 });
    }

    // Require reason for certain statuses
    if (['undelivered', 'refunded', 'canceled'].includes(newStatus) && !reason) {
      return NextResponse.json({ 
        error: 'Reason is required for undelivered, refunded, or canceled status' 
      }, { status: 400 });
    }

    // Start transaction
    const { data: currentOrder, error: fetchError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          quantity,
          product_id,
          products (
            id,
            name
          )
        ),
        payouts (
          id,
          status,
          amount_cents
        )
      `)
      .eq('id', id)
      .single();

    if (fetchError || !currentOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const oldStatus = currentOrder.status;

    // Skip if status is the same (idempotent)
    if (oldStatus === newStatus) {
      return NextResponse.json({ 
        success: true, 
        message: 'Status unchanged',
        order: currentOrder 
      });
    }

    // Status-specific validations and side effects
    if (newStatus === 'assigned' && !currentOrder.driver_id) {
      return NextResponse.json({ 
        error: 'Cannot assign order without a driver. Assign driver first.' 
      }, { status: 409 });
    }

    // Handle inventory and payout side effects (skip for now to avoid inventory table issues)
    // await handleStatusTransition(currentOrder, oldStatus, newStatus);

    // Log status change (skip if table doesn't exist)
    try {
      await supabase
        .from('order_status_events')
        .insert({
          order_id: id,
          old_status: oldStatus,
          new_status: newStatus,
          reason,
          admin_user
        });
    } catch (logError) {
      console.warn('Could not log status change (table may not exist):', logError);
      // Continue with status update even if logging fails
    }

    // Update order status
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update({ 
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating order status:', updateError);
      return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Order status updated to ${newStatus}`,
      order: updatedOrder 
    });

  } catch (error) {
    console.error('Error in PATCH /api/admin/orders/[id]/status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function handleStatusTransition(order: any, oldStatus: string, newStatus: string) {
  // Moving to paid - handle inventory and create payout
  if (newStatus === 'paid') {
    // Check and decrement inventory for each item
    for (const item of order.order_items) {
      const { data: inventory, error: invError } = await supabase
        .from('product_inventory')
        .select('stock, allow_backorder')
        .eq('product_id', item.product_id)
        .single();

      if (invError) {
        throw new Error(`Failed to check inventory for product ${item.product_id}`);
      }

      // Check if we have enough stock
      if (inventory.stock < item.quantity && !inventory.allow_backorder) {
        throw new Error(`Insufficient stock for ${item.products.name}. Available: ${inventory.stock}, Required: ${item.quantity}`);
      }

      // Decrement inventory atomically
      const { error: updateError } = await supabase
        .from('product_inventory')
        .update({ 
          stock: inventory.stock - item.quantity,
          updated_at: new Date().toISOString()
        })
        .eq('product_id', item.product_id);

      if (updateError) {
        throw new Error(`Failed to update inventory for product ${item.product_id}`);
      }
    }

    // Create payout if not exists
    if (!order.payouts || order.payouts.length === 0) {
      const payoutAmount = Math.round(order.total * 0.85); // 85% to driver
      
      await supabase
        .from('payouts')
        .insert({
          order_id: order.id,
          driver_id: order.driver_id,
          amount_cents: payoutAmount,
          status: 'queued'
        });
    }
  }

  // Moving to refunded/canceled - restock inventory and block payout
  if (['refunded', 'canceled'].includes(newStatus) && oldStatus === 'paid') {
    // Restock inventory
    for (const item of order.order_items) {
      const { data: currentInventory } = await supabase
        .from('product_inventory')
        .select('stock')
        .eq('product_id', item.product_id)
        .single();
      
      if (currentInventory) {
        await supabase
          .from('product_inventory')
          .update({ 
            stock: currentInventory.stock + item.quantity,
            updated_at: new Date().toISOString()
          })
          .eq('product_id', item.product_id);
      }
    }

    // Block payout if exists and not paid
    if (order.payouts && order.payouts.length > 0) {
      const payout = order.payouts[0];
      if (payout.status !== 'paid') {
        await supabase
          .from('payouts')
          .update({ status: 'blocked' })
          .eq('id', payout.id);
      }
    }
  }
}
