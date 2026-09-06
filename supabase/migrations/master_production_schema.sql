-- ====================================================================
-- SKILLSCATALYST - MASTER ALL-IN-ONE CONSOLIDATED SUPABASE SQL SCHEMA
-- ====================================================================
-- Complete, single-run, idempotent database schema for SkillsCatalyst.
-- Safe to copy-paste and execute directly in the Supabase SQL Editor.
--
-- INCLUDES:
-- 1. All Extensions & Helper Functions
-- 2. Academic & Institutional Profiles
-- 3. Coding Profiles & Multi-Platform Stats
-- 4. User Progress, Daily Streak & Dynamic Level Engine
-- 5. LeetCode & Company-Wise Practice Progress
-- 6. Roadmap Progress Checklist
-- 7. Resume Scores & AI Review History
-- 8. Saved Playlists & Relational YouTube Library
-- 9. Video Watch Progress
-- 10. Learning Progress & Roadmaps
-- 11. Skills Cache & AI Recommendations
-- 12. Trust Score Engine & Resource Telemetry
-- 13. User Feedback & Activity Tracking
-- 14. Quantitative Aptitude & Placement Prep (Categories, Topics, Questions, Attempts, Results)
-- 15. User To-Dos, Scheduling & Calendar Notes
-- 16. Performance Indexes across all tables
-- 17. Stored Procedures (Daily Login Streak, Level Recalculation, Aptitude Attempts)
-- 18. Automatic Synchronization Triggers
-- 19. Complete Row Level Security (RLS) Policies
-- 20. Seed Metadata for Placement Prep
-- ====================================================================

