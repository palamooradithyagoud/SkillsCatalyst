"use client";

import React from "react";
import { useSubscription } from "@/hooks/useSubscription";
import { FeatureKey } from "@/lib/api/subscription";
import { PremiumLockCard } from "./PremiumLockCard";

export interface PremiumGateProps {
  children: React.ReactNode;
  featureKey?: FeatureKey | string;
  requiresPremium?: boolean;
  fallback?: React.ReactNode;
  lockTitle?: string;
  lockDescription?: string;
  lockBenefits?: string[];
  ctaLabel?: string;
  compact?: boolean;
  className?: string;
}

export function PremiumGate({
  children,
  featureKey,
  requiresPremium = false,
  fallback,
  lockTitle,
  lockDescription,
  lockBenefits,
  ctaLabel,
  compact = false,
  className = "",
}: PremiumGateProps) {
  const { isPremium, canAccess, isLoading } = useSubscription();

  // If loading, we render children or null depending on standard practices.
  // Gating is visual; if auth/sub is still initializing, let it render or show placeholder
  // but once resolved:
  const hasAccess = requiresPremium
    ? isPremium
    : featureKey
    ? canAccess(featureKey)
    : isPremium;

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div data-testid="premium-gate-locked" className={className}>
      <PremiumLockCard
        title={lockTitle}
        description={lockDescription}
        benefits={lockBenefits}
        ctaLabel={ctaLabel}
        compact={compact}
      />
    </div>
  );
}
