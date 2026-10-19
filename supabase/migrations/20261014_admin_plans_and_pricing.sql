-- ============================================================================
-- Migration: 20261014_admin_plans_and_pricing.sql
-- Description: Enables dynamic Admin-controlled subscription plans and pricing.
--              Modernizes subscription_plans.code check constraint to support
--              standardized slugs while preserving canonical existing plans.
-- Preconditions:
--   1. subscription_plans table exists with canonical 'free', 'premium_monthly',
--      and 'premium_3_month' rows.
--   2. Existing foreign keys in user_subscriptions and payment_transactions
--      reference subscription_plans.id (UUID), preserving stable relational identity.
-- Verification:
--   Verify that existing rows satisfy the new regex constraint and that new
--   plans with valid slugs can be inserted while invalid slugs are rejected.
-- Rollback Strategy:
--   ALTER TABLE public.subscription_plans
--       DROP CONSTRAINT IF EXISTS subscription_plans_code_check;
--   ALTER TABLE public.subscription_plans
--       ADD CONSTRAINT subscription_plans_code_check
--       CHECK (code IN ('free', 'premium_monthly', 'premium_3_month'));
-- ============================================================================

-- 1. Modernize plan code check constraint
-- Replaces restrictive 3-element enum with standardized slug regex (lowercase alphanumeric + underscores, 2-50 chars)
ALTER TABLE public.subscription_plans
    DROP CONSTRAINT IF EXISTS subscription_plans_code_check;

ALTER TABLE public.subscription_plans
    ADD CONSTRAINT subscription_plans_code_check
    CHECK (code ~ '^[a-z0-9_]{2,50}$');

-- 2. Ensure RLS allows Platform Owners and Admins to manage plans
DROP POLICY IF EXISTS "Owners and Admins can manage subscription plans" ON public.subscription_plans;
CREATE POLICY "Owners and Admins can manage subscription plans"
    ON public.subscription_plans
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
