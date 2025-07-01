'use client';

import React, { useRef, useEffect } from 'react';
import { motion, useAnimation, useInView, Variants, animate } from 'framer-motion';
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

export default function HowItWorksSection() {
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

  const scrollToTiers = () => {
    // Check if we're on the homepage
    const tiersSection = document.getElementById('tiers');
    if (tiersSection) {
      // If on homepage, scroll to the section
      tiersSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      // If on a different page, navigate to homepage tiers section
      window.location.href = '/#tiers';
    }
  };

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

  return (
    <section id="how-it-works" className="py-12 md:py-20 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          className="text-center"
          variants={container}
          initial="hidden"
          animate={controls}
        >
          <motion.div variants={item} className="inline-block px-4 py-1 mb-2 bg-gradient-to-r from-pink-500/10 to-purple-500/10 dark:from-pink-500/20 dark:to-purple-500/20 rounded-full">
            <h2 className="text-sm font-bold tracking-wider uppercase bg-gradient-to-r from-pink-500 to-purple-500 text-transparent bg-clip-text">
              How It Works
            </h2>
          </motion.div>
          <motion.h1 variants={item} className="mt-3 text-3xl sm:text-4xl md:text-5xl font-poppins font-extrabold tracking-tighter leading-tight md:leading-[1.1] break-words px-2 sm:px-0 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 text-transparent bg-clip-text">
            <span className="inline-block">Art-First Gifting</span>{' '}
            <span className="inline-block">in 4 Simple Steps</span>
          </motion.h1>
          <motion.p variants={item} className="mt-4 max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-400">
            We sell exclusive digital art. As a thank you, we include a complimentary cannabis gift with every purchase, fully I-71 compliant.
          </motion.p>
        </motion.div>

        <motion.div
          className="relative mt-16"
          variants={container}
          initial="hidden"
          animate={controls}
        >
          <TimelineConnector progress={progress} />
          <div className="grid grid-cols-1 gap-12 md:grid-cols-4 md:gap-8">
            {steps.map((step, index) => (
              <motion.div key={index} variants={item} className="text-center">
                <div className="flex justify-center items-center mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900/50 dark:to-purple-900/50 rounded-full shadow-inner-lg">
                  <div className="flex items-center justify-center w-12 h-12 bg-white/80 dark:bg-gray-800/80 rounded-full shadow-md">
                    {step.icon}
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{step.title}</h3>
                <p className="mt-1 text-gray-600 dark:text-gray-400">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="text-center mt-16"
          variants={item}
          initial="hidden"
          animate={controls}
        >
          <button
            onClick={scrollToTiers}
            className="px-10 py-3 text-base bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
          >
            Choose Your Tier
          </button>
        </motion.div>
      </div>
    </section>
  );
}
