"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Briefcase } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import type {
  RoadmapCardItem,
  RoadmapToolItem,
  RoadmapToolKey,
} from "@/data/roadmaps/roadmapCards";
import { RoadmapMetricIcon } from "./RoadmapMetricIcon";
import RoadmapFlowchartTree from "./RoadmapFlowchartTree";
import { getRoadmapLessonGroups } from "@/data/roadmaps/lessonsCatalog";

const TECH_LOGO_SRC_MAP: Partial<Record<RoadmapToolKey, string>> = {
  react: "/images/tech-logos/react.svg",
  typescript: "/images/tech-logos/typescript.svg",
  nextjs: "/images/tech-logos/nextjs.svg",
  nodejs: "/images/tech-logos/nodejs.svg",
  python: "/images/tech-logos/python.svg",
  docker: "/images/tech-logos/docker.svg",
  git: "/images/tech-logos/git.svg",
  postgresql: "/images/tech-logos/postgresql.svg",
};

function ToolLogoBadge({ tool }: { tool: RoadmapToolItem }) {
  const logoSrc = TECH_LOGO_SRC_MAP[tool.icon];

  if (logoSrc) {
    return (
      <div
        title={tool.name}
        className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/[0.06] border border-slate-200/80 dark:border-white/[0.08] flex items-center justify-center p-1.5 shrink-0"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} alt={tool.name} className="w-full h-full object-contain" />
      </div>
    );
  }

  if (tool.icon === "figma") {
    return (
      <div
        title={tool.name}
        className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/[0.06] border border-slate-200/80 dark:border-white/[0.08] flex items-center justify-center p-1.5 shrink-0"
      >
        <svg viewBox="0 0 38 57" className="w-full h-full" fill="none" aria-label={tool.name}>
          <path d="M19 28.5C19 23.2533 23.2533 19 28.5 19C33.7467 19 38 23.2533 38 28.5C38 33.7467 33.7467 38 28.5 38C23.2533 38 19 33.7467 19 28.5Z" fill="#1ABCFE" />
          <path d="M0 47.5C0 42.2533 4.25329 38 9.5 38H19V47.5C19 52.7467 14.7467 57 9.5 57C4.25329 57 0 52.7467 0 47.5Z" fill="#0ACF83" />
          <path d="M19 0V19H28.5C33.7467 19 38 14.7467 38 9.5C38 4.25329 33.7467 0 28.5 0H19Z" fill="#FF7262" />
          <path d="M0 9.5C0 14.7467 4.25329 19 9.5 19H19V0H9.5C4.25329 0 0 4.25329 0 9.5Z" fill="#F24E1E" />
          <path d="M0 28.5C0 33.7467 4.25329 38 9.5 38H19V19H9.5C4.25329 19 0 23.2533 0 28.5Z" fill="#A259FF" />
        </svg>
      </div>
    );
  }

  if (tool.icon === "adobe-xd") {
    return (
      <div
        title={tool.name}
        className="w-8 h-8 rounded-lg bg-[#470137] border border-[#FF61F6]/30 flex items-center justify-center shrink-0"
      >
        <span className="text-[12px] font-black tracking-tight text-[#FF61F6] leading-none">
          Xd
        </span>
      </div>
    );
  }

  if (tool.icon === "photoshop") {
    return (
      <div
        title={tool.name}
        className="w-8 h-8 rounded-lg bg-[#001E36] border border-[#31A8FF]/30 flex items-center justify-center shrink-0"
      >
        <span className="text-[12px] font-black tracking-tight text-[#31A8FF] leading-none">
          Ps
        </span>
      </div>
    );
  }

  return (
    <div
      title={tool.name}
      className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/[0.06] border border-slate-200/80 dark:border-white/[0.08] flex items-center justify-center p-1.5 shrink-0"
    >
      <svg viewBox="0 0 24 24" className="w-full h-full fill-slate-900 dark:fill-white" aria-label={tool.name}>
        <path d="M4 18.5L10.5 6h2.2l3.8 7.4L19 8.5l3 10h-3.6l-1.5-4.8-2.5 4.8h-2.1L9.6 13.3 7.2 18.5H4z" />
      </svg>
    </div>
  );
}

export interface RoadmapDetailHeroProps {
  roadmap: RoadmapCardItem;
}

