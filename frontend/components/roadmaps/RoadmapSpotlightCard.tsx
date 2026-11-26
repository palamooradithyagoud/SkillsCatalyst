"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import type { RoadmapCardItem } from "@/data/roadmaps/roadmapCards";
import { RoadmapMetricIcon } from "./RoadmapMetricIcon";

export interface RoadmapSpotlightCardProps {
  card: RoadmapCardItem;
  onSelect?: (card: RoadmapCardItem) => void;
  className?: string;
}

function RoadmapCtaControl({
  card,
  accentColor,
  onSelect,
  variant,
}: {
  card: RoadmapCardItem;
  accentColor: string;
  onSelect?: (card: RoadmapCardItem) => void;
  variant: "mobile-inline" | "desktop-full";
}) {
  const isInline = variant === "mobile-inline";
  const ctaClassName = isInline
    ? "inline-flex sm:hidden items-center justify-between gap-2 max-w-full py-2 px-3.5 rounded-full text-[#0D0F12] font-bold text-xs tracking-tight shadow-sm hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer"
    : "w-full py-3 px-5 rounded-full text-[#0D0F12] font-bold text-sm tracking-tight flex items-center justify-between shadow-sm hover:brightness-105 active:scale-[0.99] transition-all cursor-pointer";

  const iconClassName = isInline
    ? "w-3.5 h-3.5 stroke-[2.3] shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
    : "w-4 h-4 stroke-[2.2] shrink-0 transition-transform duration-200 group-hover:translate-x-1";

  const targetHref = card.href || `/roadmaps/${encodeURIComponent(card.id)}`;

  if (onSelect) {
    return (
      <button
        type="button"
        onClick={() => onSelect(card)}
        style={{ backgroundColor: accentColor }}
        className={ctaClassName}
      >
        <span className="truncate">{card.ctaLabel}</span>
        <ArrowRight className={iconClassName} aria-hidden="true" />
      </button>
    );
  }

  return (
    <Link
      href={targetHref}
      style={{ backgroundColor: accentColor }}
      className={ctaClassName}
    >
      <span className="truncate">{card.ctaLabel}</span>
      <ArrowRight className={iconClassName} aria-hidden="true" />
    </Link>
  );
}

export default function RoadmapSpotlightCard({
  card,
  onSelect,
  className = "",
}: RoadmapSpotlightCardProps) {
  const accentColor = card.accentColor || "#D5FF38";
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 18, scale: 0.98 }}
      whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={`group relative flex flex-col justify-between h-full w-full rounded-[22px] sm:rounded-[24px] bg-white dark:bg-[#111317] border border-slate-200/90 dark:border-white/[0.08] p-4 sm:p-5 shadow-sm dark:shadow-[0_12px_28px_rgba(0,0,0,0.42)] transition-colors duration-300 hover:border-slate-300 dark:hover:border-white/[0.16] overflow-hidden select-none ${className}`}
    >
      {/* ── Top Split Row: Title + Mobile CTA / Desktop Copy (Left) & Illustration (Right) ── */}
      <div className="grid grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)] items-center sm:items-start gap-2 sm:gap-3 mb-0 sm:mb-4">
        <div className="min-w-0 flex flex-col justify-between gap-3 sm:gap-2 z-10">
          <h3 className="text-[20px] sm:text-[24px] font-black tracking-tight leading-[1.06]">
            {card.titleAccent ? (
              <span className="block" style={{ color: accentColor }}>
                {card.titleAccent}
              </span>
            ) : null}
            <span className="block text-slate-900 dark:text-white">
              {card.titlePrimary}
            </span>
          </h3>

          {/* Desktop/Tablet: description copy */}
          <p className="hidden sm:block text-[12.5px] font-medium leading-snug text-slate-600 dark:text-[#9CA3AF]">
            {card.description}
          </p>

          {/* Mobile: Explore CTA positioned in place of the description */}
          <div className="sm:hidden">
            <RoadmapCtaControl
              card={card}
              accentColor={accentColor}
              onSelect={onSelect}
              variant="mobile-inline"
            />
          </div>
        </div>

        {/* Right Artwork PNG */}
        <div className="relative w-full aspect-[4/3] flex items-center justify-center pointer-events-none self-center">
          <Image
            src={card.imageSrc}
            alt={card.imageAlt}
            fill
            unoptimized
            sizes="(max-width: 768px) 150px, 190px"
            className="object-contain object-center transition-transform duration-300 group-hover:scale-105 drop-shadow-[0_10px_18px_rgba(0,0,0,0.38)]"
          />
        </div>
      </div>

      {/* ── Desktop/Tablet Only: Metrics Row & Bottom Full-Width CTA ── */}
      <div className="hidden sm:block space-y-3.5 mt-auto">
        {card.metrics.length > 0 && (
          <div className="flex items-center justify-between gap-1.5">
            {card.metrics.map((metric, idx) => (
              <React.Fragment key={metric.id}>
                {idx > 0 && (
                  <span
                    className="w-px h-3.5 bg-slate-200 dark:bg-white/15 shrink-0"
                    aria-hidden="true"
                  />
                )}
                <div className="flex items-center gap-1.5 min-w-0 text-slate-900 dark:text-white">
                  <RoadmapMetricIcon
                    kind={metric.icon}
                    className="w-3.5 h-3.5 text-slate-700 dark:text-neutral-200 shrink-0"
                  />
                  <span className="text-xs font-bold tracking-tight truncate">
                    {metric.label}
                  </span>
                </div>
              </React.Fragment>
            ))}
          </div>
        )}

        <RoadmapCtaControl
          card={card}
          accentColor={accentColor}
          onSelect={onSelect}
          variant="desktop-full"
        />
      </div>
    </motion.div>
  );
}
