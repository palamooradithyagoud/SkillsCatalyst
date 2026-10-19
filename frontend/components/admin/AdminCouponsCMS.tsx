"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Tag,
  Plus,
  Edit3,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Percent,
  Check,
  X,
  Power,
  RefreshCw,
  Search,
  Lock,
  Calendar,
  Users,
  AlertTriangle,
} from "lucide-react";
import {
  CouponAdminDTO,
  fetchAdminCoupons,
  createAdminCoupon,
  updateAdminCoupon,
  setAdminCouponStatus,
  expireAdminCoupon,
} from "@/lib/api/coupon";

interface CouponFormState {
  code: string;
  description: string;
  discount_type: "percentage" | "fixed_amount";
  discount_value: string;
  max_discount_in_rupees: string;
  min_order_in_rupees: string;
  start_at: string;
  expires_at: string;
  max_uses: string;
  max_uses_per_user: string;
  eligible_plans_all: boolean;
  eligible_plan_monthly: boolean;
  eligible_plan_quarterly: boolean;
  is_active: boolean;
}

const INITIAL_FORM_STATE: CouponFormState = {
  code: "",
  description: "",
  discount_type: "percentage",
  discount_value: "20",
  max_discount_in_rupees: "",
  min_order_in_rupees: "0",
  start_at: "",
  expires_at: "",
  max_uses: "",
  max_uses_per_user: "1",
  eligible_plans_all: true,
  eligible_plan_monthly: false,
  eligible_plan_quarterly: false,
  is_active: true,
};

