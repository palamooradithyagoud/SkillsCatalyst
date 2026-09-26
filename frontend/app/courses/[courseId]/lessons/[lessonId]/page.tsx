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
  HelpCircle,
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
      <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col">
        {/* Skeleton Top Nav */}
        <div className="h-16 border-b border-slate-200/90 bg-white/70 px-4 sm:px-8 flex items-center justify-between animate-pulse">
          <div className="h-5 w-48 bg-slate-200 rounded-lg" />
          <div className="h-8 w-28 bg-slate-200 rounded-lg" />
        </div>

        {/* Skeleton Body Layout */}
        <div className="flex-1 flex max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 gap-8 animate-pulse">
          {/* Main Skeleton */}
          <div className="flex-1 max-w-4xl space-y-6">
            <div className="h-4 w-32 bg-purple-100 rounded-md" />
            <div className="h-10 w-3/4 bg-slate-200 rounded-xl" />
            <div className="h-4 w-40 bg-slate-100 rounded-md mb-8" />
            <div className="space-y-4 pt-4 border-t border-slate-200/80">
              <div className="h-5 w-full bg-slate-100 rounded-md" />
              <div className="h-5 w-5/6 bg-slate-100 rounded-md" />
              <div className="h-5 w-4/6 bg-slate-100 rounded-md" />
              <div className="h-48 w-full bg-slate-100 rounded-2xl my-6" />
              <div className="h-5 w-full bg-slate-100 rounded-md" />
              <div className="h-5 w-3/4 bg-slate-100 rounded-md" />
            </div>
          </div>

          {/* Sidebar Skeleton (Desktop) */}
          <div className="hidden lg:block w-80 shrink-0 space-y-4">
            <div className="h-6 w-36 bg-slate-200 rounded-md" />
            <div className="h-32 bg-white border border-slate-200 rounded-xl" />
            <div className="h-48 bg-white border border-slate-200 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !lessonData) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col items-center justify-center px-4 py-16 text-center max-w-md mx-auto">
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
          Lesson Unavailable
        </h1>
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          {error || "The requested lesson could not be loaded or is not published."}
        </p>
        <Link
          href={`/courses/${courseIdOrSlug}`}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition-all shadow-md shadow-purple-600/25"
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
    <div className="min-h-screen w-full bg-[#F8FAFC] text-slate-900 flex flex-col">
      {/* ── Top Header Navigation Bar ── */}
      <header className="sticky top-0 z-30 h-16 border-b border-slate-200/90 bg-white/90 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-4 min-w-0">
          <Link
            href={`/courses/${course.slug || course.id}`}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors shrink-0"
            title="Return to Course Syllabus"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">Course Syllabus</span>
          </Link>

          <span className="text-slate-300 hidden sm:inline">|</span>

          {/* Breadcrumb Context */}
          <div className="min-w-0 flex items-center gap-2 text-xs sm:text-sm">
            <span className="text-slate-500 truncate max-w-[120px] sm:max-w-[200px] hidden md:inline">
              {course.title}
            </span>
            <span className="text-slate-400 hidden md:inline">/</span>
            <span className="text-purple-700 font-semibold truncate max-w-[150px] sm:max-w-[240px]">
              {module.title}
            </span>
          </div>
        </div>

        {/* Right Nav Action: Outline Toggle for Mobile */}
        <div className="flex items-center gap-3">
          {courseProgress && (
            <span className="text-xs font-bold text-purple-700 hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-200/80">
              {courseProgress.completed_lessons}/{courseProgress.total_lessons} completed ({courseProgress.progress_percentage}%)
            </span>
          )}

          <button
            type="button"
            onClick={() => setMobileDrawerOpen(true)}
            className="lg:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all border border-slate-200"
            aria-label="Open course outline drawer"
          >
            <List className="w-4 h-4 text-purple-600" />
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
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-md border border-purple-200/80">
              Module {module.position} · Lesson {lesson.position}
            </span>
          </div>

          {/* Page H1: Single Authoritative Top Heading */}
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight mb-3">
            {lesson.title}
          </h1>

          {/* Estimated duration */}
          {lesson.estimated_duration_minutes && (
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 font-medium mb-8 pb-4 border-b border-slate-200/80">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>{lesson.estimated_duration_minutes} min read</span>
            </div>
          )}

          {/* Render All 12 Block Types via Dedicated Student Renderer */}
          <div className="mt-4 mb-12">
            <StudentLessonRenderer blocks={content.blocks} />
          </div>

          {/* ── Lesson Completion Controls (Phase 5) ── */}
          <div className="mb-12 p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">
                {isCompleted ? "Lesson Completed" : "Ready to mark complete?"}
              </h3>
              <p className="text-xs text-slate-600">
                {isCompleted
                  ? "You have completed this lesson. Progress is saved to your account."
                  : "Mark this lesson complete to track your overall course progress."}
              </p>
              {progressError && (
                <p className="text-xs text-rose-600 mt-2 font-medium">
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
                  ? "bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-300 text-emerald-700 shadow-xs"
                  : "bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/25 hover:scale-[1.01]"
              }`}
            >
              <CheckCircle2 className={`w-4 h-4 ${isCompleted ? "text-emerald-600" : "text-white"}`} />
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
            className="pt-8 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4"
          >
            {/* Previous Lesson Button */}
            {prev_lesson ? (
              <Link
                href={`/courses/${course.slug || course.id}/lessons/${prev_lesson.id}`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-700 hover:text-slate-900 transition-all text-sm font-semibold group shadow-xs"
              >
                <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:-translate-x-0.5 group-hover:text-purple-600 transition-all" />
                <div className="text-left">
                  <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                    Previous Lesson
                  </span>
                  <span className="truncate max-w-[200px] block text-slate-800 group-hover:text-purple-700 transition-colors">
                    {prev_lesson.title}
                  </span>
                </div>
              </Link>
            ) : (
              <div className="w-full sm:w-auto text-xs font-medium text-slate-400 py-2 sm:py-0 italic">
                First lesson in course
              </div>
            )}

            {/* Next Lesson Button */}
            {next_lesson ? (
              <Link
                href={`/courses/${course.slug || course.id}/lessons/${next_lesson.id}`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition-all shadow-md shadow-purple-600/25 hover:scale-[1.01] group"
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
              /* At last lesson — show quiz CTA if module has a quiz */
              (() => {
                const moduleQuiz = courseOutline?.modules
                  .find((m) => m.id === module.id)?.quiz;
                return moduleQuiz ? (
                  <Link
                    href={`/courses/${course.slug || course.id}/modules/${module.id}/quiz`}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition-all shadow-md shadow-purple-600/25 hover:scale-[1.01] group"
                    id="lesson-quiz-cta"
                  >
                    <div className="text-right">
                      <span className="block text-[10px] uppercase tracking-wider text-purple-200 font-bold">
                        Module Complete
                      </span>
                      <span className="block">Take the Module Quiz</span>
                    </div>
                    <HelpCircle className="w-4 h-4" />
                  </Link>
                ) : (
                  <div className="w-full sm:w-auto text-center sm:text-right px-4 py-2.5 rounded-xl bg-purple-50 border border-purple-200 text-xs font-semibold text-purple-700">
                    Course lessons complete
                  </div>
                );
              })()
            )}
          </nav>
        </main>

        {/* ── Desktop Course Content Sidebar ── */}
        <aside className="hidden lg:block w-80 shrink-0">
          <div className="sticky top-24 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs max-h-[calc(100vh-7rem)] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Course Content
                </h3>
              </div>
              {courseProgress && (
                <span className="text-xs font-bold text-purple-700">
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
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          Module {mIdx + 1}: {m.title}
                        </span>
                        {modProgress?.lessons_complete && (
                          <span className="text-[10px] font-bold text-emerald-600">
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
                                  ? "bg-purple-50 text-purple-700 border border-purple-200/90 font-bold shadow-2xs"
                                  : "text-slate-700 hover:text-purple-700 hover:bg-purple-50/50 border border-transparent"
                              }`}
                            >
                              <span className="truncate pr-2">{les.title}</span>
                              <div className="flex items-center gap-1.5 shrink-0">
                                {isLessonDone && (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                )}
                                {active && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
                                )}
                              </div>
                            </Link>
                          );
                        })}
                        {/* Quiz link in sidebar */}
                        {m.quiz && (
                          <Link
                            href={`/courses/${course.slug || course.id}/modules/${m.id}/quiz`}
                            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:text-purple-700 hover:bg-purple-50/50 transition-all"
                          >
                            <span className="flex items-center gap-1.5 truncate pr-2">
                              <HelpCircle className="w-3 h-3 text-purple-600 shrink-0" />
                              {m.quiz.title}
                            </span>
                          </Link>
                        )}
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
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileDrawerOpen(false)}
          />

          {/* Drawer Body */}
          <div className="relative ml-auto w-full max-w-xs sm:max-w-sm h-full bg-white border-l border-slate-200 shadow-2xl p-6 flex flex-col z-10 overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Course Outline
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
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
                        <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider block">
                          Module {mIdx + 1}: {m.title}
                        </span>
                        {modProgress?.lessons_complete && (
                          <span className="text-[10px] font-bold text-emerald-600">
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
                                  ? "bg-purple-50 text-purple-700 border border-purple-200 font-bold"
                                  : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                              }`}
                            >
                              <span className="truncate pr-2">{les.title}</span>
                              <div className="flex items-center gap-1.5 shrink-0">
                                {isLessonDone && (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                )}
                                {active && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
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
