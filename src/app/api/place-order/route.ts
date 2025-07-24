import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase admin client with service role key for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validate environment variables with detailed error messages
if (!supabaseUrl) {
  const errorMsg = 'Missing NEXT_PUBLIC_SUPABASE_URL environment variable. Please check your Vercel environment variables.';
  console.error('❌ ENV ERROR:', errorMsg);
  throw new Error(errorMsg);
}

if (!supabaseServiceKey) {
  const errorMsg = 'Missing SUPABASE_SERVICE_ROLE_KEY environment variable. Please check your Vercel environment variables.';
  console.error('❌ ENV ERROR:', errorMsg);
  throw new Error(errorMsg);
}

console.log('✅ Environment variables validated successfully');

// Environment variables validated - ready for production

// Create admin client that bypasses RLS
let supabaseAdmin;
try {
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  console.log('✅ Supabase admin client created successfully');
} catch (error) {
  console.error('❌ Failed to create Supabase client:', error);
  throw new Error(`Failed to create Supabase client: ${error}`);
}

interface DeliveryDetails {
  name: string;
  phone: string;
  address: string;
  city: string;
  zipCode: string;
  preferredTime: string;
  specialInstructions?: string;
}

interface OrderItem {
  id: string;
  name: string;
  description: string;
  price: number;
  artworkUrl: string;
  giftSize: string;
  hasDelivery: boolean;
  quantity: number;
}

interface OrderRequest {
  items: OrderItem[];
  deliveryDetails: DeliveryDetails;
  total: number;
  hasDelivery: boolean;
  status: 'pending' | 'processing' | 'delivered' | 'cancelled';
}

