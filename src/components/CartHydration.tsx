'use client';

import { useEffect } from 'react';
import { useCartStore } from '@/services/CartService';
import { useIsMounted } from '@/utils/client-utils';

/**
 * Component responsible for hydrating the cart state from localStorage
 * This should be included in the layout to ensure cart data persists across pages
 */
export default function CartHydration() {
  const { hydrateCart } = useCartStore();
  const isMounted = useIsMounted();
  
  // Hydrate cart once when component mounts on client side
  useEffect(() => {
    if (isMounted) {
      // Small timeout to ensure proper hydration after DOM is ready
      setTimeout(() => {
        hydrateCart();
      }, 0);
    }
  }, [hydrateCart, isMounted]);
  
  // This is a utility component that doesn't render anything
  return null;
}
