'use client';

import { create } from 'zustand';
import { Product } from '@/models/Product';
import { isBrowser } from '@/utils/client-utils';

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
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
  hydrateCart: () => void;
}

// LocalStorage key for cart data
const CART_STORAGE_KEY = 'canne-cart';

/**
 * Helper to save cart to localStorage
 */
const saveCartToStorage = (items: CartItem[]) => {
  if (isBrowser()) {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Failed to save cart to localStorage:', error);
    }
  }
};

/**
 * Helper to load cart from localStorage
 */
const loadCartFromStorage = (): CartItem[] => {
  if (isBrowser()) {
    try {
      const storedCart = localStorage.getItem(CART_STORAGE_KEY);
      return storedCart ? JSON.parse(storedCart) : [];
    } catch (error) {
      console.error('Failed to load cart from localStorage:', error);
      return [];
    }
  }
  return [];
};

/**
 * Cart service using Zustand for state management with manual localStorage persistence
 * This follows the Model part of the MCP pattern for client-side state
 */
export const useCartStore = create<CartStore>((set, get) => ({
  // Initialize with empty array, we'll hydrate from localStorage after mount
  items: [],
  
  // Hydrate cart from localStorage on client-side
  hydrateCart: () => {
    const storedItems = loadCartFromStorage();
    // Ensure we're setting a valid array
    set({ items: Array.isArray(storedItems) ? storedItems : [] });
  },
  
  // Add an item to the cart with optional quantity
  addItem: (product: Product, quantity = 1) => {
    set((state) => {
      // Ensure items is always an array
      const items = Array.isArray(state.items) ? state.items : [];
      
      const existingItem = items.find(item => item.product.id === product.id);
      
      let newItems;
      if (existingItem) {
        // Update quantity if item already exists
        newItems = items.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Add new item
        newItems = [...items, { product, quantity }];
      }
      
      // Save to localStorage
      saveCartToStorage(newItems);
      
      return { items: newItems };
    });
  },
  
  // Remove an item from the cart
  removeItem: (productId: string) => {
    set((state) => {
      // Ensure items is always an array
      const items = Array.isArray(state.items) ? state.items : [];
      const newItems = items.filter(item => item.product.id !== productId);
      saveCartToStorage(newItems);
      return { items: newItems };
    });
  },
  
  // Update item quantity
  updateQuantity: (productId: string, quantity: number) => {
    set((state) => {
      // Ensure items is always an array
      const items = Array.isArray(state.items) ? state.items : [];
      
      let newItems;
      if (quantity <= 0) {
        // Remove item if quantity is 0 or less
        newItems = items.filter(item => item.product.id !== productId);
      } else {
        newItems = items.map(item =>
          item.product.id === productId
            ? { ...item, quantity }
            : item
        );
      }
      
      // Save to localStorage
      saveCartToStorage(newItems);
      
      return { items: newItems };
    });
  },
  
  // Clear the cart
  clearCart: () => {
    saveCartToStorage([]);
    set({ items: [] });
  },
  
  // Calculate the total price of items in the cart
  getTotal: () => {
    const items = get().items || [];
    return Array.isArray(items) ? items.reduce(
      (total, item) => total + (item.product.price * item.quantity),
      0
    ) : 0;
  },
  
  // Get the total number of items in the cart
  getItemCount: () => {
    const items = get().items || [];
    if (!Array.isArray(items)) return 0;
    
    return items.reduce(
      (count, item) => count + (item.quantity || 1),
      0
    );
  }
}));
