import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Cash App payment creation started');
    const { amount_cents, customer_phone } = await request.json();
    console.log('📦 Request data:', { amount_cents, customer_phone });

    if (!amount_cents || amount_cents <= 0) {
      console.error('❌ Invalid amount:', amount_cents);
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    // Generate a short code for the payment
    const shortCode = `PAY-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    // Step 1: Create a temporary customer first (required for orders table)
    const customerEmail = `cashapp_${Date.now()}@temp.com`;
    console.log('👤 Creating customer with email:', customerEmail);
    
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .insert({
        email: customerEmail,
        first_name: 'Cash',
        last_name: 'App Customer',
        phone: customer_phone || '',
        address: 'TBD',
        city: 'Washington',
        zip_code: '20001'
      })
      .select()
      .single();

    if (customerError) {
      console.error('❌ Customer creation failed:', customerError);
      return NextResponse.json(
        { error: `Failed to create customer: ${customerError.message}` },
        { status: 500 }
      );
    }

    console.log('✅ Customer created:', customer.id);

    // Step 2: Create a payment record in the orders table
    console.log('📝 Creating payment order with short code:', shortCode);
    const { data: paymentRecord, error } = await supabase
      .from('orders')
      .insert({
        customer_id: customer.id, // Required field
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
      console.error('❌ Order creation failed:', error);
      // Clean up the customer if order creation fails
      await supabase.from('customers').delete().eq('id', customer.id);
      return NextResponse.json(
        { error: `Failed to create payment record: ${error.message}` },
        { status: 500 }
      );
    }

    console.log('✅ Payment order created successfully:', paymentRecord.order_number);
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
