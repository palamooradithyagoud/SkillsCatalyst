"use client";

import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Briefcase,
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  RefreshCw,
  X,
  Building2,
  UserCheck,
  ChevronLeft,
  RotateCcw,
  Edit3,
  FileCheck,
  CloudUpload,
  FileBadge,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import StageIndicator from "./StageIndicator";
import ResumeMarkdownViewer from "./ResumeMarkdownViewer";
import {
  COMMON_ROLES,
  COMPANY_TYPES,
  EXP_LEVELS,
  FILE_TYPE_COLORS,
  MAX_FILE_MB,
} from "@/data/career/constants";
import { getFileExt } from "@/lib/career/helpers";
import { UseResumeReviewReturn } from "@/hooks/useResumeReview";
import { useSubscription } from "@/hooks/useSubscription";
import { UpgradeCTA, UsageLimitIndicator } from "@/components/premium";

interface ResumeReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  reviewState: UseResumeReviewReturn;
}

export default function ResumeReviewModal({
  isOpen,
  onClose,
  reviewState,
}: ResumeReviewModalProps) {
  const { isPremium, getLimit } = useSubscription();
  const mentorLimit = isPremium ? null : (getLimit("ai_mentor") ?? 1);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === "undefined") {
    return null;
  }

  const {
    targetRole,
    setTargetRole,
    jobDescription,
    setJobDescription,
    companyType,
    setCompanyType,
    yearsExperience,
    setYearsExperience,
    uploadStage,
    uploadProgress,
    extraction,
    editedText,
    setEditedText,
    errorMessage,
    reviewText,
    isDragging,
    fileInputRef,
    stageNum,
    handleFileChange,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleRunEvaluation,
    resetAll,
  } = reviewState;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-hidden select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.2 }}
          className="bg-white border-0 sm:border border-purple-200 w-full h-full sm:h-auto sm:max-w-4xl sm:max-h-[92vh] sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col z-[10000]"
        >
          {/* Modal Header */}
          <div className="p-4 sm:p-5 md:p-6 border-b border-purple-100 flex items-center justify-between bg-white shrink-0 gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <button
                onClick={onClose}
                className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 transition-colors flex items-center gap-1 text-xs font-bold shrink-0 border border-purple-200 active:scale-95 cursor-pointer shadow-2xs"
                aria-label="Back"
              >
                <ChevronLeft className="w-4 h-4 text-purple-600" />
                <span className="hidden sm:inline">Back</span>
              </button>
              <div className="p-2 rounded-xl bg-purple-100 border border-purple-200 text-purple-600 shrink-0">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm sm:text-lg font-black text-slate-900 truncate leading-tight">
                  AI Resume Evaluator
                </h3>
                <p className="text-[10px] sm:text-xs text-slate-500 truncate hidden sm:block mt-0.5">
                  Calibrated for specific Target Role &amp; Company Type
                </p>
              </div>
            </div>

            {/* Progress steps */}
            <div className="hidden md:flex items-center gap-3 mr-2 shrink-0">
              <StageIndicator stage={1} currentStage={stageNum} label="Configure" />
              <div className="w-4 h-px bg-purple-200" />
              <StageIndicator stage={2} currentStage={stageNum} label="Upload" />
              <div className="w-4 h-px bg-purple-200" />
              <StageIndicator stage={3} currentStage={stageNum} label="Review" />
              <div className="w-4 h-px bg-purple-200" />
              <StageIndicator stage={4} currentStage={stageNum} label="Evaluate" />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <UsageLimitIndicator
                used={0}
                limit={mentorLimit}
                unitName="AI Reviews"
                isPremium={isPremium}
                compact
              />
              <button
                id="close-resume-modal"
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-purple-50 transition-colors shrink-0 cursor-pointer active:scale-95"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6 pb-28 sm:pb-8 bg-slate-50/40">
            {/* ──────────────────────────────────────────────────────────
                SECTION A: Configuration (always visible until done)
            ────────────────────────────────────────────────────────── */}
            {uploadStage !== "reviewing" && uploadStage !== "done" && (
              <div className="space-y-6">
                {/* Step 1: Target Role */}
                <div className="bg-white border border-purple-100 rounded-2xl p-5 shadow-2xs space-y-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-purple-900 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-purple-600" />
                    1. Target Role &amp; Job Description
                  </label>
                  <input
                    id="target-role-input"
                    type="text"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    list="common-roles"
                    placeholder="e.g. Fullstack Software Engineer, SDE-2, Backend Engineer..."
                    className="w-full px-4 py-3 bg-white border border-purple-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-500/15 transition-all"
                  />
                  <datalist id="common-roles">
                    {COMMON_ROLES.map((r) => (
                      <option key={r} value={r} />
                    ))}
                  </datalist>
                  <textarea
                    id="job-description-input"
                    rows={3}
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Optional: Paste target Job Description for custom keyword & skill matching..."
                    className="w-full px-4 py-3 bg-white border border-purple-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-500/15 transition-all resize-none"
                  />
                </div>

                {/* Step 2: Company Type */}
                <div className="bg-white border border-purple-100 rounded-2xl p-5 shadow-2xs space-y-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-purple-900 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-purple-600" />
                    2. Target Company Type (Rubric Calibration)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {COMPANY_TYPES.map((type) => {
                      const isSelected = companyType === type.id;
                      return (
                        <div
                          key={type.id}
                          onClick={() => setCompanyType(type.id)}
                          className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            isSelected
                              ? "bg-purple-50/80 border-purple-600 text-purple-950 shadow-md shadow-purple-600/10 ring-2 ring-purple-100"
                              : "bg-white border-purple-100 text-slate-600 hover:border-purple-300 hover:bg-purple-50/30"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span
                              className={`text-sm font-bold ${
                                isSelected ? "text-purple-950" : "text-slate-900"
                              }`}
                            >
                              {type.title}
                            </span>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-bold border transition-colors ${
                                isSelected
                                  ? "bg-purple-600 text-white border-purple-600"
                                  : "bg-purple-50 text-purple-700 border-purple-200"
                              }`}
                            >
                              {type.badge}
                            </span>
                          </div>
                          <p
                            className={`text-xs leading-relaxed ${
                              isSelected ? "text-purple-900/80 font-medium" : "text-slate-500"
                            }`}
                          >
                            {type.desc}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Step 3: Experience Level */}
                <div className="bg-white border border-purple-100 rounded-2xl p-5 shadow-2xs space-y-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-purple-900 flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-purple-600" />
                    3. Claimed Experience Level
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {EXP_LEVELS.map((exp) => {
                      const isSelected = yearsExperience === exp.id;
                      return (
                        <button
                          key={exp.id}
                          type="button"
                          onClick={() => setYearsExperience(exp.id)}
                          className={`p-2.5 rounded-xl text-xs font-bold text-center border-2 transition-all cursor-pointer ${
                            isSelected
                              ? "bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-600/20"
                              : "bg-white border-purple-200 text-slate-700 hover:text-purple-700 hover:border-purple-400 hover:bg-purple-50/50"
                          }`}
                        >
                          {exp.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ──────────────────────────────────────────────────────
                    SECTION B: Upload Zone (idle / error)
                ────────────────────────────────────────────────────── */}
                {(uploadStage === "idle" || uploadStage === "upload_error") && (
                  <div className="bg-white border border-purple-100 rounded-2xl p-5 shadow-2xs space-y-3">
                    <label className="text-xs font-bold uppercase tracking-wider text-purple-900 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-purple-600" />
                      4. Upload Resume
                    </label>

                    {/* Drop Zone */}
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
                        isDragging
                          ? "border-purple-600 bg-purple-50 scale-[1.01]"
                          : "border-purple-200 hover:border-purple-500 bg-purple-50/20 hover:bg-purple-50/40"
                      }`}
                    >
                      <CloudUpload
                        className={`w-10 h-10 mx-auto mb-3 transition-colors ${
                          isDragging ? "text-purple-600" : "text-purple-500"
                        }`}
                      />
                      <h4 className="text-sm font-bold text-slate-900 mb-1">
                        {isDragging
                          ? "Drop your resume here"
                          : "Drag & Drop or Click to Upload"}
                      </h4>
                      <p className="text-xs text-slate-500 mb-2">
                        Supports PDF, DOCX, TXT, MD · Max {MAX_FILE_MB} MB
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Your file is sent directly to a secure extraction service.
                        No binary data reaches the AI model.
                      </p>
                      <input
                        id="resume-file-input"
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.docx,.doc,.txt,.md"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </div>

                    {/* Upload error */}
                    {uploadStage === "upload_error" && errorMessage && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5"
                      >
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                        <div>
                          <p className="font-semibold mb-0.5 text-rose-900">
                            Extraction Failed
                          </p>
                          <p>{errorMessage}</p>
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}

                {/* ──────────────────────────────────────────────────────
                    SECTION C: Uploading / Extracting Progress
                ────────────────────────────────────────────────────── */}
                {(uploadStage === "uploading" || uploadStage === "extracting") && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4 p-6 rounded-2xl bg-white border border-purple-200 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-purple-100 text-purple-700 border border-purple-200">
                        {uploadStage === "uploading" ? (
                          <Upload className="w-5 h-5 text-purple-600" />
                        ) : (
                          <FileBadge className="w-5 h-5 text-purple-600 animate-pulse" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">
                          {uploadStage === "uploading"
                            ? "Uploading resume..."
                            : "Extracting text from document..."}
                        </p>
                        <p className="text-xs text-slate-500">
                          {uploadStage === "uploading"
                            ? `${uploadProgress}% transferred`
                            : "PyMuPDF / python-docx processing..."}
                        </p>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                      <motion.div
                        className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full"
                        initial={{ width: "0%" }}
                        animate={{
                          width:
                            uploadStage === "extracting"
                              ? "100%"
                              : `${uploadProgress}%`,
                        }}
                        transition={{ duration: 0.4 }}
                      />
                    </div>

                    {uploadStage === "extracting" && (
                      <div className="flex items-center gap-2 text-xs text-purple-700 font-medium">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-600" />
                        <span>
                          Backend is parsing your document — this takes 1–3 seconds...
                        </span>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* ──────────────────────────────────────────────────────
                    SECTION D: Extracted Text — Editable
                ────────────────────────────────────────────────────── */}
                {(uploadStage === "extracted" || uploadStage === "review_error") &&
                  extraction && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white border border-purple-100 rounded-2xl p-5 shadow-2xs space-y-3"
                    >
                      {/* File badge */}
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold uppercase tracking-wider text-purple-900 flex items-center gap-2">
                          <Edit3 className="w-4 h-4 text-purple-600" />
                          4. Extracted Resume Text
                          <span className="ml-1 text-[10px] font-normal text-slate-500 normal-case">
                            (editable — correct OCR errors if needed)
                          </span>
                        </label>
                        <button
                          onClick={resetAll}
                          className="text-xs text-purple-700 hover:text-purple-900 flex items-center gap-1 transition-colors cursor-pointer bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200"
                        >
                          <RotateCcw className="w-3 h-3" />
                          Upload different file
                        </button>
                      </div>

                      {/* File info strip */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <div
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-bold uppercase ${
                            FILE_TYPE_COLORS[getFileExt(extraction.filename)] ??
                            "text-purple-700 bg-purple-50 border-purple-200"
                          }`}
                        >
                          <FileCheck className="w-3 h-3" />
                          {getFileExt(extraction.filename).toUpperCase()}
                        </div>
                        <span className="text-xs text-slate-700 truncate max-w-xs font-medium">
                          {extraction.filename}
                        </span>
                        <span className="ml-auto text-xs text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                          {editedText.length.toLocaleString()} chars
                        </span>
                      </div>

                      {/* Editable textarea */}
                      <textarea
                        id="extracted-resume-textarea"
                        value={editedText}
                        onChange={(e) => setEditedText(e.target.value)}
                        rows={12}
                        spellCheck={false}
                        className="w-full px-4 py-3 bg-slate-50 border border-purple-200 focus:border-purple-600 focus:bg-white rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none transition-colors resize-y font-mono leading-relaxed"
                        placeholder="Extracted text will appear here..."
                      />

                      {/* Extraction success note */}
                      <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                        <span>
                          Text extracted successfully by backend — ready for AI evaluation.
                        </span>
                      </div>

                      {/* Review error */}
                      {errorMessage && (
                        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-start gap-2.5">
                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                            <div>
                              <p className="font-semibold mb-0.5 text-rose-900">
                                {errorMessage.toLowerCase().includes("limit")
                                  ? "AI Review Quota Reached"
                                  : "AI Review Failed"}
                              </p>
                              <p className="text-rose-700">{errorMessage}</p>
                            </div>
                          </div>
                          {(errorMessage.toLowerCase().includes("limit") ||
                            errorMessage.toLowerCase().includes("premium")) && (
                            <UpgradeCTA
                              label="Upgrade for Unlimited Reviews"
                              size="xs"
                              variant="secondary"
                              className="shrink-0"
                            />
                          )}
                        </div>
                      )}

                      {/* Evaluate button */}
                      <button
                        id="run-evaluation-btn"
                        type="button"
                        onClick={handleRunEvaluation}
                        disabled={!editedText.trim() || editedText.length < 50}
                        className="w-full bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all shadow-md shadow-purple-600/25 flex items-center justify-center gap-2 text-sm cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>Evaluate Resume with Groq AI</span>
                        <span className="ml-1 text-[10px] opacity-80 font-normal">
                          ({editedText.length.toLocaleString()} chars · full resume)
                        </span>
                      </button>
                    </motion.div>
                  )}
              </div>
            )}

            {/* ──────────────────────────────────────────────────────────
                SECTION E: Reviewing / Loading
            ────────────────────────────────────────────────────────── */}
            {uploadStage === "reviewing" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-10 text-center space-y-5 bg-white border border-purple-200 rounded-2xl shadow-sm"
              >
                <RefreshCw className="w-10 h-10 text-purple-600 animate-spin mx-auto" />
                <div>
                  <h4 className="text-base font-bold text-slate-900 mb-1">
                    Evaluating Resume with Groq AI...
                  </h4>
                  <p className="text-xs text-slate-500">
                    Calibrating rubrics for{" "}
                    <span className="text-purple-700 font-bold">
                      {targetRole}
                    </span>{" "}
                    at{" "}
                    <span className="text-purple-700 font-bold">
                      {companyType}
                    </span>{" "}
                    ({yearsExperience})
                  </p>
                </div>

                <div className="max-w-md mx-auto space-y-2 pt-2 text-left">
                  {[
                    {
                      color: "bg-purple-600",
                      text: "Running ATS parseability & layout scan",
                    },
                    {
                      color: "bg-indigo-600",
                      text: `Checking impact metrics against ${companyType} standards`,
                    },
                    {
                      color: "bg-violet-600",
                      text: "Generating bullet rewrites & hiring manager evaluation",
                    },
                  ].map(({ color, text }) => (
                    <div
                      key={text}
                      className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-xs text-slate-800 flex items-center gap-3"
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${color} animate-ping shrink-0`}
                      />
                      <span>{text}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ──────────────────────────────────────────────────────────
                SECTION F: Results
            ────────────────────────────────────────────────────────── */}
            {uploadStage === "done" && reviewText && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Context bar */}
                <div className="p-4 rounded-xl bg-white border border-purple-200 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 rounded-lg bg-purple-50 border border-purple-200 text-purple-800 text-xs font-bold">
                      Target: {targetRole}
                    </span>
                    <span className="px-3 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-bold">
                      Company: {companyType}
                    </span>
                    <span className="px-3 py-1 rounded-lg bg-violet-50 border border-violet-200 text-violet-800 text-xs font-bold">
                      Exp: {yearsExperience}
                    </span>
                    {extraction && (
                      <span className="px-3 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 text-xs font-medium">
                        {extraction.filename}
                      </span>
                    )}
                  </div>
                  <button
                    id="modify-parameters-btn"
                    onClick={resetAll}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Start New Review
                  </button>
                </div>

                {/* Markdown output */}
                <div className="p-6 rounded-2xl bg-white border border-purple-200 text-slate-800 shadow-sm space-y-2">
                  <ResumeMarkdownViewer content={reviewText} />
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
