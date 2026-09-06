import type { ComponentType, CSSProperties } from "react";

export interface RoadmapNode {
  name: string;
  defaultDone?: boolean;
}

export interface RoadmapSection {
  title: string;
  subtitle: string;
  nodes: string[];
}

export interface GrowthPhase {
  phase: string;
  title: string;
  description: string;
  color: string;
}

export interface PresetRoadmap {
  id: string;
  category: "skill" | "career";
  number: number;
  title: string;
  displayTitle: string;
  subtitle: string;
  timelineSubtitle: string;
  icon: ComponentType<{ size?: number; className?: string; style?: CSSProperties }>;
  color: string;
  bgBadge: string;
  borderBadge: string;
  textBadge: string;
  ratings: string;
  salary: string;
  growth: string;
  roles: string;
  sections: RoadmapSection[];
  growthPhases: GrowthPhase[];
}

export interface RightBranchTopic {
  id: string;
  name: string;
  isRecommended?: boolean;
  isAlternative?: boolean;
  isOrderNotStrict?: boolean;
  docUrl?: string;
  desc?: string;
}

export interface RightBranchGroup {
  groupName?: string;
  topics: RightBranchTopic[];
}

export interface NodeTreeBranches {
  description: string;
  groups: RightBranchGroup[];
}
