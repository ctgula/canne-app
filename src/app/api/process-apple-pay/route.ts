import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase admin client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

interface ApplePaymentData {
  token: {
    paymentData: any;
    paymentMethod: {
      displayName: string;
      network: string;
      type: string;
    };
    transactionIdentifier: string;
  };
  billingContact: {
    addressLines: string[];
    administrativeArea: string;
    country: string;
    countryCode: string;
    familyName: string;
    givenName: string;
    locality: string;
    postalCode: string;
    emailAddress?: string;
    phoneNumber?: string;
  };
  shippingContact: {
    addressLines: string[];
    administrativeArea: string;
    country: string;
    countryCode: string;
    familyName: string;
    givenName: string;
    locality: string;
    postalCode: string;
    emailAddress?: string;
    phoneNumber?: string;
  };
  total: number;
}

export async function POST(request: NextRequest) {
  try {
    console.log('🍎 Apple Pay payment processing started');
    
    const paymentData: ApplePaymentData = await request.json();
    console.log('📱 Apple Pay data received:', JSON.stringify({
      transactionId: paymentData.token.transactionIdentifier,
      paymentMethod: paymentData.token.paymentMethod,
      total: paymentData.total,
      billingContact: paymentData.billingContact,
      shippingContact: paymentData.shippingContact
    }, null, 2));

    // Validate DC ZIP code
    const zipCode = paymentData.shippingContact.postalCode;
    if (!zipCode || !/^20[0-1]\d{2}$/.test(zipCode)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Only Washington DC ZIP codes (20000-20199) are allowed' 
      }, { status: 400 });
    }

    // Generate order number
    const orderNumber = `CN-AP-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    console.log('🔢 Generated Apple Pay order number:', orderNumber);

    // Create customer from Apple Pay contact info
    const customerEmail = paymentData.billingContact.emailAddress || 
                         paymentData.shippingContact.emailAddress || 
                         `applepay_${Date.now()}@temp.com`;
    
    const customerPayload = {
      first_name: paymentData.shippingContact.givenName || 'Apple',
      last_name: paymentData.shippingContact.familyName || 'Pay Customer',
      email: customerEmail,
      phone: paymentData.shippingContact.phoneNumber || paymentData.billingContact.phoneNumber || ''
    };

    console.log('👤 Creating customer:', customerPayload);

    const { data: customerRecord, error: customerError } = await supabaseAdmin
      .from('customers')
      .insert(customerPayload)
      .select('id')
      .single();

    if (customerError) {
      console.error('❌ Customer creation failed:', customerError);
      return NextResponse.json({ 
        success: false, 
        error: `Failed to create customer: ${customerError.message}` 
      }, { status: 500 });
    }

    console.log('✅ Customer created:', customerRecord.id);

    // Calculate totals (assuming delivery fee is included in total)
    const deliveryFee = 10;
    const subtotal = paymentData.total - deliveryFee;

    // Create order
    const orderPayload = {
      customer_id: customerRecord.id,
      order_number: orderNumber,
      status: 'paid', // Apple Pay orders are immediately paid
      subtotal: subtotal,
      delivery_fee: deliveryFee,
      total: paymentData.total,
      delivery_address_line1: paymentData.shippingContact.addressLines[0] || '',
      delivery_address_line2: paymentData.shippingContact.addressLines[1] || null,
      delivery_city: paymentData.shippingContact.locality || 'Washington',
      delivery_state: 'DC',
      delivery_zip: paymentData.shippingContact.postalCode,
      delivery_instructions: null,
      full_name: `${paymentData.shippingContact.givenName} ${paymentData.shippingContact.familyName}`,
      phone: paymentData.shippingContact.phoneNumber || paymentData.billingContact.phoneNumber || '',
      preferred_time: 'ASAP (60-90 min)',
      payment_method: 'apple_pay',
      payment_status: 'completed',
      apple_pay_transaction_id: paymentData.token.transactionIdentifier,
      apple_pay_payment_method: paymentData.token.paymentMethod.displayName
    };

    console.log('📝 Creating Apple Pay order:', orderPayload);

    const { data: orderRecord, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert(orderPayload)
      .select()
      .single();

    if (orderError) {
      console.error('❌ Order creation failed:', orderError);
      return NextResponse.json({ 
        success: false, 
        error: `Failed to create order: ${orderError.message}` 
      }, { status: 500 });
    }

    console.log('✅ Apple Pay order created:', orderRecord.id);

    // Send Discord notification for Apple Pay order
    const discordWebhook = process.env.DISCORD_WEBHOOK;
    if (discordWebhook) {
      try {
        const customerName = `${paymentData.shippingContact.givenName} ${paymentData.shippingContact.familyName}`;
        const customerPhone = paymentData.shippingContact.phoneNumber || paymentData.billingContact.phoneNumber || 'Not provided';
        
        const embed = {
          title: "🍎 New Apple Pay Order Received!",
          color: 0x007AFF, // Apple blue
          timestamp: new Date().toISOString(),
          fields: [
            { 
              name: "📱 Order Details", 
              value: `**Order #:** ${orderNumber}\n**Total:** $${paymentData.total.toFixed(2)}\n**Payment:** Apple Pay (${paymentData.token.paymentMethod.displayName})`,
              inline: false 
            },
            { 
              name: "👤 Customer Information", 
              value: `**Name:** ${customerName}\n**Phone:** ${customerPhone}\n**Email:** ${customerEmail}`,
              inline: false 
            },
            { 
              name: "📍 Delivery Address", 
              value: `${paymentData.shippingContact.addressLines.join(', ')}\n${paymentData.shippingContact.locality}, ${paymentData.shippingContact.administrativeArea} ${paymentData.shippingContact.postalCode}`,
              inline: false 
            },
            { 
              name: "💳 Payment Info", 
              value: `**Method:** Apple Pay\n**Network:** ${paymentData.token.paymentMethod.network}\n**Transaction ID:** ${paymentData.token.transactionIdentifier.substring(0, 20)}...`,
              inline: false 
            }
          ],
          footer: {
            text: "Cannè Art Collection • Apple Pay Integration",
            icon_url: "https://cdn-icons-png.flaticon.com/512/179/179309.png"
          }
        };

        await fetch(discordWebhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ embeds: [embed] })
        });

        console.log('✅ Discord notification sent for Apple Pay order');
      } catch (discordError) {
        console.error('❌ Discord notification failed:', discordError);
      }
    }

    // Success response
    return NextResponse.json({
      success: true,
      orderId: orderRecord.id,
      orderNumber: orderNumber,
      transactionId: paymentData.token.transactionIdentifier,
      message: 'Apple Pay payment processed successfully'
    });

  } catch (error) {
    console.error('❌ Apple Pay processing error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Apple Pay processing failed. Please try again.' 
    }, { status: 500 });
  }
}
