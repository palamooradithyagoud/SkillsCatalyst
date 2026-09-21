/**
 * frontend/hooks/useSubscription.ts
 * React hook for consuming commercial subscription state and feature entitlements.
 * 
 * ARCHITECTURE WARNING:
 * This hook is exclusively for frontend presentation, UX badges, and client-side gating.
 * It is NEVER a security authority. All access gates are enforced authoritatively by the
 * FastAPI backend via database-backed verification.
 * 
 * Phase: Payments Phase 1 — Subscription + Entitlement Foundation
 */

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import {
  fetchMySubscription,
  MySubscriptionResponse,
  FALLBACK_FREE_SUBSCRIPTION,
  PlanCode,
  SubscriptionStatus,
  FeatureKey,
  EntitlementMap,
} from "@/lib/api/subscription";

export interface UseSubscriptionResult {
  data: MySubscriptionResponse;
  plan: PlanCode;
  isPremium: boolean;
  status: SubscriptionStatus;
  startedAt: string | null;
  expiresAt: string | null;
  cancelledAt: string | null | undefined;
  entitlements: EntitlementMap;
  canAccess: (featureKey: FeatureKey | string) => boolean;
  getLimit: (featureKey: FeatureKey | string) => number | null;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

export function useSubscription(): UseSubscriptionResult {
  const { session, isLoading: authLoading } = useAuth();
  const userId = session?.user_id;

  const {
    data = FALLBACK_FREE_SUBSCRIPTION,
    isLoading: queryLoading,
    isError,
    refetch,
  } = useQuery<MySubscriptionResponse>({
    queryKey: ["subscription", "me", userId ?? "anonymous"],
    queryFn: fetchMySubscription,
    enabled: !authLoading,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    refetchOnWindowFocus: true,
  });

  const plan = data?.plan ?? "free";
  const isPremium = Boolean(data?.is_premium);
  const status = data?.status ?? "active";
  const startedAt = data?.started_at ?? null;
  const expiresAt = data?.expires_at ?? null;
  const cancelledAt = data?.cancelled_at ?? null;
  const entitlements = data?.entitlements ?? FALLBACK_FREE_SUBSCRIPTION.entitlements;

  /**
   * Evaluates if a feature is accessible (access !== 'none').
   * Used for UI cues, locking icons, and upsell modals.
   */
  const canAccess = (featureKey: FeatureKey | string): boolean => {
    const ent = entitlements[featureKey];
    if (!ent) return false;
    return ent.access !== "none";
  };

  /**
   * Resolves the numeric cap for a feature, or null if unrestricted.
   */
  const getLimit = (featureKey: FeatureKey | string): number | null => {
    const ent = entitlements[featureKey];
    return ent ? ent.limit : null;
  };

  return {
    data,
    plan,
    isPremium,
    status,
    startedAt,
    expiresAt,
    cancelledAt,
    entitlements,
    canAccess,
    getLimit,
    isLoading: authLoading || queryLoading,
    isError,
    refetch,
  };
}
