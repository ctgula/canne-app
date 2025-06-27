'use client';

import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';
import { products } from '@/data/products';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  const scrollToCollection = () => {
    const element = document.getElementById('collection');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-white pt-12 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Centered Logo */}
          <div className="mb-12 flex flex-col items-center">
            <div className="w-24 h-24 relative mb-2">
              <div className="w-20 h-20 bg-pink-500 rounded-full absolute top-0 left-1/2 -translate-x-1/2"></div>
              <div className="w-16 h-14 bg-amber-400 clip-cone-wide absolute bottom-0 left-1/2 -translate-x-1/2"></div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 uppercase tracking-wide">CANNÈ</h2>
            <p className="text-sm uppercase text-gray-600 tracking-wider">ART COLLECTIVE</p>
          </div>
          
          {/* Premium Drops Banner */}
          <div className="max-w-md mx-auto mb-12">
            <div className="bg-gradient-to-r from-amber-400 via-pink-500 to-purple-500 text-white py-3 px-6 rounded-full flex items-center justify-center">
              <span className="mr-2">🔥</span>
              <span className="font-medium">Premium Drops Starting at $20</span>
              <span className="ml-2">✨</span>
            </div>
          </div>
          
          {/* Headline */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
            Art-first. Street-approved.
          </h1>
          
          {/* CTA Button */}
          <div className="mb-16">
            <Link 
              href="#collection"
              className="inline-flex items-center px-6 py-3 bg-pink-500 text-white font-medium rounded-full hover:bg-pink-600 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
            >
              Tap to unlock
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
          
          {/* Features */}
          <div className="flex flex-wrap justify-center gap-8 mb-12">
            <div className="flex items-center">
              <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-sm text-gray-700">I71 Compliant</span>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-700">DC Delivery</span>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold mb-4">
              <span className="block">Premium Art Prints with</span>
              <span className="text-pink-500">Complimentary Gifts</span>
            </h2>
            
            <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
              Experience our curated collection of cannabis-inspired art.
              Each purchase includes a complimentary gift, delivered to your
              door in DC.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <Link 
                href="#collection"
                className="px-6 py-3 bg-pink-500 text-white font-medium rounded-full hover:bg-pink-600 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
              >
                Shop the Menu
              </Link>
              <Link 
                href="/how-it-works"
                className="px-6 py-3 bg-white text-gray-900 font-medium rounded-full border border-gray-300 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
              >
                How It Works
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Collection Section */}
      <section id="collection" className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Collection</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Browse our curated selection of premium digital art pieces, each paired with a complimentary gift.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
                <span className="hidden sm:inline text-xs text-gray-600">Premium selection</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 md:gap-12 mb-12">
            {/* Brand Section */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center shadow-lg">
                  <span className="text-white text-lg font-bold">C</span>
                </div>
                <div className="text-3xl font-bold text-gray-900">Cannè</div>
              </div>
              <p className="text-gray-600 mb-8 max-w-md leading-relaxed">
                Premium digital art platform offering carefully curated artwork with complimentary gifts. 
                Fully compliant with Washington D.C. I-71 regulations.
              </p>
              
              {/* Enhanced Social Media */}
              <div className="flex space-x-4">
                <a href="https://instagram.com/canne" target="_blank" rel="noopener noreferrer" className="p-3 bg-gray-100 rounded-xl hover:bg-gray-200 hover:scale-105 transition-all duration-200 group">
                  <Instagram className="h-5 w-5 text-gray-600 group-hover:text-pink-600" />
                </a>
                <a href="https://twitter.com/canne" target="_blank" rel="noopener noreferrer" className="p-3 bg-gray-100 rounded-xl hover:bg-gray-200 hover:scale-105 transition-all duration-200 group">
                  <Twitter className="h-5 w-5 text-gray-600 group-hover:text-blue-600" />
                </a>
                <a href="https://facebook.com/canne" target="_blank" rel="noopener noreferrer" className="p-3 bg-gray-100 rounded-xl hover:bg-gray-200 hover:scale-105 transition-all duration-200 group">
                  <Facebook className="h-5 w-5 text-gray-600 group-hover:text-blue-700" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-6 text-lg">Quick Links</h3>
              <ul className="space-y-4 text-gray-600">
                <li><button onClick={scrollToCollection} className="hover:text-gray-900 hover:translate-x-1 hover:underline transition-all duration-200 text-left">Collection</button></li>
                <li><Link href="/about" className="hover:text-gray-900 hover:translate-x-1 hover:underline transition-all duration-200 block">About Us</Link></li>
                <li><Link href="/faq" className="hover:text-gray-900 hover:translate-x-1 hover:underline transition-all duration-200 block">FAQ</Link></li>
                <li><Link href="/admin/login" className="hover:text-gray-900 hover:translate-x-1 hover:underline transition-all duration-200 block">Admin</Link></li>
              </ul>
            </div>

            {/* Legal & Contact */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-6 text-lg">Legal & Contact</h3>
              <ul className="space-y-4 text-gray-600">
                <li><Link href="/terms" className="hover:text-gray-900 hover:translate-x-1 hover:underline transition-all duration-200 block">Terms & Conditions</Link></li>
                <li><Link href="/i71" className="hover:text-gray-900 hover:translate-x-1 hover:underline transition-all duration-200 block">I-71 Compliance</Link></li>
                <li><Link href="/privacy" className="hover:text-gray-900 hover:translate-x-1 hover:underline transition-all duration-200 block">Privacy Policy</Link></li>
                <li>
                  <a href="mailto:hello@canne.com" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 hover:text-gray-900 hover:underline transition-colors duration-200">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm">hello@canne.com</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Enhanced Bottom Bar */}
          <div className="border-t border-gray-200 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
              <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 sm:gap-6 md:gap-10 text-sm text-gray-500">
                <span className="flex items-center space-x-2 hover:text-gray-700 transition-colors">
                  <Palette className="h-4 w-4" />
                  <span>Curated Art</span>
                </span>
                <span className="flex items-center space-x-2 hover:text-gray-700 transition-colors">
                  <Truck className="h-4 w-4" />
                  <span>Free Delivery</span>
                </span>
                <span className="flex items-center space-x-2 hover:text-gray-700 transition-colors">
                  <Shield className="h-4 w-4" />
                  <span>I-71 Compliant</span>
                </span>
              </div>
              
              <div className="text-sm text-gray-500 text-center md:text-right">
                © {new Date().getFullYear()} Cannè. All rights reserved.
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
