/**
 * frontend/lib/api/skillbits.ts
 * Frontend API client helpers for SkillBits.
 * Phase: Step 1 (Foundation)
 */

import { apiFetch, getAuthHeaders, API_BASE } from "./client";
import type {
  StudentSkillBit,
  AdminSkillBit,
  CreateSkillBitPayload,
  UpdateSkillBitPayload,
  StudentSkillBitsFeedResponse,
  AdminSkillBitsResponse,
} from "@/types/skillbits";

// ── STUDENT APIS ─────────────────────────────────────────────────────────────

export async function fetchStudentSkillBits(params?: {
  topic?: string;
  difficulty?: string;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<StudentSkillBitsFeedResponse> {
  const headers = await getAuthHeaders().catch(() => ({}));
  const query = new URLSearchParams();
  if (params?.topic?.trim()) query.set("topic", params.topic.trim());
  if (params?.difficulty?.trim()) query.set("difficulty", params.difficulty.trim());
  if (params?.search?.trim()) query.set("search", params.search.trim());
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.offset) query.set("offset", String(params.offset));

  const qs = query.toString();
  const url = `${API_BASE}/api/skillbits${qs ? `?${qs}` : ""}`;
  const res = await apiFetch(url, { headers });

  if (!res.ok) {
    throw new Error(`Failed to load SkillBits: HTTP ${res.status}`);
  }
  return res.json();
}

export async function fetchStudentSkillBitById(id: string): Promise<StudentSkillBit> {
  const headers = await getAuthHeaders().catch(() => ({}));
  const res = await apiFetch(`${API_BASE}/api/skillbits/${encodeURIComponent(id)}`, { headers });
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error("SkillBit not found or not published.");
    }
    throw new Error(`Failed to load SkillBit: HTTP ${res.status}`);
  }
  return res.json();
}

// ── ADMIN CMS APIS ───────────────────────────────────────────────────────────

export async function fetchAdminSkillBits(params?: {
  status_filter?: string;
  topic?: string;
  difficulty?: string;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<AdminSkillBitsResponse> {
  const headers = await getAuthHeaders();
  const query = new URLSearchParams();
  if (params?.status_filter?.trim()) query.set("status_filter", params.status_filter.trim());
  if (params?.topic?.trim()) query.set("topic", params.topic.trim());
  if (params?.difficulty?.trim()) query.set("difficulty", params.difficulty.trim());
  if (params?.search?.trim()) query.set("search", params.search.trim());
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.offset) query.set("offset", String(params.offset));

  const qs = query.toString();
  const url = `${API_BASE}/api/admin/skillbits${qs ? `?${qs}` : ""}`;
  const res = await apiFetch(url, { headers });

  if (!res.ok) {
    throw new Error(`Failed to load admin SkillBits: HTTP ${res.status}`);
  }
  return res.json();
}

export async function fetchAdminSkillBitById(id: string): Promise<AdminSkillBit> {
  const headers = await getAuthHeaders();
  const res = await apiFetch(`${API_BASE}/api/admin/skillbits/${encodeURIComponent(id)}`, { headers });
  if (!res.ok) {
    throw new Error(`Failed to load admin SkillBit: HTTP ${res.status}`);
  }
  return res.json();
}

export async function createAdminSkillBit(payload: CreateSkillBitPayload): Promise<AdminSkillBit> {
  const headers = await getAuthHeaders();
  const res = await apiFetch(`${API_BASE}/api/admin/skillbits`, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.detail || `Failed to create SkillBit: HTTP ${res.status}`);
  }
  return res.json();
}

export async function updateAdminSkillBit(
  id: string,
  payload: UpdateSkillBitPayload
): Promise<AdminSkillBit> {
  const headers = await getAuthHeaders();
  const res = await apiFetch(`${API_BASE}/api/admin/skillbits/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.detail || `Failed to update SkillBit: HTTP ${res.status}`);
  }
  return res.json();
}

export async function publishAdminSkillBit(id: string): Promise<AdminSkillBit> {
  const headers = await getAuthHeaders();
  const res = await apiFetch(`${API_BASE}/api/admin/skillbits/${encodeURIComponent(id)}/publish`, {
    method: "POST",
    headers,
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.detail || `Failed to publish SkillBit: HTTP ${res.status}`);
  }
  return res.json();
}

export async function archiveAdminSkillBit(id: string): Promise<AdminSkillBit> {
  const headers = await getAuthHeaders();
  const res = await apiFetch(`${API_BASE}/api/admin/skillbits/${encodeURIComponent(id)}/archive`, {
    method: "POST",
    headers,
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.detail || `Failed to archive SkillBit: HTTP ${res.status}`);
  }
  return res.json();
}
