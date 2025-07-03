'use client';

import { useCartStore } from '@/services/CartService';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function CartDisplay() {
  const { items, removeItem, updateQuantity, getTotal, getItemCount } = useCartStore();

  // If cart is empty
  if (items.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-500 dark:text-gray-400 mb-4">Your cart is empty</p>
        <Link 
          href="/#collection" 
          className="text-pink-500 hover:text-pink-600 dark:text-pink-400 dark:hover:text-pink-300 font-medium"
        >
          Browse our art collection
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h3 className="text-lg font-bold mb-4">Your Cart ({getItemCount()} items)</h3>
      
      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
        <AnimatePresence>
          {items.map((item) => (
            <motion.div 
              key={item.product.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4"
            >
              <div className="flex items-center">
                <div 
                  className="w-3 h-12 mr-3 rounded-sm" 
                  style={{ backgroundColor: item.product.color_theme ? item.product.color_theme.split('/')[0].toLowerCase() : 'gray' }}
                ></div>
                <div>
                  <h4 className="font-medium">{item.product.name}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{item.product.tier} • {item.product.weight}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 border rounded-lg overflow-hidden">
                  <button 
                    onClick={() => updateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                    className="w-8 h-8 flex items-center justify-center bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold transition-colors"
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  
                  <span className="w-8 text-center font-medium">{item.quantity}</span>
                  
                  <button 
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    className="w-8 h-8 flex items-center justify-center bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold transition-colors"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
                
                <div className="w-16 text-right">
                  ${(item.product.price * item.quantity).toFixed(2)}
                </div>
                
                <button 
                  onClick={() => removeItem(item.product.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  aria-label="Remove item"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-between mb-2">
          <span>Subtotal</span>
          <span>${getTotal().toFixed(2)}</span>
        </div>
        
        <Link 
          href="/checkout" 
          className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-medium rounded-lg text-center block hover:opacity-90 transition-opacity"
        >
          Proceed to Checkout
        </Link>
      </div>
    </div>
  );
}
