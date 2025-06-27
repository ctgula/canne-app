'use client';

import Header from '@/components/Header';
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CompliancePage() {
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
          <h1 className="font-bold text-3xl md:text-4xl text-gray-900 mb-8">How We Stay I-71 Compliant</h1>
          
          <div className="prose prose-lg max-w-none text-gray-600">
            <ul className="space-y-4 list-disc pl-5">
              <li>Gifts limited to 2 oz per adult.</li>
              <li>No tax on the gift.</li>
              <li>We verify ID and D.C. residency at hand-off.</li>
              <li>No onsite consumption.</li>
            </ul>
            
            <p className="mt-8">
              Questions? Email <a href="mailto:compliance@canne.com" className="text-violet-600 hover:text-violet-700 underline" target="_blank" rel="noopener noreferrer">compliance@canne.com</a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
