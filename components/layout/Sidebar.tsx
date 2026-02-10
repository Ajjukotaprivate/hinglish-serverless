"use client";

import { useState, useEffect } from "react";
import { MediaPanel } from "@/components/media/MediaPanel";
import { useEditorStore } from "@/lib/store";
import { transcribeVideo } from "@/lib/api";
import type { TranscriptionLanguage } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";
import type { SubtitleSegment } from "@/lib/types";

type NavItem = "media" | "autoedit" | "subtitles" | "style" | "progress" | "text" | "audio" | "settings";

const LANG_OPTIONS: { value: TranscriptionLanguage; label: string }[] = [
  { value: "hinglish", label: "Hinglish" },
  { value: "hindi", label: "Hindi" },
  { value: "english", label: "English" },
];

function SubtitlesTranscriptionPanel() {
  const {
    videoUrl,
    transcriptionLanguage,
    setTranscriptionLanguage,
    setMedia,
    setSegments,
    setProcessing,
    isProcessing,
  } = useEditorStore();
  const [userId, setUserId] = useState<string>("anonymous");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id ?? "anonymous");
    });
  }, []);

  const canStart = Boolean(videoUrl && !isProcessing);

  const handleStartTranscription = async () => {
    if (!videoUrl) return;
    setError(null);
    setProcessing(true, "Transcribing...");
    try {
      const result = await transcribeVideo(videoUrl, userId, transcriptionLanguage);
      if (!result.success || !result.subtitles?.segments) {
        throw new Error(result.error || "Transcription failed");
      }
      const segmentsWithIds: SubtitleSegment[] = (result.subtitles.segments || []).map(
        (seg: { start: number; end: number; text: string }) => ({
          id: uuidv4(),
          start: seg.start,
          end: seg.end,
          text: seg.text,
        })
      );
      setSegments(segmentsWithIds);
      setMedia({
        audioUrl: result.audioUrl ?? undefined,
        srtUrl: result.subtitles.srt ?? undefined,
        vttUrl: result.subtitles.vtt ?? undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transcription failed");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-gray-700">TRANSCRIPTION</p>
      <p className="text-sm text-gray-500">
        Generate subtitles from your video&apos;s audio. Upload a video first, then start transcription.
      </p>
      <select
        className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
        value={transcriptionLanguage}
        onChange={(e) => setTranscriptionLanguage(e.target.value as TranscriptionLanguage)}
      >
        {LANG_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <button
        type="button"
        disabled={!canStart}
        onClick={handleStartTranscription}
        className="w-full rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
      >
        {isProcessing ? "Transcribing…" : "Start Transcription"}
      </button>
      {!videoUrl && (
        <p className="text-xs text-gray-400">
          Upload a video in Media to enable
        </p>
      )}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

const navItems: { id: NavItem; label: string; icon: string }[] = [
  { id: "media", label: "Media", icon: "📁" },
  { id: "autoedit", label: "Auto-Edit", icon: "⚡" },
  { id: "subtitles", label: "Subtitles", icon: "📄" },
  { id: "style", label: "Subtitle Style", icon: "🎨" },
  { id: "progress", label: "Progress Bar", icon: "▬" },
  { id: "text", label: "Text", icon: "💬" },
  { id: "audio", label: "Audio", icon: "🔊" },
  { id: "settings", label: "Settings", icon: "⚙" },
];

export function Sidebar() {
  const { leftNavActive, setLeftNavActive } = useEditorStore();
  const active = leftNavActive;

  return (
    <aside className="flex w-60 flex-col border-r border-gray-200 bg-white">
      <nav className="flex flex-col py-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setLeftNavActive(item.id)}
            className={`flex items-center gap-3 px-4 py-2.5 text-left text-sm ${
              active === item.id
                ? "bg-blue-50 font-medium text-primary"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="flex-1 overflow-y-auto border-t border-gray-100 p-4">
        {active === "media" && <MediaPanel />}
        {active === "subtitles" && (
          <SubtitlesTranscriptionPanel />
        )}
        {active === "style" && (
          <div className="text-sm text-gray-500">
            Subtitle style options will appear when Subtitle Style is selected.
          </div>
        )}
        {active === "audio" && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700">AUDIO TRACKS</p>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>• Main video audio</li>
              <li>• Background music</li>
            </ul>
            <div>
              <label className="block text-xs text-gray-500">Volume</label>
              <input type="range" min="0" max="100" defaultValue="100" className="w-full" />
            </div>
            <p className="text-xs text-gray-400">Fade in/out coming soon</p>
          </div>
        )}
        {active === "settings" && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700">SETTINGS</p>
            <p className="text-sm text-gray-500">
              Configure export settings in the inspector panel.
            </p>
          </div>
        )}
        {active === "autoedit" && (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">Auto-edit your video</p>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>• Silence detection</li>
              <li>• Remove filler words</li>
              <li>• Smart cut / jump cuts</li>
              <li>• Auto zoom to speaker</li>
            </ul>
            <p className="text-xs text-gray-400">Coming soon</p>
          </div>
        )}
        {active === "progress" && (
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Progress bar overlay</p>
            <p className="text-xs text-gray-400">Coming soon</p>
          </div>
        )}
        {active === "text" && (
          <div className="space-y-3">
            <p className="text-xs font-medium text-gray-500">
              TEXT ELEMENTS (Drag or click + to add)
            </p>
            {[
              { id: "title", label: "TITLE", desc: "Large centered title." },
              { id: "lower", label: "Lower Third", desc: "Name at bottom left." },
              { id: "watermark", label: "Watermark", desc: "Small text in corner." },
              { id: "vlog", label: "VLOG COUNTER", desc: "Dynamic day counter." },
              { id: "mrr", label: "MRR Counter", desc: "Animated revenue flip counter." },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                className="flex w-full flex-col rounded border border-gray-200 p-2 text-left hover:bg-gray-50"
              >
                <span className="font-medium">{item.label}</span>
                <span className="text-xs text-gray-500">{item.desc}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
