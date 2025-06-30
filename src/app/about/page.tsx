'use client';

import Header from '@/components/Header';
import DcComplianceSection from '@/components/DcComplianceSection';
import React from 'react';
import { ArrowLeft, Palette, Heart, Sparkles, Clock, Shield, Users } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';


export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-indigo-100/40">
      <Header />
      
      {/* Subtle animated background elements */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-violet-200/20 to-purple-300/20 rounded-full blur-3xl animate-float-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-56 h-56 bg-gradient-to-r from-blue-200/20 to-indigo-300/20 rounded-full blur-3xl animate-float-delayed"></div>
      </div>
      
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
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
                  Cannè is a Washington, D.C.–born collection reimagining the gifting experience through
                  premium digital art and curated complimentary gifts.
                </p>
              </div>
              
              <div className="relative w-40 h-40 md:w-64 md:h-64 mx-auto md:mx-0 mt-8 md:mt-0 animate-float-gentle flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-300 via-purple-400 to-indigo-500 rounded-full opacity-80 blur-md"></div>
                <div className="relative flex items-center justify-center h-full w-full p-6">
                  {/* Actual Cannè Logo */}
                  <img
                    src="/images/canne_logo.svg"
                    alt="Cannè Art Collective"
                    className="h-32 md:h-40 w-auto relative z-10"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* DC Compliance Section */}
        <DcComplianceSection />
        
        {/* Our Story Section */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12 mb-12">
          <h2 className="font-bold text-3xl md:text-4xl text-gray-900 mb-8">Our Story</h2>
          
          <div className="prose prose-lg max-w-none text-gray-600">
            <p className="text-xl mb-6">
              Founded by a collective of local artists, designers, and cannabis enthusiasts, Cannè was born from a simple idea: 
              <span className="text-violet-600 font-medium">art and gifting should be beautiful, accessible, and joyful.</span>
            </p>
            
            <p className="mb-8">
              We noticed that while Washington D.C.&apos;s Initiative 71 opened new possibilities for gifting, the experience often lacked the thoughtfulness and design-forward approach that we craved. So we set out to create something different—a platform where digital art collection and gifting merge into a seamless, elevated experience.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 my-12">
              <div className="bg-gradient-to-br from-violet-50 to-purple-50 p-6 rounded-xl border border-violet-100">
                <Palette className="h-8 w-8 text-violet-500 mb-4" />
                <h3 className="font-bold text-xl text-gray-800 mb-3">Design-Forward</h3>
                <p className="text-gray-600">Every aspect of Cannè is crafted with intention, from our curated art collection to the gifting experience.</p>
              </div>
              
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-xl border border-indigo-100">
                <Heart className="h-8 w-8 text-indigo-500 mb-4" />
                <h3 className="font-bold text-xl text-gray-800 mb-3">Community-Focused</h3>
                <p className="text-gray-600">We support local artists and create spaces for connection through our collective approach.</p>
              </div>
              
              <div className="bg-gradient-to-br from-pink-50 to-rose-50 p-6 rounded-xl border border-pink-100">
                <Sparkles className="h-8 w-8 text-pink-500 mb-4" />
                <h3 className="font-bold text-xl text-gray-800 mb-3">Quality-Obsessed</h3>
                <p className="text-gray-600">We curate only the finest art and complementary gifts, ensuring a premium experience every time.</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Our Mission Section */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12">
          <h2 className="font-bold text-3xl md:text-4xl text-gray-900 mb-8">Our Mission</h2>
          
          <div className="prose prose-lg max-w-none text-gray-600">
            <p className="text-xl mb-10">
              To democratize access to inspiring art while providing safe, convenient gifts for 21+ residents through a 
              <span className="text-violet-600 font-medium"> thoughtfully designed experience that delights at every touchpoint.</span>
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-8">
              <div className="flex items-start space-x-4">
                <div className="bg-violet-100 p-2 rounded-lg">
                  <Clock className="h-6 w-6 text-violet-600" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-gray-800 mb-2">Convenient Delivery</h3>
                  <p className="text-gray-600">Art and gifts delivered directly to your door throughout the D.C. area.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-indigo-100 p-2 rounded-lg">
                  <Shield className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-gray-800 mb-2">I-71 Compliant</h3>
                  <p className="text-gray-600">Fully compliant with Washington D.C.&apos;s Initiative 71 regulations.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-pink-100 p-2 rounded-lg">
                  <Palette className="h-6 w-6 text-pink-600" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-gray-800 mb-2">Curated Art</h3>
                  <p className="text-gray-600">Digital artwork selected for its beauty, meaning, and connection to our community.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-rose-100 p-2 rounded-lg">
                  <Users className="h-6 w-6 text-rose-600" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-gray-800 mb-2">Community Building</h3>
                  <p className="text-gray-600">Creating connections through shared appreciation of art and culture.</p>
                </div>
              </div>
            </div>
            
            <div className="mt-12 text-center">
              <Link href="/" className="inline-block bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium px-8 py-3 rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                Explore Our Collection
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
