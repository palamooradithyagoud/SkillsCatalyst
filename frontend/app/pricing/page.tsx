import React from "react";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import {
  Check,
  X,
  ShieldCheck,
  Zap,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Award,
  Clock,
  RefreshCw,
  Mail,
  GraduationCap,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Pricing & Plans — Transparent Student Pricing | SkillsCatalyst",
  description:
    "Explore SkillsCatalyst passes starting at ₹99/month. 660+ company interview sets, AI mock interviews, and ATS resume reviews with a 100% 7-day money-back guarantee.",
  openGraph: {
    title: "SkillsCatalyst Pricing — Start Free or Upgrade from ₹99",
    description:
      "All-in-one placement preparation platform. Curated roadmaps, company interview questions, and AI mentor with a 7-day refund guarantee.",
  },
};

interface PricingPlan {
  name: string;
  badge?: string;
  price: string;
  period: string;
  monthlyEquivalent?: string;
  description: string;
  features: string[];
  notIncluded?: string[];
  ctaText: string;
  ctaHref: string;
  popular?: boolean;
}

const PLANS: PricingPlan[] = [
  {
    name: "Student Free",
    price: "₹0",
    period: "forever",
    description: "Foundational access to explore career paths and basic problem-solving.",
    features: [
      "Access to public career roadmaps",
      "Interactive code compilers & practice playground",
      "Daily SkillBits micro-learning exercises",
      "1 saved learning roadmap / video solution",
      "Preview of scholarship alerts & student tech news",
      "Basic AI Mentor query previews",
    ],
    notIncluded: [
      "660+ Company-specific interview question sets",
      "Full AI Mock technical & voice interview rounds",
      "In-depth ATS resume scoring & bullet-point feedback",
      "Verified course completion certificate with public URL",
      "Priority resolution support desk",
    ],
    ctaText: "Start Learning Free",
    ctaHref: "/login?plan=free",
    popular: false,
  },
  {
    name: "1-Month Sprint Pass",
    price: "₹99",
    period: "for 1 month",
    badge: "Fast Sprint",
    description: "Intensive 30-day interview sprint for active placement drives and hackathons.",
    features: [
      "Everything in Student Free",
      "660+ Company-specific interview question sets & patterns",
      "Unlimited AI Mock Technical Interviews with real-time scoring",
      "ATS Resume Scanner with line-by-line feedback",
      "Unlimited saved roadmaps, bookmarks & code sandboxes",
      "Full scholarship deadlines, eligibility & alerts",
      "Direct email support via support@skillscatalyst.in",
      "100% 7-Day Money-Back Guarantee included",
    ],
    ctaText: "Get 1-Month Pass (₹99)",
    ctaHref: "/login?plan=1month",
    popular: false,
  },
  {
    name: "3-Months Placement Pass",
    price: "₹250",
    period: "for 3 months",
    monthlyEquivalent: "₹83 / month • Save 16%",
    badge: "Most Popular",
    description: "Complete 90-day placement preparation pack through campus hiring season.",
    features: [
      "Everything in 1-Month Sprint Pass",
      "Uninterrupted 90-day placement prep cycle",
      "Tamper-proof Course Completion Certificate verifiable at /verify",
      "Advanced multi-round technical AI interview simulations",
      "Comprehensive Placement Readiness Score & Analytics",
      "Priority 1-on-1 query resolution SLA",
      "Early access to new roadmaps & curated company test sets",
      "100% 7-Day Money-Back Guarantee included",
    ],
    ctaText: "Get 3-Months Pass (₹250)",
    ctaHref: "/login?plan=3months",
    popular: true,
  },
];

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

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#070710] text-white selection:bg-purple-600 selection:text-white">
      {/* ── Top Header Navigation ── */}
      <header className="sticky top-0 z-40 bg-[#070710]/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <Image
              src="/logo_white.png"
              alt="SkillsCatalyst"
              width={34}
              height={34}
              className="group-hover:scale-105 transition-transform"
            />
            <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white">
              SkillsCatalyst
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-300">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <Link href="/verify" className="hover:text-white transition-colors">
              Verify Certificate
            </Link>
            <Link href="/ai-mentor" className="hover:text-white transition-colors">
              AI Mentor
            </Link>
            <Link href="/practice" className="hover:text-white transition-colors">
              Practice
            </Link>
            <Link href="/support" className="hover:text-white transition-colors">
              Support
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 rounded-full text-xs sm:text-sm font-bold text-white bg-purple-600 hover:bg-purple-500 shadow-md shadow-purple-900/40 transition-all hover:scale-105"
            >
              Student Login
            </Link>
          </div>
        </div>
      </header>

      {/* ── Main Pricing Content ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        {/* Hero Title & Subheading */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Transparent Student Pricing</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Invest in Your Placement.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-300">
              Start 100% Risk-Free.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed">
            One comprehensive platform for curated roadmaps, 660+ company interview question sets,
            and AI mock interviews. No hidden fees, cancel anytime.
          </p>

          {/* 7-Day Guarantee Banner */}
          <div className="pt-2">
            <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-purple-950/60 border border-emerald-500/30 text-xs sm:text-sm text-emerald-200 shadow-lg">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>
                <strong>100% 7-Day Money-Back Guarantee:</strong> Not satisfied within 7 days? Message support for an immediate full refund.
              </span>
            </div>
          </div>
        </div>

        {/* ── 3 Pricing Cards Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch mb-20">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col justify-between rounded-3xl p-7 sm:p-8 transition-all duration-300 ${
                plan.popular
                  ? "bg-gradient-to-b from-[#18112e] via-[#100d20] to-[#0a0815] border-2 border-purple-500/80 shadow-[0_0_50px_rgba(168,85,247,0.25)] md:-translate-y-2"
                  : "bg-[#0f0e1a]/80 border border-white/10 hover:border-white/20"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3.5 right-6">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-md ${
                      plan.popular
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                        : "bg-white/10 text-purple-300 border border-purple-400/30"
                    }`}
                  >
                    {plan.popular && <Zap className="w-3.5 h-3.5 fill-current" />}
                    <span>{plan.badge}</span>
                  </span>
                </div>
              )}

              <div>
                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-xs sm:text-sm text-slate-400 mb-6 leading-relaxed">
                  {plan.description}
                </p>

                {/* Price Display */}
                <div className="mb-6 pb-6 border-b border-white/10">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                      {plan.price}
                    </span>
                    <span className="text-xs sm:text-sm font-semibold text-slate-400">
                      /{plan.period}
                    </span>
                  </div>
                  {plan.monthlyEquivalent && (
                    <div className="mt-1.5 text-xs font-bold text-purple-400">
                      {plan.monthlyEquivalent}
                    </div>
                  )}
                </div>

                {/* Features List */}
                <div className="space-y-3 mb-8">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">
                    What&apos;s Included:
                  </span>
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}

                  {plan.notIncluded && plan.notIncluded.length > 0 && (
                    <div className="pt-2 space-y-2.5 border-t border-white/5">
                      {plan.notIncluded.map((item) => (
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
                  href={plan.ctaHref}
                  className={`w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-sm transition-all shadow-md active:scale-95 ${
                    plan.popular
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-purple-900/50 hover:shadow-lg"
                      : "bg-white/10 hover:bg-white/15 text-white border border-white/10 hover:border-white/25"
                  }`}
                >
                  <span>{plan.ctaText}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <p className="text-[11px] text-center text-slate-400 mt-2.5">
                  {plan.price === "₹0"
                    ? "No credit card required"
                    : "Backed by 7-day 100% money-back guarantee"}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Feature Comparison Matrix ── */}
        <div className="mb-20">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Detailed Plan Comparison
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Everything you need to compare features across student passes.
            </p>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-white/10 bg-[#0d0c18]">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="py-4 px-6 font-bold text-slate-300">Platform Feature</th>
                  <th className="py-4 px-6 font-bold text-slate-300">Student Free</th>
                  <th className="py-4 px-6 font-bold text-purple-300">1-Month Pass (₹99)</th>
                  <th className="py-4 px-6 font-bold text-pink-300">3-Months Pass (₹250)</th>
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

        {/* ── Frequently Asked Questions ── */}
        <div className="max-w-3xl mx-auto mb-20 space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-slate-400 mt-1.5">
              Clear answers before you start.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "How does the 7-day money-back guarantee work?",
                a: "Try SkillsCatalyst for 7 days. If you find the company question sets, career roadmaps, or AI mentor aren't providing huge value, simply send an email to support@skillscatalyst.in with your account email. You will receive a 100% full refund with no questions asked.",
              },
              {
                q: "What payment methods are supported?",
                a: "We support all major Indian payment methods through secure Razorpay/UPI gateway, including Google Pay, PhonePe, Paytm, all UPI apps, RuPay, debit cards, credit cards, and Net Banking.",
              },
              {
                q: "Are the certificates verified publicly?",
                a: "Yes! Every certificate issued on SkillsCatalyst comes with a unique cryptographic verification ID and QR code, publicly verifiable by recruiters at skillscatalyst.in/verify.",
              },
              {
                q: "Who is behind SkillsCatalyst?",
                a: "SkillsCatalyst was built by ambitious engineering students at Vardhaman College of Engineering, Hyderabad, to solve real placement challenges faced by tier-2 and tier-3 engineering students.",
              },
            ].map((faq) => (
              <div
                key={faq.q}
                className="rounded-2xl bg-[#0f0e1a] border border-white/10 p-5 sm:p-6"
              >
                <h4 className="text-sm sm:text-base font-bold text-white mb-2 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>{faq.q}</span>
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pl-6">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── College Attribution & Origin ── */}
        <div className="text-center pt-8 border-t border-white/10">
          <p className="text-xs sm:text-sm text-slate-400 font-medium">
            Built by students at{" "}
            <span className="text-purple-300 font-bold">
              Vardhaman College of Engineering, Hyderabad
            </span>
            . Empowering the next generation of engineers.
          </p>
          <div className="mt-3 flex items-center justify-center gap-6 text-xs text-slate-500">
            <Link href="/terms-conditions" className="hover:text-white underline">
              Terms &amp; Conditions
            </Link>
            <Link href="/privacy-policy" className="hover:text-white underline">
              Privacy Policy
            </Link>
            <Link href="/verify" className="hover:text-white underline">
              Verify Certificate
            </Link>
            <a href="mailto:support@skillscatalyst.in" className="hover:text-white underline">
              support@skillscatalyst.in
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
