/**
 * Remote Progress Synchronization & Beacon Engine
 * Handles asynchronous sync with FastAPI backend and Supabase DB.
 */

import { supabase } from "@/lib/supabase";
import {
  API_BASE,
  getAuthHeaders,
  getGuestSessionId,
  getRawGuestSessionId,
} from "@/lib/api/client";
import { cleanPlaylistId } from "@/lib/api/learning";
import { VideoProgress } from "./types";
import { saveLocalVideoProgress } from "./localStorage";

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
export async function executeRemoteSync(record: VideoProgress): Promise<void> {
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
