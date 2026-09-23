-- ============================================================================
-- Migration: 20260924_create_skillbits_foundation.sql
-- Description: Creates normalized tables, indexes, triggers, and RLS policies
--              for the SkillBits educational video foundation (Step 1).
--
-- Supported Video Provider: 'mux' (abstracted for future provider migration).
-- Status Lifecycle: 'draft', 'published', 'archived'.
-- Relationships:
--   - public.skillbit_skills: connects to existing public.skills_cache
--   - skillbit_courses: DEFERRED (No relational courses table in DB schema)
--   - skillbit_lessons: DEFERRED (No relational lessons table in DB schema)
--   - skillbit_roadmaps: DEFERRED (No relational roadmaps table in DB schema)
-- ============================================================================

-- ── 1. Create skillbits table ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.skillbits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NULL,
    topic TEXT NULL,
    difficulty TEXT NOT NULL,
    duration_seconds INTEGER NULL,
    thumbnail_url TEXT NULL,

    -- Video Provider Abstraction (Mux supported now, architecture allows replacement)
    video_provider TEXT NULL,
    video_asset_id TEXT NULL,
    playback_id TEXT NULL,

    -- Publishing & Lifecycle
    status TEXT NOT NULL DEFAULT 'draft',
    published_at TIMESTAMPTZ NULL,

    -- Ownership & Audit
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Constraints
    CONSTRAINT chk_skillbits_title_length CHECK (char_length(title) >= 1 AND char_length(title) <= 255),
    CONSTRAINT chk_skillbits_desc_length CHECK (description IS NULL OR char_length(description) <= 2000),
    CONSTRAINT chk_skillbits_topic_length CHECK (topic IS NULL OR char_length(topic) <= 100),
    CONSTRAINT chk_skillbits_difficulty CHECK (lower(difficulty) IN ('beginner', 'intermediate', 'advanced')),
    CONSTRAINT chk_skillbits_duration CHECK (duration_seconds IS NULL OR duration_seconds > 0),
    CONSTRAINT chk_skillbits_status CHECK (lower(status) IN ('draft', 'published', 'archived')),
    CONSTRAINT chk_skillbits_video_provider CHECK (video_provider IS NULL OR lower(video_provider) IN ('mux'))
);

-- ── 2. Create skillbit_skills Relationship Table ─────────────────────────────
-- Normalizes many-to-many relationship between SkillBits and existing skills_cache
CREATE TABLE IF NOT EXISTS public.skillbit_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    skillbit_id UUID NOT NULL REFERENCES public.skillbits(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES public.skills_cache(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_skillbit_skills UNIQUE (skillbit_id, skill_id)
);

-- ── 3. Deferred Relationship Tables Documentation ────────────────────────────
-- NOTE: In the current SkillsCatalyst database schema:
-- - Courses are statically defined in frontend/data (no public.courses table exists).
-- - Lessons are structured within course playlists / client data (no public.lessons table exists).
-- - Roadmaps are dynamically generated via Groq AI and tracked in roadmap_progress by string ID (no public.roadmaps entity table exists).
-- Per architectural directives, we do NOT invent redundant entity tables.
-- The following tables are documented as deferred until relational parent entities are introduced:
--   - public.skillbit_courses (deferred)
--   - public.skillbit_lessons (deferred)
--   - public.skillbit_roadmaps (deferred)

-- ── 4. Indexes for Query Performance ─────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_skillbits_status 
    ON public.skillbits(status);

CREATE INDEX IF NOT EXISTS idx_skillbits_status_published_at 
    ON public.skillbits(status, published_at DESC);

CREATE INDEX IF NOT EXISTS idx_skillbits_topic 
    ON public.skillbits(topic);

CREATE INDEX IF NOT EXISTS idx_skillbits_difficulty 
    ON public.skillbits(difficulty);

CREATE INDEX IF NOT EXISTS idx_skillbits_created_at 
    ON public.skillbits(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_skillbits_created_by 
    ON public.skillbits(created_by);

CREATE INDEX IF NOT EXISTS idx_skillbit_skills_skillbit_id 
    ON public.skillbit_skills(skillbit_id);

CREATE INDEX IF NOT EXISTS idx_skillbit_skills_skill_id 
    ON public.skillbit_skills(skill_id);

-- ── 5. Trigger for updated_at Column ──────────────────────────────────────────
DROP TRIGGER IF EXISTS trg_skillbits_updated_at ON public.skillbits;
CREATE TRIGGER trg_skillbits_updated_at
    BEFORE UPDATE ON public.skillbits
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ── 6. Enable Row Level Security (RLS) ───────────────────────────────────────
ALTER TABLE public.skillbits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skillbit_skills ENABLE ROW LEVEL SECURITY;

-- ── 7. RLS Policies: skillbits ───────────────────────────────────────────────

-- Public/Student read: ONLY published SkillBits are visible
DROP POLICY IF EXISTS "Public can view published skillbits" ON public.skillbits;
CREATE POLICY "Public can view published skillbits"
    ON public.skillbits
    FOR SELECT
    TO public
    USING (status = 'published');

-- Admin/Owner full access (create, update, publish, archive, delete)
DROP POLICY IF EXISTS "Admins can manage skillbits" ON public.skillbits;
CREATE POLICY "Admins can manage skillbits"
    ON public.skillbits
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() 
              AND profiles.role IN ('owner', 'admin', 'editor')
        )
        OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('owner', 'admin', 'editor')
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() 
              AND profiles.role IN ('owner', 'admin', 'editor')
        )
        OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('owner', 'admin', 'editor')
    );

-- Service role full access
DROP POLICY IF EXISTS "Service role full access on skillbits" ON public.skillbits;
CREATE POLICY "Service role full access on skillbits"
    ON public.skillbits
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ── 8. RLS Policies: skillbit_skills ─────────────────────────────────────────

-- Public/Student read: only skills linked to published SkillBits
DROP POLICY IF EXISTS "Public can view skills for published skillbits" ON public.skillbit_skills;
CREATE POLICY "Public can view skills for published skillbits"
    ON public.skillbit_skills
    FOR SELECT
    TO public
    USING (
        EXISTS (
            SELECT 1 FROM public.skillbits
            WHERE skillbits.id = skillbit_skills.skillbit_id 
              AND skillbits.status = 'published'
        )
    );

-- Admin/Owner management of skill associations
DROP POLICY IF EXISTS "Admins can manage skillbit_skills" ON public.skillbit_skills;
CREATE POLICY "Admins can manage skillbit_skills"
    ON public.skillbit_skills
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() 
              AND profiles.role IN ('owner', 'admin', 'editor')
        )
        OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('owner', 'admin', 'editor')
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() 
              AND profiles.role IN ('owner', 'admin', 'editor')
        )
        OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('owner', 'admin', 'editor')
    );

-- Service role full access
DROP POLICY IF EXISTS "Service role full access on skillbit_skills" ON public.skillbit_skills;
CREATE POLICY "Service role full access on skillbit_skills"
    ON public.skillbit_skills
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ── 9. Permissions / Grants ──────────────────────────────────────────────────
GRANT SELECT ON TABLE public.skillbits TO anon, authenticated;
GRANT SELECT ON TABLE public.skillbit_skills TO anon, authenticated;
GRANT ALL ON TABLE public.skillbits TO service_role;
GRANT ALL ON TABLE public.skillbit_skills TO service_role;
