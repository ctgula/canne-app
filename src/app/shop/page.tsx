"use client";

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductsPresenter from '@/components/ProductsPresenter';
import { Shield, Truck, Clock, CheckCircle, MapPin } from 'lucide-react';

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

        {/* Products */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <ProductsPresenter />
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
