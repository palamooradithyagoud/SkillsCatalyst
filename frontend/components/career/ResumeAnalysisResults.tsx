"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sparkles,
  Layers,
  FileSearch,
  ChevronRight,
  Code,
  Database,
  Cpu,
  Terminal,
  Search,
  Briefcase,
  GraduationCap,
  Check,
  Copy,
  Mail,
  Phone,
  Globe,
  ExternalLink,
  ShieldCheck,
  Zap,
  RotateCcw,
  BarChart2,
  Info,
  Download,
  Loader2,
} from "lucide-react";
import { downloadAnalysisPdfReport } from "@/lib/api/career";
import {
  ATSAnalysisReport,
  KeywordAnalysisReport,
  AIEvaluationReport,
  UnifiedScoreBreakdown,
  ExtractionResult,
  ATSFinding,
} from "@/types/career";
import ResumeMarkdownViewer from "@/components/career/ResumeMarkdownViewer";

interface ResumeAnalysisResultsProps {
  reviewText: string;
  overallScore: number | null;
  scoringStatus?: "scored" | "unscored" | null;
  targetRole: string;
  companyType?: string;
  extraction?: ExtractionResult | null;
  atsAnalysis?: ATSAnalysisReport | null;
  keywordAnalysis?: KeywordAnalysisReport | null;
  aiEvaluation?: AIEvaluationReport | null;
  scoreBreakdown?: UnifiedScoreBreakdown | null;
  careerStage?: string | null;
  subScores?: {
    ats: number | null;
    skills: number | null;
    content: number | null;
    structure: number | null;
  };
  analysisId?: string | null;
  onReset?: () => void;
}

type TabType = "overview" | "ats" | "keywords" | "rewrites" | "roadmap" | "markdown";

