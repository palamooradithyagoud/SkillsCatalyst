"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  XCircle,
  Award,
  Calendar,
  User,
  Building,
  ArrowRight,
  ExternalLink,
  GraduationCap,
} from "lucide-react";
import { fetchPublicCertificateVerification } from "@/lib/api/certificates";
import type { PublicCertificateVerification } from "@/types/certificate";

export default function VerifyPortalPage() {
  const router = useRouter();
  const [certId, setCertId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PublicCertificateVerification | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = certId.trim();
    if (!cleanId) return;

    setLoading(true);
    setHasSearched(true);
    try {
      const data = await fetchPublicCertificateVerification(cleanId);
      setResult(data);
    } catch {
      setResult({
        is_valid: false,
        message: "Unable to verify credential. Please verify the ID or contact support.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDirectView = () => {
    const cleanId = certId.trim();
    if (cleanId) {
      router.push(`/verify/certificate/${encodeURIComponent(cleanId)}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#070710] text-white selection:bg-purple-600 selection:text-white">
      {/* Header */}
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
            <Link href="/pricing" className="hover:text-white transition-colors">
              Pricing
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

          <Link
            href="/login"
            className="px-4 py-2 rounded-full text-xs sm:text-sm font-bold text-white bg-purple-600 hover:bg-purple-500 shadow-md transition-all hover:scale-105"
          >
            Student Login
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        {/* Title */}
        <div className="text-center space-y-4 mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Official Credential Registry</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Verify a Certificate
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
            Verify the authenticity, student recipient, and course track of any official
            SkillsCatalyst credential in real time.
          </p>
        </div>

        {/* Verification Form Card */}
        <div className="bg-[#0f0e1a] rounded-3xl border border-white/10 p-6 sm:p-10 shadow-xl mb-12">
          <form onSubmit={handleVerify} className="space-y-4">
            <label htmlFor="certIdInput" className="block text-xs font-bold uppercase tracking-wider text-slate-400">
              Certificate / Credential ID
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  id="certIdInput"
                  type="text"
                  value={certId}
                  onChange={(e) => setCertId(e.target.value)}
                  placeholder="e.g. SC-CERT-2026-XXXX or UUID"
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-mono"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-md shadow-purple-900/30 transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? (
                  <span>Verifying...</span>
                ) : (
                  <>
                    <span>Verify Credential</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Verification Results Display */}
          {hasSearched && (
            <div className="mt-8 pt-8 border-t border-white/10">
              {result && result.is_valid ? (
                <div className="rounded-2xl bg-emerald-950/40 border border-emerald-500/40 p-6 sm:p-8 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-emerald-300">
                        Official Certificate Verified
                      </h3>
                      <p className="text-xs text-emerald-400/80">
                        This credential is valid and registered in the SkillsCatalyst database.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                    {result.student_name && (
                      <div className="p-3.5 rounded-xl bg-white/5">
                        <span className="text-slate-400 text-xs block mb-1">Recipient Name</span>
                        <span className="font-bold text-white flex items-center gap-2">
                          <User className="w-4 h-4 text-purple-400" />
                          {result.student_name}
                        </span>
                      </div>
                    )}

                    {result.course_title && (
                      <div className="p-3.5 rounded-xl bg-white/5">
                        <span className="text-slate-400 text-xs block mb-1">Course Track</span>
                        <span className="font-bold text-white flex items-center gap-2">
                          <GraduationCap className="w-4 h-4 text-pink-400" />
                          {result.course_title}
                        </span>
                      </div>
                    )}

                    {result.issued_at && (
                      <div className="p-3.5 rounded-xl bg-white/5">
                        <span className="text-slate-400 text-xs block mb-1">Issued Date</span>
                        <span className="font-bold text-white flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-blue-400" />
                          {new Date(result.issued_at).toLocaleDateString("en-IN", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    )}

                    <div className="p-3.5 rounded-xl bg-white/5">
                      <span className="text-slate-400 text-xs block mb-1">Issuing Authority</span>
                      <span className="font-bold text-white flex items-center gap-2">
                        <Building className="w-4 h-4 text-emerald-400" />
                        SkillsCatalyst Registry
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={handleDirectView}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm transition-all"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>View Official Full Certificate</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl bg-amber-950/40 border border-amber-500/30 p-6 flex items-start gap-4">
                  <XCircle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-amber-300">
                      Credential Not Found or Invalid
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {result?.message ||
                        "We could not locate an active certificate matching this ID. Please confirm the exact verification code printed on the certificate."}
                    </p>
                    <p className="text-xs text-slate-400 pt-2">
                      If you believe this is an error, please reach out with the certificate image to{" "}
                      <a href="mailto:support@skillscatalyst.in" className="text-purple-400 underline font-semibold">
                        support@skillscatalyst.in
                      </a>
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Recruiter & Institutional Trust Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-white/10 text-slate-300 text-xs sm:text-sm">
          <div className="p-5 rounded-2xl bg-[#0f0e1a] border border-white/5 space-y-2">
            <h4 className="font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Cryptographic Integrity
            </h4>
            <p className="text-slate-400 leading-relaxed text-xs">
              Every certificate contains an immutable hash ID verifiable on public record to prevent alteration.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#0f0e1a] border border-white/5 space-y-2">
            <h4 className="font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-400" />
              Rigorous Assessments
            </h4>
            <p className="text-slate-400 leading-relaxed text-xs">
              Certificates are awarded only upon 100% curriculum completion and passing technical sandbox tests.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#0f0e1a] border border-white/5 space-y-2">
            <h4 className="font-bold text-white flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-pink-400" />
              Recruiter Trusted
            </h4>
            <p className="text-slate-400 leading-relaxed text-xs">
              Direct verification links allow hiring managers to confirm skills on resumes and LinkedIn profiles.
            </p>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center pt-16 text-xs text-slate-500">
          <p>
            SkillsCatalyst Certificate Verification Registry &bull; Built by students at Vardhaman College of Engineering, Hyderabad.
          </p>
        </div>
      </main>
    </div>
  );
}
