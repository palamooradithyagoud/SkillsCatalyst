import { supabase } from "@/lib/supabase";
import { API_BASE, apiFetch, getAuthHeaders } from "./client";
import { getActivePlaylistTotal } from "./roadmaps";

export async function fetchDashboardData() {
  try {
    const authHeaders = await getAuthHeaders();
    if (authHeaders.Authorization) {
      const res = await apiFetch(`${API_BASE}/api/dashboard`, {
        headers: { ...authHeaders },
        cache: "no-store",
      });
      if (res.ok) {
        const json = await res.json();
        if (json && json.metrics) {
          return await mergeLocalDashboardMetrics(json);
        }
      }
    }
  } catch (error) {
    console.warn("Backend fetchDashboardData failed, using Supabase/LocalStorage fallback:", error);
  }

  return await getFallbackDashboardData();
}

async function mergeLocalDashboardMetrics(backendData: any) {
  if (!backendData || !backendData.metrics) return backendData;
  backendData.metrics.roadmapProgress = {
    has_active_roadmap: false,
    roadmaps: [],
    count: 0,
    percentage: 0,
    subtitle: "No active roadmap",
    roadmapName: "",
    nextTopic: "",
    roadmapId: null,
  };
  return backendData;
}

async function getFallbackDashboardData() {
  let savedPlaylistsCount = 0;
  let totalVideos = 0;
  let completedCount = 0;
  let resumeScore = 0;
  let streakDays = 0;
  let userName = "Learner";
  let userId = "";

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      userName = session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "Learner";
      userId = session.user.id;

      // Query saved playlists for dynamic total video counts
      const { data: savedData } = await supabase
        .from("saved_playlists")
        .select("video_count")
        .eq("user_id", userId);

      if (savedData && savedData.length > 0) {
        savedPlaylistsCount = savedData.length;
        for (const row of savedData) {
          const match = String(row.video_count || "0").match(/\d+/);
          if (match) totalVideos += parseInt(match[0], 10);
        }
      }

      // Query completed video progress
      const { data: progData } = await supabase
        .from("video_progress")
        .select("video_id, playlist_id")
        .eq("user_id", userId)
        .eq("watched", true);

      if (progData) {
        completedCount = progData.length;
      }

      // Query latest resume score
      const { data: resumeData } = await supabase
        .from("resume_scores")
        .select("overall_score, ats_compatibility_score")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1);

      if (resumeData && resumeData.length > 0) {
        const sc = resumeData[0].overall_score ?? resumeData[0].ats_compatibility_score;
        if (sc !== null && sc !== undefined && !isNaN(Number(sc))) {
          resumeScore = Math.round(Number(sc));
        }
      }

      // Query streak days from user_progress
      const { data: progRow } = await supabase
        .from("user_progress")
        .select("streak_days")
        .eq("user_id", userId)
        .maybeSingle();

      if (progRow && typeof progRow.streak_days === "number") {
        streakDays = progRow.streak_days;
      }
    }
  } catch (e) {
    console.warn("Supabase dashboard fallback error:", e);
  }

  // Guest / unauthenticated fallback only: do not leak guest scores into authenticated accounts
  if (!userId && typeof window !== "undefined") {
    const localResumeScoreRaw = localStorage.getItem("skillscatalyst_latest_resume_score");
    if (localResumeScoreRaw && resumeScore === 0) {
      const lScore = parseInt(localResumeScoreRaw, 10);
      if (!isNaN(lScore) && lScore >= 0 && lScore <= 100) {
        resumeScore = lScore;
      }
    }
  }

  const activeTotal = getActivePlaylistTotal();
  if (activeTotal > totalVideos) {
    totalVideos = activeTotal;
  }

  if (totalVideos > 0 && completedCount > totalVideos) {
    totalVideos = completedCount;
  }

  const pct = totalVideos > 0 ? Math.round((completedCount / totalVideos) * 100) : 0;
  const subtitle = totalVideos > 0 ? `${completedCount}/${totalVideos} videos completed` : `${completedCount} video${completedCount !== 1 ? "s" : ""} completed`;

  const resumeSubtitle = resumeScore > 0 ? `ATS Score: ${resumeScore}/100` : "No upload yet";

  return {
    user: {
      name: userName,
      status: "ACTIVE",
      streakDays: streakDays,
    },
    metrics: {
      learningProgress: {
        percentage: pct,
        completedVideos: completedCount,
        totalVideos: totalVideos,
        subtitle: subtitle,
      },
      roadmapProgress: {
        has_active_roadmap: false,
        roadmaps: [],
        count: 0,
        percentage: 0,
        subtitle: "No active roadmap",
        roadmapName: "",
        nextTopic: "",
        roadmapId: null,
      },
      resumeReadiness: {
        percentage: resumeScore,
        subtitle: resumeSubtitle,
      },
      interviewReadiness: {
        isLocked: true,
        subtitle: "Currently Locked",
      },
    },
    practiceOverview: {
      problemsSolved: 0,
      successRate: 0,
      contests: 0,
      chartData: [
        { day: "Mon", solved: 0 },
        { day: "Tue", solved: 0 },
        { day: "Wed", solved: 0 },
        { day: "Thu", solved: 0 },
        { day: "Fri", solved: 0 },
        { day: "Sat", solved: 0 },
        { day: "Sun", solved: 0 },
      ],
    },
  };
}
