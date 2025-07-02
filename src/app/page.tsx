'use client';

import React from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import HowItWorksSection from '@/components/HowItWorksSection';
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
        {/* Hero Section - Basic Structure */}
        <section className="relative bg-gradient-to-b from-pink-50 to-white dark:from-gray-900 dark:to-black text-center h-screen flex flex-col justify-start pt-24 md:pt-16 items-center">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-pink-200/20 rounded-full filter blur-3xl dark:bg-pink-900/20 opacity-50"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-lavender-200/20 rounded-full filter blur-3xl dark:bg-purple-900/20 opacity-50"></div>
          <div className="absolute -bottom-80 -right-20 w-96 h-96 bg-blue-200/10 rounded-full filter blur-3xl dark:bg-blue-900/10 opacity-50"></div>
          <motion.div 
            className="container mx-auto px-4 relative z-10"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div 
              className="flex flex-col items-center gap-4"
              variants={itemVariants}
            >
              <div className="w-full max-w-[280px] h-auto md:max-w-[380px] lg:max-w-[480px] mx-auto -mb-8">
                <img 
                  src="/images/canne_logo_web.svg" 
                  alt="Cannè Art Collective Logo" 
                  className="w-full h-full object-contain" 
                  loading="eager"
                  width="480"
                  height="480"
                />
              </div>
              
              <motion.h1 
                className="mt-0 text-[4rem] sm:text-8xl md:text-[10rem] font-poppins font-extrabold tracking-tighter leading-none md:leading-[0.9] bg-gradient-to-r from-[#e91e63] via-[#c038cc] to-[#651fff] text-transparent bg-clip-text drop-shadow-md w-full max-w-[1400px]"
                variants={itemVariants}
              >
                <span className="block text-[4rem] sm:text-8xl md:text-[10rem] sm:inline">Art-first.</span>{' '}
                <span className="block text-[4rem] sm:text-8xl md:text-[10rem] sm:inline">Street-approved.</span>
              </motion.h1>
              
              <motion.p 
                className="max-w-3xl mx-auto text-2xl md:text-4xl text-gray-700 dark:text-gray-300 tracking-wide font-poppins mt-4 font-medium"
                variants={itemVariants}
              >
                Premium Digital Art with Complimentary Gifts
              </motion.p>
              
              <motion.div 
                className="mt-8 sm:mt-10 flex flex-col sm:flex-row justify-center items-center space-y-3 sm:space-y-0 sm:space-x-6 w-full px-4 sm:px-0"
                variants={itemVariants}
              >
                <Link href="/shop">
                  <button className="w-full sm:w-auto px-16 sm:px-20 py-6 text-2xl bg-gradient-to-r from-[#e91e63] to-[#c038cc] text-white font-bold rounded-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 animate-pulse-gentle">
                    SHOP NOW
                  </button>
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </section>

        <div id="collection">
          {/* How It Works Section */}
          <HowItWorksSection />
          
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

