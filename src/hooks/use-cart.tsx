'use client';

/**
 * @deprecated This hook is no longer used by the application.
 * The app now uses the CartContext from @/contexts/CartContext instead.
 * This file is kept for reference purposes only.
 */

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Cart, Product } from '@/types';
// Import the cart utility functions from CartContext instead
// This fixes the lint errors since these functions were removed from cart-utils
import { calculateCartTotal, hasDeliveryEligibility } from '@/lib/cart-utils';

// Define local versions of the functions that were removed from cart-utils
const addToCart = (cart: Cart, product: Product, quantity: number = 1): Cart => {
  // Implementation not needed as this hook is deprecated
  return cart;
};

const removeFromCart = (cart: Cart, productId: string): Cart => {
  // Implementation not needed as this hook is deprecated
  return cart;
};

const updateQuantity = (cart: Cart, productId: string, quantity: number): Cart => {
  // Implementation not needed as this hook is deprecated
  return cart;
};

const clearCart = (): Cart => {
  // Implementation not needed as this hook is deprecated
  return { items: [], total: 0, hasDelivery: false };
};

interface CartContextType {
  cart: Cart;
  addProduct: (product: Product, quantity?: number) => void;
  removeProduct: (productId: string) => void;
  updateProductQuantity: (productId: string, quantity: number) => void;
  clearAll: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

type CartAction =
  | { type: 'ADD_PRODUCT'; product: Product; quantity?: number }
  | { type: 'REMOVE_PRODUCT'; productId: string }
  | { type: 'UPDATE_QUANTITY'; productId: string; quantity: number }
  | { type: 'CLEAR_CART' };

function cartReducer(state: Cart, action: CartAction): Cart {
  switch (action.type) {
    case 'ADD_PRODUCT':
      return addToCart(state, action.product, action.quantity);
    case 'REMOVE_PRODUCT':
      return removeFromCart(state, action.productId);
    case 'UPDATE_QUANTITY':
      return updateQuantity(state, action.productId, action.quantity);
    case 'CLEAR_CART':
      return clearCart();
    default:
      return state;
  }
}

const initialCart: Cart = {
  items: [],
  total: 0,
  hasDelivery: false,
};

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, dispatch] = useReducer(cartReducer, initialCart);

  const addProduct = (product: Product, quantity: number = 1) => {
    dispatch({ type: 'ADD_PRODUCT', product, quantity });
  };

  const removeProduct = (productId: string) => {
    dispatch({ type: 'REMOVE_PRODUCT', productId });
  };

  const updateProductQuantity = (productId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', productId, quantity });
  };

  const clearAll = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  return (
    <CartContext.Provider 
      value={{ 
        cart, 
        addProduct, 
        removeProduct, 
        updateProductQuantity, 
        clearAll 
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
} 