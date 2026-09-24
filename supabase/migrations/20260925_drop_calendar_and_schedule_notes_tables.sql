-- ====================================================================
-- SKILLSCATALYST - REMOVE CALENDAR & SCHEDULE NOTES TABLES
-- ====================================================================
-- Purges the calendar schedule notes and user todos tables entirely
-- from the PostgreSQL database schema.

-- 1. Drop Triggers
DROP TRIGGER IF EXISTS trg_set_updated_at_user_todos ON public.user_todos;
DROP TRIGGER IF EXISTS trg_set_updated_at_user_schedule_notes ON public.user_schedule_notes;
DROP TRIGGER IF EXISTS trg_set_updated_at_user_notes ON public.user_schedule_notes;

-- 2. Drop RLS Policies
DROP POLICY IF EXISTS "Users can view their own todos" ON public.user_todos;

DROP POLICY IF EXISTS "Users can insert their own todos" ON public.user_todos;
DROP POLICY IF EXISTS "Users can update their own todos" ON public.user_todos;
DROP POLICY IF EXISTS "Users can delete their own todos" ON public.user_todos;
DROP POLICY IF EXISTS "Users can view own user_todos" ON public.user_todos;
DROP POLICY IF EXISTS "Users can insert own user_todos" ON public.user_todos;
DROP POLICY IF EXISTS "Users can update own user_todos" ON public.user_todos;
DROP POLICY IF EXISTS "Users can delete own user_todos" ON public.user_todos;
DROP POLICY IF EXISTS "Service role full access on user_todos" ON public.user_todos;

DROP POLICY IF EXISTS "Users can view their own notes" ON public.user_schedule_notes;
DROP POLICY IF EXISTS "Users can insert their own notes" ON public.user_schedule_notes;
DROP POLICY IF EXISTS "Users can update their own notes" ON public.user_schedule_notes;
DROP POLICY IF EXISTS "Users can delete their own notes" ON public.user_schedule_notes;
DROP POLICY IF EXISTS "Users can view own user_schedule_notes" ON public.user_schedule_notes;
DROP POLICY IF EXISTS "Users can insert own user_schedule_notes" ON public.user_schedule_notes;
DROP POLICY IF EXISTS "Users can update own user_schedule_notes" ON public.user_schedule_notes;
DROP POLICY IF EXISTS "Users can delete own user_schedule_notes" ON public.user_schedule_notes;
DROP POLICY IF EXISTS "Service role full access on user_schedule_notes" ON public.user_schedule_notes;

-- 3. Drop Tables Cascading Any Foreign Keys/Dependencies
DROP TABLE IF EXISTS public.user_schedule_notes CASCADE;
DROP TABLE IF EXISTS public.user_todos CASCADE;
