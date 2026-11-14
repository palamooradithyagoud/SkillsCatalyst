-- ============================================================================
-- Migration: 20261114_create_resume_series_and_versioning.sql
-- Description: Phase 4.1 Resume Version Management & Intelligence Architecture:
--   1. Logical resume series table (public.resume_series) for grouping resume versions.
--   2. Versioning columns on public.resume_analyses (series_id, version_number, engine metadata).
--   3. Automated backfill migration preserving all existing Phase 3 historical records.
--   4. RLS policies, cascading cleanup, and high-performance composite indexes.
-- ============================================================================

-- ── 1. Create public.resume_series Table ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.resume_series (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    target_role TEXT,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.resume_series IS 'Logical groupings of resume iterations/versions (e.g. Software Engineer Resume, ML Resume).';
COMMENT ON COLUMN public.resume_series.id IS 'Primary UUID of the resume series.';
COMMENT ON COLUMN public.resume_series.user_id IS 'Owner user UUID referencing auth.users(id).';
COMMENT ON COLUMN public.resume_series.title IS 'User-facing label for the resume series.';
COMMENT ON COLUMN public.resume_series.target_role IS 'Target industry role for this series.';

-- Performance Indexes for Series
CREATE INDEX IF NOT EXISTS idx_resume_series_user ON public.resume_series(user_id);
CREATE INDEX IF NOT EXISTS idx_resume_series_user_updated ON public.resume_series(user_id, updated_at DESC);

-- Trigger for series updated_at
CREATE OR REPLACE FUNCTION public.handle_resume_series_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_resume_series_updated_at ON public.resume_series;
CREATE TRIGGER trigger_resume_series_updated_at
    BEFORE UPDATE ON public.resume_series
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_resume_series_updated_at();

-- ── 2. Add Versioning Columns to public.resume_analyses ──────────────────────
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'resume_analyses' 
        AND column_name = 'resume_series_id'
    ) THEN
        ALTER TABLE public.resume_analyses
        ADD COLUMN resume_series_id UUID REFERENCES public.resume_series(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'resume_analyses' 
        AND column_name = 'version_number'
    ) THEN
        ALTER TABLE public.resume_analyses
        ADD COLUMN version_number INTEGER NOT NULL DEFAULT 1;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'resume_analyses' 
        AND column_name = 'previous_analysis_id'
    ) THEN
        ALTER TABLE public.resume_analyses
        ADD COLUMN previous_analysis_id UUID REFERENCES public.resume_analyses(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'resume_analyses' 
        AND column_name = 'scoring_engine_version'
    ) THEN
        ALTER TABLE public.resume_analyses
        ADD COLUMN scoring_engine_version TEXT NOT NULL DEFAULT '2.2';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'resume_analyses' 
        AND column_name = 'ai_evaluator_version'
    ) THEN
        ALTER TABLE public.resume_analyses
        ADD COLUMN ai_evaluator_version TEXT NOT NULL DEFAULT '2.2';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'job_description_hash'
    ) THEN
        ALTER TABLE public.resume_analyses
        ADD COLUMN job_description_hash TEXT;
    END IF;
END $$;

-- Indexes for Series-Version lookups and comparisons
CREATE INDEX IF NOT EXISTS idx_resume_analyses_series_id ON public.resume_analyses(resume_series_id);
CREATE INDEX IF NOT EXISTS idx_resume_analyses_series_version ON public.resume_analyses(resume_series_id, version_number DESC);

-- ── 3. Backfill Existing Phase 3 Records ─────────────────────────────────────
-- Automatically create an isolated resume_series for any historical record without a series
DO $$
DECLARE
    rec RECORD;
    new_series_id UUID;
    clean_title TEXT;
    target_role_val TEXT;
    jd_hash TEXT;
BEGIN
    FOR rec IN 
        SELECT id, user_id, original_filename, created_at, job_description, analysis_result
        FROM public.resume_analyses
        WHERE resume_series_id IS NULL
        ORDER BY created_at ASC
    LOOP
        -- Extract clean title from filename
        clean_title := REGEXP_REPLACE(rec.original_filename, '\.[^.]+$', '');
        IF clean_title IS NULL OR length(trim(clean_title)) = 0 THEN
            clean_title := 'General Resume';
        END IF;

        target_role_val := rec.analysis_result->>'target_role';

        -- Compute MD5 hash of JD if present
        IF rec.job_description IS NOT NULL AND length(trim(rec.job_description)) > 0 THEN
            jd_hash := md5(trim(rec.job_description));
        ELSE
            jd_hash := NULL;
        END IF;

        -- Create series
        INSERT INTO public.resume_series (user_id, title, target_role, description, created_at, updated_at)
        VALUES (
            rec.user_id,
            clean_title,
            target_role_val,
            'Imported from analysis history',
            rec.created_at,
            rec.created_at
        )
        RETURNING id INTO new_series_id;

        -- Link analysis to new series
        UPDATE public.resume_analyses
        SET 
            resume_series_id = new_series_id,
            version_number = 1,
            scoring_engine_version = '2.2',
            ai_evaluator_version = '2.2',
            job_description_hash = jd_hash
        WHERE id = rec.id;
    END LOOP;
END $$;

-- ── 4. Row Level Security for public.resume_series ───────────────────────────
ALTER TABLE public.resume_series ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own resume series" ON public.resume_series;
CREATE POLICY "Users can read own resume series" ON public.resume_series
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own resume series" ON public.resume_series;
CREATE POLICY "Users can create own resume series" ON public.resume_series
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own resume series" ON public.resume_series;
CREATE POLICY "Users can update own resume series" ON public.resume_series
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own resume series" ON public.resume_series;
CREATE POLICY "Users can delete own resume series" ON public.resume_series
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role full access on resume_series" ON public.resume_series;
CREATE POLICY "Service role full access on resume_series" ON public.resume_series
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

