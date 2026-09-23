"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Film,
  Video,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Play,
  Plus,
  Search,
  RefreshCw,
  Archive,
  Eye,
  X,
  FileVideo,
  Loader2,
  Check,
  Send,
} from "lucide-react";
import type {
  AdminSkillBit,
  CreateSkillBitPayload,
  SkillBitDifficulty,
  VideoStatus,
} from "@/types/skillbits";
import {
  fetchAdminSkillBits,
  createAdminSkillBit,
  publishAdminSkillBit,
  archiveAdminSkillBit,
  requestDirectUpload,
  getVideoStatus,
  uploadFileToMuxDirect,
} from "@/lib/api/skillbits";

export default function AdminSkillBitsCMS() {
  const [skillbits, setSkillbits] = useState<AdminSkillBit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  // Modal & Creation State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createForm, setCreateForm] = useState<{
    title: string;
    topic: string;
    difficulty: SkillBitDifficulty;
    description: string;
  }>({
    title: "",
    topic: "",
    difficulty: "beginner",
    description: "",
  });

  // Direct Upload State tracking per skillbit: { [id]: { progress: number, isUploading: boolean, isPolling: boolean, error?: string } }
  const [uploadStates, setUploadStates] = useState<
    Record<string, { progress: number; isUploading: boolean; isPolling: boolean; error?: string }>
  >({});

  // Preview modal state
  const [previewPlaybackId, setPreviewPlaybackId] = useState<string | null>(null);

  // Hidden file input refs
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const loadSkillBits = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchAdminSkillBits({
        search: search || undefined,
        difficulty: difficultyFilter || undefined,
        status_filter: statusFilter || undefined,
        limit: 100,
      });
      setSkillbits(res.items || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load SkillBits.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [search, difficultyFilter, statusFilter]);

  useEffect(() => {
    loadSkillBits();
  }, [loadSkillBits]);

  // Handle Create SkillBit
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.title.trim()) return;

    try {
      setCreateSubmitting(true);
      const payload: CreateSkillBitPayload = {
        title: createForm.title.trim(),
        topic: createForm.topic.trim() || null,
        difficulty: createForm.difficulty,
        description: createForm.description.trim() || null,
      };
      await createAdminSkillBit(payload);
      setIsCreateOpen(false);
      setCreateForm({ title: "", topic: "", difficulty: "beginner", description: "" });
      await loadSkillBits();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to create SkillBit");
    } finally {
      setCreateSubmitting(false);
    }
  };

  // Poll video status until READY or ERROR
  const pollVideoStatus = useCallback(async (id: string) => {
    setUploadStates((prev) => ({
      ...prev,
      [id]: { ...(prev[id] || { progress: 100, isUploading: false }), isPolling: true },
    }));

    const maxAttempts = 30; // 30 * 3s = 90s max polling
    let attempts = 0;

    const interval = setInterval(async () => {
      attempts += 1;
      try {
        const statusRes = await getVideoStatus(id);
        if (statusRes.video_status === "READY" || statusRes.video_status === "ERROR" || attempts >= maxAttempts) {
          clearInterval(interval);
          setUploadStates((prev) => ({
            ...prev,
            [id]: { ...(prev[id] || { progress: 100, isUploading: false }), isPolling: false },
          }));
          await loadSkillBits();
        }
      } catch (err) {
        if (attempts >= maxAttempts) {
          clearInterval(interval);
          setUploadStates((prev) => ({
            ...prev,
            [id]: { ...(prev[id] || { progress: 100, isUploading: false }), isPolling: false },
          }));
        }
      }
    }, 3000);
  }, [loadSkillBits]);

  // Handle Direct Upload to Mux
  const handleFileSelect = async (skillbitId: string, file: File) => {
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      alert("Please select a valid video file (.mp4, .mov, etc.)");
      return;
    }

    setUploadStates((prev) => ({
      ...prev,
      [skillbitId]: { progress: 0, isUploading: true, isPolling: false },
    }));

    try {
      // 1. Request direct upload URL from backend
      const uploadSession = await requestDirectUpload(skillbitId);

      // 2. Upload binary bytes directly from browser to Mux
      await uploadFileToMuxDirect(uploadSession.upload_url, file, (percent) => {
        setUploadStates((prev) => ({
          ...prev,
          [skillbitId]: { ...(prev[skillbitId] || {}), progress: percent, isUploading: true, isPolling: false },
        }));
      });

      // 3. Upload completed, start polling Mux transcoding pipeline
      setUploadStates((prev) => ({
        ...prev,
        [skillbitId]: { progress: 100, isUploading: false, isPolling: true },
      }));

      // Immediate refresh to show UPLOADING/PROCESSING badge
      await loadSkillBits();

      // Poll until transcoding generates playback ID
      pollVideoStatus(skillbitId);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload failed.";
      setUploadStates((prev) => ({
        ...prev,
        [skillbitId]: { progress: 0, isUploading: false, isPolling: false, error: msg },
      }));
      alert(`Video direct upload failed: ${msg}`);
    }
  };

  // Handle Publish
  const handlePublish = async (item: AdminSkillBit) => {
    if (item.video_status !== "READY" && !item.playback_id) {
      alert("Cannot publish: Video must be uploaded and ready before publishing to students.");
      return;
    }
    try {
      await publishAdminSkillBit(item.id);
      await loadSkillBits();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to publish SkillBit");
    }
  };

  // Handle Archive
  const handleArchive = async (item: AdminSkillBit) => {
    if (!confirm(`Are you sure you want to archive "${item.title}"?`)) return;
    try {
      await archiveAdminSkillBit(item.id);
      await loadSkillBits();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to archive SkillBit");
    }
  };

  // Manual Sync trigger
  const handleManualSync = async (id: string) => {
    try {
      await getVideoStatus(id);
      await loadSkillBits();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Sync failed");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <span className="px-2 py-0.5 text-[11px] font-semibold rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Published</span>;
      case "archived":
        return <span className="px-2 py-0.5 text-[11px] font-semibold rounded-md bg-slate-800 text-slate-400 border border-slate-700">Archived</span>;
      default:
        return <span className="px-2 py-0.5 text-[11px] font-semibold rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">Draft</span>;
    }
  };

  const getVideoStatusBadge = (vStatus: VideoStatus, id: string) => {
    const uploadState = uploadStates[id];
    if (uploadState?.isUploading) {
      return (
        <span className="flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-semibold rounded-md bg-sky-500/20 text-sky-300 border border-sky-500/30 animate-pulse">
          <Loader2 className="w-3 h-3 animate-spin" /> Uploading ({uploadState.progress}%)
        </span>
      );
    }
    if (uploadState?.isPolling || vStatus === "PROCESSING" || vStatus === "UPLOADING") {
      return (
        <span className="flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-semibold rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
          <Clock className="w-3 h-3 animate-spin" /> Transcoding (Mux)
        </span>
      );
    }
    switch (vStatus) {
      case "READY":
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Ready
          </span>
        );
      case "ERROR":
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30">
            <AlertCircle className="w-3 h-3 text-rose-400" /> Error
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-slate-800 text-slate-400 border border-slate-700">
            No Video
          </span>
        );
    }
  };

  // Metrics
  const readyCount = skillbits.filter((b) => b.video_status === "READY").length;
  const publishedCount = skillbits.filter((b) => b.status === "published").length;
  const processingCount = skillbits.filter((b) => b.video_status === "PROCESSING" || b.video_status === "UPLOADING").length;

  return (
    <div className="space-y-6">
      {/* Metric Cards Header */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400">
            <Film className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{skillbits.length}</div>
            <div className="text-xs text-slate-400">Total SkillBits</div>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{readyCount}</div>
            <div className="text-xs text-slate-400">Videos Transcoded & Ready</div>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
          <div className="p-3 bg-sky-500/10 border border-sky-500/20 rounded-xl text-sky-400">
            <Send className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{publishedCount}</div>
            <div className="text-xs text-slate-400">Live for Students</div>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{processingCount}</div>
            <div className="text-xs text-slate-400">Mux Transcoding Queue</div>
          </div>
        </div>
      </div>

      {/* Main CMS Container */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6">
        {/* Top Controls: Search, Filters, New Bit Button */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search SkillBits..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors w-52 sm:w-64"
              />
            </div>

            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-purple-500"
            >
              <option value="">All Difficulties</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-purple-500"
            >
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>

            <button
              onClick={loadSkillBits}
              disabled={loading}
              title="Refresh list"
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-purple-900/30 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" /> New SkillBit
          </button>
        </div>

        {/* Content Table */}
        {loading && skillbits.length === 0 ? (
          <div className="py-20 text-center text-slate-400 flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
            <span className="text-xs">Loading SkillBits repository...</span>
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        ) : skillbits.length === 0 ? (
          <div className="py-20 text-center text-slate-400 flex flex-col items-center gap-3">
            <div className="p-4 bg-slate-800/60 rounded-full text-slate-500">
              <Film className="w-8 h-8" />
            </div>
            <p className="text-sm font-medium text-slate-300">No SkillBits found</p>
            <p className="text-xs text-slate-500 max-w-sm">
              Create your first educational micro-learning unit and upload video directly via Mux.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Title & Topic</th>
                  <th className="py-3.5 px-4">Difficulty</th>
                  <th className="py-3.5 px-4">Publish State</th>
                  <th className="py-3.5 px-4">Mux Video Pipeline</th>
                  <th className="py-3.5 px-4">Duration</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {skillbits.map((bit) => {
                  const uploadState = uploadStates[bit.id];
                  const canPublish = bit.status !== "published" && (bit.video_status === "READY" || !!bit.playback_id);

                  return (
                    <tr key={bit.id} className="hover:bg-slate-800/30 transition-colors">
                      {/* Title & Topic */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-medium text-white truncate">{bit.title}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                          {bit.topic && <span className="text-purple-400 font-medium">#{bit.topic}</span>}
                          <span>ID: {bit.id.slice(0, 8)}...</span>
                        </div>
                      </td>

                      {/* Difficulty */}
                      <td className="py-3.5 px-4">
                        <span className="capitalize text-slate-300 font-medium">{bit.difficulty}</span>
                      </td>

                      {/* Publish State */}
                      <td className="py-3.5 px-4">{getStatusBadge(bit.status)}</td>

                      {/* Video Status & Direct Upload Dropzone */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            {getVideoStatusBadge(bit.video_status, bit.id)}
                            {bit.playback_id && (
                              <button
                                onClick={() => setPreviewPlaybackId(bit.playback_id || null)}
                                className="text-purple-400 hover:text-purple-300 text-[11px] font-semibold flex items-center gap-1 hover:underline ml-1"
                                title="Preview video stream"
                              >
                                <Play className="w-3 h-3 fill-current" /> Play
                              </button>
                            )}
                          </div>

                          {/* Upload Progress Bar if currently uploading */}
                          {uploadState?.isUploading && (
                            <div className="w-36 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-purple-500 h-1.5 rounded-full transition-all duration-200"
                                style={{ width: `${uploadState.progress}%` }}
                              />
                            </div>
                          )}

                          {/* Upload / Replace Action Button */}
                          <div>
                            <input
                              type="file"
                              accept="video/mp4,video/quicktime,video/webm"
                              className="hidden"
                              ref={(el) => {
                                fileInputRefs.current[bit.id] = el;
                              }}
                              onChange={(e) => {
                                if (e.target.files?.[0]) {
                                  handleFileSelect(bit.id, e.target.files[0]);
                                }
                              }}
                            />
                            <button
                              onClick={() => fileInputRefs.current[bit.id]?.click()}
                              disabled={uploadState?.isUploading}
                              className="text-[11px] text-slate-400 hover:text-purple-400 transition-colors flex items-center gap-1 hover:underline"
                            >
                              <UploadCloud className="w-3 h-3" />
                              {bit.video_status === "READY" ? "Replace Video" : "Upload Video (.mp4)"}
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Duration */}
                      <td className="py-3.5 px-4 text-slate-400">
                        {bit.duration_seconds ? `${bit.duration_seconds}s` : "—"}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Sync Status Button */}
                          <button
                            onClick={() => handleManualSync(bit.id)}
                            title="Sync status with Mux"
                            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>

                          {/* Publish Button */}
                          {bit.status !== "published" && (
                            <button
                              onClick={() => handlePublish(bit)}
                              disabled={!canPublish}
                              title={
                                canPublish
                                  ? "Publish SkillBit to students"
                                  : "Upload and transcode video before publishing"
                              }
                              className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors flex items-center gap-1 ${
                                canPublish
                                  ? "bg-emerald-600/30 text-emerald-300 hover:bg-emerald-600/50 border border-emerald-500/40"
                                  : "bg-slate-800/50 text-slate-600 cursor-not-allowed border border-slate-800"
                              }`}
                            >
                              <Check className="w-3 h-3" /> Publish
                            </button>
                          )}

                          {/* Archive Button */}
                          {bit.status !== "archived" && (
                            <button
                              onClick={() => handleArchive(bit)}
                              title="Archive SkillBit"
                              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-amber-400 transition-colors"
                            >
                              <Archive className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE SKILLBIT MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-500/10 border border-purple-500/20 rounded-lg text-purple-400">
                  <Film className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Create New SkillBit</h3>
                  <p className="text-xs text-slate-400">Draft educational short-form lesson</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master React useTransition in 45 Seconds"
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Topic</label>
                  <input
                    type="text"
                    placeholder="e.g. React, Next.js, Python"
                    value={createForm.topic}
                    onChange={(e) => setCreateForm({ ...createForm, topic: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Difficulty</label>
                  <select
                    value={createForm.difficulty}
                    onChange={(e) => setCreateForm({ ...createForm, difficulty: e.target.value as SkillBitDifficulty })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Brief summary of concepts learned in this video..."
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-[11px] text-purple-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0" />
                <span>You can upload the video file directly using the Mux Direct Upload pipeline immediately after creation.</span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createSubmitting}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-purple-900/40 transition-colors disabled:opacity-50"
                >
                  {createSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Create Draft SkillBit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIDEO PREVIEW MODAL */}
      {previewPlaybackId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-4 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-semibold text-purple-400 flex items-center gap-1.5">
                <FileVideo className="w-4 h-4" /> Mux HLS Stream Preview
              </span>
              <button
                onClick={() => setPreviewPlaybackId(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="aspect-[9/16] bg-black rounded-xl overflow-hidden relative border border-slate-800 flex items-center justify-center">
              <iframe
                src={`https://stream.mux.com/${previewPlaybackId}.html`}
                className="w-full h-full border-0"
                allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                allowFullScreen
              />
            </div>

            <div className="text-center text-[11px] text-slate-400">
              Playback ID: <code className="text-slate-200">{previewPlaybackId}</code>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
