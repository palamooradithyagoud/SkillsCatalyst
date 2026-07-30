-- ====================================================================
-- SKILLSCATALYST / SKILLPATH - SUPABASE COMPLETE DATABASE SCHEMA
-- Safe Drop & Recreate Script for Supabase SQL Editor
-- ====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables to ensure clean column definitions and remove stale schemas
DROP TABLE IF EXISTS public.user_academic_profile CASCADE;
DROP TABLE IF EXISTS public.user_coding_profiles CASCADE;
DROP TABLE IF EXISTS public.user_progress CASCADE;
DROP TABLE IF EXISTS public.leetcode_progress CASCADE;
DROP TABLE IF EXISTS public.roadmap_progress CASCADE;
DROP TABLE IF EXISTS public.resume_scores CASCADE;
DROP TABLE IF EXISTS public.saved_playlists CASCADE;
DROP TABLE IF EXISTS public.video_progress CASCADE;

-- --------------------------------------------------------------------
-- 1. ACADEMIC & INSTITUTIONAL PROFILE TABLE
-- --------------------------------------------------------------------
CREATE TABLE public.user_academic_profile (
    user_id TEXT PRIMARY KEY DEFAULT 'default_user',
    full_name TEXT DEFAULT '',
    college TEXT DEFAULT '',
    department TEXT DEFAULT '',
    academic_year TEXT DEFAULT '',
    target_role TEXT DEFAULT '',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- 2. CODING PROFILES & EXTRACTED STATS TABLE
-- --------------------------------------------------------------------
CREATE TABLE public.user_coding_profiles (
    user_id TEXT PRIMARY KEY DEFAULT 'default_user',
    leetcode_url TEXT DEFAULT '',
    github_url TEXT DEFAULT '',
    hackerrank_url TEXT DEFAULT '',
    codechef_url TEXT DEFAULT '',
    geeksforgeeks_url TEXT DEFAULT '',
    codeforces_url TEXT DEFAULT '',
    stats_json JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- 3. USER OVERALL PROGRESS & STATS TABLE
-- --------------------------------------------------------------------
CREATE TABLE public.user_progress (
    user_id TEXT PRIMARY KEY DEFAULT 'default_user',
    problems_solved INTEGER NOT NULL DEFAULT 0,
    success_rate NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    streak_days INTEGER NOT NULL DEFAULT 0,
    learning_progress_percent NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    resume_readiness_score NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    ai_career_health_score NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- 4. LEETCODE & COMPANY-WISE PRACTICE PROGRESS TABLE
-- --------------------------------------------------------------------
CREATE TABLE public.leetcode_progress (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT NOT NULL DEFAULT 'default_user',
    company_slug TEXT NOT NULL,           -- e.g. 'google', 'amazon', 'meta'
    question_id INTEGER NOT NULL,          -- e.g. 1, 42, 206
    question_title TEXT NOT NULL,         -- e.g. 'Two Sum'
    difficulty TEXT DEFAULT 'Easy',       -- 'Easy', 'Medium', 'Hard'
    acceptance TEXT,                      -- e.g. '57.1%'
    frequency TEXT,                       -- e.g. '100.0%'
    status TEXT NOT NULL DEFAULT 'solved', -- 'solved', 'in_progress'
    solved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_company_question UNIQUE(user_id, company_slug, question_id)
);

CREATE INDEX idx_leetcode_user ON public.leetcode_progress(user_id);
CREATE INDEX idx_leetcode_company ON public.leetcode_progress(company_slug);

-- --------------------------------------------------------------------
-- 5. ROADMAP PROGRESS TABLE (Beginner DSA & AI Skill Roadmaps)
-- --------------------------------------------------------------------
CREATE TABLE public.roadmap_progress (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT NOT NULL DEFAULT 'default_user',
    roadmap_id TEXT NOT NULL,             -- e.g. 'dsa-beginner', 'frontend', 'python'
    node_id TEXT NOT NULL,                -- e.g. 'two-pointers', 'sliding-window'
    node_title TEXT NOT NULL,             -- e.g. 'Two Pointers'
    category TEXT,                         -- e.g. 'Arrays', 'Strings'
    status TEXT NOT NULL DEFAULT 'completed', -- 'completed', 'in_progress'
    completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_roadmap_node UNIQUE(user_id, roadmap_id, node_id)
);

CREATE INDEX idx_roadmap_user ON public.roadmap_progress(user_id);
CREATE INDEX idx_roadmap_id ON public.roadmap_progress(roadmap_id);

-- --------------------------------------------------------------------
-- 6. RESUME SCORES & AI REVIEW HISTORY TABLE
-- --------------------------------------------------------------------
CREATE TABLE public.resume_scores (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT NOT NULL DEFAULT 'default_user',
    filename TEXT NOT NULL,               -- e.g. 'my_resume.pdf'
    target_role TEXT NOT NULL,            -- e.g. 'Software Engineer'
    company_type TEXT DEFAULT 'Product-Based',
    overall_score NUMERIC(5, 2) NOT NULL, -- e.g. 85.0
    ats_compatibility_score NUMERIC(5, 2),
    skills_match_score NUMERIC(5, 2),
    experience_score NUMERIC(5, 2),
    strengths JSONB DEFAULT '[]'::jsonb,
    improvements JSONB DEFAULT '[]'::jsonb,
    full_review_json JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_resume_user ON public.resume_scores(user_id);

-- --------------------------------------------------------------------
-- 7. SAVED PLAYLISTS TABLE
-- --------------------------------------------------------------------
CREATE TABLE public.saved_playlists (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT NOT NULL DEFAULT 'default_user',
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

-- --------------------------------------------------------------------
-- 8. VIDEO WATCH PROGRESS & ANTI-CHEAT TRACKING TABLE
-- --------------------------------------------------------------------
CREATE TABLE public.video_progress (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT NOT NULL DEFAULT 'default_user',
    playlist_id TEXT NOT NULL,
    video_id TEXT NOT NULL,
    watched BOOLEAN DEFAULT FALSE,
    last_position INTEGER DEFAULT 0,       -- resume playback position in seconds
    watch_time INTEGER DEFAULT 0,          -- cumulative seconds watched
    completed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_playlist_video UNIQUE(user_id, playlist_id, video_id)
);

-- --------------------------------------------------------------------
-- ENABLE ROW LEVEL SECURITY (RLS) & ANONYMOUS POLICIES
-- --------------------------------------------------------------------
ALTER TABLE public.user_academic_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_coding_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leetcode_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon all on user_academic_profile" ON public.user_academic_profile FOR ALL USING (true);
CREATE POLICY "Allow anon all on user_coding_profiles" ON public.user_coding_profiles FOR ALL USING (true);
CREATE POLICY "Allow anon all on user_progress" ON public.user_progress FOR ALL USING (true);
CREATE POLICY "Allow anon all on leetcode_progress" ON public.leetcode_progress FOR ALL USING (true);
CREATE POLICY "Allow anon all on roadmap_progress" ON public.roadmap_progress FOR ALL USING (true);
CREATE POLICY "Allow anon all on resume_scores" ON public.resume_scores FOR ALL USING (true);
CREATE POLICY "Allow anon all on saved_playlists" ON public.saved_playlists FOR ALL USING (true);
CREATE POLICY "Allow anon all on video_progress" ON public.video_progress FOR ALL USING (true);

-- --------------------------------------------------------------------
-- AUTOMATIC UPSERT STORED PROCEDURE FOR LEETCODE SOLVES
-- --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.upsert_leetcode_solve(
    p_user_id TEXT,
    p_company TEXT,
    p_question_id INT,
    p_title TEXT,
    p_difficulty TEXT
) RETURNS VOID AS $$
BEGIN
    INSERT INTO public.leetcode_progress (user_id, company_slug, question_id, question_title, difficulty, status)
    VALUES (p_user_id, p_company, p_question_id, p_title, p_difficulty, 'solved')
    ON CONFLICT (user_id, company_slug, question_id)
    DO UPDATE SET status = 'solved', solved_at = NOW();

    -- Automatically update overall user problems_solved counter
    INSERT INTO public.user_progress (user_id, problems_solved, updated_at)
    VALUES (p_user_id, 1, NOW())
    ON CONFLICT (user_id)
    DO UPDATE SET 
        problems_solved = (SELECT COUNT(*) FROM public.leetcode_progress WHERE user_id = p_user_id AND status = 'solved'),
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;
