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
        customer_id,
        customers (
          first_name,
          last_name,
          phone,
          email
        ),
        order_items (
          quantity,
          products (
            name,
            price_cents
          )
        )
      `)
      .order('created_at', { ascending: false });

    // Filter by status if provided (supports logical groups)
    if (status && status !== 'all') {
      const group = status.toLowerCase();
      if (group === 'pending') {
        query = query.in('status', ['awaiting_payment', 'verifying', 'paid']);
      } else if (group === 'assigned') {
        query = query.in('status', ['assigned']);
      } else if (group === 'delivered') {
        query = query.in('status', ['delivered']);
      } else if (group === 'issue') {
        query = query.in('status', ['undelivered', 'refunded', 'canceled']);
      } else if (group === 'paid') {
        query = query.eq('status', 'paid');
      } else {
        // Fallback: direct match for any other status string
        query = query.eq('status', status);
      }
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
      const c = Array.isArray(order.customers) ? order.customers[0] : order.customers;
      const fullName = order.full_name || `${c?.first_name || ''} ${c?.last_name || ''}`.trim();
      const nameParts = (fullName || '').split(' ');
      return {
        ...order,
        customers: {
          first_name: nameParts[0] || c?.first_name || '',
          last_name: nameParts.slice(1).join(' ') || c?.last_name || '',
          phone: order.phone || c?.phone || '',
          email: c?.email || ''
        }
      };
    });

    return NextResponse.json({ orders: transformedOrders });
  } catch (error) {
    console.error('Error in GET /api/admin/orders:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
