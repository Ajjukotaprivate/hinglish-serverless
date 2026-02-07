export interface SubtitleSegment {
  id: string;
  start: number;
  end: number;
  text: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  video_url: string | null;
  audio_url: string | null;
  srt_url: string | null;
  vtt_url: string | null;
  segments_json: SubtitleSegment[];
  canvas_state: Record<string, unknown> | null;
  timeline_state: Record<string, unknown> | null;
  aspect_ratio: string;
  created_at: string;
  updated_at: string;
}

export interface MediaItem {
  id: string;
  name: string;
  url: string;
  type: "video" | "audio" | "image";
  size?: number;
  duration?: number;
}

export type AspectRatio = "9:16" | "16:9" | "1:1";

export interface SubtitleStyle {
  fontFamily: string;
  fontSize: number;
  alignment: "left" | "center" | "right";
  allCaps: boolean;
  textColor: string;
  textOpacity: number;
  outlineEnabled: boolean;
  outlineColor: string;
  outlineWidth: number;
  backgroundColor: string;
  backgroundOpacity: number;
  animation: "none" | "pop" | "bounce" | "slide" | "fade";
}
