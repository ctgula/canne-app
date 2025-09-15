'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Eye, 
  EyeOff, 
  Trash2,
  User,
  Phone,
  MapPin,
  DollarSign,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Car
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import AdminLayout from '@/components/AdminLayout';

interface Driver {
  id: string;
  name: string;
  phone: string;
  email: string;
  is_active: boolean;
  balance_cents: number;
  created_at: string;
  updated_at: string;
  driver_assignments: Array<{
    id: string;
    order_id: string;
    status: string;
    assigned_at: string;
    completed_at?: string;
    order: {
      order_number: string;
      total: number;
      customer_phone: string;
      delivery_address: string;
    };
  }>;
}

const ASSIGNMENT_STATUS_COLORS = {
  assigned: 'bg-blue-100 text-blue-800',
  in_transit: 'bg-yellow-100 text-yellow-800',
  delivered: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800'
};

export default function AdminDriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [showDriverModal, setShowDriverModal] = useState(false);

  useEffect(() => {
    fetchDrivers();
  }, [searchTerm, statusFilter]);

  const fetchDrivers = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('active', statusFilter);

      const response = await fetch(`/api/admin/drivers?${params}`);
      if (!response.ok) throw new Error('Failed to fetch drivers');
      
      const data = await response.json();
      setDrivers(data.drivers);
    } catch (error) {
      console.error('Error fetching drivers:', error);
      toast.error('Failed to load drivers');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (driverId: string, currentActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/drivers/${driverId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentActive })
      });

      if (!response.ok) throw new Error('Failed to update driver');
      
      toast.success(`Driver ${!currentActive ? 'activated' : 'deactivated'}`);
      fetchDrivers();
    } catch (error) {
      console.error('Error updating driver:', error);
      toast.error('Failed to update driver');
    }
  };

  const handlePayoutDriver = async (driverId: string, amount: number) => {
    if (!confirm(`Pay out $${(amount / 100).toFixed(2)} to this driver?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/drivers/${driverId}/payout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount_cents: amount })
      });

      if (!response.ok) throw new Error('Failed to process payout');
      
      toast.success('Payout processed successfully');
      fetchDrivers();
    } catch (error) {
      console.error('Error processing payout:', error);
      toast.error('Failed to process payout');
    }
  };

  const getDriverStats = (driver: Driver) => {
    const assignments = driver.driver_assignments || [];
    const activeAssignments = assignments.filter(a => ['assigned', 'in_transit'].includes(a.status));
    const completedAssignments = assignments.filter(a => a.status === 'delivered');
    const failedAssignments = assignments.filter(a => a.status === 'failed');
    
    return {
      active: activeAssignments.length,
      completed: completedAssignments.length,
      failed: failedAssignments.length,
      total: assignments.length
    };
  };

  if (loading) {
    return (
      <AdminLayout 
        activeTab="drivers"
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        statusCounts={{}}
      >
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-6 h-64">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout 
      activeTab="drivers"
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      statusFilter={statusFilter}
      onStatusFilterChange={setStatusFilter}
      statusCounts={{
        all: drivers.length,
        active: drivers.filter(d => d.is_active).length,
        inactive: drivers.filter(d => !d.is_active).length
      }}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Drivers</h1>
          <p className="text-gray-600 mt-1">Manage delivery drivers and assignments</p>
        </div>
        <button
          onClick={() => setShowDriverModal(true)}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          Add Driver
        </button>
      </div>

      {/* Drivers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {drivers.map((driver) => {
          const stats = getDriverStats(driver);
          const balance = driver.balance_cents / 100;
          
          return (
            <motion.div
              key={driver.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                {/* Header with actions */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <User size={20} className="text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{driver.name}</h3>
                      <p className="text-sm text-gray-600">{driver.email}</p>
                    </div>
                  </div>
                  
                  <div className="relative group">
                    <button className="p-2 hover:bg-gray-100 rounded-lg">
                      <MoreHorizontal size={16} />
                    </button>
                    <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 min-w-[160px]">
                      <button
                        onClick={() => setSelectedDriver(driver)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                      >
                        <Edit size={14} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleToggleActive(driver.id, driver.is_active)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                      >
                        {driver.is_active ? <EyeOff size={14} /> : <Eye size={14} />}
                        {driver.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                      {balance > 0 && (
                        <button
                          onClick={() => handlePayoutDriver(driver.id, driver.balance_cents)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-green-700 hover:bg-green-50 w-full text-left"
                        >
                          <DollarSign size={14} />
                          Pay Out ${balance.toFixed(2)}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone size={14} />
                    <span>{driver.phone}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.active}</div>
                    <div className="text-xs text-gray-500">Active</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                    <div className="text-xs text-gray-500">Completed</div>
                  </div>
                </div>

                {/* Balance */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <DollarSign size={16} className="text-green-500" />
                    <span className="font-semibold text-lg">
                      ${balance.toFixed(2)}
                    </span>
                    <span className="text-sm text-gray-500">balance</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {driver.is_active ? (
                      <CheckCircle size={16} className="text-green-500" />
                    ) : (
                      <XCircle size={16} className="text-red-500" />
                    )}
                    <span className="text-xs text-gray-500">
                      {driver.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                {/* Recent Assignments */}
                {stats.active > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Car size={14} className="text-blue-500" />
                      <span className="text-sm font-medium text-gray-700">
                        {stats.active} active assignment{stats.active !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="space-y-1">
                      {driver.driver_assignments
                        .filter(a => ['assigned', 'in_transit'].includes(a.status))
                        .slice(0, 2)
                        .map((assignment) => (
                          <div key={assignment.id} className="flex items-center justify-between text-xs">
                            <span className="text-gray-600 truncate">
                              {assignment.order.order_number}
                            </span>
                            <span className={`px-2 py-1 rounded-full ${ASSIGNMENT_STATUS_COLORS[assignment.status as keyof typeof ASSIGNMENT_STATUS_COLORS]}`}>
                              {assignment.status}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {drivers.length === 0 && (
        <div className="text-center py-12">
          <Car size={48} className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No drivers found</h3>
          <p className="text-gray-600 mb-4">Get started by adding your first driver</p>
          <button
            onClick={() => setShowDriverModal(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors inline-flex items-center gap-2"
          >
            <Plus size={20} />
            Add Driver
          </button>
        </div>
      )}

      {/* Add Driver Modal */}
      {showDriverModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Add New Driver</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              // Handle form submission
              setShowDriverModal(false);
              toast.success('Driver added successfully');
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowDriverModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Add Driver
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
