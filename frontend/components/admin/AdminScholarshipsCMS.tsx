"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import {
  GraduationCap,
  Plus,
  Edit3,
  Trash2,
  Calendar,
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
  Building,
  Award,
  BookOpen,
  Check,
} from "lucide-react";
import type { ScholarshipItem, CreateScholarshipPayload, ScholarshipStatus } from "@/types/scholarships";
import {
  fetchAdminScholarships,
  createAdminScholarship,
  updateAdminScholarship,
  publishAdminScholarship,
  archiveAdminScholarship,
  deleteAdminScholarship,
  uploadScholarshipImage,
} from "@/lib/api/scholarships";

interface AdminScholarshipsCMSProps {
  onScholarshipCountChange?: () => void;
}

interface ScholarshipFormState {
  name: string;
  provided_by: string;
  qualification_required: string;
  eligibility: string;
  requirements: string;
  application_url: string;
  image_url: string;
  status: ScholarshipStatus;
  visible_from: string;
  visible_until: string;
}

const INITIAL_FORM_STATE: ScholarshipFormState = {
  name: "",
  provided_by: "",
  qualification_required: "",
  eligibility: "",
  requirements: "",
  application_url: "",
  image_url: "",
  status: "draft",
  visible_from: "",
  visible_until: "",
};

