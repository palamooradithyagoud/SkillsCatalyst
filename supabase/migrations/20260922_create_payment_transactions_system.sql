-- ============================================================================
-- Migration: 20260922_create_payment_transactions_system.sql
-- Description: Creates payment_transactions ledger with canonical paise amounts,
--              unique merchant_order_id constraints, provider reference tracking,
--              updated_at triggers, and strict Row Level Security (RLS).
-- Phase:       Payments Phase 2 — PhonePe Payment Integration (Backend-First)
-- ============================================================================

-- 1. Create payment_transactions table
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

-- 2. Performance & Idempotency Indexes
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user
    ON public.payment_transactions(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_merchant_order
    ON public.payment_transactions(merchant_order_id);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_provider_order
    ON public.payment_transactions(provider_order_id);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_status
    ON public.payment_transactions(status);

-- 3. Updated_at trigger
DROP TRIGGER IF EXISTS trg_payment_transactions_updated_at ON public.payment_transactions;
CREATE TRIGGER trg_payment_transactions_updated_at
    BEFORE UPDATE ON public.payment_transactions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
-- Authenticated users can view ONLY their own payment transactions
DROP POLICY IF EXISTS "Users can view own payment transactions" ON public.payment_transactions;
CREATE POLICY "Users can view own payment transactions"
    ON public.payment_transactions
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Platform Owners can view all transactions
DROP POLICY IF EXISTS "Owners can view all payment transactions" ON public.payment_transactions;
CREATE POLICY "Owners can view all payment transactions"
    ON public.payment_transactions
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'owner')
        OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'owner'
    );

-- Service role full access (Mutations MUST be performed by server-side service role)
DROP POLICY IF EXISTS "Service role full access on payment transactions" ON public.payment_transactions;
CREATE POLICY "Service role full access on payment transactions"
    ON public.payment_transactions
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
