'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Phone, 
  CreditCard, 
  User, 
  Calendar, 
  Clock, 
  Package, 
  Search, 
  Filter,
  ChevronDown,
  X,
  CheckCircle,
  AlertCircle,
  Truck,
  DollarSign,
  Copy,
  Eye,
  MoreHorizontal,
  RefreshCw,
  ExternalLink,
  ShoppingBag,
  Users
} from 'lucide-react';
import ConfirmDialog from '@/components/ConfirmDialog';
import StatusChangeModal from '@/components/StatusChangeModal';
import { useToast } from '@/components/Toast';
import toast from 'react-hot-toast';

interface CashAppOrder {
  id: string;
  short_code: string;
  customer_phone: string;
  amount_cents: number;
  status: 'awaiting_payment' | 'verifying' | 'paid' | 'assigned' | 'delivered' | 'undelivered' | 'refunded' | 'canceled';
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
  name: string;
  phone: string;
  is_available: boolean;
}

// Admin Navigation Component
const AdminNav = () => {
  const pathname = usePathname();
  
  const navItems = [
    { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
    { href: '/admin/products', label: 'Products', icon: Package },
    { href: '/admin/drivers', label: 'Drivers', icon: Users }
  ];

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 mb-6">
      <div className="flex space-x-8">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                isActive
                  ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <Icon size={16} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<CashAppOrder[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<CashAppOrder | null>(null);
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
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });
  const [openDropdowns, setOpenDropdowns] = useState<Set<string>>(new Set());

  const { success: showSuccessToast, error: showErrorToast } = useToast();

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
      const response = await fetch('/api/orders');
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
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123';
    const savedAuth = localStorage.getItem('admin_authenticated');
    
    if (savedAuth === 'true') {
      setIsAuthenticated(true);
      fetchOrders();
      fetchDrivers();
    }
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

  const openOrderDetails = (order: CashAppOrder) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/orders/change-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId, new_status: newStatus })
      });

      if (response.ok) {
        toast.success('Order status updated successfully');
        fetchOrders();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update order status');
      }
    } catch (error) {
      toast.error('Error updating order status');
    }
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
      order.short_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_phone.includes(searchTerm) ||
      (order.customer_name && order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const statusCounts = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <AdminNav />
        
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
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    {order.short_code}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    order.status === 'delivered' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                    order.status === 'paid' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                    order.status === 'assigned' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {order.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <div className="flex items-center">
                    <Phone size={14} className="mr-2" />
                    {order.customer_phone}
                  </div>
                  <div className="flex items-center">
                    <DollarSign size={14} className="mr-2" />
                    ${(order.amount_cents / 100).toFixed(2)}
                  </div>
                  <div className="flex items-center">
                    <Clock size={14} className="mr-2" />
                    {new Date(order.created_at).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => openOrderDetails(order)}
                    className="flex-1 bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 py-2 px-3 rounded-lg text-sm font-medium hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
                  >
                    View Details
                  </button>
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
                    Order Details - {selectedOrder.short_code}
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
                        <span className="text-gray-900 dark:text-white">{selectedOrder.customer_phone}</span>
                        <button
                          onClick={() => copyToClipboard(selectedOrder.customer_phone)}
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
                        ${(selectedOrder.amount_cents / 100).toFixed(2)}
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
      </div>
    </div>
  );
}
