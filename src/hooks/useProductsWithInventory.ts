import { useState, useEffect } from 'react';

interface ProductWithInventory {
  id: string;
  name: string;
  slug: string;
  description: string;
  price_cents: number;
  price: number; // Computed from price_cents
  tier: 'Starter' | 'Classic' | 'Black' | 'Ultra';
  strain: string;
  thc_range: string;
  is_active: boolean;
  hero_image_url: string;
  image_url: string; // Alias for hero_image_url
  created_at: string;
  updated_at: string;
  weight: string;
  color_theme: string;
  features: string[];
  product_inventory: Array<{
    stock: number;
    low_stock_threshold: number;
    allow_backorder: boolean;
  }>;
}

export type { ProductWithInventory };

export function useProductsWithInventory() {
  const [products, setProducts] = useState<ProductWithInventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/products?active=true');
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      // Transform products to include computed fields
      const transformedProducts = (data.products || []).map((product: any) => ({
        ...product,
        price: product.price_cents / 100,
        image_url: product.hero_image_url || '/placeholder-product.jpg',
        weight: '3.5g', // Default weight
        color_theme: '#8B5CF6', // Default purple theme
        features: ['Premium Quality', 'Lab Tested', 'Fast Delivery'] // Default features
      }));
      setProducts(transformedProducts);
      setError(null);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const getStockStatus = (product: ProductWithInventory) => {
    const inventory = product.product_inventory?.[0];
    if (!inventory) return { status: 'unknown', available: false, stock: 0 };
    
    if (inventory.stock <= 0 && !inventory.allow_backorder) {
      return { status: 'sold_out', available: false, stock: inventory.stock };
    } else if (inventory.stock <= inventory.low_stock_threshold) {
      return { status: 'low_stock', available: true, stock: inventory.stock };
    } else {
      return { status: 'in_stock', available: true, stock: inventory.stock };
    }
  };

  const isProductAvailable = (product: ProductWithInventory) => {
    if (!product.is_active) return false;
    const stockStatus = getStockStatus(product);
    return stockStatus.available;
  };

  return {
    products,
    loading,
    error,
    refetch: fetchProducts,
    getStockStatus,
    isProductAvailable
  };
}
