-- ============================================================================
-- Migration: 20260924_create_user_skillbit_progress.sql
-- Description: Creates public.user_skillbit_progress table, constraints,
--              performance indexes, updated_at trigger, and strict RLS policies
--              for SkillBits video learning progress (Step 4).
-- ============================================================================

-- ── 1. Create user_skillbit_progress table ────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_skillbit_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    skillbit_id UUID NOT NULL REFERENCES public.skillbits(id) ON DELETE CASCADE,

    -- Playback Progress Tracking
    watched_seconds INTEGER NOT NULL DEFAULT 0,
    completion_percentage NUMERIC NOT NULL DEFAULT 0,
    last_position_seconds NUMERIC NOT NULL DEFAULT 0,

    -- Lifecycle & Timestamps
    started_at TIMESTAMPTZ NULL,
    last_watched_at TIMESTAMPTZ NULL,
    completed_at TIMESTAMPTZ NULL,
    completed BOOLEAN NOT NULL DEFAULT FALSE,

    -- Audit Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Constraints
    CONSTRAINT uq_user_skillbit_progress UNIQUE (user_id, skillbit_id),
    CONSTRAINT chk_skillbit_progress_watched_seconds CHECK (watched_seconds >= 0),
    CONSTRAINT chk_skillbit_progress_last_position CHECK (last_position_seconds >= 0),
    CONSTRAINT chk_skillbit_progress_completion_pct CHECK (completion_percentage >= 0 AND completion_percentage <= 100)
);

-- ── 2. Performance Indexes ────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_user_skillbit_progress_user_id
    ON public.user_skillbit_progress (user_id);

CREATE INDEX IF NOT EXISTS idx_user_skillbit_progress_skillbit_id
    ON public.user_skillbit_progress (skillbit_id);

CREATE INDEX IF NOT EXISTS idx_user_skillbit_progress_user_skillbit
    ON public.user_skillbit_progress (user_id, skillbit_id);

CREATE INDEX IF NOT EXISTS idx_user_skillbit_progress_completed
    ON public.user_skillbit_progress (user_id, completed);

-- ── 3. Automated updated_at Trigger ───────────────────────────────────────────
DROP TRIGGER IF EXISTS trg_user_skillbit_progress_updated_at ON public.user_skillbit_progress;
CREATE TRIGGER trg_user_skillbit_progress_updated_at
    BEFORE UPDATE ON public.user_skillbit_progress
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ── 4. Enable Row Level Security (RLS) ────────────────────────────────────────
ALTER TABLE public.user_skillbit_progress ENABLE ROW LEVEL SECURITY;

-- ── 5. RLS Policies: Personal Data Isolation ─────────────────────────────────

-- Authenticated student: Read ONLY their own progress
DROP POLICY IF EXISTS "Users can read own skillbit progress" ON public.user_skillbit_progress;
CREATE POLICY "Users can read own skillbit progress"
    ON public.user_skillbit_progress
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Authenticated student: Insert ONLY their own progress
DROP POLICY IF EXISTS "Users can insert own skillbit progress" ON public.user_skillbit_progress;
CREATE POLICY "Users can insert own skillbit progress"
    ON public.user_skillbit_progress
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Authenticated student: Update ONLY their own progress
DROP POLICY IF EXISTS "Users can update own skillbit progress" ON public.user_skillbit_progress;
CREATE POLICY "Users can update own skillbit progress"
    ON public.user_skillbit_progress
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Service role full access for backend worker/admin processes
DROP POLICY IF EXISTS "Service role full access on user_skillbit_progress" ON public.user_skillbit_progress;
CREATE POLICY "Service role full access on user_skillbit_progress"
    ON public.user_skillbit_progress
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
