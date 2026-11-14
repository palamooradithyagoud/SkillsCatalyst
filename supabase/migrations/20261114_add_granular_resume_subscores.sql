-- ====================================================================
-- MIGRATION: 20261114_add_granular_resume_subscores.sql
-- DESCRIPTION: Add explicit structure_score, content_quality_score,
--              and score_status to public.resume_scores table.
-- BACKWARD COMPATIBILITY: Completely non-destructive.
-- Existing columns and records remain untouched.
-- ====================================================================

-- 1. Add optional granular subscore columns if not already present
ALTER TABLE public.resume_scores
ADD COLUMN IF NOT EXISTS structure_score NUMERIC(5, 2),
ADD COLUMN IF NOT EXISTS content_quality_score NUMERIC(5, 2),
ADD COLUMN IF NOT EXISTS score_status TEXT DEFAULT 'completed';

-- 2. Add documentation comments
COMMENT ON COLUMN public.resume_scores.structure_score IS 'Evaluated resume structure and formatting score (0-100 scale). NULL if unavailable.';
COMMENT ON COLUMN public.resume_scores.content_quality_score IS 'Evaluated resume content depth and phrasing quality score (0-100 scale). NULL if unavailable.';
COMMENT ON COLUMN public.resume_scores.score_status IS 'Evaluation status: completed, partially_completed, failed, or pending.';

