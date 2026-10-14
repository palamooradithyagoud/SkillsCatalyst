"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layers,
  Brain,
  Cloud,
  Database,
  ShieldCheck,
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
  X,
  ArrowRight,
  GraduationCap,
  Newspaper,
  Calendar,
  Users,
  ExternalLink,
} from "lucide-react";
import ScholarshipsWidget from "@/components/explore/ScholarshipsWidget";
import TechNewsWidget from "@/components/explore/TechNewsWidget";
import EventsWidget from "@/components/explore/EventsWidget";
import CommunityWidget from "@/components/explore/CommunityWidget";
import ExploreDownbar, { ExploreTabId } from "@/components/explore/ExploreDownbar";
import { fetchStudentEvents } from "@/lib/api/events";
import type { EventItem } from "@/types/events";
import StrokeText from "./StrokeText";

// Foundation items for Explore feed
const AI_PICKS = [
  {
    id: "programming-language",
    title: "Programming Language",
    category: "Core Foundation",
    level: "Beginner - Advanced",
    duration: "Choose Language",
    gradient: "from-blue-600 via-indigo-600 to-purple-600",
    badge: "🔥 Step 1",
    isModalTrigger: true,
  },
  {
    id: "data-structures",
    title: "Data Structures",
    category: "DSA Foundation",
    level: "Intermediate",
    duration: "Arrays, Trees, Graphs",
    gradient: "from-purple-600 via-pink-600 to-rose-600",
    badge: "⭐ Step 2",
    href: "/learning?query=Data%20Structures",
  },
  {
    id: "leetcode-foundation",
    title: "LeetCode Foundation",
    category: "Placement Prep",
    level: "All Levels",
    duration: "Pattern-Wise Sheet",
    gradient: "from-cyan-600 via-teal-600 to-emerald-600",
    badge: "🚀 Step 3",
    href: "/practice?mode=beginner",
  },
];

const PROGRAMMING_LANGUAGES = [
  {
    name: "C",
    title: "C Language",
    tagline: "Systems & Memory Logic",
    desc: "Syntax, pointers, memory management, and procedural problem-solving.",
    query: "C Language",
    badge: "Procedural",
    badgeColor: "bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800/60",
    iconGradient: "from-blue-600 to-cyan-600",
    borderHover: "hover:border-blue-500",
  },
  {
    name: "C++",
    title: "C++ (CPP)",
    tagline: "High Performance & STL",
    desc: "Object-oriented programming, STL containers, templates, and competitive DSA.",
    query: "C++",
    badge: "Competitive",
    badgeColor: "bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/60",
    iconGradient: "from-indigo-600 to-purple-600",
    borderHover: "hover:border-indigo-500",
  },
  {
    name: "Java",
    title: "Java",
    tagline: "Enterprise & Object-Oriented",
    desc: "Classes, objects, JVM architecture, Collections framework, and robust backend logic.",
    query: "Java",
    badge: "Enterprise",
    badgeColor: "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/60",
    iconGradient: "from-amber-500 to-orange-600",
    borderHover: "hover:border-amber-500",
  },
  {
    name: "Python",
    title: "Python",
    tagline: "Modern, AI & Clean Syntax",
    desc: "Readable syntax, versatile data structures, algorithms, and practical development.",
    query: "Python",
    badge: "High-Level",
    badgeColor: "bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800/60",
    iconGradient: "from-purple-600 to-indigo-600",
    borderHover: "hover:border-purple-500",
  },
];

const TRENDING_SKILLS = [
  { name: "AI & Generative AI", icon: Brain, count: "62 Playlists", tag: "AI/ML", query: "Generative AI" },
  { name: "Full-Stack Development", icon: Code2, count: "48 Playlists", tag: "FullStack", query: "Full Stack Development" },
  { name: "Cloud & DevOps", icon: Cloud, count: "42 Playlists", tag: "DevOps", query: "DevOps" },
  { name: "Data Engineering & Analytics", icon: Database, count: "35 Playlists", tag: "Data", query: "Data Engineering" },
  { name: "Cybersecurity", icon: ShieldCheck, count: "29 Playlists", tag: "Security", query: "Cybersecurity" },
];

