import { getRoadmapLessonCount } from "./lessonsCatalog";

export type RoadmapMetricIconKey = "level" | "units" | "projects" | "duration";

export type RoadmapToolKey =
  | "figma"
  | "adobe-xd"
  | "photoshop"
  | "framer"
  | "react"
  | "typescript"
  | "nextjs"
  | "nodejs"
  | "python"
  | "docker"
  | "git"
  | "postgresql";

export interface RoadmapCardMetric {
  id: string;
  icon: RoadmapMetricIconKey;
  label: string;
}

export interface RoadmapToolItem {
  id: string;
  name: string;
  icon: RoadmapToolKey;
}

export interface RoadmapDetailConfig {
  heroMetrics: RoadmapCardMetric[];
  summaryText: string;
  salaryTitle: string;
  salaryValue: string;
  salaryNote: string;
  toolsTitle: string;
  tools: RoadmapToolItem[];
  progressTitle: string;
  completedUnits: number;
  totalUnits: number;
  progressUnitLabel: string;
  actionLabel: string;
}

export interface RoadmapCardItem {
  id: string;
  titleAccent: string;
  titlePrimary: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  metrics: RoadmapCardMetric[];
  ctaLabel: string;
  accentColor?: string;
  href?: string;
  detail: RoadmapDetailConfig;
}

const uiUxUnitsCount = getRoadmapLessonCount("ui-ux-designer");

export const ROADMAP_CARDS: RoadmapCardItem[] = [
  {
    id: "ui-ux-designer",
    titleAccent: "UI/UX",
    titlePrimary: "Designer",
    description:
      "Learn to design user-friendly, meaningful, and modern digital experiences.",
    imageSrc: "/images/roadmaps/ui-ux-designer.png",
    imageAlt: "UI/UX Designer workspace illustration",
    metrics: [
      { id: "level", icon: "level", label: "Beginner" },
      { id: "units", icon: "units", label: `${uiUxUnitsCount} Units` },
      { id: "projects", icon: "projects", label: "4 Projects" },
    ],
    ctaLabel: "Explore Roadmap",
    accentColor: "#D5FF38",
    href: "/roadmaps/ui-ux-designer",
    detail: {
      heroMetrics: [
        { id: "units", icon: "units", label: `${uiUxUnitsCount} Units` },
        { id: "projects", icon: "projects", label: "4 Projects" },
        { id: "duration", icon: "duration", label: "~8 Weeks" },
      ],
      summaryText:
        "Learn the end-to-end UI/UX design process — from user research and wireframing to visual design and prototyping.",
      salaryTitle: "Avg. CTC in India",
      salaryValue: "₹5.5 – 7 LPA",
      salaryNote: "Source: Interview, 2026 • Varies by experience",
      toolsTitle: "Key Tools",
      tools: [
        { id: "figma", name: "Figma", icon: "figma" },
        { id: "adobe-xd", name: "Adobe XD", icon: "adobe-xd" },
        { id: "photoshop", name: "Adobe Photoshop", icon: "photoshop" },
        { id: "framer", name: "Framer", icon: "framer" },
      ],
      progressTitle: "Your Progress",
      completedUnits: 0,
      totalUnits: uiUxUnitsCount,
      progressUnitLabel: "units completed",
      actionLabel: "Continue Learning",
    },
  },
];

export function getRoadmapCardById(id: string): RoadmapCardItem | undefined {
  return ROADMAP_CARDS.find((card) => card.id === id);
}
