"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  GraduationCap,
  Award,
  Lock,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  BookOpen,
} from "lucide-react";

import { useAuth } from "@/lib/auth";
import {
  fetchCertificateEligibility,
  issueCourseCertificate,
  fetchCourseCertificate,
  updateCertificateIdentity,
} from "@/lib/api/certificates";
import type { Certificate, CertificateEligibility } from "@/types/certificate";
import CertificateDisplay from "@/components/student/CertificateDisplay";

export default function StudentCourseCertificatePage() {
  const params = useParams();
  const courseIdOrSlug = params?.courseId as string;
  const { session, isLoading: authLoading } = useAuth();

  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [eligibility, setEligibility] = useState<CertificateEligibility | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Identity Form State for pre-issuance confirmation
  const [fullName, setFullName] = useState("");
  const [collegeName, setCollegeName] = useState("");
  const [issuing, setIssuing] = useState(false);
  const [issueError, setIssueError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadCertificateOrEligibility() {
      if (!courseIdOrSlug || authLoading) return;
      if (!session?.user_id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      // 1. Try to fetch existing issued certificate first
      try {
        const certData = await fetchCourseCertificate(courseIdOrSlug);
        if (isMounted) {
          setCertificate(certData);
          setLoading(false);
          return;
        }
      } catch {
        // Not yet issued or 404, fall through to check eligibility
      }

      // 2. Fetch eligibility for issuance
      try {
        const elig = await fetchCertificateEligibility(courseIdOrSlug);
        if (isMounted) {
          setEligibility(elig);
          setFullName(elig.student_full_name || "");
          setCollegeName(elig.student_college || "");
        }
      } catch (err: unknown) {
        if (isMounted) {
          const msg = err instanceof Error ? err.message : "Failed to load certificate eligibility.";
          setError(msg);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadCertificateOrEligibility();
    return () => {
      isMounted = false;
    };
  }, [courseIdOrSlug, session?.user_id, authLoading]);

  const handleIssueCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIssueError(null);

    if (!fullName.trim()) {
      setIssueError("Full legal name is required.");
      return;
    }

    setIssuing(true);
    try {
      // 1. If identity is not locked, persist latest name and college
      if (!eligibility?.is_identity_locked) {
        await updateCertificateIdentity(fullName.trim(), collegeName.trim() || undefined);
      }

      // 2. Issue the certificate on backend
      const newCert = await issueCourseCertificate(courseIdOrSlug);
      setCertificate(newCert);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to issue certificate.";
      setIssueError(msg);
    } finally {
      setIssuing(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8 space-y-4">
        <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-sm font-medium animate-pulse">
          Loading certificate credentials...
        </p>
      </div>
    );
  }

  if (!session?.user_id) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8 text-center space-y-4">
        <GraduationCap className="w-12 h-12 text-purple-400" />
        <h1 className="text-xl font-bold text-white">Sign In Required</h1>
        <p className="text-slate-400 text-sm max-w-md">
          Please sign in to view and claim your official course completion certificate.
        </p>
        <Link
          href={`/login?redirect=/courses/${courseIdOrSlug}/certificate`}
          className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm transition-all"
        >
          Sign In to Continue
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center px-4 py-8 sm:py-12">
      {/* Top Navigation */}
      <header className="w-full max-w-5xl flex items-center justify-between pb-6 mb-6 border-b border-white/10 print:hidden">
        <Link
          href={`/courses/${courseIdOrSlug}`}
          className="text-xs text-slate-400 hover:text-white inline-flex items-center gap-1.5 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Course Syllabus</span>
        </Link>

        <Link
          href="/certificates"
          className="text-xs text-purple-400 hover:text-purple-300 inline-flex items-center gap-1 font-bold transition-colors"
        >
          <span>My Certificates</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-5xl flex flex-col items-center">
        {error && (
          <div className="w-full max-w-2xl mb-6 p-4 rounded-xl bg-rose-950/50 border border-rose-800/50 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {/* Scenario 1: Certificate already issued -> Show Certificate */}
        {certificate ? (
          <div className="w-full space-y-6 flex flex-col items-center">
            <div className="w-full max-w-4xl text-center space-y-1.5 mb-2 print:hidden">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                Congratulations on completing your course!
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Your Official Course Certificate
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                This certificate is cryptographically recorded and publicly verifiable.
              </p>
            </div>

            <CertificateDisplay
              studentName={certificate.student_name}
              collegeName={certificate.college_name}
              courseTitle={certificate.course_title}
              score={certificate.score}
              issuedDate={certificate.issued_at}
              certificateNumber={certificate.certificate_number}
              verificationUrl={certificate.verification_url}
              verificationId={certificate.verification_id}
              designTheme={certificate.design_theme}
              backgroundMediaUrl={certificate.background_media_url}
              isPreview={false}
            />
          </div>
        ) : eligibility?.can_issue_certificate || eligibility?.course_completed ? (
          /* Scenario 2: Course completed, certificate ready for issuance */
          <div className="w-full max-w-2xl p-6 sm:p-8 rounded-3xl border border-purple-500/30 bg-slate-900/60 backdrop-blur-md shadow-2xl space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center mx-auto text-purple-400">
                <Award className="w-7 h-7" />
              </div>
              <span className="text-[11px] font-black uppercase tracking-widest text-purple-400 block">
                Requirements Satisfied
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Congratulations! You completed this course.
              </h1>
              <p className="text-xs sm:text-sm text-slate-300">
                Your certificate for <strong className="text-white">{eligibility?.course_title}</strong> is ready to be issued.
              </p>
            </div>

            {/* Assessment Score Badge */}
            {eligibility?.course_score !== null && eligibility?.course_score !== undefined && (
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span className="text-xs font-bold text-slate-200">Final Assessment Score</span>
                </div>
                <span className="text-base font-black text-emerald-400">
                  {eligibility.course_score}%
                </span>
              </div>
            )}

            {/* Identity Confirmation Form */}
            <form onSubmit={handleIssueCertificate} className="space-y-4 pt-2">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs leading-relaxed space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-amber-300">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  Certificate Information Notice
                </div>
                <p>
                  Please ensure your details are accurate.{" "}
                  {eligibility?.is_identity_locked ? (
                    <strong className="text-white">
                      Your name and college are locked because a SkillsCatalyst certificate has already been issued.
                    </strong>
                  ) : (
                    <span>
                      Your name and college will be{" "}
                      <strong className="text-white">permanently locked</strong> after your first SkillsCatalyst certificate is issued.
                    </span>
                  )}
                </p>
              </div>

              {issueError && (
                <div className="p-3.5 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-medium">
                  {issueError}
                </div>
              )}

              {/* Full Legal Name */}
              <div>
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between mb-1.5">
                  <span>Full Legal Name</span>
                  {eligibility?.is_identity_locked && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 font-bold">
                      <Lock className="w-3 h-3" /> Locked
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  required
                  disabled={eligibility?.is_identity_locked}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full bg-slate-900 border border-white/10 disabled:opacity-60 px-4 py-3 text-sm font-semibold rounded-xl outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              {/* College / University */}
              <div>
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between mb-1.5">
                  <span>College / Institution Name (Optional)</span>
                  {eligibility?.is_identity_locked && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 font-bold">
                      <Lock className="w-3 h-3" /> Locked
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  disabled={eligibility?.is_identity_locked}
                  value={collegeName}
                  onChange={(e) => setCollegeName(e.target.value)}
                  placeholder="e.g. ABC Engineering College (Optional)"
                  className="w-full bg-slate-900 border border-white/10 disabled:opacity-60 px-4 py-3 text-sm font-semibold rounded-xl outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={issuing}
                  className="w-full py-3.5 px-6 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-60 text-white font-black text-sm tracking-wide shadow-lg shadow-purple-600/30 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                >
                  {issuing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Issuing Certificate...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Issue Official Certificate</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Scenario 3: Course not yet completed or certificates disabled */
          <div className="w-full max-w-xl p-8 rounded-3xl border border-white/10 bg-slate-900/40 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-slate-400">
              <BookOpen className="w-7 h-7" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-1">
                Course Progress Pending
              </span>
              <h1 className="text-xl font-black text-white">
                Course Requirements Incomplete
              </h1>
              <p className="text-xs text-slate-400 mt-2 max-w-md mx-auto">
                {eligibility?.reason_ineligible ||
                  "You have not completed all required course lessons and module quizzes yet."}
              </p>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href={`/courses/${courseIdOrSlug}`}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all"
              >
                Continue Course Curriculum
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
