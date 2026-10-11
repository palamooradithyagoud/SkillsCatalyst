-- ==============================================================================
-- SkillsCatalyst Security Audit Remediation: Issue 8
-- Migration: 20261011_harden_frontend_rls_and_role_escalation.sql
-- 
-- Objectives:
-- 1. Prevent Role Escalation: Ensure non-owner/non-service_role clients cannot
--    assign themselves 'owner', 'admin', 'editor', or 'moderator' roles on INSERT
--    or UPDATE on public.profiles.
-- 2. Restrict Resume Score Mutations: Make public.resume_scores and public.resume_analysis
--    read-only for authenticated students, reserving insertions and evaluations strictly
--    for the authoritative backend service_role AI evaluator.
-- 3. Restrict Quiz Submissions & Module Progress: Drop direct student INSERT on
--    public.student_quiz_attempts and direct student UPDATE on public.student_module_progress,
--    forcing quiz submissions and completions through the authoritative backend evaluator.
-- 4. Protect User Progress Privileged Scores: Neutralize direct client tampering with
--    algorithmic scores (resume_readiness_score, ai_career_health_score) in public.user_progress.
-- 5. Restrict Welcome Email Queue: Ensure public.welcome_email_events is read-only
--    for authenticated students, preventing client forgery of email queue state.
-- 6. Isolate User Feedback: Enforce tenant isolation on public.user_feedback reads.
-- ==============================================================================

-- ── 1. PROFILES: HARDEN ROLE ESCALATION PREVENTION ────────────────────────────
-- The previous trigger only fired BEFORE UPDATE OF role. A direct INSERT by an
-- authenticated user with role = 'owner' or role = 'admin' bypassed the trigger.
-- We upgrade the function and trigger to execute BEFORE INSERT OR UPDATE.

CREATE OR REPLACE FUNCTION public.prevent_profile_role_escalation()
RETURNS TRIGGER AS $$
BEGIN
    -- Administrative callers bypass check
    IF current_user IN ('service_role', 'postgres', 'supabase_admin') THEN
        RETURN NEW;
    END IF;

    -- Verified owners in JWT app_metadata bypass check
    IF COALESCE((auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'owner' THEN
        RETURN NEW;
    END IF;

    IF TG_OP = 'INSERT' THEN
        -- Standard users can only create profiles with 'student' role
        IF NEW.role IS NOT NULL AND NEW.role <> '' AND NEW.role <> 'student' THEN
            RAISE EXCEPTION 'Unauthorized: Account roles cannot be set to non-student by standard users';
        END IF;
        -- Default to 'student' if null or empty
        IF NEW.role IS NULL OR NEW.role = '' THEN
            NEW.role := 'student';
        END IF;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Standard users cannot modify existing roles
        IF NEW.role IS DISTINCT FROM OLD.role THEN
            RAISE EXCEPTION 'Unauthorized: Account roles cannot be modified by standard users';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_prevent_profile_role_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_profile_role_escalation
    BEFORE INSERT OR UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.prevent_profile_role_escalation();


-- ── 2. RESUME SCORES & ANALYSIS: LOCK DOWN TO READ-ONLY FOR CLIENTS ──────────
-- Resume scoring is authoritative through backend AI Mentor (POST /api/ai-mentor/review-resume).
-- Students should only read their own scores, never insert, update, or delete them directly.

REVOKE INSERT, UPDATE, DELETE ON public.resume_scores FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.resume_analysis FROM anon, authenticated;
GRANT SELECT ON public.resume_scores TO authenticated;
GRANT SELECT ON public.resume_analysis TO authenticated;
GRANT ALL ON public.resume_scores TO service_role;
GRANT ALL ON public.resume_analysis TO service_role;

ALTER TABLE public.resume_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_analysis ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own resume_scores" ON public.resume_scores;
DROP POLICY IF EXISTS "Strict user ownership on resume_scores" ON public.resume_scores;
DROP POLICY IF EXISTS "Users can read own resume scores" ON public.resume_scores;
CREATE POLICY "Users can read own resume scores"
    ON public.resume_scores
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own resume_analysis" ON public.resume_analysis;
DROP POLICY IF EXISTS "Strict user ownership on resume_analysis" ON public.resume_analysis;
DROP POLICY IF EXISTS "Users can read own resume analysis" ON public.resume_analysis;
CREATE POLICY "Users can read own resume analysis"
    ON public.resume_analysis
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role access on resume_scores" ON public.resume_scores;
CREATE POLICY "Service role access on resume_scores"
    ON public.resume_scores
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Service role access on resume_analysis" ON public.resume_analysis;
CREATE POLICY "Service role access on resume_analysis"
    ON public.resume_analysis
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);


-- ── 3. QUIZ ATTEMPTS & MODULE PROGRESS: PREVENT SCORE & PROGRESS FORGERY ─────
-- Quiz submissions and module passing state must flow through the authoritative backend
-- evaluator (submit_quiz_attempt) to ensure questions and passing thresholds are validated.

REVOKE INSERT, UPDATE, DELETE ON public.student_quiz_attempts FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.student_module_progress FROM anon, authenticated;
GRANT SELECT ON public.student_quiz_attempts TO authenticated;
GRANT SELECT ON public.student_module_progress TO authenticated;
GRANT ALL ON public.student_quiz_attempts TO service_role;
GRANT ALL ON public.student_module_progress TO service_role;

ALTER TABLE public.student_quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_module_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert own quiz attempts" ON public.student_quiz_attempts;
DROP POLICY IF EXISTS "Users manage own student_quiz_attempts" ON public.student_quiz_attempts;
DROP POLICY IF EXISTS "Users can read own quiz attempts" ON public.student_quiz_attempts;
CREATE POLICY "Users can read own quiz attempts"
    ON public.student_quiz_attempts
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own module progress" ON public.student_module_progress;
DROP POLICY IF EXISTS "Users can update own module progress" ON public.student_module_progress;
DROP POLICY IF EXISTS "Users manage own student_module_progress" ON public.student_module_progress;
DROP POLICY IF EXISTS "Users can read own module progress" ON public.student_module_progress;
CREATE POLICY "Users can read own module progress"
    ON public.student_module_progress
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role full access on student_quiz_attempts" ON public.student_quiz_attempts;
CREATE POLICY "Service role full access on student_quiz_attempts"
    ON public.student_quiz_attempts
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access on student_module_progress" ON public.student_module_progress;
CREATE POLICY "Service role full access on student_module_progress"
    ON public.student_module_progress
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);


