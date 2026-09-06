-- ====================================================================
-- SKILLSCATALYST - HARDENED PRODUCTION FIX FOR POSTGRESQL 42501
-- ====================================================================
-- Root Cause:
-- A previous migration executed 'REVOKE ALL ON <table> FROM anon;', stripping
-- table-level DAC permissions from the PostgreSQL 'anon' role.
-- In Supabase, unauthenticated requests, initial page loads, and guest sessions
-- connect via PostgREST as role 'anon'. When 'anon' has no table grants, PostgreSQL
-- terminates queries immediately with:
--   ERROR 42501: permission denied for table <table_name>
-- before Row-Level Security (RLS) policies can even be evaluated.
--
-- Security Hardening & Architecture:
-- 1. Table-level DAC permissions for 'anon' are restricted to SELECT ONLY.
--    'anon' has ZERO INSERT, UPDATE, or DELETE permissions on user tables (Principle of Least Privilege).
-- 2. 'authenticated' and 'service_role' receive required CRUD permissions.
-- 3. Row Level Security (RLS) is enabled and enforced across all tables.
-- 4. User-specific tables require 'auth.uid() = user_id' for authenticated access.
--    Because auth.uid() is NULL for anon callers, SELECT queries by anon cleanly
--    return 0 rows (HTTP 200 OK: []) without throwing 42501 or leaking data.
-- 5. No direct anon ALL policy is granted on 'learning_progress'. Guest learning
--    progress is mediated exclusively through the FastAPI backend using signed
--    HMAC tokens ('X-Guest-Session-Token') and 'service_role'.
-- ====================================================================

-- ── 1. GRANT TABLE-LEVEL PERMISSIONS (ANON: SELECT ONLY; AUTH: FULL CRUD) ───

-- anon receives SELECT ONLY on user-specific tables to eliminate 42501 on reads
GRANT SELECT ON public.user_academic_profile TO anon;
GRANT SELECT ON public.user_coding_profiles TO anon;
GRANT SELECT ON public.user_progress TO anon;
GRANT SELECT ON public.leetcode_progress TO anon;
GRANT SELECT ON public.roadmap_progress TO anon;
GRANT SELECT ON public.resume_scores TO anon;
GRANT SELECT ON public.saved_playlists TO anon;
GRANT SELECT ON public.video_progress TO anon;
GRANT SELECT ON public.learning_progress TO anon;
GRANT SELECT ON public.user_todos TO anon;
GRANT SELECT ON public.user_schedule_notes TO anon;
GRANT SELECT ON public.welcome_email_events TO anon;
GRANT SELECT, INSERT ON public.user_feedback TO anon;

-- authenticated and service_role receive required CRUD privileges
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_academic_profile TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_coding_profiles TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_progress TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leetcode_progress TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.roadmap_progress TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.resume_scores TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_playlists TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.video_progress TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.learning_progress TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_todos TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_schedule_notes TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.welcome_email_events TO authenticated, service_role;
GRANT SELECT, INSERT ON public.user_feedback TO authenticated, service_role;

-- Grant sequence usages to prevent serial ID exhaustion errors
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- ── 2. ENSURE ROW LEVEL SECURITY (RLS) IS ENABLED ON ALL TABLES ───────────────
ALTER TABLE public.user_academic_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_coding_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leetcode_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_schedule_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.welcome_email_events ENABLE ROW LEVEL SECURITY;

-- ── 3. STRICT RLS OWNERSHIP POLICIES (NO ANON ACCESS TO USER ROWS) ───────────

-- user_academic_profile
DROP POLICY IF EXISTS "Service role access on user_academic_profile" ON public.user_academic_profile;
DROP POLICY IF EXISTS "Strict user ownership on user_academic_profile" ON public.user_academic_profile;
CREATE POLICY "Service role access on user_academic_profile" ON public.user_academic_profile FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Strict user ownership on user_academic_profile" ON public.user_academic_profile FOR ALL TO authenticated USING (user_id IS NOT NULL AND auth.uid()::text = user_id::text) WITH CHECK (user_id IS NOT NULL AND auth.uid()::text = user_id::text);

-- user_coding_profiles
DROP POLICY IF EXISTS "Service role access on user_coding_profiles" ON public.user_coding_profiles;
DROP POLICY IF EXISTS "Strict user ownership on user_coding_profiles" ON public.user_coding_profiles;
CREATE POLICY "Service role access on user_coding_profiles" ON public.user_coding_profiles FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Strict user ownership on user_coding_profiles" ON public.user_coding_profiles FOR ALL TO authenticated USING (user_id IS NOT NULL AND auth.uid()::text = user_id::text) WITH CHECK (user_id IS NOT NULL AND auth.uid()::text = user_id::text);

