-- ====================================================================
-- SKILLSCATALYST - FULL DATABASE RESET SCRIPT (DESTRUCTIVE CLEANUP)
-- ====================================================================
-- AUTHORIZATION GRANTED: Drops all application tables, policies, triggers,
-- and functions in strict dependency order for a complete clean rebuild.
--
-- HARD BOUNDARY RESPECTED:
-- - NEVER touches auth.* schema structure or internal system tables
-- - NEVER touches storage.* system tables
-- - NEVER touches platform extensions
-- ====================================================================

BEGIN;

-- 1. Drop application triggers on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. Drop custom application RPC functions & triggers
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.upsert_leetcode_solve(TEXT, INT, TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.upsert_leetcode_solve(UUID, TEXT, INT, TEXT, TEXT) CASCADE;

-- 3. Drop all application tables in strict dependency order (CASCADE removes dependent RLS policies)
DROP TABLE IF EXISTS public.video_progress CASCADE;
DROP TABLE IF EXISTS public.saved_playlists CASCADE;
DROP TABLE IF EXISTS public.resume_scores CASCADE;
DROP TABLE IF EXISTS public.roadmap_progress CASCADE;
DROP TABLE IF EXISTS public.leetcode_progress CASCADE;
DROP TABLE IF EXISTS public.user_progress CASCADE;
DROP TABLE IF EXISTS public.user_coding_profiles CASCADE;
DROP TABLE IF EXISTS public.user_academic_profile CASCADE;

COMMIT;
