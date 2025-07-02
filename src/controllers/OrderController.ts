import { OrderModel, Order, OrderItem, OrderStatus } from '@/models/Order';
import { SupabaseMCPResponse } from '@/lib/supabase-mcp';
import { ProductModel } from '@/models/Product';

/**
 * Order Controller class for handling order-related business logic
 * This follows the Controller part of the MCP pattern
 */
export class OrderController {
  /**
   * Create a new order with validation
   */
  static async createOrder(
    orderData: Omit<Order, 'id' | 'created_at'>,
    items: Array<{ productId: string; quantity: number }>
  ): Promise<SupabaseMCPResponse<{ orderId: string }>> {
    try {
      // Validate order data
      if (!orderData.customer_name || !orderData.customer_email) {
        return { error: 'Customer name and email are required' };
      }

      if (items.length === 0) {
        return { error: 'Order must contain at least one item' };
      }

      // Calculate total and prepare order items
      let total = 0;
      const orderItems: Omit<OrderItem, 'id' | 'order_id' | 'created_at'>[] = [];

      for (const item of items) {
        // Get product details
        const productResult = await ProductModel.getById(item.productId);
        
        if (productResult.error || !productResult.data) {
          return { error: `Product not found: ${item.productId}` };
        }
        
        const product = productResult.data;
        
        // Calculate item total
        const itemTotal = product.price * item.quantity;
        total += itemTotal;
        
        // Prepare order item
        orderItems.push({
          product_id: product.id,
          quantity: item.quantity,
          price: product.price,
          tier: product.tier,
          weight: product.weight,
          color_theme: product.color_theme
        });
      }

      // Set the calculated total
      orderData.total = total;
      
      // Create the order
      return OrderModel.create(orderData, orderItems);
    } catch (error) {
      console.error('Error creating order:', error);
      return { error: error instanceof Error ? error.message : String(error) };
    }
  }

  /**
   * Get an order by ID
   */
  static async getOrderById(id: string): Promise<SupabaseMCPResponse<{ order: Order; items: OrderItem[] }>> {
    return OrderModel.getById(id);
  }

  /**
   * Update order status with validation
   */
  static async updateOrderStatus(id: string, status: OrderStatus): Promise<SupabaseMCPResponse<null>> {
    // Get the current order to validate the status change
    const orderResult = await OrderModel.getById(id);
    
    if (orderResult.error || !orderResult.data) {
      return { error: orderResult.error || 'Order not found' };
    }
    
    const currentStatus = orderResult.data.order.status;
    
    // Validate status transitions
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      'pending': ['processing', 'cancelled'],
      'processing': ['completed', 'cancelled'],
      'completed': [],
      'cancelled': []
    };
    
    if (!validTransitions[currentStatus].includes(status)) {
      return { error: `Invalid status transition from ${currentStatus} to ${status}` };
    }
    
    // Update the status
    return OrderModel.updateStatus(id, status);
  }
}
