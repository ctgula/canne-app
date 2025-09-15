'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Save, 
  Upload, 
  X, 
  Eye, 
  Package,
  DollarSign,
  FileText,
  Settings,
  Image as ImageIcon
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ProductForm {
  name: string;
  slug: string;
  description: string;
  price_cents: number;
  tier: 'Starter' | 'Classic' | 'Black' | 'Ultra';
  strain: string;
  thc_range: string;
  hero_image_url: string;
  initial_stock: number;
  low_stock_threshold: number;
  allow_backorder: boolean;
}

const TIER_OPTIONS = [
  { value: 'Starter', label: 'Starter', color: 'bg-green-100 text-green-800' },
  { value: 'Classic', label: 'Classic', color: 'bg-blue-100 text-blue-800' },
  { value: 'Black', label: 'Black', color: 'bg-gray-100 text-gray-800' },
  { value: 'Ultra', label: 'Ultra', color: 'bg-purple-100 text-purple-800' }
];

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<ProductForm>({
    name: '',
    slug: '',
    description: '',
    price_cents: 0,
    tier: 'Starter',
    strain: '',
    thc_range: '',
    hero_image_url: '',
    initial_stock: 100,
    low_stock_threshold: 10,
    allow_backorder: false
  });

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  };

  const handleNameChange = (name: string) => {
    setForm(prev => ({
      ...prev,
      name,
      slug: prev.slug === generateSlug(prev.name) ? generateSlug(name) : prev.slug
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.name || !form.price_cents) {
      toast.error('Name and price are required');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      toast.success('Product created successfully');
      router.push('/admin/products');
    } catch (error: any) {
      console.error('Error creating product:', error);
      toast.error(error.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // For now, we'll use a placeholder URL
    // TODO: Implement Supabase Storage upload
    const imageUrl = URL.createObjectURL(file);
    setForm(prev => ({ ...prev, hero_image_url: imageUrl }));
    toast.success('Image uploaded (placeholder)');
  };

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
          <div>
            <h1 className="text-3xl font-bold text-gray-900">New Product</h1>
            <p className="text-gray-600 mt-1">Create a new product for your catalog</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
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
                      value={form.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter product name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Slug
                    </label>
                    <input
                      type="text"
                      value={form.slug}
                      onChange={(e) => setForm(prev => ({ ...prev, slug: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="product-slug"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      URL-friendly version of the name. Auto-generated if left empty.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Describe your product..."
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
                          value={form.price_cents / 100}
                          onChange={(e) => setForm(prev => ({ 
                            ...prev, 
                            price_cents: Math.round(parseFloat(e.target.value || '0') * 100)
                          }))}
                          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="0.00"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tier
                      </label>
                      <select
                        value={form.tier}
                        onChange={(e) => setForm(prev => ({ 
                          ...prev, 
                          tier: e.target.value as ProductForm['tier']
                        }))}
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
                      value={form.strain}
                      onChange={(e) => setForm(prev => ({ ...prev, strain: e.target.value }))}
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
                      value={form.thc_range}
                      onChange={(e) => setForm(prev => ({ ...prev, thc_range: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="e.g., 18-22%"
                    />
                  </div>
                </div>
              </div>

              {/* Inventory Settings */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Settings size={20} className="text-blue-600" />
                  <h2 className="text-lg font-semibold">Inventory Settings</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Initial Stock
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={form.initial_stock}
                        onChange={(e) => setForm(prev => ({ 
                          ...prev, 
                          initial_stock: parseInt(e.target.value) || 0
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Low Stock Threshold
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={form.low_stock_threshold}
                        onChange={(e) => setForm(prev => ({ 
                          ...prev, 
                          low_stock_threshold: parseInt(e.target.value) || 0
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.allow_backorder}
                      onChange={(e) => setForm(prev => ({ 
                        ...prev, 
                        allow_backorder: e.target.checked
                      }))}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">Allow backorders when out of stock</span>
                  </label>
                </div>
              </div>

              {/* Image Upload */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <ImageIcon size={20} className="text-orange-600" />
                  <h2 className="text-lg font-semibold">Product Image</h2>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hero Image URL
                    </label>
                    <input
                      type="url"
                      value={form.hero_image_url}
                      onChange={(e) => setForm(prev => ({ ...prev, hero_image_url: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div className="text-center">
                    <label className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors">
                      <Upload size={16} />
                      Upload Image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-2">
                      Upload feature coming soon. Use URL for now.
                    </p>
                  </div>
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
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save size={16} />
                  {loading ? 'Creating...' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>

          {/* Preview */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Eye size={20} className="text-purple-600" />
                  <h2 className="text-lg font-semibold">Preview</h2>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4">
                  {/* Preview Image */}
                  <div className="w-full h-32 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                    {form.hero_image_url ? (
                      <img
                        src={form.hero_image_url}
                        alt={form.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <Package size={32} className="text-gray-400" />
                    )}
                  </div>

                  {/* Preview Content */}
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {form.name || 'Product Name'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {form.description || 'Product description will appear here...'}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        TIER_OPTIONS.find(t => t.value === form.tier)?.color || 'bg-gray-100 text-gray-800'
                      }`}>
                        {form.tier}
                      </span>
                      <span className="font-semibold text-lg">
                        ${(form.price_cents / 100).toFixed(2)}
                      </span>
                    </div>

                    {(form.strain || form.thc_range) && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Strain:</span> {form.strain || 'Not specified'}
                        {form.thc_range && ` • ${form.thc_range}`}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <div className="text-sm text-green-600 font-medium">
                        In Stock ({form.initial_stock} units)
                      </div>
                      <div className="text-xs text-gray-500">
                        Active
                      </div>
                    </div>
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
