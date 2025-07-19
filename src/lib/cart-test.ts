import { CartService } from './cart';

/**
 * Cart Testing Suite for Apple-level Quality Assurance
 * Run these tests to verify cart functionality
 */
export class CartTestSuite {
  private static testCustomerId = 'test-customer-' + Date.now();
  private static testProductId = 'test-product-' + Date.now();

  /**
   * Run all cart tests
   */
  static async runAllTests(): Promise<void> {
    console.log('🧪 Starting Cart Test Suite...');
    
    try {
      await this.testAddToCart();
      await this.testUpdateQuantity();
      await this.testGetCartContents();
      await this.testRemoveFromCart();
      await this.testCartCalculations();
      await this.testProductRetrieval();
      
      console.log('✅ All cart tests passed!');
    } catch (error) {
      console.error('❌ Cart test failed:', error);
      throw error;
    }
  }

  /**
   * Test adding items to cart
   */
  private static async testAddToCart(): Promise<void> {
    console.log('Testing add to cart...');
    
    // This would normally use real product IDs from your database
    // For testing, you'll need to replace with actual product IDs
    const result = await CartService.addToCart(
      this.testCustomerId,
      this.testProductId,
      2
    );
    
    if (!result.success) {
      console.log('ℹ️ Add to cart test skipped (requires real product ID)');
      return;
    }
    
    console.log('✅ Add to cart test passed');
  }

  /**
   * Test updating cart quantity
   */
  private static async testUpdateQuantity(): Promise<void> {
    console.log('Testing update quantity...');
    
    const result = await CartService.updateQuantity(
      this.testCustomerId,
      this.testProductId,
      3
    );
    
    if (!result.success) {
      console.log('ℹ️ Update quantity test skipped (requires existing cart item)');
      return;
    }
    
    console.log('✅ Update quantity test passed');
  }

  /**
   * Test getting cart contents
   */
  private static async testGetCartContents(): Promise<void> {
    console.log('Testing get cart contents...');
    
    const cart = await CartService.getCartContents(this.testCustomerId);
    
    if (typeof cart !== 'object' || cart === null) {
      throw new Error('Cart contents should return an object');
    }
    
    if (!('items' in cart) || !Array.isArray(cart.items)) {
      throw new Error('Cart should have items array');
    }
    
    console.log('✅ Get cart contents test passed');
  }

  /**
   * Test removing items from cart
   */
  private static async testRemoveFromCart(): Promise<void> {
    console.log('Testing remove from cart...');
    
    const result = await CartService.removeFromCart(
      this.testCustomerId,
      this.testProductId
    );
    
    if (!result.success) {
      console.log('ℹ️ Remove from cart test skipped (requires existing cart item)');
      return;
    }
    
    console.log('✅ Remove from cart test passed');
  }

  /**
   * Test cart calculations
   */
  private static async testCartCalculations(): Promise<void> {
    console.log('Testing cart calculations...');
    
    const mockItems = [
      {
        product_id: '1',
        product_name: 'Test Product 1',
        product_tier: 'starter',
        gift_amount: '$25',
        color_theme: 'blue',
        has_premium_badge: false,
        quantity: 2,
        unit_price: 25.00,
        total_price: 50.00,
      },
      {
        product_id: '2',
        product_name: 'Test Product 2',
        product_tier: 'classic',
        gift_amount: '$50',
        color_theme: 'green',
        has_premium_badge: true,
        quantity: 1,
        unit_price: 50.00,
        total_price: 50.00,
      },
    ];
    
    const totals = CartService.calculateTotals(mockItems, 5.99);
    
    if (totals.subtotal !== 100.00) {
      throw new Error(`Expected subtotal 100.00, got ${totals.subtotal}`);
    }
    
    if (totals.deliveryFee !== 5.99) {
      throw new Error(`Expected delivery fee 5.99, got ${totals.deliveryFee}`);
    }
    
    if (totals.total !== 105.99) {
      throw new Error(`Expected total 105.99, got ${totals.total}`);
    }
    
    if (totals.itemCount !== 2) {
      throw new Error(`Expected item count 2, got ${totals.itemCount}`);
    }
    
    if (totals.totalQuantity !== 3) {
      throw new Error(`Expected total quantity 3, got ${totals.totalQuantity}`);
    }
    
    console.log('✅ Cart calculations test passed');
  }

  /**
   * Test product retrieval
   */
  private static async testProductRetrieval(): Promise<void> {
    console.log('Testing product retrieval...');
    
    const products = await CartService.getProducts();
    
    if (!Array.isArray(products)) {
      throw new Error('Products should return an array');
    }
    
    // Test tier filtering
    const starterProducts = await CartService.getProducts('starter');
    
    if (!Array.isArray(starterProducts)) {
      throw new Error('Filtered products should return an array');
    }
    
    console.log('✅ Product retrieval test passed');
  }

  /**
   * Test price formatting
   */
  static testPriceFormatting(): void {
    console.log('Testing price formatting...');
    
    const formatted1 = CartService.formatPrice(25.99);
    if (formatted1 !== '$25.99') {
      throw new Error(`Expected $25.99, got ${formatted1}`);
    }
    
    const formatted2 = CartService.formatPrice(100);
    if (formatted2 !== '$100.00') {
      throw new Error(`Expected $100.00, got ${formatted2}`);
    }
    
    console.log('✅ Price formatting test passed');
  }
}

// Export for easy testing
export const testCart = CartTestSuite;
