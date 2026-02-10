import { create } from "zustand";
import type {
  SubtitleSegment,
  MediaItem,
  AspectRatio,
  SubtitleStyle,
} from "./types";

interface EditorState {
  // Project
  projectId: string | null;
  projectName: string;
  isDirty: boolean;
  isSaving: boolean;

  // Media
  videoUrl: string | null;
  audioUrl: string | null;
  srtUrl: string | null;
  vttUrl: string | null;
  mediaItems: MediaItem[];
  videoDuration: number;
  isProcessing: boolean;
  processingStep: string;

  // Timeline
  segments: SubtitleSegment[];
  playhead: number;
  isPlaying: boolean;
  selectedSegmentId: string | null;

  // Canvas
  aspectRatio: AspectRatio;

  // Subtitle style
  subtitleStyle: SubtitleStyle;

  // Transcription (Subtitles tab)
  transcriptionLanguage: "hinglish" | "hindi" | "english";

  // Right panel
  rightPanelTab: "subtitles" | "inspector";
  leftNavActive: "media" | "autoedit" | "subtitles" | "style" | "progress" | "text" | "audio" | "settings";

  // Actions
  setProject: (id: string | null, name: string) => void;
  setProjectName: (name: string) => void;
  setDirty: (dirty: boolean) => void;
  setSaving: (saving: boolean) => void;

  setMedia: (urls: {
    videoUrl?: string | null;
    audioUrl?: string | null;
    srtUrl?: string | null;
    vttUrl?: string | null;
    duration?: number;
  }) => void;
  setMediaItems: (items: MediaItem[]) => void;
  addMediaItem: (item: MediaItem) => void;
  setProcessing: (processing: boolean, step?: string) => void;

  setSegments: (segments: SubtitleSegment[]) => void;
  updateSegment: (id: string, updates: Partial<SubtitleSegment>) => void;
  addSegment: (segment: SubtitleSegment) => void;
  deleteSegment: (id: string) => void;
  mergeSegmentWithNext: (id: string) => void;
  splitSegment: (id: string) => void;
  splitSegmentAtPlayhead: () => void;
  setPlayhead: (time: number) => void;
  setPlaying: (playing: boolean) => void;
  setSelectedSegment: (id: string | null) => void;

  setAspectRatio: (ratio: AspectRatio) => void;
  setSubtitleStyle: (style: Partial<SubtitleStyle>) => void;
  setTranscriptionLanguage: (lang: "hinglish" | "hindi" | "english") => void;
  setRightPanelTab: (tab: "subtitles" | "inspector") => void;
  setLeftNavActive: (nav: EditorState["leftNavActive"]) => void;

  reset: () => void;
}

const defaultSubtitleStyle: SubtitleStyle = {
  fontFamily: "Bebas Neue",
  fontSize: 140,
  alignment: "center",
  allCaps: true,
  textColor: "#ffffff",
  textOpacity: 100,
  outlineEnabled: true,
  outlineColor: "#facc15",
  outlineWidth: 4,
  backgroundColor: "#ffffff",
  backgroundOpacity: 0,
  animation: "none",
};

const initialState = {
  projectId: null,
  projectName: "Untitled Project",
  isDirty: false,
  isSaving: false,
  videoUrl: null,
  audioUrl: null,
  srtUrl: null,
  vttUrl: null,
  mediaItems: [],
  videoDuration: 0,
  isProcessing: false,
  processingStep: "",
  segments: [],
  playhead: 0,
  isPlaying: false,
  selectedSegmentId: null,
  aspectRatio: "9:16" as AspectRatio,
  subtitleStyle: defaultSubtitleStyle,
  transcriptionLanguage: "hinglish" as const,
  rightPanelTab: "subtitles" as const,
  leftNavActive: "media" as const,
};

