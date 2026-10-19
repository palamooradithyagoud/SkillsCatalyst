"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ShieldCheck,
  Lock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  LogIn,
} from "lucide-react";
import { Pricing, PricingPlan } from "@/components/ui/pricing";
import {
  getTrialDaysRemaining,
  activateUserTrial,
  isUserTrialClaimed,
} from "@/lib/trial";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/lib/auth";
import { createPaymentOrder } from "@/lib/api/payment";
import { fetchSubscriptionPlans, SubscriptionPlanDTO } from "@/lib/api/subscription";

export interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PricingModal({ isOpen, onClose }: PricingModalProps) {
  const router = useRouter();
  const { session, isLoading: authLoading } = useAuth();
  const {
    plan: currentPlan,
    isPremium,
    expiresAt,
    refetch: refetchSubscription,
  } = useSubscription();
  const [mounted, setMounted] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"1month" | "3months">("3months");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isTrialClaimed, setIsTrialClaimed] = useState(false);
  const [trialDaysLeft, setTrialDaysLeft] = useState(7);
  const [isInitiatingPayment, setIsInitiatingPayment] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [serverPlans, setServerPlans] = useState<SubscriptionPlanDTO[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [plansError, setPlansError] = useState<string | null>(null);

  const [activeCheckout, setActiveCheckout] = useState<{
    planId: "1month" | "3months";
    planName: string;
    price: string;
    numericPrice: number;
  } | null>(null);

  useEffect(() => {
    setMounted(true);
    setIsTrialClaimed(isUserTrialClaimed());
    setTrialDaysLeft(getTrialDaysRemaining());
  }, []);

  // When modal is opened, always refetch latest server subscription status and live plans
  useEffect(() => {
    if (isOpen) {
      refetchSubscription();
      setCheckoutError(null);
      setIsInitiatingPayment(false);

      let isMounted = true;
      setPlansLoading(true);
      fetchSubscriptionPlans()
        .then((data) => {
          if (isMounted) {
            setServerPlans(data);
            setPlansError(null);
          }
        })
        .catch((err) => {
          if (isMounted) {
            setPlansError(err?.message || "Failed to load live plans.");
          }
        })
        .finally(() => {
          if (isMounted) setPlansLoading(false);
        });

      return () => {
        isMounted = false;
      };
    }
  }, [isOpen, refetchSubscription]);

  // Keyboard accessibility: ESC to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        if (activeCheckout) setActiveCheckout(null);
        else onClose();
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
    setCheckoutError(null);
    setActiveCheckout({
      planId: plan,
      planName,
      price,
      numericPrice,
    });
  };

  const monthlyPlan = serverPlans.find((p) => p.code === "premium_monthly");
  const threeMonthsPlan = serverPlans.find((p) => p.code === "premium_3_month");

  const monthlyAvailable = monthlyPlan ? monthlyPlan.is_active : false;
  const threeMonthsAvailable = threeMonthsPlan ? threeMonthsPlan.is_active : false;

  const monthlyPrice = monthlyPlan ? monthlyPlan.price_in_paise / 100 : 99;
  const threeMonthsPrice = threeMonthsPlan ? threeMonthsPlan.price_in_paise / 100 : 250;

  const handleInitiatePhonePePayment = async () => {
    if (!activeCheckout || isInitiatingPayment) return;

    if (!session) {
      if (typeof window !== "undefined") {
        localStorage.setItem("skillscatalyst_selected_plan", activeCheckout.planId);
      }
      onClose();
      router.push(`/login?plan=${activeCheckout.planId}&next=/dashboard`);
      return;
    }

    setIsInitiatingPayment(true);
    setCheckoutError(null);

    const planCode = activeCheckout.planId === "1month" ? "premium_monthly" : "premium_3_month";

    // Validate that the plan is active on client before sending request
    const chosenPlan = serverPlans.find((p) => p.code === planCode);
    if (serverPlans.length > 0 && (!chosenPlan || !chosenPlan.is_active)) {
      setIsInitiatingPayment(false);
      setCheckoutError("This plan has been deactivated or is no longer available.");
      return;
    }

    try {
      const order = await createPaymentOrder(planCode);
      if (order.checkout_url) {
        // Authoritative browser redirect to PhonePe Standard Checkout
        window.location.href = order.checkout_url;
      } else {
        throw new Error("PhonePe gateway did not return a valid checkout session.");
      }
    } catch (err: any) {
      console.error("[PricingModal] Failed to initiate PhonePe order:", err);
      setIsInitiatingPayment(false);
      setCheckoutError(
        err?.message || "Failed to initialize secure PhonePe checkout. Please try again."
      );
    }
  };

  const formattedExpiry = expiresAt
    ? new Date(expiresAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  const isMonthlyActive = isPremium && currentPlan === "premium_monthly";
  const is3MonthsActive = isPremium && currentPlan === "premium_3_month";

  const pricingPlans: PricingPlan[] = [
    {
      name: "FREE PLAN",
      price: "0",
      yearlyPrice: "0",
      period: "forever",
      billingNote: "Free forever • No credit card required",
      description: "Essential foundational access to explore skills",
      buttonText: !isPremium ? "Current Plan" : "Included in Free",
      href: "#",
      isPopular: false,
      currencySymbol: "₹",
      currency: "INR",
      features: [
        "Saved videos: 1",
        "Company interview questions: Pro only",
        "Placement Prep: Pro only",
        "Scholarships: Limited details",
        "Tech News: 1–2 stories",
        "Other premium features: Limited access (AI mentor & roadmaps)",
      ],
      onAction: () => {
        if (!isPremium) {
          setToastMessage("You are currently on the Free Tier.");
        } else {
          setToastMessage("You currently have full Pro access.");
        }
        setTimeout(() => setToastMessage(null), 2500);
      },
    },
    {
      name: "PREMIUM (1 MONTH)",
      price: String(monthlyPrice),
      yearlyPrice: String(monthlyPrice),
      period: "month",
      billingNote: isMonthlyActive && formattedExpiry
        ? `Active until ${formattedExpiry}`
        : "Billed monthly • Cancel anytime",
      description: "Fast-paced interview sprint preparation",
      buttonText: isMonthlyActive
        ? "Current Plan (Active)"
        : plansLoading
        ? "Loading price..."
        : !monthlyAvailable && serverPlans.length > 0
        ? "Unavailable"
        : isPremium
        ? `Switch to Monthly (₹${monthlyPrice})`
        : `Upgrade to 1 Month (₹${monthlyPrice})`,
      href: "#",
      isPopular: false,
      currencySymbol: "₹",
      currency: "INR",
      features: [
        "Saved videos: Unlimited",
        "Company interview questions: Full access",
        "Placement Prep: Full access",
        "Scholarships: Full details",
        "Tech News: All stories",
        "Other premium features: Full access",
      ],
      onAction: () => {
        if (plansLoading) return;
        if (!monthlyAvailable && serverPlans.length > 0) {
          setToastMessage("1-Month plan is currently unavailable.");
          setTimeout(() => setToastMessage(null), 2500);
          return;
        }
        if (isMonthlyActive) {
          setToastMessage(`Your 1-Month Premium is active until ${formattedExpiry}.`);
          setTimeout(() => setToastMessage(null), 2500);
          return;
        }
        handleSelectPlan("1month", "Premium 1 Month Pass", `₹${monthlyPrice}`, monthlyPrice);
      },
    },
    {
      name: "PREMIUM (3 MONTHS)",
      price: String(threeMonthsPrice),
      yearlyPrice: String(threeMonthsPrice),
      period: "3 months",
      billingNote: is3MonthsActive && formattedExpiry
        ? `Active until ${formattedExpiry}`
        : `Billed every 3 months • ₹${Math.round(threeMonthsPrice / 3)}/month`,
      description: "Complete 90-day placement preparation pack (Save ~16%)",
      buttonText: is3MonthsActive
        ? "Current Plan (Active)"
        : plansLoading
        ? "Loading price..."
        : !threeMonthsAvailable && serverPlans.length > 0
        ? "Unavailable"
        : isMonthlyActive
        ? `Extend for 3 Months (₹${threeMonthsPrice})`
        : `Upgrade to 3 Months (₹${threeMonthsPrice})`,
      href: "#",
      isPopular: true,
      currencySymbol: "₹",
      currency: "INR",
      features: [
        "Saved videos: Unlimited",
        "Company interview questions: Full access",
        "Placement Prep: Full access",
        "Scholarships: Full details",
        "Tech News: All stories",
        "Other premium features: Full access",
      ],
      onAction: () => {
        if (plansLoading) return;
        if (!threeMonthsAvailable && serverPlans.length > 0) {
          setToastMessage("3-Month plan is currently unavailable.");
          setTimeout(() => setToastMessage(null), 2500);
          return;
        }
        if (is3MonthsActive) {
          setToastMessage(`Your 3-Month Premium is active until ${formattedExpiry}.`);
          setTimeout(() => setToastMessage(null), 2500);
          return;
        }
        handleSelectPlan("3months", "Premium 3 Months Pass", `₹${threeMonthsPrice}`, threeMonthsPrice);
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

            {/* ── CONDITIONAL VIEW: Direct Clean PhonePe Checkout or Plans View ── */}
            <AnimatePresence mode="wait">
              {activeCheckout ? (
                <motion.div
                  key="checkout-dialog"
                  initial={{ opacity: 0, scale: 0.96, y: 12 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: -12 }}
                  className="py-6 max-w-md mx-auto space-y-6 text-center"
                >
                  {/* PhonePe Security Header */}
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/15 border border-blue-400/30 text-blue-300 text-xs font-semibold">
                    <Lock className="w-3.5 h-3.5 text-blue-400" />
                    <span>PhonePe Standard Checkout • 256-Bit SSL</span>
                  </div>

                  {/* Summary Card */}
                  <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5 text-left space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-bold text-white">{activeCheckout.planName}</h3>
                        <p className="text-xs text-slate-400">Full platform access • Billed once</p>
                      </div>
                      <div className="text-right">
                        <span className="text-3xl font-extrabold text-white">{activeCheckout.price}</span>
                        <span className="block text-[11px] text-slate-400">All taxes included</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/10 space-y-2 text-xs text-slate-300">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>660+ company interview sets with verified questions</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>AI Mentor & unlimited placement prep playground</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0" />
                        <span>100% 7-Day Money-Back Guarantee included</span>
                      </div>
                    </div>
                  </div>

                  {/* Accepted Payment Rails */}
                  <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
                    <span>Accepted:</span>
                    <span className="text-slate-200 font-medium">UPI (GPay, PhonePe, Paytm), Cards, NetBanking</span>
                  </div>

                  {/* Authentication Notice for logged-out users */}
                  {!session && !authLoading && (
                    <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-400/40 text-amber-200 text-xs text-center space-y-1">
                      <div className="font-semibold text-amber-300 flex items-center justify-center gap-1.5">
                        <LogIn className="w-3.5 h-3.5" />
                        <span>Student Account Required</span>
                      </div>
                      <p className="text-slate-300 text-[11px]">
                        Subscriptions link directly to your student account. Please sign in to proceed with payment.
                      </p>
                    </div>
                  )}

                  {/* Checkout Error Alert */}
                  {checkoutError && (
                    <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs text-left flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                      <span>{checkoutError}</span>
                    </div>
                  )}

                  {/* Primary Action Button */}
                  <div className="space-y-3 pt-2">
                    {!session && !authLoading ? (
                      <button
                        type="button"
                        onClick={() => {
                          if (typeof window !== "undefined") {
                            localStorage.setItem("skillscatalyst_selected_plan", activeCheckout.planId);
                          }
                          onClose();
                          router.push(`/login?plan=${activeCheckout.planId}&next=/dashboard`);
                        }}
                        className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-sm transition-all shadow-lg shadow-amber-500/20 active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <LogIn className="w-4 h-4" />
                        <span>Sign In to Pay {activeCheckout.price}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleInitiatePhonePePayment}
                        disabled={isInitiatingPayment}
                        className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-60 text-white font-extrabold text-sm transition-all shadow-lg shadow-blue-500/25 active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {isInitiatingPayment ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Connecting to PhonePe...</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-4 h-4" />
                            <span>Proceed to PhonePe Checkout ({activeCheckout.price})</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setActiveCheckout(null)}
                      disabled={isInitiatingPayment}
                      className="text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer flex items-center justify-center gap-1.5 mx-auto"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to plans</span>
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="pricing-new-design"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {plansError && (
                    <div className="mb-4 p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs flex items-center justify-between max-w-xl mx-auto">
                      <span>Live pricing could not be refreshed from the server.</span>
                      <button
                        onClick={() => {
                          setPlansLoading(true);
                          fetchSubscriptionPlans()
                            .then((data) => {
                              setServerPlans(data);
                              setPlansError(null);
                            })
                            .catch((err) => setPlansError(err?.message || "Failed to load plans"))
                            .finally(() => setPlansLoading(false));
                        }}
                        className="text-amber-300 font-bold underline hover:text-white cursor-pointer ml-3"
                      >
                        Retry
                      </button>
                    </div>
                  )}
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
