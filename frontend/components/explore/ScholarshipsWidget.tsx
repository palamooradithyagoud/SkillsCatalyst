"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  Sparkles,
  Layers,
  FileCheck2,
  Compass,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Bell,
  Check,
  BookOpen,
  Code2,
} from "lucide-react";
import AntigravityHeroCard from "@/components/explore/AntigravityHeroCard";

interface GrantProgramTrack {
  id: string;
  title: string;
  category: string;
  targetProfile: string;
  examples: string[];
  evaluationFocus: string[];
  catalystAssistance: string;
}

const GRANT_TRACKS: GrantProgramTrack[] = [
  {
    id: "opensource",
    title: "Open-Source Contributor Fellowships",
    category: "Developer Fellowship",
    targetProfile: "Active repository contributors, library maintainers & student developers",
    examples: ["Google Summer of Code (GSoC)", "Linux Foundation Mentorship (LFX)", "Major League Hacking (MLH) Fellowship"],
    evaluationFocus: ["Public GitHub pull request quality", "Documentation clarity", "Git version control fluency"],
    catalystAssistance: "Automated commit history audit and proposal draft templates.",
  },
  {
    id: "academic",
    title: "Engineering Academic Research Fellowships",
    category: "Research Grant",
    targetProfile: "CS, AI/ML, and Systems undergraduate researchers",
    examples: ["ACM Student Research Competition", "IEEE Undergraduate Grants", "University Conference Travel Stipends"],
    evaluationFocus: ["Research abstract rigor", "Algorithm analysis depth", "Faculty recommendation letters"],
    catalystAssistance: "Statement of Purpose (SOP) structure review and literature review templates.",
  },
  {
    id: "diversity",
    title: "Diversity & Inclusion in Tech Fellowships",
    category: "Inclusion Grant",
    targetProfile: "Underrepresented engineers, first-generation college students & women in STEM",
    examples: ["Women Techmakers Scholars Program", "Grace Hopper Celebration Student Grants", "Rewriting the Code Fellowships"],
    evaluationFocus: ["Community impact", "Leadership initiative", "Technical career vision"],
    catalystAssistance: "Essay narrative feedback and interview preparation cohorts.",
  },
];

const ARCHITECTURE_PILLARS = [
  {
    title: "Direct Portal Synchronization",
    description: "Connects directly with official foundation websites and university portals to eliminate expired or third-party spam listings.",
    icon: Compass,
    tag: "Source Integrity",
  },
  {
    title: "GitHub & Profile Matching",
    description: "Evaluates your primary programming languages, repository commits, and project portfolio against fellowship prerequisites.",
    icon: Layers,
    tag: "Eligibility Engine",
  },
  {
    title: "Application Dossier Guidance",
    description: "Provides structured guidelines for technical proposals, statements of purpose, and reference requests.",
    icon: FileCheck2,
    tag: "Preparation",
  },
];

