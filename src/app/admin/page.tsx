'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, Truck, DollarSign, ShoppingBag, Users } from 'lucide-react';
import AdminAuthGate from '@/components/AdminAuthGate';

export default function AdminDashboard() {
  return <AdminAuthGate><DashboardContent /></AdminAuthGate>;
}

function DashboardContent() {
  const [stats, setStats] = useState({ orders: 0, pending: 0, revenue: 0 });

  useEffect(() => {
    fetch('/api/admin/kpi').then(r => r.ok ? r.json() : null).then(d => {
      if (d) setStats({ orders: d.orders || 0, pending: d.pending || 0, revenue: d.revenue || 0 });
    }).catch(() => {});
  }, []);

  const fmt = (n: number) => `$${n.toFixed(2)}`;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Header */}
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Cannè Admin</h1>
        <p className="text-sm text-gray-500 mb-8">Manage orders, drivers, and products</p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 mb-1">Orders</p>
            <p className="text-2xl font-bold text-gray-900">{stats.orders}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 mb-1">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 mb-1">Revenue</p>
            <p className="text-2xl font-bold text-purple-600">{fmt(stats.revenue)}</p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-2">
          {[
            { href: '/admin/orders', icon: ShoppingBag, label: 'Orders', desc: 'View and manage all orders', color: 'text-purple-600 bg-purple-50' },
            { href: '/admin/drivers', icon: Truck, label: 'Drivers', desc: 'Add drivers and manage availability', color: 'text-green-600 bg-green-50' },
            { href: '/admin/products', icon: Package, label: 'Products', desc: 'Update listings and inventory', color: 'text-blue-600 bg-blue-50' },
          ].map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-4 bg-white rounded-xl border border-gray-200 px-4 py-4 hover:border-gray-300 hover:shadow-sm transition-all"
            >
              <div className={`p-2.5 rounded-lg ${item.color}`}>
                <item.icon size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">{item.label}</h3>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
