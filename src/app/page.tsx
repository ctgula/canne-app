'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { products } from '@/data/products';
import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';
import TiersSection from '@/components/TiersSection';
import HowItWorksSection from '@/components/HowItWorksSection';
import SupabaseConnectionTest from '@/components/SupabaseConnectionTest';
import Link from 'next/link';

export default function Home() {
  const scrollToCollection = () => {
    const element = document.getElementById('collection');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  const scrollToPricing = () => {
    const element = document.getElementById('pricing');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-pink-50/20 dark:from-gray-900 dark:to-purple-900/20">
      <Header scrollToCollection={scrollToCollection} />
      
      {/* Hero Section with Cannè theme colors */}
      <div className="pt-20 pb-16 relative overflow-hidden">
        {/* Background effects with Cannè color themes */}
        <div className="absolute inset-0 bg-gradient-to-b from-pink-100/50 via-purple-100/30 to-transparent opacity-80 pointer-events-none dark:from-purple-900/30 dark:via-indigo-900/20 dark:to-transparent"></div>
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-pink-200/20 rounded-full filter blur-3xl dark:bg-pink-900/20"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-200/20 rounded-full filter blur-3xl dark:bg-purple-900/20"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="mb-12 flex flex-col items-center">
            <div className="w-48 h-48 mb-8">
              <Image 
                src="/images/canne_logo.svg" 
                width={200} 
                height={200} 
                alt="Cannè Logo" 
                className="w-full h-auto" 
                priority
              />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-transparent bg-clip-text">Cannè</h1>
            <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 mb-8 max-w-2xl">Premium Digital Art with Complimentary Gifts</p>
            
            <div className="flex space-x-4 mt-6">
              <button onClick={scrollToCollection} className="px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-medium rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 border border-pink-300/20">
                Explore Collection
              </button>
              <Link href="/shop" className="px-8 py-3 bg-white/90 backdrop-blur-sm dark:bg-gray-800/90 text-gray-800 dark:text-white border border-purple-200 dark:border-purple-700/40 font-medium rounded-xl shadow hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-pink-50 dark:hover:from-indigo-900/20 dark:hover:to-pink-900/20">
                Shop Now
              </Link>
            </div>
          </div>
          
          {/* Headline with Cannè tier color themes */}
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight leading-tight">
            Art-first.<br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 dark:from-pink-400 dark:via-purple-500 dark:to-indigo-400">Street-approved.</span>
          </h1>
          
          <p className="text-xl text-gray-700 max-w-2xl mx-auto mb-8 leading-relaxed">
            Premium digital art with legal gifts under I-71. Each purchase supports local artists and comes with a special gift for you.
          </p>
        </div>
      </div>

      {/* Tiers Section */}
      <TiersSection />
      
      {/* How It Works Section */}
      <HowItWorksSection />
      
      {/* Collection Section */}
      <div id="collection" className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-600">Our Collection</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Explore our curated selection of premium digital art pieces, each with complimentary gifts.  
            </p>
            
            <Link href="/products" className="inline-flex mt-6 items-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">
              View All Products
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="py-16 md:py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4">
              Why Choose <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-600">Cannè</span>
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
              <div className="text-pink-500 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Premium Digital Art</h3>
              <p className="text-gray-600 dark:text-gray-300">Unique pieces created by our talented artists.</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
              <div className="text-purple-500 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Complimentary Gifts</h3>
              <p className="text-gray-600 dark:text-gray-300">Every art purchase comes with special I-71 compliant gifts.</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
              <div className="text-indigo-500 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Multiple Tiers</h3>
              <p className="text-gray-600 dark:text-gray-300">Choose from various art tiers based on your preferences.</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
              <div className="text-pink-500 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">DC Delivery</h3>
              <p className="text-gray-600 dark:text-gray-300">Fast and discreet delivery throughout the DC area.</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Supabase Connection Status */}
      <div className="bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <SupabaseConnectionTest />
          </div>
        </div>
      </div>
    </div>
  );
}
