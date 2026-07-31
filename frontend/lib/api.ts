import { supabase } from "@/lib/supabase";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function getAuthHeaders(): Promise<Record<string, string>> {
  try {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
  } catch {}
  return {};
}

function handleUnauthenticated(res: Response) {
  if (res.status === 401 && typeof window !== "undefined") {
    try {
      localStorage.removeItem("skillscatalyst_user_session");
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && (key.startsWith("skillscatalyst_") || key.startsWith("sc_"))) {
          localStorage.removeItem(key);
        }
      }
    } catch {}
  }
}


export async function fetchDashboardData() {
  try {
    const authHeaders = await getAuthHeaders();
    if (!authHeaders.Authorization) {
      return null;
    }
    const res = await fetch(`${API_BASE}/api/dashboard`, {
      headers: { ...authHeaders },
      cache: "no-store",
    });
    handleUnauthenticated(res);
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    return null;
  }
}


export async function sendMentorMessage(prompt: string) {
  try {
    const res = await fetch(`${API_BASE}/api/ai-mentor/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    if (!res.ok) throw new Error("Failed to reach AI mentor");
    return await res.json();
  } catch {
    return { reply: "I am your SkillsCatalyst AI Mentor powered by Groq. Please start the FastAPI backend to interact live!" };
  }
}

export async function extractResume(file: File): Promise<{ success: boolean; text?: string; filename?: string; char_count?: number; message?: string }> {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API_BASE}/api/resume/extract`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      return {
        success: false,
        message: data.message || `Failed to extract resume (HTTP ${res.status})`,
      };
    }

    return {
      success: true,
      text: data.text,
      filename: data.filename,
      char_count: data.char_count,
    };
  } catch (error: any) {
    console.error("Resume extraction network error:", error);
    return {
      success: false,
      message: error?.message || "Failed to reach backend extraction service. Ensure backend is running.",
    };
  }
}

export async function reviewResume(resumeText: string, targetRole: string, yearsExperience: string, companyType: string = "Product-Based", jobDescription: string = "") {
  try {
    const res = await fetch(`${API_BASE}/api/ai-mentor/review-resume`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        resume_text: resumeText,
        target_role: targetRole,
        years_experience: yearsExperience,
        company_type: companyType,
        job_description: jobDescription,
      }),
    });
    if (!res.ok) throw new Error("Failed to evaluate resume");
    return await res.json();
  } catch (error) {
    console.error("Resume review error:", error);
    return { review: "Error: Unable to connect to Groq AI Resume Evaluator. Please ensure the backend is running." };
  }
}

// ── Learning API ──────────────────────────────────────────────────────────────

