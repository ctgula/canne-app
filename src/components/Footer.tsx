'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white py-8 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Logo and Copyright */}
          <div className="mb-6 md:mb-0">
            <div className="flex items-center">
              <div className="flex items-center">
                <div className="w-6 h-6">
                  <div className="w-5 h-5 rounded-full bg-pink-500"></div>
                </div>
                <div className="ml-1 flex flex-col">
                  <div className="text-sm font-bold text-pink-500 uppercase tracking-wide">
                    CANNÈ
                  </div>
                  <div className="text-[8px] uppercase text-gray-500 tracking-wider -mt-1">
                    Art Collective
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              © {new Date().getFullYear()} Cannè. All rights reserved.
            </div>
          </div>
          
          {/* Navigation Links */}
          <div className="flex flex-wrap justify-center gap-8">
            <Link href="/" className="text-gray-700 hover:text-gray-900 text-sm">
              Home
            </Link>
            <Link href="/shop" className="text-gray-700 hover:text-gray-900 text-sm">
              Shop
            </Link>
            <Link href="/how-it-works" className="text-gray-700 hover:text-gray-900 text-sm">
              How it Works
            </Link>
            <Link href="/i71" className="text-gray-700 hover:text-gray-900 text-sm">
              I71 Compliance
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-gray-900 text-sm">
              About
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
