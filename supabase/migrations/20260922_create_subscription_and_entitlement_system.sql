-- ============================================================================
-- Migration: 20260922_create_subscription_and_entitlement_system.sql
-- Description: Creates commercial subscription plans, centralized feature
--              entitlements, user subscription lifecycle states, immutable
--              subscription event audit logs, updated_at triggers, and strict RLS.
-- Phase:       Payments Phase 1 — Subscription & Entitlement Foundation
-- ============================================================================

-- 1. Create subscription_plans table
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE CHECK (code IN ('free', 'premium_monthly', 'premium_3_month')),
    name TEXT NOT NULL,
    description TEXT NULL,
    price_in_paise INTEGER NOT NULL CHECK (price_in_paise >= 0),
    currency TEXT NOT NULL DEFAULT 'INR',
    duration_days INTEGER NULL CHECK (duration_days IS NULL OR duration_days > 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Create plan_entitlements table
CREATE TABLE IF NOT EXISTS public.plan_entitlements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL REFERENCES public.subscription_plans(id) ON DELETE CASCADE,
    feature_key TEXT NOT NULL CHECK (
        feature_key IN (
            'saved_videos',
            'company_interview_questions',
            'placement_prep',
            'scholarships',
            'tech_news',
            'ai_mentor',
            'roadmaps'
        )
    ),
    access_level TEXT NOT NULL CHECK (access_level IN ('none', 'limited', 'full')),
    limit_value INTEGER NULL CHECK (limit_value IS NULL OR limit_value >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_plan_feature UNIQUE (plan_id, feature_key)
);

-- 3. Create user_subscriptions table
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES public.subscription_plans(id) ON DELETE RESTRICT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ NULL,
    cancelled_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Create subscription_events table (Immutable audit trail)
CREATE TABLE IF NOT EXISTS public.subscription_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_id UUID NULL REFERENCES public.user_subscriptions(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL CHECK (
        event_type IN (
            'subscription_created',
            'subscription_activated',
            'subscription_expired',
            'subscription_cancelled',
            'subscription_updated'
        )
    ),
    provider TEXT NULL,
    provider_event_id TEXT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Indexes for fast resolution and query performance
CREATE INDEX IF NOT EXISTS idx_subscription_plans_code
    ON public.subscription_plans(code);

CREATE INDEX IF NOT EXISTS idx_subscription_plans_active
    ON public.subscription_plans(is_active);

CREATE INDEX IF NOT EXISTS idx_plan_entitlements_lookup
    ON public.plan_entitlements(plan_id, feature_key);

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_lookup
    ON public.user_subscriptions(user_id, status, expires_at);

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_plan_id
    ON public.user_subscriptions(plan_id);

CREATE INDEX IF NOT EXISTS idx_subscription_events_user
    ON public.subscription_events(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_subscription_events_sub
    ON public.subscription_events(subscription_id);

-- 6. Updated_at triggers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_subscription_plans_updated_at ON public.subscription_plans;
CREATE TRIGGER trg_subscription_plans_updated_at
    BEFORE UPDATE ON public.subscription_plans
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_plan_entitlements_updated_at ON public.plan_entitlements;
CREATE TRIGGER trg_plan_entitlements_updated_at
    BEFORE UPDATE ON public.plan_entitlements
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_user_subscriptions_updated_at ON public.user_subscriptions;
CREATE TRIGGER trg_user_subscriptions_updated_at
    BEFORE UPDATE ON public.user_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 7. Enable Row Level Security (RLS)
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_events ENABLE ROW LEVEL SECURITY;

-- 8. RLS Policies: subscription_plans
-- Public/Student read: active commercial plans
DROP POLICY IF EXISTS "Public can view active subscription plans" ON public.subscription_plans;
CREATE POLICY "Public can view active subscription plans"
    ON public.subscription_plans
    FOR SELECT
    TO public
    USING (is_active = true);

-- Platform Owner management
DROP POLICY IF EXISTS "Owners can manage subscription plans" ON public.subscription_plans;
CREATE POLICY "Owners can manage subscription plans"
    ON public.subscription_plans
    FOR ALL
    TO authenticated
    USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'owner')
        OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'owner'
    )
    WITH CHECK (
        EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'owner')
        OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'owner'
    );

