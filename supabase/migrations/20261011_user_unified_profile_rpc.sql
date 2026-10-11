-- ==============================================================================
-- Migration: 20261011_user_unified_profile_rpc.sql
-- Purpose:   Consolidate 12 individual profile queries into a single database RPC call.
--            Preserves strict tenant isolation and exact canonical JSON response contract.
-- ==============================================================================

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

-- Revoke default public execution and grant strictly to authenticated and service_role
REVOKE EXECUTE ON FUNCTION public.get_user_unified_profile(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_user_unified_profile(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_unified_profile(UUID) TO service_role;
