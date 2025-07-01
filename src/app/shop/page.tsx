'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Link from 'next/link';
import { ArrowLeft, Filter, X, Tag, SortAsc, ChevronDown, Search } from 'lucide-react';
import { tiers, Tier } from '@/data/tiers';
import StrainCard from '@/components/StrainCard';
import { motion, AnimatePresence } from 'framer-motion';

const TierHeader: React.FC<{ tier: Tier }> = ({ tier }) => (
  <div className="mb-10 border-l-4 border-pink-500 pl-6 relative">
    <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 shadow-lg"></div>
    <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{tier.name}</h2>
    <p className="text-lg text-gray-600 dark:text-gray-300 mt-2 leading-relaxed max-w-3xl">{tier.description}</p>
  </div>
);

export default function ShopPage() {
  // State for filters
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filter types
  const types = ['all', 'sativa', 'indica', 'hybrid'];
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
    },
  };
  
  // Simulate loading state
  useEffect(() => {
    // Simulate loading state and reset filters on initial load
    const timer = setTimeout(() => {
      setIsLoading(false);
      // Reset filters to ensure content is displayed
      setActiveFilter('all');
      setSearchQuery('');
    }, 800); // Short timeout to improve perceived performance
    
    // Debugging - log tiers data to console
    console.log('Tiers data:', tiers);
    tiers.forEach(tier => {
      console.log(`Tier ${tier.name} has ${tier.strains?.length || 0} strains`);
    });
    
    return () => clearTimeout(timer);
  }, []);
  
  // Filter function
  const getFilteredStrains = (tier: Tier) => {
    // Make sure tier.strains exists and is an array
    if (!tier.strains || !Array.isArray(tier.strains)) {
      console.warn(`No strains found for tier: ${tier.slug}`);
      return [];
    }
    
    // When no filters are active, return all strains
    if (activeFilter === 'all' && searchQuery === '') {
      return tier.strains;
    }
    
    // Filter strains based on type and search query
    return tier.strains.filter(strain => {
      // Apply type filter - handle strains without type property
      const matchesType = 
        activeFilter === 'all' || 
        !strain.type || // Include strains without type when filter is 'all'
        (strain.type && strain.type.toLowerCase() === activeFilter.toLowerCase());
      
      // Apply search query filter with null safety
      const matchesSearch = 
        searchQuery === '' || 
        (strain.title && strain.title.toLowerCase().includes(searchQuery.toLowerCase())) || 
        (strain.description && strain.description.toLowerCase().includes(searchQuery.toLowerCase()));
      
      return matchesType && matchesSearch;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* SEO Metadata is handled in layout.tsx or through the Metadata API */}
      
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-10">
          <Link 
            href="/" 
            className="inline-flex items-center space-x-2 mb-4 sm:mb-0 text-gray-600 hover:text-gray-900 transition-colors dark:text-gray-400 dark:hover:text-white group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Home</span>
          </Link>
          
          {/* Mobile filter button */}
          <button 
            onClick={() => setIsFilterMenuOpen(true)}
            className="sm:hidden flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <Filter className="h-4 w-4" />
            <span>Filter</span>
          </button>
          
          {/* Desktop search and filter */}
          <div className="hidden sm:flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search collection..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
            <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-hide">
              {types.map((type) => (
                <button
                  key={type}
                  onClick={() => setActiveFilter(type)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    activeFilter === type 
                      ? 'bg-pink-500 text-white' 
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile filter menu */}
        <AnimatePresence>
          {isFilterMenuOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end"
              onClick={() => setIsFilterMenuOpen(false)}
            >
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'tween', duration: 0.3 }}
                className="w-4/5 max-w-xs bg-white dark:bg-gray-900 h-full overflow-y-auto shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                  <h3 className="font-medium">Filters</h3>
                  <button onClick={() => setIsFilterMenuOpen(false)} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="p-4">
                  <div className="mb-6">
                    <label htmlFor="mobile-search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Search
                    </label>
                    <div className="relative">
                      <input
                        id="mobile-search"
                        type="text"
                        placeholder="Search collection..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                      />
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      Type
                    </h4>
                    <div className="space-y-2">
                      {types.map((type) => (
                        <button
                          key={type}
                          onClick={() => {
                            setActiveFilter(type);
                            setIsFilterMenuOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium ${
                            activeFilter === type 
                              ? 'bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400' 
                              : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 tracking-tight">
            Shop Our Collection
          </h1>
          <p className="mt-6 text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Exclusive digital art, gifted with premium flower.
          </p>
        </motion.div>

        {/* Loading state */}
        {isLoading ? (
          <div className="space-y-24">
            {tiers.map((tier) => (
              <section key={tier.slug} className="relative">
                <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-gray-200 to-transparent dark:via-gray-700 opacity-70"></div>
                <div className="mb-10 border-l-4 border-pink-500 pl-6 relative animate-pulse">
                  <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-pink-200 dark:bg-pink-800"></div>
                  <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-4 w-96 bg-gray-100 dark:bg-gray-800 rounded"></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-10">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="animate-pulse rounded-xl bg-white dark:bg-gray-800 overflow-hidden">
                      <div className="aspect-square bg-gray-200 dark:bg-gray-700"></div>
                      <div className="p-5">
                        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                        <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-full mb-2"></div>
                        <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-2/3"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <motion.div 
            className="space-y-24"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {tiers.map((tier) => {
              // Ensure tier data exists
              if (!tier) return null;
              
              const filteredStrains = getFilteredStrains(tier);
              
              // Always show the section if no filters are applied
              const isFiltering = activeFilter !== 'all' || searchQuery !== '';
              
              // Skip sections with no matching strains only when filtering
              if (filteredStrains.length === 0 && isFiltering) return null;
              
              return (
                <motion.section 
                  key={tier.slug}
                  variants={itemVariants}
                  className="relative"
                >
                  <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-gray-200 to-transparent dark:via-gray-700 opacity-70"></div>
                  <TierHeader tier={tier} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-10">
                    {filteredStrains.map((strain) => (
                      <StrainCard key={strain.id} strain={strain} tierSlug={tier.slug} />
                    ))}
                  </div>
                </motion.section>
              );
            })}
            
            {/* No results message */}
            {tiers.every(tier => getFilteredStrains(tier).length === 0) && (
              <div className="text-center py-16">
                <div className="text-3xl font-bold text-gray-300 dark:text-gray-700 mb-4">No results found</div>
                <p className="text-gray-500 dark:text-gray-500">Try adjusting your filters or search query</p>
                <button 
                  onClick={() => {
                    setActiveFilter('all');
                    setSearchQuery('');
                  }}
                  className="mt-4 px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
                >
                  Clear filters
                </button>
              </div>
            )}
          </motion.div>
        )}
      </main>
    </div>
  );
}
