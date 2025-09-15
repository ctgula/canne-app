import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - List all products with inventory
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const tier = searchParams.get('tier');
    const active = searchParams.get('active');
    const lowStock = searchParams.get('lowStock');

    let query = supabase
      .from('products')
      .select(`
        *,
        product_inventory (
          stock,
          low_stock_threshold,
          allow_backorder
        )
      `);

    // Apply filters
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }
    if (tier) {
      query = query.eq('tier', tier);
    }
    if (active !== null) {
      query = query.eq('is_active', active === 'true');
    }

    const { data: products, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
      return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }

    // Filter by low stock if requested
    let filteredProducts = products;
    if (lowStock === 'true') {
      filteredProducts = products?.filter(product => 
        product.product_inventory?.[0]?.stock <= product.product_inventory?.[0]?.low_stock_threshold
      ) || [];
    }

    return NextResponse.json({ products: filteredProducts });
  } catch (error) {
    console.error('Error in GET /api/admin/products:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new product
export async function POST(request: NextRequest) {
  try {
    const productData = await request.json();
    const {
      name,
      slug,
      description,
      price_cents,
      tier = 'Starter',
      strain,
      thc_range,
      hero_image_url,
      initial_stock = 0,
      low_stock_threshold = 10,
      allow_backorder = false
    } = productData;

    // Validate required fields
    if (!name || !price_cents) {
      return NextResponse.json({ 
        error: 'Name and price are required' 
      }, { status: 400 });
    }

    // Generate slug if not provided
    const finalSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').trim('-');

    // Create product
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert({
        name,
        slug: finalSlug,
        description,
        price_cents,
        tier,
        strain,
        thc_range,
        hero_image_url,
        is_active: true
      })
      .select()
      .single();

    if (productError) {
      console.error('Error creating product:', productError);
      return NextResponse.json({ 
        error: productError.code === '23505' ? 'Product slug already exists' : 'Failed to create product' 
      }, { status: 400 });
    }

    // Create inventory record
    const { error: inventoryError } = await supabase
      .from('product_inventory')
      .insert({
        product_id: product.id,
        stock: initial_stock,
        low_stock_threshold,
        allow_backorder
      });

    if (inventoryError) {
      console.error('Error creating inventory:', inventoryError);
      // Clean up product if inventory creation fails
      await supabase.from('products').delete().eq('id', product.id);
      return NextResponse.json({ error: 'Failed to create product inventory' }, { status: 500 });
    }

    // Log audit trail
    await supabase.from('product_changes').insert({
      product_id: product.id,
      action: 'created',
      changes: { product: productData },
      admin_user: 'admin', // TODO: Get from auth context
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({ 
      success: true, 
      product: { ...product, initial_stock, low_stock_threshold, allow_backorder }
    });
  } catch (error) {
    console.error('Error in POST /api/admin/products:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
