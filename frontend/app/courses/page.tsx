"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  Code2,
  Compass,
  Sparkles,
  Clock,
  TrendingUp,
  Briefcase,
  GraduationCap,
  Layers,
  ChevronRight,
} from "lucide-react";

import { fetchStudentCourses } from "@/lib/api/courses";
import type { StudentCourseSummary } from "@/types/student-course";

// ── Course Data with 100% Authentic Original Logos ────────────────────────────

const coreCourses = [
  {
    name: "HTML5",
    category: "Structure & Semantics",
    desc: "Semantic elements, accessible forms, audio/video APIs, SEO best practices, and document structure.",
    logoSrc: "/images/courses/html5.svg",
    badgeColor: "bg-orange-50 text-orange-700 border-orange-200/80",
    borderHover: "hover:border-orange-300",
    glowColor: "group-hover:shadow-orange-500/10",
    logoBg: "bg-orange-50",
  },
  {
    name: "CSS3",
    category: "Styling & Responsive Layouts",
    desc: "Flexbox, CSS Grid, 3D animations, responsive viewports, custom properties, and modern design systems.",
    logoSrc: "/images/courses/css3.svg",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200/80",
    borderHover: "hover:border-blue-300",
    glowColor: "group-hover:shadow-blue-500/10",
    logoBg: "bg-blue-50",
  },
  {
    name: "JavaScript",
    category: "Core Logic & Async Programming",
    desc: "ES6+ syntax, closures, prototypes, asynchronous Promises, Event Loop, DOM manipulation, and APIs.",
    logoSrc: "/images/courses/javascript.svg",
    badgeColor: "bg-amber-50 text-amber-800 border-amber-200/80",
    borderHover: "hover:border-amber-300",
    glowColor: "group-hover:shadow-yellow-500/10",
    logoBg: "bg-amber-50",
  },
  {
    name: "React",
    category: "Component Architecture & Hooks",
    desc: "Virtual DOM, JSX, custom hooks, state orchestration, server components, and Next.js full-stack patterns.",
    logoSrc: "/images/courses/react.svg",
    badgeColor: "bg-cyan-50 text-cyan-800 border-cyan-200/80",
    borderHover: "hover:border-cyan-300",
    glowColor: "group-hover:shadow-cyan-500/10",
    logoBg: "bg-cyan-50/70",
  },
];

