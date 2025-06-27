import { Cart, CartItem, Product } from '@/types';

export const DELIVERY_THRESHOLD = 40;

export function calculateCartTotal(items: CartItem[]): number {
  return items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
}

export function hasDeliveryEligibility(total: number): boolean {
  return total >= DELIVERY_THRESHOLD;
}

export function addToCart(cart: Cart, product: Product, quantity: number = 1): Cart {
  const existingItemIndex = cart.items.findIndex(item => item.product.id === product.id);
  
  let newItems: CartItem[];
  
  if (existingItemIndex >= 0) {
    // Update existing item
    newItems = cart.items.map((item, index) => 
      index === existingItemIndex 
        ? { ...item, quantity: item.quantity + quantity }
        : item
    );
  } else {
    // Add new item
    newItems = [...cart.items, { product, quantity }];
  }
  
  const total = calculateCartTotal(newItems);
  
  return {
    items: newItems,
    total,
    hasDelivery: hasDeliveryEligibility(total),
  };
}

export function removeFromCart(cart: Cart, productId: string): Cart {
  const newItems = cart.items.filter(item => item.product.id !== productId);
  const total = calculateCartTotal(newItems);
  
  return {
    items: newItems,
    total,
    hasDelivery: hasDeliveryEligibility(total),
  };
}

export function updateQuantity(cart: Cart, productId: string, quantity: number): Cart {
  if (quantity <= 0) {
    return removeFromCart(cart, productId);
  }
  
  const newItems = cart.items.map(item =>
    item.product.id === productId ? { ...item, quantity } : item
  );
  
  const total = calculateCartTotal(newItems);
  
  return {
    items: newItems,
    total,
    hasDelivery: hasDeliveryEligibility(total),
  };
}

export function clearCart(): Cart {
  return {
    items: [],
    total: 0,
    hasDelivery: false,
  };
} 