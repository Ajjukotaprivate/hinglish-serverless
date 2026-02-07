"use client";

import { useRef, useState } from "react";
import { useEditorStore } from "@/lib/store";
import { processVideo } from "@/lib/api";
import { v4 as uuidv4 } from "uuid";
import type { SubtitleSegment, MediaItem } from "@/lib/types";

export function MediaUpload() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { setMedia, setSegments, setDirty, setMediaItems } = useEditorStore();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      setError("File too large. Maximum size is 50MB.");
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const result = await processVideo(file);

      if (!result.success || !result.subtitles) {
        throw new Error(result.error || "Processing failed");
      }

      const segmentsWithIds: SubtitleSegment[] = (
        result.subtitles.segments || []
      ).map((seg: { start: number; end: number; text: string }) => ({
        id: uuidv4(),
        start: seg.start,
        end: seg.end,
        text: seg.text,
      }));

      setMedia({
        videoUrl: result.videoUrl || result.audioUrl,
        audioUrl: result.audioUrl,
        srtUrl: result.subtitles.srt,
        vttUrl: result.subtitles.vtt,
        duration: 0,
      });
      setSegments(segmentsWithIds);

      const videoItem: MediaItem = {
        id: uuidv4(),
        name: file.name,
        url: result.videoUrl || result.audioUrl || "",
        type: "video",
        size: file.size,
      };
      setMediaItems([videoItem]);
      setDirty(true);

      const video = document.createElement("video");
      video.preload = "metadata";
      video.src = result.videoUrl || result.audioUrl || "";
      video.onloadedmetadata = () => {
        useEditorStore.getState().setMedia({ duration: video.duration });
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        onChange={handleUpload}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50"
      >
        {uploading ? (
          <>Uploading... Processing...</>
        ) : (
          <>Upload Media Max 50MB</>
        )}
      </button>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
