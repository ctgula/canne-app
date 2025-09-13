"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, DollarSign, Package, Clock, User, Navigation, ExternalLink, RefreshCw } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface AssignedOrder {
  id: string;
  short_code: string;
  customer_phone: string;
  amount_cents: number;
  status: string;
  delivery_address_line1?: string;
  delivery_address_line2?: string;
  delivery_city?: string;
  delivery_state?: string;
  delivery_zip?: string;
  delivery_notes?: string;
  created_at: string;
  payout_amount?: number;
}

interface Payout {
  id: string;
  amount_cents: number;
  status: 'queued' | 'paid';
  order_id: string;
  created_at: string;
}

export default function DriversPage() {
  const [view, setView] = useState<'application' | 'dashboard'>('application');
  const [driverId, setDriverId] = useState<string>('');
  const [assignedOrders, setAssignedOrders] = useState<AssignedOrder[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  useEffect(() => {
    // Check if driver is logged in (simple localStorage check)
    const savedDriverId = localStorage.getItem('driverId');
    if (savedDriverId) {
      setDriverId(savedDriverId);
      setView('dashboard');
      fetchDriverData(savedDriverId);
    }
  }, []);

  const fetchDriverData = async (id: string) => {
    setLoading(true);
    try {
      // Fetch assigned orders
      const { data: orders, error: ordersError } = await supabase
        .from("cashapp_orders")
        .select("*")
        .eq("driver_id", id)
        .in("status", ["assigned", "delivered"]);

      if (!ordersError && orders) {
        setAssignedOrders(orders);
      }

      // Fetch payouts
      const { data: payoutData, error: payoutError } = await supabase
        .from("payouts")
        .select("*")
        .eq("driver_id", id);

      if (!payoutError && payoutData) {
        setPayouts(payoutData);
      }
    } catch (error) {
      console.error('Error fetching driver data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDriverLogin = () => {
    const id = prompt('Enter your Driver ID:');
    if (id) {
      localStorage.setItem('driverId', id);
      setDriverId(id);
      setView('dashboard');
      fetchDriverData(id);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('driverId');
    setDriverId('');
    setView('application');
    setAssignedOrders([]);
    setPayouts([]);
  };

  const queuedPayouts = payouts
    .filter(p => p.status === 'queued')
    .reduce((sum, p) => sum + p.amount_cents, 0);

  const paidOut = payouts
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount_cents, 0);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setStatus("idle");

    const form = new FormData(e.currentTarget);
    const availability = form.getAll("availability") as string[];
    
    // Validate that at least one availability option is selected
    if (availability.length === 0) {
      setLoading(false);
      setStatus("error");
      return;
    }

    const payload = {
      full_name: form.get("full_name") as string,
      phone: form.get("phone") as string,
      email: form.get("email") as string,
      availability: availability,
      experience: form.get("experience") as string || null,
    };

    try {
      const { data, error } = await supabase.from("drivers").insert([payload]).select();
      
      if (error) {
        console.error("Driver application error:", error);
        setStatus("error");
      } else {
        setStatus("success");
        (e.target as HTMLFormElement).reset();
        // Show driver ID for future login
        if (data && data[0]) {
          alert(`Application submitted! Your Driver ID is: ${data[0].id}\n\nSave this ID to access your driver dashboard.`);
        }
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setStatus("error");
    }
    
    setLoading(false);
  }

  if (view === 'dashboard') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Driver Dashboard</h1>
              <p className="text-gray-600">Driver ID: {driverId}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => fetchDriverData(driverId)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Payout Summary */}
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Earnings Summary</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-xl">
                <p className="text-2xl font-bold text-green-600">${queuedPayouts.toFixed(2)}</p>
                <p className="text-sm text-green-700">Queued Payouts</p>
                <p className="text-xs text-green-600 mt-1">$8 base + $4 per extra</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-xl">
                <p className="text-2xl font-bold text-blue-600">${paidOut.toFixed(2)}</p>
                <p className="text-sm text-blue-700">Total Paid</p>
              </div>
            </div>
          </div>

          {/* Assigned Orders */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Your Orders</h2>
            
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
              </div>
            ) : assignedOrders.length > 0 ? (
              assignedOrders.map((order) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <Package className="w-5 h-5 text-purple-600" />
                        </div>
                        {order.status === 'assigned' && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                            <span className="text-xs text-white font-bold">!</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">{order.short_code}</h3>
                          {order.status === 'assigned' && (
                            <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full font-medium">
                              New Job
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{order.customer_phone}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">${(order.amount_cents / 100).toFixed(2)}</p>
                      <p className="text-xs text-gray-500">Payout: ${order.payout_amount?.toFixed(2) || '8.00'}</p>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    Order placed: {new Date(order.created_at).toLocaleString()}
                  </div>

                  <div className="space-y-2 text-gray-600">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      <span>{order.customer_phone}</span>
                    </div>
                    
                    {order.delivery_address_line1 && (
                      <div className="flex items-start gap-3 mb-4">
                        <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">{order.delivery_address_line1}</p>
                          {order.delivery_address_line2 && (
                            <p className="text-sm text-gray-600">{order.delivery_address_line2}</p>
                          )}
                          <p className="text-sm text-gray-600">
                            {order.delivery_city}, {order.delivery_state} {order.delivery_zip}
                          </p>
                          <div className="flex gap-2 mt-2">
                            <a
                              href={`geo:0,0?q=${encodeURIComponent(`${order.delivery_address_line1}, ${order.delivery_city}, ${order.delivery_state} ${order.delivery_zip}`)}`}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full hover:bg-blue-200 transition-colors"
                            >
                              <Navigation className="w-3 h-3" />
                              Navigate
                            </a>
                            <a
                              href={`https://maps.google.com/maps?q=${encodeURIComponent(`${order.delivery_address_line1}, ${order.delivery_city}, ${order.delivery_state} ${order.delivery_zip}`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full hover:bg-green-200 transition-colors"
                            >
                              <ExternalLink className="w-3 h-3" />
                              Google Maps
                            </a>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No orders assigned yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <main className="mx-auto max-w-2xl px-6 py-12 space-y-12">
        {/* Hero Section */}
        <header className="text-center space-y-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-4xl">🍦</span>
            <h1 className="text-4xl font-bold text-black">Cannè</h1>
          </div>
          <h2 className="text-3xl font-bold text-black leading-tight">
            🚴 Join the Cannè Delivery Team — DC Only 🚴‍♂️
          </h2>
          
          {/* Benefits List */}
          <div className="bg-gray-50 rounded-lg p-6 mt-8">
            <ul className="text-left list-disc list-inside text-gray-800 space-y-3 text-lg">
              <li><strong>Earn $20–$30/hr</strong> active time</li>
              <li>Paid per order: <strong className="text-green-600">$8 first stop, +$4 each extra stop</strong></li>
              <li><strong>Keep 100% of your tips</strong></li>
              <li>No restaurant waits — only quick, discrete drop-offs inside DC</li>
              <li>Flexible shifts (lunch, dinner, late-night)</li>
              <li>Fast onboarding process</li>
            </ul>
          </div>
        </header>

        {/* Driver Login Option */}
        <div className="text-center">
          <button
            onClick={handleDriverLogin}
            className="mb-8 px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors"
          >
            Already a driver? Access Dashboard
          </button>
        </div>

        {/* Call to Action */}
        <section className="text-center">
          <h3 className="text-2xl font-semibold text-black mb-8">
            Fill out the form below to apply.
          </h3>

          {/* Application Form */}
          <form onSubmit={handleSubmit} className="space-y-6 text-left">
            <div>
              <input
                required
                name="full_name"
                type="text"
                placeholder="First & LAST Name"
                className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-lg focus:border-green-500 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <input
                required
                type="tel"
                name="phone"
                placeholder="Phone Number"
                className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-lg focus:border-green-500 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <input
                required
                type="email"
                name="email"
                placeholder="Email"
                className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-lg focus:border-green-500 focus:outline-none transition-colors"
              />
            </div>

            <fieldset className="space-y-3">
              <legend className="font-semibold text-lg text-black mb-3">
                Availability (select at least one) *
              </legend>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="availability"
                  value="Lunch"
                  className="w-5 h-5 text-green-600 border-2 border-gray-300 rounded focus:ring-green-500"
                />
                <span className="text-lg">Lunch (11am - 3pm)</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="availability"
                  value="Dinner"
                  className="w-5 h-5 text-green-600 border-2 border-gray-300 rounded focus:ring-green-500"
                />
                <span className="text-lg">Dinner (5pm - 10pm)</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="availability"
                  value="Late-night"
                  className="w-5 h-5 text-green-600 border-2 border-gray-300 rounded focus:ring-green-500"
                />
                <span className="text-lg">Late-night (10pm - 2am)</span>
              </label>
            </fieldset>

            <div>
              <textarea
                name="experience"
                placeholder="Tell us about your delivery experience, vehicle type, and why you'd be great for this role (optional)"
                rows={4}
                className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-lg focus:border-green-500 focus:outline-none transition-colors resize-vertical"
              />
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-4 rounded-lg font-semibold text-lg transition-colors"
            >
              {loading ? "Submitting..." : "Submit Application"}
            </button>
          </form>

          {/* Status Messages */}
          {status === "success" && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-lg font-medium">
                ✅ Thanks! We'll be in touch shortly.
              </p>
            </div>
          )}
          
          {status === "error" && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-lg font-medium">
                ❌ Something went wrong. Please make sure all required fields are filled out and try again.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
