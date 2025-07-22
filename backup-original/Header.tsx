'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { Search, Menu, X, Sun, Moon, Home, Info, Shield, ShoppingBag } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useCartStore } from '@/services/CartService';
import Image from 'next/image';
import CartDisplay from './CartDisplay';

interface HeaderProps {
  scrollToCollection?: () => void;
}

export default function Header({ scrollToCollection }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === 'dark';
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const cartRef = useRef<HTMLDivElement>(null);
  
  // Get cart data from our store
  const { getItemCount } = useCartStore();
  
  // Body scroll lock for mobile menu
  useEffect(() => {
    document.body.classList.toggle('overflow-hidden', isMenuOpen);
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [isMenuOpen]);
  
  // Handle clicking outside of cart to close it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (cartRef.current && !cartRef.current.contains(event.target as Node)) {
        setIsCartOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [cartRef]);

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  return (
    <>
      <header className="fixed top-0 z-50 w-full bg-white shadow-sm h-16 md:h-20">
        <div className="mx-auto flex h-full max-w-screen-lg items-center justify-between px-4">
          <Link href="/" className="flex items-center group">
            <div className="flex items-center">
              <div className="h-48 w-auto relative mr-5 transition-transform duration-300 hover:scale-105">
                <Image 
                  src="/images/canne_logo.svg" 
                  alt="Cannè Art Collective" 
                  width={192}
                  height={192}
                  className="h-full w-auto drop-shadow-lg" 
                  priority
                />
              </div>
              <div className="ml-3">
                <span className="font-bold text-2xl text-pink-500 tracking-wide">CANNÈ</span>
                <span className="block text-sm text-gray-600 dark:text-gray-300 font-medium">ART COLLECTIVE</span>
              </div>
            </div>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white font-medium text-sm transition-colors">Home</Link>
            <Link href="/shop" className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white font-medium text-sm transition-colors">Shop</Link>
            <Link href="/how-it-works" className="text-pink-500 hover:text-pink-600 font-semibold text-sm transition-colors">How it Works</Link>
            <Link href="/i71" className="text-gray-700 hover:text-gray-900 font-medium text-sm transition-colors">I71 Compliance</Link>
            <Link href="/about" className="text-gray-700 hover:text-gray-900 font-medium text-sm transition-colors">About</Link>
            
            <div className="flex items-center space-x-4">
              <button className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                <Search size={20} />
              </button>
              <button onClick={toggleTheme} className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button 
                onClick={toggleCart} 
                className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white relative"
              >
                <ShoppingBag size={20} />
                {getItemCount() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {getItemCount()}
                  </span>
                )}
              </button>
            </div>
          </nav>
          
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6 text-gray-700" />
              ) : (
                <svg width="28" height="20" viewBox="0 0 18 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-gray-700">
                  <path d="M1 1h16M1 6h16M1 11h16"/>
                </svg>
              )}
            </button>
          </div>
        </div>
        
        {/* Cart Dropdown */}
        {isCartOpen && (
          <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-900 rounded-lg shadow-xl z-50 overflow-hidden" ref={cartRef}>
            <CartDisplay />
          </div>
        )}
      </header>
      
      {/* Mobile Drawer */}
      {isMenuOpen && (
        <div id="drawer" className="fixed inset-0 z-60 bg-white">
          <button
            aria-label="Close menu"
            onClick={() => setIsMenuOpen(false)}
            className="self-end p-6 text-3xl text-gray-600"
          >
            &times;
          </button>

          <nav className="pt-20 flex flex-col space-y-6 px-8 text-lg font-semibold">
            {[
              { href: '/', label: 'Home' },
              { href: '/shop', label: 'Shop' },
              { href: '/how-it-works', label: 'How it Works' },
              { href: '/i71', label: 'I-71 Compliance' },
              { href: '/about', label: 'About' }
            ].map(({ href, label }) => {
              const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
              const isActive = pathname === href;
              
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`border-b border-gray-200 pb-4 ${
                    isActive ? 'font-bold text-gray-900' : 'font-semibold text-gray-700'
                  } hover:text-purple-600 transition-colors`}
                >
                  {label}
                </Link>
              );
            })}

            <div className="mt-8 space-y-4">
              <Link
                href="/collection"
                onClick={() => setIsMenuOpen(false)}
                className="block w-full rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 py-4 text-center text-white font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                View Art Collection
              </Link>

              <Link
                href="/cart"
                onClick={() => setIsMenuOpen(false)}
                className="block w-full rounded-xl border border-gray-300 py-4 text-center font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-all"
              >
                View Cart ({getItemCount()})
              </Link>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
