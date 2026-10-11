-- ====================================================================
-- MODULE 7: QUESTION BANK & PRACTICE PREP (8 TABLES)
-- ====================================================================

-- 1. CATEGORIES (e.g. Data Structures, Core CS)
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

-- 2. TOPICS (e.g. Arrays, Strings, Trees)
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
CREATE INDEX IF NOT EXISTS idx_topics_category ON public.topics (category_id, display_order);

-- 3. QUESTIONS (Problem Statements)
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
CREATE INDEX IF NOT EXISTS idx_questions_topic ON public.questions (topic_id, legacy_id);

-- 4. QUESTION OPTIONS (Answer Choices)
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
CREATE INDEX IF NOT EXISTS idx_question_options_qid ON public.question_options (question_id, display_order);

-- 5. QUESTION ATTEMPTS (User Practice Submissions)
CREATE TABLE IF NOT EXISTS public.question_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    selected_option_id UUID REFERENCES public.question_options(id) ON DELETE SET NULL,
    is_correct BOOLEAN NOT NULL,
    time_taken_seconds INT DEFAULT 0,
    attempted_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_question_attempts_user_topic ON public.question_attempts (user_id, question_id);

-- 6. USER TOPIC PROGRESS (Aggregate Topic Accuracy)
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
CREATE INDEX IF NOT EXISTS idx_user_topic_prog_user ON public.user_topic_progress (user_id, topic_id);

-- 7. QUESTION BOOKMARKS
CREATE TABLE IF NOT EXISTS public.question_bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT uq_user_question_bookmark UNIQUE (user_id, question_id)
);
CREATE INDEX IF NOT EXISTS idx_question_bookmarks_user ON public.question_bookmarks (user_id, question_id);

-- 8. TOPIC BOOKMARKS
CREATE TABLE IF NOT EXISTS public.topic_bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT uq_user_topic_bookmark UNIQUE (user_id, topic_id)
);
CREATE INDEX IF NOT EXISTS idx_topic_bookmarks_user ON public.topic_bookmarks (user_id, topic_id);

-- ── ROW LEVEL SECURITY (RLS) ─────────────────────────────────────────
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_topic_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topic_bookmarks ENABLE ROW LEVEL SECURITY;

-- Public Read for Questions & Options
DROP POLICY IF EXISTS "Public view active categories" ON public.categories;
CREATE POLICY "Public view active categories" ON public.categories FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public view active topics" ON public.topics;
CREATE POLICY "Public view active topics" ON public.topics FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public view active questions" ON public.questions;
CREATE POLICY "Public view active questions" ON public.questions FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public view options" ON public.question_options;
CREATE POLICY "Public view options" ON public.question_options FOR SELECT USING (true);

-- User-Scoped Ownership
DO $$
DECLARE
    tbl text;
BEGIN
    FOR tbl IN SELECT unnest(ARRAY['question_attempts', 'user_topic_progress', 'question_bookmarks', 'topic_bookmarks'])
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Users manage own %I" ON public.%I;', tbl, tbl);
        EXECUTE format('CREATE POLICY "Users manage own %I" ON public.%I FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);', tbl, tbl);
        
        EXECUTE format('DROP POLICY IF EXISTS "Service role %I" ON public.%I;', tbl, tbl);
        EXECUTE format('CREATE POLICY "Service role %I" ON public.%I FOR ALL TO service_role USING (true) WITH CHECK (true);', tbl, tbl);
    END LOOP;
END;
$$;
