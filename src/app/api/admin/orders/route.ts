import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Get all orders with basic info for admin dashboard
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    let query = supabase
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
        order_items (
          quantity,
          products (
            name,
            price_cents
          )
        )
      `)
      .order('created_at', { ascending: false });

    // Filter by status if provided
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    // Search functionality
    if (search) {
      query = query.or(`order_number.ilike.%${search}%,full_name.ilike.%${search}%,phone.ilike.%${search}%`);
    }

    const { data: orders, error } = await query;

    if (error) {
      console.error('Error fetching orders:', error);
      return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }

    // Transform data to match frontend expectations
    const transformedOrders = (orders || []).map(order => {
      const nameParts = (order.full_name || '').split(' ');
      return {
        ...order,
        customers: {
          first_name: nameParts[0] || '',
          last_name: nameParts.slice(1).join(' ') || '',
          phone: order.phone || '',
          email: '' // Email not stored in orders table
        }
      };
    });

    return NextResponse.json({ orders: transformedOrders });
  } catch (error) {
    console.error('Error in GET /api/admin/orders:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
