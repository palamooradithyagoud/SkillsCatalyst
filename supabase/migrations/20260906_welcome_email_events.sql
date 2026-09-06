-- ====================================================================
-- SKILLSCATALYST DATABASE MIGRATION
-- Migration Name: 20260906_welcome_email_events.sql
-- Description: Durable, idempotent Welcome Email event tracking table
--              with processing leases, attempt counters, and unique
--              constraints for exactly-one welcome email per user.
-- ====================================================================

-- ── 1. WELCOME EMAIL EVENTS TABLE ──────────────────────────────────
CREATE TABLE IF NOT EXISTS public.welcome_email_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'sent', 'failed')),
    attempts INTEGER NOT NULL DEFAULT 0,
    resend_id TEXT NULL,
    last_error TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    processing_until TIMESTAMPTZ NULL,
    sent_at TIMESTAMPTZ NULL
);

-- ── 2. PERFORMANCE & LOOKUP INDEXES ────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_welcome_email_events_user_id 
    ON public.welcome_email_events(user_id);

CREATE INDEX IF NOT EXISTS idx_welcome_email_events_status_lease 
    ON public.welcome_email_events(status, processing_until);

-- ── 3. ROW LEVEL SECURITY (RLS) POLICIES ───────────────────────────
ALTER TABLE public.welcome_email_events ENABLE ROW LEVEL SECURITY;

-- Service role has full unrestricted access for backend daemon & API processing
DROP POLICY IF EXISTS "Service role full access on welcome_email_events" ON public.welcome_email_events;
CREATE POLICY "Service role full access on welcome_email_events" 
    ON public.welcome_email_events FOR ALL 
    TO service_role 
    USING (true) WITH CHECK (true);

-- Authenticated users can view their own email delivery status
DROP POLICY IF EXISTS "Users can view their own welcome_email_events" ON public.welcome_email_events;
CREATE POLICY "Users can view their own welcome_email_events" 
    ON public.welcome_email_events FOR SELECT 
    TO authenticated 
    USING (auth.uid() = user_id);

-- ── 4. AUTOMATIC SIGNUP TRIGGER FOR NEW USERS ───────────────────────
-- Fires ONLY on genuine new user creation (Email/Password or Google OAuth)
CREATE OR REPLACE FUNCTION public.handle_welcome_email_on_signup()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.welcome_email_events (user_id, email, status, created_at, updated_at)
    VALUES (
        NEW.id,
        COALESCE(NEW.email, ''),
        'pending',
        NOW(),
        NOW()
    )
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_welcome_email_on_signup ON auth.users;
CREATE TRIGGER trg_welcome_email_on_signup
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_welcome_email_on_signup();
