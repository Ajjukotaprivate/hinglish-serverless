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

export async function processVideo(
  file: File,
  userId: string = "anonymous"
): Promise<ProcessVideoResponse> {
  const formData = new FormData();
  formData.append("video", file);
  formData.append("userId", userId);

  const response = await fetch(`${RAILWAY_API_URL}/process-video`, {
    method: "POST",
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `Server error: ${response.status}`);
  }

  return data;
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
