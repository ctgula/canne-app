'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Package, CreditCard, CheckCircle, Truck, ArrowLeft, RefreshCw, MapPin, AlertCircle, User } from 'lucide-react';

interface OrderData {
  id: string;
  order_number: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
  status: string;
  created_at: string;
  updated_at?: string;
  full_name?: string;
  phone?: string;
  payment_method?: string;
  preferred_time?: string;
  delivery_address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
  delivery_instructions?: string;
  items: Array<{
    product_id: string;
    quantity: number;
    unit_price: number;
    strain: string;
    thc_low: number;
    thc_high: number;
    name?: string;
    products?: {
      tier: string;
      weight: string;
      color_theme: string;
    };
  }>;
}

// Customer-facing simplified status steps
const statusSteps = [
  { key: 'received',  label: 'Order Received',     icon: Package,     description: 'We have your order' },
  { key: 'paid',      label: 'Payment Confirmed',  icon: CreditCard,  description: 'Payment verified' },
  { key: 'assigned',  label: 'Driver Assigned',     icon: User,        description: 'A driver is preparing your delivery' },
  { key: 'transit',   label: 'On the Way',          icon: Truck,       description: 'Your order is en route' },
  { key: 'delivered', label: 'Delivered',            icon: MapPin,      description: 'Enjoy your Cannè experience!' },
];

// Map internal DB statuses → customer-facing step index
function getStatusIndex(status: string): number {
  const map: Record<string, number> = {
    // Order created / awaiting payment
    pending: 0,
    awaiting_payment: 0,
    verifying: 0,
    // Payment confirmed
    paid: 1,
    // Driver assigned / preparing
    assigned: 2,
    preparing: 2,
    // Out for delivery
    out_for_delivery: 3,
    in_transit: 3,
    // Completed
    delivered: 4,
    completed: 4,
  };
  return map[status] ?? 0;
}

// Helper: get a customer-friendly description of the current status
function getStatusMessage(status: string): string | null {
  switch (status) {
    case 'awaiting_payment': return 'Waiting for your Cash App payment.';
    case 'verifying': return 'We\'re verifying your payment — usually takes 1-3 minutes.';
    case 'paid': return 'Payment confirmed! A driver will be assigned shortly.';
    case 'assigned': return 'Your driver is getting ready. ETA: 30-45 minutes.';
    case 'out_for_delivery':
    case 'in_transit': return 'Your driver is on the way!';
    case 'delivered': return 'Your order has been delivered. Enjoy!';
    default: return null;
  }
}

