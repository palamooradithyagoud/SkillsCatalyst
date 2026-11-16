"use client";

import React, { useState, useEffect } from "react";
import { ChevronRight, Check, Copy } from "lucide-react";
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

  // SYS-RESUME: Guarantee mobile bottom navigation bar is completely hidden during active results inspection
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.body.setAttribute("data-resume-active", "true");
      document.body.setAttribute("data-hide-bottombar", "true");
    }
    return () => {
      if (typeof document !== "undefined") {
        document.body.removeAttribute("data-resume-active");
        document.body.removeAttribute("data-hide-bottombar");
      }
    };
  }, []);
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
          1. ATS OVERALL SCORE & DIMENSION PROGRESS CARD
      ────────────────────────────────────────────────────────── */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#141519] border border-zinc-800 space-y-5">
        {/* Top Header Row of the Card */}
        <div className="pb-3 border-b border-zinc-800">
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
            Overall ATS Score
          </h2>
          <p className="text-xs text-zinc-400 font-medium mt-0.5">
            {displayOverallScore !== null && displayOverallScore >= 80
              ? "Ready to apply."
              : displayOverallScore !== null && displayOverallScore >= 60
              ? "Competitive with minor adjustments."
              : "Optimization recommended before applying."}
          </p>
        </div>

        {/* Card Body: Circular Score Gauge (Left) + Dimension Progress Lines (Right) */}
        <div className="flex flex-col md:flex-row items-center md:items-center gap-6 md:gap-10 pt-1">
          {/* Circular Score Gauge */}
          <div className="flex flex-col items-center justify-center shrink-0">
            <div className="relative w-32 h-32 sm:w-36 sm:h-36 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="48"
                  className="stroke-[#202127]"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="48"
                  className={`${
                    displayOverallScore !== null && displayOverallScore >= 80
                      ? "stroke-emerald-400"
                      : displayOverallScore !== null && displayOverallScore >= 60
                      ? "stroke-amber-400"
                      : "stroke-rose-400"
                  } transition-all duration-1000 ease-out`}
                  strokeWidth="8"
                  strokeDasharray={2 * Math.PI * 48}
                  strokeDashoffset={
                    displayOverallScore !== null
                      ? 2 * Math.PI * 48 * (1 - Math.min(100, Math.max(0, displayOverallScore)) / 100)
                      : 2 * Math.PI * 48
                  }
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none">
                <span className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-none">
                  {displayOverallScore !== null ? displayOverallScore : "—"}
                </span>
                <span className="text-[10px] sm:text-[11px] font-bold text-zinc-400 uppercase tracking-widest mt-1">
                  / 100
                </span>
              </div>
            </div>
          </div>

          {/* Progress Lines Beside Circle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3.5 flex-1 w-full">
            {[
              {
                label: "Content & Impact",
                score: contentScore,
                barColor: getScoreProgressBar(contentScore),
              },
              {
                label: "ATS Parsing & Readability",
                score: atsScore,
                barColor: getScoreProgressBar(atsScore),
              },
              {
                label: "Role Keywords",
                score: kwScore,
                barColor: getScoreProgressBar(kwScore),
              },
              {
                label: "Projects & Impact",
                score: projScore,
                barColor: getScoreProgressBar(projScore),
              },
              {
                label: "Technical Depth",
                score: techScore,
                barColor: getScoreProgressBar(techScore),
              },
              {
                label: "Format & Structure",
                score: structureScore,
                barColor: getScoreProgressBar(structureScore),
              },
              {
                label: "Education & Certs",
                score: eduScore,
                barColor: getScoreProgressBar(eduScore),
              },
            ].map((item) => (
              <div key={item.label} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-300 font-medium truncate">
                    {item.label}
                  </span>
                  <span className="font-bold text-white text-xs shrink-0 ml-2">
                    {item.score !== null ? `${item.score}/100` : "—"}
                  </span>
                </div>
                <div className="w-full bg-[#202127] rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${item.barColor}`}
                    style={{ width: `${Math.min(100, Math.max(0, item.score ?? 0))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────
          3. TAB NAVIGATION
      ────────────────────────────────────────────────────────── */}
      <div className="border-b border-zinc-800">
        <div className="flex gap-2 sm:gap-4 overflow-x-auto no-scrollbar py-1">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === "overview"
                ? "bg-zinc-800 text-white border border-zinc-700 shadow-xs"
                : "text-zinc-400 hover:text-white hover:bg-[#181920]"
            }`}
          >
            Verdict &amp; Summary
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("ats")}
            className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === "ats"
                ? "bg-zinc-800 text-white border border-zinc-700 shadow-xs"
                : "text-zinc-400 hover:text-white hover:bg-[#181920]"
            }`}
          >
            <span>ATS Rules</span>
            {criticalCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500 text-white">
                {criticalCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("keywords")}
            className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === "keywords"
                ? "bg-zinc-800 text-white border border-zinc-700 shadow-xs"
                : "text-zinc-400 hover:text-white hover:bg-[#181920]"
            }`}
          >
            <span>Keywords</span>
            {keywordAnalysis && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-zinc-800 text-zinc-300 border border-zinc-700">
                {(keywordAnalysis.matched_keywords_count ?? keywordAnalysis.matched?.length ?? 0)}/{(keywordAnalysis.total_keywords ?? ((keywordAnalysis.matched?.length ?? 0) + (keywordAnalysis.missing?.length ?? 0)))}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("evidence")}
            className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === "evidence"
                ? "bg-zinc-800 text-white border border-zinc-700 shadow-xs"
                : "text-zinc-400 hover:text-white hover:bg-[#181920]"
            }`}
          >
            <span>Skill Evidence</span>
            {skillEvidence && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-zinc-800 text-zinc-300 border border-zinc-700">
                {Math.round(skillEvidence.demonstration_rate)}% Verified
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("recruiter")}
            className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === "recruiter"
                ? "bg-zinc-800 text-white border border-zinc-700 shadow-xs"
                : "text-zinc-400 hover:text-white hover:bg-[#181920]"
            }`}
          >
            Recruiter Lens
          </button>

          {jobMatching && jobMatching.job_match_status === "evaluated" && (
            <button
              type="button"
              onClick={() => setActiveTab("jobmatch")}
              className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === "jobmatch"
                  ? "bg-zinc-800 text-white border border-zinc-700 shadow-xs"
                  : "text-zinc-400 hover:text-white hover:bg-[#181920]"
              }`}
            >
              JD Alignment
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveTab("rewrites")}
            className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === "rewrites"
                ? "bg-zinc-800 text-white border border-zinc-700 shadow-xs"
                : "text-zinc-400 hover:text-white hover:bg-[#181920]"
            }`}
          >
            <span>Rewrites</span>
            {aiEvaluation?.rewritten_bullets && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-zinc-800 text-zinc-300 border border-zinc-700">
                {aiEvaluation.rewritten_bullets.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("roadmap")}
            className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === "roadmap"
                ? "bg-zinc-800 text-white border border-zinc-700 shadow-xs"
                : "text-zinc-400 hover:text-white hover:bg-[#181920]"
            }`}
          >
            Action Plan
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("markdown")}
            className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === "markdown"
                ? "bg-zinc-800 text-white border border-zinc-700 shadow-xs"
                : "text-zinc-400 hover:text-white hover:bg-[#181920]"
            }`}
          >
            Markdown
          </button>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────
          5. TAB 1: OVERVIEW & VERDICT
      ────────────────────────────────────────────────────────── */}
      {activeTab === "overview" && (
        <div className="space-y-4">
          <div className="bg-[#141519] border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-sm">
            <h4 className="text-sm font-bold text-white">
              Executive Verdict
            </h4>
            <div className="p-4 rounded-xl bg-[#181920] border border-zinc-800 text-xs text-zinc-300 leading-relaxed">
              {aiEvaluation?.summary_verdict || (
                <p>
                  Your resume has been comprehensively evaluated against <strong className="text-white">{targetRole}</strong> hiring rubrics.
                  Follow the prioritized bullet rewrites and ATS adjustments below to significantly boost interview shortlisting rates.
                </p>
              )}
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-[#181920] border border-zinc-800 space-y-1">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                  Critical ATS Errors
                </span>
                <span className={`text-lg font-bold ${criticalCount > 0 ? "text-rose-400" : "text-white"}`}>
                  {criticalCount} Critical
                </span>
                <p className="text-[11px] text-zinc-400">
                  {criticalCount === 0 ? "Zero blocking parsing issues." : "Must resolve before applying."}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#181920] border border-zinc-800 space-y-1">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                  Role Keywords Matched
                </span>
                <span className="text-lg font-bold text-white">
                  {keywordAnalysis ? `${Math.round(keywordAnalysis.keyword_match_percentage)}%` : "N/A"}
                </span>
                <p className="text-[11px] text-zinc-400">
                  {keywordAnalysis
                    ? `${(keywordAnalysis.matched_keywords_count ?? keywordAnalysis.matched?.length ?? 0)} of ${(keywordAnalysis.total_keywords ?? ((keywordAnalysis.matched?.length ?? 0) + (keywordAnalysis.missing?.length ?? 0)))} core keywords`
                    : "Role keywords"}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#181920] border border-zinc-800 space-y-1">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                  Candidate Stage
                </span>
                <span className="text-lg font-bold text-white">
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
              className="p-4 rounded-xl border border-zinc-800 bg-[#181920] hover:border-zinc-700 hover:bg-[#1c1d24] cursor-pointer transition-all space-y-1 group"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-white">
                  View Grounded Bullet Rewrites
                </span>
                <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-[11px] text-zinc-400">
                Turn passive job descriptions into metric-driven achievements using the STAR method.
              </p>
            </div>

            <div
              onClick={() => setActiveTab("keywords")}
              className="p-4 rounded-xl border border-zinc-800 bg-[#181920] hover:border-zinc-700 hover:bg-[#1c1d24] cursor-pointer transition-all space-y-1 group"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-white">
                  Explore Missing Keywords
                </span>
                <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
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
            <div className="bg-[#141519] border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-3 shadow-sm">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                Contact Information Completeness
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 text-xs">
                {/* Email */}
                <div
                  className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 ${
                    atsAnalysis.contact_info.has_email
                      ? "bg-[#181920] border-zinc-800 text-zinc-200"
                      : "bg-rose-950/20 border-rose-500/30 text-rose-300"
                  }`}
                >
                  <div className="truncate">
                    <span className="font-bold block text-[11px] text-white">Email</span>
                    <span className="text-[10px] text-zinc-400 truncate block">
                      {atsAnalysis.contact_info.email || "Missing"}
                    </span>
                  </div>
                  <span className={`text-[10px] font-semibold shrink-0 ${atsAnalysis.contact_info.has_email ? "text-zinc-400" : "text-rose-400"}`}>
                    {atsAnalysis.contact_info.has_email ? "Found" : "Missing"}
                  </span>
                </div>

                {/* Phone */}
                <div
                  className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 ${
                    atsAnalysis.contact_info.has_phone
                      ? "bg-[#181920] border-zinc-800 text-zinc-200"
                      : "bg-[#181920] border-zinc-800 text-zinc-400"
                  }`}
                >
                  <div className="truncate">
                    <span className="font-bold block text-[11px] text-white">Phone</span>
                    <span className="text-[10px] text-zinc-400 truncate block">
                      {atsAnalysis.contact_info.phone || "Missing"}
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-zinc-400 shrink-0">
                    {atsAnalysis.contact_info.has_phone ? "Found" : "Missing"}
                  </span>
                </div>

                {/* LinkedIn */}
                <div
                  className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 ${
                    atsAnalysis.contact_info.has_linkedin
                      ? "bg-[#181920] border-zinc-800 text-zinc-200"
                      : "bg-[#181920] border-zinc-800 text-zinc-400"
                  }`}
                >
                  <div className="truncate">
                    <span className="font-bold block text-[11px] text-white">LinkedIn</span>
                    <span className="text-[10px] text-zinc-400 truncate block">
                      {atsAnalysis.contact_info.has_linkedin ? "Linked" : "Recommended"}
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-zinc-400 shrink-0">
                    {atsAnalysis.contact_info.has_linkedin ? "Found" : "Optional"}
                  </span>
                </div>

                {/* GitHub */}
                <div
                  className="p-2.5 rounded-xl border border-zinc-800 bg-[#181920] text-zinc-300 flex items-center justify-between gap-2"
                >
                  <div className="truncate">
                    <span className="font-bold block text-[11px] text-white">GitHub</span>
                    <span className="text-[10px] text-zinc-400 truncate block">
                      {atsAnalysis.contact_info.has_github ? "Linked" : "Optional"}
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-zinc-400 shrink-0">
                    {atsAnalysis.contact_info.has_github ? "Found" : "Optional"}
                  </span>
                </div>

                {/* Portfolio / Website */}
                <div
                  className="p-2.5 rounded-xl border border-zinc-800 bg-[#181920] text-zinc-300 flex items-center justify-between gap-2"
                >
                  <div className="truncate">
                    <span className="font-bold block text-[11px] text-white">Portfolio</span>
                    <span className="text-[10px] text-zinc-400 truncate block">
                      {atsAnalysis.contact_info.has_portfolio ? "Linked" : "Optional"}
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-zinc-400 shrink-0">
                    {atsAnalysis.contact_info.has_portfolio ? "Found" : "Optional"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Severity Filter Controls */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              ATS Findings &amp; Rule Diagnostics
            </h4>

            <div className="flex items-center gap-1.5 bg-[#141519] border border-zinc-800 p-1 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => setSeverityFilter("all")}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                  severityFilter === "all" ? "bg-zinc-800 text-white border border-zinc-700 shadow-xs" : "text-zinc-400 hover:text-white"
                }`}
              >
                All ({findings.length})
              </button>
              <button
                type="button"
                onClick={() => setSeverityFilter("critical")}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                  severityFilter === "critical"
                    ? "bg-rose-900/60 text-white border border-rose-600 shadow-xs"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Critical ({criticalCount})
              </button>
              <button
                type="button"
                onClick={() => setSeverityFilter("warning")}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                  severityFilter === "warning"
                    ? "bg-zinc-800 text-white border border-zinc-700 shadow-xs"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Warnings ({warningCount})
              </button>
              <button
                type="button"
                onClick={() => setSeverityFilter("good")}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                  severityFilter === "good"
                    ? "bg-zinc-800 text-white border border-zinc-700 shadow-xs"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Passed ({passCount})
              </button>
            </div>
          </div>

          {/* Findings Cards List */}
          <div className="space-y-3">
            {filteredFindings.length === 0 ? (
              <div className="p-8 text-center bg-[#141519] border border-zinc-800 rounded-2xl text-xs text-zinc-400">
                No findings in this category.
              </div>
            ) : (
              filteredFindings.map((finding, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-zinc-800 bg-[#141519] space-y-2 transition-all hover:border-zinc-700"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-bold text-xs text-white">
                      {finding.issue}
                    </span>

                    <span
                      className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                        finding.severity === "critical"
                          ? "bg-rose-950/60 text-rose-300 border-rose-500/30"
                          : "bg-[#202127] text-zinc-300 border-zinc-700/60"
                      }`}
                    >
                      {finding.severity}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-300 leading-relaxed">
                    <strong className="text-white">Impact:</strong> {finding.impact}
                  </p>

                  <div className="p-2.5 rounded-lg bg-[#181920] border border-zinc-800/80 text-[11px] text-zinc-300 flex items-start gap-2">
                    <span className="font-bold text-zinc-400 shrink-0">Fix:</span>
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
          <div className="bg-[#141519] border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h4 className="text-sm font-bold text-white">
                  Target Role Keyword Alignment
                </h4>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {targetRole ? (
                    <>Target Role: <strong className="text-white">{targetRole}</strong> · Analyzed against canonical tech taxonomy with alias normalization.</>
                  ) : (
                    <>Domain Ecosystem Alignment · Analyzed against canonical tech taxonomy with alias normalization.</>
                  )}
                </p>
              </div>

              {keywordAnalysis && (
                <div className="text-right">
                  <span className="text-lg font-bold text-white">
                    {Math.round(keywordAnalysis.keyword_match_percentage)}% Match
                  </span>
                  <span className="text-[11px] text-zinc-400 block">
                    {(keywordAnalysis.matched_keywords_count ?? keywordAnalysis.matched?.length ?? 0)} of {(keywordAnalysis.total_keywords ?? ((keywordAnalysis.matched?.length ?? 0) + (keywordAnalysis.missing?.length ?? 0)))} keywords present
                  </span>
                </div>
              )}
            </div>

            {/* Matched Keywords Grid */}
            <div className="space-y-2 pt-2">
              <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                Detected Skills &amp; Keywords ({keywordAnalysis?.matched.length || 0})
              </h5>
              <div className="flex flex-wrap gap-2">
                {keywordAnalysis?.matched && keywordAnalysis.matched.length > 0 ? (
                  keywordAnalysis.matched.map((kw, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[#181920] text-zinc-200 border border-zinc-800 flex items-center gap-1.5"
                    >
                      <span>{kw.name}</span>
                      <span className="text-[10px] text-zinc-500">
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
            <div className="space-y-2 pt-4 border-t border-zinc-800">
              <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
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
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[#181920] text-zinc-300 border border-zinc-800 flex items-center gap-1.5"
                    >
                      <span className="text-zinc-500 font-bold">+</span>
                      <span>{kw.name}</span>
                      <span className="text-[10px] text-zinc-500">
                        ({kw.category})
                      </span>
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-zinc-400 font-medium">All core keywords present!</span>
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
          <div className="bg-[#141519] border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
              <div>
                <h4 className="text-sm font-bold text-white">
                  Skill Evidence &amp; Practical Verification
                </h4>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Verifies whether declared technical competencies are substantiated by actual project bullets and work experience.
                </p>
              </div>
              {skillEvidence && (
                <div className="px-3 py-1 rounded-lg bg-[#181920] border border-zinc-800 text-zinc-300 text-xs font-semibold shrink-0 self-start sm:self-center">
                  Demonstration Rate: <span className="text-white font-bold">{Math.round(skillEvidence.demonstration_rate)}%</span>
                </div>
              )}
            </div>

            {skillEvidence ? (
              <div className="space-y-5">
                {/* Metrics Tally */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-[#181920] border border-zinc-800 rounded-xl text-center">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">Total Declared</span>
                    <span className="text-xl font-bold text-white">{skillEvidence.total_declared_skills}</span>
                  </div>
                  <div className="p-3 bg-[#181920] border border-zinc-800 rounded-xl text-center">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">Demonstrated</span>
                    <span className="text-xl font-bold text-white">{skillEvidence.demonstrated_count}</span>
                  </div>
                  <div className="p-3 bg-[#181920] border border-zinc-800 rounded-xl text-center">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">Mentioned Only</span>
                    <span className="text-xl font-bold text-white">{skillEvidence.mentioned_only_count}</span>
                  </div>
                  <div className="p-3 bg-[#181920] border border-zinc-800 rounded-xl text-center">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">Unsupported Claims</span>
                    <span className="text-xl font-bold text-white">{skillEvidence.unsupported_count}</span>
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
                        className="p-3 rounded-xl bg-[#181920] border border-zinc-800 space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{item.skill}</span>
                            <span className="text-[10px] text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded border border-zinc-700/50">
                              {item.category}
                            </span>
                          </div>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${
                              item.classification === "demonstrated"
                                ? "bg-zinc-800 text-zinc-200 border-zinc-700"
                                : item.classification === "partially_demonstrated"
                                ? "bg-zinc-800 text-zinc-300 border-zinc-700"
                                : item.classification === "mentioned_only"
                                ? "bg-zinc-800/80 text-zinc-400 border-zinc-700/60"
                                : "bg-zinc-800 text-zinc-400 border-zinc-700"
                            }`}
                          >
                            {item.classification.replace("_", " ").toUpperCase()}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400">{item.explanation}</p>
                        {item.evidence && item.evidence.length > 0 && (
                          <div className="space-y-1 pt-1 border-t border-zinc-800">
                            {item.evidence.map((ev, evIdx) => (
                              <div key={evIdx} className="text-[10px] text-zinc-300 flex items-start gap-1.5 bg-[#141519] p-2 rounded-lg border border-zinc-800">
                                <span className="font-mono text-zinc-400 shrink-0">[{ev.section}]:</span>
                                <span className="italic line-clamp-2 text-zinc-300">"{ev.snippet}"</span>
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
                  <div className="p-3.5 rounded-xl bg-[#181920] border border-zinc-800 space-y-1.5">
                    <span className="text-xs font-bold text-zinc-300 block">Evidence Optimization Recommendations:</span>
                    <ul className="list-disc list-inside space-y-1 text-xs text-zinc-400">
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
          <div className="bg-[#141519] border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
              <div>
                <h4 className="text-sm font-bold text-white">
                  Senior Technical Recruiter Evaluation
                </h4>
                <p className="text-xs text-zinc-400 mt-0.5">
                  How hiring managers and technical recruiters perceive your resume within the first 10 seconds of scanning.
                </p>
              </div>
              {recruiterEvaluation && (
                <div className="px-3 py-1 rounded-lg bg-[#181920] border border-zinc-800 text-zinc-300 text-xs font-semibold shrink-0 self-start sm:self-center">
                  Verdict: <span className="text-white font-bold">{recruiterEvaluation.overall_qualitative_verdict}</span>
                </div>
              )}
            </div>

            {recruiterEvaluation ? (
              <div className="space-y-4">
                {/* 10-Second Impression */}
                <div className="p-4 rounded-xl bg-[#181920] border border-zinc-800 space-y-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-300 block">
                    10-Second First Impression
                  </span>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {recruiterEvaluation.first_10_second_impression}
                  </p>
                </div>

                {/* Strengths & Concerns Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Strengths */}
                  <div className="p-4 rounded-xl bg-[#181920] border border-zinc-800 space-y-2">
                    <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                      Candidate Strengths
                    </span>
                    <ul className="space-y-1.5 text-xs text-zinc-300 list-disc list-inside">
                      {recruiterEvaluation.recruiter_strengths.map((str, sIdx) => (
                        <li key={sIdx}>{str}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Concerns */}
                  <div className="p-4 rounded-xl bg-[#181920] border border-zinc-800 space-y-2">
                    <span className="text-xs font-bold text-zinc-400 flex items-center gap-1.5">
                      Recruiter Concerns / Flags
                    </span>
                    <ul className="space-y-1.5 text-xs text-zinc-400 list-disc list-inside">
                      {recruiterEvaluation.recruiter_concerns.map((con, cIdx) => (
                        <li key={cIdx}>{con}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Priority Improvements */}
                {recruiterEvaluation.top_improvement_recommendations && recruiterEvaluation.top_improvement_recommendations.length > 0 && (
                  <div className="p-4 rounded-xl bg-[#181920] border border-zinc-800 space-y-2">
                    <span className="text-xs font-bold text-white block">
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
          <div className="bg-[#141519] border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
              <div>
                <h4 className="text-sm font-bold text-white">
                  Target Job Alignment Analysis
                </h4>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Detailed evaluation of candidate suitability against the target Job Description.
                </p>
              </div>
              {jobMatching?.job_match_score !== null && (
                <div className="px-3 py-1 rounded-lg bg-[#181920] border border-zinc-800 text-zinc-300 text-xs font-semibold shrink-0 self-start sm:self-center">
                  Score: <span className="text-white font-bold">{jobMatching?.job_match_score}/100</span>
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
                        className="text-xs px-2.5 py-1 rounded-lg border border-zinc-800 bg-[#181920] text-zinc-200 flex items-center gap-1.5"
                      >
                        <strong>{m.name}</strong>
                        <span className="text-[10px] text-zinc-500">
                          ({m.is_required ? "Required" : "Preferred"} · {m.is_demonstrated ? "Proven" : "Mentioned"})
                        </span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Missing Required Skills */}
                {jobMatching.missing_required_skills && jobMatching.missing_required_skills.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-300 block">
                      Missing Required Competencies ({jobMatching.missing_required_skills.length})
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {jobMatching.missing_required_skills.map((sk, sIdx) => (
                        <span
                          key={sIdx}
                          className="text-xs px-2.5 py-1 rounded-lg bg-[#181920] border border-zinc-800 text-zinc-300 flex items-center gap-1"
                        >
                          <span className="text-zinc-500 font-bold">+</span>
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tailoring Recommendations */}
                {jobMatching.tailoring_recommendations && jobMatching.tailoring_recommendations.length > 0 && (
                  <div className="p-4 rounded-xl bg-[#181920] border border-zinc-800 space-y-2">
                    <span className="text-xs font-bold text-zinc-300 block">Tailoring Recommendations:</span>
                    <ul className="space-y-1 text-xs text-zinc-400 list-disc list-inside">
                      {jobMatching.tailoring_recommendations.map((rec, rIdx) => (
                        <li key={rIdx}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 text-center space-y-2 bg-[#181920] rounded-2xl border border-zinc-800">
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
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
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
                  className="bg-[#181920] border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-3 shadow-xs hover:border-zinc-700 transition-colors"
                >
                  {/* Before */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                      Original Weak Bullet
                    </span>
                    <div className="p-3 rounded-xl bg-[#141519] border border-zinc-800 text-xs text-zinc-400 font-mono">
                      {b.original}
                    </div>
                  </div>

                  {/* After */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-300 block">
                        Improved High-Impact Version (STAR / XYZ)
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(b.improved, idx)}
                        className="text-[11px] font-semibold text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        {copiedBulletIdx === idx ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-zinc-300" />
                            <span className="text-zinc-300">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-zinc-400" />
                            <span>Copy Bullet</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="p-3 rounded-xl bg-[#141519] border border-zinc-750 text-xs text-white font-medium leading-relaxed">
                      {b.improved}
                    </div>
                  </div>

                  {/* Reason */}
                  {b.reason && (
                    <div className="text-[11px] text-zinc-400 flex items-start gap-1.5 pt-1">
                      <span className="font-semibold text-zinc-300 shrink-0">Why this works:</span>
                      <span>{b.reason}</span>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="p-8 text-center bg-[#141519] border border-zinc-800 rounded-2xl text-xs text-zinc-400">
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
          <div className="bg-[#141519] border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-sm">
            <h4 className="text-sm font-bold text-white">
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
                    className="p-3.5 rounded-xl border border-zinc-800 bg-[#181920] flex items-start gap-3 text-xs"
                  >
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md shrink-0 mt-0.5 border ${
                        item.priority === "high"
                          ? "bg-rose-950/60 text-rose-300 border-rose-500/30"
                          : "bg-zinc-800 text-zinc-300 border-zinc-700"
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
        <div className="p-4 sm:p-5 rounded-2xl bg-[#141519] border border-zinc-800 space-y-3 overflow-x-hidden text-zinc-200 shadow-xl">
          <ResumeMarkdownViewer content={reviewText} />
        </div>
      )}
    </div>
  );
}

