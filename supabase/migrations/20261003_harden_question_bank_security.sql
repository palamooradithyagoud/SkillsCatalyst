-- ==============================================================================
-- SkillsCatalyst Production Security Hardening Migration
-- Migration: 20261003_harden_question_bank_security.sql
-- 
-- Objectives:
-- 1. Eliminate answer-key leakage (REVOKE is_correct from anon/authenticated)
-- 2. Eliminate explanation leakage (REVOKE explanation from anon/authenticated)
-- 3. Restrict direct mutation privileges (INSERT/UPDATE/DELETE) on question bank
-- 4. Harden submit_question_attempt RPC with input validation & option ownership checks
-- 5. Set search_path on SECURITY DEFINER functions to mitigate privilege escalation
-- ==============================================================================

-- 1. REVOKE TABLE-LEVEL PRIVILEGES FROM anon AND authenticated
REVOKE ALL ON public.categories FROM anon, authenticated;
REVOKE ALL ON public.topics FROM anon, authenticated;
REVOKE ALL ON public.questions FROM anon, authenticated;
REVOKE ALL ON public.question_options FROM anon, authenticated;
REVOKE ALL ON public.question_attempts FROM anon, authenticated;
REVOKE ALL ON public.user_topic_progress FROM anon, authenticated;
REVOKE ALL ON public.question_bookmarks FROM anon, authenticated;
REVOKE ALL ON public.topic_bookmarks FROM anon, authenticated;

-- 2. GRANT SAFE TABLE-LEVEL SELECT PRIVILEGES
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT SELECT ON public.topics TO anon, authenticated;

-- 3. GRANT SAFE COLUMN-LEVEL SELECT ON questions (EXCLUDING explanation)
GRANT SELECT (
    id,
    topic_id,
    question_code,
    legacy_id,
    question_text,
    difficulty,
    source,
    source_url,
    is_active,
    created_at,
    updated_at
) ON public.questions TO anon, authenticated;

-- 4. GRANT SAFE COLUMN-LEVEL SELECT ON question_options (EXCLUDING is_correct)
GRANT SELECT (
    id,
    question_id,
    option_key,
    option_text,
    display_order,
    created_at
) ON public.question_options TO anon, authenticated;

-- 5. ATTEMPTS & PROGRESS: Authenticated users can only SELECT their own rows (managed via RPC)
GRANT SELECT ON public.question_attempts TO authenticated;
GRANT SELECT ON public.user_topic_progress TO authenticated;

-- 6. BOOKMARKS: Authenticated users can manage (SELECT, INSERT, DELETE) their own bookmarks
GRANT SELECT, INSERT, DELETE ON public.question_bookmarks TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.topic_bookmarks TO authenticated;

-- 7. RE-APPLY RLS POLICIES FOR EXTRA DEFENSE IN DEPTH
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_topic_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topic_bookmarks ENABLE ROW LEVEL SECURITY;

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

DROP POLICY IF EXISTS "Users can view own attempts" ON public.question_attempts;
CREATE POLICY "Users can view own attempts" ON public.question_attempts
    FOR SELECT USING (auth.uid() = user_id);

-- Drop direct client insert policy on attempts to prevent forgery of is_correct
DROP POLICY IF EXISTS "Users can insert own attempts" ON public.question_attempts;

DROP POLICY IF EXISTS "Users can view own progress" ON public.user_topic_progress;
CREATE POLICY "Users can view own progress" ON public.user_topic_progress
    FOR SELECT USING (auth.uid() = user_id);

-- Drop direct client upsert policy on progress to prevent aggregate count forgery
DROP POLICY IF EXISTS "Users can upsert own progress" ON public.user_topic_progress;

DROP POLICY IF EXISTS "Users can view own question bookmarks" ON public.question_bookmarks;
CREATE POLICY "Users can view own question bookmarks" ON public.question_bookmarks
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own question bookmarks" ON public.question_bookmarks;
CREATE POLICY "Users can insert own question bookmarks" ON public.question_bookmarks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own question bookmarks" ON public.question_bookmarks;
CREATE POLICY "Users can delete own question bookmarks" ON public.question_bookmarks
    FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own topic bookmarks" ON public.topic_bookmarks;
CREATE POLICY "Users can view own topic bookmarks" ON public.topic_bookmarks
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own topic bookmarks" ON public.topic_bookmarks;
CREATE POLICY "Users can insert own topic bookmarks" ON public.topic_bookmarks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own topic bookmarks" ON public.topic_bookmarks;
CREATE POLICY "Users can delete own topic bookmarks" ON public.topic_bookmarks
    FOR DELETE USING (auth.uid() = user_id);

