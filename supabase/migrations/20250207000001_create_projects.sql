-- Projects table for storing editor state
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL DEFAULT 'anonymous',
  name TEXT NOT NULL DEFAULT 'Untitled Project',
  video_url TEXT,
  audio_url TEXT,
  srt_url TEXT,
  vtt_url TEXT,
  segments_json JSONB DEFAULT '[]'::jsonb,
  canvas_state JSONB,
  timeline_state JSONB,
  aspect_ratio TEXT DEFAULT '9:16',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Policy: users can manage their own projects (by user_id)
CREATE POLICY "Users can manage own projects"
  ON projects FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create videos bucket (run in Supabase dashboard if not exists)
-- Storage bucket 'videos' should be created manually with public read policy
-- CREATE BUCKET videos (public);

-- Create exports bucket for Phase 3
-- CREATE BUCKET exports (public);
