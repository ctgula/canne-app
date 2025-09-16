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

    // Create a payment record in the orders table instead
    const { data: paymentRecord, error } = await supabase
      .from('orders')
      .insert({
        order_number: shortCode,
        status: 'awaiting_payment',
        total: amount_cents / 100, // Convert cents to dollars
        subtotal: amount_cents / 100,
        delivery_fee: 0,
        full_name: 'Cash App Customer',
        phone: customer_phone || '',
        delivery_address_line1: 'TBD',
        delivery_city: 'Washington',
        delivery_state: 'DC',
        delivery_zip: '20001'
      })
      .select('order_number')
      .single();

    if (error) {
      console.error('Error creating payment record:', error);
      return NextResponse.json(
        { error: 'Failed to create payment record' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      short_code: paymentRecord.order_number
    });

  } catch (error) {
    console.error('Error in payment creation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
