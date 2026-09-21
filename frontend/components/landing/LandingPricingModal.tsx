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
import { Pricing, PricingPlan } from "@/components/ui/pricing";

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
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const landingPlans: PricingPlan[] = [
    {
      name: "Student Free",
      price: "0",
      yearlyPrice: "0",
      period: "forever",
      billingNote: "Free forever • No credit card required",
      description: "Essential foundational access to explore skills & track basics",
      buttonText: "Get Started Free",
      href: "/login",
      isPopular: false,
      currencySymbol: "₹",
      currency: "INR",
      features: [
        "Saved videos: 1",
        "❌ Company interview questions",
        "❌ Placement Prep",
        "Scholarships: Limited details",
        "Tech News: 1–2 stories",
        "Other premium features: Limited access (AI mentor & roadmaps)",
      ],
      onAction: () => handleRedirectToLogin("free"),
    },
    {
      name: "Premium (1 Month)",
      price: "99",
      yearlyPrice: "99",
      period: "month",
      billingNote: "Billed monthly • Cancel anytime",
      description: "Fast-paced interview sprint preparation with 660+ company sets",
      buttonText: "Get 1 Month Pass (₹99)",
      href: "/login?plan=1month",
      isPopular: false,
      currencySymbol: "₹",
      currency: "INR",
      features: [
        "Saved videos: Unlimited",
        "✅ Company interview questions",
        "✅ Placement Prep",
        "Scholarships: Full details",
        "Tech News: All stories",
        "Other premium features: Full access",
      ],
      onAction: () => handleRedirectToLogin("1month"),
    },
    {
      name: "Premium (3 Months)",
      price: "250",
      yearlyPrice: "250",
      period: "3 months",
      billingNote: "Billed every 3 months • ₹83/month",
      description: "Complete 90-day placement preparation pack (just ₹83/mo)",
      buttonText: "Get 3 Months Pass (₹250)",
      href: "/login?plan=3months",
      isPopular: true,
      currencySymbol: "₹",
      currency: "INR",
      features: [
        "Saved videos: Unlimited",
        "✅ Company interview questions",
        "✅ Placement Prep",
        "Scholarships: Full details",
        "Tech News: All stories",
        "Other premium features: Full access",
      ],
      onAction: () => handleRedirectToLogin("3months"),
    },
  ];

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
            className="fixed inset-0 bg-black/50 backdrop-blur-xl"
          />

          {/* Modal Content with Transparent Blur Glass Color */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 15 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="relative z-10 w-full max-w-6xl my-auto bg-black/40 backdrop-blur-2xl border border-white/20 rounded-3xl p-4 sm:p-8 text-white shadow-[0_25px_70px_rgba(0,0,0,0.6)] overflow-hidden max-h-[92vh] flex flex-col"
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
              {/* ── New Unified Pricing Component ── */}
              <Pricing
                plans={landingPlans}
                title="SkillsCatalyst Plans & Pricing"
                description={"Simple, transparent plans designed to launch your tech career.\nUnrestricted access to interview problems, AI mentors, roadmaps, and full placement prep."}
                currencySymbol="₹"
                currency="INR"
              />

              {/* ── Enterprise / Campus Partnership Banner ── */}
              <div className="mt-8 p-5 sm:p-6 rounded-2xl bg-[#121024] border border-indigo-500/40 max-w-4xl mx-auto w-full">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-indigo-400" />
                      <span className="text-base font-black text-white">University Campus & Enterprise</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/30 text-indigo-300">
                        Custom Cohorts
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">
                      Looking to equip your university department or college batch with institutional licenses?
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href="https://wa.me/917330602101?text=Hi%20Adithya,%20we%20are%20interested%20in%20SkillsCatalyst%20University%20Campus%20for%20our%20institution"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center gap-1.5 transition-all shadow"
                    >
                      <MessageSquare className="w-3.5 h-3.5 fill-black" />
                      <span>WhatsApp</span>
                    </a>
                    <a
                      href="mailto:palamooradithyagoud@gmail.com?subject=SkillsCatalyst%20University%20Campus%20Partnership"
                      className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Email</span>
                    </a>
                  </div>
                </div>
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
