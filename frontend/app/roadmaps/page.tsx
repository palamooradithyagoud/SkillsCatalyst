"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import LogoLoop from "@/components/LogoLoop";
import RoadmapSpotlightCard from "@/components/roadmaps/RoadmapSpotlightCard";
import { ROADMAP_CARDS } from "@/data/roadmaps";

export default function RoadmapsPage() {
  useEffect(() => {
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

          <div className="flex items-center gap-2 sm:gap-4 shrink-0 sm:w-auto w-full pt-1 sm:pt-0">
            <div className="bg-white/70 backdrop-blur-xs border border-white/80 rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-2xs flex sm:flex-col items-center sm:items-start justify-between sm:justify-center w-full sm:w-auto sm:min-w-[160px]">
              <div>
                <span className="block text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wide">
                  Available Tracks
                </span>
                <span className="block text-[11px] text-slate-500 font-medium mt-0.5">
                  Role Roadmaps
                </span>
              </div>
              <span className="text-xl sm:text-4xl font-black text-slate-900 sm:mt-1">
                {ROADMAP_CARDS.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Technology Ecosystem & Tools Bar (Side Scrolling Logo Loop) ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
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

      {/* ── Dynamic Roadmap Cards Grid ── */}
      <section id="roadmap-cards-section" className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(285px,330px))] gap-4 sm:gap-5 items-stretch">
          {ROADMAP_CARDS.map((card) => (
            <RoadmapSpotlightCard key={card.id} card={card} />
          ))}
        </div>
      </section>
    </motion.div>
  );
}
