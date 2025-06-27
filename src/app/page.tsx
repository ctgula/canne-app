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
      
      {/* Hero Section - Apple-inspired clean design */}
      <div className="bg-white pt-16 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Centered Logo with minimalist styling */}
          <div className="mb-16 flex flex-col items-center">
            <div className="w-32 h-32 relative mb-4">
              <div className="w-28 h-28 bg-pink-500 rounded-full absolute top-0 left-1/2 -translate-x-1/2"></div>
              <div className="w-20 h-20 bg-amber-400 absolute bottom-0 left-1/2 -translate-x-1/2" 
                   style={{ clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }}></div>
            </div>
            <h2 className="text-4xl font-bold text-pink-500 uppercase tracking-wide">CANNÈ</h2>
            <p className="text-sm uppercase text-gray-500 tracking-widest mt-1 letter-spacing-2">ART COLLECTIVE</p>
          </div>
          
          {/* Apple-inspired headline and subheadline */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-semibold text-gray-900 mb-6 tracking-tight">Art-first.<br />Street-approved.</h1>
            <p className="text-xl md:text-2xl text-gray-500 max-w-3xl mx-auto font-light leading-relaxed">
              Premium digital art prints with complimentary gifts. Each purchase supports local artists and comes with a special gift for you to enjoy.
            </p>
          </div>
          
          {/* Premium Drops Banner with subtle gradient */}
          <div className="mb-16 bg-gradient-to-r from-pink-500/90 to-purple-600/90 rounded-2xl p-6 text-white shadow-lg max-w-3xl mx-auto backdrop-blur-sm">
            <p className="text-lg font-medium flex items-center justify-center gap-3">
              <span>✨</span> PREMIUM DROPS AVAILABLE NOW <span>✨</span>
            </p>
          </div>
          
          {/* Feature Highlights with Apple-like spacing */}
          <div className="flex flex-wrap justify-center gap-6 mb-16">
            <div className="bg-gray-50 px-6 py-3 rounded-full text-sm font-medium text-gray-700 shadow-sm">
              ✅ I-71 Compliant
            </div>
            <div className="bg-gray-50 px-6 py-3 rounded-full text-sm font-medium text-gray-700 shadow-sm">
              🚚 DC Delivery
            </div>
          </div>
          
          {/* CTA Section with Apple-inspired buttons */}
          <div className="flex flex-col items-center gap-8 mb-16">
            <button 
              onClick={scrollToCollection}
              className="bg-pink-500 hover:bg-pink-600 text-white px-10 py-4 rounded-full font-medium text-lg transition-all duration-300 hover:shadow-lg active:scale-98 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 w-64"
            >
              Tap to unlock
            </button>
            
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              <button 
                onClick={scrollToCollection}
                className="bg-gray-900 hover:bg-black text-white px-8 py-3 rounded-full font-medium text-base transition-all duration-200 hover:shadow-md active:scale-95 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2"
              >
                Shop the Menu
              </button>
              <Link 
                href="/how-it-works"
                className="bg-white border border-gray-300 hover:border-gray-400 text-gray-800 px-8 py-3 rounded-full font-medium text-base transition-all duration-200 hover:shadow-sm active:scale-95 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
              >
                How It Works
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Collection Section with Apple-inspired spacing and typography */}
      <div id="collection" className="py-24 md:py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-6 tracking-tight">Our Collection</h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto font-light">
              Explore our curated selection of premium digital art prints, each paired with a special gift.
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
