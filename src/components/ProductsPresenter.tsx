'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/models/Product';
import { ProductController } from '@/controllers/ProductController';
import { useCartStore, StrainOption } from '@/services/CartService';
import { toast } from 'react-hot-toast';
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
    async function loadProducts() {
      setLoading(true);
      setError(null);
      
      try {
        const result = await ProductController.getAllProducts();
        
        if (result.error) {
          setError(result.error);
        } else if (result.data) {
          // Ensure ascending price order (25, 45, 75, 150)
          const sorted = [...result.data].sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
          setProducts(sorted);
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
    <div className="py-12">
      <div className="mx-auto max-w-[1280px] px-6">
        <h1 className="text-3xl font-semibold text-center mb-6">Cannè Art Collection</h1>
        <p className="text-center text-gray-600 mb-8">
          Choose your tier, all include Cannè art stickers + gifts
        </p>

        {loading && (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
                <div className="aspect-square bg-gray-200 rounded-lg mb-4"></div>
                <div className="space-y-3">
                  <div className="h-6 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
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

              const parts: string[] = [];
              if (product.strain) parts.push(product.strain);
              if (typeof product.thc_min === 'number' && typeof product.thc_max === 'number') {
                parts.push(`${product.thc_min}–${product.thc_max}% THC`);
              }
              const giftByTier: Record<string, string> = { Starter: '3.5g', Classic: '7g', Black: '14g', Ultra: '28g' };
              const gift = product.gift_grams || giftByTier[product.tier as keyof typeof giftByTier] || '';
              if (gift) parts.push(`Includes Cannè art stickers + ${gift} complimentary gift`);
              const description = parts.join(' • ');

              return (
                <div 
                  key={product.id} 
                  className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 group flex flex-col"
                >
                  {/* Image */}
                  <div className="relative overflow-hidden rounded-t-xl">
                    <div className="aspect-square bg-gradient-to-br from-pink-100 to-purple-100">
                      <img 
                        src={product.image_url} 
                        alt={`Cannè ${product.tier}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/images/canne-mural.svg';
                        }}
                      />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-bold">{product.name}</h3>
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">21+</span>
                    </div>

                    <div className="text-3xl font-bold text-gray-900 mb-4">${product.price}</div>

                    <p className="text-gray-600 text-sm mb-4 flex-1">{description}</p>

                    <div className="flex gap-1 mb-4 flex-wrap">
                      {effectChips.slice(0, 3).map((chip, i) => (
                        <span key={i} className={`px-2 py-1 rounded-full text-xs font-medium ${chip.className}`}>{chip.name}</span>
                      ))}
                    </div>

                    {/* Strain Selector */}
                    <div className="mb-4">
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Strain</label>
                      <select
                        value={getSelectedStrain(product.id).name}
                        onChange={(e) => {
                          const found = strainOptions.find((s) => s.name === e.target.value);
                          if (found) updateSelectedStrain(product.id, found);
                        }}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        {strainOptions.map((strain) => (
                          <option key={strain.name} value={strain.name}>
                            {strain.name} • {strain.type} • {strain.thcLow}–{strain.thcHigh}% THC
                          </option>
                        ))}
                      </select>
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
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'bg-purple-600 text-white hover:bg-purple-700 hover:scale-[1.02] shadow-sm focus:ring-2 focus:ring-purple-500 focus:ring-offset-2'
                      }`}
                    >
                      {product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>

                    {product.stock > 0 && (
                      <div className="flex items-center justify-center mt-3 text-sm text-green-600">
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400"></span>In Stock</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Art Sample Modal */}
      <ArtSampleModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        tier={selectedTier}
        tierData={{ strainType: selectedTier, effects: ['Focus', 'Creative'], artStyle: 'Cannè Stickers', giftAmount: 'Complimentary gift' }}
      />
    </div>
  );
}
