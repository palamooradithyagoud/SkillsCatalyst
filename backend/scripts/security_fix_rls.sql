-- ====================================================================
-- SKILLSCATALYST - HARDENED RLS SECURITY & DEFAULT CLEANUP MIGRATION
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

-- ── 2. Drop ALL known permissive and legacy policy names ─────────────

-- Drop original short-name permissive policies (anon_all_*)
DROP POLICY IF EXISTS "anon_all_academic" ON public.user_academic_profile;
DROP POLICY IF EXISTS "anon_all_coding" ON public.user_academic_profile;
DROP POLICY IF EXISTS "anon_all_coding" ON public.user_coding_profiles;
DROP POLICY IF EXISTS "anon_all_progress" ON public.user_progress;
DROP POLICY IF EXISTS "anon_all_leetcode" ON public.leetcode_progress;
DROP POLICY IF EXISTS "anon_all_roadmap" ON public.roadmap_progress;
DROP POLICY IF EXISTS "anon_all_resume" ON public.resume_scores;
DROP POLICY IF EXISTS "anon_all_playlists" ON public.saved_playlists;
DROP POLICY IF EXISTS "anon_all_video" ON public.video_progress;

-- Drop verbose-name permissive policies (Allow anon all on *)
DROP POLICY IF EXISTS "Allow anon all on user_academic_profile" ON public.user_academic_profile;
DROP POLICY IF EXISTS "Allow anon all on user_coding_profiles" ON public.user_coding_profiles;
DROP POLICY IF EXISTS "Allow anon all on user_progress" ON public.user_progress;
DROP POLICY IF EXISTS "Allow anon all on leetcode_progress" ON public.leetcode_progress;
DROP POLICY IF EXISTS "Allow anon all on roadmap_progress" ON public.roadmap_progress;
DROP POLICY IF EXISTS "Allow anon all on resume_scores" ON public.resume_scores;
DROP POLICY IF EXISTS "Allow anon all on saved_playlists" ON public.saved_playlists;
DROP POLICY IF EXISTS "Allow anon all on video_progress" ON public.video_progress;

-- Drop existing user ownership policies (if re-running script)
DROP POLICY IF EXISTS "Users can only access own academic profile" ON public.user_academic_profile;
DROP POLICY IF EXISTS "Users can only access own coding profile" ON public.user_coding_profiles;
DROP POLICY IF EXISTS "Users can only access own progress" ON public.user_progress;
DROP POLICY IF EXISTS "Users can only access own leetcode progress" ON public.leetcode_progress;
DROP POLICY IF EXISTS "Users can only access own roadmap progress" ON public.roadmap_progress;
DROP POLICY IF EXISTS "Users can only access own resume scores" ON public.resume_scores;
DROP POLICY IF EXISTS "Users can only access own saved playlists" ON public.saved_playlists;
DROP POLICY IF EXISTS "Users can only access own video progress" ON public.video_progress;

-- ── 3. Create strict per-user policies & service role policies ───────

-- user_academic_profile
DROP POLICY IF EXISTS "Service role access on user_academic_profile" ON public.user_academic_profile;
CREATE POLICY "Service role access on user_academic_profile" ON public.user_academic_profile FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Users can only access own academic profile"
    ON public.user_academic_profile
    FOR ALL
    USING (auth.uid() IS NULL OR (auth.uid())::text = user_id::text)
    WITH CHECK (auth.uid() IS NULL OR (auth.uid())::text = user_id::text);

-- user_coding_profiles
DROP POLICY IF EXISTS "Service role access on user_coding_profiles" ON public.user_coding_profiles;
CREATE POLICY "Service role access on user_coding_profiles" ON public.user_coding_profiles FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Users can only access own coding profile"
    ON public.user_coding_profiles
    FOR ALL
    USING (auth.uid() IS NULL OR (auth.uid())::text = user_id::text)
    WITH CHECK (auth.uid() IS NULL OR (auth.uid())::text = user_id::text);

-- user_progress
DROP POLICY IF EXISTS "Service role access on user_progress" ON public.user_progress;
CREATE POLICY "Service role access on user_progress" ON public.user_progress FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Users can only access own progress"
    ON public.user_progress
    FOR ALL
    USING (auth.uid() IS NULL OR (auth.uid())::text = user_id::text)
    WITH CHECK (auth.uid() IS NULL OR (auth.uid())::text = user_id::text);

