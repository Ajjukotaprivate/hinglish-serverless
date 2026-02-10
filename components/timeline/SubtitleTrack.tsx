"use client";

import { useEditorStore } from "@/lib/store";
import type { SubtitleSegment } from "@/lib/types";

interface SubtitleTrackProps {
  segments: SubtitleSegment[];
  pixelsPerSecond: number;
  scrollLeft: number;
  onScroll: (scrollLeft: number) => void;
}

export function SubtitleTrack({ segments, pixelsPerSecond, scrollLeft, onScroll }: SubtitleTrackProps) {
  const { videoDuration, playhead, selectedSegmentId, setSelectedSegment, setPlayhead } =
    useEditorStore();

  const maxDuration = Math.max(videoDuration, 10);
  const trackWidth = maxDuration * pixelsPerSecond;
  const playheadPosition = playhead * pixelsPerSecond;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    onScroll(e.currentTarget.scrollLeft);
  };

  const handleSegmentClick = (seg: SubtitleSegment) => {
    setSelectedSegment(seg.id);
    setPlayhead(seg.start);
    const video = document.getElementById("editor-video") as HTMLVideoElement;
    if (video) video.currentTime = seg.start;
  };

  return (
    <div className="flex h-14 border-b border-gray-700">
      {/* Track controls */}
      <div className="flex w-28 flex-shrink-0 items-center gap-1 border-r border-gray-700 bg-gray-800 px-2">
        <span className="text-[10px] text-gray-400">1</span>
        <button className="text-gray-300 hover:text-white" title="Toggle visibility">
          <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
          </svg>
        </button>
        <div className="mx-1 h-4 w-px bg-gray-700" />
        <button className="text-gray-500 hover:text-gray-300" title="Add">+</button>
        <button className="text-gray-500 hover:text-red-400" title="Delete">
          <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
          </svg>
        </button>
      </div>

      {/* Scrollable track */}
      <div
        className="flex-1 overflow-x-auto bg-gray-850"
        style={{ backgroundColor: "#1a1d21" }}
        onScroll={handleScroll}
      >
        <div
          className="relative h-full"
          style={{ width: `${trackWidth}px`, minWidth: "100%" }}
        >
          {/* Playhead */}
          <div
            className="absolute top-0 bottom-0 z-10 w-0.5"
            style={{ left: `${playheadPosition}px` }}
          >
            <div className="absolute top-0 bottom-0 w-px bg-white opacity-80" />
          </div>

          {/* Subtitle segments - orange/coral like SubtitlesFast */}
          {segments.map((seg) => {
            const left = seg.start * pixelsPerSecond;
            const width = Math.max((seg.end - seg.start) * pixelsPerSecond, 30);
            const isSelected = selectedSegmentId === seg.id;

            return (
              <div
                key={seg.id}
                role="button"
                tabIndex={0}
                onClick={() => handleSegmentClick(seg)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") handleSegmentClick(seg);
                }}
                className={`absolute top-1.5 bottom-1.5 cursor-pointer rounded-sm transition-all flex items-center justify-center overflow-hidden ${isSelected
                    ? "ring-2 ring-white bg-orange-500"
                    : "bg-orange-500 hover:bg-orange-400"
                  }`}
                style={{
                  left: `${left}px`,
                  width: `${width}px`,
                }}
                title={seg.text}
              >
                <span className="truncate px-1 text-[10px] font-medium text-white drop-shadow">
                  {seg.text.length > 15 ? seg.text.slice(0, 15) + "…" : seg.text}
                </span>
              </div>
            );
          })}

          {/* Empty state */}
          {segments.length === 0 && (
            <div className="flex h-full items-center justify-center">
              <span className="text-xs text-gray-500">No subtitles</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
