"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Check,
  Sparkles,
  Zap,
  GraduationCap,
  Building2,
  Mail,
  Phone,
  MessageSquare,
  Copy,
  ArrowRight,
  Crown,
  ShieldCheck,
} from "lucide-react";

export type LandingPricingTier = "all" | "free" | "pro" | "enterprise";

export interface LandingPricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTier?: LandingPricingTier;
}

export default function LandingPricingModal({
  isOpen,
  onClose,
  initialTier = "all",
}: LandingPricingModalProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<LandingPricingTier>(initialTier);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTier || "all");
    }
  }, [isOpen, initialTier]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // When clicking to pay or get any plan, redirect to the login page
  const handleRedirectToLogin = (planKey?: string) => {
    if (typeof window !== "undefined" && planKey) {
      localStorage.setItem("skillscatalyst_selected_plan", planKey);
    }
    onClose();
    router.push(planKey ? `/login?plan=${planKey}` : "/login");
  };

  const handleCopyContact = (text: string, label: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedField(label);
      setToastMessage(`📋 Copied ${label} to clipboard!`);
      setTimeout(() => {
        setCopiedField(null);
        setToastMessage(null);
      }, 2500);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-3 sm:p-5 select-none overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/85 backdrop-blur-md"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 15 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="relative z-10 w-full max-w-6xl my-auto bg-[#0a0a0f] border border-white/20 rounded-3xl p-4 sm:p-7 text-white shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
          >
            {/* Top Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer z-30"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col h-full overflow-y-auto pr-1">
              {/* Header */}
              <div className="text-center max-w-2xl mx-auto space-y-2 mb-5 pt-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 text-xs font-black tracking-wider uppercase">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Transparent Pricing · 7-Day Free Trial</span>
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white">
                  SkillsCatalyst Plans & Pricing
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 font-medium">
                  Choose the right plan to jumpstart your career. Get started free or upgrade to Pro anytime.
                </p>

                {/* Navigation Tabs Filter */}
                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab("all")}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      activeTab === "all"
                        ? "bg-white text-black shadow-lg"
                        : "bg-white/10 text-slate-300 hover:bg-white/20"
                    }`}
                  >
                    All Plans (3 Tiers)
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("free")}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeTab === "free"
                        ? "bg-sky-500 text-white shadow-lg shadow-sky-500/30"
                        : "bg-white/10 text-slate-300 hover:bg-white/20"
                    }`}
                  >
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>Student Free Tier</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("pro")}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeTab === "pro"
                        ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/30"
                        : "bg-white/10 text-slate-300 hover:bg-white/20"
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Catalyst Pro</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-400 text-black font-extrabold">50% OFF</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("enterprise")}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeTab === "enterprise"
                        ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30"
                        : "bg-white/10 text-slate-300 hover:bg-white/20"
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>University Campus (Enterprise)</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-white text-indigo-900 font-extrabold">Contact</span>
                  </button>
                </div>
              </div>

              {/* ────────────────── THREE-TIER CARDS GRID ────────────────── */}
              <div
                className={`grid gap-5 sm:gap-6 items-stretch ${
                  activeTab === "all"
                    ? "grid-cols-1 md:grid-cols-3"
                    : "grid-cols-1 max-w-2xl mx-auto w-full"
                }`}
              >
                {/* ══════════════════ CARD 1: STUDENT FREE TIER ══════════════════ */}
                {(activeTab === "all" || activeTab === "free") && (
                  <div className="bg-[#10131c] border-2 border-slate-700/80 hover:border-sky-400/60 rounded-2xl p-5 sm:p-6 flex flex-col justify-between transition-all shadow-[0.35rem_0.35rem_rgba(56,189,248,0.15)] relative">
                    <div>
                      {/* Badge & Title */}
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-black text-white flex items-center gap-1.5">
                          <GraduationCap className="w-5 h-5 text-sky-400" />
                          Student Free Tier
                        </span>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded bg-sky-400/20 border border-sky-400/40 text-sky-300">
                          FREE FOREVER
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 font-medium">
                        Access free tracks, compilers and public pods
                      </p>

                      {/* Price Tag */}
                      <div className="mt-4 pb-3 border-b border-white/10">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-3xl sm:text-4xl font-black text-white">₹0</span>
                          <span className="text-xs text-slate-400 font-normal">/ forever</span>
                        </div>
                        <p className="text-[11px] text-sky-300/90 mt-1">
                          No credit card required • Instant access
                        </p>
                      </div>

                      {/* Feature Checklist */}
                      <div className="space-y-2.5 mt-4 text-xs text-slate-300">
                        <div className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                          <span>Access free structured foundational tracks</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                          <span>In-browser interactive coding compilers</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                          <span>Collaborate in open peer learning pods</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                          <span>Community developer cheat sheets & syntax docs</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                          <span>1 ATS resume score scan preview</span>
                        </div>
                      </div>
                    </div>

                    {/* Action CTA -> Redirect to Login */}
                    <div className="mt-6 pt-4 border-t border-white/10">
                      <button
                        type="button"
                        onClick={() => handleRedirectToLogin("free")}
                        className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-all cursor-pointer border border-white/15 flex items-center justify-center gap-1.5"
                      >
                        <span>Get Started Free</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* ══════════════════ CARD 2: CATALYST PRO ══════════════════ */}
                {(activeTab === "all" || activeTab === "pro") && (
                  <div className="bg-gradient-to-b from-[#0b2419] to-[#081510] border-2 border-emerald-400 rounded-2xl p-5 sm:p-6 flex flex-col justify-between transition-all shadow-[0.45rem_0.45rem_#10b981] relative">
                    <div>
                      {/* Highlight Ribbon */}
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-black text-emerald-300 flex items-center gap-1.5">
                          <Crown className="w-5 h-5 text-amber-400 fill-amber-400" />
                          Catalyst Pro
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] font-black px-2 py-0.5 rounded bg-emerald-400 text-black flex items-center gap-1">
                            <Sparkles className="w-3 h-3 fill-black" />
                            7 DAYS FREE
                          </span>
                          <span className="text-[10px] font-black px-2 py-0.5 rounded bg-amber-400 text-black">
                            50% OFF
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-emerald-200/80 mt-1 font-medium">
                        Unlimited AI mentorship, mock rounds & certificates
                      </p>

                      {/* 1-Month vs 3-Months Option Display */}
                      <div className="mt-4 p-3 rounded-xl bg-black/40 border border-emerald-500/30 space-y-2.5">
                        {/* Option 1: 1 Month Sprint (200 crossed out -> 99) */}
                        <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
                          <div>
                            <span className="text-xs font-black text-white">1 Month Sprint Pass</span>
                            <div className="text-[11px] text-slate-300">Fast sprint preparation</div>
                          </div>
                          <div className="text-right">
                            <span className="text-xs line-through text-slate-400 font-bold mr-1.5">₹200</span>
                            <span className="text-amber-300 text-xl font-black">₹99</span>
                            <span className="text-[10px] text-slate-300 block">/ month</span>
                          </div>
                        </div>

                        {/* Option 2: 3 Months Placement (600 crossed out -> 250 rs) */}
                        <div className="flex items-center justify-between pt-0.5">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-black text-emerald-300">3 Months Pro Pass</span>
                              <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-emerald-500 text-black">BEST VALUE</span>
                            </div>
                            <div className="text-[11px] text-emerald-200/80">Complete placement pack (₹83/mo)</div>
                          </div>
                          <div className="text-right">
                            <span className="text-xs line-through text-slate-400 font-bold mr-1.5">₹600</span>
                            <span className="text-emerald-400 text-2xl font-black">₹250</span>
                            <span className="text-[10px] text-emerald-200/80 block">/ 3 mos</span>
                          </div>
                        </div>
                      </div>

                      {/* Feature Checklist */}
                      <div className="space-y-2 mt-4 text-xs text-emerald-100">
                        <div className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span className="font-semibold text-white">Unlimited 24/7 AI Mentorship & Code Debugger</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span className="font-semibold text-white">Interactive Mock Rounds & Technical Challenges</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>Verified Certificates of Completion</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>All 20+ Skill Roadmaps + Custom AI Roadmaps</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>Unlimited ATS Resume scans with bullet rewrites</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>660+ Tech Company Question Banks</span>
                        </div>
                      </div>
                    </div>

                    {/* Action CTA with Dual Buttons -> Both redirect to Login */}
                    <div className="mt-6 pt-4 border-t border-emerald-400/30 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => handleRedirectToLogin("1month")}
                          className="w-full py-2.5 rounded-xl bg-white text-black font-black text-[11px] hover:bg-slate-200 transition-all shadow-md active:scale-95 cursor-pointer text-center"
                        >
                          1 Month (₹99) ➔
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRedirectToLogin("3months")}
                          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 text-black font-black text-[11px] hover:from-emerald-300 hover:to-teal-300 transition-all shadow-md active:scale-95 cursor-pointer text-center"
                        >
                          3 Months (₹250) ➔
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRedirectToLogin("trial")}
                        className="w-full text-center text-[11px] text-emerald-300 hover:text-emerald-200 font-bold py-1 transition-colors cursor-pointer block"
                      >
                        ⚡ Start 7-Day Free Trial (₹0 today)
                      </button>
                    </div>
                  </div>
                )}

                {/* ══════════════════ CARD 3: UNIVERSITY CAMPUS (ENTERPRISE) ══════════════════ */}
                {(activeTab === "all" || activeTab === "enterprise") && (
                  <div className="bg-[#121024] border-2 border-indigo-400/70 hover:border-indigo-400 rounded-2xl p-5 sm:p-6 flex flex-col justify-between transition-all shadow-[0.45rem_0.45rem_#6366f1] relative">
                    <div>
                      {/* Badge & Title */}
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-black text-indigo-300 flex items-center gap-1.5">
                          <Building2 className="w-5 h-5 text-indigo-400" />
                          University Campus
                        </span>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded bg-indigo-500/30 border border-indigo-400/50 text-indigo-200">
                          ENTERPRISE
                        </span>
                      </div>
                      <p className="text-xs text-indigo-200/80 mt-1 font-medium">
                        Enterprise dashboards & institutional curriculum
                      </p>

                      {/* Price Tag */}
                      <div className="mt-4 pb-3 border-b border-indigo-500/20">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-xl sm:text-2xl font-black text-white">Custom Campus License</span>
                        </div>
                        <p className="text-[11px] text-indigo-300 mt-1">
                          Institutions, colleges & departmental cohorts
                        </p>
                      </div>

                      {/* Feature Checklist */}
                      <div className="space-y-2 mt-4 text-xs text-indigo-100/90">
                        <div className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                          <span>Enterprise dashboards for Deans, HODs & Placement Cells</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                          <span>Institutional curriculum mapping & custom university tracks</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                          <span>Batch analytics, streak leaderboards & progress audits</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                          <span>Automated campus placement tests & company screening drives</span>
                        </div>
                      </div>

                      {/* ── Direct Contact Card of the Founder (Adithya) ── */}
                      <div className="mt-4 p-3 rounded-xl bg-indigo-950/60 border border-indigo-500/40 space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow">
                            PA
                          </div>
                          <div>
                            <div className="text-xs font-black text-white">Palamoor Adithya Goud</div>
                            <div className="text-[10px] text-indigo-300">Founder & Lead Developer</div>
                          </div>
                        </div>

                        <div className="space-y-1.5 pt-1 text-[11px]">
                          <div className="flex items-center justify-between text-indigo-200">
                            <span className="flex items-center gap-1.5 text-slate-300">
                              <Mail className="w-3 h-3 text-indigo-400" />
                              Email:
                            </span>
                            <a
                              href="mailto:palamooradithyagoud@gmail.com?subject=SkillsCatalyst%20University%20Campus%20Inquiry"
                              className="font-bold text-white hover:text-indigo-300 transition-colors underline truncate max-w-[170px]"
                            >
                              palamooradithyagoud@gmail.com
                            </a>
                          </div>

                          <div className="flex items-center justify-between text-indigo-200">
                            <span className="flex items-center gap-1.5 text-slate-300">
                              <Phone className="w-3 h-3 text-emerald-400" />
                              Phone/WhatsApp:
                            </span>
                            <a
                              href="https://wa.me/917330602101?text=Hi%20Adithya,%20we%20are%20interested%20in%20SkillsCatalyst%20University%20Campus%20for%20our%20institution"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-bold text-emerald-300 hover:text-emerald-200 transition-colors"
                            >
                              +91 7330602101
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-6 pt-4 border-t border-indigo-400/30 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <a
                          href="https://wa.me/917330602101?text=Hi%20Adithya,%20we%20are%20interested%20in%20SkillsCatalyst%20University%20Campus%20for%20our%20institution"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-[11px] transition-all shadow-md active:scale-95 text-center flex items-center justify-center gap-1.5"
                        >
                          <MessageSquare className="w-3.5 h-3.5 fill-black" />
                          <span>WhatsApp</span>
                        </a>
                        <a
                          href="mailto:palamooradithyagoud@gmail.com?subject=SkillsCatalyst%20University%20Campus%20Partnership"
                          className="py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[11px] transition-all shadow-md active:scale-95 text-center flex items-center justify-center gap-1.5"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>Email</span>
                        </a>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleCopyContact(
                            "Palamoor Adithya Goud\nEmail: palamooradithyagoud@gmail.com\nPhone/WhatsApp: +91 7330602101",
                            "Founder Contact"
                          )
                        }
                        className="w-full py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-[11px] font-bold text-indigo-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                        <span>{copiedField ? "Copied to Clipboard!" : "Copy Contact Details"}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Toast Feedback */}
            {toastMessage && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 text-xs font-bold text-center flex items-center justify-center gap-2 shrink-0"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{toastMessage}</span>
              </motion.div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
