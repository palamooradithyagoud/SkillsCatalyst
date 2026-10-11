-- ====================================================================
-- MODULE 3: SKILLBITS — SHORT-FORM LEARNING & REELS (4 TABLES)
-- ====================================================================

-- 0. PREREQUISITE: SKILLS CACHE (Referenced by skillbit_skills)
CREATE TABLE IF NOT EXISTS public.skills_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    skill_name TEXT NOT NULL UNIQUE,
    roadmap_json JSONB DEFAULT '{}'::jsonb,
    playlists_json JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1. SKILLBITS (Short Video Clips & Mux Ingestion)
CREATE TABLE IF NOT EXISTS public.skillbits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NULL,
    topic TEXT NULL,
    difficulty TEXT NOT NULL DEFAULT 'beginner',
    duration_seconds INTEGER NULL,
    thumbnail_url TEXT NULL,

    -- Video Provider (Mux)
    video_provider TEXT NULL DEFAULT 'mux',
    video_asset_id TEXT NULL,
    playback_id TEXT NULL,
    mux_upload_id TEXT NULL,
    video_status TEXT NOT NULL DEFAULT 'NOT_UPLOADED',

    -- Lifecycle & Audit
    status TEXT NOT NULL DEFAULT 'draft',
    published_at TIMESTAMPTZ NULL,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT chk_skillbits_difficulty CHECK (lower(difficulty) IN ('beginner', 'intermediate', 'advanced')),
    CONSTRAINT chk_skillbits_status CHECK (lower(status) IN ('draft', 'published', 'archived')),
    CONSTRAINT chk_skillbits_video_status CHECK (video_status IN ('NOT_UPLOADED', 'UPLOADING', 'PROCESSING', 'READY', 'ERROR'))
);

CREATE INDEX IF NOT EXISTS idx_skillbits_status ON public.skillbits(status);
CREATE INDEX IF NOT EXISTS idx_skillbits_topic ON public.skillbits(topic);
CREATE INDEX IF NOT EXISTS idx_skillbits_created_by ON public.skillbits(created_by);
CREATE INDEX IF NOT EXISTS idx_skillbits_mux_upload_id ON public.skillbits(mux_upload_id);
CREATE INDEX IF NOT EXISTS idx_skillbits_video_asset_id ON public.skillbits(video_asset_id);

-- 2. SKILLBIT_SKILLS (Tags linking SkillBits to Skills)
CREATE TABLE IF NOT EXISTS public.skillbit_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    skillbit_id UUID NOT NULL REFERENCES public.skillbits(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES public.skills_cache(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_skillbit_skills UNIQUE (skillbit_id, skill_id)
);
CREATE INDEX IF NOT EXISTS idx_skillbit_skills_skillbit ON public.skillbit_skills(skillbit_id);
CREATE INDEX IF NOT EXISTS idx_skillbit_skills_skill ON public.skillbit_skills(skill_id);

-- 3. USER_SKILLBIT_PROGRESS (Watch Seconds & Completion)
CREATE TABLE IF NOT EXISTS public.user_skillbit_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    skillbit_id UUID NOT NULL REFERENCES public.skillbits(id) ON DELETE CASCADE,
    watched_seconds INTEGER NOT NULL DEFAULT 0,
    completion_percentage NUMERIC NOT NULL DEFAULT 0,
    last_position_seconds NUMERIC NOT NULL DEFAULT 0,
    started_at TIMESTAMPTZ NULL,
    last_watched_at TIMESTAMPTZ NULL,
    completed_at TIMESTAMPTZ NULL,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_user_skillbit_progress UNIQUE (user_id, skillbit_id)
);
CREATE INDEX IF NOT EXISTS idx_user_skillbit_prog_user ON public.user_skillbit_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_skillbit_prog_skillbit ON public.user_skillbit_progress(skillbit_id);

