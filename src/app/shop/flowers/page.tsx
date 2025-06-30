'use client';

import React from 'react';
import Header from '@/components/Header';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function FlowersPage() {
  const tiers = [
    {
      name: 'Starter',
      price: '$25',
      weight: '3.5 g',
      description: 'Single digital print + complimentary top-shelf gift.',
      slug: 'starter',
      bgColor: 'from-pink-400 to-pink-600'
    },
    {
      name: 'Classic',
      price: '$45',
      weight: '7 g',
      description: 'Double art series with signature + two curated gifts.',
      slug: 'classic',
      bgColor: 'from-violet-400 to-violet-600'
    },
    {
      name: 'Black',
      price: '$75',
      weight: '14 g',
      description: 'Limited collection prints + four premium gifts.',
      slug: 'black',
      bgColor: 'from-gray-700 to-gray-900'
    },
    {
      name: 'Ultra',
      price: '$140',
      weight: '28 g',
      description: 'Exclusive gallery pieces + eight premium selections.',
      slug: 'ultra',
      bgColor: 'from-purple-500 to-indigo-700'
    }
  ];

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
          href="/shop" 
          className="inline-flex items-center space-x-2 mb-8 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Shop</span>
        </Link>
        
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-white rounded-3xl shadow-sm border border-gray-100 mb-12">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-100/30 via-purple-100/20 to-transparent z-0"></div>
          
          <div className="relative z-10 p-8 md:p-12 lg:p-16">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="md:max-w-2xl">
                <h1 className="text-4xl md:text-5xl font-bold text-pink-500 mb-4">
                  Fine Art Collection
                </h1>
                
                <p className="text-xl md:text-2xl text-gray-700 mb-8">
                  Explore our premium digital artworks and complimentary gifts
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tier Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {tiers.map((tier) => (
            <Link
              key={tier.slug}
              href={`/shop/flowers/${tier.slug}`}
              className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative group"
            >
              <div className={`aspect-[4/3] bg-gradient-to-br ${tier.bgColor} relative overflow-hidden`}>
                <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-sm font-medium">
                  {tier.weight}
                </div>
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xl font-bold text-gray-900">{tier.name}</h3>
                  <span className="text-xl font-bold text-[#D4AF37]">{tier.price}</span>
                </div>
                <p className="text-sm text-gray-600">{tier.description}</p>
              </div>
            </Link>
          ))}
        </div>
        
        {/* Legal Notice */}
        <div className="text-center mt-10 text-sm text-gray-500 max-w-3xl mx-auto">
          <p>All prices are for I-71-compliant digital art pieces – cannabis is gifted, never sold.</p>
        </div>
      </main>
    </div>
  );
}
