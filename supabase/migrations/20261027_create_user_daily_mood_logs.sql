-- ====================================================================
-- SKILLSCATALYST DATABASE MIGRATION
-- Migration Name: 20261027_create_user_daily_mood_logs.sql
-- Description: Creates production-grade user_daily_mood_logs table for
--              tracking daily user emotional check-ins, syncing across
--              past and future calendar months with strict Row Level Security (RLS)
--              and tenant isolation.
-- ====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── 1. USER DAILY MOOD LOGS TABLE ────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_daily_mood_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    log_date DATE NOT NULL,
    mood VARCHAR(30) NOT NULL CHECK (mood IN ('happy', 'angry', 'sleepy', 'bored', 'calm', 'wacky', 'pouty')),
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),

    -- Ensure each user can only have one mood log per calendar day
    CONSTRAINT uq_user_daily_mood_log UNIQUE (user_id, log_date),
    CONSTRAINT chk_user_mood_note_length CHECK (note IS NULL OR LENGTH(note) <= 1000)
);

-- ── 2. ACCESS-PATTERN INDEXES ─────────────────────────────────────────
-- Access patterns: query user's logs by month/date range, and aggregate moods
CREATE INDEX IF NOT EXISTS idx_user_mood_logs_user_date 
    ON public.user_daily_mood_logs(user_id, log_date DESC);

CREATE INDEX IF NOT EXISTS idx_user_mood_logs_lookup 
    ON public.user_daily_mood_logs(user_id, log_date, mood);

-- ── 3. ROW LEVEL SECURITY (TENANT ISOLATION) ──────────────────────────
ALTER TABLE public.user_daily_mood_logs ENABLE ROW LEVEL SECURITY;

-- Select Policy: Users can only read their own daily mood logs
CREATE POLICY "Users can view their own mood logs"
    ON public.user_daily_mood_logs FOR SELECT
    USING (auth.uid() = user_id);

-- Insert Policy: Users can only log mood for themselves
CREATE POLICY "Users can insert their own mood logs"
    ON public.user_daily_mood_logs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Update Policy: Users can update their own daily mood logs
CREATE POLICY "Users can update their own mood logs"
    ON public.user_daily_mood_logs FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Delete Policy: Users can delete their own daily mood logs
CREATE POLICY "Users can delete their own mood logs"
    ON public.user_daily_mood_logs FOR DELETE
    USING (auth.uid() = user_id);

-- ── 4. AUTO-UPDATE UPDATED_AT TRIGGER ─────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_updated_at_mood_logs()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc', now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_user_daily_mood_logs_updated_at ON public.user_daily_mood_logs;
CREATE TRIGGER trg_user_daily_mood_logs_updated_at
    BEFORE UPDATE ON public.user_daily_mood_logs
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at_mood_logs();
