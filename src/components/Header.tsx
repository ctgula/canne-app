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
  
  // Force close mobile menu on component mount and on any route change
  useEffect(() => {
    setIsMenuOpen(false);
    setIsCartOpen(false);
    
    // Also close menu when window is resized to desktop size
    const handleResize = () => {
      if (window.innerWidth >= 1024) { // lg breakpoint
        setIsMenuOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Get cart data from our store
  const { getItemCount, getTotal } = useCartStore();
  
  // Optimized body scroll lock for mobile menu
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
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
      <header className="fixed top-0 z-50 w-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-lg border-b border-gray-200/50 dark:border-gray-700/50 h-16">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center group">
            <div className="flex items-center">
              <div className="h-10 w-10 relative mr-2 transition-all duration-300 hover:scale-105">
                <Image 
                  src="/images/canne_logo.svg" 
                  alt="Cannè Art Collective" 
                  width={40}
                  height={40}
                  className="h-full w-auto drop-shadow-lg" 
                  priority
                />
              </div>
              <div className="ml-1">
                <span className="font-bold text-lg bg-gradient-to-r from-pink-500 to-purple-600 text-transparent bg-clip-text tracking-wide">CANNÈ</span>
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
            
            <div className="flex items-center space-x-2 ml-6 pl-6 border-l border-gray-200">
              <button 
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-200"
                title="Search"
              >
                <Search size={18} />
              </button>
              <button 
                onClick={toggleCart} 
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-200 group"
                title={getItemCount() > 0 ? `Cart (${getItemCount()} items) - Subtotal: $${getTotal()}` : "Shopping cart"}
              >
                <ShoppingBag size={18} />
                {getItemCount() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center shadow-lg">
                    {getItemCount()}
                  </span>
                )}
                {/* Tooltip */}
                {getItemCount() > 0 && (
                  <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                    Subtotal: ${getTotal()}
                  </div>
                )}
              </button>
            </div>
          </nav>
          
          <div className="lg:hidden flex items-center space-x-2">
            <button 
              onClick={toggleCart} 
              className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-200 group"
              title={getItemCount() > 0 ? `Cart (${getItemCount()} items) - Subtotal: $${getTotal()}` : "Shopping cart"}
            >
              <ShoppingBag size={20} />
              {getItemCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center shadow-lg">
                  {getItemCount()}
                </span>
              )}
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-xl hover:bg-gray-100 transition-all duration-200"
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6 text-gray-700" />
              ) : (
                <Menu className="h-6 w-6 text-gray-700" />
              )}
            </button>
          </div>
        </div>
        
        {/* Enhanced Cart Dropdown */}
        {isCartOpen && (
          <div className="absolute right-2 sm:right-4 lg:right-8 top-full mt-2 w-[calc(100vw-1rem)] max-w-sm sm:w-80 bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-[55] overflow-hidden" ref={cartRef}>
            <CartDisplay />
          </div>
        )}
      </header>
      
      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-[60] flex lg:hidden"
          onClick={() => setIsMenuOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-xl" />

          {/* Panel */}
          <nav
            className="relative ml-auto w-full max-w-none sm:max-w-xs h-full bg-white dark:bg-gray-900 shadow-xl px-6 pt-20 space-y-6 overflow-y-auto transform transition-transform duration-300 ease-in-out"
            onClick={e => e.stopPropagation()}
          >
            {/* Close Button */}
            <div className="absolute top-4 right-4">
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-3 rounded-full bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
                aria-label="Close menu"
              >
                <X className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </button>
            </div>

            {/* Menu Header */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 text-transparent bg-clip-text mb-2">
                Navigation
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Explore our art & gifting collection
              </p>
            </div>

            {/* Navigation Links */}
            <div className="space-y-2">
              {[
                { href: '/', label: 'Home', icon: Home, description: 'Welcome to Cannè' },
                { href: '/shop', label: 'Shop Collection', icon: ShoppingBag, description: 'Browse our art tiers' },
                { href: '/how-it-works', label: 'How It Works', icon: Info, featured: true, description: 'Learn about our process' },
                { href: '/i71', label: 'I-71 Compliance', icon: Shield, description: 'Legal information' },
                { href: '/about', label: 'About Us', icon: Info, description: 'Our story & mission' }
              ].map(({ href, label, icon: Icon, featured, description }) => {
                const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
                const isActive = pathname === href;
                
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`group flex items-center gap-4 p-4 rounded-xl transition-all duration-200 ${
                      isActive 
                        ? 'bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400' 
                        : featured
                        ? 'text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800/50'
                    }`}
                  >
                    <div className={`p-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-pink-100 dark:bg-pink-800/30'
                        : featured
                        ? 'bg-purple-100 dark:bg-purple-800/30 group-hover:bg-purple-200 dark:group-hover:bg-purple-700/40'
                        : 'bg-gray-100 dark:bg-zinc-700 group-hover:bg-gray-200 dark:group-hover:bg-zinc-600'
                    }`}>
                      <Icon size={20} />
                    </div>
                    <div className="flex-1">
                      <div className={`font-semibold ${isActive ? 'font-bold' : ''}`}>
                        {label}
                      </div>
                      <div className="text-xs opacity-70 mt-0.5">
                        {description}
                      </div>
                    </div>
                    {isActive && (
                      <div className="w-2 h-2 bg-pink-500 rounded-full" />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Utilities */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-zinc-700">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
                Preferences
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  className="flex items-center justify-center gap-2 p-3 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
                  title="Search"
                >
                  <Search size={18} />
                  <span className="text-sm font-medium">Search</span>
                </button>
                <button 
                  onClick={toggleTheme}
                  className="flex items-center justify-center gap-2 p-3 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
                  title={isDarkMode ? 'Light mode' : 'Dark mode'}
                >
                  {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                  <span className="text-sm font-medium">{isDarkMode ? 'Light' : 'Dark'}</span>
                </button>
              </div>
            </div>

            {/* Call-to-Action */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-zinc-700 space-y-3">
              <Link
                href="/shop"
                onClick={() => setIsMenuOpen(false)}
                className="group block w-full rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 p-4 text-white font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
              >
                <div className="flex items-center justify-center gap-3">
                  <div className="p-1 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
                    <Sparkles size={18} />
                  </div>
                  <span>Explore Collection</span>
                </div>
                <div className="text-xs text-white/80 text-center mt-1">
                  Discover our art & gifting tiers
                </div>
              </Link>

              {getItemCount() > 0 && (
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    toggleCart();
                  }}
                  className="group block w-full rounded-2xl border-2 border-gray-200 dark:border-zinc-700 p-4 font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-all duration-300 hover:scale-[1.02]"
                >
                  <div className="flex items-center justify-center gap-3">
                    <div className="p-1 bg-gray-100 dark:bg-zinc-700 rounded-lg group-hover:bg-gray-200 dark:group-hover:bg-zinc-600 transition-colors">
                      <ShoppingBag size={18} />
                    </div>
                    <span>View Cart ({getItemCount()})</span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">
                    Review your selected items
                  </div>
                </button>
              )}
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
