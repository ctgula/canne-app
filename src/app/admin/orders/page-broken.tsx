'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';
import { 
  Phone, 
  User, 
  Clock, 
  Package, 
  ChevronDown,
  DollarSign,
  Eye,
  MoreHorizontal
} from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import OrderDetailsDrawer from '@/components/OrderDetailsDrawer';
import { useToast } from '@/components/Toast';
import toast from 'react-hot-toast';

interface Order {
  id: string;
  order_number: string;
  status: 'awaiting_payment' | 'verifying' | 'paid' | 'assigned' | 'delivered' | 'undelivered' | 'refunded' | 'canceled';
  total: number;
  subtotal: number;
  delivery_fee: number;
  created_at: string;
  updated_at: string;
  driver_id?: string;
  customers: {
    first_name: string;
    last_name: string;
    phone: string;
    email: string;
  };
  order_items?: {
    quantity: number;
    products: {
      name: string;
      price_cents: number;
    };
  }[];
}

interface Driver {
  id: string;
  name: string;
  phone: string;
  is_available: boolean;
}

// Utility functions
const formatCurrency = (cents: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(cents / 100);
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getTimeAgo = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusChangeModal, setStatusChangeModal] = useState<{
    isOpen: boolean;
    orderId: string;
    currentStatus: string;
    newStatus: string;
  }>({ isOpen: false, orderId: '', currentStatus: '', newStatus: '' });
  const [bulkStatusModal, setBulkStatusModal] = useState<{
    isOpen: boolean;
    newStatus: string;
  }>({ isOpen: false, newStatus: '' });
  const [statusModal, setStatusModal] = useState<{
    isOpen: boolean;
    orderId: string;
    currentStatus: string;
    newStatus: string;
  }>({ isOpen: false, orderId: '', currentStatus: '', newStatus: '' });
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });
  const [openDropdowns, setOpenDropdowns] = useState<Set<string>>(new Set());
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { success: showSuccessToast, error: showErrorToast } = useToast();

  // Initialize Supabase client for real-time updates
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const getAllValidStatuses = (): string[] => {
    return ['awaiting_payment', 'verifying', 'paid', 'assigned', 'delivered', 'undelivered', 'refunded', 'canceled'];
  };
  
  const getValidTransitions = (currentStatus: string): string[] => {
    const transitions: Record<string, string[]> = {
      'awaiting_payment': ['verifying', 'paid', 'canceled'],
      'verifying': ['awaiting_payment', 'paid', 'refunded', 'canceled'],
      'paid': ['verifying', 'assigned', 'refunded', 'canceled'],
      'assigned': ['paid', 'delivered', 'undelivered', 'refunded', 'canceled'],
      'delivered': ['assigned', 'refunded'],
      'undelivered': ['assigned', 'delivered', 'refunded', 'canceled'],
      'refunded': ['verifying', 'paid'],
      'canceled': ['awaiting_payment', 'verifying']
    };
    
    return transitions[currentStatus] || [];
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/admin/orders');
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

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
      fetchDrivers();
      
      // Set up real-time subscription for orders
      const ordersSubscription = supabase
        .channel('orders-changes')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'orders' 
          }, 
          (payload) => {
            console.log('Order change received:', payload);
            fetchOrders(); // Refresh orders when changes occur
          }
        )
        .subscribe();

      // Set up real-time subscription for order status events
      const statusEventsSubscription = supabase
        .channel('order-status-events')
        .on('postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'order_status_events'
          },
          (payload) => {
            console.log('Status event received:', payload);
            fetchOrders(); // Refresh orders when status changes
          }
        )
        .subscribe();

      return () => {
        ordersSubscription.unsubscribe();
        statusEventsSubscription.unsubscribe();
      };
    }
  }, [isAuthenticated]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdowns(new Set());
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogin = () => {
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123';
    if (password === adminPassword) {
      setIsAuthenticated(true);
      localStorage.setItem('admin_authenticated', 'true');
      fetchOrders();
      fetchDrivers();
    } else {
      toast.error('Invalid password');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };


  const handleStatusChange = async (orderId: string, newStatus: string, reason?: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, reason, admin_user: 'admin' })
      });

      const data = await response.json();

      if (response.ok) {
        showSuccessToast('Status Updated', data.message || 'Order status updated successfully');
        fetchOrders();
      } else {
        showErrorToast('Update Failed', data.error || 'Failed to update order status');
      }
    } catch (error) {
      showErrorToast('Error', 'Error updating order status');
    }
  };

  const handleAssignDriver = async (orderId: string, driverId: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/assign-driver`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driver_id: driverId, admin_user: 'admin' })
      });

      const data = await response.json();

      if (response.ok) {
        showSuccessToast('Driver Assigned', data.message || 'Driver assigned successfully');
        fetchOrders();
      } else {
        showErrorToast('Assignment Failed', data.error || 'Failed to assign driver');
      }
    } catch (error) {
      showErrorToast('Error', 'Error assigning driver');
    }
  };

  const openOrderDetails = (orderId: string) => {
    setSelectedOrderId(orderId);
    setIsDrawerOpen(true);
  };

  const getRelativeTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Admin Access
          </h1>
          <div className="space-y-4">
            <input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
            <button
              onClick={handleLogin}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-[1.02]"
            >
              Access Admin Panel
            </button>
          </div>
        </div>
      </div>
    );
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = !searchTerm || 
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customers.phone.includes(searchTerm) ||
      `${order.customers.first_name} ${order.customers.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customers.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const statusCounts = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusOptions = [
    { value: 'all', label: 'All Orders', count: orders.length },
    { value: 'awaiting_payment', label: 'Awaiting Payment', count: statusCounts.awaiting_payment || 0 },
    { value: 'verifying', label: 'Verifying', count: statusCounts.verifying || 0 },
    { value: 'paid', label: 'Paid', count: statusCounts.paid || 0 },
    { value: 'assigned', label: 'Assigned', count: statusCounts.assigned || 0 },
    { value: 'delivered', label: 'Delivered', count: statusCounts.delivered || 0 },
    { value: 'undelivered', label: 'Undelivered', count: statusCounts.undelivered || 0 },
    { value: 'refunded', label: 'Refunded', count: statusCounts.refunded || 0 },
    { value: 'canceled', label: 'Canceled', count: statusCounts.canceled || 0 }
  ];

  return (
    <AdminLayout
      searchValue={searchTerm}
      onSearchChange={setSearchTerm}
      statusFilter={statusFilter}
      onStatusFilterChange={setStatusFilter}
      statusOptions={statusOptions}
    >
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Order Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage and track all customer orders
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'All Orders', count: orders.length },
              { key: 'awaiting_payment', label: 'Awaiting Payment', count: statusCounts.awaiting_payment || 0 },
              { key: 'verifying', label: 'Verifying', count: statusCounts.verifying || 0 },
              { key: 'paid', label: 'Paid', count: statusCounts.paid || 0 },
              { key: 'assigned', label: 'Assigned', count: statusCounts.assigned || 0 },
              { key: 'delivered', label: 'Delivered', count: statusCounts.delivered || 0 }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === tab.key
                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                    : 'bg-white text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search orders by code, phone, or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
            />
          </div>
        </div>

        {/* Orders Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-400 mt-4">Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm || statusFilter !== 'all' ? 'No orders match your filters' : 'No orders found'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrders.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => openOrderDetails(order.id)}
                    className="text-lg font-semibold text-gray-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                  >
                    {order.order_number}
                  </button>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                      order.status === 'paid' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                      order.status === 'assigned' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                      order.status === 'awaiting_payment' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300' :
                      order.status === 'verifying' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                      order.status === 'undelivered' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                      order.status === 'refunded' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
                      order.status === 'canceled' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {order.status.replace('_', ' ').toUpperCase()}
                    </span>
                    <button
                      onClick={() => openOrderDetails(order.id)}
                      className="p-1 text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                      title="View order details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <User size={14} className="mr-2" />
                      {`${order.customers.first_name} ${order.customers.last_name}`}
                    </div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {formatCurrency(order.total)}
                    </div>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Phone size={14} className="mr-2" />
                    {order.customers.phone}
                  </div>
                  
                  {order.order_items && order.order_items.length > 0 && (
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Package size={14} className="mr-2" />
                      {order.order_items[0].products.name}
                      {order.order_items.length > 1 && ` +${order.order_items.length - 1} more`}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center">
                      <Clock size={12} className="mr-1" />
                      {getTimeAgo(order.created_at)}
                    </div>
                    <div>{formatDate(order.created_at)}</div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => openOrderDetails(order.id)}
                    className="flex-1 px-3 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                  >
                    View Details
                  </button>
                  
                  <div className="relative">
                    <button
                      onClick={() => {
                        const newDropdowns = new Set(openDropdowns);
                        if (newDropdowns.has(order.id)) {
                          newDropdowns.delete(order.id);
                        } else {
                          newDropdowns.clear();
                          newDropdowns.add(order.id);
                        }
                        setOpenDropdowns(newDropdowns);
                      }}
                      className="flex items-center justify-center px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                    >
                      <MoreHorizontal size={16} />
                    </button>

                    {openDropdowns.has(order.id) && (
                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 z-50">
                        {getValidTransitions(order.status).map((status) => (
                          <button
                            key={status}
                            onClick={() => {
                              handleStatusChange(order.id, order.status, status);
                              setOpenDropdowns(new Set());
                            }}
                            className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 first:rounded-t-lg last:rounded-b-lg transition-colors"
                          >
                            {status.replace('_', ' ').toUpperCase()}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Order Details Drawer */}
      <OrderDetailsDrawer
        orderId={selectedOrderId}
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedOrderId(null);
        }}
        onStatusChange={handleStatusChange}
        onAssignDriver={handleAssignDriver}
        drivers={drivers}
      />
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Order Details Modal */}
        {showOrderDetails && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Order Details - {selectedOrder.order_number}
                  </h2>
                  <button
                    onClick={() => setShowOrderDetails(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Customer Phone
                      </label>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-900 dark:text-white">{selectedOrder.customers.phone}</span>
                        <button
                          onClick={() => copyToClipboard(selectedOrder.customers.phone)}
                          className="text-purple-600 hover:text-purple-700"
                        >
                          <Copy size={16} />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Amount
                      </label>
                      <span className="text-gray-900 dark:text-white">
                        ${(selectedOrder.total / 100).toFixed(2)}
                      </span>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Status
                      </label>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        selectedOrder.status === 'delivered' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                        selectedOrder.status === 'paid' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                        selectedOrder.status === 'assigned' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {selectedOrder.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Created
                      </label>
                      <span className="text-gray-900 dark:text-white">
                        {new Date(selectedOrder.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Status Change Actions */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Quick Actions
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedOrder.status === 'awaiting_payment' && (
                        <button
                          onClick={() => handleStatusChange(selectedOrder.id, 'paid')}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                        >
                          Mark as Paid
                        </button>
                      )}
                      
                      {selectedOrder.status === 'paid' && drivers.length > 0 && (
                        <select
                          onChange={(e) => e.target.value && handleStatusChange(selectedOrder.id, 'assigned')}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                        >
                          <option value="">Assign Driver</option>
                          {drivers.filter(d => d.is_available).map(driver => (
                            <option key={driver.id} value={driver.id}>
                              {driver.name}
                            </option>
                          ))}
                        </select>
                      )}
                      
                      {selectedOrder.status === 'assigned' && (
                        <button
                          onClick={() => handleStatusChange(selectedOrder.id, 'delivered')}
                          className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
                        >
                          Mark as Delivered
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <button
                    onClick={() => setShowOrderDetails(false)}
                    className="bg-gray-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Order Details Drawer */}
        <OrderDetailsDrawer
          orderId={selectedOrderId}
          isOpen={isDrawerOpen}
          onClose={() => {
            setIsDrawerOpen(false);
            setSelectedOrderId(null);
          }}
          onStatusChange={handleStatusChange}
          onAssignDriver={handleAssignDriver}
          drivers={drivers}
        />
    </AdminLayout>
  );
}
