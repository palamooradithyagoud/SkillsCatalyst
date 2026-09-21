"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import {
  Newspaper,
  Building,
  Plus,
  Edit3,
  Trash2,
  ExternalLink,
  UploadCloud,
  Clock,
  CheckCircle2,
  Archive,
  Eye,
  X,
  Search,
  AlertCircle,
  Sparkles,
  Zap,
  Globe,
  Radio,
  Layers,
  ArrowRight,
} from "lucide-react";
import type {
  TechNewsSource,
  TechNewsStory,
  TechNewsStatus,
  CreateTechNewsSourcePayload,
  UpdateTechNewsSourcePayload,
  CreateTechNewsStoryPayload,
  UpdateTechNewsStoryPayload,
} from "@/types/tech_news";
import {
  fetchAdminTechNewsSources,
  createAdminTechNewsSource,
  updateAdminTechNewsSource,
  deleteAdminTechNewsSource,
  uploadAdminSourceLogo,
  fetchAdminTechNewsStories,
  createAdminTechNewsStory,
  updateAdminTechNewsStory,
  publishAdminTechNewsStory,
  archiveAdminTechNewsStory,
  deleteAdminTechNewsStory,
  uploadAdminStoryCover,
} from "@/lib/api/tech_news";

interface AdminTechNewsCMSProps {
  onNewsCountChange?: () => void;
}

type CMSTab = "stories" | "sources";

function getHoursRemaining(visibleUntil?: string | null, status?: string): { text: string; isExpired: boolean } {
  if (status !== "published") return { text: status ? status.toUpperCase() : "DRAFT", isExpired: false };
  if (!visibleUntil) return { text: "No Expiry Set", isExpired: false };
  const diffMs = new Date(visibleUntil).getTime() - Date.now();
  if (diffMs <= 0) return { text: "Expired", isExpired: true };
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) return { text: `${hours}h left`, isExpired: false };
  return { text: `${mins}m left`, isExpired: false };
}

