"use client";

import { useRef, useCallback } from "react";
import { useEditorStore } from "@/lib/store";

interface TimeRulerProps {
  duration: number;
  pixelsPerSecond: number;
  scrollLeft: number;
  onSeek: (time: number) => void;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

export function TimeRuler({ duration, pixelsPerSecond, scrollLeft, onSeek }: TimeRulerProps) {
  const { playhead } = useEditorStore();
  const rulerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const maxDuration = Math.max(duration, 10);
  const trackWidth = maxDuration * pixelsPerSecond;
  const playheadPosition = playhead * pixelsPerSecond;

  // Generate tick marks
  const interval = duration > 120 ? 15 : duration > 60 ? 10 : 5;
  const ticks = [];
  for (let t = 0; t <= Math.ceil(maxDuration); t += interval) {
    ticks.push(t);
  }

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging.current || !rulerRef.current) return;
    const rect = rulerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left + scrollLeft;
    const time = Math.max(0, Math.min(duration, x / pixelsPerSecond));
    onSeek(time);
  }, [duration, pixelsPerSecond, scrollLeft, onSeek]);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  }, [handleMouseMove]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!rulerRef.current) return;
    isDragging.current = true;
    const rect = rulerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left + scrollLeft;
    const time = Math.max(0, Math.min(duration, x / pixelsPerSecond));
    onSeek(time);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div className="flex h-6 bg-gray-50">
      {/* Label column spacer */}
      <div className="w-28 flex-shrink-0 border-r border-gray-200" />

      {/* Scrollable ruler */}
      <div
        ref={rulerRef}
        className="relative flex-1 cursor-pointer overflow-hidden"
        onMouseDown={handleMouseDown}
        style={{ marginLeft: -scrollLeft }}
      >
        <div
          className="relative h-full"
          style={{ width: `${trackWidth}px`, marginLeft: scrollLeft }}
        >
          {/* Tick marks */}
          {ticks.map((t) => (
            <div
              key={t}
              className="absolute top-0 flex h-full flex-col"
              style={{ left: `${t * pixelsPerSecond}px` }}
            >
              <span className="text-[10px] text-gray-500 -translate-x-1/2">
                {formatTime(t)}
              </span>
              <div className="mt-auto h-2 w-px bg-gray-300" />
            </div>
          ))}

          {/* Playhead handle */}
          <div
            className="absolute top-0 z-20 flex flex-col items-center"
            style={{ left: `${playheadPosition}px`, transform: "translateX(-50%)" }}
          >
            {/* Triangle handle */}
            <div
              className="h-0 w-0 cursor-ew-resize"
              style={{
                borderLeft: "6px solid transparent",
                borderRight: "6px solid transparent",
                borderTop: "8px solid #1f2937",
              }}
            />
            {/* Line extends into tracks */}
          </div>
        </div>
      </div>
    </div>
  );
}
