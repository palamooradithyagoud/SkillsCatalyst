"use client";

import React, { useState, useEffect, useCallback } from "react";
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
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { apiFetch, getAuthHeaders, API_BASE } from "@/lib/api/client";

type AdminTab = "overview" | "hackathons" | "scholarships" | "news" | "community" | "users";

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

interface UserItem {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at?: string;
}

export default function AdminPage() {
  const router = useRouter();
  const { session, isLoading, isOwner, setAppMode, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [overviewData, setOverviewData] = useState<AdminOverviewData | null>(null);
  const [usersList, setUsersList] = useState<UserItem[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Client-side UX authorization guard
  useEffect(() => {
    if (!isLoading) {
      if (!session) {
        router.replace("/login?next=/admin");
      } else if (!isOwner) {
        router.replace("/dashboard");
      }
    }
  }, [session, isLoading, isOwner, router]);

  // Fetch admin telemetry
  const refreshAdminData = useCallback(async () => {
    if (!isOwner) return;
    setDataLoading(true);
    setErrorMsg(null);
    try {
      const headers = await getAuthHeaders();
      const [ovRes, usrRes] = await Promise.all([
        apiFetch(`${API_BASE}/api/admin/overview`, { headers }),
        apiFetch(`${API_BASE}/api/admin/users?limit=25`, { headers }),
      ]);

      if (ovRes.ok) {
        const ovJson = await ovRes.json();
        setOverviewData(ovJson);
      } else if (ovRes.status === 403) {
        setErrorMsg("Access Denied: Platform Owner role required by backend authorization.");
      }

      if (usrRes.ok) {
        const usrJson = await usrRes.json();
        setUsersList(usrJson.users || []);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load admin telemetry.";
      setErrorMsg(msg);
    } finally {
      setDataLoading(false);
    }
  }, [isOwner]);

  useEffect(() => {
    let active = true;
    if (!isOwner) return;

    void (async () => {
      try {
        const headers = await getAuthHeaders();
        const [ovRes, usrRes] = await Promise.all([
          apiFetch(`${API_BASE}/api/admin/overview`, { headers }),
          apiFetch(`${API_BASE}/api/admin/users?limit=25`, { headers }),
        ]);

        if (!active) return;
        if (ovRes.ok) {
          const ovJson = await ovRes.json();
          setOverviewData(ovJson);
        } else if (ovRes.status === 403) {
          setErrorMsg("Access Denied: Platform Owner role required by backend authorization.");
        }

        if (usrRes.ok) {
          const usrJson = await usrRes.json();
          setUsersList(usrJson.users || []);
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
  }, [isOwner]);

  // If loading or unauthorized
  if (isLoading || !session || !isOwner) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-900 text-white p-6">
        <div className="max-w-md w-full bg-slate-800/90 border border-slate-700/80 rounded-2xl p-8 text-center shadow-2xl backdrop-blur-md">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold mb-2">Restricted Access</h2>
          <p className="text-sm text-slate-400 mb-6">
            This administration console is strictly restricted to authenticated platform owners.
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

  const tabs: { id: AdminTab; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: "overview", label: "Overview", icon: Activity },
    { id: "hackathons", label: "Hackathons", icon: Trophy, badge: overviewData?.stats.cms_modules.hackathons },
    { id: "scholarships", label: "Scholarships", icon: Award, badge: overviewData?.stats.cms_modules.scholarships },
    { id: "news", label: "Curated News", icon: Newspaper, badge: overviewData?.stats.cms_modules.news_updates },
    { id: "community", label: "Community", icon: MessageSquare, badge: overviewData?.stats.cms_modules.community_threads },
    { id: "users", label: "User Governance", icon: Users, badge: overviewData?.stats.total_users },
  ];

  return (
    <div className="min-h-screen w-full bg-[#0B0D17] text-slate-100 flex flex-col font-sans">
      {/* ── Top Navigation Bar ── */}
      <header className="h-16 w-full bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-50">
        {/* Left: Brand + Owner Badge */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center p-1.5 shadow-md shadow-purple-500/20">
            <Image
              src="/logo.png"
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
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${dataLoading ? "animate-spin text-purple-400" : ""}`} />
          </button>

          <button
            onClick={logout}
            title="Log out"
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
            <span className="text-emerald-400 uppercase font-mono font-bold">owner</span>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
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

          {/* TAB 2: HACKATHONS */}
          {activeTab === "hackathons" && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Hackathon Management</h3>
                  <p className="text-xs text-slate-400">Curate premier hackathons displayed on the student Explore page.</p>
                </div>
                <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  CMS Module Active
                </span>
              </div>
              <div className="p-8 text-center border border-dashed border-slate-700 rounded-xl space-y-2">
                <Trophy className="w-8 h-8 text-indigo-400 mx-auto" />
                <p className="text-sm font-semibold text-slate-300">Hackathon CMS Gateway Ready</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Protected by owner authorization. Add and curate live events for student exploration.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: SCHOLARSHIPS */}
          {activeTab === "scholarships" && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Scholarships &amp; Grants</h3>
                  <p className="text-xs text-slate-400">Manage funding opportunities and fellowship listings.</p>
                </div>
                <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  CMS Module Active
                </span>
              </div>
              <div className="p-8 text-center border border-dashed border-slate-700 rounded-xl space-y-2">
                <Award className="w-8 h-8 text-amber-400 mx-auto" />
                <p className="text-sm font-semibold text-slate-300">Scholarship Catalog Ready</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Direct management of global and national educational grants.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: NEWS */}
          {activeTab === "news" && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Tech News &amp; Platform Broadcasts</h3>
                  <p className="text-xs text-slate-400">Broadcast important industry news and platform announcements.</p>
                </div>
                <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  CMS Module Active
                </span>
              </div>
              <div className="p-8 text-center border border-dashed border-slate-700 rounded-xl space-y-2">
                <Newspaper className="w-8 h-8 text-purple-400 mx-auto" />
                <p className="text-sm font-semibold text-slate-300">Broadcast Channel Ready</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Publish announcements visible to students across all learning pathways.
                </p>
              </div>
            </div>
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
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">User Directory &amp; Governance</h3>
                  <p className="text-xs text-slate-400">Authoritative list of accounts and their database roles.</p>
                </div>
                <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {usersList.length} Verified Users
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-800/80 text-slate-400 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4 rounded-l-xl">User / Email</th>
                      <th className="py-3 px-4">Full Name</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4 rounded-r-xl">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {usersList.map((u) => {
                      const isUserOwner = u.role === "owner";
                      return (
                        <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-4 font-mono text-[11px] text-white">
                            {u.email}
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-200">
                            {u.full_name}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                isUserOwner
                                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                                  : "bg-slate-800 text-slate-400 border border-slate-700"
                              }`}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-400">
                            {isUserOwner ? (
                              <span className="text-[11px] font-semibold text-emerald-400">
                                Primary Owner
                              </span>
                            ) : (
                              <span className="text-[11px] text-slate-500">Standard Student</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
