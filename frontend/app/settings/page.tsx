"use client";

import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { motion } from "framer-motion";
import {
  fetchProfileData,
  saveAcademicProfile,
  saveCodingProfiles,
  PlatformStat,
} from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function SettingsPage() {
  const { logout } = useAuth();
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

  // ── localStorage keys ─────────────────────────────────────────────────
  const LS_ACADEMIC = "sc_academic_profile";
  const LS_CODING   = "sc_coding_profiles";
  const LS_STATS    = "sc_coding_stats";

  // Fetch initial profile & stats — DB first, then fall back to localStorage
  useEffect(() => {
    async function loadData() {
      setLoadingProfile(true);

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

      setLoadingProfile(false);
    }
    loadData();
  }, []);

  // Save Academic Profile — always writes to localStorage as primary cache
  const handleSaveAcademic = async () => {
    setSavingAcademic(true);
    setAcademicSuccessMsg("");
    const payload = {
      full_name: fullName,
      college: college,
      department: department,
      academic_year: academicYear,
      target_role: targetRole,
    };
    // Always save locally first (instant, reliable)
    try { localStorage.setItem(LS_ACADEMIC, JSON.stringify(payload)); } catch {}
    // Then try Supabase (may fail if table not created yet)
    await saveAcademicProfile(payload).catch(() => {});
    setSavingAcademic(false);
    setAcademicSuccessMsg("Academic profile saved successfully!");
    setTimeout(() => setAcademicSuccessMsg(""), 4000);
  };

  // Save Coding Profiles & Extract Stats automatically
  const handleSaveCoding = async () => {
    setSyncingCoding(true);
    setCodingSuccessMsg("");
    const codingPayload = {
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
    setSyncingCoding(false);
    if (res && res.success && res.stats) {
      setCodingStats(res.stats);
      try { localStorage.setItem(LS_STATS, JSON.stringify(res.stats)); } catch {}
      setCodingSuccessMsg("Coding profiles saved & live stats extracted!");
    } else {
      // Even if Supabase failed, inputs are saved locally
      setCodingSuccessMsg("Profiles saved locally! Stats will sync when Supabase is ready.");
    }
    setTimeout(() => setCodingSuccessMsg(""), 4000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto space-y-8 pb-16 select-none"
    >
      {/* ── Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Column: Academic & Institutional Profile */}
        <div className="glass rounded-2xl p-6 sm:p-7 border border-white/[0.08] space-y-6 shadow-2xl flex flex-col justify-between min-h-[540px]">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start gap-3.5">
              <div className="p-3 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 shrink-0">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-white tracking-tight">
                  Academic & Institutional Profile
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Specify your current academic year, college/university, and department.
                </p>
              </div>
            </div>

            {/* Inputs Form */}
            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase block mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  className="input-glass w-full px-4 py-3 text-xs font-semibold text-white rounded-xl focus:border-indigo-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase block mb-1.5">
                    College / University
                  </label>
                  <input
                    type="text"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    placeholder="e.g. Vardhaman College Of Engineering"
                    className="input-glass w-full px-4 py-3 text-xs font-semibold text-white rounded-xl focus:border-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase block mb-1.5">
                    Department / Branch
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. CSM / Computer Science"
                    className="input-glass w-full px-4 py-3 text-xs font-semibold text-white rounded-xl focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase block mb-1.5">
                    Class / Academic Year
                  </label>
                  <input
                    type="text"
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    placeholder="e.g. 2nd Year (Sophomore)"
                    className="input-glass w-full px-4 py-3 text-xs font-semibold text-white rounded-xl focus:border-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase block mb-1.5">
                    Target Career Role
                  </label>
                  <input
                    type="text"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    placeholder="e.g. SDE-1 / Software Engineer"
                    className="input-glass w-full px-4 py-3 text-xs font-semibold text-white rounded-xl focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-4 space-y-2">
            {academicSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{academicSuccessMsg}</span>
              </div>
            )}

            <button
              onClick={handleSaveAcademic}
              disabled={savingAcademic}
              className="w-full py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs tracking-wide transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
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
        <div className="glass rounded-2xl p-6 sm:p-7 border border-white/[0.08] space-y-6 shadow-2xl flex flex-col justify-between min-h-[540px]">
          <div className="space-y-5">
            {/* Header */}
            <div className="flex items-start gap-3.5">
              <div className="p-3 rounded-2xl bg-blue-500/15 border border-blue-500/30 text-blue-400 shrink-0">
                <Code2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-white tracking-tight">
                  Coding & Developer Profiles
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Connect competitive programming platforms for live stats & readiness tracking.
                </p>
              </div>
            </div>

            {/* 6 Platform Grid Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Card 1: LeetCode */}
              <PlatformInputCard
                platformKey="leetcode"
                title="LeetCode"
                dotColor="bg-amber-400"
                value={leetcodeInput}
                onChange={setLeetcodeInput}
                stat={codingStats.leetcode}
              />

              {/* Card 2: GitHub */}
              <PlatformInputCard
                platformKey="github"
                title="GitHub"
                dotColor="bg-slate-200"
                value={githubInput}
                onChange={setGithubInput}
                stat={codingStats.github}
              />

              {/* Card 3: HackerRank */}
              <PlatformInputCard
                platformKey="hackerrank"
                title="HackerRank"
                dotColor="bg-emerald-400"
                value={hackerrankInput}
                onChange={setHackerrankInput}
                stat={codingStats.hackerrank}
              />

              {/* Card 4: CodeChef */}
              <PlatformInputCard
                platformKey="codechef"
                title="CodeChef"
                dotColor="bg-amber-600"
                value={codechefInput}
                onChange={setCodechefInput}
                stat={codingStats.codechef}
              />

              {/* Card 5: GeeksforGeeks */}
              <PlatformInputCard
                platformKey="geeksforgeeks"
                title="GeeksforGeeks"
                dotColor="bg-emerald-500"
                value={gfgInput}
                onChange={setGfgInput}
                stat={codingStats.geeksforgeeks}
              />

              {/* Card 6: Codeforces */}
              <PlatformInputCard
                platformKey="codeforces"
                title="Codeforces"
                dotColor="bg-blue-400"
                value={codeforcesInput}
                onChange={setCodeforcesInput}
                stat={codingStats.codeforces}
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
                  <span>Save Coding Profiles & Sync Stats</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Bottom Section: Earned Milestones & Career Badges */}
      <div className="glass rounded-2xl p-6 sm:p-8 border border-white/[0.08] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="p-3.5 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-400 shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-white tracking-tight">
              Earned Milestones & Career Badges
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Track unlocked platform achievements and completed learning milestones.
            </p>
            <p className="text-xs text-slate-500 mt-3 font-semibold">
              No milestone achievements earned yet. Complete an active roadmap to 100% to earn your first badge!
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          className="px-5 py-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
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
    <div className="p-3.5 rounded-xl bg-[#0b1222]/80 border border-white/[0.06] hover:border-indigo-500/30 transition-all space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${dotColor} shadow-sm`} />
          <span className="text-xs font-bold text-white">{title}</span>
        </div>
        <span
          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
            isConfigured
              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
              : "bg-slate-500/10 text-slate-400 border border-slate-500/20"
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
        className="input-glass w-full px-3 py-2 text-[11px] font-mono text-slate-200 placeholder:text-slate-500 rounded-lg focus:border-indigo-500 outline-none"
      />

      {/* Extracted Summary Badge */}
      {stat && stat.summary && (
        <div className="pt-1 flex items-center gap-1.5 text-[10px] font-semibold text-indigo-300 truncate">
          <Globe className="w-3 h-3 text-indigo-400 shrink-0" />
          <span className="truncate">{stat.summary}</span>
        </div>
      )}
    </div>
  );
}
