"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Layers,
  Plus,
  GitBranch,
  Calendar,
  Sparkles,
  Award,
  ChevronRight,
  TrendingUp,
  FileText,
  Upload,
  ArrowRightLeft,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  HardDrive,
  Download,
  Eye,
  RefreshCw,
} from "lucide-react";
import {
  ResumeSeriesItem,
  ResumeSeriesDetail,
  ResumeHistoryItem,
} from "@/types/career";
import {
  listResumeSeries,
  createResumeSeries,
  getResumeSeriesDetail,
  deleteResumeSeries,
  uploadSeriesVersion,
  downloadAnalysisPdfReport,
  downloadResumeFile,
} from "@/lib/api/career";

interface ResumeSeriesDashboardProps {
  onSelectAnalysis: (analysisId: string) => void;
  onCompareVersions: (olderId: string, newerId: string) => void;
  onViewGrowth: (seriesId: string) => void;
  onStartNewStandalone?: () => void;
}

export default function ResumeSeriesDashboard({
  onSelectAnalysis,
  onCompareVersions,
  onViewGrowth,
  onStartNewStandalone,
}: ResumeSeriesDashboardProps) {
  const [seriesList, setSeriesList] = useState<ResumeSeriesItem[]>([]);
  const [selectedSeriesId, setSelectedSeriesId] = useState<string | null>(null);
  const [selectedSeriesDetail, setSelectedSeriesDetail] = useState<ResumeSeriesDetail | null>(null);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // New series modal
  const [isCreatingSeries, setIsCreatingSeries] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newTargetRole, setNewTargetRole] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [isSubmittingNewSeries, setIsSubmittingNewSeries] = useState(false);

  // New version upload modal
  const [isUploadingVersion, setIsUploadingVersion] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadJobDesc, setUploadJobDesc] = useState("");
  const [isSubmittingUpload, setIsSubmittingUpload] = useState(false);

  // Version selection for comparison (2 items)
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);

  // PDF report download tracking
  const [downloadingReportId, setDownloadingReportId] = useState<string | null>(null);

  const fetchSeries = useCallback(async () => {
    setIsLoadingList(true);
    setErrorMessage(null);
    try {
      const items = await listResumeSeries();
      setSeriesList(items);
      if (items.length > 0 && !selectedSeriesId) {
        setSelectedSeriesId(items[0].id);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load resume series.";
      setErrorMessage(msg);
    } finally {
      setIsLoadingList(false);
    }
  }, [selectedSeriesId]);

  useEffect(() => {
    fetchSeries();
  }, [fetchSeries]);

  // Fetch detail when selected series changes
  useEffect(() => {
    if (!selectedSeriesId) {
      setSelectedSeriesDetail(null);
      return;
    }
    let isMounted = true;
    async function fetchDetail() {
      setIsLoadingDetail(true);
      try {
        const detail = await getResumeSeriesDetail(selectedSeriesId!);
        if (isMounted) setSelectedSeriesDetail(detail);
      } catch (err) {
        console.error("Failed to load series details:", err);
      } finally {
        if (isMounted) setIsLoadingDetail(false);
      }
    }
    fetchDetail();
    return () => {
      isMounted = false;
    };
  }, [selectedSeriesId]);

  const handleCreateSeries = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setIsSubmittingNewSeries(true);
    try {
      const created = await createResumeSeries({
        title: newTitle.trim(),
        target_role: newTargetRole.trim() || undefined,
        description: newDescription.trim() || undefined,
      });
      setIsCreatingSeries(false);
      setNewTitle("");
      setNewTargetRole("");
      setNewDescription("");
      await fetchSeries();
      setSelectedSeriesId(created.id);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to create series.");
    } finally {
      setIsSubmittingNewSeries(false);
    }
  };

  const handleDeleteSeries = async (seriesId: string) => {
    if (!confirm("Are you sure you want to delete this resume series and all its version history?")) {
      return;
    }
    try {
      await deleteResumeSeries(seriesId);
      if (selectedSeriesId === seriesId) {
        setSelectedSeriesId(null);
      }
      await fetchSeries();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete series.");
    }
  };

  const handleUploadVersion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile || !selectedSeriesId) return;
    setIsSubmittingUpload(true);
    try {
      const res = await uploadSeriesVersion(
        selectedSeriesId,
        uploadFile,
        uploadJobDesc,
        selectedSeriesDetail?.target_role || undefined
      );
      setIsUploadingVersion(false);
      setUploadFile(null);
      setUploadJobDesc("");
      // Reload series detail and list
      const detail = await getResumeSeriesDetail(selectedSeriesId);
      setSelectedSeriesDetail(detail);
      await fetchSeries();
      // Optionally notify user
      if (res.id) {
        onSelectAnalysis(res.id);
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to upload version.");
    } finally {
      setIsSubmittingUpload(false);
    }
  };

  const toggleCompareSelect = (analysisId: string) => {
    setSelectedForCompare((prev) => {
      if (prev.includes(analysisId)) {
        return prev.filter((id) => id !== analysisId);
      }
      if (prev.length >= 2) {
        return [prev[1], analysisId];
      }
      return [...prev, analysisId];
    });
  };

  const handleTriggerCompare = () => {
    if (selectedForCompare.length === 2 && selectedSeriesDetail?.versions) {
      // Find which one is older based on created_at or version_number
      const v0 = selectedSeriesDetail.versions.find((v) => v.id === selectedForCompare[0]);
      const v1 = selectedSeriesDetail.versions.find((v) => v.id === selectedForCompare[1]);
      if (v0 && v1) {
        const time0 = new Date(v0.created_at).getTime();
        const time1 = new Date(v1.created_at).getTime();
        if (time0 <= time1) {
          onCompareVersions(v0.id, v1.id);
        } else {
          onCompareVersions(v1.id, v0.id);
        }
      }
    }
  };

  const handleDownloadPdfReport = async (analysisId: string, filename?: string) => {
    setDownloadingReportId(analysisId);
    try {
      await downloadAnalysisPdfReport(analysisId, filename);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to download PDF report.");
    } finally {
      setDownloadingReportId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-purple-400" />
              Resume Series &amp; Version History
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Organize revisions into logical tracks (e.g., Frontend Engineer, Product Manager), compare iterations, and track growth.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsCreatingSeries(true)}
            className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Series</span>
          </button>
          <button
            type="button"
            onClick={fetchSeries}
            className="p-2 bg-[#1c1d24] border border-white/10 text-zinc-300 hover:text-white hover:bg-[#23242B] rounded-xl transition-colors cursor-pointer"
            title="Refresh Series"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Series List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-zinc-400 px-1">
            <span>TRACKS ({seriesList.length})</span>
            {onStartNewStandalone && (
              <button
                type="button"
                onClick={onStartNewStandalone}
                className="text-purple-400 hover:text-purple-300 text-[11px]"
              >
                + Quick Upload
              </button>
            )}
          </div>

          {isLoadingList ? (
            <div className="p-8 text-center bg-[#18191f] rounded-2xl border border-white/10">
              <Loader2 className="w-5 h-5 animate-spin mx-auto text-purple-400 mb-2" />
              <p className="text-xs text-zinc-400 font-medium">Loading tracks...</p>
            </div>
          ) : seriesList.length === 0 ? (
            <div className="p-6 text-center bg-[#18191f] rounded-2xl border border-dashed border-white/10 space-y-3">
              <Layers className="w-8 h-8 text-zinc-500 mx-auto" />
              <div>
                <p className="text-xs font-bold text-white">No Resume Series Yet</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Create a series or upload a resume to start tracking version iterations.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreatingSeries(true)}
                className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                Create Track
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {seriesList.map((series) => {
                const isSelected = series.id === selectedSeriesId;
                return (
                  <div
                    key={series.id}
                    onClick={() => setSelectedSeriesId(series.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-left space-y-2 ${
                      isSelected
                        ? "bg-purple-950/40 border-purple-500 shadow-xs ring-2 ring-purple-500/20"
                        : "bg-[#18191f] border-white/10 hover:border-white/20 hover:bg-[#1c1d24]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-white truncate">
                          {series.title}
                        </h4>
                        {series.target_role && (
                          <p className="text-[11px] text-purple-300 font-medium truncate">
                            {series.target_role}
                          </p>
                        )}
                      </div>
                      <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-[#23242B] text-zinc-300 border border-white/10 shrink-0">
                        {series.versions_count} {series.versions_count === 1 ? "ver" : "vers"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1 border-t border-white/10">
                      <span>
                        Latest:{" "}
                        <strong className="text-white">
                          {series.latest_score !== null && series.latest_score !== undefined
                            ? `${Math.round(series.latest_score)}/100`
                            : "—"}
                        </strong>
                      </span>
                      <span>
                        Best:{" "}
                        <strong className="text-emerald-400">
                          {series.best_score !== null && series.best_score !== undefined
                            ? `${Math.round(series.best_score)}/100`
                            : "—"}
                        </strong>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Series Detail & Versions Timeline */}
        <div className="lg:col-span-8 bg-[#141519] border border-white/10 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xl min-h-[420px]">
          {isLoadingDetail ? (
            <div className="py-20 text-center">
              <Loader2 className="w-6 h-6 animate-spin text-purple-400 mx-auto mb-2" />
              <p className="text-xs text-zinc-400 font-medium">Loading version history...</p>
            </div>
          ) : !selectedSeriesDetail ? (
            <div className="py-20 text-center space-y-2">
              <Layers className="w-10 h-10 text-zinc-500 mx-auto" />
              <p className="text-sm font-bold text-white">Select a Resume Track</p>
              <p className="text-xs text-zinc-400">
                Choose a series from the left panel to inspect version history, compare edits, or view career progress.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Selected Series Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-black text-white">
                      {selectedSeriesDetail.title}
                    </h3>
                    {selectedSeriesDetail.target_role && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-950/60 text-purple-300 border border-purple-500/30">
                        {selectedSeriesDetail.target_role}
                      </span>
                    )}
                  </div>
                  {selectedSeriesDetail.description && (
                    <p className="text-xs text-zinc-400 mt-1 max-w-xl">
                      {selectedSeriesDetail.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => onViewGrowth(selectedSeriesDetail.id)}
                    className="bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 font-bold text-xs px-3 py-1.5 rounded-xl border border-emerald-500/30 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Track Growth</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsUploadingVersion(true)}
                    className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload New Version</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteSeries(selectedSeriesDetail.id)}
                    className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                    title="Delete Series"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Version Comparison Floating Bar */}
              {selectedForCompare.length > 0 && (
                <div className="p-3 bg-purple-950/50 border border-purple-500/30 rounded-2xl flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <ArrowRightLeft className="w-4 h-4 text-purple-400" />
                    <span className="font-semibold text-purple-300">
                      Comparing: {selectedForCompare.length} of 2 versions selected
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedForCompare.length === 2 && (
                      <button
                        type="button"
                        onClick={handleTriggerCompare}
                        className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-3 py-1 rounded-xl shadow-xs transition-colors cursor-pointer"
                      >
                        Launch Diff Comparison
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setSelectedForCompare([])}
                      className="text-purple-400 hover:text-purple-300 underline font-medium text-[11px]"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}

              {/* Versions List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-zinc-400">
                  <span>ITERATIONS ({selectedSeriesDetail.versions.length})</span>
                  <span className="text-[11px] text-zinc-500 font-normal">
                    Select any two versions to compare score and keyword diffs
                  </span>
                </div>

                {selectedSeriesDetail.versions.length === 0 ? (
                  <div className="p-8 text-center bg-[#18191f] rounded-2xl border border-dashed border-white/10">
                    <p className="text-xs text-zinc-400">
                      No versions in this track yet. Upload your first resume to begin.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedSeriesDetail.versions.map((ver, idx) => {
                      const verNum = (ver as any).version_number ?? (selectedSeriesDetail.versions.length - idx);
                      const isSelectedForComp = selectedForCompare.includes(ver.id);
                      return (
                        <div
                          key={ver.id}
                          className={`p-4 rounded-2xl border transition-all ${
                            isSelectedForComp
                              ? "bg-purple-950/40 border-purple-500 ring-2 ring-purple-500/20"
                              : "bg-[#18191f] border-white/10 hover:border-white/20 hover:bg-[#1c1d24]"
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            {/* Version Info */}
                            <div className="flex items-start gap-3">
                              <span className="w-8 h-8 rounded-xl bg-purple-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                                V{verNum}
                              </span>
                              <div>
                                <h4 className="text-xs font-bold text-white truncate">
                                  {ver.original_filename}
                                </h4>
                                <div className="flex items-center gap-3 text-[11px] text-zinc-400 mt-0.5">
                                  <span>{new Date(ver.created_at).toLocaleDateString()}</span>
                                  {ver.file_type && <span>· {ver.file_type}</span>}
                                  {ver.job_description && (
                                    <span className="text-purple-400 font-medium truncate max-w-[140px]">
                                      · Tailored to JD
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Scores Strip */}
                            <div className="flex items-center gap-2">
                              <div className="text-right">
                                <span className="text-[10px] text-zinc-400 uppercase font-bold block">
                                  Overall Score
                                </span>
                                <span className="text-sm font-black text-white">
                                  {ver.overall_score !== null && ver.overall_score !== undefined
                                    ? `${Math.round(ver.overall_score)}/100`
                                    : "—"}
                                </span>
                              </div>

                              <div className="h-7 w-px bg-white/10 mx-1" />

                              <div className="text-right">
                                <span className="text-[10px] text-zinc-400 uppercase font-bold block">
                                  ATS
                                </span>
                                <span className="text-xs font-extrabold text-purple-400">
                                  {ver.ats_score !== null && ver.ats_score !== undefined
                                    ? `${Math.round(ver.ats_score)}%`
                                    : "—"}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons Row */}
                          <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-white/10 text-xs">
                            <label className="flex items-center gap-1.5 cursor-pointer select-none text-[11px] font-semibold text-zinc-300">
                              <input
                                type="checkbox"
                                checked={isSelectedForComp}
                                onChange={() => toggleCompareSelect(ver.id)}
                                className="rounded text-purple-600 focus:ring-purple-500 w-3.5 h-3.5 bg-[#1c1d24] border-white/10"
                              />
                              <span>Select to Compare</span>
                            </label>

                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => onSelectAnalysis(ver.id)}
                                className="px-3 py-1 bg-[#1c1d24] hover:bg-[#23242B] text-zinc-200 hover:text-white border border-white/10 rounded-lg font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Inspect</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDownloadPdfReport(ver.id, `Report_${ver.original_filename}.pdf`)}
                                disabled={downloadingReportId === ver.id}
                                className="px-3 py-1 bg-purple-950/60 hover:bg-purple-900/60 text-purple-300 border border-purple-500/30 rounded-lg font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                                title="Download 5-page PDF Diagnostic Report"
                              >
                                {downloadingReportId === ver.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Download className="w-3.5 h-3.5" />
                                )}
                                <span>PDF Report</span>
                              </button>
                            </div>
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
      </div>

      {/* ──────────────────────────────────────────────────────────
          Modal: Create New Series
      ────────────────────────────────────────────────────────── */}
      {isCreatingSeries && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#141519] rounded-3xl p-6 max-w-md w-full shadow-2xl border border-white/10 space-y-4">
            <div>
              <h3 className="text-base font-black text-white">Create Resume Track</h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Group revisions tailored for a specific career path or target job role.
              </p>
            </div>

            <form onSubmit={handleCreateSeries} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-zinc-200 mb-1">
                  Track Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Senior Fullstack Engineer"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1c1d24] border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-200 mb-1">
                  Target Role (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Software Development Engineer II"
                  value={newTargetRole}
                  onChange={(e) => setNewTargetRole(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1c1d24] border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-200 mb-1">
                  Description / Strategy (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Focusing on distributed systems, microservices, and high-scale impact..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1c1d24] border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingSeries(false)}
                  className="px-4 py-2 bg-[#1c1d24] border border-white/10 text-zinc-300 hover:text-white hover:bg-[#23242B] font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingNewSeries}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  {isSubmittingNewSeries ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Create Track</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────
          Modal: Upload New Version into Track
      ────────────────────────────────────────────────────────── */}
      {isUploadingVersion && selectedSeriesDetail && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#141519] rounded-3xl p-6 max-w-md w-full shadow-2xl border border-white/10 space-y-4">
            <div>
              <h3 className="text-base font-black text-white">
                Upload New Version to &ldquo;{selectedSeriesDetail.title}&rdquo;
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Upload your updated PDF or DOCX resume. We will analyze it, compute ATS scores, and link it as the next version.
              </p>
            </div>

            <form onSubmit={handleUploadVersion} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-zinc-200 mb-1">
                  Resume File (PDF, DOCX) *
                </label>
                <input
                  type="file"
                  required
                  accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setUploadFile(e.target.files[0]);
                    }
                  }}
                  className="w-full text-xs text-zinc-300 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-purple-950/60 file:text-purple-300 hover:file:bg-purple-900/60 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-200 mb-1">
                  Target Job Description (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Paste the target job description to run keyword match benchmarking..."
                  value={uploadJobDesc}
                  onChange={(e) => setUploadJobDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1c1d24] border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsUploadingVersion(false);
                    setUploadFile(null);
                    setUploadJobDesc("");
                  }}
                  className="px-4 py-2 bg-[#1c1d24] border border-white/10 text-zinc-300 hover:text-white hover:bg-[#23242B] font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingUpload || !uploadFile}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmittingUpload ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Upload & Analyze</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

