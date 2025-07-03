'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import ProductsPresenter from '@/components/ProductsPresenter';
import SupabaseConnectionTest from '@/components/SupabaseConnectionTest';
import { motion, Variants } from 'framer-motion';


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
        <section className="relative max-w-4xl mx-auto">
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
              className="flex flex-col items-center text-center px-4 pt-28 pb-16"
              variants={itemVariants}
            >
              <Image 
                src="/images/canne_logo_web.svg" 
                alt="Cannè Logo" 
                width={200} 
                height={200} 
                className="mb-6" 
                priority
              />
              
              <motion.h1 
                className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 text-transparent bg-clip-text"
                variants={itemVariants}
              >
                Art–first. Street–approved.
              </motion.h1>
              
              <motion.p 
                className="text-lg text-gray-600 mt-4 mb-8"
                variants={itemVariants}
              >
                Premium Digital Art with Complimentary Gifts
              </motion.p>
              
              <motion.div 
                className="flex gap-4"
                variants={itemVariants}
              >
                <Link href="/shop">
                  <button className="px-6 py-3 bg-pink-500 text-white rounded-xl shadow-md hover:bg-pink-600 transition">
                    View Art Collection
                  </button>
                </Link>
                <Link href="/shop">
                  <button className="px-6 py-3 bg-white border border-gray-300 rounded-xl shadow-sm hover:bg-gray-100 transition">
                    Shop Now
                  </button>
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </section>

        <div id="collection">
          {/* Products Section using MCP */}
          <ProductsPresenter />
          
          {/* Supabase Connection Test */}
          <div className="container mx-auto px-4 py-8">
            <SupabaseConnectionTest />
          </div>
        </div>

        {/* Our Collection Section */}
        <section id="collection" className="py-16 md:py-20 bg-gray-50 dark:bg-gray-800/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Our Collection</h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                <>
                Explore our curated selection of digital art. Each piece comes with a special complimentary gift.
                <span className="text-red-500 font-semibold ml-2">(coming soon)</span>
              </>
              </p>
            </div>
            <div className="relative flex overflow-x-hidden marquee-mask">
              <div className="py-12 animate-marquee whitespace-nowrap flex space-x-16">
                <img src="/images/canne_logo.svg" alt="Cannè Logo" className="h-24 w-auto" />
                <img src="/images/canne_logo.svg" alt="Cannè Logo" className="h-24 w-auto" />
                <img src="/images/canne_logo.svg" alt="Cannè Logo" className="h-24 w-auto" />
                <img src="/images/canne_logo.svg" alt="Cannè Logo" className="h-24 w-auto" />
                <img src="/images/canne_logo.svg" alt="Cannè Logo" className="h-24 w-auto" />
                <img src="/images/canne_logo.svg" alt="Cannè Logo" className="h-24 w-auto" />
                <img src="/images/canne_logo.svg" alt="Cannè Logo" className="h-24 w-auto" />
                <img src="/images/canne_logo.svg" alt="Cannè Logo" className="h-24 w-auto" />
                <img src="/images/canne_logo.svg" alt="Cannè Logo" className="h-24 w-auto" />
                <img src="/images/canne_logo.svg" alt="Cannè Logo" className="h-24 w-auto" />
                <img src="/images/canne_logo.svg" alt="Cannè Logo" className="h-24 w-auto" />
                <img src="/images/canne_logo.svg" alt="Cannè Logo" className="h-24 w-auto" />
                <img src="/images/canne_logo.svg" alt="Cannè Logo" className="h-24 w-auto" />
                <img src="/images/canne_logo.svg" alt="Cannè Logo" className="h-24 w-auto" />
                <img src="/images/canne_logo.svg" alt="Cannè Logo" className="h-24 w-auto" />
                <img src="/images/canne_logo.svg" alt="Cannè Logo" className="h-24 w-auto" />
                <img src="/images/canne_logo.svg" alt="Cannè Logo" className="h-24 w-auto" />
                <img src="/images/canne_logo.svg" alt="Cannè Logo" className="h-24 w-auto" />
                <img src="/images/canne_logo.svg" alt="Cannè Logo" className="h-24 w-auto" />
                <img src="/images/canne_logo.svg" alt="Cannè Logo" className="h-24 w-auto" />
                <img src="/images/canne_logo.svg" alt="Cannè Logo" className="h-24 w-auto" />
                <img src="/images/canne_logo.svg" alt="Cannè Logo" className="h-24 w-auto" />
                <img src="/images/canne_logo.svg" alt="Cannè Logo" className="h-24 w-auto" />
                <img src="/images/canne_logo.svg" alt="Cannè Logo" className="h-24 w-auto" />
              </div>
              <div className="absolute top-0 py-12 animate-marquee2 whitespace-nowrap flex space-x-16">
                <img src="/images/canne_logo.svg" alt="Cannè Logo" className="h-24 w-auto" />
                <img src="/images/canne_logo.svg" alt="Cannè Logo" className="h-24 w-auto" />
                <img src="/images/canne_logo.svg" alt="Cannè Logo" className="h-24 w-auto" />
                <img src="/images/canne_logo.svg" alt="Cannè Logo" className="h-24 w-auto" />
                <img src="/images/canne_logo.svg" alt="Cannè Logo" className="h-24 w-auto" />
                <img src="/images/canne_logo.svg" alt="Cannè Logo" className="h-24 w-auto" />
                <img src="/images/canne_logo.svg" alt="Cannè Logo" className="h-24 w-auto" />
                <img src="/images/canne_logo.svg" alt="Cannè Logo" className="h-24 w-auto" />
                <img src="/images/canne_logo.svg" alt="Cannè Logo" className="h-24 w-auto" />
                <img src="/images/canne_logo.svg" alt="Cannè Logo" className="h-24 w-auto" />
                <img src="/images/canne_logo.svg" alt="Cannè Logo" className="h-24 w-auto" />
                <img src="/images/canne_logo.svg" alt="Cannè Logo" className="h-24 w-auto" />
                <img src="/images/canne_logo.svg" alt="Cannè Logo" className="h-24 w-auto" />
                <img src="/images/canne_logo.svg" alt="Cannè Logo" className="h-24 w-auto" />
                <img src="/images/canne_logo.svg" alt="Cannè Logo" className="h-24 w-auto" />
                <img src="/images/canne_logo.svg" alt="Cannè Logo" className="h-24 w-auto" />
                <img src="/images/canne_logo.svg" alt="Cannè Logo" className="h-24 w-auto" />
                <img src="/images/canne_logo.svg" alt="Cannè Logo" className="h-24 w-auto" />
                <img src="/images/canne_logo.svg" alt="Cannè Logo" className="h-24 w-auto" />
                <img src="/images/canne_logo.svg" alt="Cannè Logo" className="h-24 w-auto" />
                <img src="/images/canne_logo.svg" alt="Cannè Logo" className="h-24 w-auto" />
                <img src="/images/canne_logo.svg" alt="Cannè Logo" className="h-24 w-auto" />
                <img src="/images/canne_logo.svg" alt="Cannè Logo" className="h-24 w-auto" />
                <img src="/images/canne_logo.svg" alt="Cannè Logo" className="h-24 w-auto" />
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

