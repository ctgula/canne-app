import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    // Get order items for this order
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select('product_id, qty')
      .eq('order_id', orderId);

    if (itemsError) {
      console.error('Error fetching order items:', itemsError);
      return NextResponse.json({ error: 'Failed to fetch order items' }, { status: 500 });
    }

    if (!orderItems || orderItems.length === 0) {
      return NextResponse.json({ error: 'No items found for this order' }, { status: 404 });
    }

    // Process each item and check/decrement inventory
    const results = [];
    const insufficientStock = [];

    for (const item of orderItems) {
      // Get current inventory
      const { data: inventory, error: invError } = await supabase
        .from('product_inventory')
        .select('stock, allow_backorder')
        .eq('product_id', item.product_id)
        .single();

      if (invError) {
        console.error('Error fetching inventory:', invError);
        return NextResponse.json({ 
          error: `Failed to fetch inventory for product ${item.product_id}` 
        }, { status: 500 });
      }

      // Check if we have sufficient stock
      if (inventory.stock < item.qty && !inventory.allow_backorder) {
        insufficientStock.push({
          product_id: item.product_id,
          requested: item.qty,
          available: inventory.stock
        });
        continue;
      }

      // Decrement stock atomically
      const { data: updatedInventory, error: updateError } = await supabase
        .from('product_inventory')
        .update({ 
          stock: inventory.stock - item.qty,
          updated_at: new Date().toISOString()
        })
        .eq('product_id', item.product_id)
        .select('stock')
        .single();

      if (updateError) {
        console.error('Error updating inventory:', updateError);
        return NextResponse.json({ 
          error: `Failed to update inventory for product ${item.product_id}` 
        }, { status: 500 });
      }

      results.push({
        product_id: item.product_id,
        qty_decremented: item.qty,
        new_stock: updatedInventory.stock
      });

      // Sync products.stock and is_active to keep both stock systems aligned
      const productUpdate: Record<string, any> = { stock: updatedInventory.stock };
      if (updatedInventory.stock <= 0 && !inventory.allow_backorder) {
        productUpdate.is_active = false;
        productUpdate.active = false;
      }
      await supabase
        .from('products')
        .update(productUpdate)
        .eq('id', item.product_id);
    }

    // If any items have insufficient stock, return error
    if (insufficientStock.length > 0) {
      return NextResponse.json({
        error: 'Insufficient stock for some items',
        insufficient_stock: insufficientStock
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Inventory decremented successfully',
      results
    });

  } catch (error) {
    console.error('Error in inventory decrement:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
