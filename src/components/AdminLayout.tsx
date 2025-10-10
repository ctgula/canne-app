'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ShoppingBag, 
  Package, 
  Users, 
  Search,
  Filter,
  Bell,
  Settings
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  statusFilter?: string;
  onStatusFilterChange?: (status: string) => void;
  statusOptions?: { value: string; label: string; count?: number }[];
}

export default function AdminLayout({ 
  children, 
  searchValue = '',
  onSearchChange,
  statusFilter = 'all',
  onStatusFilterChange,
  statusOptions = []
}: AdminLayoutProps) {
  const pathname = usePathname();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3); // Mock count

  const tabs = [
    { 
      name: 'Orders', 
      href: '/admin/orders', 
      icon: ShoppingBag,
      active: pathname.startsWith('/admin/orders')
    },
    { 
      name: 'Products', 
      href: '/admin/products', 
      icon: Package,
      active: pathname.startsWith('/admin/products')
    },
    { 
      name: 'Drivers', 
      href: '/admin/drivers', 
      icon: Users,
      active: pathname.startsWith('/admin/drivers')
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/admin" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">C</span>
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  Cannè Admin
                </span>
              </Link>
            </div>

            {/* Navigation Tabs */}
            <nav className="flex space-x-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <Link
                    key={tab.name}
                    href={tab.href}
                    className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                      tab.active
                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon size={16} />
                    <span>{tab.name}</span>
                    {tab.active && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-purple-100 dark:bg-purple-900/30 rounded-lg -z-10"
                        initial={false}
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Actions */}
            <div className="flex items-center space-x-3">
              {/* Notifications */}
              <div className="relative">
                <button 
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  className="relative p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <Bell size={20} />
                  {notificationCount > 0 && (
                    <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                      {notificationCount}
                    </span>
                  )}
                </button>
                
                {isNotificationOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {/* Mock notifications */}
                      <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700">
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 mt-2 rounded-full bg-yellow-500 flex-shrink-0"></div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">New Order #0001</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">240-422-5748 • $100.00</p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">2 minutes ago</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700">
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 mt-2 rounded-full bg-green-500 flex-shrink-0"></div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">Payment Verified</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Order #0002 verified</p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">5 minutes ago</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 mt-2 rounded-full bg-blue-500 flex-shrink-0"></div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">Driver Assigned</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Order #0003 assigned to driver</p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">10 minutes ago</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                      <button 
                        onClick={() => setNotificationCount(0)}
                        className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium"
                      >
                        Mark all as read
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Settings */}
              <div className="relative">
                <button 
                  onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                  className={`p-2 transition-colors ${
                    isSettingsOpen 
                      ? 'text-purple-600 dark:text-purple-400' 
                      : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                  }`}
                >
                  <Settings size={20} />
                </button>
                
                {isSettingsOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="font-semibold text-gray-900 dark:text-white">Quick Settings</h3>
                    </div>
                    <div className="p-2">
                      <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-gray-700 dark:text-gray-300">
                        🔔 Notification Preferences
                      </button>
                      <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-gray-700 dark:text-gray-300">
                        🌙 Dark Mode Toggle
                      </button>
                      <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-gray-700 dark:text-gray-300">
                        🔐 Change Password
                      </button>
                      <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-gray-700 dark:text-gray-300">
                        📊 View Analytics
                      </button>
                      <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                      <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-sm text-red-600 dark:text-red-400">
                        🚪 Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Search and Filters Bar */}
      {(onSearchChange || onStatusFilterChange) && (
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center space-x-4">
              {/* Global Search */}
              {onSearchChange && (
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="Search by ID, phone, or cashtag..."
                      value={searchValue}
                      onChange={(e) => onSearchChange(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              {/* Status Filter */}
              {onStatusFilterChange && statusOptions.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                  >
                    <Filter size={16} />
                    <span>
                      {statusOptions.find(opt => opt.value === statusFilter)?.label || 'All'}
                    </span>
                  </button>

                  {isFilterOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 z-50">
                      <div className="py-1">
                        {statusOptions.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => {
                              onStatusFilterChange(option.value);
                              setIsFilterOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-600 ${
                              statusFilter === option.value
                                ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                                : 'text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            <span>{option.label}</span>
                            {option.count !== undefined && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {option.count}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
