-- ====================================================================
-- SKILLSCATALYST - MASTER CONSOLIDATED PRODUCTION SUPABASE SQL SCHEMA
-- ====================================================================
-- Single, fully-consolidated, idempotent database schema for SkillsCatalyst.
-- Provisions all tables, indexes, RPC security functions, triggers, and
-- production-hardened RLS policies. Safe to execute in Supabase SQL Editor.
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
-- 16. Welcome Email Events & Durable Signup Triggers
-- 17. Reusable updated_at & Synchronization Triggers
-- 18. Stored Procedures & Security Definer RPC Functions
-- 19. Seed Metadata for Placement Prep
-- 20. Production-Hardened Permissions (Least-Privilege Anon SELECT, Full Auth/Service CRUD)
-- 21. Row Level Security (RLS) Strict Tenant Isolation Policies
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

-- ── 17. WELCOME EMAIL EVENTS (DURABLE ONE-TIME DISPATCH) ──────────────
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

-- ── 18. STORED PROCEDURES & DATABASE FUNCTIONS ───────────────────────

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

-- D. Automatic Practice Progress Trigger Function
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

-- E. Automatic Signup Trigger for New Users (Welcome Email Events)
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

-- ── 19. ZERO-BASELINE PROGRESS INITIALIZATION ────────────────────────
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

-- ── 21. PRODUCTION TABLE-LEVEL PERMISSIONS (FIX FOR POSTGRESQL 42501) ───
-- anon receives SELECT ONLY on user-specific tables to eliminate 42501 on reads.
-- anon has ZERO INSERT, UPDATE, or DELETE permissions on user tables.
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

GRANT SELECT ON public.user_academic_profile TO anon;
GRANT SELECT ON public.user_coding_profiles TO anon;
GRANT SELECT ON public.user_progress TO anon;
GRANT SELECT ON public.leetcode_progress TO anon;
GRANT SELECT ON public.roadmap_progress TO anon;
GRANT SELECT ON public.resume_scores TO anon;
GRANT SELECT ON public.saved_playlists TO anon;
GRANT SELECT ON public.video_progress TO anon;
GRANT SELECT ON public.learning_progress TO anon;
GRANT SELECT ON public.user_todos TO anon;
GRANT SELECT ON public.user_schedule_notes TO anon;
GRANT SELECT ON public.welcome_email_events TO anon;
GRANT SELECT, INSERT ON public.user_feedback TO anon;

GRANT SELECT ON public.skills_cache TO anon;
GRANT SELECT ON public.trust_score_engine TO anon;
GRANT SELECT ON public.aptitude_categories TO anon;
GRANT SELECT ON public.aptitude_topics TO anon;
GRANT SELECT ON public.aptitude_questions TO anon;
GRANT SELECT ON public.user_aptitude_attempts TO anon;
GRANT SELECT ON public.user_quiz_results TO anon;

-- authenticated and service_role receive required CRUD privileges
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_academic_profile TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_coding_profiles TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_progress TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leetcode_progress TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.roadmap_progress TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.resume_scores TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_playlists TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.video_progress TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.learning_progress TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_todos TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_schedule_notes TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.welcome_email_events TO authenticated, service_role;
GRANT SELECT, INSERT ON public.user_feedback TO authenticated, service_role;

GRANT ALL ON public.skills_cache TO authenticated, service_role;
GRANT ALL ON public.trust_score_engine TO authenticated, service_role;
GRANT ALL ON public.aptitude_categories TO authenticated, service_role;
GRANT ALL ON public.aptitude_topics TO authenticated, service_role;
GRANT ALL ON public.aptitude_questions TO authenticated, service_role;
GRANT ALL ON public.user_aptitude_attempts TO authenticated, service_role;
GRANT ALL ON public.user_quiz_results TO authenticated, service_role;

-- Grant sequence usages to prevent serial ID exhaustion errors
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- Grant execution on stored procedures
GRANT EXECUTE ON FUNCTION public.record_daily_login(UUID) TO authenticated, service_role, anon;
GRANT EXECUTE ON FUNCTION public.recalculate_user_level(UUID) TO authenticated, service_role, anon;
GRANT EXECUTE ON FUNCTION public.upsert_user_aptitude_attempt(UUID, INTEGER, INTEGER, INTEGER, BOOLEAN, INTEGER) TO authenticated, service_role;

