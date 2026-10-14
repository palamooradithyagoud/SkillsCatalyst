"use client";

import React from "react";
import { Lock, Check } from "lucide-react";
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
        className={`flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl border border-purple-200/90 dark:border-neutral-800 bg-white dark:bg-[#18191F] shadow-xs ${className}`}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white dark:bg-[#121318] text-[#7C3AED] dark:text-[#C4B5FD] flex items-center justify-center shrink-0 border border-purple-200 dark:border-neutral-800 shadow-2xs">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-black text-black dark:text-white flex items-center gap-1.5">
              <span>{title}</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-white dark:bg-[#121318] text-[#7C3AED] dark:text-[#C4B5FD] border border-purple-200 dark:border-neutral-800">
                Premium
              </span>
            </h4>
            <p className="text-xs text-[#7C3AED] dark:text-[#C4B5FD] line-clamp-1 font-medium">{description}</p>
          </div>
        </div>
        <UpgradeCTA label={ctaLabel} size="sm" variant="purple" icon="none" />
      </div>
    );
  }

  return (
    <div
      data-testid="premium-lock-card"
      className={`relative overflow-hidden rounded-2xl border border-purple-200/90 dark:border-neutral-800 bg-white dark:bg-[#18191F] p-6 sm:p-8 shadow-md transition-all ${className}`}
    >
      <div className="relative z-10 max-w-xl mx-auto text-center flex flex-col items-center">
        {/* Lock icon pill */}
        <div className="w-12 h-12 rounded-2xl bg-white dark:bg-[#121318] text-[#7C3AED] dark:text-[#C4B5FD] flex items-center justify-center mb-4 border border-purple-200 dark:border-neutral-800 shadow-2xs">
          <Lock className="w-5 h-5 text-[#7C3AED] dark:text-[#C4B5FD]" />
        </div>

        {/* Badge - without AI sparkle logo */}
        <div className="inline-flex items-center px-3.5 py-1 rounded-full bg-white dark:bg-[#121318] border border-purple-200 dark:border-neutral-800 text-[#7C3AED] dark:text-[#C4B5FD] text-xs font-bold tracking-wide mb-3">
          <span>Premium Exclusive Feature</span>
        </div>

        {/* Heading & description */}
        <h3 className="text-xl sm:text-2xl font-black text-black dark:text-white tracking-tight mb-2">
          {title}
        </h3>
        <p className="text-sm text-[#7C3AED] dark:text-[#C4B5FD] mb-6 leading-relaxed font-medium">
          {description}
        </p>

        {/* Benefits checklist */}
        {benefits && benefits.length > 0 && (
          <div className="w-full text-left bg-white dark:bg-[#121318] rounded-xl p-4 mb-6 border border-purple-200/90 dark:border-neutral-800">
            <p className="text-xs font-bold text-[#7C3AED] dark:text-[#C4B5FD] uppercase tracking-wider mb-2.5">
              Included with Premium:
            </p>
            <ul className="space-y-2">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-2.5 text-xs text-black dark:text-white">
                  <div className="w-4 h-4 rounded-full bg-white dark:bg-[#18191F] text-[#7C3AED] dark:text-[#C4B5FD] border border-purple-200 dark:border-neutral-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 stroke-[2.5]" />
                  </div>
                  <span className="font-semibold">{benefit}</span>
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
            variant="purple"
            icon="none"
            className="w-full sm:w-auto justify-center font-bold"
          />
          {secondaryAction && (
            <button
              type="button"
              onClick={secondaryAction.onClick}
              className="w-full sm:w-auto px-4 py-2.5 text-sm font-bold text-black dark:text-white hover:text-[#7C3AED] dark:hover:text-[#C4B5FD] hover:bg-purple-50 dark:hover:bg-[#121318] rounded-xl transition-colors cursor-pointer border border-transparent hover:border-purple-200 dark:hover:border-neutral-800"
            >
              {secondaryAction.label}
            </button>
          )}
        </div>

        <p className="text-[11px] text-[#7C3AED]/80 dark:text-[#C4B5FD]/75 mt-4 font-medium">
          Instant activation via PhonePe • Cancel anytime • Student-friendly pricing
        </p>
      </div>
    </div>
  );
}
