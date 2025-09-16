'use client';

import { RefreshCw } from 'lucide-react';
import { formatAbbr } from '@/lib/utils';

interface AdminKpiBarProps {
  revenue: number;
  orders: number;
  pending: number;
  p90: number | null;
  lastUpdated: Date;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export function AdminKpiBar({ 
  revenue, 
  orders, 
  pending, 
  p90, 
  lastUpdated,
  onRefresh,
  isRefreshing = false
}: AdminKpiBarProps) {
  const formatLastUpdated = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins === 1) return '1m ago';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return '1h ago';
    if (diffHours < 24) return `${diffHours}h ago`;
    
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="sticky top-0 z-30 backdrop-blur-md bg-white/90 border-b border-gray-200 shadow-sm">
      <div className="mx-auto max-w-3xl px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex gap-4 text-sm font-medium">
            <span className="text-gray-900">
              <span className="font-bold text-green-600">Rev</span> {formatAbbr(revenue)}
            </span>
            <span className="text-gray-900">
              <span className="font-bold text-blue-600">Orders</span> {orders}
            </span>
            <span className="text-gray-900">
              <span className="font-bold text-amber-600">Pending</span> {pending}
            </span>
            <span className="text-gray-900">
              <span className="font-bold text-purple-600">p90</span> {p90 ? `${Math.round(p90)}s` : "—"}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 hidden sm:block">
              Updated {formatLastUpdated(lastUpdated)}
            </span>
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              aria-label="Refresh data"
              className="flex items-center justify-center w-8 h-8 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 active:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
        
        {/* Mobile-only last updated */}
        <div className="sm:hidden mt-1">
          <span className="text-xs text-gray-500">
            Updated {formatLastUpdated(lastUpdated)}
          </span>
        </div>
      </div>
    </div>
  );
}
