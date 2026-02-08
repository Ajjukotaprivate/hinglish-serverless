-- Fix RLS policies for projects table
-- This migration tightens the permissive policies to enforce user-level data isolation

-- Drop the old permissive policy
DROP POLICY IF EXISTS "Users can manage own projects" ON projects;

-- Add user-scoped policies
CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  USING (user_id = auth.uid()::text OR user_id = 'anonymous');

CREATE POLICY "Users can insert own projects"
  ON projects FOR INSERT
  WITH CHECK (user_id = auth.uid()::text OR user_id = 'anonymous');

CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  USING (user_id = auth.uid()::text);