export const useEditorStore = create<EditorState>((set) => ({
  ...initialState,

  setProject: (id, name) => set({ projectId: id, projectName: name }),
  setProjectName: (name) => set({ projectName: name }),
  setDirty: (dirty) => set({ isDirty: dirty }),
  setSaving: (saving) => set({ isSaving: saving }),

  setMedia: (urls) =>
    set((state) => {
      const { duration, ...rest } = urls as typeof urls & { duration?: number };
      return {
        ...rest,
        ...(duration !== undefined && { videoDuration: duration }),
      };
    }),
  setMediaItems: (items) => set({ mediaItems: items }),
  setProcessing: (processing, step = "") =>
    set({ isProcessing: processing, processingStep: step }),
  addMediaItem: (item) =>
    set((state) => ({
      mediaItems: [...state.mediaItems, item],
    })),

  setSegments: (segments) => set({ segments, isDirty: true }),
  updateSegment: (id, updates) =>
    set((state) => ({
      segments: state.segments.map((s) =>
        s.id === id ? { ...s, ...updates } : s
      ),
      isDirty: true,
    })),
  addSegment: (segment) =>
    set((state) => ({
      segments: [...state.segments, segment].sort((a, b) => a.start - b.start),
      isDirty: true,
    })),
  deleteSegment: (id) =>
    set((state) => ({
      segments: state.segments.filter((s) => s.id !== id),
      isDirty: true,
    })),
  mergeSegmentWithNext: (id) =>
    set((state) => {
      const idx = state.segments.findIndex((s) => s.id === id);
      if (idx === -1 || idx >= state.segments.length - 1) return state;
      
      const current = state.segments[idx];
      const next = state.segments[idx + 1];
      
      const merged: SubtitleSegment = {
        ...current,
        end: next.end,
        text: `${current.text} ${next.text}`.trim(),
      };
      
      const segments = [
        ...state.segments.slice(0, idx),
        merged,
        ...state.segments.slice(idx + 2),
      ];
      
      return { segments, isDirty: true };
    }),
  splitSegment: (id) =>
    set((state) => {
      const idx = state.segments.findIndex((s) => s.id === id);
      if (idx === -1) return state;
      
      const segment = state.segments[idx];
      const midTime = (segment.start + segment.end) / 2;
      const words = segment.text.split(" ");
      const midIdx = Math.floor(words.length / 2);
      
      const first: SubtitleSegment = {
        ...segment,
        id: crypto.randomUUID ? crypto.randomUUID() : `segment-${Date.now()}-a`,
        end: midTime,
        text: words.slice(0, midIdx).join(" ").trim() || "...",
      };
      
      const second: SubtitleSegment = {
        ...segment,
        id: crypto.randomUUID ? crypto.randomUUID() : `segment-${Date.now()}-b`,
        start: midTime,
        text: words.slice(midIdx).join(" ").trim() || "...",
      };
      
      const segments = [
        ...state.segments.slice(0, idx),
        first,
        second,
        ...state.segments.slice(idx + 1),
      ];
      
      return { segments, isDirty: true };
    }),
  splitSegmentAtPlayhead: () =>
    set((state) => {
      const { playhead, segments } = state;
      const idx = segments.findIndex(
        (s) => s.start <= playhead && playhead < s.end
      );
      if (idx === -1) return state;

      const segment = segments[idx];
      const duration = segment.end - segment.start;
      if (duration <= 0) return state;

      const ratio = (playhead - segment.start) / duration;
      const words = segment.text.trim().split(/\s+/);
      const midIdx = Math.max(
        1,
        Math.min(words.length - 1,
          Math.round(words.length * ratio) || 1
        )
      );

      const first: SubtitleSegment = {
        ...segment,
        id: crypto.randomUUID ? crypto.randomUUID() : `segment-${Date.now()}-a`,
        end: playhead,
        text: words.slice(0, midIdx).join(" ").trim() || "...",
      };
      const second: SubtitleSegment = {
        ...segment,
        id: crypto.randomUUID ? crypto.randomUUID() : `segment-${Date.now()}-b`,
        start: playhead,
        text: words.slice(midIdx).join(" ").trim() || "...",
      };

      const newSegments = [
        ...segments.slice(0, idx),
        first,
        second,
        ...segments.slice(idx + 1),
      ];
      return { segments: newSegments, isDirty: true };
    }),
  setPlayhead: (playhead) => set({ playhead }),
  setPlaying: (playing) => set({ isPlaying: playing }),
  setSelectedSegment: (selectedSegmentId) => set({ selectedSegmentId }),

  setAspectRatio: (aspectRatio) => set({ aspectRatio }),
  setSubtitleStyle: (style) =>
    set((state) => ({
      subtitleStyle: { ...state.subtitleStyle, ...style },
      isDirty: true,
    })),
  setTranscriptionLanguage: (transcriptionLanguage) => set({ transcriptionLanguage }),
  setRightPanelTab: (rightPanelTab) => set({ rightPanelTab }),
  setLeftNavActive: (leftNavActive) => set({ leftNavActive }),

  reset: () => set(initialState),
}));
