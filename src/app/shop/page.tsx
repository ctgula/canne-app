"use client";

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductsPresenter from '@/components/ProductsPresenter';

export default function ShopPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="flex-1 pt-20 sm:pt-24">
        <ProductsPresenter />
      </main>
      
      <Footer />
    </div>
  );
}
