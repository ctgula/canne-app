"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Phone, User, Loader2 } from 'lucide-react';

type Driver = {
  id: string;
  full_name: string;
  phone: string;
  is_active?: boolean;
  balance_cents?: number;
  status?: "active" | "busy" | "offline";
};

interface AssignDriverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (driverId: string) => Promise<void> | void;
}

export default function AssignDriverModal({ isOpen, onClose, onAssign }: AssignDriverModalProps) {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(false);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    const fetchDrivers = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/drivers?active=true`);
        const data = await res.json();
        setDrivers(data.drivers || []);
      } catch (e) {
        setDrivers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchDrivers();
  }, [isOpen]);

  if (!isOpen) return null;

  const filtered = drivers.filter(d => {
    const q = search.toLowerCase();
    return (
      d.full_name?.toLowerCase().includes(q) ||
      d.phone?.toLowerCase().includes(q)
    );
  });

  const handleAssign = async (id: string) => {
    setAssigningId(id);
    try {
      await onAssign(id);
      onClose();
    } finally {
      setAssigningId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-bold">Assign to Driver</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-4 space-y-3">
          <input
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Search drivers by name or phone"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />

          {loading ? (
            <div className="flex items-center justify-center py-10 text-gray-500"><Loader2 className="w-5 h-5 animate-spin mr-2"/> Loading drivers…</div>
          ) : filtered.length === 0 ? (
            <div className="text-center text-gray-500 py-10">No drivers found</div>
          ) : (
            <ul className="divide-y">
              {filtered.map(d => (
                <li key={d.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center"><User className="w-4 h-4"/></div>
                    <div className="min-w-0">
                      <div className="font-medium truncate">{d.full_name || 'Driver'}</div>
                      <div className="text-sm text-gray-500 truncate flex items-center gap-1"><Phone className="w-3 h-3"/>{d.phone || 'N/A'}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${d.is_active !== false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {d.is_active !== false ? 'Active' : 'Offline'}
                    </span>
                    <button
                      disabled={!!assigningId}
                      onClick={() => handleAssign(d.id)}
                      className="px-3 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
                    >
                      {assigningId === d.id ? 'Assigning…' : 'Assign'}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="p-4 border-t text-right">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border">Cancel</button>
        </div>
      </motion.div>
    </div>
  );
}
