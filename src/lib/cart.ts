import { supabase } from './supabase';

export interface CartItem {
  product_id: string;
  product_name: string;
  product_tier: string;
  gift_amount: string;
  color_theme: string;
  has_premium_badge: boolean;
  quantity: number;
  unit_price: number;
  total_price: number;
  image_url?: string;
}

export interface Cart {
  order_id: string | null;
  order_number?: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
  items: CartItem[];
}

export class CartService {
  /**
   * Add item to cart with Apple-level performance
   */
  static async addToCart(
    customerId: string,
    productId: string,
    quantity: number = 1
  ): Promise<{ success: boolean; message: string; order_id?: string }> {
    try {
      const { data, error } = await supabase.rpc('add_to_cart', {
        p_customer_id: customerId,
        p_product_id: productId,
        p_quantity: quantity,
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding to cart:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to add item to cart',
      };
    }
  }

  /**
   * Remove item from cart
   */
  static async removeFromCart(
    customerId: string,
    productId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const { data, error } = await supabase.rpc('remove_from_cart', {
        p_customer_id: customerId,
        p_product_id: productId,
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error removing from cart:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to remove item from cart',
      };
    }
  }

  /**
   * Update cart item quantity
   */
  static async updateQuantity(
    customerId: string,
    productId: string,
    newQuantity: number
  ): Promise<{ success: boolean; message: string }> {
    try {
      const { data, error } = await supabase.rpc('update_cart_quantity', {
        p_customer_id: customerId,
        p_product_id: productId,
        p_new_quantity: newQuantity,
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating cart quantity:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update quantity',
      };
    }
  }

  /**
   * Get cart contents with optimized performance
   */
  static async getCartContents(customerId: string): Promise<Cart> {
    try {
      const { data, error } = await supabase.rpc('get_cart_contents', {
        p_customer_id: customerId,
      });

      if (error) throw error;
      return data || { order_id: null, subtotal: 0, delivery_fee: 0, total: 0, items: [] };
    } catch (error) {
      console.error('Error getting cart contents:', error);
      return { order_id: null, subtotal: 0, delivery_fee: 0, total: 0, items: [] };
    }
  }

  /**
   * Get cart using optimized view (for read-only operations)
   */
  static async getCartView(customerId: string) {
    try {
      const { data, error } = await supabase
        .from('cart_view')
        .select('*')
        .eq('customer_id', customerId)
        .order('cart_created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting cart view:', error);
      return [];
    }
  }

  /**
   * Get all products with optimized query
   */
  static async getProducts(tier?: string) {
    try {
      let query = supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('tier', { ascending: true })
        .order('name', { ascending: true });

      if (tier) {
        query = query.eq('tier', tier);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting products:', error);
      return [];
    }
  }

  /**
   * Calculate cart totals (client-side validation)
   */
  static calculateTotals(items: CartItem[], deliveryFee: number = 0) {
    const subtotal = items.reduce((sum, item) => sum + item.total_price, 0);
    const total = subtotal + deliveryFee;
    
    return {
      subtotal: Number(subtotal.toFixed(2)),
      deliveryFee: Number(deliveryFee.toFixed(2)),
      total: Number(total.toFixed(2)),
      itemCount: items.length,
      totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
    };
  }

  /**
   * Format price for display
   */
  static formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  }
}

// Export default instance for convenience
export const cart = CartService;
