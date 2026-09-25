/**
 * frontend/types/student-course.ts
 * Strict TypeScript types for student course experience (Phase 4).
 * Strictly read-only; excludes admin authoring fields and quiz answer keys.
 */

import type { LessonBlock } from "./lesson-content";

export interface StudentCourseSummary {
  id: string;
  title: string;
  slug: string;
  short_description?: string | null;
  description?: string | null;
  thumbnail_url?: string | null;
  category?: string | null;
  difficulty: "beginner" | "intermediate" | "advanced" | string;
  estimated_duration_minutes?: number | null;
  status: string;
  published_at?: string | null;
  modules_count: number;
  lessons_count: number;
}

export interface StudentCourseListResponse {
  total: number;
  items: StudentCourseSummary[];
  page: number;
  page_size: number;
  total_pages: number;
}

export interface StudentLessonSummary {
  id: string;
  module_id: string;
  title: string;
  slug?: string | null;
  short_description?: string | null;
  position: number;
  estimated_duration_minutes?: number | null;
}

export interface StudentQuizSummary {
  id: string;
  module_id: string;
  title: string;
  description?: string | null;
}

export interface StudentModuleSummary {
  id: string;
  course_id: string;
  title: string;
  description?: string | null;
  position: number;
  lessons: StudentLessonSummary[];
  quiz?: StudentQuizSummary | null;
}

export interface StudentCourseDetail extends StudentCourseSummary {
  modules: StudentModuleSummary[];
}

export interface StudentLessonNavigationItem {
  id: string;
  title: string;
  module_id: string;
  module_title?: string | null;
}

export interface StudentLessonDetail {
  course: {
    id: string;
    title: string;
    slug: string;
  };
  module: {
    id: string;
    title: string;
    position: number;
  };
  lesson: StudentLessonSummary;
  content: {
    schema_version: number;
    blocks: LessonBlock[];
  };
  prev_lesson?: StudentLessonNavigationItem | null;
  next_lesson?: StudentLessonNavigationItem | null;
}
