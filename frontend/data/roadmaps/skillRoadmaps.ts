import PythonIcon from "@/components/icons/PythonIcon";
import type { PresetRoadmap } from "./types";

export const SKILL_ROADMAPS: PresetRoadmap[] = [
  {
    id: "python-mastery",
    category: "skill",
    number: 1,
    title: "1. Python Programming",
    displayTitle: "Python Programming",
    subtitle: "Here's a timeline of the Python Developer learning path.",
    timelineSubtitle: "Here's a timeline of the Python Developer learning path.",
    icon: PythonIcon,
    color: "#3776AB",
    bgBadge: "bg-blue-500/10",
    borderBadge: "border-blue-500/20",
    textBadge: "text-blue-500",
    ratings: "4.9 (12.4K Ratings)",
    salary: "₹8 – 25 LPA",
    growth: "+42.1% Growth",
    roles: "140,000+ Active Roles",
    growthPhases: [
      {
        phase: "PHASE 1: DORMANT PYTHON EMBRYO",
        title: "Dormant Python Embryo",
        description: "Python egg with gentle ambient pulse & glowing energy field",
        color: "#06b6d4",
      },
      {
        phase: "PHASE 2: HATCHLING SERPENT",
        title: "Hatchling Serpent",
        description: "Baby Python hatching & emerging with slithering motion & eye tracking",
        color: "#10b981",
      },
      {
        phase: "PHASE 3: JUVENILE MASTERY",
        title: "Juvenile Mastery",
        description: "Winding juvenile Python with 3D overlapping emerald scales",
        color: "#f59e0b",
      },
      {
        phase: "PHASE 4: LEGENDARY ADULT PYTHON",
        title: "Legendary Adult Python",
        description: "Majestic full-grown Python with 3D rotating gold aura & orbital motes",
        color: "#eab308",
      },
    ],
    sections: [
      {
        title: "1. Introduction",
        subtitle: "Python introduction, first code, setup, IDEs installation, and IDLE number operations.",
        nodes: ["1. Introduction"],
      },
      {
        title: "2. Strings",
        subtitle: "Working with strings, string slicing, formatting, and string manipulation methods.",
        nodes: ["2. Strings"],
      },
      {
        title: "3. Data Structures",
        subtitle: "Lists, tuples, sets, and dictionaries in Python.",
        nodes: ["3. Data Structures"],
      },
      {
        title: "4. Variables & Data Types",
        subtitle: "Variable storage, dynamic data types, operators, variable swapping, and user input.",
        nodes: ["4. Variables & Data Types"],
      },
      {
        title: "5. Conditional Statements",
        subtitle: "if conditions, else & debugging, nested if, elif ladder, and match-case pattern matching.",
        nodes: ["5. Conditional Statements"],
      },
      {
        title: "6. Loops",
        subtitle: "While loops, for loops, and break/continue control flow.",
        nodes: ["6. Loops"],
      },
      {
        title: "7. Arrays",
        subtitle: "Creating arrays with array module and essential array manipulation functions.",
        nodes: ["7. Arrays"],
      },
      {
        title: "8. Functions",
        subtitle: "Functions, arguments, scope, recursion, factorial, lambdas, and higher-order functions.",
        nodes: ["8. Functions"],
      },
      {
        title: "9. Decorators",
        subtitle: "Function decorators, wrappers, and metaprogramming.",
        nodes: ["9. Decorators"],
      },
      {
        title: "10. Modules & Packages",
        subtitle: "Math module, modular architecture, packages, and special __name__ variable.",
        nodes: ["10. Modules & Packages"],
      },
      {
        title: "11. Object-Oriented Programming",
        subtitle: "Classes, objects, __init__, __new__, methods, inheritance, MRO, polymorphism, and abstract classes.",
        nodes: ["11. Object-Oriented Programming"],
      },
      {
        title: "12. Exception Handling",
        subtitle: "try-except blocks, error recovery, and robust exception handling.",
        nodes: ["12. Exception Handling"],
      },
      {
        title: "13. Multithreading",
        subtitle: "Concurrency, threads, synchronization, and multithreading in Python.",
        nodes: ["13. Multithreading"],
      },
    ],
  },
];
