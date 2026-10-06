"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Send,
  HelpCircle,
  ChevronDown,
  FileText,
  Scale,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Skiper31 } from "@/components/ui/text-scroll-animation";

type PolicyTab = "privacy" | "terms" | "refund" | "grievance" | "fairuse";

const FAQS = [
  {
    q: "How fast does customer support respond to queries?",
    a: "Our founder Palamoor Adithya Goud personally reviews incoming requests. Support queries are acknowledged within 2 to 4 hours, and full resolutions are delivered within 24 hours. For urgent billing or account lockout issues, you can call or WhatsApp directly at +91 7330602101.",
  },
  {
    q: "What is the refund policy for SkillsCatalyst Pro passes?",
    a: "We offer a 100% 7-day money-back guarantee on all 1-Month and 3-Month Pro Passes. If you are not satisfied with the roadmaps or interview prep features, simply message us on WhatsApp or email palamooradithyagoud@gmail.com within 7 days of purchase for a prompt refund.",
  },
  {
    q: "How is my personal and academic data protected?",
    a: "SkillsCatalyst is strictly compliant with the Digital Personal Data Protection (DPDP) Act 2023 and GDPR guidelines. Your resume uploads, coding profiles, and personal details are encrypted using AES-256 and Supabase Row Level Security. We never sell student data to third-party ad brokers.",
  },
  {
    q: "Can I connect my LeetCode and GitHub profiles securely?",
    a: "Yes! Connecting your handles allows SkillsCatalyst to track your contest ratings, daily streak, and problem-solving badges. We only read public profile information and never request your passwords.",
  },
  {
    q: "Who is the designated Grievance Officer for statutory compliance?",
    a: "As mandated under Rule 3(2) of the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, our Founder Palamoor Adithya Goud serves as the official Grievance Officer (Phone: +91 7330602101, Email: palamooradithyagoud@gmail.com).",
  },
];

