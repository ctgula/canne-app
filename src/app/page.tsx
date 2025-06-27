'use client';

import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';
import { products } from '@/data/products';
import Link from 'next/link';

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
      
      {/* Hero Section - Optimized blend of designs */}
      <div className="bg-white pt-16 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Centered Logo with enhanced styling */}
          <div className="mb-10 flex flex-col items-center">
            <div className="w-32 h-32 relative mb-3">
              <div className="w-28 h-28 bg-pink-500 rounded-full absolute top-0 left-1/2 -translate-x-1/2 shadow-md"></div>
              <div className="w-20 h-20 bg-amber-400 absolute bottom-0 left-1/2 -translate-x-1/2" 
                   style={{ clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }}></div>
            </div>
            <h2 className="text-4xl font-bold text-pink-500 uppercase tracking-wide">CANNÈ</h2>
            <p className="text-sm uppercase text-gray-600 tracking-widest mt-1">ART COLLECTIVE</p>
          </div>
          
          {/* Premium Drops Banner - Vibrant and eye-catching */}
          <div className="mb-10 max-w-xl mx-auto">
            <div className="bg-gradient-to-r from-amber-400 via-pink-500 to-purple-500 text-white py-3 px-6 rounded-xl flex items-center justify-center shadow-lg">
              <span className="mr-2">🔥</span>
              <span className="font-medium">Premium Drops Starting at $20</span>
              <span className="ml-2">✨</span>
            </div>
          </div>
          
          {/* Headline - Bold and impactful */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
            Art-first.<br />Street-approved.
          </h1>
          
          {/* Subheadline - Clean and informative */}
          <p className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto mb-10">
            Premium digital art prints with complimentary gifts. Each purchase supports local artists and comes with a special gift for you to enjoy.
          </p>
          
          {/* Feature Highlights - Clean and informative */}
          <div className="flex flex-wrap justify-center gap-5 mb-10">
            <div className="bg-gray-50 px-5 py-2.5 rounded-full text-sm font-medium text-gray-700 shadow-sm border border-gray-100 flex items-center">
              <span className="text-green-500 mr-1.5">✅</span> I-71 Compliant
            </div>
            <div className="bg-gray-50 px-5 py-2.5 rounded-full text-sm font-medium text-gray-700 shadow-sm border border-gray-100 flex items-center">
              <span className="text-amber-500 mr-1.5">🚚</span> DC Delivery
            </div>
          </div>
          
          {/* Primary CTA - Bold and attention-grabbing */}
          <div className="mb-8">
            <button 
              onClick={scrollToCollection}
              className="inline-flex items-center px-8 py-3.5 bg-pink-500 text-white font-medium text-lg rounded-full hover:bg-pink-600 transition-all duration-300 hover:shadow-lg active:scale-98 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
            >
              Tap to unlock
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          {/* Secondary CTAs - Clean and accessible */}
          <div className="flex flex-wrap justify-center gap-4">
            <button 
              onClick={scrollToCollection}
              className="flex items-center px-6 py-2.5 bg-gray-900 text-white font-medium rounded-full hover:bg-black transition-all duration-200 hover:shadow-md active:scale-95 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2 group"
            >
              <span>Shop the Menu</span>
              <span className="ml-1.5 group-hover:translate-x-0.5 transition-transform">→</span>
            </button>
            <Link 
              href="/how-it-works"
              className="flex items-center px-6 py-2.5 bg-white text-gray-800 font-medium rounded-full border border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 hover:shadow-sm active:scale-95 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 group"
            >
              <span>How It Works</span>
              <span className="ml-1.5 group-hover:translate-x-0.5 transition-transform">→</span>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Collection Section - Refined and elegant */}
      <div id="collection" className="py-20 md:py-24 bg-gray-50">
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
