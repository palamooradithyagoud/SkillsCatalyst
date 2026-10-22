-- ============================================================================
-- SKILLSCATALYST DATABASE MIGRATION
-- Migration Name: 20261028_mentor_task_actions_and_durable_idempotency.sql
-- Description: Creates the public.mentor_task_actions table for durable
--              action idempotency and audit tracking, and adds action_id /
--              batch_index with a partial unique constraint to public.tasks
--              to prevent duplicate task creation at the PostgreSQL engine level.
-- Phase:       Phase 2A — Production Hardening
--
-- Guarantees:
--   1. PostgreSQL PRIMARY KEY on mentor_task_actions(action_id) prevents duplicate
--      action execution records.
--   2. PostgreSQL UNIQUE INDEX uq_tasks_action_batch on public.tasks(action_id, batch_index)
--      prevents duplicate task inserts even if the backend crashes before recording
--      results in Redis or releasing locks.
--   3. Partial indexing (WHERE action_id IS NOT NULL) leaves regular non-AI tasks
--      completely unaffected.
--   4. Row Level Security (RLS) ensures strict tenant isolation per user_id.
--
-- Rollback Strategy:
--   DROP TABLE IF EXISTS public.mentor_task_actions CASCADE;
--   DROP INDEX IF EXISTS public.uq_tasks_action_batch;
--   DROP INDEX IF EXISTS public.idx_tasks_action_id;
--   ALTER TABLE public.tasks DROP COLUMN IF EXISTS batch_index;
--   ALTER TABLE public.tasks DROP COLUMN IF EXISTS action_id;
-- ============================================================================

-- ── 1. DEDICATED MENTOR TASK ACTIONS TABLE ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.mentor_task_actions (
    action_id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL,
    idempotency_key TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('in_progress', 'completed', 'failed')),
    created_task_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
    target_task_id UUID,
    response_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_mentor_action_type CHECK (
        action_type IN ('create_task', 'batch_create_tasks', 'update_task', 'complete_task', 'reopen_task', 'delete_task')
    )
);

-- Performance & Lookup Indexes
CREATE INDEX IF NOT EXISTS idx_mentor_task_actions_user_id
    ON public.mentor_task_actions(user_id);

CREATE INDEX IF NOT EXISTS idx_mentor_task_actions_user_idemp
    ON public.mentor_task_actions(user_id, idempotency_key);

CREATE INDEX IF NOT EXISTS idx_mentor_task_actions_created_at
    ON public.mentor_task_actions(created_at DESC);

-- Auto-update updated_at trigger
DROP TRIGGER IF EXISTS trg_mentor_task_actions_set_updated_at ON public.mentor_task_actions;
CREATE TRIGGER trg_mentor_task_actions_set_updated_at
    BEFORE UPDATE ON public.mentor_task_actions
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 2. ROW LEVEL SECURITY (RLS) FOR MENTOR TASK ACTIONS ───────────────────────
ALTER TABLE public.mentor_task_actions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own mentor actions" ON public.mentor_task_actions;
CREATE POLICY "Users can view their own mentor actions"
    ON public.mentor_task_actions FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own mentor actions" ON public.mentor_task_actions;
CREATE POLICY "Users can insert their own mentor actions"
    ON public.mentor_task_actions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own mentor actions" ON public.mentor_task_actions;
CREATE POLICY "Users can update their own mentor actions"
    ON public.mentor_task_actions FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Revoke all access from unauthenticated anon users
REVOKE ALL ON public.mentor_task_actions FROM anon;

-- Grant tenant operations to authenticated and service_role
GRANT SELECT, INSERT, UPDATE ON public.mentor_task_actions TO authenticated, service_role;


-- ── 3. EXTEND TASKS TABLE WITH ACTION TRACKING & UNIQUE ENGINE CONSTRAINT ─────
-- Non-destructively add action_id and batch_index columns
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS action_id UUID;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS batch_index INTEGER DEFAULT 0;

-- Partial unique index: Guarantees at PostgreSQL storage engine level that
-- no two tasks can ever be inserted with the same action_id and batch_index.
-- If a crash happens after DB commit and before Redis caching, any duplicate
-- insert attempt will be rejected immediately by PostgreSQL with code 23505.
CREATE UNIQUE INDEX IF NOT EXISTS uq_tasks_action_batch
    ON public.tasks(action_id, COALESCE(batch_index, 0))
    WHERE action_id IS NOT NULL;

-- Fast index for querying tasks committed by action_id during crash recovery
CREATE INDEX IF NOT EXISTS idx_tasks_action_id
    ON public.tasks(action_id)
    WHERE action_id IS NOT NULL;
