'use client';

import Link from 'next/link';
import Header from '@/components/Header';
import { useCartStore } from '@/services/CartService';
import { Minus, Plus, Trash2, ArrowRight, Truck, ShoppingBag } from 'lucide-react';

// Define the delivery threshold here since we don't have cart-utils
const DELIVERY_THRESHOLD = 75; // $75 for free delivery

export default function CartPage() {
  const { items, updateQuantity, removeItem, getTotal } = useCartStore();
  
  const total = getTotal();
  const deliveryAmountNeeded = DELIVERY_THRESHOLD - total;
  const isCloseToDelivery = deliveryAmountNeeded > 0 && deliveryAmountNeeded <= 15;
  const hasDelivery = total >= DELIVERY_THRESHOLD;

  if (items.length === 0) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="h-12 w-12 text-pink-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
            <p className="text-gray-600 mb-8">
              Discover our beautiful digital art collection and start building your order.
            </p>
            <Link href="/" className="btn-primary">
              Browse Art Collection
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Cart</h1>
          <p className="text-gray-600">
            {items.length} item{items.length !== 1 ? 's' : ''} in your cart
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.product.id} className="card">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Product Image */}
                  <div className="w-full sm:w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">🎨</span>
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900 mb-1">
                          {item.product.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {item.product.tier} tier art with complimentary gift
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="gift-badge">{item.product.weight || "Standard"} gift</span>
                          {hasDelivery && (
                            <span className="delivery-badge">
                              <Truck className="h-3 w-3 mr-1" />
                              Free delivery
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Price and Controls */}
                      <div className="flex flex-col items-end gap-3">
                        <div className="text-xl font-bold text-gray-900">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </div>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3">
                          <div className="flex items-center bg-gray-100 rounded-lg">
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              className="p-2 hover:bg-gray-200 rounded-l-lg transition-colors"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="w-12 text-center font-medium">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="p-2 hover:bg-gray-200 rounded-r-lg transition-colors"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                          
                          <button
                            onClick={() => removeItem(item.product.id)}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${total.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery</span>
                  <span className="font-medium">
                    {hasDelivery ? 'Free' : '$10'}
                  </span>
                </div>
                
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>${hasDelivery ? total.toFixed(2) : (total + 10).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Delivery Threshold Message */}
              {!hasDelivery && (
                <div className={`p-4 rounded-xl mb-6 ${
                  isCloseToDelivery 
                    ? 'bg-orange-50 border border-orange-200' 
                    : 'bg-blue-50 border border-blue-200'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Truck className={`h-4 w-4 ${
                      isCloseToDelivery ? 'text-orange-600' : 'text-blue-600'
                    }`} />
                    <span className={`text-sm font-medium ${
                      isCloseToDelivery ? 'text-orange-900' : 'text-blue-900'
                    }`}>
                      {isCloseToDelivery ? 'Almost there!' : 'Free Delivery Available'}
                    </span>
                  </div>
                  <p className={`text-sm ${
                    isCloseToDelivery ? 'text-orange-700' : 'text-blue-700'
                  }`}>
                    Add ${deliveryAmountNeeded.toFixed(2)} more to get free delivery!
                  </p>
                </div>
              )}

              {hasDelivery && (
                <div className="bg-green-50 border border-green-200 p-4 rounded-xl mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Truck className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-900">
                      Free Delivery Included!
                    </span>
                  </div>
                  <p className="text-sm text-green-700">
                    Your order qualifies for complimentary delivery.
                  </p>
                </div>
              )}

              {/* Checkout Button */}
              <Link 
                href="/checkout" 
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              {/* Continue Shopping */}
              <Link 
                href="/" 
                className="btn-secondary w-full mt-3 text-center block"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 