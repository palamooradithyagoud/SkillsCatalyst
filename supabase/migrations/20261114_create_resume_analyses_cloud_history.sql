-- ============================================================================
-- Migration: 20261114_create_resume_analyses_cloud_history.sql
-- Description: Phase 3 Persistent Cloud Storage & Resume History Architecture:
--   1. Dedicated private Supabase Storage Bucket ('resumes') with strict user isolation.
--   2. Storage access policies for storage.objects scoped to {user_id}/* path prefix.
--   3. Relational table public.resume_analyses with granular score bounds and JSONB payload.
--   4. RLS policies, performance composite indexes, and cascading deletion.
-- ============================================================================

-- ── 1. Create or Update Private Supabase Storage Bucket ───────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'resumes',
    'resumes',
    false, -- Strictly PRIVATE bucket (requires signed URLs)
    5242880, -- 5 MB strict limit
    ARRAY[
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
        'text/plain',
        'text/markdown'
    ]
)
ON CONFLICT (id) DO UPDATE SET
    public = false,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY[
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
        'text/plain',
        'text/markdown'
    ];

-- ── 2. Storage Objects Access Policies (storage.objects) ─────────────────────
-- Authenticated users can only read/download resumes stored in their own folder ({user_id}/*)
DROP POLICY IF EXISTS "Users can read own resumes from storage" ON storage.objects;
CREATE POLICY "Users can read own resumes from storage" ON storage.objects
    FOR SELECT TO authenticated
    USING (
        bucket_id = 'resumes'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Authenticated users can delete resumes stored in their own folder
DROP POLICY IF EXISTS "Users can delete own resumes from storage" ON storage.objects;
CREATE POLICY "Users can delete own resumes from storage" ON storage.objects
    FOR DELETE TO authenticated
    USING (
        bucket_id = 'resumes'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Service role full access for backend storage operations (upload, signed URLs, cleanup)
DROP POLICY IF EXISTS "Service role full access on resumes bucket" ON storage.objects;
CREATE POLICY "Service role full access on resumes bucket" ON storage.objects
    FOR ALL TO service_role
    USING (bucket_id = 'resumes')
    WITH CHECK (bucket_id = 'resumes');


-- ── 3. Relational Table: public.resume_analyses ──────────────────────────────
CREATE TABLE IF NOT EXISTS public.resume_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    original_filename TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    file_type TEXT,
    file_size BIGINT,
    ats_score NUMERIC(5, 2) CHECK (ats_score IS NULL OR (ats_score >= 0 AND ats_score <= 100)),
    content_score NUMERIC(5, 2) CHECK (content_score IS NULL OR (content_score >= 0 AND content_score <= 100)),
    skills_score NUMERIC(5, 2) CHECK (skills_score IS NULL OR (skills_score >= 0 AND skills_score <= 100)),
    structure_score NUMERIC(5, 2) CHECK (structure_score IS NULL OR (structure_score >= 0 AND structure_score <= 100)),
    overall_score NUMERIC(5, 2) CHECK (overall_score IS NULL OR (overall_score >= 0 AND overall_score <= 100)),
    analysis_result JSONB NOT NULL DEFAULT '{}'::jsonb,
    job_description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Documentation comments
COMMENT ON TABLE public.resume_analyses IS 'Persistent storage of resume analyses, scores, and storage links for user history.';
COMMENT ON COLUMN public.resume_analyses.id IS 'Primary UUID of the analysis record.';
COMMENT ON COLUMN public.resume_analyses.user_id IS 'Foreign key referencing auth.users(id). Strict ownership.';
COMMENT ON COLUMN public.resume_analyses.storage_path IS 'Path inside private resumes bucket: {user_id}/{resume_id}/{filename}.';
COMMENT ON COLUMN public.resume_analyses.analysis_result IS 'Complete structured Phase 2 evaluation JSONB artifact.';

-- ── 4. Indexes for High-Performance Querying ─────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_resume_analyses_user ON public.resume_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_resume_analyses_user_created ON public.resume_analyses(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_resume_analyses_user_score ON public.resume_analyses(user_id, overall_score DESC);

-- ── 5. Trigger for updated_at ────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_resume_analyses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_resume_analyses_updated_at ON public.resume_analyses;
CREATE TRIGGER trg_resume_analyses_updated_at
    BEFORE UPDATE ON public.resume_analyses
    FOR EACH ROW EXECUTE FUNCTION public.handle_resume_analyses_updated_at();

-- ── 6. Row Level Security (RLS) ──────────────────────────────────────────────
ALTER TABLE public.resume_analyses ENABLE ROW LEVEL SECURITY;

-- Revoke dangerous direct write access from anonymous and authenticated clients
REVOKE ALL ON public.resume_analyses FROM anon;
REVOKE INSERT, UPDATE ON public.resume_analyses FROM authenticated;
GRANT SELECT, DELETE ON public.resume_analyses TO authenticated;
GRANT ALL ON public.resume_analyses TO service_role;

-- Authenticated users can only read their own analyses
DROP POLICY IF EXISTS "Users can read own resume analyses" ON public.resume_analyses;
CREATE POLICY "Users can read own resume analyses"
    ON public.resume_analyses
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Authenticated users can delete their own analyses
DROP POLICY IF EXISTS "Users can delete own resume analyses" ON public.resume_analyses;
CREATE POLICY "Users can delete own resume analyses"
    ON public.resume_analyses
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Backend service role has full access for analysis persistence and maintenance
DROP POLICY IF EXISTS "Service role full access on resume_analyses" ON public.resume_analyses;
CREATE POLICY "Service role full access on resume_analyses"
    ON public.resume_analyses
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

