'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useCartStore } from '@/services/CartService';
import { DatabaseProduct } from '@/services/DatabaseService';
import { useProducts } from '@/hooks/useProducts';
import toast from 'react-hot-toast';
import { ShoppingBag, Star, Zap, Shield, Gift, Loader2, AlertCircle, ChevronDown } from 'lucide-react';
import Link from 'next/link';

// Strain options
interface StrainOption {
  name: string;
  type: string;
  thcLow: number;
  thcHigh: number;
}

const strainOptions: StrainOption[] = [
  { name: 'Moroccan Peach', type: 'sativa', thcLow: 18, thcHigh: 22 },
  { name: 'Pancake Biscotti', type: 'indica-hybrid', thcLow: 22, thcHigh: 26 }
];

export default function ShopPage() {
  const { addItem, hydrateCart, items } = useCartStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [sortBy, setSortBy] = useState<'price' | 'name' | 'tier'>('price');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Strain selection state
  const [selectedStrains, setSelectedStrains] = useState<Record<string, StrainOption>>({});

  // Use MCP-aligned products hook
  const {
    products,
    loading,
    error,
    count,
    searchProducts,
    getProductsByTier,
    testConnection,
    refresh,
    clearError
  } = useProducts({
    autoFetch: true,
    searchTerm,
    sortBy,
    sortOrder
  });

  // Test database connection on mount
  useEffect(() => {
    const initializeDatabase = async () => {
      const isConnected = await testConnection();
      if (!isConnected) {
        toast.error('Database connection failed. Please check your internet connection.');
      }
    };

    initializeDatabase();
    hydrateCart();
  }, [testConnection, hydrateCart]);

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

  // Helper functions for strain management
  const getSelectedStrain = useCallback((productId: string): StrainOption => {
    return selectedStrains[productId] || strainOptions[0]; // Default to first strain
  }, [selectedStrains]);

  const updateSelectedStrain = useCallback((productId: string, strain: StrainOption) => {
    setSelectedStrains(prev => ({
      ...prev,
      [productId]: strain
    }));
  }, []);

  const handleAddToCart = useCallback((product: DatabaseProduct) => {
    const quantity = quantities[product.id] || 1;
    const selectedStrain = getSelectedStrain(product.id);
    
    // Convert DatabaseProduct to Product format for cart
    const productForCart = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      tier: product.tier,
      weight: product.weight || '0g',
      color_theme: product.color_theme || '#8B5CF6',
      image_url: product.image_url || '/placeholder-product.jpg',
      is_active: product.is_active,
      created_at: product.created_at
    };
    
    addItem(productForCart, selectedStrain, quantity);
    
    // Enhanced success message with strain info
    toast.success(
      `${quantity}x ${product.name} (${selectedStrain.name}) added! FREE cannabis gift included!`,
      {
        id: `add-to-cart-${product.id}`, // Unique ID for toast replacement
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
  }, [quantities, addItem, getSelectedStrain]);
  
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
    return items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
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
      
      <main className="flex-1 container mx-auto px-3 sm:px-4 py-6 sm:py-8 pt-20 sm:pt-24">
        {/* Enhanced header with search and filters */}
        <div className="mb-6 sm:mb-8">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-2 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent px-2"
          >
            Art Collection
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6 px-2"
          >
            Premium Prints • DC‑Only I‑71 Gifts
          </motion.p>
        </div>
        
        {/* Search and filter controls */}
        <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6">
          {/* Search bar */}
          <div className="w-full">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-base"
            />
          </div>
          {/* Tier filter and sort controls */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full">
            {/* Tier filter */}
            <select
              value={selectedTier || ''}
              onChange={(e) => setSelectedTier(e.target.value || null)}
              className="flex-1 px-3 sm:px-4 py-2.5 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-base"
            >
              <option value="">All Tiers</option>
              <option value="Starter">Starter ($25)</option>
              <option value="Classic">Classic ($45)</option>
              <option value="Black">Black ($75)</option>
              <option value="Ultra">Ultra ($140)</option>
            </select>
            {/* Sort controls */}
            <div className="flex gap-2 flex-1 sm:flex-initial">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'price' | 'name' | 'tier')}
                className="flex-1 sm:flex-initial px-3 sm:px-4 py-2.5 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-base"
              >
                <option value="price">Price</option>
                <option value="name">Name</option>
                <option value="tier">Tier</option>
              </select>
              
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                className="flex-1 sm:flex-initial px-3 sm:px-4 py-2.5 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-base"
              >
                <option value="asc">↑</option>
                <option value="desc">↓</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Products grid with enhanced loading and empty states */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
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
                  className="rounded-xl shadow-md border px-4 sm:px-6 py-6 sm:py-8 flex flex-col items-center text-center bg-white dark:bg-gray-800 hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
                >
                  {/* Tier badge */}
                  <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${badge.bg}`}>
                    {badge.icon}
                    {product.tier}
                  </div>
                  
                  {/* Product Image */}
                  <div className="w-24 sm:w-32 h-24 sm:h-32 rounded-lg mb-3 sm:mb-4 overflow-hidden shadow-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <img 
                      src={product.image_url || `/images/placeholder-${
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
                  <div className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">
                    ${product.price}
                    {currentQuantity > 1 && (
                      <div className="text-xs sm:text-sm font-normal text-gray-500 dark:text-gray-400 mt-1">
                        Total: ${itemTotal}
                      </div>
                    )}
                  </div>
                  
                  <div className="text-base sm:text-lg mt-2 font-semibold text-gray-900 dark:text-white px-2">{product.name}</div>
                  
                  {/* Dynamic description with strain info */}
                  <div className="mt-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 px-2">
                    {getSelectedStrain(product.id).name} ({getSelectedStrain(product.id).type.charAt(0).toUpperCase() + getSelectedStrain(product.id).type.slice(1)}) · {getSelectedStrain(product.id).thcLow}–{getSelectedStrain(product.id).thcHigh}% THC
                  </div>
                  
                  {/* Strain Selector */}
                  <div className="mt-3 px-2 space-y-2">
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Strain</label>
                    <div className="relative">
                      <select
                        value={getSelectedStrain(product.id).name}
                        onChange={(e) => {
                          const selectedStrain = strainOptions.find(s => s.name === e.target.value);
                          if (selectedStrain) {
                            updateSelectedStrain(product.id, selectedStrain);
                          }
                        }}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-xs focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none cursor-pointer"
                      >
                        {strainOptions.map((strain) => (
                          <option key={strain.name} value={strain.name}>
                            {strain.name} • {strain.type} • {strain.thcLow}–{strain.thcHigh}% THC
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  
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
                  <div className="mt-3 sm:mt-4 flex items-center justify-center space-x-2 border rounded-lg overflow-hidden w-full bg-gray-50 dark:bg-gray-700">
                    <button 
                      onClick={() => updateQuantity(product.id, Math.max(1, currentQuantity - 1))}
                      disabled={currentQuantity <= 1}
                      className="w-10 h-10 flex items-center justify-center bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>
                    
                    <div className="w-12 sm:w-16 text-center">
                      <span className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">{currentQuantity}</span>
                      {currentQuantity > 1 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">items</div>
                      )}
                    </div>
                    
                    <button 
                      onClick={() => updateQuantity(product.id, currentQuantity + 1)}
                      disabled={currentQuantity >= 10}
                      className="w-10 h-10 flex items-center justify-center bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                
                  {/* Enhanced add to cart button */}
                  <button
                    className="mt-3 sm:mt-4 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-white w-full font-semibold transition bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 active:scale-95 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl touch-manipulation min-h-[44px]"
                    onClick={() => handleAddToCart(product)}
                  >
                    <ShoppingBag size={14} className="sm:w-4 sm:h-4" />
                    <span className="text-sm sm:text-base">
                      {currentQuantity > 1 ? `Add ${currentQuantity}` : 'Add to Cart'}
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
              className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl shadow-2xl z-50 flex items-center space-x-2 sm:space-x-3 hover:from-pink-600 hover:to-purple-600 active:scale-95 transition-all duration-200 touch-manipulation min-h-[44px]"
            >
              <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5" />
              <div className="flex flex-col items-start">
                <span className="font-semibold text-sm sm:text-base">Checkout</span>
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
