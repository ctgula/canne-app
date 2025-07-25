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
      const transformedProducts: DatabaseProduct[] = (data || []).map(product => ({
        ...product,
        // Ensure all required fields are present
        image_url: product.image_url || '/placeholder-product.jpg',
        weight: product.gift_amount || product.weight || '0g', // Use gift_amount from database
        gift_amount: product.gift_amount || product.weight || '0g', // Ensure gift_amount is available
        color_theme: product.color_theme || '#8B5CF6',
        // Parse metadata if it exists
        ...(product.metadata && typeof product.metadata === 'object' ? product.metadata : {}),
        // Add computed fields
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
      const transformedProduct: DatabaseProduct = {
        ...data,
        image_url: data.image_url || '/placeholder-product.jpg',
        weight: data.weight || '0g',
        color_theme: data.color_theme || '#8B5CF6',
        ...(data.metadata && typeof data.metadata === 'object' ? data.metadata : {}),
        features: data.features || this.getDefaultFeatures(data.tier),
        type: data.type || 'art',
        strain: data.strain || this.getDefaultStrain(data.tier)
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
        .eq('tier', tier)
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (error) {
        console.error('Database Error - Products by Tier:', error);
        return {
          error: `Failed to fetch ${tier} products: ${error.message}`,
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
    const featureMap: Record<string, string[]> = {
      'Starter': ['Digital Art Print', 'Complimentary Gift', '3.5g Flower'],
      'Classic': ['Double Art Series', 'Signature Collection', 'Two Curated Gifts', '7g Flower'],
      'Black': ['Limited Collection', 'Premium Prints', 'Four Premium Gifts', '14g Premium Flower'],
      'Ultra': ['Exclusive Gallery Pieces', 'Eight Premium Selections', '28g Premium Collection', 'VIP Experience']
    };
    return featureMap[tier] || ['Premium Art Experience'];
  }

  /**
   * Get default strain based on tier
   */
  private static getDefaultStrain(tier: string): string {
    const strainMap: Record<string, string> = {
      'Starter': 'House Blend',
      'Classic': 'Signature Strain',
      'Black': 'Premium Selection',
      'Ultra': 'Exclusive Reserve'
    };
    return strainMap[tier] || 'Curated Selection';
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
