/**
 * frontend/types/ai-mentor-personalization.ts
 * TypeScript interfaces for Phase 2C Personalized AI Mentor.
 * Aligned with backend Pydantic models.
 * Strict zero-emoji compliance.
 */

export type ExperienceLevel = "Beginner" | "Intermediate" | "Advanced" | "Student";

export type RoadmapStatus = "active" | "completed" | "archived";

export type MilestoneStatus = "not_started" | "in_progress" | "completed";

export type SkillStatus =
  | "verified"
  | "self_reported"
  | "target_desired"
  | "confirmed_gap"
  | "unevaluated";

export interface StudentLearningProfile {
  user_id: string;
  career_goal: string;
  experience_level: ExperienceLevel;
  existing_skills: string[];
  target_skills: string[];
  learning_preferences: string[];
  preferred_daily_minutes: number;
  short_term_objective: string;
  long_term_objective: string;
  target_date?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface UpdateLearningProfileRequest {
  career_goal?: string;
  experience_level?: ExperienceLevel;
  existing_skills?: string[];
  target_skills?: string[];
  learning_preferences?: string[];
  preferred_daily_minutes?: number;
  short_term_objective?: string;
  long_term_objective?: string;
  target_date?: string | null;
}

export interface RoadmapMilestone {
  id: string;
  title: string;
  description?: string;
  stage_index: number;
  suggested_duration_minutes?: number;
  skills_covered: string[];
  status: MilestoneStatus;
  prerequisites: string[];
  target_date?: string | null;
}

export interface RoadmapStage {
  stage_index: number;
  title: string;
  description?: string;
  milestones: RoadmapMilestone[];
}

export interface StudentLearningRoadmap {
  id: string;
  user_id: string;
  title: string;
  career_goal: string;
  starting_level: ExperienceLevel;
  stages: RoadmapStage[];
  milestones: RoadmapMilestone[];
  status: RoadmapStatus;
  created_at?: string;
  updated_at?: string;
}

export interface GenerateRoadmapRequest {
  career_goal: string;
  starting_level?: ExperienceLevel;
  target_months?: number;
  focus_areas?: string[];
}

export interface ConvertMilestonesToTasksRequest {
  roadmap_id: string;
  milestone_ids: string[];
}

export interface SkillGapItem {
  skill_name: string;
  status: SkillStatus;
  importance: string;
  reason: string;
  recommended_action: string;
}

export interface SkillGapAnalysisResult {
  target_role: string;
  current_level: string;
  confirmed_skills: string[];
  missing_critical_skills: string[];
  skills_in_progress: string[];
  gaps: SkillGapItem[];
  recommended_next_steps: string[];
}

export interface WeeklyProgressReviewResult {
  start_date: string;
  end_date: string;
  timezone: string;
  tasks_completed_count: number;
  completed_tasks: { id: string; title: string; category?: string; completed_at?: string }[];
  pending_tasks_count: number;
  overdue_tasks_count: number;
  overdue_tasks: { id: string; title: string; due_at?: string }[];
  active_goals: string[];
  milestones_progressed: string[];
  bottlenecks: string[];
  achievements: string[];
  suggested_priorities_next_week: string[];
}
