'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Phone,
  Truck,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import AdminLayout from '@/components/AdminLayout';
import AdminAuthGate from '@/components/AdminAuthGate';

interface Driver {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: string;
  vehicle_info: string;
  created_at: string;
}

export default function AdminDriversPage() {
  return <AdminAuthGate><DriversContent /></AdminAuthGate>;
}

function DriversContent() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '' });

  useEffect(() => { fetchDrivers(); }, [searchTerm]);

  const fetchDrivers = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      const res = await fetch(`/api/admin/drivers?${params}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setDrivers(data.drivers || []);
    } catch { toast.error('Failed to load drivers'); }
    finally { setLoading(false); }
  };

  const handleToggle = async (id: string, currentlyActive: boolean) => {
    try {
      const res = await fetch(`/api/admin/drivers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: currentlyActive ? 'offline' : 'available' }),
      });
      if (!res.ok) throw new Error();
      toast.success(currentlyActive ? 'Set offline' : 'Set available');
      fetchDrivers();
    } catch { toast.error('Failed to update'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this driver?')) return;
    try {
      const res = await fetch(`/api/admin/drivers/${id}`, { method: 'DELETE' });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      toast.success('Driver removed');
      fetchDrivers();
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed'); }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) { toast.error('Name and phone required'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/drivers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name.trim(), phone: form.phone.trim(), email: form.email.trim() || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      toast.success('Driver added');
      setForm({ name: '', phone: '', email: '' });
      setShowModal(false);
      fetchDrivers();
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed'); }
    finally { setSaving(false); }
  };

  const isActive = (d: Driver) => d.status === 'available' || d.status === 'busy';

  return (
    <AdminLayout
      searchValue={searchTerm}
      onSearchChange={setSearchTerm}
      searchPlaceholder="Search drivers..."
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-gray-900">Drivers</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus size={16} />
          Add Driver
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      ) : drivers.length === 0 ? (
        <div className="text-center py-16">
          <Truck className="mx-auto h-10 w-10 text-gray-300 mb-3" />
          <p className="text-sm text-gray-500 mb-3">No drivers yet</p>
          <button
            onClick={() => setShowModal(true)}
            className="text-sm text-purple-600 font-medium hover:underline"
          >
            + Add your first driver
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {drivers.map(driver => {
            const active = isActive(driver);
            return (
              <div key={driver.id} className="bg-white rounded-xl border border-gray-200 px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${active ? 'bg-green-400' : 'bg-gray-300'}`} />
                    <div className="min-w-0">
                      <span className="font-semibold text-gray-900 text-sm">{driver.name}</span>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span>{driver.phone}</span>
                        {driver.email && <span>· {driver.email}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                      active
                        ? 'text-green-700 bg-green-50 border-green-200'
                        : 'text-gray-500 bg-gray-50 border-gray-200'
                    }`}>
                      {driver.status === 'available' ? 'Available' : driver.status === 'busy' ? 'Busy' : 'Offline'}
                    </span>
                    <a
                      href={`tel:${driver.phone}`}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      title="Call"
                    >
                      <Phone size={14} />
                    </a>
                    <button
                      onClick={() => handleToggle(driver.id, active)}
                      className={`text-xs px-2 py-1 rounded-md font-medium transition-colors ${
                        active
                          ? 'text-gray-600 bg-gray-100 hover:bg-gray-200'
                          : 'text-green-600 bg-green-50 hover:bg-green-100'
                      }`}
                    >
                      {active ? 'Set Offline' : 'Set Active'}
                    </button>
                    <button
                      onClick={() => handleDelete(driver.id)}
                      className="text-xs px-2 py-1 rounded-md font-medium text-red-500 bg-red-50 hover:bg-red-100 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl p-5 w-full max-w-sm mx-4" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Add Driver</h2>
            <form onSubmit={handleAdd} className="space-y-3">
              <input
                type="text"
                required
                placeholder="Full name"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <input
                type="tel"
                required
                placeholder="Phone number"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <input
                type="email"
                placeholder="Email (optional)"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => { setShowModal(false); setForm({ name: '', phone: '', email: '' }); }}
                  className="px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50" disabled={saving}>
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="px-3 py-1.5 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50">
                  {saving ? 'Adding...' : 'Add Driver'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
