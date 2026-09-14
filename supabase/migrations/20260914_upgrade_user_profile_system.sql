-- ====================================================================
-- SKILLSCATALYST - USER PROFILE SYSTEM UPGRADE MIGRATION
-- ====================================================================
-- 1. Upgrades public.profiles with normalized personal details.
-- 2. Creates relational tables: user_skills, experiences, education,
--    projects, certifications, achievements, career_preferences.
-- 3. Sets up RLS policies (strict tenant isolation for authenticated,
--    service_role full access, anon SELECT for 42501 prevention).
-- 4. Creates sync trigger to maintain user_academic_profile.full_name
--    for 100% backward compatibility with dashboard.py.
-- 5. Updates handle_new_user() trigger function on auth.users.
-- 6. Seeds existing data from user_academic_profile into new tables.
-- ====================================================================

-- ── 1. Ensure Table Structure for public.profiles ────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT DEFAULT '',
    full_name TEXT NOT NULL DEFAULT '',
    headline TEXT DEFAULT '',
    avatar_url TEXT DEFAULT '',
    country TEXT DEFAULT '',
    state TEXT DEFAULT '',
    city TEXT DEFAULT '',
    phone TEXT DEFAULT '',
    gender TEXT DEFAULT '',
    about TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ensure all personal fields exist in case profiles table was pre-existing
ALTER TABLE public.profiles
    ALTER COLUMN email DROP NOT NULL,
    ALTER COLUMN email SET DEFAULT '',
    ADD COLUMN IF NOT EXISTS headline TEXT DEFAULT '',
    ADD COLUMN IF NOT EXISTS country TEXT DEFAULT '',
    ADD COLUMN IF NOT EXISTS state TEXT DEFAULT '',
    ADD COLUMN IF NOT EXISTS city TEXT DEFAULT '',
    ADD COLUMN IF NOT EXISTS phone TEXT DEFAULT '',
    ADD COLUMN IF NOT EXISTS gender TEXT DEFAULT '',
    ADD COLUMN IF NOT EXISTS about TEXT DEFAULT '',
    ADD COLUMN IF NOT EXISTS avatar_url TEXT DEFAULT '';

-- ── 2. Table: public.user_skills ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    skill_name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Programming',
    proficiency TEXT NOT NULL DEFAULT 'Intermediate',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_user_skills_user_skill UNIQUE (user_id, skill_name)
);

CREATE INDEX IF NOT EXISTS idx_user_skills_user_id ON public.user_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_user_skills_category ON public.user_skills(user_id, category);

-- ── 3. Table: public.experiences ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.experiences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    role TEXT NOT NULL,
    location TEXT DEFAULT '',
    work_type TEXT NOT NULL DEFAULT 'Remote',
    employment_type TEXT NOT NULL DEFAULT 'Full-time',
    start_date DATE NOT NULL,
    end_date DATE,
    currently_working BOOLEAN NOT NULL DEFAULT false,
    description TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_experiences_user_date ON public.experiences(user_id, start_date DESC);

