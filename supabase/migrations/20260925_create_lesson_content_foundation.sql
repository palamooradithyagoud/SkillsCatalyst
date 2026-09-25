-- ============================================================================
-- Migration: 20260925_create_lesson_content_foundation.sql
-- Description: Establishes the production-ready foundation for Lesson Content
--              Architecture (Phase 2A):
--                course_lessons
--                  ↓
--                course_lesson_contents (Structured typed blocks JSONB)
--
-- One content record per lesson (UNIQUE lesson_id) containing an ordered
-- sequence of typed content blocks (schema versioned).
-- ============================================================================

-- ── 1. Create course_lesson_contents Table ──────────────────────────────────
CREATE TABLE IF NOT EXISTS public.course_lesson_contents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID NOT NULL REFERENCES public.course_lessons(id) ON DELETE CASCADE,
    schema_version INTEGER NOT NULL DEFAULT 1,
    blocks JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Constraints
    CONSTRAINT uq_course_lesson_contents_lesson_id UNIQUE (lesson_id),
    CONSTRAINT chk_course_lesson_contents_schema_version CHECK (schema_version >= 1)
);

-- ── 2. Performance Indexes ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_course_lesson_contents_lesson_id
    ON public.course_lesson_contents (lesson_id);

-- GIN index on blocks JSONB for structural and block-type queries
CREATE INDEX IF NOT EXISTS idx_course_lesson_contents_blocks_gin
    ON public.course_lesson_contents USING GIN (blocks);

-- ── 3. Row Level Security (RLS) ─────────────────────────────────────────────
ALTER TABLE public.course_lesson_contents ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view content of published lessons (course status is PUBLISHED)
CREATE POLICY course_lesson_contents_published_select ON public.course_lesson_contents
    FOR SELECT TO anon, authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.course_lessons cl
            JOIN public.course_modules cm ON cm.id = cl.module_id
            JOIN public.courses c ON c.id = cm.course_id
            WHERE cl.id = course_lesson_contents.lesson_id
            AND c.status = 'PUBLISHED'
        )
    );

-- Policy: Admin / Owner / Editor full access
CREATE POLICY course_lesson_contents_admin_all ON public.course_lesson_contents
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
            AND p.role IN ('owner', 'admin', 'editor')
        )
        OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('owner', 'admin', 'editor')
        OR (auth.jwt() ->> 'role') IN ('owner', 'admin', 'editor')
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
            AND p.role IN ('owner', 'admin', 'editor')
        )
        OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('owner', 'admin', 'editor')
        OR (auth.jwt() ->> 'role') IN ('owner', 'admin', 'editor')
    );

-- Policy: Service role bypass for backend service workers and automated operations
CREATE POLICY course_lesson_contents_service_role_all ON public.course_lesson_contents
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

-- ── 4. Grants ───────────────────────────────────────────────────────────────
GRANT SELECT ON public.course_lesson_contents TO anon, authenticated;
GRANT ALL ON public.course_lesson_contents TO authenticated;
GRANT ALL ON public.course_lesson_contents TO service_role;
