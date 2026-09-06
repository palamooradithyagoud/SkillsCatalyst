"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home, LifeBuoy } from "lucide-react";

export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console / error monitoring
    console.error("[Route Error Boundary caught]:", error);
  }, [error]);

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="min-h-[500px] w-full flex items-center justify-center p-6"
    >
      <div className="max-w-md w-full rounded-2xl border border-red-500/20 bg-[#0F172A]/95 p-8 text-center shadow-2xl backdrop-blur-xl">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500/20 to-orange-500/10 border border-red-500/30 text-red-400">
          <AlertTriangle className="h-8 w-8 text-red-400 animate-pulse" />
        </div>

        <h2 className="text-xl font-bold text-white tracking-tight sm:text-2xl">
          Unable to load page
        </h2>
        <p className="mt-2.5 text-sm leading-relaxed text-slate-400">
          An error occurred while loading this section of SkillsCatalyst.
          Your account status and progress are safe.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all hover:from-blue-500 hover:to-indigo-500 hover:shadow-blue-500/30 active:scale-[0.98]"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>

          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700/80 bg-slate-800/80 px-5 py-2.5 text-sm font-semibold text-slate-200 transition-all hover:bg-slate-700/80 hover:text-white active:scale-[0.98]"
          >
            <Home className="h-4 w-4" />
            Dashboard
          </Link>
        </div>

        <div className="mt-6 border-t border-slate-800/80 pt-4">
          <Link
            href="/contact"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            <LifeBuoy className="h-3.5 w-3.5" />
            Contact Support & Founder Desk
          </Link>
        </div>
      </div>
    </div>
  );
}
