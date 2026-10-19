"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  CreditCard,
  Plus,
  Edit3,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ShieldCheck,
  Check,
  X,
  Power,
  RefreshCw,
  Search,
  Lock,
} from "lucide-react";
import {
  AdminSubscriptionPlan,
  fetchAdminPlans,
  createAdminPlan,
  updateAdminPlan,
  setAdminPlanStatus,
} from "@/lib/api/subscription";

interface PlanFormState {
  code: string;
  name: string;
  description: string;
  price_in_rupees: string;
  duration_days: string;
  is_active: boolean;
}

const INITIAL_FORM_STATE: PlanFormState = {
  code: "",
  name: "",
  description: "",
  price_in_rupees: "99",
  duration_days: "30",
  is_active: true,
};

export default function AdminPlansCMS() {
  const [plans, setPlans] = useState<AdminSubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<AdminSubscriptionPlan | null>(null);
  const [form, setForm] = useState<PlanFormState>(INITIAL_FORM_STATE);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Confirmation Modal State
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [planToToggle, setPlanToToggle] = useState<AdminSubscriptionPlan | null>(null);
  const [isToggling, setIsToggling] = useState(false);

  const loadPlans = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await fetchAdminPlans();
      setPlans(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load plans.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingPlan(null);
    setForm(INITIAL_FORM_STATE);
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (plan: AdminSubscriptionPlan) => {
    setEditingPlan(plan);
    setForm({
      code: plan.code,
      name: plan.name,
      description: plan.description || "",
      price_in_rupees: (plan.price_in_paise / 100).toString(),
      duration_days: plan.duration_days ? plan.duration_days.toString() : "",
      is_active: plan.is_active,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (isSubmitting) return;
    setIsModalOpen(false);
    setEditingPlan(null);
    setFormErrors({});
  };

  // Client validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!editingPlan) {
      const cleanCode = form.code.trim().toLowerCase();
      if (!cleanCode) {
        errors.code = "Plan code is required.";
      } else if (!/^[a-z0-9_]{2,50}$/.test(cleanCode)) {
        errors.code = "Code must be 2-50 lowercase alphanumeric characters and underscores.";
      }
    }

    if (!form.name.trim()) {
      errors.name = "Plan name is required.";
    }

    const priceNum = parseFloat(form.price_in_rupees);
    if (isNaN(priceNum) || priceNum < 0) {
      errors.price_in_rupees = "Price must be a non-negative number.";
    }

    const isFree = editingPlan?.code === "free" || (!editingPlan && form.code.trim() === "free");
    if (!isFree) {
      if (priceNum <= 0) {
        errors.price_in_rupees = "Commercial plans must have a price greater than ₹0.";
      }
      const durationNum = parseInt(form.duration_days, 10);
      if (isNaN(durationNum) || durationNum < 1) {
        errors.duration_days = "Duration must be at least 1 day for commercial plans.";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Create or Update
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const priceInPaise = Math.round(parseFloat(form.price_in_rupees) * 100);
    const durationDays = form.duration_days ? parseInt(form.duration_days, 10) : null;

    try {
      if (editingPlan) {
        await updateAdminPlan(editingPlan.id!, {
          name: form.name.trim(),
          description: form.description.trim() || null,
          price_in_paise: priceInPaise,
          duration_days: durationDays,
          is_active: form.is_active,
        });
        setSuccessMsg(`Plan "${form.name}" updated successfully.`);
      } else {
        await createAdminPlan({
          code: form.code.trim().toLowerCase(),
          name: form.name.trim(),
          description: form.description.trim() || null,
          price_in_paise: priceInPaise,
          currency: "INR",
          duration_days: durationDays,
          is_active: form.is_active,
        });
        setSuccessMsg(`Plan "${form.name}" created successfully.`);
      }
      setIsModalOpen(false);
      await loadPlans();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Operation failed.";
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirmation for status toggle
  const handlePromptToggleStatus = (plan: AdminSubscriptionPlan) => {
    if (plan.code === "free") {
      setErrorMsg("The foundational Free plan cannot be deactivated.");
      return;
    }
    setPlanToToggle(plan);
    setConfirmModalOpen(true);
  };

  const handleConfirmToggle = async () => {
    if (!planToToggle || !planToToggle.id || isToggling) return;
    setIsToggling(true);
    try {
      const targetState = !planToToggle.is_active;
      await setAdminPlanStatus(planToToggle.id, targetState);
      setSuccessMsg(
        `Plan "${planToToggle.name}" ${targetState ? "activated" : "deactivated"} successfully.`
      );
      setConfirmModalOpen(false);
      setPlanToToggle(null);
      await loadPlans();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to change plan status.";
      setErrorMsg(msg);
    } finally {
      setIsToggling(false);
    }
  };

  // Filter plans
  const filteredPlans = plans.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (statusFilter === "active") return p.is_active;
    if (statusFilter === "inactive") return !p.is_active;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* ── Top Header & Actions ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-purple-400" />
            <span>Commercial Plans & Pricing</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Manage student-facing subscription passes, canonical prices in paise, and checkout availability.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={loadPlans}
            disabled={loading}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700 cursor-pointer disabled:opacity-50"
            title="Refresh Plans"
            aria-label="Refresh Plans"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 shadow-md shadow-purple-900/40 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Plan</span>
          </button>
        </div>
      </div>

      {/* ── Alert Notifications ── */}
      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMsg(null)}
            className="text-rose-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMsg(null)}
            className="text-emerald-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Search & Filter Controls ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search plans by name or slug..."
            className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl">
          {(["all", "active", "inactive"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all capitalize cursor-pointer ${
                statusFilter === tab
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ── Plans Table / Cards ── */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 rounded-2xl bg-slate-800/40 animate-pulse border border-slate-800"
            />
          ))}
        </div>
      ) : filteredPlans.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-slate-800 rounded-2xl space-y-3 bg-slate-900/30">
          <CreditCard className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-sm font-semibold text-slate-400">No subscription plans found.</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery
              ? "No plans match your search query."
              : "Click 'New Plan' above to configure your commercial passes."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPlans.map((plan) => {
            const isFree = plan.code === "free";
            const priceInRupees = plan.price_in_paise / 100;

            return (
              <div
                key={plan.id || plan.code}
                className={`bg-slate-900/80 border rounded-2xl p-5 flex flex-col justify-between gap-4 transition-all relative overflow-hidden shadow-sm ${
                  plan.is_active
                    ? "border-slate-800 hover:border-slate-700/90"
                    : "border-slate-800/50 opacity-75 bg-slate-950/40"
                }`}
              >
                {/* Plan Header */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700/60">
                      {plan.code}
                    </span>

                    {isFree ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30">
                        <Sparkles className="w-3 h-3 text-purple-400" />
                        <span>Free Tier</span>
                      </span>
                    ) : plan.is_active ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>Active</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                        <AlertCircle className="w-3 h-3 text-amber-400" />
                        <span>Inactive</span>
                      </span>
                    )}
                  </div>

                  <h4 className="text-base font-extrabold text-white tracking-tight">{plan.name}</h4>

                  <p className="text-xs text-slate-400 leading-relaxed min-h-[36px]">
                    {plan.description || "No description provided."}
                  </p>
                </div>

                {/* Price & Duration Badge */}
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
                  <div>
                    <div className="text-lg font-black text-white">
                      ₹{priceInRupees}
                      <span className="text-xs font-normal text-slate-400 ml-1">
                        ({plan.price_in_paise} paise)
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">Authoritative charge</div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-300 flex items-center justify-end gap-1">
                      <Clock className="w-3.5 h-3.5 text-purple-400" />
                      <span>{plan.duration_days ? `${plan.duration_days} Days` : "Perpetual"}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">Validity window</div>
                  </div>
                </div>

                {/* Card Action Controls */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(plan)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  {!isFree ? (
                    <button
                      type="button"
                      onClick={() => handlePromptToggleStatus(plan)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        plan.is_active
                          ? "text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30"
                          : "text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30"
                      }`}
                    >
                      <Power className="w-3.5 h-3.5" />
                      <span>{plan.is_active ? "Deactivate" : "Activate"}</span>
                    </button>
                  ) : (
                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      <span>Permanent Free</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Create / Edit Modal ── */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="plan-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        >
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
              <h3 id="plan-modal-title" className="text-base font-bold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-purple-400" />
                <span>{editingPlan ? `Edit Plan: ${editingPlan.name}` : "Create Commercial Plan"}</span>
              </h3>
              <button
                type="button"
                onClick={handleCloseModal}
                disabled={isSubmitting}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4">
              {/* Plan Slug / Code */}
              <div>
                <label htmlFor="plan-code-input" className="block text-xs font-semibold text-slate-300 mb-1">
                  Plan Slug / Code <span className="text-rose-400">*</span>
                </label>
                <input
                  id="plan-code-input"
                  type="text"
                  value={form.code}
                  disabled={!!editingPlan}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  placeholder="e.g. annual_sprint_pass"
                  className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors ${
                    editingPlan ? "opacity-60 cursor-not-allowed border-slate-800" : "border-slate-800"
                  }`}
                />
                {editingPlan && (
                  <p className="text-[11px] text-slate-500 mt-1">
                    Plan slug is immutable to preserve historical audit and foreign key integrity.
                  </p>
                )}
                {formErrors.code && <p className="text-xs text-rose-400 mt-1">{formErrors.code}</p>}
              </div>

              {/* Plan Name */}
              <div>
                <label htmlFor="plan-name-input" className="block text-xs font-semibold text-slate-300 mb-1">
                  Display Name <span className="text-rose-400">*</span>
                </label>
                <input
                  id="plan-name-input"
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. 1-Year Full Placement Pass"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors"
                />
                {formErrors.name && <p className="text-xs text-rose-400 mt-1">{formErrors.name}</p>}
              </div>

              {/* Description */}
              <div>
                <label htmlFor="plan-desc-input" className="block text-xs font-semibold text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  id="plan-desc-input"
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe target learners, duration, and preparation scope..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              {/* Price & Duration Row */}
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label htmlFor="plan-price-input" className="block text-xs font-semibold text-slate-300 mb-1">
                    Price in INR (₹) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    id="plan-price-input"
                    type="number"
                    step="1"
                    min="0"
                    disabled={editingPlan?.code === "free"}
                    value={form.price_in_rupees}
                    onChange={(e) => setForm({ ...form, price_in_rupees: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    = {Math.round((parseFloat(form.price_in_rupees) || 0) * 100)} paise
                  </p>
                  {formErrors.price_in_rupees && (
                    <p className="text-xs text-rose-400 mt-1">{formErrors.price_in_rupees}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="plan-duration-input" className="block text-xs font-semibold text-slate-300 mb-1">
                    Duration in Days <span className="text-rose-400">*</span>
                  </label>
                  <input
                    id="plan-duration-input"
                    type="number"
                    min="1"
                    disabled={editingPlan?.code === "free"}
                    value={form.duration_days}
                    onChange={(e) => setForm({ ...form, duration_days: e.target.value })}
                    placeholder={editingPlan?.code === "free" ? "Perpetual" : "30"}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    {editingPlan?.code === "free" ? "Free tier is perpetual" : "Commercial plan days"}
                  </p>
                  {formErrors.duration_days && (
                    <p className="text-xs text-rose-400 mt-1">{formErrors.duration_days}</p>
                  )}
                </div>
              </div>

              {/* Active Toggle */}
              {editingPlan?.code !== "free" && (
                <div className="flex items-center gap-2.5 pt-1">
                  <input
                    type="checkbox"
                    id="plan-is-active-checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                    className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 bg-slate-950 border-slate-800"
                  />
                  <label htmlFor="plan-is-active-checkbox" className="text-xs text-slate-300 font-medium cursor-pointer">
                    Plan is active and available for student checkout
                  </label>
                </div>
              )}

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 shadow-md shadow-purple-900/40 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingPlan ? "Update Plan" : "Create Plan"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Status Toggle Confirmation Modal ── */}
      {confirmModalOpen && planToToggle && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        >
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 id="confirm-modal-title" className="text-base font-bold text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-400" />
              <span>{planToToggle.is_active ? "Deactivate Plan?" : "Activate Plan?"}</span>
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed">
              {planToToggle.is_active ? (
                <>
                  Deactivating <strong>{planToToggle.name}</strong> will remove it from the public pricing
                  page and prevent new student checkouts. Existing active subscriptions will remain unaffected.
                </>
              ) : (
                <>
                  Activating <strong>{planToToggle.name}</strong> will make it immediately visible to students
                  at the authoritative price of ₹{planToToggle.price_in_paise / 100}.
                </>
              )}
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setConfirmModalOpen(false)}
                disabled={isToggling}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmToggle}
                disabled={isToggling}
                className={`px-4 py-2 rounded-xl text-xs font-bold text-white transition-all cursor-pointer ${
                  planToToggle.is_active
                    ? "bg-amber-600 hover:bg-amber-500"
                    : "bg-emerald-600 hover:bg-emerald-500"
                }`}
              >
                {isToggling ? "Updating..." : planToToggle.is_active ? "Confirm Deactivation" : "Confirm Activation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
