import React from "react";
import {
  Building2,
  FileCheck,
  Lock,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import BorderGlow from "@/components/BorderGlow";

interface CareerCardsProps {
  onOpenPlacementPrep: () => void;
  onOpenResumeReview: () => void;
}

export default function CareerCards({
  onOpenPlacementPrep,
  onOpenResumeReview,
}: CareerCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Card 1: Placement Prep (Active - First) */}
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
        className="h-full group cursor-pointer"
        onClick={onOpenPlacementPrep}
      >
        <BorderGlow
          edgeSensitivity={30}
          glowColor="147 51 234"
          backgroundColor="#ffffff"
          borderRadius={28}
          glowRadius={35}
          glowIntensity={1.2}
          animated={false}
          colors={['#8b5cf6', '#c084fc', '#38bdf8']}
          className="h-full p-6 md:p-7 flex flex-col justify-between transition-all duration-300 shadow-sm hover:shadow-xl border border-slate-200/90"
        >
          <div className="flex flex-col justify-between h-full space-y-6">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-white flex items-center justify-center shadow-md shadow-violet-500/30 group-hover:scale-105 transition-transform">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div className="px-3 py-1 rounded-full text-[11px] font-black bg-purple-600 text-white flex items-center gap-1.5 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                  Active Prep Suite
                </div>
              </div>

              <h3 className="text-xl font-extrabold text-slate-900 mb-2 group-hover:text-purple-700 transition-colors">
                Placement Prep
              </h3>
              <p className="text-xs md:text-sm text-slate-500 font-medium leading-relaxed">
                Curated company-wise interview problem archives, core DSA pattern benchmarks, aptitude suites, and tier-1 company hiring rubrics tailored for placement success.
              </p>
            </div>

            <button
              id="open-placement-prep-btn"
              onClick={(e) => {
                e.stopPropagation();
                onOpenPlacementPrep();
              }}
              className="w-full bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-500 hover:to-violet-500 text-white font-extrabold py-3 rounded-xl transition-all shadow-md shadow-purple-600/25 flex items-center justify-center gap-2 text-xs group/btn cursor-pointer"
            >
              <span>Start Placement Prep</span>
              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </div>
        </BorderGlow>
      </motion.div>

      {/* Card 2: Resume Review (Unlocked with 7-Day Free Trial) */}
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
        className="h-full group cursor-pointer"
        onClick={onOpenResumeReview}
      >
        <BorderGlow
          edgeSensitivity={30}
          glowColor="245 158 11"
          backgroundColor="#ffffff"
          borderRadius={28}
          glowRadius={35}
          glowIntensity={1.2}
          animated={false}
          colors={['#f59e0b', '#fbbf24', '#cbd5e1']}
          className="h-full p-6 md:p-7 flex flex-col justify-between transition-all duration-300 shadow-sm hover:shadow-xl border border-slate-200/90"
        >
          <div className="flex flex-col justify-between h-full space-y-6">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md shadow-amber-500/30 group-hover:scale-105 transition-transform">
                  <FileCheck className="w-6 h-6 text-white" />
                </div>
                <div className="px-3 py-1 rounded-full text-[11px] font-black bg-emerald-600 text-white flex items-center gap-1.5 shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  PRO FEATURE
                </div>
              </div>

              <h3 className="text-xl font-extrabold text-slate-900 mb-2 group-hover:text-amber-600 transition-colors">
                Resume Review
              </h3>
              <p className="text-xs md:text-sm text-slate-500 font-medium leading-relaxed">
                Calibrated AI scanner for Product-Based vs. Service-Based roles.
                Analyzes ATS compatibility, recruiter impressions, bullet rewrites, and missing skills.
              </p>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenResumeReview();
              }}
              className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-white font-extrabold py-3 rounded-xl transition-all shadow-md shadow-amber-500/25 flex items-center justify-center gap-2 text-xs group/btn cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span>Launch Resume Review (Free)</span>
              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </div>
        </BorderGlow>
      </motion.div>

      {/* Card 3: AI Interviews (Locked) */}
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
        className="h-full group"
      >
        <BorderGlow
          edgeSensitivity={30}
          glowColor="244 63 94"
          backgroundColor="#ffffff"
          borderRadius={28}
          glowRadius={35}
          glowIntensity={1.0}
          animated={false}
          colors={['#f43f5e', '#fb7185', '#cbd5e1']}
          className="h-full p-6 md:p-7 flex flex-col justify-between transition-all duration-300 shadow-sm border border-slate-200/90"
        >
          <div className="flex flex-col justify-between h-full space-y-6">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-amber-500 text-white flex items-center justify-center shadow-md shadow-rose-500/30">
                  <Lock className="w-6 h-6 text-white" />
                </div>
                <div className="px-3 py-1 rounded-full text-[11px] font-black bg-rose-500 text-white flex items-center gap-1.5 shadow-xs">
                  <Lock className="w-3.5 h-3.5" />
                  LOCKED
                </div>
              </div>

              <h3 className="text-xl font-extrabold text-slate-900 mb-2">
                AI Interviews
              </h3>
              <p className="text-xs md:text-sm text-slate-500 font-medium leading-relaxed">
                Real-time AI voice &amp; technical mock interview simulation suite.
                Locked for platform updates. Complete 5 DSA practice problems to
                unlock.
              </p>
            </div>

            <button
              disabled
              className="w-full bg-slate-100 border border-slate-200/80 text-slate-400 font-extrabold py-3 rounded-xl flex items-center justify-center gap-2 text-xs cursor-not-allowed"
            >
              <Lock className="w-4 h-4 text-slate-400" />
              <span>AI Interviews Locked</span>
            </button>
          </div>
        </BorderGlow>
      </motion.div>
    </div>
  );
}
