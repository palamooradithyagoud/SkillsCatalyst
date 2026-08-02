-- =============================================================================
-- SKILLSCATALYST - LEARNING_PROGRESS RLS HARDENING MIGRATION
-- =============================================================================
-- Target: public.learning_progress
-- Removes insecure wildcard ("Allow all") and anonymous ("auth.role() = 'anon'") policies.
-- Enforces strict TO authenticated user isolation and explicit TO service_role access.
-- =============================================================================

BEGIN;

-- 1. Enable RLS
ALTER TABLE public.learning_progress ENABLE ROW LEVEL SECURITY;

-- 2. Drop insecure legacy policies
DROP POLICY IF EXISTS "Allow all on learning_progress" ON public.learning_progress;
DROP POLICY IF EXISTS "Allow session owner access on learning_progress" ON public.learning_progress;
DROP POLICY IF EXISTS "Users own learning progress" ON public.learning_progress;
DROP POLICY IF EXISTS "Strict user ownership on learning_progress" ON public.learning_progress;
DROP POLICY IF EXISTS "Service role full access on learning_progress" ON public.learning_progress;

-- 3. Create strict policy for Authenticated Supabase users
CREATE POLICY "Strict user ownership on learning_progress"
    ON public.learning_progress
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 4. Create explicit policy for FastAPI Backend Service Role
CREATE POLICY "Service role full access on learning_progress"
    ON public.learning_progress
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

COMMIT;
