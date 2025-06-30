'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, Variants } from 'framer-motion';

interface TierProps {
  name: string;
  weight: string;
  price: string;
  description: string;
  slug: string;
}

const tiers: TierProps[] = [
  {
    name: 'Starter',
    weight: '3.5 g',
    price: '$25',
    description: 'Single digital print + complimentary top-shelf gift.',
    slug: 'starter'
  },
  {
    name: 'Classic',
    weight: '7 g',
    price: '$45',
    description: 'Double art series with signature + two curated gifts.',
    slug: 'classic'
  },
  {
    name: 'Black',
    weight: '14 g',
    price: '$75',
    description: 'Limited collection prints + four premium gifts.',
    slug: 'black'
  },
  {
    name: 'Ultra',
    weight: '28 g',
    price: '$140',
    description: 'Exclusive gallery pieces + eight premium selections.',
    slug: 'ultra'
  }
];

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
        staggerChildren: 0.4
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
    <section id="tiers-section" className="py-16 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] mb-4">Choose Your Vibe</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Fine digital art collection – complimentary gifts included.
          </p>
        </div>

        {isClient ? (
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {tiers.map((tier) => (
              <motion.div 
                key={tier.slug}
                variants={item}
                data-tier={tier.slug}
                className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-[#1A1A1A]">{tier.name}</h3>
                    <span className="text-sm font-medium px-3 py-1 rounded-full bg-[#FFCEB5] text-[#1A1A1A]">
                      {tier.weight}
                    </span>
                  </div>
                  
                  <div className="mb-6">
                    <span className="text-2xl font-bold text-[#D4AF37]">{tier.price}</span>
                  </div>
                  
                  <p className="text-gray-600 mb-6 h-12">{tier.description}</p>
                  
                  <Link 
                    href={`/checkout?tier=${tier.slug}`}
                    className="block w-full py-2 px-4 bg-[#1A1A1A] hover:bg-black text-white font-medium rounded-lg text-center transition-colors duration-200"
                  >
                    Order now
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tiers.map((tier) => (
              <div 
                key={tier.slug}
                data-tier={tier.slug}
                className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
              >
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-[#1A1A1A]">{tier.name}</h3>
                    <span className="text-sm font-medium px-3 py-1 rounded-full bg-[#FFCEB5] text-[#1A1A1A]">
                      {tier.weight}
                    </span>
                  </div>
                  
                  <div className="mb-6">
                    <span className="text-2xl font-bold text-[#D4AF37]">{tier.price}</span>
                  </div>
                  
                  <p className="text-gray-600 mb-6 h-12">{tier.description}</p>
                  
                  <Link 
                    href={`/checkout?tier=${tier.slug}`}
                    className="block w-full py-2 px-4 bg-[#1A1A1A] hover:bg-black text-white font-medium rounded-lg text-center transition-colors duration-200"
                  >
                    Order now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-10 text-sm text-gray-500 max-w-3xl mx-auto">
          <p>All prices are for I-71-compliant digital art pieces – cannabis is gifted, never sold.</p>
        </div>
      </div>
    </section>
  );
}
