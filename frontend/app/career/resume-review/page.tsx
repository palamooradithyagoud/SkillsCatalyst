"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
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
  Check,
  Mail,
  Phone,
  MapPin,
  Globe,
  Layers,
  LayoutTemplate,
  Sliders,
  ExternalLink,
  Printer,
  Copy,
  Code2,
  Eye,
  Download,
  Save,
  HardDrive,
  Calendar,
} from "lucide-react";
import StageIndicator from "@/components/career/StageIndicator";
import ResumeMarkdownViewer from "@/components/career/ResumeMarkdownViewer";
import ResumeAnalysisResults from "@/components/career/ResumeAnalysisResults";
import ResumeHistory from "@/components/career/ResumeHistory";
import ResumeSeriesDashboard from "@/components/career/ResumeSeriesDashboard";
import ResumeComparisonModal from "@/components/career/ResumeComparisonModal";
import ResumeGrowthDashboard from "@/components/career/ResumeGrowthDashboard";
import TemplateSelectModal, {
  ResumeTemplateId,
  RESUME_TEMPLATES,
} from "@/components/career/TemplateSelectModal";
import ResumeLivePreview from "@/components/career/ResumeLivePreview";
import { ResumeData } from "@/lib/career/latexExportHelper";
import { exportResumeAsPdf } from "@/lib/career/pdfExportHelper";
import confetti from "canvas-confetti";
import {
  COMMON_ROLES,
  FILE_TYPE_COLORS,
  MAX_FILE_MB,
} from "@/data/career/constants";
import { getFileExt } from "@/lib/career/helpers";
import { useResumeReview } from "@/hooks/useResumeReview";
import {
  reviewResume,
  getResumeHistory,
  getResumeAnalysisById,
  downloadResumeFile,
} from "@/lib/api/career";
import { useAuth } from "@/lib/auth";

interface SavedResumeItem {
  id: string;
  title: string;
  role: string;
  date: string;
  atsScore: number | null;
  starred?: boolean;
  templateId?: ResumeTemplateId;
  resumeData?: ResumeData;
}

const defaultResumeData: ResumeData = {
  fullName: "Aadithya Goud",
  role: "Fullstack Software Engineer",
  email: "adithya@example.com",
  phone: "+91 98765 43210",
  location: "Hyderabad, India",
  linkedin: "linkedin.com/in/adithya",
  github: "github.com/adithya",
  summary:
    "Passionate Software Engineer skilled in modern web development, distributed architecture, and scalable full-stack applications with high ATS ranking standards.",
  education: [
    {
      institution: "Indian Institute of Information Technology",
      degree: "B.Tech in Computer Science & Engineering",
      location: "Hyderabad, India",
      dates: "2021 — 2025",
      gpa: "8.9 / 10.0",
    },
  ],
  experience: [
    {
      company: "SkillsCatalyst",
      role: "Lead Fullstack Engineer",
      location: "Remote / Hyderabad",
      dates: "Jan 2024 — Present",
      bullets: [
        "Architected real-time AI career acceleration platform serving thousands of active developers.",
        "Built resilient FastAPI microservices and optimized PostgreSQL indexing, reducing P99 latency by 45%.",
        "Engineered responsive Next.js frontend with GSAP motion and high-contrast accessibility standards.",
      ],
    },
    {
      company: "HyperTech Labs",
      role: "Software Engineering Intern",
      location: "Bangalore, India",
      dates: "May 2023 — Dec 2023",
      bullets: [
        "Designed and maintained scalable RESTful endpoints with automated OpenAPI schemas.",
        "Integrated Redis caching layer, lowering repeated database queries by 60%.",
      ],
    },
  ],
  projects: [
    {
      name: "SkillsCatalyst AI Suite",
      tech: "Next.js, FastAPI, Groq LLM, Supabase, Docker",
      link: "skillscatalyst.in",
      bullets: [
        "Developed full-featured ATS resume score analyzer and interactive career roadmaps.",
        "Integrated multi-model LLM benchmarking with structured fallback orchestration.",
      ],
    },
  ],
  skills: {
    languages: "JavaScript, TypeScript, Python, C++, SQL, HTML/CSS",
    frameworks: "React, Next.js, FastAPI, Node.js, Express, Tailwind CSS",
    tools: "Docker, Git, PostgreSQL, Supabase, Redis, Linux, Vercel",
    all: "React, Next.js, TypeScript, Python, FastAPI, Node.js, PostgreSQL, Docker, Redis, Tailwind CSS",
  },
};

function serializeResumeDataToPlainText(data: ResumeData): string {
  const parts: string[] = [];
  if (data.fullName) parts.push(`Name: ${data.fullName}`);
  if (data.role) parts.push(`Target Role: ${data.role}`);
  const contacts = [data.email, data.phone, data.location, data.linkedin, data.github].filter(Boolean);
  if (contacts.length) parts.push(`Contact: ${contacts.join(" | ")}`);
  if (data.summary) parts.push(`\nProfessional Summary:\n${data.summary}`);
  if (data.experience && data.experience.length) {
    parts.push(`\nExperience:`);
    data.experience.forEach((exp) => {
      parts.push(`- ${exp.role} at ${exp.company} (${exp.dates || exp.startDate || ""})`);
      (exp.bullets || []).forEach((b) => parts.push(`  * ${b}`));
    });
  }
  if (data.education && data.education.length) {
    parts.push(`\nEducation:`);
    data.education.forEach((edu) => {
      parts.push(`- ${edu.degree}, ${edu.institution} (${edu.dates || ""}) ${edu.gpa ? `GPA: ${edu.gpa}` : ""}`);
    });
  }
  if (data.projects && data.projects.length) {
    parts.push(`\nProjects:`);
    data.projects.forEach((proj) => {
      parts.push(`- ${proj.name} (${proj.tech || ""})`);
      (proj.bullets || []).forEach((b) => parts.push(`  * ${b}`));
    });
  }
  if (data.skills) {
    parts.push(`\nSkills:`);
    if (data.skills.languages) parts.push(`Languages: ${data.skills.languages}`);
    if (data.skills.frameworks) parts.push(`Frameworks: ${data.skills.frameworks}`);
    if (data.skills.databases) parts.push(`Databases: ${data.skills.databases}`);
    if (data.skills.tools) parts.push(`Tools: ${data.skills.tools}`);
  }
  return parts.join("\n").trim();
}