-- ── 4. USER PROGRESS: PROTECT PRIVILEGED SCORES ──────────────────────────────
-- Authenticated students may update their streaks and problems solved from the client,
-- but algorithmic scores (resume_readiness_score, ai_career_health_score) must only
-- be updated by backend service_role processes.

CREATE OR REPLACE FUNCTION public.protect_user_progress_privileged_fields()
RETURNS TRIGGER AS $$
BEGIN
    -- Administrative callers bypass check
    IF current_user IN ('service_role', 'postgres', 'supabase_admin') THEN
        RETURN NEW;
    END IF;

    -- Verified owners in JWT app_metadata bypass check
    IF COALESCE((auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'owner' THEN
        RETURN NEW;
    END IF;

    IF TG_OP = 'INSERT' THEN
        -- Default algorithmic scores to zero on client insert
        NEW.resume_readiness_score := 0.00;
        NEW.ai_career_health_score := 0.00;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Silently revert privileged fields to previous values if modified by client
        IF NEW.resume_readiness_score IS DISTINCT FROM OLD.resume_readiness_score THEN
            NEW.resume_readiness_score := OLD.resume_readiness_score;
        END IF;
        IF NEW.ai_career_health_score IS DISTINCT FROM OLD.ai_career_health_score THEN
            NEW.ai_career_health_score := OLD.ai_career_health_score;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_protect_user_progress_privileged_fields ON public.user_progress;
CREATE TRIGGER trg_protect_user_progress_privileged_fields
    BEFORE INSERT OR UPDATE ON public.user_progress
    FOR EACH ROW EXECUTE FUNCTION public.protect_user_progress_privileged_fields();


-- ── 5. WELCOME EMAIL EVENTS: LOCK DOWN TO READ-ONLY FOR CLIENTS ──────────────
-- Signup emails are an automated backend queue. Standard users must not insert, update,
-- or delete queue events.

REVOKE INSERT, UPDATE, DELETE ON public.welcome_email_events FROM anon, authenticated;
GRANT SELECT ON public.welcome_email_events TO authenticated;
GRANT ALL ON public.welcome_email_events TO service_role;

ALTER TABLE public.welcome_email_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own welcome_email_events" ON public.welcome_email_events;
DROP POLICY IF EXISTS "Users can view their own welcome_email_events" ON public.welcome_email_events;
CREATE POLICY "Users can view their own welcome_email_events"
    ON public.welcome_email_events
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role full access on welcome_email_events" ON public.welcome_email_events;
CREATE POLICY "Service role full access on welcome_email_events"
    ON public.welcome_email_events
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);


-- ── 6. USER FEEDBACK: ENFORCE READ ISOLATION ─────────────────────────────────
REVOKE UPDATE, DELETE ON public.user_feedback FROM anon, authenticated;
GRANT INSERT, SELECT ON public.user_feedback TO authenticated;
GRANT ALL ON public.user_feedback TO service_role;

ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated insert user_feedback" ON public.user_feedback;
CREATE POLICY "Authenticated insert user_feedback"
    ON public.user_feedback
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users view own feedback" ON public.user_feedback;
CREATE POLICY "Users view own feedback"
    ON public.user_feedback
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role full user_feedback" ON public.user_feedback;
CREATE POLICY "Service role full user_feedback"
    ON public.user_feedback
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
