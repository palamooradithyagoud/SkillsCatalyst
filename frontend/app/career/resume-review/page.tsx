"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  RefreshCw,
  Building2,
  UserCheck,
  ChevronLeft,
  RotateCcw,
  Edit3,
  FileCheck,
  CloudUpload,
  FileBadge,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import StageIndicator from "@/components/career/StageIndicator";
import ResumeMarkdownViewer from "@/components/career/ResumeMarkdownViewer";
import {
  COMMON_ROLES,
  COMPANY_TYPES,
  EXP_LEVELS,
  FILE_TYPE_COLORS,
  MAX_FILE_MB,
} from "@/data/career/constants";
import { getFileExt } from "@/lib/career/helpers";
import { useResumeReview } from "@/hooks/useResumeReview";
import { useSubscription } from "@/hooks/useSubscription";
import { UpgradeCTA, UsageLimitIndicator } from "@/components/premium";

export default function ResumeReviewPage() {
  const router = useRouter();
  const { isPremium, getLimit } = useSubscription();
  const mentorLimit = isPremium ? null : (getLimit("ai_mentor") ?? 1);

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
  } = useResumeReview();

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* ── Page Header & Navigation Bar ── */}
      <div className="bg-white border border-purple-100 rounded-3xl p-5 sm:p-7 shadow-sm transition-all flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-center gap-3.5 min-w-0">
          <Link
            href="/career"
            className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100/80 text-purple-700 transition-colors flex items-center gap-1.5 text-xs font-bold shrink-0 border border-purple-200 shadow-2xs active:scale-95"
            aria-label="Back to Career"
          >
            <ChevronLeft className="w-4 h-4 text-purple-600" />
            <span>Back to Career</span>
          </Link>

          <div className="p-2.5 rounded-2xl bg-purple-100 text-purple-700 border border-purple-200 shrink-0">
            <Sparkles className="w-5 h-5 text-purple-600" />
          </div>

          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
              AI Resume Evaluator
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium truncate mt-0.5">
              Calibrated for specific Target Role &amp; Company Type with ATS &amp; Recruiter Feedback
            </p>
          </div>
        </div>

        {/* Stepper & Usage Indicator */}
        <div className="flex items-center gap-4 flex-wrap justify-between md:justify-end">
          <div className="hidden lg:flex items-center gap-3 shrink-0">
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
          </div>
        </div>
      </div>

      {/* ── Main Workspace Body ── */}
      <div className="space-y-6">
        {/* ──────────────────────────────────────────────────────────
            SECTION A: Configuration (Target Role, Company Type, Experience)
        ────────────────────────────────────────────────────────── */}
        {uploadStage !== "reviewing" && uploadStage !== "done" && (
          <div className="space-y-6">
            {/* Step 1: Target Role & Job Description */}
            <div className="bg-white border border-purple-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-purple-900 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-purple-600" />
                  1. Target Role &amp; Job Description
                </label>
                <span className="text-[11px] font-semibold text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                  Required
                </span>
              </div>

              <div className="space-y-3">
                <input
                  id="target-role-input"
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  list="common-roles"
                  placeholder="e.g. Fullstack Software Engineer, SDE-2, Backend Engineer..."
                  className="w-full px-4 py-3.5 bg-white border border-purple-200/90 rounded-2xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600 focus:ring-3 focus:ring-purple-500/15 transition-all shadow-2xs font-medium"
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
                  className="w-full px-4 py-3 bg-white border border-purple-200/90 rounded-2xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600 focus:ring-3 focus:ring-purple-500/15 transition-all resize-none shadow-2xs"
                />
              </div>
            </div>

            {/* Step 2: Target Company Type (Rubric Calibration) */}
            <div className="bg-white border border-purple-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-purple-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-purple-600" />
                  2. Target Company Type (Rubric Calibration)
                </label>
                <span className="text-[11px] font-semibold text-slate-500">
                  Select 1 Rubric
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {COMPANY_TYPES.map((type) => {
                  const isSelected = companyType === type.id;
                  return (
                    <div
                      key={type.id}
                      onClick={() => setCompanyType(type.id)}
                      className={`p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? "bg-purple-50/80 border-purple-600 text-purple-950 shadow-md shadow-purple-600/10 ring-2 ring-purple-100"
                          : "bg-white border-purple-100/90 text-slate-600 hover:border-purple-300 hover:bg-purple-50/30 hover:shadow-2xs"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`text-sm font-extrabold ${
                            isSelected ? "text-purple-950" : "text-slate-900"
                          }`}
                        >
                          {type.title}
                        </span>
                        <span
                          className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border transition-colors ${
                            isSelected
                              ? "bg-purple-600 text-white border-purple-600 shadow-xs"
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

            {/* Step 3: Claimed Experience Level */}
            <div className="bg-white border border-purple-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
              <label className="text-xs font-bold uppercase tracking-wider text-purple-900 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-purple-600" />
                3. Claimed Experience Level
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {EXP_LEVELS.map((exp) => {
                  const isSelected = yearsExperience === exp.id;
                  return (
                    <button
                      key={exp.id}
                      type="button"
                      onClick={() => setYearsExperience(exp.id)}
                      className={`p-3 rounded-xl text-xs font-bold text-center border-2 transition-all cursor-pointer ${
                        isSelected
                          ? "bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-600/20"
                          : "bg-white border-purple-200/80 text-slate-700 hover:text-purple-700 hover:border-purple-400 hover:bg-purple-50/50"
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
              <div className="bg-white border border-purple-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
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
                  className={`border-2 border-dashed rounded-2xl p-10 sm:p-14 text-center transition-all cursor-pointer ${
                    isDragging
                      ? "border-purple-600 bg-purple-50 scale-[1.01] shadow-md shadow-purple-600/10"
                      : "border-purple-200 hover:border-purple-500 bg-purple-50/20 hover:bg-purple-50/40"
                  }`}
                >
                  <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-600 shadow-xs">
                    <CloudUpload className="w-7 h-7 text-purple-600" />
                  </div>
                  <h4 className="text-base font-extrabold text-slate-900 mb-1.5">
                    {isDragging
                      ? "Drop your resume here"
                      : "Drag & Drop or Click to Upload"}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium mb-3">
                    Supports <span className="font-bold text-purple-700">PDF, DOCX, TXT, MD</span> · Max {MAX_FILE_MB} MB
                  </p>
                  <p className="text-[11px] text-slate-400 max-w-md mx-auto">
                    Your file is processed through a zero-retention parsing service.
                    No raw binary data is stored on external LLM caches.
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
                    className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-3"
                  >
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600" />
                    <div>
                      <p className="font-bold text-rose-900 mb-0.5">
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
                className="bg-white border border-purple-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4"
              >
                <div className="flex items-center gap-3.5">
                  <div className="p-3 rounded-2xl bg-purple-100 text-purple-700 border border-purple-200">
                    {uploadStage === "uploading" ? (
                      <Upload className="w-6 h-6 text-purple-600 animate-bounce" />
                    ) : (
                      <FileBadge className="w-6 h-6 text-purple-600 animate-pulse" />
                    )}
                  </div>
                  <div>
                    <p className="text-base font-extrabold text-slate-900">
                      {uploadStage === "uploading"
                        ? "Uploading resume..."
                        : "Extracting text from document..."}
                    </p>
                    <p className="text-xs text-slate-500 font-medium">
                      {uploadStage === "uploading"
                        ? `${uploadProgress}% transferred`
                        : "PyMuPDF / python-docx engine parsing document..."}
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <motion.div
                    className="h-full bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 rounded-full"
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
                  <div className="flex items-center gap-2 text-xs font-medium text-purple-700">
                    <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                    <span>
                      FastAPI backend is parsing document structure — takes 1–3 seconds...
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
                  className="bg-white border border-purple-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4"
                >
                  {/* File badge & header */}
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-purple-900 flex items-center gap-2">
                      <Edit3 className="w-4 h-4 text-purple-600" />
                      4. Extracted Resume Content
                      <span className="text-[11px] font-normal text-slate-500 normal-case">
                        (editable — fix OCR or copy-paste formatting if needed)
                      </span>
                    </label>
                    <button
                      onClick={resetAll}
                      className="text-xs text-purple-700 hover:text-purple-900 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer bg-purple-50 px-3 py-1 rounded-lg border border-purple-200"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Upload different file
                    </button>
                  </div>

                  {/* File info strip */}
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <div
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border text-[11px] font-bold uppercase ${
                        FILE_TYPE_COLORS[getFileExt(extraction.filename)] ??
                        "text-purple-700 bg-purple-50 border-purple-200"
                      }`}
                    >
                      <FileCheck className="w-3.5 h-3.5" />
                      {getFileExt(extraction.filename).toUpperCase()}
                    </div>
                    <span className="text-xs sm:text-sm font-semibold text-slate-800 truncate max-w-xs">
                      {extraction.filename}
                    </span>
                    <span className="ml-auto text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                      {editedText.length.toLocaleString()} characters
                    </span>
                  </div>

                  {/* Editable textarea */}
                  <textarea
                    id="extracted-resume-textarea"
                    value={editedText}
                    onChange={(e) => setEditedText(e.target.value)}
                    rows={14}
                    spellCheck={false}
                    className="w-full px-4 py-3.5 bg-slate-50 border border-purple-200/90 focus:border-purple-600 focus:bg-white rounded-2xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-3 focus:ring-purple-500/15 transition-all resize-y font-mono leading-relaxed"
                    placeholder="Extracted resume text appears here..."
                  />

                  {/* Extraction success note */}
                  <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>
                      Text extracted cleanly by backend parser — ready for AI evaluation against target rubrics.
                    </span>
                  </div>

                  {/* Review error */}
                  {errorMessage && (
                    <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600" />
                        <div>
                          <p className="font-bold mb-0.5 text-rose-950">
                            {errorMessage.toLowerCase().includes("limit")
                              ? "AI Review Quota Reached"
                              : "AI Review Evaluation Failed"}
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
                    className="w-full bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold py-4 rounded-2xl transition-all shadow-lg shadow-purple-600/25 flex items-center justify-center gap-2.5 text-sm sm:text-base cursor-pointer active:scale-[0.99]"
                  >
                    <Sparkles className="w-5 h-5 text-purple-200" />
                    <span>Evaluate Resume with Groq AI</span>
                    <span className="ml-1 text-xs opacity-80 font-normal">
                      ({editedText.length.toLocaleString()} chars · calibrated rubric)
                    </span>
                    <ArrowRight className="w-4 h-4 ml-1" />
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
            className="bg-white border border-purple-200 rounded-3xl p-10 sm:p-16 text-center space-y-6 shadow-sm"
          >
            <div className="w-16 h-16 mx-auto rounded-3xl bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-600 shadow-md shadow-purple-600/10">
              <RefreshCw className="w-8 h-8 text-purple-600 animate-spin" />
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-1.5">
                Evaluating Resume with Groq AI...
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-lg mx-auto">
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

            <div className="max-w-md mx-auto space-y-2.5 pt-4 text-left">
              {[
                {
                  color: "bg-purple-600",
                  text: "Running ATS parseability & keyword density scan",
                },
                {
                  color: "bg-indigo-600",
                  text: `Benchmarking impact metrics against ${companyType} expectations`,
                },
                {
                  color: "bg-violet-600",
                  text: "Generating bullet rewrites & hiring manager verdict",
                },
              ].map(({ color, text }) => (
                <div
                  key={text}
                  className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-200 text-xs font-semibold text-slate-800 flex items-center gap-3 shadow-2xs"
                >
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${color} animate-ping shrink-0`}
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
            <div className="p-4 sm:p-5 rounded-3xl bg-white border border-purple-200 flex flex-wrap items-center justify-between gap-3 shadow-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3.5 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-800 text-xs font-bold">
                  Target: {targetRole}
                </span>
                <span className="px-3.5 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-bold">
                  Company: {companyType}
                </span>
                <span className="px-3.5 py-1.5 rounded-xl bg-violet-50 border border-violet-200 text-violet-800 text-xs font-bold">
                  Exp: {yearsExperience}
                </span>
                {extraction && (
                  <span className="px-3.5 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 text-xs font-medium">
                    {extraction.filename}
                  </span>
                )}
              </div>
              <button
                id="modify-parameters-btn"
                onClick={resetAll}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-purple-600/20 flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
                Start New Review
              </button>
            </div>

            {/* Markdown output */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-purple-200 shadow-sm space-y-4">
              <ResumeMarkdownViewer content={reviewText} />
            </div>

            {/* Bottom action bar */}
            <div className="flex items-center justify-between pt-2">
              <Link
                href="/career"
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-purple-50 text-purple-700 border border-purple-200 font-bold text-xs flex items-center gap-2 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Return to Career Hub
              </Link>
              <button
                onClick={resetAll}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-purple-600/20"
              >
                <RotateCcw className="w-4 h-4" />
                Analyze Another Resume
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
