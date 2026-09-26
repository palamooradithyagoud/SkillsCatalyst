/**
 * frontend/types/certificate.ts
 * Phase 7 — Certificate & Verification Type Definitions.
 */

export type CertificateTheme =
  | "skillscatalyst_official"
  | "professional_blue"
  | "modern_gold"
  | "technical_dark"
  | string;

export interface CertificateTemplate {
  id: string;
  name: string;
  description?: string | null;
  background_media_url: string;
  design_theme: CertificateTheme;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CourseCertificateConfig {
  course_id: string;
  enabled: boolean;
  certificate_template_id?: string | null;
  template_name?: string | null;
  design_theme?: CertificateTheme | null;
  background_media_url?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface Certificate {
  id: string;
  certificate_number: string;
  verification_id: string;
  course_id: string;
  course_title: string;
  student_name: string;
  college_name: string;
  score: number;
  issued_at: string;
  status: "issued" | "revoked" | string;
  design_theme: CertificateTheme;
  background_media_url: string;
  verification_url: string;
  created_at?: string;
}

export interface PublicCertificateVerification {
  is_valid: boolean;
  message?: string | null;
  certificate_number?: string | null;
  verification_id?: string | null;
  student_name?: string | null;
  college_name?: string | null;
  course_title?: string | null;
  score?: number | null;
  issued_at?: string | null;
  status?: string | null;
  design_theme?: CertificateTheme | null;
  background_media_url?: string | null;
  verification_url?: string | null;
}

export interface CertificateEligibility {
  course_id: string;
  course_title: string;
  certificate_enabled: boolean;
  all_lessons_completed: boolean;
  all_quizzes_passed: boolean;
  all_modules_completed: boolean;
  course_completed: boolean;
  course_score?: number | null;
  can_issue_certificate: boolean;
  certificate_already_issued: boolean;
  existing_certificate_id?: string | null;
  existing_certificate_number?: string | null;
  student_full_name: string;
  student_college: string;
  is_identity_locked: boolean;
  reason_ineligible?: string | null;
}

export interface CertificateIdentity {
  user_id: string;
  full_name: string;
  college: string;
  is_identity_locked: boolean;
}

export interface CertificatePreviewData {
  student_name: string;
  college_name: string;
  course_title: string;
  score: number;
  issued_date: string;
  certificate_id: string;
  verification_url: string;
  design_theme: CertificateTheme;
  background_media_url: string;
}
