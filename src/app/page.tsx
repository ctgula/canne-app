'use client';

import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';
import { products } from '@/data/products';
import { Shield, Truck, Palette, Instagram, Twitter, Facebook, Mail, Phone, MapPin, ArrowDown } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const scrollToCollection = () => {
    const element = document.getElementById('collection');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Enhanced Hero Section with Luxurious Background */}
      <section className="relative bg-gradient-to-br from-slate-50 via-violet-50/30 to-indigo-100/40 overflow-hidden min-h-[85vh] flex items-center">
        {/* Enhanced Animated Background Elements */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-40 h-40 bg-gradient-to-r from-violet-300 to-purple-400 rounded-full blur-3xl animate-float-slow"></div>
          <div className="absolute top-3/4 right-1/4 w-32 h-32 bg-gradient-to-r from-blue-300 to-indigo-400 rounded-full blur-3xl animate-float-delayed"></div>
          <div className="absolute bottom-1/4 left-1/3 w-48 h-48 bg-gradient-to-r from-emerald-300 to-teal-400 rounded-full blur-3xl animate-float-reverse"></div>
          <div className="absolute top-1/2 right-1/3 w-24 h-24 bg-gradient-to-r from-rose-300 to-pink-400 rounded-full blur-3xl animate-float-gentle"></div>
        </div>

        {/* Subtle overlay pattern */}
        <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(circle_500px_at_50%_200px,#8b5cf6,transparent)]"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
          <div className="space-y-8">
            {/* Enhanced Animated Title */}
            <div className="space-y-4">
              <h1 className="hero-title mb-6 animate-title-entrance">
                <span className="block text-sm uppercase tracking-wider text-pink-500 mb-2 animate-fade-up">Cannè Collection</span>
                <span className="inline-block animate-fade-up">Premium Digital Art</span>
                <span className="block text-violet-600 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent animate-fade-up-delayed">
                  with Complimentary Gifts
                </span>
              </h1>
              
              {/* Animated underline accent */}
              <div className="w-24 h-1 bg-gradient-to-r from-violet-500 to-purple-500 mx-auto rounded-full animate-expand-width"></div>
            </div>

            <p className="subtitle max-w-2xl mx-auto mb-8 md:mb-12 px-4 animate-fade-up-delayed-2">
              Discover beautiful digital artwork and receive carefully curated complimentary gifts with every purchase. 
              Legal and compliant in Washington, D.C.
            </p>
            
            {/* Enhanced Interactive Button */}
            <div className="animate-fade-up-delayed-3">
              <button 
                onClick={scrollToCollection}
                className="group relative btn-primary-enhanced overflow-hidden"
              >
                <span className="relative z-10 flex items-center space-x-3">
                  <span>View Collection</span>
                  <ArrowDown className="h-4 w-4 transform group-hover:translate-y-1 transition-transform duration-300" />
                </span>
                
                {/* Button background animations */}
                <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-purple-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              </button>
            </div>

            {/* Enhanced Feature Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-4xl mx-auto px-4 pt-8 animate-fade-up-delayed-4">
              <div className="text-center group">
                <div className="feature-icon-enhanced bg-gradient-to-br from-violet-500 to-purple-600 mx-auto mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <Palette className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-violet-700 transition-colors">Curated Collection</h3>
                <p className="text-gray-600 text-sm">Handpicked digital artwork from talented artists worldwide</p>
              </div>
              
              <div className="text-center group">
                <div className="feature-icon-enhanced bg-gradient-to-br from-blue-500 to-indigo-600 mx-auto mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <Truck className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors">Free Delivery</h3>
                <p className="text-gray-600 text-sm">Complimentary same-day delivery on orders over $40</p>
              </div>
              
              <div className="text-center group">
                <div className="feature-icon-enhanced bg-gradient-to-br from-emerald-500 to-teal-600 mx-auto mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <Shield className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-emerald-700 transition-colors">I-71 Compliant</h3>
                <p className="text-gray-600 text-sm">Fully legal and compliant gifting model</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section id="collection" className="py-12 md:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 md:mb-16">
            <h2 className="section-title mb-4 px-4">
              Digital Art Collection
            </h2>
            <p className="subtitle max-w-2xl mx-auto mb-6 md:mb-10 px-4">
              Each piece comes with a carefully selected complimentary gift. 
              The larger your purchase, the more generous the gift.
            </p>
            
            {/* Enhanced Tier Legend */}
            <div className="flex flex-wrap justify-center items-center gap-3 md:gap-4 mb-8 md:mb-12 px-4">
              <div className="flex items-center space-x-2 px-4 py-3 bg-white rounded-xl border-2 border-emerald-200 shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200">
                <div className="w-4 h-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full animate-pulse-gentle"></div>
                <span className="text-sm font-bold text-emerald-700">Essentials</span>
                <span className="hidden sm:inline text-xs text-gray-600">Quality package</span>
              </div>
              <div className="flex items-center space-x-2 px-4 py-3 bg-white rounded-xl border-2 border-violet-200 shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200">
                <div className="w-4 h-4 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full animate-pulse-gentle"></div>
                <span className="text-sm font-bold text-violet-700">Pro</span>
                <span className="hidden sm:inline text-xs text-gray-600">Enhanced gifts</span>
              </div>
              <div className="flex items-center space-x-2 px-4 py-3 bg-white rounded-xl border-2 border-amber-200 shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200">
                <div className="w-4 h-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full animate-pulse-gentle"></div>
                <span className="text-sm font-bold text-amber-700">Ultra</span>
                <span className="hidden sm:inline text-xs text-gray-600">Premium selection</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 md:gap-12 mb-12">
            {/* Brand Section */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center shadow-lg">
                  <span className="text-white text-lg font-bold">C</span>
                </div>
                <div className="text-3xl font-bold text-gray-900">Cannè</div>
              </div>
              <p className="text-gray-600 mb-8 max-w-md leading-relaxed">
                Premium digital art platform offering carefully curated artwork with complimentary gifts. 
                Fully compliant with Washington D.C. I-71 regulations.
              </p>
              
              {/* Enhanced Social Media */}
              <div className="flex space-x-4">
                <a href="https://instagram.com/canne" target="_blank" rel="noopener noreferrer" className="p-3 bg-gray-100 rounded-xl hover:bg-gray-200 hover:scale-105 transition-all duration-200 group">
                  <Instagram className="h-5 w-5 text-gray-600 group-hover:text-pink-600" />
                </a>
                <a href="https://twitter.com/canne" target="_blank" rel="noopener noreferrer" className="p-3 bg-gray-100 rounded-xl hover:bg-gray-200 hover:scale-105 transition-all duration-200 group">
                  <Twitter className="h-5 w-5 text-gray-600 group-hover:text-blue-600" />
                </a>
                <a href="https://facebook.com/canne" target="_blank" rel="noopener noreferrer" className="p-3 bg-gray-100 rounded-xl hover:bg-gray-200 hover:scale-105 transition-all duration-200 group">
                  <Facebook className="h-5 w-5 text-gray-600 group-hover:text-blue-700" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-6 text-lg">Quick Links</h3>
              <ul className="space-y-4 text-gray-600">
                <li><button onClick={scrollToCollection} className="hover:text-gray-900 hover:translate-x-1 hover:underline transition-all duration-200 text-left">Collection</button></li>
                <li><Link href="/about" className="hover:text-gray-900 hover:translate-x-1 hover:underline transition-all duration-200 block">About Us</Link></li>
                <li><Link href="/faq" className="hover:text-gray-900 hover:translate-x-1 hover:underline transition-all duration-200 block">FAQ</Link></li>
                <li><Link href="/admin/login" className="hover:text-gray-900 hover:translate-x-1 hover:underline transition-all duration-200 block">Admin</Link></li>
              </ul>
            </div>

            {/* Legal & Contact */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-6 text-lg">Legal & Contact</h3>
              <ul className="space-y-4 text-gray-600">
                <li><Link href="/terms" className="hover:text-gray-900 hover:translate-x-1 hover:underline transition-all duration-200 block">Terms & Conditions</Link></li>
                <li><Link href="/i71" className="hover:text-gray-900 hover:translate-x-1 hover:underline transition-all duration-200 block">I-71 Compliance</Link></li>
                <li><Link href="/privacy" className="hover:text-gray-900 hover:translate-x-1 hover:underline transition-all duration-200 block">Privacy Policy</Link></li>
                <li>
                  <a href="mailto:hello@canne.com" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 hover:text-gray-900 hover:underline transition-colors duration-200">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm">hello@canne.com</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Enhanced Bottom Bar */}
          <div className="border-t border-gray-200 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
              <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 sm:gap-6 md:gap-10 text-sm text-gray-500">
                <span className="flex items-center space-x-2 hover:text-gray-700 transition-colors">
                  <Palette className="h-4 w-4" />
                  <span>Curated Art</span>
                </span>
                <span className="flex items-center space-x-2 hover:text-gray-700 transition-colors">
                  <Truck className="h-4 w-4" />
                  <span>Free Delivery</span>
                </span>
                <span className="flex items-center space-x-2 hover:text-gray-700 transition-colors">
                  <Shield className="h-4 w-4" />
                  <span>I-71 Compliant</span>
                </span>
              </div>
              
              <div className="text-sm text-gray-500 text-center md:text-right">
                © {new Date().getFullYear()} Cannè. All rights reserved.
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
