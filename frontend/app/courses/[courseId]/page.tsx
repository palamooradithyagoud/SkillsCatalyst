"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Clock,
  GraduationCap,
  PlayCircle,
  HelpCircle,
  AlertCircle,
  Layers,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  Lock,
  RotateCcw,
  Trophy,
  Award,
  Sparkles,
  Share2,
  Bookmark,
  FileText,
  Check,
  Folder,
  Calendar,
  BarChart3,
  ExternalLink,
  MessageSquare,
  Code2,
  Copy,
  ChevronUp,
} from "lucide-react";

import { useAuth } from "@/lib/auth";
import {
  fetchStudentCourseById,
  fetchCourseProgress,
  fetchQuizAttempts,
  fetchModuleProgress,
} from "@/lib/api/courses";
import { fetchCertificateEligibility } from "@/lib/api/certificates";
import type { StudentCourseDetail, StudentCourseProgress } from "@/types/course";
import type { QuizAttemptHistory, StudentModuleProgress } from "@/types/quiz-attempt";
import type { CertificateEligibility } from "@/types/certificate";

// ── Tab Types ────────────────────────────────────────────────────────────────
type CourseTab = "overview" | "lessons" | "resources" | "projects" | "discussions";

export default function StudentCourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseIdOrSlug = params?.courseId as string;
  const { session } = useAuth();

  const [course, setCourse] = useState<StudentCourseDetail | null>(null);
  const [progress, setProgress] = useState<StudentCourseProgress | null>(null);
  const [eligibility, setEligibility] = useState<CertificateEligibility | null>(null);
  const [moduleProgressMap, setModuleProgressMap] = useState<Record<string, StudentModuleProgress>>({});
  const [moduleHistoryMap, setModuleHistoryMap] = useState<Record<string, QuizAttemptHistory>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI Interactive States
  const [activeTab, setActiveTab] = useState<CourseTab>("overview");
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [isSaved, setIsSaved] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);

  // Check saved state from localStorage
  useEffect(() => {
    if (!courseIdOrSlug) return;
    try {
      const savedCourses = JSON.parse(localStorage.getItem("sc_saved_courses") || "[]");
      setIsSaved(savedCourses.includes(courseIdOrSlug));
    } catch {
      // ignore localstorage errors
    }
  }, [courseIdOrSlug]);

  const toggleSave = () => {
    try {
      const savedCourses = JSON.parse(localStorage.getItem("sc_saved_courses") || "[]");
      let nextSaved: string[];
      if (savedCourses.includes(courseIdOrSlug)) {
        nextSaved = savedCourses.filter((id: string) => id !== courseIdOrSlug);
        setIsSaved(false);
      } else {
        nextSaved = [...savedCourses, courseIdOrSlug];
        setIsSaved(true);
      }
      localStorage.setItem("sc_saved_courses", JSON.stringify(nextSaved));
    } catch {
      setIsSaved(!isSaved);
    }
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2500);
    }
  };

  // Load course and progress
  useEffect(() => {
    let isMounted = true;
    async function loadCourseAndProgress() {
      if (!courseIdOrSlug) return;
      setLoading(true);
      setError(null);
      try {
        const cData = await fetchStudentCourseById(courseIdOrSlug);
        if (isMounted) {
          setCourse(cData);
          // Default all modules to expanded
          const initialExpanded: Record<string, boolean> = {};
          cData.modules?.forEach((m) => {
            initialExpanded[m.id] = true;
          });
          setExpandedModules(initialExpanded);
        }

        if (session?.user_id) {
          try {
            const [pData, eligData] = await Promise.all([
              fetchCourseProgress(courseIdOrSlug).catch(() => null),
              fetchCertificateEligibility(courseIdOrSlug).catch(() => null),
            ]);
            if (isMounted) {
              if (pData) setProgress(pData);
              if (eligData) setEligibility(eligData);
            }

            const modules = cData.modules || [];
            const modIds = modules.map((m: { id: string }) => m.id);
            const [modProgressResults, modHistoryResults] = await Promise.all([
              Promise.all(modIds.map((mid: string) =>
                fetchModuleProgress(courseIdOrSlug, mid).catch(() => null)
              )),
              Promise.all(modIds.map((mid: string) =>
                fetchQuizAttempts(courseIdOrSlug, mid).catch(() => null)
              )),
            ]);

            if (isMounted) {
              const progressMap: Record<string, StudentModuleProgress> = {};
              const historyMap: Record<string, QuizAttemptHistory> = {};
              modIds.forEach((mid: string, i: number) => {
                if (modProgressResults[i]) progressMap[mid] = modProgressResults[i]!;
                if (modHistoryResults[i]) historyMap[mid] = modHistoryResults[i]!;
              });
              setModuleProgressMap(progressMap);
              setModuleHistoryMap(historyMap);
            }
          } catch (pErr) {
            console.warn("Could not load student course progress:", pErr);
          }
        }
      } catch (err: unknown) {
        if (isMounted) {
          const msg = err instanceof Error ? err.message : "Failed to load course";
          setError(msg);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadCourseAndProgress();
    return () => {
      isMounted = false;
    };
  }, [courseIdOrSlug, session]);

  // Derived Values
  const firstLessonId = useMemo(() => {
    if (!course?.modules) return null;
    for (const mod of course.modules) {
      if (mod.lessons?.length > 0) {
        return mod.lessons[0].id;
      }
    }
    return null;
  }, [course]);

  const resumeLessonId = progress?.last_lesson_id || firstLessonId;
  const completedLessonsCount = progress?.completed_lessons || 0;
  const totalLessonsCount = course?.lessons_count || progress?.total_lessons || 0;
  const progressPercentage = progress?.progress_percentage || 0;
  const hasProgress = Boolean(progress && (progress.completed_lessons > 0 || progress.last_lesson_id));
  const isAllLessonsCompleted = Boolean(
    progress &&
    totalLessonsCount > 0 &&
    completedLessonsCount === totalLessonsCount
  );

  // Find resume lesson title for "Next Lesson" preview
  const nextLessonTitle = useMemo(() => {
    if (!course?.modules) return "First Lesson";
    if (resumeLessonId) {
      for (const mod of course.modules) {
        const found = mod.lessons.find((l) => l.id === resumeLessonId);
        if (found) return found.title;
      }
    }
    return course.modules[0]?.lessons[0]?.title || "Course Introduction";
  }, [course, resumeLessonId]);

  // Skills derived dynamically from course
  const dynamicSkills = useMemo(() => {
    if (!course) return ["Web Development", "Computer Science", "Coding"];
    const title = course.title.toLowerCase();
    const category = course.category?.toLowerCase() || "";

    if (title.includes("git") || title.includes("github")) {
      return ["Git", "GitHub", "Version Control", "Pull Requests", "Code Review", "Branching", "Open Source"];
    }
    if (title.includes("html")) {
      return ["HTML", "Web Development", "Web Pages", "Elements", "Semantic HTML", "Forms"];
    }
    if (title.includes("css")) {
      return ["CSS3", "Responsive Design", "Flexbox", "CSS Grid", "Animations", "UI Styling"];
    }
    if (title.includes("javascript") || title.includes("js")) {
      return ["JavaScript", "ES6+", "Async Programming", "DOM Manipulation", "Event Loop", "APIs"];
    }
    if (title.includes("react")) {
      return ["React.js", "Hooks", "Component Architecture", "State Management", "Virtual DOM"];
    }
    if (title.includes("python")) {
      return ["Python", "Object-Oriented Programming", "Data Structures", "Scripting", "Backend"];
    }
    return [
      course.category || "Development",
      course.title,
      "Problem Solving",
      "Software Engineering",
      "Best Practices",
    ];
  }, [course]);

  // Module accordion toggles
  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  const toggleAllModules = () => {
    if (!course?.modules) return;
    const allExpanded = course.modules.every((m) => expandedModules[m.id]);
    const nextState: Record<string, boolean> = {};
    course.modules.forEach((m) => {
      nextState[m.id] = !allExpanded;
    });
    setExpandedModules(nextState);
  };

  const allModulesExpanded = useMemo(() => {
    if (!course?.modules || course.modules.length === 0) return true;
    return course.modules.every((m) => expandedModules[m.id]);
  }, [course, expandedModules]);

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-[#090A14] text-white flex flex-col items-center justify-center p-6">
        <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center mb-4 animate-spin">
          <Layers className="w-6 h-6 text-purple-400" />
        </div>
        <p className="text-sm font-medium text-slate-400">Loading course curriculum…</p>
      </div>
    );
  }

  // Error State
  if (error || !course) {
    return (
      <div className="min-h-screen bg-[#090A14] text-white flex flex-col items-center justify-center px-4 py-16 text-center max-w-md mx-auto">
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">Course Unavailable</h1>
        <p className="text-sm text-slate-400 mb-6 leading-relaxed">
          {error || "The requested course could not be loaded or is not published yet."}
        </p>
        <Link
          href="/courses"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Courses
        </Link>
      </div>
    );
  }

  // SVG Circular Gauge calculation
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, progressPercentage)) / 100) * circumference;

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] text-slate-900 flex flex-col">
      {/* ───────────────────────────────────────────────────────────────────────
          HERO SECTION (Dark Mode, Glowing 3D Atmosphere)
      ──────────────────────────────────────────────────────────────────────── */}
      <section className="relative w-full bg-gradient-to-b from-[#070814] via-[#0E0F26] to-[#0A0B1A] text-white pt-6 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-12 overflow-hidden border-b border-white/5">
        {/* Ambient volumetric glow circles */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-purple-600/20 blur-[130px] pointer-events-none" />
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-indigo-600/15 blur-[150px] pointer-events-none" />
        <div className="absolute -bottom-20 right-0 w-80 h-80 rounded-full bg-purple-900/20 blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Top Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-400 mb-6 sm:mb-8 font-medium">
            <Link
              href="/courses"
              className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Courses</span>
            </Link>
            <span className="text-slate-600">/</span>
            <span className="text-slate-400">{course.category || "Development"}</span>
            <span className="text-slate-600">/</span>
            <span className="text-purple-300 font-semibold truncate max-w-[200px] sm:max-w-md">
              {course.title}
            </span>
          </div>

          {/* Hero Main Content Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Content (Title, Description, Progress Card, Actions) */}
            <div className="lg:col-span-7 flex flex-col items-start text-left">
              {/* Main Headline */}
              <div className="mb-3">
                <span className="text-lg sm:text-2xl font-bold tracking-normal text-slate-300 block mb-1">
                  Learn
                </span>
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1]">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-300 to-white">
                    {course.title}
                  </span>
                </h1>
              </div>

              {/* Subtitle / Short Description */}
              <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed mb-5 font-normal">
                {course.short_description ||
                  course.description?.slice(0, 180) ||
                  "Master core concepts and advance your skills through hands-on structured learning."}
              </p>

              {/* Metadata Badges Row */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-7 text-xs sm:text-sm font-semibold">
                <span className="inline-flex items-center gap-1.5 text-slate-300 capitalize">
                  <BarChart3 className="w-4 h-4 text-purple-400" />
                  {course.difficulty}
                </span>

                <span className="text-slate-600">•</span>

                <span className="inline-flex items-center gap-1.5 text-slate-300">
                  <BookOpen className="w-4 h-4 text-indigo-400" />
                  v1.0 • {course.estimated_duration_minutes || 60} min
                </span>

                <span className="text-slate-600">•</span>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  You&apos;re Enrolled
                </span>
              </div>

              {/* Glassmorphic Progress & Next Lesson Pill */}
              <div className="w-full max-w-xl bg-slate-900/70 backdrop-blur-md border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-7 shadow-2xl">
                {/* Left: Radial Progress Ring */}
                <div className="flex items-center gap-4">
                  <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
                    <svg className="w-14 h-14 -rotate-90" viewBox="0 0 52 52">
                      <circle
                        cx="26"
                        cy="26"
                        r={radius}
                        className="text-white/10"
                        strokeWidth="4"
                        stroke="currentColor"
                        fill="transparent"
                      />
                      <circle
                        cx="26"
                        cy="26"
                        r={radius}
                        className="text-purple-500 transition-all duration-700 ease-out"
                        strokeWidth="4"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                      />
                    </svg>
                    <span className="absolute text-xs font-black text-white">
                      {progressPercentage}%
                    </span>
                  </div>

                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                      Your Progress
                    </span>
                    <span className="text-xs text-slate-400 mt-0.5 block">
                      {completedLessonsCount} of {totalLessonsCount} lessons completed
                    </span>
                    {/* Tiny inline progress bar */}
                    <div className="w-32 sm:w-36 h-1.5 bg-white/10 rounded-full mt-1.5 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-indigo-400 rounded-full transition-all duration-500"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Vertical Divider */}
                <div className="hidden sm:block w-px h-10 bg-white/10" />

                {/* Right: Next Lesson / Resume Preview */}
                {resumeLessonId ? (
                  <Link
                    href={`/courses/${course.slug || course.id}/lessons/${resumeLessonId}`}
                    className="flex items-center gap-3 group text-left max-w-[210px] hover:opacity-90 transition-opacity"
                  >
                    <div className="w-9 h-9 rounded-xl bg-purple-600/30 border border-purple-500/40 text-purple-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <PlayCircle className="w-5 h-5 text-purple-300" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-purple-300 block">
                        Next Lesson
                      </span>
                      <span className="text-xs font-semibold text-white truncate block group-hover:text-purple-200">
                        {nextLessonTitle}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white shrink-0 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                ) : (
                  <div className="text-xs text-slate-400">Curriculum in preparation</div>
                )}
              </div>

              {/* Action Buttons Row */}
              <div className="flex flex-wrap items-center gap-3">
                {resumeLessonId ? (
                  <Link
                    href={`/courses/${course.slug || course.id}/lessons/${resumeLessonId}`}
                    className="inline-flex items-center gap-2.5 px-6 sm:px-8 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-purple-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    <PlayCircle className="w-4 h-4" />
                    <span>
                      {hasProgress
                        ? isAllLessonsCompleted
                          ? "Review Course"
                          : "Continue Learning"
                        : "Start Learning"}
                    </span>
                  </Link>
                ) : null}

                {/* Save Course Button */}
                <button
                  type="button"
                  onClick={toggleSave}
                  className={`inline-flex items-center gap-2 px-5 py-3.5 rounded-xl border text-sm font-semibold transition-all ${
                    isSaved
                      ? "bg-purple-600/20 border-purple-500/40 text-purple-300"
                      : "bg-white/10 hover:bg-white/15 border-white/10 text-white"
                  }`}
                  title={isSaved ? "Saved to your list" : "Save this course"}
                >
                  <Bookmark className={`w-4 h-4 ${isSaved ? "fill-purple-400 text-purple-400" : ""}`} />
                  <span>{isSaved ? "Saved" : "Save"}</span>
                </button>

                {/* Share Course Button */}
                <button
                  type="button"
                  onClick={handleShare}
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white text-sm font-semibold transition-all"
                  title="Share course link"
                >
                  {copyFeedback ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-300 font-bold">Link Copied!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4" />
                      <span>Share</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right Graphic: 3D Code Laptop & Floating Badges */}
            <div className="lg:col-span-5 hidden lg:flex items-center justify-center relative">
              <div className="relative w-full max-w-[460px] h-[340px] flex items-center justify-center">
                {/* Ambient Soft Glow Behind Laptop */}
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/30 to-indigo-600/20 rounded-full blur-3xl transform scale-90" />

                {/* Floating Chips & Badges */}
                <div className="absolute -top-1 -left-2 z-20 px-3 py-1.5 rounded-full bg-slate-800/90 border border-purple-500/40 shadow-xl text-purple-300 text-xs font-bold flex items-center gap-1.5 backdrop-blur-md animate-bounce [animation-duration:4s]">
                  <Code2 className="w-3.5 h-3.5 text-purple-400" />
                  <span>&lt;/&gt;</span>
                </div>

                <div className="absolute -top-3 right-4 z-20 px-3 py-1 rounded-full bg-purple-600/80 border border-purple-400/50 shadow-xl text-white text-xs font-bold backdrop-blur-md animate-pulse">
                  {dynamicSkills[0] || "Code"}
                </div>

                <div className="absolute top-10 -right-4 z-20 px-3 py-1 rounded-full bg-slate-800/90 border border-white/10 shadow-xl text-slate-200 text-xs font-semibold backdrop-blur-md">
                  {dynamicSkills[1] || "Logic"}
                </div>

                <div className="absolute bottom-16 -right-6 z-20 px-3 py-1 rounded-full bg-slate-800/90 border border-white/10 shadow-xl text-slate-300 text-xs font-semibold backdrop-blur-md">
                  {dynamicSkills[2] || "Projects"}
                </div>

                <div className="absolute bottom-4 -left-4 z-20 px-3 py-1 rounded-full bg-slate-800/90 border border-white/10 shadow-xl text-slate-300 text-xs font-semibold backdrop-blur-md">
                  {dynamicSkills[3] || "Architecture"}
                </div>

                {/* Perspective 3D Laptop Screen & Deck */}
                <div
                  className="relative z-10 w-[380px] transition-transform duration-500 hover:scale-[1.03]"
                  style={{
                    perspective: "1000px",
                    transform: "rotateY(-10deg) rotateX(6deg) rotateZ(-1deg)",
                  }}
                >
                  {/* Laptop Display Lid */}
                  <div className="w-full rounded-2xl bg-[#090b16] border-2 border-slate-700/80 p-3 shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative overflow-hidden">
                    {/* Top camera bezel dot */}
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-600 mx-auto mb-2" />

                    {/* Screen Viewport with Code Editor */}
                    <div className="rounded-xl bg-[#05060D] border border-white/10 p-3.5 font-mono text-[11px] leading-relaxed text-slate-300 relative overflow-hidden h-[180px]">
                      {/* Window Controls */}
                      <div className="flex items-center gap-1.5 mb-3 border-b border-white/10 pb-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                        <span className="text-[10px] text-slate-500 ml-2 font-sans font-medium">
                          {course.slug || "main"}.dev
                        </span>
                      </div>

                      {/* Code Syntax Highlight Lines */}
                      <div className="space-y-1">
                        <p className="text-purple-400">
                          <span className="text-slate-600">1</span> &lt;!DOCTYPE html&gt;
                        </p>
                        <p className="text-slate-300">
                          <span className="text-slate-600">2</span> &lt;html lang=&quot;en&quot;&gt;
                        </p>
                        <p className="text-indigo-300 pl-3">
                          <span className="text-slate-600">3</span> &lt;title&gt;{course.title}&lt;/title&gt;
                        </p>
                        <p className="text-slate-300 pl-3">
                          <span className="text-slate-600">4</span> &lt;body&gt;
                        </p>
                        <p className="text-emerald-400 pl-6">
                          <span className="text-slate-600">5</span> &lt;h1&gt;SkillsCatalyst&lt;/h1&gt;
                        </p>
                        <p className="text-slate-500 pl-3">
                          <span className="text-slate-600">6</span> &lt;/body&gt;
                        </p>
                        <p className="text-slate-500">
                          <span className="text-slate-600">7</span> &lt;/html&gt;
                        </p>
                      </div>

                      {/* 3D Floating Technology Badge on Right Side of Screen */}
                      <div className="absolute right-3.5 top-8 w-16 h-18 rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-800 p-0.5 shadow-2xl flex flex-col items-center justify-center transform rotate-6 border border-white/20">
                        <div className="w-full h-full rounded-[14px] bg-gradient-to-br from-purple-500/20 to-indigo-950 flex flex-col items-center justify-center text-white">
                          <Sparkles className="w-6 h-6 text-purple-300 mb-0.5 animate-pulse" />
                          <span className="text-[10px] font-black uppercase tracking-wider text-purple-200">
                            {course.category?.slice(0, 5) || "CORE"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Laptop Keyboard Deck Base */}
                  <div className="w-[106%] -ml-[3%] h-4 rounded-b-xl bg-gradient-to-b from-slate-700 to-slate-900 border-t border-slate-600 shadow-2xl flex items-center justify-center">
                    <div className="w-16 h-1 rounded-full bg-slate-500/50" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────────────────
          TAB NAVIGATION STRIP (Crisp Light Theme, Sticky)
      ──────────────────────────────────────────────────────────────────────── */}
      <nav className="w-full bg-white border-b border-slate-200/90 sticky top-0 z-20 shadow-xs px-4 sm:px-6 lg:px-12">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-1 sm:gap-6 overflow-x-auto no-scrollbar">
            {(
              [
                { id: "overview", label: "Overview" },
                { id: "lessons", label: "Lessons" },
                { id: "resources", label: "Resources" },
                { id: "projects", label: "Projects" },
                { id: "discussions", label: "Discussions" },
              ] as const
            ).map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2.5 sm:px-4 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? "border-purple-600 text-purple-700"
                      : "border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Quick Right Action on Desktop */}
          {resumeLessonId && (
            <Link
              href={`/courses/${course.slug || course.id}/lessons/${resumeLessonId}`}
              className="hidden md:inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 hover:text-purple-800 transition-colors"
            >
              <span>{hasProgress ? "Continue Lesson" : "Start Course"}</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </nav>

      {/* ───────────────────────────────────────────────────────────────────────
          MAIN BODY LAYOUT (Two-Column: Left Content, Right Sticky Sidebar)
      ──────────────────────────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-12 py-8 sm:py-10 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ── Left Column (Content Areas based on Active Tab) ── */}
          <div className="lg:col-span-8 space-y-8 min-w-0">
            {/* TAB: OVERVIEW */}
            {activeTab === "overview" && (
              <>
                {/* 1. Course Overview Card with 4 Highlight Stat Cards */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-3">
                    Course Overview
                  </h2>
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal mb-8">
                    {course.description ||
                      course.short_description ||
                      "This course gives you hands-on practical experience in mastering industry-standard workflows, syntax, and architecture. Build real-world projects and accelerate your technical career."}
                  </p>

                  {/* 4 Highlight Stat Cards in Clean Row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4">
                    {/* Stat 1: Lessons */}
                    <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-100 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-600/10 text-purple-700 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-sm font-bold text-slate-900 block">
                          {totalLessonsCount} Lessons
                        </span>
                        <span className="text-[11px] font-medium text-slate-500">Curriculum</span>
                      </div>
                    </div>

                    {/* Stat 2: Content Duration */}
                    <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-600/10 text-blue-700 flex items-center justify-center shrink-0">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-sm font-bold text-slate-900 block">
                          {Math.round(((course.estimated_duration_minutes || 60) / 60) * 10) / 10} Hours
                        </span>
                        <span className="text-[11px] font-medium text-slate-500">Content</span>
                      </div>
                    </div>

                    {/* Stat 3: Level */}
                    <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-indigo-600/10 text-indigo-700 flex items-center justify-center shrink-0">
                        <BarChart3 className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-sm font-bold text-slate-900 capitalize block">
                          {course.difficulty}
                        </span>
                        <span className="text-[11px] font-medium text-slate-500">Level</span>
                      </div>
                    </div>

                    {/* Stat 4: Certificate Included */}
                    <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-100 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-amber-600/10 text-amber-700 flex items-center justify-center shrink-0">
                        <Award className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-sm font-bold text-slate-900 block">Certificate</span>
                        <span className="text-[11px] font-medium text-slate-500">Included</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Certificate Completion Banner (When Course is Completed) */}
                {eligibility?.course_completed && eligibility?.certificate_enabled && (
                  <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-purple-900 to-indigo-950 text-white border border-purple-500/40 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
                    <div className="flex items-center gap-4 text-center sm:text-left">
                      <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center shrink-0 text-purple-300">
                        <Sparkles className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-base sm:text-lg font-bold text-white">
                          🎉 Congratulations! You completed this course.
                        </h3>
                        <p className="text-xs text-purple-200 mt-0.5">
                          {eligibility.certificate_already_issued
                            ? "Your official verified completion certificate is ready to view."
                            : "All curriculum completed! Your official course certificate is ready."}
                        </p>
                      </div>
                    </div>
                    <Link
                      href={`/courses/${course.slug || course.id}/certificate`}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/40 hover:scale-[1.02] active:scale-[0.98] transition-all shrink-0"
                    >
                      <Award className="w-4 h-4" />
                      <span>View Certificate</span>
                    </Link>
                  </div>
                )}

                {/* 3. Curriculum Section: "What you'll learn" */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2">
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      What you&apos;ll learn
                    </h2>
                    <button
                      type="button"
                      onClick={toggleAllModules}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 hover:text-purple-900 transition-colors"
                    >
                      <span>{allModulesExpanded ? "Collapse All" : "Expand All"}</span>
                      {allModulesExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {course.modules.length === 0 ? (
                    <div className="p-8 text-center rounded-2xl border border-slate-200 bg-white">
                      <p className="text-slate-500 text-sm">No modules published yet for this course.</p>
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      {course.modules.map((module, mIdx) => {
                        const isExpanded = expandedModules[module.id] ?? true;
                        const modProgress = progress?.modules?.find((m) => m.module_id === module.id);
                        const estModuleMinutes = module.lessons.reduce(
                          (acc, cur) => acc + (cur.estimated_duration_minutes || 10),
                          0
                        );

                        return (
                          <div
                            key={module.id}
                            className="rounded-2xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden transition-all hover:border-slate-300"
                          >
                            {/* Module Accordion Header */}
                            <button
                              type="button"
                              onClick={() => toggleModule(module.id)}
                              className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left cursor-pointer hover:bg-slate-50/80 transition-colors"
                            >
                              <div className="flex items-center gap-3.5 min-w-0">
                                {/* Number circular badge */}
                                <div className="w-8 h-8 rounded-full bg-purple-100/80 text-purple-700 font-bold text-xs flex items-center justify-center shrink-0">
                                  {mIdx + 1}
                                </div>

                                <div className="min-w-0">
                                  <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                                    {module.title}
                                  </h3>
                                  <div className="flex items-center gap-2 sm:gap-3 text-xs text-slate-500 mt-0.5">
                                    <span>{module.lessons.length} items</span>
                                    <span>•</span>
                                    <span>100 XP</span>
                                    <span>•</span>
                                    <span>{estModuleMinutes} min</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                {/* Module Item Tags */}
                                <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                                  Article
                                </span>
                                {module.quiz && (
                                  <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-[11px] font-bold">
                                    Quiz
                                  </span>
                                )}
                                <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center">
                                  <ChevronDown
                                    className={`w-4 h-4 transition-transform duration-200 ${
                                      isExpanded ? "rotate-180" : ""
                                    }`}
                                  />
                                </div>
                              </div>
                            </button>

                            {/* Module Expanded Lesson Content */}
                            {isExpanded && (
                              <div className="border-t border-slate-100 bg-[#FAFBFD] divide-y divide-slate-100">
                                {module.lessons.map((lesson, lIdx) => {
                                  const isCompleted = progress?.completed_lesson_ids?.includes(lesson.id);
                                  const isResume = progress?.last_lesson_id === lesson.id;

                                  return (
                                    <Link
                                      key={lesson.id}
                                      href={`/courses/${course.slug || course.id}/lessons/${lesson.id}`}
                                      className="group flex items-center justify-between p-3.5 sm:px-6 hover:bg-white transition-colors"
                                    >
                                      <div className="flex items-center gap-3 min-w-0 pr-3">
                                        {isCompleted ? (
                                          <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                          </span>
                                        ) : isResume ? (
                                          <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                                            <PlayCircle className="w-3.5 h-3.5" />
                                          </span>
                                        ) : (
                                          <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 font-semibold text-xs flex items-center justify-center shrink-0">
                                            {lIdx + 1}
                                          </span>
                                        )}

                                        <div className="min-w-0">
                                          <h4 className="text-xs sm:text-sm font-semibold text-slate-800 group-hover:text-purple-700 truncate transition-colors">
                                            {lesson.title}
                                          </h4>
                                          {lesson.short_description && (
                                            <p className="text-[11px] text-slate-500 truncate max-w-md">
                                              {lesson.short_description}
                                            </p>
                                          )}
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-3 shrink-0">
                                        {isCompleted && (
                                          <span className="text-[11px] font-semibold text-emerald-600 hidden sm:inline-block">
                                            Completed
                                          </span>
                                        )}
                                        {isResume && !isCompleted && (
                                          <span className="text-[11px] font-semibold text-purple-700 hidden sm:inline-block">
                                            Resume Here
                                          </span>
                                        )}
                                        {lesson.estimated_duration_minutes && (
                                          <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                                            <Clock className="w-3 h-3 text-slate-400" />
                                            {lesson.estimated_duration_minutes}m
                                          </span>
                                        )}
                                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all" />
                                      </div>
                                    </Link>
                                  );
                                })}

                                {/* Module Quiz Row */}
                                {module.quiz && (() => {
                                  const modProg = moduleProgressMap[module.id];
                                  const modHist = moduleHistoryMap[module.id];
                                  const quizPassed = modProg?.quiz_passed || modHist?.ever_passed || false;
                                  const lessonsComplete =
                                    modProg?.lessons_complete || modProgress?.lessons_complete || false;
                                  const bestScore = modProg?.best_score ?? modHist?.best_score ?? null;

                                  return (
                                    <div className="p-3.5 sm:px-6 bg-purple-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-purple-100">
                                      <div className="flex items-center gap-3">
                                        <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                                          <HelpCircle className="w-4 h-4" />
                                        </div>
                                        <div>
                                          <span className="font-bold text-xs sm:text-sm text-slate-900">
                                            {module.quiz.title}
                                          </span>
                                          {quizPassed && bestScore !== null && (
                                            <p className="text-[11px] text-emerald-600 font-semibold">
                                              Best score: {bestScore}%
                                            </p>
                                          )}
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-2 shrink-0">
                                        {quizPassed ? (
                                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                            <Trophy className="w-3.5 h-3.5 text-emerald-600" />
                                            Passed
                                          </span>
                                        ) : !session?.user_id ? (
                                          <span className="text-xs font-medium text-slate-400">
                                            Sign in to take quiz
                                          </span>
                                        ) : !lessonsComplete ? (
                                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-600">
                                            <Lock className="w-3 h-3" />
                                            Complete lessons to unlock
                                          </span>
                                        ) : (
                                          <Link
                                            href={`/courses/${courseIdOrSlug}/modules/${module.id}/quiz`}
                                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-xs transition-all"
                                          >
                                            <HelpCircle className="w-3.5 h-3.5" />
                                            Take Quiz
                                          </Link>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })()}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* TAB: LESSONS (Direct Full Syllabus View) */}
            {activeTab === "lessons" && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <h2 className="text-xl font-black text-slate-900">Complete Lessons Syllabus</h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                      Navigate directly to any lesson or module in the curriculum.
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold">
                    {totalLessonsCount} Lessons
                  </span>
                </div>

                <div className="space-y-6">
                  {course.modules.map((m, idx) => (
                    <div key={m.id} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">
                          Module {idx + 1}
                        </span>
                        <span className="text-xs text-slate-400">—</span>
                        <h3 className="text-sm font-bold text-slate-900">{m.title}</h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {m.lessons.map((lesson) => {
                          const isCompleted = progress?.completed_lesson_ids?.includes(lesson.id);
                          return (
                            <Link
                              key={lesson.id}
                              href={`/courses/${course.slug || course.id}/lessons/${lesson.id}`}
                              className="p-3.5 rounded-xl border border-slate-200/90 hover:border-purple-300 hover:bg-purple-50/20 flex items-center justify-between transition-all group"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div
                                  className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 text-xs font-bold ${
                                    isCompleted
                                      ? "bg-emerald-100 text-emerald-700"
                                      : "bg-slate-100 text-slate-500"
                                  }`}
                                >
                                  {isCompleted ? <Check className="w-3.5 h-3.5" /> : <PlayCircle className="w-3.5 h-3.5" />}
                                </div>
                                <span className="text-xs sm:text-sm font-semibold text-slate-800 group-hover:text-purple-700 truncate">
                                  {lesson.title}
                                </span>
                              </div>
                              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 shrink-0" />
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: RESOURCES */}
            {activeTab === "resources" && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Curated Resources & Cheatsheets</h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    Official documentation, starter repositories, and cheat sheets to complement this course.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white transition-all space-y-2">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                      <FileText className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">Official Documentation</h3>
                    <p className="text-xs text-slate-600">
                      Access the complete reference documentation and API standards for {course.title}.
                    </p>
                    <a
                      href="https://developer.mozilla.org"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 hover:text-purple-800 pt-1"
                    >
                      <span>Open Docs</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white transition-all space-y-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                      <Code2 className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">Starter Code & Exercises</h3>
                    <p className="text-xs text-slate-600">
                      Download hands-on starter files and templates to follow along with every lesson.
                    </p>
                    <a
                      href="https://github.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 hover:text-indigo-800 pt-1"
                    >
                      <span>View GitHub Repository</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: PROJECTS */}
            {activeTab === "projects" && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Hands-on Course Projects</h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    Build tangible portfolio projects to validate your knowledge and earn course certification.
                  </p>
                </div>

                <div className="p-5 rounded-2xl border border-purple-200 bg-purple-50/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[11px] font-bold">
                      Capstone Project
                    </span>
                    <h3 className="text-base font-bold text-slate-900">
                      {course.title} Real-World Implementation
                    </h3>
                    <p className="text-xs text-slate-600 max-w-xl">
                      Put all lessons into practice by completing a comprehensive project repository and submitting your code for AI & mentor review.
                    </p>
                  </div>
                  {resumeLessonId && (
                    <Link
                      href={`/courses/${course.slug || course.id}/lessons/${resumeLessonId}`}
                      className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shrink-0 transition-all"
                    >
                      Start Project
                    </Link>
                  )}
                </div>
              </div>
            )}

            {/* TAB: DISCUSSIONS */}
            {activeTab === "discussions" && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Community & Mentor Discussions</h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    Connect with peers, ask questions about lessons, and get instant answers from AI Mentor.
                  </p>
                </div>

                <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center mx-auto">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">Need help with this course?</h3>
                  <p className="text-xs text-slate-600 max-w-md mx-auto">
                    Ask questions anytime in our AI Mentor workspace or submit doubts for fast feedback.
                  </p>
                  <Link
                    href="/ai-mentor"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-xs transition-all"
                  >
                    <span>Open AI Mentor Chat</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* ── Right Column: Sticky Sidebar / Info Cards ── */}
          <div className="lg:col-span-4 space-y-6 sticky top-20">
            {/* Card 1: "About this course" */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
              <h3 className="text-base font-black text-slate-900 tracking-tight mb-4">
                About this course
              </h3>

              <div className="space-y-3.5 text-xs sm:text-sm">
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                  <span className="flex items-center gap-2 text-slate-500 font-medium">
                    <Folder className="w-4 h-4 text-purple-600" />
                    Category
                  </span>
                  <span className="font-bold text-slate-900">
                    {course.category || "Web Development"}
                  </span>
                </div>

                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                  <span className="flex items-center gap-2 text-slate-500 font-medium">
                    <BarChart3 className="w-4 h-4 text-indigo-600" />
                    Level
                  </span>
                  <span className="font-bold text-slate-900 capitalize">
                    {course.difficulty}
                  </span>
                </div>

                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                  <span className="flex items-center gap-2 text-slate-500 font-medium">
                    <FileText className="w-4 h-4 text-blue-600" />
                    Total Lessons
                  </span>
                  <span className="font-bold text-slate-900">
                    {totalLessonsCount} Lessons
                  </span>
                </div>

                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                  <span className="flex items-center gap-2 text-slate-500 font-medium">
                    <Clock className="w-4 h-4 text-amber-600" />
                    Total Duration
                  </span>
                  <span className="font-bold text-slate-900">
                    {Math.round(((course.estimated_duration_minutes || 60) / 60) * 10) / 10} Hours
                  </span>
                </div>

                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                  <span className="flex items-center gap-2 text-slate-500 font-medium">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    Last Updated
                  </span>
                  <span className="font-bold text-slate-900">
                    {course.published_at
                      ? new Date(course.published_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "Jan 15, 2026"}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="flex items-center gap-2 text-slate-500 font-medium">
                    <Award className="w-4 h-4 text-purple-600" />
                    Certificate
                  </span>
                  <span className="font-bold text-purple-700">Included</span>
                </div>
              </div>
            </div>

            {/* Card 2: "Skills you'll gain" */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
              <h3 className="text-base font-black text-slate-900 tracking-tight mb-3">
                Skills you&apos;ll gain
              </h3>

              <div className="flex flex-wrap gap-2">
                {dynamicSkills.map((skill, sIdx) => (
                  <span
                    key={skill}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      sIdx === 0
                        ? "bg-purple-100 text-purple-800 border border-purple-200"
                        : "bg-slate-100 text-slate-700 border border-slate-200/70 hover:bg-slate-200"
                    }`}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Card 3: "Prerequisites" */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
              <h3 className="text-base font-black text-slate-900 tracking-tight mb-3">
                Prerequisites
              </h3>

              <div className="flex items-start gap-3 text-slate-600 text-xs sm:text-sm leading-relaxed">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                  <BookOpen className="w-4 h-4" />
                </div>
                <p>
                  No prior experience required. Basic computer knowledge and curiosity to learn is enough.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
