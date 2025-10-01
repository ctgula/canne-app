'use client';

import { useState, useEffect } from 'react';
import { Eye, EyeOff, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomOpsBarProps {
  asapCount15m: number;
  asapQuota: number;
  onSettingsChange: (settings: OpsSettings) => void;
}

export interface OpsSettings {
  hideAsap: boolean;
  eventMode: boolean;
}

export function BottomOpsBar({ asapCount15m, asapQuota, onSettingsChange }: BottomOpsBarProps) {
  const [settings, setSettings] = useState<OpsSettings>({
    hideAsap: false,
    eventMode: false,
  });

  // Load settings from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('admin-ops-settings');
    if (saved) {
      try {
        const parsedSettings = JSON.parse(saved);
        setSettings(parsedSettings);
        onSettingsChange(parsedSettings);
      } catch (e) {
        console.error('Failed to parse saved settings:', e);
      }
    }
  }, [onSettingsChange]);

  const updateSetting = (key: keyof OpsSettings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('admin-ops-settings', JSON.stringify(newSettings));
    onSettingsChange(newSettings);

    // Haptic feedback if available
    if ('vibrate' in navigator) {
      navigator.vibrate(30);
    }
  };

  const asapPercentage = asapQuota > 0 ? (asapCount15m / asapQuota) * 100 : 0;
  const isOverQuota = asapCount15m > asapQuota;

  return (
    <div className="sticky bottom-0 z-30 bg-gradient-to-r from-white to-gray-50 border-t-2 border-purple-200 shadow-2xl">
      <div className="px-4 py-4">
        {/* ASAP Counter */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-gray-700">ASAP Orders (15 min)</span>
              <span className="text-[10px] text-gray-500">Current capacity usage</span>
            </div>
            <div className={cn(
              "px-3 py-1.5 rounded-full text-xs font-bold shadow-sm",
              isOverQuota 
                ? "bg-red-100 text-red-700 ring-2 ring-red-300" 
                : asapPercentage > 80 
                ? "bg-amber-100 text-amber-700"
                : "bg-green-100 text-green-700"
            )}>
              {asapCount15m}/{asapQuota}
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="flex-1 mx-3 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full transition-all duration-300",
                isOverQuota 
                  ? "bg-red-500" 
                  : asapPercentage > 80 
                  ? "bg-amber-500"
                  : "bg-green-500"
              )}
              style={{ width: `${Math.min(asapPercentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Toggle Controls */}
        <div className="grid grid-cols-2 gap-4">
          {/* Hide ASAP Toggle */}
          <button
            onClick={() => updateSetting('hideAsap', !settings.hideAsap)}
            className={cn(
              "flex flex-col items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all min-h-[70px] shadow-sm hover:shadow-md",
              settings.hideAsap
                ? "bg-gray-200 text-gray-800 ring-2 ring-gray-400"
                : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
            )}
            title="Hide ASAP orders from the list to focus on scheduled deliveries"
          >
            {settings.hideAsap ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
            <span className="font-semibold">Hide ASAP</span>
            <span className="text-xs text-gray-500">Filter view</span>
          </button>

          {/* Event Mode Toggle */}
          <button
            onClick={() => updateSetting('eventMode', !settings.eventMode)}
            className={cn(
              "flex flex-col items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all min-h-[70px] shadow-sm hover:shadow-md",
              settings.eventMode
                ? "bg-purple-500 text-white ring-2 ring-purple-600"
                : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
            )}
            title="High volume mode: optimized for events and peak times"
          >
            <Zap className="w-6 h-6" />
            <span className="font-semibold">Event Mode</span>
            <span className="text-xs opacity-80">Peak hours</span>
          </button>
        </div>

        {/* Active Status Indicators */}
        {(settings.hideAsap || settings.eventMode) && (
          <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t border-gray-200">
            {settings.hideAsap && (
              <span className="flex items-center gap-1.5 text-xs font-medium text-gray-600 px-3 py-1.5 bg-gray-100 rounded-full">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse" />
                ASAP Orders Hidden
              </span>
            )}
            {settings.eventMode && (
              <span className="flex items-center gap-1.5 text-xs font-medium text-purple-700 px-3 py-1.5 bg-purple-100 rounded-full">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                Event Mode Active
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
