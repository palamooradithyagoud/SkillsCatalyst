import { apiFetch, getAuthHeaders, API_BASE } from "./client";
import type {
  TechNewsSource,
  TechNewsStory,
  GroupedTechNewsSource,
  CreateTechNewsSourcePayload,
  UpdateTechNewsSourcePayload,
  CreateTechNewsStoryPayload,
  UpdateTechNewsStoryPayload,
} from "@/types/tech_news";

export interface StudentTechNewsFeedResponse {
  total_sources: number;
  total_stories: number;
  sources: GroupedTechNewsSource[];
}

export interface AdminSourcesResponse {
  total: number;
  sources: TechNewsSource[];
}

export interface AdminStoriesResponse {
  total: number;
  stories: TechNewsStory[];
}

// ── STUDENT APIS ─────────────────────────────────────────────────────────────

export async function fetchStudentTechNews(
  search?: string
): Promise<StudentTechNewsFeedResponse> {
  const headers = await getAuthHeaders().catch(() => ({}));
  const query = new URLSearchParams();
  if (search?.trim()) query.set("search", search.trim());

  const qs = query.toString();
  const url = `${API_BASE}/api/tech-news${qs ? `?${qs}` : ""}`;
  const res = await apiFetch(url, { headers });

  if (!res.ok) {
    throw new Error(`Failed to load tech news: HTTP ${res.status}`);
  }
  return res.json();
}

export async function fetchStudentStoryById(id: string): Promise<TechNewsStory> {
  const headers = await getAuthHeaders().catch(() => ({}));
  const res = await apiFetch(`${API_BASE}/api/tech-news/${encodeURIComponent(id)}`, { headers });
  if (!res.ok) {
    if (res.status === 403) {
      const errorJson = await res.json().catch(() => ({}));
      const err: any = new Error("Daily story limit reached. Upgrade to Premium for unlimited stories.");
      err.status = 403;
      err.code = errorJson?.detail?.code || "LIMIT_REACHED";
      err.detail = errorJson?.detail;
      throw err;
    }
    if (res.status === 404) {
      throw new Error("Story not found or is no longer active (48-hour window expired).");
    }
    throw new Error(`Failed to load story: HTTP ${res.status}`);
  }
  return res.json();
}

// ── ADMIN SOURCE APIS ────────────────────────────────────────────────────────

export async function fetchAdminTechNewsSources(
  search?: string
): Promise<AdminSourcesResponse> {
  const headers = await getAuthHeaders();
  const query = new URLSearchParams();
  if (search?.trim()) query.set("search", search.trim());

  const qs = query.toString();
  const url = `${API_BASE}/api/admin/tech-news/sources${qs ? `?${qs}` : ""}`;
  const res = await apiFetch(url, { headers });

  if (!res.ok) {
    throw new Error(`Failed to load sources: HTTP ${res.status}`);
  }
  return res.json();
}

export async function fetchAdminTechNewsSourceById(id: string): Promise<TechNewsSource> {
  const headers = await getAuthHeaders();
  const res = await apiFetch(
    `${API_BASE}/api/admin/tech-news/sources/${encodeURIComponent(id)}`,
    { headers }
  );
  if (!res.ok) {
    throw new Error(`Failed to load source: HTTP ${res.status}`);
  }
  return res.json();
}

function extractErrorMessage(errorJson: any, defaultMsg: string): string {
  if (Array.isArray(errorJson?.detail)) {
    return errorJson.detail
      .map((item: any) => {
        const locParts = item.loc ? item.loc.filter((x: any) => x !== "body") : [];
        const field = locParts.join(".");
        return field ? `${field}: ${item.msg}` : item.msg;
      })
      .join("; ");
  }
  if (typeof errorJson?.detail === "string") return errorJson.detail;
  if (errorJson?.message) return errorJson.message;
  return defaultMsg;
}

export async function createAdminTechNewsSource(
  payload: CreateTechNewsSourcePayload
): Promise<{ success: boolean; message?: string; source: TechNewsSource }> {
  const headers = await getAuthHeaders();
  headers["Content-Type"] = "application/json";

  const res = await apiFetch(`${API_BASE}/api/admin/tech-news/sources`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(extractErrorMessage(errorJson, `Failed to create source (HTTP ${res.status})`));
  }
  return res.json();
}

export async function updateAdminTechNewsSource(
  id: string,
  payload: UpdateTechNewsSourcePayload
): Promise<{ success: boolean; message?: string; source: TechNewsSource }> {
  const headers = await getAuthHeaders();
  headers["Content-Type"] = "application/json";

  const res = await apiFetch(
    `${API_BASE}/api/admin/tech-news/sources/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers,
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(extractErrorMessage(errorJson, `Failed to update source (HTTP ${res.status})`));
  }
  return res.json();
}

export async function deleteAdminTechNewsSource(
  id: string
): Promise<{ success: boolean; message: string }> {
  const headers = await getAuthHeaders();
  const res = await apiFetch(
    `${API_BASE}/api/admin/tech-news/sources/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      headers,
    }
  );

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(extractErrorMessage(errorJson, `Failed to delete source (HTTP ${res.status})`));
  }
  return res.json();
}

