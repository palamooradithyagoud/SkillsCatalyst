import React from "react";
import Link from "next/link";
import { ArrowLeft, Cookie, CheckCircle2, ShieldCheck, Mail, Phone } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy | SkillsCatalyst",
  description: "Official Cookie Policy explaining essential session and preference cookies used on SkillsCatalyst.",
};

export default function CookiePolicyPage() {
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
            <Cookie className="w-3.5 h-3.5" />
            <span>Transparent Data &amp; Session Management</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-black tracking-tight">
            Cookie Policy
          </h1>
          <p className="mt-3 text-sm sm:text-base text-neutral-600 font-medium">
            Last Updated: October 12, 2026 &bull; Technical breakdown of cookies used on SkillsCatalyst
          </p>
        </div>

        {/* Content Body */}
        <article className="prose prose-neutral max-w-none space-y-10 text-sm sm:text-base leading-relaxed text-neutral-800">
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-black text-black">1. What Are Cookies?</h2>
            <p>
              Cookies are small text files stored on your browser or device when you visit websites.
              They allow web applications to remember your login session, editor settings, and active learning progress
              across page reloads without requiring you to re-authenticate on every action.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-black text-black">2. Cookies We Use on SkillsCatalyst</h2>
            <p>
              SkillsCatalyst strictly avoids invasive tracking cookies and third-party advertising cookies.
              We only deploy cookies essential to your student experience:
            </p>

            <div className="space-y-4">
              {/* Category 1 */}
              <div className="p-5 rounded-2xl bg-white border border-neutral-200/90 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-black text-base">A. Essential Authentication &amp; Security Cookies</h3>
                  <span className="text-[11px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    Strictly Required
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-neutral-700">
                  These cookies store encrypted session identifiers and CSRF prevention tokens. They allow you to stay
                  securely logged into your student dashboard, view your roadmaps, and submit solutions without interruption.
                </p>
                <div className="text-xs text-neutral-500 font-mono pt-1">
                  Examples: sb-auth-token, sc_session_id, csrf_guard
                </div>
              </div>

              {/* Category 2 */}
              <div className="p-5 rounded-2xl bg-white border border-neutral-200/90 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-black text-base">B. Code Editor &amp; UI Preference Cookies</h3>
                  <span className="text-[11px] font-bold uppercase px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                    Functional
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-neutral-700">
                  These remember your preferred coding language (Python, C++, Java, JavaScript), Monaco code editor theme,
                  and font size so your workspace is instantly ready each time you practice.
                </p>
                <div className="text-xs text-neutral-500 font-mono pt-1">
                  Examples: sc_editor_lang, sc_theme_mode, sc_panel_layout
                </div>
              </div>

              {/* Category 3 */}
              <div className="p-5 rounded-2xl bg-white border border-neutral-200/90 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-black text-base">C. Anonymous System Performance Cookies</h3>
                  <span className="text-[11px] font-bold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                    Performance
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-neutral-700">
                  Aggregated telemetry to measure compiler execution speed and page load responsiveness.
                  This telemetry contains zero personally identifiable information (PII) and is never shared with external ad platforms.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-black text-black">3. Zero Third-Party Advertising Cookies</h2>
            <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 text-neutral-900 text-sm font-medium">
              SkillsCatalyst does not host third-party advertisement networks, tracking pixels, or cross-site tracking cookies.
              We are an education and career platform, not an advertising broker.
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-black text-black">4. Managing &amp; Disabling Cookies</h2>
            <p>
              You can control or delete cookies directly through your browser settings.
              Please note that disabling strictly necessary authentication cookies will prevent you from signing in
              or saving coding progress.
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-neutral-700 text-sm">
              <li><strong>Google Chrome:</strong> Settings &rarr; Privacy &amp; Security &rarr; Cookies and other site data</li>
              <li><strong>Mozilla Firefox:</strong> Settings &rarr; Privacy &amp; Security &rarr; Cookies and Site Data</li>
              <li><strong>Apple Safari:</strong> Preferences &rarr; Privacy &rarr; Manage Website Data</li>
              <li><strong>Microsoft Edge:</strong> Settings &rarr; Cookies and site permissions &rarr; Manage cookies</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-black text-black">5. Questions &amp; Contact</h2>
            <p>For any inquiries regarding our cookie practices, reach out to our team:</p>
            <div className="p-5 rounded-2xl bg-white border border-neutral-300 space-y-2 text-sm font-semibold">
              <div className="font-bold text-black text-base">SkillsCatalyst Privacy &amp; Data Team</div>
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
            <Link href="/terms-conditions" className="hover:text-black transition-colors">
              Terms &amp; Conditions
            </Link>
          </div>
          <div>&copy; 2026 SkillsCatalyst. All Rights Reserved.</div>
        </div>
      </main>
    </div>
  );
}
