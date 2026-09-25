"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Award,
  GraduationCap,
  Calendar,
  ExternalLink,
  ShieldCheck,
  ArrowRight,
  BookOpen,
} from "lucide-react";

import { useAuth } from "@/lib/auth";
import { fetchStudentCertificates } from "@/lib/api/certificates";
import type { Certificate } from "@/types/certificate";

export default function StudentCertificatesListPage() {
  const { session, isLoading: authLoading } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadCertificates() {
      if (authLoading) return;
      if (!session?.user_id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const certs = await fetchStudentCertificates();
        if (isMounted) setCertificates(certs);
      } catch (err: unknown) {
        if (isMounted) {
          const msg = err instanceof Error ? err.message : "Failed to load certificates.";
          setError(msg);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadCertificates();
    return () => {
      isMounted = false;
    };
  }, [session?.user_id, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8 space-y-4">
        <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-sm font-medium animate-pulse">
          Loading earned credentials...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-5xl space-y-8">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-400">
              <Award className="w-4 h-4" />
              <span>Official Credentials</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
              My Course Certificates
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Verified certifications earned upon completing course curricula and assessments.
            </p>
          </div>

          <Link
            href="/courses"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all self-start sm:self-auto"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Explore More Courses</span>
          </Link>
        </header>

        {error && (
          <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-800/50 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {/* Certificates Grid */}
        {certificates.length === 0 ? (
          <div className="p-12 sm:p-16 rounded-3xl border border-white/10 bg-slate-900/40 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-slate-400">
              <GraduationCap className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-bold text-white">No Certificates Earned Yet</h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
              Complete all lessons and pass the module quizzes in any certificate-eligible course to earn your verified credential.
            </p>
            <div className="pt-2">
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all"
              >
                Start Learning Now
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {certificates.map((cert) => (
              <div
                key={cert.id}
                className="group relative rounded-2xl border border-white/10 bg-slate-900/50 hover:bg-slate-900/80 hover:border-purple-500/40 p-6 transition-all duration-300 flex flex-col justify-between space-y-5"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      Certificate Issued
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {cert.certificate_number}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
                    {cert.course_title}
                  </h3>

                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-purple-400" />
                      {cert.issued_at}
                    </span>
                    <span>•</span>
                    <span className="font-semibold text-emerald-400">
                      Score: {cert.score}%
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-3">
                  <Link
                    href={`/courses/${cert.course_id}/certificate`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    <span>View Official Certificate</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>

                  <Link
                    href={cert.verification_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    <span>Public Verify</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
