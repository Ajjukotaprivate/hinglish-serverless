"use client";

import { useEditorStore } from "@/lib/store";

const PIXELS_PER_SECOND = 50; // Match SubtitleTrack

export function VideoTrack() {
  const { videoUrl, videoDuration, playhead, mediaItems } = useEditorStore();

  const maxDuration = Math.max(videoDuration, 10);
  const trackWidth = maxDuration * PIXELS_PER_SECOND;
  const playheadPosition = playhead * PIXELS_PER_SECOND;

  // Get video filename from media items or URL
  const videoName = mediaItems.find((m) => m.type === "video")?.name || "Video";

  if (!videoUrl) {
    return (
      <div className="flex h-16 border-b border-gray-200">
        <div className="flex w-14 flex-shrink-0 items-center justify-center border-r border-gray-200 bg-gray-50">
          <span className="text-xs text-gray-500">Video</span>
        </div>
        <div className="flex flex-1 items-center justify-center bg-gray-100 text-sm text-gray-500">
          Upload video from Media panel
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-16 border-b border-gray-200">
      {/* Track label */}
      <div className="flex w-14 flex-shrink-0 items-center justify-center border-r border-gray-200 bg-gray-50">
        <span className="text-xs text-gray-500">Video</span>
      </div>

      {/* Scrollable track area */}
      <div className="flex-1 overflow-x-auto">
        <div
          className="relative h-full bg-gray-200"
          style={{ width: `${trackWidth}px`, minWidth: "100%" }}
        >
          {/* Playhead indicator */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
            style={{ left: `${playheadPosition}px` }}
          />

          {/* Video clip */}
          <div
            className="absolute top-1 bottom-1 left-0 bg-blue-300 border border-blue-400 rounded flex items-center px-2 overflow-hidden"
            style={{ width: `${videoDuration * PIXELS_PER_SECOND}px`, minWidth: "100px" }}
          >
            <span className="text-xs text-blue-900 truncate">
              {videoName} ({videoDuration.toFixed(1)}s)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

