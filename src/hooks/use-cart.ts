'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { toast } from 'react-hot-toast';

import { Product } from '@/types';

interface CartItem {
  product: Product;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addProduct: (data: Product) => void;
  removeProduct: (id: string) => void;
  removeAll: () => void;
  updateProductQuantity: (id: string, quantity: number) => void;
}

export const useCart = create(
  persist<CartStore>(
    (set, get) => ({
      items: [],
      addProduct: (data: Product) => {
        const currentItems = get().items;
        const existingItem = currentItems.find((item) => item.product.id === data.id);
        
        if (existingItem) {
          return set({
            items: currentItems.map((item) => {
              if (item.product.id === data.id) {
                return { 
                  ...item,
                  quantity: item.quantity + 1
                };
              }

              return item;
            })
          });
        }

        set({ items: [...currentItems, { product: data, quantity: 1 }] });
        toast.success('Item added to cart.');
      },
      removeProduct: (id: string) => {
        set({ 
          items: [...get().items.filter((item) => item.product.id !== id)]
        });
        toast.success('Item removed from cart.');
      },
      removeAll: () => set({ items: [] }),
      updateProductQuantity: (id: string, quantity: number) => {
        set({
          items: get().items.map((item) => {
            if (item.product.id === id) {
              return { 
                ...item,
                quantity 
              };
            }
            return item;
          })
        });
      }
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage)
    }
  )
);
