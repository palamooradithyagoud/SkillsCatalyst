-- ====================================================================
-- SKILLSCATALYST: UNIFIED AUTHENTICATION & ROLE-BASED ACCESS CONTROL
-- Migration: 20260920_add_user_roles_and_owner.sql
-- ====================================================================
-- 1. Adds 'role' column to public.profiles with default 'student'.
-- 2. Enforces valid roles: 'owner', 'student' (and future 'admin', 'editor', 'moderator').
-- 3. Attaches trigger to prevent normal users from modifying their role.
-- 4. Updates handle_new_user() trigger to initialize new accounts with role = 'student'.
-- 5. Designates palamooradithyagoud@gmail.com as 'owner'.
-- ====================================================================

-- ── 1. Add role column to public.profiles ────────────────────────────
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'student';

-- ── 2. Add Role Constraint ───────────────────────────────────────────
ALTER TABLE public.profiles
    DROP CONSTRAINT IF EXISTS chk_profiles_role;

ALTER TABLE public.profiles
    ADD CONSTRAINT chk_profiles_role 
    CHECK (role IN ('owner', 'student', 'admin', 'editor', 'moderator'));

-- ── 3. Seed Existing Profiles ────────────────────────────────────────
UPDATE public.profiles
SET role = 'owner', updated_at = NOW()
WHERE email = 'palamooradithyagoud@gmail.com';

UPDATE public.profiles
SET role = 'student'
WHERE (role IS NULL OR role = '') AND email <> 'palamooradithyagoud@gmail.com';

-- ── 4. Role Escalation Prevention Trigger ─────────────────────────────
-- Ensures authenticated users cannot modify the 'role' column via direct API or Supabase client
CREATE OR REPLACE FUNCTION public.prevent_profile_role_escalation()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.role IS DISTINCT FROM OLD.role THEN
        -- Allow administrative roles: service_role, postgres (SQL editor), supabase_admin
        IF current_user NOT IN ('service_role', 'postgres', 'supabase_admin') THEN
            -- For standard web clients (authenticated/anon), ensure user possesses owner claim in JWT app_metadata
            IF COALESCE((auth.jwt() -> 'app_metadata' ->> 'role'), '') <> 'owner' THEN
                RAISE EXCEPTION 'Unauthorized: Account roles cannot be modified by standard users';
            END IF;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_prevent_profile_role_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_profile_role_escalation
    BEFORE UPDATE OF role ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.prevent_profile_role_escalation();

-- ── 5. Update handle_new_user() Trigger on auth.users ────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    v_name text;
    v_role text := 'student';
BEGIN
    v_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1));

    -- If auth.users.raw_app_meta_data already contains a privileged role, respect it
    IF NEW.raw_app_meta_data->>'role' IS NOT NULL THEN
        v_role := NEW.raw_app_meta_data->>'role';
    END IF;

    -- 1. Insert into profiles with authoritative role
    INSERT INTO public.profiles (id, email, full_name, role, updated_at)
    VALUES (NEW.id, COALESCE(NEW.email, ''), v_name, v_role, NOW())
    ON CONFLICT (id) DO UPDATE SET
        full_name = CASE WHEN profiles.full_name IS NULL OR profiles.full_name = '' THEN EXCLUDED.full_name ELSE profiles.full_name END,
        updated_at = NOW();

    -- 2. Insert into user_academic_profile (backward compatibility)
    INSERT INTO public.user_academic_profile (user_id, full_name, updated_at)
    VALUES (NEW.id, v_name, NOW())
    ON CONFLICT (user_id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
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
