"use client";

import React, { useState, useRef } from "react";
import {
  BookOpen,
  Layers,
  Coffee,
  Code,
  Server,
  Atom,
  LayoutGrid,
  Database,
  Smartphone,
  Monitor,
  Cpu,
  BarChart3,
  Settings,
  Shield,
  Sparkles,
  CheckCircle2,
  BrainCircuit,
  Check,
  Loader2,
  ArrowLeft,
  X,
  Star,
  Flame,
  Zap,
  Book,
  Trophy,
  Trees,
  Terminal,
  TrendingUp,
  Briefcase,
  Play,
  CheckCircle,
  Globe,
  GraduationCap,
  BookmarkPlus,
  UserPlus,
  ChevronRight,
  GitBranch,
  ExternalLink,
} from "lucide-react";
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from "framer-motion";
import { generateRoadmap, RoadmapData } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import BrandReactIcon from "@/components/icons/BrandReactIcon";
import PythonIcon from "@/components/icons/PythonIcon";
import BrandNextjsIcon from "@/components/icons/BrandNextjsIcon";
import PythonGrowthCanvas from "@/components/PythonGrowthCanvas";
import SubtopicDetailDrawer, { SubtopicDetailInfo } from "@/components/SubtopicDetailDrawer";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";


interface RoadmapNode {
  name: string;
  defaultDone?: boolean;
}

interface RoadmapSection {
  title: string;
  subtitle: string;
  nodes: string[];
}

interface PresetRoadmap {
  id: string;
  category: "skill" | "career";
  number: number;
  title: string;
  displayTitle: string;
  subtitle: string;
  timelineSubtitle: string;
  icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>;
  color: string;
  bgBadge: string;
  borderBadge: string;
  textBadge: string;
  ratings: string;
  salary: string;
  growth: string;
  roles: string;
  sections: RoadmapSection[];
  growthPhases: {
    phase: string;
    title: string;
    description: string;
    color: string;
  }[];
}

const SKILL_ROADMAPS: PresetRoadmap[] = [
  {
    id: "c-programming",
    category: "skill",
    number: 1,
    title: "1. C Programming",
    displayTitle: "C Programming Mastery",
    subtitle: "Here's a timeline of the Systems C Programming path.",
    timelineSubtitle: "Here's a timeline of the Systems C Programming path.",
    icon: Terminal,
    color: "#38bdf8",
    bgBadge: "bg-sky-500/10",
    borderBadge: "border-sky-500/20",
    textBadge: "text-sky-400",
    ratings: "4.9 (16.8K Ratings)",
    salary: "₹7 – 24 LPA",
    growth: "+35.2% Growth",
    roles: "125,000+ Active Roles",
    growthPhases: [
      { phase: "PHASE 1: NOVICE C SYNTAX", title: "Novice C Syntax", description: "Variables, pointers & control flow basics", color: "#38bdf8" },
      { phase: "PHASE 2: MEMORY POINTER MASTER", title: "Memory Pointer Master", description: "Dynamic memory, malloc/free & structs", color: "#6366f1" },
      { phase: "PHASE 3: SYSTEMS ARCHITECT", title: "Systems Architect", description: "POSIX syscalls, file I/O & bitwise ops", color: "#a855f7" },
      { phase: "PHASE 4: LEGENDARY C KERNEL GOD", title: "Legendary C Kernel God", description: "Low-level system libraries & OS kernel hacking", color: "#ec4899" },
    ],
    sections: [
      {
        title: "1. Introduction",
        subtitle: "Overview of C applications, C vs Assembly, and C vs C++.",
        nodes: ["1. Introduction"],
      },
      {
        title: "2. Setting Up",
        subtitle: "Installing compilers, running code, and configuring editors.",
        nodes: ["2. Setting Up"],
      },
      {
        title: "3. Variables",
        subtitle: "Declaration vs definition, initialization, and format specifiers.",
        nodes: ["3. Variables"],
      },
      {
        title: "4. Data Types",
        subtitle: "Primitive data types, fixed width integers, type conversion, and type qualifiers.",
        nodes: ["4. Data Types"],
      },
      {
        title: "5. Operators",
        subtitle: "Comparison, arithmetic, logical, ternary, and bitwise operators.",
        nodes: ["5. Operators"],
      },
      {
        title: "6. Control Flow",
        subtitle: "Conditionals, switch statements, loops, and break/continue jump control.",
        nodes: ["6. Control Flow"],
      },
      {
        title: "7. Functions",
        subtitle: "Main function, recursion, variable scope, variadic functions, and CLI args.",
        nodes: ["7. Functions"],
      },
      {
        title: "8. Pointers & Memory",
        subtitle: "Pointer syntax, arithmetic, stack vs heap, dynamic allocation, and memory safety.",
        nodes: ["8. Pointers & Memory"],
      },
      {
        title: "9. Arrays",
        subtitle: "1D/2D arrays, contiguous storage, and pointer decay.",
        nodes: ["9. Arrays"],
      },
      {
        title: "10. Strings",
        subtitle: "Null-terminated character arrays and string utilities.",
        nodes: ["10. Strings"],
      },
      {
        title: "11. User Defined Types",
        subtitle: "Structs, unions, enums, padding, and typedef aliases.",
        nodes: ["11. User Defined Types"],
      },
      {
        title: "12. Common Data Structures",
        subtitle: "Dynamic arrays, linked lists, hash maps, and ring buffers.",
        nodes: ["12. Common Data Structures"],
      },
      {
        title: "13. Structuring Codebase",
        subtitle: "Header files, inclusion guards, linkage, static, and extern.",
        nodes: ["13. Structuring Codebase"],
      },
      {
        title: "14. Error Handling",
        subtitle: "errno error codes, exit codes, and setjmp/longjmp.",
        nodes: ["14. Error Handling"],
      },
      {
        title: "15. File I/O",
        subtitle: "Streams, FILE pointers, and binary vs text modes.",
        nodes: ["15. File I/O"],
      },
      {
        title: "16. Standard Library",
        subtitle: "Core C standard library headers and signal handling.",
        nodes: ["16. Standard Library"],
      },
      {
        title: "17. Build & Compilation",
        subtitle: "GNU Make, CMake, GCC/Clang, linking, ABI, and package managers.",
        nodes: ["17. Build & Compilation"],
      },
      {
        title: "18. Debugging",
        subtitle: "GDB, LLDB, Valgrind, ASan, LSan, WinDbg, and strace.",
        nodes: ["18. Debugging"],
      },
      {
        title: "19. Testing",
        subtitle: "Assertions and C unit testing framework suites.",
        nodes: ["19. Testing"],
      },
      {
        title: "20. Idioms & Design Patterns",
        subtitle: "Callbacks, opaque pointers, OOP in C, and RAII cleanup.",
        nodes: ["20. Idioms & Design Patterns"],
      },
      {
        title: "21. Concurrency & Process Management",
        subtitle: "POSIX threads, mutexes, and inter-process communication.",
        nodes: ["21. Concurrency & Process Management"],
      },
      {
        title: "22. C Standards",
        subtitle: "ISO C language standards from C89 through C23.",
        nodes: ["22. C Standards"],
      },
    ],
  },
  {
    id: "cpp-programming",
    category: "skill",
    number: 2,
    title: "2. C++ Development",
    displayTitle: "C++ Development Mastery",
    subtitle: "Here's a timeline of Modern C++ Systems & Performance Engineering path.",
    timelineSubtitle: "Here's a timeline of Modern C++ Systems & Performance Engineering path.",
    icon: Code,
    color: "#a855f7",
    bgBadge: "bg-purple-500/10",
    borderBadge: "border-purple-500/20",
    textBadge: "text-purple-400",
    ratings: "4.9 (18.1K Ratings)",
    salary: "₹9 – 32 LPA",
    growth: "+41.8% Growth",
    roles: "155,000+ Active Roles",
    growthPhases: [
      { phase: "PHASE 1: CPP INITIATE", title: "CPP Initiate", description: "Classes, objects & reference mechanics", color: "#06b6d4" },
      { phase: "PHASE 2: STL WHIZ", title: "STL Whiz", description: "Vectors, maps, iterators & template magic", color: "#10b981" },
      { phase: "PHASE 3: MODERN CPP NINJA", title: "Modern CPP Ninja", description: "Smart pointers, move semantics & lambda streams", color: "#f59e0b" },
      { phase: "PHASE 4: HIGH FREQUENCY ARCHITECT", title: "High Frequency Architect", description: "Zero-cost abstractions & low-latency engines", color: "#ef4444" },
    ],
    sections: [
      {
        title: "1. Introduction to Language",
        subtitle: "What is C++, Why use C++, and C vs C++.",
        nodes: ["1. Introduction to Language"],
      },
      {
        title: "2. Setting up your Environment",
        subtitle: "Installing C++, Code Editors / IDEs, and running your first program.",
        nodes: ["2. Setting up your Environment"],
      },
      {
        title: "3. Basic Operations",
        subtitle: "Arithmetic, logical, and bitwise operators.",
        nodes: ["3. Basic Operations"],
      },
      {
        title: "4. Control Flow & Statements",
        subtitle: "if-else, switch, goto, and for / while / do-while loops.",
        nodes: ["4. Control Flow & Statements"],
      },
      {
        title: "5. Functions",
        subtitle: "Function overloading, operator overloading, lambdas, and static polymorphism.",
        nodes: ["5. Functions"],
      },
      {
        title: "6. Data Types",
        subtitle: "Static typing, dynamic typing, and RTTI.",
        nodes: ["6. Data Types"],
      },
      {
        title: "7. Pointers and References",
        subtitle: "References, memory model, lifetimes, smart pointers, raw pointers, and memory leaks.",
        nodes: ["7. Pointers and References"],
      },
      {
        title: "8. Structuring Codebase",
        subtitle: "Forward declaration, headers / cpp files, namespaces, and scope.",
        nodes: ["8. Structuring Codebase"],
      },
      {
        title: "9. Structures and Classes",
        subtitle: "OOP, virtual methods & tables, dynamic polymorphism, inheritance, and Rule of 0/3/5.",
        nodes: ["9. Structures and Classes"],
      },
      {
        title: "10. Templates",
        subtitle: "Variadic templates, full & partial template specialization, type traits, and SFINAE.",
        nodes: ["10. Templates"],
      },
      {
        title: "11. Language Concepts",
        subtitle: "auto deduction, type casting (static, const, dynamic, reinterpret), UB, ADL, and macros.",
        nodes: ["11. Language Concepts"],
      },
      {
        title: "12. Exception Handling",
        subtitle: "Exit codes, structured exceptions, and access violations.",
        nodes: ["12. Exception Handling"],
      },
      {
        title: "13. Standard Library + STL",
        subtitle: "Iterators, iostream, algorithms, date/time, multithreading, and STL containers.",
        nodes: ["13. Standard Library + STL"],
      },
      {
        title: "14. Debuggers",
        subtitle: "Debugger messages, debugging symbols, WinDbg, and GDB.",
        nodes: ["14. Debuggers"],
      },
      {
        title: "15. Compilers",
        subtitle: "Compiler stages and features (Clang++, Intel C++, MSVC, GCC, MinGW).",
        nodes: ["15. Compilers"],
      },
      {
        title: "16. Build Systems",
        subtitle: "CMake, Makefile, and Ninja build automation.",
        nodes: ["16. Build Systems"],
      },
      {
        title: "17. Package Managers",
        subtitle: "vcpkg, Conan, NuGet, and Spack package managers.",
        nodes: ["17. Package Managers"],
      },
      {
        title: "18. Working with Libraries",
        subtitle: "Inclusion concepts, licensing, and popular libraries (Boost, OpenCV, POCO, protobuf, etc.).",
        nodes: ["18. Working with Libraries"],
      },
      {
        title: "19. Frameworks",
        subtitle: "Testing & UI frameworks (gtest, Qt, Catch2, Orbit Profiler, PyTorch C++).",
        nodes: ["19. Frameworks"],
      },
      {
        title: "20. Idioms",
        subtitle: "RAII, Pimpl, CRTP, Copy-and-Swap, Erase-Remove, Copy on Write, Non-Copyable.",
        nodes: ["20. Idioms"],
      },
      {
        title: "21. Standards",
        subtitle: "Evolution of ISO C++ standards (C++11/14, C++17, C++20, C++23, C++0x).",
        nodes: ["21. Standards"],
      },
    ],
  },
  {
    id: "python-mastery",
    category: "skill",
    number: 3,
    title: "3. Python Mastery",
    displayTitle: "Python Mastery",
    subtitle: "Here's a timeline of the Python Developer learning path.",
    timelineSubtitle: "Here's a timeline of the Python Developer learning path.",
    icon: PythonIcon,
    color: "#10b981",
    bgBadge: "bg-amber-500/10",
    borderBadge: "border-amber-500/20",
    textBadge: "text-amber-400",
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
        title: "1. Learn the Basics",
        subtitle: "Basic syntax, variables, data types, conditionals, loops, functions, and core collections.",
        nodes: ["1. Learn the Basics"],
      },
      {
        title: "2. Data Structures & Algorithms",
        subtitle: "Arrays, linked lists, hash tables, heaps, stacks, queues, trees, recursion, and sorting.",
        nodes: ["2. Data Structures & Algorithms"],
      },
      {
        title: "3. Modules",
        subtitle: "Builtin and custom module creation and imports.",
        nodes: ["3. Modules"],
      },
      {
        title: "4. Lambdas",
        subtitle: "Anonymous lambda expressions and functional helpers.",
        nodes: ["4. Lambdas"],
      },
      {
        title: "5. Decorators",
        subtitle: "Function and class decorators, wrapping, and meta-programming.",
        nodes: ["5. Decorators"],
      },
      {
        title: "6. Iterators",
        subtitle: "Iterator protocols, iter(), and next().",
        nodes: ["6. Iterators"],
      },
      {
        title: "7. Regular Expressions",
        subtitle: "Pattern matching and text extraction with the re module.",
        nodes: ["7. Regular Expressions"],
      },
      {
        title: "8. Object Oriented Programming",
        subtitle: "Classes, inheritance, methods, and dunder magic methods.",
        nodes: ["8. Object Oriented Programming"],
      },
      {
        title: "9. Package Managers",
        subtitle: "PyPI, Pip, Conda, uv, and Poetry dependency management.",
        nodes: ["9. Package Managers"],
      },
      {
        title: "10. Common Packages",
        subtitle: "pyproject.toml and project configuration files.",
        nodes: ["10. Common Packages"],
      },
      {
        title: "11. List Comprehensions",
        subtitle: "Concise list filtering and transformation syntax.",
        nodes: ["11. List Comprehensions"],
      },
      {
        title: "12. Generator Expressions",
        subtitle: "Memory-efficient lazy data streaming with yield and generator expressions.",
        nodes: ["12. Generator Expressions"],
      },
      {
        title: "13. Paradigms",
        subtitle: "Procedural, object-oriented, and functional programming paradigms.",
        nodes: ["13. Paradigms"],
      },
      {
        title: "14. Context Manager",
        subtitle: "Resource management with the with statement and contextlib.",
        nodes: ["14. Context Manager"],
      },
      {
        title: "15. Learn a Framework",
        subtitle: "Synchronous, Asynchronous, and Hybrid web frameworks (FastAPI, Django, Flask, aiohttp, Dash).",
        nodes: ["15. Learn a Framework"],
      },
      {
        title: "16. Concurrency",
        subtitle: "Multiprocessing, AsyncIO, threading, and GIL internals.",
        nodes: ["16. Concurrency"],
      },
      {
        title: "17. Environments",
        subtitle: "Isolated Python runtime management with Pipenv, virtualenv, and pyenv.",
        nodes: ["17. Environments"],
      },
      {
        title: "18. Static Typing",
        subtitle: "Type annotations, mypy, pyright, pyre, and Pydantic validation.",
        nodes: ["18. Static Typing"],
      },
      {
        title: "19. Code Formatting",
        subtitle: "Automated formatters and linters (black, ruff, yapf).",
        nodes: ["19. Code Formatting"],
      },
      {
        title: "20. Documentation",
        subtitle: "Sphinx, docstrings, and automated documentation generation.",
        nodes: ["20. Documentation"],
      },
      {
        title: "21. Testing",
        subtitle: "Automated test runners (pytest, unittest, doctest, tox, nose).",
        nodes: ["21. Testing"],
      },
    ],
  },
  {
    id: "java-spring-boot",
    category: "skill",
    number: 4,
    title: "4. Java & Spring Boot",
    displayTitle: "Java & Spring Boot Mastery",
    subtitle: "Here's a timeline of the Enterprise Java & Spring Developer path.",
    timelineSubtitle: "Here's a timeline of the Java & Spring Developer path.",
    icon: Coffee,
    color: "#ef4444",
    bgBadge: "bg-red-500/10",
    borderBadge: "border-red-500/20",
    textBadge: "text-red-400",
    ratings: "4.8 (9.8K Ratings)",
    salary: "₹10 – 28 LPA",
    growth: "+38.4% Growth",
    roles: "110,000+ Active Roles",
    growthPhases: [
      { phase: "PHASE 1: JAVA SEEDLING", title: "Java Seedling", description: "Core Java OOP principles taking root", color: "#f87171" },
      { phase: "PHASE 2: SPRING BOOT sprout", title: "Spring Boot Sprout", description: "RESTful microservices emerging", color: "#ef4444" },
      { phase: "PHASE 3: ENTERPRISE ARCHITECT", title: "Enterprise Architect", description: "Scalable enterprise Java backend", color: "#dc2626" },
      { phase: "PHASE 4: LEGENDARY JVM MASTER", title: "Legendary JVM Master", description: "High-performance JVM tuning & microservices", color: "#b91c1c" },
    ],
    sections: [
      {
        title: "1. Learn the Basics",
        subtitle: "Master Java fundamental syntax, program lifecycle, variables, data types, operators, and control flow.",
        nodes: [
          "Basic Syntax",
          "Lifecycle of a Program",
          "Data Types & Variables",
          "Type Casting",
          "Strings and Methods",
          "Math Operations",
          "Arrays",
          "Conditionals & Loops",
          "Basics of OOP",
        ],
      },
      {
        title: "2. Object Oriented Programming (OOP)",
        subtitle: "Understand core OOP concepts, inheritance, polymorphism, encapsulation, abstraction, and records.",
        nodes: [
          "Classes and Objects",
          "Attributes and Methods",
          "Access Specifiers",
          "Static & Final Keywords",
          "Nested Classes & Packages",
          "Object Lifecycle & Method Chaining",
          "Inheritance & Encapsulation",
          "Abstraction & Interfaces",
          "Method Overloading / Overriding",
          "Enums & Records",
          "Initializer Block & Binding (Static vs Dynamic)",
          "Pass by Value / Pass by Reference",
        ],
      },
      {
        title: "3. Advanced Language & Core Features",
        subtitle: "Master exceptions, lambdas, annotations, module systems, Optionals, and functional streams.",
        nodes: [
          "Exception Handling",
          "Lambda Expressions",
          "Annotations",
          "Modules",
          "Optionals",
          "Functional Programming (High Order Functions & Interfaces)",
          "Stream API",
          "Regular Expressions & Cryptography",
          "Date and Time API",
          "Networking",
        ],
      },
      {
        title: "4. Collections Framework",
        subtitle: "Implement Java collection interfaces, list structures, sets, maps, queues, and generic types.",
        nodes: [
          "Array vs ArrayList",
          "Set & Map",
          "Queue & Deque",
          "Stack & Iterator",
          "Generic Collections",
        ],
      },
      {
        title: "5. Memory & Concurrency",
        subtitle: "Understand thread management, synchronization, volatile fields, JVM memory model, and virtual threads.",
        nodes: [
          "volatile keyword",
          "Java Memory Model",
          "Threads & Multithreading",
          "Virtual Threads (Project Loom)",
          "Concurrency Utilities",
        ],
      },
      {
        title: "6. I/O, Files & Dependency Injection",
        subtitle: "Perform file I/O operations, stream handling, and leverage dependency injection patterns.",
        nodes: [
          "I/O Operations",
          "File Operations",
          "Dependency Injection",
        ],
      },
      {
        title: "7. Build Tools & Package Management",
        subtitle: "Automate Java project compilation, dependency resolution, and builds with Maven and Gradle.",
        nodes: [
          "Maven",
          "Gradle",
          "Bazel",
        ],
      },
      {
        title: "8. Web Frameworks",
        subtitle: "Develop microservices and web APIs using Spring Boot, Quarkus, Javalin, and Play Framework.",
        nodes: [
          "Spring (Spring Boot)",
          "Quarkus",
          "Javalin",
          "Play Framework",
        ],
      },
      {
        title: "9. Database Access & Persistence",
        subtitle: "Connect Java applications to relational databases with JDBC, Hibernate, and Spring Data JPA.",
        nodes: [
          "JDBC",
          "Hibernate ORM",
          "Spring Data JPA",
          "EBean",
        ],
      },
      {
        title: "10. Logging, Documentation & Testing",
        subtitle: "Write unit tests, integration tests, behavior tests, Javadoc, and manage application logs.",
        nodes: [
          "Javadoc & Documentation",
          "Logging Frameworks (SLF4J / Log4j2 / Logback / TinyLog)",
          "Unit Testing (JUnit & TestNG)",
          "Integration Testing (REST Assured & JMeter)",
        ],
      },
    ],
  },
  {
    id: "react-development",
    category: "skill",
    number: 5,
    title: "5. React Development",
    displayTitle: "React Mastery",
    subtitle: "Here's a timeline of the React 19 Frontend Developer path.",
    timelineSubtitle: "Here's a timeline of the React 19 Frontend Developer path.",
    icon: BrandReactIcon,
    color: "#06b6d4",
    bgBadge: "bg-cyan-500/10",
    borderBadge: "border-cyan-500/20",
    textBadge: "text-cyan-400",
    ratings: "4.9 (16.4K Ratings)",
    salary: "₹8 – 24 LPA",
    growth: "+44.5% Growth",
    roles: "165,000+ Active Roles",
    growthPhases: [
      { phase: "PHASE 1: JSX NOVICE", title: "JSX Novice", description: "JSX, Props & Component rendering", color: "#38bdf8" },
      { phase: "PHASE 2: HOOKS ARCHITECT", title: "Hooks Architect", description: "useState, useEffect, useRef & custom hooks", color: "#06b6d4" },
      { phase: "PHASE 3: STATE & CONTEXT WHIZ", title: "State & Context Whiz", description: "Context API, Redux Toolkit & Zustand", color: "#0284c7" },
      { phase: "PHASE 4: LEGENDARY REACT NINJA", title: "Legendary React Ninja", description: "React 19 Compiler, Server Actions & Micro-interactions", color: "#0369a1" },
    ],
    sections: [
      {
        title: "1. Components & Rendering Basics",
        subtitle: "Master CLI tools, functional components, JSX, props vs state, rendering rules, and composition.",
        nodes: [
          "CLI Tools (Vite)",
          "Functional Components & JSX",
          "Props vs State & Component Lifecycle",
          "Conditional Rendering & Composition",
          "Lists, Keys & Event Handling",
          "Render Props & High Order Components (HOC)",
        ],
      },
      {
        title: "2. Core React Hooks",
        subtitle: "Master standard state, effect, ref, reducer, memoization, context hooks, and custom hooks.",
        nodes: [
          "Basic Hooks (useState / useEffect / useRef)",
          "Performance Hooks (useMemo / useCallback)",
          "State & Context Hooks (useReducer / useContext)",
          "Creating Custom Hooks & Hooks Best Practices",
        ],
      },
      {
        title: "3. Routers & State Management",
        subtitle: "Implement client-side routing, global state stores, and modular CSS styling.",
        nodes: [
          "Routers (React Router / Tanstack Router)",
          "State Management (Context API / Zustand / Jotai / MobX)",
          "Writing CSS (Tailwind CSS / CSS Modules / Panda CSS)",
        ],
      },
      {
        title: "4. Component Libraries & Headless UI",
        subtitle: "Utilize opinionated component libraries and unstyled headless UI primitives.",
        nodes: [
          "UI Component Libraries (Shadcn UI / Material UI / Chakra UI)",
          "Headless UI Components (Radix UI / React Aria / Ark UI)",
        ],
      },
      {
        title: "5. API Calls & Data Fetching",
        subtitle: "Connect React apps to REST and GraphQL APIs with robust caching engines.",
        nodes: [
          "REST API Calls (TanStack Query / Axios / SWR / RTK Query)",
          "GraphQL APIs (Apollo Client / Relay / urql)",
        ],
      },
      {
        title: "6. Forms, Types & Schema Validation",
        subtitle: "Build validated form interfaces with strong TypeScript types and Zod schemas.",
        nodes: [
          "Form Libraries (React Hook Form / Formik)",
          "TypeScript Integration with React",
          "Schema Validation (Zod)",
        ],
      },
      {
        title: "7. Testing & Quality Assurance",
        subtitle: "Write unit tests, component tests, and end-to-end user flows.",
        nodes: [
          "Unit Testing Tools (Vitest / Jest)",
          "Component Testing (React Testing Library)",
          "End-to-End Testing (Playwright / Cypress)",
        ],
      },
      {
        title: "8. Animations & Micro-Interactions",
        subtitle: "Create smooth 60fps UI animations, gestures, and physics-based transitions.",
        nodes: [
          "Framer Motion",
          "React Spring & GSAP",
        ],
      },
      {
        title: "9. Advanced React Concepts",
        subtitle: "Handle errors gracefully, work with DOM portals, suspense boundaries, and server APIs.",
        nodes: [
          "Error Boundaries",
          "Portals & Modal Overlays",
          "Suspense Boundaries & Server APIs",
        ],
      },
      {
        title: "10. Frameworks & Mobile Ecosystem",
        subtitle: "Scale React applications into fullstack web frameworks and mobile apps.",
        nodes: [
          "React Frameworks (Next.js / Astro / React Router)",
          "Mobile Applications (React Native)",
        ],
      },
    ],
  },
  {
    id: "nextjs-framework",
    category: "skill",
    number: 6,
    title: "6. Next.js Framework",
    displayTitle: "Next.js Mastery",
    subtitle: "Here's a timeline of the Modern Next.js Fullstack App Router path.",
    timelineSubtitle: "Here's a timeline of the Modern Next.js Fullstack App Router path.",
    icon: BrandNextjsIcon,
    color: "#38bdf8",
    bgBadge: "bg-sky-500/10",
    borderBadge: "border-sky-500/20",
    textBadge: "text-sky-400",
    ratings: "4.9 (18.2K Ratings)",
    salary: "₹9 – 28 LPA",
    growth: "+49.1% Growth",
    roles: "170,000+ Active Roles",
    growthPhases: [
      { phase: "PHASE 1: APP ROUTER INITIATE", title: "App Router Initiate", description: "Next.js 16 layouts, pages & routing", color: "#7dd3fc" },
      { phase: "PHASE 2: SSR & STREAMING MASTER", title: "SSR & Streaming Master", description: "Server Components, Suspense & Streaming", color: "#38bdf8" },
      { phase: "PHASE 3: FULLSTACK SERVER ACTIONS", title: "Fullstack Server Actions", description: "Server Actions, Route Handlers & Database mutations", color: "#0284c7" },
      { phase: "PHASE 4: VERCEL EDGE ARCHITECT", title: "Vercel Edge Architect", description: "Edge Middleware, ISR, Optimization & Vercel Ops", color: "#0369a1" },
    ],
    sections: [
      {
        title: "1. Introduction & Getting Started",
        subtitle: "Understand why Next.js, Next.js vs Remix, rendering strategies (SSR/SSG/CSR/SPA), and create-next-app.",
        nodes: [
          "Introduction (Why Next.js / Next.js vs Remix / SPA vs SSR)",
          "Rendering Strategies (SSR / SSG / CSR / SPA)",
          "Getting Started (create-next-app)",
        ],
      },
      {
        title: "2. App Router & Types of Routers",
        subtitle: "Master Pages Router vs App Router, routing terminology, layouts/templates, streaming, and parallel routes.",
        nodes: [
          "Types of Routers (Pages Router vs App Router)",
          "Routing Terminology & Rendering Pages",
          "Layouts and Templates",
          "Loading, Streaming & Error States",
          "Routing Patterns (Parallel Routes & Intercepting Routes)",
        ],
      },
      {
        title: "3. Middleware & Route Structuring",
        subtitle: "Configure Edge middleware, route matching, headers, cookies, API endpoints, and internationalization (i18n).",
        nodes: [
          "Middleware (Route Matcher / Cookies / Setting Headers)",
          "Structuring Routes & Use Cases",
          "API Endpoints (Static vs Dynamic / Caching / Streaming / Redirects)",
          "Internationalization (i18n)",
        ],
      },
      {
        title: "4. Data Fetching Patterns & Server Actions",
        subtitle: "Master client vs server fetching, parallel vs sequential fetching, sensitive data, and Server Actions.",
        nodes: [
          "Fetching Locations (Client vs Server Data Fetching)",
          "Data Fetching Patterns (Parallel vs Sequential & Preloading Data)",
          "Handling Sensitive Data",
          "Server Actions & Mutations",
        ],
      },
      {
        title: "5. Caching & Runtimes",
        subtitle: "Manage fetch memoization, React Cache, revalidation, Node.js vs Edge runtimes, and component composition.",
        nodes: [
          "Caching Data (Fetch Memoization / React Cache / Revalidating Data)",
          "Revalidation & Error Recovery",
          "Runtimes (Node.js Runtime vs Edge Runtime)",
          "Rendering Composition (Client Rendered vs Server Rendered)",
        ],
      },
      {
        title: "6. Writing CSS & Styling",
        subtitle: "Implement styling with Global CSS, CSS Modules, Tailwind CSS, Sass, and CSS-in-JS solutions.",
        nodes: [
          "Global CSS & CSS Modules",
          "Tailwind CSS & Sass",
          "CSS-in-JS Solutions",
        ],
      },
      {
        title: "7. Asset & Performance Optimizations",
        subtitle: "Optimize images, videos, fonts, metadata SEO, package bundling, lazy loading, and third-party scripts.",
        nodes: [
          "Image, Video & Font Optimization (next/image / next/font)",
          "Metadata API & SEO Optimization",
          "Package Bundling & Lazy Loading",
          "Scripts & Third-Party Library Optimizations",
          "Memory Usage Optimization",
        ],
      },
      {
        title: "8. Configuration & Tooling",
        subtitle: "Configure TypeScript, ESLint, Prettier, environment variables, MDX markdown, and custom servers.",
        nodes: [
          "Setting Up Tooling (TypeScript / ESLint / Prettier)",
          "Environment Variables",
          "Markdown and MDX Integration",
          "Custom Server Setup",
        ],
      },
      {
        title: "9. Telemetry, Analytics & Testing",
        subtitle: "Integrate OpenTelemetry, Vercel Analytics, Vitest, Jest, Playwright, and Cypress testing frameworks.",
        nodes: [
          "Analytics & Instrumentation (OpenTelemetry & Vercel Analytics)",
          "Testing Frameworks (Vitest / Jest)",
          "End-to-End Testing (Playwright / Cypress)",
        ],
      },
      {
        title: "10. Production & Deployment",
        subtitle: "Prepare Next.js applications for production and deploy with Node.js servers, Docker, or static exports.",
        nodes: [
          "Preparing for Production",
          "Deployment Options (Node.js Server / Docker Container / Static Export / Adapters)",
        ],
      },
    ],
  },
];

