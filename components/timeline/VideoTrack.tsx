"use client";

import { useEditorStore } from "@/lib/store";

export function VideoTrack() {
  const { videoUrl, videoDuration } = useEditorStore();

  if (!videoUrl) {
    return (
      <div className="flex h-14 items-center justify-center border-b border-gray-200 bg-gray-50 text-sm text-gray-500">
        Drag video from Media to timeline
      </div>
    );
  }

  return (
    <div className="flex h-14 items-center border-b border-gray-200 px-4">
      <div className="flex items-center gap-2">
        <span className="text-gray-400">👁</span>
        <span className="text-gray-400">🔊</span>
      </div>
      <div className="ml-4 flex flex-1 items-center overflow-hidden rounded bg-gray-100">
        <div
          className="h-10 bg-gray-300"
          style={{
            width: `${Math.min(100, (videoDuration / 60) * 100)}%`,
            minWidth: "100px",
          }}
        />
        <span className="ml-2 truncate text-xs text-gray-600">
          Video • {videoDuration.toFixed(1)}s
        </span>
      </div>
    </div>
  );
}
