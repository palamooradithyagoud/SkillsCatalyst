"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Map, BookOpen, Code2, ArrowRight } from "lucide-react";
import LogoLoop from "@/components/LogoLoop";

export default function RoadmapsPage() {
  React.useEffect(() => {
    if (typeof document !== "undefined") {
      document.body.removeAttribute("data-roadmap-detail");
      document.body.removeAttribute("data-hide-bottombar");
    }
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto space-y-6 sm:space-y-10 pb-28 sm:pb-16"
    >
      {/* ── Roadmaps Header Banner ── */}
      <div className="-mx-3.5 -mt-3.5 sm:mx-0 sm:mt-0 w-[calc(100%+1.75rem)] sm:w-auto relative overflow-hidden rounded-none sm:rounded-3xl bg-[#a1ccff] border-b sm:border border-[#8ec2fc] p-5 sm:p-8 lg:p-10 shadow-none sm:shadow-sm">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-8">
          {/* Left Text & Info */}
          <div className="max-w-2xl space-y-2.5 sm:space-y-4">
            <span className="inline-block px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-white/70 border border-white/80 text-slate-800 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
              Curated Learning Pathways
            </span>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              Developer Roadmaps
            </h1>

            <p className="text-xs sm:text-base text-slate-700 leading-relaxed font-medium">
              Structured role pathways and developer guides to help plan what to learn next across software engineering.
            </p>
          </div>

          {/* Right Status Box */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0 sm:w-auto w-full pt-1 sm:pt-0">
            <div className="bg-white/70 backdrop-blur-xs border border-white/80 rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-2xs flex sm:flex-col items-center sm:items-start justify-between sm:justify-center w-full sm:w-auto sm:min-w-[170px]">
              <div>
                <span className="block text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wide">
                  Roadmap Tracks
                </span>
                <span className="block text-[11px] text-slate-500 font-medium mt-0.5">
                  Refresh Underway
                </span>
              </div>
              <span className="text-sm sm:text-xl font-black text-slate-900 sm:mt-1.5">
                Coming Soon
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Technology Ecosystem & Tools Bar (Side Scrolling Logo Loop) ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="py-3 px-4 sm:px-6 rounded-2xl bg-white dark:bg-[#1E1F28] border border-slate-200/90 dark:border-neutral-700/60 shadow-xs transition-colors"
      >
        <div className="flex items-center gap-4 sm:gap-6">
          <span className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-neutral-400 shrink-0 hidden md:inline-block">
            ECOSYSTEM &amp; TOOLS
          </span>
          <div className="flex-1 overflow-hidden">
            <LogoLoop
              logos={[
                {
                  node: (
                    <div className="flex items-center justify-center p-1 rounded-xl transition-all cursor-pointer group" title="Python">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/images/tech-logos/python.svg" alt="Python" className="w-7 h-7 sm:w-8 sm:h-8 object-contain transition-transform duration-200 group-hover:scale-115" />
                    </div>
                  ),
                },
                {
                  node: (
                    <div className="flex items-center justify-center p-1 rounded-xl transition-all cursor-pointer group" title="JavaScript">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/images/tech-logos/javascript.svg" alt="JavaScript" className="w-7 h-7 sm:w-8 sm:h-8 object-contain transition-transform duration-200 group-hover:scale-115" />
                    </div>
                  ),
                },
                {
                  node: (
                    <div className="flex items-center justify-center p-1 rounded-xl transition-all cursor-pointer group" title="TypeScript">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/images/tech-logos/typescript.svg" alt="TypeScript" className="w-7 h-7 sm:w-8 sm:h-8 object-contain transition-transform duration-200 group-hover:scale-115" />
                    </div>
                  ),
                },
                {
                  node: (
                    <div className="flex items-center justify-center p-1 rounded-xl transition-all cursor-pointer group" title="React">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/images/tech-logos/react.svg" alt="React" className="w-7 h-7 sm:w-8 sm:h-8 object-contain transition-transform duration-200 group-hover:scale-115" />
                    </div>
                  ),
                },
                {
                  node: (
                    <div className="flex items-center justify-center p-1 rounded-xl transition-all cursor-pointer group" title="Next.js">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/images/tech-logos/nextjs.svg" alt="Next.js" className="w-7 h-7 sm:w-8 sm:h-8 object-contain transition-transform duration-200 group-hover:scale-115 dark:drop-shadow-[0_0_6px_rgba(255,255,255,0.2)]" />
                    </div>
                  ),
                },
                {
                  node: (
                    <div className="flex items-center justify-center p-1 rounded-xl transition-all cursor-pointer group" title="Node.js">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/images/tech-logos/nodejs.svg" alt="Node.js" className="w-7 h-7 sm:w-8 sm:h-8 object-contain transition-transform duration-200 group-hover:scale-115" />
                    </div>
                  ),
                },
                {
                  node: (
                    <div className="flex items-center justify-center p-1 rounded-xl transition-all cursor-pointer group" title="Java">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/images/tech-logos/java.svg" alt="Java" className="w-7 h-7 sm:w-8 sm:h-8 object-contain transition-transform duration-200 group-hover:scale-115" />
                    </div>
                  ),
                },
                {
                  node: (
                    <div className="flex items-center justify-center p-1 rounded-xl transition-all cursor-pointer group" title="C++">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/images/tech-logos/cplusplus.svg" alt="C++" className="w-7 h-7 sm:w-8 sm:h-8 object-contain transition-transform duration-200 group-hover:scale-115" />
                    </div>
                  ),
                },
                {
                  node: (
                    <div className="flex items-center justify-center p-1 rounded-xl transition-all cursor-pointer group" title="Docker">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/images/tech-logos/docker.svg" alt="Docker" className="w-7 h-7 sm:w-8 sm:h-8 object-contain transition-transform duration-200 group-hover:scale-115" />
                    </div>
                  ),
                },
                {
                  node: (
                    <div className="flex items-center justify-center p-1 rounded-xl transition-all cursor-pointer group" title="Git">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/images/tech-logos/git.svg" alt="Git" className="w-7 h-7 sm:w-8 sm:h-8 object-contain transition-transform duration-200 group-hover:scale-115" />
                    </div>
                  ),
                },
                {
                  node: (
                    <div className="flex items-center justify-center p-1 rounded-xl transition-all cursor-pointer group" title="PostgreSQL">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/images/tech-logos/postgresql.svg" alt="PostgreSQL" className="w-7 h-7 sm:w-8 sm:h-8 object-contain transition-transform duration-200 group-hover:scale-115" />
                    </div>
                  ),
                },
                {
                  node: (
                    <div className="flex items-center justify-center p-1 rounded-xl transition-all cursor-pointer group" title="MongoDB">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/images/tech-logos/mongodb.svg" alt="MongoDB" className="w-7 h-7 sm:w-8 sm:h-8 object-contain transition-transform duration-200 group-hover:scale-115" />
                    </div>
                  ),
                },
              ]}
              speed={60}
              logoHeight={34}
              gap={32}
              pauseOnHover
              scaleOnHover
              fadeOut
              className="[--logoloop-fadeColorAuto:#ffffff] dark:[--logoloop-fadeColorAuto:#1E1F28]"
            />
          </div>
        </div>
      </motion.div>

      {/* ── Empty / Coming Soon Placeholder ── */}
      <section
        id="roadmaps-empty-section"
        className="rounded-3xl bg-white dark:bg-[#1D1D1D] border border-slate-200/90 dark:border-white/[0.08] p-8 sm:p-12 text-center shadow-xs"
      >
        <div className="max-w-lg mx-auto space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-600 dark:text-[#D5FF38] dark:bg-[#D5FF38]/10 dark:border-[#D5FF38]/25 flex items-center justify-center mx-auto">
            <Map className="w-6 h-6" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Roadmaps Content Coming Soon
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-neutral-400 font-medium leading-relaxed">
              We&apos;ve cleared the existing roadmap tracks to make way for an updated experience. In the meantime, explore curated video courses and coding practice.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/learning"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-[#D5FF38] dark:hover:bg-[#dffb63] text-white dark:text-black text-xs sm:text-sm font-bold transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              <span>Browse Learning</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              href="/practice"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.12] text-slate-800 dark:text-white border border-slate-200/80 dark:border-white/[0.08] text-xs sm:text-sm font-bold transition-colors"
            >
              <Code2 className="w-4 h-4" />
              <span>Open Practice</span>
            </Link>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