const CAREER_TRACKS = [
  {
    title: "AI / Generative AI",
    skills: ["LLMs", "RAG", "AI Agents", "LangChain", "Hugging Face"],
    companyFav: "OpenAI, Google, Anthropic",
    gradient: "from-purple-500/20 to-indigo-500/10",
    borderColor: "border-purple-500/30",
  },
  {
    title: "Full-Stack Development",
    skills: ["React", "Next.js", "Node.js", "TypeScript"],
    companyFav: "Meta, Vercel, Stripe",
    gradient: "from-blue-500/20 to-cyan-500/10",
    borderColor: "border-blue-500/30",
  },
  {
    title: "Cloud & DevOps",
    skills: ["AWS", "Docker", "Kubernetes", "CI/CD"],
    companyFav: "Amazon, Microsoft, Cloudflare",
    gradient: "from-amber-500/20 to-orange-500/10",
    borderColor: "border-amber-500/30",
  },
  {
    title: "Data Engineering & Analytics",
    skills: ["Python", "SQL", "Spark", "Databricks"],
    companyFav: "Snowflake, Netflix, Databricks",
    gradient: "from-emerald-500/20 to-teal-500/10",
    borderColor: "border-emerald-500/30",
  },
  {
    title: "Cybersecurity",
    skills: ["Network Security", "Cloud Security", "Ethical Hacking", "SOC"],
    companyFav: "CrowdStrike, Palo Alto, Cisco",
    gradient: "from-rose-500/20 to-pink-500/10",
    borderColor: "border-rose-500/30",
  },
];

const POPULAR_TRACKS = [
  { title: "Complete Python Mastery 2026", instructor: "Telusko", rating: "4.9", videos: "54 Videos", level: "Beginner - Advanced", color: "border-cyan-500/30", query: "Python Telusko" },
  { title: "Aptitude & Logical Reasoning Sprint", instructor: "SkillsCatalyst Team", rating: "4.8", videos: "41 Practice Sets", level: "Placement", color: "border-purple-500/30", query: "Aptitude and Reasoning" },
  { title: "Data Structures & Algorithms in C++", instructor: "Striver", rating: "5.0", videos: "120 Videos", level: "Intermediate", color: "border-blue-500/30", query: "Data Structures in C++ Striver" },
];

const TOP_COMPANIES = [
  { name: "Google", role: "Software Engineer", open: "140+ Questions", slug: "google" },
  { name: "Microsoft", role: "Full Stack Dev", open: "110+ Questions", slug: "microsoft" },
  { name: "Amazon", role: "SDE I & II", open: "195+ Questions", slug: "amazon" },
  { name: "TCS", role: "Ninja & Digital", open: "85+ Questions", slug: "tcs" },
];

function ExplorePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [companyInput, setCompanyInput] = useState("");
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);
  const [hackathons, setHackathons] = useState<EventItem[]>([]);
  const [loadingHackathons, setLoadingHackathons] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await fetchStudentEvents({ is_hackathon: true });
        if (active && res.events) {
          setHackathons(res.events);
        }
      } catch {
        // Silently handled
      } finally {
        if (active) setLoadingHackathons(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  const initialTab = (searchParams.get("tab") as ExploreTabId) || "trending";
  const [activeTab, setActiveTab] = useState<ExploreTabId>(
    ["trending", "scholarships", "news", "events", "community"].includes(initialTab)
      ? initialTab
      : "trending"
  );

  useEffect(() => {
    const tabParam = searchParams.get("tab") as ExploreTabId;
    if (tabParam && ["trending", "scholarships", "news", "events", "community"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Sync activeTab attribute on document.body for instant MobileNav synchronization
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.body.setAttribute("data-explore-tab", activeTab);
    }
  }, [activeTab]);

  useEffect(() => {
    const handleExploreTabChange = (e: any) => {
      if (e.detail && ["trending", "scholarships", "news", "events", "community"].includes(e.detail)) {
        setActiveTab(e.detail);
      }
    };
    window.addEventListener("explore-tab-change", handleExploreTabChange);
    return () => {
      window.removeEventListener("explore-tab-change", handleExploreTabChange);
      if (typeof document !== "undefined") {
        document.body.removeAttribute("data-explore-tab");
      }
    };
  }, []);

  const handleSelectTab = (tab: ExploreTabId) => {
    setActiveTab(tab);
    if (typeof document !== "undefined") {
      document.body.setAttribute("data-explore-tab", tab);
    }
    router.replace(`/explore?tab=${tab}`, { scroll: false });
  };

  const handleCompanySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = companyInput.trim().toLowerCase();
    if (trimmed) {
      router.push(`/practice?company=${encodeURIComponent(trimmed)}&period=thirty-days&mode=company`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-24 md:pb-28">
      {/* ── Top Header ── */}
      <div className="bg-white dark:bg-[#18191F] p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/90 dark:border-neutral-800 shadow-md relative overflow-hidden">
        <div className="flex flex-row items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/30 shrink-0">
              {activeTab === "scholarships" ? (
                <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              ) : activeTab === "events" ? (
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              ) : activeTab === "news" ? (
                <Newspaper className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              ) : activeTab === "community" ? (
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              ) : (
                <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              )}
            </div>
            <div>
              <h1 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none flex items-center min-h-[28px] sm:min-h-[36px]">
                <StrokeText
                  key={activeTab}
                  text={
                    activeTab === "scholarships"
                      ? "Scholarships"
                      : activeTab === "events"
                      ? "Events"
                      : activeTab === "news"
                      ? "Tech News"
                      : activeTab === "community"
                      ? "Community"
                      : "Explore"
                  }
                  strokeColor="#A78BFA"
                  fillColor="#A855F7"
                  strokeWidth={1.4}
                  drawDuration={1.6}
                  fillDelay={0.2}
                  stagger={0.05}
                  ease="power2.out"
                  trigger="mount"
                  fillMode="wipe"
                  fontSize={128}
                  fontWeight={800}
                  letterSpacing={-4}
                  className="h-7 sm:h-9 w-auto"
                />
              </h1>
              <p className="text-slate-500 dark:text-neutral-400 text-[11px] sm:text-sm font-semibold mt-0.5">
                {activeTab === "trending" && "Curated roadmaps & skill paths"}
                {activeTab === "scholarships" && "Verified tech scholarships & fellowships"}
                {activeTab === "news" && "48-hour curated tech stories & engineering drops"}
                {activeTab === "events" && "Global hackathons, keynotes & summits"}
                {activeTab === "community" && "Peer study pods, tech guilds & referrals"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile Category Navigation Pills ── */}
      <div className="flex md:hidden items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
        {[
          { id: "trending", name: "Trending", icon: Flame },
          { id: "scholarships", name: "Scholarships", icon: GraduationCap },
          { id: "news", name: "News", icon: Newspaper },
          { id: "events", name: "Events", icon: Calendar },
          { id: "community", name: "Guilds", icon: Users },
        ].map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelectTab(item.id as ExploreTabId)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all ${
                isActive
                  ? "bg-pink-600 text-white shadow-xs"
                  : "bg-white dark:bg-[#18191F] text-slate-600 dark:text-neutral-300 border border-slate-200 dark:border-neutral-800"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.name}</span>
            </button>
          );
        })}
      </div>

      {/* ── Normal Tab Views ── */}
      {/* ── Tab Views: Trending (Existing Content) ── */}
      {activeTab === "trending" && (
            <div className="space-y-6">

      {/* ── 1. Foundation Carousel (Compact Poster Cards on Smartphone) ── */}
      <div className="space-y-2.5 sm:space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-[11px] sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-1.5 sm:gap-2">
            <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600 dark:text-[#C084FC]" />
            <span>Foundation</span>
          </h2>
          <span className="text-[10px] sm:text-[11px] text-slate-400 dark:text-neutral-500 font-extrabold">Swipe →</span>
        </div>

        <div className="flex gap-3 sm:gap-4 overflow-x-auto no-scrollbar mobile-touch-scroll pb-2 snap-x snap-mandatory px-0.5">
          {AI_PICKS.map((item) => {
            const isTrigger = !item.href || item.isModalTrigger;
            const cardInner = (
              <>
                <div className="relative z-10 space-y-2">
                  <div className="flex items-center justify-between gap-1 flex-wrap">
                    <span className="px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-black bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xs">
                      {item.category}
                    </span>
                    <span className="text-[9px] sm:text-[11px] font-black bg-amber-100/90 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-300/80 dark:border-amber-700/60 px-2 py-0.5 rounded-full shadow-2xs">
                      {item.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xs sm:text-lg font-black text-slate-900 dark:text-white leading-snug group-hover:text-indigo-600 dark:group-hover:text-[#C084FC] transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-slate-600 dark:text-neutral-300 mt-1.5 font-extrabold">
                      <span className="bg-slate-100 dark:bg-[#121318] px-2 py-0.5 rounded-md border border-slate-200/80 dark:border-neutral-700">{item.level}</span>
                      {item.duration && (
                        <>
                          <span>•</span>
                          <span className="bg-slate-100 dark:bg-[#121318] px-2 py-0.5 rounded-md border border-slate-200/80 dark:border-neutral-700">{item.duration}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-neutral-800 flex items-center justify-between text-[10px] sm:text-xs font-black text-indigo-600 dark:text-[#C084FC] group-hover:translate-x-1 transition-transform relative z-10">
                  <span>{isTrigger ? "Choose Language" : "Start Learning"}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </>
            );

            if (isTrigger) {
              return (
                <button
                  key={item.id}
                  onClick={() => setIsLangModalOpen(true)}
                  className="card-morph snap-start flex-shrink-0 w-[200px] sm:w-[330px] bg-white dark:bg-[#18191F] rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 border border-slate-200/90 dark:border-neutral-800 relative overflow-hidden group hover:shadow-xl shadow-sm flex flex-col justify-between space-y-3 text-left cursor-pointer"
                >
                  {cardInner}
                </button>
              );
            }

            return (
              <Link
                key={item.id}
                href={item.href || "/learning"}
                className="card-morph snap-start flex-shrink-0 w-[200px] sm:w-[330px] bg-white dark:bg-[#18191F] rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 border border-slate-200/90 dark:border-neutral-800 relative overflow-hidden group hover:shadow-xl shadow-sm flex flex-col justify-between space-y-3"
              >
                {cardInner}
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── 2. Trending Skill Chips Carousel ── */}
      <div className="space-y-2.5 sm:space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-[11px] sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-1.5 sm:gap-2">
            <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600 dark:text-[#C084FC]" />
            <span>Top Tech Stack Skills</span>
          </h2>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3 overflow-x-auto no-scrollbar mobile-touch-scroll pb-1">
          {TRENDING_SKILLS.map((skill) => {
            const Icon = skill.icon;
            return (
              <Link
                key={skill.name}
                href={`/learning?query=${encodeURIComponent(skill.query || skill.name)}`}
                className="flex-shrink-0 flex items-center gap-2.5 px-3 py-2 sm:px-4 sm:py-3 rounded-xl sm:rounded-2xl bg-white dark:bg-[#18191F] hover:bg-slate-50 dark:hover:bg-[#20222A] border border-slate-200/90 dark:border-neutral-800 text-xs font-bold text-slate-700 dark:text-neutral-300 hover:text-slate-950 dark:hover:text-white transition-all shadow-2xs hover:shadow-md cursor-pointer"
              >
                <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-2xs shrink-0">
                  <Icon className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 text-white" />
                </div>
                <div>
                  <div className="font-extrabold text-slate-900 dark:text-white text-[11px] sm:text-xs whitespace-nowrap">{skill.name}</div>
                  <div className="text-[9px] sm:text-[10px] text-slate-500 dark:text-neutral-400 font-bold mt-0.5">{skill.count}</div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── 3. Career Tracks Carousel ── */}
      <div className="space-y-2.5 sm:space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-[11px] sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-1.5 sm:gap-2">
            <Briefcase className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600 dark:text-[#C084FC]" />
            <span>Target Career Tracks</span>
          </h2>
          <Link href="/roadmaps" className="text-[11px] sm:text-xs text-indigo-600 dark:text-[#C084FC] font-black hover:underline">
            All Tracks →
          </Link>
        </div>

        <div className="flex gap-3 sm:gap-4 overflow-x-auto no-scrollbar mobile-touch-scroll pb-2 snap-x snap-mandatory px-0.5">
          {CAREER_TRACKS.map((track) => (
            <div
              key={track.title}
              className="snap-start flex-shrink-0 w-[210px] sm:w-[320px] bg-white dark:bg-[#18191F] rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 border border-slate-200/90 dark:border-neutral-800 flex flex-col justify-between shadow-sm space-y-3 hover:shadow-lg transition-all overflow-hidden"
            >
              <div>
                <Link
                  href={`/learning?query=${encodeURIComponent(track.title)}`}
                  className="text-xs sm:text-base font-black text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-[#C084FC] transition-colors mb-2 leading-snug block"
                >
                  {track.title}
                </Link>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {track.skills.map((s) => (
                    <Link
                      key={s}
                      href={`/learning?query=${encodeURIComponent(s)}`}
                      className="px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-extrabold bg-indigo-50 dark:bg-[#121318] hover:bg-indigo-100 dark:hover:bg-[#20222A] text-indigo-700 dark:text-purple-300 hover:text-indigo-900 dark:hover:text-purple-200 border border-indigo-200/80 dark:border-neutral-700 shadow-2xs transition-colors cursor-pointer"
                    >
                      {s}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="text-[10px] sm:text-[11px] text-slate-600 dark:text-neutral-400 font-bold border-t border-slate-100 dark:border-neutral-800 pt-2 flex items-center justify-between">
                <span>Hiring: <strong className="text-slate-900 dark:text-white font-black truncate max-w-[130px] inline-block align-bottom">{track.companyFav}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 4. Popular Video Tracks & Practice Sets (2-Column Mobile Grid) ── */}
      <div className="space-y-2.5 sm:space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-[11px] sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-1.5 sm:gap-2">
            <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600 dark:text-[#C084FC]" />
            <span>Popular Tracks &amp; Sets</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-4">
          {POPULAR_TRACKS.map((c) => (
            <Link
              key={c.title}
              href={`/learning?query=${encodeURIComponent(c.query || c.title)}`}
              className="w-full min-w-0 bg-white dark:bg-[#18191F] p-3 sm:p-4.5 rounded-xl sm:rounded-2xl border border-slate-200/90 dark:border-neutral-800 shadow-2xs hover:shadow-md transition-all flex flex-col sm:flex-row items-start gap-2.5 sm:gap-3.5 cursor-pointer group overflow-hidden"
            >
              <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white text-white" />
              </div>
              <div className="w-full min-w-0 flex-1 flex flex-col justify-between self-stretch">
                <div>
                  <h4 className="text-[11px] sm:text-xs font-black text-slate-900 dark:text-white line-clamp-2 leading-snug break-words group-hover:text-purple-700 dark:group-hover:text-[#C084FC] transition-colors">
                    {c.title}
                  </h4>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-neutral-400 font-semibold mt-0.5 truncate block w-full">
                    {c.instructor}
                  </p>
                </div>
                <div className="w-full min-w-0 flex items-center justify-between gap-1 mt-2 sm:mt-2.5 pt-1.5 sm:pt-2 border-t border-slate-100 dark:border-neutral-800 text-[9px] sm:text-[10px] font-black">
                  <span className="text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-700/60 px-1.5 py-0.5 rounded-md shrink-0 flex items-center gap-0.5">
                    <span>⭐</span>
                    <span>{c.rating}</span>
                  </span>
                  <span className="text-slate-600 dark:text-neutral-300 bg-slate-100 dark:bg-[#121318] border border-slate-200/80 dark:border-neutral-700 px-1.5 py-0.5 rounded-md truncate font-bold text-right min-w-0 max-w-[70px] sm:max-w-none" title={c.level}>
                    {c.level}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── 5. Company Question Banks & Hackathons ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-5">
        {/* Company Banks */}
        <div className="bg-white dark:bg-[#18191F] p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/90 dark:border-neutral-800 shadow-md space-y-3.5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-neutral-800 pb-2.5">
            <h3 className="text-[11px] sm:text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-1.5 sm:gap-2">
              <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 dark:text-[#C084FC]" />
              <span>Company Question Banks</span>
            </h3>
            <Link href="/practice?period=thirty-days&mode=company" className="text-[11px] sm:text-xs text-blue-600 dark:text-[#C084FC] font-black hover:underline">
              Practice 30D →
            </Link>
          </div>

          {/* Quick Enter Company Search */}
          <form onSubmit={handleCompanySubmit} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-neutral-500" />
            <input
              type="text"
              value={companyInput}
              onChange={(e) => setCompanyInput(e.target.value)}
              placeholder="Enter company (e.g. Google, Meta, TCS)..."
              className="w-full bg-slate-50 dark:bg-[#121318] border border-slate-200/90 dark:border-neutral-700 focus:border-indigo-500 focus:bg-white dark:focus:bg-[#18191F] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 text-xs font-bold pl-9 pr-16 py-2 rounded-xl transition-all outline-none shadow-2xs"
            />
            <button
              type="submit"
              className="absolute right-1 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-[10px] font-black text-white cursor-pointer transition-all shadow-xs"
            >
              Go 30D
            </button>
          </form>

          <div className="grid grid-cols-2 gap-2">
            {TOP_COMPANIES.map((comp) => (
              <Link
                key={comp.name}
                href={`/practice?company=${comp.slug}&period=thirty-days&mode=company`}
                className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-[#121318] border border-slate-200/80 dark:border-neutral-700 hover:border-indigo-500 dark:hover:border-purple-500 hover:bg-white dark:hover:bg-[#20222A] transition-all text-left shadow-2xs cursor-pointer group min-w-0 overflow-hidden"
              >
                <div className="flex items-center justify-between gap-1 min-w-0">
                  <div className="text-xs font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-[#C084FC] truncate min-w-0">{comp.name}</div>
                  <span className="text-[9px] font-black text-purple-300 bg-purple-950/60 border border-purple-800/60 px-1.5 py-0.2 rounded-md shrink-0">
                    30D
                  </span>
                </div>
                <div className="text-[9px] sm:text-[10px] text-indigo-600 dark:text-[#C084FC] font-bold mt-0.5 truncate">{comp.open}</div>
              </Link>
            ))}
          </div>
        </div>

        {/* Hackathons & Challenges */}
        <div className="bg-white dark:bg-[#18191F] p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/90 dark:border-neutral-800 shadow-md space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-neutral-800 pb-2.5">
            <h3 className="text-[11px] sm:text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-1.5 sm:gap-2">
              <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" />
              <span>Hackathons &amp; Challenges</span>
            </h3>
            <span className="text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-full bg-purple-950/60 text-purple-300 border border-purple-800/60 shrink-0">Live</span>
          </div>

          {loadingHackathons ? (
            <div className="p-4 text-center text-xs text-slate-400 dark:text-neutral-500 font-semibold">Loading hackathons...</div>
          ) : hackathons.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-500 dark:text-neutral-400 font-medium bg-slate-50 dark:bg-[#121318] rounded-xl border border-slate-200/70 dark:border-neutral-800">
              No live hackathons active today. Check back soon for upcoming campus challenges!
            </div>
          ) : (
            <div className="space-y-2">
              {hackathons.map((h) => (
                <a
                  key={h.id}
                  href={h.event_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-amber-50/70 dark:bg-[#121318] hover:bg-amber-100/70 dark:hover:bg-[#20222A] border border-amber-200/80 dark:border-neutral-800 flex items-center justify-between shadow-2xs gap-2 min-w-0 overflow-hidden transition-all cursor-pointer group"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] sm:text-xs font-black text-slate-900 dark:text-white truncate group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                      {h.event_name}
                    </div>
                    <div className="text-[9px] sm:text-[10px] text-amber-900 dark:text-amber-300 font-extrabold mt-0.5 truncate">
                      {h.conducted_by_college} {h.prize_pool ? `• Prize: ${h.prize_pool}` : ""}
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-lg sm:rounded-xl bg-amber-500 text-white text-[9px] sm:text-[10px] font-black shadow-xs shrink-0 flex items-center gap-1">
                    <span>Register</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </span>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
      </div>
      )}

      {/* ── 2. Scholarships Widget ── */}
      {activeTab === "scholarships" && <ScholarshipsWidget />}

      {/* ── 3. Tech News Widget ── */}
      {activeTab === "news" && <TechNewsWidget />}

      {/* ── 4. Events Widget ── */}
      {activeTab === "events" && <EventsWidget />}

      {/* ── 5. Community Widget ── */}
      {activeTab === "community" && <CommunityWidget />}

      {/* ── Desktop Floating Downbar Dock ── */}
      <ExploreDownbar
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        className="hidden md:flex"
      />

      {/* ── Programming Language Selection Modal ── */}
      <AnimatePresence>
        {isLangModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            {/* Backdrop click to close */}
            <div
              className="absolute inset-0"
              onClick={() => setIsLangModalOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="bg-white dark:bg-[#18191F] w-full max-w-xl rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-neutral-800 shadow-2xl relative overflow-hidden space-y-5 z-10"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-[#121318] border border-indigo-200 dark:border-neutral-700 flex items-center justify-center text-indigo-600 dark:text-[#C084FC] shadow-xs shrink-0">
                    <Code2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                      Choose Programming Language
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-neutral-400 font-semibold mt-0.5">
                      Select a language to launch your foundation learning track.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsLangModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#121318] hover:bg-slate-200 dark:hover:bg-[#20222A] text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* 4 Language Cards: C, CPP, Java, Python */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 relative z-10 pt-1">
                {PROGRAMMING_LANGUAGES.map((lang) => (
                  <button
                    key={lang.name}
                    onClick={() => {
                      setIsLangModalOpen(false);
                      router.push(`/learning?query=${encodeURIComponent(lang.query)}`);
                    }}
                    className={`p-4 rounded-2xl bg-slate-50 dark:bg-[#121318] hover:bg-white dark:hover:bg-[#20222A] border border-slate-200/90 dark:border-neutral-700 ${lang.borderHover} transition-all duration-200 text-left shadow-2xs hover:shadow-lg hover:-translate-y-0.5 cursor-pointer group flex flex-col justify-between space-y-2.5`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-9 h-9 rounded-xl bg-gradient-to-br ${lang.iconGradient} text-white font-black text-xs flex items-center justify-center shadow-xs shrink-0`}
                        >
                          {lang.name}
                        </div>
                        <div>
                          <div className="text-sm font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-[#C084FC] transition-colors">
                            {lang.title}
                          </div>
                          <div className="text-[10px] font-bold text-slate-500 dark:text-neutral-400">
                            {lang.tagline}
                          </div>
                        </div>
                      </div>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${lang.badgeColor}`}>
                        {lang.badge}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-neutral-300 font-medium line-clamp-2 leading-relaxed">
                      {lang.desc}
                    </p>

                    <div className="pt-2 border-t border-slate-200/70 dark:border-neutral-700/70 flex items-center justify-between text-[11px] font-black text-indigo-600 dark:text-[#C084FC]">
                      <span>Open in Learning</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto p-8 text-center text-slate-400 font-bold">
          Loading Explore...
        </div>
      }
    >
      <ExplorePageContent />
    </Suspense>
  );
}

