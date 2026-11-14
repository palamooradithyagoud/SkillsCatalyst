"use client";

import React, { useState } from "react";
import {
  Target,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Loader2,
  Layers,
  Check,
  Tag,
  Briefcase,
  HelpCircle,
  ShieldCheck,
} from "lucide-react";
import { createOptimizationSession } from "@/lib/api/career";
import { JobOptimizationSession, JobOptimizationRecommendation } from "@/types/career";
import { ResumeData } from "@/lib/career/latexExportHelper";

interface ResumeJobOptimizerProps {
  resumeData: ResumeData;
  onApplySuggestion: (suggestion: JobOptimizationRecommendation) => void;
}

export default function ResumeJobOptimizer({
  resumeData,
  onApplySuggestion,
}: ResumeJobOptimizerProps) {
  const [jobDescription, setJobDescription] = useState("");
  const [targetRole, setTargetRole] = useState(resumeData.role || "Software Engineer");
  const [companyName, setCompanyName] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("1-3 years");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionData, setSessionData] = useState<JobOptimizationSession | null>(null);
  const [appliedSuggestionIds, setAppliedSuggestionIds] = useState<string[]>([]);

  const handleRunOptimization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobDescription.trim() || jobDescription.length < 30) {
      alert("Please paste a realistic job description (at least 30 characters).");
      return;
    }

    setIsLoading(true);
    try {
      const res = await createOptimizationSession({
        job_description: jobDescription,
        job_title: targetRole,
        company_name: companyName,
        experience_level: experienceLevel,
        resume_data: resumeData as any,
      });
      setSessionData(res);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Job optimization analysis failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = (sug: JobOptimizationRecommendation) => {
    onApplySuggestion(sug);
    setAppliedSuggestionIds((prev) => [...prev, sug.id]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-600" />
              Job-Specific Resume Optimization
            </h3>
            <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-purple-100 text-purple-700">
              Phase 5
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Benchmark your resume against a target Job Description, uncover missing keywords, and apply factually grounded enhancements.
          </p>
        </div>
      </div>

      {/* 1. Job Description Input Form */}
      <form onSubmit={handleRunOptimization} className="p-4 sm:p-5 bg-slate-50/70 border border-slate-200/90 rounded-2xl space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Target Role Title
            </label>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Frontend Engineer, SDE II"
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-600 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Target Company (Optional)
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Google, Stripe, Razorpay"
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-600 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Experience Level
            </label>
            <select
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-600 outline-none cursor-pointer"
            >
              <option value="Fresher / Intern">Fresher / Intern</option>
              <option value="1-3 years">1-3 years (Junior / Mid)</option>
              <option value="3-5 years">3-5 years (Mid / Senior)</option>
              <option value="5+ years">5+ years (Lead / Principal)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Job Description Text *
          </label>
          <textarea
            rows={5}
            required
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the full job description, qualifications, and tech requirements here..."
            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-600 outline-none"
          />
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Strict anti-hallucination: will not inject false claims.</span>
          </div>

          <button
            type="submit"
            disabled={isLoading || !jobDescription.trim()}
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer active:scale-95"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>Analyze & Optimize Against Job</span>
          </button>
        </div>
      </form>

      {/* 2. Analysis Results & Recommendations */}
      {sessionData && (
        <div className="space-y-6 pt-2">
          {/* Match Score Meter & Summary */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-purple-50 via-slate-50 to-indigo-50 border border-purple-100 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-700 block">
                Job Alignment Score
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-3xl font-black text-slate-900">
                  {sessionData.keyword_analysis.keyword_match_percentage}%
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  ({sessionData.keyword_analysis.total_matched_skills} of {sessionData.keyword_analysis.total_required_skills} required skills matched)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs">
                Role: <strong>{sessionData.job_title}</strong>
              </span>
              {sessionData.company_name && (
                <span className="px-3 py-1 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs">
                  Company: <strong>{sessionData.company_name}</strong>
                </span>
              )}
            </div>
          </div>

          {/* Skill Breakdown (Matched vs Missing) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Matched Skills */}
            <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-2">
              <span className="text-xs font-black text-emerald-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Matched Skills ({sessionData.keyword_analysis.matched_skills.length})
              </span>
              {sessionData.keyword_analysis.matched_skills.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {sessionData.keyword_analysis.matched_skills.map((s) => (
                    <span key={s} className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md font-bold text-[10px]">
                      ✓ {s}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No direct matches identified yet.</p>
              )}
            </div>

            {/* Missing Skills */}
            <div className="p-4 bg-rose-50/60 border border-rose-200 rounded-2xl space-y-2">
              <span className="text-xs font-black text-rose-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Missing Job Requirements ({sessionData.keyword_analysis.missing_skills.length})
              </span>
              {sessionData.keyword_analysis.missing_skills.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {sessionData.keyword_analysis.missing_skills.map((s) => (
                    <span key={s} className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded-md font-bold text-[10px]">
                      ! {s}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">All key job requirements present in resume.</p>
              )}
            </div>
          </div>

          {/* 3. Grounded Optimization Recommendations */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              Tailored Suggestions for this Job ({sessionData.recommendations.length})
            </h4>

            {sessionData.recommendations.length === 0 ? (
              <p className="text-xs text-slate-500 italic">
                Your resume is already strongly aligned with the core requirements of this role.
              </p>
            ) : (
              <div className="space-y-3">
                {sessionData.recommendations.map((rec) => {
                  const isApplied = appliedSuggestionIds.includes(rec.id);
                  return (
                    <div
                      key={rec.id}
                      className={`p-4 rounded-2xl border transition-all space-y-2.5 ${
                        isApplied
                          ? "bg-slate-50/70 border-slate-200 opacity-70"
                          : rec.type === "gap_advisory"
                          ? "bg-amber-50/60 border-amber-200"
                          : "bg-white border-purple-200/90 shadow-2xs hover:shadow-xs"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-purple-100 text-purple-800">
                            {rec.section}
                          </span>
                          <h5 className="text-xs font-bold text-slate-900">{rec.reason}</h5>
                        </div>

                        {rec.type !== "gap_advisory" && (
                          <button
                            type="button"
                            disabled={isApplied}
                            onClick={() => handleApply(rec)}
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all ${
                              isApplied
                                ? "bg-emerald-100 text-emerald-800 cursor-default"
                                : "bg-purple-600 hover:bg-purple-700 text-white shadow-2xs active:scale-95"
                            }`}
                          >
                            {isApplied ? (
                              <>
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                                <span>Applied</span>
                              </>
                            ) : (
                              <>
                                <ArrowRight className="w-3.5 h-3.5" />
                                <span>Apply to Resume</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>

                      {/* Before vs After snippet */}
                      {rec.suggested_content && (
                        <div className="space-y-1.5 pt-1 text-xs">
                          {rec.original_content && (
                            <div className="p-2 bg-slate-50 rounded-lg text-slate-500 line-through">
                              {rec.original_content}
                            </div>
                          )}
                          <div className="p-2.5 bg-purple-50/70 border border-purple-200 rounded-lg font-medium text-slate-900">
                            {rec.suggested_content}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-[10.5px] text-slate-500 pt-1">
                        <span><strong>Evidence:</strong> {rec.supporting_evidence}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

