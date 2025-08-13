'use client';

import { supabase } from '@/lib/supabase';
import { Product } from '@/models/Product';

/**
 * MCP-Aligned Database Service
 * 
 * This service ensures alignment between frontend models and database schema
 * using Model Context Protocol principles for consistent data flow.
 */

export interface DatabaseProduct extends Product {
  // Extended fields for shop functionality
  strain?: string;
  type?: 'art' | 'tie' | 'flower';
  color?: string;
  pattern?: string;
  features?: string[];
  // Metadata fields
  metadata?: Record<string, any>;
  // Normalized, title-cased tier for UI (e.g. "Starter")
  display_tier?: string;
}

export interface DatabaseResponse<T = any> {
  data?: T;
  error?: string;
  count?: number;
  status: 'success' | 'error' | 'loading';
}

/**
 * MCP Database Service Class
 * Handles all database operations with proper error handling and type safety
 */
export class DatabaseService {
  /** Normalize DB tier to title case and provide helpers */
  private static normalizeTier(tier: string | null | undefined) {
    const lc = (tier || '').toString().trim().toLowerCase();
    const titleMap: Record<string, string> = {
      starter: 'Starter',
      classic: 'Classic',
      black: 'Black',
      ultra: 'Ultra',
    };
    const title = titleMap[lc] || (tier || '');
    return { lc, title };
  }

  /** Feature map that accepts lower-case tiers */
  private static featureMapLC: Record<string, string[]> = {
    starter: ['Digital Art Print', 'Complimentary Gift', '3.5g Flower'],
    classic: ['Double Art Series', 'Signature Collection', 'Two Curated Gifts', '7g Flower'],
    black: ['Limited Collection', 'Premium Prints', 'Four Premium Gifts', '14g Premium Flower'],
    ultra: ['Exclusive Gallery Pieces', 'Eight Premium Selections', '28g Premium Collection', 'VIP Experience'],
  };

  /** Strain map that accepts lower-case tiers */
  private static strainMapLC: Record<string, string> = {
    starter: 'House Blend',
    classic: 'Signature Strain',
    black: 'Premium Selection',
    ultra: 'Exclusive Reserve',
  };

  /**
   * Get all active products with MCP alignment
   */
  static async getProducts(): Promise<DatabaseResponse<DatabaseProduct[]>> {
    try {
      const { data, error, count } = await supabase
        .from('products')
        .select('*', { count: 'exact' })
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (error) {
        console.error('Database Error - Products:', error);
        return {
          error: `Failed to fetch products: ${error.message}`,
          status: 'error'
        };
      }

      // Transform database data to match frontend expectations
      const transformedProducts: DatabaseProduct[] = (data || []).map(product => {
        const { lc, title } = this.normalizeTier(product.tier);
        return {
          ...product,
          // Ensure all required fields are present
          image_url: product.image_url || '/placeholder-product.jpg',
          weight: (product as any).gift_amount || (product as any).weight || '0g',
          gift_amount: (product as any).gift_amount || (product as any).weight || '0g',
          color_theme: (product as any).color_theme || '#8B5CF6',
          // Normalized tier for UI
          display_tier: title,
          // Parse metadata if it exists
          ...((product as any).metadata && typeof (product as any).metadata === 'object' ? (product as any).metadata : {}),
          // Add computed fields using normalized tier
          features: (product as any).features || this.featureMapLC[lc] || ['Premium Art Experience'],
          type: (product as any).type || 'art',
          strain: (product as any).strain || this.strainMapLC[lc] || 'Curated Selection',
        } as DatabaseProduct;
      });

      return {
        data: transformedProducts,
        count: count || 0,
        status: 'success'
      };
    } catch (err) {
      console.error('Database Service Error:', err);
      return {
        error: 'Network error - please check your connection',
        status: 'error'
      };
    }
  }

