-- ====================================================================
-- SKILLSCATALYST - PHASE 2C: PERSONALIZED AI MENTOR SCHEMA MIGRATION
-- ====================================================================
-- Migration: 20261030_phase2c_student_learning_profile_and_roadmaps.sql
-- 1. Creates public.student_learning_profiles for persistent, editable
--    student personalization (career goal, experience level, skills,
--    learning preferences, daily availability, objectives).
-- 2. Creates public.student_learning_roadmaps for goal-driven learning
--    roadmaps with stages, milestones, prerequisites, and status tracking.
-- 3. Configures Row Level Security (RLS) and ownership policies.
-- 4. Creates performance indexes and updated_at triggers.
-- 5. Safe, idempotent, backward-compatible.
-- ====================================================================

-- ── 1. Table: public.student_learning_profiles ────────────────────────
CREATE TABLE IF NOT EXISTS public.student_learning_profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    career_goal TEXT NOT NULL DEFAULT '',
    experience_level TEXT NOT NULL DEFAULT 'Beginner',
    existing_skills TEXT[] NOT NULL DEFAULT '{}',
    target_skills TEXT[] NOT NULL DEFAULT '{}',
    learning_preferences TEXT[] NOT NULL DEFAULT '{}',
    preferred_daily_minutes INTEGER NOT NULL DEFAULT 60,
    short_term_objective TEXT NOT NULL DEFAULT '',
    long_term_objective TEXT NOT NULL DEFAULT '',
    target_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_experience_level CHECK (
        experience_level IN ('Beginner', 'Intermediate', 'Advanced', 'Student')
    ),
    CONSTRAINT chk_preferred_daily_minutes CHECK (
        preferred_daily_minutes >= 0 AND preferred_daily_minutes <= 1440
    )
);

CREATE INDEX IF NOT EXISTS idx_student_learning_profiles_user_id
    ON public.student_learning_profiles(user_id);

-- ── 2. Table: public.student_learning_roadmaps ────────────────────────
CREATE TABLE IF NOT EXISTS public.student_learning_roadmaps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    career_goal TEXT NOT NULL,
    starting_level TEXT NOT NULL DEFAULT 'Beginner',
    stages JSONB NOT NULL DEFAULT '[]'::jsonb,
    milestones JSONB NOT NULL DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_roadmap_status CHECK (
        status IN ('active', 'archived', 'completed')
    )
);

CREATE INDEX IF NOT EXISTS idx_student_learning_roadmaps_user_status
    ON public.student_learning_roadmaps(user_id, status);

CREATE INDEX IF NOT EXISTS idx_student_learning_roadmaps_created_at
    ON public.student_learning_roadmaps(user_id, created_at DESC);

-- ── 3. Row Level Security (RLS) ───────────────────────────────────────
ALTER TABLE public.student_learning_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_learning_roadmaps ENABLE ROW LEVEL SECURITY;

-- student_learning_profiles policies
DO $$
BEGIN
    DROP POLICY IF EXISTS "Users can read own learning profile" ON public.student_learning_profiles;
    CREATE POLICY "Users can read own learning profile"
        ON public.student_learning_profiles FOR SELECT
        TO authenticated
        USING (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can insert own learning profile" ON public.student_learning_profiles;
    CREATE POLICY "Users can insert own learning profile"
        ON public.student_learning_profiles FOR INSERT
        TO authenticated
        WITH CHECK (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can update own learning profile" ON public.student_learning_profiles;
    CREATE POLICY "Users can update own learning profile"
        ON public.student_learning_profiles FOR UPDATE
        TO authenticated
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can delete own learning profile" ON public.student_learning_profiles;
    CREATE POLICY "Users can delete own learning profile"
        ON public.student_learning_profiles FOR DELETE
        TO authenticated
        USING (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Service role full access on student_learning_profiles" ON public.student_learning_profiles;
    CREATE POLICY "Service role full access on student_learning_profiles"
        ON public.student_learning_profiles FOR ALL
        TO service_role
        USING (true)
        WITH CHECK (true);
END $$;

-- student_learning_roadmaps policies
DO $$
BEGIN
    DROP POLICY IF EXISTS "Users can read own roadmaps" ON public.student_learning_roadmaps;
    CREATE POLICY "Users can read own roadmaps"
        ON public.student_learning_roadmaps FOR SELECT
        TO authenticated
        USING (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can insert own roadmaps" ON public.student_learning_roadmaps;
    CREATE POLICY "Users can insert own roadmaps"
        ON public.student_learning_roadmaps FOR INSERT
        TO authenticated
        WITH CHECK (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can update own roadmaps" ON public.student_learning_roadmaps;
    CREATE POLICY "Users can update own roadmaps"
        ON public.student_learning_roadmaps FOR UPDATE
        TO authenticated
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can delete own roadmaps" ON public.student_learning_roadmaps;
    CREATE POLICY "Users can delete own roadmaps"
        ON public.student_learning_roadmaps FOR DELETE
        TO authenticated
        USING (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Service role full access on student_learning_roadmaps" ON public.student_learning_roadmaps;
    CREATE POLICY "Service role full access on student_learning_roadmaps"
        ON public.student_learning_roadmaps FOR ALL
        TO service_role
        USING (true)
        WITH CHECK (true);
END $$;

-- ── 4. Updated At Triggers ────────────────────────────────────────────
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
        DROP TRIGGER IF EXISTS trg_student_learning_profiles_updated_at ON public.student_learning_profiles;
        CREATE TRIGGER trg_student_learning_profiles_updated_at
            BEFORE UPDATE ON public.student_learning_profiles
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

        DROP TRIGGER IF EXISTS trg_student_learning_roadmaps_updated_at ON public.student_learning_roadmaps;
        CREATE TRIGGER trg_student_learning_roadmaps_updated_at
            BEFORE UPDATE ON public.student_learning_roadmaps
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;
