"use client";

import { useEffect, useState, useRef } from "react";
import { useEditorStore } from "@/lib/store";

const THUMB_WIDTH = 120;
const THUMB_HEIGHT = 68;
const MAX_THUMBNAILS = 40;
const MIN_THUMBNAILS = 10;

interface VideoTrackProps {
  pixelsPerSecond: number;
  scrollLeft: number;
  onScroll: (scrollLeft: number) => void;
}

export function VideoTrack({ pixelsPerSecond, scrollLeft, onScroll }: VideoTrackProps) {
  const { videoUrl, videoDuration, playhead, mediaItems } = useEditorStore();
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const cancelledRef = useRef(false);

  const maxDuration = Math.max(videoDuration, 10);
  const trackWidth = maxDuration * pixelsPerSecond;
  const playheadPosition = playhead * pixelsPerSecond;

  const videoName = mediaItems.find((m) => m.type === "video")?.name || "Video";
  const isVisible = true;
  const isMuted = false;

  // Capture video frames as thumbnails when video is ready
  useEffect(() => {
    if (!videoUrl || videoDuration <= 0) {
      setThumbnails([]);
      return;
    }

    cancelledRef.current = false;
    const video = document.getElementById("editor-video") as HTMLVideoElement | null;
    if (!video) {
      setThumbnails([]);
      return;
    }

    const count = Math.min(
      MAX_THUMBNAILS,
      Math.max(MIN_THUMBNAILS, Math.ceil(videoDuration / 2))
    );
    const step = videoDuration / count;
    const canvas = document.createElement("canvas");
    canvas.width = THUMB_WIDTH;
    canvas.height = THUMB_HEIGHT;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const capture = () => {
      const results: string[] = [];
      let i = 0;

      const seekNext = () => {
        if (cancelledRef.current) return;
        const t = i * step;
        if (t >= videoDuration || i >= count) {
          setThumbnails(results);
          return;
        }

        video.currentTime = t;
      };

      const onSeeked = () => {
        if (cancelledRef.current) return;
        try {
          ctx.drawImage(video, 0, 0, THUMB_WIDTH, THUMB_HEIGHT);
          results.push(canvas.toDataURL("image/jpeg", 0.6));
        } catch {
          results.push("");
        }
        i++;
        if (i >= count) {
          video.removeEventListener("seeked", onSeeked);
          setThumbnails(results);
          return;
        }
        seekNext();
      };

      video.addEventListener("seeked", onSeeked);
      seekNext();
    };

    if (video.readyState >= 2) {
      capture();
    } else {
      const onLoaded = () => {
        video.removeEventListener("loadeddata", onLoaded);
        if (!cancelledRef.current) capture();
      };
      video.addEventListener("loadeddata", onLoaded);
    }

    return () => {
      cancelledRef.current = true;
    };
  }, [videoUrl, videoDuration]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    onScroll(e.currentTarget.scrollLeft);
  };

  if (!videoUrl) {
    return (
      <div className="flex h-16 border-b border-gray-700">
        <div className="flex w-28 flex-shrink-0 items-center gap-1 border-r border-gray-700 bg-gray-800 px-2">
          <span className="text-[10px] text-gray-400">Video</span>
        </div>
        <div className="flex flex-1 items-center justify-center bg-gray-900 text-sm text-gray-500">
          No video
        </div>
      </div>
    );
  }

  const thumbWidth = thumbnails.length > 0
    ? (videoDuration * pixelsPerSecond) / thumbnails.length
    : 0;

  return (
    <div className="flex h-16 border-b border-gray-700">
      {/* Track label */}
      <div className="flex w-28 flex-shrink-0 items-center gap-1 border-r border-gray-700 bg-gray-800 px-2">
        <span className="text-[10px] text-gray-400">Video</span>
        <button
          className={`${isVisible ? "text-gray-300" : "text-gray-600"} hover:text-white`}
          title="Toggle visibility"
        >
          <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5z" />
          </svg>
        </button>
      </div>

      {/* Scrollable track with video thumbnails */}
      <div
        className="flex-1 overflow-x-auto overflow-y-hidden bg-gray-900"
        onScroll={handleScroll}
      >
        <div
          className="relative h-full flex"
          style={{ width: `${trackWidth}px`, minWidth: "100%" }}
        >
          {/* Playhead */}
          <div
            className="absolute top-0 bottom-0 z-10 w-0.5 bg-gray-800"
            style={{ left: `${playheadPosition}px` }}
          >
            <div className="absolute top-0 bottom-0 w-px bg-white opacity-80" />
          </div>

          {/* Video filmstrip: real thumbnails or fallback bar */}
          {thumbnails.length > 0 ? (
            <div className="absolute top-0 bottom-0 left-0 flex flex-1" style={{ width: `${videoDuration * pixelsPerSecond}px` }}>
              {thumbnails.map((src, i) => (
                src ? (
                  <img
                    key={i}
                    src={src}
                    alt=""
                    className="flex-shrink-0 object-cover border-r border-gray-800"
                    style={{
                      width: `${thumbWidth}px`,
                      height: "100%",
                      minWidth: 2,
                    }}
                  />
                ) : (
                  <div
                    key={i}
                    className="flex-shrink-0 bg-gray-700 border-r border-gray-800"
                    style={{ width: `${thumbWidth}px`, height: "100%", minWidth: 2 }}
                  />
                )
              ))}
            </div>
          ) : (
            <div
              className="absolute top-1 bottom-1 left-0 overflow-hidden rounded border border-gray-600 bg-gray-800"
              style={{
                width: `${videoDuration * pixelsPerSecond}px`,
                minWidth: "100px",
              }}
            >
              <div className="flex h-full items-center justify-center">
                <span className="text-[10px] text-gray-500">Loading video…</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
