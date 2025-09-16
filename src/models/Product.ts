import { supabase } from '@/lib/supabase';

/**
 * Product model representing the products table in Supabase
 */
export interface Product {
  id: string;
  name: string;
  tier: 'Starter' | 'Classic' | 'Black' | 'Ultra';
  price: number;
  stock: number;
  strain?: string;
  thc_min?: number;
  thc_max?: number;
  gift_grams?: string;
  badges?: string[];
  image_url: string;
  compliance_note?: string;
  // Legacy fields for backward compatibility
  description?: string;
  weight?: string;
  gift_amount?: string;
  color_theme?: string;
  is_active?: boolean;
  created_at?: string;
}

/**
 * Response type for Product operations
 */
export type ProductResponse<T = any> = {
  data?: T;
  error?: string;
  count?: number;
};

/**
 * Product model class for interacting with the products table
 * Uses direct Supabase client for better reliability
 */
export class ProductModel {
  /**
   * Get all products
   */
  static async getAll(): Promise<ProductResponse<Product[]>> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, tier, price, stock, strain, thc_min, thc_max, gift_grams, badges, image_url, compliance_note')
        .eq('active', true)
        .eq('is_test', false)
        .gt('stock', 0)
        .order('tier', { ascending: true })
        .order('price', { ascending: true });

      if (error) {
        console.error('Error fetching products:', error);
        return { error: error.message };
      }

      return { data: data || [] };
    } catch (err) {
      console.error('Unexpected error fetching products:', err);
      return { error: err instanceof Error ? err.message : 'Unknown error' };
    }
  }

  /**
   * Get a product by ID
   */
  static async getById(id: string): Promise<ProductResponse<Product>> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Error fetching product:', error);
        return { error: error.message };
      }

      return { data };
    } catch (err) {
      console.error('Unexpected error fetching product:', err);
      return { error: err instanceof Error ? err.message : 'Product not found' };
    }
  }

  /**
   * Get products by tier
   */
  static async getByTier(tier: string): Promise<ProductResponse<Product[]>> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('tier', tier.toLowerCase())
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (error) {
        console.error('Error fetching products by tier:', error);
        return { error: error.message };
      }

      return { data: data || [] };
    } catch (err) {
      console.error('Unexpected error fetching products by tier:', err);
      return { error: err instanceof Error ? err.message : 'Unknown error' };
    }
  }
}
