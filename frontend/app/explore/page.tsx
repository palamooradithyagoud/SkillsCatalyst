"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sparkles,
  TrendingUp,
  Briefcase,
  Flame,
  Award,
  BookOpen,
  Code2,
  Building2,
  ChevronRight,
  Search,
  Zap,
  Globe,
  Star,
  Play,
  Terminal,
  Trophy,
} from "lucide-react";

// Mock data items for Netflix/Spotify style rich feed
const AI_PICKS = [
  {
    id: "fullstack-ai",
    title: "Full-Stack AI Engineer 2026",
    category: "Career Track",
    level: "Advanced",
    duration: "12 Weeks",
    gradient: "from-blue-600 via-indigo-600 to-purple-600",
    badge: "🔥 98% Match",
    href: "/roadmaps",
  },
  {
    id: "system-design",
    title: "System Design for FAANG & Scale",
    category: "Masterclass",
    level: "Intermediate",
    duration: "6 Weeks",
    gradient: "from-purple-600 via-pink-600 to-rose-600",
    badge: "⭐ Top Rated",
    href: "/learning",
  },
  {
    id: "dsa-patterns",
    title: "Top 75 LeetCode Patterns",
    category: "Placement Prep",
    level: "All Levels",
    duration: "40 Hours",
    gradient: "from-cyan-600 via-teal-600 to-emerald-600",
    badge: "🚀 Placement Hot",
    href: "/practice",
  },
];

const TRENDING_SKILLS = [
  { name: "Next.js 16 App Router", icon: Code2, count: "48 Courses", tag: "Frontend" },
  { name: "Python LLM Fine-tuning", icon: Sparkles, count: "62 Courses", tag: "AI/ML" },
  { name: "FastAPI & Async Python", icon: Terminal, count: "35 Courses", tag: "Backend" },
  { name: "PostgreSQL & Supabase RLS", icon: Globe, count: "29 Courses", tag: "Database" },
  { name: "Docker & Kubernetes DevOps", icon: Zap, count: "42 Courses", tag: "DevOps" },
];

const CAREER_TRACKS = [
  {
    title: "Frontend Developer Track",
    skills: ["React 19", "TypeScript", "Next.js", "Tailwind"],
    companyFav: "Meta, Vercel, Stripe",
    gradient: "from-blue-500/20 to-cyan-500/10",
    borderColor: "border-blue-500/30",
  },
  {
    title: "Backend Architect Track",
    skills: ["Python", "FastAPI", "PostgreSQL", "Docker"],
    companyFav: "Amazon, Uber, Netflix",
    gradient: "from-purple-500/20 to-indigo-500/10",
    borderColor: "border-purple-500/30",
  },
  {
    title: "AI & ML Specialist",
    skills: ["Python", "PyTorch", "LangChain", "Groq API"],
    companyFav: "OpenAI, Google, Anthropic",
    gradient: "from-emerald-500/20 to-teal-500/10",
    borderColor: "border-emerald-500/30",
  },
];

const POPULAR_COURSES = [
  { title: "Complete Python Mastery 2026", instructor: "Telusko", rating: "4.9", videos: "54 Videos", level: "Beginner - Advanced", color: "border-cyan-500/30" },
  { title: "Aptitude & Logical Reasoning Sprint", instructor: "SkillsCatalyst Team", rating: "4.8", videos: "41 Practice Sets", level: "Placement", color: "border-purple-500/30" },
  { title: "Data Structures & Algorithms in C++", instructor: "Striver", rating: "5.0", videos: "120 Videos", level: "Intermediate", color: "border-blue-500/30" },
];

const TOP_COMPANIES = [
  { name: "Google", role: "Software Engineer", open: "140+ Questions" },
  { name: "Microsoft", role: "Full Stack Dev", open: "110+ Questions" },
  { name: "Amazon", role: "SDE I & II", open: "195+ Questions" },
  { name: "TCS", role: "Ninja & Digital", open: "85+ Questions" },
];

