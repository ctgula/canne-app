'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { tiers, Tier } from '@/data/tiers';
import StrainCard from './StrainCard';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function TierCollection() {
  return (
    <section id="collection" className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">Our Collection</h2>
        </div>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12"
        >
          {tiers.map((tier) => (
            <motion.div key={tier.name} variants={itemVariants} className="flex flex-col gap-8">
              <Card
                className="p-1 bg-gradient-to-br hover:scale-105 transition-transform duration-200 shadow-lg"
                style={{ '--tw-gradient-from': tier.color.split(' ')[0], '--tw-gradient-to': tier.color.split(' ')[1] } as React.CSSProperties}
              >
                <div className="bg-white dark:bg-gray-900 rounded-lg">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <h3 className="text-2xl font-bold">{tier.name}</h3>
                      <Badge variant="secondary">{tier.weight}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <p className="text-2xl font-mono">${tier.price}</p>
                      <Link href={`/checkout?tier=${tier.name.toLowerCase()}`} passHref>
                        <Button>Order now</Button>
                      </Link>
                    </div>
                  </CardContent>
                </div>
              </Card>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {tier.strains.map((strain) => (
                  <StrainCard key={strain.id} strain={strain} tierSlug={tier.slug} />
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