export default function RoadmapDetailHero({ roadmap }: RoadmapDetailHeroProps) {
  const { detail } = roadmap;
  const accentColor = roadmap.accentColor || "#D5FF38";
  const [showUpcomingNote, setShowUpcomingNote] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const lessonGroups = getRoadmapLessonGroups(roadmap.id);
  const dynamicTotalUnits = lessonGroups.reduce((sum, g) => sum + g.lessons.length, 0) || detail.totalUnits;

  const safeTotal = Math.max(dynamicTotalUnits, 1);
  const clampedCompleted = Math.min(Math.max(detail.completedUnits, 0), safeTotal);
  const progressPct = Math.round((clampedCompleted / safeTotal) * 100);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.body.setAttribute("data-roadmap-detail", "true");
      document.body.setAttribute("data-hide-bottombar", "true");
    }
    return () => {
      if (typeof document !== "undefined") {
        document.body.removeAttribute("data-roadmap-detail");
        document.body.removeAttribute("data-hide-bottombar");
      }
    };
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-5 sm:space-y-6 pb-8 sm:pb-16">
      {/* ── Main Obsidian Hero Overview Card ── */}
      <motion.section
        initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
        whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-[24px] sm:rounded-[28px] bg-white dark:bg-[#111317] border border-slate-200/90 dark:border-white/[0.08] p-4 sm:p-6 lg:p-7 shadow-sm dark:shadow-[0_18px_44px_rgba(0,0,0,0.48)] space-y-4"
      >
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-5 lg:gap-7 items-center">
          {/* Left Hero Identity + Summary + Artwork + Metrics */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
            whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.5, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col justify-between gap-4"
          >
            <div className="grid grid-cols-[minmax(0,0.98fr)_minmax(0,1.02fr)] sm:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)] items-center gap-2 sm:gap-4">
              <div className="min-w-0 space-y-2 z-10">
                <h1 className="text-[28px] sm:text-4xl lg:text-[40px] font-black tracking-tight leading-[1.03]">
                  {roadmap.titleAccent ? (
                    <span className="block" style={{ color: accentColor }}>
                      {roadmap.titleAccent}
                    </span>
                  ) : null}
                  <span className="block text-slate-900 dark:text-white">
                    {roadmap.titlePrimary}
                  </span>
                </h1>

                <p className="text-[11px] sm:text-xs font-medium leading-relaxed text-slate-600 dark:text-neutral-300 max-w-[34ch]">
                  {detail.summaryText}
                </p>
              </div>

              {/* Floating Illustration PNG */}
              <div className="relative w-full aspect-[6/5] sm:aspect-[4/3] flex items-center justify-center pointer-events-none scale-115 sm:scale-100 origin-center">
                <Image
                  src={roadmap.imageSrc}
                  alt={roadmap.imageAlt}
                  fill
                  unoptimized
                  priority
                  sizes="(max-width: 640px) 190px, 240px"
                  className="object-contain object-center drop-shadow-[0_14px_24px_rgba(0,0,0,0.45)]"
                />
              </div>
            </div>

            {/* Bottom Hero Stats Strip */}
            {detail.heroMetrics.length > 0 && (
              <div className="flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-2">
                {detail.heroMetrics.map((metric, idx) => (
                  <React.Fragment key={metric.id}>
                    {idx > 0 && (
                      <span
                        className="w-px h-4 bg-slate-200 dark:bg-white/15 shrink-0"
                        aria-hidden="true"
                      />
                    )}
                    <div className="flex items-center gap-1.5 sm:gap-2 text-slate-900 dark:text-white">
                      <RoadmapMetricIcon
                        kind={metric.icon}
                        className="w-4 h-4 text-slate-600 dark:text-neutral-300 shrink-0"
                      />
                      <span className="text-xs sm:text-[13px] font-bold tracking-tight">
                        {metric.label}
                      </span>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            )}
          </motion.div>

          {/* Right Column: Avg. CTC & Key Tools Directly (No Boxes) + Progress Bar Below Both */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
            whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.5, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col justify-between gap-4 lg:border-l lg:border-slate-200/80 dark:lg:border-white/[0.08] lg:pl-7"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
              {/* Avg CTC Directly */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/[0.06] border border-slate-200/80 dark:border-white/[0.08] flex items-center justify-center shrink-0">
                    <Briefcase className="w-4 h-4 text-slate-800 dark:text-neutral-200" strokeWidth={1.8} aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-[11px] font-semibold text-slate-500 dark:text-neutral-400">
                      {detail.salaryTitle}
                    </span>
                    <span
                      className="block text-lg sm:text-xl font-black tracking-tight leading-tight"
                      style={{ color: accentColor }}
                    >
                      {detail.salaryValue}
                    </span>
                  </div>
                </div>
                <p className="text-[10.5px] text-slate-500 dark:text-neutral-400 font-medium leading-snug">
                  {detail.salaryNote}
                </p>
              </div>

              {/* Key Tools Directly */}
              <div className="space-y-2">
                <h2 className="text-xs sm:text-[13px] font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {detail.toolsTitle}
                </h2>
                <div className="flex items-center flex-wrap gap-2">
                  {detail.tools.map((tool) => (
                    <ToolLogoBadge key={tool.id} tool={tool} />
                  ))}
                </div>
              </div>
            </div>

            {/* Progress Bar Directly Below Both Avg. CTC & Key Tools */}
            <div className="pt-3.5 border-t border-slate-200/80 dark:border-white/[0.08] space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {detail.progressTitle}
                </span>
                <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                  {progressPct}%
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-[#262B35] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${progressPct}%`,
                        backgroundColor: accentColor,
                      }}
                    />
                  </div>
                  <div className="text-[11px] font-medium text-slate-500 dark:text-neutral-400">
                    {clampedCompleted} of {dynamicTotalUnits} {detail.progressUnitLabel}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowUpcomingNote((prev) => !prev)}
                  style={{ backgroundColor: accentColor }}
                  className="px-4 py-2.5 rounded-xl text-[#0D0F12] font-bold text-xs tracking-tight inline-flex items-center justify-center gap-1.5 shadow-sm hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer shrink-0"
                >
                  <span>{detail.actionLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[2.2]" aria-hidden="true" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {showUpcomingNote && (
          <div className="rounded-xl bg-slate-100/80 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] px-4 py-3 text-xs text-slate-600 dark:text-neutral-300 flex flex-wrap items-center justify-between gap-2">
            <span>
              Modules and interactive lessons for {roadmap.titleAccent} {roadmap.titlePrimary} will be published here next.
            </span>
            <Link
              href="/learning"
              className="font-bold text-slate-900 dark:text-[#D5FF38] hover:underline shrink-0"
            >
              Browse Learning →
            </Link>
          </div>
        )}
      </motion.section>

      {lessonGroups.length > 0 && (
        <RoadmapFlowchartTree groups={lessonGroups} />
      )}
    </div>
  );
}
