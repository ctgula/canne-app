import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { short_code, cashapp_handle, screenshot_url } = await req.json();

    // Fetch payment record
    const { data: paymentData, error: paymentError } = await supabase
      .from("cashapp_payments")
      .select("*")
      .eq("short_code", short_code)
      .single();

    if (paymentError || !paymentData) {
      console.error('❌ Error fetching payment:', paymentError);
      return NextResponse.json({ error: 'Payment record not found' }, { status: 404 });
    }

    console.log('✅ Payment record found:', { 
      short_code: paymentData.short_code, 
      amount: paymentData.amount_cents,
      status: paymentData.status,
      has_order: !!paymentData.order_id
    });

    // Get order details if order_id exists (optional - payment may not have order yet)
    let orderDetails = null;
    if (paymentData.order_id) {
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select("order_number, total, customer_id, customers(first_name, last_name, phone), delivery_address_line1, delivery_city")
        .eq("id", paymentData.order_id)
        .single();

      if (!orderError && orderData) {
        orderDetails = orderData;
        console.log('✅ Linked order found:', orderData.order_number);
      }
    } else {
      console.log('ℹ️ No order linked to payment yet (payment-first flow)');
    }

    // Update payment status
    const { error } = await supabase
      .from("cashapp_payments")
      .update({
        status: "verifying",
        cashtag: cashapp_handle,
        payment_note: screenshot_url
      })
      .eq("short_code", short_code);

    if (error) {
      console.error('Error updating Cash App order:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    // Send Discord notification
    try {
      const webhookUrl = process.env.DISCORD_WEBHOOK;
      
      if (webhookUrl) {
        const amount = paymentData.amount_cents / 100;
        
        // Build customer name from order details if available
        let customerName = 'Not yet provided';
        let customerPhone = paymentData.customer_phone || 'Not provided';
        
        if (orderDetails) {
          const customers = orderDetails as any;
          if (customers.customers) {
            customerName = `${customers.customers.first_name || ''} ${customers.customers.last_name || ''}`.trim();
            customerPhone = customers.customers.phone || customerPhone;
          }
        }
        
        const embed = {
          title: "💳 Payment Submitted for Verification",
          description: orderDetails 
            ? `Order **${orderDetails.order_number}** - Customer has submitted payment proof`
            : `New payment submission **${short_code}** - No order linked yet`,
          color: 0xF59E0B, // Orange/amber for pending verification
          fields: [
            {
              name: "💰 Amount",
              value: `$${amount.toFixed(2)}`,
              inline: true
            },
            {
              name: "🔑 Short Code",
              value: `\`${short_code}\``,
              inline: true
            },
            {
              name: "📊 Status",
              value: "🔍 **VERIFYING**",
              inline: true
            },
            {
              name: "👤 Customer",
              value: customerName,
              inline: true
            },
            {
              name: "📱 Phone",
              value: customerPhone,
              inline: true
            },
            {
              name: "📦 Order",
              value: orderDetails ? `✅ Linked` : '⏳ Not created yet',
              inline: true
            }
          ],
          footer: {
            text: "Cannè Payment System • Verify payment in Cash App and mark as paid in admin panel"
          },
          timestamp: new Date().toISOString()
        };

        // Add Cash App handle if provided
        if (cashapp_handle) {
          embed.fields.push({
            name: "💵 Cash App",
            value: cashapp_handle,
            inline: true
          });
        }

        // Add screenshot link if provided
        if (screenshot_url) {
          embed.fields.push({
            name: "📸 Proof",
            value: `[View Screenshot](${screenshot_url})`,
            inline: true
          });
        }

        // Add delivery address if order exists
        if (orderDetails?.delivery_address_line1) {
          embed.fields.push({
            name: "📍 Delivery",
            value: `${orderDetails.delivery_address_line1}, ${orderDetails.delivery_city || 'DC'}`,
            inline: false
          });
        }

        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: `@everyone New payment requires verification!`,
            embeds: [embed]
          })
        });

        if (response.ok) {
          console.log('✅ Discord notification sent successfully');
        } else {
          const errorText = await response.text();
          console.error('❌ Discord webhook failed:', response.status, errorText);
        }
      } else {
        console.warn('⚠️ DISCORD_WEBHOOK not configured - notification skipped');
      }
    } catch (discordError) {
      console.error('❌ Discord notification error:', discordError);
      // Don't fail the payment submission if Discord fails
    }
    
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error in Cash App payment submission:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
