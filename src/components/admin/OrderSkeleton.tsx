'use client';

export function OrderSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
          <div className="h-3 bg-gray-200 rounded w-24" />
        </div>
        <div className="text-right ml-3">
          <div className="h-4 bg-gray-200 rounded w-16 mb-2" />
          <div className="h-5 bg-gray-200 rounded-full w-20" />
        </div>
      </div>
      
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 h-11 bg-gray-200 rounded-lg" />
        <div className="flex-1 h-11 bg-gray-200 rounded-lg" />
        <div className="flex-1 h-11 bg-gray-200 rounded-lg" />
        <div className="flex-1 h-11 bg-gray-200 rounded-lg" />
      </div>
    </div>
  );
}

export function OrderSkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3 px-4">
      {Array.from({ length: count }).map((_, i) => (
        <OrderSkeleton key={i} />
      ))}
    </div>
  );
}
