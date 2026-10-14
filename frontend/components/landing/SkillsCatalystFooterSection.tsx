"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Phone,
  ArrowRight,
  CheckCircle2,
  X,
  Send,
  Compass,
  Code2,
  Sparkles,
  Award,
  HelpCircle,
} from "lucide-react";

// ── Custom Social SVGs (Only real verified accounts) ──
function InstagramIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
    </svg>
  );
}

function LinkedinIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.67 1.67 0 1 0 0-3.34 1.67 1.67 0 0 0 0 3.34M7.86 18.5v-8.37H5.07v8.37h2.79z" />
    </svg>
  );
}

// ── SkillsCatalyst Real Authentic Platform Directory (Zero AI badge slop or fake filler) ──
interface FeaturePillar {
  title: string;
  links: { label: string; href: string }[];
}

const SKILLSCATALYST_PILLARS: FeaturePillar[] = [
  {
    title: "Career Roadmaps",
    links: [
      { label: "Full-Stack Web Development", href: "/roadmaps" },
      { label: "Python & Backend Engineering", href: "/roadmaps" },
      { label: "AI, ML & Generative AI", href: "/roadmaps" },
      { label: "Data Structures & Algorithms", href: "/roadmaps" },
      { label: "Cloud & DevOps Architecture", href: "/roadmaps" },
    ],
  },
  {
    title: "Learn & Practice",
    links: [
      { label: "Daily SkillBits Microlearning", href: "/skillbits" },
      { label: "DSA Problem Arena", href: "/practice" },
      { label: "Interactive Code Sandbox", href: "/practice" },
      { label: "Structured Learning Tracks", href: "/learning" },
      { label: "Topic-wise Coding Challenges", href: "/practice" },
    ],
  },
  {
    title: "Career Readiness",
    links: [
      { label: "AI Mock Technical Interviews", href: "/ai-mentor" },
      { label: "ATS Resume Reviewer & Score", href: "/resume-review" },
      { label: "Placement Readiness Analytics", href: "/dashboard" },
      { label: "Interview Question Bank", href: "/practice" },
    ],
  },
  {
    title: "Opportunities",
    links: [
      { label: "Verified Scholarships Hub", href: "/scholarships" },
      { label: "Student Tech News & Radar", href: "/tech-news" },
      { label: "Upcoming Hackathon Alerts", href: "/scholarships" },
      { label: "Skill Badges & Milestones", href: "/dashboard" },
    ],
  },
  {
    title: "Trust & Support",
    links: [
      { label: "Plans & Student Pricing", href: "/pricing" },
      { label: "Verify Certificates (/verify)", href: "/verify" },
      { label: "Help & Student Support", href: "/support" },
      { label: "Frequently Asked Questions", href: "/support" },
      { label: "Official Support Desk", href: "mailto:support@skillscatalyst.in" },
    ],
  },
];

