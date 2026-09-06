/**
 * ProgressRepository
 *
 * Centralized video playback progress repository for SkillsCatalyst:
 *  - Immediate LocalStorage persistence (zero-latency recovery layer)
 *  - Asynchronous remote backend synchronization (FastAPI + Supabase)
 *  - Deterministic conflict resolution: "latest valid update wins" (never "highest position wins")
 *  - Supports both authenticated users and guest sessions
 *  - Safe fallback for corrupted LocalStorage
 *  - Active playlist lesson tracking
 */

import { supabase } from "@/lib/supabase";
import {
  API_BASE,
  getAuthHeaders,
  getGuestSessionId,
  getRawGuestSessionId,
} from "@/lib/api/client";
import { cleanPlaylistId } from "@/lib/api/learning";

// ── Types ────────────────────────────────────────────────────────────────────
export interface VideoProgress {
  videoId: string;
  playlistId?: string;
  lastPosition: number;
  watchTime: number;
  updatedAt: string; // ISO 8601 string
  completed?: boolean;
}

export interface PlaylistActiveLesson {
  playlistId: string;
  videoIndex: number;
  videoId?: string;
  updatedAt: string;
}

// ── Storage Keys ─────────────────────────────────────────────────────────────
const VIDEO_PROGRESS_KEY_PREFIX = "sc_prog_vid_";
const PLAYLIST_ACTIVE_KEY_PREFIX = "sc_pl_active_";

// ── LocalStorage: Video Progress ─────────────────────────────────────────────

export function getLocalVideoProgress(videoId: string): VideoProgress | null {
  if (typeof window === "undefined" || !videoId) return null;
  try {
    const raw = localStorage.getItem(`${VIDEO_PROGRESS_KEY_PREFIX}${videoId}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      typeof parsed.lastPosition === "number" &&
      Number.isFinite(parsed.lastPosition)
    ) {
      return {
        videoId,
        playlistId: parsed.playlistId || undefined,
        lastPosition: Math.max(0, parsed.lastPosition),
        watchTime: Math.max(0, typeof parsed.watchTime === "number" ? parsed.watchTime : 0),
        updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : new Date(0).toISOString(),
        completed: Boolean(parsed.completed),
      };
    }
  } catch (e) {
    console.warn(`[ProgressRepository] Failed to read local progress for ${videoId}:`, e);
  }
  return null;
}

export function saveLocalVideoProgress(
  progress: Omit<VideoProgress, "updatedAt"> & { updatedAt?: string }
): VideoProgress {
  const record: VideoProgress = {
    videoId: progress.videoId,
    playlistId: progress.playlistId ? cleanPlaylistId(progress.playlistId) : undefined,
    lastPosition: Math.max(0, Math.round(progress.lastPosition * 10) / 10),
    watchTime: Math.max(0, Math.round(progress.watchTime)),
    updatedAt: progress.updatedAt || new Date().toISOString(),
    completed: Boolean(progress.completed),
  };

  if (typeof window !== "undefined" && progress.videoId) {
    try {
      localStorage.setItem(
        `${VIDEO_PROGRESS_KEY_PREFIX}${progress.videoId}`,
        JSON.stringify(record)
      );
    } catch (e) {
      console.warn(`[ProgressRepository] LocalStorage write failed for ${progress.videoId}:`, e);
    }
  }
  return record;
}

// ── LocalStorage: Active Lesson Index ────────────────────────────────────────

export function getLocalPlaylistActiveLesson(playlistId: string): PlaylistActiveLesson | null {
  if (typeof window === "undefined" || !playlistId) return null;
  const cleanId = cleanPlaylistId(playlistId);
  try {
    const raw = localStorage.getItem(`${PLAYLIST_ACTIVE_KEY_PREFIX}${cleanId}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      typeof parsed.videoIndex === "number" &&
      Number.isFinite(parsed.videoIndex)
    ) {
      return {
        playlistId: cleanId,
        videoIndex: Math.max(0, parsed.videoIndex),
        videoId: parsed.videoId || undefined,
        updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : new Date(0).toISOString(),
      };
    }
  } catch (e) {
    console.warn(`[ProgressRepository] Failed to read active lesson for ${cleanId}:`, e);
  }
  return null;
}

export function saveLocalPlaylistActiveLesson(
  playlistId: string,
  videoIndex: number,
  videoId?: string
): void {
  if (typeof window === "undefined" || !playlistId) return;
  const cleanId = cleanPlaylistId(playlistId);
  const record: PlaylistActiveLesson = {
    playlistId: cleanId,
    videoIndex: Math.max(0, Math.floor(videoIndex)),
    videoId,
    updatedAt: new Date().toISOString(),
  };
  try {
    localStorage.setItem(
      `${PLAYLIST_ACTIVE_KEY_PREFIX}${cleanId}`,
      JSON.stringify(record)
    );
  } catch (e) {
    console.warn(`[ProgressRepository] Failed to save active lesson for ${cleanId}:`, e);
  }
}

