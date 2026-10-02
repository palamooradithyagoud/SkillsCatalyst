"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Calculator,
  Brain,
  MessageSquare,
  Mic,
} from "lucide-react";

export interface AccordionItemData {
  id: number;
  key: string;
  title: string;
  shortTitle: string;
  subtitle: string;
  category: string;
  description: string;
  imageUrl: string;
  fallbackUrl: string;
  actionText: string;
  accentColor: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const CAREER_ACCORDION_ITEMS: AccordionItemData[] = [
  {
    id: 1,
    key: "resume-review",
    title: "Resume Review",
    shortTitle: "Resume",
    subtitle: "ATS scoring & bullet rewrites",
    category: "AI CAREER SUITE",
    description:
      "Instant ATS compatibility score, recruiter-level critique, and impact-driven bullet point rewrites.",
    imageUrl: "/images/career/resume_review.jpg",
    fallbackUrl:
      "https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=800&q=80",
    actionText: "Launch Resume Review",
    accentColor: "from-amber-500 to-orange-600",
    icon: FileText,
  },
  {
    id: 2,
    key: "quant-aptitude",
    title: "Quantitative Aptitude",
    shortTitle: "Quant",
    subtitle: "Formulas & speed tests",
    category: "CAMPUS & TECH PREP",
    description:
      "Master high-yield mathematical problem-solving formulas and speed-accuracy test patterns.",
    imageUrl: "/images/career/quantitative_aptitude.jpg",
    fallbackUrl:
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80",
    actionText: "Practice Quantitative",
    accentColor: "from-indigo-500 to-blue-600",
    icon: Calculator,
  },
  {
    id: 3,
    key: "logical-reasoning",
    title: "Logical Reasoning",
    shortTitle: "Logical",
    subtitle: "Puzzles & patterns",
    category: "ANALYTICAL SKILLS",
    description:
      "Develop sharp structured thinking with deductive sequencing, Venn logic, and seating puzzles.",
    imageUrl: "/images/career/logical_reasoning.jpg",
    fallbackUrl:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80",
    actionText: "Solve Logical Puzzles",
    accentColor: "from-violet-500 to-purple-600",
    icon: Brain,
  },
  {
    id: 4,
    key: "verbal-ability",
    title: "Verbal Ability",
    shortTitle: "Verbal",
    subtitle: "Grammar & GD prep",
    category: "COMMUNICATION SUITE",
    description:
      "Elevate sentence fluency, reading speed, vocabulary, and confident placement group discussion skills.",
    imageUrl: "/images/career/verbal_ability.jpg",
    fallbackUrl:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80",
    actionText: "Master Verbal Skills",
    accentColor: "from-emerald-500 to-teal-600",
    icon: MessageSquare,
  },
  {
    id: 5,
    key: "ai-interviews",
    title: "AI Interviews",
    shortTitle: "AI Mock",
    subtitle: "Live technical & HR mock",
    category: "MOCK INTERVIEWS",
    description:
      "Simulate realistic technical and behavioral rounds with adaptive AI questioning and real-time speech feedback.",
    imageUrl: "/images/career/ai_interviews.jpg",
    fallbackUrl:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80",
    actionText: "Explore AI Interviews",
    accentColor: "from-sky-500 to-cyan-600",
    icon: Mic,
  },
];

interface AccordionItemProps {
  item: AccordionItemData;
  isActive: boolean;
  onSelect: () => void;
  onActionClick: (item: AccordionItemData) => void;
}

const AccordionItem: React.FC<AccordionItemProps> = ({
  item,
  isActive,
  onSelect,
  onActionClick,
}) => {
  const [imgSrc, setImgSrc] = useState(item.imageUrl);

  return (
    <div
      onClick={() => {
        onSelect();
        if (isActive) {
          onActionClick(item);
        }
      }}
      onMouseEnter={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      aria-expanded={isActive}
      className={`
        relative h-[250px] sm:h-[275px] md:h-[295px] rounded-xl overflow-hidden cursor-pointer
        transition-all duration-500 ease-out select-none shadow-xs
        border border-[#CFB6EE]/85
        ${
          isActive
            ? "flex-[3.5] min-w-[180px] sm:min-w-[210px] md:min-w-[240px] ring-2 ring-[#8B5CF6]/90 shadow-md"
            : "flex-1 min-w-[40px] sm:min-w-[46px] md:min-w-[50px] opacity-85 hover:opacity-100 hover:flex-[1.2]"
        }
      `}
    >
      {/* Clean photo without text or icons */}
      <img
        src={imgSrc}
        alt={item.title}
        className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 ${
          isActive ? "scale-105" : "scale-100"
        }`}
        onError={() => {
          if (imgSrc !== item.fallbackUrl) {
            setImgSrc(item.fallbackUrl);
          }
        }}
      />

      {/* Bottom gradient overlay for caption readability */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none" />

      {/* Subtle soft tint when inactive to create clean depth */}
      {!isActive && (
        <div className="absolute inset-0 bg-black/15 hover:bg-black/0 transition-colors duration-300 pointer-events-none" />
      )}

      {/* Downside Caption Text: Horizontal when active, vertical when closed */}
      <span
        className={`
          absolute text-white font-bold whitespace-nowrap drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]
          transition-all duration-500 ease-in-out pointer-events-none select-none z-10
          ${
            isActive
              ? "bottom-3.5 left-1/2 -translate-x-1/2 rotate-0 text-xs sm:text-sm md:text-base font-black tracking-tight"
              : "bottom-14 sm:bottom-16 left-1/2 -translate-x-1/2 rotate-90 origin-center text-[10.5px] sm:text-xs font-bold tracking-wide"
          }
        `}
      >
        {item.title}
      </span>
    </div>
  );
};

export interface LandingAccordionItemProps {
  items?: AccordionItemData[];
  onOpenPlacementPrep?: () => void;
  onOpenResumeReview?: () => void;
}

export function LandingAccordionItem({
  items = CAREER_ACCORDION_ITEMS,
  onOpenPlacementPrep,
  onOpenResumeReview,
}: LandingAccordionItemProps) {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);

  const handleActionClick = (item: AccordionItemData) => {
    if (item.key === "resume-review") {
      if (onOpenResumeReview) {
        onOpenResumeReview();
      } else {
        router.push("/career/resume-review");
      }
      return;
    }

    if (
      item.key === "quant-aptitude" ||
      item.key === "logical-reasoning" ||
      item.key === "verbal-ability"
    ) {
      if (onOpenPlacementPrep) {
        onOpenPlacementPrep();
      } else {
        router.push("/career#placement-prep");
      }
      return;
    }

    if (item.key === "ai-interviews") {
      if (onOpenPlacementPrep) {
        onOpenPlacementPrep();
      } else {
        router.push("/career");
      }
    }
  };

  return (
    <div className="w-full bg-gradient-to-br from-[#EFE5FB] via-[#E8DCF8] to-[#DFCEF5] hover:from-[#EDE1FA] hover:to-[#DAC7F2] transition-colors rounded-2xl p-3 sm:p-4 md:p-4.5 shadow-sm border border-[#CFB6EE]/90 relative overflow-hidden">
      {/* Decorative subtle lilac aura */}
      <div className="absolute -top-28 -left-28 w-72 h-72 bg-[#D4B5F3]/35 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-28 -right-28 w-72 h-72 bg-[#C8A2C8]/25 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col xl:flex-row items-start justify-between gap-4 md:gap-5">
        {/* Left Side: Placement Copy & 5 Interactive Module Selectors */}
        <div className="w-full xl:w-5/12 text-center xl:text-left flex flex-col justify-start self-start pt-0.5 sm:pt-1">
          <div>
            <h2 className="text-xl sm:text-2xl md:text-[26px] font-black text-slate-900 leading-tight tracking-tight mb-2 sm:mb-2.5">
              Placement &amp; Career Acceleration
            </h2>
          </div>

          {/* Single Dark Purple Card - Taller Height & Generous Vertical Spacing */}
          <div className="w-fit min-w-[220px] max-w-[270px] bg-[#2E1065] rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-sm border border-purple-950/70 mt-1 sm:mt-2 min-h-[240px] sm:min-h-[260px] flex flex-col justify-around">
            <div className="space-y-3.5 sm:space-y-4 text-left">
              {items.map((item, idx) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setActiveIndex(idx);
                    handleActionClick(item);
                  }}
                  onMouseEnter={() => setActiveIndex(idx)}
                  className="flex items-center gap-2.5 cursor-pointer group py-0.5"
                >
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 transition-all ${
                      activeIndex === idx
                        ? "bg-white ring-2 ring-purple-400 scale-125"
                        : "bg-purple-400/50 group-hover:bg-purple-300"
                    }`}
                  />
                  <span
                    className={`text-xs sm:text-sm tracking-tight transition-colors ${
                      activeIndex === idx
                        ? "text-white font-black"
                        : "text-purple-100 font-semibold group-hover:text-white"
                    }`}
                  >
                    {item.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Clean Interactive Image Accordion */}
        <div className="w-full xl:w-7/12 flex items-center justify-center">
          <div className="flex flex-row items-center justify-center gap-1.5 sm:gap-2 md:gap-2.5 w-full">
            {items.map((item, index) => (
              <AccordionItem
                key={item.id}
                item={item}
                isActive={index === activeIndex}
                onSelect={() => setActiveIndex(index)}
                onActionClick={handleActionClick}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingAccordionItem;