export default function ResumeWorkspacePage() {
  const router = useRouter();
  const { session } = useAuth();
  const userName = session?.name || "Aadithya Goud";

  // Tab state for left sidebar: "recent" | "all" | "starred"
  const [activeTab, setActiveTab] = useState<"recent" | "all" | "starred">("recent");

  // Main panel active mode: "empty" | "upload" | "create" | "history" | "series" | "growth"
  const [viewMode, setViewMode] = useState<"empty" | "upload" | "create" | "history" | "series" | "growth">("empty");

  // Comparison & Growth state
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [compareOlderId, setCompareOlderId] = useState<string | null>(null);
  const [compareNewerId, setCompareNewerId] = useState<string | null>(null);
  const [growthSeriesId, setGrowthSeriesId] = useState<string | null>(null);

  // Template modal state
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ResumeTemplateId>("sb2nov");

  // Builder section navigation & mobile view toggle
  const [activeEditorSection, setActiveEditorSection] = useState<
    "contact" | "experience" | "education" | "projects" | "skills"
  >("contact");
  const [mobileBuilderTab, setMobileBuilderTab] = useState<"editor" | "preview">("editor");
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isEvaluatingBuilderResume, setIsEvaluatingBuilderResume] = useState(false);

  // Saved resumes state
  const [savedResumes, setSavedResumes] = useState<SavedResumeItem[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [historyRefreshTrigger, setHistoryRefreshTrigger] = useState(0);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Resume builder data state
  const [resumeData, setResumeData] = useState<ResumeData>({
    ...defaultResumeData,
    fullName: userName,
  });

  // Authoritative cloud history loading (with localStorage fallback)
  useEffect(() => {
    let isMounted = true;
    async function fetchCloudHistory() {
      setIsLoadingHistory(true);
      try {
        const res = await getResumeHistory({ page: 1, pageSize: 20 });
        if (isMounted && res?.items && res.items.length > 0) {
          const cloudSaved: SavedResumeItem[] = res.items.map((item) => ({
            id: item.id,
            title: item.original_filename,
            role: item.file_type ? `${item.file_type} Document` : "Uploaded Resume",
            date: new Date(item.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            }),
            atsScore: item.overall_score ?? item.ats_score ?? null,
            starred: false,
          }));
          setSavedResumes(cloudSaved);
        }
      } catch {
        // Fall back to local storage if unauthenticated or offline
        try {
          const stored = localStorage.getItem("skillscatalyst_resumes");
          if (stored && isMounted) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setSavedResumes(parsed);
            }
          }
        } catch {}
      } finally {
        if (isMounted) setIsLoadingHistory(false);
      }
    }
    fetchCloudHistory();
    return () => {
      isMounted = false;
    };
  }, [historyRefreshTrigger]);

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
    overallScore,
    scoringStatus,
    atsAnalysis,
    keywordAnalysis,
    skillEvidence,
    projectsEvaluation,
    educationEvaluation,
    contentQuality,
    recruiterEvaluation,
    jobMatching,
    aiEvaluation,
    scoreBreakdown,
    careerStage,
    subScores,
    isDragging,
    fileInputRef,
    stageNum,
    handleFileChange,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleRunEvaluation,
    loadHistoricalAnalysis,
    resetAll,
  } = reviewState;

  // Trigger history refresh when a new cloud analysis completes
  useEffect(() => {
    if (uploadStage === "done" && reviewState.savedAnalysisId) {
      setHistoryRefreshTrigger((p) => p + 1);
    }
  }, [uploadStage, reviewState.savedAnalysisId]);

  const handleSelectHistoricalAnalysis = async (analysisId: string) => {
    setSelectedResumeId(analysisId);
    try {
      const detail = await getResumeAnalysisById(analysisId);
      if (detail && detail.analysis_result) {
        reviewState.loadHistoricalAnalysis(detail);
        setViewMode("upload");
      }
    } catch (err: unknown) {
      console.error("Failed to load historical analysis:", err);
    }
  };

  const handleDownloadHistorical = async (analysisId: string) => {
    try {
      const res = await downloadResumeFile(analysisId);
      if (res?.signed_url) {
        const link = document.createElement("a");
        link.href = res.signed_url;
        link.download = res.filename || "resume.pdf";
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  // Sync uploadStage: if evaluated, keep view on upload/results
  useEffect(() => {
    if (uploadStage === "done" && reviewText) {
      const existing = savedResumes.find((r) => r.id === extraction?.filename || r.id === reviewState.savedAnalysisId);
      if (!existing && extraction) {
        const calculatedAtsScore =
          typeof overallScore === "number" && !isNaN(overallScore)
            ? Math.round(overallScore)
            : null;
        const newItem: SavedResumeItem = {
          id: reviewState.savedAnalysisId || extraction.filename || `resume-${Date.now()}`,
          title: extraction.filename,
          role: targetRole,
          date: "Just now",
          atsScore: calculatedAtsScore,
          starred: false,
        };
        setSavedResumes((prev) => {
          const next = [newItem, ...prev];
          try {
            localStorage.setItem("skillscatalyst_resumes", JSON.stringify(next));
          } catch {}
          return next;
        });
        setSelectedResumeId(newItem.id);
      }
    }
  }, [uploadStage, reviewText, extraction, targetRole, savedResumes, overallScore]);

  const handleStartUpload = () => {
    setViewMode("upload");
    resetAll();
  };

  const handleStartCreate = () => {
    router.push("/career/resume-builder");
  };

  const handleTemplateChosen = (tmplId: ResumeTemplateId) => {
    setSelectedTemplate(tmplId);
    setIsTemplateModalOpen(false);
    setViewMode("create");
    setMobileBuilderTab("editor");
  };

  const handleSaveCreatedResume = () => {
    // Preserve verified score if evaluated, otherwise explicitly null (Not evaluated)
    const existing = savedResumes.find((r) => r.id === selectedResumeId);
    const verifiedScore = existing?.atsScore ?? null;
    const newItem: SavedResumeItem = {
      id: selectedResumeId && selectedResumeId.startsWith("resume-") ? selectedResumeId : `resume-${Date.now()}`,
      title: `${resumeData.fullName || "Untitled"} — ${resumeData.role || "Resume"}`,
      role: resumeData.role || "Software Engineer",
      date: "Just now",
      atsScore: verifiedScore, // Never invent or default to 95; only null (Not evaluated) or genuine score
      starred: false,
      templateId: selectedTemplate,
      resumeData: { ...resumeData },
    };
    const nextList = [newItem, ...savedResumes.filter((r) => r.id !== newItem.id)];
    setSavedResumes(nextList);
    try {
      localStorage.setItem("skillscatalyst_resumes", JSON.stringify(nextList));
    } catch (e) {
      console.error(e);
    }
    setSelectedResumeId(newItem.id);
    try {
      confetti({ particleCount: 75, spread: 70, origin: { y: 0.65 } });
    } catch {}
  };

  const handleEvaluateBuilderResume = async () => {
    const plainText = serializeResumeDataToPlainText(resumeData);
    if (!plainText || plainText.length < 50) {
      alert("Please provide more resume details before running an ATS evaluation.");
      return;
    }
    setIsEvaluatingBuilderResume(true);
    try {
      const filename = `${resumeData.fullName || "Resume"}.pdf`;
      const res = await reviewResume(
        plainText,
        resumeData.role || "Software Engineer",
        "1-3 years",
        "Product-Based",
        "",
        filename
      );
      if (typeof res.overall_score === "number" && !isNaN(res.overall_score)) {
        const scoreVal = Math.round(res.overall_score);
        setSavedResumes((prev) => {
          const updated = prev.map((r) =>
            r.id === selectedResumeId ? { ...r, atsScore: scoreVal } : r
          );
          try {
            localStorage.setItem("skillscatalyst_resumes", JSON.stringify(updated));
          } catch {}
          return updated;
        });
        reviewState.setEditedText(plainText);
        if (res.review) {
          reviewState.setReviewText(res.review);
          reviewState.setOverallScore(scoreVal);
          reviewState.setScoringStatus("scored");
        }
      }
    } catch (err: any) {
      console.error("Failed to evaluate builder resume:", err);
    } finally {
      setIsEvaluatingBuilderResume(false);
    }
  };

  const toggleStar = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedResumes((prev) => {
      const next = prev.map((r) => (r.id === id ? { ...r, starred: !r.starred } : r));
      try {
        localStorage.setItem("skillscatalyst_resumes", JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const deleteResume = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedResumes((prev) => {
      const next = prev.filter((r) => r.id !== id);
      try {
        localStorage.setItem("skillscatalyst_resumes", JSON.stringify(next));
      } catch {}
      return next;
    });
    if (selectedResumeId === id) {
      setSelectedResumeId(null);
      setViewMode("empty");
    }
  };

  const filteredResumes = savedResumes
    .filter((r) => {
      if (activeTab === "starred") return r.starred;
      return true;
    })
    .sort((a, b) => {
      if (activeTab === "recent") {
        return (b.id || "").localeCompare(a.id || "");
      }
      return 0;
    });

  return (
    <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 pb-20 select-none overflow-x-hidden w-full">
      {/* ──────────────────────────────────────────────────────────
          1. TOP HERO / BANNER CARD (Dark Charcoal Theme & Crisp White Text)
      ────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-[#141519] border border-zinc-800 p-4 sm:p-6 md:p-7 shadow-2xl transition-all">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
          {/* Left Column: Headlines & Call to Actions */}
          <div className="lg:col-span-7 space-y-3 sm:space-y-3.5">
            <div>
              <p className="text-[10px] font-extrabold tracking-[0.18em] text-zinc-400 uppercase mb-1">
                BUILD. ANALYZE. IMPROVE.
              </p>
              <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-[32px] font-black text-white tracking-tight leading-tight">
                Resumes that open doors.
              </h1>
              <p className="text-xs sm:text-[13px] text-zinc-300 font-medium leading-relaxed mt-1 max-w-lg">
                Create industry-ready resumes, analyze ATS scores, fix missing keywords, and export professional PDFs in seconds.
              </p>
            </div>

            {/* Top Primary & Secondary CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5 pt-0.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleStartCreate}
                className="w-full sm:w-auto justify-center bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs px-4 sm:px-5 py-2.5 rounded-xl border border-zinc-700 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create New Resume</span>
              </button>

              <button
                type="button"
                onClick={handleStartUpload}
                className="w-full sm:w-auto justify-center bg-[#23242B] hover:bg-[#2c2d36] text-white font-bold text-xs px-4 sm:px-5 py-2.5 rounded-xl border border-zinc-800 shadow-sm flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
              >
                <Upload className="w-3.5 h-3.5 text-zinc-300" />
                <span>Upload Existing</span>
              </button>
            </div>

            {/* Feature Highlights Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-2.5 pt-2 sm:pt-1.5 border-t border-zinc-800 sm:border-0">
              {/* Feature 1 */}
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#23242B] text-zinc-300 flex items-center justify-center shrink-0 border border-zinc-800 shadow-sm">
                  <FileCheck className="w-3.5 h-3.5 text-zinc-300" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-[11px] font-bold text-white leading-tight">
                    ATS Scoring
                  </h4>
                  <p className="text-[9px] text-zinc-400 font-medium truncate">
                    Deterministic checks
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#23242B] text-zinc-300 flex items-center justify-center shrink-0 border border-zinc-800 shadow-sm">
                  <FileBadge className="w-3.5 h-3.5 text-zinc-300" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-[11px] font-bold text-white leading-tight">
                    Role Calibration
                  </h4>
                  <p className="text-[9px] text-zinc-400 font-medium truncate">
                    Domain &amp; keywords
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#23242B] text-zinc-300 flex items-center justify-center shrink-0 border border-zinc-800 shadow-sm">
                  <FileText className="w-3.5 h-3.5 text-zinc-300" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-[11px] font-bold text-white leading-tight">
                    Export in PDF &amp; LaTeX
                  </h4>
                  <p className="text-[9px] text-zinc-400 font-medium truncate">
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
                  style={{ fontFamily: "var(--font-caveat), 'Caveat', cursive" }}
                  className="text-zinc-400 font-bold text-xs sm:text-base tracking-wide -rotate-6"
                >
                  From résumé
                  <br />
                  to opportunities
                </span>
                <svg
                  className="w-5 h-4 sm:w-7 sm:h-5 text-zinc-500 -rotate-12 mt-0.5 mr-0.5 sm:mr-1"
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
              <div className="absolute left-0 top-1 w-[195px] sm:w-[215px] bg-[#1a1b22] rounded-xl border border-zinc-800 p-3 shadow-xl text-white transform -rotate-1">
                <div className="flex items-center gap-2 pb-2 border-b border-zinc-800">
                  <div className="w-6 h-6 rounded-full bg-zinc-700 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                    {userName.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-extrabold text-white truncate leading-none">
                      {userName}
                    </p>
                    <p className="text-[8px] text-zinc-400 font-medium truncate mt-0.5">
                      Software Engineer
                    </p>
                  </div>
                </div>

                {/* Contact Icons Strip */}
                <div className="space-y-0.5 pt-1.5 pb-1.5 text-[8px] text-zinc-300 font-medium">
                  <div className="flex items-center gap-1 truncate">
                    <Mail className="w-2 h-2 text-zinc-400 shrink-0" />
                    <span>adithya@example.com</span>
                  </div>
                  <div className="flex items-center gap-1 truncate">
                    <Phone className="w-2 h-2 text-zinc-400 shrink-0" />
                    <span>+91 98765 43210</span>
                  </div>
                  <div className="flex items-center gap-1 truncate">
                    <MapPin className="w-2 h-2 text-zinc-400 shrink-0" />
                    <span>Hyderabad, India</span>
                  </div>
                  <div className="flex items-center gap-1 truncate">
                    <Globe className="w-2 h-2 text-zinc-400 shrink-0" />
                    <span>linkedin.com/in/adithya</span>
                  </div>
                </div>

                {/* Skeleton Education & Experience Lines */}
                <div className="space-y-1.5 pt-1 border-t border-zinc-800">
                  <div>
                    <span className="text-[8px] font-bold text-zinc-200">
                      Education
                    </span>
                    <div className="w-3/4 h-1 bg-zinc-700/60 rounded-full mt-0.5" />
                  </div>
                  <div>
                    <span className="text-[8px] font-bold text-zinc-200">
                      Experience
                    </span>
                    <div className="w-5/6 h-1 bg-zinc-700/60 rounded-full mt-0.5" />
                  </div>
                </div>
              </div>

              {/* Front Card: Elevated Overlapping ATS Score Card */}
              <div className="absolute right-0 bottom-0 w-[130px] sm:w-[145px] bg-[#22232a] rounded-xl border border-zinc-800 p-2.5 shadow-2xl text-center space-y-1.5 z-10">
                <div className="text-left">
                  <span className="text-[9px] font-extrabold text-zinc-200">
                    ATS Score
                  </span>
                </div>

                {/* Circular Score Gauge */}
                <div className="relative w-14 h-14 mx-auto flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    {/* Background circle */}
                    <path
                      className="text-[#333542]"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    {/* Progress circle */}
                    <path
                      className="text-white"
                      strokeDasharray="92, 100"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-base sm:text-lg font-black text-white leading-none">
                      92
                    </span>
                  </div>
                </div>

                {/* Score Rating */}
                <div>
                  <p className="text-[9px] font-extrabold text-zinc-300">
                    Great Match
                  </p>
                </div>

                {/* Checklist */}
                <div className="space-y-0.5 text-left pt-1 border-t border-zinc-800">
                  <div className="flex items-center gap-1 text-[8px] font-semibold text-zinc-200">
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-700 text-zinc-300 flex items-center justify-center shrink-0">
                      <Check className="w-1.5 h-1.5 stroke-[3]" />
                    </div>
                    <span>Relevant Keywords</span>
                  </div>
                  <div className="flex items-center gap-1 text-[8px] font-semibold text-zinc-200">
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-700 text-zinc-300 flex items-center justify-center shrink-0">
                      <Check className="w-1.5 h-1.5 stroke-[3]" />
                    </div>
                    <span>Proper Structure</span>
                  </div>
                  <div className="flex items-center gap-1 text-[8px] font-semibold text-zinc-200">
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-700 text-zinc-300 flex items-center justify-center shrink-0">
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
          MOBILE SEGMENTED SWITCHER (Dark Charcoal & White Text)
      ────────────────────────────────────────────────────────── */}
      <div className="lg:hidden flex items-center bg-[#141519] p-1 rounded-xl border border-zinc-800">
        <button
          type="button"
          onClick={() => setViewMode("empty")}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            viewMode === "empty"
              ? "bg-zinc-800 text-white shadow-xs border border-zinc-700"
              : "text-zinc-400 hover:text-white"
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
              ? "bg-zinc-800 text-white shadow-xs border border-zinc-700"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          <FileBadge className="w-3.5 h-3.5 text-zinc-300" />
          <span>{viewMode === "create" ? "Resume Builder" : "ATS Evaluator"}</span>
        </button>
      </div>

      {/* ──────────────────────────────────────────────────────────
          2. TWO-COLUMN MAIN WORKSPACE: "YOUR RESUMES" + DETAIL WORKSPACE
      ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
        {/* ── Left Column: "Your Resumes" Sidebar (Dark Charcoal & White Text) ── */}
        <div
          className={`lg:col-span-4 bg-[#141519] border border-zinc-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl space-y-3.5 sm:space-y-4 ${
            viewMode !== "empty" ? "hidden lg:block" : "block"
          }`}
        >
          {/* Header Row */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-white">
              Your Resumes
            </h3>
            <span className="w-6 h-6 rounded-full bg-[#23242B] text-zinc-300 font-bold text-xs flex items-center justify-center border border-zinc-800">
              {savedResumes.length}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={handleStartCreate}
              className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs border border-zinc-700 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Resume</span>
            </button>

            <button
              type="button"
              onClick={handleStartUpload}
              className="w-full bg-[#1c1d24] hover:bg-[#252630] text-white font-bold py-2.5 px-4 rounded-xl text-xs border border-zinc-800 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <Upload className="w-3.5 h-3.5 text-zinc-300" />
              <span>Upload Existing Resume</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode("series")}
              className={`w-full font-bold py-2.5 px-4 rounded-xl text-xs border flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95 ${
                viewMode === "series" || viewMode === "growth"
                  ? "bg-zinc-800 text-white border-zinc-600"
                  : "bg-[#1c1d24] hover:bg-[#252630] text-zinc-300 border-zinc-800"
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-zinc-400" />
              <span>Resume Tracks & Series</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode("history")}
              className={`w-full font-bold py-2.5 px-4 rounded-xl text-xs border flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95 ${
                viewMode === "history"
                  ? "bg-zinc-800 text-white border-zinc-600"
                  : "bg-[#1c1d24] hover:bg-[#252630] text-zinc-300 border-zinc-800"
              }`}
            >
              <HardDrive className="w-3.5 h-3.5 text-zinc-400" />
              <span>Cloud Analysis History</span>
            </button>
          </div>

          {/* Tab Filter Navigation */}
          <div className="flex items-center gap-6 border-b border-zinc-800 pt-1 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab("recent")}
              className={`pb-2 font-bold transition-colors cursor-pointer relative ${
                activeTab === "recent"
                  ? "text-white border-b-2 border-white"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Recent
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`pb-2 font-bold transition-colors cursor-pointer relative ${
                activeTab === "all"
                  ? "text-white border-b-2 border-white"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("starred")}
              className={`pb-2 font-bold transition-colors cursor-pointer relative ${
                activeTab === "starred"
                  ? "text-white border-b-2 border-white"
                  : "text-zinc-400 hover:text-white"
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
                <div className="w-12 h-12 rounded-2xl bg-[#1c1d24] border border-zinc-800 text-zinc-400 flex items-center justify-center mx-auto shadow-sm">
                  <FileText className="w-6 h-6 text-zinc-400" />
                </div>
                <h4 className="text-xs font-extrabold text-white">
                  No resumes yet
                </h4>
                <p className="text-[11px] text-zinc-400 font-medium">
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
                      role="button"
                      tabIndex={0}
                      aria-label={`Select resume ${resume.title}`}
                      onClick={() => {
                        setSelectedResumeId(resume.id);
                        if (resume.templateId && resume.resumeData) {
                          setSelectedTemplate(resume.templateId);
                          setResumeData(resume.resumeData);
                          setViewMode("create");
                        } else {
                          setViewMode("upload");
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setSelectedResumeId(resume.id);
                          if (resume.templateId && resume.resumeData) {
                            setSelectedTemplate(resume.templateId);
                            setResumeData(resume.resumeData);
                            setViewMode("create");
                          } else {
                            setViewMode("upload");
                          }
                        }
                      }}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 focus:outline-none focus:ring-2 focus:ring-zinc-600 focus:ring-offset-1 focus:ring-offset-[#141519] ${
                        isSelected
                          ? "bg-zinc-800 border-zinc-600 shadow-md"
                          : "bg-[#1a1b22] border-zinc-800 hover:border-zinc-700 hover:bg-[#22232a]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className="w-8 h-8 rounded-xl bg-zinc-800 text-white border border-zinc-700 flex items-center justify-center shrink-0 font-bold text-xs"
                          title={resume.atsScore !== null && resume.atsScore !== undefined ? `ATS Score: ${resume.atsScore}/100` : "Not evaluated"}
                        >
                          {resume.atsScore !== null && resume.atsScore !== undefined ? (
                            resume.atsScore
                          ) : (
                            <span className="text-[9px] text-zinc-400 font-bold">N/A</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">
                            {resume.title}
                          </p>
                          <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 truncate mt-0.5">
                            {resume.templateId && (
                              <span className="bg-zinc-800 text-zinc-300 border border-zinc-700 px-1.5 py-0.2 rounded font-bold text-[9px] uppercase">
                                {resume.templateId === "sb2nov"
                                  ? "SB2Nov"
                                  : resume.templateId === "modern-cv"
                                  ? "Modern CV"
                                  : "Classic"}
                              </span>
                            )}
                            <span className="truncate">{resume.role} · {resume.date}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => toggleStar(resume.id, e)}
                          aria-label={resume.starred ? "Unstar resume" : "Star resume"}
                          className="p-1 rounded-lg hover:bg-[#252630] text-zinc-400 hover:text-amber-400 transition-colors"
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
                          aria-label="Delete resume"
                          className="p-1 rounded-lg hover:bg-rose-950/40 text-zinc-400 hover:text-rose-400 transition-colors"
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

        {/* ── Right Column: Main Detail / Workspace Panel (Dark Charcoal & White Text) ── */}
        <div
          className={`${
            viewMode === "create" || viewMode === "series" || viewMode === "growth"
              ? "lg:col-span-12"
              : "lg:col-span-8"
          } bg-[#141519] border border-zinc-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-xl min-h-[300px] sm:min-h-[460px] flex flex-col justify-center ${
            viewMode === "empty" ? "hidden lg:flex" : "flex"
          }`}
        >
          {/* ──────────────────────────────────────────────────────────
              STATE A: "NO RESUME SELECTED" (Dark Charcoal & Crisp White Text)
          ────────────────────────────────────────────────────────── */}
          {viewMode === "empty" && (
            <div className="text-center space-y-3 sm:space-y-4 py-4 sm:py-8 max-w-md mx-auto w-full">
              {/* Document Icon with Neutral Plus Badge */}
              <div className="relative inline-block mx-auto mb-1">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#1c1d24] border border-zinc-800 flex items-center justify-center text-zinc-400 shadow-sm">
                  <FileText className="w-7 h-7 sm:w-9 sm:h-9 text-zinc-400" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-zinc-700 text-white flex items-center justify-center shadow-md">
                  <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3]" />
                </div>
              </div>

              {/* Title & Description */}
              <div>
                <h2 className="text-lg sm:text-2xl font-black text-white">
                  No Resume Selected
                </h2>
                <p className="text-xs sm:text-sm text-zinc-300 font-medium leading-relaxed mt-1 sm:mt-2 max-w-md mx-auto">
                  Select a resume from the sidebar or create a new one to view ATS scores, keyword analysis, and personalized recommendations.
                </p>
              </div>

              {/* Two CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2 sm:gap-3 pt-2 w-full">
                <button
                  type="button"
                  onClick={handleStartCreate}
                  className="w-full sm:w-auto justify-center bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs sm:text-sm px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl border border-zinc-700 flex items-center gap-2 transition-all cursor-pointer active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Your First Resume</span>
                </button>

                <button
                  type="button"
                  onClick={handleStartUpload}
                  className="w-full sm:w-auto justify-center bg-[#23242B] hover:bg-[#2c2d36] text-white font-bold text-xs sm:text-sm px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl border border-zinc-800 shadow-sm flex items-center gap-2 transition-all cursor-pointer active:scale-95"
                >
                  <Upload className="w-4 h-4 text-zinc-300" />
                  <span>Upload a Resume</span>
                </button>
              </div>
            </div>
          )}

          {/* ──────────────────────────────────────────────────────────
              STATE B: RESUME CREATOR / BUILDER STUDIO
          ────────────────────────────────────────────────────────── */}
          {viewMode === "create" && (
            <div className="space-y-5">
              {/* Studio Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setViewMode("empty")}
                    className="p-2 rounded-xl hover:bg-[#1c1d24] text-zinc-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base sm:text-lg font-black text-white">
                        {resumeData.fullName}
                      </h3>
                      <button
                        type="button"
                        onClick={() => setIsTemplateModalOpen(true)}
                        className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-zinc-800 text-zinc-300 hover:bg-zinc-750 border border-zinc-700 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <LayoutTemplate className="w-3 h-3 text-zinc-400" />
                        <span>
                          {selectedTemplate === "sb2nov"
                            ? "Template: SB2Nov"
                            : selectedTemplate === "modern-cv"
                            ? "Template: Modern CV"
                            : "Template: Simple & Classic"}
                        </span>
                        <span className="text-zinc-400 font-normal">· Change</span>
                      </button>

                      {(() => {
                        const currentResume = savedResumes.find((r) => r.id === selectedResumeId);
                        if (currentResume?.atsScore !== null && currentResume?.atsScore !== undefined) {
                          return (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-zinc-800 text-white border border-zinc-700 flex items-center gap-1">
                              ATS Score: {currentResume.atsScore}/100
                            </span>
                          );
                        }
                        return (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#1c1d24] text-zinc-400 border border-zinc-800">
                            Not evaluated
                          </span>
                        );
                      })()}
                    </div>
                    <p className="text-xs text-zinc-400 font-medium">
                      Live preview updates instantly with your changes.
                    </p>
                  </div>
                </div>

                {/* Mobile View Toggle & Save Button */}
                <div className="flex items-center gap-2 self-end sm:self-auto w-full sm:w-auto">
                  <div className="lg:hidden flex items-center bg-[#1c1d24] p-0.5 rounded-xl border border-zinc-800 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setMobileBuilderTab("editor")}
                      className={`px-3 py-1.5 rounded-lg transition-all ${
                        mobileBuilderTab === "editor"
                          ? "bg-zinc-800 text-white shadow-xs"
                          : "text-zinc-400"
                      }`}
                    >
                      Edit Form
                    </button>
                    <button
                      type="button"
                      onClick={() => setMobileBuilderTab("preview")}
                      className={`px-3 py-1.5 rounded-lg transition-all ${
                        mobileBuilderTab === "preview"
                          ? "bg-zinc-800 text-white shadow-xs"
                          : "text-zinc-400"
                      }`}
                    >
                      Preview
                    </button>
                  </div>

                  <button
                    type="button"
                    disabled={isExportingPdf}
                    onClick={async () => {
                      if (isExportingPdf) return;
                      setIsExportingPdf(true);
                      try {
                        await exportResumeAsPdf({
                          elementId: "resume-printable-document",
                          fullName: resumeData.fullName,
                        });
                        try {
                          confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
                        } catch {}
                      } catch (err) {
                        console.error("Failed to export PDF:", err);
                      } finally {
                        setIsExportingPdf(false);
                      }
                    }}
                    className="flex-1 sm:flex-none bg-[#1c1d24] hover:bg-[#23242B] text-zinc-200 hover:text-white border border-zinc-800 font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isExportingPdf ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 text-zinc-400 animate-spin" />
                        <span>Exporting PDF...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Export as PDF</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    disabled={isEvaluatingBuilderResume}
                    onClick={handleEvaluateBuilderResume}
                    className="flex-1 sm:flex-none bg-zinc-800 hover:bg-zinc-750 text-white border border-zinc-700 font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isEvaluatingBuilderResume ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 text-zinc-400 animate-spin" />
                        <span>Evaluating ATS...</span>
                      </>
                    ) : (
                      <>
                        <FileCheck className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Evaluate ATS</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveCreatedResume}
                    className="flex-1 sm:flex-none bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl border border-zinc-700 transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Resume</span>
                  </button>
                </div>
              </div>

              {/* Studio Body: Form on Left, Live Preview on Right */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* ── Left Column: Editor Sections (lg: 5 cols) ── */}
                <div
                  className={`lg:col-span-5 space-y-4 ${
                    mobileBuilderTab === "preview" ? "hidden lg:block" : "block"
                  }`}
                >
                  {/* Section Switcher Tabs */}
                  <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-zinc-800 text-xs">
                    {(
                      [
                        { id: "contact", label: "Contact" },
                        { id: "experience", label: "Experience" },
                        { id: "education", label: "Education" },
                        { id: "projects", label: "Projects" },
                        { id: "skills", label: "Skills" },
                      ] as const
                    ).map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveEditorSection(tab.id)}
                        className={`px-3 py-1.5 font-bold rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                          activeEditorSection === tab.id
                            ? "bg-zinc-800 text-white border border-zinc-700 shadow-xs"
                            : "text-zinc-400 hover:text-white hover:bg-[#1c1d24]"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Section 1: Contact & Personal Details */}
                  {activeEditorSection === "contact" && (
                    <div className="space-y-3.5 bg-[#18191f] p-4 rounded-2xl border border-zinc-800 text-xs">
                      <div>
                        <label className="font-bold text-zinc-200 block mb-1">Full Name</label>
                        <input
                          type="text"
                          value={resumeData.fullName}
                          onChange={(e) =>
                            setResumeData({ ...resumeData, fullName: e.target.value })
                          }
                          className="w-full px-3.5 py-2 bg-[#1c1d24] border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-zinc-200 block mb-1">Target Role / Headline</label>
                        <input
                          type="text"
                          value={resumeData.role}
                          onChange={(e) =>
                            setResumeData({ ...resumeData, role: e.target.value })
                          }
                          className="w-full px-3.5 py-2 bg-[#1c1d24] border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="font-bold text-zinc-200 block mb-1">Email</label>
                          <input
                            type="email"
                            value={resumeData.email}
                            onChange={(e) =>
                              setResumeData({ ...resumeData, email: e.target.value })
                            }
                            className="w-full px-3 py-2 bg-[#1c1d24] border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-zinc-200 block mb-1">Phone</label>
                          <input
                            type="text"
                            value={resumeData.phone}
                            onChange={(e) =>
                              setResumeData({ ...resumeData, phone: e.target.value })
                            }
                            className="w-full px-3 py-2 bg-[#1c1d24] border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="font-bold text-zinc-200 block mb-1">Location</label>
                          <input
                            type="text"
                            value={resumeData.location}
                            onChange={(e) =>
                              setResumeData({ ...resumeData, location: e.target.value })
                            }
                            className="w-full px-3 py-2 bg-[#1c1d24] border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-zinc-200 block mb-1">LinkedIn Profile</label>
                          <input
                            type="text"
                            value={resumeData.linkedin}
                            onChange={(e) =>
                              setResumeData({ ...resumeData, linkedin: e.target.value })
                            }
                            className="w-full px-3 py-2 bg-[#1c1d24] border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="font-bold text-zinc-200 block mb-1">GitHub / Portfolio</label>
                        <input
                          type="text"
                          value={resumeData.github}
                          onChange={(e) =>
                            setResumeData({ ...resumeData, github: e.target.value })
                          }
                          className="w-full px-3.5 py-2 bg-[#1c1d24] border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-zinc-200 block mb-1">Professional Summary</label>
                        <textarea
                          rows={3}
                          value={resumeData.summary}
                          onChange={(e) =>
                            setResumeData({ ...resumeData, summary: e.target.value })
                          }
                          className="w-full px-3.5 py-2 bg-[#1c1d24] border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none resize-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* Section 2: Experience */}
                  {activeEditorSection === "experience" && (
                    <div className="space-y-4 text-xs">
                      {resumeData.experience.map((exp, expIdx) => (
                        <div
                          key={expIdx}
                          className="p-3.5 bg-[#18191f] rounded-2xl border border-zinc-800 space-y-2.5 relative"
                        >
                          <div className="flex items-center justify-between pb-1 border-b border-zinc-800">
                            <span className="font-extrabold text-white text-[11px]">
                              Position #{expIdx + 1}
                            </span>
                            {resumeData.experience.length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = resumeData.experience.filter(
                                    (_, i) => i !== expIdx
                                  );
                                  setResumeData({ ...resumeData, experience: updated });
                                }}
                                className="text-rose-400 hover:text-rose-300 text-[11px] font-bold cursor-pointer"
                              >
                                Remove
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="font-bold text-zinc-300 block mb-0.5">Role Title</label>
                              <input
                                type="text"
                                value={exp.role}
                                onChange={(e) => {
                                  const updated = [...resumeData.experience];
                                  updated[expIdx].role = e.target.value;
                                  setResumeData({ ...resumeData, experience: updated });
                                }}
                                className="w-full px-2.5 py-1.5 bg-[#1c1d24] border border-zinc-800 text-white rounded-lg text-xs focus:border-zinc-500 focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="font-bold text-zinc-300 block mb-0.5">Company</label>
                              <input
                                type="text"
                                value={exp.company}
                                onChange={(e) => {
                                  const updated = [...resumeData.experience];
                                  updated[expIdx].company = e.target.value;
                                  setResumeData({ ...resumeData, experience: updated });
                                }}
                                className="w-full px-2.5 py-1.5 bg-[#1c1d24] border border-zinc-800 text-white rounded-lg text-xs focus:border-zinc-500 focus:outline-none"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="font-bold text-zinc-300 block mb-0.5">Dates / Period</label>
                              <input
                                type="text"
                                value={exp.dates}
                                onChange={(e) => {
                                  const updated = [...resumeData.experience];
                                  updated[expIdx].dates = e.target.value;
                                  setResumeData({ ...resumeData, experience: updated });
                                }}
                                className="w-full px-2.5 py-1.5 bg-[#1c1d24] border border-zinc-800 text-white rounded-lg text-xs focus:border-zinc-500 focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="font-bold text-zinc-300 block mb-0.5">Location</label>
                              <input
                                type="text"
                                value={exp.location}
                                onChange={(e) => {
                                  const updated = [...resumeData.experience];
                                  updated[expIdx].location = e.target.value;
                                  setResumeData({ ...resumeData, experience: updated });
                                }}
                                className="w-full px-2.5 py-1.5 bg-[#1c1d24] border border-zinc-800 text-white rounded-lg text-xs focus:border-zinc-500 focus:outline-none"
                              />
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="font-bold text-zinc-300">Achievement Bullets</label>
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = [...resumeData.experience];
                                  updated[expIdx].bullets.push("Achieved measurable impact using modern tooling.");
                                  setResumeData({ ...resumeData, experience: updated });
                                }}
                                className="text-zinc-400 hover:text-white font-bold text-[10px] cursor-pointer"
                              >
                                + Add Bullet
                              </button>
                            </div>
                            <div className="space-y-1.5">
                              {exp.bullets.map((bullet, bIdx) => (
                                <div key={bIdx} className="flex items-center gap-1.5">
                                  <input
                                    type="text"
                                    value={bullet}
                                    onChange={(e) => {
                                      const updated = [...resumeData.experience];
                                      updated[expIdx].bullets[bIdx] = e.target.value;
                                      setResumeData({ ...resumeData, experience: updated });
                                    }}
                                    className="flex-1 px-2.5 py-1 bg-[#1c1d24] border border-zinc-800 text-white rounded-lg text-xs focus:border-zinc-500 focus:outline-none"
                                  />
                                  {exp.bullets.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const updated = [...resumeData.experience];
                                        updated[expIdx].bullets = updated[expIdx].bullets.filter(
                                          (_, i) => i !== bIdx
                                        );
                                        setResumeData({ ...resumeData, experience: updated });
                                      }}
                                      className="text-zinc-500 hover:text-rose-400 p-1"
                                    >
                                      ×
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() => {
                          setResumeData({
                            ...resumeData,
                            experience: [
                              ...resumeData.experience,
                              {
                                company: "Company Name",
                                role: "Software Engineer",
                                location: "City, Country",
                                dates: "2023 — Present",
                                bullets: ["Spearheaded new engineering workflows and improved metrics."],
                              },
                            ],
                          });
                        }}
                        className="w-full py-2 bg-[#181920] hover:bg-[#202128] text-zinc-300 border border-zinc-700 rounded-xl font-bold transition-colors cursor-pointer text-center"
                      >
                        + Add Another Work Experience
                      </button>
                    </div>
                  )}

                  {/* Section 3: Education */}
                  {activeEditorSection === "education" && (
                    <div className="space-y-4 text-xs">
                      {resumeData.education.map((edu, eduIdx) => (
                        <div
                          key={eduIdx}
                          className="p-3.5 bg-[#18191f] rounded-2xl border border-zinc-800 space-y-2.5"
                        >
                          <div className="flex items-center justify-between pb-1 border-b border-zinc-800">
                            <span className="font-extrabold text-white text-[11px]">
                              Education #{eduIdx + 1}
                            </span>
                            {resumeData.education.length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = resumeData.education.filter(
                                    (_, i) => i !== eduIdx
                                  );
                                  setResumeData({ ...resumeData, education: updated });
                                }}
                                className="text-rose-400 hover:text-rose-300 text-[11px] font-bold cursor-pointer"
                              >
                                Remove
                              </button>
                            )}
                          </div>

                          <div>
                            <label className="font-bold text-zinc-300 block mb-0.5">Institution / University</label>
                            <input
                              type="text"
                              value={edu.institution}
                              onChange={(e) => {
                                const updated = [...resumeData.education];
                                updated[eduIdx].institution = e.target.value;
                                setResumeData({ ...resumeData, education: updated });
                              }}
                              className="w-full px-2.5 py-1.5 bg-[#1c1d24] border border-zinc-800 text-white rounded-lg text-xs focus:border-zinc-500 focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="font-bold text-zinc-300 block mb-0.5">Degree &amp; Major</label>
                            <input
                              type="text"
                              value={edu.degree}
                              onChange={(e) => {
                                const updated = [...resumeData.education];
                                updated[eduIdx].degree = e.target.value;
                                setResumeData({ ...resumeData, education: updated });
                              }}
                              className="w-full px-2.5 py-1.5 bg-[#1c1d24] border border-zinc-800 text-white rounded-lg text-xs focus:border-zinc-500 focus:outline-none"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="font-bold text-zinc-300 block mb-0.5">Dates / Grad Year</label>
                              <input
                                type="text"
                                value={edu.dates}
                                onChange={(e) => {
                                  const updated = [...resumeData.education];
                                  updated[eduIdx].dates = e.target.value;
                                  setResumeData({ ...resumeData, education: updated });
                                }}
                                className="w-full px-2.5 py-1.5 bg-[#1c1d24] border border-zinc-800 text-white rounded-lg text-xs focus:border-zinc-500 focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="font-bold text-zinc-300 block mb-0.5">GPA (optional)</label>
                              <input
                                type="text"
                                value={edu.gpa || ""}
                                onChange={(e) => {
                                  const updated = [...resumeData.education];
                                  updated[eduIdx].gpa = e.target.value;
                                  setResumeData({ ...resumeData, education: updated });
                                }}
                                className="w-full px-2.5 py-1.5 bg-[#1c1d24] border border-zinc-800 text-white rounded-lg text-xs focus:border-zinc-500 focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() => {
                          setResumeData({
                            ...resumeData,
                            education: [
                              ...resumeData.education,
                              {
                                institution: "University Name",
                                degree: "Degree Title",
                                location: "City, Country",
                                dates: "2020 — 2024",
                              },
                            ],
                          });
                        }}
                        className="w-full py-2 bg-[#181920] hover:bg-[#202128] text-zinc-300 border border-zinc-700 rounded-xl font-bold transition-colors cursor-pointer text-center"
                      >
                        + Add Education
                      </button>
                    </div>
                  )}

                  {/* Section 4: Projects */}
                  {activeEditorSection === "projects" && (
                    <div className="space-y-4 text-xs">
                      {resumeData.projects.map((proj, projIdx) => (
                        <div
                          key={projIdx}
                          className="p-3.5 bg-[#18191f] rounded-2xl border border-zinc-800 space-y-2.5"
                        >
                          <div className="flex items-center justify-between pb-1 border-b border-zinc-800">
                            <span className="font-extrabold text-white text-[11px]">
                              Project #{projIdx + 1}
                            </span>
                            {resumeData.projects.length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = resumeData.projects.filter(
                                    (_, i) => i !== projIdx
                                  );
                                  setResumeData({ ...resumeData, projects: updated });
                                }}
                                className="text-rose-400 hover:text-rose-300 text-[11px] font-bold cursor-pointer"
                              >
                                Remove
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="font-bold text-zinc-300 block mb-0.5">Project Name</label>
                              <input
                                type="text"
                                value={proj.name}
                                onChange={(e) => {
                                  const updated = [...resumeData.projects];
                                  updated[projIdx].name = e.target.value;
                                  setResumeData({ ...resumeData, projects: updated });
                                }}
                                className="w-full px-2.5 py-1.5 bg-[#1c1d24] border border-zinc-800 text-white rounded-lg text-xs focus:border-zinc-500 focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="font-bold text-zinc-300 block mb-0.5">Tech Stack</label>
                              <input
                                type="text"
                                value={proj.tech}
                                onChange={(e) => {
                                  const updated = [...resumeData.projects];
                                  updated[projIdx].tech = e.target.value;
                                  setResumeData({ ...resumeData, projects: updated });
                                }}
                                className="w-full px-2.5 py-1.5 bg-[#1c1d24] border border-zinc-800 text-white rounded-lg text-xs focus:border-zinc-500 focus:outline-none"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="font-bold text-zinc-300 block mb-0.5">Link / Repository</label>
                            <input
                              type="text"
                              value={proj.link || ""}
                              onChange={(e) => {
                                const updated = [...resumeData.projects];
                                updated[projIdx].link = e.target.value;
                                setResumeData({ ...resumeData, projects: updated });
                              }}
                              className="w-full px-2.5 py-1.5 bg-[#1c1d24] border border-zinc-800 text-white rounded-lg text-xs focus:border-zinc-500 focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="font-bold text-zinc-300 block mb-1">Description / Bullet</label>
                            <input
                              type="text"
                              value={proj.bullets[0] || ""}
                              onChange={(e) => {
                                const updated = [...resumeData.projects];
                                updated[projIdx].bullets = [e.target.value];
                                setResumeData({ ...resumeData, projects: updated });
                              }}
                              className="w-full px-2.5 py-1.5 bg-[#1c1d24] border border-zinc-800 text-white rounded-lg text-xs focus:border-zinc-500 focus:outline-none"
                            />
                          </div>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() => {
                          setResumeData({
                            ...resumeData,
                            projects: [
                              ...resumeData.projects,
                              {
                                name: "New Project",
                                tech: "React, Next.js, Node.js",
                                link: "github.com/project",
                                bullets: ["Developed full-stack application with automated testing."],
                              },
                            ],
                          });
                        }}
                        className="w-full py-2 bg-[#181920] hover:bg-[#202128] text-zinc-300 border border-zinc-700 rounded-xl font-bold transition-colors cursor-pointer text-center"
                      >
                        + Add Project
                      </button>
                    </div>
                  )}

                  {/* Section 5: Skills */}
                  {activeEditorSection === "skills" && (
                    <div className="space-y-3 bg-[#18191f] p-4 rounded-2xl border border-zinc-800 text-xs">
                      <div>
                        <label className="font-bold text-zinc-200 block mb-1">
                          Languages
                        </label>
                        <input
                          type="text"
                          value={resumeData.skills?.languages || ""}
                          onChange={(e) =>
                            setResumeData({
                              ...resumeData,
                              skills: { ...resumeData.skills, languages: e.target.value },
                            })
                          }
                          placeholder="JavaScript, TypeScript, Python, C++, SQL..."
                          className="w-full px-3 py-2 bg-[#1c1d24] border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-zinc-200 block mb-1">
                          Frameworks &amp; Platforms
                        </label>
                        <input
                          type="text"
                          value={resumeData.skills?.frameworks || ""}
                          onChange={(e) =>
                            setResumeData({
                              ...resumeData,
                              skills: { ...resumeData.skills, frameworks: e.target.value },
                            })
                          }
                          placeholder="React, Next.js, FastAPI, Node.js, Tailwind CSS..."
                          className="w-full px-3 py-2 bg-[#1c1d24] border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-zinc-200 block mb-1">
                          Developer Tools &amp; Cloud
                        </label>
                        <input
                          type="text"
                          value={resumeData.skills?.tools || ""}
                          onChange={(e) =>
                            setResumeData({
                              ...resumeData,
                              skills: { ...resumeData.skills, tools: e.target.value },
                            })
                          }
                          placeholder="Git, Docker, PostgreSQL, Supabase, Linux, Vercel..."
                          className="w-full px-3 py-2 bg-[#1c1d24] border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Right Column: Interactive Real-Time Live Preview (lg: 7 cols) ── */}
                <div
                  className={`lg:col-span-7 ${
                    mobileBuilderTab === "editor" ? "hidden lg:block" : "block"
                  }`}
                >
                  <ResumeLivePreview
                    data={resumeData}
                    templateId={selectedTemplate}
                    onTemplateChange={(tmpl) => setSelectedTemplate(tmpl)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ──────────────────────────────────────────────────────────
              STATE C: UPLOAD & ATS CALIBRATION EVALUATION FLOW
          ────────────────────────────────────────────────────────── */}
          {viewMode === "upload" && (
            <div className="space-y-6">
              {/* Header for Upload/Scan Flow */}
              {uploadStage !== "done" ? (
                <>
                  <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <button
                        type="button"
                        onClick={() => setViewMode("empty")}
                        className="p-1.5 rounded-xl hover:bg-[#1c1d24] text-zinc-400 hover:text-white cursor-pointer transition-colors shrink-0"
                        aria-label="Back to dashboard"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <div className="min-w-0">
                        <h3 className="text-base sm:text-lg font-black text-white truncate">
                          Upload &amp; Analyze Resume
                        </h3>
                        <p className="text-xs text-zinc-400 font-medium truncate">
                          ATS parseability check, keyword match, and bullet impact.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Progress Steps Indicator */}
                  <div className="flex items-center justify-center gap-1.5 sm:gap-3 py-1">
                    <StageIndicator stage={1} currentStage={stageNum} label="Configure" />
                    <div className="w-2.5 sm:w-4 h-px bg-zinc-700" />
                    <StageIndicator stage={2} currentStage={stageNum} label="Upload" />
                    <div className="w-2.5 sm:w-4 h-px bg-zinc-700" />
                    <StageIndicator stage={3} currentStage={stageNum} label="Review" />
                    <div className="w-2.5 sm:w-4 h-px bg-zinc-700" />
                    <StageIndicator stage={4} currentStage={stageNum} label="Evaluate" />
                  </div>
                </>
              ) : (
                /* Results Top Navigation Bar (Mobile-fitted & Sleek) */
                <div className="flex flex-wrap items-center justify-between pb-3 sm:pb-4 border-b border-zinc-800 gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <button
                      type="button"
                      onClick={() => setViewMode("empty")}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#18191f] hover:bg-[#23242B] border border-zinc-800 text-xs font-bold text-zinc-300 hover:text-white transition-colors cursor-pointer shrink-0"
                    >
                      <ChevronLeft className="w-4 h-4 text-zinc-400" />
                      <span>Dashboard</span>
                    </button>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-white block truncate max-w-[200px] sm:max-w-xs">
                        {extraction?.filename || "Resume Analysis"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {(reviewState.savedAnalysisId || selectedResumeId) && (
                      <button
                        type="button"
                        onClick={() => handleDownloadHistorical(reviewState.savedAnalysisId || selectedResumeId!)}
                        className="px-3 py-1.5 bg-[#1c1d24] border border-zinc-800 text-zinc-200 hover:text-white hover:bg-[#23242B] rounded-xl font-bold transition-colors flex items-center gap-1.5 text-xs cursor-pointer shadow-xs"
                        title="Download PDF Report"
                      >
                        <Download className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Download</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        resetAll();
                        setViewMode("upload");
                      }}
                      className="px-3 py-1.5 bg-[#1c1d24] border border-zinc-800 text-zinc-200 hover:text-white hover:bg-[#23242B] rounded-xl font-bold transition-colors flex items-center gap-1.5 text-xs cursor-pointer shadow-xs"
                      title="Upload and scan another resume"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
                      <span>New Scan</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Configuration / Upload Form */}
              {uploadStage !== "reviewing" && uploadStage !== "done" && (
                <div className="space-y-4">
                  {/* Upload Resume Dropzone */}
                  {(uploadStage === "idle" || uploadStage === "upload_error") && (
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-zinc-400" />
                        Upload Resume Document
                      </label>
                      <div
                        role="button"
                        tabIndex={0}
                        aria-label="Upload resume document (Supports PDF, DOCX, TXT, MD up to 10 MB)"
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            fileInputRef.current?.click();
                          }
                        }}
                        className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-zinc-600 ${
                          isDragging
                            ? "border-zinc-500 bg-zinc-800/40"
                            : "border-zinc-800 hover:border-zinc-600 bg-[#18191f] hover:bg-[#1c1d24]"
                        }`}
                      >
                        <CloudUpload className="w-9 h-9 sm:w-10 sm:h-10 mx-auto mb-2 text-zinc-400" />
                        <h4 className="text-xs sm:text-sm font-bold text-white">
                          {isDragging
                            ? "Drop your resume file here"
                            : "Drag & Drop or Tap to Upload"}
                        </h4>
                        <p className="text-[11px] sm:text-xs text-zinc-400 mt-1">
                          Supports PDF, DOCX, TXT, MD · Max {MAX_FILE_MB} MB
                        </p>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".pdf,.docx,.doc,.txt,.md"
                          aria-label="Resume document upload input"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </div>

                      {uploadStage === "upload_error" && errorMessage && (
                        <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                          <span>{errorMessage}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Uploading Progress */}
                  {(uploadStage === "uploading" || uploadStage === "extracting") && (
                    <div className="p-5 rounded-2xl bg-[#18191f] border border-zinc-800 space-y-3">
                      <div className="flex items-center gap-3">
                        <Loader2 className="w-5 h-5 text-zinc-400 animate-spin" />
                        <div>
                          <p className="text-xs font-bold text-white">
                            {uploadStage === "uploading"
                              ? `Uploading document (${uploadProgress}%)...`
                              : "Extracting resume text..."}
                          </p>
                        </div>
                      </div>
                      <div className="w-full h-2 bg-[#23242B] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-zinc-400 transition-all duration-300 rounded-full"
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
                        {/* Diagnostic banner */}
                        {extraction.is_scanned || (typeof extraction.extraction_quality === "number" && extraction.extraction_quality < 70) ? (
                          <div className="p-3 rounded-xl bg-amber-950/50 border border-amber-500/30 text-amber-200 flex items-start gap-2.5 text-xs">
                            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold block text-amber-200">Scanned / Low-Fidelity Text Detected</span>
                              <p className="text-[11px] text-amber-300/80">
                                This file looks like a scanned document or rasterized PDF. For best results, verify the extracted text below or upload a clean digital PDF/Word document.
                              </p>
                            </div>
                          </div>
                        ) : null}

                        <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">
                              Extracted Resume Content ({editedText.length} chars)
                            </span>
                            {extraction.detected_columns && extraction.detected_columns > 1 && (
                              <span className="text-[10px] bg-[#23242B] text-zinc-300 px-2 py-0.5 rounded-md font-medium border border-zinc-800">
                                {extraction.detected_columns}-column layout detected
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={resetAll}
                            className="text-xs text-zinc-400 hover:text-white font-semibold cursor-pointer"
                          >
                            Replace File
                          </button>
                        </div>
                        <textarea
                          rows={8}
                          value={editedText}
                          onChange={(e) => setEditedText(e.target.value)}
                          className="w-full px-4 py-3 bg-[#18191f] border border-zinc-800 rounded-xl text-xs font-mono text-zinc-200 focus:border-zinc-500 focus:outline-none"
                        />
                        {uploadStage === "review_error" && errorMessage && (
                          <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                            <span>{errorMessage}</span>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={handleRunEvaluation}
                          disabled={!editedText.trim() || editedText.length < 50}
                          className="w-full bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl border border-zinc-700 flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer active:scale-[0.99] transition-all"
                        >
                          <span>Run Comprehensive Resume Audit</span>
                        </button>
                      </div>
                    )}
                </div>
              )}

              {/* Reviewing Loading State */}
              {uploadStage === "reviewing" && (
                <div className="text-center py-12 space-y-4">
                  <RefreshCw className="w-8 h-8 text-zinc-400 animate-spin mx-auto" />
                  <h3 className="text-base font-bold text-white">
                    Evaluating Resume Diagnostics...
                  </h3>
                  <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                    Benchmarking keywords, structure, and recruiter signals.
                  </p>
                </div>
              )}

              {/* Results View */}
              {uploadStage === "done" && reviewText && (
                <div className="space-y-4">
                  <ResumeAnalysisResults
                    reviewText={reviewText}
                    overallScore={overallScore}
                    scoringStatus={scoringStatus}
                    targetRole={targetRole}
                    companyType={companyType}
                    extraction={extraction}
                    atsAnalysis={atsAnalysis}
                    keywordAnalysis={keywordAnalysis}
                    skillEvidence={skillEvidence}
                    projectsEvaluation={projectsEvaluation}
                    educationEvaluation={educationEvaluation}
                    contentQuality={contentQuality}
                    recruiterEvaluation={recruiterEvaluation}
                    jobMatching={jobMatching}
                    aiEvaluation={aiEvaluation}
                    scoreBreakdown={scoreBreakdown}
                    careerStage={careerStage}
                    subScores={subScores}
                    analysisId={reviewState.savedAnalysisId || selectedResumeId}
                    onReset={resetAll}
                  />
                </div>
              )}
            </div>
          )}

          {/* ──────────────────────────────────────────────────────────
              STATE D: CLOUD RESUME HISTORY
          ────────────────────────────────────────────────────────── */}
          {viewMode === "history" && (
            <div className="space-y-6">
              <ResumeHistory
                onSelectAnalysis={handleSelectHistoricalAnalysis}
                onStartNewUpload={() => {
                  resetAll();
                  setViewMode("upload");
                }}
                refreshTrigger={historyRefreshTrigger}
                activeAnalysisId={reviewState.savedAnalysisId}
              />
            </div>
          )}

          {/* ──────────────────────────────────────────────────────────
              STATE E: RESUME TRACKS & SERIES (Phase 4.1 & 4.2)
          ────────────────────────────────────────────────────────── */}
          {viewMode === "series" && (
            <div className="space-y-6">
              <ResumeSeriesDashboard
                onSelectAnalysis={handleSelectHistoricalAnalysis}
                onCompareVersions={(olderId, newerId) => {
                  setCompareOlderId(olderId);
                  setCompareNewerId(newerId);
                  setIsCompareModalOpen(true);
                }}
                onViewGrowth={(seriesId) => {
                  setGrowthSeriesId(seriesId);
                  setViewMode("growth");
                }}
                onStartNewStandalone={() => {
                  resetAll();
                  setViewMode("upload");
                }}
              />
            </div>
          )}

          {/* ──────────────────────────────────────────────────────────
              STATE F: RESUME GROWTH TRACKING DASHBOARD (Phase 4.3)
          ────────────────────────────────────────────────────────── */}
          {viewMode === "growth" && growthSeriesId && (
            <div className="space-y-6">
              <ResumeGrowthDashboard
                seriesId={growthSeriesId}
                onBack={() => setViewMode("series")}
                onSelectAnalysis={handleSelectHistoricalAnalysis}
              />
            </div>
          )}
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────
          Phase 4.2: Intelligent Resume Comparison Modal
      ────────────────────────────────────────────────────────── */}
      {isCompareModalOpen && compareOlderId && compareNewerId && (
        <ResumeComparisonModal
          olderId={compareOlderId}
          newerId={compareNewerId}
          onClose={() => {
            setIsCompareModalOpen(false);
            setCompareOlderId(null);
            setCompareNewerId(null);
          }}
          onInspectAnalysis={handleSelectHistoricalAnalysis}
        />
      )}
    </div>
  );
}
