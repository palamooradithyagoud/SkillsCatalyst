"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2 } from "lucide-react";
import PlacementPrepModal from "@/components/PlacementPrepModal";
import FloatingCTA from "@/components/mobile/FloatingCTA";
import CareerHeader from "@/components/career/CareerHeader";
import CareerCards from "@/components/career/CareerCards";

export default function CareerPage() {
  const router = useRouter();
  const [isPlacementPrepOpen, setIsPlacementPrepOpen] = useState(false);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* ── Page Header ── */}
      <CareerHeader />

      {/* ── Cards Grid ── */}
      <CareerCards
        onOpenPlacementPrep={() => setIsPlacementPrepOpen(true)}
        onOpenResumeReview={() => router.push("/career/resume-review")}
      />

      {/* ── Placement Preparation Modal ── */}
      <PlacementPrepModal
        isOpen={isPlacementPrepOpen}
        onClose={() => setIsPlacementPrepOpen(false)}
      />

      {/* ── Native Smartphone Floating CTA ── */}
      <FloatingCTA
        onClick={() => {
          setIsPlacementPrepOpen(true);
        }}
        icon={<Building2 className="w-5 h-5 text-white" />}
        label="Placement Prep"
      />
    </div>
  );
}
