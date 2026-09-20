import { apiFetch, getAuthHeaders, API_BASE } from "./client";
import type {
  EventItem,
  CreateEventPayload,
  UpdateEventPayload,
} from "@/types/events";

export interface EventListResponse {
  total: number;
  events: EventItem[];
}

export interface EventFilterParams {
  category?: string;
  is_hackathon?: boolean;
  search?: string;
  status?: string;
}

// ── STUDENT APIS ─────────────────────────────────────────────────────────────

export async function fetchStudentEvents(params?: EventFilterParams): Promise<EventListResponse> {
  const query = new URLSearchParams();
  if (params?.category) query.set("category", params.category);
  if (params?.is_hackathon !== undefined) query.set("is_hackathon", String(params.is_hackathon));
  if (params?.search) query.set("search", params.search);

  const qs = query.toString();
  const url = `${API_BASE}/api/events${qs ? `?${qs}` : ""}`;
  const res = await apiFetch(url);

  if (!res.ok) {
    throw new Error(`Failed to load events: HTTP ${res.status}`);
  }
  return res.json();
}

export async function fetchStudentEventById(id: string): Promise<EventItem> {
  const res = await apiFetch(`${API_BASE}/api/events/${encodeURIComponent(id)}`);
  if (!res.ok) {
    throw new Error(`Failed to load event: HTTP ${res.status}`);
  }
  return res.json();
}

// ── ADMIN APIS ───────────────────────────────────────────────────────────────

export async function fetchAdminEvents(params?: EventFilterParams): Promise<EventListResponse> {
  const headers = await getAuthHeaders();
  const query = new URLSearchParams();
  if (params?.status && params.status !== "all") query.set("status", params.status);
  if (params?.is_hackathon !== undefined) query.set("is_hackathon", String(params.is_hackathon));
  if (params?.search) query.set("search", params.search);

  const qs = query.toString();
  const url = `${API_BASE}/api/admin/events${qs ? `?${qs}` : ""}`;
  const res = await apiFetch(url, { headers });

  if (!res.ok) {
    throw new Error(`Failed to load admin events: HTTP ${res.status}`);
  }
  return res.json();
}

export async function fetchAdminEventById(id: string): Promise<EventItem> {
  const headers = await getAuthHeaders();
  const res = await apiFetch(`${API_BASE}/api/admin/events/${encodeURIComponent(id)}`, { headers });
  if (!res.ok) {
    throw new Error(`Failed to load event: HTTP ${res.status}`);
  }
  return res.json();
}

export async function createAdminEvent(payload: CreateEventPayload): Promise<{ success: boolean; event: EventItem }> {
  const headers = await getAuthHeaders();
  headers["Content-Type"] = "application/json";

  const res = await apiFetch(`${API_BASE}/api/admin/events`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    const message = errorJson.detail || errorJson.message || `Failed to create event (HTTP ${res.status})`;
    throw new Error(message);
  }
  return res.json();
}

export async function updateAdminEvent(id: string, payload: UpdateEventPayload): Promise<{ success: boolean; event: EventItem }> {
  const headers = await getAuthHeaders();
  headers["Content-Type"] = "application/json";

  const res = await apiFetch(`${API_BASE}/api/admin/events/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    const message = errorJson.detail || errorJson.message || `Failed to update event (HTTP ${res.status})`;
    throw new Error(message);
  }
  return res.json();
}

export async function publishAdminEvent(id: string): Promise<{ success: boolean; event: EventItem }> {
  const headers = await getAuthHeaders();
  const res = await apiFetch(`${API_BASE}/api/admin/events/${encodeURIComponent(id)}/publish`, {
    method: "POST",
    headers,
  });

  if (!res.ok) {
    throw new Error(`Failed to publish event: HTTP ${res.status}`);
  }
  return res.json();
}

export async function archiveAdminEvent(id: string): Promise<{ success: boolean; event: EventItem }> {
  const headers = await getAuthHeaders();
  const res = await apiFetch(`${API_BASE}/api/admin/events/${encodeURIComponent(id)}/archive`, {
    method: "POST",
    headers,
  });

  if (!res.ok) {
    throw new Error(`Failed to archive event: HTTP ${res.status}`);
  }
  return res.json();
}

export async function deleteAdminEvent(id: string): Promise<{ success: boolean }> {
  const headers = await getAuthHeaders();
  const res = await apiFetch(`${API_BASE}/api/admin/events/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers,
  });

  if (!res.ok) {
    throw new Error(`Failed to delete event: HTTP ${res.status}`);
  }
  return res.json();
}

export async function uploadEventBanner(file: File): Promise<{ success: boolean; banner_url: string }> {
  const headers = await getAuthHeaders();
  // Note: Do NOT set Content-Type so browser sets boundary for multipart/form-data
  delete headers["Content-Type"];

  const formData = new FormData();
  formData.append("file", file);

  const res = await apiFetch(`${API_BASE}/api/admin/events/upload-banner`, {
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
