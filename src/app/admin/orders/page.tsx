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

  const { success: showSuccessToast, error: showErrorToast } = useToast();

  // Initialize Supabase client for real-time updates
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

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
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      showErrorToast('Failed to load orders');
    } finally {
      setLoading(false);
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

  const handleStatusChange = async (orderId: string, currentStatus: string, newStatus: string, reason?: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, reason })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update status');
      }

      showSuccessToast(`Order status updated to ${newStatus.replace('_', ' ')}`);
      fetchOrders(); // Refresh orders
    } catch (error) {
      console.error('Error updating status:', error);
      showErrorToast(error instanceof Error ? error.message : 'Failed to update status');
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
          Manage customer orders, track status, and assign drivers
        </p>
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
                            onClick={async () => {
                              try {
                                await handleStatusChange(order.id, order.status, status);
                                setOpenDropdowns(new Set());
                              } catch (error) {
                                console.error('Status change failed:', error);
                              }
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
            ))}
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
    </AdminLayout>
  );
}
