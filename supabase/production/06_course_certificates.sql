-- ====================================================================
-- MODULE 6: COURSE CERTIFICATES (3 TABLES + STORAGE BUCKET + RPC)
-- ====================================================================

-- 1. CERTIFICATE TEMPLATES (Designs & Themes)
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

-- 2. COURSE CERTIFICATE CONFIGS (Course-specific certificate settings)
CREATE TABLE IF NOT EXISTS public.course_certificate_configs (
    course_id UUID PRIMARY KEY REFERENCES public.courses(id) ON DELETE CASCADE,
    certificate_template_id UUID NULL REFERENCES public.certificate_templates(id) ON DELETE RESTRICT,
    enabled BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. CERTIFICATES (Issued Certificates & Immutable Student Snapshots)
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

    CONSTRAINT uq_certificates_user_course UNIQUE (user_id, course_id),
    CONSTRAINT chk_certificates_score CHECK (score_snapshot >= 0 AND score_snapshot <= 100),
    CONSTRAINT chk_certificates_status CHECK (status IN ('issued', 'revoked'))
);

CREATE INDEX IF NOT EXISTS idx_certificates_user_id ON public.certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_course_id ON public.certificates(course_id);
CREATE INDEX IF NOT EXISTS idx_certificates_verification_id ON public.certificates(verification_id);
CREATE INDEX IF NOT EXISTS idx_certificates_certificate_number ON public.certificates(certificate_number);

-- ── STORAGE BUCKET FOR CERTIFICATE ASSETS ────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'certificate-templates',
    'certificate-templates',
    true,
    5242880,
    ARRAY['image/jpeg', 'image/png', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
    public = true;

-- ── IMMUTABILITY ENFORCEMENT TRIGGER ─────────────────────────────────
CREATE OR REPLACE FUNCTION public.enforce_certificate_immutability()
RETURNS TRIGGER AS $$
BEGIN
    IF (OLD.student_name_snapshot IS DISTINCT FROM NEW.student_name_snapshot OR
        OLD.college_name_snapshot IS DISTINCT FROM NEW.college_name_snapshot OR
        OLD.course_title_snapshot IS DISTINCT FROM NEW.course_title_snapshot OR
        OLD.score_snapshot IS DISTINCT FROM NEW.score_snapshot OR
        OLD.certificate_number IS DISTINCT FROM NEW.certificate_number OR
        OLD.verification_id IS DISTINCT FROM NEW.verification_id OR
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
    FOR EACH ROW EXECUTE FUNCTION public.enforce_certificate_immutability();

-- ── PUBLIC VERIFICATION RPC FUNCTION ─────────────────────────────────
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

-- ── ROW LEVEL SECURITY (RLS) ─────────────────────────────────────────
ALTER TABLE public.certificate_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_certificate_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- Templates & Configs: Public read
DROP POLICY IF EXISTS "Public view active templates" ON public.certificate_templates;
CREATE POLICY "Public view active templates" ON public.certificate_templates FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public view course cert configs" ON public.course_certificate_configs;
CREATE POLICY "Public view course cert configs" ON public.course_certificate_configs FOR SELECT USING (true);

-- Certificates: Students read ONLY their own certificates
DROP POLICY IF EXISTS "Users view own certificates" ON public.certificates;
CREATE POLICY "Users view own certificates" ON public.certificates FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Service Role full access
DROP POLICY IF EXISTS "Service role full certificate_templates" ON public.certificate_templates;
CREATE POLICY "Service role full certificate_templates" ON public.certificate_templates FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full course_certificate_configs" ON public.course_certificate_configs;
CREATE POLICY "Service role full course_certificate_configs" ON public.course_certificate_configs FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full certificates" ON public.certificates;
CREATE POLICY "Service role full certificates" ON public.certificates FOR ALL TO service_role USING (true) WITH CHECK (true);
