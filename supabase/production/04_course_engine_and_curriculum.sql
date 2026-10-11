-- ====================================================================
-- MODULE 4: COURSE ENGINE & CURRICULUM (8 TABLES + MEDIA STORAGE)
-- ====================================================================

-- 1. COURSES
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
    CONSTRAINT chk_courses_status CHECK (status IN ('DRAFT', 'IN_REVIEW', 'PUBLISHED', 'ARCHIVED'))
);
CREATE INDEX IF NOT EXISTS idx_courses_slug ON public.courses(slug);
CREATE INDEX IF NOT EXISTS idx_courses_status ON public.courses(status);

-- 2. COURSE MODULES
CREATE TABLE IF NOT EXISTS public.course_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NULL,
    position INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_course_modules_course_position UNIQUE (course_id, position) DEFERRABLE INITIALLY IMMEDIATE
);
CREATE INDEX IF NOT EXISTS idx_course_modules_course ON public.course_modules(course_id, position);

-- 3. COURSE LESSONS (Metadata)
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
    CONSTRAINT uq_course_lessons_module_position UNIQUE (module_id, position) DEFERRABLE INITIALLY IMMEDIATE
);
CREATE INDEX IF NOT EXISTS idx_course_lessons_module ON public.course_lessons(module_id, position);

-- 4. COURSE LESSON CONTENTS (Structured Markdown / Content Blocks)
CREATE TABLE IF NOT EXISTS public.course_lesson_contents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID NOT NULL REFERENCES public.course_lessons(id) ON DELETE CASCADE,
    schema_version INTEGER NOT NULL DEFAULT 1,
    blocks JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_course_lesson_contents_lesson UNIQUE (lesson_id)
);
CREATE INDEX IF NOT EXISTS idx_course_lesson_contents_lesson ON public.course_lesson_contents(lesson_id);

-- 5. COURSE LESSON MEDIA (Image & File Attachments)
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
    CONSTRAINT uq_course_lesson_media_storage_path UNIQUE (storage_path)
);
CREATE INDEX IF NOT EXISTS idx_course_lesson_media_lesson ON public.course_lesson_media(lesson_id);

-- 6. COURSE QUIZZES (One Quiz per Module)
CREATE TABLE IF NOT EXISTS public.course_quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID NOT NULL REFERENCES public.course_modules(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NULL,
    passing_score INTEGER NOT NULL DEFAULT 70,
    status TEXT NOT NULL DEFAULT 'DRAFT',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_course_quizzes_module UNIQUE (module_id),
    CONSTRAINT chk_course_quizzes_passing_score CHECK (passing_score >= 0 AND passing_score <= 100)
);

-- 7. QUIZ QUESTIONS
CREATE TABLE IF NOT EXISTS public.quiz_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL REFERENCES public.course_quizzes(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type TEXT NOT NULL DEFAULT 'SINGLE_SELECT',
    position INTEGER NOT NULL DEFAULT 1,
    explanation TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_quiz_questions_quiz_position UNIQUE (quiz_id, position) DEFERRABLE INITIALLY IMMEDIATE
);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz ON public.quiz_questions(quiz_id, position);

-- 8. QUIZ OPTIONS (Answers)
CREATE TABLE IF NOT EXISTS public.quiz_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT false,
    position INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_quiz_options_question_position UNIQUE (question_id, position) DEFERRABLE INITIALLY IMMEDIATE
);
CREATE INDEX IF NOT EXISTS idx_quiz_options_question ON public.quiz_options(question_id);

-- AUDIT LOGS (Platform-wide Admin Audit Trail)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── STORAGE BUCKET FOR LESSON MEDIA ──────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'course-lesson-media',
    'course-lesson-media',
    true,
    10485760,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
    public = true;

-- ── TRIGGERS ─────────────────────────────────────────────────────────
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN SELECT unnest(ARRAY['courses', 'course_modules', 'course_lessons', 'course_lesson_contents', 'course_lesson_media', 'course_quizzes', 'quiz_questions', 'quiz_options'])
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS trg_set_updated_at_%I ON public.%I;', t, t);
        EXECUTE format('CREATE TRIGGER trg_set_updated_at_%I BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();', t, t);
    END LOOP;
END;
$$;

-- ── ROW LEVEL SECURITY (RLS) ─────────────────────────────────────────
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_lesson_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_lesson_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Public Read for Published Content
DROP POLICY IF EXISTS "Public view published courses" ON public.courses;
CREATE POLICY "Public view published courses" ON public.courses FOR SELECT USING (status = 'PUBLISHED');

DROP POLICY IF EXISTS "Public view modules of published courses" ON public.course_modules;
CREATE POLICY "Public view modules of published courses" ON public.course_modules FOR SELECT USING (EXISTS (SELECT 1 FROM public.courses WHERE courses.id = course_modules.course_id AND courses.status = 'PUBLISHED'));

DROP POLICY IF EXISTS "Public view lessons of published courses" ON public.course_lessons;
CREATE POLICY "Public view lessons of published courses" ON public.course_lessons FOR SELECT USING (EXISTS (SELECT 1 FROM public.course_modules JOIN public.courses ON courses.id = course_modules.course_id WHERE course_modules.id = course_lessons.module_id AND courses.status = 'PUBLISHED'));

DROP POLICY IF EXISTS "Public view lesson contents" ON public.course_lesson_contents;
CREATE POLICY "Public view lesson contents" ON public.course_lesson_contents FOR SELECT USING (EXISTS (SELECT 1 FROM public.course_lessons cl JOIN public.course_modules cm ON cm.id = cl.module_id JOIN public.courses c ON c.id = cm.course_id WHERE cl.id = course_lesson_contents.lesson_id AND c.status = 'PUBLISHED'));

DROP POLICY IF EXISTS "Public view lesson media" ON public.course_lesson_media;
CREATE POLICY "Public view lesson media" ON public.course_lesson_media FOR SELECT USING (EXISTS (SELECT 1 FROM public.courses WHERE courses.id = course_lesson_media.course_id AND courses.status = 'PUBLISHED'));

DROP POLICY IF EXISTS "Public view published quizzes" ON public.course_quizzes;
CREATE POLICY "Public view published quizzes" ON public.course_quizzes FOR SELECT USING (status = 'PUBLISHED');

DROP POLICY IF EXISTS "Public view quiz questions" ON public.quiz_questions;
CREATE POLICY "Public view quiz questions" ON public.quiz_questions FOR SELECT USING (EXISTS (SELECT 1 FROM public.course_quizzes WHERE course_quizzes.id = quiz_questions.quiz_id AND course_quizzes.status = 'PUBLISHED'));

DROP POLICY IF EXISTS "Public view quiz options" ON public.quiz_options;
CREATE POLICY "Public view quiz options" ON public.quiz_options FOR SELECT USING (EXISTS (SELECT 1 FROM public.quiz_questions qq JOIN public.course_quizzes cq ON cq.id = qq.quiz_id WHERE qq.id = quiz_options.question_id AND cq.status = 'PUBLISHED'));

-- Service Role full access across all course tables
DO $$
DECLARE
    tbl text;
BEGIN
    FOR tbl IN SELECT unnest(ARRAY['courses', 'course_modules', 'course_lessons', 'course_lesson_contents', 'course_lesson_media', 'course_quizzes', 'quiz_questions', 'quiz_options', 'audit_logs'])
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Service role full access on %I" ON public.%I;', tbl, tbl);
        EXECUTE format('CREATE POLICY "Service role full access on %I" ON public.%I FOR ALL TO service_role USING (true) WITH CHECK (true);', tbl, tbl);
    END LOOP;
END;
$$;
