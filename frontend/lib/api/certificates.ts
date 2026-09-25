/**
 * frontend/lib/api/certificates.ts
 * Frontend API client helpers for Phase 7:
 * Course Completion, Certificates, Templates, Identity, and Public Verification.
 */

import { apiFetch, getAuthHeaders, API_BASE } from "./client";
import type {
  Certificate,
  CertificateEligibility,
  CertificateTemplate,
  CourseCertificateConfig,
  PublicCertificateVerification,
  CertificateIdentity,
  CertificatePreviewData,
} from "@/types/certificate";

// ── Student Certificate Endpoints ────────────────────────────────────────────

export async function fetchCertificateEligibility(
  courseIdOrSlug: string
): Promise<CertificateEligibility> {
  const headers = await getAuthHeaders();
  const res = await apiFetch(
    `${API_BASE}/api/courses/${encodeURIComponent(courseIdOrSlug)}/certificate/eligibility`,
    { headers }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
    throw new Error(err.detail || `Failed to check certificate eligibility: HTTP ${res.status}`);
  }
  return await res.json();
}

export async function issueCourseCertificate(
  courseIdOrSlug: string
): Promise<Certificate> {
  const headers = await getAuthHeaders();
  const res = await apiFetch(
    `${API_BASE}/api/courses/${encodeURIComponent(courseIdOrSlug)}/certificate/issue`,
    {
      method: "POST",
      headers,
    }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
    throw new Error(err.detail || `Failed to issue certificate: HTTP ${res.status}`);
  }
  return await res.json();
}

export async function fetchCourseCertificate(
  courseIdOrSlug: string
): Promise<Certificate> {
  const headers = await getAuthHeaders();
  const res = await apiFetch(
    `${API_BASE}/api/courses/${encodeURIComponent(courseIdOrSlug)}/certificate`,
    { headers }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
    throw new Error(err.detail || `Failed to fetch certificate: HTTP ${res.status}`);
  }
  return await res.json();
}

export async function fetchStudentCertificates(): Promise<Certificate[]> {
  const headers = await getAuthHeaders();
  const res = await apiFetch(`${API_BASE}/api/certificates`, { headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
    throw new Error(err.detail || `Failed to fetch certificates: HTTP ${res.status}`);
  }
  return await res.json();
}

export async function fetchCertificateById(
  certificateId: string
): Promise<Certificate> {
  const headers = await getAuthHeaders();
  const res = await apiFetch(
    `${API_BASE}/api/certificates/${encodeURIComponent(certificateId)}`,
    { headers }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
    throw new Error(err.detail || `Failed to fetch certificate: HTTP ${res.status}`);
  }
  return await res.json();
}

// ── Public Verification Endpoint (No Auth Required) ──────────────────────────

export async function fetchPublicCertificateVerification(
  verificationId: string
): Promise<PublicCertificateVerification> {
  const url = `${API_BASE}/api/public/certificates/${encodeURIComponent(verificationId)}`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    return {
      is_valid: false,
      message: "This certificate could not be verified.",
    };
  }

  return (await res.json()) as PublicCertificateVerification;
}

// ── Student Identity Management (Pre-Certificate Editing & Lock Check) ────────

