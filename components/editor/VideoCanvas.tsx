"use client";

import { useRef, useEffect } from "react";
import { useEditorStore } from "@/lib/store";
import { SubtitleOverlay } from "./SubtitleOverlay";

export function VideoCanvas() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    videoUrl,
    isProcessing,
    processingStep,
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

  // Calculate aspect ratio as a number
  const aspectNum =
    aspectRatio === "9:16"
      ? 9 / 16
      : aspectRatio === "16:9"
        ? 16 / 9
        : 1;

  if (!videoUrl) {
    return (
      <div
        ref={containerRef}
        className="flex h-full w-full items-center justify-center"
      >
        <div
          className="flex items-center justify-center bg-black rounded-lg shadow-lg"
          style={{
            aspectRatio: aspectNum,
            maxHeight: "100%",
            maxWidth: "100%",
            width: aspectNum < 1 ? "auto" : "100%",
            height: aspectNum < 1 ? "100%" : "auto",
          }}
        >
          <div className="text-center text-gray-500 p-8">
            {isProcessing ? (
              <>
                <span className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-white border-t-transparent" />
                <p className="text-lg font-medium text-white">
                  {processingStep || "Processing..."}
                </p>
                <p className="mt-2 text-sm text-gray-400">
                  This may take 1–2 minutes for transcription
                </p>
              </>
            ) : (
              <>
                <p className="mb-4 text-4xl">📹</p>
                <p className="text-lg font-medium text-white">No video loaded</p>
                <p className="text-sm text-gray-400">
                  Drag a video from Media to get started
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex h-full w-full items-center justify-center"
    >
      <div
        className="relative bg-black rounded-lg shadow-lg overflow-hidden"
        style={{
          aspectRatio: aspectNum,
          maxHeight: "100%",
          maxWidth: "100%",
          width: aspectNum < 1 ? "auto" : "100%",
          height: aspectNum < 1 ? "100%" : "auto",
        }}
      >
        <video
          id="editor-video"
          ref={videoRef}
          src={videoUrl}
          className="h-full w-full object-contain"
          controls={false}
          preload="auto"
          playsInline
        />
        <SubtitleOverlay />
      </div>
    </div>
  );
}
