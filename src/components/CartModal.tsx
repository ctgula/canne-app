'use client';

import { X, Plus, Minus, ShoppingBag, CreditCard } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { useEffect } from 'react';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartModal({ isOpen, onClose }: CartModalProps) {
  const { cart, removeProduct, updateProductQuantity } = useCart();
  
  const subtotal = cart.items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  const itemCount = cart.items.reduce((total, item) => total + item.quantity, 0);

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl translate-x-0 transition-transform duration-300 ease-in-out">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 sm:px-6 backdrop-blur-md bg-white/80 sticky top-0 z-10">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="h-5 w-5 text-gray-700" />
              <h2 className="text-base font-medium text-gray-900">
                Cart ({itemCount})
              </h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-1"
              aria-label="Close cart"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
            {cart.items.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
                <p className="text-gray-500 mb-6">Add some beautiful digital art to get started!</p>
                <button 
                  onClick={onClose}
                  className="btn-primary"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {cart.items.map((item) => (
                  <div key={item.product.id} className="group">
                    <div className="flex items-start space-x-4">
                      {/* Product Image Placeholder */}
                      <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-medium text-gray-600">
                          {item.product.name.split(' ').map(w => w[0]).join('')}
                        </span>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 group-hover:text-gray-700">
                          {item.product.name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Gift: {item.product.giftSize}
                        </p>
                        <p className="text-sm font-semibold text-gray-900 mt-1">
                          ${item.product.price}
                        </p>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-2 mt-3">
                          <button
                            onClick={() => updateProductQuantity(item.product.id, item.quantity - 1)}
                            className="w-7 h-7 rounded-full bg-gray-50 border border-gray-200 hover:bg-gray-100 flex items-center justify-center transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-1"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-2.5 w-2.5 text-gray-700" />
                          </button>
                          <span className="text-xs font-medium w-5 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateProductQuantity(item.product.id, item.quantity + 1)}
                            className="w-7 h-7 rounded-full bg-gray-50 border border-gray-200 hover:bg-gray-100 flex items-center justify-center transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-1"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-2.5 w-2.5 text-gray-700" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Remove Button */}
                      <button
                        onClick={() => removeProduct(item.product.id)}
                        className="text-gray-400 hover:text-gray-900 transition-colors p-1 rounded-full hover:bg-gray-50 active:scale-95"
                        aria-label="Remove item"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {cart.items.length > 0 && (
            <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
              <div className="space-y-4">
                {/* Subtotal */}
                <div className="flex justify-between text-base font-medium text-gray-900">
                  <p>Subtotal</p>
                  <p>${subtotal.toFixed(2)}</p>
                </div>
                
                {/* Free Delivery Notice */}
                {subtotal >= 40 ? (
                  <div className="text-sm text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg">
                    🚚 Free delivery included!
                  </div>
                ) : (
                  <div className="text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                    Add ${(40 - subtotal).toFixed(2)} more for free delivery
                  </div>
                )}
                
                <p className="text-sm text-gray-500">
                  Digital art and complimentary gifts. I-71 compliant.
                </p>
                
                {/* Checkout Button */}
                <button 
                  className="w-full bg-gray-900 hover:bg-black text-white px-5 py-3 rounded-xl font-medium text-sm transition-all duration-200 hover:shadow-md active:scale-98 flex items-center justify-center space-x-2 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2"
                  onClick={() => {
                    // Placeholder for checkout functionality
                    alert('Checkout functionality coming soon! This is a demo.');
                  }}
                >
                  <CreditCard className="h-4 w-4" />
                  <span>Checkout</span>
                </button>
                
                <button 
                  onClick={onClose}
                  className="w-full text-gray-500 hover:text-gray-800 text-sm font-medium py-2.5 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-1 rounded-lg"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 