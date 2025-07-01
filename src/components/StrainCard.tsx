'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Strain } from '@/data/tiers';
import { ShoppingCart, Eye } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const StrainCard: React.FC<{ strain: Strain; tierSlug: string }> = ({ strain, tierSlug }) => {  
  const { addItem } = useCart();
  
  return (
    <motion.div variants={itemVariants}>
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group h-full flex flex-col rounded-xl border-0 ring-1 ring-gray-200 dark:ring-gray-700 bg-white dark:bg-gray-800">
        <CardContent className="p-0 flex-grow">
          <Link href={`/shop/${tierSlug}/${strain.id}`} aria-label={`View details of ${strain.title}`}>
            <div className="aspect-square relative overflow-hidden rounded-t-xl">
              <Image 
                src={strain.img} 
                alt={`${strain.title} - ${strain.type || 'Cannabis strain'} ${strain.thc ? `with ${strain.thc} THC` : ''}`} 
                fill 
                className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                priority={false}
                loading="lazy"
                quality={85}
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
            <Link href={`/shop/${tierSlug}/${strain.id}`} className="focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 rounded-md">
              <h4 className="text-lg font-semibold tracking-tight hover:text-pink-600 dark:hover:text-pink-400 transition-colors">{strain.title}</h4>
            </Link>
            {strain.description && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">{strain.description}</p>
            )}
          </div>
          </Link>
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
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Complimentary</span>
            <div className="flex gap-1">
              <Link href={`/shop/${tierSlug}/${strain.id}`} className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" aria-label={`View ${strain.title} details`}>
                <Eye className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              </Link>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  // Add item with appropriate type matching CartItem interface
                  addItem({
                    id: strain.id,
                    name: strain.title,
                    price: getTierPrice(tierSlug), // Get price based on tier
                    quantity: 1,
                    tier: tierSlug,
                    imageUrl: strain.img,
                    weight: getTierWeight(tierSlug), // Get weight based on tier
                    colorTheme: getTierColor(tierSlug) // Get color theme based on tier
                  });
                }}
                className="p-1.5 rounded-full bg-pink-50 hover:bg-pink-100 dark:bg-pink-900/20 dark:hover:bg-pink-800/30 text-pink-600 dark:text-pink-400 transition-colors"
                aria-label={`Add ${strain.title} to cart`}
              >
                <ShoppingCart className="w-4 h-4" />
              </button>
            </div>
          </div>
        </CardFooter>
      </Card>
  </motion.div>
  );
};

// Helper functions to get tier details based on the memory
function getTierPrice(tierSlug: string): number {
  switch (tierSlug) {
    case 'starter': return 25;
    case 'classic': return 45;
    case 'black': return 75;
    case 'ultra': return 140;
    default: return 0;
  }
}

function getTierWeight(tierSlug: string): string {
  switch (tierSlug) {
    case 'starter': return '3.5g';
    case 'classic': return '7g';
    case 'black': return '14g';
    case 'ultra': return '28g';
    default: return '0g';
  }
}

function getTierColor(tierSlug: string): string {
  switch (tierSlug) {
    case 'starter': return 'pink';
    case 'classic': return 'violet';
    case 'black': return 'black';
    case 'ultra': return 'purple';
    default: return 'gray';
  }
}

export default StrainCard;
