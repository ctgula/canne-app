// Only import the CartItem interface from CartContext
import { CartItem } from '@/contexts/CartContext';

export const DELIVERY_THRESHOLD = 40;

// This function is used by the CartContext's getCartTotal method
export function calculateCartTotal(items: CartItem[]): number {
  return items.reduce((total, item) => total + (item.price * item.quantity), 0);
}

export function hasDeliveryEligibility(total: number): boolean {
  return total >= DELIVERY_THRESHOLD;
}

// Note: The functions below are kept for reference but are no longer used
// since the CartContext now handles all cart operations directly

/**
 * Creates a cart-like object with items, total and delivery status
 * This is kept for reference but is no longer actively used
 * @deprecated Use CartContext methods directly instead
 */
export function createCartObject(items: CartItem[]) {
  const total = calculateCartTotal(items);
  return {
    items,
    total,
    hasDelivery: hasDeliveryEligibility(total),
  };
}
 