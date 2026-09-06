/**
 * Types & Storage Key Constants for Video Playback Progress
 */

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

// ── Storage Keys (Protected Invariants) ──────────────────────────────────────
export const VIDEO_PROGRESS_KEY_PREFIX = "sc_prog_vid_";
export const PLAYLIST_ACTIVE_KEY_PREFIX = "sc_pl_active_";
