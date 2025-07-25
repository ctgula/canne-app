'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import { useCartStore } from '@/services/CartService';
import { Truck, MapPin, Clock, CreditCard, ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';

// Types for checkout
interface DeliveryDetails {
  name: string;
  email: string;
  phone: string;
  address: string;
  apartment?: string;
  city: string;
  zipCode: string;
  timePreference: 'morning' | 'afternoon' | 'evening';
  specialInstructions: string;
  ageVerification?: boolean;
  termsAccepted?: boolean;
  preferredTime?: string;
}

// Order interface
interface Order {
  id?: string;
  items: OrderCartItem[];
  deliveryDetails: DeliveryDetails;
  total: number;
  hasDelivery: boolean;
  status: 'pending' | 'processing' | 'delivered' | 'cancelled';
  createdAt?: Date;
  updatedAt?: Date;
}

// Cart item for order
interface OrderCartItem {
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    artworkUrl: string;
    giftSize: string;
    hasDelivery: boolean;
  };
  quantity: number;
}

export default function CheckoutPage() {
  const { items, clearCart, getTotal } = useCartStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOrderComplete, setIsOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState<string>('');
  const [phoneError, setPhoneError] = useState<string>('');

  const [deliveryDetails, setDeliveryDetails] = useState<DeliveryDetails>({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    timePreference: 'afternoon',
    specialInstructions: '',
    ageVerification: false,
    termsAccepted: false,
    preferredTime: ''
  });

  // Redirect if cart is empty
  if (items.length === 0 && !isOrderComplete) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">No items to checkout</h1>
            <p className="text-gray-600 mb-8">
              Add some beautiful artwork to your cart before proceeding to checkout.
            </p>
            <Link href="/" className="btn-primary">
              Browse Art Collection
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const cartTotal = getTotal();
  // Check if order qualifies for free delivery (orders $40 or more)
  const hasDelivery = cartTotal >= 40;
  const finalTotal = hasDelivery ? cartTotal : cartTotal + 10;

  // Phone number validation functions
  const formatPhoneNumber = (value: string) => {
    // Remove all non-digit characters
    const phoneNumber = value.replace(/\D/g, '');
    
    // Format as (XXX) XXX-XXXX
    if (phoneNumber.length >= 6) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
    } else if (phoneNumber.length >= 3) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    } else {
      return phoneNumber;
    }
  };

  const validatePhoneNumber = (phone: string) => {
    // Remove all non-digit characters for validation
    const digits = phone.replace(/\D/g, '');
    
    if (digits.length === 0) {
      return 'Phone number is required';
    } else if (digits.length < 10) {
      return 'Phone number must be at least 10 digits';
    } else if (digits.length > 11) {
      return 'Phone number is too long';
    } else if (digits.length === 11 && !digits.startsWith('1')) {
      return 'Invalid phone number format';
    }
    
    return '';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    if (name === 'phone') {
      // Format and validate phone number
      const formattedPhone = formatPhoneNumber(value);
      const error = validatePhoneNumber(formattedPhone);
      
      setPhoneError(error);
      setDeliveryDetails(prev => ({
        ...prev,
        [name]: formattedPhone
      }));
    } else if (type === 'checkbox') {
      // Handle checkbox inputs properly
      setDeliveryDetails(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setDeliveryDetails(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Comprehensive form validation
    const phoneValidationError = validatePhoneNumber(deliveryDetails.phone);
    if (phoneValidationError) {
      setPhoneError(phoneValidationError);
      alert('Please provide a valid phone number before submitting your order.');
      return;
    }
    
    // Validate required fields
    if (!deliveryDetails.name.trim()) {
      alert('Please enter your full name.');
      return;
    }
    
    if (!deliveryDetails.address.trim()) {
      alert('Please enter your delivery address.');
      return;
    }
    
    if (!deliveryDetails.city.trim()) {
      alert('Please enter your city.');
      return;
    }
    
    if (!deliveryDetails.zipCode.trim()) {
      alert('Please enter your ZIP code.');
      return;
    }
    
    // Validate required checkboxes
    if (!deliveryDetails.ageVerification) {
      alert('Please confirm that you are 21 years of age or older.');
      return;
    }
    
    if (!deliveryDetails.termsAccepted) {
      alert('Please accept the Terms of Service and Privacy Policy to continue.');
      return;
    }
    
    if (items.length === 0) {
      alert('Your cart is empty. Please add items before checking out.');
      return;
    }
    
    setIsSubmitting(true);

    try {
      // Convert CartStore items to the Order's CartItem format
      const orderItems: OrderCartItem[] = items.map(item => ({
        product: {
          id: item.product.id,
          name: item.product.name,
          description: item.product.tier || item.product.description || '',
          price: item.product.price,
          artworkUrl: item.product.image_url || '',
          giftSize: item.product.weight || `${item.product.tier} tier`,
          hasDelivery: hasDelivery
        },
        quantity: item.quantity
      }));
      
      const order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'> = {
        items: orderItems,
        deliveryDetails: {
          ...deliveryDetails,
          phone: deliveryDetails.phone.replace(/\D/g, ''), // Clean phone number
        },
        total: finalTotal,
        hasDelivery: hasDelivery,
        status: 'pending',
      };

      console.log('🚀 Frontend: Submitting order:', JSON.stringify(order, null, 2));
      console.log('🚀 Frontend: Cart items structure:', JSON.stringify(orderItems, null, 2));
      console.log('🚀 Frontend: Raw cart items from store:', JSON.stringify(items, null, 2));

      // Submit order to secure API
      const response = await fetch('/api/place-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(order),
      });

      const responseData = await response.json();
      console.log('API Response:', responseData);

      if (response.ok && responseData.success) {
        const { orderId: newOrderId } = responseData;
        setOrderId(newOrderId);
        setIsOrderComplete(true);
        clearCart();
      } else {
        const errorMessage = responseData.error || 'Failed to submit order';
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error submitting order:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Order submission failed: ${errorMessage}. Please try again or contact support.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Order confirmation screen
  if (isOrderComplete) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Confirmed!</h1>
            <p className="text-xl text-gray-600 mb-2">
              Thank you for your purchase, {deliveryDetails.name}!
            </p>
            <p className="text-lg text-gray-600 mb-8">
              Order #{orderId}
            </p>
            
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 mb-8 text-left">
              <h2 className="font-semibold text-gray-900 mb-4">What happens next?</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                    1
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Order Processing</p>
                    <p className="text-sm text-gray-600">We&apos;ll prepare your digital artwork and complimentary gifts</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Contact & Confirmation</p>
                    <p className="text-sm text-gray-600">We&apos;ll call you at {deliveryDetails.phone} to confirm delivery details</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                    3
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Delivery</p>
                    <p className="text-sm text-gray-600">Your order will be delivered during your preferred {deliveryDetails.timePreference} time slot</p>
                  </div>
                </div>
              </div>
            </div>

            <Link href="/" className="btn-primary">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link 
          href="/cart" 
          className="inline-flex items-center text-gray-600 hover:text-purple-600 mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Cart
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="card">
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard className="h-5 w-5 text-purple-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Contact Information</h2>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={deliveryDetails.name}
                      onChange={handleInputChange}
                      className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-base"
                      placeholder="John Doe"
                      autoComplete="name"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={deliveryDetails.email || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-base"
                        placeholder="john@example.com"
                        autoComplete="email"
                      />
                      <p className="mt-1 text-xs text-gray-500">For order confirmation and updates</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={deliveryDetails.phone}
                        onChange={handleInputChange}
                        className={`w-full px-3 sm:px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent transition-all text-base ${
                          phoneError 
                            ? 'border-red-300 focus:ring-red-500 bg-red-50' 
                            : 'border-gray-300 focus:ring-purple-500'
                        }`}
                        placeholder="(202) 555-0123"
                        maxLength={14}
                        autoComplete="tel"
                      />
                      {phoneError && (
                        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                          <span className="text-red-500">⚠️</span>
                          {phoneError}
                        </p>
                      )}
                      {deliveryDetails.phone && !phoneError && (
                        <p className="mt-2 text-sm text-green-600 flex items-center gap-1">
                          <span className="text-green-500">✅</span>
                          Valid phone number
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="h-5 w-5 text-purple-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Delivery Address</h2>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      name="address"
                      required
                      value={deliveryDetails.address}
                      onChange={handleInputChange}
                      className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-base"
                      placeholder="Start typing your address..."
                      autoComplete="street-address"
                    />
                    <p className="mt-1 text-xs text-gray-500">🏠 Address autofill available - start typing for suggestions</p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        required
                        value={deliveryDetails.city}
                        onChange={handleInputChange}
                        className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-base"
                        placeholder="Washington"
                        autoComplete="address-level2"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ZIP Code *
                      </label>
                      <input
                        type="text"
                        name="zipCode"
                        required
                        value={deliveryDetails.zipCode}
                        onChange={handleInputChange}
                        className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-base"
                        placeholder="20001"
                        autoComplete="postal-code"
                        maxLength={5}
                      />
                      <p className="mt-1 text-xs text-gray-500">📍 DC delivery only (20000-20199)</p>
                    </div>
                  </div>
                  
                  {/* Apartment/Unit field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Apartment, Suite, Unit (Optional)
                    </label>
                    <input
                      type="text"
                      name="apartment"
                      value={deliveryDetails.apartment || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-base"
                      placeholder="Apt 4B, Suite 200, etc."
                      autoComplete="address-line2"
                    />
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="h-5 w-5 text-purple-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Delivery Preferences</h2>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Delivery Time *
                    </label>
                    <select
                      name="timePreference"
                      value={deliveryDetails.timePreference}
                      onChange={handleInputChange}
                      className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-base"
                    >
                      <option value="morning">Morning (9 AM - 12 PM)</option>
                      <option value="afternoon">Afternoon (12 PM - 5 PM)</option>
                      <option value="evening">Evening (5 PM - 8 PM)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Special Instructions (Optional)
                    </label>
                    <textarea
                      name="specialInstructions"
                      value={deliveryDetails.specialInstructions}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none text-base"
                      placeholder="Any special delivery instructions..."
                    />
                  </div>
                </div>
              </div>
            </form>
          </div>

          <div className="lg:sticky lg:top-8 h-fit">
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                {items.map((item) => (
                  <div key={item.product.id} className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.product.name}</h3>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      <p className="text-sm text-green-600 font-medium">{item.product.gift_amount || item.product.weight || '0g'} complimentary gift</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${item.product.price * item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2 mb-6 pt-4 border-t">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>${cartTotal}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Delivery</span>
                  <div className="text-right">
                    {hasDelivery ? (
                      <div>
                        <span className="line-through text-gray-400 text-sm">$10</span>
                        <span className="ml-2 font-medium text-green-600">Free</span>
                      </div>
                    ) : (
                      <span>$10</span>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total</span>
                  <span>${finalTotal}</span>
                </div>
              </div>

              {hasDelivery && (
                <div className="bg-green-50 border border-green-200 p-4 rounded-xl mb-6">
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-900">
                      Free delivery included with your order!
                    </span>
                  </div>
                </div>
              )}

              {/* Payment Method */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">💳</span>
                  <h3 className="font-medium text-gray-900">Payment Method</h3>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg">
                  <input
                    type="radio"
                    id="cashOnDelivery"
                    name="paymentMethod"
                    value="cash"
                    defaultChecked
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                  />
                  <label htmlFor="cashOnDelivery" className="flex-1">
                    <div className="font-medium text-gray-900">Cash on Delivery</div>
                    <div className="text-sm text-gray-500">Pay with cash when your order arrives</div>
                  </label>
                  <span className="text-2xl">💵</span>
                </div>
              </div>

              {/* Legal Compliance - Age Verification and Terms */}
              <div className="space-y-4 mb-6">
                {/* Age Verification */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="ageVerification"
                      name="ageVerification"
                      required
                      className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      onChange={handleInputChange}
                    />
                    <label htmlFor="ageVerification" className="text-sm text-gray-700">
                      <span className="font-medium">Age Verification Required *</span>
                      <br />
                      I certify that I am 21 years of age or older and legally permitted to purchase cannabis products in Washington, DC.
                    </label>
                  </div>
                </div>
                
                {/* Terms and Privacy */}
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="termsAccepted"
                    name="termsAccepted"
                    required
                    className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    onChange={handleInputChange}
                  />
                  <label htmlFor="termsAccepted" className="text-sm text-gray-700">
                    I agree to the{' '}
                    <a href="/terms" target="_blank" className="text-purple-600 hover:text-purple-800 underline">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="/privacy" target="_blank" className="text-purple-600 hover:text-purple-800 underline">
                      Privacy Policy
                    </a>
                    *
                  </label>
                </div>
                
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="emailUpdates"
                    name="emailUpdates"
                    className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    onChange={handleInputChange}
                  />
                  <label htmlFor="emailUpdates" className="text-sm text-gray-700">
                    Send me order updates and exclusive offers via email (optional)
                  </label>
                </div>
              </div>

              <button
                type="submit"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed text-lg py-4"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Processing Order...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <span>🔒</span>
                    Complete Secure Order - ${finalTotal}
                  </div>
                )}
              </button>

              <div className="text-center mt-4 space-y-2">
                <p className="text-xs text-gray-500">
                  🛡️ Your information is secure and encrypted
                </p>
                <p className="text-xs text-gray-500">
                  📧 Order confirmation will be sent to your email
                </p>
                <p className="text-xs text-gray-400">
                  I-71 Compliant • 21+ Only • Washington, DC
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 