-- ── 4. Table: public.education ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.education (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    college TEXT NOT NULL,
    degree_type TEXT DEFAULT '',
    field_of_study TEXT DEFAULT '',
    gpa TEXT DEFAULT '',
    start_date DATE,
    end_date DATE,
    currently_studying BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_education_user_date ON public.education(user_id, start_date DESC);

-- ── 5. Table: public.projects ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_name TEXT NOT NULL,
    description TEXT DEFAULT '',
    technologies TEXT[] NOT NULL DEFAULT '{}',
    start_date DATE,
    end_date DATE,
    github_url TEXT DEFAULT '',
    live_demo_url TEXT DEFAULT '',
    currently_working BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_projects_user_created ON public.projects(user_id, created_at DESC);

-- ── 6. Table: public.certifications ──────────────────────────────────
CREATE TABLE IF NOT EXISTS public.certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    certification_name TEXT NOT NULL,
    issuing_organization TEXT NOT NULL,
    issue_date DATE,
    expiration_date DATE,
    credential_id TEXT DEFAULT '',
    credential_url TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_certifications_user_date ON public.certifications(user_id, issue_date DESC);

-- ── 7. Table: public.achievements ────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    achievement_name TEXT NOT NULL,
    organization TEXT DEFAULT '',
    achievement_date DATE,
    description TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_achievements_user_date ON public.achievements(user_id, achievement_date DESC);

-- ── 8. Table: public.career_preferences ──────────────────────────────
CREATE TABLE IF NOT EXISTS public.career_preferences (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    target_roles TEXT[] NOT NULL DEFAULT '{}',
    preferred_industries TEXT[] NOT NULL DEFAULT '{}',
    target_companies TEXT[] NOT NULL DEFAULT '{}',
    preferred_locations TEXT[] NOT NULL DEFAULT '{}',
    work_arrangements TEXT[] NOT NULL DEFAULT '{}',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ensure array columns exist in case career_preferences pre-existed with scalar fields
ALTER TABLE public.career_preferences
    ADD COLUMN IF NOT EXISTS target_roles TEXT[] NOT NULL DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS preferred_industries TEXT[] NOT NULL DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS target_companies TEXT[] NOT NULL DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS preferred_locations TEXT[] NOT NULL DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS work_arrangements TEXT[] NOT NULL DEFAULT '{}';


-- ── 9. Updated At Trigger Application ────────────────────────────────
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT unnest(ARRAY[
            'profiles', 'user_skills', 'experiences', 'education', 
            'projects', 'certifications', 'achievements', 'career_preferences'
        ])
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS trg_set_updated_at_%I ON public.%I;', t, t);
        EXECUTE format('CREATE TRIGGER trg_set_updated_at_%I BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION set_updated_at();', t, t);
    END LOOP;
END;
$$;

-- ── 10. Backward-Compatibility Sync Trigger for user_academic_profile ──
CREATE OR REPLACE FUNCTION public.sync_profile_to_academic()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.full_name IS NOT NULL AND NEW.full_name <> '' THEN
        INSERT INTO public.user_academic_profile (user_id, full_name, updated_at)
        VALUES (NEW.id, NEW.full_name, NOW())
        ON CONFLICT (user_id) DO UPDATE SET
            full_name = EXCLUDED.full_name,
            updated_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_sync_profile_to_academic ON public.profiles;
CREATE TRIGGER trg_sync_profile_to_academic
AFTER INSERT OR UPDATE OF full_name ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.sync_profile_to_academic();

-- ── 11. Updated Trigger: handle_new_user() on auth.users ─────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    v_name text;
BEGIN
    v_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1));

    -- 1. Insert into profiles
    INSERT INTO public.profiles (id, email, full_name, updated_at)
    VALUES (NEW.id, COALESCE(NEW.email, ''), v_name, NOW())
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

-- ── 12. Migrate Existing User Data from user_academic_profile ─────────
-- 1. Copy full_name into profiles
INSERT INTO public.profiles (id, email, full_name, updated_at)
SELECT p.user_id, COALESCE(u.email, ''), p.full_name, p.updated_at
FROM public.user_academic_profile p
LEFT JOIN auth.users u ON u.id = p.user_id
WHERE p.full_name IS NOT NULL AND p.full_name <> ''
ON CONFLICT (id) DO UPDATE SET
    full_name = CASE WHEN profiles.full_name IS NULL OR profiles.full_name = '' THEN EXCLUDED.full_name ELSE profiles.full_name END;

-- 2. Seed education from college & department
INSERT INTO public.education (user_id, college, field_of_study, degree_type, currently_studying, created_at, updated_at)
SELECT 
    user_id,
    college,
    COALESCE(department, ''),
    COALESCE(academic_year, ''),
    TRUE,
    NOW(),
    NOW()
FROM public.user_academic_profile
WHERE college IS NOT NULL AND college <> ''
  AND NOT EXISTS (
      SELECT 1 FROM public.education e WHERE e.user_id = user_academic_profile.user_id AND e.college = user_academic_profile.college
  );

-- 3. Seed career_preferences from target_role
INSERT INTO public.career_preferences (user_id, target_roles, updated_at)
SELECT user_id, ARRAY[target_role], updated_at
FROM public.user_academic_profile
WHERE target_role IS NOT NULL AND target_role <> ''
ON CONFLICT (user_id) DO UPDATE SET
    target_roles = CASE WHEN career_preferences.target_roles = '{}' THEN EXCLUDED.target_roles ELSE career_preferences.target_roles END;

-- ── 13. Enable Row Level Security (RLS) ──────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_preferences ENABLE ROW LEVEL SECURITY;

-- ── 14. RLS Policies: Strict User Isolation ──────────────────────────

-- profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Strict user ownership on profiles" ON public.profiles;
CREATE POLICY "Strict user ownership on profiles"
    ON public.profiles FOR ALL TO authenticated
    USING (id IS NOT NULL AND auth.uid() = id)
    WITH CHECK (id IS NOT NULL AND auth.uid() = id);


