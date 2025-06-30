'use client';

import React from 'react';
import Header from '@/components/Header';
import Link from 'next/link';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'react-hot-toast';

export default function StarterPage() {
  const { addItem, items } = useCart();
  const productId = 'starter-tier';
  
  // Check if this product is already in the cart
  const itemInCart = items.find(item => item.id === productId);
  
  const tierInfo = {
    id: productId,
    name: 'Starter',
    price: 25,
    formattedPrice: '$25',
    weight: '3.5g',
    description: 'Single digital print + complimentary top-shelf gift.',
    details: [
      'High-resolution digital artwork',
      'Print ready 12"x16" digital file',
      'Certificate of authenticity',
      'Complimentary 3.5g flower gift'
    ],
    bgColor: 'from-pink-400 to-pink-600',
    colorTheme: 'Pink',
    imageUrl: '/images/products/starter.jpg'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-indigo-100/40">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <Link 
          href="/shop/flowers" 
          className="inline-flex items-center space-x-2 mb-8 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Flowers</span>
        </Link>
        
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Product Image */}
            <div className={`aspect-square bg-gradient-to-br ${tierInfo.bgColor} relative`}>
              <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-sm font-medium">
                {tierInfo.weight}
              </div>
            </div>
            
            {/* Product Details */}
            <div className="p-6 md:p-8 lg:p-10 flex flex-col">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{tierInfo.name}</h1>
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-2xl font-bold text-[#D4AF37]">{tierInfo.formattedPrice}</span>
                  <span className="text-sm text-gray-500">I-71 Compliant Art</span>
                </div>
                
                <p className="text-lg text-gray-700 mb-6">{tierInfo.description}</p>
                
                <div className="mb-8">
                  <h3 className="font-medium text-gray-900 mb-3">What&apos;s Included:</h3>
                  <ul className="space-y-2">
                    {tierInfo.details.map((detail, index) => (
                      <li key={index} className="flex items-center gap-2 text-gray-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-pink-500"></span>
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="mt-auto pt-6 border-t border-gray-100">
                <button 
                  onClick={() => {
                    addItem({
                      id: tierInfo.id,
                      name: `${tierInfo.name} Tier Art`,
                      price: tierInfo.price,
                      quantity: 1,
                      tier: tierInfo.name,
                      weight: tierInfo.weight,
                      colorTheme: tierInfo.colorTheme,
                      imageUrl: tierInfo.imageUrl
                    });
                    toast.success('Added to cart!');
                  }}
                  className={`w-full ${itemInCart ? 'bg-green-500 hover:bg-green-600' : 'bg-gradient-to-r from-pink-500 to-purple-500'} text-white font-medium py-4 rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex items-center justify-center gap-2`}
                  aria-label={itemInCart ? 'Add another to cart' : 'Add to cart'}
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>{itemInCart ? `Add Another (${itemInCart.quantity} in cart)` : 'Add to Cart'}</span>
                </button>
                <p className="text-xs text-center mt-3 text-gray-500">All prices are for I-71-compliant digital art pieces – cannabis is gifted, never sold.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
