import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: Request) {
  try {
    // Get products
    const { data: products, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('is_active', true);

    if (error) {
      throw error;
    }

    return NextResponse.json({ products });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, payload } = body;

    switch (action) {
      case 'create_order': {
        const { order, items } = payload;
        
        // Create order
        const { data: orderData, error: orderError } = await supabaseAdmin
          .from('orders')
          .insert(order)
          .select()
          .single();

        if (orderError) throw orderError;

        // Add order items
        const orderItems = items.map((item: any) => ({
          ...item,
          order_id: orderData.id
        }));

        const { data: itemsData, error: itemsError } = await supabaseAdmin
          .from('order_items')
          .insert(orderItems)
          .select();

        if (itemsError) throw itemsError;

        return NextResponse.json({ 
          success: true, 
          order: orderData,
          items: itemsData
        });
      }
      
      case 'update_profile': {
        const { profile } = payload;
        
        const { data, error } = await supabaseAdmin
          .from('profiles')
          .upsert(profile)
          .select()
          .single();

        if (error) throw error;

        return NextResponse.json({ success: true, profile: data });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
