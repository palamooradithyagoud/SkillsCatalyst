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
} from "lucide-react";
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from "framer-motion";
import { generateRoadmap, RoadmapData } from "@/lib/api";
import PythonGrowthCanvas from "@/components/PythonGrowthCanvas";
import SkillDetailDrawer from "@/components/SkillDetailDrawer";
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
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
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
        title: "1. Introduction & Setting Up",
        subtitle: "Understand C overview, C vs Assembly, C vs C++, environment setup, and running your first program.",
        nodes: [
          "Introduction (C vs Assembly / C vs C++)",
          "Installing C & Toolchains",
          "Running Your First C Program",
          "Code Editors & IDEs (VSCode / Vim / NVim)",
        ],
      },
      {
        title: "2. Variables, Data Types & Qualifiers",
        subtitle: "Master variable declaration vs definition, basic types, fixed-width types, casting, and type qualifiers.",
        nodes: [
          "Variables (Declaration vs Definition)",
          "Initialization & Printing Variables",
          "Basic Data Types (int / float / double / char)",
          "Fixed-Width Integers & Booleans",
          "Type Conversion & Casting",
          "Type Qualifiers (const / volatile / restrict / _Atomic)",
        ],
      },
      {
        title: "3. Operators, Control Flow & Functions",
        subtitle: "Understand operators, control flow statements, main function, scopes, recursion, and variadic functions.",
        nodes: [
          "Operators (Arithmetic / Comparison / Logical / Ternary / Bitwise)",
          "Control Flow (if-else / switch)",
          "Loops (for / while / do-while / break / continue)",
          "main Function & Command-Line Arguments",
          "Variable Scopes",
          "Recursive & Variadic Functions",
        ],
      },
      {
        title: "4. Pointers & Memory Model",
        subtitle: "Master memory layout, stack vs heap, pointer syntax, null/void pointers, and pointer arithmetic.",
        nodes: [
          "Memory Model (Stack vs Heap & Lifetimes)",
          "Pointer Basics & Syntax",
          "Null Pointers & void Pointers",
          "Pointer Arithmetic",
        ],
      },
      {
        title: "5. User-Defined Types & Data Structures",
        subtitle: "Work with structs, typedefs, unions, enums, arrays, strings, dynamic arrays, linked lists, and queues.",
        nodes: [
          "Structs & Typedef",
          "Unions & Enums",
          "Arrays & Dynamic Arrays",
          "Strings & Text Processing",
          "Linked Lists, Hash Maps & Ring Buffers",
        ],
      },
      {
        title: "6. Dynamic Memory & Safety",
        subtitle: "Manage memory with malloc, calloc, realloc, and free, while preventing memory leaks and buffer overflows.",
        nodes: [
          "Dynamic Memory Allocation (malloc / calloc / realloc / free)",
          "Memory Leakage & Valgrind",
          "Dangling Pointers & Undefined Behavior",
          "Buffer Overflow Prevention",
        ],
      },
      {
        title: "7. Codebase Structure & Error Handling",
        subtitle: "Structure C projects with headers and linkage, and handle runtime errors with errno and setjmp/longjmp.",
        nodes: [
          "Header Files & Code Structure",
          "Linkage & Storage Classes (static / extern)",
          "Error Handling (errno & Exit Codes)",
          "Non-Local Jumps (setjmp / longjmp)",
        ],
      },
      {
        title: "8. File I/O & C Standard Library",
        subtitle: "Perform file I/O operations and utilize standard C header libraries for math, text, time, and signals.",
        nodes: [
          "Streams & File Pointers (stdio.h)",
          "Binary vs Text File Mode",
          "Data Utilities & Text Processing (stdlib.h / string.h / ctype.h)",
          "Math, Time & Diagnostics (math.h / time.h / assert.h)",
          "OS & Signal Interfaces (signal.h)",
        ],
      },
      {
        title: "9. Preprocessor, Compilers & Build Systems",
        subtitle: "Master macros, conditional compilation, GCC/Clang optimization, GNU Make, CMake, and vcpkg/Conan.",
        nodes: [
          "Preprocessor Macros & Conditional Compilation",
          "Compilers & Optimization (GCC / Clang / TinyCC)",
          "Symbol Tables, Linking & ABI",
          "Build Systems (GNU Make / CMake / Ninja / Meson)",
          "C Package Managers (vcpkg / Conan)",
        ],
      },
      {
        title: "10. Debugging, Testing, Idioms & C Standards",
        subtitle: "Debug with GDB/Valgrind/ASan, run unit tests, apply C design patterns, pthreads, and learn C standards.",
        nodes: [
          "Debugging (GDB / LLDB / Valgrind / ASan / LSan)",
          "Testing Frameworks (assert.h / Unity / CMocka / Check)",
          "Idioms (Function Pointers / Callbacks / Opaque Pointers / OOP C)",
          "Concurrency & Processes (POSIX Threads / Mutexes / IPC)",
          "C Standards (C89 / C99 / C11 / C17 / C23)",
        ],
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
        title: "1. Introduction & Setting Up",
        subtitle: "Understand C++ overview, why use C++, C vs C++, environment setup, and running your first program.",
        nodes: [
          "Introduction to Language (What is C++ / Why C++ / C vs C++)",
          "Setting Up Environment (Installing C++ / IDEs / VSCode)",
          "Running Your First C++ Program",
        ],
      },
      {
        title: "2. Basic Operations, Data Types & Control Flow",
        subtitle: "Master operators, control flow statements, data types, type casting, and language concepts.",
        nodes: [
          "Basic Operations (Arithmetic / Logical / Bitwise Operators)",
          "Control Flow & Statements (if-else / switch / goto / loops)",
          "Data Types (Static vs Dynamic Typing & RTTI)",
          "Language Concepts (auto / Type Casting static_cast & dynamic_cast)",
          "Undefined Behavior (UB), ADL & Name Mangling",
        ],
      },
      {
        title: "3. Functions, Overloading & Lambdas",
        subtitle: "Master function overloading, operator overloading, lambdas, and static polymorphism.",
        nodes: [
          "Functions & Function Overloading",
          "Operator Overloading",
          "Lambda Expressions & Functional Tools",
          "Static Polymorphism",
        ],
      },
      {
        title: "4. Pointers, References & Memory Management",
        subtitle: "Understand references, memory model, raw pointers, new/delete, memory leaks, and smart pointers.",
        nodes: [
          "Pointers & References (References / Memory Model / Object Lifetimes)",
          "Raw Pointers & New/Delete Operators",
          "Memory Leakage Prevention",
          "Smart Pointers (unique_ptr / shared_ptr / weak_ptr)",
        ],
      },
      {
        title: "5. Structuring Codebase & Object Oriented C++",
        subtitle: "Organize files with headers, namespaces, classes, virtual methods, inheritance, and Rule of 0/3/5.",
        nodes: [
          "Structuring Codebase (Headers & CPP Files / Forward Declarations / Namespaces)",
          "Structures and Classes",
          "Object Oriented Programming & Dynamic Polymorphism (Virtual Methods & VTables)",
          "Inheritance (Multiple & Diamond Inheritance)",
          "Rule of Zero, Three, and Five",
        ],
      },
      {
        title: "6. Templates & Generic Programming",
        subtitle: "Harness C++ templates, full/partial specialization, variadic templates, type traits, and SFINAE.",
        nodes: [
          "Templates & Template Specialization (Full & Partial)",
          "Variadic Templates",
          "Type Traits & SFINAE",
        ],
      },
      {
        title: "7. Standard Library (STL) & Exception Handling",
        subtitle: "Master STL containers, algorithms, multithreading, and structured exception handling.",
        nodes: [
          "STL Containers (vector / map / set / deque)",
          "STL Algorithms & Date/Time",
          "Multithreading & Concurrency",
          "Exception Handling (Exceptions / Exit Codes / Access Violations)",
        ],
      },
      {
        title: "8. C++ Idioms & Language Standards",
        subtitle: "Apply C++ design idioms (RAII / Pimpl / CRTP) and understand C++11 through C++23 standards.",
        nodes: [
          "C++ Idioms (RAII / Pimpl / CRTP / Copy-and-Swap / Erase-Remove)",
          "Non-Copyable & Non-Moveable Idioms",
          "C++ Standards Evolution (C++11 / C++14 / C++17 / C++20 / C++23)",
        ],
      },
      {
        title: "9. Compilers, Debuggers & Build Systems",
        subtitle: "Understand compiler stages, GDB/WinDbg debugging, CMake, Makefiles, and package managers.",
        nodes: [
          "Compilers & Compiler Stages (GCC / Clang++ / MSVC / MinGW)",
          "Debuggers & Symbols (GDB / WinDbg / Debugger Messages)",
          "Build Systems (CMake / Makefile / Ninja)",
          "Package Managers (vcpkg / Conan / Spack / NuGet)",
        ],
      },
      {
        title: "10. Libraries & Frameworks",
        subtitle: "Utilize popular C++ libraries like Boost, POCO, protobuf, gRPC, fmt, and testing/UI frameworks.",
        nodes: [
          "Popular Libraries (Boost / POCO / protobuf / gRPC / fmt / ranges_v3 / OpenCV)",
          "Testing & UI Frameworks (gtest / gmock / Catch2 / Qt / PyTorch C++)",
        ],
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
    icon: Layers,
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
        subtitle: "Master fundamental syntax, variables, data types, control flow, functions, and error handling.",
        nodes: [
          "Basic Syntax",
          "Variables and Data Types",
          "Operators",
          "Working with Strings",
          "Conditionals",
          "Loops",
          "Lists, Tuples, Sets",
          "Dictionaries",
          "Type Casting",
          "Functions, Builtin Functions",
          "Exceptions",
          "Comments & Type Annotations",
        ],
      },
      {
        title: "2. Data Structures & Algorithms",
        subtitle: "Implement computer science fundamentals, data structures, recursion, and search algorithms in Python.",
        nodes: [
          "Arrays and Linked Lists",
          "HashMaps",
          "Heaps, Stacks and Queues",
          "Binary Search Tree",
          "Recursion",
          "Sorting Algorithms",
        ],
      },
      {
        title: "3. Core & Advanced Language Concepts",
        subtitle: "Understand Python modules, variable scoping, decorators, iterators, generators, and regex.",
        nodes: [
          "Builtin & Custom Modules",
          "Variable Scope",
          "List Comprehensions",
          "Generator Expressions",
          "Lambdas",
          "Decorators",
          "Iterators",
          "Context Manager",
          "Regular Expressions",
          "Paradigms",
        ],
      },
      {
        title: "4. Object Oriented Programming (OOP)",
        subtitle: "Design object-oriented systems with classes, methods, inheritance hierarchies, and encapsulation.",
        nodes: [
          "Classes",
          "Methods",
          "Inheritance",
          "Encapsulation",
        ],
      },
      {
        title: "5. Package Managers & Environments",
        subtitle: "Manage dependencies, virtual environments, and project configurations using modern tooling.",
        nodes: [
          "PyPI & Pip",
          "Poetry, Conda, uv & pdm",
          "pyproject.toml & Configuration",
          "Common Packages",
          "Environments (virtualenv / pyenv / Pipenv)",
        ],
      },
      {
        title: "6. Static Typing & Code Formatting",
        subtitle: "Enforce static type safety and maintain code quality with modern linters and formatters.",
        nodes: [
          "Static Typing (typing / mypy / pyright / pyre)",
          "Pydantic Data Validation",
          "Code Formatting (black / ruff / yapf)",
        ],
      },
      {
        title: "7. Concurrency & Asynchronous Programming",
        subtitle: "Build high-throughput apps with AsyncIO, Threading, Multiprocessing, and GIL understanding.",
        nodes: [
          "Multiprocessing",
          "Asynchrony & AsyncIO",
          "Threading",
          "Global Interpreter Lock (GIL)",
        ],
      },
      {
        title: "8. File Handling & Documentation",
        subtitle: "Perform file I/O operations, glob pattern matching, and write Sphinx documentation.",
        nodes: [
          "File Handling",
          "glob Pattern Matching",
          "Sphinx & Documentation",
        ],
      },
      {
        title: "9. Testing & Quality Assurance",
        subtitle: "Write automated tests and test suites using Python's standard and ecosystem testing tools.",
        nodes: [
          "unittest / pyUnit",
          "doctest",
          "pytest",
          "tox",
        ],
      },
      {
        title: "10. Learn a Web Framework",
        subtitle: "Build scalable web applications and microservices using modern synchronous and async frameworks.",
        nodes: [
          "FastAPI",
          "Django",
          "Flask",
          "Sanic, Tornado & gevent",
          "aiohttp & Pyramid",
          "Plotly Dash",
        ],
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
    icon: Atom,
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
    icon: Globe,
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
      { phase: "PHASE 1: FRONTEND BUILDER", title: "Frontend Builder", description: "HTML/CSS & React fundamentals", color: "#818cf8" },
      { phase: "PHASE 2: BACKEND INTEGRATOR", title: "Backend Integrator", description: "FastAPI / Node.js & Supabase PostgreSQL", color: "#6366f1" },
      { phase: "PHASE 3: SYSTEM DESIGNER", title: "System Designer", description: "API Rate limiting, Caching & Microservices", color: "#4f46e5" },
      { phase: "PHASE 4: FULLSTACK SAAS GOD", title: "Fullstack SaaS God", description: "Production deployments, CI/CD & Scaling", color: "#4338ca" },
    ],
    sections: [
      {
        title: "Primary Foundation",
        subtitle: "Core web fundamentals and language syntax.",
        nodes: ["HTML5 & Modern CSS", "TypeScript Essentials", "Git & Version Control"],
      },
      {
        title: "Fast Track Acceleration",
        subtitle: "Frontend & Backend frameworks with modern databases.",
        nodes: ["React 19 & Next.js 16", "FastAPI & Python", "PostgreSQL & Supabase"],
      },
      {
        title: "Interview Preparation",
        subtitle: "DSA problem solving & system design concepts.",
        nodes: ["Arrays & Hashing", "API Rate Limiting Design", "Database Indexing"],
      },
      {
        title: "Applied Capstone Project",
        subtitle: "End-to-end production application deployments.",
        nodes: ["Full-Stack SaaS Platform", "CI/CD Pipeline Automation"],
      },
      {
        title: "Advanced Architecture",
        subtitle: "High-concurrency microservices and performance tuning.",
        nodes: ["Microservices Architecture", "Redis Caching & Queue Workers"],
      },
    ],
  },
  {
    id: "aiml-engineer",
    category: "career",
    number: 2,
    title: "2. AI/ML Engineer",
    displayTitle: "AI/ML Engineer Track",
    subtitle: "Here's a timeline of the Artificial Intelligence & ML path.",
    timelineSubtitle: "Here's a timeline of the Artificial Intelligence & ML path.",
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
      { phase: "PHASE 1: MATH & DATA NOVICE", title: "Math & Data Novice", description: "Python, NumPy & Linear Algebra", color: "#c084fc" },
      { phase: "PHASE 2: DEEP LEARNING CRAFTER", title: "Deep Learning Crafter", description: "PyTorch & Convolutional Neural Networks", color: "#a855f7" },
      { phase: "PHASE 3: LLM RAG ENGINEER", title: "LLM RAG Engineer", description: "Transformers, RAG & Vector Embeddings", color: "#9333ea" },
      { phase: "PHASE 4: AGENTIC MLOPS GOD", title: "Agentic MLOps God", description: "vLLM, LoRA Fine-tuning & Agentic AI", color: "#7e22ce" },
    ],
    sections: [
      {
        title: "Primary Foundation",
        subtitle: "Python math & data analysis fundamentals.",
        nodes: ["Python for AI", "NumPy & Pandas Dataframes", "Linear Algebra & Calculus"],
      },
      {
        title: "Fast Track Acceleration",
        subtitle: "Classical ML & Deep Learning neural architectures.",
        nodes: ["Scikit-Learn Classifiers", "PyTorch Fundamentals", "Convolutional Networks (CNNs)"],
      },
      {
        title: "Interview Preparation",
        subtitle: "ML System Design & Transformer models.",
        nodes: ["LLM Architecture", "RAG Pipeline Design", "Vector Embeddings & Pinecone"],
      },
      {
        title: "Applied Capstone Project",
        subtitle: "AI Agents & Autonomous Agentic Workflows.",
        nodes: ["Groq LLM Integration", "Agentic RAG Engine"],
      },
      {
        title: "Advanced Architecture",
        subtitle: "Model fine-tuning & quantization techniques.",
        nodes: ["LoRA / QLoRA Tuning", "vLLM Production Serving"],
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
      { phase: "PHASE 1: SQL QUERY WHIZ", title: "SQL Query Whiz", description: "Joins, Window Functions & Aggregations", color: "#2dd4bf" },
      { phase: "PHASE 2: PANDAS WRANGLER", title: "Pandas Wrangler", description: "Python Data Cleaning & Seaborn Plots", color: "#14b8a6" },
      { phase: "PHASE 3: DASHBOARD ARTIST", title: "Dashboard Artist", description: "PowerBI & Tableau Interactive Dashboards", color: "#0d9488" },
      { phase: "PHASE 4: EXECUTIVE STORYTELLER", title: "Executive Storyteller", description: "A/B Testing, PDF Reports & Business Strategy", color: "#0f766e" },
    ],
    sections: [
      {
        title: "Primary Foundation",
        subtitle: "SQL queries, joins and window functions.",
        nodes: ["SQL Joins & Aggregations", "Window Functions (RANK)", "Subqueries & CTEs", "Database Normalization"],
      },
      {
        title: "Data Wrangling & Python",
        subtitle: "Pandas manipulation and exploratory data analysis.",
        nodes: ["Pandas Data Wrangling", "Data Cleaning & Imputation", "Matplotlib & Seaborn", "Exploratory Analysis"],
      },
      {
        title: "Business Intelligence",
        subtitle: "Dashboards and executive reporting with PowerBI/Tableau.",
        nodes: ["PowerBI Dashboard Design", "Tableau Calculated Fields", "Interactive Filtering", "DAX Formulas"],
      },
      {
        title: "Applied Statistics",
        subtitle: "Hypothesis testing and A/B testing methodologies.",
        nodes: ["Hypothesis Testing (t-test)", "A/B Testing Methodology", "Correlation Analysis", "Probability Distributions"],
      },
      {
        title: "Executive Storytelling",
        subtitle: "Automated data insights and KPI scorecards.",
        nodes: ["Automated Reports", "Executive KPI Scorecards", "Data Storytelling"],
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
      { phase: "PHASE 1: LINUX AUTOMATOR", title: "Linux Automator", description: "Bash scripting & SSH administration", color: "#818cf8" },
      { phase: "PHASE 2: DOCKER CAPTAIN", title: "Docker Captain", description: "Container optimization & Docker Compose", color: "#6366f1" },
      { phase: "PHASE 3: TERRAFORM PROVISIONER", title: "Terraform Provisioner", description: "Infrastructure as Code & CI/CD Pipelines", color: "#4f46e5" },
      { phase: "PHASE 4: KUBERNETES COMMANDER", title: "Kubernetes Commander", description: "K8s Clusters, Helm Charts & Prometheus", color: "#4338ca" },
    ],
    sections: [
      {
        title: "Primary Foundation",
        subtitle: "Linux administration & shell scripting.",
        nodes: ["Bash Scripting", "Linux Admin & Processes", "SSH & Firewall Rules", "Networking (IP/Subnets)"],
      },
      {
        title: "Containerization",
        subtitle: "Docker images & multi-container compose orchestration.",
        nodes: ["Docker Image Optimization", "Docker Compose", "Container Security Scan"],
      },
      {
        title: "CI/CD Pipelines",
        subtitle: "Automated build and continuous delivery pipelines.",
        nodes: ["GitHub Actions Workflows", "Automated Testing Sprints", "Docker Hub / ECR Registry"],
      },
      {
        title: "Infrastructure as Code",
        subtitle: "Cloud provisioning with Terraform and Ansible.",
        nodes: ["Terraform AWS Provisioning", "Ansible Config Mgmt", "Cloud Security IAM"],
      },
      {
        title: "Kubernetes & Monitoring",
        subtitle: "Kubernetes cluster orchestration & Prometheus alerting.",
        nodes: ["Kubernetes Pods & Deploy", "Helm Charts", "Prometheus & Grafana", "Log Aggregation"],
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
];

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
  const [activeDrawerSkill, setActiveDrawerSkill] = useState<{
    name: string;
    category: string;
    roadmapTitle: string;
  } | null>(null);

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
          <div className="hidden sm:flex items-center justify-center p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-2xl relative w-full lg:w-72 h-44 shrink-0 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent pointer-events-none" />
            <div className="text-center space-y-2 relative z-10">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-lg shadow-indigo-500/20">
                <selectedRoadmap.icon className="w-7 h-7" />
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

          {/* Start Learning Button */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="px-6 py-3 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 shrink-0"
            style={{
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
            }}
          >
            <span>{doneCount > 0 ? "Continue Learning" : "Start Learning"}</span>
            <Play className="w-4 h-4 fill-white" />
          </motion.button>
        </div>

        {/* Market Demand & Salary Row */}
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

                  {/* Nodes Grid Pills */}
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    {section.nodes.map((nodeName, nIdx) => {
                      const done = isNodeDone(selectedRoadmap.title, nodeName, false);

                      return (
                        <motion.button
                          key={nIdx}
                          whileHover={{ scale: 1.02, y: -1 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() =>
                            setActiveDrawerSkill({
                              name: nodeName,
                              category: section.title.toUpperCase(),
                              roadmapTitle: selectedRoadmap.displayTitle,
                            })
                          }
                          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs font-bold border transition-all duration-200 shadow-sm ${
                            done
                              ? "bg-indigo-600/20 border-indigo-500 text-white shadow-indigo-500/20"
                              : "bg-[#131b2e]/80 border-slate-800 hover:border-slate-600 text-slate-300 hover:text-white"
                          }`}
                        >
                          {/* Icon inside node pill */}
                          <div
                            className={`p-1 rounded-lg ${
                              done ? "bg-indigo-500 text-white" : "bg-slate-800 text-slate-400"
                            }`}
                          >
                            <Terminal className="w-3.5 h-3.5" />
                          </div>

                          <span>{nodeName}</span>

                          {/* Status badge pill */}
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-medium transition-colors ${
                              done
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                                : "bg-slate-800/80 text-slate-400 border border-slate-700/60"
                            }`}
                          >
                            {done ? "Completed" : "Pending"}
                          </span>
                        </motion.button>
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

      {/* Skill Detail Drawer Overlay */}
      <SkillDetailDrawer
        isOpen={!!activeDrawerSkill}
        onClose={() => setActiveDrawerSkill(null)}
        skillName={activeDrawerSkill?.name || ""}
        categoryName={activeDrawerSkill?.category || "SOFTWARE ENGINEERING CORE"}
        roadmapTitle={activeDrawerSkill?.roadmapTitle || selectedRoadmap.displayTitle}
        status={
          activeDrawerSkill && isNodeDone(selectedRoadmap.title, activeDrawerSkill.name, false)
            ? "completed"
            : "pending"
        }
        onStatusChange={(newStatus) => {
          if (activeDrawerSkill) {
            const isDoneCurrently = isNodeDone(selectedRoadmap.title, activeDrawerSkill.name, false);
            if ((newStatus === "completed" && !isDoneCurrently) || (newStatus !== "completed" && isDoneCurrently)) {
              toggleNode(selectedRoadmap.title, activeDrawerSkill.name);
            }
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

  // Hydrate completed roadmap nodes from Supabase DB on mount and auto-open target roadmap if set
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      try {
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

  const toggleNode = async (roadmapKey: string, nodeName: string) => {
    const key = `${roadmapKey}-${nodeName}`;
    const isCurrentlyDone = completedState[key] ?? false;
    const newDoneState = !isCurrentlyDone;

    setCompletedState((prev) => ({ ...prev, [key]: newDoneState }));

    if (!userId) return;

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
  };

  const isNodeDone = (roadmapKey: string, nodeName: string, defaultDone = false) => {
    const key = `${roadmapKey}-${nodeName}`;
    return completedState[key] !== undefined ? completedState[key] : defaultDone;
  };

  const handleCardClick = async (roadmap: PresetRoadmap) => {
    setSelectedRoadmap(roadmap);
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
      } catch (e) {
        console.warn("Failed to save active roadmap locally:", e);
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
      } catch (e) {
        console.warn("Failed to mark roadmap started in Supabase:", e);
      }
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
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
                  {/* Icon Badge */}
                  <div
                    className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-105 ${item.bgBadge} border ${item.borderBadge} ${item.textBadge}`}
                  >
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
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
                  {/* Icon Badge */}
                  <div
                    className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-105 ${item.bgBadge} border ${item.borderBadge} ${item.textBadge}`}
                  >
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
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
