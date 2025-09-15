'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  ExternalLink
} from 'lucide-react';
import ConfirmDialog from '@/components/ConfirmDialog';
import StatusChangeModal from '@/components/StatusChangeModal';
import { useToast } from '@/components/Toast';

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
  full_name: string;
  phone: string;
  email: string;
  is_active: boolean;
}

interface PayoutSummary {
  queued_payouts: number;
  paid_out: number;
  completed_deliveries: number;
}

const statusColors = {
  awaiting_payment: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  verifying: 'bg-blue-100 text-blue-800 border-blue-200',
  paid: 'bg-green-100 text-green-800 border-green-200',
  assigned: 'bg-purple-100 text-purple-800 border-purple-200',
  delivered: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  undelivered: 'bg-orange-100 text-orange-800 border-orange-200',
  refunded: 'bg-red-100 text-red-800 border-red-200',
  canceled: 'bg-gray-100 text-gray-800 border-gray-200',
};

const statusIcons = {
  awaiting_payment: Clock,
  verifying: Eye,
  paid: CheckCircle,
  assigned: Truck,
  delivered: Package,
  undelivered: AlertCircle,
  refunded: AlertCircle,
  canceled: X,
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<CashAppOrder[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'all'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'status'>('date');
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<CashAppOrder | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    variant: 'info' | 'danger';
    loading: boolean;
    action: () => Promise<void>;
  }>({ isOpen: false, title: '', message: '', variant: 'info', loading: false, action: async () => {} });
  
  const [statusChangeModal, setStatusChangeModal] = useState<{
    isOpen: boolean;
    orderCode: string;
    currentStatus: string;
    targetStatus: string;
    orderId: string;
  }>({ isOpen: false, orderCode: '', currentStatus: '', targetStatus: '', orderId: '' });
  
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [bulkStatusModal, setBulkStatusModal] = useState<{
    isOpen: boolean;
    targetStatus: string;
  }>({ isOpen: false, targetStatus: '' });
  
  const { success, error: showError } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [payoutSummary, setPayoutSummary] = useState<PayoutSummary | null>(null);

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

  const handleMarkPaid = async (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    setConfirmDialog({
      isOpen: true,
      title: 'Mark Order as Paid',
      message: `Are you sure you want to mark order ${order.short_code} as paid? This will trigger a payment confirmation notification to the customer.`,
      variant: 'info',
      loading: false,
      action: async () => {
        setConfirmDialog(prev => ({ ...prev, loading: true }));
        try {
          const response = await fetch('/api/orders/mark-paid', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ short_code: order.short_code }),
          });

          if (response.ok) {
            // Optimistic update
            setOrders(prev => prev.map(order => 
              order.id === orderId 
                ? { ...order, status: 'paid' }
                : order
            ));
            success('Order Marked as Paid', `Order ${order.short_code} has been marked as paid and customer notified.`);
            await fetchOrders(); // Refresh to get latest data
          } else {
            const errorData = await response.json();
            showError('Failed to Mark Paid', errorData.error || 'An error occurred while marking the order as paid.');
          }
        } catch (error) {
          console.error('Error marking order as paid:', error);
          showError('Network Error', 'Failed to connect to the server. Please try again.');
        } finally {
          setConfirmDialog(prev => ({ ...prev, isOpen: false, loading: false }));
        }
      }
    });
  };

  const handleAssignDriver = async (orderId: string, driverId: string) => {
    const order = orders.find(o => o.id === orderId);
    const driver = drivers.find(d => d.id === driverId);
    if (!order || !driver) return;

    setConfirmDialog({
      isOpen: true,
      title: 'Assign Driver',
      message: `Assign ${driver.full_name} to order ${order.short_code}? This will notify both the customer and driver.`,
      variant: 'info',
      loading: false,
      action: async () => {
        setConfirmDialog(prev => ({ ...prev, loading: true }));
        try {
          const response = await fetch('/api/orders/assign-driver', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ short_code: order.short_code, driver_id: driverId }),
          });

          if (response.ok) {
            // Optimistic update
            setOrders(prev => prev.map(order => 
              order.id === orderId 
                ? { ...order, status: 'assigned', driver_id: driverId, driver_name: driver.full_name }
                : order
            ));
            success('Driver Assigned', `${driver.full_name} has been assigned to order ${order.short_code}.`);
            await fetchOrders(); // Refresh to get latest data
          } else {
            const errorData = await response.json();
            showError('Failed to Assign Driver', errorData.error || 'An error occurred while assigning the driver.');
          }
        } catch (error) {
          console.error('Error assigning driver:', error);
          showError('Network Error', 'Failed to connect to the server. Please try again.');
        } finally {
          setConfirmDialog(prev => ({ ...prev, isOpen: false, loading: false }));
        }
      }
    });
  };

  const handleCompleteOrder = async (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    setConfirmDialog({
      isOpen: true,
      title: 'Complete Order',
      message: `Mark order ${order.short_code} as delivered? This will notify the customer and finalize the order.`,
      variant: 'info',
      loading: false,
      action: async () => {
        setConfirmDialog(prev => ({ ...prev, loading: true }));
        try {
          const response = await fetch('/api/orders/complete', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ short_code: order.short_code }),
          });

          if (response.ok) {
            // Optimistic update
            setOrders(prev => prev.map(order => 
              order.id === orderId 
                ? { ...order, status: 'delivered' }
                : order
            ));
            success('Order Completed', `Order ${order.short_code} has been marked as delivered.`);
            await fetchOrders(); // Refresh to get latest data
          } else {
            const errorData = await response.json();
            showError('Failed to Complete Order', errorData.error || 'An error occurred while completing the order.');
          }
        } catch (error) {
          console.error('Error completing order:', error);
          showError('Network Error', 'Failed to connect to the server. Please try again.');
        } finally {
          setConfirmDialog(prev => ({ ...prev, isOpen: false, loading: false }));
        }
      }
    });
  };

  const openStatusChangeModal = (orderId: string, targetStatus: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    setStatusChangeModal({
      isOpen: true,
      orderCode: order.short_code,
      currentStatus: order.status,
      targetStatus,
      orderId
    });
  };
  
  const handleStatusChange = async (newStatus: string, reason?: string) => {
    const order = orders.find(o => o.id === statusChangeModal.orderId);
    if (!order) return;

    try {
      const response = await fetch('/api/orders/change-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          short_code: order.short_code, 
          new_status: newStatus,
          reason,
          admin_action: true
        }),
      });

      if (response.ok) {
        const result = await response.json();
        // Optimistic update
        setOrders(prev => prev.map(o => 
          o.id === statusChangeModal.orderId 
            ? { ...o, status: newStatus as CashAppOrder['status'] }
            : o
        ));
        success('Status Changed', `Order ${order.short_code} status changed to ${newStatus.replace('_', ' ')}.`);
        await fetchOrders(); // Refresh to get latest data
      } else {
        const errorData = await response.json();
        showError('Failed to Change Status', errorData.error || 'An error occurred while changing the order status.');
        throw new Error(errorData.error);
      }
    } catch (error) {
      console.error('Error changing order status:', error);
      showError('Network Error', 'Failed to connect to the server. Please try again.');
      throw error;
    }
  };
  
  const handleBulkStatusChange = async (newStatus: string, reason?: string) => {
    const selectedOrdersList = Array.from(selectedOrders);
    if (selectedOrdersList.length === 0) return;
    
    try {
      const response = await fetch('/api/orders/bulk-change-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          order_ids: selectedOrdersList,
          new_status: newStatus,
          reason,
          admin_action: true
        }),
      });

      if (response.ok) {
        const result = await response.json();
        // Optimistic update
        setOrders(prev => prev.map(o => 
          selectedOrdersList.includes(o.id)
            ? { ...o, status: newStatus as CashAppOrder['status'] }
            : o
        ));
        setSelectedOrders(new Set());
        success('Bulk Status Changed', `${selectedOrdersList.length} orders updated to ${newStatus.replace('_', ' ')}.`);
        await fetchOrders(); // Refresh to get latest data
      } else {
        const errorData = await response.json();
        showError('Failed to Change Status', errorData.error || 'An error occurred while changing the order statuses.');
        throw new Error(errorData.error);
      }
    } catch (error) {
      console.error('Error changing order statuses:', error);
      showError('Network Error', 'Failed to connect to the server. Please try again.');
      throw error;
    }
  };

  const handleRefundOrder = async (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    setConfirmDialog({
      isOpen: true,
      title: 'Refund Order',
      message: `Are you sure you want to refund order ${order.short_code}? This action cannot be undone and will notify the customer.`,
      variant: 'danger',
      loading: false,
      action: async () => {
        setConfirmDialog(prev => ({ ...prev, loading: true }));
        try {
          const response = await fetch('/api/orders/refund', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ orderId }),
          });

          if (response.ok) {
            // Optimistic update
            setOrders(prev => prev.map(order => 
              order.id === orderId 
                ? { ...order, status: 'refunded' }
                : order
            ));
            success('Order Refunded', `Order ${order.short_code} has been refunded and customer notified.`);
            await fetchOrders(); // Refresh to get latest data
          } else {
            const errorData = await response.json();
            showError('Failed to Refund Order', errorData.error || 'An error occurred while refunding the order.');
          }
        } catch (error) {
          console.error('Error refunding order:', error);
          showError('Network Error', 'Failed to connect to the server. Please try again.');
        } finally {
          setConfirmDialog(prev => ({ ...prev, isOpen: false, loading: false }));
        }
      }
    });
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

  // Filter and sort orders based on search, status, and sort preference
  const filteredOrders = orders
    .filter(order => {
      const matchesSearch = 
        order.short_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_phone.includes(searchTerm) ||
        (order.cashapp_handle && order.cashapp_handle.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      
      const matchesDate = (() => {
        if (dateFilter === 'all') return true;
        const orderDate = new Date(order.created_at);
        const now = new Date();
        
        if (dateFilter === 'today') {
          return orderDate.toDateString() === now.toDateString();
        }
        
        if (dateFilter === 'week') {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return orderDate >= weekAgo;
        }
        
        return true;
      })();
      
      return matchesSearch && matchesStatus && matchesDate;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'amount':
          return b.amount_cents - a.amount_cents;
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

  const statusCounts = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Toast will be handled by the existing toast system in the component
  };

  const openOrderDetails = (order: CashAppOrder) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const toggleDropdown = (orderId: string) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const closeDropdown = (orderId: string) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [orderId]: false
    }));
  };
  
  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };
  
  const selectAllOrders = () => {
    if (selectedOrders.size === filteredOrders.length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(filteredOrders.map(o => o.id)));
    }
  };
  
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

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle shortcuts when not typing in inputs
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement) {
        return;
      }

      switch (event.key) {
        case '/':
          event.preventDefault();
          document.getElementById('search-input')?.focus();
          break;
        case 'Escape':
          if (showOrderDetails) {
            setShowOrderDetails(false);
          }
          break;
        case 'r':
          if (event.metaKey || event.ctrlKey) {
            event.preventDefault();
            fetchOrders();
          }
          break;
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
          if (event.metaKey || event.ctrlKey) {
            event.preventDefault();
            const filters = ['all', 'awaiting_payment', 'verifying', 'paid', 'assigned', 'delivered'];
            const filterIndex = parseInt(event.key) - 1;
            if (filterIndex < filters.length) {
              setStatusFilter(filters[filterIndex]);
            }
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showOrderDetails]);

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
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
            <p className="text-gray-600 mt-2">Manage customer orders and driver assignments</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden lg:block text-sm text-gray-500">
              <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">⌘/Ctrl+R</kbd> Refresh •
              <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">/</kbd> Search •
              <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">⌘/Ctrl+1-6</kbd> Filter
            </div>
            <button
              onClick={fetchOrders}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50"
              aria-label="Refresh orders"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          {/* Bulk Actions Bar */}
          {selectedOrders.size > 0 && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-purple-900">
                    {selectedOrders.size} order{selectedOrders.size > 1 ? 's' : ''} selected
                  </span>
                  <button
                    onClick={() => setSelectedOrders(new Set())}
                    className="text-sm text-purple-600 hover:text-purple-700"
                  >
                    Clear selection
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        setBulkStatusModal({ isOpen: true, targetStatus: e.target.value });
                        e.target.value = '';
                      }
                    }}
                    className="px-3 py-2 border border-purple-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Change Status (Bulk)</option>
                    {getAllValidStatuses().map(status => (
                      <option key={status} value={status}>
                        {status.replace('_', ' ').toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="search-input"
                  type="text"
                  placeholder="Search orders by ID, phone, or cashtag... (Press / to focus)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full"
                  aria-label="Search orders"
                />
              </div>
            </div>
            
            <div className="flex gap-3 flex-wrap">
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as 'today' | 'week' | 'all')}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'amount' | 'status')}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
              >
                <option value="date">Sort by Date</option>
                <option value="amount">Sort by Amount</option>
                <option value="status">Sort by Status</option>
              </select>
            </div>
          </div>
          
          {/* Status Filter Tabs */}
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all', label: 'All Orders', count: orders.length },
                { key: 'awaiting_payment', label: 'Awaiting Payment', count: statusCounts.awaiting_payment || 0 },
                { key: 'verifying', label: 'Verifying', count: statusCounts.verifying || 0 },
                { key: 'paid', label: 'Paid', count: statusCounts.paid || 0 },
                { key: 'assigned', label: 'Assigned', count: statusCounts.assigned || 0 },
                { key: 'delivered', label: 'Delivered', count: statusCounts.delivered || 0 },
                { key: 'undelivered', label: 'Undelivered', count: statusCounts.undelivered || 0 },
                { key: 'refunded', label: 'Refunded', count: statusCounts.refunded || 0 },
                { key: 'canceled', label: 'Canceled', count: statusCounts.canceled || 0 },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setStatusFilter(tab.key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    statusFilter === tab.key
                      ? 'bg-purple-100 text-purple-800 border border-purple-200'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>
            
            {/* Select All Checkbox */}
            {filteredOrders.length > 0 && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="select-all"
                  checked={selectedOrders.size === filteredOrders.length && filteredOrders.length > 0}
                  onChange={selectAllOrders}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <label htmlFor="select-all" className="text-sm text-gray-600">
                  Select all ({filteredOrders.length})
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Payout Summary */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Driver Payouts Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-yellow-50 rounded-xl">
              <p className="text-2xl font-bold text-yellow-600">
                ${((orders.filter(o => o.status === 'delivered').length * 1500) / 100).toFixed(2)}
              </p>
              <p className="text-sm text-gray-600">Queued Payouts</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <p className="text-2xl font-bold text-green-600">$0.00</p>
              <p className="text-sm text-gray-600">Paid Out</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <p className="text-2xl font-bold text-blue-600">{orders.filter(o => o.status === 'delivered').length}</p>
              <p className="text-sm text-gray-600">Completed Deliveries</p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'All Orders', count: orders.length },
            { key: 'awaiting_payment', label: 'Awaiting Payment', count: statusCounts.awaiting_payment || 0 },
            { key: 'verifying', label: 'Verifying', count: statusCounts.verifying || 0 },
            { key: 'paid', label: 'Paid', count: statusCounts.paid || 0 },
            { key: 'assigned', label: 'Assigned', count: statusCounts.assigned || 0 },
            { key: 'delivered', label: 'Delivered', count: statusCounts.delivered || 0 },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === tab.key
                  ? 'bg-purple-100 text-purple-800 border border-purple-200'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Payout Summary */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Driver Payouts Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-yellow-50 rounded-xl">
            <p className="text-2xl font-bold text-yellow-600">
              ${((orders.filter(o => o.status === 'delivered').length * 1500) / 100).toFixed(2)}
            </p>
            <p className="text-sm text-gray-600">Queued Payouts</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-xl">
            <p className="text-2xl font-bold text-green-600">$0.00</p>
            <p className="text-sm text-gray-600">Paid Out</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-xl">
            <p className="text-2xl font-bold text-blue-600">{orders.filter(o => o.status === 'delivered').length}</p>
            <p className="text-sm text-gray-600">Completed Deliveries</p>
          </div>
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredOrders.map((order) => {
            const StatusIcon = statusIcons[order.status];
            const assignedDriver = drivers.find(d => d.id === order.driver_id);
            
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white rounded-2xl shadow-sm border p-6 hover:shadow-md transition-all cursor-pointer ${
                  selectedOrders.has(order.id) 
                    ? 'border-purple-300 bg-purple-50' 
                    : 'border-gray-200'
                }`}
                onClick={() => openOrderDetails(order)}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedOrders.has(order.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          toggleOrderSelection(order.id);
                        }}
                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      />
                      <div className="relative">
                        <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center">
                          <StatusIcon className="w-5 h-5 text-gray-600" />
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{order.short_code}</h3>
                      <div className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${statusColors[order.status]}`}>
                        {order.status.replace('_', ' ').toUpperCase()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-xl font-bold text-green-600">
                      ${(order.amount_cents / 100).toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                {/* Customer Info */}
                <div className="space-y-2 mb-4">
                  {order.customer_phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4 text-blue-500" />
                      <span>{order.customer_phone}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(order.customer_phone);
                        }}
                        className="ml-auto p-1 hover:bg-gray-100 rounded"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  
                  {order.cashapp_handle && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <CreditCard className="w-4 h-4" />
                      <span>@{order.cashapp_handle}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(order.cashapp_handle!);
                        }}
                        className="ml-auto p-1 hover:bg-gray-100 rounded"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  
                  {assignedDriver && (
                    <div className="flex items-center gap-2 text-sm text-purple-600">
                      <User className="w-4 h-4" />
                      <span>{assignedDriver.full_name}</span>
                    </div>
                  )}
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                  {/* Status Change Dropdown */}
                  <div className="relative">
                    <select
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        if (e.target.value) {
                          openStatusChangeModal(order.id, e.target.value);
                          e.target.value = '';
                        }
                      }}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white"
                    >
                      <option value="">Change Status</option>
                      {getValidTransitions(order.status).map(status => (
                        <option key={status} value={status}>
                          {status.replace('_', ' ').toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Legacy Actions Dropdown */}
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleDropdown(order.id);
                      }}
                      className="flex items-center gap-1 px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                      Actions
                      <ChevronDown className={`w-3 h-3 transition-transform ${openDropdowns[order.id] ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {/* Dropdown Menu */}
                    {openDropdowns[order.id] && (
                      <>
                        {/* Backdrop to close dropdown */}
                        <div 
                          className="fixed inset-0 z-10"
                          onClick={() => closeDropdown(order.id)}
                        />
                        <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-xl z-20">
                          <div className="p-2">
                            {/* Legacy Status Actions */}
                            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
                              Quick Actions
                            </div>
                            {order.status === 'verifying' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarkPaid(order.id);
                                  closeDropdown(order.id);
                                }}
                                className="w-full text-left px-3 py-2 text-sm text-green-700 hover:bg-green-50 rounded-md transition-colors"
                              >
                                Mark as Paid
                              </button>
                            )}
                            {order.status === 'assigned' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCompleteOrder(order.id);
                                  closeDropdown(order.id);
                                }}
                                className="w-full text-left px-3 py-2 text-sm text-purple-700 hover:bg-purple-50 rounded-md transition-colors"
                              >
                                Mark as Delivered
                              </button>
                            )}
                            
                            {/* Driver Assignment */}
                            {order.status === 'paid' && drivers.filter(d => d.is_active).length > 0 && (
                              <>
                                <div className="border-t border-gray-100 my-2"></div>
                                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                  Assign Driver
                                </div>
                                {drivers.filter(d => d.is_active).map(driver => (
                                  <button
                                    key={driver.id}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAssignDriver(order.id, driver.id);
                                      closeDropdown(order.id);
                                    }}
                                    className="w-full text-left px-3 py-2 text-sm text-purple-700 hover:bg-purple-50 rounded-md transition-colors flex items-center gap-2"
                                  >
                                    <User className="w-4 h-4" />
                                    {driver.full_name}
                                  </button>
                                ))}
                              </>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openOrderDetails(order);
                    }}
                    className="flex items-center gap-1 px-3 py-2 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    Details
                  </button>
                </div>
              </motion.div>
            );
          })}
          
          {filteredOrders.length === 0 && (
            <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-gray-200">
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
              className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-bold text-gray-900">Order {selectedOrder.short_code}</h2>
                    <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${statusColors[selectedOrder.status]}`}>
                      {React.createElement(statusIcons[selectedOrder.status], { className: "w-4 h-4" })}
                      {selectedOrder.status.replace('_', ' ').toUpperCase()}
                    </div>
                  </div>
                  <button
                    onClick={() => setShowOrderDetails(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
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
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-gray-900">{selectedOrder.customer_phone}</p>
                      <button
                        onClick={() => copyToClipboard(selectedOrder.customer_phone)}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="Copy phone number"
                      >
                        <Copy className="w-4 h-4 text-gray-400" />
                      </button>
                      <a
                        href={`tel:${selectedOrder.customer_phone}`}
                        className="p-1 hover:bg-blue-50 rounded"
                        title="Call customer"
                      >
                        <Phone className="w-4 h-4 text-blue-600" />
                      </a>
                    </div>
                  </div>
                )}
                
                {selectedOrder.cashapp_handle && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Cash App Handle</label>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-green-600 font-medium">@{selectedOrder.cashapp_handle}</p>
                      <button
                        onClick={() => copyToClipboard(selectedOrder.cashapp_handle!)}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="Copy CashApp handle"
                      >
                        <Copy className="w-4 h-4 text-gray-400" />
                      </button>
                      <a
                        href={`https://cash.app/$${selectedOrder.cashapp_handle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 hover:bg-green-50 rounded"
                        title="Open in CashApp"
                      >
                        <ExternalLink className="w-4 h-4 text-green-600" />
                      </a>
                    </div>
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
                
                {/* Status Change Section */}
                <div className="border-t border-gray-200 pt-6">
                  <label className="text-sm font-medium text-gray-600 block mb-3">Change Order Status</label>
                  <div className="flex gap-3">
                    {selectedOrder.status === 'verifying' && (
                      <button
                        onClick={() => handleMarkPaid(selectedOrder.id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700"
                      >
                        Mark as Paid
                      </button>
                    )}
                    
                    {selectedOrder.status === 'paid' && drivers.length > 0 && (
                      <select
                        onChange={(e) => e.target.value && handleAssignDriver(selectedOrder.id, e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="">Assign Driver</option>
                        {drivers.filter(d => d.is_active).map(driver => (
                          <option key={driver.id} value={driver.id}>
                            {driver.full_name}
                          </option>
                        ))}
                      </select>
                    )}
                    
                    {selectedOrder.status === 'assigned' && (
                      <button
                        onClick={() => handleCompleteOrder(selectedOrder.id)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700"
                      >
                        Mark as Delivered
                      </button>
                    )}
                    
                    {(selectedOrder.status === 'awaiting_payment' || selectedOrder.status === 'verifying' || selectedOrder.status === 'paid') && (
                      <button
                        onClick={() => handleRefundOrder(selectedOrder.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700"
                      >
                        Refund Order
                      </button>
                    )}
                    
                    <button
                      onClick={() => setShowOrderDetails(false)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
        
        
        {/* Status Change Modal */}
        <StatusChangeModal
          isOpen={statusChangeModal.isOpen}
          onClose={() => setStatusChangeModal(prev => ({ ...prev, isOpen: false }))}
          onConfirm={handleStatusChange}
          orderCode={statusChangeModal.orderCode}
          currentStatus={statusChangeModal.currentStatus}
          targetStatus={statusChangeModal.targetStatus}
        />
        
        {/* Bulk Status Change Modal */}
        {bulkStatusModal.isOpen && (
          <StatusChangeModal
            isOpen={bulkStatusModal.isOpen}
            onClose={() => setBulkStatusModal({ isOpen: false, targetStatus: '' })}
            onConfirm={handleBulkStatusChange}
            orderCode={`${selectedOrders.size} orders`}
            currentStatus="multiple"
            targetStatus={bulkStatusModal.targetStatus}
          />
        )}
        
        {/* Confirmation Dialog */}
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
          onConfirm={confirmDialog.action}
          title={confirmDialog.title}
          message={confirmDialog.message}
          variant={confirmDialog.variant}
          loading={confirmDialog.loading}
        />
    </div>
  );
}
