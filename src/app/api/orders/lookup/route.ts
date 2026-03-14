import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();

    if (!phone || typeof phone !== 'string') {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10) {
      return NextResponse.json({ error: 'Enter a valid 10-digit phone number' }, { status: 400 });
    }

    const last10 = digits.slice(-10);
    const searchVariants = [last10, `1${last10}`, `+1${last10}`];

    // Search orders table
    const { data: orders } = await supabaseAdmin
      .from('orders')
      .select('id, order_number, status, total, created_at')
      .in('phone', searchVariants)
      .order('created_at', { ascending: false })
      .limit(10);

    // Search cashapp_payments table
    const { data: cashappOrders } = await supabaseAdmin
      .from('cashapp_payments')
      .select('id, short_code, status, amount_cents, created_at, order_id')
      .in('customer_phone', searchVariants)
      .order('created_at', { ascending: false })
      .limit(10);

    const results = [
      ...(orders || []).map(o => ({
        id: o.id,
        order_number: o.order_number,
        status: o.status,
        total: o.total,
        created_at: o.created_at,
        type: 'order',
      })),
      ...(cashappOrders || [])
        .filter(p => !p.order_id)
        .map(p => ({
          id: p.id,
          order_number: p.short_code,
          status: p.status,
          total: p.amount_cents / 100,
          created_at: p.created_at,
          type: 'cashapp',
          short_code: p.short_code,
        })),
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return NextResponse.json({ orders: results });
  } catch (err) {
    console.error('Order lookup error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
