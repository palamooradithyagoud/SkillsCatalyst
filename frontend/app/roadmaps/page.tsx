"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Code2, X } from "lucide-react";
import LogoLoop from "@/components/LogoLoop";
import RoadmapSpotlightCard from "@/components/roadmaps/RoadmapSpotlightCard";
import { ROADMAP_CARDS, type RoadmapCardItem } from "@/data/roadmaps";

export default function RoadmapsPage() {
  const [selectedCard, setSelectedCard] = useState<RoadmapCardItem | null>(null);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.body.removeAttribute("data-roadmap-detail");
      document.body.removeAttribute("data-hide-bottombar");
    }
  }, []);

  useEffect(() => {
    if (!selectedCard) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedCard(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedCard]);

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
            <RoadmapSpotlightCard
              key={card.id}
              card={card}
              onSelect={setSelectedCard}
            />
          ))}
        </div>
      </section>

      {/* ── Track Preview Dialog (No Enrolling / Progress System) ── */}
      <AnimatePresence>
        {selectedCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedCard(null)}
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="roadmap-preview-title"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-3xl bg-white dark:bg-[#111317] border border-slate-200 dark:border-white/[0.1] p-6 shadow-2xl space-y-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2
                    id="roadmap-preview-title"
                    className="text-2xl font-black tracking-tight text-slate-900 dark:text-white"
                  >
                    {selectedCard.titleAccent ? (
                      <span
                        className="mr-1.5"
                        style={{ color: selectedCard.accentColor || "#D5FF38" }}
                      >
                        {selectedCard.titleAccent}
                      </span>
                    ) : null}
                    {selectedCard.titlePrimary}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedCard(null)}
                  aria-label="Close preview"
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="relative w-full h-36 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/[0.06] flex items-center justify-center p-4">
                <div className="relative w-44 h-28">
                  <Image
                    src={selectedCard.imageSrc}
                    alt={selectedCard.imageAlt}
                    fill
                    unoptimized
                    sizes="176px"
                    className="object-contain"
                  />
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-[#9CA3AF] leading-relaxed">
                {selectedCard.description} Interactive modules for this pathway are coming soon.
              </p>

              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <Link
                  href="/learning"
                  className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-slate-900 dark:bg-[#D5FF38] text-white dark:text-[#0D0F12] text-xs font-bold hover:brightness-105 transition-all"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Browse Learning</span>
                </Link>
                <Link
                  href="/practice"
                  className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-slate-100 dark:bg-white/[0.08] text-slate-800 dark:text-white text-xs font-bold hover:bg-slate-200 dark:hover:bg-white/[0.14] transition-all"
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Open Practice</span>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
