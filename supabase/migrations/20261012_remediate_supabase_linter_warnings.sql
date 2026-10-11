-- ==============================================================================
-- Migration: 20261012_remediate_supabase_linter_warnings.sql
-- Purpose:   Remediates all warnings flagged by the Supabase Database Linter:
--            1. function_search_path_mutable (pins search_path = public, pg_temp)
--            2. anon_security_definer_function_executable (revokes RPC access / converts to INVOKER)
--            3. authenticated_security_definer_function_executable (converts to INVOKER where appropriate)
--            4. rls_enabled_no_policy (adds service_role policy to migration backup table)
-- ==============================================================================

-- ── 1. HARDEN TRIGGER FUNCTIONS (Search Path & RPC Access) ────────────────────
-- Trigger functions must NOT be callable directly via PostgREST RPC.
-- Pinned search_path prevents search_path hijacking (CWE-426).

-- 1.1 prevent_profile_role_escalation
ALTER FUNCTION public.prevent_profile_role_escalation()
    SET search_path = public, pg_temp;

REVOKE ALL ON FUNCTION public.prevent_profile_role_escalation()
    FROM PUBLIC, anon, authenticated;

-- 1.2 protect_user_progress_privileged_fields
ALTER FUNCTION public.protect_user_progress_privileged_fields()
    SET search_path = public, pg_temp;

REVOKE ALL ON FUNCTION public.protect_user_progress_privileged_fields()
    FROM PUBLIC, anon, authenticated;

-- 1.3 enforce_certificate_immutability
ALTER FUNCTION public.enforce_certificate_immutability()
    SET search_path = public, pg_temp;

REVOKE ALL ON FUNCTION public.enforce_certificate_immutability()
    FROM PUBLIC, anon, authenticated;


-- ── 2. HARDEN get_user_unified_profile (Profile RPC) ─────────────────────────
-- Convert from SECURITY DEFINER to SECURITY INVOKER.
-- Since authenticated users already have RLS SELECT access to their own data
-- across all 12 tables, SECURITY INVOKER maintains full functionality while
-- eliminating privilege escalation risks and satisfying Supabase linter 0028/0029.