export async function POST(request: NextRequest) {
  try {
    const orderData: OrderRequest = await request.json();

    // Validate cart is not empty
    if (!orderData.items || orderData.items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Cart cannot be empty' },
        { status: 400 }
      );
    }

    // Validate required delivery details
    if (!orderData.deliveryDetails || !orderData.deliveryDetails.name || !orderData.deliveryDetails.phone) {
      return NextResponse.json(
        { success: false, error: 'Name and phone are required' },
        { status: 400 }
      );
    }

    // Front-end DC ZIP validation (backup - main validation is in database trigger)
    const dcZipRegex = /^20(0\d\d|1\d\d)$/;
    if (!dcZipRegex.test(orderData.deliveryDetails.zipCode)) {
      return NextResponse.json(
        { success: false, error: 'Only Washington DC ZIP codes (20000-20199) are allowed' },
        { status: 400 }
      );
    }

    // Calculate totals
    const subtotal = orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = orderData.hasDelivery ? 0 : 10;
    const total = subtotal + deliveryFee;

    // Create customer record first (using verified schema fields)
    const customerPayload = {
      first_name: orderData.deliveryDetails.name.split(' ')[0] || orderData.deliveryDetails.name,
      last_name: orderData.deliveryDetails.name.split(' ').slice(1).join(' ') || 'Guest',
      email: `guest_${Date.now()}@canne.local`,
      phone: orderData.deliveryDetails.phone
    };

    const { data: customerRecord, error: customerError } = await supabaseAdmin
      .from('customers')
      .insert(customerPayload)
      .select('id')
      .single();

    if (customerError) {
      console.log('Customer creation error:', customerError);
      return NextResponse.json(
        { success: false, error: `Failed to create customer: ${customerError.message}` },
        { status: 500 }
      );
    }

    // Generate order number
    const orderNumber = `CN-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    
    // Create order with minimal essential fields that we know work
    const orderPayload = {
      customer_id: customerRecord.id,
      order_number: orderNumber,
      subtotal: subtotal,
      delivery_fee: deliveryFee,
      total: total,
      status: 'pending',
      delivery_address_line1: orderData.deliveryDetails.address,
      delivery_city: orderData.deliveryDetails.city,
      delivery_state: 'DC',
      delivery_zip: orderData.deliveryDetails.zipCode
    };
    
    const { data: orderRecord, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert(orderPayload)
      .select('id, created_at, status, total, subtotal, delivery_fee, order_number, delivery_address_line1, delivery_city, delivery_zip')
      .single();

    if (orderError) {
      // Handle DC ZIP validation error from database trigger
      if (orderError.message?.includes('Out-of-zone address')) {
        return NextResponse.json(
          { success: false, error: 'Only Washington DC ZIP codes (20000-20199) are allowed' },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { success: false, error: `Failed to create order: ${orderError.message}` },
        { status: 500 }
      );
    }

    // Create order items with all required fields
    const orderItems = orderData.items.map(item => ({
      order_id: orderRecord.id,
      product_id: item.id,
      quantity: item.quantity,
      unit_price: item.price,
      total_price: item.price * item.quantity
    }));
    
    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      // Cleanup: Delete the order if items creation failed
      await supabaseAdmin
        .from('orders')
        .delete()
        .eq('id', orderRecord.id);

      return NextResponse.json(
        { success: false, error: `Failed to create order items: ${itemsError.message}` },
        { status: 500 }
      );
    }

    // Send Apple-level Discord notification with real database data
    try {
      const discordWebhook = process.env.DISCORD_WEBHOOK;
      if (discordWebhook) {
        // Fetch complete customer information from database
        const { data: customerData } = await supabaseAdmin
          .from('customers')
          .select('first_name, last_name, phone, email')
          .eq('id', customerRecord.id)
          .single();

        // Fetch complete order items with product details using proper JOIN
        const { data: orderItemsData, error: orderItemsError } = await supabaseAdmin
          .from('order_items')
          .select(`
            quantity,
            unit_price,
            total_price,
            product_id,
            products!inner (
              name,
              tier,
              description,
              gift_amount,
              color_theme
            )
          `)
          .eq('order_id', orderRecord.id);

        console.log('Order items query result:', { orderItemsData, orderItemsError, orderId: orderRecord.id });

        const customerName = `${customerData?.first_name || ''} ${customerData?.last_name || ''}`.trim();
        const customerPhone = customerData?.phone || 'Not provided';
        
        // Create detailed order items description with proper tier names and gift amounts
        const orderDetailsText = orderItemsData?.length > 0 ? orderItemsData.map(item => {
          const product = item.products;
          const tierName = {
            'starter': 'Starter Collection',
            'classic': 'Classic Series', 
            'black': 'Black Edition',
            'ultra': 'Ultra Premium'
          }[product?.tier] || product?.name || 'Unknown Product';
          
          const giftAmount = product?.gift_amount || '7g';
          const unitPrice = parseFloat(item.unit_price).toFixed(2);
          const totalPrice = parseFloat(item.total_price).toFixed(2);
          
          return `• **${item.quantity}x ${tierName}** (${giftAmount} complimentary)\n   $${unitPrice} each = $${totalPrice} total`;
        }).join('\n\n') : `No items found (Error: ${orderItemsError?.message || 'Unknown error'})`;

        const embed = {
          title: "🌿 New Cannè Order Received!",
          description: `Order **${orderRecord.order_number}** has been placed and is ready for processing.`,
          fields: [
            { 
              name: "👤 Customer Information", 
              value: `**Name:** ${customerName || 'Guest Customer'}\n**Phone:** ${customerPhone}\n**Email:** ${customerData?.email || 'Not provided'}`,
              inline: false 
            },
            { 
              name: "📍 Delivery Details", 
              value: `**Address:** ${orderRecord.delivery_address_line1}\n${orderRecord.delivery_city}, DC ${orderRecord.delivery_zip}\n**Preferred Time:** ${orderData.deliveryDetails.preferredTime || 'Not specified'}`,
              inline: false 
            },
            { 
              name: "📦 Order Details", 
              value: orderDetailsText,
              inline: false 
            },
            { name: "Subtotal", value: `$${orderRecord.subtotal.toFixed(2)}`, inline: true },
            { name: "Delivery", value: orderRecord.delivery_fee > 0 ? `$${orderRecord.delivery_fee.toFixed(2)}` : 'FREE', inline: true },
            { name: "**Total**", value: `**$${orderRecord.total.toFixed(2)}**`, inline: true }
          ],
          timestamp: orderRecord.created_at,
          color: 0x8B5CF6,
          footer: { 
            text: "Cannè Art Collective • I-71 Compliant • Washington, DC",
            icon_url: "https://raw.githubusercontent.com/twemoji/twemoji/master/assets/72x72/1f33f.png"
          },
          thumbnail: {
            url: "https://raw.githubusercontent.com/twemoji/twemoji/master/assets/72x72/1f4e6.png"
          }
        };
        
        // Add special instructions if provided
        if (orderData.deliveryDetails.specialInstructions) {
          embed.fields.push({
            name: "📝 Special Instructions",
            value: orderData.deliveryDetails.specialInstructions,
            inline: false
          });
        }
        
        await fetch(discordWebhook, {
          method: "POST",
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            username: "Cannè Order System",
            avatar_url: "https://raw.githubusercontent.com/twemoji/twemoji/master/assets/72x72/1f33f.png",
            embeds: [embed] 
          })
        });
      }
    } catch (error) {
      console.error('Discord notification failed:', error);
    }

    // Return success response
    return NextResponse.json({
      success: true,
      orderId: orderRecord.id,
      message: 'Order placed successfully'
    });

  } catch (error) {
    console.error('\n💥 Unexpected error in place-order API:');
    console.error('Error type:', typeof error);
    console.error('Error name:', error?.name);
    console.error('Error message:', error?.message);
    console.error('Error stack:', error?.stack);
    console.error('Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    console.log('=== ORDER SUBMISSION DEBUG END (ERROR) ===\n');
    
    return NextResponse.json(
      { success: false, error: `Internal server error: ${error?.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}

// Only allow POST requests
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
