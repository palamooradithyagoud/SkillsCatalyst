-- ====================================================================
-- MODULE 13: TECH NEWS, OPPORTUNITIES & DEVPULSE (5 TABLES + BUCKETS)
-- ====================================================================

-- 1. TECH NEWS SOURCES
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

-- 2. TECH NEWS (Instagram Stories style short tech updates)
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

-- 3. SCHOLARSHIPS (Student Grants & Eligibility)
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
    visible_from TIMESTAMPTZ NOT NULL DEFAULT now(),
    visible_until TIMESTAMPTZ,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. EVENTS & HACKATHONS
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_name TEXT NOT NULL,
    conducted_by_college TEXT NOT NULL,
    event_link TEXT NOT NULL,
    registration_deadline TIMESTAMPTZ,
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
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. DEVPULSE STORIES (Trending Developer Articles & GitHub Highlights)
CREATE TABLE IF NOT EXISTS public.devpulse_stories (
    id BIGINT PRIMARY KEY,
    external_story_id BIGINT NOT NULL,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    author VARCHAR(255) NOT NULL,
    score INTEGER DEFAULT 0 NOT NULL,
    comments INTEGER DEFAULT 0 NOT NULL,
    category VARCHAR(100) DEFAULT 'AI & ML' NOT NULL,
    section VARCHAR(100) DEFAULT 'ai_breakthroughs' NOT NULL,
    tech_tags TEXT[],
    domain VARCHAR(255) NOT NULL,
    entity_tag VARCHAR(255),
    published_at TIMESTAMPTZ NOT NULL,
    source VARCHAR(100) DEFAULT 'hackernews' NOT NULL,
    trending_score INTEGER DEFAULT 0 NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ── STORAGE BUCKETS ──────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('tech-news-logos', 'tech-news-logos', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']),
    ('scholarship-banners', 'scholarship-banners', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
    ('event-banners', 'event-banners', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET public = true;

-- Triggers
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN SELECT unnest(ARRAY['tech_news_sources', 'tech_news', 'scholarships', 'events', 'devpulse_stories'])
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS trg_set_updated_at_%I ON public.%I;', t, t);
        EXECUTE format('CREATE TRIGGER trg_set_updated_at_%I BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();', t, t);
    END LOOP;
END;
$$;

-- RLS
ALTER TABLE public.tech_news_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tech_news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scholarships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devpulse_stories ENABLE ROW LEVEL SECURITY;

-- Public Read for Published Content
DROP POLICY IF EXISTS "Public read tech news sources" ON public.tech_news_sources;
CREATE POLICY "Public read tech news sources" ON public.tech_news_sources FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public read published tech news" ON public.tech_news;
CREATE POLICY "Public read published tech news" ON public.tech_news FOR SELECT USING (status = 'published');

DROP POLICY IF EXISTS "Public read published scholarships" ON public.scholarships;
CREATE POLICY "Public read published scholarships" ON public.scholarships FOR SELECT USING (status = 'published');

DROP POLICY IF EXISTS "Public read published events" ON public.events;
CREATE POLICY "Public read published events" ON public.events FOR SELECT USING (status = 'published');

DROP POLICY IF EXISTS "Public read devpulse stories" ON public.devpulse_stories;
CREATE POLICY "Public read devpulse stories" ON public.devpulse_stories FOR SELECT USING (is_active = true);

-- Service Role Full Access
DO $$
DECLARE
    tbl text;
BEGIN
    FOR tbl IN SELECT unnest(ARRAY['tech_news_sources', 'tech_news', 'scholarships', 'events', 'devpulse_stories'])
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Service role full %I" ON public.%I;', tbl, tbl);
        EXECUTE format('CREATE POLICY "Service role full %I" ON public.%I FOR ALL TO service_role USING (true) WITH CHECK (true);', tbl, tbl);
    END LOOP;
END;
$$;
