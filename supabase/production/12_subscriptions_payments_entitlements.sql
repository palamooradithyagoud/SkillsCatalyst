-- ====================================================================
-- MODULE 12: SUBSCRIPTIONS, PAYMENTS & ENTITLEMENTS (5 TABLES)
-- ====================================================================

-- 1. SUBSCRIPTION PLANS (Pricing Tiers)
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

-- 2. PLAN ENTITLEMENTS (Feature Flags & Quotas)
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

-- 3. USER SUBSCRIPTIONS (Active User Plan Status)
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

-- 4. PAYMENT TRANSACTIONS (Order & Gateway Ledger)
CREATE TABLE IF NOT EXISTS public.payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES public.subscription_plans(id) ON DELETE RESTRICT,
    subscription_id UUID NULL REFERENCES public.user_subscriptions(id) ON DELETE SET NULL,
    provider TEXT NOT NULL DEFAULT 'phonepe',
    merchant_order_id TEXT NOT NULL UNIQUE,
    provider_order_id TEXT NULL,
    provider_payment_id TEXT NULL,
    amount_in_paise INTEGER NOT NULL CHECK (amount_in_paise >= 0),
    currency TEXT NOT NULL DEFAULT 'INR',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('created', 'pending', 'success', 'failed', 'cancelled')),
    failure_code TEXT NULL,
    failure_message TEXT NULL,
    provider_response JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. SUBSCRIPTION EVENTS (Immutable Event Audit Log)
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

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_sub_plans_code ON public.subscription_plans(code);
CREATE INDEX IF NOT EXISTS idx_plan_entitlements_lookup ON public.plan_entitlements(plan_id, feature_key);
CREATE INDEX IF NOT EXISTS idx_user_subs_user ON public.user_subscriptions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_payment_tx_user ON public.payment_transactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payment_tx_order ON public.payment_transactions(merchant_order_id);
CREATE INDEX IF NOT EXISTS idx_sub_events_user ON public.subscription_events(user_id, created_at DESC);

-- Triggers
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN SELECT unnest(ARRAY['subscription_plans', 'plan_entitlements', 'user_subscriptions', 'payment_transactions'])
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS trg_set_updated_at_%I ON public.%I;', t, t);
        EXECUTE format('CREATE TRIGGER trg_set_updated_at_%I BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();', t, t);
    END LOOP;
END;
$$;

-- Enable RLS
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_events ENABLE ROW LEVEL SECURITY;

-- Catalog Policies (Public Read)
DROP POLICY IF EXISTS "Public read subscription plans" ON public.subscription_plans;
CREATE POLICY "Public read subscription plans" ON public.subscription_plans FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public read plan entitlements" ON public.plan_entitlements;
CREATE POLICY "Public read plan entitlements" ON public.plan_entitlements FOR SELECT USING (true);

-- User-Scoped Policies
DROP POLICY IF EXISTS "Users view own subscriptions" ON public.user_subscriptions;
CREATE POLICY "Users view own subscriptions" ON public.user_subscriptions FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users view own payment transactions" ON public.payment_transactions;
CREATE POLICY "Users view own payment transactions" ON public.payment_transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users view own subscription events" ON public.subscription_events;
CREATE POLICY "Users view own subscription events" ON public.subscription_events FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Service Role Full Access
DO $$
DECLARE
    tbl text;
BEGIN
    FOR tbl IN SELECT unnest(ARRAY['subscription_plans', 'plan_entitlements', 'user_subscriptions', 'payment_transactions', 'subscription_events'])
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Service role full %I" ON public.%I;', tbl, tbl);
        EXECUTE format('CREATE POLICY "Service role full %I" ON public.%I FOR ALL TO service_role USING (true) WITH CHECK (true);', tbl, tbl);
    END LOOP;
END;
$$;
