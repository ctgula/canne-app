import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Fetch order data with items from database
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select(`
        id, order_number, subtotal, delivery_fee, total, status, created_at, updated_at,
        full_name, phone, payment_method, preferred_time,
        delivery_address_line1, delivery_address_line2, delivery_city, delivery_state, delivery_zip,
        delivery_instructions,
        order_items (
          product_id, quantity, unit_price, strain, thc_low, thc_high, name,
          products (
            tier, weight, color_theme
          )
        )
      `)
      .eq('id', orderId)
      .single();

    if (error || !order) {
      console.error('Error fetching order:', error);
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Return order data with proper formatting
    return NextResponse.json({
      success: true,
      id: order.id,
      order_number: order.order_number,
      subtotal: parseFloat(order.subtotal) || 0,
      delivery_fee: parseFloat(order.delivery_fee) || 0,
      total: parseFloat(order.total) || 0,
      status: order.status,
      created_at: order.created_at,
      updated_at: order.updated_at,
      full_name: order.full_name,
      phone: order.phone,
      payment_method: order.payment_method,
      preferred_time: order.preferred_time,
      delivery_address: {
        line1: order.delivery_address_line1,
        line2: order.delivery_address_line2,
        city: order.delivery_city,
        state: order.delivery_state,
        zip: order.delivery_zip,
      },
      delivery_instructions: order.delivery_instructions,
      items: order.order_items || []
    });

  } catch (error) {
    console.error('Error in orders API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
