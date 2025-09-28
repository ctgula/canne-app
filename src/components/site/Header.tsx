"use client";

import Link from "next/link";
import { useState } from "react";
import { useCartStore } from '@/services/CartService';
import CartDisplay from '@/components/CartDisplay';

export function Header() {
  const [open, setOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { items } = useCartStore();

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg font-semibold">CANNÈ</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link href="/">Home</Link>
          <Link href="/shop">Shop</Link>
          <Link href="/how-it-works">How It Works</Link>
          <Link href="/i-71-compliance">I-71 Compliance</Link>
          <Link href="/about">About</Link>
        </nav>

        <div className="flex items-center gap-3">
          <div className="relative">
            <button 
              onClick={() => setIsCartOpen(!isCartOpen)}
              aria-label="Cart" 
              className="relative"
            >
              <span>🛒</span>
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 rounded-full bg-black text-white text-[10px] px-1.5 py-0.5">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Cart Dropdown */}
            {isCartOpen && (
              <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border z-50">
                <CartDisplay />
              </div>
            )}
          </div>
          
          <button className="md:hidden" onClick={() => setOpen(v => !v)} aria-label="Menu">
            ☰
          </button>
        </div>
      </div>

      {/* mobile slideout */}
      {open && (
        <div className="md:hidden border-t bg-white">
          <div className="mx-auto max-w-7xl px-4 py-3 flex flex-col gap-3 text-sm">
            <Link href="/" onClick={() => setOpen(false)}>Home</Link>
            <Link href="/shop" onClick={() => setOpen(false)}>Shop</Link>
            <Link href="/how-it-works" onClick={() => setOpen(false)}>How It Works</Link>
            <Link href="/i-71-compliance" onClick={() => setOpen(false)}>I-71 Compliance</Link>
            <Link href="/about" onClick={() => setOpen(false)}>About</Link>
          </div>
        </div>
      )}

      {/* Cart Overlay for Mobile */}
      {isCartOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 md:hidden"
          onClick={() => setIsCartOpen(false)}
        />
      )}
    </header>
  );
}
