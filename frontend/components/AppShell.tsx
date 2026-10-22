"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import TopNavbar from "@/components/TopNavbar";
import MobileNav from "@/components/MobileNav";
import ErrorBoundary from "@/components/ErrorBoundary";
import { PricingModalProvider } from "@/contexts/PricingModalContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import NotificationPermissionBanner from "@/components/notifications/NotificationPermissionBanner";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/reset-password";
  const isLandingPage = pathname === "/";
  const isAdminPage = pathname === "/admin" || pathname.startsWith("/admin/");
  const isAIMentorPage = pathname === "/ai-mentor" || pathname.startsWith("/ai-mentor");
  const isLegalPage =
    pathname.startsWith("/privacy") ||
    pathname.startsWith("/terms") ||
    pathname.startsWith("/cookie");

  if (isAuthPage || isLandingPage || isAdminPage || isAIMentorPage || isLegalPage) {
    return (
      <PricingModalProvider>
        <NotificationProvider>
          <div
            className={`w-full min-h-screen min-h-[100dvh] m-0 p-0 overflow-x-hidden flex flex-col ${
              isLandingPage
                ? "bg-[#06070d] text-white"
                : isAdminPage
                ? "bg-[#0B0D17] text-white"
                : isAIMentorPage
                ? "bg-white dark:bg-black text-neutral-900 dark:text-neutral-100"
                : isLegalPage
                ? "bg-[#faf8fc] dark:bg-black text-[#121217] dark:text-white"
                : "bg-white dark:bg-black text-[#18191F] dark:text-white"
            }`}
          >
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
            <NotificationPermissionBanner />
          </div>
        </NotificationProvider>
      </PricingModalProvider>
    );
  }

  const isEditProfile = pathname.startsWith("/settings/edit") || pathname.startsWith("/profile/edit");
  const isSkillBits = pathname.startsWith("/skillbits");
  const isCareer = pathname.startsWith("/career");

  return (
    <PricingModalProvider>
      <NotificationProvider>
        <div className="flex flex-col min-h-screen w-full relative bg-white dark:bg-black text-[#18191F] dark:text-white">
        {/* Subtle ambient orbs in background (hardware-accelerated, zero scroll paint cost) */}
        {!isSkillBits && (
          <div
            aria-hidden="true"
            className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none transform-gpu will-change-transform"
            style={{ contain: "strict" }}
          >
            <div
              className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full transform-gpu"
              style={{
                background: "radial-gradient(circle, rgba(147, 51, 234, 0.08) 0%, rgba(147, 51, 234, 0.03) 45%, transparent 70%)",
              }}
            />
            <div
              className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full transform-gpu"
              style={{
                background: "radial-gradient(circle, rgba(88, 28, 135, 0.06) 0%, rgba(88, 28, 135, 0.02) 45%, transparent 70%)",
              }}
            />
            <div
              className="absolute top-[40%] left-[40%] w-[400px] h-[400px] rounded-full transform-gpu"
              style={{
                background: "radial-gradient(circle, rgba(59, 7, 100, 0.05) 0%, rgba(59, 7, 100, 0.01) 45%, transparent 70%)",
              }}
            />
          </div>
        )}

        {/* Top Navbar matching the reference design */}
        <TopNavbar />

        {/* Mobile Nav: lives outside the flex row so it doesn't steal width from main */}
        <MobileNav />

        <div className="flex flex-1 min-h-0 relative">
          <Sidebar />
          <main
            style={{ WebkitOverflowScrolling: "touch" }}
            className={`relative z-10 flex-1 bg-white dark:bg-black ${
              isSkillBits
                ? "p-0 overflow-hidden h-[100dvh] md:h-[calc(100dvh-3.5rem)]"
                : `${isEditProfile ? "pb-28 sm:pb-32 md:pb-28" : isCareer ? "pb-8" : "pb-28 md:pb-8"} pt-[62px] md:pt-8 px-3.5 sm:px-6 md:px-8 lg:px-10 overflow-y-auto`
            } max-w-full overflow-x-hidden min-w-0`}
          >
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </main>
        </div>
        <NotificationPermissionBanner />
      </div>
      </NotificationProvider>
    </PricingModalProvider>
  );
}
