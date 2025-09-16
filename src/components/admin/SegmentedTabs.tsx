'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';

type TabValue = 'pending' | 'assigned' | 'delivered' | 'issue';

interface Tab {
  value: TabValue;
  label: string;
  count: number;
}

interface SegmentedTabsProps {
  tabs: Tab[];
  value: TabValue;
  onValueChange: (value: TabValue) => void;
}

export function SegmentedTabs({ tabs, value, onValueChange }: SegmentedTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleTabChange = (newValue: TabValue) => {
    onValueChange(newValue);
    
    // Update URL with new tab
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', newValue);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="sticky top-[73px] z-20 bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex bg-gray-100 rounded-xl p-1">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleTabChange(tab.value)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200",
              value === tab.value
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            <span>{tab.label}</span>
            <span className={cn(
              "px-1.5 py-0.5 text-xs rounded-full font-semibold",
              value === tab.value
                ? "bg-gray-100 text-gray-700"
                : "bg-gray-200 text-gray-600"
            )}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
