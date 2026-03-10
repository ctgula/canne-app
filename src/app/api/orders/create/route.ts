import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    const { amount_cents, customer_phone, order_id } = await request.json();

    if (!amount_cents || amount_cents <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    // Generate UNIQUE short code: phone last 4 + global sequential counter
    const phoneLast4 = customer_phone ? customer_phone.slice(-4) : '0000';
    
    const { count: globalCount } = await supabase
      .from('cashapp_payments')
      .select('*', { count: 'exact', head: true });
    
    const orderNumber = ((globalCount || 0) + 1).toString(36).toUpperCase().padStart(4, '0');
    const shortCode = `${phoneLast4}-${orderNumber}`;
    
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 15 * 60 * 1000); // 15 minutes
    
    const { data: paymentRecord, error } = await supabase
      .from('cashapp_payments')
      .insert({
        short_code: shortCode,
        amount_cents: amount_cents,
        customer_phone: customer_phone || null,
        order_id: order_id || null,
        status: 'awaiting_payment',
        created_at: now.toISOString(),
        expires_at: expiresAt.toISOString()
      })
      .select('short_code, order_id')
      .single();

    if (error) {
      console.error('Payment creation failed:', error);
      return NextResponse.json(
        { error: 'Failed to create payment record. Please try again.' },
        { status: 500 }
      );
    }

    // Also update the orders table with the short_code for cross-referencing
    if (order_id) {
      await supabase
        .from('orders')
        .update({ short_code: shortCode, status: 'awaiting_payment', payment_method: 'cashapp' })
        .eq('id', order_id);
    }

    return NextResponse.json({
      short_code: paymentRecord.short_code,
      order_id: paymentRecord.order_id
    });

  } catch (error) {
    console.error('Error in payment creation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
