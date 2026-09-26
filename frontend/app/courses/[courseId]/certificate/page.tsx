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
          let msg = err instanceof Error ? err.message : "Failed to load certificate eligibility.";
          if (msg.toLowerCase().includes("failed to fetch")) {
            msg = "Unable to connect to the backend API server. Please ensure the backend is running on http://localhost:8000.";
          }
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
        try {
          await updateCertificateIdentity(fullName.trim(), collegeName.trim() || undefined);
        } catch (identErr: unknown) {
          const identMsg = identErr instanceof Error ? identErr.message : "";
          // If already locked, proceed safely to issuance
          if (!identMsg.toLowerCase().includes("locked")) {
            throw identErr;
          }
        }
      }

      // 2. Issue the certificate on backend
      const newCert = await issueCourseCertificate(courseIdOrSlug);
      setCertificate(newCert);
    } catch (err: unknown) {
      let msg = err instanceof Error ? err.message : "Failed to issue certificate.";
      if (msg.toLowerCase().includes("failed to fetch")) {
        msg = "Unable to connect to the backend server. Please verify the API server is running on http://localhost:8000 and try again.";
      }
      setIssueError(msg);
    } finally {
      setIssuing(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-8 space-y-4">
        <div className="w-10 h-10 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-600 text-sm font-medium animate-pulse">
          Loading certificate credentials...
        </p>
      </div>
    );
  }

  if (!session?.user_id) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-8 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-purple-50 border border-purple-200/80 flex items-center justify-center text-purple-600">
          <GraduationCap className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold text-slate-900">Sign In Required</h1>
        <p className="text-slate-600 text-sm max-w-md">
          Please sign in to view and claim your official course completion certificate.
        </p>
        <Link
          href={`/login?redirect=/courses/${courseIdOrSlug}/certificate`}
          className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-xs transition-all"
        >
          Sign In to Continue
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col items-center px-4 py-8 sm:py-12">
      {/* Top Navigation */}
      <header className="w-full max-w-5xl flex items-center justify-between pb-6 mb-6 border-b border-slate-200/90 print:hidden">
        <Link
          href={`/courses/${courseIdOrSlug}`}
          className="text-xs text-slate-600 hover:text-slate-900 inline-flex items-center gap-1.5 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Course Syllabus</span>
        </Link>

        <Link
          href="/certificates"
          className="text-xs text-purple-700 hover:text-purple-800 inline-flex items-center gap-1 font-bold transition-colors"
        >
          <span>My Certificates</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-5xl flex flex-col items-center">
        {error && (
          <div className="w-full max-w-2xl mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {error}
          </div>
        )}

        {/* Scenario 1: Certificate already issued -> Show Certificate */}
        {certificate ? (
          <div className="w-full space-y-6 flex flex-col items-center">
            <div className="w-full max-w-4xl text-center space-y-1.5 mb-2 print:hidden">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Congratulations on completing your course!
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Your Official Course Certificate
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
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
          <div className="w-full max-w-2xl p-6 sm:p-8 rounded-3xl border border-slate-200/90 bg-white shadow-xs space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-purple-50 border border-purple-200/80 flex items-center justify-center mx-auto text-purple-600">
                <Award className="w-7 h-7" />
              </div>
              <span className="text-[11px] font-black uppercase tracking-widest text-purple-700 block">
                Requirements Satisfied
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Congratulations! You completed this course.
              </h1>
              <p className="text-xs sm:text-sm text-slate-600">
                Your certificate for <strong className="text-slate-900">{eligibility?.course_title}</strong> is ready to be issued.
              </p>
            </div>

            {/* Assessment Score Badge */}
            {eligibility?.course_score !== null && eligibility?.course_score !== undefined && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span className="text-xs font-bold text-slate-700">Final Assessment Score</span>
                </div>
                <span className="text-base font-black text-emerald-700">
                  {eligibility.course_score}%
                </span>
              </div>
            )}

            {/* Identity Confirmation Form */}
            <form onSubmit={handleIssueCertificate} className="space-y-4 pt-2">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs leading-relaxed space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-amber-900">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                  Certificate Information Notice
                </div>
                <p>
                  Please ensure your details are accurate.{" "}
                  {eligibility?.is_identity_locked ? (
                    <strong className="text-slate-900">
                      Your name and college are locked because a SkillsCatalyst certificate has already been issued.
                    </strong>
                  ) : (
                    <span>
                      Your name and college will be{" "}
                      <strong className="text-slate-900">permanently locked</strong> after your first SkillsCatalyst certificate is issued.
                    </span>
                  )}
                </p>
              </div>

              {issueError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                  {issueError}
                </div>
              )}

              {/* Full Legal Name */}
              <div>
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between mb-1.5">
                  <span>Full Legal Name</span>
                  {eligibility?.is_identity_locked && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 font-bold">
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
                  className="w-full bg-white border border-slate-200 text-slate-900 disabled:bg-slate-100 disabled:opacity-60 px-4 py-3 text-sm font-semibold rounded-xl outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600/20 transition-colors"
                />
              </div>

              {/* College / University */}
              <div>
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between mb-1.5">
                  <span>College / Institution Name (Optional)</span>
                  {eligibility?.is_identity_locked && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 font-bold">
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
                  className="w-full bg-white border border-slate-200 text-slate-900 disabled:bg-slate-100 disabled:opacity-60 px-4 py-3 text-sm font-semibold rounded-xl outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600/20 transition-colors"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={issuing}
                  className="w-full py-3.5 px-6 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white font-black text-sm tracking-wide shadow-sm hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
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
          <div className="w-full max-w-xl p-8 rounded-3xl border border-slate-200/90 bg-white shadow-xs text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-purple-50 border border-purple-200/80 flex items-center justify-center mx-auto text-purple-600">
              <BookOpen className="w-7 h-7" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-slate-500 block mb-1">
                Course Progress Pending
              </span>
              <h1 className="text-xl font-black text-slate-900">
                Course Requirements Incomplete
              </h1>
              <p className="text-xs text-slate-600 mt-2 max-w-md mx-auto">
                {eligibility?.reason_ineligible ||
                  "You have not completed all required course lessons and module quizzes yet."}
              </p>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href={`/courses/${courseIdOrSlug}`}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-all"
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