  /**
   * Get product by ID with full type safety
   */
  static async getProductById(id: string): Promise<DatabaseResponse<DatabaseProduct>> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Database Error - Product by ID:', error);
        return {
          error: `Product not found: ${error.message}`,
          status: 'error'
        };
      }

      if (!data) {
        return {
          error: 'Product not found',
          status: 'error'
        };
      }

      // Transform single product
      const { lc, title } = this.normalizeTier((data as any).tier);
      const transformedProduct: DatabaseProduct = {
        ...(data as any),
        image_url: (data as any).image_url || '/placeholder-product.jpg',
        weight: (data as any).weight || (data as any).gift_amount || '0g',
        color_theme: (data as any).color_theme || '#8B5CF6',
        display_tier: title,
        ...((data as any).metadata && typeof (data as any).metadata === 'object' ? (data as any).metadata : {}),
        features: (data as any).features || this.featureMapLC[lc] || ['Premium Art Experience'],
        type: (data as any).type || 'art',
        strain: (data as any).strain || this.strainMapLC[lc] || 'Curated Selection',
      };

      return {
        data: transformedProduct,
        status: 'success'
      };
    } catch (err) {
      console.error('Database Service Error:', err);
      return {
        error: 'Network error - please check your connection',
        status: 'error'
      };
    }
  }

  /**
   * Get products by tier with filtering
   */
  static async getProductsByTier(tier: string): Promise<DatabaseResponse<DatabaseProduct[]>> {
    try {
      const { data, error, count } = await supabase
        .from('products')
        .select('*', { count: 'exact' })
        // Match DB lower-case convention regardless of input casing
        .eq('tier', tier.toLowerCase())
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (error) {
        console.error('Database Error - Products by Tier:', error);
        return {
          error: `Failed to fetch ${tier} products: ${error.message}`,
          status: 'error'
        };
      }

      const transformedProducts: DatabaseProduct[] = (data || []).map(product => {
        const { lc, title } = this.normalizeTier(product.tier);
        return {
          ...product,
          image_url: product.image_url || '/placeholder-product.jpg',
          weight: (product as any).weight || (product as any).gift_amount || '0g',
          color_theme: (product as any).color_theme || '#8B5CF6',
          display_tier: title,
          ...((product as any).metadata && typeof (product as any).metadata === 'object' ? (product as any).metadata : {}),
          features: (product as any).features || this.featureMapLC[lc] || ['Premium Art Experience'],
          type: (product as any).type || 'art',
          strain: (product as any).strain || this.strainMapLC[lc] || 'Curated Selection',
        } as DatabaseProduct;
      });

      return {
        data: transformedProducts,
        count: count || 0,
        status: 'success'
      };
    } catch (err) {
      console.error('Database Service Error:', err);
      return {
        error: 'Network error - please check your connection',
        status: 'error'
      };
    }
  }

  /**
   * Search products with full-text search
   */
  static async searchProducts(query: string): Promise<DatabaseResponse<DatabaseProduct[]>> {
    try {
      const { data, error, count } = await supabase
        .from('products')
        .select('*', { count: 'exact' })
        .or(`name.ilike.%${query}%,description.ilike.%${query}%,tier.ilike.%${query}%`)
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (error) {
        console.error('Database Error - Search Products:', error);
        return {
          error: `Search failed: ${error.message}`,
          status: 'error'
        };
      }

      const transformedProducts: DatabaseProduct[] = (data || []).map(product => ({
        ...product,
        image_url: product.image_url || '/placeholder-product.jpg',
        weight: product.weight || '0g',
        color_theme: product.color_theme || '#8B5CF6',
        ...(product.metadata && typeof product.metadata === 'object' ? product.metadata : {}),
        features: product.features || this.getDefaultFeatures(product.tier),
        type: product.type || 'art',
        strain: product.strain || this.getDefaultStrain(product.tier)
      }));

      return {
        data: transformedProducts,
        count: count || 0,
        status: 'success'
      };
    } catch (err) {
      console.error('Database Service Error:', err);
      return {
        error: 'Network error - please check your connection',
        status: 'error'
      };
    }
  }

  /**
   * Test database connection
   */
  static async testConnection(): Promise<DatabaseResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('products')
        .select('id')
        .limit(1);

      if (error) {
        return {
          error: `Database connection failed: ${error.message}`,
          status: 'error'
        };
      }

      return {
        data: true,
        status: 'success'
      };
    } catch (err) {
      console.error('Database Connection Test Error:', err);
      return {
        error: 'Network error - cannot reach database',
        status: 'error'
      };
    }
  }

  /**
   * Get default features based on tier
   */
  private static getDefaultFeatures(tier: string): string[] {
    const { lc } = this.normalizeTier(tier);
    return this.featureMapLC[lc] || ['Premium Art Experience'];
  }

  /**
   * Get default strain based on tier
   */
  private static getDefaultStrain(tier: string): string {
    const { lc } = this.normalizeTier(tier);
    return this.strainMapLC[lc] || 'Curated Selection';
  }
}

/**
 * MCP Hook for React components
 */
export function useDatabaseService() {
  return {
    getProducts: DatabaseService.getProducts,
    getProductById: DatabaseService.getProductById,
    getProductsByTier: DatabaseService.getProductsByTier,
    searchProducts: DatabaseService.searchProducts,
    testConnection: DatabaseService.testConnection
  };
}
