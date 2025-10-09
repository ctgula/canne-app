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
      {/* Header with Actions */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              Cannè Orders Dashboard
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Manage and track all orders in real-time
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchOrders(true)}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm disabled:opacity-50"
              title="Refresh orders"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
        
        {/* Clean Status Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((option) => {
            const isActive = statusFilter === option.value;
            const emoji = {
              gray: '📦',
              blue: '🔵',
              yellow: '🟡',
              green: '🟢',
              red: '⚠️'
            }[option.color as keyof typeof emoji];
            
            return (
              <button
                key={option.value}
                onClick={() => setStatusFilter(option.value)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg scale-105'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-md'
                }`}
              >
                <span className="text-base">{emoji}</span>
                <span>{option.label}</span>
                {option.count > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    isActive ? 'bg-white/30' : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
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
          <>
            <div className="space-y-3">
              {filteredOrders.map((order) => {
              const statusColor = getStatusColor(order.status);
              const statusEmoji = {
                'bg-blue-500': '🔵',
                'bg-yellow-500': '🟡',
                'bg-green-500': '🟢',
                'bg-red-500': '🔴',
                'bg-gray-500': '⚪'
              }[statusColor] || '⚪';
              
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => openOrderDetails(order.id)}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border-l-4 border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all cursor-pointer group"
                  style={{ borderLeftColor: statusColor.replace('bg-', '#').replace('-500', '') }}
                >
                  <div className="p-4">
                    {/* Compact Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3 flex-1">
                        <span className="text-xl">{statusEmoji}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-lg font-bold text-gray-900 dark:text-white truncate">
                            {`${order.customers.first_name} ${order.customers.last_name}`}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {getTimeAgo(order.created_at)} • #{order.order_number}
                          </div>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                          {formatCurrency(order.total)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {order.status.replace('_', ' ')}
                        </div>
                      </div>
                    </div>

                    {/* Compact Action Row */}
                    <div className="flex items-center gap-2">
                      {/* Driver Assignment Dropdown */}
                      {!order.driver ? (
                        <div className="relative flex-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowDriverDropdown(showDriverDropdown === order.id ? null : order.id);
                            }}
                            className="w-full px-3 py-2 text-sm bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 text-purple-700 dark:text-purple-300 rounded-lg hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-900/30 dark:hover:to-pink-900/30 transition-all font-medium flex items-center justify-between border border-purple-200 dark:border-purple-800"
                          >
                            <span className="flex items-center gap-2">
                              <Truck className="w-4 h-4" />
                              <span className="hidden sm:inline">Assign Driver</span>
                              <span className="sm:hidden">Assign</span>
                            </span>
                            <ChevronDown className={`w-4 h-4 transition-transform ${showDriverDropdown === order.id ? 'rotate-180' : ''}`} />
                          </button>
                          
                          {showDriverDropdown === order.id && drivers.length > 0 && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              onClick={(e) => e.stopPropagation()}
                              className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl overflow-hidden"
                            >
                              {drivers.map((driver) => (
                                <button
                                  key={driver.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAssignDriver(order.id, driver.id);
                                    setShowDriverDropdown(null);
                                  }}
                                  className="w-full px-3 py-2.5 text-left hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0"
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
                                    <span className="text-xs">
                                      {driver.is_available ? '🟢' : '🔴'}
                                    </span>
                                  </div>
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </div>
                      ) : (
                        <div className="flex-1 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                          <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                            🚚 {order.driver.name}
                          </div>
                        </div>
                      )}
                      
                      {/* Icon Actions */}
                      <a
                        href={`sms:${order.customers.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="p-2.5 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-all border border-green-200 dark:border-green-800"
                        title="Text customer"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </a>
                      <a
                        href={`tel:${order.customers.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="p-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all border border-blue-200 dark:border-blue-800"
                        title="Call customer"
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                      {order.delivery_address_line1 && (
                        <a
                          href={`https://maps.google.com/?q=${encodeURIComponent(`${order.delivery_address_line1}, ${order.delivery_city}, ${order.delivery_state}`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-2.5 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all border border-purple-200 dark:border-purple-800"
                          title="Directions"
                        >
                          <MapPin className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
              })}
            </div>

            {/* Live Summary Bar */}
            <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl border border-purple-200 dark:border-purple-800">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {orders.length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Orders</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {categoryCounts.delivered || 0}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Delivered</div>
                </div>
                <div>
                  <div className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                    {formatCurrency(orders.reduce((sum, o) => sum + o.total, 0))}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {categoryCounts.pending || 0}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Pending</div>
                </div>
              </div>
            </div>
          </>
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

      {/* Sticky Quick Actions Panel - Bottom Right (Cannè Gradient) */}
      <div className="fixed bottom-6 right-6 z-30 flex flex-col gap-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => fetchOrders(true)}
          className="p-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all"
          title="Refresh Orders"
        >
          <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
        </motion.button>
        
        <motion.a
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          href="/admin/drivers"
          className="p-4 bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 rounded-full shadow-lg border-2 border-purple-200 dark:border-purple-800 hover:shadow-xl transition-all"
          title="Manage Drivers"
        >
          <Truck className="w-5 h-5" />
        </motion.a>
      </div>
    </AdminLayout>
  );
}
