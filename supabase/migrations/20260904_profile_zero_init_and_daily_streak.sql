-- ====================================================================
-- SKILLSCATALYST - PROFILE STATS ZERO INITIALIZATION & DAILY STREAK ENGINE
-- ====================================================================
-- This script:
-- 1. Adds missing columns to public.user_progress (last_login_date, total_xp, level, last_active_at).
-- 2. Resets all progress to a zero baseline (streak = 0, level = 0, total_xp = 0).
-- 3. Synchronizes problems_solved strictly to ticked questions in leetcode_progress.
-- 4. Creates the record_daily_login() RPC function for daily login streak tracking.
-- 5. Creates automatic trigger to keep user_progress.problems_solved in sync with leetcode_progress.
-- 6. Configures production-hardened RLS policies.
-- ====================================================================

-- ── 1. Ensure Table Structure & Columns ──────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_progress (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    problems_solved INTEGER NOT NULL DEFAULT 0,
    success_rate NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    streak_days INTEGER NOT NULL DEFAULT 0,
    last_login_date DATE DEFAULT NULL,
    last_active_at TIMESTAMPTZ DEFAULT NOW(),
    total_xp INTEGER NOT NULL DEFAULT 0,
    level INTEGER NOT NULL DEFAULT 0,
    learning_progress_percent NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    resume_readiness_score NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    ai_career_health_score NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.user_progress
    ADD COLUMN IF NOT EXISTS last_login_date DATE DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS total_xp INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS level INTEGER NOT NULL DEFAULT 0;

-- ── 2. Reset All Users to ZERO Baseline ──────────────────────────────
-- Reset streak, login date, XP, and level to 0 for everyone
UPDATE public.user_progress
SET streak_days = 0,
    last_login_date = NULL,
    total_xp = 0,
    level = 0,
    updated_at = NOW();

-- Synchronize problems_solved strictly based on ticked questions in leetcode_progress
UPDATE public.user_progress up
SET problems_solved = COALESCE(
    (SELECT COUNT(*) 
     FROM public.leetcode_progress lp 
     WHERE lp.user_id = up.user_id 
       AND lp.status = 'solved'), 
    0
);

-- Recalculate Level & XP from actual user achievements:
-- Questions solved: +50 XP each
-- Watched videos: +25 XP each
-- Completed roadmap topics: +50 XP each
-- Level: Floor(total_xp / 100)
UPDATE public.user_progress up
SET total_xp = (
        COALESCE((SELECT COUNT(*) FROM public.leetcode_progress lp WHERE lp.user_id = up.user_id AND lp.status = 'solved'), 0) * 50
        + COALESCE((SELECT COUNT(*) FROM public.video_progress vp WHERE vp.user_id = up.user_id AND vp.watched = TRUE), 0) * 25
        + COALESCE((SELECT COUNT(*) FROM public.roadmap_progress rp WHERE rp.user_id = up.user_id AND rp.status = 'completed' AND rp.node_id <> '_roadmap_started'), 0) * 50
    ),
    level = FLOOR(
        (
            COALESCE((SELECT COUNT(*) FROM public.leetcode_progress lp WHERE lp.user_id = up.user_id AND lp.status = 'solved'), 0) * 50
            + COALESCE((SELECT COUNT(*) FROM public.video_progress vp WHERE vp.user_id = up.user_id AND vp.watched = TRUE), 0) * 25
            + COALESCE((SELECT COUNT(*) FROM public.roadmap_progress rp WHERE rp.user_id = up.user_id AND rp.status = 'completed' AND rp.node_id <> '_roadmap_started'), 0) * 50
        ) / 100
    );

-- ── 3. Stored Procedure: Record Daily Login ───────────────────────────
CREATE OR REPLACE FUNCTION public.record_daily_login(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_streak INTEGER := 0;
    v_last_date DATE;
    v_today DATE := CURRENT_DATE;
    v_yesterday DATE := CURRENT_DATE - 1;
BEGIN
    -- Check if record exists
    SELECT streak_days, last_login_date
    INTO v_streak, v_last_date
    FROM public.user_progress
    WHERE user_id = p_user_id;

    IF NOT FOUND THEN
        -- First login ever for this user: start streak at 1
        v_streak := 1;
        INSERT INTO public.user_progress (
            user_id,
            streak_days,
            last_login_date,
            last_active_at,
            problems_solved,
            total_xp,
            level,
            updated_at
        ) VALUES (
            p_user_id,
            1,
            v_today,
            NOW(),
            0,
            0,
            0,
            NOW()
        );
    ELSE
        IF v_last_date = v_today THEN
            -- Already logged in today: maintain current streak
            v_streak := COALESCE(v_streak, 1);
            UPDATE public.user_progress
            SET last_active_at = NOW(),
                updated_at = NOW()
            WHERE user_id = p_user_id;
        ELSIF v_last_date = v_yesterday THEN
            -- Logged in yesterday: consecutive day streak increment!
            v_streak := COALESCE(v_streak, 0) + 1;
            UPDATE public.user_progress
            SET streak_days = v_streak,
                last_login_date = v_today,
                last_active_at = NOW(),
                updated_at = NOW()
            WHERE user_id = p_user_id;
        ELSE
            -- Missed one or more days: reset streak to 1
            v_streak := 1;
            UPDATE public.user_progress
            SET streak_days = 1,
                last_login_date = v_today,
                last_active_at = NOW(),
                updated_at = NOW()
            WHERE user_id = p_user_id;
        END IF;
    END IF;

    RETURN jsonb_build_object(
        'user_id', p_user_id,
        'streak_days', v_streak,
        'last_login_date', v_today
    );
END;
$$;

-- ── 4. Stored Procedure: Recalculate Level & Stats ────────────────────
CREATE OR REPLACE FUNCTION public.recalculate_user_level(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_questions INTEGER := 0;
    v_videos INTEGER := 0;
    v_roadmaps INTEGER := 0;
    v_xp INTEGER := 0;
    v_level INTEGER := 0;
BEGIN
    SELECT COUNT(*) INTO v_questions
    FROM public.leetcode_progress
    WHERE user_id = p_user_id AND status = 'solved';

    SELECT COUNT(*) INTO v_videos
    FROM public.video_progress
    WHERE user_id = p_user_id AND watched = TRUE;

    SELECT COUNT(*) INTO v_roadmaps
    FROM public.roadmap_progress
    WHERE user_id = p_user_id AND status = 'completed' AND node_id <> '_roadmap_started';

    v_xp := (v_videos * 25) + (v_questions * 50) + (v_roadmaps * 50);
    v_level := FLOOR(v_xp / 100);

    UPDATE public.user_progress
    SET problems_solved = v_questions,
        total_xp = v_xp,
        level = v_level,
        updated_at = NOW()
    WHERE user_id = p_user_id;

    RETURN jsonb_build_object(
        'user_id', p_user_id,
        'problems_solved', v_questions,
        'completed_videos', v_videos,
        'completed_roadmaps', v_roadmaps,
        'total_xp', v_xp,
        'level', v_level
    );
END;
$$;

-- ── 5. Automatic Practice Progress Trigger ────────────────────────────
CREATE OR REPLACE FUNCTION public.trg_sync_leetcode_progress_solved()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_target_user UUID;
    v_count INTEGER;
BEGIN
    IF TG_OP = 'DELETE' THEN
        v_target_user := OLD.user_id;
    ELSE
        v_target_user := NEW.user_id;
    END IF;

    IF v_target_user IS NOT NULL THEN
        SELECT COUNT(*) INTO v_count
        FROM public.leetcode_progress
        WHERE user_id = v_target_user AND status = 'solved';

        UPDATE public.user_progress
        SET problems_solved = v_count,
            updated_at = NOW()
        WHERE user_id = v_target_user;
    END IF;

    RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_leetcode_progress_solved ON public.leetcode_progress;
CREATE TRIGGER trg_leetcode_progress_solved
AFTER INSERT OR UPDATE OR DELETE ON public.leetcode_progress
FOR EACH ROW EXECUTE FUNCTION public.trg_sync_leetcode_progress_solved();

-- ── 6. Permissions & RLS Policies ────────────────────────────────────
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Strict user ownership on user_progress" ON public.user_progress;
CREATE POLICY "Strict user ownership on user_progress"
    ON public.user_progress
    FOR ALL
    TO authenticated
    USING (user_id IS NOT NULL AND auth.uid()::text = user_id::text)
    WITH CHECK (user_id IS NOT NULL AND auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Service role access on user_progress" ON public.user_progress;
CREATE POLICY "Service role access on user_progress"
    ON public.user_progress
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

GRANT EXECUTE ON FUNCTION public.record_daily_login(UUID) TO authenticated, service_role, anon;
GRANT EXECUTE ON FUNCTION public.recalculate_user_level(UUID) TO authenticated, service_role, anon;
