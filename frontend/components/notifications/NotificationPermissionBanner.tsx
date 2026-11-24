"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Bell, MapPin, ChevronRight, Loader2, CheckCircle2 } from "lucide-react";
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
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [justSubscribed, setJustSubscribed] = useState<boolean>(false);

  // User toggle preferences inside modal
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);
  const [locationEnabled, setLocationEnabled] = useState<boolean>(true);

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

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      localStorage.setItem("skillscatalyst_notif_banner_dismissed", Date.now().toString());
    } catch {}
  };

  const handleContinue = async () => {
    setIsSubmitting(true);
    try {
      // 1. Request Push Notifications if toggled on
      if (notificationsEnabled) {
        await requestPushPermission();
      }

      // 2. Request Location if toggled on
      if (locationEnabled && typeof window !== "undefined" && "geolocation" in navigator) {
        await new Promise<void>((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              try {
                localStorage.setItem(
                  "sc_user_location",
                  JSON.stringify({
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                    timestamp: Date.now(),
                  })
                );
              } catch {}
              resolve();
            },
            () => {
              // Permission denied or timed out; fail silently and gracefully
              resolve();
            },
            { timeout: 6000, maximumAge: 3600000 }
          );
        });
      }

      // Mark modal dismissed with 30-day cooldown after user makes explicit choice
      try {
        localStorage.setItem("skillscatalyst_notif_banner_dismissed", Date.now().toString());
      } catch {}

      setJustSubscribed(true);
      setTimeout(() => {
        setIsDismissed(true);
      }, 1500);
    } catch {
      // Fail closed and gracefully dismiss
      handleDismiss();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!session || isAuthLoading || isExcludedRoute || isDismissed || !isPushSupported || isPushSubscribed) {
    return null;
  }

  // Toast confirmation when user finishes enabling
  if (justSubscribed) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
        <div className="max-w-sm w-full bg-[#141519] border border-white/10 rounded-2xl p-5 shadow-2xl flex items-center gap-3.5 animate-in zoom-in-95 duration-200">
          <div className="w-10 h-10 rounded-xl bg-[#1C1D22] flex items-center justify-center shrink-0 border border-[#D5FF38]/40 shadow-xs">
            <CheckCircle2 className="w-5 h-5 text-[#D5FF38]" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Preferences Saved!</p>
            <p className="text-xs text-neutral-400 mt-0.5">You are now all set to receive timely updates.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="stay-in-loop-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleDismiss();
      }}
      className="fixed inset-0 z-50 flex flex-col justify-end items-center px-4 pb-6 sm:pb-8 sm:justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300 overflow-y-auto"
    >
      {/* ── Modal Card Container ── */}
      <div className="relative w-full max-w-[380px] sm:max-w-[400px] bg-[#16171B] border border-white/[0.08] rounded-[32px] p-5 sm:p-6 shadow-[0_25px_70px_rgba(0,0,0,0.95)] text-white overflow-visible animate-in zoom-in-95 duration-300 sm:translate-y-10 md:translate-y-12">
        {/* ── 3D Penguin Mascot peeking over the top border ── */}
        <div className="absolute -top-[136px] sm:-top-[144px] left-1/2 -translate-x-1/2 w-[250px] sm:w-[270px] pointer-events-none select-none z-30 flex justify-center">
          <Image
            src="/images/dashboard/penguin_loop_prompt.png"
            alt="SkillsCatalyst Mascot"
            width={884}
            height={550}
            unoptimized
            priority
            className="w-full h-auto object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.65)]"
          />
        </div>

        {/* ── Header: Title & Subtitle ── */}
        <div className="text-center pt-1 select-none">
          <h2
            id="stay-in-loop-title"
            className="text-2xl sm:text-[25px] font-black text-white tracking-tight leading-tight"
          >
            Stay in the <span className="text-[#D5FF38]">Loop!</span>
          </h2>
          <p className="text-xs sm:text-[13px] text-neutral-400 mt-1.5 leading-relaxed px-1 max-w-[320px] mx-auto">
            Allow notifications and location to get timely updates, track your progress and never miss out!
          </p>
        </div>

        {/* ── Options Stack ── */}
        <div className="mt-5 space-y-3">
          {/* Row 1: Notifications */}
          <div className="flex items-center justify-between p-3 sm:p-3.5 rounded-2xl bg-[#1E2026] border border-white/[0.06] transition-colors">
            <div className="flex items-center gap-3 pr-2 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-[#282A33] border border-white/[0.04] flex items-center justify-center shrink-0 shadow-xs">
                <Bell className="w-5 h-5 text-[#D5FF38] fill-[#D5FF38]" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-white tracking-tight">Notifications</p>
                <p className="text-[11px] sm:text-xs text-neutral-400 leading-snug mt-0.5">
                  Get important updates, reminders and more.
                </p>
              </div>
            </div>

            {/* Toggle Switch */}
            <button
              type="button"
              role="switch"
              aria-checked={notificationsEnabled}
              aria-label="Toggle notifications permission"
              onClick={() => setNotificationsEnabled((prev) => !prev)}
              className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-none ${
                notificationsEnabled ? "bg-[#D5FF38]" : "bg-[#353742]"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                  notificationsEnabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Row 2: Location */}
          <div className="flex items-center justify-between p-3 sm:p-3.5 rounded-2xl bg-[#1E2026] border border-white/[0.06] transition-colors">
            <div className="flex items-center gap-3 pr-2 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-[#282A33] border border-white/[0.04] flex items-center justify-center shrink-0 shadow-xs">
                <div className="relative flex flex-col items-center justify-center w-6 h-6">
                  <MapPin className="w-5 h-5 text-[#D5FF38] stroke-[2.4] -mb-0.5" />
                  <div className="w-3.5 h-1 rounded-full border-[1.5px] border-[#D5FF38]" />
                </div>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-white tracking-tight">Location</p>
                <p className="text-[11px] sm:text-xs text-neutral-400 leading-snug mt-0.5">
                  Get personalized content and location-based insights.
                </p>
              </div>
            </div>

            {/* Toggle Switch */}
            <button
              type="button"
              role="switch"
              aria-checked={locationEnabled}
              aria-label="Toggle location permission"
              onClick={() => setLocationEnabled((prev) => !prev)}
              className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-none ${
                locationEnabled ? "bg-[#D5FF38]" : "bg-[#353742]"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                  locationEnabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {/* ── Primary Action: Continue Button ── */}
        <div className="mt-5">
          <button
            type="button"
            onClick={handleContinue}
            disabled={isSubmitting}
            className="w-full py-3.5 px-5 rounded-full bg-[#D5FF38] text-black font-extrabold text-sm sm:text-[15px] flex items-center justify-center gap-2 shadow-lg shadow-[#D5FF38]/20 hover:bg-[#cbf526] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-black" />
                <span>Saving preferences...</span>
              </>
            ) : (
              <>
                <span>Continue</span>
                <ChevronRight className="w-5 h-5 stroke-[3]" />
              </>
            )}
          </button>
        </div>

        {/* ── Secondary Action: Not Now Button ── */}
        <div className="mt-2.5 text-center">
          <button
            type="button"
            onClick={handleDismiss}
            disabled={isSubmitting}
            className="text-xs sm:text-[13px] font-semibold text-neutral-400 hover:text-white transition-colors cursor-pointer py-1 px-3"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
