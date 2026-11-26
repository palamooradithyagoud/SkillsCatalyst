export type RoadmapMetricIconKey = "level" | "units" | "projects";

export interface RoadmapCardMetric {
  id: string;
  icon: RoadmapMetricIconKey;
  label: string;
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
}

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
      { id: "units", icon: "units", label: "29 Units" },
      { id: "projects", icon: "projects", label: "4 Projects" },
    ],
    ctaLabel: "Explore Roadmap",
    accentColor: "#D5FF38",
  },
];
