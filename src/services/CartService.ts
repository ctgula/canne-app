'use client';

import { create } from 'zustand';
import { Product } from '@/models/Product';

/**
 * Cart item interface
 */
export interface CartItem {
  product: Product;
  quantity: number;
}

/**
 * Cart store interface
 */
interface CartStore {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

/**
 * Cart service using Zustand for state management
 * This follows the Model part of the MCP pattern for client-side state
 */
export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  
  // Add an item to the cart
  addItem: (product: Product) => {
    set((state) => {
      const existingItem = state.items.find(item => item.product.id === product.id);
      
      if (existingItem) {
        // Update quantity if item already exists
        return {
          items: state.items.map(item =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        };
      } else {
        // Add new item
        return {
          items: [...state.items, { product, quantity: 1 }]
        };
      }
    });
  },
  
  // Remove an item from the cart
  removeItem: (productId: string) => {
    set((state) => ({
      items: state.items.filter(item => item.product.id !== productId)
    }));
  },
  
  // Update item quantity
  updateQuantity: (productId: string, quantity: number) => {
    set((state) => {
      if (quantity <= 0) {
        // Remove item if quantity is 0 or less
        return {
          items: state.items.filter(item => item.product.id !== productId)
        };
      }
      
      return {
        items: state.items.map(item =>
          item.product.id === productId
            ? { ...item, quantity }
            : item
        )
      };
    });
  },
  
  // Clear the cart
  clearCart: () => {
    set({ items: [] });
  },
  
  // Calculate the total price of items in the cart
  getTotal: () => {
    return get().items.reduce(
      (total, item) => total + (item.product.price * item.quantity),
      0
    );
  },
  
  // Get the total number of items in the cart
  getItemCount: () => {
    return get().items.reduce(
      (count, item) => count + item.quantity,
      0
    );
  }
}));
