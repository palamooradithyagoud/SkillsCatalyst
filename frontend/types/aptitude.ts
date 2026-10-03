/**
 * SkillsCatalyst Placement Prep & Question Bank Domain Types
 * Strongly typed Supabase models and client presentation DTOs
 */

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Topic {
  id: string;
  category_id: string;
  slug: string;
  name: string;
  description: string | null;
  display_order: number;
  is_active: boolean;
  question_count?: number;
  created_at: string;
  updated_at: string;
}

export interface QuestionOptionDTO {
  id: string;
  key: string; // 'A' | 'B' | 'C' | 'D' | 'E'
  text: string;
  display_order: number;
}

export interface QuestionDTO {
  id: string;
  topic_id: string;
  question_code: string;
  legacy_id: number;
  question_text: string;
  difficulty: "easy" | "medium" | "hard";
  source: string;
  options: QuestionOptionDTO[];
}

export interface QuestionAttemptResult {
  is_correct: boolean;
  correct_option_id: string;
  explanation: string;
}

export interface QuestionAttempt {
  id: string;
  user_id: string;
  question_id: string;
  selected_option_id: string | null;
  is_correct: boolean;
  time_taken_seconds: number;
  attempted_at: string;
}

export interface UserTopicProgress {
  id: string;
  user_id: string;
  topic_id: string;
  total_questions: number;
  attempted_count: number;
  solved_count: number;
  total_time_seconds: number;
  last_practiced_at: string;
}

export interface TopicBookmark {
  id: string;
  user_id: string;
  topic_id: string;
  created_at: string;
}

export interface QuestionBookmark {
  id: string;
  user_id: string;
  question_id: string;
  created_at: string;
}

/**
 * Backward compatibility adapter for PlacementQuestion
 * Ensures existing quiz cards, sheet views, and timer logic work without regression.
 */
export interface LegacyPlacementQuestion {
  id: number;
  dbId?: string;
  question: string;
  options: string[];
  correctIndex?: number;
  answerText?: string;
  solution?: string;
}
