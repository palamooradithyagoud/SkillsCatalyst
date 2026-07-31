-- ====================================================================
-- SKILLSCATALYST - PRODUCTION SUPABASE DATABASE SCHEMA
-- ====================================================================
-- NON-DESTRUCTIVE PRODUCTION SCHEMA (ZERO DROP TABLE STATEMENTS)
-- ====================================================================

-- 1. ENABLE EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ACADEMIC & INSTITUTIONAL PROFILE TABLE
CREATE TABLE IF NOT EXISTS public.user_academic_profile (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT DEFAULT '',
    college TEXT DEFAULT '',
    department TEXT DEFAULT '',
    academic_year TEXT DEFAULT '',
    target_role TEXT DEFAULT '',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. CODING PROFILES & EXTRACTED STATS TABLE
CREATE TABLE IF NOT EXISTS public.user_coding_profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    leetcode_url TEXT DEFAULT '',
    github_url TEXT DEFAULT '',
    hackerrank_url TEXT DEFAULT '',
    codechef_url TEXT DEFAULT '',
    geeksforgeeks_url TEXT DEFAULT '',
    codeforces_url TEXT DEFAULT '',
    stats_json JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. USER OVERALL PROGRESS & STATS TABLE
CREATE TABLE IF NOT EXISTS public.user_progress (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    problems_solved INTEGER NOT NULL DEFAULT 0,
    success_rate NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    streak_days INTEGER NOT NULL DEFAULT 0,
    learning_progress_percent NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    resume_readiness_score NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    ai_career_health_score NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. LEETCODE & COMPANY-WISE PRACTICE PROGRESS TABLE
CREATE TABLE IF NOT EXISTS public.leetcode_progress (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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

CREATE INDEX IF NOT EXISTS idx_leetcode_user ON public.leetcode_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_leetcode_company ON public.leetcode_progress(company_slug);

-- 6. ROADMAP PROGRESS TABLE
CREATE TABLE IF NOT EXISTS public.roadmap_progress (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    roadmap_id TEXT NOT NULL,
    node_id TEXT NOT NULL,
    node_title TEXT NOT NULL,
    category TEXT,
    status TEXT NOT NULL DEFAULT 'completed',
    completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_roadmap_node UNIQUE(user_id, roadmap_id, node_id)
);

CREATE INDEX IF NOT EXISTS idx_roadmap_user ON public.roadmap_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_roadmap_id ON public.roadmap_progress(roadmap_id);

-- 7. RESUME SCORES & AI REVIEW HISTORY TABLE
CREATE TABLE IF NOT EXISTS public.resume_scores (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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

CREATE INDEX IF NOT EXISTS idx_resume_user ON public.resume_scores(user_id);

-- 8. SAVED PLAYLISTS TABLE
CREATE TABLE IF NOT EXISTS public.saved_playlists (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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

-- 9. VIDEO WATCH PROGRESS TABLE
CREATE TABLE IF NOT EXISTS public.video_progress (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    playlist_id TEXT NOT NULL,
    video_id TEXT NOT NULL,
    watched BOOLEAN DEFAULT FALSE,
    last_position INTEGER DEFAULT 0,
    watch_time INTEGER DEFAULT 0,
    completed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_playlist_video UNIQUE(user_id, playlist_id, video_id)
);

-- 9.5 LEARNING PROGRESS JSONB & SESSION TABLE
CREATE TABLE IF NOT EXISTS public.learning_progress (
    id BIGSERIAL PRIMARY KEY,
    session_id TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    skill_name TEXT NOT NULL DEFAULT 'saved_playlists',
    completed_steps JSONB DEFAULT '[]'::jsonb,
    completion_pct NUMERIC(5, 2) DEFAULT 0.00,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_session_skill UNIQUE(session_id, skill_name)
);

CREATE INDEX IF NOT EXISTS idx_learning_progress_session ON public.learning_progress(session_id);

-- 10. ENABLE RLS & STRICT USER OWNERSHIP POLICIES
ALTER TABLE public.user_academic_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_coding_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leetcode_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all on learning_progress" ON public.learning_progress;
CREATE POLICY "Allow all on learning_progress"
    ON public.learning_progress FOR ALL
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon all on user_academic_profile" ON public.user_academic_profile;
DROP POLICY IF EXISTS "Allow authenticated or anon access on academic_profile" ON public.user_academic_profile;
DROP POLICY IF EXISTS "Users can only access own academic profile" ON public.user_academic_profile;
DROP POLICY IF EXISTS "Strict user ownership on user_academic_profile" ON public.user_academic_profile;

DROP POLICY IF EXISTS "Allow anon all on user_coding_profiles" ON public.user_coding_profiles;
DROP POLICY IF EXISTS "Allow authenticated or anon access on coding_profiles" ON public.user_coding_profiles;
DROP POLICY IF EXISTS "Users can only access own coding profile" ON public.user_coding_profiles;
DROP POLICY IF EXISTS "Strict user ownership on user_coding_profiles" ON public.user_coding_profiles;

DROP POLICY IF EXISTS "Allow anon all on user_progress" ON public.user_progress;
DROP POLICY IF EXISTS "Allow authenticated or anon access on user_progress" ON public.user_progress;
DROP POLICY IF EXISTS "Users can only access own progress" ON public.user_progress;
DROP POLICY IF EXISTS "Strict user ownership on user_progress" ON public.user_progress;

DROP POLICY IF EXISTS "Allow anon all on leetcode_progress" ON public.leetcode_progress;
DROP POLICY IF EXISTS "Allow authenticated or anon access on leetcode_progress" ON public.leetcode_progress;
DROP POLICY IF EXISTS "Users can only access own leetcode progress" ON public.leetcode_progress;
DROP POLICY IF EXISTS "Strict user ownership on leetcode_progress" ON public.leetcode_progress;

DROP POLICY IF EXISTS "Allow anon all on roadmap_progress" ON public.roadmap_progress;
DROP POLICY IF EXISTS "Allow authenticated or anon access on roadmap_progress" ON public.roadmap_progress;
DROP POLICY IF EXISTS "Users can only access own roadmap progress" ON public.roadmap_progress;
DROP POLICY IF EXISTS "Strict user ownership on roadmap_progress" ON public.roadmap_progress;

DROP POLICY IF EXISTS "Allow anon all on resume_scores" ON public.resume_scores;
DROP POLICY IF EXISTS "Allow authenticated or anon access on resume_scores" ON public.resume_scores;
DROP POLICY IF EXISTS "Users can only access own resume scores" ON public.resume_scores;
DROP POLICY IF EXISTS "Strict user ownership on resume_scores" ON public.resume_scores;

DROP POLICY IF EXISTS "Allow anon all on saved_playlists" ON public.saved_playlists;
DROP POLICY IF EXISTS "Allow authenticated or anon access on saved_playlists" ON public.saved_playlists;
DROP POLICY IF EXISTS "Users can only access own saved playlists" ON public.saved_playlists;
DROP POLICY IF EXISTS "Strict user ownership on saved_playlists" ON public.saved_playlists;

DROP POLICY IF EXISTS "Allow anon all on video_progress" ON public.video_progress;
DROP POLICY IF EXISTS "Allow authenticated or anon access on video_progress" ON public.video_progress;
DROP POLICY IF EXISTS "Users can only access own video progress" ON public.video_progress;
DROP POLICY IF EXISTS "Strict user ownership on video_progress" ON public.video_progress;

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

-- 11. AUTOMATIC PROFILE CREATION TRIGGER ON AUTH USER SIGNUP
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

-- 12. SECURE RPC FUNCTION: DERIVES IDENTITY INTERNALLY FROM AUTH.UID()
CREATE OR REPLACE FUNCTION public.upsert_leetcode_solve(
    p_company TEXT,
    p_question_id INT,
    p_title TEXT,
    p_difficulty TEXT
) RETURNS VOID AS $$
DECLARE
    v_user_id UUID;
BEGIN
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

REVOKE EXECUTE ON FUNCTION public.upsert_leetcode_solve(TEXT, INT, TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.upsert_leetcode_solve(TEXT, INT, TEXT, TEXT) TO authenticated;
