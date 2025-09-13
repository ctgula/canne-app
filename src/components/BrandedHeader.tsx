'use client';

import Link from 'next/link';
import { ArrowLeft, ShoppingBag } from 'lucide-react';

interface BrandedHeaderProps {
  showBackButton?: boolean;
  backHref?: string;
  title?: string;
}

export default function BrandedHeader({ 
  showBackButton = true, 
  backHref = '/shop',
  title = 'Cannè'
}: BrandedHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {showBackButton && (
              <Link 
                href={backHref}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
            )}
            
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {title}
              </h1>
            </Link>
          </div>
          
          <Link 
            href="/shop"
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="font-medium">Shop</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
