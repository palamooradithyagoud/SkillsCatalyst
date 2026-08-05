-- ====================================================================
-- SKILLSCATALYST - PRODUCTION SECURITY HARDENING MIGRATION
-- ====================================================================
-- Timestamp: 20260805140000
-- Description: Idempotent migration addressing RLS policies, RPC guards,
--              user_feedback access rules, updated_at triggers, and indexes.
-- ====================================================================

-- ── 1. RLS HARDENING (ISSUE 1) ──────────────────────────────────────
-- Enable RLS on all user tables
ALTER TABLE public.user_academic_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_coding_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leetcode_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_progress ENABLE ROW LEVEL SECURITY;

-- Revoke blanket anon permissions
REVOKE ALL ON public.user_academic_profile FROM anon;
REVOKE ALL ON public.user_coding_profiles FROM anon;
REVOKE ALL ON public.user_progress FROM anon;
REVOKE ALL ON public.leetcode_progress FROM anon;
REVOKE ALL ON public.roadmap_progress FROM anon;
REVOKE ALL ON public.resume_scores FROM anon;
REVOKE ALL ON public.saved_playlists FROM anon;
REVOKE ALL ON public.video_progress FROM anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_academic_profile TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_coding_profiles TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_progress TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leetcode_progress TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.roadmap_progress TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.resume_scores TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_playlists TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.video_progress TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.learning_progress TO authenticated, service_role;

-- Drop legacy/permissive policies
DROP POLICY IF EXISTS "Strict user ownership on user_academic_profile" ON public.user_academic_profile;
DROP POLICY IF EXISTS "Service role access on user_academic_profile" ON public.user_academic_profile;
DROP POLICY IF EXISTS "Users can only access own academic profile" ON public.user_academic_profile;

DROP POLICY IF EXISTS "Strict user ownership on user_coding_profiles" ON public.user_coding_profiles;
DROP POLICY IF EXISTS "Allow anon all on user_coding_profiles" ON public.user_coding_profiles;
DROP POLICY IF EXISTS "Allow authenticated or anon access on coding_profiles" ON public.user_coding_profiles;
DROP POLICY IF EXISTS "Users can only access own coding profile" ON public.user_coding_profiles;
DROP POLICY IF EXISTS "Service role access on user_coding_profiles" ON public.user_coding_profiles;

DROP POLICY IF EXISTS "Strict user ownership on user_progress" ON public.user_progress;
DROP POLICY IF EXISTS "Service role access on user_progress" ON public.user_progress;
DROP POLICY IF EXISTS "Users can only access own progress" ON public.user_progress;

DROP POLICY IF EXISTS "Strict user ownership on leetcode_progress" ON public.leetcode_progress;
DROP POLICY IF EXISTS "Service role access on leetcode_progress" ON public.leetcode_progress;
DROP POLICY IF EXISTS "Users can only access own leetcode progress" ON public.leetcode_progress;

DROP POLICY IF EXISTS "Strict user ownership on roadmap_progress" ON public.roadmap_progress;
DROP POLICY IF EXISTS "Service role access on roadmap_progress" ON public.roadmap_progress;
DROP POLICY IF EXISTS "Users can only access own roadmap progress" ON public.roadmap_progress;

DROP POLICY IF EXISTS "Strict user ownership on resume_scores" ON public.resume_scores;
DROP POLICY IF EXISTS "Service role access on resume_scores" ON public.resume_scores;
DROP POLICY IF EXISTS "Users can only access own resume scores" ON public.resume_scores;

DROP POLICY IF EXISTS "Strict user ownership on saved_playlists" ON public.saved_playlists;
DROP POLICY IF EXISTS "Service role access on saved_playlists" ON public.saved_playlists;
DROP POLICY IF EXISTS "Users can only access own saved playlists" ON public.saved_playlists;

DROP POLICY IF EXISTS "Strict user ownership on video_progress" ON public.video_progress;
DROP POLICY IF EXISTS "Service role access on video_progress" ON public.video_progress;
DROP POLICY IF EXISTS "Users can only access own video progress" ON public.video_progress;

DROP POLICY IF EXISTS "Strict user ownership on learning_progress" ON public.learning_progress;
DROP POLICY IF EXISTS "Service role full access on learning_progress" ON public.learning_progress;

