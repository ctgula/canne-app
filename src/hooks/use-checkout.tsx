'use client';

import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { processCheckout } from '@/services/checkoutService';

type CheckoutFormData = {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  isDelivery: boolean;
  deliveryAddress?: string;
  deliveryCity?: string;
  deliveryState?: string;
  deliveryZip?: string;
  deliveryNotes?: string;
  paymentMethod: 'cash' | 'card' | 'other';
};

export function useCheckout() {
  const { items, getCartTotal, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const submitOrder = async (formData: CheckoutFormData, userId?: string) => {
    setIsProcessing(true);
    setError(null);
    
    try {
      const cartTotal = getCartTotal();
      
      // Validate cart has items
      if (items.length === 0) {
        throw new Error('Your cart is empty');
      }
      
      // Validate required form fields
      if (!formData.customerName || !formData.customerEmail) {
        throw new Error('Please provide your name and email');
      }
      
      // Validate delivery information if delivery is selected
      if (formData.isDelivery) {
        if (!formData.deliveryAddress || !formData.deliveryCity || 
            !formData.deliveryState || !formData.deliveryZip) {
          throw new Error('Please provide complete delivery information');
        }
      }
      
      // Process the checkout
      const result = await processCheckout(items, formData, cartTotal, userId);
      
      if (!result.success || result.error) {
        throw new Error(result.error || 'Checkout failed');
      }
      
      // Success - clear cart and set order ID
      setOrderId(result.orderId || null);
      setIsSuccess(true);
      clearCart();
      
      return { success: true, orderId: result.orderId };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      return { success: false, error: err instanceof Error ? err.message : 'An unknown error occurred' };
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    submitOrder,
    isProcessing,
    error,
    orderId,
    isSuccess,
    resetCheckout: () => {
      setError(null);
      setOrderId(null);
      setIsSuccess(false);
    }
  };
}
