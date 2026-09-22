"use client";

import React from "react";
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
} from "lucide-react";

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
  return (
    <div className="min-h-[82vh] flex flex-col justify-center max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* ── Top Bar: Back to Dashboard ── */}
      <motion.div
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6 sm:mb-8"
      >
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200/80 text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-950 hover:bg-slate-50 transition-all shadow-xs group"
        >
          <ArrowLeft className="w-4 h-4 text-slate-500 group-hover:-translate-x-0.5 transition-transform" />
          Back to Dashboard
        </Link>
      </motion.div>

      {/* ── Main Hero Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="relative bg-white rounded-3xl sm:rounded-[32px] p-6 sm:p-10 lg:p-12 border border-slate-100 shadow-[0_12px_44px_rgba(0,0,0,0.04)] overflow-hidden text-center"
      >
        {/* Ambient background glow */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-purple-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />

        {/* 3D Illustration */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15, type: "spring", stiffness: 320 }}
          className="relative w-22 h-22 sm:w-28 sm:h-28 mx-auto mb-4 sm:mb-5"
        >
          <div className="w-full h-full rounded-3xl bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 flex items-center justify-center p-3 shadow-inner border border-purple-100/50">
            <div className="relative w-full h-full">
              <Image
                src="/images/hub/courses.png"
                alt="Courses 3D Cap"
                fill
                className="object-contain drop-shadow-md"
                priority
              />
            </div>
          </div>
        </motion.div>

        {/* Soon Revealing Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200/60 text-purple-700 text-xs sm:text-sm font-extrabold uppercase tracking-wider mb-3 shadow-xs"
        >
          <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
          Soon Revealing
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight max-w-2xl mx-auto"
        >
          Web Development Courses Are On The Way
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-xs sm:text-base text-slate-500 font-medium max-w-xl mx-auto mt-2.5 sm:mt-3 leading-relaxed"
        >
          We are preparing immersive, project-driven video modules with live interactive code playgrounds.
          Master frontend development from fundamental syntax to modern enterprise architecture.
        </motion.p>

        {/* ── Downside Courses: HTML5, CSS3, JavaScript, React with 100% Original Logos ── */}
        <div className="mt-8 sm:mt-11 text-left border-t border-slate-100 pt-7 sm:pt-9">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-600" />
              Core Curriculum Tracks
            </h2>
            <span className="text-[11px] font-semibold text-slate-400">4 Modules In Development</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
            {coreCourses.map((course, idx) => (
              <motion.div
                key={course.name}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 + idx * 0.08 }}
                className={`group p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 ${course.borderHover} hover:shadow-lg ${course.glowColor} transition-all duration-300 flex items-start gap-3.5 sm:gap-4`}
              >
                {/* 100% Original Brand Logo Badge */}
                <div
                  className={`w-13 h-13 rounded-2xl ${course.logoBg} border border-slate-100/90 flex items-center justify-center shrink-0 p-2.5 group-hover:scale-108 transition-transform duration-300 shadow-xs relative`}
                >
                  <div className="relative w-8 h-8">
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
        </div>

        {/* ── Quick Alternative Pathways ── */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs font-semibold text-slate-500">
          <span>Explore active platform features:</span>
          <Link
            href="/learning"
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-600" />
            Learn Playlists
          </Link>
          <Link
            href="/practice"
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1.5"
          >
            <Code2 className="w-3.5 h-3.5 text-emerald-600" />
            Practice Questions
          </Link>
          <Link
            href="/roadmaps"
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1.5"
          >
            <Compass className="w-3.5 h-3.5 text-purple-600" />
            Career Roadmaps
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
