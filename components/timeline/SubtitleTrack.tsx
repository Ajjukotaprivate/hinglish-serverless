"use client";

import { useEditorStore } from "@/lib/store";
import type { SubtitleSegment } from "@/lib/types";

interface SubtitleTrackProps {
  segments: SubtitleSegment[];
}

export function SubtitleTrack({ segments }: SubtitleTrackProps) {
  const { videoDuration, playhead, selectedSegmentId, setSelectedSegment, setPlayhead } =
    useEditorStore();

  const maxDuration = Math.max(videoDuration, 1);

  if (segments.length === 0) {
    return (
      <div className="flex h-14 items-center justify-center border-b border-gray-200 bg-gray-50 text-sm text-gray-500">
        No subtitles yet. Transcribe to generate.
      </div>
    );
  }

  return (
    <div className="relative flex h-14 items-center border-b border-gray-200 px-4">
      <div className="flex items-center gap-2">
        <span className="text-gray-400">👁</span>
      </div>
      <div className="relative ml-4 flex flex-1 items-center">
        {segments.map((seg) => {
          const left = (seg.start / maxDuration) * 100;
          const width = ((seg.end - seg.start) / maxDuration) * 100;
          const isSelected = selectedSegmentId === seg.id;

          return (
            <div
              key={seg.id}
              role="button"
              tabIndex={0}
              onClick={() => {
                setSelectedSegment(seg.id);
                setPlayhead(seg.start);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  setSelectedSegment(seg.id);
                  setPlayhead(seg.start);
                }
              }}
              className={`absolute cursor-pointer rounded border py-1 px-2 text-xs transition-colors ${
                isSelected
                  ? "border-primary bg-blue-100 text-primary"
                  : "border-purple-300 bg-purple-50 text-gray-800 hover:bg-purple-100"
              }`}
              style={{
                left: `${left}%`,
                width: `${Math.max(width, 2)}%`,
                minWidth: "40px",
              }}
            >
              <span className="block truncate font-medium">Subtitle</span>
              <span className="block truncate text-gray-600">
                {seg.text.slice(0, 20)}...
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
