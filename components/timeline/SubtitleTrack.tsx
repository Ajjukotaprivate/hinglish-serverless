"use client";

import { useEditorStore } from "@/lib/store";
import type { SubtitleSegment } from "@/lib/types";

interface SubtitleTrackProps {
  segments: SubtitleSegment[];
}

const PIXELS_PER_SECOND = 50; // 50px per second of video

export function SubtitleTrack({ segments }: SubtitleTrackProps) {
  const { videoDuration, playhead, selectedSegmentId, setSelectedSegment, setPlayhead } =
    useEditorStore();

  const maxDuration = Math.max(videoDuration, 10); // Minimum 10s width
  const trackWidth = maxDuration * PIXELS_PER_SECOND;
  const playheadPosition = playhead * PIXELS_PER_SECOND;

  if (segments.length === 0) {
    return (
      <div className="flex h-16 items-center justify-center border-b border-gray-200 bg-gray-50 text-sm text-gray-500">
        No subtitles yet. Upload a video to generate transcription.
      </div>
    );
  }

  return (
    <div className="flex h-16 border-b border-gray-200">
      {/* Track label */}
      <div className="flex w-14 flex-shrink-0 items-center justify-center border-r border-gray-200 bg-gray-50">
        <span className="text-xs text-gray-500">Subs</span>
      </div>

      {/* Scrollable track area */}
      <div className="flex-1 overflow-x-auto">
        <div
          className="relative h-full bg-gray-100"
          style={{ width: `${trackWidth}px`, minWidth: "100%" }}
        >
          {/* Playhead indicator */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
            style={{ left: `${playheadPosition}px` }}
          />

          {/* Subtitle segments */}
          {segments.map((seg) => {
            const left = seg.start * PIXELS_PER_SECOND;
            const width = Math.max((seg.end - seg.start) * PIXELS_PER_SECOND, 30); // Min 30px width
            const isSelected = selectedSegmentId === seg.id;

            return (
              <div
                key={seg.id}
                role="button"
                tabIndex={0}
                onClick={() => {
                  setSelectedSegment(seg.id);
                  setPlayhead(seg.start);
                  // Seek video to this time
                  const video = document.getElementById("editor-video") as HTMLVideoElement;
                  if (video) video.currentTime = seg.start;
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    setSelectedSegment(seg.id);
                    setPlayhead(seg.start);
                  }
                }}
                className={`absolute top-1 bottom-1 cursor-pointer rounded px-2 text-xs transition-colors flex items-center overflow-hidden ${isSelected
                    ? "bg-blue-500 text-white border-2 border-blue-700"
                    : "bg-purple-200 text-gray-800 border border-purple-300 hover:bg-purple-300"
                  }`}
                style={{
                  left: `${left}px`,
                  width: `${width}px`,
                }}
                title={seg.text}
              >
                <span className="truncate">{seg.text}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