export default function AdminCouponsCMS() {
  const [coupons, setCoupons] = useState<CouponAdminDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive" | "expired">("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<CouponAdminDTO | null>(null);
  const [form, setForm] = useState<CouponFormState>(INITIAL_FORM_STATE);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Status Action Modal State
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState<"toggle" | "expire">("toggle");
  const [targetCoupon, setTargetCoupon] = useState<CouponAdminDTO | null>(null);
  const [isExecutingAction, setIsExecutingAction] = useState(false);

  const loadCoupons = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await fetchAdminCoupons();
      setCoupons(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load coupons.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCoupons();
  }, [loadCoupons]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingCoupon(null);
    setForm(INITIAL_FORM_STATE);
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (coupon: CouponAdminDTO) => {
    setEditingCoupon(coupon);
    const plans = coupon.eligible_plan_codes || [];
    const isAll = plans.length === 0;

    const startLocal = coupon.start_at
      ? new Date(coupon.start_at).toISOString().slice(0, 16)
      : "";
    const expiresLocal = coupon.expires_at
      ? new Date(coupon.expires_at).toISOString().slice(0, 16)
      : "";

    setForm({
      code: coupon.code,
      description: coupon.description || "",
      discount_type: coupon.discount_type,
      discount_value:
        coupon.discount_type === "percentage"
          ? coupon.discount_value.toString()
          : (coupon.discount_value / 100).toString(),
      max_discount_in_rupees: coupon.max_discount_in_paise
        ? (coupon.max_discount_in_paise / 100).toString()
        : "",
      min_order_in_rupees: (coupon.min_order_in_paise / 100).toString(),
      start_at: startLocal,
      expires_at: expiresLocal,
      max_uses: coupon.max_uses ? coupon.max_uses.toString() : "",
      max_uses_per_user: coupon.max_uses_per_user.toString(),
      eligible_plans_all: isAll,
      eligible_plan_monthly: plans.includes("premium_monthly"),
      eligible_plan_quarterly: plans.includes("premium_3_month"),
      is_active: coupon.is_active,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Validate Form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!editingCoupon) {
      if (!form.code.trim()) {
        errors.code = "Coupon code is required.";
      } else if (!/^[A-Za-z0-9_-]{2,50}$/.test(form.code.trim())) {
        errors.code = "Code must be 2-50 alphanumeric characters (or underscores/hyphens).";
      }
    }

    const valNum = parseFloat(form.discount_value);
    if (isNaN(valNum) || valNum <= 0) {
      errors.discount_value = "Discount value must be greater than 0.";
    } else if (form.discount_type === "percentage" && (valNum < 1 || valNum > 100)) {
      errors.discount_value = "Percentage discount must be between 1 and 100.";
    }

    if (form.max_discount_in_rupees) {
      const maxD = parseFloat(form.max_discount_in_rupees);
      if (isNaN(maxD) || maxD <= 0) {
        errors.max_discount_in_rupees = "Max discount cap must be greater than ₹0.";
      }
    }

    if (form.min_order_in_rupees) {
      const minO = parseFloat(form.min_order_in_rupees);
      if (isNaN(minO) || minO < 0) {
        errors.min_order_in_rupees = "Minimum order cannot be negative.";
      }
    }

    if (form.max_uses) {
      const mU = parseInt(form.max_uses, 10);
      if (isNaN(mU) || mU <= 0) {
        errors.max_uses = "Global limit must be at least 1.";
      }
    }

    const pU = parseInt(form.max_uses_per_user, 10);
    if (isNaN(pU) || pU <= 0) {
      errors.max_uses_per_user = "Per-user limit must be at least 1.";
    }

    if (form.start_at && form.expires_at) {
      if (new Date(form.expires_at) <= new Date(form.start_at)) {
        errors.expires_at = "Expiry date must be strictly after the start date.";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const discVal =
        form.discount_type === "percentage"
          ? parseInt(form.discount_value, 10)
          : Math.round(parseFloat(form.discount_value) * 100);

      const maxDiscPaise = form.max_discount_in_rupees
        ? Math.round(parseFloat(form.max_discount_in_rupees) * 100)
        : null;

      const minOrderPaise = form.min_order_in_rupees
        ? Math.round(parseFloat(form.min_order_in_rupees) * 100)
        : 0;

      let eligiblePlans: string[] | null = null;
      if (!form.eligible_plans_all) {
        eligiblePlans = [];
        if (form.eligible_plan_monthly) eligiblePlans.push("premium_monthly");
        if (form.eligible_plan_quarterly) eligiblePlans.push("premium_3_month");
      }

      if (editingCoupon) {
        await updateAdminCoupon(editingCoupon.id, {
          description: form.description.trim() || undefined,
          discount_type: form.discount_type,
          discount_value: discVal,
          max_discount_in_paise: maxDiscPaise,
          min_order_in_paise: minOrderPaise,
          start_at: form.start_at ? new Date(form.start_at).toISOString() : undefined,
          expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
          max_uses: form.max_uses ? parseInt(form.max_uses, 10) : null,
          max_uses_per_user: parseInt(form.max_uses_per_user, 10),
          eligible_plan_codes: eligiblePlans,
          is_active: form.is_active,
        });
        setSuccessMsg(`Coupon "${editingCoupon.code}" updated successfully.`);
      } else {
        await createAdminCoupon({
          code: form.code.trim().toUpperCase(),
          description: form.description.trim() || undefined,
          discount_type: form.discount_type,
          discount_value: discVal,
          max_discount_in_paise: maxDiscPaise,
          min_order_in_paise: minOrderPaise,
          start_at: form.start_at ? new Date(form.start_at).toISOString() : undefined,
          expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
          max_uses: form.max_uses ? parseInt(form.max_uses, 10) : null,
          max_uses_per_user: parseInt(form.max_uses_per_user, 10),
          eligible_plan_codes: eligiblePlans,
          is_active: form.is_active,
        });
        setSuccessMsg(`Coupon "${form.code.trim().toUpperCase()}" created successfully.`);
      }

      setIsModalOpen(false);
      await loadCoupons();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save coupon.";
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Status Action (Toggle or Expire)
  const handleExecuteAction = async () => {
    if (!targetCoupon) return;
    setIsExecutingAction(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (actionType === "toggle") {
        const nextState = !targetCoupon.is_active;
        await setAdminCouponStatus(targetCoupon.id, nextState);
        setSuccessMsg(
          `Coupon "${targetCoupon.code}" ${nextState ? "activated" : "deactivated"} successfully.`
        );
      } else if (actionType === "expire") {
        await expireAdminCoupon(targetCoupon.id);
        setSuccessMsg(`Coupon "${targetCoupon.code}" expired immediately.`);
      }

      setActionModalOpen(false);
      setTargetCoupon(null);
      await loadCoupons();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update coupon status.";
      setErrorMsg(msg);
    } finally {
      setIsExecutingAction(false);
    }
  };

  const isExpired = (c: CouponAdminDTO) => {
    if (!c.expires_at) return false;
    return new Date(c.expires_at).getTime() < Date.now();
  };

  // Filtered coupons
  const filteredCoupons = coupons.filter((c) => {
    const expired = isExpired(c);
    const matchesQuery =
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesQuery) return false;
    if (statusFilter === "active") return c.is_active && !expired;
    if (statusFilter === "inactive") return !c.is_active && !expired;
    if (statusFilter === "expired") return expired;
    return true;
  });

  const totalCoupons = coupons.length;
  const activeCount = coupons.filter((c) => c.is_active && !isExpired(c)).length;
  const totalRedemptions = coupons.reduce((sum, c) => sum + (c.used_count || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900/90 via-indigo-950/40 to-slate-900/90 border border-white/10 shadow-xl backdrop-blur-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold">
            <Tag className="w-3.5 h-3.5" />
            <span>Promotional Engine • Phase 4</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Coupons & Campaigns</h2>
          <p className="text-xs text-slate-400">
            Create, activate, and manage percentage & fixed discounts with concurrency protection.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-xs transition-all shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Coupon</span>
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
          <span className="text-xs text-slate-400 font-medium">Total Campaigns</span>
          <p className="text-2xl font-black text-white mt-1">{totalCoupons}</p>
        </div>
        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
          <span className="text-xs text-slate-400 font-medium">Active Coupons</span>
          <p className="text-2xl font-black text-emerald-400 mt-1">{activeCount}</p>
        </div>
        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
          <span className="text-xs text-slate-400 font-medium">Total Redemptions</span>
          <p className="text-2xl font-black text-indigo-400 mt-1">{totalRedemptions}</p>
        </div>
      </div>

      {/* Feedback Alerts */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-500/15 border border-red-500/30 text-red-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-red-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search coupons..."
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-900/60 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400/50"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {(["all", "active", "inactive", "expired"] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                statusFilter === filter
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {filter}
            </button>
          ))}
          <button
            onClick={loadCoupons}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Coupons Table */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02] text-[11px] text-slate-400 uppercase font-semibold">
                <th className="py-3 px-4">Coupon Code</th>
                <th className="py-3 px-4">Discount</th>
                <th className="py-3 px-4">Usage</th>
                <th className="py-3 px-4">Eligible Plans</th>
                <th className="py-3 px-4">Valid Window</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-amber-400" />
                    <span>Loading promotional campaigns...</span>
                  </td>
                </tr>
              ) : filteredCoupons.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Tag className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="font-semibold text-slate-300">No coupons found</p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {searchQuery ? "Try a different search term" : "Click 'Create Coupon' to launch a campaign"}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredCoupons.map((coupon) => {
                  const expired = isExpired(coupon);
                  return (
                    <tr key={coupon.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-white px-2 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300">
                            {coupon.code}
                          </span>
                        </div>
                        {coupon.description && (
                          <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{coupon.description}</p>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">
                          {coupon.discount_type === "percentage" ? (
                            <span className="text-emerald-400">{coupon.discount_value}% OFF</span>
                          ) : (
                            <span className="text-emerald-400">₹{(coupon.discount_value / 100).toFixed(2)} OFF</span>
                          )}
                        </div>
                        {coupon.max_discount_in_paise && (
                          <span className="text-[10px] text-slate-400 block">
                            Max ₹{(coupon.max_discount_in_paise / 100).toFixed(2)}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-medium">
                          {coupon.used_count}{" "}
                          <span className="text-slate-400">
                            / {coupon.max_uses ? coupon.max_uses : "∞"}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {coupon.max_uses_per_user}x per student
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        {!coupon.eligible_plan_codes || coupon.eligible_plan_codes.length === 0 ? (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-white/10">
                            All Commercial Plans
                          </span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {coupon.eligible_plan_codes.map((p) => (
                              <span
                                key={p}
                                className="px-1.5 py-0.5 rounded text-[10px] bg-blue-500/10 text-blue-300 border border-blue-500/20 font-mono"
                              >
                                {p}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <div className="text-[11px] text-slate-300">
                          {coupon.expires_at ? (
                            <>
                              <span>Until {new Date(coupon.expires_at).toLocaleDateString()}</span>
                              {expired && (
                                <span className="block text-[10px] text-red-400 font-semibold">Expired</span>
                              )}
                            </>
                          ) : (
                            <span className="text-slate-400">No expiration</span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        {expired ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-300 text-[10px] font-semibold">
                            Expired
                          </span>
                        ) : coupon.is_active ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[10px] font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800 border border-white/10 text-slate-400 text-[10px] font-semibold">
                            Inactive
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(coupon)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                            title="Edit Campaign"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              setTargetCoupon(coupon);
                              setActionType("toggle");
                              setActionModalOpen(true);
                            }}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              coupon.is_active
                                ? "text-emerald-400 hover:bg-emerald-500/10"
                                : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                            }`}
                            title={coupon.is_active ? "Deactivate Coupon" : "Activate Coupon"}
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>

                          {!expired && (
                            <button
                              onClick={() => {
                                setTargetCoupon(coupon);
                                setActionType("expire");
                                setActionModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                              title="Expire Immediately"
                            >
                              <Clock className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Tag className="w-4 h-4 text-amber-400" />
                <span>{editingCoupon ? `Edit Coupon: ${editingCoupon.code}` : "Create Promotional Coupon"}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Code */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Coupon Code</label>
                <input
                  type="text"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  disabled={!!editingCoupon}
                  placeholder="e.g. SUMMER50"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white placeholder:text-slate-500 uppercase font-mono disabled:opacity-50"
                />
                {formErrors.code && <p className="text-[11px] text-red-400 mt-1">{formErrors.code}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description (Optional)</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="e.g. Summer placement accelerator promotional discount"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white placeholder:text-slate-500"
                />
              </div>

              {/* Discount Structure */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Discount Type</label>
                  <select
                    value={form.discount_type}
                    onChange={(e) =>
                      setForm({ ...form, discount_type: e.target.value as "percentage" | "fixed_amount" })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed_amount">Fixed Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {form.discount_type === "percentage" ? "Percentage (1–100%)" : "Amount (₹)"}
                  </label>
                  <input
                    type="number"
                    step={form.discount_type === "percentage" ? "1" : "0.5"}
                    value={form.discount_value}
                    onChange={(e) => setForm({ ...form, discount_value: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white"
                  />
                  {formErrors.discount_value && (
                    <p className="text-[11px] text-red-400 mt-1">{formErrors.discount_value}</p>
                  )}
                </div>
              </div>

              {/* Caps & Minimums */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Max Discount Cap (₹)
                  </label>
                  <input
                    type="number"
                    value={form.max_discount_in_rupees}
                    onChange={(e) => setForm({ ...form, max_discount_in_rupees: e.target.value })}
                    placeholder="Optional (e.g. 500)"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white placeholder:text-slate-500"
                  />
                  {formErrors.max_discount_in_rupees && (
                    <p className="text-[11px] text-red-400 mt-1">{formErrors.max_discount_in_rupees}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Min Order Price (₹)
                  </label>
                  <input
                    type="number"
                    value={form.min_order_in_rupees}
                    onChange={(e) => setForm({ ...form, min_order_in_rupees: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white"
                  />
                  {formErrors.min_order_in_rupees && (
                    <p className="text-[11px] text-red-400 mt-1">{formErrors.min_order_in_rupees}</p>
                  )}
                </div>
              </div>

              {/* Limits */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Global Total Limit
                  </label>
                  <input
                    type="number"
                    value={form.max_uses}
                    onChange={(e) => setForm({ ...form, max_uses: e.target.value })}
                    placeholder="Unlimited"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white placeholder:text-slate-500"
                  />
                  {formErrors.max_uses && (
                    <p className="text-[11px] text-red-400 mt-1">{formErrors.max_uses}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Per-Student Limit
                  </label>
                  <input
                    type="number"
                    value={form.max_uses_per_user}
                    onChange={(e) => setForm({ ...form, max_uses_per_user: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white"
                  />
                  {formErrors.max_uses_per_user && (
                    <p className="text-[11px] text-red-400 mt-1">{formErrors.max_uses_per_user}</p>
                  )}
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Start Date</label>
                  <input
                    type="datetime-local"
                    value={form.start_at}
                    onChange={(e) => setForm({ ...form, start_at: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Expiry Date</label>
                  <input
                    type="datetime-local"
                    value={form.expires_at}
                    onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white"
                  />
                  {formErrors.expires_at && (
                    <p className="text-[11px] text-red-400 mt-1">{formErrors.expires_at}</p>
                  )}
                </div>
              </div>

              {/* Plan Eligibility */}
              <div className="space-y-2 pt-2 border-t border-white/10">
                <span className="block text-xs font-semibold text-slate-300">Plan Eligibility</span>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.eligible_plans_all}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          eligible_plans_all: e.target.checked,
                          eligible_plan_monthly: false,
                          eligible_plan_quarterly: false,
                        })
                      }
                      className="rounded border-white/20 text-amber-500 focus:ring-0"
                    />
                    <span>All Commercial Plans</span>
                  </label>

                  {!form.eligible_plans_all && (
                    <div className="pl-6 space-y-1.5 pt-1">
                      <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.eligible_plan_monthly}
                          onChange={(e) => setForm({ ...form, eligible_plan_monthly: e.target.checked })}
                          className="rounded border-white/20 text-amber-500 focus:ring-0"
                        />
                        <span>Premium Monthly (premium_monthly)</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.eligible_plan_quarterly}
                          onChange={(e) => setForm({ ...form, eligible_plan_quarterly: e.target.checked })}
                          className="rounded border-white/20 text-amber-500 focus:ring-0"
                        />
                        <span>Premium 3-Month (premium_3_month)</span>
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Active Toggle */}
              <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">Active Campaign</span>
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  className="rounded border-white/20 text-amber-500 focus:ring-0 w-4 h-4"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs transition-colors cursor-pointer flex items-center gap-2"
                >
                  {isSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingCoupon ? "Save Changes" : "Create Coupon"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Action Confirmation Modal */}
      {actionModalOpen && targetCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-sm bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-5 space-y-4 text-center">
            <div className="w-10 h-10 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-5 h-5" />
            </div>

            <div className="space-y-1">
              <h4 className="text-base font-bold text-white">
                {actionType === "toggle"
                  ? targetCoupon.is_active
                    ? `Deactivate "${targetCoupon.code}"?`
                    : `Activate "${targetCoupon.code}"?`
                  : `Expire "${targetCoupon.code}" Immediately?`}
              </h4>
              <p className="text-xs text-slate-400">
                {actionType === "toggle"
                  ? targetCoupon.is_active
                    ? "Students will no longer be able to redeem this coupon."
                    : "The coupon will immediately be available for students at checkout."
                  : "This will set the expiry date to now and prevent future redemptions."}
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActionModalOpen(false)}
                disabled={isExecutingAction}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-white/5 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteAction}
                disabled={isExecutingAction}
                className={`px-4 py-2 rounded-xl text-xs font-bold text-white cursor-pointer ${
                  actionType === "expire"
                    ? "bg-red-600 hover:bg-red-500"
                    : "bg-amber-500 hover:bg-amber-400 text-slate-950"
                }`}
              >
                {isExecutingAction ? "Updating..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