-- ── 22. ROW LEVEL SECURITY (RLS) POLICIES ────────────────────────────
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
ALTER TABLE public.welcome_email_events ENABLE ROW LEVEL SECURITY;

-- Strict User Ownership Policies (Authenticated users access auth.uid() rows only)

-- user_academic_profile
DROP POLICY IF EXISTS "Service role access on user_academic_profile" ON public.user_academic_profile;
DROP POLICY IF EXISTS "Strict user ownership on user_academic_profile" ON public.user_academic_profile;
CREATE POLICY "Service role access on user_academic_profile" ON public.user_academic_profile FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Strict user ownership on user_academic_profile" ON public.user_academic_profile FOR ALL TO authenticated USING (user_id IS NOT NULL AND auth.uid()::text = user_id::text) WITH CHECK (user_id IS NOT NULL AND auth.uid()::text = user_id::text);

-- user_coding_profiles
DROP POLICY IF EXISTS "Service role access on user_coding_profiles" ON public.user_coding_profiles;
DROP POLICY IF EXISTS "Strict user ownership on user_coding_profiles" ON public.user_coding_profiles;
CREATE POLICY "Service role access on user_coding_profiles" ON public.user_coding_profiles FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Strict user ownership on user_coding_profiles" ON public.user_coding_profiles FOR ALL TO authenticated USING (user_id IS NOT NULL AND auth.uid()::text = user_id::text) WITH CHECK (user_id IS NOT NULL AND auth.uid()::text = user_id::text);

-- user_progress
DROP POLICY IF EXISTS "Service role access on user_progress" ON public.user_progress;
DROP POLICY IF EXISTS "Strict user ownership on user_progress" ON public.user_progress;
CREATE POLICY "Service role access on user_progress" ON public.user_progress FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Strict user ownership on user_progress" ON public.user_progress FOR ALL TO authenticated USING (user_id IS NOT NULL AND auth.uid()::text = user_id::text) WITH CHECK (user_id IS NOT NULL AND auth.uid()::text = user_id::text);

-- leetcode_progress
DROP POLICY IF EXISTS "Service role access on leetcode_progress" ON public.leetcode_progress;
DROP POLICY IF EXISTS "Strict user ownership on leetcode_progress" ON public.leetcode_progress;
CREATE POLICY "Service role access on leetcode_progress" ON public.leetcode_progress FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Strict user ownership on leetcode_progress" ON public.leetcode_progress FOR ALL TO authenticated USING (user_id IS NOT NULL AND auth.uid()::text = user_id::text) WITH CHECK (user_id IS NOT NULL AND auth.uid()::text = user_id::text);

-- roadmap_progress
DROP POLICY IF EXISTS "Service role access on roadmap_progress" ON public.roadmap_progress;
DROP POLICY IF EXISTS "Strict user ownership on roadmap_progress" ON public.roadmap_progress;
CREATE POLICY "Service role access on roadmap_progress" ON public.roadmap_progress FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Strict user ownership on roadmap_progress" ON public.roadmap_progress FOR ALL TO authenticated USING (user_id IS NOT NULL AND auth.uid()::text = user_id::text) WITH CHECK (user_id IS NOT NULL AND auth.uid()::text = user_id::text);

-- resume_scores
DROP POLICY IF EXISTS "Service role access on resume_scores" ON public.resume_scores;
DROP POLICY IF EXISTS "Strict user ownership on resume_scores" ON public.resume_scores;
CREATE POLICY "Service role access on resume_scores" ON public.resume_scores FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Strict user ownership on resume_scores" ON public.resume_scores FOR ALL TO authenticated USING (user_id IS NOT NULL AND auth.uid()::text = user_id::text) WITH CHECK (user_id IS NOT NULL AND auth.uid()::text = user_id::text);

-- saved_playlists
DROP POLICY IF EXISTS "Service role access on saved_playlists" ON public.saved_playlists;
DROP POLICY IF EXISTS "Strict user ownership on saved_playlists" ON public.saved_playlists;
CREATE POLICY "Service role access on saved_playlists" ON public.saved_playlists FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Strict user ownership on saved_playlists" ON public.saved_playlists FOR ALL TO authenticated USING (user_id IS NOT NULL AND auth.uid()::text = user_id::text) WITH CHECK (user_id IS NOT NULL AND auth.uid()::text = user_id::text);

