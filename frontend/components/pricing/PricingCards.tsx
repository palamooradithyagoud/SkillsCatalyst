"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Check, X, Zap, ArrowRight, RefreshCw, AlertCircle } from "lucide-react";
import { fetchSubscriptionPlans, SubscriptionPlan } from "@/lib/api/subscription";

const COMPARISON_ROWS = [
  { feature: "Career Roadmaps & Tracks", free: "Basic tracks", oneMonth: "All tracks unlocked", threeMonths: "All tracks unlocked" },
  { feature: "660+ Company Interview Rounds", free: "—", oneMonth: "Full access", threeMonths: "Full access" },
  { feature: "In-Browser Code Compilers", free: "Yes", oneMonth: "Yes", threeMonths: "Yes" },
  { feature: "AI Mock Technical Interviews", free: "Preview", oneMonth: "Unlimited", threeMonths: "Unlimited" },
  { feature: "ATS Resume Reviewer & Score", free: "—", oneMonth: "Full line-by-line", threeMonths: "Full line-by-line" },
  { feature: "Verified Certificate (at /verify)", free: "—", oneMonth: "—", threeMonths: "Included with QR & ID" },
  { feature: "Scholarship & Hackathon Alerts", free: "Limited", oneMonth: "Full details", threeMonths: "Full details" },
  { feature: "Money-Back Guarantee", free: "Always free", oneMonth: "100% 7-Day Refund", threeMonths: "100% 7-Day Refund" },
  { feature: "Support Desk SLA", free: "Community", oneMonth: "Within 24h", threeMonths: "Priority <12h" },
];

