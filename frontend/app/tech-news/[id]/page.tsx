"use client";

import React, { use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ExternalLink,
  Clock,
  Building,
  Sparkles,
  AlertCircle,
  Share2,
  CheckCircle2,
  Zap,
} from "lucide-react";
import { fetchStudentStoryById } from "@/lib/api/tech_news";
import { PremiumLockCard } from "@/components/premium";

interface TechNewsDetailPageProps {
  params: Promise<{ id: string }>;
}

function getHoursRemaining(visibleUntil?: string | null): string {
  if (!visibleUntil) return "48-Hour Story";
  const diffMs = new Date(visibleUntil).getTime() - Date.now();
  if (diffMs <= 0) return "Expired";
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) return `${hours} hours remaining`;
  return `${mins} minutes remaining`;
}

export default function TechNewsDetailPage({ params }: TechNewsDetailPageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const storyId = resolvedParams.id;

  const {
    data: story,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["student-tech-news-story", storyId],
    queryFn: () => fetchStudentStoryById(storyId),
    staleTime: 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6 animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-36" />
        <div className="h-64 bg-slate-200 rounded-3xl" />
        <div className="space-y-3">
          <div className="h-8 bg-slate-200 rounded w-4/5" />
          <div className="h-4 bg-slate-200 rounded w-1/3" />
        </div>
        <div className="h-32 bg-slate-100 rounded-2xl" />
        <div className="h-48 bg-slate-100 rounded-2xl" />
      </div>
    );
  }

  if (isError || !story) {
    const isLimit =
      (error as any)?.status === 403 ||
      (error as any)?.code === "LIMIT_REACHED" ||
      (error as any)?.detail?.code === "LIMIT_REACHED";

    if (isLimit) {
      return (
        <div className="max-w-2xl mx-auto my-12 p-4">
          <PremiumLockCard
            title="Daily Tech News Limit Reached"
            description="Free accounts can read up to 2 curated technical stories per day. Upgrade to Premium for unlimited daily stories, full 48-hour archive access, and real-time tech company briefings."
            benefits={[
              "Unlimited daily technical story drops",
              "Full 48-hour archive access without daily throttling",
              "Exclusive product engineering & executive summaries",
              "Direct original source & company announcement links",
            ]}
            secondaryAction={{
              label: "Return to Dashboard",
              onClick: () => router.push("/dashboard"),
            }}
          />
        </div>
      );
    }

    return (
      <div className="max-w-lg mx-auto my-14 p-8 text-center bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
          <Clock className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-black text-slate-900">Story Expired or Unavailable</h2>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          {error instanceof Error
            ? error.message
            : "Tech News stories run on a strict 48-hour lifecycle to preserve fresh, timely industry information. This story is no longer active."}
        </p>
        <div className="pt-2">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    );
  }

  const hoursRemaining = getHoursRemaining(story.visible_until);

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6 pb-24">
      {/* ── Top Breadcrumbs & 48h Badge ── */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-purple-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-extrabold">
          <Zap className="w-3.5 h-3.5 text-purple-600" />
          <span>48h Curated Story</span>
        </span>
      </div>

      {/* ── Story Hero Card ── */}
      <article className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden space-y-6">
        {/* Cover Banner */}
        {story.cover_image_url ? (
          <div className="w-full h-64 sm:h-80 relative bg-slate-900 border-b border-slate-100">
            <Image
              src={story.cover_image_url}
              alt={story.title}
              fill
              className="object-cover"
              priority
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
          </div>
        ) : (
          <div className="w-full h-44 sm:h-52 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-950 p-6 flex flex-col justify-end text-white relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-purple-500/20 blur-2xl" />
            <div className="relative z-10 space-y-1">
              <span className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Industry Technical Briefing</span>
              </span>
            </div>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Company Source & Time Remaining Meta */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-5">
            <div className="flex items-center gap-3">
              {story.source_logo_url ? (
                <div className="w-10 h-10 rounded-full border border-slate-200 p-0.5 overflow-hidden bg-slate-50 flex items-center justify-center">
                  <Image
                    src={story.source_logo_url}
                    alt={story.source_name || "Company"}
                    width={38}
                    height={38}
                    className="w-full h-full object-cover rounded-full"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 font-black text-sm flex items-center justify-center border border-purple-200">
                  <Building className="w-5 h-5" />
                </div>
              )}
              <div>
                <h3 className="text-sm font-black text-slate-900">
                  {story.source_name || "Tech News Partner"}
                </h3>
                <p className="text-xs text-slate-500 font-medium">Verified Publisher</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-50 border border-cyan-200/80 text-cyan-800 text-xs font-bold">
              <Clock className="w-3.5 h-3.5 text-cyan-600" />
              <span>{hoursRemaining}</span>
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
            {story.title}
          </h1>

          {/* Key Summary Callout */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border-l-4 border-purple-600 text-slate-700 text-sm leading-relaxed font-medium">
            <p className="font-bold text-xs uppercase tracking-wider text-purple-700 mb-1">
              Executive Summary
            </p>
            {story.summary}
          </div>

          {/* Full Article Content */}
          <div className="text-slate-800 text-sm sm:text-base leading-relaxed space-y-4 font-normal whitespace-pre-line">
            {story.content}
          </div>

          {/* External Source Action Box */}
          {story.source_url && (
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-500">
                <span>Original article published by </span>
                <strong className="text-slate-700">{story.source_name || "source publication"}</strong>.
              </div>
              <a
                href={story.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-black shadow-md shadow-purple-500/20 transition-all cursor-pointer"
              >
                <span>Read Original Source</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}
        </div>
      </article>

      {/* ── Footer Navigation ── */}
      <div className="flex items-center justify-center pt-2">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Dashboard Stories</span>
        </Link>
      </div>
    </div>
  );
}
