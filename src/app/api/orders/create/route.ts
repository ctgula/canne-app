import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { amount_cents, customer_phone } = await request.json();

    if (!amount_cents || amount_cents <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    // Generate a short code for the payment
    const shortCode = `PAY-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    // Create a payment record in the database
    const { data: paymentRecord, error } = await supabase
      .from('cashapp_payments')
      .insert({
        short_code: shortCode,
        amount_cents: amount_cents,
        customer_phone: customer_phone || null,
        status: 'awaiting_payment',
        expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 minutes from now
      })
      .select('short_code')
      .single();

    if (error) {
      console.error('Error creating payment record:', error);
      return NextResponse.json(
        { error: 'Failed to create payment record' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      short_code: paymentRecord.short_code
    });

  } catch (error) {
    console.error('Error in payment creation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
