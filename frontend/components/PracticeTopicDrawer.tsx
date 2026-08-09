"use client";

import React from "react";
import { X, ExternalLink, Check, Video, BookOpen, Clock, Zap, PlayCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface LeetCodeProblem {
  id: number;
  number: number;
  title: string;
  url: string;
  difficulty: "Easy" | "Medium" | "Hard";
  pattern: string;
  solutionVideoUrl?: string;
}

export interface Prerequisite {
  title: string;
  subtitle: string;
}

export interface PracticeTopicData {
  definition: string;
  timeComplexity: string;
  spaceComplexity: string;
  masterclassVideoUrl: string;
  prerequisites: Prerequisite[];
  problems: LeetCodeProblem[];
}

const COMMON_PREREQS = [
  { title: "Arrays & Pointers", subtitle: "Basic Traversal & Indexing" },
  { title: "In-Place Swapping", subtitle: "O(1) Memory Optimization" },
];

const TOPIC_DATASET: Record<string, PracticeTopicData> = {
  "two pointers": {
    definition:
      "Two Pointers is an optimized algorithm pattern where two references iterate through a data structure (array/string) simultaneously. Pointers can move from opposite ends towards each other or at different speeds (slow/fast) to solve pair-sum, sorting, and partition problems in optimal O(N) time with O(1) space.",
    timeComplexity: "O(N)",
    spaceComplexity: "O(1)",
    masterclassVideoUrl: "https://www.youtube.com/watch?v=On03HWe2tZM",
    prerequisites: COMMON_PREREQS,
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
    definition:
      "Two Pointer strategy on strings/sequences uses two indices to check palindromes, reverse subsegments, or match subsequences efficiently in O(N) linear time.",
    timeComplexity: "O(N)",
    spaceComplexity: "O(1)",
    masterclassVideoUrl: "https://www.youtube.com/watch?v=On03HWe2tZM",
    prerequisites: COMMON_PREREQS,
    problems: [
      { id: 125, number: 125, title: "Valid Palindrome", url: "https://leetcode.com/problems/valid-palindrome/", difficulty: "Easy", pattern: "Two Pointers" },
      { id: 344, number: 344, title: "Reverse String", url: "https://leetcode.com/problems/reverse-string/", difficulty: "Easy", pattern: "Two Pointers" },
      { id: 345, number: 345, title: "Reverse Vowels of a String", url: "https://leetcode.com/problems/reverse-vowels-of-a-string/", difficulty: "Easy", pattern: "Two Pointers" },
      { id: 392, number: 392, title: "Is Subsequence", url: "https://leetcode.com/problems/is-subsequence/", difficulty: "Easy", pattern: "Two Pointers" },
      { id: 1768, number: 1768, title: "Merge Strings Alternately", url: "https://leetcode.com/problems/merge-strings-alternately/", difficulty: "Easy", pattern: "Two Pointers" },
      { id: 28, number: 28, title: "Find the Index of the First Occurrence in a String", url: "https://leetcode.com/problems/find-the-index-of-the-first-occurrence-in-a-string/", difficulty: "Easy", pattern: "Two Pointers" },
      { id: 151, number: 151, title: "Reverse Words in a String", url: "https://leetcode.com/problems/reverse-words-in-a-string/", difficulty: "Medium", pattern: "Two Pointers" },
      { id: 443, number: 443, title: "String Compression", url: "https://leetcode.com/problems/string-compression/", difficulty: "Medium", pattern: "Two Pointers" },
      { id: 680, number: 680, title: "Valid Palindrome II", url: "https://leetcode.com/problems/valid-palindrome-ii/", difficulty: "Medium", pattern: "Two Pointers" },
      { id: 165, number: 165, title: "Compare Version Numbers", url: "https://leetcode.com/problems/compare-version-numbers/", difficulty: "Medium", pattern: "Two Pointers" },
      { id: 2109, number: 2109, title: "Adding Spaces to a String", url: "https://leetcode.com/problems/adding-spaces-to-a-string/", difficulty: "Medium", pattern: "Two Pointers" },
      { id: 408, number: 408, title: "Valid Word Abbreviation", url: "https://leetcode.com/problems/valid-word-abbreviation/", difficulty: "Hard", pattern: "Two Pointers" },
    ],
  },

  "sliding window": {
    definition:
      "Sliding Window maintains a dynamic or fixed subarray boundary between two pointers. By adding new elements on the right and removing invalid ones from the left, it converts O(N²) subarray brute-force problems into O(N) linear time algorithms.",
    timeComplexity: "O(N)",
    spaceComplexity: "O(1) / O(K)",
    masterclassVideoUrl: "https://www.youtube.com/watch?v=p-ss2JNynmw",
    prerequisites: COMMON_PREREQS,
    problems: [
      { id: 643, number: 643, title: "Maximum Average Subarray I", url: "https://leetcode.com/problems/maximum-average-subarray-i/", difficulty: "Easy", pattern: "Fixed Sliding Window" },
      { id: 209, number: 209, title: "Minimum Size Subarray Sum", url: "https://leetcode.com/problems/minimum-size-subarray-sum/", difficulty: "Medium", pattern: "Variable Sliding Window" },
      { id: 713, number: 713, title: "Subarray Product Less Than K", url: "https://leetcode.com/problems/subarray-product-less-than-k/", difficulty: "Medium", pattern: "Variable Sliding Window" },
      { id: 904, number: 904, title: "Fruit Into Baskets", url: "https://leetcode.com/problems/fruit-into-baskets/", difficulty: "Medium", pattern: "Variable Sliding Window" },
      { id: 930, number: 930, title: "Binary Subarrays With Sum", url: "https://leetcode.com/problems/binary-subarrays-with-sum/", difficulty: "Medium", pattern: "Sliding Window + Prefix Sum" },
      { id: 1004, number: 1004, title: "Max Consecutive Ones III", url: "https://leetcode.com/problems/max-consecutive-ones-iii/", difficulty: "Medium", pattern: "Variable Sliding Window" },
      { id: 1052, number: 1052, title: "Grumpy Bookstore Owner", url: "https://leetcode.com/problems/grumpy-bookstore-owner/", difficulty: "Medium", pattern: "Fixed Sliding Window" },
      { id: 1248, number: 1248, title: "Count Number of Nice Subarrays", url: "https://leetcode.com/problems/count-number-of-nice-subarrays/", difficulty: "Medium", pattern: "Sliding Window + Prefix Sum" },
      { id: 1343, number: 1343, title: "Number of Sub-arrays of Size K", url: "https://leetcode.com/problems/number-of-sub-arrays-of-size-k-and-average-greater-than-or-equal-to-threshold/", difficulty: "Medium", pattern: "Fixed Sliding Window" },
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
    definition:
      "Prefix Sum precomputes cumulative sums into an auxiliary array `P` where `P[i] = A[0] + ... + A[i]`. This enables O(1) range sum queries between indices `i` and `j` via `P[j] - P[i-1]`. Combined with HashMaps, it efficiently solves Subarray Sum Equals K in O(N) time.",
    timeComplexity: "O(N) Preprocessing, O(1) Query",
    spaceComplexity: "O(N)",
    masterclassVideoUrl: "https://www.youtube.com/watch?v=pVS3yhlzRLQ",
    prerequisites: COMMON_PREREQS,
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
      { id: 974, number: 974, title: "Subarray Sums Divisible by K", url: "https://leetcode.com/problems/subarray-sums-divisible-by-k/", difficulty: "Medium", pattern: "Prefix Sum + Hash Map" },
      { id: 1314, number: 1314, title: "Matrix Block Sum", url: "https://leetcode.com/problems/matrix-block-sum/", difficulty: "Medium", pattern: "2D Prefix Sum" },
      { id: 1352, number: 1352, title: "Product of the Last K Numbers", url: "https://leetcode.com/problems/product-of-the-last-k-numbers/", difficulty: "Medium", pattern: "Prefix Product" },
    ],
  },

  "kadane's algorithm": {
    definition:
      "Kadane's Algorithm finds the maximum sum contiguous subarray in linear O(N) time. By maintaining a running current sum `curr = max(x, curr + x)`, it dynamically decides whether to extend the existing subarray or start fresh from the current element.",
    timeComplexity: "O(N)",
    spaceComplexity: "O(1)",
    masterclassVideoUrl: "https://www.youtube.com/watch?v=AHZpyENo7k4",
    prerequisites: COMMON_PREREQS,
    problems: [
      { id: 53, number: 53, title: "Maximum Subarray", url: "https://leetcode.com/problems/maximum-subarray/", difficulty: "Easy", pattern: "Kadane's Algorithm" },
      { id: 918, number: 918, title: "Maximum Sum Circular Subarray", url: "https://leetcode.com/problems/maximum-sum-circular-subarray/", difficulty: "Medium", pattern: "Kadane's Algorithm (Circular)" },
      { id: 1749, number: 1749, title: "Maximum Absolute Sum of Any Subarray", url: "https://leetcode.com/problems/maximum-absolute-sum-of-any-subarray/", difficulty: "Medium", pattern: "Kadane's Algorithm" },
      { id: 1191, number: 1191, title: "K-Concatenation Maximum Sum", url: "https://leetcode.com/problems/k-concatenation-maximum-sum/", difficulty: "Medium", pattern: "Kadane's Algorithm" },
      { id: 2321, number: 2321, title: "Maximum Score Of Spliced Array", url: "https://leetcode.com/problems/maximum-score-of-spliced-array/", difficulty: "Hard", pattern: "Kadane's Algorithm" },
    ],
  },

  "frequency map": {
    definition:
      "Frequency Mapping utilizes Hash Tables or Frequency Arrays to store and retrieve counts of elements in O(1) average time. Essential for anagram matching, two sum lookups, duplicate detection, and top-k frequent element tracking.",
    timeComplexity: "O(N) Build, O(1) Lookup",
    spaceComplexity: "O(N)",
    masterclassVideoUrl: "https://www.youtube.com/watch?v=KLlXCFG5TnA",
    prerequisites: COMMON_PREREQS,
    problems: [
      { id: 1, number: 1, title: "Two Sum", url: "https://leetcode.com/problems/two-sum/", difficulty: "Easy", pattern: "Hash Map" },
      { id: 217, number: 217, title: "Contains Duplicate", url: "https://leetcode.com/problems/contains-duplicate/", difficulty: "Easy", pattern: "Hash Set / Frequency Map" },
      { id: 219, number: 219, title: "Contains Duplicate II", url: "https://leetcode.com/problems/contains-duplicate-ii/", difficulty: "Easy", pattern: "Hash Map" },
      { id: 242, number: 242, title: "Valid Anagram", url: "https://leetcode.com/problems/valid-anagram/", difficulty: "Easy", pattern: "Frequency Map" },
      { id: 383, number: 383, title: "Ransom Note", url: "https://leetcode.com/problems/ransom-note/", difficulty: "Easy", pattern: "Frequency Map" },
      { id: 387, number: 387, title: "First Unique Character in a String", url: "https://leetcode.com/problems/first-unique-character-in-a-string/", difficulty: "Easy", pattern: "Frequency Map" },
      { id: 389, number: 389, title: "Find the Difference", url: "https://leetcode.com/problems/find-the-difference/", difficulty: "Easy", pattern: "Frequency Map" },
      { id: 1207, number: 1207, title: "Unique Number of Occurrences", url: "https://leetcode.com/problems/unique-number-of-occurrences/", difficulty: "Easy", pattern: "Frequency Map" },
      { id: 1512, number: 1512, title: "Number of Good Pairs", url: "https://leetcode.com/problems/number-of-good-pairs/", difficulty: "Easy", pattern: "Frequency Map" },
      { id: 169, number: 169, title: "Majority Element", url: "https://leetcode.com/problems/majority-element/", difficulty: "Easy", pattern: "Frequency Map" },
      { id: 49, number: 49, title: "Group Anagrams", url: "https://leetcode.com/problems/group-anagrams/", difficulty: "Medium", pattern: "Frequency Map" },
      { id: 347, number: 347, title: "Top K Frequent Elements", url: "https://leetcode.com/problems/top-k-frequent-elements/", difficulty: "Medium", pattern: "Frequency Map + Heap" },
    ],
  },

  "classic binary search": {
    definition:
      "Classic Binary Search divides a sorted search space in half during each step, comparing the target against `mid = (left + right) / 2`. This reduces search time from linear O(N) to logarithmic O(log N). Also applies to binary search on answer range.",
    timeComplexity: "O(log N)",
    spaceComplexity: "O(1)",
    masterclassVideoUrl: "https://www.youtube.com/watch?v=s4DPM8ct1pI",
    prerequisites: COMMON_PREREQS,
    problems: [
      { id: 704, number: 704, title: "Binary Search", url: "https://leetcode.com/problems/binary-search/", difficulty: "Easy", pattern: "Classic Binary Search" },
      { id: 35, number: 35, title: "Search Insert Position", url: "https://leetcode.com/problems/search-insert-position/", difficulty: "Easy", pattern: "Classic Binary Search" },
      { id: 69, number: 69, title: "Sqrt(x)", url: "https://leetcode.com/problems/sqrtx/", difficulty: "Easy", pattern: "Binary Search on Answer" },
      { id: 278, number: 278, title: "First Bad Version", url: "https://leetcode.com/problems/first-bad-version/", difficulty: "Easy", pattern: "Binary Search" },
      { id: 374, number: 374, title: "Guess Number Higher or Lower", url: "https://leetcode.com/problems/guess-number-higher-or-lower/", difficulty: "Easy", pattern: "Classic Binary Search" },
      { id: 33, number: 33, title: "Search in Rotated Sorted Array", url: "https://leetcode.com/problems/search-in-rotated-sorted-array/", difficulty: "Medium", pattern: "Binary Search (Rotated)" },
      { id: 34, number: 34, title: "Find First and Last Position of Element", url: "https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/", difficulty: "Medium", pattern: "Lower/Upper Bound" },
      { id: 74, number: 74, title: "Search a 2D Matrix", url: "https://leetcode.com/problems/search-a-2d-matrix/", difficulty: "Medium", pattern: "Binary Search" },
      { id: 153, number: 153, title: "Find Minimum in Rotated Sorted Array", url: "https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/", difficulty: "Medium", pattern: "Binary Search" },
      { id: 162, number: 162, title: "Find Peak Element", url: "https://leetcode.com/problems/find-peak-element/", difficulty: "Medium", pattern: "Binary Search" },
      { id: 875, number: 875, title: "Koko Eating Bananas", url: "https://leetcode.com/problems/koko-eating-bananas/", difficulty: "Medium", pattern: "Binary Search on Answer" },
      { id: 1011, number: 1011, title: "Capacity To Ship Packages Within D Days", url: "https://leetcode.com/problems/capacity-to-ship-packages-within-d-days/", difficulty: "Medium", pattern: "Binary Search on Answer" },
    ],
  },
};

// Helper to construct exact YouTube Solution video search URL for any problem
function getYoutubeSolutionUrl(p: LeetCodeProblem): string {
  const query = `LeetCode ${p.number} ${p.title} NeetCode solution`;
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}

interface PracticeTopicDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  topicName: string;
  solvedSet: Record<number, boolean>;
  onToggleSolved: (id: number, details?: { title: string; difficulty: string; pattern: string }) => void;
}

