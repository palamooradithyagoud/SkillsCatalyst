"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import {
  Trophy,
  Plus,
  Edit3,
  Trash2,
  Calendar,
  MapPin,
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
  Users,
  Award,
  Globe,
  Check,
} from "lucide-react";
import type { EventItem, CreateEventPayload, EventCategory, EventMode, EventStatus } from "@/types/events";
import {
  fetchAdminEvents,
  createAdminEvent,
  updateAdminEvent,
  publishAdminEvent,
  archiveAdminEvent,
  deleteAdminEvent,
  uploadEventBanner,
} from "@/lib/api/events";

interface AdminEventsCMSProps {
  onEventCountChange?: () => void;
}

interface FormState {
  event_name: string;
  conducted_by_college: string;
  event_link: string;
  registration_deadline: string;
  start_date: string;
  end_date: string;
  category: EventCategory;
  location: string;
  banner_url: string;
  description: string;
  is_hackathon: boolean;
  prize_pool: string;
  team_size: string;
  mode: EventMode;
  visible_from: string;
  visible_until: string;
}

const INITIAL_FORM_STATE: FormState = {
  event_name: "",
  conducted_by_college: "",
  event_link: "",
  registration_deadline: "",
  start_date: "",
  end_date: "",
  category: "offline",
  location: "",
  banner_url: "",
  description: "",
  is_hackathon: false,
  prize_pool: "",
  team_size: "",
  mode: "offline",
  visible_from: "",
  visible_until: "",
};

