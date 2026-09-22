"use client";

import React from "react";
import { Sparkles, Calendar, CheckCircle, Crown } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { usePricingModal } from "@/contexts/PricingModalContext";
import { PremiumBadge } from "./PremiumBadge";
import { UpgradeCTA } from "./UpgradeCTA";

export interface SubscriptionStatusProps {
  compact?: boolean;
  collapsedIconOnly?: boolean;
  showUpgradeCTA?: boolean;
  variant?: "default" | "electric";
  className?: string;
}

export function SubscriptionStatus({
  compact = false,
  collapsedIconOnly = false,
  showUpgradeCTA = true,
  variant = "electric",
  className = "",
}: SubscriptionStatusProps) {
  const { isPremium, plan, expiresAt, status, isLoading } = useSubscription();
  const { openPricingModal } = usePricingModal();

  const formattedExpiry = expiresAt
    ? new Date(expiresAt).toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  if (collapsedIconOnly) {
    return (
      <button
        type="button"
        data-testid="subscription-status-collapsed"
        title={
          isPremium
            ? `Current Plan: Premium${formattedExpiry ? ` (Renews ${formattedExpiry})` : ""}`
            : "Current Plan: Free (Click to upgrade)"
        }
        onClick={() => !isPremium && openPricingModal()}
        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
          isPremium
            ? variant === "electric"
              ? "bg-white text-[#1f51ff] border border-[#1f51ff]/40 shadow-xs hover:bg-[#1f51ff]/10 dark:bg-slate-900 dark:border-[#1f51ff]/50"
              : "bg-slate-900 text-white border border-slate-700 dark:bg-black dark:border-white/30 dark:text-white shadow-xs"
            : "bg-slate-100 text-slate-500 border border-slate-200 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200"
        } ${className}`}
      >
        {isPremium ? (
          <Crown className={`w-4 h-4 ${variant === "electric" ? "text-[#1f51ff]" : "text-white"}`} />
        ) : (
          <Sparkles className="w-4 h-4 text-slate-500" />
        )}
      </button>
    );
  }

  if (compact) {
    const isElectric = variant === "electric";

    return (
      <div
        data-testid="subscription-status-compact"
        className={`p-2.5 rounded-xl border transition-all ${
          isPremium
            ? isElectric
              ? "bg-white dark:bg-slate-950 border-[#1f51ff]/30 dark:border-[#1f51ff]/50 shadow-xs text-slate-900 dark:text-white"
              : "bg-gradient-to-r from-black via-slate-950 to-slate-900 border-slate-800 text-white shadow-sm dark:bg-black dark:border-white/20 dark:text-white"
            : isElectric
            ? "bg-white dark:bg-slate-950 border-[#1f51ff]/25 shadow-xs text-slate-900 dark:text-white"
            : "border-slate-200/80 bg-slate-50/80 dark:bg-slate-900/60 dark:border-slate-800 text-slate-900 dark:text-white"
        } ${className}`}
      >
        <div className="flex items-center justify-between gap-1.5 mb-1.5">
          <span
            className={`text-[10px] font-bold uppercase tracking-wider ${
              isPremium
                ? isElectric
                  ? "text-[#1f51ff]"
                  : "text-slate-400 dark:text-slate-300"
                : "text-slate-500 dark:text-slate-400"
            }`}
          >
            Current Plan
          </span>
          {isPremium ? (
            <span
              data-testid="premium-badge-active"
              className={`inline-flex items-center font-bold tracking-tight rounded-full shadow-xs text-[10px] px-2 py-0.5 gap-1 ${
                isElectric
                  ? "bg-[#1f51ff] text-white border border-[#1f51ff] shadow-[0_0_10px_rgba(31,81,255,0.35)]"
                  : "bg-slate-800/90 text-white border border-slate-700 dark:bg-white dark:text-black dark:border-white"
              }`}
            >
              <Crown className={`w-3 h-3 shrink-0 ${isElectric ? "text-white" : "text-white dark:text-black"}`} />
              <span>Premium</span>
            </span>
          ) : (
            <PremiumBadge isPremium={false} size="xs" />
          )}
        </div>
        <div className="flex items-center justify-between gap-1.5 text-[11px]">
          {isPremium ? (
            isElectric ? (
              <span className="w-full py-1 px-2.5 rounded-lg bg-[#1f51ff] text-white font-semibold flex items-center gap-1.5 shadow-[0_0_10px_rgba(31,81,255,0.25)] truncate">
                <CheckCircle className="w-3.5 h-3.5 text-white shrink-0" />
                <span className="truncate">{formattedExpiry ? `Renews ${formattedExpiry}` : "Full Access Active"}</span>
              </span>
            ) : (
              <span className="text-white font-medium truncate flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-white shrink-0" />
                <span>{formattedExpiry ? `Renews ${formattedExpiry}` : "Full Access Active"}</span>
              </span>
            )
          ) : (
            <>
              <span className="text-slate-600 dark:text-slate-300 text-[10px] font-medium">Free Tier Limits</span>
              {showUpgradeCTA && (
                isElectric ? (
                  <button
                    type="button"
                    onClick={openPricingModal}
                    className="px-2.5 py-0.5 rounded-lg bg-[#1f51ff] hover:bg-[#1f51ff]/90 text-white font-bold text-[10px] shadow-[0_0_10px_rgba(31,81,255,0.4)] transition-all cursor-pointer"
                  >
                    Upgrade
                  </button>
                ) : (
                  <UpgradeCTA label="Upgrade" size="xs" variant="outline" />
                )
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      data-testid="subscription-status-card"
      className={`p-4 rounded-2xl border transition-all ${
        isPremium
          ? "bg-gradient-to-br from-black via-slate-950 to-slate-900 border-slate-800 text-white shadow-sm dark:bg-black dark:border-white/20 dark:text-white"
          : "bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800"
      } shadow-xs ${className}`}
    >
      <div className="flex items-center justify-between mb-3">
        <span
          className={`text-xs font-semibold uppercase tracking-wider ${
            isPremium ? "text-slate-400 dark:text-slate-300" : "text-slate-500 dark:text-slate-400"
          }`}
        >
          Current Plan
        </span>
        {isPremium ? (
          <span
            data-testid="premium-badge-active"
            className="inline-flex items-center font-bold tracking-tight rounded-full bg-slate-800/90 text-white border border-slate-700 dark:bg-white dark:text-black dark:border-white shadow-xs text-xs px-2.5 py-0.5 gap-1.5"
          >
            <Crown className="w-3.5 h-3.5 text-white dark:text-black shrink-0" />
            <span>Premium</span>
          </span>
        ) : (
          <PremiumBadge isPremium={false} size="sm" />
        )}
      </div>

      {isPremium ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium text-white">
            <CheckCircle className="w-4 h-4 text-white shrink-0" />
            <span>All Premium features unlocked</span>
          </div>
          {formattedExpiry && (
            <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-300 shrink-0" />
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
