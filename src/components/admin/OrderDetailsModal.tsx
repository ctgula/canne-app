"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X, Phone, MapPin, User, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface OrderDetailsModalProps {
  isOpen: boolean;
  orderId: string | null;
  onClose: () => void;
}

export default function OrderDetailsModal({ isOpen, orderId, onClose }: OrderDetailsModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<any>(null);
  const [updating, setUpdating] = useState(false);

  const loadOrder = async () => {
    if (!orderId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Order not found");
      }
      const data = await res.json();
      setOrder(data.order);
    } catch (e: any) {
      console.error('Error loading order:', e);
      setError(e?.message || "Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen || !orderId) return;
    loadOrder();
  }, [isOpen, orderId]);

  const handleStatusChange = async (newStatus: string) => {
    if (!orderId) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error('Failed to update status');
      await loadOrder(); // Reload order data
    } catch (e: any) {
      console.error('Error updating status:', e);
      alert('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold">Order Details {order?.order_number ? `#${order.order_number}` : ""}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100"><X className="w-5 h-5"/></button>
        </div>

        <div className="p-4 space-y-4 max-h-[70vh] overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-gray-500"><Loader2 className="w-5 h-5 animate-spin mr-2"/> Loading…</div>
          ) : error ? (
            <div className="text-center text-red-600 py-16">{error}</div>
          ) : !order ? (
            <div className="text-center text-gray-500 py-16">No data</div>
          ) : (
            <>
              {/* Customer & Delivery */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-3">
                  <div className="font-semibold mb-1">Customer</div>
                  <div className="text-sm text-gray-800 flex items-center gap-2"><User className="w-4 h-4"/>{order?.customers?.name || "Guest"}</div>
                  <div className="text-sm text-gray-600 flex items-center gap-2 mt-1"><Phone className="w-4 h-4"/>{order?.customers?.phone || "N/A"}</div>
                </div>
                <div className="border rounded-lg p-3">
                  <div className="font-semibold mb-1">Delivery</div>
                  <div className="text-sm text-gray-800 flex items-center gap-2"><MapPin className="w-4 h-4"/>{[order.delivery_address_line1, order.delivery_city, order.delivery_state, order.delivery_zip].filter(Boolean).join(", ")}</div>
                </div>
              </div>

              {/* Items */}
              <div className="border rounded-lg p-3">
                <div className="font-semibold mb-2">Items</div>
                <ul className="divide-y">
                  {(order.order_items || []).map((it: any) => (
                    <li key={it.id} className="py-2 flex items-center justify-between text-sm">
                      <div className="min-w-0">
                        <div className="font-medium truncate">{it.products?.name || "Item"}</div>
                        <div className="text-gray-500">x{it.quantity}{typeof it.strain === 'string' ? ` • ${it.strain}` : ''}{(it.thc_low && it.thc_high) ? ` • ${it.thc_low}–${it.thc_high}% THC` : ''}</div>
                      </div>
                      <div className="whitespace-nowrap">{formatCurrency((it.unit_price || 0) * (it.quantity || 0))}</div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Totals */}
              <div className="border rounded-lg p-3 grid grid-cols-2 gap-2 text-sm">
                <div className="text-gray-600">Subtotal</div>
                <div className="text-right">{formatCurrency(order.subtotal || 0)}</div>
                <div className="text-gray-600">Delivery Fee</div>
                <div className="text-right">{formatCurrency(order.delivery_fee || 0)}</div>
                <div className="font-semibold">Total</div>
                <div className="text-right font-semibold">{formatCurrency(order.total || 0)}</div>
              </div>

              {/* Events */}
              {Array.isArray(order.order_status_events) && order.order_status_events.length > 0 && (
                <div className="border rounded-lg p-3">
                  <div className="font-semibold mb-2">Status Events</div>
                  <ul className="space-y-1 text-sm">
                    {order.order_status_events.map((ev: any) => (
                      <li key={ev.id} className="flex items-center justify-between">
                        <div className="text-gray-700">{ev.old_status} → {ev.new_status}</div>
                        <div className="text-gray-500">{new Date(ev.created_at).toLocaleString()}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Quick Status Actions */}
              <div className="border rounded-lg p-3 bg-gradient-to-r from-purple-50 to-pink-50">
                <div className="font-semibold mb-3">Quick Actions</div>
                <div className="grid grid-cols-2 gap-2">
                  {order.isCashApp ? (
                    // Cash App order statuses
                    <>
                      {order.status !== 'awaiting_payment' && (
                        <button
                          onClick={() => handleStatusChange('awaiting_payment')}
                          disabled={updating}
                          className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50 text-sm font-medium"
                        >
                          🟡 Awaiting Payment
                        </button>
                      )}
                      {order.status !== 'verifying' && (
                        <button
                          onClick={() => handleStatusChange('verifying')}
                          disabled={updating}
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 text-sm font-medium"
                        >
                          🔵 Verifying
                        </button>
                      )}
                      {order.status !== 'paid' && (
                        <button
                          onClick={() => handleStatusChange('paid')}
                          disabled={updating}
                          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 text-sm font-medium"
                        >
                          💰 Mark Paid
                        </button>
                      )}
                      {order.status !== 'assigned' && (
                        <button
                          onClick={() => handleStatusChange('assigned')}
                          disabled={updating}
                          className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors disabled:opacity-50 text-sm font-medium"
                        >
                          🚚 Assigned
                        </button>
                      )}
                      {order.status !== 'delivered' && (
                        <button
                          onClick={() => handleStatusChange('delivered')}
                          disabled={updating}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 text-sm font-medium"
                        >
                          🟢 Delivered
                        </button>
                      )}
                      {order.status !== 'refunded' && (
                        <button
                          onClick={() => handleStatusChange('refunded')}
                          disabled={updating}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 text-sm font-medium"
                        >
                          🔴 Refund
                        </button>
                      )}
                    </>
                  ) : (
                    // Regular order statuses
                    <>
                      {order.status !== 'pending' && (
                        <button
                          onClick={() => handleStatusChange('pending')}
                          disabled={updating}
                          className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50 text-sm font-medium"
                        >
                          🟡 Mark Pending
                        </button>
                      )}
                      {order.status !== 'confirmed' && (
                        <button
                          onClick={() => handleStatusChange('confirmed')}
                          disabled={updating}
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 text-sm font-medium"
                        >
                          🔵 Mark Confirmed
                        </button>
                      )}
                      {order.status !== 'preparing' && (
                        <button
                          onClick={() => handleStatusChange('preparing')}
                          disabled={updating}
                          className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 text-sm font-medium"
                        >
                          ⚙️ Mark Preparing
                        </button>
                      )}
                      {order.status !== 'out_for_delivery' && (
                        <button
                          onClick={() => handleStatusChange('out_for_delivery')}
                          disabled={updating}
                          className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors disabled:opacity-50 text-sm font-medium"
                        >
                          🚚 Out for Delivery
                        </button>
                      )}
                      {order.status !== 'delivered' && (
                        <button
                          onClick={() => handleStatusChange('delivered')}
                          disabled={updating}
                          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 text-sm font-medium"
                        >
                          🟢 Mark Delivered
                        </button>
                      )}
                      {order.status !== 'cancelled' && (
                        <button
                          onClick={() => handleStatusChange('cancelled')}
                          disabled={updating}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 text-sm font-medium"
                        >
                          🔴 Cancel Order
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="p-4 border-t flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Current Status: <span className="font-semibold">{order?.status || 'unknown'}</span>
          </div>
          <button onClick={onClose} className="px-4 py-2 rounded-lg border hover:bg-gray-50 transition-colors">Close</button>
        </div>
      </motion.div>
    </div>
  );
}
