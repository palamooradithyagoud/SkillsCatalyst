-- ====================================================================
-- MODULE 9: GAMIFICATION, CODING PROGRESS & ROADMAPS (6 TABLES)
-- ====================================================================

-- 1. USER PROGRESS (Master XP, Level, Streaks & Readiness)
CREATE TABLE IF NOT EXISTS public.user_progress (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    problems_solved INTEGER NOT NULL DEFAULT 0,
    success_rate NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    streak_days INTEGER NOT NULL DEFAULT 0,
    total_xp INTEGER NOT NULL DEFAULT 0,
    level INTEGER NOT NULL DEFAULT 0,
    learning_progress_percent NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    resume_readiness_score NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    ai_career_health_score NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    last_login_date DATE DEFAULT NULL,
    last_active_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. DSA PROGRESS (Easy / Medium / Hard & Topics Breakdown)
CREATE TABLE IF NOT EXISTS public.dsa_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    leetcode_username TEXT,
    total_solved INTEGER DEFAULT 0,
    easy_solved INTEGER DEFAULT 0,
    medium_solved INTEGER DEFAULT 0,
    hard_solved INTEGER DEFAULT 0,
    solved_problems JSONB DEFAULT '[]'::jsonb,
    category_counts JSONB DEFAULT '{}'::jsonb,
    weak_topics TEXT[],
    daily_streak INTEGER DEFAULT 0,
    last_active_date DATE DEFAULT CURRENT_DATE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_dsa_progress_user UNIQUE (user_id)
);
CREATE INDEX IF NOT EXISTS idx_dsa_progress_user ON public.dsa_progress(user_id);

-- 3. LEETCODE PROGRESS (Synced LeetCode Problem Solved History)
CREATE TABLE IF NOT EXISTS public.leetcode_progress (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    question_id INTEGER NOT NULL,
    question_title TEXT NOT NULL,
    company_slug TEXT NOT NULL,
    difficulty TEXT DEFAULT 'Easy',
    frequency TEXT,
    acceptance TEXT,
    status TEXT NOT NULL DEFAULT 'solved',
    solved_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_leetcode_prog_user ON public.leetcode_progress(user_id);

-- 4. ROADMAP PROGRESS (Checkpoint Nodes Checked Off on AI Roadmaps)
CREATE TABLE IF NOT EXISTS public.roadmap_progress (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    roadmap_id TEXT NOT NULL,
    node_id TEXT NOT NULL,
    node_title TEXT NOT NULL,
    category TEXT,
    status TEXT NOT NULL DEFAULT 'completed',
    completed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_roadmap_prog_user ON public.roadmap_progress(user_id);

-- 5. LEARNING PROGRESS (Structured Learning Journey Sessions)
CREATE TABLE IF NOT EXISTS public.learning_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id TEXT,
    skill_name TEXT,
    playlist_url TEXT,
    video_id TEXT,
    watched_seconds INTEGER DEFAULT 0,
    completed_steps JSONB DEFAULT '[]'::jsonb,
    completion_pct NUMERIC(5, 2) DEFAULT 0.00,
    completed BOOLEAN DEFAULT false,
    started_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_learning_prog_user ON public.learning_progress(user_id);

-- 6. INTERVIEW PROGRESS (Mock & Technical Interview Round Prep)
CREATE TABLE IF NOT EXISTS public.interview_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    target_company TEXT,
    role_key TEXT DEFAULT 'general',
    mock_interview_score INTEGER,
    overall_score NUMERIC DEFAULT 0,
    weak_areas TEXT[],
    interview_round_type TEXT,
    preparation_status TEXT,
    completed_rounds JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_interview_prog_user ON public.interview_progress(user_id);

-- ── TRIGGERS ─────────────────────────────────────────────────────────
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN SELECT unnest(ARRAY['user_progress', 'dsa_progress', 'learning_progress', 'interview_progress'])
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS trg_set_updated_at_%I ON public.%I;', t, t);
        EXECUTE format('CREATE TRIGGER trg_set_updated_at_%I BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();', t, t);
    END LOOP;
END;
$$;

-- ── ROW LEVEL SECURITY (RLS) ─────────────────────────────────────────
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dsa_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leetcode_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_progress ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
    tbl text;
BEGIN
    FOR tbl IN SELECT unnest(ARRAY['user_progress', 'dsa_progress', 'leetcode_progress', 'roadmap_progress', 'learning_progress', 'interview_progress'])
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Users manage own %I" ON public.%I;', tbl, tbl);
        EXECUTE format('CREATE POLICY "Users manage own %I" ON public.%I FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);', tbl, tbl);

        EXECUTE format('DROP POLICY IF EXISTS "Service role access on %I" ON public.%I;', tbl, tbl);
        EXECUTE format('CREATE POLICY "Service role access on %I" ON public.%I FOR ALL TO service_role USING (true) WITH CHECK (true);', tbl, tbl);
    END LOOP;
END;
$$;

-- Protect privileged scores on user_progress from client-side tampering
CREATE OR REPLACE FUNCTION public.protect_user_progress_privileged_fields()
RETURNS TRIGGER AS $$
BEGIN
    IF current_user IN ('service_role', 'postgres', 'supabase_admin') THEN
        RETURN NEW;
    END IF;

    IF COALESCE((auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'owner' THEN
        RETURN NEW;
    END IF;

    IF TG_OP = 'INSERT' THEN
        NEW.resume_readiness_score := 0.00;
        NEW.ai_career_health_score := 0.00;
    ELSIF TG_OP = 'UPDATE' THEN
        IF NEW.resume_readiness_score IS DISTINCT FROM OLD.resume_readiness_score THEN
            NEW.resume_readiness_score := OLD.resume_readiness_score;
        END IF;
        IF NEW.ai_career_health_score IS DISTINCT FROM OLD.ai_career_health_score THEN
            NEW.ai_career_health_score := OLD.ai_career_health_score;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_protect_user_progress_privileged_fields ON public.user_progress;
CREATE TRIGGER trg_protect_user_progress_privileged_fields
    BEFORE INSERT OR UPDATE ON public.user_progress
    FOR EACH ROW EXECUTE FUNCTION public.protect_user_progress_privileged_fields();
