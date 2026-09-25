-- ============================================================================
-- Migration: 20260926_create_student_course_progress.sql
-- Description: Creates persistent student course & lesson progress tables,
--              constraints, performance indexes, updated_at triggers,
--              and strict Row Level Security (RLS) policies for Phase 5.
-- ============================================================================

-- ── 1. Create student_course_progress Table ──────────────────────────────────
-- Tracks course-level engagement, last viewed lesson for resume learning,
-- and activity timestamps.
CREATE TABLE IF NOT EXISTS public.student_course_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    last_lesson_id UUID NULL REFERENCES public.course_lessons(id) ON DELETE SET NULL,
    last_activity_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Exactly one course progress row per user and course
    CONSTRAINT uq_student_course_progress UNIQUE (user_id, course_id)
);

-- ── 2. Create student_lesson_progress Table ──────────────────────────────────
-- Tracks granular lesson completion status, completion timestamp,
-- and view activity timestamps.
CREATE TABLE IF NOT EXISTS public.student_lesson_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    module_id UUID NOT NULL REFERENCES public.course_modules(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES public.course_lessons(id) ON DELETE CASCADE,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at TIMESTAMPTZ NULL,
    last_viewed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Exactly one lesson progress row per user and lesson
    CONSTRAINT uq_student_lesson_progress UNIQUE (user_id, lesson_id)
);

-- ── 3. Performance Indexes ────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_student_course_progress_user
    ON public.student_course_progress (user_id);

CREATE INDEX IF NOT EXISTS idx_student_course_progress_course
    ON public.student_course_progress (course_id);

CREATE INDEX IF NOT EXISTS idx_student_course_progress_user_course
    ON public.student_course_progress (user_id, course_id);

CREATE INDEX IF NOT EXISTS idx_student_lesson_progress_user_course
    ON public.student_lesson_progress (user_id, course_id);

CREATE INDEX IF NOT EXISTS idx_student_lesson_progress_user_lesson
    ON public.student_lesson_progress (user_id, lesson_id);

CREATE INDEX IF NOT EXISTS idx_student_lesson_progress_completed
    ON public.student_lesson_progress (user_id, course_id, completed);

-- ── 4. Automated updated_at Triggers ──────────────────────────────────────────
DROP TRIGGER IF EXISTS trg_student_course_progress_updated_at ON public.student_course_progress;
CREATE TRIGGER trg_student_course_progress_updated_at
    BEFORE UPDATE ON public.student_course_progress
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_student_lesson_progress_updated_at ON public.student_lesson_progress;
CREATE TRIGGER trg_student_lesson_progress_updated_at
    BEFORE UPDATE ON public.student_lesson_progress
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ── 5. Enable Row Level Security (RLS) ────────────────────────────────────────
ALTER TABLE public.student_course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_lesson_progress ENABLE ROW LEVEL SECURITY;

-- ── 6. RLS Policies: student_course_progress ─────────────────────────────────

-- Authenticated student: Read ONLY own course progress
DROP POLICY IF EXISTS "Users can read own course progress" ON public.student_course_progress;
CREATE POLICY "Users can read own course progress"
    ON public.student_course_progress
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Authenticated student: Insert ONLY own course progress
DROP POLICY IF EXISTS "Users can insert own course progress" ON public.student_course_progress;
CREATE POLICY "Users can insert own course progress"
    ON public.student_course_progress
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Authenticated student: Update ONLY own course progress
DROP POLICY IF EXISTS "Users can update own course progress" ON public.student_course_progress;
CREATE POLICY "Users can update own course progress"
    ON public.student_course_progress
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Authenticated student: Delete ONLY own course progress
DROP POLICY IF EXISTS "Users can delete own course progress" ON public.student_course_progress;
CREATE POLICY "Users can delete own course progress"
    ON public.student_course_progress
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Service role full access for backend worker/admin processes
DROP POLICY IF EXISTS "Service role full access on student_course_progress" ON public.student_course_progress;
CREATE POLICY "Service role full access on student_course_progress"
    ON public.student_course_progress
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ── 7. RLS Policies: student_lesson_progress ─────────────────────────────────

-- Authenticated student: Read ONLY own lesson progress
DROP POLICY IF EXISTS "Users can read own lesson progress" ON public.student_lesson_progress;
CREATE POLICY "Users can read own lesson progress"
    ON public.student_lesson_progress
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Authenticated student: Insert ONLY own lesson progress
DROP POLICY IF EXISTS "Users can insert own lesson progress" ON public.student_lesson_progress;
CREATE POLICY "Users can insert own lesson progress"
    ON public.student_lesson_progress
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Authenticated student: Update ONLY own lesson progress
DROP POLICY IF EXISTS "Users can update own lesson progress" ON public.student_lesson_progress;
CREATE POLICY "Users can update own lesson progress"
    ON public.student_lesson_progress
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Authenticated student: Delete ONLY own lesson progress
DROP POLICY IF EXISTS "Users can delete own lesson progress" ON public.student_lesson_progress;
CREATE POLICY "Users can delete own lesson progress"
    ON public.student_lesson_progress
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Service role full access for backend worker/admin processes
DROP POLICY IF EXISTS "Service role full access on student_lesson_progress" ON public.student_lesson_progress;
CREATE POLICY "Service role full access on student_lesson_progress"
    ON public.student_lesson_progress
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ── 8. Explicit Role Grants ──────────────────────────────────────────────────
GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_course_progress TO authenticated;
GRANT ALL ON public.student_course_progress TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_lesson_progress TO authenticated;
GRANT ALL ON public.student_lesson_progress TO service_role;