export default function OrderTrackingPage() {
  const params = useParams();
  const orderId = params.orderId as string;
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      const data = await res.json();
      if (data.success) {
        setOrder(data);
      } else {
        setError(data.error || 'Order not found');
      }
    } catch {
      setError('Failed to load order. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) fetchOrder();
  }, [orderId]);

  // Auto-refresh every 30s for active orders
  useEffect(() => {
    if (!order) return;
    const terminal = ['delivered', 'completed', 'canceled', 'refunded'];
    if (terminal.includes(order.status)) return;
    const interval = setInterval(fetchOrder, 30000);
    return () => clearInterval(interval);
  }, [order?.status]);

  const activeStep = order ? getStatusIndex(order.status) : 0;
  const statusMsg = order ? getStatusMessage(order.status) : null;
  const isCancelled = order?.status === 'canceled' || order?.status === 'cancelled';
  const isRefunded = order?.status === 'refunded';

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="flex-1 pt-20 sm:pt-24 pb-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <Link
            href="/shop"
            className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 mb-6 transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Continue Shopping
          </Link>

          {loading && !order && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700 animate-pulse">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-8" />
              <div className="space-y-6">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && !order && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700 text-center">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Order Not Found</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
              <button
                onClick={fetchOrder}
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Retry
              </button>
            </div>
          )}

          {order && !error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Order Header */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-1">
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    Order #{order.order_number}
                  </h1>
                  <button
                    onClick={fetchOrder}
                    className="p-2 text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                    title="Refresh status"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Placed {new Date(order.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </p>
                {statusMsg && !isCancelled && !isRefunded && (
                  <p className="mt-2 text-sm font-medium text-purple-600 dark:text-purple-400">
                    {statusMsg}
                  </p>
                )}
              </div>

              {/* Status Tracker */}
              {!isCancelled && !isRefunded && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Delivery Status</h2>
                  <div className="space-y-0">
                    {statusSteps.map((step, index) => {
                      const Icon = step.icon;
                      const isCompleted = index < activeStep;
                      const isActive = index === activeStep;

                      return (
                        <div key={step.key} className="flex items-start gap-4">
                          <div className="flex flex-col items-center">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                                isCompleted
                                  ? 'bg-green-100 dark:bg-green-900/30 border-green-500 text-green-600 dark:text-green-400'
                                  : isActive
                                  ? 'bg-purple-100 dark:bg-purple-900/30 border-purple-500 text-purple-600 dark:text-purple-400 ring-4 ring-purple-100 dark:ring-purple-900/20'
                                  : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500'
                              }`}
                            >
                              {isCompleted ? (
                                <CheckCircle className="w-5 h-5" />
                              ) : (
                                <Icon className="w-5 h-5" />
                              )}
                            </div>
                            {index < statusSteps.length - 1 && (
                              <div
                                className={`w-0.5 h-8 ${
                                  isCompleted ? 'bg-green-400 dark:bg-green-600' : 'bg-gray-200 dark:bg-gray-700'
                                }`}
                              />
                            )}
                          </div>
                          <div className="pt-2 pb-4">
                            <p
                              className={`font-medium text-sm ${
                                isCompleted
                                  ? 'text-green-700 dark:text-green-400'
                                  : isActive
                                  ? 'text-purple-700 dark:text-purple-400 font-semibold'
                                  : 'text-gray-400 dark:text-gray-500'
                              }`}
                            >
                              {step.label}
                              {isActive && (
                                <span className="ml-2 inline-flex items-center gap-1 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full">
                                  Current
                                </span>
                              )}
                            </p>
                            {isActive && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{step.description}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Cancelled / Refunded banner */}
              {isCancelled && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-red-200 dark:border-red-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-red-700 dark:text-red-400">Order Cancelled</h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">This order has been cancelled. Contact support@canne.art for assistance.</p>
                    </div>
                  </div>
                </div>
              )}

              {isRefunded && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-amber-200 dark:border-amber-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-amber-700 dark:text-amber-400">Order Refunded</h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">This order has been refunded. Please allow 1-3 business days for processing.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Delivery Address */}
              {order.delivery_address?.line1 && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Delivery Details</h2>
                  <div className="space-y-2 text-sm">
                    {order.full_name && (
                      <p className="text-gray-900 dark:text-white font-medium">{order.full_name}</p>
                    )}
                    <p className="text-gray-600 dark:text-gray-400">
                      {order.delivery_address.line1}
                      {order.delivery_address.line2 && `, ${order.delivery_address.line2}`}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {order.delivery_address.city}, {order.delivery_address.state} {order.delivery_address.zip}
                    </p>
                    {order.preferred_time && (
                      <p className="text-gray-500 dark:text-gray-500 text-xs">
                        Preferred time: {order.preferred_time}
                      </p>
                    )}
                    {order.delivery_instructions && (
                      <p className="text-gray-500 dark:text-gray-500 text-xs">
                        Note: {order.delivery_instructions}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Items */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Items</h2>
                <div className="space-y-3">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                          {item.name || `${item.products?.tier || 'Art'} Tier`}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {item.strain} &bull; {item.thc_low}–{item.thc_high}% THC &bull; Qty: {item.quantity}
                        </p>
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white text-sm">
                        ${(item.unit_price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 mt-4 pt-4 space-y-1">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>Subtotal</span>
                    <span>${order.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>Delivery</span>
                    <span>{order.delivery_fee === 0 ? 'FREE' : `$${order.delivery_fee.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-gray-900 dark:text-white border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                    <span>Total</span>
                    <span>${order.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Help */}
              <div className="text-center text-sm text-gray-500 dark:text-gray-400 pb-4">
                Questions? Contact <a href="mailto:support@canne.art" className="text-purple-600 dark:text-purple-400 hover:underline">support@canne.art</a>
              </div>
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
