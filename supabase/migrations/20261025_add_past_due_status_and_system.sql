-- ====================================================================
-- SKILLSCATALYST DATABASE MIGRATION
-- Migration Name: 20261025_add_past_due_status_and_system.sql
-- Description: Adds 'past_due' status to tasks check constraint,
--              creates index for past-due filtering, and adds
--              an automatic synchronization function to transition
--              uncompleted tasks past their deadline to 'past_due'.
-- ====================================================================

-- 1. Upgrade status check constraint to include 'past_due'
ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_status_check;
ALTER TABLE public.tasks ADD CONSTRAINT tasks_status_check
    CHECK (status IN ('todo', 'in_progress', 'completed', 'past_due'));

-- 2. Performance index for past due queries
CREATE INDEX IF NOT EXISTS idx_tasks_past_due ON public.tasks(user_id, status, due_at);

-- 3. Stored procedure to mark overdue tasks as 'past_due'
-- Rule: If a task has a due date in the past and is not completed, it is past due.
CREATE OR REPLACE FUNCTION public.sync_past_due_tasks()
RETURNS INTEGER AS $$
DECLARE
    affected_count INTEGER;
BEGIN
    UPDATE public.tasks
    SET status = 'past_due',
        updated_at = NOW()
    WHERE status NOT IN ('completed', 'past_due')
      AND due_at IS NOT NULL
      AND due_at < NOW();
    GET DIAGNOSTICS affected_count = ROW_COUNT;
    RETURN affected_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 4. Trigger on task creation or update: if task has expired deadline and is not completed, auto-set status to 'past_due'
CREATE OR REPLACE FUNCTION public.handle_task_past_due_check()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status NOT IN ('completed', 'past_due') AND NEW.due_at IS NOT NULL AND NEW.due_at < NOW() THEN
        NEW.status = 'past_due';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS trg_tasks_past_due_check ON public.tasks;
CREATE TRIGGER trg_tasks_past_due_check
    BEFORE INSERT OR UPDATE OF due_at, status ON public.tasks
    FOR EACH ROW EXECUTE FUNCTION public.handle_task_past_due_check();