export interface Playlist {
  id: string;
  title: string;
  channel: string;
  description: string;
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

export async function searchSkill(
  query: string,
  level = "all",
  language = "english",
  max_results = 10
): Promise<SearchResult> {
  if (!query || !query.trim() || query.trim().length < 2) {
    return { query, level, language, source: "csv", count: 0, results: [] };
  }
  const params = new URLSearchParams({ query: query.trim(), level, language, max_results: String(max_results) });
  try {
    const res = await fetch(`${API_BASE}/api/learning/search?${params}`, { cache: "no-store" });
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

// LocalStorage helpers for saved playlists fallback/sync
const LS_SAVED_PLAYLISTS = "skillscatalyst_saved_playlists";

function getLocalSavedPlaylists(): Playlist[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LS_SAVED_PLAYLISTS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalPlaylist(playlist: Playlist) {
  if (typeof window === "undefined") return;
  try {
    const list = getLocalSavedPlaylists();
    if (!list.some((p) => p.id === playlist.id)) {
      list.unshift(playlist);
      localStorage.setItem(LS_SAVED_PLAYLISTS, JSON.stringify(list));
    }
  } catch {}
}

function removeLocalPlaylist(playlistId: string) {
  if (typeof window === "undefined") return;
  try {
    const list = getLocalSavedPlaylists().filter((p) => p.id !== playlistId);
    localStorage.setItem(LS_SAVED_PLAYLISTS, JSON.stringify(list));
  } catch {}
}

export async function savePlaylist(playlist: Playlist, skillQuery: string) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.id) {
      const userId = session.user.id;
      const row = {
        user_id: userId,
        playlist_id: playlist.id,
        title: playlist.title || "Untitled Playlist",
        channel: playlist.channel || "",
        description: playlist.description || "",
        level: playlist.level || "all",
        video_count: playlist.video_count || "?",
        duration: playlist.duration || "?",
        playlist_url: playlist.playlist_url || "",
        thumbnail: playlist.thumbnail || "",
        source: playlist.source || "youtube",
        skill_query: skillQuery || "",
        created_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("saved_playlists")
        .upsert(row, { onConflict: "playlist_id,user_id" });

      if (!error) {
        // Also notify backend if online
        const authHeaders = await getAuthHeaders();
        if (authHeaders.Authorization) {
          fetch(`${API_BASE}/api/learning/save`, {
            method: "POST",
            headers: { "Content-Type": "application/json", ...authHeaders },
            body: JSON.stringify(row),
          }).catch(() => {});
        }
        return { success: true };
      }
    }
  } catch (e) {
    console.warn("Save playlist to Supabase DB failed:", e);
  }

  saveLocalPlaylist(playlist);
  return { success: true, localOnly: true };
}

export async function unsavePlaylist(playlistId: string) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.id) {
      await supabase
        .from("saved_playlists")
        .delete()
        .eq("user_id", session.user.id)
        .eq("playlist_id", playlistId);
    }
  } catch (e) {
    console.warn("Unsave playlist from Supabase DB failed:", e);
  }

  removeLocalPlaylist(playlistId);
  return { success: true };
}

export async function fetchSavedPlaylists(): Promise<{ saved: Playlist[]; count: number }> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.id) {
      const { data, count } = await supabase
        .from("saved_playlists")
        .select("*", { count: "exact" })
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (data) {
        const saved = data.map((row: any) => ({
          id: row.playlist_id,
          title: row.title,
          channel: row.channel,
          description: row.description,
          level: row.level,
          video_count: row.video_count,
          duration: row.duration,
          playlist_url: row.playlist_url,
          thumbnail: row.thumbnail,
          source: row.source,
        }));
        return { saved, count: count || saved.length };
      }
    }
  } catch (e) {
    console.warn("Fetch saved playlists from Supabase DB failed:", e);
  }

  const localList = getLocalSavedPlaylists();
  return { saved: localList, count: localList.length };
}

// ── Video Progress API ─────────────────────────────────────────────────────────

export interface PlaylistVideo {
  videoId: string;
  title: string;
  position: number;
  thumbnail: string;
  watched: boolean;
  /** Resume playback position in seconds (saved every 10 s) */
  last_position?: number;
  /** Cumulative seconds actually watched (anti-cheat tracked) */
  watch_time?: number;
  /** ISO timestamp set when video is auto-completed */
  completed_at?: string | null;
}

// LocalStorage video progress sync
const LS_VIDEO_PROGRESS = "skillscatalyst_video_progress";

