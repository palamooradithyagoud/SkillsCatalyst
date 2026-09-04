"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone,
  Mail,
  MessageCircle,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Send,
  HelpCircle,
  ChevronDown,
  FileText,
  Scale,
  RefreshCw,
  Sparkles,
  LifeBuoy,
  UserCheck,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/lib/auth";

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

  // Copy states
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Active Policy Tab
  const [activeTab, setActiveTab] = useState<PolicyTab>("privacy");

  // Expanded FAQ items
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const handleCopy = (text: string, type: "phone" | "email") => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      if (type === "phone") {
        setCopiedPhone(true);
        setTimeout(() => setCopiedPhone(false), 2000);
      } else {
        setCopiedEmail(true);
        setTimeout(() => setCopiedEmail(false), 2000);
      }
    }
  };

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
      {/* ── Top Hero Banner (Rich Forest Green & Mint) ── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-[#173a2d] via-[#234B3B] to-[#1a382c] p-7 sm:p-10 text-white shadow-xl"
      >
        {/* Subtle decorative glow ring */}
        <div className="absolute top-[-50%] right-[-10%] w-[350px] h-[350px] rounded-full bg-emerald-400/10 blur-[80px] pointer-events-none" />
        <div className="absolute bottom-[-40%] left-[20%] w-[250px] h-[250px] rounded-full bg-teal-400/10 blur-[60px] pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-3.5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs font-bold uppercase tracking-wider">
            <LifeBuoy className="w-3.5 h-3.5 text-emerald-300" />
            <span>Customer Support & Grievance Desk</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
            How can we help you today?
          </h1>
          <p className="text-emerald-100/90 text-xs sm:text-sm leading-relaxed max-w-2xl font-medium">
            Direct access to our founding team, transparent educational policies, and 24-hour query turnaround. We are here to support every step of your career preparation.
          </p>
        </div>

        <div className="absolute right-6 bottom-6 sm:right-12 sm:bottom-8 opacity-15 pointer-events-none hidden sm:block">
          <ShieldCheck className="w-40 h-40 text-emerald-300" />
        </div>
      </motion.div>

      {/* ── 3 Direct Founder Contact Cards (Crisp White & Emerald/Teal Accents) ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Founder Identity & Grievance Officer */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-3xl p-6 bg-white border border-slate-200/90 shadow-[0_4px_20px_rgba(35,75,59,0.04)] flex flex-col justify-between hover:border-emerald-300/80 transition-all"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3.5">
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-[#234B3B] to-[#10b981] flex items-center justify-center text-white font-black text-xl shadow-md">
                PA
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-base text-slate-900 tracking-tight">
                    Palamoor Adithya Goud
                  </h3>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100 animate-pulse" title="Founder Active" />
                </div>
                <p className="text-xs font-bold text-[#234B3B]">
                  Founder & Chief Grievance Officer
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Every message, support ticket, and curriculum request is reviewed directly by our founding team. We guarantee personal accountability and student-first resolution.
            </p>

            <div className="space-y-2 pt-3 border-t border-slate-100 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-[#234B3B] shrink-0" />
                <span>Mon – Sat: 9:00 AM – 8:00 PM IST</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#234B3B] shrink-0" />
                <span>Response SLA: Within 24 hours</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Card 2: Phone & WhatsApp Direct Actions */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-3xl p-6 bg-white border border-slate-200/90 shadow-[0_4px_20px_rgba(35,75,59,0.04)] flex flex-col justify-between hover:border-emerald-300/80 transition-all"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-[#234B3B] flex items-center justify-center">
                <Phone className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 tracking-wider">
                Direct Line
              </span>
            </div>

            <div>
              <h3 className="font-extrabold text-xs text-slate-500 uppercase tracking-wider">
                Telephone & WhatsApp
              </h3>
              <p className="text-2xl font-black text-slate-900 mt-1 tracking-tight">
                +91 7330602101
              </p>
              <p className="text-xs text-slate-500 mt-1.5 font-medium">
                Instant calling or chat assistance with our founder for urgent queries.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 mt-6 pt-4 border-t border-slate-100">
            <a
              href="tel:+917330602101"
              className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#234B3B] hover:bg-[#1b3b2e] text-white font-extrabold text-xs shadow-xs active:scale-95 transition-all"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call Now</span>
            </a>
            <a
              href="https://wa.me/917330602101?text=Hi%20Adithya,%20I%20am%20using%20SkillsCatalyst%20and%20have%20a%20question"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold text-xs shadow-xs active:scale-95 transition-all"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>
          </div>
        </motion.div>

        {/* Card 3: Support Email */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-3xl p-6 bg-white border border-slate-200/90 shadow-[0_4px_20px_rgba(35,75,59,0.04)] flex flex-col justify-between hover:border-emerald-300/80 transition-all"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-2xl bg-teal-50 text-[#234B3B] flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <button
                type="button"
                onClick={() => handleCopy("palamooradithyagoud@gmail.com", "email")}
                className="text-[11px] font-bold text-slate-500 hover:text-[#234B3B] transition-colors flex items-center gap-1 cursor-pointer bg-slate-100 hover:bg-emerald-50 px-2.5 py-1 rounded-lg"
              >
                {copiedEmail ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedEmail ? "Copied" : "Copy"}</span>
              </button>
            </div>

            <div>
              <h3 className="font-extrabold text-xs text-slate-500 uppercase tracking-wider">
                Founder Support Email
              </h3>
              <p className="text-sm font-extrabold text-slate-900 mt-1 break-all">
                palamooradithyagoud@gmail.com
              </p>
              <p className="text-xs text-slate-500 mt-1.5 font-medium">
                For detailed requests, enterprise partnerships, or formal grievance filings.
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <a
              href="mailto:palamooradithyagoud@gmail.com?subject=SkillsCatalyst%20Customer%20Support%20Inquiry"
              className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-xs active:scale-95 transition-all"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Send Email</span>
            </a>
          </div>
        </motion.div>
      </div>

      {/* ── Main 2-Column: Ticket Form + Frequently Asked Questions ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Support Ticket Submission Form (Clean White Surface) */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-7 bg-white border border-slate-200/90 rounded-[28px] p-6 sm:p-8 shadow-[0_4px_24px_rgba(35,75,59,0.04)] space-y-6"
        >
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-black text-[#234B3B] uppercase tracking-wider mb-1">
              <Send className="w-3.5 h-3.5" />
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
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-[#f8faf9] text-slate-900 text-xs sm:text-sm focus:bg-white focus:border-[#234B3B] focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all font-medium"
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
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-[#f8faf9] text-slate-900 text-xs sm:text-sm focus:bg-white focus:border-[#234B3B] focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all font-medium"
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
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-[#f8faf9] text-slate-900 text-xs sm:text-sm focus:bg-white focus:border-[#234B3B] focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Query Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-[#f8faf9] text-slate-900 text-xs sm:text-sm focus:bg-white focus:border-[#234B3B] focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all font-medium cursor-pointer"
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
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-[#f8faf9] text-slate-900 text-xs sm:text-sm focus:bg-white focus:border-[#234B3B] focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all font-medium"
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
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-[#f8faf9] text-slate-900 text-xs sm:text-sm focus:bg-white focus:border-[#234B3B] focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all font-medium resize-y"
              />
            </div>

            {formError && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{formError}</span>
              </div>
            )}

            {ticketResult && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 font-extrabold text-sm text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Support Ticket Submitted!</span>
                </div>
                <p>Reference Ticket ID: <strong className="font-mono text-emerald-950">{ticketResult.ticketId}</strong></p>
                <p className="font-medium text-emerald-800">{ticketResult.message}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 px-6 rounded-xl bg-[#234B3B] hover:bg-[#1b3b2e] text-white font-extrabold text-sm shadow-md active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
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

        {/* Right: Frequently Asked Questions (Accordion) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-[#234B3B]" />
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
                      ? "bg-white border-[#234B3B] shadow-sm"
                      : "bg-white border-slate-200/90 hover:border-slate-300"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setExpandedFaq(isOpen ? null : idx)}
                    className="w-full p-4 text-left flex items-center justify-between gap-3 text-xs sm:text-sm font-bold text-slate-900 cursor-pointer hover:text-[#234B3B] transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 shrink-0 transition-transform ${isOpen ? "rotate-180 text-[#234B3B]" : "text-slate-400"}`}
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
                        <div className="px-4 pb-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100 font-medium">
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

      {/* ── Applicable Platform Policies Hub (Warm Clean White Surface) ── */}
      <div className="bg-white border border-slate-200/90 rounded-[28px] p-6 sm:p-10 shadow-[0_4px_24px_rgba(35,75,59,0.04)] space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-black text-[#234B3B] uppercase tracking-wider mb-1">
            <Scale className="w-3.5 h-3.5" />
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
                    ? "bg-[#234B3B] text-white shadow-xs"
                    : "bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-[#234B3B]"
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
                At SkillsCatalyst, accessible from <Link href="/" className="text-[#234B3B] font-bold underline">skillscatalyst.in</Link>, your privacy is our foundational commitment. This Privacy Policy document describes the types of information collected and recorded by SkillsCatalyst and how we use it.
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
                To claim your refund, send a quick message to our founder via WhatsApp (<a href="https://wa.me/917330602101" className="text-[#234B3B] font-bold">+91 7330602101</a>) or email <a href="mailto:palamooradithyagoud@gmail.com" className="text-[#234B3B] font-bold">palamooradithyagoud@gmail.com</a> with your registered account email and payment reference ID.
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
              <div className="bg-emerald-50/70 p-5 rounded-2xl border border-emerald-200/80 space-y-2 text-emerald-950 font-medium">
                <div><strong>Grievance Officer:</strong> Palamoor Adithya Goud</div>
                <div><strong>Designation:</strong> Founder & Chief Grievance Officer</div>
                <div><strong>Platform:</strong> SkillsCatalyst (<a href="https://www.skillscatalyst.in" className="text-[#234B3B] underline font-bold">www.skillscatalyst.in</a>)</div>
                <div><strong>Direct Phone:</strong> <a href="tel:+917330602101" className="text-[#234B3B] font-bold">+91 7330602101</a></div>
                <div><strong>Direct Email:</strong> <a href="mailto:palamooradithyagoud@gmail.com" className="text-[#234B3B] font-bold">palamooradithyagoud@gmail.com</a></div>
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
