-- ====================================================================
-- MODULE 10: RESUME ANALYSIS & AI REVIEW (2 TABLES)
-- ====================================================================

-- 1. RESUME SCORES (Detailed ATS Scoring & Section Feedback)
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
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_resume_scores_user ON public.resume_scores(user_id);

-- 2. RESUME ANALYSIS (Document Analysis & AI Improvement Bullet Points)
CREATE TABLE IF NOT EXISTS public.resume_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    resume_file_url TEXT NOT NULL,
    file_name TEXT,
    ats_score INTEGER,
    ai_feedback TEXT,
    improvement_suggestions JSONB DEFAULT '[]'::jsonb,
    analysis_json JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_resume_analysis_user ON public.resume_analysis(user_id);

-- ── ROW LEVEL SECURITY (RLS) ─────────────────────────────────────────
ALTER TABLE public.resume_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_analysis ENABLE ROW LEVEL SECURITY;

-- resume_scores policies
DROP POLICY IF EXISTS "Users manage own resume_scores" ON public.resume_scores;
CREATE POLICY "Users manage own resume_scores" ON public.resume_scores FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role access on resume_scores" ON public.resume_scores;
CREATE POLICY "Service role access on resume_scores" ON public.resume_scores FOR ALL TO service_role USING (true) WITH CHECK (true);

-- resume_analysis policies
DROP POLICY IF EXISTS "Users manage own resume_analysis" ON public.resume_analysis;
CREATE POLICY "Users manage own resume_analysis" ON public.resume_analysis FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role access on resume_analysis" ON public.resume_analysis;
CREATE POLICY "Service role access on resume_analysis" ON public.resume_analysis FOR ALL TO service_role USING (true) WITH CHECK (true);
