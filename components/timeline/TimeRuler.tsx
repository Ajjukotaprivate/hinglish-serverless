"use client";

import { useEditorStore } from "@/lib/store";

const PIXELS_PER_SECOND = 50; // Match tracks

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

export function TimeRuler({ duration }: { duration: number }) {
  const { playhead } = useEditorStore();

  const maxDuration = Math.max(duration, 10);
  const trackWidth = maxDuration * PIXELS_PER_SECOND;
  const playheadPosition = playhead * PIXELS_PER_SECOND;

  // Generate tick marks every 2 or 5 seconds depending on duration
  const interval = duration > 60 ? 10 : duration > 30 ? 5 : 2;
  const ticks = [];
  for (let t = 0; t <= Math.ceil(maxDuration); t += interval) {
    ticks.push(t);
  }

  return (
    <div className="flex h-6 border-b border-gray-300 bg-gray-100">
      {/* Label column - matches track labels */}
      <div className="w-14 flex-shrink-0 border-r border-gray-200 bg-gray-50" />

      {/* Scrollable ruler area */}
      <div className="flex-1 overflow-x-auto">
        <div
          className="relative h-full"
          style={{ width: `${trackWidth}px`, minWidth: "100%" }}
        >
          {/* Time ticks */}
          {ticks.map((t) => (
            <div
              key={t}
              className="absolute top-0 h-full"
              style={{ left: `${t * PIXELS_PER_SECOND}px` }}
            >
              <div className="h-2 w-px bg-gray-400" />
              <span className="absolute top-2 text-[10px] text-gray-500 -translate-x-1/2">
                {formatTime(t)}
              </span>
            </div>
          ))}

          {/* Playhead indicator */}
          <div
            className="absolute top-0 h-full w-0.5 bg-red-500 z-20"
            style={{ left: `${playheadPosition}px` }}
          />
        </div>
      </div>
    </div>
  );
}