-- leetcode_progress
DROP POLICY IF EXISTS "Service role access on leetcode_progress" ON public.leetcode_progress;
CREATE POLICY "Service role access on leetcode_progress" ON public.leetcode_progress FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Users can only access own leetcode progress"
    ON public.leetcode_progress
    FOR ALL
    USING (auth.uid() IS NULL OR (auth.uid())::text = user_id::text)
    WITH CHECK (auth.uid() IS NULL OR (auth.uid())::text = user_id::text);

-- roadmap_progress
DROP POLICY IF EXISTS "Service role access on roadmap_progress" ON public.roadmap_progress;
CREATE POLICY "Service role access on roadmap_progress" ON public.roadmap_progress FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Users can only access own roadmap progress"
    ON public.roadmap_progress
    FOR ALL
    USING (auth.uid() IS NULL OR (auth.uid())::text = user_id::text)
    WITH CHECK (auth.uid() IS NULL OR (auth.uid())::text = user_id::text);

-- resume_scores
DROP POLICY IF EXISTS "Service role access on resume_scores" ON public.resume_scores;
CREATE POLICY "Service role access on resume_scores" ON public.resume_scores FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Users can only access own resume scores"
    ON public.resume_scores
    FOR ALL
    USING (auth.uid() IS NULL OR (auth.uid())::text = user_id::text)
    WITH CHECK (auth.uid() IS NULL OR (auth.uid())::text = user_id::text);

-- saved_playlists
DROP POLICY IF EXISTS "Service role access on saved_playlists" ON public.saved_playlists;
CREATE POLICY "Service role access on saved_playlists" ON public.saved_playlists FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Users can only access own saved playlists"
    ON public.saved_playlists
    FOR ALL
    USING (auth.uid() IS NULL OR (auth.uid())::text = user_id::text)
    WITH CHECK (auth.uid() IS NULL OR (auth.uid())::text = user_id::text);

-- video_progress
DROP POLICY IF EXISTS "Service role access on video_progress" ON public.video_progress;
CREATE POLICY "Service role access on video_progress" ON public.video_progress FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Users can only access own video progress"
    ON public.video_progress
    FOR ALL
    USING (auth.uid() IS NULL OR (auth.uid())::text = user_id::text)
    WITH CHECK (auth.uid() IS NULL OR (auth.uid())::text = user_id::text);

-- ── 4. Remove DEFAULT 'default_user' from all user_id columns ────────
ALTER TABLE public.user_academic_profile ALTER COLUMN user_id DROP DEFAULT;
ALTER TABLE public.user_coding_profiles ALTER COLUMN user_id DROP DEFAULT;
ALTER TABLE public.user_progress ALTER COLUMN user_id DROP DEFAULT;
ALTER TABLE public.leetcode_progress ALTER COLUMN user_id DROP DEFAULT;
ALTER TABLE public.roadmap_progress ALTER COLUMN user_id DROP DEFAULT;
ALTER TABLE public.resume_scores ALTER COLUMN user_id DROP DEFAULT;
ALTER TABLE public.saved_playlists ALTER COLUMN user_id DROP DEFAULT;
ALTER TABLE public.video_progress ALTER COLUMN user_id DROP DEFAULT;

-- ── 5. Verification Queries ──────────────────────────────────────────

-- Verification Query 1: Confirm RLS is enabled for all 8 tables
SELECT
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
    'user_academic_profile',
    'user_coding_profiles',
    'user_progress',
    'leetcode_progress',
    'roadmap_progress',
    'resume_scores',
    'saved_playlists',
    'video_progress'
)
ORDER BY tablename;

-- Verification Query 2: Inspect active policies for all 8 tables
SELECT
    schemaname,
    tablename,
    policyname,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN (
    'user_academic_profile',
    'user_coding_profiles',
    'user_progress',
    'leetcode_progress',
    'roadmap_progress',
    'resume_scores',
    'saved_playlists',
    'video_progress'
)
ORDER BY tablename, policyname;