const CAREER_ROADMAPS: PresetRoadmap[] = [
  {
    id: "full-stack-developer",
    category: "career",
    number: 1,
    title: "1. Full Stack Developer",
    displayTitle: "Full Stack Developer Track",
    subtitle: "Here's a timeline of the Full-Stack Engineering path.",
    timelineSubtitle: "Here's a timeline of the Full-Stack Engineering path.",
    icon: Monitor,
    color: "#6366f1",
    bgBadge: "bg-blue-500/10",
    borderBadge: "border-blue-500/20",
    textBadge: "text-blue-400",
    ratings: "4.9 (18.3K Ratings)",
    salary: "₹9 – 30 LPA",
    growth: "+49.5% Growth",
    roles: "210,000+ Active Roles",
    growthPhases: [
      { phase: "PHASE 1: FRONTEND FOUNDATIONS", title: "Frontend Builder", description: "HTML, CSS, JavaScript, React & Tailwind CSS", color: "#818cf8" },
      { phase: "PHASE 2: BACKEND ENGINEERING", title: "Backend Specialist", description: "Node.js, PostgreSQL, RESTful APIs, JWT Auth & Redis", color: "#6366f1" },
      { phase: "PHASE 3: CLOUD & DEVOPS BASICS", title: "Cloud Integrator", description: "Linux Basics & AWS Services (EC2, S3, VPC, Route53, SES)", color: "#4f46e5" },
      { phase: "PHASE 4: AUTOMATION & INFRASTRUCTURE", title: "DevOps & Infrastructure Expert", description: "GitHub Actions CI/CD, Ansible, Terraform & Monit Monitoring", color: "#4338ca" },
    ],
    sections: [
      {
        title: "Frontend Fundamentals & Tools",
        subtitle: "Core web languages, version control, and package management.",
        nodes: [
          "HTML",
          "CSS",
          "JavaScript",
          "Checkpoint - Static Webpages",
          "Checkpoint - Interactivity",
          "Git",
          "GitHub",
          "Checkpoint - Collaborative Work",
          "npm",
          "Checkpoint - External Packages",
        ],
      },
      {
        title: "Modern Frontend Frameworks",
        subtitle: "Component-based UI development and utility-first styling.",
        nodes: [
          "React",
          "Tailwind CSS",
          "Checkpoint - Frontend Apps",
        ],
      },
      {
        title: "Backend Development & Databases",
        subtitle: "Server-side runtimes, relational databases, authentication & caching.",
        nodes: [
          "Node.js",
          "Checkpoint - CLI Apps",
          "PostgreSQL",
          "Checkpoint - Simple CRUD Apps",
          "RESTful APIs",
          "JWT Auth",
          "Redis",
          "Checkpoint - Complete App",
        ],
      },
      {
        title: "Cloud & Linux Essentials",
        subtitle: "Linux operating system basics and core AWS cloud services.",
        nodes: [
          "Linux Basics",
          "Basic AWS Services (EC2, S3, VPC, Route53, SES)",
          "Checkpoint - Deployment",
        ],
      },
      {
        title: "CI/CD, Automation & Infrastructure",
        subtitle: "Infrastructure as Code, deployment automation, and system monitoring.",
        nodes: [
          "Monit",
          "Checkpoint - Monitoring",
          "GitHub Actions",
          "Checkpoint - CI / CD",
          "Ansible",
          "Checkpoint - Automation",
          "Terraform",
          "Checkpoint - Infrastructure",
        ],
      },
    ],
  },
  {
    id: "ai-engineer",
    category: "career",
    number: 2,
    title: "2. AI Engineer",
    displayTitle: "AI Engineer Track",
    subtitle: "Here's a timeline of the Artificial Intelligence Engineering path.",
    timelineSubtitle: "Here's a timeline of the Artificial Intelligence Engineering path.",
    icon: Cpu,
    color: "#a855f7",
    bgBadge: "bg-purple-500/10",
    borderBadge: "border-purple-500/20",
    textBadge: "text-purple-400",
    ratings: "5.0 (22.4K Ratings)",
    salary: "₹12 – 40 LPA",
    growth: "+62.1% Growth",
    roles: "175,000+ Active Roles",
    growthPhases: [
      { phase: "PHASE 1: PROMPT & CONTEXT ARCHITECT", title: "LLM & Prompt Foundations", description: "Tokens, Sampling, Prompting Techniques & Context Engineering", color: "#c084fc" },
      { phase: "PHASE 2: EMBEDDINGS & RAG SPECIALIST", title: "RAG & Vector Search Specialist", description: "Hugging Face, Vector Databases, Chunking & LangChain / LlamaIndex", color: "#a855f7" },
      { phase: "PHASE 3: AGENTS & MCP ARCHITECT", title: "Agentic & MCP Systems Architect", description: "Multi-Agents, Model Context Protocol & Local/Remote MCP Servers", color: "#9333ea" },
      { phase: "PHASE 4: OBSERVABILITY, EVALS & MULTIMODAL GOD", title: "Production AI & Multimodal Master", description: "LangSmith Observability, DeepEval/RAGAS Evals, Multimodal AI & Dev Tools", color: "#7e22ce" },
    ],
    sections: [
      {
        title: "LLM Fundamentals & Prompt Engineering",
        subtitle: "Core terminology, tokenization, sampling parameters, and advanced prompting techniques.",
        nodes: [
          "Introduction to AI Engineering",
          "LLM Fundamentals & Tokenization",
          "Sampling Parameters (Temperature, Top-K, Top-P)",
          "Prompting Techniques (Zero-Shot, Few-Shot, ReAct, CoT)",
          "Prompt Anatomy & System Prompting",
          "Model Interaction (Function Calling, Streaming)",
        ],
      },
      {
        title: "Context Engineering & Model Ecosystem",
        subtitle: "Context window management, model selection, open/closed models, and local runtimes.",
        nodes: [
          "Context Engineering & Compaction",
          "Closed Models (Claude, Gemini, GPT-4o, Cohere)",
          "Open Source Models (Llama 3, DeepSeek, Qwen)",
          "Hugging Face Ecosystem & Transformers.js",
          "Local LLM Runtimes (Ollama, LM Studio)",
          "APIs & SDKs (OpenAI, Anthropic, Gemini)",
        ],
      },
      {
        title: "Embeddings & Vector Databases",
        subtitle: "Vector representations, similarity search, and high-performance vector databases.",
        nodes: [
          "What are Embeddings & Semantic Search",
          "Embedding Models (OpenAI, Sentence Transformers)",
          "Popular Vector DBs (Pinecone, Chroma, Supabase, FAISS)",
          "Implementing Vector Search & Indexing",
        ],
      },
      {
        title: "RAGs (Retrieval-Augmented Generation)",
        subtitle: "Document chunking, retrieval strategies, and RAG orchestration frameworks.",
        nodes: [
          "What are RAGs & RAG Usecases",
          "Chunking & Retrieval Pipelines",
          "RAG Frameworks (LangChain, LlamaIndex, RAGFlow)",
          "RAG vs Fine-tuning",
        ],
      },
      {
        title: "AI Agents & Model Context Protocol (MCP)",
        subtitle: "Autonomous agents, MCP Host/Server/Client development, and agentic SDKs.",
        nodes: [
          "AI Agents & Multi-Agent Workflows",
          "Agent SDKs & Tools Calling",
          "Model Context Protocol (MCP Host, Client, Server)",
          "Building & Connecting MCP Servers (Local & Remote)",
        ],
      },
      {
        title: "AI Safety, Evaluation & Observability",
        subtitle: "Safety best practices, content moderation, LLM observability, and evals.",
        nodes: [
          "AI Safety, Bias & Prompt Injection Attacks",
          "Safety Best Practices & Content Moderation APIs",
          "LLM Observability & Tracing (LangSmith, Langfuse, Helicone)",
          "LLM Evaluations & Regression Testing (DeepEval, RAGAS)",
        ],
      },
      {
        title: "Multimodal AI & Developer Tools",
        subtitle: "Vision, Audio, Image Generation, Speech APIs, and AI-assisted coding environments.",
        nodes: [
          "Multimodal AI (Vision, DALL-E, Whisper, Speech-to-Text)",
          "Multimodal Application Frameworks",
          "AI Coding & Dev Tools (Claude Code, Cursor, Windsurf)",
        ],
      },
    ],
  },
  {
    id: "data-analyst",
    category: "career",
    number: 3,
    title: "3. Data Analyst",
    displayTitle: "Data Analyst Track",
    subtitle: "Here's a timeline of the Business Data Analyst path.",
    timelineSubtitle: "Here's a timeline of the Business Data Analyst path.",
    icon: BarChart3,
    color: "#14b8a6",
    bgBadge: "bg-teal-500/10",
    borderBadge: "border-teal-500/20",
    textBadge: "text-teal-400",
    ratings: "4.8 (11.2K Ratings)",
    salary: "₹6 – 18 LPA",
    growth: "+36.5% Growth",
    roles: "130,000+ Active Roles",
    growthPhases: [
      { phase: "PHASE 1: FOUNDATIONAL ANALYSIS & EXCEL", title: "Data & Excel Analyst", description: "Excel Functions (VLOOKUP, IF, Pivot Tables), Data Types & SQL Basics", color: "#2dd4bf" },
      { phase: "PHASE 2: DATA CLEANUP & PROGRAMMING", title: "Python Data Wrangler", description: "SQL Databases, APIs, Web Scraping, Pandas & Data Cleaning", color: "#14b8a6" },
      { phase: "PHASE 3: STATISTICAL ANALYSIS & BI DASHBOARDS", title: "BI & Statistics Specialist", description: "Descriptive & Inferential Stats, Tableau, Power BI & Charting", color: "#0d9488" },
      { phase: "PHASE 4: ML, BIG DATA & PORTFOLIO GOD", title: "Advanced Analytics & ML Lead", description: "Scikit-Learn ML, Hadoop/Spark Big Data & Portfolio Projects", color: "#0f766e" },
    ],
    sections: [
      {
        title: "Data Analytics Foundations & Excel",
        subtitle: "Types of analytics, core concepts, common Excel functions, charting, and pivot tables.",
        nodes: [
          "Introduction & Types of Data Analytics",
          "Key Concepts of Data (Collection, Cleanup, Exploration)",
          "Excel Analysis & Functions (VLOOKUP, IF, CONCAT, TRIM)",
          "Excel Charting & Pivot Tables",
        ],
      },
      {
        title: "Database Querying & Data Handling",
        subtitle: "SQL databases, web scraping, APIs, data collection, and Pandas data cleanup.",
        nodes: [
          "SQL Database Querying (Joins, CTEs, Aggregations)",
          "Data Collection (CSV, APIs, Web Scraping)",
          "Data Cleanup & Transformation (Pandas, Dplyr)",
          "Handling Missing Data, Outliers & Duplicates",
        ],
      },
      {
        title: "Descriptive & Statistical Analysis",
        subtitle: "Measures of dispersion, central tendency, distribution shapes, hypothesis testing, and regression.",
        nodes: [
          "Measures of Central Tendency & Dispersion (Mean, Std Dev, Variance)",
          "Distribution Shapes (Skewness, Kurtosis)",
          "Descriptive & Exploratory Analysis",
          "Statistical Analysis (Hypothesis Testing, Correlation, Regression)",
        ],
      },
      {
        title: "Data Visualization & BI Tools",
        subtitle: "Business intelligence dashboards, custom chart types, and visual storytelling.",
        nodes: [
          "BI Dashboarding (Power BI & Tableau)",
          "Data Visualization Libraries (Matplotlib, Seaborn, ggplot2)",
          "Chart Types (Bar, Histograms, Line, Heatmaps, Funnel)",
        ],
      },
      {
        title: "Applied Machine Learning & Big Data",
        subtitle: "Supervised/unsupervised ML algorithms, model evaluation, and Big Data processing.",
        nodes: [
          "Machine Learning Fundamentals (Supervised & Unsupervised)",
          "Popular ML Algorithms (Decision Trees, KNN, K-Means, Logistic Regression)",
          "Model Evaluation Techniques",
          "Big Data Technologies (Hadoop, Spark, MapReduce)",
          "Portfolio Projects & Kaggle Competitions",
        ],
      },
    ],
  },
  {
    id: "data-scientist",
    category: "career",
    number: 4,
    title: "4. Data Scientist",
    displayTitle: "Data Scientist Track",
    subtitle: "Here's a timeline of the Data Scientist & Predictive AI path.",
    timelineSubtitle: "Here's a timeline of the Data Scientist & Predictive AI path.",
    icon: Database,
    color: "#f59e0b",
    bgBadge: "bg-amber-500/10",
    borderBadge: "border-amber-500/20",
    textBadge: "text-amber-400",
    ratings: "4.9 (13.8K Ratings)",
    salary: "₹10 – 32 LPA",
    growth: "+47.2% Growth",
    roles: "120,000+ Active Roles",
    growthPhases: [
      { phase: "PHASE 1: STATS PROBE", title: "Stats Probe", description: "Probability theory & inferential stats", color: "#fbbf24" },
      { phase: "PHASE 2: PREDICTIVE MODELER", title: "Predictive Modeler", description: "XGBoost, Random Forests & Hyperparameters", color: "#f59e0b" },
      { phase: "PHASE 3: TIME SERIES EXPERT", title: "Time Series Expert", description: "ARIMA, Neural Nets & Text Mining", color: "#d97706" },
      { phase: "PHASE 4: BIG DATA SCIENTIST", title: "Big Data Scientist", description: "PySpark MLlib & Production A/B Deployment", color: "#b45309" },
    ],
    sections: [
      {
        title: "Primary Foundation",
        subtitle: "Probability theory and statistical inference.",
        nodes: ["Inferential Statistics", "Bayesian Probability", "Confidence Intervals", "Sampling Methods"],
      },
      {
        title: "Predictive Modeling",
        subtitle: "Supervised and unsupervised machine learning models.",
        nodes: ["Feature Engineering", "XGBoost & Random Forests", "Hyperparameter Tuning", "ROC-AUC Scoring"],
      },
      {
        title: "Deep Learning & NLP",
        subtitle: "Neural networks and text analytics.",
        nodes: ["Neural Net Architectures", "Time Series Forecasting", "Text Mining & Sentiment"],
      },
      {
        title: "Big Data Science",
        subtitle: "Distributed Machine Learning on PySpark.",
        nodes: ["PySpark MLlib", "BigQuery ML", "Distributed Feature Store"],
      },
      {
        title: "Production Serving",
        subtitle: "API endpoints and model drift monitoring.",
        nodes: ["FastAPI Model Endpoint", "A/B Test Deployment", "Model Drift Tracking"],
      },
    ],
  },
  {
    id: "devops-engineer",
    category: "career",
    number: 5,
    title: "5. DevOps Engineer",
    displayTitle: "DevOps Engineer Track",
    subtitle: "Here's a timeline of the Cloud DevOps & Site Reliability path.",
    timelineSubtitle: "Here's a timeline of the Cloud DevOps & Site Reliability path.",
    icon: Settings,
    color: "#6366f1",
    bgBadge: "bg-indigo-500/10",
    borderBadge: "border-indigo-500/20",
    textBadge: "text-indigo-400",
    ratings: "4.9 (12.9K Ratings)",
    salary: "₹10 – 35 LPA",
    growth: "+52.0% Growth",
    roles: "145,000+ Active Roles",
    growthPhases: [
      { phase: "PHASE 1: OS, NETWORKING & SCRIPTING", title: "Linux & Shell Systems Admin", description: "Linux, Bash/PowerShell, Terminal Tools, Vim, Networking Protocols & Git", color: "#818cf8" },
      { phase: "PHASE 2: CONTAINERS, SERVERS & CLOUD", title: "Containers & Cloud Engineer", description: "Docker, LXC, Web Servers (Nginx, Apache), AWS/Azure/GCP & Serverless", color: "#6366f1" },
      { phase: "PHASE 3: IAC, CONFIG & CI/CD PIPELINES", title: "Infrastructure & CI/CD Architect", description: "Terraform, CloudFormation, Ansible, GitHub Actions, Jenkins & Vault", color: "#4f46e5" },
      { phase: "PHASE 4: ORCHESTRATION, GITOPS & OBSERVABILITY GOD", title: "Kubernetes & SRE Master", description: "Kubernetes (EKS/GKE/AKS), Prometheus/Grafana, OpenTelemetry, GitOps & Service Mesh", color: "#4338ca" },
    ],
    sections: [
      {
        title: "1. Learn a Programming Language",
        subtitle: "Master Python and Go for automation, scripting, CLI tools, and APIs.",
        nodes: ["1. Learn a Programming Language"],
      },
      {
        title: "2. Operating System",
        subtitle: "Understand Linux distributions (Ubuntu, RHEL, SUSE) and Unix variants (FreeBSD, OpenBSD, NetBSD).",
        nodes: ["2. Operating System"],
      },
      {
        title: "3. Terminal Knowledge",
        subtitle: "Command line shell scripting, terminal text editing, process/performance monitoring, and networking tools.",
        nodes: ["3. Terminal Knowledge"],
      },
      {
        title: "4. Version Control Systems",
        subtitle: "Version control concepts, branch strategies, and code history with Git.",
        nodes: ["4. Version Control Systems"],
      },
      {
        title: "5. VCS Hosting",
        subtitle: "Remote code repositories, pull requests, and collaboration on GitHub, GitLab, and Bitbucket.",
        nodes: ["5. VCS Hosting"],
      },
      {
        title: "6. Containers",
        subtitle: "Containerization concepts, image builds, runtime isolation with Docker and LXC.",
        nodes: ["6. Containers"],
      },
      {
        title: "7. What is and how to setup X ?",
        subtitle: "Middleboxes, reverse proxies, caching, firewalls, load balancers, Nginx, Caddy, Tomcat, Apache, IIS.",
        nodes: ["7. What is and how to setup X ?"],
      },
      {
        title: "8. Networking & Protocols",
        subtitle: "DNS, HTTPS, HTTP, SSL/TLS, SSH key auth, OSI model, and email protocols.",
        nodes: ["8. Networking & Protocols"],
      },
      {
        title: "9. Cloud Providers",
        subtitle: "Public cloud computing infrastructure across AWS, Azure, Google Cloud, DigitalOcean, Hetzner, Render.",
        nodes: ["9. Cloud Providers"],
      },
      {
        title: "10. Serverless",
        subtitle: "Event-driven serverless functions on AWS Lambda, Cloudflare Workers, Vercel, Netlify.",
        nodes: ["10. Serverless"],
      },
      {
        title: "11. Provisioning",
        subtitle: "Declarative Infrastructure as Code (IaC) with Terraform, AWS CDK, CloudFormation, Pulumi.",
        nodes: ["11. Provisioning"],
      },
      {
        title: "12. Configuration Management",
        subtitle: "Automated server configuration and provisioning with Ansible, Chef, Salt, Puppet.",
        nodes: ["12. Configuration Management"],
      },
      {
        title: "13. CI / CD Tools",
        subtitle: "Continuous Integration & Delivery pipelines with GitLab CI, Circle CI, GitHub Actions, Jenkins.",
        nodes: ["13. CI / CD Tools"],
      },
      {
        title: "14. Secret Management",
        subtitle: "Secure credentials and dynamic secret storage with HashiCorp Vault, Sealed Secrets, ESO, SOPs.",
        nodes: ["14. Secret Management"],
      },
      {
        title: "15. Infrastructure Monitoring",
        subtitle: "Time-series metrics, alerting rules, and visualization dashboards with Prometheus, Grafana, Datadog.",
        nodes: ["15. Infrastructure Monitoring"],
      },
      {
        title: "16. Logs Management",
        subtitle: "Centralized log pipelines, aggregation, and queries with Loki, Elastic Stack (ELK), Splunk, Graylog.",
        nodes: ["16. Logs Management"],
      },
      {
        title: "17. Container Orchestration",
        subtitle: "Production container scheduling and cluster management with Kubernetes, EKS/GKE/AKS, Docker Swarm.",
        nodes: ["17. Container Orchestration"],
      },
      {
        title: "18. Observability & Application Monitoring",
        subtitle: "Distributed tracing, telemetry collection, and APM with OpenTelemetry, Jaeger, New Relic, Dynatrace.",
        nodes: ["18. Observability & Application Monitoring"],
      },
      {
        title: "19. Artifact Management",
        subtitle: "Private package registries and binary repository management with Artifactory, Nexus, Cloud Smith.",
        nodes: ["19. Artifact Management"],
      },
      {
        title: "20. GitOps",
        subtitle: "Declarative continuous delivery for cloud clusters driven by Git repositories using ArgoCD & FluxCD.",
        nodes: ["20. GitOps"],
      },
      {
        title: "21. Service Mesh",
        subtitle: "Microservices communication, mTLS encryption, and traffic routing with Istio, Consul, Linkerd, Envoy.",
        nodes: ["21. Service Mesh"],
      },
    ],
  },
  {
    id: "cybersecurity",
    category: "career",
    number: 6,
    title: "6. Cybersecurity",
    displayTitle: "Cybersecurity Specialist Track",
    subtitle: "Here's a timeline of the Ethical Hacking & Cyber Defense path.",
    timelineSubtitle: "Here's a timeline of the Ethical Hacking & Cyber Defense path.",
    icon: Shield,
    color: "#ef4444",
    bgBadge: "bg-rose-500/10",
    borderBadge: "border-rose-500/20",
    textBadge: "text-rose-400",
    ratings: "4.9 (10.1K Ratings)",
    salary: "₹9 – 32 LPA",
    growth: "+55.0% Growth",
    roles: "90,000+ Active Roles",
    growthPhases: [
      { phase: "PHASE 1: NETWORK DEFENDER", title: "Network Defender", description: "TCP/IP, SSL/TLS & OS Hardening", color: "#f87171" },
      { phase: "PHASE 2: ETHICAL HACKER", title: "Ethical Hacker", description: "Nmap, Metasploit & Burp Suite", color: "#ef4444" },
      { phase: "PHASE 3: SIEM THREAT HUNTER", title: "SIEM Threat Hunter", description: "Splunk SIEM & Wireshark Packet Analysis", color: "#dc2626" },
      { phase: "PHASE 4: CHIEF SECURITY AUDITOR", title: "Chief Security Auditor", description: "SOC2, ISO 27001 & Zero Trust Architecture", color: "#b91c1c" },
    ],
    sections: [
      {
        title: "Primary Foundation",
        subtitle: "Network protocols & OS security hardening.",
        nodes: ["TCP/IP & SSL/TLS Protocols", "Linux Security Hardening", "PKI & Encryption"],
      },
      {
        title: "Ethical Hacking",
        subtitle: "Vulnerability assessment & pentesting methodologies.",
        nodes: ["Nmap Reconnaissance", "Metasploit Exploitation", "Burp Suite Web Security", "OWASP Top 10"],
      },
      {
        title: "Defensive Security",
        subtitle: "Firewalls, Zero Trust & network defense systems.",
        nodes: ["Firewall & IDS/IPS Config", "Zero Trust Architecture", "VPN & Tunnels", "Endpoint Protection"],
      },
      {
        title: "SIEM & Incident Response",
        subtitle: "Threat detection & packet analysis playbooks.",
        nodes: ["Splunk / Elastic SIEM", "Wireshark Packet Analysis", "Threat Hunting Playbooks"],
      },
      {
        title: "Compliance & Auditing",
        subtitle: "Security frameworks & executive reporting.",
        nodes: ["SOC2 & ISO 27001 Audit", "PCI-DSS Security Controls", "PenTest Final Reports"],
      },
    ],
  },
  {
    id: "machine-learning",
    category: "career",
    number: 7,
    title: "7. Machine Learning Engineer",
    displayTitle: "Machine Learning Engineer Track",
    subtitle: "Here's a timeline of the Machine Learning Engineering path.",
    timelineSubtitle: "Here's a timeline of the Machine Learning Engineering path.",
    icon: BrainCircuit,
    color: "#ec4899",
    bgBadge: "bg-pink-500/10",
    borderBadge: "border-pink-500/20",
    textBadge: "text-pink-400",
    ratings: "4.9 (19.5K Ratings)",
    salary: "₹10 – 38 LPA",
    growth: "+58.4% Growth",
    roles: "160,000+ Active Roles",
    growthPhases: [
      { phase: "PHASE 1: MATH, PROBABILITY & PYTHON", title: "ML Math & Python Foundations", description: "Calculus, Linear Algebra, Probability, Statistics, Python Syntax & Essential Libraries", color: "#f472b6" },
      { phase: "PHASE 2: DATA PREPROCESSING & CLASSICAL ML", title: "Data Preprocessing & Scikit-Learn Specialist", description: "Data Cleaning, Feature Engineering, Supervised/Unsupervised Learning & Scikit-Learn Pipeline", color: "#ec4899" },
      { phase: "PHASE 3: EVALUATION, REINFORCEMENT & DEEP LEARNING", title: "Deep Learning & Model Evaluation Architect", description: "Evaluation Metrics, Cross-Validation, Neural Networks, CNNs, RNNs, PyTorch & TensorFlow", color: "#db2777" },
      { phase: "PHASE 4: ATTENTION, MULTIMODAL, NLP & EXPLAINABLE AI GOD", title: "Generative AI & Advanced ML Master", description: "Transformers, Self-Attention, GANs, NLP Pipelines & Explainable AI (XAI)", color: "#be185d" },
    ],
    sections: [
      {
        title: "Mathematics & Programming Foundations",
        subtitle: "Calculus, linear algebra, probability, statistics, and core Python programming.",
        nodes: [
          "Calculus (Derivatives, Partial Derivatives, Gradients, Jacobian, Hessian)",
          "Linear Algebra (Vectors, Matrices, SVD, Eigenvalues, Diagonalization)",
          "Probability & Statistics (Bayes Theorem, Random Variables, Distributions)",
          "Python Programming & OOP Syntax",
          "Essential Libraries (NumPy, Pandas, Matplotlib, Seaborn)",
        ],
      },
      {
        title: "Data Sources, Cleaning & Preprocessing",
        subtitle: "Data ingestion, multi-format parsing, feature engineering, and scaling.",
        nodes: [
          "Data Sources & Formats (SQL/NoSQL, APIs, CSV, JSON, Parquet)",
          "Data Preprocessing & Cleaning Techniques",
          "Feature Engineering, Selection & Scaling",
          "Dimensionality Reduction (PCA, Autoencoders)",
        ],
      },
      {
        title: "Supervised, Unsupervised & Reinforcement Learning",
        subtitle: "Classification, regression algorithms, clustering techniques, and RL policies.",
        nodes: [
          "Supervised Classification (KNN, Logistic Regression, SVM, Decision Trees, Random Forest, XGBoost)",
          "Supervised Regression (Linear, Polynomial, Lasso, Ridge, ElasticNet)",
          "Unsupervised Clustering (Exclusive, Overlapping, Hierarchical, Probabilistic)",
          "Reinforcement Learning (DQN, Policy Gradient, Actor-Critic, Q-Learning)",
          "Scikit-Learn ML Pipelines (Train-Test Split, Tuning, Model Selection)",
        ],
      },
      {
        title: "Model Evaluation, Validation & Deep Learning Fundamentals",
        subtitle: "Performance metrics, cross-validation, neural network architectures, and DL frameworks.",
        nodes: [
          "Model Evaluation Metrics (Accuracy, Precision, Recall, F1, ROC-AUC, Confusion Matrix)",
          "Validation Techniques (K-Fold Cross Validation, LOOCV)",
          "Neural Network Basics (Perceptrons, Backpropagation, Activations, Loss Functions)",
          "Deep Learning Frameworks (PyTorch, TensorFlow, Keras)",
          "Convolutional Neural Networks (CNNs) & Applications",
          "Recurrent Neural Networks (RNN, GRU, LSTM)",
        ],
      },
      {
        title: "Advanced ML, Attention Mechanisms & NLP",
        subtitle: "Transformers, generative adversarial networks, natural language processing, and explainable AI.",
        nodes: [
          "Attention Mechanisms & Transformers (Self-Attention, Multi-Head)",
          "Generative Adversarial Networks (GANs) & Autoencoders",
          "Natural Language Processing (Tokenization, Lemmatization, Embeddings)",
          "Explainable AI (XAI)",
        ],
      },
    ],
  },
];

