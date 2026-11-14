"use client";

import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  Award,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Layers,
  ChevronLeft,
  Loader2,
  Clock,
  Sparkles,
  BarChart2,
  AlertTriangle,
  ArrowUpRight,
  ShieldCheck,
  Check,
  Lock,
} from "lucide-react";
import { ResumeProgressResponse } from "@/types/career";
import { getResumeSeriesProgress } from "@/lib/api/career";

interface ResumeGrowthDashboardProps {
  seriesId: string;
  onBack: () => void;
  onSelectAnalysis: (analysisId: string) => void;
}

export default function ResumeGrowthDashboard({
  seriesId,
  onBack,
  onSelectAnalysis,
}: ResumeGrowthDashboardProps) {
  const [progress, setProgress] = useState<ResumeProgressResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchProgress() {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const res = await getResumeSeriesProgress(seriesId);
        if (isMounted) setProgress(res);
      } catch (err: unknown) {
        if (isMounted) {
          setErrorMessage(err instanceof Error ? err.message : "Failed to load growth tracking.");
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    fetchProgress();
    return () => {
      isMounted = false;
    };
  }, [seriesId]);

  const renderIndicatorBadge = (status: "improved" | "declined" | "unchanged" | "not_comparable") => {
    switch (status) {
      case "improved":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 uppercase">
            ↑ Improved
          </span>
        );
      case "declined":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 uppercase">
            ↓ Declined
          </span>
        );
      case "unchanged":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 uppercase">
            = Stable
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-800 uppercase">
            N/A
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2 rounded-xl hover:bg-[#1c1d24] text-zinc-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                Resume Improvement &amp; Growth Tracking
              </h2>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Score trajectory, unlockable career milestones, and recurring weakness resolutions across revisions.
            </p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="py-24 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-purple-400 mx-auto" />
          <p className="text-sm font-bold text-white">Calculating career progress metrics...</p>
        </div>
      ) : errorMessage || !progress ? (
        <div className="py-16 text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
          <p className="text-sm font-bold text-white">Unable to load growth data</p>
          <p className="text-xs text-zinc-400">{errorMessage || "Unknown error"}</p>
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 bg-[#23242B] text-white font-bold text-xs rounded-xl border border-white/10"
          >
            Go Back
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Series Meta Info Banner */}
          <div className="p-4 rounded-2xl bg-[#181920] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-extrabold text-purple-400 uppercase tracking-wider block">
                Active Track
              </span>
              <h3 className="text-base font-black text-white">
                {progress.series.title}
              </h3>
              {progress.series.target_role && (
                <p className="text-xs text-zinc-400">Target Role: {progress.series.target_role}</p>
              )}
            </div>

            <div className="flex items-center gap-3 text-xs font-semibold text-zinc-300">
              <span className="px-3 py-1 bg-[#1c1d24] rounded-xl border border-white/10 shadow-xs">
                Total Iterations: <strong className="text-white">{progress.growth.total_versions}</strong>
              </span>
              {progress.growth.last_analyzed_date && (
                <span className="text-zinc-400">
                  Last Updated: {new Date(progress.growth.last_analyzed_date).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>

          {/* 1. Growth KPI Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* KPI 1: Current Score */}
            <div className="bg-[#18191f] border border-white/10 rounded-2xl p-4 shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                Current Score
              </span>
              <div className="text-2xl font-black text-white">
                {progress.growth.current_overall_score !== null
                  ? `${Math.round(progress.growth.current_overall_score)}/100`
                  : "—"}
              </div>
              <p className="text-[11px] text-zinc-400 font-medium">Latest iteration rating</p>
            </div>

            {/* KPI 2: Previous Score */}
            <div className="bg-[#18191f] border border-white/10 rounded-2xl p-4 shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                Previous Score
              </span>
              <div className="text-2xl font-black text-zinc-300">
                {progress.growth.previous_overall_score !== null
                  ? `${Math.round(progress.growth.previous_overall_score)}/100`
                  : "—"}
              </div>
              <p className="text-[11px] text-zinc-400 font-medium">Penultimate iteration</p>
            </div>

            {/* KPI 3: Best Score */}
            <div className="bg-[#18191f] border border-white/10 rounded-2xl p-4 shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                Peak Score
              </span>
              <div className="text-2xl font-black text-purple-400">
                {progress.growth.best_score !== null
                  ? `${Math.round(progress.growth.best_score)}/100`
                  : "—"}
              </div>
              <p className="text-[11px] text-zinc-400 font-medium">Highest achieved</p>
            </div>

            {/* KPI 4: Total Improvement */}
            <div className="bg-[#18191f] border border-white/10 rounded-2xl p-4 shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                Total Improvement
              </span>
              <div className="text-2xl font-black flex items-center gap-1">
                <span className={progress.growth.total_score_improvement >= 0 ? "text-emerald-400" : "text-rose-400"}>
                  {progress.growth.total_score_improvement >= 0
                    ? `+${progress.growth.total_score_improvement}`
                    : progress.growth.total_score_improvement}
                </span>
                <span className="text-xs text-zinc-400 font-bold">pts</span>
              </div>
              <p className="text-[11px] text-zinc-400 font-medium">Net delta since V1</p>
            </div>
          </div>

          {/* 2. Visual Score Trend Timeline */}
          <div className="bg-[#18191f] border border-white/10 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-purple-400" />
                  Score Progression Trajectory
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Visual timeline of overall ATS scores across uploaded revisions.
                </p>
              </div>
            </div>

            {/* Bar Timeline Chart */}
            <div className="pt-4 pb-2">
              <div className="grid grid-flow-col auto-cols-fr gap-3 items-end h-44 sm:h-52 border-b border-white/10 px-2 pb-2">
                {progress.timeline.map((point) => {
                  const score = point.overall_score ?? 0;
                  const heightPercent = Math.max(12, Math.min(100, score));
                  return (
                    <div
                      key={point.analysis_id}
                      onClick={() => onSelectAnalysis(point.analysis_id)}
                      className="group flex flex-col items-center justify-end h-full cursor-pointer"
                    >
                      {/* Tooltip & Score */}
                      <span className="text-[11px] font-black text-white mb-1.5 opacity-90 group-hover:scale-110 transition-transform">
                        {point.overall_score !== null ? `${Math.round(point.overall_score)}` : "—"}
                      </span>

                      {/* Bar Pillar */}
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full max-w-[48px] rounded-t-xl transition-all duration-300 relative ${
                          point.overall_score && point.overall_score >= 80
                            ? "bg-gradient-to-t from-emerald-600 to-emerald-400 group-hover:from-emerald-500 group-hover:to-emerald-300"
                            : point.overall_score && point.overall_score >= 60
                            ? "bg-gradient-to-t from-purple-600 to-purple-400 group-hover:from-purple-500 group-hover:to-purple-300"
                            : "bg-gradient-to-t from-zinc-600 to-zinc-500 group-hover:from-zinc-400"
                        } shadow-xs`}
                      />

                      {/* Label below bar */}
                      <div className="pt-2 text-center">
                        <span className="text-xs font-black text-white block">
                          V{point.version_number}
                        </span>
                        <span className="text-[10px] text-zinc-400 hidden sm:block truncate max-w-[80px]">
                          {new Date(point.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Category Status Strip */}
            <div className="pt-3 border-t border-white/10">
              <span className="text-xs font-bold text-zinc-300 block mb-2">
                Latest Iteration Category Trends:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                <div className="p-2 bg-[#141519] border border-white/5 rounded-xl flex items-center justify-between text-xs">
                  <span className="font-semibold text-zinc-300 text-[11px]">Overall</span>
                  {renderIndicatorBadge(progress.category_indicators.overall)}
                </div>
                <div className="p-2 bg-[#141519] border border-white/5 rounded-xl flex items-center justify-between text-xs">
                  <span className="font-semibold text-zinc-300 text-[11px]">ATS Format</span>
                  {renderIndicatorBadge(progress.category_indicators.ats)}
                </div>
                <div className="p-2 bg-[#141519] border border-white/5 rounded-xl flex items-center justify-between text-xs">
                  <span className="font-semibold text-zinc-300 text-[11px]">Impact</span>
                  {renderIndicatorBadge(progress.category_indicators.content)}
                </div>
                <div className="p-2 bg-[#141519] border border-white/5 rounded-xl flex items-center justify-between text-xs">
                  <span className="font-semibold text-zinc-300 text-[11px]">Skills</span>
                  {renderIndicatorBadge(progress.category_indicators.skills)}
                </div>
                <div className="p-2 bg-[#141519] border border-white/5 rounded-xl flex items-center justify-between text-xs col-span-2 sm:col-span-1">
                  <span className="font-semibold text-zinc-300 text-[11px]">Structure</span>
                  {renderIndicatorBadge(progress.category_indicators.structure)}
                </div>
              </div>
            </div>
          </div>

          {/* 3. Dynamic Data-Backed Milestones */}
          <div className="bg-[#18191f] border border-white/10 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-purple-400" />
                Career Acceleration Milestones
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Milestones unlocked based on real evaluation metrics and version iterations.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {progress.milestones.map((m) => (
                <div
                  key={m.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    m.unlocked
                      ? "bg-purple-950/40 border-purple-500/40 shadow-xs"
                      : "bg-[#141519] border-white/5 opacity-60"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[#1c1d24] border border-white/10 flex items-center justify-center shrink-0 shadow-xs">
                      {m.unlocked ? (
                        <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                      ) : (
                        <Lock className="w-4 h-4 text-zinc-500" />
                      )}
                    </div>
                    {m.unlocked && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
                        UNLOCKED
                      </span>
                    )}
                  </div>

                  <div className="mt-2.5 space-y-1">
                    <h4 className="text-xs font-black text-white">{m.title}</h4>
                    <p className="text-[11px] text-zinc-400 leading-snug">{m.description}</p>
                    {m.unlocked_at && (
                      <span className="text-[10px] text-purple-400 font-semibold block pt-1">
                        Achieved on {new Date(m.unlocked_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Recurring Weaknesses Tracker */}
          <div className="bg-[#18191f] border border-white/10 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-purple-400" />
                Recurring Weakness Surveillance
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Identifies systemic weaknesses across multiple revisions to verify whether actionable feedback was implemented.
              </p>
            </div>

            {progress.recurring_weaknesses.length === 0 ? (
              <div className="p-4 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl flex items-center gap-3 text-xs text-emerald-300">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>
                  No recurring weaknesses flagged! Your resume maintains consistent strength across evaluated dimensions.
                </span>
              </div>
            ) : (
              <div className="space-y-2">
                {progress.recurring_weaknesses.map((rw, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-[#141519] border border-white/10 rounded-2xl flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                      <span className="font-semibold text-white truncate">{rw.weakness}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] text-zinc-400 font-medium">
                        Present in {rw.occurrences} {rw.occurrences === 1 ? "version" : "versions"}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          rw.status === "persisting"
                            ? "bg-rose-950/60 text-rose-300 border border-rose-500/30"
                            : "bg-emerald-950/60 text-emerald-300 border border-emerald-500/30"
                        }`}
                      >
                        {rw.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

