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

    // Fetch order details before updating
    const { data: orderData, error: fetchError } = await supabase
      .from("cashapp_payments")
      .select(`
        *,
        orders (
          order_number,
          total,
          customer_name,
          customer_phone,
          delivery_address_line1,
          delivery_city
        )
      `)
      .eq("short_code", short_code)
      .single();

    if (fetchError) {
      console.error('Error fetching order:', fetchError);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
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
        const order = Array.isArray(orderData.orders) ? orderData.orders[0] : orderData.orders;
        const amount = orderData.amount_cents / 100;
        
        const embed = {
          title: "💳 Payment Submitted for Verification",
          color: 0xF59E0B, // Orange/amber for pending verification
          fields: [
            {
              name: "Order Number",
              value: order?.order_number || short_code,
              inline: true
            },
            {
              name: "Amount",
              value: `$${amount.toFixed(2)}`,
              inline: true
            },
            {
              name: "Short Code",
              value: short_code,
              inline: true
            },
            {
              name: "Customer",
              value: order?.customer_name || 'N/A',
              inline: true
            },
            {
              name: "Phone",
              value: order?.customer_phone || 'N/A',
              inline: true
            },
            {
              name: "Status",
              value: "🔍 VERIFYING",
              inline: true
            }
          ],
          footer: {
            text: "Cannè Payment System • Verify payment in Cash App and update status"
          },
          timestamp: new Date().toISOString()
        };

        // Add optional fields if provided
        if (cashapp_handle) {
          embed.fields.push({
            name: "Cash App Handle",
            value: cashapp_handle,
            inline: true
          });
        }

        if (screenshot_url) {
          embed.fields.push({
            name: "Screenshot",
            value: `[View Screenshot](${screenshot_url})`,
            inline: true
          });
        }

        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            embeds: [embed]
          })
        });

        if (response.ok) {
          console.log('✅ Discord notification sent for payment submission');
        } else {
          console.error('❌ Discord notification failed:', await response.text());
        }
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
