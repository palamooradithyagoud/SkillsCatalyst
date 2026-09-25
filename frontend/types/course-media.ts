/**
 * frontend/types/course-media.ts
 * TypeScript interfaces for Course Lesson Media Storage Foundation (Phase 3A).
 * Establishes typed contracts for storage, metadata, and media APIs.
 */

export interface CourseLessonMediaItem {
  id: string;
  course_id: string;
  module_id: string;
  lesson_id: string;
  storage_path: string;
  original_filename: string;
  mime_type: string;
  size_bytes: number;
  public_url: string;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CourseLessonMediaListResponse {
  total: number;
  items: CourseLessonMediaItem[];
}

export interface CourseLessonMediaDeleteResponse {
  message: string;
  id: string;
  storage_path: string;
}
