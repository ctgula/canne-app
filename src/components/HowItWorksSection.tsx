'use client';

import React, { useRef, useEffect } from 'react';
import { motion, useAnimation, useInView, Variants } from 'framer-motion';
import { Brush, CreditCard, Package, Sparkles } from 'lucide-react';

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
  <div className="hidden md:block absolute top-12 left-0 w-full h-1.5 z-10">
    <div className="relative w-full h-full bg-gray-200 dark:bg-gray-700 rounded-full">
      <motion.div 
        className="absolute left-0 top-0 h-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-full shadow-sm"
        style={{ width: `${progress * 100}%` }}
        transition={{ duration: 0.5 }}
      />
    </div>
  </div>
);

export default function HowItWorksSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.3 });
  const controls = useAnimation();
  const [progress, setProgress] = React.useState(0);

  useEffect(() => {
    if (isInView) {
      controls.start('show');
      let counter = 0;
      const interval = setInterval(() => {
        counter += 0.1;
        setProgress(Math.min(counter, 1));
        if (counter >= 1) clearInterval(interval);
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isInView, controls]);

  const scrollToTiers = () => {
    const tiersSection = document.getElementById('tiers-section');
    if (tiersSection) {
      tiersSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
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

  return (
    <section className="py-16 md:py-24 pb-24 md:pb-32 bg-gradient-to-b from-white to-pink-50/20 dark:from-gray-900 dark:to-purple-900/20" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-indigo-600 dark:from-pink-400 dark:to-indigo-400">How Cannè Works</h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
            Simple. Legal. Delivered in D.C.
          </p>
        </div>

        <div className="relative">
          <TimelineConnector progress={progress} />
          
          <motion.div
            variants={container}
            initial="hidden"
            animate={controls}
            className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-12 relative pt-8 md:pt-10 mb-12"
          >
            {steps.map((step) => (
              <motion.div
                key={step.number}
                variants={item}
                data-step={step.number}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all duration-300 relative hover:-translate-y-1"
              >
                {/* Mobile step indicator - vertical line with number */}
                <div className={`md:hidden absolute left-0 top-0 bottom-0 w-1 rounded-l ${step.number === 1 ? 'bg-pink-500' : step.number === 2 ? 'bg-amber-500' : step.number === 3 ? 'bg-blue-500' : 'bg-purple-500'}`}></div>
                <div className={`md:hidden absolute left-0 top-4 -translate-x-1/2 w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-xs ${step.number === 1 ? 'bg-pink-500' : step.number === 2 ? 'bg-amber-500' : step.number === 3 ? 'bg-blue-500' : 'bg-purple-500'}`}>
                  {step.number}
                </div>
                
                {/* Desktop step indicator - circle on top */}
                <div className={`hidden md:flex absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full bg-white border-2 items-center justify-center shadow-md ${step.number === 1 ? 'border-pink-500' : step.number === 2 ? 'border-amber-500' : step.number === 3 ? 'border-blue-500' : 'border-purple-500'}`}>
                  <span className="font-bold text-[#1A1A1A]">{step.number}</span>
                </div>

                <div className="p-6 md:mt-4">
                  <div className="flex items-center justify-center md:justify-start mb-4 md:mb-6">
                    <div className={`p-2 rounded-full ${step.number === 1 ? 'bg-pink-100' : step.number === 2 ? 'bg-amber-100' : step.number === 3 ? 'bg-blue-100' : 'bg-purple-100'}`}>
                      {step.icon}
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-[#1A1A1A] text-center md:text-left mb-2">
                    {step.title}
                  </h3>
                  
                  <p className="text-gray-600 text-center md:text-left min-h-[3rem] text-sm md:text-base">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <div className="mt-16 text-center">
          <button
            onClick={scrollToTiers}
            className="px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 inline-flex items-center gap-2 border border-pink-300/20"
          >
            Browse Tiers
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </button>
        </div>

        <div className="text-center mt-10 mb-8 text-sm text-gray-600 dark:text-gray-400 max-w-3xl mx-auto bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm py-6 px-8 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <p>Cannè operates under Initiative 71. Cannabis is gifted, never sold.</p>
        </div>
      </div>
    </section>
  );
}