function getLocalVideoProgress(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(LS_VIDEO_PROGRESS);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveLocalVideoWatched(playlistId: string, videoId: string, watched: boolean) {
  if (typeof window === "undefined") return;
  try {
    const prog = getLocalVideoProgress();
    const key = `${playlistId}_${videoId}`;
    prog[key] = watched;
    localStorage.setItem(LS_VIDEO_PROGRESS, JSON.stringify(prog));
  } catch {}
}

function mergeLocalVideoProgress(playlistId: string, videos: PlaylistVideo[]): PlaylistVideo[] {
  const prog = getLocalVideoProgress();
  return videos.map((v) => {
    const key = `${playlistId}_${v.videoId}`;
    if (key in prog) {
      return { ...v, watched: prog[key] };
    }
    return v;
  });
}

export async function fetchPlaylistVideos(
  playlistId: string,
): Promise<{ videos: PlaylistVideo[]; count: number }> {
  // 1. Primary: Fetch full YouTube playlist items + merged progress from backend API
  try {
    const authHeaders = await getAuthHeaders();
    if (authHeaders.Authorization) {
      const res = await fetch(
        `${API_BASE}/api/learning/playlist-videos?playlist_id=${encodeURIComponent(playlistId)}`,
        { headers: { ...authHeaders }, cache: "no-store" }
      );
      if (res.ok) {
        const json = await res.json();
        if (json.videos && Array.isArray(json.videos) && json.videos.length > 0) {
          const merged = mergeLocalVideoProgress(playlistId, json.videos);
          return { videos: merged, count: merged.length };
        }
      }
    }
  } catch (e) {
    console.warn("Fetch playlist videos from backend failed:", e);
  }

  // 2. Fallback: Query Supabase video_progress directly if backend is unreachable
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.id) {
      const { data } = await supabase
        .from("video_progress")
        .select("*")
        .eq("user_id", session.user.id)
        .eq("playlist_id", playlistId);

      if (data && data.length > 0) {
        const videos: PlaylistVideo[] = data.map((row: any, idx: number) => ({
          videoId: row.video_id,
          title: `Video ${idx + 1}`,
          position: idx + 1,
          thumbnail: "",
          watched: !!row.watched,
          last_position: row.last_position || 0,
          watch_time: row.watch_time || 0,
          completed_at: row.completed_at || null,
        }));
        const merged = mergeLocalVideoProgress(playlistId, videos);
        return { videos: merged, count: merged.length };
      }
    }
  } catch (e) {
    console.warn("Fetch playlist videos fallback failed:", e);
  }

  return { videos: [], count: 0 };
}

export async function markVideoWatched(
  playlistId: string,
  videoId: string,
  watched: boolean
): Promise<void> {
  // Always update local storage first so UI tick is 100% persistent
  saveLocalVideoWatched(playlistId, videoId, watched);

  try {
    const authHeaders = await getAuthHeaders();
    if (authHeaders.Authorization) {
      await fetch(`${API_BASE}/api/learning/video-progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({
          playlist_id: playlistId,
          video_id: videoId,
          watched: watched,
        }),
      });
    }
  } catch (e) {
    console.warn("Backend markVideoWatched failed:", e);
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.id) {
      const row = {
        user_id: session.user.id,
        playlist_id: playlistId,
        video_id: videoId,
        watched: watched,
        completed_at: watched ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      };
      await supabase
        .from("video_progress")
        .upsert(row, { onConflict: "user_id,playlist_id,video_id" });
    }
  } catch (e) {
    console.warn("Mark video watched in Supabase DB failed:", e);
  }
}

/**
 * Periodic resume save (every 10 s while playing).
 * Updates last_position + watch_time WITHOUT touching the `watched` flag.
 */
export async function saveVideoProgress(
  playlistId: string,
  videoId: string,
  lastPosition: number,
  watchTime: number,
): Promise<void> {
  try {
    const authHeaders = await getAuthHeaders();
    if (authHeaders.Authorization) {
      fetch(`${API_BASE}/api/learning/save-progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({
          playlist_id: playlistId,
          video_id: videoId,
          last_position: Math.round(lastPosition),
          watch_time: Math.round(watchTime),
        }),
      }).catch(() => {});
    }
  } catch {}

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.id) {
      const row = {
        user_id: session.user.id,
        playlist_id: playlistId,
        video_id: videoId,
        last_position: Math.round(lastPosition),
        watch_time: Math.round(watchTime),
        updated_at: new Date().toISOString(),
      };
      await supabase
        .from("video_progress")
        .upsert(row, { onConflict: "user_id,playlist_id,video_id" });
    }
  } catch {}
}

/**
 * Auto-completion endpoint.
 * Called by useYouTubePlayer when ≥95% of the video is genuinely watched.
 * Returns updated playlist statistics for instant UI refresh.
 */
