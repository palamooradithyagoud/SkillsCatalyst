"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  XCircle,
  CheckCircle2,
  GraduationCap,
  Calendar,
  Award,
  ArrowLeft,
  Building,
  User,
} from "lucide-react";

import { fetchPublicCertificateVerification } from "@/lib/api/certificates";
import type { PublicCertificateVerification } from "@/types/certificate";
import CertificateDisplay from "@/components/student/CertificateDisplay";

export default function PublicCertificateVerificationPage() {
  const params = useParams();
  const verificationId = params?.verificationId as string;

  const [verification, setVerification] = useState<PublicCertificateVerification | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadVerification() {
      if (!verificationId) return;
      setLoading(true);
      try {
        const data = await fetchPublicCertificateVerification(verificationId);
        if (isMounted) setVerification(data);
      } catch {
        if (isMounted) {
          setVerification({
            is_valid: false,
            message: "This certificate could not be verified.",
          });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadVerification();
    return () => {
      isMounted = false;
    };
  }, [verificationId]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col items-center px-4 py-8 sm:py-12">
      {/* Top Navbar / Platform Logo */}
      <header className="w-full max-w-5xl flex items-center justify-between pb-6 mb-6 border-b border-slate-200/90">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-200/80 flex items-center justify-center">
            <GraduationCap className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" />
          </div>
          <span className="font-bold text-slate-900 text-base tracking-tight font-serif">
            SkillsCatalyst <span className="text-xs text-purple-700 font-sans uppercase font-bold tracking-wider ml-1">Verification</span>
          </span>
        </Link>

        <Link
          href="/courses"
          className="text-xs text-slate-600 hover:text-slate-900 inline-flex items-center gap-1 font-medium transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Explore Courses</span>
        </Link>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-5xl flex flex-col items-center">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-16 space-y-4">
            <div className="w-10 h-10 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-600 text-sm font-medium animate-pulse">
              Verifying certificate authenticity with SkillsCatalyst ledger...
            </p>
          </div>
        ) : verification?.is_valid ? (
          <div className="w-full space-y-8 flex flex-col items-center">
            {/* Status Header Badge */}
            <div className="w-full max-w-3xl p-5 sm:p-6 rounded-2xl border border-emerald-200 bg-emerald-50/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Authentic & Valid Credential
                  </div>
                  <h1 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
                    Verified Course Completion Certificate
                  </h1>
                </div>
              </div>

              <div className="text-right sm:border-l sm:border-emerald-200 sm:pl-4">
                <span className="text-[11px] font-medium text-slate-500 block">Certificate Number</span>
                <span className="text-xs sm:text-sm font-mono font-bold text-emerald-700">
                  {verification.certificate_number}
                </span>
              </div>
            </div>

            {/* Quick Metadata Summary Grid */}
            <div className="w-full max-w-3xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl border border-slate-200/90 bg-white shadow-xs flex items-center gap-3">
                <User className="w-4 h-4 text-purple-600 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Student</span>
                  <span className="text-xs font-bold text-slate-900 truncate block">
                    {verification.student_name}
                  </span>
                </div>
              </div>

              {verification.college_name ? (
                <div className="p-3.5 rounded-xl border border-slate-200/90 bg-white shadow-xs flex items-center gap-3">
                  <Building className="w-4 h-4 text-blue-600 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Institution</span>
                    <span className="text-xs font-bold text-slate-900 truncate block">
                      {verification.college_name}
                    </span>
                  </div>
                </div>
              ) : null}

              <div className="p-3.5 rounded-xl border border-slate-200/90 bg-white shadow-xs flex items-center gap-3">
                <Award className="w-4 h-4 text-amber-600 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Score Achieved</span>
                  <span className="text-xs font-black text-amber-700 block">
                    {verification.score}%
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200/90 bg-white shadow-xs flex items-center gap-3">
                <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Issue Date</span>
                  <span className="text-xs font-bold text-slate-900 truncate block">
                    {verification.issued_at}
                  </span>
                </div>
              </div>
            </div>

            {/* Official Full Certificate Viewport */}
            <div className="w-full flex justify-center mt-2">
              <CertificateDisplay
                studentName={verification.student_name || ""}
                collegeName={verification.college_name || ""}
                courseTitle={verification.course_title || ""}
                score={verification.score || 0}
                issuedDate={verification.issued_at || ""}
                certificateNumber={verification.certificate_number || ""}
                verificationUrl={verification.verification_url || ""}
                designTheme={verification.design_theme || "professional_blue"}
                backgroundMediaUrl={verification.background_media_url || ""}
                isPreview={false}
              />
            </div>
          </div>
        ) : (
          /* Invalid Certificate View */
          <div className="w-full max-w-xl p-8 rounded-2xl border border-rose-200 bg-rose-50/80 text-center space-y-4 my-12 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 border border-rose-200 flex items-center justify-center mx-auto text-rose-600">
              <XCircle className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-rose-700 block mb-1">
                Verification Failed
              </span>
              <h1 className="text-xl font-black text-slate-900">
                This certificate could not be verified
              </h1>
              <p className="text-xs text-slate-600 mt-2 max-w-md mx-auto">
                No active SkillsCatalyst certificate was found matching the identifier{" "}
                <code className="px-1.5 py-0.5 rounded bg-rose-100 border border-rose-200 text-rose-800 font-mono text-[11px]">
                  {verificationId}
                </code>
                . Please ensure the link has not been truncated or altered.
              </p>
            </div>

            <div className="pt-4">
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition-all border border-slate-200/90 shadow-xs"
              >
                Return to SkillsCatalyst
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
