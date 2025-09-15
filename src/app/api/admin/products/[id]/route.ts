import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Get single product with inventory
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: product, error } = await supabase
      .from('products')
      .select(`
        *,
        product_inventory (
          stock,
          low_stock_threshold,
          allow_backorder
        ),
        product_images (
          id,
          url,
          sort
        )
      `)
      .eq('id', params.id)
      .single();

    if (error) {
      console.error('Error fetching product:', error);
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Error in GET /api/admin/products/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Update product
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const updates = await request.json();
    const {
      name,
      slug,
      description,
      price_cents,
      tier,
      strain,
      thc_range,
      hero_image_url,
      is_active,
      stock,
      low_stock_threshold,
      allow_backorder
    } = updates;

    // Get current product for audit log
    const { data: currentProduct } = await supabase
      .from('products')
      .select('*')
      .eq('id', params.id)
      .single();

    if (!currentProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Update product
    const productUpdates: any = {};
    if (name !== undefined) productUpdates.name = name;
    if (slug !== undefined) productUpdates.slug = slug;
    if (description !== undefined) productUpdates.description = description;
    if (price_cents !== undefined) productUpdates.price_cents = price_cents;
    if (tier !== undefined) productUpdates.tier = tier;
    if (strain !== undefined) productUpdates.strain = strain;
    if (thc_range !== undefined) productUpdates.thc_range = thc_range;
    if (hero_image_url !== undefined) productUpdates.hero_image_url = hero_image_url;
    if (is_active !== undefined) productUpdates.is_active = is_active;
    
    if (Object.keys(productUpdates).length > 0) {
      productUpdates.updated_at = new Date().toISOString();
      
      const { error: productError } = await supabase
        .from('products')
        .update(productUpdates)
        .eq('id', params.id);

      if (productError) {
        console.error('Error updating product:', productError);
        return NextResponse.json({ 
          error: productError.code === '23505' ? 'Product slug already exists' : 'Failed to update product' 
        }, { status: 400 });
      }
    }

    // Update inventory if provided
    const inventoryUpdates: any = {};
    if (stock !== undefined) inventoryUpdates.stock = stock;
    if (low_stock_threshold !== undefined) inventoryUpdates.low_stock_threshold = low_stock_threshold;
    if (allow_backorder !== undefined) inventoryUpdates.allow_backorder = allow_backorder;

    if (Object.keys(inventoryUpdates).length > 0) {
      inventoryUpdates.updated_at = new Date().toISOString();
      
      const { error: inventoryError } = await supabase
        .from('product_inventory')
        .update(inventoryUpdates)
        .eq('product_id', params.id);

      if (inventoryError) {
        console.error('Error updating inventory:', inventoryError);
        return NextResponse.json({ error: 'Failed to update inventory' }, { status: 500 });
      }
    }

    // Log audit trail
    await supabase.from('product_changes').insert({
      product_id: params.id,
      action: 'updated',
      changes: { 
        before: currentProduct,
        after: updates
      },
      admin_user: 'admin', // TODO: Get from auth context
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in PATCH /api/admin/products/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete product
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get current product for audit log
    const { data: currentProduct } = await supabase
      .from('products')
      .select('*')
      .eq('id', params.id)
      .single();

    if (!currentProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Check if product has any orders
    const { data: orderItems } = await supabase
      .from('order_items')
      .select('id')
      .eq('product_id', params.id)
      .limit(1);

    if (orderItems && orderItems.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete product with existing orders. Consider hiding it instead.' 
      }, { status: 400 });
    }

    // Delete product (cascade will handle inventory and images)
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', params.id);

    if (error) {
      console.error('Error deleting product:', error);
      return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
    }

    // Log audit trail
    await supabase.from('product_changes').insert({
      product_id: params.id,
      action: 'deleted',
      changes: { deleted_product: currentProduct },
      admin_user: 'admin', // TODO: Get from auth context
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/admin/products/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
