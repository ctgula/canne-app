import { supabase } from '@/lib/supabase';
import { Order, OrderItem } from '@/types/supabase';
import { CartItem } from '@/contexts/CartContext';

/**
 * Create a new order in Supabase
 */
export async function createOrder(orderData: Omit<Order, 'id' | 'created_at'>): Promise<{ data: Order | null, error: any }> {
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
    return { data: null, error };
  }
}

/**
 * Add order items to an existing order
 */
export async function addOrderItems(orderId: string, cartItems: CartItem[]): Promise<{ success: boolean, error: any }> {
  try {
    // Convert cart items to order items format
    const orderItems = cartItems.map(item => ({
      order_id: orderId,
      product_id: item.id,
      quantity: item.quantity,
      price: item.price,
      tier: item.tier,
      weight: item.weight,
      color_theme: item.colorTheme
    }));

    const { error } = await supabase
      .from('order_items')
      .insert(orderItems);
    
    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    console.error('Error adding order items:', error);
    return { success: false, error };
  }
}

/**
 * Get order by ID with its items
 */
export async function getOrderWithItems(orderId: string): Promise<{ 
  order: Order | null, 
  items: OrderItem[], 
  error: any 
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
    return { order: null, items: [], error };
  }
}

/**
 * Update order status
 */
export async function updateOrderStatus(
  orderId: string, 
  status: Order['status']
): Promise<{ success: boolean, error: any }> {
  try {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);
    
    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    console.error('Error updating order status:', error);
    return { success: false, error };
  }
}

/**
 * Get all orders for a user
 */
export async function getUserOrders(userId: string): Promise<{ 
  orders: Order[], 
  error: any 
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
    return { orders: [], error };
  }
}
