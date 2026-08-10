"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  Briefcase,
  FileText,
  Lock,
  ArrowRight,
  Upload,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  RefreshCw,
  X,
  Building2,
  UserCheck,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Edit3,
  FileCheck,
  CloudUpload,
  FileBadge,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { reviewResume, getAuthHeaders, handleGuestTokenFromResponse } from "@/lib/api";
import PlacementPrepModal from "@/components/PlacementPrepModal";
import FloatingCTA from "@/components/mobile/FloatingCTA";
import BorderGlow from "@/components/BorderGlow";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type UploadStage =
  | "idle"           // Nothing uploaded yet
  | "uploading"      // File is being sent to /api/resume/extract
  | "extracting"     // Waiting for extraction response
  | "extracted"      // Text received — shown in editable textarea
  | "reviewing"      // Sent to /api/ai-mentor/review-resume, waiting
  | "done"           // Review displayed
  | "upload_error"   // Extraction failed
  | "review_error";  // AI review failed

interface ExtractionResult {
  filename: string;
  text: string;
  charCount: number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ALLOWED_EXTENSIONS = [".pdf", ".docx", ".txt", ".md"];
const MAX_FILE_MB = 10;

const COMMON_ROLES = [
  "Fullstack Software Engineer",
  "Backend Engineer",
  "Frontend Engineer",
  "Data Engineer / AI",
  "DevOps / Cloud Engineer",
  "Mobile Developer",
];

const COMPANY_TYPES = [
  {
    id: "Product-Based",
    title: "Product-Based",
    badge: "🚀 High Scale",
    desc: "Scalable architecture, performance metrics, code quality, and core tech stack alignment.",
  },
  {
    id: "Service-Based",
    title: "Service-Based",
    badge: "💼 Client Solutions",
    desc: "Client project delivery, multi-domain versatility, framework proficiency, and execution.",
  },
  {
    id: "Startup",
    title: "Startup / Growth",
    badge: "⚡ Fast Execution",
    desc: "Speed, end-to-end full-stack ownership, adaptability, and high feature velocity.",
  },
  {
    id: "FAANG / Tier-1",
    title: "FAANG / Tier 1",
    badge: "👑 Elite Bar",
    desc: "Distributed systems at massive scale, algorithmic depth, and high business-impact metrics.",
  },
];

const EXP_LEVELS = [
  { id: "0-2 years", label: "0–2 Yrs (Junior)" },
  { id: "3-5 years", label: "3–5 Yrs (Mid)" },
  { id: "5-8 years", label: "5–8 Yrs (Senior)" },
  { id: "8+ years", label: "8+ Yrs (Staff/Lead)" },
];

const FILE_TYPE_COLORS: Record<string, string> = {
  pdf: "text-rose-400 bg-rose-500/10 border-rose-500/20",
  docx: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  doc: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  txt: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  md: "text-purple-400 bg-purple-500/10 border-purple-500/20",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getFileExt(filename: string): string {
  return filename.split(".").pop()?.toLowerCase() ?? "";
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StageIndicator({
  stage,
  currentStage,
  label,
}: {
  stage: number;
  currentStage: number;
  label: string;
}) {
  const done = currentStage > stage;
  const active = currentStage === stage;
  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all ${
          done
            ? "bg-emerald-500 border-emerald-400 text-white"
            : active
            ? "bg-indigo-600 border-indigo-400 text-white"
            : "bg-slate-900 border-slate-700 text-slate-500"
        }`}
      >
        {done ? "✓" : stage}
      </div>
      <span
        className={`text-xs font-medium ${
          done
            ? "text-emerald-400"
            : active
            ? "text-white"
            : "text-slate-500"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function CareerPage() {
  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPlacementPrepOpen, setIsPlacementPrepOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isModalOpen) {
        setIsModalOpen(false);
      }
    };
    if (isModalOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen]);

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

  // -------------------------------------------------------------------------
  // Derived stage number for progress bar (1-based)
  // -------------------------------------------------------------------------
  const stageNum = (() => {
    if (uploadStage === "idle" || uploadStage === "upload_error") return 2;
    if (
      uploadStage === "uploading" ||
      uploadStage === "extracting" ||
      uploadStage === "extracted"
    )
      return 3;
    if (
      uploadStage === "reviewing" ||
      uploadStage === "done" ||
      uploadStage === "review_error"
    )
      return 4;
    return 1;
  })();

  // -------------------------------------------------------------------------
  // File validation (client-side, before upload)
  // -------------------------------------------------------------------------
  const validateFile = (file: File): string | null => {
    const ext = `.${getFileExt(file.name)}`;
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return `Unsupported file type "${ext}". Please upload a PDF, DOCX, TXT, or MD file.`;
    }
    if (file.size === 0) {
      return "The selected file is empty (0 bytes).";
    }
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      return `File is too large (${formatBytes(file.size)}). Maximum allowed size is ${MAX_FILE_MB} MB.`;
    }
    return null;
  };

