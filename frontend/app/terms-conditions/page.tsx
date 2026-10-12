import React from "react";
import Link from "next/link";
import { ArrowLeft, FileText, CheckCircle2, AlertTriangle, Scale, Mail, Phone } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions | SkillsCatalyst",
  description: "Official Terms of Service and Code of Conduct for SkillsCatalyst learners and subscribers.",
};

export default function TermsConditionsPage() {
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
              href="/privacy-policy"
              className="text-xs font-bold text-neutral-900 hover:underline"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </header>

      {/* Main Document Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {/* Document Header */}
        <div className="border-b border-neutral-200 pb-8 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-purple-100 text-purple-900 text-xs font-bold uppercase tracking-wider mb-4">
            <Scale className="w-3.5 h-3.5" />
            <span>Learner Agreement &amp; Platform Guidelines</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-black tracking-tight">
            Terms &amp; Conditions
          </h1>
          <p className="mt-3 text-sm sm:text-base text-neutral-600 font-medium">
            Last Updated: October 12, 2026 &bull; Effective for all registered students and platform visitors
          </p>
        </div>

        {/* Content Body */}
        <article className="prose prose-neutral max-w-none space-y-10 text-sm sm:text-base leading-relaxed text-neutral-800">
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-black text-black">1. Acceptance of Terms</h2>
            <p>
              By registering an account, visiting, or accessing the learning roadmaps, compilers, ATS resume review,
              or assessment engines at{" "}
              <Link href="/" className="font-bold text-purple-900 underline">
                skillscatalyst.in
              </Link>
              , you agree to be bound by these Terms &amp; Conditions and all applicable laws and regulations.
              If you do not agree with any of these terms, you are prohibited from using or accessing this site.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-black text-black">2. Single-Learner License &amp; Permitted Use</h2>
            <p>
              SkillsCatalyst grants you a personal, non-exclusive, non-transferable, revocable license to access our
              structured curriculum, interactive code sandboxes, and interview resources solely for your personal,
              non-commercial educational growth.
            </p>
            <p className="font-bold text-black">You agree NOT to:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-neutral-700">
              <li>Share your account credentials with multiple individuals or third parties.</li>
              <li>Deploy automated bots, spiders, or scrapers to extract curriculum text, roadmaps, or question banks.</li>
              <li>Reverse engineer, decompile, or disassemble our sandboxed code evaluation infrastructure.</li>
              <li>Attempt to bypass access controls, rate limiters, or certificate verification protocols.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-black text-black">3. Code Sandbox &amp; AI Acceptable Use</h2>
            <p>
              Our interactive compiler and AI interview mentor are provided to help learners develop genuine engineering competency.
              You agree not to use the sandbox to execute malicious code, crypto-miners, port scanners, denial-of-service scripts,
              or any processes that breach server security. Violations result in immediate and permanent account termination.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-black text-black">4. Paid Pro Passes &amp; 7-Day Refund Policy</h2>
            <p>
              SkillsCatalyst offers student-accessible pricing tiers (e.g. 1-Month Sprint Pass at ₹99 and 3-Month Pro Pass at ₹250).
            </p>
            <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 text-neutral-900 text-sm space-y-2">
              <p className="font-bold text-black">100% 7-Day Money-Back Guarantee:</p>
              <p>
                If you are not satisfied with your purchase, you can request a full refund within <strong>7 calendar days</strong>{" "}
                from the payment timestamp. To initiate a refund, message our founder on WhatsApp at{" "}
                <a href="tel:7330602101" className="font-bold text-purple-900 underline">+91 7330602101</a> or email{" "}
                <a href="mailto:skillscatalyst5@gmail.com" className="font-bold text-purple-900 underline">skillscatalyst5@gmail.com</a>.
                Refunds are approved within 24 to 48 hours and returned to your original payment method.
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-black text-black">5. Digital Certificates &amp; Integrity</h2>
            <p>
              Digital certificates issued by SkillsCatalyst include cryptographic verification IDs verifiable publicly at{" "}
              <Link href="/verify" className="font-bold text-purple-900 underline">
                /verify
              </Link>
              . We reserve the right to revoke any certificate if plagiarism, unauthorized code sharing, or fraudulent
              activity is detected during milestone assessments.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-black text-black">6. Intellectual Property</h2>
            <p>
              All curriculum designs, roadmap logic, tree graphs, proprietary assessment algorithms, and the SkillsCatalyst logo
              are the exclusive intellectual property of SkillsCatalyst. You may not copy, reproduce, or republish our materials
              without prior express written permission from our founder.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-black text-black">7. Governing Law &amp; Jurisdiction</h2>
            <p>
              These Terms &amp; Conditions are governed by and construed in accordance with the laws of the Republic of India.
              Any disputes arising under these terms shall be subject to the exclusive jurisdiction of the competent courts in
              Hyderabad, Telangana, India.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-black text-black">8. Contact Information</h2>
            <div className="p-5 rounded-2xl bg-white border border-neutral-300 space-y-2 text-sm font-semibold">
              <div className="font-bold text-black text-base">SkillsCatalyst Administration</div>
              <div className="text-neutral-600 font-medium">Founder: Palamoor Adithya Goud</div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-2">
                <a
                  href="mailto:skillscatalyst5@gmail.com"
                  className="inline-flex items-center gap-1.5 text-purple-900 hover:underline font-bold"
                >
                  <Mail className="w-4 h-4" />
                  <span>skillscatalyst5@gmail.com</span>
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
            </div>
          </section>
        </article>

        {/* Bottom Navigation */}
        <div className="mt-14 pt-8 border-t border-neutral-200 flex flex-wrap items-center justify-between gap-4 text-xs font-bold text-neutral-600">
          <div className="flex items-center gap-4">
            <Link href="/privacy-policy" className="hover:text-black transition-colors">
              Privacy Policy
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
