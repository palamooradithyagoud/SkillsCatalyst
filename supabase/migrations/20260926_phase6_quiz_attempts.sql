-- ============================================================================
-- Migration: 20260926_phase6_quiz_attempts.sql
-- Description: Phase 6 - Student Quiz Attempts, Scoring, and Module Completion.
--
-- Adds:
--   1. passing_score field to course_quizzes (default 70)
--   2. student_quiz_attempts   - one row per attempt per student per quiz
--   3. student_quiz_attempt_answers - one row per question per attempt
--   4. student_module_progress - module completion state (lessons + quiz)
--
-- Invariants:
--   - passing_score is stored on the quiz and checked by backend at submission time.
--   - Attempts are immutable once submitted (no student UPDATE/DELETE).
--   - attempt_number is safe under concurrent submissions via nextval sequence.
--   - correct answers (is_correct) in attempt_answers are backend-written only.
--   - Module completion requires ALL required lessons complete AND a passed attempt.
--   - RLS: every policy is user-scoped to auth.uid(); service_role has full access.
-- ============================================================================

-- ── 1. Add passing_score to course_quizzes ───────────────────────────────────
-- Default 70 means 70% is required to pass.
ALTER TABLE public.course_quizzes
    ADD COLUMN IF NOT EXISTS passing_score INTEGER NOT NULL DEFAULT 70;

-- Constraint: passing_score must be 0-100.
ALTER TABLE public.course_quizzes
    DROP CONSTRAINT IF EXISTS chk_course_quizzes_passing_score;
ALTER TABLE public.course_quizzes
    ADD CONSTRAINT chk_course_quizzes_passing_score
    CHECK (passing_score >= 0 AND passing_score <= 100);

-- ── 2. Create student_quiz_attempts Table ─────────────────────────────────────
-- One row per submission. Immutable after submission from the student perspective.
CREATE TABLE IF NOT EXISTS public.student_quiz_attempts (
    id                UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id         UUID         NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    module_id         UUID         NOT NULL REFERENCES public.course_modules(id) ON DELETE CASCADE,
    quiz_id           UUID         NOT NULL REFERENCES public.course_quizzes(id) ON DELETE CASCADE,
    attempt_number    INTEGER      NOT NULL,
    score_percentage  INTEGER      NOT NULL,
    correct_count     INTEGER      NOT NULL,
    total_questions   INTEGER      NOT NULL,
    passed            BOOLEAN      NOT NULL DEFAULT FALSE,
    passing_score     INTEGER      NOT NULL DEFAULT 70,
    started_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),
    submitted_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    created_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),

    -- Constraints
    CONSTRAINT chk_sqa_score CHECK (score_percentage >= 0 AND score_percentage <= 100),
    CONSTRAINT chk_sqa_correct_count CHECK (correct_count >= 0),
    CONSTRAINT chk_sqa_total_questions CHECK (total_questions >= 0),
    CONSTRAINT chk_sqa_attempt_number CHECK (attempt_number >= 1),
    CONSTRAINT chk_sqa_passing_score CHECK (passing_score >= 0 AND passing_score <= 100)
);

-- ── 3. Create student_quiz_attempt_answers Table ──────────────────────────────
-- One row per question per attempt. Stores question_id, selected option, correctness.
CREATE TABLE IF NOT EXISTS public.student_quiz_attempt_answers (
    id                  UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id          UUID  NOT NULL REFERENCES public.student_quiz_attempts(id) ON DELETE CASCADE,
    question_id         UUID  NOT NULL REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
    selected_option_id  UUID  NOT NULL REFERENCES public.quiz_options(id) ON DELETE CASCADE,
    is_correct          BOOLEAN NOT NULL DEFAULT FALSE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Each question answered exactly once per attempt
    CONSTRAINT uq_attempt_answer UNIQUE (attempt_id, question_id)
);

-- ── 4. Create student_module_progress Table ───────────────────────────────────
-- Module-level completion state: lessons_complete AND quiz_passed.
-- This is denormalized for performance and auditability.
CREATE TABLE IF NOT EXISTS public.student_module_progress (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id       UUID        NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    module_id       UUID        NOT NULL REFERENCES public.course_modules(id) ON DELETE CASCADE,
    lessons_complete BOOLEAN    NOT NULL DEFAULT FALSE,
    quiz_passed     BOOLEAN     NOT NULL DEFAULT FALSE,
    best_score      INTEGER     NULL,                        -- Highest passing score achieved
    completed       BOOLEAN     NOT NULL DEFAULT FALSE,      -- TRUE only if lessons_complete AND quiz_passed
    completed_at    TIMESTAMPTZ NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Exactly one row per student+module
    CONSTRAINT uq_student_module_progress UNIQUE (user_id, module_id)
);

-- ── 5. Performance Indexes ────────────────────────────────────────────────────

-- student_quiz_attempts
CREATE INDEX IF NOT EXISTS idx_sqa_user_id
    ON public.student_quiz_attempts (user_id);
CREATE INDEX IF NOT EXISTS idx_sqa_quiz_id
    ON public.student_quiz_attempts (quiz_id);
CREATE INDEX IF NOT EXISTS idx_sqa_user_quiz
    ON public.student_quiz_attempts (user_id, quiz_id);
