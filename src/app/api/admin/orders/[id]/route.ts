import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Get single order with full relations
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  
  try {
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        status,
        total,
        subtotal,
        delivery_fee,
        created_at,
        updated_at,
        full_name,
        phone,
        delivery_address_line1,
        delivery_city,
        delivery_state,
        delivery_zip,
        driver_id,
        order_items (
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
        ),
        payouts (
          id,
          status,
          amount_cents,
          created_at
        ),
        order_status_events (
          id,
          old_status,
          new_status,
          reason,
          admin_user,
          created_at
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching order:', error);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

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
        name: order.full_name || '',
        phone: order.phone || '',
        email: ''
      },
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
