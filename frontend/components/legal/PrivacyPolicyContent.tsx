"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Shield, Lock, FileText, Mail, Phone, CheckCircle2, Eye, Database, Key } from "lucide-react";
import ScrollReveal from "@/components/ui/scroll-reveal";
import "@/app/skills-landing.css";

export default function PrivacyPolicyContent() {
  return (
    <div className="min-h-screen bg-[#faf8fc] text-[#121217] selection:bg-[#ebdcf9] selection:text-black">
      {/* Top Header Bar */}
      <header className="border-b border-neutral-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-neutral-700 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to SkillsCatalyst</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-neutral-500">Official Legal Policy</span>
            <Link
              href="/terms-conditions"
              className="text-xs font-bold text-neutral-900 hover:underline"
            >
              Terms &amp; Conditions
            </Link>
          </div>
        </div>
      </header>

      {/* Main Document Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {/* Document Header Reveal */}
        <ScrollReveal
          id="reveal-header"
          triggerHook={0.95}
          durationPercent={85}
          className="border-b border-neutral-200 pb-8 mb-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-purple-100 text-purple-900 text-xs font-bold uppercase tracking-wider mb-4">
            <Shield className="w-3.5 h-3.5" />
            <span>DPDP Act 2023 &amp; GDPR Compliant</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-black tracking-tight">
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm sm:text-base text-neutral-600 font-medium">
            Last Updated: October 12, 2026 &bull; Effective Immediately for all SkillsCatalyst Learners
          </p>
        </ScrollReveal>

        {/* Content Body with ScrollReveal on each Section */}
        <article className="prose prose-neutral max-w-none space-y-8 text-sm sm:text-base leading-relaxed text-neutral-800">
          {/* Section 1 */}
          <ScrollReveal
            id="reveal-section-1"
            className="p-6 sm:p-8 rounded-2xl bg-white border border-neutral-200/90 shadow-xs space-y-3"
          >
            <div className="flex items-center gap-2 text-purple-900 font-bold text-xs uppercase tracking-wider">
              <FileText className="w-4 h-4" />
              <span>Section 1</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-black m-0">1. Introduction &amp; Commitment</h2>
            <p className="text-neutral-700 m-0">
              SkillsCatalyst (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;platform&rdquo;), accessible from{" "}
              <Link href="/" className="font-bold text-purple-900 underline">
                skillscatalyst.in
              </Link>
              , is dedicated to upholding the highest standards of data privacy and personal data protection.
              This Privacy Policy explains how we collect, process, store, and safeguard your personal information
              when you use our career roadmaps, interactive compilers, SkillBits micro-learning, ATS resume review,
              and AI mock interview services.
            </p>
            <p className="text-neutral-700 m-0">
              We operate in full statutory compliance with the <strong>Digital Personal Data Protection (DPDP) Act, 2023</strong> (India),
              the <strong>Information Technology Act, 2000</strong>, and international principles under the <strong>General Data Protection Regulation (GDPR)</strong>.
            </p>
          </ScrollReveal>

          {/* Section 2 */}
          <ScrollReveal
            id="reveal-section-2"
            className="p-6 sm:p-8 rounded-2xl bg-white border border-neutral-200/90 shadow-xs space-y-4"
          >
            <div className="flex items-center gap-2 text-purple-900 font-bold text-xs uppercase tracking-wider">
              <Database className="w-4 h-4" />
              <span>Section 2</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-black m-0">2. Information We Collect</h2>
            <p className="text-neutral-700 m-0">We collect only the minimum necessary data to provide our educational and career preparation tools:</p>

            <div className="grid sm:grid-cols-2 gap-3 pt-2">
              <div className="border-l-3 border-purple-700 pl-4 py-2 bg-neutral-50/70 rounded-r-xl">
                <h3 className="font-bold text-black text-sm sm:text-base m-0">A. Account &amp; Profile Information</h3>
                <p className="text-neutral-600 text-xs sm:text-sm mt-1 m-0">
                  Your full name, email address, password hash (salted and hashed with bcrypt), target tech stack,
                  college/graduation year, and user preference settings.
                </p>
              </div>

              <div className="border-l-3 border-purple-700 pl-4 py-2 bg-neutral-50/70 rounded-r-xl">
                <h3 className="font-bold text-black text-sm sm:text-base m-0">B. Public Coding Profiles</h3>
                <p className="text-neutral-600 text-xs sm:text-sm mt-1 m-0">
                  When you voluntarily connect usernames (such as LeetCode or GitHub), we only fetch public streak statistics
                  and problem counts to power your placement readiness dashboard. We never request or store your external account passwords.
                </p>
              </div>

              <div className="border-l-3 border-purple-700 pl-4 py-2 bg-neutral-50/70 rounded-r-xl">
                <h3 className="font-bold text-black text-sm sm:text-base m-0">C. Resume Text for ATS Scoring</h3>
                <p className="text-neutral-600 text-xs sm:text-sm mt-1 m-0">
                  When you submit your resume for review, the extracted text is processed solely to calculate keyword compatibility,
                  quantifiable metrics, and bullet-point suggestions. Resumes are processed in private memory and are never shared publicly.
                </p>
              </div>

              <div className="border-l-3 border-purple-700 pl-4 py-2 bg-neutral-50/70 rounded-r-xl">
                <h3 className="font-bold text-black text-sm sm:text-base m-0">D. Platform Learning Progress</h3>
                <p className="text-neutral-600 text-xs sm:text-sm mt-1 m-0">
                  Completed roadmap modules, daily SkillBits streaks, compiler run outcomes, and assessment scores.
                </p>
              </div>
            </div>
          </ScrollReveal>

          {/* Section 3 - Core Guarantee Styled like ScrollMagic demo Box (box2 blue) */}
          <ScrollReveal
            id="reveal1"
            className="p-6 sm:p-8 rounded-2xl bg-blue-50/90 border-2 border-blue-400 text-neutral-900 shadow-sm space-y-3"
          >
            <div className="flex items-center gap-2 text-blue-700 font-bold text-xs uppercase tracking-wider">
              <Lock className="w-4 h-4" />
              <span>Core Privacy Guarantee</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-black m-0">3. Strict Zero Data-Selling Guarantee</h2>
            <div className="p-4 sm:p-5 rounded-xl bg-white/95 border border-blue-200 text-neutral-900 font-medium text-sm sm:text-base">
              <p className="font-bold text-black mb-1">Our Core Privacy Pledge:</p>
              SkillsCatalyst has never sold, rented, leased, or monetized student personal data to third-party advertisers,
              lead brokers, or marketing networks, and will never do so in the future. Your data exists solely to help you build skills and land jobs.
            </div>
          </ScrollReveal>

          {/* Section 4 */}
          <ScrollReveal
            id="reveal-section-4"
            className="p-6 sm:p-8 rounded-2xl bg-white border border-neutral-200/90 shadow-xs space-y-3"
          >
            <div className="flex items-center gap-2 text-purple-900 font-bold text-xs uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4" />
              <span>Section 4</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-black m-0">4. Purpose of Data Processing</h2>
            <p className="text-neutral-700 m-0">We process your data exclusively for:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-neutral-700 m-0">
              <li>Delivering personalized career roadmaps and tracking module completion.</li>
              <li>Executing your code submissions securely inside sandboxed runtimes.</li>
              <li>Generating real-time AI interview questions and actionable feedback.</li>
              <li>Issuing verifiable digital certificates with unique verification identifiers.</li>
              <li>Providing customer support and responding to founder queries.</li>
            </ul>
          </ScrollReveal>

          {/* Section 5 */}
          <ScrollReveal
            id="reveal-section-5"
            className="p-6 sm:p-8 rounded-2xl bg-white border border-neutral-200/90 shadow-xs space-y-3"
          >
            <div className="flex items-center gap-2 text-purple-900 font-bold text-xs uppercase tracking-wider">
              <Key className="w-4 h-4" />
              <span>Section 5</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-black m-0">5. Security, Encryption &amp; Storage</h2>
            <p className="text-neutral-700 m-0">
              All learner data is stored in ISO 27001 and SOC 2 Type II certified data centers.
              Data in transit is encrypted using <strong>TLS 1.3</strong> with strict forward secrecy,
              and data at rest is encrypted using <strong>AES-256</strong>.
              Database access is governed by strict Row Level Security (RLS) policies ensuring users can only read their own records.
            </p>
          </ScrollReveal>

          {/* Section 6 */}
          <ScrollReveal
            id="reveal-section-6"
            className="p-6 sm:p-8 rounded-2xl bg-white border border-neutral-200/90 shadow-xs space-y-3"
          >
            <div className="flex items-center gap-2 text-purple-900 font-bold text-xs uppercase tracking-wider">
              <Eye className="w-4 h-4" />
              <span>Section 6</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-black m-0">6. Your Rights &amp; Data Deletion</h2>
            <p className="text-neutral-700 m-0">Under the DPDP Act 2023 and GDPR, you have the right to:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-neutral-700 m-0">
              <li><strong>Access:</strong> Request an export of all personal data held in your account.</li>
              <li><strong>Correction:</strong> Update or rectify incomplete or inaccurate profile details.</li>
              <li><strong>Erasure (Right to be Forgotten):</strong> Permanently delete your account and all associated submissions by contacting us.</li>
              <li><strong>Withdrawal of Consent:</strong> Disconnect any linked external profiles at any time through your settings.</li>
            </ul>
          </ScrollReveal>

          {/* Section 7 */}
          <ScrollReveal
            id="reveal-section-7"
            className="p-6 sm:p-8 rounded-2xl bg-white border border-neutral-200/90 shadow-xs space-y-3"
          >
            <div className="flex items-center gap-2 text-purple-900 font-bold text-xs uppercase tracking-wider">
              <Phone className="w-4 h-4" />
              <span>Section 7</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-black m-0">7. Statutory Grievance Redressal Officer</h2>
            <p className="text-neutral-700 m-0">
              In accordance with Rule 3(2) of the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules,
              and the Digital Personal Data Protection Act 2023, the designated Grievance Officer is:
            </p>
            <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-2 text-sm font-semibold">
              <div className="font-bold text-black text-base">Palamoor Adithya Goud</div>
              <div className="text-neutral-600 font-medium">Founder &amp; Designated Grievance Officer, SkillsCatalyst</div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-2">
                <a
                  href="mailto:support@skillscatalyst.in"
                  className="inline-flex items-center gap-1.5 text-purple-900 hover:underline font-bold"
                >
                  <Mail className="w-4 h-4" />
                  <span>support@skillscatalyst.in</span>
                </a>
                <span className="hidden sm:inline text-neutral-300">&bull;</span>
                <a
                  href="tel:7330602101"
                  className="inline-flex items-center gap-1.5 text-purple-900 hover:underline font-bold"
                >
                  <Phone className="w-4 h-4" />
                  <span>+91 7330602101</span>
                </a>
              </div>
              <p className="text-xs text-neutral-500 pt-1 font-normal m-0">
                Complaints and grievance notices are acknowledged within 24 hours and resolved within statutory timelines (maximum 15 business days).
              </p>
            </div>
          </ScrollReveal>
        </article>

        {/* Bottom Navigation */}
        <div className="mt-14 pt-8 border-t border-neutral-200 flex flex-wrap items-center justify-between gap-4 text-xs font-bold text-neutral-600">
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-black transition-colors">
              Home
            </Link>
            <Link href="/pricing" className="hover:text-black transition-colors text-purple-900 font-extrabold">
              Pricing
            </Link>
            <Link href="/verify" className="hover:text-black transition-colors text-emerald-800 font-extrabold">
              Verify
            </Link>
            <Link href="/terms-conditions" className="hover:text-black transition-colors">
              Terms &amp; Conditions
            </Link>
            <Link href="/cookie-policy" className="hover:text-black transition-colors">
              Cookie Policy
            </Link>
          </div>
          <div>&copy; 2026 SkillsCatalyst. All Rights Reserved.</div>
        </div>
      </main>
    </div>
  );
}

