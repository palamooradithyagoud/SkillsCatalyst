-- ====================================================================
-- SKILLSCATALYST - MASTER CONSOLIDATED PRODUCTION SUPABASE SCHEMA
-- ====================================================================
-- Run this single master script in Supabase SQL Editor to provision
-- all 12 database tables, indexes, constraints, and RLS policies at once.
-- ====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ACADEMIC & INSTITUTIONAL PROFILE
CREATE TABLE IF NOT EXISTS public.user_academic_profile (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT DEFAULT '',
    college TEXT DEFAULT '',
    department TEXT DEFAULT '',
    academic_year TEXT DEFAULT '',
    target_role TEXT DEFAULT '',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. CODING PROFILES & EXTRACTED STATS
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

-- 3. USER OVERALL PROGRESS & STATS
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

-- 4. LEETCODE & COMPANY-WISE PRACTICE PROGRESS
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

-- 5. ROADMAP PROGRESS CHECKLIST
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

-- 6. RESUME SCORES & AI REVIEW HISTORY
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

-- 7. SAVED PLAYLISTS (RELATIONAL TABLE)
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

CREATE INDEX IF NOT EXISTS idx_saved_playlists_user ON public.saved_playlists(user_id);

-- 8. VIDEO WATCH PROGRESS (RELATIONAL TABLE)
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

CREATE INDEX IF NOT EXISTS idx_video_progress_user ON public.video_progress(user_id);

-- 9. LEARNING PROGRESS TABLE (JSONB Storage for Courses & Videos)
CREATE TABLE IF NOT EXISTS public.learning_progress (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id      TEXT NOT NULL,
    user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    skill_name      TEXT NOT NULL,
    completed_steps JSONB DEFAULT '[]'::jsonb,
    completion_pct  NUMERIC(5,2) DEFAULT 0.00,
    started_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_session_skill UNIQUE(session_id, skill_name)
);

CREATE INDEX IF NOT EXISTS idx_learning_progress_session ON public.learning_progress(session_id);
CREATE INDEX IF NOT EXISTS idx_learning_progress_skill ON public.learning_progress(skill_name);

-- 10. SKILLS CACHE TABLE (Pre-computed Roadmaps & YouTube Recommendations)
CREATE TABLE IF NOT EXISTS public.skills_cache (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    skill_name      TEXT NOT NULL UNIQUE,
    roadmap_json    JSONB DEFAULT '{}'::jsonb,
    playlists_json  JSONB DEFAULT '[]'::jsonb,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 11. TRUST SCORE ENGINE TABLE (Resource Trust Metrics)
CREATE TABLE IF NOT EXISTS public.trust_score_engine (
    url             TEXT PRIMARY KEY,
    trust_score     NUMERIC(5,2) DEFAULT 50.00,
    clicks          INTEGER DEFAULT 0,
    saves           INTEGER DEFAULT 0,
    ignores         INTEGER DEFAULT 0,
    completions     INTEGER DEFAULT 0,
    last_updated    TIMESTAMPTZ DEFAULT NOW()
);

-- 12. USER FEEDBACK / EVENT ANALYTICS TABLE
CREATE TABLE IF NOT EXISTS public.user_feedback (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         TEXT NOT NULL,
    action          TEXT NOT NULL, -- 'click', 'save', 'ignore', 'complete'
    resource_url    TEXT,
    metadata        JSONB DEFAULT '{}'::jsonb,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_feedback_user ON public.user_feedback(user_id);

-- 13. ENABLE ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.user_academic_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_coding_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leetcode_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trust_score_engine ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;

-- 14. CREATE SERVICE ROLE & USER OWNERSHIP POLICIES
-- user_academic_profile
DROP POLICY IF EXISTS "Strict user ownership on user_academic_profile" ON public.user_academic_profile;
DROP POLICY IF EXISTS "Service role access on user_academic_profile" ON public.user_academic_profile;
CREATE POLICY "Service role access on user_academic_profile" ON public.user_academic_profile FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Strict user ownership on user_academic_profile" ON public.user_academic_profile FOR ALL USING (auth.uid() IS NULL OR auth.uid()::text = user_id::text) WITH CHECK (auth.uid() IS NULL OR auth.uid()::text = user_id::text);

-- user_coding_profiles
DROP POLICY IF EXISTS "Strict user ownership on user_coding_profiles" ON public.user_coding_profiles;
DROP POLICY IF EXISTS "Allow anon all on user_coding_profiles" ON public.user_coding_profiles;
DROP POLICY IF EXISTS "Allow authenticated or anon access on coding_profiles" ON public.user_coding_profiles;
DROP POLICY IF EXISTS "Users can only access own coding profile" ON public.user_coding_profiles;
DROP POLICY IF EXISTS "Service role access on user_coding_profiles" ON public.user_coding_profiles;
CREATE POLICY "Service role access on user_coding_profiles" ON public.user_coding_profiles FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Strict user ownership on user_coding_profiles" ON public.user_coding_profiles FOR ALL USING (auth.uid() IS NULL OR auth.uid()::text = user_id::text) WITH CHECK (auth.uid() IS NULL OR auth.uid()::text = user_id::text);

-- user_progress
DROP POLICY IF EXISTS "Strict user ownership on user_progress" ON public.user_progress;
DROP POLICY IF EXISTS "Service role access on user_progress" ON public.user_progress;
CREATE POLICY "Service role access on user_progress" ON public.user_progress FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Strict user ownership on user_progress" ON public.user_progress FOR ALL USING (auth.uid() IS NULL OR auth.uid()::text = user_id::text) WITH CHECK (auth.uid() IS NULL OR auth.uid()::text = user_id::text);

-- leetcode_progress
DROP POLICY IF EXISTS "Strict user ownership on leetcode_progress" ON public.leetcode_progress;
DROP POLICY IF EXISTS "Service role access on leetcode_progress" ON public.leetcode_progress;
CREATE POLICY "Service role access on leetcode_progress" ON public.leetcode_progress FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Strict user ownership on leetcode_progress" ON public.leetcode_progress FOR ALL USING (auth.uid() IS NULL OR auth.uid()::text = user_id::text) WITH CHECK (auth.uid() IS NULL OR auth.uid()::text = user_id::text);

-- roadmap_progress
DROP POLICY IF EXISTS "Strict user ownership on roadmap_progress" ON public.roadmap_progress;
DROP POLICY IF EXISTS "Service role access on roadmap_progress" ON public.roadmap_progress;
CREATE POLICY "Service role access on roadmap_progress" ON public.roadmap_progress FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Strict user ownership on roadmap_progress" ON public.roadmap_progress FOR ALL USING (auth.uid() IS NULL OR auth.uid()::text = user_id::text) WITH CHECK (auth.uid() IS NULL OR auth.uid()::text = user_id::text);

-- resume_scores
DROP POLICY IF EXISTS "Strict user ownership on resume_scores" ON public.resume_scores;
DROP POLICY IF EXISTS "Service role access on resume_scores" ON public.resume_scores;
CREATE POLICY "Service role access on resume_scores" ON public.resume_scores FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Strict user ownership on resume_scores" ON public.resume_scores FOR ALL USING (auth.uid() IS NULL OR auth.uid()::text = user_id::text) WITH CHECK (auth.uid() IS NULL OR auth.uid()::text = user_id::text);

-- saved_playlists
DROP POLICY IF EXISTS "Strict user ownership on saved_playlists" ON public.saved_playlists;
DROP POLICY IF EXISTS "Service role access on saved_playlists" ON public.saved_playlists;
CREATE POLICY "Service role access on saved_playlists" ON public.saved_playlists FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Strict user ownership on saved_playlists" ON public.saved_playlists FOR ALL USING (auth.uid() IS NULL OR auth.uid()::text = user_id::text) WITH CHECK (auth.uid() IS NULL OR auth.uid()::text = user_id::text);

-- video_progress
DROP POLICY IF EXISTS "Strict user ownership on video_progress" ON public.video_progress;
DROP POLICY IF EXISTS "Service role access on video_progress" ON public.video_progress;
CREATE POLICY "Service role access on video_progress" ON public.video_progress FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Strict user ownership on video_progress" ON public.video_progress FOR ALL USING (auth.uid() IS NULL OR auth.uid()::text = user_id::text) WITH CHECK (auth.uid() IS NULL OR auth.uid()::text = user_id::text);

-- learning_progress
DROP POLICY IF EXISTS "Allow all on learning_progress" ON public.learning_progress;
DROP POLICY IF EXISTS "Allow session owner access on learning_progress" ON public.learning_progress;
DROP POLICY IF EXISTS "Users own learning progress" ON public.learning_progress;
DROP POLICY IF EXISTS "Strict user ownership on learning_progress" ON public.learning_progress;
DROP POLICY IF EXISTS "Service role full access on learning_progress" ON public.learning_progress;

CREATE POLICY "Strict user ownership on learning_progress"
    ON public.learning_progress FOR ALL
    USING (auth.uid() IS NULL OR auth.uid()::text = user_id::text) WITH CHECK (auth.uid() IS NULL OR auth.uid()::text = user_id::text);

CREATE POLICY "Service role full access on learning_progress"
    ON public.learning_progress FOR ALL TO service_role
    USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow read skills_cache" ON public.skills_cache;
CREATE POLICY "Allow read skills_cache" ON public.skills_cache FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow read trust_score_engine" ON public.trust_score_engine;
CREATE POLICY "Allow read trust_score_engine" ON public.trust_score_engine FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow user insert user_feedback" ON public.user_feedback;
CREATE POLICY "Allow user insert user_feedback" ON public.user_feedback FOR INSERT WITH CHECK (true);
