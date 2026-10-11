-- ====================================================================
-- MODULE 8: QUANTITATIVE APTITUDE & PLACEMENT PREP (5 TABLES)
-- ====================================================================

-- 1. APTITUDE CATEGORIES (Quantitative, Logical Reasoning, Verbal)
CREATE TABLE IF NOT EXISTS public.aptitude_categories (
    id SERIAL PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon_name VARCHAR(50) DEFAULT 'Calculator',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. APTITUDE TOPICS (Percentages, Time & Work, etc.)
CREATE TABLE IF NOT EXISTS public.aptitude_topics (
    id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES public.aptitude_categories(id) ON DELETE CASCADE,
    topic_name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    total_questions INTEGER DEFAULT 0,
    default_timer_seconds INTEGER DEFAULT 60,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. APTITUDE QUESTIONS (MCQs with Step-by-Step Solutions)
CREATE TABLE IF NOT EXISTS public.aptitude_questions (
    id SERIAL PRIMARY KEY,
    topic_id INTEGER NOT NULL REFERENCES public.aptitude_topics(id) ON DELETE CASCADE,
    question_number INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_index INTEGER NOT NULL,
    answer_text VARCHAR(100) NOT NULL,
    solution_text TEXT NOT NULL,
    difficulty VARCHAR(20) DEFAULT 'Medium',
    per_question_timer INTEGER DEFAULT 60,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_topic_question_number UNIQUE (topic_id, question_number)
);
CREATE INDEX IF NOT EXISTS idx_aptitude_questions_topic ON public.aptitude_questions(topic_id);

-- 4. USER APTITUDE ATTEMPTS (Live Answers Submitted per Question)
CREATE TABLE IF NOT EXISTS public.user_aptitude_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    topic_id INTEGER NOT NULL REFERENCES public.aptitude_topics(id) ON DELETE CASCADE,
    question_id INTEGER NOT NULL REFERENCES public.aptitude_questions(id) ON DELETE CASCADE,
    selected_option_index INTEGER NOT NULL,
    is_correct BOOLEAN NOT NULL,
    time_taken_seconds INTEGER DEFAULT 0,
    attempted_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_question_attempt UNIQUE (user_id, question_id)
);
CREATE INDEX IF NOT EXISTS idx_attempts_user_topic ON public.user_aptitude_attempts(user_id, topic_id);

-- 5. USER QUIZ RESULTS (Session Final Scores & Accuracy)
CREATE TABLE IF NOT EXISTS public.user_quiz_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    topic_id INTEGER NOT NULL REFERENCES public.aptitude_topics(id) ON DELETE CASCADE,
    total_questions INTEGER NOT NULL,
    correct_answers INTEGER NOT NULL,
    score_percentage NUMERIC(5,2) NOT NULL,
    timer_mode_seconds INTEGER DEFAULT 60,
    completed_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_quiz_results_user ON public.user_quiz_results(user_id);

-- ── ROW LEVEL SECURITY (RLS) ─────────────────────────────────────────
ALTER TABLE public.aptitude_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aptitude_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aptitude_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_aptitude_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_quiz_results ENABLE ROW LEVEL SECURITY;

-- 1. Public Read Policies
DROP POLICY IF EXISTS "Public read aptitude categories" ON public.aptitude_categories;
CREATE POLICY "Public read aptitude categories" ON public.aptitude_categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read aptitude topics" ON public.aptitude_topics;
CREATE POLICY "Public read aptitude topics" ON public.aptitude_topics FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read aptitude questions" ON public.aptitude_questions;
CREATE POLICY "Public read aptitude questions" ON public.aptitude_questions FOR SELECT USING (true);

-- 2. User Isolation Policies
DROP POLICY IF EXISTS "Users manage own aptitude attempts" ON public.user_aptitude_attempts;
CREATE POLICY "Users manage own aptitude attempts" ON public.user_aptitude_attempts FOR ALL TO authenticated 
    USING (auth.uid() = user_id) 
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own quiz results" ON public.user_quiz_results;
CREATE POLICY "Users manage own quiz results" ON public.user_quiz_results FOR ALL TO authenticated 
    USING (auth.uid() = user_id) 
    WITH CHECK (auth.uid() = user_id);

-- 3. Service Role Policies
DROP POLICY IF EXISTS "Service role aptitude_categories" ON public.aptitude_categories;
CREATE POLICY "Service role aptitude_categories" ON public.aptitude_categories FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role aptitude_topics" ON public.aptitude_topics;
CREATE POLICY "Service role aptitude_topics" ON public.aptitude_topics FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role aptitude_questions" ON public.aptitude_questions;
CREATE POLICY "Service role aptitude_questions" ON public.aptitude_questions FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role aptitude_attempts" ON public.user_aptitude_attempts;
CREATE POLICY "Service role aptitude_attempts" ON public.user_aptitude_attempts FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role quiz_results" ON public.user_quiz_results;
CREATE POLICY "Service role quiz_results" ON public.user_quiz_results FOR ALL TO service_role USING (true) WITH CHECK (true);
