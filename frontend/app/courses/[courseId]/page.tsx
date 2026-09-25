"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Clock,
  GraduationCap,
  PlayCircle,
  HelpCircle,
  AlertCircle,
  Layers,
  ChevronRight,
  CheckCircle2,
  Lock,
  RotateCcw,
  Trophy,
  XCircle,
  Star,
} from "lucide-react";

import { useAuth } from "@/lib/auth";
import { fetchStudentCourseById, fetchCourseProgress, fetchQuizAttempts, fetchModuleProgress } from "@/lib/api/courses";
import type { StudentCourseDetail, StudentCourseProgress } from "@/types/course";
import type { QuizAttemptHistory, StudentModuleProgress } from "@/types/quiz-attempt";

export default function StudentCourseDetailPage() {
  const params = useParams();
  const courseIdOrSlug = params?.courseId as string;
  const { session } = useAuth();

  const [course, setCourse] = useState<StudentCourseDetail | null>(null);
  const [progress, setProgress] = useState<StudentCourseProgress | null>(null);
  const [moduleProgressMap, setModuleProgressMap] = useState<Record<string, StudentModuleProgress>>({});
  const [moduleHistoryMap, setModuleHistoryMap] = useState<Record<string, QuizAttemptHistory>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        }

        // If authenticated, fetch personal student progress + Phase 6 quiz state
        if (session?.user_id) {
          try {
            const pData = await fetchCourseProgress(courseIdOrSlug);
            if (isMounted) setProgress(pData);

            // Load per-module quiz progress and attempt history in parallel
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
            // Non-blocking: progress failure should never prevent reading course details
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

  // Loading Skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto animate-pulse">
        <div className="h-9 w-36 bg-white/10 rounded-xl mb-8" />
        <div className="h-6 w-24 bg-purple-500/20 rounded-full mb-4" />
        <div className="h-10 sm:h-12 w-3/4 bg-white/10 rounded-2xl mb-4" />
        <div className="h-5 w-2/3 bg-white/5 rounded-xl mb-6" />
        <div className="flex gap-3 mb-10">
          <div className="h-8 w-24 bg-white/10 rounded-lg" />
          <div className="h-8 w-24 bg-white/10 rounded-lg" />
          <div className="h-8 w-24 bg-white/10 rounded-lg" />
        </div>
        <div className="h-12 w-48 bg-purple-600/30 rounded-xl mb-12" />
        <div className="space-y-4">
          <div className="h-28 bg-white/5 rounded-2xl border border-white/5" />
          <div className="h-28 bg-white/5 rounded-2xl border border-white/5" />
        </div>
      </div>
    );
  }

  // Error State
  if (error || !course) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 text-center max-w-md mx-auto">
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">
          Course Not Available
        </h1>
        <p className="text-sm text-slate-400 mb-6 leading-relaxed">
          {error || "The requested course could not be found or has not been published yet."}
        </p>
        <Link
          href="/courses"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-sm transition-all border border-white/10"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Courses
        </Link>
      </div>
    );
  }

  // Find first lesson for fallback CTA
  let firstLessonId: string | null = null;
  for (const m of course.modules) {
    if (m.lessons && m.lessons.length > 0) {
      firstLessonId = m.lessons[0].id;
      break;
    }
  }

  // Resume lesson resolution
  const resumeLessonId = progress?.last_lesson_id || firstLessonId;
  const hasProgress = Boolean(
    progress && (progress.completed_lessons > 0 || progress.last_lesson_id)
  );
  const isAllLessonsCompleted = Boolean(
    progress &&
    progress.total_lessons > 0 &&
    progress.completed_lessons === progress.total_lessons
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-6 sm:py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Courses
          </Link>
        </div>

        {/* Hero Header */}
        <header className="relative rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900/90 to-purple-950/20 p-6 sm:p-10 shadow-2xl mb-8 overflow-hidden">
          <div className="relative z-10">
            {/* Category & Difficulty Badges */}
            <div className="flex flex-wrap items-center gap-2.5 mb-4">
              {course.category && (
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {course.category}
                </span>
              )}
              <span className="px-3 py-1 rounded-full text-xs font-bold capitalize bg-slate-800 text-slate-300 border border-white/10">
                {course.difficulty}
              </span>
              {course.estimated_duration_minutes && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-white/10">
                  <Clock className="w-3.5 h-3.5 text-purple-400" />
                  {course.estimated_duration_minutes} min
                </span>
              )}
            </div>

            {/* Course Title */}
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-4">
              {course.title}
            </h1>

            {/* Course Description */}
            <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed mb-6 font-normal">
              {course.short_description || course.description || "Master core concepts and advance your skills through structured learning."}
            </p>

            {/* Student Course Progress Bar (Phase 5) */}
            {progress && (
              <div className="mb-6 p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-2">
                  <span className="text-xs sm:text-sm font-bold text-slate-200 uppercase tracking-wider">
                    Course Progress
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-purple-300">
                    {progress.completed_lessons} of {progress.total_lessons} lessons completed ({progress.progress_percentage}%)
                  </span>
                </div>
                <div
                  role="progressbar"
                  aria-valuenow={progress.progress_percentage}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Course completion progress"
                  className="w-full h-3 bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/5"
                >
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-emerald-400 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(0, progress.progress_percentage))}%` }}
                  />
                </div>
              </div>
            )}

            {/* Quick Stats & CTA */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/10">
              <div className="flex items-center gap-4 text-xs sm:text-sm text-slate-400 font-medium">
                <span className="flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-purple-400" />
                  {course.modules_count} {course.modules_count === 1 ? "Module" : "Modules"}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-blue-400" />
                  {course.lessons_count} {course.lessons_count === 1 ? "Lesson" : "Lessons"}
                </span>
              </div>

              {resumeLessonId ? (
                <Link
                  href={`/courses/${course.slug || course.id}/lessons/${resumeLessonId}`}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-lg shadow-purple-600/30 hover:scale-[1.02] transition-all"
                >
                  <PlayCircle className="w-4 h-4" />
                  {hasProgress
                    ? isAllLessonsCompleted
                      ? "Review Course"
                      : "Continue Learning"
                    : "Start Learning"}
                </Link>
              ) : (
                <span className="text-xs font-semibold px-4 py-2 rounded-xl bg-white/5 text-slate-400 border border-white/10">
                  Curriculum in preparation
                </span>
              )}
            </div>
          </div>
        </header>

        {/* Course Syllabus / Curriculum Outline */}
        <section className="space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-purple-400" />
                Course Curriculum
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Explore all modules, progress status, and sequential lessons.
              </p>
            </div>
          </div>

          {course.modules.length === 0 ? (
            <div className="p-8 text-center rounded-2xl border border-white/10 bg-slate-900/30">
              <p className="text-slate-400 text-sm">
                No modules published yet for this course.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {course.modules.map((module, mIdx) => {
                const modProgress = progress?.modules.find((m) => m.module_id === module.id);

                return (
                  <div
                    key={module.id}
                    className="rounded-2xl border border-white/10 bg-slate-900/40 overflow-hidden"
                  >
                    {/* Module Header */}
                    <div className="p-5 sm:p-6 bg-slate-900/80 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                          Module {mIdx + 1}
                        </span>
                        <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">
                          {module.title}
                        </h3>
                        {module.description && (
                          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
                            {module.description}
                          </p>
                        )}
                      </div>

                      {/* Module-level Lesson Progress */}
                      <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                        {modProgress?.lessons_complete && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            Lessons Complete
                          </span>
                        )}
                        <span className="text-xs text-slate-400 font-medium">
                          {modProgress
                            ? `${modProgress.completed_lessons} / ${modProgress.total_lessons} lessons`
                            : `${module.lessons.length} ${module.lessons.length === 1 ? "lesson" : "lessons"}`}
                        </span>
                      </div>
                    </div>

                    {/* Lessons List */}
                    <div className="divide-y divide-white/5">
                      {module.lessons.map((lesson, lIdx) => {
                        const isCompleted = progress?.completed_lesson_ids?.includes(lesson.id);
                        const isResume = progress?.last_lesson_id === lesson.id;

                        return (
                          <Link
                            key={lesson.id}
                            href={`/courses/${course.slug || course.id}/lessons/${lesson.id}`}
                            className="group flex items-center justify-between p-4 sm:px-6 hover:bg-white/[0.03] transition-colors"
                          >
                            <div className="flex items-center gap-3.5 min-w-0 pr-3">
                              {isCompleted ? (
                                <span
                                  aria-label="Completed lesson"
                                  className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center justify-center shrink-0 border border-emerald-500/30"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                </span>
                              ) : isResume ? (
                                <span
                                  aria-label="Current resume lesson"
                                  className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-300 text-xs font-semibold flex items-center justify-center shrink-0 border border-purple-500/30"
                                >
                                  <ArrowRight className="w-4 h-4" />
                                </span>
                              ) : (
                                <span className="w-7 h-7 rounded-lg bg-white/5 text-slate-400 text-xs font-semibold flex items-center justify-center shrink-0 group-hover:bg-purple-500/20 group-hover:text-purple-300 transition-colors">
                                  {lIdx + 1}
                                </span>
                              )}

                              <div className="min-w-0">
                                <h4 className="text-sm sm:text-base font-medium text-slate-200 group-hover:text-white truncate transition-colors">
                                  {lesson.title}
                                </h4>
                                {lesson.short_description && (
                                  <p className="text-xs text-slate-500 truncate max-w-md mt-0.5">
                                    {lesson.short_description}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              {isCompleted && (
                                <span className="text-[11px] font-semibold text-emerald-400/90 hidden sm:inline-block">
                                  Completed
                                </span>
                              )}
                              {isResume && !isCompleted && (
                                <span className="text-[11px] font-semibold text-purple-300/90 hidden sm:inline-block">
                                  Resume Here
                                </span>
                              )}
                              {lesson.estimated_duration_minutes && (
                                <span className="text-xs text-slate-500 flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-slate-500" />
                                  {lesson.estimated_duration_minutes}m
                                </span>
                              )}
                              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all" />
                            </div>
                          </Link>
                        );
                      })}

                      {/* Module Quiz — Phase 6 Live State */}
                      {module.quiz && (() => {
                        const modProg = moduleProgressMap[module.id];
                        const modHist = moduleHistoryMap[module.id];
                        const quizPassed = modProg?.quiz_passed || modHist?.ever_passed || false;
                        const lessonsComplete = modProg?.lessons_complete || modProgress?.lessons_complete || false;
                        const bestScore = modProg?.best_score ?? modHist?.best_score ?? null;
                        const latestAttempt = modHist?.attempts?.length
                          ? modHist.attempts[modHist.attempts.length - 1]
                          : null;
                        const quizTaken = (modHist?.attempts?.length ?? 0) > 0;

                        return (
                          <div className="border-t border-purple-500/10">
                            <div className="p-4 sm:px-6 bg-purple-950/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="flex items-center gap-2.5">
                                <HelpCircle className="w-4 h-4 text-purple-400 shrink-0" />
                                <div>
                                  <span className="font-semibold text-sm text-slate-200">
                                    {module.quiz.title}
                                  </span>
                                  {quizPassed && bestScore !== null && (
                                    <p className="text-[11px] text-emerald-400 font-medium mt-0.5">
                                      Best score: {bestScore}%
                                    </p>
                                  )}
                                  {!quizPassed && latestAttempt && !quizPassed && (
                                    <p className="text-[11px] text-rose-400 font-medium mt-0.5">
                                      Last attempt: {latestAttempt.score_percentage}% — Failed
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                {/* State badges & actions */}
                                {quizPassed ? (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                    <Trophy className="w-3 h-3" />
                                    Passed
                                  </span>
                                ) : !session?.user_id ? (
                                  <span className="text-[11px] font-medium text-slate-400">Sign in to take quiz</span>
                                ) : !lessonsComplete ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-800 text-slate-400 border border-white/10">
                                    <Lock className="w-3 h-3" />
                                    Complete lessons to unlock
                                  </span>
                                ) : quizTaken ? (
                                  <Link
                                    href={`/courses/${courseIdOrSlug}/modules/${module.id}/quiz`}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/20 transition-all"
                                  >
                                    <RotateCcw className="w-3 h-3" />
                                    Retry Quiz
                                  </Link>
                                ) : (
                                  <Link
                                    href={`/courses/${courseIdOrSlug}/modules/${module.id}/quiz`}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/20 transition-all"
                                  >
                                    <HelpCircle className="w-3 h-3" />
                                    Take Quiz
                                  </Link>
                                )}
                              </div>
                            </div>

                            {/* Module Complete Banner */}
                            {modProg?.completed && (
                              <div className="mx-4 mb-4 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-bold">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Module Complete
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
