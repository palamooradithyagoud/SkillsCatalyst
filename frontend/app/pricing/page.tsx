import React from "react";
import type { Metadata } from "next";
import LandingNavbar from "@/components/landing/LandingNavbar";
import SkillsCatalystPricingSection from "@/components/pricing/SkillsCatalystPricingSection";
import SkillsCatalystFooterSection from "@/components/landing/SkillsCatalystFooterSection";
import "@/app/skills-landing.css";

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
    <div className="min-h-screen relative overflow-hidden bg-white text-slate-900 selection:bg-[#8837ef] selection:text-white flex flex-col justify-between">
      {/* ── Exact Radial Gradient Atmosphere spanning from top: 0 behind the floating navbar ── */}
      <div
        className="absolute inset-x-0 top-0 h-[1000px] pointer-events-none z-0"
        style={{
          background:
            "radial-gradient(125% 125% at 50% 90%, #fff 40%, #2529f8 100%)",
        }}
      />

      {/* ── Exact Landing Page Navbar (Solid White floating bar right from the top) ── */}
      <LandingNavbar solid={true} />

      {/* ── Main Pro Benefits & Interactive Pricing Section ── */}
      <main className="w-full pt-20 sm:pt-28 flex-1 relative z-10">
        <SkillsCatalystPricingSection />
      </main>

      {/* ── Exact Landing Page Footer ── */}
      <SkillsCatalystFooterSection />
    </div>
  );
}
