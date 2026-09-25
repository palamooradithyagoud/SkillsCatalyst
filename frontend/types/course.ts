/**
 * frontend/types/course.ts
 * Strict TypeScript types for SkillsCatalyst Course System (Phase 1).
 * Phase 1 Scope: Foundation + Module Quiz Foundation.
 * Zero use of `any`.
 */

export type CourseStatus = "DRAFT" | "IN_REVIEW" | "PUBLISHED" | "ARCHIVED";

export type CourseDifficulty = "beginner" | "intermediate" | "advanced";

export type QuestionType = "SINGLE_SELECT" | "MULTI_SELECT" | "TRUE_FALSE";

export type CourseSortOption = "newest" | "oldest" | "title_asc" | "title_desc" | "updated_at";

export interface QuizOptionItem {
  id: string;
  question_id: string;
  option_text: string;
  is_correct: boolean;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface QuizQuestionItem {
  id: string;
  quiz_id: string;
  question_text: string;
  question_type: QuestionType | string;
  position: number;
  explanation?: string | null;
  options: QuizOptionItem[];
  created_at: string;
  updated_at: string;
}

export interface CourseQuizItem {
  id: string;
  module_id: string;
  title: string;
  description?: string | null;
  status: string;
  questions: QuizQuestionItem[];
  created_at: string;
  updated_at: string;
}

export interface CourseLessonItem {
  id: string;
  module_id: string;
  title: string;
  slug?: string | null;
  short_description?: string | null;
  position: number;
  estimated_duration_minutes?: number | null;
  created_at: string;
  updated_at: string;
}

export interface CourseModuleItem {
  id: string;
  course_id: string;
  title: string;
  description?: string | null;
  position: number;
  lessons: CourseLessonItem[];
  quiz?: CourseQuizItem | null;
  created_at: string;
  updated_at: string;
}

export interface CourseItem {
  id: string;
  title: string;
  slug: string;
  short_description?: string | null;
  description?: string | null;
  thumbnail_url?: string | null;
  category?: string | null;
  difficulty: CourseDifficulty;
  estimated_duration_minutes?: number | null;
  status: CourseStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
  published_at?: string | null;
  archived_at?: string | null;
  modules_count?: number;
  lessons_count?: number;
}

export interface CourseDetail extends CourseItem {
  modules: CourseModuleItem[];
}

export interface CourseListResponse {
  total: number;
  items: CourseItem[];
  page: number;
  page_size: number;
  total_pages: number;
}

// ── Payloads ─────────────────────────────────────────────────────────────────

export interface CreateCoursePayload {
  title: string;
  short_description?: string;
  description?: string;
  thumbnail_url?: string;
  category?: string;
  difficulty: CourseDifficulty;
  estimated_duration_minutes?: number;
  status?: CourseStatus;
}

export interface UpdateCoursePayload {
  title?: string;
  short_description?: string;
  description?: string;
  thumbnail_url?: string;
  category?: string;
  difficulty?: CourseDifficulty;
  estimated_duration_minutes?: number;
  status?: CourseStatus;
}

export interface CreateModulePayload {
  title: string;
  description?: string;
  position?: number;
}

export interface UpdateModulePayload {
  title?: string;
  description?: string;
  position?: number;
}

export interface CreateLessonPayload {
  title: string;
  slug?: string;
  short_description?: string;
  position?: number;
  estimated_duration_minutes?: number;
}

export interface UpdateLessonPayload {
  title?: string;
  slug?: string;
  short_description?: string;
  position?: number;
  estimated_duration_minutes?: number;
}

export interface CreateQuizPayload {
  title: string;
  description?: string;
  status?: string;
}

export interface UpdateQuizPayload {
  title?: string;
  description?: string;
  status?: string;
}

export interface CreateQuestionPayload {
  question_text: string;
  question_type?: QuestionType;
  position?: number;
  explanation?: string;
}

export interface UpdateQuestionPayload {
  question_text?: string;
  question_type?: QuestionType;
  position?: number;
  explanation?: string;
}

export interface CreateOptionPayload {
  option_text: string;
  is_correct?: boolean;
  position?: number;
}

export interface UpdateOptionPayload {
  option_text?: string;
  is_correct?: boolean;
  position?: number;
}

export interface ReorderItemPayload {
  id: string;
  position: number;
}

export interface ReorderPayload {
  items: ReorderItemPayload[];
}

// ── Lesson Content Types Re-export (Phase 2A) ─────────────────────────────────
export * from "./lesson-content";

// ── Course Lesson Media Types Re-export (Phase 3A) ────────────────────────────
export * from "./course-media";

// ── Student Course Types Re-export (Phase 4) ──────────────────────────────────
export * from "./student-course";

