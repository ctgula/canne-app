import { executeQuery, SupabaseMCPResponse } from '@/lib/supabase-mcp';

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
 * Order model class for interacting with the orders table
 * This follows the Model part of the MCP pattern
 */
export class OrderModel {
  /**
   * Create a new order
   */
  static async create(order: Omit<Order, 'id' | 'created_at'>, items: Omit<OrderItem, 'id' | 'order_id' | 'created_at'>[]): Promise<SupabaseMCPResponse<{orderId: string}>> {
    try {
      // Start a transaction to create the order and its items
      const result = await executeQuery<{id: string}[]>(`
        WITH new_order AS (
          INSERT INTO orders (
            user_id, status, total, customer_name, customer_email, 
            customer_phone, delivery_address, delivery_city, 
            delivery_state, delivery_zip, is_delivery, 
            delivery_notes, payment_method
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
          ) RETURNING id
        )
        SELECT id FROM new_order;
      `, [
        order.user_id || null,
        order.status,
        order.total,
        order.customer_name,
        order.customer_email,
        order.customer_phone || null,
        order.delivery_address || null,
        order.delivery_city || null,
        order.delivery_state || null,
        order.delivery_zip || null,
        order.is_delivery,
        order.delivery_notes || null,
        order.payment_method
      ]);

      if (result.error || !result.data || result.data.length === 0) {
        return { error: result.error || 'Failed to create order' };
      }

      const orderId = result.data[0].id;

      // Insert order items
      for (const item of items) {
        const itemResult = await executeQuery(`
          INSERT INTO order_items (
            order_id, product_id, quantity, price, tier, weight, color_theme
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7
          )
        `, [
          orderId,
          item.product_id,
          item.quantity,
          item.price,
          item.tier,
          item.weight,
          item.color_theme
        ]);

        if (itemResult.error) {
          return { error: `Failed to create order item: ${itemResult.error}` };
        }
      }

      return { data: { orderId } };
    } catch (error) {
      console.error('Error creating order:', error);
      return { error: error instanceof Error ? error.message : String(error) };
    }
  }

  /**
   * Get an order by ID including its items
   */
  static async getById(id: string): Promise<SupabaseMCPResponse<{ order: Order, items: OrderItem[] }>> {
    try {
      // Get the order
      const orderResult = await executeQuery<Order[]>(
        'SELECT * FROM orders WHERE id = $1 LIMIT 1',
        [id]
      );

      if (orderResult.error || !orderResult.data || orderResult.data.length === 0) {
        return { error: orderResult.error || 'Order not found' };
      }

      // Get the order items
      const itemsResult = await executeQuery<OrderItem[]>(
        'SELECT * FROM order_items WHERE order_id = $1',
        [id]
      );

      if (itemsResult.error) {
        return { error: itemsResult.error };
      }

      return {
        data: {
          order: orderResult.data[0],
          items: itemsResult.data || []
        }
      };
    } catch (error) {
      console.error('Error getting order:', error);
      return { error: error instanceof Error ? error.message : String(error) };
    }
  }

  /**
   * Update order status
   */
  static async updateStatus(id: string, status: OrderStatus): Promise<SupabaseMCPResponse<null>> {
    return executeQuery(
      'UPDATE orders SET status = $1 WHERE id = $2',
      [status, id]
    );
  }
}
