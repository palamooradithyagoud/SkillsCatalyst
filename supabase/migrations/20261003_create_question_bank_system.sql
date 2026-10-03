-- ==============================================================================
-- SkillsCatalyst Production Schema: Placement Prep Question Bank & Progress
-- Migration: 20261003_create_question_bank_system.sql
-- ==============================================================================

-- 1. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. TOPICS TABLE
CREATE TABLE IF NOT EXISTS public.topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. QUESTIONS TABLE
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
    question_code TEXT UNIQUE NOT NULL,
    legacy_id INT NOT NULL,
    question_text TEXT NOT NULL,
    explanation TEXT NOT NULL,
    difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
    source TEXT DEFAULT 'SkillsCatalyst',
    source_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT uq_topic_legacy UNIQUE (topic_id, legacy_id)
);

-- 4. QUESTION OPTIONS TABLE
CREATE TABLE IF NOT EXISTS public.question_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    option_key TEXT NOT NULL CHECK (option_key IN ('A', 'B', 'C', 'D', 'E')),
    option_text TEXT NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    is_correct BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT uq_question_option UNIQUE (question_id, option_key)
);

-- 5. QUESTION ATTEMPTS TABLE
CREATE TABLE IF NOT EXISTS public.question_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    selected_option_id UUID REFERENCES public.question_options(id) ON DELETE SET NULL,
    is_correct BOOLEAN NOT NULL,
    time_taken_seconds INT DEFAULT 0,
    attempted_at TIMESTAMPTZ DEFAULT now()
);

-- 6. USER TOPIC PROGRESS TABLE
CREATE TABLE IF NOT EXISTS public.user_topic_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
    total_questions INT DEFAULT 0,
    attempted_count INT DEFAULT 0,
    solved_count INT DEFAULT 0,
    total_time_seconds INT DEFAULT 0,
    last_practiced_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT uq_user_topic_progress UNIQUE (user_id, topic_id)
);

-- 7. QUESTION BOOKMARKS TABLE
CREATE TABLE IF NOT EXISTS public.question_bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT uq_user_question_bookmark UNIQUE (user_id, question_id)
);

-- 8. TOPIC BOOKMARKS TABLE
CREATE TABLE IF NOT EXISTS public.topic_bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT uq_user_topic_bookmark UNIQUE (user_id, topic_id)
);

-- 9. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_topics_category ON public.topics (category_id, display_order);
CREATE INDEX IF NOT EXISTS idx_topics_slug ON public.topics (slug);
CREATE INDEX IF NOT EXISTS idx_questions_topic ON public.questions (topic_id, legacy_id);
CREATE INDEX IF NOT EXISTS idx_questions_code ON public.questions (question_code);
CREATE INDEX IF NOT EXISTS idx_question_options_qid ON public.question_options (question_id, display_order);
CREATE INDEX IF NOT EXISTS idx_question_attempts_user_topic ON public.question_attempts (user_id, question_id);
CREATE INDEX IF NOT EXISTS idx_user_topic_prog_user ON public.user_topic_progress (user_id, topic_id);
CREATE INDEX IF NOT EXISTS idx_question_bookmarks_user ON public.question_bookmarks (user_id, question_id);
CREATE INDEX IF NOT EXISTS idx_topic_bookmarks_user ON public.topic_bookmarks (user_id, topic_id);

-- 10. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_topic_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topic_bookmarks ENABLE ROW LEVEL SECURITY;

-- Categories & Topics: Public read for active rows
DROP POLICY IF EXISTS "Public can view active categories" ON public.categories;
CREATE POLICY "Public can view active categories" ON public.categories
    FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public can view active topics" ON public.topics;
CREATE POLICY "Public can view active topics" ON public.topics
    FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public can view active questions" ON public.questions;
CREATE POLICY "Public can view active questions" ON public.questions
    FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public can view options" ON public.question_options;
CREATE POLICY "Public can view options" ON public.question_options
    FOR SELECT USING (true);

