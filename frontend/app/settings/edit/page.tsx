"use client";

import React, { useState, useEffect, useMemo, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  User,
  Briefcase,
  FolderGit2,
  Code2,
  Target,
  GraduationCap,
  Languages,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  X,
  UploadCloud,
  Camera,
  ExternalLink,
  Sparkles,
  Save,
  Check,
  AlertCircle,
  Building,
  MapPin,
  Calendar,
  Globe,
  Settings as SettingsIcon,
  Award,
  Lock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { fetchCertificateIdentity } from "@/lib/api/certificates";
import type { CertificateIdentity } from "@/types/certificate";
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
  calculateProfileCompletion,
  saveCareerPreferences,
  saveCodingProfiles,
  UserCareerPreferences,
  CodingProfilesInput,
  PlatformStat,
  CompleteProfileData,
  UserProfile,
  UserExperience,
  UserProject,
  UserSkill,
  UserEducation,
} from "@/lib/api";

type EditTab = "personal" | "career" | "coding" | "skills" | "experience" | "education" | "projects" | "languages";

// ── Image Processing Helper ──────────────────────────────────────────────────
function processImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Please select a valid image file (PNG, JPG, or WebP)."));
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxDim = 512;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.88);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error("Failed to decode image file."));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read image file."));
    reader.readAsDataURL(file);
  });
}

// ── Circular SVG Progress Ring (Purple & Neutral Track, No Blue, No Pink) ─────
function CircularProgress({ percent }: { percent: number }) {
  const radius = 22;
  const stroke = 4.5;
  const normalizedRadius = radius - stroke * 0.5;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, percent)) / 100) * circumference;

  return (
    <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
      <svg height="56" width="56" className="transform -rotate-90">
        <circle
          stroke="#EDE9FE"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx="28"
          cy="28"
          className="dark:stroke-[#27272A]"
        />
        <circle
          stroke="#7C3AED"
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={`${circumference} ${circumference}`}
          style={{ strokeDashoffset, transition: "stroke-dashoffset 0.4s ease" }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx="28"
          cy="28"
        />
      </svg>
      <span className="absolute text-xs font-black text-[#7C3AED] dark:text-purple-300">
        {percent}%
      </span>
    </div>
  );
}

