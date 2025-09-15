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
        short_code,
        status,
        total,
        subtotal,
        delivery_fee,
        created_at,
        updated_at,
        driver_id,
        customers (
          name,
          phone,
          email
        )
      `)
      .order('created_at', { ascending: false });

    // Filter by status if provided
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    // Search functionality
    if (search) {
      query = query.or(`short_code.ilike.%${search}%,customers.name.ilike.%${search}%,customers.phone.ilike.%${search}%`);
    }

    const { data: orders, error } = await query;

    if (error) {
      console.error('Error fetching orders:', error);
      return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }

    return NextResponse.json({ orders: orders || [] });
  } catch (error) {
    console.error('Error in GET /api/admin/orders:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
