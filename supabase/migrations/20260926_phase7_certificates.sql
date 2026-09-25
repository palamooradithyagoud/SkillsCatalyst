-- ============================================================================
-- Migration: 20260926_phase7_certificates.sql
-- Description: Phase 7 — Course Completion, Course-Specific Certificates,
--              Permanent Identity Lock, Immutable Snapshots, and Public Verification.
-- ============================================================================

-- ── 1. Ensure college column on public.profiles ─────────────────────────────
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS college TEXT DEFAULT '';

-- ── 2. Create certificate_templates Table ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.certificate_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT NULL,
    background_media_url TEXT NOT NULL,
    design_theme TEXT NOT NULL DEFAULT 'professional_blue',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 3. Create course_certificate_configs Table ──────────────────────────────
CREATE TABLE IF NOT EXISTS public.course_certificate_configs (
    course_id UUID PRIMARY KEY REFERENCES public.courses(id) ON DELETE CASCADE,
    certificate_template_id UUID NULL REFERENCES public.certificate_templates(id) ON DELETE RESTRICT,
    enabled BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 4. Create certificates Table ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    certificate_number TEXT NOT NULL UNIQUE,
    verification_id TEXT NOT NULL UNIQUE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,

    -- Immutable snapshot fields
    student_name_snapshot TEXT NOT NULL,
    college_name_snapshot TEXT NOT NULL,
    course_title_snapshot TEXT NOT NULL,
    score_snapshot INTEGER NOT NULL,
    certificate_template_id_snapshot UUID NULL,
    certificate_background_snapshot TEXT NOT NULL,
    design_theme_snapshot TEXT NOT NULL DEFAULT 'professional_blue',

    issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    status TEXT NOT NULL DEFAULT 'issued',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Constraints
    CONSTRAINT uq_certificates_user_course UNIQUE (user_id, course_id),
    CONSTRAINT chk_certificates_score CHECK (score_snapshot >= 0 AND score_snapshot <= 100),
    CONSTRAINT chk_certificates_status CHECK (status IN ('issued', 'revoked'))
);

-- ── 5. Performance Indexes ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_certificates_user_id
    ON public.certificates (user_id);

CREATE INDEX IF NOT EXISTS idx_certificates_course_id
    ON public.certificates (course_id);

CREATE INDEX IF NOT EXISTS idx_certificates_verification_id
    ON public.certificates (verification_id);

CREATE INDEX IF NOT EXISTS idx_certificates_certificate_number
    ON public.certificates (certificate_number);

CREATE INDEX IF NOT EXISTS idx_certificates_user_course
    ON public.certificates (user_id, course_id);

CREATE INDEX IF NOT EXISTS idx_course_cert_cfg_course
    ON public.course_certificate_configs (course_id);

-- ── 6. Automated updated_at Triggers ────────────────────────────────────────
DROP TRIGGER IF EXISTS trg_certificate_templates_updated_at ON public.certificate_templates;
CREATE TRIGGER trg_certificate_templates_updated_at
    BEFORE UPDATE ON public.certificate_templates
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_course_cert_cfg_updated_at ON public.course_certificate_configs;
CREATE TRIGGER trg_course_cert_cfg_updated_at
    BEFORE UPDATE ON public.course_certificate_configs
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_certificates_updated_at ON public.certificates;
CREATE TRIGGER trg_certificates_updated_at
    BEFORE UPDATE ON public.certificates
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ── 7. Certificate Immutability Protection Trigger ──────────────────────────
-- Blocks any UPDATE to snapshot columns on issued certificates
CREATE OR REPLACE FUNCTION public.enforce_certificate_immutability()
RETURNS TRIGGER AS $$
BEGIN
    IF (OLD.student_name_snapshot IS DISTINCT FROM NEW.student_name_snapshot OR
        OLD.college_name_snapshot IS DISTINCT FROM NEW.college_name_snapshot OR
        OLD.course_title_snapshot IS DISTINCT FROM NEW.course_title_snapshot OR
        OLD.score_snapshot IS DISTINCT FROM NEW.score_snapshot OR
        OLD.certificate_number IS DISTINCT FROM NEW.certificate_number OR
        OLD.verification_id IS DISTINCT FROM NEW.verification_id OR
        OLD.certificate_template_id_snapshot IS DISTINCT FROM NEW.certificate_template_id_snapshot OR
        OLD.certificate_background_snapshot IS DISTINCT FROM NEW.certificate_background_snapshot OR
        OLD.design_theme_snapshot IS DISTINCT FROM NEW.design_theme_snapshot OR
        OLD.issued_at IS DISTINCT FROM NEW.issued_at OR
        OLD.user_id IS DISTINCT FROM NEW.user_id OR
        OLD.course_id IS DISTINCT FROM NEW.course_id) THEN
        RAISE EXCEPTION 'Issued certificates are immutable snapshots and cannot be modified.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_enforce_certificate_immutability ON public.certificates;
