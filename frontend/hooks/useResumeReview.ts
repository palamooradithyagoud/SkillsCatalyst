"use client";

import { useState, useRef, useCallback } from "react";
import { reviewResume, getAuthHeaders, handleGuestTokenFromResponse, API_BASE } from "@/lib/api";
import { UploadStage, ExtractionResult } from "@/types/career";
import { validateFile, computeStageNum } from "@/lib/career/helpers";

export function useResumeReview() {
  // Configuration (Step 1)
  const [targetRole, setTargetRole] = useState("Fullstack Software Engineer");
  const [jobDescription, setJobDescription] = useState("");
  const [companyType, setCompanyType] = useState("Product-Based");
  const [yearsExperience, setYearsExperience] = useState("1-3 years");

  // Upload pipeline state machine
  const [uploadStage, setUploadStage] = useState<UploadStage>("idle");
  const [uploadProgress, setUploadProgress] = useState(0); // 0–100
  const [extraction, setExtraction] = useState<ExtractionResult | null>(null);
  const [editedText, setEditedText] = useState(""); // editable extracted text
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reviewText, setReviewText] = useState<string | null>(null);

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

    setErrorMessage(null);
    setExtraction(null);
    setReviewText(null);
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
          "Unexpected server response. Please check the backend is running."
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
    setUploadStage("reviewing");

    try {
      const res = await reviewResume(
        text,
        targetRole,
        yearsExperience,
        companyType,
        jobDescription
      );
      if (res?.review) {
        setReviewText(res.review);
        setUploadStage("done");
      } else {
        setErrorMessage(
          "Received an empty response from the AI evaluator. Please try again."
        );
        setUploadStage("review_error");
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to complete resume review.";
      setErrorMessage(msg);
      setUploadStage("review_error");
    }
  };

  // -------------------------------------------------------------------------
  // Reset entire flow
  // -------------------------------------------------------------------------
  const resetAll = () => {
    setUploadStage("idle");
    setExtraction(null);
    setEditedText("");
    setReviewText(null);
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
    extraction,
    editedText,
    setEditedText,
    errorMessage,
    reviewText,
    isDragging,
    fileInputRef,
    stageNum,
    uploadAndExtract,
    handleFileChange,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleRunEvaluation,
    resetAll,
  };
}

export type UseResumeReviewReturn = ReturnType<typeof useResumeReview>;
