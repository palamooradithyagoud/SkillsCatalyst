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
  Download,
  FileText,
  Scale,
  RotateCw,
} from "lucide-react";
import {
  AdminPaymentMetricsDTO,
  AdminPaymentTransactionDTO,
  fetchAdminPaymentMetrics,
  fetchAdminTransactions,
} from "@/lib/api/admin_payment";
import {
  PaymentReceiptDTO,
  ReconciliationSummaryDTO,
  ReconciliationItemDTO,
  getAdminPaymentReceipt,
  downloadTransactionsCsv,
  downloadRevenueSummaryCsv,
  runReconciliationBatch,
  reconcileSingleOrder,
} from "@/lib/api/reporting";
import { PaymentReceiptModal } from "@/components/payment/PaymentReceiptModal";

export default function AdminPaymentsCMS() {
  // Navigation / View Tabs
  const [activeTab, setActiveTab] = useState<"ledger" | "reconciliation">("ledger");

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

  // Detail Modal & Receipt state
  const [selectedTx, setSelectedTx] = useState<AdminPaymentTransactionDTO | null>(null);
  const [currentReceipt, setCurrentReceipt] = useState<PaymentReceiptDTO | null>(null);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [receiptLoading, setReceiptLoading] = useState(false);
  const [exportingCsv, setExportingCsv] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Reconciliation state
  const [reconciliationSummary, setReconciliationSummary] = useState<ReconciliationSummaryDTO | null>(null);
  const [reconciliationLoading, setReconciliationLoading] = useState(false);
  const [reconciliationPreset, setReconciliationPreset] = useState<string>("30d");
  const [reconciliationStatusFilter, setReconciliationStatusFilter] = useState<string>("pending");
  const [singleSyncingOrder, setSingleSyncingOrder] = useState<string | null>(null);

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

  const triggerBlobDownload = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleExportTransactionsCsv = async () => {
    setExportingCsv(true);
    setErrorMsg(null);
    try {
      const blob = await downloadTransactionsCsv({
        status: txStatusFilter !== "all" ? txStatusFilter : undefined,
        preset: selectedPreset === "custom" ? undefined : selectedPreset,
        start_date: selectedPreset === "custom" ? customStart : undefined,
        end_date: selectedPreset === "custom" ? customEnd : undefined,
        plan_code: txPlanFilter !== "all" ? txPlanFilter : undefined,
        search: txSearch.trim() || undefined,
        limit: 5000,
      });
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
      triggerBlobDownload(blob, `skillscatalyst_transactions_${timestamp}.csv`);
      setSuccessMsg("Transactions ledger exported securely as CSV.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to export transactions CSV.";
      setErrorMsg(msg);
    } finally {
      setExportingCsv(false);
    }
  };

  const handleExportRevenueCsv = async () => {
    setExportingCsv(true);
    setErrorMsg(null);
    try {
      const blob = await downloadRevenueSummaryCsv({
        preset: selectedPreset === "custom" ? undefined : selectedPreset,
        start_date: selectedPreset === "custom" ? customStart : undefined,
        end_date: selectedPreset === "custom" ? customEnd : undefined,
      });
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
      triggerBlobDownload(blob, `skillscatalyst_revenue_summary_${timestamp}.csv`);
      setSuccessMsg("Revenue summary report exported securely as CSV.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to export revenue summary CSV.";
      setErrorMsg(msg);
    } finally {
      setExportingCsv(false);
    }
  };

  const handleViewReceipt = async (merchantOrderId: string) => {
    setReceiptLoading(true);
    setErrorMsg(null);
    try {
      const r = await getAdminPaymentReceipt(merchantOrderId);
      setCurrentReceipt(r);
      setReceiptModalOpen(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load receipt.";
      setErrorMsg(msg);
    } finally {
      setReceiptLoading(false);
    }
  };

  const handleRunReconciliation = async () => {
    setReconciliationLoading(true);
    setErrorMsg(null);
    try {
      const summary = await runReconciliationBatch({
        preset: reconciliationPreset,
        status_filter: reconciliationStatusFilter,
        limit: 50,
      });
      setReconciliationSummary(summary);
      setSuccessMsg(
        `Reconciliation complete: ${summary.total_checked} evaluated, ${summary.matched_count} matched, ${summary.recovered_count} recovered.`
      );
      // Refresh transactions and metrics to reflect any recovered orders
      loadTransactions();
      loadMetrics();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to run reconciliation batch.";
      setErrorMsg(msg);
    } finally {
      setReconciliationLoading(false);
    }
  };

  const handleSingleOrderSync = async (merchantOrderId: string) => {
    setSingleSyncingOrder(merchantOrderId);
    setErrorMsg(null);
    try {
      const res = await reconcileSingleOrder(merchantOrderId);
      setSuccessMsg(`Order ${merchantOrderId}: ${res.message}`);
      loadTransactions();
      loadMetrics();
      if (reconciliationSummary) {
        // Update item in local reconciliation summary view
        const updatedItems = reconciliationSummary.items.map((it) =>
          it.merchant_order_id === merchantOrderId ? res.item : it
        );
        setReconciliationSummary({
          ...reconciliationSummary,
          items: updatedItems,
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to sync order.";
      setErrorMsg(msg);
    } finally {
      setSingleSyncingOrder(null);
    }
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
      {/* ── Top Header & Tab Controls ── */}
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
            Real-time PhonePe gateway transactions, collected cash revenue, secure CSV exports &amp; automated reconciliation
          </p>
        </div>

        {/* View Switcher Tabs & Refresh */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-slate-800/90 border border-slate-700/80 rounded-xl p-1 text-xs">
            <button
              onClick={() => setActiveTab("ledger")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "ledger"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              Transactions &amp; Metrics
            </button>
            <button
              onClick={() => setActiveTab("reconciliation")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "reconciliation"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Scale className="w-3.5 h-3.5 text-cyan-400" />
              Payment Reconciliation
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

      {/* Notifications / Alerts */}
      {errorMsg && (
        <div className="flex items-center justify-between p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-rose-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center justify-between p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* TAB 1: TRANSACTIONS & METRICS VIEW */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "ledger" && (
        <>
          {/* Date Filter & CSV Export Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 p-3.5 rounded-xl text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-slate-400 font-medium mr-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Date Filter:
              </span>
              {(["today", "7d", "30d", "all", "custom"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setSelectedPreset(p)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    selectedPreset === p
                      ? "bg-slate-700 text-white border border-slate-600"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {p === "7d" ? "7 Days" : p === "30d" ? "30 Days" : p === "all" ? "All Time" : p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>

            {/* CSV Export Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportTransactionsCsv}
                disabled={exportingCsv}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition-colors font-medium disabled:opacity-50"
                title="Export filtered transactions as formula-injection-safe CSV"
              >
                <Download className="w-3.5 h-3.5 text-purple-400" />
                <span>Export Ledger (CSV)</span>
              </button>
              <button
                onClick={handleExportRevenueCsv}
                disabled={exportingCsv}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition-colors font-medium disabled:opacity-50"
                title="Export executive revenue summary as CSV"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Export Revenue (CSV)</span>
              </button>
            </div>
          </div>

          {/* Custom Date Pickers */}
          {selectedPreset === "custom" && (
            <div className="flex flex-wrap items-center gap-3 bg-slate-900/40 border border-slate-800 p-3 rounded-xl text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Start Date:</span>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-white text-xs"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400">End Date:</span>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-white text-xs"
                />
              </div>
              <button
                onClick={loadMetrics}
                className="px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium"
              >
                Apply Range
              </button>
            </div>
          )}

          {/* ── Metric Summary Cards ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Collected Cash Revenue */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Collected Cash Revenue
                </span>
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <IndianRupee className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black text-white tracking-tight">
                  ₹{metrics ? formatRupees(metrics.total_collected_amount_in_paise) : "—"}
                </div>
                <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Verified successful paid transactions
                </p>
              </div>
            </div>

            {/* Card 2: Gross Value */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Gross Order Value
                </span>
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black text-white tracking-tight">
                  ₹{metrics ? formatRupees(metrics.gross_transaction_value_in_paise) : "—"}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Pre-discount catalog face value</p>
              </div>
            </div>

            {/* Card 3: Total Discounts Granted */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Coupon Discounts
                </span>
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                  <Tag className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black text-cyan-400 tracking-tight">
                  -₹{metrics ? formatRupees(metrics.total_discount_amount_in_paise) : "—"}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Subsidized promotional savings</p>
              </div>
            </div>

            {/* Card 4: Promotional Passes Count */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Free Promo Passes
                </span>
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                  <Gift className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black text-amber-300 tracking-tight">
                  {metrics ? metrics.promotional_pass_count : "—"}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">100% free passes (₹0 revenue impact)</p>
              </div>
            </div>
          </div>

          {/* ── Status Counts Ribbon ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Successful
              </span>
              <span className="font-bold text-white text-sm">{metrics?.successful_count || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" /> Pending
              </span>
              <span className="font-bold text-white text-sm">{metrics?.pending_count || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400 flex items-center gap-1.5">
                <XCircle className="w-3.5 h-3.5 text-rose-400" /> Failed
              </span>
              <span className="font-bold text-white text-sm">{metrics?.failed_count || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-slate-500" /> Cancelled
              </span>
              <span className="font-bold text-white text-sm">{metrics?.cancelled_count || 0}</span>
            </div>
          </div>

          {/* ── Plan & Coupon Breakdown Cards ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Plan Breakdown */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-purple-400" />
                  Revenue by Subscription Plan
                </h3>
                <span className="text-[11px] text-slate-500">{metrics?.by_plan.length || 0} plan(s)</span>
              </div>
              {metrics?.by_plan && metrics.by_plan.length > 0 ? (
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {metrics.by_plan.map((p) => (
                    <div
                      key={p.plan_code}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs"
                    >
                      <div>
                        <p className="font-semibold text-white">{p.plan_name}</p>
                        <p className="text-[10px] text-slate-400">{p.count} transaction(s)</p>
                      </div>
                      <div className="text-right font-bold text-emerald-400">
                        ₹{p.collected_amount_in_rupees.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic py-4 text-center">No plan sales in selected date range.</p>
              )}
            </div>

            {/* Coupons Breakdown */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Tag className="w-4 h-4 text-cyan-400" />
                  Coupon Redemptions &amp; Discounts
                </h3>
                <span className="text-[11px] text-slate-500">{metrics?.by_coupon.length || 0} coupon(s)</span>
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  Payment Transactions Ledger
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                    {txTotalCount} Total
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Server-authoritative transaction records with customer references and verified receipts
                </p>
              </div>

              {/* Search & Filters */}
              <div className="flex flex-wrap items-center gap-2">
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

                <select
                  value={txPlanFilter}
                  onChange={(e) => {
                    setTxPlanFilter(e.target.value);
                    setTxPage(1);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-purple-500 cursor-pointer"
                >
                  <option value="all">All Plans</option>
                  <option value="pro_monthly">Pro Monthly</option>
                  <option value="pro_yearly">Pro Yearly</option>
                  <option value="pro">Pro</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase font-semibold text-[10px]">
                    <th className="py-2.5 px-3">Order ID</th>
                    <th className="py-2.5 px-3">Student</th>
                    <th className="py-2.5 px-3">Plan</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">Discount</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Date (UTC)</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {txLoading ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-500">
                        <div className="flex items-center justify-center gap-2">
                          <RefreshCw className="w-4 h-4 animate-spin text-purple-400" />
                          <span>Loading transaction ledger...</span>
                        </div>
                      </td>
                    </tr>
                  ) : transactions.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-500 italic">
                        No transactions found matching your filters.
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
                        if (tx.amount_in_paise === 0) {
                          statusBadge = (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1 w-max">
                              <Gift className="w-2.5 h-2.5" />
                              Free Pass
                            </span>
                          );
                        } else {
                          statusBadge = (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 w-max">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              Success
                            </span>
                          );
                        }
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
                            <div className="flex items-center justify-end gap-1.5">
                              {tx.status === "success" && (
                                <button
                                  onClick={() => handleViewReceipt(tx.merchant_order_id)}
                                  disabled={receiptLoading}
                                  className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 transition-colors cursor-pointer border border-emerald-500/20"
                                  title="View official electronic receipt"
                                >
                                  <FileText className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                onClick={() => setSelectedTx(tx)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                                title="View transaction details"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            </div>
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
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Previous
                </button>
                <button
                  onClick={() => setTxPage((p) => Math.min(txTotalPages, p + 1))}
                  disabled={txPage >= txTotalPages || txLoading}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  Next <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* TAB 2: PAYMENT RECONCILIATION VIEW */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "reconciliation" && (
        <div className="space-y-5">
          {/* Reconciliation Controls Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Scale className="w-5 h-5 text-cyan-400" />
                  PhonePe Gateway Reconciliation Engine
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Compares SkillsCatalyst database transactions against authoritative PhonePe order states out-of-band.
                </p>
              </div>

              {/* Action Button */}
              <button
                onClick={handleRunReconciliation}
                disabled={reconciliationLoading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs shadow-sm transition-all disabled:opacity-50 cursor-pointer"
              >
                <RotateCw className={`w-3.5 h-3.5 ${reconciliationLoading ? "animate-spin" : ""}`} />
                <span>{reconciliationLoading ? "Running Reconciliation..." : "Run Batch Reconciliation"}</span>
              </button>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-800/80 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-medium">Evaluation Preset:</span>
                <select
                  value={reconciliationPreset}
                  onChange={(e) => setReconciliationPreset(e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs cursor-pointer"
                >
                  <option value="today">Today</option>
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                  <option value="all">All Available History</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-medium">Target Status:</span>
                <select
                  value={reconciliationStatusFilter}
                  onChange={(e) => setReconciliationStatusFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs cursor-pointer"
                >
                  <option value="pending">Pending Transactions (Recommended)</option>
                  <option value="success">Success Transactions</option>
                  <option value="all">All Statuses</option>
                </select>
              </div>
            </div>
          </div>

          {/* Reconciliation Batch Summary Metrics */}
          {reconciliationSummary && (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
                <p className="text-slate-400 font-medium">Checked</p>
                <p className="text-xl font-black text-white mt-1">{reconciliationSummary.total_checked}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Orders evaluated</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/90 border border-emerald-500/20 bg-emerald-500/5">
                <p className="text-emerald-400 font-medium">Matched</p>
                <p className="text-xl font-black text-emerald-300 mt-1">{reconciliationSummary.matched_count}</p>
                <p className="text-[10px] text-emerald-400/70 mt-0.5">Authoritatively aligned</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/90 border border-purple-500/20 bg-purple-500/5">
                <p className="text-purple-400 font-medium">Recovered</p>
                <p className="text-xl font-black text-purple-300 mt-1">{reconciliationSummary.recovered_count}</p>
                <p className="text-[10px] text-purple-400/70 mt-0.5">Idempotently provisioned</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/90 border border-amber-500/20 bg-amber-500/5">
                <p className="text-amber-400 font-medium">Review Required</p>
                <p className="text-xl font-black text-amber-300 mt-1">{reconciliationSummary.review_required_count}</p>
                <p className="text-[10px] text-amber-400/70 mt-0.5">Conflicts flagged</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
                <p className="text-slate-400 font-medium">Unresolved</p>
                <p className="text-xl font-black text-slate-300 mt-1">{reconciliationSummary.unresolved_count}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Gateway retry needed</p>
              </div>
            </div>
          )}

          {/* Reconciliation Detailed Items Table */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center justify-between">
              <span>Reconciliation Findings &amp; Outcomes</span>
              {reconciliationSummary && (
                <span className="text-xs text-slate-400 font-normal">
                  Ran at: {formatDate(reconciliationSummary.completed_at)}
                </span>
              )}
            </h4>

            {reconciliationSummary?.items && reconciliationSummary.items.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase font-semibold text-[10px]">
                      <th className="py-2.5 px-3">Order Reference</th>
                      <th className="py-2.5 px-3">Local DB</th>
                      <th className="py-2.5 px-3">PhonePe Status</th>
                      <th className="py-2.5 px-3">Outcome</th>
                      <th className="py-2.5 px-3">Action Taken</th>
                      <th className="py-2.5 px-3 text-right">Sync / Retry</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {reconciliationSummary.items.map((it) => {
                      let badge = (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                          {it.outcome}
                        </span>
                      );

                      if (it.outcome === "matched") {
                        badge = (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            MATCHED
                          </span>
                        );
                      } else if (it.outcome === "pending_recovered_success" || it.outcome === "missing_subscription_recovered") {
                        badge = (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            RECOVERED
                          </span>
                        );
                      } else if (it.outcome === "amount_mismatch" || it.outcome === "status_mismatch_review") {
                        badge = (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            NEEDS REVIEW
                          </span>
                        );
                      } else if (it.outcome === "provider_unavailable") {
                        badge = (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-700 text-slate-300">
                            UNRESOLVED
                          </span>
                        );
                      }

                      return (
                        <tr key={it.merchant_order_id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-3">
                            <p className="font-mono text-[11px] font-semibold text-white">{it.merchant_order_id}</p>
                            <p className="text-[10px] text-slate-400">{it.user_email || it.user_id}</p>
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-medium text-slate-200 uppercase text-[10px]">{it.local_status}</span>
                            <p className="text-[10px] text-slate-400">₹{(it.local_amount_in_paise / 100).toFixed(2)}</p>
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-medium text-slate-200 uppercase text-[10px]">
                              {it.provider_status || "—"}
                            </span>
                            {it.provider_amount_in_paise !== null && it.provider_amount_in_paise !== undefined && (
                              <p className="text-[10px] text-slate-400">
                                ₹{(it.provider_amount_in_paise / 100).toFixed(2)}
                              </p>
                            )}
                          </td>
                          <td className="py-3 px-3">{badge}</td>
                          <td className="py-3 px-3 text-slate-300 text-[11px] max-w-xs">
                            <p className="leading-snug">{it.action_taken}</p>
                            {it.error_detail && (
                              <p className="text-[10px] text-rose-400 mt-0.5">{it.error_detail}</p>
                            )}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => handleSingleOrderSync(it.merchant_order_id)}
                              disabled={singleSyncingOrder === it.merchant_order_id}
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium border border-slate-700 transition-colors disabled:opacity-40"
                              title="Re-query PhonePe and sync"
                            >
                              {singleSyncingOrder === it.merchant_order_id ? "Syncing..." : "Sync"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 italic space-y-2">
                <Scale className="w-8 h-8 mx-auto text-slate-600" />
                <p>No reconciliation run in this session. Click &quot;Run Batch Reconciliation&quot; above.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Transaction Details Modal ── */}
      {selectedTx && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-purple-400" />
                Transaction Inspection
              </h3>
              <button
                onClick={() => setSelectedTx(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800 space-y-2 font-mono text-[11px]">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-500 font-sans">Order ID:</span>
                  <span className="text-white font-semibold">{selectedTx.merchant_order_id}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-500 font-sans">Transaction UUID:</span>
                  <span className="text-slate-300">{selectedTx.id}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-500 font-sans">Status:</span>
                  <span className="uppercase font-bold text-purple-400">{selectedTx.status}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-500 font-sans">Plan:</span>
                  <span className="text-white font-sans">{selectedTx.plan_name} ({selectedTx.plan_code})</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-500 font-sans">Original Price:</span>
                  <span className="text-slate-300 font-sans">₹{formatRupees(selectedTx.original_amount_in_paise)}</span>
                </div>
                {selectedTx.discount_in_paise > 0 && (
                  <div className="flex justify-between py-1 border-b border-slate-800 text-purple-400">
                    <span className="font-sans">Discount ({selectedTx.coupon_code || "COUPON"}):</span>
                    <span className="font-sans">-₹{formatRupees(selectedTx.discount_in_paise)}</span>
                  </div>
                )}
                <div className="flex justify-between py-1 border-b border-slate-800 font-sans font-bold text-white">
                  <span>Net Charged:</span>
                  <span>₹{formatRupees(selectedTx.amount_in_paise)} {selectedTx.currency}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-500 font-sans">Student:</span>
                  <span className="text-slate-300 font-sans">{selectedTx.user_name || "N/A"} ({selectedTx.user_email || selectedTx.user_id})</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-500 font-sans">Created At:</span>
                  <span className="text-slate-400 font-sans">{formatDate(selectedTx.created_at)}</span>
                </div>
                {selectedTx.subscription_id && (
                  <div className="flex justify-between py-1 border-b border-slate-800 font-mono text-[11px]">
                    <span className="text-slate-500 font-sans">Subscription ID:</span>
                    <span>{selectedTx.subscription_id}</span>
                  </div>
                )}
                {selectedTx.failure_code && (
                  <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-sans">
                    <p className="font-semibold">Failure Code: {selectedTx.failure_code}</p>
                    <p className="text-[11px] mt-0.5">{selectedTx.failure_message}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              {selectedTx.status === "success" && (
                <button
                  onClick={() => {
                    handleViewReceipt(selectedTx.merchant_order_id);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>View Official Receipt</span>
                </button>
              )}
              <button
                onClick={() => setSelectedTx(null)}
                className="py-1.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Official Electronic Receipt Modal ── */}
      <PaymentReceiptModal
        receipt={currentReceipt}
        isOpen={receiptModalOpen}
        onClose={() => {
          setReceiptModalOpen(false);
          setCurrentReceipt(null);
        }}
      />
    </div>
  );
}
