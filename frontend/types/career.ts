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
  file_type?: string;
  is_scanned?: boolean;
  detected_columns?: number;
  page_count?: number;
  extraction_quality?: number;
  warnings?: string[];
  extraction_report?: Record<string, any>;
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

export type ATSFindingSeverity = "critical" | "warning" | "good";

export interface ATSFinding {
  category: string;
  severity: ATSFindingSeverity;
  issue: string;
  evidence?: string | null;
  impact: string;
  recommended_fix: string;
}

export interface ContactInformation {
  has_email: boolean;
  email?: string | null;
  has_phone: boolean;
  phone?: string | null;
  has_linkedin: boolean;
  linkedin?: string | null;
  has_github: boolean;
  github?: string | null;
  has_portfolio: boolean;
  portfolio?: string | null;
  location?: string | null;
  missing_critical?: string[];
}

export interface ATSAnalysisReport {
  ats_compatibility_score: number;
  structure_score: number;
  contact_info: ContactInformation;
  detected_sections: Record<string, string>;
  missing_essential_sections: string[];
  findings: ATSFinding[];
  critical_issues_count: number;
  warnings_count: number;
  passes_count: number;
  career_stage_detected: string;
  table_detected: boolean;
  multi_column_detected: boolean;
  summary: string;
}

export interface KeywordItem {
  name: string;
  category: string;
  matched_aliases?: string[];
  frequency?: number;
  source?: string;
}

export interface KeywordAnalysisReport {
  target_role: string;
  total_analyzed_keywords: number;
  matched_count: number;
  missing_count: number;
  keyword_match_percentage: number;
  matched: KeywordItem[];
  missing: KeywordItem[];
  category_breakdown?: Record<string, { matched: number; total: number }>;
}

export interface AIBulletRewrite {
  original: string;
  improved: string;
  reason?: string;
  metrics_added?: string[];
}

export interface AIImprovementItem {
  priority: "high" | "medium" | "low";
  section: string;
  issue: string;
  action: string;
}

export interface AIEvaluationReport {
  career_stage: string;
  summary_verdict: string;
  content_quality_score: number;
  fresher_potential_score?: number | null;
  missing_measurable_results: string[];
  weak_bullet_points: string[];
  rewritten_bullets: AIBulletRewrite[];
  improvements: AIImprovementItem[];
  anti_hallucination_verified: boolean;
}

export interface ScoreComponent {
  raw_score: number | null;
  weight: number;
  weighted_score: number | null;
  included: boolean;
  reason?: string;
}

export interface SkillEvidenceCitation {
  section: string;
  snippet: string;
  confidence: number;
}

export interface SkillEvidenceItem {
  skill: string;
  category: string;
  classification: "demonstrated" | "partially_demonstrated" | "mentioned_only" | "unsupported_claim" | "requires_verification";
  evidence: SkillEvidenceCitation[];
  confidence: number;
  explanation: string;
}

export interface SkillEvidenceReport {
  technical_skills_score: number;
  total_declared_skills: number;
  demonstrated_count: number;
  partially_demonstrated_count: number;
  mentioned_only_count: number;
  unsupported_count: number;
  demonstration_rate: number;
  items: SkillEvidenceItem[];
  demonstrated_skills: string[];
  mentioned_only_skills: string[];
  recommendations: string[];
}

