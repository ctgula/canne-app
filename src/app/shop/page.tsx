'use client';

import React from 'react';
import Header from '@/components/Header';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { tiers, Tier } from '@/data/tiers';
import StrainCard from '@/components/StrainCard';
import { motion } from 'framer-motion';

const TierHeader: React.FC<{ tier: Tier }> = ({ tier }) => (
  <div className="mb-10 border-l-4 border-pink-500 pl-6 relative">
    <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 shadow-lg"></div>
    <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{tier.name}</h2>
    <p className="text-lg text-gray-600 dark:text-gray-300 mt-2 leading-relaxed max-w-3xl">{tier.description}</p>
  </div>
);

export default function ShopPage() {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <Link 
          href="/" 
          className="inline-flex items-center space-x-2 mb-10 text-gray-600 hover:text-gray-900 transition-colors dark:text-gray-400 dark:hover:text-white group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home</span>
        </Link>

        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 tracking-tight">
            Shop Our Collection
          </h1>
          <p className="mt-6 text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Exclusive digital art, gifted with premium flower.
          </p>
        </motion.div>

        <motion.div 
          className="space-y-24"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {tiers.map((tier) => (
            <motion.section 
              key={tier.slug}
              variants={itemVariants}
              className="relative"
            >
              <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-gray-200 to-transparent dark:via-gray-700 opacity-70"></div>
              <TierHeader tier={tier} />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-10">
                {tier.strains.map((strain) => (
                  <StrainCard key={strain.id} strain={strain} tierSlug={tier.slug} />
                ))}
              </div>
            </motion.section>
          ))}
        </motion.div>
      </main>
    </div>
  );
}