export default function AdminEventsCMS({ onEventCountChange }: AdminEventsCMSProps) {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filter state
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(INITIAL_FORM_STATE);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // File input ref
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load events
  const loadEvents = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetchAdminEvents({
        status: statusFilter !== "all" ? statusFilter : undefined,
        search: searchQuery.trim() || undefined,
      });
      setEvents(res.events || []);
      if (onEventCountChange) onEventCountChange();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load events.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchQuery, onEventCountChange]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // Open create modal
  const handleOpenCreate = () => {
    setEditingEventId(null);
    setForm(INITIAL_FORM_STATE);
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Open edit modal
  const handleOpenEdit = (event: EventItem) => {
    setEditingEventId(event.id);
    setForm({
      event_name: event.event_name || "",
      conducted_by_college: event.conducted_by_college || "",
      event_link: event.event_link || "",
      registration_deadline: event.registration_deadline ? event.registration_deadline.substring(0, 10) : "",
      start_date: event.start_date ? event.start_date.substring(0, 10) : "",
      end_date: event.end_date ? event.end_date.substring(0, 10) : "",
      category: event.category || "offline",
      location: event.location || "",
      banner_url: event.banner_url || "",
      description: event.description || "",
      is_hackathon: !!event.is_hackathon,
      prize_pool: event.prize_pool || "",
      team_size: event.team_size || "",
      mode: event.mode || "offline",
      visible_from: event.visible_from ? event.visible_from.substring(0, 10) : "",
      visible_until: event.visible_until ? event.visible_until.substring(0, 10) : "",
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Upload poster image
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setFormErrors((prev) => ({ ...prev, banner_url: "File exceeds 5MB size limit." }));
      return;
    }

    setUploadingImage(true);
    setFormErrors((prev) => {
      const copy = { ...prev };
      delete copy.banner_url;
      return copy;
    });

    try {
      const res = await uploadEventBanner(file);
      setForm((prev) => ({ ...prev, banner_url: res.banner_url }));
      setSuccessMsg("Banner image uploaded successfully.");
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to upload image.";
      setFormErrors((prev) => ({ ...prev, banner_url: msg }));
    } finally {
      setUploadingImage(false);
    }
  };

  // Form validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!form.event_name.trim()) errors.event_name = "Event Name is required.";
    if (!form.conducted_by_college.trim()) errors.conducted_by_college = "Host college / organization is required.";
    if (!form.event_link.trim()) {
      errors.event_link = "Event link is required.";
    } else if (!form.event_link.startsWith("http://") && !form.event_link.startsWith("https://")) {
      errors.event_link = "Event link must start with https:// or http://";
    }

    // registration_deadline is optional
    if (!form.start_date) errors.start_date = "Start date is required.";
    if (!form.end_date) errors.end_date = "End date is required.";

    if (form.start_date && form.end_date) {
      if (form.end_date < form.start_date) {
        errors.end_date = "End date must be on or after start date.";
      }
    }

    if (form.visible_from && form.visible_until) {
      if (form.visible_until <= form.visible_from) {
        errors.visible_until = "Visible Until date must be after Visible From date.";
      }
    }

    if (!form.banner_url.trim()) {
      errors.banner_url = "Banner / poster image is required.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Save event (Draft or Published)
  const handleSave = async (targetStatus: EventStatus) => {
    if (!validateForm()) return;

    setSubmitting(true);
    setErrorMsg(null);

    const payload: CreateEventPayload = {
      event_name: form.event_name.trim(),
      conducted_by_college: form.conducted_by_college.trim(),
      event_link: form.event_link.trim(),
      registration_deadline: form.registration_deadline ? `${form.registration_deadline}T23:59:59Z` : null,
      start_date: `${form.start_date}T00:00:00Z`,
      end_date: `${form.end_date}T23:59:59Z`,
      category: form.category,
      banner_url: form.banner_url.trim(),
      location: form.location.trim() || null,
      description: form.description.trim() || null,
      is_hackathon: form.is_hackathon,
      prize_pool: form.is_hackathon && form.prize_pool.trim() ? form.prize_pool.trim() : null,
      team_size: form.is_hackathon && form.team_size.trim() ? form.team_size.trim() : null,
      mode: form.is_hackathon ? form.mode : null,
      status: targetStatus,
      visible_from: form.visible_from ? `${form.visible_from}T00:00:00Z` : null,
      visible_until: form.visible_until ? `${form.visible_until}T23:59:59Z` : null,
    };

    try {
      if (editingEventId) {
        await updateAdminEvent(editingEventId, payload);
        setSuccessMsg(`Event "${form.event_name}" updated successfully.`);
      } else {
        await createAdminEvent(payload);
        setSuccessMsg(`Event "${form.event_name}" created successfully as ${targetStatus}.`);
      }
      setIsModalOpen(false);
      loadEvents();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save event.";
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Quick action handlers
  const handlePublish = async (id: string, name: string) => {
    try {
      await publishAdminEvent(id);
      setSuccessMsg(`"${name}" is now Published and live for students.`);
      loadEvents();
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to publish event.";
      setErrorMsg(msg);
    }
  };

  const handleArchive = async (id: string, name: string) => {
    try {
      await archiveAdminEvent(id);
      setSuccessMsg(`"${name}" has been Archived.`);
      loadEvents();
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to archive event.";
      setErrorMsg(msg);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${name}"? This action cannot be undone.`)) {
      return;
    }
    try {
      await deleteAdminEvent(id);
      setSuccessMsg(`"${name}" deleted successfully.`);
      loadEvents();
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete event.";
      setErrorMsg(msg);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Notification Banners ── */}
      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-800/60 text-emerald-300 text-xs font-semibold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-400 hover:text-emerald-200">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-800/60 text-rose-300 text-xs font-semibold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-rose-400 hover:text-rose-200">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ── Top Header & Action Controls ── */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-indigo-400" />
              <span>Events &amp; Hackathons Management</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Create, publish, and manage verified events and hackathons displayed to students.
            </p>
          </div>

          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-purple-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Event / Hackathon</span>
          </button>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2 border-t border-slate-800">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {[
              { id: "all", label: "All Items" },
              { id: "published", label: "Published" },
              { id: "draft", label: "Drafts" },
              { id: "archived", label: "Archived" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 cursor-pointer ${
                  statusFilter === f.id
                    ? "bg-purple-600 text-white shadow-xs"
                    : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by event or college..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-xs placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>
      </div>

      {/* ── Events List Catalog ── */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs font-semibold bg-slate-900/60 border border-slate-800 rounded-2xl">
          Loading events catalog...
        </div>
      ) : events.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/60 border border-dashed border-slate-800 rounded-2xl space-y-3">
          <Trophy className="w-10 h-10 text-slate-600 mx-auto" />
          <div>
            <p className="text-sm font-bold text-slate-300">No events found</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {statusFilter !== "all"
                ? `No events matching filter '${statusFilter}'.`
                : "No events or hackathons created yet. Click 'Create Event / Hackathon' above to add your first listing."}
            </p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create First Event</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {events.map((ev) => {
            const isPub = ev.status === "published";
            const isDraft = ev.status === "draft";
            const isArch = ev.status === "archived";

            // Visibility badge calculation
            let visText = "Always visible";
            if (ev.visible_from && ev.visible_until) {
              visText = `${new Date(ev.visible_from).toLocaleDateString()} – ${new Date(ev.visible_until).toLocaleDateString()}`;
            } else if (ev.visible_until) {
              visText = `Until ${new Date(ev.visible_until).toLocaleDateString()}`;
            } else if (ev.visible_from) {
              visText = `From ${new Date(ev.visible_from).toLocaleDateString()}`;
            }

            return (
              <div
                key={ev.id}
                className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm"
              >
                {/* Left: Thumbnail & Core Details */}
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <div className="relative w-20 h-16 sm:w-28 sm:h-20 rounded-xl overflow-hidden bg-slate-800 shrink-0 border border-slate-700/80">
                    {ev.banner_url ? (
                      <Image
                        src={ev.banner_url}
                        alt={ev.event_name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-600">
                        <Trophy className="w-6 h-6" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-white truncate max-w-md">
                        {ev.event_name}
                      </h4>
                      {ev.is_hackathon ? (
                        <span className="px-2 py-0.5 text-[10px] font-black rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Hackathon
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          Event
                        </span>
                      )}
                      <span
                        className={`px-2 py-0.5 text-[10px] font-extrabold uppercase rounded-full tracking-wider ${
                          isPub
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : isDraft
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            : "bg-slate-800 text-slate-400 border border-slate-700"
                        }`}
                      >
                        {ev.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 font-medium truncate">
                      {ev.conducted_by_college} {ev.location ? `• ${ev.location}` : ""}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400 pt-0.5">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-purple-400" />
                        <span>Start: {new Date(ev.start_date).toLocaleDateString()}</span>
                      </span>
                      {ev.registration_deadline && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-400" />
                          <span>Deadline: {new Date(ev.registration_deadline).toLocaleDateString()}</span>
                        </span>
                      )}
                      {ev.is_hackathon && ev.prize_pool && (
                        <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                          <Award className="w-3 h-3" />
                          <span>Prize: {ev.prize_pool}</span>
                        </span>
                      )}
                      <span className="text-slate-500 text-[10px]">
                        Visibility: {visText}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <a
                    href={ev.event_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
                    title="Open Registration Link"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    onClick={() => handleOpenEdit(ev)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-purple-950/40 text-slate-400 hover:text-purple-300 transition-colors cursor-pointer"
                    title="Edit Event"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  {!isPub && (
                    <button
                      onClick={() => handlePublish(ev.id, ev.event_name)}
                      className="px-2.5 py-1.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-400 border border-emerald-800/40 text-xs font-bold transition-colors cursor-pointer"
                      title="Publish to Students"
                    >
                      Publish
                    </button>
                  )}

                  {isPub && (
                    <button
                      onClick={() => handleArchive(ev.id, ev.event_name)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-amber-950/40 text-slate-400 hover:text-amber-300 transition-colors cursor-pointer"
                      title="Archive Event"
                    >
                      <Archive className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(ev.id, ev.event_name)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                    title="Delete Event"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── CREATE / EDIT EVENT MODAL ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-5 sm:p-7 text-slate-200 my-8 space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-purple-400" />
                  <span>{editingEventId ? "Edit Event / Hackathon" : "Create Event / Hackathon"}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Fields marked with * are required.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Body */}
            <div className="space-y-5 max-h-[72vh] overflow-y-auto pr-1">
              {/* SECTION 1: EVENT INFORMATION */}
              <div className="space-y-3.5">
                <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                  1. Event Information
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Event Name */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Event Name *</label>
                    <input
                      type="text"
                      value={form.event_name}
                      onChange={(e) => setForm({ ...form, event_name: e.target.value })}
                      placeholder="e.g. Google x College Hackathon"
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                    />
                    {formErrors.event_name && <p className="text-[11px] text-rose-400">{formErrors.event_name}</p>}
                  </div>

                  {/* Conducted By College */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Conducted By College *</label>
                    <input
                      type="text"
                      value={form.conducted_by_college}
                      onChange={(e) => setForm({ ...form, conducted_by_college: e.target.value })}
                      placeholder="e.g. ABC Engineering College"
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                    />
                    {formErrors.conducted_by_college && <p className="text-[11px] text-rose-400">{formErrors.conducted_by_college}</p>}
                  </div>

                  {/* Event Link */}
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Event Registration Link *</label>
                    <input
                      type="url"
                      value={form.event_link}
                      onChange={(e) => setForm({ ...form, event_link: e.target.value })}
                      placeholder="https://example.com/register"
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                    />
                    {formErrors.event_link && <p className="text-[11px] text-rose-400">{formErrors.event_link}</p>}
                  </div>

                  {/* Last Date for Registration */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Last Date for Registration (Optional)</label>
                    <input
                      type="date"
                      value={form.registration_deadline}
                      onChange={(e) => setForm({ ...form, registration_deadline: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-purple-500 [color-scheme:dark]"
                    />
                    {formErrors.registration_deadline && <p className="text-[11px] text-rose-400">{formErrors.registration_deadline}</p>}
                  </div>

                  {/* Category */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Category *</label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value as EventCategory })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-purple-500"
                    >
                      <option value="offline">Offline (In-Person)</option>
                      <option value="online">Online (Virtual)</option>
                    </select>
                  </div>

                  {/* Start Date */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Start Date *</label>
                    <input
                      type="date"
                      value={form.start_date}
                      onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-purple-500 [color-scheme:dark]"
                    />
                    {formErrors.start_date && <p className="text-[11px] text-rose-400">{formErrors.start_date}</p>}
                  </div>

                  {/* End Date */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">End Date *</label>
                    <input
                      type="date"
                      value={form.end_date}
                      onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-purple-500 [color-scheme:dark]"
                    />
                    {formErrors.end_date && <p className="text-[11px] text-rose-400">{formErrors.end_date}</p>}
                  </div>

                  {/* Location */}
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs font-semibold text-slate-300">
                      Location {form.category === "offline" ? "(Required for Offline)" : "(Optional for Online)"}
                    </label>
                    <input
                      type="text"
                      value={form.location}
                      onChange={(e) => setForm({ ...form, location: e.target.value })}
                      placeholder="e.g. Visakhapatnam, Andhra Pradesh"
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  {/* Banner / Poster Image Upload */}
                  <div className="sm:col-span-2 space-y-2">
                    <label className="text-xs font-semibold text-slate-300">Banner / Poster Image *</label>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/png,image/jpeg,image/webp,image/gif"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingImage}
                        className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                      >
                        <UploadCloud className="w-3.5 h-3.5 text-purple-400" />
                        <span>{uploadingImage ? "Uploading Image..." : "Upload Poster"}</span>
                      </button>

                      <span className="text-xs text-slate-500">or paste URL:</span>

                      <input
                        type="text"
                        value={form.banner_url}
                        onChange={(e) => setForm({ ...form, banner_url: e.target.value })}
                        placeholder="https://... or /images/events/..."
                        className="flex-1 w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    {formErrors.banner_url && <p className="text-[11px] text-rose-400">{formErrors.banner_url}</p>}

                    {/* Banner Image Preview */}
                    {form.banner_url && (
                      <div className="relative w-full h-32 rounded-xl overflow-hidden bg-slate-800 border border-slate-700 mt-2">
                        <Image
                          src={form.banner_url}
                          alt="Banner Preview"
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Description (Optional)</label>
                    <textarea
                      rows={3}
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Build innovative solutions for real-world campus problems..."
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-purple-500 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: HACKATHON SETTINGS */}
              <div className="space-y-3.5 pt-3 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                      2. Hackathon Details
                    </h4>
                    <p className="text-[11px] text-slate-400">Enable if this event is a competitive hackathon or coding challenge.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.is_hackathon}
                      onChange={(e) => setForm({ ...form, is_hackathon: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>

                {form.is_hackathon && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 animate-in fade-in">
                    {/* Prize Pool */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-300">Prize Pool</label>
                      <input
                        type="text"
                        value={form.prize_pool}
                        onChange={(e) => setForm({ ...form, prize_pool: e.target.value })}
                        placeholder="e.g. ₹1,00,000"
                        className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    {/* Team Size */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-300">Team Size</label>
                      <input
                        type="text"
                        value={form.team_size}
                        onChange={(e) => setForm({ ...form, team_size: e.target.value })}
                        placeholder="e.g. 2-4 Members"
                        className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    {/* Mode */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-300">Mode</label>
                      <select
                        value={form.mode}
                        onChange={(e) => setForm({ ...form, mode: e.target.value as EventMode })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-purple-500"
                      >
                        <option value="offline">Offline</option>
                        <option value="online">Online</option>
                        <option value="hybrid">Hybrid</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 3: VISIBILITY WINDOW */}
              <div className="space-y-3.5 pt-3 border-t border-slate-800">
                <div>
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    3. Visibility &amp; Expiration Window
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Define when this event automatically appears and expires from student listings.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Visible From */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Visible From (Optional)</label>
                    <input
                      type="date"
                      value={form.visible_from}
                      onChange={(e) => setForm({ ...form, visible_from: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-purple-500 [color-scheme:dark]"
                    />
                    <span className="text-[10px] text-slate-500">Leave blank to make visible immediately upon publish.</span>
                  </div>

                  {/* Visible Until */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Visible Until (Optional)</label>
                    <input
                      type="date"
                      value={form.visible_until}
                      onChange={(e) => setForm({ ...form, visible_until: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-purple-500 [color-scheme:dark]"
                    />
                    <span className="text-[10px] text-slate-500">Event automatically disappears after this date.</span>
                    {formErrors.visible_until && <p className="text-[11px] text-rose-400">{formErrors.visible_until}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => handleSave("draft")}
                disabled={submitting}
                className="px-4 py-2 rounded-xl bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/40 text-amber-300 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
              >
                {submitting ? "Saving..." : "Save Draft"}
              </button>

              <button
                type="button"
                onClick={() => handleSave("published")}
                disabled={submitting}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-black shadow-md shadow-purple-600/30 transition-all cursor-pointer disabled:opacity-50"
              >
                {submitting ? "Publishing..." : "Publish Event"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
