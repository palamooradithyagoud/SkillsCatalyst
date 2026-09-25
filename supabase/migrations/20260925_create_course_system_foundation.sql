-- ============================================================================
-- Migration: 20260925_create_course_system_foundation.sql
-- Description: Establishes the production-ready foundation for SkillsCatalyst
--              Course System (Phase 1):
--                courses
--                  ↓
--                course_modules
--                  ↓
--                course_lessons (metadata only)
--
--                course_modules
--                  ↓
--                course_quizzes (UNIQUE module_id - exactly one quiz per module)
--                  ↓
--                quiz_questions (SINGLE_SELECT foundation)
--                  ↓
--                quiz_options (server-side is_correct)
--
-- Also provisions public.audit_logs for platform-wide administrative audit history.
-- ============================================================================

-- ── 1. Create courses Table ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    short_description TEXT NULL,
    description TEXT NULL,
    thumbnail_url TEXT NULL,
    category TEXT NULL,
    difficulty TEXT NOT NULL,
    estimated_duration_minutes INTEGER NULL,
    status TEXT NOT NULL DEFAULT 'DRAFT',
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    published_at TIMESTAMPTZ NULL,
    archived_at TIMESTAMPTZ NULL,

    -- Constraints
    CONSTRAINT chk_courses_title_length CHECK (char_length(title) >= 1 AND char_length(title) <= 255),
    CONSTRAINT chk_courses_slug_length CHECK (char_length(slug) >= 1 AND char_length(slug) <= 255),
    CONSTRAINT chk_courses_short_desc_length CHECK (short_description IS NULL OR char_length(short_description) <= 1000),
    CONSTRAINT chk_courses_difficulty CHECK (lower(difficulty) IN ('beginner', 'intermediate', 'advanced')),
    CONSTRAINT chk_courses_duration CHECK (estimated_duration_minutes IS NULL OR estimated_duration_minutes >= 0),
    CONSTRAINT chk_courses_status CHECK (status IN ('DRAFT', 'IN_REVIEW', 'PUBLISHED', 'ARCHIVED'))
);

-- ── 2. Create course_modules Table ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.course_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NULL,
    position INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Constraints
    CONSTRAINT chk_course_modules_title_length CHECK (char_length(title) >= 1 AND char_length(title) <= 255),
    CONSTRAINT chk_course_modules_position CHECK (position >= 1),
    CONSTRAINT uq_course_modules_course_position UNIQUE (course_id, position) DEFERRABLE INITIALLY IMMEDIATE
);

-- ── 3. Create course_lessons Table (Metadata Only) ───────────────────────────
CREATE TABLE IF NOT EXISTS public.course_lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID NOT NULL REFERENCES public.course_modules(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT NULL,
    short_description TEXT NULL,
    position INTEGER NOT NULL DEFAULT 1,
    estimated_duration_minutes INTEGER NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Constraints
    CONSTRAINT chk_course_lessons_title_length CHECK (char_length(title) >= 1 AND char_length(title) <= 255),
    CONSTRAINT chk_course_lessons_position CHECK (position >= 1),
    CONSTRAINT chk_course_lessons_duration CHECK (estimated_duration_minutes IS NULL OR estimated_duration_minutes >= 0),
    CONSTRAINT uq_course_lessons_module_position UNIQUE (module_id, position) DEFERRABLE INITIALLY IMMEDIATE
);

-- ── 4. Create course_quizzes Table (One Quiz per Module) ─────────────────────
CREATE TABLE IF NOT EXISTS public.course_quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID NOT NULL REFERENCES public.course_modules(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NULL,
    status TEXT NOT NULL DEFAULT 'DRAFT',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Constraints
    CONSTRAINT chk_course_quizzes_title_length CHECK (char_length(title) >= 1 AND char_length(title) <= 255),
    CONSTRAINT chk_course_quizzes_status CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
    CONSTRAINT uq_course_quizzes_module_id UNIQUE (module_id)
);