export default function CoursesPage() {
  const [publishedCourses, setPublishedCourses] = useState<StudentCourseSummary[]>([]);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const res = await fetchStudentCourses({ page_size: 20 });
        if (isMounted) {
          setPublishedCourses(res.items || []);
        }
      } catch {
        // Fall back gracefully if none published or network fails
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-[82vh] flex flex-col justify-start max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* ── Top Bar: Back to Dashboard ── */}
      <motion.div
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-4 sm:mb-6 flex items-center justify-between"
      >
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200/80 text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-950 hover:bg-slate-50 transition-all shadow-2xs group"
        >
          <ArrowLeft className="w-4 h-4 text-slate-500 group-hover:-translate-x-0.5 transition-transform" />
          Back to Dashboard
        </Link>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50/80 border border-purple-200/60 text-purple-700 text-[11px] sm:text-xs font-bold uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
          Curated Courses
        </div>
      </motion.div>

      {/* ── Head Card: Courses Hero Banner (Vector-Sharp Typography & 3D Laptop Visual) ── */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="relative w-full rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-gradient-to-br from-white via-[#FCFDFF] to-[#FAF8FF] shadow-[0_12px_44px_rgba(99,102,241,0.06)] overflow-hidden mb-6 sm:mb-8 group"
      >
        {/* Subtle ambient light glows */}
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-purple-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row items-center justify-between gap-6 p-6 sm:p-8 lg:p-10">
          {/* Left Column: 100% Vector-Sharp Typography & Badges */}
          <div className="w-full md:w-[48%] flex flex-col items-start text-left z-10">
            {/* Logo / Brand Mark */}
            <div className="flex items-center gap-1.5 mb-2 sm:mb-3">
              <span className="text-sm sm:text-base font-black tracking-tight text-slate-900">
                Skills<span className="text-purple-600">Catalyst</span>
              </span>
            </div>

            {/* Main Headline: Huge, Sharp, Bold */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-none mb-2.5 sm:mb-3.5">
              Courses
            </h1>

            {/* Subtitle */}
            <p className="text-xs sm:text-sm lg:text-base text-slate-600 font-medium max-w-sm sm:max-w-md leading-relaxed mb-5 sm:mb-7">
              Explore curated paths to learn, build and grow your skills.
            </p>

            {/* 3 Authentic Feature Badges: Curated Paths, Progress Tracking, Career Focused */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:py-2 rounded-xl bg-purple-50/80 border border-purple-100/90 shadow-2xs hover:scale-102 transition-transform">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <BookOpen className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </div>
                <div className="text-left leading-tight">
                  <p className="text-[10.5px] sm:text-[11.5px] font-extrabold text-slate-900">Curated</p>
                  <p className="text-[9.5px] sm:text-[10px] font-semibold text-slate-500">Paths</p>
                </div>
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:py-2 rounded-xl bg-blue-50/80 border border-blue-100/90 shadow-2xs hover:scale-102 transition-transform">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </div>
                <div className="text-left leading-tight">
                  <p className="text-[10.5px] sm:text-[11.5px] font-extrabold text-slate-900">Progress</p>
                  <p className="text-[9.5px] sm:text-[10px] font-semibold text-slate-500">Tracking</p>
                </div>
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:py-2 rounded-xl bg-amber-50/80 border border-amber-100/90 shadow-2xs hover:scale-102 transition-transform">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Briefcase className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </div>
                <div className="text-left leading-tight">
                  <p className="text-[10.5px] sm:text-[11.5px] font-extrabold text-slate-900">Career</p>
                  <p className="text-[9.5px] sm:text-[10px] font-semibold text-slate-500">Focused</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: High-Res 3D Laptop with Studio Lighting */}
          <div className="w-full md:w-[52%] flex items-center justify-center relative">
            <div className="relative w-full aspect-[649/436] max-w-[520px] transition-transform duration-300 group-hover:scale-[1.015]">
              <Image
                src="/images/courses/laptop-3d-retina.png"
                alt="SkillsCatalyst Interactive Learning Journey on Laptop"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 520px"
                className="object-contain w-full h-full select-none drop-shadow-md"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Published Interactive Courses (Phase 4) ── */}
      {publishedCourses.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 lg:p-10 border border-slate-200/80 shadow-[0_8px_32px_rgba(0,0,0,0.03)] overflow-hidden mb-6 sm:mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
                  <GraduationCap className="w-4 h-4" />
                </span>
                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  Available Courses
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Structured courses with rich lessons, interactive visual blocks, and curriculum navigation.
              </p>
            </div>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 self-start sm:self-auto">
              {publishedCourses.length} {publishedCourses.length === 1 ? "Course Available" : "Courses Available"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
            {publishedCourses.map((c) => (
              <Link
                key={c.id}
                href={`/courses/${c.slug || c.id}`}
                className="group p-5 rounded-2xl bg-white border border-slate-200 hover:border-purple-300 hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-100">
                      {c.category || "General"}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500 capitalize">
                      {c.difficulty}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-purple-600 transition-colors mb-1.5">
                    {c.title}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                    {c.short_description || c.description || "Start learning this course today."}
                  </p>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-slate-400" />
                      {c.modules_count} {c.modules_count === 1 ? "Module" : "Modules"}
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                      {c.lessons_count} {c.lessons_count === 1 ? "Lesson" : "Lessons"}
                    </span>
                  </div>
                  <span className="font-bold text-purple-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                    Explore <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Core Curriculum Tracks & Interactive Modules ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 25 }}
        className="relative bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 lg:p-10 border border-slate-200/80 shadow-[0_8px_32px_rgba(0,0,0,0.03)] overflow-hidden"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 sm:pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-purple-50 text-purple-600 border border-purple-100">
                <Sparkles className="w-4 h-4" />
              </span>
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Core Curriculum Tracks
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Structured frontend & full-stack development paths with interactive playgrounds.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
              4 Modules In Development
            </span>
          </div>
        </div>

        {/* Tracks Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 mt-5 sm:mt-6">
          {coreCourses.map((course, idx) => (
            <motion.div
              key={course.name}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + idx * 0.06 }}
              className={`group p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 ${course.borderHover} hover:shadow-lg ${course.glowColor} transition-all duration-300 flex items-start gap-3.5 sm:gap-4`}
            >
              {/* Brand Logo Badge */}
              <div
                className={`w-12 h-12 sm:w-13 sm:h-13 rounded-2xl ${course.logoBg} border border-slate-100/90 flex items-center justify-center shrink-0 p-2.5 group-hover:scale-105 transition-transform duration-300 shadow-xs relative`}
              >
                <div className="relative w-7 h-7 sm:w-8 sm:h-8">
                  <Image
                    src={course.logoSrc}
                    alt={`${course.name} Official Logo`}
                    fill
                    className="object-contain"
                  />
                </div>
              </div>

              {/* Course Details */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 group-hover:text-purple-700 transition-colors">
                    {course.name}
                  </h3>
                  <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full border shrink-0 flex items-center gap-1 ${course.badgeColor}`}>
                    <Clock className="w-2.5 h-2.5" />
                    Soon Revealing
                  </span>
                </div>

                <p className="text-[11px] font-bold text-slate-400 mb-1">
                  {course.category}
                </p>

                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  {course.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Quick Alternative Pathways ── */}
        <div className="mt-7 sm:mt-8 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 text-xs font-semibold text-slate-500">
          <span>Explore active platform features:</span>
          <Link
            href="/learning"
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-600" />
            Learn Playlists
          </Link>
          <Link
            href="/practice"
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Code2 className="w-3.5 h-3.5 text-emerald-600" />
            Practice Questions
          </Link>
          <Link
            href="/roadmaps"
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Compass className="w-3.5 h-3.5 text-purple-600" />
            Career Roadmaps
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
