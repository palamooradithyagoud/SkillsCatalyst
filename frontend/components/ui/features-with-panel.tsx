"use client";

import * as React from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Play,
  Film,
  Calendar,
  GraduationCap,
  Sparkles,
  Award,
  Flame,
  CheckCircle2,
  Bookmark,
  Share2,
  TrendingUp,
  MapPin,
  Clock,
  ArrowRight,
} from "lucide-react";

interface FeatureItem {
  title: string;
  alt?: string;
  badge?: string;
  content: string | React.ReactNode;
}

function FeatureMedia({
  content,
  alt,
}: {
  content: string | React.ReactNode;
  alt?: string;
}) {
  if (typeof content !== "string") {
    return <div className="w-full h-full">{content}</div>;
  }

  const isVideo = /\.(mp4|webm|ogg)$/i.test(content);
  const isImage =
    /\.(jpg|jpeg|png|webp|gif|avif|svg)$/i.test(content) ||
    /unsplash|images\./i.test(content);

  if (isVideo) {
    return (
      <video
        src={content}
        autoPlay
        muted
        loop
        playsInline
        className="w-full h-full object-cover"
      />
    );
  }

  if (isImage) {
    return (
      <img src={content} alt={alt} className="w-full h-full object-cover" />
    );
  }

  return (
    <div className="flex items-center justify-center w-full h-full p-8">
      <p className="text-sm text-zinc-400 leading-relaxed">{content}</p>
    </div>
  );
}