export interface ProjectEvaluationReport {
  projects_experience_score: number;
  project_count: number;
  experience_count: number;
  total_metrics_count: number;
  technical_depth_level: string;
  career_stage_applied: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

export interface EducationEvaluationReport {
  education_certifications_score: number;
  has_degree: boolean;
  completeness_status: string;
  has_certifications: boolean;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

export interface ContentQualityReport {
  content_quality_score: number;
  strong_action_verbs_count: number;
  weak_action_verbs_count: number;
  quantifiable_metrics_count: number;
  metric_bullet_percentage: number;
  star_alignment_percentage: number;
  total_bullets_analyzed: number;
  fluff_phrases_detected: string[];
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

export interface RecruiterEvaluationReport {
  first_10_second_impression: string;
  overall_qualitative_verdict: string;
  recruiter_strengths: string[];
  recruiter_concerns: string[];
  top_improvement_recommendations: string[];
  timeline_flags: string[];
  positioning_clarity: string;
}

export interface MatchedSkillDetail {
  name: string;
  category: string;
  match_type: string;
  is_demonstrated: boolean;
  is_required: boolean;
}

export interface JobMatchingReport {
  job_match_status: "evaluated" | "not_evaluated";
  job_match_score: number | null;
  target_job_title?: string | null;
  required_skills_count: number;
  matched_required_count: number;
  preferred_skills_count: number;
  matched_preferred_count: number;
  demonstrated_matches_count: number;
  matched_skills: MatchedSkillDetail[];
  missing_required_skills: string[];
  missing_preferred_skills: string[];
  explanation: string;
  tailoring_recommendations: string[];
}

export interface UnifiedScoreBreakdown {
  overall_score: number | null;
  ats_compatibility: ScoreComponent;
  keyword_coverage?: ScoreComponent;
  technical_skills?: ScoreComponent;
  projects_experience?: ScoreComponent;
  education_certifications?: ScoreComponent;
  content_quality: ScoreComponent;
  structure: ScoreComponent;
  skills_match?: ScoreComponent;
  weights_used: Record<string, number>;
  formula?: string;
  evaluated_categories_count?: number;
  total_categories_count?: number;
  score_status: "completed" | "partially_completed" | "failed";
  scoring_mode: string;
  explanation: string;
}

export interface ResumeReviewResponse {
  review: string;
  overall_score?: number | null;
  scoring_status?: "scored" | "unscored";
  ats_compatibility_score?: number | null;
  keyword_coverage_score?: number | null;
  technical_skills_score?: number | null;
  projects_experience_score?: number | null;
  education_certifications_score?: number | null;
  skills_match_score?: number | null;
  experience_score?: number | null;
  structure_score?: number | null;
  content_quality_score?: number | null;
  score_status?: "pending" | "completed" | "partially_completed" | "failed";
  filename?: string | null;
  persisted?: boolean;
  career_stage?: string | null;
  ats_analysis?: ATSAnalysisReport | null;
  keyword_analysis?: KeywordAnalysisReport | null;
  skill_evidence?: SkillEvidenceReport | null;
  projects_evaluation?: ProjectEvaluationReport | null;
  education_evaluation?: EducationEvaluationReport | null;
  content_quality?: ContentQualityReport | null;
  recruiter_evaluation?: RecruiterEvaluationReport | null;
  job_matching?: JobMatchingReport | null;
  ai_evaluation?: AIEvaluationReport | null;
  score_breakdown?: UnifiedScoreBreakdown | null;
  extraction?: Record<string, any> | null;
}

// ---------------------------------------------------------------------------
// Phase 3 Cloud Storage & Resume History Types
// ---------------------------------------------------------------------------

export interface ResumeHistoryItem {
  id: string;
  user_id: string;
  original_filename: string;
  storage_path: string;
  file_type?: string | null;
  file_size?: number | null;
  ats_score?: number | null;
  content_score?: number | null;
  skills_score?: number | null;
  structure_score?: number | null;
  overall_score?: number | null;
  job_description?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface ResumeHistoryResponse {
  success: boolean;
  items: ResumeHistoryItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ResumeAnalysisDetail extends ResumeHistoryItem {
  analysis_result: ResumeReviewResponse;
}

export interface ResumeAnalyzeResponse {
  success: boolean;
  id: string;
  resume_series_id?: string | null;
  version_number?: number | null;
  previous_analysis_id?: string | null;
  original_filename: string;
  storage_path: string;
  overall_score: number | null;
  ats_score: number | null;
  content_score: number | null;
  skills_score: number | null;
  structure_score: number | null;
  created_at: string;
  persisted: boolean;
  analysis_result: ResumeReviewResponse;
}

// ---------------------------------------------------------------------------
// Phase 4: Resume Series, Versioning, Comparison & Growth Tracking Types
// ---------------------------------------------------------------------------

export interface ResumeSeriesItem {
  id: string;
  user_id: string;
  title: string;
  target_role?: string | null;
  description?: string | null;
  created_at: string;
  updated_at: string;
  versions_count: number;
  latest_version?: number | null;
  latest_score?: number | null;
  best_score?: number | null;
  latest_analysis_id?: string | null;
  latest_filename?: string | null;
}

export interface ResumeSeriesDetail extends ResumeSeriesItem {
  versions: ResumeHistoryItem[];
}

export interface ScoreDiff {
  previous: number | null;
  current: number | null;
  delta: number | null;
  percentage_change: number | null;
  status: "improved" | "declined" | "unchanged" | "not_comparable";
}

export interface ResumeComparisonResponse {
  success: boolean;
  older_version: {
    id: string;
    version_number: number;
    filename: string;
    created_at: string;
    scoring_engine_version: string;
    overall_score: number | null;
  };
  newer_version: {
    id: string;
    version_number: number;
    filename: string;
    created_at: string;
    scoring_engine_version: string;
    overall_score: number | null;
  };
  scores: {
    overall: ScoreDiff;
    ats: ScoreDiff;
    content: ScoreDiff;
    skills: ScoreDiff;
    structure: ScoreDiff;
  };
  content_changes: {
    sections: {
      added: string[];
      removed: string[];
      retained: string[];
    };
    skills: {
      added: string[];
      removed: string[];
      retained_count: number;
      total_previous: number;
      total_current: number;
    };
    projects: {
      added_count: number;
      removed_count: number;
      added_titles: string[];
      removed_titles: string[];
    };
    certifications: {
      added: string[];
      removed: string[];
    };
  };
  keyword_changes: {
    newly_matched_keywords: string[];
    lost_keywords: string[];
    resolved_missing_keywords: string[];
    unresolved_missing_keywords: string[];
    job_descriptions_differ: boolean;
    warning?: string | null;
  };
  compatibility: {
    engine_compatible: boolean;
    warning?: string | null;
    job_descriptions_differ: boolean;
  };
  summary: {
    what_improved: string[];
    what_became_weaker: string[];
    recommendations_addressed: string[];
    recommendations_unresolved: string[];
    next_action_items: string[];
  };
}

export interface GrowthTimelinePoint {
  version_number: number;
  analysis_id: string;
  created_at: string;
  filename: string;
  overall_score: number | null;
  ats_score: number | null;
  content_score: number | null;
  skills_score: number | null;
  structure_score: number | null;
}

export interface GrowthMilestone {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  unlocked_at?: string | null;
  badge_color: string;
}

export interface RecurringWeakness {
  weakness: string;
  occurrences: number;
  status: "resolved" | "persisting";
}

export interface ResumeProgressResponse {
  success: boolean;
  series: {
    id: string;
    title: string;
    target_role?: string | null;
    description?: string | null;
  };
  growth: {
    current_overall_score: number | null;
    previous_overall_score: number | null;
    best_score: number | null;
    total_versions: number;
    total_score_improvement: number;
    last_analyzed_date?: string | null;
  };
  timeline: GrowthTimelinePoint[];
  category_indicators: {
    overall: "improved" | "declined" | "unchanged" | "not_comparable";
    ats: "improved" | "declined" | "unchanged" | "not_comparable";
    content: "improved" | "declined" | "unchanged" | "not_comparable";
    skills: "improved" | "declined" | "unchanged" | "not_comparable";
    structure: "improved" | "declined" | "unchanged" | "not_comparable";
  };
  milestones: GrowthMilestone[];
  recurring_weaknesses: RecurringWeakness[];
}

// ---------------------------------------------------------------------------
// Phase 5: AI Resume Builder & Job-Specific Optimization Types
// ---------------------------------------------------------------------------

export interface ResumeBuilderDocument {
  id: string;
  user_id: string;
  resume_series_id?: string | null;
  title: string;
  selected_template: string;
  structured_resume_data: Record<string, any>;
  target_role?: string | null;
  source_analysis_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ResumeBuilderVersion {
  id: string;
  document_id: string;
  user_id: string;
  resume_series_id?: string | null;
  version_number: number;
  structured_resume_data: Record<string, any>;
  selected_template: string;
  analysis_id?: string | null;
  change_summary?: string | null;
  created_at: string;
}

export interface JobOptimizationRecommendation {
  id: string;
  section: string;
  type: string;
  original_content: string;
  suggested_content: string;
  reason: string;
  supporting_evidence: string;
  relevant_job_requirement: string;
  status: "pending" | "accepted" | "rejected" | "advisory";
}

export interface JobOptimizationSession {
  id: string;
  user_id: string;
  document_id?: string | null;
  job_title?: string | null;
  company_name?: string | null;
  experience_level?: string | null;
  job_description: string;
  extracted_requirements: {
    required_skills: string[];
    preferred_skills: string[];
    soft_skills: string[];
    experience_requirements: string;
    education_requirements: string;
    responsibilities: string[];
    tools_and_tech: string[];
    keywords: string[];
  };
  keyword_analysis: {
    keyword_match_percentage: number;
    matched_skills: string[];
    missing_skills: string[];
    unsupported_skills: string[];
    preferred_matches: string[];
    total_required_skills: number;
    total_matched_skills: number;
  };
  recommendations: JobOptimizationRecommendation[];
  created_at: string;
  updated_at: string;
}

export interface AIImproveBulletResponse {
  original_text: string;
  suggestions: string[];
  improvement_reason: string;
  supporting_evidence: string;
  requires_user_confirmation: boolean;
}

export interface AIWritingFeedbackResponse {
  word_count: number;
  strengths: string[];
  weak_points: string[];
  actionable_opportunities: string[];
  quality_rating: string;
}
