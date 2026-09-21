/**
 * frontend/lib/api/payment.ts
 * API Client functions and TypeScript interfaces for PhonePe commercial payments.
 * Phase: Payments Phase 2 — PhonePe Payment Integration (Backend-First)
 */

import { apiFetch, API_BASE, getAuthHeaders } from "./client";

export type PaymentStatus = "created" | "pending" | "success" | "failed" | "cancelled";

export interface CreatePaymentOrderResponse {
  success: boolean;
  merchant_order_id: string;
  checkout_url: string;
  amount_in_paise: number;
  currency: string;
  plan_code: string;
}

export interface PaymentStatusResponse {
  merchant_order_id: string;
  status: PaymentStatus;
  is_completed: boolean;
  plan_code: string;
  amount_in_paise: number;
  created_at?: string;
}

export interface PaymentTransactionDTO {
  id: string;
  merchant_order_id: string;
  provider_order_id?: string | null;
  plan_code: string;
  plan_name: string;
  amount_in_paise: number;
  currency: string;
  status: PaymentStatus;
  created_at: string;
}

/**
 * Initiates a server-authoritative commercial checkout order for a target plan.
 * Returns the PhonePe Standard Checkout redirect URL.
 */
export async function createPaymentOrder(
  planCode: "premium_monthly" | "premium_3_month" | string
): Promise<CreatePaymentOrderResponse> {
  const headers = await getAuthHeaders();
  const res = await apiFetch(`${API_BASE}/api/payments/create-order`, {
    method: "POST",
    headers: {
      ...headers,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ plan_code: planCode }),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(
      errorBody.detail || errorBody.message || `Failed to create payment order (${res.status})`
    );
  }

  return (await res.json()) as CreatePaymentOrderResponse;
}

/**
 * Polls or verifies authoritative payment status by merchant order ID.
 */
export async function fetchPaymentStatus(
  merchantOrderId: string
): Promise<PaymentStatusResponse> {
  const headers = await getAuthHeaders();
  const res = await apiFetch(`${API_BASE}/api/payments/status/${merchantOrderId}`, {
    method: "GET",
    headers: {
      ...headers,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to check payment status (${res.status})`);
  }

  return (await res.json()) as PaymentStatusResponse;
}

/**
 * Fetches the authenticated student's payment history.
 */
export async function fetchPaymentHistory(): Promise<PaymentTransactionDTO[]> {
  const headers = await getAuthHeaders();
  const res = await apiFetch(`${API_BASE}/api/payments/history`, {
    method: "GET",
    headers: {
      ...headers,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch payment history (${res.status})`);
  }

  return (await res.json()) as PaymentTransactionDTO[];
}
