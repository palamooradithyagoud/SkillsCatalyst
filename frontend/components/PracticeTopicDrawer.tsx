"use client";

import React, { useState } from "react";
import { X, ExternalLink, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface LeetCodeProblem {
  id: number;
  number: number;
  title: string;
  url: string;
  difficulty: "Easy" | "Medium" | "Hard";
  pattern: string;
}

export interface Prerequisite {
  title: string;
  subtitle: string;
}

export interface PracticeTopicData {
  prerequisites: Prerequisite[];
  problems: LeetCodeProblem[];
}

const TOPIC_DATASET: Record<string, PracticeTopicData> = {
  "two pointers": {
    prerequisites: [
      { title: "Arrays & Pointers", subtitle: "Basic Traversal" },
      { title: "In-Place Swapping", subtitle: "O(1) Space Memory" },
    ],
    problems: [
      { id: 26, number: 26, title: "Remove Duplicates from Sorted Array", url: "https://leetcode.com/problems/remove-duplicates-from-sorted-array/", difficulty: "Easy", pattern: "Two Pointers" },
      { id: 27, number: 27, title: "Remove Element", url: "https://leetcode.com/problems/remove-element/", difficulty: "Easy", pattern: "Two Pointers" },
      { id: 88, number: 88, title: "Merge Sorted Array", url: "https://leetcode.com/problems/merge-sorted-array/", difficulty: "Easy", pattern: "Two Pointers" },
      { id: 283, number: 283, title: "Move Zeroes", url: "https://leetcode.com/problems/move-zeroes/", difficulty: "Easy", pattern: "Two Pointers" },
      { id: 349, number: 349, title: "Intersection of Two Arrays", url: "https://leetcode.com/problems/intersection-of-two-arrays/", difficulty: "Easy", pattern: "Two Pointers + Sorting" },
      { id: 350, number: 350, title: "Intersection of Two Arrays II", url: "https://leetcode.com/problems/intersection-of-two-arrays-ii/", difficulty: "Easy", pattern: "Two Pointers + Sorting" },
      { id: 455, number: 455, title: "Assign Cookies", url: "https://leetcode.com/problems/assign-cookies/", difficulty: "Easy", pattern: "Two Pointers + Greedy" },
      { id: 905, number: 905, title: "Sort Array By Parity", url: "https://leetcode.com/problems/sort-array-by-parity/", difficulty: "Easy", pattern: "Two Pointers" },
      { id: 922, number: 922, title: "Sort Array By Parity II", url: "https://leetcode.com/problems/sort-array-by-parity-ii/", difficulty: "Easy", pattern: "Two Pointers" },
      { id: 977, number: 977, title: "Squares of a Sorted Array", url: "https://leetcode.com/problems/squares-of-a-sorted-array/", difficulty: "Easy", pattern: "Two Pointers" },
      { id: 2460, number: 2460, title: "Apply Operations to an Array", url: "https://leetcode.com/problems/apply-operations-to-an-array/", difficulty: "Easy", pattern: "Two Pointers" },
      { id: 11, number: 11, title: "Container With Most Water", url: "https://leetcode.com/problems/container-with-most-water/", difficulty: "Medium", pattern: "Two Pointers" },
      { id: 15, number: 15, title: "3Sum", url: "https://leetcode.com/problems/3sum/", difficulty: "Medium", pattern: "Two Pointers + Sorting" },
      { id: 16, number: 16, title: "3Sum Closest", url: "https://leetcode.com/problems/3sum-closest/", difficulty: "Medium", pattern: "Two Pointers + Sorting" },
      { id: 18, number: 18, title: "4Sum", url: "https://leetcode.com/problems/4sum/", difficulty: "Medium", pattern: "Two Pointers + Sorting" },
      { id: 80, number: 80, title: "Remove Duplicates from Sorted Array II", url: "https://leetcode.com/problems/remove-duplicates-from-sorted-array-ii/", difficulty: "Medium", pattern: "Two Pointers" },
      { id: 167, number: 167, title: "Two Sum II – Input Array Is Sorted", url: "https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/", difficulty: "Medium", pattern: "Two Pointers" },
      { id: 189, number: 189, title: "Rotate Array", url: "https://leetcode.com/problems/rotate-array/", difficulty: "Medium", pattern: "Two Pointers" },
      { id: 611, number: 611, title: "Valid Triangle Number", url: "https://leetcode.com/problems/valid-triangle-number/", difficulty: "Medium", pattern: "Two Pointers" },
      { id: 881, number: 881, title: "Boats to Save People", url: "https://leetcode.com/problems/boats-to-save-people/", difficulty: "Medium", pattern: "Two Pointers" },
      { id: 42, number: 42, title: "Trapping Rain Water", url: "https://leetcode.com/problems/trapping-rain-water/", difficulty: "Hard", pattern: "Two Pointers" },
    ],
  },
  "two pointer": {
    prerequisites: [
      { title: "Arrays & Pointers", subtitle: "Basic Traversal" },
      { title: "In-Place Swapping", subtitle: "O(1) Space Memory" },
    ],
    problems: [
      { id: 26, number: 26, title: "Remove Duplicates from Sorted Array", url: "https://leetcode.com/problems/remove-duplicates-from-sorted-array/", difficulty: "Easy", pattern: "Two Pointers" },
      { id: 27, number: 27, title: "Remove Element", url: "https://leetcode.com/problems/remove-element/", difficulty: "Easy", pattern: "Two Pointers" },
      { id: 88, number: 88, title: "Merge Sorted Array", url: "https://leetcode.com/problems/merge-sorted-array/", difficulty: "Easy", pattern: "Two Pointers" },
      { id: 283, number: 283, title: "Move Zeroes", url: "https://leetcode.com/problems/move-zeroes/", difficulty: "Easy", pattern: "Two Pointers" },
      { id: 349, number: 349, title: "Intersection of Two Arrays", url: "https://leetcode.com/problems/intersection-of-two-arrays/", difficulty: "Easy", pattern: "Two Pointers + Sorting" },
      { id: 350, number: 350, title: "Intersection of Two Arrays II", url: "https://leetcode.com/problems/intersection-of-two-arrays-ii/", difficulty: "Easy", pattern: "Two Pointers + Sorting" },
      { id: 455, number: 455, title: "Assign Cookies", url: "https://leetcode.com/problems/assign-cookies/", difficulty: "Easy", pattern: "Two Pointers + Greedy" },
      { id: 905, number: 905, title: "Sort Array By Parity", url: "https://leetcode.com/problems/sort-array-by-parity/", difficulty: "Easy", pattern: "Two Pointers" },
      { id: 922, number: 922, title: "Sort Array By Parity II", url: "https://leetcode.com/problems/sort-array-by-parity-ii/", difficulty: "Easy", pattern: "Two Pointers" },
      { id: 977, number: 977, title: "Squares of a Sorted Array", url: "https://leetcode.com/problems/squares-of-a-sorted-array/", difficulty: "Easy", pattern: "Two Pointers" },
      { id: 2460, number: 2460, title: "Apply Operations to an Array", url: "https://leetcode.com/problems/apply-operations-to-an-array/", difficulty: "Easy", pattern: "Two Pointers" },
      { id: 11, number: 11, title: "Container With Most Water", url: "https://leetcode.com/problems/container-with-most-water/", difficulty: "Medium", pattern: "Two Pointers" },
      { id: 15, number: 15, title: "3Sum", url: "https://leetcode.com/problems/3sum/", difficulty: "Medium", pattern: "Two Pointers + Sorting" },
      { id: 16, number: 16, title: "3Sum Closest", url: "https://leetcode.com/problems/3sum-closest/", difficulty: "Medium", pattern: "Two Pointers + Sorting" },
      { id: 18, number: 18, title: "4Sum", url: "https://leetcode.com/problems/4sum/", difficulty: "Medium", pattern: "Two Pointers + Sorting" },
      { id: 80, number: 80, title: "Remove Duplicates from Sorted Array II", url: "https://leetcode.com/problems/remove-duplicates-from-sorted-array-ii/", difficulty: "Medium", pattern: "Two Pointers" },
      { id: 167, number: 167, title: "Two Sum II – Input Array Is Sorted", url: "https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/", difficulty: "Medium", pattern: "Two Pointers" },
      { id: 189, number: 189, title: "Rotate Array", url: "https://leetcode.com/problems/rotate-array/", difficulty: "Medium", pattern: "Two Pointers" },
      { id: 611, number: 611, title: "Valid Triangle Number", url: "https://leetcode.com/problems/valid-triangle-number/", difficulty: "Medium", pattern: "Two Pointers" },
      { id: 881, number: 881, title: "Boats to Save People", url: "https://leetcode.com/problems/boats-to-save-people/", difficulty: "Medium", pattern: "Two Pointers" },
      { id: 42, number: 42, title: "Trapping Rain Water", url: "https://leetcode.com/problems/trapping-rain-water/", difficulty: "Hard", pattern: "Two Pointers" },
    ],
  },
  "sliding window": {
    prerequisites: [
      { title: "Two Pointers", subtitle: "Subarray Traversal" },
      { title: "Hashmap / Frequency", subtitle: "State Tracking" },
    ],
    problems: [
      { id: 121, number: 121, title: "Best Time to Buy and Sell Stock", url: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/", difficulty: "Easy", pattern: "Sliding Window" },
      { id: 219, number: 219, title: "Contains Duplicate II", url: "https://leetcode.com/problems/contains-duplicate-ii/", difficulty: "Easy", pattern: "Sliding Window" },
      { id: 3, number: 3, title: "Longest Substring Without Repeating Characters", url: "https://leetcode.com/problems/longest-substring-without-repeating-characters/", difficulty: "Medium", pattern: "Sliding Window + Hash" },
      { id: 424, number: 424, title: "Longest Repeating Character Replacement", url: "https://leetcode.com/problems/longest-repeating-character-replacement/", difficulty: "Medium", pattern: "Sliding Window" },
      { id: 567, number: 567, title: "Permutation in String", url: "https://leetcode.com/problems/permutation-in-string/", difficulty: "Medium", pattern: "Sliding Window" },
      { id: 76, number: 76, title: "Minimum Window Substring", url: "https://leetcode.com/problems/minimum-window-substring/", difficulty: "Hard", pattern: "Sliding Window + Hashmap" },
    ],
  },
  "prefix sum": {
    prerequisites: [
      { title: "Contiguous Arrays", subtitle: "Cumulative Sum" },
      { title: "Hashmap Lookup", subtitle: "O(1) Range Queries" },
    ],
    problems: [
      { id: 303, number: 303, title: "Range Sum Query - Immutable", url: "https://leetcode.com/problems/range-sum-query-immutable/", difficulty: "Easy", pattern: "Prefix Sum" },
      { id: 724, number: 724, title: "Find Pivot Index", url: "https://leetcode.com/problems/find-pivot-index/", difficulty: "Easy", pattern: "Prefix Sum" },
      { id: 560, number: 560, title: "Subarray Sum Equals K", url: "https://leetcode.com/problems/subarray-sum-equals-k/", difficulty: "Medium", pattern: "Prefix Sum + Hashmap" },
      { id: 525, number: 525, title: "Contiguous Array", url: "https://leetcode.com/problems/contiguous-array/", difficulty: "Medium", pattern: "Prefix Sum + Hashmap" },
      { id: 238, number: 238, title: "Product of Array Except Self", url: "https://leetcode.com/problems/product-of-array-except-self/", difficulty: "Medium", pattern: "Prefix & Suffix Product" },
    ],
  },
  "kadane's algorithm": {
    prerequisites: [
      { title: "Subarray Sums", subtitle: "DP Subproblem Optimal Choice" },
      { title: "Local vs Global Max", subtitle: "O(N) Time Complexity" },
    ],
    problems: [
      { id: 53, number: 53, title: "Maximum Subarray", url: "https://leetcode.com/problems/maximum-subarray/", difficulty: "Medium", pattern: "Kadane's Algorithm" },
      { id: 918, number: 918, title: "Maximum Sum Circular Subarray", url: "https://leetcode.com/problems/maximum-sum-circular-subarray/", difficulty: "Medium", pattern: "Kadane's Algorithm" },
      { id: 152, number: 152, title: "Maximum Product Subarray", url: "https://leetcode.com/problems/maximum-product-subarray/", difficulty: "Medium", pattern: "Kadane's Variant / DP" },
    ],
  },
  "classic binary search": {
    prerequisites: [
      { title: "Sorted Arrays", subtitle: "Divide & Conquer" },
      { title: "Logarithmic Scale", subtitle: "O(log N) Reduction" },
    ],
    problems: [
      { id: 704, number: 704, title: "Binary Search", url: "https://leetcode.com/problems/binary-search/", difficulty: "Easy", pattern: "Classic Binary Search" },
      { id: 35, number: 35, title: "Search Insert Position", url: "https://leetcode.com/problems/search-insert-position/", difficulty: "Easy", pattern: "Classic Binary Search" },
      { id: 74, number: 74, title: "Search a 2D Matrix", url: "https://leetcode.com/problems/search-a-2d-matrix/", difficulty: "Medium", pattern: "2D Binary Search" },
      { id: 33, number: 33, title: "Search in Rotated Sorted Array", url: "https://leetcode.com/problems/search-in-rotated-sorted-array/", difficulty: "Medium", pattern: "Rotated Binary Search" },
    ],
  },
};

interface PracticeTopicDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  topicName: string;
}

export default function PracticeTopicDrawer({
  isOpen,
  onClose,
  topicName,
}: PracticeTopicDrawerProps) {
  const [solvedSet, setSolvedSet] = useState<Record<number, boolean>>({});

  if (!isOpen) return null;

  const keyLower = topicName.toLowerCase();
  const data = TOPIC_DATASET[keyLower] || {
    prerequisites: [
      { title: `${topicName} Fundamentals`, subtitle: "Core Traversal & Concepts" },
      { title: "Time Complexity Analysis", subtitle: "O(N) & O(log N) Bounds" },
    ],
    problems: [
      { id: 1, number: 1, title: `${topicName} Problem 1`, url: `https://leetcode.com/problemset/all/?search=${encodeURIComponent(topicName)}`, difficulty: "Easy", pattern: topicName },
      { id: 2, number: 2, title: `${topicName} Intermediate Challenge`, url: `https://leetcode.com/problemset/all/?search=${encodeURIComponent(topicName)}`, difficulty: "Medium", pattern: topicName },
      { id: 3, number: 3, title: `${topicName} Advanced Hard Target`, url: `https://leetcode.com/problemset/all/?search=${encodeURIComponent(topicName)}`, difficulty: "Hard", pattern: topicName },
    ],
  };

  const solvedCount = data.problems.filter((p) => solvedSet[p.id]).length;

  const toggleSolved = (id: number) => {
    setSolvedSet((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden flex justify-end select-none">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity"
        />

        {/* Slide-over Drawer Panel matching screenshot */}
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
          className="relative w-full max-w-3xl bg-[#0b101d] border-l border-white/[0.1] text-white shadow-2xl h-full flex flex-col z-50 overflow-hidden"
        >
          {/* Header Bar */}
          <div className="p-6 pb-4 border-b border-white/[0.08] bg-[#0e1628] flex items-center justify-between gap-4 shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-mono text-slate-300 font-bold transition-colors"
              >
                ESC
              </button>
              <span className="text-xs font-semibold text-slate-400">Target Problem Bank</span>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                Solved: <span className="font-extrabold">({solvedCount} / {data.problems.length})</span>
              </span>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Drawer Body Scroll Area */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
            {/* Title */}
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                {topicName}
              </h2>
            </div>

            {/* Prerequisites Cards Grid */}
            <div className="space-y-3">
              <h3 className="text-xs font-black tracking-widest text-slate-400 uppercase">
                PREREQUISITES
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {data.prerequisites.map((pre, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-[#131c30] border border-white/[0.08] space-y-1"
                  >
                    <div className="font-bold text-white text-sm md:text-base">{pre.title}</div>
                    <div className="text-xs text-slate-400">{pre.subtitle}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Targeted LeetCode Problem Table */}
            <div className="space-y-4">
              <div className="rounded-2xl border border-white/[0.08] bg-[#111728] overflow-x-auto">
                <table className="w-full text-left text-xs md:text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-white/[0.08] text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                      <th className="py-3.5 px-4 text-center w-12">#</th>
                      <th className="py-3.5 px-4">LeetCode</th>
                      <th className="py-3.5 px-4">Problem</th>
                      <th className="py-3.5 px-4">Level</th>
                      <th className="py-3.5 px-4">Pattern</th>
                      <th className="py-3.5 px-4 text-center w-16">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.05]">
                    {data.problems.map((p, idx) => {
                      const isSolved = !!solvedSet[p.id];
                      return (
                        <tr
                          key={p.id}
                          className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
                          onClick={() => toggleSolved(p.id)}
                        >
                          {/* Row Index */}
                          <td className="py-4 px-4 text-center text-slate-500 font-mono font-bold">
                            {idx + 1}
                          </td>

                          {/* LeetCode Problem Number */}
                          <td className="py-4 px-4 font-mono font-extrabold text-blue-400 group-hover:text-blue-300">
                            {p.number}
                          </td>

                          {/* Problem Title Link */}
                          <td className="py-4 px-4">
                            <a
                              href={p.url}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className={`font-bold inline-flex items-center gap-1.5 transition-colors ${
                                isSolved
                                  ? "text-slate-400 line-through"
                                  : "text-slate-200 group-hover:text-white"
                              }`}
                            >
                              <span>{p.title}</span>
                              <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400" />
                            </a>
                          </td>

                          {/* Level Badge */}
                          <td className="py-4 px-4">
                            <span
                              className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                                p.difficulty === "Easy"
                                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                  : p.difficulty === "Medium"
                                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                  : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                              }`}
                            >
                              {p.difficulty}
                            </span>
                          </td>

                          {/* Algorithm Pattern Badge */}
                          <td className="py-4 px-4">
                            <span className="text-xs font-semibold px-3 py-1 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                              {p.pattern}
                            </span>
                          </td>

                          {/* Checkbox Status */}
                          <td className="py-4 px-4 text-center">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSolved(p.id);
                              }}
                              className={`w-5 h-5 rounded-md border flex items-center justify-center mx-auto transition-colors ${
                                isSolved
                                  ? "bg-emerald-500 border-emerald-400 text-white"
                                  : "border-slate-600 bg-slate-800/80 text-transparent hover:border-slate-400"
                              }`}
                            >
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
