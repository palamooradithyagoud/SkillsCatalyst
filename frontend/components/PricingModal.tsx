"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldCheck } from "lucide-react";
import PaymentPosSwipeAnimation from "@/components/PaymentPosSwipeAnimation";
import { Pricing, PricingPlan } from "@/components/ui/pricing";
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

  const handleSelectPlan = (
    plan: "1month" | "3months",
    planName: string,
    price: string,
    numericPrice: number
  ) => {
    setSelectedPlan(plan);
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
      localStorage.setItem(
        "skillscatalyst_trial_end",
        String(Date.now() + 7 * 24 * 60 * 60 * 1000)
      );
      window.dispatchEvent(new Event("skillscatalyst_pro_updated"));
    }
    setToastMessage(
      `🎉 Congratulations! Your ${activeCheckout?.planName || "Pro Pass"} is now ACTIVE!`
    );
    setActiveCheckout(null);
    setTimeout(() => {
      setToastMessage(null);
      onClose();
    }, 2800);
  };

  const pricingPlans: PricingPlan[] = [
    {
      name: "FREE PLAN",
      price: "0",
      yearlyPrice: "0",
      period: "forever",
      billingNote: "Free forever • No credit card required",
      description: "Essential foundational access to explore skills",
      buttonText: "Current Plan",
      href: "#",
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
      onAction: () => {
        setToastMessage("You are currently on the Free Tier.");
        setTimeout(() => setToastMessage(null), 2500);
      },
    },
    {
      name: "PREMIUM (1 MONTH)",
      price: "99",
      yearlyPrice: "99",
      period: "month",
      billingNote: "Billed monthly • Cancel anytime",
      description: "Fast-paced interview sprint preparation",
      buttonText: "Upgrade to 1 Month (₹99)",
      href: "#",
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
      onAction: () => {
        handleSelectPlan("1month", "Premium 1 Month Pass", "₹99", 99);
      },
    },
    {
      name: "PREMIUM (3 MONTHS)",
      price: "250",
      yearlyPrice: "250",
      period: "3 months",
      billingNote: "Billed every 3 months • ₹83/month",
      description: "Complete 90-day placement preparation pack (Save ~16%)",
      buttonText: "Upgrade to 3 Months (₹250)",
      href: "#",
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
      onAction: () => {
        handleSelectPlan("3months", "Premium 3 Months Pass", "₹250", 250);
      },
    },
  ];

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
            className="fixed inset-0 bg-black/50 backdrop-blur-xl"
          />

          {/* Modal Content with Transparent Blur Glass Color */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 15 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="relative z-10 w-full max-w-6xl my-auto bg-black/40 backdrop-blur-2xl border border-white/20 rounded-3xl p-4 sm:p-8 text-white shadow-[0_25px_70px_rgba(0,0,0,0.6)] overflow-hidden max-h-[92vh] overflow-y-auto"
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

            {/* ── CONDITIONAL VIEW: Active Checkout or New Pricing Component ── */}
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
                  key="pricing-new-design"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Pricing
                    plans={pricingPlans}
                    title="Simple, Transparent Pricing"
                    description={"Choose the plan that accelerates your tech career.\nUnrestricted access to company interview questions, AI mentor, roadmaps, and full placement prep."}
                    currencySymbol="₹"
                    currency="INR"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bottom Toast Feedback */}
            {toastMessage && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 text-xs font-bold text-center flex items-center justify-center gap-2"
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
