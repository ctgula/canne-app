import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase admin client with service role key for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validate environment variables with detailed error messages
if (!supabaseUrl) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable. Please check your Vercel environment variables.');
}

if (!supabaseServiceKey) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable. Please check your Vercel environment variables.');
}

// Create admin client that bypasses RLS
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

interface DeliveryDetails {
  name: string;
  phone: string;
  address: string;
  city: string;
  zipCode: string;
  timePreference: 'morning' | 'afternoon' | 'evening';
  specialInstructions: string;
}

interface OrderItem {
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    artworkUrl: string;
    giftSize: string;
    hasDelivery: boolean;
  };
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
    // Validate request content type
    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      return NextResponse.json(
        { success: false, error: 'Content-Type must be application/json' },
        { status: 400 }
      );
    }

    const orderData: OrderRequest = await request.json();

    // Validate required fields
    if (!orderData.items || orderData.items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Order must contain at least one item' },
        { status: 400 }
      );
    }

    if (!orderData.deliveryDetails || !orderData.deliveryDetails.name || !orderData.deliveryDetails.phone) {
      return NextResponse.json(
        { success: false, error: 'Delivery details with name and phone are required' },
        { status: 400 }
      );
    }

    // Validate phone number format (basic validation)
    const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
    if (!phoneRegex.test(orderData.deliveryDetails.phone.replace(/\s/g, ''))) {
      return NextResponse.json(
        { success: false, error: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    // Start database transaction
    console.log('Creating order for:', orderData.deliveryDetails.name);

    // Step 1: Create customer record
    const nameParts = orderData.deliveryDetails.name.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const { data: customerData, error: customerError } = await supabaseAdmin
      .from('customers')
      .insert({
        first_name: firstName,
        last_name: lastName,
        email: `customer_${Date.now()}@temp.com`, // Temporary email until we collect real one
        phone: orderData.deliveryDetails.phone,
        address: orderData.deliveryDetails.address,
        city: orderData.deliveryDetails.city,
        zip_code: orderData.deliveryDetails.zipCode,
        is_verified_21: true // Assuming verification happens during checkout
      })
      .select('id')
      .single();

    if (customerError) {
      console.error('Error creating customer:', customerError);
      return NextResponse.json(
        { success: false, error: 'Failed to create customer record' },
        { status: 500 }
      );
    }

    // Step 2: Generate unique order number
    const { data: orderNumberData, error: orderNumberError } = await supabaseAdmin
      .rpc('generate_order_number');
    
    if (orderNumberError) {
      console.error('Error generating order number:', orderNumberError);
      return NextResponse.json(
        { success: false, error: 'Failed to generate order number' },
        { status: 500 }
      );
    }

    const orderNumber = orderNumberData;

    // Step 3: Create order record
    const { data: orderRecord, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        order_number: orderNumber,
        customer_id: customerData.id,
        total_amount: orderData.total,
        status: 'pending',
        delivery_address: orderData.deliveryDetails.address,
        delivery_city: orderData.deliveryDetails.city,
        delivery_zip: orderData.deliveryDetails.zipCode,
        delivery_time_preference: orderData.deliveryDetails.timePreference,
        special_instructions: orderData.deliveryDetails.specialInstructions || null,
        has_free_delivery: orderData.hasDelivery
      })
      .select('id, order_number')
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      return NextResponse.json(
        { success: false, error: 'Failed to create order' },
        { status: 500 }
      );
    }

    // Step 4: Create order items
    const orderItems = orderData.items.map(item => ({
      order_id: orderRecord.id,
      product_id: item.product.id,
      quantity: item.quantity,
      unit_price: item.product.price,
      total_price: item.product.price * item.quantity
    }));

    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Error creating order items:', itemsError);
      
      // Cleanup: Delete the order if items creation failed
      await supabaseAdmin
        .from('orders')
        .delete()
        .eq('id', orderRecord.id);

      return NextResponse.json(
        { success: false, error: 'Failed to create order items' },
        { status: 500 }
      );
    }

    console.log('Order created successfully:', orderRecord.order_number);

    // Return success response
    return NextResponse.json({
      success: true,
      orderId: orderRecord.order_number,
      message: 'Order placed successfully'
    });

  } catch (error) {
    console.error('Unexpected error in place-order API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
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
