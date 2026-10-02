"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import PlacementPrepModal from "@/components/PlacementPrepModal";
import CareerCards from "@/components/career/CareerCards";
import { LandingAccordionItem } from "@/components/ui/interactive-image-accordion";

export default function CareerPage() {
  const router = useRouter();
  const [isPlacementPrepOpen, setIsPlacementPrepOpen] = useState(false);

  return (
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 pb-12 pt-0 sm:pt-2">
      {/* ── Featured Interactive Placement Accordion (Top Section) ── */}
      <div className="-mx-3.5 -mt-3.5 sm:-mx-6 sm:-mt-6 md:-mx-8 md:-mt-8 lg:-mx-10 lg:-mt-10 xl:mx-0 xl:mt-0 xl:px-0">
        <LandingAccordionItem
          onOpenPlacementPrep={() => setIsPlacementPrepOpen(true)}
          onOpenResumeReview={() => router.push("/career/resume-review")}
        />
      </div>

      {/* ── Cards Grid & Content ── */}
      <div className="px-3 sm:px-6 space-y-6 sm:space-y-8">
        <CareerCards
          onOpenPlacementPrep={() => setIsPlacementPrepOpen(true)}
          onOpenResumeReview={() => router.push("/career/resume-review")}
        />

        {/* ── Placement Preparation Modal ── */}
        <PlacementPrepModal
          isOpen={isPlacementPrepOpen}
          onClose={() => setIsPlacementPrepOpen(false)}
        />
      </div>
    </div>
  );
}