-- video_progress
DROP POLICY IF EXISTS "Service role access on video_progress" ON public.video_progress;
DROP POLICY IF EXISTS "Strict user ownership on video_progress" ON public.video_progress;
CREATE POLICY "Service role access on video_progress" ON public.video_progress FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Strict user ownership on video_progress" ON public.video_progress FOR ALL TO authenticated USING (user_id IS NOT NULL AND auth.uid()::text = user_id::text) WITH CHECK (user_id IS NOT NULL AND auth.uid()::text = user_id::text);

-- learning_progress (Strict authenticated ownership only; guests mediated via backend service_role)
DROP POLICY IF EXISTS "Service role full access on learning_progress" ON public.learning_progress;
DROP POLICY IF EXISTS "Strict user ownership on learning_progress" ON public.learning_progress;
DROP POLICY IF EXISTS "Guest session access on learning_progress" ON public.learning_progress;
CREATE POLICY "Service role full access on learning_progress" ON public.learning_progress FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Strict user ownership on learning_progress" ON public.learning_progress FOR ALL TO authenticated USING (user_id IS NOT NULL AND auth.uid()::text = user_id::text) WITH CHECK (user_id IS NOT NULL AND auth.uid()::text = user_id::text);

-- user_feedback
DROP POLICY IF EXISTS "Service role access on user_feedback" ON public.user_feedback;
DROP POLICY IF EXISTS "Authenticated insert on user_feedback" ON public.user_feedback;
CREATE POLICY "Service role access on user_feedback" ON public.user_feedback FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated insert on user_feedback" ON public.user_feedback FOR INSERT TO authenticated WITH CHECK (user_id IS NOT NULL AND auth.uid()::text = user_id::text);

-- skills_cache (Public Read)
DROP POLICY IF EXISTS "Allow read skills_cache" ON public.skills_cache;
CREATE POLICY "Allow read skills_cache" ON public.skills_cache FOR SELECT USING (true);

-- trust_score_engine (Public Read)
DROP POLICY IF EXISTS "Allow read trust_score_engine" ON public.trust_score_engine;
CREATE POLICY "Allow read trust_score_engine" ON public.trust_score_engine FOR SELECT USING (true);

-- aptitude_categories (Public Read)
DROP POLICY IF EXISTS "Public read aptitude categories" ON public.aptitude_categories;
CREATE POLICY "Public read aptitude categories" ON public.aptitude_categories FOR SELECT USING (true);

-- aptitude_topics (Public Read)
DROP POLICY IF EXISTS "Public read aptitude topics" ON public.aptitude_topics;
CREATE POLICY "Public read aptitude topics" ON public.aptitude_topics FOR SELECT USING (true);

-- aptitude_questions (Public Read)
DROP POLICY IF EXISTS "Public read aptitude questions" ON public.aptitude_questions;
CREATE POLICY "Public read aptitude questions" ON public.aptitude_questions FOR SELECT USING (true);

-- user_aptitude_attempts
DROP POLICY IF EXISTS "Users view own attempts" ON public.user_aptitude_attempts;
DROP POLICY IF EXISTS "Users insert own attempts" ON public.user_aptitude_attempts;
CREATE POLICY "Users view own attempts" ON public.user_aptitude_attempts FOR SELECT TO authenticated USING (user_id IS NOT NULL AND auth.uid()::text = user_id::text);
CREATE POLICY "Users insert own attempts" ON public.user_aptitude_attempts FOR INSERT TO authenticated WITH CHECK (user_id IS NOT NULL AND auth.uid()::text = user_id::text);

-- user_quiz_results
DROP POLICY IF EXISTS "Users view own quiz results" ON public.user_quiz_results;
DROP POLICY IF EXISTS "Users insert own quiz results" ON public.user_quiz_results;
CREATE POLICY "Users view own quiz results" ON public.user_quiz_results FOR SELECT TO authenticated USING (user_id IS NOT NULL AND auth.uid()::text = user_id::text);
CREATE POLICY "Users insert own quiz results" ON public.user_quiz_results FOR INSERT TO authenticated WITH CHECK (user_id IS NOT NULL AND auth.uid()::text = user_id::text);

