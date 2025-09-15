'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Plus, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Copy, 
  Eye, 
  EyeOff, 
  Trash2,
  Package,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Download
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price_cents: number;
  tier: 'Starter' | 'Classic' | 'Black' | 'Ultra';
  strain: string;
  thc_range: string;
  is_active: boolean;
  hero_image_url: string;
  created_at: string;
  updated_at: string;
  product_inventory: Array<{
    stock: number;
    low_stock_threshold: number;
    allow_backorder: boolean;
  }>;
}

const TIER_COLORS = {
  Starter: 'bg-green-100 text-green-800',
  Classic: 'bg-blue-100 text-blue-800',
  Black: 'bg-gray-100 text-gray-800',
  Ultra: 'bg-purple-100 text-purple-800'
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showLowStock, setShowLowStock] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchProducts();
  }, [searchTerm, tierFilter, statusFilter, showLowStock]);

  const fetchProducts = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (tierFilter) params.append('tier', tierFilter);
      if (statusFilter) params.append('active', statusFilter);
      if (showLowStock) params.append('lowStock', 'true');

      const response = await fetch(`/api/admin/products?${params}`);
      if (!response.ok) throw new Error('Failed to fetch products');
      
      const data = await response.json();
      setProducts(data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (productId: string, currentActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentActive })
      });

      if (!response.ok) throw new Error('Failed to update product');
      
      toast.success(`Product ${!currentActive ? 'activated' : 'deactivated'}`);
      fetchProducts();
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }
      
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast.error(error.message || 'Failed to delete product');
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedProducts.size === 0) {
      toast.error('No products selected');
      return;
    }

    try {
      const promises = Array.from(selectedProducts).map(productId => {
        if (action === 'hide') {
          return fetch(`/api/admin/products/${productId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ is_active: false })
          });
        } else if (action === 'show') {
          return fetch(`/api/admin/products/${productId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ is_active: true })
          });
        }
        return Promise.resolve();
      });

      await Promise.all(promises);
      toast.success(`Bulk ${action} completed`);
      setSelectedProducts(new Set());
      fetchProducts();
    } catch (error) {
      console.error('Error in bulk action:', error);
      toast.error('Bulk action failed');
    }
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Tier', 'Price', 'Stock', 'Status', 'Created'];
    const csvData = products.map(product => [
      product.name,
      product.tier,
      `$${(product.price_cents / 100).toFixed(2)}`,
      product.product_inventory?.[0]?.stock || 0,
      product.is_active ? 'Active' : 'Hidden',
      new Date(product.created_at).toLocaleDateString()
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `products-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStockStatus = (product: Product) => {
    const inventory = product.product_inventory?.[0];
    if (!inventory) return { status: 'unknown', color: 'text-gray-500' };
    
    if (inventory.stock <= 0) {
      return { status: 'Out of Stock', color: 'text-red-600' };
    } else if (inventory.stock <= inventory.low_stock_threshold) {
      return { status: 'Low Stock', color: 'text-yellow-600' };
    } else {
      return { status: 'In Stock', color: 'text-green-600' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg p-6 h-64">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Products</h1>
            <p className="text-gray-600 mt-1">Manage your product catalog and inventory</p>
          </div>
          <Link
            href="/admin/products/new"
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            Add Product
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Tiers</option>
              <option value="Starter">Starter</option>
              <option value="Classic">Classic</option>
              <option value="Black">Black</option>
              <option value="Ultra">Ultra</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Hidden</option>
            </select>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showLowStock}
                onChange={(e) => setShowLowStock(e.target.checked)}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">Low Stock Only</span>
            </label>
          </div>

          {/* Bulk Actions */}
          {selectedProducts.size > 0 && (
            <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
              <span className="text-sm text-gray-600">
                {selectedProducts.size} selected
              </span>
              <button
                onClick={() => handleBulkAction('show')}
                className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded-md hover:bg-green-200"
              >
                Show
              </button>
              <button
                onClick={() => handleBulkAction('hide')}
                className="text-sm bg-gray-100 text-gray-800 px-3 py-1 rounded-md hover:bg-gray-200"
              >
                Hide
              </button>
              <button
                onClick={exportToCSV}
                className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-md hover:bg-blue-200 flex items-center gap-1"
              >
                <Download size={14} />
                Export CSV
              </button>
            </div>
          )}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => {
            const stockStatus = getStockStatus(product);
            const inventory = product.product_inventory?.[0];
            
            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  {/* Header with checkbox and actions */}
                  <div className="flex justify-between items-start mb-4">
                    <input
                      type="checkbox"
                      checked={selectedProducts.has(product.id)}
                      onChange={(e) => {
                        const newSelected = new Set(selectedProducts);
                        if (e.target.checked) {
                          newSelected.add(product.id);
                        } else {
                          newSelected.delete(product.id);
                        }
                        setSelectedProducts(newSelected);
                      }}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    
                    <div className="relative group">
                      <button className="p-2 hover:bg-gray-100 rounded-lg">
                        <MoreHorizontal size={16} />
                      </button>
                      <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 min-w-[160px]">
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Edit size={14} />
                          Edit
                        </Link>
                        <button
                          onClick={() => navigator.clipboard.writeText(product.slug)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                        >
                          <Copy size={14} />
                          Copy Slug
                        </button>
                        <button
                          onClick={() => handleToggleActive(product.id, product.is_active)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                        >
                          {product.is_active ? <EyeOff size={14} /> : <Eye size={14} />}
                          {product.is_active ? 'Hide' : 'Show'}
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Product Image */}
                  <div className="w-full h-32 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                    {product.hero_image_url ? (
                      <img
                        src={product.hero_image_url}
                        alt={product.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <Package size={32} className="text-gray-400" />
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
                      <p className="text-sm text-gray-600 truncate">{product.description}</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${TIER_COLORS[product.tier]}`}>
                        {product.tier}
                      </span>
                      <span className="font-semibold text-lg">
                        ${(product.price_cents / 100).toFixed(2)}
                      </span>
                    </div>

                    {product.strain && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Strain:</span> {product.strain}
                        {product.thc_range && ` • ${product.thc_range}`}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${stockStatus.color}`}>
                          {stockStatus.status}
                        </span>
                        {inventory && (
                          <span className="text-sm text-gray-500">
                            ({inventory.stock} units)
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1">
                        {product.is_active ? (
                          <CheckCircle size={16} className="text-green-500" />
                        ) : (
                          <XCircle size={16} className="text-red-500" />
                        )}
                        <span className="text-xs text-gray-500">
                          {product.is_active ? 'Active' : 'Hidden'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {products.length === 0 && (
          <div className="text-center py-12">
            <Package size={48} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-4">Get started by creating your first product</p>
            <Link
              href="/admin/products/new"
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors inline-flex items-center gap-2"
            >
              <Plus size={20} />
              Add Product
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
