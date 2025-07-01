'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Search, ShoppingCart, Menu, X, Sun, Moon, Home, ShoppingBag, Info, Shield } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useTheme } from '@/contexts/ThemeContext';
import Image from 'next/image';

interface HeaderProps {
  scrollToCollection?: () => void;
}

export default function Header({}: HeaderProps) {
  const { items } = useCart();
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === 'dark';
  const cartItemCount = items.length;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="sticky top-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-sm z-50 py-2 sm:py-3 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center group">
            <div className="flex items-center">
              <div className="h-24 w-auto relative mr-3 transition-transform duration-300 hover:scale-105">
                <Image 
                  src="/images/canne_logo.svg" 
                  alt="Cannè Art Collective" 
                  width={96}
                  height={96}
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
              <Link href="/cart" className="text-pink-500 hover:text-pink-600 relative">
                <ShoppingCart size={20} />
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-pink-500 text-white text-xs flex items-center justify-center rounded-full">
                    {cartItemCount}
                  </span>
                )}
              </Link>
            </div>
          </nav>
          
          <div className="md:hidden flex items-center">
            <button 
              onClick={toggleMenu}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
          
          {isMenuOpen && (
            <div className="md:hidden fixed inset-0 z-50 bg-black bg-opacity-50" onClick={toggleMenu}>
              <div className="absolute right-0 top-0 h-full w-3/4 max-w-xs bg-white dark:bg-gray-900 shadow-xl transform transition-transform duration-300 ease-in-out" onClick={(e) => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                  <span className="font-bold text-pink-500">Menu</span>
                  <button 
                    onClick={toggleMenu}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <X size={20} className="text-gray-600 dark:text-gray-300" />
                  </button>
                </div>
                
                <nav className="p-4 flex flex-col space-y-2">
                  <Link href="/" className="flex items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800" onClick={toggleMenu}><Home size={18} className="mr-3" />Home</Link>
                  <Link href="/shop" className="flex items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800" onClick={toggleMenu}><ShoppingBag size={18} className="mr-3" />Shop</Link>
                  <Link href="/how-it-works" className="flex items-center p-3 rounded-lg text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/20" onClick={toggleMenu}><Info size={18} className="mr-3" />How it Works</Link>
                  <Link href="/i71" className="flex items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800" onClick={toggleMenu}><Shield size={18} className="mr-3" />I71 Compliance</Link>
                  <Link href="/about" className="flex items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800" onClick={toggleMenu}><Info size={18} className="mr-3" />About</Link>
                </nav>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
