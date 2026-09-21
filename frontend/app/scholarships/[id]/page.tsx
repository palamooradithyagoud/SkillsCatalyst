"use client";

import React, { use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import {
  GraduationCap,
  Building,
  BookOpen,
  ArrowLeft,
  ExternalLink,
  ShieldCheck,
  Calendar,
  AlertCircle,
  FileText,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { fetchStudentScholarshipById } from "@/lib/api/scholarships";

interface ScholarshipDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ScholarshipDetailPage({ params }: ScholarshipDetailPageProps) {
  const resolvedParams = use(params);
  const scholarshipId = resolvedParams.id;

  const {
    data: scholarship,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["student-scholarship", scholarshipId],
    queryFn: () => fetchStudentScholarshipById(scholarshipId),
    staleTime: 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6 animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-40" />
        <div className="h-48 bg-slate-200 rounded-3xl" />
        <div className="space-y-3">
          <div className="h-8 bg-slate-200 rounded w-3/4" />
          <div className="h-4 bg-slate-200 rounded w-1/3" />
        </div>
        <div className="h-36 bg-slate-100 rounded-2xl" />
        <div className="h-36 bg-slate-100 rounded-2xl" />
      </div>
    );
  }

  if (isError || !scholarship) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 text-center bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-black text-slate-900">Scholarship Not Available</h2>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          {error instanceof Error ? error.message : "This scholarship is either in draft status, expired, or does not exist."}
        </p>
        <div className="pt-2">
          <Link
            href="/explore?tab=scholarships"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-black hover:bg-indigo-500 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Scholarships</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6 pb-20">
      {/* ── Breadcrumb Back Navigation ── */}
      <div className="flex items-center justify-between">
        <Link
          href="/explore?tab=scholarships"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Scholarships</span>
        </Link>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-black">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Verified Opportunity</span>
        </span>
      </div>

      {/* ── Main Hero Card ── */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        {/* Banner Image or Graphic Header */}
        {scholarship.image_url ? (
          <div className="w-full h-56 sm:h-72 relative bg-slate-900 border-b border-slate-100">
            <Image
              src={scholarship.image_url}
              alt={scholarship.name}
              fill
              className="object-cover"
              priority
              unoptimized
            />
          </div>
        ) : (
          <div className="w-full h-40 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 flex items-center justify-center text-white/90">
            <GraduationCap className="w-16 h-16 stroke-[1.8] opacity-80" />
          </div>
        )}

        {/* Content Header */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-black text-indigo-600">
              <Building className="w-4 h-4" />
              <span>{scholarship.provided_by}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
              {scholarship.name}
            </h1>
          </div>

          {/* Qualification Badge & Expiration Notice */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-800 text-xs font-bold">
              <BookOpen className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>Target Qualification: {scholarship.qualification_required}</span>
            </div>

            {scholarship.visible_until && (
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Application Deadline: {new Date(scholarship.visible_until).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          {/* Primary Action Button */}
          <div className="pt-2">
            <a
              href={scholarship.application_url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-black transition-all shadow-md shadow-indigo-600/25 hover:shadow-indigo-600/40 cursor-pointer select-none"
            >
              <span>Apply / Visit Official Link</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* ── Section: Eligibility ── */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-3 shadow-2xs">
        <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>Eligibility Criteria</span>
        </h2>
        <div className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed whitespace-pre-line pl-7">
          {scholarship.eligibility}
        </div>
      </div>

      {/* ── Section: Requirements ── */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-3 shadow-2xs">
        <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-600" />
          <span>Submission Requirements &amp; Documents</span>
        </h2>
        <div className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed whitespace-pre-line pl-7">
          {scholarship.requirements}
        </div>
      </div>

      {/* ── Direct Footer Action ── */}
      <div className="p-6 rounded-3xl bg-indigo-50/70 border border-indigo-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-0.5 text-center sm:text-left">
          <h3 className="text-sm font-black text-indigo-950">Ready to complete your application?</h3>
          <p className="text-xs text-indigo-700 font-medium">
            You will be redirected directly to the official external portal for {scholarship.provided_by}.
          </p>
        </div>

        <a
          href={scholarship.application_url}
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black transition-colors flex items-center gap-1.5 shrink-0 shadow-xs"
        >
          <span>Open Portal</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