-- User Progress, Attempts & Bookmarks: User-only read/write
DROP POLICY IF EXISTS "Users can view own attempts" ON public.question_attempts;
CREATE POLICY "Users can view own attempts" ON public.question_attempts
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own attempts" ON public.question_attempts;
CREATE POLICY "Users can insert own attempts" ON public.question_attempts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own progress" ON public.user_topic_progress;
CREATE POLICY "Users can view own progress" ON public.user_topic_progress
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can upsert own progress" ON public.user_topic_progress;
CREATE POLICY "Users can upsert own progress" ON public.user_topic_progress
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own question bookmarks" ON public.question_bookmarks;
CREATE POLICY "Users can view own question bookmarks" ON public.question_bookmarks
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own question bookmarks" ON public.question_bookmarks;
CREATE POLICY "Users can manage own question bookmarks" ON public.question_bookmarks
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own topic bookmarks" ON public.topic_bookmarks;
CREATE POLICY "Users can view own topic bookmarks" ON public.topic_bookmarks
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own topic bookmarks" ON public.topic_bookmarks;
CREATE POLICY "Users can manage own topic bookmarks" ON public.topic_bookmarks
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 11. RPC FUNCTION: GET TOPIC QUESTIONS (WITHOUT EXPOSING is_correct)
CREATE OR REPLACE FUNCTION public.get_topic_questions(p_topic_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_agg(
        jsonb_build_object(
            'id', q.id,
            'topic_id', q.topic_id,
            'question_code', q.question_code,
            'legacy_id', q.legacy_id,
            'question_text', q.question_text,
            'difficulty', q.difficulty,
            'source', q.source,
            'options', (
                SELECT jsonb_agg(
                    jsonb_build_object(
                        'id', o.id,
                        'key', o.option_key,
                        'text', o.option_text,
                        'display_order', o.display_order
                    ) ORDER BY o.display_order
                )
                FROM public.question_options o
                WHERE o.question_id = q.id
            )
        ) ORDER BY q.legacy_id
    ) INTO result
    FROM public.questions q
    WHERE q.topic_id = p_topic_id AND q.is_active = true;

    RETURN COALESCE(result, '[]'::jsonb);
END;
$$;

-- 12. SECURE RPC FUNCTION: SUBMIT QUESTION ATTEMPT
CREATE OR REPLACE FUNCTION public.submit_question_attempt(
    p_question_id UUID,
    p_selected_option_id UUID,
    p_time_taken_seconds INT DEFAULT 0
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_is_correct BOOLEAN := false;
    v_correct_opt_id UUID;
    v_explanation TEXT;
    v_topic_id UUID;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Look up correct option & question details
    SELECT q.topic_id, q.explanation, o_correct.id, (p_selected_option_id = o_correct.id)
    INTO v_topic_id, v_explanation, v_correct_opt_id, v_is_correct
    FROM public.questions q
    JOIN public.question_options o_correct ON o_correct.question_id = q.id AND o_correct.is_correct = true
    WHERE q.id = p_question_id;

    IF v_topic_id IS NULL THEN
        RAISE EXCEPTION 'Question not found';
    END IF;

    -- Record the attempt
    INSERT INTO public.question_attempts (
        user_id, question_id, selected_option_id, is_correct, time_taken_seconds, attempted_at
    ) VALUES (
        v_user_id, p_question_id, p_selected_option_id, v_is_correct, p_time_taken_seconds, now()
    );

    -- Update or Insert user topic progress aggregate
    INSERT INTO public.user_topic_progress (
        user_id, topic_id, total_questions, attempted_count, solved_count, total_time_seconds, last_practiced_at
    )
    SELECT
        v_user_id,
        v_topic_id,
        (SELECT count(*) FROM public.questions WHERE topic_id = v_topic_id AND is_active = true),
        1,
        CASE WHEN v_is_correct THEN 1 ELSE 0 END,
        p_time_taken_seconds,
        now()
    ON CONFLICT (user_id, topic_id) DO UPDATE SET
        attempted_count = (
            SELECT count(DISTINCT question_id) 
            FROM public.question_attempts qa
            JOIN public.questions q ON q.id = qa.question_id
            WHERE qa.user_id = v_user_id AND q.topic_id = v_topic_id
        ),
        solved_count = (
            SELECT count(DISTINCT question_id) 
            FROM public.question_attempts qa
            JOIN public.questions q ON q.id = qa.question_id
            WHERE qa.user_id = v_user_id AND q.topic_id = v_topic_id AND qa.is_correct = true
        ),
        total_time_seconds = user_topic_progress.total_time_seconds + p_time_taken_seconds,
        last_practiced_at = now();

    -- Return answer validation and explanation securely
    RETURN jsonb_build_object(
        'is_correct', v_is_correct,
        'correct_option_id', v_correct_opt_id,
        'explanation', v_explanation
    );
END;
$$;
