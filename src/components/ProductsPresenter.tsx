'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/models/Product';
import { ProductController } from '@/controllers/ProductController';
import { useCartStore } from '@/services/CartService';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Eye, Sparkles, Leaf, Brain, Focus, Smile } from 'lucide-react';
import ArtSampleModal from './ArtSampleModal';

/**
 * ProductsPresenter component for displaying products
 * This follows the Presenter part of the MCP pattern
 */
export default function ProductsPresenter() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<string>('');

  // Access cart store functions
  const { addItem } = useCartStore();

  // Gift tier data with strain types and effects
  const getTierData = (tier: string) => {
    const tierData = {
      starter: {
        strainType: 'Hybrid',
        effects: ['Chill', 'Creative'],
        artStyle: 'Digital Prints',
        giftAmount: '3.5g',
        icon: <Leaf className="w-4 h-4" />
      },
      classic: {
        strainType: 'Sativa',
        effects: ['Focus', 'Creative'],
        artStyle: 'Signature Series',
        giftAmount: '7g',
        icon: <Brain className="w-4 h-4" />
      },
      black: {
        strainType: 'Indica',
        effects: ['Chill', 'Relax'],
        artStyle: 'Limited Collection',
        giftAmount: '14g',
        icon: <Smile className="w-4 h-4" />
      },
      ultra: {
        strainType: 'Premium Mix',
        effects: ['Focus', 'Euphoric'],
        artStyle: 'Exclusive Gallery',
        giftAmount: '28g',
        icon: <Sparkles className="w-4 h-4" />
      }
    };
    return tierData[tier.toLowerCase() as keyof typeof tierData] || tierData.starter;
  };

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

  // Simplified animation variants for performance
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.4,
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
            {products.map((product) => {
              const tierData = getTierData(product.tier);
              return (
                <motion.div 
                  key={product.id} 
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden transition-all hover:shadow-xl hover:scale-[1.02] group"
                  variants={itemVariants}
                >
                  {/* Enhanced Image Section with Real Art */}
                  <div className="relative overflow-hidden">
                    {/* Tier Badge */}
                    <div className={`absolute top-4 right-4 ${getTierColorClass(product.tier)} text-white px-3 py-1.5 text-sm font-semibold rounded-full shadow-lg z-10`}>
                      {product.tier.toUpperCase()}
                    </div>
                    
                    {/* Gift Tier Tags */}
                    <div className="absolute top-4 left-4 z-10 space-y-2">
                      {/* Strain Type Tag */}
                      <div className="bg-green-500/90 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                        {tierData.icon}
                        {tierData.strainType}
                      </div>
                      
                      {/* Effects Tags */}
                      <div className="flex flex-wrap gap-1">
                        {tierData.effects.map((effect, index) => (
                          <span key={index} className="bg-purple-500/90 backdrop-blur-sm text-white px-2 py-0.5 rounded-full text-xs font-medium">
                            {effect}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {/* Real Art Image */}
                    <div className="aspect-square bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900/20 dark:to-purple-900/20">
                      <img 
                        src={product.image_url || `/images/art-samples/tier-${product.tier.toLowerCase()}-sample.jpg`} 
                        alt={`${product.name} - ${tierData.artStyle}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          // Fallback to tier-specific art sample
                          if (!target.src.includes('canne-mural.svg')) {
                            target.src = '/images/canne-mural.svg';
                          }
                        }}
                      />
                    </div>
                    
                    {/* Overlay with Art Style Info */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                      <p className="text-white text-sm font-medium">{tierData.artStyle}</p>
                      <p className="text-white/80 text-xs">{tierData.giftAmount} complimentary</p>
                    </div>
                  </div>
                  
                  {/* Enhanced Content Section */}
                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="text-xl font-bold mb-1">{product.name}</h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">{product.description}</p>
                    </div>
                    
                    {/* Price and Gift Amount */}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">${product.price}</span>
                        <p className="text-xs text-gray-500 dark:text-gray-400">+ {tierData.giftAmount} gift</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-green-600 dark:text-green-400">I-71 Compliant</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">DC Delivery</p>
                      </div>
                    </div>
                    
                    {/* Actionable Prompts */}
                    <div className="space-y-3">
                      {/* View Sample Button */}
                      <button 
                        onClick={() => {
                          setSelectedTier(product.tier);
                          setModalOpen(true);
                        }}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors group/btn"
                      >
                        <Eye className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                        <span className="font-medium">View Sample Art</span>
                      </button>
                      
                      {/* Add to Cart Button */}
                      <button 
                        onClick={() => {
                          addItem(product);
                          toast.success(`Added ${product.name} to cart! 🎨`, {
                            icon: '🛍️',
                            style: {
                              background: '#8B5CF6',
                              color: '#fff',
                            },
                          });
                        }}
                        className={`w-full px-4 py-3 rounded-xl text-white font-semibold ${getTierColorClass(product.tier)} hover:opacity-90 transition-all hover:scale-[1.02] shadow-lg`}
                      >
                        Add to Cart • ${product.price}
                      </button>
                    </div>
                    
                    {/* Additional Info */}
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-green-400"></span>
                          In Stock
                        </span>
                        <span>{product.weight}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
      
      {/* Art Sample Modal */}
      <ArtSampleModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        tier={selectedTier}
        tierData={getTierData(selectedTier)}
      />
    </div>
  );
}
