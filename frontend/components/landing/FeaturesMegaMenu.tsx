"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  BookOpen,
  Code2,
  Award,
  FileText,
  GraduationCap,
  Calendar,
  Newspaper,
  ChevronRight,
} from "lucide-react";

export interface FeatureCard {
  title: string;
  subtitle: string;
  href: string;
}

export interface FeatureCategory {
  id: string;
  label: string;
  icon: React.ElementType;
  title: string;
  description: string;
  subheading: string;
  cards: FeatureCard[];
  viewAllText: string;
  viewAllHref: string;
}

export const FEATURE_CATEGORIES: FeatureCategory[] = [
  {
    id: "roadmaps",
    label: "Roadmaps",
    icon: Briefcase,
    title: "Roadmaps",
    description:
      "Step-by-step roadmaps showing what to learn, which projects to build and key milestones for each tech role.",
    subheading: "Popular roadmaps",
    cards: [
      {
        title: "Frontend Developer Roadmap",
        subtitle: "Beginner · React, Next.js & Modern UI",
        href: "/roadmaps",
      },
      {
        title: "Backend Developer Roadmap",
        subtitle: "Beginner · Node.js, Python & Cloud APIs",
        href: "/roadmaps",
      },
      {
        title: "Full Stack Developer Roadmap",
        subtitle: "Beginner · End-to-end full stack architecture",
        href: "/roadmaps",
      },
      {
        title: "DevOps Engineer Roadmap",
        subtitle: "Intermediate · Docker, Kubernetes & CI/CD",
        href: "/roadmaps",
      },
      {
        title: "Data Analyst Roadmap",
        subtitle: "Beginner · Python, SQL & Data Insights",
        href: "/roadmaps",
      },
      {
        title: "AI Engineer Roadmap",
        subtitle: "Intermediate · PyTorch, LLMs & AI Systems",
        href: "/roadmaps",
      },
    ],
    viewAllText: "View all roadmaps",
    viewAllHref: "/roadmaps",
  },
  {
    id: "courses",
    label: "Courses",
    icon: BookOpen,
    title: "Courses",
    description:
      "Structured video tracks, curated playlists and hands-on modules designed for engineering campus and placement readiness.",
    subheading: "Popular courses",
    cards: [
      {
        title: "Python Programming Masterclass",
        subtitle: "Beginner to advanced · 40+ lessons",
        href: "/learning",
      },
      {
        title: "Modern React & Next.js",
        subtitle: "Frontend development · 35+ lessons",
        href: "/learning",
      },
      {
        title: "Data Structures & Algorithms in C++",
        subtitle: "Campus prep · 60+ problems",
        href: "/learning",
      },
      {
        title: "System Design Fundamentals",
        subtitle: "Architecting scalable cloud apps",
        href: "/learning",
      },
      {
        title: "SQL & Database Architecture",
        subtitle: "PostgreSQL queries & indexing",
        href: "/learning",
      },
      {
        title: "Generative AI & LLM Engineering",
        subtitle: "Modern AI stack · RAG & Agents",
        href: "/learning",
      },
    ],
    viewAllText: "View all courses",
    viewAllHref: "/learning",
  },
  {
    id: "practice",
    label: "Practice",
    icon: Code2,
    title: "Coding Practice & Problem Solving",
    description:
      "Curated Data Structures & Algorithms, real-world coding challenges, and campus recruitment problem sets.",
    subheading: "Practice tracks",
    cards: [
      {
        title: "DSA Core: Arrays & Strings",
        subtitle: "Essential coding patterns · 45 questions",
        href: "/practice",
      },
      {
        title: "Trees & Dynamic Programming",
        subtitle: "Recursion, memoization & graphs",
        href: "/practice",
      },
      {
        title: "SQL Query Arena",
        subtitle: "Joins, aggregations, CTEs & window functions",
        href: "/practice",
      },
      {
        title: "System Design Scenarios",
        subtitle: "Rate limiters, URL shorteners & feeds",
        href: "/practice",
      },
      {
        title: "Campus Placement Contests",
        subtitle: "Timed weekly tests modeled on hiring rounds",
        href: "/practice",
      },
      {
        title: "AI Mentor Code Reviews",
        subtitle: "Instant line-by-line feedback & hints",
        href: "/ai-mentor",
      },
    ],
    viewAllText: "Explore practice arena",
    viewAllHref: "/practice",
  },
  {
    id: "interview-prep",
    label: "Interview prep",
    icon: Award,
    title: "Interview Prep & Placement Tests",
    description:
      "Curated company-wise question archives, aptitude tests, and real placement test patterns from top recruiters.",
    subheading: "Popular company tracks",
    cards: [
      {
        title: "FAANG & Tier-1 Giants",
        subtitle: "Amazon, Google, Microsoft, Meta",
        href: "/practice",
      },
      {
        title: "High-Growth Product Startups",
        subtitle: "Uber, Swiggy, Zomato, Razorpay",
        href: "/practice",
      },
      {
        title: "Service & IT Giants",
        subtitle: "TCS NQT, Infosys, Wipro, Accenture",
        href: "/practice",
      },
      {
        title: "Fintech & Banking",
        subtitle: "Goldman Sachs, Morgan Stanley, JP Morgan",
        href: "/practice",
      },
      {
        title: "Quantitative Aptitude",
        subtitle: "Arithmetic, speed math & analytical",
        href: "/practice",
      },
      {
        title: "Core CS Fundamentals",
        subtitle: "OS, DBMS, Networks & OOP concepts",
        href: "/practice",
      },
    ],
    viewAllText: "Practice interview questions",
    viewAllHref: "/practice",
  },
  {
    id: "resume-prep",
    label: "Resume prep",
    icon: FileText,
    title: "Resume Prep & ATS Analyzer",
    description:
      "AI-powered resume evaluation, ATS score benchmarking, and role-matched keyword optimization.",
    subheading: "Resume & career tools",
    cards: [
      {
        title: "AI ATS Resume Scanner",
        subtitle: "Instant match score & keyword auditor",
        href: "/career",
      },
      {
        title: "Tech Resume Builder",
        subtitle: "Recruiter-tested clean LaTeX templates",
        href: "/career",
      },
      {
        title: "Job Description Matcher",
        subtitle: "Compare your resume against any tech JD",
        href: "/career",
      },
      {
        title: "Bullet Point Enhancer",
        subtitle: "Convert passive bullets into metrics",
        href: "/career",
      },
      {
        title: "GitHub & LinkedIn Review",
        subtitle: "Showcase verified skills & projects",
        href: "/career",
      },
      {
        title: "Portfolio Project Auditor",
        subtitle: "Make side projects stand out to recruiters",
        href: "/career",
      },
    ],
    viewAllText: "Analyze your resume now",
    viewAllHref: "/career",
  },
  {
    id: "scholarships",
    label: "Scholarships",
    icon: GraduationCap,
    title: "Student Scholarships & Grants",
    description:
      "Discover verified engineering scholarships, diversity grants, and corporate student financial programs.",
    subheading: "Featured opportunities",
    cards: [
      {
        title: "Reliance Foundation Undergraduate",
        subtitle: "Merit-cum-means grant up to ₹2 Lakhs",
        href: "/explore?tab=scholarships",
      },
      {
        title: "Google Generation Scholarship",
        subtitle: "Women in tech & CS students APAC",
        href: "/explore?tab=scholarships",
      },
      {
        title: "Adobe India Women-in-Technology",
        subtitle: "Mentorship, internship & tuition aid",
        href: "/explore?tab=scholarships",
      },
      {
        title: "Tata Trust Engineering Grants",
        subtitle: "Need-based financial aid for engineering",
        href: "/explore?tab=scholarships",
      },
      {
        title: "HDFC Badhte Kadam Scholarship",
        subtitle: "Support for high-potential college students",
        href: "/explore?tab=scholarships",
      },
      {
        title: "National Merit Scholarships",
        subtitle: "NSP, Vidyasaarathi & government schemes",
        href: "/explore?tab=scholarships",
      },
    ],
    viewAllText: "Explore all scholarships",
    viewAllHref: "/explore?tab=scholarships",
  },
  {
    id: "events",
    label: "Events",
    icon: Calendar,
    title: "Hackathons, Summits & Tech Events",
    description:
      "Join upcoming developer hackathons, campus coding competitions, webinars, and national tech symposiums.",
    subheading: "Upcoming events & hackathons",
    cards: [
      {
        title: "National Student Hackathon 2026",
        subtitle: "48-hour build with industry mentors & cash prizes",
        href: "/explore?tab=events",
      },
      {
        title: "AI & GenAI Buildathon",
        subtitle: "Build autonomous agents & LLM apps",
        href: "/explore?tab=events",
      },
      {
        title: "Smart India Hackathon Hub",
        subtitle: "Problem statements, team pods & guidelines",
        href: "/explore?tab=events",
      },
      {
        title: "Open Source Campus Sprint",
        subtitle: "Contribute to live GitHub repositories",
        href: "/explore?tab=events",
      },
      {
        title: "Placement Masterclass Webinars",
        subtitle: "AMA sessions with senior engineers & HRs",
        href: "/explore?tab=events",
      },
      {
        title: "University Tech Fest Roster",
        subtitle: "Inter-college competitions & symposiums",
        href: "/explore?tab=events",
      },
    ],
    viewAllText: "View all tech events",
    viewAllHref: "/explore?tab=events",
  },
  {
    id: "tech-news",
    label: "Tech news",
    icon: Newspaper,
    title: "Curated Tech News & Industry Drops",
    description:
      "Bite-sized, zero-click engineering updates, AI breakthroughs, startup funding rounds, and dev ecosystem news.",
    subheading: "Trending topics & stories",
    cards: [
      {
        title: "AI & LLM Frontier",
        subtitle: "Latest foundation model releases & research",
        href: "/explore?tab=news",
      },
      {
        title: "Developer Tools & Frameworks",
        subtitle: "Next.js, Python 3.13, Rust & Cloud updates",
        href: "/explore?tab=news",
      },
      {
        title: "Big Tech Engineering Blogs",
        subtitle: "Architecture teardowns from Netflix & Uber",
        href: "/explore?tab=news",
      },
      {
        title: "Startup & Funding Radar",
        subtitle: "Venture rounds, product launches & market shifts",
        href: "/explore?tab=news",
      },
      {
        title: "Tech Hiring & Layoff Trends",
        subtitle: "Insights on campus hiring & skill demands",
        href: "/explore?tab=news",
      },
      {
        title: "Open Source Spotlight",
        subtitle: "Trending GitHub repositories of the week",
        href: "/explore?tab=news",
      },
    ],
    viewAllText: "Read today's tech news",
    viewAllHref: "/explore?tab=news",
  },
];

