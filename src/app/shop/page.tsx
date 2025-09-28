"use client";

import { Suspense } from 'react';
import ProductsPresenter from '@/components/ProductsPresenter';

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="text-center py-12">Loading products...</div>}>
      <ProductsPresenter />
    </Suspense>
  );
}