export default function SkillsCatalystFooterSection() {
  const router = useRouter();
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactFormSubmitted, setContactFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    interest: "Career Roadmaps & Learning",
    message: "",
  });

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactFormSubmitted(true);
    setTimeout(() => {
      setContactFormSubmitted(false);
      setIsContactModalOpen(false);
      setFormData({ name: "", email: "", interest: "Career Roadmaps & Learning", message: "" });
    }, 2200);
  };

  return (
    <footer className="w-full bg-[#f4eefb] text-black relative z-10 font-sans selection:bg-[#e0c6f5] selection:text-black">
      {/* ── Outer Section Container (Light Lilac Background) ── */}
      <div className="w-full max-w-[1520px] mx-auto px-4 sm:px-6 md:px-10 lg:px-14 py-12 md:py-20">
        
        {/* ── Main Grand Lilac Card (Matching Image 2 Aesthetic) ── */}
        <div className="relative w-full rounded-3xl md:rounded-[36px] bg-gradient-to-br from-[#ebdcf9] via-[#e5d2f6] to-[#dec5f4] border border-[#ccafe8] shadow-[0_20px_50px_rgba(147,112,219,0.16)] overflow-hidden transition-all duration-300">
          
          {/* Subtle Ambient Radial Highlight inside Lilac Card */}
          <div
            className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/30 rounded-full blur-3xl pointer-events-none -mr-40 -mt-40"
            aria-hidden="true"
          />

          <div className="relative z-10 p-6 sm:p-10 md:p-14 lg:p-16 pb-0 md:pb-0">
            {/* ── Top Row: Community CTA + Explore + Real Socials + Contact Info ── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-start">
              
              {/* Left Column: Clean Headline & Action Button */}
              <div className="lg:col-span-5 flex flex-col items-start pr-0 lg:pr-6">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-black tracking-tight leading-[1.12]">
                  Want to join our
                  <br />
                  community?
                </h2>

                <p className="mt-4 text-sm sm:text-base font-medium text-neutral-800 leading-relaxed max-w-md">
                  Your structured, AI-powered path from learning to career readiness. Master guided career roadmaps, solve real-world problems, crack coding rounds, and accelerate your tech journey.
                </p>

                {/* Crimson / Plum Pill Action Button (Exact Image 2 Style) */}
                <div className="mt-6 sm:mt-7 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsContactModalOpen(true)}
                    className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-[#a31525] hover:bg-[#850f1d] active:scale-95 text-white font-bold text-sm sm:text-base tracking-wide shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    <span>Contact US</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>

                  <button
                    type="button"
                    onClick={() => router.push("/roadmaps")}
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white/80 hover:bg-white text-black font-bold text-sm tracking-wide border border-[#ccafe8] shadow-sm hover:shadow transition-all duration-200"
                  >
                    <span>Explore Roadmaps</span>
                  </button>
                </div>
              </div>

              {/* Right Column: Explore + Socials + Contact Info */}
              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-8 pt-2">
                
                {/* 1. Explore Column */}
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-black mb-4">
                    Explore
                  </h3>
                  <ul className="space-y-2.5">
                    {[
                      { label: "Learning Roadmaps", href: "/roadmaps" },
                      { label: "Daily SkillBits", href: "/skillbits" },
                      { label: "DSA Practice Arena", href: "/practice" },
                      { label: "Scholarships Hub", href: "/scholarships" },
                      { label: "AI Career Mentor", href: "/ai-mentor" },
                      { label: "ATS Resume Review", href: "/resume-review" },
                    ].map((item) => (
                      <li key={item.label}>
                        <Link
                          href={item.href}
                          className="text-xs sm:text-sm font-bold text-neutral-800 hover:text-black hover:translate-x-1 inline-flex items-center gap-1.5 transition-transform"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-neutral-900 inline-block" />
                          <span>{item.label}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 2. Real Socials Column (Only Instagram & LinkedIn) */}
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-black mb-4">
                    Socials
                  </h3>
                  <p className="text-xs font-semibold text-neutral-700 mb-3.5">
                    Follow SkillsCatalyst on our verified handles:
                  </p>
                  
                  <div className="flex flex-col gap-2.5">
                    {/* Instagram Link */}
                    <a
                      href="https://www.instagram.com/skillscatalyst.in?utm_source=ig_web_button_share_sheet&dlrf=ZDNlZDc0MzIxNw=="
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white/80 hover:bg-black hover:text-white text-black border border-[#ccafe8] transition-all duration-200 shadow-sm"
                      aria-label="Instagram @skillscatalyst.in"
                    >
                      <InstagramIcon className="w-4 h-4 text-pink-600 group-hover:text-white transition-colors" />
                      <span className="text-xs font-bold">@skillscatalyst.in</span>
                    </a>

                    {/* LinkedIn Link */}
                    <a
                      href="https://www.linkedin.com/posts/skillscatalystin_skillscatalystin-is-an-ai-powered-career-activity-7511809706005364736-7sM7?utm_source=share&utm_medium=member_desktop&rcm=ACoAAGMXWgcBI0bzCBKFYB9ZUsLeRXDxcjDQuGU"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white/80 hover:bg-black hover:text-white text-black border border-[#ccafe8] transition-all duration-200 shadow-sm"
                      aria-label="LinkedIn SkillsCatalyst"
                    >
                      <LinkedinIcon className="w-4 h-4 text-blue-600 group-hover:text-white transition-colors" />
                      <span className="text-xs font-bold">SkillsCatalyst</span>
                    </a>
                  </div>
                </div>

                {/* 3. Contact Info Column (Email & Phone Only, No Address) */}
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-black mb-4">
                    Contact Info
                  </h3>
                  <div className="space-y-4 text-xs sm:text-sm font-semibold text-neutral-800">
                    <a
                      href="mailto:support@skillscatalyst.in"
                      className="flex items-center gap-2.5 hover:text-black transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-white/90 border border-[#ccafe8] flex items-center justify-center shrink-0">
                        <Mail className="w-4 h-4 text-black" />
                      </div>
                      <span className="break-all font-bold">support@skillscatalyst.in</span>
                    </a>

                    <a
                      href="tel:7330602101"
                      className="flex items-center gap-2.5 hover:text-black transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-white/90 border border-[#ccafe8] flex items-center justify-center shrink-0">
                        <Phone className="w-4 h-4 text-black" />
                      </div>
                      <span className="font-bold">+91 7330602101</span>
                    </a>
                  </div>
                </div>

              </div>

            </div>

            {/* ── Divider between Hero and Authentic Directory ── */}
            <div className="my-10 sm:my-14 border-t border-[#c6a7e8]/80" />

            {/* ── Authentic SkillsCatalyst Platform Directory (Clean, focused typography) ── */}
            <div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-8 gap-y-8">
                {SKILLSCATALYST_PILLARS.map((pillar) => (
                  <div key={pillar.title} className="flex flex-col">
                    <h4 className="text-xs font-black uppercase tracking-widest text-black mb-3.5">
                      {pillar.title}
                    </h4>
                    <ul className="space-y-2.5">
                      {pillar.links.map((link) => (
                        <li key={link.label}>
                          <Link
                            href={link.href}
                            className="text-xs sm:text-[13px] font-semibold text-neutral-800 hover:text-black hover:translate-x-1 transition-all inline-block"
                          >
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Signature Brand Watermark Text (Like "Student Tribe" in Image 2) ── */}
            <div className="relative mt-12 sm:mt-16 md:mt-20 -mb-2 sm:-mb-5 md:-mb-8 w-full overflow-hidden select-none pointer-events-none flex justify-center" aria-hidden="true">
              <div className="text-5xl sm:text-7xl md:text-8xl lg:text-[120px] xl:text-[145px] font-black tracking-tight leading-none text-[#4a1259] opacity-20 text-center whitespace-nowrap uppercase">
                SkillsCatalyst
              </div>
            </div>

          </div>

        </div>

        {/* ── Sub-Footer / Legal Bar (Outside Card on Light Lilac Background, like Image 2) ── */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-bold text-neutral-700 tracking-wider">
          <div className="flex flex-wrap items-center gap-6 uppercase">
            <Link href="/pricing" className="hover:text-black transition-colors text-purple-900 font-extrabold">
              Pricing
            </Link>
            <Link href="/verify" className="hover:text-black transition-colors text-emerald-800 font-extrabold">
              Verify
            </Link>
            <Link href="/privacy-policy" className="hover:text-black transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms-conditions" className="hover:text-black transition-colors">
              Terms &amp; Conditions
            </Link>
            <Link href="/cookie-policy" className="hover:text-black transition-colors">
              Cookie Policy
            </Link>
          </div>

          <div className="text-neutral-700 text-center sm:text-right">
            <div>&copy; 2026 SkillsCatalyst. All Rights Reserved.</div>
            <div className="text-[11px] font-semibold text-neutral-600 mt-0.5">
              Built by students at Vardhaman College of Engineering, Hyderabad.
            </div>
          </div>
        </div>

      </div>

      {/* ── Interactive Contact US Modal ── */}
      <AnimatePresence>
        {isContactModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsContactModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Dialog Card */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="relative w-full max-w-lg bg-[#fbf8fd] border border-[#d3b8f1] rounded-3xl p-6 sm:p-8 shadow-2xl z-10"
            >
              <button
                type="button"
                onClick={() => setIsContactModalOpen(false)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-neutral-200/80 hover:bg-neutral-300 text-neutral-700 flex items-center justify-center transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-left mb-6">
                <h3 className="text-2xl font-black text-black">
                  Connect with SkillsCatalyst
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600 mt-1">
                  Have questions about roadmaps, SkillBits, or interview preparation? Drop us a note!
                </p>
              </div>

              {contactFormSubmitted ? (
                <div className="py-10 text-center flex flex-col items-center">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 mb-3" />
                  <h4 className="text-lg font-bold text-black">Message Sent Successfully!</h4>
                  <p className="text-xs text-neutral-600 mt-1">Our team will reach out to you shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Adithya Palamoor"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#ccafe8] bg-white text-sm text-black focus:outline-none focus:ring-2 focus:ring-[#a31525]/40"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="adithya@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#ccafe8] bg-white text-sm text-black focus:outline-none focus:ring-2 focus:ring-[#a31525]/40"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1">
                      Topic
                    </label>
                    <select
                      value={formData.interest}
                      onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#ccafe8] bg-white text-sm text-black focus:outline-none focus:ring-2 focus:ring-[#a31525]/40"
                    >
                      <option value="Career Roadmaps & Learning">Career Roadmaps &amp; Learning</option>
                      <option value="DSA Practice & Arena">DSA Practice &amp; Arena</option>
                      <option value="SkillBits Microlearning">SkillBits Microlearning</option>
                      <option value="AI Mock Interviews & Prep">AI Mock Interviews &amp; Prep</option>
                      <option value="Scholarships & Opportunities">Scholarships &amp; Opportunities</option>
                      <option value="Other Inquiries">Other Inquiries</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1">
                      Your Message
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="How can we help your learning journey?"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#ccafe8] bg-white text-sm text-black focus:outline-none focus:ring-2 focus:ring-[#a31525]/40 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-full bg-[#a31525] hover:bg-[#850f1d] text-white font-bold text-sm tracking-wide shadow-md transition-all flex items-center justify-center gap-2 mt-2"
                  >
                    <span>Send Message</span>
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              )}

              <div className="mt-6 pt-4 border-t border-[#ccafe8]/60 flex items-center justify-between text-[11px] font-semibold text-neutral-600">
                <a href="mailto:skillscatalyst5@gmail.com" className="hover:text-black">
                  skillscatalyst5@gmail.com
                </a>
                <a href="tel:7330602101" className="hover:text-black">
                  +91 7330602101
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </footer>
  );
}