-- user_todos
DROP POLICY IF EXISTS "Users can view their own todos" ON public.user_todos;
DROP POLICY IF EXISTS "Users can insert their own todos" ON public.user_todos;
DROP POLICY IF EXISTS "Users can update their own todos" ON public.user_todos;
DROP POLICY IF EXISTS "Users can delete their own todos" ON public.user_todos;
CREATE POLICY "Users can view their own todos" ON public.user_todos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own todos" ON public.user_todos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own todos" ON public.user_todos FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own todos" ON public.user_todos FOR DELETE USING (auth.uid() = user_id);

-- user_schedule_notes
DROP POLICY IF EXISTS "Users can view their own notes" ON public.user_schedule_notes;
DROP POLICY IF EXISTS "Users can insert their own notes" ON public.user_schedule_notes;
DROP POLICY IF EXISTS "Users can update their own notes" ON public.user_schedule_notes;
DROP POLICY IF EXISTS "Users can delete their own notes" ON public.user_schedule_notes;
CREATE POLICY "Users can view their own notes" ON public.user_schedule_notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own notes" ON public.user_schedule_notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own notes" ON public.user_schedule_notes FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own notes" ON public.user_schedule_notes FOR DELETE USING (auth.uid() = user_id);

-- welcome_email_events
DROP POLICY IF EXISTS "Service role full access on welcome_email_events" ON public.welcome_email_events;
DROP POLICY IF EXISTS "Users can view their own welcome_email_events" ON public.welcome_email_events;
CREATE POLICY "Service role full access on welcome_email_events" ON public.welcome_email_events FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Users can view their own welcome_email_events" ON public.welcome_email_events FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- ====================================================================
-- 20. SKILLBITS - SHORT-FORM EDUCATIONAL VIDEO LEARNING SYSTEM
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.skillbits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    topic VARCHAR(100),
    difficulty VARCHAR(32) NOT NULL DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    duration_seconds INTEGER CHECK (duration_seconds IS NULL OR duration_seconds > 0),
    thumbnail_url TEXT,
    video_provider VARCHAR(32) CHECK (video_provider IN ('mux')),
    video_asset_id VARCHAR(255),
    playback_id VARCHAR(255),
    status VARCHAR(32) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    video_status VARCHAR(32) NOT NULL DEFAULT 'NOT_UPLOADED' CHECK (video_status IN ('NOT_UPLOADED', 'UPLOADING', 'PROCESSING', 'READY', 'ERROR')),
    mux_upload_id VARCHAR(255),
    published_at TIMESTAMPTZ,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.skillbit_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    skillbit_id UUID NOT NULL REFERENCES public.skillbits(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES public.skills_cache(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(skillbit_id, skill_id)
);

CREATE TABLE IF NOT EXISTS public.user_skillbit_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    skillbit_id UUID NOT NULL REFERENCES public.skillbits(id) ON DELETE CASCADE,
    watched_seconds NUMERIC(8, 2) NOT NULL DEFAULT 0.0 CHECK (watched_seconds >= 0),
    completion_percentage NUMERIC(5, 2) NOT NULL DEFAULT 0.0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
    last_position_seconds NUMERIC(8, 2) NOT NULL DEFAULT 0.0 CHECK (last_position_seconds >= 0),
    started BOOLEAN NOT NULL DEFAULT FALSE,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    started_at TIMESTAMPTZ,
    last_watched_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_user_skillbit UNIQUE (user_id, skillbit_id)
);

