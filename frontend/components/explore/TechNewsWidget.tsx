"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Newspaper,
  Terminal,
  Cpu,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Bell,
  Check,
  Code2,
  Database,
  Globe,
  Sparkles,
  Bookmark,
} from "lucide-react";
import AntigravityHeroCard from "@/components/explore/AntigravityHeroCard";
import { TechNewsStories } from "@/components/tech-news/TechNewsStories";

interface TechChannel {
  id: string;
  name: string;
  domain: string;
  verifiedSources: string[];
  interviewFocus: string;
  curriculumTopics: string[];
  icon: React.ElementType;
}

const CHANNELS: TechChannel[] = [
  {
    id: "systems",
    name: "Distributed Systems & Scalability",
    domain: "Cloud & Backend",
    verifiedSources: ["AWS Architecture Center", "Cloudflare Engineering", "Uber Engineering Blog"],
    interviewFocus: "System Design rounds: Consensus protocols (Raft/Paxos), distributed caching & event-driven message queues.",
    curriculumTopics: ["Consistent hashing algorithms", "Idempotency & write-ahead logging", "Microservice failure isolation"],
    icon: Layers,
  },
  {
    id: "ai-infra",
    name: "AI Systems & Inference Infrastructure",
    domain: "AI Engineering",
    verifiedSources: ["Google DeepMind Research", "OpenAI Engineering", "Hugging Face Technical Papers"],
    interviewFocus: "AI/ML Engineer rounds: KV cache optimization, quantization trade-offs, and vector database indexing.",
    curriculumTopics: ["PagedAttention & vLLM serving", "Embedding model latency profiling", "RAG pipeline evaluation metrics"],
    icon: Cpu,
  },
  {
    id: "web-runtime",
    name: "Modern Web Platforms & Compilers",
    domain: "Frontend & Tooling",
    verifiedSources: ["Vercel Engineering", "React Core RFCs", "Chrome V8 Platform Notes"],
    interviewFocus: "Staff Frontend rounds: Server Components execution models, bundler compilation graphs, and memory profiling.",
    curriculumTopics: ["Streaming SSR hydration mechanics", "WebAssembly audio/video compute", "Micro-frontend performance boundaries"],
    icon: Globe,
  },
  {
    id: "databases",
    name: "Database Engines & Storage Internals",
    domain: "Storage & Infra",
    verifiedSources: ["PostgreSQL Documentation", "Redis Open-Source Blog", "ScyllaDB Architecture"],
    interviewFocus: "Data Engineer & SDE rounds: B-Trees vs LSM-Trees, MVCC isolation levels, and replication topologies.",
    curriculumTopics: ["Index fragmentation diagnostics", "WAL crash recovery algorithms", "Partition key selection strategies"],
    icon: Database,
  },
];

const BRIEFING_FRAMEWORK = [
  {
    pillar: "01",
    title: "Architectural Trade-Off Analysis",
    description: "Every technical briefing dissects the engineering problem, alternatives rejected, and latency vs cost trade-offs.",
  },
  {
    pillar: "02",
    title: "Minimal Runnable Implementations",
    description: "Concrete code patterns, configuration snippets, and SQL schema examples—not abstract marketing slides.",
  },
  {
    pillar: "03",
    title: "System Design Interview Scenarios",
    description: "Direct mapping to real-world interview questions (e.g., 'How would you scale this to 10M concurrent users?').",
  },
];

