-- ============================================================================
-- SKILLSCATALYST DATABASE MIGRATION
-- Migration Name: 20261029_add_apply_schedule_plan_action_type.sql
-- Description: Updates the chk_mentor_action_type constraint on public.mentor_task_actions
--              to include the Phase 2B smart task planning action type: 'apply_schedule_plan'.
-- Phase:       Phase 2B — AI-Powered Smart Task Planning
--
-- Rollback Strategy:
--   ALTER TABLE public.mentor_task_actions DROP CONSTRAINT IF EXISTS chk_mentor_action_type;
--   ALTER TABLE public.mentor_task_actions ADD CONSTRAINT chk_mentor_action_type CHECK (
--       action_type IN ('create_task', 'batch_create_tasks', 'update_task', 'complete_task', 'reopen_task', 'delete_task')
--   );
-- ============================================================================

DO $$
BEGIN
    -- Update action_type check constraint if table exists
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'mentor_task_actions'
    ) THEN
        ALTER TABLE public.mentor_task_actions
            DROP CONSTRAINT IF EXISTS chk_mentor_action_type;

        ALTER TABLE public.mentor_task_actions
            ADD CONSTRAINT chk_mentor_action_type CHECK (
                action_type IN (
                    'create_task',
                    'batch_create_tasks',
                    'update_task',
                    'complete_task',
                    'reopen_task',
                    'delete_task',
                    'apply_schedule_plan'
                )
            );
    END IF;
END $$;
