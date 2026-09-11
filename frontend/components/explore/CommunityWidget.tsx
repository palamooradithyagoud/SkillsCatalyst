"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Code2,
  Layers,
  MessageSquareCode,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Bell,
  Check,
  Sparkles,
  GitPullRequest,
  Clock,
  Award,
} from "lucide-react";
import AntigravityHeroCard from "@/components/explore/AntigravityHeroCard";

interface StudyPodTrack {
  id: string;
  name: string;
  category: string;
  description: string;
  targetRole: string;
  dailyRoutine: { title: string; desc: string }[];
  icon: React.ElementType;
}

const POD_TRACKS: StudyPodTrack[] = [
  {
    id: "dsa-daily",
    name: "Daily Algorithmic Problem Solving Pod",
    category: "DSA Foundation",
    description: "Daily 4-person squads working through curated company problem sheets with morning accountability standups.",
    targetRole: "Students targeting SDE I / Software Engineering campus placements",
    dailyRoutine: [
      { title: "Morning 15-Min Standup", desc: "Lock in today's target pattern and review previous blockers." },
      { title: "Independent Problem Solving", desc: "Solve 2-3 pattern-mapped LeetCode problems without peeking at solutions." },
      { title: "Code & Logic Exchange", desc: "Share GitHub links and compare time/space complexity optimizations." },
    ],
    icon: Code2,
  },
  {
    id: "system-design",
    name: "System Design & Architecture Circle",
    category: "Backend & Systems",
    description: "Collaborative whiteboarding cohorts designing scalable backend systems, message queues, and caching layers.",
    targetRole: "Engineers preparing for Full Stack, Backend & Systems interview rounds",
    dailyRoutine: [
      { title: "Architecture Case Brief", desc: "Receive real-world scenario (e.g., design a URL shortener or rate limiter)." },
      { title: "Collaborative Diagramming", desc: "Design data flow, API contracts, and database schema tradeoffs." },
      { title: "Peer Bottleneck Interrogation", desc: "Identify single points of failure, partition limits, and cost bottlenecks." },
    ],
    icon: Layers,
  },
  {
    id: "peer-mock",
    name: "1-on-1 Reciprocal Mock Interview Pairings",
    category: "Interview Readiness",
    description: "Structured peer mock technical rounds evaluated against standardized engineering rubric scorecards.",
    targetRole: "Candidates within 30 days of upcoming company technical screens",
    dailyRoutine: [
      { title: "45-Minute Live Screen", desc: "Candidate solves an unseen algorithmic problem while communicating logic aloud." },
      { title: "Rubric Scoring", desc: "Interviewer evaluates coding speed, edge case coverage, and verification skills." },
      { title: "Actionable Feedback", desc: "Immediate 15-minute debrief identifying communication and algorithmic gaps." },
    ],
    icon: MessageSquareCode,
  },
];

const COHORT_STANDARDS = [
  {
    title: "Strict 4–5 Member Cap",
    desc: "Small enough that every member participates actively every day without hiding in large groups.",
    icon: Users,
  },
  {
    title: "Git-Backed Accountability",
    desc: "Verification via GitHub commits and LeetCode activity logs to ensure all peers stay accountable.",
    icon: GitPullRequest,
  },
  {
    title: "Placement-Centric Rubrics",
    desc: "Structured evaluation rubrics modeled directly after top company technical interview standards.",
    icon: Award,
  },
];

