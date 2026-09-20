-- ====================================================================
-- SKILLSCATALYST: EVENTS & HACKATHONS CMS SCHEMA
-- Migration: 20260921_create_events_table.sql
-- ====================================================================

-- ── 1. Create events Table ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_name TEXT NOT NULL,
    conducted_by_college TEXT NOT NULL,
    event_link TEXT NOT NULL,
    registration_deadline TIMESTAMPTZ NOT NULL,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    location TEXT,
    category TEXT NOT NULL CHECK (category IN ('online', 'offline')),
    banner_url TEXT NOT NULL,
    description TEXT,
    is_hackathon BOOLEAN NOT NULL DEFAULT false,
    prize_pool TEXT,
    team_size TEXT,
    mode TEXT CHECK (mode IS NULL OR mode IN ('online', 'offline', 'hybrid')),
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    visible_from TIMESTAMPTZ,
    visible_until TIMESTAMPTZ,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT chk_events_date_order CHECK (end_date >= start_date),
    CONSTRAINT chk_events_visibility_window CHECK (visible_until IS NULL OR visible_from IS NULL OR visible_until > visible_from)
);

-- ── 2. Indexes for Performance ───────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_events_status_visibility 
    ON public.events (status, visible_from, visible_until);

CREATE INDEX IF NOT EXISTS idx_events_start_date 
    ON public.events (start_date ASC);

CREATE INDEX IF NOT EXISTS idx_events_is_hackathon 
    ON public.events (is_hackathon);

CREATE INDEX IF NOT EXISTS idx_events_created_by 
    ON public.events (created_by);

-- ── 3. Auto-update updated_at Trigger ─────────────────────────────────
CREATE OR REPLACE FUNCTION public.update_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_events_updated_at ON public.events;
CREATE TRIGGER trg_events_updated_at
    BEFORE UPDATE ON public.events
    FOR EACH ROW EXECUTE FUNCTION public.update_events_updated_at();

-- ── 4. Enable Row Level Security (RLS) ────────────────────────────────
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- ── 5. RLS Policies ───────────────────────────────────────────────────

-- Policy A: Public / Student Read Access
-- Only published events that are currently within their visibility window
DROP POLICY IF EXISTS "Public read published visible events" ON public.events;
CREATE POLICY "Public read published visible events" ON public.events
    FOR SELECT TO public
    USING (
        status = 'published'
        AND (visible_from IS NULL OR visible_from <= NOW())
        AND (visible_until IS NULL OR visible_until > NOW())
    );

-- Policy B: Platform Owner Full Management Access
-- Owners can SELECT, INSERT, UPDATE, DELETE all events
DROP POLICY IF EXISTS "Owner full management on events" ON public.events;
CREATE POLICY "Owner full management on events" ON public.events
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'owner'
        )
        OR COALESCE((auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'owner'
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'owner'
        )
        OR COALESCE((auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'owner'
    );

-- Policy C: Service Role Bypass
DROP POLICY IF EXISTS "Service role full access on events" ON public.events;
CREATE POLICY "Service role full access on events" ON public.events
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

-- ── 6. Table Grants ──────────────────────────────────────────────────
GRANT SELECT ON TABLE public.events TO anon;
GRANT SELECT ON TABLE public.events TO authenticated;
GRANT ALL ON TABLE public.events TO service_role;

-- ── 7. Supabase Storage Bucket Setup for Event Banners ─────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'event-banners',
    'event-banners',
    true,
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- Storage RLS Policies
DROP POLICY IF EXISTS "Public read event banners" ON storage.objects;
CREATE POLICY "Public read event banners" ON storage.objects
    FOR SELECT TO public
    USING (bucket_id = 'event-banners');

DROP POLICY IF EXISTS "Authenticated owner upload event banners" ON storage.objects;
CREATE POLICY "Authenticated owner upload event banners" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'event-banners'
        AND (
            EXISTS (
                SELECT 1 FROM public.profiles
                WHERE profiles.id = auth.uid() AND profiles.role = 'owner'
            )
            OR COALESCE((auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'owner'
        )
    );

DROP POLICY IF EXISTS "Service role full access on event banners" ON storage.objects;
CREATE POLICY "Service role full access on event banners" ON storage.objects
    FOR ALL TO service_role
    USING (bucket_id = 'event-banners')
    WITH CHECK (bucket_id = 'event-banners');