  // -------------------------------------------------------------------------
  // Core upload → extract pipeline
  // Uses XMLHttpRequest for real upload progress tracking.
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

    const apiBase =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${apiBase}/api/resume/extract`);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const pct = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(pct);
        if (pct === 100) {
          // Upload done, backend is now processing
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

    getAuthHeaders().then((headers) => {
      Object.entries(headers).forEach(([k, v]) => xhr.setRequestHeader(k, v));
      xhr.send(formData);
    }).catch(() => {
      xhr.send(formData);
    });
  }, []);

  // -------------------------------------------------------------------------
  // File input change handler
  // -------------------------------------------------------------------------
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Reset input so the same file can be re-selected
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

  const closeModal = () => {
    setIsModalOpen(false);
    // Don't reset state so user can reopen and continue
  };

  // -------------------------------------------------------------------------
  // Markdown renderer (existing, preserved)
  // -------------------------------------------------------------------------
  const renderFormattedMarkdown = (content: string) => {
    const lines = content.split("\n");
    let inTable = false;
    let tableRows: string[][] = [];
    const elements: React.ReactNode[] = [];

    lines.forEach((line, index) => {
      const trimmed = line.trim();

      if (trimmed.startsWith("|")) {
        inTable = true;
        const cols = trimmed
          .split("|")
          .map((c) => c.trim())
          .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
        if (!trimmed.includes("---")) tableRows.push(cols);
        return;
      } else if (inTable) {
        inTable = false;
        const rowsToRender = [...tableRows];
        tableRows = [];
        if (rowsToRender.length > 0) {
          const header = rowsToRender[0];
          const body = rowsToRender.slice(1);
          elements.push(
            <div
              key={`table-${index}`}
              className="my-4 overflow-x-auto rounded-xl border border-slate-800 bg-[#091124]"
            >
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-indigo-950/40 text-indigo-300 border-b border-slate-800 font-semibold">
                    {header.map((h, i) => (
                      <th key={i} className="p-3">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {body.map((r, ri) => (
                    <tr
                      key={ri}
                      className="hover:bg-slate-900/50 text-slate-300"
                    >
                      {r.map((cell, ci) => (
                        <td key={ci} className="p-3 leading-relaxed">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
      }

      if (!trimmed) {
        elements.push(<div key={index} className="h-2" />);
        return;
      }

      if (trimmed.startsWith("### ")) {
        elements.push(
          <h4
            key={index}
            className="text-base font-bold text-indigo-300 mt-5 mb-2 flex items-center gap-2"
          >
            <ChevronRight className="w-4 h-4 text-indigo-400" />
            {trimmed.replace("### ", "").replace(/\*\*/g, "")}
          </h4>
        );
      } else if (trimmed.startsWith("## ")) {
        elements.push(
          <h3
            key={index}
            className="text-lg font-extrabold text-white mt-6 mb-3 pb-2 border-b border-slate-800 flex items-center gap-2"
          >
            {trimmed.replace("## ", "").replace(/\*\*/g, "")}
          </h3>
        );
      } else if (
        trimmed.toLowerCase().includes("verdict: hire") ||
        trimmed.toLowerCase().includes("verdict: no hire") ||
        trimmed.toLowerCase().includes("verdict: borderline")
      ) {
        const isHire = trimmed.toLowerCase().includes("verdict: hire");
        const isNoHire = trimmed.toLowerCase().includes("verdict: no hire");
        elements.push(
          <div
            key={index}
            className={`p-3 rounded-xl border my-2 flex items-center gap-2 text-xs font-bold ${
              isHire
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : isNoHire
                ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                : "bg-amber-500/10 border-amber-500/30 text-amber-400"
            }`}
          >
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>{trimmed.replace(/\*\*/g, "")}</span>
          </div>
        );
      } else if (trimmed.startsWith("- **Before:**")) {
        elements.push(
          <div
            key={index}
            className="mt-3 p-3 rounded-t-xl bg-slate-900/80 border border-slate-800 text-xs text-rose-300 line-through"
          >
            {trimmed.replace("- **Before:**", "Original:").replace(/\*\*/g, "")}
          </div>
        );
      } else if (trimmed.startsWith("- **After:**")) {
        elements.push(
          <div
            key={index}
            className="mb-3 p-3 rounded-b-xl bg-emerald-950/40 border-x border-b border-emerald-500/30 text-xs text-emerald-300 font-medium flex items-start gap-2"
          >
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              {trimmed.replace("- **After:**", "AI Rewritten:").replace(/\*\*/g, "")}
            </span>
          </div>
        );
      } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        const contentStr = trimmed.substring(2);
        elements.push(
          <div
            key={index}
            className="flex items-start gap-2 text-xs text-slate-300 ml-2 my-1 leading-relaxed"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
            <span>
              {contentStr.split("**").map((part, i) =>
                i % 2 === 1 ? (
                  <strong key={i} className="text-white font-semibold">
                    {part}
                  </strong>
                ) : (
                  part
                )
              )}
            </span>
          </div>
        );
      } else {
        elements.push(
          <p
            key={index}
            className="text-xs text-slate-300 leading-relaxed my-1"
          >
            {trimmed.split("**").map((part, i) =>
              i % 2 === 1 ? (
                <strong key={i} className="text-white font-semibold">
                  {part}
                </strong>
              ) : (
                part
              )
            )}
          </p>
        );
      }
    });

    return elements;
  };

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* ── Page Header ── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/30 shrink-0">
            <Briefcase className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                Career Acceleration
              </h1>
              <span className="px-3 py-0.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[10px] font-black tracking-wider uppercase shadow-xs">
                AI Career Suite
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-0.5">
              Multi-stage AI resume evaluation and interview readiness.
            </p>
          </div>
        </div>
      </div>

      {/* ── Cards Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Resume Review */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
          className="h-full group cursor-pointer"
          onClick={() => setIsModalOpen(true)}
        >
          <BorderGlow
            edgeSensitivity={30}
            glowColor="16 185 129"
            backgroundColor="#ffffff"
            borderRadius={28}
            glowRadius={35}
            glowIntensity={1.2}
            animated={false}
            colors={['#10b981', '#06b6d4', '#6366f1']}
            className="h-full p-6 md:p-7 flex flex-col justify-between transition-all duration-300 shadow-sm hover:shadow-xl border border-slate-200/90"
          >
            <div className="flex flex-col justify-between h-full space-y-6">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/30 group-hover:scale-105 transition-transform">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div className="px-3 py-1 rounded-full text-[11px] font-black bg-emerald-500 text-white flex items-center gap-1.5 shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                    Active AI Evaluator
                  </div>
                </div>

                <h3 className="text-xl font-extrabold text-slate-900 mb-2 group-hover:text-emerald-700 transition-colors">
                  Resume Review
                </h3>
                <p className="text-xs md:text-sm text-slate-500 font-medium leading-relaxed">
                  Calibrated AI scanner for Product-Based vs. Service-Based roles.
                  Analyzes ATS compatibility, recruiter impression, line-by-line
                  bullet rewrites, and missing skills.
                </p>
              </div>

              <button
                id="open-resume-review-modal"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsModalOpen(true);
                }}
                className="w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold py-3 rounded-xl transition-all shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 text-xs group/btn cursor-pointer"
              >
                <span>Start Resume Review</span>
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          </BorderGlow>
        </motion.div>

        {/* Card 2: Placement Prep */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
          className="h-full group cursor-pointer"
          onClick={() => setIsPlacementPrepOpen(true)}
        >
          <BorderGlow
            edgeSensitivity={30}
            glowColor="147 51 234"
            backgroundColor="#ffffff"
            borderRadius={28}
            glowRadius={35}
            glowIntensity={1.2}
            animated={false}
            colors={['#8b5cf6', '#c084fc', '#38bdf8']}
            className="h-full p-6 md:p-7 flex flex-col justify-between transition-all duration-300 shadow-sm hover:shadow-xl border border-slate-200/90"
          >
            <div className="flex flex-col justify-between h-full space-y-6">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-white flex items-center justify-center shadow-md shadow-violet-500/30 group-hover:scale-105 transition-transform">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div className="px-3 py-1 rounded-full text-[11px] font-black bg-purple-600 text-white flex items-center gap-1.5 shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                    Active Prep Suite
                  </div>
                </div>

                <h3 className="text-xl font-extrabold text-slate-900 mb-2 group-hover:text-purple-700 transition-colors">
                  Placement Prep
                </h3>
                <p className="text-xs md:text-sm text-slate-500 font-medium leading-relaxed">
                  Curated company-wise interview problem archives, core DSA pattern benchmarks, and tier-1 company hiring rubrics tailored for placement success.
                </p>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPlacementPrepOpen(true);
                }}
                className="w-full bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-500 hover:to-violet-500 text-white font-extrabold py-3 rounded-xl transition-all shadow-md shadow-purple-600/25 flex items-center justify-center gap-2 text-xs group/btn cursor-pointer"
              >
                <span>Start Placement Prep</span>
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          </BorderGlow>
        </motion.div>

        {/* Card 3: AI Interviews (Locked) */}
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
          className="h-full group"
        >
          <BorderGlow
            edgeSensitivity={30}
            glowColor="244 63 94"
            backgroundColor="#ffffff"
            borderRadius={28}
            glowRadius={35}
            glowIntensity={1.0}
            animated={false}
            colors={['#f43f5e', '#fb7185', '#cbd5e1']}
            className="h-full p-6 md:p-7 flex flex-col justify-between transition-all duration-300 shadow-sm border border-slate-200/90"
          >
            <div className="flex flex-col justify-between h-full space-y-6">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-amber-500 text-white flex items-center justify-center shadow-md shadow-rose-500/30">
                    <Lock className="w-6 h-6 text-white" />
                  </div>
                  <div className="px-3 py-1 rounded-full text-[11px] font-black bg-rose-500 text-white flex items-center gap-1.5 shadow-xs">
                    <Lock className="w-3.5 h-3.5" />
                    LOCKED
                  </div>
                </div>

                <h3 className="text-xl font-extrabold text-slate-900 mb-2">
                  AI Interviews
                </h3>
                <p className="text-xs md:text-sm text-slate-500 font-medium leading-relaxed">
                  Real-time AI voice &amp; technical mock interview simulation suite.
                  Locked for platform updates. Complete 5 DSA practice problems to
                  unlock.
                </p>
              </div>

              <button
                disabled
                className="w-full bg-slate-100 border border-slate-200/80 text-slate-400 font-extrabold py-3 rounded-xl flex items-center justify-center gap-2 text-xs cursor-not-allowed"
              >
                <Lock className="w-4 h-4 text-slate-400" />
                <span>AI Interviews Locked</span>
              </button>
            </div>
          </BorderGlow>
        </motion.div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          Resume Review Modal (Mounted via React Portal)
      ══════════════════════════════════════════════════════════════════════ */}
      {isModalOpen && mounted && createPortal(
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
                    onClick={closeModal}
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
                  onClick={closeModal}
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
                {uploadStage !== "reviewing" &&
                  uploadStage !== "done" && (
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
                    {(uploadStage === "uploading" ||
                      uploadStage === "extracting") && (
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
                    {(uploadStage === "extracted" || uploadStage === "review_error") && extraction && (
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
                              FILE_TYPE_COLORS[
                                getFileExt(extraction.filename)
                              ] ?? "text-slate-400 bg-slate-800 border-slate-700"
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

                        {/* Review error — shown when AI call fails after extraction */}
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
                      {renderFormattedMarkdown(reviewText)}
                    </div>
                  </motion.div>
                )}

              </div>
            </motion.div>
          </div>
        </AnimatePresence>,
        document.body
      )}

      {/* Placement Preparation Modal */}
      <PlacementPrepModal
        isOpen={isPlacementPrepOpen}
        onClose={() => setIsPlacementPrepOpen(false)}
      />

      {/* Native Smartphone Floating CTA */}
      <FloatingCTA
        onClick={() => {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        icon={<Upload className="w-5 h-5 text-white" />}
        label="Analyze Resume"
      />
    </div>
  );
}
