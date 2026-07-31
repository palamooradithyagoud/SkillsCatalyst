"use client";

import React, { useState } from "react";
import {
  X,
  BookOpen,
  Info,
  HelpCircle,
  CheckCircle2,
  Clock,
  Circle,
  ExternalLink,
  Code2,
  Sparkles,
  Zap,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export type SkillStatus = "pending" | "in_progress" | "completed";

interface SkillDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  skillName: string;
  categoryName?: string;
  roadmapTitle?: string;
  status: SkillStatus;
  onStatusChange: (newStatus: SkillStatus) => void;
}

function getOfficialPythonDocLink(skillName: string): { url: string; title: string; description: string } {
  const nameLower = skillName.toLowerCase();

  if (nameLower.includes("basic syntax") || nameLower.includes("comment")) {
    return {
      url: "https://docs.python.org/3/tutorial/introduction.html",
      title: "Python Official Docs: Informal Introduction to Python Syntax",
      description: "Official Python documentation on basic syntax, comments, numbers, and strings.",
    };
  }
  if (nameLower.includes("variable") || nameLower.includes("data type") || nameLower.includes("type casting")) {
    return {
      url: "https://docs.python.org/3/library/stdtypes.html",
      title: "Python Official Docs: Built-in Data Types & Type Casting",
      description: "Official Python standard library specification for numeric, sequence, and mapping types.",
    };
  }
  if (nameLower.includes("operator")) {
    return {
      url: "https://docs.python.org/3/reference/expressions.html",
      title: "Python Official Docs: Expressions & Operators",
      description: "Official reference for Python arithmetic, bitwise, comparison, and logical operators.",
    };
  }
  if (nameLower.includes("string")) {
    return {
      url: "https://docs.python.org/3/library/stdtypes.html#text-sequence-type-str",
      title: "Python Official Docs: Text Sequence Type (str)",
      description: "Official reference manual for Python string methods, slicing, and formatting.",
    };
  }
  if (nameLower.includes("conditional") || nameLower.includes("loop")) {
    return {
      url: "https://docs.python.org/3/tutorial/controlflow.html",
      title: "Python Official Docs: More Control Flow Tools (if/loops)",
      description: "Official tutorial on conditional statements (if/elif/else) and loop constructs (for/while).",
    };
  }
  if (nameLower.includes("list") || nameLower.includes("tuple") || nameLower.includes("set")) {
    return {
      url: "https://docs.python.org/3/tutorial/datastructures.html",
      title: "Python Official Docs: Data Structures (Lists, Tuples, Sets)",
      description: "Official Python tutorial on sequence data structures, list methods, and sets.",
    };
  }
  if (nameLower.includes("dict") || nameLower.includes("hashmap")) {
    return {
      url: "https://docs.python.org/3/tutorial/datastructures.html#dictionaries",
      title: "Python Official Docs: Dictionaries & Mapping Types",
      description: "Official Python guide on key-value dictionaries, hash tables, and mapping operations.",
    };
  }
  if (nameLower.includes("function") || nameLower.includes("builtin")) {
    return {
      url: "https://docs.python.org/3/library/functions.html",
      title: "Python Official Docs: Built-in Functions Reference",
      description: "Official reference for all 70+ built-in Python functions like len(), map(), filter(), zip().",
    };
  }
  if (nameLower.includes("exception") || nameLower.includes("error")) {
    return {
      url: "https://docs.python.org/3/tutorial/errors.html",
      title: "Python Official Docs: Errors and Exceptions",
      description: "Official tutorial on syntax errors, exception handling (try/except/finally), and raising exceptions.",
    };
  }
  if (nameLower.includes("array") || nameLower.includes("stack") || nameLower.includes("queue") || nameLower.includes("tree") || nameLower.includes("heap") || nameLower.includes("recursion") || nameLower.includes("sorting")) {
    return {
      url: "https://docs.python.org/3/library/collections.html",
      title: "Python Official Docs: Container Data Types (collections & heapq)",
      description: "Official documentation on deque, Counter, OrderedDict, defaultdict, and heapq module algorithms.",
    };
  }
  if (nameLower.includes("module")) {
    return {
      url: "https://docs.python.org/3/tutorial/modules.html",
      title: "Python Official Docs: Modules & Packages",
      description: "Official guide on creating, importing, and executing Python builtin and custom modules.",
    };
  }
  if (nameLower.includes("scope") || nameLower.includes("legb")) {
    return {
      url: "https://docs.python.org/3/tutorial/classes.html#python-scopes-and-namespaces",
      title: "Python Official Docs: Scopes and Namespaces",
      description: "Official reference on local, enclosing, global, and built-in (LEGB) resolution rules.",
    };
  }
  if (nameLower.includes("comprehension") || nameLower.includes("generator expression")) {
    return {
      url: "https://docs.python.org/3/tutorial/datastructures.html#list-comprehensions",
      title: "Python Official Docs: List Comprehensions & Generator Expressions",
      description: "Official tutorial on constructing lists, sets, dicts, and generator expressions concisely.",
    };
  }
  if (nameLower.includes("lambda")) {
    return {
      url: "https://docs.python.org/3/tutorial/controlflow.html#lambda-expressions",
      title: "Python Official Docs: Lambda Expressions",
      description: "Official guide on anonymous inline lambda functions in Python.",
    };
  }
  if (nameLower.includes("decorator")) {
    return {
      url: "https://docs.python.org/3/glossary.html#term-decorator",
      title: "Python Official Docs: Decorators Glossary & Guide",
      description: "Official Python definition and usage guide for function and class decorators.",
    };
  }
  if (nameLower.includes("iterator")) {
    return {
      url: "https://docs.python.org/3/tutorial/classes.html#iterators",
      title: "Python Official Docs: Iterators Protocol (__iter__, __next__)",
      description: "Official explanation of the Python iterator protocol and iter() / next() builtins.",
    };
  }
  if (nameLower.includes("context manager")) {
    return {
      url: "https://docs.python.org/3/reference/datamodel.html#context-managers",
      title: "Python Official Docs: Context Managers & 'with' Statement",
      description: "Official language reference on context manager objects and contextlib.",
    };
  }
  if (nameLower.includes("regular expression") || nameLower.includes("regex")) {
    return {
      url: "https://docs.python.org/3/library/re.html",
      title: "Python Official Docs: Regular Expression Operations (re)",
      description: "Official standard library documentation for pattern matching with the 're' module.",
    };
  }
  if (nameLower.includes("class") || nameLower.includes("method") || nameLower.includes("inheritance") || nameLower.includes("encapsulation") || nameLower.includes("oop")) {
    return {
      url: "https://docs.python.org/3/tutorial/classes.html",
      title: "Python Official Docs: Object-Oriented Programming & Classes",
      description: "Official tutorial on Python classes, instance/static methods, inheritance, and encapsulation.",
    };
  }
  if (nameLower.includes("pypi") || nameLower.includes("pip") || nameLower.includes("poetry") || nameLower.includes("conda") || nameLower.includes("uv") || nameLower.includes("pdm") || nameLower.includes("package") || nameLower.includes("pyproject.toml")) {
    return {
      url: "https://packaging.python.org/",
      title: "Python Packaging User Guide (PyPI & Packaging Standards)",
      description: "Official authority on Python packaging, pyproject.toml configuration, pip, and PyPI.",
    };
  }
  if (nameLower.includes("environment") || nameLower.includes("virtualenv") || nameLower.includes("pyenv") || nameLower.includes("pipenv") || nameLower.includes("venv")) {
    return {
      url: "https://docs.python.org/3/library/venv.html",
      title: "Python Official Docs: Creation of Virtual Environments (venv)",
      description: "Official standard library documentation on isolated Python environments.",
    };
  }
  if (nameLower.includes("static typing") || nameLower.includes("typing") || nameLower.includes("mypy") || nameLower.includes("pyright") || nameLower.includes("pyre")) {
    return {
      url: "https://docs.python.org/3/library/typing.html",
      title: "Python Official Docs: Support for Type Hints (typing module)",
      description: "Official specification of Python type annotations and static analysis tools like mypy.",
    };
  }
  if (nameLower.includes("pydantic")) {
    return {
      url: "https://docs.pydantic.dev/",
      title: "Pydantic Official Documentation",
      description: "Official documentation for Pydantic data validation and settings management using Python type hints.",
    };
  }
  if (nameLower.includes("code formatting") || nameLower.includes("black") || nameLower.includes("ruff") || nameLower.includes("yapf")) {
    return {
      url: "https://docs.astral.sh/ruff/",
      title: "Ruff & Black Python Code Formatting & Linting",
      description: "Official documentation for modern ultra-fast Python linter and code formatter.",
    };
  }
  if (nameLower.includes("multiprocessing")) {
    return {
      url: "https://docs.python.org/3/library/multiprocessing.html",
      title: "Python Official Docs: Process-based Parallelism (multiprocessing)",
      description: "Official documentation on spawning processes, sharing state, and bypassing the GIL.",
    };
  }
  if (nameLower.includes("asynchrony") || nameLower.includes("asyncio")) {
    return {
      url: "https://docs.python.org/3/library/asyncio.html",
      title: "Python Official Docs: Asynchronous I/O (asyncio)",
      description: "Official guide to writing concurrent code using async/await syntax and event loops.",
    };
  }
  if (nameLower.includes("threading")) {
    return {
      url: "https://docs.python.org/3/library/threading.html",
      title: "Python Official Docs: Thread-based Parallelism (threading)",
      description: "Official reference for Python thread execution, mutex locks, and condition variables.",
    };
  }
  if (nameLower.includes("gil") || nameLower.includes("global interpreter lock")) {
    return {
      url: "https://docs.python.org/3/glossary.html#term-global-interpreter-lock",
      title: "Python Official Docs: Global Interpreter Lock (GIL) Glossary",
      description: "Official explanation of CPython's Global Interpreter Lock, thread safety, and concurrency impact.",
    };
  }
  if (nameLower.includes("file handling")) {
    return {
      url: "https://docs.python.org/3/tutorial/inputoutput.html#reading-and-writing-files",
      title: "Python Official Docs: Reading and Writing Files",
      description: "Official tutorial on file objects, open(), reading, writing, and context managers.",
    };
  }
  if (nameLower.includes("glob")) {
    return {
      url: "https://docs.python.org/3/library/glob.html",
      title: "Python Official Docs: Unix style pathname pattern expansion (glob)",
      description: "Official standard library documentation for filename pattern matching with glob.",
    };
  }
  if (nameLower.includes("sphinx") || nameLower.includes("documentation")) {
    return {
      url: "https://www.sphinx-doc.org/",
      title: "Sphinx Official Documentation",
      description: "Official documentation tool for Python code bases, docstrings, and reStructuredText/Markdown.",
    };
  }
  if (nameLower.includes("unittest") || nameLower.includes("pyunit")) {
    return {
      url: "https://docs.python.org/3/library/unittest.html",
      title: "Python Official Docs: Unit Testing Framework (unittest)",
      description: "Official standard library documentation for automated unit testing in Python.",
    };
  }
  if (nameLower.includes("doctest")) {
    return {
      url: "https://docs.python.org/3/library/doctest.html",
      title: "Python Official Docs: Test Docstrings (doctest)",
      description: "Official documentation on running tests embedded directly inside docstrings.",
    };
  }
  if (nameLower.includes("pytest")) {
    return {
      url: "https://docs.pytest.org/",
      title: "Pytest Official Documentation",
      description: "Official guide to the powerful, simple, and extensible Python testing framework.",
    };
  }
  if (nameLower.includes("tox")) {
    return {
      url: "https://tox.wiki/",
      title: "Tox Official Documentation",
      description: "Official documentation for automated Python environment testing and CI integration.",
    };
  }
  if (nameLower.includes("fastapi")) {
    return {
      url: "https://fastapi.tiangolo.com/",
      title: "FastAPI Official Documentation",
      description: "Official interactive documentation for FastAPI asynchronous Web APIs.",
    };
  }
  if (nameLower.includes("django")) {
    return {
      url: "https://docs.djangoproject.com/",
      title: "Django Official Documentation",
      description: "Official documentation for Django high-level Python web framework.",
    };
  }
  if (nameLower.includes("flask")) {
    return {
      url: "https://flask.palletsprojects.com/",
      title: "Flask Official Documentation",
      description: "Official documentation for Flask lightweight WSGI microframework.",
    };
  }

  // Generic fallback to python.org search
  return {
    url: `https://docs.python.org/3/search.html?q=${encodeURIComponent(skillName)}`,
    title: `${skillName} - Official Python Documentation`,
    description: `Official Python manual reference and specifications for ${skillName}.`,
  };
}

