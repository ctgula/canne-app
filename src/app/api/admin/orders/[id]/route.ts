import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Get single order with full relations
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  try {
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        customers (
          name,
          phone,
          email
        ),
        order_items (
          id,
          quantity,
          price_cents,
          strain,
          thc_low,
          thc_high,
          products (
            id,
            name,
            description,
            tier
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
        .select('id, name, phone, email')
        .eq('id', order.driver_id)
        .single();
      driver = driverData;
    }

    return NextResponse.json({ 
      order: {
        ...order,
        driver
      }
    });
  } catch (error) {
    console.error('Error in GET /api/admin/orders/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
