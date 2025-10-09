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
  MoreHorizontal,
  MapPin,
  MessageSquare,
  RefreshCw,
  Plus,
  Settings as SettingsIcon,
  BarChart3,
  Truck,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Copy
} from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import OrderDetailsDrawer from '@/components/OrderDetailsDrawer';
import { useToast } from '@/components/Toast';
import toast from 'react-hot-toast';

interface Order {
  id: string;
  order_number: string;
  status: 'pending' | 'delivered' | 'cancelled' | 'awaiting_payment' | 'verifying' | 'paid' | 'assigned' | 'en_route';
  payment_status?: 'unpaid' | 'paid';
  total: number;
  subtotal: number;
  delivery_fee: number;
  created_at: string;
  updated_at: string;
  driver_id?: string;
  delivery_address_line1?: string;
  delivery_city?: string;
  delivery_state?: string;
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
  driver?: {
    id: string;
    name: string;
    phone: string;
  };
}

interface Driver {
  id: string;
  name: string;
  phone: string;
  is_available: boolean;
}

// Utility functions
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

const formatDate = (dateString: string): string => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid Date';
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getTimeAgo = (dateString: string): string => {
  if (!dateString) return 'N/A';
  const now = new Date();
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'N/A';
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
  const [openDropdowns, setOpenDropdowns] = useState<Set<string>>(new Set());
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showDriverDropdown, setShowDriverDropdown] = useState<string | null>(null);
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);

  const { success: showSuccessToast, error: showErrorToast } = useToast();

  // Initialize Supabase client for real-time updates
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const getValidTransitions = (currentStatus: string): string[] => {
    const transitions: Record<string, string[]> = {
      'pending': ['delivered', 'cancelled'],
      'delivered': [],
      'cancelled': []
    };
    return transitions[currentStatus] || [];
  };

  const getValidPaymentTransitions = (currentPaymentStatus: string): string[] => {
    const transitions: Record<string, string[]> = {
      'unpaid': ['paid'],
      'paid': ['unpaid'] // Allow reverting if needed
    };
    return transitions[currentPaymentStatus] || [];
  };

  const fetchOrders = async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) setIsRefreshing(true);
      const response = await fetch('/api/admin/orders');
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      setOrders(data.orders || []);
      if (showRefreshIndicator) showSuccessToast('Orders refreshed');
    } catch (error) {
      console.error('Error fetching orders:', error);
      showErrorToast('Failed to load orders');
    } finally {
      setLoading(false);
      if (showRefreshIndicator) setIsRefreshing(false);
    }
  };

  const fetchDrivers = async () => {
    try {
      const response = await fetch('/api/admin/drivers');
      if (response.ok) {
        const data = await response.json();
        setDrivers(data.drivers || []);
      }
    } catch (error) {
      console.error('Error fetching drivers:', error);
    }
  };

  const handleStatusChange = async (orderId: string, currentStatus: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          reason: `Status changed from ${currentStatus} to ${newStatus}`,
          admin_user: 'admin'
        }),
      });

      if (response.ok) {
        showSuccessToast(`Order status updated to ${newStatus}`);
        fetchOrders(); // Refresh the orders list
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      showErrorToast(error instanceof Error ? error.message : 'Failed to update order status');
    }
  };

  const handlePaymentStatusChange = async (orderId: string, currentPaymentStatus: string, newPaymentStatus: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/payment-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payment_status: newPaymentStatus,
          reason: `Payment status changed from ${currentPaymentStatus} to ${newPaymentStatus}`,
          admin_user: 'admin'
        }),
      });

      if (response.ok) {
        showSuccessToast(`Payment status updated to ${newPaymentStatus}`);
        fetchOrders(); // Refresh the orders list
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update payment status');
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
      showErrorToast(error instanceof Error ? error.message : 'Failed to update payment status');
    }
  };

  const handleAssignDriver = async (orderId: string, driverId: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/assign-driver`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driver_id: driverId })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to assign driver');
      }

      showSuccessToast('Driver assigned successfully');
      fetchOrders(); // Refresh orders
    } catch (error) {
      console.error('Error assigning driver:', error);
      showErrorToast(error instanceof Error ? error.message : 'Failed to assign driver');
    }
  };

  const openOrderDetails = (orderId: string) => {
    setSelectedOrderId(orderId);
    setIsDrawerOpen(true);
  };

  const copyToClipboard = async (text: string, orderId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedPhone(orderId);
      showSuccessToast('Phone copied!');
      setTimeout(() => setCopiedPhone(null), 2000);
    } catch (err) {
      showErrorToast('Failed to copy');
    }
  };

  const getStatusCategory = (status: string): string => {
    if (['pending', 'awaiting_payment', 'verifying', 'paid'].includes(status)) return 'pending';
    if (['assigned', 'en_route'].includes(status)) return 'active';
    if (status === 'delivered') return 'delivered';
    if (['cancelled', 'refunded', 'undelivered'].includes(status)) return 'issues';
    return 'pending';
  };

  const getStatusColor = (status: string) => {
    const category = getStatusCategory(status);
    switch (category) {
      case 'active': return 'bg-blue-500';
      case 'pending': return 'bg-yellow-500';
      case 'delivered': return 'bg-green-500';
      case 'issues': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    const category = getStatusCategory(status);
    switch (category) {
      case 'active': return <Truck className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'delivered': return <CheckCircle2 className="w-4 h-4" />;
      case 'issues': return <AlertCircle className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  useEffect(() => {
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123';
    if (password === adminPassword) {
      setIsAuthenticated(true);
      fetchOrders();
      fetchDrivers();
    }
  }, [password]);

  useEffect(() => {
    if (isAuthenticated) {
      // Set up real-time subscription
      const subscription = supabase
        .channel('orders')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'orders' },
          () => fetchOrders()
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg max-w-md w-full">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Admin Access Required
          </h2>
          <input
            type="password"
            placeholder="Enter admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-4"
            onKeyPress={(e) => e.key === 'Enter' && setPassword(password)}
          />
          <button
            onClick={() => setPassword(password)}
            className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            Access Admin Panel
          </button>
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
    
    const orderCategory = getStatusCategory(order.status);
    const matchesStatus = statusFilter === 'all' || 
                          statusFilter === orderCategory || 
                          order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const statusCounts = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryCounts = orders.reduce((acc, order) => {
    const category = getStatusCategory(order.status);
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const paymentCounts = orders.reduce((acc, order) => {
    const paymentStatus = order.payment_status || 'unpaid';
    acc[paymentStatus] = (acc[paymentStatus] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusOptions = [
    { value: 'all', label: 'All Orders', count: orders.length, icon: Package, color: 'gray' },
    { value: 'active', label: 'Active', count: categoryCounts.active || 0, icon: Truck, color: 'blue' },
    { value: 'pending', label: 'Pending', count: categoryCounts.pending || 0, icon: Clock, color: 'yellow' },
    { value: 'delivered', label: 'Delivered', count: categoryCounts.delivered || 0, icon: CheckCircle2, color: 'green' },
    { value: 'issues', label: 'Issues', count: categoryCounts.issues || 0, icon: AlertCircle, color: 'red' }
  ];

  return (
    <AdminLayout
      searchValue={searchTerm}
      onSearchChange={setSearchTerm}
      statusFilter={statusFilter}
      onStatusFilterChange={setStatusFilter}
      statusOptions={statusOptions}
    >
      {/* Enhanced Status Tabs with Badges */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Orders</h2>
          <button
            onClick={() => fetchOrders(true)}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
        
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((option) => {
            const Icon = option.icon;
            const isActive = statusFilter === option.value;
            const colorClasses = {
              gray: 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600',
              blue: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800',
              yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800',
              green: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800',
              red: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800'
            };
            const activeClasses = {
              gray: 'bg-gray-200 border-gray-400 dark:bg-gray-700 dark:border-gray-500',
              blue: 'bg-blue-100 border-blue-300 dark:bg-blue-900/40 dark:border-blue-700',
              yellow: 'bg-yellow-100 border-yellow-300 dark:bg-yellow-900/40 dark:border-yellow-700',
              green: 'bg-green-100 border-green-300 dark:bg-green-900/40 dark:border-green-700',
              red: 'bg-red-100 border-red-300 dark:bg-red-900/40 dark:border-red-700'
            };
            
            return (
              <button
                key={option.value}
                onClick={() => setStatusFilter(option.value)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 font-medium transition-all hover:scale-105 ${
                  isActive 
                    ? activeClasses[option.color as keyof typeof activeClasses]
                    : colorClasses[option.color as keyof typeof colorClasses]
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{option.label}</span>
                <span className="sm:hidden">{option.label.split(' ')[0]}</span>
                {option.count > 0 && (
                  <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                    isActive ? 'bg-white/50 dark:bg-black/20' : 'bg-white/70 dark:bg-black/30'
                  }`}>
                    {option.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders Grid */}
      <div className="grid gap-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No orders found</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm ? 'Try adjusting your search criteria' : 'No orders match the current filters'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrders.map((order) => {
              const statusColor = getStatusColor(order.status);
              const statusIcon = getStatusIcon(order.status);
              
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all group"
                >
                  {/* Colored Status Strip */}
                  <div className={`h-1.5 ${statusColor}`} />
                  
                  <div className="p-5">
                    {/* Header with Status Icon */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-2">
                        <div className={`p-1.5 rounded-lg ${statusColor} bg-opacity-10 text-white mt-0.5`}>
                          {statusIcon}
                        </div>
                        <div>
                          <button
                            onClick={() => openOrderDetails(order.id)}
                            className="text-lg font-bold text-gray-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                          >
                            {`${order.customers.first_name} ${order.customers.last_name}`}
                          </button>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {order.order_number} • {getTimeAgo(order.created_at)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                          {formatCurrency(order.total)}
                        </div>
                        {order.total >= 100 && (
                          <span className="text-xs text-amber-600 font-medium">💰 High</span>
                        )}
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="mb-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                        getStatusCategory(order.status) === 'active' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                        getStatusCategory(order.status) === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                        getStatusCategory(order.status) === 'delivered' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                      }`}>
                        {order.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>

                    {/* Contact & Location Info */}
                    <div className="mb-4 pb-4 border-b border-gray-100 dark:border-gray-700 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Phone className="w-4 h-4" />
                          <span className="font-mono">{order.customers.phone}</span>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => copyToClipboard(order.customers.phone, order.id)}
                            className="p-1.5 text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20"
                            title="Copy phone"
                          >
                            {copiedPhone === order.id ? (
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                          <a
                            href={`tel:${order.customers.phone}`}
                            className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            title="Call"
                          >
                            <Phone className="w-4 h-4" />
                          </a>
                          <a
                            href={`sms:${order.customers.phone}`}
                            className="p-1.5 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20"
                            title="Text"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                      {order.delivery_address_line1 && (
                        <div className="flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                          <span className="line-clamp-1">
                            {order.delivery_address_line1}, {order.delivery_city}, {order.delivery_state}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Driver Assignment */}
                    {order.driver ? (
                      <div className="mb-3 p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Truck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <div>
                              <div className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                {order.driver.name}
                              </div>
                              <div className="text-xs text-blue-600 dark:text-blue-400">
                                {order.driver.phone}
                              </div>
                            </div>
                          </div>
                          <span className="text-xs font-medium text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/40 px-2 py-1 rounded-full">
                            Assigned
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="mb-3 relative">
                        <button
                          onClick={() => setShowDriverDropdown(showDriverDropdown === order.id ? null : order.id)}
                          className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors font-medium flex items-center justify-between border border-gray-200 dark:border-gray-600"
                        >
                          <span className="flex items-center gap-2">
                            <Truck className="w-4 h-4" />
                            Assign Driver
                          </span>
                          <ChevronDown className={`w-4 h-4 transition-transform ${showDriverDropdown === order.id ? 'rotate-180' : ''}`} />
                        </button>
                        
                        {showDriverDropdown === order.id && drivers.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden"
                          >
                            {drivers.map((driver) => (
                              <button
                                key={driver.id}
                                onClick={() => {
                                  handleAssignDriver(order.id, driver.id);
                                  setShowDriverDropdown(null);
                                }}
                                className="w-full px-3 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                      {driver.name}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                      {driver.phone}
                                    </div>
                                  </div>
                                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                    driver.is_available 
                                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                                  }`}>
                                    {driver.is_available ? '✅ Online' : '🕓 Busy'}
                                  </span>
                                </div>
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </div>
                    )}

                    {/* Quick Actions */}
                    <div className="space-y-2">
                      {/* Mobile: Icon-only buttons, Desktop: Full buttons */}
                      <div className="grid grid-cols-2 gap-2">
                        {/* Payment Toggle */}
                        {(order.payment_status || 'unpaid') === 'unpaid' ? (
                          <button
                            onClick={() => handlePaymentStatusChange(order.id, order.payment_status || 'unpaid', 'paid')}
                            className="px-3 py-2.5 text-sm bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-lg hover:from-emerald-600 hover:to-green-600 transition-all font-bold shadow-sm flex items-center justify-center gap-1.5"
                          >
                            <DollarSign className="w-4 h-4" />
                            <span className="hidden sm:inline">Mark Paid</span>
                            <span className="sm:hidden">Paid</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handlePaymentStatusChange(order.id, order.payment_status || 'paid', 'unpaid')}
                            className="px-3 py-2.5 text-sm bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 rounded-lg hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors font-bold flex items-center justify-center gap-1.5"
                          >
                            <XCircle className="w-4 h-4" />
                            <span className="hidden sm:inline">Unpaid</span>
                          </button>
                        )}
                        
                        {/* Status Actions */}
                        {['pending', 'awaiting_payment', 'verifying', 'paid', 'assigned', 'en_route'].includes(order.status) ? (
                          <button
                            onClick={() => handleStatusChange(order.id, order.status, 'delivered')}
                            className="px-3 py-2.5 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-bold shadow-sm flex items-center justify-center gap-1.5"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span className="hidden sm:inline">Delivered</span>
                            <span className="sm:hidden">Done</span>
                          </button>
                        ) : order.status === 'delivered' ? (
                          <button
                            onClick={() => handleStatusChange(order.id, order.status, 'pending')}
                            className="px-3 py-2.5 text-sm bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors font-bold flex items-center justify-center gap-1.5"
                          >
                            <RefreshCw className="w-4 h-4" />
                            <span className="hidden sm:inline">Reopen</span>
                          </button>
                        ) : null}
                      </div>
                      
                      {/* View Details - Primary Action */}
                      <button
                        onClick={() => openOrderDetails(order.id)}
                        className="w-full px-4 py-2.5 text-sm bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-bold shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        View Full Details
                      </button>
                      
                      {/* Cancel Button */}
                      {!['cancelled', 'delivered'].includes(order.status) && (
                        <button
                          onClick={() => handleStatusChange(order.id, order.status, 'cancelled')}
                          className="w-full px-4 py-2 text-sm bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors font-medium flex items-center justify-center gap-2"
                        >
                          <XCircle className="w-4 h-4" />
                          Cancel Order
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

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

      {/* Sticky Quick Actions Panel - Bottom Right */}
      <div className="fixed bottom-6 right-6 z-30 flex flex-col gap-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => fetchOrders(true)}
          className="p-4 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all"
          title="Refresh Orders"
        >
          <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
        </motion.button>
        
        <motion.a
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          href="/admin/drivers"
          className="p-4 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all"
          title="Manage Drivers"
        >
          <Truck className="w-5 h-5" />
        </motion.a>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all"
          title="Analytics"
        >
          <BarChart3 className="w-5 h-5" />
        </motion.button>
      </div>
    </AdminLayout>
  );
}
