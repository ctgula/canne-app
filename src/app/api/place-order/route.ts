import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { createClient } from '@supabase/supabase-js';

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
