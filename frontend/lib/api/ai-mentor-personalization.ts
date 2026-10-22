/**
 * frontend/lib/api/ai-mentor-personalization.ts
 * API client layer for Phase 2C Personalized AI Mentor.
 * Handles learning profile, roadmaps, skill gaps, and weekly reviews.
 * Zero emojis in all source and user-facing text.
 */

import { API_BASE, apiFetch, getAuthHeaders } from "./client";
import {
  StudentLearningProfile,
  UpdateLearningProfileRequest,
  StudentLearningRoadmap,
  GenerateRoadmapRequest,
  SkillGapAnalysisResult,
  WeeklyProgressReviewResult,
} from "@/types/ai-mentor-personalization";
import { TaskActionProposal } from "@/types/ai-mentor-tasks";

export async function getStudentLearningProfile(): Promise<StudentLearningProfile> {
  const authHeaders = await getAuthHeaders();
  const res = await apiFetch(`${API_BASE}/api/ai-mentor/learning-profile`, {
    method: "GET",
    headers: { ...authHeaders },
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = data?.detail?.message || data?.message || "Failed to load learning profile.";
    throw new Error(msg);
  }
  return data;
}

export async function updateStudentLearningProfile(
  payload: UpdateLearningProfileRequest
): Promise<StudentLearningProfile> {
  const authHeaders = await getAuthHeaders();
  const res = await apiFetch(`${API_BASE}/api/ai-mentor/learning-profile`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = data?.detail?.message || data?.message || "Failed to update learning profile.";
    throw new Error(msg);
  }
  return data;
}

export async function resetStudentLearningProfile(): Promise<{ success: boolean; message: string }> {
  const authHeaders = await getAuthHeaders();
  const res = await apiFetch(`${API_BASE}/api/ai-mentor/learning-profile`, {
    method: "DELETE",
    headers: { ...authHeaders },
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = data?.detail?.message || data?.message || "Failed to reset learning profile.";
    throw new Error(msg);
  }
  return data;
}

export async function listStudentRoadmaps(): Promise<StudentLearningRoadmap[]> {
  const authHeaders = await getAuthHeaders();
  const res = await apiFetch(`${API_BASE}/api/ai-mentor/roadmaps`, {
    method: "GET",
    headers: { ...authHeaders },
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = data?.detail?.message || data?.message || "Failed to load roadmaps.";
    throw new Error(msg);
  }
  return data || [];
}

export async function generateStudentRoadmap(
  payload: GenerateRoadmapRequest
): Promise<StudentLearningRoadmap> {
  const authHeaders = await getAuthHeaders();
  const res = await apiFetch(`${API_BASE}/api/ai-mentor/roadmaps`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = data?.detail?.message || data?.message || "Failed to generate roadmap.";
    throw new Error(msg);
  }
  return data;
}

export async function getStudentRoadmap(roadmapId: string): Promise<StudentLearningRoadmap> {
  const authHeaders = await getAuthHeaders();
  const res = await apiFetch(`${API_BASE}/api/ai-mentor/roadmaps/${encodeURIComponent(roadmapId)}`, {
    method: "GET",
    headers: { ...authHeaders },
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = data?.detail?.message || data?.message || "Failed to load roadmap.";
    throw new Error(msg);
  }
  return data;
}

export async function deleteStudentRoadmap(
  roadmapId: string
): Promise<{ success: boolean; message: string }> {
  const authHeaders = await getAuthHeaders();
  const res = await apiFetch(`${API_BASE}/api/ai-mentor/roadmaps/${encodeURIComponent(roadmapId)}`, {
    method: "DELETE",
    headers: { ...authHeaders },
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = data?.detail?.message || data?.message || "Failed to delete roadmap.";
    throw new Error(msg);
  }
  return data;
}

export async function convertRoadmapMilestonesToTasks(
  roadmapId: string,
  milestoneIds: string[]
): Promise<{ success: boolean; proposal: TaskActionProposal }> {
  const authHeaders = await getAuthHeaders();
  const res = await apiFetch(
    `${API_BASE}/api/ai-mentor/roadmaps/${encodeURIComponent(roadmapId)}/convert-to-tasks`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders },
      body: JSON.stringify({ milestone_ids: milestoneIds }),
    }
  );

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = data?.detail?.message || data?.message || "Failed to convert milestones into task proposals.";
    throw new Error(msg);
  }
  return data;
}

export async function getSkillGapAnalysis(
  targetRole?: string
): Promise<SkillGapAnalysisResult> {
  const authHeaders = await getAuthHeaders();
  const query = targetRole ? `?target_role=${encodeURIComponent(targetRole)}` : "";
  const res = await apiFetch(`${API_BASE}/api/ai-mentor/skill-gap-analysis${query}`, {
    method: "GET",
    headers: { ...authHeaders },
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = data?.detail?.message || data?.message || "Failed to load skill gap analysis.";
    throw new Error(msg);
  }
  return data;
}

export async function getWeeklyProgressReview(
  timezone?: string
): Promise<WeeklyProgressReviewResult> {
  const authHeaders = await getAuthHeaders();
  const tz = timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  const res = await apiFetch(`${API_BASE}/api/ai-mentor/weekly-review?timezone=${encodeURIComponent(tz)}`, {
    method: "GET",
    headers: { ...authHeaders },
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = data?.detail?.message || data?.message || "Failed to load weekly progress review.";
    throw new Error(msg);
  }
  return data;
}
