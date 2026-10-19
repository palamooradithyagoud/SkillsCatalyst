-- ============================================================================
-- Migration: 20261021_admin_coupons_and_promotions.sql
-- Description: Introduces secure Admin-controlled coupons, promotional discount
--              rules, coupon redemption tracking, payment transaction linking,
--              and atomic coupon redemption during payment claim and provisioning.
-- Phase:       Phase 4 — Admin-Controlled Coupons & Promotional Campaigns
--
-- Preconditions:
--   1. public.payment_transactions exists with (merchant_order_id, status, subscription_id).
--   2. public.subscription_plans exists.
--   3. public.user_subscriptions exists.
--
-- Verification:
--   - Coupons can be created with percentage or fixed_amount discount types.
--   - Strict bounds: discount_value > 0, percentage <= 100, no negative amounts.
--   - Redemptions link 1-to-1 with payment transactions (unique constraint).
--   - claim_and_provision_payment safely redeems coupon in the same transaction.
--
-- Rollback Strategy:
--   DROP TABLE IF EXISTS public.coupon_redemptions;
--   ALTER TABLE public.payment_transactions DROP COLUMN IF EXISTS coupon_id;
--   ALTER TABLE public.payment_transactions DROP COLUMN IF EXISTS discount_in_paise;
--   ALTER TABLE public.payment_transactions DROP COLUMN IF EXISTS original_amount_in_paise;
--   DROP TABLE IF EXISTS public.coupons;
-- ============================================================================

-- 1. Create coupons table
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE CHECK (code ~ '^[A-Za-z0-9_-]{2,50}$'),
    description TEXT NULL,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
    discount_value INTEGER NOT NULL CHECK (discount_value > 0),
    max_discount_in_paise INTEGER NULL CHECK (max_discount_in_paise IS NULL OR max_discount_in_paise > 0),
    min_order_in_paise INTEGER NOT NULL DEFAULT 0 CHECK (min_order_in_paise >= 0),
    start_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ NULL CHECK (expires_at IS NULL OR expires_at > start_at),
    max_uses INTEGER NULL CHECK (max_uses IS NULL OR max_uses > 0),
    max_uses_per_user INTEGER NOT NULL DEFAULT 1 CHECK (max_uses_per_user > 0),
    used_count INTEGER NOT NULL DEFAULT 0 CHECK (used_count >= 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    eligible_plan_codes TEXT[] NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_percentage_discount CHECK (
        discount_type <> 'percentage' OR (discount_value >= 1 AND discount_value <= 100)
    )
);

-- Case-insensitive unique code index
CREATE UNIQUE INDEX IF NOT EXISTS idx_coupons_code_upper
    ON public.coupons(UPPER(code));

CREATE INDEX IF NOT EXISTS idx_coupons_active_window
    ON public.coupons(is_active, start_at, expires_at);

-- Updated_at trigger for coupons
DROP TRIGGER IF EXISTS trg_coupons_updated_at ON public.coupons;
CREATE TRIGGER trg_coupons_updated_at
    BEFORE UPDATE ON public.coupons
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Alter payment_transactions to track applied coupon details
ALTER TABLE public.payment_transactions
    ADD COLUMN IF NOT EXISTS coupon_id UUID NULL REFERENCES public.coupons(id) ON DELETE SET NULL;

ALTER TABLE public.payment_transactions
    ADD COLUMN IF NOT EXISTS discount_in_paise INTEGER NOT NULL DEFAULT 0 CHECK (discount_in_paise >= 0);

ALTER TABLE public.payment_transactions
    ADD COLUMN IF NOT EXISTS original_amount_in_paise INTEGER NULL CHECK (original_amount_in_paise IS NULL OR original_amount_in_paise >= 0);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_coupon
    ON public.payment_transactions(coupon_id)
    WHERE coupon_id IS NOT NULL;

-- 3. Create coupon_redemptions ledger
CREATE TABLE IF NOT EXISTS public.coupon_redemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE RESTRICT,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    payment_transaction_id UUID NOT NULL REFERENCES public.payment_transactions(id) ON DELETE RESTRICT,
    discount_in_paise INTEGER NOT NULL CHECK (discount_in_paise >= 0),
    original_amount_in_paise INTEGER NOT NULL CHECK (original_amount_in_paise >= 0),
    final_amount_in_paise INTEGER NOT NULL CHECK (final_amount_in_paise >= 0),
    redeemed_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    CONSTRAINT uq_coupon_redemption_tx UNIQUE (coupon_id, payment_transaction_id)
);

CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_user_coupon
    ON public.coupon_redemptions(coupon_id, user_id);

CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_tx
    ON public.coupon_redemptions(payment_transaction_id);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_redemptions ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for coupons
