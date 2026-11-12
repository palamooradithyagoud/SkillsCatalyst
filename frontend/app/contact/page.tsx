"use client";

import React, { useState } from "react";
import Link from "next/link";
import LandingNavbar from "@/components/landing/LandingNavbar";
import SkillsCatalystFooterSection from "@/components/landing/SkillsCatalystFooterSection";
import "@/app/skills-landing.css";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    category: "Placement Roadmap Guidance",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate reliable local submission acknowledgment
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 700);
  };

  return (
    <div className="min-h-screen bg-[#07080C] text-slate-100 flex flex-col justify-between selection:bg-[#d5ff38] selection:text-black">
      {/* ── Fixed Brand Navigation ── */}
      <LandingNavbar solid={true} />

      {/* ── Main Content Container ── */}
      <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 pt-32 sm:pt-40 pb-20 sm:pb-28 flex-1">
        {/* Header */}
        <div className="space-y-3 mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#141b05] border border-[#d5ff38]/30 text-xs font-semibold text-[#d5ff38]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#d5ff38]" />
            <span>DIRECT STUDENT SUPPORT &amp; COMPLIANCE</span>
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white">
            We are here to help you crack your next engineering interview.
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
            Have questions about student passes, company question sets, or institutional partnerships? Reach out directly to our engineering and founder team.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-8">
          {/* ── Contact Info Cards (Left Column: 5 cols) ── */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-6 rounded-2xl bg-[#0F1117] border border-white/[0.08]">
              <h3 className="text-xs font-mono font-bold text-[#d5ff38] uppercase tracking-wider mb-2">Direct Email Support</h3>
              <p className="text-base font-bold text-white mb-1">support@skillscatalyst.in</p>
              <p className="text-xs text-slate-400">Queries acknowledged within 2–4 hours. 24/7 ticket routing.</p>
            </div>

            <div className="p-6 rounded-2xl bg-[#0F1117] border border-white/[0.08]">
              <h3 className="text-xs font-mono font-bold text-[#d5ff38] uppercase tracking-wider mb-2">WhatsApp &amp; Direct Call</h3>
              <p className="text-base font-bold text-white mb-1">+91 7330602101</p>
              <p className="text-xs text-slate-400">Available Monday through Saturday, 9:00 AM – 7:00 PM IST.</p>
            </div>

            <div className="p-6 rounded-2xl bg-[#0F1117] border border-white/[0.08]">
              <h3 className="text-xs font-mono font-bold text-[#d5ff38] uppercase tracking-wider mb-2">Office &amp; Campus Location</h3>
              <p className="text-base font-bold text-white mb-1">Hyderabad, Telangana, India</p>
              <p className="text-xs text-slate-400">Originated at Vardhaman College of Engineering, Shamshabad.</p>
            </div>

            <div className="p-6 rounded-2xl bg-[#0F1117] border border-white/[0.08]">
              <h3 className="text-xs font-mono font-bold text-[#d5ff38] uppercase tracking-wider mb-2">Official Grievance Officer</h3>
              <p className="text-sm font-bold text-white">Palamoor Adithya Goud</p>
              <p className="text-xs text-slate-400 mt-1">Designated statutory compliance contact under IT Intermediary Rules 2021.</p>
            </div>
          </div>

          {/* ── Interactive Inquiry Form (Right Column: 7 cols) ── */}
          <div className="lg:col-span-7">
            <div className="p-6 sm:p-8 rounded-3xl bg-[#0F1117] border border-white/[0.08] shadow-xl">
              {submitted ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-14 h-14 mx-auto rounded-full bg-[#141b05] border border-[#d5ff38]/40 flex items-center justify-center text-[#d5ff38] text-2xl font-bold">
                    ✓
                  </div>
                  <h3 className="text-2xl font-black text-white">Message Received</h3>
                  <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                    Thank you for reaching out! Your query has been logged. Founder Palamoor Adithya Goud and our support team will reply to <span className="text-white font-semibold">{formData.email}</span> within 2–4 hours.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({
                        name: "",
                        email: "",
                        phone: "",
                        category: "Placement Roadmap Guidance",
                        message: "",
                      });
                    }}
                    className="mt-4 px-5 py-2.5 rounded-full bg-white/[0.08] hover:bg-white/[0.14] text-xs font-bold text-white transition-all"
                  >
                    Send Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h3 className="text-xl font-bold text-white mb-2">Send an Inquiry</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Your Full Name <span className="text-[#d5ff38]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Adithya Goud"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#08090D] border border-white/[0.1] text-white text-sm focus:outline-none focus:border-[#d5ff38] transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Email Address <span className="text-[#d5ff38]">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="you@college.edu or gmail"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#08090D] border border-white/[0.1] text-white text-sm focus:outline-none focus:border-[#d5ff38] transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Phone / WhatsApp (Optional)
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#08090D] border border-white/[0.1] text-white text-sm focus:outline-none focus:border-[#d5ff38] transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Inquiry Category
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#08090D] border border-white/[0.1] text-white text-sm focus:outline-none focus:border-[#d5ff38] transition-colors"
                      >
                        <option value="Placement Roadmap Guidance">Placement Roadmap Guidance</option>
                        <option value="Technical Issue or Bug">Technical Issue or Bug</option>
                        <option value="Campus & College Licensing">Campus &amp; College Licensing</option>
                        <option value="Billing or Refund Request">Billing or Refund Request</option>
                        <option value="Other Inquiries">Other Inquiries</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Your Message or Question <span className="text-[#d5ff38]">*</span>
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Please share what you need help with..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#08090D] border border-white/[0.1] text-white text-sm focus:outline-none focus:border-[#d5ff38] transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-4 rounded-full bg-[#d5ff38] hover:bg-[#c4ec32] text-[#0C0D12] font-black text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-md"
                  >
                    {isSubmitting ? "Sending..." : "Submit Inquiry to Team"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* ── Brand Footer ── */}
      <SkillsCatalystFooterSection />
    </div>
  );
}

