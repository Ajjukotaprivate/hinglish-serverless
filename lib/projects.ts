import { supabase } from "./supabase";
import type { Project, SubtitleSegment } from "./types";

export async function createProject(
  name: string = "Untitled Project",
  userId: string = "anonymous"
): Promise<Project> {
  const { data, error } = await supabase
    .from("projects")
    .insert({
      user_id: userId,
      name,
      segments_json: [],
      aspect_ratio: "9:16",
    })
    .select()
    .single();

  if (error) throw error;
  return {
    ...data,
    segments_json: (data.segments_json || []) as SubtitleSegment[],
  };
}

export async function saveProject(
  projectId: string,
  updates: {
    name?: string;
    video_url?: string | null;
    audio_url?: string | null;
    srt_url?: string | null;
    vtt_url?: string | null;
    segments_json?: SubtitleSegment[];
    canvas_state?: Record<string, unknown> | null;
    timeline_state?: Record<string, unknown> | null;
    aspect_ratio?: string;
  }
): Promise<void> {
  const { error } = await supabase
    .from("projects")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", projectId);

  if (error) throw error;
}

export async function loadProject(projectId: string): Promise<Project | null> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .single();

  if (error || !data) return null;
  return {
    ...data,
    segments_json: (data.segments_json || []) as SubtitleSegment[],
  };
}

export async function listProjects(
  userId: string = "anonymous"
): Promise<Project[]> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return (data || []).map((p) => ({
    ...p,
    segments_json: (p.segments_json || []) as SubtitleSegment[],
  }));
}
