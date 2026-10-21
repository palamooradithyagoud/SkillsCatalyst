"use client";

import React, { useState } from "react";
import MetricCards from "@/components/MetricCards";
import QuickHubNav from "@/components/QuickHubNav";
import EventHeroCard from "@/components/EventHeroCard";
import { TechNewsStories } from "@/components/tech-news/TechNewsStories";
import { useQuery } from "@tanstack/react-query";
import { fetchDashboardData } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useSubscription } from "@/hooks/useSubscription";
import { usePricingModal } from "@/contexts/PricingModalContext";
import { motion } from "framer-motion";
import { CheckCircle2, X, Loader2, Clock, AlertCircle } from "lucide-react";
import { fetchPaymentStatus } from "@/lib/api/payment";
import MoodCalendarWidget from "@/components/dashboard/MoodCalendarWidget";

interface PaymentBannerState {
  type: "verifying" | "success" | "pending" | "failed" | "error";
  message: string;
}

export default function DashboardPage() {
  const { session } = useAuth();
  const userId = session?.user_id;
  const { openPricingModal } = usePricingModal();
  const [paymentBanner, setPaymentBanner] = useState<PaymentBannerState | null>(null);
  const { refetch: refetchSubscription } = useSubscription();

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const hasPaymentParam = params.has("payment");
    const orderId = params.get("order_id") || params.get("merchant_order_id");

    if (!hasPaymentParam && !orderId) return;

    let isMounted = true;

    if (orderId) {
      setPaymentBanner({
        type: "verifying",
        message: "Verifying your transaction with PhonePe...",
      });

      fetchPaymentStatus(orderId)
        .then(async (res) => {
          if (!isMounted) return;

          // Strictly require BOTH status === "success" AND is_completed === true
          if (res?.status === "success" && res?.is_completed) {
            setPaymentBanner({
              type: "success",
              message: "Payment Confirmed: Your Premium access is active across all questions, prep, and roadmaps.",
            });
            try {
              if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("subscription-updated"));
              }
              await Promise.resolve(refetchSubscription());
            } catch (subErr) {
              console.error("[Dashboard] Subscription refetch failed after verified payment:", subErr);
            }
          } else if ((res?.status === "pending" || res?.status === "created") && !res?.is_completed) {
            setPaymentBanner({
              type: "pending",
              message: "Payment Processing: PhonePe is confirming your payment. Your access will activate shortly.",
            });
            try {
              await Promise.resolve(refetchSubscription());
            } catch {
              // Ignore
            }
          } else if (res?.status === "failed" || res?.status === "cancelled") {
            setPaymentBanner({
              type: "failed",
              message: "Payment Not Completed: The transaction was cancelled or failed. You have not been charged.",
            });
          } else {
            // Contradictory, missing, or unknown status values (e.g. status=pending with is_completed=true)
            setPaymentBanner({
              type: "error",
              message: "Transaction Status Unverified: Please check your payment history or contact support.",
            });
          }
        })
        .catch(() => {
          if (!isMounted) return;
          setPaymentBanner({
            type: "error",
            message: "Verification Unavailable: Could not verify payment transaction. Please check your payment history or contact support.",
          });
        })
        .finally(() => {
          try {
            const cleanUrl = window.location.pathname;
            window.history.replaceState({}, document.title, cleanUrl);
          } catch {
            // Ignore in unsupported environments
          }
        });
    } else if (hasPaymentParam) {
      // Unverified query parameter without order_id: do NOT show false success banner
      try {
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
      } catch {
        // Ignore
      }
    }

    return () => {
      isMounted = false;
    };
  }, [refetchSubscription]);

  const { data } = useQuery({
    queryKey: ["dashboard", userId],
    queryFn: () => fetchDashboardData(),
    enabled: !!session?.user_id,
  });

  // Framer Motion Animation Variants for smooth entrance
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 22, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 320,
        damping: 25,
      },
    },
  };

  const rightPanelVariants = {
    hidden: { opacity: 0, x: 28 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 26,
        delay: 0.25,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-[1060px] xl:max-w-[1100px] mx-auto space-y-4 sm:space-y-5 pb-16 sm:pb-24"
    >
      {/* ── Authoritative Payment Confirmation Banner ── */}
      {paymentBanner && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className={`p-3.5 sm:p-4 rounded-2xl border text-xs sm:text-sm font-medium flex items-center justify-between gap-3 shadow-sm transition-colors ${
            paymentBanner.type === "success"
              ? "bg-emerald-50 border-emerald-300 text-emerald-950 dark:bg-emerald-950/40 dark:border-emerald-500/40 dark:text-emerald-100 dark:shadow-emerald-950/30"
              : paymentBanner.type === "pending" || paymentBanner.type === "verifying"
              ? "bg-amber-50 border-amber-300 text-amber-950 dark:bg-amber-950/40 dark:border-amber-500/40 dark:text-amber-100 dark:shadow-amber-950/30"
              : "bg-red-50 border-red-300 text-red-950 dark:bg-rose-950/40 dark:border-rose-500/40 dark:text-rose-100 dark:shadow-rose-950/30"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {paymentBanner.type === "verifying" && (
              <Loader2 className="w-5 h-5 text-amber-600 dark:text-amber-400 animate-spin shrink-0" />
            )}
            {paymentBanner.type === "success" && (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            )}
            {paymentBanner.type === "pending" && (
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
            )}
            {(paymentBanner.type === "failed" || paymentBanner.type === "error") && (
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-rose-400 shrink-0" />
            )}
            <span className="font-semibold text-inherit">{paymentBanner.message}</span>
          </div>
          <button
            onClick={() => setPaymentBanner(null)}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
              paymentBanner.type === "success"
                ? "text-emerald-700 hover:text-emerald-950 hover:bg-emerald-100 dark:text-emerald-300 dark:hover:text-white dark:hover:bg-white/10"
                : paymentBanner.type === "pending" || paymentBanner.type === "verifying"
                ? "text-amber-700 hover:text-amber-950 hover:bg-amber-100 dark:text-amber-300 dark:hover:text-white dark:hover:bg-white/10"
                : "text-red-700 hover:text-red-950 hover:bg-red-100 dark:text-rose-300 dark:hover:text-white dark:hover:bg-white/10"
            }`}
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {/* ── Main Content Grid: Compact side-by-side without empty gap ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] xl:grid-cols-[510px_1fr] gap-5 sm:gap-6 items-start">
        {/* Left Main Area: Event Hero Banner + Tech Stories Icons + Quick Hub + Metric Cards */}
        <motion.div
          variants={itemVariants}
          className="w-full max-w-[540px] space-y-3.5 sm:space-y-4"
        >
          <EventHeroCard onOpenPricing={openPricingModal} />
          {/* Tech News Stories */}
          <TechNewsStories />
          <QuickHubNav />
          <MetricCards metrics={data?.metrics} hideEventCard={true} showOnly="metrics" />
        </motion.div>

        {/* Right / Middle Area: Mood Calendar, Learning Progress & Trending Skills */}
        <motion.div
          variants={rightPanelVariants}
          className="w-full max-w-[540px] space-y-4 sm:space-y-5 sticky top-6"
        >
          <MoodCalendarWidget />
          <MetricCards metrics={data?.metrics} hideEventCard={true} showOnly="learning-and-skills" />
        </motion.div>
      </div>
    </motion.div>
  );
}
