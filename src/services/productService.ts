import { supabase } from '@/lib/supabase';
import { Product } from '@/types/supabase';

/**
 * Get all active products
 */
export async function getAllProducts(): Promise<{ products: Product[], error: any }> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('tier', { ascending: true });
    
    if (error) throw error;
    return { products: data || [], error: null };
  } catch (error) {
    console.error('Error fetching products:', error);
    return { products: [], error };
  }
}

/**
 * Get products by tier
 */
export async function getProductsByTier(tier: string): Promise<{ products: Product[], error: any }> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('tier', tier)
      .eq('is_active', true);
    
    if (error) throw error;
    return { products: data || [], error: null };
  } catch (error) {
    console.error(`Error fetching ${tier} products:`, error);
    return { products: [], error };
  }
}

/**
 * Get product by ID
 */
export async function getProductById(id: string): Promise<{ product: Product | null, error: any }> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return { product: data, error: null };
  } catch (error) {
    console.error('Error fetching product:', error);
    return { product: null, error };
  }
}

/**
 * Create product mapping for the four tiers
 * This is useful for initializing the database with the standard products
 */
export async function createStandardProducts(): Promise<{ success: boolean, error: any }> {
  try {
    const standardProducts = [
      {
        name: 'Starter Tier Art',
        description: 'Single digital print + complimentary top-shelf gift.',
        price: 25,
        tier: 'Starter',
        weight: '3.5g',
        color_theme: 'Pink',
        image_url: '/images/products/starter.jpg',
        is_active: true
      },
      {
        name: 'Classic Tier Art',
        description: 'Double art series with signature + two curated gifts.',
        price: 45,
        tier: 'Classic',
        weight: '7g',
        color_theme: 'Violet',
        image_url: '/images/products/classic.jpg',
        is_active: true
      },
      {
        name: 'Black Tier Art',
        description: 'Limited collection prints + four premium gifts.',
        price: 75,
        tier: 'Black',
        weight: '14g',
        color_theme: 'Black/Gray',
        image_url: '/images/products/black.jpg',
        is_active: true
      },
      {
        name: 'Ultra Tier Art',
        description: 'Exclusive gallery pieces + eight premium selections.',
        price: 140,
        tier: 'Ultra',
        weight: '28g',
        color_theme: 'Purple/Indigo',
        image_url: '/images/products/ultra.jpg',
        is_active: true
      }
    ];

    const { error } = await supabase
      .from('products')
      .upsert(standardProducts, { onConflict: 'tier' });
    
    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    console.error('Error creating standard products:', error);
    return { success: false, error };
  }
}