interface RightBranchTopic {
  id: string;
  name: string;
  isRecommended?: boolean;
  isAlternative?: boolean;
  isOrderNotStrict?: boolean;
  docUrl?: string;
  desc?: string;
}

interface RightBranchGroup {
  groupName?: string;
  topics: RightBranchTopic[];
}

interface NodeTreeBranches {
  description: string;
  groups: RightBranchGroup[];
}

const DEVOPS_NODE_TREE_BRANCHES: Record<string, NodeTreeBranches> = {
  "1. Learn a Programming Language": {
    description: "Core programming languages for writing DevOps automation scripts, CLI tools, infrastructure controllers, and APIs.",
    groups: [
      {
        topics: [
          { id: "py", name: "Python", isRecommended: true, docUrl: "https://docs.python.org/3/", desc: "Boto3 AWS SDK, PyTest, YAML/JSON scripting" },
          { id: "go", name: "Go", isRecommended: true, docUrl: "https://go.dev/doc/", desc: "Goroutines, static binaries, Cobra CLI, Docker & K8s tooling" },
        ],
      },
      {
        topics: [
          { id: "rb", name: "Ruby", isAlternative: true, desc: "Chef cookbooks & system administration scripts" },
          { id: "rs", name: "Rust", isAlternative: true, desc: "Memory-safe high-performance systems utilities" },
          { id: "js-node", name: "JavaScript / Node.js", isAlternative: true, docUrl: "https://nodejs.org/", desc: "Event-driven async I/O, npm packages, serverless handlers" },
        ],
      },
    ],
  },
  "2. Operating System": {
    description: "Operating system architecture, Linux distributions, Unix variants, systemd services, and Windows administration.",
    groups: [
      {
        groupName: "Linux",
        topics: [
          { id: "ub", name: "Ubuntu / Debian", isRecommended: true, desc: "APT package manager, systemd services, LTS release cycle" },
          { id: "rhel", name: "RHEL / Derivatives", isRecommended: true, desc: "RedHat Enterprise Linux, YUM/DNF, RPM packages" },
          { id: "suse", name: "SUSE Linux", isAlternative: true, desc: "OpenSUSE, YaST configuration tool" },
        ],
      },
      {
        groupName: "Unix",
        topics: [
          { id: "freebsd", name: "FreeBSD", isRecommended: true, desc: "ZFS filesystem, FreeBSD ports & jails" },
          { id: "openbsd", name: "OpenBSD", isAlternative: true, desc: "Security-focused OS, OpenSSH upstream" },
          { id: "netbsd", name: "NetBSD", isAlternative: true, desc: "Ultra-portable Unix OS" },
        ],
      },
      {
        groupName: "Windows",
        topics: [
          { id: "win", name: "Windows", isAlternative: true, desc: "Active Directory, IIS, WSL2 Linux subsystem" },
        ],
      },
    ],
  },
  "3. Terminal Knowledge": {
    description: "Command line shell scripting, terminal text editing, and system performance monitoring tools.",
    groups: [
      {
        groupName: "Scripting",
        topics: [
          { id: "bash", name: "Bash", isRecommended: true, desc: "Pipes, redirection, POSIX scripting, automation traps" },
          { id: "ps", name: "Power Shell", isAlternative: true, desc: "Cmdlets, object pipelines, PowerShell Core" },
        ],
      },
      {
        groupName: "Editors",
        topics: [
          { id: "editors", name: "Vim / Nano / Emacs", isRecommended: true, desc: "Modal text editing, config file management" },
        ],
      },
      {
        groupName: "Utilities",
        topics: [
          { id: "proc", name: "Process Monitoring", isRecommended: true, desc: "ps, top, htop, kill, pkill, nice" },
          { id: "perf", name: "Performance Monitoring", isRecommended: true, desc: "iostat, vmstat, sar, uptime, disk metrics" },
          { id: "net", name: "Networking Tools", isRecommended: true, desc: "curl, netstat, ss, dig, traceroute, tcpdump" },
          { id: "text", name: "Text Manipulation", isRecommended: true, desc: "grep, sed, awk, cut, sort, uniq, xargs" },
        ],
      },
    ],
  },
  "4. Version Control Systems": {
    description: "Version control systems, branch workflows, and code history.",
    groups: [
      {
        groupName: "Version Control",
        topics: [
          { id: "git", name: "Git", isRecommended: true, docUrl: "https://git-scm.com/doc", desc: "Commits, branches, rebase, merge, bisect, cherry-pick" },
        ],
      },
    ],
  },
  "5. VCS Hosting": {
    description: "Remote repository hosting, pull requests, and code review platforms.",
    groups: [
      {
        groupName: "VCS Hosting",
        topics: [
          { id: "github", name: "GitHub", isRecommended: true, desc: "Pull requests, GitHub Actions, protected branches" },
          { id: "gitlab", name: "GitLab", isAlternative: true, desc: "Merge requests, integrated GitLab CI/CD" },
          { id: "bitbucket", name: "Bitbucket", isAlternative: true, desc: "Jira integration, Bitbucket Pipelines" },
        ],
      },
    ],
  },
  "6. Containers": {
    description: "Containerization concepts, image building, runtime isolation, networking, and multi-container stacks.",
    groups: [
      {
        topics: [
          { id: "docker", name: "Docker", isRecommended: true, docUrl: "https://docs.docker.com/", desc: "Dockerfile, multi-stage builds, compose, volumes" },
          { id: "lxc", name: "LXC", isAlternative: true, desc: "Linux system containers, LXD daemon" },
        ],
      },
    ],
  },
  "7. What is and how to setup X ?": {
    description: "HTTP web servers, reverse proxies, caching layers, firewalls, and load balancing algorithms.",
    groups: [
      {
        groupName: "Middleboxes",
        topics: [
          { id: "fwd", name: "Forward Proxy", isRecommended: true },
          { id: "rev", name: "Reverse Proxy", isRecommended: true },
          { id: "caching", name: "Caching Server", isRecommended: true },
          { id: "fw", name: "Firewall", isRecommended: true },
          { id: "lb", name: "Load Balancer", isRecommended: true },
        ],
      },
      {
        groupName: "Web Servers",
        topics: [
          { id: "nginx", name: "Nginx", isRecommended: true, desc: "Event-driven, reverse proxy, virtual hosts, SSL" },
          { id: "apache", name: "Apache", isAlternative: true, desc: "Multi-processing modules, .htaccess" },
          { id: "caddy", name: "Caddy", isAlternative: true, desc: "Automatic HTTPS via Let's Encrypt" },
          { id: "tomcat", name: "Tomcat", isAlternative: true },
          { id: "iis", name: "IIS", isAlternative: true },
        ],
      },
    ],
  },
  "8. Networking & Protocols": {
    description: "Computer networking, OSI model layers, HTTP/S web protocols, SSH key authentication, and DNS resolution.",
    groups: [
      {
        groupName: "Protocols & Layers",
        topics: [
          { id: "dns", name: "DNS", isRecommended: true },
          { id: "https", name: "HTTPS", isRecommended: true },
          { id: "http", name: "HTTP", isRecommended: true },
          { id: "ssl", name: "SSL / TLS", isRecommended: true },
          { id: "ssh", name: "SSH", isRecommended: true },
          { id: "ftp", name: "FTP / SFTP", isOrderNotStrict: true },
          { id: "osi", name: "OSI Model", isOrderNotStrict: true },
        ],
      },
      {
        groupName: "Email Protocols",
        topics: [
          { id: "smtp", name: "SMTP", isOrderNotStrict: true },
          { id: "imap", name: "IMAP", isOrderNotStrict: true },
          { id: "spf", name: "SPF", isOrderNotStrict: true },
          { id: "dkim", name: "Domain Keys", isOrderNotStrict: true },
          { id: "dmarc", name: "DMARC", isOrderNotStrict: true },
          { id: "pop3s", name: "POP3S", isOrderNotStrict: true },
          { id: "grey", name: "White / Grey Listing", isOrderNotStrict: true },
        ],
      },
    ],
  },
  "9. Cloud Providers": {
    description: "Public cloud computing infrastructure, compute instances, object storage, and virtual private networks.",
    groups: [
      {
        topics: [
          { id: "aws", name: "AWS", isRecommended: true, desc: "EC2, S3, VPC, IAM, RDS, Route53, EKS, Lambda" },
          { id: "azure", name: "Azure", isRecommended: true, desc: "Azure VMs, Blob Storage, VNet, Entra ID, AKS" },
          { id: "gcp", name: "Google Cloud", isRecommended: true, desc: "Compute Engine, Cloud Storage, GKE, BigQuery" },
          { id: "do", name: "Digital Ocean", isAlternative: true },
          { id: "hetzner", name: "Hetzner", isAlternative: true },
          { id: "render", name: "Render", isAlternative: true },
          { id: "alibaba", name: "Alibaba Cloud", isAlternative: true },
          { id: "heroku", name: "Heroku", isAlternative: true },
        ],
      },
    ],
  },
  "10. Serverless": {
    description: "Serverless functions, event-driven architecture, and edge runtimes.",
    groups: [
      {
        topics: [
          { id: "lambda", name: "AWS Lambda", isRecommended: true },
          { id: "cf-workers", name: "Cloudflare Workers", isRecommended: true },
          { id: "az-func", name: "Azure Functions", isAlternative: true },
          { id: "vercel", name: "Vercel", isAlternative: true },
          { id: "netlify", name: "Netlify", isAlternative: true },
          { id: "gcp-func", name: "GCP Functions", isAlternative: true },
        ],
      },
    ],
  },
  "11. Provisioning": {
    description: "Infrastructure as Code (IaC) tools to declaratively provision and manage cloud resources.",
    groups: [
      {
        topics: [
          { id: "tf", name: "Terraform", isRecommended: true, docUrl: "https://developer.hashicorp.com/terraform/docs", desc: "HCL syntax, state locking, modules, providers" },
          { id: "aws-cdk", name: "AWS CDK", isAlternative: true, desc: "TypeScript/Python imperative cloud CDK" },
          { id: "cfn", name: "CloudFormation", isAlternative: true },
          { id: "pulumi", name: "Pulumi", isAlternative: true },
        ],
      },
    ],
  },
  "12. Configuration Management": {
    description: "Automated configuration management and server provisioning frameworks.",
    groups: [
      {
        topics: [
          { id: "ansible", name: "Ansible", isRecommended: true },
          { id: "chef", name: "Chef", isAlternative: true },
          { id: "salt", name: "Salt", isAlternative: true },
          { id: "puppet", name: "Puppet", isAlternative: true },
        ],
      },
    ],
  },
  "13. CI / CD Tools": {
    description: "Continuous Integration & Deployment pipelines to automate build, test, and release workflows.",
    groups: [
      {
        topics: [
          { id: "gitlab-ci", name: "GitLab CI", isRecommended: true },
          { id: "circleci", name: "Circle CI", isRecommended: true },
          { id: "gha", name: "GitHub Actions", isRecommended: true, desc: "YAML workflows, matrix builds, secrets, runners" },
          { id: "railway", name: "Railway", isAlternative: true },
          { id: "buildkite", name: "Buildkite", isAlternative: true },
          { id: "teamcity", name: "TeamCity", isAlternative: true },
          { id: "jenkins", name: "Jenkins", isAlternative: true },
          { id: "octopus", name: "Octopus Deploy", isAlternative: true },
        ],
      },
    ],
  },
  "14. Secret Management": {
    description: "Secure storage, management, and dynamic retrieval of API keys, tokens, and secrets.",
    groups: [
      {
        topics: [
          { id: "vault", name: "Vault", isRecommended: true },
          { id: "sealed-sec", name: "Sealed Secrets", isAlternative: true },
          { id: "eso", name: "ESO (External Secrets)", isAlternative: true },
          { id: "sops", name: "SOPs", isAlternative: true },
          { id: "cloud-sec", name: "Cloud Specific Tools", isAlternative: true },
        ],
      },
    ],
  },
  "15. Infrastructure Monitoring": {
    description: "Metrics collection, alerting rules, time-series databases, and visualization dashboards.",
    groups: [
      {
        topics: [
          { id: "prom", name: "Prometheus", isRecommended: true },
          { id: "grafana", name: "Grafana", isRecommended: true },
          { id: "datadog-mon", name: "Datadog", isRecommended: true },
          { id: "zabbix", name: "Zabbix", isAlternative: true },
        ],
      },
    ],
  },
  "16. Logs Management": {
    description: "Centralized logging pipelines, log aggregation, and log query visualization.",
    groups: [
      {
        topics: [
          { id: "loki", name: "Loki", isRecommended: true },
          { id: "elk", name: "Elastic Stack", isRecommended: true },
          { id: "splunk", name: "Splunk", isAlternative: true },
          { id: "graylog", name: "Graylog", isAlternative: true },
          { id: "papertrail", name: "Papertrail", isAlternative: true },
        ],
      },
    ],
  },
  "17. Container Orchestration": {
    description: "Production Kubernetes cluster management, container scheduling, service discovery, and Helm charts.",
    groups: [
      {
        topics: [
          { id: "k8s", name: "Kubernetes", isRecommended: true, docUrl: "https://kubernetes.io/docs/", desc: "Pods, Deployments, Services, Ingress, ConfigMaps, Secrets" },
          { id: "managed-k8s", name: "GKE / EKS / AKS", isAlternative: true },
          { id: "ecs", name: "AWS ECS / Fargate", isAlternative: true },
          { id: "swarm", name: "Docker Swarm", isAlternative: true },
          { id: "openshift", name: "Openshift", isAlternative: true },
        ],
      },
    ],
  },
  "18. Observability & Application Monitoring": {
    description: "Distributed tracing, application performance monitoring, and telemetry collectors.",
    groups: [
      {
        topics: [
          { id: "jaeger", name: "Jaeger", isAlternative: true },
          { id: "relic", name: "New Relic", isAlternative: true },
          { id: "dd-apm", name: "Datadog", isAlternative: true },
          { id: "prom-apm", name: "Prometheus", isAlternative: true },
          { id: "otel", name: "OpenTelemetry", isAlternative: true },
          { id: "dynatrace", name: "Dynatrace", isAlternative: true },
        ],
      },
    ],
  },
  "19. Artifact Management": {
    description: "Private artifact registries, package repositories, and binary distribution management.",
    groups: [
      {
        topics: [
          { id: "jfrog", name: "Artifactory", isRecommended: true },
          { id: "nexus", name: "Nexus", isAlternative: true },
          { id: "cloudsmith", name: "Cloud Smith", isAlternative: true },
        ],
      },
    ],
  },
  "20. GitOps": {
    description: "Declarative Git-driven continuous delivery for Kubernetes and cloud clusters.",
    groups: [
      {
        topics: [
          { id: "argocd", name: "ArgoCD", isRecommended: true },
          { id: "flux", name: "FluxCD", isRecommended: true },
        ],
      },
    ],
  },
  "21. Service Mesh": {
    description: "Microservices network control plane, mTLS encryption, traffic splitting, and service discovery.",
    groups: [
      {
        topics: [
          { id: "istio", name: "Istio", isRecommended: true },
          { id: "consul", name: "Consul", isRecommended: true },
          { id: "linkerd", name: "Linkerd", isAlternative: true },
          { id: "envoy", name: "Envoy", isAlternative: true },
        ],
      },
    ],
  },
};