-- ── 5. Create quiz_questions Table ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.quiz_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL REFERENCES public.course_quizzes(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type TEXT NOT NULL DEFAULT 'SINGLE_SELECT',
    position INTEGER NOT NULL DEFAULT 1,
    explanation TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Constraints
    CONSTRAINT chk_quiz_questions_text_length CHECK (char_length(question_text) >= 1),
    CONSTRAINT chk_quiz_questions_type CHECK (question_type IN ('SINGLE_SELECT', 'MULTI_SELECT', 'TRUE_FALSE')),
    CONSTRAINT chk_quiz_questions_position CHECK (position >= 1),
    CONSTRAINT uq_quiz_questions_quiz_position UNIQUE (quiz_id, position) DEFERRABLE INITIALLY IMMEDIATE
);

-- ── 6. Create quiz_options Table ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.quiz_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT false,
    position INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Constraints
    CONSTRAINT chk_quiz_options_text_length CHECK (char_length(option_text) >= 1),
    CONSTRAINT chk_quiz_options_position CHECK (position >= 1),
    CONSTRAINT uq_quiz_options_question_position UNIQUE (question_id, position) DEFERRABLE INITIALLY IMMEDIATE
);

-- ── 7. Create audit_logs Table (Centralized Administrative Audit) ─────────────
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    user_id UUID NULL,
    details JSONB NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 8. Indexes for Query Performance & Hierarchy Navigation ──────────────────
-- courses
CREATE INDEX IF NOT EXISTS idx_courses_status ON public.courses(status);
CREATE INDEX IF NOT EXISTS idx_courses_category ON public.courses(category);
CREATE INDEX IF NOT EXISTS idx_courses_difficulty ON public.courses(difficulty);
CREATE INDEX IF NOT EXISTS idx_courses_created_at ON public.courses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_courses_slug ON public.courses(slug);

-- course_modules
CREATE INDEX IF NOT EXISTS idx_course_modules_course_id ON public.course_modules(course_id);
CREATE INDEX IF NOT EXISTS idx_course_modules_course_pos ON public.course_modules(course_id, position);

-- course_lessons
CREATE INDEX IF NOT EXISTS idx_course_lessons_module_id ON public.course_lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_course_lessons_module_pos ON public.course_lessons(module_id, position);

-- course_quizzes
CREATE INDEX IF NOT EXISTS idx_course_quizzes_module_id ON public.course_quizzes(module_id);

-- quiz_questions
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_id ON public.quiz_questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_pos ON public.quiz_questions(quiz_id, position);

-- quiz_options
CREATE INDEX IF NOT EXISTS idx_quiz_options_question_id ON public.quiz_options(question_id);
CREATE INDEX IF NOT EXISTS idx_quiz_options_question_pos ON public.quiz_options(question_id, position);

-- audit_logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- ── 9. Triggers for updated_at Column ──────────────────────────────────────────
DROP TRIGGER IF EXISTS trg_courses_updated_at ON public.courses;
CREATE TRIGGER trg_courses_updated_at
    BEFORE UPDATE ON public.courses
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_course_modules_updated_at ON public.course_modules;
CREATE TRIGGER trg_course_modules_updated_at
    BEFORE UPDATE ON public.course_modules
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_course_lessons_updated_at ON public.course_lessons;
CREATE TRIGGER trg_course_lessons_updated_at
    BEFORE UPDATE ON public.course_lessons
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_course_quizzes_updated_at ON public.course_quizzes;
CREATE TRIGGER trg_course_quizzes_updated_at
    BEFORE UPDATE ON public.course_quizzes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_quiz_questions_updated_at ON public.quiz_questions;
CREATE TRIGGER trg_quiz_questions_updated_at
    BEFORE UPDATE ON public.quiz_questions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_quiz_options_updated_at ON public.quiz_options;
CREATE TRIGGER trg_quiz_options_updated_at
    BEFORE UPDATE ON public.quiz_options
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ── 10. Enable Row Level Security (RLS) ───────────────────────────────────────
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ── 11. RLS Policies: courses ────────────────────────────────────────────────
-- Public/Student read: ONLY published courses are visible
DROP POLICY IF EXISTS "Public can view published courses" ON public.courses;
CREATE POLICY "Public can view published courses"
    ON public.courses
    FOR SELECT
    TO public
    USING (status = 'PUBLISHED');