export default function ScholarshipsWidget() {
  const [selectedTrackId, setSelectedTrackId] = useState<string>(GRANT_TRACKS[0].id);
  const [isNotified, setIsNotified] = useState(false);

  const selectedTrack = GRANT_TRACKS.find((t) => t.id === selectedTrackId) || GRANT_TRACKS[0];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* ── Spatial Hero Banner with Antigravity 3D Tilt & Specular Lighting ── */}
      <AntigravityHeroCard glowColor="rgba(99, 102, 241, 0.25)">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-xl space-y-3.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-400/30 text-indigo-300 text-xs font-black tracking-wide uppercase shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              <span>Upcoming Module · Verified Opportunities</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-snug">
              Student Tech Grants &amp; Fellowships
            </h2>

            <p className="text-slate-300 text-xs sm:text-sm font-medium leading-relaxed">
              An upcoming verified discovery engine connecting student developers with legitimate open-source fellowships, collegiate research grants, and conference stipends—matched directly to your verified skills.
            </p>

            <div className="pt-1 flex flex-wrap items-center gap-3">
              <span className="text-xs font-bold text-slate-300 bg-slate-800/90 border border-slate-700/80 px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-2xs">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Zero Fake Listings · Verified Portals Only</span>
              </span>

              <motion.button
                type="button"
                whileHover={{ scale: 1.04, y: -1 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setIsNotified((prev) => !prev)}
                className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer select-none shadow-md ${
                  isNotified
                    ? "bg-emerald-600 text-white shadow-emerald-900/30"
                    : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/30"
                }`}
              >
                {isNotified ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Notification Saved</span>
                  </>
                ) : (
                  <>
                    <Bell className="w-3.5 h-3.5" />
                    <span>Notify on Release</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>

          {/* Antigravity floating 3D emblem with Z-axis pop */}
          <div
            style={{ transform: "translateZ(45px)" }}
            className="hidden lg:flex flex-col items-center justify-center p-6 rounded-3xl bg-slate-800/70 border border-slate-700/80 shadow-2xl shrink-0 w-52 text-center backdrop-blur-2xl group-hover:shadow-[0_20px_40px_rgba(99,102,241,0.2)] transition-shadow"
          >
            <motion.div
              animate={{ y: [0, -6, 0], rotate: [0, 1.5, -1.5, 0] }}
              transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-[0_12px_28px_rgba(99,102,241,0.4)] mb-3"
            >
              <GraduationCap className="w-9 h-9 stroke-[2.2]" />
            </motion.div>
            <span className="text-xs font-black text-slate-200 block">Verified Matching</span>
            <span className="text-[11px] font-bold text-indigo-400 mt-0.5 block">Zero Expired Links</span>
          </div>
        </div>
      </AntigravityHeroCard>

      {/* ── Interactive Category Preview Tabs ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-600" />
            <span>Target Opportunity Tracks</span>
          </h3>
          <span className="text-[11px] font-bold text-slate-400">Select to preview details</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {GRANT_TRACKS.map((track) => {
            const isSelected = selectedTrackId === track.id;
            return (
              <motion.button
                key={track.id}
                type="button"
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedTrackId(track.id)}
                className={`p-5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                  isSelected
                    ? "bg-white border-indigo-600 shadow-[0_14px_32px_rgba(99,102,241,0.1)] ring-1 ring-indigo-500/30"
                    : "bg-white hover:bg-slate-50 border-slate-200/90 shadow-2xs"
                }`}
              >
                <div className="space-y-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-50 text-indigo-700 border border-indigo-200/80 inline-block">
                    {track.category}
                  </span>
                  <h4 className="font-black text-slate-900 text-sm leading-snug">
                    {track.title}
                  </h4>
                  <p className="text-xs text-slate-600 font-medium line-clamp-2">
                    {track.targetProfile}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-black text-indigo-600">
                  <span>Preview Criteria</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ── Active Track Details Card ── */}
      <motion.div
        key={selectedTrack.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4"
      >
        <div className="border-b border-slate-100 pb-3">
          <h4 className="text-base font-black text-slate-900">{selectedTrack.title}</h4>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Intended profile: {selectedTrack.targetProfile}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wider block">
              Benchmark Programs
            </span>
            <ul className="space-y-1.5 text-xs font-bold text-slate-800">
              {selectedTrack.examples.map((ex, i) => (
                <li key={i} className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                  <span>{ex}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <span className="text-[10px] font-black text-purple-600 uppercase tracking-wider block">
              Key Evaluation Criteria
            </span>
            <ul className="space-y-1.5 text-xs font-bold text-slate-800">
              {selectedTrack.evaluationFocus.map((ev, i) => (
                <li key={i} className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
                  <span>{ev}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <span className="text-[10px] font-black text-emerald-700 uppercase tracking-wider block">
              Catalyst Preparation Support
            </span>
            <p className="text-xs font-semibold text-slate-700 leading-relaxed">
              {selectedTrack.catalystAssistance}
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── Architecture Pillars ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {ARCHITECTURE_PILLARS.map((pillar) => {
          const Icon = pillar.icon;
          return (
            <motion.div
              key={pillar.title}
              whileHover={{ y: -3 }}
              className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200/80 flex items-center justify-center text-indigo-600">
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">{pillar.tag}</span>
                </div>
                <h5 className="text-xs sm:text-sm font-black text-slate-900 leading-snug">
                  {pillar.title}
                </h5>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  {pillar.description}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                <span>Phase</span>
                <span className="text-indigo-600 font-black">Coming Soon</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
