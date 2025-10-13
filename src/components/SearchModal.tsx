'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import Link from 'next/link';
import { Product } from '@/models/Product';
import { ProductController } from '@/controllers/ProductController';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load products on mount
  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      try {
        const result = await ProductController.getAllProducts();
        if (result.data) {
          setProducts(result.data);
        }
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoading(false);
      }
    }
    if (isOpen) {
      loadProducts();
    }
  }, [isOpen]);

  // Filter products based on query
  useEffect(() => {
    if (!query.trim()) {
      setFilteredProducts([]);
      return;
    }

    const lowercaseQuery = query.toLowerCase();
    const filtered = products.filter(product => 
      product.name?.toLowerCase().includes(lowercaseQuery) ||
      product.description?.toLowerCase().includes(lowercaseQuery) ||
      product.tier?.toLowerCase().includes(lowercaseQuery)
    );
    setFilteredProducts(filtered);
  }, [query, products]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      return () => document.removeEventListener('keydown', handleEsc);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const pages = [
    { name: 'Home', href: '/', description: 'Welcome to Cannè Art Collective' },
    { name: 'Shop', href: '/shop', description: 'Browse our art collection' },
    { name: 'How It Works', href: '/how-it-works', description: 'Learn about our process' },
    { name: 'I-71 Compliance', href: '/i71', description: 'Legal information' },
    { name: 'About', href: '/about', description: 'Our story & mission' },
  ];

  const filteredPages = query.trim() 
    ? pages.filter(page => 
        page.name.toLowerCase().includes(query.toLowerCase()) ||
        page.description.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  return (
    <div 
      className="fixed inset-0 z-[70] flex items-start justify-center pt-20 px-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div 
        className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
          <Search className="text-gray-400" size={20} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, pages, or content..."
            className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 outline-none text-lg"
          />
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-2" />
              Loading...
            </div>
          ) : !query.trim() ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <Search size={32} className="mx-auto mb-2 opacity-50" />
              <p>Start typing to search products and pages</p>
            </div>
          ) : (
            <div className="p-4 space-y-6">
              {/* Products Section */}
              {filteredProducts.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 px-2">
                    Products ({filteredProducts.length})
                  </h3>
                  <div className="space-y-2">
                    {filteredProducts.map(product => (
                      <Link
                        key={product.id}
                        href="/shop"
                        onClick={onClose}
                        className="block p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-pink-100 to-purple-100 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                              {product.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                              ${product.price} • {product.tier}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Pages Section */}
              {filteredPages.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 px-2">
                    Pages ({filteredPages.length})
                  </h3>
                  <div className="space-y-2">
                    {filteredPages.map(page => (
                      <Link
                        key={page.href}
                        href={page.href}
                        onClick={onClose}
                        className="block p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors group"
                      >
                        <div className="font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                          {page.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {page.description}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* No Results */}
              {filteredProducts.length === 0 && filteredPages.length === 0 && (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  <p>No results found for "{query}"</p>
                  <p className="text-sm mt-1">Try different keywords</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Hint */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center justify-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-xs">ESC</kbd>
              to close
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
