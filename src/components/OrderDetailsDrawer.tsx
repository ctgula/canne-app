'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Phone, Mail, MapPin, CreditCard, Package, Truck, DollarSign, Clock, ExternalLink } from 'lucide-react';

interface OrderDetailsDrawerProps {
  orderId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: (orderId: string, newStatus: string, reason?: string) => void;
  onAssignDriver?: (orderId: string, driverId: string) => void;
  drivers?: Array<{ id: string; name: string; phone: string }>;
}

interface OrderDetails {
  id: string;
  short_code: string;
  status: string;
  total: number;
  subtotal: number;
  delivery_fee: number;
  created_at: string;
  updated_at: string;
  delivery_address_line1: string;
  delivery_address_line2?: string;
  delivery_city: string;
  delivery_state: string;
  delivery_zip: string;
  delivery_instructions?: string;
  cashapp_handle?: string;
  payment_screenshot_url?: string;
  driver_id?: string;
  eta?: string;
  internal_notes?: string;
  customers: {
    name: string;
    phone: string;
    email: string;
  };
  order_items: Array<{
    id: string;
    quantity: number;
    price_cents: number;
    strain?: string;
    thc_low?: number;
    thc_high?: number;
    products: {
      id: string;
      name: string;
      description: string;
      tier: string;
    };
  }>;
  payouts?: Array<{
    id: string;
    status: string;
    amount_cents: number;
    created_at: string;
  }>;
  order_status_events?: Array<{
    id: string;
    old_status: string;
    new_status: string;
    reason?: string;
    admin_user: string;
    created_at: string;
  }>;
  driver?: {
    id: string;
    name: string;
    phone: string;
    email: string;
  };
}

const STATUS_OPTIONS = [
  'awaiting_payment', 'verifying', 'paid', 'assigned', 
  'delivered', 'undelivered', 'refunded', 'canceled'
];

const STATUS_COLORS = {
  awaiting_payment: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  verifying: 'bg-blue-100 text-blue-800 border-blue-200',
  paid: 'bg-green-100 text-green-800 border-green-200',
  assigned: 'bg-purple-100 text-purple-800 border-purple-200',
  delivered: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  undelivered: 'bg-orange-100 text-orange-800 border-orange-200',
  refunded: 'bg-gray-100 text-gray-800 border-gray-200',
  canceled: 'bg-red-100 text-red-800 border-red-200'
};