export async function completeVideo(
  playlistId: string,
  videoId: string,
  watchTime: number,
): Promise<{ success: boolean; completed_at?: string; playlist_stats?: { completed_videos: number } }> {
  saveLocalVideoWatched(playlistId, videoId, true);

  try {
    const authHeaders = await getAuthHeaders();
    if (authHeaders.Authorization) {
      const res = await fetch(`${API_BASE}/api/learning/complete-video`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({
          playlist_id: playlistId,
          video_id: videoId,
          watch_time: Math.round(watchTime),
        }),
      });
      if (res.ok) {
        return await res.json();
      }
    }
  } catch (e) {
    console.warn("Backend completeVideo failed:", e);
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.id) {
      const nowIso = new Date().toISOString();
      const row = {
        user_id: session.user.id,
        playlist_id: playlistId,
        video_id: videoId,
        watched: true,
        watch_time: Math.round(watchTime),
        completed_at: nowIso,
        updated_at: nowIso,
      };
      await supabase
        .from("video_progress")
        .upsert(row, { onConflict: "user_id,playlist_id,video_id" });

      return { success: true, completed_at: nowIso };
    }
  } catch (e) {
    console.warn("completeVideo failed:", e);
  }
  return { success: false };
}

export async function markAllVideosWatched(
  playlistId: string,
  watched: boolean = true
): Promise<{ success: boolean; count: number }> {
  try {
    const videosRes = await fetchPlaylistVideos(playlistId);
    if (videosRes.videos && videosRes.videos.length > 0) {
      for (const v of videosRes.videos) {
        saveLocalVideoWatched(playlistId, v.videoId, watched);
      }
    }
  } catch {}

  try {
    const authHeaders = await getAuthHeaders();
    if (authHeaders.Authorization) {
      const res = await fetch(`${API_BASE}/api/learning/mark-all-watched`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({
          playlist_id: playlistId,
          watched: watched,
        }),
      });
      if (res.ok) {
        return await res.json();
      }
    }
  } catch (e) {
    console.warn("markAllVideosWatched failed:", e);
  }
  return { success: false, count: 0 };
}


// ── Tier 3: AI Roadmap API ───────────────────────────────────────────────────

export interface RoadmapTier {
  tier: number;
  name: string;
  description: string;
  nodes: string[];
}

export interface RoadmapData {
  title: string;
  tiers: RoadmapTier[];
}

export async function generateRoadmap(skill: string): Promise<RoadmapData | null> {
  try {
    const res = await fetch(`${API_BASE}/api/learning/roadmap`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ skill }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.roadmap ?? null;
  } catch (e) {
    console.warn("Roadmap generation failed:", e);
    return null;
  }
}

// ── Practice / Company Questions API ─────────────────────────────────────────

export interface PracticeQuestion {
  id: number;
  title: string;
  url: string;
  difficulty: "Easy" | "Medium" | "Hard" | string;
  acceptance: string;
  frequency: string;
}

export interface CompanyQuestionsResult {
  company: string;
  period: string;
  total: number;
  offset: number;
  limit: number;
  questions: PracticeQuestion[];
}

export type QuestionPeriod =
  | "all"
  | "six-months"
  | "three-months"
  | "thirty-days"
  | "more-than-six-months";