export async function fetchCertificateIdentity(): Promise<CertificateIdentity> {
  const headers = await getAuthHeaders();
  const res = await apiFetch(`${API_BASE}/api/profile/identity`, { headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
    throw new Error(err.detail || `Failed to fetch certificate identity: HTTP ${res.status}`);
  }
  return await res.json();
}

export async function updateCertificateIdentity(
  fullName: string,
  college?: string
): Promise<CertificateIdentity> {
  const headers = await getAuthHeaders();
  const res = await apiFetch(`${API_BASE}/api/profile/identity`, {
    method: "PATCH",
    headers: {
      ...headers,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      full_name: fullName,
      college: college || null,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
    throw new Error(err.detail || `Failed to update certificate identity: HTTP ${res.status}`);
  }
  return await res.json();
}

// ── Admin Certificate Templates Management ───────────────────────────────────

export async function fetchCertificateTemplates(
  includeInactive = true
): Promise<CertificateTemplate[]> {
  const headers = await getAuthHeaders();
  const res = await apiFetch(
    `${API_BASE}/api/admin/certificate-templates${includeInactive ? "" : "?is_active=true"}`,
    { headers }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
    throw new Error(err.detail || `Failed to fetch certificate templates: HTTP ${res.status}`);
  }
  return await res.json();
}

export async function fetchCertificateTemplateById(
  templateId: string
): Promise<CertificateTemplate> {
  const headers = await getAuthHeaders();
  const res = await apiFetch(
    `${API_BASE}/api/admin/certificate-templates/${encodeURIComponent(templateId)}`,
    { headers }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
    throw new Error(err.detail || `Failed to fetch certificate template: HTTP ${res.status}`);
  }
  return await res.json();
}

export async function createCertificateTemplate(payload: {
  name: string;
  description?: string;
  background_media_url: string;
  design_theme: string;
  is_active?: boolean;
}): Promise<CertificateTemplate> {
  const headers = await getAuthHeaders();
  const res = await apiFetch(`${API_BASE}/api/admin/certificate-templates`, {
    method: "POST",
    headers: {
      ...headers,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
    throw new Error(err.detail || `Failed to create certificate template: HTTP ${res.status}`);
  }
  return await res.json();
}

export async function updateCertificateTemplate(
  templateId: string,
  payload: Partial<{
    name: string;
    description?: string;
    background_media_url: string;
    design_theme: string;
    is_active: boolean;
  }>
): Promise<CertificateTemplate> {
  const headers = await getAuthHeaders();
  const res = await apiFetch(
    `${API_BASE}/api/admin/certificate-templates/${encodeURIComponent(templateId)}`,
    {
      method: "PATCH",
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
    throw new Error(err.detail || `Failed to update certificate template: HTTP ${res.status}`);
  }
  return await res.json();
}

export async function deleteCertificateTemplate(
  templateId: string
): Promise<{ success: boolean; message: string; archived?: boolean }> {
  const headers = await getAuthHeaders();
  const res = await apiFetch(
    `${API_BASE}/api/admin/certificate-templates/${encodeURIComponent(templateId)}`,
    {
      method: "DELETE",
      headers,
    }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
    throw new Error(err.detail || `Failed to delete certificate template: HTTP ${res.status}`);
  }
  return await res.json();
}

export async function uploadCertificateBackground(
  file: File
): Promise<{ success: boolean; background_media_url: string }> {
  const authHeaders = await getAuthHeaders();
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/api/admin/certificate-templates/upload-background`, {
    method: "POST",
    headers: {
      ...authHeaders,
    },
    body: formData,
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.detail || "Failed to upload certificate background image.");
  }

  return await res.json();
}

// ── Admin Course Certificate Configuration ───────────────────────────────────

export async function fetchCourseCertificateConfig(
  courseId: string
): Promise<CourseCertificateConfig> {
  const headers = await getAuthHeaders();
  const res = await apiFetch(
    `${API_BASE}/api/admin/courses/${encodeURIComponent(courseId)}/certificate`,
    { headers }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
    throw new Error(err.detail || `Failed to fetch course certificate config: HTTP ${res.status}`);
  }
  return await res.json();
}

export async function updateCourseCertificateConfig(
  courseId: string,
  enabled: boolean,
  templateId?: string | null
): Promise<CourseCertificateConfig> {
  const headers = await getAuthHeaders();
  const res = await apiFetch(
    `${API_BASE}/api/admin/courses/${encodeURIComponent(courseId)}/certificate`,
    {
      method: "PUT",
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        enabled,
        certificate_template_id: templateId || null,
      }),
    }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
    throw new Error(err.detail || `Failed to update course certificate config: HTTP ${res.status}`);
  }
  return await res.json();
}

export async function fetchCourseCertificatePreview(
  courseId: string,
  templateId?: string
): Promise<CertificatePreviewData> {
  const headers = await getAuthHeaders();
  const query = templateId ? `?template_id=${encodeURIComponent(templateId)}` : "";
  const res = await apiFetch(
    `${API_BASE}/api/admin/courses/${encodeURIComponent(courseId)}/certificate/preview${query}`,
    { headers }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
    throw new Error(err.detail || `Failed to fetch certificate preview: HTTP ${res.status}`);
  }
  return await res.json();
}
