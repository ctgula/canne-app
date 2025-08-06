import { NextRequest, NextResponse } from 'next/server';
import { Order } from '@/types';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json();
    
    // First, create the customer record
    // Split the name into first and last name
    const nameParts = orderData.deliveryDetails.name.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    
    const { data: customerData, error: customerError } = await supabaseAdmin
      .from('customers')
      .insert({
        first_name: firstName,
        last_name: lastName,
        email: `customer_${Date.now()}@temp.com`, // Temporary email, we'll collect real email later
        phone: orderData.deliveryDetails.phone,
        address: orderData.deliveryDetails.address,
        city: orderData.deliveryDetails.city,
        zip_code: orderData.deliveryDetails.zipCode,
        is_verified_21: true // Assuming verification happens during checkout
      })
      .select()
      .single();

    if (customerError) {
      console.error('Error creating customer:', customerError);
      return NextResponse.json(
        { success: false, error: 'Failed to create customer record' },
        { status: 500 }
      );
    }

    // Generate order number first
    const { data: orderNumberData, error: orderNumberError } = await supabaseAdmin
      .rpc('generate_order_number');
    
    if (orderNumberError) {
      console.error('Error generating order number:', orderNumberError);
      return NextResponse.json({ success: false, error: 'Failed to generate order number' }, { status: 500 });
    }

    // Create the order record
    const { data: orderRecord, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        customer_id: customerData.id,
        order_number: orderNumberData,
        subtotal: orderData.total,
        delivery_fee: 0, // Free delivery for now
        total: orderData.total,
        delivery_address_line1: orderData.deliveryDetails.address,
        delivery_city: orderData.deliveryDetails.city,
        delivery_state: 'DC', // Default to DC for now
        delivery_zip: orderData.deliveryDetails.zipCode,
        delivery_instructions: orderData.deliveryDetails.specialInstructions || null,
        status: 'pending'
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      return NextResponse.json(
        { success: false, error: 'Failed to create order' },
        { status: 500 }
      );
    }

    // Create order items
    const orderItems = orderData.items.map((item: any) => ({
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
      return NextResponse.json(
        { success: false, error: 'Failed to create order items' },
        { status: 500 }
      );
    }

    console.log('New order created successfully:', orderRecord.order_number);
    
    // TODO: Add these features later:
    // 1. Send confirmation email/SMS
    // 2. Notify admin dashboard
    // 3. Integrate with payment processing

    return NextResponse.json(
      { 
        success: true, 
        orderId: orderRecord.order_number,
        message: 'Order created successfully' 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create order' 
      },
      { status: 500 }
    );
  }
}

// GET endpoint for fetching orders (for admin dashboard)
export async function GET() {
  try {
    // Fetch orders first
    const { data: ordersData, error: ordersError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (ordersError) {
      console.error('Error fetching orders:', ordersError);
      return NextResponse.json({ success: false, error: 'Failed to fetch orders' }, { status: 500 });
    }

    if (!ordersData || ordersData.length === 0) {
      return NextResponse.json({ success: true, orders: [] });
    }

    // Fetch customers for these orders
    const customerIds = ordersData.map(order => order.customer_id);
    const { data: customersData, error: customersError } = await supabaseAdmin
      .from('customers')
      .select('*')
      .in('id', customerIds);

    if (customersError) {
      console.error('Error fetching customers:', customersError);
      return NextResponse.json({ success: false, error: 'Failed to fetch customers' }, { status: 500 });
    }

    // Fetch order items for these orders
    const orderIds = ordersData.map(order => order.id);
    const { data: orderItemsData, error: orderItemsError } = await supabaseAdmin
      .from('order_items')
      .select('*')
      .in('order_id', orderIds);

    if (orderItemsError) {
      console.error('Error fetching order items:', orderItemsError);
      return NextResponse.json({ success: false, error: 'Failed to fetch order items' }, { status: 500 });
    }

    // Fetch products for the order items
    const productIds = orderItemsData?.map(item => item.product_id) || [];
    const { data: productsData, error: productsError } = await supabaseAdmin
      .from('products')
      .select('*')
      .in('id', productIds);

    if (productsError) {
      console.error('Error fetching products:', productsError);
      return NextResponse.json({ success: false, error: 'Failed to fetch products' }, { status: 500 });
    }

    // Create lookup maps
    const customersMap = new Map(customersData?.map(c => [c.id, c]) || []);
    const productsMap = new Map(productsData?.map(p => [p.id, p]) || []);
    const orderItemsMap = new Map<string, any[]>();
    
    // Group order items by order_id
    orderItemsData?.forEach(item => {
      if (!orderItemsMap.has(item.order_id)) {
        orderItemsMap.set(item.order_id, []);
      }
      orderItemsMap.get(item.order_id)?.push(item);
    });

    // Transform the data to match the Order interface
    const orders: Order[] = ordersData.map((order: any) => {
      const customer = customersMap.get(order.customer_id);
      const orderItems = orderItemsMap.get(order.id) || [];
      
      return {
        id: order.id as string,
        items: orderItems.map((item: any) => {
          const product = productsMap.get(item.product_id);
          return {
            product: {
              id: product?.id || '',
              name: product?.name || '',
              description: product?.description || '',
              price: product?.price || 0,
              artworkUrl: product?.image || '',
              giftSize: product?.tier === 'Starter' ? '3.5g' : 
                       product?.tier === 'Classic' ? '7g' : 
                       product?.tier === 'Black' ? '14g' : 
                       product?.tier === 'Ultra' ? '28g' : '3.5g',
              hasDelivery: (product?.price || 0) >= 45,
            },
            quantity: item.quantity,
          };
        }),
        deliveryDetails: {
          name: customer ? `${customer.first_name} ${customer.last_name}`.trim() : '',
          phone: customer?.phone || '',
          address: order.delivery_address_line1 || '',
          city: order.delivery_city || '',
          zipCode: order.delivery_zip || '',
          timePreference: 'morning' as 'morning' | 'afternoon' | 'evening',
          specialInstructions: order.delivery_instructions || '',
        },
        total: parseFloat(order.total || '0'),
        hasDelivery: true,
        status: (['pending', 'confirmed', 'out_for_delivery', 'delivered', 'cancelled'].includes(order.status) 
          ? order.status 
          : 'pending') as Order['status'],
        createdAt: order.created_at as string,
        updatedAt: order.updated_at as string,
      };
    });

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error('Error in GET /api/orders:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
} 