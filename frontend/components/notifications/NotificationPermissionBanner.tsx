"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Bell, X, CheckCircle2 } from "lucide-react";
import { useNotifications } from "@/contexts/NotificationContext";
import { useAuth } from "@/lib/auth";

export default function NotificationPermissionBanner() {
  const { session, isLoading: isAuthLoading } = useAuth();
  const pathname = usePathname();

  const {
    isPushSupported,
    isPushSubscribed,
    pushPermission,
    requestPushPermission,
  } = useNotifications();

  const [isDismissed, setIsDismissed] = useState<boolean>(true);
  const [isSubscribing, setIsSubscribing] = useState<boolean>(false);
  const [justSubscribed, setJustSubscribed] = useState<boolean>(false);

  // Notifications must only be requested after the user logs in, never on the public landing page or auth routes
  const isExcludedRoute = pathname === "/" || pathname === "/login" || pathname === "/reset-password";

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Do not show for unauthenticated visitors, while checking auth, or on public/landing pages
    if (!session || isAuthLoading || isExcludedRoute) {
      setIsDismissed(true);
      return;
    }

    // Check if dismissed recently (cooldown: 7 days)
    const dismissedTime = localStorage.getItem("skillscatalyst_notif_banner_dismissed");
    if (dismissedTime) {
      const diff = Date.now() - parseInt(dismissedTime, 10);
      if (diff < 7 * 24 * 60 * 60 * 1000) {
        setIsDismissed(true);
        return;
      }
    }

    // Only show if push is supported, user has not subscribed, and permission is default
    if (isPushSupported && !isPushSubscribed && pushPermission === "default") {
      setIsDismissed(false);
    } else {
      setIsDismissed(true);
    }
  }, [session, isAuthLoading, isExcludedRoute, isPushSupported, isPushSubscribed, pushPermission]);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      localStorage.setItem("skillscatalyst_notif_banner_dismissed", Date.now().toString());
    } catch {}
  };

  const handleEnable = async () => {
    setIsSubscribing(true);
    setErrorMessage(null);
    try {
      const success = await requestPushPermission();
      if (success) {
        setJustSubscribed(true);
        setTimeout(() => {
          setIsDismissed(true);
        }, 2500);
      } else {
        setErrorMessage("Registration failed: push service error. Check browser settings or extensions.");
      }
    } catch (e: any) {
      setErrorMessage(e?.message || "Push service error. Check browser settings.");
    } finally {
      setIsSubscribing(false);
    }
  };

  if (!session || isAuthLoading || isExcludedRoute || isDismissed || !isPushSupported || isPushSubscribed) {
    return null;
  }

  if (justSubscribed) {
    return (
      <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-50 max-w-sm w-[calc(100vw-2rem)] bg-[#10110E] border border-[#24271F] rounded-2xl p-4 shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200">
        <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center shrink-0 border border-[#d5ff38]/40 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-[#d5ff38]" />
        </div>
        <div>
          <p className="text-sm font-bold text-white">Notifications Enabled</p>
          <p className="text-xs text-zinc-400">You will receive streak alerts and new updates.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      role="region"
      aria-label="Notification Permission"
      className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-50 max-w-md w-[calc(100vw-2rem)] bg-white dark:bg-[#10110E] border border-zinc-200 dark:border-[#24271F] rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col gap-3.5 animate-in fade-in slide-in-from-bottom-4 duration-200 overflow-hidden relative"
    >
      {/* Top delicate acid lime accent line */}
      <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-[#d5ff38]/60 to-transparent" />

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3.5">
          {/* Official brand logo emblem with acid lime indicator */}
          <div className="relative w-11 h-11 rounded-xl bg-black dark:bg-[#18191E] flex items-center justify-center p-2 border border-[#24271F] shadow-md shrink-0">
            <Image
              src="/logo_white_v2.png"
              alt="SkillsCatalyst"
              width={32}
              height={32}
              className="w-full h-full object-contain"
              priority
            />
            {/* Acid lime live notification indicator */}
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#d5ff38] opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#d5ff38] border-2 border-white dark:border-[#10110E]" />
            </span>
          </div>

          <div className="pt-0.5">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-black dark:text-white tracking-tight">
                Stay updated
              </h4>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#d5ff38]/15 text-[#10110E] dark:text-[#d5ff38] border border-[#d5ff38]/30">
                Updates
              </span>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-1 leading-relaxed">
              Get notifications about streaks, new events and scholarships.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDismiss}
          className="text-zinc-400 hover:text-black dark:hover:text-white p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors cursor-pointer shrink-0"
          aria-label="Dismiss banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {errorMessage && (
        <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-[11px] leading-relaxed animate-in fade-in">
          {errorMessage}
        </div>
      )}

      <div className="flex items-center justify-end gap-2 pt-1 border-t border-zinc-100 dark:border-[#24271F]">
        <button
          type="button"
          onClick={handleDismiss}
          className="px-3.5 py-1.5 text-xs font-medium text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white transition-colors rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800/60 cursor-pointer"
        >
          Not now
        </button>
        <button
          type="button"
          onClick={handleEnable}
          disabled={isSubscribing}
          className="px-4 py-2 text-xs font-bold text-black bg-[#d5ff38] hover:bg-[#c4ec32] active:scale-[0.98] rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          {isSubscribing ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-black/40 border-t-black rounded-full animate-spin" />
              <span>Enabling...</span>
            </>
          ) : (
            <>
              <Bell className="w-3.5 h-3.5 text-black" strokeWidth={2.2} />
              <span>Enable Notifications</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
