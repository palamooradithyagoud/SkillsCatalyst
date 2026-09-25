"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  X,
  BookOpen,
  Clock,
  AlertCircle,
  List,
  CheckCircle2,
} from "lucide-react";

import { useAuth } from "@/lib/auth";
import {
  fetchStudentLesson,
  fetchStudentCourseById,
  recordLessonProgress,
  fetchCourseProgress,
} from "@/lib/api/courses";
import type {
  StudentLessonDetail,
  StudentCourseDetail,
  StudentCourseProgress,
} from "@/types/course";
import { StudentLessonRenderer } from "@/components/student/lesson-reader/StudentLessonRenderer";

export default function StudentLessonReaderPage() {
  const params = useParams();
  const { session } = useAuth();

  const courseIdOrSlug = params?.courseId as string;
  const lessonId = params?.lessonId as string;

  const [lessonData, setLessonData] = useState<StudentLessonDetail | null>(null);
  const [courseOutline, setCourseOutline] = useState<StudentCourseDetail | null>(null);
  const [courseProgress, setCourseProgress] = useState<StudentCourseProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingProgress, setSavingProgress] = useState(false);
  const [progressError, setProgressError] = useState<string | null>(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [prevLessonId, setPrevLessonId] = useState(lessonId);

  // Close mobile drawer when lesson changes (React recommended render-time reset)
  if (prevLessonId !== lessonId) {
    setPrevLessonId(lessonId);
    setMobileDrawerOpen(false);
  }

  useEffect(() => {
    let isMounted = true;

    async function loadLessonAndOutline() {
      if (!courseIdOrSlug || !lessonId) return;
      setLoading(true);
      setError(null);
      setProgressError(null);

      try {
        const [lData, cData] = await Promise.all([
          fetchStudentLesson(courseIdOrSlug, lessonId),
          fetchStudentCourseById(courseIdOrSlug).catch(() => null),
        ]);

        if (isMounted) {
          setLessonData(lData);
          setCourseOutline(cData);
        }

        // If authenticated student, track meaningful view and fetch course progress
        if (session?.user_id) {
          try {
            const res = await recordLessonProgress(courseIdOrSlug, lessonId);
            if (isMounted && res.course_progress) {
              setCourseProgress(res.course_progress);
            }
          } catch (pErr) {
            console.warn("Could not record lesson view activity:", pErr);
            // Non-blocking fallback to get progress
            try {
              const pData = await fetchCourseProgress(courseIdOrSlug);
              if (isMounted) {
                setCourseProgress(pData);
              }
            } catch {}
          }
        }
      } catch (err: unknown) {
        if (isMounted) {
          const msg = err instanceof Error ? err.message : "Failed to load lesson content";
          setError(msg);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadLessonAndOutline();

    return () => {
      isMounted = false;
    };
  }, [courseIdOrSlug, lessonId, session]);

  const isCompleted = Boolean(courseProgress?.completed_lesson_ids.includes(lessonId));

  async function handleToggleComplete() {
    if (!session?.user_id) {
      setProgressError("Please sign in to save and track your lesson progress.");
      return;
    }
    if (savingProgress) return;

    setProgressError(null);
    setSavingProgress(true);

    const targetComplete = !isCompleted;
    const prevProgress = courseProgress;

    // Optimistic UI update
    if (courseProgress) {
      const nextCompletedIds = targetComplete
        ? Array.from(new Set([...courseProgress.completed_lesson_ids, lessonId]))
        : courseProgress.completed_lesson_ids.filter((id) => id !== lessonId);

      const nextCompletedCount = nextCompletedIds.length;
      const nextPct = courseProgress.total_lessons > 0
        ? Math.round((nextCompletedCount / courseProgress.total_lessons) * 100)
        : 0;

      const nextModules = courseProgress.modules.map((m) => {
        if (m.module_id === lessonData?.module.id) {
          const modLessonIds = courseOutline?.modules
            .find((mod) => mod.id === m.module_id)
            ?.lessons.map((l) => l.id) || [];
          const modComp = modLessonIds.filter((id) => nextCompletedIds.includes(id)).length;
          const modPct = m.total_lessons > 0 ? Math.round((modComp / m.total_lessons) * 100) : 0;
          return {
            ...m,
            completed_lessons: modComp,
            progress_percentage: modPct,
            lessons_complete: modComp === m.total_lessons && m.total_lessons > 0,
          };
        }
        return m;
      });

      setCourseProgress({
        ...courseProgress,
        completed_lesson_ids: nextCompletedIds,
        completed_lessons: nextCompletedCount,
        progress_percentage: nextPct,
        modules: nextModules,
      });
    }

    try {
      const res = await recordLessonProgress(courseIdOrSlug, lessonId, {
        completed: targetComplete,
      });
      if (res.course_progress) {
        setCourseProgress(res.course_progress);
      }
    } catch {
      // Rollback optimistic state
      setCourseProgress(prevProgress);
      setProgressError("Could not save your progress. Please try again.");
    } finally {
      setSavingProgress(false);
    }
  }

  // Loading Skeleton State
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        {/* Skeleton Top Nav */}
        <div className="h-16 border-b border-white/10 bg-slate-900/50 px-4 sm:px-8 flex items-center justify-between animate-pulse">
          <div className="h-5 w-48 bg-white/10 rounded-lg" />
          <div className="h-8 w-28 bg-white/10 rounded-lg" />
        </div>

        {/* Skeleton Body Layout */}
        <div className="flex-1 flex max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 gap-8 animate-pulse">
          {/* Main Skeleton */}
          <div className="flex-1 max-w-4xl space-y-6">
            <div className="h-4 w-32 bg-purple-500/20 rounded-md" />
            <div className="h-10 w-3/4 bg-white/10 rounded-xl" />
            <div className="h-4 w-40 bg-white/5 rounded-md mb-8" />
            <div className="space-y-4 pt-4 border-t border-white/5">
              <div className="h-5 w-full bg-white/5 rounded-md" />
              <div className="h-5 w-5/6 bg-white/5 rounded-md" />
              <div className="h-5 w-4/6 bg-white/5 rounded-md" />
              <div className="h-48 w-full bg-white/10 rounded-2xl my-6" />
              <div className="h-5 w-full bg-white/5 rounded-md" />
              <div className="h-5 w-3/4 bg-white/5 rounded-md" />
            </div>
          </div>

          {/* Sidebar Skeleton (Desktop) */}
          <div className="hidden lg:block w-80 shrink-0 space-y-4">
            <div className="h-6 w-36 bg-white/10 rounded-md" />
            <div className="h-32 bg-white/5 rounded-xl" />
            <div className="h-48 bg-white/5 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !lessonData) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 text-center max-w-md mx-auto">
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">
          Lesson Unavailable
        </h1>
        <p className="text-sm text-slate-400 mb-6 leading-relaxed">
          {error || "The requested lesson could not be loaded or is not published."}
        </p>
        <Link
          href={`/courses/${courseIdOrSlug}`}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-sm transition-all border border-white/10"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Course Overview
        </Link>
      </div>
    );
  }

  const { course, module, lesson, content, prev_lesson, next_lesson } = lessonData;

  const isCurrentLesson = (id: string) => id === lesson.id;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* ── Top Header Navigation Bar ── */}
      <header className="sticky top-0 z-30 h-16 border-b border-white/10 bg-slate-900/90 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-4 min-w-0">
          <Link
            href={`/courses/${course.slug || course.id}`}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-400 hover:text-white transition-colors shrink-0"
            title="Return to Course Syllabus"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Course Syllabus</span>
          </Link>

          <span className="text-white/20 hidden sm:inline">|</span>

          {/* Breadcrumb Context */}
          <div className="min-w-0 flex items-center gap-2 text-xs sm:text-sm">
            <span className="text-slate-400 truncate max-w-[120px] sm:max-w-[200px] hidden md:inline">
              {course.title}
            </span>
            <span className="text-slate-500 hidden md:inline">/</span>
            <span className="text-purple-300 font-medium truncate max-w-[150px] sm:max-w-[240px]">
              {module.title}
            </span>
          </div>
        </div>

        {/* Right Nav Action: Outline Toggle for Mobile */}
        <div className="flex items-center gap-3">
          {courseProgress && (
            <span className="text-xs font-semibold text-purple-300 hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20">
              {courseProgress.completed_lessons}/{courseProgress.total_lessons} completed ({courseProgress.progress_percentage}%)
            </span>
          )}

          <button
            type="button"
            onClick={() => setMobileDrawerOpen(true)}
            className="lg:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-semibold transition-all border border-white/10"
            aria-label="Open course outline drawer"
          >
            <List className="w-4 h-4 text-purple-400" />
            <span>Outline</span>
          </button>
        </div>
      </header>

      {/* ── Main Layout: Content Reader + Sticky Sidebar ── */}
      <div className="flex-1 flex max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 gap-8">
        {/* Main Lesson Content Area */}
        <main className="flex-1 min-w-0 max-w-4xl">
          {/* Module & Lesson Label */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-md border border-purple-500/20">
              Module {module.position} · Lesson {lesson.position}
            </span>
          </div>

          {/* Page H1: Single Authoritative Top Heading */}
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight mb-3">
            {lesson.title}
          </h1>

          {/* Estimated duration */}
          {lesson.estimated_duration_minutes && (
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-400 font-medium mb-8 pb-4 border-b border-white/10">
              <Clock className="w-4 h-4 text-slate-500" />
              <span>{lesson.estimated_duration_minutes} min read</span>
            </div>
          )}

          {/* Render All 12 Block Types via Dedicated Student Renderer */}
          <div className="mt-4 mb-12">
            <StudentLessonRenderer blocks={content.blocks} />
          </div>

          {/* ── Lesson Completion Controls (Phase 5) ── */}
          <div className="mb-12 p-5 sm:p-6 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-white mb-1">
                {isCompleted ? "Lesson Completed" : "Ready to mark complete?"}
              </h3>
              <p className="text-xs text-slate-400">
                {isCompleted
                  ? "You have completed this lesson. Progress is saved to your account."
                  : "Mark this lesson complete to track your overall course progress."}
              </p>
              {progressError && (
                <p className="text-xs text-rose-400 mt-2 font-medium">
                  {progressError}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={handleToggleComplete}
              disabled={savingProgress}
              aria-label={isCompleted ? "Lesson completed. Click to toggle." : "Mark lesson complete"}
              className={`shrink-0 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all shadow-md active:scale-95 cursor-pointer ${
                isCompleted
                  ? "bg-emerald-500/20 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300"
                  : "bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/25 hover:scale-[1.01]"
              }`}
            >
              <CheckCircle2 className={`w-4 h-4 ${isCompleted ? "text-emerald-400" : "text-white"}`} />
              <span>
                {savingProgress
                  ? "Saving..."
                  : isCompleted
                  ? "✓ Lesson Complete"
                  : "Mark Lesson Complete"}
              </span>
            </button>
          </div>

          {/* ── Bottom Sequential Navigation Bar ── */}
          <nav
            aria-label="Lesson pagination"
            className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4"
          >
            {/* Previous Lesson Button */}
            {prev_lesson ? (
              <Link
                href={`/courses/${course.slug || course.id}/lessons/${prev_lesson.id}`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 hover:text-white transition-all text-sm font-semibold group shadow-xs"
              >
                <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:-translate-x-0.5 transition-transform" />
                <div className="text-left">
                  <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                    Previous Lesson
                  </span>
                  <span className="truncate max-w-[200px] block">
                    {prev_lesson.title}
                  </span>
                </div>
              </Link>
            ) : (
              <div className="w-full sm:w-auto text-xs font-medium text-slate-500 py-2 sm:py-0 italic">
                First lesson in course
              </div>
            )}

            {/* Next Lesson Button */}
            {next_lesson ? (
              <Link
                href={`/courses/${course.slug || course.id}/lessons/${next_lesson.id}`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition-all shadow-lg shadow-purple-600/25 hover:scale-[1.01] group"
              >
                <div className="text-right">
                  <span className="block text-[10px] uppercase tracking-wider text-purple-200 font-bold">
                    Next Lesson
                  </span>
                  <span className="truncate max-w-[200px] block">
                    {next_lesson.title}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            ) : (
              <div className="w-full sm:w-auto text-center sm:text-right px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-purple-300">
                Course lessons complete
              </div>
            )}
          </nav>
        </main>

        {/* ── Desktop Course Content Sidebar ── */}
        <aside className="hidden lg:block w-80 shrink-0">
          <div className="sticky top-24 rounded-2xl border border-white/10 bg-slate-900/60 p-5 shadow-xl max-h-[calc(100vh-7rem)] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Course Content
                </h3>
              </div>
              {courseProgress && (
                <span className="text-xs font-semibold text-purple-300">
                  {courseProgress.completed_lessons}/{courseProgress.total_lessons}
                </span>
              )}
            </div>

            {courseOutline?.modules && (
              <div className="space-y-4">
                {courseOutline.modules.map((m, mIdx) => {
                  const modProgress = courseProgress?.modules.find((mp) => mp.module_id === m.id);

                  return (
                    <div key={m.id} className="space-y-1">
                      <div className="flex items-center justify-between px-2 mb-1">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Module {mIdx + 1}: {m.title}
                        </span>
                        {modProgress?.lessons_complete && (
                          <span className="text-[10px] font-bold text-emerald-400">
                            Complete
                          </span>
                        )}
                      </div>

                      <div className="space-y-0.5">
                        {m.lessons.map((les) => {
                          const active = isCurrentLesson(les.id);
                          const isLessonDone = courseProgress?.completed_lesson_ids?.includes(les.id);

                          return (
                            <Link
                              key={les.id}
                              href={`/courses/${course.slug || course.id}/lessons/${les.id}`}
                              className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                                active
                                  ? "bg-purple-600/20 text-purple-200 border border-purple-500/40 font-bold shadow-xs"
                                  : "text-slate-300 hover:text-white hover:bg-white/5"
                              }`}
                            >
                              <span className="truncate pr-2">{les.title}</span>
                              <div className="flex items-center gap-1.5 shrink-0">
                                {isLessonDone && (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                )}
                                {active && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                                )}
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* ── Mobile Slide-Out Course Outline Drawer ── */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileDrawerOpen(false)}
          />

          {/* Drawer Body */}
          <div className="relative ml-auto w-full max-w-xs sm:max-w-sm h-full bg-slate-900 border-l border-white/10 shadow-2xl p-6 flex flex-col z-10 overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Course Outline
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
                aria-label="Close outline drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {courseOutline?.modules && (
              <div className="space-y-6 flex-1">
                {courseOutline.modules.map((m, mIdx) => {
                  const modProgress = courseProgress?.modules.find((mp) => mp.module_id === m.id);

                  return (
                    <div key={m.id} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider block">
                          Module {mIdx + 1}: {m.title}
                        </span>
                        {modProgress?.lessons_complete && (
                          <span className="text-[10px] font-bold text-emerald-400">
                            Complete
                          </span>
                        )}
                      </div>

                      <div className="space-y-1">
                        {m.lessons.map((les) => {
                          const active = isCurrentLesson(les.id);
                          const isLessonDone = courseProgress?.completed_lesson_ids?.includes(les.id);

                          return (
                            <Link
                              key={les.id}
                              href={`/courses/${course.slug || course.id}/lessons/${les.id}`}
                              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all ${
                                active
                                  ? "bg-purple-600/25 text-purple-200 border border-purple-500/40 font-bold"
                                  : "text-slate-300 hover:bg-white/5 hover:text-white"
                              }`}
                            >
                              <span className="truncate pr-2">{les.title}</span>
                              <div className="flex items-center gap-1.5 shrink-0">
                                {isLessonDone && (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                )}
                                {active && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                                )}
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