-- Admin/Owner full access
DROP POLICY IF EXISTS "Admins can manage courses" ON public.courses;
CREATE POLICY "Admins can manage courses"
    ON public.courses
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() 
              AND profiles.role IN ('owner', 'admin', 'editor')
        )
        OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('owner', 'admin', 'editor')
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() 
              AND profiles.role IN ('owner', 'admin', 'editor')
        )
        OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('owner', 'admin', 'editor')
    );

-- Service role full access
DROP POLICY IF EXISTS "Service role full access on courses" ON public.courses;
CREATE POLICY "Service role full access on courses"
    ON public.courses
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ── 12. RLS Policies: course_modules ─────────────────────────────────────────
DROP POLICY IF EXISTS "Public can view published course modules" ON public.course_modules;
CREATE POLICY "Public can view published course modules"
    ON public.course_modules
    FOR SELECT
    TO public
    USING (
        EXISTS (
            SELECT 1 FROM public.courses
            WHERE courses.id = course_modules.course_id 
              AND courses.status = 'PUBLISHED'
        )
    );

DROP POLICY IF EXISTS "Admins can manage course modules" ON public.course_modules;
CREATE POLICY "Admins can manage course modules"
    ON public.course_modules
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() 
              AND profiles.role IN ('owner', 'admin', 'editor')
        )
        OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('owner', 'admin', 'editor')
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() 
              AND profiles.role IN ('owner', 'admin', 'editor')
        )
        OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('owner', 'admin', 'editor')
    );

DROP POLICY IF EXISTS "Service role full access on course modules" ON public.course_modules;
CREATE POLICY "Service role full access on course modules"
    ON public.course_modules
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ── 13. RLS Policies: course_lessons ─────────────────────────────────────────
DROP POLICY IF EXISTS "Public can view published course lessons" ON public.course_lessons;
CREATE POLICY "Public can view published course lessons"
    ON public.course_lessons
    FOR SELECT
    TO public
    USING (
        EXISTS (
            SELECT 1 FROM public.course_modules
            JOIN public.courses ON courses.id = course_modules.course_id
            WHERE course_modules.id = course_lessons.module_id 
              AND courses.status = 'PUBLISHED'
        )
    );

DROP POLICY IF EXISTS "Admins can manage course lessons" ON public.course_lessons;
CREATE POLICY "Admins can manage course lessons"
    ON public.course_lessons
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() 
              AND profiles.role IN ('owner', 'admin', 'editor')
        )
        OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('owner', 'admin', 'editor')
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() 
              AND profiles.role IN ('owner', 'admin', 'editor')
        )
        OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('owner', 'admin', 'editor')
    );

DROP POLICY IF EXISTS "Service role full access on course lessons" ON public.course_lessons;
CREATE POLICY "Service role full access on course lessons"
    ON public.course_lessons
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ── 14. RLS Policies: course_quizzes ─────────────────────────────────────────
DROP POLICY IF EXISTS "Public can view published course quizzes" ON public.course_quizzes;
CREATE POLICY "Public can view published course quizzes"
    ON public.course_quizzes
    FOR SELECT
    TO public
    USING (
        EXISTS (
            SELECT 1 FROM public.course_modules
            JOIN public.courses ON courses.id = course_modules.course_id
            WHERE course_modules.id = course_quizzes.module_id 
              AND courses.status = 'PUBLISHED'
              AND course_quizzes.status = 'PUBLISHED'
        )
    );

DROP POLICY IF EXISTS "Admins can manage course quizzes" ON public.course_quizzes;
CREATE POLICY "Admins can manage course quizzes"
    ON public.course_quizzes
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() 
              AND profiles.role IN ('owner', 'admin', 'editor')
        )
        OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('owner', 'admin', 'editor')
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() 
              AND profiles.role IN ('owner', 'admin', 'editor')
        )
        OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('owner', 'admin', 'editor')
    );

