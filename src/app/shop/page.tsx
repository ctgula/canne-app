"use client";

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductsPresenter from '@/components/ProductsPresenter';

export default function ShopPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white via-gray-50/30 to-white">
      <Header />
      
      <main className="flex-1 pt-20 sm:pt-24">
        <ProductsPresenter />
      </main>
      
      <Footer />
    </div>
  );
}
