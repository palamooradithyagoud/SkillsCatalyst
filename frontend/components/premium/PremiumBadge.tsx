"use client";

import React from "react";
import { Sparkles, Crown } from "lucide-react";

export interface PremiumBadgeProps {
  isPremium: boolean;
  size?: "xs" | "sm" | "md";
  showIcon?: boolean;
  className?: string;
}

export function PremiumBadge({
  isPremium,
  size = "sm",
  showIcon = true,
  className = "",
}: PremiumBadgeProps) {
  const sizeClasses = {
    xs: "text-[10px] px-1.5 py-0.5 gap-1",
    sm: "text-xs px-2.5 py-0.5 gap-1.5",
    md: "text-sm px-3 py-1 gap-2",
  };

  if (isPremium) {
    return (
      <span
        data-testid="premium-badge-active"
        className={`inline-flex items-center font-bold tracking-tight rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-xs ${sizeClasses[size]} ${className}`}
      >
        {showIcon && <Crown className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
        <span>Premium</span>
      </span>
    );
  }

  return (
    <span
      data-testid="premium-badge-free"
      className={`inline-flex items-center font-semibold rounded-full bg-slate-100 text-slate-700 border border-slate-200 ${sizeClasses[size]} ${className}`}
    >
      {showIcon && <Sparkles className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
      <span>Free Plan</span>
    </span>
  );
}
