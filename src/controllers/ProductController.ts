import { ProductModel, Product, ProductResponse } from '@/models/Product';

/**
 * Product Controller class for handling product-related business logic
 * This follows the Controller part of the MCP pattern
 */
export class ProductController {
  /**
   * Get all products
   */
  static async getAllProducts(): Promise<ProductResponse<Product[]>> {
    return ProductModel.getAll();
  }

  /**
   * Get a product by ID
   */
  static async getProductById(id: string): Promise<ProductResponse<Product>> {
    return ProductModel.getById(id);
  }

  /**
   * Get products by tier
   */
  static async getProductsByTier(tier: string): Promise<ProductResponse<Product[]>> {
    return ProductModel.getByTier(tier);
  }

  /**
   * Get products grouped by tier
   * This adds business logic on top of the model layer
   */
  static async getProductsByTierGrouped(): Promise<ProductResponse<Record<string, Product[]>>> {
    const result = await ProductModel.getAll();
    
    if (result.error || !result.data) {
      // Create a properly typed error response
      return { 
        error: result.error || 'No data available'
      };
    }
    
    // Group products by tier
    const groupedProducts = result.data.reduce((acc, product) => {
      if (!acc[product.tier]) {
        acc[product.tier] = [];
      }
      acc[product.tier].push(product);
      return acc;
    }, {} as Record<string, Product[]>);
    
    return { data: groupedProducts };
  }
}