-- Performance & Discovery Indexes
CREATE INDEX IF NOT EXISTS idx_skillbits_status_published ON public.skillbits(status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_skillbits_topic ON public.skillbits(topic);
CREATE INDEX IF NOT EXISTS idx_skillbits_difficulty ON public.skillbits(difficulty);
CREATE INDEX IF NOT EXISTS idx_skillbits_created_at ON public.skillbits(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_skillbits_updated_at ON public.skillbits(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_skillbits_video_status ON public.skillbits(video_status);
CREATE INDEX IF NOT EXISTS idx_skillbits_status_topic ON public.skillbits(status, topic);
CREATE INDEX IF NOT EXISTS idx_skillbits_status_difficulty ON public.skillbits(status, difficulty);
CREATE INDEX IF NOT EXISTS idx_skillbits_title ON public.skillbits(title);
CREATE INDEX IF NOT EXISTS idx_skillbits_mux_upload_id ON public.skillbits(mux_upload_id) WHERE mux_upload_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_skillbit_skills_lookup ON public.skillbit_skills(skillbit_id);
CREATE INDEX IF NOT EXISTS idx_user_skillbit_progress_user ON public.user_skillbit_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_skillbit_progress_bit ON public.user_skillbit_progress(skillbit_id);

-- RLS
ALTER TABLE public.skillbits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skillbit_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skillbit_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view published skillbits" ON public.skillbits;
CREATE POLICY "Public can view published skillbits" ON public.skillbits
    FOR SELECT USING (status = 'published');

DROP POLICY IF EXISTS "Admins full management of skillbits" ON public.skillbits;
CREATE POLICY "Admins full management of skillbits" ON public.skillbits
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = auth.uid() AND (auth.users.raw_app_meta_data->>'role' IN ('owner', 'admin', 'editor'))))
    WITH CHECK (EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = auth.uid() AND (auth.users.raw_app_meta_data->>'role' IN ('owner', 'admin', 'editor'))));

DROP POLICY IF EXISTS "Public can view skillbit skills" ON public.skillbit_skills;
CREATE POLICY "Public can view skillbit skills" ON public.skillbit_skills FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can read own skillbit progress" ON public.user_skillbit_progress;
CREATE POLICY "Users can read own skillbit progress" ON public.user_skillbit_progress
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can mutate own skillbit progress" ON public.user_skillbit_progress;
CREATE POLICY "Users can mutate own skillbit progress" ON public.user_skillbit_progress
    FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ====================================================================
-- 21. COURSE SYSTEM - PHASE 1: FOUNDATION + MODULE QUIZ FOUNDATION
-- ====================================================================

-- courses
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    short_description TEXT NULL,
    description TEXT NULL,
    thumbnail_url TEXT NULL,
    category TEXT NULL,
    difficulty TEXT NOT NULL,
    estimated_duration_minutes INTEGER NULL,
    status TEXT NOT NULL DEFAULT 'DRAFT',
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    published_at TIMESTAMPTZ NULL,
    archived_at TIMESTAMPTZ NULL,
    CONSTRAINT chk_courses_title_length CHECK (char_length(title) >= 1 AND char_length(title) <= 255),
    CONSTRAINT chk_courses_slug_length CHECK (char_length(slug) >= 1 AND char_length(slug) <= 255),
    CONSTRAINT chk_courses_short_desc_length CHECK (short_description IS NULL OR char_length(short_description) <= 1000),
    CONSTRAINT chk_courses_difficulty CHECK (lower(difficulty) IN ('beginner', 'intermediate', 'advanced')),
    CONSTRAINT chk_courses_duration CHECK (estimated_duration_minutes IS NULL OR estimated_duration_minutes >= 0),
    CONSTRAINT chk_courses_status CHECK (status IN ('DRAFT', 'IN_REVIEW', 'PUBLISHED', 'ARCHIVED'))
);

-- course_modules
CREATE TABLE IF NOT EXISTS public.course_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NULL,
    position INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_course_modules_title_length CHECK (char_length(title) >= 1 AND char_length(title) <= 255),
    CONSTRAINT chk_course_modules_position CHECK (position >= 1),
    CONSTRAINT uq_course_modules_course_position UNIQUE (course_id, position) DEFERRABLE INITIALLY IMMEDIATE
);

-- course_lessons (metadata only)
CREATE TABLE IF NOT EXISTS public.course_lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID NOT NULL REFERENCES public.course_modules(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT NULL,
    short_description TEXT NULL,
    position INTEGER NOT NULL DEFAULT 1,
    estimated_duration_minutes INTEGER NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_course_lessons_title_length CHECK (char_length(title) >= 1 AND char_length(title) <= 255),
    CONSTRAINT chk_course_lessons_position CHECK (position >= 1),
    CONSTRAINT chk_course_lessons_duration CHECK (estimated_duration_minutes IS NULL OR estimated_duration_minutes >= 0),
    CONSTRAINT uq_course_lessons_module_position UNIQUE (module_id, position) DEFERRABLE INITIALLY IMMEDIATE
);

