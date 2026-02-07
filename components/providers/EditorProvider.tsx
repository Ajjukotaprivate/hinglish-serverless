"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useEditorStore } from "@/lib/store";
import { createProject, loadProject } from "@/lib/projects";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";
import type { SubtitleSegment } from "@/lib/types";

export function EditorProvider({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const initialized = useRef(false);
  const { setProject, setMedia, setSegments } = useEditorStore();

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const loadOrCreate = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id ?? "anonymous";

      const id = searchParams.get("project");
      if (id) {
        const project = await loadProject(id);
        if (project) {
          setProject(project.id, project.name);
          setMedia({
            videoUrl: project.video_url,
            audioUrl: project.audio_url,
            srtUrl: project.srt_url,
            vttUrl: project.vtt_url,
            duration: 0,
          });
          const segments = (project.segments_json || []).map(
            (s: { id?: string; start: number; end: number; text: string }) => ({
              id: s.id || uuidv4(),
              start: s.start,
              end: s.end,
              text: s.text,
            })
          ) as SubtitleSegment[];
          setSegments(segments);
          if (project.video_url) {
            const video = document.createElement("video");
            video.preload = "metadata";
            video.src = project.video_url;
            video.onloadedmetadata = () => {
              useEditorStore.getState().setMedia({ duration: video.duration });
            };
          }
          return;
        }
      }

      const project = await createProject("Untitled Project", userId);
      setProject(project.id, project.name);
    };

    loadOrCreate();
  }, [searchParams, setProject, setMedia, setSegments]);

  return <>{children}</>;
}
