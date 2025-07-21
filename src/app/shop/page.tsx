'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useCartStore } from '@/services/CartService';
import { Product as DatabaseProduct } from '@/models/Product';
import toast from 'react-hot-toast';
import { ShoppingBag, Star, Zap, Shield, Gift } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

// Extended product interface for the shop page
interface ShopProduct {
  id: string;
  name: string;
  tier: 'Starter' | 'Classic' | 'Black' | 'Ultra';
  price: number;
  description: string;
  image: string;
  strain?: string;
  type?: 'art' | 'tie' | 'flower';
  color?: string;
  pattern?: string;
  features?: string[];
}

export default function ShopPage() {
  const { addItem, hydrateCart, items } = useCartStore();
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [sortBy, setSortBy] = useState<'price' | 'name' | 'tier'>('price');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          .order('price', { ascending: true });

        if (error) {
          console.error('Error fetching products:', error);
          toast.error('Failed to load products');
          return;
        }

        // Transform database products to ShopProduct format
        const transformedProducts: ShopProduct[] = data.map(product => ({
          id: product.id,
          name: product.name,
          tier: product.tier.charAt(0).toUpperCase() + product.tier.slice(1) as 'Starter' | 'Classic' | 'Black' | 'Ultra',
          price: parseFloat(product.price),
          description: `${product.description} + FREE premium flower (${product.gift_amount})`,
          image: product.image_url,
          type: 'art' as const,
          features: [
            `${product.tier.charAt(0).toUpperCase() + product.tier.slice(1)} tier digital artwork`,
            `FREE premium flower (${product.gift_amount})`,
            'I-71 compliant gifting',
            'Same-day delivery available',
            ...(product.has_premium_badge ? ['Premium badge included'] : [])
          ]
        }));
        
        setProducts(transformedProducts);
      } catch (err) {
        console.error('Unexpected error:', err);
        toast.error('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
    hydrateCart(); // Hydrate cart when component mounts
  }, [hydrateCart]);

  // Memoized filtered and sorted products for better performance
  const filteredProducts = useMemo(() => {
    let filtered = products;
    
    // Apply tier filter
    if (selectedTier) {
      filtered = filtered.filter(product => product.tier === selectedTier);
    }
    
    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower) ||
        product.tier.toLowerCase().includes(searchLower) ||
        product.features?.some(feature => feature.toLowerCase().includes(searchLower))
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'tier':
          const tierOrder = { 'Starter': 1, 'Classic': 2, 'Black': 3, 'Ultra': 4 };
          comparison = tierOrder[a.tier] - tierOrder[b.tier];
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    return filtered;
  }, [products, selectedTier, searchTerm, sortBy, sortOrder]);

  const handleAddToCart = useCallback((product: ShopProduct) => {
    const quantity = quantities[product.id] || 1;
    
    // Add the product to cart with specified quantity in one operation
    addItem(product as unknown as DatabaseProduct, quantity);
    
    // Enhanced success message with value proposition
    toast.success(
      `🎨 ${quantity} ${product.name} added! FREE cannabis gift included!`,
      {
        duration: 4000,
        style: {
          background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
          color: 'white',
        },
      }
    );
    
    // Reset quantity after adding to cart
    setQuantities(prev => ({
      ...prev,
      [product.id]: 1
    }));
  }, [quantities, addItem]);
  
  const updateQuantity = useCallback((productId: string, newQuantity: number) => {
    if (newQuantity < 1 || newQuantity > 10) return; // Limit quantities between 1-10
    
    setQuantities(prev => ({
      ...prev,
      [productId]: newQuantity
    }));
  }, []);
  
  // Get tier badge styling
  const getTierBadge = useCallback((tier: string) => {
    const badges = {
      'Starter': { bg: 'bg-green-100 text-green-800', icon: <Zap size={12} /> },
      'Classic': { bg: 'bg-blue-100 text-blue-800', icon: <Star size={12} /> },
      'Black': { bg: 'bg-gray-100 text-gray-800', icon: <Shield size={12} /> },
      'Ultra': { bg: 'bg-purple-100 text-purple-800', icon: <Gift size={12} /> }
    };
    return badges[tier as keyof typeof badges] || badges.Starter;
  }, []);
  
  // Calculate total cart value for display
  const cartTotal = useMemo(() => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [items]);

  // Framer Motion variants
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

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-transparent bg-clip-text mb-6">
            Digital Art Collection
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Each art purchase includes a <span className="font-semibold text-green-600">FREE premium cannabis gift</span>. I-71 compliant.
          </p>
          
          {/* Enhanced filters and sorting */}
          <div className="mt-8 space-y-4">
            {/* Tier filter buttons */}
            <div className="flex gap-3 justify-center flex-wrap">
              {['Starter', 'Classic', 'Black', 'Ultra'].map(tier => {
                const badge = getTierBadge(tier);
                return (
                  <button
                    key={tier}
                    onClick={() => setSelectedTier(selectedTier === tier ? null : tier)}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-all flex items-center gap-2 ${
                      selectedTier === tier 
                        ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white border-transparent' 
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    {badge.icon}
                    {tier}
                  </button>
                );
              })}
            </div>
            
            {/* Sort controls */}
            <div className="flex gap-3 justify-center items-center flex-wrap">
              <span className="text-sm text-gray-600 dark:text-gray-400">Sort by:</span>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value as 'price' | 'name' | 'tier')}
                className="px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="price">Price</option>
                <option value="name">Name</option>
                <option value="tier">Tier</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md mx-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search digital art collection..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                ✕
              </button>
            )}
          </div>
        </div>
        
        {/* Grid of product cards */}
        <motion.div 
          className="mt-12 grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {loading ? (
            <div className="col-span-full flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="col-span-full text-center py-20">
              <p className="text-gray-500 text-lg">No products found.</p>
            </div>
          ) : (
            filteredProducts.map((product) => {
              const badge = getTierBadge(product.tier);
              const currentQuantity = quantities[product.id] || 1;
              const itemTotal = product.price * currentQuantity;
              
              return (
                <motion.div
                  key={product.id}
                  variants={itemVariants}
                  className="rounded-xl shadow-md border px-6 py-8 flex flex-col items-center text-center bg-white dark:bg-gray-800 hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
                >
                  {/* Tier badge */}
                  <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${badge.bg}`}>
                    {badge.icon}
                    {product.tier}
                  </div>
                  
                  {/* Product Image */}
                  <div className="w-32 h-32 rounded-lg mb-4 overflow-hidden shadow-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <img 
                      src={product.image || `/images/placeholder-${
                        product.tier === 'Starter' ? 'pink' :
                        product.tier === 'Classic' ? 'violet' :
                        product.tier === 'Black' ? 'black' :
                        'indigo'
                      }.svg`}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.log('Image failed to load:', e.currentTarget.src);
                        const target = e.target as HTMLImageElement;
                        // Try the Cannè logo as ultimate fallback
                        if (!target.src.includes('canne_logo.svg')) {
                          target.src = '/images/canne_logo.svg';
                          target.className = 'w-20 h-20 object-contain';
                        }
                      }}
                      onLoad={() => {
                        console.log('Image loaded successfully');
                      }}
                    />
                  </div>
                  
                  {/* Price with better formatting */}
                  <div className="text-3xl font-bold text-gray-800 dark:text-white">
                    ${product.price}
                    {currentQuantity > 1 && (
                      <div className="text-sm font-normal text-gray-500 dark:text-gray-400 mt-1">
                        Total: ${itemTotal}
                      </div>
                    )}
                  </div>
                  
                  <div className="text-lg mt-2 font-semibold text-gray-900 dark:text-white">{product.name}</div>
                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{product.description}</div>
                  
                  {/* Enhanced features list */}
                  <ul className="mt-4 space-y-1 text-sm text-gray-500 dark:text-gray-400 text-left w-full">
                    {product.features?.slice(0, 3).map(feature => (
                      <li key={feature} className="flex items-center gap-2">
                        <span className="text-green-500">✅</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                    {product.features && product.features.length > 3 && (
                      <li className="text-xs text-gray-400 italic">+{product.features.length - 3} more features</li>
                    )}
                  </ul>
                  
                  {/* FREE gift highlight */}
                  <div className="mt-3 px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-xs font-medium flex items-center gap-1">
                    <Gift size={12} />
                    FREE Cannabis Gift
                  </div>
                  {/* Enhanced quantity selector */}
                  <div className="mt-4 flex items-center justify-center space-x-2 border rounded-lg overflow-hidden w-full bg-gray-50 dark:bg-gray-700">
                    <button 
                      onClick={() => updateQuantity(product.id, Math.max(1, currentQuantity - 1))}
                      disabled={currentQuantity <= 1}
                      className="w-10 h-10 flex items-center justify-center bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>
                    
                    <div className="w-16 text-center">
                      <span className="font-medium text-gray-900 dark:text-white">{currentQuantity}</span>
                      {currentQuantity > 1 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">items</div>
                      )}
                    </div>
                    
                    <button 
                      onClick={() => updateQuantity(product.id, currentQuantity + 1)}
                      disabled={currentQuantity >= 10}
                      className="w-10 h-10 flex items-center justify-center bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                
                  {/* Enhanced add to cart button */}
                  <button
                    className="mt-4 px-4 py-3 rounded-lg text-white w-full font-semibold transition bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 transform hover:scale-105 active:scale-95 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                    onClick={() => handleAddToCart(product)}
                  >
                    <ShoppingBag size={16} />
                    <span>
                      {currentQuantity > 1 ? `Add ${currentQuantity} to Cart` : 'Add to Cart'}
                    </span>
                  </button>
                </motion.div>
              );
            })
          )}
        </motion.div>
        
        {/* Enhanced floating checkout button */}
        {items.length > 0 && (
          <Link href="/checkout">
            <motion.button 
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="fixed bottom-6 right-6 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-4 rounded-xl shadow-2xl z-50 flex items-center space-x-3 hover:from-pink-600 hover:to-purple-600 transform hover:scale-105 transition-all duration-200"
            >
              <ShoppingBag className="h-5 w-5" />
              <div className="flex flex-col items-start">
                <span className="font-semibold">Checkout</span>
                <span className="text-xs opacity-90">
                  {items.length} item{items.length !== 1 ? 's' : ''} • ${cartTotal.toFixed(2)}
                </span>
              </div>
            </motion.button>
          </Link>
        )}
        
        {/* Results summary */}
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          Showing {filteredProducts.length} of {products.length} products
          {selectedTier && ` in ${selectedTier} tier`}
          {searchTerm && ` matching "${searchTerm}"`}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
