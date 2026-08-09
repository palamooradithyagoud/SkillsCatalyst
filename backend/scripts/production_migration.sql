-- ====================================================================
-- SKILLSCATALYST - NON-DESTRUCTIVE PRODUCTION SQL MIGRATION SCRIPT
-- ====================================================================
-- SAFE TO RUN AGAINST AN EXISTING PRODUCTION DATABASE.
-- - ZERO DROP TABLE statements
-- - ZERO TRUNCATE statements
-- - Transaction-wrapped (atomic COMMIT / ROLLBACK)
-- - Preserves all legitimate UUID-owned user data
-- - Converts user_id columns to UUID with FK to auth.users(id) ON DELETE CASCADE
-- - Enforces strict RLS ownership (auth.uid() = user_id)
-- - Secures RPC functions deriving identity internally from auth.uid()
-- ====================================================================

BEGIN;

-- -------------------------------------------------------------A------
-- 1. ENABLE REQUIRED EXTENSIONS
-- --------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- --------------------------------------------------------------------
-- 2. CREATE TABLES IF THEY DO NOT ALREADY EXIST (NON-DESTRUCTIVE)
-- --------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.user_academic_profile (
    user_id TEXT PRIMARY KEY,
    full_name TEXT DEFAULT '',
    college TEXT DEFAULT '',
    department TEXT DEFAULT '',
    academic_year TEXT DEFAULT '',
    target_role TEXT DEFAULT '',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_coding_profiles (
    user_id TEXT PRIMARY KEY,
    leetcode_url TEXT DEFAULT '',
    github_url TEXT DEFAULT '',
    hackerrank_url TEXT DEFAULT '',
    codechef_url TEXT DEFAULT '',
    geeksforgeeks_url TEXT DEFAULT '',
    codeforces_url TEXT DEFAULT '',
    stats_json JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_progress (
    user_id TEXT PRIMARY KEY,
    problems_solved INTEGER NOT NULL DEFAULT 0,
    success_rate NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    streak_days INTEGER NOT NULL DEFAULT 0,
    learning_progress_percent NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    resume_readiness_score NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    ai_career_health_score NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.leetcode_progress (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    company_slug TEXT NOT NULL,
    question_id INTEGER NOT NULL,
    question_title TEXT NOT NULL,
    difficulty TEXT DEFAULT 'Easy',
    acceptance TEXT,
    frequency TEXT,
    status TEXT NOT NULL DEFAULT 'solved',
    solved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_company_question UNIQUE(user_id, company_slug, question_id)
);

CREATE TABLE IF NOT EXISTS public.roadmap_progress (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    roadmap_id TEXT NOT NULL,
    node_id TEXT NOT NULL,
    node_title TEXT NOT NULL,
    category TEXT,
    status TEXT NOT NULL DEFAULT 'completed',
    completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_roadmap_node UNIQUE(user_id, roadmap_id, node_id)
);

CREATE TABLE IF NOT EXISTS public.resume_scores (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    filename TEXT NOT NULL,
    target_role TEXT NOT NULL,
    company_type TEXT DEFAULT 'Product-Based',
    overall_score NUMERIC(5, 2) NOT NULL,
    ats_compatibility_score NUMERIC(5, 2),
    skills_match_score NUMERIC(5, 2),
    experience_score NUMERIC(5, 2),
    strengths JSONB DEFAULT '[]'::jsonb,
    improvements JSONB DEFAULT '[]'::jsonb,
    full_review_json JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.saved_playlists (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    playlist_id TEXT NOT NULL,
    title TEXT NOT NULL,
    channel TEXT,
    description TEXT,
    level TEXT,
    video_count TEXT,
    duration TEXT,
    playlist_url TEXT,
    thumbnail TEXT,
    source TEXT DEFAULT 'youtube',
    skill_query TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_playlist UNIQUE(playlist_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.video_progress (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    playlist_id TEXT NOT NULL,
    video_id TEXT NOT NULL,
    watched BOOLEAN DEFAULT FALSE,
    last_position INTEGER DEFAULT 0,
    watch_time INTEGER DEFAULT 0,
    completed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_playlist_video UNIQUE(user_id, playlist_id, video_id)
);

-- --------------------------------------------------------------------
-- 3. SAFE DATA CLEANUP (PURGE ONLY STALE DEFAULTS / INVALID STRINGS)
-- PRESERVES ALL LEGITIMATE SUPABASE UUID ROWS
-- --------------------------------------------------------------------

DELETE FROM public.user_academic_profile WHERE user_id IS NULL OR user_id::text = 'default_user' OR user_id::text !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
DELETE FROM public.user_coding_profiles WHERE user_id IS NULL OR user_id::text = 'default_user' OR user_id::text !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
DELETE FROM public.user_progress WHERE user_id IS NULL OR user_id::text = 'default_user' OR user_id::text !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
DELETE FROM public.leetcode_progress WHERE user_id IS NULL OR user_id::text = 'default_user' OR user_id::text !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
DELETE FROM public.roadmap_progress WHERE user_id IS NULL OR user_id::text = 'default_user' OR user_id::text !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
DELETE FROM public.resume_scores WHERE user_id IS NULL OR user_id::text = 'default_user' OR user_id::text !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
DELETE FROM public.saved_playlists WHERE user_id IS NULL OR user_id::text = 'default_user' OR user_id::text !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
DELETE FROM public.video_progress WHERE user_id IS NULL OR user_id::text = 'default_user' OR user_id::text !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

-- --------------------------------------------------------------------
-- 4. CONVERT USER_ID COLUMNS TO UUID & ADD FOREIGN KEY CONSTRAINTS
-- --------------------------------------------------------------------

DO $$
BEGIN
    -- user_academic_profile
    ALTER TABLE public.user_academic_profile ALTER COLUMN user_id DROP DEFAULT;
    ALTER TABLE public.user_academic_profile ALTER COLUMN user_id TYPE UUID USING user_id::UUID;
    ALTER TABLE public.user_academic_profile ALTER COLUMN user_id SET NOT NULL;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_academic_user') THEN
        ALTER TABLE public.user_academic_profile ADD CONSTRAINT fk_academic_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;

    -- user_coding_profiles
    ALTER TABLE public.user_coding_profiles ALTER COLUMN user_id DROP DEFAULT;
    ALTER TABLE public.user_coding_profiles ALTER COLUMN user_id TYPE UUID USING user_id::UUID;
    ALTER TABLE public.user_coding_profiles ALTER COLUMN user_id SET NOT NULL;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_coding_user') THEN
        ALTER TABLE public.user_coding_profiles ADD CONSTRAINT fk_coding_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;

    -- user_progress
    ALTER TABLE public.user_progress ALTER COLUMN user_id DROP DEFAULT;
    ALTER TABLE public.user_progress ALTER COLUMN user_id TYPE UUID USING user_id::UUID;
    ALTER TABLE public.user_progress ALTER COLUMN user_id SET NOT NULL;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_progress_user') THEN
        ALTER TABLE public.user_progress ADD CONSTRAINT fk_progress_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;

    -- leetcode_progress
    ALTER TABLE public.leetcode_progress ALTER COLUMN user_id DROP DEFAULT;
    ALTER TABLE public.leetcode_progress ALTER COLUMN user_id TYPE UUID USING user_id::UUID;
    ALTER TABLE public.leetcode_progress ALTER COLUMN user_id SET NOT NULL;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_leetcode_user') THEN
        ALTER TABLE public.leetcode_progress ADD CONSTRAINT fk_leetcode_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;

    -- roadmap_progress
    ALTER TABLE public.roadmap_progress ALTER COLUMN user_id DROP DEFAULT;
    ALTER TABLE public.roadmap_progress ALTER COLUMN user_id TYPE UUID USING user_id::UUID;
    ALTER TABLE public.roadmap_progress ALTER COLUMN user_id SET NOT NULL;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_roadmap_user') THEN
        ALTER TABLE public.roadmap_progress ADD CONSTRAINT fk_roadmap_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;

    -- resume_scores
    ALTER TABLE public.resume_scores ALTER COLUMN user_id DROP DEFAULT;
    ALTER TABLE public.resume_scores ALTER COLUMN user_id TYPE UUID USING user_id::UUID;
    ALTER TABLE public.resume_scores ALTER COLUMN user_id SET NOT NULL;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_resume_user') THEN
        ALTER TABLE public.resume_scores ADD CONSTRAINT fk_resume_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;

    -- saved_playlists
    ALTER TABLE public.saved_playlists ALTER COLUMN user_id DROP DEFAULT;
    ALTER TABLE public.saved_playlists ALTER COLUMN user_id TYPE UUID USING user_id::UUID;
    ALTER TABLE public.saved_playlists ALTER COLUMN user_id SET NOT NULL;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_saved_playlists_user') THEN
        ALTER TABLE public.saved_playlists ADD CONSTRAINT fk_saved_playlists_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;

    -- video_progress
    ALTER TABLE public.video_progress ALTER COLUMN user_id DROP DEFAULT;
    ALTER TABLE public.video_progress ALTER COLUMN user_id TYPE UUID USING user_id::UUID;
    ALTER TABLE public.video_progress ALTER COLUMN user_id SET NOT NULL;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_video_progress_user') THEN
        ALTER TABLE public.video_progress ADD CONSTRAINT fk_video_progress_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- --------------------------------------------------------------------
-- 5. INDEXES FOR PERFORMANCE
-- --------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_leetcode_user ON public.leetcode_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_leetcode_company ON public.leetcode_progress(company_slug);
CREATE INDEX IF NOT EXISTS idx_roadmap_user ON public.roadmap_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_roadmap_id ON public.roadmap_progress(roadmap_id);
CREATE INDEX IF NOT EXISTS idx_resume_user ON public.resume_scores(user_id);

-- --------------------------------------------------------------------
-- 6. ENABLE RLS & RE-CREATE STRICT OWNERSHIP POLICIES
-- --------------------------------------------------------------------
ALTER TABLE public.user_academic_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_coding_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leetcode_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_progress ENABLE ROW LEVEL SECURITY;

-- Clean drop of existing policies to prevent conflicts
DROP POLICY IF EXISTS "Allow anon all on user_academic_profile" ON public.user_academic_profile;
DROP POLICY IF EXISTS "Allow authenticated or anon access on academic_profile" ON public.user_academic_profile;
DROP POLICY IF EXISTS "Strict user ownership on user_academic_profile" ON public.user_academic_profile;

DROP POLICY IF EXISTS "Allow anon all on user_coding_profiles" ON public.user_coding_profiles;
DROP POLICY IF EXISTS "Allow authenticated or anon access on coding_profiles" ON public.user_coding_profiles;
DROP POLICY IF EXISTS "Strict user ownership on user_coding_profiles" ON public.user_coding_profiles;

DROP POLICY IF EXISTS "Allow anon all on user_progress" ON public.user_progress;
DROP POLICY IF EXISTS "Allow authenticated or anon access on user_progress" ON public.user_progress;
DROP POLICY IF EXISTS "Strict user ownership on user_progress" ON public.user_progress;

DROP POLICY IF EXISTS "Allow anon all on leetcode_progress" ON public.leetcode_progress;
DROP POLICY IF EXISTS "Allow authenticated or anon access on leetcode_progress" ON public.leetcode_progress;
DROP POLICY IF EXISTS "Strict user ownership on leetcode_progress" ON public.leetcode_progress;

DROP POLICY IF EXISTS "Allow anon all on roadmap_progress" ON public.roadmap_progress;
DROP POLICY IF EXISTS "Allow authenticated or anon access on roadmap_progress" ON public.roadmap_progress;
DROP POLICY IF EXISTS "Strict user ownership on roadmap_progress" ON public.roadmap_progress;

DROP POLICY IF EXISTS "Allow anon all on resume_scores" ON public.resume_scores;
DROP POLICY IF EXISTS "Allow authenticated or anon access on resume_scores" ON public.resume_scores;
DROP POLICY IF EXISTS "Strict user ownership on resume_scores" ON public.resume_scores;

DROP POLICY IF EXISTS "Allow anon all on saved_playlists" ON public.saved_playlists;
DROP POLICY IF EXISTS "Allow authenticated or anon access on saved_playlists" ON public.saved_playlists;
DROP POLICY IF EXISTS "Strict user ownership on saved_playlists" ON public.saved_playlists;

DROP POLICY IF EXISTS "Allow anon all on video_progress" ON public.video_progress;
DROP POLICY IF EXISTS "Allow authenticated or anon access on video_progress" ON public.video_progress;
DROP POLICY IF EXISTS "Strict user ownership on video_progress" ON public.video_progress;

-- Create production strict policies (auth.uid() = user_id)
CREATE POLICY "Strict user ownership on user_academic_profile"
    ON public.user_academic_profile FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Strict user ownership on user_coding_profiles"
    ON public.user_coding_profiles FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Strict user ownership on user_progress"
    ON public.user_progress FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Strict user ownership on leetcode_progress"
    ON public.leetcode_progress FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Strict user ownership on roadmap_progress"
    ON public.roadmap_progress FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Strict user ownership on resume_scores"
    ON public.resume_scores FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Strict user ownership on saved_playlists"
    ON public.saved_playlists FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Strict user ownership on video_progress"
    ON public.video_progress FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- --------------------------------------------------------------------
-- 7. SECURE TRIGGER FUNCTION FOR NEW USERS
-- --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_academic_profile (user_id, full_name, updated_at)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        updated_at = NOW();

    INSERT INTO public.user_progress (user_id, updated_at)
    VALUES (NEW.id, NOW())
    ON CONFLICT (user_id) DO NOTHING;

    INSERT INTO public.user_coding_profiles (user_id, updated_at)
    VALUES (NEW.id, NOW())
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- --------------------------------------------------------------------
-- 8. SECURE RPC FUNCTION: DERIVES IDENTITY INTERNALLY FROM AUTH.UID()
-- --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.upsert_leetcode_solve(
    p_company TEXT,
    p_question_id INT,
    p_title TEXT,
    p_difficulty TEXT
) RETURNS VOID AS $$
DECLARE
    v_user_id UUID;
BEGIN
    -- Derive caller identity internally from active Supabase auth session
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Unauthenticated call to upsert_leetcode_solve';
    END IF;

    INSERT INTO public.leetcode_progress (user_id, company_slug, question_id, question_title, difficulty, status)
    VALUES (v_user_id, p_company, p_question_id, p_title, p_difficulty, 'solved')
    ON CONFLICT (user_id, company_slug, question_id)
    DO UPDATE SET status = 'solved', solved_at = NOW();

    INSERT INTO public.user_progress (user_id, problems_solved, updated_at)
    VALUES (v_user_id, 1, NOW())
    ON CONFLICT (user_id)
    DO UPDATE SET 
        problems_solved = (SELECT COUNT(*) FROM public.leetcode_progress WHERE user_id = v_user_id AND status = 'solved'),
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Revoke public execution permissions; restrict to authenticated users only
REVOKE EXECUTE ON FUNCTION public.upsert_leetcode_solve(TEXT, INT, TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.upsert_leetcode_solve(TEXT, INT, TEXT, TEXT) TO authenticated;

COMMIT;
