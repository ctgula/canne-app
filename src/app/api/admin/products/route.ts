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
      .select('*');

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

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Error in GET /api/admin/products:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new product
export async function POST(request: NextRequest) {
  try {
    const requestData = await request.json();
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
    } = requestData;

    // Validate required fields
    if (!name || !price_cents) {
      return NextResponse.json({ 
        error: 'Name and price are required' 
      }, { status: 400 });
    }

    // Generate slug if not provided
    const finalSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').trim('-');

    // Map tier to defaults based on existing products
    const tierDefaults = {
      'Starter': { weight: '3.5g', gift_amount: '0.5g', color_theme: 'Pink' },
      'Classic': { weight: '7g', gift_amount: '1g', color_theme: 'Violet' },
      'Black': { weight: '14g', gift_amount: '2g', color_theme: 'Black/Gray' },
      'Ultra': { weight: '28g', gift_amount: '4g', color_theme: 'Purple/Indigo' }
    };

    const defaults = tierDefaults[tier as keyof typeof tierDefaults] || tierDefaults['Starter'];

    // Create product with required fields based on database schema
    const productData: any = {
      name,
      slug: finalSlug, // Required field
      tier: tier.toLowerCase(), // Database expects lowercase
      price: price_cents / 100,
      price_cents: price_cents, // Required field
      gift_amount: defaults.gift_amount, // Required field
      color_theme: defaults.color_theme, // Required field
      is_active: true
    };

    // Add optional fields if they exist
    if (description) productData.description = description;
    if (hero_image_url) productData.image_url = hero_image_url;

    const { data: product, error: productError } = await supabase
      .from('products')
      .insert(productData)
      .select()
      .single();

    if (productError) {
      console.error('Error creating product:', productError);
      return NextResponse.json({ 
        error: productError.code === '23505' ? 'Product slug already exists' : 'Failed to create product' 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      product
    });
  } catch (error) {
    console.error('Error in POST /api/admin/products:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
