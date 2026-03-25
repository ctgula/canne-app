'use client';

import React, { useEffect, useState, lazy, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import { motion, Variants, useScroll, useTransform } from 'framer-motion';
import { Brush, CreditCard, Package, Sparkles, ArrowDown, Star, Shield, Zap, MapPin } from 'lucide-react';

// Lazy load heavy components for better performance
const ProductsPresenter = lazy(() => import('@/components/ProductsPresenter'));
const Footer = lazy(() => import('@/components/Footer'));

// Import loading and error components
import LoadingSpinner, { ProductsGridSkeleton } from '@/components/LoadingSpinner';
import ErrorBoundary from '@/components/ErrorBoundary';

function DropAlertsSection() {
  const [email, setEmail] = React.useState('');
  const [status, setStatus] = React.useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setMessage(data.message || 'You\'re on the list!');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong');
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  };

  return (
    <section className="py-16 md:py-20 bg-gradient-to-br from-pink-500 via-purple-600 to-indigo-600">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 rounded-full text-white text-sm font-medium mb-4">
            <Zap className="w-4 h-4" />
            Drop Alerts
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Get notified on new drops
          </h2>
          <p className="text-white/80 text-lg mb-8">
            Be the first to know when new art tiers and limited collections drop.
          </p>

          {status === 'success' ? (
            <div className="inline-flex items-center gap-2 bg-white/20 text-white px-6 py-3 rounded-xl font-medium">
              <Star className="w-5 h-5" />
              {message}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="flex-1 px-4 py-3 rounded-xl bg-white/95 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="px-6 py-3 bg-white text-purple-600 font-semibold rounded-xl hover:bg-white/90 disabled:opacity-60 transition-all whitespace-nowrap"
              >
                {status === 'loading' ? 'Signing up...' : 'Notify Me'}
              </button>
            </form>
          )}
          {status === 'error' && (
            <p className="text-red-200 text-sm mt-2">{message}</p>
          )}
        </motion.div>
      </div>
    </section>
  );
}

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, -150]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const scrollToCollection = () => {
    const element = document.getElementById('collection');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-pink-50/10 to-purple-50/20 dark:from-gray-900 dark:via-purple-900/10 dark:to-indigo-900/20">
      <Header scrollToCollection={scrollToCollection} />
      <main className="overflow-x-hidden pt-16">
        {/* Launch Zone Announcement Banner */}
        <div className="relative z-40 bg-gray-950 text-white">
          <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-center gap-2.5">
            <span className="text-amber-400 flex-shrink-0">⏸</span>
            <p className="text-xs sm:text-sm font-medium tracking-wide">
              Orders are temporarily paused
              <span className="hidden sm:inline text-white/60"> — </span>
              <span className="hidden sm:inline text-white/80">we&apos;re handling some updates and will be back very soon</span>
            </p>
            <span className="hidden md:inline-flex items-center px-2 py-0.5 bg-amber-500/20 border border-amber-500/30 rounded-full text-amber-300 text-xs font-medium">Coming Soon</span>
          </div>
        </div>

        {/* Hero Section - Mobile Optimized */}
        <section className="relative min-h-[calc(100dvh-4rem)] flex items-center justify-center px-4">
          {/* Lightweight Background - Static for Performance */}
          <div className="absolute inset-0 bg-gradient-to-br from-pink-50/30 via-purple-50/20 to-transparent dark:from-pink-900/20 dark:via-purple-900/15" />
          
          {/* Subtle Static Decoration */}
          <div className="absolute top-1/4 right-1/4 w-32 h-32 md:w-64 md:h-64 bg-gradient-to-br from-pink-200/20 to-purple-200/20 rounded-full blur-xl dark:from-pink-800/20 dark:to-purple-800/20" />
          <div className="absolute bottom-1/4 left-1/4 w-24 h-24 md:w-48 md:h-48 bg-gradient-to-tr from-purple-200/15 to-indigo-200/15 rounded-full blur-lg dark:from-purple-800/15 dark:to-indigo-800/15" />
          
          <motion.div 
            className="relative z-10 max-w-4xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            animate={isLoaded ? "visible" : "hidden"}
          >
            <motion.div 
              className="flex flex-col items-center text-center py-8 px-4 sm:py-12 sm:px-6"
              variants={itemVariants}
            >
              {/* Ice Cream Logo */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <Image 
                  src="/images/canne_logo_web.png"
                  alt="Cannè Art Collective" 
                  width={300} 
                  height={360} 
                  className="relative h-56 sm:h-64 md:h-80 lg:h-96 w-auto drop-shadow-2xl mx-auto"
                  priority
                />
              </motion.div>
              
              {/* Enhanced Typography */}
              <motion.h1 
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-3 sm:mb-4 md:mb-6"
                variants={itemVariants}
              >
                <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 text-transparent bg-clip-text leading-tight block">
                  Art–first.
                </span>
                <span className="bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-600 text-transparent bg-clip-text leading-tight block">
                  Street–approved.
                </span>
              </motion.h1>
              
              <motion.p 
                className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-2 font-medium px-2"
                variants={itemVariants}
              >
                Premium Digital Art with{' '}
                <span className="text-emerald-500 dark:text-emerald-400 font-semibold">Complimentary 🌿 Gifts</span>
              </motion.p>
              
              <motion.p 
                className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-6 sm:mb-8 max-w-2xl px-2"
                variants={itemVariants}
              >
                I-71 compliant · 21+ only · Washington, DC · <span className="text-emerald-500 dark:text-emerald-400">🌿 top-shelf botanical gift</span> + collectible print with every order
              </motion.p>
              
              {/* Mobile-Optimized CTA Section */}
              <motion.div 
                className="flex flex-col sm:flex-row gap-4 w-full justify-center items-center mb-8"
                variants={itemVariants}
              >
                <Link href="/shop" className="flex-1 sm:flex-none">
                  <button className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-2xl shadow-lg font-semibold text-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-h-[56px] touch-manipulation">
                    <span className="flex items-center justify-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      <span>Explore Collection</span>
                    </span>
                  </button>
                </Link>
                <Link href="/i71" className="flex-1 sm:flex-none">
                  <button className="w-full sm:w-auto px-8 py-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-600 rounded-2xl shadow-lg hover:shadow-xl font-semibold text-lg text-gray-700 dark:text-gray-200 transition-all duration-200 active:scale-95 min-h-[56px] touch-manipulation">
                    <span className="flex items-center justify-center gap-2">
                      <Shield className="w-5 h-5" />
                      <span>I-71 Compliant</span>
                    </span>
                  </button>
                </Link>
              </motion.div>
              
              {/* Scroll Indicator */}
              <motion.div
                className="hidden sm:flex flex-col items-center gap-2 text-gray-400 dark:text-gray-500"
                variants={itemVariants}
                animate={{
                  y: [0, 10, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <span className="text-sm font-medium">Discover More</span>
                <ArrowDown className="w-5 h-5" />
              </motion.div>
            </motion.div>
          </motion.div>
        </section>

        {/* How It Works Section - Enhanced */}
        <section className="py-20 md:py-28 bg-gradient-to-b from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center mb-16 md:mb-20"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-2 bg-pink-100 dark:bg-pink-900/30 rounded-full text-pink-600 dark:text-pink-400 text-sm font-medium mb-4"
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                viewport={{ once: true }}
              >
                <Zap className="w-4 h-4" />
                Simple Process
              </motion.div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 text-transparent bg-clip-text mb-6">
                How It Works
              </h2>
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Simple, seamless, and I-71 compliant — art purchases with{' '}
                <span className="text-emerald-500 dark:text-emerald-400 font-medium">complimentary 🌿 botanical gifts</span>
              </p>
            </motion.div>
            
            <div className="relative mt-16">
              {/* Enhanced Timeline Connector */}
              <div className="hidden md:block absolute top-[3.5rem] left-[12.5%] right-[12.5%] h-0.5 -z-10">
                <motion.div 
                  className="relative w-full h-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  viewport={{ once: true }}
                >
                  <motion.div 
                    className="absolute left-0 top-0 h-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-full"
                    initial={{ width: "0%" }}
                    whileInView={{ width: "100%" }}
                    transition={{ delay: 1, duration: 2, ease: "easeInOut" }}
                    viewport={{ once: true }}
                  />
                </motion.div>
              </div>
              
              {/* Enhanced Process Steps */}
              <div className="grid grid-cols-1 gap-12 md:grid-cols-4 md:gap-8">
                {/* Step 1 */}
                <motion.div 
                  className="text-center flex flex-col items-center group"
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  viewport={{ once: true }}
                >
                  <motion.div 
                    className="relative flex justify-center items-center mx-auto mb-6 w-20 h-20 bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900/50 dark:to-purple-900/50 rounded-full shadow-lg group-hover:shadow-xl transition-all duration-300"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-200/50 to-purple-200/50 dark:from-pink-800/50 dark:to-purple-800/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative flex items-center justify-center w-14 h-14 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-md backdrop-blur-sm">
                      <Brush className="h-7 w-7 text-pink-500" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-pink-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      1
                    </div>
                  </motion.div>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-3">Pick Your Strain & Tier</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed max-w-xs">Choose your strain preference, then pick a size tier — each comes with exclusive digital art.</p>
                </motion.div>
                
                {/* Step 2 */}
                <motion.div 
                  className="text-center flex flex-col items-center group"
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  viewport={{ once: true }}
                >
                  <motion.div 
                    className="relative flex justify-center items-center mx-auto mb-6 w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/50 dark:to-orange-900/50 rounded-full shadow-lg group-hover:shadow-xl transition-all duration-300"
                    whileHover={{ scale: 1.1, rotate: -5 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-200/50 to-orange-200/50 dark:from-amber-800/50 dark:to-orange-800/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative flex items-center justify-center w-14 h-14 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-md backdrop-blur-sm">
                      <CreditCard className="h-7 w-7 text-amber-500" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      2
                    </div>
                  </motion.div>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-3">Secure Checkout</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed max-w-xs">Pay online—taxes + delivery included.</p>
                </motion.div>
                
                {/* Step 3 */}
                <motion.div 
                  className="text-center flex flex-col items-center group"
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                  viewport={{ once: true }}
                >
                  <motion.div 
                    className="relative flex justify-center items-center mx-auto mb-6 w-20 h-20 bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-900/50 dark:to-green-900/50 rounded-full shadow-lg group-hover:shadow-xl transition-all duration-300"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-200/50 to-green-200/50 dark:from-emerald-800/50 dark:to-green-800/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative flex items-center justify-center w-14 h-14 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-md backdrop-blur-sm">
                      <Package className="h-7 w-7 text-emerald-500" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      3
                    </div>
                  </motion.div>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-3">We Gift the Vibe 🌿</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed max-w-xs">Our courier personally delivers your{' '}<span className="text-emerald-500 dark:text-emerald-400 font-medium">complimentary top-shelf botanical gift</span> — discreet, fresh, and I-71 legal.</p>
                </motion.div>
                
                {/* Step 4 */}
                <motion.div 
                  className="text-center flex flex-col items-center group"
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                  viewport={{ once: true }}
                >
                  <motion.div 
                    className="relative flex justify-center items-center mx-auto mb-6 w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 rounded-full shadow-lg group-hover:shadow-xl transition-all duration-300"
                    whileHover={{ scale: 1.1, rotate: -5 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-200/50 to-pink-200/50 dark:from-purple-800/50 dark:to-pink-800/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative flex items-center justify-center w-14 h-14 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-md backdrop-blur-sm">
                      <Sparkles className="h-7 w-7 text-purple-500" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      4
                    </div>
                  </motion.div>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-3">Unlock Your Print</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed max-w-xs">After payment, a collectible digital art print from Drop #001 is yours to download — randomly assigned, permanently yours.</p>
                </motion.div>
              </div>
            </div>
            
            {/* Enhanced CTA Section */}
            <motion.div 
              className="text-center mt-16 md:mt-20"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.8 }}
              viewport={{ once: true }}
            >
              <motion.div
                className="inline-flex flex-col sm:flex-row gap-4 sm:gap-6"
                initial={{ scale: 0.9 }}
                whileInView={{ scale: 1 }}
                transition={{ delay: 1.2, duration: 0.6, type: "spring", stiffness: 200 }}
                viewport={{ once: true }}
              >
                <Link href="/shop">
                  <motion.button 
                    className="group relative px-10 py-4 text-lg font-semibold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 text-white rounded-2xl shadow-xl overflow-hidden"
                    whileHover={{ scale: 1.05, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    />
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      <Star className="w-5 h-5" />
                      Start Shopping
                      <Star className="w-5 h-5" />
                    </span>
                  </motion.button>
                </Link>
                <Link href="/about">
                  <motion.button 
                    className="px-10 py-4 text-lg font-semibold bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-600 rounded-2xl shadow-lg hover:shadow-xl text-gray-700 dark:text-gray-200 transition-all duration-300"
                    whileHover={{ scale: 1.05, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    Learn More
                  </motion.button>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Products Collection Section */}
        <section id="collection" className="py-20 md:py-28 bg-gradient-to-b from-gray-50/50 to-white dark:from-gray-800/50 dark:to-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ErrorBoundary>
              <Suspense fallback={<ProductsGridSkeleton />}>
                <ProductsPresenter />
              </Suspense>
            </ErrorBoundary>
          </div>
        </section>

        {/* Drop Alerts Email Capture — after products so customer knows what they're signing up for */}
        <DropAlertsSection />
      </main>
      
      {/* Footer */}
      <ErrorBoundary>
        <Suspense fallback={<LoadingSpinner />}>
          <Footer />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