export default function AdminScholarshipsCMS({ onScholarshipCountChange }: AdminScholarshipsCMSProps) {
  const [scholarships, setScholarships] = useState<ScholarshipItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filter state
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingScholarshipId, setEditingScholarshipId] = useState<string | null>(null);
  const [form, setForm] = useState<ScholarshipFormState>(INITIAL_FORM_STATE);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Confirm delete dialog state
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load scholarships
  const loadScholarships = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetchAdminScholarships({
        status: statusFilter !== "all" ? statusFilter : undefined,
        search: searchQuery.trim() || undefined,
      });
      setScholarships(res.scholarships || []);
      if (onScholarshipCountChange) onScholarshipCountChange();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load scholarships.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchQuery, onScholarshipCountChange]);

  useEffect(() => {
    loadScholarships();
  }, [loadScholarships]);

  // Open create modal
  const handleOpenCreate = () => {
    setEditingScholarshipId(null);
    setForm(INITIAL_FORM_STATE);
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Open edit modal
  const handleOpenEdit = (item: ScholarshipItem) => {
    setEditingScholarshipId(item.id);
    setForm({
      name: item.name || "",
      provided_by: item.provided_by || "",
      qualification_required: item.qualification_required || "",
      eligibility: item.eligibility || "",
      requirements: item.requirements || "",
      application_url: item.application_url || "",
      image_url: item.image_url || "",
      status: item.status || "draft",
      visible_from: item.visible_from ? item.visible_from.substring(0, 16) : "",
      visible_until: item.visible_until ? item.visible_until.substring(0, 16) : "",
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Validate form before submit
  const validateForm = (): boolean => {
    const errs: Record<string, string> = {};

    if (!form.name.trim()) {
      errs.name = "Scholarship Name is required.";
    }
    if (!form.provided_by.trim()) {
      errs.provided_by = "Provider name is required.";
    }
    if (!form.qualification_required.trim()) {
      errs.qualification_required = "Qualification required is required.";
    }
    if (!form.eligibility.trim()) {
      errs.eligibility = "Eligibility criteria are required.";
    }
    if (!form.requirements.trim()) {
      errs.requirements = "Requirements/documents are required.";
    }
    if (!form.application_url.trim()) {
      errs.application_url = "Application Link is required.";
    } else if (!/^https?:\/\/.+/i.test(form.application_url.trim())) {
      errs.application_url = "Must be a valid URL starting with http:// or https://";
    }

    if (form.visible_from && form.visible_until) {
      const fromDt = new Date(form.visible_from);
      const untilDt = new Date(form.visible_until);
      if (untilDt <= fromDt) {
        errs.visible_until = "Visible Until must be after Visible From.";
      }
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Submit create or edit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const payload: CreateScholarshipPayload = {
        name: form.name.trim(),
        provided_by: form.provided_by.trim(),
        qualification_required: form.qualification_required.trim(),
        eligibility: form.eligibility.trim(),
        requirements: form.requirements.trim(),
        application_url: form.application_url.trim(),
        image_url: form.image_url.trim() || null,
        status: form.status,
        visible_from: form.visible_from ? new Date(form.visible_from).toISOString() : undefined,
        visible_until: form.visible_until ? new Date(form.visible_until).toISOString() : undefined,
      };

      if (editingScholarshipId) {
        await updateAdminScholarship(editingScholarshipId, payload);
        setSuccessMsg(`Scholarship "${form.name}" updated successfully.`);
      } else {
        await createAdminScholarship(payload);
        setSuccessMsg(`Scholarship "${form.name}" created successfully.`);
      }

      setIsModalOpen(false);
      await loadScholarships();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save scholarship.";
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Image Upload handler via Supabase Storage
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setFormErrors((prev) => ({ ...prev, image_url: "File size exceeds 5MB limit." }));
      return;
    }

    // Validate type
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setFormErrors((prev) => ({ ...prev, image_url: "Allowed formats: JPG, PNG, WebP." }));
      return;
    }

    setUploadingImage(true);
    setFormErrors((prev) => {
      const next = { ...prev };
      delete next.image_url;
      return next;
    });

    try {
      const res = await uploadScholarshipImage(file, editingScholarshipId || undefined);
      if (res.image_url) {
        setForm((prev) => ({ ...prev, image_url: res.image_url }));
        setSuccessMsg("Image uploaded successfully to Supabase Storage.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Image upload failed.";
      setFormErrors((prev) => ({ ...prev, image_url: msg }));
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Quick Action: Publish
  const handlePublish = async (item: ScholarshipItem) => {
    try {
      await publishAdminScholarship(item.id);
      setSuccessMsg(`"${item.name}" published successfully.`);
      await loadScholarships();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to publish.";
      setErrorMsg(msg);
    }
  };

  // Quick Action: Archive
  const handleArchive = async (item: ScholarshipItem) => {
    try {
      await archiveAdminScholarship(item.id);
      setSuccessMsg(`"${item.name}" archived.`);
      await loadScholarships();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to archive.";
      setErrorMsg(msg);
    }
  };

  // Quick Action: Delete
  const handleDelete = async (id: string) => {
    try {
      await deleteAdminScholarship(id);
      setSuccessMsg("Scholarship deleted permanently.");
      setDeleteConfirmId(null);
      await loadScholarships();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete.";
      setErrorMsg(msg);
    }
  };

  const getStatusBadge = (status: ScholarshipStatus) => {
    switch (status) {
      case "published":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" />
            Published
          </span>
        );
      case "archived":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-700/50 text-slate-400 border border-slate-600/40">
            <Archive className="w-3 h-3" />
            Archived
          </span>
        );
      case "draft":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Clock className="w-3 h-3" />
            Draft
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Top Bar / Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Award className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">Scholarships CMS</h3>
            <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {scholarships.length} Registered
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Create, publish, and manage verified student tech grants and scholarship opportunities.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/30 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Scholarship</span>
        </button>
      </div>

      {/* ── Alerts ── */}
      {errorMsg && (
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button type="button" onClick={() => setErrorMsg(null)} className="text-rose-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button type="button" onClick={() => setSuccessMsg(null)} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Filter Bar ── */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-slate-900/60 border border-slate-800/80 rounded-xl p-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by scholarship name or provider..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 self-start md:self-auto overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { id: "all", label: "All" },
            { id: "published", label: "Published" },
            { id: "draft", label: "Drafts" },
            { id: "archived", label: "Archived" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === tab.id
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table / List View ── */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-2xl bg-slate-800/50 animate-pulse border border-slate-800" />
          ))}
        </div>
      ) : scholarships.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-slate-800 rounded-2xl space-y-3 bg-slate-900/30">
          <Award className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-sm font-semibold text-slate-400">No scholarships found.</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery ? "Try refining your search keyword." : "Click 'New Scholarship' above to create your first listing."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {scholarships.map((item) => (
            <div
              key={item.id}
              className="bg-slate-900/80 border border-slate-800 hover:border-slate-700/90 rounded-2xl p-4 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm"
            >
              {/* Left: Thumbnail & Main Info */}
              <div className="flex items-start gap-3.5">
                {item.image_url ? (
                  <div className="w-16 h-16 rounded-xl overflow-hidden relative shrink-0 border border-slate-700/60 bg-slate-800">
                    <Image
                      src={item.image_url}
                      alt={item.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-slate-800 border border-slate-700/60 flex items-center justify-center text-indigo-400 shrink-0">
                    <GraduationCap className="w-7 h-7" />
                  </div>
                )}

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-bold text-white text-sm hover:text-indigo-400 transition-colors">
                      {item.name}
                    </h4>
                    {getStatusBadge(item.status)}
                  </div>

                  <p className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>{item.provided_by}</span>
                    <span className="text-slate-600">·</span>
                    <BookOpen className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-slate-300 font-semibold">{item.qualification_required}</span>
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-0.5">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>
                        Visible from: {item.visible_from ? new Date(item.visible_from).toLocaleDateString() : "Immediate"}
                      </span>
                    </span>

                    {item.visible_until && (
                      <span className="flex items-center gap-1 text-amber-400/80 font-medium">
                        <Clock className="w-3 h-3" />
                        <span>Expires: {new Date(item.visible_until).toLocaleDateString()}</span>
                      </span>
                    )}

                    <a
                      href={item.application_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold underline decoration-indigo-500/40"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Application Portal</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-1.5 self-end md:self-center shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800/80 w-full md:w-auto justify-end">
                {item.status !== "published" && (
                  <button
                    type="button"
                    title="Publish Scholarship"
                    onClick={() => handlePublish(item)}
                    className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span className="text-[11px]">Publish</span>
                  </button>
                )}

                {item.status !== "archived" && (
                  <button
                    type="button"
                    title="Archive Scholarship"
                    onClick={() => handleArchive(item)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-slate-400 hover:text-slate-200 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Archive className="w-3.5 h-3.5" />
                    <span className="text-[11px]">Archive</span>
                  </button>
                )}

                <button
                  type="button"
                  title="Edit Scholarship"
                  onClick={() => handleOpenEdit(item)}
                  className="p-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span className="text-[11px]">Edit</span>
                </button>

                <button
                  type="button"
                  title="Delete Scholarship"
                  onClick={() => setDeleteConfirmId(item.id)}
                  className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── CREATE / EDIT MODAL ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/80 sticky top-0 z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Award className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-base text-white">
                  {editingScholarshipId ? "Edit Scholarship" : "Create New Scholarship"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
              {/* Field 1: Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Scholarship Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Google Generation Scholarship 2026"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={`w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border text-xs text-white placeholder-slate-500 focus:outline-none ${
                    formErrors.name ? "border-rose-500" : "border-slate-700/80 focus:border-indigo-500"
                  }`}
                />
                {formErrors.name && <p className="text-[11px] text-rose-400">{formErrors.name}</p>}
              </div>

              {/* Field 2 & 3: Provided By & Qualification Required */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Scholarship Provided By *</label>
                  <input
                    type="text"
                    placeholder="e.g. Google & AnitaB.org"
                    value={form.provided_by}
                    onChange={(e) => setForm({ ...form, provided_by: e.target.value })}
                    className={`w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border text-xs text-white placeholder-slate-500 focus:outline-none ${
                      formErrors.provided_by ? "border-rose-500" : "border-slate-700/80 focus:border-indigo-500"
                    }`}
                  />
                  {formErrors.provided_by && (
                    <p className="text-[11px] text-rose-400">{formErrors.provided_by}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Qualification Required *</label>
                  <input
                    type="text"
                    placeholder="e.g. B.Tech / BE Computer Science (2nd or 3rd Year)"
                    value={form.qualification_required}
                    onChange={(e) => setForm({ ...form, qualification_required: e.target.value })}
                    className={`w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border text-xs text-white placeholder-slate-500 focus:outline-none ${
                      formErrors.qualification_required
                        ? "border-rose-500"
                        : "border-slate-700/80 focus:border-indigo-500"
                    }`}
                  />
                  {formErrors.qualification_required && (
                    <p className="text-[11px] text-rose-400">{formErrors.qualification_required}</p>
                  )}
                </div>
              </div>

              {/* Field 4: Eligibility */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Eligibility *</label>
                <textarea
                  rows={3}
                  placeholder="Specify academic standing, background, geographic requirements, or prerequisite skills..."
                  value={form.eligibility}
                  onChange={(e) => setForm({ ...form, eligibility: e.target.value })}
                  className={`w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border text-xs text-white placeholder-slate-500 focus:outline-none ${
                    formErrors.eligibility ? "border-rose-500" : "border-slate-700/80 focus:border-indigo-500"
                  }`}
                />
                {formErrors.eligibility && (
                  <p className="text-[11px] text-rose-400">{formErrors.eligibility}</p>
                )}
              </div>

              {/* Field 5: Requirements */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Requirements *</label>
                <textarea
                  rows={3}
                  placeholder="List required documents: e.g. Resume, Academic Transcript, Statement of Purpose (SOP), GitHub profile..."
                  value={form.requirements}
                  onChange={(e) => setForm({ ...form, requirements: e.target.value })}
                  className={`w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border text-xs text-white placeholder-slate-500 focus:outline-none ${
                    formErrors.requirements ? "border-rose-500" : "border-slate-700/80 focus:border-indigo-500"
                  }`}
                />
                {formErrors.requirements && (
                  <p className="text-[11px] text-rose-400">{formErrors.requirements}</p>
                )}
              </div>

              {/* Field 6: Link (Application URL) */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Official Link *</label>
                <input
                  type="url"
                  placeholder="https://buildyourfuture.withgoogle.com/scholarships/..."
                  value={form.application_url}
                  onChange={(e) => setForm({ ...form, application_url: e.target.value })}
                  className={`w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border text-xs text-white placeholder-slate-500 focus:outline-none ${
                    formErrors.application_url ? "border-rose-500" : "border-slate-700/80 focus:border-indigo-500"
                  }`}
                />
                {formErrors.application_url && (
                  <p className="text-[11px] text-rose-400">{formErrors.application_url}</p>
                )}
              </div>

              {/* Field 7: Photo / Image with Supabase Storage Uploader */}
              <div className="space-y-2 p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/60">
                <label className="text-xs font-bold text-slate-300 block">
                  Photo / Banner Image
                </label>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {form.image_url ? (
                    <div className="w-24 h-24 rounded-xl overflow-hidden relative shrink-0 border border-slate-700 bg-slate-800">
                      <Image
                        src={form.image_url}
                        alt="Banner Preview"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, image_url: "" })}
                        className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white hover:bg-black/80"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-xl bg-slate-800 border border-dashed border-slate-700 flex flex-col items-center justify-center text-slate-500 text-[10px] shrink-0">
                      <GraduationCap className="w-6 h-6 mb-1 text-slate-400" />
                      <span>No image</span>
                    </div>
                  )}

                  <div className="space-y-1.5 flex-1 w-full">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageFileChange}
                      className="hidden"
                      id="scholarship-image-file"
                    />

                    <div className="flex items-center gap-2">
                      <label
                        htmlFor="scholarship-image-file"
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer select-none ${
                          uploadingImage
                            ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                            : "bg-indigo-600 hover:bg-indigo-500 text-white"
                        }`}
                      >
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>{uploadingImage ? "Uploading..." : "Upload to Supabase Storage"}</span>
                      </label>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Max file size: 5MB. Formats: JPG, PNG, WebP. Stored in Supabase bucket <code className="text-indigo-300">scholarship-banners</code>.
                    </p>
                    {formErrors.image_url && (
                      <p className="text-[11px] text-rose-400 font-semibold">{formErrors.image_url}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Visibility & Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Visible From (Server Time)</label>
                  <input
                    type="datetime-local"
                    value={form.visible_from}
                    onChange={(e) => setForm({ ...form, visible_from: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                  <p className="text-[10px] text-slate-500">Defaults to now if left empty.</p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Visible Until (Expiration)</label>
                  <input
                    type="datetime-local"
                    value={form.visible_until}
                    onChange={(e) => setForm({ ...form, visible_until: e.target.value })}
                    className={`w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border text-xs text-white focus:outline-none ${
                      formErrors.visible_until
                        ? "border-rose-500"
                        : "border-slate-700/80 focus:border-indigo-500"
                    }`}
                  />
                  {formErrors.visible_until ? (
                    <p className="text-[11px] text-rose-400">{formErrors.visible_until}</p>
                  ) : (
                    <p className="text-[10px] text-slate-500">Optional. If unset, visible indefinitely until archived.</p>
                  )}
                </div>
              </div>

              {/* Status Selector */}
              <div className="space-y-1 pt-1">
                <label className="text-xs font-bold text-slate-300">Publication Status</label>
                <div className="flex items-center gap-3">
                  {[
                    { id: "draft", label: "Draft (Hidden from students)" },
                    { id: "published", label: "Published (Live to students)" },
                    { id: "archived", label: "Archived" },
                  ].map((st) => (
                    <label
                      key={st.id}
                      className="flex items-center gap-2 cursor-pointer text-xs text-slate-300"
                    >
                      <input
                        type="radio"
                        name="scholarship-status"
                        value={st.id}
                        checked={form.status === st.id}
                        onChange={() => setForm({ ...form, status: st.id as ScholarshipStatus })}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>{st.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting || uploadingImage}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition-all flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
                >
                  {submitting ? (
                    <span>Saving...</span>
                  ) : (
                    <span>{editingScholarshipId ? "Save Changes" : "Create Scholarship"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRMATION MODAL ── */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-white">Permanently Delete?</h4>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Are you sure you want to delete this scholarship? This action is permanent and cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-slate-400 hover:text-white bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-md shadow-rose-900/30"
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
