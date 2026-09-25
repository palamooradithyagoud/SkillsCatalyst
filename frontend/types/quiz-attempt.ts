/**
 * frontend/types/quiz-attempt.ts
 * TypeScript interfaces for Phase 6 — Student Quiz Attempts & Module Completion.
 *
 * Security contract:
 *   - StudentQuizOption and StudentQuizQuestion NEVER include is_correct.
 *   - The client submits only option IDs; the server calculates all scores.
 */

// ── Student-Safe Quiz Read ────────────────────────────────────────────────────

export interface StudentQuizOption {
  id: string;
  option_text: string;
  position: number;
  // NOTE: is_correct is intentionally absent — never exposed to student before submission.
}

export interface StudentQuizQuestion {
  id: string;
  question_text: string;
  question_type: "SINGLE_SELECT" | "MULTI_SELECT" | "TRUE_FALSE" | string;
  position: number;
  options: StudentQuizOption[];
}

export interface StudentQuizData {
  quiz_id: string;
  module_id: string;
  title: string;
  description?: string | null;
  passing_score: number;
  question_count: number;
  questions: StudentQuizQuestion[];
}

// ── Submission ────────────────────────────────────────────────────────────────

export interface QuizAnswerItem {
  question_id: string;
  selected_option_id: string;
}

export interface QuizSubmissionPayload {
  answers: QuizAnswerItem[];
}

// ── Result ────────────────────────────────────────────────────────────────────

export interface QuizAttemptAnswerResult {
  question_id: string;
  selected_option_id: string;
  is_correct: boolean;
}

export interface QuizAttemptResult {
  attempt_id: string;
  attempt_number: number;
  score_percentage: number;
  correct_count: number;
  total_questions: number;
  passed: boolean;
  passing_score: number;
  module_completed: boolean;
  answer_results: QuizAttemptAnswerResult[];
}

// ── Attempt History ───────────────────────────────────────────────────────────

export interface QuizAttemptHistoryItem {
  attempt_id: string;
  attempt_number: number;
  score_percentage: number;
  correct_count: number;
  total_questions: number;
  passed: boolean;
  passing_score: number;
  submitted_at?: string | null;
}

export interface QuizAttemptHistory {
  quiz_id: string;
  module_id: string;
  attempts: QuizAttemptHistoryItem[];
  best_score?: number | null;
  ever_passed: boolean;
}

// ── Module Progress ───────────────────────────────────────────────────────────

export interface StudentModuleProgress {
  module_id: string;
  lessons_complete: boolean;
  quiz_passed: boolean;
  best_score?: number | null;
  completed: boolean;
  completed_at?: string | null;
}
