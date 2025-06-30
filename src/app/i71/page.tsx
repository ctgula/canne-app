'use client';

import Header from '@/components/Header';
import React from 'react';
import { ArrowLeft, Shield, Check } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

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
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex justify-center p-8 border-b border-gray-100 bg-gradient-to-r from-pink-50 to-indigo-50">
            <img 
              src="/images/canne_logo.svg"
              alt="Cannè Art Collective"
              className="h-24 w-auto"
            />
          </div>
          
          <div className="p-8 md:p-10">
            <div className="flex items-center gap-3 mb-8">
              <Shield className="h-8 w-8 text-pink-500" />
              <h1 className="font-bold text-3xl md:text-4xl text-gray-900">I-71 Compliance Guidelines</h1>
            </div>
            
            <div className="prose prose-lg max-w-none text-gray-600">
              <p className="text-lg font-medium mb-6">
                At Cannè Art Collective, we strictly adhere to Washington D.C.'s Initiative 71 regulations. 
                Here's how we ensure compliance:
              </p>
              
              <ul className="space-y-4 mt-6">
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                  <span>Gifts limited to 2 oz per adult (21+) per transaction</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                  <span>No tax on the cannabis gift — you're purchasing art</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                  <span>We verify ID and D.C. residency at hand-off</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                  <span>No public or onsite consumption permitted</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                  <span>All digital art pieces include a certificate of authenticity</span>
                </li>
              </ul>
              
              <div className="mt-10 p-4 bg-pink-50 rounded-lg border border-pink-100">
                <p className="font-medium text-gray-700">Have questions about our compliance practices?</p>
                <p>
                  Email us at <a href="mailto:compliance@canne.com" className="text-pink-600 hover:text-pink-700 font-medium" target="_blank" rel="noopener noreferrer">compliance@canne.com</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
