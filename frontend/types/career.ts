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
