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
  ChevronLeft,
  ChevronRight,
  User,
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
  type ModalType =
    | "edit_profile"
    | "personal"
    | "skill"
    | "experience"
    | "education"
    | "project"
    | "cert"
    | "achievement"
    | "avatar"
    | "resume_preview"
    | null;
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [modalError, setModalError] = useState("");

  // ── Unified Edit Profile Tab State ─────────────────────────────────────────
  type EditProfileTab = "personal" | "experience" | "projects" | "skills" | "education" | "languages";
  const [editProfileTab, setEditProfileTab] = useState<EditProfileTab>("personal");
  const [editProfileItemView, setEditProfileItemView] = useState<"list" | "form">("list");
  const [editProfileSubItem, setEditProfileSubItem] = useState<any>(null);
  const [personalSavedToast, setPersonalSavedToast] = useState(false);
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillCategory, setNewSkillCategory] = useState("Programming / scripting Languages");
  const [newSkillProficiency, setNewSkillProficiency] = useState("Intermediate");
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [newLangTabInput, setNewLangTabInput] = useState("");

  // ── Interactive UI States ─────────────────────────────────────────────────
  const [showVerifyBanner, setShowVerifyBanner] = useState(true);
  const [weekOffset, setWeekOffset] = useState(0);
  const [languages, setLanguages] = useState<string[]>(["English"]);
  const [newLangInput, setNewLangInput] = useState("");
  const [showAddLang, setShowAddLang] = useState(false);

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

  const handleUpdateLanguages = (newLangs: string[]) => {
    setLanguages(newLangs);
    try {
      localStorage.setItem("sc_profile_languages", JSON.stringify(newLangs));
    } catch {}
  };

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
  const handleSavePersonal = async (e?: React.FormEvent, customData?: UserProfile) => {
    if (e) e.preventDefault();
    setSavingPersonal(true);
    setPersonalMsg("");

    const dataToSave = customData || personalForm;
    const res = await savePersonalProfile(dataToSave);
    if (res.success) {
      setPersonalMsg("Personal information updated successfully!");
      setProfileData((prev) => ({
        ...prev,
        personal: { ...(prev.personal || {}), ...dataToSave },
      }));
      setPersonalForm(dataToSave);
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["profile"] });
    } else {
      setPersonalMsg(res.error || "Failed to update profile. Database write error.");
    }
    setSavingPersonal(false);
    setTimeout(() => setPersonalMsg(""), 4000);
    return res;
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

  // ── Helper Utilities ──────────────────────────────────────────────────────
  const getInitials = (name: string) => {
    if (!name) return "PG";
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

  const getWeekDays = (offset = 0) => {
    const now = new Date();
    const base = new Date(now.getTime() + offset * 7 * 24 * 60 * 60 * 1000);
    const dayOfWeek = base.getDay(); // 0 is Sunday
    const sunday = new Date(base);
    sunday.setDate(base.getDate() - dayOfWeek);

    const days = [];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];

    for (let i = 0; i < 7; i++) {
      const d = new Date(sunday);
      d.setDate(sunday.getDate() + i);
      const isToday = offset === 0 && d.toDateString() === now.toDateString();
      const isActive = isToday || (offset === 0 && i === 1);
      days.push({
        dateNum: d.getDate(),
        dayName: dayNames[i],
        monthName: monthNames[d.getMonth()],
        isToday,
        active: isActive,
        duration: isToday ? "25m" : i === 1 ? "10m" : "",
      });
    }

    const startStr = `${days[0].dateNum} ${days[0].monthName}`;
    const endStr = `${days[6].dateNum} ${days[6].monthName}`;

    return { days, rangeLabel: `${startStr} – ${endStr}` };
  };

  const weekData = getWeekDays(weekOffset);
  const displayName = personalForm.full_name || session?.name || (session?.email ? session.email.split("@")[0] : "Palamoor Adithya Goud");
  const userHandle = session?.email ? session.email.split("@")[0] : "aadhi00";

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
      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 1. TOP BENTO GRID: 3 MINI CARDS LEFT (col-span-5) & PROFILE RIGHT (col-span-7) */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-12 gap-2 sm:gap-3.5 items-stretch">
        {/* Left Column: 3 Mini Cards (Resume, Courses, Projects) */}
        <div className="col-span-5 flex flex-col gap-1.5 sm:gap-3 justify-between">
          {/* Card 1: Resume */}
          <div
            onClick={() => {
              if (profileData.resume?.filename || resumePreviewUrl) {
                setActiveModal("resume_preview");
              } else {
                fileInputRef.current?.click();
              }
            }}
            className="flex-1 bg-white rounded-2xl sm:rounded-3xl p-2 sm:p-4 lg:p-5 border border-slate-200/80 hover:border-purple-300 hover:shadow-xs transition-all flex items-center justify-between gap-1.5 cursor-pointer group"
          >
            <div className="min-w-0 flex-1">
              <h3 className="text-xs sm:text-base font-black text-slate-900 truncate">Resume</h3>
              {profileData.resume?.filename || resumePreviewUrl ? (
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] sm:text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-0.5">
                    <Eye className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    Preview
                  </span>
                  <span className="text-[9px] text-slate-300">•</span>
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="text-[9px] sm:text-xs font-semibold text-slate-400 hover:text-slate-700"
                    title="Upload replacement resume"
                  >
                    Update
                  </span>
                </div>
              ) : (
                <p className="text-[9px] sm:text-xs font-semibold text-slate-400 mt-0.5 truncate">
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

          {/* Card 2: Courses */}
          <Link
            href="/roadmaps"
            className="flex-1 bg-white rounded-2xl sm:rounded-3xl p-2 sm:p-4 lg:p-5 border border-slate-200/80 hover:border-purple-300 hover:shadow-xs transition-all flex items-center justify-between gap-1.5 group"
          >
            <div className="min-w-0 flex-1">
              <h3 className="text-xs sm:text-base font-black text-slate-900 truncate">Courses</h3>
              <p className="text-[9px] sm:text-xs font-semibold text-slate-400 mt-0.5 truncate">Explore paths</p>
            </div>
            <img
              src="/images/profile/courses_3d.jpg"
              alt="Courses"
              className="w-7 h-7 sm:w-14 sm:h-14 lg:w-16 lg:h-16 object-contain rounded-lg sm:rounded-2xl group-hover:scale-105 transition-transform shrink-0"
            />
          </Link>

          {/* Card 3: Projects */}
          <a
            href="#proof-of-work"
            className="flex-1 bg-white rounded-2xl sm:rounded-3xl p-2 sm:p-4 lg:p-5 border border-slate-200/80 hover:border-purple-300 hover:shadow-xs transition-all flex items-center justify-between gap-1.5 group"
          >
            <div className="min-w-0 flex-1">
              <h3 className="text-xs sm:text-base font-black text-slate-900 truncate">Projects</h3>
              <p className="text-xs sm:text-lg font-black text-slate-900 mt-0.5 truncate">
                {profileData.projects.length || 1}
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
        <div className="col-span-7 bg-gradient-to-br from-[#1E084E] via-[#3B0E7E] to-[#6A1EB0] rounded-2xl sm:rounded-3xl p-3 sm:p-6 lg:p-7 text-white shadow-md border border-purple-400/20 relative overflow-hidden flex flex-col justify-between min-h-[210px] sm:min-h-[290px] group">
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-16 -right-16 w-56 h-56 bg-purple-400/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-violet-400/20 rounded-full blur-3xl pointer-events-none" />

          {/* Center Monogram Initials */}
          <div
            className="flex-1 flex items-center justify-center my-auto py-2 sm:py-5 relative z-10 cursor-pointer"
            onClick={() => setActiveModal("avatar")}
            title="Change photo or avatar"
          >
            {personalForm.avatar_url ? (
              <img
                src={personalForm.avatar_url}
                alt={displayName}
                className="w-16 h-16 sm:w-28 sm:h-28 lg:w-32 lg:h-32 object-cover rounded-2xl sm:rounded-3xl border-2 border-purple-300/40 shadow-lg"
              />
            ) : (
              <span className="text-5xl sm:text-8xl lg:text-9xl font-black text-white/95 tracking-tight select-none drop-shadow-sm transition-transform duration-300 group-hover:scale-105">
                {getInitials(displayName)}
              </span>
            )}
          </div>

          {/* Bottom Profile Details */}
          <div className="relative z-10 space-y-0.5">
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
        {/* Left Pill: Exactly under Left Cards (Resume/Courses/Projects) */}
        <div className="col-span-5 bg-white rounded-2xl sm:rounded-full border border-slate-200/80 px-2 sm:px-4 lg:px-6 py-2.5 sm:py-3.5 flex items-center justify-center gap-2 sm:gap-4 shadow-xs">
          <div className="text-[11px] sm:text-sm font-semibold text-slate-600 truncate">
            <span className="font-black text-slate-900">0</span> Following
          </div>
          <div className="w-px h-3 sm:h-4 bg-slate-200 shrink-0" />
          <div className="text-[11px] sm:text-sm font-semibold text-slate-600 truncate">
            <span className="font-black text-slate-900">0</span> Followers
          </div>
        </div>

        <Link
          href="/settings/edit"
          className="col-span-7 bg-white rounded-2xl sm:rounded-full border border-slate-200/80 hover:border-purple-300 hover:bg-purple-50/40 px-2 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-center gap-1.5 sm:gap-2 text-[11px] sm:text-sm font-bold text-slate-800 transition-all shadow-xs cursor-pointer"
        >
          <Edit3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-600 shrink-0" />
          <span className="truncate">Edit Profile</span>
        </Link>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 3. VERIFICATION BANNER (PURPLE/VIOLET GRADIENT)                     */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showVerifyBanner && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gradient-to-r from-[#8B5CF6] via-[#9333EA] to-[#A855F7] rounded-3xl p-5 sm:p-6 text-white shadow-sm relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shrink-0 mt-0.5 sm:mt-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-black text-white">Get Verified on SkillsCatalyst</h4>
                <p className="text-xs text-purple-100/90 font-normal leading-relaxed max-w-xl">
                  Upload your student ID or certificate to earn your verified badge and unlock perks.
                </p>
                <div className="pt-1">
                  <button
                    onClick={() => {
                      setEditingItem(null);
                      setActiveModal("cert");
                    }}
                    className="px-4 py-1.5 bg-white hover:bg-purple-50 text-purple-700 rounded-full font-black text-xs transition-all inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <span>Verify Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowVerifyBanner(false)}
              className="absolute top-3.5 right-3.5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 4. "YOUR WEEKLY VIBE" ACTIVITY CARD                                 */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">Your weekly vibe</h3>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">{weekData.rangeLabel}</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200/60 px-3 py-1.5 rounded-full shadow-2xs">
              <span>🔥 {progressStats.streakDays}d Streak</span>
              <span>•</span>
              <span>Lvl {progressStats.level}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setWeekOffset((prev) => prev - 1)}
                className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:border-slate-300 transition-colors cursor-pointer"
                title="Previous week"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setWeekOffset((prev) => prev + 1)}
                className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:border-slate-300 transition-colors cursor-pointer"
                title="Next week"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 7 Vertical Pill Bars */}
        <div className="flex items-end justify-between gap-2 sm:gap-4 pt-4 px-2 sm:px-6">
          {weekData.days.map((d, i) => (
            <div key={i} className="flex flex-col items-center gap-2 flex-1">
              <div className="relative w-full flex flex-col items-center">
                {d.duration && (
                  <span className="absolute -top-6 text-[11px] font-bold text-slate-700 whitespace-nowrap">
                    {d.duration}
                  </span>
                )}
                <div className="h-28 sm:h-32 w-7 sm:w-10 rounded-full bg-slate-100 flex flex-col justify-end p-1">
                  {d.active && (
                    <div className="w-full h-3/4 rounded-full bg-gradient-to-t from-[#FB923C] to-[#F97316] shadow-sm" />
                  )}
                </div>
              </div>
              <div className="text-center">
                <span className={`block text-xs font-bold ${d.active ? "text-slate-900" : "text-slate-400"}`}>
                  {d.dateNum}
                </span>
                <span className={`block text-[10px] font-semibold uppercase ${d.active ? "text-slate-900" : "text-slate-400"}`}>
                  {d.dayName}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 5. EXPERIENCE CARD                                                  */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div id="experience" className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">Experience</h3>
        </div>

        {profileData.experiences.length === 0 ? (
          <div className="py-8 text-center text-sm font-medium text-slate-400">
            No experience added yet.
          </div>
        ) : (
          <div className="space-y-3 pt-1">
            {profileData.experiences.map((exp) => (
              <div key={exp.id} className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70 space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-black text-slate-900">{exp.role || (exp as any).job_title}</h4>
                    <p className="text-xs font-semibold text-purple-700">{exp.company_name}</p>
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

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 6. PROOF OF WORK CARD                                               */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div id="proof-of-work" className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">Proof of Work</h3>
        </div>

        {profileData.projects.length === 0 ? (
          <div className="py-8 text-center text-sm font-medium text-slate-400">
            Add links to your work and projects
          </div>
        ) : (
          <div className="space-y-3 pt-1">
            {profileData.projects.map((proj) => (
              <div key={proj.id} className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-xs font-black text-slate-900">{proj.project_name || (proj as any).title}</h4>
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
                      className="text-purple-700 hover:underline flex items-center gap-1"
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

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 7. EXPERTISE & SKILLS CARD                                          */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div id="skills" className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">Expertise & Skills</h3>
        </div>

        {profileData.skills.length === 0 ? (
          <div className="py-8 text-center text-sm font-medium text-slate-400">
            No skills added yet. Add your programming languages, tools, and frameworks.
          </div>
        ) : (
          <div className="space-y-4 pt-1">
            {SKILL_CATEGORIES.map((cat) => {
              const matchedSkills = profileData.skills.filter(cat.filter);
              if (matchedSkills.length === 0) return null;

              return (
                <div key={cat.id} className="space-y-2">
                  <div className="text-xs font-semibold text-indigo-500/90 flex items-center gap-1.5">
                    <span className="text-indigo-400">—</span>
                    <span>{cat.label}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {matchedSkills.map((s) => (
                      <div
                        key={s.id || s.skill_name}
                        className="px-3.5 py-2 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center gap-2"
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
                        <span className="text-xs font-bold text-slate-800">{s.skill_name}</span>
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
      {/* 8. LANGUAGES CARD                                                   */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">Languages</h3>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {languages.map((lang) => (
            <span
              key={lang}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-xs font-semibold text-indigo-700"
            >
              <Languages className="w-3.5 h-3.5 text-indigo-500" />
              <span>{lang}</span>
            </span>
          ))}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 9. EDUCATION CARD                                                   */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div id="education" className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">Education</h3>
        </div>

        {profileData.education.length === 0 ? (
          <div className="py-8 text-center text-sm font-medium text-slate-400">
            No education added yet. Add your university or college details.
          </div>
        ) : (
          <div className="space-y-4 pt-1">
            {profileData.education.map((edu) => (
              <div key={edu.id} className="flex items-start gap-3.5">
                {/* Square Orange Initial Badge (matching VC in screenshot) */}
                <div className="w-12 h-12 rounded-2xl bg-[#F97316] text-white font-black text-base flex items-center justify-center shrink-0 shadow-xs">
                  {getOrgInitials(edu.college || (edu as any).institution || "VC")}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-bold text-slate-900 truncate">
                      {edu.college || (edu as any).institution}
                    </h4>
                  </div>

                  <p className="text-xs text-slate-600 font-medium mt-0.5">
                    {edu.degree_type || (edu as any).degree}
                    {edu.field_of_study ? ` • ${edu.field_of_study}` : ""}
                  </p>

                  <p className="text-xs text-slate-400 font-normal mt-0.5">
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
      {/* 10. CAREER PREFERENCES CARD (Presentation View - Edit in /settings/edit) */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div id="preferences" className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-rose-50 text-rose-700">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">Career Preferences</h3>
              <p className="text-xs text-slate-500 font-medium">Desired job roles, dream companies, and arrangements</p>
            </div>
          </div>
          <Link
            href="/settings/edit?tab=career"
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50 text-slate-700 hover:text-purple-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Edit3 className="w-3.5 h-3.5 text-purple-600" />
            <span>Edit Preferences</span>
          </Link>
        </div>

        {/* Roles */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block">
            Target Job Roles
          </label>
          {(careerPrefsForm.target_roles || []).length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {careerPrefsForm.target_roles?.map((r, i) => (
                <span
                  key={i}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-bold shadow-2xs"
                >
                  {r}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 font-medium italic">
              No target roles specified yet. Click &apos;Edit Preferences&apos; to configure your career goals.
            </p>
          )}
        </div>

        {/* Dream Companies */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block">
            Dream Companies
          </label>
          {(careerPrefsForm.target_companies || []).length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {careerPrefsForm.target_companies?.map((c, i) => (
                <span
                  key={i}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-xs font-bold shadow-2xs"
                >
                  {c}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 font-medium italic">
              No dream companies specified yet. Click &apos;Edit Preferences&apos; to add companies.
            </p>
          )}
        </div>

        {/* Work Arrangements */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block">
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
                      : "bg-slate-100 text-slate-400 opacity-60"
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
      {/* 11. DEVELOPER PLATFORMS CARD (Presentation View - Edit in /settings/edit) */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div id="developer" className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-purple-50 text-purple-700">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Developer & Coding Profiles
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Connected accounts across competitive programming and developer platforms
              </p>
            </div>
          </div>
          <Link
            href="/settings/edit?tab=coding"
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50 text-slate-700 hover:text-purple-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Edit3 className="w-3.5 h-3.5 text-purple-600" />
            <span>Edit Profiles</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { key: "leetcode", title: "LeetCode", logo: "/images/coding/leetcode.png", logoClass: "h-5 w-auto max-w-[24px] object-contain", showTitle: true, val: leetcodeInput, stat: codingStats.leetcode },
            { key: "github", title: "GitHub", logo: "/images/coding/github.png", logoClass: "h-5 w-auto max-w-[80px] object-contain", showTitle: false, val: githubInput, stat: codingStats.github },
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
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 transition-all space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-h-[26px]">
                    <img
                      src={item.logo}
                      alt={item.title}
                      className={item.logoClass}
                    />
                    {item.showTitle && (
                      <span className="text-xs font-black text-slate-900">{item.title}</span>
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                      isConnected
                        ? "bg-purple-100 text-purple-800 border border-purple-200"
                        : "bg-slate-100 text-slate-400 border border-slate-200/60"
                    }`}
                  >
                    {isConnected ? "Connected" : "Not Connected"}
                  </span>
                </div>

                {isConnected ? (
                  <div className="space-y-1">
                    <div className="text-xs">
                      <span className="font-mono font-bold text-slate-800 truncate block">
                        {displayHandle || item.val}
                      </span>
                    </div>
                    {item.stat && item.stat.summary && (
                      <p className="text-[11px] font-medium text-purple-700 truncate">
                        {item.stat.summary}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-[11px] font-medium text-slate-400">
                    Not connected
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 13. EARNED MILESTONES & BADGES CARD                                 */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-purple-50 text-purple-700">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Earned Milestones & Badges
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {progressStats.badgesCount} of {progressStats.badges.length} Badges Unlocked
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="px-4 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 pt-2">
          {progressStats.badges.map((b) => (
            <div
              key={b.id}
              className={`p-3 rounded-2xl border flex flex-col items-center text-center transition-all ${
                b.unlocked
                  ? "bg-purple-50/70 border-purple-200 ring-1 ring-purple-300"
                  : "bg-slate-50/50 border-slate-200 opacity-60"
              }`}
            >
              <div className="text-xl mb-1">{b.icon}</div>
              <span className="text-[10px] font-bold text-slate-900 line-clamp-1">{b.name}</span>
              <span className={`text-[8px] font-bold mt-1.5 px-1.5 py-0.5 rounded ${b.unlocked ? "bg-purple-600 text-white" : "bg-slate-200 text-slate-600"}`}>
                {b.unlocked ? "Earned" : "Locked"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 14. CUSTOMER SERVICE & LEGAL POLICIES                               */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-700">
              <LifeBuoy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Customer Service & Founder Support</h3>
              <p className="text-xs text-slate-500 font-medium">Direct founder contact and student policies</p>
            </div>
          </div>
          <Link
            href="/support"
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#4A1584] to-[#7E22CE] text-white text-xs font-bold"
          >
            Support Desk ➔
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Founder</span>
            <span className="font-bold text-slate-900">Palamoor Adithya Goud</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Phone / WhatsApp</span>
            <a href="tel:+917330602101" className="font-bold text-purple-700 hover:underline">
              +91 7330602101
            </a>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs truncate">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Email</span>
            <a href="mailto:palamooradithyagoud@gmail.com" className="font-bold text-purple-700 hover:underline truncate">
              palamooradithyagoud@gmail.com
            </a>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 12. INTERACTIVE MODALS                                               */}
      {/* ─────────────────────────────────────────────────────────────────── */}

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

      {/* MODAL: RESUME DOCUMENT PREVIEW */}
      <AnimatePresence>
        {activeModal === "resume_preview" && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-100 flex flex-col max-h-[92vh] overflow-hidden my-auto"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-5 sm:px-7 py-4 border-b border-slate-100 bg-slate-50/70">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-black text-xs shrink-0 shadow-2xs">
                    PDF
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
                      <span className="truncate max-w-[200px] sm:max-w-xs">
                        {profileData.resume?.filename || "Resume Document"}
                      </span>
                      {(profileData.resume?.ats_score || profileData.resume?.overall_score) && (
                        <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200 shrink-0">
                          {profileData.resume.ats_score || profileData.resume.overall_score}/100 ATS
                        </span>
                      )}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-slate-400 font-medium">
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
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5"
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
                    className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    title="Upload replacement resume"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Replace PDF</span>
                  </button>
                  <button
                    onClick={() => setActiveModal(null)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-hidden p-3 sm:p-5 bg-slate-100/60 flex flex-col items-center justify-center min-h-[420px] sm:min-h-[580px]">
                {resumePreviewUrl ? (
                  <iframe
                    src={resumePreviewUrl}
                    title="Uploaded Resume Preview"
                    className="w-full h-[58vh] sm:h-[68vh] rounded-2xl border border-slate-200 bg-white shadow-xs"
                  />
                ) : (
                  <div className="max-w-md text-center space-y-4 p-8 bg-white rounded-3xl border border-slate-200 shadow-xs my-auto">
                    <div className="w-16 h-16 rounded-3xl bg-purple-50 text-purple-700 flex items-center justify-center mx-auto shadow-xs">
                      <FileText className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="text-base font-black text-slate-900">
                        {profileData.resume?.filename || "Resume on file"}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        Your resume has been saved and reviewed by AI with an ATS readiness score of{" "}
                        <strong className="text-purple-700">
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
                        className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all flex items-center justify-center gap-1.5"
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
  const [category, setCategory] = useState("Programming / scripting Languages");
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
          placeholder="e.g. Python, Docker, Next.js, PostgreSQL"
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
            className="w-full bg-white border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-900 rounded-xl focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 outline-none cursor-pointer"
          >
            <option value="Programming / scripting Languages">Programming / scripting Languages</option>
            <option value="Cloud & Devops">Cloud & Devops</option>
            <option value="Databases">Databases</option>
            <option value="Frameworks">Frameworks</option>
            <option value="Technologies">Technologies</option>
            <option value="Tools & Platforms">Tools & Platforms</option>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
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
            className="w-full bg-white border border-slate-200 px-3 py-2 text-xs font-semibold rounded-xl outline-none cursor-pointer"
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
            className="w-full bg-white border border-slate-200 px-3 py-2 text-xs font-semibold rounded-xl outline-none cursor-pointer"
          >
            <option value="Remote">Remote</option>
            <option value="Hybrid">Hybrid</option>
            <option value="Onsite">Onsite</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
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

// ── HELPER: PROCESS & OPTIMIZE UPLOADED IMAGE ────────────────────────────────
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

function AvatarModalForm({
  currentUrl,
  onSave,
  onClose,
}: {
  currentUrl: string;
  onSave: (url: string) => void;
  onClose: () => void;
}) {
  const [preview, setPreview] = useState(currentUrl);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (file: File) => {
    if (!file) return;
    setError("");
    setProcessing(true);
    try {
      const dataUrl = await processImageFile(file);
      setPreview(dataUrl);
    } catch (err: any) {
      setError(err?.message || "Failed to process image.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
          {error}
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.[0]) handleFileChange(e.target.files[0]);
        }}
      />

      {/* Upload & Preview Dropzone */}
      <div
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-slate-200 hover:border-purple-400 rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center gap-3.5 bg-slate-50/60 hover:bg-purple-50/30 transition-all cursor-pointer group"
      >
        {preview ? (
          <div className="relative group/avatar">
            <img
              src={preview}
              alt="Avatar Preview"
              className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover border-2 border-purple-300 shadow-md transition-transform group-hover/avatar:scale-105"
            />
            <div className="absolute inset-0 rounded-3xl bg-slate-900/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1.5">
              <Camera className="w-4 h-4" />
              <span>Change</span>
            </div>
          </div>
        ) : (
          <div className="w-20 h-20 rounded-3xl bg-purple-100 text-purple-700 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
            <Camera className="w-8 h-8" />
          </div>
        )}

        <div className="text-center space-y-1">
          <p className="text-xs sm:text-sm font-bold text-slate-800">
            {processing
              ? "Optimizing photo..."
              : preview
              ? "Click to choose a different photo"
              : "Click or tap to upload profile photo"}
          </p>
          <p className="text-[11px] text-slate-400 font-medium">
            Upload any image (PNG, JPG, WebP) directly from your device
          </p>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            inputRef.current?.click();
          }}
          disabled={processing}
          className="px-4 py-2 rounded-xl bg-white border border-slate-200 shadow-2xs hover:border-purple-300 hover:bg-purple-50 text-slate-700 hover:text-purple-700 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer mt-1"
        >
          <UploadCloud className="w-3.5 h-3.5" />
          <span>Select Photo from Device</span>
        </button>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={() => {
            setPreview("");
            onSave("");
          }}
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
            disabled={processing}
            onClick={() => onSave(preview.trim())}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#4A1584] via-[#6320B5] to-[#7E22CE] hover:from-[#3c106d] hover:via-[#521996] hover:to-[#6b1cb1] text-white text-xs font-bold shadow-sm shadow-purple-900/20 cursor-pointer disabled:opacity-50"
          >
            Save Photo
          </button>
        </div>
      </div>
    </div>
  );
}

function PersonalModalForm({
  initialData,
  onSave,
  onClose,
}: {
  initialData: UserProfile;
  onSave: (data: UserProfile) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState<UserProfile>({ ...initialData });
  const [saving, setSaving] = useState(false);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setSaving(true);
        await onSave(form);
        setSaving(false);
      }}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] font-black text-slate-600 uppercase tracking-wider block mb-1">
            Full Legal Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={form.full_name || ""}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            placeholder="e.g. Palamoor Adithya Goud"
            className="w-full bg-white border border-slate-200 px-3.5 py-2.5 text-xs font-semibold rounded-xl outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20"
          />
        </div>
        <div>
          <label className="text-[11px] font-black text-slate-600 uppercase tracking-wider block mb-1">
            Headline / Role
          </label>
          <input
            type="text"
            value={form.headline || ""}
            onChange={(e) => setForm({ ...form, headline: e.target.value })}
            placeholder="e.g. Student / Full Stack Developer"
            className="w-full bg-white border border-slate-200 px-3.5 py-2.5 text-xs font-semibold rounded-xl outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
        <div>
          <label className="text-[11px] font-black text-slate-600 uppercase tracking-wider block mb-1">
            City
          </label>
          <input
            type="text"
            value={form.city || ""}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            placeholder="e.g. Hyderabad"
            className="w-full bg-white border border-slate-200 px-3 py-2 text-xs font-semibold rounded-xl outline-none focus:border-purple-600"
          />
        </div>
        <div>
          <label className="text-[11px] font-black text-slate-600 uppercase tracking-wider block mb-1">
            State
          </label>
          <input
            type="text"
            value={form.state || ""}
            onChange={(e) => setForm({ ...form, state: e.target.value })}
            placeholder="e.g. Telangana"
            className="w-full bg-white border border-slate-200 px-3 py-2 text-xs font-semibold rounded-xl outline-none focus:border-purple-600"
          />
        </div>
        <div>
          <label className="text-[11px] font-black text-slate-600 uppercase tracking-wider block mb-1">
            Country
          </label>
          <input
            type="text"
            value={form.country || "India"}
            onChange={(e) => setForm({ ...form, country: e.target.value })}
            placeholder="e.g. India"
            className="w-full bg-white border border-slate-200 px-3 py-2 text-xs font-semibold rounded-xl outline-none focus:border-purple-600"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
        <div>
          <label className="text-[11px] font-black text-slate-600 uppercase tracking-wider block mb-1">
            Phone Number (Private)
          </label>
          <input
            type="tel"
            value={form.phone || ""}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="e.g. +91 9876543210"
            className="w-full bg-white border border-slate-200 px-3 py-2 text-xs font-semibold rounded-xl outline-none focus:border-purple-600"
          />
        </div>
        <div>
          <label className="text-[11px] font-black text-slate-600 uppercase tracking-wider block mb-1">
            Gender
          </label>
          <select
            value={form.gender || "Prefer not to say"}
            onChange={(e) => setForm({ ...form, gender: e.target.value })}
            className="w-full bg-white border border-slate-200 px-3 py-2 text-xs font-semibold rounded-xl outline-none focus:border-purple-600 cursor-pointer"
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
        <label className="text-[11px] font-black text-slate-600 uppercase tracking-wider block mb-1">
          About / Bio
        </label>
        <textarea
          rows={3}
          value={form.about || ""}
          onChange={(e) => setForm({ ...form, about: e.target.value })}
          placeholder="Brief summary about your skills, passions, and background..."
          className="w-full bg-white border border-slate-200 p-3 text-xs font-medium rounded-xl outline-none focus:border-purple-600 resize-none"
        />
      </div>

      {/* Direct Image File Upload instead of URL input */}
      <div>
        <label className="text-[11px] font-black text-slate-600 uppercase tracking-wider block mb-1.5">
          Profile Photo
        </label>
        <div className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-3.5 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
          {form.avatar_url ? (
            <img
              src={form.avatar_url}
              alt="Avatar preview"
              className="w-14 h-14 rounded-2xl object-cover border-2 border-purple-300 shrink-0 shadow-xs"
            />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-black text-sm shrink-0">
              {form.full_name ? form.full_name.slice(0, 2).toUpperCase() : "SC"}
            </div>
          )}

          <div className="flex-1 min-w-0 space-y-1.5">
            <p className="text-xs font-bold text-slate-800 truncate">
              {form.avatar_url ? "Custom photo uploaded" : "Default initials monogram"}
            </p>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <label className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-purple-300 hover:bg-purple-50 text-slate-700 hover:text-purple-700 text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-2xs">
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Upload Image</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="hidden"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      try {
                        const dataUrl = await processImageFile(f);
                        setForm((prev) => ({ ...prev, avatar_url: dataUrl }));
                      } catch {}
                    }
                  }}
                />
              </label>
              {form.avatar_url && (
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, avatar_url: "" }))}
                  className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-3 border-t border-slate-100">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer text-center"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#4A1584] via-[#6320B5] to-[#7E22CE] hover:from-[#3c106d] hover:via-[#521996] hover:to-[#6b1cb1] text-white text-xs font-bold shadow-sm shadow-purple-900/20 cursor-pointer disabled:opacity-50 text-center"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
