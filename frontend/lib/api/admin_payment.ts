/**
 * frontend/lib/api/admin_payment.ts
 * API Client functions and TypeScript interfaces for Admin Payment Dashboard & Subscription Lifecycle Management.
 * Phase: Phase 6 — Admin Payment Dashboard & Subscription Lifecycle Management
 */

import { apiFetch, API_BASE, getAuthHeaders } from "./client";

export interface PlanBreakdownItem {
  plan_code: string;
  plan_name: string;
  count: number;
  collected_amount_in_paise: number;
  collected_amount_in_rupees: number;
}

export interface CouponBreakdownItem {
  coupon_code: string;
  redemption_count: number;
  total_discount_in_paise: number;
  total_discount_in_rupees: number;
}

export interface ActivityBucketItem {
  date: string;
  collected_amount_in_paise: number;
  collected_amount_in_rupees: number;
  transaction_count: number;
  successful_count: number;
}

export interface AdminPaymentMetricsDTO {
  total_collected_amount_in_paise: number;
  total_collected_amount_in_rupees: number;
  gross_transaction_value_in_paise: number;
  gross_transaction_value_in_rupees: number;
  total_discount_amount_in_paise: number;
  total_discount_amount_in_rupees: number;
  successful_count: number;
  pending_count: number;
  failed_count: number;
  cancelled_count: number;
  promotional_pass_count: number;
  currency: string;
  start_date?: string | null;
  end_date?: string | null;
  preset?: string | null;
  by_plan: PlanBreakdownItem[];
  by_coupon: CouponBreakdownItem[];
  activity: ActivityBucketItem[];
}

export interface AdminPaymentTransactionDTO {
  id: string;
  merchant_order_id: string;
  user_id: string;
  user_email?: string | null;
  user_name?: string | null;
  plan_code: string;
  plan_name: string;
  original_amount_in_paise: number;
  discount_in_paise: number;
  amount_in_paise: number;
  currency: string;
  coupon_code?: string | null;
  status: "created" | "pending" | "success" | "failed" | "cancelled";
  created_at: string;
  completed_at?: string | null;
  subscription_id?: string | null;
  provider: string;
  failure_code?: string | null;
  failure_message?: string | null;
}

export interface AdminTransactionsListResponse {
  transactions: AdminPaymentTransactionDTO[];
  total_count: number;
  page: number;
  limit: number;
  total_pages: number;
  has_more: boolean;
}

export interface AdminSubscriptionDTO {
  id: string;
  user_id: string;
  user_email?: string | null;
  user_name?: string | null;
  plan_id: string;
  plan_code: string;
  plan_name: string;
  status: "active" | "expired" | "cancelled";
  is_premium: boolean;
  started_at?: string | null;
  expires_at?: string | null;
  cancelled_at?: string | null;
  created_at: string;
  updated_at: string;
  recent_transaction?: {
    id: string;
    merchant_order_id: string;
    amount_in_paise: number;
    status: string;
    created_at: string;
  } | null;
  entitlements_summary: {
    tier: string;
    is_premium: boolean;
  };
}

export interface AdminSubscriptionsListResponse {
  subscriptions: AdminSubscriptionDTO[];
  total_count: number;
  page: number;
  limit: number;
  total_pages: number;
  has_more: boolean;
}

export interface AdminCancelSubscriptionResponse {
  success: boolean;
  subscription_id: string;
  user_id: string;
  status: "cancelled";
  cancelled_at: string;
  expires_at?: string | null;
  message: string;
  is_already_cancelled: boolean;
}

/**
 * Fetches authoritative platform payment telemetry and revenue breakdown.
 */
export async function fetchAdminPaymentMetrics(
  preset?: string,
  startDate?: string,
  endDate?: string
): Promise<AdminPaymentMetricsDTO> {
  const headers = await getAuthHeaders();
  const params = new URLSearchParams();
  if (preset) params.set("preset", preset);
  if (startDate) params.set("start_date", startDate);
  if (endDate) params.set("end_date", endDate);

  const qs = params.toString() ? `?${params.toString()}` : "";
  const res = await apiFetch(`${API_BASE}/api/admin/payments/overview${qs}`, {
    method: "GET",
    headers: {
      ...headers,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || err.message || `Failed to fetch payment metrics (${res.status})`);
  }

  return (await res.json()) as AdminPaymentMetricsDTO;
}

/**
 * Fetches paginated payment transactions ledger.
 */
export async function fetchAdminTransactions(params: {
  status?: string;
  startDate?: string;
  endDate?: string;
  planCode?: string;
  couponCode?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<AdminTransactionsListResponse> {
  const headers = await getAuthHeaders();
  const qp = new URLSearchParams();
  if (params.status) qp.set("status", params.status);
  if (params.startDate) qp.set("start_date", params.startDate);
  if (params.endDate) qp.set("end_date", params.endDate);
  if (params.planCode) qp.set("plan_code", params.planCode);
  if (params.couponCode) qp.set("coupon_code", params.couponCode);
  if (params.search) qp.set("search", params.search);
  if (params.page) qp.set("page", String(params.page));
  if (params.limit) qp.set("limit", String(params.limit));

  const qs = qp.toString() ? `?${qp.toString()}` : "";
  const res = await apiFetch(`${API_BASE}/api/admin/payments/transactions${qs}`, {
    method: "GET",
    headers: {
      ...headers,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || err.message || `Failed to fetch transactions (${res.status})`);
  }

  return (await res.json()) as AdminTransactionsListResponse;
}

/**
 * Fetches paginated user subscriptions ledger.
 */
export async function fetchAdminSubscriptions(params: {
  status?: string;
  planCode?: string;
  search?: string;
  expiresBefore?: string;
  expiresAfter?: string;
  page?: number;
  limit?: number;
}): Promise<AdminSubscriptionsListResponse> {
  const headers = await getAuthHeaders();
  const qp = new URLSearchParams();
  if (params.status) qp.set("status", params.status);
  if (params.planCode) qp.set("plan_code", params.planCode);
  if (params.search) qp.set("search", params.search);
  if (params.expiresBefore) qp.set("expires_before", params.expiresBefore);
  if (params.expiresAfter) qp.set("expires_after", params.expiresAfter);
  if (params.page) qp.set("page", String(params.page));
  if (params.limit) qp.set("limit", String(params.limit));

  const qs = qp.toString() ? `?${qp.toString()}` : "";
  const res = await apiFetch(`${API_BASE}/api/admin/subscriptions${qs}`, {
    method: "GET",
    headers: {
      ...headers,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || err.message || `Failed to fetch subscriptions (${res.status})`);
  }

  return (await res.json()) as AdminSubscriptionsListResponse;
}

/**
 * Safely cancels future subscription renewal.
 */
export async function cancelAdminSubscription(
  subscriptionId: string,
  reason?: string
): Promise<AdminCancelSubscriptionResponse> {
  const headers = await getAuthHeaders();
  const res = await apiFetch(`${API_BASE}/api/admin/subscriptions/${subscriptionId}/cancel`, {
    method: "POST",
    headers: {
      ...headers,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ reason }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || err.message || `Failed to cancel subscription (${res.status})`);
  }

  return (await res.json()) as AdminCancelSubscriptionResponse;
}
