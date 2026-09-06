import { supabase } from "@/lib/supabase";
import { API_BASE, apiFetch, getAuthHeaders, getRawGuestSessionId } from "./client";
import { cleanPlaylistId, Playlist } from "./learning";
import { saveActivePlaylistTotal } from "./roadmaps";

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

export async function savePlaylist(playlist: Playlist, skillQuery: string) {
  const cleanId = cleanPlaylistId(playlist.id);
  const row = {
    playlist_id: cleanId || playlist.id,
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

  const sessionId = getRawGuestSessionId();

  // 1. Save via FastAPI backend
  try {
    const authHeaders = await getAuthHeaders();
    await apiFetch(`${API_BASE}/api/learning/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders },
      body: JSON.stringify(row),
    });
  } catch (e) {
    console.warn("Backend save playlist failed:", e);
  }

  // 2. Direct Supabase DB write (saved_playlists table)
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const targetUserId = session?.user?.id;
    if (targetUserId) {
      await supabase
        .from("saved_playlists")
        .upsert({ ...row, user_id: targetUserId }, { onConflict: "user_id,playlist_id" });
    }
  } catch (e) {
    console.warn("Save playlist to Supabase DB failed:", e);
  }

  // 3. Direct Supabase DB write (learning_progress JSONB table - supports both auth user & guest session)
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const sid = session?.user?.id || sessionId;
    const { data: existingLp } = await supabase
      .from("learning_progress")
      .select("completed_steps")
      .eq("session_id", sid)
      .eq("skill_name", "saved_playlists")
      .limit(1);

    const steps = existingLp && existingLp.length > 0 ? existingLp[0].completed_steps || [] : [];
    if (!steps.some((p: any) => (p.id || p.playlist_id) === row.playlist_id)) {
      steps.push({ ...row, id: row.playlist_id, completed: false, videos: [] });
      await supabase.from("learning_progress").upsert({
        session_id: sid,
        user_id: session?.user?.id || null,
        skill_name: "saved_playlists",
        completed_steps: steps,
        updated_at: new Date().toISOString()
      }, { onConflict: "session_id,skill_name" });
    }
  } catch (e) {
    console.warn("Save playlist to learning_progress JSONB failed:", e);
  }

  return { success: true };
}

export async function syncSavedPlaylists(playlists: any[]): Promise<{ success: boolean; completion_pct?: number }> {
  try {
    const authHeaders = await getAuthHeaders();
    const res = await apiFetch(`${API_BASE}/api/learning/sync-saved-playlists`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders },
      body: JSON.stringify({ playlists }),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn("Backend syncSavedPlaylists failed:", e);
  }

  try {
    const sessionId = getRawGuestSessionId();
    const { data: { session } } = await supabase.auth.getSession();
    const sid = session?.user?.id || sessionId;

    const totalVideos = playlists.reduce((acc, p) => acc + (p.videos?.length || 0), 0);
    const completedVideos = playlists.reduce((acc, p) => acc + (p.videos?.filter((v: any) => v.completed || v.watched)?.length || 0), 0);
    const pct = totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 10000) / 100 : 0;

    await supabase.from("learning_progress").upsert({
      session_id: sid,
      user_id: session?.user?.id || null,
      skill_name: "saved_playlists",
      completed_steps: playlists,
      completion_pct: pct,
      updated_at: new Date().toISOString()
    }, { onConflict: "session_id,skill_name" });

    return { success: true, completion_pct: pct };
  } catch (e) {
    console.warn("Supabase syncSavedPlaylists failed:", e);
  }
  return { success: false };
}

export async function unsavePlaylist(playlistId: string) {
  const cleanId = cleanPlaylistId(playlistId);

  try {
    const authHeaders = await getAuthHeaders();
    await apiFetch(`${API_BASE}/api/learning/save/${encodeURIComponent(cleanId)}`, {
      method: "DELETE",
      headers: { ...authHeaders },
    });
  } catch (e) {
    console.warn("Backend unsave playlist failed:", e);
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.id) {
      await supabase
        .from("saved_playlists")
        .delete()
        .eq("user_id", session.user.id)
        .or(`playlist_id.eq.${cleanId},playlist_id.eq.${playlistId}`);
    }
  } catch (e) {
    console.warn("Unsave playlist from Supabase DB failed:", e);
  }

  try {
    const sessionId = getRawGuestSessionId();
    const { data: { session } } = await supabase.auth.getSession();
    const sid = session?.user?.id || sessionId;
    const { data: lpData } = await supabase
      .from("learning_progress")
      .select("completed_steps")
      .eq("session_id", sid)
      .eq("skill_name", "saved_playlists")
      .limit(1);

    if (lpData && lpData.length > 0) {
      const steps = (lpData[0].completed_steps || []).filter(
        (p: any) => (p.id || p.playlist_id) !== cleanId && (p.id || p.playlist_id) !== playlistId
      );
      await supabase.from("learning_progress").upsert({
        session_id: sid,
        user_id: session?.user?.id || null,
        skill_name: "saved_playlists",
        completed_steps: steps,
        updated_at: new Date().toISOString()
      }, { onConflict: "session_id,skill_name" });
    }
  } catch (e) {
    console.warn("Unsave playlist from learning_progress failed:", e);
  }

  return { success: true };
}

export async function fetchSavedPlaylists(): Promise<{ saved: Playlist[]; count: number }> {
  let backendSaved: Playlist[] = [];
  const sessionId = getRawGuestSessionId();

  // 1. Primary: Fetch saved playlists from Supabase via FastAPI backend API
  try {
    const authHeaders = await getAuthHeaders();
    const res = await apiFetch(`${API_BASE}/api/learning/saved`, {
      headers: { ...authHeaders },
      cache: "no-store",
    });
    if (res.ok) {
      const json = await res.json();
      if (json.saved && Array.isArray(json.saved) && json.saved.length > 0) {
        return { saved: json.saved, count: json.saved.length };
      }
    }
  } catch (e) {
    console.warn("Fetch saved playlists from backend failed:", e);
  }

  // 2. Direct Supabase DB Query (saved_playlists table)
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const targetUserId = session?.user?.id;
    if (targetUserId) {
      const { data } = await supabase
        .from("saved_playlists")
        .select("*")
        .eq("user_id", targetUserId)
        .order("created_at", { ascending: false });

      if (data && data.length > 0) {
        backendSaved = data.map((row: any) => ({
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
      }
    }
  } catch (e) {
    console.warn("Fetch saved playlists from Supabase DB failed:", e);
  }

  // 3. Direct Supabase DB Query (learning_progress JSONB table - supports both auth user & guest session)
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
      const jsonbItems = lpData[0].completed_steps || [];
      const seenIds = new Set(backendSaved.map((p) => p.id));
      for (const item of jsonbItems) {
        const itemId = item.id || item.playlist_id;
        if (itemId && !seenIds.has(itemId)) {
          seenIds.add(itemId);
          backendSaved.push({
            id:           itemId,
            title:        item.title || "Untitled Playlist",
            channel:      item.channel || "",
            description:  item.description || "",
            level:        item.level || "all",
            video_count:  item.video_count || "?",
            duration:     item.duration || "?",
            playlist_url: item.playlist_url || "",
            thumbnail:    item.thumbnail || "",
            source:       item.source || "youtube",
            skill_query:  item.skill_query || "",
            created_at:   item.created_at || "",
          });
        }
      }
    }
  } catch (e) {
    console.warn("Fetch saved playlists from learning_progress failed:", e);
  }

  return { saved: backendSaved, count: backendSaved.length };
}

export async function fetchPlaylistVideos(
  playlistId: string,
): Promise<{ videos: PlaylistVideo[]; count: number }> {
  const cleanId = cleanPlaylistId(playlistId);
  const sessionId = getRawGuestSessionId();
  let resultVideos: PlaylistVideo[] = [];

  // 1. Primary: Fetch full YouTube playlist items + merged progress from Supabase via FastAPI backend API
  try {
    const authHeaders = await getAuthHeaders();
    const res = await apiFetch(
      `${API_BASE}/api/learning/playlist-videos?playlist_id=${encodeURIComponent(cleanId)}`,
      { headers: { ...authHeaders }, cache: "no-store" }
    );
    if (res.ok) {
      const json = await res.json();
      if (json.videos && Array.isArray(json.videos) && json.videos.length > 0) {
        saveActivePlaylistTotal(json.videos.length);
        resultVideos = json.videos;
      }
    }
  } catch (e) {
    console.warn("Fetch playlist videos from backend failed:", e);
  }

  // 2. Direct Supabase DB Query (video_progress table)
  if (resultVideos.length === 0) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const targetUserId = session?.user?.id;
      if (targetUserId) {
        const { data } = await supabase
          .from("video_progress")
          .select("*")
          .eq("user_id", targetUserId)
          .or(`playlist_id.eq.${cleanId},playlist_id.eq.${playlistId}`);

        if (data && data.length > 0) {
          resultVideos = data.map((row: any, idx: number) => ({
            videoId: row.video_id,
            title: `Video ${idx + 1}`,
            position: idx + 1,
            thumbnail: "",
            watched: !!row.watched,
            last_position: row.last_position || 0,
            watch_time: row.watch_time || 0,
            completed_at: row.completed_at || null,
          }));
        }
      }
    } catch (e) {
      console.warn("Fetch playlist videos fallback failed:", e);
    }
  }

  // 3. Always merge watched status from learning_progress JSONB table (guest & auth session)
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
      const match = playlists.find((p: any) => (p.id || p.playlist_id) === cleanId || (p.id || p.playlist_id) === playlistId);
      if (match && match.videos && match.videos.length > 0) {
        const lpMap = new Map<string, any>();
        match.videos.forEach((v: any) => {
          const vidKey = v.videoId || v.id;
          if (vidKey) lpMap.set(vidKey, v);
        });

        if (resultVideos.length > 0) {
          resultVideos = resultVideos.map((v) => {
            const lpv = lpMap.get(v.videoId);
            if (lpv) {
              return {
                ...v,
                watched: v.watched || !!(lpv.completed || lpv.watched),
                last_position: Math.max(v.last_position || 0, lpv.lastPosition || lpv.last_position || 0),
                watch_time: Math.max(v.watch_time || 0, lpv.watchTime || lpv.watch_time || 0),
              };
            }
            return v;
          });
        } else {
          resultVideos = match.videos.map((v: any, idx: number) => ({
            videoId: v.videoId || v.id || String(idx + 1),
            title: v.title || `Video ${idx + 1}`,
            position: idx + 1,
            thumbnail: v.thumbnail || "",
            watched: !!(v.completed || v.watched),
            last_position: v.lastPosition || v.last_position || 0,
            watch_time: v.watchTime || v.watch_time || 0,
            completed_at: v.completedAt || v.completed_at || null,
          }));
        }
      }
    }
  } catch (e) {
    console.warn("Fetch playlist videos from learning_progress failed:", e);
  }

  // 4. Merge with local storage progress using deterministic conflict resolution ("latest valid update wins")
  if (resultVideos.length > 0 && typeof window !== "undefined") {
    try {
      const { getLocalVideoProgress, resolveVideoProgress } = await import("@/lib/progressRepository");
      resultVideos = resultVideos.map((v) => {
        const local = getLocalVideoProgress(v.videoId);
        if (local) {
          const resolved = resolveVideoProgress(local, {
            videoId: v.videoId,
            playlistId: cleanId,
            lastPosition: v.last_position,
            watchTime: v.watch_time,
            updatedAt: (v as any).updated_at || (v as any).completed_at,
            completed: v.watched,
          });
          if (resolved) {
            return {
              ...v,
              watched: v.watched || Boolean(resolved.completed),
              last_position: resolved.lastPosition,
              watch_time: resolved.watchTime,
            };
          }
        }
        return v;
      });
    } catch (_) {}
  }

  return { videos: resultVideos, count: resultVideos.length };
}
