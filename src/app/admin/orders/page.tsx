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
  RefreshCw,
  Search,
  Filter,
  Calendar,
  TrendingUp,
  Activity,
  CreditCard,
  User,
  Mail,
  ExternalLink,
  Download
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
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<CashAppOrder | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

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

  // Filter orders based on search and status
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.short_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer_phone?.includes(searchTerm) ||
                         order.cashapp_handle?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate analytics
  const analytics = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'awaiting_payment' || o.status === 'pending').length,
    verifying: orders.filter(o => o.status === 'verifying').length,
    paid: orders.filter(o => o.status === 'paid').length,
    assigned: orders.filter(o => o.status === 'assigned').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    totalRevenue: orders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + o.amount_cents, 0),
    todayOrders: orders.filter(o => {
      const today = new Date().toDateString();
      return new Date(o.created_at).toDateString() === today;
    }).length
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-gray-100">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Cannè Admin</h1>
            <p className="text-gray-600 mt-2">Order Management System</p>
          </div>
          <div className="space-y-4">
            <input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAuth()}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
            <button
              onClick={handleAuth}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-[1.02]"
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
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Cannè Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Order Management & Analytics</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchOrders}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={() => setIsAuthenticated(false)}
              className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.total}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">{analytics.todayOrders} today</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${(analytics.totalRevenue / 100).toFixed(2)}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-xl">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">Delivered orders</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Orders</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.verifying + analytics.paid + analytics.assigned}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-xl">
                <Activity className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">In progress</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.total > 0 ? Math.round((analytics.delivered / analytics.total) * 100) : 0}%
                </p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl">
                <TrendingUp className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">{analytics.delivered} delivered</p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search orders by code, phone, or Cash App handle..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white min-w-[150px]"
              >
                <option value="all">All Status</option>
                <option value="awaiting_payment">Awaiting Payment</option>
                <option value="verifying">Verifying</option>
                <option value="paid">Paid</option>
                <option value="assigned">Assigned</option>
                <option value="delivered">Delivered</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const StatusIcon = statusIcons[order.status];
              const assignedDriver = drivers.find(d => d.id === order.driver_id);
              
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">{order.short_code}</h3>
                        <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${statusColors[order.status]}`}>
                          <StatusIcon className="w-4 h-4" />
                          {order.status.replace('_', ' ')}
                        </div>
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowOrderDetails(true);
                          }}
                          className="text-purple-600 hover:text-purple-700 p-1 rounded-lg hover:bg-purple-50 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          <span className="font-medium">${(order.amount_cents / 100).toFixed(2)}</span>
                        </div>
                        
                        {order.customer_phone && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Phone className="w-4 h-4 text-blue-600" />
                            <span>{order.customer_phone}</span>
                          </div>
                        )}
                        
                        {order.cashapp_handle && (
                          <div className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-green-600" />
                            <span className="text-green-600 font-medium">@{order.cashapp_handle}</span>
                          </div>
                        )}
                        
                        {assignedDriver && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <User className="w-4 h-4 text-purple-600" />
                            <span>{assignedDriver.full_name}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(order.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(order.created_at).toLocaleTimeString()}</span>
                        </div>
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
            
            {filteredOrders.length === 0 && (
              <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm || statusFilter !== 'all' ? 'No matching orders' : 'No orders found'}
                </h3>
                <p className="text-gray-500">
                  {searchTerm || statusFilter !== 'all' ? 'Try adjusting your search or filters' : 'Orders will appear here once customers start placing them'}
                </p>
              </div>
            )}
          </div>
        )}
        
        {/* Order Details Modal */}
        {showOrderDetails && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Order Details</h2>
                  <button
                    onClick={() => setShowOrderDetails(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Order Code</label>
                    <p className="text-lg font-semibold text-gray-900">{selectedOrder.short_code}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Status</label>
                    <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${statusColors[selectedOrder.status]} mt-1`}>
                      {React.createElement(statusIcons[selectedOrder.status], { className: "w-4 h-4" })}
                      {selectedOrder.status.replace('_', ' ')}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Amount</label>
                    <p className="text-lg font-semibold text-green-600">${(selectedOrder.amount_cents / 100).toFixed(2)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Created</label>
                    <p className="text-gray-900">{new Date(selectedOrder.created_at).toLocaleString()}</p>
                  </div>
                </div>
                
                {selectedOrder.customer_phone && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Customer Phone</label>
                    <p className="text-gray-900">{selectedOrder.customer_phone}</p>
                  </div>
                )}
                
                {selectedOrder.cashapp_handle && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Cash App Handle</label>
                    <p className="text-green-600 font-medium">@{selectedOrder.cashapp_handle}</p>
                  </div>
                )}
                
                {selectedOrder.payment_screenshot_url && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Payment Screenshot</label>
                    <a
                      href={selectedOrder.payment_screenshot_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-purple-600 hover:text-purple-700 mt-1"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View Screenshot
                    </a>
                  </div>
                )}
                
                {selectedOrder.driver_id && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Assigned Driver</label>
                    <p className="text-gray-900">
                      {drivers.find(d => d.id === selectedOrder.driver_id)?.full_name || 'Unknown Driver'}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
