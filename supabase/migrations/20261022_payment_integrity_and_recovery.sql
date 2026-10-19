-- ============================================================================
-- Migration: 20261022_payment_integrity_and_recovery.sql
-- Description: Hardens database-level payment lifecycle, subscription provisioning,
--              coupon redemption caps, and atomic recovery idempotency.
-- Phase:       Phase 5 — Payment Integrity & Failure Recovery
--
-- Preconditions:
--   1. public.payment_transactions exists with (merchant_order_id, status, subscription_id).
--   2. public.subscription_plans exists.
--   3. public.user_subscriptions exists.
--   4. public.coupons and public.coupon_redemptions exist.
--
-- Verification:
--   - coupons.used_count cannot exceed max_uses via chk_coupons_max_uses.
--   - claim_and_provision_payment guarantees atomic single provisioning.
--   - claim_and_provision_payment guards against coupon over-allocation.
--   - Duplicate calls return already_provisioned=true without double-extending.
--
-- Rollback Strategy:
--   ALTER TABLE public.coupons DROP CONSTRAINT IF EXISTS chk_coupons_max_uses;
-- ============================================================================

-- 1. Ensure coupons table enforces hard limit against usage count overages
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_coupons_max_uses'
    ) THEN
        ALTER TABLE public.coupons
            ADD CONSTRAINT chk_coupons_max_uses
            CHECK (max_uses IS NULL OR used_count <= max_uses);
    END IF;
END $$;

-- 2. Durable Atomic Payment Claim & Subscription Provisioning RPC (Phase 5 Hardened)
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
        COALESCE(v_tx.provider, 'phonepe'),
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
                -- Only record redemption if under global usage cap
                IF v_coupon.max_uses IS NULL OR v_coupon.used_count < v_coupon.max_uses THEN
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

-- 3. Restrict execution privileges: service_role exclusively
REVOKE ALL ON FUNCTION public.claim_and_provision_payment(TEXT, TEXT, JSONB) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.claim_and_provision_payment(TEXT, TEXT, JSONB) FROM anon;
REVOKE ALL ON FUNCTION public.claim_and_provision_payment(TEXT, TEXT, JSONB) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.claim_and_provision_payment(TEXT, TEXT, JSONB) TO service_role;
