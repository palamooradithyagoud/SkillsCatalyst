export type RoadmapLessonIconKey =
  | "studio"
  | "eye"
  | "typography"
  | "palette"
  | "layout"
  | "brain"
  | "shapes"
  | "badge"
  | "package"
  | "motion"
  | "compass"
  | "merge"
  | "flow"
  | "bulb"
  | "figma"
  | "craft"
  | "tokens"
  | "accessibility"
  | "prototype"
  | "bot"
  | "cpu"
  | "wearables"
  | "voice"
  | "clipboard"
  | "rocket"
  | "briefcase"
  | "users"
  | "workflow"
  | "terminal";

export interface RoadmapLessonItem {
  number: number;
  title: string;
  icon: RoadmapLessonIconKey;
}

export interface RoadmapLessonGroup {
  id: string;
  rangeLabel: string;
  accentHex: string;
  badgeTextDark?: boolean;
  lessons: RoadmapLessonItem[];
}

export const ROADMAP_LESSONS_CATALOG: Record<string, RoadmapLessonGroup[]> = {
  "ui-ux-designer": [
    {
      id: "group-1-6",
      rangeLabel: "Units 1–6",
      accentHex: "#5B4DFF",
      lessons: [
        { number: 1, title: "Your AI design studio", icon: "studio" },
        { number: 2, title: "Seeing like a designer", icon: "eye" },
        { number: 3, title: "Typography", icon: "typography" },
        { number: 4, title: "Color", icon: "palette" },
        { number: 5, title: "Layout, space and hierarchy", icon: "layout" },
        { number: 6, title: "Design thinking and AI problem framing", icon: "brain" },
      ],
    },
    {
      id: "group-7-10",
      rangeLabel: "Units 7–10",
      accentHex: "#EC4899",
      lessons: [
        { number: 7, title: "Graphic design and composition", icon: "shapes" },
        { number: 8, title: "Brand identity", icon: "badge" },
        { number: 9, title: "Packaging and physical products", icon: "package" },
        { number: 10, title: "Motion graphics", icon: "motion" },
      ],
    },
    {
      id: "group-11-14",
      rangeLabel: "Units 11–14",
      accentHex: "#F94E2D",
      lessons: [
        { number: 11, title: "Research planning and methods", icon: "compass" },
        { number: 12, title: "Synthesis and defining the problem", icon: "merge" },
        { number: 13, title: "Information architecture and flows", icon: "flow" },
        { number: 14, title: "Ideation and AI product strategy", icon: "bulb" },
      ],
    },
    {
      id: "group-15-20",
      rangeLabel: "Units 15–20",
      accentHex: "#96DB1E",
      badgeTextDark: true,
      lessons: [
        { number: 15, title: "Figma fluency", icon: "figma" },
        { number: 16, title: "UI craft", icon: "craft" },
        { number: 17, title: "Design systems and AI tokens", icon: "tokens" },
        { number: 18, title: "Accessibility and inclusive design", icon: "accessibility" },
        { number: 19, title: "Prototyping and motion with AI", icon: "prototype" },
        { number: 20, title: "AI agents in the canvas", icon: "bot" },
      ],
    },
    {
      id: "group-21-25",
      rangeLabel: "Units 21–25",
      accentHex: "#2563EB",
      lessons: [
        { number: 21, title: "Designing AI products", icon: "cpu" },
        { number: 22, title: "Wearables and XR", icon: "wearables" },
        { number: 23, title: "Voice, AI devices and robots", icon: "voice" },
        { number: 24, title: "Usability testing and evaluation", icon: "clipboard" },
        { number: 25, title: "Ship and present", icon: "rocket" },
      ],
    },
    {
      id: "group-26-29",
      rangeLabel: "Units 26–29",
      accentHex: "#6B7280",
      lessons: [
        { number: 26, title: "Get hired with AI", icon: "briefcase" },
        { number: 27, title: "Human-AI interaction (HAX)", icon: "users" },
        { number: 28, title: "Agentic UX design", icon: "workflow" },
        { number: 29, title: "Prompt engineering for design", icon: "terminal" },
      ],
    },
  ],
};

export function getRoadmapLessonGroups(roadmapId: string): RoadmapLessonGroup[] {
  return ROADMAP_LESSONS_CATALOG[roadmapId] ?? [];
}

export function getRoadmapLessonCount(roadmapId: string): number {
  return getRoadmapLessonGroups(roadmapId).reduce(
    (sum, group) => sum + group.lessons.length,
    0
  );
}
