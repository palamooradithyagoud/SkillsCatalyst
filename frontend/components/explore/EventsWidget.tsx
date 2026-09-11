"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Sparkles,
  Mic2,
  Code2,
  FileCheck,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Bell,
  Check,
  Radio,
  SlidersHorizontal,
  BookmarkCheck,
  Users,
} from "lucide-react";
import AntigravityHeroCard from "@/components/explore/AntigravityHeroCard";

interface EventFormat {
  id: string;
  title: string;
  desc: string;
  badge: string;
  icon: React.ElementType;
  structure: { stage: string; detail: string }[];
}

const EVENT_FORMATS: EventFormat[] = [
  {
    id: "system-design",
    title: "System Design Architecture Breakdowns",
    desc: "Interactive architecture walkthroughs analyzing production scalability, failover mechanics, and real-world postmortems.",
    badge: "Architecture",
    icon: Mic2,
    structure: [
      { stage: "01. Problem Scope", detail: "Defining functional requirements, latency budgets, and traffic SLAs." },
      { stage: "02. Core Architecture", detail: "Live diagramming of caches, queues, and partitioned databases." },
      { stage: "03. Bottleneck Analysis", detail: "Addressing single points of failure, partition tolerance, and cost." },
    ],
  },
  {
    id: "coding-sprint",
    title: "Company-Focused Coding Sprints",
    desc: "Timed 90-minute problem sessions covering high-frequency LeetCode interview patterns.",
    badge: "Problem Solving",
    icon: Code2,
    structure: [
      { stage: "01. Pattern Recognition", detail: "Identifying whether a problem maps to DP, Two Pointers, or Monotonic Stack." },
      { stage: "02. Timed Implementation", detail: "Writing clean, optimal solutions within strict interview time constraints." },
      { stage: "03. Complexity Review", detail: "Analyzing Big-O space and time complexity and corner-case boundaries." },
    ],
  },
  {
    id: "resume-audit",
    title: "Constructive ATS & Portfolio Teardowns",
    desc: "Constructive critiques of anonymized student resumes and GitHub portfolios by senior reviewers.",
    badge: "Career Review",
    icon: FileCheck,
    structure: [
      { stage: "01. ATS Parse Check", detail: "Screening algorithm compatibility, typography, and section hierarchies." },
      { stage: "02. Impact Quantification", detail: "Rewriting bullet points using action-verb + quantifiable metric frameworks." },
      { stage: "03. GitHub Presentation", detail: "Auditing README structure, commit hygiene, and deployment links." },
    ],
  },
];

const CURATED_TOPICS = [
  { id: "t1", title: "Microservices & Distributed Caching with Redis", track: "Backend & Systems" },
  { id: "t2", title: "Advanced Dynamic Programming & Tree Traversal Patterns", track: "Algorithms" },
  { id: "t3", title: "Low-Level Design: Concurrency, Locks & Rate Limiters", track: "Object-Oriented Design" },
  { id: "t4", title: "Production AI Agent Workflows & Vector Retrieval", track: "AI Engineering" },
];