export default function CommunityWidget() {
  const [selectedPodId, setSelectedPodId] = useState<string>(POD_TRACKS[0].id);
  const [isWaitlisted, setIsWaitlisted] = useState(false);

  const selectedPod = POD_TRACKS.find((p) => p.id === selectedPodId) || POD_TRACKS[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="space-y-6 max-w-5xl mx-auto"
    >
      {/* ── Spatial Hero Banner with Antigravity 3D Tilt & Specular Lighting ── */}
      <AntigravityHeroCard glowColor="rgba(16, 185, 129, 0.25)">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-xl space-y-3.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-black tracking-wide uppercase shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Upcoming Module · Peer Guilds</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-snug">
              Peer Study Pods &amp; Technical Guilds
            </h2>

            <p className="text-slate-300 text-xs sm:text-sm font-medium leading-relaxed">
              Never prepare in isolation. SkillsCatalyst Pods will connect small, disciplined cohorts of 4 to 5 students targeting identical placement bars for daily algorithmic routines and mock interviews.
            </p>

            <div className="pt-1 flex flex-wrap items-center gap-3">
              <span className="text-xs font-bold text-slate-300 bg-slate-800/90 border border-slate-700/80 px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-2xs">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Small Disciplined Squads · Zero Spam</span>
              </span>

              <motion.button
                type="button"
                whileHover={{ scale: 1.04, y: -1 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setIsWaitlisted((prev) => !prev)}
                className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer select-none shadow-md ${
                  isWaitlisted
                    ? "bg-emerald-600 text-white shadow-emerald-900/30"
                    : "bg-[#234B3B] hover:bg-[#1b3b2e] text-white shadow-emerald-950/40"
                }`}
              >
                {isWaitlisted ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Cohort Interest Saved</span>
                  </>
                ) : (
                  <>
                    <Bell className="w-3.5 h-3.5" />
                    <span>Join Pod Waitlist</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>

          {/* Antigravity floating 3D emblem with Z-axis pop */}
          <div
            style={{ transform: "translateZ(45px)" }}
            className="hidden lg:flex flex-col items-center justify-center p-6 rounded-3xl bg-slate-800/70 border border-slate-700/80 shadow-2xl shrink-0 w-52 text-center backdrop-blur-2xl group-hover:shadow-[0_20px_40px_rgba(16,185,129,0.2)] transition-shadow"
          >
            <motion.div
              animate={{ y: [0, -6, 0], rotate: [0, 1.5, -1.5, 0] }}
              transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-[0_12px_28px_rgba(16,185,129,0.4)] mb-3"
            >
              <Users className="w-9 h-9 stroke-[2.2]" />
            </motion.div>
            <span className="text-xs font-black text-slate-200 block">Focused Pods</span>
            <span className="text-[11px] font-bold text-emerald-400 mt-0.5 block">4-5 Members Each</span>
          </div>
        </div>
      </AntigravityHeroCard>

      {/* ── Interactive Pod Track Switcher ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-[#234B3B]" />
            <span>Study Pod Formats</span>
          </h3>
          <span className="text-[11px] font-bold text-slate-400">Select to preview daily routine</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {POD_TRACKS.map((pod) => {
            const isSelected = selectedPodId === pod.id;
            const Icon = pod.icon;

            return (
              <motion.button
                key={pod.id}
                type="button"
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedPodId(pod.id)}
                className={`p-5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                  isSelected
                    ? "bg-white border-[#234B3B] shadow-[0_14px_32px_rgba(35,75,59,0.1)] ring-1 ring-[#234B3B]/30"
                    : "bg-white hover:bg-slate-50 border-slate-200/90 shadow-2xs"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-[#234B3B]">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md">
                      {pod.category}
                    </span>
                  </div>

                  <h4 className="font-black text-slate-900 text-sm leading-snug">
                    {pod.name}
                  </h4>
                  <p className="text-xs text-slate-600 font-medium line-clamp-2">
                    {pod.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-black text-[#234B3B]">
                  <span>Squad Routine</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ── Active Pod Routine Blueprint Card ── */}
      <motion.div
        key={selectedPod.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4"
      >
        <div className="border-b border-slate-100 pb-3">
          <h4 className="text-base font-black text-slate-900">{selectedPod.name}</h4>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Target Audience: {selectedPod.targetRole}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {selectedPod.dailyRoutine.map((item, i) => (
            <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <span className="text-[10px] font-black text-[#234B3B] uppercase tracking-wider block">
                Routine Step {i + 1}
              </span>
              <h5 className="text-xs font-bold text-slate-900 leading-snug">{item.title}</h5>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Cohort Architectural Standards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {COHORT_STANDARDS.map((std) => {
          const Icon = std.icon;
          return (
            <div
              key={std.title}
              className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2 flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-[#234B3B] mb-2">
                  <Icon className="w-4 h-4" />
                </div>
                <h5 className="text-xs sm:text-sm font-black text-slate-900 leading-snug">
                  {std.title}
                </h5>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  {std.desc}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                <span>Standard</span>
                <span className="text-[#234B3B] font-black">Coming Soon</span>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