-- course_quizzes (one quiz per module)
CREATE TABLE IF NOT EXISTS public.course_quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID NOT NULL REFERENCES public.course_modules(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NULL,
    status TEXT NOT NULL DEFAULT 'DRAFT',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_course_quizzes_title_length CHECK (char_length(title) >= 1 AND char_length(title) <= 255),
    CONSTRAINT chk_course_quizzes_status CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
    CONSTRAINT uq_course_quizzes_module_id UNIQUE (module_id)
);

-- quiz_questions
CREATE TABLE IF NOT EXISTS public.quiz_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL REFERENCES public.course_quizzes(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type TEXT NOT NULL DEFAULT 'SINGLE_SELECT',
    position INTEGER NOT NULL DEFAULT 1,
    explanation TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_quiz_questions_text_length CHECK (char_length(question_text) >= 1),
    CONSTRAINT chk_quiz_questions_type CHECK (question_type IN ('SINGLE_SELECT', 'MULTI_SELECT', 'TRUE_FALSE')),
    CONSTRAINT chk_quiz_questions_position CHECK (position >= 1),
    CONSTRAINT uq_quiz_questions_quiz_position UNIQUE (quiz_id, position) DEFERRABLE INITIALLY IMMEDIATE
);

-- quiz_options
CREATE TABLE IF NOT EXISTS public.quiz_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT false,
    position INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_quiz_options_text_length CHECK (char_length(option_text) >= 1),
    CONSTRAINT chk_quiz_options_position CHECK (position >= 1),
    CONSTRAINT uq_quiz_options_question_position UNIQUE (question_id, position) DEFERRABLE INITIALLY IMMEDIATE
);

-- audit_logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    user_id UUID NULL,
    details JSONB NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_courses_status ON public.courses(status);
CREATE INDEX IF NOT EXISTS idx_courses_category ON public.courses(category);
CREATE INDEX IF NOT EXISTS idx_courses_difficulty ON public.courses(difficulty);
CREATE INDEX IF NOT EXISTS idx_courses_created_at ON public.courses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_courses_slug ON public.courses(slug);

CREATE INDEX IF NOT EXISTS idx_course_modules_course_id ON public.course_modules(course_id);
CREATE INDEX IF NOT EXISTS idx_course_modules_course_pos ON public.course_modules(course_id, position);

CREATE INDEX IF NOT EXISTS idx_course_lessons_module_id ON public.course_lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_course_lessons_module_pos ON public.course_lessons(module_id, position);

CREATE INDEX IF NOT EXISTS idx_course_quizzes_module_id ON public.course_quizzes(module_id);

CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_id ON public.quiz_questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_pos ON public.quiz_questions(quiz_id, position);

CREATE INDEX IF NOT EXISTS idx_quiz_options_question_id ON public.quiz_options(question_id);
CREATE INDEX IF NOT EXISTS idx_quiz_options_question_pos ON public.quiz_options(question_id, position);

CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- Triggers
DROP TRIGGER IF EXISTS trg_courses_updated_at ON public.courses;
CREATE TRIGGER trg_courses_updated_at BEFORE UPDATE ON public.courses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_course_modules_updated_at ON public.course_modules;
CREATE TRIGGER trg_course_modules_updated_at BEFORE UPDATE ON public.course_modules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_course_lessons_updated_at ON public.course_lessons;
CREATE TRIGGER trg_course_lessons_updated_at BEFORE UPDATE ON public.course_lessons FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_course_quizzes_updated_at ON public.course_quizzes;
CREATE TRIGGER trg_course_quizzes_updated_at BEFORE UPDATE ON public.course_quizzes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_quiz_questions_updated_at ON public.quiz_questions;
CREATE TRIGGER trg_quiz_questions_updated_at BEFORE UPDATE ON public.quiz_questions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_quiz_options_updated_at ON public.quiz_options;
CREATE TRIGGER trg_quiz_options_updated_at BEFORE UPDATE ON public.quiz_options FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view published courses" ON public.courses;
CREATE POLICY "Public can view published courses" ON public.courses FOR SELECT TO public USING (status = 'PUBLISHED');

