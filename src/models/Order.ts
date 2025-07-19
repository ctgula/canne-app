import { supabase } from '@/lib/supabase';

/**
 * Order status type
 */
export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';

/**
 * Payment method type
 */
export type PaymentMethod = 'cash' | 'card' | 'other';

/**
 * Order model representing the orders table in Supabase
 */
export interface Order {
  id: string;
  user_id?: string;
  created_at: string;
  status: OrderStatus;
  total: number;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  delivery_address?: string;
  delivery_city?: string;
  delivery_state?: string;
  delivery_zip?: string;
  is_delivery: boolean;
  delivery_notes?: string;
  payment_method: PaymentMethod;
}

/**
 * Order item model representing the order_items table in Supabase
 */
export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  tier: string;
  weight: string;
  color_theme: string;
  created_at: string;
}

/**
 * Response type for Order operations
 */
export type OrderResponse<T = any> = {
  data?: T;
  error?: string;
  count?: number;
};

/**
 * Order model class for interacting with the orders table
 * Uses direct Supabase client for better reliability
 */
export class OrderModel {
  /**
   * Create a new order
   */
  static async create(order: Omit<Order, 'id' | 'created_at'>, items: Omit<OrderItem, 'id' | 'order_id' | 'created_at'>[]): Promise<OrderResponse<{orderId: string}>> {
    try {
      // First, create the order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: order.user_id,
          status: order.status,
          total: order.total,
          customer_name: order.customer_name,
          customer_email: order.customer_email,
          customer_phone: order.customer_phone,
          delivery_address: order.delivery_address,
          delivery_city: order.delivery_city,
          delivery_state: order.delivery_state,
          delivery_zip: order.delivery_zip,
          is_delivery: order.is_delivery,
          delivery_notes: order.delivery_notes,
          payment_method: order.payment_method
        })
        .select('id')
        .single();

      if (orderError) {
        console.error('Error creating order:', orderError);
        return { error: orderError.message };
      }

      const orderId = orderData.id;

      // Then, create the order items
      if (items.length > 0) {
        const orderItems = items.map(item => ({
          order_id: orderId,
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price,
          tier: item.tier,
          weight: item.weight,
          color_theme: item.color_theme
        }));

        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItems);

        if (itemsError) {
          console.error('Error creating order items:', itemsError);
          // Try to rollback the order creation
          await supabase.from('orders').delete().eq('id', orderId);
          return { error: itemsError.message };
        }
      }

      return { data: { orderId } };
    } catch (err) {
      console.error('Unexpected error creating order:', err);
      return { error: err instanceof Error ? err.message : 'Unknown error' };
    }
  }

  /**
   * Get an order by ID including its items
   */
  static async getById(id: string): Promise<OrderResponse<Order & { items: OrderItem[] }>> {
    try {
      // Get the order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single();

      if (orderError) {
        console.error('Error fetching order:', orderError);
        return { error: orderError.message };
      }

      // Get the order items
      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', id);

      if (itemsError) {
        console.error('Error fetching order items:', itemsError);
        return { error: itemsError.message };
      }

      return {
        data: {
          ...orderData,
          items: itemsData || []
        }
      };
    } catch (err) {
      console.error('Unexpected error fetching order:', err);
      return { error: err instanceof Error ? err.message : 'Unknown error' };
    }
  }

  /**
   * Update order status
   */
  static async updateStatus(id: string, status: OrderStatus): Promise<OrderResponse<void>> {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', id);

      if (error) {
        console.error('Error updating order status:', error);
        return { error: error.message };
      }

      return { data: undefined };
    } catch (err) {
      console.error('Unexpected error updating order status:', err);
      return { error: err instanceof Error ? err.message : 'Unknown error' };
    }
  }
}
