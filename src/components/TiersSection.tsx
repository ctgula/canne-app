'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import { tiers } from '@/data/tiers';

export default function TiersSection() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

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
    <section id="tiers-section" className="py-20 md:py-28 bg-gray-50 dark:bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">Choose Your Vibe</h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Fine digital art, complimentary top-shelf gifts included. Fully I-71 compliant.
          </p>
        </div>

        {isClient ? (
          <motion.div 
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {tiers.map((tier) => (
              <motion.div 
                key={tier.slug}
                variants={item}
                className={`relative rounded-2xl overflow-hidden group transition-all duration-300 ease-in-out ${tier.premium ? 'shadow-2xl hover:shadow-purple-500/40' : 'shadow-lg hover:shadow-xl'}`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${tier.color.gradient} opacity-10 dark:opacity-20 group-hover:opacity-20 transition-opacity`}></div>
                <div className={`relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg p-6 border ${tier.color.border} flex flex-col h-full`}>

                  <div className="flex-grow">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className={`text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${tier.slug === 'black' ? 'from-gray-700 to-black dark:from-gray-400 dark:to-gray-200' : tier.color.gradient}`}>{tier.name}</h3>
                      <span className={`text-sm font-semibold px-3 py-1 rounded-full ${tier.color.bg} text-white shadow-sm`}>
                        {tier.weight}
                      </span>
                    </div>
                    
                    <div className="mb-6">
                      <span className="text-4xl font-extrabold text-gray-900 dark:text-white">${tier.price}</span>
                    </div>
                    
                    <div className="text-gray-600 dark:text-gray-400 mb-6 min-h-[6rem]">
                      <p className="font-medium">{tier.description}</p>
                      <ul className="mt-3 text-sm space-y-1.5">
                        {tier.features.map((feature, index) => (
                          <li key={index} className="flex items-center">
                            <svg className={`w-4 h-4 mr-2.5 ${tier.color.bg} text-white rounded-full p-0.5 flex-shrink-0`} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <Link 
                    href={`/checkout?tier=${tier.slug}`}
                    className={`block w-full mt-auto py-3 px-4 bg-gradient-to-r ${tier.color.gradient} text-white font-semibold rounded-lg text-center shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300`}
                  >
                    Select Tier
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {tiers.map((tier) => (
              <div key={tier.slug} className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 animate-pulse">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-6"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 mb-4"></div>
                <div className="h-12 bg-gray-300 dark:bg-gray-600 rounded-lg mt-6"></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
