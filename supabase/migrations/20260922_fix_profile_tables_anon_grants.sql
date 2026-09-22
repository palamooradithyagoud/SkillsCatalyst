-- ====================================================================
-- SKILLSCATALYST - HARDENED PRODUCTION FIX FOR POSTGRESQL 42501 ON PROFILE TABLES
-- ====================================================================
-- Root Cause:
-- Migration 20260914_upgrade_user_profile_system.sql executed:
--   'REVOKE ALL ON public.<table_name> FROM anon;'
-- on user_skills, experiences, education, projects, certifications, achievements,
-- and career_preferences.
--
-- In Supabase PostgREST, requests by unauthenticated visitors, guest sessions, or
-- users whose JWT is expired/refreshing connect as PostgreSQL role 'anon'.
-- In PostgreSQL, table-level DAC privileges are checked BEFORE Row-Level Security
-- (RLS). Stripping table-level SELECT from 'anon' causes immediate query abortion with:
--   ERROR 42501: permission denied for table <table_name>
--
-- Solution & Security Architecture:
-- 1. Table-level DAC permissions for 'anon' are granted as SELECT ONLY.
--    'anon' has ZERO INSERT, UPDATE, or DELETE permissions on user tables (Principle of Least Privilege).
-- 2. 'authenticated' and 'service_role' receive full CRUD permissions.
-- 3. Row Level Security (RLS) remains enabled and strictly enforced:
--    User tables require 'auth.uid() = user_id'.
--    Because auth.uid() is NULL for anon callers, SELECT queries by anon cleanly
--    return 0 rows (HTTP 200 OK: []) without throwing 42501 or leaking data.
-- 4. Commercial metadata tables (subscription_plans, plan_entitlements, events,
--    scholarships, tech_news) receive public read access.
-- ====================================================================

-- ── 1. GRANT TABLE-LEVEL READ ACCESS TO ANON ON NORMALIZED PROFILE TABLES ───
GRANT SELECT ON public.user_skills TO anon;
GRANT SELECT ON public.experiences TO anon;
GRANT SELECT ON public.education TO anon;
GRANT SELECT ON public.projects TO anon;
GRANT SELECT ON public.certifications TO anon;
GRANT SELECT ON public.achievements TO anon;
GRANT SELECT ON public.career_preferences TO anon;

-- Ensure authenticated and service_role retain full CRUD privileges
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_skills TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.experiences TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.education TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.certifications TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.achievements TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.career_preferences TO authenticated, service_role;

-- ── 2. GRANT PERMISSIONS ON SUBSCRIPTION & PAYMENT TABLES ───────────────────
-- Metadata tables (Public read access)
GRANT SELECT ON public.subscription_plans TO anon, authenticated;
GRANT SELECT ON public.plan_entitlements TO anon, authenticated;

-- User-specific transactional tables (Protected by RLS auth.uid() = user_id)
GRANT SELECT ON public.user_subscriptions TO anon, authenticated;
GRANT SELECT ON public.subscription_events TO anon, authenticated;
GRANT SELECT ON public.payment_transactions TO anon, authenticated;

-- Service role full administrative access
GRANT ALL ON public.subscription_plans TO service_role;
GRANT ALL ON public.plan_entitlements TO service_role;
GRANT ALL ON public.user_subscriptions TO service_role;
GRANT ALL ON public.subscription_events TO service_role;
GRANT ALL ON public.payment_transactions TO service_role;

-- ── 3. GRANT PERMISSIONS ON DISCOVERY TABLES ────────────────────────────────
GRANT SELECT ON public.events TO anon, authenticated;
GRANT SELECT ON public.scholarships TO anon, authenticated;
GRANT SELECT ON public.tech_news TO anon, authenticated;

GRANT ALL ON public.events TO service_role;
GRANT ALL ON public.scholarships TO service_role;
GRANT ALL ON public.tech_news TO service_role;

-- ── 4. GRANT SEQUENCE USAGES ────────────────────────────────────────────────
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
