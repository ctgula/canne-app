'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { Search, ShoppingCart, Menu, X, Sun, Moon, ChevronDown, Home, ShoppingBag, Info, Shield } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useTheme } from '@/contexts/ThemeContext';
import Image from 'next/image';

interface HeaderProps {
  scrollToCollection?: () => void;
  cartItemCount?: number;
}

interface ShopCategory {
  name: string;
  href: string;
  items: string[];
}

export default function Header({}: HeaderProps) {
  const { items } = useCart();
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === 'dark';
  const cartItemCount = items.length;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isShopMenuOpen, setIsShopMenuOpen] = useState(false);
  const shopMenuRef = useRef<HTMLDivElement>(null);
  const shopButtonRef = useRef<HTMLButtonElement>(null);
  
  // Shop categories for dropdown
  const shopCategories: ShopCategory[] = [
    { name: 'Flowers', href: '/shop/flowers', items: ['Starter', 'Classic', 'Black', 'Ultra'] }
  ];

  // Close shop menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        shopMenuRef.current && 
        !shopMenuRef.current.contains(event.target as Node) &&
        shopButtonRef.current && 
        !shopButtonRef.current.contains(event.target as Node)
      ) {
        setIsShopMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Handle body scroll lock when mobile menu is open
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
    if (isShopMenuOpen) setIsShopMenuOpen(false);
  };

  const toggleShopMenu = () => {
    setIsShopMenuOpen(!isShopMenuOpen);
  };

  // Theme toggle is now handled by ThemeContext

  return (
    <header className="sticky top-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-sm z-50 py-3 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center group">
            <div className="flex items-center">
              <div className="h-16 w-auto relative mr-2">
                {/* Cannè Logo */}
                <Image 
                  src="/images/canne_logo.svg" 
                  alt="Cannè" 
                  width={64}
                  height={64}
                  className="h-full w-auto" 
                />
              </div>
              <div className="ml-2">
                <span className="font-bold text-xl text-pink-500">CANNÈ</span>
                <span className="block text-xs text-gray-500 dark:text-gray-400">ART COLLECTIVE</span>
              </div>
            </div>
          </Link>
          
          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <nav className="flex items-center space-x-6">
              <Link 
                href="/" 
                className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white font-medium text-sm transition-colors"
              >
                Home
              </Link>
              
              <div className="relative" ref={shopMenuRef}>
                <button 
                  ref={shopButtonRef}
                  onClick={toggleShopMenu}
                  className="flex items-center text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white font-medium text-sm transition-colors"
                >
                  Shop
                  <ChevronDown size={16} className="ml-1" />
                </button>
                
                {isShopMenuOpen && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-gray-800 shadow-lg rounded-md overflow-hidden z-50 py-2 transition-colors duration-200">
                    {shopCategories.map((category) => (
                      <div key={category.name} className="px-4 py-2">
                        <Link 
                          href={category.href}
                          className="block text-sm font-medium text-gray-700 hover:text-pink-500"
                        >
                          {category.name}
                        </Link>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {category.items.map((item) => (
                            <Link 
                              key={item}
                              href={`${category.href}/${item.toLowerCase()}`}
                              className="text-xs text-gray-500 hover:text-pink-500"
                            >
                              {item}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                    <div className="border-t border-gray-100 mt-2 pt-2 px-4">
                      <Link 
                        href="/shop"
                        className="block py-1 text-sm text-pink-500 font-medium"
                      >
                        View All Products
                      </Link>
                    </div>
                  </div>
                )}
              </div>
              
              <Link 
                href="/how-it-works" 
                className="text-pink-500 hover:text-pink-600 font-semibold text-sm transition-colors"
              >
                How it Works
              </Link>
              
              <Link 
                href="/i71" 
                className="text-gray-700 hover:text-gray-900 font-medium text-sm transition-colors"
              >
                I71 Compliance
              </Link>
              
              <Link 
                href="/about" 
                className="text-gray-700 hover:text-gray-900 font-medium text-sm transition-colors"
              >
                About
              </Link>
            </nav>
            
            <div className="flex items-center space-x-4">
              <button className="text-gray-700 hover:text-gray-900">
                <Search size={20} />
              </button>
              
              <button onClick={toggleTheme} className="text-gray-700 hover:text-gray-900">
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
          </div>
          
          {/* Mobile menu button */}
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
            
            <button 
              onClick={toggleMenu}
              className="text-gray-700 hover:text-gray-900 p-1"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
          
          {/* Mobile menu - slide-in panel */}
          {isMenuOpen && (
            <div className="md:hidden fixed inset-0 z-50 bg-black bg-opacity-50">
              <div className="absolute right-0 top-0 h-full w-3/4 max-w-xs bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-8 h-8 relative mr-2">
                      {/* Mini logo for mobile menu */}
                      <svg viewBox="0 0 40 40" className="w-full h-full">
                        <circle cx="20" cy="15" r="10" fill="url(#headerPinkGradient)" />
                        <path d="M12,15 L20,35 L28,15 Z" fill="url(#headerConeGradient)" />
                      </svg>
                    </div>
                    <span className="font-bold text-pink-500">CANNÈ</span>
                  </div>
                  <button 
                    onClick={toggleMenu}
                    className="p-2 rounded-full hover:bg-gray-100"
                  >
                    <X size={20} className="text-gray-600" />
                  </button>
                </div>
                
                <div className="p-4 overflow-y-auto h-[calc(100%-64px)]">
                  <nav className="flex flex-col space-y-4">
                    <Link 
                      href="/" 
                      className="text-gray-700 hover:text-gray-900 font-medium text-sm transition-colors flex items-center p-2 rounded-lg hover:bg-gray-50"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Home size={18} className="mr-3" />
                      Home
                    </Link>
                    
                    <div className="text-gray-700 font-medium text-sm">
                      <button 
                        onClick={toggleShopMenu}
                        className="flex items-center justify-between w-full text-left p-2 rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center">
                          <ShoppingBag size={18} className="mr-3" />
                          Shop
                        </div>
                        <ChevronDown size={18} className={`transition-transform ${isShopMenuOpen ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {isShopMenuOpen && (
                        <div className="mt-2 ml-5 pl-3 border-l-2 border-gray-100 space-y-3">
                          {shopCategories.map((category) => (
                            <div key={category.name} className="py-2">
                              <Link 
                                href={category.href}
                                className="block text-sm font-medium text-gray-700 hover:text-pink-500"
                                onClick={() => setIsMenuOpen(false)}
                              >
                                {category.name}
                              </Link>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {category.items.map((item) => (
                                  <Link 
                                    key={item}
                                    href={`${category.href}/${item.toLowerCase()}`}
                                    className="text-xs text-gray-500 hover:text-pink-500"
                                    onClick={() => setIsMenuOpen(false)}
                                  >
                                    {item}
                                  </Link>
                                ))}
                              </div>
                            </div>
                          ))}
                          <Link 
                            href="/shop"
                            className="block py-2 text-sm text-pink-500 font-medium"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            View All Products
                          </Link>
                        </div>
                      )}
                    </div>
                    
                    <Link 
                      href="/how-it-works" 
                      className="text-pink-500 hover:text-pink-600 font-semibold text-sm transition-colors flex items-center p-2 rounded-lg hover:bg-gray-50"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Info size={18} className="mr-3" />
                      How it Works
                    </Link>
                    
                    <Link 
                      href="/i71" 
                      className="text-gray-700 hover:text-gray-900 font-medium text-sm transition-colors flex items-center p-2 rounded-lg hover:bg-gray-50"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Shield size={18} className="mr-3" />
                      I71 Compliance
                    </Link>
                    
                    <Link 
                      href="/about" 
                      className="text-gray-700 hover:text-gray-900 font-medium text-sm transition-colors flex items-center p-2 rounded-lg hover:bg-gray-50"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Info size={18} className="mr-3" />
                      About
                    </Link>
                  </nav>
                  
                  {/* Mobile toolbar */}
                  <div className="absolute bottom-0 left-0 right-0 border-t border-gray-100 bg-white p-2">
                    <div className="flex justify-around items-center">
                      <button className="p-2 rounded-full hover:bg-gray-100 flex flex-col items-center">
                        <Search size={20} className="text-gray-600 mb-1" />
                        <span className="text-xs text-gray-500">Search</span>
                      </button>
                      
                      <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-100 flex flex-col items-center">
                        {isDarkMode ? (
                          <>
                            <Sun size={20} className="text-gray-600 mb-1" />
                            <span className="text-xs text-gray-500">Light</span>
                          </>
                        ) : (
                          <>
                            <Moon size={20} className="text-gray-600 mb-1" />
                            <span className="text-xs text-gray-500">Dark</span>
                          </>
                        )}
                      </button>
                      
                      <Link href="/cart" className="p-2 rounded-full hover:bg-gray-100 flex flex-col items-center">
                        <div className="relative">
                          <ShoppingCart size={20} className="text-pink-500 mb-1" />
                          {cartItemCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-pink-500 text-white text-[10px] flex items-center justify-center rounded-full">
                              {cartItemCount}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">Cart</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
