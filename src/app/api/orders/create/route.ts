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

    // Create a payment record in the cashapp_payments table
    console.log('📝 Creating Cash App payment with short code:', shortCode);
    
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 15 * 60 * 1000); // 15 minutes from now
    
    const { data: paymentRecord, error } = await supabase
      .from('cashapp_payments')
      .insert({
        short_code: shortCode,
        amount_cents: amount_cents,
        customer_phone: customer_phone || null,
        status: 'awaiting_payment',
        created_at: now.toISOString(),
        expires_at: expiresAt.toISOString()
      })
      .select('short_code')
      .single();

    if (error) {
      console.error('❌ Payment creation failed:', error);
      return NextResponse.json(
        { error: `Failed to create payment record: ${error.message}` },
        { status: 500 }
      );
    }

    console.log('✅ Cash App payment created successfully:', paymentRecord.short_code);
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
