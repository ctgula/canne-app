'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useCartStore } from '@/services/CartService';
import { Product as DatabaseProduct } from '@/models/Product';
import toast from 'react-hot-toast';
import { ShoppingBag } from 'lucide-react';

// Extended product interface for the shop page
interface ShopProduct {
  id: string;
  name: string;
  tier: 'Starter' | 'Classic' | 'Black' | 'Ultra';
  price: number;
  description: string;
  image: string;
  strain?: string;
  type?: 'art' | 'tie';
  color?: string;
  pattern?: string;
}

export default function ShopPage() {
  const { addItem } = useCartStore();
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ShopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // In a real app, this would fetch from your API
    // For now, we'll use mock data based on the tiers
    const mockProducts: ShopProduct[] = [
      // Starter Tier ($25) - Pink
      {
        id: 'starter-1',
        name: 'Sunrise Haze Print',
        tier: 'Starter',
        price: 25,
        description: 'Single digital print + complimentary top-shelf gift (3.5g)',
        image: '/images/products/starter-1.jpg',
        strain: 'Sativa'
      },
      {
        id: 'starter-2',
        name: 'Urban Vibes Print',
        tier: 'Starter',
        price: 25,
        description: 'Single digital print + complimentary top-shelf gift (3.5g)',
        image: '/images/products/starter-2.jpg',
        strain: 'Indica'
      },
      
      // Classic Tier ($45) - Violet
      {
        id: 'classic-1',
        name: 'Dreamscape Series',
        tier: 'Classic',
        price: 45,
        description: 'Double art series with signature + two curated gifts (7g)',
        image: '/images/products/classic-1.jpg',
        strain: 'Hybrid'
      },
      {
        id: 'classic-2',
        name: 'Neon Nights Collection',
        tier: 'Classic',
        price: 45,
        description: 'Double art series with signature + two curated gifts (7g)',
        image: '/images/products/classic-2.jpg',
        strain: 'Sativa'
      },
      
      // Black Tier ($75) - Black/Gray
      {
        id: 'black-1',
        name: 'Midnight Abstractions',
        tier: 'Black',
        price: 75,
        description: 'Limited collection prints + four premium gifts (14g)',
        image: '/images/products/black-1.jpg',
        strain: 'Indica'
      },
      {
        id: 'black-2',
        name: 'Urban Shadows Series',
        tier: 'Black',
        price: 75,
        description: 'Limited collection prints + four premium gifts (14g)',
        image: '/images/products/black-2.jpg',
        strain: 'Hybrid'
      },
      
      // Ultra Tier ($140) - Purple
      {
        id: 'ultra-1',
        name: 'Ultra Collection - Masterpiece',
        tier: 'Ultra',
        price: 140,
        description: 'Our highest-tier digital art offering comes with a heavy, full-ounce gift of high-grade cannabis — elite quality, maximum generosity.',
        image: '/images/products/ultra-1.jpg',
        strain: 'Elite Quality Strain'
      },
      {
        id: 'ultra-2',
        name: 'Ultra Collection - Exclusive',
        tier: 'Ultra',
        price: 140,
        description: 'Premium digital art with 28g high-grade cannabis and maximum gift generosity',
        image: '/images/products/ultra-2.jpg',
        strain: 'Premium Blend'
      },
    ];
    
    // Add flower products with proper strain information
    const flowerProducts: ShopProduct[] = [
      // Starter Tier Flowers
      {
        id: 'flower-starter-1',
        name: 'Premium Flower - Sativa',
        type: 'flower',
        tier: 'Starter',
        price: 25,
        description: 'Top-shelf flower, 3.5g - light complimentary gift',
        image: '/images/products/flower-starter-sativa.jpg',
        strain: 'Sativa Dominant'
      },
      {
        id: 'flower-starter-2',
        name: 'Premium Flower - Indica',
        type: 'flower',
        tier: 'Starter',
        price: 25,
        description: 'Top-shelf flower, 3.5g - light complimentary gift',
        image: '/images/products/flower-starter-indica.jpg',
        strain: 'Indica Dominant'
      },
      
      // Classic Tier Flowers
      {
        id: 'flower-classic-1',
        name: 'Premium Flower - Hybrid',
        type: 'flower',
        tier: 'Classic',
        price: 45,
        description: 'Premium cannabis — for longer sessions and better value, 7g',
        image: '/images/products/flower-classic-hybrid.jpg',
        strain: 'Balanced Hybrid'
      },
      {
        id: 'flower-classic-2',
        name: 'Premium Flower - Sativa',
        type: 'flower',
        tier: 'Classic',
        price: 45,
        description: 'Premium cannabis — for longer sessions and better value, 7g',
        image: '/images/products/flower-classic-sativa.jpg',
        strain: 'Sativa Dominant'
      },
      
      // Black Tier Flowers
      {
        id: 'flower-black-1',
        name: 'Premium Flower - Indica',
        type: 'flower',
        tier: 'Black',
        price: 75,
        description: 'Stronger top-shelf flower — stronger strains, deeper experience, 14g',
        image: '/images/products/flower-black-indica.jpg',
        strain: 'Indica Dominant'
      },
      {
        id: 'flower-black-2',
        name: 'Premium Flower - Hybrid',
        type: 'flower',
        tier: 'Black',
        price: 75,
        description: 'Stronger top-shelf flower — stronger strains, deeper experience, 14g',
        image: '/images/products/flower-black-hybrid.jpg',
        strain: 'Premium Hybrid'
      },
      
      // Ultra Tier Flowers
      {
        id: 'flower-ultra-1',
        name: 'Elite Flower - Premium Blend',
        type: 'flower',
        tier: 'Ultra',
        price: 140,
        description: 'Full-ounce gift of high-grade cannabis — elite quality, maximum generosity, 28g',
        image: '/images/products/flower-ultra-premium.jpg',
        strain: 'Elite Quality Strain'
      },
      {
        id: 'flower-ultra-2',
        name: 'Elite Flower - Signature Blend',
        type: 'flower',
        tier: 'Ultra',
        price: 140,
        description: 'Full-ounce gift of high-grade cannabis — elite quality, maximum generosity, 28g',
        image: '/images/products/flower-ultra-signature.jpg',
        strain: 'Signature Blend'
      }
    ];
    
    // Add tie products
    const tieProducts: ShopProduct[] = [
      // Classic Tier Ties
      {
        id: 'tie-classic-1',
        name: 'Classic Silk Tie - Navy',
        type: 'tie',
        tier: 'Classic',
        price: 45,
        description: 'Premium silk tie with subtle pattern, perfect for formal occasions',
        image: '/images/products/tie-classic-navy.jpg',
        color: 'Navy',
        pattern: 'Subtle'
      },
      {
        id: 'tie-classic-2',
        name: 'Classic Silk Tie - Burgundy',
        type: 'tie',
        tier: 'Classic',
        price: 45,
        description: 'Premium silk tie with subtle pattern, perfect for formal occasions',
        image: '/images/products/tie-classic-burgundy.jpg',
        color: 'Burgundy',
        pattern: 'Subtle'
      },
      
      // Black Tier Ties
      {
        id: 'tie-designer-1',
        name: 'Designer Tie - Abstract',
        type: 'tie',
        tier: 'Black',
        price: 75,
        description: 'Unique designer tie with abstract pattern, makes a bold statement',
        image: '/images/products/tie-designer-abstract.jpg',
        color: 'Multi',
        pattern: 'Abstract'
      },
      {
        id: 'tie-designer-2',
        name: 'Designer Tie - Geometric',
        type: 'tie',
        tier: 'Black',
        price: 75,
        description: 'Unique designer tie with geometric pattern, makes a bold statement',
        image: '/images/products/tie-designer-geometric.jpg',
        color: 'Blue/Gray',
        pattern: 'Geometric'
      },
      
      // Ultra Tier Ties
      {
        id: 'tie-luxury-1',
        name: 'Luxury Silk Tie - Limited Edition',
        type: 'tie',
        tier: 'Ultra',
        price: 140,
        description: 'Limited edition luxury silk tie with premium craftsmanship - our highest-tier offering',
        image: '/images/products/tie-luxury-limited.jpg',
        color: 'Black/Gold',
        pattern: 'Exclusive'
      },
      {
        id: 'tie-luxury-2',
        name: 'Luxury Silk Tie - Signature Collection',
        type: 'tie',
        tier: 'Ultra',
        price: 140,
        description: 'Signature collection luxury silk tie with elite quality materials and maximum generosity',
        image: '/images/products/tie-luxury-signature.jpg',
        color: 'Purple/Silver',
        pattern: 'Signature'
      }
    ];
    
    // Mark existing products as art type
    const artProducts = mockProducts.map(product => ({
      ...product,
      type: 'art' as const
    }));
    
    // Limit to 8 products total as requested
    const limitedFlowerProducts = flowerProducts.slice(0, 8);
    
    // Combine all product types
    const allProducts = [...artProducts, ...limitedFlowerProducts, ...tieProducts];
    setProducts(allProducts);
    setFilteredProducts(allProducts);
    setLoading(false);
  }, []);

  const handleAddToCart = (product: ShopProduct) => {
    // Convert ShopProduct to the expected Product type
    const cartProduct: DatabaseProduct = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      tier: product.tier,
      weight: '',  // Default values for required fields
      color_theme: product.color || '',
      image_url: product.image,
      is_active: true,
      created_at: new Date().toISOString()
    };
    
    addItem(cartProduct);
    toast.success(`Added ${product.name} to cart`);
  };

  const getTierColor = (tier: 'Starter' | 'Classic' | 'Black' | 'Ultra') => {
    switch (tier) {
      case 'Starter':
        return 'from-pink-400 to-pink-600';
      case 'Classic':
        return 'from-violet-400 to-violet-600';
      case 'Black':
        return 'from-gray-700 to-gray-900';
      case 'Ultra':
        return 'from-indigo-400 to-purple-600';
      default:
        return 'from-blue-400 to-blue-600';
    }
  };

  const getTierBadge = (tier: 'Starter' | 'Classic' | 'Black' | 'Ultra') => {
    if (tier === 'Ultra') {
      return (
        <span className="absolute top-2 right-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-xs font-bold px-2 py-1 rounded-full">
          PREMIUM
        </span>
      );
    }
    return null;
  };

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

  const [filter, setFilter] = useState<'all' | 'art' | 'tie' | 'flower'>('all');
  
  // Handle search functionality
  useEffect(() => {
    if (!searchTerm.trim()) {
      // If search is empty, just apply the type filter
      setFilteredProducts(products.filter(product => {
        if (filter === 'all') return true;
        return product.type === filter;
      }));
      return;
    }
    
    const searchLower = searchTerm.toLowerCase();
    
    // Check if search term matches sativa/indica/hybrid
    const isStrainSearch = ['sativa', 'indica', 'hybrid'].includes(searchLower);
    
    const filtered = products.filter(product => {
      // First apply the type filter
      const typeMatch = filter === 'all' || product.type === filter;
      if (!typeMatch) return false;
      
      // Then apply the search filter
      const nameMatch = product.name.toLowerCase().includes(searchLower);
      const strainMatch = isStrainSearch && product.strain?.toLowerCase().includes(searchLower);
      
      return nameMatch || strainMatch;
    });
    
    setFilteredProducts(filtered);
  }, [searchTerm, filter, products]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold font-poppins mb-4 bg-gradient-to-r from-[#e91e63] via-[#c038cc] to-[#651fff] text-transparent bg-clip-text">
            Cannè Collection
          </h1>
          <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
            Browse our premium digital artwork, designer ties, and top-shelf flowers, organized by tier
          </p>
        </div>
        
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md mx-auto">
            <input
              type="text"
              placeholder="Search by name or strain (sativa/indica/hybrid)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm"
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
        
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-md shadow-sm">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                filter === 'all' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              All Products
            </button>
            <button
              onClick={() => setFilter('art')}
              className={`px-4 py-2 text-sm font-medium ${
                filter === 'art' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              Art Only
            </button>
            <button
              onClick={() => setFilter('tie')}
              className={`px-4 py-2 text-sm font-medium ${
                filter === 'tie' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              Ties Only
            </button>
            <button
              onClick={() => setFilter('flower')}
              className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                filter === 'flower' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              Flowers Only
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <>
            {['Starter', 'Classic', 'Black', 'Ultra'].map(tier => {
              // Skip this tier section if no products match the current filter
              const tierProducts = filteredProducts.filter(product => product.tier === tier);
              
              if (tierProducts.length === 0) return null;
              
              return (
              <section key={tier} className="mb-16">
                <h2 className="text-2xl md:text-3xl font-bold mb-6 font-poppins">
                  {tier} Tier
                  {tier === 'Ultra' && (
                    <span className="ml-2 inline-block bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-sm px-2 py-1 rounded-full">
                      PREMIUM
                    </span>
                  )}
                </h2>
                
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {tierProducts.map(product => (
                      <motion.div 
                        key={product.id} 
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                        variants={itemVariants}
                      >
                        <div className="relative">
                          <div className="aspect-w-16 aspect-h-9 bg-gray-200 dark:bg-gray-700">
                            <div className="w-full h-64 bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-700 dark:to-gray-900 flex items-center justify-center">
                              <span className="text-gray-400 dark:text-gray-500">{product.name}</span>
                            </div>
                          </div>
                          {getTierBadge(product.tier)}
                        </div>
                        
                        <div className="p-6">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-xl font-bold">{product.name}</h3>
                            <span className="font-bold text-lg">${product.price}</span>
                          </div>
                          
                          <p className="text-gray-600 dark:text-gray-300 mb-4">{product.description}</p>
                          
                          {product.strain && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                              Strain: {product.strain}
                            </p>
                          )}
                          
                          {product.color && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                              Color: {product.color}
                            </p>
                          )}
                          
                          {product.pattern && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                              Pattern: {product.pattern}
                            </p>
                          )}
                          
                          <button
                            onClick={() => handleAddToCart(product)}
                            className={`w-full py-2 px-4 rounded-lg text-white font-medium flex items-center justify-center bg-gradient-to-r ${getTierColor(product.tier)} hover:opacity-90 transition-opacity`}
                          >
                            <ShoppingBag className="mr-2 h-5 w-5" />
                            Add to Cart
                          </button>
                        </div>
                      </motion.div>
                    ))}
                </motion.div>
              </section>
            )})}
            
            {/* Special section for flowers when viewing all products */}
            {filter === 'all' && filteredProducts.some(p => p.type === 'flower') && (
              <section className="mb-16">
                <h2 className="text-2xl md:text-3xl font-bold mb-6 font-poppins">
                  Premium Flowers
                  <span className="ml-2 inline-block bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm px-2 py-1 rounded-full">
                    FEATURED
                  </span>
                </h2>
                
                <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl mb-8">
                  <p className="text-lg text-gray-700 dark:text-gray-300">
                    Explore our selection of premium flowers, available in all tiers from Starter (3.5g) to Ultra (28g).
                    Each flower product comes with our signature Cannè packaging and digital art certificate.
                  </p>
                </div>
                
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-3 gap-8"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {filteredProducts
                    .filter(product => product.type === 'flower')
                    .map(product => (
                      <motion.div 
                        key={product.id} 
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                        variants={itemVariants}
                      >
                        <div className="relative">
                          <div className="aspect-w-16 aspect-h-9 bg-gray-200 dark:bg-gray-700">
                            <div className="w-full h-64 bg-gradient-to-br from-green-100 to-emerald-300 dark:from-green-900 dark:to-emerald-700 flex items-center justify-center">
                              <span className="text-gray-600 dark:text-gray-300">{product.name}</span>
                            </div>
                          </div>
                          {getTierBadge(product.tier)}
                        </div>
                        
                        <div className="p-6">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-xl font-bold">{product.name}</h3>
                            <span className="font-bold text-lg">${product.price}</span>
                          </div>
                          
                          <p className="text-gray-600 dark:text-gray-300 mb-4">{product.description}</p>
                          
                          {product.strain && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                              <span className="font-semibold">Strain:</span> {product.strain}
                            </p>
                          )}
                          
                          <button
                            onClick={() => handleAddToCart(product)}
                            className={`w-full py-2 px-4 rounded-lg text-white font-medium flex items-center justify-center bg-gradient-to-r ${getTierColor(product.tier)} hover:opacity-90 transition-opacity`}
                          >
                            <ShoppingBag className="mr-2 h-5 w-5" />
                            Add to Cart
                          </button>
                        </div>
                      </motion.div>
                    ))}
                </motion.div>
              </section>
            )}
            
            {/* Special section just for ties when viewing all products */}
            {filter === 'all' && filteredProducts.some(p => p.type === 'tie') && (
              <section className="mb-16">
                <h2 className="text-2xl md:text-3xl font-bold mb-6 font-poppins">
                  Designer Ties
                  <span className="ml-2 inline-block bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm px-2 py-1 rounded-full">
                    NEW
                  </span>
                </h2>
                
                <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl mb-8">
                  <p className="text-lg text-gray-700 dark:text-gray-300">
                    Explore our exclusive collection of designer ties, available in various tiers to match your style and occasion.
                    Each tie is crafted with premium materials and comes with our signature Cannè packaging.
                  </p>
                </div>
                
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-3 gap-8"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {filteredProducts
                    .filter(product => product.type === 'tie')
                    .map(product => (
                      <motion.div 
                        key={product.id} 
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                        variants={itemVariants}
                      >
                        <div className="relative">
                          <div className="aspect-w-16 aspect-h-9 bg-gray-200 dark:bg-gray-700">
                            <div className="w-full h-64 bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-700 dark:to-gray-900 flex items-center justify-center">
                              <span className="text-gray-400 dark:text-gray-500">{product.name}</span>
                            </div>
                          </div>
                          {getTierBadge(product.tier)}
                        </div>
                        
                        <div className="p-6">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-xl font-bold">{product.name}</h3>
                            <span className="font-bold text-lg">${product.price}</span>
                          </div>
                          
                          <p className="text-gray-600 dark:text-gray-300 mb-4">{product.description}</p>
                          
                          {product.color && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                              Color: {product.color}
                            </p>
                          )}
                          
                          {product.pattern && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                              Pattern: {product.pattern}
                            </p>
                          )}
                          
                          <button
                            onClick={() => handleAddToCart(product)}
                            className={`w-full py-2 px-4 rounded-lg text-white font-medium flex items-center justify-center bg-gradient-to-r ${getTierColor(product.tier)} hover:opacity-90 transition-opacity`}
                          >
                            <ShoppingBag className="mr-2 h-5 w-5" />
                            Add to Cart
                          </button>
                        </div>
                      </motion.div>
                    ))}
                </motion.div>
              </section>
            )}
          </>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