const C_NODE_TREE_BRANCHES: Record<string, NodeTreeBranches> = {
  "1. Introduction": {
    description: "Overview of C language, applications, C vs Assembly, and C vs C++.",
    groups: [
      {
        topics: [
          { id: "c-app", name: "Applications", desc: "Operating systems, embedded devices, databases, compilers" },
          { id: "c-vs-asm", name: "C vs Assembly", desc: "High-level abstractions vs raw machine instructions & registers" },
          { id: "c-vs-cpp", name: "C vs C++", desc: "Procedural paradigm vs Object-Oriented features, classes & templates" },
        ],
      },
    ],
  },
  "2. Setting Up": {
    description: "Setting up toolchains, compiler environment, text editors, and running your first C program.",
    groups: [
      {
        topics: [
          { id: "c-inst", name: "Installing C", desc: "Installing GCC, Clang, or MSVC compilers" },
          { id: "c-run", name: "Running First Code", desc: "Compiling with gcc main.c -o main && ./main" },
          { id: "c-editors", name: "Code Editors / IDE", desc: "VS Code, Vim, Neovim, CLion, and build integrations" },
        ],
      },
    ],
  },
  "3. Variables": {
    description: "Declaration vs definition, initialization rules, memory allocation, and printing variables.",
    groups: [
      {
        topics: [
          { id: "c-dec-def", name: "Declaration vs Definition", desc: "Specifying types vs reserving memory storage" },
          { id: "c-init", name: "Initialization", desc: "Assigning initial values, uninitialized garbage memory" },
          { id: "c-print", name: "Printing Variables", desc: "printf specifiers (%d, %f, %s, %p, %x, %zu)" },
        ],
      },
    ],
  },
  "4. Data Types": {
    description: "Primitive data types, fixed-width integers, booleans, type conversion, and type qualifiers.",
    groups: [
      {
        groupName: "Basic Data Types",
        topics: [
          { id: "c-int", name: "int", desc: "Signed/unsigned integer types" },
          { id: "c-float", name: "float", desc: "Single-precision floating-point numbers" },
          { id: "c-double", name: "double", desc: "Double-precision floating-point numbers" },
          { id: "c-char", name: "char", desc: "Single byte character representations" },
          { id: "c-fixed-int", name: "fixed width integers", desc: "<stdint.h> types (int8_t, int32_t, uint64_t)" },
          { id: "c-bool", name: "booleans", desc: "<stdbool.h> bool, true, false, and _Bool" },
          { id: "c-ext-types", name: "extended types", desc: "long long, size_t, ptrdiff_t, uintptr_t" },
        ],
      },
      {
        groupName: "Type Conversion",
        topics: [
          { id: "c-type-conv", name: "type conversion", desc: "Implicit promotion, type coercion, and explicit casting" },
        ],
      },
      {
        groupName: "Type Qualifiers",
        topics: [
          { id: "c-const", name: "const", desc: "Read-only variables and pointers" },
          { id: "c-volatile", name: "volatile", desc: "Prevent compiler optimization for hardware I/O registers" },
          { id: "c-restrict", name: "restrict", desc: "Pointer aliasing hint for compiler optimization" },
          { id: "c-atomic", name: "_Atomic", desc: "Atomic types and operations for multithreading" },
        ],
      },
    ],
  },
  "5. Operators": {
    description: "Arithmetic, comparison, logical, ternary, and low-level bitwise manipulation operators.",
    groups: [
      {
        topics: [
          { id: "c-op-comp", name: "comparison", desc: "==, !=, <, >, <=, >=" },
          { id: "c-op-arith", name: "arithmetic", desc: "+, -, *, /, %, ++, --" },
          { id: "c-op-logic", name: "logical", desc: "&&, ||, !" },
          { id: "c-op-tern", name: "ternary", desc: "Conditional operator (expr ? val1 : val2)" },
          { id: "c-op-bitwise", name: "bitwise", desc: "&, |, ^, ~, <<, >> bitwise operators" },
        ],
      },
    ],
  },
  "6. Control Flow": {
    description: "Conditional execution, looping structures, and jump control statements.",
    groups: [
      {
        topics: [
          { id: "c-ctrl-if", name: "if else / switch", desc: "Branching conditions and switch-case fallthrough" },
          { id: "c-ctrl-loops", name: "for / while / do while", desc: "Iteration loops and pre/post condition evaluation" },
          { id: "c-ctrl-jump", name: "break / continue", desc: "Loop control flow alteration and early termination" },
        ],
      },
    ],
  },
  "7. Functions": {
    description: "Function prototypes, main entry point, command-line arguments, variable scope, recursion, and variadic functions.",
    groups: [
      {
        topics: [
          { id: "c-fn-main", name: "main function", desc: "int main(int argc, char *argv[]) signature" },
          { id: "c-fn-recur", name: "recursive function", desc: "Base cases, call stack frames, and stack overflow prevention" },
          { id: "c-fn-scope", name: "variable scopes", desc: "Block scope, file scope, function prototype scope" },
          { id: "c-fn-var", name: "variadic functions", desc: "<stdarg.h> va_list, va_start, va_arg, va_end" },
          { id: "c-fn-args", name: "command - line Arguments", desc: "Parsing argc and argv options" },
        ],
      },
    ],
  },
  "8. Pointers & Memory": {
    description: "Pointer syntax, pointer arithmetic, void/null pointers, stack vs heap layout, dynamic memory, and memory corruption issues.",
    groups: [
      {
        groupName: "Pointer Basics",
        topics: [
          { id: "c-ptr-syntax", name: "Pointer Basics & Syntax", desc: "Address-of (&) and dereference (*) operators" },
          { id: "c-ptr-arith", name: "Pointer Arithmetic", desc: "Incrementing, decrementing, and indexing pointers" },
          { id: "c-ptr-void", name: "void Pointers", desc: "Generic void* pointers and type casting" },
          { id: "c-ptr-null", name: "Null Pointers", desc: "NULL macro, nullptr, and zero-pointer checks" },
        ],
      },
      {
        groupName: "Memory",
        topics: [
          { id: "c-mem-model", name: "Memory Model", desc: "Abstract memory architecture & address spaces" },
          { id: "c-stack-heap", name: "Stack vs Heap", desc: "Automatic stack allocation vs manual heap storage" },
          { id: "c-mem-life", name: "Lifetime of Objects", desc: "Automatic, static, thread, and allocated storage durations" },
        ],
      },
      {
        groupName: "Dynamic Memory",
        topics: [
          { id: "c-malloc", name: "malloc", desc: "Allocate uninitialized memory block" },
          { id: "c-calloc", name: "calloc", desc: "Allocate zero-initialized memory block" },
          { id: "c-realloc", name: "realloc", desc: "Resize existing memory block" },
          { id: "c-free", name: "free", desc: "Deallocate heap memory block" },
        ],
      },
      {
        groupName: "Memory Issues",
        topics: [
          { id: "c-mem-leaks", name: "Memory Leaks", desc: "Unfreed allocated heap memory" },
          { id: "c-dangling", name: "Dangling Pointers", desc: "Pointers referencing freed memory" },
          { id: "c-buf-over", name: "Buffer Overflow", desc: "Out-of-bounds array or pointer writes" },
          { id: "c-ub", name: "Undefined Behavior", desc: "Violations of C language specification rules" },
        ],
      },
    ],
  },
  "9. Arrays": {
    description: "Single and multi-dimensional array layout, contiguous memory storage, and bounds checking.",
    groups: [
      {
        topics: [
          { id: "c-array-basics", name: "Array Basics", desc: "Array declaration, initialization, indexing, and decay to pointer" },
        ],
      },
    ],
  },
  "10. Strings": {
    description: "Null-terminated character arrays, string manipulation functions, and memory safety.",
    groups: [
      {
        topics: [
          { id: "c-string-basics", name: "String Basics", desc: "String literals, '\\0' terminator, strlen, strcpy, strcmp, and strncpy" },
        ],
      },
    ],
  },
  "11. User Defined Types": {
    description: "Composite data types, structures, memory alignment/padding, unions, enums, and typedef aliases.",
    groups: [
      {
        topics: [
          { id: "c-structs", name: "Structs", desc: "struct member access (.), arrow operator (->), and padding" },
          { id: "c-unions", name: "Unions", desc: "Overlapping memory fields for memory-efficient variant data" },
          { id: "c-enums", name: "Enums", desc: "Enumerated integer constants and type safety" },
          { id: "c-typedef", name: "typedef", desc: "Creating clean type aliases for complex types and structs" },
        ],
      },
    ],
  },
  "12. Common Data Structures": {
    description: "Implementing fundamental data structures in C using raw pointers and structs.",
    groups: [
      {
        topics: [
          { id: "c-ds-dynarr", name: "Dynamic Arrays", desc: "Resizable vector arrays with capacity growth" },
          { id: "c-ds-ll", name: "Linked Lists", desc: "Singly and doubly linked list nodes and traversal" },
          { id: "c-ds-hash", name: "Hash Maps", desc: "Hash functions, buckets, and collision handling" },
          { id: "c-ds-ring", name: "Ring Buffers / FIFO Queues", desc: "Circular queue buffers for I/O and process buffers" },
        ],
      },
    ],
  },
  "13. Structuring Codebase": {
    description: "Header guards, include paths, compilation units, linkage rules, static, and extern storage classes.",
    groups: [
      {
        topics: [
          { id: "c-struct-headers", name: "Header Files", desc: "#ifndef / #pragma once header guards and prototypes" },
          { id: "c-struct-linkage", name: "Linkage", desc: "Translation units and symbol scope" },
          { id: "c-static", name: "static", desc: "Internal linkage and persistent local storage" },
          { id: "c-extern", name: "extern", desc: "External linkage for global symbols" },
        ],
      },
    ],
  },
  "14. Error Handling": {
    description: "System error codes, defensive programming, and non-local jump control.",
    groups: [
      {
        topics: [
          { id: "c-err-errno", name: "errno", desc: "<errno.h>, strerror(), and perror() for system call errors" },
          { id: "c-err-exit", name: "Exit Codes", desc: "EXIT_SUCCESS, EXIT_FAILURE, and exit() vs return" },
          { id: "c-err-setjmp", name: "setjmp / longjmp", desc: "<setjmp.h> exception-like non-local stack jumps" },
        ],
      },
    ],
  },
  "15. File I/O": {
    description: "Standard file streams, file handles, buffered I/O, and binary vs text mode reading/writing.",
    groups: [
      {
        topics: [
          { id: "c-io-streams", name: "Streams", desc: "stdin, stdout, stderr streams and buffering" },
          { id: "c-io-pointers", name: "File Pointers", desc: "fopen(), fclose(), fread(), fwrite(), fseek(), and ftell()" },
          { id: "c-io-mode", name: "Binary vs Text Mode", desc: "Text formatting vs raw byte struct serialization" },
        ],
      },
    ],
  },
  "16. Standard Library": {
    description: "Core C standard library header modules for string processing, math, memory, time, and system signals.",
    groups: [
      {
        topics: [
          { id: "c-lib-io", name: "Input / Output", desc: "<stdio.h> formatting and stream utilities" },
          { id: "c-lib-utils", name: "Data Utilities", desc: "<stdlib.h> conversion, rand, qsort, and bsearch" },
          { id: "c-lib-text", name: "Text Processing", desc: "<string.h> and <ctype.h> character classification" },
          { id: "c-lib-math", name: "Math & Time", desc: "<math.h> and <time.h> timestamping" },
          { id: "c-lib-diag", name: "Diagnostics & Limits", desc: "<assert.h>, <limits.h>, and <float.h>" },
          { id: "c-lib-os", name: "OS & Signal Interfaces", desc: "<signal.h> SIGINT, SIGTERM, and signal handlers" },
        ],
      },
    ],
  },
  "17. Build & Compilation": {
    description: "Compilers, build automation, static/shared linking, ABIs, and C package managers.",
    groups: [
      {
        groupName: "Build Systems",
        topics: [
          { id: "c-build-make", name: "GNU Make", desc: "Makefiles, targets, prerequisites, and variables" },
          { id: "c-build-cmake", name: "CMake", desc: "Cross-platform CMakeLists.txt generator syntax" },
          { id: "c-build-meson", name: "Meson", desc: "Fast modern python-based build system" },
          { id: "c-build-ninja", name: "Ninja", desc: "Ultra-fast low-level build file runner" },
        ],
      },
      {
        groupName: "Compilers",
        topics: [
          { id: "c-gcc-clang", name: "GCC / Clang", desc: "Standard C compilers and command line flags" },
          { id: "c-tcc", name: "TinyCC", desc: "Small fast C compiler" },
        ],
      },
      {
        groupName: "Build Concepts",
        topics: [
          { id: "c-linking", name: "Linking", desc: "Static vs dynamic linking" },
          { id: "c-abi", name: "ABI", desc: "Application Binary Interface specifications" },
          { id: "c-symbols", name: "Symbol Tables", desc: "Object file symbol export and mangling" },
          { id: "c-opt-levels", name: "Optimization Levels", desc: "-O0, -O1, -O2, -O3, -Os, -Ofast optimization flags" },
        ],
      },
      {
        groupName: "Package Managers",
        topics: [
          { id: "c-vcpkg", name: "vcpkg", desc: "C/C++ package manager by Microsoft" },
          { id: "c-conan", name: "Conan", desc: "Decentralized C/C++ package manager" },
        ],
      },
    ],
  },
  "18. Debugging": {
    description: "Command-line debuggers, memory sanitizers, leak detectors, and system call tracing.",
    groups: [
      {
        topics: [
          { id: "c-dbg-gdb", name: "GDB", desc: "Breakpoints, backtraces, watchpoints, and frame inspection" },
          { id: "c-dbg-lldb", name: "LLDB", desc: "LLVM debugger CLI commands and expression evaluation" },
          { id: "c-dbg-valgrind", name: "Valgrind", desc: "Memcheck tool for detecting invalid reads/writes and memory leaks" },
          { id: "c-dbg-asan", name: "AddressSanitizer (ASan)", desc: "Compiler instrumentation for fast memory error detection" },
          { id: "c-dbg-lsan", name: "LeakSanitizer (LSan)", desc: "Stand-alone leak detector integrated into ASan" },
          { id: "c-dbg-windbg", name: "WinDbg", desc: "Windows kernel and user-mode memory debugger" },
          { id: "c-dbg-strace", name: "strace", desc: "System call and signal tracer on Linux" },
        ],
      },
    ],
  },
  "19. Testing": {
    description: "Unit testing strategies, assertion macros, and automated C testing frameworks.",
    groups: [
      {
        topics: [
          { id: "c-test-assert", name: "assert.h", desc: "Built-in runtime assertion macros for invariants" },
          { id: "c-test-unity", name: "Unity", desc: "Lightweight C unit testing framework for embedded systems" },
          { id: "c-test-cmocka", name: "CMocka", desc: "Unit testing framework with mock object support" },
          { id: "c-test-check", name: "Check", desc: "Unit testing framework featuring fork-isolated test runs" },
        ],
      },
    ],
  },
  "20. Idioms & Design Patterns": {
    description: "Object-oriented C idioms, function pointer callbacks, opaque handles, and RAII emulation.",
    groups: [
      {
        topics: [
          { id: "c-idiom-fnptr", name: "Function Pointers & Callbacks", desc: "Passing function addresses for event-driven callbacks" },
          { id: "c-idiom-opaque", name: "Opaque Pointers", desc: "Encapsulation via forward declared struct pointers" },
          { id: "c-idiom-oop", name: "Object-Oriented C", desc: "Simulating classes with structs, vtables, and inheritance" },
          { id: "c-idiom-raii", name: "RAII-Simulated Cleanup", desc: "GCC/Clang __attribute__((cleanup)) for auto-freeing" },
        ],
      },
    ],
  },
  "21. Concurrency & Process Management": {
    description: "POSIX Threads (pthreads), mutex synchronization primitives, and inter-process communication.",
    groups: [
      {
        topics: [
          { id: "c-conc-pthreads", name: "POSIX Threads", desc: "pthread_create, pthread_join, and thread lifecycles" },
          { id: "c-conc-mutex", name: "Mutexes", desc: "pthread_mutex_t locking, condition variables, and race prevention" },
          { id: "c-conc-ipc", name: "IPC (Inter Process Communication)", desc: "Pipes, FIFOs, shared memory, semaphores, and unix sockets" },
        ],
      },
    ],
  },
  "21. C Standards": {
    description: "Evolution of official ISO C language standards from ANSI C89 through modern C23.",
    groups: [
      {
        topics: [
          { id: "c-std-c89", name: "C89 / C90", desc: "Original ANSI C standard specification" },
          { id: "c-std-c99", name: "C99", desc: "Added inline functions, // comments, stdbool, and variable declarations anywhere" },
          { id: "c-std-c11", name: "C11", desc: "Added _Generic, _Atomic, <threads.h>, and static assertions" },
          { id: "c-std-c17", name: "C17", desc: "Bug fixes and clarifications to C11 standard" },
          { id: "c-std-c23", name: "C23", desc: "Added constexpr, nullptr, typeof, auto type inference, and #embed" },
        ],
      },
    ],
  },
  "22. C Standards": {
    description: "Evolution of official ISO C language standards from ANSI C89 through modern C23.",
    groups: [
      {
        topics: [
          { id: "c-std-c89", name: "C89 / C90", desc: "Original ANSI C standard specification" },
          { id: "c-std-c99", name: "C99", desc: "Added inline functions, // comments, stdbool, and variable declarations anywhere" },
          { id: "c-std-c11", name: "C11", desc: "Added _Generic, _Atomic, <threads.h>, and static assertions" },
          { id: "c-std-c17", name: "C17", desc: "Bug fixes and clarifications to C11 standard" },
          { id: "c-std-c23", name: "C23", desc: "Added constexpr, nullptr, typeof, auto type inference, and #embed" },
        ],
      },
    ],
  },
};