function getOfficialJavaDocLink(skillName: string): { url: string; title: string; description: string } {
  const nameLower = skillName.toLowerCase();

  if (nameLower.includes("basic syntax") || nameLower.includes("lifecycle")) {
    return {
      url: "https://docs.oracle.com/javase/tutorial/java/nutsandbolts/index.html",
      title: "Java Official Docs: Language Basics & Program Lifecycle",
      description: "Official Oracle Java tutorial on basic syntax, variables, operators, and execution flow.",
    };
  }
  if (nameLower.includes("data type") || nameLower.includes("type casting") || nameLower.includes("variables")) {
    return {
      url: "https://docs.oracle.com/javase/tutorial/java/nutsandbolts/datatypes.html",
      title: "Java Official Docs: Primitive Data Types & Variables",
      description: "Official Java tutorial on primitive types, variable declarations, and type conversion.",
    };
  }
  if (nameLower.includes("string")) {
    return {
      url: "https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/String.html",
      title: "Java Official Docs: Class String API Reference",
      description: "Official JDK 21 API documentation for Java String manipulation, methods, and immutability.",
    };
  }
  if (nameLower.includes("math")) {
    return {
      url: "https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/Math.html",
      title: "Java Official Docs: Class Math API Reference",
      description: "Official JDK specification for performing basic numeric mathematical operations.",
    };
  }
  if (nameLower.includes("array")) {
    return {
      url: "https://docs.oracle.com/javase/tutorial/java/nutsandbolts/arrays.html",
      title: "Java Official Docs: Arrays Guide",
      description: "Official Java tutorial on single and multi-dimensional array creation and manipulation.",
    };
  }
  if (nameLower.includes("conditional") || nameLower.includes("loop")) {
    return {
      url: "https://docs.oracle.com/javase/tutorial/java/nutsandbolts/flow.html",
      title: "Java Official Docs: Control Flow Statements",
      description: "Official tutorial on if-then-else, switch statements, for, while, and do-while loops.",
    };
  }
  if (nameLower.includes("class") || nameLower.includes("object") || nameLower.includes("access specifier") || nameLower.includes("static") || nameLower.includes("final") || nameLower.includes("nested") || nameLower.includes("package")) {
    return {
      url: "https://docs.oracle.com/javase/tutorial/java/javaOO/index.html",
      title: "Java Official Docs: Classes and Objects",
      description: "Official Java guide on object creation, methods, access modifiers, static fields, and packages.",
    };
  }
  if (nameLower.includes("inheritance") || nameLower.includes("encapsulation") || nameLower.includes("interface") || nameLower.includes("abstraction") || nameLower.includes("overloading") || nameLower.includes("overriding")) {
    return {
      url: "https://docs.oracle.com/javase/tutorial/java/IandI/index.html",
      title: "Java Official Docs: Interfaces and Inheritance",
      description: "Official tutorial on OOP principles, interface definitions, abstract classes, and polymorphism.",
    };
  }
  if (nameLower.includes("enum")) {
    return {
      url: "https://docs.oracle.com/javase/tutorial/java/javaOO/enum.html",
      title: "Java Official Docs: Enum Types",
      description: "Official tutorial on defining, instantiating, and iterating Java Enum types.",
    };
  }
  if (nameLower.includes("record")) {
    return {
      url: "https://docs.oracle.com/en/java/javase/21/language/records.html",
      title: "Java Official Docs: Record Classes (JDK 14+ / 17 / 21)",
      description: "Official Oracle feature guide on immutable data carrier Record classes in modern Java.",
    };
  }
  if (nameLower.includes("exception")) {
    return {
      url: "https://docs.oracle.com/javase/tutorial/essential/exceptions/index.html",
      title: "Java Official Docs: Catching and Handling Exceptions",
      description: "Official tutorial on try-catch-finally blocks, checked vs unchecked exceptions, and throwables.",
    };
  }
  if (nameLower.includes("lambda") || nameLower.includes("functional")) {
    return {
      url: "https://docs.oracle.com/javase/tutorial/java/javaOO/lambdaexpressions.html",
      title: "Java Official Docs: Lambda Expressions & Functional Interfaces",
      description: "Official tutorial on lambda syntax, target typing, method references, and java.util.function.",
    };
  }
  if (nameLower.includes("annotation")) {
    return {
      url: "https://docs.oracle.com/javase/tutorial/java/annotations/index.html",
      title: "Java Official Docs: Annotations Guide",
      description: "Official Java guide on built-in annotations (@Override, @Deprecated) and custom metadata.",
    };
  }
  if (nameLower.includes("optional")) {
    return {
      url: "https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/Optional.html",
      title: "Java Official Docs: Class Optional<T> API",
      description: "Official API specification for null-safe container objects in Java 8+.",
    };
  }
  if (nameLower.includes("stream")) {
    return {
      url: "https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/stream/package-summary.html",
      title: "Java Official Docs: java.util.stream Package Reference",
      description: "Official API guide for functional-style operations on streams of elements.",
    };
  }
  if (nameLower.includes("collection") || nameLower.includes("set") || nameLower.includes("map") || nameLower.includes("queue") || nameLower.includes("stack") || nameLower.includes("arraylist") || nameLower.includes("deque") || nameLower.includes("iterator")) {
    return {
      url: "https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/package-summary.html",
      title: "Java Official Docs: Collections Framework API",
      description: "Official Java collections hierarchy reference including List, Set, Map, Queue, and Deque.",
    };
  }
  if (nameLower.includes("thread") || nameLower.includes("concurrency") || nameLower.includes("volatile") || nameLower.includes("virtual thread") || nameLower.includes("memory model")) {
    return {
      url: "https://docs.oracle.com/javase/tutorial/essential/concurrency/index.html",
      title: "Java Official Docs: Concurrency & Multithreading",
      description: "Official tutorial on thread objects, synchronization, volatile, atomic variables, and virtual threads.",
    };
  }
  if (nameLower.includes("i/o") || nameLower.includes("file")) {
    return {
      url: "https://docs.oracle.com/javase/tutorial/essential/io/index.html",
      title: "Java Official Docs: Basic I/O & NIO.2 File Operations",
      description: "Official Java tutorial on byte/character streams, file I/O, and java.nio.file.Path.",
    };
  }
  if (nameLower.includes("maven")) {
    return {
      url: "https://maven.apache.org/guides/",
      title: "Apache Maven Official Documentation",
      description: "Official guide on Maven project management, pom.xml configuration, and build lifecycle.",
    };
  }
  if (nameLower.includes("gradle")) {
    return {
      url: "https://docs.gradle.org/",
      title: "Gradle Official User Manual",
      description: "Official documentation for Gradle build automation tool and build.gradle scripts.",
    };
  }
  if (nameLower.includes("spring")) {
    return {
      url: "https://docs.spring.io/spring-boot/",
      title: "Spring Boot Official Reference Documentation",
      description: "Official documentation for Spring Boot application framework, dependency injection, and REST.",
    };
  }
  if (nameLower.includes("quarkus")) {
    return {
      url: "https://quarkus.io/documentation/",
      title: "Quarkus Official Documentation",
      description: "Official guides for Supersonic Subatomic Java framework tailored for Kubernetes.",
    };
  }
  if (nameLower.includes("jdbc")) {
    return {
      url: "https://docs.oracle.com/javase/tutorial/jdbc/",
      title: "Java Official Docs: JDBC Database Access",
      description: "Official tutorial on Java Database Connectivity (JDBC) API for executing SQL queries.",
    };
  }
  if (nameLower.includes("hibernate")) {
    return {
      url: "https://hibernate.org/orm/documentation/",
      title: "Hibernate ORM Official Documentation",
      description: "Official documentation for Hibernate Object/Relational Mapping framework.",
    };
  }
  if (nameLower.includes("junit")) {
    return {
      url: "https://junit.org/junit5/docs/current/user-guide/",
      title: "JUnit 5 Official User Guide",
      description: "Official documentation for writing and running automated unit tests with JUnit 5.",
    };
  }
  if (nameLower.includes("mockito")) {
    return {
      url: "https://site.mockito.org/",
      title: "Mockito Official Documentation",
      description: "Official user documentation for Mockito mocking framework in Java unit tests.",
    };
  }
  if (nameLower.includes("cucumber")) {
    return {
      url: "https://cucumber.io/docs/cucumber/",
      title: "Cucumber-JVM Official Documentation",
      description: "Official guide to Behavior-Driven Development (BDD) testing with Cucumber in Java.",
    };
  }
  if (nameLower.includes("log4j") || nameLower.includes("logback") || nameLower.includes("slf4j")) {
    return {
      url: "https://www.slf4j.org/manual.html",
      title: "SLF4J & Logging Frameworks Official Manual",
      description: "Official documentation for Simple Logging Facade for Java (SLF4J) and loggers.",
    };
  }
  if (nameLower.includes("javadoc")) {
    return {
      url: "https://docs.oracle.com/en/java/javase/21/docs/specs/javadoc/doc-comment-spec.html",
      title: "Java Official Docs: Javadoc Tool & Documentation Comments",
      description: "Official Oracle specification for writing Javadoc comments and generating HTML API documentation.",
    };
  }

  // Generic Java docs fallback
  return {
    url: `https://docs.oracle.com/en/java/javase/21/`,
    title: `${skillName} - Oracle Java Official Documentation`,
    description: `Official Oracle Java SE documentation and specification reference for ${skillName}.`,
  };
}

