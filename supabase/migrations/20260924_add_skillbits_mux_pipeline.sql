-- ============================================================================
-- Migration: 20260924_add_skillbits_mux_pipeline.sql
-- Description: Adds Mux Direct Upload tracking, video processing state machine,
--              and webhook idempotency tracking for SkillBits (Step 2).
-- ============================================================================

-- ── 1. Add Mux Direct Upload & Video State columns to public.skillbits ────────
ALTER TABLE public.skillbits
    ADD COLUMN IF NOT EXISTS mux_upload_id TEXT NULL,
    ADD COLUMN IF NOT EXISTS video_status TEXT NOT NULL DEFAULT 'NOT_UPLOADED';

-- ── 2. Add Constraint for video_status ───────────────────────────────────────
ALTER TABLE public.skillbits
    DROP CONSTRAINT IF EXISTS chk_skillbits_video_status;

ALTER TABLE public.skillbits
    ADD CONSTRAINT chk_skillbits_video_status
    CHECK (video_status IN ('NOT_UPLOADED', 'UPLOADING', 'PROCESSING', 'READY', 'ERROR'));

-- ── 3. Add Indexes for Mux Ingestion & Webhook Lookup ────────────────────────
CREATE INDEX IF NOT EXISTS idx_skillbits_mux_upload_id 
    ON public.skillbits(mux_upload_id);

CREATE INDEX IF NOT EXISTS idx_skillbits_video_status 
    ON public.skillbits(video_status);

CREATE INDEX IF NOT EXISTS idx_skillbits_video_asset_id 
    ON public.skillbits(video_asset_id);

-- ── 4. Create mux_webhook_events Table for Webhook Idempotency ───────────────
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

CREATE INDEX IF NOT EXISTS idx_mux_webhook_events_event_id 
    ON public.mux_webhook_events(event_id);

CREATE INDEX IF NOT EXISTS idx_mux_webhook_events_event_type 
    ON public.mux_webhook_events(event_type);

CREATE INDEX IF NOT EXISTS idx_mux_webhook_events_skillbit_id 
    ON public.mux_webhook_events(skillbit_id);

-- ── 5. Enable Row Level Security (RLS) for mux_webhook_events ────────────────
ALTER TABLE public.mux_webhook_events ENABLE ROW LEVEL SECURITY;

-- Webhook events are internal audit logs: restricted to service_role and admins
DROP POLICY IF EXISTS "Service role full access on mux_webhook_events" ON public.mux_webhook_events;
CREATE POLICY "Service role full access on mux_webhook_events"
    ON public.mux_webhook_events
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view mux_webhook_events" ON public.mux_webhook_events;
CREATE POLICY "Admins can view mux_webhook_events"
    ON public.mux_webhook_events
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() 
              AND profiles.role IN ('owner', 'admin', 'editor')
        )
        OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('owner', 'admin', 'editor')
    );

-- ── 6. Permissions / Grants ──────────────────────────────────────────────────
GRANT SELECT ON TABLE public.mux_webhook_events TO authenticated;
GRANT ALL ON TABLE public.mux_webhook_events TO service_role;
