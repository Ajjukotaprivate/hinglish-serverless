"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { TopBar } from "@/components/layout/TopBar";
import { Sidebar } from "@/components/layout/Sidebar";
import { RightPanel } from "@/components/layout/RightPanel";
import { Timeline } from "@/components/layout/Timeline";
import { VideoCanvas } from "@/components/editor/VideoCanvas";
import { useEditorStore } from "@/lib/store";
import { useAutoSave } from "@/lib/useAutoSave";

/** Show timeline only when there is video or subtitles; otherwise blank. */
function TimelineOrBlank() {
  const videoUrl = useEditorStore((s) => s.videoUrl);
  const segments = useEditorStore((s) => s.segments);
  const showTimeline = Boolean(videoUrl || segments.length > 0);
  if (!showTimeline) return null;
  return <Timeline />;
}

export default function Home() {
  const searchParams = useSearchParams();

  // Enable auto-save
  useAutoSave();

  // Load project from URL on mount
  useEffect(() => {
    const projectId = searchParams.get("project");
    if (!projectId) return;

    // Only load if not already loaded
    const currentProjectId = useEditorStore.getState().projectId;
    if (currentProjectId === projectId) return;

    const loadProjectData = async () => {
      try {
        const { loadProject } = await import("@/lib/projects");
        const project = await loadProject(projectId);

        if (project) {
          const store = useEditorStore.getState();
          store.setProject(project.id, project.name);
          store.setMedia({
            videoUrl: project.video_url,
            audioUrl: project.audio_url,
            srtUrl: project.srt_url,
            vttUrl: project.vtt_url,
          });
          store.setSegments(project.segments_json || []);
          store.setDirty(false);
          console.log("[Project] Loaded:", project.name);
        }
      } catch (err) {
        console.error("[Project] Failed to load:", err);
      }
    };

    loadProjectData();
  }, [searchParams]);

  return (
    <div className="flex h-screen flex-col">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex flex-1 flex-col overflow-hidden bg-gray-100">
          <div className="flex flex-1 items-center justify-center p-4">
            <VideoCanvas />
          </div>
          <TimelineOrBlank />
        </main>
        <RightPanel />
      </div>
    </div>
  );
}
