-- ====================================================================
-- SKILLSCATALYST - LEARNING ARCHITECTURE & PROGRESS STORAGE SCHEMA
-- ====================================================================
-- Extends database with 5 core tables for learning progress JSONB storage,
-- trust score metrics, skills caching, and user event feedback.
-- ====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. LEARNING PROGRESS TABLE (JSONB Storage for Saved Playlists & Courses)
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

-- 2. SKILLS CACHE TABLE (Pre-computed Roadmaps & YouTube Recommendations)
CREATE TABLE IF NOT EXISTS public.skills_cache (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    skill_name      TEXT NOT NULL UNIQUE,
    roadmap_json    JSONB DEFAULT '{}'::jsonb,
    playlists_json  JSONB DEFAULT '[]'::jsonb,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TRUST SCORE ENGINE TABLE (Resource Trust Metrics)
CREATE TABLE IF NOT EXISTS public.trust_score_engine (
    url             TEXT PRIMARY KEY,
    trust_score     NUMERIC(5,2) DEFAULT 50.00,
    clicks          INTEGER DEFAULT 0,
    saves           INTEGER DEFAULT 0,
    ignores         INTEGER DEFAULT 0,
    completions     INTEGER DEFAULT 0,
    last_updated    TIMESTAMPTZ DEFAULT NOW()
);

-- 4. USER FEEDBACK / EVENT ANALYTICS TABLE
CREATE TABLE IF NOT EXISTS public.user_feedback (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         TEXT NOT NULL,
    action          TEXT NOT NULL, -- 'click', 'save', 'ignore', 'complete'
    resource_url    TEXT,
    metadata        JSONB DEFAULT '{}'::jsonb,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_feedback_user ON public.user_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_user_feedback_action ON public.user_feedback(action);

-- 5. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trust_score_engine ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;

-- learning_progress RLS
DROP POLICY IF EXISTS "Allow session owner access on learning_progress" ON public.learning_progress;
CREATE POLICY "Allow session owner access on learning_progress"
    ON public.learning_progress FOR ALL
    USING (session_id = (auth.uid())::text OR user_id = auth.uid() OR auth.role() = 'service_role')
    WITH CHECK (session_id = (auth.uid())::text OR user_id = auth.uid() OR auth.role() = 'service_role');

-- skills_cache RLS (Public read, service write)
DROP POLICY IF EXISTS "Allow read skills_cache" ON public.skills_cache;
CREATE POLICY "Allow read skills_cache" ON public.skills_cache FOR SELECT USING (true);

-- trust_score_engine RLS (Public read, service write)
DROP POLICY IF EXISTS "Allow read trust_score_engine" ON public.trust_score_engine;
CREATE POLICY "Allow read trust_score_engine" ON public.trust_score_engine FOR SELECT USING (true);

-- user_feedback RLS
DROP POLICY IF EXISTS "Allow user insert user_feedback" ON public.user_feedback;
CREATE POLICY "Allow user insert user_feedback" ON public.user_feedback FOR INSERT WITH CHECK (true);
