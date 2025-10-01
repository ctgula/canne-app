"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { MapPin, Phone, DollarSign, Package, Clock, User, Navigation, ExternalLink, RefreshCw, Loader2 } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast, { Toaster } from 'react-hot-toast';

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

// Form validation schema
const driverApplicationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().regex(/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/, 'Please enter a valid phone number'),
  email: z.string().email('Please enter a valid email address'),
  availability: z.array(z.string()).min(1, 'Please select at least one availability option'),
  vehicleType: z.string().optional(),
  cashappHandle: z.string().optional(),
  about: z.string().max(500, 'Description must be 500 characters or less').optional()
});

type DriverApplicationForm = z.infer<typeof driverApplicationSchema>;

// Animation constants - Apple-style spring physics
const springTransition = {
  type: "spring" as const,
  stiffness: 260,
  damping: 20
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: springTransition
  }
};

export default function DriversPage() {
  const prefersReducedMotion = useReducedMotion();
  const [view, setView] = useState<'application' | 'dashboard'>('application');
  const [driverId, setDriverId] = useState<string>('');
  const [assignedOrders, setAssignedOrders] = useState<AssignedOrder[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm<DriverApplicationForm>({
    resolver: zodResolver(driverApplicationSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      availability: [],
      vehicleType: '',
      cashappHandle: '',
      about: ''
    }
  });

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
        .from("cashapp_payments")
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

  const onSubmit = async (data: DriverApplicationForm) => {
    setIsSubmitting(true);
    setShowSuccess(false);

    try {
      const response = await fetch('/api/drivers/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to submit application');
      }

      // Success
      setShowSuccess(true);
      reset();
      toast.success('Application submitted successfully! We\'ll contact you within 24 hours.');
      
      // Scroll to success message
      setTimeout(() => {
        document.getElementById('success-message')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);

    } catch (error) {
      console.error('Application submission error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <style jsx>{`
        @media (min-width: 992px) {
          .driver-grid {
            display: grid;
            grid-template-columns: 7fr 5fr;
            gap: 4rem;
            overflow-x: hidden;
          }
          .position-card {
            position: sticky;
            top: 120px;
            max-width: 420px;
          }
          .driver-infobar {
            position: sticky;
            top: 84px;
            z-index: 5;
          }
        }
        .benefits-wrapper {
          overflow: hidden;
        }
        /* AA contrast fix for purple text on light backgrounds */
        .contrast-purple {
          color: #2D274C;
        }
        /* Infographic Bar */
        .driver-infobar {
          display: flex;
          flex-wrap: wrap;
          gap: 1.2rem;
          padding: 1.2rem 1.6rem;
          margin-bottom: 2.4rem;
          border-radius: 16px;
          background: linear-gradient(135deg, #ffffff 0%, #faf5ff 100%);
          box-shadow: 0 8px 32px rgba(139, 92, 246, 0.12), 0 2px 8px rgba(0, 0, 0, 0.04);
          border: 1px solid rgba(139, 92, 246, 0.1);
        }
        .driver-infobar li {
          list-style: none;
          display: flex;
          flex-direction: column;
          align-items: center;
          min-width: 86px;
        }
        .driver-infobar span {
          font-size: 1.5rem;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
        }
        .driver-infobar small {
          font-size: .72rem;
          color: #888;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .driver-infobar strong {
          font-size: .95rem;
          color: #111;
          margin-top: 2px;
          font-weight: 700;
        }
        /* Gradient text animation */
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient-shift 8s ease infinite;
        }
      `}</style>
      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-12">
        {/* Hero Section */}
        <header className="mb-16">
          {/* Top Bar */}
          <div className="flex items-center mb-12">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <span className="text-4xl">🍦</span>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                Cannè
              </h1>
            </motion.div>
            
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={handleDriverLogin}
              className="ml-auto px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full text-sm font-medium hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
            >
              Driver Login
            </motion.button>
          </div>

          {/* Main Hero Content - Desktop Grid */}
          <div className="driver-grid">
            {/* Left Column */}
            <div className="space-y-8">
              <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="space-y-4"
              >
                <motion.div 
                  variants={itemVariants}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm contrast-purple rounded-full text-sm font-medium shadow-sm"
                >
                  <MapPin className="w-4 h-4" />
                  Washington DC
                </motion.div>
                <motion.h2 
                  variants={itemVariants}
                  className="text-5xl sm:text-6xl lg:text-7xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent leading-[0.95] animate-gradient"
                  style={{ letterSpacing: '-0.025em' }}
                >
                  Join the Cannè<br />Delivery Team
                </motion.h2>
                <motion.p 
                  variants={itemVariants}
                  className="text-xl sm:text-2xl text-gray-600 max-w-3xl leading-relaxed font-medium"
                >
                  Earn <span className="text-purple-600 font-bold">$20–$30/hr</span> with flexible shifts. No restaurant waits, just quick deliveries across DC.
                </motion.p>
              </motion.div>

              {/* Stats Bar */}
              <motion.div 
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="grid grid-cols-2 sm:grid-cols-4 gap-4"
              >
                <motion.div 
                  variants={itemVariants}
                  whileHover={!prefersReducedMotion ? { scale: 1.05, y: -4 } : {}}
                  className="bg-gradient-to-br from-white to-purple-50 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-purple-100 transition-all hover:shadow-2xl hover:border-purple-300"
                >
                  <div className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">$8–12</div>
                  <div className="text-xs sm:text-sm text-gray-600 mt-1 font-semibold">Per delivery</div>
                </motion.div>
                <motion.div 
                  variants={itemVariants}
                  whileHover={!prefersReducedMotion ? { scale: 1.05, y: -4 } : {}}
                  className="bg-gradient-to-br from-white to-purple-50 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-purple-100 transition-all hover:shadow-2xl hover:border-purple-300"
                >
                  <div className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">100%</div>
                  <div className="text-xs sm:text-sm text-gray-600 mt-1 font-semibold">Keep tips</div>
                </motion.div>
                <motion.div 
                  variants={itemVariants}
                  whileHover={!prefersReducedMotion ? { scale: 1.05, y: -4 } : {}}
                  className="bg-gradient-to-br from-white to-purple-50 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-purple-100 transition-all hover:shadow-2xl hover:border-purple-300"
                >
                  <div className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">4</div>
                  <div className="text-xs sm:text-sm text-gray-600 mt-1 font-semibold">Shift options</div>
                </motion.div>
                <motion.div 
                  variants={itemVariants}
                  whileHover={!prefersReducedMotion ? { scale: 1.05, y: -4 } : {}}
                  className="bg-gradient-to-br from-white to-green-50 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-green-100 transition-all hover:shadow-2xl hover:border-green-300"
                >
                  <div className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">24h</div>
                  <div className="text-xs sm:text-sm text-gray-600 mt-1 font-semibold">Response time</div>
                </motion.div>
              </motion.div>

              {/* Feature Cards */}
              <motion.div 
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="benefits-wrapper grid sm:grid-cols-2 lg:grid-cols-4 gap-4"
              >
                <motion.div 
                  variants={itemVariants}
                  whileHover={!prefersReducedMotion ? { scale: 1.03, y: -6, rotate: -1 } : {}}
                  className="p-6 bg-gradient-to-br from-white via-purple-50/30 to-white backdrop-blur-sm rounded-2xl shadow-xl border-2 border-purple-200 transition-all hover:shadow-2xl hover:border-purple-400"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold contrast-purple mb-2">Great Pay</h3>
                  <p className="text-gray-700 text-sm leading-relaxed font-medium">
                    $8 base + $4 per extra stop. Avg $20–30/hr.
                  </p>
                </motion.div>

                <motion.div 
                  variants={itemVariants}
                  whileHover={!prefersReducedMotion ? { scale: 1.03, y: -6, rotate: 1 } : {}}
                  className="p-6 bg-gradient-to-br from-white via-pink-50/30 to-white backdrop-blur-sm rounded-2xl shadow-xl border-2 border-pink-200 transition-all hover:shadow-2xl hover:border-pink-400"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-500 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold contrast-purple mb-2">Flexible Hours</h3>
                  <p className="text-gray-700 text-sm leading-relaxed font-medium">
                    Choose your shifts. Work when it fits your schedule.
                  </p>
                </motion.div>

                <motion.div 
                  variants={itemVariants}
                  whileHover={!prefersReducedMotion ? { scale: 1.03, y: -6, rotate: -1 } : {}}
                  className="p-6 bg-gradient-to-br from-white via-blue-50/30 to-white backdrop-blur-sm rounded-2xl shadow-xl border-2 border-blue-200 transition-all hover:shadow-2xl hover:border-blue-400"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold contrast-purple mb-2">Simple Deliveries</h3>
                  <p className="text-gray-700 text-sm leading-relaxed font-medium">
                    No restaurant waits. Quick, discrete drop-offs in DC.
                  </p>
                </motion.div>

                <motion.div 
                  variants={itemVariants}
                  whileHover={!prefersReducedMotion ? { scale: 1.03, y: -6, rotate: 1 } : {}}
                  className="p-6 bg-gradient-to-br from-white via-purple-50/30 to-white backdrop-blur-sm rounded-2xl shadow-xl border-2 border-purple-200 transition-all hover:shadow-2xl hover:border-purple-400"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-500 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold contrast-purple mb-2">Fast Onboarding</h3>
                  <p className="text-gray-700 text-sm leading-relaxed font-medium">
                    Apply in minutes. 24-hour response time.
                  </p>
                </motion.div>
              </motion.div>
            </div>

            {/* Right Column - Position Details (Sticky) */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="position-card"
            >
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-purple-100 shadow-lg">
                <h3 className="text-lg font-bold contrast-purple mb-4">Position Details</h3>
                <div className="grid gap-4 text-sm">
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">📍 Location</p>
                    <p className="text-gray-600">Washington, DC metro area</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">⏰ Schedule</p>
                    <p className="text-gray-600">Flexible - Choose your shifts</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">💰 Pay Structure</p>
                    <p className="text-gray-600">$8 base + $4 per extra stop</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">🚗 Requirements</p>
                    <p className="text-gray-600">Car, bike, scooter, or on foot</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">📱 Payment</p>
                    <p className="text-gray-600">Cash App - Same day payouts</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">⚡ Start Time</p>
                    <p className="text-gray-600">24-48 hours after approval</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </header>

        {/* Application Form */}
        <section className="mx-auto" style={{ maxWidth: '680px' }}>
          {/* QUICK INFO BAR */}
          <ul className="driver-infobar">
            <li><span>💸</span><small>Pay</small><strong>$8 + $4/stop</strong></li>
            <li><span>🕒</span><small>Hours</small><strong>Flexible</strong></li>
            <li><span>🛵</span><small>Vehicle</small><strong>Any</strong></li>
            <li><span>💰</span><small>Payouts</small><strong>Same-day</strong></li>
            <li><span>⚡</span><small>Start</small><strong>24 hrs</strong></li>
          </ul>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 md:p-10 border border-purple-100 shadow-2xl"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold contrast-purple mb-2">Apply Now</h2>
              <p className="text-gray-700">We'll reach out within 24 hours</p>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 text-left">
              {/* Name & Phone - Two Column on Desktop */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Name Field */}
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-900">
                    Full Name *
                  </label>
                  <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        id="name"
                        type="text"
                        placeholder="First & Last Name"
                        aria-invalid={errors.name ? 'true' : 'false'}
                        aria-describedby={errors.name ? 'name-error' : undefined}
                        className={`w-full rounded-xl border-2 px-4 py-3 text-lg transition-colors focus:outline-none ${
                          errors.name
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                            : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500/20'
                        }`}
                      />
                    )}
                  />
                  {errors.name && (
                    <p id="name-error" className="text-sm text-red-600" role="alert">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Phone Field */}
                <div className="space-y-2">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-900">
                    Phone Number *
                  </label>
                  <Controller
                    name="phone"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        id="phone"
                        type="tel"
                        placeholder="(555) 123-4567"
                        aria-invalid={errors.phone ? 'true' : 'false'}
                        aria-describedby={errors.phone ? 'phone-error' : undefined}
                        className={`w-full rounded-xl border-2 px-4 py-3 text-lg transition-colors focus:outline-none ${
                          errors.phone
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                            : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500/20'
                        }`}
                      />
                    )}
                  />
                  {errors.phone && (
                    <p id="phone-error" className="text-sm text-red-600" role="alert">
                      {errors.phone.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-900">
                  Email Address *
                </label>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      aria-invalid={errors.email ? 'true' : 'false'}
                      aria-describedby={errors.email ? 'email-error' : undefined}
                      className={`w-full rounded-xl border-2 px-4 py-3 text-lg transition-colors focus:outline-none ${
                        errors.email
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                          : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500/20'
                      }`}
                    />
                  )}
                />
                {errors.email && (
                  <p id="email-error" className="text-sm text-red-600" role="alert">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Availability Checkboxes */}
              <div className="space-y-3">
                <fieldset>
                  <legend className="text-sm font-medium text-gray-900 mb-4">
                    Availability (select at least one) *
                  </legend>
                  <Controller
                    name="availability"
                    control={control}
                    render={({ field }) => (
                      <div className="space-y-3" role="group" aria-labelledby="availability-legend">
                        {[
                          { value: 'morning', label: 'Morning (8am - 11am)', icon: '🌅' },
                          { value: 'lunch', label: 'Lunch (11am - 3pm)', icon: '☀️' },
                          { value: 'dinner', label: 'Dinner (5pm - 10pm)', icon: '🌆' },
                          { value: 'late-night', label: 'Late-night (10pm - 2am)', icon: '🌙' }
                        ].map((option) => (
                          <div key={option.value} className="relative">
                            <input
                              id={`availability-${option.value}`}
                              type="checkbox"
                              value={option.value}
                              checked={field.value.includes(option.value)}
                              onChange={(e) => {
                                const updatedValue = e.target.checked
                                  ? [...field.value, option.value]
                                  : field.value.filter((v) => v !== option.value);
                                field.onChange(updatedValue);
                              }}
                              className="peer sr-only"
                            />
                            <label
                              htmlFor={`availability-${option.value}`}
                              className="block rounded-xl border-2 border-gray-300 p-3 transition cursor-pointer hover:border-purple-400 hover:bg-purple-50 peer-checked:bg-gradient-to-r peer-checked:from-purple-600 peer-checked:to-pink-600 peer-checked:text-white peer-checked:border-purple-600 peer-focus:ring-2 peer-focus:ring-purple-200"
                            >
                              <span className="text-xl mr-2">{option.icon}</span>
                              <span>{option.label}</span>
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                  />
                  {errors.availability && (
                    <p className="text-sm text-red-600 mt-3" role="alert">
                      {errors.availability.message}
                    </p>
                  )}
                </fieldset>
              </div>

              {/* Vehicle Type */}
              <div className="space-y-2">
                <label htmlFor="vehicleType" className="block text-sm font-medium text-gray-900">
                  Vehicle Type (optional)
                </label>
                <Controller
                  name="vehicleType"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      id="vehicleType"
                      className="w-full rounded-xl border-2 border-gray-300 px-4 py-3 text-lg focus:border-purple-500 focus:outline-none focus:ring-purple-500/20 transition-colors"
                    >
                      <option value="">Select vehicle type</option>
                      <option value="car">Car</option>
                      <option value="bike">Bike</option>
                      <option value="scooter">Scooter</option>
                      <option value="on-foot">On Foot</option>
                    </select>
                  )}
                />
              </div>

              {/* Cash App Handle */}
              <div className="space-y-2">
                <label htmlFor="cashappHandle" className="block text-sm font-medium text-gray-900">
                  Cash App Handle (optional)
                </label>
                <Controller
                  name="cashappHandle"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      id="cashappHandle"
                      type="text"
                      placeholder="$YourCashTag"
                      className="w-full rounded-xl border-2 border-gray-300 px-4 py-3 text-lg focus:border-purple-500 focus:outline-none focus:ring-purple-500/20 transition-colors"
                    />
                  )}
                />
                <p className="text-sm text-gray-600">For future payouts (can be added later)</p>
              </div>

              {/* About Field */}
              <div className="space-y-2">
                <label htmlFor="about" className="block text-sm font-medium text-gray-900">
                  Tell us about yourself (optional)
                </label>
                <Controller
                  name="about"
                  control={control}
                  render={({ field }) => (
                    <textarea
                      {...field}
                      id="about"
                      rows={4}
                      placeholder="Tell us about your delivery experience and why you'd be great for this role..."
                      aria-invalid={errors.about ? 'true' : 'false'}
                      aria-describedby={errors.about ? 'about-error' : 'about-help'}
                      className={`w-full rounded-xl border-2 px-4 py-3 text-lg transition-colors focus:outline-none resize-vertical ${
                        errors.about
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                          : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500/20'
                      }`}
                    />
                  )}
                />
                <p id="about-help" className="text-sm text-gray-600">
                  {watch('about')?.length || 0}/500 characters
                </p>
                {errors.about && (
                  <p id="about-error" className="text-sm text-red-600" role="alert">
                    {errors.about.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                disabled={isSubmitting}
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-400 text-white py-4 rounded-xl font-semibold text-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Application'
                )}
              </button>
            </form>
          </motion.div>

          {/* Success Message */}
          {showSuccess && (
            <motion.div
              id="success-message"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 p-6 bg-green-50 border border-green-200 rounded-2xl shadow-sm"
              role="alert"
              aria-live="polite"
            >
              <div className="text-center">
                <div className="text-4xl mb-4">🎉</div>
                <h3 className="text-xl font-semibold text-green-800 mb-2">
                  Application Submitted Successfully!
                </h3>
                <p className="text-green-700 text-lg">
                  Thanks for your interest in joining the Cannè team! We'll review your application and contact you within 24 hours via text or email.
                </p>
              </div>
            </motion.div>
          )}

          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
        </section>
      </main>
    </div>
  );
}
