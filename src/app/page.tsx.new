'use client';

import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';
import { products } from '@/data/products';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  const scrollToCollection = () => {
    const element = document.getElementById('collection');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-white pt-12 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Centered Logo */}
          <div className="mb-12 flex flex-col items-center">
            <div className="w-24 h-24 relative mb-2">
              <div className="w-20 h-20 bg-pink-500 rounded-full absolute top-0 left-1/2 -translate-x-1/2"></div>
              <div className="w-16 h-14 bg-amber-400 clip-cone-wide absolute bottom-0 left-1/2 -translate-x-1/2"></div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 uppercase tracking-wide">CANNÈ</h2>
            <p className="text-sm uppercase text-gray-600 tracking-wider">ART COLLECTIVE</p>
          </div>
          
          {/* Premium Drops Banner */}
          <div className="max-w-md mx-auto mb-12">
            <div className="bg-gradient-to-r from-amber-400 via-pink-500 to-purple-500 text-white py-3 px-6 rounded-full flex items-center justify-center">
              <span className="mr-2">🔥</span>
              <span className="font-medium">Premium Drops Starting at $20</span>
              <span className="ml-2">✨</span>
            </div>
          </div>
          
          {/* Headline */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
            Art-first. Street-approved.
          </h1>
          
          {/* CTA Button */}
          <div className="mb-16">
            <button 
              onClick={scrollToCollection}
              className="inline-flex items-center px-6 py-3 bg-pink-500 text-white font-medium rounded-full hover:bg-pink-600 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
            >
              Tap to unlock
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          {/* Features */}
          <div className="flex flex-wrap justify-center gap-8 mb-12">
            <div className="flex items-center">
              <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-sm text-gray-700">I71 Compliant</span>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-700">DC Delivery</span>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold mb-4">
              <span className="block">Premium Art Prints with</span>
              <span className="text-pink-500">Complimentary Gifts</span>
            </h2>
            
            <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
              Experience our curated collection of cannabis-inspired art.
              Each purchase includes a complimentary gift, delivered to your
              door in DC.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <button 
                onClick={scrollToCollection}
                className="px-6 py-3 bg-pink-500 text-white font-medium rounded-full hover:bg-pink-600 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
              >
                Shop the Menu
              </button>
              <Link 
                href="/how-it-works"
                className="px-6 py-3 bg-white text-gray-900 font-medium rounded-full border border-gray-300 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
              >
                How It Works
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Collection Section */}
      <div id="collection" className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Collection</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Browse our curated selection of premium digital art pieces, each paired with a complimentary gift.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
