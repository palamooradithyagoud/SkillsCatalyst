import React from "react";
import {
  LayoutGrid,
  Columns,
  Plus,
  TrendingUp,
  Type,
  Database,
  Search,
  ArrowRight,
  BarChart2,
  ChevronsDown,
  Target,
  Grid,
} from "lucide-react";

export interface TreeNode {
  id: string;
  title: string;
  icon: React.ElementType;
}

export interface TreeCategory {
  id: string;
  title: string;
  icon: React.ElementType;
  color: string;
  gradient: string;
  badgeStyle: string;
  nodes: TreeNode[];
}

// Problem IDs per node — used to compute solve % for the progress fill on each node button
export const NODE_PROBLEM_IDS: Record<string, number[]> = {
  "two-pointers":       [26, 27, 88, 283, 349, 350, 455, 905, 922, 977, 2460, 11, 15, 16, 18, 80, 167, 189, 611, 881, 42],
  "sliding-window-arr": [643, 209, 713, 904, 930, 1004, 1052, 1248, 1343, 1423, 1493, 1658, 1695, 1838, 2024, 2958, 992],
  "prefix-sum":         [1480, 724, 303, 1732, 1991, 238, 560, 525, 523, 930, 974, 1248, 1314, 1352, 304, 327],
  "kadanes":            [53, 918, 1749, 1191, 2321],
  "two-pointers-str":   [125, 344, 345, 392, 1768, 28, 151, 443, 680, 165, 2109, 408],
  "sliding-window-str": [1456, 2379, 3090, 3, 424, 438, 567, 2516, 76],
  "frequency-map":      [1, 217, 219, 242, 383, 387, 389, 1207, 1512, 169, 1748, 350, 49, 347, 451, 560, 659, 692, 1636],
  "prefix-hashmap":     [560, 525, 523, 974, 930, 1248, 1590, 2845, 325, 437],
  "classic-bs":         [704, 35, 69, 278, 374, 1539, 33, 34, 74, 81, 153, 162, 540, 875, 1011, 1283, 2226, 410],
  "lower-upper-bound":   [35, 744, 34],
  "bs-on-answers":      [69, 367, 875, 1011, 1283, 1482, 1552, 1760, 1870, 2187, 2226, 2251, 410],
  "search-2d-matrix":   [240, 74, 1901, 1428, 302],
};

export const BEGINNER_TREE_DATA: TreeCategory[] = [
  {
    id: "arrays",
    title: "Arrays",
    icon: LayoutGrid,
    color: "#10b981",
    gradient: "from-emerald-600 to-teal-600",
    badgeStyle: "bg-emerald-50 text-emerald-700 border-emerald-200/90",
    nodes: [
      { id: "two-pointers", title: "Two Pointers", icon: ArrowRight },
      { id: "sliding-window-arr", title: "Sliding Window", icon: Columns },
      { id: "prefix-sum", title: "Prefix Sum", icon: Plus },
      { id: "kadanes", title: "Kadane's Algorithm", icon: TrendingUp },
    ],
  },
  {
    id: "strings",
    title: "Strings",
    icon: Type,
    color: "#8b5cf6",
    gradient: "from-violet-600 to-purple-600",
    badgeStyle: "bg-purple-50 text-purple-700 border-purple-200/90",
    nodes: [
      { id: "two-pointers-str", title: "Two Pointer", icon: ArrowRight },
      { id: "sliding-window-str", title: "Sliding Window", icon: Columns },
    ],
  },
  {
    id: "hashmap",
    title: "Hashmap",
    icon: Database,
    color: "#f59e0b",
    gradient: "from-amber-500 to-orange-600",
    badgeStyle: "bg-amber-50 text-amber-700 border-amber-200/90",
    nodes: [
      { id: "frequency-map", title: "Frequency Map", icon: BarChart2 },
      { id: "prefix-hashmap", title: "Prefix Sum + HashMap", icon: Plus },
    ],
  },
  {
    id: "binary-search",
    title: "Binary Search",
    icon: Search,
    color: "#0284c7",
    gradient: "from-sky-500 to-blue-600",
    badgeStyle: "bg-sky-50 text-sky-700 border-sky-200/90",
    nodes: [
      { id: "classic-bs", title: "Classic Binary Search", icon: Search },
      { id: "lower-upper-bound", title: "Lower / Upper Bound", icon: ChevronsDown },
      { id: "bs-on-answers", title: "Binary Search on Answers", icon: Target },
      { id: "search-2d-matrix", title: "Search in 2D Matrix", icon: Grid },
    ],
  },
];
