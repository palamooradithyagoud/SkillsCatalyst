export type UploadStage =
  | "idle"           // Nothing uploaded yet
  | "uploading"      // File is being sent to /api/resume/extract
  | "extracting"     // Waiting for extraction response
  | "extracted"      // Text received — shown in editable textarea
  | "reviewing"      // Sent to /api/ai-mentor/review-resume, waiting
  | "done"           // Review displayed
  | "upload_error"   // Extraction failed
  | "review_error";  // AI review failed

export interface ExtractionResult {
  filename: string;
  text: string;
  charCount: number;
}

export interface CompanyTypeItem {
  id: string;
  title: string;
  badge: string;
  desc: string;
}

export interface ExpLevelItem {
  id: string;
  label: string;
}

export interface ResumeReviewResponse {
  review: string;
  overall_score?: number | null;
  scoring_status?: "scored" | "unscored";
  ats_compatibility_score?: number | null;
  skills_match_score?: number | null;
  experience_score?: number | null;
  structure_score?: number | null;
  content_quality_score?: number | null;
  score_status?: "pending" | "completed" | "partially_completed" | "failed";
  filename?: string | null;
  persisted?: boolean;
}
