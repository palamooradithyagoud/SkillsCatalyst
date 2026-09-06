"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import ErrorBoundary from "@/components/ErrorBoundary";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login";

  if (isAuthPage) {
    return (
      <div className="w-full min-h-screen min-h-[100dvh] m-0 p-0 overflow-x-hidden bg-white text-[#18191F] flex flex-col">
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </div>
    );
  }

  return (
    <>
      {/* Subtle ambient orbs in background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-purple-600/8 blur-[120px]" />
        <div className="absolute top-[40%] left-[40%] w-[400px] h-[400px] rounded-full bg-cyan-600/5 blur-[100px]" />
      </div>
      <Sidebar />
      <MobileNav />
      <main className="relative z-10 flex-1 p-3.5 sm:p-6 md:p-8 lg:p-10 pb-28 md:pb-8 overflow-y-auto max-w-full overflow-x-hidden">
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </main>
    </>
  );
}
