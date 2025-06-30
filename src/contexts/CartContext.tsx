'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the cart item type
export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  tier: string;
  imageUrl?: string;
  weight: string; // e.g. "3.5g", "7g", etc.
  colorTheme: string; // e.g. "pink", "violet", etc.
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  // Initialize cart from localStorage if available
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('canne_cart');
      return savedCart ? JSON.parse(savedCart) : [];
    }
    return [];
  });

  // Save to localStorage whenever cart changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('canne_cart', JSON.stringify(items));
    }
  }, [items]);

  const addItem = (newItem: CartItem) => {
    setItems(currentItems => {
      // Check if the item already exists in the cart
      const existingItemIndex = currentItems.findIndex(item => item.id === newItem.id);
      
      if (existingItemIndex > -1) {
        // Update quantity if item exists
        const updatedItems = [...currentItems];
        updatedItems[existingItemIndex].quantity += newItem.quantity;
        return updatedItems;
      } else {
        // Add new item
        return [...currentItems, newItem];
      }
    });
  };

  const removeItem = (itemId: string) => {
    setItems(currentItems => currentItems.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    setItems(currentItems => {
      if (quantity <= 0) {
        // Remove item if quantity is zero or negative
        return currentItems.filter(item => item.id !== itemId);
      } else {
        // Update quantity
        return currentItems.map(item => 
          item.id === itemId ? { ...item, quantity } : item
        );
      }
    });
  };

  const clearCart = () => {
    setItems([]);
  };

  const getCartTotal = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemCount = () => {
    return items.reduce((count, item) => count + item.quantity, 0);
  };

  const value = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemCount
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export { CartContext };
// Export both named exports for better import consistency
