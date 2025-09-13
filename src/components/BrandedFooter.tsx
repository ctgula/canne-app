'use client';

import Link from 'next/link';
import { Heart, Shield, Truck } from 'lucide-react';

export default function BrandedFooter() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div className="text-center md:text-left">
            <Link href="/" className="flex items-center gap-2 justify-center md:justify-start mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">C</span>
              </div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Cannè
              </h3>
            </Link>
            <p className="text-gray-600 text-sm">
              Premium art & I-71 compliant gifting delivered to your door in Washington, DC.
            </p>
          </div>

          {/* Features */}
          <div className="text-center">
            <h4 className="font-semibold text-gray-900 mb-4">Why Choose Cannè</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-2 justify-center">
                <Shield className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-600">I-71 Compliant</span>
              </div>
              <div className="flex items-center gap-2 justify-center">
                <Truck className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-gray-600">Fast Delivery</span>
              </div>
              <div className="flex items-center gap-2 justify-center">
                <Heart className="w-4 h-4 text-red-600" />
                <span className="text-sm text-gray-600">Premium Quality</span>
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="text-center md:text-right">
            <h4 className="font-semibold text-gray-900 mb-4">Quick Links</h4>
            <div className="space-y-2">
              <Link href="/shop" className="block text-sm text-gray-600 hover:text-purple-600 transition-colors">
                Shop Products
              </Link>
              <Link href="/how-it-works" className="block text-sm text-gray-600 hover:text-purple-600 transition-colors">
                How It Works
              </Link>
              <Link href="/i71" className="block text-sm text-gray-600 hover:text-purple-600 transition-colors">
                I-71 Info
              </Link>
              <Link href="/faq" className="block text-sm text-gray-600 hover:text-purple-600 transition-colors">
                FAQ
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-6 text-center">
          <p className="text-sm text-gray-500">
            © 2024 Cannè. All rights reserved. Must be 21+ to purchase.
          </p>
        </div>
      </div>
    </footer>
  );
}
