"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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

export default function DriversPage() {
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white">
      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-12">
        {/* Hero Section */}
        <header className="space-y-8 mb-12">
          {/* Top Row: Logo + Driver Login Button */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Logo - Left aligned desktop, centered mobile */}
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <span className="text-4xl sm:text-5xl">🍦</span>
              <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">Cannè</h1>
            </div>
            
            {/* Driver Login Button - Right aligned desktop, full width mobile */}
            <button
              onClick={handleDriverLogin}
              className="w-full md:w-auto px-6 py-3 bg-white border-2 border-purple-600 text-purple-600 rounded-full font-semibold hover:bg-purple-600 hover:text-white transition-all duration-200 shadow-md hover:shadow-lg inline-flex items-center justify-center gap-2"
            >
              <User className="w-4 h-4" />
              Already a driver? Access dashboard
            </button>
          </div>

          {/* Hero Content: Two Column Layout */}
          <div className="grid md:grid-cols-12 md:gap-6 gap-4">
            {/* Left Column: Headline Stack */}
            <div className="md:col-span-8 space-y-4 text-center md:text-left">
              {/* Headline */}
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                Cannè Delivery Team
              </h2>
              
              {/* Location Pill - Right aligned desktop, centered mobile */}
              <div className="flex justify-center md:justify-start">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                  <MapPin className="w-4 h-4" />
                  Washington DC Only
                </div>
              </div>
              
              {/* Subheadline */}
              <p className="text-lg text-gray-600">
                Fill out the form below and we'll reach out within 24 hours
              </p>
            </div>

            {/* Right Column: Keep Your Tips Card */}
            <div className="md:col-span-4 mt-6 md:mt-0">
              <div className="relative max-w-sm mx-auto md:mx-0 bg-white rounded-xl shadow-md p-4 border border-green-100">
                <div className="text-3xl mb-2">🎯</div>
                <h3 className="font-bold text-lg text-gray-900 mb-1">Keep Your Tips</h3>
                <p className="text-sm text-gray-600">100% of tips are yours</p>
                <p className="text-xs text-green-600 font-semibold mt-2">No hidden fees</p>
              </div>
            </div>
          </div>
        </header>

        {/* Application Form */}
        <section className="mx-auto max-w-2xl">
          <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="max-w-xl mx-auto space-y-6 text-left">
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
                              className="block rounded-xl border-2 border-gray-300 p-3 transition cursor-pointer hover:border-gray-400 hover:bg-gray-50 peer-checked:bg-green-600 peer-checked:text-white peer-checked:border-green-600 peer-focus:ring-2 peer-focus:ring-green-200"
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
          </div>

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
