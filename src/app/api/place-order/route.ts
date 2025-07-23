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

    // Generate unique order number
    const { data: orderNumber, error: orderNumberError } = await supabaseAdmin
      .rpc('generate_order_number');
    
    if (orderNumberError) {
      return NextResponse.json(
        { success: false, error: `Failed to generate order number: ${orderNumberError.message}` },
        { status: 500 }
      );
    }

    // Calculate totals
    const subtotal = orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = orderData.hasDelivery ? 0 : 10;
    const total = subtotal + deliveryFee;

    // Create order record with new structure
    const orderPayload = {
      order_number: orderNumber,
      full_name: orderData.deliveryDetails.name,
      phone: orderData.deliveryDetails.phone,
      street: orderData.deliveryDetails.address,
      city: orderData.deliveryDetails.city,
      zip: orderData.deliveryDetails.zipCode,
      preferred_time: orderData.deliveryDetails.preferredTime,
      instructions: orderData.deliveryDetails.specialInstructions || null,
      subtotal: subtotal,
      total: total,
      status: 'pending'
    };
    
    const { data: orderRecord, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert(orderPayload)
      .select('id, order_number, full_name, phone, street, city, zip, preferred_time, instructions, subtotal, total, created_at')
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

    // Create order items with product names
    const orderItems = orderData.items.map(item => ({
      order_id: orderRecord.id,
      product_id: item.id,
      name: item.name,
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

    // Send Discord notification with embed format
    try {
      const discordWebhook = process.env.DISCORD_WEBHOOK;
      if (discordWebhook) {
        const embed = {
          title: "📦 New Cannè Order!",
          fields: [
            { name: "Order ID", value: orderRecord.order_number, inline: true },
            { name: "Customer", value: orderRecord.full_name, inline: true },
            { name: "Phone", value: orderRecord.phone, inline: true },
            { name: "Address", value: `${orderRecord.street}\n${orderRecord.city}, DC ${orderRecord.zip}` },
            { name: "Delivery Time", value: orderRecord.preferred_time },
            { 
              name: "Order Details",
              value: orderItems.map(i => `• ${i.quantity} × ${i.name} – $${i.unit_price}`).join("\n")
            },
            { name: "Total", value: `$${orderRecord.total.toFixed(2)}` }
          ],
          timestamp: orderRecord.created_at
        };
        
        await fetch(discordWebhook, {
          method: "POST",
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: "Captain Hook", embeds: [embed] })
        });
      }
    } catch (discordError) {
      // Don't fail the order if Discord notification fails
      console.warn('Discord notification failed:', discordError);
    }

    // Return success response
    return NextResponse.json({
      success: true,
      orderId: orderRecord.order_number,
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