function getOfficialCDocLink(skillName: string): { url: string; title: string; description: string } {
  const nameLower = skillName.toLowerCase();

  if (nameLower.includes("introduction") || nameLower.includes("setting up") || nameLower.includes("basic syntax") || nameLower.includes("first c program")) {
    return {
      url: "https://en.cppreference.com/w/c/language",
      title: "C Official Reference: Language Basics & Syntax",
      description: "Official C language reference for fundamental syntax, main function, and execution rules.",
    };
  }
  if (nameLower.includes("variable") || nameLower.includes("data type") || nameLower.includes("fixed-width") || nameLower.includes("qualifier")) {
    return {
      url: "https://en.cppreference.com/w/c/language/types",
      title: "C Official Reference: C Types & Type Qualifiers",
      description: "Official specification for basic types, fixed-width integers, const, volatile, restrict, and _Atomic.",
    };
  }
  if (nameLower.includes("operator")) {
    return {
      url: "https://en.cppreference.com/w/c/language/operator_precedence",
      title: "C Official Reference: C Expressions & Operator Precedence",
      description: "Official reference for arithmetic, bitwise, comparison, logical, and ternary operators.",
    };
  }
  if (nameLower.includes("control flow") || nameLower.includes("loop") || nameLower.includes("if-else")) {
    return {
      url: "https://en.cppreference.com/w/c/language/statements",
      title: "C Official Reference: Control Flow Statements",
      description: "Official specification for if-else, switch, for, while, do-while, break, and continue.",
    };
  }
  if (nameLower.includes("function") || nameLower.includes("main") || nameLower.includes("variadic")) {
    return {
      url: "https://en.cppreference.com/w/c/language/functions",
      title: "C Official Reference: C Functions & Prototypes",
      description: "Official guide on main(), prototypes, variadic functions, and parameter passing.",
    };
  }
  if (nameLower.includes("pointer") || nameLower.includes("memory address") || nameLower.includes("malloc") || nameLower.includes("valgrind") || nameLower.includes("heap")) {
    return {
      url: "https://en.cppreference.com/w/c/memory",
      title: "C Official Reference: Dynamic Memory & Pointers",
      description: "Official C language reference for malloc, calloc, realloc, free, and pointer memory management.",
    };
  }
  if (nameLower.includes("string") || nameLower.includes("char array") || nameLower.includes("text processing")) {
    return {
      url: "https://en.cppreference.com/w/c/string/byte",
      title: "C Official Reference: Null-Terminated Byte Strings",
      description: "Official C reference for string functions like strcpy, strlen, strcmp, and strcat.",
    };
  }
  if (nameLower.includes("file") || nameLower.includes("stream") || nameLower.includes("fopen")) {
    return {
      url: "https://en.cppreference.com/w/c/io",
      title: "C Official Reference: C File Input/Output (stdio.h)",
      description: "Official C library manual for FILE streams, fopen, fread, fwrite, printf, and scanf.",
    };
  }
  if (nameLower.includes("preprocessor") || nameLower.includes("macro") || nameLower.includes("define")) {
    return {
      url: "https://en.cppreference.com/w/c/preprocessor",
      title: "C Official Reference: C Preprocessor Directives",
      description: "Official specification for #define, #include, conditional compilation, and macros.",
    };
  }
  if (nameLower.includes("struct") || nameLower.includes("union") || nameLower.includes("typedef") || nameLower.includes("enum")) {
    return {
      url: "https://en.cppreference.com/w/c/language/struct",
      title: "C Official Reference: Structures, Unions & Typedefs",
      description: "Official language reference for struct declarations, bit fields, unions, and typedefs.",
    };
  }
  if (nameLower.includes("error") || nameLower.includes("errno") || nameLower.includes("setjmp")) {
    return {
      url: "https://en.cppreference.com/w/c/error",
      title: "C Official Reference: Error Handling & Diagnostics",
      description: "Official manual for errno, exit codes, assert.h, and setjmp/longjmp non-local jumps.",
    };
  }
  if (nameLower.includes("concurrency") || nameLower.includes("thread") || nameLower.includes("posix")) {
    return {
      url: "https://en.cppreference.com/w/c/thread",
      title: "C Official Reference: Thread Support & Concurrency",
      description: "Official reference for POSIX threads, C11 threads, mutexes, and condition variables.",
    };
  }
  if (nameLower.includes("standard") || nameLower.includes("c89") || nameLower.includes("c99") || nameLower.includes("c11") || nameLower.includes("c17") || nameLower.includes("c23")) {
    return {
      url: "https://en.cppreference.com/w/c/language/history",
      title: "C Official Reference: C Language History & ISO Standards",
      description: "Official overview of ISO C language standards evolution from C89 to C23.",
    };
  }

  // Generic C fallback
  return {
    url: `https://en.cppreference.com/w/c`,
    title: `${skillName} - C Official Reference (cppreference.com)`,
    description: `Official ISO C standard library manual and specification for ${skillName}.`,
  };
}