export default function OrderDetailsDrawer({ 
  orderId, 
  isOpen, 
  onClose, 
  onStatusChange,
  onAssignDriver,
  drivers = []
}: OrderDetailsDrawerProps) {
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [statusReason, setStatusReason] = useState('');
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState('');

  useEffect(() => {
    if (orderId && isOpen) {
      fetchOrderDetails();
    }
  }, [orderId, isOpen]);

  const fetchOrderDetails = async () => {
    if (!orderId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch order details');
      }
      
      setOrder(data.order);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch order details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async () => {
    if (!order || !selectedStatus) return;

    const requiresReason = ['undelivered', 'refunded', 'canceled'].includes(selectedStatus);
    if (requiresReason && !statusReason.trim()) {
      alert('Reason is required for this status change');
      return;
    }

    try {
      await onStatusChange?.(order.id, selectedStatus, statusReason || undefined);
      setShowStatusModal(false);
      setSelectedStatus('');
      setStatusReason('');
      fetchOrderDetails(); // Refresh data
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleAssignDriver = async () => {
    if (!order || !selectedDriver) return;

    try {
      await onAssignDriver?.(order.id, selectedDriver);
      setShowDriverModal(false);
      setSelectedDriver('');
      fetchOrderDetails(); // Refresh data
    } catch (err) {
      console.error('Failed to assign driver:', err);
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(cents / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (status: string) => {
    const colorClass = STATUS_COLORS[status as keyof typeof STATUS_COLORS] || 'bg-gray-100 text-gray-800 border-gray-200';
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${colorClass}`}>
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={onClose}
            />
            
            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white dark:bg-gray-900 shadow-xl z-50 overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Order Details
                  </h2>
                  {order && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {order.short_code} • {getStatusBadge(order.status)}
                    </p>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {loading && (
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <p className="text-red-800 dark:text-red-200">{error}</p>
                  </div>
                )}

                {order && (
                  <>
                    {/* Order Info */}
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 dark:text-white mb-3">Order Information</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Order ID:</span>
                          <p className="font-mono">{order.id}</p>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Short Code:</span>
                          <p className="font-mono">{order.short_code}</p>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Total:</span>
                          <p className="font-semibold">{formatCurrency(order.total)}</p>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Created:</span>
                          <p>{formatDate(order.created_at)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Customer Info */}
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Customer
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span>{order.customers.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <a href={`tel:${order.customers.phone}`} className="text-blue-600 hover:underline">
                            {order.customers.phone}
                          </a>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <a href={`mailto:${order.customers.email}`} className="text-blue-600 hover:underline">
                            {order.customers.email}
                          </a>
                        </div>
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                          <div>
                            <p>{order.delivery_address_line1}</p>
                            {order.delivery_address_line2 && <p>{order.delivery_address_line2}</p>}
                            <p>{order.delivery_city}, {order.delivery_state} {order.delivery_zip}</p>
                            {order.delivery_instructions && (
                              <p className="text-gray-500 mt-1">Note: {order.delivery_instructions}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Payment Info */}
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        Payment
                      </h3>
                      <div className="space-y-2 text-sm">
                        {order.cashapp_handle && (
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">CashApp:</span>
                            <p className="font-mono">${order.cashapp_handle}</p>
                          </div>
                        )}
                        {order.payment_screenshot_url && (
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Payment Screenshot:</span>
                            <a 
                              href={order.payment_screenshot_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-blue-600 hover:underline"
                            >
                              View Screenshot <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Note:</span>
                          <p className="font-mono">{order.short_code}</p>
                        </div>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        Items
                      </h3>
                      <div className="space-y-3">
                        {order.order_items.map((item) => (
                          <div key={item.id} className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="font-medium">{item.products.name}</p>
                              <p className="text-sm text-gray-500">{item.products.description}</p>
                              {item.strain && (
                                <p className="text-xs text-gray-400">
                                  {item.strain} • {item.thc_low}-{item.thc_high}% THC
                                </p>
                              )}
                              <p className="text-sm">
                                <span className="text-gray-500">Tier:</span> {item.products.tier}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">×{item.quantity}</p>
                              <p className="text-sm text-gray-500">{formatCurrency(item.price_cents)}</p>
                            </div>
                          </div>
                        ))}
                        <div className="border-t pt-2 mt-2">
                          <div className="flex justify-between text-sm">
                            <span>Subtotal:</span>
                            <span>{formatCurrency(order.subtotal)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Delivery Fee:</span>
                            <span>{formatCurrency(order.delivery_fee)}</span>
                          </div>
                          <div className="flex justify-between font-medium">
                            <span>Total:</span>
                            <span>{formatCurrency(order.total)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Driver & Logistics */}
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <Truck className="w-4 h-4" />
                        Logistics
                      </h3>
                      <div className="space-y-2 text-sm">
                        {order.driver ? (
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Driver:</span>
                            <p>{order.driver.name} ({order.driver.phone})</p>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500">No driver assigned</span>
                            <button
                              onClick={() => setShowDriverModal(true)}
                              className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                            >
                              Assign Driver
                            </button>
                          </div>
                        )}
                        {order.eta && (
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">ETA:</span>
                            <p>{order.eta}</p>
                          </div>
                        )}
                        {order.internal_notes && (
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Internal Notes:</span>
                            <p>{order.internal_notes}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Payouts */}
                    {order.payouts && order.payouts.length > 0 && (
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                        <h3 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          Payouts
                        </h3>
                        {order.payouts.map((payout) => (
                          <div key={payout.id} className="flex justify-between items-center">
                            <div>
                              <p className="text-sm">Status: {payout.status}</p>
                              <p className="text-xs text-gray-500">{formatDate(payout.created_at)}</p>
                            </div>
                            <p className="font-medium">{formatCurrency(payout.amount_cents)}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Status History */}
                    {order.order_status_events && order.order_status_events.length > 0 && (
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                        <h3 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Status History
                        </h3>
                        <div className="space-y-2">
                          {order.order_status_events
                            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                            .map((event) => (
                            <div key={event.id} className="text-sm">
                              <div className="flex items-center justify-between">
                                <span>
                                  {event.old_status ? `${event.old_status} → ` : ''}{event.new_status}
                                </span>
                                <span className="text-xs text-gray-500">{formatDate(event.created_at)}</span>
                              </div>
                              {event.reason && (
                                <p className="text-xs text-gray-500 mt-1">{event.reason}</p>
                              )}
                              <p className="text-xs text-gray-400">by {event.admin_user}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-4 -m-6 mt-6">
                      <button
                        onClick={() => setShowStatusModal(true)}
                        className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        Change Status
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Status Change Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Change Order Status</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">New Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select status...</option>
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status.replace('_', ' ').toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
              
              {['undelivered', 'refunded', 'canceled'].includes(selectedStatus) && (
                <div>
                  <label className="block text-sm font-medium mb-2">Reason (Required)</label>
                  <textarea
                    value={statusReason}
                    onChange={(e) => setStatusReason(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    rows={3}
                    placeholder="Please provide a reason for this status change..."
                  />
                </div>
              )}
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowStatusModal(false);
                  setSelectedStatus('');
                  setStatusReason('');
                }}
                className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusChange}
                disabled={!selectedStatus}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Driver Modal */}
      {showDriverModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Assign Driver</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Select Driver</label>
                <select
                  value={selectedDriver}
                  onChange={(e) => setSelectedDriver(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select driver...</option>
                  {drivers.map((driver) => (
                    <option key={driver.id} value={driver.id}>
                      {driver.name} ({driver.phone})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowDriverModal(false);
                  setSelectedDriver('');
                }}
                className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignDriver}
                disabled={!selectedDriver}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Assign Driver
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
