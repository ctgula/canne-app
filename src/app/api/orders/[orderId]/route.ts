import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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
        id, order_number, subtotal, delivery_fee, total, status, created_at,
        order_items (
          product_name, quantity, price, strain
        )
      `)
      .eq('id', orderId)
      .single();

    if (error) {
      console.error('Error fetching order:', error);
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    if (!order) {
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
