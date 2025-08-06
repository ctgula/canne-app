import { supabase } from '@/lib/supabase';
import { Order, OrderItem } from '@/types/supabase';
import type { CartItem } from '@/services/CartService';

// Define a type for Supabase errors
type SupabaseError = {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
};

/**
 * Create a new order in Supabase
 */
export async function createOrder(orderData: Omit<Order, 'id' | 'created_at'>): Promise<{ data: Order | null, error: SupabaseError | null }> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creating order:', error);
    return { data: null, error: error as SupabaseError };
  }
}

/**
 * Add order items to an existing order
 */
export async function addOrderItems(orderId: string, cartItems: CartItem[]): Promise<{ success: boolean, error: SupabaseError | null }> {
  try {
    // Convert cart items to order items format
    const orderItems = cartItems.map(item => ({
      order_id: orderId,
      product_id: item.product.id,
      quantity: item.quantity,
      price: item.product.price,
      tier: item.product.name,
      weight: item.strain.name,
      color_theme: 'default',
    }));

    const { error } = await supabase
      .from('order_items')
      .insert(orderItems);
    
    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    console.error('Error adding order items:', error);
    return { success: false, error: error as SupabaseError };
  }
}

/**
 * Get order by ID with its items
 */
export async function getOrderWithItems(orderId: string): Promise<{ 
  order: Order | null, 
  items: OrderItem[], 
  error: SupabaseError | null 
}> {
  try {
    // Get order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();
    
    if (orderError) throw orderError;
    
    // Get order items
    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);
    
    if (itemsError) throw itemsError;
    
    return { 
      order, 
      items: items || [], 
      error: null 
    };
  } catch (error) {
    console.error('Error fetching order with items:', error);
    return { order: null, items: [], error: error as SupabaseError };
  }
}

/**
 * Update order status
 */
export async function updateOrderStatus(
  orderId: string, 
  status: Order['status']
): Promise<{ success: boolean, error: SupabaseError | null }> {
  try {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);
    
    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    console.error('Error updating order status:', error);
    return { success: false, error: error as SupabaseError };
  }
}

/**
 * Get all orders for a user
 */
export async function getUserOrders(userId: string): Promise<{ 
  orders: Order[], 
  error: SupabaseError | null 
}> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return { orders: data || [], error: null };
  } catch (error) {
    console.error('Error fetching user orders:', error);
    return { orders: [], error: error as SupabaseError };
  }
}
