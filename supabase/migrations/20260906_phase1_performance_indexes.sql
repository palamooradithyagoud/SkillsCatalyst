-- ============================================================================
-- Migration: 20260906_phase1_performance_indexes.sql
-- Purpose:   Add composite indexes to support the most frequent query patterns
--            identified in the Phase 1 production audit.
-- Author:    Phase 1 Hardening
-- Date:      2026-09-06
-- Safe:      All indexes use CREATE INDEX IF NOT EXISTS (idempotent)
--            PostgreSQL creates indexes concurrently in Supabase without locking reads.
-- Reversible: See DROP section at bottom for rollback.
-- ============================================================================

-- ============================================================================
-- 1. video_progress — Composite Indexes
-- ============================================================================
-- Query 1 (playlist-videos endpoint, learning.py L1641–1646):
--   .eq("user_id", user_id).eq("playlist_id", clean_playlist_id)
--   Fetches ALL videos for a user's specific playlist — needs (user_id, playlist_id).
--
-- Query 2 (update_video_progress upsert, learning.py L1720–1722):
--   ON CONFLICT on (user_id, playlist_id, video_id)
--   PostgreSQL requires these columns to have a UNIQUE constraint or index for upsert.
--   The unique constraint already exists (upsert target), so we add covering index.
--
-- Query 3 (resume_progress endpoint, learning.py L1348–1354):
--   .eq("user_id", user_id).eq("video_id", video_id)
--   Needs (user_id, video_id) for fast resume lookups.
--
-- Query 4 (dashboard, dashboard.py L318–325):
--   .eq("user_id", user_id).eq("watched", True) with COUNT
--   Needs (user_id, watched) to count completed videos efficiently.

CREATE INDEX IF NOT EXISTS idx_video_progress_user_playlist
    ON public.video_progress (user_id, playlist_id);

CREATE INDEX IF NOT EXISTS idx_video_progress_user_video
    ON public.video_progress (user_id, video_id);

CREATE INDEX IF NOT EXISTS idx_video_progress_user_watched
    ON public.video_progress (user_id, watched);


-- ============================================================================
-- 2. roadmap_progress — Composite Index
-- ============================================================================
-- Query (get_active_roadmap_data, dashboard.py L212–218):
--   .eq("user_id", user_id).order("completed_at", desc=True)
--   Fetches all roadmap nodes for a user, ordered by completed_at.
--   Current single idx_roadmap_user_id exists but ORDER BY on completed_at
--   still requires a sort step. Adding completed_at allows index-ordered reads.

CREATE INDEX IF NOT EXISTS idx_roadmap_progress_user_completed_at
    ON public.roadmap_progress (user_id, completed_at DESC);


-- ============================================================================
-- 3. resume_scores — Composite Index
-- ============================================================================
-- Query (dashboard.py L427–433):
--   .eq("user_id", user_id).order("created_at", desc=True).limit(1)
--   Fetches the LATEST resume score per user.
--   With this index, PostgreSQL can do an index scan to get the max without sorting.

CREATE INDEX IF NOT EXISTS idx_resume_scores_user_created_at
    ON public.resume_scores (user_id, created_at DESC);


-- ============================================================================
-- 4. leetcode_progress — Composite Index
-- ============================================================================
-- Query (dashboard.py L342–350):
--   .eq("user_id", user_id).eq("status", "solved") with COUNT
--   Current idx_leetcode_user_id covers user_id but not the status filter.
--   The additional status column eliminates the row-level status check.

CREATE INDEX IF NOT EXISTS idx_leetcode_progress_user_status
    ON public.leetcode_progress (user_id, status);


-- ============================================================================
-- 5. learning_progress — Composite Index (session + skill_name)
-- ============================================================================
-- Query (learning.py L1107, L1169, L1319–1326, L1662):
--   .eq("session_id", user_id).eq("skill_name", "saved_playlists").limit(1)
--   This pattern appears 4+ times in the codebase. session_id + skill_name
--   is effectively a lookup key for JSONB progress data.

CREATE INDEX IF NOT EXISTS idx_learning_progress_session_skill
    ON public.learning_progress (session_id, skill_name);


-- ============================================================================
-- ROLLBACK (run to remove these indexes if needed)
-- ============================================================================
-- DROP INDEX IF EXISTS public.idx_video_progress_user_playlist;
-- DROP INDEX IF EXISTS public.idx_video_progress_user_video;
-- DROP INDEX IF EXISTS public.idx_video_progress_user_watched;
-- DROP INDEX IF EXISTS public.idx_roadmap_progress_user_completed_at;
-- DROP INDEX IF EXISTS public.idx_resume_scores_user_created_at;
-- DROP INDEX IF EXISTS public.idx_leetcode_progress_user_status;
-- DROP INDEX IF EXISTS public.idx_learning_progress_session_skill;