const CPP_NODE_TREE_BRANCHES: Record<string, NodeTreeBranches> = {
  "1. Introduction to Language": {
    description: "Overview of C++ language capabilities, systems performance engineering, and historical evolution.",
    groups: [
      {
        topics: [
          { id: "cpp-what", name: "What is C++?", desc: "General-purpose compiled systems programming language" },
          { id: "cpp-why", name: "Why use C++", desc: "Zero-cost abstractions, deterministic destruction & high speed" },
          { id: "cpp-vs-c", name: "C vs C++", desc: "Procedural vs Object-Oriented, templates, reference types & STL" },
        ],
      },
    ],
  },
  "2. Setting up your Environment": {
    description: "Installing C++ toolchains, configuring modern IDEs, and compiling your first C++ program.",
    groups: [
      {
        topics: [
          { id: "cpp-inst", name: "Installing C++", desc: "Installing GCC, Clang++, or MSVC toolchains" },
          { id: "cpp-editors", name: "Code Editors / IDEs", desc: "VS Code, CLion, Visual Studio, Vim / Neovim" },
          { id: "cpp-first", name: "Running your First Program", desc: "g++ main.cpp -o main && ./main execution" },
        ],
      },
    ],
  },
  "3. Basic Operations": {
    description: "Arithmetic operators, boolean logical evaluation, and low-level bitwise operations.",
    groups: [
      {
        topics: [
          { id: "cpp-op-arith", name: "Arithmetic Operators", desc: "+, -, *, /, %, ++, --" },
          { id: "cpp-op-logic", name: "Logical Operators", desc: "&&, ||, !" },
          { id: "cpp-op-bitwise", name: "Bitwise Operators", desc: "&, |, ^, ~, <<, >>" },
        ],
      },
    ],
  },
  "4. Control Flow & Statements": {
    description: "Conditional execution, switch-case branching, jump statements, and looping constructs.",
    groups: [
      {
        topics: [
          { id: "cpp-ctrl-branch", name: "if else / switch / goto", desc: "Branching conditions, switch-case fallthrough, and goto labels" },
          { id: "cpp-ctrl-loops", name: "for / while / do while loops", desc: "Range-based for loops, while iteration, and do-while loops" },
        ],
      },
    ],
  },
  "5. Functions": {
    description: "Function overloading, operator overloading, anonymous lambda functions, and static polymorphism.",
    groups: [
      {
        topics: [
          { id: "cpp-fn-overload", name: "Function Overloading", desc: "Multiple functions sharing name with different signatures" },
          { id: "cpp-op-overload", name: "Operator Overloading", desc: "Custom behavior for +, -, <<, >>, [], (), -> operators" },
          { id: "cpp-lambdas", name: "Lambdas", desc: "Anonymous closures [captures](params) { body }" },
          { id: "cpp-static-poly", name: "Static Polymorphism", desc: "Compile-time polymorphism via templates & function overloading" },
        ],
      },
    ],
  },
  "6. Data Types": {
    description: "Type systems in C++, static vs dynamic typing, and runtime type information.",
    groups: [
      {
        topics: [
          { id: "cpp-type-static", name: "Static Typing", desc: "Compile-time type checking and safety" },
          { id: "cpp-type-dynamic", name: "Dynamic Typing", desc: "Runtime polymorphism and type resolution" },
          { id: "cpp-rtti", name: "RTTI", desc: "Run-Time Type Information via typeid and dynamic_cast" },
        ],
      },
    ],
  },
  "7. Pointers and References": {
    description: "Reference semantics, object lifetimes, memory layout, raw pointers, and modern smart pointers.",
    groups: [
      {
        groupName: "References & Lifetime",
        topics: [
          { id: "cpp-refs", name: "References", desc: "Lvalue (&) and Rvalue (&&) reference bindings" },
          { id: "cpp-mem-model", name: "Memory Model", desc: "Stack, Heap, and Static storage duration" },
          { id: "cpp-obj-life", name: "Lifetime of Objects", desc: "Construction, destruction order, and RAII duration" },
        ],
      },
      {
        groupName: "Smart Pointers",
        topics: [
          { id: "cpp-smart-unique", name: "unique_ptr", desc: "Single-ownership smart pointer with zero overhead" },
          { id: "cpp-smart-shared", name: "shared_ptr", desc: "Ref-counted shared-ownership smart pointer" },
          { id: "cpp-smart-weak", name: "weak_ptr", desc: "Non-owning observer pointer to prevent circular reference cycles" },
        ],
      },
      {
        groupName: "Other Pointer Concepts",
        topics: [
          { id: "cpp-raw-ptrs", name: "Raw Pointers", desc: "T* raw memory addresses and pointer arithmetic" },
          { id: "cpp-new-delete", name: "New/Delete Operators", desc: "Manual heap allocation and deallocation" },
          { id: "cpp-mem-leak", name: "Memory Leakage", desc: "Detecting and preventing unfreed heap memory" },
        ],
      },
    ],
  },
  "8. Structuring Codebase": {
    description: "Header files, forward declarations, namespace isolation, and identifier scoping rules.",
    groups: [
      {
        topics: [
          { id: "cpp-fwd-dec", name: "Forward Declaration", desc: "Declaring types before full definition to speed up builds" },
          { id: "cpp-headers", name: "Headers / CPP Files", desc: "Separating interfaces (.hpp/.h) from implementation (.cpp)" },
          { id: "cpp-namespaces", name: "Namespaces", desc: "Preventing symbol name collisions via namespace blocks" },
          { id: "cpp-scope", name: "Scope", desc: "Block, class, namespace, and global variable scope" },
        ],
      },
    ],
  },
  "9. Structures and Classes": {
    description: "Object-oriented C++, virtual methods, vtables, inheritance, and the Rule of Zero/Three/Five.",
    groups: [
      {
        topics: [
          { id: "cpp-oop", name: "Object Oriented Programming", desc: "Encapsulation, inheritance, and polymorphism" },
          { id: "cpp-vmethods", name: "Virtual Methods", desc: "Virtual functions for dynamic dispatch" },
          { id: "cpp-vtables", name: "Virtual Tables", desc: "VTable function pointer tables for virtual method lookups" },
          { id: "cpp-dyn-poly", name: "Dynamic Polymorphism", desc: "Runtime method resolution via base class pointers" },
          { id: "cpp-inherit", name: "Inheritance", desc: "Public, protected, and private inheritance modes" },
          { id: "cpp-mult-inherit", name: "Multiple Inheritance", desc: "Deriving classes from multiple base classes" },
          { id: "cpp-diamond", name: "Diamond Inheritance", desc: "Virtual base classes to solve duplicate base instances" },
          { id: "cpp-rule-035", name: "Rule of Zero, Five, Three", desc: "Destructor, copy/move constructors, and copy/move assignment rules" },
        ],
      },
    ],
  },
  "10. Templates": {
    description: "Generic programming, variadic templates, template specialization, type traits, and SFINAE.",
    groups: [
      {
        topics: [
          { id: "cpp-var-temp", name: "Variadic Templates", desc: "Template parameter packs for variable argument types" },
          { id: "cpp-temp-spec", name: "Template Specialization", desc: "Full & Partial specialization for specific types" },
          { id: "cpp-type-traits", name: "Type Traits", desc: "<type_traits> compile-time type inspection" },
          { id: "cpp-sfinae", name: "SFINAE", desc: "Substitution Failure Is Not An Error for template constraints" },
        ],
      },
    ],
  },
  "11. Language Concepts": {
    description: "Type inference with auto, type casting mechanisms, undefined behavior, ADL, and macros.",
    groups: [
      {
        groupName: "Type Inference & Casting",
        topics: [
          { id: "cpp-auto", name: "auto (Automatic Type Deduction)", desc: "Automatic variable type deduction at compile-time" },
          { id: "cpp-cast-static", name: "static_cast", desc: "Compile-time explicit type conversion" },
          { id: "cpp-cast-const", name: "const_cast", desc: "Adding or removing const qualifiers" },
          { id: "cpp-cast-dyn", name: "dynamic_cast", desc: "Safe downcasting in class hierarchies using RTTI" },
          { id: "cpp-cast-reinterp", name: "reinterpret_cast", desc: "Low-level bit reinterpretation between unrelated types" },
        ],
      },
      {
        groupName: "Language Utilities & Gotchas",
        topics: [
          { id: "cpp-ub", name: "Undefined Behavior (UB)", desc: "Operations with unspecified semantics by C++ standard" },
          { id: "cpp-adl", name: "Argument Dependent Lookup (ADL)", desc: "Koenig lookup for finding function names in argument namespaces" },
          { id: "cpp-mangling", name: "Name Mangling", desc: "Compiler symbol decoration for function overloading" },
          { id: "cpp-macros", name: "Macros", desc: "#define preprocessor macro expansions" },
        ],
      },
    ],
  },
  "12. Exception Handling": {
    description: "Exception throwing, try-catch blocks, exit codes, and access violation signals.",
    groups: [
      {
        topics: [
          { id: "cpp-exit-codes", name: "Exit Codes", desc: "EXIT_SUCCESS, EXIT_FAILURE, and std::exit()" },
          { id: "cpp-exceptions", name: "Exceptions", desc: "try, catch, throw, and std::exception hierarchy" },
          { id: "cpp-access-viol", name: "Access Violations", desc: "Segmentation faults and invalid pointer accesses" },
        ],
      },
    ],
  },
  "13. Standard Library + STL": {
    description: "C++ Standard Template Library (STL) containers, iterators, algorithms, and concurrency.",
    groups: [
      {
        topics: [
          { id: "cpp-iterators", name: "Iterators", desc: "Random access, bidirectional, forward, and input/output iterators" },
          { id: "cpp-iostream", name: "iostream", desc: "std::cin, std::cout, std::cerr, and stream formatting" },
          { id: "cpp-algorithms", name: "Algorithms", desc: "std::sort, std::find, std::transform, std::reduce" },
          { id: "cpp-date-time", name: "Date / Time", desc: "<chrono> high-resolution clocks and timestamps" },
          { id: "cpp-multithread", name: "Multithreading", desc: "std::thread, std::mutex, std::async, std::future" },
          { id: "cpp-containers", name: "Containers", desc: "std::vector, std::map, std::unordered_map, std::deque, std::set" },
        ],
      },
    ],
  },
  "14. Debuggers": {
    description: "Interactive debuggers, inspecting call stacks, breakpoints, and symbol tables.",
    groups: [
      {
        topics: [
          { id: "cpp-dbg-msgs", name: "Understanding Debugger Messages", desc: "Interpreting call stacks and crash reports" },
          { id: "cpp-dbg-syms", name: "Debugging Symbols", desc: "PDB files, DWARF symbols, and -g compilation flags" },
          { id: "cpp-dbg-windbg", name: "WinDbg", desc: "Windows native kernel and user mode debugger" },
          { id: "cpp-dbg-gdb", name: "GDB", desc: "GNU Debugger CLI for Linux and Unix" },
        ],
      },
    ],
  },
  "15. Compilers": {
    description: "Compiler translation stages (preprocessing, compilation, assembly, linking) and compiler suites.",
    groups: [
      {
        topics: [
          { id: "cpp-comp-stages", name: "Compiler Stages", desc: "Preprocessor -> Compiler -> Assembler -> Linker" },
          { id: "cpp-clang", name: "Clang++ / LLVM", desc: "LLVM frontend with fast compile times and clear diagnostics" },
          { id: "cpp-intel", name: "Intel C++", desc: "Intel oneAPI DPC++/C++ compiler for high performance" },
          { id: "cpp-msvs", name: "MSVS C++", desc: "Microsoft Visual C++ (MSVC) compiler engine" },
          { id: "cpp-gcc", name: "GCC", desc: "GNU Compiler Collection g++ executable" },
          { id: "cpp-mingw", name: "MinGW", desc: "Minimalist GNU port for Windows" },
        ],
      },
    ],
  },
  "16. Build Systems": {
    description: "Automated build systems and build script generators for C++ projects.",
    groups: [
      {
        topics: [
          { id: "cpp-cmake", name: "CMAKE", desc: "Industry-standard CMakeLists.txt build file generator" },
          { id: "cpp-make", name: "Makefile", desc: "GNU Make build targets and rule dependencies" },
          { id: "cpp-ninja", name: "Ninja", desc: "Small fast build runner designed for CMake output" },
        ],
      },
    ],
  },
  "17. Package Managers": {
    description: "C++ package managers for resolving third-party C++ libraries and dependencies.",
    groups: [
      {
        topics: [
          { id: "cpp-pkg-vcpkg", name: "vcpkg", desc: "Microsoft C/C++ library manager" },
          { id: "cpp-pkg-conan", name: "Conan", desc: "Open-source decentralized C/C++ package manager" },
          { id: "cpp-pkg-nuget", name: "NuGet", desc: "Package manager for Visual Studio" },
          { id: "cpp-pkg-spack", name: "Spack", desc: "Flexible package manager for supercomputing & HPC" },
        ],
      },
    ],
  },
  "18. Working with Libraries": {
    description: "Library inclusion concepts, licensing requirements, and essential C++ open-source libraries.",
    groups: [
      {
        groupName: "Concepts",
        topics: [
          { id: "cpp-lib-inc", name: "Library Inclusion", desc: "Header-only vs compiled static (.a/.lib) & dynamic (.so/.dll) libs" },
          { id: "cpp-lib-lic", name: "Licensing", desc: "MIT, Apache 2.0, GPL, LGPL, and BSD open-source licenses" },
        ],
      },
      {
        groupName: "Libraries",
        topics: [
          { id: "cpp-lib-boost", name: "Boost", desc: "Peer-reviewed portable C++ source libraries" },
          { id: "cpp-lib-opencv", name: "OpenCV", desc: "Computer vision and image processing library" },
          { id: "cpp-lib-poco", name: "POCO", desc: "C++ class libraries for network-centric applications" },
          { id: "cpp-lib-proto", name: "protobuf", desc: "Google Protocol Buffers serialization" },
          { id: "cpp-lib-grpc", name: "gRPC", desc: "High performance remote procedure call framework" },
          { id: "cpp-lib-tf", name: "Tensorflow", desc: "TensorFlow C++ API binding" },
          { id: "cpp-lib-pybind", name: "pybind11", desc: "Seamless C++11 and Python binding generator" },
          { id: "cpp-lib-spdlog", name: "spdlog", desc: "Fast header-only C++ logging library" },
          { id: "cpp-lib-fmt", name: "fmt", desc: "Safe fast string formatting library" },
          { id: "cpp-lib-opencl", name: "opencl", desc: "Heterogeneous parallel computing library" },
          { id: "cpp-lib-ranges", name: "ranges_v3", desc: "Range-based algorithms and lazy evaluation" },
        ],
      },
    ],
  },
  "19. Frameworks": {
    description: "Unit testing, GUI frameworks, performance profiling, and machine learning engines.",
    groups: [
      {
        topics: [
          { id: "cpp-fw-gtest", name: "gtest / gmock", desc: "Google Test unit testing and mocking framework" },
          { id: "cpp-fw-qt", name: "Qt", desc: "Cross-platform GUI widget toolkit & application framework" },
          { id: "cpp-fw-catch2", name: "Catch2", desc: "Modern header-only test framework for C++" },
          { id: "cpp-fw-orbit", name: "Orbit Profiler", desc: "Native C/C++ performance profiler" },
          { id: "cpp-fw-pytorch", name: "PyTorch C++", desc: "LibTorch C++ frontend for PyTorch" },
        ],
      },
    ],
  },
  "20. Idioms": {
    description: "Modern C++ design patterns, RAII memory management, Pimpl encapsulation, and CRTP.",
    groups: [
      {
        topics: [
          { id: "cpp-id-noncopy", name: "Non-Copyable / Non-Moveable", desc: "Deleting copy/move constructors (= delete)" },
          { id: "cpp-id-erase", name: "Erase-Remove", desc: "std::erase + std::remove pattern for containers" },
          { id: "cpp-id-swap", name: "Copy and Swap", desc: "Exception-safe assignment operator idiom" },
          { id: "cpp-id-cow", name: "Copy on Write", desc: "Sharing storage until mutation occurs" },
          { id: "cpp-id-raii", name: "RAII", desc: "Resource Acquisition Is Initialization resource management" },
          { id: "cpp-id-pimpl", name: "Pimpl", desc: "Pointer to Implementation interface insulation" },
          { id: "cpp-id-crtp", name: "CRTP", desc: "Curiously Recurring Template Pattern for static polymorphism" },
        ],
      },
    ],
  },
  "21. Standards": {
    description: "Evolution of ISO C++ standards from C++11 modern features through C++20 and C++23.",
    groups: [
      {
        topics: [
          { id: "cpp-std-1114", name: "C++ 11 / 14", desc: "Auto, lambdas, smart pointers, move semantics, constexpr" },
          { id: "cpp-std-17", name: "C++ 17", desc: "Structured bindings, std::optional, std::variant, if constexpr" },
          { id: "cpp-std-20", name: "C++ 20", desc: "Concepts, Coroutines, Modules, Ranges" },
          { id: "cpp-std-23", name: "Newest (C++ 23)", desc: "std::expected, multidimensional subscript, print" },
          { id: "cpp-std-0x", name: "C++ 0x", desc: "Early draft specification before C++11 standardization" },
        ],
      },
    ],
  },
};

