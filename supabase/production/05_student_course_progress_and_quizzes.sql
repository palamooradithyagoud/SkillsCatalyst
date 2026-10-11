-- ====================================================================
-- MODULE 5: STUDENT COURSE PROGRESS & QUIZ SUBMISSIONS (5 TABLES)
-- ====================================================================

-- 1. STUDENT COURSE PROGRESS (Overall Course Completion & Last Active Lesson)
CREATE TABLE IF NOT EXISTS public.student_course_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    last_lesson_id UUID NULL REFERENCES public.course_lessons(id) ON DELETE SET NULL,
    last_activity_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_student_course_progress UNIQUE (user_id, course_id)
);
CREATE INDEX IF NOT EXISTS idx_student_course_prog_user ON public.student_course_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_student_course_prog_course ON public.student_course_progress(course_id);

-- 2. STUDENT LESSON PROGRESS (Granular Lesson Check-Off)
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
    CONSTRAINT uq_student_lesson_progress UNIQUE (user_id, lesson_id)
);
CREATE INDEX IF NOT EXISTS idx_student_lesson_prog_user ON public.student_lesson_progress(user_id, course_id);
CREATE INDEX IF NOT EXISTS idx_student_lesson_prog_lesson ON public.student_lesson_progress(user_id, lesson_id);

-- 3. STUDENT MODULE PROGRESS (Module Completion State)
CREATE TABLE IF NOT EXISTS public.student_module_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    module_id UUID NOT NULL REFERENCES public.course_modules(id) ON DELETE CASCADE,
    lessons_complete BOOLEAN NOT NULL DEFAULT FALSE,
    quiz_passed BOOLEAN NOT NULL DEFAULT FALSE,
    best_score INTEGER NULL,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_student_module_progress UNIQUE (user_id, module_id)
);
CREATE INDEX IF NOT EXISTS idx_student_module_prog_user ON public.student_module_progress(user_id, course_id);

-- 4. STUDENT QUIZ ATTEMPTS (Quiz Submissions & Grades)
CREATE TABLE IF NOT EXISTS public.student_quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    module_id UUID NOT NULL REFERENCES public.course_modules(id) ON DELETE CASCADE,
    quiz_id UUID NOT NULL REFERENCES public.course_quizzes(id) ON DELETE CASCADE,
    attempt_number INTEGER NOT NULL,
    score_percentage INTEGER NOT NULL,
    correct_count INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    passed BOOLEAN NOT NULL DEFAULT FALSE,
    passing_score INTEGER NOT NULL DEFAULT 70,
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_sqa_score CHECK (score_percentage >= 0 AND score_percentage <= 100)
);
CREATE INDEX IF NOT EXISTS idx_sqa_user ON public.student_quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_sqa_quiz ON public.student_quiz_attempts(quiz_id);

-- 5. STUDENT QUIZ ATTEMPT ANSWERS (Per-Question Answers)
CREATE TABLE IF NOT EXISTS public.student_quiz_attempt_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID NOT NULL REFERENCES public.student_quiz_attempts(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
    selected_option_id UUID NOT NULL REFERENCES public.quiz_options(id) ON DELETE CASCADE,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_attempt_answer UNIQUE (attempt_id, question_id)
);
CREATE INDEX IF NOT EXISTS idx_sqaa_attempt ON public.student_quiz_attempt_answers(attempt_id);

-- ── TRIGGERS ─────────────────────────────────────────────────────────
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN SELECT unnest(ARRAY['student_course_progress', 'student_lesson_progress', 'student_module_progress'])
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS trg_set_updated_at_%I ON public.%I;', t, t);
        EXECUTE format('CREATE TRIGGER trg_set_updated_at_%I BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();', t, t);
    END LOOP;
END;
$$;

-- ── ROW LEVEL SECURITY (RLS) ─────────────────────────────────────────
ALTER TABLE public.student_course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_module_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_quiz_attempt_answers ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
    tbl text;
BEGIN
    FOR tbl IN SELECT unnest(ARRAY['student_course_progress', 'student_lesson_progress'])
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Users manage own %I" ON public.%I;', tbl, tbl);
        EXECUTE format('CREATE POLICY "Users manage own %I" ON public.%I FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);', tbl, tbl);
        
        EXECUTE format('DROP POLICY IF EXISTS "Service role %I" ON public.%I;', tbl, tbl);
        EXECUTE format('CREATE POLICY "Service role %I" ON public.%I FOR ALL TO service_role USING (true) WITH CHECK (true);', tbl, tbl);
    END LOOP;

    -- Quiz Attempts and Module Progress: Read-only for authenticated students, mutations strictly via backend service_role
    FOR tbl IN SELECT unnest(ARRAY['student_module_progress', 'student_quiz_attempts'])
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Users manage own %I" ON public.%I;', tbl, tbl);
        EXECUTE format('DROP POLICY IF EXISTS "Users can read own %I" ON public.%I;', tbl, tbl);
        EXECUTE format('CREATE POLICY "Users can read own %I" ON public.%I FOR SELECT TO authenticated USING (auth.uid() = user_id);', tbl, tbl);
        
        EXECUTE format('DROP POLICY IF EXISTS "Service role %I" ON public.%I;', tbl, tbl);
        EXECUTE format('CREATE POLICY "Service role %I" ON public.%I FOR ALL TO service_role USING (true) WITH CHECK (true);', tbl, tbl);
    END LOOP;
END;
$$;

-- Quiz Attempt Answers
DROP POLICY IF EXISTS "Users view own quiz answers" ON public.student_quiz_attempt_answers;
CREATE POLICY "Users view own quiz answers" ON public.student_quiz_attempt_answers FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM public.student_quiz_attempts sqa WHERE sqa.id = student_quiz_attempt_answers.attempt_id AND sqa.user_id = auth.uid()));

DROP POLICY IF EXISTS "Users insert own quiz answers" ON public.student_quiz_attempt_answers;
CREATE POLICY "Users insert own quiz answers" ON public.student_quiz_attempt_answers FOR INSERT TO authenticated
    WITH CHECK (EXISTS (SELECT 1 FROM public.student_quiz_attempts sqa WHERE sqa.id = student_quiz_attempt_answers.attempt_id AND sqa.user_id = auth.uid()));

DROP POLICY IF EXISTS "Service role quiz answers" ON public.student_quiz_attempt_answers;
CREATE POLICY "Service role quiz answers" ON public.student_quiz_attempt_answers FOR ALL TO service_role USING (true) WITH CHECK (true);