-- 8. HARDENED RPC: GET TOPIC QUESTIONS
CREATE OR REPLACE FUNCTION public.get_topic_questions(p_topic_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
    JOIN public.topics t ON t.id = q.topic_id
    WHERE q.topic_id = p_topic_id 
      AND q.is_active = true 
      AND t.is_active = true;

    RETURN COALESCE(result, '[]'::jsonb);
END;
$$;

-- 9. HARDENED RPC: SUBMIT QUESTION ATTEMPT
CREATE OR REPLACE FUNCTION public.submit_question_attempt(
    p_question_id UUID,
    p_selected_option_id UUID,
    p_time_taken_seconds INT DEFAULT 0
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_is_correct BOOLEAN := false;
    v_correct_opt_id UUID;
    v_explanation TEXT;
    v_topic_id UUID;
    v_category_id UUID;
    v_is_active BOOLEAN;
    v_topic_active BOOLEAN;
    v_cat_active BOOLEAN;
    v_clamped_time INT;
BEGIN
    -- 1. Authentication check
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- 2. Time validation (0 to 86400 seconds = max 24 hours)
    IF p_time_taken_seconds < 0 OR p_time_taken_seconds > 86400 THEN
        RAISE EXCEPTION 'Invalid time taken: must be between 0 and 86400 seconds';
    END IF;
    v_clamped_time := COALESCE(p_time_taken_seconds, 0);

    -- 3. Verify question exists and fetch active statuses
    SELECT 
        q.topic_id, 
        q.explanation, 
        q.is_active,
        t.category_id,
        t.is_active,
        c.is_active
    INTO 
        v_topic_id, 
        v_explanation, 
        v_is_active,
        v_category_id,
        v_topic_active,
        v_cat_active
    FROM public.questions q
    JOIN public.topics t ON t.id = q.topic_id
    JOIN public.categories c ON c.id = t.category_id
    WHERE q.id = p_question_id;

    IF v_topic_id IS NULL THEN
        RAISE EXCEPTION 'Question not found';
    END IF;

    IF NOT v_is_active THEN
        RAISE EXCEPTION 'Question is not active';
    END IF;

    IF NOT (v_topic_active AND v_cat_active) THEN
        RAISE EXCEPTION 'Topic or category is not active';
    END IF;

    -- 4. Verify option belongs to question & evaluate correctness
    SELECT id INTO v_correct_opt_id
    FROM public.question_options
    WHERE question_id = p_question_id AND is_correct = true;

    IF p_selected_option_id IS NOT NULL THEN
        -- Check option belongs to this question
        IF NOT EXISTS (
            SELECT 1 
            FROM public.question_options 
            WHERE id = p_selected_option_id AND question_id = p_question_id
        ) THEN
            RAISE EXCEPTION 'Option does not belong to specified question';
        END IF;

        v_is_correct := (p_selected_option_id = v_correct_opt_id);
    ELSE
        v_is_correct := false;
    END IF;

    -- 5. Record the attempt (Server-side calculation, client cannot tamper with is_correct)
    INSERT INTO public.question_attempts (
        user_id, question_id, selected_option_id, is_correct, time_taken_seconds, attempted_at
    ) VALUES (
        v_user_id, p_question_id, p_selected_option_id, v_is_correct, v_clamped_time, now()
    );

    -- 6. Update user topic progress aggregate atomically
    INSERT INTO public.user_topic_progress (
        user_id, topic_id, total_questions, attempted_count, solved_count, total_time_seconds, last_practiced_at
    )
    SELECT
        v_user_id,
        v_topic_id,
        (SELECT count(*) FROM public.questions WHERE topic_id = v_topic_id AND is_active = true),
        1,
        CASE WHEN v_is_correct THEN 1 ELSE 0 END,
        v_clamped_time,
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
        total_time_seconds = user_topic_progress.total_time_seconds + v_clamped_time,
        last_practiced_at = now();

    -- 7. Return protected answer validation and explanation securely to authenticated student
    RETURN jsonb_build_object(
        'is_correct', v_is_correct,
        'correct_option_id', v_correct_opt_id,
        'explanation', v_explanation
    );
END;
$$;

-- 10. RPC EXECUTE PRIVILEGES
GRANT EXECUTE ON FUNCTION public.get_topic_questions(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_question_attempt(UUID, UUID, INT) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.submit_question_attempt(UUID, UUID, INT) FROM anon;