const PYTHON_NODE_TREE_BRANCHES: Record<string, NodeTreeBranches> = {
  "1. Learn the Basics": {
    description: "Fundamental Python syntax, variables, data types, control flow, functions, and built-in data structures.",
    groups: [
      {
        topics: [
          { id: "py-syntax", name: "Basic Syntax", desc: "Python indentation, statements, and print output" },
          { id: "py-vars", name: "Variables and Data Types", desc: "Dynamic typing, int, float, str, bool, and None" },
          { id: "py-cond", name: "Conditionals", desc: "if, elif, and else branching logic" },
          { id: "py-loops", name: "Loops", desc: "for and while loops with break/continue/else" },
          { id: "py-casting", name: "Type Casting", desc: "int(), str(), float(), list(), dict() type conversions" },
          { id: "py-exceptions", name: "Exceptions", desc: "try, except, else, finally, and custom exceptions" },
          { id: "py-fns", name: "Functions, Builtin Functions", desc: "def, return, len(), range(), enumerate(), zip()" },
          { id: "py-lists", name: "Lists", desc: "Mutable ordered sequences, indexing, and slicing" },
          { id: "py-tuples", name: "Tuples", desc: "Immutable ordered sequences and tuple unpacking" },
          { id: "py-sets", name: "Sets", desc: "Unordered collections of unique elements & set operations" },
          { id: "py-dicts", name: "Dictionaries", desc: "Key-value hash maps, dict methods, and comprehensions" },
        ],
      },
    ],
  },
  "2. Data Structures & Algorithms": {
    description: "Computer science algorithms, data structures, recursion, and search routines implemented in Python.",
    groups: [
      {
        topics: [
          { id: "py-dsa-arr-ll", name: "Arrays and Linked Lists", desc: "Dynamic array lists and linked list node traversal" },
          { id: "py-dsa-hashtab", name: "Hash Tables", desc: "Python dict hashing, key collisions, and lookup cost" },
          { id: "py-dsa-heaps", name: "Heaps, Stacks and Queues", desc: "heapq module, list stacks, and collections.deque" },
          { id: "py-dsa-bst", name: "Binary Search Tree", desc: "BST nodes, insertion, deletion, and tree traversals" },
          { id: "py-dsa-recur", name: "Recursion", desc: "Base cases, call stack, and tail recursion memoization" },
          { id: "py-dsa-sort", name: "Sorting Algorithms", desc: "Timsort (sorted()), QuickSort, MergeSort implementation" },
        ],
      },
    ],
  },
  "3. Modules": {
    description: "Importing built-in standard library modules and creating custom modular packages.",
    groups: [
      {
        topics: [
          { id: "py-mod-builtin", name: "Builtin Modules", desc: "sys, os, math, random, datetime, json" },
          { id: "py-mod-custom", name: "Custom Modules", desc: "Creating __init__.py, relative imports, and module namespaces" },
        ],
      },
    ],
  },
  "4. Lambdas": {
    description: "Anonymous single-expression inline lambda functions and functional programming primitives.",
    groups: [
      {
        topics: [
          { id: "py-lambda-basic", name: "Anonymous Lambda Functions", desc: "lambda arguments: expression syntax" },
          { id: "py-lambda-functional", name: "Map, Filter & Reduce with Lambdas", desc: "Functional map(), filter(), and functools.reduce()" },
        ],
      },
    ],
  },
  "5. Decorators": {
    description: "Function decorators, class decorators, arguments in decorators, and meta-programming wrappers.",
    groups: [
      {
        topics: [
          { id: "py-dec-fn", name: "Function Decorators", desc: "@decorator syntax wrapping function execution" },
          { id: "py-dec-cls", name: "Class Decorators", desc: "Class-level decorators modifying class behavior" },
          { id: "py-dec-wraps", name: "functools.wraps", desc: "Preserving docstrings and function metadata" },
        ],
      },
    ],
  },
  "6. Iterators": {
    description: "Custom iteration protocols, iterables, and manual state progression.",
    groups: [
      {
        topics: [
          { id: "py-iter-proto", name: "__iter__ and __next__ protocols", desc: "Implementing custom iterator classes with StopIteration" },
          { id: "py-iter-builtins", name: "iter() and next() builtins", desc: "Manual traversal of iterable sequences" },
        ],
      },
    ],
  },
  "7. Regular Expressions": {
    description: "Pattern matching, character classes, string substitution, and capture groups with the re module.",
    groups: [
      {
        topics: [
          { id: "py-re-mod", name: "re module", desc: "Python standard library regular expression module" },
          { id: "py-re-pats", name: "Regex Patterns & Captures", desc: "Wildcards, quantifiers, anchors, and named groups" },
          { id: "py-re-search", name: "re.search, re.match & re.findall", desc: "Searching, matching, and extracting regex matches" },
        ],
      },
    ],
  },
  "8. Object Oriented Programming": {
    description: "Classes, objects, inheritance, polymorphism, and dunder (double underscore) magic methods.",
    groups: [
      {
        topics: [
          { id: "py-oop-classes", name: "Classes", desc: "class definitions, __init__ constructors, and self reference" },
          { id: "py-oop-inherit", name: "Inheritance", desc: "Single, multiple inheritance, and super() calls" },
          { id: "py-oop-dunder", name: "Methods, Dunder", desc: "__str__, __repr__, __len__, __getitem__, __call__ magic methods" },
        ],
      },
    ],
  },
  "9. Package Managers": {
    description: "Python Package Index (PyPI) and modern dependency management tools.",
    groups: [
      {
        topics: [
          { id: "py-pkg-pypi", name: "PyPI", desc: "Python Package Index global library repository" },
          { id: "py-pkg-pip", name: "Pip", desc: "Standard package installer for Python" },
          { id: "py-pkg-conda", name: "Conda", desc: "Cross-platform data science package manager" },
          { id: "py-pkg-uv", name: "uv", desc: "Extremely fast Rust-based Python package manager" },
          { id: "py-pkg-poetry", name: "Poetry", desc: "Dependency management and packaging tool" },
        ],
      },
    ],
  },
  "10. Common Packages": {
    description: "Standard project configuration files and build specifications.",
    groups: [
      {
        topics: [
          { id: "py-cfg-pyproject", name: "pyproject.toml", desc: "PEP 518 unified Python project configuration specification" },
          { id: "py-cfg-config", name: "Configuration", desc: "setup.cfg, requirements.txt, and environment config management" },
        ],
      },
    ],
  },
  "11. List Comprehensions": {
    description: "Concise syntax for creating lists from existing iterables with conditional filtering.",
    groups: [
      {
        topics: [
          { id: "py-lc-syntax", name: "List Comprehension Syntax", desc: "[expression for item in iterable] inline syntax" },
          { id: "py-lc-filter", name: "Filtering & Nested List Comprehensions", desc: "Adding if conditions and multi-level nested loops" },
        ],
      },
    ],
  },
  "12. Generator Expressions": {
    description: "Memory-efficient lazy evaluation streaming with generator functions and expressions.",
    groups: [
      {
        topics: [
          { id: "py-gen-yield", name: "yield Statement", desc: "Creating generator functions that yield values on demand" },
          { id: "py-gen-expr", name: "Generator Expressions & Lazy Evaluation", desc: "(expression for item in iterable) generator syntax" },
        ],
      },
    ],
  },
  "13. Paradigms": {
    description: "Python multi-paradigm support across procedural, object-oriented, and functional styles.",
    groups: [
      {
        topics: [
          { id: "py-par-proc", name: "Imperative & Procedural", desc: "Sequential code execution with statements and functions" },
          { id: "py-par-oop", name: "Object-Oriented", desc: "Encapsulating state and behavior within classes" },
          { id: "py-par-func", name: "Functional Programming", desc: "Pure functions, immutability, and higher-order functions" },
        ],
      },
    ],
  },
  "14. Context Manager": {
    description: "Deterministic resource setup and teardown management using with statements.",
    groups: [
      {
        topics: [
          { id: "py-ctx-with", name: "with Statement", desc: "Automated file closing and lock acquisition" },
          { id: "py-ctx-dunder", name: "__enter__ and __exit__", desc: "Implementing custom context manager class protocols" },
          { id: "py-ctx-lib", name: "contextlib.contextmanager", desc: "Creating generator-based context managers with @contextmanager" },
        ],
      },
    ],
  },
  "15. Learn a Framework": {
    description: "Web development frameworks in Python across synchronous, asynchronous, and hybrid models.",
    groups: [
      {
        groupName: "Synchronous",
        topics: [
          { id: "py-fw-dash", name: "Plotly Dash", desc: "Analytical web application framework for data science" },
          { id: "py-fw-pyramid", name: "Pyramid", desc: "Flexible web framework for large applications" },
        ],
      },
      {
        groupName: "Asynchronous",
        topics: [
          { id: "py-fw-gevent", name: "gevent", desc: "Coroutine-based Python networking library using greenlets" },
          { id: "py-fw-aiohttp", name: "aiohttp", desc: "Asynchronous HTTP client/server for asyncio" },
          { id: "py-fw-tornado", name: "Tornado", desc: "Non-blocking web server and web framework" },
          { id: "py-fw-sanic", name: "Sanic", desc: "Async Python 3.8+ web server built for speed" },
        ],
      },
      {
        groupName: "Synchronous + Asynchronous",
        topics: [
          { id: "py-fw-fastapi", name: "Fast API", isRecommended: true, desc: "High performance async web framework with automatic OpenAPI docs" },
          { id: "py-fw-django", name: "Django", isRecommended: true, desc: "Batteries-included web framework with ORM, Auth & Admin" },
          { id: "py-fw-flask", name: "Flask", isRecommended: true, desc: "Lightweight WSGI microframework" },
        ],
      },
    ],
  },
  "16. Concurrency": {
    description: "Multiprocessing, thread management, asynchronous IO, and the Global Interpreter Lock (GIL).",
    groups: [
      {
        topics: [
          { id: "py-conc-mp", name: "Multiprocessing", desc: "Process-based parallelism bypassing GIL with separate memory" },
          { id: "py-conc-async", name: "Asynchrony", desc: "Single-threaded event loops with asyncio, async & await" },
          { id: "py-conc-gil", name: "GIL", desc: "Global Interpreter Lock mechanics in CPython" },
          { id: "py-conc-threading", name: "Threading", desc: "Thread-based parallelism for I/O bound tasks" },
        ],
      },
    ],
  },
  "17. Environments": {
    description: "Virtual environment creation and Python version management tools.",
    groups: [
      {
        topics: [
          { id: "py-env-pipenv", name: "Pipenv", desc: "Harnessing Pipfile and Pipfile.lock for dependencies" },
          { id: "py-env-venv", name: "virtualenv", desc: "Creating isolated Python environment folders" },
          { id: "py-env-pyenv", name: "pyenv", desc: "Switching between multiple installed Python interpreter versions" },
        ],
      },
    ],
  },
  "18. Static Typing": {
    description: "Type hint annotations, static type checkers, and Pydantic data validation.",
    groups: [
      {
        topics: [
          { id: "py-type-typing", name: "typing", desc: "Standard library type hint annotations (List, Dict, Union, Optional)" },
          { id: "py-type-mypy", name: "mypy", desc: "Static type checker for Python" },
          { id: "py-type-pyright", name: "pyright", desc: "Fast static type checker by Microsoft" },
          { id: "py-type-pyre", name: "pyre", desc: "Performant type checker by Meta" },
          { id: "py-type-pydantic", name: "Pydantic", desc: "Data validation and settings management using type annotations" },
        ],
      },
    ],
  },
  "19. Code Formatting": {
    description: "Automated code formatting, style enforcement, and fast linting.",
    groups: [
      {
        topics: [
          { id: "py-fmt-yapf", name: "yapf", desc: "Yet Another Python Formatter by Google" },
          { id: "py-fmt-black", name: "black", desc: "The uncompromising Python code formatter" },
          { id: "py-fmt-ruff", name: "ruff", desc: "Extremely fast Rust-based Python linter and formatter" },
        ],
      },
    ],
  },
  "20. Documentation": {
    description: "Documentation generators, Sphinx, docstrings, and autodoc integration.",
    groups: [
      {
        topics: [
          { id: "py-doc-sphinx", name: "Sphinx", desc: "Python documentation generator producing HTML and PDF docs" },
        ],
      },
    ],
  },
  "21. Testing": {
    description: "Unit testing, integration testing, doctests, and test matrix automation.",
    groups: [
      {
        topics: [
          { id: "py-test-tox", name: "tox", desc: "Automated test environment matrix runner" },
          { id: "py-test-nose", name: "nose", desc: "Test runner extending unittest" },
          { id: "py-test-unittest", name: "unittest / pyUnit", desc: "Python standard library unit testing framework" },
          { id: "py-test-doctest", name: "doctest", desc: "Testing code snippets embedded inside docstrings" },
          { id: "py-test-pytest", name: "pytest", desc: "Feature-rich test framework with fixture support" },
        ],
      },
    ],
  },
};

