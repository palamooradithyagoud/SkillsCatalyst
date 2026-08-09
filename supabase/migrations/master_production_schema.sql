-- ====================================================================
-- SKILLSCATALYST - MASTER CONSOLIDATED PRODUCTION SUPABASE SQL SCHEMA
-- ====================================================================
-- Single, fully-consolidated, idempotent database schema for SkillsCatalyst.
-- Provisions all tables, indexes, RPC security functions, triggers, and
-- production-hardened RLS policies. Safe to execute in Supabase SQL Editor.
-- ====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── 1. ACADEMIC & INSTITUTIONAL PROFILE ──────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_academic_profile (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT DEFAULT '',
    college TEXT DEFAULT '',
    department TEXT DEFAULT '',
    academic_year TEXT DEFAULT '',
    target_role TEXT DEFAULT '',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 2. CODING PROFILES & EXTRACTED STATS ─────────────────────────────
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

-- ── 3. USER OVERALL PROGRESS & STATS ─────────────────────────────────
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

-- ── 4. LEETCODE & COMPANY-WISE PRACTICE PROGRESS ─────────────────────
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

-- ── 5. ROADMAP PROGRESS CHECKLIST ────────────────────────────────────
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

-- ── 6. RESUME SCORES & AI REVIEW HISTORY ─────────────────────────────
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

-- ── 7. SAVED PLAYLISTS (RELATIONAL TABLE) ────────────────────────────
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

-- ── 8. VIDEO WATCH PROGRESS (RELATIONAL TABLE) ───────────────────────
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

-- ── 9. LEARNING PROGRESS TABLE (JSONB Storage) ──────────────────────
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

-- ── 10. SKILLS CACHE TABLE ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.skills_cache (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    skill_name      TEXT NOT NULL UNIQUE,
    roadmap_json    JSONB DEFAULT '{}'::jsonb,
    playlists_json  JSONB DEFAULT '[]'::jsonb,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── 11. TRUST SCORE ENGINE TABLE ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.trust_score_engine (
    url             TEXT PRIMARY KEY,
    trust_score     NUMERIC(5,2) DEFAULT 50.00,
    clicks          INTEGER DEFAULT 0,
    saves           INTEGER DEFAULT 0,
    ignores         INTEGER DEFAULT 0,
    completions     INTEGER DEFAULT 0,
    last_updated    TIMESTAMPTZ DEFAULT NOW()
);

-- ── 12. USER FEEDBACK / EVENT ANALYTICS TABLE ───────────────────────
CREATE TABLE IF NOT EXISTS public.user_feedback (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         TEXT NOT NULL,
    action          TEXT NOT NULL,
    resource_url    TEXT,
    metadata        JSONB DEFAULT '{}'::jsonb,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_feedback_user ON public.user_feedback(user_id);

-- ── 13. PLACEMENT & QUANTITATIVE APTITUDE TABLES ────────────────────
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

-- ── 14. REUSABLE UPDATED_AT TRIGGER FUNCTION ────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS trg_set_updated_at_user_academic ON public.user_academic_profile;
CREATE TRIGGER trg_set_updated_at_user_academic BEFORE UPDATE ON public.user_academic_profile FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_set_updated_at_user_coding ON public.user_coding_profiles;
CREATE TRIGGER trg_set_updated_at_user_coding BEFORE UPDATE ON public.user_coding_profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_set_updated_at_user_progress ON public.user_progress;
CREATE TRIGGER trg_set_updated_at_user_progress BEFORE UPDATE ON public.user_progress FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_set_updated_at_video_progress ON public.video_progress;
CREATE TRIGGER trg_set_updated_at_video_progress BEFORE UPDATE ON public.video_progress FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_set_updated_at_learning_progress ON public.learning_progress;
CREATE TRIGGER trg_set_updated_at_learning_progress BEFORE UPDATE ON public.learning_progress FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_set_updated_at_skills_cache ON public.skills_cache;
CREATE TRIGGER trg_set_updated_at_skills_cache BEFORE UPDATE ON public.skills_cache FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 15. SECURITY DEFINER RPC FUNCTIONS ──────────────────────────────
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

REVOKE EXECUTE ON FUNCTION public.upsert_user_aptitude_attempt(UUID, INTEGER, INTEGER, INTEGER, BOOLEAN, INTEGER) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.upsert_user_aptitude_attempt(UUID, INTEGER, INTEGER, INTEGER, BOOLEAN, INTEGER) TO authenticated, service_role;

-- ── 16. PRODUCTION ROW LEVEL SECURITY (RLS) HARDENING ───────────────
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

-- ── 17. SEED METADATA FOR APTITUDE & PLACEMENT PREP ─────────────────
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
