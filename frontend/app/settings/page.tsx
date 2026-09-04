"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Code2,
  Trophy,
  Save,
  RefreshCw,
  LogOut,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Award,
  Globe,
  LifeBuoy,
  Phone,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { motion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import {
  fetchProfileData,
  saveAcademicProfile,
  saveCodingProfiles,
  fetchUserProgressStats,
  UserProgressStats,
  PlatformStat,
} from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function SettingsPage() {
  const { session, logout } = useAuth();
  const userId = session?.user_id;

  const qc = useQueryClient();

  // Academic Profile State
  const [fullName, setFullName] = useState("");
  const [college, setCollege] = useState("");
  const [department, setDepartment] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [savingAcademic, setSavingAcademic] = useState(false);
  const [academicSuccessMsg, setAcademicSuccessMsg] = useState("");

  // Coding Profiles State
  const [leetcodeInput, setLeetcodeInput] = useState("");
  const [githubInput, setGithubInput] = useState("");
  const [hackerrankInput, setHackerrankInput] = useState("");
  const [codechefInput, setCodechefInput] = useState("");
  const [gfgInput, setGfgInput] = useState("");
  const [codeforcesInput, setCodeforcesInput] = useState("");

  // Extracted Live Stats
  const [codingStats, setCodingStats] = useState<Record<string, PlatformStat>>({});
  const [syncingCoding, setSyncingCoding] = useState(false);
  const [codingSuccessMsg, setCodingSuccessMsg] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(true);

  // User Dynamic Progress Stats (Starts strictly at zero for everyone)
  const [progressStats, setProgressStats] = useState<UserProgressStats>({
    streakDays: 0,
    badgesCount: 0,
    questionsSolved: 0,
    completedVideos: 0,
    completedRoadmaps: 0,
    totalXP: 0,
    level: 0,
    currentLevelXP: 0,
    nextLevelXP: 100,
    xpPercent: 0,
    badges: [],
  });

  // ── localStorage keys ─────────────────────────────────────────────────
  const LS_ACADEMIC = `sc_academic_profile_${userId}`;
  const LS_CODING   = `sc_coding_profiles_${userId}`;
  const LS_STATS    = `sc_coding_stats_${userId}`;

  // Fetch initial profile & stats — DB first, then fall back to localStorage
  useEffect(() => {
    async function loadData() {
      setLoadingProfile(true);

      // Default name to logged-in user name/email if blank
      if (session?.name || session?.email) {
        setFullName(session.name || (session.email ? session.email.split("@")[0] : ""));
      }

      // ── Step 1: Load from localStorage immediately (instant render) ──
      try {
        const cachedAcademic = localStorage.getItem(LS_ACADEMIC);
        if (cachedAcademic) {
          const a = JSON.parse(cachedAcademic);
          if (a.full_name)     setFullName(a.full_name);
          if (a.college)       setCollege(a.college);
          if (a.department)    setDepartment(a.department);
          if (a.academic_year) setAcademicYear(a.academic_year);
          if (a.target_role)   setTargetRole(a.target_role);
        }
        const cachedCoding = localStorage.getItem(LS_CODING);
        if (cachedCoding) {
          const c = JSON.parse(cachedCoding);
          if (c.leetcode)      setLeetcodeInput(c.leetcode);
          if (c.github)        setGithubInput(c.github);
          if (c.hackerrank)    setHackerrankInput(c.hackerrank);
          if (c.codechef)      setCodechefInput(c.codechef);
          if (c.geeksforgeeks) setGfgInput(c.geeksforgeeks);
          if (c.codeforces)    setCodeforcesInput(c.codeforces);
        }
        const cachedStats = localStorage.getItem(LS_STATS);
        if (cachedStats) {
          setCodingStats(JSON.parse(cachedStats));
        }
      } catch {}

      // ── Step 2: Try Supabase (override localStorage if data exists) ──
      try {
        const data = await fetchProfileData();
        if (data) {
          if (data.academic) {
            if (data.academic.full_name)     setFullName(data.academic.full_name);
            if (data.academic.college)       setCollege(data.academic.college);
            if (data.academic.department)    setDepartment(data.academic.department);
            if (data.academic.academic_year) setAcademicYear(data.academic.academic_year);
            if (data.academic.target_role)   setTargetRole(data.academic.target_role);
          }
          if (data.coding_inputs) {
            if (data.coding_inputs.leetcode)      setLeetcodeInput(data.coding_inputs.leetcode);
            if (data.coding_inputs.github)        setGithubInput(data.coding_inputs.github);
            if (data.coding_inputs.hackerrank)    setHackerrankInput(data.coding_inputs.hackerrank);
            if (data.coding_inputs.codechef)      setCodechefInput(data.coding_inputs.codechef);
            if (data.coding_inputs.geeksforgeeks) setGfgInput(data.coding_inputs.geeksforgeeks);
            if (data.coding_inputs.codeforces)    setCodeforcesInput(data.coding_inputs.codeforces);
          }
          if (data.coding_stats) {
            setCodingStats(data.coding_stats);
          }
        }
      } catch {}

      // ── Step 3: Fetch verified live progress stats (starts from 0) ──
      if (userId) {
        try {
          const pStats = await fetchUserProgressStats(userId);
          setProgressStats(pStats);
        } catch (err) {
          console.warn("Failed to load progress stats:", err);
        }
      }

      setLoadingProfile(false);
    }
    loadData();
  }, [userId, session]);

  // Save Academic Profile — always writes to localStorage as primary cache
  const handleSaveAcademic = async () => {
    setSavingAcademic(true);
    setAcademicSuccessMsg("");
    const payload = {
      user_id: userId,
      full_name: fullName,
      college: college,
      department: department,
      academic_year: academicYear,
      target_role: targetRole,
    };
    // Always save locally first (instant, reliable)
    try { localStorage.setItem(LS_ACADEMIC, JSON.stringify(payload)); } catch {}
    // Then try Supabase
    await saveAcademicProfile(payload).catch(() => {});
    qc.invalidateQueries({ queryKey: ["dashboard"] });
    qc.invalidateQueries({ queryKey: ["profile"] });
    setSavingAcademic(false);
    setAcademicSuccessMsg("Academic profile saved successfully!");
    setTimeout(() => setAcademicSuccessMsg(""), 4000);
  };

  // Save Coding Profiles & Extract Stats automatically
  const handleSaveCoding = async () => {
    setSyncingCoding(true);
    setCodingSuccessMsg("");
    const codingPayload = {
      user_id: userId,
      leetcode: leetcodeInput,
      github: githubInput,
      hackerrank: hackerrankInput,
      codechef: codechefInput,
      geeksforgeeks: gfgInput,
      codeforces: codeforcesInput,
    };
    // Always save inputs locally first
    try { localStorage.setItem(LS_CODING, JSON.stringify(codingPayload)); } catch {}
    // Then try Supabase + live stats extraction
    const res = await saveCodingProfiles(codingPayload).catch(() => null);
    qc.invalidateQueries({ queryKey: ["dashboard"] });
    qc.invalidateQueries({ queryKey: ["profile"] });
    setSyncingCoding(false);
    if (res && res.success && res.stats) {
      setCodingStats(res.stats);
      try { localStorage.setItem(LS_STATS, JSON.stringify(res.stats)); } catch {}
      setCodingSuccessMsg("Coding profiles saved & live stats extracted!");
    } else {
      // Even if Supabase failed, inputs are saved locally
      setCodingSuccessMsg("Profiles saved locally! Stats will sync when Supabase is ready.");
    }

    // Refresh dynamic stats
    if (userId) {
      fetchUserProgressStats(userId, true)
        .then((s) => setProgressStats(s))
        .catch(() => {});
    }

    setTimeout(() => setCodingSuccessMsg(""), 4000);
  };

  const displayName = fullName || session?.name || (session?.email ? session.email.split("@")[0] : "Learner");

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto space-y-6 pb-16 select-none"
    >
      {/* ── Native User Profile Hero Card ── */}
      <div className="bg-[#234B3B] p-6 sm:p-8 rounded-[28px] text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 text-center sm:text-left">
          {/* Avatar Container */}
          <div className="relative">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/20 p-1">
              <div className="w-full h-full rounded-full bg-white text-[#234B3B] flex items-center justify-center font-black text-2xl sm:text-3xl">
                {displayName ? displayName.charAt(0).toUpperCase() : "P"}
              </div>
            </div>
            <span className="absolute bottom-0 right-0 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-900 shadow">
              Lvl {progressStats.level}
            </span>
          </div>

          {/* User Details & XP Bar */}
          <div className="flex-1 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {displayName}
                </h1>
                <p className="text-xs text-emerald-100 font-medium mt-0.5">
                  {session?.email || "learner@skillscatalyst.in"} {college ? `• ${college}` : ""}
                </p>
              </div>

              <button
                onClick={logout}
                className="self-center sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>

            {/* XP Level Bar */}
            <div className="space-y-1 max-w-md">
              <div className="flex items-center justify-between text-[11px] font-extrabold text-emerald-100">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" /> {progressStats.currentLevelXP.toLocaleString()} / {progressStats.nextLevelXP.toLocaleString()} XP
                </span>
                <span className="text-amber-300">Level {progressStats.level + 1} Next</span>
              </div>
              <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden p-0.5">
                <div 
                  className="h-full bg-amber-400 rounded-full transition-all duration-500" 
                  style={{ width: `${progressStats.xpPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Profile Quick Stats Grid - Exactly 3 Items: Streak, Badges, Questions Solved */}
        <div className="grid grid-cols-3 gap-2.5 mt-6 pt-5 border-t border-white/20">
          <div className="p-3 rounded-2xl bg-white/10 flex flex-col items-center justify-center text-center">
            <span className="text-xs sm:text-sm font-extrabold text-amber-300 flex items-center gap-1">
              🔥 {progressStats.streakDays} {progressStats.streakDays === 1 ? "Day" : "Days"}
            </span>
            <span className="text-[10px] text-emerald-100 font-medium mt-0.5">Streak</span>
          </div>

          <div className="p-3 rounded-2xl bg-white/10 flex flex-col items-center justify-center text-center">
            <span className="text-xs sm:text-sm font-extrabold text-purple-200 flex items-center gap-1">
              🏆 {progressStats.badgesCount} {progressStats.badgesCount === 1 ? "Badge" : "Badges"}
            </span>
            <span className="text-[10px] text-emerald-100 font-medium mt-0.5">Earned</span>
          </div>

          <div className="p-3 rounded-2xl bg-white/10 flex flex-col items-center justify-center text-center">
            <span className="text-xs sm:text-sm font-extrabold text-emerald-200 flex items-center gap-1">
              💻 {progressStats.questionsSolved} Solved
            </span>
            <span className="text-[10px] text-emerald-100 font-medium mt-0.5">Practice Qs</span>
          </div>
        </div>
      </div>

      {/* ── Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Column: Academic & Institutional Profile */}
        <div className="bg-white rounded-[28px] p-6 sm:p-7 border border-slate-100 space-y-6 shadow-sm flex flex-col justify-between min-h-[540px]">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start gap-3.5">
              <div className="p-3 rounded-2xl bg-emerald-100 text-[#234B3B] shrink-0">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  Academic & Institutional Profile
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Specify your current academic year, college/university, and department.
                </p>
              </div>
            </div>

            {/* Inputs Form */}
            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-extrabold text-slate-500 tracking-wider uppercase block mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full bg-slate-50 border border-slate-200 px-4 py-3 text-xs font-semibold text-slate-900 rounded-xl focus:border-[#234B3B] outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-extrabold text-slate-500 tracking-wider uppercase block mb-1.5">
                    College / University
                  </label>
                  <input
                    type="text"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    placeholder="e.g. Vardhaman College Of Engineering"
                    className="w-full bg-slate-50 border border-slate-200 px-4 py-3 text-xs font-semibold text-slate-900 rounded-xl focus:border-[#234B3B] outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-extrabold text-slate-500 tracking-wider uppercase block mb-1.5">
                    Department / Branch
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. CSM / Computer Science"
                    className="w-full bg-slate-50 border border-slate-200 px-4 py-3 text-xs font-semibold text-slate-900 rounded-xl focus:border-[#234B3B] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-extrabold text-slate-500 tracking-wider uppercase block mb-1.5">
                    Class / Academic Year
                  </label>
                  <input
                    type="text"
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    placeholder="e.g. 2nd Year (Sophomore)"
                    className="w-full bg-slate-50 border border-slate-200 px-4 py-3 text-xs font-semibold text-slate-900 rounded-xl focus:border-[#234B3B] outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-extrabold text-slate-500 tracking-wider uppercase block mb-1.5">
                    Target Career Role
                  </label>
                  <input
                    type="text"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    placeholder="e.g. SDE-1 / Software Engineer"
                    className="w-full bg-slate-50 border border-slate-200 px-4 py-3 text-xs font-semibold text-slate-900 rounded-xl focus:border-[#234B3B] outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-4 space-y-2">
            {academicSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#234B3B]" />
                <span>{academicSuccessMsg}</span>
              </div>
            )}

            <button
              onClick={handleSaveAcademic}
              disabled={savingAcademic}
              className="w-full py-3.5 px-6 rounded-xl bg-[#234B3B] hover:bg-[#1b3b2e] text-white font-extrabold text-xs tracking-wide transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {savingAcademic ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Saving Academic Profile...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Academic Profile</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Coding & Developer Profiles */}
        <div className="bg-white rounded-[28px] p-6 sm:p-7 border border-slate-100 space-y-6 shadow-sm flex flex-col justify-between min-h-[540px]">
          <div className="space-y-5">
            {/* Header */}
            <div className="flex items-start gap-3.5">
              <div className="p-3 rounded-2xl bg-blue-100 text-blue-700 shrink-0">
                <Code2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  Coding & Developer Profiles
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Connect your LeetCode platform profile for live stats & readiness tracking.
                </p>
              </div>
            </div>

            {/* LeetCode Platform Card (Only LeetCode) */}
            <div className="space-y-3.5">
              <PlatformInputCard
                platformKey="leetcode"
                title="LeetCode"
                dotColor="bg-amber-400"
                value={leetcodeInput}
                onChange={setLeetcodeInput}
                stat={codingStats.leetcode}
              />
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-4 space-y-2">
            {codingSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>{codingSuccessMsg}</span>
              </div>
            )}

            <button
              onClick={handleSaveCoding}
              disabled={syncingCoding}
              className="w-full py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs tracking-wide transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {syncingCoding ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Extracting Live Stats...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save LeetCode Profile & Sync Stats</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Bottom Section: Earned Milestones & Career Badges */}
      <div className="bg-white rounded-[28px] p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3.5 rounded-2xl bg-purple-100 text-purple-700 shrink-0">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
                  Earned Milestones & Career Badges
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                  {progressStats.badgesCount} of {progressStats.badges.length} Unlocked
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Track unlocked platform achievements based on daily streaks, questions solved, videos, and roadmaps.
              </p>
              {progressStats.badgesCount === 0 && (
                <p className="text-xs text-slate-400 mt-2 font-medium">
                  No badges earned yet. Solve your first practice problem, watch a video, or maintain a daily streak to start unlocking!
                </p>
              )}
            </div>
          </div>

          <button
            onClick={logout}
            className="self-start md:self-auto px-5 py-2.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Dynamic Badges Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 pt-2">
          {progressStats.badges.map((b) => (
            <div
              key={b.id}
              className={`p-3 rounded-2xl border flex flex-col items-center text-center transition-all ${
                b.unlocked
                  ? "bg-purple-50/80 border-purple-200 shadow-xs ring-1 ring-purple-300"
                  : "bg-slate-50/60 border-slate-200 opacity-60"
              }`}
            >
              <div className="text-2xl mb-1 filter drop-shadow-xs">{b.icon}</div>
              <span className="text-[11px] font-bold text-slate-900 leading-tight line-clamp-1">
                {b.name}
              </span>
              <span className="text-[9px] text-slate-500 mt-0.5 line-clamp-2 leading-tight">
                {b.desc}
              </span>
              <span
                className={`text-[9px] font-extrabold mt-2 px-1.5 py-0.5 rounded-md ${
                  b.unlocked
                    ? "bg-purple-600 text-white"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                {b.unlocked ? "Earned" : b.progressText || "Locked"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── CARD 4: Customer Service, Founder Contact & Legal Policies ── */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-7 border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-[#234B3B]">
              <LifeBuoy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-slate-900">
                Customer Service & Legal Policies
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Direct founder access, 24/7 help desk, and student rights compliance
              </p>
            </div>
          </div>
          <Link
            href="/support"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#234B3B] hover:bg-[#1a382c] text-white font-bold text-xs shadow-xs transition-colors"
          >
            <span>Visit Support Desk</span>
            <span>➔</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Founder & Grievance Officer</span>
            <div className="font-extrabold text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
              <span>Palamoor Adithya Goud</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <span className="text-[11px] text-slate-500 block">Personal query review & 24h SLA</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Phone & WhatsApp</span>
            <a href="tel:+917330602101" className="font-extrabold text-xs sm:text-sm text-emerald-700 hover:underline flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" />
              <span>+91 7330602101</span>
            </a>
            <span className="text-[11px] text-slate-500 block">Available Mon–Sat: 9 AM–8 PM IST</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Support & Grievance Email</span>
            <a href="mailto:palamooradithyagoud@gmail.com" className="font-extrabold text-xs text-emerald-700 hover:underline flex items-center gap-1.5 truncate">
              <Mail className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">palamooradithyagoud@gmail.com</span>
            </a>
            <span className="text-[11px] text-slate-500 block">Statutory compliance & refund requests</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 text-[11px] text-slate-500 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Applicable Policies:</span>
          <Link href="/support" className="text-emerald-700 hover:underline">Privacy Policy (DPDP Act)</Link>
          <span>•</span>
          <Link href="/support" className="text-emerald-700 hover:underline">Terms of Service</Link>
          <span>•</span>
          <Link href="/support" className="text-emerald-700 hover:underline">7-Day Refund Policy</Link>
          <span>•</span>
          <Link href="/support" className="text-emerald-700 hover:underline">Grievance Redressal</Link>
        </div>
      </div>
    </motion.div>
  );
}

// Sub-component for individual Platform Input Card with extracted live stats
interface PlatformInputCardProps {
  platformKey: string;
  title: string;
  dotColor: string;
  value: string;
  onChange: (val: string) => void;
  stat?: PlatformStat;
}

function PlatformInputCard({
  platformKey,
  title,
  dotColor,
  value,
  onChange,
  stat,
}: PlatformInputCardProps) {
  const isConfigured = !!(value || (stat && stat.configured));

  return (
    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-[#234B3B] transition-all space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${dotColor} shadow-sm`} />
          <span className="text-xs font-bold text-slate-900">{title}</span>
        </div>
        <span
          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
            isConfigured
              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
              : "bg-slate-200 text-slate-600 border border-slate-300"
          }`}
        >
          {stat && stat.badge ? stat.badge : isConfigured ? "Connected" : "Not configured"}
        </span>
      </div>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Username or URL"
        className="w-full bg-white border border-slate-200 px-3 py-2 text-[11px] font-mono text-slate-900 placeholder:text-slate-400 rounded-lg focus:border-[#234B3B] outline-none"
      />

      {/* Extracted Summary Badge */}
      {stat && stat.summary && (
        <div className="pt-1 flex items-center gap-1.5 text-[10px] font-semibold text-emerald-800 truncate">
          <Globe className="w-3 h-3 text-[#234B3B] shrink-0" />
          <span className="truncate">{stat.summary}</span>
        </div>
      )}
    </div>
  );
}
