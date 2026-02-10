/**
 * Shared media upload logic for video pipeline.
 * Used by MediaUpload component and global drag-and-drop.
 */
import { useEditorStore } from "./store";
import { processVideo, uploadVideoOnly } from "./api";
import { v4 as uuidv4 } from "uuid";
import type { SubtitleSegment, MediaItem } from "./types";

const MAX_FILE_SIZE = 350 * 1024 * 1024; // 350MB

export function getMaxFileSize(): number {
  return MAX_FILE_SIZE;
}

/**
 * Upload video only: store in Supabase and show in preview. No transcription.
 * Call this on drag-drop or "Upload Media" so user sees video first;
 * transcription runs only when user clicks "Start Transcription" in Subtitles tab.
 */
export async function uploadVideoOnlyForPreview(
  file: File,
  userId: string
): Promise<{ error?: string }> {
  if (file.size > MAX_FILE_SIZE) {
    return { error: "File too large. Maximum size is 350MB." };
  }

  const store = useEditorStore.getState();
  store.setProcessing(true, "Uploading video...");

  try {
    const result = await uploadVideoOnly(file, userId);
    if (!result.success || !result.videoUrl) {
      throw new Error(result.error || "Upload failed");
    }

    const videoUrl = result.videoUrl;
    store.setMedia({
      videoUrl,
      audioUrl: null,
      srtUrl: null,
      vttUrl: null,
      duration: 0,
    });

    const videoItem: MediaItem = {
      id: uuidv4(),
      name: file.name,
      url: videoUrl,
      type: "video",
      size: file.size,
      createdAt: new Date().toISOString(),
    };
    store.addMediaItem(videoItem);

    if (typeof document !== "undefined") {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.src = videoUrl;
      video.onloadedmetadata = () => {
        useEditorStore.getState().setMedia({ duration: video.duration });
      };
    }

    return {};
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Upload failed",
    };
  } finally {
    store.setProcessing(false);
  }
}

export function isVideoFile(file: File): boolean {
  return file.type.startsWith("video/");
}

export function isAudioFile(file: File): boolean {
  return file.type.startsWith("audio/");
}

export function isImageFile(file: File): boolean {
  return file.type.startsWith("image/");
}

/** Format file size and date for display e.g. "3.31 MB • Feb 9" */
export function formatMediaMeta(size?: number, createdAt?: string): string {
  const parts: string[] = [];
  if (size != null) {
    parts.push(`${(size / 1024 / 1024).toFixed(2)} MB`);
  }
  if (createdAt) {
    try {
      const d = new Date(createdAt);
      const mon = d.toLocaleString("en", { month: "short" });
      const day = d.getDate();
      parts.push(`${mon} ${day}`);
    } catch {
      parts.push("Today");
    }
  }
  return parts.join(" • ") || "—";
}

/**
 * Run full video pipeline: processVideo API, update store, create/save project.
 * Call from button upload or global drop.
 */
export async function uploadVideoFile(
  file: File,
  userId: string
): Promise<{ error?: string }> {
  if (file.size > MAX_FILE_SIZE) {
    return { error: "File too large. Maximum size is 350MB." };
  }

  const store = useEditorStore.getState();
  store.setProcessing(true, "Uploading...");

  try {
    const result = await processVideo(file, userId);
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

    const videoUrl = result.videoUrl || result.audioUrl;
    store.setMedia({
      videoUrl,
      audioUrl: result.audioUrl,
      srtUrl: result.subtitles.srt,
      vttUrl: result.subtitles.vtt,
      duration: 0,
    });
    store.setSegments(segmentsWithIds);

    const videoItem: MediaItem = {
      id: uuidv4(),
      name: file.name,
      url: videoUrl || "",
      type: "video",
      size: file.size,
      createdAt: new Date().toISOString(),
    };
    store.addMediaItem(videoItem);

    const { createProject, saveProject } = await import("./projects");
    let projectId = store.projectId;

    if (!projectId) {
      const projectName = file.name.replace(/\.\w+$/, "") || "Untitled";
      const project = await createProject(projectName, userId);
      projectId = project.id;
      store.setProject(project.id, project.name);
      if (typeof window !== "undefined") {
        window.history.replaceState({}, "", `/?project=${project.id}`);
      }
    }

    await saveProject(projectId, {
      video_url: videoUrl,
      audio_url: result.audioUrl,
      srt_url: result.subtitles.srt,
      vtt_url: result.subtitles.vtt,
      segments_json: segmentsWithIds,
    });
    store.setDirty(false);

    if (videoUrl && typeof document !== "undefined") {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.src = videoUrl;
      video.onloadedmetadata = () => {
        useEditorStore.getState().setMedia({ duration: video.duration });
      };
    }

    return {};
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Upload failed",
    };
  } finally {
    store.setProcessing(false);
  }
}
