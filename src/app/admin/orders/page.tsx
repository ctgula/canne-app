'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Package, 
  Phone, 
  MapPin, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Truck, 
  Eye,
  DollarSign,
  Users,
  RefreshCw
} from 'lucide-react';

interface CashAppOrder {
  id: string;
  short_code: string;
  customer_phone: string;
  amount_cents: number;
  status: 'pending' | 'awaiting_payment' | 'verifying' | 'paid' | 'assigned' | 'delivered' | 'refunded';
  cashapp_handle?: string;
  payment_screenshot_url?: string;
  driver_id?: string;
  customer_name?: string;
  customer_email?: string;
  delivery_address?: string;
  created_at: string;
}

interface Driver {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  is_active: boolean;
}

const statusColors = {
  pending: 'bg-gray-100 text-gray-800 border-gray-200',
  awaiting_payment: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  verifying: 'bg-blue-100 text-blue-800 border-blue-200',
  paid: 'bg-green-100 text-green-800 border-green-200',
  assigned: 'bg-purple-100 text-purple-800 border-purple-200',
  delivered: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  refunded: 'bg-red-100 text-red-800 border-red-200',
};

const statusIcons = {
  pending: AlertCircle,
  awaiting_payment: Clock,
  verifying: Eye,
  paid: CheckCircle,
  assigned: Truck,
  delivered: Package,
  refunded: AlertCircle,
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<CashAppOrder[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
      fetchDrivers();
    }
  }, [isAuthenticated]);

  const handleAuth = () => {
    // Simple password protection - in production, use proper auth
    if (password === 'canne2024') {
      setIsAuthenticated(true);
    } else {
      alert('Incorrect password');
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/cashapp-orders');
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDrivers = async () => {
    try {
      const response = await fetch('/api/drivers');
      if (response.ok) {
        const data = await response.json();
        setDrivers(data.drivers || []);
      }
    } catch (error) {
      console.error('Error fetching drivers:', error);
    }
  };

  const markPaid = async (shortCode: string) => {
    setActionLoading(shortCode);
    try {
      const response = await fetch('/api/orders/mark-paid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ short_code: shortCode })
      });

      if (response.ok) {
        fetchOrders(); // Refresh orders
      } else {
        alert('Failed to mark order as paid');
      }
    } catch (error) {
      console.error('Error marking order as paid:', error);
      alert('Error marking order as paid');
    } finally {
      setActionLoading(null);
    }
  };

  const assignDriver = async (shortCode: string, driverId: string) => {
    setActionLoading(shortCode);
    try {
      const response = await fetch('/api/orders/assign-driver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ short_code: shortCode, driver_id: driverId })
      });

      if (response.ok) {
        fetchOrders(); // Refresh orders
      } else {
        alert('Failed to assign driver');
      }
    } catch (error) {
      console.error('Error assigning driver:', error);
      alert('Error assigning driver');
    } finally {
      setActionLoading(null);
    }
  };

  const completeOrder = async (shortCode: string) => {
    setActionLoading(shortCode);
    try {
      const response = await fetch('/api/orders/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ short_code: shortCode })
      });

      if (response.ok) {
        fetchOrders(); // Refresh orders
      } else {
        alert('Failed to complete order');
      }
    } catch (error) {
      console.error('Error completing order:', error);
      alert('Error completing order');
    } finally {
      setActionLoading(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full">
          <h1 className="text-2xl font-bold text-center mb-6">Admin Access</h1>
          <div className="space-y-4">
            <input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAuth()}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <button
              onClick={handleAuth}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all"
            >
              Access Admin Panel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
          <button
            onClick={fetchOrders}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const StatusIcon = statusIcons[order.status];
              const assignedDriver = drivers.find(d => d.id === order.driver_id);
              
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{order.short_code}</h3>
                        <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${statusColors[order.status]}`}>
                          <StatusIcon className="w-4 h-4" />
                          {order.status.replace('_', ' ')}
                        </div>
                      </div>
                      <div className="text-gray-600 space-y-1">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          <span>${(order.amount_cents / 100).toFixed(2)}</span>
                        </div>
                        {order.customer_phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            <span>{order.customer_phone}</span>
                          </div>
                        )}
                        {order.cashapp_handle && (
                          <div className="flex items-center gap-2">
                            <span className="text-green-600 font-medium">@{order.cashapp_handle}</span>
                          </div>
                        )}
                        {assignedDriver && (
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            <span>{assignedDriver.full_name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      {order.status === 'verifying' && (
                        <button
                          onClick={() => markPaid(order.short_code)}
                          disabled={actionLoading === order.short_code}
                          className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 transition-colors"
                        >
                          {actionLoading === order.short_code ? 'Processing...' : 'Mark Paid'}
                        </button>
                      )}
                      
                      {order.status === 'paid' && (
                        <select
                          onChange={(e) => e.target.value && assignDriver(order.short_code, e.target.value)}
                          className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                          disabled={actionLoading === order.short_code}
                        >
                          <option value="">Assign Driver</option>
                          {drivers.filter(d => d.is_active).map(driver => (
                            <option key={driver.id} value={driver.id}>
                              {driver.full_name}
                            </option>
                          ))}
                        </select>
                      )}
                      
                      {order.status === 'assigned' && (
                        <button
                          onClick={() => completeOrder(order.short_code)}
                          disabled={actionLoading === order.short_code}
                          className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-colors"
                        >
                          {actionLoading === order.short_code ? 'Processing...' : 'Complete Order'}
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    Created: {new Date(order.created_at).toLocaleString()}
                  </div>
                </motion.div>
              );
            })}
            
            {orders.length === 0 && (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No orders found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
