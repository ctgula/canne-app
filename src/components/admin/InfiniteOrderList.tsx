'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { OrderListItem } from './OrderListItem';
import { OrderSkeletonList } from './OrderSkeleton';
import OrderDetailsModal from './OrderDetailsModal';
import { supabase } from '@/lib/supabase';

type OrderStatus = 'pending' | 'paid' | 'assigned' | 'delivered' | 'issue';

interface Order {
  id: string;
  customer: string;
  phone: string;
  address: string;
  items: number;
  amount: number;
  timePref: string;
  createdAt: string;
  status: OrderStatus;
  orderNumber?: string;
  product?: string;
}

interface InfiniteOrderListProps {
  status: OrderStatus;
  filters: {
    hub: string;
    timeWindow: string;
    date: string;
    sort: string;
  };
  onAssign: (orderId: string) => void;
  onIssue: (orderId: string) => void;
  onText: (orderId: string) => void;
  onCall: (orderId: string) => void;
  onDirections: (orderId: string) => void;
}

const ITEMS_PER_PAGE = 20;

export function InfiniteOrderList({
  status,
  filters,
  onAssign,
  onIssue,
  onText,
  onCall,
  onDirections
}: InfiniteOrderListProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsOrderId, setDetailsOrderId] = useState<string | null>(null);
  
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastOrderRef = useCallback((node: HTMLDivElement) => {
    if (loadingMore) return;
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore();
      }
    });
    
    if (node) observerRef.current.observe(node);
  }, [loadingMore, hasMore]);

  const fetchOrders = async (page = 0, reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      const params = new URLSearchParams({
        status,
        page: page.toString(),
        limit: ITEMS_PER_PAGE.toString(),
        ...filters
      });

      const response = await fetch(`/api/admin/orders?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      const rawOrders = data.orders || [];
      
      // Transform API data to match OrderListItem interface
      const newOrders: Order[] = rawOrders.map((order: any) => ({
        id: order.id,
        customer: `${order.customers?.first_name || ''} ${order.customers?.last_name || ''}`.trim() || 'Unknown Customer',
        phone: order.customers?.phone || order.phone || 'No phone',
        address: `${order.delivery_address_line1 || ''} ${order.delivery_city || ''}`.trim() || 'No address',
        items: order.order_items?.length || 0,
        // Backend returns dollar amounts; formatCurrency expects cents
        amount: Math.round((order.total || 0) * 100),
        timePref: 'ASAP', // Default since not in current schema
        createdAt: order.created_at,
        status: (() => {
          const s = (order.status || '').toLowerCase();
          if (['pending', 'awaiting_payment', 'verifying'].includes(s)) return 'pending';
          if (s === 'paid') return 'paid';
          if (s === 'assigned') return 'assigned';
          if (s === 'delivered') return 'delivered';
          if (['refunded', 'canceled', 'undelivered', 'issue'].includes(s)) return 'issue';
          return 'pending';
        })(),
        orderNumber: order.order_number || order.short_code,
        product: order.order_items?.[0]?.products?.name || undefined,
      }));

      if (reset) {
        // New order detection (toast)
        const prevFirstId = orders[0]?.id;
        setOrders(newOrders);
        if (prevFirstId && newOrders[0] && newOrders[0].id !== prevFirstId) {
          toast.success('New order received');
        }
      } else {
        setOrders(prev => [...prev, ...newOrders]);
      }

      setHasMore(newOrders.length === ITEMS_PER_PAGE);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders');
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      const nextPage = Math.floor(orders.length / ITEMS_PER_PAGE);
      fetchOrders(nextPage, false);
    }
  };

  const refresh = async () => {
    setRefreshing(true);
    await fetchOrders(0, true);
  };

  // Pull to refresh
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const startY = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      startY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPulling || window.scrollY > 0) return;

    const currentY = e.touches[0].clientY;
    const distance = Math.max(0, currentY - startY.current);
    
    if (distance > 0) {
      e.preventDefault();
      setPullDistance(Math.min(distance, 100));
    }
  };

  const handleTouchEnd = () => {
    if (pullDistance > 60) {
      refresh();
    }
    setIsPulling(false);
    setPullDistance(0);
  };

  // Reset when status or filters change
  useEffect(() => {
    fetchOrders(0, true);
  }, [status, filters]);

  // Supabase realtime: refresh on new/updated orders
  useEffect(() => {
    const channel = supabase
      .channel('orders-admin')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        // Light refresh to pick up changes
        fetchOrders(0, true);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading && orders.length === 0) {
    return <OrderSkeletonList count={8} />;
  }

  if (error && orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="text-red-500 text-center">
          <p className="font-medium">Failed to load orders</p>
          <p className="text-sm text-gray-600 mt-1">{error}</p>
          <button
            onClick={() => fetchOrders(0, true)}
            className="mt-4 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull to refresh indicator */}
      {isPulling && (
        <div 
          className="absolute top-0 left-0 right-0 flex items-center justify-center bg-blue-50 text-blue-700 text-sm font-medium transition-all duration-200 z-10"
          style={{ 
            height: `${pullDistance}px`,
            transform: `translateY(-${100 - pullDistance}px)`
          }}
        >
          {pullDistance > 60 ? '↓ Release to refresh' : '↓ Pull to refresh'}
        </div>
      )}

      <div className="space-y-3 px-4 pb-4">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-gray-500 text-center">
              <p className="font-medium">No {status} orders</p>
              <p className="text-sm mt-1">Orders will appear here when available</p>
            </div>
          </div>
        ) : (
          orders.map((order, index) => (
            <div
              key={order.id}
              ref={index === orders.length - 1 ? lastOrderRef : undefined}
            >
              <OrderListItem
                order={order}
                onAssign={() => onAssign(order.id)}
                onIssue={() => onIssue(order.id)}
                onText={() => onText(order.id)}
                onCall={() => onCall(order.id)}
                onDirections={() => onDirections(order.id)}
                onOpenDetails={() => { setDetailsOrderId(order.id); setDetailsOpen(true); }}
              />
            </div>
          ))
        )}

        {/* Loading more indicator */}
        {loadingMore && (
          <div className="py-4">
            <OrderSkeletonList count={3} />
          </div>
        )}

        {/* End of list indicator */}
        {!hasMore && orders.length > 0 && (
          <div className="text-center py-4 text-sm text-gray-500">
            No more orders to load
          </div>
        )}
      </div>

      {/* Details Modal */}
      <OrderDetailsModal
        isOpen={detailsOpen}
        orderId={detailsOrderId}
        onClose={() => { setDetailsOpen(false); setDetailsOrderId(null); }}
      />
    </div>
  );
}
