"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";

// Wave config per hub
const HUB_WAVES = {
  FARRAGUT: {
    // minute marks inside an hour when a wave begins
    minuteMarks: [0, 10, 20, 30, 40, 50],
    windowMinutes: 90, // 60–90 but we'll present 90 as the outer bound
    laterBlocks: [
      { label: "5:30–7:00 pm", startHour: 17, startMin: 30, endHour: 19, endMin: 0 },
      { label: "7:00–8:30 pm", startHour: 19, startMin: 0, endHour: 20, endMin: 30 },
      { label: "9:00–10:30 pm (Fri/Sat)", startHour: 21, startMin: 0, endHour: 22, endMin: 30, friSatOnly: true },
    ],
  },
  MVS: {
    minuteMarks: [5, 15, 25, 35, 45, 55], // offset vs. Farragut
    windowMinutes: 90,
    laterBlocks: [
      { label: "5:30–7:00 pm", startHour: 17, startMin: 30, endHour: 19, endMin: 0 },
      { label: "7:00–8:30 pm", startHour: 19, startMin: 0, endHour: 20, endMin: 30 },
      { label: "9:30–11:00 pm (Fri/Sat)", startHour: 21, startMin: 30, endHour: 23, endMin: 0, friSatOnly: true },
    ],
  },
} as const;

export type HubKey = keyof typeof HUB_WAVES;
export type DeliveryMode = "NOW" | "WINDOW" | "LATER";

export type DeliverySelection = {
  mode: DeliveryMode;
  windowStart?: Date | null;
  windowEnd?: Date | null;
};

function nextWaveWindow(hub: HubKey, now = new Date()): { start: Date; end: Date; label: string } {
  const cfg = HUB_WAVES[hub];
  const n = new Date(now);
  const minute = n.getMinutes();
  // find next minute mark
  let mark = cfg.minuteMarks.find((m) => m > minute);
  let start = new Date(n);
  if (mark === undefined) {
    // next hour's first mark
    start.setHours(start.getHours() + 1, cfg.minuteMarks[0], 0, 0);
  } else {
    start.setMinutes(mark, 0, 0);
  }
  const end = new Date(start.getTime() + cfg.windowMinutes * 60 * 1000);
  const label = `${formatTime(start)}–${formatTime(end)}`;
  return { start, end, label };
}

function formatTime(d: Date) {
  let h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? "pm" : "am";
  h = h % 12 || 12;
  const mm = m.toString().padStart(2, "0");
  return `${h}:${mm} ${ampm}`;
}

function sameDayBlockToDates(block: {startHour:number;startMin:number;endHour:number;endMin:number}, today = new Date()) {
  const start = new Date(today);
  start.setHours(block.startHour, block.startMin, 0, 0);
  const end = new Date(today);
  end.setHours(block.endHour, block.endMin, 0, 0);
  return { start, end };
}

export default function DeliveryOptions({
  hub = "FARRAGUT",
  initialSelection,
  onChange,
}: {
  hub?: HubKey;
  initialSelection?: DeliverySelection;
  onChange?: (sel: DeliverySelection) => void;
}) {
  const [mode, setMode] = useState<DeliveryMode>(initialSelection?.mode ?? "NOW");
  const [laterIdx, setLaterIdx] = useState<number | null>(null);

  const { start: waveStart, end: waveEnd, label: waveLabel } = useMemo(
    () => nextWaveWindow(hub),
    [hub]
  );

  const cfg = HUB_WAVES[hub];
  const today = new Date();
  const isFriSat = [5, 6].includes(today.getDay());

  // derive selection object to emit upward
  const selection: DeliverySelection = useMemo(() => {
    if (mode === "NOW") return { mode };
    if (mode === "WINDOW") return { mode, windowStart: waveStart, windowEnd: waveEnd };
    if (mode === "LATER" && laterIdx !== null) {
      const block = cfg.laterBlocks[laterIdx];
      const { start, end } = sameDayBlockToDates(block, today);
      return { mode, windowStart: start, windowEnd: end };
    }
    return { mode }; // fallback
  }, [mode, laterIdx, waveStart, waveEnd, cfg.laterBlocks, today]);

  // emit to parent whenever it changes
  useMemo(() => {
    onChange?.(selection);
  }, [selection, onChange]);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Delivery time</h3>

      {/* ASAP */}
      <label
        className={clsx(
          "flex w-full items-start gap-3 rounded-2xl border p-4 cursor-pointer transition-all duration-200",
          mode === "NOW" ? "border-purple-600 bg-purple-50 dark:bg-purple-900/20" : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
        )}
      >
        <input
          type="radio"
          name="deliveryMode"
          value="NOW"
          checked={mode === "NOW"}
          onChange={() => setMode("NOW")}
          className="mt-1"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900 dark:text-gray-100">ASAP — ~45 minutes</span>
            {mode === "NOW" && <span className="text-xs rounded bg-purple-600 text-white px-2 py-0.5">Selected</span>}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Your order goes on the next run. <em>Fastest option.</em></p>
        </div>
      </label>

      {/* WINDOW (Recommended) */}
      <label
        className={clsx(
          "flex w-full items-start gap-3 rounded-2xl border p-4 cursor-pointer bg-amber-50 dark:bg-amber-900/20 transition-all duration-200",
          mode === "WINDOW" ? "border-amber-500 bg-amber-100 dark:bg-amber-900/40" : "border-amber-200 dark:border-amber-700 hover:border-amber-300 dark:hover:border-amber-600"
        )}
      >
        <input
          type="radio"
          name="deliveryMode"
          value="WINDOW"
          checked={mode === "WINDOW"}
          onChange={() => setMode("WINDOW")}
          className="mt-1"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900 dark:text-gray-100">Next Wave (Recommended) — {waveLabel}</span>
            <span className="text-xs rounded bg-amber-500 text-white px-2 py-0.5">⭐ Recommended</span>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Our most reliable slot. Keeps routes efficient & sustainable.
          </p>
        </div>
      </label>

      {/* LATER (accordion style) */}
      <div className="rounded-2xl border border-gray-300 dark:border-gray-600">
        <details open={mode === "LATER"} onToggle={(e) => setMode((e.currentTarget as HTMLDetailsElement).open ? "LATER" : mode)}>
          <summary className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200">
            <div className="flex items-center gap-3">
              <input
                type="radio"
                name="deliveryMode"
                value="LATER"
                checked={mode === "LATER"}
                onChange={() => setMode("LATER")}
              />
              <span className="font-semibold text-gray-900 dark:text-gray-100">Later Today — schedule a block</span>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Choose an evening window</span>
          </summary>

          <div className="px-4 pb-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {cfg.laterBlocks
                .filter((b) => (b as any).friSatOnly ? isFriSat : true)
                .map((block, idx) => (
                  <button
                    key={block.label}
                    type="button"
                    onClick={() => setLaterIdx(idx)}
                    className={clsx(
                      "rounded-xl border px-3 py-2 text-sm transition-all duration-200",
                      laterIdx === idx ? "border-purple-600 bg-purple-50 dark:bg-purple-900/20" : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                    )}
                  >
                    {block.label}
                  </button>
                ))}
            </div>
            {mode === "LATER" && laterIdx === null && (
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Pick one of the time blocks above.</p>
            )}
          </div>
        </details>
      </div>
    </div>
  );
}
