-- ====================================================================
-- MODULE 14: PRODUCTIVITY, CALENDAR & NOTIFICATIONS (6 TABLES)
-- ====================================================================

-- 1. USER TODOS (Study Checklist)
CREATE TABLE IF NOT EXISTS public.user_todos (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    deadline TEXT DEFAULT '',
    progress INTEGER NOT NULL DEFAULT 0,
    scheduled_day INTEGER,
    scheduled_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_user_todos_user ON public.user_todos(user_id);

-- 2. USER SCHEDULE NOTES (Calendar Day Timetable)
CREATE TABLE IF NOT EXISTS public.user_schedule_notes (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    day INTEGER NOT NULL,
    date TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_user_notes_user ON public.user_schedule_notes(user_id);

-- 3. NOTIFICATION PREFERENCES (User Alert Toggles)
CREATE TABLE IF NOT EXISTS public.notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    streak_enabled BOOLEAN NOT NULL DEFAULT true,
    events_enabled BOOLEAN NOT NULL DEFAULT true,
    scholarships_enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_notification_preferences_user UNIQUE (user_id)
);

-- 4. PUSH SUBSCRIPTIONS (Browser VAPID Device Endpoints)
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    user_agent TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_push_subscriptions_endpoint UNIQUE (endpoint)
);
CREATE INDEX IF NOT EXISTS idx_push_subs_user ON public.push_subscriptions(user_id);

-- 5. NOTIFICATIONS (In-App Notification Inbox)
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    url TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_read BOOLEAN NOT NULL DEFAULT false,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_notif_user_unread ON public.notifications(user_id, is_read, created_at DESC);

-- 6. WELCOME EMAIL EVENTS (Signup Email Automation Queue)
CREATE TABLE IF NOT EXISTS public.welcome_email_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
    sent_at TIMESTAMPTZ,
    error_message TEXT,
    retry_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Triggers
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN SELECT unnest(ARRAY['user_todos', 'user_schedule_notes', 'notification_preferences', 'push_subscriptions', 'welcome_email_events'])
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS trg_set_updated_at_%I ON public.%I;', t, t);
        EXECUTE format('CREATE TRIGGER trg_set_updated_at_%I BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();', t, t);
    END LOOP;
END;
$$;

-- RLS
ALTER TABLE public.user_todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_schedule_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.welcome_email_events ENABLE ROW LEVEL SECURITY;

-- Strict User Ownership
DO $$
DECLARE
    tbl text;
BEGIN
    FOR tbl IN SELECT unnest(ARRAY['user_todos', 'user_schedule_notes', 'notification_preferences', 'push_subscriptions', 'notifications', 'welcome_email_events'])
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Users manage own %I" ON public.%I;', tbl, tbl);
        EXECUTE format('CREATE POLICY "Users manage own %I" ON public.%I FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);', tbl, tbl);

        EXECUTE format('DROP POLICY IF EXISTS "Service role full %I" ON public.%I;', tbl, tbl);
        EXECUTE format('CREATE POLICY "Service role full %I" ON public.%I FOR ALL TO service_role USING (true) WITH CHECK (true);', tbl, tbl);
    END LOOP;
END;
$$;
