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
import PricingCards from "@/components/pricing/PricingCards";

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

        {/* ── Authoritative Backend-Driven Pricing Cards & Comparison ── */}
        <PricingCards />

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