function getOfficialCppDocLink(skillName: string): { url: string; title: string; description: string } {
  const nameLower = skillName.toLowerCase();

  if (nameLower.includes("introduction") || nameLower.includes("setting up") || nameLower.includes("basic operation") || nameLower.includes("what is c++")) {
    return {
      url: "https://en.cppreference.com/w/cpp/language/basic_concepts",
      title: "C++ Official Reference: Basic Language Concepts & Environment",
      description: "Official C++ reference for basic concepts, program execution, operators, and control flow.",
    };
  }
  if (nameLower.includes("template") || nameLower.includes("sfinae") || nameLower.includes("variadic")) {
    return {
      url: "https://en.cppreference.com/w/cpp/language/templates",
      title: "C++ Official Reference: Templates & Generic Programming",
      description: "Official C++ specification for function/class templates, specialization, SFINAE, and concepts.",
    };
  }
  if (nameLower.includes("stl") || nameLower.includes("container") || nameLower.includes("vector") || nameLower.includes("map") || nameLower.includes("set")) {
    return {
      url: "https://en.cppreference.com/w/cpp/container",
      title: "C++ Official Reference: Containers Library (STL)",
      description: "Official C++ reference for std::vector, std::map, std::set, std::unordered_map, and deque.",
    };
  }
  if (nameLower.includes("smart pointer") || nameLower.includes("unique_ptr") || nameLower.includes("shared_ptr") || nameLower.includes("raii")) {
    return {
      url: "https://en.cppreference.com/w/cpp/memory",
      title: "C++ Official Reference: Dynamic Memory & Smart Pointers",
      description: "Official reference for std::unique_ptr, std::shared_ptr, std::make_unique, and RAII memory safety.",
    };
  }
  if (nameLower.includes("class") || nameLower.includes("oop") || nameLower.includes("inheritance") || nameLower.includes("virtual")) {
    return {
      url: "https://en.cppreference.com/w/cpp/language/classes",
      title: "C++ Official Reference: Classes, Object Oriented Design & Virtual Methods",
      description: "Official specification for C++ class definitions, constructors, inheritance, and virtual functions.",
    };
  }
  if (nameLower.includes("cast") || nameLower.includes("static_cast") || nameLower.includes("dynamic_cast")) {
    return {
      url: "https://en.cppreference.com/w/cpp/language/expressions#Casts",
      title: "C++ Official Reference: Explicit Type Conversion & Cast Operators",
      description: "Official guide for static_cast, dynamic_cast, const_cast, and reinterpret_cast.",
    };
  }
  if (nameLower.includes("algorithm") || nameLower.includes("sort") || nameLower.includes("find")) {
    return {
      url: "https://en.cppreference.com/w/cpp/algorithm",
      title: "C++ Official Reference: Standard Algorithms Library",
      description: "Official documentation for std::sort, std::find, std::transform, and generic algorithms.",
    };
  }
  if (nameLower.includes("thread") || nameLower.includes("concurrency") || nameLower.includes("mutex")) {
    return {
      url: "https://en.cppreference.com/w/cpp/thread",
      title: "C++ Official Reference: Thread Support Library",
      description: "Official documentation for std::thread, std::mutex, std::async, and atomic operations.",
    };
  }
  if (nameLower.includes("exception") || nameLower.includes("error")) {
    return {
      url: "https://en.cppreference.com/w/cpp/error",
      title: "C++ Official Reference: Error Handling & Exceptions",
      description: "Official reference for try/catch exception handling, std::exception, and error codes.",
    };
  }
  if (nameLower.includes("idiom") || nameLower.includes("pimpl") || nameLower.includes("crtp")) {
    return {
      url: "https://en.cppreference.com/w/cpp/language/raii",
      title: "C++ Official Reference: C++ Idioms & RAII Design",
      description: "Official guide to C++ programming idioms including RAII, Pimpl, CRTP, and Copy-and-Swap.",
    };
  }
  if (nameLower.includes("cmake") || nameLower.includes("build") || nameLower.includes("ninja")) {
    return {
      url: "https://cmake.org/documentation/",
      title: "CMake Official Documentation",
      description: "Official user manual and reference guide for CMake build system.",
    };
  }
  if (nameLower.includes("gtest") || nameLower.includes("testing") || nameLower.includes("catch2")) {
    return {
      url: "https://google.github.io/googletest/",
      title: "GoogleTest & C++ Testing Framework Documentation",
      description: "Official user guide for C++ unit testing with GoogleTest (gtest/gmock).",
    };
  }

  // Generic C++ fallback
  return {
    url: `https://en.cppreference.com/w/cpp`,
    title: `${skillName} - C++ Official Reference (cppreference.com)`,
    description: `Official ISO C++ standard library manual and language reference for ${skillName}.`,
  };
}

