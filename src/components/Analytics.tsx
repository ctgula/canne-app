'use client';

import { useEffect } from 'react';

interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
}

class AnalyticsService {
  private static instance: AnalyticsService;
  private isEnabled: boolean = false;

  private constructor() {
    // Check if analytics is enabled via environment variable
    this.isEnabled = process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === 'true';
  }

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  public track(event: string, properties?: Record<string, any>) {
    if (!this.isEnabled) {
      console.log('Analytics (disabled):', event, properties);
      return;
    }

    // Feature-flag friendly implementation
    // Replace with your analytics provider (e.g., Mixpanel, Amplitude, etc.)
    try {
      // Example: window.gtag?.('event', event, properties);
      // Example: window.mixpanel?.track(event, properties);
      console.log('Analytics:', event, properties);
    } catch (error) {
      console.error('Analytics error:', error);
    }
  }

  // E-commerce events
  public viewItem(itemId: string, itemName: string, category: string, value: number) {
    this.track('view_item', {
      item_id: itemId,
      item_name: itemName,
      item_category: category,
      value: value
    });
  }

  public addToCart(itemId: string, itemName: string, category: string, value: number, quantity: number) {
    this.track('add_to_cart', {
      item_id: itemId,
      item_name: itemName,
      item_category: category,
      value: value,
      quantity: quantity
    });
  }

  public beginCheckout(value: number, items: any[]) {
    this.track('begin_checkout', {
      value: value,
      items: items
    });
  }

  public paymentSubmitted(orderId: string, value: number, paymentMethod: string) {
    this.track('payment_submitted', {
      order_id: orderId,
      value: value,
      payment_method: paymentMethod,
      status: 'verifying'
    });
  }

  public paymentConfirmed(orderId: string, value: number) {
    this.track('payment_confirmed', {
      order_id: orderId,
      value: value,
      status: 'paid'
    });
  }

  public driverAssigned(orderId: string, driverId: string) {
    this.track('driver_assigned', {
      order_id: orderId,
      driver_id: driverId
    });
  }

  public orderDelivered(orderId: string, value: number, deliveryTime: number) {
    this.track('delivered', {
      order_id: orderId,
      value: value,
      delivery_time_minutes: deliveryTime
    });
  }
}

// React hook for analytics
export function useAnalytics() {
  const analytics = AnalyticsService.getInstance();

  return {
    track: analytics.track.bind(analytics),
    viewItem: analytics.viewItem.bind(analytics),
    addToCart: analytics.addToCart.bind(analytics),
    beginCheckout: analytics.beginCheckout.bind(analytics),
    paymentSubmitted: analytics.paymentSubmitted.bind(analytics),
    paymentConfirmed: analytics.paymentConfirmed.bind(analytics),
    driverAssigned: analytics.driverAssigned.bind(analytics),
    orderDelivered: analytics.orderDelivered.bind(analytics)
  };
}

// Page view tracking component
export function PageView({ page }: { page: string }) {
  const { track } = useAnalytics();

  useEffect(() => {
    track('page_view', { page });
  }, [page, track]);

  return null;
}

export default AnalyticsService;