CREATE TRIGGER trg_enforce_certificate_immutability
    BEFORE UPDATE ON public.certificates
    FOR EACH ROW
    EXECUTE FUNCTION public.enforce_certificate_immutability();

-- ── 8. Permanent Identity Lock Trigger (Direct DB Bypass Protection) ────────
-- When a user has ANY issued certificate, their full_name and college in
-- public.profiles AND public.user_academic_profile become permanently locked.
CREATE OR REPLACE FUNCTION public.check_profile_identity_lock()
RETURNS TRIGGER AS $$
BEGIN
    IF (OLD.full_name IS DISTINCT FROM NEW.full_name) OR (OLD.college IS DISTINCT FROM NEW.college) THEN
        IF EXISTS (
            SELECT 1 FROM public.certificates
            WHERE user_id = NEW.id AND status = 'issued'
        ) THEN
            RAISE EXCEPTION 'Your name and college are locked because a SkillsCatalyst certificate has already been issued.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_check_profile_identity_lock ON public.profiles;
CREATE TRIGGER trg_check_profile_identity_lock
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.check_profile_identity_lock();

CREATE OR REPLACE FUNCTION public.check_academic_profile_identity_lock()
RETURNS TRIGGER AS $$
BEGIN
    IF (OLD.full_name IS DISTINCT FROM NEW.full_name) OR (OLD.college IS DISTINCT FROM NEW.college) THEN
        IF EXISTS (
            SELECT 1 FROM public.certificates
            WHERE user_id = NEW.user_id AND status = 'issued'
        ) THEN
            RAISE EXCEPTION 'Your name and college are locked because a SkillsCatalyst certificate has already been issued.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_check_academic_profile_identity_lock ON public.user_academic_profile;
CREATE TRIGGER trg_check_academic_profile_identity_lock
    BEFORE UPDATE ON public.user_academic_profile
    FOR EACH ROW
    EXECUTE FUNCTION public.check_academic_profile_identity_lock();

-- ── 9. Enable Row Level Security (RLS) ──────────────────────────────────────
ALTER TABLE public.certificate_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_certificate_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- ── 10. RLS Policies: certificate_templates ─────────────────────────────────
-- Anyone (authenticated & anon) can read active templates for previews/rendering
DROP POLICY IF EXISTS "Anyone can view active certificate templates" ON public.certificate_templates;
CREATE POLICY "Anyone can view active certificate templates"
    ON public.certificate_templates
    FOR SELECT
    TO public
    USING (is_active = true);

-- Service role has full access (Admin CMS endpoints use service_role / backend auth)
DROP POLICY IF EXISTS "Service role full access on certificate_templates" ON public.certificate_templates;
CREATE POLICY "Service role full access on certificate_templates"
    ON public.certificate_templates
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ── 11. RLS Policies: course_certificate_configs ────────────────────────────
-- Anyone can view course certificate configs
DROP POLICY IF EXISTS "Anyone can view course certificate configs" ON public.course_certificate_configs;
CREATE POLICY "Anyone can view course certificate configs"
    ON public.course_certificate_configs
    FOR SELECT
    TO public
    USING (true);

-- Service role has full access
DROP POLICY IF EXISTS "Service role full access on course_certificate_configs" ON public.course_certificate_configs;
CREATE POLICY "Service role full access on course_certificate_configs"
    ON public.course_certificate_configs
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ── 12. RLS Policies: certificates ──────────────────────────────────────────
-- Authenticated student: Read ONLY own certificates
DROP POLICY IF EXISTS "Users can read own certificates" ON public.certificates;
CREATE POLICY "Users can read own certificates"
    ON public.certificates
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Explicitly block student INSERT (issuance must be server-authoritative via service_role)
DROP POLICY IF EXISTS "Students cannot insert certificates" ON public.certificates;
CREATE POLICY "Students cannot insert certificates"
    ON public.certificates
    FOR INSERT
    TO authenticated
    WITH CHECK (false);

-- Explicitly block student UPDATE
DROP POLICY IF EXISTS "Students cannot update certificates" ON public.certificates;
CREATE POLICY "Students cannot update certificates"
    ON public.certificates
    FOR UPDATE
    TO authenticated
    USING (false)
    WITH CHECK (false);

-- Explicitly block student DELETE
DROP POLICY IF EXISTS "Students cannot delete certificates" ON public.certificates;
CREATE POLICY "Students cannot delete certificates"
    ON public.certificates
    FOR DELETE
    TO authenticated
    USING (false);

