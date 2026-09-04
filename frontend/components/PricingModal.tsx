"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Sparkles, Zap, ShieldCheck } from "lucide-react";
import PaymentPosSwipeAnimation from "@/components/PaymentPosSwipeAnimation";
import {
  getTrialDaysRemaining,
  activateUserTrial,
  isUserTrialClaimed,
} from "@/lib/trial";

export interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PricingModal({ isOpen, onClose }: PricingModalProps) {
  const [mounted, setMounted] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"1month" | "3months">("3months");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isTrialClaimed, setIsTrialClaimed] = useState(false);
  const [trialDaysLeft, setTrialDaysLeft] = useState(7);
  const [activeCheckout, setActiveCheckout] = useState<{
    planId: "1month" | "3months";
    planName: string;
    price: string;
    numericPrice: number;
  } | null>(null);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      setIsTrialClaimed(isUserTrialClaimed());
      setTrialDaysLeft(getTrialDaysRemaining());
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        if (activeCheckout) {
          setActiveCheckout(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, activeCheckout]);

  const handleActivateTrialForPlan = (plan: "1month" | "3months", planName: string) => {
    activateUserTrial(plan);
    setIsTrialClaimed(true);
    setTrialDaysLeft(7);
    setToastMessage(`🎉 7-Day Free Trial Activated for ${planName}! All Catalyst Pro features are unlocked.`);
    setTimeout(() => {
      setToastMessage(null);
      onClose();
    }, 2200);
  };

  const handleSelectPlan = (plan: "1month" | "3months", planName: string, price: string, numericPrice: number) => {
    setSelectedPlan(plan);
    // Trigger the POS card insertion / swipe checkout animation
    setActiveCheckout({
      planId: plan,
      planName,
      price,
      numericPrice,
    });
  };

  const handlePaymentSuccess = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("skillscatalyst_pro_member", "true");
      localStorage.setItem("skillscatalyst_pro_plan", activeCheckout?.planId || "3months");
      localStorage.setItem("skillscatalyst_trial_end", String(Date.now() + 7 * 24 * 60 * 60 * 1000));
      window.dispatchEvent(new Event("skillscatalyst_pro_updated"));
    }
    setToastMessage(`🎉 Congratulations! Your ${activeCheckout?.planName || "Pro Pass"} is now ACTIVE with 7-Day Free Trial!`);
    setActiveCheckout(null);
    setTimeout(() => {
      setToastMessage(null);
      onClose();
    }, 2800);
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-3 sm:p-6 select-none overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              if (activeCheckout) setActiveCheckout(null);
              else onClose();
            }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 15 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="relative z-10 w-full max-w-4xl my-auto bg-[#0a0a0a] border-2 border-white/20 rounded-3xl p-4 sm:p-8 text-white shadow-2xl overflow-hidden"
          >
            {/* Top Close Button */}
            <button
              onClick={() => {
                if (activeCheckout) setActiveCheckout(null);
                else onClose();
              }}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer z-20"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* ── CONDITIONAL VIEW: Active POS Card Swipe Checkout or Plans Selection ── */}
            <AnimatePresence mode="wait">
              {activeCheckout ? (
                <motion.div
                  key="checkout-pos"
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -15 }}
                  className="py-4"
                >
                  <PaymentPosSwipeAnimation
                    planId={activeCheckout.planId}
                    planName={activeCheckout.planName}
                    price={activeCheckout.price}
                    numericPrice={activeCheckout.numericPrice}
                    onSuccess={handlePaymentSuccess}
                    onCancel={() => setActiveCheckout(null)}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="plans-grid"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                >
                  {/* Header */}
                  <div className="text-center max-w-xl mx-auto space-y-2 mb-6 sm:mb-8 pt-2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 text-xs font-black tracking-wider uppercase">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>7-Day Free Trial on All Plans</span>
                    </div>
                    <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                      Supercharge Your Tech Career
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300 font-medium">
                      Select 1 Month or 3 Months to start. All plans include a 7-day free trial with unrestricted access to roadmaps, 660+ company problems, and ATS tools.
                    </p>
                  </div>

                  {/* 2 Modern Pricing Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto items-stretch">
                    {/* ── CARD 1: 1 MONTH (₹99) ── */}
                    <div className="retro-pricing-card border-white shadow-[0.4rem_0.4rem_#ffffff] relative flex flex-col justify-between">
                      <div className="pricing-block-content">
                        <div className="flex items-center justify-between">
                          <span className="pricing-plan text-white">1 Month</span>
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] font-black px-2 py-0.5 rounded bg-emerald-400 text-black flex items-center gap-1">
                              <Sparkles className="w-3 h-3 fill-black" />
                              7 DAYS FREE
                            </span>
                            <span className="text-[10px] font-black px-2 py-0.5 rounded bg-amber-400 text-black">
                              SPRINT PASS
                            </span>
                          </div>
                        </div>

                        <div className="price-value mt-2">
                          <span className="text-sm line-through text-slate-400 font-bold mr-1">₹199</span>
                          <span className="text-amber-300 text-3xl font-black">₹99</span>
                          <span className="text-xs text-slate-300 font-normal">/ month</span>
                        </div>

                        <p className="pricing-note text-slate-300">
                          Sprint Pass • <span className="text-emerald-300 font-semibold">Includes 7-Day Free Trial</span>
                        </p>

                        <div className="check-list mt-3">
                          <div className="check-list-item">
                            <Check className="w-3.5 h-3.5 text-amber-300 shrink-0 mt-0.5" />
                            <span className="font-semibold text-white">All 20+ Skill & Career Roadmaps</span>
                          </div>
                          <div className="check-list-item">
                            <Check className="w-3.5 h-3.5 text-amber-300 shrink-0 mt-0.5" />
                            <span>Unlimited custom AI-generated roadmaps</span>
                          </div>
                          <div className="check-list-item">
                            <Check className="w-3.5 h-3.5 text-amber-300 shrink-0 mt-0.5" />
                            <span>Full Flowchart Tree Roots with subtopics</span>
                          </div>
                          <div className="check-list-item">
                            <Check className="w-3.5 h-3.5 text-amber-300 shrink-0 mt-0.5" />
                            <span>Unlimited Resume scans (PDF, DOCX, TXT)</span>
                          </div>
                          <div className="check-list-item">
                            <Check className="w-3.5 h-3.5 text-amber-300 shrink-0 mt-0.5" />
                            <span>Line-by-line ATS bullet rewrites</span>
                          </div>
                          <div className="check-list-item">
                            <Check className="w-3.5 h-3.5 text-amber-300 shrink-0 mt-0.5" />
                            <span>Job Description (JD) matching & keywords</span>
                          </div>
                          <div className="check-list-item">
                            <Check className="w-3.5 h-3.5 text-amber-300 shrink-0 mt-0.5" />
                            <span>All 660+ Tech Company Question Banks</span>
                          </div>
                          <div className="check-list-item">
                            <Check className="w-3.5 h-3.5 text-amber-300 shrink-0 mt-0.5" />
                            <span>Full Personal Readiness Index (PRI)</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-white/20 space-y-2">
                        <button
                          type="button"
                          onClick={() => handleSelectPlan("1month", "1 Month Sprint Pass", "₹99", 99)}
                          className="w-full py-2.5 rounded-xl bg-white text-black font-black text-xs hover:bg-slate-200 transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <span>Get 1 Month Pass (₹99)</span>
                          <span>➔</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleActivateTrialForPlan("1month", "1 Month Pass")}
                          className="w-full text-center text-[11px] text-emerald-400 hover:text-emerald-300 font-bold py-1 transition-colors cursor-pointer"
                        >
                          ⚡ Start 7-Day Free Trial (₹0 today)
                        </button>
                      </div>
                    </div>

                    {/* ── CARD 2: 3 MONTHS (₹250 - MOST POPULAR) ── */}
                    <div className="retro-pricing-card border-emerald-400 shadow-[0.45rem_0.45rem_#10b981] relative bg-gradient-to-b from-[#0f241a] to-black flex flex-col justify-between">
                      <div className="pricing-block-content">
                        <div className="flex items-center justify-between">
                          <span className="pricing-plan text-emerald-300">3 Months</span>
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] font-black px-2 py-0.5 rounded bg-emerald-400 text-black flex items-center gap-1">
                              <Sparkles className="w-3 h-3 fill-black" />
                              7 DAYS FREE
                            </span>
                            <span className="text-[10px] font-black px-2 py-0.5 rounded bg-emerald-400 text-black flex items-center gap-1">
                              <Zap className="w-3 h-3 fill-black" />
                              MOST POPULAR
                            </span>
                          </div>
                        </div>

                        <div className="price-value mt-2">
                          <span className="text-sm line-through text-slate-400 font-bold mr-1">₹600</span>
                          <span className="text-emerald-400 text-3xl font-black">₹250</span>
                          <span className="text-xs text-emerald-200/80 font-normal">/ 3 mos</span>
                        </div>

                        <p className="pricing-note text-emerald-200/80">
                          Just <span className="font-bold text-white">₹83.3/month</span> • <span className="text-emerald-300 font-semibold">Includes 7-Day Free Trial</span>
                        </p>

                        <div className="check-list mt-3">
                          <div className="check-list-item">
                            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            <span className="font-semibold text-white">Everything in 1 Month Plan</span>
                          </div>
                          <div className="check-list-item">
                            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            <span>Complete 90-Day Placement Prep Pack</span>
                          </div>
                          <div className="check-list-item">
                            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            <span>Priority 24/7 AI Code Debugger & Mentor</span>
                          </div>
                          <div className="check-list-item">
                            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            <span>Company frequency & 30d/6m/1yr filter tags</span>
                          </div>
                          <div className="check-list-item">
                            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            <span>Interactive chapter quizzes & badges</span>
                          </div>
                          <div className="check-list-item">
                            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            <span>Unlimited homework & placement drills</span>
                          </div>
                          <div className="check-list-item">
                            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            <span>Continuous LeetCode & GFG profile sync</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-emerald-400/30 space-y-2">
                        <button
                          type="button"
                          onClick={() => handleSelectPlan("3months", "3 Months Pro Pass", "₹250", 250)}
                          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-black text-xs hover:from-emerald-400 hover:to-teal-400 transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <span>Get 3 Months Pass (₹250)</span>
                          <span>➔</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleActivateTrialForPlan("3months", "3 Months Pass")}
                          className="w-full text-center text-[11px] text-emerald-400 hover:text-emerald-300 font-bold py-1 transition-colors cursor-pointer"
                        >
                          ⚡ Start 7-Day Free Trial (₹0 today)
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bottom Toast Feedback */}
            {toastMessage && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-3 rounded-xl bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 text-xs font-bold text-center flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
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
