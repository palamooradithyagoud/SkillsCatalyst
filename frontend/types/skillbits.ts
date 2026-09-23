/**
 * frontend/types/skillbits.ts
 * TypeScript type definitions for SkillBits educational micro-learning units.
 * Phase: Step 1 (Foundation)
 */

export type SkillBitDifficulty = "beginner" | "intermediate" | "advanced";

export type SkillBitStatus = "draft" | "published" | "archived";

export type VideoProvider = "mux";

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

export interface StudentSkillBitsFeedResponse {
  total: number;
  items: StudentSkillBit[];
}

export interface AdminSkillBitsResponse {
  total: number;
  items: AdminSkillBit[];
}