interface FeaturesMegaMenuProps {
  onItemClick?: () => void;
}

export default function FeaturesMegaMenu({ onItemClick }: FeaturesMegaMenuProps) {
  const router = useRouter();
  const [activeCategoryId, setActiveCategoryId] = useState<string>("roadmaps");

  const currentCategory =
    FEATURE_CATEGORIES.find((cat) => cat.id === activeCategoryId) || FEATURE_CATEGORIES[0];

  const handleCardClick = (href: string) => {
    if (onItemClick) onItemClick();
    router.push(href);
  };

  return (
    <div
      className="scFeaturesMegaMenu"
      role="menu"
      aria-label="Features Mega Menu"
      onClick={(e) => e.stopPropagation()}
    >
      {/* ── Left Sidebar: Category Navigation Tabs ── */}
      <div className="scFeaturesSidebar" role="tablist">
        {FEATURE_CATEGORIES.map((category) => {
          const Icon = category.icon;
          const isActive = category.id === activeCategoryId;

          return (
            <button
              key={category.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveCategoryId(category.id)}
              onMouseEnter={() => setActiveCategoryId(category.id)}
              className={`scFeaturesTabBtn ${isActive ? "scFeaturesTabBtnActive" : ""}`}
            >
              <div className="flex items-center gap-2.5">
                <Icon size={16} className="scFeaturesTabIcon" />
                <span>{category.label}</span>
              </div>
              {isActive && <ChevronRight size={14} className="scFeaturesTabChevron" />}
            </button>
          );
        })}
      </div>

      {/* ── Right Panel: Dynamic Content (Roadmaps, Courses, etc.) ── */}
      <div className="scFeaturesContent" role="tabpanel">
        <div className="scFeaturesHeader">
          <h3 className="scFeaturesTitle">{currentCategory.title}</h3>
          <p className="scFeaturesDesc">{currentCategory.description}</p>
        </div>

        <div className="scFeaturesSubheading">{currentCategory.subheading}</div>

        <div className="scFeaturesCardsGrid">
          {currentCategory.cards.map((card) => (
            <button
              key={card.title}
              type="button"
              onClick={() => handleCardClick(card.href)}
              className="scFeatureCard"
            >
              <span className="scFeatureCardTitle">{card.title}</span>
              <span className="scFeatureCardSubtitle">{card.subtitle}</span>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => handleCardClick(currentCategory.viewAllHref)}
          className="scFeaturesViewAll"
        >
          {currentCategory.viewAllText}
        </button>
      </div>
    </div>
  );
}
