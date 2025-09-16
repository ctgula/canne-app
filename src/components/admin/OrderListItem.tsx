'use client';

import { useState, useRef, useEffect } from 'react';
import { Phone, MapPin, User, MessageSquare } from 'lucide-react';
import { StatusChip } from './StatusChip';
import { formatCurrency, timeSince } from '@/lib/utils';

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

interface OrderListItemProps {
  order: Order;
  onAssign: () => void;
  onIssue: () => void;
  onText: () => void;
  onCall: () => void;
  onDirections: () => void;
}

export function OrderListItem({ 
  order, 
  onAssign, 
  onIssue, 
  onText, 
  onCall, 
  onDirections 
}: OrderListItemProps) {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [showActions, setShowActions] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const startY = useRef(0);

  const age = timeSince(order.createdAt);
  const SWIPE_THRESHOLD = 80;

  // Touch handlers for swipe actions
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    startX.current = touch.clientX;
    startY.current = touch.clientY;
    setIsDragging(true);

    // Start long press timer
    const timer = setTimeout(() => {
      setShowActions(true);
      // Haptic feedback if available
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
    }, 500);
    setLongPressTimer(timer);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - startX.current;
    const deltaY = touch.clientY - startY.current;

    // Cancel long press if moving
    if (longPressTimer && (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10)) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }

    // Only allow horizontal swipes
    if (Math.abs(deltaY) > Math.abs(deltaX)) return;

    // Prevent vertical scroll during horizontal swipe
    e.preventDefault();

    // Limit swipe distance
    const maxSwipe = 120;
    const clampedDelta = Math.max(-maxSwipe, Math.min(maxSwipe, deltaX));
    setSwipeOffset(clampedDelta);
  };

  const handleTouchEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }

    setIsDragging(false);

    // Handle swipe actions
    if (swipeOffset > SWIPE_THRESHOLD) {
      // Swipe right - Assign
      onAssign();
      if ('vibrate' in navigator) {
        navigator.vibrate(30);
      }
    } else if (swipeOffset < -SWIPE_THRESHOLD) {
      // Swipe left - Issue
      onIssue();
      if ('vibrate' in navigator) {
        navigator.vibrate(30);
      }
    }

    // Reset swipe
    setSwipeOffset(0);
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
      }
    };
  }, [longPressTimer]);

  return (
    <>
      <div 
        ref={cardRef}
        className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_1px_0_rgba(0,0,0,0.04)] transition-transform"
        style={{ 
          transform: `translateX(${swipeOffset}px)`,
          transition: isDragging ? 'none' : 'transform 0.2s ease-out'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Swipe indicators */}
        <div className="absolute inset-y-0 left-0 w-20 bg-blue-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <User className="w-5 h-5 text-white" />
        </div>
        <div className="absolute inset-y-0 right-0 w-20 bg-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <MessageSquare className="w-5 h-5 text-white" />
        </div>

        <div className="p-4 bg-white relative">
          {/* Top: Customer / Total / Status */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-gray-900 truncate">{order.customer || 'Guest'}</div>
              <div className="text-xs text-gray-500">Placed {age}</div>
            </div>
            <div className="text-right ml-3">
              <div className="text-base font-semibold text-gray-900">{formatCurrency(order.amount)}</div>
              <StatusChip status={order.status} />
            </div>
          </div>

          {/* Middle: Product + Time Pref + Order ID */}
          <div className="mb-3 text-sm text-gray-700">
            <div className="truncate">{order.product || 'Order'} · {order.timePref || 'ASAP'}</div>
            {order.orderNumber && (
              <div className="text-gray-500 text-xs">#{order.orderNumber}</div>
            )}
          </div>

          {/* Bottom: Action buttons */}
          <div className="flex items-center justify-between gap-2 text-sm">
            <button
              onClick={onAssign}
              className="flex-1 min-h-[44px] flex items-center justify-center gap-1 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 active:bg-gray-100 transition-colors font-medium"
            >
              <User className="w-4 h-4" />
              Assign
            </button>
            <button
              onClick={onText}
              className="flex-1 min-h-[44px] flex items-center justify-center gap-1 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 active:bg-gray-100 transition-colors font-medium"
            >
              <MessageSquare className="w-4 h-4" />
              Text
            </button>
            <button
              onClick={onCall}
              className="flex-1 min-h-[44px] flex items-center justify-center gap-1 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 active:bg-gray-100 transition-colors font-medium"
            >
              <Phone className="w-4 h-4" />
              Call
            </button>
            <button
              onClick={onDirections}
              className="flex-1 min-h-[44px] flex items-center justify-center gap-1 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 active:bg-gray-100 transition-colors font-medium"
            >
              <MapPin className="w-4 h-4" />
              Directions
            </button>
          </div>
        </div>
      </div>

      {/* Actions sheet modal for long press */}
      {showActions && (
        <div 
          className="fixed inset-0 z-50 bg-black/50 flex items-end"
          onClick={() => setShowActions(false)}
        >
          <div 
            className="w-full bg-white rounded-t-2xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
              <h3 className="font-semibold text-lg text-gray-900">Order Actions</h3>
              <p className="text-sm text-gray-600">{order.customer} · {formatCurrency(order.amount)}</p>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => { onAssign(); setShowActions(false); }}
                className="w-full min-h-[44px] flex items-center justify-center gap-3 rounded-xl bg-blue-50 text-blue-700 font-medium"
              >
                <User className="w-5 h-5" />
                Assign to Driver
              </button>
              <button
                onClick={() => { onIssue(); setShowActions(false); }}
                className="w-full min-h-[44px] flex items-center justify-center gap-3 rounded-xl bg-red-50 text-red-700 font-medium"
              >
                <MessageSquare className="w-5 h-5" />
                Mark as Issue
              </button>
              <button
                onClick={() => { onText(); setShowActions(false); }}
                className="w-full min-h-[44px] flex items-center justify-center gap-3 rounded-xl bg-gray-50 text-gray-700 font-medium"
              >
                <MessageSquare className="w-5 h-5" />
                Send Text
              </button>
              <button
                onClick={() => { onCall(); setShowActions(false); }}
                className="w-full min-h-[44px] flex items-center justify-center gap-3 rounded-xl bg-gray-50 text-gray-700 font-medium"
              >
                <Phone className="w-5 h-5" />
                Call Customer
              </button>
              <button
                onClick={() => { onDirections(); setShowActions(false); }}
                className="w-full min-h-[44px] flex items-center justify-center gap-3 rounded-xl bg-gray-50 text-gray-700 font-medium"
              >
                <MapPin className="w-5 h-5" />
                Get Directions
              </button>
            </div>
            
            <button
              onClick={() => setShowActions(false)}
              className="w-full min-h-[44px] rounded-xl border border-gray-300 bg-white text-gray-700 font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
