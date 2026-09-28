"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Download,
  Save,
  Check,
  Copy,
  Code2,
  LayoutTemplate,
  User,
  FileText,
  Briefcase,
  GraduationCap,
  Code,
  FolderGit2,
  Award,
  Languages as LanguagesIcon,
  Trophy,
  Plus,
  Trash2,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  RotateCcw,
} from "lucide-react";
import confetti from "canvas-confetti";
import ResumeLivePreview from "@/components/career/ResumeLivePreview";
import { ResumeTemplateId, RESUME_TEMPLATES } from "@/components/career/TemplateSelectModal";
import {
  ResumeData,
  generateSB2NovLaTeX,
  hasAnySkill,
  EducationItem,
  ExperienceItem,
  ProjectItem,
  CertificateItem,
  SpokenLanguageItem,
  AchievementItem,
} from "@/lib/career/latexExportHelper";
import { useAuth } from "@/lib/auth";

export const sampleResumeData: ResumeData = {
  fullName: "Aadithya Goud",
  role: "Fullstack Software Engineer",
  email: "adithya@example.com",
  phone: "+91 98765 43210",
  location: "Hyderabad, India",
  linkedin: "linkedin.com/in/adithya",
  github: "github.com/adithya",
  leetcode: "leetcode.com/u/adithya_dev",
  codechef: "codechef.com/users/adithya",
  hackerrank: "hackerrank.com/profile/adithya",
  portfolio: "adithya.dev",
  summary:
    "Passionate Software Engineer skilled in modern web development, distributed architecture, and scalable full-stack applications with high ATS ranking standards.",
  education: [
    {
      institution: "Indian Institute of Information Technology",
      degree: "B.Tech",
      fieldOfStudy: "Computer Science & Engineering",
      location: "Hyderabad, India",
      startDate: "2021",
      endDate: "2025",
      dates: "2021 — 2025",
      gpaType: "CGPA",
      gpa: "8.9 / 10.0",
      activities: "President of Coding Club, Hackathon Core Team Lead",
    },
  ],
  experience: [
    {
      company: "SkillsCatalyst",
      role: "Lead Fullstack Engineer",
      location: "Remote / Hyderabad",
      startDate: "Jan 2024",
      endDate: "Present",
      currentlyWorking: true,
      dates: "Jan 2024 — Present",
      bullets: [
        "Architected real-time AI career acceleration platform serving thousands of active developers.",
        "Built resilient FastAPI microservices and optimized PostgreSQL indexing, reducing P99 latency by 45%.",
        "Engineered responsive Next.js frontend with GSAP motion and high-contrast accessibility standards.",
      ],
    },
    {
      company: "HyperTech Labs",
      role: "Software Engineering Intern",
      location: "Bangalore, India",
      startDate: "May 2023",
      endDate: "Dec 2023",
      currentlyWorking: false,
      dates: "May 2023 — Dec 2023",
      bullets: [
        "Designed and maintained scalable RESTful endpoints with automated OpenAPI schemas.",
        "Integrated Redis caching layer, lowering repeated database queries by 60%.",
      ],
    },
  ],
  projects: [
    {
      name: "SkillsCatalyst AI Suite",
      tech: "Next.js, FastAPI, Groq LLM, Supabase, Docker",
      startDate: "Feb 2024",
      endDate: "May 2024",
      dates: "Feb 2024 — May 2024",
      link: "skillscatalyst.in",
      githubUrl: "github.com/skillscatalyst/suite",
      bullets: [
        "Developed full-featured ATS resume score analyzer and interactive career roadmaps.",
        "Integrated multi-model LLM benchmarking with structured fallback orchestration.",
      ],
    },
  ],
  skills: {
    languages: "JavaScript, TypeScript, Python, C++, SQL, HTML/CSS",
    frameworks: "React, Next.js, FastAPI, Node.js, Express, Tailwind CSS",
    databases: "PostgreSQL, MongoDB, Redis, Supabase",
    tools: "Docker, Git, Linux, Postman, Vercel",
    cloudDevOps: "AWS, Docker, GitHub Actions, CI/CD",
    softSkills: "Problem Solving, Agile Collaboration, Technical Leadership",
    custom: "System Architecture, REST APIs, Microservices",
  },
  certifications: [
    {
      name: "AWS Certified Solutions Architect",
      issuer: "Amazon Web Services",
      date: "2024",
      credentialUrl: "aws.amazon.com/verify/12345",
    },
    {
      name: "SkillsCatalyst Full-Stack Specialist",
      issuer: "SkillsCatalyst Academy",
      date: "2023",
      credentialUrl: "skillscatalyst.in/verify/sc-9981",
    },
  ],
  spokenLanguages: [
    { name: "English", proficiency: "Fluent / Professional" },
    { name: "Telugu", proficiency: "Native / Bilingual" },
    { name: "Hindi", proficiency: "Conversational / Intermediate" },
  ],
  achievements: [
    {
      title: "Winner - Smart India Hackathon 2024",
      description: "Rank 1 out of 500+ teams nationwide for real-time AI emergency dispatch system.",
      date: "2024",
    },
    {
      title: "Top 5% Global LeetCode Contest Rating",
      description: "Knight Badge, solved 600+ algorithmic problems across dynamic programming and graphs.",
      date: "2023",
    },
  ],
};

export const blankResumeData: ResumeData = {
  fullName: "",
  role: "",
  email: "",
  phone: "",
  location: "",
  linkedin: "",
  github: "",
  leetcode: "",
  codechef: "",
  hackerrank: "",
  portfolio: "",
  summary: "",
  education: [],
  experience: [],
  projects: [],
  skills: {
    languages: "",
    frameworks: "",
    databases: "",
    tools: "",
    cloudDevOps: "",
    softSkills: "",
    custom: "",
  },
  certifications: [],
  spokenLanguages: [],
  achievements: [],
};

interface TemplateCardDef {
  id: ResumeTemplateId;
  badgeTitle: string;
  tagline: string;
  atsScore: number;
}

const TEMPLATE_CARDS: TemplateCardDef[] = [
  {
    id: "simple-classic",
    badgeTitle: "Simple Classic",
    tagline: "Timeless, clean single-column format for enterprise & finance",
    atsScore: 98,
  },
  {
    id: "modern-cv",
    badgeTitle: "Modern CV",
    tagline: "Contemporary layout with accent tags & visual hierarchy",
    atsScore: 96,
  },
  {
    id: "sb2nov",
    badgeTitle: "SB2Nov",
    tagline: "The gold-standard Overleaf/LaTeX SWE template for FAANG",
    atsScore: 100,
  },
  {
    id: "ultra-minimal",
    badgeTitle: "Ultra Minimal",
    tagline: "Single page high-density impact layout with crisp typography",
    atsScore: 99,
  },
];

type EditorSection =
  | "contact"
  | "summary"
  | "experience"
  | "education"
  | "skills"
  | "projects"
  | "certifications"
  | "languages"
  | "achievements"
  | "review";

const EDITOR_SECTIONS: { id: EditorSection; label: string; icon: React.ReactNode }[] = [
  { id: "contact", label: "Contact", icon: <User className="w-3.5 h-3.5" /> },
  { id: "summary", label: "Summary", icon: <FileText className="w-3.5 h-3.5" /> },
  { id: "experience", label: "Experience", icon: <Briefcase className="w-3.5 h-3.5" /> },
  { id: "education", label: "Education", icon: <GraduationCap className="w-3.5 h-3.5" /> },
  { id: "skills", label: "Skills", icon: <Code className="w-3.5 h-3.5" /> },
  { id: "projects", label: "Projects", icon: <FolderGit2 className="w-3.5 h-3.5" /> },
  { id: "certifications", label: "Certificates", icon: <Award className="w-3.5 h-3.5" /> },
  { id: "languages", label: "Languages", icon: <LanguagesIcon className="w-3.5 h-3.5" /> },
  { id: "achievements", label: "Achievements", icon: <Trophy className="w-3.5 h-3.5" /> },
  { id: "review", label: "Finish & Download", icon: <Download className="w-3.5 h-3.5" /> },
];

