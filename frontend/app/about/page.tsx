import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import LandingNavbar from "@/components/landing/LandingNavbar";
import SkillsCatalystFooterSection from "@/components/landing/SkillsCatalystFooterSection";
import "@/app/skills-landing.css";

export const metadata: Metadata = {
  title: "About Us — Accelerating Technical Careers | SkillsCatalyst",
  description:
    "Founded by Palamoor Adithya Goud at Vardhaman College of Engineering, Hyderabad. SkillsCatalyst bridges the gap between university syllabus and modern software hiring bars.",
  openGraph: {
    title: "About SkillsCatalyst — Origin, Mission & Engineering Principles",
    description:
      "Bridging the placement readiness gap for engineering students through structured roadmaps, browser compiler sandboxes, and AI technical mock rounds.",
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#07080C] text-slate-100 flex flex-col justify-between selection:bg-[#d5ff38] selection:text-black">
      {/* ── Fixed Brand Navigation ── */}
      <LandingNavbar solid={true} />

      {/* ── Main Content Container ── */}
      <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 pt-32 sm:pt-40 pb-20 sm:pb-28 flex-1">
        {/* Header Eyebrow & Title */}
        <div className="space-y-3 mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#141b05] border border-[#d5ff38]/30 text-xs font-semibold text-[#d5ff38]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#d5ff38]" />
            <span>ORIGIN &amp; MISSION</span>
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white">
            Built by engineers, for students who refuse to settle for passive tutorials.
          </h1>
          <p className="text-base sm:text-xl text-slate-300 max-w-3xl leading-relaxed pt-2">
            SkillsCatalyst was started at Vardhaman College of Engineering in Hyderabad to fix a glaring industry problem: students spending thousands of hours watching random video playlists without ever building the technical muscle needed to crack top product interviews.
          </p>
        </div>

        {/* ── Three Core Realities / Principles ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-12">
          <div className="p-6 rounded-2xl bg-[#0F1117] border border-white/[0.08] flex flex-col justify-between">
            <div>
              <span className="text-xs font-mono font-bold text-[#d5ff38] uppercase tracking-wider block mb-2">01 / The Disconnect</span>
              <h3 className="text-lg font-bold text-white mb-2">Classroom Theory vs. Real Hiring Bars</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Standard university curricula move slowly. Engineering teams at Amazon, Flipkart, and modern startups expect clean Git workflows, distributed systems understanding, and fast algorithmic problem-solving under real pressure.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#0F1117] border border-white/[0.08] flex flex-col justify-between">
            <div>
              <span className="text-xs font-mono font-bold text-[#d5ff38] uppercase tracking-wider block mb-2">02 / The Mechanism</span>
              <h3 className="text-lg font-bold text-white mb-2">Active Execution Over Video Watching</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Watching an instructor solve a binary search tree does not make you a programmer. SkillsCatalyst forces hands-on code execution in an in-browser sandbox with strict test cases and immediate compiler feedback.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#0F1117] border border-white/[0.08] flex flex-col justify-between">
            <div>
              <span className="text-xs font-mono font-bold text-[#d5ff38] uppercase tracking-wider block mb-2">03 / The Standard</span>
              <h3 className="text-lg font-bold text-white mb-2">Verifiable Readiness Credentials</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Every certificate issued on SkillsCatalyst carries an immutable cryptographic verification hash accessible via our public <Link href="/verify" className="text-[#d5ff38] underline">/verify portal</Link> so hiring managers know the score was earned through actual code execution.
              </p>
            </div>
          </div>
        </div>

        {/* ── Founder & Campus Backing ── */}
        <div className="p-8 sm:p-10 rounded-3xl bg-[#12141D] border border-white/[0.08] my-14 space-y-6">
          <h2 className="text-2xl sm:text-3xl font-black text-white">Who is behind SkillsCatalyst?</h2>
          <div className="space-y-4 text-slate-300 text-sm sm:text-base leading-relaxed">
            <p>
              SkillsCatalyst was created by <strong className="text-white">Palamoor Adithya Goud</strong> during his engineering coursework at <strong className="text-white">Vardhaman College of Engineering, Hyderabad</strong>. What began as a peer study group solving 500+ LeetCode problems turned into a complete platform serving students across Telangana, Andhra Pradesh, and colleges across India.
            </p>
            <p>
              We operate transparently: no hidden fees, no deceptive job guarantees, and no marketing fluff. Every pass includes a 100% 7-day refund guarantee because we only want students to pay when they experience concrete career acceleration.
            </p>
          </div>
          <div className="pt-4 flex flex-wrap gap-4 items-center border-t border-white/[0.06]">
            <Link
              href="/contact"
              className="px-5 py-2.5 rounded-full bg-[#d5ff38] text-[#0C0D12] font-black text-xs uppercase tracking-wider hover:bg-[#c4ec32] transition-all"
            >
              Get In Touch With The Team
            </Link>
            <a
              href="https://github.com/palamooradithyagoud/SkillsCatalyst"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-white font-semibold text-xs transition-all flex items-center gap-2"
            >
              <span>Explore Public GitHub</span>
              <span aria-hidden="true">&rarr;</span>
            </a>
          </div>
        </div>

        {/* ── Key Platform Specifications ── */}
        <div className="space-y-6 my-12">
          <h2 className="text-xl sm:text-2xl font-black text-white">Platform Numbers &amp; Benchmarks</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-[#0F1117] border border-white/[0.06]">
              <div className="text-2xl sm:text-3xl font-black text-[#d5ff38]">660+</div>
              <div className="text-xs text-slate-400 mt-1">Company interview questions</div>
            </div>
            <div className="p-4 rounded-xl bg-[#0F1117] border border-white/[0.06]">
              <div className="text-2xl sm:text-3xl font-black text-[#d5ff38]">24</div>
              <div className="text-xs text-slate-400 mt-1">Role-specific roadmap tracks</div>
            </div>
            <div className="p-4 rounded-xl bg-[#0F1117] border border-white/[0.06]">
              <div className="text-2xl sm:text-3xl font-black text-[#d5ff38]">4</div>
              <div className="text-xs text-slate-400 mt-1">Compiled languages (C++, Py, Java, JS)</div>
            </div>
            <div className="p-4 rounded-xl bg-[#0F1117] border border-white/[0.06]">
              <div className="text-2xl sm:text-3xl font-black text-[#d5ff38]">₹99</div>
              <div className="text-xs text-slate-400 mt-1">Monthly student starter pass</div>
            </div>
          </div>
        </div>
      </main>

      {/* ── Brand Footer ── */}
      <SkillsCatalystFooterSection />
    </div>
  );
}

