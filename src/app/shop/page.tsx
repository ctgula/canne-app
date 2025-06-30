'use client';

import React from 'react';
import Header from '@/components/Header';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function ShopPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-indigo-100/40">
      <Header />
      
      {/* Subtle animated background elements */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-violet-200/20 to-purple-300/20 rounded-full blur-3xl animate-float-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-56 h-56 bg-gradient-to-r from-blue-200/20 to-indigo-300/20 rounded-full blur-3xl animate-float-delayed"></div>
      </div>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <Link 
          href="/" 
          className="inline-flex items-center space-x-2 mb-8 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Home</span>
        </Link>
        
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-white rounded-3xl shadow-sm border border-gray-100 mb-12">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-100/30 via-purple-100/20 to-transparent z-0"></div>
          
          <div className="relative z-10 p-8 md:p-12 lg:p-16">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="md:max-w-2xl">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-pink-500 mb-4">
                  Premium Digital Collection
                </h1>
                
                <p className="text-xl md:text-2xl text-gray-700 mb-8 animate-fade-up-delayed">
                  Browse our curated digital artworks and complimentary gifts
                </p>
                
                <div className="flex flex-wrap gap-4">
                  <Link 
                    href="/shop/flowers" 
                    className="inline-block bg-gradient-to-r from-pink-500 to-purple-500 text-white font-medium px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                  >
                    Explore Flowers
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {/* Flowers Category Card */}
          <Link
            href="/shop/flowers"
            className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative group"
          >
            <div className="aspect-[4/3] bg-gradient-to-br from-pink-500 to-purple-500 relative overflow-hidden">
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
            </div>
            <div className="p-4">
              <h3 className="text-xl font-bold text-gray-900 mb-1">Flowers</h3>
              <p className="text-sm text-gray-500">Digital art with complimentary flowers</p>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
