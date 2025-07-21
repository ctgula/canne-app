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
  
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.classList.add('menu-open');
    } else {
      document.body.style.overflow = '';
      document.body.classList.remove('menu-open');
    }
    return () => {
      document.body.style.overflow = '';
      document.body.classList.remove('menu-open');
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
    <header className="sticky top-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-sm z-50 py-2 sm:py-3 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
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
              aria-label="Open menu"
              aria-expanded={isMenuOpen}
              onClick={openMenu}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800 transition-colors"
            >
              <Menu size={24} />
            </button>
          </div>
          
          {/* Cart Dropdown */}
          {isCartOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-900 rounded-lg shadow-xl z-50 overflow-hidden" ref={cartRef}>
              <CartDisplay />
            </div>
          )}
          
          {isMenuOpen && (
            <div
              id="mobile-menu"
              className="fixed inset-0 z-50 flex flex-col space-y-8 backdrop-blur-sm bg-white/95 dark:bg-gray-900/95 px-6 pt-24 pb-10 text-2xl font-semibold transition-transform duration-300"
            >
              <button
                aria-label="Close menu"
                onClick={closeMenu}
                className="absolute top-6 right-6 text-3xl text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                ×
              </button>
              
              {['Home', 'Shop', 'How it Works', 'I-71 Compliance', 'About'].map((item) => (
                <Link
                  key={item}
                  href={navPath(item)}
                  onClick={closeMenu}
                  className="w-full border-b border-gray-200 dark:border-gray-700 pb-4 text-gray-900 dark:text-white hover:text-pink-500 transition-colors"
                >
                  {item}
                </Link>
              ))}
              
              <div className="mt-auto space-y-4">
                <button 
                  onClick={() => {
                    closeMenu();
                    if (scrollToCollection) scrollToCollection();
                  }}
                  className="w-full py-4 px-6 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl text-lg"
                >
                  View Art Collection
                </button>
                
                <button 
                  onClick={() => {
                    closeMenu();
                    toggleCart();
                  }}
                  className="w-full py-4 px-6 flex items-center justify-center space-x-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-semibold rounded-lg transition-all duration-300 hover:bg-gray-200 dark:hover:bg-gray-700 text-lg"
                >
                  <ShoppingBag size={20} />
                  <span>View Cart ({getItemCount()})</span>
                </button>
                
                <button 
                  onClick={() => {
                    closeMenu();
                    toggleTheme();
                  }}
                  className="w-full py-3 px-6 flex items-center justify-center space-x-2 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-800 text-lg"
                >
                  {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                  <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
