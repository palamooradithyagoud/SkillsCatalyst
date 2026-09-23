-- ============================================================================
-- Migration: 20260924_add_skillbits_discovery_indexes.sql
-- Description: Adds performance indexes on public.skillbits for operational
--              admin management, filtering, and student discovery queries (Phase 5).
-- ============================================================================

-- ── 1. Operational & Sorting Indexes ──────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_skillbits_updated_at
    ON public.skillbits (updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_skillbits_video_status
    ON public.skillbits (video_status);

CREATE INDEX IF NOT EXISTS idx_skillbits_topic_status
    ON public.skillbits (status, topic);

CREATE INDEX IF NOT EXISTS idx_skillbits_difficulty_status
    ON public.skillbits (status, difficulty);

CREATE INDEX IF NOT EXISTS idx_skillbits_title
    ON public.skillbits (title);
