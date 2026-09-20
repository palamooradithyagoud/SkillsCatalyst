"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import TopNavbar from "@/components/TopNavbar";
import MobileNav from "@/components/MobileNav";
import ErrorBoundary from "@/components/ErrorBoundary";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login";
  const isLandingPage = pathname === "/";
  const isAdminPage = pathname === "/admin" || pathname.startsWith("/admin/");

  if (isAuthPage || isLandingPage || isAdminPage) {
    return (
      <div
        className={`w-full min-h-screen min-h-[100dvh] m-0 p-0 overflow-x-hidden flex flex-col ${
          isLandingPage ? "bg-[#06070d] text-white" : isAdminPage ? "bg-[#0B0D17] text-white" : "bg-white text-[#18191F]"
        }`}
      >
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </div>
    );
  }

  const isEditProfile = pathname.startsWith("/settings/edit") || pathname.startsWith("/profile/edit");

  return (
    <div className="flex flex-col min-h-screen w-full relative">
      {/* Subtle ambient orbs in background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-purple-600/8 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-purple-900/6 blur-[120px]" />
        <div className="absolute top-[40%] left-[40%] w-[400px] h-[400px] rounded-full bg-purple-950/5 blur-[100px]" />
      </div>

      {/* Top Navbar matching the reference design */}
      <TopNavbar />

      {/* Mobile Nav: lives outside the flex row so it doesn't steal width from main */}
      <MobileNav />

      <div className="flex flex-1 min-h-0 relative">
        <Sidebar />
        <main
          className={`relative z-10 flex-1 p-3.5 sm:p-6 md:p-8 lg:p-10 ${
            isEditProfile ? "pb-28 sm:pb-32 md:pb-28" : "pb-28 md:pb-8"
          } overflow-y-auto max-w-full overflow-x-hidden min-w-0`}
        >
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
