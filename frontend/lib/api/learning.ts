import { API_BASE, apiFetch, getAuthHeaders } from "./client";

export interface Playlist {
  id: string;
  title: string;
  channel: string;
  description: string;
  language?: string;
  level: string;
  video_count: string;
  duration: string;
  playlist_url: string;
  channel_url?: string;
  thumbnail: string;
  source: "csv" | "youtube";
  skill_query?: string;
  created_at?: string;
}

export interface SearchResult {
  query: string;
  level: string;
  language: string;
  source: "csv" | "youtube";
  count: number;
  results: Playlist[];
}

export function cleanPlaylistId(rawIdOrUrl: string): string {
  if (!rawIdOrUrl) return "";
  try {
    if (rawIdOrUrl.includes("list=")) {
      const url = new URL(rawIdOrUrl.startsWith("http") ? rawIdOrUrl : `https://${rawIdOrUrl}`);
      const listParam = url.searchParams.get("list");
      if (listParam) return listParam;
    }
    if (rawIdOrUrl.includes("watch?v=") || rawIdOrUrl.includes("v=")) {
      const url = new URL(rawIdOrUrl.startsWith("http") ? rawIdOrUrl : `https://${rawIdOrUrl}`);
      const vParam = url.searchParams.get("v");
      if (vParam) return vParam;
    }
    if (rawIdOrUrl.includes("youtu.be/")) {
      const url = new URL(rawIdOrUrl.startsWith("http") ? rawIdOrUrl : `https://${rawIdOrUrl}`);
      const pathId = url.pathname.replace(/^\//, "");
      if (pathId) return pathId;
    }
  } catch {}
  return rawIdOrUrl.replace(/^.*list=/, "").replace(/^.*v=/, "").split("&")[0].trim();
}

export async function searchSkill(
  query: string,
  level = "all",
  language = "all",
  max_results = 10
): Promise<SearchResult> {
  if (!query || !query.trim() || query.trim().length < 2) {
    return { query, level, language, source: "csv", count: 0, results: [] };
  }
  const params = new URLSearchParams({ query: query.trim(), level, language, max_results: String(max_results) });
  try {
    const authHeaders = await getAuthHeaders();
    const res = await apiFetch(`${API_BASE}/api/learning/search?${params}`, { headers: { ...authHeaders }, cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.results && Array.isArray(data.results)) {
      data.results = data.results.slice(0, 10);
      data.count = data.results.length;
    }
    return data;
  } catch (e) {
    console.warn("Learning search failed:", e);
    return { query, level, language, source: "csv", count: 0, results: [] };
  }
}
