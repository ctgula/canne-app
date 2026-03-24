'use client';

import React, { useState, useEffect } from 'react';
import { getTierInfo } from '@/lib/gifting';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Checkbox } from '@/components/ui/checkbox';
import Header from '@/components/Header';
import { useCartStore } from '@/services/CartService';
import { toast } from 'react-hot-toast';
import { MapPin, Clock, CreditCard, ArrowLeft, CheckCircle, Lock, Smartphone } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useCashAppPayment } from '@/lib/cashapp-payment';
import ApplePayButton from '@/components/ApplePayButton';

import CheckoutFAQ from './components/CheckoutFAQ';
import Footer from '@/components/Footer';

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
  const [mounted, setMounted] = useState(false);
  const [isOrderComplete, setIsOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'regular' | 'cashapp' | 'applepay'>('cashapp');
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

  useEffect(() => {
    setMounted(true);
  }, []);

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

  // Show loading skeleton until hydrated to prevent false 'empty cart' flash
  if (!mounted && !isOrderComplete) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="pt-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
            <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  // Redirect if cart is empty
  if (items.length === 0 && !isOrderComplete) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="pt-20 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">No items to checkout</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
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
        <div className="pt-20 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Cart is empty</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
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

  // Shared validation for all payment methods
  const validateFormFields = (): string[] => {
    const errors: string[] = [];
    if (!deliveryDetails.name.trim()) errors.push('Full name is required');
    if (!deliveryDetails.email?.trim()) {
      errors.push('Email address is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(deliveryDetails.email)) {
      errors.push('Please enter a valid email address');
    }
    const phoneErr = validatePhoneNumber(deliveryDetails.phone);
    if (phoneErr) { errors.push(phoneErr); setPhoneError(phoneErr); }
    if (!deliveryDetails.address.trim()) errors.push('Street address is required');
    if (!deliveryDetails.city.trim()) errors.push('City is required');
    const LAUNCH_ZIPS = ['20001', '20004', '20005'];
    if (!deliveryDetails.zipCode.trim()) {
      errors.push('ZIP code is required');
    } else if (!LAUNCH_ZIPS.includes(deliveryDetails.zipCode.trim())) {
      errors.push('We\u2019re not in your area yet \u2014 currently delivering in Downtown DC (20001, 20004, 20005).');
    }
    if (items.length === 0) errors.push('Your cart is empty. Please add items before checking out.');
    return errors;
  };

  // Shared order object builder
  const buildOrder = (data: CheckboxForm): Omit<Order, 'id' | 'createdAt' | 'updatedAt'> => {
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
    return {
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
  };

  const handleCashAppPayment = async (data: CheckboxForm) => {
    const validationErrors = validateFormFields();
    if (validationErrors.length > 0) { toast.error(validationErrors[0]); return; }

    setIsSubmitting(true);

    try {
      const order = buildOrder(data);

      const response = await fetch('/api/place-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      });

      const responseData = await response.json();

      if (!response.ok || !responseData.success) {
        throw new Error(responseData.error || 'Failed to create order');
      }

      // Clear cart before redirect so user can't accidentally re-order
      clearCart();

      // Initiate Cash App payment redirect — pass orderId to link the systems
      const success = await initiatePayment(finalTotal, deliveryDetails.phone.replace(/\D/g, ''), responseData.orderId);
      if (!success) {
        toast.error('Order saved but Cash App redirect failed. Please contact support.');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(errorMessage || 'Order failed. Please try again or contact support@canne.art');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApplePaySuccess = async (paymentData: any) => {
    setIsOrderComplete(true);
    setOrderId(paymentData.orderNumber);
    clearCart();
    
    // Set confirmed order data
    setConfirmedOrder({
      subtotal: finalTotal - (hasDelivery ? 0 : 10),
      delivery_fee: hasDelivery ? 0 : 10,
      total: finalTotal,
      order_number: paymentData.orderNumber,
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
  };

  const handleApplePayError = (error: string) => {
    toast.error(`Apple Pay failed: ${error}`);
  };

  const submitHandler = async (data: CheckboxForm) => {
    if (isSubmitting) return;
    
    // Handle Cash App payment separately
    if (paymentMethod === 'cashapp') {
      await handleCashAppPayment(data);
      return;
    }
    
    const validationErrors = validateFormFields();
    if (validationErrors.length > 0) { toast.error(validationErrors[0]); return; }
    
    setIsSubmitting(true);

    try {
      const order = buildOrder(data);

      const response = await fetch('/api/place-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      });

      const responseData = await response.json();

      if (response.ok && responseData.success) {
        const { orderId: newOrderId } = responseData;
        setOrderId(newOrderId);
        
        // Wait a moment for order to be fully inserted, then fetch the actual order data
        setTimeout(async () => {
          try {
            const orderResponse = await fetch(`/api/orders/${newOrderId}`);
            
            if (orderResponse.ok) {
              const orderData = await orderResponse.json();
              setConfirmedOrder({
                subtotal: orderData.subtotal,
                delivery_fee: orderData.delivery_fee,
                total: orderData.total,
                order_number: orderData.order_number,
                items: orderData.items || []
              });
            } else {
              throw new Error('Failed to fetch order');
            }
          } catch (error) {
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
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      // Better error handling with specific messages
      if (errorMessage.includes('Price calculation mismatch')) {
        toast.error('Pricing error — please refresh the page and try again.');
      } else if (errorMessage.includes('Out-of-zone address')) {
        toast.error('We\u2019re not in your area yet \u2014 currently delivering in Downtown DC (20001, 20004, 20005).');
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        toast.error('Connection error — please check your internet and try again.');
      } else {
        toast.error(errorMessage || 'Order failed. Please try again or contact support@canne.art');
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
        <div className="pt-20 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
        <Footer />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-purple-900/10"
    >
      <Header />
      
      <div className="pt-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link 
          href="/cart" 
          className="inline-flex items-center text-gray-600 hover:text-purple-600 mb-8 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] group"
        >
          <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
          Back to Cart
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <Lock className="h-5 w-5 text-purple-500" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Checkout</h1>
          <span className="ml-auto text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
            <Lock className="w-3 h-3" /> SSL Secured
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <form onSubmit={onSubmit} noValidate className="space-y-6">
              {/* Contact Information */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-purple-500" /> Contact
                </h2>
                
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
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-base bg-gray-50 dark:bg-gray-700 dark:text-white hover:bg-white dark:hover:bg-gray-600 focus:bg-white dark:focus:bg-gray-600"
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
                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-base bg-gray-50 dark:bg-gray-700 dark:text-white hover:bg-white dark:hover:bg-gray-600 focus:bg-white dark:focus:bg-gray-600"
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
                <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-purple-500" /> Delivery
                </h2>

                <div className="flex items-start gap-2.5 bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800/50 rounded-xl px-4 py-3 mb-5">
                  <MapPin className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-purple-700 dark:text-purple-300 leading-snug">
                    <span className="font-semibold">Now delivering in Downtown DC</span> — beginning with Mount Vernon Square, Gallery Place, and nearby areas.
                  </p>
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
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-base bg-gray-50 dark:bg-gray-700 dark:text-white hover:bg-white dark:hover:bg-gray-600 focus:bg-white dark:focus:bg-gray-600"
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
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-base bg-gray-50 dark:bg-gray-700 dark:text-white hover:bg-white dark:hover:bg-gray-600 focus:bg-white dark:focus:bg-gray-600"
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
                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-base bg-gray-50 dark:bg-gray-700 dark:text-white hover:bg-white dark:hover:bg-gray-600 focus:bg-white dark:focus:bg-gray-600"
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
                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-base bg-gray-50 dark:bg-gray-700 dark:text-white hover:bg-white dark:hover:bg-gray-600 focus:bg-white dark:focus:bg-gray-600"
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
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-base bg-gray-50 dark:bg-gray-700 dark:text-white hover:bg-white dark:hover:bg-gray-600 focus:bg-white dark:focus:bg-gray-600"
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
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-base bg-gray-50 dark:bg-gray-700 dark:text-white hover:bg-white dark:hover:bg-gray-600 focus:bg-white dark:focus:bg-gray-600 resize-none"
                      placeholder="Buzzer code, gate instructions, etc."
                    />
                  </div>
                </div>
              </div>

              {/* Agreements */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 space-y-4">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">Agreements</h2>

                {/* Age Verification */}
                <label htmlFor="ageVerified" className="flex items-start gap-3 cursor-pointer group">
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
                        className="mt-0.5"
                      />
                    )}
                  />
                  <div className="text-sm leading-snug">
                    <span className="font-medium text-gray-900 dark:text-white">I am 21+ and located in Washington, DC</span>
                    {form.formState.errors.ageVerified && (
                      <p className="text-red-500 text-xs mt-0.5">{form.formState.errors.ageVerified.message as string}</p>
                    )}
                  </div>
                </label>

                {/* Terms */}
                <label htmlFor="acceptTerms" className="flex items-start gap-3 cursor-pointer group">
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
                        className="mt-0.5"
                      />
                    )}
                  />
                  <div className="text-sm leading-snug">
                    <span className="text-gray-700 dark:text-gray-300">I agree to the{' '}
                      <a href="/terms" className="text-purple-600 dark:text-purple-400 underline" target="_blank" rel="noreferrer">Terms</a>
                      {' '}and{' '}
                      <a href="/privacy" className="text-purple-600 dark:text-purple-400 underline" target="_blank" rel="noreferrer">Privacy Policy</a>
                    </span>
                    {form.formState.errors.acceptTerms && (
                      <p className="text-red-500 text-xs mt-0.5">{form.formState.errors.acceptTerms.message as string}</p>
                    )}
                  </div>
                </label>

                {/* Email opt-in */}
                <label htmlFor="emailOptIn" className="flex items-start gap-3 cursor-pointer group">
                  <Controller
                    control={form.control}
                    name="emailOptIn"
                    render={({ field }) => (
                      <Checkbox
                        id="emailOptIn"
                        name={field.name}
                        checked={!!field.value}
                        onCheckedChange={(v) => {
                          field.onChange(v);
                          setDeliveryDetails((prev) => ({ ...prev, emailUpdates: !!v }));
                        }}
                        onBlur={field.onBlur}
                        ref={field.ref}
                        className="mt-0.5"
                      />
                    )}
                  />
                  <span className="text-sm text-gray-500 dark:text-gray-400 leading-snug">Send me order updates &amp; drop alerts</span>
                </label>
              </div>

            </form>
          </div>

          {/* Order Summary and Actions */}
          <aside className="w-full lg:sticky lg:top-24 h-fit space-y-5">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-5">Order Summary</h2>
              
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
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
                    <span className="text-xs">✦</span> Collectible Print
                  </span>
                  <span className="text-right text-purple-600 dark:text-purple-400 font-medium">Included</span>
                </div>
                <div className="flex justify-between text-lg font-semibold text-gray-900 dark:text-white border-t border-gray-200 dark:border-gray-600 pt-2">
                  <span>Total</span>
                  <span className="text-right">${finalTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <CheckoutFAQ className="lg:sticky top-24" />

            {/* Payment Method Selection */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Pay with</h3>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cashapp')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all ${
                    paymentMethod === 'cashapp'
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                      : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  Cash App
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('applepay')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all ${
                    paymentMethod === 'applepay'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                      : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                  }`}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                  Apple Pay
                </button>
              </div>
            </div>

            {/* Payment Buttons */}
            <div className="space-y-4">
              {paymentMethod === 'applepay' && (
                <ApplePayButton
                  total={finalTotal}
                  onPaymentSuccess={handleApplePaySuccess}
                  onPaymentError={handleApplePayError}
                  disabled={!form.formState.isValid || isSubmitting}
                />
              )}
              
              {process.env.NEXT_PUBLIC_PAUSE_ORDERS === 'true' ? (
                <div className="w-full rounded-2xl border border-amber-200 bg-amber-50 dark:bg-amber-950/40 dark:border-amber-800/60 px-6 py-5 text-center">
                  <p className="text-amber-800 dark:text-amber-300 font-semibold text-sm mb-1">New orders are temporarily paused</p>
                  <p className="text-amber-700/70 dark:text-amber-400/70 text-xs">We&apos;re handling some administrative updates and will be back shortly. Thank you for your patience.</p>
                </div>
              ) : paymentMethod === 'cashapp' && (
                <motion.button
                  onClick={() => onSubmit()}
                  aria-disabled={!form.formState.isValid || isSubmitting}
                  disabled={!form.formState.isValid || isSubmitting}
                  whileHover={{ scale: form.formState.isValid && !isSubmitting ? 1.02 : 1 }}
                  whileTap={{ scale: form.formState.isValid && !isSubmitting ? 0.98 : 1 }}
                  className="w-full font-semibold py-4 px-8 rounded-2xl transition-all disabled:cursor-not-allowed text-base flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-300 disabled:to-gray-400 text-white shadow-lg disabled:shadow-none"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Smartphone className="h-5 w-5" />
                      <span>Pay with Cash App - ${finalTotal.toFixed(2)}</span>
                    </>
                  )}
                </motion.button>
              )}
            </div>
          </aside>
        </div>
      </div>
      <Footer />
    </div>
  );
}