DROP POLICY IF EXISTS "Service role access on profiles" ON public.profiles;
CREATE POLICY "Service role access on profiles"
    ON public.profiles FOR ALL TO service_role
    USING (true) WITH CHECK (true);

-- user_skills
DROP POLICY IF EXISTS "Strict user ownership on user_skills" ON public.user_skills;
CREATE POLICY "Strict user ownership on user_skills"
    ON public.user_skills FOR ALL TO authenticated
    USING (user_id IS NOT NULL AND auth.uid() = user_id)
    WITH CHECK (user_id IS NOT NULL AND auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role access on user_skills" ON public.user_skills;
CREATE POLICY "Service role access on user_skills"
    ON public.user_skills FOR ALL TO service_role
    USING (true) WITH CHECK (true);

-- experiences
DROP POLICY IF EXISTS "Strict user ownership on experiences" ON public.experiences;
CREATE POLICY "Strict user ownership on experiences"
    ON public.experiences FOR ALL TO authenticated
    USING (user_id IS NOT NULL AND auth.uid() = user_id)
    WITH CHECK (user_id IS NOT NULL AND auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role access on experiences" ON public.experiences;
CREATE POLICY "Service role access on experiences"
    ON public.experiences FOR ALL TO service_role
    USING (true) WITH CHECK (true);

-- education
DROP POLICY IF EXISTS "Strict user ownership on education" ON public.education;
CREATE POLICY "Strict user ownership on education"
    ON public.education FOR ALL TO authenticated
    USING (user_id IS NOT NULL AND auth.uid() = user_id)
    WITH CHECK (user_id IS NOT NULL AND auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role access on education" ON public.education;
CREATE POLICY "Service role access on education"
    ON public.education FOR ALL TO service_role
    USING (true) WITH CHECK (true);

-- projects
DROP POLICY IF EXISTS "Strict user ownership on projects" ON public.projects;
CREATE POLICY "Strict user ownership on projects"
    ON public.projects FOR ALL TO authenticated
    USING (user_id IS NOT NULL AND auth.uid() = user_id)
    WITH CHECK (user_id IS NOT NULL AND auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role access on projects" ON public.projects;
CREATE POLICY "Service role access on projects"
    ON public.projects FOR ALL TO service_role
    USING (true) WITH CHECK (true);

-- certifications
DROP POLICY IF EXISTS "Strict user ownership on certifications" ON public.certifications;
CREATE POLICY "Strict user ownership on certifications"
    ON public.certifications FOR ALL TO authenticated
    USING (user_id IS NOT NULL AND auth.uid() = user_id)
    WITH CHECK (user_id IS NOT NULL AND auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role access on certifications" ON public.certifications;
CREATE POLICY "Service role access on certifications"
    ON public.certifications FOR ALL TO service_role
    USING (true) WITH CHECK (true);

-- achievements
DROP POLICY IF EXISTS "Strict user ownership on achievements" ON public.achievements;
CREATE POLICY "Strict user ownership on achievements"
    ON public.achievements FOR ALL TO authenticated
    USING (user_id IS NOT NULL AND auth.uid() = user_id)
    WITH CHECK (user_id IS NOT NULL AND auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role access on achievements" ON public.achievements;
CREATE POLICY "Service role access on achievements"
    ON public.achievements FOR ALL TO service_role
    USING (true) WITH CHECK (true);

-- career_preferences
DROP POLICY IF EXISTS "Strict user ownership on career_preferences" ON public.career_preferences;
CREATE POLICY "Strict user ownership on career_preferences"
    ON public.career_preferences FOR ALL TO authenticated
    USING (user_id IS NOT NULL AND auth.uid() = user_id)
    WITH CHECK (user_id IS NOT NULL AND auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role access on career_preferences" ON public.career_preferences;
CREATE POLICY "Service role access on career_preferences"
    ON public.career_preferences FOR ALL TO service_role
    USING (true) WITH CHECK (true);

-- ── 15. Permissions & Grants (PostgreSQL 42501 DAC Protection) ────────
REVOKE ALL ON public.user_skills FROM anon;
REVOKE ALL ON public.experiences FROM anon;
REVOKE ALL ON public.education FROM anon;
REVOKE ALL ON public.projects FROM anon;
REVOKE ALL ON public.certifications FROM anon;
REVOKE ALL ON public.achievements FROM anon;
REVOKE ALL ON public.career_preferences FROM anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_skills TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.experiences TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.education TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.certifications TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.achievements TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.career_preferences TO authenticated, service_role;

