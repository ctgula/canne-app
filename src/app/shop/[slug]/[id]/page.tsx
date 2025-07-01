'use client';

import React from 'react';
import Header from '@/components/Header';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { tiers } from '@/data/tiers';
import { Button } from '@/components/ui/button';

export default function ProductDetailPage({ params }: { params: { slug: string; id: string } }) {
  const { slug, id } = params;
  const tier = tiers.find((t) => t.slug === slug);
  const strain = tier?.strains.find((s) => s.id === id);

  if (!tier || !strain) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 text-center">
          <h1 className="text-4xl font-bold text-red-500">Product Not Found</h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">The product you are looking for does not exist.</p>
          <Link href="/shop" className="mt-8 inline-block bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600 transition-colors">
            Back to Shop
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <Link 
          href={`/shop/${slug}`}
          className="inline-flex items-center space-x-2 mb-8 text-gray-600 hover:text-gray-900 transition-colors dark:text-gray-400 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to {tier.name} Tier</span>
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          <div className="aspect-square bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg">
            <div className="relative w-full h-full">
              <Image 
                src={strain.img} 
                alt={strain.title} 
                fill 
                className="object-cover"
              />
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white">{strain.title}</h1>
            <p className="mt-2 text-xl text-gray-500 dark:text-gray-400">Part of the <span className="font-semibold text-pink-500">{tier.name}</span> collection</p>
            
            <div className="mt-6">
              <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">${tier.price}</p>
              <p className="text-md text-gray-600 dark:text-gray-300">for the digital art piece</p>
            </div>

            <div className="mt-6 prose prose-lg text-gray-700 dark:text-gray-300">
              <p>This exclusive digital artwork comes with a complimentary I-71 compliant gift of <strong>{tier.weight} of premium flower</strong>.</p>
            </div>

            <div className="mt-8">
              <Link href={`/checkout?tier=${tier.slug}`} passHref>
                <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-pink-500 to-purple-600 text-white">
                  Order Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
