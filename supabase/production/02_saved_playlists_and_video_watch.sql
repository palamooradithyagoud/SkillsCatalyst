-- ====================================================================
-- MODULE 2: SAVED PLAYLISTS & VIDEO WATCH PROGRESS (2 TABLES)
-- ====================================================================

-- 1. SAVED PLAYLISTS (YouTube Playlists Bookmarked by Users)
CREATE TABLE IF NOT EXISTS public.saved_playlists (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    playlist_id TEXT NOT NULL,
    title TEXT NOT NULL,
    channel TEXT,
    description TEXT,
    level TEXT,
    video_count TEXT,
    duration TEXT,
    playlist_url TEXT,
    thumbnail TEXT,
    source TEXT DEFAULT 'youtube',
    skill_query TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_user_playlist UNIQUE(playlist_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_saved_playlists_user ON public.saved_playlists(user_id);

-- 2. VIDEO WATCH PROGRESS (Seconds Watched & Completion Status)
CREATE TABLE IF NOT EXISTS public.video_progress (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    playlist_id TEXT NOT NULL,
    video_id TEXT NOT NULL,
    watched BOOLEAN DEFAULT FALSE,
    last_position INTEGER DEFAULT 0,
    watch_time INTEGER DEFAULT 0,
    completed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_user_playlist_video UNIQUE(user_id, playlist_id, video_id)
);
CREATE INDEX IF NOT EXISTS idx_video_progress_user ON public.video_progress(user_id);

-- ── TRIGGER ──────────────────────────────────────────────────────────
DROP TRIGGER IF EXISTS trg_set_updated_at_video_progress ON public.video_progress;
CREATE TRIGGER trg_set_updated_at_video_progress
    BEFORE UPDATE ON public.video_progress
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── ROW LEVEL SECURITY (RLS) ─────────────────────────────────────────
ALTER TABLE public.saved_playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_progress ENABLE ROW LEVEL SECURITY;

-- saved_playlists policies
DROP POLICY IF EXISTS "Service role access on saved_playlists" ON public.saved_playlists;
CREATE POLICY "Service role access on saved_playlists" ON public.saved_playlists FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Strict user ownership on saved_playlists" ON public.saved_playlists;
CREATE POLICY "Strict user ownership on saved_playlists" ON public.saved_playlists FOR ALL TO authenticated 
    USING (auth.uid() = user_id) 
    WITH CHECK (auth.uid() = user_id);

-- video_progress policies
DROP POLICY IF EXISTS "Service role access on video_progress" ON public.video_progress;
CREATE POLICY "Service role access on video_progress" ON public.video_progress FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Strict user ownership on video_progress" ON public.video_progress;
CREATE POLICY "Strict user ownership on video_progress" ON public.video_progress FOR ALL TO authenticated 
    USING (auth.uid() = user_id) 
    WITH CHECK (auth.uid() = user_id);
