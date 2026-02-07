"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useEditorStore } from "@/lib/store";
import { saveProject } from "@/lib/projects";
import { ExportModal } from "@/components/export/ExportModal";
import { supabase } from "@/lib/supabase";

const AUTO_SAVE_INTERVAL = 2000;

export function TopBar() {
  const [exportOpen, setExportOpen] = useState(false);
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [credits, setCredits] = useState<number>(3);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    supabase.auth.onAuthStateChange((_, session) => setUser(session?.user ?? null));
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    supabase
      .from("profiles")
      .select("credits")
      .eq("id", user.id)
      .single()
      .then(({ data }) => setCredits(data?.credits ?? 3));
  }, [user?.id]);

  const {
    projectId,
    projectName,
    isDirty,
    isSaving,
    setSaving,
    setDirty,
    videoUrl,
    audioUrl,
    srtUrl,
    vttUrl,
    segments,
    aspectRatio,
  } = useEditorStore();

  const handleSave = useCallback(async () => {
    if (!projectId || !isDirty) return;
    setSaving(true);
    try {
      await saveProject(projectId, {
        name: projectName,
        video_url: videoUrl,
        audio_url: audioUrl,
        srt_url: srtUrl,
        vtt_url: vttUrl,
        segments_json: segments,
        aspect_ratio: aspectRatio,
      });
      setDirty(false);
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setSaving(false);
    }
  }, [projectId, isDirty, projectName, videoUrl, audioUrl, srtUrl, vttUrl, segments, aspectRatio, setSaving, setDirty]);

  useEffect(() => {
    if (!projectId || !isDirty) return;
    const timer = setTimeout(handleSave, AUTO_SAVE_INTERVAL);
    return () => clearTimeout(timer);
  }, [projectId, isDirty, handleSave]);

  return (
    <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-red-600">Hinglish Editor</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">{projectName}</span>
          <span className="text-xs text-gray-500">
            {isSaving ? "Saving..." : isDirty ? "Unsaved" : "Saved"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => setExportOpen(true)}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Export
        </button>
        <ExportModal isOpen={exportOpen} onClose={() => setExportOpen(false)} />
        <a
          href="#"
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Feedback
        </a>
        <span className="text-sm text-gray-600">
          <span className="font-medium">{credits}</span> credits{" "}
          <Link href="/credits" className="text-primary hover:underline">
            Get more
          </Link>
        </span>
        {user ? (
          <Link
            href="/dashboard"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-sm font-medium text-gray-600"
          >
            {user.email?.[0]?.toUpperCase() ?? "U"}
          </Link>
        ) : (
          <Link
            href="/login"
            className="rounded bg-primary px-4 py-2 text-sm text-white hover:bg-primary-hover"
          >
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}
