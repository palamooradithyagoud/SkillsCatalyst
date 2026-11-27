"use client";

import React from "react";
import Link from "next/link";

interface TrendingSearchItem {
  title: string;
  meta: string;
  query: string;
}

interface TrendingSearchCategory {
  id: string;
  title: string;
  href: string;
  items: TrendingSearchItem[];
}

const TRENDING_SEARCH_CATEGORIES: TrendingSearchCategory[] = [
  {
    id: "programming",
    title: "Programming",
    href: "/learning?q=Python",
    items: [
      { title: "Python", meta: "Beginner · Course", query: "Python" },
      { title: "FastAPI", meta: "Intermediate · Course", query: "FastAPI" },
      { title: "Java", meta: "Beginner · Course", query: "Java" },
    ],
  },
  {
    id: "web-dev",
    title: "Web Development",
    href: "/learning?q=React%20JS",
    items: [
      { title: "React JS", meta: "Beginner · Course", query: "React JS" },
      { title: "Node.js", meta: "Beginner · Course", query: "Node.js" },
      { title: "MongoDB", meta: "Intermediate · Course", query: "MongoDB" },
    ],
  },
  {
    id: "data-analysis",
    title: "Data Analysis",
    href: "/learning?q=MongoDB",
    items: [
      { title: "MongoDB Beginners", meta: "Beginner · Course", query: "MongoDB Beginners" },
      { title: "MongoDB Advanced", meta: "Advanced · Course", query: "MongoDB Advanced" },
      { title: "PostgreSQL", meta: "Intermediate · Course", query: "PostgreSQL" },
    ],
  },
];

/**
 * Curated text-only trending cards grouped by track.
 * Mobile: horizontal snap rail peeking next category; Desktop: 3-column grid.
 */
export default function TrendingSearchesSection() {
  return (
    <section
      aria-label="Trending"
      className="max-w-5xl mx-auto space-y-3.5 sm:space-y-4"
    >
      <h3 className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 dark:text-white px-0.5">
        Trending
      </h3>

      <div className="flex flex-row md:grid md:grid-cols-3 gap-3.5 sm:gap-4 overflow-x-auto md:overflow-visible snap-x snap-mandatory scrollbar-none -mx-3.5 px-3.5 sm:-mx-6 sm:px-6 md:mx-0 md:px-0 pb-1">
        {TRENDING_SEARCH_CATEGORIES.map((category) => (
          <div
            key={category.id}
            className="w-[78vw] max-w-[305px] md:w-auto md:max-w-none shrink-0 snap-start rounded-[20px] p-4 sm:p-4.5 bg-[#EEF3FE] dark:bg-[#14171D] border border-slate-200/80 dark:border-white/[0.08] flex flex-col gap-3"
          >
            <Link
              href={category.href}
              className="group inline-flex items-center gap-2 w-fit text-[15px] sm:text-base font-extrabold tracking-tight text-slate-900 dark:text-white hover:text-slate-700 dark:hover:text-[#D5FF38] transition-colors px-0.5"
            >
              <span>{category.title}</span>
              <span
                aria-hidden="true"
                className="text-slate-600 dark:text-neutral-400 group-hover:translate-x-0.5 group-hover:text-slate-900 dark:group-hover:text-[#D5FF38] transition-all"
              >
                →
              </span>
            </Link>

            <div className="flex flex-col gap-2.5">
              {category.items.map((item) => (
                <Link
                  key={item.title}
                  href={`/learning?q=${encodeURIComponent(item.query)}`}
                  className="block rounded-xl px-4 py-3 bg-white dark:bg-[#1E2129] border border-slate-200/70 dark:border-white/[0.07] shadow-[0_2px_8px_rgba(15,23,42,0.03)] dark:shadow-none hover:border-slate-300 dark:hover:border-[#C7F200]/45 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C7F200]"
                >
                  <div className="text-[14px] font-bold text-slate-900 dark:text-white leading-snug">
                    {item.title}
                  </div>
                  <div className="mt-0.5 text-[12px] font-medium text-slate-500 dark:text-neutral-400 leading-snug">
                    {item.meta}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
