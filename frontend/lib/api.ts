const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function fetchDashboardData() {
  try {
    const res = await fetch(`${API_BASE}/api/dashboard`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch dashboard data");
    return await res.json();
  } catch (error) {
    console.warn("FastAPI backend offline, returning fallback schema", error);
    return {
      user: { name: "Palamoor", status: "ACTIVE", streakDays: 0 },
      metrics: {
        learningProgress: { percentage: 0, completedVideos: 0, totalVideos: 106, subtitle: "0/106 videos completed" },
        resumeReadiness: { percentage: 0, subtitle: "No upload yet" },
        aiCareerHealth: { percentage: 23, subtitle: "Progressing well" },
        interviewReadiness: { isLocked: true, subtitle: "Currently Locked" },
      },
      upcoming: [
        { id: "1", title: "Mock Interview", subtitle: "Behavioral Round", date: "May 24, 5:00 PM", type: "calendar" },
        { id: "2", title: "System Design", subtitle: "Rate Limiter Design", date: "May 26, 7:00 PM", type: "system" },
        { id: "3", title: "DSA Practice", subtitle: "Arrays & Hashing", date: "May 26, 6:00 PM", type: "code" },
      ],
      practiceOverview: {
        problemsSolved: 117, successRate: 91, contests: 0,
        chartData: [
          { day: "Mon", solved: 12 }, { day: "Tue", solved: 19 }, { day: "Wed", solved: 15 },
          { day: "Thu", solved: 28 }, { day: "Fri", solved: 22 }, { day: "Sat", solved: 31 }, { day: "Sun", solved: 25 },
        ],
      },
    };
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
    return { reply: "I am your SkillPath AI Mentor powered by Groq. Please start the FastAPI backend to interact live!" };
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
  const params = new URLSearchParams({ query, level, language, max_results: String(max_results) });
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

export async function savePlaylist(playlist: Playlist, skillQuery: string, userId = "default_user") {
  const body = {
    playlist_id: playlist.id,
    title: playlist.title,
    channel: playlist.channel,
    description: playlist.description,
    level: playlist.level,
    video_count: playlist.video_count,
    duration: playlist.duration,
    playlist_url: playlist.playlist_url,
    thumbnail: playlist.thumbnail,
    source: playlist.source,
    skill_query: skillQuery,
    user_id: userId,
  };
  try {
    const res = await fetch(`${API_BASE}/api/learning/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    console.warn("Save playlist failed:", e);
    return null;
  }
}

export async function unsavePlaylist(playlistId: string, userId = "default_user") {
  try {
    const res = await fetch(`${API_BASE}/api/learning/save/${playlistId}?user_id=${userId}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    console.warn("Unsave playlist failed:", e);
    return null;
  }
}

export async function fetchSavedPlaylists(userId = "default_user"): Promise<{ saved: Playlist[]; count: number }> {
  try {
    const res = await fetch(`${API_BASE}/api/learning/saved?user_id=${userId}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    console.warn("Fetch saved playlists failed:", e);
    return { saved: [], count: 0 };
  }
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

export async function fetchPlaylistVideos(
  playlistId: string,
  userId = "default_user"
): Promise<{ videos: PlaylistVideo[]; count: number }> {
  try {
    const res = await fetch(
      `${API_BASE}/api/learning/playlist-videos?playlist_id=${encodeURIComponent(playlistId)}&user_id=${userId}`,
      { cache: "no-store" }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    console.warn("Fetch playlist videos failed:", e);
    return { videos: [], count: 0 };
  }
}

export async function markVideoWatched(
  userId: string,
  playlistId: string,
  videoId: string,
  watched: boolean
): Promise<void> {
  try {
    await fetch(`${API_BASE}/api/learning/video-progress`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, playlist_id: playlistId, video_id: videoId, watched }),
    });
  } catch (e) {
    console.warn("Mark video watched failed:", e);
  }
}

/**
 * Periodic resume save (every 10 s while playing).
 * Updates last_position + watch_time WITHOUT touching the `watched` flag.
 */
export async function saveVideoProgress(
  userId: string,
  playlistId: string,
  videoId: string,
  lastPosition: number,
  watchTime: number,
): Promise<void> {
  try {
    await fetch(`${API_BASE}/api/learning/save-progress`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id:       userId,
        playlist_id:   playlistId,
        video_id:      videoId,
        last_position: lastPosition,
        watch_time:    Math.round(watchTime),
      }),
    });
  } catch {
    // Non-critical — fail silently to avoid disrupting playback
  }
}

/**
 * Auto-completion endpoint.
 * Called by useYouTubePlayer when ≥95% of the video is genuinely watched.
 * Returns updated playlist statistics for instant UI refresh.
 */
export async function completeVideo(
  userId: string,
  playlistId: string,
  videoId: string,
  watchTime: number,
): Promise<{ success: boolean; completed_at?: string; playlist_stats?: { completed_videos: number } }> {
  try {
    const res = await fetch(`${API_BASE}/api/learning/complete-video`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id:     userId,
        playlist_id: playlistId,
        video_id:    videoId,
        watch_time:  Math.round(watchTime),
        completed:   true,
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    console.warn("completeVideo failed:", e);
    return { success: false };
  }
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
    const res = await fetch(`${API_BASE}/api/profile`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    console.warn("Failed to fetch profile data:", e);
    return null;
  }
}

export async function saveAcademicProfile(data: AcademicProfile) {
  try {
    const res = await fetch(`${API_BASE}/api/profile/academic`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    console.warn("Failed to save academic profile:", e);
    return null;
  }
}

export async function saveCodingProfiles(data: CodingProfilesInput) {
  try {
    const res = await fetch(`${API_BASE}/api/profile/coding`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    console.warn("Failed to save coding profiles:", e);
    return null;
  }
}
