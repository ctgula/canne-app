'use client';

import { motion } from 'framer-motion';

export default function PayPageSkeleton() {
  return (
    <main className="mx-auto max-w-xl p-6 space-y-6 min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      {/* Header skeleton */}
      <div className="text-center space-y-3">
        <div className="h-8 bg-gray-200 rounded-lg w-48 mx-auto animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-40 mx-auto animate-pulse"></div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <div className="h-6 bg-gray-200 rounded-full w-24 animate-pulse"></div>
          <div className="h-6 bg-gray-200 rounded-full w-32 animate-pulse"></div>
          <div className="h-6 bg-gray-200 rounded-lg w-20 animate-pulse"></div>
        </div>
      </div>

      {/* Payment details skeleton */}
      <div className="space-y-3 p-4 bg-white rounded-2xl border shadow-sm">
        <div className="h-5 bg-gray-200 rounded w-32 animate-pulse"></div>
        <div className="space-y-2">
          <div className="h-8 bg-gray-200 rounded-xl animate-pulse"></div>
          <div className="h-8 bg-gray-200 rounded-xl animate-pulse"></div>
          <div className="h-8 bg-gray-200 rounded-xl animate-pulse"></div>
        </div>
        <div className="mt-4 p-3 bg-gray-100 rounded-lg">
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded w-full animate-pulse"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* QR code skeleton */}
      <div className="flex flex-col items-center gap-4 rounded-2xl border p-6 bg-white shadow-sm">
        <div className="h-5 bg-gray-200 rounded w-32 animate-pulse"></div>
        <div className="w-70 h-70 bg-gray-200 rounded-lg animate-pulse"></div>
        <div className="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
        <div className="w-full max-w-xs h-12 bg-gray-200 rounded-xl animate-pulse"></div>
      </div>

      {/* Form skeleton */}
      <div className="space-y-4 rounded-2xl border p-6 bg-white shadow-sm">
        <div className="h-5 bg-gray-200 rounded w-24 animate-pulse"></div>
        <div className="space-y-3">
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded-xl animate-pulse"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-40 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded-xl animate-pulse"></div>
          </div>
          <div className="h-12 bg-gray-200 rounded-xl animate-pulse"></div>
        </div>
      </div>
    </main>
  );
}
