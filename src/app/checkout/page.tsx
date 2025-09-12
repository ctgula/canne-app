'use client';

import React, { useState } from 'react';
import { getTierInfo } from '@/lib/gifting';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Checkbox } from '@/components/ui/checkbox';
import Header from '@/components/Header';
import { useCartStore } from '@/services/CartService';
import { Truck, MapPin, Clock, CreditCard, ArrowLeft, CheckCircle, Shield, Lock, Smartphone } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useCashAppPayment } from '@/lib/cashapp-payment';

import CheckoutFAQ from './components/CheckoutFAQ';

// Types for checkout
interface DeliveryDetails {
  name: string;
  email: string;
  phone: string;
  address: string;
  apartment?: string;
  city: string;
  zipCode: string;
  timePreference: string;
  specialInstructions: string;
  ageVerification?: boolean;
  termsAccepted?: boolean;
  preferredTime?: string;
  emailUpdates?: boolean;
}

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
  strain: {
    name: string;
    type: string;
    thcLow: number;
    thcHigh: number;
  };
}

export default function CheckoutPage() {
  const { items, clearCart, getTotal } = useCartStore();
  const { initiatePayment } = useCashAppPayment();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOrderComplete, setIsOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'regular' | 'cashapp'>('regular');
  const [confirmedOrder, setConfirmedOrder] = useState<{
    subtotal: number;
    delivery_fee: number;
    total: number;
    order_number: string;
    items: Array<{
      product_id: string;
      quantity: number;
      unit_price: number;
      strain: string;
      thc_low: number;
      thc_high: number;
      products: {
        tier: string;
        weight: string;
        color_theme: string;
      };
    }>;
  } | null>(null);
  const [phoneError, setPhoneError] = useState<string>('');

  // zod schema for required checkboxes
  const schema = z.object({
    ageVerified: z.boolean().refine((v) => v === true, {
      message: 'You must confirm you are 21+ and in DC to order.',
    }),
    acceptTerms: z.boolean().refine((v) => v === true, {
      message: 'You must accept the Terms & Privacy Policy.',
    }),
    emailOptIn: z.boolean(),
  });

  type CheckboxForm = z.infer<typeof schema>;

  const form = useForm<CheckboxForm>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: { ageVerified: false, acceptTerms: false, emailOptIn: false },
  });

  const [deliveryDetails, setDeliveryDetails] = useState<DeliveryDetails>({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    timePreference: 'ASAP (60–90 min)',
    specialInstructions: '',
    ageVerification: false,
    termsAccepted: false,
    preferredTime: '',
    emailUpdates: false
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
            <Link href="/shop" className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-xl text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200 min-w-[200px]">
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const cartTotal = getTotal();
  
  // Prevent checkout with empty cart or zero total
  if (cartTotal <= 0 && !isOrderComplete) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Cart is empty</h1>
            <p className="text-gray-600 mb-8">
              Add some items to your cart before proceeding to checkout.
            </p>
            <Link href="/shop" className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-xl text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200 min-w-[200px]">
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  const hasDelivery = cartTotal >= 35;
  const finalTotal = hasDelivery ? cartTotal : cartTotal + 10;
  
  // Debug pricing calculations
  console.log('💰 Checkout Pricing Debug:', {
    cartTotal: cartTotal,
    hasDelivery: hasDelivery,
    deliveryFee: hasDelivery ? 0 : 10,
    finalTotal: finalTotal,
    confirmedOrder: confirmedOrder
  });

  // Phone validation functions
  const formatPhoneNumber = (value: string) => {
    const phoneNumber = value.replace(/\D/g, '');
    if (phoneNumber.length >= 6) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
    } else if (phoneNumber.length >= 3) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    } else {
      return phoneNumber;
    }
  };

  const validatePhoneNumber = (phone: string) => {
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
      const formattedPhone = formatPhoneNumber(value);
      const error = validatePhoneNumber(formattedPhone);
      setPhoneError(error);
      setDeliveryDetails(prev => ({
        ...prev,
        [name]: formattedPhone
      }));
    } else if (type === 'checkbox') {
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

  const handleFieldFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    try {
      setTimeout(() => {
        e.target.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }, 50);
    } catch {}
  };

  const handleCashAppPayment = async (data: CheckboxForm) => {
    // Validate form first
    const validationErrors = [];
    
    if (!deliveryDetails.name.trim()) {
      validationErrors.push('Full name is required');
    }
    
    if (!deliveryDetails.email?.trim()) {
      validationErrors.push('Email address is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(deliveryDetails.email)) {
      validationErrors.push('Please enter a valid email address');
    }
    
    const phoneValidationError = validatePhoneNumber(deliveryDetails.phone);
    if (phoneValidationError) {
      validationErrors.push(phoneValidationError);
      setPhoneError(phoneValidationError);
    }
    
    if (validationErrors.length > 0) {
      alert(`Please complete your information first:\n\n• ${validationErrors.join('\n• ')}`);
      return;
    }

    // Initiate Cash App payment
    const success = await initiatePayment(finalTotal, deliveryDetails.phone.replace(/\D/g, ''));
    if (!success) {
      alert('Failed to create Cash App payment. Please try again.');
    }
  };

  const submitHandler = async (data: CheckboxForm) => {
    if (isSubmitting) return;
    
    // Handle Cash App payment separately
    if (paymentMethod === 'cashapp') {
      await handleCashAppPayment(data);
      return;
    }
    
    // Comprehensive form validation with better UX
    const validationErrors = [];
    
    if (!deliveryDetails.name.trim()) {
      validationErrors.push('Full name is required');
    }
    
    if (!deliveryDetails.email?.trim()) {
      validationErrors.push('Email address is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(deliveryDetails.email)) {
      validationErrors.push('Please enter a valid email address');
    }
    
    const phoneValidationError = validatePhoneNumber(deliveryDetails.phone);
    if (phoneValidationError) {
      validationErrors.push(phoneValidationError);
      setPhoneError(phoneValidationError);
    }
    
    if (!deliveryDetails.address.trim()) {
      validationErrors.push('Street address is required');
    }
    
    if (!deliveryDetails.city.trim()) {
      validationErrors.push('City is required');
    }
    
    if (!deliveryDetails.zipCode.trim()) {
      validationErrors.push('ZIP code is required');
    } else if (!/^20[0-1]\d{2}$/.test(deliveryDetails.zipCode)) {
      validationErrors.push('Please enter a valid DC ZIP code (20000-20199)');
    }
    
    if (items.length === 0) {
      validationErrors.push('Your cart is empty. Please add items before checking out.');
    }
    
    if (validationErrors.length > 0) {
      alert(`Please fix the following issues:\n\n• ${validationErrors.join('\n• ')}`);
      return;
    }
    
    setIsSubmitting(true);

    try {
      const orderItems: OrderCartItem[] = items.map(item => ({
        product: {
          id: item.product.id,
          name: item.product.name,
          description: (((item.product as any).display_tier) || item.product.tier || item.product.description || ''),
          price: item.product.price,
          artworkUrl: item.product.image_url || '',
          giftSize: item.product.weight || `${((item.product as any).display_tier || item.product.tier)} tier`,
          hasDelivery: hasDelivery
        },
        quantity: item.quantity,
        strain: {
          name: item.strain.name,
          type: item.strain.type,
          thcLow: item.strain.thcLow,
          thcHigh: item.strain.thcHigh
        }
      }));
      
      const order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'> = {
        items: orderItems,
        deliveryDetails: {
          ...deliveryDetails,
          ageVerification: data.ageVerified,
          termsAccepted: data.acceptTerms,
          emailUpdates: !!data.emailOptIn,
          phone: deliveryDetails.phone.replace(/\D/g, ''),
        },
        total: finalTotal,
        hasDelivery: hasDelivery,
        status: 'pending',
      };

      const response = await fetch('/api/place-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(order),
      });

      const responseData = await response.json();

      if (response.ok && responseData.success) {
        const { orderId: newOrderId } = responseData;
        setOrderId(newOrderId);
        
        // Wait a moment for order to be fully inserted, then fetch the actual order data
        setTimeout(async () => {
          try {
            console.log('Fetching order data for ID:', newOrderId);
            const orderResponse = await fetch(`/api/orders/${newOrderId}`);
            console.log('Order response status:', orderResponse.status);
            
            if (orderResponse.ok) {
              const orderData = await orderResponse.json();
              console.log('Order data received:', orderData);
              setConfirmedOrder({
                subtotal: orderData.subtotal,
                delivery_fee: orderData.delivery_fee,
                total: orderData.total,
                order_number: orderData.order_number,
                items: orderData.items || []
              });
            } else {
              console.error('Order API response not OK:', await orderResponse.text());
              throw new Error('Failed to fetch order');
            }
          } catch (error) {
            console.error('Failed to fetch order details:', error);
            // Fallback to calculated values if API fails
            setConfirmedOrder({
              subtotal: cartTotal,
              delivery_fee: hasDelivery ? 0 : 10,
              total: finalTotal,
              order_number: newOrderId,
              items: items.map(item => ({
                product_id: item.product.id,
                quantity: item.quantity,
                unit_price: item.product.price,
                strain: item.strain.name,
                thc_low: item.strain.thcLow,
                thc_high: item.strain.thcHigh,
                products: {
                  tier: item.product.tier,
                  weight: item.product.weight,
                  color_theme: item.product.color_theme
                }
              }))
            });
          }
        }, 1000);
        
        setIsOrderComplete(true);
        clearCart();
      } else {
        const errorMessage = responseData.error || 'Failed to submit order';
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error submitting order:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      // Better error handling with specific messages
      if (errorMessage.includes('Price calculation mismatch')) {
        alert(`⚠️ Pricing Error\n\n${errorMessage}\n\nThis usually happens when prices have been updated. Please refresh the page and try again.`);
      } else if (errorMessage.includes('Out-of-zone address')) {
        alert(`📍 Delivery Area Error\n\nWe currently only deliver to Washington DC (ZIP codes 20000-20199). Please check your ZIP code and try again.`);
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        alert(`🌐 Connection Error\n\nPlease check your internet connection and try again. If the problem persists, contact support at support@canne.art`);
      } else {
        alert(`❌ Order Submission Failed\n\n${errorMessage}\n\nPlease try again or contact support at support@canne.art if the issue continues.`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = form.handleSubmit(submitHandler);

  // Order confirmation screen
  if (isOrderComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
        <Header />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Order Confirmed!</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Thank you, {deliveryDetails.name}!
            </p>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700 inline-block">
              <p className="font-semibold text-gray-900 dark:text-white">
                Order #{orderId}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                {new Date().toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>

          {/* Single Order Summary Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Summary</h2>
            
            <div className="space-y-3 mb-4">
              {confirmedOrder?.items.map((item, index) => (
                <div key={`${item.product_id}-${index}`} className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                      {item.products?.tier || 'Classic'} Tier
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      <span className="font-medium">{item.strain}</span> • {item.thc_low}–{item.thc_high}% THC
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {item.products?.weight || '3.5g'} • Qty: {item.quantity}
                    </p>
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white text-sm">
                    ${(item.unit_price * item.quantity).toFixed(2)}
                  </span>
                </div>
              )) || (
                <div className="text-center py-4">
                  <p className="text-gray-500 dark:text-gray-400">Loading order details...</p>
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 dark:border-gray-600 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span className="text-right">
                  {confirmedOrder ? `$${confirmedOrder.subtotal.toFixed(2)}` : 'Loading...'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Delivery</span>
                <span className="text-right">
                  {confirmedOrder ? 
                    (confirmedOrder.delivery_fee === 0 ? 'FREE' : `$${confirmedOrder.delivery_fee.toFixed(2)}`) :
                    'Loading...'
                  }
                </span>
              </div>
              <div className="flex justify-between text-lg font-semibold text-gray-900 dark:text-white border-t border-gray-200 dark:border-gray-600 pt-2">
                <span>Total</span>
                <span className="text-right">
                  {confirmedOrder ? `$${confirmedOrder.total.toFixed(2)}` : 'Loading...'}
                </span>
              </div>
            </div>
          </div>

          {/* Delivery Info */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Delivery Details</h2>
            <div className="space-y-2 text-sm">
              <p className="text-gray-600 dark:text-gray-400">
                {deliveryDetails.address}, {deliveryDetails.city}, DC {deliveryDetails.zipCode}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                Expected: {deliveryDetails.timePreference}
              </p>
            </div>
          </div>

          {/* Simple Next Steps */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">What's Next?</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <span className="text-gray-600 dark:text-gray-400">Order confirmed - we're preparing your items</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <Clock className="h-4 w-4 text-blue-600" />
                </div>
                <span className="text-gray-600 dark:text-gray-400">Expected delivery: {deliveryDetails.timePreference}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center">
                  <span className="text-amber-600 text-xs font-bold">ID</span>
                </div>
                <span className="text-gray-600 dark:text-gray-400">Have your ID ready (21+ required)</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="text-center space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/shop" className="btn-primary">
                Continue Shopping
              </Link>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Questions? Contact us at support@canne.art
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-purple-900/10"
    >
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link 
          href="/cart" 
          className="inline-flex items-center text-gray-600 hover:text-purple-600 mb-8 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] group"
        >
          <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
          Back to Cart
        </Link>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
            <Lock className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white leading-tight">Secure Checkout</h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">Your information is protected with 256-bit SSL encryption</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <form onSubmit={onSubmit} noValidate className="space-y-6">
              {/* Contact Information */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Contact Information</h2>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={deliveryDetails.name}
                      onChange={handleInputChange}
                      onFocus={handleFieldFocus}
                      className="w-full px-4 py-4 border border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-base bg-gray-50 dark:bg-gray-700 dark:text-white hover:bg-white dark:hover:bg-gray-600 focus:bg-white dark:focus:bg-gray-600 shadow-sm focus:shadow-md"
                      placeholder="John Doe"
                      autoComplete="name"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={deliveryDetails.email || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-4 border border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-base bg-gray-50 dark:bg-gray-700 dark:text-white hover:bg-white dark:hover:bg-gray-600 focus:bg-white dark:focus:bg-gray-600 shadow-sm focus:shadow-md"
                        placeholder="john@example.com"
                        autoComplete="email"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={deliveryDetails.phone}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-4 border rounded-2xl focus:ring-2 focus:border-transparent transition-all duration-200 text-base shadow-sm focus:shadow-md ${
                          phoneError 
                            ? 'border-red-300 focus:ring-red-500 bg-red-50 dark:bg-red-900/20 dark:border-red-500' 
                            : 'border-gray-200 dark:border-gray-600 focus:ring-purple-500 bg-gray-50 dark:bg-gray-700 dark:text-white hover:bg-white dark:hover:bg-gray-600 focus:bg-white dark:focus:bg-gray-600'
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
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Delivery Address</h2>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      name="address"
                      required
                      value={deliveryDetails.address}
                      onChange={handleInputChange}
                      onFocus={handleFieldFocus}
                      className="w-full px-4 py-4 border border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-base bg-gray-50 dark:bg-gray-700 dark:text-white hover:bg-white dark:hover:bg-gray-600 focus:bg-white dark:focus:bg-gray-600 shadow-sm focus:shadow-md"
                      placeholder="123 Main Street"
                      autoComplete="street-address"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Apartment, Suite, etc. (Optional)
                    </label>
                    <input
                      type="text"
                      name="apartment"
                      value={deliveryDetails.apartment || ''}
                      onChange={handleInputChange}
                      onFocus={handleFieldFocus}
                      className="w-full px-4 py-4 border border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-base bg-gray-50 dark:bg-gray-700 dark:text-white hover:bg-white dark:hover:bg-gray-600 focus:bg-white dark:focus:bg-gray-600 shadow-sm focus:shadow-md"
                      placeholder="Apt 4B, Suite 200, etc."
                      autoComplete="address-line2"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        required
                        value={deliveryDetails.city}
                        onChange={handleInputChange}
                        onFocus={handleFieldFocus}
                        className="w-full px-4 py-4 border border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-base bg-gray-50 dark:bg-gray-700 dark:text-white hover:bg-white dark:hover:bg-gray-600 focus:bg-white dark:focus:bg-gray-600 shadow-sm focus:shadow-md"
                        placeholder="Washington"
                        autoComplete="address-level2"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        ZIP Code *
                      </label>
                      <input
                        type="text"
                        name="zipCode"
                        required
                        value={deliveryDetails.zipCode}
                        onChange={handleInputChange}
                        onFocus={handleFieldFocus}
                        className="w-full px-4 py-4 border border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-base bg-gray-50 dark:bg-gray-700 dark:text-white hover:bg-white dark:hover:bg-gray-600 focus:bg-white dark:focus:bg-gray-600 shadow-sm focus:shadow-md"
                        placeholder="20001"
                        autoComplete="postal-code"
                        maxLength={5}
                        pattern="[0-9]{5}"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Delivery Time Preference
                    </label>
                    <select
                      name="timePreference"
                      value={deliveryDetails.timePreference}
                      onChange={handleInputChange}
                      className="w-full px-4 py-4 border border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-base bg-gray-50 dark:bg-gray-700 dark:text-white hover:bg-white dark:hover:bg-gray-600 focus:bg-white dark:focus:bg-gray-600 shadow-sm focus:shadow-md"
                    >
                      <option value="ASAP (60–90 min)">ASAP (60–90 min)</option>
                      <option value="Morning (9 AM - 12 PM)">Morning (9 AM - 12 PM)</option>
                      <option value="Afternoon (12 PM - 5 PM)">Afternoon (12 PM - 5 PM)</option>
                      <option value="Evening (5 PM - 8 PM)">Evening (5 PM - 8 PM)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Special Instructions (Optional)
                    </label>
                    <textarea
                      name="specialInstructions"
                      value={deliveryDetails.specialInstructions}
                      onChange={handleInputChange}
                      onFocus={handleFieldFocus}
                      rows={3}
                      className="w-full px-4 py-4 border border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-base bg-gray-50 dark:bg-gray-700 dark:text-white hover:bg-white dark:hover:bg-gray-600 focus:bg-white dark:focus:bg-gray-600 shadow-sm focus:shadow-md resize-none"
                      placeholder="Buzzer code, gate instructions, etc."
                    />
                  </div>
                </div>
              </div>

              {/* Age Verification */}
              <div className="space-y-3">
                <label htmlFor="ageVerified" className="block cursor-pointer">
                  <div className={`flex items-start gap-4 p-6 rounded-2xl border-2 transition-all duration-200 shadow-sm hover:shadow-md ${
                    form.formState.errors.ageVerified
                      ? 'border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-500'
                      : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-purple-300 dark:hover:border-purple-500'
                  }`}>
                    <Controller
                      control={form.control}
                      name="ageVerified"
                      render={({ field }) => (
                        <Checkbox
                          id="ageVerified"
                          name={field.name}
                          checked={!!field.value}
                          onCheckedChange={(v) => {
                            field.onChange(v);
                            setDeliveryDetails((prev) => ({ ...prev, ageVerification: !!v }));
                          }}
                          onBlur={field.onBlur}
                          ref={field.ref}
                        />
                      )}
                    />
                    <div className="text-sm text-gray-800 dark:text-gray-100">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">🔞</span>
                        <span className="font-semibold text-base">21+ Age Verification *</span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        I certify that I am 21+ years old and located in Washington, DC to place this order.
                      </p>
                    </div>
                  </div>
                </label>
                <AnimatePresence>
                  {form.formState.errors.ageVerified && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-4 py-3 rounded-xl border border-red-200 dark:border-red-800"
                    >
                      <span className="text-red-500">⚠️</span>
                      {form.formState.errors.ageVerified.message as string}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Terms and Privacy */}
              <div className="space-y-3">
                <label htmlFor="acceptTerms" className="block cursor-pointer">
                  <div className={`flex items-start gap-4 p-6 rounded-2xl border-2 transition-all duration-200 shadow-sm hover:shadow-md ${
                    form.formState.errors.acceptTerms
                      ? 'border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-500'
                      : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-purple-300 dark:hover:border-purple-500'
                  }`}>
                    <Controller
                      control={form.control}
                      name="acceptTerms"
                      render={({ field }) => (
                        <Checkbox
                          id="acceptTerms"
                          name={field.name}
                          checked={!!field.value}
                          onCheckedChange={(v) => {
                            field.onChange(v);
                            setDeliveryDetails((prev) => ({ ...prev, termsAccepted: !!v }));
                          }}
                          onBlur={field.onBlur}
                          ref={field.ref}
                        />
                      )}
                    />
                    <div className="text-sm text-gray-800 dark:text-gray-100">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">📋</span>
                        <span className="font-semibold text-base">Terms & Privacy Agreement *</span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        I agree to the{' '}
                        <a href="/terms" className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 underline font-medium transition-colors" target="_blank" rel="noreferrer">
                          Terms of Service
                        </a>{' '}
                        and{' '}
                        <a href="/privacy" className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 underline font-medium transition-colors" target="_blank" rel="noreferrer">
                          Privacy Policy
                        </a>
                      </p>
                    </div>
                  </div>
                </label>
                <AnimatePresence>
                  {form.formState.errors.acceptTerms && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-4 py-3 rounded-xl border border-red-200 dark:border-red-800"
                    >
                      <span className="text-red-500">⚠️</span>
                      {form.formState.errors.acceptTerms.message as string}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

            </form>
          </div>

          {/* Order Summary and Actions */}
          <aside className="w-full lg:w-96 lg:pl-8 lg:sticky lg:top-8 h-fit space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Order Summary</h2>
              
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={`${item.product.id}-${item.strain.name}`} className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">{item.product.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {item.strain.name} • {item.strain.type} • {item.strain.thcLow}–{item.strain.thcHigh}% THC
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-500">Qty: {item.quantity}</p>
                      {/* What's included (collapsible) */}
                      {(() => {
                        const tierLabel = (((item.product as any).display_tier) || item.product.description || '').toString();
                        const info = getTierInfo(tierLabel);
                        if (!info) return null;
                        return (
                          <details className="mt-1 group">
                            <summary className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer list-none select-none flex items-center">
                              <span className="underline decoration-dotted underline-offset-2">What's included</span>
                              <span className="ml-1 text-gray-400 group-open:rotate-180 transition-transform">▾</span>
                            </summary>
                            <div className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                              <div className="mb-1">{info.oneLiner}</div>
                              <ul className="list-disc pl-5 space-y-0.5">
                                {info.items.map((x) => (
                                  <li key={x}>{x}</li>
                                ))}
                              </ul>
                            </div>
                          </details>
                        );
                      })()}
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 dark:border-gray-600 mt-6 pt-6 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span className="text-right">${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Delivery</span>
                  <span className="text-right">{hasDelivery ? 'FREE' : '$10.00'}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold text-gray-900 dark:text-white border-t border-gray-200 dark:border-gray-600 pt-2">
                  <span>Total</span>
                  <span className="text-right">${finalTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <CheckoutFAQ className="lg:sticky top-24" />

            {/* Payment Method Selection */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Payment Method</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-700" 
                       style={{ borderColor: paymentMethod === 'regular' ? '#8B5CF6' : '#E5E7EB' }}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="regular"
                    checked={paymentMethod === 'regular'}
                    onChange={(e) => setPaymentMethod(e.target.value as 'regular' | 'cashapp')}
                    className="w-4 h-4 text-purple-600"
                  />
                  <Lock className="h-5 w-5 text-gray-600" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Standard Checkout</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Complete order with delivery</div>
                  </div>
                </label>
                
                <label className="flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-700"
                       style={{ borderColor: paymentMethod === 'cashapp' ? '#8B5CF6' : '#E5E7EB' }}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cashapp"
                    checked={paymentMethod === 'cashapp'}
                    onChange={(e) => setPaymentMethod(e.target.value as 'regular' | 'cashapp')}
                    className="w-4 h-4 text-purple-600"
                  />
                  <Smartphone className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Cash App Payment</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Pay instantly with Cash App</div>
                  </div>
                </label>
              </div>
            </div>

            <motion.button
              onClick={() => onSubmit()}
              aria-disabled={!form.formState.isValid || isSubmitting}
              disabled={!form.formState.isValid || isSubmitting}
              whileHover={{ scale: form.formState.isValid && !isSubmitting ? 1.02 : 1 }}
              whileTap={{ scale: form.formState.isValid && !isSubmitting ? 0.98 : 1 }}
              className={`w-full font-semibold py-5 px-8 rounded-2xl shadow-lg hover:shadow-xl disabled:shadow-none transition-all duration-300 disabled:cursor-not-allowed text-lg flex items-center justify-center gap-3 ${
                paymentMethod === 'cashapp' 
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                  <span>Processing...</span>
                </>
              ) : paymentMethod === 'cashapp' ? (
                <>
                  <Smartphone className="h-5 w-5" />
                  <span>Pay with Cash App - ${finalTotal.toFixed(2)}</span>
                </>
              ) : (
                <>
                  <Lock className="h-5 w-5" />
                  <span>Complete Secure Order - ${finalTotal.toFixed(2)}</span>
                </>
              )}
            </motion.button>
          </aside>
        </div>
      </div>
    </motion.div>
  );
}
