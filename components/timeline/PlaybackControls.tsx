"use client";

import { useEditorStore } from "@/lib/store";
import { useRef, useEffect } from "react";

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}.${String(ms).padStart(2, "0")}`;
}

export function PlaybackControls() {
  const { playhead, setPlayhead, isPlaying, setPlaying, videoDuration } =
    useEditorStore();
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = document.getElementById("editor-video") as HTMLVideoElement;
    if (video) videoRef.current = video;
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setPlaying(true);
    } else {
      video.pause();
      setPlaying(false);
    }
  };

  const seek = (delta: number) => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime + delta));
      setPlayhead(video.currentTime);
    }
  };

  return (
    <div className="flex items-center gap-4 border-t border-gray-200 bg-gray-50 px-4 py-2">
      <button
        type="button"
        onClick={() => seek(-videoDuration)}
        className="rounded p-1.5 text-gray-600 hover:bg-gray-200"
        aria-label="Go to start"
      >
        |◀
      </button>
      <button
        type="button"
        onClick={() => seek(-1 / 30)}
        className="rounded p-1.5 text-gray-600 hover:bg-gray-200"
        aria-label="Previous frame"
      >
        ◀
      </button>
      <button
        type="button"
        onClick={togglePlay}
        className="rounded bg-primary px-4 py-1.5 text-white hover:bg-primary-hover"
      >
        {isPlaying ? "⏸" : "▶"}
      </button>
      <button
        type="button"
        onClick={() => seek(1 / 30)}
        className="rounded p-1.5 text-gray-600 hover:bg-gray-200"
        aria-label="Next frame"
      >
        ▶
      </button>
      <button
        type="button"
        onClick={() => seek(videoDuration)}
        className="rounded p-1.5 text-gray-600 hover:bg-gray-200"
        aria-label="Go to end"
      >
        ▶|
      </button>
      <span className="text-sm text-gray-600">
        {formatTime(playhead)} / {formatTime(videoDuration)}
      </span>
      <div className="ml-4 flex items-center gap-2">
        <button
          type="button"
          className="rounded p-1.5 text-gray-600 hover:bg-gray-200"
          aria-label="Undo"
        >
          ↶
        </button>
        <button
          type="button"
          className="rounded p-1.5 text-gray-600 hover:bg-gray-200"
          aria-label="Redo"
        >
          ↷
        </button>
      </div>
      <div className="ml-4 flex items-center gap-2">
        <span className="text-gray-500">🔊</span>
        <input
          type="range"
          min="0"
          max="100"
          defaultValue="100"
          className="h-2 w-24"
        />
      </div>
    </div>
  );
}
