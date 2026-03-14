'use client';

import { useState, useEffect } from 'react';
import { Product, ProductModel } from '@/models/Product';
import { ProductController } from '@/controllers/ProductController';
import { useCartStore, StrainOption } from '@/services/CartService';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import { Sparkles } from 'lucide-react';
import ArtSampleModal from './ArtSampleModal';

// DB-driven strains — managed from admin, no code changes needed to add/remove

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
  const [strains, setStrains] = useState<StrainOption[]>([]);
  const [globalStrain, setGlobalStrain] = useState<StrainOption | null>(null);

  // Access cart store functions
  const { addItem } = useCartStore();

  async function loadStrains() {
    try {
      const res = await fetch('/api/strains');
      const data = await res.json();
      if (data.strains?.length) {
        const mapped: StrainOption[] = data.strains.map((s: { name: string; type: string }) => ({
          name: s.name,
          type: s.type,
          thcLow: 0,
          thcHigh: 0,
        }));
        setStrains(mapped);
        setGlobalStrain(prev => prev ?? mapped[0]);
      }
    } catch { /* silently keep current strains */ }
  }

  async function loadProducts(bustCache = false) {
    if (bustCache) ProductModel.invalidateCache();
    setError(null);
    try {
      const result = await ProductController.getAllProducts();
      if (result.error) {
        setError(result.error);
      } else if (result.data) {
        const sorted = [...result.data].sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
        setProducts(sorted);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStrains();
    loadProducts();
  }, []);

  // Realtime: refetch products + strains whenever DB changes
  useEffect(() => {
    const channel = supabase
      .channel('catalog-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        loadProducts(true);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'strains' }, () => {
        loadStrains();
      })
      .subscribe();
    return () => { channel.unsubscribe(); };
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
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Cannè Art Collection</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Each tier includes exclusive digital art with a complimentary cannabis gift
        </p>
      </div>

      {/* Global strain toggle — DB-driven, admin manages options */}
      {!loading && products.length > 0 && strains.length > 0 && globalStrain && (
        <div className="flex flex-col items-center gap-3 mb-10">
          <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pick your strain</p>
          <div className="flex gap-3 flex-wrap justify-center">
            {strains.map((s) => {
              const active = globalStrain.name === s.name;
              return (
                <button
                  key={s.name}
                  onClick={() => setGlobalStrain(s)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-full border-2 font-semibold text-sm transition-all ${
                    active
                      ? 'border-purple-600 bg-purple-600 text-white shadow-md scale-105'
                      : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                  }`}
                >
                  <span>{s.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    active ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                  }`}>{s.type}</span>
                </button>
              );
            })}
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            All tiers include the same art — the <span className="font-semibold text-gray-500 dark:text-gray-400">only difference is gift size</span>
          </p>
        </div>
      )}

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
                  'Relax': 'bg-teal-100 text-teal-800',
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
                          src={product.hero_image_url || product.image_url} 
                          alt={`Cannè ${product.name}`}
                          width={400}
                          height={400}
                          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${product.stock <= 0 ? 'opacity-50 grayscale' : ''}`}
                          priority={product.tier.toLowerCase() === 'starter' || product.tier.toLowerCase() === 'classic'}
                        />
                      )}
                    </div>
                    {/* Gift size badge — visible immediately on image */}
                    {product.gift_grams && product.stock > 0 && (
                      <div className="absolute bottom-3 left-3">
                        <span className="bg-black/70 backdrop-blur-sm text-white text-sm font-bold px-3 py-1.5 rounded-full tracking-wide">
                          {product.gift_grams} gift
                        </span>
                      </div>
                    )}
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

                    {/* Price + gift size — the two numbers that matter most */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-3xl font-bold text-gray-900 dark:text-white">${product.price}</div>
                      {product.gift_grams && (
                        <div className="flex flex-col items-end">
                          <span className="text-2xl font-bold text-green-600 dark:text-green-400 leading-none">{product.gift_grams}</span>
                          <span className="text-xs text-gray-400 dark:text-gray-500 font-medium mt-0.5">complimentary gift</span>
                        </div>
                      )}
                    </div>

                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 flex-1">{description}</p>

                    <div className="flex gap-1 mb-4 flex-wrap">
                      {effectChips.slice(0, 3).map((chip, i) => (
                        <span key={i} className={`px-2 py-1 rounded-full text-xs font-medium ${chip.className}`}>{chip.name}</span>
                      ))}
                    </div>

                    {/* Gift details — strain from global selection + tier THC range */}
                    <div className="flex items-center justify-between mb-4 px-3 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        {globalStrain?.name ?? '—'} <span className="text-gray-400">• {globalStrain?.type}</span>
                      </span>
                      {(product.thc_min || product.thc_max) && (
                        <span className="text-xs font-semibold text-green-700 dark:text-green-400">
                          {product.thc_min}–{product.thc_max}% THC
                        </span>
                      )}
                    </div>

                    {/* Collectible print badge */}
                    <div className="flex items-center gap-1.5 mb-3 px-3 py-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800/40">
                      <span className="text-purple-500 text-sm">✦</span>
                      <span className="text-xs font-medium text-purple-700 dark:text-purple-300">Includes a collectible digital print — Drop #001</span>
                    </div>

                    <button
                      onClick={() => {
                        if (!globalStrain) return;
                        // Merge global strain preference with product's tier THC range
                        const strainForCart = {
                          ...globalStrain,
                          thcLow: product.thc_min ?? globalStrain.thcLow,
                          thcHigh: product.thc_max ?? globalStrain.thcHigh,
                        };
                        addItem(product, strainForCart);
                        toast.success(`${product.name} added — ${globalStrain.name}`);
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
