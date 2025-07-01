'use client';

import React from 'react';
import Header from '@/components/Header';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { tiers } from '@/data/tiers';
import StrainCard from '@/components/StrainCard';

interface TierPageProps {
  params: {
    slug: string;
  };
}

export default function TierPage({ params }: TierPageProps) {
  const { slug } = params;
  const tier = tiers.find((t) => t.slug === slug);

  if (!tier) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 text-center">
          <h1 className="text-4xl font-bold text-red-500">Tier Not Found</h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">The tier you are looking for does not exist.</p>
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
          href="/shop" 
          className="inline-flex items-center space-x-2 mb-8 text-gray-600 hover:text-gray-900 transition-colors dark:text-gray-400 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Shop</span>
        </Link>

        <div className="mb-12 border-l-4 border-pink-500 pl-4">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">{tier.name}</h1>
          <p className="mt-2 text-xl text-gray-600 dark:text-gray-300">{tier.description}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {tier.strains.map((strain) => (
            <StrainCard key={strain.id} strain={strain} tierSlug={tier.slug} />
          ))}
        </div>
      </main>
    </div>
  );
}
