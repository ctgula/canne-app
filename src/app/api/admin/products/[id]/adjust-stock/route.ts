import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST - Adjust stock (increment/decrement)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Get current inventory
    const { data: inventory, error: invError } = await supabase
      .from('product_inventory')
      .select('stock, allow_backorder')
      .eq('product_id', params.id)
      .single();

    if (invError) {
      console.error('Error fetching inventory:', invError);
      return NextResponse.json({ error: 'Product inventory not found' }, { status: 404 });
    }

    const newStock = inventory.stock + adjustment;

    // Prevent negative stock unless backorder is allowed
    if (newStock < 0 && !inventory.allow_backorder) {
      return NextResponse.json({ 
        error: 'Cannot reduce stock below zero unless backorder is enabled' 
      }, { status: 400 });
    }

    // Update stock atomically
    const { data: updatedInventory, error: updateError } = await supabase
      .from('product_inventory')
      .update({ 
        stock: newStock,
        updated_at: new Date().toISOString()
      })
      .eq('product_id', params.id)
      .select('stock')
      .single();

    if (updateError) {
      console.error('Error updating inventory:', updateError);
      return NextResponse.json({ error: 'Failed to update inventory' }, { status: 500 });
    }

    // If stock hits 0 and backorder not allowed, deactivate product
    if (updatedInventory.stock <= 0 && !inventory.allow_backorder) {
      await supabase
        .from('products')
        .update({ is_active: false })
        .eq('id', params.id);
    }
    // If stock becomes available again, reactivate product
    else if (updatedInventory.stock > 0) {
      await supabase
        .from('products')
        .update({ is_active: true })
        .eq('id', params.id);
    }

    // Log audit trail
    await supabase.from('product_changes').insert({
      product_id: params.id,
      action: 'stock_adjusted',
      changes: { 
        adjustment,
        reason,
        old_stock: inventory.stock,
        new_stock: updatedInventory.stock
      },
      admin_user: 'admin', // TODO: Get from auth context
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      old_stock: inventory.stock,
      new_stock: updatedInventory.stock,
      adjustment
    });

  } catch (error) {
    console.error('Error in POST /api/admin/products/[id]/adjust-stock:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
