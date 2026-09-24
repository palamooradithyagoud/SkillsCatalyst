-- ====================================================================
-- SKILLSCATALYST - WEB PUSH NOTIFICATIONS & PREFERENCES SYSTEM
-- ====================================================================
-- Provisions:
-- 1. notification_preferences: Per-user notification toggles
-- 2. push_subscriptions: Multi-device Web Push endpoints and VAPID keys
-- 3. notifications: In-app notification center store with RLS and deduplication
-- ====================================================================

-- ── 1. NOTIFICATION PREFERENCES TABLE ─────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    streak_enabled BOOLEAN NOT NULL DEFAULT true,
    events_enabled BOOLEAN NOT NULL DEFAULT true,
    scholarships_enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_notification_preferences_user UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS idx_notification_preferences_user ON public.notification_preferences(user_id);

-- ── 2. PUSH SUBSCRIPTIONS TABLE (MULTI-DEVICE SUPPORT) ────────────────
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    user_agent TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_push_subscriptions_endpoint UNIQUE (endpoint)
);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user ON public.push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint ON public.push_subscriptions(endpoint);

-- ── 3. IN-APP NOTIFICATIONS TABLE ────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    url TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_read BOOLEAN NOT NULL DEFAULT false,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Core query indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread 
    ON public.notifications (user_id, is_read, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_user_created 
    ON public.notifications (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_metadata 
    ON public.notifications USING gin (metadata);

-- Deduplication Unique Indexes:
-- A) Prevent duplicate event broadcast notifications for the same user
CREATE UNIQUE INDEX IF NOT EXISTS idx_notifications_event_dedup 
    ON public.notifications(user_id, (metadata->>'source_id')) 
    WHERE (metadata->>'source_type') = 'event';

-- B) Prevent duplicate scholarship broadcast notifications for the same user
CREATE UNIQUE INDEX IF NOT EXISTS idx_notifications_scholarship_dedup 
    ON public.notifications(user_id, (metadata->>'source_id')) 
    WHERE (metadata->>'source_type') = 'scholarship';

-- C) Prevent multiple streak notifications per user per calendar date
CREATE UNIQUE INDEX IF NOT EXISTS idx_notifications_streak_daily_dedup 
    ON public.notifications(user_id, (metadata->>'streak_date')) 
    WHERE type = 'streak';

-- ── 4. AUTO-UPDATE TIMESTAMPS TRIGGERS ────────────────────────────────
DROP TRIGGER IF EXISTS trg_set_updated_at_notification_preferences ON public.notification_preferences;
CREATE TRIGGER trg_set_updated_at_notification_preferences
    BEFORE UPDATE ON public.notification_preferences
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_set_updated_at_push_subscriptions ON public.push_subscriptions;
CREATE TRIGGER trg_set_updated_at_push_subscriptions
    BEFORE UPDATE ON public.push_subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 5. ROW LEVEL SECURITY (RLS) POLICIES ─────────────────────────────
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Preferences: Users manage own preferences
DROP POLICY IF EXISTS "Users can view own notification preferences" ON public.notification_preferences;
CREATE POLICY "Users can view own notification preferences" 
    ON public.notification_preferences FOR SELECT 
    TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own notification preferences" ON public.notification_preferences;
CREATE POLICY "Users can insert own notification preferences" 
    ON public.notification_preferences FOR INSERT 
    TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notification preferences" ON public.notification_preferences;
CREATE POLICY "Users can update own notification preferences" 
    ON public.notification_preferences FOR UPDATE 
    TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role full access on notification_preferences" ON public.notification_preferences;
CREATE POLICY "Service role full access on notification_preferences" 
    ON public.notification_preferences FOR ALL 
    TO service_role USING (true) WITH CHECK (true);

-- Push Subscriptions: Users manage own subscriptions
DROP POLICY IF EXISTS "Users can view own push subscriptions" ON public.push_subscriptions;
CREATE POLICY "Users can view own push subscriptions" 
    ON public.push_subscriptions FOR SELECT 
    TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own push subscriptions" ON public.push_subscriptions;
CREATE POLICY "Users can insert own push subscriptions" 
    ON public.push_subscriptions FOR INSERT 
    TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own push subscriptions" ON public.push_subscriptions;
CREATE POLICY "Users can update own push subscriptions" 
    ON public.push_subscriptions FOR UPDATE 
    TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own push subscriptions" ON public.push_subscriptions;
CREATE POLICY "Users can delete own push subscriptions" 
    ON public.push_subscriptions FOR DELETE 
    TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role full access on push_subscriptions" ON public.push_subscriptions;
CREATE POLICY "Service role full access on push_subscriptions" 
    ON public.push_subscriptions FOR ALL 
    TO service_role USING (true) WITH CHECK (true);

-- Notifications: Strict tenant isolation (Users can only read & mark read; CANNOT insert system notifications)
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications" 
    ON public.notifications FOR SELECT 
    TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications read status" ON public.notifications;
CREATE POLICY "Users can update own notifications read status" 
    ON public.notifications FOR UPDATE 
    TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role full access on notifications" ON public.notifications;
CREATE POLICY "Service role full access on notifications" 
    ON public.notifications FOR ALL 
    TO service_role USING (true) WITH CHECK (true);

-- ── 6. PERMISSIONS & GRANTS ──────────────────────────────────────────
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notification_preferences TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.push_subscriptions TO authenticated, service_role;
GRANT SELECT, UPDATE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
