"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, DollarSign, Clock, Zap, TrendingUp, Shield } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// Form validation
const driverSchema = z.object({
  name: z.string().min(2, 'Name required'),
  phone: z.string().regex(/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/, 'Valid phone required'),
  email: z.string().email('Valid email required'),
  availability: z.array(z.string()).min(1, 'Select at least one shift'),
  vehicleType: z.string().optional(),
  cashappHandle: z.string().optional(),
});

type DriverForm = z.infer<typeof driverSchema>;

export default function DriversPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const { control, handleSubmit, formState: { errors }, reset } = useForm<DriverForm>({
    resolver: zodResolver(driverSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      availability: [],
      vehicleType: '',
      cashappHandle: '',
    }
  });

  // Format phone as user types
  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length >= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    if (digits.length >= 3) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return digits;
  };

  const onSubmit = async (data: DriverForm) => {
    setIsSubmitting(true);
    
    try {
      const res = await fetch('/api/drivers/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message || 'Failed to submit application');
      }
      
      setShowSuccess(true);
      reset();
      toast.success('Application submitted! We\'ll contact you within 24 hours.', { duration: 5000 });
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Something went wrong. Please try again.';
      toast.error(msg, { duration: 5000 });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-purple-950/20 dark:to-gray-900">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-20 py-12 sm:py-20">
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16 sm:mb-24"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full text-purple-700 font-medium text-sm mb-6">
            <MapPin className="w-4 h-4" />
            <span>Washington DC</span>
          </div>
          
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6 leading-tight">
            <span className="bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Deliver with Cannè
            </span>
          </h2>
          
          <p className="text-xl sm:text-2xl text-gray-700 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Earn <span className="font-bold text-purple-600">$20–$30/hr</span> delivering premium cannabis. 
            Flexible hours, same-day pay, no restaurant waits.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#apply"
              className="px-8 py-4 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
            >
              Apply Now
            </a>
            <a
              href="sms:2028522281"
              className="px-8 py-4 bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl border-2 border-purple-200 dark:border-purple-700 hover:border-purple-300 transition-all"
            >
              📱 Text 202-852-2281
            </a>
          </div>
        </motion.section>

        {/* Stats Grid */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-16"
        >
          {[
            { icon: DollarSign, label: 'Per Delivery', value: '$8–12', color: 'from-pink-500 to-rose-500' },
            { icon: Clock, label: 'Flexible', value: '100%', color: 'from-purple-500 to-indigo-500' },
            { icon: Zap, label: 'Start Time', value: '24hrs', color: 'from-blue-500 to-cyan-500' },
            { icon: TrendingUp, label: 'Keep Tips', value: '100%', color: 'from-green-500 to-emerald-500' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              whileHover={{ scale: 1.05, y: -4 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-purple-100 dark:border-gray-700 text-center"
            >
              <div className={`w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-black bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </motion.section>

        {/* Benefits */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12 sm:mb-16"
        >
          <h3 className="text-3xl sm:text-4xl font-bold text-center mb-12">
            <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Why Drive with Us?
            </span>
          </h3>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                emoji: '💰',
                title: 'Great Earnings',
                desc: '$8 base + $4 per extra stop. Average $20–30/hr with tips.'
              },
              {
                emoji: '⚡',
                title: 'Quick & Easy',
                desc: 'No restaurant waits. Simple drop-offs. In and out fast.'
              },
              {
                emoji: '📅',
                title: 'Your Schedule',
                desc: 'Choose your shifts. Work when it fits your life.'
              },
              {
                emoji: '💳',
                title: 'Same-Day Pay',
                desc: 'Get paid via Cash App immediately after deliveries.'
              },
              {
                emoji: '🚗',
                title: 'Any Vehicle',
                desc: 'Car, bike, scooter, or on foot. Whatever works for you.'
              },
              {
                emoji: '🚀',
                title: 'Fast Start',
                desc: 'Apply today, start tomorrow. 24-hour approval process.'
              },
            ].map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                whileHover={{ y: -4 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-purple-100 dark:border-gray-700 hover:shadow-xl transition-all"
              >
                <div className="text-4xl mb-4">{benefit.emoji}</div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{benefit.title}</h4>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{benefit.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Application Form */}
        <motion.section
          id="apply"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="max-w-2xl mx-auto"
        >
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 sm:p-12 shadow-2xl border border-purple-100 dark:border-gray-700">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold mb-2">
                <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                  Apply Now
                </span>
              </h3>
              <p className="text-gray-600 dark:text-gray-400">We'll get back to you within 24 hours</p>
            </div>

            {showSuccess ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎉</div>
                <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Application Submitted!</h4>
                <p className="text-gray-600 dark:text-gray-400">Check your email and phone for next steps.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Name & Phone */}
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Full Name *
                    </label>
                    <Controller
                      name="name"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          placeholder="John Doe"
                          autoComplete="name"
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                        />
                      )}
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Phone Number *
                    </label>
                    <Controller
                      name="phone"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="tel"
                          placeholder="(202) 555-1234"
                          autoComplete="tel"
                          maxLength={14}
                          onChange={(e) => field.onChange(formatPhone(e.target.value))}
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                        />
                      )}
                    />
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Email Address *
                  </label>
                  <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="email"
                        placeholder="john@example.com"
                        autoComplete="email"
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                      />
                    )}
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                </div>

                {/* Availability */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    Availability (select all that apply) *
                  </label>
                  <Controller
                    name="availability"
                    control={control}
                    render={({ field }) => (
                      <div className="grid sm:grid-cols-2 gap-3">
                        {['Morning (8am-11am)', 'Lunch (11am-3pm)', 'Dinner (5pm-10pm)', 'Late Night (10pm-2am)'].map((shift) => (
                          <label key={shift} className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${field.value?.includes(shift) ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30' : 'border-gray-200 dark:border-gray-600 hover:border-purple-300'}`}>
                            <input
                              type="checkbox"
                              value={shift}
                              checked={field.value?.includes(shift)}
                              onChange={(e) => {
                                const newValue = e.target.checked
                                  ? [...(field.value || []), shift]
                                  : field.value?.filter((v) => v !== shift) || [];
                                field.onChange(newValue);
                              }}
                              className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-200"
                            />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{shift}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  />
                  {errors.availability && <p className="text-red-500 text-sm mt-1">{errors.availability.message}</p>}
                </div>

                {/* Vehicle Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Vehicle Type (optional)
                  </label>
                  <Controller
                    name="vehicleType"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                      >
                        <option value="">Select vehicle type</option>
                        <option value="car">Car</option>
                        <option value="bike">Bike</option>
                        <option value="scooter">Scooter</option>
                        <option value="foot">On Foot</option>
                      </select>
                    )}
                  />
                </div>

                {/* CashApp */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Cash App Handle (optional)
                  </label>
                  <Controller
                    name="cashappHandle"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        placeholder="$YourCashApp"
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                      />
                    )}
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </form>
            )}
          </div>
        </motion.section>

        {/* Footer CTA */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-12 sm:mt-16 py-12 px-4 bg-gradient-to-r from-pink-100 via-purple-100 to-blue-100 dark:from-purple-900/30 dark:via-indigo-900/30 dark:to-blue-900/30 rounded-3xl"
        >
          <h3 className="text-2xl sm:text-3xl font-bold mb-4">
            <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Questions?
            </span>
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-6 text-lg">
            Text us at <a href="sms:2028522281" className="font-bold text-purple-600 hover:text-purple-700 dark:text-purple-400">202-852-2281</a>
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Discrete. Local. Reliable.
          </p>
        </motion.section>
      </main>

      <Footer />
    </div>
  );
}
