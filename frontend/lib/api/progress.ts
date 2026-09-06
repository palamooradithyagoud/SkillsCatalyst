import { supabase } from "@/lib/supabase";
import { API_BASE, apiFetch, getAuthHeaders, getRawGuestSessionId } from "./client";
import { cleanPlaylistId } from "./learning";

export async function markVideoWatched(
  playlistId: string,
  videoId: string,
  watched: boolean
): Promise<void> {
  const cleanId = cleanPlaylistId(playlistId);
  const sessionId = getRawGuestSessionId();

  // 1. Save to Supabase via FastAPI backend
  try {
    const authHeaders = await getAuthHeaders();
    await apiFetch(`${API_BASE}/api/learning/video-progress`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders },
      body: JSON.stringify({
        playlist_id: cleanId,
        video_id: videoId,
        watched: watched,
      }),
    });
  } catch (e) {
    console.warn("Backend markVideoWatched failed:", e);
  }

  // 2. Direct Supabase DB Client write (video_progress table)
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const targetUserId = session?.user?.id;
    if (targetUserId) {
      const row = {
        user_id: targetUserId,
        playlist_id: cleanId,
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

  // 3. Direct Supabase DB Client write (learning_progress JSONB table)
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const sid = session?.user?.id || sessionId;
    const { data: lpData } = await supabase
      .from("learning_progress")
      .select("completed_steps")
      .eq("session_id", sid)
      .eq("skill_name", "saved_playlists")
      .limit(1);

    if (lpData && lpData.length > 0) {
      const playlists = lpData[0].completed_steps || [];
      const plIndex = playlists.findIndex((p: any) => (p.id || p.playlist_id) === cleanId || (p.id || p.playlist_id) === playlistId);
      if (plIndex !== -1) {
        const pl = playlists[plIndex];
        const videos = pl.videos || [];
        const vIdx = videos.findIndex((v: any) => (v.videoId || v.id) === videoId);
        if (vIdx !== -1) {
          videos[vIdx].watched = watched;
          videos[vIdx].completed = watched;
          videos[vIdx].completedAt = watched ? new Date().toISOString() : null;
        } else {
          videos.push({
            videoId,
            id: videoId,
            watched,
            completed: watched,
            completedAt: watched ? new Date().toISOString() : null,
          });
        }
        playlists[plIndex].videos = videos;

        const totalV = videos.length;
        const compV = videos.filter((v: any) => v.watched || v.completed).length;
        const pct = totalV > 0 ? Math.round((compV / totalV) * 10000) / 100 : 0;

        await supabase.from("learning_progress").upsert({
          session_id: sid,
          user_id: session?.user?.id || null,
          skill_name: "saved_playlists",
          completed_steps: playlists,
          completion_pct: pct,
          updated_at: new Date().toISOString()
        }, { onConflict: "session_id,skill_name" });
      }
    }
  } catch (e) {
    console.warn("Mark video watched in learning_progress JSONB failed:", e);
  }
}

/**
 * Periodic resume save.
 * Delegates to ProgressRepository for immediate LocalStorage persistence
 * and debounced/immediate remote sync to FastAPI + Supabase.
 */
export async function saveVideoProgress(
  playlistId: string,
  videoId: string,
  lastPosition: number,
  watchTime: number,
  immediate = false,
): Promise<void> {
  try {
    const { syncVideoProgress } = await import("@/lib/progressRepository");
    await syncVideoProgress(
      {
        playlistId,
        videoId,
        lastPosition,
        watchTime,
      },
      immediate
    );
  } catch (e) {
    console.warn("saveVideoProgress delegate error:", e);
  }
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
  const cleanId = cleanPlaylistId(playlistId);
  const sessionId = getRawGuestSessionId();
  const nowIso = new Date().toISOString();

  try {
    const authHeaders = await getAuthHeaders();
    const res = await apiFetch(`${API_BASE}/api/learning/complete-video`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders },
      body: JSON.stringify({
        playlist_id: cleanId,
        video_id: videoId,
        watch_time: Math.round(watchTime),
      }),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn("Backend completeVideo failed:", e);
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    const targetUserId = session?.user?.id;
    if (targetUserId) {
      const row = {
        user_id: targetUserId,
        playlist_id: cleanId,
        video_id: videoId,
        watched: true,
        watch_time: Math.round(watchTime),
        completed_at: nowIso,
        updated_at: nowIso,
      };
      await supabase
        .from("video_progress")
        .upsert(row, { onConflict: "user_id,playlist_id,video_id" });
    }
  } catch (e) {
    console.warn("completeVideo DB failed:", e);
  }

  // Direct update to learning_progress JSONB table
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const sid = session?.user?.id || sessionId;
    const { data: lpData } = await supabase
      .from("learning_progress")
      .select("completed_steps")
      .eq("session_id", sid)
      .eq("skill_name", "saved_playlists")
      .limit(1);

    if (lpData && lpData.length > 0) {
      const playlists = lpData[0].completed_steps || [];
      const plIndex = playlists.findIndex((p: any) => (p.id || p.playlist_id) === cleanId || (p.id || p.playlist_id) === playlistId);
      if (plIndex !== -1) {
        const pl = playlists[plIndex];
        const videos = pl.videos || [];
        const vIdx = videos.findIndex((v: any) => (v.videoId || v.id) === videoId);
        if (vIdx !== -1) {
          videos[vIdx].watched = true;
          videos[vIdx].completed = true;
          videos[vIdx].completedAt = nowIso;
        } else {
          videos.push({
            videoId,
            id: videoId,
            watched: true,
            completed: true,
            completedAt: nowIso,
          });
        }
        playlists[plIndex].videos = videos;

        await supabase.from("learning_progress").upsert({
          session_id: sid,
          user_id: session?.user?.id || null,
          skill_name: "saved_playlists",
          completed_steps: playlists,
          updated_at: nowIso
        }, { onConflict: "session_id,skill_name" });
      }
    }
  } catch (e) {
    console.warn("completeVideo learning_progress failed:", e);
  }

  return { success: true, completed_at: nowIso };
}

export async function markAllVideosWatched(
  playlistId: string,
  watched: boolean = true
): Promise<{ success: boolean; count: number }> {
  try {
    const authHeaders = await getAuthHeaders();
    if (authHeaders.Authorization) {
      const res = await apiFetch(`${API_BASE}/api/learning/mark-all-watched`, {
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