/** Fetches the sorted list of all 663 company slugs. */
export async function fetchPracticeCompanies(): Promise<string[]> {
  try {
    const res = await fetch(`${API_BASE}/api/practice/companies`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.companies ?? [];
  } catch (e) {
    console.warn("Failed to fetch practice companies:", e);
    return [];
  }
}

/** Fetches questions for a specific company with optional filters. */
export async function fetchCompanyQuestions(
  company: string,
  period: QuestionPeriod = "all",
  difficulty?: string,
  search?: string,
  limit = 100,
  offset = 0,
): Promise<CompanyQuestionsResult | null> {
  try {
    const params = new URLSearchParams({ period, limit: String(limit), offset: String(offset) });
    if (difficulty) params.set("difficulty", difficulty);
    if (search) params.set("search", search);

    const res = await fetch(
      `${API_BASE}/api/practice/questions/${encodeURIComponent(company)}?${params}`,
      { cache: "no-store" },
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    console.warn(`Failed to fetch questions for '${company}':`, e);
    return null;
  }
}

// ── Profile & Developer Coding Platforms API ─────────────────────────────────

export interface AcademicProfile {
  user_id?: string;
  full_name: string;
  college: string;
  department: string;
  academic_year: string;
  target_role: string;
}

export interface CodingProfilesInput {
  user_id?: string;
  leetcode?: string;
  github?: string;
  hackerrank?: string;
  codechef?: string;
  geeksforgeeks?: string;
  codeforces?: string;
}

export interface PlatformStat {
  configured: boolean;
  username?: string;
  url?: string;
  badge?: string;
  summary?: string;
  [key: string]: any;
}

export async function fetchProfileData() {
  try {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user?.id) return null;

    const userId = session.user.id;

    // Fetch profile data directly from Supabase DB
    const [academicRes, codingRes] = await Promise.all([
      supabase.from("user_academic_profile").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("user_coding_profiles").select("*").eq("user_id", userId).maybeSingle(),
    ]);

    const academic = academicRes.data || null;
    const coding = codingRes.data || null;

    let codingInputs: any = null;
    let codingStats: any = null;

    if (coding) {
      codingInputs = {
        leetcode: coding.leetcode_url || "",
        github: coding.github_url || "",
        hackerrank: coding.hackerrank_url || "",
        codechef: coding.codechef_url || "",
        geeksforgeeks: coding.geeksforgeeks_url || "",
        codeforces: coding.codeforces_url || "",
      };
      codingStats = coding.stats_json || {};
    }

    return {
      academic,
      coding_inputs: codingInputs,
      coding_stats: codingStats,
    };
  } catch (e) {
    console.warn("Failed to fetch profile data:", e);
    return null;
  }
}

export async function saveAcademicProfile(data: AcademicProfile) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) return null;

    const payload = {
      user_id: session.user.id,
      full_name: data.full_name || "",
      college: data.college || "",
      department: data.department || "",
      academic_year: data.academic_year || "",
      target_role: data.target_role || "",
      updated_at: new Date().toISOString(),
    };

    // Save directly to Supabase DB
    const { error } = await supabase
      .from("user_academic_profile")
      .upsert(payload, { onConflict: "user_id" });

    if (error) throw error;

    // Async sync to FastAPI backend if online
    const authHeaders = await getAuthHeaders();
    if (authHeaders.Authorization) {
      fetch(`${API_BASE}/api/profile/academic`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify(data),
      }).catch(() => {});
    }

    return { success: true };
  } catch (e) {
    console.warn("Failed to save academic profile:", e);
    return null;
  }
}

export async function saveCodingProfiles(data: CodingProfilesInput) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) return null;

    const payload = {
      user_id: session.user.id,
      leetcode_url: data.leetcode || "",
      github_url: data.github || "",
      hackerrank_url: data.hackerrank || "",
      codechef_url: data.codechef || "",
      geeksforgeeks_url: data.geeksforgeeks || "",
      codeforces_url: data.codeforces || "",
      updated_at: new Date().toISOString(),
    };

    // Save directly to Supabase DB
    const { error } = await supabase
      .from("user_coding_profiles")
      .upsert(payload, { onConflict: "user_id" });

    if (error) throw error;

    let extractedStats = {};
    const authHeaders = await getAuthHeaders();
    if (authHeaders.Authorization) {
      try {
        const res = await fetch(`${API_BASE}/api/profile/coding`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...authHeaders },
          body: JSON.stringify(data),
        });
        if (res.ok) {
          const json = await res.json();
          if (json.stats) extractedStats = json.stats;
        }
      } catch {}
    }

    return { success: true, stats: extractedStats };
  } catch (e) {
    console.warn("Failed to save coding profiles:", e);
    return null;
  }
}

