"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Search,
  ChevronDown,
  Settings,
  LogOut,
  User,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import ThemeSwitch from "@/components/ThemeSwitch";

interface TopNavbarProps {
  onOpenSearch?: () => void;
}

export default function TopNavbar({ onOpenSearch }: TopNavbarProps) {
  const router = useRouter();
  const { session, logout } = useAuth();

  const [activeWorkspace, setActiveWorkspace] = useState("SkillsCatalyst");
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const userDisplayName = session?.name || "Adithya goud Palamoor";
  
  // Generate user initials (defaults to 'AG' as shown in the screenshot)
  const userInitials = React.useMemo(() => {
    if (!session?.name && !session?.email) return "AG";
    const parts = (session?.name || session?.email?.split("@")[0] || "AG").trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return (parts[0].slice(0, 2)).toUpperCase() || "AG";
  }, [session]);

  const handleSearchClick = () => {
    if (onOpenSearch) {
      onOpenSearch();
    } else {
      // Trigger Command+K event
      window.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "k",
          metaKey: true,
          bubbles: true,
        })
      );
    }
  };

  return (
    <header className="hidden md:flex w-full h-14 bg-white/60 backdrop-blur-md border-b border-white/40 sticky top-0 z-40 px-3 sm:px-5 items-center justify-between select-none">
      {/* ── Left: Official SkillsCatalyst Brand Logo + Dropdown ── */}
      <div className="flex items-center gap-2">
        <div className="relative">
          <button
            onClick={() => setIsWorkspaceOpen(!isWorkspaceOpen)}
            className="flex items-center gap-2.5 px-1.5 py-1 rounded-lg hover:bg-slate-100 transition-colors group cursor-pointer"
          >
            {/* Official SkillsCatalyst Logo */}
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center p-1 shadow-xs shrink-0 overflow-hidden group-hover:scale-105 transition-transform">
              <Image
                src="/logo.png"
                alt="SkillsCatalyst"
                width={28}
                height={28}
                className="w-full h-full object-contain"
                priority
              />
            </div>

            {/* Official Brand Title */}
            <span className="font-extrabold text-[15px] text-slate-900 tracking-tight group-hover:text-[#5227FF] transition-colors">
              {activeWorkspace}
            </span>

            {/* Down Chevron */}
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-500 group-hover:text-slate-900 transition-transform duration-150 ${
                isWorkspaceOpen ? "rotate-180" : ""
              }`}
              strokeWidth={2}
            />
          </button>

          {/* Workspace Dropdown */}
          {isWorkspaceOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsWorkspaceOpen(false)} />
              <div className="absolute top-[46px] left-0 w-56 bg-white border border-slate-200/90 rounded-xl shadow-xl shadow-slate-900/10 z-50 py-1.5 flex flex-col animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Workspaces
                </div>
                {["SkillsCatalyst", "Personal Sandbox", "Interview Prep"].map((ws) => (
                  <button
                    key={ws}
                    onClick={() => {
                      setActiveWorkspace(ws);
                      setIsWorkspaceOpen(false);
                    }}
                    className={`px-3 py-2 text-left text-[13px] mx-1 rounded-lg transition-colors cursor-pointer ${
                      activeWorkspace === ws
                        ? "bg-[#5227FF]/10 text-[#5227FF] font-semibold"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {ws}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Right Section: Icons, Badges & Profile ── */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* 1. Search Icon */}
        <button
          onClick={handleSearchClick}
          title="Search (⌘K)"
          className="p-1.5 text-slate-600 hover:text-[#5227FF] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
        >
          <Search className="w-[18px] h-[18px]" strokeWidth={2} />
        </button>

        {/* 2. Theme Toggle Switch */}
        <ThemeSwitch />

        {/* 3. User Initials Avatar */}
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            title={`Account (${userDisplayName})`}
            className="w-8 h-8 rounded-full bg-[#FEF9C3] text-[#713F12] border border-[#FDE047]/60 flex items-center justify-center font-bold text-xs shadow-2xs hover:ring-2 hover:ring-[#5227FF]/20 transition-all cursor-pointer"
          >
            {userInitials}
          </button>

          {/* User Profile Dropdown */}
          {isUserMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)} />
              <div className="absolute right-0 top-[46px] w-56 bg-white border border-slate-200/90 rounded-2xl shadow-xl shadow-slate-900/10 z-50 py-1.5 flex flex-col animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-2 border-b border-slate-100 text-left">
                  <p className="text-xs font-bold text-slate-900 truncate">{userDisplayName}</p>
                  <p className="text-[11px] text-slate-500 truncate">{session?.email || "learner@skillscatalyst.in"}</p>
                </div>
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    router.push("/settings");
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer text-left"
                >
                  <User className="w-3.5 h-3.5 text-slate-500" /> My Profile
                </button>
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    router.push("/settings");
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer text-left"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-500" /> Account Settings
                </button>
                <div className="h-px bg-slate-100 my-1" />
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    logout();
                    router.push("/login");
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-left"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-500" /> Log out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
