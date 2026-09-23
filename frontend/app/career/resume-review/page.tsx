"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
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
  Plus,
  Star,
  Trash2,
  Zap,
  Target,
  BarChart3,
  Check,
  Mail,
  Phone,
  MapPin,
  Globe,
} from "lucide-react";
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
import { useAuth } from "@/lib/auth";

interface SavedResumeItem {
  id: string;
  title: string;
  role: string;
  date: string;
  atsScore: number;
  starred?: boolean;
}

export default function ResumeWorkspacePage() {
  const { session } = useAuth();
  const userName = session?.name || "Aadithya Goud";

  // Tab state for left sidebar: "recent" | "all" | "starred"
  const [activeTab, setActiveTab] = useState<"recent" | "all" | "starred">("recent");

  // Main panel active mode: "empty" | "upload" | "create"
  const [viewMode, setViewMode] = useState<"empty" | "upload" | "create">("empty");

  // Saved resumes state
  const [savedResumes, setSavedResumes] = useState<SavedResumeItem[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);

  // Resume builder state
  const [builderData, setBuilderData] = useState({
    fullName: userName,
    role: "Fullstack Software Engineer",
    email: "adithya@example.com",
    phone: "+91 98765 43210",
    location: "Hyderabad, India",
    linkedin: "linkedin.com/in/adithya",
    summary:
      "Passionate Software Engineer skilled in modern web development, distributed architecture, and scalable full-stack applications.",
    education: "B.Tech in Computer Science & Engineering",
    experience: "Software Engineer — Leading core product architecture & API scalability",
    skills: "React, Next.js, TypeScript, Python, FastAPI, Node.js, PostgreSQL, Docker",
  });

  // Use the existing career resume review hook
  const reviewState = useResumeReview();
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

  // Sync uploadStage: if evaluated, keep view on upload/results
  useEffect(() => {
    if (uploadStage === "done" && reviewText) {
      const existing = savedResumes.find((r) => r.id === extraction?.filename);
      if (!existing && extraction) {
        const newItem: SavedResumeItem = {
          id: extraction.filename || `resume-${Date.now()}`,
          title: extraction.filename,
          role: targetRole,
          date: "Just now",
          atsScore: 92,
          starred: false,
        };
        setSavedResumes((prev) => [newItem, ...prev]);
        setSelectedResumeId(newItem.id);
      }
    }
  }, [uploadStage, reviewText, extraction, targetRole, savedResumes]);

  const handleStartUpload = () => {
    setViewMode("upload");
    resetAll();
  };

  const handleStartCreate = () => {
    setViewMode("create");
  };

  const handleSaveCreatedResume = () => {
    const newItem: SavedResumeItem = {
      id: `resume-${Date.now()}`,
      title: `${builderData.fullName} — ${builderData.role}`,
      role: builderData.role,
      date: "Just now",
      atsScore: 88,
      starred: false,
    };
    setSavedResumes((prev) => [newItem, ...prev]);
    setSelectedResumeId(newItem.id);
    setViewMode("empty");
  };

  const toggleStar = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedResumes((prev) =>
      prev.map((r) => (r.id === id ? { ...r, starred: !r.starred } : r))
    );
  };

  const deleteResume = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedResumes((prev) => prev.filter((r) => r.id !== id));
    if (selectedResumeId === id) {
      setSelectedResumeId(null);
      setViewMode("empty");
    }
  };

  const filteredResumes = savedResumes.filter((r) => {
    if (activeTab === "starred") return r.starred;
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 pb-20 select-none overflow-x-hidden w-full">
      {/* ──────────────────────────────────────────────────────────
          1. TOP HERO / BANNER CARD (Compact & Proportional, Mobile Fit)
      ────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-purple-50/70 via-slate-50/50 to-indigo-50/70 border border-purple-100/90 p-4 sm:p-6 md:p-7 shadow-xs transition-all">
        {/* Subtle background glow */}
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-purple-300/15 blur-2xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
          {/* Left Column: Headlines & Call to Actions */}
          <div className="lg:col-span-7 space-y-3 sm:space-y-3.5">
            <div>
              <p className="text-[10px] font-extrabold tracking-[0.18em] text-slate-400 uppercase mb-1">
                BUILD. ANALYZE. IMPROVE.
              </p>
              <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-[32px] font-black text-slate-900 tracking-tight leading-tight">
                Resumes that <span className="text-purple-600">open doors.</span>
              </h1>
              <p className="text-xs sm:text-[13px] text-slate-500 font-medium leading-relaxed mt-1 max-w-lg">
                Create industry-ready resumes, analyze ATS scores, fix missing keywords, and export professional PDFs in seconds.
              </p>
            </div>

            {/* Top Primary & Secondary CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5 pt-0.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleStartCreate}
                className="w-full sm:w-auto justify-center bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-4 sm:px-5 py-2.5 rounded-xl shadow-sm shadow-purple-600/20 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create New Resume</span>
              </button>

              <button
                type="button"
                onClick={handleStartUpload}
                className="w-full sm:w-auto justify-center bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs px-4 sm:px-5 py-2.5 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
              >
                <Upload className="w-3.5 h-3.5 text-slate-600" />
                <span>Upload Existing</span>
              </button>
            </div>

            {/* Feature Highlights Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-2.5 pt-2 sm:pt-1.5 border-t border-purple-100/60 sm:border-0">
              {/* Feature 1 */}
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-100/90 text-purple-600 flex items-center justify-center shrink-0 border border-purple-200/50 shadow-2xs">
                  <Zap className="w-3.5 h-3.5 text-purple-600 fill-purple-600" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-[11px] font-bold text-slate-900 leading-tight">
                    Real-time ATS Scoring
                  </h4>
                  <p className="text-[9px] text-slate-400 font-medium truncate">
                    See how well you match
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-100/90 text-purple-600 flex items-center justify-center shrink-0 border border-purple-200/50 shadow-2xs">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-[11px] font-bold text-slate-900 leading-tight">
                    AI Suggestions
                  </h4>
                  <p className="text-[9px] text-slate-400 font-medium truncate">
                    Get role-specific improvements
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-100/90 text-purple-600 flex items-center justify-center shrink-0 border border-purple-200/50 shadow-2xs">
                  <FileText className="w-3.5 h-3.5 text-purple-600" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-[11px] font-bold text-slate-900 leading-tight">
                    Export in PDF &amp; LaTeX
                  </h4>
                  <p className="text-[9px] text-slate-400 font-medium truncate">
                    Production-ready output
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Layered 3D Preview Cards (Compact & Mobile Fitted) */}
          <div className="lg:col-span-5 relative flex justify-center items-center py-2 sm:py-1">
            {/* Container for layered cards */}
            <div className="relative w-full max-w-[270px] sm:max-w-[320px] h-[190px] sm:h-[195px] scale-[0.88] xs:scale-[0.95] sm:scale-100 origin-center my-1 sm:my-0.5">
              {/* Playful Handwritten Annotation & Curved Arrow (Anchored to card top-right) */}
              <div className="absolute -top-3.5 -right-0.5 sm:-top-5 sm:right-2 flex flex-col items-end z-20 pointer-events-none">
                <span
                  style={{ fontFamily: "'Caveat', cursive" }}
                  className="text-purple-600 font-bold text-xs sm:text-base tracking-wide -rotate-6"
                >
                  From résumé
                  <br />
                  to opportunities
                </span>
                <svg
                  className="w-5 h-4 sm:w-7 sm:h-5 text-purple-500 -rotate-12 mt-0.5 mr-0.5 sm:mr-1"
                  viewBox="0 0 40 30"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M 5 5 C 20 5, 30 18, 32 25" />
                  <path d="M 26 22 L 32 25 L 34 18" />
                </svg>
              </div>

              {/* Back Card: Realistic Resume Preview */}
              <div className="absolute left-0 top-1 w-[195px] sm:w-[215px] bg-white rounded-xl border border-slate-200/90 p-3 shadow-md text-slate-800 transform -rotate-1">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                    {userName.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-extrabold text-slate-900 truncate leading-none">
                      {userName}
                    </p>
                    <p className="text-[8px] text-slate-400 font-medium truncate mt-0.5">
                      Software Engineer
                    </p>
                  </div>
                </div>

                {/* Contact Icons Strip */}
                <div className="space-y-0.5 pt-1.5 pb-1.5 text-[8px] text-slate-500 font-medium">
                  <div className="flex items-center gap-1 truncate">
                    <Mail className="w-2 h-2 text-slate-400 shrink-0" />
                    <span>adithya@example.com</span>
                  </div>
                  <div className="flex items-center gap-1 truncate">
                    <Phone className="w-2 h-2 text-slate-400 shrink-0" />
                    <span>+91 98765 43210</span>
                  </div>
                  <div className="flex items-center gap-1 truncate">
                    <MapPin className="w-2 h-2 text-slate-400 shrink-0" />
                    <span>Hyderabad, India</span>
                  </div>
                  <div className="flex items-center gap-1 truncate">
                    <Globe className="w-2 h-2 text-slate-400 shrink-0" />
                    <span>linkedin.com/in/adithya</span>
                  </div>
                </div>

                {/* Skeleton Education & Experience Lines */}
                <div className="space-y-1.5 pt-1 border-t border-slate-100">
                  <div>
                    <span className="text-[8px] font-bold text-slate-700">
                      Education
                    </span>
                    <div className="w-3/4 h-1 bg-slate-100 rounded-full mt-0.5" />
                  </div>
                  <div>
                    <span className="text-[8px] font-bold text-slate-700">
                      Experience
                    </span>
                    <div className="w-5/6 h-1 bg-slate-100 rounded-full mt-0.5" />
                  </div>
                </div>
              </div>

              {/* Front Card: Elevated Overlapping ATS Score Card */}
              <div className="absolute right-0 bottom-0 w-[130px] sm:w-[145px] bg-white rounded-xl border border-purple-100 p-2.5 shadow-lg text-center space-y-1.5 z-10">
                <div className="text-left">
                  <span className="text-[9px] font-extrabold text-slate-800">
                    ATS Score
                  </span>
                </div>

                {/* Circular Score Gauge */}
                <div className="relative w-14 h-14 mx-auto flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    {/* Background circle */}
                    <path
                      className="text-purple-100"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    {/* Progress circle */}
                    <path
                      className="text-purple-600"
                      strokeDasharray="92, 100"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-base sm:text-lg font-black text-slate-900 leading-none">
                      92
                    </span>
                  </div>
                </div>

                {/* Score Rating */}
                <div>
                  <p className="text-[9px] font-extrabold text-slate-900">
                    Great Match
                  </p>
                </div>

                {/* Checklist */}
                <div className="space-y-0.5 text-left pt-1 border-t border-slate-100">
                  <div className="flex items-center gap-1 text-[8px] font-semibold text-slate-700">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                      <Check className="w-1.5 h-1.5 stroke-[3]" />
                    </div>
                    <span>Relevant Keywords</span>
                  </div>
                  <div className="flex items-center gap-1 text-[8px] font-semibold text-slate-700">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                      <Check className="w-1.5 h-1.5 stroke-[3]" />
                    </div>
                    <span>Proper Structure</span>
                  </div>
                  <div className="flex items-center gap-1 text-[8px] font-semibold text-slate-700">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                      <Check className="w-1.5 h-1.5 stroke-[3]" />
                    </div>
                    <span>Good Readability</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────
          MOBILE SEGMENTED SWITCHER (Visible on mobile only)
      ────────────────────────────────────────────────────────── */}
      <div className="lg:hidden flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200/80">
        <button
          type="button"
          onClick={() => setViewMode("empty")}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            viewMode === "empty"
              ? "bg-white text-purple-700 shadow-xs border border-purple-100"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Saved Resumes ({savedResumes.length})</span>
        </button>
        <button
          type="button"
          onClick={() => {
            if (viewMode === "empty") setViewMode("upload");
          }}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            viewMode !== "empty"
              ? "bg-white text-purple-700 shadow-xs border border-purple-100"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-purple-600" />
          <span>{viewMode === "create" ? "Resume Builder" : "ATS Evaluator"}</span>
        </button>
      </div>

      {/* ──────────────────────────────────────────────────────────
          2. TWO-COLUMN MAIN WORKSPACE: "YOUR RESUMES" + DETAIL WORKSPACE
      ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
        {/* ── Left Column: "Your Resumes" Sidebar ── */}
        <div
          className={`lg:col-span-4 bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm space-y-3.5 sm:space-y-4 ${
            viewMode !== "empty" ? "hidden lg:block" : "block"
          }`}
        >
          {/* Header Row */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900">
              Your Resumes
            </h3>
            <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center border border-slate-200">
              {savedResumes.length}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={handleStartCreate}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Resume</span>
            </button>

            <button
              type="button"
              onClick={handleStartUpload}
              className="w-full bg-white hover:bg-slate-50 text-slate-700 font-bold py-2.5 px-4 rounded-xl text-xs border border-slate-200 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs active:scale-95"
            >
              <Upload className="w-3.5 h-3.5 text-slate-600" />
              <span>Upload Existing Resume</span>
            </button>
          </div>

          {/* Tab Filter Navigation */}
          <div className="flex items-center gap-6 border-b border-slate-100 pt-1 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab("recent")}
              className={`pb-2 font-bold transition-colors cursor-pointer relative ${
                activeTab === "recent"
                  ? "text-purple-600 border-b-2 border-purple-600"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              Recent
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`pb-2 font-bold transition-colors cursor-pointer relative ${
                activeTab === "all"
                  ? "text-purple-600 border-b-2 border-purple-600"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("starred")}
              className={`pb-2 font-bold transition-colors cursor-pointer relative ${
                activeTab === "starred"
                  ? "text-purple-600 border-b-2 border-purple-600"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              Starred
            </button>
          </div>

          {/* List or Empty State */}
          <div className="min-h-[190px] flex flex-col justify-center">
            {filteredResumes.length === 0 ? (
              /* Empty state (matches screenshot) */
              <div className="text-center py-8 space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 text-slate-400 flex items-center justify-center mx-auto shadow-2xs">
                  <FileText className="w-6 h-6 text-slate-400" />
                </div>
                <h4 className="text-xs font-extrabold text-slate-800">
                  No resumes yet
                </h4>
                <p className="text-[11px] text-slate-400 font-medium">
                  Create or upload a resume to get started.
                </p>
              </div>
            ) : (
              /* Resume List */
              <div className="space-y-2">
                {filteredResumes.map((resume) => {
                  const isSelected = selectedResumeId === resume.id;
                  return (
                    <div
                      key={resume.id}
                      onClick={() => {
                        setSelectedResumeId(resume.id);
                        setViewMode("upload");
                      }}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? "bg-purple-50/80 border-purple-600 shadow-xs"
                          : "bg-white border-slate-200 hover:border-purple-300"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 font-bold text-xs">
                          {resume.atsScore}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {resume.title}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">
                            {resume.role} · {resume.date}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => toggleStar(resume.id, e)}
                          className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-amber-500"
                        >
                          <Star
                            className={`w-3.5 h-3.5 ${
                              resume.starred
                                ? "fill-amber-400 text-amber-400"
                                : ""
                            }`}
                          />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => deleteResume(resume.id, e)}
                          className="p-1 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Right Column: Main Detail / Workspace Panel ── */}
        <div
          className={`lg:col-span-8 bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-4 sm:p-8 md:p-10 shadow-sm min-h-[300px] sm:min-h-[460px] flex flex-col justify-center ${
            viewMode === "empty" ? "hidden lg:flex" : "flex"
          }`}
        >
          {/* ──────────────────────────────────────────────────────────
              STATE A: "NO RESUME SELECTED" (Exact match to screenshot)
          ────────────────────────────────────────────────────────── */}
          {viewMode === "empty" && (
            <div className="text-center space-y-3 sm:space-y-4 py-4 sm:py-8 max-w-md mx-auto w-full">
              {/* Document Icon with Purple Plus Badge */}
              <div className="relative inline-block mx-auto mb-1">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-300 shadow-2xs">
                  <FileText className="w-7 h-7 sm:w-9 sm:h-9 text-slate-300" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-sm">
                  <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3]" />
                </div>
              </div>

              {/* Title & Description */}
              <div>
                <h2 className="text-lg sm:text-2xl font-black text-slate-900">
                  No Resume Selected
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed mt-1 sm:mt-2 max-w-md mx-auto">
                  Select a resume from the sidebar or create a new one to view ATS scores, keyword analysis, and personalized recommendations.
                </p>
              </div>

              {/* Two CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2 sm:gap-3 pt-2 w-full">
                <button
                  type="button"
                  onClick={handleStartCreate}
                  className="w-full sm:w-auto justify-center bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl shadow-md shadow-purple-600/25 flex items-center gap-2 transition-all cursor-pointer active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Your First Resume</span>
                </button>

                <button
                  type="button"
                  onClick={handleStartUpload}
                  className="w-full sm:w-auto justify-center bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-2 transition-all cursor-pointer active:scale-95"
                >
                  <Upload className="w-4 h-4 text-slate-600" />
                  <span>Upload a Resume</span>
                </button>
              </div>
            </div>
          )}

          {/* ──────────────────────────────────────────────────────────
              STATE B: RESUME CREATOR / BUILDER WIZARD
          ────────────────────────────────────────────────────────── */}
          {viewMode === "create" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setViewMode("empty")}
                    className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-600 cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">
                      Create New Resume
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Fill out your profile details to generate an ATS-optimized resume.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSaveCreatedResume}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  Save &amp; Analyze
                </button>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={builderData.fullName}
                    onChange={(e) =>
                      setBuilderData({ ...builderData, fullName: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-purple-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    Target Role
                  </label>
                  <input
                    type="text"
                    value={builderData.role}
                    onChange={(e) =>
                      setBuilderData({ ...builderData, role: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-purple-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={builderData.email}
                    onChange={(e) =>
                      setBuilderData({ ...builderData, email: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-purple-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={builderData.phone}
                    onChange={(e) =>
                      setBuilderData({ ...builderData, phone: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-purple-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={builderData.location}
                    onChange={(e) =>
                      setBuilderData({ ...builderData, location: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-purple-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    LinkedIn / Portfolio
                  </label>
                  <input
                    type="text"
                    value={builderData.linkedin}
                    onChange={(e) =>
                      setBuilderData({ ...builderData, linkedin: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-purple-600 focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-800 block mb-1">
                    Professional Summary
                  </label>
                  <textarea
                    rows={2}
                    value={builderData.summary}
                    onChange={(e) =>
                      setBuilderData({ ...builderData, summary: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-purple-600 focus:outline-none resize-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-800 block mb-1">
                    Technical Skills (comma separated)
                  </label>
                  <input
                    type="text"
                    value={builderData.skills}
                    onChange={(e) =>
                      setBuilderData({ ...builderData, skills: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-purple-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setViewMode("empty")}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveCreatedResume}
                  className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md shadow-purple-600/20 cursor-pointer text-center"
                >
                  Save &amp; Generate Preview
                </button>
              </div>
            </div>
          )}

          {/* ──────────────────────────────────────────────────────────
              STATE C: UPLOAD & ATS CALIBRATION EVALUATION FLOW
          ────────────────────────────────────────────────────────── */}
          {viewMode === "upload" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setViewMode("empty")}
                    className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-600 cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">
                      Upload &amp; Analyze Resume
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Calibrated evaluation against top hiring rubrics with ATS keyword scoring.
                    </p>
                  </div>
                </div>

                {uploadStage === "done" && (
                  <button
                    type="button"
                    onClick={resetAll}
                    className="text-xs text-purple-700 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-xl border border-purple-200 font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    New Scan
                  </button>
                )}
              </div>

              {/* Progress Steps Indicator */}
              <div className="flex items-center justify-center gap-1.5 sm:gap-3 py-1">
                <StageIndicator stage={1} currentStage={stageNum} label="Configure" />
                <div className="w-2.5 sm:w-4 h-px bg-purple-200" />
                <StageIndicator stage={2} currentStage={stageNum} label="Upload" />
                <div className="w-2.5 sm:w-4 h-px bg-purple-200" />
                <StageIndicator stage={3} currentStage={stageNum} label="Review" />
                <div className="w-2.5 sm:w-4 h-px bg-purple-200" />
                <StageIndicator stage={4} currentStage={stageNum} label="Evaluate" />
              </div>

              {/* Configuration / Upload Form */}
              {uploadStage !== "reviewing" && uploadStage !== "done" && (
                <div className="space-y-5">
                  {/* Step 1: Role */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-purple-900 flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-purple-600" />
                      1. Target Role &amp; Job Description
                    </label>
                    <input
                      type="text"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      placeholder="e.g. Fullstack Software Engineer, SDE-2, Backend..."
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-purple-600 focus:outline-none"
                    />
                    <textarea
                      rows={2}
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="Optional: Paste target Job Description for custom keyword & skill matching..."
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-purple-600 focus:outline-none resize-none"
                    />
                  </div>

                  {/* Step 2: Company Rubric */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-purple-900 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-purple-600" />
                      2. Target Company Rubric
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {COMPANY_TYPES.map((type) => {
                        const isSelected = companyType === type.id;
                        return (
                          <div
                            key={type.id}
                            onClick={() => setCompanyType(type.id)}
                            className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                              isSelected
                                ? "bg-purple-50/80 border-purple-600 text-purple-950 shadow-2xs"
                                : "bg-white border-slate-200 text-slate-600 hover:border-purple-300"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-extrabold text-slate-900">
                                {type.title}
                              </span>
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                                  isSelected
                                    ? "bg-purple-600 text-white border-purple-600"
                                    : "bg-purple-50 text-purple-700 border-purple-200"
                                }`}
                              >
                                {type.badge}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 leading-tight">
                              {type.desc}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Step 3: Experience Level */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-purple-900 flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-purple-600" />
                      3. Experience Level
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
                                ? "bg-purple-600 text-white border-purple-600 shadow-2xs"
                                : "bg-white border-slate-200 text-slate-700 hover:text-purple-700 hover:border-purple-300"
                            }`}
                          >
                            {exp.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Step 4: Upload Resume Dropzone */}
                  {(uploadStage === "idle" || uploadStage === "upload_error") && (
                    <div className="space-y-2 pt-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-purple-900 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-purple-600" />
                        4. Upload Resume Document
                      </label>
                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all cursor-pointer ${
                          isDragging
                            ? "border-purple-600 bg-purple-50"
                            : "border-purple-200 hover:border-purple-500 bg-purple-50/20 hover:bg-purple-50/40"
                        }`}
                      >
                        <CloudUpload className="w-9 h-9 sm:w-10 sm:h-10 mx-auto mb-2 text-purple-600" />
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                          {isDragging
                            ? "Drop your resume file here"
                            : "Drag & Drop or Tap to Upload"}
                        </h4>
                        <p className="text-[11px] sm:text-xs text-slate-500 mt-1">
                          Supports PDF, DOCX, TXT, MD · Max {MAX_FILE_MB} MB
                        </p>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".pdf,.docx,.doc,.txt,.md"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </div>

                      {uploadStage === "upload_error" && errorMessage && (
                        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                          <span>{errorMessage}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Uploading Progress */}
                  {(uploadStage === "uploading" || uploadStage === "extracting") && (
                    <div className="p-5 rounded-2xl bg-purple-50/50 border border-purple-200 space-y-3">
                      <div className="flex items-center gap-3">
                        <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
                        <div>
                          <p className="text-xs font-bold text-slate-900">
                            {uploadStage === "uploading"
                              ? `Uploading document (${uploadProgress}%)...`
                              : "Extracting resume text..."}
                          </p>
                        </div>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-600 transition-all duration-300 rounded-full"
                          style={{
                            width:
                              uploadStage === "extracting"
                                ? "100%"
                                : `${uploadProgress}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Extracted Text & Evaluate Trigger */}
                  {(uploadStage === "extracted" || uploadStage === "review_error") &&
                    extraction && (
                      <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-purple-900">
                            Extracted Resume Content ({editedText.length} chars)
                          </span>
                          <button
                            type="button"
                            onClick={resetAll}
                            className="text-xs text-purple-700 hover:text-purple-900 font-semibold cursor-pointer"
                          >
                            Replace File
                          </button>
                        </div>
                        <textarea
                          rows={8}
                          value={editedText}
                          onChange={(e) => setEditedText(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:bg-white focus:border-purple-600 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleRunEvaluation}
                          disabled={!editedText.trim() || editedText.length < 50}
                          className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl shadow-md shadow-purple-600/25 flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer active:scale-[0.99] transition-all"
                        >
                          <Sparkles className="w-4 h-4 text-purple-200" />
                          <span>Evaluate Resume with Groq AI</span>
                        </button>
                      </div>
                    )}
                </div>
              )}

              {/* Reviewing Loading State */}
              {uploadStage === "reviewing" && (
                <div className="text-center py-12 space-y-4">
                  <RefreshCw className="w-10 h-10 text-purple-600 animate-spin mx-auto" />
                  <h3 className="text-base font-bold text-slate-900">
                    Evaluating Resume with Groq AI...
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Benchmarking keywords, structure, and recruiter signals for{" "}
                    <span className="font-bold text-purple-700">{targetRole}</span> at{" "}
                    <span className="font-bold text-purple-700">{companyType}</span>.
                  </p>
                </div>
              )}

              {/* Results View */}
              {uploadStage === "done" && reviewText && (
                <div className="space-y-4">
                  <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-between flex-wrap gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-purple-900 truncate max-w-[160px] sm:max-w-none">
                        {targetRole}
                      </span>
                      <span className="text-slate-400">·</span>
                      <span className="font-semibold text-purple-700 truncate max-w-[120px] sm:max-w-none">
                        {companyType}
                      </span>
                    </div>
                    <span className="font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full text-xs">
                      ATS Score: 92/100
                    </span>
                  </div>

                  <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-white border border-slate-200 space-y-3 overflow-x-hidden">
                    <ResumeMarkdownViewer content={reviewText} />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────
          3. BOTTOM 4 FEATURE CARDS (Exact match to screenshot)
      ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-1 sm:pt-2">
        {/* Card 1 */}
        <div className="bg-white border border-slate-200/90 rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-md transition-shadow flex items-center sm:items-start gap-3 sm:gap-3.5">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-purple-100/90 text-purple-600 flex items-center justify-center shrink-0 border border-purple-200/60 shadow-2xs">
            <Target className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
              Industry-Specific Templates
            </h4>
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5">
              Tailored for top tech roles.
            </p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white border border-slate-200/90 rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-md transition-shadow flex items-center sm:items-start gap-3 sm:gap-3.5">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-purple-100/90 text-purple-600 flex items-center justify-center shrink-0 border border-purple-200/60 shadow-2xs">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
              AI-Powered Feedback
            </h4>
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5">
              Fix gaps, improve content.
            </p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white border border-slate-200/90 rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-md transition-shadow flex items-center sm:items-start gap-3 sm:gap-3.5">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-purple-100/90 text-purple-600 flex items-center justify-center shrink-0 border border-purple-200/60 shadow-2xs">
            <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
              Track Your Progress
            </h4>
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5">
              See your ATS score improve.
            </p>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white border border-slate-200/90 rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-md transition-shadow flex items-center sm:items-start gap-3 sm:gap-3.5">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-purple-100/90 text-purple-600 flex items-center justify-center shrink-0 border border-purple-200/60 shadow-2xs">
            <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
              Export Anywhere
            </h4>
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5">
              Download PDF, LaTeX or share.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
