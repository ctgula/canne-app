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

    // Fetch regular orders
    let ordersQuery = supabase
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

    // Fetch Cash App payment orders
    let cashappQuery = supabase
      .from('cashapp_payments')
      .select(`
        id,
        short_code,
        status,
        amount_cents,
        customer_phone,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false });

    // Apply status filter to both queries
    if (status && status !== 'all') {
      const group = status.toLowerCase();
      if (group === 'pending') {
        ordersQuery = ordersQuery.in('status', ['awaiting_payment', 'verifying', 'paid']);
        cashappQuery = cashappQuery.in('status', ['awaiting_payment', 'verifying']);
      } else if (group === 'assigned') {
        ordersQuery = ordersQuery.in('status', ['assigned']);
        cashappQuery = cashappQuery.in('status', ['assigned']);
      } else if (group === 'delivered') {
        ordersQuery = ordersQuery.in('status', ['delivered']);
        cashappQuery = cashappQuery.in('status', ['delivered']);
      } else if (group === 'issue') {
        ordersQuery = ordersQuery.in('status', ['undelivered', 'refunded', 'canceled']);
        cashappQuery = cashappQuery.in('status', ['refunded', 'expired']);
      } else if (group === 'paid') {
        ordersQuery = ordersQuery.eq('status', 'paid');
        cashappQuery = cashappQuery.eq('status', 'paid');
      } else {
        ordersQuery = ordersQuery.eq('status', status);
        cashappQuery = cashappQuery.eq('status', status);
      }
    }

    // Apply search to both queries
    if (search) {
      ordersQuery = ordersQuery.or(`order_number.ilike.%${search}%,full_name.ilike.%${search}%,phone.ilike.%${search}%`);
      cashappQuery = cashappQuery.or(`short_code.ilike.%${search}%,customer_phone.ilike.%${search}%`);
    }

    const [{ data: orders, error: ordersError }, { data: cashappPayments, error: cashappError }] = await Promise.all([
      ordersQuery,
      cashappQuery
    ]);

    if (ordersError) {
      console.error('Error fetching orders:', ordersError);
      return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }

    if (cashappError) {
      console.error('Error fetching Cash App payments:', cashappError);
      // Continue even if Cash App fetch fails
    }

    // Transform regular orders
    const transformedOrders = (orders || []).map(order => {
      const c = Array.isArray(order.customers) ? order.customers[0] : order.customers;
      const fullName = order.full_name || `${c?.first_name || ''} ${c?.last_name || ''}`.trim();
      const nameParts = (fullName || '').split(' ');
      return {
        ...order,
        order_type: 'regular',
        customers: {
          first_name: nameParts[0] || c?.first_name || '',
          last_name: nameParts.slice(1).join(' ') || c?.last_name || '',
          phone: order.phone || c?.phone || '',
          email: c?.email || ''
        }
      };
    });

    // Transform Cash App payments to match order format
    const transformedCashappOrders = (cashappPayments || []).map(payment => ({
      id: payment.id,
      order_number: payment.short_code,
      status: payment.status,
      total: payment.amount_cents / 100,
      subtotal: payment.amount_cents / 100,
      delivery_fee: 0,
      created_at: payment.created_at,
      updated_at: payment.updated_at,
      full_name: 'Cash App Customer',
      phone: payment.customer_phone || '',
      delivery_address_line1: 'Pending',
      delivery_city: 'Washington',
      delivery_state: 'DC',
      delivery_zip: '',
      customer_id: null,
      order_type: 'cashapp',
      customers: {
        first_name: 'Cash',
        last_name: 'App Customer',
        phone: payment.customer_phone || '',
        email: ''
      },
      order_items: []
    }));

    // Combine and sort by created_at
    const allOrders = [...transformedOrders, ...transformedCashappOrders].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return NextResponse.json({ orders: allOrders });
  } catch (error) {
    console.error('Error in GET /api/admin/orders:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
