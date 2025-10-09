'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, Users, Truck, DollarSign, TrendingUp, ShoppingCart } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    activeDrivers: 0,
    revenue: 0
  });

  useEffect(() => {
    // Fetch dashboard stats
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/kpi');
        if (response.ok) {
          const data = await response.json();
          setStats({
            totalOrders: data.orders || 0,
            pendingOrders: data.pending || 0,
            activeDrivers: 0, // TODO: Add driver count
            revenue: data.revenue || 0
          });
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent mb-2">
          Cannè Admin Dashboard
        </h1>
        <p className="text-gray-600">Manage your cannabis delivery business</p>
      </div>

      {/* Stats Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Orders</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pending Orders</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.pendingOrders}</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-xl">
              <Package className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Active Drivers</p>
              <p className="text-3xl font-bold text-green-600">{stats.activeDrivers}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-xl">
              <Truck className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Revenue</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                ${(stats.revenue / 100).toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-xl">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Access</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            href="/admin/orders"
            className="group bg-white rounded-2xl p-8 shadow-sm border border-gray-200 hover:shadow-lg hover:border-purple-300 transition-all"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl group-hover:from-pink-100 group-hover:to-purple-100 transition-colors">
                <Package className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                  Orders
                </h3>
                <p className="text-sm text-gray-600">Manage all orders</p>
              </div>
            </div>
            <p className="text-gray-500 text-sm">
              View, track, and manage customer orders. Assign drivers and update statuses.
            </p>
          </Link>

          <Link
            href="/admin/drivers"
            className="group bg-white rounded-2xl p-8 shadow-sm border border-gray-200 hover:shadow-lg hover:border-green-300 transition-all"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-green-50 rounded-xl group-hover:bg-green-100 transition-colors">
                <Truck className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                  Drivers
                </h3>
                <p className="text-sm text-gray-600">Manage drivers</p>
              </div>
            </div>
            <p className="text-gray-500 text-sm">
              Add, edit, and track driver availability. Monitor delivery performance.
            </p>
          </Link>

          <Link
            href="/admin/products"
            className="group bg-white rounded-2xl p-8 shadow-sm border border-gray-200 hover:shadow-lg hover:border-blue-300 transition-all"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-50 rounded-xl group-hover:bg-blue-100 transition-colors">
                <ShoppingCart className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  Products
                </h3>
                <p className="text-sm text-gray-600">Manage catalog</p>
              </div>
            </div>
            <p className="text-gray-500 text-sm">
              Update product listings, pricing, and inventory levels.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
