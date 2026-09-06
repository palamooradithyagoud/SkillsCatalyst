"use client";

import React, { useState, useEffect } from "react";
import { Building2 } from "lucide-react";
import PlacementPrepModal from "@/components/PlacementPrepModal";
import FloatingCTA from "@/components/mobile/FloatingCTA";
import CareerHeader from "@/components/career/CareerHeader";
import CareerCards from "@/components/career/CareerCards";
import ResumeReviewModal from "@/components/career/ResumeReviewModal";
import { useResumeReview } from "@/hooks/useResumeReview";

export default function CareerPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPlacementPrepOpen, setIsPlacementPrepOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const reviewState = useResumeReview();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* ── Page Header ── */}
      <CareerHeader />

      {/* ── Cards Grid ── */}
      <CareerCards
        onOpenPlacementPrep={() => setIsPlacementPrepOpen(true)}
        onOpenResumeReview={() => setIsModalOpen(true)}
      />

      {/* ── Resume Review Modal (Mounted via React Portal) ── */}
      {mounted && (
        <ResumeReviewModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          reviewState={reviewState}
        />
      )}

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
