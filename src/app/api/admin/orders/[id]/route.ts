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
    // Try regular orders table first
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    // If not found, try cashapp_payments table
    if (orderError) {
      const { data: cashAppOrder, error: cashAppError } = await supabase
        .from('cashapp_payments')
        .select('*')
        .eq('id', id)
        .single();

      if (cashAppError || !cashAppOrder) {
        console.error('Order not found in either table:', { orderError, cashAppError });
        return NextResponse.json({ 
          error: 'Order not found', 
          details: `Tried orders table: ${orderError?.message}, cashapp_payments: ${cashAppError?.message}` 
        }, { status: 404 });
      }

      // Return simplified Cash App order
      return NextResponse.json({
        order: {
          id: cashAppOrder.id,
          order_number: cashAppOrder.short_code,
          status: cashAppOrder.status,
          total: cashAppOrder.amount_cents / 100,
          subtotal: cashAppOrder.amount_cents / 100,
          delivery_fee: 0,
          created_at: cashAppOrder.created_at,
          customers: {
            name: 'Cash App Customer',
            phone: cashAppOrder.customer_phone || '',
            email: ''
          },
          delivery_address_line1: 'N/A',
          delivery_city: '',
          delivery_state: '',
          delivery_zip: '',
          order_items: [{
            id: cashAppOrder.id,
            quantity: 1,
            unit_price: cashAppOrder.amount_cents / 100,
            strain: 'N/A',
            products: {
              name: 'Cash App Order'
            }
          }],
          order_status_events: [],
          payouts: [],
          driver: null,
          isCashApp: true
        }
      });
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

    // Try regular orders first
    const { data: currentOrder } = await supabase
      .from('orders')
      .select('status')
      .eq('id', id)
      .single();

    if (currentOrder) {
      // Update regular order
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
      await supabase
        .from('order_status_events')
        .insert({
          order_id: id,
          old_status: currentOrder.status,
          new_status: status,
          admin_user: 'admin',
          reason: 'Manual status change'
        });

      return NextResponse.json({ 
        success: true,
        order 
      });
    }

    // Try Cash App order
    const { data: cashAppOrder } = await supabase
      .from('cashapp_payments')
      .select('status')
      .eq('id', id)
      .single();

    if (cashAppOrder) {
      // Update Cash App order
      const { data: updatedCashApp, error } = await supabase
        .from('cashapp_payments')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating cash app order:', error);
        return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
      }

      return NextResponse.json({ 
        success: true,
        order: updatedCashApp 
      });
    }

    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  } catch (error) {
    console.error('Error in PATCH /api/admin/orders/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