function EditProfileContent() {
  const router = useRouter();
  const { session } = useAuth();
  const qc = useQueryClient();

  const [activeTab, setActiveTab] = useState<EditTab>("personal");
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [successToast, setSuccessToast] = useState("");
  const [showProgressDetails, setShowProgressDetails] = useState(false);

  // Master profile state
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
    progress: null,
    coding_inputs: null,
    coding_stats: null,
    resume: null,
  });

  // Personal Form State
  const searchParams = useSearchParams();

  // Career Preferences State
  const [careerForm, setCareerForm] = useState<UserCareerPreferences>({
    target_roles: [],
    preferred_industries: [],
    target_companies: [],
    preferred_locations: [],
    work_arrangements: ["Remote", "Hybrid"],
  });
  const [roleInput, setRoleInput] = useState("");
  const [companyInput, setCompanyInput] = useState("");
  const [locationInput, setLocationInput] = useState("");
  const [savingCareer, setSavingCareer] = useState(false);

  // Coding Profiles State
  const [codingForm, setCodingForm] = useState<CodingProfilesInput>({
    leetcode: "",
    github: "",
    codeforces: "",
    codechef: "",
    hackerrank: "",
    geeksforgeeks: "",
  });
  const [savingCoding, setSavingCoding] = useState(false);

  // Read ?tab= query parameter on mount
  useEffect(() => {
    const tabParam = searchParams.get("tab") as EditTab;
    if (tabParam && ["personal", "career", "coding", "skills", "experience", "education", "projects", "languages"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Personal Form State
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
    college: "",
  });
  const [savingPersonal, setSavingPersonal] = useState(false);
  const [certIdentity, setCertIdentity] = useState<CertificateIdentity | null>(null);

  // Sub-views for list vs form
  const [expView, setExpView] = useState<"list" | "form">("list");
  const [selectedExp, setSelectedExp] = useState<UserExperience | null>(null);

  const [projView, setProjView] = useState<"list" | "form">("list");
  const [selectedProj, setSelectedProj] = useState<UserProject | null>(null);

  const [eduView, setEduView] = useState<"list" | "form">("list");
  const [selectedEdu, setSelectedEdu] = useState<UserEducation | null>(null);

  // Skills input state
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillCategory, setNewSkillCategory] = useState("Programming / scripting Languages");
  const [newSkillProficiency, setNewSkillProficiency] = useState<"Beginner" | "Intermediate" | "Advanced" | "Expert">("Intermediate");
  const [addingSkill, setAddingSkill] = useState(false);

  // Languages state
  const [languages, setLanguages] = useState<string[]>(["English"]);
  const [newLangInput, setNewLangInput] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Hide mobile downbar when on this page
  useEffect(() => {
    document.body.setAttribute("data-hide-bottombar", "true");
    return () => {
      document.body.removeAttribute("data-hide-bottombar");
    };
  }, []);

  // Load profile data
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const full = await fetchFullProfileData();
        if (full) {
          setProfileData(full);
          const defaultName = session?.name || (session?.email ? session.email.split("@")[0] : "");
          if (full.career_preferences) {
            setCareerForm({
              target_roles: full.career_preferences.target_roles || [],
              preferred_industries: full.career_preferences.preferred_industries || [],
              target_companies: full.career_preferences.target_companies || [],
              preferred_locations: full.career_preferences.preferred_locations || [],
              work_arrangements: full.career_preferences.work_arrangements || ["Remote", "Hybrid"],
            });
          }
          if (full.coding_inputs) {
            setCodingForm({
              leetcode: full.coding_inputs.leetcode || "",
              github: full.coding_inputs.github || "",
              codeforces: full.coding_inputs.codeforces || "",
              codechef: full.coding_inputs.codechef || "",
              hackerrank: full.coding_inputs.hackerrank || "",
              geeksforgeeks: full.coding_inputs.geeksforgeeks || "",
            });
          }
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
          } else {
            setPersonalForm((prev) => ({ ...prev, full_name: defaultName }));
          }
        }

        // Phase 7: Fetch Authoritative Certificate Identity & Lock State
        try {
          const ident = await fetchCertificateIdentity();
          if (ident) {
            setCertIdentity(ident);
            if (ident.college) {
              setPersonalForm((prev) => ({ ...prev, college: ident.college }));
            }
          }
        } catch {
          // Ignore if unauthenticated or offline
        }
      } catch (err) {
        console.warn("Failed to load profile:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [session]);

  // Load languages from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("sc_profile_languages");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setLanguages(parsed);
        }
      }
    } catch {}
  }, []);

  // Real-time dynamic Profile Completion calculation
  const liveCompletion = useMemo(() => {
    const merged: CompleteProfileData = {
      ...profileData,
      personal: personalForm,
      career_preferences: careerForm,
      coding_inputs: codingForm,
      skills: profileData.skills,
      experiences: profileData.experiences,
      education: profileData.education,
      projects: profileData.projects,
    };
    return calculateProfileCompletion(merged);
  }, [profileData, personalForm, careerForm, codingForm]);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(""), 3500);
  };

  const handleUpdateLanguages = (newLangs: string[]) => {
    setLanguages(newLangs);
    try {
      localStorage.setItem("sc_profile_languages", JSON.stringify(newLangs));
    } catch {}
  };

  // User identity details
  const userEmail = session?.email || "";
  const userHandle = userEmail ? `@${userEmail.split("@")[0]}` : "@learner";
  const userInitials = personalForm.full_name
    ? personalForm.full_name
        .split(" ")
        .filter(Boolean)
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : userEmail.slice(0, 2).toUpperCase() || "PG";
  const userRole = personalForm.headline || "Student";

  // ── Handler: Save Career Preferences ──
  const handleSaveCareer = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSavingCareer(true);
    setErrorMsg("");
    try {
      const res = await saveCareerPreferences(careerForm);
      if (res.success) {
        setProfileData((prev) => ({
          ...prev,
          career_preferences: { ...(prev.career_preferences || {}), ...careerForm },
        }));
        qc.invalidateQueries({ queryKey: ["dashboard"] });
        qc.invalidateQueries({ queryKey: ["profile"] });
        showToast("Career preferences saved successfully!");
      } else {
        setErrorMsg(res.error || "Failed to save career preferences.");
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "An unexpected error occurred.");
    } finally {
      setSavingCareer(false);
    }
  };

  // ── Handler: Save Developer & Coding Profiles ──
  const handleSaveCoding = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSavingCoding(true);
    setErrorMsg("");
    try {
      const res = await saveCodingProfiles(codingForm);
      if (res && res.success) {
        setProfileData((prev) => ({
          ...prev,
          coding_inputs: codingForm,
          coding_stats: res.stats || prev.coding_stats,
        }));
        qc.invalidateQueries({ queryKey: ["dashboard"] });
        qc.invalidateQueries({ queryKey: ["profile"] });
        showToast("Developer profiles saved and live metrics synced!");
      } else {
        setErrorMsg("Failed to save coding profiles. Ensure backend is reachable.");
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "An unexpected error occurred.");
    } finally {
      setSavingCoding(false);
    }
  };

  // ── Handler: Save Personal Form ──
  const handleSavePersonal = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg("");
    setSavingPersonal(true);
    try {
      const res = await savePersonalProfile(personalForm);
      if (res.success) {
        setProfileData((prev) => ({
          ...prev,
          personal: { ...(prev.personal || {}), ...personalForm },
        }));
        qc.invalidateQueries({ queryKey: ["dashboard"] });
        qc.invalidateQueries({ queryKey: ["profile"] });
        showToast("Personal details updated successfully!");
      } else {
        setErrorMsg(res.error || "Failed to update profile details.");
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "An unexpected error occurred.");
    } finally {
      setSavingPersonal(false);
    }
  };

  return (
    <div className="max-w-2xl lg:max-w-3xl mx-auto space-y-4 pb-32 sm:pb-36">
      {/* ── Top User Profile Header (Zero Blue: Signature Purple Avatar) ── */}
      <div className="flex items-center gap-3.5 pt-1">
        {/* Purple Monogram Avatar with Camera Badge (No Blue!) */}
        <div className="relative shrink-0">
          {personalForm.avatar_url ? (
            <img
              src={personalForm.avatar_url}
              alt="Avatar"
              className="w-14 h-14 rounded-full object-cover border-2 border-white dark:border-[#242428] shadow-sm"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#5B21B6] text-white flex items-center justify-center font-black text-lg tracking-tight shadow-xs">
              {userInitials}
            </div>
          )}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#7C3AED] text-white flex items-center justify-center shadow-xs hover:bg-[#6D28D9] transition-all cursor-pointer"
            title="Upload profile photo"
          >
            <Camera className="w-3.5 h-3.5" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="hidden"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (f) {
                try {
                  const dataUrl = await processImageFile(f);
                  setPersonalForm((prev) => ({ ...prev, avatar_url: dataUrl }));
                  showToast("Photo uploaded! Click Save changes to persist.");
                } catch (err: any) {
                  setErrorMsg(err?.message || "Failed to process photo.");
                }
              }
            }}
          />
        </div>

        {/* Name, Handle, Designation */}
        <div className="min-w-0 flex-1">
          <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white truncate">
            {personalForm.full_name || "Your Name"}
          </h1>
          <p className="text-xs text-slate-400 font-medium truncate">{userHandle}</p>
          <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400 truncate pt-0.5">
            {userRole}
          </p>
        </div>
      </div>

      {/* ── Real-time Profile Progress Card (Soft Lavender / Neutral Dark, No Blue, No Pink) ── */}
      <div
        onClick={() => setShowProgressDetails(!showProgressDetails)}
        className="p-4 rounded-2xl bg-[#F8F5FE] dark:bg-[#151518] border border-[#E9E0FA] dark:border-[#27272A] flex items-center justify-between shadow-2xs cursor-pointer hover:border-purple-300 dark:hover:border-purple-600 transition-all group"
      >
        <div className="space-y-0.5 pr-3 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
              Profile Progress
            </span>
            <ChevronDown
              className={`w-4 h-4 text-[#7C3AED] transition-transform ${
                showProgressDetails ? "rotate-180" : ""
              }`}
            />
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium truncate">
            {liveCompletion.totalPercent === 100
              ? "All profile sections 100% complete! Great job!"
              : "Tap to view & complete profile details"}
          </p>
        </div>

        {/* Real-time Circular SVG Gauge */}
        <CircularProgress percent={liveCompletion.totalPercent} />
      </div>

      {/* ── Expandable Real-time Progress Breakdown ── */}
      <AnimatePresence>
        {showProgressDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 rounded-2xl bg-white dark:bg-[#121214] border border-slate-200/80 dark:border-[#242428] space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-[#242428]">
                <span className="text-xs font-black text-slate-900 dark:text-white">
                  Profile Completion Breakdown
                </span>
                <span className="text-xs font-bold text-[#7C3AED]">
                  {liveCompletion.totalPercent}% Total
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {[
                  {
                    name: "Personal Details",
                    tab: "personal",
                    score: liveCompletion.sections.personal.score,
                    max: 15,
                    done: liveCompletion.sections.personal.completed,
                  },
                  {
                    name: "Skills Hub",
                    tab: "skills",
                    score: liveCompletion.sections.skills.score,
                    max: 15,
                    done: liveCompletion.sections.skills.completed,
                  },
                  {
                    name: "Experience",
                    tab: "experience",
                    score: liveCompletion.sections.experience.score,
                    max: 10,
                    done: liveCompletion.sections.experience.completed,
                  },
                  {
                    name: "Education History",
                    tab: "education",
                    score: liveCompletion.sections.education.score,
                    max: 10,
                    done: liveCompletion.sections.education.completed,
                  },
                  {
                    name: "Projects & Proof of Work",
                    tab: "projects",
                    score: liveCompletion.sections.projects.score,
                    max: 15,
                    done: liveCompletion.sections.projects.completed,
                  },
                  {
                    name: "ATS Resume Analysis",
                    tab: "personal",
                    score: liveCompletion.sections.resume.score,
                    max: 20,
                    done: liveCompletion.sections.resume.completed,
                  },
                ].map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => {
                      setActiveTab(item.tab as EditTab);
                      setShowProgressDetails(false);
                    }}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#18181B] border border-slate-200/60 dark:border-[#27272A] flex items-center justify-between text-left hover:border-purple-300 dark:hover:border-purple-600 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      {item.done ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-[#323238] shrink-0" />
                      )}
                      <span className="font-semibold text-slate-800 dark:text-zinc-200 truncate">
                        {item.name}
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-slate-500 shrink-0">
                      {item.score}/{item.max}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Success Toast Alert ── */}
      <AnimatePresence>
        {successToast && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2.5 shadow-xs"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Error Alert ── */}
      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            onClick={() => setErrorMsg("")}
            className="text-rose-500 hover:text-rose-700 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Category Pill Tabs Bar (Vibrant Purple Active, Zero Blue, Zero Pink) ── */}
      <div className="overflow-x-auto no-scrollbar scroll-smooth touch-pan-x py-1">
        <div className="flex items-center gap-2 min-w-max">
          {[
            { id: "personal", label: "Account" },
            { id: "career", label: "Preferences", count: (careerForm.target_roles?.length || 0) + (careerForm.target_companies?.length || 0) },
            { id: "coding", label: "Coding Profiles" },
            { id: "skills", label: "Skills", count: profileData.skills.length },
            { id: "experience", label: "Experience", count: profileData.experiences.length },
            { id: "education", label: "Education", count: profileData.education.length },
            { id: "projects", label: "Projects", count: profileData.projects.length },
            { id: "languages", label: "Languages", count: languages.length },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as EditTab);
                  setErrorMsg("");
                  setExpView("list");
                  setProjView("list");
                  setEduView("list");
                }}
                className={`shrink-0 px-5 py-2.5 rounded-2xl text-xs transition-all cursor-pointer font-bold ${
                  isActive
                    ? "bg-[#7C3AED] text-white shadow-xs shadow-purple-600/30"
                    : "bg-transparent text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-[#18181B]"
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`ml-1.5 text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                      isActive
                        ? "bg-white/25 text-white"
                        : "bg-slate-200 dark:bg-[#27272A] text-slate-700 dark:text-zinc-300"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Main Form Card (Deep Obsidian Black in Dark Mode, Zero Blue!) ── */}
      <div className="bg-white dark:bg-[#121214] rounded-3xl p-5 sm:p-7 border border-slate-200/80 dark:border-[#242428] shadow-xs">
        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* TAB 1: PERSONAL / ACCOUNT DETAILS                                   */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        {activeTab === "personal" && (
          <form id="personal-edit-form" onSubmit={handleSavePersonal} className="space-y-4">
            {/* Form Header with Cancel & Save changes (Purple, No Blue, No Pink!) */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#242428]">
              <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                Personal Details
              </h2>
              <div className="flex items-center gap-2">
                <Link
                  href="/settings"
                  className="px-3.5 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200 transition-colors"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={savingPersonal}
                  className="px-4 sm:px-5 py-2 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold shadow-xs shadow-purple-600/20 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savingPersonal ? "Saving..." : "Save changes"}</span>
                </button>
              </div>
            </div>

            {/* Phase 7: Identity Lock Banner */}
            {certIdentity?.is_identity_locked ? (
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2.5">
                <Lock className="w-4 h-4 shrink-0 text-amber-400" />
                <span>
                  Your name and college are locked because a SkillsCatalyst certificate has already been issued.
                </span>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs flex items-center gap-2.5">
                <Award className="w-4 h-4 shrink-0 text-purple-400" />
                <span>
                  Please make sure your full name and college are accurate. These details will be permanently locked after your first certificate is issued.
                </span>
              </div>
            )}

            {/* Full Name */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                {certIdentity?.is_identity_locked && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400">
                    <Lock className="w-3 h-3" /> Locked
                  </span>
                )}
              </div>
              <input
                type="text"
                required
                disabled={certIdentity?.is_identity_locked}
                value={personalForm.full_name || ""}
                onChange={(e) => setPersonalForm({ ...personalForm, full_name: e.target.value })}
                placeholder="e.g. Palamoor Adithya Goud"
                className="w-full bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] px-3.5 py-2.5 text-xs font-semibold rounded-xl outline-none focus:border-[#7C3AED] text-slate-900 dark:text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>

            {/* College Name */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  College / University
                </label>
                {certIdentity?.is_identity_locked && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400">
                    <Lock className="w-3 h-3" /> Locked
                  </span>
                )}
              </div>
              <input
                type="text"
                disabled={certIdentity?.is_identity_locked}
                value={personalForm.college || ""}
                onChange={(e) => setPersonalForm({ ...personalForm, college: e.target.value })}
                placeholder="e.g. ABC Engineering College"
                className="w-full bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] px-3.5 py-2.5 text-xs font-semibold rounded-xl outline-none focus:border-[#7C3AED] text-slate-900 dark:text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>

            {/* Designation / Headline */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                Designation
              </label>
              <input
                type="text"
                value={personalForm.headline || ""}
                onChange={(e) => setPersonalForm({ ...personalForm, headline: e.target.value })}
                placeholder="e.g. Student / Full Stack Developer"
                className="w-full bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] px-3.5 py-2.5 text-xs font-semibold rounded-xl outline-none focus:border-[#7C3AED] text-slate-900 dark:text-white transition-colors"
              />
            </div>

            {/* Country */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                Country
              </label>
              <input
                type="text"
                value={personalForm.country || "India"}
                onChange={(e) => setPersonalForm({ ...personalForm, country: e.target.value })}
                placeholder="e.g. India"
                className="w-full bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] px-3.5 py-2.5 text-xs font-semibold rounded-xl outline-none focus:border-[#7C3AED] text-slate-900 dark:text-white transition-colors"
              />
            </div>

            {/* State */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                State
              </label>
              <input
                type="text"
                value={personalForm.state || ""}
                onChange={(e) => setPersonalForm({ ...personalForm, state: e.target.value })}
                placeholder="e.g. Telangana"
                className="w-full bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] px-3.5 py-2.5 text-xs font-semibold rounded-xl outline-none focus:border-[#7C3AED] text-slate-900 dark:text-white transition-colors"
              />
            </div>

            {/* City */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                City
              </label>
              <input
                type="text"
                value={personalForm.city || ""}
                onChange={(e) => setPersonalForm({ ...personalForm, city: e.target.value })}
                placeholder="e.g. Hyderabad"
                className="w-full bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] px-3.5 py-2.5 text-xs font-semibold rounded-xl outline-none focus:border-[#7C3AED] text-slate-900 dark:text-white transition-colors"
              />
            </div>

            {/* Phone Number & Gender */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                  Phone Number (Private)
                </label>
                <input
                  type="tel"
                  value={personalForm.phone || ""}
                  onChange={(e) => setPersonalForm({ ...personalForm, phone: e.target.value })}
                  placeholder="e.g. 9392640702"
                  className="w-full bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] px-3.5 py-2.5 text-xs font-semibold rounded-xl outline-none focus:border-[#7C3AED] text-slate-900 dark:text-white transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                  Gender
                </label>
                <select
                  value={personalForm.gender || "Prefer not to say"}
                  onChange={(e) => setPersonalForm({ ...personalForm, gender: e.target.value })}
                  className="w-full bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] px-3.5 py-2.5 text-xs font-semibold rounded-xl outline-none focus:border-[#7C3AED] cursor-pointer text-slate-900 dark:text-white transition-colors"
                >
                  <option value="Prefer not to say">Prefer not to say</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* About / Bio */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                About / Bio
              </label>
              <textarea
                rows={3}
                value={personalForm.about || ""}
                onChange={(e) => setPersonalForm({ ...personalForm, about: e.target.value })}
                placeholder="Brief summary about your skills, passions, and background..."
                className="w-full bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] p-3.5 text-xs font-medium rounded-xl outline-none focus:border-[#7C3AED] text-slate-900 dark:text-white resize-y transition-colors"
              />
            </div>
          </form>
        )}

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* TAB: CAREER PREFERENCES                                             */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        {activeTab === "career" && (
          <form onSubmit={handleSaveCareer} className="space-y-5">
            {/* Form Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#242428]">
              <div>
                <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Target className="w-4 h-4 text-[#7C3AED]" />
                  <span>Career Preferences</span>
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
                  Set target roles, dream companies, and ideal work arrangements
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/settings"
                  className="px-3.5 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200 transition-colors"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={savingCareer}
                  className="px-4 sm:px-5 py-2 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold shadow-xs shadow-purple-600/20 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savingCareer ? "Saving..." : "Save changes"}</span>
                </button>
              </div>
            </div>

            {/* Target Job Roles */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block">
                Target Job Roles
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={roleInput}
                  onChange={(e) => setRoleInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const val = roleInput.trim();
                      if (val && !careerForm.target_roles.includes(val)) {
                        setCareerForm((prev) => ({
                          ...prev,
                          target_roles: [...prev.target_roles, val],
                        }));
                        setRoleInput("");
                      }
                    }
                  }}
                  placeholder="e.g. SDE-1, Full Stack Developer, DevOps Engineer..."
                  className="flex-1 bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] px-3.5 py-2.5 text-xs font-semibold rounded-xl outline-none focus:border-[#7C3AED] text-slate-900 dark:text-white transition-colors"
                />
                <button
                  type="button"
                  onClick={() => {
                    const val = roleInput.trim();
                    if (val && !careerForm.target_roles.includes(val)) {
                      setCareerForm((prev) => ({
                        ...prev,
                        target_roles: [...prev.target_roles, val],
                      }));
                      setRoleInput("");
                    }
                  }}
                  className="px-4 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold cursor-pointer shrink-0 transition-all shadow-xs"
                >
                  Add
                </button>
              </div>

              {/* Roles Chips */}
              <div className="flex flex-wrap gap-2 pt-1">
                {careerForm.target_roles.map((r, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-xs font-bold text-rose-900 dark:text-rose-200 shadow-2xs"
                  >
                    <span>{r}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setCareerForm((prev) => ({
                          ...prev,
                          target_roles: prev.target_roles.filter((_, idx) => idx !== i),
                        }))
                      }
                      className="text-rose-400 hover:text-rose-700 dark:hover:text-rose-100 p-0.5 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>

              {/* Suggestions */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                  Suggestions:
                </span>
                {["SDE-1", "Full Stack Developer", "DevOps Engineer", "Frontend Engineer", "Cloud Architect", "Data Engineer"].map((sugg) => (
                  <button
                    key={sugg}
                    type="button"
                    disabled={careerForm.target_roles.includes(sugg)}
                    onClick={() =>
                      setCareerForm((prev) => ({
                        ...prev,
                        target_roles: [...prev.target_roles, sugg],
                      }))
                    }
                    className="text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-[#18181B] text-slate-600 dark:text-zinc-400 hover:text-[#7C3AED] hover:bg-purple-50 dark:hover:bg-purple-950/30 border border-slate-200/60 dark:border-[#27272A] disabled:opacity-40 cursor-pointer transition-all"
                  >
                    + {sugg}
                  </button>
                ))}
              </div>
            </div>

            {/* Dream Companies */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-[#242428]">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block">
                Dream Companies
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={companyInput}
                  onChange={(e) => setCompanyInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const val = companyInput.trim();
                      if (val && !careerForm.target_companies.includes(val)) {
                        setCareerForm((prev) => ({
                          ...prev,
                          target_companies: [...prev.target_companies, val],
                        }));
                        setCompanyInput("");
                      }
                    }
                  }}
                  placeholder="e.g. Google, Microsoft, Atlassian, Amazon, Meta..."
                  className="flex-1 bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] px-3.5 py-2.5 text-xs font-semibold rounded-xl outline-none focus:border-[#7C3AED] text-slate-900 dark:text-white transition-colors"
                />
                <button
                  type="button"
                  onClick={() => {
                    const val = companyInput.trim();
                    if (val && !careerForm.target_companies.includes(val)) {
                      setCareerForm((prev) => ({
                        ...prev,
                        target_companies: [...prev.target_companies, val],
                      }));
                      setCompanyInput("");
                    }
                  }}
                  className="px-4 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold cursor-pointer shrink-0 transition-all shadow-xs"
                >
                  Add
                </button>
              </div>

              {/* Companies Chips */}
              <div className="flex flex-wrap gap-2 pt-1">
                {careerForm.target_companies.map((c, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/50 text-xs font-bold text-purple-900 dark:text-purple-200 shadow-2xs"
                  >
                    <span>{c}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setCareerForm((prev) => ({
                          ...prev,
                          target_companies: prev.target_companies.filter((_, idx) => idx !== i),
                        }))
                      }
                      className="text-purple-400 hover:text-purple-700 dark:hover:text-purple-100 p-0.5 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>

              {/* Suggestions */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                  Suggestions:
                </span>
                {["Google", "Microsoft", "Amazon", "Atlassian", "Meta", "Uber", "Apple"].map((sugg) => (
                  <button
                    key={sugg}
                    type="button"
                    disabled={careerForm.target_companies.includes(sugg)}
                    onClick={() =>
                      setCareerForm((prev) => ({
                        ...prev,
                        target_companies: [...prev.target_companies, sugg],
                      }))
                    }
                    className="text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-[#18181B] text-slate-600 dark:text-zinc-400 hover:text-[#7C3AED] hover:bg-purple-50 dark:hover:bg-purple-950/30 border border-slate-200/60 dark:border-[#27272A] disabled:opacity-40 cursor-pointer transition-all"
                  >
                    + {sugg}
                  </button>
                ))}
              </div>
            </div>

            {/* Work Arrangements */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-[#242428]">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block">
                Work Arrangements
              </label>
              <div className="flex flex-wrap gap-2">
                {["Remote", "Hybrid", "Onsite"].map((arr) => {
                  const isSelected = (careerForm.work_arrangements || []).includes(arr);
                  return (
                    <button
                      key={arr}
                      type="button"
                      onClick={() => {
                        const curr = careerForm.work_arrangements || [];
                        const next = isSelected ? curr.filter((x) => x !== arr) : [...curr, arr];
                        setCareerForm((prev) => ({ ...prev, work_arrangements: next }));
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#7C3AED] text-white shadow-xs"
                          : "bg-slate-100 dark:bg-[#18181B] text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-[#222226] border border-slate-200 dark:border-[#27272A]"
                      }`}
                    >
                      {arr}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Preferred Locations */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-[#242428]">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block">
                Preferred Locations
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const val = locationInput.trim();
                      if (val && !careerForm.preferred_locations.includes(val)) {
                        setCareerForm((prev) => ({
                          ...prev,
                          preferred_locations: [...prev.preferred_locations, val],
                        }));
                        setLocationInput("");
                      }
                    }
                  }}
                  placeholder="e.g. Bangalore, Hyderabad, Pune, Mumbai, Remote..."
                  className="flex-1 bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] px-3.5 py-2.5 text-xs font-semibold rounded-xl outline-none focus:border-[#7C3AED] text-slate-900 dark:text-white transition-colors"
                />
                <button
                  type="button"
                  onClick={() => {
                    const val = locationInput.trim();
                    if (val && !careerForm.preferred_locations.includes(val)) {
                      setCareerForm((prev) => ({
                        ...prev,
                        preferred_locations: [...prev.preferred_locations, val],
                      }));
                      setLocationInput("");
                    }
                  }}
                  className="px-4 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold cursor-pointer shrink-0 transition-all shadow-xs"
                >
                  Add
                </button>
              </div>

              {/* Locations Chips */}
              <div className="flex flex-wrap gap-2 pt-1">
                {careerForm.preferred_locations.map((loc, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-xl bg-slate-100 dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] text-xs font-bold text-slate-800 dark:text-zinc-200 shadow-2xs"
                  >
                    <span>{loc}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setCareerForm((prev) => ({
                          ...prev,
                          preferred_locations: prev.preferred_locations.filter((_, idx) => idx !== i),
                        }))
                      }
                      className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-0.5 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </form>
        )}

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* TAB: DEVELOPER & CODING PROFILES                                    */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        {activeTab === "coding" && (
          <form onSubmit={handleSaveCoding} className="space-y-5">
            {/* Form Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#242428]">
              <div>
                <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-[#7C3AED]" />
                  <span>Developer & Coding Profiles</span>
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
                  Link your handles to automatically fetch and verify coding ratings and stats
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/settings"
                  className="px-3.5 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200 transition-colors"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={savingCoding}
                  className="px-4 sm:px-5 py-2 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold shadow-xs shadow-purple-600/20 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savingCoding ? "Saving..." : "Save & Sync"}</span>
                </button>
              </div>
            </div>

            {/* Platform inputs grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {[
                {
                  key: "leetcode",
                  title: "LeetCode",
                  logo: "/images/coding/leetcode.png",
                  logoClass: "h-5 w-auto max-w-[24px] object-contain",
                  showTitle: true,
                  val: codingForm.leetcode || "",
                  placeholder: "Username or https://leetcode.com/u/...",
                  stat: profileData.coding_stats?.leetcode,
                },
                {
                  key: "github",
                  title: "GitHub",
                  logo: "/images/coding/github.png",
                  logoClass: "h-5 w-auto max-w-[80px] object-contain dark:invert",
                  showTitle: false,
                  val: codingForm.github || "",
                  placeholder: "Username or https://github.com/...",
                  stat: profileData.coding_stats?.github,
                },
                {
                  key: "codeforces",
                  title: "Codeforces",
                  logo: "/images/coding/codeforces.svg",
                  logoClass: "h-5 w-5 object-contain",
                  showTitle: true,
                  val: codingForm.codeforces || "",
                  placeholder: "Handle or https://codeforces.com/profile/...",
                  stat: profileData.coding_stats?.codeforces,
                },
                {
                  key: "codechef",
                  title: "CodeChef",
                  logo: "/images/coding/codechef.png",
                  logoClass: "h-5 w-auto max-w-[90px] object-contain dark:brightness-110",
                  showTitle: false,
                  val: codingForm.codechef || "",
                  placeholder: "Username or https://www.codechef.com/users/...",
                  stat: profileData.coding_stats?.codechef,
                },
                {
                  key: "hackerrank",
                  title: "HackerRank",
                  logo: "/images/coding/hackerrank.png",
                  logoClass: "h-5 w-auto max-w-[24px] object-contain",
                  showTitle: true,
                  val: codingForm.hackerrank || "",
                  placeholder: "Username or https://www.hackerrank.com/profile/...",
                  stat: profileData.coding_stats?.hackerrank,
                },
                {
                  key: "geeksforgeeks",
                  title: "GeeksforGeeks",
                  logo: "/images/coding/geeksforgeeks.png",
                  logoClass: "h-5 w-auto max-w-[110px] object-contain dark:brightness-110",
                  showTitle: false,
                  val: codingForm.geeksforgeeks || "",
                  placeholder: "Username or https://auth.geeksforgeeks.org/user/...",
                  stat: profileData.coding_stats?.geeksforgeeks,
                },
              ].map((p) => {
                const isLinked = !!p.val;
                const getPlatformUrl = (key: string, rawVal: string) => {
                  if (!rawVal || !rawVal.trim()) return "";
                  const v = rawVal.trim();
                  if (v.startsWith("http://") || v.startsWith("https://")) return v;
                  const username = v.replace(/^@/, "").replace(/\/$/, "");
                  switch (key) {
                    case "leetcode":
                      return `https://leetcode.com/u/${username}`;
                    case "github":
                      return `https://github.com/${username}`;
                    case "codeforces":
                      return `https://codeforces.com/profile/${username}`;
                    case "codechef":
                      return `https://www.codechef.com/users/${username}`;
                    case "hackerrank":
                      return `https://www.hackerrank.com/profile/${username}`;
                    case "geeksforgeeks":
                      return `https://auth.geeksforgeeks.org/user/${username}`;
                    default:
                      return `https://${username}`;
                  }
                };
                const profileUrl = getPlatformUrl(p.key, p.val);

                return (
                  <div
                    key={p.key}
                    className="p-3.5 rounded-2xl bg-white dark:bg-[#18181B] border border-slate-200/90 dark:border-[#27272A] space-y-2.5 shadow-2xs hover:border-purple-300 dark:hover:border-purple-600 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-h-[26px]">
                        <img
                          src={p.logo}
                          alt={p.title}
                          className={p.logoClass}
                        />
                        {p.showTitle && (
                          <span className="text-xs font-black text-slate-900 dark:text-white">
                            {p.title}
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                          isLinked
                            ? "bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-900/50"
                            : "bg-slate-100 dark:bg-[#222226] text-slate-500 dark:text-zinc-400"
                        }`}
                      >
                        {isLinked ? "Connected" : "Not Linked"}
                      </span>
                    </div>

                    <input
                      type="text"
                      value={p.val}
                      onChange={(e) =>
                        setCodingForm((prev) => ({
                          ...prev,
                          [p.key]: e.target.value,
                        }))
                      }
                      placeholder={p.placeholder}
                      className="w-full bg-slate-50 dark:bg-[#141417] border border-slate-200 dark:border-[#2A2A2E] px-3 py-2 text-xs font-mono font-semibold rounded-xl outline-none focus:border-[#7C3AED] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-600 transition-colors"
                    />

                    {/* Profile Link Display in Edit Section */}
                    {profileUrl ? (
                      <div className="pt-1.5 flex items-center justify-between border-t border-slate-100 dark:border-[#242428]">
                        <a
                          href={profileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-[11px] font-mono font-medium text-[#7C3AED] hover:text-[#6D28D9] dark:text-purple-400 dark:hover:text-purple-300 transition-colors truncate max-w-full group/link"
                          title={`Open ${p.title} profile`}
                        >
                          <span className="truncate underline underline-offset-2">{profileUrl}</span>
                          <ExternalLink className="w-3 h-3 shrink-0 text-[#7C3AED] dark:text-purple-400 group-hover/link:translate-x-0.5 transition-transform" />
                        </a>
                      </div>
                    ) : (
                      <div className="pt-1 border-t border-slate-100/60 dark:border-[#222226]">
                        <p className="text-[10px] text-slate-400 dark:text-zinc-500 italic">
                          Enter username to view profile link
                        </p>
                      </div>
                    )}

                    {p.stat && p.stat.summary && (
                      <div className="pt-0.5 flex items-center gap-1.5 text-[10px] font-semibold text-purple-700 dark:text-purple-300 truncate">
                        <Globe className="w-3 h-3 text-[#7C3AED] shrink-0" />
                        <span className="truncate">{p.stat.summary}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </form>
        )}

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* TAB: SKILLS                                                         */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        {activeTab === "skills" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#242428]">
              <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                Skills & Technologies ({profileData.skills.length})
              </h2>
            </div>

            {/* Add Skill Form */}
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!newSkillName.trim()) return;
                setAddingSkill(true);
                setErrorMsg("");
                const res = await saveSkill({
                  skill_name: newSkillName.trim(),
                  category: newSkillCategory,
                  proficiency: newSkillProficiency,
                });
                if (res.success && res.skill) {
                  setProfileData((prev) => {
                    const nextSkills = prev.skills.filter(
                      (s) => s.id !== res.skill!.id && s.skill_name.toLowerCase() !== res.skill!.skill_name.toLowerCase()
                    );
                    nextSkills.push(res.skill!);
                    return { ...prev, skills: nextSkills };
                  });
                  setNewSkillName("");
                  showToast(`Added ${res.skill.skill_name}!`);
                } else {
                  setErrorMsg(res.error || "Failed to save skill.");
                }
                setAddingSkill(false);
              }}
              className="p-4 rounded-2xl bg-[#F8F5FE] dark:bg-[#151518] border border-[#E9E0FA] dark:border-[#27272A] space-y-3"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#7C3AED] dark:text-purple-300">
                <Plus className="w-3.5 h-3.5" />
                <span>Add New Skill</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                <div className="sm:col-span-5">
                  <input
                    type="text"
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                    placeholder="Skill name (e.g. Python, Docker, Next.js)"
                    className="w-full bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] px-3 py-2 text-xs font-semibold rounded-xl outline-none focus:border-[#7C3AED] text-slate-900 dark:text-white"
                    required
                  />
                </div>
                <div className="sm:col-span-4">
                  <select
                    value={newSkillCategory}
                    onChange={(e) => setNewSkillCategory(e.target.value)}
                    className="w-full bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] px-2.5 py-2 text-xs font-semibold rounded-xl outline-none focus:border-[#7C3AED] cursor-pointer text-slate-900 dark:text-white"
                  >
                    <option value="Programming / scripting Languages">Programming / Scripting</option>
                    <option value="Cloud & Devops">Cloud & DevOps</option>
                    <option value="Databases">Databases</option>
                    <option value="Frameworks">Frameworks</option>
                    <option value="Technologies">Technologies</option>
                    <option value="Tools & Platforms">Tools & Platforms</option>
                    <option value="Soft Skills">Soft Skills</option>
                  </select>
                </div>
                <div className="sm:col-span-3 flex gap-2">
                  <select
                    value={newSkillProficiency}
                    onChange={(e) => setNewSkillProficiency(e.target.value as any)}
                    className="flex-1 bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] px-2 py-2 text-xs font-semibold rounded-xl outline-none focus:border-[#7C3AED] cursor-pointer text-slate-900 dark:text-white"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                  </select>
                  <button
                    type="submit"
                    disabled={addingSkill}
                    className="px-4 py-2 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold shrink-0 cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    {addingSkill ? "Adding..." : "Add"}
                  </button>
                </div>
              </div>
            </form>

            {/* Current Skills List */}
            <div className="space-y-3 pt-1">
              {profileData.skills.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No skills added yet. Add your primary technical and soft skills above.
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profileData.skills.map((skill) => (
                    <div
                      key={skill.id}
                      className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-50 dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] text-xs font-bold text-slate-800 dark:text-zinc-200 shadow-2xs group"
                    >
                      <span>{skill.skill_name}</span>
                      {skill.proficiency && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-extrabold">
                          {skill.proficiency}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={async () => {
                          if (skill.id) {
                            const res = await deleteSkill(skill.id);
                            if (res.success) {
                              setProfileData((prev) => ({
                                ...prev,
                                skills: prev.skills.filter((s) => s.id !== skill.id),
                              }));
                              showToast(`Removed ${skill.skill_name}`);
                            }
                          }
                        }}
                        className="p-0.5 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 cursor-pointer ml-1 transition-colors"
                        title="Delete skill"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* TAB 3: EXPERIENCE                                                   */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        {activeTab === "experience" && (
          <div className="space-y-4">
            {expView === "list" ? (
              <>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#242428]">
                  <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                    Work Experience ({profileData.experiences.length})
                  </h2>
                  <button
                    onClick={() => {
                      setSelectedExp(null);
                      setExpView("form");
                    }}
                    className="px-3.5 py-2 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Experience</span>
                  </button>
                </div>

                {profileData.experiences.length === 0 ? (
                  <div className="py-12 text-center space-y-2 border border-dashed border-slate-200 dark:border-[#27272A] rounded-2xl bg-slate-50/50 dark:bg-[#161619]/60 p-6">
                    <Briefcase className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
                    <p className="text-xs font-bold text-slate-700 dark:text-zinc-300">No work experience added yet</p>
                    <button
                      onClick={() => {
                        setSelectedExp(null);
                        setExpView("form");
                      }}
                      className="mt-2 px-4 py-2 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold cursor-pointer"
                    >
                      Add First Experience
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {profileData.experiences.map((exp) => (
                      <div
                        key={exp.id}
                        className="p-4 rounded-2xl bg-slate-50 dark:bg-[#18181B] border border-slate-200/80 dark:border-[#27272A] hover:border-purple-300 dark:hover:border-purple-600 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-0.5">
                          <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                            {exp.role || (exp as any).job_title}
                          </h3>
                          <p className="text-xs font-semibold text-[#7C3AED]">
                            {exp.company_name}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-500 font-medium pt-0.5">
                            <span>{exp.work_type || "Full-time"}</span>
                            <span>•</span>
                            <span>{exp.employment_type || "Remote"}</span>
                            <span>•</span>
                            <span>
                              {exp.start_date || "N/A"} –{" "}
                              {exp.currently_working ?? (exp as any).is_current
                                ? "Present"
                                : exp.end_date || "Present"}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          <button
                            onClick={() => {
                              setSelectedExp(exp);
                              setExpView("form");
                            }}
                            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-[#27272A] hover:border-purple-300 hover:bg-purple-50 text-slate-700 dark:text-zinc-300 hover:text-purple-600 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={async () => {
                              if (exp.id) {
                                const res = await deleteExperience(exp.id);
                                if (res.success) {
                                  setProfileData((prev) => ({
                                    ...prev,
                                    experiences: prev.experiences.filter((e) => e.id !== exp.id),
                                  }));
                                  showToast("Experience removed.");
                                }
                              }
                            }}
                            className="px-3 py-1.5 rounded-xl border border-rose-200 hover:border-rose-300 hover:bg-rose-50 text-rose-600 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <ExperienceEditor
                initialData={selectedExp}
                onSave={async (expData) => {
                  setErrorMsg("");
                  const res = await saveExperience(expData);
                  if (res.success && res.experience) {
                    setProfileData((prev) => {
                      const filtered = prev.experiences.filter((e) => e.id !== res.experience!.id);
                      return { ...prev, experiences: [res.experience!, ...filtered] };
                    });
                    setExpView("list");
                    setSelectedExp(null);
                    showToast("Experience saved successfully!");
                  } else {
                    setErrorMsg(res.error || "Failed to save experience.");
                  }
                }}
                onCancel={() => {
                  setExpView("list");
                  setSelectedExp(null);
                }}
              />
            )}
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* TAB 4: EDUCATION                                                    */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        {activeTab === "education" && (
          <div className="space-y-4">
            {eduView === "list" ? (
              <>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#242428]">
                  <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                    Education History ({profileData.education.length})
                  </h2>
                  <button
                    onClick={() => {
                      setSelectedEdu(null);
                      setEduView("form");
                    }}
                    className="px-3.5 py-2 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Education</span>
                  </button>
                </div>

                {profileData.education.length === 0 ? (
                  <div className="py-12 text-center space-y-2 border border-dashed border-slate-200 dark:border-[#27272A] rounded-2xl bg-slate-50/50 dark:bg-[#161619]/60 p-6">
                    <GraduationCap className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
                    <p className="text-xs font-bold text-slate-700 dark:text-zinc-300">No education entries added yet</p>
                    <button
                      onClick={() => {
                        setSelectedEdu(null);
                        setEduView("form");
                      }}
                      className="mt-2 px-4 py-2 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold cursor-pointer"
                    >
                      Add First Education
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {profileData.education.map((edu) => (
                      <div
                        key={edu.id}
                        className="p-4 rounded-2xl bg-slate-50 dark:bg-[#18181B] border border-slate-200/80 dark:border-[#27272A] hover:border-purple-300 dark:hover:border-purple-600 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-0.5">
                          <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                            {edu.college || (edu as any).institution}
                          </h3>
                          <p className="text-xs font-semibold text-[#7C3AED]">
                            {edu.degree_type || (edu as any).degree} {edu.field_of_study ? `in ${edu.field_of_study}` : ""}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-500 font-medium pt-0.5">
                            <span>
                              {edu.start_date || (edu as any).start_year || "N/A"} –{" "}
                              {edu.currently_studying ?? (edu as any).is_current
                                ? "Present"
                                : edu.end_date || (edu as any).end_year || "Present"}
                            </span>
                            {edu.gpa && <span>• GPA: {edu.gpa}</span>}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          <button
                            onClick={() => {
                              setSelectedEdu(edu);
                              setEduView("form");
                            }}
                            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-[#27272A] hover:border-purple-300 hover:bg-purple-50 text-slate-700 dark:text-zinc-300 hover:text-purple-600 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={async () => {
                              if (edu.id) {
                                const res = await deleteEducation(edu.id);
                                if (res.success) {
                                  setProfileData((prev) => ({
                                    ...prev,
                                    education: prev.education.filter((e) => e.id !== edu.id),
                                  }));
                                  showToast("Education record removed.");
                                }
                              }
                            }}
                            className="px-3 py-1.5 rounded-xl border border-rose-200 hover:border-rose-300 hover:bg-rose-50 text-rose-600 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <EducationEditor
                initialData={selectedEdu}
                onSave={async (eduData) => {
                  setErrorMsg("");
                  const res = await saveEducation(eduData);
                  if (res.success && res.education) {
                    setProfileData((prev) => {
                      const filtered = prev.education.filter((e) => e.id !== res.education!.id);
                      return { ...prev, education: [res.education!, ...filtered] };
                    });
                    setEduView("list");
                    setSelectedEdu(null);
                    showToast("Education saved successfully!");
                  } else {
                    setErrorMsg(res.error || "Failed to save education.");
                  }
                }}
                onCancel={() => {
                  setEduView("list");
                  setSelectedEdu(null);
                }}
              />
            )}
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* TAB 5: PROJECTS                                                     */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        {activeTab === "projects" && (
          <div className="space-y-4">
            {projView === "list" ? (
              <>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#242428]">
                  <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                    Projects ({profileData.projects.length})
                  </h2>
                  <button
                    onClick={() => {
                      setSelectedProj(null);
                      setProjView("form");
                    }}
                    className="px-3.5 py-2 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Project</span>
                  </button>
                </div>

                {profileData.projects.length === 0 ? (
                  <div className="py-12 text-center space-y-2 border border-dashed border-slate-200 dark:border-[#27272A] rounded-2xl bg-slate-50/50 dark:bg-[#161619]/60 p-6">
                    <FolderGit2 className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
                    <p className="text-xs font-bold text-slate-700 dark:text-zinc-300">No projects added yet</p>
                    <button
                      onClick={() => {
                        setSelectedProj(null);
                        setProjView("form");
                      }}
                      className="mt-2 px-4 py-2 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold cursor-pointer"
                    >
                      Add First Project
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {profileData.projects.map((proj) => (
                      <div
                        key={proj.id}
                        className="p-4 rounded-2xl bg-slate-50 dark:bg-[#18181B] border border-slate-200/80 dark:border-[#27272A] hover:border-purple-300 dark:hover:border-purple-600 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-0.5">
                          <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                            {proj.project_name || (proj as any).title}
                          </h3>
                          <p className="text-xs text-slate-600 dark:text-zinc-300 line-clamp-1">
                            {proj.description || "No description provided."}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          <button
                            onClick={() => {
                              setSelectedProj(proj);
                              setProjView("form");
                            }}
                            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-[#27272A] hover:border-purple-300 hover:bg-purple-50 text-slate-700 dark:text-zinc-300 hover:text-purple-600 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={async () => {
                              if (proj.id) {
                                const res = await deleteProject(proj.id);
                                if (res.success) {
                                  setProfileData((prev) => ({
                                    ...prev,
                                    projects: prev.projects.filter((p) => p.id !== proj.id),
                                  }));
                                  showToast("Project removed.");
                                }
                              }
                            }}
                            className="px-3 py-1.5 rounded-xl border border-rose-200 hover:border-rose-300 hover:bg-rose-50 text-rose-600 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <ProjectEditor
                initialData={selectedProj}
                onSave={async (projData) => {
                  setErrorMsg("");
                  const res = await saveProject(projData);
                  if (res.success && res.project) {
                    setProfileData((prev) => {
                      const filtered = prev.projects.filter((p) => p.id !== res.project!.id);
                      return { ...prev, projects: [res.project!, ...filtered] };
                    });
                    setProjView("list");
                    setSelectedProj(null);
                    showToast("Project saved successfully!");
                  } else {
                    setErrorMsg(res.error || "Failed to save project.");
                  }
                }}
                onCancel={() => {
                  setProjView("list");
                  setSelectedProj(null);
                }}
              />
            )}
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* TAB 6: LANGUAGES                                                    */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        {activeTab === "languages" && (
          <div className="space-y-4">
            <div className="pb-3 border-b border-slate-100 dark:border-[#242428]">
              <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                Languages ({languages.length})
              </h2>
            </div>

            <div className="p-4 rounded-2xl bg-[#F8F5FE] dark:bg-[#151518] border border-[#E9E0FA] dark:border-[#27272A] space-y-3">
              <label className="text-xs font-bold text-[#7C3AED] dark:text-purple-300 block">
                Add Language
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newLangInput}
                  onChange={(e) => setNewLangInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const val = newLangInput.trim();
                      if (val && !languages.includes(val)) {
                        handleUpdateLanguages([...languages, val]);
                        setNewLangInput("");
                        showToast(`Added ${val}!`);
                      }
                    }
                  }}
                  placeholder="e.g. English, Hindi, Telugu, Spanish..."
                  className="flex-1 bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] px-3.5 py-2 text-xs font-semibold rounded-xl outline-none focus:border-[#7C3AED] text-slate-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => {
                    const val = newLangInput.trim();
                    if (val && !languages.includes(val)) {
                      handleUpdateLanguages([...languages, val]);
                      setNewLangInput("");
                      showToast(`Added ${val}!`);
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold cursor-pointer shrink-0 shadow-xs"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Current Languages List */}
            <div className="flex flex-wrap gap-2 pt-1">
              {languages.map((lang) => (
                <div
                  key={lang}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] text-xs font-bold text-slate-800 dark:text-zinc-200 shadow-2xs"
                >
                  <Languages className="w-3.5 h-3.5 text-[#7C3AED]" />
                  <span>{lang}</span>
                  {languages.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const updated = languages.filter((l) => l !== lang);
                        handleUpdateLanguages(updated);
                        showToast(`Removed ${lang}`);
                      }}
                      className="p-0.5 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer ml-1 transition-colors"
                      title="Remove language"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* ── DOWNSIDE FLOATING DOCK (Elevated Floating Glassmorphism Bar) ─── */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="fixed bottom-6 sm:bottom-7 left-0 right-0 md:left-[260px] z-50 pointer-events-none flex items-center justify-center px-4">
        <motion.div
          initial={{ y: 30, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className="pointer-events-auto flex items-center gap-2.5 sm:gap-3"
        >
          {/* Circular Floating Back Button (Requested by User) */}
          <button
            type="button"
            onClick={() => router.push("/settings")}
            title="Back to Profile"
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/90 dark:bg-[#18181B]/90 backdrop-blur-2xl shadow-[0_12px_35px_rgba(0,0,0,0.14)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.7)] border border-slate-200/90 dark:border-white/10 flex items-center justify-center text-slate-700 dark:text-zinc-200 hover:text-[#7C3AED] hover:border-[#7C3AED] hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
            aria-label="Back to Profile"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          {/* Floating Pill Action Dock */}
          <div className="flex items-center gap-2 sm:gap-3 bg-white/90 dark:bg-[#18181B]/90 backdrop-blur-2xl shadow-[0_12px_35px_rgba(0,0,0,0.14)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.7)] border border-slate-200/90 dark:border-white/10 rounded-full py-1.5 px-3 sm:px-4">
            <Link
              href="/settings"
              className="flex items-center gap-1.5 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white px-2.5 py-1.5 rounded-full hover:bg-slate-100/80 dark:hover:bg-white/10 transition-colors text-xs font-semibold"
            >
              <User className="w-3.5 h-3.5" />
              <span className="text-[11px] font-bold">My Profile</span>
            </Link>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-50 dark:bg-purple-950/50 text-[#7C3AED] dark:text-purple-300 font-bold text-xs">
              <Edit3 className="w-3.5 h-3.5" />
              <span className="text-[11px] font-extrabold capitalize">{activeTab}</span>
              <span className="text-[10px] font-black opacity-80">({liveCompletion.totalPercent}%)</span>
            </div>

            <button
              type="button"
              onClick={() => {
                if (activeTab === "personal") {
                  handleSavePersonal();
                } else if (activeTab === "career") {
                  handleSaveCareer();
                } else if (activeTab === "coding") {
                  handleSaveCoding();
                } else if (activeTab === "skills") {
                  showToast("Skills list is saved!");
                } else if (activeTab === "languages") {
                  showToast("Languages updated!");
                } else {
                  showToast("Profile section updated!");
                }
              }}
              disabled={savingPersonal || savingCareer || savingCoding}
              className="flex items-center gap-1.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-black px-4 sm:px-5 py-2 rounded-full shadow-md shadow-purple-600/30 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{savingPersonal || savingCareer || savingCoding ? "Saving..." : "Save"}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SUB-EDITORS (EXPERIENCE, PROJECTS, EDUCATION)
// ─────────────────────────────────────────────────────────────────────────────

function ExperienceEditor({
  initialData,
  onSave,
  onCancel,
}: {
  initialData: UserExperience | null;
  onSave: (exp: any) => Promise<void>;
  onCancel: () => void;
}) {
  const [role, setRole] = useState(initialData?.role || (initialData as any)?.job_title || "");
  const [company, setCompany] = useState(initialData?.company_name || "");
  const [location, setLocation] = useState(initialData?.location || "");
  const [workType, setWorkType] = useState(initialData?.work_type || "Full-time");
  const [empType, setEmpType] = useState(initialData?.employment_type || "Remote");
  const [startDate, setStartDate] = useState(initialData?.start_date?.substring(0, 7) || "");
  const [endDate, setEndDate] = useState(initialData?.end_date?.substring(0, 7) || "");
  const [currentlyWorking, setCurrentlyWorking] = useState(
    initialData?.currently_working ?? (initialData as any)?.is_current ?? false
  );
  const [desc, setDesc] = useState(initialData?.description || "");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (!currentlyWorking && startDate && endDate && endDate < startDate) {
      setErr("End date cannot precede start date.");
      return;
    }
    setSaving(true);
    await onSave({
      id: initialData?.id,
      role,
      company_name: company,
      location,
      work_type: workType as any,
      employment_type: empType as any,
      start_date: startDate || undefined,
      end_date: currentlyWorking ? null : endDate || null,
      currently_working: currentlyWorking,
      description: desc,
    });
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#242428]">
        <button
          type="button"
          onClick={onCancel}
          className="text-xs font-bold text-slate-600 dark:text-zinc-400 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Experiences List</span>
        </button>
        <span className="text-xs font-black text-slate-800 dark:text-white">
          {initialData ? "Edit Experience" : "Add New Experience"}
        </span>
      </div>

      {err && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">
          {err}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1">
            Role / Job Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="e.g. Software Engineer Intern"
            className="w-full bg-slate-50 dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] px-3.5 py-2.5 text-xs font-semibold rounded-xl outline-none focus:border-[#7C3AED] text-slate-900 dark:text-white"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1">
            Company Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="e.g. Google, Atlassian, Startup"
            className="w-full bg-slate-50 dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] px-3.5 py-2.5 text-xs font-semibold rounded-xl outline-none focus:border-[#7C3AED] text-slate-900 dark:text-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1">
            Location
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Bengaluru, IN"
            className="w-full bg-slate-50 dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] px-3.5 py-2.5 text-xs font-semibold rounded-xl outline-none focus:border-[#7C3AED] text-slate-900 dark:text-white"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1">
            Work Type
          </label>
          <select
            value={workType}
            onChange={(e) => setWorkType(e.target.value as any)}
            className="w-full bg-slate-50 dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] px-3.5 py-2.5 text-xs font-semibold rounded-xl outline-none focus:border-[#7C3AED] cursor-pointer text-slate-900 dark:text-white"
          >
            <option value="Full-time">Full-time</option>
            <option value="Internship">Internship</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
            <option value="Freelance">Freelance</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1">
            Arrangement
          </label>
          <select
            value={empType}
            onChange={(e) => setEmpType(e.target.value as any)}
            className="w-full bg-slate-50 dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] px-3.5 py-2.5 text-xs font-semibold rounded-xl outline-none focus:border-[#7C3AED] cursor-pointer text-slate-900 dark:text-white"
          >
            <option value="Remote">Remote</option>
            <option value="Hybrid">Hybrid</option>
            <option value="Onsite">Onsite</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1">
            Start Date
          </label>
          <input
            type="month"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full bg-slate-50 dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] px-3.5 py-2.5 text-xs font-semibold rounded-xl outline-none focus:border-[#7C3AED] text-slate-900 dark:text-white"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1">
            End Date
          </label>
          <input
            type="month"
            disabled={currentlyWorking}
            value={currentlyWorking ? "" : endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full bg-slate-50 dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] px-3.5 py-2.5 text-xs font-semibold rounded-xl outline-none disabled:opacity-50 text-slate-900 dark:text-white"
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-zinc-300 cursor-pointer">
        <input
          type="checkbox"
          checked={currentlyWorking}
          onChange={(e) => setCurrentlyWorking(e.target.checked)}
          className="rounded text-[#7C3AED] focus:ring-[#7C3AED]"
        />
        <span>I currently work here</span>
      </label>

      <div>
        <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1">
          Responsibilities / Impact
        </label>
        <textarea
          rows={3}
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="Developed microservices, optimized database latency by 35%..."
          className="w-full bg-slate-50 dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] p-3.5 text-xs font-medium rounded-xl outline-none focus:border-[#7C3AED] text-slate-900 dark:text-white resize-y"
        />
      </div>

      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-[#242428]">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-[#222226] cursor-pointer text-center"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50 text-center"
        >
          {saving ? "Saving..." : "Save Experience"}
        </button>
      </div>
    </form>
  );
}

function ProjectEditor({
  initialData,
  onSave,
  onCancel,
}: {
  initialData: UserProject | null;
  onSave: (proj: any) => Promise<void>;
  onCancel: () => void;
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
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (!currentlyWorking && startDate && endDate && endDate < startDate) {
      setErr("End date cannot precede start date.");
      return;
    }
    setSaving(true);
    await onSave({
      id: initialData?.id,
      project_name: name,
      description: desc,
      technologies: tech
        .split(",")
        .map((t: string) => t.trim())
        .filter(Boolean),
      start_date: startDate || undefined,
      end_date: currentlyWorking ? null : endDate || null,
      currently_working: currentlyWorking,
      github_url: github,
      live_demo_url: demo,
    });
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#242428]">
        <button
          type="button"
          onClick={onCancel}
          className="text-xs font-bold text-slate-600 dark:text-zinc-400 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Projects List</span>
        </button>
        <span className="text-xs font-black text-slate-800 dark:text-white">
          {initialData ? "Edit Project" : "Add New Project"}
        </span>
      </div>

      {err && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">
          {err}
        </div>
      )}

      <div>
        <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1">
          Project Name <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. AI Resume Reviewer & Portfolio Engine"
          className="w-full bg-slate-50 dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] px-3.5 py-2.5 text-xs font-semibold rounded-xl outline-none focus:border-[#7C3AED] text-slate-900 dark:text-white"
        />
      </div>

      <div>
        <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1">
          Description
        </label>
        <textarea
          rows={3}
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="Full-stack interactive career intelligence application..."
          className="w-full bg-slate-50 dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] p-3.5 text-xs font-medium rounded-xl outline-none focus:border-[#7C3AED] text-slate-900 dark:text-white resize-y"
        />
      </div>

      <div>
        <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1">
          Technologies (Comma-separated)
        </label>
        <input
          type="text"
          value={tech}
          onChange={(e) => setTech(e.target.value)}
          placeholder="React, TypeScript, Supabase, Tailwind, Python"
          className="w-full bg-slate-50 dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] px-3.5 py-2.5 text-xs font-semibold rounded-xl outline-none focus:border-[#7C3AED] text-slate-900 dark:text-white"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1">
            Start Date
          </label>
          <input
            type="month"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full bg-slate-50 dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] px-3.5 py-2.5 text-xs font-semibold rounded-xl outline-none focus:border-[#7C3AED] text-slate-900 dark:text-white"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1">
            End Date
          </label>
          <input
            type="month"
            disabled={currentlyWorking}
            value={currentlyWorking ? "" : endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full bg-slate-50 dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] px-3.5 py-2.5 text-xs font-semibold rounded-xl outline-none disabled:opacity-50 text-slate-900 dark:text-white"
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-zinc-300 cursor-pointer">
        <input
          type="checkbox"
          checked={currentlyWorking}
          onChange={(e) => setCurrentlyWorking(e.target.checked)}
          className="rounded text-[#7C3AED] focus:ring-[#7C3AED]"
        />
        <span>Currently working on this project</span>
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1">
            GitHub URL
          </label>
          <input
            type="url"
            value={github}
            onChange={(e) => setGithub(e.target.value)}
            placeholder="https://github.com/username/project"
            className="w-full bg-slate-50 dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] px-3.5 py-2.5 text-xs font-mono rounded-xl outline-none focus:border-[#7C3AED] text-slate-900 dark:text-white"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1">
            Live Demo URL
          </label>
          <input
            type="url"
            value={demo}
            onChange={(e) => setDemo(e.target.value)}
            placeholder="https://project.vercel.app"
            className="w-full bg-slate-50 dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] px-3.5 py-2.5 text-xs font-mono rounded-xl outline-none focus:border-[#7C3AED] text-slate-900 dark:text-white"
          />
        </div>
      </div>

      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-[#242428]">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-[#222226] cursor-pointer text-center"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50 text-center"
        >
          {saving ? "Saving..." : "Save Project"}
        </button>
      </div>
    </form>
  );
}

function EducationEditor({
  initialData,
  onSave,
  onCancel,
}: {
  initialData: UserEducation | null;
  onSave: (edu: any) => Promise<void>;
  onCancel: () => void;
}) {
  const [college, setCollege] = useState(initialData?.college || (initialData as any)?.institution || "");
  const [degreeType, setDegreeType] = useState(
    initialData?.degree_type || (initialData as any)?.degree || "Bachelor of Technology"
  );
  const [field, setField] = useState(initialData?.field_of_study || "Computer Science");
  const [startDate, setStartDate] = useState(
    initialData?.start_date?.substring(0, 7) || (initialData as any)?.start_year || ""
  );
  const [endDate, setEndDate] = useState(
    initialData?.end_date?.substring(0, 7) || (initialData as any)?.end_year || ""
  );
  const [currentlyStudying, setCurrentlyStudying] = useState(
    initialData?.currently_studying ?? (initialData as any)?.is_current ?? false
  );
  const [gpa, setGpa] = useState(
    initialData?.gpa !== undefined && initialData?.gpa !== null ? String(initialData.gpa) : ""
  );
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (!currentlyStudying && startDate && endDate && endDate < startDate) {
      setErr("End date cannot precede start date.");
      return;
    }
    setSaving(true);
    await onSave({
      id: initialData?.id,
      college,
      degree_type: degreeType,
      field_of_study: field,
      start_date: startDate || undefined,
      end_date: currentlyStudying ? null : endDate || null,
      currently_studying: currentlyStudying,
      gpa: gpa ? parseFloat(gpa) : null,
    });
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#242428]">
        <button
          type="button"
          onClick={onCancel}
          className="text-xs font-bold text-slate-600 dark:text-zinc-400 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Education List</span>
        </button>
        <span className="text-xs font-black text-slate-800 dark:text-white">
          {initialData ? "Edit Education" : "Add New Education"}
        </span>
      </div>

      {err && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">
          {err}
        </div>
      )}

      <div>
        <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1">
          College / Institution Name <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          required
          value={college}
          onChange={(e) => setCollege(e.target.value)}
          placeholder="e.g. Indian Institute of Technology, Hyderabad"
          className="w-full bg-slate-50 dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] px-3.5 py-2.5 text-xs font-semibold rounded-xl outline-none focus:border-[#7C3AED] text-slate-900 dark:text-white"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1">
            Degree Type
          </label>
          <input
            type="text"
            value={degreeType}
            onChange={(e) => setDegreeType(e.target.value)}
            placeholder="e.g. Bachelor of Technology (B.Tech)"
            className="w-full bg-slate-50 dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] px-3.5 py-2.5 text-xs font-semibold rounded-xl outline-none focus:border-[#7C3AED] text-slate-900 dark:text-white"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1">
            Field of Study
          </label>
          <input
            type="text"
            value={field}
            onChange={(e) => setField(e.target.value)}
            placeholder="e.g. Computer Science & Engineering"
            className="w-full bg-slate-50 dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] px-3.5 py-2.5 text-xs font-semibold rounded-xl outline-none focus:border-[#7C3AED] text-slate-900 dark:text-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1">
            Start Date
          </label>
          <input
            type="month"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full bg-slate-50 dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] px-3.5 py-2.5 text-xs font-semibold rounded-xl outline-none focus:border-[#7C3AED] text-slate-900 dark:text-white"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1">
            End Date (Graduation)
          </label>
          <input
            type="month"
            disabled={currentlyStudying}
            value={currentlyStudying ? "" : endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full bg-slate-50 dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] px-3.5 py-2.5 text-xs font-semibold rounded-xl outline-none disabled:opacity-50 text-slate-900 dark:text-white"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1">
            GPA / Percentage
          </label>
          <input
            type="text"
            value={gpa}
            onChange={(e) => setGpa(e.target.value)}
            placeholder="e.g. 8.8 / 10"
            className="w-full bg-slate-50 dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] px-3.5 py-2.5 text-xs font-semibold rounded-xl outline-none focus:border-[#7C3AED] text-slate-900 dark:text-white"
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-zinc-300 cursor-pointer">
        <input
          type="checkbox"
          checked={currentlyStudying}
          onChange={(e) => setCurrentlyStudying(e.target.checked)}
          className="rounded text-[#7C3AED] focus:ring-[#7C3AED]"
        />
        <span>I am currently studying here</span>
      </label>

      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-[#242428]">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-[#222226] cursor-pointer text-center"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50 text-center"
        >
          {saving ? "Saving..." : "Save Education"}
        </button>
      </div>
    </form>
  );
}


export default function EditProfilePage() {
  return (
    <Suspense fallback={<div className="max-w-3xl mx-auto p-8 text-center text-slate-400 text-xs font-bold">Loading editor...</div>}>
      <EditProfileContent />
    </Suspense>
  );
}