export default function PricingCards() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchSubscriptionPlans();
        if (isMounted) {
          // Filter to strictly active plans and sort by price
          const activePlans = data.filter((p) => p.is_active);
          setPlans(activePlans);
        }
      } catch (err: unknown) {
        if (isMounted) {
          const msg = err instanceof Error ? err.message : "Failed to load live plans.";
          setError(msg);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch mb-20">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-96 rounded-3xl bg-slate-900/60 border border-white/10 animate-pulse p-8 space-y-4"
            >
              <div className="h-6 w-32 bg-slate-800 rounded-md" />
              <div className="h-10 w-24 bg-slate-800 rounded-md" />
              <div className="h-4 w-full bg-slate-800 rounded-md" />
              <div className="h-4 w-3/4 bg-slate-800 rounded-md" />
              <div className="h-20 w-full bg-slate-800/40 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error && plans.length === 0) {
    return (
      <div className="p-8 text-center rounded-3xl border border-rose-500/30 bg-rose-500/10 text-rose-300 max-w-lg mx-auto mb-20 space-y-3">
        <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
        <h3 className="font-bold text-base text-white">Could not load pricing plans</h3>
        <p className="text-xs text-rose-300/80">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  // Derive monthly and 3-month dynamic pricing for comparison matrix
  const monthlyPlan = plans.find((p) => p.code === "premium_monthly");
  const threeMonthsPlan = plans.find((p) => p.code === "premium_3_month");
  const monthlyPriceStr = monthlyPlan ? `₹${monthlyPlan.price_in_paise / 100}` : "₹99";
  const threeMonthsPriceStr = threeMonthsPlan ? `₹${threeMonthsPlan.price_in_paise / 100}` : "₹250";

  return (
    <>
      {/* ── Dynamic Pricing Cards Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch mb-20">
        {plans.map((plan) => {
          const isFree = plan.code === "free";
          const isPopular = plan.code === "premium_3_month";
          const isSprint = plan.code === "premium_monthly";
          const priceInRupees = plan.price_in_paise / 100;
          const priceFormatted = `₹${priceInRupees}`;

          const periodFormatted = isFree
            ? "forever"
            : plan.duration_days
            ? `for ${plan.duration_days} days`
            : "per period";

          // Calculate monthly equivalent savings if duration > 30 days
          let monthlyEquivalent: string | null = null;
          if (plan.duration_days && plan.duration_days >= 60 && priceInRupees > 0) {
            const months = plan.duration_days / 30;
            const perMonth = Math.round(priceInRupees / months);
            monthlyEquivalent = `₹${perMonth} / month • Placement Pack`;
          }

          const badge = isPopular
            ? "Most Popular"
            : isSprint
            ? "Fast Sprint"
            : undefined;

          const ctaText = isFree
            ? "Start Learning Free"
            : `Get ${plan.name} (${priceFormatted})`;

          const ctaHref = `/login?plan=${plan.code}&next=/dashboard`;

          // Standardized features list
          const features = isFree
            ? [
                "Access to public career roadmaps",
                "Interactive code compilers & practice playground",
                "Daily SkillBits micro-learning exercises",
                "1 saved learning roadmap / video solution",
                "Preview of scholarship alerts & student tech news",
                "Basic AI Mentor query previews",
              ]
            : [
                "Everything in Student Free",
                "660+ Company-specific interview question sets & patterns",
                "Unlimited AI Mock Technical Interviews with real-time scoring",
                "ATS Resume Scanner with line-by-line feedback",
                "Unlimited saved roadmaps, bookmarks & code sandboxes",
                "Full scholarship deadlines, eligibility & alerts",
                "Direct email support via support@skillscatalyst.in",
                "100% 7-Day Money-Back Guarantee included",
              ];

          const notIncluded = isFree
            ? [
                "660+ Company-specific interview question sets",
                "Full AI Mock technical & voice interview rounds",
                "In-depth ATS resume scoring & bullet-point feedback",
                "Verified course completion certificate with public URL",
                "Priority resolution support desk",
              ]
            : [];

          return (
            <div
              key={plan.id || plan.code}
              className={`relative flex flex-col justify-between rounded-3xl p-7 sm:p-8 transition-all duration-300 ${
                isPopular
                  ? "bg-gradient-to-b from-[#18112e] via-[#100d20] to-[#0a0815] border-2 border-purple-500/80 shadow-[0_0_50px_rgba(168,85,247,0.25)] md:-translate-y-2"
                  : "bg-[#0f0e1a]/80 border border-white/10 hover:border-white/20"
              }`}
            >
              {badge && (
                <div className="absolute -top-3.5 right-6">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-md ${
                      isPopular
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                        : "bg-white/10 text-purple-300 border border-purple-400/30"
                    }`}
                  >
                    {isPopular && <Zap className="w-3.5 h-3.5 fill-current" />}
                    <span>{badge}</span>
                  </span>
                </div>
              )}

              <div>
                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-xs sm:text-sm text-slate-400 mb-6 leading-relaxed min-h-[36px]">
                  {plan.description || "Comprehensive placement preparation pack."}
                </p>

                {/* Authoritative Price Display */}
                <div className="mb-6 pb-6 border-b border-white/10">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                      {priceFormatted}
                    </span>
                    <span className="text-xs sm:text-sm font-semibold text-slate-400">
                      /{periodFormatted}
                    </span>
                  </div>
                  {monthlyEquivalent && (
                    <div className="mt-1.5 text-xs font-bold text-purple-400">
                      {monthlyEquivalent}
                    </div>
                  )}
                </div>

                {/* Features List */}
                <div className="space-y-3 mb-8">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">
                    What&apos;s Included:
                  </span>
                  {features.map((feature) => (
                    <div key={feature} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}

                  {notIncluded.length > 0 && (
                    <div className="pt-2 space-y-2.5 border-t border-white/5">
                      {notIncluded.map((item) => (
                        <div key={item} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-500">
                          <X className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Card Action Button */}
              <div className="pt-4">
                <Link
                  href={ctaHref}
                  className={`w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-sm transition-all shadow-md active:scale-95 cursor-pointer ${
                    isPopular
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-purple-900/50 hover:shadow-lg"
                      : "bg-white/10 hover:bg-white/15 text-white border border-white/10 hover:border-white/25"
                  }`}
                >
                  <span>{ctaText}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <p className="text-[11px] text-center text-slate-400 mt-2.5">
                  {isFree
                    ? "No credit card required"
                    : "Backed by 7-day 100% money-back guarantee"}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Feature Comparison Matrix ── */}
      <div className="mb-20">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Detailed Plan Comparison
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Authoritative comparison of entitlements across student passes.
          </p>
        </div>

        <div className="overflow-x-auto rounded-3xl border border-white/10 bg-[#0d0c18]">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="py-4 px-6 font-bold text-slate-300">Platform Feature</th>
                <th className="py-4 px-6 font-bold text-slate-300">Student Free (₹0)</th>
                <th className="py-4 px-6 font-bold text-purple-300">1-Month Pass ({monthlyPriceStr})</th>
                <th className="py-4 px-6 font-bold text-pink-300">3-Months Pass ({threeMonthsPriceStr})</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-200">
              {COMPARISON_ROWS.map((row) => (
                <tr key={row.feature} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-6 font-medium text-white">{row.feature}</td>
                  <td className="py-4 px-6 text-slate-400">{row.free}</td>
                  <td className="py-4 px-6 font-semibold text-purple-200">{row.oneMonth}</td>
                  <td className="py-4 px-6 font-bold text-pink-200">{row.threeMonths}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
