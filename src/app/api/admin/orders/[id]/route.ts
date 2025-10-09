import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Get single order with full relations
export async function GET(
  _request: Request,
  { params }: any
) {
  const { id } = params;
  
  try {
    // First get the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (orderError || !order) {
      console.error('Error fetching order:', orderError);
      return NextResponse.json({ error: 'Order not found', details: orderError?.message }, { status: 404 });
    }

    // Get customer if exists
    let customer = null;
    if (order.customer_id) {
      const { data: customerData } = await supabase
        .from('customers')
        .select('first_name, last_name, phone, email')
        .eq('id', order.customer_id)
        .single();
      customer = customerData;
    }

    // Get order items with products
    const { data: orderItems } = await supabase
      .from('order_items')
      .select(`
        id,
        quantity,
        unit_price,
        strain,
        thc_low,
        thc_high,
        products (
          id,
          name,
          price
        )
      `)
      .eq('order_id', id);

    // Get order status events
    const { data: statusEvents } = await supabase
      .from('order_status_events')
      .select('*')
      .eq('order_id', id)
      .order('created_at', { ascending: false });

    // Get payouts
    const { data: payouts } = await supabase
      .from('payouts')
      .select('*')
      .eq('order_id', id);

    // Get driver info if assigned
    let driver = null;
    if (order.driver_id) {
      const { data: driverData } = await supabase
        .from('drivers')
        .select('id, full_name, phone, email')
        .eq('id', order.driver_id)
        .single();
      driver = driverData;
    }

    // Transform data to match frontend expectations
    const transformedOrder = {
      ...order,
      customers: {
        name: customer 
          ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim()
          : order.full_name || 'Guest',
        phone: customer?.phone || order.phone || '',
        email: customer?.email || ''
      },
      order_items: orderItems || [],
      order_status_events: statusEvents || [],
      payouts: payouts || [],
      driver
    };

    return NextResponse.json({ 
      order: transformedOrder
    });
  } catch (error) {
    console.error('Error in GET /api/admin/orders/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Update order status
export async function PATCH(
  request: Request,
  { params }: any
) {
  const { id } = params;
  
  try {
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    // Get current order to track old status
    const { data: currentOrder } = await supabase
      .from('orders')
      .select('status')
      .eq('id', id)
      .single();

    // Update order status
    const { data: order, error } = await supabase
      .from('orders')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating order:', error);
      return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
    }

    // Log status change event
    if (currentOrder) {
      await supabase
        .from('order_status_events')
        .insert({
          order_id: id,
          old_status: currentOrder.status,
          new_status: status,
          admin_user: 'admin',
          reason: 'Manual status change'
        });
    }

    return NextResponse.json({ 
      success: true,
      order 
    });
  } catch (error) {
    console.error('Error in PATCH /api/admin/orders/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
