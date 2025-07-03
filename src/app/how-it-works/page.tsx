'use client';

import Header from '@/components/Header';
import { motion, useAnimation, useInView, Variants } from 'framer-motion';
import { Brush, CreditCard, Package, Sparkles } from 'lucide-react';
import React, { useRef, useEffect } from 'react';
import Link from 'next/link';

interface StepProps {
  number: number;
  icon: React.ReactNode;
  title: string;
  description: string;
}

const steps: StepProps[] = [
  {
    number: 1,
    icon: <Brush className="h-6 w-6 text-pink-500" />,
    title: "Pick Your Art",
    description: "Choose a tier; each purchase is for exclusive artwork."
  },
  {
    number: 2,
    icon: <CreditCard className="h-6 w-6 text-amber-500" />,
    title: "Secure Checkout",
    description: "Pay online—taxes + delivery included."
  },
  {
    number: 3,
    icon: <Package className="h-6 w-6 text-blue-500" />,
    title: "We Gift the Vibe",
    description: "Our courier hands you the complimentary cannabis."
  },
  {
    number: 4,
    icon: <Sparkles className="h-6 w-6 text-purple-500" />,
    title: "Enjoy Responsibly",
    description: "Must be 21+. Keep gifts inside the District."
  }
];

const TimelineConnector: React.FC<{ progress: number }> = ({ progress }) => (
  <div className="hidden md:block absolute top-[2.3125rem] left-0 w-full h-1.5 -z-10">
    <div className="relative w-full h-full bg-gray-200 dark:bg-gray-700 rounded-full">
      <motion.div 
        className="absolute left-0 top-0 h-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-full shadow-sm"
        style={{ scaleX: progress, originX: 0 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
      />
    </div>
  </div>
);

export default function HowItWorksPage() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const controls = useAnimation();
  const [progress, setProgress] = React.useState(0);

  useEffect(() => {
    if (isInView) {
      controls.start('show');
      const animationControls = animate(0, 1, {
        duration: 2,
        ease: "easeInOut",
        onUpdate: (latest: number) => setProgress(latest),
      });
      return () => animationControls.stop();
    }
  }, [isInView, controls]);

  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const item: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.6, 
        ease: "easeOut"
      } 
    }
  };

  // Polyfill for animate function
  function animate(from: number, to: number, options: { duration: number; ease: string; onUpdate: (value: number) => void }) {
    const startTime = Date.now();
    const { duration, ease, onUpdate } = options;

    function update() {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Simple easing function
      const easedProgress = progress;
      
      const value = from + (to - from) * easedProgress;
      onUpdate(value);

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    update();
    return {
      stop: () => {}
    };
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-pink-50/20 dark:from-gray-900 dark:to-purple-900/20">
      <Header />
      <main className="relative overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-pink-200/20 rounded-full filter blur-3xl dark:bg-pink-900/20 opacity-50 -z-20"></div>
        <div className="absolute top-1/2 -left-60 w-96 h-96 bg-lavender-200/20 rounded-full filter blur-3xl dark:bg-purple-900/20 opacity-50 -z-20"></div>
        <div className="absolute -bottom-80 -right-20 w-96 h-96 bg-blue-200/10 rounded-full filter blur-3xl dark:bg-blue-900/10 opacity-50 -z-20"></div>
        
        <div className="relative z-10 mt-16 md:mt-20 pt-28 md:pt-36 pb-16 sm:pb-24">
          <section id="how-it-works" className="py-12 md:py-20 bg-transparent">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                ref={ref}
                className="text-center mb-12 md:mb-16 max-w-4xl mx-auto"
                variants={container}
                initial="hidden"
                animate={controls}
              >
                {/* Logo */}
                <motion.div variants={item} className="mb-6">
                  <img src="/images/canne_logo_web.svg" alt="Cannè Logo" className="mx-auto w-48 h-48 md:w-52 md:h-52" />
                </motion.div>
                
                <motion.div variants={item} className="inline-block px-4 py-1 mb-4 bg-gradient-to-r from-pink-500/10 to-purple-500/10 dark:from-pink-500/20 dark:to-purple-500/20 rounded-full">
                  <h2 className="text-sm font-bold tracking-wider uppercase bg-gradient-to-r from-pink-500 to-purple-500 text-transparent bg-clip-text">
                    How It Works
                  </h2>
                </motion.div>
                <motion.h1 
                  variants={item} 
                  className="mt-4 text-4xl sm:text-5xl md:text-6xl font-poppins font-extrabold tracking-tighter md:leading-[1.2] break-words px-2 sm:px-0 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 text-transparent bg-clip-text"
                >
                  <span className="inline-block mb-1 md:mb-0">Art-First.</span>{' '}
                  <span className="inline-block">Street-Approved.</span>
                </motion.h1>
                <motion.p variants={item} className="mt-6 max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-400">
                  We sell exclusive digital art. As a thank you, we include a complimentary cannabis gift with every purchase, fully I-71 compliant.
                </motion.p>
              </motion.div>

              <div className="my-24 max-w-5xl mx-auto">
                <motion.div
                  className="relative"
                  variants={container}
                  initial="hidden"
                  animate={controls}
                >
                  <TimelineConnector progress={progress} />
                  <div className="grid grid-cols-1 gap-16 md:grid-cols-4 md:gap-10 lg:gap-14 px-4 sm:px-6">
                    {steps.map((step, index) => (
                      <motion.div key={index} variants={item} className="text-center flex flex-col items-center">
                        <div className="flex justify-center items-center mx-auto mb-6 w-16 h-16 bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900/50 dark:to-purple-900/50 rounded-full shadow-inner-lg">
                          <div className="flex items-center justify-center w-12 h-12 bg-white/80 dark:bg-gray-800/80 rounded-full shadow-md">
                            {step.icon}
                          </div>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{step.title}</h3>
                        <p className="text-gray-600 dark:text-gray-400">{step.description}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>

              <motion.div
                className="text-center mt-8 md:mt-12"
                variants={item}
                initial="hidden"
                animate={controls}
              >
                <Link href="/shop">
                  <button className="px-12 py-4 text-base font-medium bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
                    Shop Now
                  </button>
                </Link>
              </motion.div>
              
              {/* Tier Information Section */}
              <motion.div 
                className="mt-16 md:mt-24 max-w-3xl mx-auto px-4"
                variants={container}
                initial="hidden"
                animate={controls}
              >
                <motion.h2 
                  variants={item}
                  className="text-2xl md:text-3xl font-bold text-center mb-8 bg-gradient-to-r from-pink-500 to-purple-600 text-transparent bg-clip-text"
                >
                  Our Tiers
                </motion.h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Starter Tier */}
                  <motion.div variants={item} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                    <h3 className="font-bold text-xl mb-2 bg-gradient-to-r from-pink-400 to-pink-600 text-transparent bg-clip-text">Starter</h3>
                    <p className="text-2xl font-bold mb-1">$25</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Sativa or Indica (18-22% THC)</p>
                    <p className="text-sm">Single digital print + complimentary top-shelf gift (3.5g)</p>
                  </motion.div>
                  
                  {/* Classic Tier */}
                  <motion.div variants={item} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                    <h3 className="font-bold text-xl mb-2 bg-gradient-to-r from-violet-400 to-violet-600 text-transparent bg-clip-text">Classic</h3>
                    <p className="text-2xl font-bold mb-1">$45</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Hybrid or Sativa (20-24% THC)</p>
                    <p className="text-sm">Double art series + two curated gifts (7g)</p>
                  </motion.div>
                  
                  {/* Black Tier */}
                  <motion.div variants={item} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                    <h3 className="font-bold text-xl mb-2 bg-gradient-to-r from-gray-700 to-gray-900 text-transparent bg-clip-text">Black</h3>
                    <p className="text-2xl font-bold mb-1">$75</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Premium Indica/Hybrid (24-28% THC)</p>
                    <p className="text-sm">Limited collection prints + four premium gifts (14g)</p>
                  </motion.div>
                  
                  {/* Ultra Tier */}
                  <motion.div variants={item} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                    <h3 className="font-bold text-xl mb-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-transparent bg-clip-text">Ultra</h3>
                    <p className="text-2xl font-bold mb-1">$140</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Elite Quality (28-32% THC)</p>
                    <p className="text-sm">Premium digital art with 28g high-grade gift</p>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
