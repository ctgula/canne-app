import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Debug: Log environment variables (mask sensitive data)
console.log('=== ENVIRONMENT VARIABLES DEBUG ===');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? `${process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 30)}...` : 'UNDEFINED');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? `${process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 20)}...` : 'UNDEFINED');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('VERCEL_ENV:', process.env.VERCEL_ENV);
console.log('=====================================');

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
  console.log('\n🚀 === ORDER SUBMISSION DEBUG START ===');
  console.log('Timestamp:', new Date().toISOString());
  console.log('Request method:', request.method);
  console.log('Request URL:', request.url);
  
  try {
    // Debug: Re-check environment variables at runtime
    console.log('\n🔍 Runtime Environment Check:');
    console.log('supabaseUrl defined:', !!supabaseUrl);
    console.log('supabaseServiceKey defined:', !!supabaseServiceKey);
    console.log('supabaseAdmin client defined:', !!supabaseAdmin);
    
    // Validate request content type
    const contentType = request.headers.get('content-type');
    console.log('Content-Type:', contentType);
    
    if (!contentType?.includes('application/json')) {
      console.log('❌ Invalid content type');
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

    console.log('\n👤 Creating customer record...');
    const customerPayload = {
      first_name: firstName,
      last_name: lastName,
      email: `customer_${Date.now()}@temp.com`, // Temporary email until we collect real one
      phone: orderData.deliveryDetails.phone,
      address: orderData.deliveryDetails.address,
      city: orderData.deliveryDetails.city,
      zip_code: orderData.deliveryDetails.zipCode,
      is_verified_21: true // Assuming verification happens during checkout
    };
    console.log('Customer payload:', JSON.stringify(customerPayload, null, 2));
    
    const { data: customerData, error: customerError } = await supabaseAdmin
      .from('customers')
      .insert(customerPayload)
      .select('id')
      .single();

    if (customerError) {
      console.error('❌ Error creating customer:');
      console.error('Error details:', JSON.stringify(customerError, null, 2));
      console.error('Error code:', customerError.code);
      console.error('Error message:', customerError.message);
      console.error('Error hint:', customerError.hint);
      return NextResponse.json(
        { success: false, error: `Failed to create customer record: ${customerError.message}` },
        { status: 500 }
      );
    }
    
    console.log('✅ Customer created successfully:', customerData);

    // Step 2: Generate unique order number
    console.log('\n🔢 Generating order number...');
    const { data: orderNumberData, error: orderNumberError } = await supabaseAdmin
      .rpc('generate_order_number');
    
    if (orderNumberError) {
      console.error('❌ Error generating order number:');
      console.error('Error details:', JSON.stringify(orderNumberError, null, 2));
      return NextResponse.json(
        { success: false, error: `Failed to generate order number: ${orderNumberError.message}` },
        { status: 500 }
      );
    }
    
    console.log('✅ Order number generated:', orderNumberData);

    const orderNumber = orderNumberData;

    // Step 3: Create order record
    console.log('\n📋 Creating order record...');
    const orderPayload = {
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
    };
    console.log('Order payload:', JSON.stringify(orderPayload, null, 2));
    
    const { data: orderRecord, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert(orderPayload)
      .select('id, order_number')
      .single();

    if (orderError) {
      console.error('❌ Error creating order:');
      console.error('Error details:', JSON.stringify(orderError, null, 2));
      console.error('Error code:', orderError.code);
      console.error('Error message:', orderError.message);
      console.error('Error hint:', orderError.hint);
      
      // Check if it's a permission/RLS issue
      if (orderError.code === '42501' || orderError.message?.includes('permission denied')) {
        console.error('🚨 PERMISSION DENIED - Check RLS policies on orders table!');
        console.error('Ensure RLS policy allows: role() = \'anonymous\' OR auth.role() = \'service_role\'');
      }
      
      return NextResponse.json(
        { success: false, error: `Failed to create order: ${orderError.message}` },
        { status: 500 }
      );
    }
    
    console.log('✅ Order created successfully:', orderRecord);

    // Step 4: Create order items
    const orderItems = orderData.items.map(item => ({
      order_id: orderRecord.id,
      product_id: item.product.id,
      quantity: item.quantity,
      unit_price: item.product.price,
      total_price: item.product.price * item.quantity
    }));

    console.log('\n🛍️ Creating order items...');
    console.log('Order items payload:', JSON.stringify(orderItems, null, 2));
    
    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('❌ Error creating order items:');
      console.error('Error details:', JSON.stringify(itemsError, null, 2));
      
      // Cleanup: Delete the order if items creation failed
      console.log('🧹 Cleaning up order due to items error...');
      await supabaseAdmin
        .from('orders')
        .delete()
        .eq('id', orderRecord.id);

      return NextResponse.json(
        { success: false, error: `Failed to create order items: ${itemsError.message}` },
        { status: 500 }
      );
    }
    
    console.log('✅ Order items created successfully');

    console.log('\n🎉 Order created successfully:', orderRecord.order_number);
    console.log('=== ORDER SUBMISSION DEBUG END ===\n');

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
