"use client";

import React from "react";
import { Lock, Check, Sparkles } from "lucide-react";
import { UpgradeCTA } from "./UpgradeCTA";

export interface PremiumLockCardProps {
  title?: string;
  description?: string;
  benefits?: string[];
  ctaLabel?: string;
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  compact?: boolean;
  className?: string;
}

export function PremiumLockCard({
  title = "Unlock with Premium",
  description = "Get full access to all questions, solutions, personalized guidance, and unlimited resources.",
  benefits = [
    "Full question banks with company-specific patterns",
    "Curated solutions, test cases & video explanations",
    "Unlimited practice & AI mentor feedback",
  ],
  ctaLabel = "Upgrade to Premium — ₹99/mo",
  secondaryAction,
  compact = false,
  className = "",
}: PremiumLockCardProps) {
  if (compact) {
    return (
      <div
        data-testid="premium-lock-card-compact"
        className={`flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl border border-emerald-200/80 bg-linear-to-r from-emerald-50/70 via-white to-emerald-50/40 shadow-xs ${className}`}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-100/80 text-[#234B3B] flex items-center justify-center shrink-0 border border-emerald-200/60 shadow-2xs">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span>{title}</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                Premium
              </span>
            </h4>
            <p className="text-xs text-slate-600 line-clamp-1">{description}</p>
          </div>
        </div>
        <UpgradeCTA label={ctaLabel} size="sm" variant="primary" />
      </div>
    );
  }

  return (
    <div
      data-testid="premium-lock-card"
      className={`relative overflow-hidden rounded-2xl border border-emerald-900/15 bg-white p-6 sm:p-8 shadow-sm transition-all ${className}`}
    >
      {/* Subtle decorative background accent */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-radial from-emerald-100/40 via-transparent to-transparent pointer-events-none -mr-16 -mt-16" />

      <div className="relative z-10 max-w-xl mx-auto text-center flex flex-col items-center">
        {/* Lock icon pill */}
        <div className="w-12 h-12 rounded-2xl bg-[#234B3B]/10 text-[#234B3B] flex items-center justify-center mb-4 border border-[#234B3B]/20 shadow-2xs">
          <Lock className="w-5 h-5" />
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-900 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Premium Exclusive Feature</span>
        </div>

        {/* Heading & description */}
        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-2">
          {title}
        </h3>
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          {description}
        </p>

        {/* Benefits checklist */}
        {benefits && benefits.length > 0 && (
          <div className="w-full text-left bg-slate-50/80 rounded-xl p-4 mb-6 border border-slate-200/80">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">
              Included with Premium:
            </p>
            <ul className="space-y-2">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-2.5 text-xs text-slate-700">
                  <div className="w-4 h-4 rounded-full bg-emerald-100 text-[#234B3B] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 stroke-[2.5]" />
                  </div>
                  <span className="font-medium">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <UpgradeCTA
            label={ctaLabel}
            size="lg"
            variant="primary"
            className="w-full sm:w-auto justify-center"
          />
          {secondaryAction && (
            <button
              type="button"
              onClick={secondaryAction.onClick}
              className="w-full sm:w-auto px-4 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              {secondaryAction.label}
            </button>
          )}
        </div>

        <p className="text-[11px] text-slate-400 mt-4">
          Instant activation via PhonePe • Cancel anytime • Student-friendly pricing
        </p>
      </div>
    </div>
  );
}
