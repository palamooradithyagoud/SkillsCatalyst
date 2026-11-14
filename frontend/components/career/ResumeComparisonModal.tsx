"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowRightLeft,
  X,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Layers,
  FileText,
  Tag,
  Briefcase,
  Award,
  ListChecks,
  Loader2,
  Calendar,
} from "lucide-react";
import { ResumeComparisonResponse, ScoreDiff } from "@/types/career";
import { compareResumeVersions } from "@/lib/api/career";

interface ResumeComparisonModalProps {
  olderId: string;
  newerId: string;
  onClose: () => void;
  onInspectAnalysis?: (analysisId: string) => void;
}

export default function ResumeComparisonModal({
  olderId,
  newerId,
  onClose,
  onInspectAnalysis,
}: ResumeComparisonModalProps) {
  const [data, setData] = useState<ResumeComparisonResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function runCompare() {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const res = await compareResumeVersions(olderId, newerId);
        if (isMounted) setData(res);
      } catch (err: unknown) {
        if (isMounted) {
          setErrorMessage(err instanceof Error ? err.message : "Failed to compare versions.");
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    runCompare();
    return () => {
      isMounted = false;
    };
  }, [olderId, newerId]);

  const renderDeltaBadge = (diff: ScoreDiff) => {
    if (diff.status === "improved") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800">
          <TrendingUp className="w-3 h-3" />
          +{diff.delta} ({diff.percentage_change ? `+${diff.percentage_change}%` : "+0%"})
        </span>
      );
    }
    if (diff.status === "declined") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-100 text-rose-800">
          <TrendingDown className="w-3 h-3" />
          {diff.delta} ({diff.percentage_change ? `${diff.percentage_change}%` : "0%"})
        </span>
      );
    }
    if (diff.status === "unchanged") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
          <Minus className="w-3 h-3" />
          0 pts
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
        N/A
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#141519] rounded-3xl max-w-4xl w-full shadow-2xl border border-zinc-800 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Top Header */}
        <div className="p-5 sm:p-6 bg-[#181920] border-b border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-800 text-white flex items-center justify-center border border-zinc-700 shrink-0">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  Version Diff Comparison
                </h2>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Side-by-side metric delta, structured content changes, keyword coverage, and progression analysis.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white hover:bg-[#1c1d24] rounded-xl transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1 text-zinc-200 bg-[#111216]">
          {isLoading ? (
            <div className="py-24 text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-zinc-400 mx-auto" />
              <p className="text-sm font-bold text-white">Computing granular diff analysis...</p>
              <p className="text-xs text-zinc-400">Comparing scores, sections, skills, and keyword trajectories.</p>
            </div>
          ) : errorMessage || !data ? (
            <div className="py-16 text-center space-y-3">
              <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
              <p className="text-sm font-bold text-white">Comparison Failed</p>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">{errorMessage || "Unknown error"}</p>
              <button
                type="button"
                onClick={onClose}
                className="mt-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs rounded-xl border border-zinc-700"
              >
                Close
              </button>
            </div>
          ) : (
            <>
              {/* Warnings Banner Strip */}
              {data.compatibility.job_descriptions_differ && (
                <div className="p-3.5 bg-amber-950/40 border border-amber-500/30 rounded-2xl flex items-start gap-3 text-xs text-amber-200">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-amber-200">Job Description Divergence</span>
                    <span className="text-amber-300/80 text-[11px] leading-relaxed">
                      {data.keyword_changes.warning ||
                        "The two resume analyses were evaluated against differing job descriptions. Score changes reflect target benchmark differences in addition to resume content updates."}
                    </span>
                  </div>
                </div>
              )}

              {!data.compatibility.engine_compatible && (
                <div className="p-3.5 bg-amber-950/40 border border-amber-500/30 rounded-2xl flex items-start gap-3 text-xs text-amber-200">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-amber-200">Scoring Engine Version Mismatch</span>
                    <span className="text-amber-300/80 text-[11px]">
                      {data.compatibility.warning}
                    </span>
                  </div>
                </div>
              )}

              {/* Version Comparison Header Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Older Version */}
                <div className="p-4 rounded-2xl bg-[#181920] border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 bg-[#23242B] text-zinc-300 font-bold text-[10px] rounded-lg border border-zinc-700">
                      BASELINE (V{data.older_version.version_number})
                    </span>
                    <span className="text-[11px] text-zinc-400">
                      {new Date(data.older_version.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white truncate">
                    {data.older_version.filename}
                  </h4>
                  <div className="text-lg font-black text-white">
                    {data.older_version.overall_score !== null
                      ? `${Math.round(data.older_version.overall_score)}/100`
                      : "Not Evaluated"}
                  </div>
                </div>

                {/* Newer Version */}
                <div className="p-4 rounded-2xl bg-[#181920] border border-zinc-750 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 bg-zinc-800 text-white font-bold text-[10px] rounded-lg border border-zinc-700">
                      LATEST (V{data.newer_version.version_number})
                    </span>
                    <span className="text-[11px] text-zinc-400">
                      {new Date(data.newer_version.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white truncate">
                    {data.newer_version.filename}
                  </h4>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-white">
                      {data.newer_version.overall_score !== null
                        ? `${Math.round(data.newer_version.overall_score)}/100`
                        : "Not Evaluated"}
                    </span>
                    {renderDeltaBadge(data.scores.overall)}
                  </div>
                </div>
              </div>

              {/* 1. Granular Score Deltas Table */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  Score Progression Matrix
                </h3>

                <div className="border border-zinc-800 rounded-2xl overflow-hidden bg-[#181920] shadow-xs">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#141519] border-b border-zinc-800 text-zinc-400 font-bold text-[11px]">
                      <tr>
                        <th className="py-2.5 px-4">Evaluation Dimension</th>
                        <th className="py-2.5 px-4 text-center">Baseline (V{data.older_version.version_number})</th>
                        <th className="py-2.5 px-4 text-center">Current (V{data.newer_version.version_number})</th>
                        <th className="py-2.5 px-4 text-right">Delta</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                      <tr>
                        <td className="py-3 px-4 font-bold text-white">Overall ATS Score</td>
                        <td className="py-3 px-4 text-center font-semibold text-zinc-300">
                          {data.scores.overall.previous !== null ? `${data.scores.overall.previous}%` : "—"}
                        </td>
                        <td className="py-3 px-4 text-center font-extrabold text-white">
                          {data.scores.overall.current !== null ? `${data.scores.overall.current}%` : "—"}
                        </td>
                        <td className="py-3 px-4 text-right">{renderDeltaBadge(data.scores.overall)}</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-bold text-white">ATS Formatting & Parseability</td>
                        <td className="py-3 px-4 text-center font-semibold text-zinc-300">
                          {data.scores.ats.previous !== null ? `${data.scores.ats.previous}%` : "—"}
                        </td>
                        <td className="py-3 px-4 text-center font-extrabold text-white">
                          {data.scores.ats.current !== null ? `${data.scores.ats.current}%` : "—"}
                        </td>
                        <td className="py-3 px-4 text-right">{renderDeltaBadge(data.scores.ats)}</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-bold text-white">Content Quality & Impact</td>
                        <td className="py-3 px-4 text-center font-semibold text-zinc-300">
                          {data.scores.content.previous !== null ? `${data.scores.content.previous}%` : "—"}
                        </td>
                        <td className="py-3 px-4 text-center font-extrabold text-white">
                          {data.scores.content.current !== null ? `${data.scores.content.current}%` : "—"}
                        </td>
                        <td className="py-3 px-4 text-right">{renderDeltaBadge(data.scores.content)}</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-bold text-white">Skills Alignment & Keywords</td>
                        <td className="py-3 px-4 text-center font-semibold text-zinc-300">
                          {data.scores.skills.previous !== null ? `${data.scores.skills.previous}%` : "—"}
                        </td>
                        <td className="py-3 px-4 text-center font-extrabold text-white">
                          {data.scores.skills.current !== null ? `${data.scores.skills.current}%` : "—"}
                        </td>
                        <td className="py-3 px-4 text-right">{renderDeltaBadge(data.scores.skills)}</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-bold text-white">Structure & Section Clarity</td>
                        <td className="py-3 px-4 text-center font-semibold text-zinc-300">
                          {data.scores.structure.previous !== null ? `${data.scores.structure.previous}%` : "—"}
                        </td>
                        <td className="py-3 px-4 text-center font-extrabold text-white">
                          {data.scores.structure.current !== null ? `${data.scores.structure.current}%` : "—"}
                        </td>
                        <td className="py-3 px-4 text-right">{renderDeltaBadge(data.scores.structure)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 2. Structured Content Differences */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-zinc-400" />
                  Content &amp; Section Revisions
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Skills Added & Removed */}
                  <div className="p-4 bg-[#181920] rounded-2xl border border-zinc-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-zinc-400" />
                        Skills Differential
                      </span>
                      <span className="text-[11px] text-zinc-400 font-semibold">
                        {data.content_changes.skills.total_current} current (was {data.content_changes.skills.total_previous})
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-1">
                          Added Skills ({data.content_changes.skills.added.length})
                        </span>
                        {data.content_changes.skills.added.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {data.content_changes.skills.added.map((s) => (
                              <span
                                key={s}
                                className="px-2 py-0.5 bg-emerald-950/60 text-emerald-300 rounded-md font-semibold text-[10px] border border-emerald-500/30"
                              >
                                + {s}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-zinc-500 italic">None added</span>
                        )}
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-bold text-rose-400 block mb-1">
                          Removed Skills ({data.content_changes.skills.removed.length})
                        </span>
                        {data.content_changes.skills.removed.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {data.content_changes.skills.removed.map((s) => (
                              <span
                                key={s}
                                className="px-2 py-0.5 bg-rose-950/60 text-rose-300 rounded-md font-semibold text-[10px] border border-rose-500/30"
                              >
                                - {s}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-zinc-500 italic">None removed</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Section & Project Changes */}
                  <div className="p-4 bg-[#181920] rounded-2xl border border-zinc-800 space-y-3">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-zinc-400" />
                      Section &amp; Project Adjustments
                    </span>

                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">
                          Sections Added / Removed
                        </span>
                        {data.content_changes.sections.added.length > 0 || data.content_changes.sections.removed.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {data.content_changes.sections.added.map((sec) => (
                              <span key={sec} className="px-2 py-0.5 bg-emerald-950/60 text-emerald-300 rounded-md font-semibold text-[10px] border border-emerald-500/30">
                                + Section: {sec}
                              </span>
                            ))}
                            {data.content_changes.sections.removed.map((sec) => (
                              <span key={sec} className="px-2 py-0.5 bg-rose-950/60 text-rose-300 rounded-md font-semibold text-[10px] border border-rose-500/30">
                                - Section: {sec}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-zinc-500 italic">All standard sections preserved</span>
                        )}
                      </div>

                      <div className="pt-2 border-t border-zinc-800">
                        <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">
                          Projects Evolution
                        </span>
                        {data.content_changes.projects.added_titles.length > 0 ? (
                          <div className="space-y-0.5">
                            {data.content_changes.projects.added_titles.map((p) => (
                              <div key={p} className="text-emerald-300 font-semibold text-[11px]">
                                + Added: {p}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-zinc-500 italic">No new project headings added</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Keyword Match Trajectory */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <ListChecks className="w-3.5 h-3.5 text-zinc-400" />
                  Target Keyword Coverage
                </h3>

                <div className="p-4 bg-[#181920] rounded-2xl border border-zinc-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-1.5">
                      Newly Matched Keywords
                    </span>
                    {data.keyword_changes.newly_matched_keywords.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {data.keyword_changes.newly_matched_keywords.map((kw) => (
                          <span key={kw} className="px-2 py-0.5 bg-emerald-950/60 text-emerald-300 rounded-md text-[10px] font-semibold border border-emerald-500/30">
                            ✓ {kw}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-zinc-500 italic">No newly matched keywords</span>
                    )}
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-amber-400 block mb-1.5">
                      Remaining Missing Keywords
                    </span>
                    {data.keyword_changes.unresolved_missing_keywords.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {data.keyword_changes.unresolved_missing_keywords.map((kw) => (
                          <span key={kw} className="px-2 py-0.5 bg-amber-950/60 text-amber-300 rounded-md text-[10px] font-semibold border border-amber-500/30">
                            ! {kw}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-zinc-500 italic">Zero missing keywords detected</span>
                    )}
                  </div>
                </div>
              </div>

              {/* 4. Grounded Summary & Action Items */}
              <div className="space-y-4 pt-2 border-t border-zinc-800">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-zinc-400" />
                  Diagnostic Summary &amp; Action Plan
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Improvements */}
                  <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-2xl space-y-2">
                    <span className="text-xs font-black text-emerald-300 block">
                      What Improved
                    </span>
                    <ul className="space-y-1.5 text-xs text-emerald-200">
                      {data.summary.what_improved.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-emerald-400 font-bold shrink-0">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Needs Work */}
                  <div className="p-4 bg-rose-950/30 border border-rose-500/30 rounded-2xl space-y-2">
                    <span className="text-xs font-black text-rose-300 block">
                      Needs Attention
                    </span>
                    <ul className="space-y-1.5 text-xs text-rose-200">
                      {data.summary.what_became_weaker.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-rose-400 font-bold shrink-0">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Next Steps */}
                <div className="p-4 bg-[#181920] border border-zinc-800 rounded-2xl space-y-2">
                  <span className="text-xs font-bold text-zinc-300 block">
                    Next Recommended Actions
                  </span>
                  <div className="space-y-1.5 text-xs text-zinc-200">
                    {data.summary.next_action_items.map((action, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-zinc-800 border border-zinc-700 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span>{action}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-[#141519] border-t border-zinc-800 flex items-center justify-between shrink-0">
          <span className="text-xs text-zinc-500 font-medium hidden sm:inline">
            SkillsCatalyst AI ATS Intelligence Engine v4.0
          </span>
          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#181920] hover:bg-[#202128] text-white font-bold text-xs rounded-xl border border-zinc-800 transition-colors cursor-pointer"
            >
              Close Comparison
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

