/**
 * frontend/types/skillbits.ts
 * TypeScript type definitions for SkillBits educational micro-learning units.
 * Phase: Step 1 (Foundation)
 */

export type SkillBitDifficulty = "beginner" | "intermediate" | "advanced";

export type SkillBitStatus = "draft" | "published" | "archived";

export type VideoProvider = "mux";

export type VideoStatus = "NOT_UPLOADED" | "UPLOADING" | "PROCESSING" | "READY" | "ERROR";

export interface SkillBitSkill {
  id: string;
  skill_key: string;
  skill_name?: string;
}

export interface StudentSkillBit {
  id: string;
  title: string;
  description?: string | null;
  topic?: string | null;
  difficulty: SkillBitDifficulty;
  duration_seconds?: number | null;
  thumbnail_url?: string | null;
  video_provider?: VideoProvider | string | null;
  playback_id?: string | null;
  skills: SkillBitSkill[];
  courses: unknown[];
  lessons: unknown[];
  roadmaps: unknown[];
  published_at?: string | null;
}

export interface AdminSkillBit {
  id: string;
  title: string;
  description?: string | null;
  topic?: string | null;
  difficulty: SkillBitDifficulty;
  duration_seconds?: number | null;
  thumbnail_url?: string | null;
  video_provider?: VideoProvider | string | null;
  video_asset_id?: string | null;
  playback_id?: string | null;
  status: SkillBitStatus;
  video_status: VideoStatus;
  mux_upload_id?: string | null;
  published_at?: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  skills: SkillBitSkill[];
  courses: unknown[];
  lessons: unknown[];
  roadmaps: unknown[];
}

export interface CreateSkillBitPayload {
  title: string;
  description?: string | null;
  topic?: string | null;
  difficulty: SkillBitDifficulty;
  duration_seconds?: number | null;
  thumbnail_url?: string | null;
  video_provider?: VideoProvider | null;
  video_asset_id?: string | null;
  playback_id?: string | null;
  status?: SkillBitStatus;
  skill_ids?: string[];
}

export interface UpdateSkillBitPayload {
  title?: string;
  description?: string | null;
  topic?: string | null;
  difficulty?: SkillBitDifficulty;
  duration_seconds?: number | null;
  thumbnail_url?: string | null;
  video_provider?: VideoProvider | null;
  video_asset_id?: string | null;
  playback_id?: string | null;
  status?: SkillBitStatus;
  skill_ids?: string[];
}

export interface DirectUploadResponse {
  upload_id: string;
  upload_url: string;
  status: string;
}

export interface VideoStatusResponse {
  video_status: VideoStatus;
  video_provider?: string | null;
  video_asset_id?: string | null;
  playback_id?: string | null;
  duration_seconds?: number | null;
}

export type SkillBitSortOption =
  | "newest"
  | "oldest"
  | "title_asc"
  | "title_desc"
  | "duration_desc"
  | "duration_asc"
  | "updated_at";

export interface StudentSkillBitsFeedResponse {
  total: number;
  items: StudentSkillBit[];
  page?: number;
  page_size?: number;
  total_pages?: number;
}

export interface AdminSkillBitsResponse {
  total: number;
  items: AdminSkillBit[];
  page?: number;
  page_size?: number;
  total_pages?: number;
}

export interface SkillBitProgress {
  skillbit_id: string;
  watched_seconds: number;
  completion_percentage: number;
  last_position_seconds: number;
  started: boolean;
  completed: boolean;
  started_at?: string | null;
  last_watched_at?: string | null;
  completed_at?: string | null;
}

export interface UpdateSkillBitProgressPayload {
  watched_seconds: number;
  last_position_seconds: number;
  completion_percentage: number;
}

