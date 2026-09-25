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
} from "lucide-react";

import { fetchStudentLesson, fetchStudentCourseById } from "@/lib/api/courses";
import type { StudentLessonDetail, StudentCourseDetail } from "@/types/student-course";
import { StudentLessonRenderer } from "@/components/student/lesson-reader/StudentLessonRenderer";

export default function StudentLessonReaderPage() {
  const params = useParams();

  const courseIdOrSlug = params?.courseId as string;
  const lessonId = params?.lessonId as string;

  const [lessonData, setLessonData] = useState<StudentLessonDetail | null>(null);
  const [courseOutline, setCourseOutline] = useState<StudentCourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

      try {
        const [lData, cData] = await Promise.all([
          fetchStudentLesson(courseIdOrSlug, lessonId),
          fetchStudentCourseById(courseIdOrSlug).catch(() => null),
        ]);

        if (isMounted) {
          setLessonData(lData);
          setCourseOutline(cData);
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
  }, [courseIdOrSlug, lessonId]);

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

  // Active lesson helper
  const isCurrentLesson = (id: string) => id === lesson.id;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-purple-500/30">
      {/* ── Top Navigation Bar ── */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/80 backdrop-blur-md px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Back to Course & Breadcrumbs */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href={`/courses/${course.slug || course.id}`}
            className="p-2 -ml-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            aria-label="Back to course overview"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-400 truncate">
            <Link
              href="/courses"
              className="hover:text-slate-200 transition-colors hidden sm:inline"
            >
              Courses
            </Link>
            <span className="hidden sm:inline">/</span>
            <Link
              href={`/courses/${course.slug || course.id}`}
              className="hover:text-slate-200 transition-colors truncate max-w-[150px] sm:max-w-[200px]"
            >
              {course.title}
            </Link>
            <span>/</span>
            <span className="text-slate-200 font-semibold truncate max-w-[120px] sm:max-w-[180px]">
              {module.title}
            </span>
          </div>
        </div>

        {/* Right: Mobile Outline Toggle Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
            aria-label="Toggle Course Outline"
            className="lg:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-all"
          >
            <List className="w-3.5 h-3.5 text-purple-400" />
            <span>Course Content</span>
          </button>
        </div>
      </header>

      {/* ── Main Layout (Content + Sticky Desktop Sidebar) ── */}
      <div className="flex-1 flex max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-10 gap-8">
        {/* Main Lesson Article Area */}
        <main className="flex-1 min-w-0 max-w-4xl mx-auto">
          {/* Module Eyebrow Context */}
          <div className="mb-2">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-purple-400">
              {module.title} · Lesson {lesson.position}
            </span>
          </div>

          {/* Primary Page Heading (H1) */}
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-4">
            {lesson.title}
          </h1>

          {/* Lesson Metadata */}
          {lesson.estimated_duration_minutes && (
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-400 font-medium mb-8 pb-4 border-b border-white/10">
              <Clock className="w-4 h-4 text-slate-500" />
              <span>{lesson.estimated_duration_minutes} min read</span>
            </div>
          )}

          {/* Render All 12 Block Types via Dedicated Student Renderer */}
          <div className="mt-4 mb-16">
            <StudentLessonRenderer blocks={content.blocks} />
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
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 hover:text-white transition-all text-sm font-semibold group shadow-sm"
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
            </div>

            {courseOutline?.modules && (
              <div className="space-y-4">
                {courseOutline.modules.map((m, mIdx) => (
                  <div key={m.id} className="space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block px-2 mb-1">
                      Module {mIdx + 1}: {m.title}
                    </span>

                    <div className="space-y-0.5">
                      {m.lessons.map((les) => {
                        const active = isCurrentLesson(les.id);
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
                            {active && (
                              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
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
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
                aria-label="Close outline drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {courseOutline?.modules && (
              <div className="space-y-6 flex-1">
                {courseOutline.modules.map((m, mIdx) => (
                  <div key={m.id} className="space-y-1.5">
                    <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider block">
                      Module {mIdx + 1}: {m.title}
                    </span>

                    <div className="space-y-1">
                      {m.lessons.map((les) => {
                        const active = isCurrentLesson(les.id);
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
                            {active && (
                              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