export default function TechNewsWidget() {
  const [activeChannelId, setActiveChannelId] = useState<string>(CHANNELS[0].id);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const activeChannel = CHANNELS.find((c) => c.id === activeChannelId) || CHANNELS[0];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* ── Spatial Hero Banner with Antigravity 3D Tilt & Specular Lighting ── */}
      <AntigravityHeroCard glowColor="rgba(59, 130, 246, 0.25)">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-xl space-y-3.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-400/30 text-blue-300 text-xs font-black tracking-wide uppercase shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
              <span>Upcoming Module · Engineering Wire</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-snug">
              Curated Engineering Briefings &amp; RFCs
            </h2>

            <p className="text-slate-300 text-xs sm:text-sm font-medium leading-relaxed">
              Zero clickbait, zero fluff. An upcoming technical synthesis engine extracting architectural decisions, RFC specifications, and System Design insights directly from tier-1 engineering blogs.
            </p>

            <div className="pt-1 flex flex-wrap items-center gap-3">
              <span className="text-xs font-bold text-slate-300 bg-slate-800/90 border border-slate-700/80 px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-2xs">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Verified Engineering Blogs · Zero Hype</span>
              </span>

              <motion.button
                type="button"
                whileHover={{ scale: 1.04, y: -1 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setIsBookmarked((prev) => !prev)}
                className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer select-none shadow-md ${
                  isBookmarked
                    ? "bg-emerald-600 text-white shadow-emerald-900/30"
                    : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/30"
                }`}
              >
                {isBookmarked ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Subscribed for Updates</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>Follow Briefings</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>

          {/* Antigravity floating 3D emblem with Z-axis pop */}
          <div
            style={{ transform: "translateZ(45px)" }}
            className="hidden lg:flex flex-col items-center justify-center p-6 rounded-3xl bg-slate-800/70 border border-slate-700/80 shadow-2xl shrink-0 w-52 text-center backdrop-blur-2xl group-hover:shadow-[0_20px_40px_rgba(59,130,246,0.2)] transition-shadow"
          >
            <motion.div
              animate={{ y: [0, -6, 0], rotate: [0, 1.5, -1.5, 0] }}
              transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-[0_12px_28px_rgba(59,130,246,0.4)] mb-3"
            >
              <Newspaper className="w-9 h-9 stroke-[2.2]" />
            </motion.div>
            <span className="text-xs font-black text-slate-200 block">Engineering Briefs</span>
            <span className="text-[11px] font-bold text-blue-400 mt-0.5 block">Interview-Grade Depth</span>
          </div>
        </div>
      </AntigravityHeroCard>

      {/* ── Live 48h Stories Tray ── */}
      <TechNewsStories />

      {/* ── Interactive Channel Selectors ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Terminal className="w-4 h-4 text-blue-600" />
            <span>Technical Briefing Channels</span>
          </h3>
          <span className="text-[11px] font-bold text-slate-400">Select to explore coverage</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {CHANNELS.map((ch) => {
            const isSelected = activeChannelId === ch.id;
            const Icon = ch.icon;

            return (
              <motion.button
                key={ch.id}
                type="button"
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveChannelId(ch.id)}
                className={`p-4 sm:p-5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                  isSelected
                    ? "bg-white border-blue-600 shadow-[0_14px_32px_rgba(59,130,246,0.1)] ring-1 ring-blue-500/30"
                    : "bg-white hover:bg-slate-50 border-slate-200/90 shadow-2xs"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-extrabold text-blue-700 bg-blue-50 border border-blue-200/80 px-2 py-0.5 rounded-md">
                      {ch.domain}
                    </span>
                  </div>

                  <h4 className="font-black text-slate-900 text-xs sm:text-sm leading-snug">
                    {ch.name}
                  </h4>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-black text-blue-600">
                  <span>Channel Depth</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ── Active Channel Depth Teardown ── */}
      <motion.div
        key={activeChannel.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4"
      >
        <div className="border-b border-slate-100 pb-3">
          <h4 className="text-base font-black text-slate-900">{activeChannel.name}</h4>
          <p className="text-xs text-slate-600 font-medium mt-1">
            <strong className="text-slate-900 font-bold">Interview Focus:</strong> {activeChannel.interviewFocus}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-wider block">
              Tracked Verified Publications
            </span>
            <ul className="space-y-1.5 text-xs font-bold text-slate-800">
              {activeChannel.verifiedSources.map((source, i) => (
                <li key={i} className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                  <span>{source}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wider block">
              Core Architectural Topics
            </span>
            <ul className="space-y-1.5 text-xs font-bold text-slate-800">
              {activeChannel.curriculumTopics.map((topic, i) => (
                <li key={i} className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                  <span>{topic}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </motion.div>

      {/* ── Briefing Framework Pillars ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {BRIEFING_FRAMEWORK.map((item) => (
          <div
            key={item.pillar}
            className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2 flex flex-col justify-between"
          >
            <div className="space-y-1.5">
              <span className="text-xs font-black text-blue-600">{item.pillar}</span>
              <h5 className="text-xs sm:text-sm font-black text-slate-900 leading-snug">
                {item.title}
              </h5>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                {item.description}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
              <span>Standard</span>
              <span className="text-blue-600 font-black">Coming Soon</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
