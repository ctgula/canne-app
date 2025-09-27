'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/models/Product';
import { ProductController } from '@/controllers/ProductController';
import { useCartStore, StrainOption } from '@/services/CartService';
import { toast } from 'react-hot-toast';
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
    <div className="py-16 bg-gradient-to-b from-gray-50/50 to-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full text-purple-600 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Premium Collection
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-600 text-transparent bg-clip-text mb-6">
            Cannè Art Collection
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Choose your tier — each includes exclusive digital art with complimentary cannabis gifts
          </p>
        </div>

        {loading && (
          <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden animate-pulse">
                {/* Image skeleton */}
                <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 p-6">
                  <div className="w-full h-full rounded-xl bg-gray-300"></div>
                </div>
                
                {/* Content skeleton */}
                <div className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="h-6 bg-gray-200 rounded-lg mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded-lg w-3/4"></div>
                    </div>
                    <div className="w-8 h-6 bg-gray-200 rounded-full"></div>
                  </div>
                  
                  <div className="h-8 bg-gray-200 rounded-lg w-20"></div>
                  
                  <div className="h-16 bg-gray-100 rounded-xl"></div>
                  
                  <div className="flex gap-2">
                    <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                    <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                  </div>
                  
                  <div className="h-12 bg-gray-200 rounded-xl"></div>
                  <div className="h-14 bg-gray-200 rounded-xl"></div>
                  <div className="h-6 bg-gray-200 rounded-lg w-32 mx-auto"></div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {error && (
          <div className="max-w-md mx-auto bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl mb-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-5 h-5 rounded-full bg-red-200 flex items-center justify-center">
                <span className="text-red-600 text-sm">!</span>
              </div>
              <p className="font-semibold">Unable to load products</p>
            </div>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        
        {!loading && !error && products.length === 0 && (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Products Available</h3>
              <p className="text-gray-500">Our art collection is currently being updated. Please check back soon!</p>
            </div>
          </div>
        )}
        
        {!loading && products.length > 0 && (
          <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => {
              const effectChips = (product.badges || []).map(effect => {
                const effectMap: Record<string, string> = {
                  'Focus': 'bg-blue-50 text-blue-700 border-blue-200',
                  'Creative': 'bg-purple-50 text-purple-700 border-purple-200', 
                  'Chill': 'bg-green-50 text-green-700 border-green-200'
                };
                return {
                  name: effect,
                  className: effectMap[effect] || 'bg-gray-50 text-gray-700 border-gray-200'
                };
              });

              const giftByTier: Record<string, string> = { Starter: '3.5g', Classic: '7g', Black: '14g', Ultra: '28g' };
              const gift = product.gift_grams || giftByTier[product.tier as keyof typeof giftByTier] || '';
              
              // Get tier-specific styling
              const getTierStyling = (tier: string) => {
                switch (tier.toLowerCase()) {
                  case 'starter':
                    return {
                      gradient: 'from-blue-500 to-cyan-500',
                      bg: 'bg-gradient-to-br from-blue-50 to-cyan-50',
                      badge: 'bg-blue-100 text-blue-800 border-blue-200'
                    };
                  case 'classic':
                    return {
                      gradient: 'from-purple-500 to-violet-500',
                      bg: 'bg-gradient-to-br from-purple-50 to-violet-50',
                      badge: 'bg-purple-100 text-purple-800 border-purple-200'
                    };
                  case 'black':
                    return {
                      gradient: 'from-gray-700 to-slate-700',
                      bg: 'bg-gradient-to-br from-gray-50 to-slate-50',
                      badge: 'bg-gray-100 text-gray-800 border-gray-200'
                    };
                  case 'ultra':
                    return {
                      gradient: 'from-pink-500 to-rose-500',
                      bg: 'bg-gradient-to-br from-pink-50 to-rose-50',
                      badge: 'bg-pink-100 text-pink-800 border-pink-200'
                    };
                  default:
                    return {
                      gradient: 'from-gray-500 to-gray-600',
                      bg: 'bg-gradient-to-br from-gray-50 to-gray-100',
                      badge: 'bg-gray-100 text-gray-800 border-gray-200'
                    };
                }
              };

              const tierStyle = getTierStyling(product.tier || '');

              return (
                <div 
                  key={product.id} 
                  className="group relative bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl hover:border-gray-200 transition-all duration-300 overflow-hidden"
                >
                  {/* Premium Badge for Ultra */}
                  {product.tier?.toLowerCase() === 'ultra' && (
                    <div className="absolute top-4 right-4 z-10 px-3 py-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold rounded-full shadow-lg">
                      PREMIUM
                    </div>
                  )}

                  {/* Image Section */}
                  <div className="relative overflow-hidden">
                    <div className={`aspect-[4/3] ${tierStyle.bg} p-6`}>
                      <div className="relative w-full h-full rounded-xl overflow-hidden bg-white/50 backdrop-blur-sm">
                        <img 
                          src={product.image_url} 
                          alt={`Cannè ${product.tier}`}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/images/canne-mural.svg';
                          }}
                        />
                      </div>
                    </div>
                    
                    {/* Tier Badge */}
                    <div className="absolute bottom-4 left-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-bold border ${tierStyle.badge}`}>
                        {product.tier}
                      </span>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-6 space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{product.name}</h3>
                        <p className="text-sm text-gray-600">Digital Art + Complimentary Gift</p>
                      </div>
                      <span className="px-2 py-1 bg-red-50 text-red-700 border border-red-200 rounded-full text-xs font-bold">
                        21+
                      </span>
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-2">
                      <span className={`text-3xl font-bold bg-gradient-to-r ${tierStyle.gradient} text-transparent bg-clip-text`}>
                        ${product.price}
                      </span>
                      <span className="text-sm text-gray-500">+ delivery</span>
                    </div>

                    {/* Gift Info */}
                    <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                      <div className="flex items-center gap-2 text-green-700">
                        <Sparkles className="w-4 h-4" />
                        <span className="text-sm font-semibold">Includes {gift} complimentary gift</span>
                      </div>
                    </div>

                    {/* Effects */}
                    {effectChips.length > 0 && (
                      <div className="flex gap-2 flex-wrap">
                        {effectChips.slice(0, 3).map((chip, i) => (
                          <span key={i} className={`px-3 py-1 rounded-full text-xs font-medium border ${chip.className}`}>
                            {chip.name}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Strain Selector */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Choose Strain</label>
                      <select
                        value={getSelectedStrain(product.id).name}
                        onChange={(e) => {
                          const found = strainOptions.find((s) => s.name === e.target.value);
                          if (found) updateSelectedStrain(product.id, found);
                        }}
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all touch-manipulation min-h-[48px]"
                      >
                        {strainOptions.map((strain) => (
                          <option key={strain.name} value={strain.name}>
                            {strain.name} • {strain.type} • {strain.thcLow}–{strain.thcHigh}% THC
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Add to Cart Button */}
                    <button
                      onClick={() => {
                        const selectedStrain = getSelectedStrain(product.id);
                        addItem(product, selectedStrain);
                        toast.success(`Added ${product.name} to cart! 🎨`);
                      }}
                      disabled={product.stock <= 0}
                      className={`w-full px-6 py-4 rounded-xl font-bold text-lg transition-all duration-200 touch-manipulation min-h-[56px] ${
                        product.stock <= 0
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : `bg-gradient-to-r ${tierStyle.gradient} text-white hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] shadow-md`
                      }`}
                    >
                      {product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>

                    {/* Stock Status */}
                    {product.stock > 0 && (
                      <div className="flex items-center justify-center gap-2 text-sm text-green-600">
                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                        <span className="font-medium">In Stock • Fast Delivery</span>
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