export default function ResumeAnalysisResults({
  reviewText,
  overallScore,
  targetRole,
  companyType,
  extraction,
  atsAnalysis,
  keywordAnalysis,
  aiEvaluation,
  scoreBreakdown,
  careerStage,
  subScores,
  analysisId,
  onReset,
}: ResumeAnalysisResultsProps) {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [severityFilter, setSeverityFilter] = useState<"all" | "critical" | "warning" | "good">("all");
  const [copiedBulletIdx, setCopiedBulletIdx] = useState<number | null>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  const handleDownloadPdf = async () => {
    if (!analysisId) return;
    setIsDownloadingPdf(true);
    try {
      await downloadAnalysisPdfReport(analysisId, `SkillsCatalyst_Resume_Audit_${extraction?.filename || "Report"}.pdf`);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to download PDF report");
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  // Resolved scores with fallbacks
  const displayOverallScore =
    typeof overallScore === "number" && !isNaN(overallScore)
      ? Math.round(overallScore)
      : typeof scoreBreakdown?.overall_score === "number"
      ? Math.round(scoreBreakdown.overall_score)
      : null;

  const atsScore =
    typeof subScores?.ats === "number"
      ? Math.round(subScores.ats)
      : typeof atsAnalysis?.ats_compatibility_score === "number"
      ? Math.round(atsAnalysis.ats_compatibility_score)
      : null;

  const contentScore =
    typeof subScores?.content === "number"
      ? Math.round(subScores.content)
      : typeof aiEvaluation?.content_quality_score === "number"
      ? Math.round(aiEvaluation.content_quality_score)
      : null;

  const skillsScore =
    typeof subScores?.skills === "number"
      ? Math.round(subScores.skills)
      : typeof keywordAnalysis?.keyword_match_percentage === "number"
      ? Math.round(keywordAnalysis.keyword_match_percentage)
      : null;

  const structureScore =
    typeof subScores?.structure === "number"
      ? Math.round(subScores.structure)
      : typeof atsAnalysis?.structure_score === "number"
      ? Math.round(atsAnalysis.structure_score)
      : null;

  const stage = careerStage || atsAnalysis?.career_stage_detected || "Professional";

  // Score color helper
  const getScoreColor = (score: number | null) => {
    if (score === null) return "text-zinc-300 bg-[#1c1d24] border-white/10";
    if (score >= 80) return "text-emerald-300 bg-emerald-950/60 border-emerald-500/30";
    if (score >= 60) return "text-amber-300 bg-amber-950/60 border-amber-500/30";
    return "text-rose-300 bg-rose-950/60 border-rose-500/30";
  };

  const getScoreProgressBar = (score: number | null) => {
    if (score === null) return "bg-zinc-600";
    if (score >= 80) return "bg-emerald-500";
    if (score >= 60) return "bg-amber-500";
    return "bg-rose-500";
  };

  // Findings filter
  const findings: ATSFinding[] = atsAnalysis?.findings || [];
  const filteredFindings = findings.filter((f) => {
    if (severityFilter === "all") return true;
    return f.severity === severityFilter;
  });

  const criticalCount = atsAnalysis?.critical_issues_count ?? findings.filter((f) => f.severity === "critical").length;
  const warningCount = atsAnalysis?.warnings_count ?? findings.filter((f) => f.severity === "warning").length;
  const passCount = atsAnalysis?.passes_count ?? findings.filter((f) => f.severity === "good").length;

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedBulletIdx(idx);
    setTimeout(() => setCopiedBulletIdx(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* ──────────────────────────────────────────────────────────
          1. HEADER SUMMARY BAR (Dark Charcoal & Crisp White Text)
      ────────────────────────────────────────────────────────── */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#181920] via-[#141519] to-[#181920] border border-white/10 shadow-lg flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1.5 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-white text-base sm:text-lg">
              {targetRole}
            </span>
            <span className="font-medium text-xs text-indigo-300 bg-indigo-950/60 px-2.5 py-0.5 rounded-md border border-indigo-500/30 flex items-center gap-1 shrink-0">
              <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
              Calibrated as {stage.charAt(0).toUpperCase() + stage.slice(1)}
            </span>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Comprehensive ATS evaluation across deterministic rules, semantic keyword match, and quantifiable content impact.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 shrink-0 pt-1 lg:pt-0 w-full sm:w-auto">
          <div
            className={`px-4 py-2.5 rounded-xl border flex items-center justify-between sm:justify-start gap-3 w-full sm:w-auto ${getScoreColor(
              displayOverallScore
            )}`}
          >
            <div className="text-left sm:text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">
                Overall ATS Score
              </span>
              <span className="text-xl sm:text-2xl font-black leading-none">
                {displayOverallScore !== null ? `${displayOverallScore}/100` : "Qualitative"}
              </span>
            </div>
            <ShieldCheck className="w-6 h-6 shrink-0 opacity-80" />
          </div>

          <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto">
            {analysisId && (
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isDownloadingPdf}
                className="justify-center text-xs text-zinc-200 hover:text-white bg-[#1c1d24] hover:bg-[#23242B] px-3.5 py-2.5 rounded-xl border border-white/10 font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors disabled:opacity-60"
                title="Download 5-page PDF Diagnostic Report"
              >
                {isDownloadingPdf ? (
                  <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                ) : (
                  <Download className="w-4 h-4 text-purple-400" />
                )}
                <span>PDF Report</span>
              </button>
            )}

            {onReset && (
              <button
                type="button"
                onClick={onReset}
                className="justify-center text-xs text-zinc-200 hover:text-white bg-[#1c1d24] hover:bg-[#23242B] px-3.5 py-2.5 rounded-xl border border-white/10 font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                title="Upload another resume"
              >
                <RotateCcw className="w-4 h-4 text-purple-400" />
                <span>New Scan</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────
          2. EXTRACTION QUALITY / SCAN DETECTION BANNER
      ────────────────────────────────────────────────────────── */}
      {extraction && (
        <div className="space-y-2">
          {extraction.is_scanned || (typeof extraction.extraction_quality === "number" && extraction.extraction_quality < 70) ? (
            <div className="p-3.5 sm:p-4 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-200 flex items-start gap-3 text-xs">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-amber-300 block">
                  Scanned Image or Low Text Quality Detected (Score: {extraction.extraction_quality ?? "N/A"}/100)
                </span>
                <p className="text-amber-300/80 leading-relaxed">
                  ATS parsers frequently fail on image-based or rasterized resumes. For guaranteed parsing, export your resume directly as a clean digital PDF or Word document (.docx) instead of scanning paper.
                </p>
              </div>
            </div>
          ) : null}

          {/* Diagnostic Metadata Pill */}
          <div className="flex items-center gap-x-2 sm:gap-x-3 gap-y-1.5 text-[11px] text-zinc-300 bg-[#141519] border border-white/10 p-2.5 sm:px-3 sm:py-2 rounded-xl flex-wrap shadow-xs">
            <span className="font-bold text-white flex items-center gap-1.5 mr-1">
              <FileSearch className="w-3.5 h-3.5 text-purple-400" />
              Layout Diagnostics
            </span>
            <span className="bg-[#1c1d24] px-2 py-0.5 rounded-md border border-white/5">
              Format: <strong className="text-white">{extraction.file_type?.toUpperCase() || "PDF"}</strong>
            </span>
            <span className="bg-[#1c1d24] px-2 py-0.5 rounded-md border border-white/5">
              Columns: <strong className="text-white">{extraction.detected_columns || 1}</strong>
            </span>
            <span className="bg-[#1c1d24] px-2 py-0.5 rounded-md border border-white/5">
              Pages: <strong className="text-white">{extraction.page_count || 1}</strong>
            </span>
            <span className="bg-[#1c1d24] px-2 py-0.5 rounded-md border border-white/5">
              Characters: <strong className="text-white">{extraction.charCount.toLocaleString()}</strong>
            </span>
            {typeof extraction.extraction_quality === "number" && (
              <span className="bg-[#1c1d24] px-2 py-0.5 rounded-md border border-white/5">
                Fidelity:{" "}
                <strong className={extraction.extraction_quality >= 80 ? "text-emerald-400" : "text-amber-400"}>
                  {Math.round(extraction.extraction_quality)}%
                </strong>
              </span>
            )}
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────
          3. UNIFIED 4-COMPONENT SCORING CARDS
      ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* ATS Compatibility */}
        <div className="bg-[#141519] border border-white/10 rounded-2xl p-4 shadow-xs space-y-2 hover:border-white/20 transition-all">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              ATS Compatibility
            </span>
            <span className="text-[10px] font-bold text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded-full border border-purple-500/30">
              25% Wt
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-white">
              {atsScore !== null ? `${atsScore}` : "—"}
              <span className="text-xs text-zinc-400 font-semibold">/100</span>
            </span>
            <span className="text-[11px] font-semibold text-zinc-300">
              {atsScore !== null && atsScore >= 80 ? "High Compatibility" : atsScore !== null && atsScore >= 60 ? "Moderate" : "Needs Fixes"}
            </span>
          </div>
          <div className="w-full bg-[#23242B] rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${getScoreProgressBar(atsScore)}`}
              style={{ width: `${Math.min(100, Math.max(0, atsScore ?? 0))}%` }}
            />
          </div>
          <p className="text-[11px] text-zinc-400 leading-tight">
            Deterministic check of contact info, standard headings, and parseable layout.
          </p>
        </div>

        {/* Content Quality / Impact */}
        <div className="bg-[#141519] border border-white/10 rounded-2xl p-4 shadow-xs space-y-2 hover:border-white/20 transition-all">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-400" />
              Content Impact
            </span>
            <span className="text-[10px] font-bold text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded-full border border-purple-500/30">
              30% Wt
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-white">
              {contentScore !== null ? `${contentScore}` : "—"}
              <span className="text-xs text-zinc-400 font-semibold">/100</span>
            </span>
            <span className="text-[11px] font-semibold text-zinc-300">
              {contentScore !== null && contentScore >= 80 ? "Strong Impact" : contentScore !== null && contentScore >= 60 ? "Average" : "Weak Metrics"}
            </span>
          </div>
          <div className="w-full bg-[#23242B] rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${getScoreProgressBar(contentScore)}`}
              style={{ width: `${Math.min(100, Math.max(0, contentScore ?? 0))}%` }}
            />
          </div>
          <p className="text-[11px] text-zinc-400 leading-tight">
            Action verbs, quantifiable results, and STAR framework bullet clarity.
          </p>
        </div>

        {/* Skills & JD Match */}
        <div className="bg-[#141519] border border-white/10 rounded-2xl p-4 shadow-xs space-y-2 hover:border-white/20 transition-all">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-purple-400" />
              Skills &amp; Keywords
            </span>
            <span className="text-[10px] font-bold text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded-full border border-purple-500/30">
              25% Wt
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-white">
              {skillsScore !== null ? `${skillsScore}` : "—"}
              <span className="text-xs text-zinc-400 font-semibold">/100</span>
            </span>
            <span className="text-[11px] font-semibold text-zinc-300">
              {keywordAnalysis && typeof keywordAnalysis.matched_count === "number" && typeof keywordAnalysis.total_analyzed_keywords === "number"
                ? `${keywordAnalysis.matched_count}/${keywordAnalysis.total_analyzed_keywords} Found`
                : "Keyword Match"}
            </span>
          </div>
          <div className="w-full bg-[#23242B] rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${getScoreProgressBar(skillsScore)}`}
              style={{ width: `${Math.min(100, Math.max(0, skillsScore ?? 0))}%` }}
            />
          </div>
          <p className="text-[11px] text-zinc-400 leading-tight">
            Role taxonomy &amp; job description keyword alignment with alias matching.
          </p>
        </div>

        {/* Structure & Readability */}
        <div className="bg-[#141519] border border-white/10 rounded-2xl p-4 shadow-xs space-y-2 hover:border-white/20 transition-all">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-purple-400" />
              Structure &amp; Flow
            </span>
            <span className="text-[10px] font-bold text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded-full border border-purple-500/30">
              20% Wt
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-white">
              {structureScore !== null ? `${structureScore}` : "—"}
              <span className="text-xs text-zinc-400 font-semibold">/100</span>
            </span>
            <span className="text-[11px] font-semibold text-zinc-300">
              {structureScore !== null && structureScore >= 80 ? "Clean Layout" : "Needs Revision"}
            </span>
          </div>
          <div className="w-full bg-[#23242B] rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${getScoreProgressBar(structureScore)}`}
              style={{ width: `${Math.min(100, Math.max(0, structureScore ?? 0))}%` }}
            />
          </div>
          <p className="text-[11px] text-zinc-400 leading-tight">
            Reading order, symbol hygiene, and section hierarchy across ATS scanners.
          </p>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────
          4. TAB NAVIGATION
      ────────────────────────────────────────────────────────── */}
      <div className="border-b border-white/10">
        <div className="flex gap-2 sm:gap-4 overflow-x-auto no-scrollbar py-1">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`px-3 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === "overview"
                ? "bg-purple-600 text-white shadow-xs"
                : "text-zinc-400 hover:text-white hover:bg-[#1c1d24]"
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            Verdict &amp; Summary
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("ats")}
            className={`px-3 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === "ats"
                ? "bg-purple-600 text-white shadow-xs"
                : "text-zinc-400 hover:text-white hover:bg-[#1c1d24]"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            ATS Rules &amp; Health
            {criticalCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500 text-white">
                {criticalCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("keywords")}
            className={`px-3 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === "keywords"
                ? "bg-purple-600 text-white shadow-xs"
                : "text-zinc-400 hover:text-white hover:bg-[#1c1d24]"
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            Keyword Match
            {keywordAnalysis && typeof keywordAnalysis.matched_count === "number" && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-purple-950/60 text-purple-300 border border-purple-500/30">
                {keywordAnalysis.matched_count}/{keywordAnalysis.total_analyzed_keywords}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("rewrites")}
            className={`px-3 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === "rewrites"
                ? "bg-purple-600 text-white shadow-xs"
                : "text-zinc-400 hover:text-white hover:bg-[#1c1d24]"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Bullet Rewrites
            {aiEvaluation?.rewritten_bullets && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-purple-950/60 text-purple-300 border border-purple-500/30">
                {aiEvaluation.rewritten_bullets.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("roadmap")}
            className={`px-3 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === "roadmap"
                ? "bg-purple-600 text-white shadow-xs"
                : "text-zinc-400 hover:text-white hover:bg-[#1c1d24]"
            }`}
          >
            <ChevronRight className="w-3.5 h-3.5" />
            Action Plan
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("markdown")}
            className={`px-3 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === "markdown"
                ? "bg-purple-600 text-white shadow-xs"
                : "text-zinc-400 hover:text-white hover:bg-[#1c1d24]"
            }`}
          >
            <FileSearch className="w-3.5 h-3.5" />
            Full Markdown Report
          </button>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────
          5. TAB 1: OVERVIEW & VERDICT
      ────────────────────────────────────────────────────────── */}
      {activeTab === "overview" && (
        <div className="space-y-4">
          <div className="bg-[#141519] border border-white/10 rounded-2xl p-5 space-y-4 shadow-sm">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              Executive Verdict
            </h4>
            <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/30 text-xs text-zinc-200 leading-relaxed">
              {aiEvaluation?.summary_verdict || (
                <p>
                  Your resume has been comprehensively evaluated against <strong className="text-white">{targetRole}</strong> hiring rubrics.
                  Follow the prioritized bullet rewrites and ATS adjustments below to significantly boost interview shortlisting rates.
                </p>
              )}
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-[#18191f] border border-white/10 space-y-1">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                  Critical ATS Errors
                </span>
                <span className={`text-lg font-black ${criticalCount > 0 ? "text-rose-400" : "text-emerald-400"}`}>
                  {criticalCount} Critical
                </span>
                <p className="text-[11px] text-zinc-400">
                  {criticalCount === 0 ? "Zero blocking parsing issues." : "Must resolve before applying."}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#18191f] border border-white/10 space-y-1">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                  Role Keywords Matched
                </span>
                <span className="text-lg font-black text-purple-400">
                  {keywordAnalysis ? `${Math.round(keywordAnalysis.keyword_match_percentage)}%` : "N/A"}
                </span>
                <p className="text-[11px] text-zinc-400">
                  {keywordAnalysis ? `${keywordAnalysis.matched_count} of ${keywordAnalysis.total_analyzed_keywords} core keywords` : "Role keywords"}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#18191f] border border-white/10 space-y-1">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                  Candidate Stage
                </span>
                <span className="text-lg font-black text-white">
                  {stage.charAt(0).toUpperCase() + stage.slice(1)}
                </span>
                <p className="text-[11px] text-zinc-400">
                  {stage.toLowerCase() === "fresher" ? "Academic/project focused rubric" : "Work impact focused rubric"}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions / Jump to Tabs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div
              onClick={() => setActiveTab("rewrites")}
              className="p-4 rounded-xl border border-white/10 bg-[#18191f] hover:border-purple-500/40 hover:bg-[#1c1d24] cursor-pointer transition-all space-y-1 group"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  View Grounded Bullet Rewrites
                </span>
                <ChevronRight className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-[11px] text-zinc-400">
                Turn passive job descriptions into metric-driven achievements using the STAR method.
              </p>
            </div>

            <div
              onClick={() => setActiveTab("keywords")}
              className="p-4 rounded-xl border border-white/10 bg-[#18191f] hover:border-purple-500/40 hover:bg-[#1c1d24] cursor-pointer transition-all space-y-1 group"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-white flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-purple-400" />
                  Explore Missing Keywords
                </span>
                <ChevronRight className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-[11px] text-zinc-400">
                Identify high-demand technical skills to bridge the gap between your resume and job requirements.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────
          6. TAB 2: ATS HEALTH & DETERMINISTIC FINDINGS
      ────────────────────────────────────────────────────────── */}
      {activeTab === "ats" && (
        <div className="space-y-4">
          {/* Contact Information Audit */}
          {atsAnalysis?.contact_info && (
            <div className="bg-[#141519] border border-white/10 rounded-2xl p-4 sm:p-5 space-y-3 shadow-sm">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <Mail className="w-4 h-4 text-purple-400" />
                Contact Information Completeness
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 text-xs">
                {/* Email */}
                <div
                  className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                    atsAnalysis.contact_info.has_email
                      ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-300"
                      : "bg-rose-950/40 border-rose-500/30 text-rose-300"
                  }`}
                >
                  {atsAnalysis.contact_info.has_email ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  )}
                  <div className="truncate">
                    <span className="font-bold block text-[11px] text-white">Email</span>
                    <span className="text-[10px] text-zinc-400 truncate block">
                      {atsAnalysis.contact_info.email || "Missing"}
                    </span>
                  </div>
                </div>

                {/* Phone */}
                <div
                  className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                    atsAnalysis.contact_info.has_phone
                      ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-300"
                      : "bg-amber-950/40 border-amber-500/30 text-amber-300"
                  }`}
                >
                  {atsAnalysis.contact_info.has_phone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  )}
                  <div className="truncate">
                    <span className="font-bold block text-[11px] text-white">Phone</span>
                    <span className="text-[10px] text-zinc-400 truncate block">
                      {atsAnalysis.contact_info.phone || "Missing"}
                    </span>
                  </div>
                </div>

                {/* LinkedIn */}
                <div
                  className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                    atsAnalysis.contact_info.has_linkedin
                      ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-300"
                      : "bg-amber-950/40 border-amber-500/30 text-amber-300"
                  }`}
                >
                  {atsAnalysis.contact_info.has_linkedin ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  )}
                  <div className="truncate">
                    <span className="font-bold block text-[11px] text-white">LinkedIn</span>
                    <span className="text-[10px] text-zinc-400 truncate block">
                      {atsAnalysis.contact_info.has_linkedin ? "Linked" : "Recommended"}
                    </span>
                  </div>
                </div>

                {/* GitHub */}
                <div
                  className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                    atsAnalysis.contact_info.has_github
                      ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-300"
                      : "bg-[#18191f] border-white/10 text-zinc-300"
                  }`}
                >
                  {atsAnalysis.contact_info.has_github ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <Info className="w-4 h-4 text-zinc-500 shrink-0" />
                  )}
                  <div className="truncate">
                    <span className="font-bold block text-[11px] text-white">GitHub</span>
                    <span className="text-[10px] text-zinc-400 truncate block">
                      {atsAnalysis.contact_info.has_github ? "Linked" : "Optional"}
                    </span>
                  </div>
                </div>

                {/* Portfolio / Website */}
                <div
                  className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                    atsAnalysis.contact_info.has_portfolio
                      ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-300"
                      : "bg-[#18191f] border-white/10 text-zinc-300"
                  }`}
                >
                  {atsAnalysis.contact_info.has_portfolio ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <Info className="w-4 h-4 text-zinc-500 shrink-0" />
                  )}
                  <div className="truncate">
                    <span className="font-bold block text-[11px] text-white">Portfolio</span>
                    <span className="text-[10px] text-zinc-400 truncate block">
                      {atsAnalysis.contact_info.has_portfolio ? "Linked" : "Optional"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Severity Filter Controls */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              ATS Findings &amp; Rule Diagnostics
            </h4>

            <div className="flex items-center gap-1.5 bg-[#1c1d24] border border-white/10 p-1 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => setSeverityFilter("all")}
                className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                  severityFilter === "all" ? "bg-purple-600 text-white shadow-xs" : "text-zinc-400 hover:text-white"
                }`}
              >
                All ({findings.length})
              </button>
              <button
                type="button"
                onClick={() => setSeverityFilter("critical")}
                className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                  severityFilter === "critical"
                    ? "bg-rose-600 text-white shadow-xs"
                    : "text-rose-400 hover:bg-rose-950/40"
                }`}
              >
                Critical ({criticalCount})
              </button>
              <button
                type="button"
                onClick={() => setSeverityFilter("warning")}
                className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                  severityFilter === "warning"
                    ? "bg-amber-600 text-white shadow-xs"
                    : "text-amber-400 hover:bg-amber-950/40"
                }`}
              >
                Warnings ({warningCount})
              </button>
              <button
                type="button"
                onClick={() => setSeverityFilter("good")}
                className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                  severityFilter === "good"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-emerald-400 hover:bg-emerald-950/40"
                }`}
              >
                Passed ({passCount})
              </button>
            </div>
          </div>

          {/* Findings Cards List */}
          <div className="space-y-3">
            {filteredFindings.length === 0 ? (
              <div className="p-8 text-center bg-[#141519] border border-white/10 rounded-2xl text-xs text-zinc-400">
                No findings in this category.
              </div>
            ) : (
              filteredFindings.map((finding, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border bg-[#18191f] space-y-2 transition-all hover:border-white/20 ${
                    finding.severity === "critical"
                      ? "border-rose-500/30 border-l-4 border-l-rose-500"
                      : finding.severity === "warning"
                      ? "border-amber-500/30 border-l-4 border-l-amber-500"
                      : "border-emerald-500/30 border-l-4 border-l-emerald-500"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      {finding.severity === "critical" ? (
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      ) : finding.severity === "warning" ? (
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      )}
                      <span className="font-bold text-xs text-white">
                        {finding.issue}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 border ${
                        finding.severity === "critical"
                          ? "bg-rose-950/60 text-rose-300 border-rose-500/30"
                          : finding.severity === "warning"
                          ? "bg-amber-950/60 text-amber-300 border-amber-500/30"
                          : "bg-emerald-950/60 text-emerald-300 border-emerald-500/30"
                      }`}
                    >
                      {finding.severity}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-300 leading-relaxed">
                    <strong className="text-white">Impact:</strong> {finding.impact}
                  </p>

                  <div className="p-2.5 rounded-lg bg-[#141519] border border-white/10 text-[11px] text-zinc-300 flex items-start gap-2">
                    <span className="font-bold text-purple-400 shrink-0">Fix:</span>
                    <span>{finding.recommended_fix}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────
          7. TAB 3: KEYWORD & SKILL MATCH (Dark Charcoal & Crisp White)
      ────────────────────────────────────────────────────────── */}
      {activeTab === "keywords" && (
        <div className="space-y-4">
          <div className="bg-[#141519] border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-purple-400" />
                  Target Role Keyword Alignment
                </h4>
                <p className="text-xs text-zinc-400">
                  Target Role: <strong className="text-white">{targetRole}</strong> · Analyzed against canonical tech taxonomy with alias normalization.
                </p>
              </div>

              {keywordAnalysis && (
                <div className="text-right">
                  <span className="text-lg font-black text-purple-400">
                    {Math.round(keywordAnalysis.keyword_match_percentage)}% Match
                  </span>
                  <span className="text-[11px] text-zinc-400 block">
                    {keywordAnalysis.matched_count} of {keywordAnalysis.total_analyzed_keywords} keywords found
                  </span>
                </div>
              )}
            </div>

            {/* Matched Keywords Grid */}
            <div className="space-y-2 pt-2">
              <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Detected Skills &amp; Keywords ({keywordAnalysis?.matched.length || 0})
              </h5>
              <div className="flex flex-wrap gap-2">
                {keywordAnalysis?.matched && keywordAnalysis.matched.length > 0 ? (
                  keywordAnalysis.matched.map((kw, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 shadow-xs"
                    >
                      <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                      {kw.name}
                      <span className="text-[10px] text-emerald-400/80">
                        ({kw.category})
                      </span>
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-zinc-500 italic">No role keywords identified yet.</span>
                )}
              </div>
            </div>

            {/* Missing Keywords Grid */}
            <div className="space-y-2 pt-4 border-t border-white/10">
              <h5 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                Missing Recommended Keywords ({keywordAnalysis?.missing.length || 0})
              </h5>
              <p className="text-[11px] text-zinc-400">
                Incorporate these if you have relevant experience with them to pass automated ATS filters:
              </p>
              <div className="flex flex-wrap gap-2">
                {keywordAnalysis?.missing && keywordAnalysis.missing.length > 0 ? (
                  keywordAnalysis.missing.map((kw, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-950/60 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 shadow-xs"
                    >
                      <span className="text-amber-400 font-bold">+</span>
                      {kw.name}
                      <span className="text-[10px] text-amber-400/80">
                        ({kw.category})
                      </span>
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-emerald-400 font-medium">All core keywords present!</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────
          8. TAB 4: BULLET REWRITES & IMPACT (Dark Charcoal & Crisp White)
      ────────────────────────────────────────────────────────── */}
      {activeTab === "rewrites" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              Grounded Bullet Rewrites (Before → After)
            </h4>
            <span className="text-[11px] text-zinc-400">
              Strictly grounded on your actual experience — no hallucinated metrics.
            </span>
          </div>

          <div className="space-y-3">
            {aiEvaluation?.rewritten_bullets && aiEvaluation.rewritten_bullets.length > 0 ? (
              aiEvaluation.rewritten_bullets.map((b, idx) => (
                <div
                  key={idx}
                  className="bg-[#18191f] border border-white/10 rounded-2xl p-4 sm:p-5 space-y-3 shadow-md hover:border-purple-500/40 transition-colors"
                >
                  {/* Before */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                      Original Weak Bullet
                    </span>
                    <div className="p-3 rounded-xl bg-[#141519] border border-white/10 text-xs text-zinc-300 font-mono">
                      {b.original}
                    </div>
                  </div>

                  {/* After */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                        Improved High-Impact Version (STAR / XYZ)
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(b.improved, idx)}
                        className="text-[11px] font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        {copiedBulletIdx === idx ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-purple-400" />
                            <span>Copy Bullet</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-200 font-semibold leading-relaxed">
                      {b.improved}
                    </div>
                  </div>

                  {/* Reason */}
                  {b.reason && (
                    <div className="text-[11px] text-zinc-400 flex items-start gap-1.5 pt-1">
                      <span className="font-bold text-purple-400 shrink-0">Why this works:</span>
                      <span>{b.reason}</span>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="p-8 text-center bg-[#141519] border border-white/10 rounded-2xl text-xs text-zinc-400">
                No bullet rewrites generated. Ensure your resume contains experience or project bullet points.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────
          9. TAB 5: ACTIONABLE IMPROVEMENT ROADMAP (Dark Charcoal & Crisp White)
      ────────────────────────────────────────────────────────── */}
      {activeTab === "roadmap" && (
        <div className="space-y-4">
          <div className="bg-[#141519] border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-purple-400" />
              Prioritized Action Roadmap
            </h4>
            <p className="text-xs text-zinc-400">
              Implement these changes in descending priority to maximize your score before applying.
            </p>

            <div className="space-y-3 pt-2">
              {aiEvaluation?.improvements && aiEvaluation.improvements.length > 0 ? (
                aiEvaluation.improvements.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-white/10 bg-[#18191f] flex items-start gap-3 text-xs"
                  >
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 mt-0.5 border ${
                        item.priority === "high"
                          ? "bg-rose-950/60 text-rose-300 border-rose-500/30"
                          : item.priority === "medium"
                          ? "bg-amber-950/60 text-amber-300 border-amber-500/30"
                          : "bg-blue-950/60 text-blue-300 border-blue-500/30"
                      }`}
                    >
                      {item.priority}
                    </span>
                    <div className="space-y-1">
                      <span className="font-bold text-white block">
                        {item.section}: {item.action}
                      </span>
                      <p className="text-[11px] text-zinc-300">{item.issue}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-zinc-400">
                  Follow the critical findings in the ATS Rules tab to finalize your resume.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────
          10. TAB 6: FULL MARKDOWN REPORT (Dark Charcoal & Crisp White)
      ────────────────────────────────────────────────────────── */}
      {activeTab === "markdown" && (
        <div className="p-4 sm:p-5 rounded-2xl bg-[#141519] border border-white/10 space-y-3 overflow-x-hidden text-zinc-200 shadow-xl">
          <ResumeMarkdownViewer content={reviewText} />
        </div>
      )}
    </div>
  );
}