export default function PracticeTopicDrawer({
  isOpen,
  onClose,
  topicName,
  solvedSet,
  onToggleSolved,
}: PracticeTopicDrawerProps) {
  if (!isOpen) return null;

  const keyLower = topicName.toLowerCase();
  const data = TOPIC_DATASET[keyLower] || {
    definition: `${topicName} pattern fundamentals, optimal time and space complexity strategy for data structure problems.`,
    timeComplexity: "O(N)",
    spaceComplexity: "O(1)",
    masterclassVideoUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${topicName} DSA tutorial NeetCode`)}`,
    prerequisites: COMMON_PREREQS,
    problems: [
      { id: 1, number: 1, title: `${topicName} Problem 1`, url: `https://leetcode.com/problemset/all/?search=${encodeURIComponent(topicName)}`, difficulty: "Easy", pattern: topicName },
      { id: 2, number: 2, title: `${topicName} Intermediate Challenge`, url: `https://leetcode.com/problemset/all/?search=${encodeURIComponent(topicName)}`, difficulty: "Medium", pattern: topicName },
      { id: 3, number: 3, title: `${topicName} Advanced Hard Target`, url: `https://leetcode.com/problemset/all/?search=${encodeURIComponent(topicName)}`, difficulty: "Hard", pattern: topicName },
    ],
  };

  const solvedCount = data.problems.filter((p) => solvedSet[p.id]).length;

  const toggleSolved = (p: LeetCodeProblem) => {
    onToggleSolved(p.id, { title: p.title, difficulty: p.difficulty, pattern: p.pattern });
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
          className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        />

        {/* Slide-over Drawer Panel */}
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
          className="relative w-full max-w-4xl xl:max-w-5xl bg-white border-l border-slate-200 text-slate-900 shadow-2xl h-full flex flex-col z-50 overflow-hidden"
        >
          {/* Header Bar */}
          <div className="p-6 pb-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between gap-4 shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 rounded-lg text-xs font-mono text-slate-700 font-bold transition-colors"
              >
                ESC
              </button>
              <span className="text-xs font-semibold text-slate-500">Foundation Concept & Problem Bank</span>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-200 px-3.5 py-1 rounded-full">
                Solved: <span className="font-extrabold">({solvedCount} / {data.problems.length})</span>
              </span>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Drawer Body Scroll Area */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
            {/* Title & Topic Header */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                    {topicName}
                  </h2>
                  <p className="text-xs font-bold text-slate-600 mt-1 flex items-center gap-3">
                    <span>Time Complexity: <strong className="text-emerald-700">{data.timeComplexity}</strong></span>
                    <span>•</span>
                    <span>Space Complexity: <strong className="text-blue-700">{data.spaceComplexity}</strong></span>
                  </p>
                </div>

                {/* Topic Masterclass YouTube Video Button */}
                <a
                  href={data.masterclassVideoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-xs border border-rose-500 transition-all self-start sm:self-auto shrink-0 group cursor-pointer"
                >
                  <Video className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
                  <span>Watch Pattern Masterclass 📺</span>
                </a>
              </div>

              {/* Concept Definition Box */}
              <div className="p-6 rounded-[24px] bg-emerald-50/60 border border-emerald-200/80 text-sm text-slate-800 leading-relaxed shadow-xs">
                <div className="flex items-center gap-2 text-xs font-extrabold text-[#234B3B] uppercase tracking-wider mb-2">
                  <BookOpen className="w-4 h-4 text-[#234B3B]" />
                  <span>Pattern Concept &amp; Definition</span>
                </div>
                <p className="font-medium text-slate-700">{data.definition}</p>
              </div>
            </div>

            {/* Prerequisites Cards Grid */}
            <div className="space-y-3">
              <h3 className="text-xs font-extrabold tracking-widest text-slate-500 uppercase">
                PREREQUISITES
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {data.prerequisites.map((pre, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-white border border-slate-200/80 space-y-1 shadow-xs"
                  >
                    <div className="font-extrabold text-slate-900 text-sm">{pre.title}</div>
                    <div className="text-xs text-slate-500 font-medium">{pre.subtitle}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Targeted LeetCode Problem Table with Video Solutions */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold tracking-widest text-slate-500 uppercase">
                  PROBLEM BANK &amp; EXACT VIDEO SOLUTIONS
                </h3>
                <span className="text-xs text-slate-500 font-medium">Click row or checkmark to toggle solved state</span>
              </div>

              <div className="rounded-[24px] border border-slate-200 bg-white overflow-x-auto shadow-xs">
                <table className="w-full text-left text-xs md:text-sm border-collapse min-w-[760px]">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px] bg-slate-50">
                      <th className="py-4 px-4 text-center w-12">#</th>
                      <th className="py-4 px-4 w-20">LeetCode</th>
                      <th className="py-4 px-4">Problem</th>
                      <th className="py-4 px-4 w-24">Level</th>
                      <th className="py-4 px-4 w-40">Video Solution</th>
                      <th className="py-4 px-4 text-center w-16">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.problems.map((p, idx) => {
                      const isSolved = !!solvedSet[p.id];
                      const videoUrl = p.solutionVideoUrl || getYoutubeSolutionUrl(p);

                      return (
                        <tr
                          key={p.id}
                          className="hover:bg-slate-50 transition-colors group cursor-pointer"
                          onClick={() => toggleSolved(p)}
                        >
                          {/* Row Index */}
                          <td className="py-3.5 px-4 text-center text-slate-400 font-mono font-bold whitespace-nowrap">
                            {idx + 1}
                          </td>

                          {/* LeetCode Problem Number */}
                          <td className="py-3.5 px-4 font-mono font-extrabold text-blue-700 whitespace-nowrap">
                            #{p.number}
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
                                  : "text-slate-900 group-hover:text-[#234B3B]"
                              }`}
                            >
                              <span>{p.title}</span>
                              <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#234B3B] shrink-0" />
                            </a>
                          </td>

                          {/* Level Badge */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span
                              className={`text-xs font-bold px-3 py-1 rounded-full inline-block ${
                                p.difficulty === "Easy"
                                  ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                  : p.difficulty === "Medium"
                                  ? "bg-amber-100 text-amber-900 border border-amber-200"
                                  : "bg-rose-100 text-rose-800 border border-rose-200"
                              }`}
                            >
                              {p.difficulty}
                            </span>
                          </td>

                          {/* Video Solution YouTube Link */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <a
                              href={videoUrl}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-extrabold transition-all group/vid"
                              title={`Watch accurate video solution for ${p.title}`}
                            >
                              <PlayCircle className="w-3.5 h-3.5 text-rose-600 group-hover/vid:scale-110 transition-transform" />
                              <span>Solution 📺</span>
                            </a>
                          </td>

                          {/* Checkbox Status */}
                          <td className="py-3.5 px-4 text-center whitespace-nowrap">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSolved(p);
                              }}
                              className={`w-5 h-5 rounded-md border flex items-center justify-center mx-auto transition-colors cursor-pointer ${
                                isSolved
                                  ? "bg-[#234B3B] border-[#234B3B] text-white shadow-xs"
                                  : "border-slate-300 bg-white text-transparent hover:border-[#234B3B]"
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
