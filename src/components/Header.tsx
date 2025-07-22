'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { Search, Menu, X, Sun, Moon, Home, Info, Shield, ShoppingBag, Sparkles } from 'lucide-react';
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
      <header className="fixed top-0 z-50 w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-sm border-b border-gray-100 dark:border-gray-800 h-16 md:h-20">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center group">
            <div className="flex items-center">
              <div className="h-12 w-12 md:h-14 md:w-14 relative mr-3 transition-all duration-300 hover:scale-110 hover:rotate-3">
                <Image 
                  src="/images/canne_logo.svg" 
                  alt="Cannè Art Collective" 
                  width={56}
                  height={56}
                  className="h-full w-auto drop-shadow-lg" 
                  priority
                />
              </div>
              <div className="ml-2">
                <span className="font-bold text-xl md:text-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-transparent bg-clip-text tracking-wide">CANNÈ</span>
                <span className="hidden sm:block text-xs text-gray-500 dark:text-gray-400 font-medium tracking-wider">ART COLLECTIVE</span>
              </div>
            </div>
          </Link>
          
          <nav className="hidden lg:flex items-center space-x-1">
            {[
              { href: '/', label: 'Home', icon: Home },
              { href: '/shop', label: 'Shop', icon: ShoppingBag },
              { href: '/how-it-works', label: 'How it Works', icon: Info, featured: true },
              { href: '/i71', label: 'I-71 Compliance', icon: Shield },
              { href: '/about', label: 'About', icon: Info }
            ].map(({ href, label, icon: Icon, featured }) => {
              const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
              const isActive = pathname === href;
              
              return (
                <Link
                  key={href}
                  href={href}
                  className={`relative px-4 py-2 rounded-xl font-medium text-sm transition-all duration-300 group ${
                    isActive 
                      ? 'text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-900/20' 
                      : featured
                      ? 'text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Icon size={16} className="opacity-70 group-hover:opacity-100 transition-opacity" />
                    {label}
                  </span>
                  {isActive && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-pink-500 rounded-full" />
                  )}
                </Link>
              );
            })}
            
            <div className="flex items-center space-x-2 ml-6 pl-6 border-l border-gray-200 dark:border-gray-700">
              <button 
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200"
                title="Search"
              >
                <Search size={18} />
              </button>
              <button 
                onClick={toggleTheme} 
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200"
                title={isDarkMode ? 'Light mode' : 'Dark mode'}
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button 
                onClick={toggleCart} 
                className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200"
                title="Shopping cart"
              >
                <ShoppingBag size={18} />
                {getItemCount() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg animate-pulse">
                    {getItemCount()}
                  </span>
                )}
              </button>
            </div>
          </nav>
          
          <div className="lg:hidden flex items-center space-x-2">
            <button 
              onClick={toggleCart} 
              className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200"
              title="Shopping cart"
            >
              <ShoppingBag size={20} />
              {getItemCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg">
                  {getItemCount()}
                </span>
              )}
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
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
        </div>
        
        {/* Enhanced Cart Dropdown */}
        {isCartOpen && (
          <div className="absolute right-4 lg:right-8 top-full mt-2 w-80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden" ref={cartRef}>
            <CartDisplay />
          </div>
        )}
      </header>
      
      {/* Enhanced Mobile Drawer */}
      {isMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={() => setIsMenuOpen(false)}
          />
          
          {/* Drawer */}
          <div className="fixed top-0 right-0 z-50 h-full w-80 max-w-[85vw] bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-2xl border-l border-gray-200 dark:border-gray-700 lg:hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 relative">
                  <Image 
                    src="/images/canne_logo.svg" 
                    alt="Cannè" 
                    width={32}
                    height={32}
                    className="h-full w-auto" 
                  />
                </div>
                <span className="font-bold text-lg bg-gradient-to-r from-pink-500 to-purple-600 text-transparent bg-clip-text">Menu</span>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Close menu"
              >
                <X className="h-6 w-6 text-gray-600 dark:text-gray-300" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex flex-col p-6 space-y-2">
              {[
                { href: '/', label: 'Home', icon: Home },
                { href: '/shop', label: 'Shop', icon: ShoppingBag },
                { href: '/how-it-works', label: 'How it Works', icon: Info, featured: true },
                { href: '/i71', label: 'I-71 Compliance', icon: Shield },
                { href: '/about', label: 'About', icon: Info }
              ].map(({ href, label, icon: Icon, featured }) => {
                const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
                const isActive = pathname === href;
                
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                      isActive 
                        ? 'bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 font-semibold' 
                        : featured
                        ? 'text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }`}
                  >
                    <Icon size={20} className="opacity-70" />
                    <span>{label}</span>
                    {isActive && (
                      <div className="ml-auto w-2 h-2 bg-pink-500 rounded-full" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Utilities */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Settings</span>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  className="flex-1 flex items-center justify-center gap-2 p-3 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                  title="Search"
                >
                  <Search size={18} />
                  <span className="text-sm">Search</span>
                </button>
                <button 
                  onClick={toggleTheme}
                  className="flex-1 flex items-center justify-center gap-2 p-3 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                  title={isDarkMode ? 'Light mode' : 'Dark mode'}
                >
                  {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                  <span className="text-sm">{isDarkMode ? 'Light' : 'Dark'}</span>
                </button>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="p-6 space-y-3 border-t border-gray-200 dark:border-gray-700 mt-auto">
              <Link
                href="/shop"
                onClick={() => setIsMenuOpen(false)}
                className="block w-full rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 py-4 text-center text-white font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                <span className="flex items-center justify-center gap-2">
                  <Sparkles size={18} />
                  Explore Collection
                </span>
              </Link>

              {getItemCount() > 0 && (
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    toggleCart();
                  }}
                  className="block w-full rounded-2xl border border-gray-300 dark:border-gray-600 py-4 text-center font-semibold text-gray-700 dark:text-gray-300 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                >
                  <span className="flex items-center justify-center gap-2">
                    <ShoppingBag size={18} />
                    View Cart ({getItemCount()})
                  </span>
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
