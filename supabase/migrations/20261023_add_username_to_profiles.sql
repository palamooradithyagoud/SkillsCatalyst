-- ====================================================================
-- SKILLSCATALYST DATABASE MIGRATION
-- Migration Name: 20261023_add_username_to_profiles.sql
-- Description: Adds case-insensitive unique username column to public.profiles.
--              Maintains 100% backward compatibility for existing users and
--              Google OAuth accounts (nullable). Enforces format and uniqueness.
-- ====================================================================

-- ── 1. ADD USERNAME COLUMN TO PROFILES TABLE ─────────────────────────
ALTER TABLE public.profiles 
    ADD COLUMN IF NOT EXISTS username TEXT NULL;

ALTER TABLE public.profiles 
    ADD COLUMN IF NOT EXISTS college TEXT DEFAULT '';

-- ── 2. CASE-INSENSITIVE UNIQUE INDEX ─────────────────────────────────
-- Partial index: only non-null, non-empty usernames must be unique.
-- Allows existing accounts and Google OAuth signups to have NULL usernames without conflict.
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_username_lower 
    ON public.profiles (LOWER(TRIM(username))) 
    WHERE username IS NOT NULL AND TRIM(username) <> '';

-- ── 3. USERNAME FORMAT CHECK CONSTRAINT ──────────────────────────────
-- Enforces: 3–30 chars, ASCII letters, numbers, and underscores only.
ALTER TABLE public.profiles 
    DROP CONSTRAINT IF EXISTS chk_profiles_username_format;

ALTER TABLE public.profiles 
    ADD CONSTRAINT chk_profiles_username_format 
    CHECK (
        username IS NULL 
        OR TRIM(username) = '' 
        OR (
            LENGTH(TRIM(username)) >= 3 
            AND LENGTH(TRIM(username)) <= 30 
            AND TRIM(username) ~ '^[a-zA-Z0-9_]{3,30}$'
        )
    );

-- ── 4. UPDATE handle_new_user() TRIGGER FUNCTION ────────────────────
-- Captures 'username' from auth.users raw_user_meta_data if supplied during registration.
-- Google users have no username in metadata, so username safely defaults to NULL.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    v_name text;
    v_username text := NULL;
    v_role text := 'student';
BEGIN
    v_name := COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'name',
        split_part(NEW.email, '@', 1)
    );

    -- Extract username from signup metadata if present
    IF NEW.raw_user_meta_data->>'username' IS NOT NULL AND TRIM(NEW.raw_user_meta_data->>'username') <> '' THEN
        v_username := TRIM(NEW.raw_user_meta_data->>'username');
    END IF;

    -- If auth.users.raw_app_meta_data already contains a privileged role, respect it
    IF NEW.raw_app_meta_data->>'role' IS NOT NULL THEN
        v_role := NEW.raw_app_meta_data->>'role';
    END IF;

    -- 1. Insert into profiles with authoritative role & optional username
    INSERT INTO public.profiles (id, email, full_name, username, role, updated_at)
    VALUES (NEW.id, COALESCE(NEW.email, ''), v_name, v_username, v_role, NOW())
    ON CONFLICT (id) DO UPDATE SET
        full_name = CASE 
            WHEN profiles.full_name IS NULL OR profiles.full_name = '' THEN EXCLUDED.full_name 
            ELSE profiles.full_name 
        END,
        username = CASE 
            WHEN profiles.username IS NULL OR profiles.username = '' THEN EXCLUDED.username 
            ELSE profiles.username 
        END,
        updated_at = NOW();

    -- 2. Insert into user_academic_profile (backward compatibility)
    INSERT INTO public.user_academic_profile (user_id, full_name, updated_at)
    VALUES (NEW.id, v_name, NOW())
    ON CONFLICT (user_id) DO UPDATE SET
        full_name = CASE 
            WHEN user_academic_profile.full_name IS NULL OR user_academic_profile.full_name = '' THEN EXCLUDED.full_name 
            ELSE user_academic_profile.full_name 
        END,
        updated_at = NOW();

    -- 3. Insert into user_progress
    INSERT INTO public.user_progress (user_id, updated_at)
    VALUES (NEW.id, NOW())
    ON CONFLICT (user_id) DO NOTHING;

    -- 4. Insert into user_coding_profiles
    INSERT INTO public.user_coding_profiles (user_id, updated_at)
    VALUES (NEW.id, NOW())
    ON CONFLICT (user_id) DO NOTHING;

    -- 5. Insert into career_preferences
    INSERT INTO public.career_preferences (user_id, updated_at)
    VALUES (NEW.id, NOW())
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
END;
$function$;

-- ── 5. UPDATE UNIFIED PROFILE RPC (get_user_unified_profile) ────────
-- Ensures 'username' is included in personal profile JSON object.
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
                SELECT id, full_name, username, college, headline, avatar_url, country, state, city, phone, gender, about
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

-- ── 6. REMOVE CERTIFICATION IDENTITY LOCK TRIGGERS ───────────────────
-- Allows users to freely update full_name and college in public.profiles
-- and public.user_academic_profile without certificate lock restrictions.
DROP TRIGGER IF EXISTS trg_check_profile_identity_lock ON public.profiles;
DROP TRIGGER IF EXISTS trg_check_academic_profile_identity_lock ON public.user_academic_profile;
DROP FUNCTION IF EXISTS public.check_profile_identity_lock();
DROP FUNCTION IF EXISTS public.check_academic_profile_identity_lock();

