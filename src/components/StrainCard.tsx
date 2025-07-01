'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Strain } from '@/data/tiers';

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const StrainCard: React.FC<{ strain: Strain; tierSlug: string }> = ({ strain, tierSlug }) => (
  <motion.div variants={itemVariants}>
    <Link href={`/shop/${tierSlug}/${strain.id}`} passHref>
      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group h-full flex flex-col rounded-xl border-0 ring-1 ring-gray-200 dark:ring-gray-700 bg-white dark:bg-gray-800">
        <CardContent className="p-0 flex-grow">
          <div className="aspect-square relative overflow-hidden rounded-t-xl">
            <Image 
              src={strain.img} 
              alt={strain.title} 
              fill 
              className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            {strain.type && (
              <div className="absolute top-3 right-3">
                <Badge 
                  className={`
                    shadow-sm backdrop-blur-md px-3 py-1 font-medium text-xs uppercase tracking-wide
                    ${strain.type === 'sativa' ? 'bg-amber-500/90 text-white' : ''}
                    ${strain.type === 'indica' ? 'bg-indigo-600/90 text-white' : ''}
                    ${strain.type === 'hybrid' ? 'bg-purple-500/90 text-white' : ''}
                  `}
                >
                  {strain.type}
                </Badge>
              </div>
            )}
          </div>
          <div className="p-5">
            <h4 className="text-lg font-semibold tracking-tight">{strain.title}</h4>
            {strain.description && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">{strain.description}</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="px-5 py-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur-sm">
          <div className="flex items-center gap-2 flex-wrap">
            {strain.thc && (
              <Badge variant="outline" className="text-xs font-medium px-2 py-1 bg-white dark:bg-gray-800 shadow-sm">
                THC: {strain.thc}
              </Badge>
            )}
            {strain.cbd && (
              <Badge variant="outline" className="text-xs font-medium px-2 py-1 bg-white dark:bg-gray-800 shadow-sm">
                CBD: {strain.cbd}
              </Badge>
            )}
          </div>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Complimentary</span>
        </CardFooter>
      </Card>
    </Link>
  </motion.div>
);

export default StrainCard;
