"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ScholarshipsWidget from "@/components/explore/ScholarshipsWidget";
import TechNewsWidget from "@/components/explore/TechNewsWidget";
import EventsWidget from "@/components/explore/EventsWidget";
import ExploreDownbar, { ExploreTabId } from "@/components/explore/ExploreDownbar";

function ExplorePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialTab = (searchParams.get("tab") as ExploreTabId) || "events";
  const [activeTab, setActiveTab] = useState<ExploreTabId>(
    ["events", "scholarships", "news", "trending"].includes(initialTab)
      ? initialTab
      : "events"
  );

  useEffect(() => {
    const tabParam = searchParams.get("tab") as ExploreTabId;
    if (tabParam && ["events", "scholarships", "news", "trending"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Sync activeTab attribute on document.body for instant MobileNav synchronization
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.body.setAttribute("data-explore-tab", activeTab);
    }
  }, [activeTab]);

  useEffect(() => {
    const handleExploreTabChange = (e: any) => {
      if (e.detail && ["events", "scholarships", "news", "trending"].includes(e.detail)) {
        setActiveTab(e.detail);
      }
    };
    window.addEventListener("explore-tab-change", handleExploreTabChange);
    return () => {
      window.removeEventListener("explore-tab-change", handleExploreTabChange);
      if (typeof document !== "undefined") {
        document.body.removeAttribute("data-explore-tab");
      }
    };
  }, []);

  const handleSelectTab = (tab: ExploreTabId) => {
    setActiveTab(tab);
    if (typeof document !== "undefined") {
      document.body.setAttribute("data-explore-tab", tab);
    }
    router.replace(`/explore?tab=${tab}`, { scroll: false });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-24 md:pb-12">
      {/* ── Normal Tab Views ── */}
      {/* ── 1. Events Widget ── */}
      {activeTab === "events" && <EventsWidget />}

      {/* ── 2. Scholarships Widget ── */}
      {activeTab === "scholarships" && <ScholarshipsWidget />}

      {/* ── 3. Tech News Widget ── */}
      {activeTab === "news" && <TechNewsWidget />}

      {/* ── 4. Trending ── */}
      {activeTab === "trending" && (
        <div className="max-w-5xl mx-auto p-8 sm:p-12 rounded-2xl bg-white dark:bg-[#1D1D1D] border border-dashed border-slate-200 dark:border-white/[0.08] text-center">
          <div className="space-y-1 max-w-sm mx-auto">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              No Trending Items Found
            </h4>
            <p className="text-xs text-slate-500 dark:text-neutral-400 leading-relaxed">
              Trending topics and curated tracks will appear here once added.
            </p>
          </div>
        </div>
      )}

      {/* ── Mobile Downbar Dock (Hidden on Desktop) ── */}
      <ExploreDownbar
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        className="md:hidden"
      />
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto p-8 text-center text-slate-400 font-bold">
          Loading Explore...
        </div>
      }
    >
      <ExplorePageContent />
    </Suspense>
  );
}