function getOfficialReactDocLink(skillName: string): { url: string; title: string; description: string } {
  const nameLower = skillName.toLowerCase();

  if (nameLower.includes("jsx") || nameLower.includes("component") || nameLower.includes("render")) {
    return {
      url: "https://react.dev/learn/writing-components-with-jsx",
      title: "React Official Docs: Writing Components with JSX",
      description: "Official React documentation on components, JSX syntax, props, and conditional rendering.",
    };
  }
  if (nameLower.includes("hook") || nameLower.includes("usestate") || nameLower.includes("useeffect") || nameLower.includes("useref")) {
    return {
      url: "https://react.dev/reference/react/hooks",
      title: "React Official Reference: Built-in React Hooks",
      description: "Official React hooks API reference for useState, useEffect, useRef, useMemo, and useCallback.",
    };
  }
  if (nameLower.includes("context") || nameLower.includes("state") || nameLower.includes("zustand") || nameLower.includes("redux")) {
    return {
      url: "https://react.dev/learn/passing-data-deeply-with-context",
      title: "React Official Docs: Passing Data Deeply with Context",
      description: "Official guide on state management, Context API, and sharing state between components.",
    };
  }
  if (nameLower.includes("router") || nameLower.includes("navigation")) {
    return {
      url: "https://reactrouter.com/en/main",
      title: "React Router Official Documentation",
      description: "Official documentation for React Router v6+ navigation, routes, and data loaders.",
    };
  }
  if (nameLower.includes("query") || nameLower.includes("tanstack") || nameLower.includes("axios")) {
    return {
      url: "https://tanstack.com/query/latest/docs/framework/react/overview",
      title: "TanStack Query Official Documentation (React Query)",
      description: "Official guide on server state management, caching, and data fetching in React.",
    };
  }

  // Generic React fallback
  return {
    url: `https://react.dev/`,
    title: `${skillName} - React Official Documentation (react.dev)`,
    description: `Official React documentation, guide, and API reference for ${skillName}.`,
  };
}

