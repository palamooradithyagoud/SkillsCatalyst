-- ====================================================================
-- SKILLSCATALYST - NON-DESTRUCTIVE RLS SECURITY & DEFAULT CLEANUP MIGRATION
-- ====================================================================
-- MANUAL ACTION REQUIRED:
-- Copy and run this script in the Supabase SQL Editor (https://supabase.com/dashboard)
-- to enforce strict per-user data isolation and clean up column defaults.
-- ====================================================================

-- ── 1. Enable Row Level Security (RLS) on all user-owned tables ─────
ALTER TABLE public.user_academic_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_coding_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leetcode_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_progress ENABLE ROW LEVEL SECURITY;

-- ── 2. Drop existing permissive policies ─────────────────────────────
DROP POLICY IF EXISTS "Allow anon all on user_academic_profile" ON public.user_academic_profile;
DROP POLICY IF EXISTS "Allow anon all on user_coding_profiles" ON public.user_coding_profiles;
DROP POLICY IF EXISTS "Allow anon all on user_progress" ON public.user_progress;
DROP POLICY IF EXISTS "Allow anon all on leetcode_progress" ON public.leetcode_progress;
DROP POLICY IF EXISTS "Allow anon all on roadmap_progress" ON public.roadmap_progress;
DROP POLICY IF EXISTS "Allow anon all on resume_scores" ON public.resume_scores;
DROP POLICY IF EXISTS "Allow anon all on saved_playlists" ON public.saved_playlists;
DROP POLICY IF EXISTS "Allow anon all on video_progress" ON public.video_progress;

DROP POLICY IF EXISTS "Users can only access own academic profile" ON public.user_academic_profile;
DROP POLICY IF EXISTS "Users can only access own coding profile" ON public.user_coding_profiles;
DROP POLICY IF EXISTS "Users can only access own progress" ON public.user_progress;
DROP POLICY IF EXISTS "Users can only access own leetcode progress" ON public.leetcode_progress;
DROP POLICY IF EXISTS "Users can only access own roadmap progress" ON public.roadmap_progress;
DROP POLICY IF EXISTS "Users can only access own resume scores" ON public.resume_scores;
DROP POLICY IF EXISTS "Users can only access own saved playlists" ON public.saved_playlists;
DROP POLICY IF EXISTS "Users can only access own video progress" ON public.video_progress;

-- ── 3. Create strict per-user policies (auth.uid() matching user_id) ──

-- user_academic_profile
CREATE POLICY "Users can only access own academic profile"
    ON public.user_academic_profile
    FOR ALL
    USING ((auth.uid())::text = user_id)
    WITH CHECK ((auth.uid())::text = user_id);

-- user_coding_profiles
CREATE POLICY "Users can only access own coding profile"
    ON public.user_coding_profiles
    FOR ALL
    USING ((auth.uid())::text = user_id)
    WITH CHECK ((auth.uid())::text = user_id);

-- user_progress
CREATE POLICY "Users can only access own progress"
    ON public.user_progress
    FOR ALL
    USING ((auth.uid())::text = user_id)
    WITH CHECK ((auth.uid())::text = user_id);

-- leetcode_progress
CREATE POLICY "Users can only access own leetcode progress"
    ON public.leetcode_progress
    FOR ALL
    USING ((auth.uid())::text = user_id)
    WITH CHECK ((auth.uid())::text = user_id);

-- roadmap_progress
CREATE POLICY "Users can only access own roadmap progress"
    ON public.roadmap_progress
    FOR ALL
    USING ((auth.uid())::text = user_id)
    WITH CHECK ((auth.uid())::text = user_id);

-- resume_scores
CREATE POLICY "Users can only access own resume scores"
    ON public.resume_scores
    FOR ALL
    USING ((auth.uid())::text = user_id)
    WITH CHECK ((auth.uid())::text = user_id);

-- saved_playlists
CREATE POLICY "Users can only access own saved playlists"
    ON public.saved_playlists
    FOR ALL
    USING ((auth.uid())::text = user_id)
    WITH CHECK ((auth.uid())::text = user_id);

-- video_progress
CREATE POLICY "Users can only access own video progress"
    ON public.video_progress
    FOR ALL
    USING ((auth.uid())::text = user_id)
    WITH CHECK ((auth.uid())::text = user_id);

-- ── 4. Remove DEFAULT 'default_user' from all user_id columns ────────
ALTER TABLE public.user_academic_profile ALTER COLUMN user_id DROP DEFAULT;
ALTER TABLE public.user_coding_profiles ALTER COLUMN user_id DROP DEFAULT;
ALTER TABLE public.user_progress ALTER COLUMN user_id DROP DEFAULT;
ALTER TABLE public.leetcode_progress ALTER COLUMN user_id DROP DEFAULT;
ALTER TABLE public.roadmap_progress ALTER COLUMN user_id DROP DEFAULT;
ALTER TABLE public.resume_scores ALTER COLUMN user_id DROP DEFAULT;
ALTER TABLE public.saved_playlists ALTER COLUMN user_id DROP DEFAULT;
ALTER TABLE public.video_progress ALTER COLUMN user_id DROP DEFAULT;