CREATE OR REPLACE FUNCTION public.get_user_unified_profile(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_result JSONB;
BEGIN
    -- Strict Tenant Authorization: Caller must own the profile or possess administrative role
    IF auth.uid() IS NOT NULL AND auth.uid() <> p_user_id THEN
        IF COALESCE((auth.jwt() -> 'app_metadata' ->> 'role'), '') NOT IN ('owner', 'admin') THEN
            RAISE EXCEPTION 'Unauthorized profile access' USING ERRCODE = '42501';
        END IF;
    END IF;

    SELECT jsonb_build_object(
        'personal', (
            SELECT to_jsonb(p)
            FROM (
                SELECT id, full_name, headline, avatar_url, country, state, city, phone, gender, about
                FROM public.profiles
                WHERE id = p_user_id
            ) p
        ),
        'academic', (
            SELECT to_jsonb(a)
            FROM (
                SELECT user_id, full_name, college, department, academic_year, target_role
                FROM public.user_academic_profile
                WHERE user_id = p_user_id
            ) a
        ),
        'coding', (
            SELECT to_jsonb(c)
            FROM (
                SELECT leetcode_url, github_url, hackerrank_url, codechef_url, geeksforgeeks_url, codeforces_url, stats_json
                FROM public.user_coding_profiles
                WHERE user_id = p_user_id
            ) c
        ),
        'skills', COALESCE((
            SELECT jsonb_agg(to_jsonb(s))
            FROM (
                SELECT * FROM public.user_skills
                WHERE user_id = p_user_id
                ORDER BY created_at ASC
            ) s
        ), '[]'::jsonb),
        'experiences', COALESCE((
            SELECT jsonb_agg(to_jsonb(e))
            FROM (
                SELECT * FROM public.experiences
                WHERE user_id = p_user_id
                ORDER BY start_date DESC
            ) e
        ), '[]'::jsonb),
        'education', COALESCE((
            SELECT jsonb_agg(to_jsonb(ed))
            FROM (
                SELECT * FROM public.education
                WHERE user_id = p_user_id
                ORDER BY start_date DESC
            ) ed
        ), '[]'::jsonb),
        'projects', COALESCE((
            SELECT jsonb_agg(to_jsonb(pr))
            FROM (
                SELECT * FROM public.projects
                WHERE user_id = p_user_id
                ORDER BY created_at DESC
            ) pr
        ), '[]'::jsonb),
        'certifications', COALESCE((
            SELECT jsonb_agg(to_jsonb(cr))
            FROM (
                SELECT * FROM public.certifications
                WHERE user_id = p_user_id
                ORDER BY issue_date DESC
            ) cr
        ), '[]'::jsonb),
        'achievements', COALESCE((
            SELECT jsonb_agg(to_jsonb(ac))
            FROM (
                SELECT * FROM public.achievements
                WHERE user_id = p_user_id
                ORDER BY achievement_date DESC
            ) ac
        ), '[]'::jsonb),
        'career_preferences', (
            SELECT to_jsonb(cp)
            FROM (
                SELECT * FROM public.career_preferences
                WHERE user_id = p_user_id
            ) cp
        ),
        'resume', (
            SELECT to_jsonb(rs)
            FROM (
                SELECT * FROM public.resume_scores
                WHERE user_id = p_user_id
                ORDER BY created_at DESC
                LIMIT 1
            ) rs
        ),
        'progress', (
            SELECT to_jsonb(up)
            FROM (
                SELECT * FROM public.user_progress
                WHERE user_id = p_user_id
            ) up
        )
    ) INTO v_result;

    RETURN v_result;
END;
$$;

-- Revoke default public execution; allow only authenticated students and service role
REVOKE ALL ON FUNCTION public.get_user_unified_profile(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_user_unified_profile(UUID) TO authenticated, service_role;


-- ── 3. HARDEN verify_certificate_public (Public Certificate Verification) ─────
-- Provide an explicit RLS policy on certificates for issued certificate verification,
-- allowing verify_certificate_public to execute securely as SECURITY INVOKER.

DROP POLICY IF EXISTS "Public verification of issued certificates" ON public.certificates;
CREATE POLICY "Public verification of issued certificates"
    ON public.certificates
    FOR SELECT
    TO anon, authenticated
    USING (status = 'issued');

CREATE OR REPLACE FUNCTION public.verify_certificate_public(p_verification_id TEXT)
RETURNS TABLE (
    is_valid BOOLEAN,
    certificate_number TEXT,
    verification_id TEXT,
    student_name TEXT,
    college_name TEXT,
    course_title TEXT,
    score INTEGER,
    issued_at TIMESTAMPTZ,
    status TEXT,
    certificate_background TEXT,
    design_theme TEXT
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
BEGIN
    RETURN QUERY
    SELECT
        (c.status = 'issued') AS is_valid,
        c.certificate_number,
        c.verification_id,
        c.student_name_snapshot AS student_name,
        c.college_name_snapshot AS college_name,
        c.course_title_snapshot AS course_title,
        c.score_snapshot AS score,
        c.issued_at,
        c.status,
        c.certificate_background_snapshot AS certificate_background,
        c.design_theme_snapshot AS design_theme
    FROM public.certificates c
    WHERE c.verification_id = p_verification_id
    LIMIT 1;
END;
$$;

-- Allow public verification access
GRANT EXECUTE ON FUNCTION public.verify_certificate_public(TEXT) TO anon, authenticated, service_role;


-- ── 4. HARDEN submit_question_attempt (Pin search_path) ──────────────────────
-- submit_question_attempt is an intentional server-authoritative evaluation RPC.
-- It requires SECURITY DEFINER to prevent students from directly querying answer keys.
-- We ensure its search_path is strictly pinned to public, pg_temp.

ALTER FUNCTION public.submit_question_attempt(UUID, UUID, INT)
    SET search_path = public, pg_temp;


-- ── 5. RESOLVE rls_enabled_no_policy on _migration_20261012_fk_backup ────────
-- If this temporary backup table exists from a previous migration, assign an
-- explicit service_role policy to prevent lint 0008, or drop it if verified.

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = '_migration_20261012_fk_backup'
    ) THEN
        DROP POLICY IF EXISTS "Service role access on fk_backup" ON public._migration_20261012_fk_backup;
        CREATE POLICY "Service role access on fk_backup"
            ON public._migration_20261012_fk_backup
            FOR ALL
            TO service_role
            USING (true)
            WITH CHECK (true);
    END IF;
END;
$$;
