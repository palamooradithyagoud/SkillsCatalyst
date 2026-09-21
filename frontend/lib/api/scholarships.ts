import { apiFetch, getAuthHeaders, API_BASE } from "./client";
import type {
  ScholarshipItem,
  CreateScholarshipPayload,
  UpdateScholarshipPayload,
} from "@/types/scholarships";

export interface ScholarshipListResponse {
  total: number;
  scholarships: ScholarshipItem[];
}

export interface ScholarshipFilterParams {
  search?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

// ── STUDENT APIS ─────────────────────────────────────────────────────────────

export async function fetchStudentScholarships(
  params?: ScholarshipFilterParams
): Promise<ScholarshipListResponse> {
  const query = new URLSearchParams();
  if (params?.search) query.set("search", params.search);
  if (params?.limit !== undefined) query.set("limit", String(params.limit));
  if (params?.offset !== undefined) query.set("offset", String(params.offset));

  const qs = query.toString();
  const url = `${API_BASE}/api/scholarships${qs ? `?${qs}` : ""}`;
  const res = await apiFetch(url);

  if (!res.ok) {
    throw new Error(`Failed to load scholarships: HTTP ${res.status}`);
  }
  return res.json();
}

export async function fetchStudentScholarshipById(id: string): Promise<ScholarshipItem> {
  const res = await apiFetch(`${API_BASE}/api/scholarships/${encodeURIComponent(id)}`);
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error("Scholarship not found or is no longer available.");
    }
    throw new Error(`Failed to load scholarship: HTTP ${res.status}`);
  }
  return res.json();
}

// ── ADMIN APIS ───────────────────────────────────────────────────────────────

export async function fetchAdminScholarships(
  params?: ScholarshipFilterParams
): Promise<ScholarshipListResponse> {
  const headers = await getAuthHeaders();
  const query = new URLSearchParams();
  if (params?.status && params.status !== "all") query.set("status", params.status);
  if (params?.search) query.set("search", params.search);
  if (params?.limit !== undefined) query.set("limit", String(params.limit));
  if (params?.offset !== undefined) query.set("offset", String(params.offset));

  const qs = query.toString();
  const url = `${API_BASE}/api/admin/scholarships${qs ? `?${qs}` : ""}`;
  const res = await apiFetch(url, { headers });

  if (!res.ok) {
    throw new Error(`Failed to load admin scholarships: HTTP ${res.status}`);
  }
  return res.json();
}

export async function fetchAdminScholarshipById(id: string): Promise<ScholarshipItem> {
  const headers = await getAuthHeaders();
  const res = await apiFetch(`${API_BASE}/api/admin/scholarships/${encodeURIComponent(id)}`, { headers });
  if (!res.ok) {
    throw new Error(`Failed to load scholarship: HTTP ${res.status}`);
  }
  return res.json();
}

export async function createAdminScholarship(
  payload: CreateScholarshipPayload
): Promise<{ success: boolean; message?: string; scholarship: ScholarshipItem }> {
  const headers = await getAuthHeaders();
  headers["Content-Type"] = "application/json";

  const res = await apiFetch(`${API_BASE}/api/admin/scholarships`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    const message = errorJson.detail || errorJson.message || `Failed to create scholarship (HTTP ${res.status})`;
    throw new Error(message);
  }
  return res.json();
}

export async function updateAdminScholarship(
  id: string,
  payload: UpdateScholarshipPayload
): Promise<{ success: boolean; message?: string; scholarship: ScholarshipItem }> {
  const headers = await getAuthHeaders();
  headers["Content-Type"] = "application/json";

  const res = await apiFetch(`${API_BASE}/api/admin/scholarships/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    const message = errorJson.detail || errorJson.message || `Failed to update scholarship (HTTP ${res.status})`;
    throw new Error(message);
  }
  return res.json();
}

export async function publishAdminScholarship(
  id: string
): Promise<{ success: boolean; message?: string; scholarship: ScholarshipItem }> {
  const headers = await getAuthHeaders();
  const res = await apiFetch(`${API_BASE}/api/admin/scholarships/${encodeURIComponent(id)}/publish`, {
    method: "POST",
    headers,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Failed to publish scholarship: HTTP ${res.status}`);
  }
  return res.json();
}

export async function archiveAdminScholarship(
  id: string
): Promise<{ success: boolean; message?: string; scholarship: ScholarshipItem }> {
  const headers = await getAuthHeaders();
  const res = await apiFetch(`${API_BASE}/api/admin/scholarships/${encodeURIComponent(id)}/archive`, {
    method: "POST",
    headers,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Failed to archive scholarship: HTTP ${res.status}`);
  }
  return res.json();
}

export async function deleteAdminScholarship(id: string): Promise<{ success: boolean; message?: string }> {
  const headers = await getAuthHeaders();
  const res = await apiFetch(`${API_BASE}/api/admin/scholarships/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Failed to delete scholarship: HTTP ${res.status}`);
  }
  return res.json();
}

export async function uploadScholarshipImage(
  file: File,
  scholarshipId?: string
): Promise<{ success: boolean; image_url: string }> {
  const headers = await getAuthHeaders();
  delete headers["Content-Type"];

  const formData = new FormData();
  formData.append("file", file);

  const endpoint = scholarshipId
    ? `${API_BASE}/api/admin/scholarships/${encodeURIComponent(scholarshipId)}/upload-image`
    : `${API_BASE}/api/admin/scholarships/upload-image`;

  const res = await apiFetch(endpoint, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    throw new Error(errJson.detail || `Upload failed: HTTP ${res.status}`);
  }
  return res.json();
}