DROP POLICY IF EXISTS "Service role full access on course quizzes" ON public.course_quizzes;
CREATE POLICY "Service role full access on course quizzes"
    ON public.course_quizzes
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ── 15. RLS Policies: quiz_questions ─────────────────────────────────────────
DROP POLICY IF EXISTS "Public can view published quiz questions" ON public.quiz_questions;
CREATE POLICY "Public can view published quiz questions"
    ON public.quiz_questions
    FOR SELECT
    TO public
    USING (
        EXISTS (
            SELECT 1 FROM public.course_quizzes
            JOIN public.course_modules ON course_modules.id = course_quizzes.module_id
            JOIN public.courses ON courses.id = course_modules.course_id
            WHERE course_quizzes.id = quiz_questions.quiz_id 
              AND courses.status = 'PUBLISHED'
              AND course_quizzes.status = 'PUBLISHED'
        )
    );

DROP POLICY IF EXISTS "Admins can manage quiz questions" ON public.quiz_questions;
CREATE POLICY "Admins can manage quiz questions"
    ON public.quiz_questions
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() 
              AND profiles.role IN ('owner', 'admin', 'editor')
        )
        OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('owner', 'admin', 'editor')
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() 
              AND profiles.role IN ('owner', 'admin', 'editor')
        )
        OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('owner', 'admin', 'editor')
    );

DROP POLICY IF EXISTS "Service role full access on quiz questions" ON public.quiz_questions;
CREATE POLICY "Service role full access on quiz questions"
    ON public.quiz_questions
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ── 16. RLS Policies: quiz_options ───────────────────────────────────────────
DROP POLICY IF EXISTS "Public can view published quiz options" ON public.quiz_options;
CREATE POLICY "Public can view published quiz options"
    ON public.quiz_options
    FOR SELECT
    TO public
    USING (
        EXISTS (
            SELECT 1 FROM public.quiz_questions
            JOIN public.course_quizzes ON course_quizzes.id = quiz_questions.quiz_id
            JOIN public.course_modules ON course_modules.id = course_quizzes.module_id
            JOIN public.courses ON courses.id = course_modules.course_id
            WHERE quiz_questions.id = quiz_options.question_id 
              AND courses.status = 'PUBLISHED'
              AND course_quizzes.status = 'PUBLISHED'
        )
    );

DROP POLICY IF EXISTS "Admins can manage quiz options" ON public.quiz_options;
CREATE POLICY "Admins can manage quiz options"
    ON public.quiz_options
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() 
              AND profiles.role IN ('owner', 'admin', 'editor')
        )
        OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('owner', 'admin', 'editor')
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() 
              AND profiles.role IN ('owner', 'admin', 'editor')
        )
        OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('owner', 'admin', 'editor')
    );

DROP POLICY IF EXISTS "Service role full access on quiz options" ON public.quiz_options;
CREATE POLICY "Service role full access on quiz options"
    ON public.quiz_options
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ── 17. RLS Policies: audit_logs ─────────────────────────────────────────────
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;
CREATE POLICY "Admins can view audit logs"
    ON public.audit_logs
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() 
              AND profiles.role IN ('owner', 'admin', 'editor')
        )
        OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('owner', 'admin', 'editor')
    );

DROP POLICY IF EXISTS "Service role full access on audit logs" ON public.audit_logs;
CREATE POLICY "Service role full access on audit logs"
    ON public.audit_logs
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ── 18. Permissions / Grants ──────────────────────────────────────────────────
GRANT SELECT ON TABLE public.courses TO anon, authenticated;
GRANT SELECT ON TABLE public.course_modules TO anon, authenticated;
GRANT SELECT ON TABLE public.course_lessons TO anon, authenticated;
GRANT SELECT ON TABLE public.course_quizzes TO anon, authenticated;
GRANT SELECT ON TABLE public.quiz_questions TO anon, authenticated;
GRANT SELECT ON TABLE public.quiz_options TO anon, authenticated;

GRANT ALL ON TABLE public.courses TO service_role;
GRANT ALL ON TABLE public.course_modules TO service_role;
GRANT ALL ON TABLE public.course_lessons TO service_role;
GRANT ALL ON TABLE public.course_quizzes TO service_role;
GRANT ALL ON TABLE public.quiz_questions TO service_role;
GRANT ALL ON TABLE public.quiz_options TO service_role;
GRANT ALL ON TABLE public.audit_logs TO service_role;
