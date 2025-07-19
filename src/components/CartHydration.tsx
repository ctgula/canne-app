'use client';

import { useEffect, useState } from 'react';
import { useCartStore } from '@/services/CartService';

/**
 * Component responsible for hydrating the cart state from localStorage
 * This should be included in the layout to ensure cart data persists across pages
 */
export default function CartHydration() {
  const { hydrateCart } = useCartStore();
  const [isMounted, setIsMounted] = useState(false);
  
  // Ensure we only run on client side to prevent hydration mismatches
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Hydrate cart once when component mounts on client side
  useEffect(() => {
    if (isMounted) {
      // Small timeout to ensure proper hydration after DOM is ready
      const timeoutId = setTimeout(() => {
        hydrateCart();
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [hydrateCart, isMounted]);
  
  // This is a utility component that doesn't render anything
  return null;
}
