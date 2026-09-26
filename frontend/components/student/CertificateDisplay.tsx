"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CheckCircle2,
  ShieldCheck,
  Download,
  Printer,
  ExternalLink,
  BarChart3,
  Clock,
} from "lucide-react";
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
  courseDuration?: string;
  designTheme?: CertificateTheme;
  backgroundMediaUrl?: string;
  isPreview?: boolean;
}

/**
 * Format date string into "DD MONTH YYYY" (e.g., "26 SEPTEMBER 2026")
 */
function formatCertificateDate(dateStr: string): string {
  if (!dateStr) return "26 SEPTEMBER 2026";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr.toUpperCase();
    const day = d.getDate().toString().padStart(2, "0");
    const month = d.toLocaleString("en-US", { month: "long" }).toUpperCase();
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  } catch {
    return dateStr.toUpperCase();
  }
}

export default function CertificateDisplay({
  studentName,
  collegeName,
  courseTitle,
  score,
  issuedDate,
  certificateNumber,
  verificationUrl,
  courseDuration = "12 Hours",
  backgroundMediaUrl,
  isPreview = false,
}: CertificateDisplayProps) {
  const certContainerRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Background image: defaults to our high-resolution custom template background
  const bgImage = backgroundMediaUrl || "/images/certificate_template_bg.jpg";

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
          scale: 2.5,
          useCORS: true,
          logging: false,
          backgroundColor: "#FFFFFF",
        });
        imgData = canvas.toDataURL("image/png");
        imgWidth = canvas.width;
        imgHeight = canvas.height;
      } catch {
        const { toPng } = await import("html-to-image");
        imgData = await toPng(certEl, {
          pixelRatio: 2.5,
          backgroundColor: "#FFFFFF",
          cacheBust: true,
        });
        imgWidth = certEl.offsetWidth * 2.5;
        imgHeight = certEl.offsetHeight * 2.5;
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

  return (
    <div className="w-full flex flex-col items-center">
      {/* ── Top Action Bar (Hidden when printing) ── */}
      {!isPreview && (
        <div className="w-full max-w-4xl flex items-center justify-between gap-3 mb-4 px-2 print:hidden">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200 shadow-2xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Verified Official Credential</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleDownloadPdf}
              disabled={isExporting}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-xs active:scale-95 disabled:opacity-50 cursor-pointer"
              aria-label="Download Certificate as PDF"
            >
              {isExporting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Generating High-Res PDF...</span>
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
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all border border-slate-200/90 shadow-xs active:scale-95 cursor-pointer"
              aria-label="Print Certificate"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
          </div>
        </div>
      )}

      {/* ── High-Quality Certificate Frame ── */}
      <div
        ref={certContainerRef}
        id="certificate-render-viewport"
        className="relative w-full max-w-4xl aspect-[16/9] min-h-[520px] sm:min-h-[580px] md:min-h-[640px] rounded-2xl sm:rounded-3xl overflow-hidden p-6 sm:p-8 md:p-10 lg:p-12 flex flex-col justify-between border border-purple-200/80 bg-white text-slate-900 shadow-2xl transition-all select-none print:border-none print:shadow-none print:rounded-none print:w-full print:h-screen print:p-8"
        style={{
          backgroundImage: `url('${bgImage}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* ── 1. Top Header: Taglines & Official Skills Catalyst Logo ── */}
        <header className="relative z-10 flex items-start justify-between w-full pt-1 sm:pt-2">
          {/* Top Left Taglines */}
          <div className="flex flex-col text-left">
            <span className="text-[8px] sm:text-[9.5px] font-extrabold tracking-[0.22em] text-slate-600 leading-snug">
              LEARN
            </span>
            <span className="text-[8px] sm:text-[9.5px] font-extrabold tracking-[0.22em] text-slate-600 leading-snug">
              BUILD
            </span>
            <span className="text-[8px] sm:text-[9.5px] font-extrabold tracking-[0.22em] text-slate-600 leading-snug">
              GROW
            </span>
            <span className="text-[8px] sm:text-[9.5px] font-extrabold tracking-[0.22em] text-slate-600 leading-snug">
              ACCELERATE
            </span>
            <div className="w-5 sm:w-6 h-[1.5px] bg-purple-400 mt-1" />
          </div>

          {/* Top Center Logo */}
          <div className="flex flex-col items-center -mt-1 sm:-mt-2">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24">
              <Image
                src="/logo_black.png"
                alt="Skills Catalyst Official Logo"
                fill
                sizes="96px"
                className="object-contain"
                priority
                unoptimized
              />
            </div>
          </div>

          {/* Top Right Taglines */}
          <div className="flex flex-col text-right items-end">
            <span className="text-[8px] sm:text-[9.5px] font-extrabold tracking-[0.22em] text-slate-600 leading-snug">
              SKILLS
            </span>
            <span className="text-[8px] sm:text-[9.5px] font-extrabold tracking-[0.22em] text-slate-600 leading-snug">
              CAREERS
            </span>
            <span className="text-[8px] sm:text-[9.5px] font-extrabold tracking-[0.22em] text-slate-600 leading-snug">
              OPPORTUNITIES
            </span>
            <span className="text-[8px] sm:text-[9.5px] font-extrabold tracking-[0.22em] text-slate-600 leading-snug">
              COMMUNITY
            </span>
            <div className="w-5 sm:w-6 h-[1.5px] bg-purple-400 mt-1 ml-auto" />
          </div>
        </header>

        {/* ── 2. Certificate Body: Typography & Dynamic Student Data ── */}
        <main className="relative z-10 my-auto py-1 sm:py-2 flex flex-col items-center text-center px-2">
          {/* Main Title */}
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-[38px] font-black tracking-tight uppercase leading-tight">
            <span className="text-slate-900">CERTIFICATE OF </span>
            <span className="bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-800 bg-clip-text text-transparent">
              COMPLETION
            </span>
          </h1>

          {/* Presentation Tagline */}
          <p className="text-[9px] sm:text-[10px] md:text-[11px] font-bold uppercase tracking-[0.25em] text-slate-600 mt-1.5 sm:mt-2">
            THIS CERTIFICATE IS PROUDLY PRESENTED TO
          </p>

          {/* Recipient Full Name */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[48px] font-black tracking-tight text-slate-900 mt-1 mb-1 sm:mt-1.5 sm:mb-1.5 drop-shadow-xs max-w-2xl break-words font-sans">
            {studentName || "Your Name"}
          </h2>

          {/* Underline separator */}
          <div className="w-36 sm:w-48 md:w-56 h-[1.5px] bg-purple-300 mx-auto mt-0.5 mb-1.5 sm:mt-1 sm:mb-2" />

          {collegeName && (
            <p className="text-[9.5px] sm:text-[10.5px] md:text-[11.5px] font-semibold text-slate-500 mb-1 sm:mb-1.5 max-w-xl truncate uppercase tracking-wider">
              {collegeName}
            </p>
          )}

          {/* Course Qualification Statement */}
          <p className="text-[9px] sm:text-[10px] md:text-[11px] font-bold uppercase tracking-[0.25em] text-slate-600 mb-1 sm:mb-1.5">
            FOR SUCCESSFULLY COMPLETING THE COURSE
          </p>

          {/* Course Name */}
          <h3 className="text-lg sm:text-xl md:text-2xl lg:text-[30px] font-black tracking-tight text-purple-700 drop-shadow-xs max-w-2xl break-words mb-3 sm:mb-4">
            {courseTitle || "Course Name"}
          </h3>

          {/* Floating Stats Badges Container */}
          <div className="inline-flex items-center justify-center gap-6 sm:gap-8 px-6 sm:px-8 py-2 sm:py-2.5 rounded-2xl bg-white/85 backdrop-blur-md border border-purple-100 shadow-xs mx-auto">
            {/* Course Score */}
            <div className="flex items-center gap-2.5 sm:gap-3 text-left">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-purple-100/90 flex items-center justify-center text-purple-700 shrink-0">
                <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <span className="text-[8px] sm:text-[9.5px] font-bold uppercase tracking-wider text-slate-500 block leading-tight">
                  Course Score
                </span>
                <span className="text-sm sm:text-base md:text-lg font-black text-slate-900 leading-tight">
                  {score}%
                </span>
              </div>
            </div>

            {/* Vertical Divider */}
            <div className="w-px h-7 sm:h-8 bg-slate-200" />

            {/* Course Duration */}
            <div className="flex items-center gap-2.5 sm:gap-3 text-left">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-purple-100/90 flex items-center justify-center text-purple-700 shrink-0">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <span className="text-[8px] sm:text-[9.5px] font-bold uppercase tracking-wider text-slate-500 block leading-tight">
                  Course Duration
                </span>
                <span className="text-sm sm:text-base md:text-lg font-black text-slate-900 leading-tight">
                  {courseDuration}
                </span>
              </div>
            </div>
          </div>
        </main>

        {/* ── 3. Footer: Certificate ID, Date & Issuer Signature ── */}
        <footer className="relative z-10 w-full pt-2">
          {/* Subtle top divider line */}
          <div className="w-full h-px bg-slate-200/90 mb-2.5 sm:mb-3" />

          <div className="grid grid-cols-3 items-center w-full text-[10px] sm:text-xs">
            {/* Left: Certificate ID */}
            <div className="text-left">
              <span className="text-[8px] sm:text-[9.5px] font-bold uppercase tracking-widest text-slate-500 block">
                CERTIFICATE ID
              </span>
              <span className="text-xs sm:text-sm md:text-base font-extrabold text-slate-900 font-mono tracking-wider block">
                {certificateNumber || "SC-XXXXXXXX"}
              </span>
            </div>

            {/* Center: Completed On Date */}
            <div className="text-center">
              <span className="text-[8px] sm:text-[9.5px] font-bold uppercase tracking-widest text-slate-500 block">
                COMPLETED ON
              </span>
              <span className="text-xs sm:text-sm md:text-base font-extrabold text-slate-900 tracking-wider uppercase block">
                {formatCertificateDate(issuedDate)}
              </span>
            </div>

            {/* Right: SkillsCatalyst Authorized */}
            <div className="text-right">
              <span className="text-xs sm:text-sm md:text-base font-black text-slate-900 tracking-tight block">
                SkillsCatalyst
              </span>
              <span className="text-[7.5px] sm:text-[8.5px] font-bold uppercase tracking-widest text-slate-500 block">
                AUTHORIZED CERTIFICATION
              </span>
            </div>
          </div>
        </footer>
      </div>

      {/* ── Public Verification Link below certificate ── */}
      {!isPreview && verificationUrl && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 print:hidden">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Publicly verifiable online:</span>
          <Link
            href={verificationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-purple-700 hover:text-purple-800 hover:underline inline-flex items-center gap-1"
          >
            <span>{verificationUrl.replace(/^https?:\/\//, "")}</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      )}

      {/* Screen reader live summary */}
      <span className="sr-only">
        Certificate of course completion issued to {studentName} for completing {courseTitle} with a
        score of {score} percent on {issuedDate}. Certificate ID: {certificateNumber}.
      </span>
    </div>
  );
}