export default function SupportPage() {
  const { session } = useAuth();

  // Contact Form State
  const [name, setName] = useState(session?.name || "");
  const [email, setEmail] = useState(session?.email || "");
  const [phone, setPhone] = useState("");
  const [category, setCategory] = useState("Technical Issue");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [ticketResult, setTicketResult] = useState<{
    ticketId: string;
    message: string;
  } | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Active Policy Tab
  const [activeTab, setActiveTab] = useState<PolicyTab>("privacy");

  // Expanded FAQ items
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      setFormError("Please fill out all required fields.");
      return;
    }

    if (message.trim().length < 10) {
      setFormError("Please describe your issue in at least 10 characters.");
      return;
    }

    setSubmitting(true);

    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiBase}/api/support/ticket`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          category,
          subject: subject.trim(),
          message: message.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.detail || data.message || "Failed to submit ticket.");
      }

      setTicketResult({
        ticketId: data.ticket_id,
        message: data.message,
      });

      // Clear form
      setSubject("");
      setMessage("");
    } catch (err: any) {
      setFormError(err.message || "An error occurred while sending your query. Please reach out directly on WhatsApp or Email.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen text-slate-900 max-w-6xl mx-auto space-y-8 pb-20 select-none">
      
      {/* ── Interactive 3D Kinetic Text & Support Channel Scroll Animation ── */}
      <Skiper31
        text="DIRECT FOUNDER SUPPORT"
        subtitle="direct student care & multi-channel assistance"
      />

      {/* ── Main 2-Column: Ticket Form + Frequently Asked Questions ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Support Ticket Submission Form (Clean White Surface with Purple/Pink Accents) */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-7 bg-white border border-slate-200/90 rounded-[28px] p-6 sm:p-8 shadow-[0_4px_24px_rgba(107,33,168,0.04)] space-y-6"
        >
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-black text-purple-700 uppercase tracking-wider mb-1">
              <Send className="w-3.5 h-3.5 text-pink-600" />
              <span>Submit A Support Ticket</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Send us a message
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
              Have a suggestion, billing concern, or technical bug? Fill out the details below and we will get back to you promptly.
            </p>
          </div>

          <form onSubmit={handleSubmitTicket} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-[#FAF9FD] text-slate-900 text-xs sm:text-sm focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-[#FAF9FD] text-slate-900 text-xs sm:text-sm focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 9876543210"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-[#FAF9FD] text-slate-900 text-xs sm:text-sm focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Query Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-[#FAF9FD] text-slate-900 text-xs sm:text-sm focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all font-medium cursor-pointer"
                >
                  <option value="Technical Issue">Technical / Bug Report</option>
                  <option value="Billing & Subscriptions">Billing & Pro Pass Inquiries</option>
                  <option value="Roadmaps & Content">Roadmaps & Question Banks</option>
                  <option value="ATS Resume Scanner">ATS Resume Scanner</option>
                  <option value="Grievance Redressal">Statutory Grievance Redressal</option>
                  <option value="Feature Request">Feature Request & Feedback</option>
                  <option value="Other">Other Inquiry</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Subject *
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief summary of your question or issue"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-[#FAF9FD] text-slate-900 text-xs sm:text-sm focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Detailed Message *
              </label>
              <textarea
                required
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Please describe in detail what happened or how we can assist you..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-[#FAF9FD] text-slate-900 text-xs sm:text-sm focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all font-medium resize-y"
              />
            </div>

            {formError && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{formError}</span>
              </div>
            )}

            {ticketResult && (
              <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 text-purple-950 text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 font-extrabold text-sm text-purple-900">
                  <CheckCircle2 className="w-4 h-4 text-pink-600" />
                  <span>Support Ticket Submitted!</span>
                </div>
                <p>Reference Ticket ID: <strong className="font-mono text-purple-950">{ticketResult.ticketId}</strong></p>
                <p className="font-medium text-purple-800">{ticketResult.message}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#6B21A8] via-[#7E22CE] to-[#EC4899] hover:opacity-95 text-white font-extrabold text-sm shadow-md shadow-purple-500/20 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <span>Submitting Ticket...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Message to Support Desk</span>
                </>
              )}
            </button>
          </form>
        </motion.div>

        {/* Right: Frequently Asked Questions (Accordion with Purple/Pink Accents) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-purple-700" />
            <h3 className="font-black text-xs uppercase tracking-wider text-slate-700">
              Frequently Asked Questions
            </h3>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = expandedFaq === idx;
              return (
                <div
                  key={idx}
                  className={`rounded-2xl border transition-all overflow-hidden ${
                    isOpen
                      ? "bg-white border-purple-300 shadow-sm shadow-purple-500/5 ring-1 ring-purple-100"
                      : "bg-white border-slate-200/90 hover:border-purple-200"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setExpandedFaq(isOpen ? null : idx)}
                    className="w-full p-4 text-left flex items-center justify-between gap-3 text-xs sm:text-sm font-bold text-slate-900 cursor-pointer hover:text-purple-700 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 shrink-0 transition-transform ${isOpen ? "rotate-180 text-pink-600" : "text-slate-400"}`}
                    />
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="px-4 pb-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-purple-50 font-medium">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Applicable Platform Policies Hub (Crisp White Surface with Purple/Pink Accents) ── */}
      <div className="bg-white border border-slate-200/90 rounded-[28px] p-6 sm:p-10 shadow-[0_4px_24px_rgba(107,33,168,0.04)] space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-black text-purple-700 uppercase tracking-wider mb-1">
            <Scale className="w-3.5 h-3.5 text-pink-600" />
            <span>Legal Compliance & Learner Protections</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Applicable Platform Policies
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            SkillsCatalyst operates with 100% student-first transparency. Review our legally compliant policies governing privacy, service terms, refunds, and grievance redressal.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
          {[
            { id: "privacy", label: "Privacy Policy", icon: ShieldCheck },
            { id: "terms", label: "Terms of Service", icon: FileText },
            { id: "refund", label: "Refund & Cancellation", icon: RefreshCw },
            { id: "grievance", label: "Grievance Redressal", icon: Scale },
            { id: "fairuse", label: "AI & Fair Usage", icon: Sparkles },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as PolicyTab)}
                className={`inline-flex items-center gap-2 py-2 px-3.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  isActive
                    ? "bg-gradient-to-r from-[#7E22CE] to-[#EC4899] text-white shadow-xs shadow-purple-500/20"
                    : "bg-slate-100 text-slate-700 hover:bg-purple-50 hover:text-purple-700"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Display */}
        <div className="text-xs sm:text-sm leading-relaxed text-slate-700 space-y-4 pt-1 font-medium">
          {activeTab === "privacy" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
              <h3 className="text-lg font-black text-slate-900">
                SkillsCatalyst Privacy Policy (DPDP Act 2023 & GDPR Compliant)
              </h3>
              <p>
                At SkillsCatalyst, accessible from <Link href="/" className="text-purple-700 font-bold underline hover:text-pink-600">skillscatalyst.in</Link>, your privacy is our foundational commitment. This Privacy Policy document describes the types of information collected and recorded by SkillsCatalyst and how we use it.
              </p>
              <h4 className="font-extrabold text-slate-900 pt-2">1. Data We Collect</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Account Information:</strong> Name, email address, academic credentials, target software engineering roles, and college year.</li>
                <li><strong>Coding Profile Handles:</strong> Public profile usernames (LeetCode, GitHub, HackerRank, GeeksforGeeks, CodeChef) used exclusively for dynamic streak and rating sync.</li>
                <li><strong>Resume & Placement Documents:</strong> Text extracted from uploaded resumes strictly for real-time ATS compatibility scoring and bullet rewrites.</li>
              </ul>
              <h4 className="font-extrabold text-slate-900 pt-2">2. Zero Data-Selling Commitment</h4>
              <p>
                We do not sell, rent, or trade your personal or educational data to any third-party marketing companies, advertisers, or lead brokers under any circumstances.
              </p>
              <h4 className="font-extrabold text-slate-900 pt-2">3. Storage & Encryption Security</h4>
              <p>
                All data is stored in Supabase managed PostgreSQL databases protected by Row Level Security (RLS) and encrypted at rest with AES-256 and in transit via TLS 1.3.
              </p>
            </motion.div>
          )}

          {activeTab === "terms" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
              <h3 className="text-lg font-black text-slate-900">
                Terms of Service & Platform Code of Conduct
              </h3>
              <p>
                By accessing SkillsCatalyst, you agree to comply with and be bound by the following terms of service.
              </p>
              <h4 className="font-extrabold text-slate-900 pt-2">1. Permitted Educational Use</h4>
              <p>
                SkillsCatalyst grants you a personal, non-exclusive, non-transferable license to access our curated roadmaps, 660+ company interview question banks, and learning videos for individual self-study and career development.
              </p>
              <h4 className="font-extrabold text-slate-900 pt-2">2. Account Responsibility & Single User Access</h4>
              <p>
                Your account is single-user. You are responsible for safeguarding your login credentials. Sharing credentials or using automated bots to bulk-download curriculum content is strictly prohibited.
              </p>
              <h4 className="font-extrabold text-slate-900 pt-2">3. Intellectual Property Rights</h4>
              <p>
                The tree root flowcharts, personalized readiness indexes (PRI), and proprietary software architecture remain the intellectual property of SkillsCatalyst.
              </p>
            </motion.div>
          )}

          {activeTab === "refund" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
              <h3 className="text-lg font-black text-slate-900">
                Refund & Cancellation Policy
              </h3>
              <p>
                We strive to provide highest-quality learning roadmaps and interview preparation tools. If you are not satisfied with your purchase, our refund guidelines are simple and student-friendly.
              </p>
              <h4 className="font-extrabold text-slate-900 pt-2">1. 7-Day Money Back Guarantee</h4>
              <p>
                All 1-Month Sprint Passes (₹99) and 3-Month Pro Passes (₹250) are eligible for a 100% refund within 7 calendar days from the date and time of purchase if you have not fully completed an accredited roadmap track.
              </p>
              <h4 className="font-extrabold text-slate-900 pt-2">2. Refund Request Procedure</h4>
              <p>
                To claim your refund, send a quick message to our founder via WhatsApp (<a href="https://wa.me/917330602101" className="text-purple-700 font-bold hover:text-pink-600">+91 7330602101</a>) or email <a href="mailto:palamooradithyagoud@gmail.com" className="text-purple-700 font-bold hover:text-pink-600">palamooradithyagoud@gmail.com</a> with your registered account email and payment reference ID.
              </p>
              <h4 className="font-extrabold text-slate-900 pt-2">3. Processing Timeline</h4>
              <p>
                Refunds are processed within 24–48 hours of request verification and will reflect in your original payment method (Bank Account / UPI / Card) within 5 to 7 business days as per standard banking protocol.
              </p>
            </motion.div>
          )}

          {activeTab === "grievance" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
              <h3 className="text-lg font-black text-slate-900">
                Customer Support & Grievance Redressal Policy
              </h3>
              <p>
                In compliance with the Information Technology Act 2000 and Rule 3(2) of the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, the details of the designated Grievance Officer are set forth below:
              </p>
              <div className="bg-purple-50/70 p-5 rounded-2xl border border-purple-200/80 space-y-2 text-purple-950 font-medium">
                <div><strong>Grievance Officer:</strong> Palamoor Adithya Goud</div>
                <div><strong>Designation:</strong> Founder & Chief Grievance Officer</div>
                <div><strong>Platform:</strong> SkillsCatalyst (<a href="https://www.skillscatalyst.in" className="text-purple-700 underline font-bold hover:text-pink-600">www.skillscatalyst.in</a>)</div>
                <div><strong>Direct Phone:</strong> <a href="tel:+917330602101" className="text-purple-700 font-bold hover:text-pink-600">+91 7330602101</a></div>
                <div><strong>Direct Email:</strong> <a href="mailto:palamooradithyagoud@gmail.com" className="text-purple-700 font-bold hover:text-pink-600">palamooradithyagoud@gmail.com</a></div>
                <div><strong>Office Location:</strong> Hyderabad, Telangana, India</div>
              </div>
              <h4 className="font-extrabold text-slate-900 pt-2">Grievance Redressal Timeline</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Acknowledgement of grievance email/ticket: Within 24 hours.</li>
                <li>Investigation & resolution of reported concerns: Within 15 business days.</li>
              </ul>
            </motion.div>
          )}

          {activeTab === "fairuse" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
              <h3 className="text-lg font-black text-slate-900">
                Fair Usage & AI Mentor Policy
              </h3>
              <p>
                SkillsCatalyst provides state-of-the-art AI roadmap generators, AI mentor debugging assistance, and ATS resume scoring powered by high-speed inference engines.
              </p>
              <h4 className="font-extrabold text-slate-900 pt-2">1. Responsible AI Interactions</h4>
              <p>
                AI mentor sessions are designed for computer science concepts, code syntax explanation, bug diagnosing, and interview preparation. Abusive language, prompt injections, or unauthorized automated querying will result in temporary rate limits.
              </p>
              <h4 className="font-extrabold text-slate-900 pt-2">2. ATS Resume Scanner Limits</h4>
              <p>
                Users can scan and score authentic resumes in PDF, DOCX, and TXT formats. Scripts submitting automated fake documents or spamming the scoring API will be flagged for review.
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
