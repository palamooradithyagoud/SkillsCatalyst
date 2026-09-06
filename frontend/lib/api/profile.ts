import { supabase } from "@/lib/supabase";
import { API_BASE, apiFetch, getAuthHeaders } from "./client";

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
      apiFetch(`${API_BASE}/api/profile/academic`, {
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
        const res = await apiFetch(`${API_BASE}/api/profile/coding`, {
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

/**
 * Dispatches or synchronizes a one-time welcome email for newly registered users.
 * Transmits the authenticated Supabase access token in Authorization header.
 */
export async function sendWelcomeEmail(payload: {
  is_signup?: boolean;
  full_name?: string;
  email?: string;
  user_id?: string;
} = {}): Promise<{ success: boolean; status?: string; message?: string; error?: string }> {
  try {
    const { data } = await supabase.auth.getSession();
    const token = data?.session?.access_token;
    if (!token) {
      return { success: false, error: "No active session token" };
    }

    const res = await fetch(`${API_BASE}/api/auth/welcome-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        is_signup: payload.is_signup ?? false,
        full_name: payload.full_name,
      }),
    });
    if (!res.ok) {
      return { success: false, error: `HTTP ${res.status}` };
    }
    return await res.json();
  } catch (err: any) {
    console.warn("Welcome email dispatch warning:", err);
    return { success: false, error: err?.message || String(err) };
  }
}

// ── Daily Login Streak & Dynamic Level Engine ────────────────────────────────

/**
 * Returns YYYY-MM-DD string in the user's local timezone.
 */
export function getLocalCalendarDateStr(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Syncs the user's daily login streak against Supabase user_progress.
 * - If user logged in today: maintains streak.
 * - If user logged in yesterday: increments streak.
 * - If user missed a day or is logging in for first time: sets streak to 1.
 */
export async function syncDailyLoginStreak(userId: string): Promise<number> {
  if (!userId) return 0;

  const todayStr = getLocalCalendarDateStr(new Date());
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = getLocalCalendarDateStr(yesterdayDate);

  const LS_STREAK = `sc_daily_streak_${userId}`;
  const LS_LAST_LOGIN = `sc_last_login_date_${userId}`;

  let currentStreak = 0;
  let lastLoginDate: string | null = null;

  try {
    const cachedStreak = localStorage.getItem(LS_STREAK);
    const cachedDate = localStorage.getItem(LS_LAST_LOGIN);
    if (cachedStreak) currentStreak = parseInt(cachedStreak, 10) || 0;
    if (cachedDate) lastLoginDate = cachedDate;
  } catch {}

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const hasAuthSession = sessionData?.session?.user?.id === userId;

    if (hasAuthSession) {
      const { data, error } = await supabase
        .from("user_progress")
        .select("streak_days, last_login_date")
        .eq("user_id", userId)
        .maybeSingle();

      if (!error && data) {
        if (typeof data.streak_days === "number") currentStreak = data.streak_days;
        if (data.last_login_date) lastLoginDate = data.last_login_date;
      }
    }

    let nextStreak = currentStreak;

    if (lastLoginDate === todayStr) {
      // Already logged in today
      nextStreak = Math.max(1, currentStreak);
    } else if (lastLoginDate === yesterdayStr) {
      // Logged in yesterday -> streak increments!
      nextStreak = (currentStreak > 0 ? currentStreak : 0) + 1;
    } else {
      // Streak broken or first login today -> starts at 1
      nextStreak = 1;
    }

    // Persist to Supabase only if authenticated
    if (hasAuthSession) {
      await supabase.from("user_progress").upsert(
        {
          user_id: userId,
          streak_days: nextStreak,
          last_login_date: todayStr,
          last_active_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );
    }

    try {
      localStorage.setItem(LS_STREAK, String(nextStreak));
      localStorage.setItem(LS_LAST_LOGIN, todayStr);
    } catch {}

    return nextStreak;
  } catch (err) {
    console.warn("Error syncing daily login streak:", err);
    return Math.max(0, currentStreak);
  }
}

export interface BadgeItem {
  id: string;
  name: string;
  desc: string;
  icon: string;
  unlocked: boolean;
  category: "practice" | "learning" | "streak" | "level";
  progressText?: string;
}

export interface UserProgressStats {
  streakDays: number;
  badgesCount: number;
  questionsSolved: number;
  completedVideos: number;
  completedRoadmaps: number;
  totalXP: number;
  level: number;
  currentLevelXP: number;
  nextLevelXP: number;
  xpPercent: number;
  badges: BadgeItem[];
}

/**
 * Fetches accurate progress statistics starting from 0 for all users:
 * - Questions solved: Strictly counts ticked questions in practice (leetcode_progress status = 'solved').
 * - Videos completed: Counts watched saved videos (video_progress watched = true).
 * - Roadmaps completed: Counts completed roadmap topics (roadmap_progress).
 * - Streak: Daily login streak tracked by calendar day.
 * - XP & Levels: Dynamically computed from videos, questions, and roadmaps.
 * - Badges: Evaluated dynamically from real achievements.
 */
export async function fetchUserProgressStats(
  userId: string,
  hasConnectedProfile: boolean = false
): Promise<UserProgressStats> {
  const defaultStats: UserProgressStats = {
    streakDays: 0,
    badgesCount: 0,
    questionsSolved: 0,
    completedVideos: 0,
    completedRoadmaps: 0,
    totalXP: 0,
    level: 0,
    currentLevelXP: 0,
    nextLevelXP: 100,
    xpPercent: 0,
    badges: [],
  };

  if (!userId) return defaultStats;

  // 1. Fetch ticked questions from practice (leetcode_progress)
  let dbSolved = 0;
  try {
    const { count } = await supabase
      .from("leetcode_progress")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "solved");
    if (typeof count === "number") dbSolved = count;
  } catch (err) {
    console.warn("Failed to fetch leetcode_progress count:", err);
  }

  // Local storage fallback for ticked practice questions
  let localSolved = 0;
  try {
    const savedSolved = localStorage.getItem(`skillscatalyst_solved_questions_${userId}`);
    if (savedSolved) {
      const parsed = JSON.parse(savedSolved);
      localSolved = Object.keys(parsed).filter((k) => !!parsed[k]).length;
    }
  } catch {}

  const questionsSolved = Math.max(dbSolved, localSolved);

  // 2. Fetch watched saved videos (video_progress)
  let dbVideos = 0;
  try {
    const { count } = await supabase
      .from("video_progress")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("watched", true);
    if (typeof count === "number") dbVideos = count;
  } catch (err) {
    console.warn("Failed to fetch video_progress count:", err);
  }

  let localVideos = 0;
  try {
    const savedVideos = localStorage.getItem(`skillscatalyst_video_progress_${userId}`);
    if (savedVideos) {
      const parsed = JSON.parse(savedVideos);
      localVideos = Object.keys(parsed).filter((k) => !!parsed[k]?.watched).length;
    }
  } catch {}

  const completedVideos = Math.max(dbVideos, localVideos);

  // 3. Fetch completed roadmap topics (roadmap_progress)
  let dbRoadmaps = 0;
  try {
    const { count } = await supabase
      .from("roadmap_progress")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "completed")
      .neq("node_id", "_roadmap_started");
    if (typeof count === "number") dbRoadmaps = count;
  } catch (err) {
    console.warn("Failed to fetch roadmap_progress count:", err);
  }

  let localRoadmaps = 0;
  try {
    const savedNodes = localStorage.getItem("skillscatalyst_completed_roadmap_nodes");
    if (savedNodes) {
      const parsed = JSON.parse(savedNodes);
      if (Array.isArray(parsed)) localRoadmaps = parsed.length;
    }
  } catch {}

  const completedRoadmaps = Math.max(dbRoadmaps, localRoadmaps);

  // 4. Sync Daily Login Streak
  const streakDays = await syncDailyLoginStreak(userId);

  // 5. Calculate XP and Level
  // 50 XP per ticked question, 25 XP per watched video, 50 XP per completed roadmap topic
  const totalXP = (completedVideos * 25) + (questionsSolved * 50) + (completedRoadmaps * 50);
  const XP_PER_LEVEL = 100;
  const level = Math.floor(totalXP / XP_PER_LEVEL);
  const currentLevelXP = totalXP % XP_PER_LEVEL;
  const nextLevelXP = XP_PER_LEVEL;
  const xpPercent = Math.min(100, Math.round((currentLevelXP / nextLevelXP) * 100));

  // 6. Asynchronously update Supabase user_progress record
  try {
    await supabase.from("user_progress").upsert(
      {
        user_id: userId,
        problems_solved: questionsSolved,
        total_xp: totalXP,
        level: level,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );
  } catch {}

  // 7. Dynamic Badge Unlocking (Starts at 0 if no requirements met)
  const badges: BadgeItem[] = [
    {
      id: "first_problem",
      name: "Code Starter",
      desc: "Solve your first practice question",
      icon: "💻",
      unlocked: questionsSolved >= 1,
      category: "practice",
      progressText: `${Math.min(questionsSolved, 1)}/1 solved`,
    },
    {
      id: "five_problems",
      name: "Problem Solver",
      desc: "Solve 5 practice questions",
      icon: "⚡",
      unlocked: questionsSolved >= 5,
      category: "practice",
      progressText: `${Math.min(questionsSolved, 5)}/5 solved`,
    },
    {
      id: "fifteen_problems",
      name: "Algo Apprentice",
      desc: "Solve 15 practice questions",
      icon: "🧠",
      unlocked: questionsSolved >= 15,
      category: "practice",
      progressText: `${Math.min(questionsSolved, 15)}/15 solved`,
    },
    {
      id: "thirty_problems",
      name: "DSA Master",
      desc: "Solve 30 practice questions",
      icon: "👑",
      unlocked: questionsSolved >= 30,
      category: "practice",
      progressText: `${Math.min(questionsSolved, 30)}/30 solved`,
    },
    {
      id: "first_video",
      name: "Curious Mind",
      desc: "Complete your first saved video",
      icon: "🎬",
      unlocked: completedVideos >= 1,
      category: "learning",
      progressText: `${Math.min(completedVideos, 1)}/1 watched`,
    },
    {
      id: "five_videos",
      name: "Video Scholar",
      desc: "Complete 5 saved videos",
      icon: "📺",
      unlocked: completedVideos >= 5,
      category: "learning",
      progressText: `${Math.min(completedVideos, 5)}/5 watched`,
    },
    {
      id: "first_roadmap",
      name: "Pathfinder",
      desc: "Complete your first roadmap topic",
      icon: "🗺️",
      unlocked: completedRoadmaps >= 1,
      category: "learning",
      progressText: `${Math.min(completedRoadmaps, 1)}/1 topic`,
    },
    {
      id: "five_roadmaps",
      name: "Trailblazer",
      desc: "Complete 5 roadmap topics",
      icon: "🚀",
      unlocked: completedRoadmaps >= 5,
      category: "learning",
      progressText: `${Math.min(completedRoadmaps, 5)}/5 topics`,
    },
    {
      id: "streak_3",
      name: "Habit Builder",
      desc: "Maintain a 3-day daily login streak",
      icon: "🔥",
      unlocked: streakDays >= 3,
      category: "streak",
      progressText: `${Math.min(streakDays, 3)}/3 days`,
    },
    {
      id: "streak_7",
      name: "Weekly Champion",
      desc: "Maintain a 7-day daily login streak",
      icon: "🌟",
      unlocked: streakDays >= 7,
      category: "streak",
      progressText: `${Math.min(streakDays, 7)}/7 days`,
    },
    {
      id: "streak_14",
      name: "Unstoppable",
      desc: "Maintain a 14-day daily login streak",
      icon: "🛡️",
      unlocked: streakDays >= 14,
      category: "streak",
      progressText: `${Math.min(streakDays, 14)}/14 days`,
    },
    {
      id: "level_1",
      name: "Level 1 Achiever",
      desc: "Reach Level 1 (Earn 100 XP)",
      icon: "✨",
      unlocked: level >= 1,
      category: "level",
      progressText: `${Math.min(totalXP, 100)}/100 XP`,
    },
    {
      id: "level_5",
      name: "Veteran Learner",
      desc: "Reach Level 5 (Earn 500 XP)",
      icon: "🏅",
      unlocked: level >= 5,
      category: "level",
      progressText: `${Math.min(totalXP, 500)}/500 XP`,
    },
    {
      id: "profile_linked",
      name: "Profile Connected",
      desc: "Connect at least 1 coding profile",
      icon: "🔗",
      unlocked: hasConnectedProfile,
      category: "practice",
      progressText: hasConnectedProfile ? "Connected" : "0/1 linked",
    },
  ];

  const badgesCount = badges.filter((b) => b.unlocked).length;

  return {
    streakDays,
    badgesCount,
    questionsSolved,
    completedVideos,
    completedRoadmaps,
    totalXP,
    level,
    currentLevelXP,
    nextLevelXP,
    xpPercent,
    badges,
  };
}
