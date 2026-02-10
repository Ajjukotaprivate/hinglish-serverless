"use client";

import { useState, useCallback, useRef } from "react";
import { useEditorStore } from "@/lib/store";
import { PlaybackControls } from "@/components/timeline/PlaybackControls";
import { VideoTrack } from "@/components/timeline/VideoTrack";
import { SubtitleTrack } from "@/components/timeline/SubtitleTrack";
import { TimeRuler } from "@/components/timeline/TimeRuler";

export function Timeline() {
  const { videoUrl, videoDuration, segments, setPlayhead } = useEditorStore();

  // Zoom: pixels per second (50 = default, 20 = zoomed out, 200 = zoomed in)
  const [pixelsPerSecond, setPixelsPerSecond] = useState(50);

  // Synchronized scroll position
  const [scrollLeft, setScrollLeft] = useState(0);
  const rulerScrollRef = useRef<HTMLDivElement>(null);

  const handleZoomChange = (zoom: number) => {
    setPixelsPerSecond(zoom);
  };

  const handleSeek = useCallback((time: number) => {
    setPlayhead(time);
    const video = document.getElementById("editor-video") as HTMLVideoElement;
    if (video) video.currentTime = time;
  }, [setPlayhead]);

  const handleScroll = useCallback((newScrollLeft: number) => {
    setScrollLeft(newScrollLeft);
  }, []);

  return (
    <div className="flex h-56 flex-col border-t border-gray-300 bg-white">
      {/* Playback controls at top */}
      <PlaybackControls zoom={pixelsPerSecond} onZoomChange={handleZoomChange} />

      {/* Time ruler */}
      <TimeRuler
        duration={videoDuration}
        pixelsPerSecond={pixelsPerSecond}
        scrollLeft={scrollLeft}
        onSeek={handleSeek}
      />

      {/* Tracks area: video track when we have video, subtitle track when we have subtitles */}
      <div className="flex-1 overflow-hidden bg-gray-900">
        {videoUrl && (
          <VideoTrack
            pixelsPerSecond={pixelsPerSecond}
            scrollLeft={scrollLeft}
            onScroll={handleScroll}
          />
        )}
        {segments.length > 0 && (
          <SubtitleTrack
            segments={segments}
            pixelsPerSecond={pixelsPerSecond}
            scrollLeft={scrollLeft}
            onScroll={handleScroll}
          />
        )}
      </div>
    </div>
  );
}
