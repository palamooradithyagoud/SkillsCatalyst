-- ============================================================================
-- SKILLSCATALYST DATABASE MIGRATION
-- Migration: 20261026_owner_admin_permissions_and_audit.sql
-- Description: Implements owner-controlled Admin permissions and security audit logging.
--              1. Creates 'admin_permissions' table storing granular permissions for Admin users.
--              2. Creates 'admin_role_audit_logs' table tracking all role and permission changes.
--              3. Establishes RLS policies strictly preventing standard users from reading
--                 or modifying administrative permissions and audit history.
--              4. Maintains 100% backward compatibility with existing profiles and auth schema.
--
-- Preconditions:
--   1. public.profiles exists with role column ('owner', 'admin', 'student', etc.).
--   2. Owner account exists with role = 'owner'.
--
-- Verification:
--   SELECT * FROM public.admin_permissions LIMIT 1;
--   SELECT * FROM public.admin_role_audit_logs LIMIT 1;
--
-- Rollback Strategy:
--   DROP TABLE IF EXISTS public.admin_permissions CASCADE;
--   DROP TABLE IF EXISTS public.admin_role_audit_logs CASCADE;
-- ============================================================================

-- ── 1. Create admin_permissions Table ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.admin_permissions (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    permissions TEXT[] NOT NULL DEFAULT '{}',
    granted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast user permission lookup
CREATE INDEX IF NOT EXISTS idx_admin_permissions_user_id 
    ON public.admin_permissions(user_id);

-- ── 2. Create admin_role_audit_logs Table ────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.admin_role_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    target_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    action TEXT NOT NULL CHECK (action IN ('grant_admin', 'revoke_admin', 'update_permissions')),
    previous_role TEXT NOT NULL DEFAULT 'student',
    new_role TEXT NOT NULL DEFAULT 'student',
    previous_permissions TEXT[] NOT NULL DEFAULT '{}',
    new_permissions TEXT[] NOT NULL DEFAULT '{}',
    reason TEXT NULL,
    ip_address TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for audit query performance and target tracking
CREATE INDEX IF NOT EXISTS idx_admin_role_audit_logs_target_id 
    ON public.admin_role_audit_logs(target_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_admin_role_audit_logs_actor_id 
    ON public.admin_role_audit_logs(actor_id, created_at DESC);

-- ── 3. Enable Row Level Security (RLS) ───────────────────────────────────────
ALTER TABLE public.admin_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_role_audit_logs ENABLE ROW LEVEL SECURITY;

-- ── 4. RLS Policies for admin_permissions ───────────────────────────────────
-- Only authoritative Platform Owner or the user themselves may view their permissions
DROP POLICY IF EXISTS "Owner or self can view admin permissions" ON public.admin_permissions;
CREATE POLICY "Owner or self can view admin permissions"
    ON public.admin_permissions
    FOR SELECT
    TO authenticated
    USING (
        user_id = auth.uid()
        OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'owner'
        OR EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'owner'
        )
    );

-- Only verified Platform Owner can insert or modify admin permissions
DROP POLICY IF EXISTS "Owner can manage admin permissions" ON public.admin_permissions;
CREATE POLICY "Owner can manage admin permissions"
    ON public.admin_permissions
    FOR ALL
    TO authenticated
    USING (
        (auth.jwt() -> 'app_metadata' ->> 'role') = 'owner'
        OR EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'owner'
        )
    )
    WITH CHECK (
        (auth.jwt() -> 'app_metadata' ->> 'role') = 'owner'
        OR EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'owner'
        )
    );

-- ── 5. RLS Policies for admin_role_audit_logs ───────────────────────────────
-- Only verified Platform Owner can read security audit logs
DROP POLICY IF EXISTS "Owner can read admin audit logs" ON public.admin_role_audit_logs;
CREATE POLICY "Owner can read admin audit logs"
    ON public.admin_role_audit_logs
    FOR SELECT
    TO authenticated
    USING (
        (auth.jwt() -> 'app_metadata' ->> 'role') = 'owner'
        OR EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'owner'
        )
    );

-- Only service_role or Platform Owner can insert audit logs (never update or delete)
DROP POLICY IF EXISTS "Owner can insert admin audit logs" ON public.admin_role_audit_logs;
CREATE POLICY "Owner can insert admin audit logs"
    ON public.admin_role_audit_logs
    FOR INSERT
    TO authenticated
    WITH CHECK (
        (auth.jwt() -> 'app_metadata' ->> 'role') = 'owner'
        OR EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'owner'
        )
    );

-- Standard users and admins are strictly prohibited from altering or deleting audit logs
-- (No UPDATE or DELETE policies are granted).
