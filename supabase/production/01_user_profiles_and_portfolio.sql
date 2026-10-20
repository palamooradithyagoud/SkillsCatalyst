-- ====================================================================
-- MODULE 1: USER PROFILES & PROFESSIONAL PORTFOLIO (10 TABLES)
-- ====================================================================

-- 1. PROFILES (Master User Profile)
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
    role TEXT DEFAULT 'student',
    username TEXT NULL,
    college TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_username_lower
    ON public.profiles (LOWER(TRIM(username)))
    WHERE username IS NOT NULL AND TRIM(username) <> '';


-- 2. USER ACADEMIC PROFILE (College & Target Role)
CREATE TABLE IF NOT EXISTS public.user_academic_profile (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT DEFAULT '',
    college TEXT DEFAULT '',
    department TEXT DEFAULT '',
    academic_year TEXT DEFAULT '',
    target_role TEXT DEFAULT '',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. USER CODING PROFILES (LeetCode, GitHub, etc.)
CREATE TABLE IF NOT EXISTS public.user_coding_profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    leetcode_url TEXT DEFAULT '',
    github_url TEXT DEFAULT '',
    hackerrank_url TEXT DEFAULT '',
    codechef_url TEXT DEFAULT '',
    geeksforgeeks_url TEXT DEFAULT '',
    codeforces_url TEXT DEFAULT '',
    stats_json JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. EDUCATION
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

-- 5. EXPERIENCES (Internships & Work)
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

-- 6. PROJECTS (Portfolio Projects)
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

-- 7. CERTIFICATIONS
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

-- 8. ACHIEVEMENTS
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

-- 9. USER SKILLS
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

-- 10. CAREER PREFERENCES
CREATE TABLE IF NOT EXISTS public.career_preferences (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    target_roles TEXT[] NOT NULL DEFAULT '{}',
    preferred_industries TEXT[] NOT NULL DEFAULT '{}',
    target_companies TEXT[] NOT NULL DEFAULT '{}',
    preferred_locations TEXT[] NOT NULL DEFAULT '{}',
    work_arrangements TEXT[] NOT NULL DEFAULT '{}',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── TRIGGERS ─────────────────────────────────────────────────────────
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT unnest(ARRAY[
            'profiles', 'user_academic_profile', 'user_coding_profiles',
            'user_skills', 'experiences', 'education', 
            'projects', 'certifications', 'achievements', 'career_preferences'
        ])
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS trg_set_updated_at_%I ON public.%I;', t, t);
        EXECUTE format('CREATE TRIGGER trg_set_updated_at_%I BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();', t, t);
    END LOOP;
END;
$$;

-- ── ROW LEVEL SECURITY (RLS) ─────────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_academic_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_coding_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_preferences ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
    tbl text;
    user_col text;
BEGIN
    FOR tbl IN 
        SELECT unnest(ARRAY[
            'profiles', 'user_academic_profile', 'user_coding_profiles',
            'user_skills', 'experiences', 'education', 
            'projects', 'certifications', 'achievements', 'career_preferences'
        ])
    LOOP
        user_col := CASE WHEN tbl = 'profiles' THEN 'id' ELSE 'user_id' END;
        
        EXECUTE format('DROP POLICY IF EXISTS "Service role full access on %I" ON public.%I;', tbl, tbl);
        EXECUTE format('CREATE POLICY "Service role full access on %I" ON public.%I FOR ALL TO service_role USING (true) WITH CHECK (true);', tbl, tbl);
        
        EXECUTE format('DROP POLICY IF EXISTS "Users manage own %I" ON public.%I;', tbl, tbl);
        EXECUTE format('CREATE POLICY "Users manage own %I" ON public.%I FOR ALL TO authenticated USING (auth.uid() = %I) WITH CHECK (auth.uid() = %I);', tbl, tbl, user_col, user_col);
    END LOOP;
END;
$$;

-- ── ROLE ESCALATION HARDENING ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.prevent_profile_role_escalation()
RETURNS TRIGGER AS $$
BEGIN
    IF current_user IN ('service_role', 'postgres', 'supabase_admin') THEN
        RETURN NEW;
    END IF;

    IF COALESCE((auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'owner' THEN
        RETURN NEW;
    END IF;

    IF TG_OP = 'INSERT' THEN
        IF NEW.role IS NOT NULL AND NEW.role <> '' AND NEW.role <> 'student' THEN
            RAISE EXCEPTION 'Unauthorized: Account roles cannot be set to non-student by standard users';
        END IF;
        IF NEW.role IS NULL OR NEW.role = '' THEN
            NEW.role := 'student';
        END IF;
    ELSIF TG_OP = 'UPDATE' THEN
        IF NEW.role IS DISTINCT FROM OLD.role THEN
            RAISE EXCEPTION 'Unauthorized: Account roles cannot be modified by standard users';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_prevent_profile_role_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_profile_role_escalation
    BEFORE INSERT OR UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.prevent_profile_role_escalation();

-- Remove certificate identity lock triggers so users can freely edit full_name and college
DROP TRIGGER IF EXISTS trg_check_profile_identity_lock ON public.profiles;
DROP TRIGGER IF EXISTS trg_check_academic_profile_identity_lock ON public.user_academic_profile;
DROP FUNCTION IF EXISTS public.check_profile_identity_lock();
DROP FUNCTION IF EXISTS public.check_academic_profile_identity_lock();

-- Table permissions and role grants for authenticated users and service role
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_academic_profile TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.education TO authenticated, service_role;

