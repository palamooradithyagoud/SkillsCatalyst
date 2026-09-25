-- ============================================================================
-- Migration: 20260925_create_course_lesson_media_storage.sql
-- Description: Establishes the production-ready backend/storage foundation for
--              Course Lesson Media Architecture (Phase 3A):
--                course-lesson-media (Dedicated Supabase Storage Bucket)
--                  ↓
--                public.course_lesson_media (Relational Media Metadata)
--                  ↓
--                RLS Policies, Strict Constraints, and Cascades
-- ============================================================================

-- ── 1. Create or Update Supabase Storage Bucket ─────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'course-lesson-media',
    'course-lesson-media',
    true,
    10485760, -- 10MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- ── 2. Supabase Storage Policies (storage.objects) ──────────────────────────
-- Public / Student read access for published educational lesson media
DROP POLICY IF EXISTS "course_lesson_media_public_read" ON storage.objects;
CREATE POLICY "course_lesson_media_public_read" ON storage.objects
    FOR SELECT TO public
    USING (bucket_id = 'course-lesson-media');

-- Admin / Owner / Editor full access for course-lesson-media
DROP POLICY IF EXISTS "course_lesson_media_admin_all" ON storage.objects;
CREATE POLICY "course_lesson_media_admin_all" ON storage.objects
    FOR ALL TO authenticated
    USING (
        bucket_id = 'course-lesson-media'
        AND (
            EXISTS (
                SELECT 1 FROM public.profiles p
                WHERE p.id = auth.uid() AND p.role IN ('owner', 'admin', 'editor')
            )
            OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('owner', 'admin', 'editor')
            OR (auth.jwt() ->> 'role') IN ('owner', 'admin', 'editor')
        )
    )
    WITH CHECK (
        bucket_id = 'course-lesson-media'
        AND (
            EXISTS (
                SELECT 1 FROM public.profiles p
                WHERE p.id = auth.uid() AND p.role IN ('owner', 'admin', 'editor')
            )
            OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('owner', 'admin', 'editor')
            OR (auth.jwt() ->> 'role') IN ('owner', 'admin', 'editor')
        )
    );

-- Service role full access for backend storage operations
DROP POLICY IF EXISTS "course_lesson_media_service_role_all" ON storage.objects;
CREATE POLICY "course_lesson_media_service_role_all" ON storage.objects
    FOR ALL TO service_role
    USING (bucket_id = 'course-lesson-media')
    WITH CHECK (bucket_id = 'course-lesson-media');

-- ── 3. Create course_lesson_media Table ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.course_lesson_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    module_id UUID NOT NULL REFERENCES public.course_modules(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES public.course_lessons(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    size_bytes BIGINT NOT NULL,
    public_url TEXT NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Constraints
    CONSTRAINT uq_course_lesson_media_storage_path UNIQUE (storage_path),
    CONSTRAINT chk_course_lesson_media_size CHECK (size_bytes > 0 AND size_bytes <= 10485760),
    CONSTRAINT chk_course_lesson_media_mime CHECK (mime_type IN ('image/jpeg', 'image/png', 'image/webp', 'image/gif'))
);

-- ── 4. Performance Indexes ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_course_lesson_media_lesson_id
    ON public.course_lesson_media (lesson_id);

CREATE INDEX IF NOT EXISTS idx_course_lesson_media_course_id
    ON public.course_lesson_media (course_id);

CREATE INDEX IF NOT EXISTS idx_course_lesson_media_module_id
    ON public.course_lesson_media (module_id);

CREATE INDEX IF NOT EXISTS idx_course_lesson_media_created_by
    ON public.course_lesson_media (created_by);

-- ── 5. Auto-update updated_at Trigger ────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.update_course_lesson_media_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_course_lesson_media_updated_at ON public.course_lesson_media;
CREATE TRIGGER trg_course_lesson_media_updated_at
    BEFORE UPDATE ON public.course_lesson_media
    FOR EACH ROW EXECUTE FUNCTION public.update_course_lesson_media_updated_at();

-- ── 6. Row Level Security (RLS) on course_lesson_media ──────────────────────
ALTER TABLE public.course_lesson_media ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view media of published courses
DROP POLICY IF EXISTS course_lesson_media_published_select ON public.course_lesson_media;
CREATE POLICY course_lesson_media_published_select ON public.course_lesson_media
    FOR SELECT TO anon, authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.courses c
            WHERE c.id = course_lesson_media.course_id
            AND c.status = 'PUBLISHED'
        )
    );

-- Policy: Admin / Owner / Editor full access
DROP POLICY IF EXISTS course_lesson_media_admin_all ON public.course_lesson_media;
CREATE POLICY course_lesson_media_admin_all ON public.course_lesson_media
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

-- Policy: Service role full access for backend service workers
DROP POLICY IF EXISTS course_lesson_media_service_role_all ON public.course_lesson_media;
CREATE POLICY course_lesson_media_service_role_all ON public.course_lesson_media
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

-- ── 7. Grants ───────────────────────────────────────────────────────────────
GRANT SELECT ON public.course_lesson_media TO anon, authenticated;
GRANT ALL ON public.course_lesson_media TO authenticated;
GRANT ALL ON public.course_lesson_media TO service_role;
