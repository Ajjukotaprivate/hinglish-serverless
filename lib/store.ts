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

  // Timeline
  segments: SubtitleSegment[];
  playhead: number;
  isPlaying: boolean;
  selectedSegmentId: string | null;

  // Canvas
  aspectRatio: AspectRatio;

  // Subtitle style
  subtitleStyle: SubtitleStyle;

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

  setSegments: (segments: SubtitleSegment[]) => void;
  updateSegment: (id: string, updates: Partial<SubtitleSegment>) => void;
  addSegment: (segment: SubtitleSegment) => void;
  deleteSegment: (id: string) => void;
  setPlayhead: (time: number) => void;
  setPlaying: (playing: boolean) => void;
  setSelectedSegment: (id: string | null) => void;

  setAspectRatio: (ratio: AspectRatio) => void;
  setSubtitleStyle: (style: Partial<SubtitleStyle>) => void;
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
  segments: [],
  playhead: 0,
  isPlaying: false,
  selectedSegmentId: null,
  aspectRatio: "9:16" as AspectRatio,
  subtitleStyle: defaultSubtitleStyle,
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
  setPlayhead: (playhead) => set({ playhead }),
  setPlaying: (playing) => set({ isPlaying: playing }),
  setSelectedSegment: (selectedSegmentId) => set({ selectedSegmentId }),

  setAspectRatio: (aspectRatio) => set({ aspectRatio }),
  setSubtitleStyle: (style) =>
    set((state) => ({
      subtitleStyle: { ...state.subtitleStyle, ...style },
      isDirty: true,
    })),
  setRightPanelTab: (rightPanelTab) => set({ rightPanelTab }),
  setLeftNavActive: (leftNavActive) => set({ leftNavActive }),

  reset: () => set(initialState),
}));
