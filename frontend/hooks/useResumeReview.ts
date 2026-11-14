"use client";

import { useState, useRef, useCallback } from "react";
import { reviewResume, analyzeResumeFile, getAuthHeaders, handleGuestTokenFromResponse, API_BASE } from "@/lib/api";
import {
  UploadStage,
  ExtractionResult,
  ATSAnalysisReport,
  KeywordAnalysisReport,
  AIEvaluationReport,
  UnifiedScoreBreakdown,
  ResumeAnalysisDetail,
} from "@/types/career";
import { validateFile, computeStageNum } from "@/lib/career/helpers";

export function useResumeReview() {
  // Configuration (Step 1)
  const [targetRole, setTargetRole] = useState("Fullstack Software Engineer");
  const [jobDescription, setJobDescription] = useState("");
  const [companyType, setCompanyType] = useState("Product Based");
  const [yearsExperience, setYearsExperience] = useState("1-3 years");

  // Upload pipeline state machine
  const [uploadStage, setUploadStage] = useState<UploadStage>("idle");
  const [uploadProgress, setUploadProgress] = useState(0); // 0–100
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [savedAnalysisId, setSavedAnalysisId] = useState<string | null>(null);
  const [analysisCreatedAt, setAnalysisCreatedAt] = useState<string | null>(null);
  const [isHistorical, setIsHistorical] = useState(false);
  const [extraction, setExtraction] = useState<ExtractionResult | null>(null);
  const [editedText, setEditedText] = useState(""); // editable extracted text
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reviewText, setReviewText] = useState<string | null>(null);
  const [overallScore, setOverallScore] = useState<number | null>(null);
  const [scoringStatus, setScoringStatus] = useState<"scored" | "unscored" | null>(null);

  // Phase 2 Structured Evaluation Artifacts
  const [atsAnalysis, setAtsAnalysis] = useState<ATSAnalysisReport | null>(null);
  const [keywordAnalysis, setKeywordAnalysis] = useState<KeywordAnalysisReport | null>(null);
  const [aiEvaluation, setAiEvaluation] = useState<AIEvaluationReport | null>(null);
  const [scoreBreakdown, setScoreBreakdown] = useState<UnifiedScoreBreakdown | null>(null);
  const [careerStage, setCareerStage] = useState<string | null>(null);
  const [subScores, setSubScores] = useState<{
    ats: number | null;
    skills: number | null;
    content: number | null;
    structure: number | null;
  }>({
    ats: null,
    skills: null,
    content: null,
    structure: null,
  });

  // Drag state
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const stageNum = computeStageNum(uploadStage);

  // -------------------------------------------------------------------------
  // Core upload → extract pipeline (XHR upload progress)
  // -------------------------------------------------------------------------
  const uploadAndExtract = useCallback((file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setErrorMessage(validationError);
      setUploadStage("upload_error");
      return;
    }

    setUploadedFile(file);
    setSavedAnalysisId(null);
    setAnalysisCreatedAt(null);
    setIsHistorical(false);
    setErrorMessage(null);
    setExtraction(null);
    setReviewText(null);
    setAtsAnalysis(null);
    setKeywordAnalysis(null);
    setAiEvaluation(null);
    setScoreBreakdown(null);
    setCareerStage(null);
    setSubScores({ ats: null, skills: null, content: null, structure: null });
    setUploadProgress(0);
    setUploadStage("uploading");
    const formData = new FormData();
    formData.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_BASE}/api/resume/extract`);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const pct = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(pct);
        if (pct === 100) {
          setUploadStage("extracting");
        }
      }
    };

    xhr.onload = () => {
      handleGuestTokenFromResponse(xhr);
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300 && data.success) {
          const result: ExtractionResult = {
            filename: data.filename ?? file.name,
            text: data.text ?? "",
            charCount: data.char_count ?? data.text?.length ?? 0,
            file_type: data.file_type,
            is_scanned: data.is_scanned,
            detected_columns: data.detected_columns,
            page_count: data.page_count,
            extraction_quality: data.extraction_quality,
            warnings: data.warnings,
            extraction_report: data.extraction_report,
          };
          setExtraction(result);
          setEditedText(result.text);
          setUploadStage("extracted");
        } else {
          setErrorMessage(
            data.message ||
              `Extraction failed (HTTP ${xhr.status}). Please try again.`
          );
          setUploadStage("upload_error");
        }
      } catch {
        setErrorMessage(
          "Unexpected server response. Please try again later."
        );
        setUploadStage("upload_error");
      }
    };

    xhr.onerror = () => {
      setErrorMessage(
        "Network error — could not reach the extraction service. " +
          "Please ensure the FastAPI backend is running on port 8000."
      );
      setUploadStage("upload_error");
    };

    getAuthHeaders()
      .then((headers) => {
        Object.entries(headers).forEach(([k, v]) => xhr.setRequestHeader(k, v));
        xhr.send(formData);
      })
      .catch(() => {
        xhr.send(formData);
      });
  }, []);

  // -------------------------------------------------------------------------
  // File input change handler
  // -------------------------------------------------------------------------
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    uploadAndExtract(file);
  };

  // -------------------------------------------------------------------------
  // Drag & Drop handlers
  // -------------------------------------------------------------------------
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadAndExtract(file);
  };

  // -------------------------------------------------------------------------
  // AI Evaluation
  // -------------------------------------------------------------------------
  const handleRunEvaluation = async () => {
    const text = editedText.trim();
    if (!text) {
      setErrorMessage(
        "Resume text is empty. Please upload a file or edit the text above."
      );
      return;
    }
    if (text.length < 50) {
      setErrorMessage(
        "Resume text is too short to evaluate. Please check the extracted content."
      );
      return;
    }

    setErrorMessage(null);
    setReviewText(null);
    setOverallScore(null);
    setScoringStatus(null);
    setAtsAnalysis(null);
    setKeywordAnalysis(null);
    setAiEvaluation(null);
    setScoreBreakdown(null);
    setCareerStage(null);
    setSubScores({ ats: null, skills: null, content: null, structure: null });
    setUploadStage("reviewing");

    try {
      if (uploadedFile) {
        // Phase 3 Cloud Storage & Unified Analysis Pipeline
        const cloudRes = await analyzeResumeFile(uploadedFile, {
          jobDescription,
          targetRole,
          yearsExperience,
          companyType,
        });

        setSavedAnalysisId(cloudRes.id);
        setAnalysisCreatedAt(cloudRes.created_at);
        setIsHistorical(false);

        const reviewData = cloudRes.analysis_result;
        if (reviewData?.review) {
          setReviewText(reviewData.review);
          setAtsAnalysis(reviewData.ats_analysis ?? null);
          setKeywordAnalysis(reviewData.keyword_analysis ?? null);
          setAiEvaluation(reviewData.ai_evaluation ?? null);
          setScoreBreakdown(reviewData.score_breakdown ?? null);
          setCareerStage(reviewData.career_stage ?? null);
          setSubScores({
            ats: reviewData.ats_compatibility_score ?? cloudRes.ats_score ?? null,
            skills: reviewData.skills_match_score ?? cloudRes.skills_score ?? null,
            content: reviewData.content_quality_score ?? cloudRes.content_score ?? null,
            structure: reviewData.structure_score ?? cloudRes.structure_score ?? null,
          });

          if (typeof cloudRes.overall_score === "number" && !isNaN(cloudRes.overall_score)) {
            setOverallScore(cloudRes.overall_score);
            setScoringStatus("scored");
          } else {
            setOverallScore(null);
            setScoringStatus("unscored");
          }
          setUploadStage("done");
        } else {
          setErrorMessage("Received an empty response from the AI evaluator. Please try again.");
          setUploadStage("review_error");
        }
      } else {
        // Fallback for direct text editing or resume builder
        const res = await reviewResume(
          text,
          targetRole,
          yearsExperience,
          companyType,
          jobDescription,
          extraction?.filename,
          extraction?.detected_columns,
          extraction?.extraction_quality
        );
        if (res?.review) {
          setReviewText(res.review);
          setAtsAnalysis(res.ats_analysis ?? null);
          setKeywordAnalysis(res.keyword_analysis ?? null);
          setAiEvaluation(res.ai_evaluation ?? null);
          setScoreBreakdown(res.score_breakdown ?? null);
          setCareerStage(res.career_stage ?? null);
          setSubScores({
            ats: res.ats_compatibility_score ?? null,
            skills: res.skills_match_score ?? null,
            content: res.content_quality_score ?? null,
            structure: res.structure_score ?? null,
          });

          if (typeof res.overall_score === "number" && !isNaN(res.overall_score)) {
            setOverallScore(res.overall_score);
            setScoringStatus("scored");
          } else {
            setOverallScore(null);
            setScoringStatus("unscored");
          }
          setUploadStage("done");
        } else {
          setErrorMessage(
            "Received an empty response from the AI evaluator. Please try again."
          );
          setUploadStage("review_error");
        }
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to complete resume review.";
      setErrorMessage(msg);
      setUploadStage("review_error");
    }
  };

  // -------------------------------------------------------------------------
  // Load saved historical analysis without re-running AI
  // -------------------------------------------------------------------------
  const loadHistoricalAnalysis = useCallback((detail: ResumeAnalysisDetail) => {
    const result = detail.analysis_result;
    setUploadedFile(null);
    setSavedAnalysisId(detail.id);
    setAnalysisCreatedAt(detail.created_at);
    setIsHistorical(true);
    setErrorMessage(null);

    setReviewText(result.review || "");
    setOverallScore(result.overall_score ?? detail.overall_score ?? null);
    setScoringStatus(result.scoring_status ?? (detail.overall_score !== null ? "scored" : "unscored"));
    setAtsAnalysis(result.ats_analysis ?? null);
    setKeywordAnalysis(result.keyword_analysis ?? null);
    setAiEvaluation(result.ai_evaluation ?? null);
    setScoreBreakdown(result.score_breakdown ?? null);
    setCareerStage(result.career_stage ?? null);
    setSubScores({
      ats: result.ats_compatibility_score ?? detail.ats_score ?? null,
      skills: result.skills_match_score ?? detail.skills_score ?? null,
      content: result.content_quality_score ?? detail.content_score ?? null,
      structure: result.structure_score ?? detail.structure_score ?? null,
    });
    setExtraction({
      filename: detail.original_filename,
      text: result.extraction?.extracted_text || "",
      charCount: result.extraction?.char_count || 0,
      file_type: detail.file_type || result.extraction?.file_type,
      is_scanned: result.extraction?.is_scanned,
      detected_columns: result.extraction?.detected_columns,
      page_count: result.extraction?.page_count,
      extraction_quality: result.extraction?.extraction_quality,
      warnings: result.extraction?.warnings,
      extraction_report: result.extraction ?? undefined,
    });
    setEditedText(result.extraction?.extracted_text || "");
    setUploadStage("done");
  }, []);

  // -------------------------------------------------------------------------
  // Reset entire flow
  // -------------------------------------------------------------------------
  const resetAll = () => {
    setUploadStage("idle");
    setUploadedFile(null);
    setSavedAnalysisId(null);
    setAnalysisCreatedAt(null);
    setIsHistorical(false);
    setExtraction(null);
    setEditedText("");
    setReviewText(null);
    setOverallScore(null);
    setScoringStatus(null);
    setAtsAnalysis(null);
    setKeywordAnalysis(null);
    setAiEvaluation(null);
    setScoreBreakdown(null);
    setCareerStage(null);
    setSubScores({ ats: null, skills: null, content: null, structure: null });
    setErrorMessage(null);
    setUploadProgress(0);
    setIsDragging(false);
  };

  return {
    targetRole,
    setTargetRole,
    jobDescription,
    setJobDescription,
    companyType,
    setCompanyType,
    yearsExperience,
    setYearsExperience,
    uploadStage,
    setUploadStage,
    uploadProgress,
    uploadedFile,
    savedAnalysisId,
    analysisCreatedAt,
    isHistorical,
    extraction,
    editedText,
    setEditedText,
    errorMessage,
    reviewText,
    setReviewText,
    overallScore,
    setOverallScore,
    scoringStatus,
    setScoringStatus,
    atsAnalysis,
    keywordAnalysis,
    aiEvaluation,
    scoreBreakdown,
    careerStage,
    subScores,
    isDragging,
    fileInputRef,
    stageNum,
    uploadAndExtract,
    handleFileChange,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleRunEvaluation,
    loadHistoricalAnalysis,
    resetAll,
  };
}

export type UseResumeReviewReturn = ReturnType<typeof useResumeReview>;