const HACKATHONS = [
  { title: "Global AI Innovators 2026", prize: "₹10,00,000", status: "Live Now", tag: "AI/ML" },
  { title: "Next.js Web3 Hackathon", prize: "₹5,00,000", status: "Starts in 3 Days", tag: "FullStack" },
];

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-7xl mx-auto space-y-6 pb-12"
    >
      {/* ── Top Floating Mobile Search Ba      {/* ── Top Floating Search Bar Header ── */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-md flex flex-col gap-3.5 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-row items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/30 shrink-0">
              <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none">Explore</h1>
              <p className="text-slate-500 text-[11px] sm:text-sm font-semibold mt-0.5">
                Curated roadmaps &amp; skill paths
              </p>
            </div>
          </div>

          <span className="px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-black bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white flex items-center gap-1 sm:gap-1.5 shadow-md shadow-orange-500/25 shrink-0">
            <Flame className="w-3.5 h-3.5 text-white fill-white" />
            <span>Trending</span>
          </span>
        </div>

        {/* Floating Search Input */}
        <div className="relative mt-0.5 z-10">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search skills, companies, topics..."
            className="w-full bg-slate-50 border border-slate-200/90 focus:border-indigo-500 focus:bg-white text-slate-900 font-extrabold placeholder:text-slate-400 text-xs sm:text-sm pl-10 pr-3.5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl transition-all shadow-2xs outline-none"
          />
        </div>
      </div>

      {/* ── 1. Hero AI Picks Carousel (Compact Poster Cards on Smartphone) ── */}
      <div className="space-y-2.5 sm:space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-[11px] sm:text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-1.5 sm:gap-2">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600" />
            <span>AI Recommended for You</span>
          </h2>
          <span className="text-[10px] sm:text-[11px] text-slate-400 font-extrabold">Swipe →</span>
        </div>

        <div className="flex gap-3 sm:gap-4 overflow-x-auto no-scrollbar mobile-touch-scroll pb-2 snap-x snap-mandatory px-0.5">
          {AI_PICKS.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="card-morph snap-start flex-shrink-0 w-[200px] sm:w-[330px] bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 border border-slate-200/90 relative overflow-hidden group hover:shadow-xl shadow-sm flex flex-col justify-between space-y-3"
            >
              {/* Vibrant ambient glow */}
              <div
                className={`absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br ${item.gradient} opacity-15 rounded-full blur-xl group-hover:opacity-30 transition-opacity pointer-events-none`}
              />

              <div className="relative z-10 space-y-2">
                <div className="flex items-center justify-between gap-1 flex-wrap">
                  <span className="px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-black bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xs">
                    {item.category}
                  </span>
                  <span className="text-[9px] sm:text-[11px] font-black bg-amber-100/90 text-amber-900 border border-amber-300/80 px-2 py-0.5 rounded-full shadow-2xs">
                    {item.badge}
                  </span>
                </div>

                <div>
                  <h3 className="text-xs sm:text-lg font-black text-slate-900 leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2">
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-slate-600 mt-1.5 font-extrabold">
                    <span className="bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/80">{item.level}</span>
                    <span>•</span>
                    <span className="bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/80">{item.duration}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] sm:text-xs font-black text-indigo-600 group-hover:translate-x-1 transition-transform relative z-10">
                <span>Start Learning</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── 2. Trending Skill Chips Carousel ── */}
      <div className="space-y-2.5 sm:space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-[11px] sm:text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-1.5 sm:gap-2">
            <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
            <span>Top Tech Stack Skills</span>
          </h2>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3 overflow-x-auto no-scrollbar mobile-touch-scroll pb-1">
          {TRENDING_SKILLS.map((skill) => {
            const Icon = skill.icon;
            return (
              <Link
                key={skill.name}
                href="/learning"
                className="flex-shrink-0 flex items-center gap-2.5 px-3 py-2 sm:px-4 sm:py-3 rounded-xl sm:rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/90 text-xs font-bold text-slate-700 hover:text-slate-950 transition-all shadow-2xs hover:shadow-md cursor-pointer"
              >
                <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-2xs shrink-0">
                  <Icon className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 text-white" />
                </div>
                <div>
                  <div className="font-extrabold text-slate-900 text-[11px] sm:text-xs whitespace-nowrap">{skill.name}</div>
                  <div className="text-[9px] sm:text-[10px] text-slate-500 font-bold mt-0.5">{skill.count}</div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── 3. Career Tracks Carousel ── */}
      <div className="space-y-2.5 sm:space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-[11px] sm:text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-1.5 sm:gap-2">
            <Briefcase className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600" />
            <span>Target Career Tracks</span>
          </h2>
          <Link href="/roadmaps" className="text-[11px] sm:text-xs text-indigo-600 font-black hover:underline">
            All Tracks →
          </Link>
        </div>

        <div className="flex gap-3 sm:gap-4 overflow-x-auto no-scrollbar mobile-touch-scroll pb-2 snap-x snap-mandatory px-0.5">
          {CAREER_TRACKS.map((track) => (
            <div
              key={track.title}
              className="snap-start flex-shrink-0 w-[200px] sm:w-[310px] bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 border border-slate-200/90 flex flex-col justify-between shadow-sm space-y-3 hover:shadow-lg transition-all"
            >
              <div>
                <div className="text-xs sm:text-base font-black text-slate-900 mb-2 leading-snug">{track.title}</div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {track.skills.map((s) => (
                    <span
                      key={s}
                      className="px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-2xs"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-[10px] sm:text-[11px] text-slate-600 font-bold border-t border-slate-100 pt-2 flex items-center justify-between">
                <span>Hiring: <strong className="text-slate-900 font-black truncate max-w-[120px] inline-block align-bottom">{track.companyFav}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 4. Popular Courses & Practice Sets (2-Column Mobile Grid) ── */}
      <div className="space-y-2.5 sm:space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-[11px] sm:text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-1.5 sm:gap-2">
            <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600" />
            <span>Popular Courses &amp; Sets</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-4">
          {POPULAR_COURSES.map((c) => (
            <Link
              key={c.title}
              href="/learning"
              className="bg-white p-3 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-start gap-2 sm:gap-3.5 cursor-pointer group"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                <Play className="w-3.5 h-3.5 fill-white text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-black text-slate-900 truncate group-hover:text-purple-700 transition-colors">{c.title}</h4>
                <p className="text-[10px] sm:text-[11px] text-slate-500 font-semibold mt-0.5 truncate">{c.instructor}</p>
                <div className="flex items-center justify-between mt-2 text-[9px] sm:text-[10px] font-black">
                  <span className="text-amber-800 bg-amber-100 border border-amber-200 px-1.5 py-0.5 rounded-full">⭐ {c.rating}</span>
                  <span className="text-slate-500 font-bold truncate max-w-[60px]">{c.level}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── 5. Company Question Banks & Hackathons ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-5">
        {/* Company Banks */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-md space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h3 className="text-[11px] sm:text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-1.5 sm:gap-2">
              <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
              <span>Company Question Banks</span>
            </h3>
            <Link href="/practice" className="text-[11px] sm:text-xs text-blue-600 font-black hover:underline">
              Practice →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {TOP_COMPANIES.map((comp) => (
              <Link
                key={comp.name}
                href="/practice"
                className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-indigo-500 hover:bg-white transition-all text-left shadow-2xs cursor-pointer group"
              >
                <div className="text-xs font-black text-slate-900 group-hover:text-indigo-600 truncate">{comp.name}</div>
                <div className="text-[9px] sm:text-[10px] text-indigo-600 font-bold mt-0.5">{comp.open}</div>
              </Link>
            ))}
          </div>
        </div>

        {/* Hackathons & Challenges */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-md space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h3 className="text-[11px] sm:text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-1.5 sm:gap-2">
              <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" />
              <span>Hackathons &amp; Challenges</span>
            </h3>
            <span className="text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">Live</span>
          </div>
          <div className="space-y-2">
            {HACKATHONS.map((h) => (
              <div
                key={h.title}
                className="p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 flex items-center justify-between shadow-2xs"
              >
                <div>
                  <div className="text-[11px] sm:text-xs font-black text-slate-900">{h.title}</div>
                  <div className="text-[9px] sm:text-[10px] text-amber-900 font-extrabold mt-0.5">Prize Pool: {h.prize}</div>
                </div>
                <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-lg sm:rounded-xl bg-amber-500 text-white text-[9px] sm:text-[10px] font-black shadow-xs shrink-0">
                  {h.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
