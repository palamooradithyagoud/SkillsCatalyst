-- ============================================================================
-- Migration: 20260921_create_tech_news_system.sql
-- Description: Creates normalized tech_news_sources and tech_news tables,
--              indexes, updated_at triggers, and RLS policies for the
--              Company-Based Instagram Stories Tech News system (48-hour lifecycle).
-- ============================================================================

-- 1. Create tech_news_sources table
CREATE TABLE IF NOT EXISTS public.tech_news_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    logo_url TEXT NOT NULL,
    website_url TEXT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Create tech_news table
CREATE TABLE IF NOT EXISTS public.tech_news (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID NOT NULL REFERENCES public.tech_news_sources(id) ON DELETE CASCADE,
    headline TEXT NOT NULL,
    summary TEXT NOT NULL,
    why_it_matters TEXT NULL,
    cover_image_url TEXT NULL,
    source_url TEXT NOT NULL,
    category TEXT NULL,
    tags TEXT[] DEFAULT '{}'::TEXT[],
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    visible_from TIMESTAMPTZ NULL,
    visible_until TIMESTAMPTZ NULL,
    published_at TIMESTAMPTZ NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_by UUID NULL REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Indexes for high-performance querying
CREATE INDEX IF NOT EXISTS idx_tech_news_sources_active_order 
    ON public.tech_news_sources(is_active, display_order ASC);

CREATE INDEX IF NOT EXISTS idx_tech_news_source_id 
    ON public.tech_news(source_id);

CREATE INDEX IF NOT EXISTS idx_tech_news_status 
    ON public.tech_news(status);

CREATE INDEX IF NOT EXISTS idx_tech_news_visibility 
    ON public.tech_news(status, visible_from, visible_until);

CREATE INDEX IF NOT EXISTS idx_tech_news_order 
    ON public.tech_news(display_order ASC, published_at DESC);

CREATE INDEX IF NOT EXISTS idx_tech_news_created_at 
    ON public.tech_news(created_at DESC);

-- 4. Auto-update updated_at timestamp triggers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_tech_news_sources_updated_at ON public.tech_news_sources;
CREATE TRIGGER trg_tech_news_sources_updated_at
    BEFORE UPDATE ON public.tech_news_sources
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_tech_news_updated_at ON public.tech_news;
CREATE TRIGGER trg_tech_news_updated_at
    BEFORE UPDATE ON public.tech_news
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.tech_news_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tech_news ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for tech_news_sources
-- Public/Student read: active sources only
DROP POLICY IF EXISTS "Public can view active tech news sources" ON public.tech_news_sources;
CREATE POLICY "Public can view active tech news sources"
    ON public.tech_news_sources
    FOR SELECT
    TO public
    USING (is_active = true);

-- Platform Owner full management on tech_news_sources
DROP POLICY IF EXISTS "Owners can manage tech news sources" ON public.tech_news_sources;
CREATE POLICY "Owners can manage tech news sources"
    ON public.tech_news_sources
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'owner'
        )
        OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'owner'
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'owner'
        )
        OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'owner'
    );

-- Service role bypass on tech_news_sources
DROP POLICY IF EXISTS "Service role full access on tech_news_sources" ON public.tech_news_sources;
CREATE POLICY "Service role full access on tech_news_sources"
    ON public.tech_news_sources
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 7. RLS Policies for tech_news
-- Public/Student read: published and within active visibility window (48h window)
DROP POLICY IF EXISTS "Public can view published active tech news" ON public.tech_news;
CREATE POLICY "Public can view published active tech news"
    ON public.tech_news
    FOR SELECT
    TO public
    USING (
        status = 'published'
        AND (visible_from IS NULL OR visible_from <= now())
        AND (visible_until IS NULL OR visible_until > now())
    );

-- Platform Owner full management on tech_news
DROP POLICY IF EXISTS "Owners can manage tech news" ON public.tech_news;
CREATE POLICY "Owners can manage tech news"
    ON public.tech_news
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'owner'
        )
        OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'owner'
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'owner'
        )
        OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'owner'
    );

-- Service role bypass on tech_news
DROP POLICY IF EXISTS "Service role full access on tech_news" ON public.tech_news;
CREATE POLICY "Service role full access on tech_news"
    ON public.tech_news
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 8. Storage Buckets & Policies
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('tech-news-logos', 'tech-news-logos', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']),
    ('tech-news-covers', 'tech-news-covers', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage Read Policy (Public)
DROP POLICY IF EXISTS "Public read access on tech news logos" ON storage.objects;
CREATE POLICY "Public read access on tech news logos"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'tech-news-logos');

DROP POLICY IF EXISTS "Public read access on tech news covers" ON storage.objects;
CREATE POLICY "Public read access on tech news covers"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'tech-news-covers');

-- Storage Owner Mutation Policies
DROP POLICY IF EXISTS "Owner upload access on tech news logos" ON storage.objects;
CREATE POLICY "Owner upload access on tech news logos"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'tech-news-logos'
        AND (
            EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'owner')
            OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'owner'
        )
    );

DROP POLICY IF EXISTS "Owner upload access on tech news covers" ON storage.objects;
CREATE POLICY "Owner upload access on tech news covers"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'tech-news-covers'
        AND (
            EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'owner')
            OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'owner'
        )
    );

DROP POLICY IF EXISTS "Owner delete access on tech news logos" ON storage.objects;
CREATE POLICY "Owner delete access on tech news logos"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'tech-news-logos'
        AND (
            EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'owner')
            OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'owner'
        )
    );

DROP POLICY IF EXISTS "Owner delete access on tech news covers" ON storage.objects;
CREATE POLICY "Owner delete access on tech news covers"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'tech-news-covers'
        AND (
            EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'owner')
            OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'owner'
        )
    );

DROP POLICY IF EXISTS "Service role full access on tech news storage" ON storage.objects;
CREATE POLICY "Service role full access on tech news storage"
    ON storage.objects FOR ALL
    TO service_role
    USING (bucket_id IN ('tech-news-logos', 'tech-news-covers'))
    WITH CHECK (bucket_id IN ('tech-news-logos', 'tech-news-covers'));
