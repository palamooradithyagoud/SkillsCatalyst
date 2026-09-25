/**
 * frontend/lib/api/courses.ts
 * Frontend API client helpers for Course System (Phase 1).
 * Supports administrative Course, Module, Lesson, Quiz, Question, and Option management.
 */

import { apiFetch, getAuthHeaders, API_BASE } from "./client";
import type {
  CourseItem,
  CourseDetail,
  CourseListResponse,
  CourseModuleItem,
  CourseLessonItem,
  CourseQuizItem,
  QuizQuestionItem,
  QuizOptionItem,
  CreateCoursePayload,
  UpdateCoursePayload,
  CreateModulePayload,
  UpdateModulePayload,
  CreateLessonPayload,
  UpdateLessonPayload,
  CreateQuizPayload,
  UpdateQuizPayload,
  CreateQuestionPayload,
  UpdateQuestionPayload,
  CreateOptionPayload,
  UpdateOptionPayload,
  ReorderPayload,
} from "@/types/course";

// ── Courses ──────────────────────────────────────────────────────────────────

export async function fetchAdminCourses(params?: {
  search?: string;
  status_filter?: string;
  difficulty?: string;
  category?: string;
  sort?: string;
  page?: number;
  page_size?: number;
}): Promise<CourseListResponse> {
  const headers = await getAuthHeaders();
  const query = new URLSearchParams();
  if (params?.search?.trim()) query.set("search", params.search.trim());
  if (params?.status_filter?.trim()) query.set("status", params.status_filter.trim());
  if (params?.difficulty?.trim()) query.set("difficulty", params.difficulty.trim());
  if (params?.category?.trim()) query.set("category", params.category.trim());
  if (params?.sort?.trim()) query.set("sort", params.sort.trim());
  if (params?.page) query.set("page", String(params.page));
  if (params?.page_size) query.set("page_size", String(params.page_size));

  const qs = query.toString();
  const url = `${API_BASE}/api/admin/courses${qs ? `?${qs}` : ""}`;
  const res = await apiFetch(url, { headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
    throw new Error(err.detail || `Failed to fetch courses: HTTP ${res.status}`);
  }
  return res.json();
}

export async function fetchAdminCourseById(courseId: string): Promise<CourseDetail> {
  const headers = await getAuthHeaders();
  const res = await apiFetch(`${API_BASE}/api/admin/courses/${encodeURIComponent(courseId)}`, { headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
    throw new Error(err.detail || `Failed to fetch course: HTTP ${res.status}`);
  }
  return res.json();
}

export async function createAdminCourse(payload: CreateCoursePayload): Promise<CourseItem> {
  const headers = await getAuthHeaders();
  const res = await apiFetch(`${API_BASE}/api/admin/courses`, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
    throw new Error(err.detail || `Failed to create course: HTTP ${res.status}`);
  }
  return res.json();
}

export async function updateAdminCourse(courseId: string, payload: UpdateCoursePayload): Promise<CourseItem> {
  const headers = await getAuthHeaders();
  const res = await apiFetch(`${API_BASE}/api/admin/courses/${encodeURIComponent(courseId)}`, {
    method: "PATCH",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
    throw new Error(err.detail || `Failed to update course: HTTP ${res.status}`);
  }
  return res.json();
}

export async function deleteAdminCourse(courseId: string): Promise<void> {
  const headers = await getAuthHeaders();
  const res = await apiFetch(`${API_BASE}/api/admin/courses/${encodeURIComponent(courseId)}`, {
    method: "DELETE",
    headers,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
    throw new Error(err.detail || `Failed to delete course: HTTP ${res.status}`);
  }
}

export async function publishAdminCourse(courseId: string): Promise<CourseDetail> {
  const headers = await getAuthHeaders();
  const res = await apiFetch(`${API_BASE}/api/admin/courses/${encodeURIComponent(courseId)}/publish`, {
    method: "POST",
    headers,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
    throw new Error(err.detail || `Failed to publish course: HTTP ${res.status}`);
  }
  return res.json();
}

export async function unpublishAdminCourse(courseId: string): Promise<CourseDetail> {
  const headers = await getAuthHeaders();
  const res = await apiFetch(`${API_BASE}/api/admin/courses/${encodeURIComponent(courseId)}/unpublish`, {
    method: "POST",
    headers,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
    throw new Error(err.detail || `Failed to unpublish course: HTTP ${res.status}`);
  }
  return res.json();
}

export async function archiveAdminCourse(courseId: string): Promise<CourseDetail> {
  const headers = await getAuthHeaders();
  const res = await apiFetch(`${API_BASE}/api/admin/courses/${encodeURIComponent(courseId)}/archive`, {
    method: "POST",
    headers,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
    throw new Error(err.detail || `Failed to archive course: HTTP ${res.status}`);
  }
  return res.json();
}

// ── Modules ──────────────────────────────────────────────────────────────────

export async function createAdminModule(courseId: string, payload: CreateModulePayload): Promise<CourseModuleItem> {
  const headers = await getAuthHeaders();
  const res = await apiFetch(`${API_BASE}/api/admin/courses/${encodeURIComponent(courseId)}/modules`, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
    throw new Error(err.detail || `Failed to create module: HTTP ${res.status}`);
  }
  return res.json();
}

export async function updateAdminModule(moduleId: string, payload: UpdateModulePayload): Promise<CourseModuleItem> {
  const headers = await getAuthHeaders();
  const res = await apiFetch(`${API_BASE}/api/admin/modules/${encodeURIComponent(moduleId)}`, {
    method: "PATCH",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
    throw new Error(err.detail || `Failed to update module: HTTP ${res.status}`);
  }
  return res.json();
}

export async function deleteAdminModule(moduleId: string): Promise<void> {
  const headers = await getAuthHeaders();
  const res = await apiFetch(`${API_BASE}/api/admin/modules/${encodeURIComponent(moduleId)}`, {
    method: "DELETE",
    headers,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
    throw new Error(err.detail || `Failed to delete module: HTTP ${res.status}`);
  }
}

export async function reorderAdminModules(courseId: string, payload: ReorderPayload): Promise<CourseModuleItem[]> {
  const headers = await getAuthHeaders();
  const res = await apiFetch(`${API_BASE}/api/admin/courses/${encodeURIComponent(courseId)}/modules/reorder`, {
    method: "PATCH",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
    throw new Error(err.detail || `Failed to reorder modules: HTTP ${res.status}`);
  }
  return res.json();
}

// ── Lessons (Metadata Only) ───────────────────────────────────────────────────

export async function createAdminLesson(moduleId: string, payload: CreateLessonPayload): Promise<CourseLessonItem> {
  const headers = await getAuthHeaders();
  const res = await apiFetch(`${API_BASE}/api/admin/modules/${encodeURIComponent(moduleId)}/lessons`, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
    throw new Error(err.detail || `Failed to create lesson: HTTP ${res.status}`);
  }
  return res.json();
}

export async function updateAdminLesson(lessonId: string, payload: UpdateLessonPayload): Promise<CourseLessonItem> {
  const headers = await getAuthHeaders();
  const res = await apiFetch(`${API_BASE}/api/admin/lessons/${encodeURIComponent(lessonId)}`, {
    method: "PATCH",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
    throw new Error(err.detail || `Failed to update lesson: HTTP ${res.status}`);
  }
  return res.json();
}

export async function deleteAdminLesson(lessonId: string): Promise<void> {
  const headers = await getAuthHeaders();
  const res = await apiFetch(`${API_BASE}/api/admin/lessons/${encodeURIComponent(lessonId)}`, {
    method: "DELETE",
    headers,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
    throw new Error(err.detail || `Failed to delete lesson: HTTP ${res.status}`);
  }
}

export async function reorderAdminLessons(moduleId: string, payload: ReorderPayload): Promise<CourseLessonItem[]> {
  const headers = await getAuthHeaders();
  const res = await apiFetch(`${API_BASE}/api/admin/modules/${encodeURIComponent(moduleId)}/lessons/reorder`, {
    method: "PATCH",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
    throw new Error(err.detail || `Failed to reorder lessons: HTTP ${res.status}`);
  }
  return res.json();
}

// ── Quizzes ──────────────────────────────────────────────────────────────────

export async function createAdminQuiz(moduleId: string, payload: CreateQuizPayload): Promise<CourseQuizItem> {
  const headers = await getAuthHeaders();
  const res = await apiFetch(`${API_BASE}/api/admin/modules/${encodeURIComponent(moduleId)}/quiz`, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
    throw new Error(err.detail || `Failed to create quiz: HTTP ${res.status}`);
  }
  return res.json();
}

export async function fetchAdminQuiz(moduleId: string): Promise<CourseQuizItem | null> {
  const headers = await getAuthHeaders();
  const res = await apiFetch(`${API_BASE}/api/admin/modules/${encodeURIComponent(moduleId)}/quiz`, { headers });
  if (!res.ok) {
    if (res.status === 404) return null;
    const err = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
    throw new Error(err.detail || `Failed to fetch quiz: HTTP ${res.status}`);
  }
  return res.json();
}

export async function updateAdminQuiz(quizId: string, payload: UpdateQuizPayload): Promise<CourseQuizItem> {
  const headers = await getAuthHeaders();
  const res = await apiFetch(`${API_BASE}/api/admin/quizzes/${encodeURIComponent(quizId)}`, {
    method: "PATCH",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
    throw new Error(err.detail || `Failed to update quiz: HTTP ${res.status}`);
  }
  return res.json();
}

// ── Questions ─────────────────────────────────────────────────────────────────

export async function createAdminQuestion(quizId: string, payload: CreateQuestionPayload): Promise<QuizQuestionItem> {
  const headers = await getAuthHeaders();
  const res = await apiFetch(`${API_BASE}/api/admin/quizzes/${encodeURIComponent(quizId)}/questions`, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
    throw new Error(err.detail || `Failed to create question: HTTP ${res.status}`);
  }
  return res.json();
}

export async function updateAdminQuestion(questionId: string, payload: UpdateQuestionPayload): Promise<QuizQuestionItem> {
  const headers = await getAuthHeaders();
  const res = await apiFetch(`${API_BASE}/api/admin/questions/${encodeURIComponent(questionId)}`, {
    method: "PATCH",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
    throw new Error(err.detail || `Failed to update question: HTTP ${res.status}`);
  }
  return res.json();
}

export async function deleteAdminQuestion(questionId: string): Promise<void> {
  const headers = await getAuthHeaders();
  const res = await apiFetch(`${API_BASE}/api/admin/questions/${encodeURIComponent(questionId)}`, {
    method: "DELETE",
    headers,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
    throw new Error(err.detail || `Failed to delete question: HTTP ${res.status}`);
  }
}

export async function reorderAdminQuestions(quizId: string, payload: ReorderPayload): Promise<QuizQuestionItem[]> {
  const headers = await getAuthHeaders();
  const res = await apiFetch(`${API_BASE}/api/admin/quizzes/${encodeURIComponent(quizId)}/questions/reorder`, {
    method: "PATCH",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
    throw new Error(err.detail || `Failed to reorder questions: HTTP ${res.status}`);
  }
  return res.json();
}

// ── Options ───────────────────────────────────────────────────────────────────

export async function createAdminOption(questionId: string, payload: CreateOptionPayload): Promise<QuizOptionItem> {
  const headers = await getAuthHeaders();
  const res = await apiFetch(`${API_BASE}/api/admin/questions/${encodeURIComponent(questionId)}/options`, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
    throw new Error(err.detail || `Failed to create option: HTTP ${res.status}`);
  }
  return res.json();
}

export async function updateAdminOption(optionId: string, payload: UpdateOptionPayload): Promise<QuizOptionItem> {
  const headers = await getAuthHeaders();
  const res = await apiFetch(`${API_BASE}/api/admin/options/${encodeURIComponent(optionId)}`, {
    method: "PATCH",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
    throw new Error(err.detail || `Failed to update option: HTTP ${res.status}`);
  }
  return res.json();
}

export async function deleteAdminOption(optionId: string): Promise<void> {
  const headers = await getAuthHeaders();
  const res = await apiFetch(`${API_BASE}/api/admin/options/${encodeURIComponent(optionId)}`, {
    method: "DELETE",
    headers,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
    throw new Error(err.detail || `Failed to delete option: HTTP ${res.status}`);
  }
}

export async function reorderAdminOptions(questionId: string, payload: ReorderPayload): Promise<QuizOptionItem[]> {
  const headers = await getAuthHeaders();
  const res = await apiFetch(`${API_BASE}/api/admin/questions/${encodeURIComponent(questionId)}/options/reorder`, {
    method: "PATCH",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
    throw new Error(err.detail || `Failed to reorder options: HTTP ${res.status}`);
  }
  return res.json();
}
