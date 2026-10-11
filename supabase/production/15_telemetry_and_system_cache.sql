-- ====================================================================
-- MODULE 15: TELEMETRY, RECOMMENDATIONS & SYSTEM CACHE (5 TABLES)
-- ====================================================================

-- 1. TRUST SCORE ENGINE (External Resource Quality & Upvotes)
CREATE TABLE IF NOT EXISTS public.trust_score_engine (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_url TEXT,
    resource_title TEXT,
    channel_name TEXT,
    skill_name TEXT,
    metric_key TEXT,
    score_data JSONB,
    trust_score NUMERIC(5,2) DEFAULT 50.00,
    confidence_score NUMERIC(5,2) DEFAULT 50.00,
    click_count INTEGER DEFAULT 0,
    save_count INTEGER DEFAULT 0,
    ignore_count INTEGER DEFAULT 0,
    completion_rate NUMERIC(5,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. USER FEEDBACK (Thumbs Up / Down Ratings on Recommendations)
CREATE TABLE IF NOT EXISTS public.user_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    action TEXT NOT NULL,
    resource_url TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_user_feedback_user ON public.user_feedback(user_id);

-- 3. RECOMMENDATION HISTORY (Logged Recommendations to Prevent Duplication)
CREATE TABLE IF NOT EXISTS public.recommendation_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    skill_name TEXT NOT NULL,
    tier INTEGER,
    source_type TEXT,
    recommendations_json JSONB,
    roadmap_generated BOOLEAN DEFAULT false,
    session_id TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_rec_history_user ON public.recommendation_history(user_id);

-- 4. RECENT SEARCHES (Search Log for Quick Autocomplete)
CREATE TABLE IF NOT EXISTS public.recent_searches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    level TEXT,
    language TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_recent_searches_user ON public.recent_searches(user_id);

-- 5. SUCCESS METRICS (Telemetry KPI Events)
CREATE TABLE IF NOT EXISTS public.success_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    session_id TEXT,
    skill_name TEXT,
    event_type TEXT,
    target_url TEXT,
    outcome_type TEXT,
    outcome_detail TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ── ROW LEVEL SECURITY (RLS) ─────────────────────────────────────────
ALTER TABLE public.trust_score_engine ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recent_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.success_metrics ENABLE ROW LEVEL SECURITY;

-- Public Read for Trust Scores
DROP POLICY IF EXISTS "Public read trust scores" ON public.trust_score_engine;
CREATE POLICY "Public read trust scores" ON public.trust_score_engine FOR SELECT USING (true);

-- User Isolation for History & Searches
DROP POLICY IF EXISTS "Users manage own search history" ON public.recent_searches;
CREATE POLICY "Users manage own search history" ON public.recent_searches FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own rec history" ON public.recommendation_history;
CREATE POLICY "Users manage own rec history" ON public.recommendation_history FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Feedback & Metrics Inserts
DROP POLICY IF EXISTS "Authenticated insert user_feedback" ON public.user_feedback;
CREATE POLICY "Authenticated insert user_feedback" ON public.user_feedback FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated insert success_metrics" ON public.success_metrics;
CREATE POLICY "Authenticated insert success_metrics" ON public.success_metrics FOR INSERT TO authenticated WITH CHECK (true);

-- Service Role Full Access
DO $$
DECLARE
    tbl text;
BEGIN
    FOR tbl IN SELECT unnest(ARRAY['trust_score_engine', 'user_feedback', 'recommendation_history', 'recent_searches', 'success_metrics'])
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Service role full %I" ON public.%I;', tbl, tbl);
        EXECUTE format('CREATE POLICY "Service role full %I" ON public.%I FOR ALL TO service_role USING (true) WITH CHECK (true);', tbl, tbl);
    END LOOP;
END;
$$;
