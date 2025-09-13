'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, 
  User, 
  Clock, 
  CheckCircle, 
  RefreshCw,
  CreditCard,
  Calendar,
  Package
} from 'lucide-react';

interface Payout {
  id: string;
  driver_id: string;
  order_short_code: string;
  amount_cents: number;
  status: 'queued' | 'paid';
  created_at: string;
  paid_at?: string;
  driver_name?: string;
  driver_phone?: string;
}

interface Driver {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  is_active: boolean;
}

const statusColors = {
  queued: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  paid: 'bg-green-100 text-green-800 border-green-200',
};

const statusIcons = {
  queued: Clock,
  paid: CheckCircle,
};

export default function AdminPayoutsPage() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchPayouts();
      fetchDrivers();
    }
  }, [isAuthenticated]);

  const handleAuth = () => {
    if (password === 'canne2024') {
      setIsAuthenticated(true);
    } else {
      alert('Incorrect password');
    }
  };

  const fetchPayouts = async () => {
    try {
      const response = await fetch('/api/payouts');
      if (response.ok) {
        const data = await response.json();
        setPayouts(data.payouts || []);
      }
    } catch (error) {
      console.error('Error fetching payouts:', error);
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

  const markPayoutPaid = async (payoutId: string) => {
    setActionLoading(payoutId);
    try {
      const response = await fetch('/api/payouts/mark-paid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payout_id: payoutId })
      });

      if (response.ok) {
        fetchPayouts(); // Refresh payouts
      } else {
        alert('Failed to mark payout as paid');
      }
    } catch (error) {
      console.error('Error marking payout as paid:', error);
      alert('Error marking payout as paid');
    } finally {
      setActionLoading(null);
    }
  };

  // Calculate analytics
  const analytics = {
    totalQueued: payouts.filter(p => p.status === 'queued').reduce((sum, p) => sum + p.amount_cents, 0),
    totalPaid: payouts.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount_cents, 0),
    queuedCount: payouts.filter(p => p.status === 'queued').length,
    paidCount: payouts.filter(p => p.status === 'paid').length,
  };

  // Group payouts by driver
  const payoutsByDriver = payouts.reduce((acc, payout) => {
    const driverId = payout.driver_id;
    if (!acc[driverId]) {
      acc[driverId] = {
        driver: drivers.find(d => d.id === driverId),
        payouts: [],
        totalQueued: 0,
        totalPaid: 0,
      };
    }
    acc[driverId].payouts.push(payout);
    if (payout.status === 'queued') {
      acc[driverId].totalQueued += payout.amount_cents;
    } else {
      acc[driverId].totalPaid += payout.amount_cents;
    }
    return acc;
  }, {} as Record<string, any>);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-gray-100">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <DollarSign className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Cannè Payouts</h1>
            <p className="text-gray-600 mt-2">Driver Payout Management</p>
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
              Access Payout Panel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Driver Payouts</h1>
            <p className="text-gray-600 mt-1">Manage driver payments and balances</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchPayouts}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={() => setIsAuthenticated(false)}
              className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Queued Payouts</p>
                <p className="text-2xl font-bold text-yellow-600">${(analytics.totalQueued / 100).toFixed(2)}</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-xl">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">{analytics.queuedCount} pending</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Paid Out</p>
                <p className="text-2xl font-bold text-green-600">${(analytics.totalPaid / 100).toFixed(2)}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-xl">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">{analytics.paidCount} completed</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Payouts</p>
                <p className="text-2xl font-bold text-gray-900">${((analytics.totalQueued + analytics.totalPaid) / 100).toFixed(2)}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">{payouts.length} total</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Drivers</p>
                <p className="text-2xl font-bold text-purple-600">{Object.keys(payoutsByDriver).length}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-xl">
                <User className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">With payouts</p>
          </div>
        </div>

        {/* Driver Payouts */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(payoutsByDriver).map(([driverId, driverData]) => (
              <motion.div
                key={driverId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {driverData.driver?.full_name || 'Unknown Driver'}
                      </h3>
                      <p className="text-gray-600">{driverData.driver?.phone}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Balance</p>
                    <p className="text-xl font-bold text-yellow-600">
                      ${(driverData.totalQueued / 100).toFixed(2)} queued
                    </p>
                    {driverData.totalPaid > 0 && (
                      <p className="text-sm text-green-600">
                        ${(driverData.totalPaid / 100).toFixed(2)} paid
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  {driverData.payouts.map((payout: Payout) => {
                    const StatusIcon = statusIcons[payout.status];
                    return (
                      <div key={payout.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <Package className="w-4 h-4 text-gray-500" />
                          <div>
                            <p className="font-medium text-gray-900">Order {payout.order_short_code}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(payout.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${statusColors[payout.status]}`}>
                            <StatusIcon className="w-4 h-4" />
                            {payout.status}
                          </div>
                          
                          <p className="font-semibold text-gray-900">
                            ${(payout.amount_cents / 100).toFixed(2)}
                          </p>
                          
                          {payout.status === 'queued' && (
                            <button
                              onClick={() => markPayoutPaid(payout.id)}
                              disabled={actionLoading === payout.id}
                              className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 transition-colors text-sm"
                            >
                              {actionLoading === payout.id ? 'Processing...' : 'Mark Paid'}
                            </button>
                          )}
                          
                          {payout.status === 'paid' && payout.paid_at && (
                            <p className="text-xs text-gray-500">
                              Paid {new Date(payout.paid_at).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
            
            {Object.keys(payoutsByDriver).length === 0 && (
              <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
                <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No payouts found</h3>
                <p className="text-gray-500">Payouts will appear here once orders are completed</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