-- Service role has full access for backend issuance & maintenance
DROP POLICY IF EXISTS "Service role full access on certificates" ON public.certificates;
CREATE POLICY "Service role full access on certificates"
    ON public.certificates
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ── 13. Public Certificate Verification RPC Function ────────────────────────
-- Safely exposes ONLY non-sensitive verification data to unauthenticated public
CREATE OR REPLACE FUNCTION public.verify_certificate_public(p_verification_id TEXT)
RETURNS TABLE (
    is_valid BOOLEAN,
    certificate_number TEXT,
    verification_id TEXT,
    student_name TEXT,
    college_name TEXT,
    course_title TEXT,
    score INTEGER,
    issued_at TIMESTAMPTZ,
    status TEXT,
    certificate_background TEXT,
    design_theme TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        (c.status = 'issued') AS is_valid,
        c.certificate_number,
        c.verification_id,
        c.student_name_snapshot AS student_name,
        c.college_name_snapshot AS college_name,
        c.course_title_snapshot AS course_title,
        c.score_snapshot AS score,
        c.issued_at,
        c.status,
        c.certificate_background_snapshot AS certificate_background,
        c.design_theme_snapshot AS design_theme
    FROM public.certificates c
    WHERE c.verification_id = p_verification_id
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.verify_certificate_public(TEXT) TO anon, authenticated, service_role;

-- ── 14. Seed Default Certificate Templates ──────────────────────────────────
-- Seeds 3 course-specific designs: Professional Blue, Modern Gold, Technical Dark
INSERT INTO public.certificate_templates (id, name, description, background_media_url, design_theme, is_active)
VALUES
    (
        '11111111-1111-1111-1111-111111111111',
        'Professional Blue',
        'Distinguished royal blue & platinum aesthetic with classic geometric border and formal academic crest watermark.',
        'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="850" viewBox="0 0 1200 850"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%230b1329"/><stop offset="50%" stop-color="%23101e42"/><stop offset="100%" stop-color="%230b1329"/></linearGradient><linearGradient id="gold" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="%2338bdf8"/><stop offset="50%" stop-color="%2360a5fa"/><stop offset="100%" stop-color="%2338bdf8"/></linearGradient></defs><rect width="1200" height="850" fill="url(%23bg)"/><rect x="35" y="35" width="1130" height="780" fill="none" stroke="url(%23gold)" stroke-width="2.5" opacity="0.85"/><rect x="47" y="47" width="1106" height="756" fill="none" stroke="%232563eb" stroke-width="1" opacity="0.45"/><circle cx="600" cy="425" r="280" fill="none" stroke="%2338bdf8" stroke-width="1" opacity="0.06"/></svg>',
        'professional_blue',
        true
    ),
    (
        '22222222-2222-2222-2222-222222222222',
        'Modern Gold',
        'Prestige gold and champagne trim on deep obsidian slate with intricate certificate diploma motifs.',
        'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="850" viewBox="0 0 1200 850"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%2318181b"/><stop offset="50%" stop-color="%2327272a"/><stop offset="100%" stop-color="%2318181b"/></linearGradient><linearGradient id="gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%23f59e0b"/><stop offset="50%" stop-color="%23fbbf24"/><stop offset="100%" stop-color="%23d97706"/></linearGradient></defs><rect width="1200" height="850" fill="url(%23bg)"/><rect x="35" y="35" width="1130" height="780" fill="none" stroke="url(%23gold)" stroke-width="3" opacity="0.9"/><rect x="47" y="47" width="1106" height="756" fill="none" stroke="%23f59e0b" stroke-width="1" opacity="0.4"/><circle cx="600" cy="425" r="260" fill="none" stroke="%23fbbf24" stroke-width="1.5" opacity="0.08"/></svg>',
        'modern_gold',
        true
    ),
    (
        '33333333-3333-3333-3333-333333333333',
        'Technical Dark',
        'High-tech cyberpunk violet & emerald edge design tailored for advanced software engineering and technical masteries.',
        'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="850" viewBox="0 0 1200 850"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%23090d16"/><stop offset="50%" stop-color="%23111827"/><stop offset="100%" stop-color="%23090d16"/></linearGradient><linearGradient id="cyber" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="%23a855f7"/><stop offset="50%" stop-color="%23c084fc"/><stop offset="100%" stop-color="%2306b6d4"/></linearGradient></defs><rect width="1200" height="850" fill="url(%23bg)"/><rect x="35" y="35" width="1130" height="780" fill="none" stroke="url(%23cyber)" stroke-width="2.5" opacity="0.85"/><rect x="47" y="47" width="1106" height="756" fill="none" stroke="%23a855f7" stroke-width="1" opacity="0.35"/><circle cx="600" cy="425" r="270" fill="none" stroke="%23c084fc" stroke-width="1" opacity="0.07"/></svg>',
        'technical_dark',
        true
    )
ON CONFLICT (name) DO NOTHING;
