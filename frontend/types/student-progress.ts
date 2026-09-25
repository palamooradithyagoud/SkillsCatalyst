/**
 * frontend/types/student-progress.ts
 * TypeScript interfaces for Student Progress & Resume Navigation (Phase 5).
 */

export interface StudentModuleProgressSummary {
  module_id: string;
  completed_lessons: number;
  total_lessons: number;
  progress_percentage: number;
  lessons_complete: boolean;
}

export interface StudentCourseProgress {
  course_id: string;
  completed_lesson_ids: string[];
  last_lesson_id: string | null;
  completed_lessons: number;
  total_lessons: number;
  progress_percentage: number;
  modules: StudentModuleProgressSummary[];
}

export interface StudentLessonProgressPayload {
  completed?: boolean | null;
}

export interface StudentLessonProgressItem {
  lesson_id: string;
  course_id: string;
  module_id: string;
  completed: boolean;
  completed_at?: string | null;
  last_viewed_at?: string | null;
}

export interface StudentProgressMutationResponse {
  lesson: StudentLessonProgressItem;
  course_progress: StudentCourseProgress;
}
