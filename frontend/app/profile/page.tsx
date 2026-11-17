"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  GraduationCap,
  Download,
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
  Compass,
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
  Settings,
  Zap,
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

function VerifiedBadge({ className = "w-5 h-5 sm:w-5.5 sm:h-5.5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10.29 2.308a2.3 2.3 0 0 1 3.42 0l.707.785a2.3 2.3 0 0 0 1.942.748l1.045-.145a2.3 2.3 0 0 1 2.57 2.227l.034 1.055a2.3 2.3 0 0 0 1.258 1.83l.942.476a2.3 2.3 0 0 1 1.06 3.197l-.547.903a2.3 2.3 0 0 0-.001 2.228l.547.903a2.3 2.3 0 0 1-1.06 3.197l-.942.476a2.3 2.3 0 0 0-1.258 1.83l-.034 1.055a2.3 2.3 0 0 1-2.57 2.227l-1.045-.145a2.3 2.3 0 0 0-1.942.748l-.707.785a2.3 2.3 0 0 1-3.42 0l-.707-.785a2.3 2.3 0 0 0-1.942-.748l-1.045.145a2.3 2.3 0 0 1-2.57-2.227l-.034-1.055a2.3 2.3 0 0 0-1.258-1.83l-.942-.476a2.3 2.3 0 0 1-1.06-3.197l.547-.903a2.3 2.3 0 0 0 .001-2.228l-.547-.903a2.3 2.3 0 0 1 1.06-3.197l.942-.476a2.3 2.3 0 0 0 1.258-1.83l.034-1.055a2.3 2.3 0 0 1 2.57-2.227l1.045.145a2.3 2.3 0 0 0 1.942-.748l.707-.785z"
        fill="#D5FF38"
      />
      <path
        d="M8.5 12.2l2.3 2.3 4.7-4.8"
        stroke="#10110E"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ProfilePage() {
  const { session, logout } = useAuth();
  const userId = session?.user_id;
  const qc = useQueryClient();

  // Active action button state (filled only after user clicks on it; no glow)
  const [activeActionBtn, setActiveActionBtn] = useState<"resume" | "projects" | "edit" | null>(null);


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
    username: "",
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

  // ── Download Resume Function ─────────────────────────────────────────────
  const handleDownloadResume = () => {
    if (resumePreviewUrl) {
      const a = document.createElement("a");
      a.href = resumePreviewUrl;
      a.download = profileData.resume?.filename || "PALAMOOR_ADITHYA_GOUD_Resume.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }
    const printContent = document.getElementById("printable-resume-sheet");
    if (!printContent) {
      window.print();
      return;
    }
    const printWindow = window.open("", "_blank", "width=850,height=1100");
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>PALAMOOR_ADITHYA_GOUD_Resume</title>
            <meta charset="utf-8" />
            <style>
              @page { size: A4; margin: 12mm 15mm; }
              body {
                font-family: 'Times New Roman', Times, Georgia, serif;
                color: #000;
                margin: 0;
                padding: 10px;
                background: #fff;
                line-height: 1.3;
                font-size: 10pt;
              }
              * { box-sizing: border-box; }
              a { color: #000; text-decoration: underline; }
              h1 { font-size: 18pt; text-align: center; margin: 0 0 2px 0; text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px; }
              .text-center { text-align: center; }
              .flex { display: flex; }
              .justify-between { justify-content: space-between; }
              .items-baseline { align-items: baseline; }
              .font-bold { font-weight: bold; }
              .italic { font-style: italic; }
              .underline { text-decoration: underline; }
              ul { margin: 2px 0 4px 18px; padding: 0; }
              li { margin-bottom: 2px; }
              .section-title {
                font-weight: bold;
                font-size: 10pt;
                text-transform: uppercase;
                border-bottom: 1px solid #000;
                padding-bottom: 2px;
                margin-top: 8px;
                margin-bottom: 4px;
                letter-spacing: 0.5px;
              }
            </style>
          </head>
          <body>
            ${printContent.innerHTML}
            <script>
              window.onload = function() {
                window.print();
                setTimeout(function() { window.close(); }, 600);
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    } else {
      window.print();
    }
  };

  // ── Modals State ──────────────────────────────────────────────────────────
  type ModalType = "avatar" | "resume_preview" | null;
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [modalError, setModalError] = useState("");

  // ── Client Mount & Body Bar Suppression ─────────────────────────────────
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (activeModal === "resume_preview") {
      document.body.setAttribute("data-hide-bottombar", "true");
      document.body.setAttribute("data-hide-appbars", "true");
      document.body.style.overflow = "hidden";
    } else {
      document.body.removeAttribute("data-hide-bottombar");
      document.body.removeAttribute("data-hide-appbars");
      document.body.style.overflow = "";
    }
    return () => {
      document.body.removeAttribute("data-hide-bottombar");
      document.body.removeAttribute("data-hide-appbars");
      document.body.style.overflow = "";
    };
  }, [activeModal]);

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
            username: full.personal.username || "",
            headline: full.personal.headline || "",
            country: full.personal.country || "India",
            state: full.personal.state || "",
            city: full.personal.city || "",
            phone: full.personal.phone || "",
            gender: full.personal.gender || "Prefer not to say",
            about: full.personal.about || "",
            avatar_url: full.personal.avatar_url || "",
            college: full.personal.college || full.academic?.college || "",
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
  const userHandle = personalForm.username ? `@${personalForm.username}` : "";
  const favGoal =
    careerPrefsForm.target_roles?.[0] ||
    personalForm.headline ||
    profileData.career_preferences?.target_roles?.[0] ||
    profileData.academic?.target_role ||
    "DevOps";

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
      {/* 1. TOP HEADER & PROFILE HERO (MATCHES IMAGE 2)                      */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="pt-2 sm:pt-4 pb-2 space-y-6">
        {/* Top Header Row: "My profile" | Streak pill & Settings */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            My profile
          </h1>

          <div className="flex items-center gap-2.5">
            {/* Streak Counter Pill */}
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#18191E] border border-white/10 text-white shadow-xs">
              <Flame className="w-4 h-4 text-white stroke-[2]" />
              <span className="text-sm font-bold tracking-tight">
                {progressStats.streakDays || 5}
              </span>
            </div>

            {/* Settings Gear Button */}
            <Link
              href="/settings/edit"
              aria-label="Settings"
              title="Settings & Edit Profile"
              className="w-10 h-10 rounded-full bg-[#18191E] border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <Settings className="w-5 h-5 text-white stroke-[2]" />
            </Link>
          </div>
        </div>

        {/* Center Profile Hero: Large Circular Avatar, Name with Acid Lime Verified Badge, Followers */}
        <div className="flex flex-col items-center text-center">
          {/* Large Circular Avatar with Cyan Background */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => setActiveModal("avatar")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setActiveModal("avatar");
              }
            }}
            aria-label="Change photo or avatar"
            title="Click to change photo"
            className="relative group cursor-pointer focus:outline-none"
          >
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-[#38BDF8] border-2 border-white/15 shadow-2xl flex items-center justify-center relative transition-transform duration-200 group-hover:scale-105">
              {personalForm.avatar_url ? (
                <img
                  src={personalForm.avatar_url}
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-[#38BDF8] flex items-center justify-center">
                  <span className="text-3xl sm:text-4xl font-black text-white select-none">
                    {getInitials(displayName)}
                  </span>
                </div>
              )}
              {/* Camera overlay on hover */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-full transition-opacity duration-200">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* Name + Acid Lime Verified Badge */}
          <div className="mt-3.5 flex items-center justify-center gap-1.5 sm:gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {displayName}
            </h2>
            <VerifiedBadge className="w-5 h-5 sm:w-5.5 sm:h-5.5 shrink-0" />
          </div>

          {/* Followers · Following Subtitle */}
          <div className="mt-1 flex items-center justify-center gap-1.5 text-xs sm:text-sm font-semibold text-neutral-400">
            <span>0 followers</span>
            <span className="text-neutral-600 font-bold">·</span>
            <span>0 following</span>
          </div>
          {userHandle && (
            <div className="text-[11px] sm:text-xs font-semibold text-neutral-500 mt-0.5">
              {userHandle} {favGoal ? `· ${favGoal}` : ""}
            </div>
          )}
        </div>

        {/* Quick Action Buttons: Resume, Projects, Edit */}
        <div className="flex items-center justify-center gap-2.5 sm:gap-3.5 pt-2 pb-1 flex-wrap">
          {/* Resume Button */}
          <button
            type="button"
            aria-label="Resume"
            title="Resume (Preview / Upload)"
            onClick={() => {
              setActiveActionBtn("resume");
              setActiveModal("resume_preview");
            }}
            className={`flex items-center gap-2 px-6 py-2.5 sm:px-7 sm:py-2.5 rounded-full text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
              activeActionBtn === "resume"
                ? "bg-[#D5FF38] text-black border border-transparent shadow-none"
                : "bg-[#18191E] border border-white/10 text-white hover:border-[#D5FF38]/50 hover:text-[#D5FF38] shadow-xs active:scale-95"
            }`}
          >
            <FileText className={`w-4 h-4 stroke-[2.2] ${activeActionBtn === "resume" ? "text-black" : "text-white"}`} />
            <span>Resume</span>
          </button>

          {/* Projects Button */}
          <button
            type="button"
            onClick={() => {
              setActiveActionBtn("projects");
              const el = document.getElementById("proof-of-work");
              if (el) {
                el.scrollIntoView({ behavior: "smooth", block: "start" });
              }
            }}
            className={`flex items-center gap-2 px-6 py-2.5 sm:px-7 sm:py-2.5 rounded-full text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
              activeActionBtn === "projects"
                ? "bg-[#D5FF38] text-black border border-transparent shadow-none"
                : "bg-[#18191E] border border-white/10 text-white hover:border-[#D5FF38]/50 hover:text-[#D5FF38] shadow-xs active:scale-95"
            }`}
          >
            <Briefcase className={`w-4 h-4 stroke-[2.2] ${activeActionBtn === "projects" ? "text-black" : "text-white"}`} />
            <span>Projects</span>
          </button>

          {/* Edit Button */}
          <Link
            href="/settings/edit"
            onClick={() => setActiveActionBtn("edit")}
            className={`flex items-center gap-2 px-6 py-2.5 sm:px-7 sm:py-2.5 rounded-full text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
              activeActionBtn === "edit"
                ? "bg-[#D5FF38] text-black border border-transparent shadow-none"
                : "bg-[#18191E] border border-white/10 text-white hover:border-[#D5FF38]/50 hover:text-[#D5FF38] shadow-xs active:scale-95"
            }`}
          >
            <Edit3 className={`w-4 h-4 stroke-[2.2] ${activeActionBtn === "edit" ? "text-black" : "text-white"}`} />
            <span>Edit</span>
          </Link>
        </div>
      </div>

      {resumeMsg && (
        <div className="p-3.5 rounded-2xl bg-neutral-900/60 border border-neutral-800 text-neutral-200 text-xs font-bold flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#D5FF38] shrink-0" />
          <span>{resumeMsg}</span>
        </div>
      )}

      {/* 2. EXPERIENCE CARD */}
      <div id="experience" className="bg-white dark:bg-[#18191F] rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-neutral-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">Experience</h3>
        </div>

        {profileData.experiences.length === 0 ? (
          <div className="py-8 text-center text-sm font-medium text-slate-400 dark:text-neutral-500">
            No experience added yet.{" "}
            <Link href="/settings/edit?tab=experience" className="text-slate-700 dark:text-neutral-300 hover:text-[#D5FF38] underline font-bold">
              Add your work experience
            </Link>
          </div>
        ) : (
          <div className="space-y-3 pt-1">
            {profileData.experiences.map((exp, idx) => (
              <div key={exp.id || `exp-${idx}-${exp.company_name || "item"}`} className="p-4 rounded-2xl bg-slate-50/70 dark:bg-[#121318] border border-slate-200/70 dark:border-neutral-800 space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white">{exp.role || (exp as any).job_title}</h4>
                    <p className="text-xs font-semibold text-slate-600 dark:text-neutral-400">{exp.company_name}</p>
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
        </div>

        {profileData.projects.length === 0 ? (
          <div className="py-8 text-center text-sm font-medium text-slate-400 dark:text-neutral-500">
            No projects added yet.{" "}
            <Link href="/settings/edit?tab=projects" className="text-slate-700 dark:text-neutral-300 hover:text-[#D5FF38] underline font-bold">
              Add your projects
            </Link>
          </div>
        ) : (
          <div className="space-y-3 pt-1">
            {profileData.projects.map((proj, idx) => (
              <div key={proj.id || `proj-${idx}-${proj.project_name || "item"}`} className="p-4 rounded-2xl bg-slate-50/70 dark:bg-[#121318] border border-slate-200/70 dark:border-neutral-800 space-y-2">
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
                      className="text-slate-600 dark:text-neutral-400 hover:text-[#D5FF38] hover:underline flex items-center gap-1"
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
                      className="text-slate-600 dark:text-neutral-400 hover:text-[#D5FF38] hover:underline flex items-center gap-1"
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
      {/* 8. EDUCATION CARD                                                   */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div id="education" className="bg-white dark:bg-[#18191F] rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-neutral-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">Education</h3>
        </div>

        {profileData.education.length === 0 ? (
          <div className="py-8 text-center text-sm font-medium text-slate-400 dark:text-neutral-500">
            No education added yet. Add your university or college details in settings.
          </div>
        ) : (
          <div className="space-y-4 pt-1">
            {profileData.education.map((edu, idx) => (
              <div key={edu.id || `edu-${idx}-${edu.college || "item"}`} className="flex items-start gap-3.5">
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
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">Career Preferences</h3>
            <p className="text-xs text-slate-500 dark:text-neutral-400 font-medium">Desired job roles and dream companies</p>
          </div>
          <Link
            href="/settings/edit?tab=career"
            className="text-xs font-bold text-slate-500 hover:text-black dark:hover:text-[#D5FF38] transition-colors"
          >
            Edit
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
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-[#121318] border border-slate-200/80 dark:border-neutral-800 text-slate-900 dark:text-white text-xs font-bold shadow-2xs"
                >
                  {r}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 dark:text-neutral-500 font-medium italic">
              No target roles specified yet. Click &apos;Edit&apos; to configure your career goals.
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
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-[#121318] border border-slate-200/80 dark:border-neutral-800 text-slate-900 dark:text-neutral-200 text-xs font-bold shadow-2xs"
                >
                  {c}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 dark:text-neutral-500 font-medium italic">
              No dream companies specified yet. Click &apos;Edit&apos; to add companies.
            </p>
          )}
        </div>
      </div>

      {/* Expertise & Skills Card */}
      <div id="skills" className="bg-white dark:bg-[#18191F] rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-neutral-800 shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">Expertise & Skills</h3>
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
                  <div className="text-xs font-semibold text-slate-400 dark:text-neutral-400 flex items-center gap-1.5">
                    <span className="text-slate-500">—</span>
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
                          <Database className="w-3.5 h-3.5 text-cyan-400" />
                        ) : cat.iconType === "layers" ? (
                          <Layers className="w-3.5 h-3.5 text-cyan-400" />
                        ) : cat.iconType === "cpu" ? (
                          <Cpu className="w-3.5 h-3.5 text-blue-500" />
                        ) : cat.iconType === "git" ? (
                          <GitBranch className="w-3.5 h-3.5 text-orange-500" />
                        ) : (
                          <Sparkles className="w-3.5 h-3.5 text-[#D5FF38]" />
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

      {/* Languages Card */}
      <div className="bg-white dark:bg-[#18191F] rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-neutral-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">Languages</h3>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {languages.map((lang) => (
            <span
              key={lang}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-slate-100 dark:bg-[#121318] border border-slate-200/80 dark:border-neutral-800 text-xs font-semibold text-slate-800 dark:text-neutral-200"
            >
              <Languages className="w-3.5 h-3.5 text-slate-400 dark:text-neutral-400" />
              <span>{lang}</span>
            </span>
          ))}
        </div>
      </div>

{/* 6. DEVELOPER & CODING PROFILES */}
      <div id="developer" className="bg-white dark:bg-[#18191F] rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-neutral-800 shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
              Developer & Coding Profiles
            </h3>
            <p className="text-xs text-slate-500 dark:text-neutral-400 font-medium">
              Connected accounts across competitive programming and developer platforms
            </p>
          </div>
          <Link
            href="/settings/edit?tab=coding"
            className="text-xs font-bold text-slate-500 hover:text-black dark:hover:text-[#D5FF38] transition-colors"
          >
            Edit
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
                    className={`text-xs font-bold ${
                      isConnected
                        ? "text-emerald-400"
                        : "text-slate-400 dark:text-neutral-500"
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
                      <p className="text-[11px] font-medium text-emerald-400 truncate">
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

      {/* ── MODAL: RESUME VIEW (MATCHES REFERENCE IMAGE 100%) ── */}
      {isClient &&
        createPortal(
          <AnimatePresence>
            {activeModal === "resume_preview" && (
              <div
                role="dialog"
                aria-modal="true"
                className="fixed inset-0 z-[999999] bg-black/85 backdrop-blur-sm flex items-center justify-center p-0 sm:p-4 overflow-y-auto"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.97, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97, y: 10 }}
                  className="bg-white rounded-none sm:rounded-3xl max-w-4xl w-full h-full sm:h-auto sm:max-h-[92vh] shadow-2xl border-0 sm:border border-slate-200 flex flex-col overflow-hidden my-auto"
                >
                  {/* Modal Header: Clean Title 'Resume' on Left | 'Download' & '✕' on Right */}
                  <div className="flex items-center justify-between px-6 sm:px-8 py-4 bg-white border-b border-slate-200 shrink-0">
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                      Resume
                    </h2>

                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={handleDownloadResume}
                        className="px-5 py-2 rounded-xl bg-[#18191E] hover:bg-black text-white text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
                        title="Download Resume PDF"
                      >
                        Download
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveModal(null)}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                        aria-label="Close modal"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Modal Body: Soft light grey wrapper with white paper sheet */}
                  <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-[#ECEEF1] flex justify-center items-start">
                    <div
                      id="printable-resume-sheet"
                      className="bg-white text-slate-900 w-full max-w-[720px] rounded-t-2xl sm:rounded-2xl p-6 sm:p-10 shadow-lg border border-slate-200/90 font-serif leading-tight text-[11px] select-text my-2"
                    >
                      {/* NAME & CONTACT HEADER */}
                      <div className="text-center pb-2">
                        <h1 className="text-xl sm:text-2xl font-bold tracking-wide uppercase font-serif text-slate-950">
                          {personalForm.full_name || session?.name || "PALAMOOR ADITHYA GOUD"}
                        </h1>
                        <div className="text-xs text-slate-700 mt-0.5 font-normal">
                          {[personalForm.city, personalForm.state].filter(Boolean).join(", ") || "Hyderabad, Telangana"}
                        </div>
                        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 mt-1 text-[11px] text-slate-800">
                          <span className="inline-flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-800 inline shrink-0" />
                            <a href={`tel:${personalForm.phone || "+919392640702"}`} className="underline hover:text-black">
                              {personalForm.phone || "+91 9392640702"}
                            </a>
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-800 inline shrink-0" />
                            <a
                              href={`mailto:${session?.email || personalForm.email || "palamooradithyagoud@gmail.com"}`}
                              className="underline hover:text-black"
                            >
                              {session?.email || personalForm.email || "palamooradithyagoud@gmail.com"}
                            </a>
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <span className="font-bold border border-slate-800 rounded-2xs px-0.5 text-[8.5px] leading-none inline-block">
                              in
                            </span>
                            <a
                              href="https://www.linkedin.com/in/palamoor-adithya-goud"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline hover:text-black"
                            >
                              LinkedIn
                            </a>
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <svg className="w-3 h-3 inline fill-current shrink-0" viewBox="0 0 24 24">
                              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                            </svg>
                            <a
                              href="https://github.com/palamooradithyagoud"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline hover:text-black"
                            >
                              GitHub
                            </a>
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Code2 className="w-3 h-3 text-slate-800 inline shrink-0" />
                            <a
                              href="https://leetcode.com/Palamoor_Adithya_Goud"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline hover:text-black"
                            >
                              LeetCode
                            </a>
                          </span>
                        </div>
                      </div>

                      {/* SUMMARY */}
                      <div className="mt-2.5">
                        <h3 className="font-bold text-[11px] uppercase tracking-wider border-b border-black pb-0.5 mb-1 text-black">
                          SUMMARY
                        </h3>
                        <p className="text-[10.5px] text-slate-800 leading-normal text-justify">
                          {personalForm.about ||
                            "Motivated B.Tech student specializing in AI & ML with a strong foundation in problem solving and software development. Experienced in building intelligent systems and full-stack projects using modern tools and AI technologies. Proven ability to collaborate in teams and deliver innovative solutions, with recognition in multiple national-level hackathons."}
                        </p>
                      </div>

                      {/* EDUCATION */}
                      <div className="mt-2.5">
                        <h3 className="font-bold text-[11px] uppercase tracking-wider border-b border-black pb-0.5 mb-1 text-black">
                          EDUCATION
                        </h3>
                        <div className="space-y-1 text-[10.5px]">
                          <div>
                            <div className="flex justify-between items-baseline">
                              <span className="font-bold text-slate-900">Vardhaman College of Engineering</span>
                              <span className="font-medium text-slate-900">2025 – 2029</span>
                            </div>
                            <div className="flex justify-between items-baseline italic text-slate-700">
                              <span>B.Tech in CSE (AI &amp; ML) – CGPA: 8.95</span>
                              <span>Hyderabad, Telangana</span>
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between items-baseline">
                              <span className="font-bold text-slate-900">Narayana Junior College</span>
                              <span className="font-medium text-slate-900">2024</span>
                            </div>
                            <div className="flex justify-between items-baseline italic text-slate-700">
                              <span>Intermediate (MPC) – CGPA: 9.64</span>
                              <span>Hyderabad, Telangana</span>
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between items-baseline">
                              <span className="font-bold text-slate-900">Geethanjali High School</span>
                              <span className="font-medium text-slate-900">2022</span>
                            </div>
                            <div className="flex justify-between items-baseline italic text-slate-700">
                              <span>Secondary Education (SSC) – CGPA: 9.8/10</span>
                              <span>Maddur, Telangana</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* TECHNICAL SKILLS */}
                      <div className="mt-2.5">
                        <h3 className="font-bold text-[11px] uppercase tracking-wider border-b border-black pb-0.5 mb-1 text-black">
                          TECHNICAL SKILLS
                        </h3>
                        <div className="text-[10.5px] space-y-0.5 text-slate-800">
                          <div>
                            <span className="font-bold text-slate-900">Programming:</span> Java, Python
                          </div>
                          <div>
                            <span className="font-bold text-slate-900">Tools &amp; Technologies:</span> Flask, Supabase, PostgreSQL, Vercel, Railway, Render, Groq API, YouTube Data API
                          </div>
                        </div>
                      </div>

                      {/* PROJECTS */}
                      <div className="mt-2.5">
                        <h3 className="font-bold text-[11px] uppercase tracking-wider border-b border-black pb-0.5 mb-1 text-black">
                          PROJECTS
                        </h3>
                        <div className="space-y-2 text-[10.5px]">
                          <div>
                            <div className="flex justify-between items-baseline">
                              <div className="font-bold text-slate-900">
                                <span className="underline">SkillPath</span> <span className="text-[9px]">↗</span> | <span className="font-normal">Flask · Supabase · Groq API · YouTube Data API</span>
                              </div>
                              <span className="font-bold text-slate-900 shrink-0">2026</span>
                            </div>
                            <ul className="list-disc pl-4 space-y-0.5 mt-0.5 text-[10px] text-slate-800 leading-tight">
                              <li>Built SkillPath, an AI-powered platform that generates personalized learning paths by curating high-quality resources from fragmented online content.</li>
                              <li>Integrated YouTube Data API and Groq LLM to fetch, rank, and filter content, delivering the top 5 most relevant resources per query.</li>
                              <li>Designed a pipeline architecture (fetch → LLM ranking → store → reuse) with Supabase caching to improve response speed and consistency.</li>
                              <li>Implemented DSA company-wise question tracking, resume analyzer, and dashboard features, serving 10+ active users.</li>
                              <li>Reduced manual resource search effort by ~60% and improved preparation efficiency by ~30% based on user estimates.</li>
                            </ul>
                          </div>

                          <div>
                            <div className="flex justify-between items-baseline">
                              <div className="font-bold text-slate-900">
                                <span className="underline">Work Assignment System (AI-Enabled)</span> <span className="text-[9px]">↗</span> | <span className="font-normal">Flask · Supabase · Rule-based AI Engine</span>
                              </div>
                              <span className="font-bold text-slate-900 shrink-0">2026</span>
                            </div>
                            <ul className="list-disc pl-4 space-y-0.5 mt-0.5 text-[10px] text-slate-800 leading-tight">
                              <li>Built an AI-based work assignment system using skill matching and workload balancing to automate team composition.</li>
                              <li>Implemented a decision engine with rule-based confidence scoring and explainable outputs for task allocation and alternative recommendations.</li>
                              <li>Designed a role-based system for PM, TL, and Employee roles with centralized assignment logic and real-time tracking dashboards.</li>
                              <li>Reduced manual task allocation effort by ~50% in simulated scenarios.</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      {/* WORK EXPERIENCE */}
                      <div className="mt-2.5">
                        <h3 className="font-bold text-[11px] uppercase tracking-wider border-b border-black pb-0.5 mb-1 text-black">
                          WORK EXPERIENCE
                        </h3>
                        <div className="text-[10.5px]">
                          <div className="flex justify-between items-baseline">
                            <span className="font-bold text-slate-900">StayKaro Private Limited</span>
                            <span className="font-medium text-slate-900">August 2026 – Present</span>
                          </div>
                          <div className="flex justify-between items-baseline italic text-slate-700">
                            <span>AI Engineer Intern</span>
                            <span>Hyderabad, Telangana</span>
                          </div>
                          <ul className="list-disc pl-4 space-y-0.5 mt-0.5 text-[10px] text-slate-800 leading-tight">
                            <li>Working as an AI Engineer Intern, contributing to AI-driven solutions and software development initiatives.</li>
                            <li>Applying AI/ML concepts and modern development tools to build and improve intelligent systems.</li>
                          </ul>
                        </div>
                      </div>

                      {/* ACHIEVEMENTS */}
                      <div className="mt-2.5">
                        <h3 className="font-bold text-[11px] uppercase tracking-wider border-b border-black pb-0.5 mb-1 text-black">
                          ACHIEVEMENTS
                        </h3>
                        <ul className="list-disc pl-4 space-y-0.5 text-[10px] text-slate-800 leading-tight">
                          <li>1st Place – GNIT Devnoate National Hackathon, April 18-19, 2026</li>
                          <li>1st Place – MRU Hack2Hire Hackathon, July 18-19, 2026</li>
                          <li>1st Place – Demux 3.0 Hackathon, August 13-14, 2026</li>
                          <li>3rd Place – ISL National Hackathon, April 9, 2026</li>
                          <li>4th Place – Digital India Hackathon, SNIST College, July 9-11, 2026</li>
                          <li>5th Place – CodeStorm National Hackathon, NRCM College, April 25, 2026</li>
                        </ul>
                      </div>

                      {/* SOFT SKILLS */}
                      <div className="mt-2.5">
                        <h3 className="font-bold text-[11px] uppercase tracking-wider border-b border-black pb-0.5 mb-1 text-black">
                          SOFT SKILLS
                        </h3>
                        <div className="text-[10px] text-slate-800">
                          Problem Solving · Leadership · Teamwork · Fast Execution · Communication
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
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
        <div className="w-24 h-24 rounded-3xl bg-[#18191E] border-2 border-white/10 overflow-hidden flex items-center justify-center shadow-lg relative group">
          {selectedAvatar ? (
            <img src={selectedAvatar} alt="Avatar preview" className="w-full h-full object-cover" />
          ) : (
            <User className="w-10 h-10 text-slate-400" />
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
          className="px-4 py-2 rounded-xl bg-[#18191E] hover:bg-[#20222A] text-white border border-white/10 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Camera className="w-4 h-4 text-[#D5FF38]" />
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
                  ? "border-[#D5FF38] bg-[#D5FF38]/10 scale-105 shadow-sm"
                  : "border-slate-200 dark:border-neutral-800 hover:border-[#D5FF38]/40"
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
          className="px-5 py-2 rounded-xl bg-[#D5FF38] text-black font-extrabold text-xs shadow-xs hover:bg-[#c4ed30] transition-all cursor-pointer"
        >
          Save Photo
        </button>
      </div>
    </div>
  );
}
