"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  Calendar,
  CreditCard,
  Ban,
  X,
  Info,
} from "lucide-react";
import {
  AdminSubscriptionDTO,
  fetchAdminSubscriptions,
  cancelAdminSubscription,
} from "@/lib/api/admin_payment";

export default function AdminSubscriptionsCMS() {
  const [subscriptions, setSubscriptions] = useState<AdminSubscriptionDTO[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(15);

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Cancellation Modal State
  const [subToCancel, setSubToCancel] = useState<AdminSubscriptionDTO | null>(null);
  const [cancelReason, setCancelReason] = useState<string>("");

  const loadSubscriptions = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetchAdminSubscriptions({
        status: statusFilter !== "all" ? statusFilter : undefined,
        planCode: planFilter !== "all" ? planFilter : undefined,
        search: search.trim() || undefined,
        page,
        limit,
      });
      setSubscriptions(res.subscriptions);
      setTotalCount(res.total_count);
      setTotalPages(res.total_pages || 1);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load subscriptions.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, planFilter, search, page, limit]);

  useEffect(() => {
    loadSubscriptions();
  }, [loadSubscriptions]);

  const handleConfirmCancel = async () => {
    if (!subToCancel) return;
    setActionLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await cancelAdminSubscription(subToCancel.id, cancelReason);
      setSuccessMsg(res.message);
      setSubToCancel(null);
      setCancelReason("");
      loadSubscriptions();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to cancel subscription.";
      setErrorMsg(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (isoString?: string | null) => {
    if (!isoString) return "—";
    try {
      return new Date(isoString).toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Top Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" />
              Subscription Lifecycle Governance
            </h2>
            <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Live Roster
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Student entitlement periods, active premium tiers, expiry dates, and safe renewal cancellation
          </p>
        </div>

        <button
          onClick={loadSubscriptions}
          title="Refresh subscription roster"
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer border border-slate-700 self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-purple-400" : ""}`} />
        </button>
      </div>

      {/* Success / Error Alerts */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Subscriptions Table Container ── */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Subscriber Directory
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                {totalCount} Total
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Auditable records linking student identities to authoritative feature entitlements
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search email, name, user ID..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 w-48 sm:w-60"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="cancelled">Cancelled (In-Period)</option>
              <option value="expired">Expired</option>
            </select>

            {/* Plan Filter */}
            <select
              value={planFilter}
              onChange={(e) => {
                setPlanFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              <option value="all">All Plans</option>
              <option value="premium_monthly">Premium Monthly</option>
              <option value="premium_3_month">Premium 3 Months</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-800/40 border-b border-slate-800">
              <tr>
                <th className="py-3 px-3">Student Details</th>
                <th className="py-3 px-3">Plan</th>
                <th className="py-3 px-3">Lifecycle Status</th>
                <th className="py-3 px-3">Entitlements</th>
                <th className="py-3 px-3">Period Start</th>
                <th className="py-3 px-3">Expiry Date</th>
                <th className="py-3 px-3">Recent Payment</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-indigo-400" />
                    Loading subscriber directory...
                  </td>
                </tr>
              ) : subscriptions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500 italic">
                    No subscriptions found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                subscriptions.map((sub) => {
                  let statusBadge = (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-400 border border-slate-700">
                      {sub.status}
                    </span>
                  );
                  if (sub.status === "active") {
                    statusBadge = (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 w-max">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        Active
                      </span>
                    );
                  } else if (sub.status === "cancelled") {
                    statusBadge = (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 w-max">
                        <Clock className="w-2.5 h-2.5" />
                        Cancelled
                      </span>
                    );
                  } else if (sub.status === "expired") {
                    statusBadge = (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-700/60 text-slate-400 border border-slate-600 flex items-center gap-1 w-max">
                        <XCircle className="w-2.5 h-2.5" />
                        Expired
                      </span>
                    );
                  }

                  const canCancel = sub.status === "active" && sub.plan_code !== "free";

                  return (
                    <tr key={sub.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3">
                        <p className="font-semibold text-white">{sub.user_name || "Learner"}</p>
                        <p className="text-[10px] text-slate-400 truncate max-w-[170px]" title={sub.user_email || sub.user_id}>
                          {sub.user_email || sub.user_id}
                        </p>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-purple-300 border border-purple-500/20">
                          {sub.plan_name}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        {statusBadge}
                        {sub.cancelled_at && (
                          <p className="text-[9px] text-slate-500 mt-0.5">
                            Cancelled {formatDate(sub.cancelled_at)}
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        {sub.is_premium ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            Full Premium
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
                            Free Tier
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-400 text-[11px] whitespace-nowrap">
                        {formatDate(sub.started_at)}
                      </td>
                      <td className="py-3 px-3 text-slate-300 text-[11px] whitespace-nowrap font-semibold">
                        {formatDate(sub.expires_at)}
                      </td>
                      <td className="py-3 px-3 text-[11px]">
                        {sub.recent_transaction ? (
                          <div>
                            <span className="font-semibold text-emerald-400">
                              ₹{(sub.recent_transaction.amount_in_paise / 100).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                            </span>
                            <p className="text-[10px] text-slate-500 font-mono truncate max-w-[110px]" title={sub.recent_transaction.merchant_order_id}>
                              {sub.recent_transaction.merchant_order_id}
                            </p>
                          </div>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {canCancel ? (
                          <button
                            onClick={() => setSubToCancel(sub)}
                            className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[11px] font-semibold transition-colors cursor-pointer"
                          >
                            Cancel Renewal
                          </button>
                        ) : sub.status === "cancelled" ? (
                          <span className="text-[10px] text-slate-500 italic">Renewal Inactive</span>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800 text-xs text-slate-400">
          <div>
            Showing Page <span className="font-semibold text-white">{page}</span> of{" "}
            <span className="font-semibold text-white">{totalPages}</span> ({totalCount} items)
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
              className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
            >
              Next
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Safe Cancellation Confirmation Modal ── */}
      {subToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-base">
                <Ban className="w-5 h-5" />
                <span>Cancel Subscription Renewal</span>
              </div>
              <button
                onClick={() => setSubToCancel(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <Info className="w-4 h-4 text-amber-400" />
                  <span>Safe Cancellation Policy</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Cancelling this subscription stops future billing and renewal. The student retains paid premium access until the expiration date (
                  <strong className="text-white">{formatDate(subToCancel.expires_at)}</strong>). No payment refund is issued.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 space-y-1">
                <p><span className="text-slate-500">Learner:</span> <strong className="text-white">{subToCancel.user_name || subToCancel.user_email || subToCancel.user_id}</strong></p>
                <p><span className="text-slate-500">Plan:</span> <strong className="text-purple-300">{subToCancel.plan_name}</strong></p>
                <p><span className="text-slate-500">Expires At:</span> <strong className="text-white">{formatDate(subToCancel.expires_at)}</strong></p>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Reason for Cancellation (Optional Audit Note):
                </label>
                <textarea
                  rows={2}
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="e.g., Student requested cancellation via support ticket..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 resize-none text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSubToCancel(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
              >
                Nevermind
              </button>
              <button
                onClick={handleConfirmCancel}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-rose-600/30 transition-all cursor-pointer disabled:opacity-50"
              >
                {actionLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
