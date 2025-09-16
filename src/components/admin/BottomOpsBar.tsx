'use client';

import { useState, useEffect } from 'react';
import { Eye, EyeOff, Zap, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomOpsBarProps {
  asapCount15m: number;
  asapQuota: number;
  onSettingsChange: (settings: OpsSettings) => void;
}

export interface OpsSettings {
  hideAsap: boolean;
  eventMode: boolean;
  surgeActive: boolean;
}

export function BottomOpsBar({ asapCount15m, asapQuota, onSettingsChange }: BottomOpsBarProps) {
  const [settings, setSettings] = useState<OpsSettings>({
    hideAsap: false,
    eventMode: false,
    surgeActive: false,
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
    <div className="sticky bottom-0 z-30 bg-white border-t border-gray-200 shadow-lg">
      <div className="px-4 py-3">
        {/* ASAP Counter */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-600">ASAP (15m)</span>
            <div className={cn(
              "px-2 py-1 rounded-full text-xs font-bold",
              isOverQuota 
                ? "bg-red-100 text-red-700" 
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
        <div className="flex items-center justify-between gap-3">
          {/* Hide ASAP Toggle */}
          <button
            onClick={() => updateSetting('hideAsap', !settings.hideAsap)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all min-h-[44px]",
              settings.hideAsap
                ? "bg-gray-100 text-gray-700"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100"
            )}
          >
            {settings.hideAsap ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>Hide ASAP</span>
          </button>

          {/* Event Mode Toggle */}
          <button
            onClick={() => updateSetting('eventMode', !settings.eventMode)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all min-h-[44px]",
              settings.eventMode
                ? "bg-purple-100 text-purple-700"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100"
            )}
          >
            <Zap className="w-4 h-4" />
            <span>Event Mode</span>
          </button>

          {/* Surge Toggle */}
          <button
            onClick={() => updateSetting('surgeActive', !settings.surgeActive)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all min-h-[44px]",
              settings.surgeActive
                ? "bg-green-100 text-green-700"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100"
            )}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Surge +$2</span>
          </button>
        </div>

        {/* Status indicators */}
        <div className="flex items-center justify-center gap-4 mt-2 text-xs text-gray-500">
          {settings.hideAsap && (
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full" />
              ASAP Hidden
            </span>
          )}
          {settings.eventMode && (
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-purple-400 rounded-full" />
              Event Active
            </span>
          )}
          {settings.surgeActive && (
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              Surge Active
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
