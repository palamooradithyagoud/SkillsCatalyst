export type Difficulty = "Easy" | "Medium" | "Hard";
export type Platform = "leetcode" | "geeksforgeeks" | "interviewbit";

export interface ShradhaProblem {
  id: string;
  title: string;
  platform: Platform;
  difficulty: Difficulty;
  url: string;
  companies: string[];
  day: number;
}

export interface ShradhaCategory {
  id: string;
  title: string;
  dayRange: string;
  description: string;
  problems: ShradhaProblem[];
}

function makeUrl(slug: string, platform: Platform): string {
  if (platform === "leetcode") {
    return `https://leetcode.com/problems/${slug}/`;
  }
  if (platform === "interviewbit") {
    return `https://www.interviewbit.com/problems/${slug}/`;
  }
  return `https://www.geeksforgeeks.org/${slug}/`;
}

export const SHRADHA_DSA_CATEGORIES: ShradhaCategory[] = [
  {
    id: "arrays-basics",
    title: "Arrays & Vectors Foundations",
    dayRange: "Day 1 - 3",
    description: "Master indexing, prefix sums, two pointers, and Kadane's algorithm.",
    problems: [
      { id: "sk-arr-1", title: "Reverse an Array", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("reverse-an-array", "geeksforgeeks"), companies: ["Microsoft", "Amazon"], day: 1 },
      { id: "sk-arr-2", title: "Maximum and Minimum in an Array", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("maximum-and-minimum-in-an-array", "geeksforgeeks"), companies: ["Microsoft", "Google"], day: 1 },
      { id: "sk-arr-3", title: "Maximum Subarray (Kadane's Algorithm)", platform: "leetcode", difficulty: "Medium", url: makeUrl("maximum-subarray", "leetcode"), companies: ["Microsoft", "Amazon", "Google"], day: 1 },
      { id: "sk-arr-4", title: "Contains Duplicate", platform: "leetcode", difficulty: "Easy", url: makeUrl("contains-duplicate", "leetcode"), companies: ["Apple", "Amazon"], day: 2 },
      { id: "sk-arr-5", title: "Chocolate Distribution Problem", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("chocolate-distribution-problem", "geeksforgeeks"), companies: ["Amazon", "Microsoft"], day: 2 },
      { id: "sk-arr-6", title: "Search in Rotated Sorted Array", platform: "leetcode", difficulty: "Medium", url: makeUrl("search-in-rotated-sorted-array", "leetcode"), companies: ["Google", "Microsoft", "Netflix"], day: 2 },
      { id: "sk-arr-7", title: "Best Time to Buy and Sell Stock", platform: "leetcode", difficulty: "Easy", url: makeUrl("best-time-to-buy-and-sell-stock", "leetcode"), companies: ["Amazon", "Apple", "Microsoft"], day: 3 },
      { id: "sk-arr-8", title: "Repeat and Missing Number Array", platform: "interviewbit", difficulty: "Medium", url: makeUrl("repeat-and-missing-number-array", "interviewbit"), companies: ["Amazon", "Google"], day: 3 },
      { id: "sk-arr-9", title: "Trapping Rain Water", platform: "leetcode", difficulty: "Hard", url: makeUrl("trapping-rain-water", "leetcode"), companies: ["Google", "Amazon", "Apple"], day: 3 },
      { id: "sk-arr-10", title: "Product of Array Except Self", platform: "leetcode", difficulty: "Medium", url: makeUrl("product-of-array-except-self", "leetcode"), companies: ["Apple", "Amazon", "Netflix"], day: 3 },
    ],
  },
  {
    id: "two-pointers-sorting",
    title: "Two Pointers, Sliding Window & 2D Matrices",
    dayRange: "Day 4 - 6",
    description: "Critical algorithmic patterns for high-frequency FAANG technical screens.",
    problems: [
      { id: "sk-arr-11", title: "Two Sum", platform: "leetcode", difficulty: "Easy", url: makeUrl("two-sum", "leetcode"), companies: ["Google", "Apple", "Microsoft"], day: 4 },
      { id: "sk-arr-12", title: "3Sum", platform: "leetcode", difficulty: "Medium", url: makeUrl("3sum", "leetcode"), companies: ["Amazon", "Microsoft", "Google"], day: 4 },
      { id: "sk-arr-13", title: "Container With Most Water", platform: "leetcode", difficulty: "Medium", url: makeUrl("container-with-most-water", "leetcode"), companies: ["Google", "Amazon"], day: 4 },
      { id: "sk-arr-14", title: "Minimum Size Subarray Sum", platform: "leetcode", difficulty: "Medium", url: makeUrl("minimum-size-subarray-sum", "leetcode"), companies: ["Microsoft", "Google"], day: 5 },
      { id: "sk-arr-15", title: "Longest Substring Without Repeating Characters", platform: "leetcode", difficulty: "Medium", url: makeUrl("longest-substring-without-repeating-characters", "leetcode"), companies: ["Amazon", "Netflix", "Apple"], day: 5 },
      { id: "sk-arr-16", title: "Set Matrix Zeroes", platform: "leetcode", difficulty: "Medium", url: makeUrl("set-matrix-zeroes", "leetcode"), companies: ["Microsoft", "Amazon"], day: 5 },
      { id: "sk-arr-17", title: "Spiral Matrix", platform: "leetcode", difficulty: "Medium", url: makeUrl("spiral-matrix", "leetcode"), companies: ["Microsoft", "Apple", "Google"], day: 6 },
      { id: "sk-arr-18", title: "Rotate Image (90 degrees clockwise)", platform: "leetcode", difficulty: "Medium", url: makeUrl("rotate-image", "leetcode"), companies: ["Amazon", "Microsoft"], day: 6 },
      { id: "sk-arr-19", title: "Search a 2D Matrix", platform: "leetcode", difficulty: "Medium", url: makeUrl("search-a-2d-matrix", "leetcode"), companies: ["Netflix", "Google"], day: 6 },
    ],
  },
  {
    id: "strings-hashing",
    title: "Strings & Hashing Techniques",
    dayRange: "Day 7 - 9",
    description: "Text processing, anagrams, palindrome windows, and frequency maps.",
    problems: [
      { id: "sk-str-1", title: "Valid Anagram", platform: "leetcode", difficulty: "Easy", url: makeUrl("valid-anagram", "leetcode"), companies: ["Google", "Apple"], day: 7 },
      { id: "sk-str-2", title: "Valid Palindrome", platform: "leetcode", difficulty: "Easy", url: makeUrl("valid-palindrome", "leetcode"), companies: ["Microsoft", "Amazon"], day: 7 },
      { id: "sk-str-3", title: "Valid Parentheses", platform: "leetcode", difficulty: "Easy", url: makeUrl("valid-parentheses", "leetcode"), companies: ["Google", "Amazon", "Microsoft"], day: 7 },
      { id: "sk-str-4", title: "Longest Common Prefix", platform: "leetcode", difficulty: "Easy", url: makeUrl("longest-common-prefix", "leetcode"), companies: ["Apple", "Netflix"], day: 8 },
      { id: "sk-str-5", title: "Group Anagrams", platform: "leetcode", difficulty: "Medium", url: makeUrl("group-anagrams", "leetcode"), companies: ["Amazon", "Google", "Apple"], day: 8 },
      { id: "sk-str-6", title: "Longest Palindromic Substring", platform: "leetcode", difficulty: "Medium", url: makeUrl("longest-palindromic-substring", "leetcode"), companies: ["Microsoft", "Amazon"], day: 8 },
      { id: "sk-str-7", title: "Palindromic Substrings", platform: "leetcode", difficulty: "Medium", url: makeUrl("palindromic-substrings", "leetcode"), companies: ["Google", "Netflix"], day: 9 },
      { id: "sk-str-8", title: "Minimum Window Substring", platform: "leetcode", difficulty: "Hard", url: makeUrl("minimum-window-substring", "leetcode"), companies: ["Google", "Amazon", "Microsoft"], day: 9 },
    ],
  },
  {
    id: "binary-search",
    title: "Binary Search & Divide and Conquer",
    dayRange: "Day 10 - 12",
    description: "Search space reduction, monotonic predicates, and finding boundaries.",
    problems: [
      { id: "sk-bs-1", title: "Binary Search", platform: "leetcode", difficulty: "Easy", url: makeUrl("binary-search", "leetcode"), companies: ["Microsoft", "Apple"], day: 10 },
      { id: "sk-bs-2", title: "Find Minimum in Rotated Sorted Array", platform: "leetcode", difficulty: "Medium", url: makeUrl("find-minimum-in-rotated-sorted-array", "leetcode"), companies: ["Amazon", "Google"], day: 10 },
      { id: "sk-bs-3", title: "Find Peak Element", platform: "leetcode", difficulty: "Medium", url: makeUrl("find-peak-element", "leetcode"), companies: ["Google", "Netflix"], day: 10 },
      { id: "sk-bs-4", title: "First and Last Position in Sorted Array", platform: "leetcode", difficulty: "Medium", url: makeUrl("find-first-and-last-position-of-element-in-sorted-array", "leetcode"), companies: ["Microsoft", "Amazon"], day: 11 },
      { id: "sk-bs-5", title: "Koko Eating Bananas", platform: "leetcode", difficulty: "Medium", url: makeUrl("koko-eating-bananas", "leetcode"), companies: ["Google", "Netflix"], day: 11 },
      { id: "sk-bs-6", title: "Capacity To Ship Packages Within D Days", platform: "leetcode", difficulty: "Medium", url: makeUrl("capacity-to-ship-packages-within-d-days", "leetcode"), companies: ["Amazon", "Apple"], day: 11 },
      { id: "sk-bs-7", title: "Median of Two Sorted Arrays", platform: "leetcode", difficulty: "Hard", url: makeUrl("median-of-two-sorted-arrays", "leetcode"), companies: ["Google", "Microsoft", "Amazon"], day: 12 },
    ],
  },
  {
    id: "recursion-backtracking",
    title: "Recursion & Backtracking",
    dayRange: "Day 13 - 15",
    description: "Tree state space exploration, pruning decisions, and permutations.",
    problems: [
      { id: "sk-bt-1", title: "Subsets", platform: "leetcode", difficulty: "Medium", url: makeUrl("subsets", "leetcode"), companies: ["Amazon", "Microsoft"], day: 13 },
      { id: "sk-bt-2", title: "Subsets II (with duplicates)", platform: "leetcode", difficulty: "Medium", url: makeUrl("subsets-ii", "leetcode"), companies: ["Google", "Amazon"], day: 13 },
      { id: "sk-bt-3", title: "Combination Sum", platform: "leetcode", difficulty: "Medium", url: makeUrl("combination-sum", "leetcode"), companies: ["Apple", "Netflix", "Microsoft"], day: 13 },
      { id: "sk-bt-4", title: "Permutations", platform: "leetcode", difficulty: "Medium", url: makeUrl("permutations", "leetcode"), companies: ["Microsoft", "Google"], day: 14 },
      { id: "sk-bt-5", title: "Word Search", platform: "leetcode", difficulty: "Medium", url: makeUrl("word-search", "leetcode"), companies: ["Amazon", "Apple"], day: 14 },
      { id: "sk-bt-6", title: "N-Queens", platform: "leetcode", difficulty: "Hard", url: makeUrl("n-queens", "leetcode"), companies: ["Microsoft", "Google"], day: 15 },
      { id: "sk-bt-7", title: "Sudoku Solver", platform: "leetcode", difficulty: "Hard", url: makeUrl("sudoku-solver", "leetcode"), companies: ["Amazon", "Netflix"], day: 15 },
      { id: "sk-bt-8", title: "Rat in a Maze Problem", platform: "geeksforgeeks", difficulty: "Medium", url: makeUrl("rat-in-a-maze-problem", "geeksforgeeks"), companies: ["Microsoft", "Amazon"], day: 15 },
    ],
  },
  {
    id: "linked-lists",
    title: "Linked Lists & Fast-Slow Pointers",
    dayRange: "Day 16 - 18",
    description: "Pointer manipulation, cycle detection, reordering, and cache design.",
    problems: [
      { id: "sk-ll-1", title: "Reverse Linked List", platform: "leetcode", difficulty: "Easy", url: makeUrl("reverse-linked-list", "leetcode"), companies: ["Apple", "Amazon", "Microsoft"], day: 16 },
      { id: "sk-ll-2", title: "Linked List Cycle", platform: "leetcode", difficulty: "Easy", url: makeUrl("linked-list-cycle", "leetcode"), companies: ["Microsoft", "Google"], day: 16 },
      { id: "sk-ll-3", title: "Merge Two Sorted Lists", platform: "leetcode", difficulty: "Easy", url: makeUrl("merge-two-sorted-lists", "leetcode"), companies: ["Amazon", "Apple"], day: 16 },
      { id: "sk-ll-4", title: "Remove Nth Node From End of List", platform: "leetcode", difficulty: "Medium", url: makeUrl("remove-nth-node-from-end-of-list", "leetcode"), companies: ["Microsoft", "Netflix"], day: 17 },
      { id: "sk-ll-5", title: "Reorder List", platform: "leetcode", difficulty: "Medium", url: makeUrl("reorder-list", "leetcode"), companies: ["Amazon", "Google"], day: 17 },
      { id: "sk-ll-6", title: "Intersection of Two Linked Lists", platform: "leetcode", difficulty: "Easy", url: makeUrl("intersection-of-two-linked-lists", "leetcode"), companies: ["Microsoft", "Apple"], day: 17 },
      { id: "sk-ll-7", title: "Merge k Sorted Lists", platform: "leetcode", difficulty: "Hard", url: makeUrl("merge-k-sorted-lists", "leetcode"), companies: ["Google", "Amazon", "Microsoft"], day: 18 },
      { id: "sk-ll-8", title: "LRU Cache", platform: "leetcode", difficulty: "Medium", url: makeUrl("lru-cache", "leetcode"), companies: ["Google", "Amazon", "Microsoft", "Netflix"], day: 18 },
    ],
  },
  {
    id: "stacks-queues",
    title: "Stacks, Queues & Monotonic Sequences",
    dayRange: "Day 19 - 20",
    description: "LIFO/FIFO mechanisms, monotonic stacks, and sliding window maximums.",
    problems: [
      { id: "sk-sq-1", title: "Implement Queue using Stacks", platform: "leetcode", difficulty: "Easy", url: makeUrl("implement-queue-using-stacks", "leetcode"), companies: ["Microsoft", "Amazon"], day: 19 },
      { id: "sk-sq-2", title: "Min Stack", platform: "leetcode", difficulty: "Medium", url: makeUrl("min-stack", "leetcode"), companies: ["Apple", "Amazon", "Google"], day: 19 },
      { id: "sk-sq-3", title: "Evaluate Reverse Polish Notation", platform: "leetcode", difficulty: "Medium", url: makeUrl("evaluate-reverse-polish-notation", "leetcode"), companies: ["Google", "Netflix"], day: 19 },
      { id: "sk-sq-4", title: "Daily Temperatures", platform: "leetcode", difficulty: "Medium", url: makeUrl("daily-temperatures", "leetcode"), companies: ["Amazon", "Apple"], day: 20 },
      { id: "sk-sq-5", title: "Next Greater Element I", platform: "leetcode", difficulty: "Easy", url: makeUrl("next-greater-element-i", "leetcode"), companies: ["Microsoft", "Amazon"], day: 20 },
      { id: "sk-sq-6", title: "Largest Rectangle in Histogram", platform: "leetcode", difficulty: "Hard", url: makeUrl("largest-rectangle-in-histogram", "leetcode"), companies: ["Google", "Amazon", "Microsoft"], day: 20 },
      { id: "sk-sq-7", title: "Sliding Window Maximum", platform: "leetcode", difficulty: "Hard", url: makeUrl("sliding-window-maximum", "leetcode"), companies: ["Google", "Netflix", "Amazon"], day: 20 },
    ],
  },
  {
    id: "binary-trees",
    title: "Binary Trees & BSTs",
    dayRange: "Day 21 - 23",
    description: "Traversals (Inorder/Preorder/Postorder/Levelorder), BST properties, and LCA.",
    problems: [
      { id: "sk-tree-1", title: "Maximum Depth of Binary Tree", platform: "leetcode", difficulty: "Easy", url: makeUrl("maximum-depth-of-binary-tree", "leetcode"), companies: ["Apple", "Google"], day: 21 },
      { id: "sk-tree-2", title: "Invert Binary Tree", platform: "leetcode", difficulty: "Easy", url: makeUrl("invert-binary-tree", "leetcode"), companies: ["Google", "Microsoft"], day: 21 },
      { id: "sk-tree-3", title: "Same Tree", platform: "leetcode", difficulty: "Easy", url: makeUrl("same-tree", "leetcode"), companies: ["Amazon", "Apple"], day: 21 },
      { id: "sk-tree-4", title: "Subtree of Another Tree", platform: "leetcode", difficulty: "Easy", url: makeUrl("subtree-of-another-tree", "leetcode"), companies: ["Amazon", "Microsoft"], day: 21 },
      { id: "sk-tree-5", title: "Lowest Common Ancestor of a BST", platform: "leetcode", difficulty: "Medium", url: makeUrl("lowest-common-ancestor-of-a-binary-search-tree", "leetcode"), companies: ["Amazon", "Microsoft"], day: 22 },
      { id: "sk-tree-6", title: "Binary Tree Level Order Traversal", platform: "leetcode", difficulty: "Medium", url: makeUrl("binary-tree-level-order-traversal", "leetcode"), companies: ["Amazon", "Google", "Microsoft"], day: 22 },
      { id: "sk-tree-7", title: "Validate Binary Search Tree", platform: "leetcode", difficulty: "Medium", url: makeUrl("validate-binary-search-tree", "leetcode"), companies: ["Microsoft", "Amazon", "Google"], day: 22 },
      { id: "sk-tree-8", title: "Kth Smallest Element in a BST", platform: "leetcode", difficulty: "Medium", url: makeUrl("kth-smallest-element-in-a-bst", "leetcode"), companies: ["Google", "Amazon"], day: 23 },
      { id: "sk-tree-9", title: "Construct Binary Tree from Preorder and Inorder Traversal", platform: "leetcode", difficulty: "Medium", url: makeUrl("construct-binary-tree-from-preorder-and-inorder-traversal", "leetcode"), companies: ["Microsoft", "Amazon"], day: 23 },
      { id: "sk-tree-10", title: "Binary Tree Maximum Path Sum", platform: "leetcode", difficulty: "Hard", url: makeUrl("binary-tree-maximum-path-sum", "leetcode"), companies: ["Google", "Apple", "Microsoft"], day: 23 },
    ],
  },
  {
    id: "heaps-greedy",
    title: "Heaps, Priority Queues & Greedy Strategy",
    dayRange: "Day 24 - 25",
    description: "Min/Max heaps, top-K frequencies, intervals, and greedy scheduling.",
    problems: [
      { id: "sk-heap-1", title: "Kth Largest Element in an Array", platform: "leetcode", difficulty: "Medium", url: makeUrl("kth-largest-element-in-an-array", "leetcode"), companies: ["Amazon", "Microsoft"], day: 24 },
      { id: "sk-heap-2", title: "Top K Frequent Elements", platform: "leetcode", difficulty: "Medium", url: makeUrl("top-k-frequent-elements", "leetcode"), companies: ["Amazon", "Apple", "Google"], day: 24 },
      { id: "sk-heap-3", title: "Find Median from Data Stream", platform: "leetcode", difficulty: "Hard", url: makeUrl("find-median-from-data-stream", "leetcode"), companies: ["Google", "Microsoft", "Amazon"], day: 24 },
      { id: "sk-heap-4", title: "Jump Game", platform: "leetcode", difficulty: "Medium", url: makeUrl("jump-game", "leetcode"), companies: ["Microsoft", "Google"], day: 25 },
      { id: "sk-heap-5", title: "Gas Station", platform: "leetcode", difficulty: "Medium", url: makeUrl("gas-station", "leetcode"), companies: ["Amazon", "Netflix"], day: 25 },
      { id: "sk-heap-6", title: "Non-overlapping Intervals", platform: "leetcode", difficulty: "Medium", url: makeUrl("non-overlapping-intervals", "leetcode"), companies: ["Microsoft", "Amazon"], day: 25 },
    ],
  },
  {
    id: "dynamic-programming",
    title: "Dynamic Programming (DP) Mastery",
    dayRange: "Day 26 - 28",
    description: "Memoization, Tabulation, 1D/2D DP, Knapsack variations, and LCS/LIS.",
    problems: [
      { id: "sk-dp-1", title: "Climbing Stairs", platform: "leetcode", difficulty: "Easy", url: makeUrl("climbing-stairs", "leetcode"), companies: ["Apple", "Google"], day: 26 },
      { id: "sk-dp-2", title: "House Robber", platform: "leetcode", difficulty: "Medium", url: makeUrl("house-robber", "leetcode"), companies: ["Microsoft", "Google"], day: 26 },
      { id: "sk-dp-3", title: "House Robber II", platform: "leetcode", difficulty: "Medium", url: makeUrl("house-robber-ii", "leetcode"), companies: ["Amazon", "Microsoft"], day: 26 },
      { id: "sk-dp-4", title: "Coin Change", platform: "leetcode", difficulty: "Medium", url: makeUrl("coin-change", "leetcode"), companies: ["Amazon", "Google", "Apple"], day: 27 },
      { id: "sk-dp-5", title: "Longest Increasing Subsequence", platform: "leetcode", difficulty: "Medium", url: makeUrl("longest-increasing-subsequence", "leetcode"), companies: ["Microsoft", "Google"], day: 27 },
      { id: "sk-dp-6", title: "Longest Common Subsequence", platform: "leetcode", difficulty: "Medium", url: makeUrl("longest-common-subsequence", "leetcode"), companies: ["Amazon", "Netflix"], day: 27 },
      { id: "sk-dp-7", title: "Word Break", platform: "leetcode", difficulty: "Medium", url: makeUrl("word-break", "leetcode"), companies: ["Google", "Amazon", "Microsoft"], day: 28 },
      { id: "sk-dp-8", title: "Unique Paths", platform: "leetcode", difficulty: "Medium", url: makeUrl("unique-paths", "leetcode"), companies: ["Microsoft", "Apple"], day: 28 },
      { id: "sk-dp-9", title: "Edit Distance", platform: "leetcode", difficulty: "Hard", url: makeUrl("edit-distance", "leetcode"), companies: ["Google", "Amazon"], day: 28 },
    ],
  },
  {
    id: "graphs-tries",
    title: "Graphs, Tries & Final MAANG Readiness",
    dayRange: "Day 29 - 30",
    description: "BFS/DFS grid traversals, topological sort, Dijkstra, and prefix trees.",
    problems: [
      { id: "sk-graph-1", title: "Number of Islands", platform: "leetcode", difficulty: "Medium", url: makeUrl("number-of-islands", "leetcode"), companies: ["Amazon", "Google", "Microsoft"], day: 29 },
      { id: "sk-graph-2", title: "Clone Graph", platform: "leetcode", difficulty: "Medium", url: makeUrl("clone-graph", "leetcode"), companies: ["Microsoft", "Netflix"], day: 29 },
      { id: "sk-graph-3", title: "Pacific Atlantic Water Flow", platform: "leetcode", difficulty: "Medium", url: makeUrl("pacific-atlantic-water-flow", "leetcode"), companies: ["Google", "Amazon"], day: 29 },
      { id: "sk-graph-4", title: "Course Schedule", platform: "leetcode", difficulty: "Medium", url: makeUrl("course-schedule", "leetcode"), companies: ["Microsoft", "Amazon", "Apple"], day: 30 },
      { id: "sk-graph-5", title: "Rotting Oranges", platform: "leetcode", difficulty: "Medium", url: makeUrl("rotting-oranges", "leetcode"), companies: ["Amazon", "Microsoft"], day: 30 },
      { id: "sk-graph-6", title: "Implement Trie (Prefix Tree)", platform: "leetcode", difficulty: "Medium", url: makeUrl("implement-trie-prefix-tree", "leetcode"), companies: ["Google", "Microsoft", "Apple"], day: 30 },
      { id: "sk-graph-7", title: "Word Search II", platform: "leetcode", difficulty: "Hard", url: makeUrl("word-search-ii", "leetcode"), companies: ["Google", "Amazon", "Netflix"], day: 30 },
    ],
  },
];

export const TOTAL_SHRADHA_PROBLEMS = SHRADHA_DSA_CATEGORIES.reduce(
  (acc, cat) => acc + cat.problems.length,
  0
);