-- Service role full access
DROP POLICY IF EXISTS "Service role full access on subscription plans" ON public.subscription_plans;
CREATE POLICY "Service role full access on subscription plans"
    ON public.subscription_plans
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 9. RLS Policies: plan_entitlements
-- Public/Student read: anyone can read entitlements
DROP POLICY IF EXISTS "Public can view plan entitlements" ON public.plan_entitlements;
CREATE POLICY "Public can view plan entitlements"
    ON public.plan_entitlements
    FOR SELECT
    TO public
    USING (true);

-- Platform Owner management
DROP POLICY IF EXISTS "Owners can manage plan entitlements" ON public.plan_entitlements;
CREATE POLICY "Owners can manage plan entitlements"
    ON public.plan_entitlements
    FOR ALL
    TO authenticated
    USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'owner')
        OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'owner'
    )
    WITH CHECK (
        EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'owner')
        OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'owner'
    );

-- Service role full access
DROP POLICY IF EXISTS "Service role full access on plan entitlements" ON public.plan_entitlements;
CREATE POLICY "Service role full access on plan entitlements"
    ON public.plan_entitlements
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 10. RLS Policies: user_subscriptions
-- Users can view ONLY their own subscription state
DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.user_subscriptions;
CREATE POLICY "Users can view own subscriptions"
    ON public.user_subscriptions
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Platform Owner can view all subscriptions
DROP POLICY IF EXISTS "Owners can view all user subscriptions" ON public.user_subscriptions;
CREATE POLICY "Owners can view all user subscriptions"
    ON public.user_subscriptions
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'owner')
        OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'owner'
    );

-- Service role full access (Mutations MUST be performed by server-side service role)
DROP POLICY IF EXISTS "Service role full access on user subscriptions" ON public.user_subscriptions;
CREATE POLICY "Service role full access on user subscriptions"
    ON public.user_subscriptions
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 11. RLS Policies: subscription_events
-- Users can view ONLY their own events
DROP POLICY IF EXISTS "Users can view own subscription events" ON public.subscription_events;
CREATE POLICY "Users can view own subscription events"
    ON public.subscription_events
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Platform Owner can view all subscription events
DROP POLICY IF EXISTS "Owners can view all subscription events" ON public.subscription_events;
CREATE POLICY "Owners can view all subscription events"
    ON public.subscription_events
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'owner')
        OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'owner'
    );

-- Service role full access
DROP POLICY IF EXISTS "Service role full access on subscription events" ON public.subscription_events;
CREATE POLICY "Service role full access on subscription events"
    ON public.subscription_events
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 12. Seed Canonical Subscription Plans
INSERT INTO public.subscription_plans (code, name, description, price_in_paise, currency, duration_days, is_active)
VALUES
    ('free', 'Free', 'Essential foundational access to explore skills', 0, 'INR', NULL, true),
    ('premium_monthly', 'Premium Monthly', 'Fast-paced interview sprint preparation with unrestricted access', 9900, 'INR', 30, true),
    ('premium_3_month', 'Premium 3 Months', 'Complete 90-day placement preparation pack (Save ~16%)', 25000, 'INR', 90, true)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price_in_paise = EXCLUDED.price_in_paise,
    currency = EXCLUDED.currency,
    duration_days = EXCLUDED.duration_days,
    is_active = EXCLUDED.is_active,
    updated_at = now();

-- 13. Seed Entitlements for Free Plan
INSERT INTO public.plan_entitlements (plan_id, feature_key, access_level, limit_value)
SELECT id, 'saved_videos', 'limited', 1 FROM public.subscription_plans WHERE code = 'free'
ON CONFLICT (plan_id, feature_key) DO UPDATE SET access_level = EXCLUDED.access_level, limit_value = EXCLUDED.limit_value, updated_at = now();