-- Re-create Service Role bypass policies
CREATE POLICY "Service role access on user_academic_profile" ON public.user_academic_profile FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role access on user_coding_profiles" ON public.user_coding_profiles FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role access on user_progress" ON public.user_progress FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role access on leetcode_progress" ON public.leetcode_progress FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role access on roadmap_progress" ON public.roadmap_progress FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role access on resume_scores" ON public.resume_scores FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role access on saved_playlists" ON public.saved_playlists FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role access on video_progress" ON public.video_progress FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on learning_progress" ON public.learning_progress FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Re-create Strict Authenticated User Ownership policies (removing auth.uid() IS NULL OR)
CREATE POLICY "Strict user ownership on user_academic_profile" ON public.user_academic_profile FOR ALL TO authenticated USING (user_id IS NOT NULL AND auth.uid()::text = user_id::text) WITH CHECK (user_id IS NOT NULL AND auth.uid()::text = user_id::text);
CREATE POLICY "Strict user ownership on user_coding_profiles" ON public.user_coding_profiles FOR ALL TO authenticated USING (user_id IS NOT NULL AND auth.uid()::text = user_id::text) WITH CHECK (user_id IS NOT NULL AND auth.uid()::text = user_id::text);
CREATE POLICY "Strict user ownership on user_progress" ON public.user_progress FOR ALL TO authenticated USING (user_id IS NOT NULL AND auth.uid()::text = user_id::text) WITH CHECK (user_id IS NOT NULL AND auth.uid()::text = user_id::text);
CREATE POLICY "Strict user ownership on leetcode_progress" ON public.leetcode_progress FOR ALL TO authenticated USING (user_id IS NOT NULL AND auth.uid()::text = user_id::text) WITH CHECK (user_id IS NOT NULL AND auth.uid()::text = user_id::text);
CREATE POLICY "Strict user ownership on roadmap_progress" ON public.roadmap_progress FOR ALL TO authenticated USING (user_id IS NOT NULL AND auth.uid()::text = user_id::text) WITH CHECK (user_id IS NOT NULL AND auth.uid()::text = user_id::text);
CREATE POLICY "Strict user ownership on resume_scores" ON public.resume_scores FOR ALL TO authenticated USING (user_id IS NOT NULL AND auth.uid()::text = user_id::text) WITH CHECK (user_id IS NOT NULL AND auth.uid()::text = user_id::text);
CREATE POLICY "Strict user ownership on saved_playlists" ON public.saved_playlists FOR ALL TO authenticated USING (user_id IS NOT NULL AND auth.uid()::text = user_id::text) WITH CHECK (user_id IS NOT NULL AND auth.uid()::text = user_id::text);
CREATE POLICY "Strict user ownership on video_progress" ON public.video_progress FOR ALL TO authenticated USING (user_id IS NOT NULL AND auth.uid()::text = user_id::text) WITH CHECK (user_id IS NOT NULL AND auth.uid()::text = user_id::text);
CREATE POLICY "Strict user ownership on learning_progress" ON public.learning_progress FOR ALL TO authenticated USING (user_id IS NOT NULL AND auth.uid()::text = user_id::text) WITH CHECK (user_id IS NOT NULL AND auth.uid()::text = user_id::text);


-- ── 2. SECURITY DEFINER RPC AUTHORIZATION GUARD (ISSUE 2) ───────────
CREATE OR REPLACE FUNCTION public.upsert_user_aptitude_attempt(
    p_user_id UUID,
    p_topic_id INTEGER,
    p_question_id INTEGER,
    p_selected_option_index INTEGER,
    p_is_correct BOOLEAN,
    p_time_taken_seconds INTEGER
) RETURNS public.user_aptitude_attempts AS $$
DECLARE
    v_result public.user_aptitude_attempts;
BEGIN
    -- Authorization guard: verify caller identity
    IF p_user_id::text IS DISTINCT FROM auth.uid()::text THEN
        RAISE EXCEPTION 'not authorized' USING ERRCODE = '42501';
    END IF;

    INSERT INTO public.user_aptitude_attempts (
        user_id, topic_id, question_id, selected_option_index, is_correct, time_taken_seconds, attempted_at
    ) VALUES (
        p_user_id, p_topic_id, p_question_id, p_selected_option_index, p_is_correct, p_time_taken_seconds, NOW()
    )
    ON CONFLICT (user_id, question_id) DO UPDATE SET
        selected_option_index = EXCLUDED.selected_option_index,
        is_correct = EXCLUDED.is_correct,
        time_taken_seconds = EXCLUDED.time_taken_seconds,
        attempted_at = NOW()
    RETURNING * INTO v_result;

    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

REVOKE EXECUTE ON FUNCTION public.upsert_user_aptitude_attempt(UUID, INTEGER, INTEGER, INTEGER, BOOLEAN, INTEGER) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.upsert_user_aptitude_attempt(UUID, INTEGER, INTEGER, INTEGER, BOOLEAN, INTEGER) TO authenticated, service_role;


-- ── 3. USER_FEEDBACK ACCESS CONTROLS (ISSUE 3) ──────────────────────
ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow user insert user_feedback" ON public.user_feedback;
DROP POLICY IF EXISTS "Allow open insert on user_feedback" ON public.user_feedback;
DROP POLICY IF EXISTS "Service role access on user_feedback" ON public.user_feedback;
DROP POLICY IF EXISTS "Authenticated insert on user_feedback" ON public.user_feedback;

CREATE POLICY "Service role access on user_feedback"
    ON public.user_feedback FOR ALL TO service_role
    USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated insert on user_feedback"
    ON public.user_feedback FOR INSERT TO authenticated
    WITH CHECK (user_id IS NOT NULL AND auth.uid()::text = user_id);

REVOKE ALL ON public.user_feedback FROM anon;
GRANT SELECT, INSERT ON public.user_feedback TO authenticated, service_role;


-- ── 4. REUSABLE UPDATED_AT TRIGGERS (ISSUE 8) ───────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_updated_at_user_academic ON public.user_academic_profile;
CREATE TRIGGER trg_set_updated_at_user_academic
    BEFORE UPDATE ON public.user_academic_profile
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_set_updated_at_user_coding ON public.user_coding_profiles;
CREATE TRIGGER trg_set_updated_at_user_coding
    BEFORE UPDATE ON public.user_coding_profiles
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_set_updated_at_user_progress ON public.user_progress;
CREATE TRIGGER trg_set_updated_at_user_progress
    BEFORE UPDATE ON public.user_progress
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_set_updated_at_video_progress ON public.video_progress;
CREATE TRIGGER trg_set_updated_at_video_progress
    BEFORE UPDATE ON public.video_progress
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_set_updated_at_learning_progress ON public.learning_progress;
CREATE TRIGGER trg_set_updated_at_learning_progress
    BEFORE UPDATE ON public.learning_progress
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_set_updated_at_skills_cache ON public.skills_cache;
CREATE TRIGGER trg_set_updated_at_skills_cache
    BEFORE UPDATE ON public.skills_cache
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ── 5. MISSING INDEX ON LEARNING_PROGRESS (ISSUE 9) ─────────────────
CREATE INDEX IF NOT EXISTS idx_learning_progress_user ON public.learning_progress(user_id);
