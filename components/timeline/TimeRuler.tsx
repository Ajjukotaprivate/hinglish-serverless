"use client";

import { useEditorStore } from "@/lib/store";

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}.${String(ms).padStart(2, "0")}`;
}

export function TimeRuler({ duration }: { duration: number }) {
  const { playhead } = useEditorStore();

  const ticks = [];
  const interval = duration > 60 ? 10 : duration > 30 ? 5 : 2;
  for (let t = 0; t <= Math.ceil(duration) + 5; t += interval) {
    ticks.push(t);
  }

  return (
    <div className="relative flex h-6 items-center border-b border-gray-200 bg-gray-50 px-2">
      {ticks.map((t) => (
        <span
          key={t}
          className="absolute text-xs text-gray-500"
          style={{ left: `${(t / (Math.ceil(duration) + 5)) * 100}%` }}
        >
          {formatTime(t)}
        </span>
      ))}
      <div
        className="absolute top-0 h-full w-0.5 bg-primary"
        style={{
          left: `${(playhead / Math.max(duration, 1)) * 100}%`,
        }}
      />
    </div>
  );
}
