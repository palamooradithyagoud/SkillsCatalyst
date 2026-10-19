"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  CreditCard,
  IndianRupee,
  RefreshCw,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  Gift,
  Tag,
  TrendingUp,
  Filter,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  ShieldCheck,
} from "lucide-react";
import {
  AdminPaymentMetricsDTO,
  AdminPaymentTransactionDTO,
  fetchAdminPaymentMetrics,
  fetchAdminTransactions,
} from "@/lib/api/admin_payment";

export default function AdminPaymentsCMS() {
  // Telemetry & metrics state
  const [metrics, setMetrics] = useState<AdminPaymentMetricsDTO | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [selectedPreset, setSelectedPreset] = useState<string>("30d");
  const [customStart, setCustomStart] = useState<string>("");
  const [customEnd, setCustomEnd] = useState<string>("");

  // Transactions ledger state
  const [transactions, setTransactions] = useState<AdminPaymentTransactionDTO[]>([]);
  const [txTotalCount, setTxTotalCount] = useState<number>(0);
  const [txTotalPages, setTxTotalPages] = useState<number>(1);
  const [txPage, setTxPage] = useState<number>(1);
  const [txLimit] = useState<number>(15);
  const [txStatusFilter, setTxStatusFilter] = useState<string>("all");
  const [txPlanFilter, setTxPlanFilter] = useState<string>("all");
  const [txSearch, setTxSearch] = useState<string>("");
  const [txLoading, setTxLoading] = useState(true);

  // Detail Modal state
  const [selectedTx, setSelectedTx] = useState<AdminPaymentTransactionDTO | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch metrics
  const loadMetrics = useCallback(async () => {
    setMetricsLoading(true);
    setErrorMsg(null);
    try {
      const data = await fetchAdminPaymentMetrics(
        selectedPreset === "custom" ? undefined : selectedPreset,
        selectedPreset === "custom" ? customStart : undefined,
        selectedPreset === "custom" ? customEnd : undefined
      );
      setMetrics(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load payment telemetry.";
      setErrorMsg(msg);
    } finally {
      setMetricsLoading(false);
    }
  }, [selectedPreset, customStart, customEnd]);

  // Fetch transactions ledger
  const loadTransactions = useCallback(async () => {
    setTxLoading(true);
    try {
      const res = await fetchAdminTransactions({
        status: txStatusFilter !== "all" ? txStatusFilter : undefined,
        planCode: txPlanFilter !== "all" ? txPlanFilter : undefined,
        search: txSearch.trim() || undefined,
        page: txPage,
        limit: txLimit,
      });
      setTransactions(res.transactions);
      setTxTotalCount(res.total_count);
      setTxTotalPages(res.total_pages || 1);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load transactions.";
      setErrorMsg(msg);
    } finally {
      setTxLoading(false);
    }
  }, [txStatusFilter, txPlanFilter, txSearch, txPage, txLimit]);

  useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const handleRefreshAll = () => {
    loadMetrics();
    loadTransactions();
  };

  const formatRupees = (paise: number) => {
    return (paise / 100).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatDate = (isoString?: string | null) => {
    if (!isoString) return "—";
    try {
      return new Date(isoString).toLocaleString("en-IN", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Top Header & Telemetry Controls ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-purple-400" />
              Payment &amp; Revenue Governance
            </h2>
            <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Authoritative
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time PhonePe gateway transactions, collected cash revenue, and promotional discounts
          </p>
        </div>

        {/* Date Preset Filter & Refresh */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-slate-800/90 border border-slate-700/80 rounded-xl p-1 text-xs">
            <button
              onClick={() => setSelectedPreset("today")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                selectedPreset === "today"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setSelectedPreset("7d")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                selectedPreset === "7d"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setSelectedPreset("30d")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                selectedPreset === "30d"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              30 Days
            </button>
            <button
              onClick={() => setSelectedPreset("all")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                selectedPreset === "all"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => setSelectedPreset("custom")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                selectedPreset === "custom"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Custom
            </button>
          </div>

          <button
            onClick={handleRefreshAll}
            title="Refresh payment telemetry"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer border border-slate-700"
          >
            <RefreshCw
              className={`w-4 h-4 ${metricsLoading || txLoading ? "animate-spin text-purple-400" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Custom Date Range Picker */}
      {selectedPreset === "custom" && (
        <div className="flex flex-wrap items-center gap-3 bg-slate-900/60 border border-slate-800 p-4 rounded-xl text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Start Date:</span>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">End Date:</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white"
            />
          </div>
          <button
            onClick={loadMetrics}
            className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 font-semibold text-white cursor-pointer"
          >
            Apply Range
          </button>
        </div>
      )}

      {/* Error Alert */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            onClick={() => setErrorMsg(null)}
            className="text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Key Performance Metric Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Collected Cash Revenue */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Collected Cash Revenue</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-400 tracking-tight">
            ₹{metrics ? metrics.total_collected_amount_in_rupees.toLocaleString("en-IN", { minimumFractionDigits: 2 }) : "0.00"}
          </p>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">
            Excludes promotional ₹0 passes &amp; uncompleted
          </p>
        </div>

        {/* Card 2: Gross Transaction Value & Discounts */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Gross Value &amp; Discounts</span>
            <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white tracking-tight">
            ₹{metrics ? metrics.gross_transaction_value_in_rupees.toLocaleString("en-IN", { minimumFractionDigits: 2 }) : "0.00"}
          </p>
          <p className="text-[11px] text-purple-300 mt-1 font-medium">
            Discounts: ₹{metrics ? metrics.total_discount_amount_in_rupees.toLocaleString("en-IN", { minimumFractionDigits: 2 }) : "0.00"}
          </p>
        </div>

        {/* Card 3: Transaction Volumes */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Transaction Status</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-black text-emerald-400 tracking-tight">
              {metrics ? metrics.successful_count : 0}
            </p>
            <span className="text-xs font-bold text-slate-400">Success</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
            <span className="text-amber-400 font-semibold">{metrics ? metrics.pending_count : 0} Pending</span>
            <span className="text-slate-600">•</span>
            <span className="text-rose-400 font-semibold">{metrics ? metrics.failed_count : 0} Failed</span>
          </div>
        </div>

        {/* Card 4: Free Promotional Passes */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Promotional Passes</span>
            <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Gift className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-cyan-400 tracking-tight">
            {metrics ? metrics.promotional_pass_count : 0}
          </p>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">
            100% Free coupon redemptions (₹0 Cash)
          </p>
        </div>
      </div>

      {/* ── Plan & Coupon Breakdown Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Plans Breakdown */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-purple-400" />
              Transactions Grouped By Plan
            </h3>
            <span className="text-[11px] text-slate-500">
              {metrics?.by_plan.length || 0} commercial plan(s)
            </span>
          </div>
          {metrics?.by_plan && metrics.by_plan.length > 0 ? (
            <div className="space-y-2">
              {metrics.by_plan.map((p) => (
                <div
                  key={p.plan_code}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs"
                >
                  <div>
                    <p className="font-semibold text-white">{p.plan_name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{p.plan_code}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-400">₹{p.collected_amount_in_rupees.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
                    <p className="text-[10px] text-slate-400">{p.count} transaction(s)</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic py-4 text-center">No plan payment activity in selected window.</p>
          )}
        </div>

        {/* Coupons Breakdown */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Tag className="w-4 h-4 text-cyan-400" />
              Coupon Redemptions &amp; Discounts
            </h3>
            <span className="text-[11px] text-slate-500">
              {metrics?.by_coupon.length || 0} coupon(s)
            </span>
          </div>
          {metrics?.by_coupon && metrics.by_coupon.length > 0 ? (
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {metrics.by_coupon.map((c) => (
                <div
                  key={c.coupon_code}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded font-mono text-[11px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      {c.coupon_code}
                    </span>
                    <span className="text-[11px] text-slate-400">{c.redemption_count} use(s)</span>
                  </div>
                  <div className="text-right font-bold text-purple-400">
                    -₹{c.total_discount_in_rupees.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic py-4 text-center">No promotional coupon redemptions recorded.</p>
          )}
        </div>
      </div>

      {/* ── Transactions Ledger ── */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        {/* Ledger Header & Filter Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Payment Transactions Ledger
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                {txTotalCount} Total
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Server-authoritative transaction records with customer references and timestamps
            </p>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search order ID, email..."
                value={txSearch}
                onChange={(e) => {
                  setTxSearch(e.target.value);
                  setTxPage(1);
                }}
                className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 w-48 sm:w-60"
              />
            </div>

            {/* Status Filter */}
            <select
              value={txStatusFilter}
              onChange={(e) => {
                setTxStatusFilter(e.target.value);
                setTxPage(1);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="success">Success</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {/* Plan Filter */}
            <select
              value={txPlanFilter}
              onChange={(e) => {
                setTxPlanFilter(e.target.value);
                setTxPage(1);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              <option value="all">All Plans</option>
              <option value="premium_monthly">Premium Monthly</option>
              <option value="premium_3_month">Premium 3 Months</option>
            </select>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-800/40 border-b border-slate-800">
              <tr>
                <th className="py-3 px-3">Order Ref / ID</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">Plan</th>
                <th className="py-3 px-3">Amount</th>
                <th className="py-3 px-3">Discount</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Initiated</th>
                <th className="py-3 px-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {txLoading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-purple-400" />
                    Loading transaction ledger...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500 italic">
                    No transactions found matching the selected filters.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => {
                  let statusBadge = (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-400 border border-slate-700">
                      {tx.status}
                    </span>
                  );
                  if (tx.status === "success") {
                    statusBadge = (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 w-max">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        Success
                      </span>
                    );
                  } else if (tx.status === "pending" || tx.status === "created") {
                    statusBadge = (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 w-max">
                        <Clock className="w-2.5 h-2.5" />
                        Pending
                      </span>
                    );
                  } else if (tx.status === "failed") {
                    statusBadge = (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1 w-max">
                        <XCircle className="w-2.5 h-2.5" />
                        Failed
                      </span>
                    );
                  } else if (tx.status === "cancelled") {
                    statusBadge = (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-700/50 text-slate-300 border border-slate-600 flex items-center gap-1 w-max">
                        Cancelled
                      </span>
                    );
                  }

                  return (
                    <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3">
                        <p className="font-mono text-[11px] font-semibold text-white">{tx.merchant_order_id}</p>
                        <p className="text-[10px] text-slate-500 font-mono truncate max-w-[120px]" title={tx.id}>
                          {tx.id}
                        </p>
                      </td>
                      <td className="py-3 px-3">
                        <p className="font-semibold text-slate-200">{tx.user_name || "Student"}</p>
                        <p className="text-[10px] text-slate-400 truncate max-w-[150px]" title={tx.user_email || tx.user_id}>
                          {tx.user_email || tx.user_id}
                        </p>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-purple-300 border border-purple-500/20">
                          {tx.plan_name}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-white">
                          ₹{formatRupees(tx.amount_in_paise)}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        {tx.discount_in_paise > 0 ? (
                          <div className="text-[11px]">
                            <span className="font-bold text-purple-400">
                              -₹{formatRupees(tx.discount_in_paise)}
                            </span>
                            {tx.coupon_code && (
                              <p className="text-[10px] font-mono text-cyan-400">{tx.coupon_code}</p>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>
                      <td className="py-3 px-3">{statusBadge}</td>
                      <td className="py-3 px-3 text-slate-400 text-[11px] whitespace-nowrap">
                        {formatDate(tx.created_at)}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => setSelectedTx(tx)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                          title="View transaction details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
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
            Showing Page <span className="font-semibold text-white">{txPage}</span> of{" "}
            <span className="font-semibold text-white">{txTotalPages}</span> ({txTotalCount} items)
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTxPage((p) => Math.max(1, p - 1))}
              disabled={txPage <= 1 || txLoading}
              className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Previous
            </button>
            <button
              onClick={() => setTxPage((p) => Math.min(txTotalPages, p + 1))}
              disabled={txPage >= txTotalPages || txLoading}
              className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
            >
              Next
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Transaction Detail Modal ── */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  Transaction Details
                </h3>
                <p className="text-xs font-mono text-purple-300 mt-0.5">{selectedTx.merchant_order_id}</p>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Final Amount</span>
                  <span className="text-base font-black text-emerald-400">
                    ₹{formatRupees(selectedTx.amount_in_paise)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Status</span>
                  <span className="font-bold uppercase text-white tracking-wider">
                    {selectedTx.status}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-slate-300">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-500">Plan:</span>
                  <span className="font-semibold text-white">{selectedTx.plan_name} ({selectedTx.plan_code})</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-500">Original Price:</span>
                  <span>₹{formatRupees(selectedTx.original_amount_in_paise)}</span>
                </div>
                {selectedTx.discount_in_paise > 0 && (
                  <div className="flex justify-between py-1 border-b border-slate-800 text-purple-400">
                    <span>Discount Applied:</span>
                    <span>-₹{formatRupees(selectedTx.discount_in_paise)} ({selectedTx.coupon_code || "COUPON"})</span>
                  </div>
                )}
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-500">Student:</span>
                  <span>{selectedTx.user_name || "—"} ({selectedTx.user_email || selectedTx.user_id})</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800 font-mono text-[11px]">
                  <span className="text-slate-500 font-sans">User UUID:</span>
                  <span>{selectedTx.user_id}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-500">Initiated At:</span>
                  <span>{formatDate(selectedTx.created_at)}</span>
                </div>
                {selectedTx.completed_at && (
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-500">Completed At:</span>
                    <span>{formatDate(selectedTx.completed_at)}</span>
                  </div>
                )}
                {selectedTx.subscription_id && (
                  <div className="flex justify-between py-1 border-b border-slate-800 font-mono text-[11px]">
                    <span className="text-slate-500 font-sans">Subscription ID:</span>
                    <span>{selectedTx.subscription_id}</span>
                  </div>
                )}
                {selectedTx.failure_code && (
                  <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                    <p className="font-semibold">Failure Code: {selectedTx.failure_code}</p>
                    <p className="text-[11px] mt-0.5">{selectedTx.failure_message}</p>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => setSelectedTx(null)}
              className="w-full py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