function ResumeBuilderInner() {
  const { session } = useAuth();
  const userName = session?.name || "";
  const userEmail = session?.email || "";
  const searchParams = useSearchParams();
  const templateQuery = searchParams.get("template") as ResumeTemplateId | null;

  // View mode: "gallery" (select template) or "editor" (active builder)
  const [viewMode, setViewMode] = useState<"gallery" | "editor">(
    templateQuery ? "editor" : "gallery"
  );
  const [selectedTemplate, setSelectedTemplate] = useState<ResumeTemplateId>(
    templateQuery || "sb2nov"
  );

  // Active section tab
  const [activeEditorSection, setActiveEditorSection] = useState<EditorSection>("contact");

  // Mobile toggle between form and live preview
  const [mobileBuilderTab, setMobileBuilderTab] = useState<"editor" | "preview">("editor");

  // Resume builder data starts clean without raw/dummy data
  const [resumeData, setResumeData] = useState<ResumeData>({
    ...blankResumeData,
    fullName: userName,
    email: userEmail,
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showLatexModal, setShowLatexModal] = useState(false);
  const [copiedLatex, setCopiedLatex] = useState(false);

  // Compute ATS completeness score
  const computeATSScore = () => {
    let score = 0;
    if (resumeData.fullName?.trim() && resumeData.email?.trim() && resumeData.phone?.trim()) score += 15;
    if (resumeData.linkedin?.trim() || resumeData.github?.trim() || resumeData.leetcode?.trim()) score += 10;
    if (resumeData.summary?.trim() && resumeData.summary.trim().length > 30) score += 15;
    if (resumeData.experience && resumeData.experience.filter((e) => e.company?.trim() || e.role?.trim()).length > 0) score += 20;
    if (resumeData.education && resumeData.education.filter((e) => e.institution?.trim() || e.degree?.trim()).length > 0) score += 15;
    if (resumeData.projects && resumeData.projects.filter((p) => p.name?.trim() || p.tech?.trim()).length > 0) score += 15;
    if (hasAnySkill(resumeData.skills)) score += 15;
    if (resumeData.certifications && resumeData.certifications.filter((c) => c.name?.trim()).length > 0) score += 5;
    if (resumeData.achievements && resumeData.achievements.filter((a) => a.title?.trim()).length > 0) score += 5;
    return Math.min(score, 100);
  };

  const atsScore = computeATSScore();

  const handleSelectTemplate = (templateId: ResumeTemplateId) => {
    setSelectedTemplate(templateId);
    setViewMode("editor");
    setMobileBuilderTab("editor");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDownloadResume = () => {
    const originalTitle = document.title;
    const cleanFileName = `${(resumeData.fullName || "My").trim().replace(/\s+/g, "_")}_Resume`;
    document.title = cleanFileName;
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1500);
  };

  const handleCopyLatex = () => {
    const latex = generateSB2NovLaTeX(resumeData);
    navigator.clipboard.writeText(latex);
    setCopiedLatex(true);
    setTimeout(() => setCopiedLatex(false), 2500);
  };

  const handleSaveResume = () => {
    try {
      const stored = localStorage.getItem("skillscatalyst_resumes");
      const list = stored ? JSON.parse(stored) : [];
      const newItem = {
        id: `resume-${Date.now()}`,
        title: `${resumeData.fullName} — ${resumeData.role}`,
        role: resumeData.role,
        date: "Just now",
        atsScore,
        starred: false,
        templateId: selectedTemplate,
        resumeData: { ...resumeData },
      };
      const nextList = [newItem, ...list];
      localStorage.setItem("skillscatalyst_resumes", JSON.stringify(nextList));
    } catch (e) {
      console.error(e);
    }

    setSavedSuccess(true);
    try {
      confetti({ particleCount: 75, spread: 70, origin: { y: 0.65 } });
    } catch {}
    setTimeout(() => setSavedSuccess(false), 4500);
  };

  const handleLoadSample = () => {
    setResumeData({ ...sampleResumeData });
  };

  const handleClearAll = () => {
    setResumeData({
      ...blankResumeData,
      fullName: userName,
      email: userEmail,
    });
  };

  // Step navigation helper
  const currentSectionIdx = EDITOR_SECTIONS.findIndex((s) => s.id === activeEditorSection);
  const goToNextSection = () => {
    if (currentSectionIdx < EDITOR_SECTIONS.length - 1) {
      setActiveEditorSection(EDITOR_SECTIONS[currentSectionIdx + 1].id);
    }
  };
  const goToPrevSection = () => {
    if (currentSectionIdx > 0) {
      setActiveEditorSection(EDITOR_SECTIONS[currentSectionIdx - 1].id);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-5 pb-20 select-none text-slate-900">
      {/* ── Top In-Page Bar ── */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <Link
          href="/career/resume-review"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs transition-all"
        >
          <ChevronLeft className="w-4 h-4 text-slate-500" />
          <span>Back to Workspace</span>
        </Link>

        {viewMode === "editor" ? (
          <button
            type="button"
            onClick={() => setViewMode("gallery")}
            className="px-3 py-1.5 rounded-xl border border-slate-200 hover:border-pink-300 text-slate-700 hover:text-pink-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer bg-white shadow-2xs"
          >
            <LayoutTemplate className="w-3.5 h-3.5 text-pink-600" />
            <span>Change Template</span>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
            <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
              Choose a layout to start
            </span>
          </div>
        )}
      </div>

      {/* ──────────────────────────────────────────────────────────
          VIEW 1: TEMPLATE SELECTION GALLERY
      ────────────────────────────────────────────────────────── */}
      {viewMode === "gallery" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="text-center max-w-2xl mx-auto space-y-1.5">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Select Your Resume Template
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Choose the foundation that best matches your target industry and career goals.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto pt-1">
            {TEMPLATE_CARDS.map((tmpl) => (
              <div
                key={tmpl.id}
                className="bg-white rounded-2xl border border-slate-200/90 hover:border-pink-400 p-2.5 sm:p-3 shadow-2xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between group"
              >
                <div className="aspect-[1/1.32] w-full bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden relative p-3 text-[6.5px] leading-tight select-none flex flex-col justify-between group-hover:scale-[1.01] transition-transform">
                  <div className="absolute top-2 left-2 z-10">
                    <span className="bg-[#24292e] text-white text-[10px] font-bold px-2.5 py-0.5 rounded shadow-xs tracking-tight">
                      {tmpl.badgeTitle}
                    </span>
                  </div>

                  {tmpl.id === "simple-classic" && (
                    <div className="pt-7 font-serif space-y-2 text-slate-800">
                      <div className="text-center pb-1 border-b border-slate-400">
                        <div className="font-bold text-[9px] text-slate-900 tracking-wider">JOHN DOE</div>
                        <div className="text-[5.5px] text-slate-500">john@example.com · New York, NY</div>
                      </div>
                      <div>
                        <div className="font-bold text-[6.5px] uppercase border-b border-slate-200 pb-0.5 text-slate-900">
                          EDUCATION
                        </div>
                        <div className="flex justify-between text-[5.5px] pt-0.5 font-semibold">
                          <span>Stanford University</span>
                          <span className="text-slate-400">2020 – 2024</span>
                        </div>
                      </div>
                      <div>
                        <div className="font-bold text-[6.5px] uppercase border-b border-slate-200 pb-0.5 text-slate-900">
                          EXPERIENCE
                        </div>
                        <div className="flex justify-between text-[5.5px] pt-0.5 font-semibold">
                          <span>Software Engineer — TechCorp</span>
                          <span className="text-slate-400">2024 – Present</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {tmpl.id === "modern-cv" && (
                    <div className="pt-7 font-sans space-y-2 text-slate-800">
                      <div className="pb-1 border-b-2 border-purple-600">
                        <div className="font-black text-[9px] text-slate-900">JOHN DOE</div>
                        <div className="text-[5px] text-purple-600 font-bold">Full Stack Engineer</div>
                      </div>
                      <div>
                        <div className="font-bold text-[6px] text-purple-700 uppercase">Core Skills</div>
                        <div className="flex gap-1 pt-0.5">
                          <span className="bg-purple-100 text-purple-800 px-1 rounded text-[5px]">React</span>
                          <span className="bg-purple-100 text-purple-800 px-1 rounded text-[5px]">FastAPI</span>
                          <span className="bg-purple-100 text-purple-800 px-1 rounded text-[5px]">Docker</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {tmpl.id === "sb2nov" && (
                    <div className="pt-7 font-serif space-y-1.5 text-slate-900">
                      <div className="text-center pb-1">
                        <div className="font-bold text-[10px] uppercase">JOHN DOE</div>
                        <div className="text-[5px] text-slate-600 font-sans">
                          john@example.com | github.com/johndoe | leetcode
                        </div>
                      </div>
                      <div>
                        <div className="font-bold text-[6px] uppercase border-b border-slate-900 pb-0.5">
                          Technical Skills
                        </div>
                        <div className="text-[5px] pt-0.5 font-sans">
                          Languages: Python, TypeScript, C++, SQL
                        </div>
                      </div>
                    </div>
                  )}

                  {tmpl.id === "ultra-minimal" && (
                    <div className="pt-7 font-sans space-y-2 text-slate-800">
                      <div className="pb-1 border-b border-slate-200">
                        <div className="font-black text-[9px] text-slate-900 tracking-tight">JOHN DOE</div>
                        <div className="text-[5px] text-slate-500">New York, NY · john@example.com</div>
                      </div>
                      <div>
                        <div className="font-extrabold text-[6px] tracking-widest text-slate-400 uppercase">
                          Experience
                        </div>
                        <div className="text-[5.5px] font-bold">Software Engineer (2022–Present)</div>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleSelectTemplate(tmpl.id)}
                  className="w-full mt-2.5 bg-pink-600 hover:bg-pink-700 active:scale-95 text-white font-bold py-2 px-3 rounded-lg text-xs sm:text-sm tracking-wide shadow-xs shadow-pink-500/20 text-center transition-all cursor-pointer"
                >
                  Use Template
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────
          VIEW 2: FULL RESUME BUILDER STUDIO WITH LIVE PREVIEW
      ────────────────────────────────────────────────────────── */}
      {viewMode === "editor" && (
        <div className="space-y-5 animate-in fade-in duration-300">
          {/* Top Toolbar */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                type="button"
                onClick={() => setViewMode("gallery")}
                className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors flex items-center gap-1 text-xs font-bold cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Templates</span>
              </button>
              <div className="h-4 w-px bg-slate-200" />

              {/* Template Switcher Tabs */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs">
                {TEMPLATE_CARDS.map((tc) => (
                  <button
                    key={tc.id}
                    type="button"
                    onClick={() => setSelectedTemplate(tc.id)}
                    className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                      selectedTemplate === tc.id
                        ? "bg-pink-600 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {tc.badgeTitle}
                  </button>
                ))}
              </div>

              <div className="h-4 w-px bg-slate-200 hidden sm:block" />

              {/* Sample / Reset buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleLoadSample}
                  title="Load realistic sample resume data to test templates"
                  className="px-2.5 py-1.5 text-xs font-bold text-pink-700 bg-pink-50 hover:bg-pink-100 border border-pink-200/80 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-pink-600" />
                  <span className="hidden md:inline">Load Sample</span>
                </button>
                <button
                  type="button"
                  onClick={handleClearAll}
                  title="Clear all fields to start fresh"
                  className="px-2.5 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3 text-slate-500" />
                  <span className="hidden md:inline">Clear</span>
                </button>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
              <div className="lg:hidden flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setMobileBuilderTab("editor")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    mobileBuilderTab === "editor"
                      ? "bg-white text-pink-700 shadow-xs"
                      : "text-slate-500"
                  }`}
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setMobileBuilderTab("preview")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    mobileBuilderTab === "preview"
                      ? "bg-white text-pink-700 shadow-xs"
                      : "text-slate-500"
                  }`}
                >
                  Preview
                </button>
              </div>

              {selectedTemplate === "sb2nov" && (
                <button
                  type="button"
                  onClick={() => setShowLatexModal(true)}
                  className="bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-slate-800 font-bold text-xs px-3.5 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">LaTeX (.tex)</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleDownloadResume}
                className="bg-white hover:bg-slate-50 text-slate-800 hover:text-slate-900 border border-slate-200 hover:border-slate-300 font-bold text-xs px-4 py-2.5 rounded-xl shadow-2xs transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
              >
                <Download className="w-3.5 h-3.5 text-pink-600" />
                <span>Download Resume</span>
              </button>

              <button
                type="button"
                onClick={handleSaveResume}
                className="bg-pink-600 hover:bg-pink-700 active:scale-95 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-pink-500/25 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Resume</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Saved Banner */}
          {savedSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl p-3 sm:p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-xs animate-in fade-in slide-in-from-top-1">
              <div className="flex items-center gap-2.5 font-medium">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <span>
                  Resume saved successfully! You can access it anytime under <strong className="font-bold">Your Resumes</strong>.
                </span>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <Link
                  href="/career/resume-review"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl shadow-xs transition-colors shrink-0 text-xs"
                >
                  View in Workspace
                </Link>
              </div>
            </div>
          )}

          {/* Studio Workspace Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* ── Left Column: Form Editor (5 cols) ── */}
            <div
              className={`lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4 ${
                mobileBuilderTab === "preview" ? "hidden lg:block" : "block"
              }`}
            >
              {/* Section Navigation Tabs (Horizontal Scrollable) */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-100 text-xs scrollbar-none">
                {EDITOR_SECTIONS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveEditorSection(tab.id)}
                    className={`px-3 py-1.5 font-bold rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 ${
                      activeEditorSection === tab.id
                        ? "bg-pink-600 text-white shadow-xs shadow-pink-500/20"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* ────────────────────────────────────────────────────
                  1. CONTACT SECTION
              ──────────────────────────────────────────────────── */}
              {activeEditorSection === "contact" && (
                <div className="space-y-3.5 text-xs">
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">Full Name *</label>
                    <input
                      type="text"
                      value={resumeData.fullName}
                      onChange={(e) => setResumeData({ ...resumeData, fullName: e.target.value })}
                      placeholder="e.g. Aadithya Goud"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-pink-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-800 block mb-1">Target Role / Headline *</label>
                    <input
                      type="text"
                      value={resumeData.role}
                      onChange={(e) => setResumeData({ ...resumeData, role: e.target.value })}
                      placeholder="e.g. Fullstack Software Engineer"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-pink-600 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="font-bold text-slate-800 block mb-1">Email *</label>
                      <input
                        type="email"
                        value={resumeData.email}
                        onChange={(e) => setResumeData({ ...resumeData, email: e.target.value })}
                        placeholder="adithya@example.com"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-pink-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-800 block mb-1">Phone Number *</label>
                      <input
                        type="text"
                        value={resumeData.phone}
                        onChange={(e) => setResumeData({ ...resumeData, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-pink-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="font-bold text-slate-800 block mb-1">Location *</label>
                      <input
                        type="text"
                        value={resumeData.location}
                        onChange={(e) => setResumeData({ ...resumeData, location: e.target.value })}
                        placeholder="Hyderabad, India"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-pink-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-800 block mb-1">LinkedIn Profile</label>
                      <input
                        type="text"
                        value={resumeData.linkedin}
                        onChange={(e) => setResumeData({ ...resumeData, linkedin: e.target.value })}
                        placeholder="linkedin.com/in/username"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-pink-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="font-bold text-slate-800 block mb-1">GitHub Profile</label>
                      <input
                        type="text"
                        value={resumeData.github}
                        onChange={(e) => setResumeData({ ...resumeData, github: e.target.value })}
                        placeholder="github.com/username"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-pink-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-800 block mb-1">Personal Portfolio</label>
                      <input
                        type="text"
                        value={resumeData.portfolio || ""}
                        onChange={(e) => setResumeData({ ...resumeData, portfolio: e.target.value })}
                        placeholder="myportfolio.dev"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-pink-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Coding Profiles Section */}
                  <div className="pt-2 border-t border-slate-100 space-y-2.5">
                    <span className="font-black text-slate-700 text-[11px] uppercase tracking-wider block">
                      Coding Profiles (Competitive Programming)
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div>
                        <label className="font-bold text-slate-700 block mb-0.5 text-[11px]">LeetCode</label>
                        <input
                          type="text"
                          value={resumeData.leetcode || ""}
                          onChange={(e) => setResumeData({ ...resumeData, leetcode: e.target.value })}
                          placeholder="leetcode.com/u/handle"
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-0.5 text-[11px]">CodeChef</label>
                        <input
                          type="text"
                          value={resumeData.codechef || ""}
                          onChange={(e) => setResumeData({ ...resumeData, codechef: e.target.value })}
                          placeholder="codechef.com/users/handle"
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-0.5 text-[11px]">HackerRank</label>
                        <input
                          type="text"
                          value={resumeData.hackerrank || ""}
                          onChange={(e) => setResumeData({ ...resumeData, hackerrank: e.target.value })}
                          placeholder="hackerrank.com/profile/handle"
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ────────────────────────────────────────────────────
                  2. PROFESSIONAL SUMMARY
              ──────────────────────────────────────────────────── */}
              {activeEditorSection === "summary" && (
                <div className="space-y-3.5 text-xs">
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">
                      Professional Summary
                    </label>
                    <p className="text-slate-500 text-[11px] mb-2 leading-relaxed">
                      Highlight your core expertise, key achievements, and target roles in 2–4 concise sentences.
                    </p>
                    <textarea
                      rows={5}
                      value={resumeData.summary}
                      onChange={(e) => setResumeData({ ...resumeData, summary: e.target.value })}
                      placeholder="Write your professional career summary..."
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-pink-600 focus:outline-none resize-none leading-relaxed"
                    />
                    <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
                      <span>{resumeData.summary.length} characters</span>
                      <span className={resumeData.summary.length > 50 ? "text-emerald-600 font-bold" : "text-amber-500"}>
                        {resumeData.summary.length > 50 ? "Optimal Length ✓" : "Recommend 50+ chars"}
                      </span>
                    </div>
                  </div>

                  {/* AI / Quick Starter Prompts */}
                  <div className="bg-pink-50/50 p-3 rounded-xl border border-pink-100 space-y-2">
                    <span className="font-bold text-pink-900 text-[11px] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-pink-600" />
                      Quick Starter Templates
                    </span>
                    <div className="space-y-1.5">
                      {[
                        "Fullstack Software Engineer skilled in modern TypeScript, Next.js, and distributed microservices with high performance benchmarks.",
                        "Computer Science graduate with deep problem-solving expertise in data structures, algorithms, and full-stack cloud applications.",
                        "Results-oriented Backend Engineer experienced in REST APIs, database indexing, and Docker containerized production deployments.",
                      ].map((prompt, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setResumeData({ ...resumeData, summary: prompt })}
                          className="w-full text-left p-2 bg-white hover:bg-pink-100/50 border border-pink-200/60 rounded-lg text-[11px] text-slate-700 transition-colors"
                        >
                          "{prompt}"
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ────────────────────────────────────────────────────
                  3. WORK EXPERIENCE
              ──────────────────────────────────────────────────── */}
              {activeEditorSection === "experience" && (
                <div className="space-y-4 text-xs">
                  {resumeData.experience.length === 0 ? (
                    <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 space-y-2">
                      <Briefcase className="w-8 h-8 text-slate-400 mx-auto" />
                      <p className="font-bold text-slate-700 text-xs">No work experience added yet</p>
                      <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                        Add your internships, full-time positions, or freelance work with key impact metrics.
                      </p>
                    </div>
                  ) : (
                    resumeData.experience.map((exp, expIdx) => (
                      <div
                        key={expIdx}
                        className="p-3.5 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-2.5 relative"
                      >
                        <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                          <span className="font-extrabold text-slate-800 text-[11px]">
                            Position #{expIdx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = resumeData.experience.filter((_, i) => i !== expIdx);
                              setResumeData({ ...resumeData, experience: updated });
                            }}
                            className="text-rose-600 hover:text-rose-700 text-[11px] font-bold cursor-pointer flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Remove</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="font-bold text-slate-700 block mb-0.5">Company *</label>
                            <input
                              type="text"
                              value={exp.company}
                              onChange={(e) => {
                                const updated = [...resumeData.experience];
                                updated[expIdx].company = e.target.value;
                                setResumeData({ ...resumeData, experience: updated });
                              }}
                              placeholder="e.g. SkillsCatalyst"
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                            />
                          </div>
                          <div>
                            <label className="font-bold text-slate-700 block mb-0.5">Position / Role *</label>
                            <input
                              type="text"
                              value={exp.role}
                              onChange={(e) => {
                                const updated = [...resumeData.experience];
                                updated[expIdx].role = e.target.value;
                                setResumeData({ ...resumeData, experience: updated });
                              }}
                              placeholder="e.g. Lead Fullstack Engineer"
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="font-bold text-slate-700 block mb-0.5">Location</label>
                            <input
                              type="text"
                              value={exp.location}
                              onChange={(e) => {
                                const updated = [...resumeData.experience];
                                updated[expIdx].location = e.target.value;
                                setResumeData({ ...resumeData, experience: updated });
                              }}
                              placeholder="Hyderabad / Remote"
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                            />
                          </div>
                          <div className="flex items-end pb-1.5">
                            <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={exp.currentlyWorking ?? (exp.dates?.includes("Present") || exp.endDate === "Present")}
                                onChange={(e) => {
                                  const updated = [...resumeData.experience];
                                  const isCurrent = e.target.checked;
                                  updated[expIdx].currentlyWorking = isCurrent;
                                  if (isCurrent) {
                                    updated[expIdx].endDate = "Present";
                                    updated[expIdx].dates = `${updated[expIdx].startDate || "2024"} — Present`;
                                  }
                                  setResumeData({ ...resumeData, experience: updated });
                                }}
                                className="rounded text-pink-600 focus:ring-pink-500 w-3.5 h-3.5"
                              />
                              <span>Currently working here</span>
                            </label>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="font-bold text-slate-700 block mb-0.5">Start Date</label>
                            <input
                              type="text"
                              value={exp.startDate || ""}
                              onChange={(e) => {
                                const updated = [...resumeData.experience];
                                updated[expIdx].startDate = e.target.value;
                                updated[expIdx].dates = `${e.target.value} — ${updated[expIdx].currentlyWorking ? "Present" : updated[expIdx].endDate || "Present"}`;
                                setResumeData({ ...resumeData, experience: updated });
                              }}
                              placeholder="e.g. Jan 2024"
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                            />
                          </div>
                          <div>
                            <label className="font-bold text-slate-700 block mb-0.5">End Date</label>
                            <input
                              type="text"
                              disabled={exp.currentlyWorking}
                              value={exp.currentlyWorking ? "Present" : exp.endDate || ""}
                              onChange={(e) => {
                                const updated = [...resumeData.experience];
                                updated[expIdx].endDate = e.target.value;
                                updated[expIdx].dates = `${updated[expIdx].startDate || "2023"} — ${e.target.value}`;
                                setResumeData({ ...resumeData, experience: updated });
                              }}
                              placeholder="e.g. Dec 2024"
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs disabled:bg-slate-100 disabled:text-slate-400"
                            />
                          </div>
                        </div>

                        {/* Bullets & Achievements */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="font-bold text-slate-700 block text-[11px]">
                              Description &amp; Key Achievements (Bullet Points)
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...resumeData.experience];
                                updated[expIdx].bullets.push("");
                                setResumeData({ ...resumeData, experience: updated });
                              }}
                              className="text-pink-600 hover:text-pink-700 font-bold text-[10px] cursor-pointer"
                            >
                              + Add Bullet
                            </button>
                          </div>
                          <div className="space-y-1.5">
                            {exp.bullets.map((bullet, bIdx) => (
                              <div key={bIdx} className="flex items-center gap-1.5">
                                <input
                                  type="text"
                                  value={bullet}
                                  placeholder="e.g. Spearheaded core feature development, improving system latency by 25%."
                                  onChange={(e) => {
                                    const updated = [...resumeData.experience];
                                    updated[expIdx].bullets[bIdx] = e.target.value;
                                    setResumeData({ ...resumeData, experience: updated });
                                  }}
                                  className="flex-1 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                                />
                                {exp.bullets.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = [...resumeData.experience];
                                      updated[expIdx].bullets = updated[expIdx].bullets.filter((_, i) => i !== bIdx);
                                      setResumeData({ ...resumeData, experience: updated });
                                    }}
                                    className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                                  >
                                    ×
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setResumeData({
                        ...resumeData,
                        experience: [
                          ...resumeData.experience,
                          {
                            company: "",
                            role: "",
                            location: "",
                            startDate: "",
                            endDate: "",
                            currentlyWorking: false,
                            dates: "",
                            bullets: [""],
                          },
                        ],
                      });
                    }}
                    className="w-full py-2 bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200 rounded-xl font-bold transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{resumeData.experience.length === 0 ? "Add Work Experience" : "Add Another Experience"}</span>
                  </button>
                </div>
              )}

              {/* ────────────────────────────────────────────────────
                  4. EDUCATION
              ──────────────────────────────────────────────────── */}
              {activeEditorSection === "education" && (
                <div className="space-y-4 text-xs">
                  {resumeData.education.length === 0 ? (
                    <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 space-y-2">
                      <GraduationCap className="w-8 h-8 text-slate-400 mx-auto" />
                      <p className="font-bold text-slate-700 text-xs">No education details added yet</p>
                      <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                        Add your degree, university, GPA, and relevant coursework or academic leadership.
                      </p>
                    </div>
                  ) : (
                    resumeData.education.map((edu, eduIdx) => (
                      <div
                        key={eduIdx}
                        className="p-3.5 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-2.5"
                      >
                        <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                          <span className="font-extrabold text-slate-800 text-[11px]">
                            Education #{eduIdx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = resumeData.education.filter((_, i) => i !== eduIdx);
                              setResumeData({ ...resumeData, education: updated });
                            }}
                            className="text-rose-600 hover:text-rose-700 text-[11px] font-bold cursor-pointer flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Remove</span>
                          </button>
                        </div>

                        <div>
                          <label className="font-bold text-slate-700 block mb-0.5">School / University *</label>
                          <input
                            type="text"
                            value={edu.institution}
                            onChange={(e) => {
                              const updated = [...resumeData.education];
                              updated[eduIdx].institution = e.target.value;
                              setResumeData({ ...resumeData, education: updated });
                            }}
                            placeholder="e.g. Indian Institute of Information Technology"
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="font-bold text-slate-700 block mb-0.5">Degree *</label>
                            <input
                              type="text"
                              value={edu.degree}
                              onChange={(e) => {
                                const updated = [...resumeData.education];
                                updated[eduIdx].degree = e.target.value;
                                setResumeData({ ...resumeData, education: updated });
                              }}
                              placeholder="e.g. B.Tech / B.S."
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                            />
                          </div>
                          <div>
                            <label className="font-bold text-slate-700 block mb-0.5">Field of Study</label>
                            <input
                              type="text"
                              value={edu.fieldOfStudy || ""}
                              onChange={(e) => {
                                const updated = [...resumeData.education];
                                updated[eduIdx].fieldOfStudy = e.target.value;
                                setResumeData({ ...resumeData, education: updated });
                              }}
                              placeholder="Computer Science & Engineering"
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="font-bold text-slate-700 block mb-0.5">Location</label>
                            <input
                              type="text"
                              value={edu.location}
                              onChange={(e) => {
                                const updated = [...resumeData.education];
                                updated[eduIdx].location = e.target.value;
                                setResumeData({ ...resumeData, education: updated });
                              }}
                              placeholder="Hyderabad, India"
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                            />
                          </div>
                          <div>
                            <label className="font-bold text-slate-700 block mb-0.5">Start Date</label>
                            <input
                              type="text"
                              value={edu.startDate || ""}
                              onChange={(e) => {
                                const updated = [...resumeData.education];
                                updated[eduIdx].startDate = e.target.value;
                                updated[eduIdx].dates = `${e.target.value} — ${updated[eduIdx].endDate || "2025"}`;
                                setResumeData({ ...resumeData, education: updated });
                              }}
                              placeholder="2021"
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                            />
                          </div>
                          <div>
                            <label className="font-bold text-slate-700 block mb-0.5">End Date</label>
                            <input
                              type="text"
                              value={edu.endDate || ""}
                              onChange={(e) => {
                                const updated = [...resumeData.education];
                                updated[eduIdx].endDate = e.target.value;
                                updated[eduIdx].dates = `${updated[eduIdx].startDate || "2021"} — ${e.target.value}`;
                                setResumeData({ ...resumeData, education: updated });
                              }}
                              placeholder="2025"
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="font-bold text-slate-700 block mb-0.5">GPA Type</label>
                            <select
                              value={edu.gpaType || "CGPA"}
                              onChange={(e) => {
                                const updated = [...resumeData.education];
                                updated[eduIdx].gpaType = e.target.value;
                                setResumeData({ ...resumeData, education: updated });
                              }}
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                            >
                              <option value="CGPA">CGPA (out of 10)</option>
                              <option value="GPA">GPA (out of 4)</option>
                              <option value="Percentage">Percentage (%)</option>
                            </select>
                          </div>
                          <div>
                            <label className="font-bold text-slate-700 block mb-0.5">GPA Value</label>
                            <input
                              type="text"
                              value={edu.gpa || ""}
                              onChange={(e) => {
                                const updated = [...resumeData.education];
                                updated[eduIdx].gpa = e.target.value;
                                setResumeData({ ...resumeData, education: updated });
                              }}
                              placeholder="e.g. 8.9 / 10.0"
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="font-bold text-slate-700 block mb-0.5">Achievements &amp; Activities</label>
                          <input
                            type="text"
                            value={edu.activities || ""}
                            onChange={(e) => {
                              const updated = [...resumeData.education];
                              updated[eduIdx].activities = e.target.value;
                              setResumeData({ ...resumeData, education: updated });
                            }}
                            placeholder="e.g. President of Coding Club, Dean's List (2022-2023)"
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                          />
                        </div>
                      </div>
                    ))
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setResumeData({
                        ...resumeData,
                        education: [
                          ...resumeData.education,
                          {
                            institution: "",
                            degree: "",
                            fieldOfStudy: "",
                            location: "",
                            startDate: "",
                            endDate: "",
                            dates: "",
                            gpaType: "CGPA",
                            gpa: "",
                            activities: "",
                          },
                        ],
                      });
                    }}
                    className="w-full py-2 bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200 rounded-xl font-bold transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{resumeData.education.length === 0 ? "Add Education" : "Add Another Education"}</span>
                  </button>
                </div>
              )}

              {/* ────────────────────────────────────────────────────
                  5. SKILLS
              ──────────────────────────────────────────────────── */}
              {activeEditorSection === "skills" && (
                <div className="space-y-3.5 text-xs">
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">Languages</label>
                    <input
                      type="text"
                      value={resumeData.skills?.languages || ""}
                      onChange={(e) =>
                        setResumeData({
                          ...resumeData,
                          skills: { ...resumeData.skills, languages: e.target.value },
                        })
                      }
                      placeholder="e.g. Python, Java, C++, TypeScript, JavaScript, SQL"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-pink-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-800 block mb-1">Frameworks &amp; Libraries</label>
                    <input
                      type="text"
                      value={resumeData.skills?.frameworks || ""}
                      onChange={(e) =>
                        setResumeData({
                          ...resumeData,
                          skills: { ...resumeData.skills, frameworks: e.target.value },
                        })
                      }
                      placeholder="e.g. React, Next.js, FastAPI, Node.js, Express, Tailwind CSS"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-pink-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-800 block mb-1">Databases</label>
                    <input
                      type="text"
                      value={resumeData.skills?.databases || ""}
                      onChange={(e) =>
                        setResumeData({
                          ...resumeData,
                          skills: { ...resumeData.skills, databases: e.target.value },
                        })
                      }
                      placeholder="e.g. PostgreSQL, MongoDB, Redis, Supabase, MySQL"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-pink-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-800 block mb-1">Developer Tools</label>
                    <input
                      type="text"
                      value={resumeData.skills?.tools || ""}
                      onChange={(e) =>
                        setResumeData({
                          ...resumeData,
                          skills: { ...resumeData.skills, tools: e.target.value },
                        })
                      }
                      placeholder="e.g. Docker, Git, Linux, Postman, Vercel, VS Code"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-pink-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-800 block mb-1">Cloud &amp; DevOps</label>
                    <input
                      type="text"
                      value={resumeData.skills?.cloudDevOps || ""}
                      onChange={(e) =>
                        setResumeData({
                          ...resumeData,
                          skills: { ...resumeData.skills, cloudDevOps: e.target.value },
                        })
                      }
                      placeholder="e.g. AWS (EC2, S3, Lambda), Azure, Docker, Kubernetes, CI/CD"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-pink-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-800 block mb-1">Soft Skills &amp; Core Competencies</label>
                    <input
                      type="text"
                      value={resumeData.skills?.softSkills || ""}
                      onChange={(e) =>
                        setResumeData({
                          ...resumeData,
                          skills: { ...resumeData.skills, softSkills: e.target.value },
                        })
                      }
                      placeholder="e.g. Problem Solving, Agile Collaboration, Technical Writing"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-pink-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-800 block mb-1">Custom Category / Other Skills</label>
                    <input
                      type="text"
                      value={resumeData.skills?.custom || ""}
                      onChange={(e) =>
                        setResumeData({
                          ...resumeData,
                          skills: { ...resumeData.skills, custom: e.target.value },
                        })
                      }
                      placeholder="e.g. System Design, REST APIs, Microservices Architecture"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-pink-600 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* ────────────────────────────────────────────────────
                  6. PROJECTS
              ──────────────────────────────────────────────────── */}
              {activeEditorSection === "projects" && (
                <div className="space-y-4 text-xs">
                  {resumeData.projects.length === 0 ? (
                    <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 space-y-2">
                      <FolderGit2 className="w-8 h-8 text-slate-400 mx-auto" />
                      <p className="font-bold text-slate-700 text-xs">No projects added yet</p>
                      <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                        Add personal, open-source, or academic projects with tech stack and live links.
                      </p>
                    </div>
                  ) : (
                    resumeData.projects.map((proj, projIdx) => (
                      <div
                        key={projIdx}
                        className="p-3.5 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-2.5"
                      >
                        <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                          <span className="font-extrabold text-slate-800 text-[11px]">
                            Project #{projIdx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = resumeData.projects.filter((_, i) => i !== projIdx);
                              setResumeData({ ...resumeData, projects: updated });
                            }}
                            className="text-rose-600 hover:text-rose-700 text-[11px] font-bold cursor-pointer flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Remove</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="font-bold text-slate-700 block mb-0.5">Project Name *</label>
                            <input
                              type="text"
                              value={proj.name}
                              onChange={(e) => {
                                const updated = [...resumeData.projects];
                                updated[projIdx].name = e.target.value;
                                setResumeData({ ...resumeData, projects: updated });
                              }}
                              placeholder="e.g. SkillsCatalyst AI Suite"
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                            />
                          </div>
                          <div>
                            <label className="font-bold text-slate-700 block mb-0.5">Tech Used *</label>
                            <input
                              type="text"
                              value={proj.tech}
                              onChange={(e) => {
                                const updated = [...resumeData.projects];
                                updated[projIdx].tech = e.target.value;
                                setResumeData({ ...resumeData, projects: updated });
                              }}
                              placeholder="Next.js, FastAPI, PostgreSQL"
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="font-bold text-slate-700 block mb-0.5">Start Date</label>
                            <input
                              type="text"
                              value={proj.startDate || ""}
                              onChange={(e) => {
                                const updated = [...resumeData.projects];
                                updated[projIdx].startDate = e.target.value;
                                setResumeData({ ...resumeData, projects: updated });
                              }}
                              placeholder="e.g. Feb 2024"
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                            />
                          </div>
                          <div>
                            <label className="font-bold text-slate-700 block mb-0.5">End Date</label>
                            <input
                              type="text"
                              value={proj.endDate || ""}
                              onChange={(e) => {
                                const updated = [...resumeData.projects];
                                updated[projIdx].endDate = e.target.value;
                                setResumeData({ ...resumeData, projects: updated });
                              }}
                              placeholder="e.g. May 2024"
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="font-bold text-slate-700 block mb-0.5">Project URL / Live Demo</label>
                            <input
                              type="text"
                              value={proj.link || ""}
                              onChange={(e) => {
                                const updated = [...resumeData.projects];
                                updated[projIdx].link = e.target.value;
                                setResumeData({ ...resumeData, projects: updated });
                              }}
                              placeholder="e.g. myapp.vercel.app"
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                            />
                          </div>
                          <div>
                            <label className="font-bold text-slate-700 block mb-0.5">GitHub URL</label>
                            <input
                              type="text"
                              value={proj.githubUrl || ""}
                              onChange={(e) => {
                                const updated = [...resumeData.projects];
                                updated[projIdx].githubUrl = e.target.value;
                                setResumeData({ ...resumeData, projects: updated });
                              }}
                              placeholder="github.com/user/project"
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                            />
                          </div>
                        </div>

                        {/* Bullets */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="font-bold text-slate-700 block text-[11px]">
                              Description &amp; Key Features (Bullet Points)
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...resumeData.projects];
                                updated[projIdx].bullets.push("");
                                setResumeData({ ...resumeData, projects: updated });
                              }}
                              className="text-pink-600 hover:text-pink-700 font-bold text-[10px] cursor-pointer"
                            >
                              + Add Bullet
                            </button>
                          </div>
                          <div className="space-y-1.5">
                            {proj.bullets.map((bullet, bIdx) => (
                              <div key={bIdx} className="flex items-center gap-1.5">
                                <input
                                  type="text"
                                  value={bullet}
                                  placeholder="e.g. Architected resilient state management and interactive visualizations."
                                  onChange={(e) => {
                                    const updated = [...resumeData.projects];
                                    updated[projIdx].bullets[bIdx] = e.target.value;
                                    setResumeData({ ...resumeData, projects: updated });
                                  }}
                                  className="flex-1 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                                />
                                {proj.bullets.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = [...resumeData.projects];
                                      updated[projIdx].bullets = updated[projIdx].bullets.filter((_, i) => i !== bIdx);
                                      setResumeData({ ...resumeData, projects: updated });
                                    }}
                                    className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                                  >
                                    ×
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setResumeData({
                        ...resumeData,
                        projects: [
                          ...resumeData.projects,
                          {
                            name: "",
                            tech: "",
                            startDate: "",
                            endDate: "",
                            link: "",
                            githubUrl: "",
                            bullets: [""],
                          },
                        ],
                      });
                    }}
                    className="w-full py-2 bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200 rounded-xl font-bold transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{resumeData.projects.length === 0 ? "Add Project" : "Add Another Project"}</span>
                  </button>
                </div>
              )}

              {/* ────────────────────────────────────────────────────
                  7. CERTIFICATIONS
              ──────────────────────────────────────────────────── */}
              {activeEditorSection === "certifications" && (
                <div className="space-y-4 text-xs">
                  {(resumeData.certifications || []).length === 0 ? (
                    <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 space-y-2">
                      <Award className="w-8 h-8 text-slate-400 mx-auto" />
                      <p className="font-bold text-slate-700 text-xs">No certifications added yet</p>
                      <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                        Add technical credentials, cloud certifications (AWS/GCP), or verified course honors.
                      </p>
                    </div>
                  ) : (
                    (resumeData.certifications || []).map((cert, certIdx) => (
                      <div
                        key={certIdx}
                        className="p-3.5 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-2.5"
                      >
                        <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                          <span className="font-extrabold text-slate-800 text-[11px]">
                            Certificate #{certIdx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = (resumeData.certifications || []).filter((_, i) => i !== certIdx);
                              setResumeData({ ...resumeData, certifications: updated });
                            }}
                            className="text-rose-600 hover:text-rose-700 text-[11px] font-bold cursor-pointer flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Remove</span>
                          </button>
                        </div>

                        <div>
                          <label className="font-bold text-slate-700 block mb-0.5">Certificate Name *</label>
                          <input
                            type="text"
                            value={cert.name}
                            onChange={(e) => {
                              const updated = [...(resumeData.certifications || [])];
                              updated[certIdx].name = e.target.value;
                              setResumeData({ ...resumeData, certifications: updated });
                            }}
                            placeholder="e.g. AWS Certified Solutions Architect"
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="font-bold text-slate-700 block mb-0.5">Issuing Organization *</label>
                            <input
                              type="text"
                              value={cert.issuer}
                              onChange={(e) => {
                                const updated = [...(resumeData.certifications || [])];
                                updated[certIdx].issuer = e.target.value;
                                setResumeData({ ...resumeData, certifications: updated });
                              }}
                              placeholder="e.g. Amazon Web Services / Coursera"
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                            />
                          </div>
                          <div>
                            <label className="font-bold text-slate-700 block mb-0.5">Date Issued</label>
                            <input
                              type="text"
                              value={cert.date}
                              onChange={(e) => {
                                const updated = [...(resumeData.certifications || [])];
                                updated[certIdx].date = e.target.value;
                                setResumeData({ ...resumeData, certifications: updated });
                              }}
                              placeholder="e.g. 2024"
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="font-bold text-slate-700 block mb-0.5">Credential Verification URL</label>
                          <input
                            type="text"
                            value={cert.credentialUrl || ""}
                            onChange={(e) => {
                              const updated = [...(resumeData.certifications || [])];
                              updated[certIdx].credentialUrl = e.target.value;
                              setResumeData({ ...resumeData, certifications: updated });
                            }}
                            placeholder="e.g. aws.amazon.com/verify/12345"
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                          />
                        </div>
                      </div>
                    ))
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setResumeData({
                        ...resumeData,
                        certifications: [
                          ...(resumeData.certifications || []),
                          {
                            name: "",
                            issuer: "",
                            date: "",
                            credentialUrl: "",
                          },
                        ],
                      });
                    }}
                    className="w-full py-2 bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200 rounded-xl font-bold transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{(resumeData.certifications || []).length === 0 ? "Add Certificate" : "Add Another Certificate"}</span>
                  </button>
                </div>
              )}

              {/* ────────────────────────────────────────────────────
                  8. LANGUAGES
              ──────────────────────────────────────────────────── */}
              {activeEditorSection === "languages" && (
                <div className="space-y-4 text-xs">
                  {(resumeData.spokenLanguages || []).length === 0 ? (
                    <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 space-y-2">
                      <LanguagesIcon className="w-8 h-8 text-slate-400 mx-auto" />
                      <p className="font-bold text-slate-700 text-xs">No languages added yet</p>
                      <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                        Add languages you speak along with your proficiency level (e.g. English, Telugu, Hindi).
                      </p>
                    </div>
                  ) : (
                    (resumeData.spokenLanguages || []).map((lang, langIdx) => (
                      <div
                        key={langIdx}
                        className="p-3 bg-slate-50/70 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-2.5"
                      >
                        <div className="flex-1">
                          <label className="font-bold text-slate-700 block mb-0.5">Language Name</label>
                          <input
                            type="text"
                            value={lang.name}
                            onChange={(e) => {
                              const updated = [...(resumeData.spokenLanguages || [])];
                              updated[langIdx].name = e.target.value;
                              setResumeData({ ...resumeData, spokenLanguages: updated });
                            }}
                            placeholder="e.g. English, Telugu, Hindi"
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                          />
                        </div>
                        <div className="w-48">
                          <label className="font-bold text-slate-700 block mb-0.5">Proficiency Level</label>
                          <select
                            value={lang.proficiency}
                            onChange={(e) => {
                              const updated = [...(resumeData.spokenLanguages || [])];
                              updated[langIdx].proficiency = e.target.value;
                              setResumeData({ ...resumeData, spokenLanguages: updated });
                            }}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                          >
                            <option value="Native / Bilingual">Native / Bilingual</option>
                            <option value="Fluent / Professional">Fluent / Professional</option>
                            <option value="Conversational / Intermediate">Conversational / Intermediate</option>
                            <option value="Basic">Basic</option>
                          </select>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = (resumeData.spokenLanguages || []).filter((_, i) => i !== langIdx);
                            setResumeData({ ...resumeData, spokenLanguages: updated });
                          }}
                          className="text-rose-500 hover:text-rose-700 p-1.5 mt-4 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setResumeData({
                        ...resumeData,
                        spokenLanguages: [
                          ...(resumeData.spokenLanguages || []),
                          {
                            name: "",
                            proficiency: "Fluent / Professional",
                          },
                        ],
                      });
                    }}
                    className="w-full py-2 bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200 rounded-xl font-bold transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{(resumeData.spokenLanguages || []).length === 0 ? "Add Language" : "Add Another Language"}</span>
                  </button>
                </div>
              )}

              {/* ────────────────────────────────────────────────────
                  9. ACHIEVEMENTS
              ──────────────────────────────────────────────────── */}
              {activeEditorSection === "achievements" && (
                <div className="space-y-4 text-xs">
                  {(resumeData.achievements || []).length === 0 ? (
                    <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 space-y-2">
                      <Trophy className="w-8 h-8 text-slate-400 mx-auto" />
                      <p className="font-bold text-slate-700 text-xs">No achievements added yet</p>
                      <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                        Add contest ranks, hackathon wins, competitive programming ratings, or awards.
                      </p>
                    </div>
                  ) : (
                    (resumeData.achievements || []).map((ach, achIdx) => (
                      <div
                        key={achIdx}
                        className="p-3.5 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-2.5"
                      >
                        <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                          <span className="font-extrabold text-slate-800 text-[11px]">
                            Achievement #{achIdx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = (resumeData.achievements || []).filter((_, i) => i !== achIdx);
                              setResumeData({ ...resumeData, achievements: updated });
                            }}
                            className="text-rose-600 hover:text-rose-700 text-[11px] font-bold cursor-pointer flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Remove</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div className="col-span-2">
                            <label className="font-bold text-slate-700 block mb-0.5">Achievement Title *</label>
                            <input
                              type="text"
                              value={ach.title}
                              onChange={(e) => {
                                const updated = [...(resumeData.achievements || [])];
                                updated[achIdx].title = e.target.value;
                                setResumeData({ ...resumeData, achievements: updated });
                              }}
                              placeholder="e.g. Winner - Smart India Hackathon 2024"
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                            />
                          </div>
                          <div>
                            <label className="font-bold text-slate-700 block mb-0.5">Date</label>
                            <input
                              type="text"
                              value={ach.date || ""}
                              onChange={(e) => {
                                const updated = [...(resumeData.achievements || [])];
                                updated[achIdx].date = e.target.value;
                                setResumeData({ ...resumeData, achievements: updated });
                              }}
                              placeholder="e.g. 2024"
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="font-bold text-slate-700 block mb-0.5">Description (optional)</label>
                          <input
                            type="text"
                            value={ach.description || ""}
                            onChange={(e) => {
                              const updated = [...(resumeData.achievements || [])];
                              updated[achIdx].description = e.target.value;
                              setResumeData({ ...resumeData, achievements: updated });
                            }}
                            placeholder="Rank 1/500+ teams nationwide for automated disaster dispatch AI system."
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                          />
                        </div>
                      </div>
                    ))
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setResumeData({
                        ...resumeData,
                        achievements: [
                          ...(resumeData.achievements || []),
                          {
                            title: "",
                            description: "",
                            date: "",
                          },
                        ],
                      });
                    }}
                    className="w-full py-2 bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200 rounded-xl font-bold transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{(resumeData.achievements || []).length === 0 ? "Add Achievement" : "Add Another Achievement"}</span>
                  </button>
                </div>
              )}

              {/* ────────────────────────────────────────────────────
                  10. FINISH & EXPORT
              ──────────────────────────────────────────────────── */}
              {activeEditorSection === "review" && (
                <div className="space-y-4 text-xs">
                  {/* Completion Card */}
                  <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4.5 sm:p-5 rounded-2xl border border-slate-700 shadow-md space-y-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-pink-500/20 border border-pink-500/40 text-pink-400 flex items-center justify-center shrink-0">
                        <Check className="w-5 h-5 stroke-[2.5]" />
                      </div>
                      <div>
                        <h3 className="text-base font-extrabold text-white">Your Resume is Ready!</h3>
                        <p className="text-[11px] text-slate-300">
                          Review the live preview on the right. You can now download your PDF or save it to your workspace.
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-700/60 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[11px]">
                      <div className="bg-slate-800/80 p-2 rounded-xl border border-slate-700/50">
                        <span className="text-slate-400 block text-[10px]">Template</span>
                        <span className="font-bold text-pink-400 uppercase tracking-tight">
                          {selectedTemplate}
                        </span>
                      </div>
                      <div className="bg-slate-800/80 p-2 rounded-xl border border-slate-700/50">
                        <span className="text-slate-400 block text-[10px]">Experience</span>
                        <span className="font-bold text-white">
                          {resumeData.experience?.length || 0} entries
                        </span>
                      </div>
                      <div className="bg-slate-800/80 p-2 rounded-xl border border-slate-700/50">
                        <span className="text-slate-400 block text-[10px]">Education</span>
                        <span className="font-bold text-white">
                          {resumeData.education?.length || 0} entries
                        </span>
                      </div>
                      <div className="bg-slate-800/80 p-2 rounded-xl border border-slate-700/50">
                        <span className="text-slate-400 block text-[10px]">Projects</span>
                        <span className="font-bold text-white">
                          {resumeData.projects?.length || 0} entries
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={handleDownloadResume}
                      className="py-3 bg-pink-600 hover:bg-pink-700 active:scale-98 text-white rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-pink-500/25 transition-all text-xs"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download / Print PDF</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveResume}
                      className="py-3 bg-slate-900 hover:bg-slate-800 active:scale-98 text-white rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all text-xs"
                    >
                      <Save className="w-4 h-4 text-pink-400" />
                      <span>Save to Workspace</span>
                    </button>
                  </div>

                  {selectedTemplate === "sb2nov" && (
                    <button
                      type="button"
                      onClick={() => setShowLatexModal(true)}
                      className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors border border-slate-200 text-xs"
                    >
                      <Code2 className="w-4 h-4 text-emerald-600" />
                      <span>View &amp; Copy LaTeX (.tex) Source</span>
                    </button>
                  )}

                  {/* Link to Resume Scanner for ATS check */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <span className="font-extrabold text-slate-800 text-[11px] block">
                        Want an in-depth ATS scan?
                      </span>
                      <p className="text-[11px] text-slate-500">
                        Scan your completed resume against specific job descriptions in our AI Resume Scanner.
                      </p>
                    </div>
                    <Link
                      href="/career/resume-review"
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 font-bold text-slate-700 text-[11px] shrink-0 transition-colors shadow-2xs self-start sm:self-auto"
                    >
                      Open Scanner →
                    </Link>
                  </div>
                </div>
              )}

              {/* ────────────────────────────────────────────────────
                  STEPPER FOOTER: PREVIOUS & NEXT
              ──────────────────────────────────────────────────── */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs font-bold">
                <button
                  type="button"
                  disabled={currentSectionIdx === 0}
                  onClick={goToPrevSection}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>

                <div className="text-[11px] text-slate-400 font-semibold">
                  Step {currentSectionIdx + 1} of {EDITOR_SECTIONS.length}
                </div>

                {currentSectionIdx < EDITOR_SECTIONS.length - 1 ? (
                  <button
                    type="button"
                    onClick={goToNextSection}
                    className="px-3.5 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white flex items-center gap-1 cursor-pointer transition-colors shadow-xs shadow-pink-500/20"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleDownloadResume}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                  >
                    <span>Download PDF</span>
                    <Download className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* ── Right Column: Document Preview (7 cols) ── */}
            <div
              className={`lg:col-span-7 ${
                mobileBuilderTab === "editor" ? "hidden lg:block" : "block"
              }`}
            >
              <ResumeLivePreview
                data={resumeData}
                templateId={selectedTemplate}
                onTemplateChange={(tmpl) => setSelectedTemplate(tmpl)}
              />
            </div>
          </div>
        </div>
      )}

      {/* LaTeX Code Modal (for SB2Nov) */}
      {showLatexModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 max-w-2xl w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-emerald-400" />
                <h3 className="font-black text-sm text-white">
                  SB2Nov LaTeX Source Code (.tex)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowLatexModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 text-xs"
              >
                Close
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Copy this code and paste directly into{" "}
              <span className="text-emerald-400 font-bold">Overleaf</span> or compile with{" "}
              <code className="text-slate-200 bg-slate-800 px-1 py-0.5 rounded">pdflatex</code>.
            </p>

            <div className="relative">
              <pre className="bg-slate-950 text-slate-300 p-4 rounded-xl text-[11px] font-mono max-h-80 overflow-y-auto border border-slate-800 whitespace-pre">
                {generateSB2NovLaTeX(resumeData)}
              </pre>

              <button
                type="button"
                onClick={handleCopyLatex}
                className="absolute top-3 right-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                {copiedLatex ? (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy LaTeX</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowLatexModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ResumeBuilderPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-slate-500 font-bold text-sm">
          Loading Resume Studio...
        </div>
      }
    >
      <ResumeBuilderInner />
    </React.Suspense>
  );
}
