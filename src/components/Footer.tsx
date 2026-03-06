'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Image
                src="/images/canne_logo_web.png"
                alt="Cannè"
                width={32}
                height={32}
                className="w-8 h-8"
              />
              <div>
                <span className="font-bold text-sm bg-gradient-to-r from-pink-500 to-purple-600 text-transparent bg-clip-text tracking-wide">CANNÈ</span>
                <span className="block text-[10px] text-gray-500 dark:text-gray-400 font-medium tracking-wider">ART COLLECTIVE</span>
              </div>
            </Link>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              Premium digital artwork with complimentary gifts. I-71 compliant in Washington, D.C.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Navigate</h3>
            <ul className="space-y-2">
              {[
                { href: '/', label: 'Home' },
                { href: '/shop', label: 'Shop' },
                { href: '/how-it-works', label: 'How it Works' },
                { href: '/about', label: 'About' },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Legal</h3>
            <ul className="space-y-2">
              {[
                { href: '/i71', label: 'I-71 Compliance' },
                { href: '/privacy', label: 'Privacy Policy' },
                { href: '/terms', label: 'Terms of Service' },
                { href: '/faq', label: 'FAQ' },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Contact</h3>
            <ul className="space-y-2">
              <li>
                <a href="mailto:support@canne.art" className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                  support@canne.art
                </a>
              </li>
              <li>
                <Link href="/drivers" className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                  Become a Driver
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-500 dark:text-gray-500">
            © {new Date().getFullYear()} Cannè Art Collective. All rights reserved. Must be 21+ to purchase. DC delivery only.
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-600">
            All transactions are for digital artwork. Cannabis gifts are complimentary per I-71.
          </p>
        </div>
      </div>
    </footer>
  );
}
