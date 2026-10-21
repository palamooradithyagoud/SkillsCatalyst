-- ====================================================================
-- SKILLSCATALYST DATABASE MIGRATION
-- Migration Name: 20261024_create_tasks_and_subtasks_system.sql
-- Description: Creates production-grade tasks and subtasks tables for
--              the user To-Do List system with complete Row Level Security (RLS),
--              ownership validation, foreign key cascades, and access-pattern indexes.
-- ====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── 1. TASKS TABLE ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'completed', 'past_due')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    category TEXT NOT NULL DEFAULT 'Other' CHECK (category IN ('Study', 'Assignments', 'Projects', 'Hackathons', 'Career', 'Personal', 'Other')),
    due_at TIMESTAMPTZ,
    estimated_minutes INTEGER CHECK (estimated_minutes IS NULL OR (estimated_minutes >= 0 AND estimated_minutes <= 10080)),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT chk_tasks_title_not_empty CHECK (LENGTH(TRIM(title)) > 0 AND LENGTH(title) <= 255),
    CONSTRAINT chk_tasks_description_length CHECK (description IS NULL OR LENGTH(description) <= 4000)
);

-- ── 2. SUBTASKS TABLE ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.subtasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    is_completed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT chk_subtasks_title_not_empty CHECK (LENGTH(TRIM(title)) > 0 AND LENGTH(title) <= 255)
);

-- ── 3. PERFORMANCE INDEXES ───────────────────────────────────────────
-- Access patterns: by user, status, due date, priority, and creation time
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user_status ON public.tasks(user_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_user_due_at ON public.tasks(user_id, due_at);
CREATE INDEX IF NOT EXISTS idx_tasks_user_priority ON public.tasks(user_id, priority);
CREATE INDEX IF NOT EXISTS idx_tasks_user_category ON public.tasks(user_id, category);
CREATE INDEX IF NOT EXISTS idx_tasks_user_created_at ON public.tasks(user_id, created_at DESC);

-- Subtask indexes: by parent task and user
CREATE INDEX IF NOT EXISTS idx_subtasks_task_id ON public.subtasks(task_id);
CREATE INDEX IF NOT EXISTS idx_subtasks_user_id ON public.subtasks(user_id);
CREATE INDEX IF NOT EXISTS idx_subtasks_task_created ON public.subtasks(task_id, created_at ASC);

-- ── 4. AUTO-UPDATE TIMESTAMP & STATUS TRIGGERS ───────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS trg_tasks_set_updated_at ON public.tasks;
CREATE TRIGGER trg_tasks_set_updated_at
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_subtasks_set_updated_at ON public.subtasks;
CREATE TRIGGER trg_subtasks_set_updated_at
    BEFORE UPDATE ON public.subtasks
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Automatically sync completed_at on status changes if not manually set
CREATE OR REPLACE FUNCTION public.handle_task_status_transition()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND (OLD.status IS DISTINCT FROM 'completed') THEN
        IF NEW.completed_at IS NULL THEN
            NEW.completed_at = NOW();
        END IF;
    ELSIF NEW.status != 'completed' AND (OLD.status = 'completed') THEN
        NEW.completed_at = NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS trg_tasks_status_transition ON public.tasks;
CREATE TRIGGER trg_tasks_status_transition
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW EXECUTE FUNCTION public.handle_task_status_transition();

-- ── 5. ROW LEVEL SECURITY (RLS) ──────────────────────────────────────
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subtasks ENABLE ROW LEVEL SECURITY;

-- Tasks Policies: strictly tenant-isolated
DROP POLICY IF EXISTS "Users can view their own tasks" ON public.tasks;
CREATE POLICY "Users can view their own tasks"
    ON public.tasks FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own tasks" ON public.tasks;
CREATE POLICY "Users can insert their own tasks"
    ON public.tasks FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own tasks" ON public.tasks;
CREATE POLICY "Users can update their own tasks"
    ON public.tasks FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own tasks" ON public.tasks;
CREATE POLICY "Users can delete their own tasks"
    ON public.tasks FOR DELETE
    USING (auth.uid() = user_id);

-- Subtasks Policies: strictly tenant-isolated AND validated against parent task ownership
DROP POLICY IF EXISTS "Users can view their own subtasks" ON public.subtasks;
CREATE POLICY "Users can view their own subtasks"
    ON public.subtasks FOR SELECT
    USING (
        auth.uid() = user_id
        AND EXISTS (
            SELECT 1 FROM public.tasks t
            WHERE t.id = subtasks.task_id AND t.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can insert their own subtasks" ON public.subtasks;
CREATE POLICY "Users can insert their own subtasks"
    ON public.subtasks FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
        AND EXISTS (
            SELECT 1 FROM public.tasks t
            WHERE t.id = subtasks.task_id AND t.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can update their own subtasks" ON public.subtasks;
CREATE POLICY "Users can update their own subtasks"
    ON public.subtasks FOR UPDATE
    USING (
        auth.uid() = user_id
        AND EXISTS (
            SELECT 1 FROM public.tasks t
            WHERE t.id = subtasks.task_id AND t.user_id = auth.uid()
        )
    )
    WITH CHECK (
        auth.uid() = user_id
        AND EXISTS (
            SELECT 1 FROM public.tasks t
            WHERE t.id = subtasks.task_id AND t.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can delete their own subtasks" ON public.subtasks;
CREATE POLICY "Users can delete their own subtasks"
    ON public.subtasks FOR DELETE
    USING (
        auth.uid() = user_id
        AND EXISTS (
            SELECT 1 FROM public.tasks t
            WHERE t.id = subtasks.task_id AND t.user_id = auth.uid()
        )
    );

-- ── 6. PERMISSIONS & GRANTS ──────────────────────────────────────────
-- Revoke all access from unauthenticated anon users
REVOKE ALL ON public.tasks FROM anon;
REVOKE ALL ON public.subtasks FROM anon;

-- Grant standard tenant operations to authenticated and service_role
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tasks TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.subtasks TO authenticated, service_role;
