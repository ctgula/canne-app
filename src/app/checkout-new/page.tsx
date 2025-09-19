'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/services/CartService';
import Header from '@/components/Header';
import Link from 'next/link';
import { CheckCircle, ShoppingCart, AlertCircle, Loader2 } from 'lucide-react';

// Simple delivery info interface
interface DeliveryInfo {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  zipCode: string;
  timePreference: string;
  specialInstructions?: string;
}

export default function NewCheckoutPage() {
  const router = useRouter();
  const { items, clearCart, getTotal } = useCartStore();
  
  // State management
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOrderComplete, setIsOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo>({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: 'Washington',
    zipCode: '',
    timePreference: 'ASAP (60-90 min)',
    specialInstructions: ''
  });
  
  const [ageVerified, setAgeVerified] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Load cart on mount
  useEffect(() => {
    // Simple cart validation - remove any items with invalid product IDs
    const validProductIds = [
      'ddc696a0-a537-4d10-b820-584c6c512bff', // Starter
      '4e08d8c4-bc92-451c-b1fb-d2898070462f', // Classic  
      '9643176b-8940-4635-988f-d14274aad826', // Black
      '2bedb33f-6587-4337-8b18-c943d4b48067'  // Ultra
    ];
    
    const invalidItems = items.filter(item => 
      !item.product?.id || !validProductIds.includes(item.product.id)
    );
    
    if (invalidItems.length > 0) {
      console.log('🧹 Clearing invalid cart items');
      clearCart();
      alert('Your cart contained invalid items and has been cleared. Please add products again from the shop.');
      router.push('/shop');
    }
  }, [items, clearCart, router]);

  // Redirect if cart is empty
  if (items.length === 0 && !isOrderComplete) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="text-center">
            <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
            <p className="text-gray-600 mb-8">Add some products to your cart before checking out.</p>
            <Link 
              href="/shop" 
              className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Calculate totals
  const cartTotal = getTotal();
  const hasDelivery = cartTotal >= 35;
  const deliveryFee = hasDelivery ? 0 : 10;
  const finalTotal = cartTotal + deliveryFee;

  // Handle form input changes
  const handleInputChange = (field: keyof DeliveryInfo, value: string) => {
    setDeliveryInfo(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  // Validate form
  const validateForm = (): string | null => {
    if (!deliveryInfo.name.trim()) return 'Name is required';
    if (!deliveryInfo.phone.trim()) return 'Phone number is required';
    if (!deliveryInfo.email.trim()) return 'Email is required';
    if (!deliveryInfo.address.trim()) return 'Address is required';
    if (!deliveryInfo.zipCode.trim()) return 'ZIP code is required';
    if (!/^20[0-1]\d{2}$/.test(deliveryInfo.zipCode)) return 'Please enter a valid DC ZIP code (20000-20199)';
    if (!ageVerified) return 'You must confirm you are 21+ and in DC';
    if (!termsAccepted) return 'You must accept the Terms & Privacy Policy';
    return null;
  };

  // Submit order
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Prepare order data
      const orderData = {
        items: items.map(item => ({
          product: {
            id: item.product.id,
            name: item.product.name,
            price: item.product.price,
            tier: item.product.tier || 'starter',
            weight: item.product.weight || '3.5g',
            color_theme: item.product.color_theme || 'pink'
          },
          strain: {
            name: item.strain?.name || 'Moroccan Peach',
            type: item.strain?.type || 'Indica',
            thcLow: item.strain?.thcLow || 18,
            thcHigh: item.strain?.thcHigh || 22
          },
          quantity: item.quantity
        })),
        deliveryDetails: {
          name: deliveryInfo.name,
          phone: deliveryInfo.phone,
          email: deliveryInfo.email,
          address: deliveryInfo.address,
          city: deliveryInfo.city,
          zipCode: deliveryInfo.zipCode,
          timePreference: deliveryInfo.timePreference,
          specialInstructions: deliveryInfo.specialInstructions
        },
        total: finalTotal,
        hasDelivery: hasDelivery,
        status: 'pending'
      };

      console.log('🚀 Submitting order:', orderData);

      // Submit to API
      const response = await fetch('/api/place-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();
      console.log('📦 Order response:', result);

      if (response.ok && result.success) {
        setOrderId(result.orderId);
        setIsOrderComplete(true);
        clearCart();
      } else {
        throw new Error(result.error || 'Failed to submit order');
      }
    } catch (error) {
      console.error('❌ Order submission failed:', error);
      setError(error instanceof Error ? error.message : 'Failed to submit order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Order success screen
  if (isOrderComplete) {
    return (
      <div className="min-h-screen bg-green-50">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Confirmed!</h1>
            <p className="text-lg text-gray-600 mb-6">
              Thank you, {deliveryInfo.name}! Your order has been placed successfully.
            </p>
            
            <div className="bg-white rounded-lg p-6 shadow-sm border mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Order Details</h2>
              <p className="text-gray-600">Order ID: <span className="font-mono text-sm">{orderId}</span></p>
              <p className="text-gray-600">Total: <span className="font-semibold">${finalTotal.toFixed(2)}</span></p>
              <p className="text-gray-600">Delivery: {hasDelivery ? 'FREE' : `$${deliveryFee}`}</p>
            </div>

            <div className="space-y-4">
              <p className="text-gray-600">
                We'll send you updates via text and email. Expected delivery time: {deliveryInfo.timePreference}
              </p>
              
              <div className="flex gap-4 justify-center">
                <Link 
                  href="/shop" 
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Continue Shopping
                </Link>
                <Link 
                  href="/" 
                  className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main checkout form
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* CLEAR VISUAL INDICATOR THIS IS THE NEW SYSTEM */}
      <div className="bg-green-600 text-white text-center py-2">
        <p className="font-semibold">✅ NEW CHECKOUT SYSTEM ACTIVE - Beautiful & Working!</p>
      </div>
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Order Form */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Complete Your Order</h1>
            
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <p className="text-red-800">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Personal Information */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={deliveryInfo.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="John Doe"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={deliveryInfo.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="(202) 555-0123"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={deliveryInfo.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Delivery Address</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      value={deliveryInfo.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="123 Main St NW"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        value={deliveryInfo.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Washington"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ZIP Code *
                      </label>
                      <input
                        type="text"
                        value={deliveryInfo.zipCode}
                        onChange={(e) => handleInputChange('zipCode', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="20001"
                        maxLength={5}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery Preferences */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Delivery Preferences</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preferred Delivery Time
                    </label>
                    <select
                      value={deliveryInfo.timePreference}
                      onChange={(e) => handleInputChange('timePreference', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="ASAP (60-90 min)">ASAP (60-90 min)</option>
                      <option value="Evening (6-9 PM)">Evening (6-9 PM)</option>
                      <option value="Weekend">Weekend</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Special Instructions (Optional)
                    </label>
                    <textarea
                      value={deliveryInfo.specialInstructions}
                      onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      rows={3}
                      placeholder="Buzzer code, gate instructions, etc."
                    />
                  </div>
                </div>
              </div>

              {/* Verification */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="age-verification"
                    checked={ageVerified}
                    onChange={(e) => setAgeVerified(e.target.checked)}
                    className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label htmlFor="age-verification" className="text-sm text-gray-700">
                    I certify that I am 21+ years old and located in Washington, DC to place this order.
                  </label>
                </div>
                
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="terms-agreement"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label htmlFor="terms-agreement" className="text-sm text-gray-700">
                    I agree to the{' '}
                    <Link href="/terms" className="text-purple-600 hover:text-purple-700 underline">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="text-purple-600 hover:text-purple-700 underline">
                      Privacy Policy
                    </Link>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg font-semibold"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Processing Order...
                  </>
                ) : (
                  <>
                    Complete Order - ${finalTotal.toFixed(2)}
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>
            
            {/* Cart Items */}
            <div className="space-y-4 mb-6">
              {items.map((item, index) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.product.name}</h3>
                    <p className="text-sm text-gray-600">
                      {item.strain?.name || 'Moroccan Peach'} • Qty: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between text-gray-600">
                <span>Delivery</span>
                <span>{hasDelivery ? 'FREE' : `$${deliveryFee.toFixed(2)}`}</span>
              </div>
              
              {hasDelivery && (
                <div className="text-sm text-green-600">
                  🎉 Free delivery on orders $35+
                </div>
              )}
              
              <div className="flex justify-between text-lg font-semibold text-gray-900 pt-2 border-t">
                <span>Total</span>
                <span>${finalTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Info */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Payment Method</h3>
              <p className="text-sm text-blue-800">
                💳 Cash App Payment - Pay instantly with Cash App after order confirmation
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
