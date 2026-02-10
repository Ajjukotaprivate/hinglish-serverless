"use client";

import { useEditorStore } from "@/lib/store";

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}.${String(ms).padStart(2, "0")}`;
}

function getVideo(): HTMLVideoElement | null {
  return document.getElementById("editor-video") as HTMLVideoElement | null;
}

const SEEK_STEP = 10;

interface PlaybackControlsProps {
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onFit?: () => void;
}

export function PlaybackControls({ zoom, onZoomChange, onFit }: PlaybackControlsProps) {
  const {
    playhead,
    setPlayhead,
    isPlaying,
    setPlaying,
    videoDuration,
    splitSegmentAtPlayhead,
  } = useEditorStore();

  const togglePlay = () => {
    const video = getVideo();
    if (!video) return;
    if (video.paused) {
      video.play();
      setPlaying(true);
    } else {
      video.pause();
      setPlaying(false);
    }
  };

  const seekTo = (time: number) => {
    const video = getVideo();
    if (!video) return;
    const duration = Number.isFinite(video.duration) ? video.duration : videoDuration;
    const t = Math.max(0, Math.min(duration, time));
    video.currentTime = t;
    setPlayhead(t);
  };

  const stepBack = () => seekTo(playhead - SEEK_STEP);
  const stepForward = () => seekTo(playhead + SEEK_STEP);

  const handleSplit = () => {
    splitSegmentAtPlayhead();
  };

  return (
    <div className="flex h-10 items-center justify-between border-b border-gray-200 bg-white px-4">
      {/* Left: Split */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleSplit}
          className="flex h-8 w-8 items-center justify-center rounded text-gray-500 hover:bg-gray-100"
          title="Split at playhead"
        >
          ✂
        </button>
      </div>

      {/* Center: Time + transport (minimal like reference) */}
      <div className="flex items-center gap-2">
        <span className="min-w-[4.5rem] text-right text-sm text-gray-600 tabular-nums">
          {formatTime(playhead)}
        </span>
        <span className="text-gray-400">/</span>
        <span className="min-w-[4.5rem] text-sm text-gray-500 tabular-nums">
          {formatTime(videoDuration)}
        </span>

        <button
          type="button"
          onClick={stepBack}
          className="flex h-8 w-8 items-center justify-center rounded text-gray-500 hover:bg-gray-100"
          title="Rewind 10s"
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z" />
          </svg>
        </button>

        <button
          type="button"
          onClick={togglePlay}
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gray-800 text-white hover:bg-gray-700"
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          ) : (
            <svg className="h-4 w-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        <button
          type="button"
          onClick={stepForward}
          className="flex h-8 w-8 items-center justify-center rounded text-gray-500 hover:bg-gray-100"
          title="Forward 10s"
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z" />
          </svg>
        </button>
      </div>

      {/* Right: Zoom + Fit */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onZoomChange(Math.max(20, zoom - 10))}
          className="flex h-8 w-8 items-center justify-center rounded text-gray-500 hover:bg-gray-100"
          title="Zoom out"
        >
          −
        </button>
        <input
          type="range"
          min="20"
          max="200"
          value={zoom}
          onChange={(e) => onZoomChange(Number(e.target.value))}
          className="h-1 w-20 accent-gray-600"
        />
        <button
          type="button"
          onClick={() => onZoomChange(Math.min(200, zoom + 10))}
          className="flex h-8 w-8 items-center justify-center rounded text-gray-500 hover:bg-gray-100"
          title="Zoom in"
        >
          +
        </button>
        {onFit && (
          <button
            type="button"
            onClick={onFit}
            className="ml-1 rounded px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100"
            title="Fit to timeline"
          >
            Fit
          </button>
        )}
      </div>
    </div>
  );
}
