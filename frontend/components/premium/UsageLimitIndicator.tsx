"use client";

import React from "react";
import { Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
import { usePricingModal } from "@/contexts/PricingModalContext";

export interface UsageLimitIndicatorProps {
  used: number;
  limit: number | null;
  unitName: string;
  isPremium?: boolean;
  showUpgradePrompt?: boolean;
  compact?: boolean;
  className?: string;
}

export function UsageLimitIndicator({
  used,
  limit,
  unitName,
  isPremium = false,
  showUpgradePrompt = true,
  compact = false,
  className = "",
}: UsageLimitIndicatorProps) {
  const { openPricingModal } = usePricingModal();

  // If user is premium or limit is null, unlimited usage
  if (isPremium || limit === null) {
    if (compact) {
      return (
        <span
          data-testid="usage-indicator-unlimited"
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 ${className}`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Unlimited {unitName}</span>
        </span>
      );
    }

    return (
      <div
        data-testid="usage-indicator-unlimited-full"
        className={`flex items-center justify-between p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/60 ${className}`}
      >
        <div className="flex items-center gap-2 text-xs font-medium text-emerald-900">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Premium Plan: Unlimited {unitName}</span>
        </div>
      </div>
    );
  }

  const isLimitReached = used >= limit;
  const percent = Math.min(100, Math.round((used / Math.max(1, limit)) * 100));

  if (compact) {
    return (
      <div
        data-testid="usage-indicator-compact"
        className={`inline-flex items-center gap-2 px-2.5 py-1 text-xs rounded-full border ${
          isLimitReached
            ? "bg-amber-50 text-amber-900 border-amber-200"
            : "bg-slate-50 text-slate-700 border-slate-200"
        } ${className}`}
      >
        <span className="font-semibold">
          {used}/{limit} {unitName}
        </span>
        {isLimitReached && showUpgradePrompt && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openPricingModal();
            }}
            className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 underline underline-offset-2 ml-1 cursor-pointer"
          >
            Upgrade
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      data-testid="usage-indicator-box"
      className={`p-3.5 rounded-xl border transition-all ${
        isLimitReached
          ? "bg-amber-50/70 border-amber-200 text-amber-900"
          : "bg-slate-50/80 border-slate-200 text-slate-800"
      } ${className}`}
    >
      <div className="flex items-center justify-between text-xs mb-1.5">
        <div className="flex items-center gap-1.5 font-medium">
          {isLimitReached ? (
            <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          ) : (
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
          )}
          <span>
            {used} of {limit} {unitName} used
          </span>
        </div>
        <span className="font-semibold text-slate-500 text-[11px]">Free Plan</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200/80 rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-full transition-all duration-300 rounded-full ${
            isLimitReached ? "bg-amber-500" : "bg-[#234B3B]"
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>

      {isLimitReached && showUpgradePrompt && (
        <div className="mt-2.5 pt-2 border-t border-amber-200/60 flex items-center justify-between">
          <p className="text-[11px] text-amber-800 font-medium">
            Free quota reached. Upgrade for unlimited access.
          </p>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openPricingModal();
            }}
            className="inline-flex items-center gap-1 text-xs font-bold text-[#234B3B] hover:text-[#1b3b2e] cursor-pointer bg-white px-2 py-0.5 rounded-md border border-amber-300/80 shadow-2xs"
          >
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>Upgrade</span>
          </button>
        </div>
      )}
    </div>
  );
}
