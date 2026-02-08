"use client";

import { useRef, useState, useEffect } from "react";
import { useEditorStore } from "@/lib/store";
import { processVideo } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";
import type { SubtitleSegment, MediaItem } from "@/lib/types";

type Step = "idle" | "uploading" | "extracting" | "transcribing" | "done";

export function MediaUpload() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [step, setStep] = useState<Step>("idle");
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>("anonymous");

  const { setMedia, setSegments, setDirty, setMediaItems, setProcessing } =
    useEditorStore();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id ?? "anonymous");
    });
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("[MediaUpload] handleUpload triggered");
    const file = e.target.files?.[0];
    if (!file) {
      console.log("[MediaUpload] No file selected");
      return;
    }

    console.log("[MediaUpload] File selected:", file.name, file.size, "bytes", file.type);

    if (file.size > 50 * 1024 * 1024) {
      console.log("[MediaUpload] File too large:", file.size);
      setError("File too large. Maximum size is 50MB.");
      return;
    }

    console.log("[MediaUpload] Starting upload process for user:", userId);
    setError(null);
    setUploading(true);
    setStep("uploading");
    setProcessing(true, "Uploading...");

    try {
      console.log("[MediaUpload] Calling processVideo...");
      setStep("extracting");
      setProcessing(true, "Extracting audio...");
      const result = await processVideo(file, userId);
      console.log("[MediaUpload] processVideo result:", result);

      if (!result.success || !result.subtitles) {
        throw new Error(result.error || "Processing failed");
      }

      setStep("transcribing");
      setProcessing(true, "Transcribing (1–2 min)...");
      const segmentsWithIds: SubtitleSegment[] = (
        result.subtitles.segments || []
      ).map((seg: { start: number; end: number; text: string }) => ({
        id: uuidv4(),
        start: seg.start,
        end: seg.end,
        text: seg.text,
      }));

      const videoUrl = result.videoUrl || result.audioUrl;
      setMedia({
        videoUrl,
        audioUrl: result.audioUrl,
        srtUrl: result.subtitles.srt,
        vttUrl: result.subtitles.vtt,
        duration: 0,
      });
      setSegments(segmentsWithIds);

      const videoItem: MediaItem = {
        id: uuidv4(),
        name: file.name,
        url: videoUrl || "",
        type: "video",
        size: file.size,
      };
      setMediaItems([videoItem]);

      // Create project if not exists, save media URLs
      const { createProject, saveProject } = await import("@/lib/projects");
      const store = useEditorStore.getState();
      let projectId = store.projectId;

      if (!projectId) {
        const projectName = file.name.replace(/\.\w+$/, "") || "Untitled";
        const project = await createProject(projectName, userId);
        projectId = project.id;
        store.setProject(project.id, project.name);

        // Update URL without page reload
        window.history.replaceState({}, "", `/?project=${project.id}`);
      }

      // Save media URLs and segments to project
      await saveProject(projectId, {
        video_url: videoUrl,
        audio_url: result.audioUrl,
        srt_url: result.subtitles.srt,
        vtt_url: result.subtitles.vtt,
        segments_json: segmentsWithIds,
      });

      setDirty(false); // Just saved, not dirty

      const video = document.createElement("video");
      video.preload = "metadata";
      video.src = videoUrl || "";
      video.onloadedmetadata = () => {
        useEditorStore.getState().setMedia({ duration: video.duration });
      };
      setStep("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      setStep("idle");
      setProcessing(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const stepLabel =
    step === "uploading"
      ? "Uploading..."
      : step === "extracting"
        ? "Extracting audio..."
        : step === "transcribing"
          ? "Transcribing (1–2 min)..."
          : step === "done"
            ? "Done!"
            : "Upload Media Max 50MB";

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
          <>
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            {stepLabel}
          </>
        ) : (
          <>{stepLabel}</>
        )}
      </button>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