// ── Deterministic Conflict Resolution ────────────────────────────────────────
/**
 * Resolves progress between local cache and remote server record.
 * RULE: "Latest valid update wins" using updatedAt timestamp.
 * NEVER uses "highest position wins" because users can intentionally rewind!
 * Cumulative watchTime is preserved (accumulated).
 */
export function resolveVideoProgress(
  local: VideoProgress | null | undefined,
  remote: Partial<VideoProgress> | null | undefined
): VideoProgress | null {
  if (!local && !remote) return null;

  const remoteNormalized: VideoProgress | null = remote && (remote.videoId || (remote as any).video_id)
    ? {
        videoId: remote.videoId || (remote as any).video_id || "",
        playlistId: remote.playlistId || (remote as any).playlist_id || undefined,
        lastPosition: Math.max(
          0,
          Number(remote.lastPosition ?? (remote as any).last_position ?? 0)
        ),
        watchTime: Math.max(
          0,
          Number(remote.watchTime ?? (remote as any).watch_time ?? 0)
        ),
        updatedAt:
          remote.updatedAt ||
          (remote as any).updated_at ||
          (remote as any).completed_at ||
          new Date(0).toISOString(),
        completed: Boolean(
          remote.completed ??
          (remote as any).watched ??
          Boolean((remote as any).completed_at)
        ),
      }
    : null;

  if (!local && remoteNormalized) return remoteNormalized;
  if (local && !remoteNormalized) return local;

  // Both exist: compare timestamps
  const localTime = new Date(local!.updatedAt).getTime();
  const remoteTime = new Date(remoteNormalized!.updatedAt).getTime();

  // If remote is strictly newer by > 1.5s (to account for minor client/server clock skew),
  // prefer remote position.
  if (remoteTime > localTime + 1500) {
    return {
      videoId: local!.videoId || remoteNormalized!.videoId,
      playlistId: remoteNormalized!.playlistId || local!.playlistId,
      lastPosition: remoteNormalized!.lastPosition,
      // watchTime is genuinely accumulated: keep whichever is larger or add
      watchTime: Math.max(local!.watchTime, remoteNormalized!.watchTime),
      updatedAt: remoteNormalized!.updatedAt,
      completed: local!.completed || remoteNormalized!.completed,
    };
  }

  // Local is newer or equal: local position wins (preserves rewind!)
  return {
    ...local!,
    watchTime: Math.max(local!.watchTime, remoteNormalized!.watchTime),
    completed: local!.completed || remoteNormalized!.completed,
  };
}

// ── Active Lesson Resolution ─────────────────────────────────────────────────
/**
 * Determines which lesson index to start watching for a given playlist.
 * Priority:
 *  1. Explicit lesson requested (if provided)
 *  2. Previously active lesson from local storage
 *  3. First incomplete lesson in the playlist
 *  4. First lesson (index 0)
 */
export function resolveActiveLessonIndex(
  playlistId: string,
  videos: Array<{ videoId: string; watched?: boolean; completed?: boolean }>,
  explicitIndex?: number
): number {
  if (!videos || videos.length === 0) return 0;

  // 1. Explicit request
  if (
    explicitIndex !== undefined &&
    typeof explicitIndex === "number" &&
    explicitIndex >= 0 &&
    explicitIndex < videos.length
  ) {
    return explicitIndex;
  }

  // 2. Previously active lesson
  const saved = getLocalPlaylistActiveLesson(playlistId);
  if (saved && saved.videoIndex >= 0 && saved.videoIndex < videos.length) {
    return saved.videoIndex;
  }

  // 3. First incomplete lesson
  const firstIncomplete = videos.findIndex((v) => !v.watched && !v.completed);
  if (firstIncomplete >= 0) {
    return firstIncomplete;
  }

  // 4. Default to first lesson
  return 0;
}

// ── Remote Sync Manager ──────────────────────────────────────────────────────
interface PendingSync {
  progress: VideoProgress;
  timer: ReturnType<typeof setTimeout> | null;
}

const syncQueue = new Map<string, PendingSync>();

/**
 * Synchronizes progress to LocalStorage immediately and backend asynchronously.
 * Supports debounced periodic sync while playing and immediate flush on pause/switch.
 */
