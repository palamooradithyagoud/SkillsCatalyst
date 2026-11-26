"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import RoadmapDetailHero from "@/components/roadmaps/RoadmapDetailHero";
import { getRoadmapCardById } from "@/data/roadmaps";

export default function RoadmapDetailPage() {
  const params = useParams<{ id: string }>();
  const roadmapId = typeof params?.id === "string" ? params.id : "";
  const roadmap = getRoadmapCardById(roadmapId);

  if (!roadmap) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center space-y-5">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Roadmap Not Found
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-neutral-400">
          The requested roadmap pathway could not be located.
        </p>
        <div>
          <Link
            href="/roadmaps"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 dark:bg-[#D5FF38] text-white dark:text-[#0D0F12] font-bold text-xs sm:text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Roadmaps</span>
          </Link>
        </div>
      </div>
    );
  }

  return <RoadmapDetailHero roadmap={roadmap} />;
}
