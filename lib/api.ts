const RAILWAY_API_URL =
  process.env.NEXT_PUBLIC_RAILWAY_API_URL ||
  "https://hinglish-serverless-production.up.railway.app";

export interface ProcessVideoResponse {
  success: boolean;
  error?: string;
  audioUrl?: string;
  videoUrl?: string; // Video URL when stored in Supabase
  subtitles?: {
    srt: string;
    vtt: string;
    text: string;
    segments: { start: number; end: number; text: string }[];
    words?: unknown[];
  };
  metadata?: {
    originalFilename: string;
    segmentCount: number;
    wordCount: number;
    processingTimeMs: number;
  };
}

/** Upload video only; no transcription. Use for preview. */
export async function uploadVideoOnly(
  file: File,
  userId: string = "anonymous"
): Promise<{ success: boolean; videoUrl?: string; error?: string }> {
  const formData = new FormData();
  formData.append("video", file);
  formData.append("userId", userId);
  const response = await fetch(`${RAILWAY_API_URL}/upload-video`, {
    method: "POST",
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || `Upload failed: ${response.status}`);
  }
  return data;
}

/** Transcribe existing video by URL; returns segments and subtitle URLs. */
export type TranscriptionLanguage = "hinglish" | "hindi" | "english";

export interface TranscribeResponse {
  success: boolean;
  error?: string;
  segments?: { start: number; end: number; text: string }[];
  subtitles?: {
    srt: string;
    vtt: string;
    text: string;
    segments: { start: number; end: number; text: string }[];
    words?: unknown[];
  };
  audioUrl?: string;
}

export async function transcribeVideo(
  videoUrl: string,
  userId: string = "anonymous",
  language: TranscriptionLanguage = "hinglish"
): Promise<TranscribeResponse> {
  const response = await fetch(`${RAILWAY_API_URL}/transcribe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ videoUrl, userId, language }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || `Transcribe failed: ${response.status}`);
  }
  return data;
}

export async function processVideo(
  file: File,
  userId: string = "anonymous",
  language?: TranscriptionLanguage
): Promise<ProcessVideoResponse> {
  console.log("[processVideo] Starting upload...");
  console.log("[processVideo] File:", file.name, file.size, "bytes");
  console.log("[processVideo] User:", userId);
  console.log("[processVideo] Railway API URL:", RAILWAY_API_URL);

  const formData = new FormData();
  formData.append("video", file);
  formData.append("userId", userId);
  if (language) formData.append("language", language);

  try {
    console.log("[processVideo] Sending POST to:", `${RAILWAY_API_URL}/process-video`);
    const response = await fetch(`${RAILWAY_API_URL}/process-video`, {
      method: "POST",
      body: formData,
    });

    console.log("[processVideo] Response status:", response.status);
    const data = await response.json();
    console.log("[processVideo] Response data:", data);

    if (!response.ok) {
      throw new Error(data.error || `Server error: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error("[processVideo] Error:", error);
    throw error;
  }
}

export interface BurnSubtitlesResponse {
  success: boolean;
  error?: string;
  downloadUrl?: string;
  processingTimeMs?: number;
}

export interface BurnSubtitleStyle {
  fontFamily?: string;
  fontSize?: number;
  alignment?: "left" | "center" | "right";
  allCaps?: boolean;
  textColor?: string;
  outlineEnabled?: boolean;
  outlineColor?: string;
  outlineWidth?: number;
}

export async function burnSubtitles(
  videoUrl: string,
  segments: { start: number; end: number; text: string }[],
  quality: "fast" | "balanced" | "high" = "balanced",
  userId: string = "anonymous",
  style?: BurnSubtitleStyle,
  aspectRatio: "9:16" | "16:9" | "1:1" = "9:16"
): Promise<BurnSubtitlesResponse> {
  const response = await fetch(`${RAILWAY_API_URL}/burn-subtitles`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      videoUrl,
      segments,
      quality,
      userId,
      format: "ass",
      style: style || {},
      aspectRatio,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || `Burn failed: ${response.status}`);
  }
  return data;
}