export default function AdminTechNewsCMS({ onNewsCountChange }: AdminTechNewsCMSProps) {
  const [activeTab, setActiveTab] = useState<CMSTab>("stories");
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Sources State
  const [sources, setSources] = useState<TechNewsSource[]>([]);
  const [sourceSearch, setSourceSearch] = useState("");
  const [isSourceModalOpen, setIsSourceModalOpen] = useState(false);
  const [editingSourceId, setEditingSourceId] = useState<string | null>(null);
  const [sourceForm, setSourceForm] = useState({
    name: "",
    website_url: "",
    description: "",
    logo_url: "",
    display_order: 0,
    is_active: true,
  });
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement | null>(null);

  // Stories State
  const [stories, setStories] = useState<TechNewsStory[]>([]);
  const [selectedSourceFilter, setSelectedSourceFilter] = useState<string>("all");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("all");
  const [storySearch, setStorySearch] = useState("");
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [editingStoryId, setEditingStoryId] = useState<string | null>(null);
  const [storyForm, setStoryForm] = useState({
    source_id: "",
    title: "",
    summary: "",
    content: "",
    cover_image_url: "",
    source_url: "",
    status: "draft" as TechNewsStatus,
    display_order: 0,
  });
  const [uploadingCover, setUploadingCover] = useState(false);
  const coverInputRef = useRef<HTMLInputElement | null>(null);

  // Deletion confirm states
  const [deleteConfirmSourceId, setDeleteConfirmSourceId] = useState<string | null>(null);
  const [deleteConfirmStoryId, setDeleteConfirmStoryId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // ── LOAD SOURCES ─────────────────────────────────────────────────────────────
  const loadSources = useCallback(async () => {
    try {
      const res = await fetchAdminTechNewsSources(sourceSearch.trim() || undefined);
      setSources(res.sources || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load sources";
      setErrorMsg(msg);
    }
  }, [sourceSearch]);

  // ── LOAD STORIES ─────────────────────────────────────────────────────────────
  const loadStories = useCallback(async () => {
    try {
      const res = await fetchAdminTechNewsStories({
        source_id: selectedSourceFilter !== "all" ? selectedSourceFilter : undefined,
        status: selectedStatusFilter !== "all" ? selectedStatusFilter : undefined,
        search: storySearch.trim() || undefined,
      });
      setStories(res.stories || []);
      if (onNewsCountChange) onNewsCountChange();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load stories";
      setErrorMsg(msg);
    }
  }, [selectedSourceFilter, selectedStatusFilter, storySearch, onNewsCountChange]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await Promise.all([loadSources(), loadStories()]);
    } finally {
      setLoading(false);
    }
  }, [loadSources, loadStories]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Flash banner auto-dismiss
  useEffect(() => {
    if (successMsg) {
      const t = setTimeout(() => setSuccessMsg(null), 4000);
      return () => clearTimeout(t);
    }
  }, [successMsg]);

  // ── SOURCE HANDLERS ──────────────────────────────────────────────────────────
  const handleOpenCreateSource = () => {
    setEditingSourceId(null);
    setSourceForm({
      name: "",
      website_url: "",
      description: "",
      logo_url: "",
      display_order: sources.length,
      is_active: true,
    });
    setIsSourceModalOpen(true);
  };

  const handleOpenEditSource = (src: TechNewsSource) => {
    setEditingSourceId(src.id);
    setSourceForm({
      name: src.name || "",
      website_url: src.website_url || "",
      description: src.description || "",
      logo_url: src.logo_url || "",
      display_order: src.display_order ?? 0,
      is_active: src.is_active ?? true,
    });
    setIsSourceModalOpen(true);
  };

  const handleSaveSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceForm.name.trim()) {
      setErrorMsg("Source/Company name is required.");
      return;
    }
    setSubmitting(true);
    setErrorMsg(null);
    try {
      if (editingSourceId) {
        await updateAdminTechNewsSource(editingSourceId, sourceForm);
        setSuccessMsg(`Source '${sourceForm.name}' updated successfully.`);
      } else {
        await createAdminTechNewsSource(sourceForm);
        setSuccessMsg(`Source '${sourceForm.name}' created successfully.`);
      }
      setIsSourceModalOpen(false);
      await loadAll();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save source";
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSource = async (id: string) => {
    try {
      await deleteAdminTechNewsSource(id);
      setSuccessMsg("Source and its stories deleted permanently.");
      setDeleteConfirmSourceId(null);
      await loadAll();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete source";
      setErrorMsg(msg);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    setErrorMsg(null);
    try {
      const res = await uploadAdminSourceLogo(file, editingSourceId || undefined);
      setSourceForm((prev) => ({ ...prev, logo_url: res.logo_url }));
      setSuccessMsg("Logo uploaded to Supabase Storage.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Logo upload failed";
      setErrorMsg(msg);
    } finally {
      setUploadingLogo(false);
    }
  };

  // ── STORY HANDLERS ───────────────────────────────────────────────────────────
  const handleOpenCreateStory = () => {
    if (sources.length === 0) {
      setErrorMsg("Please create at least one company source before creating stories.");
      return;
    }
    setEditingStoryId(null);
    setStoryForm({
      source_id: sources[0]?.id || "",
      title: "",
      summary: "",
      content: "",
      cover_image_url: "",
      source_url: "",
      status: "draft",
      display_order: stories.length,
    });
    setIsStoryModalOpen(true);
  };

  const handleOpenEditStory = (story: TechNewsStory) => {
    setEditingStoryId(story.id);
    setStoryForm({
      source_id: story.source_id,
      title: story.title || story.headline || "",
      summary: story.summary || "",
      content: story.content || story.why_it_matters || "",
      cover_image_url: story.cover_image_url || "",
      source_url: story.source_url || "",
      status: story.status,
      display_order: story.display_order ?? 0,
    });
    setIsStoryModalOpen(true);
  };

  const handleSaveStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storyForm.source_id) {
      setErrorMsg("Company source selection is required.");
      return;
    }
    if (!storyForm.title.trim()) {
      setErrorMsg("Story headline/title is required.");
      return;
    }
    if (!storyForm.summary.trim()) {
      setErrorMsg("Story summary is required.");
      return;
    }
    if (!storyForm.content.trim()) {
      setErrorMsg("Full article content is required.");
      return;
    }
    if (!storyForm.source_url.trim()) {
      setErrorMsg("Original source URL is required (must start with http:// or https://).");
      return;
    }

    const payload = {
      ...storyForm,
      headline: storyForm.title.trim(),
      title: storyForm.title.trim(),
      why_it_matters: storyForm.content.trim(),
      content: storyForm.content.trim(),
      source_url: storyForm.source_url.trim(),
    };

    setSubmitting(true);
    setErrorMsg(null);
    try {
      if (editingStoryId) {
        await updateAdminTechNewsStory(editingStoryId, payload);
        setSuccessMsg(`Story '${storyForm.title}' updated successfully.`);
      } else {
        await createAdminTechNewsStory(payload);
        setSuccessMsg(`Story '${storyForm.title}' created successfully.`);
      }
      setIsStoryModalOpen(false);
      await loadStories();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save story";
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePublishStory = async (id: string) => {
    try {
      await publishAdminTechNewsStory(id);
      setSuccessMsg("Story published successfully for 48 hours!");
      await loadStories();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Publish failed";
      setErrorMsg(msg);
    }
  };

  const handleArchiveStory = async (id: string) => {
    try {
      await archiveAdminTechNewsStory(id);
      setSuccessMsg("Story archived and hidden from student feed.");
      await loadStories();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Archive failed";
      setErrorMsg(msg);
    }
  };

  const handleDeleteStory = async (id: string) => {
    try {
      await deleteAdminTechNewsStory(id);
      setSuccessMsg("Story deleted permanently.");
      setDeleteConfirmStoryId(null);
      await loadStories();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Delete failed";
      setErrorMsg(msg);
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    setErrorMsg(null);
    try {
      const res = await uploadAdminStoryCover(file, editingStoryId || undefined);
      setStoryForm((prev) => ({ ...prev, cover_image_url: res.cover_image_url }));
      setSuccessMsg("Cover image uploaded to Supabase Storage.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Cover upload failed";
      setErrorMsg(msg);
    } finally {
      setUploadingCover(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Subheader & Tab Switcher ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-400" />
              <span>Tech News Stories CMS (48h Lifecycle)</span>
            </h2>
            <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Live Production
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage company publishers and curate high-impact stories with authoritative 48-hour active windows.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center bg-slate-800/90 border border-slate-700/80 p-1 rounded-xl shrink-0">
          <button
            onClick={() => setActiveTab("stories")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "stories"
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Newspaper className="w-3.5 h-3.5" />
            <span>Stories ({stories.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("sources")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "sources"
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Companies ({sources.length})</span>
          </button>
        </div>
      </div>

      {/* ── Notification Banners ── */}
      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="p-1 text-slate-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="p-1 text-slate-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ── TAB 1: STORIES MANAGEMENT ── */}
      {activeTab === "stories" && (
        <div className="space-y-4">
          {/* Controls Bar: Filters & Create Story */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
            <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
              {/* Search */}
              <div className="relative flex-1 min-w-[180px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search stories..."
                  value={storySearch}
                  onChange={(e) => setStorySearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Source Filter Dropdown */}
              <select
                value={selectedSourceFilter}
                onChange={(e) => setSelectedSourceFilter(e.target.value)}
                className="py-1.5 px-3 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs text-white focus:outline-none focus:border-purple-500"
              >
                <option value="all">All Companies</option>
                {sources.map((src) => (
                  <option key={src.id} value={src.id}>
                    {src.name}
                  </option>
                ))}
              </select>

              {/* Status Filter Dropdown */}
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="py-1.5 px-3 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs text-white focus:outline-none focus:border-purple-500"
              >
                <option value="all">All Statuses</option>
                <option value="published">Published (Live / Expired)</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <button
              onClick={handleOpenCreateStory}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-purple-500/20 cursor-pointer transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Story</span>
            </button>
          </div>

          {/* Stories List */}
          {loading ? (
            <div className="p-8 text-center text-slate-400 text-xs animate-pulse">
              Loading Tech News stories...
            </div>
          ) : stories.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-slate-800 rounded-2xl space-y-3">
              <Newspaper className="w-8 h-8 text-purple-400 mx-auto" />
              <p className="text-sm font-bold text-white">No Stories Found</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No stories match your active filter. Click &ldquo;Create Story&rdquo; to publish a new 48-hour drop.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {stories.map((story) => {
                const hours = getHoursRemaining(story.visible_until, story.status);
                const isPublished = story.status === "published";
                const isExpired = hours.isExpired;

                return (
                  <div
                    key={story.id}
                    className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors"
                  >
                    <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                      {/* Cover Thumbnail */}
                      <div className="w-16 h-16 rounded-xl bg-slate-800 border border-slate-700/80 shrink-0 overflow-hidden relative flex items-center justify-center">
                        {story.cover_image_url ? (
                          <Image
                            src={story.cover_image_url}
                            alt={story.title}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <Newspaper className="w-6 h-6 text-slate-500" />
                        )}
                      </div>

                      {/* Meta Info */}
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-[10px] font-bold">
                            {story.source_name || story.source?.name || "Company"}
                          </span>

                          {/* Status Badge */}
                          {story.status === "published" && !isExpired && (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              <span>Live ({hours.text})</span>
                            </span>
                          )}

                          {story.status === "published" && isExpired && (
                            <span className="px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-bold">
                              48h Window Expired
                            </span>
                          )}

                          {story.status === "draft" && (
                            <span className="px-2 py-0.5 rounded-md bg-slate-700/50 text-slate-300 text-[10px] font-semibold">
                              Draft
                            </span>
                          )}

                          {story.status === "archived" && (
                            <span className="px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-300 text-[10px] font-semibold">
                              Archived
                            </span>
                          )}
                        </div>

                        <h4 className="text-sm font-bold text-white truncate">{story.title || story.headline}</h4>
                        <p className="text-xs text-slate-400 line-clamp-1">{story.summary}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      {/* Publish / Re-publish (starts 48h clock) */}
                      {story.status !== "published" || isExpired ? (
                        <button
                          onClick={() => handlePublishStory(story.id)}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                          title="Start 48-Hour student visibility window"
                        >
                          <Zap className="w-3 h-3" />
                          <span>Publish 48h</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleArchiveStory(story.id)}
                          className="px-2.5 py-1.5 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                          title="Archive story early"
                        >
                          <Archive className="w-3 h-3" />
                          <span>Archive</span>
                        </button>
                      )}

                      {/* Edit */}
                      <button
                        onClick={() => handleOpenEditStory(story)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                        title="Edit story"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => setDeleteConfirmStoryId(story.id)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/30 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                        title="Delete story"
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
      )}

      {/* ── TAB 2: SOURCES (COMPANIES) MANAGEMENT ── */}
      {activeTab === "sources" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search companies by name..."
                value={sourceSearch}
                onChange={(e) => setSourceSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <button
              onClick={handleOpenCreateSource}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-purple-500/20 cursor-pointer transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Company</span>
            </button>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-400 text-xs animate-pulse">
              Loading companies...
            </div>
          ) : sources.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-slate-800 rounded-2xl space-y-3">
              <Building className="w-8 h-8 text-purple-400 mx-auto" />
              <p className="text-sm font-bold text-white">No Companies Configured</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Add your first company publisher (e.g. OpenAI, Google, AWS, Vercel) to begin publishing stories.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {sources.map((src) => (
                <div
                  key={src.id}
                  className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 p-0.5 overflow-hidden flex items-center justify-center shrink-0">
                      {src.logo_url ? (
                        <Image
                          src={src.logo_url}
                          alt={src.name}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover rounded-lg"
                          unoptimized
                        />
                      ) : (
                        <Building className="w-5 h-5 text-slate-400" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-bold text-white truncate">{src.name}</h4>
                      <p className="text-[11px] text-slate-400">
                        {src.active_stories_count ?? 0} active 48h {src.active_stories_count === 1 ? "story" : "stories"}
                      </p>
                      {src.website_url && (
                        <a
                          href={src.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] text-purple-400 hover:underline mt-0.5"
                        >
                          <span>Website</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                    <span className="text-[10px] text-slate-500">Order: {src.display_order}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEditSource(src)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                        title="Edit company"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmSourceId(src.id)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/30 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                        title="Delete company"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── CREATE / EDIT SOURCE MODAL ── */}
      {isSourceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Building className="w-4 h-4 text-purple-400" />
                <span>{editingSourceId ? "Edit Company Source" : "Add Company Source"}</span>
              </h3>
              <button
                onClick={() => setIsSourceModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSource} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Company Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. OpenAI, Anthropic, Google DeepMind"
                  value={sourceForm.name}
                  onChange={(e) => setSourceForm({ ...sourceForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Website URL</label>
                <input
                  type="url"
                  placeholder="https://openai.com"
                  value={sourceForm.website_url}
                  onChange={(e) => setSourceForm({ ...sourceForm, website_url: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Company Logo</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="https://... logo image URL"
                    value={sourceForm.logo_url}
                    onChange={(e) => setSourceForm({ ...sourceForm, logo_url: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
                  />
                  <input
                    type="file"
                    ref={logoInputRef}
                    onChange={handleLogoUpload}
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    disabled={uploadingLogo}
                    className="px-3 py-2 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-300 font-bold hover:bg-purple-600/30 flex items-center gap-1 cursor-pointer"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>{uploadingLogo ? "Uploading..." : "Upload"}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Display Order</label>
                <input
                  type="number"
                  value={sourceForm.display_order}
                  onChange={(e) =>
                    setSourceForm({ ...sourceForm, display_order: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsSourceModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold disabled:opacity-50 cursor-pointer shadow-sm shadow-purple-600/20"
                >
                  {submitting ? "Saving..." : "Save Company"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── CREATE / EDIT STORY MODAL ── */}
      {isStoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Newspaper className="w-4 h-4 text-purple-400" />
                <span>{editingStoryId ? "Edit Tech News Story" : "Create Tech News Story (48h)"}</span>
              </h3>
              <button
                onClick={() => setIsStoryModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveStory} className="space-y-3.5 text-xs">
              {/* Company Selector */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Publishing Company *</label>
                <select
                  required
                  value={storyForm.source_id}
                  onChange={(e) => setStoryForm({ ...storyForm, source_id: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
                >
                  {sources.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Story Headline *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. OpenAI Announces GPT-5 Preview with Autonomous Reasoning"
                  value={storyForm.title}
                  onChange={(e) => setStoryForm({ ...storyForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Summary */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Summary (Displayed on Story Card) *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Concise 1-2 sentence executive breakdown of the architectural release..."
                  value={storyForm.summary}
                  onChange={(e) => setStoryForm({ ...storyForm, summary: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Full Article Content (Detail Page) *
                </label>
                <textarea
                  rows={5}
                  required
                  placeholder="Full technical article, architecture breakdowns, engineering impact..."
                  value={storyForm.content}
                  onChange={(e) => setStoryForm({ ...storyForm, content: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-purple-500 font-mono text-[11px]"
                />
              </div>

              {/* Cover Banner */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Story Cover Image</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="https://... cover banner URL"
                    value={storyForm.cover_image_url}
                    onChange={(e) => setStoryForm({ ...storyForm, cover_image_url: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
                  />
                  <input
                    type="file"
                    ref={coverInputRef}
                    onChange={handleCoverUpload}
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => coverInputRef.current?.click()}
                    disabled={uploadingCover}
                    className="px-3 py-2 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-300 font-bold hover:bg-purple-600/30 flex items-center gap-1 cursor-pointer"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>{uploadingCover ? "Uploading..." : "Upload"}</span>
                  </button>
                </div>
              </div>

              {/* Source Original URL */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Original Source URL *</label>
                <input
                  type="url"
                  required
                  placeholder="https://openai.com/index/gpt-5"
                  value={storyForm.source_url}
                  onChange={(e) => setStoryForm({ ...storyForm, source_url: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Initial Status</label>
                <select
                  value={storyForm.status}
                  onChange={(e) =>
                    setStoryForm({ ...storyForm, status: e.target.value as TechNewsStatus })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="draft">Draft (Save without publishing)</option>
                  <option value="published">Published (Start 48-Hour Live Window Immediately)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsStoryModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold disabled:opacity-50 cursor-pointer shadow-sm shadow-purple-600/20"
                >
                  {submitting ? "Saving..." : "Save Story"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── CONFIRM DELETE SOURCE DIALOG ── */}
      {deleteConfirmSourceId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-white">Delete Company Publisher?</h4>
            <p className="text-xs text-slate-400">
              This will permanently delete this company and all its associated stories from the platform.
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmSourceId(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteSource(deleteConfirmSourceId)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CONFIRM DELETE STORY DIALOG ── */}
      {deleteConfirmStoryId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-white">Delete Tech News Story?</h4>
            <p className="text-xs text-slate-400">
              This will permanently delete this story from the database and remove it from student feeds.
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmStoryId(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteStory(deleteConfirmStoryId)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
