import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST - Adjust stock (increment/decrement)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const { adjustment, reason } = await request.json();

    if (!adjustment || !reason) {
      return NextResponse.json({ 
        error: 'Adjustment amount and reason are required' 
      }, { status: 400 });
    }

    if (typeof adjustment !== 'number') {
      return NextResponse.json({ 
        error: 'Adjustment must be a number' 
      }, { status: 400 });
    }

    // Get current product and inventory
    const { data: product, error: productError } = await supabase
      .from('products')
      .select(`
        *,
        product_inventory (*)
      `)
      .eq('id', id)
      .single();

    if (productError) {
      console.error('Error fetching product:', productError);
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const inventory = product.product_inventory;

    const newStock = inventory.stock + adjustment;

    // Prevent negative stock unless backorder is allowed
    if (newStock < 0 && !inventory.allow_backorder) {
      return NextResponse.json({ 
        error: 'Cannot reduce stock below zero unless backorder is enabled' 
      }, { status: 400 });
    }

    // Update inventory
    const { error: updateError } = await supabase
      .from('product_inventory')
      .update({ stock: newStock })
      .eq('product_id', id);

    if (updateError) {
      console.error('Error updating inventory:', updateError);
      return NextResponse.json({ error: 'Failed to update inventory' }, { status: 500 });
    }

    // If stock hits 0 and backorder not allowed, deactivate product
    if (newStock <= 0 && !inventory.allow_backorder) {
      await supabase
        .from('products')
        .update({ is_active: false })
        .eq('id', id);
    }
    // If stock becomes available again, reactivate product
    else if (newStock > 0) {
      await supabase
        .from('products')
        .update({ is_active: true })
        .eq('id', id);
    }

    // Log the adjustment
    await supabase
      .from('product_audit_log')
      .insert({
        product_id: id,
        action: 'stock_adjustment',
        old_values: { stock: inventory.stock },
        new_values: { stock: newStock },
        changed_by: 'admin',
        reason: reason
      });

    return NextResponse.json({
      success: true,
      message: 'Stock adjusted successfully',
      new_stock: newStock
    });

  } catch (error) {
    console.error('Error in POST /api/admin/products/[id]/adjust-stock:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