INSERT INTO public.plan_entitlements (plan_id, feature_key, access_level, limit_value)
SELECT id, 'company_interview_questions', 'none', NULL FROM public.subscription_plans WHERE code = 'free'
ON CONFLICT (plan_id, feature_key) DO UPDATE SET access_level = EXCLUDED.access_level, limit_value = EXCLUDED.limit_value, updated_at = now();

INSERT INTO public.plan_entitlements (plan_id, feature_key, access_level, limit_value)
SELECT id, 'placement_prep', 'none', NULL FROM public.subscription_plans WHERE code = 'free'
ON CONFLICT (plan_id, feature_key) DO UPDATE SET access_level = EXCLUDED.access_level, limit_value = EXCLUDED.limit_value, updated_at = now();

INSERT INTO public.plan_entitlements (plan_id, feature_key, access_level, limit_value)
SELECT id, 'scholarships', 'limited', NULL FROM public.subscription_plans WHERE code = 'free'
ON CONFLICT (plan_id, feature_key) DO UPDATE SET access_level = EXCLUDED.access_level, limit_value = EXCLUDED.limit_value, updated_at = now();

INSERT INTO public.plan_entitlements (plan_id, feature_key, access_level, limit_value)
SELECT id, 'tech_news', 'limited', 2 FROM public.subscription_plans WHERE code = 'free'
ON CONFLICT (plan_id, feature_key) DO UPDATE SET access_level = EXCLUDED.access_level, limit_value = EXCLUDED.limit_value, updated_at = now();

INSERT INTO public.plan_entitlements (plan_id, feature_key, access_level, limit_value)
SELECT id, 'ai_mentor', 'limited', NULL FROM public.subscription_plans WHERE code = 'free'
ON CONFLICT (plan_id, feature_key) DO UPDATE SET access_level = EXCLUDED.access_level, limit_value = EXCLUDED.limit_value, updated_at = now();

INSERT INTO public.plan_entitlements (plan_id, feature_key, access_level, limit_value)
SELECT id, 'roadmaps', 'limited', NULL FROM public.subscription_plans WHERE code = 'free'
ON CONFLICT (plan_id, feature_key) DO UPDATE SET access_level = EXCLUDED.access_level, limit_value = EXCLUDED.limit_value, updated_at = now();

-- 14. Seed Entitlements for Premium Monthly Plan
INSERT INTO public.plan_entitlements (plan_id, feature_key, access_level, limit_value)
SELECT id, 'saved_videos', 'full', NULL FROM public.subscription_plans WHERE code = 'premium_monthly'
ON CONFLICT (plan_id, feature_key) DO UPDATE SET access_level = EXCLUDED.access_level, limit_value = EXCLUDED.limit_value, updated_at = now();

INSERT INTO public.plan_entitlements (plan_id, feature_key, access_level, limit_value)
SELECT id, 'company_interview_questions', 'full', NULL FROM public.subscription_plans WHERE code = 'premium_monthly'
ON CONFLICT (plan_id, feature_key) DO UPDATE SET access_level = EXCLUDED.access_level, limit_value = EXCLUDED.limit_value, updated_at = now();

INSERT INTO public.plan_entitlements (plan_id, feature_key, access_level, limit_value)
SELECT id, 'placement_prep', 'full', NULL FROM public.subscription_plans WHERE code = 'premium_monthly'
ON CONFLICT (plan_id, feature_key) DO UPDATE SET access_level = EXCLUDED.access_level, limit_value = EXCLUDED.limit_value, updated_at = now();

INSERT INTO public.plan_entitlements (plan_id, feature_key, access_level, limit_value)
SELECT id, 'scholarships', 'full', NULL FROM public.subscription_plans WHERE code = 'premium_monthly'
ON CONFLICT (plan_id, feature_key) DO UPDATE SET access_level = EXCLUDED.access_level, limit_value = EXCLUDED.limit_value, updated_at = now();

