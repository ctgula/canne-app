'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Phone, 
  Package, 
  ChevronDown,
  MapPin,
  MessageSquare,
  RefreshCw,
  Truck,
} from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import AdminAuthGate from '@/components/AdminAuthGate';
import OrderDetailsDrawer from '@/components/OrderDetailsDrawer';
import toast from 'react-hot-toast';

interface Order {
  id: string;
  order_number: string;
  status: string;
  total: number;
  created_at: string;
  driver_id?: string;
  delivery_address_line1?: string;
  delivery_city?: string;
  delivery_state?: string;
  time_preference?: string;
  preferred_time?: string;
  customers: { first_name: string; last_name: string; phone: string; email: string };
  order_items?: { quantity: number; products: { name: string; price_cents: number } }[];
  driver?: { id: string; name: string; phone: string };
}

interface Driver { id: string; name: string; phone: string; is_available: boolean }

const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

const timeAgo = (d: string) => {
  if (!d) return '';
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return 'now';
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
};

const STATUS_CFG: Record<string, { label: string; color: string; dot: string }> = {
  awaiting_payment: { label: 'Awaiting', color: 'text-yellow-700 bg-yellow-50 border-yellow-200', dot: 'bg-yellow-400' },
  verifying:        { label: 'Verifying', color: 'text-blue-700 bg-blue-50 border-blue-200', dot: 'bg-blue-400' },
  paid:             { label: 'Paid', color: 'text-green-700 bg-green-50 border-green-200', dot: 'bg-green-500' },
  assigned:         { label: 'Assigned', color: 'text-indigo-700 bg-indigo-50 border-indigo-200', dot: 'bg-indigo-400' },
  out_for_delivery: { label: 'On the Way', color: 'text-teal-700 bg-teal-50 border-teal-200', dot: 'bg-teal-400' },
  delivered:        { label: 'Delivered', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', dot: 'bg-emerald-500' },
  cancelled:        { label: 'Cancelled', color: 'text-red-700 bg-red-50 border-red-200', dot: 'bg-red-400' },
  issue:            { label: 'Issue', color: 'text-orange-700 bg-orange-50 border-orange-200', dot: 'bg-orange-400' },
  refunded:         { label: 'Refunded', color: 'text-gray-600 bg-gray-50 border-gray-200', dot: 'bg-gray-400' },
};

const ALL_STATUSES = ['awaiting_payment', 'verifying', 'paid', 'assigned', 'out_for_delivery', 'delivered', 'cancelled', 'issue'];

const getCategory = (s: string) => {
  if (['awaiting_payment', 'verifying'].includes(s)) return 'pending';
  if (['paid', 'assigned', 'out_for_delivery'].includes(s)) return 'active';
  if (s === 'delivered') return 'delivered';
  return 'issues';
};

export default function AdminOrdersPage() {
  return <AdminAuthGate><OrdersContent /></AdminAuthGate>;
}

function OrdersContent() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [tab, setTab] = useState('all');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<{ id: string; type: 'status' | 'driver' } | null>(null);

  const fetchOrders = async (showRefresh = false) => {
    try {
      if (showRefresh) setIsRefreshing(true);
      const res = await fetch('/api/admin/orders');
      if (!res.ok) throw new Error();
      const data = await res.json();
      setOrders(data.orders || []);
    } catch { toast.error('Failed to load orders'); }
    finally { setLoading(false); setIsRefreshing(false); }
  };

  const fetchDrivers = async () => {
    try {
      const res = await fetch('/api/admin/drivers');
      if (res.ok) { const d = await res.json(); setDrivers(d.drivers || []); }
    } catch {}
  };

  useEffect(() => { fetchOrders(); fetchDrivers(); }, []);

  useEffect(() => {
    const sub = supabase
      .channel('admin-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => fetchOrders())
      .subscribe();
    return () => { sub.unsubscribe(); };
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setOpenDropdown(null);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      toast.success(`Status → ${(STATUS_CFG[newStatus]?.label || newStatus)}`);
      fetchOrders();
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed to update'); }
  };

  const handleAssignDriver = async (orderId: string, driverId: string) => {
    setOpenDropdown(null);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/assign-driver`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driver_id: driverId }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      toast.success('Driver assigned');
      fetchOrders();
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed'); }
  };

  // Close dropdowns on outside click
  useEffect(() => {
    if (!openDropdown) return;
    const close = () => setOpenDropdown(null);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [openDropdown]);

  // Filter
  const filtered = orders.filter(o => {
    const s = searchTerm.toLowerCase();
    const matchSearch = !s ||
      o.order_number.toLowerCase().includes(s) ||
      o.customers.phone.includes(searchTerm) ||
      `${o.customers.first_name} ${o.customers.last_name}`.toLowerCase().includes(s);
    const matchTab = tab === 'all' || getCategory(o.status) === tab;
    return matchSearch && matchTab;
  });

  const counts = orders.reduce((a, o) => {
    const cat = getCategory(o.status);
    a[cat] = (a[cat] || 0) + 1;
    return a;
  }, {} as Record<string, number>);

  const tabs = [
    { key: 'all', label: 'All', count: orders.length },
    { key: 'pending', label: 'Pending', count: counts.pending || 0 },
    { key: 'active', label: 'Active', count: counts.active || 0 },
    { key: 'delivered', label: 'Done', count: counts.delivered || 0 },
    { key: 'issues', label: 'Issues', count: counts.issues || 0 },
  ];

  return (
    <AdminLayout
      searchValue={searchTerm}
      onSearchChange={setSearchTerm}
      searchPlaceholder="Search name, phone, or order #..."
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-900">Orders</h1>
        <button
          onClick={() => fetchOrders(true)}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-gray-100 p-1 rounded-lg w-fit">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              tab === t.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
            {t.count > 0 && (
              <span className={`ml-1.5 text-xs ${tab === t.key ? 'text-purple-600' : 'text-gray-400'}`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Package className="mx-auto h-10 w-10 text-gray-300 mb-3" />
          <p className="text-sm text-gray-500">{searchTerm ? 'No matches' : 'No orders yet'}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(order => {
            const cfg = STATUS_CFG[order.status] || STATUS_CFG.awaiting_payment;
            const name = `${order.customers.first_name} ${order.customers.last_name}`;

            return (
              <div
                key={order.id}
                onClick={() => { setSelectedOrderId(order.id); setIsDrawerOpen(true); }}
                className="bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer"
              >
                <div className="px-4 py-3">
                  {/* Row 1: customer · status · total */}
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
                      <span className="font-semibold text-gray-900 truncate text-sm">{name}</span>
                      <span className="text-xs text-gray-400 flex-shrink-0 font-mono">#{order.order_number}</span>
                      <span className="text-xs text-gray-400 flex-shrink-0">{timeAgo(order.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-2.5 flex-shrink-0 ml-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${cfg.color}`}>
                        {cfg.label}
                      </span>
                      <span className="font-bold text-sm text-gray-900">{fmt(order.total)}</span>
                    </div>
                  </div>

                  {/* Row 2: items + address/time */}
                  {((order.order_items && order.order_items.length > 0) || order.delivery_address_line1) && (
                    <div className="flex items-center gap-2 mb-2 min-w-0">
                      {order.order_items && order.order_items.length > 0 && (
                        <span className="text-xs text-gray-500 truncate">
                          {order.order_items.map(i => `${i.products?.name || 'Item'} ×${i.quantity}`).join(', ')}
                        </span>
                      )}
                      {order.delivery_address_line1 && order.delivery_address_line1 !== 'Pending' && (
                        <span className="text-xs text-gray-400 flex-shrink-0 truncate max-w-[140px]">
                          · {order.delivery_address_line1}
                        </span>
                      )}
                      {(order.time_preference || order.preferred_time) && (
                        <span className="text-xs text-purple-500 flex-shrink-0 ml-auto">
                          {order.time_preference || order.preferred_time}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Row 2: quick actions */}
                  <div className="flex items-center gap-1.5">
                    {/* Status change */}
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenDropdown(
                            openDropdown?.id === order.id && openDropdown?.type === 'status'
                              ? null
                              : { id: order.id, type: 'status' }
                          );
                        }}
                        className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors"
                      >
                        Status <ChevronDown className="w-3 h-3" />
                      </button>
                      {openDropdown?.id === order.id && openDropdown?.type === 'status' && (
                        <div
                          onClick={e => e.stopPropagation()}
                          className="absolute z-20 left-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg py-1"
                        >
                          {ALL_STATUSES.map(s => {
                            const sc = STATUS_CFG[s];
                            return (
                              <button
                                key={s}
                                disabled={order.status === s}
                                onClick={(e) => { e.stopPropagation(); handleStatusChange(order.id, s); }}
                                className={`w-full px-3 py-1.5 text-left text-xs hover:bg-gray-50 flex items-center gap-2 ${order.status === s ? 'opacity-30 cursor-default' : ''}`}
                              >
                                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${sc.dot}`} />
                                {sc.label}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Driver */}
                    {order.driver ? (
                      <span className="text-xs text-indigo-600 bg-indigo-50 border border-indigo-200 px-2 py-1 rounded-md font-medium">
                        {order.driver.name}
                      </span>
                    ) : (
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDropdown(
                              openDropdown?.id === order.id && openDropdown?.type === 'driver'
                                ? null
                                : { id: order.id, type: 'driver' }
                            );
                          }}
                          className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-purple-600 bg-purple-50 border border-purple-200 rounded-md hover:bg-purple-100 transition-colors"
                        >
                          <Truck className="w-3 h-3" /> Assign <ChevronDown className="w-3 h-3" />
                        </button>
                        {openDropdown?.id === order.id && openDropdown?.type === 'driver' && (
                          <div
                            onClick={e => e.stopPropagation()}
                            className="absolute z-20 left-0 mt-1 w-44 bg-white border border-gray-200 rounded-lg shadow-lg py-1"
                          >
                            {drivers.length === 0 ? (
                              <div className="px-3 py-2 text-xs text-gray-500">No drivers available</div>
                            ) : drivers.map(d => (
                              <button
                                key={d.id}
                                onClick={(e) => { e.stopPropagation(); handleAssignDriver(order.id, d.id); }}
                                className="w-full px-3 py-1.5 text-left text-xs hover:bg-gray-50 flex items-center justify-between"
                              >
                                <span className="font-medium text-gray-900">{d.name}</span>
                                <span className={`w-1.5 h-1.5 rounded-full ${d.is_available ? 'bg-green-400' : 'bg-gray-300'}`} />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Spacer */}
                    <div className="flex-1" />

                    {/* Contact actions */}
                    <a
                      href={`sms:${order.customers.phone}`}
                      onClick={e => e.stopPropagation()}
                      className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
                      title="Text"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </a>
                    <a
                      href={`tel:${order.customers.phone}`}
                      onClick={e => e.stopPropagation()}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      title="Call"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                    {order.delivery_address_line1 && (
                      <a
                        href={`https://maps.google.com/?q=${encodeURIComponent(`${order.delivery_address_line1}, ${order.delivery_city}, ${order.delivery_state}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                        className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
                        title="Directions"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Drawer */}
      <OrderDetailsDrawer
        orderId={selectedOrderId}
        isOpen={isDrawerOpen}
        onClose={() => { setIsDrawerOpen(false); setSelectedOrderId(null); }}
        onStatusChange={handleStatusChange}
        onAssignDriver={handleAssignDriver}
        drivers={drivers}
      />
    </AdminLayout>
  );
}
