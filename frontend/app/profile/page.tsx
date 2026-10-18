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
  Headset,
  Phone,
  Mail,
  ShieldCheck,
  Briefcase,
  FolderGit2,
  FileText,
  Plus,
  Trash2,
  Edit3,
  Eye,
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
  ArrowRight,
  Languages,
  Terminal,
  Cloud,
  Database,
  Layers,
  Cpu,
  GitBranch,
  User,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import {
  fetchFullProfileData,
  savePersonalProfile,
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

export default function ProfilePage() {
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

  // ── Coding Profiles Form State ────────────────────────────────────────────
  const [leetcodeInput, setLeetcodeInput] = useState("");
  const [githubInput, setGithubInput] = useState("");
  const [hackerrankInput, setHackerrankInput] = useState("");
  const [codechefInput, setCodechefInput] = useState("");
  const [gfgInput, setGfgInput] = useState("");
  const [codeforcesInput, setCodeforcesInput] = useState("");
  const [codingStats, setCodingStats] = useState<Record<string, PlatformStat>>({});

  // ── Career Preferences Form State ─────────────────────────────────────────
  const [careerPrefsForm, setCareerPrefsForm] = useState<UserCareerPreferences>({
    target_roles: [],
    preferred_industries: [],
    target_companies: [],
    preferred_locations: [],
    work_arrangements: ["Hybrid", "Remote"],
  });

  // ── Resume State ──────────────────────────────────────────────────────────
  const [uploadingResume, setUploadingResume] = useState(false);
  const [resumeMsg, setResumeMsg] = useState("");
  const [resumePreviewUrl, setResumePreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Restore cached resume preview from IndexedDB across page reloads
  useEffect(() => {
    if (typeof window === "undefined" || !("indexedDB" in window)) return;
    try {
      const req = indexedDB.open("SkillsCatalystCache", 1);
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains("resumes")) {
          req.result.createObjectStore("resumes");
        }
      };
      req.onsuccess = () => {
        try {
          const db = req.result;
          if (!db.objectStoreNames.contains("resumes")) return;
          const tx = db.transaction("resumes", "readonly");
          const store = tx.objectStore("resumes");
          const getReq = store.get("latest_resume");
          getReq.onsuccess = () => {
            if (getReq.result instanceof Blob) {
              const url = URL.createObjectURL(getReq.result);
              setResumePreviewUrl(url);
            }
          };
        } catch {}
      };
    } catch {}
  }, []);

  // ── Modals State ──────────────────────────────────────────────────────────
  type ModalType = "avatar" | "resume_preview" | null;
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [modalError, setModalError] = useState("");

  // ── Interactive UI States ─────────────────────────────────────────────────
  const [languages, setLanguages] = useState<string[]>(["English"]);

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

  // ── Handler: Upload Resume (Official AI Pipeline) ─────────────────────────
  const handleResumeUpload = async (file: File) => {
    if (!file) return;
    setUploadingResume(true);
    setResumeMsg("");

    // Create live preview URL immediately for visual rendering
    try {
      const url = URL.createObjectURL(file);
      setResumePreviewUrl(url);

      if (typeof window !== "undefined" && "indexedDB" in window) {
        const req = indexedDB.open("SkillsCatalystCache", 1);
        req.onupgradeneeded = () => {
          if (!req.result.objectStoreNames.contains("resumes")) {
            req.result.createObjectStore("resumes");
          }
        };
        req.onsuccess = () => {
          try {
            const db = req.result;
            if (db.objectStoreNames.contains("resumes")) {
              const tx = db.transaction("resumes", "readwrite");
              tx.objectStore("resumes").put(file, "latest_resume");
            }
          } catch {}
        };
      }
    } catch (e) {
      console.warn("Could not create resume preview URL:", e);
    }

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

      // Call official reviewResume pipeline
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

  // ── Helper Utilities ──────────────────────────────────────────────────────
  const getInitials = (name: string) => {
    if (!name) return "SC";
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const getOrgInitials = (orgName: string) => {
    if (!orgName) return "VC";
    const words = orgName.trim().split(/\s+/).filter(Boolean);
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return (words[0][0] + (words[1] ? words[1][0] : "")).toUpperCase();
  };

  const displayName = personalForm.full_name || session?.name || (session?.email ? session.email.split("@")[0] : "Student Profile");
  const userHandle = session?.email ? session.email.split("@")[0] : "student";

  // Categorized skills helper
  const SKILL_CATEGORIES = [
    {
      id: "prog",
      label: "Programming / scripting Languages",
      iconType: "terminal",
      filter: (s: UserSkill) => {
        const cat = (s.category || "").toLowerCase();
        const name = (s.skill_name || "").toLowerCase();
        return (
          cat.includes("program") ||
          cat.includes("script") ||
          cat.includes("language") ||
          cat === "technical" ||
          ["python", "c", "c++", "java", "javascript", "typescript", "rust", "go", "ruby", "php"].some((k) => name.includes(k))
        );
      },
    },
    {
      id: "cloud",
      label: "Cloud & Devops",
      iconType: "cloud",
      filter: (s: UserSkill) => {
        const cat = (s.category || "").toLowerCase();
        const name = (s.skill_name || "").toLowerCase();
        return (
          cat.includes("cloud") ||
          cat.includes("devops") ||
          ["aws", "azure", "gcp", "docker", "kubernetes", "ci/cd", "terraform"].some((k) => name.includes(k))
        );
      },
    },
    {
      id: "db",
      label: "Databases",
      iconType: "database",
      filter: (s: UserSkill) => {
        const cat = (s.category || "").toLowerCase();
        const name = (s.skill_name || "").toLowerCase();
        return (
          cat.includes("database") ||
          cat.includes("db") ||
          ["supabase", "postgres", "sql", "mongodb", "redis", "mysql"].some((k) => name.includes(k))
        );
      },
    },
    {
      id: "frameworks",
      label: "Frameworks",
      iconType: "layers",
      filter: (s: UserSkill) => {
        const cat = (s.category || "").toLowerCase();
        const name = (s.skill_name || "").toLowerCase();
        return (
          cat.includes("framework") ||
          ["fastapi", "react", "next", "next.js", "nextjs", "django", "express", "flask", "spring", "vue", "angular"].some((k) => name.includes(k))
        );
      },
    },
    {
      id: "technologies",
      label: "Technologies",
      iconType: "cpu",
      filter: (s: UserSkill) => {
        const cat = (s.category || "").toLowerCase();
        return cat.includes("technolog");
      },
    },
    {
      id: "tools",
      label: "Tools & Platforms",
      iconType: "git",
      filter: (s: UserSkill) => {
        const cat = (s.category || "").toLowerCase();
        const name = (s.skill_name || "").toLowerCase();
        return (
          cat.includes("tool") ||
          cat.includes("platform") ||
          ["git", "github", "vscode", "visual studio code", "postman", "linux", "jira"].some((k) => name.includes(k))
        );
      },
    },
    {
      id: "soft",
      label: "Soft Skills",
      iconType: "sparkles",
      filter: (s: UserSkill) => (s.category || "").toLowerCase().includes("soft"),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-4 pb-24 select-none font-sans px-3 sm:px-4"
    >
      {/* Hidden file input for resume PDF upload */}
      <input
        type="file"
        ref={fileInputRef}
        accept=".pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleResumeUpload(file);
        }}
      />

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 1. TOP BENTO GRID: 3 MINI CARDS LEFT (col-span-5) & PROFILE RIGHT (col-span-7) */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-12 gap-2 sm:gap-3.5 items-stretch">
        {/* Left Column: 3 Mini Cards (Resume, Courses, Projects) */}
        <div className="col-span-5 flex flex-col gap-1.5 sm:gap-3 justify-between">
          {/* Card 1: Resume */}
          <div
            role="button"
            tabIndex={0}
            aria-label="Resume card. Click or press Enter to preview or upload resume."
            onClick={() => {
              if (profileData.resume?.filename || resumePreviewUrl) {
                setActiveModal("resume_preview");
              } else {
                fileInputRef.current?.click();
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                if (profileData.resume?.filename || resumePreviewUrl) {
                  setActiveModal("resume_preview");
                } else {
                  fileInputRef.current?.click();
                }
              }
            }}
            className="flex-1 bg-white dark:bg-[#18191F] rounded-2xl sm:rounded-3xl p-2 sm:p-4 lg:p-5 border border-slate-200/80 dark:border-neutral-800 hover:border-purple-300 dark:hover:border-purple-500/50 hover:shadow-xs transition-all flex items-center justify-between gap-1.5 cursor-pointer group focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2"
          >
            <div className="min-w-0 flex-1">
              <h3 className="text-xs sm:text-base font-black text-slate-900 dark:text-white truncate">Resume</h3>
              {profileData.resume?.filename || resumePreviewUrl ? (
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] sm:text-xs font-bold text-purple-700 dark:text-purple-400 hover:text-purple-900 dark:hover:text-purple-300 flex items-center gap-0.5">
                    <Eye className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    Preview
                  </span>
                  <span className="text-[9px] text-slate-300 dark:text-neutral-600">•</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="text-[9px] sm:text-xs font-semibold text-slate-400 dark:text-neutral-400 hover:text-slate-700 dark:hover:text-neutral-200 cursor-pointer focus:outline-none focus:underline"
                    aria-label="Upload replacement resume"
                  >
                    Update
                  </button>
                </div>
              ) : (
                <p className="text-[9px] sm:text-xs font-semibold text-slate-400 dark:text-neutral-400 mt-0.5 truncate">
                  Upload resume
                </p>
              )}
            </div>
            <img
              src="/images/profile/resume_3d.jpg"
              alt="Resume"
              className="w-7 h-7 sm:w-14 sm:h-14 lg:w-16 lg:h-16 object-contain rounded-lg sm:rounded-2xl group-hover:scale-105 transition-transform shrink-0"
            />
          </div>

          {/* Card 2: Roadmaps */}
          <Link
            href="/roadmaps"
            className="flex-1 bg-white dark:bg-[#18191F] rounded-2xl sm:rounded-3xl p-2 sm:p-4 lg:p-5 border border-slate-200/80 dark:border-neutral-800 hover:border-purple-300 dark:hover:border-purple-500/50 hover:shadow-xs transition-all flex items-center justify-between gap-1.5 group"
          >
            <div className="min-w-0 flex-1">
              <h3 className="text-xs sm:text-base font-black text-slate-900 dark:text-white truncate">Roadmaps</h3>
              <p className="text-[9px] sm:text-xs font-semibold text-slate-400 dark:text-neutral-400 mt-0.5 truncate">Explore paths</p>
            </div>
            <img
              src="/images/profile/courses_3d.jpg"
              alt="Roadmaps"
              className="w-7 h-7 sm:w-14 sm:h-14 lg:w-16 lg:h-16 object-contain rounded-lg sm:rounded-2xl group-hover:scale-105 transition-transform shrink-0"
            />
          </Link>

          {/* Card 3: Projects */}
          <a
            href="#proof-of-work"
            className="flex-1 bg-white dark:bg-[#18191F] rounded-2xl sm:rounded-3xl p-2 sm:p-4 lg:p-5 border border-slate-200/80 dark:border-neutral-800 hover:border-purple-300 dark:hover:border-purple-500/50 hover:shadow-xs transition-all flex items-center justify-between gap-1.5 group"
          >
            <div className="min-w-0 flex-1">
              <h3 className="text-xs sm:text-base font-black text-slate-900 dark:text-white truncate">Projects</h3>
              <p className="text-xs sm:text-lg font-black text-slate-900 dark:text-white mt-0.5 truncate">
                {profileData.projects.length || 0}
              </p>
            </div>
            <img
              src="/images/profile/projects_3d.jpg"
              alt="Projects"
              className="w-7 h-7 sm:w-14 sm:h-14 lg:w-16 lg:h-16 object-contain rounded-lg sm:rounded-2xl group-hover:scale-105 transition-transform shrink-0"
            />
          </a>
        </div>

        {/* Right Card: Vibrant Deep Purple/Violet Monogram Profile */}
        <div className="col-span-7 bg-gradient-to-br from-[#1E084E] via-[#3B0E7E] to-[#6A1EB0] rounded-2xl sm:rounded-3xl p-3 sm:p-5 lg:p-6 text-white shadow-md border border-purple-400/20 relative overflow-hidden flex flex-col justify-between min-h-[240px] sm:min-h-[320px] lg:min-h-[350px] group">
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-16 -right-16 w-56 h-56 bg-purple-400/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-violet-400/20 rounded-full blur-3xl pointer-events-none" />

          {/* Center Monogram Initials / Big Profile Picture */}
          <div
            role="button"
            tabIndex={0}
            aria-label="Change photo or avatar"
            className="flex-1 flex items-center justify-center my-auto py-2 sm:py-3 relative z-10 cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/60 focus:ring-offset-2 rounded-2xl"
            onClick={() => setActiveModal("avatar")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setActiveModal("avatar");
              }
            }}
            title="Change photo or avatar"
          >
            {personalForm.avatar_url ? (
              <img
                src={personalForm.avatar_url}
                alt={displayName}
                className="w-28 h-28 sm:w-44 sm:h-44 md:w-48 md:h-48 lg:w-56 lg:h-56 aspect-square object-cover object-center rounded-2xl sm:rounded-3xl border-2 sm:border-[3px] border-white/30 shadow-2xl group-hover:scale-[1.03] transition-all duration-300"
              />
            ) : (
              <span className="text-5xl sm:text-8xl lg:text-9xl font-black text-white/95 tracking-tight select-none drop-shadow-sm transition-transform duration-300 group-hover:scale-105">
                {getInitials(displayName)}
              </span>
            )}
          </div>

          {/* Bottom Profile Details */}
          <div className="relative z-10 space-y-0.5 mt-2">
            <p className="text-[10px] sm:text-xs lg:text-sm font-semibold text-purple-200/90 truncate">
              @{userHandle}
            </p>
            <h2 className="text-xs sm:text-xl lg:text-2xl font-black text-white tracking-tight leading-tight truncate">
              {displayName}
            </h2>
            <p className="text-[9px] sm:text-xs font-medium text-purple-200/80 truncate">
              {personalForm.headline || "Student"}
            </p>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 2. SUB-BENTO BAR: FOLLOWERS PILL (col-span-5) & EDIT PROFILE (col-span-7) */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-12 gap-2 sm:gap-3.5 items-stretch">
        {/* Left Pill: Under Left Cards */}
        <div className="col-span-5 bg-white dark:bg-[#18191F] rounded-2xl sm:rounded-full border border-slate-200/80 dark:border-neutral-800 px-2 sm:px-4 lg:px-6 py-2.5 sm:py-3.5 flex items-center justify-center gap-2 sm:gap-4 shadow-xs">
          <div className="text-[11px] sm:text-sm font-semibold text-slate-600 dark:text-neutral-400 truncate">
            <span className="font-black text-slate-900 dark:text-white">0</span> Following
          </div>
          <div className="w-px h-3 sm:h-4 bg-slate-200 dark:bg-neutral-800 shrink-0" />
          <div className="text-[11px] sm:text-sm font-semibold text-slate-600 dark:text-neutral-400 truncate">
            <span className="font-black text-slate-900 dark:text-white">0</span> Followers
          </div>
        </div>

        <Link
          href="/settings/edit"
          className="col-span-7 bg-white dark:bg-[#18191F] rounded-2xl sm:rounded-full border border-slate-200/80 dark:border-neutral-800 hover:border-purple-300 dark:hover:border-purple-500 hover:bg-purple-50/40 dark:hover:bg-[#20222A] px-2 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-center gap-1.5 sm:gap-2 text-[11px] sm:text-sm font-bold text-slate-800 dark:text-white transition-all shadow-xs cursor-pointer"
        >
          <Edit3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-600 dark:text-neutral-400 shrink-0" />
          <span className="truncate">Edit Profile & Settings</span>
        </Link>
      </div>

      {resumeMsg && (
        <div className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/50 text-purple-900 dark:text-purple-200 text-xs font-bold flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
          <span>{resumeMsg}</span>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 3. EXPERIENCE CARD                                                  */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div id="experience" className="bg-white dark:bg-[#18191F] rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-neutral-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">Experience</h3>
          <Link
            href="/settings/edit?tab=experience"
            className="text-xs font-bold text-purple-700 dark:text-purple-400 hover:underline flex items-center gap-1"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Manage</span>
          </Link>
        </div>

        {profileData.experiences.length === 0 ? (
          <div className="py-8 text-center text-sm font-medium text-slate-400 dark:text-neutral-500">
            No experience added yet.{" "}
            <Link href="/settings/edit?tab=experience" className="text-purple-600 dark:text-purple-400 underline font-bold">
              Add your work experience
            </Link>
          </div>
        ) : (
          <div className="space-y-3 pt-1">
            {profileData.experiences.map((exp) => (
              <div key={exp.id} className="p-4 rounded-2xl bg-slate-50/70 dark:bg-[#121318] border border-slate-200/70 dark:border-neutral-800 space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white">{exp.role || (exp as any).job_title}</h4>
                    <p className="text-xs font-semibold text-purple-700 dark:text-purple-400">{exp.company_name}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-500 dark:text-neutral-400 font-medium">
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
                  <p className="text-[11px] text-slate-600 dark:text-neutral-300 font-normal pt-1 line-clamp-2">
                    {exp.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 4. PROOF OF WORK / PROJECTS CARD                                    */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div id="proof-of-work" className="bg-white dark:bg-[#18191F] rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-neutral-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">Proof of Work</h3>
          <Link
            href="/settings/edit?tab=projects"
            className="text-xs font-bold text-purple-700 dark:text-purple-400 hover:underline flex items-center gap-1"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Manage</span>
          </Link>
        </div>

        {profileData.projects.length === 0 ? (
          <div className="py-8 text-center text-sm font-medium text-slate-400 dark:text-neutral-500">
            No projects added yet.{" "}
            <Link href="/settings/edit?tab=projects" className="text-purple-600 dark:text-purple-400 underline font-bold">
              Add links to your work and projects
            </Link>
          </div>
        ) : (
          <div className="space-y-3 pt-1">
            {profileData.projects.map((proj) => (
              <div key={proj.id} className="p-4 rounded-2xl bg-slate-50/70 dark:bg-[#121318] border border-slate-200/70 dark:border-neutral-800 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-xs font-black text-slate-900 dark:text-white">{proj.project_name || (proj as any).title}</h4>
                </div>
                {proj.description && (
                  <p className="text-[11px] text-slate-600 dark:text-neutral-300 line-clamp-2 leading-relaxed">
                    {proj.description}
                  </p>
                )}
                {((proj.technologies && proj.technologies.length > 0) || ((proj as any).tech_stack && (proj as any).tech_stack.length > 0)) && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {(proj.technologies || (proj as any).tech_stack).map((t: string) => (
                      <span key={t} className="text-[9px] font-bold px-2 py-0.5 rounded bg-white dark:bg-[#18191F] text-slate-700 dark:text-neutral-200 border border-slate-200 dark:border-neutral-700">
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
                      className="text-purple-700 dark:text-purple-400 hover:underline flex items-center gap-1"
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
                      className="text-purple-700 dark:text-purple-400 hover:underline flex items-center gap-1"
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

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 5. EXPERTISE & SKILLS CARD                                          */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div id="skills" className="bg-white dark:bg-[#18191F] rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-neutral-800 shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">Expertise & Skills</h3>
          <Link
            href="/settings/edit?tab=skills"
            className="text-xs font-bold text-purple-700 dark:text-purple-400 hover:underline flex items-center gap-1"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Manage</span>
          </Link>
        </div>

        {profileData.skills.length === 0 ? (
          <div className="py-8 text-center text-sm font-medium text-slate-400 dark:text-neutral-500">
            No skills added yet. Add your programming languages, tools, and frameworks in settings.
          </div>
        ) : (
          <div className="space-y-4 pt-1">
            {SKILL_CATEGORIES.map((cat) => {
              const matchedSkills = profileData.skills.filter(cat.filter);
              if (matchedSkills.length === 0) return null;

              return (
                <div key={cat.id} className="space-y-2">
                  <div className="text-xs font-semibold text-indigo-500/90 dark:text-indigo-400 flex items-center gap-1.5">
                    <span className="text-indigo-400">—</span>
                    <span>{cat.label}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {matchedSkills.map((s) => (
                      <div
                        key={s.id || s.skill_name}
                        className="px-3.5 py-2 rounded-2xl bg-white dark:bg-[#121318] border border-slate-200 dark:border-neutral-800 shadow-2xs flex items-center gap-2"
                      >
                        {cat.iconType === "terminal" ? (
                          <span className="text-[11px] font-mono font-bold text-amber-500">{`>_`}</span>
                        ) : cat.iconType === "cloud" ? (
                          <Cloud className="w-3.5 h-3.5 text-teal-500" />
                        ) : cat.iconType === "database" ? (
                          <Database className="w-3.5 h-3.5 text-purple-500" />
                        ) : cat.iconType === "layers" ? (
                          <Layers className="w-3.5 h-3.5 text-indigo-500" />
                        ) : cat.iconType === "cpu" ? (
                          <Cpu className="w-3.5 h-3.5 text-blue-500" />
                        ) : cat.iconType === "git" ? (
                          <GitBranch className="w-3.5 h-3.5 text-orange-500" />
                        ) : (
                          <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                        )}
                        <span className="text-xs font-bold text-slate-800 dark:text-white">{s.skill_name}</span>
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
      {/* 6. LANGUAGES CARD                                                   */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#18191F] rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-neutral-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">Languages</h3>
          <Link
            href="/settings/edit?tab=languages"
            className="text-xs font-bold text-purple-700 dark:text-purple-400 hover:underline flex items-center gap-1"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Manage</span>
          </Link>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {languages.map((lang) => (
            <span
              key={lang}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-indigo-50/70 dark:bg-[#121318] border border-indigo-100 dark:border-neutral-800 text-xs font-semibold text-indigo-700 dark:text-indigo-300"
            >
              <Languages className="w-3.5 h-3.5 text-indigo-500" />
              <span>{lang}</span>
            </span>
          ))}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 7. COURSE CERTIFICATES CARD                                         */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#18191F] rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-neutral-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">Official Certificates</h3>
              <p className="text-xs text-slate-500 dark:text-neutral-400 font-medium">Verified credentials issued for skill assessments</p>
            </div>
          </div>
          <Link
            href="/certificates"
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-neutral-800 hover:border-amber-300 dark:hover:border-amber-500/40 hover:bg-amber-50 dark:hover:bg-amber-500/10 text-slate-700 dark:text-neutral-200 hover:text-amber-700 dark:hover:text-amber-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Eye className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>View Certificates</span>
          </Link>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 8. EDUCATION CARD                                                   */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div id="education" className="bg-white dark:bg-[#18191F] rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-neutral-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">Education</h3>
          <Link
            href="/settings/edit?tab=education"
            className="text-xs font-bold text-purple-700 dark:text-purple-400 hover:underline flex items-center gap-1"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Manage</span>
          </Link>
        </div>

        {profileData.education.length === 0 ? (
          <div className="py-8 text-center text-sm font-medium text-slate-400 dark:text-neutral-500">
            No education added yet. Add your university or college details in settings.
          </div>
        ) : (
          <div className="space-y-4 pt-1">
            {profileData.education.map((edu) => (
              <div key={edu.id} className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#F97316] text-white font-black text-base flex items-center justify-center shrink-0 shadow-xs">
                  {getOrgInitials(edu.college || (edu as any).institution || "VC")}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {edu.college || (edu as any).institution}
                    </h4>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-neutral-300 font-medium mt-0.5">
                    {edu.degree_type || (edu as any).degree}
                    {edu.field_of_study ? ` • ${edu.field_of_study}` : ""}
                  </p>

                  <p className="text-xs text-slate-400 dark:text-neutral-500 font-normal mt-0.5">
                    {edu.start_date || (edu as any).start_year || "2025"} –{" "}
                    {edu.currently_studying ?? (edu as any).is_current
                      ? "Present"
                      : edu.end_date || (edu as any).end_year || "Present"}
                    {edu.gpa !== undefined && edu.gpa !== null && ` • Grade: ${edu.gpa}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 9. CAREER PREFERENCES CARD                                          */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div id="preferences" className="bg-white dark:bg-[#18191F] rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-neutral-800 shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">Career Preferences</h3>
              <p className="text-xs text-slate-500 dark:text-neutral-400 font-medium">Desired job roles, dream companies, and arrangements</p>
            </div>
          </div>
          <Link
            href="/settings/edit?tab=career"
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-neutral-800 hover:border-purple-300 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-950/30 text-slate-700 dark:text-neutral-200 hover:text-purple-700 dark:hover:text-purple-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Edit3 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>Edit Preferences</span>
          </Link>
        </div>

        {/* Roles */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-black text-slate-500 dark:text-neutral-400 uppercase tracking-wider block">
            Target Job Roles
          </label>
          {(careerPrefsForm.target_roles || []).length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {careerPrefsForm.target_roles?.map((r, i) => (
                <span
                  key={i}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-rose-900 dark:text-rose-200 text-xs font-bold shadow-2xs"
                >
                  {r}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 dark:text-neutral-500 font-medium italic">
              No target roles specified yet. Click &apos;Edit Preferences&apos; to configure your career goals.
            </p>
          )}
        </div>

        {/* Dream Companies */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-black text-slate-500 dark:text-neutral-400 uppercase tracking-wider block">
            Dream Companies
          </label>
          {(careerPrefsForm.target_companies || []).length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {careerPrefsForm.target_companies?.map((c, i) => (
                <span
                  key={i}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/40 text-purple-900 dark:text-purple-200 text-xs font-bold shadow-2xs"
                >
                  {c}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 dark:text-neutral-500 font-medium italic">
              No dream companies specified yet. Click &apos;Edit Preferences&apos; to add companies.
            </p>
          )}
        </div>

        {/* Work Arrangements */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-black text-slate-500 dark:text-neutral-400 uppercase tracking-wider block">
            Work Arrangements
          </label>
          <div className="flex flex-wrap gap-2">
            {["Remote", "Hybrid", "Onsite"].map((arr) => {
              const isSelected = (careerPrefsForm.work_arrangements || []).includes(arr);
              return (
                <span
                  key={arr}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isSelected
                      ? "bg-purple-700 text-white shadow-xs"
                      : "bg-slate-100 dark:bg-[#121318] text-slate-400 dark:text-neutral-500 border dark:border-neutral-800 opacity-60"
                  }`}
                >
                  {arr}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 10. DEVELOPER PLATFORMS CARD                                        */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div id="developer" className="bg-white dark:bg-[#18191F] rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-neutral-800 shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                Developer & Coding Profiles
              </h3>
              <p className="text-xs text-slate-500 dark:text-neutral-400 font-medium">
                Connected accounts across competitive programming and developer platforms
              </p>
            </div>
          </div>
          <Link
            href="/settings/edit?tab=coding"
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-neutral-800 hover:border-purple-300 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-950/30 text-slate-700 dark:text-neutral-200 hover:text-purple-700 dark:hover:text-purple-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Edit3 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>Edit Profiles</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { key: "leetcode", title: "LeetCode", logo: "/images/coding/leetcode.png", logoClass: "h-5 w-auto max-w-[24px] object-contain", showTitle: true, val: leetcodeInput, stat: codingStats.leetcode },
            { key: "github", title: "GitHub", logo: "/images/coding/github.png", logoClass: "h-5 w-auto max-w-[80px] object-contain dark:invert", showTitle: false, val: githubInput, stat: codingStats.github },
            { key: "codeforces", title: "Codeforces", logo: "/images/coding/codeforces.svg", logoClass: "h-5 w-5 object-contain", showTitle: true, val: codeforcesInput, stat: codingStats.codeforces },
            { key: "codechef", title: "CodeChef", logo: "/images/coding/codechef.png", logoClass: "h-5 w-auto max-w-[90px] object-contain", showTitle: false, val: codechefInput, stat: codingStats.codechef },
            { key: "hackerrank", title: "HackerRank", logo: "/images/coding/hackerrank.png", logoClass: "h-5 w-auto max-w-[24px] object-contain", showTitle: true, val: hackerrankInput, stat: codingStats.hackerrank },
            { key: "geeksforgeeks", title: "GeeksforGeeks", logo: "/images/coding/geeksforgeeks.png", logoClass: "h-5 w-auto max-w-[110px] object-contain", showTitle: false, val: gfgInput, stat: codingStats.geeksforgeeks },
          ].map((item) => {
            const isConnected = !!(item.val || (item.stat && item.stat.configured));
            const displayHandle = item.val
              ? item.val.replace(/^https?:\/\/(www\.)?[a-zA-Z0-9.-]+\/(u\/|profile\/|users\/|user\/)?/, "")
              : item.stat?.username || "";

            return (
              <div
                key={item.key}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-[#121318] border border-slate-200/90 dark:border-neutral-800 transition-all space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-h-[26px]">
                    <img
                      src={item.logo}
                      alt={item.title}
                      className={item.logoClass}
                    />
                    {item.showTitle && (
                      <span className="text-xs font-black text-slate-900 dark:text-white">{item.title}</span>
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                      isConnected
                        ? "bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50"
                        : "bg-slate-100 dark:bg-[#18191F] text-slate-400 dark:text-neutral-500 border border-slate-200/60 dark:border-neutral-800"
                    }`}
                  >
                    {isConnected ? "Connected" : "Not Connected"}
                  </span>
                </div>

                {isConnected ? (
                  <div className="space-y-1">
                    <div className="text-xs">
                      <span className="font-mono font-bold text-slate-800 dark:text-neutral-200 truncate block">
                        {displayHandle || item.val}
                      </span>
                    </div>
                    {item.stat && item.stat.summary && (
                      <p className="text-[11px] font-medium text-purple-700 dark:text-purple-400 truncate">
                        {item.stat.summary}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-[11px] font-medium text-slate-400 dark:text-neutral-500">
                    Not connected
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 11. CUSTOMER SERVICE & LEGAL POLICIES                               */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#18191F] rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-neutral-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-200/60 dark:border-purple-800/40 shadow-2xs">
              <Headset className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">Customer Service & Founder Support</h3>
              <p className="text-xs text-slate-500 dark:text-neutral-400 font-medium">Direct founder contact and student policies</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/support"
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#4A1584] to-[#7E22CE] text-white text-xs font-bold shadow-xs hover:opacity-95 transition-opacity"
            >
              Support Desk ➔
            </Link>
            <button
              onClick={logout}
              className="px-4 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-950/40 text-rose-700 dark:text-rose-400 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#121318] border border-slate-200 dark:border-neutral-800 text-xs">
            <span className="text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase block">Founder</span>
            <span className="font-bold text-slate-900 dark:text-white">Palamoor Adithya Goud</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#121318] border border-slate-200 dark:border-neutral-800 text-xs">
            <span className="text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase block">Phone / WhatsApp</span>
            <a href="tel:+917330602101" className="font-bold text-purple-700 dark:text-purple-400 hover:underline">
              +91 7330602101
            </a>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#121318] border border-slate-200 dark:border-neutral-800 text-xs truncate">
            <span className="text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase block">Email</span>
            <a href="mailto:palamooradithyagoud@gmail.com" className="font-bold text-purple-700 dark:text-purple-400 hover:underline truncate">
              palamooradithyagoud@gmail.com
            </a>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 12. INTERACTIVE MODALS                                               */}
      {/* ─────────────────────────────────────────────────────────────────── */}

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

      {/* MODAL: RESUME DOCUMENT PREVIEW */}
      <AnimatePresence>
        {activeModal === "resume_preview" && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-[#18191F] rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-100 dark:border-neutral-800 flex flex-col max-h-[92vh] overflow-hidden my-auto"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-5 sm:px-7 py-4 border-b border-slate-100 dark:border-neutral-800 bg-slate-50/70 dark:bg-[#121318]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 flex items-center justify-center font-black text-xs shrink-0 shadow-2xs">
                    PDF
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <span className="truncate max-w-[200px] sm:max-w-xs">
                        {profileData.resume?.filename || "Resume Document"}
                      </span>
                      {(profileData.resume?.ats_score || profileData.resume?.overall_score) && (
                        <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50 shrink-0">
                          {profileData.resume.ats_score || profileData.resume.overall_score}/100 ATS
                        </span>
                      )}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-slate-400 dark:text-neutral-400 font-medium">
                      {profileData.resume?.summary || "Interactive resume document preview"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {resumePreviewUrl && (
                    <a
                      href={resumePreviewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#18191F] hover:bg-slate-200 dark:hover:bg-[#20222A] text-slate-700 dark:text-neutral-200 text-xs font-bold transition-all flex items-center gap-1.5"
                      title="Open full document in a new tab"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Open Fullscreen</span>
                    </a>
                  )}
                  <button
                    onClick={() => {
                      fileInputRef.current?.click();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    title="Upload replacement resume"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Replace PDF</span>
                  </button>
                  <button
                    onClick={() => setActiveModal(null)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-neutral-200 hover:bg-slate-100 dark:hover:bg-[#20222A] transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-hidden p-3 sm:p-5 bg-slate-100/60 dark:bg-[#101114] flex flex-col items-center justify-center min-h-[420px] sm:min-h-[580px]">
                {resumePreviewUrl ? (
                  <iframe
                    src={resumePreviewUrl}
                    title="Uploaded Resume Preview"
                    className="w-full h-[58vh] sm:h-[68vh] rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-[#18191F] shadow-xs"
                  />
                ) : (
                  <div className="max-w-md text-center space-y-4 p-8 bg-white dark:bg-[#18191F] rounded-3xl border border-slate-200 dark:border-neutral-800 shadow-xs my-auto">
                    <div className="w-16 h-16 rounded-3xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 flex items-center justify-center mx-auto shadow-xs">
                      <FileText className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="text-base font-black text-slate-900 dark:text-white">
                        {profileData.resume?.filename || "Resume on file"}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1 leading-relaxed">
                        Your resume has been saved and reviewed by AI with an ATS readiness score of{" "}
                        <strong className="text-purple-700 dark:text-purple-400">
                          {profileData.resume?.ats_score || profileData.resume?.overall_score || 75}/100
                        </strong>
                        . To render the embedded PDF reader in this browser session, select or drop your PDF document below.
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#4A1584] to-[#7E22CE] text-white font-bold text-xs shadow-xs hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <UploadCloud className="w-4 h-4" />
                        <span>Select PDF to View</span>
                      </button>
                      <Link
                        href="/career"
                        className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-[#121318] hover:bg-slate-200 dark:hover:bg-[#20222A] text-slate-700 dark:text-neutral-200 font-bold text-xs transition-all flex items-center justify-center gap-1.5 border dark:border-neutral-800"
                      >
                        <span>AI Mentor Review</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── MODAL SHELL & AVATAR FORM ───────────────────────────────────────────────

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
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="bg-white dark:bg-[#18191F] rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 dark:border-neutral-800 space-y-4 my-8"
      >
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-neutral-800 pb-3">
          <h3 className="text-base font-black text-slate-900 dark:text-white">{title}</h3>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-neutral-200 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-300 text-xs font-bold">
            {error}
          </div>
        )}
        {children}
      </motion.div>
    </div>
  );
}

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
          reject(new Error("Canvas context initialization failed"));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/webp", 0.85));
      };
      img.onerror = () => reject(new Error("Failed to decode image file"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read image file"));
    reader.readAsDataURL(file);
  });
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
  const [selectedAvatar, setSelectedAvatar] = useState(currentUrl);
  const [uploadError, setUploadError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const PRESET_AVATARS = [
    "https://api.dicebear.com/7.x/bottts/svg?seed=SkillHero1",
    "https://api.dicebear.com/7.x/bottts/svg?seed=CodeNinja2",
    "https://api.dicebear.com/7.x/bottts/svg?seed=CyberStudent",
    "https://api.dicebear.com/7.x/bottts/svg?seed=CatalystDev",
    "https://api.dicebear.com/7.x/bottts/svg?seed=ByteCoder",
    "https://api.dicebear.com/7.x/bottts/svg?seed=AlgorithmPro",
  ];

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setUploadError("");
    setIsProcessing(true);
    try {
      const dataUri = await processImageFile(file);
      setSelectedAvatar(dataUri);
    } catch (err: any) {
      setUploadError(err.message || "Failed to process photo.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Photo Preview & Custom Upload */}
      <div className="flex flex-col items-center justify-center gap-3 pt-2">
        <div className="w-24 h-24 rounded-3xl bg-purple-50 dark:bg-purple-950/40 border-2 border-purple-500/30 overflow-hidden flex items-center justify-center shadow-lg relative group">
          {selectedAvatar ? (
            <img src={selectedAvatar} alt="Avatar preview" className="w-full h-full object-cover" />
          ) : (
            <User className="w-10 h-10 text-purple-400" />
          )}
          {isProcessing && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <RefreshCw className="w-6 h-6 text-white animate-spin" />
            </div>
          )}
        </div>

        <input
          type="file"
          ref={fileInputRef}
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileUpload(file);
          }}
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessing}
          className="px-4 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Camera className="w-4 h-4" />
          <span>Upload Custom Photo</span>
        </button>

        {uploadError && (
          <p className="text-xs text-rose-500 font-bold text-center">{uploadError}</p>
        )}
      </div>

      {/* Preset Avatars */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700 dark:text-neutral-300 block">
          Or Choose a Default Avatar:
        </label>
        <div className="grid grid-cols-6 gap-2">
          {PRESET_AVATARS.map((url, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setSelectedAvatar(url)}
              className={`p-1.5 rounded-2xl border transition-all cursor-pointer ${
                selectedAvatar === url
                  ? "border-[#7C3AED] bg-purple-50 dark:bg-purple-950/40 scale-105 shadow-sm"
                  : "border-slate-200 dark:border-neutral-800 hover:border-purple-300"
              }`}
            >
              <img src={url} alt={`Preset ${i}`} className="w-10 h-10 rounded-xl" />
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-neutral-800">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => onSave(selectedAvatar)}
          className="px-5 py-2 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
        >
          Save Photo
        </button>
      </div>
    </div>
  );
}
