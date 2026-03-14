'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/models/Product';
import { ProductController } from '@/controllers/ProductController';
import { useCartStore, StrainOption } from '@/services/CartService';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import { Sparkles } from 'lucide-react';
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
  const [selectedStrains, setSelectedStrains] = useState<Record<string, StrainOption>>({});

  // Access cart store functions
  const { addItem } = useCartStore();

  // Available strain options for all tiers
  const strainOptions: StrainOption[] = [
    {
      name: "Moroccan Peach",
      type: "sativa",
      thcLow: 18,
      thcHigh: 22
    },
    {
      name: "Pancake Biscotti",
      type: "indica-hybrid",
      thcLow: 22,
      thcHigh: 26
    }
  ];

  // Get selected strain for a product (default to first option)
  const getSelectedStrain = (productId: string): StrainOption => {
    return selectedStrains[productId] || strainOptions[0];
  };

  // Update selected strain for a product
  const updateSelectedStrain = (productId: string, strain: StrainOption) => {
    setSelectedStrains(prev => ({
      ...prev,
      [productId]: strain
    }));
  };

  useEffect(() => {
    let cancelled = false;
    
    async function loadProducts() {
      setError(null);
      
      try {
        const result = await ProductController.getAllProducts();
        if (cancelled) return;
        
        if (result.error) {
          setError(result.error);
        } else if (result.data) {
          // Ensure ascending price order (25, 45, 75, 150)
          const sorted = [...result.data].sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
          setProducts(sorted);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    
    loadProducts();
    return () => { cancelled = true; };
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

  // Helper function to get color class based on tier - Updated with new brand colors
  const getTierColorClass = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'starter':
        return 'bg-[#38BDF8]'; // Sky blue
      case 'classic':
        return 'bg-[#C084FC]'; // Purple
      case 'black':
        return 'bg-[#64748B]'; // Slate gray
      case 'ultra':
        return 'bg-[#F472B6]'; // Pink
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div>
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Cannè Art Collection</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Choose your tier — each includes exclusive digital art with complimentary cannabis gifts
        </p>
      </div>

      <div>
        {loading && (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
                <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
                <div className="space-y-3">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-md mb-6">
            <p>Error loading products: {error}</p>
          </div>
        )}
        
        {!loading && !error && products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No products available</p>
          </div>
        )}
        
        {!loading && products.length > 0 && (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
            {products.map((product) => {
              const effectChips = (product.badges || []).map(effect => {
                const effectMap: Record<string, string> = {
                  'Focus': 'bg-blue-100 text-blue-800',
                  'Creative': 'bg-purple-100 text-purple-800', 
                  'Chill': 'bg-green-100 text-green-800'
                };
                return {
                  name: effect,
                  className: effectMap[effect] || 'bg-gray-100 text-gray-800'
                };
              });

              // Use the actual product description from the database
              const description = product.description || '';

              return (
                <div 
                  key={product.id} 
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200 group flex flex-col"
                >
                  {/* Image */}
                  <div className="relative overflow-hidden rounded-t-xl">
                    <div 
                      className="aspect-square bg-gradient-to-br from-pink-100 to-purple-100"
                      style={{ backgroundImage: `url(/images/canne-mural.svg)`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                    >
                      {product.image_url && (
                        <Image 
                          src={product.image_url} 
                          alt={`Cannè ${product.name}`}
                          width={400}
                          height={400}
                          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${product.stock <= 0 ? 'opacity-50 grayscale' : ''}`}
                          priority={product.tier.toLowerCase() === 'starter' || product.tier.toLowerCase() === 'classic'}
                        />
                      )}
                    </div>
                    {product.stock <= 0 && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="bg-gray-900/80 text-white text-sm font-bold px-4 py-2 rounded-full tracking-wider uppercase">
                          Sold Out
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">{product.name}</h3>
                      <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 rounded-full text-xs font-semibold">21+</span>
                    </div>

                    <div className="text-3xl font-bold text-gray-900 dark:text-white mb-4">${product.price}</div>

                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 flex-1">{description}</p>

                    <div className="flex gap-1 mb-4 flex-wrap">
                      {effectChips.slice(0, 3).map((chip, i) => (
                        <span key={i} className={`px-2 py-1 rounded-full text-xs font-medium ${chip.className}`}>{chip.name}</span>
                      ))}
                    </div>

                    {/* Strain Selector */}
                    <div className="mb-4">
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Strain</label>
                      <select
                        value={getSelectedStrain(product.id).name}
                        onChange={(e) => {
                          const found = strainOptions.find((s) => s.name === e.target.value);
                          if (found) updateSelectedStrain(product.id, found);
                        }}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        {strainOptions.map((strain) => (
                          <option key={strain.name} value={strain.name}>
                            {strain.name} • {strain.type} • {strain.thcLow}–{strain.thcHigh}% THC
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Collectible print badge */}
                    <div className="flex items-center gap-1.5 mb-3 px-3 py-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800/40">
                      <span className="text-purple-500 text-sm">✦</span>
                      <span className="text-xs font-medium text-purple-700 dark:text-purple-300">Includes a collectible digital print — Drop #001</span>
                    </div>

                    <button
                      onClick={() => {
                        const selectedStrain = getSelectedStrain(product.id);
                        addItem(product, selectedStrain);
                        toast.success(`Added ${product.name} to cart! 🎨`);
                      }}
                      disabled={product.stock <= 0}
                      className={`w-full px-4 py-3 rounded-lg font-semibold transition-all text-center ${
                        product.stock <= 0
                          ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                          : 'bg-purple-600 text-white hover:bg-purple-700 hover:scale-[1.02] shadow-sm focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800'
                      }`}
                    >
                      {product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>

                    {product.stock > 0 && product.stock <= 5 && (
                      <div className="flex items-center justify-center mt-3 text-sm text-amber-600 dark:text-amber-400 font-medium">
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>Low Stock — Order Soon</span>
                      </div>
                    )}
                    {product.stock > 5 && (
                      <div className="flex items-center justify-center mt-3 text-sm text-green-600 dark:text-green-400">
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400"></span>In Stock</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Art Sample Modal */}
        <ArtSampleModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          tier={selectedTier}
          tierData={{ strainType: selectedTier, effects: ['Focus', 'Creative'], artStyle: 'Cannè Stickers', giftAmount: 'Complimentary gift' }}
        />
      </div>
    </div>
  );
}
