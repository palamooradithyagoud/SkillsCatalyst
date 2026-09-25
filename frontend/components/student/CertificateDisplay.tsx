"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, ShieldCheck, Download, Printer, ExternalLink, Award } from "lucide-react";
import type { CertificateTheme } from "@/types/certificate";

interface CertificateDisplayProps {
  studentName: string;
  collegeName?: string;
  courseTitle: string;
  score: number;
  issuedDate: string;
  certificateNumber: string;
  verificationUrl: string;
  verificationId?: string;
  designTheme?: CertificateTheme;
  backgroundMediaUrl?: string;
  isPreview?: boolean;
}

export default function CertificateDisplay({
  studentName,
  courseTitle,
  score,
  issuedDate,
  certificateNumber,
  verificationUrl,
  designTheme = "professional_blue",
  backgroundMediaUrl,
  isPreview = false,
}: CertificateDisplayProps) {
  const certContainerRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleDownloadPdf = async () => {
    if (!certContainerRef.current || isExporting) return;
    setIsExporting(true);
    try {
      const { jsPDF } = await import("jspdf");
      const certEl = certContainerRef.current;

      let imgData: string;
      let imgWidth: number;
      let imgHeight: number;

      try {
        const html2canvasPro = (await import("html2canvas-pro")).default;
        const canvas = await html2canvasPro(certEl, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: "#020617",
        });
        imgData = canvas.toDataURL("image/png");
        imgWidth = canvas.width;
        imgHeight = canvas.height;
      } catch {
        const { toPng } = await import("html-to-image");
        imgData = await toPng(certEl, {
          pixelRatio: 2,
          backgroundColor: "#020617",
          cacheBust: true,
        });
        imgWidth = certEl.offsetWidth * 2;
        imgHeight = certEl.offsetHeight * 2;
      }

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [imgWidth, imgHeight],
      });

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      const safeCourse = (courseTitle || "Course").replace(/[^a-zA-Z0-9_-]/g, "_");
      const safeName = (studentName || "Student").replace(/[^a-zA-Z0-9_-]/g, "_");
      pdf.save(`${safeCourse}_Certificate_${safeName}.pdf`);
    } catch (err) {
      console.error("Failed to generate PDF:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  // Determine theme styling tokens
  const isGold = designTheme === "modern_gold";
  const isTech = designTheme === "technical_dark";

  const themeStyles = isGold
    ? {
        borderOuter: "border-amber-500/50 shadow-amber-500/10",
        borderInner: "border-amber-400/30",
        cornerAccents: "border-amber-400 text-amber-400",
        accentColor: "text-amber-400",
        accentGradient: "from-amber-400 via-amber-300 to-yellow-500",
        badgeBg: "bg-amber-500/10 border-amber-500/30 text-amber-300",
        headingColor: "text-amber-200",
        watermarkColor: "text-amber-500/5",
      }
    : isTech
    ? {
        borderOuter: "border-purple-500/50 shadow-purple-500/10",
        borderInner: "border-cyan-400/30",
        cornerAccents: "border-cyan-400 text-purple-400",
        accentColor: "text-cyan-400",
        accentGradient: "from-purple-400 via-fuchsia-400 to-cyan-400",
        badgeBg: "bg-purple-500/10 border-purple-500/30 text-purple-300",
        headingColor: "text-purple-200",
        watermarkColor: "text-purple-500/5",
      }
    : {
        // Professional Blue (Default)
        borderOuter: "border-blue-500/50 shadow-blue-500/10",
        borderInner: "border-sky-400/30",
        cornerAccents: "border-sky-400 text-sky-400",
        accentColor: "text-sky-400",
        accentGradient: "from-sky-400 via-blue-300 to-indigo-400",
        badgeBg: "bg-blue-500/10 border-blue-500/30 text-sky-300",
        headingColor: "text-sky-200",
        watermarkColor: "text-blue-500/5",
      };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Action Bar (Hidden when printing) */}
      {!isPreview && (
        <div className="w-full max-w-4xl flex items-center justify-between gap-3 mb-4 px-2 print:hidden">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Verified Official Credential</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleDownloadPdf}
              disabled={isExporting}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-lg shadow-purple-600/20 border border-purple-500/30 active:scale-95 disabled:opacity-50 cursor-pointer"
              aria-label="Download Certificate as PDF"
            >
              {isExporting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </>
              )}
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-semibold transition-all border border-white/10 hover:border-white/20 active:scale-95 cursor-pointer"
              aria-label="Print Certificate"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
          </div>
        </div>
      )}

      {/* ── Official Educational Certificate Frame ── */}
      <div
        ref={certContainerRef}
        id="certificate-render-viewport"
        className={`relative w-full max-w-4xl aspect-[1200/850] min-h-[580px] sm:min-h-[640px] md:min-h-[720px] rounded-2xl sm:rounded-3xl overflow-hidden p-6 sm:p-10 md:p-14 flex flex-col justify-between border-2 bg-slate-950 text-slate-100 shadow-2xl ${themeStyles.borderOuter} transition-all print:border-none print:shadow-none print:rounded-none print:w-full print:h-screen print:p-8`}
        style={{
          backgroundImage: backgroundMediaUrl ? `url('${backgroundMediaUrl}')` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Subtle Darkening Overlay for legibility if custom background is used */}
        {backgroundMediaUrl && (
          <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-[1px] pointer-events-none -z-0" />
        )}

        {/* ── Inner Guilloché Framing Lines ── */}
        <div
          className={`absolute inset-3 sm:inset-4 md:inset-6 rounded-xl sm:rounded-2xl border ${themeStyles.borderInner} pointer-events-none z-10`}
        />
        <div
          className={`absolute inset-4 sm:inset-5 md:inset-7 rounded-lg sm:rounded-xl border border-white/5 pointer-events-none z-10`}
        />

        {/* ── Ornamental Corner Accents ── */}
        <div className={`absolute top-5 left-5 w-6 h-6 sm:w-8 sm:h-8 border-t-2 border-l-2 ${themeStyles.cornerAccents} pointer-events-none z-10`} />
        <div className={`absolute top-5 right-5 w-6 h-6 sm:w-8 sm:h-8 border-t-2 border-r-2 ${themeStyles.cornerAccents} pointer-events-none z-10`} />
        <div className={`absolute bottom-5 left-5 w-6 h-6 sm:w-8 sm:h-8 border-b-2 border-l-2 ${themeStyles.cornerAccents} pointer-events-none z-10`} />
        <div className={`absolute bottom-5 right-5 w-6 h-6 sm:w-8 sm:h-8 border-b-2 border-r-2 ${themeStyles.cornerAccents} pointer-events-none z-10`} />

        {/* ── Background Rosette Watermark ── */}
        <div
          className={`absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 ${themeStyles.watermarkColor}`}
          aria-hidden="true"
        >
          <Award className="w-[320px] h-[320px] sm:w-[420px] sm:h-[420px] stroke-[0.35]" />
        </div>

        {/* ── 1. Top Area: Official SkillsCatalyst Logo & Brand ── */}
        <header className="relative z-10 flex flex-col items-center text-center pt-1 sm:pt-2">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14">
              <Image
                src="/logo.png"
                alt="SkillsCatalyst Logo"
                fill
                sizes="56px"
                className="object-contain"
                priority
                unoptimized
              />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white font-serif">
                SkillsCatalyst
              </span>
              <span className="text-[9px] sm:text-[10px] md:text-xs font-semibold tracking-widest text-slate-400 uppercase -mt-0.5">
                Accredited Career & Engineering Platform
              </span>
            </div>
          </div>

          {/* Certificate Type Banner */}
          <div className="mt-4 sm:mt-6">
            <h1 className="text-xs sm:text-sm md:text-base font-bold uppercase tracking-[0.25em] text-slate-400">
              Certificate of Course Completion
            </h1>
            <div className={`h-0.5 w-24 sm:w-32 mx-auto mt-2 bg-gradient-to-r ${themeStyles.accentGradient}`} />
          </div>
        </header>

        {/* ── 2. Center: Recipient & Qualification Details ── */}
        <main className="relative z-10 my-auto py-4 sm:py-6 flex flex-col items-center text-center px-4">
          <p className="text-xs sm:text-sm md:text-base text-slate-400 italic font-serif">
            This is to certify that
          </p>

          {/* Student Full Name */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-white font-serif mt-2 mb-1 drop-shadow-sm max-w-2xl break-words">
            {studentName || "Student Name"}
          </h2>

          <p className="text-xs sm:text-sm md:text-base text-slate-400 italic font-serif mt-4 sm:mt-5">
            has successfully completed all lectures, curriculum modules, and assessments for
          </p>

          {/* Course Name */}
          <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white tracking-tight mt-1.5 max-w-2xl break-words">
            {courseTitle || "Course Title"}
          </h3>

          {/* Metadata Badges: Date & Score */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-5 sm:mt-6">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs sm:text-sm text-slate-300 font-medium">
              <span className="text-slate-500">Issued Date:</span>
              <span className="font-semibold text-white">{issuedDate || "September 26, 2026"}</span>
            </div>

            <div className={`flex items-center gap-1.5 px-3.5 py-1 rounded-full border text-xs sm:text-sm font-bold ${themeStyles.badgeBg}`}>
              <span>Assessment Score:</span>
              <span className="font-black text-white">{score}%</span>
            </div>
          </div>
        </main>

        {/* ── 3. Footer: Institutional Authenticity Seal & Verification ── */}
        <footer className="relative z-10 pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] sm:text-xs text-slate-400">
          {/* Institutional Trust Badge */}
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 ${themeStyles.borderInner} bg-white/5`}>
              <ShieldCheck className={`w-4 h-4 ${themeStyles.accentColor}`} />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-bold text-slate-200">Official SkillsCatalyst Credential</span>
              <span className="text-[10px] text-slate-500">Validated Server-Side • Immutable Record</span>
            </div>
          </div>

          {/* Unique Certificate Identifiers & Verification Link */}
          <div className="flex flex-col sm:items-end text-center sm:text-right">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Certificate ID:</span>
              <span className="font-mono font-bold text-slate-200">{certificateNumber}</span>
            </div>

            {verificationUrl && (
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-slate-500">Verify:</span>
                <Link
                  href={verificationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`font-medium ${themeStyles.accentColor} hover:underline inline-flex items-center gap-1 text-[11px]`}
                >
                  <span className="truncate max-w-[200px] sm:max-w-[280px]">
                    {verificationUrl.replace(/^https?:\/\//, "")}
                  </span>
                  <ExternalLink className="w-2.5 h-2.5 shrink-0 print:hidden" />
                </Link>
              </div>
            )}
          </div>
        </footer>
      </div>

      {/* Screen reader live summary */}
      <span className="sr-only">
        Certificate of course completion issued to {studentName} for completing {courseTitle} with a score of {score} percent on {issuedDate}. Certificate ID: {certificateNumber}.
      </span>
    </div>
  );
}
