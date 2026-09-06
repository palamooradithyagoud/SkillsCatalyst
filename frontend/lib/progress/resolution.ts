/**
 * Deterministic Conflict & Lesson Resolution
 *
 * Conflict Rule: "Latest valid update wins" using updatedAt timestamp (+1.5s clock skew tolerance).
 * NEVER uses "highest position wins" because users can intentionally rewind!
 * Cumulative watchTime is preserved (accumulated).
 */

import { VideoProgress } from "./types";
import { getLocalPlaylistActiveLesson } from "./localStorage";

// ── Deterministic Conflict Resolution ────────────────────────────────────────
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
      // watchTime is genuinely accumulated: keep whichever is larger
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
 *  1. Explicit lesson requested (if provided and in range)
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