INSERT INTO public.plan_entitlements (plan_id, feature_key, access_level, limit_value)
SELECT id, 'tech_news', 'full', NULL FROM public.subscription_plans WHERE code = 'premium_monthly'
ON CONFLICT (plan_id, feature_key) DO UPDATE SET access_level = EXCLUDED.access_level, limit_value = EXCLUDED.limit_value, updated_at = now();

INSERT INTO public.plan_entitlements (plan_id, feature_key, access_level, limit_value)
SELECT id, 'ai_mentor', 'full', NULL FROM public.subscription_plans WHERE code = 'premium_monthly'
ON CONFLICT (plan_id, feature_key) DO UPDATE SET access_level = EXCLUDED.access_level, limit_value = EXCLUDED.limit_value, updated_at = now();

INSERT INTO public.plan_entitlements (plan_id, feature_key, access_level, limit_value)
SELECT id, 'roadmaps', 'full', NULL FROM public.subscription_plans WHERE code = 'premium_monthly'
ON CONFLICT (plan_id, feature_key) DO UPDATE SET access_level = EXCLUDED.access_level, limit_value = EXCLUDED.limit_value, updated_at = now();

-- 15. Seed Entitlements for Premium 3 Months Plan (Identical to Premium Monthly)
INSERT INTO public.plan_entitlements (plan_id, feature_key, access_level, limit_value)
SELECT id, 'saved_videos', 'full', NULL FROM public.subscription_plans WHERE code = 'premium_3_month'
ON CONFLICT (plan_id, feature_key) DO UPDATE SET access_level = EXCLUDED.access_level, limit_value = EXCLUDED.limit_value, updated_at = now();

INSERT INTO public.plan_entitlements (plan_id, feature_key, access_level, limit_value)
SELECT id, 'company_interview_questions', 'full', NULL FROM public.subscription_plans WHERE code = 'premium_3_month'
ON CONFLICT (plan_id, feature_key) DO UPDATE SET access_level = EXCLUDED.access_level, limit_value = EXCLUDED.limit_value, updated_at = now();

INSERT INTO public.plan_entitlements (plan_id, feature_key, access_level, limit_value)
SELECT id, 'placement_prep', 'full', NULL FROM public.subscription_plans WHERE code = 'premium_3_month'
ON CONFLICT (plan_id, feature_key) DO UPDATE SET access_level = EXCLUDED.access_level, limit_value = EXCLUDED.limit_value, updated_at = now();

INSERT INTO public.plan_entitlements (plan_id, feature_key, access_level, limit_value)
SELECT id, 'scholarships', 'full', NULL FROM public.subscription_plans WHERE code = 'premium_3_month'
ON CONFLICT (plan_id, feature_key) DO UPDATE SET access_level = EXCLUDED.access_level, limit_value = EXCLUDED.limit_value, updated_at = now();

INSERT INTO public.plan_entitlements (plan_id, feature_key, access_level, limit_value)
SELECT id, 'tech_news', 'full', NULL FROM public.subscription_plans WHERE code = 'premium_3_month'
ON CONFLICT (plan_id, feature_key) DO UPDATE SET access_level = EXCLUDED.access_level, limit_value = EXCLUDED.limit_value, updated_at = now();

INSERT INTO public.plan_entitlements (plan_id, feature_key, access_level, limit_value)
SELECT id, 'ai_mentor', 'full', NULL FROM public.subscription_plans WHERE code = 'premium_3_month'
ON CONFLICT (plan_id, feature_key) DO UPDATE SET access_level = EXCLUDED.access_level, limit_value = EXCLUDED.limit_value, updated_at = now();

INSERT INTO public.plan_entitlements (plan_id, feature_key, access_level, limit_value)
SELECT id, 'roadmaps', 'full', NULL FROM public.subscription_plans WHERE code = 'premium_3_month'
ON CONFLICT (plan_id, feature_key) DO UPDATE SET access_level = EXCLUDED.access_level, limit_value = EXCLUDED.limit_value, updated_at = now();
