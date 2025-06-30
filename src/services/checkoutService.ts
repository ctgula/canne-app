import { CartItem } from '@/contexts/CartContext';
import { createOrder, addOrderItems } from './orderService';

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
): Promise<{ success: boolean; orderId?: string; error?: any }> {
  try {
    // 1. Create the order
    const orderData = {
      user_id: userId || null,
      status: 'pending' as const,
      total: cartTotal,
      customer_name: formData.customerName,
      customer_email: formData.customerEmail,
      customer_phone: formData.customerPhone || null,
      is_delivery: formData.isDelivery,
      delivery_address: formData.isDelivery ? formData.deliveryAddress : null,
      delivery_city: formData.isDelivery ? formData.deliveryCity : null,
      delivery_state: formData.isDelivery ? formData.deliveryState : null,
      delivery_zip: formData.isDelivery ? formData.deliveryZip : null,
      delivery_notes: formData.isDelivery ? formData.deliveryNotes : null,
      payment_method: formData.paymentMethod
    };

    const { data: order, error: orderError } = await createOrder(orderData);
    
    if (orderError || !order) {
      throw new Error(orderError || 'Failed to create order');
    }

    // 2. Add order items
    const { success, error: itemsError } = await addOrderItems(order.id, cartItems);
    
    if (!success || itemsError) {
      throw new Error(itemsError || 'Failed to add order items');
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
