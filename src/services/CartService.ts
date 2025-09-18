'use client';

import { create } from 'zustand';
import { Product } from '@/models/Product';
import { isBrowser } from '@/utils/client-utils';

/**
 * Strain option interface
 */
export interface StrainOption {
  name: string;
  type: string;
  thcLow: number;
  thcHigh: number;
}

/**
 * Cart item interface
 */
export interface CartItem {
  product: Product;
  quantity: number;
  strain: StrainOption;
}

/**
 * Cart store interface
 */
interface CartStore {
  items: CartItem[];
  addItem: (product: Product, strain: StrainOption, quantity?: number) => void;
  removeItem: (productId: string, strainName: string) => void;
  updateQuantity: (productId: string, strainName: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
  hydrateCart: () => void;
  validateAndCleanCart: () => number;
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
  
  // Add an item to the cart with strain and optional quantity
  addItem: (product: Product, strain: StrainOption, quantity = 1) => {
    set((state) => {
      // Ensure items is always an array
      const items = Array.isArray(state.items) ? state.items : [];
      
      // Find existing item with same product and strain
      const existingItem = items.find(item => 
        item.product.id === product.id && 
        item.strain.name === strain.name
      );
      
      let newItems;
      if (existingItem) {
        // Update quantity if item already exists with same strain
        newItems = items.map(item =>
          item.product.id === product.id && item.strain.name === strain.name
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Add new item with strain
        newItems = [...items, { product, strain, quantity }];
      }
      
      // Save to localStorage
      saveCartToStorage(newItems);
      
      return { items: newItems };
    });
  },
  
  // Remove an item from the cart (strain-specific)
  removeItem: (productId: string, strainName: string) => {
    set((state) => {
      // Ensure items is always an array
      const items = Array.isArray(state.items) ? state.items : [];
      const newItems = items.filter(item => 
        !(item.product.id === productId && item.strain.name === strainName)
      );
      saveCartToStorage(newItems);
      return { items: newItems };
    });
  },
  
  // Update item quantity (strain-specific)
  updateQuantity: (productId: string, strainName: string, quantity: number) => {
    set((state) => {
      // Ensure items is always an array
      const items = Array.isArray(state.items) ? state.items : [];
      
      let newItems;
      if (quantity <= 0) {
        // Remove item if quantity is 0 or less
        newItems = items.filter(item => 
          !(item.product.id === productId && item.strain.name === strainName)
        );
      } else {
        newItems = items.map(item =>
          item.product.id === productId && item.strain.name === strainName
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
  },
  
  // Validate and clean cart items, removing any with invalid product IDs
  validateAndCleanCart: () => {
    const items = get().items || [];
    if (!Array.isArray(items)) {
      set({ items: [] });
      saveCartToStorage([]);
      return 0;
    }
    
    const validItems = items.filter(item => {
      // Check if product exists and has valid UUID
      const hasValidProduct = item.product && 
        item.product.id && 
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.product.id);
      
      // Check if strain exists
      const hasValidStrain = item.strain && item.strain.name;
      
      // Check if quantity is valid
      const hasValidQuantity = item.quantity && item.quantity > 0;
      
      return hasValidProduct && hasValidStrain && hasValidQuantity;
    });
    
    const removedCount = items.length - validItems.length;
    
    if (removedCount > 0) {
      console.log(`🧹 Cleaned cart: removed ${removedCount} invalid items`);
      set({ items: validItems });
      saveCartToStorage(validItems);
    }
    
    return removedCount;
  }
}));
