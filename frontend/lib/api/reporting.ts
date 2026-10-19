/**
 * frontend/lib/api/reporting.ts
 * API client methods and types for Financial Reporting, Receipts, Secure CSV Exports,
 * and Payment Reconciliation.
 * Phase: Phase 7 — Financial Reporting, Receipts, CSV Exports & Payment Reconciliation
 */

import { apiFetch, API_BASE, getAuthHeaders } from "./client";
import { AdminPaymentMetricsDTO } from "./admin_payment";

export interface PaymentReceiptDTO {
  receipt_id: string;
  receipt_type: "payment_receipt" | "promotional_confirmation";
  merchant_order_id: string;
  provider_order_id?: string | null;
  payment_date: string;
  customer_id: string;
  customer_name?: string | null;
  customer_email?: string | null;
  plan_code: string;
  plan_name: string;
  duration_days: number;
  original_amount_in_paise: number;
  original_amount_in_rupees: number;
  discount_in_paise: number;
  discount_in_rupees: number;
  coupon_code?: string | null;
  amount_paid_in_paise: number;
  amount_paid_in_rupees: number;
  currency: string;
  payment_status: "PAID" | "PROMOTIONAL_GRANT";
  subscription_id?: string | null;
  subscription_started_at?: string | null;
  subscription_expires_at?: string | null;
  generated_at: string;
  is_promotional: boolean;
  disclaimer: string;
  platform_name: string;
  platform_url: string;
  support_email: string;
}

export type ReconciliationOutcome =
  | "matched"
  | "pending_recovered_success"
  | "pending_marked_failed"
  | "amount_mismatch"
  | "currency_mismatch"
  | "status_mismatch_review"
  | "missing_provider_ref"
  | "missing_subscription_recovered"
  | "coupon_inconsistency"
  | "provider_unavailable";

export interface ReconciliationItemDTO {
  merchant_order_id: string;
  user_id: string;
  user_email?: string | null;
  plan_code: string;
  local_status: string;
  local_amount_in_paise: number;
  local_currency: string;
  provider_status?: string | null;
  provider_amount_in_paise?: number | null;
  provider_currency?: string | null;
  provider_order_id?: string | null;
  outcome: ReconciliationOutcome;
  action_taken: string;
  requires_review: boolean;
  reconciled_at: string;
  error_detail?: string | null;
}

export interface ReconciliationSummaryDTO {
  total_checked: number;
  matched_count: number;
  recovered_count: number;
  mismatches_count: number;
  unresolved_count: number;
  review_required_count: number;
  started_at: string;
  completed_at: string;
  items: ReconciliationItemDTO[];
}

export interface SingleReconciliationResponse {
  success: boolean;
  item: ReconciliationItemDTO;
  message: string;
}

/**
 * Retrieves the electronic receipt or promotional pass confirmation for a student's completed payment.
 */
