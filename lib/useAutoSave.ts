import { useEffect, useRef } from "react";
import { useEditorStore } from "./store";
import { saveProject } from "./projects";

/**
 * Auto-save hook - saves project to Supabase when changes are made.
 * Uses 2-second debounce to avoid excessive API calls.
 */
export function useAutoSave() {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const {
        projectId,
        isDirty,
        segments,
        aspectRatio,
        subtitleStyle,
        videoUrl,
        audioUrl,
        srtUrl,
        vttUrl,
    } = useEditorStore();

    useEffect(() => {
        if (!projectId || !isDirty) return;

        // Clear any pending save
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Schedule save after 2 seconds of inactivity
        timeoutRef.current = setTimeout(async () => {
            const { setSaving, setDirty } = useEditorStore.getState();
            setSaving(true);

            try {
                await saveProject(projectId, {
                    segments_json: segments,
                    aspect_ratio: aspectRatio,
                    video_url: videoUrl,
                    audio_url: audioUrl,
                    srt_url: srtUrl,
                    vtt_url: vttUrl,
                });
                setDirty(false);
                console.log("[AutoSave] Project saved");
            } catch (err) {
                console.error("[AutoSave] Failed:", err);
            } finally {
                setSaving(false);
            }
        }, 2000);

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [projectId, isDirty, segments, aspectRatio, subtitleStyle, videoUrl, audioUrl, srtUrl, vttUrl]);
}