-- ── 1. EXTENSIONS ────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── 2. REUSABLE UPDATED_AT TRIGGER FUNCTION ──────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ── 3. USER ACADEMIC & INSTITUTIONAL PROFILE ─────────────────────────
CREATE TABLE IF NOT EXISTS public.user_academic_profile (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT DEFAULT '',
    college TEXT DEFAULT '',
    department TEXT DEFAULT '',
    academic_year TEXT DEFAULT '',
    target_role TEXT DEFAULT '',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_set_updated_at_user_academic ON public.user_academic_profile;
CREATE TRIGGER trg_set_updated_at_user_academic
    BEFORE UPDATE ON public.user_academic_profile
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 4. USER CODING PROFILES & LIVE STATS ─────────────────────────────
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

DROP TRIGGER IF EXISTS trg_set_updated_at_user_coding ON public.user_coding_profiles;
CREATE TRIGGER trg_set_updated_at_user_coding
    BEFORE UPDATE ON public.user_coding_profiles
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 5. USER OVERALL PROGRESS & DYNAMIC LEVEL STATS ───────────────────
CREATE TABLE IF NOT EXISTS public.user_progress (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    problems_solved INTEGER NOT NULL DEFAULT 0,
    success_rate NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    streak_days INTEGER NOT NULL DEFAULT 0,
    last_login_date DATE DEFAULT NULL,
    last_active_at TIMESTAMPTZ DEFAULT NOW(),
    total_xp INTEGER NOT NULL DEFAULT 0,
    level INTEGER NOT NULL DEFAULT 0,
    learning_progress_percent NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    resume_readiness_score NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    ai_career_health_score NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.user_progress
    ADD COLUMN IF NOT EXISTS last_login_date DATE DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS total_xp INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS level INTEGER NOT NULL DEFAULT 0;

DROP TRIGGER IF EXISTS trg_set_updated_at_user_progress ON public.user_progress;
CREATE TRIGGER trg_set_updated_at_user_progress
    BEFORE UPDATE ON public.user_progress
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 6. LEETCODE & COMPANY-WISE PRACTICE PROGRESS ─────────────────────
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

-- ── 7. ROADMAP PROGRESS CHECKLIST ────────────────────────────────────
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

-- ── 8. RESUME SCORES & AI REVIEW HISTORY ─────────────────────────────
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

-- ── 9. SAVED PLAYLISTS (RELATIONAL TABLE) ────────────────────────────
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

-- ── 10. VIDEO WATCH PROGRESS (RELATIONAL TABLE) ──────────────────────
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

DROP TRIGGER IF EXISTS trg_set_updated_at_video_progress ON public.video_progress;
CREATE TRIGGER trg_set_updated_at_video_progress
    BEFORE UPDATE ON public.video_progress
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 11. LEARNING PROGRESS TABLE (JSONB Storage) ──────────────────────
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
CREATE INDEX IF NOT EXISTS idx_learning_progress_user ON public.learning_progress(user_id);

DROP TRIGGER IF EXISTS trg_set_updated_at_learning_progress ON public.learning_progress;
CREATE TRIGGER trg_set_updated_at_learning_progress
    BEFORE UPDATE ON public.learning_progress
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 12. SKILLS CACHE TABLE ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.skills_cache (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    skill_name      TEXT NOT NULL UNIQUE,
    roadmap_json    JSONB DEFAULT '{}'::jsonb,
    playlists_json  JSONB DEFAULT '[]'::jsonb,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_set_updated_at_skills_cache ON public.skills_cache;
CREATE TRIGGER trg_set_updated_at_skills_cache
    BEFORE UPDATE ON public.skills_cache
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 13. TRUST SCORE ENGINE TABLE ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.trust_score_engine (
    url             TEXT PRIMARY KEY,
    trust_score     NUMERIC(5,2) DEFAULT 50.00,
    clicks          INTEGER DEFAULT 0,
    saves           INTEGER DEFAULT 0,
    ignores         INTEGER DEFAULT 0,
    completions     INTEGER DEFAULT 0,
    last_updated    TIMESTAMPTZ DEFAULT NOW()
);

-- ── 14. USER FEEDBACK / EVENT ANALYTICS TABLE ────────────────────────
CREATE TABLE IF NOT EXISTS public.user_feedback (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         TEXT NOT NULL,
    action          TEXT NOT NULL,
    resource_url    TEXT,
    metadata        JSONB DEFAULT '{}'::jsonb,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_feedback_user ON public.user_feedback(user_id);

-- ── 15. PLACEMENT & QUANTITATIVE APTITUDE TABLES ─────────────────────
CREATE TABLE IF NOT EXISTS public.aptitude_categories (
    id SERIAL PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon_name VARCHAR(50) DEFAULT 'Calculator',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.aptitude_topics (
    id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES public.aptitude_categories(id) ON DELETE CASCADE,
    topic_name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    total_questions INTEGER DEFAULT 0,
    default_timer_seconds INTEGER DEFAULT 60,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.aptitude_questions (
    id SERIAL PRIMARY KEY,
    topic_id INTEGER NOT NULL REFERENCES public.aptitude_topics(id) ON DELETE CASCADE,
    question_number INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_index INTEGER NOT NULL,
    answer_text VARCHAR(100) NOT NULL,
    solution_text TEXT NOT NULL,
    difficulty VARCHAR(20) DEFAULT 'Medium',
    per_question_timer INTEGER DEFAULT 60,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_topic_question_number UNIQUE (topic_id, question_number)
);

CREATE TABLE IF NOT EXISTS public.user_aptitude_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    topic_id INTEGER NOT NULL REFERENCES public.aptitude_topics(id) ON DELETE CASCADE,
    question_id INTEGER NOT NULL REFERENCES public.aptitude_questions(id) ON DELETE CASCADE,
    selected_option_index INTEGER NOT NULL,
    is_correct BOOLEAN NOT NULL,
    time_taken_seconds INTEGER DEFAULT 0,
    attempted_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_question_attempt UNIQUE (user_id, question_id)
);

CREATE TABLE IF NOT EXISTS public.user_quiz_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    topic_id INTEGER NOT NULL REFERENCES public.aptitude_topics(id) ON DELETE CASCADE,
    total_questions INTEGER NOT NULL,
    correct_answers INTEGER NOT NULL,
    score_percentage NUMERIC(5,2) NOT NULL,
    timer_mode_seconds INTEGER DEFAULT 60,
    completed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_questions_topic ON public.aptitude_questions(topic_id);
CREATE INDEX IF NOT EXISTS idx_attempts_user_topic ON public.user_aptitude_attempts(user_id, topic_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_user ON public.user_quiz_results(user_id);

-- ── 16. USER TODOS & DAILY SCHEDULE NOTES ────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_todos (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    deadline TEXT DEFAULT '',
    progress INTEGER NOT NULL DEFAULT 0,
    scheduled_day INTEGER,
    scheduled_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_schedule_notes (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    day INTEGER NOT NULL,
    date TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_todos_user_id ON public.user_todos(user_id);
CREATE INDEX IF NOT EXISTS idx_user_todos_created_at ON public.user_todos(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_notes_user_id ON public.user_schedule_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notes_created_at ON public.user_schedule_notes(user_id, created_at DESC);

DROP TRIGGER IF EXISTS trg_set_updated_at_user_todos ON public.user_todos;
CREATE TRIGGER trg_set_updated_at_user_todos
    BEFORE UPDATE ON public.user_todos
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_set_updated_at_user_schedule_notes ON public.user_schedule_notes;
CREATE TRIGGER trg_set_updated_at_user_schedule_notes
    BEFORE UPDATE ON public.user_schedule_notes
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 17. STORED PROCEDURES & DATABASE FUNCTIONS ───────────────────────

-- A. Record Daily Login Streak
CREATE OR REPLACE FUNCTION public.record_daily_login(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_streak INTEGER := 0;
    v_last_date DATE;
    v_today DATE := CURRENT_DATE;
    v_yesterday DATE := CURRENT_DATE - 1;
BEGIN
    SELECT streak_days, last_login_date
    INTO v_streak, v_last_date
    FROM public.user_progress
    WHERE user_id = p_user_id;

    IF NOT FOUND THEN
        v_streak := 1;
        INSERT INTO public.user_progress (
            user_id, streak_days, last_login_date, last_active_at, problems_solved, total_xp, level, updated_at
        ) VALUES (
            p_user_id, 1, v_today, NOW(), 0, 0, 0, NOW()
        );
    ELSE
        IF v_last_date = v_today THEN
            v_streak := COALESCE(v_streak, 1);
            UPDATE public.user_progress
            SET last_active_at = NOW(), updated_at = NOW()
            WHERE user_id = p_user_id;
        ELSIF v_last_date = v_yesterday THEN
            v_streak := COALESCE(v_streak, 0) + 1;
            UPDATE public.user_progress
            SET streak_days = v_streak, last_login_date = v_today, last_active_at = NOW(), updated_at = NOW()
            WHERE user_id = p_user_id;
        ELSE
            v_streak := 1;
            UPDATE public.user_progress
            SET streak_days = 1, last_login_date = v_today, last_active_at = NOW(), updated_at = NOW()
            WHERE user_id = p_user_id;
        END IF;
    END IF;

    RETURN jsonb_build_object('user_id', p_user_id, 'streak_days', v_streak, 'last_login_date', v_today);
END;
$$;

-- B. Recalculate User Level & Progress Stats
CREATE OR REPLACE FUNCTION public.recalculate_user_level(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_questions INTEGER := 0;
    v_videos INTEGER := 0;
    v_roadmaps INTEGER := 0;
    v_xp INTEGER := 0;
    v_level INTEGER := 0;
BEGIN
    SELECT COUNT(*) INTO v_questions
    FROM public.leetcode_progress
    WHERE user_id = p_user_id AND status = 'solved';

    SELECT COUNT(*) INTO v_videos
    FROM public.video_progress
    WHERE user_id = p_user_id AND watched = TRUE;

    SELECT COUNT(*) INTO v_roadmaps
    FROM public.roadmap_progress
    WHERE user_id = p_user_id AND status = 'completed' AND node_id <> '_roadmap_started';

    v_xp := (v_videos * 25) + (v_questions * 50) + (v_roadmaps * 50);
    v_level := FLOOR(v_xp / 100);

    UPDATE public.user_progress
    SET problems_solved = v_questions, total_xp = v_xp, level = v_level, updated_at = NOW()
    WHERE user_id = p_user_id;

    RETURN jsonb_build_object(
        'user_id', p_user_id,
        'problems_solved', v_questions,
        'completed_videos', v_videos,
        'completed_roadmaps', v_roadmaps,
        'total_xp', v_xp,
        'level', v_level
    );
END;
$$;

-- C. Upsert User Aptitude Attempt
CREATE OR REPLACE FUNCTION public.upsert_user_aptitude_attempt(
    p_user_id UUID,
    p_topic_id INTEGER,
    p_question_id INTEGER,
    p_selected_option_index INTEGER,
    p_is_correct BOOLEAN,
    p_time_taken_seconds INTEGER
) RETURNS public.user_aptitude_attempts AS $$
DECLARE
    v_result public.user_aptitude_attempts;
BEGIN
    IF p_user_id::text IS DISTINCT FROM auth.uid()::text THEN
        RAISE EXCEPTION 'not authorized' USING ERRCODE = '42501';
    END IF;

    INSERT INTO public.user_aptitude_attempts (
        user_id, topic_id, question_id, selected_option_index, is_correct, time_taken_seconds, attempted_at
    ) VALUES (
        p_user_id, p_topic_id, p_question_id, p_selected_option_index, p_is_correct, p_time_taken_seconds, NOW()
    )
    ON CONFLICT (user_id, question_id) DO UPDATE SET
        selected_option_index = EXCLUDED.selected_option_index,
        is_correct = EXCLUDED.is_correct,
        time_taken_seconds = EXCLUDED.time_taken_seconds,
        attempted_at = NOW()
    RETURNING * INTO v_result;

    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER SET search_path = public;

-- D. Automatic Practice Progress Trigger
CREATE OR REPLACE FUNCTION public.trg_sync_leetcode_progress_solved()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_target_user UUID;
    v_count INTEGER;
BEGIN
    IF TG_OP = 'DELETE' THEN
        v_target_user := OLD.user_id;
    ELSE
        v_target_user := NEW.user_id;
    END IF;

    IF v_target_user IS NOT NULL THEN
        SELECT COUNT(*) INTO v_count
        FROM public.leetcode_progress
        WHERE user_id = v_target_user AND status = 'solved';

        UPDATE public.user_progress
        SET problems_solved = v_count, updated_at = NOW()
        WHERE user_id = v_target_user;
    END IF;

    RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_leetcode_progress_solved ON public.leetcode_progress;
CREATE TRIGGER trg_leetcode_progress_solved
AFTER INSERT OR UPDATE OR DELETE ON public.leetcode_progress
FOR EACH ROW EXECUTE FUNCTION public.trg_sync_leetcode_progress_solved();

-- ── 18. ZERO-BASELINE PROGRESS INITIALIZATION ────────────────────────
UPDATE public.user_progress
SET streak_days = 0,
    last_login_date = NULL,
    total_xp = 0,
    level = 0,
    updated_at = NOW();

UPDATE public.user_progress up
SET problems_solved = COALESCE(
    (SELECT COUNT(*) FROM public.leetcode_progress lp WHERE lp.user_id = up.user_id AND lp.status = 'solved'), 0
);

UPDATE public.user_progress up
SET total_xp = (
        COALESCE((SELECT COUNT(*) FROM public.leetcode_progress lp WHERE lp.user_id = up.user_id AND lp.status = 'solved'), 0) * 50
        + COALESCE((SELECT COUNT(*) FROM public.video_progress vp WHERE vp.user_id = up.user_id AND vp.watched = TRUE), 0) * 25
        + COALESCE((SELECT COUNT(*) FROM public.roadmap_progress rp WHERE rp.user_id = up.user_id AND rp.status = 'completed' AND rp.node_id <> '_roadmap_started'), 0) * 50
    ),
    level = FLOOR(
        (
            COALESCE((SELECT COUNT(*) FROM public.leetcode_progress lp WHERE lp.user_id = up.user_id AND lp.status = 'solved'), 0) * 50
            + COALESCE((SELECT COUNT(*) FROM public.video_progress vp WHERE vp.user_id = up.user_id AND vp.watched = TRUE), 0) * 25
            + COALESCE((SELECT COUNT(*) FROM public.roadmap_progress rp WHERE rp.user_id = up.user_id AND rp.status = 'completed' AND rp.node_id <> '_roadmap_started'), 0) * 50
        ) / 100
    );

-- ── 19. ROW LEVEL SECURITY (RLS) POLICIES ────────────────────────────
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
ALTER TABLE public.aptitude_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aptitude_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aptitude_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_aptitude_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_schedule_notes ENABLE ROW LEVEL SECURITY;

-- Revoke dangerous anon write grants
REVOKE ALL ON public.user_academic_profile FROM anon;
REVOKE ALL ON public.user_coding_profiles FROM anon;
REVOKE ALL ON public.user_progress FROM anon;
REVOKE ALL ON public.leetcode_progress FROM anon;
REVOKE ALL ON public.roadmap_progress FROM anon;
REVOKE ALL ON public.resume_scores FROM anon;
REVOKE ALL ON public.saved_playlists FROM anon;
REVOKE ALL ON public.video_progress FROM anon;
REVOKE ALL ON public.learning_progress FROM anon;
REVOKE ALL ON public.user_feedback FROM anon;
REVOKE ALL ON public.user_todos FROM anon;
REVOKE ALL ON public.user_schedule_notes FROM anon;

-- Grant authenticated & service_role access
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_academic_profile TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_coding_profiles TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_progress TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leetcode_progress TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.roadmap_progress TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.resume_scores TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_playlists TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.video_progress TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.learning_progress TO authenticated, service_role;
GRANT SELECT, INSERT ON public.user_feedback TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_todos TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_schedule_notes TO authenticated, service_role;

GRANT EXECUTE ON FUNCTION public.record_daily_login(UUID) TO authenticated, service_role, anon;
GRANT EXECUTE ON FUNCTION public.recalculate_user_level(UUID) TO authenticated, service_role, anon;
GRANT EXECUTE ON FUNCTION public.upsert_user_aptitude_attempt(UUID, INTEGER, INTEGER, INTEGER, BOOLEAN, INTEGER) TO authenticated, service_role;

-- Strict User Ownership Policies
DROP POLICY IF EXISTS "Service role access on user_academic_profile" ON public.user_academic_profile;
DROP POLICY IF EXISTS "Strict user ownership on user_academic_profile" ON public.user_academic_profile;
CREATE POLICY "Service role access on user_academic_profile" ON public.user_academic_profile FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Strict user ownership on user_academic_profile" ON public.user_academic_profile FOR ALL TO authenticated USING (user_id IS NOT NULL AND auth.uid()::text = user_id::text) WITH CHECK (user_id IS NOT NULL AND auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Service role access on user_coding_profiles" ON public.user_coding_profiles;
DROP POLICY IF EXISTS "Strict user ownership on user_coding_profiles" ON public.user_coding_profiles;
CREATE POLICY "Service role access on user_coding_profiles" ON public.user_coding_profiles FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Strict user ownership on user_coding_profiles" ON public.user_coding_profiles FOR ALL TO authenticated USING (user_id IS NOT NULL AND auth.uid()::text = user_id::text) WITH CHECK (user_id IS NOT NULL AND auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Service role access on user_progress" ON public.user_progress;
DROP POLICY IF EXISTS "Strict user ownership on user_progress" ON public.user_progress;
CREATE POLICY "Service role access on user_progress" ON public.user_progress FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Strict user ownership on user_progress" ON public.user_progress FOR ALL TO authenticated USING (user_id IS NOT NULL AND auth.uid()::text = user_id::text) WITH CHECK (user_id IS NOT NULL AND auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Service role access on leetcode_progress" ON public.leetcode_progress;
DROP POLICY IF EXISTS "Strict user ownership on leetcode_progress" ON public.leetcode_progress;
CREATE POLICY "Service role access on leetcode_progress" ON public.leetcode_progress FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Strict user ownership on leetcode_progress" ON public.leetcode_progress FOR ALL TO authenticated USING (user_id IS NOT NULL AND auth.uid()::text = user_id::text) WITH CHECK (user_id IS NOT NULL AND auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Service role access on roadmap_progress" ON public.roadmap_progress;
DROP POLICY IF EXISTS "Strict user ownership on roadmap_progress" ON public.roadmap_progress;
CREATE POLICY "Service role access on roadmap_progress" ON public.roadmap_progress FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Strict user ownership on roadmap_progress" ON public.roadmap_progress FOR ALL TO authenticated USING (user_id IS NOT NULL AND auth.uid()::text = user_id::text) WITH CHECK (user_id IS NOT NULL AND auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Service role access on resume_scores" ON public.resume_scores;
DROP POLICY IF EXISTS "Strict user ownership on resume_scores" ON public.resume_scores;
CREATE POLICY "Service role access on resume_scores" ON public.resume_scores FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Strict user ownership on resume_scores" ON public.resume_scores FOR ALL TO authenticated USING (user_id IS NOT NULL AND auth.uid()::text = user_id::text) WITH CHECK (user_id IS NOT NULL AND auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Service role access on saved_playlists" ON public.saved_playlists;
DROP POLICY IF EXISTS "Strict user ownership on saved_playlists" ON public.saved_playlists;
CREATE POLICY "Service role access on saved_playlists" ON public.saved_playlists FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Strict user ownership on saved_playlists" ON public.saved_playlists FOR ALL TO authenticated USING (user_id IS NOT NULL AND auth.uid()::text = user_id::text) WITH CHECK (user_id IS NOT NULL AND auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Service role access on video_progress" ON public.video_progress;
DROP POLICY IF EXISTS "Strict user ownership on video_progress" ON public.video_progress;
CREATE POLICY "Service role access on video_progress" ON public.video_progress FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Strict user ownership on video_progress" ON public.video_progress FOR ALL TO authenticated USING (user_id IS NOT NULL AND auth.uid()::text = user_id::text) WITH CHECK (user_id IS NOT NULL AND auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Service role full access on learning_progress" ON public.learning_progress;
DROP POLICY IF EXISTS "Strict user ownership on learning_progress" ON public.learning_progress;
CREATE POLICY "Service role full access on learning_progress" ON public.learning_progress FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Strict user ownership on learning_progress" ON public.learning_progress FOR ALL TO authenticated USING (user_id IS NOT NULL AND auth.uid()::text = user_id::text) WITH CHECK (user_id IS NOT NULL AND auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Allow read skills_cache" ON public.skills_cache;
CREATE POLICY "Allow read skills_cache" ON public.skills_cache FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow read trust_score_engine" ON public.trust_score_engine;
CREATE POLICY "Allow read trust_score_engine" ON public.trust_score_engine FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service role access on user_feedback" ON public.user_feedback;
DROP POLICY IF EXISTS "Authenticated insert on user_feedback" ON public.user_feedback;
CREATE POLICY "Service role access on user_feedback" ON public.user_feedback FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated insert on user_feedback" ON public.user_feedback FOR INSERT TO authenticated WITH CHECK (user_id IS NOT NULL AND auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Public read aptitude categories" ON public.aptitude_categories;
CREATE POLICY "Public read aptitude categories" ON public.aptitude_categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read aptitude topics" ON public.aptitude_topics;
CREATE POLICY "Public read aptitude topics" ON public.aptitude_topics FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read aptitude questions" ON public.aptitude_questions;
CREATE POLICY "Public read aptitude questions" ON public.aptitude_questions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users view own attempts" ON public.user_aptitude_attempts;
DROP POLICY IF EXISTS "Users insert own attempts" ON public.user_aptitude_attempts;
CREATE POLICY "Users view own attempts" ON public.user_aptitude_attempts FOR SELECT TO authenticated USING (user_id IS NOT NULL AND auth.uid()::text = user_id::text);
CREATE POLICY "Users insert own attempts" ON public.user_aptitude_attempts FOR INSERT TO authenticated WITH CHECK (user_id IS NOT NULL AND auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Users view own quiz results" ON public.user_quiz_results;
DROP POLICY IF EXISTS "Users insert own quiz results" ON public.user_quiz_results;
CREATE POLICY "Users view own quiz results" ON public.user_quiz_results FOR SELECT TO authenticated USING (user_id IS NOT NULL AND auth.uid()::text = user_id::text);
CREATE POLICY "Users insert own quiz results" ON public.user_quiz_results FOR INSERT TO authenticated WITH CHECK (user_id IS NOT NULL AND auth.uid()::text = user_id::text);

-- User To-Dos & Schedule Notes RLS
DROP POLICY IF EXISTS "Users can view their own todos" ON public.user_todos;
DROP POLICY IF EXISTS "Users can insert their own todos" ON public.user_todos;
DROP POLICY IF EXISTS "Users can update their own todos" ON public.user_todos;
DROP POLICY IF EXISTS "Users can delete their own todos" ON public.user_todos;
CREATE POLICY "Users can view their own todos" ON public.user_todos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own todos" ON public.user_todos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own todos" ON public.user_todos FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own todos" ON public.user_todos FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own notes" ON public.user_schedule_notes;
DROP POLICY IF EXISTS "Users can insert their own notes" ON public.user_schedule_notes;
DROP POLICY IF EXISTS "Users can update their own notes" ON public.user_schedule_notes;
DROP POLICY IF EXISTS "Users can delete their own notes" ON public.user_schedule_notes;
CREATE POLICY "Users can view their own notes" ON public.user_schedule_notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own notes" ON public.user_schedule_notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own notes" ON public.user_schedule_notes FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own notes" ON public.user_schedule_notes FOR DELETE USING (auth.uid() = user_id);

-- ── 20. SEED METADATA FOR APTITUDE & PLACEMENT PREP ──────────────────
INSERT INTO public.aptitude_categories (id, category_name, slug, description, icon_name)
VALUES
    (1, 'Quantitative Aptitude', 'quantitative-aptitude', 'Maths, arithmetic, numerical ability & problem solving for placements.', 'Calculator'),
    (2, 'Logical Reasoning', 'logical-reasoning', 'Puzzles, arrangements, blood relations, and analytical reasoning.', 'Brain'),
    (3, 'Verbal Ability', 'verbal-ability', 'English grammar, vocabulary, reading comprehension, and error spot.', 'BookOpen')
ON CONFLICT (id) DO UPDATE SET
    category_name = EXCLUDED.category_name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    icon_name = EXCLUDED.icon_name;

INSERT INTO public.aptitude_topics (id, category_id, topic_name, slug, total_questions, default_timer_seconds)
VALUES
    (1, 1, 'Percentages', 'percentages', 41, 60),
    (2, 1, 'Profit & Loss', 'profit-loss', 38, 60),
    (3, 1, 'Time & Work', 'time-work', 42, 60),
    (4, 1, 'Time, Speed & Distance', 'time-speed-distance', 50, 60),
    (5, 1, 'Probability', 'probability', 30, 60),
    (6, 1, 'Permutations & Combinations', 'permutations-combinations', 35, 60)
ON CONFLICT (id) DO UPDATE SET
    category_id = EXCLUDED.category_id,
    topic_name = EXCLUDED.topic_name,
    slug = EXCLUDED.slug,
    total_questions = EXCLUDED.total_questions,
    default_timer_seconds = EXCLUDED.default_timer_seconds;

-- ── 15. WELCOME EMAIL EVENTS (DURABLE ONE-TIME DISPATCH) ──────────────
CREATE TABLE IF NOT EXISTS public.welcome_email_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'sent', 'failed')),
    attempts INTEGER NOT NULL DEFAULT 0,
    resend_id TEXT NULL,
    last_error TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    processing_until TIMESTAMPTZ NULL,
    sent_at TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS idx_welcome_email_events_user_id 
    ON public.welcome_email_events(user_id);

CREATE INDEX IF NOT EXISTS idx_welcome_email_events_status_lease 
    ON public.welcome_email_events(status, processing_until);

ALTER TABLE public.welcome_email_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access on welcome_email_events" ON public.welcome_email_events;
CREATE POLICY "Service role full access on welcome_email_events" 
    ON public.welcome_email_events FOR ALL 
    TO service_role 
    USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view their own welcome_email_events" ON public.welcome_email_events;
CREATE POLICY "Users can view their own welcome_email_events" 
    ON public.welcome_email_events FOR SELECT 
    TO authenticated 
    USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.handle_welcome_email_on_signup()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.welcome_email_events (user_id, email, status, created_at, updated_at)
    VALUES (
        NEW.id,
        COALESCE(NEW.email, ''),
        'pending',
        NOW(),
        NOW()
    )
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_welcome_email_on_signup ON auth.users;
CREATE TRIGGER trg_welcome_email_on_signup
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_welcome_email_on_signup();

