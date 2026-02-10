"use client";

import { useEditorStore } from "@/lib/store";
import { SubtitleItem } from "./SubtitleItem";

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}.${String(ms).padStart(2, "0")}`;
}

export function SubtitleList() {
  const { segments } = useEditorStore();

  if (segments.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-gray-500">
        No subtitles yet. Please transcribe.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {segments.map((seg, index) => (
        <SubtitleItem
          key={seg.id}
          segment={seg}
          index={index + 1}
          isLast={index === segments.length - 1}
        />
      ))}
    </div>
  );
}
