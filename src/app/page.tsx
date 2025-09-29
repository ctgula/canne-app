import Image from 'next/image';
import Link from 'next/link';
import ProductsPresenter from '@/components/ProductsPresenter';
import Header from '@/components/Header';
import { Sparkles, Shield, ArrowDown } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-4 pt-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Logo */}
          <div className="mb-8">
            <Image 
              src="/images/canne_logo_web.svg"
              alt="Cannè" 
              width={180} 
              height={180} 
              className="w-44 h-44 mx-auto"
              priority
            />
          </div>
          
          {/* Headline */}
          <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="block bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 text-transparent bg-clip-text">
              Art–first.
            </span>
            <span className="block bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-transparent bg-clip-text">
              Street–approved.
            </span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-700 mb-2 font-medium">
            Premium Digital Art with Complimentary Gifts
          </p>
          
          <p className="text-sm text-gray-500 mb-10">
            I-71 compliant • 21+ only • DC delivery available
          </p>
          
          {/* Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
            <Link href="/shop">
              <button className="flex items-center justify-center gap-2 px-10 py-4 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105">
                <Sparkles className="w-5 h-5" />
                Explore Collection
              </button>
            </Link>
            <Link href="/i71">
              <button className="flex items-center justify-center gap-2 px-10 py-4 rounded-full border-2 border-gray-200 text-gray-700 font-semibold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105">
                <Shield className="w-5 h-5" />
                I-71 Compliant
              </button>
            </Link>
          </div>
          
          {/* Discover More */}
          <div className="flex flex-col items-center text-gray-400 animate-bounce">
            <span className="text-sm mb-2">Discover More</span>
            <ArrowDown className="w-5 h-5" />
          </div>
        </div>
      </section>
      
      {/* Products Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Cannè Art Collection
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose your tier — each includes exclusive digital art with complimentary cannabis gifts
            </p>
          </div>
          <ProductsPresenter />
        </div>
      </section>
    </div>
  );
}