export async function uploadAdminSourceLogo(
  file: File,
  sourceId?: string
): Promise<{ success: boolean; logo_url: string }> {
  const headers = await getAuthHeaders();
  const formData = new FormData();
  formData.append("file", file);

  const endpoint = sourceId
    ? `${API_BASE}/api/admin/tech-news/sources/${encodeURIComponent(sourceId)}/upload-logo`
    : `${API_BASE}/api/admin/tech-news/sources/upload-logo`;

  const res = await apiFetch(endpoint, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(extractErrorMessage(errorJson, `Failed to upload logo (HTTP ${res.status})`));
  }
  return res.json();
}

// ── ADMIN STORY APIS ─────────────────────────────────────────────────────────

export async function fetchAdminTechNewsStories(params?: {
  source_id?: string;
  status?: string;
  search?: string;
}): Promise<AdminStoriesResponse> {
  const headers = await getAuthHeaders();
  const query = new URLSearchParams();
  if (params?.source_id) query.set("source_id", params.source_id);
  if (params?.status && params.status !== "all") query.set("status_filter", params.status);
  if (params?.search?.trim()) query.set("search", params.search.trim());

  const qs = query.toString();
  const url = `${API_BASE}/api/admin/tech-news/stories${qs ? `?${qs}` : ""}`;
  const res = await apiFetch(url, { headers });

  if (!res.ok) {
    throw new Error(`Failed to load stories: HTTP ${res.status}`);
  }
  return res.json();
}

export async function fetchAdminTechNewsStoryById(id: string): Promise<TechNewsStory> {
  const headers = await getAuthHeaders();
  const res = await apiFetch(
    `${API_BASE}/api/admin/tech-news/stories/${encodeURIComponent(id)}`,
    { headers }
  );
  if (!res.ok) {
    throw new Error(`Failed to load story: HTTP ${res.status}`);
  }
  return res.json();
}

export async function createAdminTechNewsStory(
  payload: CreateTechNewsStoryPayload
): Promise<{ success: boolean; message?: string; story: TechNewsStory }> {
  const headers = await getAuthHeaders();
  headers["Content-Type"] = "application/json";

  const headlineVal = payload.headline || payload.title || "";
  const contentVal = payload.why_it_matters || payload.content || "";

  const bodyPayload = {
    ...payload,
    headline: headlineVal,
    title: headlineVal,
    why_it_matters: contentVal,
    content: contentVal,
  };

  const res = await apiFetch(`${API_BASE}/api/admin/tech-news/stories`, {
    method: "POST",
    headers,
    body: JSON.stringify(bodyPayload),
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(extractErrorMessage(errorJson, `Failed to create story (HTTP ${res.status})`));
  }
  return res.json();
}

export async function updateAdminTechNewsStory(
  id: string,
  payload: UpdateTechNewsStoryPayload
): Promise<{ success: boolean; message?: string; story: TechNewsStory }> {
  const headers = await getAuthHeaders();
  headers["Content-Type"] = "application/json";

  const bodyPayload: Record<string, any> = { ...payload };
  if (payload.headline || payload.title) {
    const hl = payload.headline || payload.title;
    bodyPayload.headline = hl;
    bodyPayload.title = hl;
  }
  if (payload.why_it_matters || payload.content) {
    const cnt = payload.why_it_matters || payload.content;
    bodyPayload.why_it_matters = cnt;
    bodyPayload.content = cnt;
  }

  const res = await apiFetch(
    `${API_BASE}/api/admin/tech-news/stories/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers,
      body: JSON.stringify(bodyPayload),
    }
  );

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(extractErrorMessage(errorJson, `Failed to update story (HTTP ${res.status})`));
  }
  return res.json();
}

export async function publishAdminTechNewsStory(
  id: string
): Promise<{ success: boolean; message: string; story: TechNewsStory }> {
  const headers = await getAuthHeaders();
  const res = await apiFetch(
    `${API_BASE}/api/admin/tech-news/stories/${encodeURIComponent(id)}/publish`,
    {
      method: "POST",
      headers,
    }
  );

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(extractErrorMessage(errorJson, `Failed to publish story (HTTP ${res.status})`));
  }
  return res.json();
}

export async function archiveAdminTechNewsStory(
  id: string
): Promise<{ success: boolean; message: string; story: TechNewsStory }> {
  const headers = await getAuthHeaders();
  const res = await apiFetch(
    `${API_BASE}/api/admin/tech-news/stories/${encodeURIComponent(id)}/archive`,
    {
      method: "POST",
      headers,
    }
  );

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(extractErrorMessage(errorJson, `Failed to archive story (HTTP ${res.status})`));
  }
  return res.json();
}

export async function deleteAdminTechNewsStory(
  id: string
): Promise<{ success: boolean; message: string }> {
  const headers = await getAuthHeaders();
  const res = await apiFetch(
    `${API_BASE}/api/admin/tech-news/stories/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      headers,
    }
  );

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(extractErrorMessage(errorJson, `Failed to delete story (HTTP ${res.status})`));
  }
  return res.json();
}

export async function uploadAdminStoryCover(
  file: File,
  storyId?: string
): Promise<{ success: boolean; cover_image_url: string }> {
  const headers = await getAuthHeaders();
  const formData = new FormData();
  formData.append("file", file);

  const endpoint = storyId
    ? `${API_BASE}/api/admin/tech-news/stories/${encodeURIComponent(storyId)}/upload-cover`
    : `${API_BASE}/api/admin/tech-news/stories/upload-cover`;

  const res = await apiFetch(endpoint, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(extractErrorMessage(errorJson, `Failed to upload cover image (HTTP ${res.status})`));
  }
  return res.json();
}
