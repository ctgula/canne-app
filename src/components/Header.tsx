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

export default function Header({scrollToCollection}: HeaderProps) {
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

  const openMenu = () => {
    setIsMenuOpen(true);
    document.body.classList.add('overflow-hidden');
  };
  
  const closeMenu = () => {
    setIsMenuOpen(false);
    document.body.classList.remove('overflow-hidden');
  };
  
  const navPath = (item: string) => {
    switch(item) {
      case 'Home': return '/';
      case 'Shop': return '/shop';
      case 'How it Works': return '/how-it-works';
      case 'I-71 Compliance': return '/i71';
      case 'About': return '/about';
      default: return '/';
    }
  };
  
  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  return (
    <header className="sticky top-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-sm z-50 py-2 sm:py-3 transition-colors duration-200 safe-top will-change-transform">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between min-h-[44px]">
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
            {/* Mobile menu button - Apple-optimized touch target */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 active:scale-95 min-w-[44px] min-h-[44px] flex items-center justify-center will-change-transform"
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6 text-gray-700 dark:text-gray-300" />
              ) : (
                <Menu className="h-6 w-6 text-gray-700 dark:text-gray-300" />
              )}
            </button>
          </div>
          
          {/* Cart Dropdown */}
          {isCartOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-900 rounded-lg shadow-xl z-50 overflow-hidden" ref={cartRef}>
              <CartDisplay />
            </div>
          )}
          
          {isMenuOpen && (
            <div className="fixed inset-0 z-50 bg-white/90 backdrop-blur-md">
              <button
                aria-label="Close"
                onClick={closeMenu}
                className="absolute top-5 right-6 text-3xl font-light text-gray-700"
              >
                &times;
              </button>

              <nav className="mt-24 flex flex-col space-y-6 px-8 text-2xl font-semibold text-gray-900">
                {['Home', 'Shop', 'How it Works', 'I-71 Compliance', 'About'].map((item) => {
                  const href = navPath(item);
                  const isActive = typeof window !== 'undefined' && window.location.pathname === href;
                  
                  return (
                    <Link
                      key={item}
                      href={href}
                      className={`border-b border-gray-200 pb-4 ${
                        isActive ? 'font-bold' : 'font-semibold'
                      }`}
                      onClick={closeMenu}
                    >
                      {item}
                    </Link>
                  );
                })}

                <Link
                  href="/collection"
                  className="mt-8 w-full rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 py-4 text-center text-white shadow-lg"
                  onClick={closeMenu}
                >
                  View Art Collection
                </Link>

                <Link
                  href="/cart"
                  className="w-full rounded-xl border border-gray-300 py-4 text-center shadow-sm"
                  onClick={closeMenu}
                >
                  View Cart ({getItemCount()})
                </Link>
              </nav>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
