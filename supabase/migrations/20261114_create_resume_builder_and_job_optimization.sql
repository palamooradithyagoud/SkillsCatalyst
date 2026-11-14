-- ============================================================================
-- Migration: 20261114_create_resume_builder_and_job_optimization.sql
-- Description: Phase 5 AI Resume Builder & Job-Specific Optimization Architecture:
--   1. public.resume_builder_documents: Active drafts and structured resume documents.
--   2. public.resume_builder_versions: Saved milestone versions with linked ATS analyses.
--   3. public.job_optimization_sessions: Job descriptions, extracted requirements, keyword coverage, and suggestions.
--   4. RLS policies, cascading cleanup, updated_at triggers, and high-performance indexes.
-- ============================================================================

-- ── 1. Create public.resume_builder_documents Table ──────────────────────────
CREATE TABLE IF NOT EXISTS public.resume_builder_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    resume_series_id UUID REFERENCES public.resume_series(id) ON DELETE SET NULL,
    title TEXT NOT NULL DEFAULT 'Untitled Resume',
    selected_template TEXT NOT NULL DEFAULT 'sb2nov',
    structured_resume_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    target_role TEXT,
    source_analysis_id UUID REFERENCES public.resume_analyses(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.resume_builder_documents IS 'Structured resume builder drafts and working documents for interactive editing.';
COMMENT ON COLUMN public.resume_builder_documents.id IS 'Primary UUID of the resume builder document.';
COMMENT ON COLUMN public.resume_builder_documents.user_id IS 'Owner user UUID referencing auth.users(id).';
COMMENT ON COLUMN public.resume_builder_documents.resume_series_id IS 'Associated career track / resume series.';
COMMENT ON COLUMN public.resume_builder_documents.structured_resume_data IS 'JSONB payload of structured resume fields (contact, education, experience, etc.).';
COMMENT ON COLUMN public.resume_builder_documents.selected_template IS 'Selected resume rendering template identifier (e.g. sb2nov, modern-cv, simple-classic, academic).';

-- Indexes for resume_builder_documents
CREATE INDEX IF NOT EXISTS idx_resume_builder_docs_user ON public.resume_builder_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_resume_builder_docs_series ON public.resume_builder_documents(resume_series_id);
CREATE INDEX IF NOT EXISTS idx_resume_builder_docs_user_updated ON public.resume_builder_documents(user_id, updated_at DESC);

-- Trigger for resume_builder_documents updated_at
CREATE OR REPLACE FUNCTION public.handle_resume_builder_docs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_resume_builder_docs_updated_at ON public.resume_builder_documents;
CREATE TRIGGER trigger_resume_builder_docs_updated_at
    BEFORE UPDATE ON public.resume_builder_documents
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_resume_builder_docs_updated_at();

-- ── 2. Create public.resume_builder_versions Table ───────────────────────────
CREATE TABLE IF NOT EXISTS public.resume_builder_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES public.resume_builder_documents(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    resume_series_id UUID REFERENCES public.resume_series(id) ON DELETE SET NULL,
    version_number INTEGER NOT NULL DEFAULT 1,
    structured_resume_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    selected_template TEXT NOT NULL DEFAULT 'sb2nov',
    analysis_id UUID REFERENCES public.resume_analyses(id) ON DELETE SET NULL,
    change_summary TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.resume_builder_versions IS 'Immutable snapshots of saved resume builder versions with corresponding ATS evaluations.';

-- Indexes for resume_builder_versions
CREATE INDEX IF NOT EXISTS idx_resume_builder_versions_doc ON public.resume_builder_versions(document_id, version_number DESC);
CREATE INDEX IF NOT EXISTS idx_resume_builder_versions_user ON public.resume_builder_versions(user_id);
CREATE INDEX IF NOT EXISTS idx_resume_builder_versions_series ON public.resume_builder_versions(resume_series_id);

-- ── 3. Create public.job_optimization_sessions Table ─────────────────────────
CREATE TABLE IF NOT EXISTS public.job_optimization_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    document_id UUID REFERENCES public.resume_builder_documents(id) ON DELETE CASCADE,
    job_title TEXT,
    company_name TEXT,
    experience_level TEXT,
    job_description TEXT NOT NULL,
    extracted_requirements JSONB NOT NULL DEFAULT '{}'::jsonb,
    keyword_analysis JSONB NOT NULL DEFAULT '{}'::jsonb,
    recommendations JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.job_optimization_sessions IS 'Persisted resume optimization sessions against candidate-supplied job descriptions.';

-- Indexes for job_optimization_sessions
CREATE INDEX IF NOT EXISTS idx_job_opt_sessions_user ON public.job_optimization_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_job_opt_sessions_doc ON public.job_optimization_sessions(document_id);
CREATE INDEX IF NOT EXISTS idx_job_opt_sessions_created ON public.job_optimization_sessions(user_id, created_at DESC);

-- Trigger for job_optimization_sessions updated_at
DROP TRIGGER IF EXISTS trigger_job_opt_sessions_updated_at ON public.job_optimization_sessions;
CREATE TRIGGER trigger_job_opt_sessions_updated_at
    BEFORE UPDATE ON public.job_optimization_sessions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_resume_builder_docs_updated_at();

-- ── 4. Row Level Security (RLS) Configuration ────────────────────────────────
ALTER TABLE public.resume_builder_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_builder_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_optimization_sessions ENABLE ROW LEVEL SECURITY;

-- Policies for resume_builder_documents
DROP POLICY IF EXISTS "Users can view own resume builder documents" ON public.resume_builder_documents;
CREATE POLICY "Users can view own resume builder documents"
    ON public.resume_builder_documents FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own resume builder documents" ON public.resume_builder_documents;
CREATE POLICY "Users can insert own resume builder documents"
    ON public.resume_builder_documents FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own resume builder documents" ON public.resume_builder_documents;
CREATE POLICY "Users can update own resume builder documents"
    ON public.resume_builder_documents FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own resume builder documents" ON public.resume_builder_documents;
CREATE POLICY "Users can delete own resume builder documents"
    ON public.resume_builder_documents FOR DELETE
    USING (auth.uid() = user_id);

-- Policies for resume_builder_versions
DROP POLICY IF EXISTS "Users can view own resume builder versions" ON public.resume_builder_versions;
CREATE POLICY "Users can view own resume builder versions"
    ON public.resume_builder_versions FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own resume builder versions" ON public.resume_builder_versions;
CREATE POLICY "Users can insert own resume builder versions"
    ON public.resume_builder_versions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own resume builder versions" ON public.resume_builder_versions;
CREATE POLICY "Users can delete own resume builder versions"
    ON public.resume_builder_versions FOR DELETE
    USING (auth.uid() = user_id);

-- Policies for job_optimization_sessions
DROP POLICY IF EXISTS "Users can view own job optimization sessions" ON public.job_optimization_sessions;
CREATE POLICY "Users can view own job optimization sessions"
    ON public.job_optimization_sessions FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own job optimization sessions" ON public.job_optimization_sessions;
CREATE POLICY "Users can insert own job optimization sessions"
    ON public.job_optimization_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own job optimization sessions" ON public.job_optimization_sessions;
CREATE POLICY "Users can update own job optimization sessions"
    ON public.job_optimization_sessions FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own job optimization sessions" ON public.job_optimization_sessions;
CREATE POLICY "Users can delete own job optimization sessions"
    ON public.job_optimization_sessions FOR DELETE
    USING (auth.uid() = user_id);

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.resume_builder_documents TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.resume_builder_versions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.job_optimization_sessions TO authenticated;
GRANT ALL ON public.resume_builder_documents TO service_role;
GRANT ALL ON public.resume_builder_versions TO service_role;
GRANT ALL ON public.job_optimization_sessions TO service_role;

