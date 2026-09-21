"use client";

import React from "react";
import { Sparkles, Calendar, CheckCircle } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { PremiumBadge } from "./PremiumBadge";
import { UpgradeCTA } from "./UpgradeCTA";

export interface SubscriptionStatusProps {
  compact?: boolean;
  showUpgradeCTA?: boolean;
  className?: string;
}

export function SubscriptionStatus({
  compact = false,
  showUpgradeCTA = true,
  className = "",
}: SubscriptionStatusProps) {
  const { isPremium, plan, expiresAt, status, isLoading } = useSubscription();

  const formattedExpiry = expiresAt
    ? new Date(expiresAt).toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  if (compact) {
    return (
      <div
        data-testid="subscription-status-compact"
        className={`flex items-center justify-between gap-2 p-2.5 rounded-xl border border-slate-200/80 bg-slate-50/70 ${className}`}
      >
        <div className="flex items-center gap-2">
          <PremiumBadge isPremium={isPremium} size="xs" />
          {isPremium && formattedExpiry && (
            <span className="text-[11px] text-slate-500 font-medium">
              Until {formattedExpiry}
            </span>
          )}
        </div>
        {!isPremium && showUpgradeCTA && (
          <UpgradeCTA label="Upgrade" size="xs" variant="outline" />
        )}
      </div>
    );
  }

  return (
    <div
      data-testid="subscription-status-card"
      className={`p-4 rounded-2xl border ${
        isPremium
          ? "bg-gradient-to-br from-emerald-50/80 via-white to-emerald-50/40 border-emerald-200"
          : "bg-white border-slate-200"
      } shadow-xs ${className}`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Current Plan
        </span>
        <PremiumBadge isPremium={isPremium} size="sm" />
      </div>

      {isPremium ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-900">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>All Premium features unlocked</span>
          </div>
          {formattedExpiry && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Renews/expires on {formattedExpiry}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-slate-600 leading-relaxed">
            You are on the Free Plan with daily limits on saved courses, roadmaps, and AI reviews.
          </p>
          {showUpgradeCTA && (
            <UpgradeCTA
              label="Upgrade to Premium — ₹99"
              size="sm"
              variant="primary"
              className="w-full"
            />
          )}
        </div>
      )}
    </div>
  );
}
