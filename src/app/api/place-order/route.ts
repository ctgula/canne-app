import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { supabaseAdmin as supabase } from '@/lib/supabase-admin';

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

export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json();

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

    // Stock validation — prevent overselling
    for (const item of orderData.items as OrderItem[]) {
      const { data: inventory } = await supabase
        .from('product_inventory')
        .select('stock, allow_backorder')
        .eq('product_id', item.product.id)
        .single();

      if (inventory && inventory.stock < item.quantity && !inventory.allow_backorder) {
        return NextResponse.json({
          success: false,
          error: `Sorry, "${item.product.name}" is out of stock. Please remove it and try again.`
        }, { status: 400 });
      }
    }

    // Generate order number
    const orderNumber = `CN-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

    // Create or get customer
    const customerEmail = orderData.deliveryDetails.email || `customer_${Date.now()}@temp.com`;
    const nameParts = orderData.deliveryDetails.name.split(' ');
    
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .upsert({
        email: customerEmail,
        name: orderData.deliveryDetails.name || '',
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
      console.error('Customer creation failed:', customerError.message);
      return NextResponse.json({ 
        success: false, 
        error: `Failed to create customer: ${customerError.message}` 
      }, { status: 500 });
    }


    // Calculate totals
    const subtotal = orderData.items.reduce((sum: number, item: OrderItem) => {
      return sum + (item.product.price * item.quantity);
    }, 0);

    const deliveryFee = orderData.hasDelivery ? 0 : 10;
    const total = subtotal + deliveryFee;


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


    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderPayload)
      .select()
      .single();

    if (orderError) {
      console.error('Order creation failed:', orderError.message);
      return NextResponse.json({ 
        success: false, 
        error: `Failed to create order: ${orderError.message}` 
      }, { status: 500 });
    }


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


    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Order items creation failed:', itemsError.message);
      
      // Clean up the order if items failed
      await supabase.from('orders').delete().eq('id', order.id);
      
      return NextResponse.json({ 
        success: false, 
        error: `Failed to create order items: ${itemsError.message}` 
      }, { status: 500 });
    }


    // Send Discord notification
    try {
      const webhookUrl = process.env.DISCORD_WEBHOOK;
      if (webhookUrl) {
        
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
          console.error('Discord webhook failed:', response.status);
        }
      }
    } catch (discordError) {
      console.error('Discord notification error:', discordError);
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
    console.error('Order placement error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error. Please try again.' 
    }, { status: 500 });
  }
}
