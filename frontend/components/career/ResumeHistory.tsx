"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  FileText,
  Download,
  Trash2,
  Eye,
  Calendar,
  Award,
  ArrowUpDown,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  HardDrive,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import {
  ResumeHistoryItem,
  ResumeHistoryResponse,
} from "@/types/career";
import {
  getResumeHistory,
  downloadResumeFile,
  deleteResumeAnalysis,
  downloadAnalysisPdfReport,
} from "@/lib/api/career";

interface ResumeHistoryProps {
  onSelectAnalysis: (analysisId: string) => void;
  onStartNewUpload?: () => void;
  refreshTrigger?: number;
  activeAnalysisId?: string | null;
}

export default function ResumeHistory({
  onSelectAnalysis,
  onStartNewUpload,
  refreshTrigger = 0,
  activeAnalysisId = null,
}: ResumeHistoryProps) {
  const [historyItems, setHistoryItems] = useState<ResumeHistoryItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(8);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState<"created_at" | "overall_score" | "ats_score">("created_at");
  const [order, setOrder] = useState<"desc" | "asc">("desc");

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Deletion confirmation state
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  // Download state
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadSuccessId, setDownloadSuccessId] = useState<string | null>(null);
  const [downloadingReportId, setDownloadingReportId] = useState<string | null>(null);

  const handleDownloadPdfReport = async (item: ResumeHistoryItem) => {
    setDownloadingReportId(item.id);
    try {
      await downloadAnalysisPdfReport(item.id, `SkillsCatalyst_Audit_${item.original_filename}.pdf`);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to download PDF diagnostic report.");
    } finally {
      setDownloadingReportId(null);
    }
  };

  const fetchHistory = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res: ResumeHistoryResponse = await getResumeHistory({
        page,
        pageSize,
        sortBy,
        order,
      });
      setHistoryItems(res.items || []);
      setTotalCount(res.total || 0);
      setTotalPages(res.total_pages || 1);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load resume history.";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, sortBy, order]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory, refreshTrigger]);

  const handleDownload = async (item: ResumeHistoryItem) => {
    setDownloadingId(item.id);
    setErrorMessage(null);
    try {
      const res = await downloadResumeFile(item.id);
      if (res?.signed_url) {
        // Open signed URL or trigger native browser download
        const link = document.createElement("a");
        link.href = res.signed_url;
        link.download = res.filename || item.original_filename || "resume.pdf";
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setDownloadSuccessId(item.id);
        setTimeout(() => setDownloadSuccessId(null), 3000);
      } else {
        throw new Error("No download URL returned.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to download original resume.";
      setErrorMessage(msg);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDelete = async (analysisId: string) => {
    setIsDeletingId(analysisId);
    setErrorMessage(null);
    try {
      await deleteResumeAnalysis(analysisId);
      setConfirmDeleteId(null);
      // Refresh current page
      await fetchHistory();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete resume analysis.";
      setErrorMessage(msg);
    } finally {
      setIsDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const formatFileSize = (bytes?: number | null) => {
    if (!bytes) return null;
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white">Analysis History</h2>
            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-[#23242B] text-zinc-300 border border-white/10">
              {totalCount} {totalCount === 1 ? "record" : "records"}
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Previous resume uploads and structured AI evaluations saved securely in your cloud vault.
          </p>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-zinc-400 font-medium flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5" />
            Sort:
          </span>
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value as any);
              setPage(1);
            }}
            className="bg-[#1c1d24] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-200 focus:outline-none focus:border-purple-500 cursor-pointer"
          >
            <option value="created_at" className="bg-[#18191f] text-white">Date Analyzed</option>
            <option value="overall_score" className="bg-[#18191f] text-white">Overall Score</option>
            <option value="ats_score" className="bg-[#18191f] text-white">ATS Score</option>
          </select>

          <button
            type="button"
            onClick={() => setOrder(order === "desc" ? "asc" : "desc")}
            className="p-1.5 bg-[#1c1d24] border border-white/10 rounded-lg text-zinc-300 hover:text-white hover:bg-[#23242B] transition-colors"
            title={`Order: ${order === "desc" ? "Descending" : "Ascending"}`}
          >
            {order === "desc" ? "↓" : "↑"}
          </button>

          <button
            type="button"
            onClick={() => fetchHistory()}
            disabled={isLoading}
            className="p-1.5 bg-[#1c1d24] border border-white/10 rounded-lg text-zinc-300 hover:text-white hover:bg-[#23242B] transition-colors disabled:opacity-50"
            title="Refresh history"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-3 bg-rose-950/50 border border-rose-500/30 rounded-xl flex items-center justify-between text-xs text-rose-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-rose-400 hover:text-rose-200 font-bold ml-3"
          >
            ✕
          </button>
        </div>
      )}

      {/* Loading Skeletons */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="p-4 bg-[#18191f] border border-white/10 rounded-2xl animate-pulse space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="h-4 w-40 bg-[#23242B] rounded"></div>
                <div className="h-6 w-16 bg-[#23242B] rounded-full"></div>
              </div>
              <div className="h-3 w-28 bg-[#1c1d24] rounded"></div>
              <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                <div className="h-8 w-24 bg-[#23242B] rounded-lg"></div>
                <div className="h-8 w-24 bg-[#1c1d24] rounded-lg"></div>
              </div>
            </div>
          ))}
        </div>
      ) : historyItems.length === 0 ? (
        /* Empty State */
        <div className="text-center py-12 px-4 bg-[#18191f] border border-dashed border-white/10 rounded-2xl space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#1c1d24] border border-white/10 text-zinc-400 flex items-center justify-center mx-auto shadow-xs">
            <HardDrive className="w-6 h-6 text-zinc-400" />
          </div>
          <h3 className="text-sm font-bold text-white">No Resume History Found</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            Uploaded resumes are analyzed with our ATS engine and permanently saved to your private cloud vault.
          </p>
          {onStartNewUpload && (
            <button
              type="button"
              onClick={onStartNewUpload}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer mt-2"
            >
              <FileText className="w-3.5 h-3.5" />
              Upload & Analyze Resume
            </button>
          )}
        </div>
      ) : (
        /* History Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {historyItems.map((item) => {
            const isActive = activeAnalysisId === item.id;
            const isDeleting = isDeletingId === item.id;
            const isDownloading = downloadingId === item.id;
            const isConfirming = confirmDeleteId === item.id;
            const fileSizeStr = formatFileSize(item.file_size);

            return (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all bg-[#18191f] relative flex flex-col justify-between ${
                  isActive
                    ? "border-purple-500 ring-2 ring-purple-500/20 shadow-md"
                    : "border-white/10 hover:border-white/20 hover:bg-[#1c1d24] hover:shadow-xs"
                }`}
              >
                <div>
                  {/* Top Bar: Title & Scores */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-purple-950/60 text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/30">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h4
                          className="text-xs font-bold text-white truncate"
                          title={item.original_filename}
                        >
                          {item.original_filename}
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(item.created_at)}
                          </span>
                          {fileSizeStr && (
                            <>
                              <span>•</span>
                              <span>{fileSizeStr}</span>
                            </>
                          )}
                          {item.file_type && (
                            <>
                              <span>•</span>
                              <span className="uppercase text-[10px] font-semibold text-zinc-400">
                                {item.file_type}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Overall Score Badge */}
                    <div className="shrink-0 text-right">
                      {typeof item.overall_score === "number" ? (
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-600 text-white text-xs font-bold shadow-xs">
                          <Sparkles className="w-3 h-3 text-amber-300" />
                          <span>{Math.round(item.overall_score)}/100</span>
                        </div>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-[#23242B] text-zinc-400 border border-white/10 text-[10px] font-medium">
                          Unscored
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Sub-Scores Pill Row */}
                  <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-white/10 text-center">
                    <div className="p-1.5 bg-[#141519] border border-white/5 rounded-lg">
                      <span className="block text-[10px] text-zinc-400 uppercase font-semibold">ATS</span>
                      <span className="text-xs font-bold text-white">
                        {item.ats_score !== null && item.ats_score !== undefined
                          ? `${Math.round(item.ats_score)}%`
                          : "—"}
                      </span>
                    </div>
                    <div className="p-1.5 bg-[#141519] border border-white/5 rounded-lg">
                      <span className="block text-[10px] text-zinc-400 uppercase font-semibold">Skills</span>
                      <span className="text-xs font-bold text-white">
                        {item.skills_score !== null && item.skills_score !== undefined
                          ? `${Math.round(item.skills_score)}%`
                          : "—"}
                      </span>
                    </div>
                    <div className="p-1.5 bg-[#141519] border border-white/5 rounded-lg">
                      <span className="block text-[10px] text-zinc-400 uppercase font-semibold">Impact</span>
                      <span className="text-xs font-bold text-white">
                        {item.content_score !== null && item.content_score !== undefined
                          ? `${Math.round(item.content_score)}%`
                          : "—"}
                      </span>
                    </div>
                    <div className="p-1.5 bg-[#141519] border border-white/5 rounded-lg">
                      <span className="block text-[10px] text-zinc-400 uppercase font-semibold">Structure</span>
                      <span className="text-xs font-bold text-white">
                        {item.structure_score !== null && item.structure_score !== undefined
                          ? `${Math.round(item.structure_score)}%`
                          : "—"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Inline Deletion Confirmation Bar */}
                {isConfirming ? (
                  <div className="mt-3 p-2.5 bg-rose-950/50 border border-rose-500/30 rounded-xl flex items-center justify-between text-xs">
                    <span className="text-rose-200 font-medium">Delete this resume and analysis?</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        disabled={isDeleting}
                        className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold text-xs shadow-xs transition-colors cursor-pointer"
                      >
                        {isDeleting ? "Deleting..." : "Yes, Delete"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        className="px-2 py-1 bg-[#1c1d24] border border-white/10 text-zinc-300 hover:text-white rounded-lg font-medium text-xs transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Action Buttons */
                  <div className="flex items-center justify-between gap-2 mt-4 pt-2 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => onSelectAnalysis(item.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                        isActive
                          ? "bg-purple-600 text-white shadow-xs"
                          : "bg-purple-950/60 text-purple-300 hover:bg-purple-900/60 border border-purple-500/30"
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      {isActive ? "Viewing Analysis" : "View Analysis"}
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleDownloadPdfReport(item)}
                        disabled={downloadingReportId === item.id}
                        className="px-2.5 py-1.5 text-purple-300 hover:text-white bg-purple-950/60 hover:bg-purple-900/60 border border-purple-500/30 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                        title="Download 5-page PDF Diagnostic Report"
                      >
                        {downloadingReportId === item.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" />
                        ) : (
                          <Download className="w-3.5 h-3.5 text-purple-400" />
                        )}
                        <span>Report</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDownload(item)}
                        disabled={isDownloading}
                        className="p-1.5 text-zinc-400 hover:text-white hover:bg-[#23242B] rounded-lg transition-colors cursor-pointer"
                        title="Download Original Resume (PDF/DOCX)"
                      >
                        {isDownloading ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" />
                        ) : downloadSuccessId === item.id ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Download className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(item.id)}
                        className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                        title="Delete Record & File"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-white/10 text-xs text-zinc-400">
          <span>
            Showing page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || isLoading}
              className="px-3 py-1.5 bg-[#1c1d24] border border-white/10 rounded-lg font-medium text-zinc-300 hover:text-white hover:bg-[#23242B] disabled:opacity-40 transition-colors cursor-pointer flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Previous
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || isLoading}
              className="px-3 py-1.5 bg-[#1c1d24] border border-white/10 rounded-lg font-medium text-zinc-300 hover:text-white hover:bg-[#23242B] disabled:opacity-40 transition-colors cursor-pointer flex items-center gap-1"
            >
              Next
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

