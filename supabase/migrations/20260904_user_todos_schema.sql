-- ====================================================================
-- SKILLSCATALYST - USER TO-DO LIST & NOTES SCHEMA
-- ====================================================================
-- Safe to execute in Supabase SQL Editor.
-- Provisions tables, RLS policies, and performance indexes for user to-dos and daily notes.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── 1. USER TODOS / TASKS TABLE ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_todos (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    deadline TEXT DEFAULT '',
    progress INTEGER NOT NULL DEFAULT 0,
    scheduled_day INTEGER,
    scheduled_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 2. USER SCHEDULE NOTES TABLE ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_schedule_notes (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    day INTEGER NOT NULL,
    date TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 3. PERFORMANCE INDEXES ───────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_user_todos_user_id ON public.user_todos(user_id);
CREATE INDEX IF NOT EXISTS idx_user_todos_created_at ON public.user_todos(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_notes_user_id ON public.user_schedule_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notes_created_at ON public.user_schedule_notes(user_id, created_at DESC);

-- ── 4. ENABLE ROW LEVEL SECURITY (RLS) ───────────────────────────────
ALTER TABLE public.user_todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_schedule_notes ENABLE ROW LEVEL SECURITY;

-- ── 5. RLS POLICIES: USER_TODOS ──────────────────────────────────────
DROP POLICY IF EXISTS "Users can view their own todos" ON public.user_todos;
CREATE POLICY "Users can view their own todos"
    ON public.user_todos FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own todos" ON public.user_todos;
CREATE POLICY "Users can insert their own todos"
    ON public.user_todos FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own todos" ON public.user_todos;
CREATE POLICY "Users can update their own todos"
    ON public.user_todos FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own todos" ON public.user_todos;
CREATE POLICY "Users can delete their own todos"
    ON public.user_todos FOR DELETE
    USING (auth.uid() = user_id);

-- ── 6. RLS POLICIES: USER_SCHEDULE_NOTES ─────────────────────────────
DROP POLICY IF EXISTS "Users can view their own notes" ON public.user_schedule_notes;
CREATE POLICY "Users can view their own notes"
    ON public.user_schedule_notes FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own notes" ON public.user_schedule_notes;
CREATE POLICY "Users can insert their own notes"
    ON public.user_schedule_notes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own notes" ON public.user_schedule_notes;
CREATE POLICY "Users can update their own notes"
    ON public.user_schedule_notes FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own notes" ON public.user_schedule_notes;
CREATE POLICY "Users can delete their own notes"
    ON public.user_schedule_notes FOR DELETE
    USING (auth.uid() = user_id);

-- ── 7. AUTO-UPDATE TIMESTAMP TRIGGERS ────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS trg_set_updated_at_user_todos ON public.user_todos;
CREATE TRIGGER trg_set_updated_at_user_todos
    BEFORE UPDATE ON public.user_todos
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_set_updated_at_user_notes ON public.user_schedule_notes;
CREATE TRIGGER trg_set_updated_at_user_notes
    BEFORE UPDATE ON public.user_schedule_notes
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
