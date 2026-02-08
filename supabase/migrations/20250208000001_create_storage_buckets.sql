-- Storage buckets for video processing pipeline
-- PRODUCTION-READY: Private buckets with proper RLS
-- Railway uses service_role key which bypasses RLS for server-side operations

-- ============================================
-- CREATE BUCKETS (PRIVATE by default)
-- ============================================

-- 1. VIDEOS bucket: stores original uploaded videos
-- Private: Only accessible via service role or signed URLs
INSERT INTO storage.buckets (id, name, public)
VALUES ('videos', 'videos', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- 2. AUDIO bucket: stores extracted audio files  
-- Private: Internal processing only
INSERT INTO storage.buckets (id, name, public)
VALUES ('audio', 'audio', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- 3. SUBTITLES bucket: stores SRT/VTT/JSON files
-- Private: Accessed via signed URLs in frontend
INSERT INTO storage.buckets (id, name, public)
VALUES ('subtitles', 'subtitles', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- 4. EXPORTS bucket: stores final burned videos
-- Private: User gets signed URL to download
INSERT INTO storage.buckets (id, name, public)
VALUES ('exports', 'exports', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- ============================================
-- RLS POLICIES FOR STORAGE
-- Note: service_role key BYPASSES RLS entirely
-- These policies are for anon/authenticated client access
-- ============================================

-- VIDEOS bucket policies
-- Users can read their own videos (via signed URL or direct if authenticated)
DROP POLICY IF EXISTS "Users can view own videos" ON storage.objects;
CREATE POLICY "Users can view own videos"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'videos' AND
    (auth.uid()::text = (storage.foldername(name))[1] OR (storage.foldername(name))[1] = 'anonymous')
  );

-- Users can upload to their own folder
DROP POLICY IF EXISTS "Users can upload videos" ON storage.objects;
CREATE POLICY "Users can upload videos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'videos' AND
    (auth.uid()::text = (storage.foldername(name))[1] OR (storage.foldername(name))[1] = 'anonymous')
  );

-- Users can delete their own videos
DROP POLICY IF EXISTS "Users can delete own videos" ON storage.objects;
CREATE POLICY "Users can delete own videos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'videos' AND
    (auth.uid()::text = (storage.foldername(name))[1] OR (storage.foldername(name))[1] = 'anonymous')
  );

-- AUDIO bucket policies (service role handles most, but allow user read for debugging)
DROP POLICY IF EXISTS "Users can view own audio" ON storage.objects;
CREATE POLICY "Users can view own audio"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'audio' AND
    (auth.uid()::text = (storage.foldername(name))[1] OR (storage.foldername(name))[1] = 'anonymous')
  );

DROP POLICY IF EXISTS "Users can upload audio" ON storage.objects;
CREATE POLICY "Users can upload audio"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'audio' AND
    (auth.uid()::text = (storage.foldername(name))[1] OR (storage.foldername(name))[1] = 'anonymous')
  );

-- SUBTITLES bucket policies
DROP POLICY IF EXISTS "Users can view own subtitles" ON storage.objects;
CREATE POLICY "Users can view own subtitles"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'subtitles' AND
    (auth.uid()::text = (storage.foldername(name))[1] OR (storage.foldername(name))[1] = 'anonymous')
  );

DROP POLICY IF EXISTS "Users can upload subtitles" ON storage.objects;
CREATE POLICY "Users can upload subtitles"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'subtitles' AND
    (auth.uid()::text = (storage.foldername(name))[1] OR (storage.foldername(name))[1] = 'anonymous')
  );

-- EXPORTS bucket policies  
DROP POLICY IF EXISTS "Users can view own exports" ON storage.objects;
CREATE POLICY "Users can view own exports"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'exports' AND
    (auth.uid()::text = (storage.foldername(name))[1] OR (storage.foldername(name))[1] = 'anonymous')
  );

DROP POLICY IF EXISTS "Users can upload exports" ON storage.objects;
CREATE POLICY "Users can upload exports"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'exports' AND
    (auth.uid()::text = (storage.foldername(name))[1] OR (storage.foldername(name))[1] = 'anonymous')
  );

DROP POLICY IF EXISTS "Users can delete own exports" ON storage.objects;
CREATE POLICY "Users can delete own exports"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'exports' AND
    (auth.uid()::text = (storage.foldername(name))[1] OR (storage.foldername(name))[1] = 'anonymous')
  );