export async function syncVideoProgress(
  progress: Omit<VideoProgress, "updatedAt"> & { updatedAt?: string },
  immediate = false
): Promise<void> {
  // 1. Immediate LocalStorage write (zero latency recovery)
  const savedRecord = saveLocalVideoProgress(progress);

  const key = `${savedRecord.playlistId || ""}_${savedRecord.videoId}`;
  const existing = syncQueue.get(key);

  if (existing?.timer) {
    clearTimeout(existing.timer);
  }

  if (immediate) {
    syncQueue.delete(key);
    await executeRemoteSync(savedRecord);
    return;
  }

  // Debounced queue (10s periodic window)
  const timer = setTimeout(() => {
    syncQueue.delete(key);
    executeRemoteSync(savedRecord).catch(() => {});
  }, 10_000);

  syncQueue.set(key, { progress: savedRecord, timer });
}

/**
 * Executes remote API + Supabase sync.
 * Non-blocking: failures are logged and do NOT crash the caller or playback.
 */
async function executeRemoteSync(record: VideoProgress): Promise<void> {
  const cleanId = cleanPlaylistId(record.playlistId || "");
  const payload = {
    playlist_id: cleanId,
    video_id: record.videoId,
    last_position: Math.round(record.lastPosition),
    watch_time: Math.round(record.watchTime),
    updated_at: record.updatedAt,
  };

  // 1. FastAPI backend /api/learning/save-progress
  try {
    const authHeaders = await getAuthHeaders();
    await fetch(`${API_BASE}/api/learning/save-progress`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders },
      body: JSON.stringify(payload),
    }).catch(() => {});
  } catch (e) {
    // Network failure is non-fatal: local storage is already written
  }

  // 2. Direct Supabase DB Write (for authenticated users in video_progress table)
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    if (userId) {
      await supabase.from("video_progress").upsert(
        {
          user_id: userId,
          playlist_id: cleanId,
          video_id: record.videoId,
          last_position: Math.round(record.lastPosition),
          watch_time: Math.round(record.watchTime),
          updated_at: record.updatedAt,
        },
        { onConflict: "user_id,playlist_id,video_id" }
      );
    } else {
      // Direct Supabase DB Write (for guest users in learning_progress JSONB table)
      const rawGuestId = getRawGuestSessionId();
      if (rawGuestId) {
        const { data: lpData } = await supabase
          .from("learning_progress")
          .select("id, completed_steps")
          .eq("session_id", rawGuestId)
          .eq("skill_name", "saved_playlists")
          .limit(1);

        if (lpData && lpData.length > 0) {
          const rowId = lpData[0].id;
          const playlists = lpData[0].completed_steps || [];
          const plIndex = playlists.findIndex(
            (p: any) =>
              (p.id || p.playlist_id) === cleanId ||
              (p.id || p.playlist_id) === record.playlistId
          );
          if (plIndex !== -1) {
            const pl = playlists[plIndex];
            const videos = pl.videos || [];
            const vIdx = videos.findIndex(
              (v: any) => (v.videoId || v.id) === record.videoId
            );
            const updatedVid = {
              videoId: record.videoId,
              id: record.videoId,
              last_position: Math.round(record.lastPosition),
              lastPosition: Math.round(record.lastPosition),
              watch_time: Math.round(record.watchTime),
              watchTime: Math.round(record.watchTime),
              updated_at: record.updatedAt,
            };
            if (vIdx !== -1) {
              videos[vIdx] = { ...videos[vIdx], ...updatedVid };
            } else {
              videos.push(updatedVid);
            }
            playlists[plIndex].videos = videos;
            await supabase
              .from("learning_progress")
              .update({
                completed_steps: playlists,
                updated_at: record.updatedAt,
              })
              .eq("id", rowId);
          }
        }
      }
    }
  } catch (e) {
    // Non-blocking fallback
  }
}

/**
 * Flushes all pending sync timers immediately (e.g. on unmount or navigation).
 */
export function flushPendingSync(): void {
  syncQueue.forEach((entry, key) => {
    if (entry.timer) {
      clearTimeout(entry.timer);
    }
    executeRemoteSync(entry.progress).catch(() => {});
    syncQueue.delete(key);
  });
}

/**
 * Best-effort unload sync using navigator.sendBeacon.
 */
export function syncVideoProgressBeacon(record: VideoProgress): void {
  // Always ensure local storage is up to date
  saveLocalVideoProgress(record);

  if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
    try {
      const cleanId = cleanPlaylistId(record.playlistId || "");
      const guestSid = getGuestSessionId();
      const payload = JSON.stringify({
        playlist_id: cleanId,
        video_id: record.videoId,
        last_position: Math.round(record.lastPosition),
        watch_time: Math.round(record.watchTime),
        updated_at: record.updatedAt,
        session_id: guestSid,
      });
      const blob = new Blob([payload], { type: "application/json" });
      navigator.sendBeacon(`${API_BASE}/api/learning/save-progress`, blob);
    } catch (_) {
      // Beacon failure is silent
    }
  }
}
