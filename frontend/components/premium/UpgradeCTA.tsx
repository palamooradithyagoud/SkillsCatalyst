"use client";

import React from "react";
import { Sparkles, ArrowRight, Crown } from "lucide-react";
import { usePricingModal } from "@/contexts/PricingModalContext";

export interface UpgradeCTAProps {
  label?: string;
  variant?: "primary" | "secondary" | "outline" | "subtle" | "ghost";
  size?: "xs" | "sm" | "md" | "lg";
  icon?: "sparkles" | "crown" | "arrow" | "none";
  className?: string;
  onClick?: () => void;
}

export function UpgradeCTA({
  label = "Upgrade to Premium",
  variant = "primary",
  size = "md",
  icon = "sparkles",
  className = "",
  onClick,
}: UpgradeCTAProps) {
  const { openPricingModal } = usePricingModal();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (onClick) {
      onClick();
    } else {
      openPricingModal();
    }
  };

  const sizeClasses = {
    xs: "text-xs px-2.5 py-1 gap-1.5 font-medium rounded-md",
    sm: "text-xs px-3 py-1.5 gap-1.5 font-semibold rounded-lg",
    md: "text-sm px-4 py-2 gap-2 font-semibold rounded-lg",
    lg: "text-base px-5 py-2.5 gap-2.5 font-bold rounded-xl",
  };

  const variantClasses = {
    primary:
      "bg-[#234B3B] hover:bg-[#1b3b2e] text-white shadow-sm hover:shadow active:scale-[0.98] transition-all duration-150 border border-emerald-900/20",
    secondary:
      "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow active:scale-[0.98] transition-all duration-150",
    outline:
      "bg-white hover:bg-emerald-50/50 text-[#234B3B] border border-[#234B3B]/30 hover:border-[#234B3B] shadow-2xs transition-all duration-150",
    subtle:
      "bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200/70 transition-colors duration-150",
    ghost:
      "bg-transparent hover:bg-slate-100 text-slate-700 hover:text-slate-900 transition-colors duration-150",
  };

  const iconSizes = {
    xs: "w-3 h-3",
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      data-testid="upgrade-cta-button"
      className={`inline-flex items-center justify-center cursor-pointer select-none ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      {icon === "sparkles" && (
        <Sparkles className={`${iconSizes[size]} text-amber-300 shrink-0`} />
      )}
      {icon === "crown" && (
        <Crown className={`${iconSizes[size]} text-amber-400 shrink-0`} />
      )}
      <span>{label}</span>
      {icon === "arrow" && (
        <ArrowRight className={`${iconSizes[size]} shrink-0 transition-transform group-hover:translate-x-0.5`} />
      )}
    </button>
  );
}
