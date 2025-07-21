'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/models/Product';
import { ProductController } from '@/controllers/ProductController';
import { useCartStore } from '@/services/CartService';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

/**
 * ProductsPresenter component for displaying products
 * This follows the Presenter part of the MCP pattern
 */
export default function ProductsPresenter() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Access cart store functions
  const { addItem } = useCartStore();

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      setError(null);
      
      try {
        const result = await ProductController.getAllProducts();
        
        if (result.error) {
          setError(result.error);
        } else if (result.data) {
          setProducts(result.data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    }
    
    loadProducts();
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  // Helper function to get color class based on tier
  const getTierColorClass = (tier: string) => {
    switch (tier) {
      case 'Starter':
        return 'bg-pink-500';
      case 'Classic':
        return 'bg-violet-500';
      case 'Black':
        return 'bg-gray-800';
      case 'Ultra':
        return 'bg-indigo-600';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">Art Collection</h2>
        
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            <p>Error loading products: {error}</p>
          </div>
        )}
        
        {!loading && !error && products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No products available</p>
          </div>
        )}
        
        {!loading && products.length > 0 && (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {products.map((product) => (
              <motion.div 
                key={product.id} 
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-all hover:shadow-xl"
                variants={itemVariants}
              >
                <div className="relative">
                  <div className={`absolute top-0 right-0 ${getTierColorClass(product.tier)} text-white px-3 py-1 text-sm font-medium rounded-bl-lg`}>
                    {product.tier}
                  </div>
                  <img 
                    src={product.image_url || `/images/placeholder-${
                      product.tier.toLowerCase() === 'starter' ? 'pink' :
                      product.tier.toLowerCase() === 'classic' ? 'violet' :
                      product.tier.toLowerCase() === 'black' ? 'black' :
                      'indigo'
                    }.svg`} 
                    alt={product.name}
                    className="w-full h-64 object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      // Fallback to Cannè mural if placeholder fails
                      if (!target.src.includes('canne-mural.svg')) {
                        target.src = '/images/canne-mural.svg';
                      }
                    }}
                  />
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{product.name}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">{product.description}</p>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold">${product.price}</span>
                    <button 
                      onClick={() => {
                        addItem(product);
                        toast.success(`Added ${product.tier} tier to cart`);
                      }}
                      className={`px-4 py-2 rounded-lg text-white ${getTierColorClass(product.tier)} hover:opacity-90 transition-opacity`}
                    >
                      Add to Cart
                    </button>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                      <span>Weight: {product.weight}</span>
                      <span className="flex items-center">
                        <span 
                          className="inline-block w-3 h-3 rounded-full mr-1"
                          style={{ backgroundColor: product.color_theme.split('/')[0].toLowerCase() }}
                        ></span>
                        {product.color_theme}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
