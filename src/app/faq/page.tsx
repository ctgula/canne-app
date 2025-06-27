'use client';

import Header from '@/components/Header';
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-indigo-100/40">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <Link 
          href="/" 
          className="inline-flex items-center space-x-2 mb-8 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Home</span>
        </Link>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-10">
          <h1 className="font-bold text-3xl md:text-4xl text-gray-900 mb-8">Frequently Asked Questions</h1>
          
          <div className="space-y-8">
            <div className="border-b border-gray-100 pb-6">
              <h2 className="font-bold text-lg text-gray-900 mb-3">What am I actually buying?</h2>
              <p className="text-gray-600">
                A curated digital art print. Your complimentary gift is included under Initiative-71.
              </p>
            </div>
            
            <div className="border-b border-gray-100 pb-6">
              <h2 className="font-bold text-lg text-gray-900 mb-3">Are you legal?</h2>
              <p className="text-gray-600">
                Yes. We follow all I-71 requirements: 21+, no on-site consumption, gifting ≤ 2 oz.
              </p>
            </div>
            
            <div className="border-b border-gray-100 pb-6">
              <h2 className="font-bold text-lg text-gray-900 mb-3">How long does delivery take?</h2>
              <p className="text-gray-600">
                Typically 30–60 min inside our core zones (20001, 20009, 20007, 20005).
              </p>
            </div>
            
            <div className="pb-2">
              <h2 className="font-bold text-lg text-gray-900 mb-3">Can I pay cash?</h2>
              <p className="text-gray-600">
                We currently accept card, Apple Pay, and Cash App. Cash on delivery coming soon.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