-- 4. MUX_WEBHOOK_EVENTS (Idempotency Audit for Video Processing)
CREATE TABLE IF NOT EXISTS public.mux_webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    skillbit_id UUID NULL REFERENCES public.skillbits(id) ON DELETE SET NULL,
    received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    processed_at TIMESTAMPTZ NULL,
    processing_status TEXT NOT NULL DEFAULT 'processing',
    payload_summary JSONB NULL,
    CONSTRAINT uq_mux_webhook_events_event_id UNIQUE (event_id)
);
CREATE INDEX IF NOT EXISTS idx_mux_events_event_id ON public.mux_webhook_events(event_id);

-- ── TRIGGERS ─────────────────────────────────────────────────────────
DROP TRIGGER IF EXISTS trg_skillbits_updated_at ON public.skillbits;
CREATE TRIGGER trg_skillbits_updated_at BEFORE UPDATE ON public.skillbits FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_user_skillbit_progress_updated_at ON public.user_skillbit_progress;
CREATE TRIGGER trg_user_skillbit_progress_updated_at BEFORE UPDATE ON public.user_skillbit_progress FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── ROW LEVEL SECURITY (RLS) ─────────────────────────────────────────
ALTER TABLE public.skills_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skillbits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skillbit_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skillbit_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mux_webhook_events ENABLE ROW LEVEL SECURITY;

-- skills_cache
DROP POLICY IF EXISTS "Public read skills_cache" ON public.skills_cache;
CREATE POLICY "Public read skills_cache" ON public.skills_cache FOR SELECT USING (true);
DROP POLICY IF EXISTS "Service role skills_cache" ON public.skills_cache;
CREATE POLICY "Service role skills_cache" ON public.skills_cache FOR ALL TO service_role USING (true) WITH CHECK (true);

-- skillbits
DROP POLICY IF EXISTS "Public read published skillbits" ON public.skillbits;
CREATE POLICY "Public read published skillbits" ON public.skillbits FOR SELECT USING (status = 'published');
DROP POLICY IF EXISTS "Users view own skillbits" ON public.skillbits;
CREATE POLICY "Users view own skillbits" ON public.skillbits FOR SELECT TO authenticated USING (auth.uid() = created_by);
DROP POLICY IF EXISTS "Users insert own skillbits" ON public.skillbits;
CREATE POLICY "Users insert own skillbits" ON public.skillbits FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
DROP POLICY IF EXISTS "Users update own skillbits" ON public.skillbits;
CREATE POLICY "Users update own skillbits" ON public.skillbits FOR UPDATE TO authenticated USING (auth.uid() = created_by) WITH CHECK (auth.uid() = created_by);
DROP POLICY IF EXISTS "Service role full skillbits" ON public.skillbits;
CREATE POLICY "Service role full skillbits" ON public.skillbits FOR ALL TO service_role USING (true) WITH CHECK (true);

-- skillbit_skills
DROP POLICY IF EXISTS "Public read skillbit_skills" ON public.skillbit_skills;
CREATE POLICY "Public read skillbit_skills" ON public.skillbit_skills FOR SELECT USING (true);
DROP POLICY IF EXISTS "Service role skillbit_skills" ON public.skillbit_skills;
CREATE POLICY "Service role skillbit_skills" ON public.skillbit_skills FOR ALL TO service_role USING (true) WITH CHECK (true);

-- user_skillbit_progress
DROP POLICY IF EXISTS "Users manage own skillbit progress" ON public.user_skillbit_progress;
CREATE POLICY "Users manage own skillbit progress" ON public.user_skillbit_progress FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Service role skillbit progress" ON public.user_skillbit_progress;
CREATE POLICY "Service role skillbit progress" ON public.user_skillbit_progress FOR ALL TO service_role USING (true) WITH CHECK (true);

-- mux_webhook_events
DROP POLICY IF EXISTS "Service role mux_webhook_events" ON public.mux_webhook_events;
CREATE POLICY "Service role mux_webhook_events" ON public.mux_webhook_events FOR ALL TO service_role USING (true) WITH CHECK (true);
