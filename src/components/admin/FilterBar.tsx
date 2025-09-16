'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronDown, Filter, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterBarProps {
  onFiltersChange: (filters: FilterState) => void;
}

export interface FilterState {
  hub: string;
  timeWindow: string;
  date: string;
  sort: string;
}

const hubOptions = [
  { value: 'all', label: 'All Hubs' },
  { value: 'farragut', label: 'Farragut' },
  { value: 'mvs', label: 'MVS' },
];

const timeWindowOptions = [
  { value: 'all', label: 'All Times' },
  { value: 'asap', label: 'ASAP' },
  { value: 'window', label: 'Window' },
  { value: 'later', label: 'Later' },
];

const dateOptions = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'week', label: 'This Week' },
];

const sortOptions = [
  { value: 'age', label: 'Age' },
  { value: 'amount', label: 'Amount' },
  { value: 'distance', label: 'Distance' },
];

export function FilterBar({ onFiltersChange }: FilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isExpanded, setIsExpanded] = useState(false);

  // Get current filter values from URL
  const currentFilters: FilterState = {
    hub: searchParams.get('hub') || 'all',
    timeWindow: searchParams.get('timeWindow') || 'all',
    date: searchParams.get('date') || 'today',
    sort: searchParams.get('sort') || 'age',
  };

  const updateFilter = (key: keyof FilterState, value: string) => {
    const newFilters = { ...currentFilters, [key]: value };
    
    // Update URL
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'all' || (key === 'date' && value === 'today') || (key === 'sort' && value === 'age')) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    
    router.push(`?${params.toString()}`, { scroll: false });
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('hub');
    params.delete('timeWindow');
    params.delete('date');
    params.delete('sort');
    
    router.push(`?${params.toString()}`, { scroll: false });
    
    const defaultFilters: FilterState = {
      hub: 'all',
      timeWindow: 'all',
      date: 'today',
      sort: 'age',
    };
    onFiltersChange(defaultFilters);
  };

  const hasActiveFilters = currentFilters.hub !== 'all' || 
                          currentFilters.timeWindow !== 'all' || 
                          currentFilters.date !== 'today' || 
                          currentFilters.sort !== 'age';

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="px-4 py-3">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full text-left"
        >
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filters</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 bg-blue-500 rounded-full" />
            )}
          </div>
          <ChevronDown className={cn(
            "w-4 h-4 text-gray-500 transition-transform",
            isExpanded && "rotate-180"
          )} />
        </button>

        {isExpanded && (
          <div className="mt-4 space-y-4">
            {/* Hub Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Hub</label>
              <div className="flex gap-2">
                {hubOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => updateFilter('hub', option.value)}
                    className={cn(
                      "px-3 py-1.5 text-xs rounded-lg border transition-colors",
                      currentFilters.hub === option.value
                        ? "bg-blue-50 text-blue-700 border-blue-200"
                        : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Window Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Time Window</label>
              <div className="flex gap-2">
                {timeWindowOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => updateFilter('timeWindow', option.value)}
                    className={cn(
                      "px-3 py-1.5 text-xs rounded-lg border transition-colors",
                      currentFilters.timeWindow === option.value
                        ? "bg-blue-50 text-blue-700 border-blue-200"
                        : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Date Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Date</label>
              <div className="flex gap-2">
                {dateOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => updateFilter('date', option.value)}
                    className={cn(
                      "px-3 py-1.5 text-xs rounded-lg border transition-colors",
                      currentFilters.date === option.value
                        ? "bg-blue-50 text-blue-700 border-blue-200"
                        : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Sort By</label>
              <div className="flex gap-2">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => updateFilter('sort', option.value)}
                    className={cn(
                      "px-3 py-1.5 text-xs rounded-lg border transition-colors",
                      currentFilters.sort === option.value
                        ? "bg-blue-50 text-blue-700 border-blue-200"
                        : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-3 py-1.5 text-xs text-red-600 hover:text-red-700 transition-colors"
              >
                <X className="w-3 h-3" />
                Clear All Filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