DROP POLICY IF EXISTS "Admins can manage courses" ON public.courses;
CREATE POLICY "Admins can manage courses" ON public.courses FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('owner', 'admin', 'editor')) OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('owner', 'admin', 'editor'))
    WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('owner', 'admin', 'editor')) OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('owner', 'admin', 'editor'));

DROP POLICY IF EXISTS "Service role full access on courses" ON public.courses;
CREATE POLICY "Service role full access on courses" ON public.courses FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view published course modules" ON public.course_modules;
CREATE POLICY "Public can view published course modules" ON public.course_modules FOR SELECT TO public
    USING (EXISTS (SELECT 1 FROM public.courses WHERE courses.id = course_modules.course_id AND courses.status = 'PUBLISHED'));

DROP POLICY IF EXISTS "Admins can manage course modules" ON public.course_modules;
CREATE POLICY "Admins can manage course modules" ON public.course_modules FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('owner', 'admin', 'editor')) OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('owner', 'admin', 'editor'))
    WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('owner', 'admin', 'editor')) OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('owner', 'admin', 'editor'));

DROP POLICY IF EXISTS "Service role full access on course modules" ON public.course_modules;
CREATE POLICY "Service role full access on course modules" ON public.course_modules FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view published course lessons" ON public.course_lessons;
CREATE POLICY "Public can view published course lessons" ON public.course_lessons FOR SELECT TO public
    USING (EXISTS (SELECT 1 FROM public.course_modules JOIN public.courses ON courses.id = course_modules.course_id WHERE course_modules.id = course_lessons.module_id AND courses.status = 'PUBLISHED'));

DROP POLICY IF EXISTS "Admins can manage course lessons" ON public.course_lessons;
CREATE POLICY "Admins can manage course lessons" ON public.course_lessons FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('owner', 'admin', 'editor')) OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('owner', 'admin', 'editor'))
    WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('owner', 'admin', 'editor')) OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('owner', 'admin', 'editor'));

DROP POLICY IF EXISTS "Service role full access on course lessons" ON public.course_lessons;
CREATE POLICY "Service role full access on course lessons" ON public.course_lessons FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view published course quizzes" ON public.course_quizzes;
CREATE POLICY "Public can view published course quizzes" ON public.course_quizzes FOR SELECT TO public
    USING (EXISTS (SELECT 1 FROM public.course_modules JOIN public.courses ON courses.id = course_modules.course_id WHERE course_modules.id = course_quizzes.module_id AND courses.status = 'PUBLISHED' AND course_quizzes.status = 'PUBLISHED'));

DROP POLICY IF EXISTS "Admins can manage course quizzes" ON public.course_quizzes;
CREATE POLICY "Admins can manage course quizzes" ON public.course_quizzes FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('owner', 'admin', 'editor')) OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('owner', 'admin', 'editor'))
    WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('owner', 'admin', 'editor')) OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('owner', 'admin', 'editor'));

DROP POLICY IF EXISTS "Service role full access on course quizzes" ON public.course_quizzes;
CREATE POLICY "Service role full access on course quizzes" ON public.course_quizzes FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view published quiz questions" ON public.quiz_questions;
CREATE POLICY "Public can view published quiz questions" ON public.quiz_questions FOR SELECT TO public
    USING (EXISTS (SELECT 1 FROM public.course_quizzes JOIN public.course_modules ON course_modules.id = course_quizzes.module_id JOIN public.courses ON courses.id = course_modules.course_id WHERE course_quizzes.id = quiz_questions.quiz_id AND courses.status = 'PUBLISHED' AND course_quizzes.status = 'PUBLISHED'));

DROP POLICY IF EXISTS "Admins can manage quiz questions" ON public.quiz_questions;
CREATE POLICY "Admins can manage quiz questions" ON public.quiz_questions FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('owner', 'admin', 'editor')) OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('owner', 'admin', 'editor'))
    WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('owner', 'admin', 'editor')) OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('owner', 'admin', 'editor'));

DROP POLICY IF EXISTS "Service role full access on quiz questions" ON public.quiz_questions;
CREATE POLICY "Service role full access on quiz questions" ON public.quiz_questions FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view published quiz options" ON public.quiz_options;
CREATE POLICY "Public can view published quiz options" ON public.quiz_options FOR SELECT TO public
    USING (EXISTS (SELECT 1 FROM public.quiz_questions JOIN public.course_quizzes ON course_quizzes.id = quiz_questions.quiz_id JOIN public.course_modules ON course_modules.id = course_quizzes.module_id JOIN public.courses ON courses.id = course_modules.course_id WHERE quiz_questions.id = quiz_options.question_id AND courses.status = 'PUBLISHED' AND course_quizzes.status = 'PUBLISHED'));