-- Admins and Owners full access
DROP POLICY IF EXISTS "Owners and Admins can manage coupons" ON public.coupons;
CREATE POLICY "Owners and Admins can manage coupons"
    ON public.coupons
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('owner', 'admin')
        )
        OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('owner', 'admin')
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('owner', 'admin')
        )
        OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('owner', 'admin')
    );

-- Authenticated students can view active, valid coupons (for validation)
DROP POLICY IF EXISTS "Students can view active coupons" ON public.coupons;
CREATE POLICY "Students can view active coupons"
    ON public.coupons
    FOR SELECT
    TO authenticated
    USING (is_active = true);

-- Service role full access
DROP POLICY IF EXISTS "Service role full access on coupons" ON public.coupons;
CREATE POLICY "Service role full access on coupons"
    ON public.coupons
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 6. RLS Policies for coupon_redemptions
-- Admins and Owners can view all redemptions
DROP POLICY IF EXISTS "Owners and Admins can view all coupon redemptions" ON public.coupon_redemptions;
CREATE POLICY "Owners and Admins can view all coupon redemptions"
    ON public.coupon_redemptions
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('owner', 'admin')
        )
        OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('owner', 'admin')
    );

-- Authenticated students can view ONLY their own redemptions
DROP POLICY IF EXISTS "Students can view own coupon redemptions" ON public.coupon_redemptions;
CREATE POLICY "Students can view own coupon redemptions"
    ON public.coupon_redemptions
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Service role full access on coupon_redemptions (Mutations performed exclusively by backend service)
DROP POLICY IF EXISTS "Service role full access on coupon redemptions" ON public.coupon_redemptions;
CREATE POLICY "Service role full access on coupon redemptions"
    ON public.coupon_redemptions
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 7. Durable Atomic Payment Claim & Subscription Provisioning RPC (Updated with Coupon Redemption)
CREATE OR REPLACE FUNCTION public.claim_and_provision_payment(
    p_merchant_order_id TEXT,
    p_provider_order_id TEXT,
    p_provider_response JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_tx RECORD;
    v_plan RECORD;
    v_sub RECORD;
    v_coupon RECORD;
    v_existing_event RECORD;
    v_now TIMESTAMPTZ := clock_timestamp();
    v_started_at TIMESTAMPTZ;
    v_expires_at TIMESTAMPTZ;
    v_duration_days INT;
    v_sub_id UUID;
    v_is_extension BOOLEAN := false;
BEGIN
    -- 1. Lock the payment_transaction row exclusively to eliminate concurrent race conditions
    SELECT * INTO v_tx
    FROM public.payment_transactions
    WHERE merchant_order_id = p_merchant_order_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'TRANSACTION_NOT_FOUND',
            'message', 'Transaction does not exist'
        );
    END IF;

    -- 2. Idempotency Check: Already fully processed AND provisioned
    IF v_tx.status = 'success' AND v_tx.subscription_id IS NOT NULL THEN
        RETURN jsonb_build_object(
            'success', true,
            'claimed', false,
            'already_provisioned', true,
            'status', 'success',
            'subscription_id', v_tx.subscription_id,
            'message', 'Payment already processed and provisioned.'
        );
    END IF;

    -- 3. Reject terminal failure states
    IF v_tx.status IN ('failed', 'cancelled') THEN
        RETURN jsonb_build_object(
            'success', false,
            'claimed', false,
            'status', v_tx.status,
            'error', 'TERMINAL_STATE',
            'message', 'Payment is in a terminal failure state.'
        );
    END IF;

    -- 4. Lookup plan details
    SELECT * INTO v_plan
    FROM public.subscription_plans
    WHERE id = v_tx.plan_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'PLAN_NOT_FOUND',
            'message', 'Associated plan not found.'
        );
    END IF;

    v_duration_days := COALESCE(v_plan.duration_days, 30);

    -- 5. Deduplication against provider_event_id:
    -- If this provider event was already recorded, re-link subscription without double-extending
    IF p_provider_order_id IS NOT NULL AND p_provider_order_id <> '' THEN
        SELECT * INTO v_existing_event
        FROM public.subscription_events
        WHERE provider_event_id = p_provider_order_id
        LIMIT 1;

        IF FOUND THEN
            v_sub_id := v_existing_event.subscription_id;

            UPDATE public.payment_transactions
            SET
                status = 'success',
                subscription_id = v_sub_id,
                provider_order_id = COALESCE(p_provider_order_id, provider_order_id),
                provider_response = COALESCE(p_provider_response, provider_response),
                updated_at = v_now
            WHERE id = v_tx.id;

            RETURN jsonb_build_object(
                'success', true,
                'claimed', true,
                'already_provisioned', true,
                'status', 'success',
                'subscription_id', v_sub_id,
                'message', 'Re-linked subscription from existing provider event without duplicate extension.'
            );
        END IF;
    END IF;

    -- 6. Lock and resolve user's current subscription record
    SELECT * INTO v_sub
    FROM public.user_subscriptions
    WHERE user_id = v_tx.user_id
    ORDER BY created_at DESC
    LIMIT 1
    FOR UPDATE;

    IF FOUND AND v_sub.status = 'active' AND v_sub.expires_at IS NOT NULL AND v_sub.expires_at > v_now THEN
        -- Active paid period exists: extend from existing expires_at
        v_started_at := v_sub.started_at;
        v_expires_at := v_sub.expires_at + (v_duration_days || ' days')::INTERVAL;
        v_is_extension := true;
        v_sub_id := v_sub.id;

        UPDATE public.user_subscriptions
        SET
            plan_id = v_tx.plan_id,
            status = 'active',
            started_at = v_started_at,
            expires_at = v_expires_at,
            cancelled_at = NULL,
            updated_at = v_now
        WHERE id = v_sub_id;
    ELSE
        -- No active subscription or expired: fresh period starting from now
        v_started_at := v_now;
        v_expires_at := v_now + (v_duration_days || ' days')::INTERVAL;
        v_is_extension := false;

        IF FOUND THEN
            v_sub_id := v_sub.id;
            UPDATE public.user_subscriptions
            SET
                plan_id = v_tx.plan_id,
                status = 'active',
                started_at = v_started_at,
                expires_at = v_expires_at,
                cancelled_at = NULL,
                updated_at = v_now
            WHERE id = v_sub_id;
        ELSE
            INSERT INTO public.user_subscriptions (
                user_id, plan_id, status, started_at, expires_at, cancelled_at, created_at, updated_at
            ) VALUES (
                v_tx.user_id, v_tx.plan_id, 'active', v_started_at, v_expires_at, NULL, v_now, v_now
            ) RETURNING id INTO v_sub_id;
        END IF;
    END IF;

    -- 7. Record immutable audit event in subscription_events
    INSERT INTO public.subscription_events (
        user_id,
        subscription_id,
        event_type,
        provider,
        provider_event_id,
        metadata,
        created_at
    ) VALUES (
        v_tx.user_id,
        v_sub_id,
        CASE WHEN v_is_extension THEN 'subscription_updated' ELSE 'subscription_activated' END,
        'phonepe',
        p_provider_order_id,
        jsonb_build_object(
            'plan_id', v_tx.plan_id,
            'duration_days', v_duration_days,
            'is_extension', v_is_extension,
            'merchant_order_id', p_merchant_order_id,
            'expires_at', v_expires_at
        ),
        v_now
    );

    -- 8. Atomic Coupon Redemption (if coupon applied)
    IF v_tx.coupon_id IS NOT NULL THEN
        IF NOT EXISTS (
            SELECT 1 FROM public.coupon_redemptions
            WHERE coupon_id = v_tx.coupon_id AND payment_transaction_id = v_tx.id
        ) THEN
            SELECT * INTO v_coupon
            FROM public.coupons
            WHERE id = v_tx.coupon_id
            FOR UPDATE;

            IF FOUND THEN
                INSERT INTO public.coupon_redemptions (
                    coupon_id,
                    user_id,
                    payment_transaction_id,
                    discount_in_paise,
                    original_amount_in_paise,
                    final_amount_in_paise,
                    redeemed_at
                ) VALUES (
                    v_tx.coupon_id,
                    v_tx.user_id,
                    v_tx.id,
                    COALESCE(v_tx.discount_in_paise, 0),
                    COALESCE(v_tx.original_amount_in_paise, v_tx.amount_in_paise),
                    v_tx.amount_in_paise,
                    v_now
                );

                UPDATE public.coupons
                SET used_count = used_count + 1,
                    updated_at = v_now
                WHERE id = v_tx.coupon_id;
            END IF;
        END IF;
    END IF;

    -- 9. Finalize payment_transactions row atomically
    UPDATE public.payment_transactions
    SET
        status = 'success',
        subscription_id = v_sub_id,
        provider_order_id = COALESCE(p_provider_order_id, provider_order_id),
        provider_response = COALESCE(p_provider_response, provider_response),
        updated_at = v_now
    WHERE id = v_tx.id;

    RETURN jsonb_build_object(
        'success', true,
        'claimed', true,
        'already_provisioned', false,
        'status', 'success',
        'subscription_id', v_sub_id,
        'is_extension', v_is_extension,
        'expires_at', v_expires_at,
        'message', 'Payment claimed, subscription provisioned, and coupon redeemed atomically.'
    );
END;
$$;

-- Revoke and grant execute privileges
REVOKE ALL ON FUNCTION public.claim_and_provision_payment(TEXT, TEXT, JSONB) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.claim_and_provision_payment(TEXT, TEXT, JSONB) FROM anon;
REVOKE ALL ON FUNCTION public.claim_and_provision_payment(TEXT, TEXT, JSONB) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.claim_and_provision_payment(TEXT, TEXT, JSONB) TO service_role;
