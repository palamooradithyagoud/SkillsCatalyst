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
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md overflow-hidden select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="bg-[#0b1329] border-0 sm:border border-[#1e2d4a] w-full h-full sm:h-auto sm:max-w-4xl sm:max-h-[92vh] sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col z-[10000]"
        >
          {/* Modal Header */}
          <div className="p-3.5 sm:p-5 md:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 shrink-0 gap-3">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <button
                onClick={onClose}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center gap-1 text-xs font-bold shrink-0 border border-slate-700 active:scale-95 cursor-pointer shadow-xs"
                aria-label="Back"
              >
                <ChevronLeft className="w-4 h-4 text-indigo-400" />
                <span className="hidden sm:inline">Back</span>
              </button>
              <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shrink-0">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm sm:text-lg font-bold text-white truncate leading-tight">
                  AI Resume Evaluator
                </h3>
                <p className="text-[10px] sm:text-xs text-slate-400 truncate hidden sm:block mt-0.5">
                  Calibrated for specific Target Role &amp; Company Type
                </p>
              </div>
            </div>

            {/* Progress steps */}
            <div className="hidden md:flex items-center gap-3 mr-2 shrink-0">
              <StageIndicator stage={1} currentStage={stageNum} label="Configure" />
              <div className="w-4 h-px bg-slate-700" />
              <StageIndicator stage={2} currentStage={stageNum} label="Upload" />
              <div className="w-4 h-px bg-slate-700" />
              <StageIndicator stage={3} currentStage={stageNum} label="Review" />
              <div className="w-4 h-px bg-slate-700" />
              <StageIndicator stage={4} currentStage={stageNum} label="Evaluate" />
            </div>

            <button
              id="close-resume-modal"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0 cursor-pointer active:scale-95"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6 pb-28 sm:pb-8">
            {/* ──────────────────────────────────────────────────────────
                SECTION A: Configuration (always visible until done)
            ────────────────────────────────────────────────────────── */}
            {uploadStage !== "reviewing" && uploadStage !== "done" && (
              <div className="space-y-6">
                {/* Step 1: Target Role */}
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-indigo-400" />
                    1. Target Role &amp; Job Description
                  </label>
                  <input
                    id="target-role-input"
                    type="text"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    list="common-roles"
                    placeholder="e.g. Fullstack Software Engineer, SDE-2, Backend Engineer..."
                    className="w-full px-4 py-3 bg-[#070d1d] border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
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
                    className="w-full px-4 py-3 bg-[#070d1d] border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                  />
                </div>

                {/* Step 2: Company Type */}
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-indigo-400" />
                    2. Target Company Type (Rubric Calibration)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {COMPANY_TYPES.map((type) => {
                      const isSelected = companyType === type.id;
                      return (
                        <div
                          key={type.id}
                          onClick={() => setCompanyType(type.id)}
                          className={`p-4 rounded-xl border cursor-pointer transition-all ${
                            isSelected
                              ? "bg-indigo-950/40 border-indigo-500 text-white shadow-lg shadow-indigo-500/10"
                              : "bg-[#070d1d] border-slate-800 text-slate-400 hover:border-slate-700"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span
                              className={`text-sm font-bold ${
                                isSelected ? "text-white" : "text-slate-200"
                              }`}
                            >
                              {type.title}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-semibold">
                              {type.badge}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            {type.desc}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Step 3: Experience Level */}
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-indigo-400" />
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
                          className={`p-2.5 rounded-xl text-xs font-semibold text-center border transition-all cursor-pointer ${
                            isSelected
                              ? "bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-500/20"
                              : "bg-[#070d1d] border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
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
                  <div className="space-y-3 pt-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-indigo-400" />
                      4. Upload Resume
                    </label>

                    {/* Drop Zone */}
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer bg-[#070d1d] ${
                        isDragging
                          ? "border-indigo-400 bg-indigo-950/30 scale-[1.01]"
                          : "border-slate-800 hover:border-indigo-500/50"
                      }`}
                    >
                      <CloudUpload
                        className={`w-10 h-10 mx-auto mb-3 transition-colors ${
                          isDragging ? "text-indigo-400" : "text-slate-500"
                        }`}
                      />
                      <h4 className="text-sm font-semibold text-white mb-1">
                        {isDragging
                          ? "Drop your resume here"
                          : "Drag & Drop or Click to Upload"}
                      </h4>
                      <p className="text-xs text-slate-400 mb-2">
                        Supports PDF, DOCX, TXT, MD · Max {MAX_FILE_MB} MB
                      </p>
                      <p className="text-[10px] text-slate-600">
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
                        className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5"
                      >
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold mb-0.5">
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
                    className="space-y-4 p-6 rounded-2xl bg-slate-900/60 border border-slate-800"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                        {uploadStage === "uploading" ? (
                          <Upload className="w-5 h-5 text-indigo-400" />
                        ) : (
                          <FileBadge className="w-5 h-5 text-indigo-400 animate-pulse" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {uploadStage === "uploading"
                            ? "Uploading resume..."
                            : "Extracting text from document..."}
                        </p>
                        <p className="text-xs text-slate-400">
                          {uploadStage === "uploading"
                            ? `${uploadProgress}% transferred`
                            : "PyMuPDF / python-docx processing..."}
                        </p>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-indigo-500 to-blue-400 rounded-full"
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
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                        <span>
                          Backend is parsing your document — this takes 1–3
                          seconds...
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
                      className="space-y-3"
                    >
                      {/* File badge */}
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                          <Edit3 className="w-4 h-4 text-emerald-400" />
                          4. Extracted Resume Text
                          <span className="ml-1 text-[10px] font-normal text-slate-500">
                            (editable — correct OCR errors if needed)
                          </span>
                        </label>
                        <button
                          onClick={resetAll}
                          className="text-[10px] text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-colors cursor-pointer"
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
                            "text-slate-400 bg-slate-800 border-slate-700"
                          }`}
                        >
                          <FileCheck className="w-3 h-3" />
                          {getFileExt(extraction.filename).toUpperCase()}
                        </div>
                        <span className="text-xs text-slate-400 truncate max-w-xs">
                          {extraction.filename}
                        </span>
                        <span className="ml-auto text-[10px] text-slate-500">
                          {editedText.length.toLocaleString()} chars
                        </span>
                      </div>

                      {/* Editable textarea */}
                      <textarea
                        id="extracted-resume-textarea"
                        value={editedText}
                        onChange={(e) => setEditedText(e.target.value)}
                        rows={14}
                        spellCheck={false}
                        className="w-full px-4 py-3 bg-[#050a16] border border-emerald-500/20 focus:border-emerald-500/50 rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none transition-colors resize-y font-mono leading-relaxed"
                        placeholder="Extracted text will appear here..."
                      />

                      {/* Extraction success note */}
                      <div className="flex items-center gap-2 text-xs text-emerald-400/80">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>
                          Text extracted successfully by FastAPI backend —
                          clean plain text ready for AI evaluation.
                        </span>
                      </div>

                      {/* Review error */}
                      {errorMessage && (
                        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
                          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-semibold mb-0.5">
                              AI Review Failed
                            </p>
                            <p>{errorMessage}</p>
                          </div>
                        </div>
                      )}

                      {/* Evaluate button */}
                      <button
                        id="run-evaluation-btn"
                        type="button"
                        onClick={handleRunEvaluation}
                        disabled={!editedText.trim() || editedText.length < 50}
                        className="w-full bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 text-sm cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>Evaluate Resume with Groq AI</span>
                        <span className="ml-1 text-[10px] opacity-70 font-normal">
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
                className="p-12 text-center space-y-5"
              >
                <RefreshCw className="w-10 h-10 text-indigo-400 animate-spin mx-auto" />
                <div>
                  <h4 className="text-base font-bold text-white mb-1">
                    Evaluating Resume with Groq AI...
                  </h4>
                  <p className="text-xs text-slate-400">
                    Calibrating rubrics for{" "}
                    <span className="text-indigo-300 font-semibold">
                      {targetRole}
                    </span>{" "}
                    at{" "}
                    <span className="text-indigo-300 font-semibold">
                      {companyType}
                    </span>{" "}
                    ({yearsExperience})
                  </p>
                </div>

                <div className="max-w-md mx-auto space-y-2 pt-4">
                  {[
                    {
                      color: "bg-emerald-400",
                      text: "Running ATS parseability & layout scan",
                    },
                    {
                      color: "bg-blue-400",
                      text: `Checking impact metrics against ${companyType} standards`,
                    },
                    {
                      color: "bg-purple-400",
                      text: "Generating bullet rewrites & hiring manager evaluation",
                    },
                  ].map(({ color, text }) => (
                    <div
                      key={text}
                      className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex items-center gap-3"
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${color} animate-ping`}
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
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
                      Target: {targetRole}
                    </span>
                    <span className="px-3 py-1 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-semibold">
                      Company: {companyType}
                    </span>
                    <span className="px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                      Exp: {yearsExperience}
                    </span>
                    {extraction && (
                      <span className="px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 text-xs font-semibold">
                        {extraction.filename}
                      </span>
                    )}
                  </div>
                  <button
                    id="modify-parameters-btn"
                    onClick={resetAll}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Start New Review
                  </button>
                </div>

                {/* Markdown output */}
                <div className="space-y-2 p-5 rounded-2xl bg-[#070d1d] border border-slate-800 text-slate-200">
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
