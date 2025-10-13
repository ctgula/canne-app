import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { createClient } from '@supabase/supabase-js';
import sg from '@sendgrid/mail';
import Twilio from 'twilio';

// Initialize SendGrid and Twilio
if (process.env.SENDGRID_API_KEY) {
  sg.setApiKey(process.env.SENDGRID_API_KEY);
}

let twilioClient: ReturnType<typeof Twilio> | null = null;
if (process.env.TWILIO_SID && process.env.TWILIO_TOKEN) {
  twilioClient = Twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
}

// Type definitions
interface OrderItem {
  product: {
    id: string;
    name: string;
    price: number;
    tier?: string;
    weight?: string;
    color_theme?: string;
  };
  strain?: {
    name: string;
    type: string;
    thcLow: number;
    thcHigh: number;
  };
  quantity: number;
}

interface DeliveryDetails {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  zipCode: string;
  timePreference: string;
  specialInstructions?: string;
  emailUpdates?: boolean; // Marketing opt-in
}

interface OrderData {
  items: OrderItem[];
  deliveryDetails: DeliveryDetails;
  total: number;
  hasDelivery: boolean;
  status: string;
}

// Simple, reliable Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 New order submission started');
    
    const orderData = await request.json();
    console.log('📦 Order data received:', JSON.stringify(orderData, null, 2));

    // Basic validation
    if (!orderData.items || orderData.items.length === 0) {
      return NextResponse.json({ success: false, error: 'No items in order' }, { status: 400 });
    }

    if (!orderData.deliveryDetails) {
      return NextResponse.json({ success: false, error: 'Missing delivery details' }, { status: 400 });
    }

    // Validate DC ZIP code
    const zipCode = orderData.deliveryDetails.zipCode;
    if (!zipCode || !/^20[0-1]\d{2}$/.test(zipCode)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Only Washington DC ZIP codes (20000-20199) are allowed' 
      }, { status: 400 });
    }

    // Generate order number
    const orderNumber = `CN-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    console.log('🔢 Generated order number:', orderNumber);

    // Create or get customer
    const customerEmail = orderData.deliveryDetails.email || `customer_${Date.now()}@temp.com`;
    const nameParts = orderData.deliveryDetails.name.split(' ');
    
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .upsert({
        email: customerEmail,
        first_name: nameParts[0] || '',
        last_name: nameParts.slice(1).join(' ') || '',
        phone: orderData.deliveryDetails.phone || '',
        address: orderData.deliveryDetails.address || '',
        city: orderData.deliveryDetails.city || 'Washington',
        zip_code: orderData.deliveryDetails.zipCode || ''
      }, {
        onConflict: 'email'
      })
      .select()
      .single();

    if (customerError) {
      console.error('❌ Customer creation failed:', customerError);
      return NextResponse.json({ 
        success: false, 
        error: `Failed to create customer: ${customerError.message}` 
      }, { status: 500 });
    }

    console.log('✅ Customer created/found:', customer.id);

    // Calculate totals
    const subtotal = orderData.items.reduce((sum: number, item: OrderItem) => {
      return sum + (item.product.price * item.quantity);
    }, 0);

    const deliveryFee = orderData.hasDelivery ? 0 : 10;
    const total = subtotal + deliveryFee;

    console.log('💰 Calculated totals:', { subtotal, deliveryFee, total, expectedTotal: orderData.total });

    // Validate total matches (allow small floating point differences)
    if (Math.abs(total - orderData.total) > 0.01) {
      return NextResponse.json({ 
        success: false, 
        error: `Price mismatch. Expected: $${orderData.total}, Calculated: $${total}` 
      }, { status: 400 });
    }

    // Create order
    const orderPayload = {
      customer_id: customer.id,
      order_number: orderNumber,
      status: 'pending',
      subtotal: subtotal,
      delivery_fee: deliveryFee,
      total: total,
      delivery_address_line1: orderData.deliveryDetails.address,
      delivery_address_line2: null,
      delivery_city: orderData.deliveryDetails.city,
      delivery_state: 'DC',
      delivery_zip: orderData.deliveryDetails.zipCode,
      delivery_instructions: orderData.deliveryDetails.specialInstructions || null,
      full_name: orderData.deliveryDetails.name,
      phone: orderData.deliveryDetails.phone,
      preferred_time: orderData.deliveryDetails.timePreference || 'ASAP (60-90 min)'
    };

    console.log('📝 Creating order with payload:', orderPayload);

    const { data: order, error: orderError } = await supabase
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

    console.log('✅ Order created:', order.id);

    // Create order items
    const orderItems = orderData.items.map((item: OrderItem) => ({
      order_id: order.id,
      product_id: item.product.id,
      quantity: item.quantity,
      unit_price: item.product.price,
      total_price: item.product.price * item.quantity,
      name: item.product.name,
      strain: item.strain?.name || 'Moroccan Peach',
      thc_low: item.strain?.thcLow || 18,
      thc_high: item.strain?.thcHigh || 22
    }));

    console.log('📋 Creating order items:', orderItems);

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('❌ Order items creation failed:', itemsError);
      
      // Clean up the order if items failed
      await supabase.from('orders').delete().eq('id', order.id);
      
      return NextResponse.json({ 
        success: false, 
        error: `Failed to create order items: ${itemsError.message}` 
      }, { status: 500 });
    }

    console.log('✅ Order items created successfully');

    // Send Discord notification
    try {
      const webhookUrl = process.env.DISCORD_WEBHOOK;
      console.log('🔍 Discord webhook check:', webhookUrl ? 'CONFIGURED' : 'NOT CONFIGURED');
      
      if (webhookUrl) {
        console.log('📢 Sending Discord notification...');
        
        const itemsDescription = orderData.items.map((item: OrderItem) => 
          `• **${item.product.name}** x${item.quantity} - $${(item.product.price * item.quantity).toFixed(2)}\n` +
          `  ${item.strain?.name || 'Moroccan Peach'} • ${item.strain?.type || 'sativa'} • ${item.strain?.thcLow || 18}-${item.strain?.thcHigh || 22}% THC\n` +
          `  ${item.product.weight || '3.5g'}`
        ).join('\n\n');

        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            embeds: [{
              title: '🎉 New Order Received!',
              description: `Order **${orderNumber}** has been placed`,
              color: 0x8B5CF6, // Purple
              fields: [
                {
                  name: '👤 Customer',
                  value: `${orderData.deliveryDetails.name}\n📱 ${orderData.deliveryDetails.phone}\n📧 ${orderData.deliveryDetails.email}`,
                  inline: false
                },
                {
                  name: '📦 Items',
                  value: itemsDescription,
                  inline: false
                },
                {
                  name: '💰 Order Total',
                  value: `Subtotal: $${subtotal.toFixed(2)}\nDelivery: ${deliveryFee === 0 ? 'FREE' : `$${deliveryFee.toFixed(2)}`}\n**Total: $${total.toFixed(2)}**`,
                  inline: true
                },
                {
                  name: '📍 Delivery Address',
                  value: `${orderData.deliveryDetails.address}\n${orderData.deliveryDetails.city}, DC ${orderData.deliveryDetails.zipCode}`,
                  inline: true
                },
                {
                  name: '⏰ Preferred Time',
                  value: orderData.deliveryDetails.timePreference || 'ASAP (60-90 min)',
                  inline: false
                }
              ],
              footer: {
                text: 'Cannè Order System'
              },
              timestamp: new Date().toISOString()
            }]
          })
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Discord webhook failed:', response.status, errorText);
        } else {
          console.log('✅ Discord notification sent successfully');
        }
      } else {
        console.log('⚠️ Discord webhook URL not configured - set DISCORD_WEBHOOK environment variable');
      }
    } catch (discordError) {
      console.error('❌ Discord notification failed with error:', discordError);
      // Don't fail the order if Discord fails
    }

    // Success response
    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: orderNumber,
      message: 'Order placed successfully'
    });

  } catch (error) {
    console.error('❌ Unexpected error in place-order:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error. Please try again.' 
    }, { status: 500 });
  }
}

// =============================================================================
// NOTIFICATION FUNCTIONS
// =============================================================================

/**
 * Send email and SMS notifications to customer
 * Fire-and-forget - errors are logged but don't fail the order
 */
async function notifyCustomer({ 
  customer, 
  order, 
  orderNumber, 
  subtotal, 
  deliveryFee, 
  total,
  items 
}: any) {
  // Email notification
  if (process.env.SENDGRID_API_KEY && process.env.EMAIL_FROM) {
    try {
      const itemsList = items.map((item: OrderItem) => 
        `${item.product.name} x${item.quantity} - $${(item.product.price * item.quantity).toFixed(2)}`
      ).join('\n');

      const msg = {
        to: customer.email,
        from: process.env.EMAIL_FROM,
        subject: `Order ${orderNumber} confirmed ✅`,
        text: `Hi ${customer.name || customer.first_name || 'there'}!

