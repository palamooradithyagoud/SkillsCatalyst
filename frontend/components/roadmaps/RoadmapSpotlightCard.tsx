"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Box, Layers } from "lucide-react";
import type {
  RoadmapCardItem,
  RoadmapMetricIconKey,
} from "@/data/roadmaps/roadmapCards";

export interface RoadmapSpotlightCardProps {
  card: RoadmapCardItem;
  onSelect?: (card: RoadmapCardItem) => void;
  className?: string;
}

function SignalBarsIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 18 18"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <rect x="2" y="10.5" width="3" height="5" rx="1" />
      <rect x="7.5" y="6.5" width="3" height="9" rx="1" />
      <rect x="13" y="2.5" width="3" height="13" rx="1" />
    </svg>
  );
}

function MetricIcon({
  kind,
  className = "w-3.5 h-3.5",
}: {
  kind: RoadmapMetricIconKey;
  className?: string;
}) {
  if (kind === "level") {
    return <SignalBarsIcon className={className} />;
  }
  if (kind === "units") {
    return <Layers className={className} strokeWidth={2} aria-hidden="true" />;
  }
  return <Box className={className} strokeWidth={2} aria-hidden="true" />;
}

export default function RoadmapSpotlightCard({
  card,
  onSelect,
  className = "",
}: RoadmapSpotlightCardProps) {
  const accentColor = card.accentColor || "#D5FF38";

  const handleActivate = () => {
    if (onSelect) {
      onSelect(card);
    }
  };

  return (
    <div
      className={`group relative flex flex-col justify-between h-full w-full rounded-[22px] sm:rounded-[24px] bg-white dark:bg-[#111317] border border-slate-200/90 dark:border-white/[0.08] p-4 sm:p-5 shadow-sm dark:shadow-[0_12px_28px_rgba(0,0,0,0.42)] transition-all duration-300 hover:border-slate-300 dark:hover:border-white/[0.16] overflow-hidden select-none ${className}`}
    >
      {/* ── Top Split Row: Title + Copy Anchored Up (Left) & Illustration (Right) ── */}
      <div className="grid grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] items-start gap-2 sm:gap-3 mb-3.5 sm:mb-4">
        <div className="min-w-0 space-y-1.5 sm:space-y-2 z-10">
          <h3 className="text-[21px] sm:text-[24px] font-black tracking-tight leading-[1.06]">
            {card.titleAccent ? (
              <span className="block" style={{ color: accentColor }}>
                {card.titleAccent}
              </span>
            ) : null}
            <span className="block text-slate-900 dark:text-white">
              {card.titlePrimary}
            </span>
          </h3>

          <p className="text-[11.5px] sm:text-[12.5px] font-medium leading-snug text-slate-600 dark:text-[#9CA3AF]">
            {card.description}
          </p>
        </div>

        {/* Right Artwork PNG */}
        <div className="relative w-full aspect-[4/3] flex items-center justify-center pointer-events-none self-center">
          <Image
            src={card.imageSrc}
            alt={card.imageAlt}
            fill
            unoptimized
            sizes="(max-width: 768px) 140px, 190px"
            className="object-contain object-center transition-transform duration-300 group-hover:scale-105 drop-shadow-[0_10px_18px_rgba(0,0,0,0.38)]"
          />
        </div>
      </div>

      {/* ── Compact Metrics Row & Bottom Full-Width CTA ── */}
      <div className="space-y-3 sm:space-y-3.5 mt-auto">
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
                  <MetricIcon
                    kind={metric.icon}
                    className="w-3.5 h-3.5 text-slate-700 dark:text-neutral-200 shrink-0"
                  />
                  <span className="text-[11px] sm:text-xs font-bold tracking-tight truncate">
                    {metric.label}
                  </span>
                </div>
              </React.Fragment>
            ))}
          </div>
        )}

        {card.href ? (
          <Link
            href={card.href}
            style={{ backgroundColor: accentColor }}
            className="w-full py-2.5 sm:py-3 px-4 sm:px-5 rounded-full text-[#0D0F12] font-bold text-xs sm:text-sm tracking-tight flex items-center justify-between shadow-sm hover:brightness-105 active:scale-[0.99] transition-all cursor-pointer"
          >
            <span className="truncate">{card.ctaLabel}</span>
            <ArrowRight
              className="w-4 h-4 stroke-[2.2] shrink-0 transition-transform duration-200 group-hover:translate-x-1"
              aria-hidden="true"
            />
          </Link>
        ) : (
          <button
            type="button"
            onClick={handleActivate}
            style={{ backgroundColor: accentColor }}
            className="w-full py-2.5 sm:py-3 px-4 sm:px-5 rounded-full text-[#0D0F12] font-bold text-xs sm:text-sm tracking-tight flex items-center justify-between shadow-sm hover:brightness-105 active:scale-[0.99] transition-all cursor-pointer"
          >
            <span className="truncate">{card.ctaLabel}</span>
            <ArrowRight
              className="w-4 h-4 stroke-[2.2] shrink-0 transition-transform duration-200 group-hover:translate-x-1"
              aria-hidden="true"
            />
          </button>
        )}
      </div>
    </div>
  );
}
