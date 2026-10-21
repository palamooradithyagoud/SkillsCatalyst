-- ====================================================================
-- SKILLSCATALYST DATABASE MIGRATION
-- Migration Name: 20261026_add_time_range_and_collaborators.sql
-- Description: Adds time_range and collaborators columns to public.tasks
--              for study sessions, scheduling, and peer study buddy collaboration.
-- ====================================================================

-- 1. Add time_range text column (e.g. '10:00-11:30 PM')
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS time_range TEXT;

-- 2. Add collaborators JSONB column (e.g. ['Sarah Jenkins', 'Alex Chen'])
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS collaborators JSONB DEFAULT '[]'::jsonb;

-- 3. Create GIN index for collaborators search if querying by collaborator
CREATE INDEX IF NOT EXISTS idx_tasks_collaborators ON public.tasks USING gin (collaborators);