function getRightBranchesForNode(nodeName: string): NodeTreeBranches {
  if (C_NODE_TREE_BRANCHES[nodeName]) {
    return C_NODE_TREE_BRANCHES[nodeName];
  }
  const strippedCNum = nodeName.replace(/^\d+\.\s*/, "").trim();
  if (C_NODE_TREE_BRANCHES[strippedCNum]) {
    return C_NODE_TREE_BRANCHES[strippedCNum];
  }
  for (const [key, value] of Object.entries(C_NODE_TREE_BRANCHES)) {
    const cleanKey = key.replace(/^\d+\.\s*/, "").toLowerCase();
    const cleanNode = nodeName.replace(/^\d+\.\s*/, "").toLowerCase();
    if (cleanKey === cleanNode || cleanKey.includes(cleanNode) || cleanNode.includes(cleanKey)) {
      return value;
    }
  }

  if (CPP_NODE_TREE_BRANCHES[nodeName]) {
    return CPP_NODE_TREE_BRANCHES[nodeName];
  }
  if (CPP_NODE_TREE_BRANCHES[strippedCNum]) {
    return CPP_NODE_TREE_BRANCHES[strippedCNum];
  }
  for (const [key, value] of Object.entries(CPP_NODE_TREE_BRANCHES)) {
    const cleanKey = key.replace(/^\d+\.\s*/, "").toLowerCase();
    const cleanNode = nodeName.replace(/^\d+\.\s*/, "").toLowerCase();
    if (cleanKey === cleanNode || cleanKey.includes(cleanNode) || cleanNode.includes(cleanKey)) {
      return value;
    }
  }

  if (PYTHON_NODE_TREE_BRANCHES[nodeName]) {
    return PYTHON_NODE_TREE_BRANCHES[nodeName];
  }
  if (PYTHON_NODE_TREE_BRANCHES[strippedCNum]) {
    return PYTHON_NODE_TREE_BRANCHES[strippedCNum];
  }
  for (const [key, value] of Object.entries(PYTHON_NODE_TREE_BRANCHES)) {
    const cleanKey = key.replace(/^\d+\.\s*/, "").toLowerCase();
    const cleanNode = nodeName.replace(/^\d+\.\s*/, "").toLowerCase();
    if (cleanKey === cleanNode || cleanKey.includes(cleanNode) || cleanNode.includes(cleanKey)) {
      return value;
    }
  }

  if (DEVOPS_NODE_TREE_BRANCHES[nodeName]) {
    return DEVOPS_NODE_TREE_BRANCHES[nodeName];
  }

  const strippedNumber = nodeName.replace(/^\d+\.\s*/, "").trim();
  if (DEVOPS_NODE_TREE_BRANCHES[strippedNumber]) {
    return DEVOPS_NODE_TREE_BRANCHES[strippedNumber];
  }

  for (const [key, value] of Object.entries(DEVOPS_NODE_TREE_BRANCHES)) {
    const cleanKey = key.replace(/^\d+\.\s*/, "").toLowerCase();
    const cleanNode = nodeName.replace(/^\d+\.\s*/, "").toLowerCase();
    if (cleanKey === cleanNode || cleanKey.includes(cleanNode) || cleanNode.includes(cleanKey)) {
      return value;
    }
  }

  const clean = nodeName.replace(/\([^)]*\)/g, "").replace(/^\d+\.\s*/, "").trim();
  return {
    description: `Core topics, toolchains, and hands-on modules for ${clean}.`,
    groups: [
      {
        topics: [
          { id: `${clean}-1`, name: `${clean} Fundamentals`, isRecommended: true },
          { id: `${clean}-2`, name: `${clean} Production Workflows`, isRecommended: true },
          { id: `${clean}-3`, name: `${clean} Advanced Patterns`, isAlternative: true },
        ],
      },
    ],
  };
}

