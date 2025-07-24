'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { DatabaseService, DatabaseProduct, DatabaseResponse } from '@/services/DatabaseService';
import toast from 'react-hot-toast';

/**
 * MCP-Aligned Products Hook
 * 
 * This hook provides a clean interface between your components and database
 * following Model Context Protocol principles for consistent state management.
 */

export interface UseProductsOptions {
  autoFetch?: boolean;
  tier?: string;
  searchTerm?: string;
  sortBy?: 'price' | 'name' | 'tier';
  sortOrder?: 'asc' | 'desc';
}

export interface UseProductsReturn {
  // Data
  products: DatabaseProduct[];
  loading: boolean;
  error: string | null;
  count: number;
  
  // Actions
  fetchProducts: () => Promise<void>;
  searchProducts: (query: string) => Promise<void>;
  getProductsByTier: (tier: string) => Promise<void>;
  getProductById: (id: string) => Promise<DatabaseProduct | null>;
  testConnection: () => Promise<boolean>;
  
  // Computed values
  filteredProducts: DatabaseProduct[];
  sortedProducts: DatabaseProduct[];
  productsByTier: Record<string, DatabaseProduct[]>;
  
  // Utilities
  refresh: () => Promise<void>;
  clearError: () => void;
}

export function useProducts(options: UseProductsOptions = {}): UseProductsReturn {
  const {
    autoFetch = true,
    tier,
    searchTerm = '',
    sortBy = 'price',
    sortOrder = 'asc'
  } = options;

  // State
  const [products, setProducts] = useState<DatabaseProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [count, setCount] = useState(0);

  // Clear error utility
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Handle database response
  const handleResponse = useCallback(<T,>(response: DatabaseResponse<T>): T | null => {
    if (response.status === 'error') {
      setError(response.error || 'Unknown error occurred');
      toast.error(response.error || 'Database operation failed');
      return null;
    }
    
    clearError();
    if (response.count !== undefined) {
      setCount(response.count);
    }
    return response.data || null;
  }, [clearError]);

  // Fetch all products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await DatabaseService.getProducts();
      const data = handleResponse(response);
      if (data) {
        setProducts(data);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to fetch products');
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [handleResponse]);

  // Search products
  const searchProducts = useCallback(async (query: string) => {
    if (!query.trim()) {
      await fetchProducts();
      return;
    }

    setLoading(true);
    try {
      const response = await DatabaseService.searchProducts(query);
      const data = handleResponse(response);
      if (data) {
        setProducts(data);
      }
    } catch (err) {
      console.error('Error searching products:', err);
      setError('Search failed');
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  }, [fetchProducts, handleResponse]);

  // Get products by tier
  const getProductsByTier = useCallback(async (tierName: string) => {
    setLoading(true);
    try {
      const response = await DatabaseService.getProductsByTier(tierName);
      const data = handleResponse(response);
      if (data) {
        setProducts(data);
      }
    } catch (err) {
      console.error('Error fetching products by tier:', err);
      setError(`Failed to fetch ${tierName} products`);
      toast.error(`Failed to load ${tierName} products`);
    } finally {
      setLoading(false);
    }
  }, [handleResponse]);

  // Get single product by ID
  const getProductById = useCallback(async (id: string): Promise<DatabaseProduct | null> => {
    try {
      const response = await DatabaseService.getProductById(id);
      return handleResponse(response);
    } catch (err) {
      console.error('Error fetching product by ID:', err);
      setError('Failed to fetch product');
      toast.error('Failed to load product');
      return null;
    }
  }, [handleResponse]);

  // Test database connection
  const testConnection = useCallback(async (): Promise<boolean> => {
    try {
      const response = await DatabaseService.testConnection();
      const result = handleResponse(response);
      if (result) {
        toast.success('Database connection successful');
        return true;
      }
      return false;
    } catch (err) {
      console.error('Connection test failed:', err);
      toast.error('Database connection failed');
      return false;
    }
  }, [handleResponse]);

  // Refresh data
  const refresh = useCallback(async () => {
    if (tier) {
      await getProductsByTier(tier);
    } else if (searchTerm) {
      await searchProducts(searchTerm);
    } else {
      await fetchProducts();
    }
  }, [tier, searchTerm, getProductsByTier, searchProducts, fetchProducts]);

  // Computed values
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Filter by tier if specified
    if (tier) {
      filtered = filtered.filter(product => product.tier === tier);
    }

    // Filter by search term
    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.tier.toLowerCase().includes(query) ||
        (product.strain && product.strain.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [products, tier, searchTerm]);

  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];
    
    sorted.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'tier':
          const tierOrder = { 'Starter': 1, 'Classic': 2, 'Black': 3, 'Ultra': 4 };
          aValue = tierOrder[a.tier as keyof typeof tierOrder] || 0;
          bValue = tierOrder[b.tier as keyof typeof tierOrder] || 0;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [filteredProducts, sortBy, sortOrder]);

  const productsByTier = useMemo(() => {
    const grouped: Record<string, DatabaseProduct[]> = {};
    
    products.forEach(product => {
      if (!grouped[product.tier]) {
        grouped[product.tier] = [];
      }
      grouped[product.tier].push(product);
    });

    // Sort each tier's products by price
    Object.keys(grouped).forEach(tier => {
      grouped[tier].sort((a, b) => a.price - b.price);
    });

    return grouped;
  }, [products]);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetchProducts();
    }
  }, [autoFetch, fetchProducts]);

  // Handle tier changes
  useEffect(() => {
    if (tier && products.length > 0) {
      // Products are already filtered in computed values
    }
  }, [tier, products]);

  // Handle search term changes
  useEffect(() => {
    if (searchTerm && autoFetch) {
      const debounceTimer = setTimeout(() => {
        searchProducts(searchTerm);
      }, 300);

      return () => clearTimeout(debounceTimer);
    }
  }, [searchTerm, autoFetch, searchProducts]);

  return {
    // Data
    products,
    loading,
    error,
    count,
    
    // Actions
    fetchProducts,
    searchProducts,
    getProductsByTier,
    getProductById,
    testConnection,
    
    // Computed values
    filteredProducts,
    sortedProducts,
    productsByTier,
    
    // Utilities
    refresh,
    clearError
  };
}

/**
 * Hook for single product management
 */
export function useProduct(id: string | null) {
  const [product, setProduct] = useState<DatabaseProduct | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    try {
      const response = await DatabaseService.getProductById(id);
      if (response.status === 'error') {
        setError(response.error || 'Failed to fetch product');
        toast.error(response.error || 'Failed to load product');
      } else {
        setProduct(response.data || null);
        setError(null);
      }
    } catch (err) {
      console.error('Error fetching product:', err);
      setError('Failed to fetch product');
      toast.error('Failed to load product');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  return {
    product,
    loading,
    error,
    refresh: fetchProduct,
    clearError: () => setError(null)
  };
}
