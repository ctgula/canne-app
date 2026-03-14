"use client";

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductsPresenter from '@/components/ProductsPresenter';
import { Shield, Truck, Clock, CheckCircle, MapPin, Sparkles } from 'lucide-react';

export default function ShopPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="flex-1 pt-20 sm:pt-24">
        {/* Trust Bar */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              <span className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-green-500" />
                <span>I-71 Compliant</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-blue-500" />
                <span>Free delivery over $35</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-purple-500" />
                <span>60–90 min delivery</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-pink-500" />
                <span>21+ verified</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-500" />
                <span>Collectible print with every order</span>
              </span>
            </div>
          </div>
        </div>

        {/* Delivery Zone Callout */}
        <div className="bg-purple-50 dark:bg-purple-900/20 border-b border-purple-100 dark:border-purple-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-center gap-2 text-sm text-purple-700 dark:text-purple-300">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span>Now delivering in Downtown DC — starting with Mount Vernon Square &amp; Gallery Place</span>
            </div>
          </div>
        </div>

        {/* Collectible Drop Callout */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-gray-950 via-purple-950 to-gray-950 p-6 sm:p-8">
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #a855f7 0%, transparent 50%), radial-gradient(circle at 80% 50%, #ec4899 0%, transparent 50%)' }} />
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-12 h-12 flex-shrink-0 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-purple-300" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white font-bold text-lg">Collectible Print — Drop #001</span>
                  <span className="px-2 py-0.5 bg-purple-500/30 border border-purple-400/30 rounded-full text-purple-300 text-xs font-medium">Founder Edition</span>
                </div>
                <p className="text-white/60 text-sm">Every order includes a randomly assigned digital art print, yours to keep and download after payment is confirmed.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Products */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <ProductsPresenter />
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
