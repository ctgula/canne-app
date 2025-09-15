'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Save, 
  Upload, 
  Eye, 
  Package,
  DollarSign,
  FileText,
  Settings,
  Image as ImageIcon,
  Plus,
  Minus,
  History
} from 'lucide-react';
import { toast } from 'react-hot-toast';

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
  product_images: Array<{
    id: string;
    url: string;
    sort: number;
  }>;
}

const TIER_OPTIONS = [
  { value: 'Starter', label: 'Starter', color: 'bg-green-100 text-green-800' },
  { value: 'Classic', label: 'Classic', color: 'bg-blue-100 text-blue-800' },
  { value: 'Black', label: 'Black', color: 'bg-gray-100 text-gray-800' },
  { value: 'Ultra', label: 'Ultra', color: 'bg-purple-100 text-purple-800' }
];

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stockAdjustment, setStockAdjustment] = useState(0);
  const [adjustmentReason, setAdjustmentReason] = useState('');
  const [showStockAdjust, setShowStockAdjust] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [params.id]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/admin/products/${params.id}`);
      if (!response.ok) throw new Error('Failed to fetch product');
      
      const data = await response.json();
      setProduct(data.product);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to load product');
      router.push('/admin/products');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    setSaving(true);
    try {
      const inventory = product.product_inventory[0];
      const response = await fetch(`/api/admin/products/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: product.name,
          slug: product.slug,
          description: product.description,
          price_cents: product.price_cents,
          tier: product.tier,
          strain: product.strain,
          thc_range: product.thc_range,
          hero_image_url: product.hero_image_url,
          is_active: product.is_active,
          low_stock_threshold: inventory?.low_stock_threshold,
          allow_backorder: inventory?.allow_backorder
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      toast.success('Product updated successfully');
    } catch (error: any) {
      console.error('Error updating product:', error);
      toast.error(error.message || 'Failed to update product');
    } finally {
      setSaving(false);
    }
  };

  const handleStockAdjustment = async () => {
    if (!stockAdjustment || !adjustmentReason.trim()) {
      toast.error('Please enter adjustment amount and reason');
      return;
    }

    try {
      const response = await fetch(`/api/admin/products/${params.id}/adjust-stock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adjustment: stockAdjustment,
          reason: adjustmentReason
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      const result = await response.json();
      toast.success(`Stock adjusted: ${result.old_stock} → ${result.new_stock}`);
      
      // Update local state
      if (product) {
        setProduct({
          ...product,
          product_inventory: [{
            ...product.product_inventory[0],
            stock: result.new_stock
          }]
        });
      }

      setStockAdjustment(0);
      setAdjustmentReason('');
      setShowStockAdjust(false);
    } catch (error: any) {
      console.error('Error adjusting stock:', error);
      toast.error(error.message || 'Failed to adjust stock');
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  };

  const handleNameChange = (name: string) => {
    if (!product) return;
    setProduct({
      ...product,
      name,
      slug: product.slug === generateSlug(product.name) ? generateSlug(name) : product.slug
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="bg-white rounded-lg p-6 h-96"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <Package size={48} className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Product not found</h3>
          <button
            onClick={() => router.push('/admin/products')}
            className="text-purple-600 hover:text-purple-700"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  const inventory = product.product_inventory[0];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            <p className="text-gray-600 mt-1">Edit product details and manage inventory</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              product.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {product.is_active ? 'Active' : 'Hidden'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSave} className="space-y-6">
              {/* Basic Information */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Package size={20} className="text-purple-600" />
                  <h2 className="text-lg font-semibold">Basic Information</h2>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      value={product.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Slug
                    </label>
                    <input
                      type="text"
                      value={product.slug}
                      onChange={(e) => setProduct({ ...product, slug: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={product.description || ''}
                      onChange={(e) => setProduct({ ...product, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price *
                      </label>
                      <div className="relative">
                        <DollarSign size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="number"
                          step="0.01"
                          value={product.price_cents / 100}
                          onChange={(e) => setProduct({ 
                            ...product, 
                            price_cents: Math.round(parseFloat(e.target.value || '0') * 100)
                          })}
                          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tier
                      </label>
                      <select
                        value={product.tier}
                        onChange={(e) => setProduct({ 
                          ...product, 
                          tier: e.target.value as Product['tier']
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        {TIER_OPTIONS.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={product.is_active}
                      onChange={(e) => setProduct({ ...product, is_active: e.target.checked })}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">Product is active and visible in shop</span>
                  </label>
                </div>
              </div>

              {/* Cannabis Information */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <FileText size={20} className="text-green-600" />
                  <h2 className="text-lg font-semibold">Cannabis Information</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Strain
                    </label>
                    <input
                      type="text"
                      value={product.strain || ''}
                      onChange={(e) => setProduct({ ...product, strain: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="e.g., Moroccan Peach"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      THC Range
                    </label>
                    <input
                      type="text"
                      value={product.thc_range || ''}
                      onChange={(e) => setProduct({ ...product, thc_range: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="e.g., 18-22%"
                    />
                  </div>
                </div>
              </div>

              {/* Inventory Management */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Settings size={20} className="text-blue-600" />
                    <h2 className="text-lg font-semibold">Inventory Management</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowStockAdjust(!showStockAdjust)}
                    className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-md hover:bg-blue-200"
                  >
                    Adjust Stock
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Current Stock
                      </label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-lg font-semibold">
                        {inventory?.stock || 0}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Low Stock Threshold
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={inventory?.low_stock_threshold || 0}
                        onChange={(e) => setProduct({
                          ...product,
                          product_inventory: [{
                            ...inventory,
                            low_stock_threshold: parseInt(e.target.value) || 0
                          }]
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>

                    <div className="flex items-end">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={inventory?.allow_backorder || false}
                          onChange={(e) => setProduct({
                            ...product,
                            product_inventory: [{
                              ...inventory,
                              allow_backorder: e.target.checked
                            }]
                          })}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-sm text-gray-700">Allow backorders</span>
                      </label>
                    </div>
                  </div>

                  {/* Stock Adjustment Panel */}
                  {showStockAdjust && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border border-blue-200 rounded-lg p-4 bg-blue-50"
                    >
                      <h3 className="font-medium text-blue-900 mb-3">Adjust Stock Level</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-blue-800 mb-1">
                            Adjustment
                          </label>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setStockAdjustment(prev => prev - 1)}
                              className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                            >
                              <Minus size={16} />
                            </button>
                            <input
                              type="number"
                              value={stockAdjustment}
                              onChange={(e) => setStockAdjustment(parseInt(e.target.value) || 0)}
                              className="flex-1 px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-center"
                              placeholder="0"
                            />
                            <button
                              type="button"
                              onClick={() => setStockAdjustment(prev => prev + 1)}
                              className="p-1 bg-green-100 text-green-600 rounded hover:bg-green-200"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-blue-800 mb-1">
                            Reason *
                          </label>
                          <input
                            type="text"
                            value={adjustmentReason}
                            onChange={(e) => setAdjustmentReason(e.target.value)}
                            className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., Restock, Damaged goods"
                          />
                        </div>

                        <div className="flex items-end">
                          <button
                            type="button"
                            onClick={handleStockAdjustment}
                            disabled={!stockAdjustment || !adjustmentReason.trim()}
                            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                      
                      {stockAdjustment !== 0 && (
                        <div className="mt-3 p-2 bg-white rounded border border-blue-200">
                          <p className="text-sm text-blue-800">
                            Stock will change: {inventory?.stock || 0} → {(inventory?.stock || 0) + stockAdjustment}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Image Management */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <ImageIcon size={20} className="text-orange-600" />
                  <h2 className="text-lg font-semibold">Product Image</h2>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hero Image URL
                  </label>
                  <input
                    type="url"
                    value={product.hero_image_url || ''}
                    onChange={(e) => setProduct({ ...product, hero_image_url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save size={16} />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>

          {/* Preview */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              {/* Product Preview */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Eye size={20} className="text-purple-600" />
                  <h2 className="text-lg font-semibold">Preview</h2>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4">
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

                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{product.name}</h3>
                      <p className="text-sm text-gray-600">{product.description}</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        TIER_OPTIONS.find(t => t.value === product.tier)?.color
                      }`}>
                        {product.tier}
                      </span>
                      <span className="font-semibold text-lg">
                        ${(product.price_cents / 100).toFixed(2)}
                      </span>
                    </div>

                    {(product.strain || product.thc_range) && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Strain:</span> {product.strain}
                        {product.thc_range && ` • ${product.thc_range}`}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <div className={`text-sm font-medium ${
                        (inventory?.stock || 0) <= 0 ? 'text-red-600' :
                        (inventory?.stock || 0) <= (inventory?.low_stock_threshold || 0) ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {(inventory?.stock || 0) <= 0 ? 'Out of Stock' :
                         (inventory?.stock || 0) <= (inventory?.low_stock_threshold || 0) ? 'Low Stock' :
                         'In Stock'} ({inventory?.stock || 0} units)
                      </div>
                      <div className="text-xs text-gray-500">
                        {product.is_active ? 'Active' : 'Hidden'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <History size={20} className="text-gray-600" />
                  <h2 className="text-lg font-semibold">Quick Stats</h2>
                </div>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created:</span>
                    <span>{new Date(product.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Updated:</span>
                    <span>{new Date(product.updated_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Stock Value:</span>
                    <span>${(((inventory?.stock || 0) * product.price_cents) / 100).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
