'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { useState } from 'react';
import CartModal from './CartModal';

export default function Header() {
  const { cart } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const itemCount = cart.items.reduce((total, item) => total + item.quantity, 0);

  const scrollToCollection = () => {
    const element = document.getElementById('collection');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white py-4 border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Left Logo */}
            <Link href="/" className="flex items-center group">
              <div className="flex items-center">
                <div className="w-10 h-10 relative flex items-center justify-center">
                  {/* Fallback logo with CSS if image is not available */}
                  <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center">
                    <div className="w-5 h-4 bg-amber-400 rounded-b-full mt-2"></div>
                  </div>
                </div>
                <div className="ml-1 flex flex-col">
                  <div className="text-lg font-bold text-pink-500 uppercase tracking-wide group-hover:text-pink-600 transition-colors">
                    CANNÈ
                  </div>
                  <div className="text-[10px] uppercase text-gray-500 tracking-wider -mt-1">
                    Art Collective
                  </div>
                </div>
              </div>
            </Link>
            
            {/* Center Navigation */}
            <nav className="hidden md:flex items-center justify-center space-x-8">
              <Link href="/" className="text-gray-700 hover:text-gray-900 font-medium text-sm transition-colors">
                Home
              </Link>
              <button 
                onClick={scrollToCollection}
                className="text-gray-700 hover:text-gray-900 font-medium text-sm transition-colors"
              >
                Shop
              </button>
              <Link href="/how-it-works" className="text-gray-700 hover:text-gray-900 font-medium text-sm transition-colors">
                How it Works
              </Link>
              <Link href="/i71" className="text-gray-700 hover:text-gray-900 font-medium text-sm transition-colors">
                I71 Compliance
              </Link>
              <Link href="/about" className="text-gray-700 hover:text-gray-900 font-medium text-sm transition-colors">
                About
              </Link>
            </nav>

            {/* Right Side Icons */}
            <div className="flex items-center space-x-4">
              {/* Search Icon */}
              <button className="p-2 text-gray-700 hover:text-gray-900 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              
              {/* Theme Toggle - Sun Icon */}
              <button className="p-2 text-gray-700 hover:text-gray-900 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </button>
              
              {/* Cart Icon */}
              <button 
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-gray-700 hover:text-gray-900 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Cart Modal */}
      <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
} 