export default function EventsWidget() {
  const [activeFormatId, setActiveFormatId] = useState<string>(EVENT_FORMATS[0].id);
  const [interestedTopics, setInterestedTopics] = useState<Record<string, boolean>>({});
  const [isAlertSubscribed, setIsAlertSubscribed] = useState(false);

  const activeFormat = EVENT_FORMATS.find((f) => f.id === activeFormatId) || EVENT_FORMATS[0];

  const handleToggleInterest = (id: string) => {
    setInterestedTopics((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* ── Spatial Hero Banner with Antigravity 3D Tilt & Specular Lighting ── */}
      <AntigravityHeroCard glowColor="rgba(168, 85, 247, 0.25)">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-xl space-y-3.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-400/30 text-purple-300 text-xs font-black tracking-wide uppercase shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
              <span>Upcoming Module · Live Masterclasses</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-snug">
              Placement Masterclasses &amp; Sprints
            </h2>

            <p className="text-slate-300 text-xs sm:text-sm font-medium leading-relaxed">
              Interactive, small-cohort live technical masterclasses. Designed for direct placement preparation—covering architectural deep dives, LeetCode pattern sprints, and actionable resume teardowns.
            </p>

            <div className="pt-1 flex flex-wrap items-center gap-3">
              <span className="text-xs font-bold text-slate-300 bg-slate-800/90 border border-slate-700/80 px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-2xs">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Zero Passive Webinars · Practical Problem Solving</span>
              </span>

              <motion.button
                type="button"
                whileHover={{ scale: 1.04, y: -1 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setIsAlertSubscribed((prev) => !prev)}
                className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer select-none shadow-md ${
                  isAlertSubscribed
                    ? "bg-emerald-600 text-white shadow-emerald-900/30"
                    : "bg-purple-600 hover:bg-purple-500 text-white shadow-purple-900/30"
                }`}
              >
                {isAlertSubscribed ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Notification Saved</span>
                  </>
                ) : (
                  <>
                    <Bell className="w-3.5 h-3.5" />
                    <span>Notify for Inaugural Cohort</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>

          {/* Antigravity floating 3D emblem with Z-axis pop */}
          <div
            style={{ transform: "translateZ(45px)" }}
            className="hidden lg:flex flex-col items-center justify-center p-6 rounded-3xl bg-slate-800/70 border border-slate-700/80 shadow-2xl shrink-0 w-52 text-center backdrop-blur-2xl group-hover:shadow-[0_20px_40px_rgba(168,85,247,0.2)] transition-shadow"
          >
            <motion.div
              animate={{ y: [0, -6, 0], rotate: [0, 1.5, -1.5, 0] }}
              transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-[0_12px_28px_rgba(168,85,247,0.4)] mb-3"
            >
              <Calendar className="w-9 h-9 stroke-[2.2]" />
            </motion.div>
            <span className="text-xs font-black text-slate-200 block">Live Workshops</span>
            <span className="text-[11px] font-bold text-purple-400 mt-0.5 block">Small Cohorts</span>
          </div>
        </div>
      </AntigravityHeroCard>

      {/* ── Interactive Format Cards ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-purple-600" />
            <span>Curated Session Formats</span>
          </h3>
          <span className="text-[11px] font-bold text-slate-400">Select format to inspect structure</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {EVENT_FORMATS.map((fmt) => {
            const isSelected = activeFormatId === fmt.id;
            const Icon = fmt.icon;

            return (
              <motion.button
                key={fmt.id}
                type="button"
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveFormatId(fmt.id)}
                className={`p-5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                  isSelected
                    ? "bg-white border-purple-600 shadow-[0_14px_32px_rgba(168,85,247,0.1)] ring-1 ring-purple-500/30"
                    : "bg-white hover:bg-slate-50 border-slate-200/90 shadow-2xs"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-200/80 flex items-center justify-center text-purple-600">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-extrabold text-purple-700 bg-purple-50 border border-purple-200/80 px-2 py-0.5 rounded-md">
                      {fmt.badge}
                    </span>
                  </div>

                  <h4 className="font-black text-slate-900 text-sm leading-snug">
                    {fmt.title}
                  </h4>
                  <p className="text-xs text-slate-600 font-medium line-clamp-2">
                    {fmt.desc}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-black text-purple-600">
                  <span>Session Flow</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ── Active Format Breakdown Card ── */}
      <motion.div
        key={activeFormat.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4"
      >
        <div className="border-b border-slate-100 pb-3">
          <h4 className="text-base font-black text-slate-900">{activeFormat.title}</h4>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {activeFormat.desc}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {activeFormat.structure.map((item, i) => (
            <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <span className="text-[10px] font-black text-purple-700 uppercase tracking-wider block">
                {item.stage}
              </span>
              <p className="text-xs font-semibold text-slate-700 leading-relaxed">
                {item.detail}
              </p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Topic Interest Preferences (Zero Fake Numbers) ── */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
        <div>
          <h4 className="text-sm font-black text-slate-900">
            Curriculum Topic Preferences
          </h4>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Select the technical areas you want prioritized for upcoming masterclass schedules.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {CURATED_TOPICS.map((topic) => {
            const isInterested = !!interestedTopics[topic.id];

            return (
              <div
                key={topic.id}
                className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50 flex items-center justify-between gap-3"
              >
                <div>
                  <h5 className="text-xs font-black text-slate-900 leading-snug">{topic.title}</h5>
                  <span className="text-[10px] font-bold text-slate-500 mt-0.5 block">{topic.track}</span>
                </div>

                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleToggleInterest(topic.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black shrink-0 transition-all cursor-pointer ${
                    isInterested
                      ? "bg-purple-600 text-white shadow-xs"
                      : "bg-white border border-slate-300/80 text-purple-700 hover:bg-purple-50"
                  }`}
                >
                  {isInterested ? "Interested ✓" : "+ Interested"}
                </motion.button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