Thank you for your order with Cannè Art Collective.

Order Number: ${orderNumber}
Order Total: $${total.toFixed(2)}

Items:
${itemsList}

Subtotal: $${subtotal.toFixed(2)}
Delivery: ${deliveryFee === 0 ? 'FREE' : `$${deliveryFee.toFixed(2)}`}
Total: $${total.toFixed(2)}

Delivery Address:
${order.delivery_address_line1}
${order.delivery_city}, ${order.delivery_state} ${order.delivery_zip}

Preferred Time: ${order.preferred_time}

We'll notify you when your driver is assigned. Expected delivery within your selected timeframe.

Questions? Reply to this email or contact us at support@canne.app

Thank you for supporting local art!
- The Cannè Team`,
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Order Confirmed! ✅</h1>
  </div>
  
  <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px;">
    <p style="font-size: 16px; margin-top: 0;">Hi <strong>${customer.name || customer.first_name || 'there'}</strong>!</p>
    
    <p>Thank you for your order with <strong>Cannè Art Collective</strong>.</p>
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #8b5cf6;">
      <p style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280;">Order Number</p>
      <p style="margin: 0; font-size: 20px; font-weight: bold; color: #8b5cf6;">${orderNumber}</p>
    </div>
    
    <h3 style="color: #1f2937; margin-top: 25px;">Order Items</h3>
    <div style="background: white; padding: 15px; border-radius: 8px;">
      ${items.map((item: OrderItem) => `
        <div style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
          <strong>${item.product.name}</strong> x${item.quantity}<br>
          <span style="color: #6b7280; font-size: 14px;">${item.strain?.name || 'Moroccan Peach'} • ${item.strain?.type || 'sativa'}</span>
          <div style="text-align: right; margin-top: 5px;">$${(item.product.price * item.quantity).toFixed(2)}</div>
        </div>
      `).join('')}
      
      <div style="padding: 15px 0 5px 0; font-size: 14px; color: #6b7280;">
        <div style="display: flex; justify-content: space-between; margin: 5px 0;">
          <span>Subtotal:</span>
          <span>$${subtotal.toFixed(2)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin: 5px 0;">
          <span>Delivery:</span>
          <span>${deliveryFee === 0 ? 'FREE' : `$${deliveryFee.toFixed(2)}`}</span>
        </div>
      </div>
      
      <div style="padding: 15px 0 0 0; border-top: 2px solid #e5e7eb; font-size: 18px; font-weight: bold; display: flex; justify-content: space-between;">
        <span>Total:</span>
        <span style="color: #8b5cf6;">$${total.toFixed(2)}</span>
      </div>
    </div>
    
    <h3 style="color: #1f2937; margin-top: 25px;">Delivery Details</h3>
    <div style="background: white; padding: 15px; border-radius: 8px;">
      <p style="margin: 5px 0;"><strong>Address:</strong><br>${order.delivery_address_line1}<br>${order.delivery_city}, ${order.delivery_state} ${order.delivery_zip}</p>
      <p style="margin: 5px 0;"><strong>Preferred Time:</strong> ${order.preferred_time}</p>
    </div>
    
    <div style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 0; color: #1e40af; font-size: 14px;">💡 <strong>What's Next?</strong> We'll notify you when your driver is assigned. Expected delivery within your selected timeframe.</p>
    </div>
    
    <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
      Questions? Reply to this email or contact us at <a href="mailto:support@canne.app" style="color: #8b5cf6;">support@canne.app</a>
    </p>
    
    <p style="font-size: 14px; color: #6b7280;">
      Thank you for supporting local art!<br>
      <strong>- The Cannè Team</strong>
    </p>
  </div>
</body>
</html>`
      };

      await sg.send(msg);
      console.log('✅ Email notification sent to:', customer.email);
      
      // Log successful notification
      await logNotification(customer.id, order.id, 'email', 'sent', { provider: 'sendgrid' });
    } catch (error: any) {
      console.error('❌ Email notification failed:', error?.message || error);
      await logNotification(customer.id, order.id, 'email', 'failed', { error: error?.message || String(error) });
    }
  }

  // SMS notification (if customer has phone and hasn't opted out)
  if (twilioClient && process.env.TWILIO_FROM && customer.phone && !customer.sms_opt_out) {
    try {
      // Format phone to E.164 if needed
      let phone = customer.phone.replace(/\D/g, '');
      if (!phone.startsWith('1') && phone.length === 10) {
        phone = '1' + phone;
      }
      if (!phone.startsWith('+')) {
        phone = '+' + phone;
      }

      await twilioClient.messages.create({
        body: `Cannè: Order ${orderNumber} confirmed! Total: $${total.toFixed(2)}. We'll text you when your driver is assigned. Reply STOP to opt-out.`,
        from: process.env.TWILIO_FROM,
        to: phone
      });
      
      console.log('✅ SMS notification sent to:', phone);
      await logNotification(customer.id, order.id, 'sms', 'sent', { provider: 'twilio', phone });
    } catch (error: any) {
      console.error('❌ SMS notification failed:', error?.message || error);
      await logNotification(customer.id, order.id, 'sms', 'failed', { error: error?.message || String(error) });
    }
  }
}

/**
 * Log notification attempt to database
 */
async function logNotification(
  customer_id: string, 
  order_id: string, 
  channel: 'email' | 'sms', 
  status: 'sent' | 'failed',
  provider_response: any
) {
  try {
    await supabase.from('notification_logs').insert([{
      customer_id,
      order_id,
      channel,
      status,
      provider_response,
      error_message: status === 'failed' ? provider_response.error : null
    }]);
  } catch (error) {
    console.warn('⚠️ Failed to log notification:', error);
  }
}
