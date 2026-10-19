/**
 * frontend/lib/api/coupon.ts
 * API Client functions and TypeScript interfaces for Admin promotional coupons.
 * Phase: Phase 4 — Admin-Controlled Coupons & Promotional Campaigns
 */

import { apiFetch, API_BASE, getAuthHeaders } from "./client";

export type DiscountType = "percentage" | "fixed_amount";

export interface CouponAdminDTO {
  id: string;
  code: string;
  description?: string | null;
  discount_type: DiscountType;
  discount_value: number;
  max_discount_in_paise?: number | null;
  min_order_in_paise: number;
  start_at: string;
  expires_at?: string | null;
  max_uses?: number | null;
  max_uses_per_user: number;
  used_count: number;
  is_active: boolean;
  eligible_plan_codes?: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface CreateCouponPayload {
  code: string;
  description?: string;
  discount_type: DiscountType;
  discount_value: number;
  max_discount_in_paise?: number | null;
  min_order_in_paise?: number;
  start_at?: string | null;
  expires_at?: string | null;
  max_uses?: number | null;
  max_uses_per_user?: number;
  eligible_plan_codes?: string[] | null;
  is_active?: boolean;
}

export interface UpdateCouponPayload {
  description?: string;
  discount_type?: DiscountType;
  discount_value?: number;
  max_discount_in_paise?: number | null;
  min_order_in_paise?: number;
  start_at?: string | null;
  expires_at?: string | null;
  max_uses?: number | null;
  max_uses_per_user?: number;
  eligible_plan_codes?: string[] | null;
  is_active?: boolean;
}

/**
 * Fetches all promotional coupons for the Admin CMS.
 */
export async function fetchAdminCoupons(): Promise<CouponAdminDTO[]> {
  const headers = await getAuthHeaders();
  const res = await apiFetch(`${API_BASE}/api/admin/coupons`, {
    method: "GET",
    headers: {
      ...headers,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || err.message || `Failed to fetch coupons (${res.status})`);
  }

  return (await res.json()) as CouponAdminDTO[];
}

/**
 * Creates a new promotional campaign coupon.
 */
export async function createAdminCoupon(
  payload: CreateCouponPayload
): Promise<CouponAdminDTO> {
  const headers = await getAuthHeaders();
  const res = await apiFetch(`${API_BASE}/api/admin/coupons`, {
    method: "POST",
    headers: {
      ...headers,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || err.message || `Failed to create coupon (${res.status})`);
  }

  return (await res.json()) as CouponAdminDTO;
}

/**
 * Updates an existing coupon.
 */
export async function updateAdminCoupon(
  couponId: string,
  payload: UpdateCouponPayload
): Promise<CouponAdminDTO> {
  const headers = await getAuthHeaders();
  const res = await apiFetch(`${API_BASE}/api/admin/coupons/${couponId}`, {
    method: "PUT",
    headers: {
      ...headers,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || err.message || `Failed to update coupon (${res.status})`);
  }

  return (await res.json()) as CouponAdminDTO;
}

/**
 * Activates or deactivates a coupon.
 */
export async function setAdminCouponStatus(
  couponId: string,
  isActive: boolean
): Promise<CouponAdminDTO> {
  const headers = await getAuthHeaders();
  const res = await apiFetch(`${API_BASE}/api/admin/coupons/${couponId}/status`, {
    method: "PATCH",
    headers: {
      ...headers,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ is_active: isActive }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || err.message || `Failed to update status (${res.status})`);
  }

  return (await res.json()) as CouponAdminDTO;
}

/**
 * Immediately expires a coupon.
 */
export async function expireAdminCoupon(
  couponId: string
): Promise<CouponAdminDTO> {
  const headers = await getAuthHeaders();
  const res = await apiFetch(`${API_BASE}/api/admin/coupons/${couponId}/expire`, {
    method: "POST",
    headers: {
      ...headers,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || err.message || `Failed to expire coupon (${res.status})`);
  }

  return (await res.json()) as CouponAdminDTO;
}
