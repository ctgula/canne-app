'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AdminKpiBar } from '@/components/admin/AdminKpiBar';
import { SegmentedTabs } from '@/components/admin/SegmentedTabs';
import { FilterBar, FilterState } from '@/components/admin/FilterBar';
import { InfiniteOrderList } from '@/components/admin/InfiniteOrderList';
import { BottomOpsBar, OpsSettings } from '@/components/admin/BottomOpsBar';
import { OrderSkeletonList } from '@/components/admin/OrderSkeleton';
import AssignDriverModal from '@/components/admin/AssignDriverModal';
import { toast } from 'react-hot-toast';

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
  const [opsSettings, setOpsSettings] = useState<OpsSettings>({} as OpsSettings);
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
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignTargetOrderId, setAssignTargetOrderId] = useState<string | null>(null);

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

  const handleAssign = (orderId: string) => {
    setAssignTargetOrderId(orderId);
    setAssignModalOpen(true);
  };

  const handleConfirmAssign = async (driverId: string) => {
    if (!assignTargetOrderId) return;
    try {
      console.log('Assigning driver:', driverId, 'to order:', assignTargetOrderId);
      const res = await fetch(`/api/admin/orders/${assignTargetOrderId}/assign-driver`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driver_id: driverId })
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to assign');
      }

      console.log('Driver assigned successfully');
      toast.success('Driver assigned successfully!', {
        duration: 3000,
        style: { background: '#10b981', color: '#fff' }
      });
      fetchKpiData();
      // Optionally trigger a list refresh via FilterBar change or URL param change; list will auto-refresh on next poll
    } catch (e) {
      console.error(e);
      toast.error('Failed to assign order');
    } finally {
      setAssignModalOpen(false);
      setAssignTargetOrderId(null);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-20">
      {/* Modern Header */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                Cannè Orders Dashboard
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage and track all orders in real-time
              </p>
            </div>
            <button
              onClick={fetchKpiData}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all shadow-sm disabled:opacity-50"
            >
              <svg className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
          
          {/* Clean Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('pending')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all ${
                activeTab === 'pending'
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg scale-105'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-purple-300 hover:shadow-md'
              }`}
            >
              <span className="text-base">🟡</span>
              <span>Pending</span>
              {tabCounts.pending > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  activeTab === 'pending' ? 'bg-white/30' : 'bg-purple-100 text-purple-700'
                }`}>
                  {tabCounts.pending}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('assigned')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all ${
                activeTab === 'assigned'
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg scale-105'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-purple-300 hover:shadow-md'
              }`}
            >
              <span className="text-base">🔵</span>
              <span>Active</span>
              {tabCounts.assigned > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  activeTab === 'assigned' ? 'bg-white/30' : 'bg-purple-100 text-purple-700'
                }`}>
                  {tabCounts.assigned}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('delivered')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all ${
                activeTab === 'delivered'
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg scale-105'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-purple-300 hover:shadow-md'
              }`}
            >
              <span className="text-base">🟢</span>
              <span>Delivered</span>
              {tabCounts.delivered > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  activeTab === 'delivered' ? 'bg-white/30' : 'bg-purple-100 text-purple-700'
                }`}>
                  {tabCounts.delivered}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('issue')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all ${
                activeTab === 'issue'
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg scale-105'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-purple-300 hover:shadow-md'
              }`}
            >
              <span className="text-base">⚠️</span>
              <span>Issues</span>
              {tabCounts.issue > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  activeTab === 'issue' ? 'bg-white/30' : 'bg-purple-100 text-purple-700'
                }`}>
                  {tabCounts.issue}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Order List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <InfiniteOrderList
            status={activeTab}
            filters={filters}
            onAssign={handleAssign}
            onIssue={handleIssue}
            onText={handleText}
            onCall={handleCall}
            onDirections={handleDirections}
          />
        </div>
        
        {/* Live Summary Bar */}
        <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {kpiData.orders}
              </div>
              <div className="text-sm text-gray-600">Total Orders</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {tabCounts.delivered}
              </div>
              <div className="text-sm text-gray-600">Delivered</div>
            </div>
            <div>
              <div className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                ${(kpiData.revenue / 100).toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">Total Revenue</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">
                {tabCounts.pending}
              </div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
          </div>
        </div>
      </div>

      {/* Assign Driver Modal */}
      <AssignDriverModal
        isOpen={assignModalOpen}
        onClose={() => { setAssignModalOpen(false); setAssignTargetOrderId(null); }}
        onAssign={handleConfirmAssign}
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