"use client";

import React, { useState, useEffect, useRef } from "react";
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
  Briefcase,
  FolderGit2,
  FileText,
  Plus,
  Trash2,
  Edit3,
  X,
  ChevronDown,
  ChevronUp,
  UploadCloud,
  Lock,
  MapPin,
  Building,
  Calendar,
  Flame,
  Target,
  Camera,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import {
  fetchFullProfileData,
  savePersonalProfile,
  saveSkill,
  deleteSkill,
  saveExperience,
  deleteExperience,
  saveEducation,
  deleteEducation,
  saveProject,
  deleteProject,
  saveCertification,
  deleteCertification,
  saveAchievement,
  deleteAchievement,
  saveCareerPreferences,
  saveCodingProfiles,
  calculateProfileCompletion,
  fetchUserProgressStats,
  CompleteProfileData,
  UserProfile,
  UserSkill,
  UserExperience,
  UserEducation,
  UserProject,
  UserCertification,
  UserAchievement,
  UserCareerPreferences,
  UserProgressStats,
  PlatformStat,
} from "@/lib/api";
import { extractResume, reviewResume } from "@/lib/api/career";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

export default function SettingsPage() {
  const { session, logout } = useAuth();
  const userId = session?.user_id;
  const qc = useQueryClient();

  // ── Master Profile State ──────────────────────────────────────────────────
  const [profileData, setProfileData] = useState<CompleteProfileData>({
    personal: null,
    academic: null,
    career_preferences: null,
    skills: [],
    experiences: [],
    education: [],
    projects: [],
    certifications: [],
    achievements: [],
    resume: null,
    progress: null,
    coding_inputs: null,
    coding_stats: null,
  });

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [showChecklist, setShowChecklist] = useState(false);

  // ── Personal Section Form State ───────────────────────────────────────────
  const [personalForm, setPersonalForm] = useState<UserProfile>({
    full_name: "",
    headline: "",
    country: "India",
    state: "",
    city: "",
    phone: "",
    gender: "Prefer not to say",
    about: "",
    avatar_url: "",
  });
  const [savingPersonal, setSavingPersonal] = useState(false);
  const [personalMsg, setPersonalMsg] = useState("");

  // ── Coding Profiles Form State ────────────────────────────────────────────
  const [leetcodeInput, setLeetcodeInput] = useState("");
  const [githubInput, setGithubInput] = useState("");
  const [hackerrankInput, setHackerrankInput] = useState("");
  const [codechefInput, setCodechefInput] = useState("");
  const [gfgInput, setGfgInput] = useState("");
  const [codeforcesInput, setCodeforcesInput] = useState("");
  const [codingStats, setCodingStats] = useState<Record<string, PlatformStat>>({});
  const [syncingCoding, setSyncingCoding] = useState(false);
  const [codingMsg, setCodingMsg] = useState("");

  // ── Career Preferences Form State ─────────────────────────────────────────
  const [careerPrefsForm, setCareerPrefsForm] = useState<UserCareerPreferences>({
    target_roles: [],
    preferred_industries: [],
    target_companies: [],
    preferred_locations: [],
    work_arrangements: ["Hybrid", "Remote"],
  });
  const [roleInput, setRoleInput] = useState("");
  const [companyInput, setCompanyInput] = useState("");
  const [industryInput, setIndustryInput] = useState("");
  const [locationInput, setLocationInput] = useState("");
  const [savingCareerPrefs, setSavingCareerPrefs] = useState(false);
  const [careerPrefsMsg, setCareerPrefsMsg] = useState("");

  // ── Resume State ──────────────────────────────────────────────────────────
  const [uploadingResume, setUploadingResume] = useState(false);
  const [resumeMsg, setResumeMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Modals State ──────────────────────────────────────────────────────────
  type ModalType = "skill" | "experience" | "education" | "project" | "cert" | "achievement" | "avatar" | null;
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [modalError, setModalError] = useState("");

  // ── Progress Stats State ──────────────────────────────────────────────────
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

  // ── Initial Data Load ─────────────────────────────────────────────────────
  useEffect(() => {
    async function loadData() {
      setLoadingProfile(true);

      const defaultName = session?.name || (session?.email ? session.email.split("@")[0] : "");
      setPersonalForm((prev) => ({
        ...prev,
        full_name: prev.full_name || defaultName,
      }));

      const full = await fetchFullProfileData();
      if (full) {
        setProfileData(full);

        // Populate personal form
        if (full.personal) {
          setPersonalForm({
            full_name: full.personal.full_name || defaultName,
            headline: full.personal.headline || "",
            country: full.personal.country || "India",
            state: full.personal.state || "",
            city: full.personal.city || "",
            phone: full.personal.phone || "",
            gender: full.personal.gender || "Prefer not to say",
            about: full.personal.about || "",
            avatar_url: full.personal.avatar_url || "",
          });
        }

        // Populate coding form
        if (full.coding_inputs) {
          setLeetcodeInput(full.coding_inputs.leetcode || "");
          setGithubInput(full.coding_inputs.github || "");
          setHackerrankInput(full.coding_inputs.hackerrank || "");
          setCodechefInput(full.coding_inputs.codechef || "");
          setGfgInput(full.coding_inputs.geeksforgeeks || "");
          setCodeforcesInput(full.coding_inputs.codeforces || "");
        }
        if (full.coding_stats) {
          setCodingStats(full.coding_stats);
        }

        // Populate career preferences
        if (full.career_preferences) {
          setCareerPrefsForm({
            target_roles: full.career_preferences.target_roles || [],
            preferred_industries: full.career_preferences.preferred_industries || [],
            target_companies: full.career_preferences.target_companies || [],
            preferred_locations: full.career_preferences.preferred_locations || [],
            work_arrangements: full.career_preferences.work_arrangements || ["Hybrid", "Remote"],
          });
        } else if (full.academic?.target_role) {
          setCareerPrefsForm((prev) => ({
            ...prev,
            target_roles: [full.academic!.target_role],
          }));
        }
      }

      if (userId) {
        try {
          const hasCoding = !!(full?.coding_inputs?.leetcode || full?.coding_inputs?.github);
          const pStats = await fetchUserProgressStats(userId, hasCoding);
          setProgressStats(pStats);
        } catch (e) {
          console.warn("Failed to load progress stats:", e);
        }
      }

      setLoadingProfile(false);
    }

    loadData();
  }, [userId, session]);

  // Dynamic Profile Completion Calculation
  const completionReport = calculateProfileCompletion(profileData);

  // ── Handler: Save Personal Details ────────────────────────────────────────
  const handleSavePersonal = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSavingPersonal(true);
    setPersonalMsg("");

    const res = await savePersonalProfile(personalForm);
    if (res.success) {
      setPersonalMsg("Personal information updated successfully!");
      setProfileData((prev) => ({
        ...prev,
        personal: { ...(prev.personal || {}), ...personalForm },
      }));
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["profile"] });
    } else {
      setPersonalMsg(res.error || "Failed to update profile. Database write error.");
    }
    setSavingPersonal(false);
    setTimeout(() => setPersonalMsg(""), 4000);
  };

  // ── Handler: Save Career Preferences ──────────────────────────────────────
  const handleSaveCareerPreferences = async () => {
    setSavingCareerPrefs(true);
    setCareerPrefsMsg("");

    const res = await saveCareerPreferences(careerPrefsForm);
    if (res.success) {
      setCareerPrefsMsg("Career preferences saved successfully!");
      setProfileData((prev) => ({
        ...prev,
        career_preferences: { ...(prev.career_preferences || {}), ...careerPrefsForm },
      }));
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["profile"] });
    } else {
      setCareerPrefsMsg(res.error || "Failed to save career preferences.");
    }
    setSavingCareerPrefs(false);
    setTimeout(() => setCareerPrefsMsg(""), 4000);
  };

  // ── Handler: Save Coding Profiles & Extract Stats ─────────────────────────
  const handleSaveCoding = async () => {
    setSyncingCoding(true);
    setCodingMsg("");

    const codingPayload = {
      user_id: userId,
      leetcode: leetcodeInput,
      github: githubInput,
      hackerrank: hackerrankInput,
      codechef: codechefInput,
      geeksforgeeks: gfgInput,
      codeforces: codeforcesInput,
    };

    const res = await saveCodingProfiles(codingPayload).catch(() => null);
    qc.invalidateQueries({ queryKey: ["dashboard"] });
    qc.invalidateQueries({ queryKey: ["profile"] });
    setSyncingCoding(false);

    if (res && res.success && res.stats) {
      setCodingStats(res.stats);
      setCodingMsg("Developer profiles saved and live platform metrics synced!");
      setProfileData((prev) => ({
        ...prev,
        coding_inputs: codingPayload,
        coding_stats: res.stats,
      }));
    } else if (res && res.success) {
      setCodingMsg("Developer profiles saved successfully!");
      setProfileData((prev) => ({
        ...prev,
        coding_inputs: codingPayload,
      }));
    } else {
      setCodingMsg((res as any)?.message || "Database write failed. Ensure backend service is reachable.");
    }

    if (userId) {
      fetchUserProgressStats(userId, true)
        .then((s) => setProgressStats(s))
        .catch(() => {});
    }

    setTimeout(() => setCodingMsg(""), 4000);
  };

  // ── Handler: Upload Resume (Official AI Pipeline - FIX 6) ──────────────────
  const handleResumeUpload = async (file: File) => {
    if (!file) return;
    setUploadingResume(true);
    setResumeMsg("");

    try {
      const extractRes = await extractResume(file);
      if (!extractRes.success || !extractRes.text) {
        setResumeMsg(extractRes.message || "Could not parse resume text. Please upload a valid PDF.");
        return;
      }

      const targetRole =
        careerPrefsForm.target_roles?.[0] ||
        profileData.career_preferences?.target_roles?.[0] ||
        profileData.academic?.target_role ||
        "Software Engineer";

      // Call official reviewResume pipeline which invokes real AI evaluation,
      // persists into public.resume_scores, and updates user_progress.resume_readiness_score
      const reviewRes = await reviewResume(extractRes.text, targetRole, "Entry-Level", "Product-Based");

      // Read official persisted score from database
      if (userId) {
        const { data: latestScores, error: scoreErr } = await supabase
          .from("resume_scores")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(1);

        if (!scoreErr && latestScores && latestScores.length > 0) {
          const r = latestScores[0];
          const officialScore = r.overall_score || r.ats_compatibility_score || 0;
          setProfileData((prev) => ({
            ...prev,
            resume: {
              filename: file.name,
              updated_at: r.created_at || new Date().toISOString(),
              overall_score: officialScore,
              ats_score: officialScore,
              summary: `Evaluated for ${r.target_role || targetRole}`,
            },
          }));
          setResumeMsg(`Resume evaluated by AI! Official ATS Score: ${officialScore}/100`);
          qc.invalidateQueries({ queryKey: ["dashboard"] });
          qc.invalidateQueries({ queryKey: ["profile"] });
          return;
        }
      }

      setResumeMsg(reviewRes?.review ? "Resume reviewed successfully by AI Mentor!" : "Resume processed.");
    } catch (err: any) {
      console.error("Resume upload error:", err);
      setResumeMsg(err?.message || "Failed to complete AI resume review. Ensure backend service is running.");
    } finally {
      setUploadingResume(false);
      setTimeout(() => setResumeMsg(""), 5000);
    }
  };

  // ── Handler: Delete Items ─────────────────────────────────────────────────
  const handleDeleteSkill = async (idOrName: string) => {
    const res = await deleteSkill(idOrName);
    if (res.success) {
      setProfileData((prev) => ({
        ...prev,
        skills: prev.skills.filter((s) => s.id !== idOrName && s.skill_name.toLowerCase() !== idOrName.toLowerCase()),
      }));
    }
  };

  const handleDeleteExperience = async (id: string) => {
    const res = await deleteExperience(id);
    if (res.success) {
      setProfileData((prev) => ({
        ...prev,
        experiences: prev.experiences.filter((e) => e.id !== id),
      }));
    }
  };

  const handleDeleteEducation = async (id: string) => {
    const res = await deleteEducation(id);
    if (res.success) {
      setProfileData((prev) => ({
        ...prev,
        education: prev.education.filter((e) => e.id !== id),
      }));
    }
  };

  const handleDeleteProject = async (id: string) => {
    const res = await deleteProject(id);
    if (res.success) {
      setProfileData((prev) => ({
        ...prev,
        projects: prev.projects.filter((p) => p.id !== id),
      }));
    }
  };

  const handleDeleteCertification = async (id: string) => {
    const res = await deleteCertification(id);
    if (res.success) {
      setProfileData((prev) => ({
        ...prev,
        certifications: prev.certifications.filter((c) => c.id !== id),
      }));
    }
  };

  const handleDeleteAchievement = async (id: string) => {
    const res = await deleteAchievement(id);
    if (res.success) {
      setProfileData((prev) => ({
        ...prev,
        achievements: prev.achievements.filter((a) => a.id !== id),
      }));
    }
  };

  const displayName = personalForm.full_name || session?.name || (session?.email ? session.email.split("@")[0] : "Learner");

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto space-y-8 pb-20 select-none font-sans"
    >
      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 1. PROFILE HERO BANNER & REAL-TIME COMPLETION METER                 */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#240A5E] via-[#4A1584] to-[#6B21A8] text-white p-3.5 sm:p-6 lg:p-8 shadow-xl border border-purple-400/30">
        {/* Subtle background glow effect */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-violet-400/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3.5 sm:gap-6">
          {/* Left: Avatar + Identity + Gamification */}
          <div className="flex flex-row items-center sm:items-start gap-3 sm:gap-5 text-left flex-1 min-w-0">
            {/* Avatar with edit overlay */}
            <div className="relative group cursor-pointer shrink-0" onClick={() => setActiveModal("avatar")}>
              <div className="w-16 h-16 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-2xl bg-white/10 p-0.5 sm:p-1 border-2 border-purple-300/40 shadow-inner flex items-center justify-center overflow-hidden">
                {personalForm.avatar_url ? (
                  <img
                    src={personalForm.avatar_url}
                    alt={displayName}
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <div className="w-full h-full rounded-xl bg-gradient-to-br from-purple-100 to-white text-[#4A1584] flex items-center justify-center font-black text-2xl sm:text-3xl lg:text-4xl shadow">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[9px] sm:text-[10px] font-bold">
                <Camera className="w-4 h-4 sm:w-5 sm:h-5 mb-0.5 text-purple-200" />
                <span>Change</span>
              </div>
              <span className="absolute -bottom-1 -right-1 sm:-bottom-1.5 sm:-right-1.5 px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-[10px] font-black bg-amber-400 text-slate-950 shadow-md">
                Lvl {progressStats.level}
              </span>
            </div>

            {/* Identity Details */}
            <div className="space-y-0.5 sm:space-y-1.5 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 justify-start">
                <h1 className="text-lg sm:text-2xl lg:text-3xl font-black text-white tracking-tight truncate max-w-[190px] sm:max-w-none">
                  {displayName}
                </h1>
                {profileData.resume?.ats_score && profileData.resume.ats_score >= 80 && (
                  <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-[10px] font-extrabold bg-purple-500/20 text-purple-200 border border-purple-300/40">
                    <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> Job-Ready ATS
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm font-semibold text-purple-100/90 truncate">
                {personalForm.headline || "Aspiring Software Engineer & Lifelong Learner"}
              </p>

              <div className="flex flex-wrap items-center gap-1.5 sm:gap-3 text-[10px] sm:text-xs text-purple-200/80 font-medium pt-0.5 sm:pt-1 justify-start">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-purple-200 shrink-0" />
                  <span className="truncate max-w-[110px] sm:max-w-none">
                    {personalForm.city ? `${personalForm.city}, ${personalForm.country}` : personalForm.country || "India"}
                  </span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-purple-200 shrink-0" />
                  <span className="truncate max-w-[130px] sm:max-w-none">
                    {session?.email || "learner@skillscatalyst.in"}
                  </span>
                </span>
                {personalForm.phone && (
                  <>
                    <span className="hidden sm:inline">•</span>
                    <span className="flex items-center gap-1 text-purple-200 bg-purple-950/60 border border-purple-500/30 px-1.5 sm:px-2 py-0.5 rounded-md text-[9px] sm:text-[11px]">
                      <Lock className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> Private Phone
                    </span>
                  </>
                )}
              </div>

              {/* Dynamic XP Progress */}
              <div className="pt-1.5 sm:pt-2 max-w-md w-full">
                <div className="flex items-center justify-between text-[9px] sm:text-[11px] font-extrabold text-purple-200 mb-0.5 sm:mb-1">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-300" />
                    {progressStats.currentLevelXP.toLocaleString()} / {progressStats.nextLevelXP.toLocaleString()} XP
                  </span>
                  <span className="text-amber-300">Level {progressStats.level + 1}</span>
                </div>
                <div className="w-full bg-black/30 h-1.5 sm:h-2 rounded-full overflow-hidden p-0.5 border border-white/10">
                  <div
                    className="h-full bg-gradient-to-r from-purple-400 via-violet-400 to-fuchsia-400 rounded-full transition-all duration-500"
                    style={{ width: `${progressStats.xpPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right: Profile Strength Meter & Action Button */}
          <div className="w-full lg:w-80 bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-white/15 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div>
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-purple-200">
                  Profile Strength
                </span>
                <div className="text-lg sm:text-2xl font-black text-white flex items-center gap-2">
                  <span>{completionReport.totalPercent}%</span>
                  <span className="text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald-400/20 text-purple-200">
                    {completionReport.totalPercent >= 80 ? "All-Star" : completionReport.totalPercent >= 50 ? "Intermediate" : "Starter"}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowChecklist(!showChecklist)}
                className="text-[10px] sm:text-xs font-bold text-purple-200 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>{showChecklist ? "Hide Checklist" : "View Checklist"}</span>
                {showChecklist ? <ChevronUp className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> : <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
              </button>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-black/30 h-1.5 sm:h-2.5 rounded-full overflow-hidden p-0.5 mb-2 sm:mb-3 border border-white/10">
              <div
                className="h-full bg-gradient-to-r from-purple-400 via-violet-400 to-fuchsia-400 rounded-full transition-all duration-700"
                style={{ width: `${completionReport.totalPercent}%` }}
              />
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-1 sm:gap-2 pt-1.5 sm:pt-2 border-t border-white/10 text-center">
              <div>
                <div className="text-[11px] sm:text-xs font-black text-amber-300">🔥 {progressStats.streakDays}d</div>
                <div className="text-[8px] sm:text-[9px] text-purple-200/80 uppercase font-bold">Streak</div>
              </div>
              <div>
                <div className="text-[11px] sm:text-xs font-black text-purple-300">🏆 {progressStats.badgesCount}</div>
                <div className="text-[8px] sm:text-[9px] text-purple-200/80 uppercase font-bold">Badges</div>
              </div>
              <div>
                <div className="text-[11px] sm:text-xs font-black text-purple-200">💻 {progressStats.questionsSolved}</div>
                <div className="text-[8px] sm:text-[9px] text-purple-200/80 uppercase font-bold">Solved</div>
              </div>
            </div>
          </div>
        </div>

        {/* Expandable Checklist Drawer */}
        <AnimatePresence>
          {showChecklist && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-6 pt-5 border-t border-white/15 overflow-hidden"
            >
              <h3 className="text-xs font-black uppercase tracking-wider text-purple-200 mb-3">
                Profile Completeness Breakdown
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {Object.entries(completionReport.sections).map(([key, item]) => (
                  <div
                    key={key}
                    className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                      item.completed
                        ? "bg-purple-500/20 border-purple-300/40 text-emerald-100"
                        : "bg-white/5 border-white/10 text-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {item.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-purple-300 shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-white/40 flex items-center justify-center text-[9px] text-white/60">
                          !
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-white text-[11px]">{item.label}</div>
                        <div className="text-[9px] text-white/70">{item.details}</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-black shrink-0 px-1.5 py-0.5 rounded bg-black/20 text-white/90">
                      {item.score}/{item.maxScore}%
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 2. SECTION TABS / QUICK JUMP BAR                                    */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold scrollbar-none">
        <a href="#personal" className="px-3.5 py-2 rounded-xl bg-white border border-purple-100/80 hover:border-purple-300 hover:bg-purple-50/70 text-slate-700 hover:text-purple-900 shadow-sm whitespace-nowrap transition-all">
          👤 Personal Details
        </a>
        <a href="#skills" className="px-3.5 py-2 rounded-xl bg-white border border-purple-100/80 hover:border-purple-300 hover:bg-purple-50/70 text-slate-700 hover:text-purple-900 shadow-sm whitespace-nowrap transition-all">
          ⚡ Skills Hub ({profileData.skills.length})
        </a>
        <a href="#resume" className="px-3.5 py-2 rounded-xl bg-white border border-purple-100/80 hover:border-purple-300 hover:bg-purple-50/70 text-slate-700 hover:text-purple-900 shadow-sm whitespace-nowrap transition-all">
          📄 Resume Central
        </a>
        <a href="#experience" className="px-3.5 py-2 rounded-xl bg-white border border-purple-100/80 hover:border-purple-300 hover:bg-purple-50/70 text-slate-700 hover:text-purple-900 shadow-sm whitespace-nowrap transition-all">
          💼 Experience & Education
        </a>
        <a href="#projects" className="px-3.5 py-2 rounded-xl bg-white border border-purple-100/80 hover:border-purple-300 hover:bg-purple-50/70 text-slate-700 hover:text-purple-900 shadow-sm whitespace-nowrap transition-all">
          🚀 Projects & Honors
        </a>
        <a href="#preferences" className="px-3.5 py-2 rounded-xl bg-white border border-purple-100/80 hover:border-purple-300 hover:bg-purple-50/70 text-slate-700 hover:text-purple-900 shadow-sm whitespace-nowrap transition-all">
          🎯 Career Preferences
        </a>
        <a href="#developer" className="px-3.5 py-2 rounded-xl bg-white border border-purple-100/80 hover:border-purple-300 hover:bg-purple-50/70 text-slate-700 hover:text-purple-900 shadow-sm whitespace-nowrap transition-all">
          💻 Developer Platforms
        </a>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 3. SECTION: PERSONAL DETAILS & ABOUT BIO                            */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div id="personal" className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100/80 shadow-[0_4px_25px_-5px_rgba(112,51,212,0.06)] space-y-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-100 to-violet-100 text-[#5B1FA6]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Personal Details</h2>
              <p className="text-xs text-slate-500 font-medium">
                Public professional identity and private contact verification
              </p>
            </div>
          </div>
          {personalMsg && (
            <div className="p-2.5 px-4 rounded-xl bg-purple-50 border border-purple-200 text-purple-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-purple-600" />
              <span>{personalMsg}</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSavePersonal} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="text-[11px] font-black text-slate-600 uppercase tracking-wider block mb-1.5">
                Full Legal Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={personalForm.full_name || ""}
                onChange={(e) => setPersonalForm({ ...personalForm, full_name: e.target.value })}
                placeholder="e.g. Adithya Palamoor"
                required
                className="w-full bg-white border border-slate-200 px-4 py-3 text-xs font-semibold text-slate-900 rounded-xl focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 focus:bg-white outline-none transition-all"
              />
            </div>

            <div>
              <label className="text-[11px] font-black text-slate-600 uppercase tracking-wider block mb-1.5">
                Professional Headline
              </label>
              <input
                type="text"
                value={personalForm.headline || ""}
                onChange={(e) => setPersonalForm({ ...personalForm, headline: e.target.value })}
                placeholder="e.g. Full Stack Developer | React, Node.js & Cloud"
                className="w-full bg-white border border-slate-200 px-4 py-3 text-xs font-semibold text-slate-900 rounded-xl focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 focus:bg-white outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="text-[11px] font-black text-slate-600 uppercase tracking-wider block mb-1.5">
                Country
              </label>
              <input
                type="text"
                value={personalForm.country || ""}
                onChange={(e) => setPersonalForm({ ...personalForm, country: e.target.value })}
                placeholder="e.g. India"
                className="w-full bg-white border border-slate-200 px-4 py-3 text-xs font-semibold text-slate-900 rounded-xl focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 focus:bg-white outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-black text-slate-600 uppercase tracking-wider block mb-1.5">
                State / Region
              </label>
              <input
                type="text"
                value={personalForm.state || ""}
                onChange={(e) => setPersonalForm({ ...personalForm, state: e.target.value })}
                placeholder="e.g. Telangana"
                className="w-full bg-white border border-slate-200 px-4 py-3 text-xs font-semibold text-slate-900 rounded-xl focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 focus:bg-white outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-black text-slate-600 uppercase tracking-wider block mb-1.5">
                City
              </label>
              <input
                type="text"
                value={personalForm.city || ""}
                onChange={(e) => setPersonalForm({ ...personalForm, city: e.target.value })}
                placeholder="e.g. Hyderabad"
                className="w-full bg-white border border-slate-200 px-4 py-3 text-xs font-semibold text-slate-900 rounded-xl focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 focus:bg-white outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-black text-slate-600 uppercase tracking-wider block">
                  Phone Number
                </label>
                <span className="text-[10px] font-extrabold text-purple-700 bg-emerald-100 px-2 py-0.5 rounded flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" /> Private • Never shared
                </span>
              </div>
              <input
                type="tel"
                value={personalForm.phone || ""}
                onChange={(e) => setPersonalForm({ ...personalForm, phone: e.target.value })}
                placeholder="e.g. +91 9876543210"
                className="w-full bg-white border border-slate-200 px-4 py-3 text-xs font-semibold text-slate-900 rounded-xl focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 focus:bg-white outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-black text-slate-600 uppercase tracking-wider block mb-1.5">
                Gender Identity
              </label>
              <select
                value={personalForm.gender || "Prefer not to say"}
                onChange={(e) => setPersonalForm({ ...personalForm, gender: e.target.value })}
                className="w-full bg-white border border-slate-200 px-4 py-3 text-xs font-semibold text-slate-900 rounded-xl focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 focus:bg-white outline-none cursor-pointer"
              >
                <option value="Prefer not to say">Prefer not to say</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Non-binary">Non-binary</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-black text-slate-600 uppercase tracking-wider block mb-1.5">
              About / Professional Bio
            </label>
            <textarea
              rows={3}
              value={personalForm.about || ""}
              onChange={(e) => setPersonalForm({ ...personalForm, about: e.target.value })}
              placeholder="Tell recruiters and peers about your journey, passions, and what drives you..."
              className="w-full bg-white border border-slate-200 p-4 text-xs font-medium text-slate-900 rounded-xl focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 focus:bg-white outline-none resize-none leading-relaxed"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingPersonal}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#4A1584] via-[#6320B5] to-[#7E22CE] hover:from-[#3c106d] hover:via-[#521996] hover:to-[#6b1cb1] text-white font-black text-xs transition-all shadow-md shadow-purple-900/20 hover:shadow-lg hover:shadow-purple-900/30 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {savingPersonal ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Saving Personal Details...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Personal Details</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 4. SECTION: SKILLS HUB                                              */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div id="skills" className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100/80 shadow-[0_4px_25px_-5px_rgba(112,51,212,0.06)] space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-100 text-amber-800">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Skills Hub</h2>
                <span className="text-xs font-black px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {profileData.skills.length} Total
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Categorized skill proficiencies matched against job descriptions and ATS parsers
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setEditingItem(null);
              setActiveModal("skill");
            }}
            className="px-4 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#5B1FA6] border border-purple-200 font-black text-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Skill</span>
          </button>
        </div>

        {/* Skills Tag Cloud */}
        {profileData.skills.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center space-y-2">
            <p className="text-xs font-bold text-slate-600">No skills added yet.</p>
            <p className="text-[11px] text-slate-400">
              Add at least 3 skills (e.g. React, Python, Data Structures) to boost your profile strength by +15%.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Categorized rendering */}
            {["Technical", "Frameworks", "Languages", "Tools", "Soft Skills"].map((cat) => {
              const catSkills = profileData.skills.filter(
                (s) => (s.category || "Technical").toLowerCase() === cat.toLowerCase()
              );
              if (catSkills.length === 0) return null;

              return (
                <div key={cat} className="space-y-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                    {cat}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {catSkills.map((s) => (
                      <div
                        key={s.id || s.skill_name}
                        className="group pl-3 pr-2 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all flex items-center gap-2"
                      >
                        <span className="text-xs font-extrabold text-slate-800">{s.skill_name || (s as any).name}</span>
                        <span
                          className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                            (s.proficiency || (s as any).level) === "Expert"
                              ? "bg-purple-100 text-purple-700"
                              : (s.proficiency || (s as any).level) === "Advanced"
                              ? "bg-purple-100 text-purple-700"
                              : (s.proficiency || (s as any).level) === "Intermediate"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {s.proficiency || (s as any).level || "Intermediate"}
                        </span>
                        <button
                          onClick={() => handleDeleteSkill(s.id || s.skill_name)}
                          className="text-slate-400 hover:text-rose-600 transition-colors p-0.5 cursor-pointer"
                          title="Remove skill"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 5. SECTION: RESUME CENTRAL & ATS COMPATIBILITY                       */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div id="resume" className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100/80 shadow-[0_4px_25px_-5px_rgba(112,51,212,0.06)] space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-indigo-100 text-indigo-700">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Resume Central</h2>
              <p className="text-xs text-slate-500 font-medium">
                Upload your resume for real-time ATS compatibility scoring and AI role benchmarking
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <input
              type="file"
              ref={fileInputRef}
              accept=".pdf"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) handleResumeUpload(e.target.files[0]);
              }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingResume}
              className="px-4 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-black text-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {uploadingResume ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Analyzing Resume...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  <span>Upload New Resume (PDF)</span>
                </>
              )}
            </button>

            <Link
              href="/career"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#4A1584] via-[#6320B5] to-[#7E22CE] hover:from-[#3c106d] hover:via-[#521996] hover:to-[#6b1cb1] text-white font-black text-xs transition-all shadow-md shadow-purple-900/20 flex items-center gap-1.5 shadow-sm"
            >
              <span>Deep AI Review</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {resumeMsg && (
          <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-bold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>{resumeMsg}</span>
          </div>
        )}

        {/* Current Resume Info Card */}
        {profileData.resume?.filename ? (
          <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-50 to-indigo-50/40 border border-indigo-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shrink-0">
                PDF
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900">{profileData.resume.filename}</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  {profileData.resume.summary || "Ready for technical recruiters"} • Uploaded {profileData.resume.updated_at ? new Date(profileData.resume.updated_at).toLocaleDateString() : "Recently"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  ATS Score
                </span>
                <span
                  className={`text-xl font-black ${
                    (profileData.resume.ats_score || 0) >= 80
                      ? "text-purple-600"
                      : (profileData.resume.ats_score || 0) >= 60
                      ? "text-amber-600"
                      : "text-rose-600"
                  }`}
                >
                  {profileData.resume.ats_score || profileData.resume.overall_score || 75} / 100
                </span>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                title="Replace Resume"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="p-8 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 hover:border-indigo-400 transition-colors text-center cursor-pointer space-y-2"
          >
            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center mx-auto">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div className="text-xs font-black text-slate-800">
              Click to upload your resume (PDF only, max 5MB)
            </div>
            <div className="text-[11px] text-slate-500">
              Our AI extractor tests against standard ATS benchmarks and unlocks +20% profile strength.
            </div>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 6. SECTION: EXPERIENCE & EDUCATION DUAL CONTAINER                   */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div id="experience" className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Experience List */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-blue-100 text-blue-700">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">Work Experience</h3>
                <p className="text-xs text-slate-500 font-medium">Internships, contracts, and full-time roles</p>
              </div>
            </div>
            <button
              onClick={() => {
                setEditingItem(null);
                setActiveModal("experience");
              }}
              className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors cursor-pointer"
              title="Add Experience"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {profileData.experiences.length === 0 ? (
            <div className="p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-500">
              No experience added. Add your internship, freelancing, or student lead roles.
            </div>
          ) : (
            <div className="space-y-3">
              {profileData.experiences.map((exp) => (
                <div key={exp.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 relative group space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-black text-slate-900">{exp.role || (exp as any).job_title}</h4>
                      <p className="text-xs font-semibold text-blue-700">{exp.company_name}</p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setEditingItem(exp);
                          setActiveModal("experience");
                        }}
                        className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteExperience(exp.id!)}
                        className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-500 font-medium">
                    <span>{exp.work_type || "Full-time"}</span>
                    <span>•</span>
                    <span>{exp.employment_type || "Remote"}</span>
                    {exp.location && (
                      <>
                        <span>•</span>
                        <span>{exp.location}</span>
                      </>
                    )}
                    <span>•</span>
                    <span>{exp.start_date || "N/A"} – {exp.currently_working ?? (exp as any).is_current ? "Present" : exp.end_date || "Present"}</span>
                  </div>
                  {exp.description && (
                    <p className="text-[11px] text-slate-600 font-normal pt-1 line-clamp-2">
                      {exp.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Education List */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-100 to-violet-100 text-[#5B1FA6]">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">Education</h3>
                <p className="text-xs text-slate-500 font-medium">University, college, degree, and GPA</p>
              </div>
            </div>
            <button
              onClick={() => {
                setEditingItem(null);
                setActiveModal("education");
              }}
              className="p-2 rounded-xl bg-emerald-50 hover:bg-purple-100 text-purple-800 transition-colors cursor-pointer"
              title="Add Education"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {profileData.education.length === 0 ? (
            <div className="p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-500">
              No education added yet. Add your degree and college details.
            </div>
          ) : (
            <div className="space-y-3">
              {profileData.education.map((edu) => (
                <div key={edu.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 relative group space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-black text-slate-900">{edu.college || (edu as any).institution}</h4>
                      <p className="text-xs font-semibold text-purple-800">
                        {edu.degree_type || (edu as any).degree} {edu.field_of_study ? `in ${edu.field_of_study}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setEditingItem(edu);
                          setActiveModal("education");
                        }}
                        className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteEducation(edu.id!)}
                        className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-500 font-medium">
                    <span>{edu.start_date || (edu as any).start_year ? `${edu.start_date || (edu as any).start_year} – ` : ""}{edu.currently_studying ?? (edu as any).is_current ? "Present" : edu.end_date || (edu as any).end_year || "Present"}</span>
                    {edu.gpa !== undefined && edu.gpa !== null && (
                      <>
                        <span>•</span>
                        <span className="font-bold text-slate-700">GPA: {edu.gpa}</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 7. SECTION: PROJECTS & CERTIFICATIONS                               */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div id="projects" className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Portfolio Projects */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-teal-100 text-teal-700">
                <FolderGit2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">Portfolio Projects</h3>
                <p className="text-xs text-slate-500 font-medium">Showcase real software, repos, and live demos</p>
              </div>
            </div>
            <button
              onClick={() => {
                setEditingItem(null);
                setActiveModal("project");
              }}
              className="p-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-700 transition-colors cursor-pointer"
              title="Add Project"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {profileData.projects.length === 0 ? (
            <div className="p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-500">
              No projects added yet. Add at least 2 projects with GitHub links (+15% score).
            </div>
          ) : (
            <div className="space-y-3">
              {profileData.projects.map((proj) => (
                <div key={proj.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 relative group space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-black text-slate-900">{proj.project_name || (proj as any).title}</h4>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setEditingItem(proj);
                          setActiveModal("project");
                        }}
                        className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteProject(proj.id!)}
                        className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  {proj.description && (
                    <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                      {proj.description}
                    </p>
                  )}
                  {((proj.technologies && proj.technologies.length > 0) || ((proj as any).tech_stack && (proj as any).tech_stack.length > 0)) && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {(proj.technologies || (proj as any).tech_stack).map((t: string) => (
                        <span key={t} className="text-[9px] font-bold px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-3 pt-1 text-[10px] font-bold">
                    {proj.github_url && (
                      <a
                        href={proj.github_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-teal-700 hover:underline flex items-center gap-1"
                      >
                        <span>GitHub Repo</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {(proj.live_demo_url || (proj as any).demo_url) && (
                      <a
                        href={proj.live_demo_url || (proj as any).demo_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-purple-700 hover:underline flex items-center gap-1"
                      >
                        <span>Live Demo</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Certifications & Achievements */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-purple-100 text-purple-700">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">Certifications & Honors</h3>
                <p className="text-xs text-slate-500 font-medium">Verified credentials, hackathons, and awards</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setEditingItem(null);
                  setActiveModal("cert");
                }}
                className="px-2.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-[11px] font-black transition-colors cursor-pointer"
              >
                + Cert
              </button>
              <button
                onClick={() => {
                  setEditingItem(null);
                  setActiveModal("achievement");
                }}
                className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-black transition-colors cursor-pointer"
              >
                + Award
              </button>
            </div>
          </div>

          {profileData.certifications.length === 0 && profileData.achievements.length === 0 ? (
            <div className="p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-500">
              No certifications or awards added. Showcase AWS, GCP, Coursera, or Hackathon wins.
            </div>
          ) : (
            <div className="space-y-3">
              {profileData.certifications.map((c) => (
                <div key={c.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 relative group space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-black text-slate-900">{c.certification_name || (c as any).name}</h4>
                      <p className="text-xs font-semibold text-purple-700">{c.issuing_organization}</p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleDeleteCertification(c.id!)}
                        className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-slate-500 font-medium">
                    <span>Issued: {c.issue_date || "Verified"}</span>
                    {c.credential_url && (
                      <a href={c.credential_url} target="_blank" rel="noreferrer" className="text-purple-700 hover:underline flex items-center gap-1">
                        <span>Credential</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}

              {profileData.achievements.map((a) => (
                <div key={a.id} className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200/70 relative group space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                        <span>🏆</span> {a.achievement_name || (a as any).title}
                      </h4>
                      {(a.organization || (a as any).issuer) && (
                        <p className="text-xs font-semibold text-amber-800">{a.organization || (a as any).issuer}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteAchievement(a.id!)}
                      className="p-1 text-slate-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-amber-900/60 font-medium">
                    {a.achievement_date && <span>Date: {a.achievement_date}</span>}
                  </div>
                  {a.description && <p className="text-[11px] text-amber-900/80">{a.description}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 8. SECTION: CAREER PREFERENCES                                      */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div id="preferences" className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100/80 shadow-[0_4px_25px_-5px_rgba(112,51,212,0.06)] space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-rose-100 text-rose-700">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Career Preferences</h2>
              <p className="text-xs text-slate-500 font-medium">
                Desired job roles, target tech companies, and preferred work environments
              </p>
            </div>
          </div>
          {careerPrefsMsg && (
            <div className="p-2.5 px-4 rounded-xl bg-purple-50 border border-purple-200 text-purple-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-purple-600" />
              <span>{careerPrefsMsg}</span>
            </div>
          )}
        </div>

        <div className="space-y-5">
          {/* Target Roles */}
          <div>
            <label className="text-[11px] font-black text-slate-600 uppercase tracking-wider block mb-1.5">
              Target Job Roles
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={roleInput}
                onChange={(e) => setRoleInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (roleInput.trim()) {
                      setCareerPrefsForm({
                        ...careerPrefsForm,
                        target_roles: [...(careerPrefsForm.target_roles || []), roleInput.trim()],
                      });
                      setRoleInput("");
                    }
                  }
                }}
                placeholder="e.g. SDE-1, Full Stack Developer, DevOps Engineer (Press Enter)"
                className="flex-1 bg-white border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-900 rounded-xl focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 focus:bg-white outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  if (roleInput.trim()) {
                    setCareerPrefsForm({
                      ...careerPrefsForm,
                      target_roles: [...(careerPrefsForm.target_roles || []), roleInput.trim()],
                    });
                    setRoleInput("");
                  }
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                Add Role
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {careerPrefsForm.target_roles?.map((r, i) => (
                <span
                  key={i}
                  className="pl-3 pr-2 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 text-xs font-extrabold flex items-center gap-1.5"
                >
                  <span>{r}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setCareerPrefsForm({
                        ...careerPrefsForm,
                        target_roles: careerPrefsForm.target_roles?.filter((_, idx) => idx !== i),
                      })
                    }
                    className="text-rose-400 hover:text-rose-700 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Target Dream Companies */}
          <div>
            <label className="text-[11px] font-black text-slate-600 uppercase tracking-wider block mb-1.5">
              Dream Companies
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={companyInput}
                onChange={(e) => setCompanyInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (companyInput.trim()) {
                      setCareerPrefsForm({
                        ...careerPrefsForm,
                        target_companies: [...(careerPrefsForm.target_companies || []), companyInput.trim()],
                      });
                      setCompanyInput("");
                    }
                  }
                }}
                placeholder="e.g. Google, Microsoft, Atlassian, Uber, Flipkart (Press Enter)"
                className="flex-1 bg-white border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-900 rounded-xl focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 focus:bg-white outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  if (companyInput.trim()) {
                    setCareerPrefsForm({
                      ...careerPrefsForm,
                      target_companies: [...(careerPrefsForm.target_companies || []), companyInput.trim()],
                    });
                    setCompanyInput("");
                  }
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                Add Company
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {careerPrefsForm.target_companies?.map((c, i) => (
                <span
                  key={i}
                  className="pl-3 pr-2 py-1 rounded-lg bg-purple-50 border border-purple-200 text-purple-900 text-xs font-extrabold flex items-center gap-1.5"
                >
                  <span>{c}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setCareerPrefsForm({
                        ...careerPrefsForm,
                        target_companies: careerPrefsForm.target_companies?.filter((_, idx) => idx !== i),
                      })
                    }
                    className="text-purple-300 hover:text-purple-700 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Work Arrangement Toggles */}
          <div>
            <label className="text-[11px] font-black text-slate-600 uppercase tracking-wider block mb-2">
              Work Arrangements
            </label>
            <div className="flex flex-wrap gap-2.5">
              {["Remote", "Hybrid", "Onsite"].map((arr) => {
                const isSelected = (careerPrefsForm.work_arrangements || []).includes(arr);
                return (
                  <button
                    key={arr}
                    type="button"
                    onClick={() => {
                      const curr = careerPrefsForm.work_arrangements || [];
                      const next = isSelected ? curr.filter((x) => x !== arr) : [...curr, arr];
                      setCareerPrefsForm({ ...careerPrefsForm, work_arrangements: next });
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      isSelected
                        ? "bg-gradient-to-r from-[#4A1584] to-[#7E22CE] text-white shadow-sm"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {arr}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preferred Locations */}
          <div>
            <label className="text-[11px] font-black text-slate-600 uppercase tracking-wider block mb-1.5">
              Preferred Locations
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (locationInput.trim()) {
                      setCareerPrefsForm({
                        ...careerPrefsForm,
                        preferred_locations: [...(careerPrefsForm.preferred_locations || []), locationInput.trim()],
                      });
                      setLocationInput("");
                    }
                  }
                }}
                placeholder="e.g. Bengaluru, Hyderabad, Pune, Remote, Singapore (Press Enter)"
                className="flex-1 bg-white border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-900 rounded-xl focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 focus:bg-white outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  if (locationInput.trim()) {
                    setCareerPrefsForm({
                      ...careerPrefsForm,
                      preferred_locations: [...(careerPrefsForm.preferred_locations || []), locationInput.trim()],
                    });
                    setLocationInput("");
                  }
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                Add Location
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {careerPrefsForm.preferred_locations?.map((loc, i) => (
                <span
                  key={i}
                  className="pl-3 pr-2 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 text-xs font-extrabold flex items-center gap-1.5"
                >
                  <span>{loc}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setCareerPrefsForm({
                        ...careerPrefsForm,
                        preferred_locations: careerPrefsForm.preferred_locations?.filter((_, idx) => idx !== i),
                      })
                    }
                    className="text-blue-400 hover:text-blue-700 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Preferred Industries */}
          <div>
            <label className="text-[11px] font-black text-slate-600 uppercase tracking-wider block mb-1.5">
              Target Industries
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={industryInput}
                onChange={(e) => setIndustryInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (industryInput.trim()) {
                      setCareerPrefsForm({
                        ...careerPrefsForm,
                        preferred_industries: [...(careerPrefsForm.preferred_industries || []), industryInput.trim()],
                      });
                      setIndustryInput("");
                    }
                  }
                }}
                placeholder="e.g. FinTech, AI/ML, EdTech, SaaS, Healthcare (Press Enter)"
                className="flex-1 bg-white border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-900 rounded-xl focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 focus:bg-white outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  if (industryInput.trim()) {
                    setCareerPrefsForm({
                      ...careerPrefsForm,
                      preferred_industries: [...(careerPrefsForm.preferred_industries || []), industryInput.trim()],
                    });
                    setIndustryInput("");
                  }
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                Add Industry
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {careerPrefsForm.preferred_industries?.map((ind, i) => (
                <span
                  key={i}
                  className="pl-3 pr-2 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs font-extrabold flex items-center gap-1.5"
                >
                  <span>{ind}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setCareerPrefsForm({
                        ...careerPrefsForm,
                        preferred_industries: careerPrefsForm.preferred_industries?.filter((_, idx) => idx !== i),
                      })
                    }
                    className="text-amber-400 hover:text-amber-700 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleSaveCareerPreferences}
              disabled={savingCareerPrefs}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#4A1584] via-[#6320B5] to-[#7E22CE] hover:from-[#3c106d] hover:via-[#521996] hover:to-[#6b1cb1] text-white font-black text-xs transition-all shadow-md shadow-purple-900/20 hover:shadow-lg hover:shadow-purple-900/30 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {savingCareerPrefs ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Saving Preferences...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Career Preferences</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 9. SECTION: DEVELOPER & CODING PLATFORMS (ALL 6 SURFACED)           */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div id="developer" className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100/80 shadow-[0_4px_25px_-5px_rgba(112,51,212,0.06)] space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-blue-100 text-blue-700">
              <Code2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Developer & Coding Profiles
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Connect your accounts across all 6 major competitive programming and software platforms
              </p>
            </div>
          </div>

          {codingMsg && (
            <div className="p-2.5 px-4 rounded-xl bg-purple-50 border border-purple-200 text-purple-800 text-xs font-bold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>{codingMsg}</span>
            </div>
          )}
        </div>

        {/* 6 Platforms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <PlatformInputCard
            platformKey="leetcode"
            title="LeetCode"
            dotColor="bg-amber-400"
            placeholder="Username or https://leetcode.com/u/..."
            value={leetcodeInput}
            onChange={setLeetcodeInput}
            stat={codingStats.leetcode}
          />
          <PlatformInputCard
            platformKey="github"
            title="GitHub"
            dotColor="bg-slate-900"
            placeholder="Username or https://github.com/..."
            value={githubInput}
            onChange={setGithubInput}
            stat={codingStats.github}
          />
          <PlatformInputCard
            platformKey="codeforces"
            title="Codeforces"
            dotColor="bg-rose-500"
            placeholder="Handle or https://codeforces.com/profile/..."
            value={codeforcesInput}
            onChange={setCodeforcesInput}
            stat={codingStats.codeforces}
          />
          <PlatformInputCard
            platformKey="codechef"
            title="CodeChef"
            dotColor="bg-amber-800"
            placeholder="Username or https://www.codechef.com/users/..."
            value={codechefInput}
            onChange={setCodechefInput}
            stat={codingStats.codechef}
          />
          <PlatformInputCard
            platformKey="hackerrank"
            title="HackerRank"
            dotColor="bg-purple-500"
            placeholder="Username or https://www.hackerrank.com/profile/..."
            value={hackerrankInput}
            onChange={setHackerrankInput}
            stat={codingStats.hackerrank}
          />
          <PlatformInputCard
            platformKey="geeksforgeeks"
            title="GeeksforGeeks"
            dotColor="bg-green-600"
            placeholder="Username or https://auth.geeksforgeeks.org/user/..."
            value={gfgInput}
            onChange={setGfgInput}
            stat={codingStats.geeksforgeeks}
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleSaveCoding}
            disabled={syncingCoding}
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs tracking-wide transition-all shadow-md shadow-indigo-600/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {syncingCoding ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Extracting Live Platform Stats...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save & Sync Developer Profiles</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 10. SECTION: EARNED MILESTONES & CAREER BADGES (PRESERVED)           */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100/80 shadow-[0_4px_25px_-5px_rgba(112,51,212,0.06)] space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3.5 rounded-2xl bg-purple-100 text-purple-700 shrink-0">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                  Earned Milestones & Career Badges
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                  {progressStats.badgesCount} of {progressStats.badges.length} Unlocked
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Track unlocked platform achievements based on daily streaks, questions solved, videos, and roadmaps.
              </p>
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
                  b.unlocked ? "bg-purple-600 text-white" : "bg-slate-200 text-slate-600"
                }`}
              >
                {b.unlocked ? "Earned" : b.progressText || "Locked"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 11. SECTION: FOUNDER SUPPORT CARD & LEGAL POLICIES (PRESERVED)      */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-[#5B1FA6]">
              <LifeBuoy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">
                Customer Service & Legal Policies
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Direct founder access, 24/7 help desk, and student rights compliance
              </p>
            </div>
          </div>
          <Link
            href="/support"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#4A1584] via-[#6320B5] to-[#7E22CE] hover:from-[#3c106d] hover:via-[#521996] hover:to-[#6b1cb1] text-white font-bold text-xs shadow-xs transition-colors"
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
              <span className="w-2 h-2 rounded-full bg-purple-500" />
            </div>
            <span className="text-[11px] text-slate-500 block">Personal query review & 24h SLA</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Phone & WhatsApp</span>
            <a href="tel:+917330602101" className="font-extrabold text-xs sm:text-sm text-purple-700 hover:underline flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" />
              <span>+91 7330602101</span>
            </a>
            <span className="text-[11px] text-slate-500 block">Available Mon–Sat: 9 AM–8 PM IST</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Support & Grievance Email</span>
            <a href="mailto:palamooradithyagoud@gmail.com" className="font-extrabold text-xs text-purple-700 hover:underline flex items-center gap-1.5 truncate">
              <Mail className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">palamooradithyagoud@gmail.com</span>
            </a>
            <span className="text-[11px] text-slate-500 block">Statutory compliance & refund requests</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 text-[11px] text-slate-500 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-purple-600 shrink-0" />
          <span>Applicable Policies:</span>
          <Link href="/support" className="text-purple-700 hover:underline">Privacy Policy (DPDP Act)</Link>
          <span>•</span>
          <Link href="/support" className="text-purple-700 hover:underline">Terms of Service</Link>
          <span>•</span>
          <Link href="/support" className="text-purple-700 hover:underline">7-Day Refund Policy</Link>
          <span>•</span>
          <Link href="/support" className="text-purple-700 hover:underline">Grievance Redressal</Link>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 12. INTERACTIVE MODALS                                               */}
      {/* ─────────────────────────────────────────────────────────────────── */}

      {/* MODAL: ADD/EDIT SKILL */}
      <ModalShell
        isOpen={activeModal === "skill"}
        onClose={() => {
          setActiveModal(null);
          setModalError("");
        }}
        title="Add Skill to Hub"
        error={modalError}
      >
        <SkillModalForm
          onSave={async (skill) => {
            setModalError("");
            const res = await saveSkill(skill);
            if (res.success && res.skill) {
              setProfileData((prev) => {
                const nextSkills = prev.skills.filter((s) => s.id !== res.skill!.id && s.skill_name.toLowerCase() !== res.skill!.skill_name.toLowerCase());
                nextSkills.push(res.skill!);
                return { ...prev, skills: nextSkills };
              });
              setActiveModal(null);
            } else {
              setModalError(res.error || "Failed to save skill to database.");
            }
          }}
          onClose={() => {
            setActiveModal(null);
            setModalError("");
          }}
        />
      </ModalShell>

      {/* MODAL: ADD/EDIT EXPERIENCE */}
      <ModalShell
        isOpen={activeModal === "experience"}
        onClose={() => {
          setActiveModal(null);
          setModalError("");
        }}
        title={editingItem ? "Edit Experience" : "Add Work Experience"}
        error={modalError}
      >
        <ExperienceModalForm
          initialData={editingItem}
          onSave={async (exp) => {
            setModalError("");
            const res = await saveExperience(exp);
            if (res.success && res.experience) {
              setProfileData((prev) => {
                const existing = prev.experiences.filter((e) => e.id !== res.experience!.id);
                return { ...prev, experiences: [res.experience!, ...existing] };
              });
              setActiveModal(null);
            } else {
              setModalError(res.error || "Failed to save experience to database.");
            }
          }}
          onClose={() => {
            setActiveModal(null);
            setModalError("");
          }}
        />
      </ModalShell>

      {/* MODAL: ADD/EDIT EDUCATION */}
      <ModalShell
        isOpen={activeModal === "education"}
        onClose={() => {
          setActiveModal(null);
          setModalError("");
        }}
        title={editingItem ? "Edit Education" : "Add Education"}
        error={modalError}
      >
        <EducationModalForm
          initialData={editingItem}
          onSave={async (edu) => {
            setModalError("");
            const res = await saveEducation(edu);
            if (res.success && res.education) {
              setProfileData((prev) => {
                const existing = prev.education.filter((e) => e.id !== res.education!.id);
                return { ...prev, education: [res.education!, ...existing] };
              });
              setActiveModal(null);
            } else {
              setModalError(res.error || "Failed to save education to database.");
            }
          }}
          onClose={() => {
            setActiveModal(null);
            setModalError("");
          }}
        />
      </ModalShell>

      {/* MODAL: ADD/EDIT PROJECT */}
      <ModalShell
        isOpen={activeModal === "project"}
        onClose={() => {
          setActiveModal(null);
          setModalError("");
        }}
        title={editingItem ? "Edit Project" : "Add Portfolio Project"}
        error={modalError}
      >
        <ProjectModalForm
          initialData={editingItem}
          onSave={async (proj) => {
            setModalError("");
            const res = await saveProject(proj);
            if (res.success && res.project) {
              setProfileData((prev) => {
                const existing = prev.projects.filter((p) => p.id !== res.project!.id);
                return { ...prev, projects: [res.project!, ...existing] };
              });
              setActiveModal(null);
            } else {
              setModalError(res.error || "Failed to save project to database.");
            }
          }}
          onClose={() => {
            setActiveModal(null);
            setModalError("");
          }}
        />
      </ModalShell>

      {/* MODAL: ADD CERTIFICATION */}
      <ModalShell
        isOpen={activeModal === "cert"}
        onClose={() => {
          setActiveModal(null);
          setModalError("");
        }}
        title="Add Certification"
        error={modalError}
      >
        <CertificationModalForm
          onSave={async (cert) => {
            setModalError("");
            const res = await saveCertification(cert);
            if (res.success && res.certification) {
              setProfileData((prev) => ({
                ...prev,
                certifications: [res.certification!, ...prev.certifications.filter((c) => c.id !== res.certification!.id)],
              }));
              setActiveModal(null);
            } else {
              setModalError(res.error || "Failed to save certification to database.");
            }
          }}
          onClose={() => {
            setActiveModal(null);
            setModalError("");
          }}
        />
      </ModalShell>

      {/* MODAL: ADD ACHIEVEMENT */}
      <ModalShell
        isOpen={activeModal === "achievement"}
        onClose={() => {
          setActiveModal(null);
          setModalError("");
        }}
        title="Add Honor / Achievement"
        error={modalError}
      >
        <AchievementModalForm
          onSave={async (ach) => {
            setModalError("");
            const res = await saveAchievement(ach);
            if (res.success && res.achievement) {
              setProfileData((prev) => ({
                ...prev,
                achievements: [res.achievement!, ...prev.achievements.filter((a) => a.id !== res.achievement!.id)],
              }));
              setActiveModal(null);
            } else {
              setModalError(res.error || "Failed to save achievement to database.");
            }
          }}
          onClose={() => {
            setActiveModal(null);
            setModalError("");
          }}
        />
      </ModalShell>

      {/* MODAL: AVATAR PHOTO */}
      <ModalShell
        isOpen={activeModal === "avatar"}
        onClose={() => {
          setActiveModal(null);
          setModalError("");
        }}
        title="Update Profile Photo"
      >
        <AvatarModalForm
          currentUrl={personalForm.avatar_url || ""}
          onSave={async (url) => {
            setPersonalForm((prev) => ({ ...prev, avatar_url: url }));
            await savePersonalProfile({ ...personalForm, avatar_url: url });
            setActiveModal(null);
          }}
          onClose={() => {
            setActiveModal(null);
            setModalError("");
          }}
        />
      </ModalShell>
    </motion.div>
  );
}

// ── SUBCOMPONENT: PLATFORM INPUT CARD ─────────────────────────────────────────

interface PlatformInputCardProps {
  platformKey: string;
  title: string;
  dotColor: string;
  placeholder: string;
  value: string;
  onChange: (val: string) => void;
  stat?: PlatformStat;
}

function PlatformInputCard({
  platformKey,
  title,
  dotColor,
  placeholder,
  value,
  onChange,
  stat,
}: PlatformInputCardProps) {
  const isConfigured = !!(value || (stat && stat.configured));

  return (
    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-purple-500 transition-all space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${dotColor} shadow-sm`} />
          <span className="text-xs font-black text-slate-900">{title}</span>
        </div>
        <span
          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
            isConfigured
              ? "bg-purple-100 text-purple-800 border border-emerald-200"
              : "bg-slate-200 text-slate-600 border border-slate-300"
          }`}
        >
          {stat && stat.badge ? stat.badge : isConfigured ? "Connected" : "Not Linked"}
        </span>
      </div>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white border border-slate-200 px-3 py-2 text-[11px] font-mono text-slate-900 placeholder:text-slate-400 rounded-xl focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 outline-none"
      />

      {stat && stat.summary && (
        <div className="pt-0.5 flex items-center gap-1.5 text-[10px] font-semibold text-purple-800 truncate">
          <Globe className="w-3 h-3 text-[#5B1FA6] shrink-0" />
          <span className="truncate">{stat.summary}</span>
        </div>
      )}
    </div>
  );
}

// ── MODAL SHELL & FORMS ───────────────────────────────────────────────────────

function ModalShell({
  isOpen,
  onClose,
  title,
  error,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  error?: string;
  children: React.ReactNode;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-4 my-8"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-black text-slate-900">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">
            {error}
          </div>
        )}
        {children}
      </motion.div>
    </div>
  );
}

function SkillModalForm({
  onSave,
  onClose,
}: {
  onSave: (skill: { skill_name: string; category: string; proficiency: any }) => void;
  onClose: () => void;
}) {
  const [skillName, setSkillName] = useState("");
  const [category, setCategory] = useState("Technical");
  const [proficiency, setProficiency] = useState("Intermediate");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (skillName.trim()) {
          onSave({ skill_name: skillName.trim(), category, proficiency });
        }
      }}
      className="space-y-4"
    >
      <div>
        <label className="text-[11px] font-black text-slate-600 uppercase tracking-wider block mb-1">
          Skill Name
        </label>
        <input
          type="text"
          value={skillName}
          onChange={(e) => setSkillName(e.target.value)}
          placeholder="e.g. Next.js, Docker, Python, PostgreSQL"
          required
          autoFocus
          className="w-full bg-white border border-slate-200 px-3.5 py-2.5 text-xs font-semibold text-slate-900 rounded-xl focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] font-black text-slate-600 uppercase tracking-wider block mb-1">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-white border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-900 rounded-xl focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 outline-none"
          >
            <option value="Technical">Technical</option>
            <option value="Frameworks">Frameworks</option>
            <option value="Languages">Languages</option>
            <option value="Tools">Tools</option>
            <option value="Soft Skills">Soft Skills</option>
          </select>
        </div>

        <div>
          <label className="text-[11px] font-black text-slate-600 uppercase tracking-wider block mb-1">
            Proficiency
          </label>
          <select
            value={proficiency}
            onChange={(e) => setProficiency(e.target.value)}
            className="w-full bg-white border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-900 rounded-xl focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 outline-none"
          >
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
            <option value="Expert">Expert</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#4A1584] via-[#6320B5] to-[#7E22CE] hover:from-[#3c106d] hover:via-[#521996] hover:to-[#6b1cb1] text-white text-xs font-bold shadow-sm shadow-purple-900/20 cursor-pointer"
        >
          Add Skill
        </button>
      </div>
    </form>
  );
}

function ExperienceModalForm({
  initialData,
  onSave,
  onClose,
}: {
  initialData?: UserExperience;
  onSave: (exp: any) => void;
  onClose: () => void;
}) {
  const [role, setRole] = useState(initialData?.role || (initialData as any)?.job_title || "");
  const [company, setCompany] = useState(initialData?.company_name || "");
  const [location, setLocation] = useState(initialData?.location || "");
  const [workType, setWorkType] = useState(initialData?.work_type || "Full-time");
  const [empType, setEmpType] = useState(initialData?.employment_type || "Remote");
  const [startDate, setStartDate] = useState(initialData?.start_date?.substring(0, 7) || "");
  const [endDate, setEndDate] = useState(initialData?.end_date?.substring(0, 7) || "");
  const [currentlyWorking, setCurrentlyWorking] = useState(initialData?.currently_working ?? (initialData as any)?.is_current ?? false);
  const [desc, setDesc] = useState(initialData?.description || "");
  const [localErr, setLocalErr] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setLocalErr("");
        if (!currentlyWorking && startDate && endDate && endDate < startDate) {
          setLocalErr("End date cannot precede start date.");
          return;
        }
        onSave({
          id: initialData?.id,
          role,
          company_name: company,
          location,
          work_type: workType as any,
          employment_type: empType as any,
          start_date: startDate || undefined,
          end_date: currentlyWorking ? null : (endDate || null),
          currently_working: currentlyWorking,
          description: desc,
        });
      }}
      className="space-y-3.5"
    >
      {localErr && (
        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">
          {localErr}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] font-black text-slate-600 uppercase tracking-wider block mb-1">
            Role / Job Title
          </label>
          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="e.g. Software Engineer Intern"
            required
            className="w-full bg-white border border-slate-200 px-3 py-2 text-xs font-semibold rounded-xl outline-none"
          />
        </div>
        <div>
          <label className="text-[11px] font-black text-slate-600 uppercase tracking-wider block mb-1">
            Company Name
          </label>
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="e.g. Google, Atlassian, Startup"
            required
            className="w-full bg-white border border-slate-200 px-3 py-2 text-xs font-semibold rounded-xl outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-[11px] font-black text-slate-600 uppercase tracking-wider block mb-1">
            Location
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Bengaluru, IN"
            className="w-full bg-white border border-slate-200 px-3 py-2 text-xs font-semibold rounded-xl outline-none"
          />
        </div>
        <div>
          <label className="text-[11px] font-black text-slate-600 uppercase tracking-wider block mb-1">
            Work Type
          </label>
          <select
            value={workType}
            onChange={(e) => setWorkType(e.target.value as any)}
            className="w-full bg-white border border-slate-200 px-3 py-2 text-xs font-semibold rounded-xl outline-none"
          >
            <option value="Full-time">Full-time</option>
            <option value="Internship">Internship</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
            <option value="Freelance">Freelance</option>
          </select>
        </div>
        <div>
          <label className="text-[11px] font-black text-slate-600 uppercase tracking-wider block mb-1">
            Arrangement
          </label>
          <select
            value={empType}
            onChange={(e) => setEmpType(e.target.value as any)}
            className="w-full bg-white border border-slate-200 px-3 py-2 text-xs font-semibold rounded-xl outline-none"
          >
            <option value="Remote">Remote</option>
            <option value="Hybrid">Hybrid</option>
            <option value="Onsite">Onsite</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] font-black text-slate-600 uppercase tracking-wider block mb-1">
            Start Date
          </label>
          <input
            type="month"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full bg-white border border-slate-200 px-3 py-2 text-xs font-semibold rounded-xl outline-none"
          />
        </div>
        <div>
          <label className="text-[11px] font-black text-slate-600 uppercase tracking-wider block mb-1">
            End Date
          </label>
          <input
            type="month"
            disabled={currentlyWorking}
            value={currentlyWorking ? "" : endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full bg-white border border-slate-200 px-3 py-2 text-xs font-semibold rounded-xl outline-none disabled:opacity-50"
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
        <input
          type="checkbox"
          checked={currentlyWorking}
          onChange={(e) => setCurrentlyWorking(e.target.checked)}
          className="rounded text-purple-600 focus:ring-purple-500"
        />
        <span>I currently work here</span>
      </label>

      <div>
        <label className="text-[11px] font-black text-slate-600 uppercase tracking-wider block mb-1">
          Responsibilities / Impact
        </label>
        <textarea
          rows={2}
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="Built REST APIs, reduced latency by 30%..."
          className="w-full bg-white border border-slate-200 p-3 text-xs font-medium rounded-xl outline-none"
        />
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#4A1584] via-[#6320B5] to-[#7E22CE] hover:from-[#3c106d] hover:via-[#521996] hover:to-[#6b1cb1] text-white text-xs font-bold shadow-sm shadow-purple-900/20 cursor-pointer"
        >
          Save Experience
        </button>
      </div>
    </form>
  );
}

function EducationModalForm({
  initialData,
  onSave,
  onClose,
}: {
  initialData?: UserEducation;
  onSave: (edu: any) => void;
  onClose: () => void;
}) {
  const [college, setCollege] = useState(initialData?.college || (initialData as any)?.institution || "");
  const [degreeType, setDegreeType] = useState(initialData?.degree_type || (initialData as any)?.degree || "Bachelor of Technology");
  const [field, setField] = useState(initialData?.field_of_study || "Computer Science");
  const [startDate, setStartDate] = useState(initialData?.start_date?.substring(0, 7) || (initialData as any)?.start_year || "");
  const [endDate, setEndDate] = useState(initialData?.end_date?.substring(0, 7) || (initialData as any)?.end_year || "");
  const [currentlyStudying, setCurrentlyStudying] = useState(initialData?.currently_studying ?? (initialData as any)?.is_current ?? false);
  const [gpa, setGpa] = useState(initialData?.gpa !== undefined && initialData?.gpa !== null ? String(initialData.gpa) : "");
  const [localErr, setLocalErr] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setLocalErr("");
        if (!currentlyStudying && startDate && endDate && endDate < startDate) {
          setLocalErr("End date cannot precede start date.");
          return;
        }
        onSave({
          id: initialData?.id,
          college,
          degree_type: degreeType,
          field_of_study: field,
          start_date: startDate || undefined,
          end_date: currentlyStudying ? null : (endDate || null),
          currently_studying: currentlyStudying,
          gpa: gpa ? gpa.trim() : undefined,
        });
      }}
      className="space-y-3.5"
    >
      {localErr && (
        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">
          {localErr}
        </div>
      )}

      <div>
        <label className="text-[11px] font-black text-slate-600 uppercase tracking-wider block mb-1">
          Institution / College
        </label>
        <input
          type="text"
          value={college}
          onChange={(e) => setCollege(e.target.value)}
          placeholder="e.g. Vardhaman College of Engineering"
          required
          className="w-full bg-white border border-slate-200 px-3 py-2 text-xs font-semibold rounded-xl outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] font-black text-slate-600 uppercase tracking-wider block mb-1">
            Degree Type
          </label>
          <input
            type="text"
            value={degreeType}
            onChange={(e) => setDegreeType(e.target.value)}
            placeholder="e.g. B.Tech / B.E."
            className="w-full bg-white border border-slate-200 px-3 py-2 text-xs font-semibold rounded-xl outline-none"
          />
        </div>
        <div>
          <label className="text-[11px] font-black text-slate-600 uppercase tracking-wider block mb-1">
            Field of Study / Major
          </label>
          <input
            type="text"
            value={field}
            onChange={(e) => setField(e.target.value)}
            placeholder="e.g. Computer Science"
            className="w-full bg-white border border-slate-200 px-3 py-2 text-xs font-semibold rounded-xl outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-[11px] font-black text-slate-600 uppercase tracking-wider block mb-1">
            Start Date
          </label>
          <input
            type="month"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full bg-white border border-slate-200 px-3 py-2 text-xs font-semibold rounded-xl outline-none"
          />
        </div>
        <div>
          <label className="text-[11px] font-black text-slate-600 uppercase tracking-wider block mb-1">
            End Date
          </label>
          <input
            type="month"
            disabled={currentlyStudying}
            value={currentlyStudying ? "" : endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full bg-white border border-slate-200 px-3 py-2 text-xs font-semibold rounded-xl outline-none disabled:opacity-50"
          />
        </div>
        <div>
          <label className="text-[11px] font-black text-slate-600 uppercase tracking-wider block mb-1">
            GPA (out of 10)
          </label>
          <input
            type="text"
            value={gpa}
            onChange={(e) => setGpa(e.target.value)}
            placeholder="e.g. 8.5"
            className="w-full bg-white border border-slate-200 px-3 py-2 text-xs font-semibold rounded-xl outline-none"
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
        <input
          type="checkbox"
          checked={currentlyStudying}
          onChange={(e) => setCurrentlyStudying(e.target.checked)}
          className="rounded text-purple-600 focus:ring-purple-500"
        />
        <span>I am currently studying here</span>
      </label>

      <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#4A1584] via-[#6320B5] to-[#7E22CE] hover:from-[#3c106d] hover:via-[#521996] hover:to-[#6b1cb1] text-white text-xs font-bold shadow-sm shadow-purple-900/20 cursor-pointer"
        >
          Save Education
        </button>
      </div>
    </form>
  );
}

function ProjectModalForm({
  initialData,
  onSave,
  onClose,
}: {
  initialData?: UserProject;
  onSave: (proj: any) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(initialData?.project_name || (initialData as any)?.title || "");
  const [desc, setDesc] = useState(initialData?.description || "");
  const [tech, setTech] = useState(
    initialData?.technologies?.join(", ") || (initialData as any)?.tech_stack?.join(", ") || ""
  );
  const [startDate, setStartDate] = useState(initialData?.start_date?.substring(0, 7) || "");
  const [endDate, setEndDate] = useState(initialData?.end_date?.substring(0, 7) || "");
  const [currentlyWorking, setCurrentlyWorking] = useState(initialData?.currently_working || false);
  const [github, setGithub] = useState(initialData?.github_url || "");
  const [demo, setDemo] = useState(initialData?.live_demo_url || (initialData as any)?.demo_url || "");
  const [localErr, setLocalErr] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setLocalErr("");
        if (!currentlyWorking && startDate && endDate && endDate < startDate) {
          setLocalErr("End date cannot precede start date.");
          return;
        }
        onSave({
          id: initialData?.id,
          project_name: name,
          description: desc,
          technologies: tech
            .split(",")
            .map((t: string) => t.trim())
            .filter(Boolean),
          start_date: startDate || undefined,
          end_date: currentlyWorking ? null : (endDate || null),
          currently_working: currentlyWorking,
          github_url: github,
          live_demo_url: demo,
        });
      }}
      className="space-y-3.5"
    >
      {localErr && (
        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">
          {localErr}
        </div>
      )}

      <div>
        <label className="text-[11px] font-black text-slate-600 uppercase tracking-wider block mb-1">
          Project Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. AI Resume Reviewer & Portfolio Engine"
          required
          className="w-full bg-white border border-slate-200 px-3 py-2 text-xs font-semibold rounded-xl outline-none"
        />
      </div>

      <div>
        <label className="text-[11px] font-black text-slate-600 uppercase tracking-wider block mb-1">
          Description
        </label>
        <textarea
          rows={3}
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="Engineered high-performance full-stack web application with Next.js and Supabase..."
          className="w-full bg-white border border-slate-200 p-3 text-xs font-medium rounded-xl outline-none"
        />
      </div>

      <div>
        <label className="text-[11px] font-black text-slate-600 uppercase tracking-wider block mb-1">
          Technologies (Comma-separated)
        </label>
        <input
          type="text"
          value={tech}
          onChange={(e) => setTech(e.target.value)}
          placeholder="React, TypeScript, Supabase, Tailwind, Docker"
          className="w-full bg-white border border-slate-200 px-3 py-2 text-xs font-semibold rounded-xl outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] font-black text-slate-600 uppercase tracking-wider block mb-1">
            Start Date
          </label>
          <input
            type="month"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full bg-white border border-slate-200 px-3 py-2 text-xs font-semibold rounded-xl outline-none"
          />
        </div>
        <div>
          <label className="text-[11px] font-black text-slate-600 uppercase tracking-wider block mb-1">
            End Date
          </label>
          <input
            type="month"
            disabled={currentlyWorking}
            value={currentlyWorking ? "" : endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full bg-white border border-slate-200 px-3 py-2 text-xs font-semibold rounded-xl outline-none disabled:opacity-50"
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
        <input
          type="checkbox"
          checked={currentlyWorking}
          onChange={(e) => setCurrentlyWorking(e.target.checked)}
          className="rounded text-purple-600 focus:ring-purple-500"
        />
        <span>Currently working on this project</span>
      </label>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] font-black text-slate-600 uppercase tracking-wider block mb-1">
            GitHub Repository URL
          </label>
          <input
            type="url"
            value={github}
            onChange={(e) => setGithub(e.target.value)}
            placeholder="https://github.com/..."
            className="w-full bg-white border border-slate-200 px-3 py-2 text-xs font-mono rounded-xl outline-none"
          />
        </div>
        <div>
          <label className="text-[11px] font-black text-slate-600 uppercase tracking-wider block mb-1">
            Live Demo URL
          </label>
          <input
            type="url"
            value={demo}
            onChange={(e) => setDemo(e.target.value)}
            placeholder="https://myproject.vercel.app"
            className="w-full bg-white border border-slate-200 px-3 py-2 text-xs font-mono rounded-xl outline-none"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#4A1584] via-[#6320B5] to-[#7E22CE] hover:from-[#3c106d] hover:via-[#521996] hover:to-[#6b1cb1] text-white text-xs font-bold shadow-sm shadow-purple-900/20 cursor-pointer"
        >
          Save Project
        </button>
      </div>
    </form>
  );
}

function CertificationModalForm({
  onSave,
  onClose,
}: {
  onSave: (cert: any) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [issuer, setIssuer] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [credentialId, setCredentialId] = useState("");
  const [url, setUrl] = useState("");
  const [localErr, setLocalErr] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setLocalErr("");
        if (issueDate && expirationDate && expirationDate < issueDate) {
          setLocalErr("Expiration date cannot precede issue date.");
          return;
        }
        onSave({
          certification_name: name,
          issuing_organization: issuer,
          issue_date: issueDate || undefined,
          expiration_date: expirationDate || undefined,
          credential_id: credentialId,
          credential_url: url,
        });
      }}
      className="space-y-3.5"
    >
      {localErr && (
        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">
          {localErr}
        </div>
      )}

      <div>
        <label className="text-[11px] font-black text-slate-600 uppercase tracking-wider block mb-1">
          Certification Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. AWS Certified Solutions Architect"
          required
          className="w-full bg-white border border-slate-200 px-3 py-2 text-xs font-semibold rounded-xl outline-none"
        />
      </div>

      <div>
        <label className="text-[11px] font-black text-slate-600 uppercase tracking-wider block mb-1">
          Issuing Organization
        </label>
        <input
          type="text"
          value={issuer}
          onChange={(e) => setIssuer(e.target.value)}
          placeholder="e.g. Amazon Web Services, Google, Microsoft"
          required
          className="w-full bg-white border border-slate-200 px-3 py-2 text-xs font-semibold rounded-xl outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] font-black text-slate-600 uppercase tracking-wider block mb-1">
            Issue Date
          </label>
          <input
            type="month"
            value={issueDate}
            onChange={(e) => setIssueDate(e.target.value)}
            className="w-full bg-white border border-slate-200 px-3 py-2 text-xs font-semibold rounded-xl outline-none"
          />
        </div>
        <div>
          <label className="text-[11px] font-black text-slate-600 uppercase tracking-wider block mb-1">
            Expiration Date (Optional)
          </label>
          <input
            type="month"
            value={expirationDate}
            onChange={(e) => setExpirationDate(e.target.value)}
            className="w-full bg-white border border-slate-200 px-3 py-2 text-xs font-semibold rounded-xl outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] font-black text-slate-600 uppercase tracking-wider block mb-1">
            Credential ID
          </label>
          <input
            type="text"
            value={credentialId}
            onChange={(e) => setCredentialId(e.target.value)}
            placeholder="e.g. ABC123XYZ"
            className="w-full bg-white border border-slate-200 px-3 py-2 text-xs font-mono rounded-xl outline-none"
          />
        </div>
        <div>
          <label className="text-[11px] font-black text-slate-600 uppercase tracking-wider block mb-1">
            Credential URL
          </label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://..."
            className="w-full bg-white border border-slate-200 px-3 py-2 text-xs font-mono rounded-xl outline-none"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#4A1584] via-[#6320B5] to-[#7E22CE] hover:from-[#3c106d] hover:via-[#521996] hover:to-[#6b1cb1] text-white text-xs font-bold shadow-sm shadow-purple-900/20 cursor-pointer"
        >
          Save Certification
        </button>
      </div>
    </form>
  );
}

function AchievementModalForm({
  onSave,
  onClose,
}: {
  onSave: (ach: any) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [org, setOrg] = useState("");
  const [achDate, setAchDate] = useState("");
  const [desc, setDesc] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave({
          achievement_name: name,
          organization: org,
          achievement_date: achDate || undefined,
          description: desc,
        });
      }}
      className="space-y-3.5"
    >
      <div>
        <label className="text-[11px] font-black text-slate-600 uppercase tracking-wider block mb-1">
          Honor / Award Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Smart India Hackathon Finalist, Winner ACM ICPC"
          required
          className="w-full bg-white border border-slate-200 px-3 py-2 text-xs font-semibold rounded-xl outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] font-black text-slate-600 uppercase tracking-wider block mb-1">
            Organization / Issuer
          </label>
          <input
            type="text"
            value={org}
            onChange={(e) => setOrg(e.target.value)}
            placeholder="e.g. Ministry of Education, Google GDG"
            className="w-full bg-white border border-slate-200 px-3 py-2 text-xs font-semibold rounded-xl outline-none"
          />
        </div>
        <div>
          <label className="text-[11px] font-black text-slate-600 uppercase tracking-wider block mb-1">
            Date Achieved
          </label>
          <input
            type="month"
            value={achDate}
            onChange={(e) => setAchDate(e.target.value)}
            className="w-full bg-white border border-slate-200 px-3 py-2 text-xs font-semibold rounded-xl outline-none"
          />
        </div>
      </div>

      <div>
        <label className="text-[11px] font-black text-slate-600 uppercase tracking-wider block mb-1">
          Description
        </label>
        <textarea
          rows={2}
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="Ranked top 10 among 500+ student teams nationally..."
          className="w-full bg-white border border-slate-200 p-3 text-xs font-medium rounded-xl outline-none"
        />
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#4A1584] via-[#6320B5] to-[#7E22CE] hover:from-[#3c106d] hover:via-[#521996] hover:to-[#6b1cb1] text-white text-xs font-bold shadow-sm shadow-purple-900/20 cursor-pointer"
        >
          Save Honor
        </button>
      </div>
    </form>
  );
}

function AvatarModalForm({
  currentUrl,
  onSave,
  onClose,
}: {
  currentUrl: string;
  onSave: (url: string) => void;
  onClose: () => void;
}) {
  const [url, setUrl] = useState(currentUrl);

  return (
    <div className="space-y-4">
      <div>
        <label className="text-[11px] font-black text-slate-600 uppercase tracking-wider block mb-1">
          Image URL (e.g. GitHub, LinkedIn, or Unsplash)
        </label>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://images.unsplash.com/... or https://github.com/username.png"
          className="w-full bg-white border border-slate-200 px-3 py-2 text-xs font-mono rounded-xl outline-none"
        />
      </div>

      {url && (
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200">
          <img src={url} alt="Preview" className="w-12 h-12 rounded-xl object-cover border" />
          <span className="text-xs font-bold text-slate-700">Photo Preview</span>
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={() => onSave("")}
          className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
        >
          Remove Photo (Use Initials)
        </button>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSave(url.trim())}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#4A1584] via-[#6320B5] to-[#7E22CE] hover:from-[#3c106d] hover:via-[#521996] hover:to-[#6b1cb1] text-white text-xs font-bold shadow-sm shadow-purple-900/20 cursor-pointer"
          >
            Save Photo
          </button>
        </div>
      </div>
    </div>
  );
}
