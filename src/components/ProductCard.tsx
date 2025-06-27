'use client';

import { Plus, Minus, X, Palette, Star, Crown, Sparkles, Check, Truck, Award } from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/hooks/use-cart';
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { cart, addProduct, updateProductQuantity, removeProduct } = useCart();
  const [isAdded, setIsAdded] = useState(false);
  
  // Check if product is already in cart
  const cartItem = cart.items.find(item => item.product.id === product.id);
  const quantity = cartItem?.quantity || 0;
  const isInCart = quantity > 0;
  
  // Debug cart state
  console.log(`Product ${product.name} - In cart: ${isInCart}, Quantity: ${quantity}`);

  const handleAddToCart = () => {
    addProduct(product);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleDecreaseQuantity = () => {
    if (quantity > 1) {
      updateProductQuantity(product.id, quantity - 1);
    } else {
      removeProduct(product.id);
    }
  };

  const handleRemoveFromCart = () => {
    removeProduct(product.id);
  };

  // Enhanced tier determination with more granular levels
  const getTier = (price: number) => {
    if (price >= 140) return 'ultra';
    if (price >= 50) return 'pro';
    if (price >= 40) return 'essentials';
    return 'standard';
  };

  const tier = getTier(product.price);
  
  // Enhanced tier-specific styling with richer colors
  const getCardClass = () => {
    const baseClass = 'group product-card-enhanced';
    switch (tier) {
      case 'ultra':
        return `${baseClass} hover:shadow-amber-200/50 hover:border-amber-300/50`;
      case 'pro':
        return `${baseClass} hover:shadow-violet-200/50 hover:border-violet-300/50`;
      case 'essentials':
        return `${baseClass} hover:shadow-emerald-200/50 hover:border-emerald-300/50`;
      default:
        return `${baseClass} hover:shadow-gray-200/50`;
    }
  };

  const getTierIcon = () => {
    switch (tier) {
      case 'ultra':
        return <Crown className="h-4 w-4" />;
      case 'pro':
        return <Star className="h-4 w-4" />;
      case 'essentials':
        return <Award className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getTierBadgeClass = () => {
    switch (tier) {
      case 'ultra':
        return 'tier-badge-enhanced bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 text-white shadow-amber-300/50';
      case 'pro':
        return 'tier-badge-enhanced bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500 text-white shadow-violet-300/50';
      case 'essentials':
        return 'tier-badge-enhanced bg-gradient-to-r from-emerald-500 via-teal-500 to-green-500 text-white shadow-emerald-300/50';
      default:
        return '';
    }
  };

  const getTierName = () => {
    switch (tier) {
      case 'ultra':
        return 'Ultra';
      case 'pro':
        return 'Pro';
      case 'essentials':
        return 'Essentials';
      default:
        return '';
    }
  };

  const getArtworkGradient = () => {
    switch (tier) {
      case 'ultra':
        return 'from-amber-50 via-orange-50 to-yellow-50';
      case 'pro':
        return 'from-violet-50 via-purple-50 to-indigo-50';
      case 'essentials':
        return 'from-emerald-50 via-teal-50 to-green-50';
      default:
        return 'from-gray-50 via-slate-50 to-gray-50';
    }
  };

  const getArtworkPlaceholder = () => {
    const artworkStyles = {
      'Sunset Dreams': 'bg-gradient-to-br from-orange-400 via-pink-400 to-purple-400',
      'Ocean Waves': 'bg-gradient-to-br from-blue-400 via-cyan-400 to-teal-400',
      'Urban Jungle': 'bg-gradient-to-br from-green-400 via-emerald-400 to-lime-400',
      'Cosmic Journey': 'bg-gradient-to-br from-purple-400 via-indigo-400 to-blue-400',
      'Golden Meadow': 'bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-400'
    };
    
    return artworkStyles[product.name as keyof typeof artworkStyles] || 'bg-gradient-to-br from-gray-400 to-gray-500';
  };

  return (
    <div className={getCardClass()}>
      {/* Enhanced Tier Badge */}
      {tier !== 'standard' && (
        <div className={getTierBadgeClass()}>
          {getTierIcon()}
          <span>{getTierName()}</span>
        </div>
      )}

      {/* Enhanced Artwork Image */}
      <div className={`relative aspect-square bg-gradient-to-br ${getArtworkGradient()} rounded-2xl overflow-hidden mb-6 group-hover:scale-105 transition-transform duration-500`}>
        {/* Stylized Artwork Placeholder */}
        <div className={`absolute inset-4 ${getArtworkPlaceholder()} rounded-xl opacity-90 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center transform group-hover:scale-105`}>
          <div className="w-16 h-16 md:w-20 md:h-20 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
            <Palette className="h-8 w-8 md:h-10 md:w-10 text-white" />
          </div>
        </div>
        
        {/* Premium Sparkle Effect */}
        {tier !== 'standard' && (
          <div className="absolute top-3 left-3 opacity-70 group-hover:opacity-100 transition-opacity duration-500">
            <Sparkles className="h-5 w-5 text-white animate-pulse-gentle" />
          </div>
        )}
        
        {/* Enhanced Delivery Badge */}
        {product.hasDelivery && (
          <div className="absolute bottom-3 right-3">
            <div className="bg-emerald-500 text-white px-3 py-2 rounded-xl text-xs font-bold shadow-lg flex items-center space-x-1 backdrop-blur-sm">
              <Truck className="h-3 w-3" />
              <span>Free Delivery</span>
            </div>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="space-y-4 md:space-y-5">
        <div>
          <h3 className="font-bold text-xl md:text-2xl text-gray-900 mb-2 leading-tight group-hover:text-gray-700 transition-colors duration-300">
            {product.name}
          </h3>
          <p className="text-gray-600 text-sm md:text-base leading-relaxed line-clamp-2">
            {product.description}
          </p>
        </div>

        {/* Enhanced Gift Information */}
        <div className="bg-gradient-to-r from-gray-50 via-white to-gray-50 rounded-2xl p-4 md:p-5 border border-gray-200 group-hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-gray-700 flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-gray-500" />
              <span>Complimentary Gift</span>
            </span>
            <div className={`px-3 py-1 rounded-xl text-sm font-bold shadow-sm ${
              tier === 'ultra' ? 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800' :
              tier === 'pro' ? 'bg-gradient-to-r from-violet-100 to-purple-100 text-violet-800' :
              tier === 'essentials' ? 'bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800' :
              'bg-gray-200 text-gray-700'
            }`}>
              {product.giftSize}
            </div>
          </div>
          {tier !== 'standard' && (
            <div className="text-xs text-gray-500 flex items-center space-x-2">
              {getTierIcon()}
              <span className="font-medium">
                {tier === 'ultra' ? 'Premium quality selection' : 
                 tier === 'pro' ? 'Enhanced gift bundle' :
                 'Quality essentials package'}
              </span>
            </div>
          )}
        </div>

        {/* Price and Add to Cart */}
        <div className="flex items-center justify-between pt-3">
          <div className="flex flex-col">
            <div className="text-2xl md:text-3xl font-bold text-gray-900 group-hover:text-gray-700 transition-colors duration-300">
              ${product.price}
            </div>
            {tier !== 'standard' && (
              <div className={`text-sm font-bold ${
                tier === 'ultra' ? 'text-amber-600' : 
                tier === 'pro' ? 'text-violet-600' :
                'text-emerald-600'
              }`}>
                {tier === 'ultra' ? 'Ultra Value' : 
                 tier === 'pro' ? 'Pro Deal' :
                 'Great Value'}
              </div>
            )}
          </div>
          
          {/* Conditional Cart Controls - Always show the Add to Cart button initially */}
          {(isInCart && quantity > 0) ? (
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              {/* Quantity Controls - Enhanced for mobile */}
              <div className="flex items-center bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <button
                  onClick={handleDecreaseQuantity}
                  aria-label="Decrease quantity"
                  className="p-2 sm:p-2.5 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-1 active:bg-gray-100"
                  style={{ touchAction: 'manipulation' }}
                >
                  <Minus className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-600" />
                </button>
                
                <span className="px-2 sm:px-3 py-1 font-medium text-sm text-gray-800">
                  {quantity}
                </span>
                
                <button
                  onClick={() => addProduct(product)}
                  aria-label="Increase quantity"
                  className="p-2 sm:p-2.5 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-1 active:bg-gray-100"
                  style={{ touchAction: 'manipulation' }}
                >
                  <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-600" />
                </button>
              </div>
              
              {/* Remove Button - Enhanced for mobile */}
              <button
                onClick={handleRemoveFromCart}
                aria-label="Remove from cart"
                className="p-2 sm:p-2.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-200 active:bg-red-100"
                style={{ touchAction: 'manipulation' }}
              >
                <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAddToCart}
              className={`group/btn relative overflow-hidden px-4 py-2.5 sm:px-5 md:px-6 md:py-3 rounded-xl font-medium text-xs sm:text-sm transition-all duration-200 flex items-center space-x-1 sm:space-x-2 hover:scale-102 hover:shadow-md active:scale-98 ${
                isAdded ? 'bg-emerald-500 text-white' : 'bg-gray-900 text-white'
              }`}
              aria-label="Add to cart"
              style={{ touchAction: 'manipulation' }}
            >            
              <span className="relative z-10 flex items-center space-x-1 sm:space-x-1.5">
                {isAdded ? (
                  <>
                    <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span>Added</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 group-hover/btn:rotate-90 transition-transform duration-300" />
                    <span>Add to Cart</span>
                  </>
                )}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 