export async function getPaymentReceipt(merchantOrderId: string): Promise<PaymentReceiptDTO> {
  const headers = await getAuthHeaders();
  const res = await apiFetch(`${API_BASE}/api/payments/receipt/${encodeURIComponent(merchantOrderId)}`, {
    method: "GET",
    headers,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Failed to fetch receipt" }));
    throw new Error(err.detail || `Failed to fetch receipt (${res.status})`);
  }

  return res.json();
}

/**
 * Retrieves the electronic receipt for any payment transaction (Admin only).
 */
export async function getAdminPaymentReceipt(merchantOrderId: string): Promise<PaymentReceiptDTO> {
  const headers = await getAuthHeaders();
  const res = await apiFetch(`${API_BASE}/api/admin/payments/receipt/${encodeURIComponent(merchantOrderId)}`, {
    method: "GET",
    headers,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Failed to fetch admin receipt" }));
    throw new Error(err.detail || `Failed to fetch admin receipt (${res.status})`);
  }

  return res.json();
}

/**
 * Fetches authoritative financial reports over a selected date range preset (Admin only).
 */
export async function getFinancialReport(params?: {
  preset?: string;
  start_date?: string;
  end_date?: string;
}): Promise<AdminPaymentMetricsDTO> {
  const headers = await getAuthHeaders();
  const searchParams = new URLSearchParams();
  if (params?.preset) searchParams.set("preset", params.preset);
  if (params?.start_date) searchParams.set("start_date", params.start_date);
  if (params?.end_date) searchParams.set("end_date", params.end_date);

  const res = await apiFetch(`${API_BASE}/api/admin/reports/financial?${searchParams.toString()}`, {
    method: "GET",
    headers,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Failed to fetch financial report" }));
    throw new Error(err.detail || `Failed to fetch financial report (${res.status})`);
  }

  return res.json();
}

/**
 * Triggers secure CSV download of payment transactions ledger with applied filters.
 */
export async function downloadTransactionsCsv(filters?: {
  status?: string;
  preset?: string;
  start_date?: string;
  end_date?: string;
  plan_code?: string;
  coupon_code?: string;
  search?: string;
  limit?: number;
}): Promise<Blob> {
  const headers = await getAuthHeaders();
  const searchParams = new URLSearchParams();
  if (filters?.status) searchParams.set("status", filters.status);
  if (filters?.preset) searchParams.set("preset", filters.preset);
  if (filters?.start_date) searchParams.set("start_date", filters.start_date);
  if (filters?.end_date) searchParams.set("end_date", filters.end_date);
  if (filters?.plan_code) searchParams.set("plan_code", filters.plan_code);
  if (filters?.coupon_code) searchParams.set("coupon_code", filters.coupon_code);
  if (filters?.search) searchParams.set("search", filters.search);
  if (filters?.limit) searchParams.set("limit", filters.limit.toString());

  const res = await apiFetch(`${API_BASE}/api/admin/reports/export/transactions.csv?${searchParams.toString()}`, {
    method: "GET",
    headers,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Failed to export transactions CSV" }));
    throw new Error(err.detail || `Export failed (${res.status})`);
  }

  return res.blob();
}

/**
 * Triggers secure CSV download of the authoritative executive revenue summary report.
 */
export async function downloadRevenueSummaryCsv(filters?: {
  preset?: string;
  start_date?: string;
  end_date?: string;
}): Promise<Blob> {
  const headers = await getAuthHeaders();
  const searchParams = new URLSearchParams();
  if (filters?.preset) searchParams.set("preset", filters.preset);
  if (filters?.start_date) searchParams.set("start_date", filters.start_date);
  if (filters?.end_date) searchParams.set("end_date", filters.end_date);

  const res = await apiFetch(`${API_BASE}/api/admin/reports/export/revenue-summary.csv?${searchParams.toString()}`, {
    method: "GET",
    headers,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Failed to export revenue summary CSV" }));
    throw new Error(err.detail || `Export failed (${res.status})`);
  }

  return res.blob();
}

/**
 * Triggers a bounded payment reconciliation batch job against PhonePe gateway.
 */
export async function runReconciliationBatch(payload?: {
  preset?: string;
  status_filter?: string;
  limit?: number;
}): Promise<ReconciliationSummaryDTO> {
  const headers = await getAuthHeaders();
  headers["Content-Type"] = "application/json";

  const res = await apiFetch(`${API_BASE}/api/admin/reconciliation/run`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      preset: payload?.preset || "30d",
      status_filter: payload?.status_filter || "pending",
      limit: payload?.limit || 50,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Failed to run reconciliation batch" }));
    throw new Error(err.detail || `Reconciliation failed (${res.status})`);
  }

  return res.json();
}

/**
 * Authoritatively reconciles and syncs a single order against PhonePe.
 */
export async function reconcileSingleOrder(merchantOrderId: string): Promise<SingleReconciliationResponse> {
  const headers = await getAuthHeaders();
  const res = await apiFetch(
    `${API_BASE}/api/admin/reconciliation/transaction/${encodeURIComponent(merchantOrderId)}/sync`,
    {
      method: "POST",
      headers,
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Failed to reconcile single order" }));
    throw new Error(err.detail || `Sync failed (${res.status})`);
  }

  return res.json();
}
