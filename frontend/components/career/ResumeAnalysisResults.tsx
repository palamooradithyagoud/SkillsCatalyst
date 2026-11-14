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
  SkillEvidenceReport,
  ProjectEvaluationReport,
  EducationEvaluationReport,
  ContentQualityReport,
  RecruiterEvaluationReport,
  JobMatchingReport,
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
  skillEvidence?: SkillEvidenceReport | null;
  projectsEvaluation?: ProjectEvaluationReport | null;
  educationEvaluation?: EducationEvaluationReport | null;
  contentQuality?: ContentQualityReport | null;
  recruiterEvaluation?: RecruiterEvaluationReport | null;
  jobMatching?: JobMatchingReport | null;
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

type TabType =
  | "overview"
  | "ats"
  | "keywords"
  | "evidence"
  | "recruiter"
  | "jobmatch"
  | "rewrites"
  | "roadmap"
  | "markdown";

export default function ResumeAnalysisResults({
  reviewText,
  overallScore,
  targetRole,
  companyType,
  extraction,
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

  // Resolved 7-dimensional enterprise scores
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

  const kwScore =
    typeof subScores?.skills === "number"
      ? Math.round(subScores.skills)
      : typeof keywordAnalysis?.keyword_match_percentage === "number"
      ? Math.round(keywordAnalysis.keyword_match_percentage)
      : null;

  const techScore =
    typeof skillEvidence?.technical_skills_score === "number"
      ? Math.round(skillEvidence.technical_skills_score)
      : typeof scoreBreakdown?.technical_skills?.raw_score === "number"
      ? Math.round(scoreBreakdown.technical_skills.raw_score)
      : kwScore;

  const projScore =
    typeof projectsEvaluation?.projects_experience_score === "number"
      ? Math.round(projectsEvaluation.projects_experience_score)
      : typeof scoreBreakdown?.projects_experience?.raw_score === "number"
      ? Math.round(scoreBreakdown.projects_experience.raw_score)
      : null;

  const eduScore =
    typeof educationEvaluation?.education_certifications_score === "number"
      ? Math.round(educationEvaluation.education_certifications_score)
      : typeof scoreBreakdown?.education_certifications?.raw_score === "number"
      ? Math.round(scoreBreakdown.education_certifications.raw_score)
      : null;

  const contentScore =
    typeof contentQuality?.content_quality_score === "number"
      ? Math.round(contentQuality.content_quality_score)
      : typeof subScores?.content === "number"
      ? Math.round(subScores.content)
      : typeof aiEvaluation?.content_quality_score === "number"
      ? Math.round(aiEvaluation.content_quality_score)
      : null;

  const structureScore =
    typeof subScores?.structure === "number"
      ? Math.round(subScores.structure)
      : typeof atsAnalysis?.structure_score === "number"
      ? Math.round(atsAnalysis.structure_score)
      : null;

  const jobMatchScore =
    jobMatching?.job_match_status === "evaluated" && typeof jobMatching?.job_match_score === "number"
      ? Math.round(jobMatching.job_match_score)
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
          3. ENTERPRISE 7-DIMENSIONAL SCORING CARDS (100% TOTAL)
      ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 sm:gap-3">
        {/* Dim 1: ATS Compatibility (15%) */}
        <div className="bg-[#141519] border border-white/10 rounded-2xl p-3 sm:p-3.5 shadow-xs space-y-1.5 hover:border-purple-500/30 transition-all">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white flex items-center gap-1 text-[11px] truncate">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              ATS
            </span>
            <span className="text-[9px] font-bold text-purple-300 bg-purple-950/60 px-1.5 py-0.2 rounded border border-purple-500/30">
              15%
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-black text-white">
              {atsScore !== null ? `${atsScore}` : "—"}
              <span className="text-[10px] text-zinc-400 font-normal">/100</span>
            </span>
          </div>
          <div className="w-full bg-[#23242B] rounded-full h-1 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${getScoreProgressBar(atsScore)}`}
              style={{ width: `${Math.min(100, Math.max(0, atsScore ?? 0))}%` }}
            />
          </div>
          <p className="text-[10px] text-zinc-400 truncate">Parseability &amp; layout</p>
        </div>

        {/* Dim 2: Keyword Coverage (15%) */}
        <div className="bg-[#141519] border border-white/10 rounded-2xl p-3 sm:p-3.5 shadow-xs space-y-1.5 hover:border-purple-500/30 transition-all">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white flex items-center gap-1 text-[11px] truncate">
              <Zap className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              Keywords
            </span>
            <span className="text-[9px] font-bold text-purple-300 bg-purple-950/60 px-1.5 py-0.2 rounded border border-purple-500/30">
              15%
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-black text-white">
              {kwScore !== null ? `${kwScore}` : "—"}
              <span className="text-[10px] text-zinc-400 font-normal">/100</span>
            </span>
          </div>
          <div className="w-full bg-[#23242B] rounded-full h-1 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${getScoreProgressBar(kwScore)}`}
              style={{ width: `${Math.min(100, Math.max(0, kwScore ?? 0))}%` }}
            />
          </div>
          <p className="text-[10px] text-zinc-400 truncate">Role taxonomy match</p>
        </div>

        {/* Dim 3: Technical Skills (15%) */}
        <div className="bg-[#141519] border border-white/10 rounded-2xl p-3 sm:p-3.5 shadow-xs space-y-1.5 hover:border-purple-500/30 transition-all">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white flex items-center gap-1 text-[11px] truncate">
              <Terminal className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              Tech Skills
            </span>
            <span className="text-[9px] font-bold text-purple-300 bg-purple-950/60 px-1.5 py-0.2 rounded border border-purple-500/30">
              15%
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-black text-white">
              {techScore !== null ? `${techScore}` : "—"}
              <span className="text-[10px] text-zinc-400 font-normal">/100</span>
            </span>
          </div>
          <div className="w-full bg-[#23242B] rounded-full h-1 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${getScoreProgressBar(techScore)}`}
              style={{ width: `${Math.min(100, Math.max(0, techScore ?? 0))}%` }}
            />
          </div>
          <p className="text-[10px] text-zinc-400 truncate">Evidence verification</p>
        </div>

        {/* Dim 4: Projects & Experience (20%) */}
        <div className="bg-[#141519] border border-white/10 rounded-2xl p-3 sm:p-3.5 shadow-xs space-y-1.5 hover:border-purple-500/30 transition-all">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white flex items-center gap-1 text-[11px] truncate">
              <Briefcase className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              Projects
            </span>
            <span className="text-[9px] font-bold text-purple-300 bg-purple-950/60 px-1.5 py-0.2 rounded border border-purple-500/30">
              20%
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-black text-white">
              {projScore !== null ? `${projScore}` : "—"}
              <span className="text-[10px] text-zinc-400 font-normal">/100</span>
            </span>
          </div>
          <div className="w-full bg-[#23242B] rounded-full h-1 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${getScoreProgressBar(projScore)}`}
              style={{ width: `${Math.min(100, Math.max(0, projScore ?? 0))}%` }}
            />
          </div>
          <p className="text-[10px] text-zinc-400 truncate">Depth &amp; metrics</p>
        </div>

        {/* Dim 5: Education & Certs (10%) */}
        <div className="bg-[#141519] border border-white/10 rounded-2xl p-3 sm:p-3.5 shadow-xs space-y-1.5 hover:border-purple-500/30 transition-all">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white flex items-center gap-1 text-[11px] truncate">
              <GraduationCap className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              Education
            </span>
            <span className="text-[9px] font-bold text-purple-300 bg-purple-950/60 px-1.5 py-0.2 rounded border border-purple-500/30">
              10%
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-black text-white">
              {eduScore !== null ? `${eduScore}` : "—"}
              <span className="text-[10px] text-zinc-400 font-normal">/100</span>
            </span>
          </div>
          <div className="w-full bg-[#23242B] rounded-full h-1 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${getScoreProgressBar(eduScore)}`}
              style={{ width: `${Math.min(100, Math.max(0, eduScore ?? 0))}%` }}
            />
          </div>
          <p className="text-[10px] text-zinc-400 truncate">Degrees &amp; certs</p>
        </div>

        {/* Dim 6: Content Quality (15%) */}
        <div className="bg-[#141519] border border-white/10 rounded-2xl p-3 sm:p-3.5 shadow-xs space-y-1.5 hover:border-purple-500/30 transition-all">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white flex items-center gap-1 text-[11px] truncate">
              <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              Content
            </span>
            <span className="text-[9px] font-bold text-purple-300 bg-purple-950/60 px-1.5 py-0.2 rounded border border-purple-500/30">
              15%
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-black text-white">
              {contentScore !== null ? `${contentScore}` : "—"}
              <span className="text-[10px] text-zinc-400 font-normal">/100</span>
            </span>
          </div>
          <div className="w-full bg-[#23242B] rounded-full h-1 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${getScoreProgressBar(contentScore)}`}
              style={{ width: `${Math.min(100, Math.max(0, contentScore ?? 0))}%` }}
            />
          </div>
          <p className="text-[10px] text-zinc-400 truncate">Action verbs &amp; STAR</p>
        </div>

        {/* Dim 7: Structure & Flow (10%) */}
        <div className="bg-[#141519] border border-white/10 rounded-2xl p-3 sm:p-3.5 shadow-xs space-y-1.5 hover:border-purple-500/30 transition-all">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white flex items-center gap-1 text-[11px] truncate">
              <Layers className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              Structure
            </span>
            <span className="text-[9px] font-bold text-purple-300 bg-purple-950/60 px-1.5 py-0.2 rounded border border-purple-500/30">
              10%
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-black text-white">
              {structureScore !== null ? `${structureScore}` : "—"}
              <span className="text-[10px] text-zinc-400 font-normal">/100</span>
            </span>
          </div>
          <div className="w-full bg-[#23242B] rounded-full h-1 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${getScoreProgressBar(structureScore)}`}
              style={{ width: `${Math.min(100, Math.max(0, structureScore ?? 0))}%` }}
            />
          </div>
          <p className="text-[10px] text-zinc-400 truncate">Symbol &amp; reading order</p>
        </div>
      </div>

      {/* Target Job Match Banner (Independent) */}
      {jobMatching && (
        <div className="p-3 sm:p-3.5 bg-[#141519] border border-white/10 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-purple-950/60 border border-purple-500/30 text-purple-400 flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white">Target Job Alignment:</span>
                {jobMatching.job_match_status === "evaluated" && jobMatchScore !== null ? (
                  <span className="px-2 py-0.5 rounded-full font-bold text-xs bg-emerald-950/60 border border-emerald-500/30 text-emerald-300">
                    {jobMatchScore}% Match
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full font-medium text-[11px] bg-zinc-800 text-zinc-300">
                    Not Evaluated (No JD Provided)
                  </span>
                )}
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                {jobMatching.job_match_status === "evaluated"
                  ? `${jobMatching.matched_required_count}/${jobMatching.required_skills_count} required competencies matched.`
                  : "Target Job Description was not provided during scan. Supply a JD anytime for custom tailoring."}
              </p>
            </div>
          </div>
          {jobMatching.job_match_status === "evaluated" && (
            <button
              type="button"
              onClick={() => setActiveTab("jobmatch")}
              className="text-purple-400 hover:text-purple-300 font-bold text-xs underline cursor-pointer shrink-0 self-start sm:self-center"
            >
              View JD Match Breakdown →
            </button>
          )}
        </div>
      )}

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
            ATS Rules
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
            Keywords
            {keywordAnalysis && typeof keywordAnalysis.matched_count === "number" && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-purple-950/60 text-purple-300 border border-purple-500/30">
                {keywordAnalysis.matched_count}/{keywordAnalysis.total_analyzed_keywords}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("evidence")}
            className={`px-3 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === "evidence"
                ? "bg-purple-600 text-white shadow-xs"
                : "text-zinc-400 hover:text-white hover:bg-[#1c1d24]"
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            Skill Evidence
            {skillEvidence && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-purple-950/60 text-purple-300 border border-purple-500/30">
                {Math.round(skillEvidence.demonstration_rate)}% Verified
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("recruiter")}
            className={`px-3 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === "recruiter"
                ? "bg-purple-600 text-white shadow-xs"
                : "text-zinc-400 hover:text-white hover:bg-[#1c1d24]"
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            Recruiter Lens
          </button>

          {jobMatching && jobMatching.job_match_status === "evaluated" && (
            <button
              type="button"
              onClick={() => setActiveTab("jobmatch")}
              className={`px-3 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === "jobmatch"
                  ? "bg-purple-600 text-white shadow-xs"
                  : "text-zinc-400 hover:text-white hover:bg-[#1c1d24]"
              }`}
            >
              <FileSearch className="w-3.5 h-3.5" />
              JD Alignment
            </button>
          )}

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
            Rewrites
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
            <Code className="w-3.5 h-3.5" />
            Markdown
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
          7A. TAB: SKILL EVIDENCE VERIFICATION (Supporting Engine 1)
      ────────────────────────────────────────────────────────── */}
      {activeTab === "evidence" && (
        <div className="space-y-4">
          <div className="bg-[#141519] border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-purple-400" />
                  Skill Evidence &amp; Practical Verification
                </h4>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Verifies whether declared technical competencies are substantiated by actual project bullets and work experience.
                </p>
              </div>
              {skillEvidence && (
                <div className="px-3 py-1.5 rounded-xl bg-purple-950/60 border border-purple-500/30 text-purple-300 text-xs font-bold shrink-0 self-start sm:self-center">
                  Demonstration Rate: {Math.round(skillEvidence.demonstration_rate)}%
                </div>
              )}
            </div>

            {skillEvidence ? (
              <div className="space-y-5">
                {/* Metrics Tally */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-[#18191f] border border-white/10 rounded-xl text-center">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 block">Total Declared</span>
                    <span className="text-xl font-black text-white">{skillEvidence.total_declared_skills}</span>
                  </div>
                  <div className="p-3 bg-emerald-950/30 border border-emerald-500/20 rounded-xl text-center">
                    <span className="text-[10px] uppercase font-bold text-emerald-400 block">Demonstrated</span>
                    <span className="text-xl font-black text-emerald-300">{skillEvidence.demonstrated_count}</span>
                  </div>
                  <div className="p-3 bg-amber-950/30 border border-amber-500/20 rounded-xl text-center">
                    <span className="text-[10px] uppercase font-bold text-amber-400 block">Mentioned Only</span>
                    <span className="text-xl font-black text-amber-300">{skillEvidence.mentioned_only_count}</span>
                  </div>
                  <div className="p-3 bg-rose-950/30 border border-rose-500/20 rounded-xl text-center">
                    <span className="text-[10px] uppercase font-bold text-rose-400 block">Unsupported Claims</span>
                    <span className="text-xl font-black text-rose-300">{skillEvidence.unsupported_count}</span>
                  </div>
                </div>

                {/* Evidence Items Breakdown */}
                <div className="space-y-3">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                    Detailed Skill Verifications
                  </h5>
                  <div className="space-y-2.5 max-h-[450px] overflow-y-auto pr-1">
                    {skillEvidence.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-[#18191f] border border-white/10 space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{item.skill}</span>
                            <span className="text-[10px] text-zinc-400 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                              {item.category}
                            </span>
                          </div>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              item.classification === "demonstrated"
                                ? "bg-emerald-950/60 border-emerald-500/30 text-emerald-300"
                                : item.classification === "partially_demonstrated"
                                ? "bg-cyan-950/60 border-cyan-500/30 text-cyan-300"
                                : item.classification === "mentioned_only"
                                ? "bg-amber-950/60 border-amber-500/30 text-amber-300"
                                : "bg-rose-950/60 border-rose-500/30 text-rose-300"
                            }`}
                          >
                            {item.classification.replace("_", " ").toUpperCase()}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400">{item.explanation}</p>
                        {item.evidence && item.evidence.length > 0 && (
                          <div className="space-y-1 pt-1 border-t border-white/5">
                            {item.evidence.map((ev, evIdx) => (
                              <div key={evIdx} className="text-[10px] text-zinc-300 flex items-start gap-1.5 bg-[#121316] p-2 rounded-lg border border-white/5">
                                <span className="font-bold text-purple-400 shrink-0">[{ev.section}]:</span>
                                <span className="italic line-clamp-2">"{ev.snippet}"</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                {skillEvidence.recommendations && skillEvidence.recommendations.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/20 space-y-1.5">
                    <span className="text-xs font-bold text-purple-300 block">Evidence Optimization Recommendations:</span>
                    <ul className="list-disc list-inside space-y-1 text-xs text-purple-200/80">
                      {skillEvidence.recommendations.map((rec, rIdx) => (
                        <li key={rIdx}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-zinc-400">Skill evidence analysis will populate when full evaluation completes.</p>
            )}
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────
          7B. TAB: RECRUITER LENS (Supporting Engine 2)
      ────────────────────────────────────────────────────────── */}
      {activeTab === "recruiter" && (
        <div className="space-y-4">
          <div className="bg-[#141519] border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-purple-400" />
                  Senior Technical Recruiter Evaluation
                </h4>
                <p className="text-xs text-zinc-400 mt-0.5">
                  How hiring managers and technical recruiters perceive your resume within the first 10 seconds of scanning.
                </p>
              </div>
              {recruiterEvaluation && (
                <div className="px-3 py-1.5 rounded-xl bg-purple-950/60 border border-purple-500/30 text-purple-300 text-xs font-bold shrink-0 self-start sm:self-center">
                  Verdict: {recruiterEvaluation.overall_qualitative_verdict}
                </div>
              )}
            </div>

            {recruiterEvaluation ? (
              <div className="space-y-4">
                {/* 10-Second Impression */}
                <div className="p-4 rounded-xl bg-[#18191f] border border-white/10 space-y-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-300 block">
                    ⚡ 10-Second First Impression
                  </span>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {recruiterEvaluation.first_10_second_impression}
                  </p>
                </div>

                {/* Strengths & Concerns Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Strengths */}
                  <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20 space-y-2">
                    <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Candidate Strengths
                    </span>
                    <ul className="space-y-1.5 text-xs text-emerald-200/90 list-disc list-inside">
                      {recruiterEvaluation.recruiter_strengths.map((str, sIdx) => (
                        <li key={sIdx}>{str}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Concerns */}
                  <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/20 space-y-2">
                    <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      Recruiter Concerns / Flags
                    </span>
                    <ul className="space-y-1.5 text-xs text-amber-200/90 list-disc list-inside">
                      {recruiterEvaluation.recruiter_concerns.map((con, cIdx) => (
                        <li key={cIdx}>{con}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Priority Improvements */}
                {recruiterEvaluation.top_improvement_recommendations && recruiterEvaluation.top_improvement_recommendations.length > 0 && (
                  <div className="p-4 rounded-xl bg-[#18191f] border border-white/10 space-y-2">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <ChevronRight className="w-4 h-4 text-purple-400" />
                      Top Recommended Adjustments Before Applying
                    </span>
                    <ul className="space-y-1 text-xs text-zinc-300 list-disc list-inside">
                      {recruiterEvaluation.top_improvement_recommendations.map((tip, tIdx) => (
                        <li key={tIdx}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-zinc-400">Recruiter lens evaluation will populate when analysis completes.</p>
            )}
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────
          7C. TAB: TARGET JOB MATCH (Supporting Engine 3)
      ────────────────────────────────────────────────────────── */}
      {activeTab === "jobmatch" && (
        <div className="space-y-4">
          <div className="bg-[#141519] border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileSearch className="w-4 h-4 text-purple-400" />
                  Target Job Alignment Analysis
                </h4>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Detailed evaluation of candidate suitability against the target Job Description.
                </p>
              </div>
              {jobMatching?.job_match_score !== null && (
                <div className="px-3 py-1.5 rounded-xl bg-purple-950/60 border border-purple-500/30 text-purple-300 text-xs font-bold shrink-0 self-start sm:self-center">
                  Score: {jobMatching?.job_match_score}/100
                </div>
              )}
            </div>

            {jobMatching && jobMatching.job_match_status === "evaluated" ? (
              <div className="space-y-4">
                {/* Matched Competencies */}
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-300 block">
                    Matched Competencies ({jobMatching.matched_skills.length})
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {jobMatching.matched_skills.map((m, mIdx) => (
                      <span
                        key={mIdx}
                        className={`text-xs px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${
                          m.is_demonstrated
                            ? "bg-emerald-950/60 border-emerald-500/30 text-emerald-300"
                            : "bg-cyan-950/60 border-cyan-500/30 text-cyan-300"
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <strong>{m.name}</strong>
                        <span className="text-[10px] opacity-75">
                          ({m.is_required ? "Required" : "Preferred"} · {m.is_demonstrated ? "Proven" : "Mentioned"})
                        </span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Missing Required Skills */}
                {jobMatching.missing_required_skills && jobMatching.missing_required_skills.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-300 block">
                      Missing Required Competencies ({jobMatching.missing_required_skills.length})
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {jobMatching.missing_required_skills.map((sk, sIdx) => (
                        <span
                          key={sIdx}
                          className="text-xs px-2.5 py-1 rounded-lg bg-rose-950/60 border border-rose-500/30 text-rose-300 flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tailoring Recommendations */}
                {jobMatching.tailoring_recommendations && jobMatching.tailoring_recommendations.length > 0 && (
                  <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/20 space-y-2">
                    <span className="text-xs font-bold text-purple-300 block">Tailoring Recommendations:</span>
                    <ul className="space-y-1 text-xs text-purple-200/80 list-disc list-inside">
                      {jobMatching.tailoring_recommendations.map((rec, rIdx) => (
                        <li key={rIdx}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 text-center space-y-2 bg-[#18191f] rounded-2xl border border-white/5">
                <Info className="w-8 h-8 text-zinc-500 mx-auto" />
                <h5 className="text-xs font-bold text-white">No Target Job Description Provided</h5>
                <p className="text-xs text-zinc-400 max-w-md mx-auto">
                  To evaluate alignment against specific company requirements, paste a Job Description during your next scan.
                </p>
              </div>
            )}
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

