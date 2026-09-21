-- ====================================================================
-- SKILLSCATALYST: SCHOLARSHIPS CMS SCHEMA
-- Migration: 20260921_create_scholarships_table.sql
-- ====================================================================

-- ── 1. Create scholarships Table ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.scholarships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    provided_by TEXT NOT NULL,
    qualification_required TEXT NOT NULL,
    eligibility TEXT NOT NULL,
    requirements TEXT NOT NULL,
    application_url TEXT NOT NULL,
    image_url TEXT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    visible_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    visible_until TIMESTAMPTZ,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT chk_scholarships_visibility_window CHECK (visible_until IS NULL OR visible_until > visible_from),
    CONSTRAINT chk_scholarships_name_not_empty CHECK (length(trim(name)) > 0),
    CONSTRAINT chk_scholarships_provided_by_not_empty CHECK (length(trim(provided_by)) > 0),
    CONSTRAINT chk_scholarships_qualification_not_empty CHECK (length(trim(qualification_required)) > 0),
    CONSTRAINT chk_scholarships_eligibility_not_empty CHECK (length(trim(eligibility)) > 0),
    CONSTRAINT chk_scholarships_requirements_not_empty CHECK (length(trim(requirements)) > 0),
    CONSTRAINT chk_scholarships_app_url_not_empty CHECK (length(trim(application_url)) > 0)
);

-- ── 2. Performance Indexes ───────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_scholarships_status_visibility 
    ON public.scholarships (status, visible_from, visible_until);

CREATE INDEX IF NOT EXISTS idx_scholarships_created_by 
    ON public.scholarships (created_by);

CREATE INDEX IF NOT EXISTS idx_scholarships_created_at 
    ON public.scholarships (created_at DESC);

-- ── 3. Auto-update updated_at Trigger ─────────────────────────────────
CREATE OR REPLACE FUNCTION public.update_scholarships_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_scholarships_updated_at ON public.scholarships;
CREATE TRIGGER trg_scholarships_updated_at
    BEFORE UPDATE ON public.scholarships
    FOR EACH ROW EXECUTE FUNCTION public.update_scholarships_updated_at();

-- ── 4. Enable Row Level Security (RLS) ────────────────────────────────
ALTER TABLE public.scholarships ENABLE ROW LEVEL SECURITY;

-- ── 5. RLS Policies ───────────────────────────────────────────────────

-- Policy A: Public / Student Read Access
-- Only published scholarships that are currently within their visibility window
DROP POLICY IF EXISTS "Public read published visible scholarships" ON public.scholarships;
CREATE POLICY "Public read published visible scholarships" ON public.scholarships
    FOR SELECT TO public
    USING (
        status = 'published'
        AND (visible_from IS NULL OR visible_from <= NOW())
        AND (visible_until IS NULL OR visible_until > NOW())
    );

-- Policy B: Platform Owner Full Management Access
-- Owners can SELECT, INSERT, UPDATE, DELETE all scholarships
DROP POLICY IF EXISTS "Owner full management on scholarships" ON public.scholarships;
CREATE POLICY "Owner full management on scholarships" ON public.scholarships
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
DROP POLICY IF EXISTS "Service role full access on scholarships" ON public.scholarships;
CREATE POLICY "Service role full access on scholarships" ON public.scholarships
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

-- ── 6. Table Grants ──────────────────────────────────────────────────
GRANT SELECT ON TABLE public.scholarships TO anon;
GRANT SELECT ON TABLE public.scholarships TO authenticated;
GRANT ALL ON TABLE public.scholarships TO service_role;

-- ── 7. Supabase Storage Bucket Setup for Scholarship Banners ─────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'scholarship-banners',
    'scholarship-banners',
    true,
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- Storage RLS Policies
DROP POLICY IF EXISTS "Public read scholarship banners" ON storage.objects;
CREATE POLICY "Public read scholarship banners" ON storage.objects
    FOR SELECT TO public
    USING (bucket_id = 'scholarship-banners');

DROP POLICY IF EXISTS "Authenticated owner upload scholarship banners" ON storage.objects;
CREATE POLICY "Authenticated owner upload scholarship banners" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'scholarship-banners'
        AND (
            EXISTS (
                SELECT 1 FROM public.profiles
                WHERE profiles.id = auth.uid() AND profiles.role = 'owner'
            )
            OR COALESCE((auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'owner'
        )
    );

DROP POLICY IF EXISTS "Service role full access on scholarship banners" ON storage.objects;
CREATE POLICY "Service role full access on scholarship banners" ON storage.objects
    FOR ALL TO service_role
    USING (bucket_id = 'scholarship-banners')
    WITH CHECK (bucket_id = 'scholarship-banners');
