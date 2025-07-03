'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useCartStore } from '@/services/CartService';
import { Product as DatabaseProduct } from '@/models/Product';
import toast from 'react-hot-toast';
import { ShoppingBag } from 'lucide-react';
import Link from 'next/link';

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
  const [filteredProducts, setFilteredProducts] = useState<ShopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  useEffect(() => {
    // In a real app, this would fetch from your API
    // For now, we'll use mock data based on the tiers
    const mockProducts: ShopProduct[] = [
      // Starter Tier ($25)
      {
        id: 'starter-1',
        name: 'Sunrise Haze Art Print',
        tier: 'Starter',
        price: 25,
        description: 'Digital art print + FREE premium flower (3.5g)',
        image: '/images/products/starter-1.jpg',
        type: 'art',
        features: [
          'High-resolution digital artwork',
          'FREE Sativa flower (18-22% THC)',
          'Same-day delivery available'
        ]
      },
      {
        id: 'starter-2',
        name: 'Urban Vibes Collection',
        tier: 'Starter',
        price: 25,
        description: 'Digital art collection + FREE premium flower (3.5g)',
        image: '/images/products/starter-2.jpg',
        type: 'art',
        features: [
          'Exclusive digital collection',
          'FREE Indica flower (18-22% THC)',
          'Limited edition release'
        ]
      },
      
      // Classic Tier ($45)
      {
        id: 'classic-1',
        name: 'Dreamscape Series',
        tier: 'Classic',
        price: 45,
        description: 'Premium art series + FREE premium flower (7g)',
        image: '/images/products/classic-1.jpg',
        type: 'art',
        features: [
          'Signature digital artwork series',
          'FREE Hybrid flower (20-24% THC)',
          'Access to digital gallery'
        ]
      },
      {
        id: 'classic-2',
        name: 'Neon Nights Collection',
        tier: 'Classic',
        price: 45,
        description: 'Classic tier art + FREE premium flower (7g)',
        image: '/images/products/classic-2.jpg',
        type: 'art',
        features: [
          'Vibrant digital art collection',
          'FREE Sativa flower (20-24% THC)',
          'Artist signed digital certificate'
        ]
      },
      
      // Black Tier ($75)
      {
        id: 'black-1',
        name: 'Midnight Abstractions',
        tier: 'Black',
        price: 75,
        description: 'Limited collection + FREE premium flower (14g)',
        image: '/images/products/black-1.jpg',
        type: 'art',
        features: [
          'Exclusive black tier artwork',
          'FREE Premium Indica flower (24-28% THC)',
          'VIP digital art experience'
        ]
      },
      {
        id: 'black-2',
        name: 'Urban Shadows Series',
        tier: 'Black',
        price: 75,
        description: 'Premium black tier art + FREE premium flower (14g)',
        image: '/images/products/black-2.jpg',
        type: 'art',
        features: [
          'Limited edition series',
          'FREE Premium Hybrid flower (24-28% THC)',
          'Exclusive collector access'
        ]
      },
      
      // Ultra Tier ($140)
      {
        id: 'ultra-1',
        name: 'Ultra Masterpiece',
        tier: 'Ultra',
        price: 140,
        description: 'Our highest-tier digital art + FREE premium flower (28g)',
        image: '/images/products/ultra-1.jpg',
        type: 'art',
        features: [
          'Museum-quality digital masterpiece',
          'FREE Elite Quality flower (28-32% THC)',
          'Lifetime gallery membership'
        ]
      },
      {
        id: 'ultra-2',
        name: 'Ultra Exclusive Collection',
        tier: 'Ultra',
        price: 140,
        description: 'Elite digital art + FREE premium flower (28g)',
        image: '/images/products/ultra-2.jpg',
        type: 'art',
        features: [
          'Collector\'s edition digital art',
          'FREE Elite Quality flower (28-32% THC)',
          'Private viewing experience'
        ]
      }
    ];
    
    setProducts(mockProducts);
    setFilteredProducts(mockProducts);
    setLoading(false);
  }, []);

  // Hydration now happens in the product fetch useEffect

  // Filter products based on search term and selected tier
  useEffect(() => {
    let filtered = products;
    
    // Apply tier filter if selected
    if (selectedTier) {
      filtered = filtered.filter(product => product.tier === selectedTier);
    }
    
    // Apply search term filter
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredProducts(filtered);
  }, [searchTerm, products, selectedTier]);

  const handleAddToCart = (product: ShopProduct) => {
    const quantity = quantities[product.id] || 1;
    
    // Add the product to cart with specified quantity in one operation
    addItem(product as unknown as DatabaseProduct, quantity);
    
    toast.success(`${quantity} ${product.name} added to cart!`);
    
    // Reset quantity after adding to cart
    setQuantities(prev => ({
      ...prev,
      [product.id]: 1
    }));
  };
  
  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return; // Don't allow quantities less than 1
    
    setQuantities(prev => ({
      ...prev,
      [productId]: newQuantity
    }));
  };

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
            Each art purchase includes a <span className="font-semibold">FREE premium cannabis gift</span>. I-71 compliant.
          </p>
          
          {/* Tier filter buttons */}
          <div className="flex gap-3 mb-6 justify-center mt-8">
            {['Starter', 'Classic', 'Black', 'Ultra'].map(tier => (
              <button
                key={tier}
                onClick={() => setSelectedTier(selectedTier === tier ? null : tier)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                  selectedTier === tier ? 'bg-black text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {tier}
              </button>
            ))}
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
            filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                variants={itemVariants}
                className="rounded-xl shadow-md border px-6 py-8 flex flex-col items-center text-center bg-white dark:bg-gray-800 hover:shadow-lg transition-all duration-300"
              >
                <div className="text-3xl font-bold text-gray-800 dark:text-white">${product.price}</div>
                <div className="text-lg mt-2 font-semibold">{product.name}</div>
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">{product.description}</div>
                <ul className="mt-4 space-y-1 text-sm text-gray-500 text-left w-full">
                  {product.features?.map(feature => (
                    <li key={feature}>✅ {feature}</li>
                  ))}
                </ul>
                <div className="mt-4 flex items-center justify-center space-x-2 border rounded-lg overflow-hidden w-full">
                  <button 
                    onClick={() => updateQuantity(product.id, Math.max(1, (quantities[product.id] || 1) - 1))}
                    className="w-10 h-10 flex items-center justify-center bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold transition-colors"
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  
                  <span className="w-10 text-center font-medium">{quantities[product.id] || 1}</span>
                  
                  <button 
                    onClick={() => updateQuantity(product.id, (quantities[product.id] || 1) + 1)}
                    className="w-10 h-10 flex items-center justify-center bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold transition-colors"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
                
                <button
                  className="mt-3 px-4 py-3 rounded-lg text-white w-full font-semibold transition bg-gradient-to-r from-pink-500 to-purple-500 hover:opacity-90 flex items-center justify-center space-x-2"
                  onClick={() => handleAddToCart(product)}
                >
                  <ShoppingBag size={16} />
                  <span>Add to Cart</span>
                </button>
              </motion.div>
            ))
          )}
        </motion.div>
        
        {/* Checkout button */}
        {items.length > 0 && (
          <Link href="/checkout">
            <button className="fixed bottom-6 right-6 bg-black text-white px-6 py-3 rounded-xl shadow-lg z-50 flex items-center space-x-2">
              <ShoppingBag className="h-5 w-5" />
              <span>Checkout ({items.length})</span>
            </button>
          </Link>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