// ── 1. SkillBits Interactive Reel Mockup ───────────────────────────────────────
function SkillBitsPreview() {
  return (
    <div className="relative w-full h-full bg-gradient-to-br from-[#0B0D1B] via-[#120E29] to-[#0A0718] p-5 sm:p-7 flex flex-col justify-between overflow-hidden select-none">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-60 h-60 bg-[#C8B6FF]/10 rounded-full blur-2xl pointer-events-none" />

      {/* Top Header Bar */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-white">
          <Film className="w-3.5 h-3.5 text-[#C8B6FF]" />
          <span>SkillBits · 45s Reel</span>
        </div>
        <span className="text-[11px] font-mono text-zinc-400 bg-black/40 px-2 py-0.5 rounded-md border border-white/10">
          0:38 / 0:45
        </span>
      </div>

      {/* Center Phone/Reel Visual Card */}
      <div className="relative z-10 my-auto py-2 flex items-center justify-center">
        <div className="w-full max-w-sm rounded-2xl bg-black/60 border border-white/15 p-4 sm:p-5 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-[#C8B6FF] flex items-center justify-center font-bold text-black text-xs shrink-0 shadow-sm">
              SC
            </div>
            <div>
              <p className="text-xs font-bold text-white">React 19 & Next.js 16</p>
              <p className="text-[10px] text-zinc-400">Server Actions vs API Routes</p>
            </div>
            <span className="ml-auto text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#C8B6FF]/20 text-[#C8B6FF] border border-[#C8B6FF]/30">
              Pro Tip
            </span>
          </div>

          <div className="rounded-xl bg-zinc-950/90 border border-white/10 p-3 font-mono text-[11px] text-zinc-300 leading-relaxed overflow-hidden">
            <p className="text-purple-400 font-semibold">// Async Server Action</p>
            <p className="text-zinc-400">
              <span className="text-pink-400">&quot;use server&quot;</span>;
            </p>
            <p className="text-zinc-200">
              <span className="text-blue-400">export async function</span>{" "}
              <span className="text-yellow-300">updateSkill</span>(id) &#123;
            </p>
            <p className="pl-3 text-emerald-400">await db.revalidateTag(id);</p>
            <p className="text-zinc-200">&#125;</p>
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-400 pt-1 border-t border-white/10">
            <span className="text-[#C8B6FF] font-medium">#NextJS #TypeScript #CleanCode</span>
            <div className="flex items-center gap-3 text-zinc-300">
              <span>❤️ 2.4k</span>
              <span>🔖 940</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Progress Bar */}
      <div className="relative z-10 w-full">
        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
          <div className="w-[84%] h-full bg-gradient-to-r from-[#C8B6FF] to-purple-500 rounded-full shadow-[0_0_8px_#C8B6FF]" />
        </div>
      </div>
    </div>
  );
}

// ── 2. Scholarships, Events & Tech News Mockup ─────────────────────────────────
function ScholarshipsEventsPreview() {
  return (
    <div className="relative w-full h-full bg-gradient-to-br from-[#080B14] via-[#0E1322] to-[#0A0D18] p-5 sm:p-7 flex flex-col justify-between select-none overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-white">
          <Calendar className="w-3.5 h-3.5 text-blue-400" />
          <span>Verified Student Portal</span>
        </div>
        <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          Live Deadlines
        </span>
      </div>

      {/* Featured Event Card */}
      <div className="relative z-10 my-auto flex flex-col gap-3 py-2">
        <div className="rounded-2xl bg-black/60 border border-white/15 p-4 backdrop-blur-xl hover:border-blue-500/40 transition-colors">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20">
              National Hackathon
            </span>
            <span className="text-xs font-bold text-emerald-400 font-mono">₹5,00,000 Pool</span>
          </div>
          <h4 className="text-sm font-bold text-white">AI Innovation Buildathon 2026</h4>
          <p className="text-[11px] text-zinc-400 mt-0.5 flex items-center gap-1.5">
            <MapPin className="w-3 h-3 text-zinc-500" /> Bengaluru & Hybrid · Closes in 4 Days
          </p>
        </div>

        <div className="rounded-2xl bg-black/60 border border-white/15 p-4 backdrop-blur-xl hover:border-purple-500/40 transition-colors">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20">
              Scholarship Grant
            </span>
            <span className="text-xs font-bold text-[#C8B6FF] font-mono">100% Tuition</span>
          </div>
          <h4 className="text-sm font-bold text-white">Future Tech Leaders Scholarship</h4>
          <p className="text-[11px] text-zinc-400 mt-0.5 flex items-center gap-1.5">
            <Award className="w-3 h-3 text-zinc-500" /> Open for Computer Science Undergrads
          </p>
        </div>

        {/* Tech News Item */}
        <div className="rounded-xl bg-white/5 border border-white/10 px-3.5 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-[11px] font-medium text-zinc-300 truncate">
              Tech News: OpenAI announces new Agentic Web Standards
            </span>
          </div>
          <span className="text-[10px] text-zinc-500 shrink-0">12m ago</span>
        </div>
      </div>

      {/* Footer hint */}
      <div className="relative z-10 flex items-center justify-between text-[11px] text-zinc-400">
        <span>Updated daily with direct apply links</span>
        <span className="text-blue-400 font-medium">Explore All →</span>
      </div>
    </div>
  );
}

// ── 3. Learning, Videos, Tracking & Roadmaps Mockup ────────────────────────────
function LearningRoadmapsPreview() {
  return (
    <div className="relative w-full h-full bg-gradient-to-br from-[#0C0816] via-[#140D26] to-[#080512] p-5 sm:p-7 flex flex-col justify-between select-none overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-[#C8B6FF]/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-white">
          <GraduationCap className="w-3.5 h-3.5 text-[#C8B6FF]" />
          <span>Full-Stack AI Career Roadmap</span>
        </div>
        <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-semibold">
          <Flame className="w-3 h-3 fill-amber-400" />
          <span>14-Day Streak</span>
        </div>
      </div>

      {/* Center Roadmap Tracking Modules */}
      <div className="relative z-10 my-auto flex flex-col gap-2.5 py-2">
        {/* Module 1: Completed */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-black/60 border border-emerald-500/30">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-white">Module 1: Modern Frontend Core</p>
            <p className="text-[10px] text-zinc-400">React 19, TypeScript & Tailwind CSS</p>
          </div>
          <span className="text-[10px] font-bold font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
            100%
          </span>
        </div>

        {/* Module 2: In Progress */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-black/70 border border-[#C8B6FF]/50 shadow-md shadow-[#C8B6FF]/10">
          <div className="w-4 h-4 rounded-full border-2 border-[#C8B6FF] border-t-transparent animate-spin shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-white">Module 2: High-Performance FastAPI</p>
            <p className="text-[10px] text-zinc-400">Async Workers, Redis Cache & Microservices</p>
          </div>
          <span className="text-[10px] font-bold font-mono text-[#C8B6FF] bg-[#C8B6FF]/20 px-2 py-0.5 rounded-md">
            78%
          </span>
        </div>

        {/* Module 3: Up Next */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-black/40 border border-white/5 opacity-70">
          <div className="w-4 h-4 rounded-full border border-zinc-600 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-zinc-300">Module 3: LLMs & AI Agent Pipelines</p>
            <p className="text-[10px] text-zinc-500">Groq, LangChain & Vector Embeddings</p>
          </div>
          <span className="text-[10px] font-medium text-zinc-500">Upcoming</span>
        </div>
      </div>

      {/* Footer Video Badge */}
      <div className="relative z-10 flex items-center justify-between text-[11px] pt-1 border-t border-white/10 text-zinc-400">
        <span className="flex items-center gap-1.5 text-zinc-300">
          <Play className="w-3 h-3 text-[#C8B6FF] fill-[#C8B6FF]" />
          Curated YouTube 4K Lessons
        </span>
        <span className="text-[#C8B6FF] font-medium">View Full Path →</span>
      </div>
    </div>
  );
}

// ── Feature Items Configuration ───────────────────────────────────────────────
const items: FeatureItem[] = [
  {
    title: "SkillBits — High-Impact Video Reels.",
    alt: "Bite-sized, zero-fluff coding concepts and architectural insights in 45-second interactive clips.",
    badge: "Bite-Sized",
    content: <SkillBitsPreview />,
  },
  {
    title: "Scholarships, Events & Tech News.",
    alt: "Direct access to top hackathons, verified student scholarships, and daily engineering breakthroughs.",
    badge: "Opportunities",
    content: <ScholarshipsEventsPreview />,
  },
  {
    title: "Learning with Best Videos, Tracking System & Roadmaps.",
    alt: "Structured step-by-step career roadmaps with curated YouTube lessons, automated progress tracking and streak incentives.",
    badge: "Career Roadmaps",
    content: <LearningRoadmapsPreview />,
  },
];

export default function FeaturesWithPanel() {
  const [active, setActive] = React.useState(0);

  return (
    <section className="relative w-full py-24 bg-[#06070D] text-white overflow-hidden border-t border-white/10">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-purple-900/10 blur-[130px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 right-1/4 w-[500px] h-[500px] bg-[#C8B6FF]/10 blur-[140px] pointer-events-none rounded-full" />

      <div className="mx-auto max-w-6xl px-6 relative z-10">
        {/* Top Header Pill */}
        <div className="flex flex-col items-start mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#C8B6FF]/15 border border-[#C8B6FF]/35 text-[#C8B6FF] text-xs font-semibold uppercase tracking-wider mb-4 shadow-sm shadow-[#C8B6FF]/10">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Platform Capabilities</span>
          </div>

          <h2 className="text-4xl font-black tracking-tight text-white md:text-5xl lg:text-6xl leading-tight">
            Features that accelerate{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#C8B6FF] to-purple-400">
              your tech career.
            </span>
          </h2>
          <p className="mt-3 text-base text-zinc-400 max-w-2xl leading-relaxed">
            Everything you need in one cohesive ecosystem—from short-form SkillBits to verified scholarships and personalized roadmaps.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-16 lg:items-start">
          {/* Left: Feature List */}
          <div>
            <ul className="flex flex-col gap-2.5">
              {items.map((item, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.35,
                    delay: index * 0.07,
                    ease: "easeOut",
                  }}
                  onClick={() => setActive(index)}
                  className={cn(
                    "flex flex-col px-5 py-4 rounded-2xl cursor-pointer transition-all duration-200 lg:flex-row lg:items-center lg:gap-4 border",
                    active === index
                      ? "bg-white/[0.08] border-[#C8B6FF]/50 ring-1 ring-[#C8B6FF]/40 shadow-xl shadow-[#C8B6FF]/10"
                      : "bg-white/[0.02] border-white/10 hover:bg-white/[0.05] hover:border-white/20"
                  )}
                >
                  <div className="flex flex-row items-center gap-4 w-full lg:contents">
                    <span
                      className={cn(
                        "size-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 transition-colors duration-200",
                        active === index
                          ? "bg-[#C8B6FF] text-black shadow-md shadow-[#C8B6FF]/30"
                          : "bg-white/10 text-zinc-400"
                      )}
                    >
                      {index + 1}
                    </span>
                    <div className="flex flex-col">
                      <span
                        className={cn(
                          "text-base font-bold transition-colors duration-200",
                          active === index ? "text-white" : "text-zinc-300"
                        )}
                      >
                        {item.title}
                      </span>
                      {item.alt && (
                        <span className="text-xs text-zinc-400 mt-0.5 leading-relaxed hidden sm:block">
                          {item.alt}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Mobile Preview Accordion Dropdown */}
                  <AnimatePresence initial={false}>
                    {active === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                        className="w-full overflow-hidden lg:hidden mt-3"
                      >
                        <Card className="w-full overflow-hidden p-0 gap-0 aspect-4/3 relative border-white/15 bg-black rounded-2xl">
                          <div className="absolute inset-0">
                            <FeatureMedia
                              content={item.content}
                              alt={item.alt}
                            />
                          </div>
                        </Card>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Right: Sticky Media Panel (Desktop) */}
          <div className="hidden lg:block sticky top-24">
            <Card className="relative w-full aspect-[4/3] overflow-hidden p-0 gap-0 rounded-3xl border border-[#C8B6FF]/30 bg-black shadow-[0_20px_60px_-15px_rgba(0,0,0,0.9),_0_0_35px_rgba(200,182,255,0.12)]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  initial={{ opacity: 0, y: 12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                  className="absolute inset-0"
                >
                  <FeatureMedia
                    content={items[active].content}
                    alt={items[active].alt}
                  />
                </motion.div>
              </AnimatePresence>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
