/**
 * LocalStorage recovery layer for video progress and active playlist lessons.
 * Provides immediate zero-latency reads/writes before remote database sync.
 */

import { cleanPlaylistId } from "@/lib/api/learning";
import {
  VideoProgress,
  PlaylistActiveLesson,
  VIDEO_PROGRESS_KEY_PREFIX,
  PLAYLIST_ACTIVE_KEY_PREFIX,
} from "./types";

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