DROP POLICY IF EXISTS "Admins can manage quiz options" ON public.quiz_options;
CREATE POLICY "Admins can manage quiz options" ON public.quiz_options FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('owner', 'admin', 'editor')) OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('owner', 'admin', 'editor'))
    WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('owner', 'admin', 'editor')) OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('owner', 'admin', 'editor'));

DROP POLICY IF EXISTS "Service role full access on quiz options" ON public.quiz_options;
CREATE POLICY "Service role full access on quiz options" ON public.quiz_options FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;
CREATE POLICY "Admins can view audit logs" ON public.audit_logs FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('owner', 'admin', 'editor')) OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('owner', 'admin', 'editor'));

DROP POLICY IF EXISTS "Service role full access on audit logs" ON public.audit_logs;
CREATE POLICY "Service role full access on audit logs" ON public.audit_logs FOR ALL TO service_role USING (true) WITH CHECK (true);

GRANT SELECT ON TABLE public.courses TO anon, authenticated;
GRANT SELECT ON TABLE public.course_modules TO anon, authenticated;
GRANT SELECT ON TABLE public.course_lessons TO anon, authenticated;
GRANT SELECT ON TABLE public.course_quizzes TO anon, authenticated;
GRANT SELECT ON TABLE public.quiz_questions TO anon, authenticated;
GRANT SELECT ON TABLE public.quiz_options TO anon, authenticated;

GRANT ALL ON TABLE public.courses TO service_role;
GRANT ALL ON TABLE public.course_modules TO service_role;
GRANT ALL ON TABLE public.course_lessons TO service_role;
GRANT ALL ON TABLE public.course_quizzes TO service_role;
GRANT ALL ON TABLE public.quiz_questions TO service_role;
GRANT ALL ON TABLE public.quiz_options TO service_role;
GRANT ALL ON TABLE public.audit_logs TO service_role;

-- ── 23. COURSE LESSON CONTENTS (PHASE 2A) ────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.course_lesson_contents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID NOT NULL REFERENCES public.course_lessons(id) ON DELETE CASCADE,
    schema_version INTEGER NOT NULL DEFAULT 1,
    blocks JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_course_lesson_contents_lesson_id UNIQUE (lesson_id),
    CONSTRAINT chk_course_lesson_contents_schema_version CHECK (schema_version >= 1)
);

CREATE INDEX IF NOT EXISTS idx_course_lesson_contents_lesson_id ON public.course_lesson_contents (lesson_id);
CREATE INDEX IF NOT EXISTS idx_course_lesson_contents_blocks_gin ON public.course_lesson_contents USING GIN (blocks);

ALTER TABLE public.course_lesson_contents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view published lesson contents" ON public.course_lesson_contents;
CREATE POLICY "Public can view published lesson contents" ON public.course_lesson_contents FOR SELECT TO public
    USING (EXISTS (SELECT 1 FROM public.course_lessons cl JOIN public.course_modules cm ON cm.id = cl.module_id JOIN public.courses c ON c.id = cm.course_id WHERE cl.id = course_lesson_contents.lesson_id AND c.status = 'PUBLISHED'));

DROP POLICY IF EXISTS "Admins can manage lesson contents" ON public.course_lesson_contents;
CREATE POLICY "Admins can manage lesson contents" ON public.course_lesson_contents FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('owner', 'admin', 'editor')) OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('owner', 'admin', 'editor'))
    WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('owner', 'admin', 'editor')) OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('owner', 'admin', 'editor'));

DROP POLICY IF EXISTS "Service role full access on lesson contents" ON public.course_lesson_contents;
CREATE POLICY "Service role full access on lesson contents" ON public.course_lesson_contents FOR ALL TO service_role USING (true) WITH CHECK (true);

GRANT SELECT ON TABLE public.course_lesson_contents TO anon, authenticated;
GRANT ALL ON TABLE public.course_lesson_contents TO service_role;