function getOfficialNextDocLink(skillName: string): { url: string; title: string; description: string } {
  const nameLower = skillName.toLowerCase();

  if (nameLower.includes("app router") || nameLower.includes("layout") || nameLower.includes("routing")) {
    return {
      url: "https://nextjs.org/docs/app/building-your-application/routing",
      title: "Next.js Official Docs: App Router & Layout Routing",
      description: "Official Next.js documentation on the App Router, layouts, pages, and dynamic routing.",
    };
  }
  if (nameLower.includes("server action") || nameLower.includes("data fetching") || nameLower.includes("caching")) {
    return {
      url: "https://nextjs.org/docs/app/building-your-application/data-fetching",
      title: "Next.js Official Docs: Data Fetching, Caching & Server Actions",
      description: "Official guide on server-side data fetching, caching revalidation, and Server Actions.",
    };
  }
  if (nameLower.includes("middleware") || nameLower.includes("header") || nameLower.includes("cookie")) {
    return {
      url: "https://nextjs.org/docs/app/building-your-application/routing/middleware",
      title: "Next.js Official Docs: Edge Middleware & Request Handling",
      description: "Official specification for Edge Middleware, route matchers, cookies, and custom headers.",
    };
  }
  if (nameLower.includes("optimization") || nameLower.includes("image") || nameLower.includes("font") || nameLower.includes("metadata")) {
    return {
      url: "https://nextjs.org/docs/app/building-your-application/optimizing",
      title: "Next.js Official Docs: Image, Font & Metadata Optimization",
      description: "Official manual for next/image, next/font, script loading, and Metadata SEO APIs.",
    };
  }
  if (nameLower.includes("deployment") || nameLower.includes("docker") || nameLower.includes("production")) {
    return {
      url: "https://nextjs.org/docs/app/building-your-application/deploying",
      title: "Next.js Official Docs: Deployment Options & Vercel Ops",
      description: "Official deployment guides for Node.js servers, Docker containers, and Vercel hosting.",
    };
  }

  // Generic Next.js fallback
  return {
    url: `https://nextjs.org/docs`,
    title: `${skillName} - Next.js Official Documentation (nextjs.org)`,
    description: `Official Next.js documentation, guide, and API reference for ${skillName}.`,
  };
}

