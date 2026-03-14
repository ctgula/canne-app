'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { ArrowLeft, Phone, Package, Search, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface OrderResult {
  id: string;
  order_number: string;
  status: string;
  total: number;
  created_at: string;
  type: 'order' | 'cashapp';
  short_code?: string;
}

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  awaiting_payment: { label: 'Awaiting Payment', color: 'text-yellow-700 bg-yellow-50 border-yellow-200' },
  verifying:        { label: 'Verifying Payment', color: 'text-blue-700 bg-blue-50 border-blue-200' },
  paid:             { label: 'Paid', color: 'text-green-700 bg-green-50 border-green-200' },
  assigned:         { label: 'Driver Assigned', color: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
  en_route:         { label: 'On the Way', color: 'text-teal-700 bg-teal-50 border-teal-200' },
  out_for_delivery:  { label: 'On the Way', color: 'text-teal-700 bg-teal-50 border-teal-200' },
  in_transit:        { label: 'On the Way', color: 'text-teal-700 bg-teal-50 border-teal-200' },
  delivered:        { label: 'Delivered', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  cancelled:        { label: 'Cancelled', color: 'text-red-700 bg-red-50 border-red-200' },
  refunded:         { label: 'Refunded', color: 'text-gray-600 bg-gray-50 border-gray-200' },
};

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export default function OrderLookupPage() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<OrderResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults(null);
    setSearched(false);

    try {
      const res = await fetch('/api/orders/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Something went wrong');
      } else {
        setResults(data.orders || []);
        setSearched(true);
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="flex-1 pt-20 sm:pt-24 pb-12">
        <div className="max-w-lg mx-auto px-4 sm:px-6">
          <Link
            href="/shop"
            className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 mb-6 transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Shop
          </Link>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                <Package className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Track Your Order</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Enter the phone number used at checkout</p>
              </div>
            </div>

            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(formatPhone(e.target.value))}
                    placeholder="(202) 555-0100"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-xl hover:from-pink-600 hover:to-purple-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                {loading ? 'Searching...' : 'Find My Orders'}
              </button>
            </form>
          </div>

          {searched && results !== null && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 space-y-3"
            >
              {results.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 text-center">
                  <p className="text-gray-500 dark:text-gray-400 text-sm">No orders found for that number.</p>
                  <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">Double-check the number used at checkout.</p>
                </div>
              ) : (
                results.map(order => {
                  const statusCfg = STATUS_LABEL[order.status] || { label: order.status, color: 'text-gray-600 bg-gray-50 border-gray-200' };
                  const href = order.type === 'cashapp' && order.short_code
                    ? `/pay/${order.short_code}`
                    : `/orders/${order.id}`;
                  return (
                    <Link key={order.id} href={href}>
                      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 hover:border-purple-200 dark:hover:border-purple-700 hover:shadow-md transition-all flex items-center justify-between group">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white text-sm">
                            Order #{order.order_number}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {new Date(order.created_at).toLocaleDateString('en-US', {
                              month: 'short', day: 'numeric', year: 'numeric',
                              hour: 'numeric', minute: '2-digit'
                            })} · ${order.total.toFixed(2)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-medium px-2 py-1 rounded-full border ${statusCfg.color}`}>
                            {statusCfg.label}
                          </span>
                          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-purple-500 transition-colors" />
                        </div>
                      </div>
                    </Link>
                  );
                })
              )}
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
