'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AdminKpiBar } from '@/components/admin/AdminKpiBar';
import { SegmentedTabs } from '@/components/admin/SegmentedTabs';
import { FilterBar, FilterState } from '@/components/admin/FilterBar';
import { InfiniteOrderList } from '@/components/admin/InfiniteOrderList';
import { BottomOpsBar, OpsSettings } from '@/components/admin/BottomOpsBar';
import { OrderSkeletonList } from '@/components/admin/OrderSkeleton';

type TabValue = 'pending' | 'assigned' | 'delivered' | 'issue';

function AdminPageContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabValue>('pending');
  const [filters, setFilters] = useState<FilterState>({
    hub: 'all',
    timeWindow: 'all',
    date: 'today',
    sort: 'age',
  });
  const [opsSettings, setOpsSettings] = useState<OpsSettings>({
    hideAsap: false,
    eventMode: false,
    surgeActive: false,
  });
  const [kpiData, setKpiData] = useState({
    revenue: 0,
    orders: 0,
    pending: 0,
    p90: null as number | null,
    lastUpdated: new Date(),
  });
  const [tabCounts, setTabCounts] = useState({
    pending: 0,
    assigned: 0,
    delivered: 0,
    issue: 0,
  });
  const [asapCount15m, setAsapCount15m] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Initialize tab from URL
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab') as TabValue;
    if (tabFromUrl && ['pending', 'assigned', 'delivered', 'issue'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  // Fetch KPI data and tab counts
  const fetchKpiData = async () => {
    setIsRefreshing(true);
    try {
      const [kpiResponse, countsResponse, asapResponse] = await Promise.all([
        fetch('/api/admin/kpi'),
        fetch('/api/admin/tab-counts'),
        fetch('/api/admin/asap-count')
      ]);

      if (kpiResponse.ok) {
        const kpiData = await kpiResponse.json();
        setKpiData({
          revenue: kpiData.revenue || 0,
          orders: kpiData.orders || 0,
          pending: kpiData.pending || 0,
          p90: kpiData.p90 || null,
          lastUpdated: new Date(),
        });
      }

      if (countsResponse.ok) {
        const counts = await countsResponse.json();
        setTabCounts(counts);
      }

      if (asapResponse.ok) {
        const asapData = await asapResponse.json();
        setAsapCount15m(asapData.count || 0);
      }
    } catch (error) {
      console.error('Error fetching KPI data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchKpiData();
    // Refresh KPI data every 30 seconds
    const interval = setInterval(fetchKpiData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Order action handlers
  const handleAssign = async (orderId: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/assign`, {
        method: 'POST',
      });
      if (response.ok) {
        fetchKpiData(); // Refresh counts
      }
    } catch (error) {
      console.error('Error assigning order:', error);
    }
  };

  const handleIssue = async (orderId: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/issue`, {
        method: 'POST',
      });
      if (response.ok) {
        fetchKpiData(); // Refresh counts
      }
    } catch (error) {
      console.error('Error marking order as issue:', error);
    }
  };

  const handleText = (orderId: string) => {
    // Open SMS app or show text interface
    console.log('Text order:', orderId);
  };

  const handleCall = (orderId: string) => {
    // Open phone app
    console.log('Call order:', orderId);
  };

  const handleDirections = (orderId: string) => {
    // Open maps app
    console.log('Directions for order:', orderId);
  };

  const tabs = [
    { value: 'pending' as const, label: 'Pending', count: tabCounts.pending },
    { value: 'assigned' as const, label: 'Assigned', count: tabCounts.assigned },
    { value: 'delivered' as const, label: 'Delivered', count: tabCounts.delivered },
    { value: 'issue' as const, label: 'Issues', count: tabCounts.issue },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Sticky KPI Header */}
      <AdminKpiBar
        revenue={kpiData.revenue}
        orders={kpiData.orders}
        pending={kpiData.pending}
        p90={kpiData.p90}
        lastUpdated={kpiData.lastUpdated}
        onRefresh={fetchKpiData}
        isRefreshing={isRefreshing}
      />

      {/* Segmented Tabs */}
      <SegmentedTabs
        tabs={tabs}
        value={activeTab}
        onValueChange={setActiveTab}
      />

      {/* Filters */}
      <FilterBar onFiltersChange={setFilters} />

      {/* Order List */}
      <InfiniteOrderList
        status={activeTab}
        filters={filters}
        onAssign={handleAssign}
        onIssue={handleIssue}
        onText={handleText}
        onCall={handleCall}
        onDirections={handleDirections}
      />

      {/* Bottom Operations Bar */}
      <BottomOpsBar
        asapCount15m={asapCount15m}
        asapQuota={20} // Configure as needed
        onSettingsChange={setOpsSettings}
      />
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<OrderSkeletonList count={8} />}>
      <AdminPageContent />
    </Suspense>
  );
} 