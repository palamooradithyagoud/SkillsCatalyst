"use client";

import React, { useRef, useState, useEffect } from "react";
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

const CANONICAL_WIDTH = 1120;
const CANONICAL_HEIGHT = 630; // Standard 16:9 Landscape Aspect Ratio

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
  courseDuration = "1 Hour",
  backgroundMediaUrl,
  isPreview = false,
}: CertificateDisplayProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const certContainerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [isExporting, setIsExporting] = useState(false);

  // Background image: defaults to our high-resolution custom template background
  const bgImage = backgroundMediaUrl || "/images/certificate_template_bg.jpg";

  // Dynamically scale the canonical 1120x630 certificate canvas to fit the available container width
  useEffect(() => {
    function updateScale() {
      if (!wrapperRef.current) return;
      const availableWidth = wrapperRef.current.clientWidth;
      if (availableWidth > 0) {
        const targetScale = Math.min(1, Math.max(0.1, availableWidth / CANONICAL_WIDTH));
        setScale(targetScale);
      }
    }
    updateScale();
    const timer = setTimeout(updateScale, 50);
    window.addEventListener("resize", updateScale);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updateScale);
    };
  }, []);

  const handleDownloadPdf = async () => {
    if (!certContainerRef.current || isExporting) return;
    setIsExporting(true);
    try {
      const { jsPDF } = await import("jspdf");
      const certEl = certContainerRef.current;

      let imgData: string;
      try {
        const html2canvasPro = (await import("html2canvas-pro")).default;
        const canvas = await html2canvasPro(certEl, {
          scale: 2.5, // 2.5x retina clarity (2800 x 1575)
          useCORS: true,
          logging: false,
          backgroundColor: "#FFFFFF",
          width: CANONICAL_WIDTH,
          height: CANONICAL_HEIGHT,
          windowWidth: CANONICAL_WIDTH,
          windowHeight: CANONICAL_HEIGHT,
          onclone: (clonedDoc) => {
            const clonedCert = clonedDoc.getElementById("certificate-render-viewport");
            if (clonedCert) {
              clonedCert.style.transform = "none";
              clonedCert.style.width = `${CANONICAL_WIDTH}px`;
              clonedCert.style.height = `${CANONICAL_HEIGHT}px`;
              clonedCert.style.minWidth = `${CANONICAL_WIDTH}px`;
              clonedCert.style.maxWidth = `${CANONICAL_WIDTH}px`;
              clonedCert.style.minHeight = `${CANONICAL_HEIGHT}px`;
              clonedCert.style.maxHeight = `${CANONICAL_HEIGHT}px`;
              clonedCert.style.borderRadius = "24px";
              clonedCert.style.boxShadow = "none";

              // Expand any clipped parent containers in the cloned tree
              let parent = clonedCert.parentElement;
              while (parent && parent !== clonedDoc.body) {
                parent.style.width = `${CANONICAL_WIDTH}px`;
                parent.style.height = `${CANONICAL_HEIGHT}px`;
                parent.style.minWidth = `${CANONICAL_WIDTH}px`;
                parent.style.minHeight = `${CANONICAL_HEIGHT}px`;
                parent.style.overflow = "visible";
                parent = parent.parentElement;
              }
            }
          },
        });
        imgData = canvas.toDataURL("image/png");
      } catch {
        const { toPng } = await import("html-to-image");
        imgData = await toPng(certEl, {
          pixelRatio: 2.5,
          backgroundColor: "#FFFFFF",
          cacheBust: true,
          width: CANONICAL_WIDTH,
          height: CANONICAL_HEIGHT,
          canvasWidth: CANONICAL_WIDTH,
          canvasHeight: CANONICAL_HEIGHT,
          style: {
            transform: "none",
            width: `${CANONICAL_WIDTH}px`,
            height: `${CANONICAL_HEIGHT}px`,
            minWidth: `${CANONICAL_WIDTH}px`,
            maxWidth: `${CANONICAL_WIDTH}px`,
            minHeight: `${CANONICAL_HEIGHT}px`,
            maxHeight: `${CANONICAL_HEIGHT}px`,
          },
        });
      }

      // Canonical 16:9 Landscape PDF
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [CANONICAL_WIDTH, CANONICAL_HEIGHT],
      });

      pdf.addImage(imgData, "PNG", 0, 0, CANONICAL_WIDTH, CANONICAL_HEIGHT, undefined, "FAST");
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
      {/* ── Print Specific Stylesheet ── */}
      <style jsx global>{`
        @media print {
          @page {
            size: landscape;
            margin: 0;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
            background: #ffffff !important;
          }
        }
      `}</style>

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

      {/* ── Scaled Certificate Viewport for Responsive Screens ── */}
      <div
        ref={wrapperRef}
        className="w-full max-w-5xl flex flex-col items-center overflow-hidden my-1 sm:my-2"
      >
        <div
          style={{
            width: `${CANONICAL_WIDTH * scale}px`,
            height: `${CANONICAL_HEIGHT * scale}px`,
            position: "relative",
            overflow: "hidden",
            borderRadius: `${24 * scale}px`,
            boxShadow:
              "0 20px 45px -10px rgba(0, 0, 0, 0.12), 0 8px 16px -6px rgba(0, 0, 0, 0.08)",
          }}
          className="transition-[width,height] duration-150 print:!w-full print:!h-full print:!overflow-visible print:!shadow-none print:!rounded-none"
        >
          <div
            ref={certContainerRef}
            id="certificate-render-viewport"
            style={{
              width: `${CANONICAL_WIDTH}px`,
              height: `${CANONICAL_HEIGHT}px`,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
              backgroundImage: `url('${bgImage}')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
            className="p-10 flex flex-col justify-between border border-purple-200/80 bg-white text-slate-900 select-none print:!transform-none print:!border-none print:!shadow-none print:!rounded-none print:!w-full print:!h-full print:p-8"
          >
            {/* ── 1. Top Header: Taglines & Official Skills Catalyst Logo ── */}
            <header className="relative z-10 flex items-start justify-between w-full pt-2">
              {/* Top Left Taglines */}
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-extrabold tracking-[0.22em] text-slate-600 leading-snug">
                  LEARN
                </span>
                <span className="text-[10px] font-extrabold tracking-[0.22em] text-slate-600 leading-snug">
                  BUILD
                </span>
                <span className="text-[10px] font-extrabold tracking-[0.22em] text-slate-600 leading-snug">
                  GROW
                </span>
                <span className="text-[10px] font-extrabold tracking-[0.22em] text-slate-600 leading-snug">
                  ACCELERATE
                </span>
                <div className="w-6 h-[2px] bg-purple-400 mt-1" />
              </div>

              {/* Top Center Logo */}
              <div className="flex flex-col items-center -mt-1">
                <div className="relative w-20 h-20">
                  <Image
                    src="/logo_black.png"
                    alt="Skills Catalyst Official Logo"
                    fill
                    sizes="80px"
                    className="object-contain"
                    priority
                    unoptimized
                  />
                </div>
              </div>

              {/* Top Right Taglines */}
              <div className="flex flex-col text-right items-end">
                <span className="text-[10px] font-extrabold tracking-[0.22em] text-slate-600 leading-snug">
                  SKILLS
                </span>
                <span className="text-[10px] font-extrabold tracking-[0.22em] text-slate-600 leading-snug">
                  CAREERS
                </span>
                <span className="text-[10px] font-extrabold tracking-[0.22em] text-slate-600 leading-snug">
                  OPPORTUNITIES
                </span>
                <span className="text-[10px] font-extrabold tracking-[0.22em] text-slate-600 leading-snug">
                  COMMUNITY
                </span>
                <div className="w-6 h-[2px] bg-purple-400 mt-1 ml-auto" />
              </div>
            </header>

            {/* ── 2. Certificate Body: Typography & Dynamic Student Data ── */}
            <main className="relative z-10 my-auto py-2 flex flex-col items-center text-center px-4">
              {/* Main Title */}
              <h1 className="text-[34px] font-black tracking-tight uppercase leading-tight">
                <span className="text-slate-900">CERTIFICATE OF </span>
                <span className="text-purple-700">
                  COMPLETION
                </span>
              </h1>

              {/* Presentation Tagline */}
              <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-slate-600 mt-2">
                THIS CERTIFICATE IS PROUDLY PRESENTED TO
              </p>

              {/* Recipient Full Name */}
              <h2 className="text-[40px] font-black tracking-tight text-slate-900 mt-1 mb-1 drop-shadow-xs max-w-4xl break-words font-sans">
                {studentName || "Your Name"}
              </h2>

              {/* Underline separator */}
              <div className="w-56 h-[2px] bg-purple-300 mx-auto mt-0.5 mb-1.5" />

              {collegeName && (
                <p className="text-[12px] font-semibold text-slate-500 mb-1 max-w-2xl break-words uppercase tracking-wider">
                  {collegeName}
                </p>
              )}

              {/* Course Qualification Statement */}
              <p className="text-[10.5px] font-bold uppercase tracking-[0.22em] text-slate-600 mb-1">
                FOR SUCCESSFULLY COMPLETING THE COURSE
              </p>

              {/* Course Name */}
              <h3 className="text-[26px] font-black tracking-tight text-purple-700 drop-shadow-xs max-w-3xl break-words mb-3.5">
                {courseTitle || "Course Name"}
              </h3>

              {/* Floating Stats Badges Container */}
              <div className="inline-flex items-center justify-center gap-8 px-8 py-2 rounded-2xl bg-white/85 backdrop-blur-md border border-purple-100 shadow-xs mx-auto">
                {/* Course Score */}
                <div className="flex items-center gap-2.5 text-left">
                  <div className="w-8 h-8 rounded-xl bg-purple-100/90 flex items-center justify-center text-purple-700 shrink-0">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block leading-tight">
                      Course Score
                    </span>
                    <span className="text-base font-black text-slate-900 leading-tight">
                      {score}%
                    </span>
                  </div>
                </div>

                {/* Vertical Divider */}
                <div className="w-px h-7 bg-slate-200" />

                {/* Course Duration */}
                <div className="flex items-center gap-2.5 text-left">
                  <div className="w-8 h-8 rounded-xl bg-purple-100/90 flex items-center justify-center text-purple-700 shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block leading-tight">
                      Course Duration
                    </span>
                    <span className="text-base font-black text-slate-900 leading-tight">
                      {courseDuration}
                    </span>
                  </div>
                </div>
              </div>
            </main>

            {/* ── 3. Footer: Certificate ID, Date & Issuer Signature ── */}
            <footer className="relative z-10 w-full pt-1">
              {/* Subtle top divider line */}
              <div className="w-full h-px bg-slate-200/90 mb-2.5" />

              <div className="grid grid-cols-3 items-center w-full text-xs">
                {/* Left: Certificate ID */}
                <div className="text-left">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 block">
                    CERTIFICATE ID
                  </span>
                  <span className="text-sm font-extrabold text-slate-900 font-mono tracking-wider block">
                    {certificateNumber || "SC-XXXXXXXX"}
                  </span>
                </div>

                {/* Center: Completed On Date */}
                <div className="text-center">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 block">
                    COMPLETED ON
                  </span>
                  <span className="text-sm font-extrabold text-slate-900 tracking-wider uppercase block">
                    {formatCertificateDate(issuedDate)}
                  </span>
                </div>

                {/* Right: SkillsCatalyst Authorized */}
                <div className="text-right">
                  <span className="text-sm font-black text-slate-900 tracking-tight block">
                    SkillsCatalyst
                  </span>
                  <span className="text-[8px] font-bold uppercase tracking-widest text-slate-500 block">
                    AUTHORIZED CERTIFICATION
                  </span>
                </div>
              </div>
            </footer>
          </div>
        </div>
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
