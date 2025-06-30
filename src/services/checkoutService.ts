import { CartItem } from '@/contexts/CartContext';
import { createOrder, addOrderItems } from './orderService';

// Define a type for checkout errors
type CheckoutError = string | Error | unknown;

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

/**
 * Process checkout with cart items and form data
 */
export async function processCheckout(
  cartItems: CartItem[], 
  formData: CheckoutFormData,
  cartTotal: number,
  userId?: string
): Promise<{ success: boolean; orderId?: string; error?: CheckoutError }> {
  try {
    // 1. Create the order
    const orderData = {
      user_id: userId || undefined, 
      status: 'pending' as const,
      total: cartTotal,
      customer_name: formData.customerName,
      customer_email: formData.customerEmail,
      customer_phone: formData.customerPhone || undefined,
      is_delivery: formData.isDelivery,
      delivery_address: formData.isDelivery ? formData.deliveryAddress : undefined,
      delivery_city: formData.isDelivery ? formData.deliveryCity : undefined,
      delivery_state: formData.isDelivery ? formData.deliveryState : undefined,
      delivery_zip: formData.isDelivery ? formData.deliveryZip : undefined,
      delivery_notes: formData.isDelivery ? formData.deliveryNotes : undefined,
      payment_method: formData.paymentMethod
    };

    const { data: order, error: orderError } = await createOrder(orderData);
    
    if (orderError || !order) {
      // The error from Supabase is an object, so we extract the message property, checking for null first.
      const errorMessage = orderError ? orderError.message : 'Failed to create order';
      throw new Error(errorMessage);
    }

    // 2. Add order items
    const { success, error: itemsError } = await addOrderItems(order.id, cartItems);
    
    if (!success || itemsError) {
      // Handle different possible error types from addOrderItems
      let errorMessage = 'Failed to add order items';
      if (typeof itemsError === 'string') {
        errorMessage = itemsError;
      } else if (itemsError instanceof Error) {
        errorMessage = itemsError.message;
      }
      throw new Error(errorMessage);
    }

    return { success: true, orderId: order.id };
  } catch (error) {
    console.error('Checkout process failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred during checkout' 
    };
  }
}
