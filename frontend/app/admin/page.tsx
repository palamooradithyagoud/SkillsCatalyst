"use client";


import React, { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ShieldAlert,
  GraduationCap,
  Users,
  Trophy,
  Award,
  Newspaper,
  MessageSquare,
  Activity,
  ArrowRight,
  Database,
  RefreshCw,
  LogOut,
  ChevronRight,
  Sparkles,
  BookOpen,
  CreditCard,
  Tag,
  IndianRupee,
  CalendarCheck,
  Lock,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { apiFetch, getAuthHeaders, API_BASE } from "@/lib/api/client";
import { fetchMyPermissions, CallerPermissionsResponse } from "@/lib/api/permissions";
import AdminEventsCMS from "@/components/admin/AdminEventsCMS";
import AdminScholarshipsCMS from "@/components/admin/AdminScholarshipsCMS";
import AdminTechNewsCMS from "@/components/admin/AdminTechNewsCMS";
import AdminSkillBitsCMS from "@/components/admin/AdminSkillBitsCMS";
import AdminPlansCMS from "@/components/admin/AdminPlansCMS";
import AdminCouponsCMS from "@/components/admin/AdminCouponsCMS";
import AdminPaymentsCMS from "@/components/admin/AdminPaymentsCMS";
import AdminSubscriptionsCMS from "@/components/admin/AdminSubscriptionsCMS";
import AdminUserGovernance from "@/components/admin/AdminUserGovernance";

type AdminTab =
  | "overview"
  | "hackathons"
  | "scholarships"
  | "news"
  | "community"
  | "users"
  | "skillbits"
  | "plans"
  | "coupons"
  | "payments"
  | "subscriptions";

interface AdminOverviewData {
  stats: {
    total_users: number;
    total_students: number;
    total_owners: number;
    academic_profiles_active: number;
    cms_modules: {
      hackathons: number;
      scholarships: number;
      news_updates: number;
      community_threads: number;
    };
  };
  platform_status: {
    mode: string;
    security_tier: string;
    rbac_enforced: boolean;
  };
}

export default function AdminPage() {
  const router = useRouter();
  const { session, isLoading, isOwner, isAdmin, setAppMode, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [overviewData, setOverviewData] = useState<AdminOverviewData | null>(null);
  const [callerPerms, setCallerPerms] = useState<CallerPermissionsResponse | null>(null);
  const [permsLoading, setPermsLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Client-side UX authorization guard: only owner and admin can access /admin
  useEffect(() => {
    if (!isLoading) {
      if (!session) {
        router.replace("/login?next=/admin");
      } else if (!isOwner && !isAdmin) {
        router.replace("/dashboard");
      }
    }
  }, [session, isLoading, isOwner, isAdmin, router]);

  // Fetch verified caller permissions from backend
  useEffect(() => {
    let active = true;
    if (!session) {
      setPermsLoading(false);
      return;
    }

    (async () => {
      try {
        // Only show blocking full-page loader on initial cold load before callerPerms is populated
        setCallerPerms((current) => {
          if (!current) setPermsLoading(true);
          return current;
        });
        const perms = await fetchMyPermissions();
        if (active) {
          setCallerPerms(perms);
        }
      } catch (err: unknown) {
        console.warn("Notice: caller permissions verification:", err);
      } finally {
        if (active) {
          setPermsLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [session?.user_id]);

  const isAuthoritativeOwner = callerPerms?.is_owner ?? isOwner;
  const userPermissions = useMemo(() => callerPerms?.permissions || [], [callerPerms]);

  // Fetch admin telemetry
  const refreshAdminData = useCallback(async () => {
    setDataLoading(true);
    setErrorMsg(null);
    try {
      const headers = await getAuthHeaders();
      const ovRes = await apiFetch(`${API_BASE}/api/admin/overview`, { headers });

      if (ovRes.ok) {
        const ovJson = await ovRes.json();
        setOverviewData(ovJson);
      } else if (ovRes.status === 403) {
        setErrorMsg("Access Denied: Administrative permissions required by backend authorization.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load admin telemetry.";
      setErrorMsg(msg);
    } finally {
      setDataLoading(false);
    }
  }, []);

  const handleUserCountChange = useCallback((cnt: number) => {
    setOverviewData((prev) => {
      if (!prev || prev.stats.total_users === cnt) return prev;
      return {
        ...prev,
        stats: {
          ...prev.stats,
          total_users: cnt,
        },
      };
    });
  }, []);

  useEffect(() => {
    let active = true;
    if (!session || (!isOwner && !isAdmin)) return;

    void (async () => {
      try {
        const headers = await getAuthHeaders();
        const ovRes = await apiFetch(`${API_BASE}/api/admin/overview`, { headers });

        if (!active) return;
        if (ovRes.ok) {
          const ovJson = await ovRes.json();
          setOverviewData(ovJson);
        } else if (ovRes.status === 403) {
          setErrorMsg("Access Denied: Administrative permissions required by backend authorization.");
        }
      } catch (err: unknown) {
        if (!active) return;
        const msg = err instanceof Error ? err.message : "Failed to load admin telemetry.";
        setErrorMsg(msg);
      } finally {
        if (active) {
          setDataLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [session?.user_id, isOwner, isAdmin]);

  // Dynamic Navigation Tabs filtered strictly by caller's authoritative permissions
  const tabs = useMemo(() => {
    const allTabs: {
      id: AdminTab;
      label: string;
      icon: React.ElementType;
      badge?: number;
      ownerOnly?: boolean;
      requiredSection?: string;
    }[] = [
      { id: "overview", label: "Overview", icon: Activity },
      { id: "payments", label: "Payments & Revenue", icon: IndianRupee, ownerOnly: true },
      { id: "subscriptions", label: "Subscriptions", icon: CalendarCheck, ownerOnly: true },
      {
        id: "hackathons",
        label: "Events & Hackathons",
        icon: Trophy,
        badge: overviewData?.stats.cms_modules.hackathons,
        requiredSection: "events",
      },
      {
        id: "scholarships",
        label: "Scholarships",
        icon: Award,
        badge: overviewData?.stats.cms_modules.scholarships,
        requiredSection: "scholarships",
      },
      {
        id: "news",
        label: "Curated News",
        icon: Newspaper,
        badge: overviewData?.stats.cms_modules.news_updates,
        requiredSection: "tech_news",
      },
      { id: "community", label: "Community", icon: MessageSquare, badge: overviewData?.stats.cms_modules.community_threads, ownerOnly: true },
      { id: "users", label: "User Governance", icon: Users, badge: overviewData?.stats.total_users, ownerOnly: true },
      { id: "skillbits", label: "SkillBits", icon: Sparkles, ownerOnly: true },
      { id: "plans", label: "Plans & Pricing", icon: CreditCard, ownerOnly: true },
      { id: "coupons", label: "Coupons & Discounts", icon: Tag, ownerOnly: true },
    ];

    if (isAuthoritativeOwner) {
      return allTabs;
    }

    // Delegated Admins only receive explicitly permitted content sections
    return allTabs.filter((tab) => {
      if (tab.ownerOnly) return false;
      if (tab.id === "overview") return true;
      if (tab.id === "hackathons") {
        return userPermissions.some((p) => p.startsWith("events.") || p.startsWith("hackathons."));
      }
      if (tab.id === "scholarships") {
        return userPermissions.some((p) => p.startsWith("scholarships."));
      }
      if (tab.id === "news") {
        return userPermissions.some((p) => p.startsWith("tech_news."));
      }
      return false;
    });
  }, [isAuthoritativeOwner, userPermissions, overviewData]);

  // Ensure active tab is valid for current caller permissions
  useEffect(() => {
    if (tabs.length > 0 && !tabs.some((t) => t.id === activeTab)) {
      setActiveTab(tabs[0].id);
    }
  }, [tabs, activeTab]);

  // Loading state while credentials and permissions are verified (only on initial cold load)
  if (isLoading || (permsLoading && !callerPerms)) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-900 text-white p-6">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-purple-400" />
          <p className="text-sm font-semibold text-slate-300">Verifying administrative credentials...</p>
        </div>
      </div>
    );
  }

  // If unauthenticated or unauthorized role
  if (!session || (!isOwner && !isAdmin)) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-900 text-white p-6">
        <div className="max-w-md w-full bg-slate-800/90 border border-slate-700/80 rounded-2xl p-8 text-center shadow-2xl backdrop-blur-md">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold mb-2">Restricted Access</h2>
          <p className="text-sm text-slate-400 mb-6">
            This administration console is strictly restricted to authenticated platform owners and delegated administrators.
          </p>
          <button
            onClick={() => router.replace("/dashboard")}
            className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm transition-colors cursor-pointer"
          >
            Return to Student Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#0B0D17] text-slate-100 flex flex-col font-sans">
      {/* ── Top Navigation Bar ── */}
      <header className="h-16 w-full bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-50">
        {/* Left: Brand + Owner Badge */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center p-1.5 shadow-md shadow-purple-500/20">
            <Image
              src="/logo_white_v2.png"
              alt="SkillsCatalyst"
              width={26}
              height={26}
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-white">SkillsCatalyst</span>
              <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Admin CMS
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">Authoritative Platform Governance</p>
          </div>
        </div>

        {/* Right: Mode Switcher & User Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Active Mode Banner Switcher */}
          <div className="flex items-center bg-slate-800/90 border border-slate-700/80 p-1 rounded-xl shadow-inner">
            <button
              onClick={() => setAppMode("student")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer"
            >
              <GraduationCap className="w-3.5 h-3.5 text-[#5227FF]" />
              <span className="hidden sm:inline">Student Mode</span>
            </button>
            <div className="w-px h-4 bg-slate-700 mx-1" />
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm shadow-purple-500/30">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Admin Mode</span>
            </div>
          </div>

          <button
            onClick={() => refreshAdminData()}
            title="Refresh Telemetry"
            aria-label="Refresh Telemetry"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${dataLoading ? "animate-spin text-purple-400" : ""}`} />
          </button>

          <button
            onClick={logout}
            title="Log out"
            aria-label="Log out"
            className="p-2 rounded-xl bg-slate-800 hover:bg-rose-900/30 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ── Subheader Notice ── */}
      <div className="bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-slate-900 border-b border-purple-800/20 px-4 sm:px-8 py-2.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-purple-300">
          <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
          <span>
            Authenticated as <strong>{session.email}</strong> &bull; Database Role:{" "}
            <span className="text-emerald-400 uppercase font-mono font-bold">
              {isAuthoritativeOwner ? "owner" : "admin"}
            </span>
            {!isAuthoritativeOwner && (
              <span className="text-purple-300 ml-1.5 font-medium">
                ({userPermissions.length} Active Permissions)
              </span>
            )}
          </span>
        </div>
        <button
          onClick={() => setAppMode("student")}
          className="text-purple-400 hover:text-purple-200 font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
        >
          <span>Open Learner Experience</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* ── Main Layout: Sidebar Tabs & Content ── */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 gap-6">
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-60 shrink-0 flex md:flex-col gap-1.5 overflow-x-auto pb-2 md:pb-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/25 font-bold"
                    : "text-slate-400 hover:bg-slate-800/80 hover:text-slate-200"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </div>
                {tab.badge !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      isActive ? "bg-white/20 text-white" : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </aside>

        {/* Dynamic Content Panel */}
        <main className="flex-1 min-w-0 space-y-6">
          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/40 text-rose-300 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Stat Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-400">Total Registered</span>
                    <Users className="w-4 h-4 text-purple-400" />
                  </div>
                  <p className="text-2xl font-extrabold text-white">
                    {overviewData?.stats.total_users ?? "--"}
                  </p>
                  <p className="text-[11px] text-emerald-400 mt-1 font-medium">Platform Students &amp; Learners</p>
                </div>

                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-400">Active Streaks</span>
                    <Activity className="w-4 h-4 text-amber-400" />
                  </div>
                  <p className="text-2xl font-extrabold text-white">
                    {overviewData?.stats.academic_profiles_active ?? "--"}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1 font-medium">Profiles with Active Learning</p>
                </div>

                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-400">CMS Opportunities</span>
                    <Trophy className="w-4 h-4 text-indigo-400" />
                  </div>
                  <p className="text-2xl font-extrabold text-white">
                    {(overviewData?.stats.cms_modules.hackathons || 0) +
                      (overviewData?.stats.cms_modules.scholarships || 0)}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1 font-medium">Hackathons &amp; Scholarships</p>
                </div>

                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-400">RBAC Security Tier</span>
                    <ShieldAlert className="w-4 h-4 text-emerald-400" />
                  </div>
                  <p className="text-xl font-extrabold text-emerald-400">Enforced</p>
                  <p className="text-[11px] text-slate-400 mt-1 font-medium">Supabase Auth app_metadata</p>
                </div>
              </div>

              {/* System Infrastructure Health Card */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Database className="w-4 h-4 text-purple-400" />
                  Infrastructure &amp; Authorization Health
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-slate-200">Supabase PostgreSQL</p>
                      <p className="text-[11px] text-slate-400">Authoritative Database</p>
                    </div>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-slate-200">FastAPI Backend</p>
                      <p className="text-[11px] text-slate-400">require_owner RBAC</p>
                    </div>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-slate-200">Owner Session</p>
                      <p className="text-[11px] text-slate-400">Verified JWT Claim</p>
                    </div>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
                  </div>
                </div>
              </div>

              {/* Quick CMS Management Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div
                  onClick={() => setActiveTab("scholarships")}
                  className="bg-slate-900/90 hover:bg-slate-800/80 border border-slate-800 hover:border-purple-500/40 rounded-2xl p-5 cursor-pointer transition-all group shadow-sm"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                      <Award className="w-5 h-5" />
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1">Manage Scholarships &amp; Grants</h4>
                  <p className="text-xs text-slate-400">
                    Curate scholarship listings, eligibility requirements, funding deadlines, and application links.
                  </p>
                </div>

                <div
                  onClick={() => setActiveTab("hackathons")}
                  className="bg-slate-900/90 hover:bg-slate-800/80 border border-slate-800 hover:border-purple-500/40 rounded-2xl p-5 cursor-pointer transition-all group shadow-sm"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                      <Trophy className="w-5 h-5" />
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1">Manage Hackathons &amp; Challenges</h4>
                  <p className="text-xs text-slate-400">
                    Publish, edit, and curate nationwide hackathons and student tech events.
                  </p>
                </div>

                <div
                  onClick={() => setActiveTab("users")}
                  className="bg-slate-900/90 hover:bg-slate-800/80 border border-slate-800 hover:border-purple-500/40 rounded-2xl p-5 cursor-pointer transition-all group shadow-sm"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                      <Users className="w-5 h-5" />
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1">User &amp; Role Management</h4>
                  <p className="text-xs text-slate-400">
                    Review registered learners, verify student accounts, and view authorization status.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: EVENTS & HACKATHONS CMS */}
          {activeTab === "hackathons" && (
            <AdminEventsCMS onEventCountChange={refreshAdminData} />
          )}

          {/* TAB 3: SCHOLARSHIPS CMS */}
          {activeTab === "scholarships" && (
            <AdminScholarshipsCMS onScholarshipCountChange={refreshAdminData} />
          )}

          {/* TAB 4: NEWS */}
          {activeTab === "news" && (
            <AdminTechNewsCMS onNewsCountChange={refreshAdminData} />
          )}

          {/* TAB 5: COMMUNITY */}
          {activeTab === "community" && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Community &amp; Content Moderation</h3>
                  <p className="text-xs text-slate-400">Monitor peer interactions, questions, and discussion topics.</p>
                </div>
                <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Moderation Active
                </span>
              </div>
              <div className="p-8 text-center border border-dashed border-slate-700 rounded-xl space-y-2">
                <MessageSquare className="w-8 h-8 text-emerald-400 mx-auto" />
                <p className="text-sm font-semibold text-slate-300">Community Hub Clean &amp; Active</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Zero flagged threads. Student community operates under strict guidelines.
                </p>
              </div>
            </div>
          )}

          {/* TAB 6: USERS */}
          {activeTab === "users" && (
            isAuthoritativeOwner ? (
              <AdminUserGovernance onUserCountChange={handleUserCountChange} />
            ) : (
              <div className="p-8 rounded-2xl bg-slate-900/90 border border-slate-800 text-center">
                <ShieldAlert className="w-8 h-8 text-rose-400 mx-auto mb-2" />
                <h3 className="text-base font-bold text-white">Access Denied</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                  User governance and role management is strictly restricted to the verified platform owner.
                </p>
              </div>
            )
          )}

          {/* TAB 7: SKILLBITS CMS & VIDEO PIPELINE */}
          {activeTab === "skillbits" && (
            <div className="animate-in fade-in duration-150">
              <AdminSkillBitsCMS />
            </div>
          )}

          {/* TAB 8: PLANS & PRICING CMS */}
          {activeTab === "plans" && (
            <div className="animate-in fade-in duration-150">
              <AdminPlansCMS />
            </div>
          )}

          {/* TAB 9: COUPONS & DISCOUNTS CMS */}
          {activeTab === "coupons" && (
            <div className="animate-in fade-in duration-150">
              <AdminCouponsCMS />
            </div>
          )}

          {/* TAB 10: PAYMENTS & REVENUE DASHBOARD */}
          {activeTab === "payments" && (
            <div className="animate-in fade-in duration-150">
              <AdminPaymentsCMS />
            </div>
          )}

          {/* TAB 11: SUBSCRIPTIONS LIFECYCLE ROSTER */}
          {activeTab === "subscriptions" && (
            <div className="animate-in fade-in duration-150">
              <AdminSubscriptionsCMS />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
