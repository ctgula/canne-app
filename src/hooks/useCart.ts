import { useState, useEffect, useCallback } from 'react';
import { CartService, Cart, CartItem } from '../lib/cart';

export interface UseCartReturn {
  cart: Cart;
  loading: boolean;
  error: string | null;
  addToCart: (productId: string, quantity?: number) => Promise<boolean>;
  removeFromCart: (productId: string) => Promise<boolean>;
  updateQuantity: (productId: string, quantity: number) => Promise<boolean>;
  refreshCart: () => Promise<void>;
  clearError: () => void;
  cartSummary: {
    subtotal: number;
    deliveryFee: number;
    total: number;
    itemCount: number;
    totalQuantity: number;
  };
}

export function useCart(customerId: string | null): UseCartReturn {
  const [cart, setCart] = useState<Cart>({
    order_id: null,
    subtotal: 0,
    delivery_fee: 0,
    total: 0,
    items: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refresh cart contents
  const refreshCart = useCallback(async () => {
    if (!customerId) {
      setCart({
        order_id: null,
        subtotal: 0,
        delivery_fee: 0,
        total: 0,
        items: [],
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const cartData = await CartService.getCartContents(customerId);
      setCart(cartData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load cart');
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  // Add item to cart
  const addToCart = useCallback(async (productId: string, quantity: number = 1): Promise<boolean> => {
    if (!customerId) {
      setError('Please log in to add items to cart');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await CartService.addToCart(customerId, productId, quantity);
      
      if (result.success) {
        await refreshCart();
        return true;
      } else {
        setError(result.message);
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add item to cart');
      return false;
    } finally {
      setLoading(false);
    }
  }, [customerId, refreshCart]);

  // Remove item from cart
  const removeFromCart = useCallback(async (productId: string): Promise<boolean> => {
    if (!customerId) {
      setError('Please log in to modify cart');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await CartService.removeFromCart(customerId, productId);
      
      if (result.success) {
        await refreshCart();
        return true;
      } else {
        setError(result.message);
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove item from cart');
      return false;
    } finally {
      setLoading(false);
    }
  }, [customerId, refreshCart]);

  // Update item quantity
  const updateQuantity = useCallback(async (productId: string, quantity: number): Promise<boolean> => {
    if (!customerId) {
      setError('Please log in to modify cart');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await CartService.updateQuantity(customerId, productId, quantity);
      
      if (result.success) {
        await refreshCart();
        return true;
      } else {
        setError(result.message);
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update quantity');
      return false;
    } finally {
      setLoading(false);
    }
  }, [customerId, refreshCart]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Calculate cart summary
  const cartSummary = CartService.calculateTotals(cart.items, cart.delivery_fee);

  // Load cart on mount and when customerId changes
  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  return {
    cart,
    loading,
    error,
    addToCart,
    removeFromCart,
    updateQuantity,
    refreshCart,
    clearError,
    cartSummary,
  };
}

// Optional: Create a context for cart state management
import { createContext, useContext, ReactNode } from 'react';

interface CartContextType extends UseCartReturn {
  customerId: string | null;
  setCustomerId: (id: string | null) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ 
  children, 
  initialCustomerId = null 
}: { 
  children: ReactNode; 
  initialCustomerId?: string | null;
}) {
  const [customerId, setCustomerId] = useState<string | null>(initialCustomerId);
  const cartHook = useCart(customerId);

  return (
    <CartContext.Provider value={{ ...cartHook, customerId, setCustomerId }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCartContext() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCartContext must be used within a CartProvider');
  }
  return context;
}
