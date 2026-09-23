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
  DirectUploadResponse,
  VideoStatusResponse,
  SkillBitProgress,
  UpdateSkillBitProgressPayload,
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

export async function fetchSkillBitProgress(skillbitId: string): Promise<SkillBitProgress> {
  const headers = await getAuthHeaders().catch(() => ({}));
  const res = await apiFetch(`${API_BASE}/api/skillbits/${encodeURIComponent(skillbitId)}/progress`, {
    headers,
  });
  if (!res.ok) {
    if (res.status === 401) {
      // Unauthenticated visitor: fallback to clean default progress representation
      return {
        skillbit_id: skillbitId,
        watched_seconds: 0,
        completion_percentage: 0,
        last_position_seconds: 0,
        started: false,
        completed: false,
      };
    }
    throw new Error(`Failed to load SkillBit progress: HTTP ${res.status}`);
  }
  return res.json();
}

export async function saveSkillBitProgress(
  skillbitId: string,
  payload: UpdateSkillBitProgressPayload
): Promise<SkillBitProgress> {
  const headers = await getAuthHeaders().catch(() => ({}));
  const res = await apiFetch(`${API_BASE}/api/skillbits/${encodeURIComponent(skillbitId)}/progress`, {
    method: "PATCH",
    headers: {
      ...headers,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    if (res.status === 401) {
      // Unauthenticated visitor: return updated in-memory state
      return {
        skillbit_id: skillbitId,
        watched_seconds: payload.watched_seconds,
        completion_percentage: payload.completion_percentage,
        last_position_seconds: payload.last_position_seconds,
        started: true,
        completed: payload.completion_percentage >= 90,
      };
    }
    throw new Error(`Failed to save SkillBit progress: HTTP ${res.status}`);
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

export async function requestDirectUpload(
  skillbitId: string,
  corsOrigin?: string
): Promise<DirectUploadResponse> {
  const headers = await getAuthHeaders();
  const res = await apiFetch(`${API_BASE}/api/admin/skillbits/${encodeURIComponent(skillbitId)}/direct-upload`, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ cors_origin: corsOrigin }),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.detail || `Failed to create upload session: HTTP ${res.status}`);
  }
  return res.json();
}

export async function getVideoStatus(skillbitId: string): Promise<VideoStatusResponse> {
  const headers = await getAuthHeaders();
  const res = await apiFetch(`${API_BASE}/api/admin/skillbits/${encodeURIComponent(skillbitId)}/video-status`, {
    headers,
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.detail || `Failed to fetch video status: HTTP ${res.status}`);
  }
  return res.json();
}

export function uploadFileToMuxDirect(
  uploadUrl: string,
  file: File,
  onProgress?: (percent: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl, true);
    xhr.setRequestHeader("Content-Type", file.type || "video/mp4");

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          onProgress(percent);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Direct upload failed with status ${xhr.status}`));
      }
    };

    xhr.onerror = () => {
      reject(new Error("Network error during video upload to provider."));
    };

    xhr.send(file);
  });
}

