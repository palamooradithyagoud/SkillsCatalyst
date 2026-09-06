"use client";

import React, { useState, useRef, useMemo } from "react";
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
  Mountain,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { generateRoadmap, normalizeRoadmapId, RoadmapData } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import BrandReactIcon from "@/components/icons/BrandReactIcon";
import PythonIcon from "@/components/icons/PythonIcon";
import BrandNextjsIcon from "@/components/icons/BrandNextjsIcon";
import PenguinRoadmapMountainExpedition, { CheckpointItem } from "@/components/PenguinRoadmapMountainExpedition";
import PenguinRoadmapHeroBanner from "@/components/PenguinRoadmapHeroBanner";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import BorderGlow from "@/components/BorderGlow";
import LogoLoop, { LogoItem } from "@/components/LogoLoop";


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
        subtitle: "Click to explore Basic Syntax, Program Lifecycle, Data Types, Variables & Scopes, Type Casting, Strings, Math, Arrays, Conditionals, Loops, and Basics of OOP on the right.",
        nodes: ["1. Learn the Basics"],
      },
      {
        title: "2. Object Oriented Programming",
        subtitle: "Click to explore Classes & Objects, Access Specifiers, Static & Final, Nested Classes, Packages, Object Lifecycle, Enums, Records, Inheritance, Encapsulation, Binding, Abstraction, and Interfaces on the right.",
        nodes: ["2. Object Oriented Programming"],
      },
      {
        title: "3. Exception Handling",
        subtitle: "Click to explore Checked & Unchecked exceptions, try-catch-finally, try-with-resources, and custom exception handling on the right.",
        nodes: ["3. Exception Handling"],
      },
      {
        title: "4. Lambda & Modern Java",
        subtitle: "Click to explore Lambda Expressions, Annotations, JPMS Modules, and Optionals on the right.",
        nodes: ["4. Lambda & Modern Java"],
      },
      {
        title: "5. Collections",
        subtitle: "Click to explore Array vs ArrayList, Set, Map, Queue, Dequeue, Stack, Iterator, and Generic Collections on the right.",
        nodes: ["5. Collections"],
      },
      {
        title: "6. Dependency Injection",
        subtitle: "Click to explore Inversion of Control (IoC), Constructor/Field Injection, and framework wiring on the right.",
        nodes: ["6. Dependency Injection"],
      },
      {
        title: "7. I/O Operations",
        subtitle: "Click to explore Byte/Character Streams, Readers/Writers, NIO.2, and File Operations on the right.",
        nodes: ["7. I/O Operations"],
      },
      {
        title: "8. Concurrency",
        subtitle: "Click to explore Threads, Virtual Threads (Project Loom), Java Memory Model, and volatile keyword on the right.",
        nodes: ["8. Concurrency"],
      },
      {
        title: "9. Core Java Utilities",
        subtitle: "Click to explore Cryptography, Date and Time (java.time), Networking (HttpClient), and Regular Expressions on the right.",
        nodes: ["9. Core Java Utilities"],
      },
      {
        title: "10. Functional Programming",
        subtitle: "Click to explore High Order Functions, Functional Interfaces, Functional Composition, and Stream API on the right.",
        nodes: ["10. Functional Programming"],
      },
      {
        title: "11. Build Tools",
        subtitle: "Click to explore Maven, Gradle, and Bazel build automation systems on the right.",
        nodes: ["11. Build Tools"],
      },
      {
        title: "12. Web Frameworks",
        subtitle: "Click to explore Spring (Spring Boot) [Recommended], Quarkus, Play Framework, and Javalin on the right.",
        nodes: ["12. Web Frameworks"],
      },
      {
        title: "13. Database Access",
        subtitle: "Click to explore JDBC, EBean, Hibernate ORM, and Spring Data JPA on the right.",
        nodes: ["13. Database Access"],
      },
      {
        title: "14. Logging Frameworks",
        subtitle: "Click to explore Logback, Log4j2, SLF4J, and TinyLog logging frameworks on the right.",
        nodes: ["14. Logging Frameworks"],
      },
      {
        title: "15. Testing",
        subtitle: "Click to explore Unit Testing (JUnit, TestNG), Integration Testing (REST Assured, JMeter), Behavior Testing (Cucumber-JVM), and Mocking (Mockito) on the right.",
        nodes: ["15. Testing"],
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
        title: "1. CLI Tools",
        subtitle: "Click to explore Vite and modern React build tools on the right.",
        nodes: ["1. CLI Tools"],
      },
      {
        title: "2. Components",
        subtitle: "Click to explore Functional Components, JSX, Props vs State, Conditional Rendering, Composition, Rendering, Lifecycle, Lists & Keys, Render Props, Refs, Events, and HOCs on the right.",
        nodes: ["2. Components"],
      },
      {
        title: "3. Hooks",
        subtitle: "Click to explore Basic Hooks (useState, useEffect), Common Hooks (useCallback, useRef, useReducer, useMemo, useContext), and Custom Hooks on the right.",
        nodes: ["3. Hooks"],
      },
      {
        title: "4. Routers",
        subtitle: "Click to explore React Router and Tanstack Router on the right.",
        nodes: ["4. Routers"],
      },
      {
        title: "5. State Management",
        subtitle: "Click to explore Context, Zustand, Jotai, and MobX on the right.",
        nodes: ["5. State Management"],
      },
      {
        title: "6. Writing CSS",
        subtitle: "Click to explore Tailwind CSS, CSS Modules, and Panda CSS on the right.",
        nodes: ["6. Writing CSS"],
      },
      {
        title: "7. Component Libraries",
        subtitle: "Click to explore Shadcn UI, Material UI, and Chakra UI on the right.",
        nodes: ["7. Component Libraries"],
      },
      {
        title: "8. Headless Component Libraries",
        subtitle: "Click to explore Radix UI, React Aria, and Ark UI on the right.",
        nodes: ["8. Headless Component Libraries"],
      },
      {
        title: "9. API Calls",
        subtitle: "Click to explore REST (react-query, Axios, swr, rtk-query) and GraphQL (Apollo, Relay, urql) on the right.",
        nodes: ["9. API Calls"],
      },
      {
        title: "10. Testing",
        subtitle: "Click to explore Vitest, Jest, react-testing-library, Cypress, and Playwright on the right.",
        nodes: ["10. Testing"],
      },
      {
        title: "11. Frameworks",
        subtitle: "Click to explore Next.js, Astro, and react-router on the right.",
        nodes: ["11. Frameworks"],
      },
      {
        title: "12. Forms",
        subtitle: "Click to explore React Hook Form and Formik on the right.",
        nodes: ["12. Forms"],
      },
      {
        title: "13. Types & Validation",
        subtitle: "Click to explore TypeScript and Zod schema validation on the right.",
        nodes: ["13. Types & Validation"],
      },
      {
        title: "14. Advanced Topics",
        subtitle: "Click to explore Animations (Framer Motion, react spring, GSAP), Server APIs, Suspense, Portals, and Error Boundaries on the right.",
        nodes: ["14. Advanced Topics"],
      },
      {
        title: "15. Mobile Applications",
        subtitle: "Click to explore React Native mobile development on the right.",
        nodes: ["15. Mobile Applications"],
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
        title: "1. Introduction",
        subtitle: "Click to explore JavaScript Basics, Why Frontend Frameworks, Why React, SPA vs SSR, and React Frameworks on the right.",
        nodes: ["1. Introduction"],
      },
      {
        title: "2. Getting Started",
        subtitle: "Click to explore create-next-app and Rendering Strategies (SSR, SPA, CSR, SSG) on the right.",
        nodes: ["2. Getting Started"],
      },
      {
        title: "3. Routing",
        subtitle: "Click to explore Routing Basics, Types of routers (Pages vs App), Routing Terminology, Layouts, Streaming, and Routing Patterns on the right.",
        nodes: ["3. Routing"],
      },
      {
        title: "4. Structuring Routes",
        subtitle: "Click to explore API Endpoints (Route Handlers), Middleware, and Internationalization (i18n) on the right.",
        nodes: ["4. Structuring Routes"],
      },
      {
        title: "5. Working with data",
        subtitle: "Click to explore Fetching Locations, Data Fetching Patterns, Server Actions, Caching Data, and Revalidation on the right.",
        nodes: ["5. Working with data"],
      },
      {
        title: "6. Rendering & Runtimes",
        subtitle: "Click to explore Client Rendered vs Server Rendered Composition and Node.js vs Edge Runtimes on the right.",
        nodes: ["6. Rendering & Runtimes"],
      },
      {
        title: "7. Writing CSS",
        subtitle: "Click to explore Ways to Write CSS (Global CSS, CSS Modules, Tailwind CSS, Sass, CSS in JS) on the right.",
        nodes: ["7. Writing CSS"],
      },
      {
        title: "8. Optimizations",
        subtitle: "Click to explore Images, Videos, Fonts, Metadata SEO, Package Bundling, Lazy Loading, Analytics, OpenTelemetry, and Memory Usage on the right.",
        nodes: ["8. Optimizations"],
      },
      {
        title: "9. Configuring",
        subtitle: "Click to explore Setting things Up (TypeScript, ESLint, Prettier), Environment Variables, Markdown/MDX, and Custom Server on the right.",
        nodes: ["9. Configuring"],
      },
      {
        title: "10. Testing",
        subtitle: "Click to explore Testing Frameworks (Vitest, Jest, Playwright, Cypress) on the right.",
        nodes: ["10. Testing"],
      },
      {
        title: "11. Deployment",
        subtitle: "Click to explore Preparing for Production and Deployment Options (Node.js Server, Docker, Static Export, Adapters) on the right.",
        nodes: ["11. Deployment"],
      },
    ],
  },
  {
    id: "nodejs-runtime",
    category: "skill",
    number: 7,
    title: "7. Node.js Runtime",
    displayTitle: "Node.js Architecture Mastery",
    subtitle: "Here's a timeline of the Node.js Server & Backend Engineering path.",
    timelineSubtitle: "Here's a timeline of the Node.js Server & Backend Engineering path.",
    icon: Server,
    color: "#22c55e",
    bgBadge: "bg-emerald-500/10",
    borderBadge: "border-emerald-500/20",
    textBadge: "text-emerald-400",
    ratings: "4.9 (21.5K Ratings)",
    salary: "₹9 – 32 LPA",
    growth: "+46.3% Growth",
    roles: "185,000+ Active Roles",
    growthPhases: [
      { phase: "PHASE 1: NODE INITIATE", title: "Node Initiate", description: "Node.js CLI, V8 engine & CommonJS/ESM modules", color: "#4ade80" },
      { phase: "PHASE 2: ASYNC & STREAMS ARCHITECT", title: "Async & Streams Architect", description: "Event Loop, Event Emitter, Promises & Buffer Streams", color: "#22c55e" },
      { phase: "PHASE 3: BACKEND API SPECIALIST", title: "Backend API Specialist", description: "Express/Fastify APIs, JWT Auth & Database ORMs", color: "#16a34a" },
      { phase: "PHASE 4: LEGENDARY NODE CLUSTER GOD", title: "Legendary Node Cluster God", description: "Worker Threads, Clustering, APM & Garbage Collection tuning", color: "#15803d" },
    ],
    sections: [
      {
        title: "1. Introduction to Node.js",
        subtitle: "Click to explore What is Node.js, Why use Node.js, History of Node.js, Node.js vs Browser, and Running Node.js Code on the right.",
        nodes: ["1. Introduction to Node.js"],
      },
      {
        title: "2. Modules",
        subtitle: "Click to explore CommonJS, ESM, Creating & Importing, and [global] keyword on the right.",
        nodes: ["2. Modules"],
      },
      {
        title: "3. Package Management (npm & npx)",
        subtitle: "Click to explore Global/Local Installation, Installing/Updating Packages, Running Scripts, npm workspaces, Creating Packages, Semantic Versioning, and npx on the right.",
        nodes: ["3. Package Management (npm & npx)"],
      },
      {
        title: "4. Async Programming",
        subtitle: "Click to explore Promises, async/await, Callbacks, setTimeout, setInterval, setImmediate, process.nextTick, Writing Async Code, Event Emitter, and Event Loop on the right.",
        nodes: ["4. Async Programming"],
      },
      {
        title: "5. Error Handling",
        subtitle: "Click to explore System Errors, User Specified Errors, Assertion Errors, JavaScript Errors, Types of Errors, Uncaught Exceptions, Handling Async Errors, Callstack/Stack Trace, and Using Debugger on the right.",
        nodes: ["5. Error Handling"],
      },
      {
        title: "6. Working with Files",
        subtitle: "Click to explore process.cwd(), path module, fs module, __dirname, __filename, glob/globby, and fs-extra/chokidar opensource packages on the right.",
        nodes: ["6. Working with Files"],
      },
      {
        title: "7. Command Line Apps",
        subtitle: "Click to explore Exiting/Exit Codes, Environment Variables (process.env, dotenv), Taking Input (process.stdin, Inquirer, prompts), Printing Output (stdout/stderr, chalk, figlet, cli-progress), and Command Line Args (process.argv, commander) on the right.",
        nodes: ["7. Command Line Apps"],
      },
      {
        title: "8. Building & Consuming APIs",
        subtitle: "Click to explore Frameworks (Express.js, Fastify, NestJS, Hono), Making API Calls (http module, axios, ky, fetch, got package), and Authentication (jsonwebtoken, passport.js) on the right.",
        nodes: ["8. Building & Consuming APIs"],
      },
      {
        title: "9. Development & Templating Tools",
        subtitle: "Click to explore Monitor Changes (--watch, nodemon) and Template Engines (ejs, pug, marko) on the right.",
        nodes: ["9. Development & Templating Tools"],
      },
      {
        title: "10. Working with Databases",
        subtitle: "Click to explore NoSQL DBs (Mongoose, Prisma, Native Drivers) and Relational DBs (Drizzle, TypeORM, Knex, Sequelize, Prisma, Native Drivers) on the right.",
        nodes: ["10. Working with Databases"],
      },
      {
        title: "11. Process & App Management",
        subtitle: "Click to explore Keep app Running (pm2), Threads (Child Process, Cluster, Worker Threads), and Streams on the right.",
        nodes: ["11. Process & App Management"],
      },
      {
        title: "12. Testing & Logging",
        subtitle: "Click to explore Testing (Vitest, Jest, node:test, Cypress, Playwright) and Logging (Winston, Morgan) on the right.",
        nodes: ["12. Testing & Logging"],
      },
      {
        title: "13. Debugging & Performance",
        subtitle: "Click to explore Memory Leaks, node --inspect, Using APM, Garbage Collection, and Common Built-in Modules on the right.",
        nodes: ["13. Debugging & Performance"],
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

const JAVA_NODE_TREE_BRANCHES: Record<string, NodeTreeBranches> = {
  "1. Learn the Basics": {
    description: "Fundamental Java syntax, program execution lifecycle, data types, variables & scopes, arrays, conditionals, loops, and OOP basics.",
    groups: [
      {
        topics: [
          { id: "java-syntax", name: "Basic Syntax", desc: "Main entry point, statements, semicolons, and comments", isRecommended: true },
          { id: "java-lifecycle", name: "Lifecycle of a Program", desc: "Compilation (.java -> .class bytecode) and JVM execution", isRecommended: true },
          { id: "java-datatypes", name: "Data Types", desc: "Primitive types (int, double, boolean) vs Reference types", isRecommended: true },
          { id: "java-variables", name: "Variables and Scopes", desc: "Local, instance, and static variable scoping rules", isRecommended: true },
          { id: "java-typecasting", name: "Type Casting", desc: "Implicit widening and explicit narrowing casts", isRecommended: true },
          { id: "java-strings", name: "Strings and Methods", desc: "String immutability, pool, and StringBuilder utilities", isRecommended: true },
          { id: "java-math", name: "Math Operations", desc: "Arithmetic, bitwise operations, and java.lang.Math", isRecommended: true },
          { id: "java-arrays", name: "Arrays", desc: "Single-dimensional and multi-dimensional fixed arrays", isRecommended: true },
          { id: "java-conditionals", name: "Conditionals", desc: "if/else, ternary operators, and switch expressions", isRecommended: true },
          { id: "java-loops", name: "Loops", desc: "for, enhanced for-each, while, and do-while loops", isRecommended: true },
          { id: "java-basics-oop", name: "Basics of OOP", desc: "Introduction to bundling state and behavior", isRecommended: true },
        ],
      },
    ],
  },
  "2. Object Oriented Programming": {
    description: "Classes and objects, attributes & methods, access specifiers, static & final keywords, nested classes, packages, object lifecycle, method chaining, enums, record, initializer block, pass-by-value/reference, inheritance, encapsulation, method overloading/overriding, static vs dynamic binding, abstraction, and interfaces.",
    groups: [
      {
        groupName: "Class Structure & Modifiers",
        topics: [
          { id: "java-oop-basics", name: "Basics of OOP", desc: "Object-oriented design principles", isRecommended: true },
          { id: "java-classes-objects", name: "Classes and Objects", desc: "Class blueprints and concrete heap object instances", isRecommended: true },
          { id: "java-attrs-methods", name: "Attributes and Methods", desc: "Fields, parameters, return types, and method signatures", isRecommended: true },
          { id: "java-access-spec", name: "Access Specifiers", desc: "private, default, protected, and public visibility", isRecommended: true },
          { id: "java-static-kw", name: "Static Keyword", desc: "Class-level fields, static methods, and static blocks", isRecommended: true },
          { id: "java-final-kw", name: "Final Keyword", desc: "Constant variables, un-overridable methods, and final classes", isRecommended: true },
          { id: "java-nested-classes", name: "Nested Classes", desc: "Static nested classes, inner classes, and anonymous classes", isRecommended: true },
          { id: "java-packages", name: "Packages", desc: "Namespace organization and package imports", isRecommended: true },
        ],
      },
      {
        groupName: "Advanced OOP & Language Features",
        topics: [
          { id: "java-more-oop", name: "More about OOP", desc: "Deep dive into object relationship patterns", isRecommended: true },
          { id: "java-obj-lifecycle", name: "Object Lifecycle", desc: "Instantiation, initialization, heap lifetime, and garbage collection", isRecommended: true },
          { id: "java-method-chaining", name: "Method Chaining", desc: "Returning 'this' for fluent builder APIs", isRecommended: true },
          { id: "java-enums", name: "Enums", desc: "Strongly-typed enumeration constants with fields and methods", isRecommended: true },
          { id: "java-records", name: "Record", desc: "Immutable data carrier classes (Java 16+)", isRecommended: true },
          { id: "java-init-blocks", name: "Initializer Block", desc: "Instance and static initialization blocks", isRecommended: true },
          { id: "java-pass-val-ref", name: "Pass by Value / Pass by Reference", desc: "Strict pass-by-value semantics in Java reference copies", isRecommended: true },
        ],
      },
      {
        groupName: "Pillars of OOP",
        topics: [
          { id: "java-inheritance", name: "Inheritance", desc: "Extending superclasses and reusability", isRecommended: true },
          { id: "java-encapsulation", name: "Encapsulation", desc: "Hiding state with private fields and getters/setters", isRecommended: true },
          { id: "java-overloading-overriding", name: "Method Overloading / Overriding", desc: "Compile-time vs runtime method polymorphism", isRecommended: true },
          { id: "java-binding", name: "Static vs Dynamic Binding", desc: "Compile-time binding vs runtime virtual method resolution", isRecommended: true },
          { id: "java-abstraction", name: "Abstraction", desc: "Hiding complexity using abstract classes and interfaces", isRecommended: true },
          { id: "java-interfaces", name: "Interfaces", desc: "Contracts with abstract, default, static, and private methods", isRecommended: true },
        ],
      },
    ],
  },
  "3. Exception Handling": {
    description: "Robust exception handling mechanisms, checked vs unchecked exceptions, and try-with-resources.",
    groups: [
      {
        topics: [
          { id: "java-exception-handling", name: "Exception Handling", desc: "Throwable hierarchy, try-catch-finally, try-with-resources, and custom exceptions", isRecommended: true },
        ],
      },
    ],
  },
  "4. Lambda & Modern Java": {
    description: "Modern Java language features including Lambda Expressions, Annotations, JPMS Modules, and Optionals.",
    groups: [
      {
        topics: [
          { id: "java-lambdas", name: "Lambda Expressions", desc: "Functional expressions for single abstract method interfaces", isRecommended: true },
          { id: "java-annotations", name: "Annotations", desc: "Built-in and custom metadata annotations", isRecommended: true },
          { id: "java-modules", name: "Modules", desc: "Java Platform Module System (JPMS) and module-info.java", isRecommended: true },
          { id: "java-optionals", name: "Optionals", desc: "Null-safe Optional<T> wrapper to prevent NullPointerExceptions", isRecommended: true },
        ],
      },
    ],
  },
  "5. Collections": {
    description: "Array vs ArrayList, Set, Map, Queue, Dequeue, Stack, Iterator, and Generic Collections.",
    groups: [
      {
        topics: [
          { id: "java-arr-vs-arrlist", name: "Array vs ArrayList", desc: "Fixed primitive arrays vs dynamically resizing ArrayLists", isRecommended: true },
          { id: "java-set", name: "Set", desc: "Unique element collections (HashSet, TreeSet, LinkedHashSet)", isRecommended: true },
          { id: "java-map", name: "Map", desc: "Key-value mappings (HashMap, TreeMap, ConcurrentHashMap)", isRecommended: true },
          { id: "java-queue", name: "Queue", desc: "FIFO queue structures and PriorityQueue", isRecommended: true },
          { id: "java-dequeue", name: "Dequeue", desc: "Double-ended queues (ArrayDeque)", isRecommended: true },
          { id: "java-stack", name: "Stack", desc: "LIFO stack operations using ArrayDeque", isRecommended: true },
          { id: "java-iterator", name: "Iterator", desc: "Fail-fast iterator protocol for Collection traversal", isRecommended: true },
          { id: "java-generics", name: "Generic Collections", desc: "Compile-time type safety with generic type parameters <T>", isRecommended: true },
        ],
      },
    ],
  },
  "6. Dependency Injection": {
    description: "Inversion of Control (IoC), loose coupling, and Dependency Injection wiring patterns.",
    groups: [
      {
        topics: [
          { id: "java-di", name: "Dependency Injection", desc: "Inversion of Control (IoC), constructor injection, field injection, and component wiring", isRecommended: true },
        ],
      },
    ],
  },
  "7. I/O Operations": {
    description: "Input/output stream handling, Readers/Writers, NIO.2 file channels, and File Operations.",
    groups: [
      {
        topics: [
          { id: "java-io-ops", name: "I/O Operations", desc: "Byte Streams (InputStream/OutputStream) and Character Streams (Reader/Writer)", isRecommended: true },
          { id: "java-file-ops", name: "File Operations", desc: "NIO.2 Path, Paths, and Files utility methods", isRecommended: true },
        ],
      },
    ],
  },
  "8. Concurrency": {
    description: "Threads, Virtual Threads (Project Loom), Java Memory Model, and volatile keyword.",
    groups: [
      {
        topics: [
          { id: "java-threads", name: "Threads", desc: "Thread creation, Runnable, Callable, Executors, and thread pools", isRecommended: true },
          { id: "java-virtual-threads", name: "Virtual Threads", desc: "Project Loom lightweight JVM-managed threads (Java 21+)", isRecommended: true },
          { id: "java-jmm", name: "Java Memory Model", desc: "Heap memory, thread stacks, memory barriers, and visibility rules", isRecommended: true },
          { id: "java-volatile", name: "volatile keyword", desc: "Direct main memory read/write visibility guarantees", isRecommended: true },
        ],
      },
    ],
  },
  "9. Core Java Utilities": {
    description: "Cryptography, Date and Time (java.time), Networking (HttpClient), and Regular Expressions.",
    groups: [
      {
        topics: [
          { id: "java-crypto", name: "Cryptography", desc: "SHA-256 digests, AES Ciphers, and SecretKey generation", isRecommended: true },
          { id: "java-datetime", name: "Date and Time", desc: "Thread-safe java.time API (LocalDate, Instant, Duration)", isRecommended: true },
          { id: "java-networking", name: "Networking", desc: "Modern HttpClient, HttpRequest, HttpResponse, and Sockets", isRecommended: true },
          { id: "java-regex", name: "Regular Expressions", desc: "Pattern matching and extraction with java.util.regex", isRecommended: true },
        ],
      },
    ],
  },
  "10. Functional Programming": {
    description: "High Order Functions, Functional Interfaces, Functional Composition, and Stream API.",
    groups: [
      {
        topics: [
          { id: "java-higher-order-fn", name: "High Order Functions", desc: "Functions accepting or returning other functions", isRecommended: true },
          { id: "java-fn-interfaces", name: "Functional Interfaces", desc: "Function, Predicate, Consumer, and Supplier interfaces", isRecommended: true },
          { id: "java-fn-composition", name: "Functional Composition", desc: "Chaining functions with .andThen() and .compose()", isRecommended: true },
          { id: "java-stream-api", name: "Stream API", desc: "Declarative data pipelines with filter, map, reduce, and collect", isRecommended: true },
        ],
      },
    ],
  },
  "11. Build Tools": {
    description: "Maven, Gradle, and Bazel build automation systems.",
    groups: [
      {
        topics: [
          { id: "java-maven", name: "Maven", desc: "Standard XML pom.xml builds and conventional lifecycle phases", isRecommended: true },
          { id: "java-gradle", name: "Gradle", desc: "Groovy/Kotlin DSL build scripts with fast incremental compilation", isRecommended: true },
          { id: "java-bazel", name: "Bazel", desc: "Scalable multi-language deterministic build system", isAlternative: true },
        ],
      },
    ],
  },
  "12. Web Frameworks": {
    description: "Spring (Spring Boot) [Recommended], Quarkus, Play Framework, and Javalin.",
    groups: [
      {
        topics: [
          { id: "java-spring-boot-fw", name: "Spring (Spring Boot)", desc: "Industry-standard enterprise framework (Recommended)", isRecommended: true },
          { id: "java-quarkus", name: "Quarkus", desc: "Kubernetes-native Java framework optimized for GraalVM Native Images", isAlternative: true },
          { id: "java-play-fw", name: "Play Framework", desc: "Lightweight reactive web framework", isAlternative: true },
          { id: "java-javalin", name: "Javalin", desc: "Minimalist web micro-framework for Java/Kotlin", isAlternative: true },
        ],
      },
    ],
  },
  "13. Database Access": {
    description: "JDBC, EBean, Hibernate ORM, and Spring Data JPA.",
    groups: [
      {
        topics: [
          { id: "java-jdbc", name: "JDBC", desc: "Low-level database connection, PreparedStatement, and ResultSet", isRecommended: true },
          { id: "java-ebean", name: "EBean", desc: "Active-record ORM layer with query beans", isAlternative: true },
          { id: "java-hibernate", name: "Hibernate", desc: "Full-featured ORM framework managing entity lifecycle and HQL", isRecommended: true },
          { id: "java-spring-data-jpa", name: "Spring Data JPA", desc: "High-level repository abstraction over JPA/Hibernate (Recommended)", isRecommended: true },
        ],
      },
    ],
  },
  "14. Logging Frameworks": {
    description: "Logback, Log4j2, SLF4J, and TinyLog logging frameworks.",
    groups: [
      {
        topics: [
          { id: "java-logback", name: "Logback", desc: "Native SLF4J logging framework (Recommended)", isRecommended: true },
          { id: "java-log4j2", name: "Log4j2", desc: "High-performance enterprise logging framework with async loggers", isRecommended: true },
          { id: "java-slf4j", name: "SLF4J", desc: "Simple Logging Facade for Java abstraction layer", isRecommended: true },
          { id: "java-tinylog", name: "TinyLog", desc: "Lightweight, zero-dependency logging framework", isAlternative: true },
        ],
      },
    ],
  },
  "15. Testing": {
    description: "Unit Testing (JUnit, TestNG), Integration Testing (REST Assured, JMeter), Behavior Testing (Cucumber-JVM), and Mocking (Mockito).",
    groups: [
      {
        groupName: "Unit Testing & Mocking",
        topics: [
          { id: "java-unit-testing", name: "Unit Testing", desc: "Writing test cases for individual units of code", isRecommended: true },
          { id: "java-junit", name: "JUnit", desc: "Industry standard unit testing framework (JUnit 5)", isRecommended: true },
          { id: "java-testng", name: "TestNG", desc: "Testing framework with advanced grouping and parameterization", isAlternative: true },
          { id: "java-mocking", name: "Mocking", desc: "Creating test doubles to isolate unit under test", isRecommended: true },
          { id: "java-mockito", name: "Mockito", desc: "Popular Java mocking framework for stubbing and verification", isRecommended: true },
        ],
      },
      {
        groupName: "Integration & Behavior Testing",
        topics: [
          { id: "java-integration-testing", name: "Integration Testing", desc: "Testing component interactions and API integrations", isRecommended: true },
          { id: "java-rest-assured", name: "REST Assured", desc: "Fluent DSL for testing RESTful web services", isRecommended: true },
          { id: "java-jmeter", name: "JMeter", desc: "Performance and API load testing tool", isAlternative: true },
          { id: "java-behavior-testing", name: "Behavior Testing", desc: "Specification by example and user scenario testing", isRecommended: true },
          { id: "java-cucumber-jvm", name: "Cucumber-JVM", desc: "Behavior-Driven Development (BDD) framework using Gherkin syntax", isRecommended: true },
        ],
      },
    ],
  },
};

const REACT_NODE_TREE_BRANCHES: Record<string, NodeTreeBranches> = {
  "1. CLI Tools": {
    description: "Modern CLI build tools and development environments for React applications.",
    groups: [
      {
        topics: [
          { id: "react-vite", name: "Vite", desc: "Next Generation Frontend Tooling with instant HMR and ES modules", isRecommended: true },
        ],
      },
    ],
  },
  "2. Components": {
    description: "Functional Components, Component Basics, JSX, Props vs State, Conditional Rendering, Composition, Rendering, Component Lifecycle, Lists & Keys, Render Props, Refs, Events, and HOCs.",
    groups: [
      {
        groupName: "Component Core & JSX",
        topics: [
          { id: "react-fn-comp", name: "Functional Components", desc: "Pure functions returning JSX elements", isRecommended: true },
          { id: "react-comp-basics", name: "Component Basics", desc: "Building blocks of React UI interfaces", isRecommended: true },
          { id: "react-jsx", name: "JSX", desc: "JavaScript XML syntax extension for React", isRecommended: true },
          { id: "react-props-state", name: "Props vs State", desc: "External component arguments vs internal reactive state", isRecommended: true },
          { id: "react-cond-render", name: "Conditional Rendering", desc: "Rendering elements based on condition states", isRecommended: true },
          { id: "react-composition", name: "Composition", desc: "Combining components via children prop and slots", isRecommended: true },
        ],
      },
      {
        groupName: "Rendering & Advanced Component Patterns",
        topics: [
          { id: "react-rendering", name: "Rendering", desc: "React Virtual DOM reconciliation and render cycles", isRecommended: true },
          { id: "react-lifecycle", name: "Component Lifecycle", desc: "Mounting, updating, and unmounting phases", isRecommended: true },
          { id: "react-lists-keys", name: "Lists and Keys", desc: "Mapping arrays to elements with unique key identifiers", isRecommended: true },
          { id: "react-render-props", name: "Render Props", desc: "Sharing code between components using a prop whose value is a function", isAlternative: true },
          { id: "react-refs", name: "Refs", desc: "Accessing underlying DOM nodes directly", isRecommended: true },
          { id: "react-events", name: "Events", desc: "Synthetic event handling in React", isRecommended: true },
          { id: "react-hoc", name: "High Order Components", desc: "Advanced pattern for reusing component logic (HOC)", isAlternative: true },
        ],
      },
    ],
  },
  "3. Hooks": {
    description: "Basic Hooks (useState, useEffect), Common Hooks (useCallback, useRef, useReducer, useMemo, useContext), and Custom Hooks.",
    groups: [
      {
        groupName: "Basic Hooks",
        topics: [
          { id: "react-usestate", name: "useState", desc: "State hook for managing local component state", isRecommended: true },
          { id: "react-useeffect", name: "useEffect", desc: "Side effect hook for data fetching, subscriptions, and DOM updates", isRecommended: true },
        ],
      },
      {
        groupName: "Common Hooks",
        topics: [
          { id: "react-usecallback", name: "useCallback", desc: "Memoize callback functions across renders", isRecommended: true },
          { id: "react-useref", name: "useRef", desc: "Persist mutable values without triggering re-renders", isRecommended: true },
          { id: "react-usereducer", name: "useReducer", desc: "Manage complex state logic via reducer actions", isRecommended: true },
          { id: "react-usememo", name: "useMemo", desc: "Memoize expensive calculation results", isRecommended: true },
          { id: "react-usecontext", name: "useContext", desc: "Consume React Context values cleanly", isRecommended: true },
        ],
      },
      {
        groupName: "Custom Hooks",
        topics: [
          { id: "react-create-custom-hooks", name: "Creating Custom Hooks", desc: "Extracting reusable stateful logic into custom use* functions", isRecommended: true },
          { id: "react-hooks-best-practices", name: "Hooks Best Practices", desc: "Rules of hooks, dependency arrays, and stale closures", isRecommended: true },
        ],
      },
    ],
  },
  "4. Routers": {
    description: "Client-side routing libraries for React applications.",
    groups: [
      {
        topics: [
          { id: "react-router", name: "React Router", desc: "Standard declarative routing library for React", isRecommended: true },
          { id: "react-tanstack-router", name: "Tanstack Router", desc: "Type-safe, search-param-first router for React", isRecommended: true },
        ],
      },
    ],
  },
  "5. State Management": {
    description: "Context, Zustand, Jotai, and MobX global state management solutions.",
    groups: [
      {
        topics: [
          { id: "react-context-api", name: "Context", desc: "React built-in Context API for prop drilling prevention", isRecommended: true },
          { id: "react-zustand", name: "Zustand", desc: "Small, fast, and scalable bear-necessities state management", isRecommended: true },
          { id: "react-jotai", name: "Jotai", desc: "Primitive and flexible atomic state management", isAlternative: true },
          { id: "react-mobx", name: "MobX", desc: "Simple, scalable observable state management", isAlternative: true },
        ],
      },
    ],
  },
  "6. Writing CSS": {
    description: "Tailwind CSS, CSS Modules, and Panda CSS styling methodologies.",
    groups: [
      {
        topics: [
          { id: "react-tailwind", name: "Tailwind CSS", desc: "Utility-first CSS framework for rapid UI development (Recommended)", isRecommended: true },
          { id: "react-css-modules", name: "CSS Modules", desc: "Scoped CSS file imports preventing global class leaks", isRecommended: true },
          { id: "react-panda-css", name: "Panda CSS", desc: "Build-time CSS-in-JS engine generating atomic CSS", isAlternative: true },
        ],
      },
    ],
  },
  "7. Component Libraries": {
    description: "Pre-styled component suites for React applications.",
    groups: [
      {
        topics: [
          { id: "react-shadcn", name: "Shadcn UI", desc: "Re-usable components built with Radix UI and Tailwind (Recommended)", isRecommended: true },
          { id: "react-mui", name: "Material UI", desc: "Google Material Design component library", isRecommended: true },
          { id: "react-chakra", name: "Chakra UI", desc: "Simple, modular, and accessible component library", isAlternative: true },
        ],
      },
    ],
  },
  "8. Headless Component Libraries": {
    description: "Unstyled, fully accessible UI component primitives.",
    groups: [
      {
        topics: [
          { id: "react-radix", name: "Radix UI", desc: "Unstyled, accessible component primitives for React (Recommended)", isRecommended: true },
          { id: "react-aria", name: "React Aria", desc: "Adobe hooks and primitives for accessible UI components", isRecommended: true },
          { id: "react-ark", name: "Ark UI", desc: "Headless UI components powered by Zag.js state machines", isAlternative: true },
        ],
      },
    ],
  },
  "9. API Calls": {
    description: "REST (react-query, Axios, swr, rtk-query) and GraphQL (Apollo, Relay, urql) clients.",
    groups: [
      {
        groupName: "REST API Clients",
        topics: [
          { id: "react-query", name: "react-query", desc: "TanStack Query async state management for REST APIs (Recommended)", isRecommended: true },
          { id: "react-axios", name: "Axios", desc: "Promise-based HTTP client for browser & node", isRecommended: true },
          { id: "react-swr", name: "swr", desc: "Stale-While-Revalidate data fetching library by Vercel", isRecommended: true },
          { id: "react-rtk-query", name: "rtk-query", desc: "Redux Toolkit data fetching and caching tool", isAlternative: true },
        ],
      },
      {
        groupName: "GraphQL Clients",
        topics: [
          { id: "react-apollo", name: "Apollo", desc: "Comprehensive GraphQL client for React", isRecommended: true },
          { id: "react-relay", name: "Relay", desc: "Meta framework for data-driven GraphQL applications", isAlternative: true },
          { id: "react-urql", name: "urql", desc: "Highly customizable and lightweight GraphQL client", isAlternative: true },
        ],
      },
    ],
  },
  "10. Testing": {
    description: "Vitest, Jest, react-testing-library, Cypress, and Playwright.",
    groups: [
      {
        topics: [
          { id: "react-vitest", name: "Vitest", desc: "Blazing fast Vite-native unit test runner (Recommended)", isRecommended: true },
          { id: "react-jest", name: "Jest", desc: "Delightful JavaScript testing framework", isRecommended: true },
          { id: "react-rtl", name: "react-testing-library", desc: "Lightweight utility for testing React components", isRecommended: true },
          { id: "react-cypress", name: "Cypress", desc: "Fast, easy, and reliable E2E testing framework", isRecommended: true },
          { id: "react-playwright", name: "Playwright", desc: "Reliable end-to-end testing for modern web apps", isRecommended: true },
        ],
      },
    ],
  },
  "11. Frameworks": {
    description: "Next.js, Astro, and react-router production web frameworks.",
    groups: [
      {
        topics: [
          { id: "react-nextjs", name: "Next.js", desc: "The React Framework for the Web (App Router, Server Components) [Recommended]", isRecommended: true },
          { id: "react-astro", name: "Astro", desc: "Content-driven web framework supporting React islands", isRecommended: true },
          { id: "react-fw-router", name: "react-router", desc: "Fullstack web framework powered by React Router v7", isAlternative: true },
        ],
      },
    ],
  },
  "12. Forms": {
    description: "React Hook Form and Formik input state & submission management.",
    groups: [
      {
        topics: [
          { id: "react-hook-form", name: "React Hook Form", desc: "Performant, flexible, and extensible forms with easy validation (Recommended)", isRecommended: true },
          { id: "react-formik", name: "Formik", desc: "Popular form library for React", isAlternative: true },
        ],
      },
    ],
  },
  "13. Types & Validation": {
    description: "TypeScript type safety and Zod runtime schema validation.",
    groups: [
      {
        topics: [
          { id: "react-ts", name: "TypeScript", desc: "Typed superset of JavaScript for type-safe React development", isRecommended: true },
          { id: "react-zod", name: "Zod", desc: "TypeScript-first schema declaration and validation library", isRecommended: true },
        ],
      },
    ],
  },
  "14. Advanced Topics": {
    description: "Animations (Framer Motion, react spring, GSAP), Server APIs, Suspense, Portals, and Error Boundaries.",
    groups: [
      {
        groupName: "Animation",
        topics: [
          { id: "react-framer-motion", name: "Framer Motion", desc: "Production-ready motion library for React (Recommended)", isRecommended: true },
          { id: "react-spring", name: "react spring", desc: "Physics-based animation library", isAlternative: true },
          { id: "react-gsap", name: "GSAP", desc: "GreenSock Animation Platform for high-performance animations", isAlternative: true },
        ],
      },
      {
        groupName: "Advanced React APIs",
        topics: [
          { id: "react-server-apis", name: "Server APIs", desc: "React Server Components and Server Actions", isRecommended: true },
          { id: "react-suspense", name: "Suspense", desc: "Declarative fallback state handling while child components load", isRecommended: true },
          { id: "react-portals", name: "Portals", desc: "Rendering children into a DOM node outside parent hierarchy", isRecommended: true },
          { id: "react-error-boundaries", name: "Error Boundaries", desc: "Catch JavaScript errors anywhere in child component trees", isRecommended: true },
        ],
      },
    ],
  },
  "15. Mobile Applications": {
    description: "Cross-platform mobile development using React Native.",
    groups: [
      {
        topics: [
          { id: "react-native", name: "React Native", desc: "Build native Android and iOS apps using React", isRecommended: true },
        ],
      },
    ],
  },
};

const NODEJS_NODE_TREE_BRANCHES: Record<string, NodeTreeBranches> = {
  "1. Introduction to Node.js": {
    description: "What is Node.js, Why use Node.js, History of Node.js, Node.js vs Browser, and Running Node.js Code.",
    groups: [
      {
        topics: [
          { id: "node-what-is", name: "What is Node.js?", desc: "Asynchronous event-driven JavaScript runtime environment", isRecommended: true },
          { id: "node-why-use", name: "Why use Node.js?", desc: "Single-threaded non-blocking I/O and shared JS language stack", isRecommended: true },
          { id: "node-history", name: "History of Node.js", desc: "Created by Ryan Dahl in 2009 powered by V8 engine", isRecommended: true },
          { id: "node-vs-browser", name: "Node.js vs Browser", desc: "DOM/Window globals vs process, fs, and OS system APIs", isRecommended: true },
          { id: "node-running-code", name: "Running Node.js Code", desc: "Executing JS scripts via node CLI executable", isRecommended: true },
        ],
      },
    ],
  },
  "2. Modules": {
    description: "CommonJS, ESM, Creating & Importing, and [global] keyword.",
    groups: [
      {
        topics: [
          { id: "node-commonjs", name: "CommonJS", desc: "require() and module.exports module standard", isRecommended: true },
          { id: "node-esm", name: "ESM", desc: "ES6 import and export module standard (.mjs / package.json type: module)", isRecommended: true },
          { id: "node-create-import", name: "Creating & Importing", desc: "Authoring custom local modules and package imports", isRecommended: true },
          { id: "node-global-kw", name: "[global] keyword", desc: "Node.js global namespace object and global scope variables", isRecommended: true },
        ],
      },
    ],
  },
  "3. Package Management (npm & npx)": {
    description: "Global & Local Installation, Installing/Updating Packages, Running Scripts, npm workspaces, Creating Packages, Semantic Versioning, and npx.",
    groups: [
      {
        groupName: "npm Basics & Installation",
        topics: [
          { id: "node-global-inst", name: "Global Installation", desc: "npm install -g for global CLI tools", isRecommended: true },
          { id: "node-local-inst", name: "Local Installation", desc: "npm install --save and --save-dev project dependencies", isRecommended: true },
          { id: "node-inst-pkg", name: "Installing Packages", desc: "Fetching libraries from npm registry", isRecommended: true },
          { id: "node-upd-pkg", name: "Updating Packages", desc: "npm update and dependency version upgrades", isRecommended: true },
        ],
      },
      {
        groupName: "Workspaces, Packaging & npx",
        topics: [
          { id: "node-run-scripts", name: "Running Scripts", desc: "Executing npm run scripts defined in package.json", isRecommended: true },
          { id: "node-workspaces", name: "npm workspaces", desc: "Monorepo dependency management across multiple packages", isRecommended: true },
          { id: "node-create-pkg", name: "Creating Packages", desc: "npm init, package.json configuration, and npm publish", isRecommended: true },
          { id: "node-semver", name: "Semantic Versioning", desc: "Major.Minor.Patch version rules (^, ~, exact)", isRecommended: true },
          { id: "node-npx", name: "npx", desc: "Executing npm package binaries directly without permanent install", isRecommended: true },
        ],
      },
    ],
  },
  "4. Async Programming": {
    description: "Promises, async/await, Callbacks, setTimeout, setInterval, setImmediate, process.nextTick, Writing Async Code, Event Emitter, and Event Loop.",
    groups: [
      {
        groupName: "Writing Async Code",
        topics: [
          { id: "node-promises", name: "Promises", desc: "Pending, fulfilled, rejected Promise states and chaining", isRecommended: true },
          { id: "node-async-await", name: "async/await", desc: "Syntactic sugar over Promises for readable async control flow", isRecommended: true },
          { id: "node-callbacks", name: "Callbacks", desc: "Node.js error-first callback conventions (err, res)", isRecommended: true },
          { id: "node-settimeout", name: "setTimeout", desc: "Scheduling execution after a delay timer", isRecommended: true },
          { id: "node-setinterval", name: "setInterval", desc: "Scheduling recurring execution at fixed intervals", isRecommended: true },
          { id: "node-setimmediate", name: "setImmediate", desc: "Executing callbacks in the Check phase of event loop", isRecommended: true },
          { id: "node-nexttick", name: "process.nextTick", desc: "Executing microtasks before next event loop phase", isRecommended: true },
        ],
      },
      {
        groupName: "Architecture Mechanics",
        topics: [
          { id: "node-event-emitter", name: "Event Emitter", desc: "EventEmitter class, .on(), .emit(), and custom events", isRecommended: true },
          { id: "node-event-loop", name: "Event Loop", desc: "Timers, Pending I/O, Poll, Check, and Close phases in libuv", isRecommended: true },
        ],
      },
    ],
  },
  "5. Error Handling": {
    description: "System Errors, User Specified Errors, Assertion Errors, JavaScript Errors, Types of Errors, Uncaught Exceptions, Handling Async Errors, Callstack/Stack Trace, and Using Debugger.",
    groups: [
      {
        groupName: "Types of Errors",
        topics: [
          { id: "node-sys-errors", name: "System Errors", desc: "OS level operational errors (ENOENT, ECONNREFUSED, EADDRINUSE)", isRecommended: true },
          { id: "node-user-errors", name: "User Specified Errors", desc: "Custom business logic application errors", isRecommended: true },
          { id: "node-assert-errors", name: "Assertion Errors", desc: "Invariant failures thrown by assert module", isRecommended: true },
          { id: "node-js-errors", name: "JavaScript Errors", desc: "TypeError, ReferenceError, SyntaxError, RangeError", isRecommended: true },
        ],
      },
      {
        groupName: "Handling & Debugging",
        topics: [
          { id: "node-uncaught-exc", name: "Uncaught Exceptions", desc: "process.on('uncaughtException') and unhandledRejection", isRecommended: true },
          { id: "node-handle-async-err", name: "Handling Async Errors", desc: "Catching rejected promises and try-catch in async functions", isRecommended: true },
          { id: "node-callstack", name: "Callstack / Stack Trace", desc: "Inspecting Error.stack trace details", isRecommended: true },
          { id: "node-debugger", name: "Using Debugger", desc: "Node inspector, VS Code debugger, and debugger; statements", isRecommended: true },
        ],
      },
    ],
  },
  "6. Working with Files": {
    description: "process.cwd(), path module, fs module, __dirname, __filename, and opensource packages (glob/globby, fs-extra, chokidar).",
    groups: [
      {
        groupName: "Core File & Path Modules",
        topics: [
          { id: "node-process-cwd", name: "process.cwd()", desc: "Current working directory of Node process", isRecommended: true },
          { id: "node-path-mod", name: "path module", desc: "path.join(), path.resolve(), path.extname(), path.parse()", isRecommended: true },
          { id: "node-fs-mod", name: "fs module", desc: "File system read/write/delete operations (fs.promises)", isRecommended: true },
          { id: "node-dirname", name: "__dirname", desc: "Directory path of current module", isRecommended: true },
          { id: "node-filename", name: "__filename", desc: "Absolute file path of current module", isRecommended: true },
        ],
      },
      {
        groupName: "Opensource Packages",
        topics: [
          { id: "node-glob", name: "glob / globby", desc: "Matching file paths using wildcard glob patterns", isRecommended: true },
          { id: "node-fs-extra", name: "fs-extra / chokidar", desc: "Enhanced fs methods and file system watcher events", isRecommended: true },
        ],
      },
    ],
  },
  "7. Command Line Apps": {
    description: "Exit codes, Environment Variables, Taking Input, Printing Output, and Command line args.",
    groups: [
      {
        topics: [
          { id: "node-env-vars", name: "Environment Variables (dotenv & process.env)", desc: "process.env configuration and .env file loading", isRecommended: true },
          { id: "node-exit-codes", name: "Exiting / Exit Codes", desc: "process.exit(0) success vs process.exit(1) failure codes", isRecommended: true },
          { id: "node-taking-input", name: "Taking Input (process.stdin / Inquirer / prompts)", desc: "Interactive CLI prompts and user keyboard input", isRecommended: true },
          { id: "node-printing-output", name: "Printing Output (stdout/stderr / chalk / figlet / cli-progress)", desc: "Terminal formatting, colors, progress bars, and banners", isRecommended: true },
          { id: "node-cli-args", name: "Command Line Args (process.argv / commander)", desc: "Parsing CLI flags and options", isRecommended: true },
        ],
      },
    ],
  },
  "8. Building & Consuming APIs": {
    description: "Frameworks (Express.js, Fastify, NestJS, Hono), Making API Calls (http, axios, ky, fetch, got), and Authentication (jsonwebtoken, passport.js).",
    groups: [
      {
        groupName: "Frameworks",
        topics: [
          { id: "node-express", name: "Express.js", desc: "Fast, unopinionated, minimalist web framework (Recommended)", isRecommended: true },
          { id: "node-fastify", name: "fastify", desc: "High performance low overhead web framework", isRecommended: true },
          { id: "node-nestjs", name: "NestJS", desc: "Progressive TypeScript framework for scalable server apps", isRecommended: true },
          { id: "node-hono", name: "Hono", desc: "Ultrafast web framework for multi-runtime environments", isAlternative: true },
        ],
      },
      {
        groupName: "Making API Calls",
        topics: [
          { id: "node-http-mod", name: "http module", desc: "Built-in Node.js HTTP server and client module", isRecommended: true },
          { id: "node-axios-ky", name: "axios / ky", desc: "Promise-based HTTP clients for Node.js", isRecommended: true },
          { id: "node-fetch", name: "fetch", desc: "Native fetch API in Node.js 18+", isRecommended: true },
          { id: "node-got-pkg", name: "got package", desc: "Human-friendly HTTP request library for Node.js", isAlternative: true },
        ],
      },
      {
        groupName: "Authentication",
        topics: [
          { id: "node-jwt", name: "jsonwebtoken", desc: "JSON Web Token signing and verification", isRecommended: true },
          { id: "node-passport", name: "passport.js", desc: "Unobtrusive authentication middleware for Node.js", isRecommended: true },
        ],
      },
    ],
  },
  "9. Development & Templating Tools": {
    description: "Monitor Changes (--watch, nodemon) and Template Engines (ejs, pug, marko).",
    groups: [
      {
        topics: [
          { id: "node-dev-watch", name: "Monitor Changes (--watch / nodemon)", desc: "Automatic server restart on file saves", isRecommended: true },
          { id: "node-template-engines", name: "Template Engines (ejs / pug / marko)", desc: "Server-side HTML template rendering", isAlternative: true },
        ],
      },
    ],
  },
  "10. Working with Databases": {
    description: "NoSQL DBs (Mongoose, Prisma, Native Drivers) and Relational DBs (Drizzle, TypeORM, Knex, Sequelize, Prisma, Native Drivers).",
    groups: [
      {
        groupName: "NoSQL DBs",
        topics: [
          { id: "node-mongoose", name: "Mongoose", desc: "MongoDB object modeling for Node.js", isRecommended: true },
          { id: "node-prisma-nosql", name: "Prisma (NoSQL)", desc: "Next-generation ORM for MongoDB", isRecommended: true },
          { id: "node-native-drivers-nosql", name: "Native Drivers (MongoDB)", desc: "Low-level mongodb driver client", isAlternative: true },
        ],
      },
      {
        groupName: "Relational DBs",
        topics: [
          { id: "node-drizzle", name: "Drizzle", desc: "TypeScript ORM with maximum performance and type safety", isRecommended: true },
          { id: "node-typeorm", name: "TypeORM", desc: "ORM supporting Active Record and Data Mapper patterns", isRecommended: true },
          { id: "node-knex", name: "Knex", desc: "SQL query builder for PostgreSQL, MySQL, SQLite", isRecommended: true },
          { id: "node-sequelize", name: "Sequelize", desc: "Promise-based Node.js ORM for Postgres, MySQL, SQLite", isRecommended: true },
          { id: "node-prisma-relational", name: "Prisma (Relational)", desc: "Automated type-safe database client for PostgreSQL/MySQL", isRecommended: true },
          { id: "node-native-drivers-relational", name: "Native Drivers (pg / mysql2)", desc: "Direct database driver connections", isAlternative: true },
        ],
      },
    ],
  },
  "11. Process & App Management": {
    description: "Keep app Running (pm2), Threads (Child Process, Cluster, Worker Threads), and Streams.",
    groups: [
      {
        topics: [
          { id: "node-pm2", name: "Keep app Running (pm2)", desc: "Production process manager for Node.js applications", isRecommended: true },
          { id: "node-child-proc", name: "Child Process", desc: "child_process.exec, spawn, and fork for external processes", isRecommended: true },
          { id: "node-cluster", name: "Cluster", desc: "Multi-process load balancing across CPU cores", isRecommended: true },
          { id: "node-worker-threads", name: "Worker Threads", desc: "Executing CPU-intensive JavaScript in parallel threads", isRecommended: true },
          { id: "node-streams", name: "Streams", desc: "Readable, Writable, Transform, and Duplex data streams", isRecommended: true },
        ],
      },
    ],
  },
  "12. Testing & Logging": {
    description: "Testing (Vitest, Jest, node:test, Cypress, Playwright) and Logging (Winston, Morgan).",
    groups: [
      {
        groupName: "Testing",
        topics: [
          { id: "node-vitest", name: "Vitest", desc: "Vite-native unit testing runner", isRecommended: true },
          { id: "node-jest", name: "Jest", desc: "Comprehensive JS test runner", isRecommended: true },
          { id: "node-test-runner", name: "node:test", desc: "Native Node.js built-in test runner module", isRecommended: true },
          { id: "node-cypress", name: "Cypress", desc: "End-to-end integration testing", isRecommended: true },
          { id: "node-playwright", name: "Playwright", desc: "Automated browser end-to-end testing", isRecommended: true },
        ],
      },
      {
        groupName: "Logging",
        topics: [
          { id: "node-winston", name: "Winston", desc: "Multi-transport asynchronous logger for Node.js", isRecommended: true },
          { id: "node-morgan", name: "Morgan", desc: "HTTP request logger middleware for Node.js", isRecommended: true },
        ],
      },
    ],
  },
  "13. Debugging & Performance": {
    description: "Memory Leaks, node --inspect, Using APM, Garbage Collection, and Common Built-in Modules.",
    groups: [
      {
        topics: [
          { id: "node-memory-leaks", name: "Memory Leaks", desc: "Identifying heap memory leaks and retaining paths", isRecommended: true },
          { id: "node-inspect-flag", name: "node --inspect", desc: "Attaching Chrome DevTools debugger to Node runtime", isRecommended: true },
          { id: "node-apm", name: "Using APM", desc: "Application Performance Monitoring (Datadog, NewRelic, Elastic APM)", isRecommended: true },
          { id: "node-gc", name: "Garbage Collection", desc: "V8 Scavenge and Mark-Sweep garbage collector internals", isRecommended: true },
          { id: "node-builtin-mods", name: "Common Built-in Modules", desc: "util, events, crypto, buffer, stream, net, tls, os, url", isRecommended: true },
        ],
      },
    ],
  },
};

const NEXTJS_NODE_TREE_BRANCHES: Record<string, NodeTreeBranches> = {
  "1. Introduction": {
    description: "JavaScript Basics, Why Frontend Frameworks, Why React, SPA vs SSR, and React Frameworks (Next.js & Remix).",
    groups: [
      {
        topics: [
          { id: "next-js-basics", name: "JavaScript Basics", desc: "Core JS fundamentals for framework concepts", isRecommended: true },
          { id: "next-why-fw", name: "Why Frontend Frameworks", desc: "Benefits of component-driven client architecture", isRecommended: true },
          { id: "next-why-react", name: "Why React", desc: "Declarative UI rendering and virtual DOM reconciliation", isRecommended: true },
          { id: "next-spa-vs-ssr", name: "SPA vs SSR", desc: "Single Page App vs Server-Side Rendering tradeoffs", isRecommended: true },
          { id: "next-react-fws", name: "React Frameworks (Next.js & Remix)", desc: "Fullstack production frameworks built on React", isRecommended: true },
        ],
      },
    ],
  },
  "2. Getting Started": {
    description: "create-next-app initializer and rendering strategies (SSR, SPA, CSR, SSG).",
    groups: [
      {
        topics: [
          { id: "next-create-app", name: "create-next-app", desc: "Interactive CLI bootstrapper for Next.js projects", isRecommended: true },
          { id: "next-render-strategies", name: "Rendering Strategies (SSR / SPA / CSR / SSG)", desc: "Server-side, static site, and client-side rendering modes", isRecommended: true },
        ],
      },
    ],
  },
  "3. Routing": {
    description: "Next.js Routing Basics, Pages vs App Router, Layouts, Streaming, Error States, and Routing Patterns.",
    groups: [
      {
        groupName: "Router Architecture",
        topics: [
          { id: "next-routing-basics", name: "Next.js Routing Basics", desc: "File-system based routing fundamentals", isRecommended: true },
          { id: "next-types-routers", name: "Types of routers (Pages vs App Router)", desc: "Legacy Pages Router vs modern React Server Components App Router", isRecommended: true },
          { id: "next-why-app-router", name: "Why use App Router?", desc: "Server components, nested layouts, streaming, and co-located loading states", isRecommended: true },
          { id: "next-routing-terms", name: "Routing Terminology", desc: "Tree, Subtree, Root Segment, and Path segments", isRecommended: true },
        ],
      },
      {
        groupName: "Layouts & Advanced Routing Patterns",
        topics: [
          { id: "next-rendering-pages", name: "Rendering Pages", desc: "page.tsx routing entrypoints", isRecommended: true },
          { id: "next-layouts-templates", name: "Layouts and Templates", desc: "Shared UI wrappers (layout.tsx) vs non-preserved templates (template.tsx)", isRecommended: true },
          { id: "next-loading-streaming", name: "Loading and Streaming", desc: "loading.tsx fallbacks and React Suspense UI streaming", isRecommended: true },
          { id: "next-error-states", name: "Error States", desc: "error.tsx error boundaries and global-error.tsx", isRecommended: true },
          { id: "next-routing-patterns", name: "Routing Patterns (Parallel & Intercepting Routes)", desc: "@folder parallel slots and (..) intercepting modals", isRecommended: true },
        ],
      },
    ],
  },
  "4. Structuring Routes": {
    description: "API Endpoints (Static/Dynamic, Caching, Streaming, Redirects), Middleware, and Internationalization.",
    groups: [
      {
        topics: [
          { id: "next-api-endpoints", name: "API Endpoints (Route Handlers)", desc: "route.ts HTTP handlers for GET, POST, PUT, DELETE with caching and streaming", isRecommended: true },
          { id: "next-middleware", name: "Middleware (Route Matcher / Cookies / Setting Headers)", desc: "Edge middleware intercepting requests before completion", isRecommended: true },
          { id: "next-i18n", name: "Internationalization", desc: "Locale subpath routing and multi-language content translation", isRecommended: true },
        ],
      },
    ],
  },
  "5. Working with data": {
    description: "Fetching Locations, Data Fetching Patterns, Server Actions, and Caching Data.",
    groups: [
      {
        groupName: "Fetching Locations & Patterns",
        topics: [
          { id: "next-fetch-locations", name: "Fetching Locations (Client vs Server)", desc: "Fetching data directly in Server Components vs SWR/React Query in Client", isRecommended: true },
          { id: "next-fetch-patterns", name: "Data Fetching Patterns", desc: "Parallel vs Sequential fetching and Preloading Data", isRecommended: true },
          { id: "next-sensitive-data", name: "Handling Sensitive Data", desc: "Keeping API tokens secret with server-only packages", isRecommended: true },
          { id: "next-server-actions", name: "Server Actions", desc: "Asynchronous server functions called directly from client forms", isRecommended: true },
        ],
      },
      {
        groupName: "Caching & Revalidation",
        topics: [
          { id: "next-caching-data", name: "Caching Data", desc: "Next.js Data Cache, Request Memoization, and Full Route Cache", isRecommended: true },
          { id: "next-fetch-memo", name: "Memoization in Fetch", desc: "Automatic duplicate request deduping during rendering", isRecommended: true },
          { id: "next-react-cache", name: "React Cache", desc: "cache() wrapper for non-fetch data request deduping", isRecommended: true },
          { id: "next-reval-cached", name: "Revalidating Cached Data", desc: "Time-based (revalidatePath) and tag-based (revalidateTag) invalidation", isRecommended: true },
          { id: "next-reval-errors", name: "Revalidation Errors", desc: "Handling stale data fallback when revalidation fails", isRecommended: true },
        ],
      },
    ],
  },
  "6. Rendering & Runtimes": {
    description: "Client Rendered, Server Rendered, Composition, and Node.js vs Edge runtimes.",
    groups: [
      {
        topics: [
          { id: "next-rendering-modes", name: "Rendering (Client / Server / Composition)", desc: "'use client' boundary interleaving with Server Components", isRecommended: true },
          { id: "next-runtimes", name: "Runtimes and Types (Node.js vs Edge)", desc: "Full Node.js environment vs lightweight V8 Edge worker runtime", isRecommended: true },
        ],
      },
    ],
  },
  "7. Writing CSS": {
    description: "Ways to Write CSS: Global CSS, CSS Modules, Tailwind CSS, Sass, and CSS in JS.",
    groups: [
      {
        topics: [
          { id: "next-css-ways", name: "Ways to Write CSS", desc: "Global CSS, CSS Modules, Tailwind CSS, Sass, and CSS in JS", isRecommended: true },
        ],
      },
    ],
  },
  "8. Optimizations": {
    description: "Images, Videos, Fonts, Metadata, Package Bundling, Lazy Loading, Analytics, OpenTelemetry, and Memory Usage.",
    groups: [
      {
        topics: [
          { id: "next-opt-assets", name: "Assets & Resource Optimizations", desc: "next/image, next/font, and video player optimizations", isRecommended: true },
          { id: "next-opt-metadata", name: "Metadata & SEO", desc: "Dynamic metadata generation, OpenGraph images, and sitemaps", isRecommended: true },
          { id: "next-opt-bundling", name: "Package Bundling & Lazy Loading", desc: "Tree shaking, dynamic() imports, and bundle analyzer", isRecommended: true },
          { id: "next-opt-analytics", name: "Analytics, Instrumentation & OpenTelemetry", desc: "Vercel Web Vitals and OpenTelemetry tracing", isRecommended: true },
          { id: "next-opt-memory", name: "Memory Usage & Third Party Libraries", desc: "Optimizing memory footprints and @next/third-parties scripts", isRecommended: true },
        ],
      },
    ],
  },
  "9. Configuring": {
    description: "Setting things Up (TypeScript, ESLint, Prettier), Environment Variables, Markdown/MDX, and Custom Server.",
    groups: [
      {
        topics: [
          { id: "next-cfg-tooling", name: "Setting things Up (TypeScript / ESLint / Prettier)", desc: "Compiler configuration and code formatting rules", isRecommended: true },
          { id: "next-cfg-env", name: "Environment Variables", desc: ".env, .env.local, and NEXT_PUBLIC_ client exposure rules", isRecommended: true },
          { id: "next-cfg-mdx", name: "Markdown and MDX", desc: "Rendering JSX components directly inside markdown files", isRecommended: true },
          { id: "next-cfg-custom-server", name: "Custom Server", desc: "Custom Express/Node.js server running Next.js programmatically", isAlternative: true },
        ],
      },
    ],
  },
  "10. Testing": {
    description: "Testing Frameworks (Vitest, Jest, Playwright, Cypress).",
    groups: [
      {
        topics: [
          { id: "next-test-fws", name: "Testing Frameworks (Vitest / Jest / Playwright / Cypress)", desc: "Unit testing React components and end-to-end browser flows", isRecommended: true },
        ],
      },
    ],
  },
  "11. Deployment": {
    description: "Preparing for Production and Deployment Options (Node.js Server, Docker Container, Static Export, Adapters).",
    groups: [
      {
        topics: [
          { id: "next-prep-prod", name: "Preparing for Production", desc: "next build optimization, environment audits, and security headers", isRecommended: true },
          { id: "next-deploy-options", name: "Deployment Options (Node.js / Docker / Static Export / Adapters)", desc: "Deploying to Vercel, Docker containers, AWS, or static hosting", isRecommended: true },
        ],
      },
    ],
  },
};

function getRightBranchesForNode(nodeName: string, roadmapId?: string): NodeTreeBranches {
  const normRid = roadmapId ? normalizeRoadmapId(roadmapId) : "";

  const matchInDict = (dict: Record<string, NodeTreeBranches>): NodeTreeBranches | null => {
    if (dict[nodeName]) return dict[nodeName];
    const strippedNum = nodeName.replace(/^\d+\.\s*/, "").trim();
    if (dict[strippedNum]) return dict[strippedNum];
    for (const [key, value] of Object.entries(dict)) {
      const cleanKey = key.replace(/^\d+\.\s*/, "").toLowerCase().trim();
      const cleanNode = nodeName.replace(/^\d+\.\s*/, "").toLowerCase().trim();
      if (cleanKey === cleanNode) {
        return value;
      }
    }
    return null;
  };

  // Prioritize dictionary of the currently viewed roadmap
  if (normRid === "c-programming") {
    const found = matchInDict(C_NODE_TREE_BRANCHES);
    if (found) return found;
  } else if (normRid === "cpp-programming") {
    const found = matchInDict(CPP_NODE_TREE_BRANCHES);
    if (found) return found;
  } else if (normRid === "python-mastery") {
    const found = matchInDict(PYTHON_NODE_TREE_BRANCHES);
    if (found) return found;
  } else if (normRid === "java-spring-boot") {
    const found = matchInDict(JAVA_NODE_TREE_BRANCHES);
    if (found) return found;
  } else if (normRid === "react-development") {
    const found = matchInDict(REACT_NODE_TREE_BRANCHES);
    if (found) return found;
  } else if (normRid === "nextjs-framework") {
    const found = matchInDict(NEXTJS_NODE_TREE_BRANCHES);
    if (found) return found;
  } else if (normRid === "nodejs-runtime") {
    const found = matchInDict(NODEJS_NODE_TREE_BRANCHES);
    if (found) return found;
  } else if (normRid === "devops-engineer") {
    const found = matchInDict(DEVOPS_NODE_TREE_BRANCHES);
    if (found) return found;
  }

  // Fallback checks across all dictionaries if roadmapId not specified
  const fallbackOrder = [
    C_NODE_TREE_BRANCHES,
    CPP_NODE_TREE_BRANCHES,
    PYTHON_NODE_TREE_BRANCHES,
    JAVA_NODE_TREE_BRANCHES,
    REACT_NODE_TREE_BRANCHES,
    NEXTJS_NODE_TREE_BRANCHES,
    NODEJS_NODE_TREE_BRANCHES,
    DEVOPS_NODE_TREE_BRANCHES,
  ];

  for (const dict of fallbackOrder) {
    const found = matchInDict(dict);
    if (found) return found;
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

  const [completedSubtopics, setCompletedSubtopics] = useState<Record<string, boolean>>({});

  const isCareerRoadmap = selectedRoadmap.category === "career";

  const toggleSubtopic = (subtopicId: string, nodeName: string) => {
    const isCurrentlyDone = !!completedSubtopics[subtopicId];
    const updatedSubtopics = { ...completedSubtopics, [subtopicId]: !isCurrentlyDone };
    setCompletedSubtopics(updatedSubtopics);

    const branchData = getRightBranchesForNode(nodeName, selectedRoadmap.id);
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



  const allNodes = selectedRoadmap.sections.flatMap((s) => s.nodes);
  const doneCount = allNodes.filter((n) => isNodeDone(selectedRoadmap.title, n, false)).length;
  const progressPct = Math.round((doneCount / allNodes.length) * 100);

  // Map roadmap sections into altitude mountain checkpoints
  const checkpoints: CheckpointItem[] = useMemo(() => {
    const rawCheckpoints = selectedRoadmap.sections.map((sec, idx) => {
      const secDoneCount = sec.nodes.filter((n) =>
        isNodeDone(selectedRoadmap.title, n, false)
      ).length;
      const isCompleted = sec.nodes.length > 0 && secDoneCount === sec.nodes.length;
      return {
        id: `cp-${idx}-${sec.title}`,
        index: idx,
        title: sec.title,
        subtitle: sec.subtitle,
        isCompleted,
        isCurrentTarget: false,
        nodesCount: sec.nodes.length,
        completedNodesCount: secDoneCount,
      };
    });

    const firstIncompleteIdx = rawCheckpoints.findIndex((c) => !c.isCompleted);
    return rawCheckpoints.map((item, idx) => ({
      ...item,
      isCurrentTarget:
        firstIncompleteIdx === -1 ? idx === rawCheckpoints.length - 1 : idx === firstIncompleteIdx,
    }));
  }, [selectedRoadmap, isNodeDone]);

  const handleToggleCheckpoint = (cp: CheckpointItem) => {
    const section = selectedRoadmap.sections[cp.index];
    if (!section) return;
    const shouldMarkDone = !cp.isCompleted;
    section.nodes.forEach((nodeName) => {
      const isDone = isNodeDone(selectedRoadmap.title, nodeName, false);
      if (shouldMarkDone && !isDone) {
        toggleNode(selectedRoadmap.title, nodeName);
      } else if (!shouldMarkDone && isDone) {
        toggleNode(selectedRoadmap.title, nodeName);
      }
    });
  };



  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto pb-16"
    >
      <PenguinRoadmapMountainExpedition
        roadmapTitle={selectedRoadmap.displayTitle || selectedRoadmap.title}
        roadmapId={selectedRoadmap.id}
        category={selectedRoadmap.category}
        ratings={selectedRoadmap.ratings}
        salary={selectedRoadmap.salary}
        checkpoints={checkpoints}
        progressPct={progressPct}
        isEnrolled={isEnrolled}
        onEnroll={handleEnrollClick}
        onBack={onBack}
        onToggleCheckpoint={handleToggleCheckpoint}
        onToggleSubtopic={toggleSubtopic}
        completedSubtopics={completedSubtopics}
        getSubtopicsForNode={getRightBranchesForNode}
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
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session?.user?.id !== userId) return;

        const { data } = await supabase
          .from("roadmap_progress")
          .select("roadmap_id, node_id, status")
          .eq("user_id", userId);

        if (data) {
          const map: Record<string, boolean> = {};
          data.forEach((row: any) => {
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
      {/* ── Roadmaps Hero Header Banner with Mountain & Penguin Expedition ── */}
      <PenguinRoadmapHeroBanner
        skillCount={SKILL_ROADMAPS.length}
        careerCount={CAREER_ROADMAPS.length}
        onExploreSkills={() => {
          const el = document.getElementById("skill-roadmaps-section");
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }}
        onExploreCareers={() => {
          const el = document.getElementById("career-roadmaps-section");
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }}
      />

      {/* ── Partner & Technology Logo Loop (Downside Main Banner) */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="py-3 px-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm"
      >
        <div className="flex items-center gap-5">
          <span className="text-[11px] font-black uppercase tracking-widest text-slate-400 shrink-0 hidden md:inline-block">
            ECOSYSTEM &amp; TOOLS
          </span>
          <div className="flex-1 overflow-hidden">
            <LogoLoop
              logos={[
                { node: <span className="font-extrabold text-xs tracking-wider text-slate-800 bg-slate-100 border border-slate-200/90 px-3 py-1.5 rounded-xl shadow-2xs">⚡ Python 3.12</span> },
                { node: <span className="font-extrabold text-xs tracking-wider text-[#00599C] bg-blue-50 border border-blue-200/90 px-3 py-1.5 rounded-xl shadow-2xs">⚙️ Modern C++20</span> },
                { node: <span className="font-extrabold text-xs tracking-wider text-[#087ea4] bg-cyan-50 border border-cyan-200/90 px-3 py-1.5 rounded-xl shadow-2xs">⚛️ React 19</span> },
                { node: <span className="font-extrabold text-xs tracking-wider text-slate-900 bg-slate-100 border border-slate-300 px-3 py-1.5 rounded-xl shadow-2xs">▲ Next.js 15</span> },
                { node: <span className="font-extrabold text-xs tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200/90 px-3 py-1.5 rounded-xl shadow-2xs">💚 Node.js</span> },
                { node: <span className="font-extrabold text-xs tracking-wider text-orange-600 bg-amber-50 border border-amber-200/90 px-3 py-1.5 rounded-xl shadow-2xs">☕ Java Spring Boot</span> },
                { node: <span className="font-extrabold text-xs tracking-wider text-sky-600 bg-sky-50 border border-sky-200/90 px-3 py-1.5 rounded-xl shadow-2xs">💻 Systems C</span> },
                { node: <span className="font-extrabold text-xs tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200/90 px-3 py-1.5 rounded-xl shadow-2xs">🚀 LeetCode Verified</span> },
                { node: <span className="font-extrabold text-xs tracking-wider text-purple-700 bg-purple-50 border border-purple-200/90 px-3 py-1.5 rounded-xl shadow-2xs">🧠 AI Career Assistant</span> },
                { node: <span className="font-extrabold text-xs tracking-wider text-teal-700 bg-teal-50 border border-teal-200/90 px-3 py-1.5 rounded-xl shadow-2xs">🛠️ Hands-on Sandbox</span> },
              ]}
              speed={75}
              logoHeight={32}
              gap={24}
              pauseOnHover
              scaleOnHover
              fadeOut
              fadeOutColor="#ffffff"
            />
          </div>
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
            className="glass roadmap-card card-morph rounded-2xl p-6 border border-indigo-500/30"
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
      <section id="skill-roadmaps-section" className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <BookOpen className="w-6 h-6 text-emerald-700 shrink-0" />
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                Skill Roadmaps
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-semibold ml-8">
              Select a core programming language or framework learning path.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {SKILL_ROADMAPS.map((item, idx) => {
            const Icon = item.icon;
            const itemColor = item.color || "#10b981";

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05, duration: 0.4 }}
                onClick={() => handleCardClick(item)}
                className="roadmap-card card-morph h-full cursor-pointer group"
              >
                <BorderGlow
                  edgeSensitivity={30}
                  glowColor="160 84 39"
                  backgroundColor="#ffffff"
                  borderRadius={28}
                  glowRadius={35}
                  glowIntensity={1.2}
                  coneSpread={25}
                  animated={false}
                  colors={[itemColor, '#10b981', '#6366f1']}
                  className="roadmap-card card-morph h-full p-6 shadow-sm hover:shadow-2xl border border-slate-200/90"
                >
                  <div className="flex flex-col justify-between h-full space-y-5">
                    <div>
                      {/* Top Bar Badges */}
                      <div className="flex items-center justify-between mb-4">
                        <div
                          className="w-14 h-14 rounded-2xl text-white flex items-center justify-center transition-transform duration-300 group-hover:scale-105 shadow-md"
                          style={{
                            background: `linear-gradient(135deg, ${itemColor}, ${itemColor}cc)`,
                            boxShadow: `0 6px 18px ${itemColor}40`,
                          }}
                        >
                          <Icon size={26} className="w-6 h-6 text-white" />
                        </div>

                        {enrolledIds.has(item.id) ? (
                          <span className="flex items-center gap-1 text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/90 text-emerald-700 shadow-xs">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Enrolled
                          </span>
                        ) : (
                          <button
                            onClick={(e) => handleEnrollRoadmap(item, e)}
                            className="flex items-center gap-1 text-[11px] font-bold px-3.5 py-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-600/20 hover:scale-105 transition-all z-10 cursor-pointer"
                          >
                            <GraduationCap className="w-3.5 h-3.5 text-white" /> Enroll
                          </button>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="text-lg font-extrabold text-slate-900 mb-1.5 group-hover:text-emerald-700 transition-colors leading-snug">
                        {item.title}
                      </h3>

                      {/* Subtitle */}
                      <p className="text-xs text-slate-500 leading-relaxed font-medium line-clamp-2">
                        {item.subtitle}
                      </p>
                    </div>

                    {/* Rich Metadata Section */}
                    <div className="space-y-3 pt-3 border-t border-slate-100">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-amber-600 bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                          ★ {item.ratings || "4.9 Rating"}
                        </span>
                        <span className="font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full text-[11px] shadow-2xs">
                          ⚡ {item.sections ? `${item.sections.length} Modules` : "20+ Modules"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap text-[11px]">
                        {item.salary && (
                          <span className="font-extrabold px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200/80 text-slate-800 shadow-2xs">
                            💼 {item.salary}
                          </span>
                        )}
                        {item.growth && (
                          <span className="font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/90 text-emerald-700 shadow-2xs">
                            📈 {item.growth}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </BorderGlow>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── SECTION 2: CAREER ROADMAPS */}
      <section id="career-roadmaps-section" className="space-y-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <Briefcase className="w-6 h-6 text-emerald-700 shrink-0" />
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              Career Roadmaps
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-semibold ml-8">
            Select a specialized career domain to launch your professional engineering journey.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {CAREER_ROADMAPS.map((item, idx) => {
            const Icon = item.icon;
            const itemColor = item.color || "#0284c7";

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05, duration: 0.4 }}
                onClick={() => handleCardClick(item)}
                className="roadmap-card card-morph h-full cursor-pointer group"
              >
                <BorderGlow
                  edgeSensitivity={30}
                  glowColor="217 91 60"
                  backgroundColor="#ffffff"
                  borderRadius={28}
                  glowRadius={35}
                  glowIntensity={1.2}
                  coneSpread={25}
                  animated={false}
                  colors={[itemColor, '#38bdf8', '#6366f1']}
                  className="roadmap-card card-morph h-full p-6 shadow-sm hover:shadow-2xl border border-slate-200/90"
                >
                  <div className="flex flex-col justify-between h-full space-y-5">
                    <div>
                      {/* Top Bar Badges */}
                      <div className="flex items-center justify-between mb-4">
                        <div
                          className="w-14 h-14 rounded-2xl text-white flex items-center justify-center transition-transform duration-300 group-hover:scale-105 shadow-md"
                          style={{
                            background: `linear-gradient(135deg, ${itemColor}, ${itemColor}cc)`,
                            boxShadow: `0 6px 18px ${itemColor}40`,
                          }}
                        >
                          <Icon className="w-6 h-6 text-white" />
                        </div>

                        {enrolledIds.has(item.id) ? (
                          <span className="flex items-center gap-1 text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/90 text-emerald-700 shadow-xs">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Enrolled
                          </span>
                        ) : (
                          <button
                            onClick={(e) => handleEnrollRoadmap(item, e)}
                            className="flex items-center gap-1 text-[11px] font-bold px-3.5 py-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-600/20 hover:scale-105 transition-all z-10 cursor-pointer"
                          >
                            <GraduationCap className="w-3.5 h-3.5 text-white" /> Enroll
                          </button>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="text-lg font-extrabold text-slate-900 mb-1.5 group-hover:text-sky-700 transition-colors leading-snug">
                        {item.title}
                      </h3>

                      {/* Subtitle */}
                      <p className="text-xs text-slate-500 leading-relaxed font-medium line-clamp-2">
                        {item.subtitle}
                      </p>
                    </div>

                    {/* Rich Metadata Section */}
                    <div className="space-y-3 pt-3 border-t border-slate-100">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-amber-600 bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                          ★ {item.ratings || "4.9 Rating"}
                        </span>
                        <span className="font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full text-[11px] shadow-2xs">
                          ⚡ {item.sections ? `${item.sections.length} Modules` : "18+ Modules"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap text-[11px]">
                        {item.salary && (
                          <span className="font-extrabold px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200/80 text-slate-800 shadow-2xs">
                            💼 {item.salary}
                          </span>
                        )}
                        {item.growth && (
                          <span className="font-extrabold px-2.5 py-0.5 rounded-full bg-sky-50 border border-sky-200/90 text-sky-700 shadow-2xs">
                            📈 {item.growth}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </BorderGlow>
              </motion.div>
            );
          })}
        </div>
      </section>
    </motion.div>
  );
}
