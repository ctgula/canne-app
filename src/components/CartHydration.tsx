'use client';

import { useEffect } from 'react';
import { useCartStore } from '@/services/CartService';

/**
 * Component responsible for hydrating the cart state from localStorage
 * This should be included in the layout to ensure cart data persists across pages
 */
export default function CartHydration() {
  const hydrateCart = useCartStore((s) => s.hydrateCart);
  
  // Hydrate cart immediately on mount — no delay
  useEffect(() => {
    hydrateCart();
  }, [hydrateCart]);
  
  return null;
}
