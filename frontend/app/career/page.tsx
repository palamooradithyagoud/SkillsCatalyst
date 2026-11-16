"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import CareerCards from "@/components/career/CareerCards";
import { LandingAccordionItem } from "@/components/ui/interactive-image-accordion";

// SYS-04: Lazy-load PlacementPrepModal to remove 64KB+ chunk from initial /career route bundle
const PlacementPrepModal = dynamic(() => import("@/components/PlacementPrepModal"), {
  ssr: false,
});

export default function CareerPage() {
  const router = useRouter();
  const [isPlacementPrepOpen, setIsPlacementPrepOpen] = useState(false);
  const [selectedPrepCategory, setSelectedPrepCategory] = useState<
    "Quantitative Aptitude" | "Logical Reasoning" | "Verbal Ability" | null
  >(null);

  const handleOpenPlacementPrep = (
    category?: "Quantitative Aptitude" | "Logical Reasoning" | "Verbal Ability"
  ) => {
    setSelectedPrepCategory(category || null);
    setIsPlacementPrepOpen(true);
  };

  const handleClosePlacementPrep = () => {
    setIsPlacementPrepOpen(false);
    setSelectedPrepCategory(null);
  };

  // Support direct modal launch via ?prep= query param (e.g. from Sidebar or QuickHubNav)
  useEffect(() => {
    const handlePrepParam = (prepVal?: string | null) => {
      if (typeof window === "undefined") return;
      const params = new URLSearchParams(window.location.search);
      const prep = prepVal !== undefined ? prepVal : (params.get("prep") || params.get("category"));
      if (prep) {
        const lower = prep.toLowerCase();
        if (lower.includes("reason")) {
          handleOpenPlacementPrep("Logical Reasoning");
        } else if (lower.includes("verbal")) {
          handleOpenPlacementPrep("Verbal Ability");
        } else if (lower.includes("quant") || lower.includes("aptitude")) {
          handleOpenPlacementPrep("Quantitative Aptitude");
        } else if (lower.includes("interview")) {
          const el = document.getElementById("ai-interviews");
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }
      }
    };

    handlePrepParam();
    const onCustomChange = (e: any) => {
      if (e.detail) handlePrepParam(e.detail);
    };
    window.addEventListener("career-prep-change", onCustomChange);
    window.addEventListener("popstate", () => handlePrepParam());
    return () => {
      window.removeEventListener("career-prep-change", onCustomChange);
      window.removeEventListener("popstate", () => handlePrepParam());
    };
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 pb-24 md:pb-12 pt-0 sm:pt-2">
      {/* ── Featured Interactive Placement Accordion (Top Section) ── */}
      <div className="-mx-3.5 -mt-3.5 sm:-mx-6 sm:-mt-6 md:-mx-8 md:-mt-8 lg:-mx-10 lg:-mt-10 xl:mx-0 xl:mt-0 xl:px-0">
        <LandingAccordionItem
          onOpenPlacementPrep={handleOpenPlacementPrep}
          onOpenResumeReview={() => router.push("/career/resume-review")}
          onBack={() => router.push("/dashboard")}
        />
      </div>

      {/* ── Cards Grid & Content ── */}
      <div className="px-3 sm:px-6 space-y-6 sm:space-y-8">
        <CareerCards
          onOpenPlacementPrep={handleOpenPlacementPrep}
          onOpenResumeReview={() => router.push("/career/resume-review")}
        />

        {/* ── Placement Preparation Modal (dynamically loaded on demand) ── */}
        {isPlacementPrepOpen && (
          <PlacementPrepModal
            isOpen={isPlacementPrepOpen}
            onClose={handleClosePlacementPrep}
            initialCategory={selectedPrepCategory}
          />
        )}
      </div>
    </div>
  );
}
