'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import ProductsPresenter from '@/components/ProductsPresenter';

import { motion, Variants } from 'framer-motion';
import { Brush, CreditCard, Package, Sparkles } from 'lucide-react';

export default function Home() {
  const scrollToCollection = () => {
    const element = document.getElementById('collection');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-pink-50/20 dark:from-gray-900 dark:to-purple-900/20">
      <Header scrollToCollection={scrollToCollection} />
      <main>
        {/* Hero Section - Clean Layout */}
        <section className="relative max-w-4xl mx-auto h-[100dvh] max-h-screen overflow-hidden scroll-mt-0">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-pink-200/20 rounded-full filter blur-3xl dark:bg-pink-900/20 opacity-50"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-lavender-200/20 rounded-full filter blur-3xl dark:bg-purple-900/20 opacity-50"></div>
          <div className="absolute -bottom-80 -right-20 w-96 h-96 bg-blue-200/10 rounded-full filter blur-3xl dark:bg-blue-900/10 opacity-50"></div>
          
          <motion.div 
            className="relative z-10"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div 
              className="flex flex-col items-center text-center px-4 pt-12 sm:pt-16 md:pt-20 lg:pt-28 pb-8 sm:pb-12 md:pb-16"
              variants={itemVariants}
            >
              <Image 
                src="/images/canne_logo_web.svg" 
                alt="Cannè Logo" 
                width={200} 
                height={200} 
                className="w-32 h-32 sm:w-36 sm:h-36 md:w-48 md:h-48 lg:w-56 lg:h-56 xl:w-64 xl:h-64 mb-4 sm:mb-6" 
                priority
              />
              
              <motion.h1 
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 text-transparent bg-clip-text"
                variants={itemVariants}
              >
                Art–first. Street–approved.
              </motion.h1>
              
              <motion.p 
                className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mt-2 sm:mt-4 mb-6 sm:mb-8"
                variants={itemVariants}
              >
                Premium Digital Art with Complimentary Gifts
              </motion.p>
              
              <motion.div 
                className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto"
                variants={itemVariants}
              >
                <Link href="/shop">
                  <button className="w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 bg-pink-500 text-white rounded-xl shadow-md hover:bg-pink-600 transition">
                    View Art Collection
                  </button>
                </Link>
                <Link href="/shop">
                  <button className="w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                    Shop Now
                  </button>
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </section>

        {/* How It Works Section - Simplified Process */}
        <section className="py-16 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 text-transparent bg-clip-text mb-4">How It Works</h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Simple, seamless, and I-71 compliant — art purchases with complimentary gifts
              </p>
            </div>
            
            <div className="relative mt-12">
              {/* Timeline Connector */}
              <div className="hidden md:block absolute top-[2.3125rem] left-0 w-full h-1.5 -z-10">
                <div className="relative w-full h-full bg-gray-200 dark:bg-gray-700 rounded-full">
                  <div className="absolute left-0 top-0 h-full w-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-full shadow-sm" />
                </div>
              </div>
              
              {/* Process Steps */}
              <div className="grid grid-cols-1 gap-8 md:grid-cols-4 md:gap-6">
                {/* Step 1 */}
                <div className="text-center flex flex-col items-center">
                  <div className="flex justify-center items-center mx-auto mb-6 w-16 h-16 bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900/50 dark:to-purple-900/50 rounded-full shadow-inner-lg">
                    <div className="flex items-center justify-center w-12 h-12 bg-white/80 dark:bg-gray-800/80 rounded-full shadow-md">
                      <Brush className="h-6 w-6 text-pink-500" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Pick Your Art</h3>
                  <p className="text-gray-600 dark:text-gray-400">Choose a tier; each purchase is for exclusive artwork.</p>
                </div>
                
                {/* Step 2 */}
                <div className="text-center flex flex-col items-center">
                  <div className="flex justify-center items-center mx-auto mb-6 w-16 h-16 bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900/50 dark:to-purple-900/50 rounded-full shadow-inner-lg">
                    <div className="flex items-center justify-center w-12 h-12 bg-white/80 dark:bg-gray-800/80 rounded-full shadow-md">
                      <CreditCard className="h-6 w-6 text-amber-500" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Secure Checkout</h3>
                  <p className="text-gray-600 dark:text-gray-400">Pay online—taxes + delivery included.</p>
                </div>
                
                {/* Step 3 */}
                <div className="text-center flex flex-col items-center">
                  <div className="flex justify-center items-center mx-auto mb-6 w-16 h-16 bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900/50 dark:to-purple-900/50 rounded-full shadow-inner-lg">
                    <div className="flex items-center justify-center w-12 h-12 bg-white/80 dark:bg-gray-800/80 rounded-full shadow-md">
                      <Package className="h-6 w-6 text-blue-500" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">We Gift the Vibe</h3>
                  <p className="text-gray-600 dark:text-gray-400">Our courier hands you the complimentary cannabis.</p>
                </div>
                
                {/* Step 4 */}
                <div className="text-center flex flex-col items-center">
                  <div className="flex justify-center items-center mx-auto mb-6 w-16 h-16 bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900/50 dark:to-purple-900/50 rounded-full shadow-inner-lg">
                    <div className="flex items-center justify-center w-12 h-12 bg-white/80 dark:bg-gray-800/80 rounded-full shadow-md">
                      <Sparkles className="h-6 w-6 text-purple-500" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Enjoy Responsibly</h3>
                  <p className="text-gray-600 dark:text-gray-400">Must be 21+. Keep gifts inside the District.</p>
                </div>
              </div>
            </div>
            
            {/* Shop Now CTA */}
            <div className="text-center mt-12">
              <Link href="/shop">
                <button className="px-12 py-4 text-base font-medium bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
                  Start Shopping
                </button>
              </Link>
            </div>
          </div>
        </section>

        <div id="collection">
          {/* Products Section using MCP */}
          <ProductsPresenter />
          

        </div>

        {/* Our Collection Section */}
        <section id="collection" className="py-16 md:py-20 bg-gray-50 dark:bg-gray-800/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Art Collection</h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Explore our curated selection of digital art. Each piece comes with a special <span className="font-semibold text-green-600">FREE cannabis gift</span>.
              </p>
            </motion.div>
            
            <div className="overflow-hidden relative h-20 sm:h-24 md:h-32">
              <div className="absolute top-0 py-6 sm:py-8 md:py-12 animate-marquee whitespace-nowrap flex space-x-8 sm:space-x-12 md:space-x-16">
                <img src="/images/canne_logo.svg" alt="Cannè Logo" className="h-12 sm:h-16 md:h-24 w-auto flex-shrink-0" />
                <img src="/images/canne_logo.svg" alt="Cannè Logo" className="h-12 sm:h-16 md:h-24 w-auto flex-shrink-0" />
                <img src="/images/canne_logo.svg" alt="Cannè Logo" className="h-12 sm:h-16 md:h-24 w-auto flex-shrink-0" />
                <img src="/images/canne_logo.svg" alt="Cannè Logo" className="h-12 sm:h-16 md:h-24 w-auto flex-shrink-0" />
                <img src="/images/canne_logo.svg" alt="Cannè Logo" className="h-12 sm:h-16 md:h-24 w-auto flex-shrink-0" />
                <img src="/images/canne_logo.svg" alt="Cannè Logo" className="h-12 sm:h-16 md:h-24 w-auto flex-shrink-0" />
                <img src="/images/canne_logo.svg" alt="Cannè Logo" className="h-12 sm:h-16 md:h-24 w-auto flex-shrink-0" />
                <img src="/images/canne_logo.svg" alt="Cannè Logo" className="h-12 sm:h-16 md:h-24 w-auto flex-shrink-0" />
                <img src="/images/canne_logo.svg" alt="Cannè Logo" className="h-12 sm:h-16 md:h-24 w-auto flex-shrink-0" />
                <img src="/images/canne_logo.svg" alt="Cannè Logo" className="h-12 sm:h-16 md:h-24 w-auto flex-shrink-0" />
                <img src="/images/canne_logo.svg" alt="Cannè Logo" className="h-12 sm:h-16 md:h-24 w-auto flex-shrink-0" />
                <img src="/images/canne_logo.svg" alt="Cannè Logo" className="h-12 sm:h-16 md:h-24 w-auto flex-shrink-0" />
              </div>
              <div className="absolute top-0 py-6 sm:py-8 md:py-12 animate-marquee2 whitespace-nowrap flex space-x-8 sm:space-x-12 md:space-x-16">
                <img src="/images/canne_logo.svg" alt="Cannè Logo" className="h-12 sm:h-16 md:h-24 w-auto flex-shrink-0" />
                <img src="/images/canne_logo.svg" alt="Cannè Logo" className="h-12 sm:h-16 md:h-24 w-auto flex-shrink-0" />
                <img src="/images/canne_logo.svg" alt="Cannè Logo" className="h-12 sm:h-16 md:h-24 w-auto flex-shrink-0" />
                <img src="/images/canne_logo.svg" alt="Cannè Logo" className="h-12 sm:h-16 md:h-24 w-auto flex-shrink-0" />
                <img src="/images/canne_logo.svg" alt="Cannè Logo" className="h-12 sm:h-16 md:h-24 w-auto flex-shrink-0" />
                <img src="/images/canne_logo.svg" alt="Cannè Logo" className="h-12 sm:h-16 md:h-24 w-auto flex-shrink-0" />
                <img src="/images/canne_logo.svg" alt="Cannè Logo" className="h-12 sm:h-16 md:h-24 w-auto flex-shrink-0" />
                <img src="/images/canne_logo.svg" alt="Cannè Logo" className="h-12 sm:h-16 md:h-24 w-auto flex-shrink-0" />
                <img src="/images/canne_logo.svg" alt="Cannè Logo" className="h-12 sm:h-16 md:h-24 w-auto flex-shrink-0" />
                <img src="/images/canne_logo.svg" alt="Cannè Logo" className="h-12 sm:h-16 md:h-24 w-auto flex-shrink-0" />
                <img src="/images/canne_logo.svg" alt="Cannè Logo" className="h-12 sm:h-16 md:h-24 w-auto flex-shrink-0" />
                <img src="/images/canne_logo.svg" alt="Cannè Logo" className="h-12 sm:h-16 md:h-24 w-auto flex-shrink-0" />
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

