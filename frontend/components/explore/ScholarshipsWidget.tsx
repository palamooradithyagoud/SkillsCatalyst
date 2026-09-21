"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  GraduationCap,
  Building,
  BookOpen,
  ArrowRight,
  ExternalLink,
  Search,
  AlertCircle,
  Clock,
  RefreshCw,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchStudentScholarships } from "@/lib/api/scholarships";
import type { ScholarshipItem } from "@/types/scholarships";
import { useSubscription } from "@/hooks/useSubscription";
import { UsageLimitIndicator } from "@/components/premium";

export default function ScholarshipsWidget() {
  const [searchQuery, setSearchQuery] = useState("");
  const { isPremium, getLimit } = useSubscription();
  const scholarshipLimit = isPremium ? null : getLimit("scholarships");

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["student-scholarships", searchQuery],
    queryFn: () => fetchStudentScholarships({ search: searchQuery.trim() || undefined }),
    staleTime: 60 * 1000,
  });

  const scholarships: ScholarshipItem[] = data?.scholarships || [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">

      {/* ── Search Bar ── */}
      <div className="flex items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by scholarship name, provider, or qualification..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 transition-colors"
          />
        </div>

        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="text-xs font-bold text-slate-500 hover:text-slate-800 px-2 py-1"
          >
            Clear
          </button>
        )}
      </div>

      {/* ── Quota / Plan Status Indicator ── */}
      {scholarshipLimit !== null && (
        <UsageLimitIndicator
          used={scholarships.length}
          limit={scholarshipLimit}
          unitName="Scholarships"
          isPremium={isPremium}
          compact
        />
      )}

      {/* ── Listings Container ── */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3.5 animate-pulse"
            >
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-slate-200 shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                </div>
              </div>
              <div className="h-10 bg-slate-100 rounded-xl" />
              <div className="h-9 bg-slate-200 rounded-xl" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-rose-200 space-y-3 shadow-2xs">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
          <h4 className="text-sm font-black text-slate-900">Failed to load scholarships</h4>
          <p className="text-xs text-slate-500">
            {error instanceof Error ? error.message : "Could not connect to the scholarships service."}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      ) : scholarships.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200/90 space-y-3 shadow-2xs">
          <GraduationCap className="w-10 h-10 text-slate-400 mx-auto" />
          <h4 className="text-sm font-black text-slate-900">No scholarships available right now.</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery
              ? "No scholarships matched your search criteria. Try a different term."
              : "Check back soon as new verified funding opportunities and fellowships are published."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {scholarships.map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
              className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Header with Image & Provider */}
                <div className="flex items-start gap-3.5">
                  {item.image_url ? (
                    <div className="w-14 h-14 rounded-xl overflow-hidden relative shrink-0 border border-slate-200 bg-slate-50">
                      <Image
                        src={item.image_url}
                        alt={item.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-indigo-50 border border-indigo-200/80 flex items-center justify-center text-indigo-600 shrink-0">
                      <GraduationCap className="w-7 h-7" />
                    </div>
                  )}

                  <div className="space-y-1 flex-1 min-w-0">
                    <span className="text-[11px] font-black text-indigo-700 flex items-center gap-1 truncate">
                      <Building className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{item.provided_by}</span>
                    </span>

                    <h3 className="font-black text-slate-900 text-sm sm:text-base leading-snug line-clamp-2">
                      {item.name}
                    </h3>
                  </div>
                </div>

                {/* Qualification Badge */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-700 text-xs font-semibold">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span className="truncate">{item.qualification_required}</span>
                </div>

                {/* Eligibility Summary */}
                <p className="text-xs text-slate-600 font-medium line-clamp-2 leading-relaxed">
                  {item.eligibility}
                </p>

                {/* Expiration if set */}
                {item.visible_until && (
                  <div className="flex items-center gap-1 text-[11px] text-amber-700 font-bold">
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    <span>Closes on {new Date(item.visible_until).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              {/* CTAs */}
              <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                <Link
                  href={`/scholarships/${item.id}`}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black text-center flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <span>View Scholarship</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <a
                  href={item.application_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Open Official Application Portal"
                  className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors shrink-0"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
