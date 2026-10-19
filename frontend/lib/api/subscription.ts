/**
 * frontend/lib/api/subscription.ts
 * API Client functions and TypeScript interfaces for SkillsCatalyst Subscription & Entitlement system.
 * Phase: Payments Phase 1 — Subscription + Entitlement Foundation
 */

import { apiFetch, API_BASE, getAuthHeaders } from "./client";

export type PlanCode = "free" | "premium_monthly" | "premium_3_month";

export type SubscriptionStatus = "active" | "expired" | "cancelled";

export type AccessLevel = "none" | "limited" | "full";

export type FeatureKey =
  | "saved_videos"
  | "company_interview_questions"
  | "placement_prep"
  | "scholarships"
  | "tech_news"
  | "ai_mentor"
  | "roadmaps";

export interface EntitlementDetail {
  access: AccessLevel;
  limit: number | null;
}

export type EntitlementMap = Record<string, EntitlementDetail>;

export interface SubscriptionPlan {
  id?: string;
  code: PlanCode;
  name: string;
  description: string | null;
  price_in_paise: number;
  currency: string;
  duration_days: number | null;
  is_active: boolean;
}

export type SubscriptionPlanDTO = SubscriptionPlan;

export interface MySubscriptionResponse {
  plan: PlanCode;
  status: SubscriptionStatus;
  is_premium: boolean;
  started_at: string | null;
  expires_at: string | null;
  cancelled_at?: string | null;
  entitlements: EntitlementMap;
}

/**
 * Fallback free tier subscription response when offline or unauthenticated.
 */
export const FALLBACK_FREE_SUBSCRIPTION: MySubscriptionResponse = {
  plan: "free",
  status: "active",
  is_premium: false,
  started_at: null,
  expires_at: null,
  cancelled_at: null,
  entitlements: {
    saved_videos: { access: "limited", limit: 1 },
    company_interview_questions: { access: "none", limit: null },
    placement_prep: { access: "none", limit: null },
    scholarships: { access: "limited", limit: null },
    tech_news: { access: "limited", limit: 2 },
    ai_mentor: { access: "limited", limit: null },
    roadmaps: { access: "limited", limit: null },
  },
};

/**
 * Fetches the public list of active subscription plans with canonical integer paise pricing.
 */
export async function fetchSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  try {
    const res = await apiFetch(`${API_BASE}/api/subscriptions/plans`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch plans: ${res.status} ${res.statusText}`);
    }

    return (await res.json()) as SubscriptionPlan[];
  } catch (err) {
    console.error("[SubscriptionAPI] Error fetching subscription plans:", err);
    return [
      {
        code: "free",
        name: "Free",
        description: "Essential foundational access to explore skills",
        price_in_paise: 0,
        currency: "INR",
        duration_days: null,
        is_active: true,
      },
      {
        code: "premium_monthly",
        name: "Premium Monthly",
        description: "Fast-paced interview sprint preparation with unrestricted access",
        price_in_paise: 9900,
        currency: "INR",
        duration_days: 30,
        is_active: true,
      },
      {
        code: "premium_3_month",
        name: "Premium 3 Months",
        description: "Complete 90-day placement preparation pack (Save ~16%)",
        price_in_paise: 25000,
        currency: "INR",
        duration_days: 90,
        is_active: true,
      },
    ];
  }
}

/**
 * Fetches the current authenticated user's effective subscription and feature entitlements.
 */
export async function fetchMySubscription(): Promise<MySubscriptionResponse> {
  const headers = await getAuthHeaders();
  if (!headers.Authorization) {
    // If not authenticated, return default free tier
    return FALLBACK_FREE_SUBSCRIPTION;
  }

  try {
    const res = await apiFetch(`${API_BASE}/api/subscriptions/me`, {
      method: "GET",
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (res.status === 401) {
      return FALLBACK_FREE_SUBSCRIPTION;
    }

    if (!res.ok) {
      throw new Error(`Failed to fetch subscription: ${res.status} ${res.statusText}`);
    }

    return (await res.json()) as MySubscriptionResponse;
  } catch (err) {
    console.warn("[SubscriptionAPI] Could not resolve server subscription, falling back to free tier:", err);
    return FALLBACK_FREE_SUBSCRIPTION;
  }
}

// =============================================================================
// Admin Commercial Plans & Pricing API Functions
// =============================================================================

export interface AdminSubscriptionPlan extends SubscriptionPlan {
  created_at?: string;
  updated_at?: string;
}

export interface CreatePlanPayload {
  code: string;
  name: string;
  description?: string | null;
  price_in_paise: number;
  currency?: string;
  duration_days?: number | null;
  is_active?: boolean;
}

export interface UpdatePlanPayload {
  name?: string;
  description?: string | null;
  price_in_paise?: number;
  duration_days?: number | null;
  is_active?: boolean;
}

/**
 * Admin: Fetches all subscription plans (active and inactive).
 */
export async function fetchAdminPlans(): Promise<AdminSubscriptionPlan[]> {
  const headers = await getAuthHeaders();
  const res = await apiFetch(`${API_BASE}/api/admin/plans`, {
    method: "GET",
    headers: {
      ...headers,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.detail || `Failed to fetch admin plans (${res.status})`);
  }

  return (await res.json()) as AdminSubscriptionPlan[];
}

/**
 * Admin: Creates a new subscription plan with authoritative pricing and duration.
 */
export async function createAdminPlan(payload: CreatePlanPayload): Promise<AdminSubscriptionPlan> {
  const headers = await getAuthHeaders();
  const res = await apiFetch(`${API_BASE}/api/admin/plans`, {
    method: "POST",
    headers: {
      ...headers,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.detail || `Failed to create plan (${res.status})`);
  }

  return (await res.json()) as AdminSubscriptionPlan;
}

/**
 * Admin: Updates an existing subscription plan.
 */
export async function updateAdminPlan(
  planId: string,
  payload: UpdatePlanPayload
): Promise<AdminSubscriptionPlan> {
  const headers = await getAuthHeaders();
  const res = await apiFetch(`${API_BASE}/api/admin/plans/${encodeURIComponent(planId)}`, {
    method: "PUT",
    headers: {
      ...headers,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.detail || `Failed to update plan (${res.status})`);
  }

  return (await res.json()) as AdminSubscriptionPlan;
}

/**
 * Admin: Activates or deactivates a subscription plan.
 */
export async function setAdminPlanStatus(
  planId: string,
  isActive: boolean
): Promise<AdminSubscriptionPlan> {
  const headers = await getAuthHeaders();
  const res = await apiFetch(`${API_BASE}/api/admin/plans/${encodeURIComponent(planId)}/status`, {
    method: "PATCH",
    headers: {
      ...headers,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ is_active: isActive }),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.detail || `Failed to update plan status (${res.status})`);
  }

  return (await res.json()) as AdminSubscriptionPlan;
}

