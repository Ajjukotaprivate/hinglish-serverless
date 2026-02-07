"use client";

import { useRef, useEffect } from "react";
import { useEditorStore } from "@/lib/store";
import { SubtitleOverlay } from "./SubtitleOverlay";

export function VideoCanvas() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const {
    videoUrl,
    videoDuration,
    setPlayhead,
    setPlaying,
    aspectRatio,
  } = useEditorStore();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setPlayhead(video.currentTime);
    };
    const handlePlay = () => setPlaying(true);
    const handlePause = () => setPlaying(false);
    const handleLoadedMetadata = () => {
      useEditorStore.getState().setMedia({ duration: video.duration });
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, [setPlayhead, setPlaying]);

  const aspectClass =
    aspectRatio === "9:16"
      ? "aspect-[9/16]"
      : aspectRatio === "16:9"
      ? "aspect-video"
      : "aspect-square";

  if (!videoUrl) {
    return (
      <div
        className={`flex flex-1 items-center justify-center bg-black ${aspectClass} max-h-full`}
      >
        <div className="text-center text-gray-500">
          <p className="text-4xl mb-4">📹</p>
          <p className="text-lg font-medium">No video loaded</p>
          <p className="text-sm">Drag a video from Media to get started</p>
          <p className="mt-2 text-xs">Or use Upload Media in the left panel</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative flex flex-1 items-center justify-center bg-black ${aspectClass} max-h-full overflow-hidden`}>
      <video
        id="editor-video"
        ref={videoRef}
        src={videoUrl}
        className="h-full w-full object-contain"
        controls={false}
        preload="metadata"
      />
      <SubtitleOverlay />
    </div>
  );
}