// Generate topic-specific knowledge data for any skill
function getSkillDetails(skillName: string, roadmapTitle?: string) {
  const nameLower = skillName.toLowerCase();
  const contextLower = (roadmapTitle || "").toLowerCase();

  // Detect language context
  const isC =
    contextLower.includes("c programming") ||
    (contextLower.includes("c ") && !contextLower.includes("c++")) ||
    nameLower.includes("valgrind") ||
    nameLower.includes("malloc") ||
    nameLower.includes("preprocessor") ||
    nameLower.includes("posix");

  const isCpp =
    contextLower.includes("c++") ||
    contextLower.includes("cpp") ||
    nameLower.includes("c++") ||
    nameLower.includes("stl") ||
    nameLower.includes("smart pointer") ||
    nameLower.includes("iostream") ||
    nameLower.includes("cmake");

  const isJava =
    contextLower.includes("java") ||
    contextLower.includes("spring") ||
    nameLower.includes("java") ||
    nameLower.includes("spring") ||
    nameLower.includes("maven") ||
    nameLower.includes("gradle") ||
    nameLower.includes("hibernate") ||
    nameLower.includes("junit") ||
    nameLower.includes("record") ||
    nameLower.includes("enum") ||
    nameLower.includes("object lifecycle") ||
    nameLower.includes("virtual thread") ||
    nameLower.includes("arraylist") ||
    nameLower.includes("javadoc") ||
    nameLower.includes("quarkus") ||
    nameLower.includes("jdbc");

  const isNext =
    contextLower.includes("next.js") ||
    contextLower.includes("nextjs") ||
    nameLower.includes("app directory") ||
    nameLower.includes("server actions") ||
    nameLower.includes("create-next-app") ||
    nameLower.includes("next/image") ||
    nameLower.includes("next/font");

  const isReact =
    (contextLower.includes("react") && !contextLower.includes("next.js")) ||
    nameLower.includes("jsx") ||
    nameLower.includes("vitest") ||
    nameLower.includes("framer motion") ||
    nameLower.includes("react query");

  const officialDoc = isC
    ? getOfficialCDocLink(skillName)
    : isCpp
    ? getOfficialCppDocLink(skillName)
    : isJava
    ? getOfficialJavaDocLink(skillName)
    : isNext
    ? getOfficialNextDocLink(skillName)
    : isReact
    ? getOfficialReactDocLink(skillName)
    : getOfficialPythonDocLink(skillName);

  const docTypeLabel = isC
    ? "Official C Reference"
    : isCpp
    ? "Official C++ Reference"
    : isJava
    ? "Official Java Docs"
    : isNext
    ? "Official Next.js Docs"
    : isReact
    ? "Official React Docs"
    : "Official Python Docs";

  const videoSearchLang = isC ? "c programming " : isCpp ? "cpp " : isJava ? "java " : isNext ? "next js " : isReact ? "react js " : "python ";

  let overview = `${skillName} is a fundamental concept in software engineering. Mastering ${skillName} enables developers to write robust, efficient, and scalable enterprise applications.`;
  let concepts = [
    `Core syntax & internal mechanisms of ${skillName}`,
    "Best practices, code readability & architectural standards",
    "Performance implications, memory management & error handling",
    "Integration into modular software applications",
    "Real-world production usage & testing techniques",
  ];
  let careerImpact = `Crucial for technical interviews, core framework proficiency, and building production-grade enterprise software systems.`;

  let resources = [
    {
      title: officialDoc.title,
      type: docTypeLabel,
      url: officialDoc.url,
      description: officialDoc.description,
    },
    {
      title: `Interactive ${skillName} Coding Exercises`,
      type: "Interactive Playground",
      url: `https://leetcode.com/problemset/all/?search=${encodeURIComponent(skillName)}`,
      description: `Practice problem sets, coding challenges, and hands-on exercises for ${skillName}.`,
    },
    {
      title: `${skillName} Video Crash Course`,
      type: "Video Tutorial",
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(videoSearchLang + skillName + " tutorial")}`,
      description: "Step-by-step visual walkthrough from core concepts to real-world projects.",
    },
  ];

  let faqs = [
    {
      q: `What are the key best practices when working with ${skillName}?`,
      a: `Follow standard naming conventions, write self-documenting code, handle potential exceptions gracefully, and maintain clean modular design.`,
    },
    {
      q: `How is ${skillName} tested and validated in production codebases?`,
      a: `Use standard automated testing frameworks with high unit and integration test coverage, and enforce continuous integration checks.`,
    },
    {
      q: `What interview questions are commonly asked regarding ${skillName}?`,
      a: `Interviewers focus on conceptual depth, memory/performance trade-offs, internal implementation details, and real-world debugging scenarios.`,
    },
  ];

  return { overview, concepts, careerImpact, resources, faqs };
}

export default function SkillDetailDrawer({
  isOpen,
  onClose,
  skillName,
  categoryName = "SOFTWARE ENGINEERING CORE",
  roadmapTitle = "SkillsCatalyst Curriculum",
  status,
  onStatusChange,
}: SkillDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<"about" | "resources" | "faqs">("about");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  if (!isOpen) return null;

  const details = getSkillDetails(skillName, roadmapTitle);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden flex justify-end select-none">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity"
        />

        {/* Slide-over Drawer Panel */}
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
          className="relative w-full max-w-2xl bg-[#0f172a] border-l border-white/[0.1] text-white shadow-2xl h-full flex flex-col z-50 overflow-hidden"
        >
          {/* Header Bar */}
          <div className="p-6 pb-4 border-b border-white/[0.08] bg-[#131b2e]/90 flex items-start justify-between gap-4 shrink-0">
            <div className="flex items-start gap-3">
              <div className="p-3 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-400 shrink-0">
                <Code2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-black tracking-widest text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2.5 py-0.5 rounded-md uppercase">
                    {categoryName}
                  </span>
                  <span className="text-xs text-slate-400 font-normal">• {roadmapTitle}</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                  {skillName}
                </h2>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Status Selection Pill Buttons */}
          <div className="px-6 py-3 bg-slate-900/60 border-b border-white/[0.05] flex items-center justify-between gap-3 overflow-x-auto shrink-0">
            <span className="text-xs font-semibold text-slate-400 shrink-0">Skill Status:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onStatusChange("pending")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  status === "pending"
                    ? "bg-slate-700 text-white border border-slate-500 shadow-md"
                    : "bg-white/[0.03] text-slate-400 border border-white/[0.06] hover:text-slate-200"
                }`}
              >
                <Circle className="w-3.5 h-3.5" />
                Pending
              </button>

              <button
                onClick={() => onStatusChange("in_progress")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  status === "in_progress"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-md shadow-amber-500/10"
                    : "bg-white/[0.03] text-slate-400 border border-white/[0.06] hover:text-slate-200"
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                In Progress
              </button>

              <button
                onClick={() => onStatusChange("completed")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  status === "completed"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-md shadow-emerald-500/10"
                    : "bg-white/[0.03] text-slate-400 border border-white/[0.06] hover:text-slate-200"
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Completed
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 px-6 pt-3 border-b border-white/[0.08] bg-[#0f172a] shrink-0">
            <button
              onClick={() => setActiveTab("about")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold border-b-2 transition-all ${
                activeTab === "about"
                  ? "text-purple-400 border-purple-500 bg-purple-500/10"
                  : "text-slate-400 border-transparent hover:text-slate-200"
              }`}
            >
              <Info className="w-4 h-4" />
              About
            </button>

            <button
              onClick={() => setActiveTab("resources")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold border-b-2 transition-all ${
                activeTab === "resources"
                  ? "text-purple-400 border-purple-500 bg-purple-500/10"
                  : "text-slate-400 border-transparent hover:text-slate-200"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Resources
            </button>

            <button
              onClick={() => setActiveTab("faqs")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold border-b-2 transition-all ${
                activeTab === "faqs"
                  ? "text-purple-400 border-purple-500 bg-purple-500/10"
                  : "text-slate-400 border-transparent hover:text-slate-200"
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              Most Asked Questions
            </button>
          </div>

          {/* Drawer Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* ── TAB 1: ABOUT */}
            {activeTab === "about" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Overview */}
                <div className="space-y-2">
                  <h3 className="text-xs font-black tracking-widest uppercase text-slate-400">
                    OVERVIEW
                  </h3>
                  <p className="text-sm md:text-base text-slate-200 leading-relaxed">
                    {details.overview}
                  </p>
                </div>

                {/* Key Concepts Box */}
                <div className="glass rounded-2xl p-5 border border-white/[0.08] bg-slate-900/60 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-black tracking-widest text-cyan-400 uppercase">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                    KEY CONCEPTS TO MASTER
                  </div>
                  <ul className="space-y-2.5 text-xs md:text-sm text-slate-300">
                    {details.concepts.map((concept, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <span className="text-cyan-400 font-bold">•</span>
                        <span>{concept}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Why It Matters For Your Career Box */}
                <div className="rounded-2xl p-5 border border-purple-500/30 bg-purple-950/30 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-black tracking-widest text-purple-300 uppercase">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    WHY IT MATTERS FOR YOUR CAREER
                  </div>
                  <p className="text-xs md:text-sm text-purple-100/90 leading-relaxed font-normal">
                    {details.careerImpact}
                  </p>
                </div>
              </motion.div>
            )}

            {/* ── TAB 2: RESOURCES */}
            {activeTab === "resources" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="text-xs font-black tracking-widest uppercase text-slate-400 mb-2">
                  CURATED LEARNING RESOURCES
                </div>

                {details.resources.map((res, idx) => (
                  <a
                    key={idx}
                    href={res.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block glass p-4 rounded-2xl border border-white/[0.08] hover:border-purple-500/40 hover:bg-slate-800/60 transition-all group"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase">
                        {res.type}
                      </span>
                      <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-purple-300 transition-colors" />
                    </div>
                    <h4 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                      {res.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">{res.description}</p>
                  </a>
                ))}
              </motion.div>
            )}

            {/* ── TAB 3: MOST ASKED QUESTIONS */}
            {activeTab === "faqs" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="text-xs font-black tracking-widest uppercase text-slate-400 mb-2">
                  TECHNICAL INTERVIEW QUESTIONS
                </div>

                {details.faqs.map((faq, idx) => {
                  const isExpanded = expandedFaq === idx;
                  return (
                    <div
                      key={idx}
                      className="glass rounded-2xl border border-white/[0.08] overflow-hidden"
                    >
                      <button
                        onClick={() => setExpandedFaq(isExpanded ? null : idx)}
                        className="w-full p-4 text-left flex items-center justify-between gap-3 font-semibold text-sm text-white hover:bg-white/[0.03]"
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-purple-400 font-bold">Q{idx + 1}.</span>
                          {faq.q}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-purple-400 shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                      </button>

                      {isExpanded && (
                        <div className="px-4 pb-4 pt-1 text-xs md:text-sm text-slate-300 border-t border-white/[0.05] bg-slate-900/40 leading-relaxed">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
