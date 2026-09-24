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
  ShieldAlert,
  GraduationCap,
  Bell,
  CheckCheck,
  Trophy,
  Bot,
  FileText,
  Flame,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import ThemeSwitch from "@/components/ThemeSwitch";

interface TopNavbarProps {
  onOpenSearch?: () => void;
}

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  isRead: boolean;
  type: "event" | "mentor" | "streak" | "resume";
  link?: string;
}

export default function TopNavbar({ onOpenSearch }: TopNavbarProps) {
  const router = useRouter();
  const { session, logout, isOwner, appMode, setAppMode } = useAuth();

  const [activeWorkspace, setActiveWorkspace] = useState("SkillsCatalyst");
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notificationFilter, setNotificationFilter] = useState<"all" | "unread">("all");
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filteredNotifications = notifications.filter((n) => {
    if (notificationFilter === "unread") return !n.isRead;
    return true;
  });

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleNotificationClick = (item: NotificationItem) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
    );
    setIsNotificationOpen(false);
    if (item.link) {
      router.push(item.link);
    }
  };

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
    <header className="hidden md:flex w-full h-14 bg-white/60 dark:bg-slate-900/80 backdrop-blur-md border-b border-white/40 dark:border-slate-800 sticky top-0 z-40 px-3 sm:px-5 items-center justify-between select-none">
      {/* ── Left: Official SkillsCatalyst Brand Logo + Dropdown ── */}
      <div className="flex items-center gap-2">
        <div className="relative">
          <button
            onClick={() => {
              setIsWorkspaceOpen(!isWorkspaceOpen);
              setIsUserMenuOpen(false);
              setIsNotificationOpen(false);
            }}
            className="flex items-center gap-2.5 px-1.5 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group cursor-pointer"
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
            <span className="font-extrabold text-[15px] text-slate-900 dark:text-white tracking-tight group-hover:text-[#5227FF] transition-colors">
              {activeWorkspace}
            </span>

            {/* Down Chevron */}
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white transition-transform duration-150 ${
                isWorkspaceOpen ? "rotate-180" : ""
              }`}
              strokeWidth={2}
            />
          </button>

          {/* Workspace Dropdown */}
          {isWorkspaceOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsWorkspaceOpen(false)} />
              <div className="absolute top-[46px] left-0 w-56 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-xl shadow-slate-900/10 z-50 py-1.5 flex flex-col animate-in fade-in zoom-in-95 duration-100">
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
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
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
        {/* Owner Quick Mode Switcher (Visible strictly to authenticated Platform Owner) */}
        {isOwner && (
          <button
            onClick={() => setAppMode(appMode === "admin" ? "student" : "admin")}
            title={appMode === "admin" ? "Switch to Student Mode" : "Switch to Admin Mode"}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              appMode === "admin"
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm shadow-purple-500/25 hover:brightness-105"
                : "bg-[#5227FF]/10 text-[#5227FF] hover:bg-[#5227FF]/15 border border-[#5227FF]/20"
            }`}
          >
            {appMode === "admin" ? (
              <>
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Admin CMS</span>
              </>
            ) : (
              <>
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Student Mode</span>
              </>
            )}
          </button>
        )}

        {/* 1. Search Icon */}
        <button
          onClick={handleSearchClick}
          title="Search (⌘K)"
          className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-[#5227FF] hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
        >
          <Search className="w-[18px] h-[18px]" strokeWidth={2} />
        </button>

        {/* 2. Notification Symbol & Dropdown Panel */}
        <div className="relative">
          <button
            id="desktop-notifications-button"
            onClick={() => {
              setIsNotificationOpen(!isNotificationOpen);
              setIsUserMenuOpen(false);
              setIsWorkspaceOpen(false);
            }}
            title="Notifications"
            aria-label="Open notifications"
            className={`relative p-1.5 rounded-lg transition-colors cursor-pointer group ${
              isNotificationOpen
                ? "text-[#5227FF] bg-[#5227FF]/10 dark:bg-[#5227FF]/20"
                : "text-slate-600 dark:text-slate-300 hover:text-[#5227FF] hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Bell
              className="w-[18px] h-[18px] transition-transform duration-200 group-hover:rotate-12"
              strokeWidth={2}
            />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#EAB308] ring-1.5 ring-white dark:ring-slate-900" />
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {isNotificationOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsNotificationOpen(false)}
              />
              <div className="absolute right-0 top-[46px] w-80 sm:w-92 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xl shadow-slate-900/10 z-50 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-100">
                {/* Header */}
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                      Notifications
                    </span>
                    {unreadCount > 0 ? (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-[#5227FF]/10 text-[#5227FF] dark:bg-[#5227FF]/25 dark:text-purple-300 rounded-full">
                        {unreadCount} new
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 rounded-full">
                        All caught up
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="flex items-center gap-1 text-[11px] font-semibold text-[#5227FF] hover:text-[#431ce0] dark:text-purple-400 transition-colors cursor-pointer"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>Mark all read</span>
                    </button>
                  )}
                </div>

                {/* Filter Tabs (only shown when notifications exist) */}
                {notifications.length > 0 && (
                  <div className="px-3 pt-2 pb-1.5 flex items-center gap-1 bg-slate-50/70 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-800/80">
                    <button
                      onClick={() => setNotificationFilter("all")}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        notificationFilter === "all"
                          ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs"
                          : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
                      }`}
                    >
                      All ({notifications.length})
                    </button>
                    <button
                      onClick={() => setNotificationFilter("unread")}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        notificationFilter === "unread"
                          ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs"
                          : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
                      }`}
                    >
                      Unread ({unreadCount})
                    </button>
                  </div>
                )}

                {/* Notifications List */}
                <div className="max-h-84 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredNotifications.length === 0 ? (
                    <div className="py-10 px-6 text-center flex flex-col items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-2.5">
                        <Bell className="w-5 h-5 text-slate-400" />
                      </div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        No notifications yet
                      </p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 max-w-[220px] leading-relaxed">
                        You are all caught up! Updates and announcements will appear here.
                      </p>
                    </div>
                  ) : (
                    filteredNotifications.map((notif) => {
                      const Icon =
                        notif.type === "event"
                          ? Trophy
                          : notif.type === "mentor"
                          ? Bot
                          : notif.type === "resume"
                          ? FileText
                          : Flame;

                      const iconColors =
                        notif.type === "event"
                          ? "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400"
                          : notif.type === "mentor"
                          ? "bg-[#5227FF]/10 text-[#5227FF] dark:bg-[#5227FF]/20 dark:text-purple-400"
                          : notif.type === "resume"
                          ? "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400"
                          : "bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400";

                      return (
                        <button
                          key={notif.id}
                          onClick={() => handleNotificationClick(notif)}
                          className={`w-full p-3 flex items-start gap-3 text-left transition-colors cursor-pointer group ${
                            !notif.isRead
                              ? "bg-[#5227FF]/[0.03] dark:bg-[#5227FF]/[0.06] hover:bg-slate-100/80 dark:hover:bg-slate-800/60"
                              : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                          }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center transition-transform group-hover:scale-105 ${iconColors}`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1 mb-0.5">
                              <p
                                className={`text-xs truncate ${
                                  !notif.isRead
                                    ? "font-bold text-slate-900 dark:text-white"
                                    : "font-medium text-slate-700 dark:text-slate-300"
                                }`}
                              >
                                {notif.title}
                              </p>
                              {!notif.isRead && (
                                <span className="w-2 h-2 rounded-full bg-[#5227FF] shrink-0" />
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                              {notif.description}
                            </p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-medium">
                              {notif.time}
                            </p>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>

                {/* Footer */}
                <div className="p-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 px-2 font-medium">SkillsCatalyst Alerts</span>
                  <button
                    onClick={() => {
                      setIsNotificationOpen(false);
                      router.push("/settings");
                    }}
                    className="text-slate-600 dark:text-slate-400 hover:text-[#5227FF] dark:hover:text-purple-300 font-semibold px-2 py-1 rounded transition-colors cursor-pointer"
                  >
                    Preferences
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* 3. Theme Toggle Switch */}
        <ThemeSwitch />

        {/* 4. User Initials Avatar */}
        <div className="relative">
          <button
            onClick={() => {
              setIsUserMenuOpen(!isUserMenuOpen);
              setIsNotificationOpen(false);
              setIsWorkspaceOpen(false);
            }}
            title={`Account (${userDisplayName})`}
            className="w-8 h-8 rounded-full bg-[#FEF9C3] text-[#713F12] border border-[#FDE047]/60 flex items-center justify-center font-bold text-xs shadow-2xs hover:ring-2 hover:ring-[#5227FF]/20 transition-all cursor-pointer"
          >
            {userInitials}
          </button>

          {/* User Profile Dropdown */}
          {isUserMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)} />
              <div className="absolute right-0 top-[46px] w-60 bg-white border border-slate-200/90 rounded-2xl shadow-xl shadow-slate-900/10 z-50 py-1.5 flex flex-col animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-2 border-b border-slate-100 text-left">
                  <p className="text-xs font-bold text-slate-900 truncate">{userDisplayName}</p>
                  <p className="text-[11px] text-slate-500 truncate">{session?.email || "learner@skillscatalyst.in"}</p>
                </div>

                {/* Owner Mode Switcher Segment (Strictly for Platform Owner) */}
                {isOwner && (
                  <div className="px-3 py-2.5 border-b border-slate-100 bg-slate-50/70">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Workspace Mode
                      </span>
                      <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200">
                        Owner
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 p-0.5 bg-slate-200/80 rounded-lg">
                      <button
                        onClick={() => {
                          setAppMode("student");
                          setIsUserMenuOpen(false);
                        }}
                        className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                          appMode === "student"
                            ? "bg-white text-slate-900 shadow-2xs font-bold"
                            : "text-slate-500 hover:text-slate-900"
                        }`}
                      >
                        <GraduationCap className="w-3.5 h-3.5 text-[#5227FF]" />
                        <span>Student</span>
                      </button>
                      <button
                        onClick={() => {
                          setAppMode("admin");
                          setIsUserMenuOpen(false);
                        }}
                        className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                          appMode === "admin"
                            ? "bg-purple-600 text-white shadow-2xs font-bold"
                            : "text-slate-500 hover:text-slate-900"
                        }`}
                      >
                        <ShieldAlert className="w-3.5 h-3.5 text-white" />
                        <span>Admin</span>
                      </button>
                    </div>
                  </div>
                )}

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