function RoadmapDetailView({
  selectedRoadmap,
  onBack,
  toggleNode,
  isNodeDone,
}: {
  selectedRoadmap: PresetRoadmap;
  onBack: () => void;
  toggleNode: (roadmapKey: string, nodeName: string) => void;
  isNodeDone: (roadmapKey: string, nodeName: string, defaultDone?: boolean) => boolean;
}) {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const userId = session?.user_id;

  const [expandedNodeName, setExpandedNodeName] = useState<string | null>(null);
  const [completedSubtopics, setCompletedSubtopics] = useState<Record<string, boolean>>({});
  const [selectedSubtopic, setSelectedSubtopic] = useState<SubtopicDetailInfo | null>(null);

  const isCareerRoadmap = selectedRoadmap.category === "career";

  const toggleSubtopic = (subtopicId: string, nodeName: string) => {
    const isCurrentlyDone = !!completedSubtopics[subtopicId];
    const updatedSubtopics = { ...completedSubtopics, [subtopicId]: !isCurrentlyDone };
    setCompletedSubtopics(updatedSubtopics);

    const branchData = getRightBranchesForNode(nodeName);
    const allTopics = branchData.groups.flatMap((g) => g.topics);
    const purpleTopics = isCareerRoadmap ? allTopics.filter((t) => t.isRecommended) : [];
    const requiredTopics = purpleTopics.length > 0 ? purpleTopics : allTopics;
    const areRequiredDone = requiredTopics.length > 0 && requiredTopics.every((t) => updatedSubtopics[t.id]);
    const parentDone = isNodeDone(selectedRoadmap.title, nodeName, false);

    if (areRequiredDone && !parentDone) {
      toggleNode(selectedRoadmap.title, nodeName);
    } else if (!areRequiredDone && parentDone) {
      toggleNode(selectedRoadmap.title, nodeName);
    }
  };

  const [isEnrolled, setIsEnrolled] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("skillscatalyst_enrolled_roadmaps");
        if (raw) {
          const list = JSON.parse(raw);
          return list.some(
            (item: any) =>
              item.id === selectedRoadmap.id ||
              item.title === (selectedRoadmap.displayTitle || selectedRoadmap.title)
          );
        }
      } catch {}
    }
    return false;
  });

  const handleEnrollClick = async () => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(
          "skillscatalyst_active_roadmap",
          JSON.stringify({
            id: selectedRoadmap.id,
            title: selectedRoadmap.displayTitle || selectedRoadmap.title,
            rawTitle: selectedRoadmap.title,
            timestamp: Date.now(),
          })
        );
        const rawEnrolled = localStorage.getItem("skillscatalyst_enrolled_roadmaps") || "[]";
        const list = JSON.parse(rawEnrolled);
        if (!list.some((item: any) => item.id === selectedRoadmap.id)) {
          list.push({
            id: selectedRoadmap.id,
            title: selectedRoadmap.displayTitle || selectedRoadmap.title,
          });
          localStorage.setItem("skillscatalyst_enrolled_roadmaps", JSON.stringify(list));
        }

        const rawRemoved = localStorage.getItem("skillscatalyst_removed_roadmaps") || "[]";
        const removedList: string[] = JSON.parse(rawRemoved);
        const normId = selectedRoadmap.id.toLowerCase().trim();
        const updatedRemoved = removedList.filter(
          (id) => id !== normId && !normId.includes(id)
        );
        localStorage.setItem(
          "skillscatalyst_removed_roadmaps",
          JSON.stringify(updatedRemoved)
        );
      } catch (e) {
        console.warn("Failed to save active roadmap locally:", e);
      }
    }

    if (userId) {
      try {
        await supabase.from("roadmap_progress").upsert(
          {
            user_id: userId,
            roadmap_id: selectedRoadmap.id,
            node_id: "_roadmap_started",
            node_title: selectedRoadmap.displayTitle || selectedRoadmap.title,
            status: "started",
            completed_at: new Date().toISOString(),
          },
          { onConflict: "user_id,roadmap_id,node_id" }
        );
      } catch (e) {
        console.warn("Failed to mark roadmap started in Supabase:", e);
      }
    }

    setIsEnrolled(true);
    queryClient.invalidateQueries({ queryKey: ["active-roadmap"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  };

  const treeContainerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: treeContainerRef,
    offset: ["start 75%", "end end"],
  });
  const scaleY = useSpring(scrollYProgress, { stiffness: 140, damping: 20 });
  const lightTop = useTransform(scaleY, [0, 1], ["0px", "calc(100% - 12px)"]);

  const allNodes = selectedRoadmap.sections.flatMap((s) => s.nodes);
  const doneCount = allNodes.filter((n) => isNodeDone(selectedRoadmap.title, n, false)).length;
  const progressPct = Math.round((doneCount / allNodes.length) * 100);

  // Calculate current phase for the Growth Widget
  const totalTiers = selectedRoadmap.growthPhases.length;
  const phaseIndex = Math.min(
    Math.floor((doneCount / allNodes.length) * totalTiers),
    totalTiers - 1
  );
  const currentPhase = selectedRoadmap.growthPhases[phaseIndex] || selectedRoadmap.growthPhases[0];

  const growthTitle = `Realistic ${selectedRoadmap.displayTitle.replace(/^\d+\.\s*/, "").replace(" Mastery", "")} Growth`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto space-y-8 pb-16 select-none"
    >
      {/* ── Top Back Button */}
      <div>
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#131b2e] border border-white/[0.08] hover:border-slate-600 text-slate-300 hover:text-white font-medium text-sm transition-all shadow-md group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to All Roadmaps</span>
        </button>
      </div>

      {/* ── Top Hero Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl p-6 md:p-8 border border-white/[0.08] overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(19,27,46,0.95) 0%, rgba(10,15,28,0.98) 100%)",
          boxShadow: "0 10px 40px rgba(0,0,0,0.4)",
        }}
      >
        {/* Ambient glow behind card */}
        <div
          className="absolute -top-24 -right-24 w-80 h-80 rounded-full blur-[100px] pointer-events-none opacity-20"
          style={{ background: selectedRoadmap.color }}
        />

        <div className="flex flex-col lg:flex-row items-start justify-between gap-6 relative z-10">
          {/* Left Hero info */}
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black tracking-widest uppercase">
                ROADMAP
              </span>
              <span className="text-xs font-semibold text-slate-400">Verified Curriculum</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
              {selectedRoadmap.displayTitle}
            </h1>

            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              {selectedRoadmap.subtitle}
            </p>

            {/* Ratings and Certificate Pill */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {selectedRoadmap.ratings}
              </div>
              <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 text-xs font-semibold">
                Certificate Included
              </div>
            </div>
          </div>

          {/* Right Graphic Box */}
          <div className="hidden sm:flex items-center justify-center p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-2xl relative w-full lg:w-72 h-48 shrink-0 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent pointer-events-none" />
            <div className="text-center space-y-3 relative z-10">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-xl shadow-indigo-500/20">
                <selectedRoadmap.icon size={44} className="w-11 h-11" />
              </div>
              <div className="text-xs font-mono font-bold text-slate-300 tracking-wider">
                &lt;F&gt; {selectedRoadmap.id.toUpperCase().slice(0, 8)}
              </div>
              <div className="text-[10px] text-slate-500 font-mono">100% HANDS-ON PRACTICE</div>
            </div>
          </div>
        </div>

        {/* Metrics & Progress Row */}
        <div className="mt-8 pt-6 border-t border-white/[0.08] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6">
          <div className="flex flex-wrap items-center gap-6">
            {/* Progress Wheel */}
            <div className="flex items-center gap-3">
              <div className="relative w-14 h-14 rounded-full bg-slate-800/80 border-2 border-indigo-500/40 flex items-center justify-center text-white font-extrabold text-sm shadow-inner">
                {progressPct}%
              </div>
              <div>
                <div className="text-sm font-bold text-white">Your Progress</div>
                <div className="text-xs text-slate-400">
                  {doneCount} of {allNodes.length} Skills Completed
                </div>
              </div>
            </div>

            {/* Career Mastery Tree Widget */}
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="p-2 rounded-lg bg-emerald-500/15 text-emerald-400">
                <Trees className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Career Mastery Tree</div>
                <div className="text-[11px] text-slate-400">
                  {doneCount} completed • {allNodes.length - doneCount} in progress
                </div>
              </div>
            </div>

            {/* Quick Badges */}
            <div className="hidden xl:flex items-center gap-3 text-xs font-medium text-slate-400">
              <span className="flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded-lg">
                <Flame className="w-3.5 h-3.5 text-orange-400" /> 0 Day Streak
              </span>
              <span className="flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded-lg">
                <Zap className="w-3.5 h-3.5 text-amber-400" /> {doneCount * 50} XP
              </span>
              <span className="flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded-lg">
                <Book className="w-3.5 h-3.5 text-cyan-400" /> {allNodes.length} Lessons
              </span>
              <span className="flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded-lg">
                <Trophy className="w-3.5 h-3.5 text-purple-400" /> {phaseIndex} Badges
              </span>
            </div>
          </div>

          {/* Enroll / Enrolled Symbol Button */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleEnrollClick}
            className={`px-6 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shrink-0 transition-all ${
              isEnrolled
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-emerald-500/10 hover:bg-emerald-500/30"
                : "text-white shadow-indigo-500/25"
            }`}
            style={
              isEnrolled
                ? {}
                : { background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)" }
            }
          >
            {isEnrolled ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Enrolled</span>
              </>
            ) : (
              <>
                <GraduationCap className="w-4 h-4 text-indigo-100" />
                <span>Enroll in Track</span>
              </>
            )}
          </motion.button>
        </div>

        {/* Market Demand & Salary Row — Hidden for Skill Roadmaps */}
        {selectedRoadmap.category !== "skill" && (
          <div className="mt-6 pt-4 border-t border-white/[0.05] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-slate-300">5-Year Market Demand (2021–2026):</span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30">
                {selectedRoadmap.growth}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-400 font-bold border border-blue-500/30">
                {selectedRoadmap.roles}
              </span>
            </div>

            <div>
              Average Salary: <span className="font-bold text-white text-sm ml-1">{selectedRoadmap.salary}</span>
            </div>
          </div>
        )}
      </motion.div>

      {/* ── Timeline Tree + Realistic Growth Widget Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Columns: Timeline Tree */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl md:text-2xl font-extrabold text-white">
                {selectedRoadmap.displayTitle} Timeline Tree
              </h2>
              <p className="text-xs md:text-sm text-slate-400 mt-0.5">
                {selectedRoadmap.timelineSubtitle}
              </p>
            </div>

            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              Interactive Learning Path
            </span>
          </div>

          {/* Vertical Tree Container with Scroll-Animated Laser Light */}
          <div ref={treeContainerRef} className="relative pl-7 space-y-10">
            {/* Background dim track line - centered at 13px */}
            <div className="absolute left-[12px] top-[18px] bottom-[18px] w-0.5 bg-slate-800/90 rounded-full pointer-events-none" />

            {/* Illuminated Laser beam scaling down as you scroll - centered at 13px */}
            <motion.div
              className="absolute left-[11px] top-[18px] bottom-[18px] w-1 rounded-full origin-top pointer-events-none z-10"
              style={{
                scaleY,
                background: "linear-gradient(180deg, #38bdf8 0%, #818cf8 50%, #c084fc 100%)",
                boxShadow: "0 0 14px #38bdf8, 0 0 28px #818cf8",
              }}
            />

            {/* Travelling Light Orb following scroll down the tree - centered at 13px */}
            <motion.div
              className="absolute left-[7px] w-3 h-3 rounded-full bg-cyan-300 z-20 pointer-events-none"
              style={{
                top: lightTop,
                boxShadow: "0 0 16px 5px #38bdf8, 0 0 32px 10px #818cf8",
              }}
            />

            {selectedRoadmap.sections.map((section, sIdx) => {
              const sectionDoneCount = section.nodes.filter((n) =>
                isNodeDone(selectedRoadmap.title, n, false)
              ).length;
              const isSectionComplete = sectionDoneCount === section.nodes.length;

              return (
                <motion.div
                  key={sIdx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: sIdx * 0.08, duration: 0.4 }}
                  className="relative space-y-4"
                >
                  {/* Glowing Node Dot - centered at 13px */}
                  <div
                    className={`absolute -left-[27px] top-1.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all z-20 ${
                      isSectionComplete
                        ? "bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-500/50"
                        : "bg-[#0b0f19] border-indigo-400 text-indigo-400 shadow-md ring-4 ring-indigo-500/20"
                    }`}
                  >
                    {isSectionComplete ? (
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-indigo-400" />
                    )}
                  </div>

                  {/* Section Header */}
                  <div>
                    <h3 className="text-lg md:text-xl font-extrabold text-white flex items-center gap-2">
                      <span>{section.title}</span>
                      {isSectionComplete && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          COMPLETED
                        </span>
                      )}
                    </h3>
                    <p className="text-xs md:text-sm text-slate-400 mt-1 leading-relaxed">
                      {section.subtitle}
                    </p>
                  </div>

                  {/* Nodes Grid Pills with Right-Side Tree Roots Branching Flowchart */}
                  <div className="space-y-4 pt-1">
                    {section.nodes.map((nodeName, nIdx) => {
                      const done = isNodeDone(selectedRoadmap.title, nodeName, false);
                      const isExpanded = expandedNodeName === nodeName;
                      const branchData = getRightBranchesForNode(nodeName);

                      return (
                        <div key={nIdx} className="w-full relative">
                          <div className="flex flex-col lg:flex-row items-stretch lg:items-start gap-4">
                            {/* Parent Node Button */}
                            <motion.button
                              whileHover={{ scale: 1.01 }}
                              whileTap={{ scale: 0.99 }}
                              onClick={() =>
                                setExpandedNodeName(isExpanded ? null : nodeName)
                              }
                              className={`relative flex items-center justify-between gap-3 px-4.5 py-3.5 rounded-2xl text-xs font-bold transition-all duration-200 shadow-md cursor-pointer border overflow-hidden shrink-0 lg:w-96 ${
                                isExpanded
                                  ? "bg-[#141d33] border-cyan-400 text-white ring-2 ring-cyan-500/40 shadow-[0_0_25px_rgba(56,189,248,0.25)]"
                                  : done
                                  ? "bg-indigo-600/20 border-indigo-500 text-white shadow-indigo-500/10 hover:border-indigo-400"
                                  : "bg-[#131b2e]/90 border-slate-800 hover:border-slate-600 text-slate-300 hover:text-white"
                              }`}
                            >
                              {/* Left accent bar */}
                              <div
                                className={`absolute left-0 top-0 bottom-0 w-1.5 transition-all ${
                                  isExpanded
                                    ? "bg-gradient-to-b from-cyan-400 via-indigo-500 to-purple-500 shadow-[0_0_12px_#38bdf8]"
                                    : done
                                    ? "bg-emerald-400"
                                    : "bg-indigo-500/60"
                                }`}
                              />

                              <div className="flex items-center gap-3 pl-1.5">
                                <div
                                  className={`p-1.5 rounded-lg flex items-center justify-center transition-colors ${
                                    done
                                      ? "bg-emerald-500 text-white"
                                      : isExpanded
                                      ? "bg-cyan-400 text-slate-950 font-bold"
                                      : "bg-slate-800 text-slate-400"
                                  }`}
                                >
                                  <Terminal className="w-3.5 h-3.5" />
                                </div>

                                <span className="font-extrabold text-sm tracking-tight text-white">{nodeName}</span>
                              </div>

                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold transition-colors ${
                                    done
                                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                                      : "bg-slate-800/80 text-slate-400 border border-slate-700/60"
                                  }`}
                                >
                                  {done ? "Completed" : "Pending"}
                                </span>

                                <ChevronRight
                                  className={`w-4 h-4 transition-transform ${
                                    isExpanded ? "rotate-90 text-cyan-400" : "text-slate-500"
                                  }`}
                                />
                              </div>

                              {/* Right Connection Pin Dot */}
                              {isExpanded && (
                                <div className="absolute right-1 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_10px_#38bdf8] animate-pulse hidden lg:block" />
                              )}
                            </motion.button>

                            {/* Right-Side Tree Roots Branch Flowchart Container */}
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ opacity: 0, x: -15, scale: 0.98 }}
                                  animate={{ opacity: 1, x: 0, scale: 1 }}
                                  exit={{ opacity: 0, x: -15, scale: 0.98 }}
                                  transition={{ duration: 0.3, ease: "easeOut" }}
                                  className="relative flex-1"
                                >
                                  {/* SVG Connector Curved Roots branching out to the right */}
                                  <div className="hidden lg:block absolute -left-4 top-6 w-4 h-8 pointer-events-none text-cyan-400">
                                    <svg className="w-full h-full" viewBox="0 0 16 32">
                                      <path
                                        d="M 0 16 C 8 16, 8 16, 16 16"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2.5"
                                      />
                                    </svg>
                                  </div>

                                  <div className="p-4 md:p-5 rounded-2xl bg-[#0a0f1d]/95 border-2 border-cyan-500/40 shadow-2xl backdrop-blur-xl space-y-4">
                                    {/* Header Bar */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
                                      <div className="flex items-center gap-2.5">
                                        <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                                          <GitBranch className="w-4 h-4" />
                                        </div>
                                        <div>
                                          <h4 className="text-xs font-black text-cyan-300 tracking-wider uppercase flex items-center gap-2">
                                            <span>Flowchart Tree Roots</span>
                                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 font-mono">
                                              RIGHT BRANCHING
                                            </span>
                                          </h4>
                                          <p className="text-xs text-slate-300 font-medium mt-0.5">
                                            {branchData.description}
                                          </p>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Tree Root Topics branching out to the right */}
                                    <div className="space-y-3">
                                      {branchData.groups.map((group, gIdx) => (
                                        <div key={gIdx} className="space-y-2">
                                          {group.groupName && (
                                            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                                              <span>{group.groupName}</span>
                                            </div>
                                          )}

                                          <div className="flex flex-wrap items-center gap-2.5">
                                            {group.topics.map((topic) => {
                                              const isSubDone = !!completedSubtopics[topic.id];
                                              const isRec = isCareerRoadmap && !!topic.isRecommended;
                                              const isAlt = isCareerRoadmap && !!topic.isAlternative;

                                              return (
                                                <motion.div
                                                  key={topic.id}
                                                  whileHover={{ scale: 1.04, y: -1 }}
                                                  whileTap={{ scale: 0.96 }}
                                                  onClick={() =>
                                                    setSelectedSubtopic({
                                                      id: topic.id,
                                                      name: topic.name,
                                                      parentName: nodeName,
                                                      isRecommended: isRec,
                                                      isAlternative: isAlt,
                                                      isOrderNotStrict: topic.isOrderNotStrict,
                                                      docUrl: topic.docUrl,
                                                      desc: topic.desc,
                                                    })
                                                  }
                                                  className={`group flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-md ${
                                                    isSubDone
                                                      ? "bg-emerald-500/20 border-emerald-400 text-white shadow-emerald-500/20"
                                                      : isRec
                                                      ? "bg-purple-950/70 border-purple-500/90 text-purple-200 hover:bg-purple-900/80 hover:border-purple-300 shadow-purple-500/20"
                                                      : isAlt
                                                      ? "bg-amber-400/10 border-amber-400/80 text-amber-200 hover:bg-amber-400/20 hover:border-amber-300 shadow-amber-500/10"
                                                      : topic.isOrderNotStrict
                                                      ? "bg-slate-800/80 border-slate-600 text-slate-400 hover:border-slate-400"
                                                      : "bg-[#131b2e] border-slate-700 text-slate-300 hover:border-slate-500"
                                                  }`}
                                                >
                                                  <span className="font-extrabold text-white">{topic.name}</span>

                                                  {/* Checkmark Badge Circle - Stops Propagation to Toggle Directly */}
                                                  <div
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      toggleSubtopic(topic.id, nodeName);
                                                    }}
                                                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] transition-colors ${
                                                      isSubDone
                                                        ? "bg-emerald-400 text-slate-950 font-black"
                                                        : isRec
                                                        ? "bg-purple-500 text-white shadow-[0_0_8px_rgba(168,85,247,0.7)]"
                                                        : isAlt
                                                        ? "bg-amber-400 text-slate-950 font-bold shadow-[0_0_8px_rgba(251,191,36,0.7)]"
                                                        : "bg-slate-700 text-slate-400 border border-slate-600"
                                                    }`}
                                                  >
                                                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                                                  </div>
                                                </motion.div>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Realistic Growth Widget */}
        <div className="sticky top-6 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-6 border border-white/[0.08] relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(19,27,46,0.95) 0%, rgba(10,15,28,0.98) 100%)",
              boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
            }}
          >
            {/* Card Title */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  <Trophy className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white">{growthTitle}</h3>
              </div>
              <span className="text-[10px] font-bold text-slate-400 bg-white/5 px-2 py-1 rounded-md">
                {doneCount}/{allNodes.length} Skills
              </span>
            </div>

            {/* Graphic Stage Container */}
            <div className="relative h-64 rounded-xl bg-slate-950/80 border border-slate-800 overflow-hidden flex flex-col items-center justify-center p-6 text-center">
              {/* Background ambient glowing rings */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div
                  className="w-40 h-40 rounded-full border border-indigo-500/20 animate-ping opacity-25"
                  style={{ animationDuration: "4s" }}
                />
                <div
                  className="w-32 h-32 rounded-full border border-emerald-500/30 animate-pulse"
                  style={{ animationDuration: "2s" }}
                />
                <div
                  className="w-24 h-24 rounded-full blur-2xl opacity-40"
                  style={{ background: currentPhase.color }}
                />
              </div>

              {/* 90 FPS Animated Python Growth Canvas */}
              <div className="relative z-10 my-1">
                <PythonGrowthCanvas progressPct={progressPct} phaseIndex={phaseIndex} />
              </div>

              {/* Phase Text & Subtitle */}
              <div className="relative z-10 mt-2 space-y-1">
                <div
                  className="text-xs font-black tracking-wider uppercase"
                  style={{ color: currentPhase.color }}
                >
                  {currentPhase.phase}
                </div>
                <p className="text-[11px] text-slate-400 leading-tight px-2">
                  {currentPhase.description}
                </p>
              </div>

              {/* Bottom Phase Progress Bar */}
              <div className="w-full bg-slate-800/80 h-2 rounded-full mt-4 overflow-hidden relative z-10 border border-slate-700/50">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${currentPhase.color}, #6366f1)`,
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 0.6 }}
                />
              </div>
            </div>

            <div className="mt-4 text-[11px] text-slate-500 text-center font-medium">
              Complete more skills in the timeline tree to unlock higher evolution phases! 🚀
            </div>
          </motion.div>
        </div>
      </div>

      {/* Subtopic Detail Sidebar Drawer Overlay */}
      <SubtopicDetailDrawer
        isOpen={!!selectedSubtopic}
        onClose={() => setSelectedSubtopic(null)}
        subtopic={selectedSubtopic}
        isCompleted={
          selectedSubtopic
            ? !!completedSubtopics[selectedSubtopic.id]
            : false
        }
        onToggleStatus={(subtopicId) => {
          if (selectedSubtopic) {
            toggleSubtopic(subtopicId, selectedSubtopic.parentName);
          }
        }}
      />
    </motion.div>
  );
}

export default function RoadmapsPage() {
  const { session } = useAuth();
  const userId = session?.user_id;

  const [selectedRoadmap, setSelectedRoadmap] = useState<PresetRoadmap | null>(null);
  const [query, setQuery] = useState("");
  const [generating, setGenerating] = useState(false);
  const [customRoadmaps, setCustomRoadmaps] = useState<RoadmapData[]>([]);
  const [completedState, setCompletedState] = useState<Record<string, boolean>>({});
  const [enrolledIds, setEnrolledIds] = useState<Set<string>>(new Set());

  // Hydrate completed roadmap nodes from Supabase DB on mount and auto-open target roadmap if set
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const rawEnrolled = localStorage.getItem("skillscatalyst_enrolled_roadmaps");
        if (rawEnrolled) {
          const list = JSON.parse(rawEnrolled);
          const ids = new Set<string>(list.map((item: any) => item.id));
          setEnrolledIds(ids);
        }

        const openId = localStorage.getItem("skillscatalyst_open_roadmap_id");
        if (openId) {
          localStorage.removeItem("skillscatalyst_open_roadmap_id");
          const found =
            SKILL_ROADMAPS.find((r) => r.id === openId) ||
            CAREER_ROADMAPS.find((r) => r.id === openId);
          if (found) {
            setSelectedRoadmap(found);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
        }
      } catch (e) {
        console.warn("Auto-open roadmap error:", e);
      }
    }

    if (!userId) return;

    async function loadRoadmapProgress() {
      try {
        const { data } = await supabase
          .from("roadmap_progress")
          .select("roadmap_id, node_id, status")
          .eq("user_id", userId);

        if (data) {
          const map: Record<string, boolean> = {};
          data.forEach((row) => {
            const key = `${row.roadmap_id}-${row.node_id}`;
            map[key] = row.status === "completed";
          });
          setCompletedState((prev) => ({ ...prev, ...map }));
        }
      } catch (err) {
        console.warn("Failed to load roadmap progress from Supabase:", err);
      }
    }

    loadRoadmapProgress();
  }, [userId]);

  const handleGenerate = async () => {
    if (!query.trim() || generating) return;
    setGenerating(true);
    const roadmap = await generateRoadmap(query.trim());
    if (roadmap) {
      setCustomRoadmaps((prev) => [roadmap, ...prev]);
      setQuery("");
    }
    setGenerating(false);
  };

  const queryClient = useQueryClient();

  const toggleNode = async (roadmapKey: string, nodeName: string) => {
    const key = `${roadmapKey}-${nodeName}`;
    const isCurrentlyDone = completedState[key] ?? false;
    const newDoneState = !isCurrentlyDone;

    setCompletedState((prev) => ({ ...prev, [key]: newDoneState }));

    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("skillscatalyst_roadmap_completed_nodes") || "{}";
        const parsed = JSON.parse(raw);
        parsed[key] = newDoneState;
        localStorage.setItem("skillscatalyst_roadmap_completed_nodes", JSON.stringify(parsed));
      } catch (e) {}
    }

    if (userId) {
      try {
        if (newDoneState) {
          await supabase.from("roadmap_progress").upsert(
            {
              user_id: userId,
              roadmap_id: roadmapKey,
              node_id: nodeName,
              node_title: nodeName,
              status: "completed",
              completed_at: new Date().toISOString(),
            },
            { onConflict: "user_id,roadmap_id,node_id" }
          );
        } else {
          await supabase
            .from("roadmap_progress")
            .delete()
            .eq("user_id", userId)
            .eq("roadmap_id", roadmapKey)
            .eq("node_id", nodeName);
        }
      } catch (err) {
        console.warn("Failed to sync roadmap node completion to Supabase:", err);
      }
    }

    queryClient.invalidateQueries({ queryKey: ["active-roadmap"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  };

  const isNodeDone = (roadmapKey: string, nodeName: string, defaultDone = false) => {
    const key = `${roadmapKey}-${nodeName}`;
    return completedState[key] !== undefined ? completedState[key] : defaultDone;
  };

  const handleCardClick = (roadmap: PresetRoadmap) => {
    setSelectedRoadmap(roadmap);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleEnrollRoadmap = async (roadmap: PresetRoadmap, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEnrolledIds((prev) => new Set(prev).add(roadmap.id));
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(
          "skillscatalyst_active_roadmap",
          JSON.stringify({
            id: roadmap.id,
            title: roadmap.displayTitle || roadmap.title,
            rawTitle: roadmap.title,
            timestamp: Date.now(),
          })
        );
        const rawEnrolled = localStorage.getItem("skillscatalyst_enrolled_roadmaps") || "[]";
        const list = JSON.parse(rawEnrolled);
        if (!list.some((item: any) => item.id === roadmap.id)) {
          list.push({ id: roadmap.id, title: roadmap.displayTitle || roadmap.title });
          localStorage.setItem("skillscatalyst_enrolled_roadmaps", JSON.stringify(list));
        }

        const rawRemoved = localStorage.getItem("skillscatalyst_removed_roadmaps") || "[]";
        const removedList: string[] = JSON.parse(rawRemoved);
        const normId = roadmap.id.toLowerCase().trim();
        const updatedRemoved = removedList.filter((id) => id !== normId && !normId.includes(id));
        localStorage.setItem("skillscatalyst_removed_roadmaps", JSON.stringify(updatedRemoved));
      } catch (err) {
        console.warn("Failed to save active roadmap locally:", err);
      }
    }

    if (userId) {
      try {
        await supabase.from("roadmap_progress").upsert(
          {
            user_id: userId,
            roadmap_id: roadmap.id,
            node_id: "_roadmap_started",
            node_title: roadmap.displayTitle || roadmap.title,
            status: "started",
            completed_at: new Date().toISOString(),
          },
          { onConflict: "user_id,roadmap_id,node_id" }
        );
      } catch (err) {
        console.warn("Failed to mark roadmap started in Supabase:", err);
      }
    }

    queryClient.invalidateQueries({ queryKey: ["active-roadmap"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  };


  // If a roadmap is selected (e.g. Python Mastery), render the detail view subcomponent!
  if (selectedRoadmap) {
    return (
      <RoadmapDetailView
        selectedRoadmap={selectedRoadmap}
        onBack={() => setSelectedRoadmap(null)}
        toggleNode={toggleNode}
        isNodeDone={isNodeDone}
      />
    );
  }

  // DEFAULT VIEW: Roadmaps Grid (Skill Roadmaps + Career Roadmaps)
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto space-y-10 pb-16"
    >
      {/* ── Top Bar: Search & AI Custom Generator */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass p-4 sm:p-5 rounded-2xl border border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shrink-0">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">AI Custom Roadmap Generator</h2>
            <p className="text-xs text-slate-400">Generate a 5-tier curriculum for any tech stack</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 w-full sm:w-auto flex-1 sm:max-w-xl">
          <div className="relative flex-1">
            <Sparkles className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
              placeholder="Enter skill (e.g. Rust, Go, Solana, Cloud Native)..."
              className="input-glass w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGenerate}
            disabled={generating || !query.trim()}
            className="px-5 py-2.5 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-50 shrink-0"
            style={{
              background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
              boxShadow: "0 4px 15px rgba(79,70,229,0.3)",
            }}
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> Generate AI Roadmap
              </>
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* ── Generated Custom Roadmaps */}
      <AnimatePresence>
        {customRoadmaps.map((r, rIdx) => (
          <motion.div
            key={`custom-${rIdx}`}
            initial={{ opacity: 0, scale: 0.97, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass rounded-2xl p-6 border border-indigo-500/30"
            style={{
              background: "linear-gradient(135deg, rgba(79,70,229,0.12) 0%, rgba(15,23,42,0.95) 100%)",
            }}
          >
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 font-bold text-xs border border-indigo-500/30">
                  AI GENERATED
                </span>
                <h3 className="text-xl font-bold text-white">{r.title}</h3>
              </div>
              <button
                onClick={() => setCustomRoadmaps((prev) => prev.filter((_, i) => i !== rIdx))}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 mt-4">
              {r.tiers.map((t) => (
                <div key={t.tier} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <span className="text-xs font-bold text-indigo-400 bg-indigo-500/15 border border-indigo-500/30 px-2 py-0.5 rounded-lg">
                      TIER {t.tier}
                    </span>
                    <h4 className="text-sm md:text-base font-bold text-white">{t.name}</h4>
                  </div>
                  <p className="text-xs text-slate-400 mb-3">{t.description}</p>
                  <div className="flex flex-wrap items-center gap-2">
                    {t.nodes.map((n, nIdx) => {
                      const done = isNodeDone(r.title, n, false);
                      return (
                        <button
                          key={nIdx}
                          onClick={() => toggleNode(r.title, n)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                            done
                              ? "text-emerald-300 bg-emerald-500/15 border-emerald-500/40"
                              : "text-slate-300 bg-slate-800/40 border-slate-700/50 hover:border-slate-500"
                          }`}
                        >
                          {done ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <div className="w-3 h-3 rounded-full border border-slate-500" />
                          )}
                          {n}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* ── SECTION 1: SKILL ROADMAPS */}
      <section className="space-y-5">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <BookOpen className="w-6 h-6 text-indigo-400 shrink-0" />
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Skill Roadmaps
            </h1>
          </div>
          <p className="text-sm text-slate-400 ml-9">
            Select a core technical skill below to open its dedicated learning path.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {SKILL_ROADMAPS.map((item, idx) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05, duration: 0.4 }}
                onClick={() => handleCardClick(item)}
                className="relative rounded-2xl p-5 sm:p-6 transition-all duration-300 cursor-pointer flex flex-col justify-between group bg-[#131b2e] border border-white/[0.08] hover:border-indigo-500/40 hover:bg-[#18233c] hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/5"
              >
                <div>
                  {/* Icon Badge & Enroll Symbol */}
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105 ${item.bgBadge} border ${item.borderBadge} ${item.textBadge}`}
                    >
                      <Icon size={28} className="w-6 h-6 sm:w-7 sm:h-7" />
                    </div>
                    {enrolledIds.has(item.id) ? (
                      <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Enrolled
                      </span>
                    ) : (
                      <button
                        onClick={(e) => handleEnrollRoadmap(item, e)}
                        className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/30 hover:scale-105 transition-all z-10"
                      >
                        <GraduationCap className="w-3.5 h-3.5" /> Enroll
                      </button>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-base sm:text-lg font-bold text-white mb-1.5 group-hover:text-indigo-300 transition-colors">
                    {item.title}
                  </h3>

                  {/* Subtitle */}
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-normal">
                    {item.subtitle}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── SECTION 2: CAREER ROADMAPS */}
      <section className="space-y-5">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <BookOpen className="w-6 h-6 text-indigo-400 shrink-0" />
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Career Roadmaps
            </h2>
          </div>
          <p className="text-sm text-slate-400 ml-9">
            Select a career domain below to open its dedicated learning roadmap.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {CAREER_ROADMAPS.map((item, idx) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05, duration: 0.4 }}
                onClick={() => handleCardClick(item)}
                className="relative rounded-2xl p-5 sm:p-6 transition-all duration-300 cursor-pointer flex flex-col justify-between group bg-[#131b2e] border border-white/[0.08] hover:border-indigo-500/40 hover:bg-[#18233c] hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/5"
              >
                <div>
                  {/* Icon Badge & Enroll Symbol */}
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105 ${item.bgBadge} border ${item.borderBadge} ${item.textBadge}`}
                    >
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    {enrolledIds.has(item.id) ? (
                      <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Enrolled
                      </span>
                    ) : (
                      <button
                        onClick={(e) => handleEnrollRoadmap(item, e)}
                        className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/30 hover:scale-105 transition-all z-10"
                      >
                        <GraduationCap className="w-3.5 h-3.5" /> Enroll
                      </button>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-base sm:text-lg font-bold text-white mb-1.5 group-hover:text-indigo-300 transition-colors">
                    {item.title}
                  </h3>

                  {/* Subtitle */}
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-normal">
                    {item.subtitle}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>
    </motion.div>
  );
}