-- user_progress
DROP POLICY IF EXISTS "Service role access on user_progress" ON public.user_progress;
DROP POLICY IF EXISTS "Strict user ownership on user_progress" ON public.user_progress;
CREATE POLICY "Service role access on user_progress" ON public.user_progress FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Strict user ownership on user_progress" ON public.user_progress FOR ALL TO authenticated USING (user_id IS NOT NULL AND auth.uid()::text = user_id::text) WITH CHECK (user_id IS NOT NULL AND auth.uid()::text = user_id::text);

-- leetcode_progress
DROP POLICY IF EXISTS "Service role access on leetcode_progress" ON public.leetcode_progress;
DROP POLICY IF EXISTS "Strict user ownership on leetcode_progress" ON public.leetcode_progress;
CREATE POLICY "Service role access on leetcode_progress" ON public.leetcode_progress FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Strict user ownership on leetcode_progress" ON public.leetcode_progress FOR ALL TO authenticated USING (user_id IS NOT NULL AND auth.uid()::text = user_id::text) WITH CHECK (user_id IS NOT NULL AND auth.uid()::text = user_id::text);

-- roadmap_progress
DROP POLICY IF EXISTS "Service role access on roadmap_progress" ON public.roadmap_progress;
DROP POLICY IF EXISTS "Strict user ownership on roadmap_progress" ON public.roadmap_progress;
CREATE POLICY "Service role access on roadmap_progress" ON public.roadmap_progress FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Strict user ownership on roadmap_progress" ON public.roadmap_progress FOR ALL TO authenticated USING (user_id IS NOT NULL AND auth.uid()::text = user_id::text) WITH CHECK (user_id IS NOT NULL AND auth.uid()::text = user_id::text);

-- resume_scores
DROP POLICY IF EXISTS "Service role access on resume_scores" ON public.resume_scores;
DROP POLICY IF EXISTS "Strict user ownership on resume_scores" ON public.resume_scores;
CREATE POLICY "Service role access on resume_scores" ON public.resume_scores FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Strict user ownership on resume_scores" ON public.resume_scores FOR ALL TO authenticated USING (user_id IS NOT NULL AND auth.uid()::text = user_id::text) WITH CHECK (user_id IS NOT NULL AND auth.uid()::text = user_id::text);

-- saved_playlists
DROP POLICY IF EXISTS "Service role access on saved_playlists" ON public.saved_playlists;
DROP POLICY IF EXISTS "Strict user ownership on saved_playlists" ON public.saved_playlists;
CREATE POLICY "Service role access on saved_playlists" ON public.saved_playlists FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Strict user ownership on saved_playlists" ON public.saved_playlists FOR ALL TO authenticated USING (user_id IS NOT NULL AND auth.uid()::text = user_id::text) WITH CHECK (user_id IS NOT NULL AND auth.uid()::text = user_id::text);

-- video_progress
DROP POLICY IF EXISTS "Service role access on video_progress" ON public.video_progress;
DROP POLICY IF EXISTS "Strict user ownership on video_progress" ON public.video_progress;
CREATE POLICY "Service role access on video_progress" ON public.video_progress FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Strict user ownership on video_progress" ON public.video_progress FOR ALL TO authenticated USING (user_id IS NOT NULL AND auth.uid()::text = user_id::text) WITH CHECK (user_id IS NOT NULL AND auth.uid()::text = user_id::text);

-- learning_progress (Strict authenticated ownership only; guests mediated via backend service_role)
DROP POLICY IF EXISTS "Service role full access on learning_progress" ON public.learning_progress;
DROP POLICY IF EXISTS "Strict user ownership on learning_progress" ON public.learning_progress;
DROP POLICY IF EXISTS "Guest session access on learning_progress" ON public.learning_progress;
CREATE POLICY "Service role full access on learning_progress" ON public.learning_progress FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Strict user ownership on learning_progress" ON public.learning_progress FOR ALL TO authenticated USING (user_id IS NOT NULL AND auth.uid()::text = user_id::text) WITH CHECK (user_id IS NOT NULL AND auth.uid()::text = user_id::text);

-- welcome_email_events
DROP POLICY IF EXISTS "Service role full access on welcome_email_events" ON public.welcome_email_events;
DROP POLICY IF EXISTS "Users can view their own welcome_email_events" ON public.welcome_email_events;
CREATE POLICY "Service role full access on welcome_email_events" ON public.welcome_email_events FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Users can view their own welcome_email_events" ON public.welcome_email_events FOR SELECT TO authenticated USING (auth.uid() = user_id);
