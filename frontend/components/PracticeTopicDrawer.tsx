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
      { title: "Arrays & Pointers", subtitle: "Basic Traversal" },
      { title: "In-Place Swapping", subtitle: "O(1) Space Memory" },
    ],
    problems: [
      { id: 643, number: 643, title: "Maximum Average Subarray I", url: "https://leetcode.com/problems/maximum-average-subarray-i/", difficulty: "Easy", pattern: "Fixed Sliding Window" },
      { id: 209, number: 209, title: "Minimum Size Subarray Sum", url: "https://leetcode.com/problems/minimum-size-subarray-sum/", difficulty: "Medium", pattern: "Variable Sliding Window" },
      { id: 713, number: 713, title: "Subarray Product Less Than K", url: "https://leetcode.com/problems/subarray-product-less-than-k/", difficulty: "Medium", pattern: "Variable Sliding Window" },
      { id: 904, number: 904, title: "Fruit Into Baskets", url: "https://leetcode.com/problems/fruit-into-baskets/", difficulty: "Medium", pattern: "Variable Sliding Window" },
      { id: 930, number: 930, title: "Binary Subarrays With Sum", url: "https://leetcode.com/problems/binary-subarrays-with-sum/", difficulty: "Medium", pattern: "Sliding Window + Prefix Sum" },
      { id: 1004, number: 1004, title: "Max Consecutive Ones III", url: "https://leetcode.com/problems/max-consecutive-ones-iii/", difficulty: "Medium", pattern: "Variable Sliding Window" },
      { id: 1052, number: 1052, title: "Grumpy Bookstore Owner", url: "https://leetcode.com/problems/grumpy-bookstore-owner/", difficulty: "Medium", pattern: "Fixed Sliding Window" },
      { id: 1248, number: 1248, title: "Count Number of Nice Subarrays", url: "https://leetcode.com/problems/count-number-of-nice-subarrays/", difficulty: "Medium", pattern: "Sliding Window + Prefix Sum" },
      { id: 1343, number: 1343, title: "Number of Sub-arrays of Size K and Average Greater than or Equal to Threshold", url: "https://leetcode.com/problems/number-of-sub-arrays-of-size-k-and-average-greater-than-or-equal-to-threshold/", difficulty: "Medium", pattern: "Fixed Sliding Window" },
      { id: 1423, number: 1423, title: "Maximum Points You Can Obtain from Cards", url: "https://leetcode.com/problems/maximum-points-you-can-obtain-from-cards/", difficulty: "Medium", pattern: "Fixed Sliding Window" },
      { id: 1493, number: 1493, title: "Longest Subarray of 1's After Deleting One Element", url: "https://leetcode.com/problems/longest-subarray-of-1s-after-deleting-one-element/", difficulty: "Medium", pattern: "Variable Sliding Window" },
      { id: 1658, number: 1658, title: "Minimum Operations to Reduce X to Zero", url: "https://leetcode.com/problems/minimum-operations-to-reduce-x-to-zero/", difficulty: "Medium", pattern: "Sliding Window" },
      { id: 1695, number: 1695, title: "Maximum Erasure Value", url: "https://leetcode.com/problems/maximum-erasure-value/", difficulty: "Medium", pattern: "Sliding Window + Hash Set" },
      { id: 1838, number: 1838, title: "Frequency of the Most Frequent Element", url: "https://leetcode.com/problems/frequency-of-the-most-frequent-element/", difficulty: "Medium", pattern: "Sliding Window + Sorting" },
      { id: 2024, number: 2024, title: "Maximize the Confusion of an Exam", url: "https://leetcode.com/problems/maximize-the-confusion-of-an-exam/", difficulty: "Medium", pattern: "Variable Sliding Window" },
      { id: 2958, number: 2958, title: "Length of Longest Subarray With at Most K Frequency", url: "https://leetcode.com/problems/length-of-longest-subarray-with-at-most-k-frequency/", difficulty: "Medium", pattern: "Sliding Window + Hash Map" },
      { id: 992, number: 992, title: "Subarrays with K Different Integers", url: "https://leetcode.com/problems/subarrays-with-k-different-integers/", difficulty: "Hard", pattern: "Variable Sliding Window" },
    ],
  },
  "prefix sum": {
    prerequisites: [
      { title: "Arrays & Pointers", subtitle: "Basic Traversal" },
      { title: "In-Place Swapping", subtitle: "O(1) Space Memory" },
    ],
    problems: [
      { id: 1480, number: 1480, title: "Running Sum of 1d Array", url: "https://leetcode.com/problems/running-sum-of-1d-array/", difficulty: "Easy", pattern: "Prefix Sum" },
      { id: 724, number: 724, title: "Find Pivot Index", url: "https://leetcode.com/problems/find-pivot-index/", difficulty: "Easy", pattern: "Prefix Sum" },
      { id: 303, number: 303, title: "Range Sum Query – Immutable", url: "https://leetcode.com/problems/range-sum-query-immutable/", difficulty: "Easy", pattern: "Prefix Sum" },
      { id: 1732, number: 1732, title: "Find the Highest Altitude", url: "https://leetcode.com/problems/find-the-highest-altitude/", difficulty: "Easy", pattern: "Prefix Sum" },
      { id: 1991, number: 1991, title: "Find the Middle Index in Array", url: "https://leetcode.com/problems/find-the-middle-index-in-array/", difficulty: "Easy", pattern: "Prefix Sum" },
      { id: 238, number: 238, title: "Product of Array Except Self", url: "https://leetcode.com/problems/product-of-array-except-self/", difficulty: "Medium", pattern: "Prefix & Suffix Product" },
      { id: 560, number: 560, title: "Subarray Sum Equals K", url: "https://leetcode.com/problems/subarray-sum-equals-k/", difficulty: "Medium", pattern: "Prefix Sum + Hash Map" },
      { id: 525, number: 525, title: "Contiguous Array", url: "https://leetcode.com/problems/contiguous-array/", difficulty: "Medium", pattern: "Prefix Sum + Hash Map" },
      { id: 523, number: 523, title: "Continuous Subarray Sum", url: "https://leetcode.com/problems/continuous-subarray-sum/", difficulty: "Medium", pattern: "Prefix Sum + Hash Map" },
      { id: 930, number: 930, title: "Binary Subarrays With Sum", url: "https://leetcode.com/problems/binary-subarrays-with-sum/", difficulty: "Medium", pattern: "Prefix Sum" },
      { id: 974, number: 974, title: "Subarray Sums Divisible by K", url: "https://leetcode.com/problems/subarray-sums-divisible-by-k/", difficulty: "Medium", pattern: "Prefix Sum + Hash Map" },
      { id: 1248, number: 1248, title: "Count Number of Nice Subarrays", url: "https://leetcode.com/problems/count-number-of-nice-subarrays/", difficulty: "Medium", pattern: "Prefix Sum" },
      { id: 1314, number: 1314, title: "Matrix Block Sum", url: "https://leetcode.com/problems/matrix-block-sum/", difficulty: "Medium", pattern: "2D Prefix Sum" },
      { id: 1352, number: 1352, title: "Product of the Last K Numbers", url: "https://leetcode.com/problems/product-of-the-last-k-numbers/", difficulty: "Medium", pattern: "Prefix Product" },
      { id: 304, number: 304, title: "Range Sum Query 2D – Immutable", url: "https://leetcode.com/problems/range-sum-query-2d-immutable/", difficulty: "Medium", pattern: "2D Prefix Sum" },
      { id: 327, number: 327, title: "Count of Range Sum", url: "https://leetcode.com/problems/count-of-range-sum/", difficulty: "Hard", pattern: "Prefix Sum + Divide & Conquer" },
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

        {/* Slide-over Drawer Panel with wider max-w-5xl layout */}
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
          className="relative w-full max-w-4xl xl:max-w-5xl bg-[#0b101d] border-l border-white/[0.1] text-white shadow-2xl h-full flex flex-col z-50 overflow-hidden"
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
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1 rounded-full">
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
              <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
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
                    className="p-5 rounded-2xl bg-[#131c30] border border-white/[0.08] space-y-1 shadow-md"
                  >
                    <div className="font-bold text-white text-base">{pre.title}</div>
                    <div className="text-xs text-slate-400">{pre.subtitle}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Targeted LeetCode Problem Table */}
            <div className="space-y-4">
              <div className="rounded-2xl border border-white/[0.08] bg-[#111728] overflow-x-auto shadow-xl">
                <table className="w-full text-left text-xs md:text-sm border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b border-white/[0.08] text-slate-400 font-bold uppercase tracking-wider text-[11px] bg-slate-900/40">
                      <th className="py-4 px-4 text-center w-12">#</th>
                      <th className="py-4 px-4 w-20">LeetCode</th>
                      <th className="py-4 px-4">Problem</th>
                      <th className="py-4 px-4 w-24">Level</th>
                      <th className="py-4 px-4 w-48">Pattern</th>
                      <th className="py-4 px-4 text-center w-16">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.05]">
                    {data.problems.map((p, idx) => {
                      const isSolved = !!solvedSet[p.id];
                      return (
                        <tr
                          key={p.id}
                          className="hover:bg-white/[0.03] transition-colors group cursor-pointer"
                          onClick={() => toggleSolved(p.id)}
                        >
                          {/* Row Index */}
                          <td className="py-3.5 px-4 text-center text-slate-500 font-mono font-bold whitespace-nowrap">
                            {idx + 1}
                          </td>

                          {/* LeetCode Problem Number */}
                          <td className="py-3.5 px-4 font-mono font-extrabold text-blue-400 group-hover:text-blue-300 whitespace-nowrap">
                            {p.number}
                          </td>

                          {/* Problem Title Link */}
                          <td className="py-3.5 px-4">
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
                              <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 shrink-0" />
                            </a>
                          </td>

                          {/* Level Badge */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span
                              className={`text-xs font-bold px-2.5 py-1 rounded-lg inline-block ${
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
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="text-xs font-semibold px-3 py-1 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 inline-block">
                              {p.pattern}
                            </span>
                          </td>

                          {/* Checkbox Status */}
                          <td className="py-3.5 px-4 text-center whitespace-nowrap">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSolved(p.id);
                              }}
                              className={`w-5 h-5 rounded-md border flex items-center justify-center mx-auto transition-colors ${
                                isSolved
                                  ? "bg-emerald-500 border-emerald-400 text-white shadow-md shadow-emerald-500/30"
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
