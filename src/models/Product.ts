import { executeQuery, SupabaseMCPResponse } from '@/lib/supabase-mcp';

/**
 * Product model representing the products table in Supabase
 */
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  tier: 'Starter' | 'Classic' | 'Black' | 'Ultra';
  weight: string;
  color_theme: string;
  image_url: string;
  is_active: boolean;
  created_at: string;
}

/**
 * Product model class for interacting with the products table
 * This follows the Model part of the MCP pattern
 */
export class ProductModel {
  /**
   * Get all products
   */
  static async getAll(): Promise<SupabaseMCPResponse<Product[]>> {
    return executeQuery<Product[]>('SELECT * FROM products WHERE is_active = true ORDER BY price ASC');
  }

  /**
   * Get a product by ID
   */
  static async getById(id: string): Promise<SupabaseMCPResponse<Product>> {
    const result = await executeQuery<Product[]>(
      'SELECT * FROM products WHERE id = $1 LIMIT 1',
      [id]
    );
    
    // Convert the array result to a single object or null
    if (result.data && result.data.length > 0) {
      return { data: result.data[0] };
    }
    
    return { error: 'Product not found' };
  }

  /**
   * Get products by tier
   */
  static async getByTier(tier: string): Promise<SupabaseMCPResponse<Product[]>> {
    return executeQuery<Product[]>(
      'SELECT * FROM products WHERE tier = $1 AND is_active = true',
      [tier]
    );
  }
}