CREATE INDEX IF NOT EXISTS idx_sqa_user_course
    ON public.student_quiz_attempts (user_id, course_id);
CREATE INDEX IF NOT EXISTS idx_sqa_attempt_number
    ON public.student_quiz_attempts (user_id, quiz_id, attempt_number);

-- student_quiz_attempt_answers
CREATE INDEX IF NOT EXISTS idx_sqaa_attempt_id
    ON public.student_quiz_attempt_answers (attempt_id);

-- student_module_progress
CREATE INDEX IF NOT EXISTS idx_smp_user_id
    ON public.student_module_progress (user_id);
CREATE INDEX IF NOT EXISTS idx_smp_user_course
    ON public.student_module_progress (user_id, course_id);
CREATE INDEX IF NOT EXISTS idx_smp_user_module
    ON public.student_module_progress (user_id, module_id);

-- ── 6. Automated updated_at Trigger for student_module_progress ───────────────
DROP TRIGGER IF EXISTS trg_student_module_progress_updated_at ON public.student_module_progress;
CREATE TRIGGER trg_student_module_progress_updated_at
    BEFORE UPDATE ON public.student_module_progress
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ── 7. Enable Row Level Security (RLS) ───────────────────────────────────────
ALTER TABLE public.student_quiz_attempts        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_quiz_attempt_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_module_progress      ENABLE ROW LEVEL SECURITY;

-- ── 8. RLS Policies: student_quiz_attempts ────────────────────────────────────

-- Authenticated student: SELECT own attempts only
DROP POLICY IF EXISTS "Users can read own quiz attempts" ON public.student_quiz_attempts;
CREATE POLICY "Users can read own quiz attempts"
    ON public.student_quiz_attempts
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Authenticated student: INSERT own attempts only
DROP POLICY IF EXISTS "Users can insert own quiz attempts" ON public.student_quiz_attempts;
CREATE POLICY "Users can insert own quiz attempts"
    ON public.student_quiz_attempts
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- NOTE: No UPDATE/DELETE for students. Attempts are immutable once submitted.

-- Service role full access
DROP POLICY IF EXISTS "Service role full access on student_quiz_attempts" ON public.student_quiz_attempts;
CREATE POLICY "Service role full access on student_quiz_attempts"
    ON public.student_quiz_attempts
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ── 9. RLS Policies: student_quiz_attempt_answers ─────────────────────────────

-- Student can SELECT own attempt answers (via attempt_id join)
DROP POLICY IF EXISTS "Users can read own quiz attempt answers" ON public.student_quiz_attempt_answers;
CREATE POLICY "Users can read own quiz attempt answers"
    ON public.student_quiz_attempt_answers
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.student_quiz_attempts
            WHERE student_quiz_attempts.id = student_quiz_attempt_answers.attempt_id
              AND student_quiz_attempts.user_id = auth.uid()
        )
    );

-- Student can INSERT own attempt answers (backend validates user_id on the attempt)
DROP POLICY IF EXISTS "Users can insert own quiz attempt answers" ON public.student_quiz_attempt_answers;
CREATE POLICY "Users can insert own quiz attempt answers"
    ON public.student_quiz_attempt_answers
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.student_quiz_attempts
            WHERE student_quiz_attempts.id = student_quiz_attempt_answers.attempt_id
              AND student_quiz_attempts.user_id = auth.uid()
        )
    );

-- NOTE: No UPDATE/DELETE for students. Answers are immutable once submitted.

-- Service role full access
DROP POLICY IF EXISTS "Service role full access on student_quiz_attempt_answers" ON public.student_quiz_attempt_answers;
CREATE POLICY "Service role full access on student_quiz_attempt_answers"
    ON public.student_quiz_attempt_answers
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ── 10. RLS Policies: student_module_progress ─────────────────────────────────

-- Authenticated student: SELECT own module progress only
DROP POLICY IF EXISTS "Users can read own module progress" ON public.student_module_progress;
CREATE POLICY "Users can read own module progress"
    ON public.student_module_progress
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Authenticated student: INSERT own module progress only
DROP POLICY IF EXISTS "Users can insert own module progress" ON public.student_module_progress;
CREATE POLICY "Users can insert own module progress"
    ON public.student_module_progress
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Authenticated student: UPDATE own module progress only
DROP POLICY IF EXISTS "Users can update own module progress" ON public.student_module_progress;
CREATE POLICY "Users can update own module progress"
    ON public.student_module_progress
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Service role full access
DROP POLICY IF EXISTS "Service role full access on student_module_progress" ON public.student_module_progress;
CREATE POLICY "Service role full access on student_module_progress"
    ON public.student_module_progress
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ── 11. Explicit Role Grants ─────────────────────────────────────────────────
GRANT SELECT, INSERT ON public.student_quiz_attempts TO authenticated;
GRANT ALL ON public.student_quiz_attempts TO service_role;

GRANT SELECT, INSERT ON public.student_quiz_attempt_answers TO authenticated;
GRANT ALL ON public.student_quiz_attempt_answers TO service_role;

GRANT SELECT, INSERT, UPDATE ON public.student_module_progress TO authenticated;
GRANT ALL ON public.student_module_progress TO service_role;
