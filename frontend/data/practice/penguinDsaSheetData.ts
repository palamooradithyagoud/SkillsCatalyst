export type Difficulty = "Easy" | "Medium" | "Hard" | "Basic";
export type Platform = "leetcode" | "geeksforgeeks" | "interviewbit" | "spoj" | "hackerrank" | "hackerearth";

export interface SheetProblem {
  id: string;
  title: string;
  platform: Platform;
  difficulty: Difficulty;
  url: string;
}

export interface SheetCategory {
  id: string;
  title: string;
  total: number;
  problems: SheetProblem[];
}

function makeUrl(title: string, platform: Platform): string {
  const cleanTitle = title.trim();
  const slug = cleanTitle
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");

  if (platform === "geeksforgeeks") {
    return `https://www.geeksforgeeks.org/${slug}/`;
  }
  if (platform === "leetcode") {
    return `https://leetcode.com/problems/${slug}/`;
  }
  if (platform === "interviewbit") {
    return `https://www.interviewbit.com/problems/${slug}/`;
  }
  if (platform === "hackerrank") {
    return `https://www.hackerrank.com/challenges/${slug}/problem`;
  }
  if (platform === "spoj") {
    return `https://www.spoj.com/problems/${cleanTitle.toUpperCase()}/`;
  }
  if (platform === "hackerearth") {
    return `https://www.hackerearth.com/practice/basic-programming/input-output/basics-of-input-output/practice-problems/algorithm/${slug}/`;
  }
  return `https://www.geeksforgeeks.org/${slug}/`;
}

export const PENGUIN_DSA_SHEET_CATEGORIES: SheetCategory[] = [
  {
    id: "arrays",
    title: "Arrays",
    total: 25,
    problems: [
      { id: "arr-1", title: "Write A Program To Reverse An Array Or String", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Write A Program To Reverse An Array Or String", "geeksforgeeks") },
      { id: "arr-2", title: "Maximum Subarray", platform: "leetcode", difficulty: "Medium", url: makeUrl("Maximum Subarray", "leetcode") },
      { id: "arr-3", title: "Contains Duplicate", platform: "leetcode", difficulty: "Easy", url: makeUrl("Contains Duplicate", "leetcode") },
      { id: "arr-4", title: "Chocolate Distribution Problem", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Chocolate Distribution Problem", "geeksforgeeks") },
      { id: "arr-5", title: "Search in Rotated Sorted Array", platform: "leetcode", difficulty: "Medium", url: makeUrl("Search in Rotated Sorted Array", "leetcode") },
      { id: "arr-6", title: "Next Permutation", platform: "leetcode", difficulty: "Medium", url: makeUrl("Next Permutation", "leetcode") },
      { id: "arr-7", title: "Best Time to Buy and Sell Stock", platform: "leetcode", difficulty: "Easy", url: makeUrl("Best Time to Buy and Sell Stock", "leetcode") },
      { id: "arr-8", title: "Repeat and Missing Number Array", platform: "interviewbit", difficulty: "Medium", url: makeUrl("Repeat and Missing Number Array", "interviewbit") },
      { id: "arr-9", title: "Kth Largest Element in an Array", platform: "leetcode", difficulty: "Medium", url: makeUrl("Kth Largest Element in an Array", "leetcode") },
      { id: "arr-10", title: "Trapping Rain Water", platform: "leetcode", difficulty: "Hard", url: makeUrl("Trapping Rain Water", "leetcode") },
      { id: "arr-11", title: "Product of Array Except Self", platform: "leetcode", difficulty: "Medium", url: makeUrl("Product of Array Except Self", "leetcode") },
      { id: "arr-12", title: "Maximum Product Subarray", platform: "leetcode", difficulty: "Medium", url: makeUrl("Maximum Product Subarray", "leetcode") },
      { id: "arr-13", title: "Find Minimum in Rotated Sorted Array", platform: "leetcode", difficulty: "Medium", url: makeUrl("Find Minimum in Rotated Sorted Array", "leetcode") },
      { id: "arr-14", title: "Find Pair With Given Sum In Sorted And Rotated Array", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Given A Sorted And Rotated Array Find If There Is A Pair With A Given Sum", "geeksforgeeks") },
      { id: "arr-15", title: "3Sum", platform: "leetcode", difficulty: "Medium", url: makeUrl("3Sum", "leetcode") },
      { id: "arr-16", title: "Container With Most Water", platform: "leetcode", difficulty: "Medium", url: makeUrl("Container With Most Water", "leetcode") },
      { id: "arr-17", title: "Given A Sorted And Rotated Array Find If There Is A Pair With A Given Sum", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Given A Sorted And Rotated Array Find If There Is A Pair With A Given Sum", "geeksforgeeks") },
      { id: "arr-18", title: "Kth Smallest", platform: "geeksforgeeks", difficulty: "Medium", url: makeUrl("Kth Smallest", "geeksforgeeks") },
      { id: "arr-19", title: "Merging Intervals", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Merging Intervals", "geeksforgeeks") },
      { id: "arr-20", title: "Find Minimum Number Of Merge Operations To Make An Array Palindrome", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Find Minimum Number Of Merge Operations To Make An Array Palindrome", "geeksforgeeks") },
      { id: "arr-21", title: "Given An Array Of Numbers Arrange The Numbers To Form The Biggest Number", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Given An Array Of Numbers Arrange The Numbers To Form The Biggest Number", "geeksforgeeks") },
      { id: "arr-22", title: "Space Optimization Using Bit Manipulations", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Space Optimization Using Bit Manipulations", "geeksforgeeks") },
      { id: "arr-23", title: "Longest Subarray Sum Divisible K", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Longest Subarray Sum Divisible K", "geeksforgeeks") },
      { id: "arr-24", title: "Print All Possible Combinations Of R Elements In A Given Array Of Size N", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Print All Possible Combinations Of R Elements In A Given Array Of Size N", "geeksforgeeks") },
      { id: "arr-25", title: "Mos Algorithm Query Square Root Decomposition Set 1 Introduction", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Mos Algorithm Query Square Root Decomposition Set 1 Introduction", "geeksforgeeks") }
    ]
  },
  {
    id: "strings",
    title: "Strings",
    total: 22,
    problems: [
      { id: "str-1", title: "Valid Palindrome", platform: "leetcode", difficulty: "Easy", url: makeUrl("Valid Palindrome", "leetcode") },
      { id: "str-2", title: "Valid Anagram", platform: "leetcode", difficulty: "Easy", url: makeUrl("Valid Anagram", "leetcode") },
      { id: "str-3", title: "Valid Parentheses", platform: "leetcode", difficulty: "Easy", url: makeUrl("Valid Parentheses", "leetcode") },
      { id: "str-4", title: "Remove Consecutive Characters", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Remove Consecutive Characters", "geeksforgeeks") },
      { id: "str-5", title: "Longest Common Prefix", platform: "leetcode", difficulty: "Easy", url: makeUrl("Longest Common Prefix", "leetcode") },
      { id: "str-6", title: "Convert Sentence Equivalent Mobile Numeric Keypad Sequence", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Convert Sentence Equivalent Mobile Numeric Keypad Sequence", "geeksforgeeks") },
      { id: "str-7", title: "Print All The Duplicates In The Input String", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Print All The Duplicates In The Input String", "geeksforgeeks") },
      { id: "str-8", title: "Longest Substring Without Repeating Characters", platform: "leetcode", difficulty: "Medium", url: makeUrl("Longest Substring Without Repeating Characters", "leetcode") },
      { id: "str-9", title: "Longest Repeating Character Replacement", platform: "leetcode", difficulty: "Medium", url: makeUrl("Longest Repeating Character Replacement", "leetcode") },
      { id: "str-10", title: "Group Anagrams", platform: "leetcode", difficulty: "Medium", url: makeUrl("Group Anagrams", "leetcode") },
      { id: "str-11", title: "Longest Palindromic Substring", platform: "leetcode", difficulty: "Medium", url: makeUrl("Longest Palindromic Substring", "leetcode") },
      { id: "str-12", title: "Palindromic Substrings", platform: "leetcode", difficulty: "Medium", url: makeUrl("Palindromic Substrings", "leetcode") },
      { id: "str-13", title: "Next Permutation", platform: "geeksforgeeks", difficulty: "Medium", url: makeUrl("Next Permutation", "geeksforgeeks") },
      { id: "str-14", title: "Count Palindromic Subsequences", platform: "geeksforgeeks", difficulty: "Medium", url: makeUrl("Count Palindromic Subsequences", "geeksforgeeks") },
      { id: "str-15", title: "Smallest window containing all characters", platform: "geeksforgeeks", difficulty: "Hard", url: makeUrl("Smallest window containing all characters", "geeksforgeeks") },
      { id: "str-16", title: "Wildcard string matching", platform: "geeksforgeeks", difficulty: "Hard", url: makeUrl("Wildcard string matching", "geeksforgeeks") },
      { id: "str-17", title: "Longest Prefix Suffix", platform: "geeksforgeeks", difficulty: "Hard", url: makeUrl("Longest Prefix Suffix", "geeksforgeeks") },
      { id: "str-18", title: "Rabin Karp Algorithm For Pattern Searching", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Rabin Karp Algorithm For Pattern Searching", "geeksforgeeks") },
      { id: "str-19", title: "Transform One String To Another Using Minimum Number Of Given Operation", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Transform One String To Another Using Minimum Number Of Given Operation", "geeksforgeeks") },
      { id: "str-20", title: "Minimum Window Substring", platform: "leetcode", difficulty: "Hard", url: makeUrl("Minimum Window Substring", "leetcode") },
      { id: "str-21", title: "Boyer Moore Algorithm For Pattern Searching", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Boyer Moore Algorithm For Pattern Searching", "geeksforgeeks") },
      { id: "str-22", title: "Word Wrap", platform: "geeksforgeeks", difficulty: "Hard", url: makeUrl("Word Wrap", "geeksforgeeks") }
    ]
  },
  {
    id: "2d-arrays",
    title: "2D Arrays",
    total: 10,
    problems: [
      { id: "2d-1", title: "Zigzag Or Diagonal Traversal Of Matrix", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Zigzag Or Diagonal Traversal Of Matrix", "geeksforgeeks") },
      { id: "2d-2", title: "Set Matrix Zeroes", platform: "leetcode", difficulty: "Medium", url: makeUrl("Set Matrix Zeroes", "leetcode") },
      { id: "2d-3", title: "Spiral Matrix", platform: "leetcode", difficulty: "Medium", url: makeUrl("Spiral Matrix", "leetcode") },
      { id: "2d-4", title: "Rotate Image", platform: "leetcode", difficulty: "Medium", url: makeUrl("Rotate Image", "leetcode") },
      { id: "2d-5", title: "Word Search", platform: "leetcode", difficulty: "Medium", url: makeUrl("Word Search", "leetcode") },
      { id: "2d-6", title: "Find Number Of Islands", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Find Number Of Islands", "geeksforgeeks") },
      { id: "2d-7", title: "Given Matrix O X Replace O X Surrounded X", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Given Matrix O X Replace O X Surrounded X", "geeksforgeeks") },
      { id: "2d-8", title: "Find Common Element Rows Row Wise Sorted Matrix", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Find Common Element Rows Row Wise Sorted Matrix", "geeksforgeeks") },
      { id: "2d-9", title: "Create A Matrix With Alternating Rectangles Of 0 And X", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Create A Matrix With Alternating Rectangles Of 0 And X", "geeksforgeeks") },
      { id: "2d-10", title: "Maximum Size Rectangle Binary Sub Matrix 1s", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Maximum Size Rectangle Binary Sub Matrix 1s", "geeksforgeeks") }
    ]
  },
  {
    id: "searching-sorting",
    title: "Searching & Sorting",
    total: 23,
    problems: [
      { id: "ss-1", title: "Permute Two Arrays Sum Every Pair Greater Equal K", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Permute Two Arrays Sum Every Pair Greater Equal K", "geeksforgeeks") },
      { id: "ss-2", title: "Counting Sort", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Counting Sort", "geeksforgeeks") },
      { id: "ss-3", title: "Find Common Elements Three Sorted Arrays", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Find Common Elements Three Sorted Arrays", "geeksforgeeks") },
      { id: "ss-4", title: "Searching Array Adjacent Differ K", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Searching Array Adjacent Differ K", "geeksforgeeks") },
      { id: "ss-5", title: "Ceiling In A Sorted Array", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Ceiling In A Sorted Array", "geeksforgeeks") },
      { id: "ss-6", title: "Find A Pair With The Given Difference", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Find A Pair With The Given Difference", "geeksforgeeks") },
      { id: "ss-7", title: "Majority Element", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Majority Element", "geeksforgeeks") },
      { id: "ss-8", title: "Count Triplets With Sum Smaller That A Given Value", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Count Triplets With Sum Smaller That A Given Value", "geeksforgeeks") },
      { id: "ss-9", title: "Maximum Sum Such That No Two Elements Are Adjacent", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Maximum Sum Such That No Two Elements Are Adjacent", "geeksforgeeks") },
      { id: "ss-10", title: "Merge Two Sorted Arrays O1 Extra Space", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Merge Two Sorted Arrays O1 Extra Space", "geeksforgeeks") },
      { id: "ss-11", title: "Count Inversions", platform: "geeksforgeeks", difficulty: "Medium", url: makeUrl("Count Inversions", "geeksforgeeks") },
      { id: "ss-12", title: "Find Duplicates In On Time And Constant Extra Space", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Find Duplicates In On Time And Constant Extra Space", "geeksforgeeks") },
      { id: "ss-13", title: "Radix Sort", platform: "geeksforgeeks", difficulty: "Medium", url: makeUrl("Radix Sort", "geeksforgeeks") },
      { id: "ss-14", title: "A Product Array Puzzle", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("A Product Array Puzzle", "geeksforgeeks") },
      { id: "ss-15", title: "Make Array Elements Equal Minimum Cost", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Make Array Elements Equal Minimum Cost", "geeksforgeeks") },
      { id: "ss-16", title: "Check Reversing Sub Array Make Array Sorted", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Check Reversing Sub Array Make Array Sorted", "geeksforgeeks") },
      { id: "ss-17", title: "Find Four Elements That Sum To A Given Value Set 2", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Find Four Elements That Sum To A Given Value Set 2", "geeksforgeeks") },
      { id: "ss-18", title: "Median Of Two Sorted Arrays Of Different Sizes", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Median Of Two Sorted Arrays Of Different Sizes", "geeksforgeeks") },
      { id: "ss-19", title: "Median Of Stream Of Integers Running Integers", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Median Of Stream Of Integers Running Integers", "geeksforgeeks") },
      { id: "ss-20", title: "Print All Subarrays With 0 Sum", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Print All Subarrays With 0 Sum", "geeksforgeeks") },
      { id: "ss-21", title: "AGGRCOW", platform: "spoj", difficulty: "Easy", url: makeUrl("AGGRCOW", "spoj") },
      { id: "ss-22", title: "Allocate Minimum Pages", platform: "geeksforgeeks", difficulty: "Medium", url: makeUrl("Allocate Minimum Pages", "geeksforgeeks") },
      { id: "ss-23", title: "Minimum Number Swaps Required Sort Array", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Minimum Number Swaps Required Sort Array", "geeksforgeeks") }
    ]
  },
  {
    id: "backtracking",
    title: "Backtracking",
    total: 21,
    problems: [
      { id: "bt-1", title: "Backtracking Set 2 Rat In A Maze", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Backttracking Set 2 Rat In A Maze", "geeksforgeeks") },
      { id: "bt-2", title: "Combinational Sum", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Combinational Sum", "geeksforgeeks") },
      { id: "bt-3", title: "crossword puzzle", platform: "hackerrank", difficulty: "Easy", url: makeUrl("crossword puzzle", "hackerrank") },
      { id: "bt-4", title: "Longest Possible Route in a Matrix with Hurdles", platform: "geeksforgeeks", difficulty: "Medium", url: makeUrl("Longest Possible Route in a Matrix with Hurdles", "geeksforgeeks") },
      { id: "bt-5", title: "Printing Solutions N Queen Problem", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Printing Solutions N Queen Problem", "geeksforgeeks") },
      { id: "bt-6", title: "Solve the Sudoku", platform: "geeksforgeeks", difficulty: "Hard", url: makeUrl("Solve the Sudoku", "geeksforgeeks") },
      { id: "bt-7", title: "Partition Equal Subset Sum", platform: "geeksforgeeks", difficulty: "Medium", url: makeUrl("Partition Equal Subset Sum", "geeksforgeeks") },
      { id: "bt-8", title: "M-Coloring Problem", platform: "geeksforgeeks", difficulty: "Medium", url: makeUrl("M-Coloring Problem", "geeksforgeeks") },
      { id: "bt-9", title: "Backtracking Set 1 The Knights Tour Problem", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Backtracking Set 1 The Knights Tour Problem", "geeksforgeeks") },
      { id: "bt-10", title: "Backtracking Set 7 Suduku", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Backtracking Set 7 Suduku", "geeksforgeeks") },
      { id: "bt-11", title: "Remove Invalid Parentheses", platform: "geeksforgeeks", difficulty: "Hard", url: makeUrl("Remove Invalid Parentheses", "geeksforgeeks") },
      { id: "bt-12", title: "Word Break Problem Using Backtracking", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Word Break Problem Using Backtracking", "geeksforgeeks") },
      { id: "bt-13", title: "Print Palindromic Partitions String", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Print Palindromic Partitions String", "geeksforgeeks") },
      { id: "bt-14", title: "Find Shortest Safe Route In A Path With Landmines", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Find Shortest Safe Route In A Path With Landmines", "geeksforgeeks") },
      { id: "bt-15", title: "Partition Set K Subsets Equal Sum", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Partition Set K Subsets Equal Sum", "geeksforgeeks") },
      { id: "bt-16", title: "Backtracking Set 7 Hamiltonian Cycle", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Backtracking Set 7 Hamiltonian Cycle", "geeksforgeeks") },
      { id: "bt-17", title: "Tug Of War", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Tug Of War", "geeksforgeeks") },
      { id: "bt-18", title: "Find Maximum Number Possible By Doing At Most K Swaps", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Find Maximum Number Possible By Doing At Most K Swaps", "geeksforgeeks") },
      { id: "bt-19", title: "Backtracking Set 8 Solving Cryptarithmetic Puzzles", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Backtracking Set 8 Solving Cryptarithmetic Puzzles", "geeksforgeeks") },
      { id: "bt-20", title: "Find Paths From Corner Cell To Middle Cell In Maze", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Find Paths From Corner Cell To Middle Cell In Maze", "geeksforgeeks") },
      { id: "bt-21", title: "arithmetic expressions", platform: "hackerrank", difficulty: "Easy", url: makeUrl("arithmetic expressions", "hackerrank") }
    ]
  },
  {
    id: "linked-list",
    title: "Linked List",
    total: 26,
    problems: [
      { id: "ll-1", title: "Reverse Linked List", platform: "leetcode", difficulty: "Easy", url: makeUrl("Reverse Linked List", "leetcode") },
      { id: "ll-2", title: "Linked List Cycle", platform: "leetcode", difficulty: "Easy", url: makeUrl("Linked List Cycle", "leetcode") },
      { id: "ll-3", title: "Merge Two Sorted Lists", platform: "leetcode", difficulty: "Easy", url: makeUrl("Merge Two Sorted Lists", "leetcode") },
      { id: "ll-4", title: "Given Only A Pointer To A Node To Be Deleted In A Singly Linked List How Do You Delete It", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Given Only A Pointer To A Node To Be Deleted In A Singly Linked List How Do You Delete It", "geeksforgeeks") },
      { id: "ll-5", title: "Remove duplicates from an unsorted linked list", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Remove duplicates from an unsorted linked list", "geeksforgeeks") },
      { id: "ll-6", title: "Sort A Linked List Of 0s 1s Or 2s", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Sort A Linked List Of 0s 1s Or 2s", "geeksforgeeks") },
      { id: "ll-7", title: "Multiply Two Numbers Represented Linked Lists", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Multiply Two Numbers Represented Linked Lists", "geeksforgeeks") },
      { id: "ll-8", title: "Remove Nth Node From End of List", platform: "leetcode", difficulty: "Medium", url: makeUrl("Remove Nth Node From End of List", "leetcode") },
      { id: "ll-9", title: "Reorder List", platform: "leetcode", difficulty: "Medium", url: makeUrl("Reorder List", "leetcode") },
      { id: "ll-10", title: "Detect And Remove Loop In A Linked List", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Detect And Remove Loop In A Linked List", "geeksforgeeks") },
      { id: "ll-11", title: "Write A Function To Get The Intersection Point Of Two Linked Lists", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Write A Function To Get The Intersection Point Of Two Linked Lists", "geeksforgeeks") },
      { id: "ll-12", title: "Flatten A Linked List With Next And Child Pointers", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Flatten A Linked List With Next And Child Pointers", "geeksforgeeks") },
      { id: "ll-13", title: "Linked List in Zig-Zag fashion", platform: "geeksforgeeks", difficulty: "Medium", url: makeUrl("Linked List in Zig-Zag fashion", "geeksforgeeks") },
      { id: "ll-14", title: "Reverse a Doubly Linked List", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Reverse a Doubly Linked List", "geeksforgeeks") },
      { id: "ll-15", title: "Delete Nodes Which Have A Greater Value On Right Side", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Delete Nodes Which Have A Greater Value On Right Side", "geeksforgeeks") },
      { id: "ll-16", title: "Segregate Even And Odd Elements In A Linked List", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Segregate Even And Odd Elements In A Linked List", "geeksforgeeks") },
      { id: "ll-17", title: "Point To Next Higher Value Node In A Linked List With An Arbitrary Pointer", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Point To Next Higher Value Node In A Linked List With An Arbitrary Pointer", "geeksforgeeks") },
      { id: "ll-18", title: "Rearrange A Given Linked List In Place", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Rearrange A Given Linked List In Place", "geeksforgeeks") },
      { id: "ll-19", title: "Sort Biotonic Doubly Linked List", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Sort Biotonic Doubly Linked List", "geeksforgeeks") },
      { id: "ll-20", title: "Merge k Sorted Lists", platform: "leetcode", difficulty: "Hard", url: makeUrl("Merge k Sorted Lists", "leetcode") },
      { id: "ll-21", title: "Merge Sort For Linked List", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Merge Sort For Linked List", "geeksforgeeks") },
      { id: "ll-22", title: "Quicksort On Singly Linked List", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Quicksort On Singly Linked List", "geeksforgeeks") },
      { id: "ll-23", title: "Sum Of Two Linked Lists", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Sum Of Two Linked Lists", "geeksforgeeks") },
      { id: "ll-24", title: "Flattening a Linked List", platform: "geeksforgeeks", difficulty: "Medium", url: makeUrl("Flattening a Linked List", "geeksforgeeks") },
      { id: "ll-25", title: "A Linked List With Next And Arbit Pointer", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("A Linked List With Next And Arbit Pointer", "geeksforgeeks") },
      { id: "ll-26", title: "Subtract Two Numbers Represented As Linked Lists", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Subtract Two Numbers Represented As Linked Lists", "geeksforgeeks") }
    ]
  },
  {
    id: "stacks-queues",
    title: "Stacks & Queues",
    total: 25,
    problems: [
      { id: "sq-1", title: "Two Stacks in an Array", platform: "geeksforgeeks", difficulty: "Medium", url: makeUrl("Two Stacks in an Array", "geeksforgeeks") },
      { id: "sq-2", title: "Stack Set 4 Evaluation Postfix Expression", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Stack Set 4 Evaluation Postfix Expression", "geeksforgeeks") },
      { id: "sq-3", title: "Implement Stack using Queues", platform: "leetcode", difficulty: "Easy", url: makeUrl("Implement Stack using Queues", "leetcode") },
      { id: "sq-4", title: "Queue Reversal", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Queue Reversal", "geeksforgeeks") },
      { id: "sq-5", title: "Implement Stack Queue Using Deque", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Implement Stack Queue Using Deque", "geeksforgeeks") },
      { id: "sq-6", title: "Reverse first K of a Queue", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Reverse first K of a Queue", "geeksforgeeks") },
      { id: "sq-7", title: "Design A Stack With Find Middle Operation", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Design A Stack With Find Middle Operation", "geeksforgeeks") },
      { id: "sq-8", title: "Stack Set 2 Infix To Postfix", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Stack Set 2 Infix To Postfix", "geeksforgeeks") },
      { id: "sq-9", title: "Design And Implement Special Stack Data Structure", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Design And Implement Special Stack Data Structure", "geeksforgeeks") },
      { id: "sq-10", title: "Length Of The Longest Valid Substring", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Length Of The Longest Valid Substring", "geeksforgeeks") },
      { id: "sq-11", title: "Find Expression Duplicate Parenthesis Not", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Find Expression Duplicate Parenthesis Not", "geeksforgeeks") },
      { id: "sq-12", title: "Stack Permutations Check If An Array Is Stack Permutation Of Other", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Stack Permutations Check If An Array Is Stack Permutation Of Other", "geeksforgeeks") },
      { id: "sq-13", title: "Count Natural Numbers Whose Permutation Greater Number", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Count Natural Numbers Whose Permutation Greater Number", "geeksforgeeks") },
      { id: "sq-14", title: "Sort A Stack Using Recursion", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Sort A Stack Using Recursion", "geeksforgeeks") },
      { id: "sq-15", title: "Queue Based Approach For First Non Repeating Character In A Stream", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Queue Based Approach For First Non Repeating Character In A Stream", "geeksforgeeks") },
      { id: "sq-16", title: "The Celebrity Problem", platform: "geeksforgeeks", difficulty: "Medium", url: makeUrl("The Celebrity Problem", "geeksforgeeks") },
      { id: "sq-17", title: "Next Greater Element", platform: "geeksforgeeks", difficulty: "Medium", url: makeUrl("Next Greater Element", "geeksforgeeks") },
      { id: "sq-18", title: "Distance of nearest cell having 1", platform: "geeksforgeeks", difficulty: "Medium", url: makeUrl("Distance of nearest cell having 1", "geeksforgeeks") },
      { id: "sq-19", title: "Rotten Oranges", platform: "geeksforgeeks", difficulty: "Medium", url: makeUrl("Rotten Oranges", "geeksforgeeks") },
      { id: "sq-20", title: "Next Smaller Element", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Next Smaller Element", "geeksforgeeks") },
      { id: "sq-21", title: "Efficiently Implement K Stacks Single Array", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Efficiently Implement K Stacks Single Array", "geeksforgeeks") },
      { id: "sq-22", title: "Iterative Tower Of Hanoi", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Iterative Tower Of Hanoi", "geeksforgeeks") },
      { id: "sq-23", title: "Find The Maximum Of Minimums For Every Window Size In A Given Array", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Find The Maximum Of Minimums For Every Window Size In A Given Array", "geeksforgeeks") },
      { id: "sq-24", title: "Lru Cache Implementation", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Lru Cache Implementation", "geeksforgeeks") },
      { id: "sq-25", title: "Find A Tour That Visits All Stations", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Find A Tour That Visits All Stations", "geeksforgeeks") }
    ]
  },
  {
    id: "greedy",
    title: "Greedy",
    total: 22,
    problems: [
      { id: "gr-1", title: "Activity Selection Problem Greedy Algo 1", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Activity Selection Problem Greedy Algo 1", "geeksforgeeks") },
      { id: "gr-2", title: "Greedy Algorithm To Find Minimum Number Of Coins", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Greedy Algorithm To Find Minimum Number Of Coins", "geeksforgeeks") },
      { id: "gr-3", title: "Minimum Sum Two Numbers Formed Digits Array 2", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Minimum Sum Two Numbers Formed Digits Array 2", "geeksforgeeks") },
      { id: "gr-4", title: "Minimum Sum Absolute Difference Pairs Two Arrays", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Minimum Sum Absolute Difference Pairs Two Arrays", "geeksforgeeks") },
      { id: "gr-5", title: "Find Maximum Height Pyramid From The Given Array Of Objects", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Find Maximum Height Pyramid From The Given Array Of Objects", "geeksforgeeks") },
      { id: "gr-6", title: "Minimum Cost For Acquiring All Coins With K Extra Coins Allowed With Every Coin", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Minimum Cost For Acquiring All Coins With K Extra Coins Allowed With Every Coin", "geeksforgeeks") },
      { id: "gr-7", title: "Find Maximum Sum Possible Equal Sum Three Stacks", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Find Maximum Sum Possible Equal Sum Three Stacks", "geeksforgeeks") },
      { id: "gr-8", title: "Job Sequencing Problem", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Job Sequencing Problem", "geeksforgeeks") },
      { id: "gr-9", title: "Greedy Algorithm Egyptian Fraction", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Greedy Algorithm Egyptian Fraction", "geeksforgeeks") },
      { id: "gr-10", title: "Fractional Knapsack Problem", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Fractional Knapsack Problem", "geeksforgeeks") },
      { id: "gr-11", title: "Maximum Length Chain Of Pairs Dp 20", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Maximum Length Chain Of Pairs Dp 20", "geeksforgeeks") },
      { id: "gr-12", title: "Find Smallest Number With Given Number Of Digits And Digit Sum", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Find Smallest Number With Given Number Of Digits And Digit Sum", "geeksforgeeks") },
      { id: "gr-13", title: "Maximize Sum Consecutive Differences Circular Array", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Maximize Sum Consecutive Differences Circular Array", "geeksforgeeks") },
      { id: "gr-14", title: "Paper Cut Minimum Number Squares", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Paper Cut Minimum Number Squares", "geeksforgeeks") },
      { id: "gr-15", title: "Lexicographically Smallest Array K Consecutive Swaps", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Lexicographically Smallest Array K Consecutive Swaps", "geeksforgeeks") },
      { id: "gr-16", title: "CHOCOLA", platform: "spoj", difficulty: "Easy", url: makeUrl("CHOCOLA", "spoj") },
      { id: "gr-17", title: "Find Minimum Time To Finish All Jobs With Given Constraints", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Find Minimum Time To Finish All Jobs With Given Constraints", "geeksforgeeks") },
      { id: "gr-18", title: "Job Sequencing Using Disjoint Set Union", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Job Sequencing Using Disjoint Set Union", "geeksforgeeks") },
      { id: "gr-19", title: "Rearrange Characters String No Two Adjacent", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Rearrange Characters String No Two Adjacent", "geeksforgeeks") },
      { id: "gr-20", title: "Minimum Edges Reverse Make Path Source Destination", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Minimum Edges Reverse Make Path Source Destination", "geeksforgeeks") },
      { id: "gr-21", title: "Minimize Cash Flow Among Given Set Friends Borrowed Money", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Minimize Cash Flow Among Given Set Friends Borrowed Money", "geeksforgeeks") },
      { id: "gr-22", title: "Minimum Cost Cut Board Squares", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Minimum Cost Cut Board Squares", "geeksforgeeks") }
    ]
  },
  {
    id: "binary-trees",
    title: "Binary Trees",
    total: 33,
    problems: [
      { id: "bt-tree-1", title: "Maximum Depth of Binary Tree", platform: "leetcode", difficulty: "Easy", url: makeUrl("Maximum Depth of Binary Tree", "leetcode") },
      { id: "bt-tree-2", title: "Reverse Level Order Traversal", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Reverse Level Order Traversal", "geeksforgeeks") },
      { id: "bt-tree-3", title: "Subtree of Another Tree", platform: "leetcode", difficulty: "Easy", url: makeUrl("Subtree of Another Tree", "leetcode") },
      { id: "bt-tree-4", title: "Invert Binary Tree", platform: "leetcode", difficulty: "Easy", url: makeUrl("Invert Binary Tree", "leetcode") },
      { id: "bt-tree-5", title: "Binary Tree Level Order Traversal", platform: "leetcode", difficulty: "Medium", url: makeUrl("Binary Tree Level Order Traversal", "leetcode") },
      { id: "bt-tree-6", title: "Left View of Binary Tree", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Left View of Binary Tree", "geeksforgeeks") },
      { id: "bt-tree-7", title: "Right View of Binary Tree", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Right View of Binary Tree", "geeksforgeeks") },
      { id: "bt-tree-8", title: "ZigZag Tree Traversal", platform: "geeksforgeeks", difficulty: "Medium", url: makeUrl("ZigZag Tree Traversal", "geeksforgeeks") },
      { id: "bt-tree-9", title: "Create A Mirror Tree From The Given Binary Tree", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Create A Mirror Tree From The Given Binary Tree", "geeksforgeeks") },
      { id: "bt-tree-10", title: "Leaves at Same Level or Not", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Leaves at Same Level or Not", "geeksforgeeks") },
      { id: "bt-tree-11", title: "Balanced Tree Check", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Balanced Tree Check", "geeksforgeeks") },
      { id: "bt-tree-12", title: "Transform to Sum Tree", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Transform to Sum Tree", "geeksforgeeks") },
      { id: "bt-tree-13", title: "Isomorphic Trees", platform: "geeksforgeeks", difficulty: "Medium", url: makeUrl("Isomorphic Trees", "geeksforgeeks") },
      { id: "bt-tree-14", title: "Same Tree", platform: "leetcode", difficulty: "Easy", url: makeUrl("Same Tree", "leetcode") },
      { id: "bt-tree-15", title: "Construct Binary Tree from Preorder and Inorder Traversal", platform: "leetcode", difficulty: "Medium", url: makeUrl("Construct Binary Tree from Preorder and Inorder Traversal", "leetcode") },
      { id: "bt-tree-16", title: "Height of Binary Tree", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Height of Binary Tree", "geeksforgeeks") },
      { id: "bt-tree-17", title: "Diameter of a Binary Tree", platform: "geeksforgeeks", difficulty: "Medium", url: makeUrl("Diameter of a Binary Tree", "geeksforgeeks") },
      { id: "bt-tree-18", title: "Top View of Binary Tree", platform: "geeksforgeeks", difficulty: "Medium", url: makeUrl("Top View of Binary Tree", "geeksforgeeks") },
      { id: "bt-tree-19", title: "Bottom View of Binary Tree", platform: "geeksforgeeks", difficulty: "Medium", url: makeUrl("Bottom View of Binary Tree", "geeksforgeeks") },
      { id: "bt-tree-20", title: "Diagonal Tree Traversal", platform: "geeksforgeeks", difficulty: "Medium", url: makeUrl("Diagonal Tree Traversal", "geeksforgeeks") },
      { id: "bt-tree-21", title: "Tree Boundary Traversal", platform: "geeksforgeeks", difficulty: "Medium", url: makeUrl("Tree Boundary Traversal", "geeksforgeeks") },
      { id: "bt-tree-22", title: "Construct Binary Tree String Bracket Representation", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Construct Binary Tree String Bracket Representation", "geeksforgeeks") },
      { id: "bt-tree-23", title: "Minimum Swap Required Convert Binary Tree Binary Search Tree", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Minimum Swap Required Convert Binary Tree Binary Search Tree", "geeksforgeeks") },
      { id: "bt-tree-24", title: "Duplicate Subtree", platform: "geeksforgeeks", difficulty: "Medium", url: makeUrl("Duplicate Subtree", "geeksforgeeks") },
      { id: "bt-tree-25", title: "Check Given Graph Tree", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Check Given Graph Tree", "geeksforgeeks") },
      { id: "bt-tree-26", title: "LCA in Binary Tree", platform: "geeksforgeeks", difficulty: "Medium", url: makeUrl("LCA in Binary Tree", "geeksforgeeks") },
      { id: "bt-tree-27", title: "Min distance between two given nodes of a Binary Tree", platform: "geeksforgeeks", difficulty: "Hard", url: makeUrl("Min distance between two given nodes of a Binary Tree", "geeksforgeeks") },
      { id: "bt-tree-28", title: "Duplicate Subtrees", platform: "geeksforgeeks", difficulty: "Medium", url: makeUrl("Duplicate Subtrees", "geeksforgeeks") },
      { id: "bt-tree-29", title: "Kth Ancestor Node Binary Tree Set 2", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Kth Ancestor Node Binary Tree Set 2", "geeksforgeeks") },
      { id: "bt-tree-30", title: "Binary Tree Maximum Path Sum", platform: "leetcode", difficulty: "Hard", url: makeUrl("Binary Tree Maximum Path Sum", "leetcode") },
      { id: "bt-tree-31", title: "Serialize and Deserialize Binary Tree", platform: "leetcode", difficulty: "Hard", url: makeUrl("Serialize and Deserialize Binary Tree", "leetcode") },
      { id: "bt-tree-32", title: "Binary Tree to DLL", platform: "geeksforgeeks", difficulty: "Hard", url: makeUrl("Binary Tree to DLL", "geeksforgeeks") },
      { id: "bt-tree-33", title: "Print K Sum Paths Binary Tree", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Print K Sum Paths Binary Tree", "geeksforgeeks") }
    ]
  },
  {
    id: "bst",
    title: "Binary Search Trees",
    total: 21,
    problems: [
      { id: "bst-1", title: "Lowest Common Ancestor of a Binary Search Tree", platform: "leetcode", difficulty: "Medium", url: makeUrl("Lowest Common Ancestor of a Binary Search Tree", "leetcode") },
      { id: "bst-2", title: "Binary Search Tree Set 1 Search And Insertion", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Binary Search Tree Set 1 Search And Insertion", "geeksforgeeks") },
      { id: "bst-3", title: "Minimum element in BST", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Minimum element in BST", "geeksforgeeks") },
      { id: "bst-4", title: "Predecessor and Successor", platform: "geeksforgeeks", difficulty: "Medium", url: makeUrl("Predecessor and Successor", "geeksforgeeks") },
      { id: "bst-5", title: "BST with Dead End", platform: "geeksforgeeks", difficulty: "Medium", url: makeUrl("BST with Dead End", "geeksforgeeks") },
      { id: "bst-6", title: "Binary Tree to BST", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Binary Tree to BST", "geeksforgeeks") },
      { id: "bst-7", title: "Kth largest element in BST", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Kth largest element in BST", "geeksforgeeks") },
      { id: "bst-8", title: "Validate Binary Search Tree", platform: "leetcode", difficulty: "Medium", url: makeUrl("Validate Binary Search Tree", "leetcode") },
      { id: "bst-9", title: "Kth Smallest Element in a BST", platform: "leetcode", difficulty: "Medium", url: makeUrl("Kth Smallest Element in a BST", "leetcode") },
      { id: "bst-10", title: "Delete Node in a BST", platform: "leetcode", difficulty: "Medium", url: makeUrl("Delete Node in a BST", "leetcode") },
      { id: "bst-11", title: "Flatten Bst To Sorted List Increasing Order", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Flatten Bst To Sorted List Increasing Order", "geeksforgeeks") },
      { id: "bst-12", title: "Preorder to BST", platform: "geeksforgeeks", difficulty: "Medium", url: makeUrl("Preorder to BST", "geeksforgeeks") },
      { id: "bst-13", title: "Count BST nodes that lie in a given range", platform: "geeksforgeeks", difficulty: "Medium", url: makeUrl("Count BST nodes that lie in a given range", "geeksforgeeks") },
      { id: "bst-14", title: "Populate Inorder Successor for all nodes", platform: "geeksforgeeks", difficulty: "Medium", url: makeUrl("Populate Inorder Successor for all nodes", "geeksforgeeks") },
      { id: "bst-15", title: "Convert Normal Bst Balanced Bst", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Convert Normal Bst Balanced Bst", "geeksforgeeks") },
      { id: "bst-16", title: "Merge Two Balanced Binary Search Trees", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Merge Two Balanced Binary Search Trees", "geeksforgeeks") },
      { id: "bst-17", title: "Given N Appointments Find Conflicting Appointments", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Given N Appointments Find Conflicting Appointments", "geeksforgeeks") },
      { id: "bst-18", title: "Replace every element with the least greater element on its right", platform: "geeksforgeeks", difficulty: "Medium", url: makeUrl("Replace every element with the least greater element on its right", "geeksforgeeks") },
      { id: "bst-19", title: "Construct Bst From Given Preorder Traversa", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Construct Bst From Given Preorder Traversa", "geeksforgeeks") },
      { id: "bst-20", title: "Find Median Bst Time O1 Space", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Find Median Bst Time O1 Space", "geeksforgeeks") },
      { id: "bst-21", title: "Largest Bst Binary Tree Set 2", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Largest Bst Binary Tree Set 2", "geeksforgeeks") }
    ]
  },
  {
    id: "heaps-hashing",
    title: "Heaps & Hashing",
    total: 28,
    problems: [
      { id: "hh-1", title: "K Numbers Difference Maximum Minimum K Number Minimized", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("K Numbers Difference Maximum Minimum K Number Minimized", "geeksforgeeks") },
      { id: "hh-2", title: "Heap Sort", platform: "geeksforgeeks", difficulty: "Medium", url: makeUrl("Heap Sort", "geeksforgeeks") },
      { id: "hh-3", title: "Top K Frequent Elements", platform: "leetcode", difficulty: "Medium", url: makeUrl("Top K Frequent Elements", "leetcode") },
      { id: "hh-4", title: "K Largestor Smallest Elements In An Array", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("K Largestor Smallest Elements In An Array", "geeksforgeeks") },
      { id: "hh-5", title: "Next Greater Element in Circular Array", platform: "geeksforgeeks", difficulty: "Medium", url: makeUrl("Next Greater Element in Circular Array", "geeksforgeeks") },
      { id: "hh-6", title: "Kth Smallestlargest Element Unsorted Array", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Kth Smallestlargest Element Unsorted Array", "geeksforgeeks") },
      { id: "hh-7", title: "Find The Maximum Repeating Number In Ok Time", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Find The Maximum Repeating Number In Ok Time", "geeksforgeeks") },
      { id: "hh-8", title: "K Th Smallest Element Removing Integers Natural Numbers", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("K Th Smallest Element Removing Integers Natural Numbers", "geeksforgeeks") },
      { id: "hh-9", title: "Find K Closest Elements Given Value", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Find K Closest Elements Given Value", "geeksforgeeks") },
      { id: "hh-10", title: "Kth Largest Element In A Stream", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Kth Largest Element In A Stream", "geeksforgeeks") },
      { id: "hh-11", title: "Connect N Ropes Minimum Cost", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Connect N Ropes Minimum Cost", "geeksforgeeks") },
      { id: "hh-12", title: "Cuckoo Hashing", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Cuckoo Hashing", "geeksforgeeks") },
      { id: "hh-13", title: "Find Itinerary From A Given List Of Tickets", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Find Itinerary From A Given List Of Tickets", "geeksforgeeks") },
      { id: "hh-14", title: "Find The Largest Subarray With 0 Sum", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Find The Largest Subarray With 0 Sum", "geeksforgeeks") },
      { id: "hh-15", title: "Count Distinct Elements In Every Window Of Size K", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Count Distinct Elements In Every Window Of Size K", "geeksforgeeks") },
      { id: "hh-16", title: "Group Shifted String", platform: "geeksforgeeks", difficulty: "Medium", url: makeUrl("Group Shifted String", "geeksforgeeks") },
      { id: "hh-17", title: "Merge k Sorted Lists", platform: "leetcode", difficulty: "Hard", url: makeUrl("Merge k Sorted Lists", "leetcode") },
      { id: "hh-18", title: "Find Median from Data Stream", platform: "leetcode", difficulty: "Hard", url: makeUrl("Find Median from Data Stream", "leetcode") },
      { id: "hh-19", title: "Sliding Window Maximum Maximum Of All Subarrays Of Size K", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Sliding Window Maximum Maximum Of All Subarrays Of Size K", "geeksforgeeks") },
      { id: "hh-20", title: "Find The Smallest Positive Number Missing From An Unsorted Array", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Find The Smallest Positive Number Missing From An Unsorted Array", "geeksforgeeks") },
      { id: "hh-21", title: "Find Surpasser Count Of Each Element In Array", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Find Surpasser Count Of Each Element In Array", "geeksforgeeks") },
      { id: "hh-22", title: "Tournament Tree And Binary Heap", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Tournament Tree And Binary Heap", "geeksforgeeks") },
      { id: "hh-23", title: "Online Algorithm For Checking Palindrome In A Stream", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Online Algorithm For Checking Palindrome In A Stream", "geeksforgeeks") },
      { id: "hh-24", title: "Length Largest Subarray Contiguous Elements Set 2", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Length Largest Subarray Contiguous Elements Set 2", "geeksforgeeks") },
      { id: "hh-25", title: "Palindrome Substring Queries", platform: "geeksforgeeks", difficulty: "Hard", url: makeUrl("Palindrome Substring Queries", "geeksforgeeks") },
      { id: "hh-26", title: "Subarrays Distinct Elements", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Subarrays Distinct Elements", "geeksforgeeks") },
      { id: "hh-27", title: "Find Recurring Sequence Fraction", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Find Recurring Sequence Fraction", "geeksforgeeks") },
      { id: "hh-28", title: "K Maximum Sum Combinations Two Arrays", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("K Maximum Sum Combinations Two Arrays", "geeksforgeeks") }
    ]
  },
  {
    id: "graphs",
    title: "Graphs",
    total: 39,
    problems: [
      { id: "grph-1", title: "BFS of graph", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("BFS of graph", "geeksforgeeks") },
      { id: "grph-2", title: "Depth First Search Or Dfs For A Graph", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Depth First Search Or Dfs For A Graph", "geeksforgeeks") },
      { id: "grph-3", title: "Flood Fill", platform: "leetcode", difficulty: "Easy", url: makeUrl("Flood Fill", "leetcode") },
      { id: "grph-4", title: "Number Of Triangles In Directed And Undirected Graphs", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Number Of Triangles In Directed And Undirected Graphs", "geeksforgeeks") },
      { id: "grph-5", title: "Detect Cycle In A Graph", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Detect Cycle In A Graph", "geeksforgeeks") },
      { id: "grph-6", title: "Undirected Graph Cycle", platform: "geeksforgeeks", difficulty: "Medium", url: makeUrl("Undirected Graph Cycle", "geeksforgeeks") },
      { id: "grph-7", title: "Rat in a Maze", platform: "geeksforgeeks", difficulty: "Medium", url: makeUrl("Rat in a Maze", "geeksforgeeks") },
      { id: "grph-8", title: "Steps by Knight", platform: "geeksforgeeks", difficulty: "Medium", url: makeUrl("Steps by Knight", "geeksforgeeks") },
      { id: "grph-9", title: "Clone Graph", platform: "leetcode", difficulty: "Medium", url: makeUrl("Clone Graph", "leetcode") },
      { id: "grph-10", title: "Number of Operations to Make Network Connected", platform: "leetcode", difficulty: "Medium", url: makeUrl("Number of Operations to Make Network Connected", "leetcode") },
      { id: "grph-11", title: "Dijkstras Shortest Path Algorithm Greedy Algo 7", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Dijkstras Shortest Path Algorithm Greedy Algo 7", "geeksforgeeks") },
      { id: "grph-12", title: "Topological Sort", platform: "geeksforgeeks", difficulty: "Medium", url: makeUrl("Topological Sort", "geeksforgeeks") },
      { id: "grph-13", title: "oliver and the game 3", platform: "hackerearth", difficulty: "Easy", url: makeUrl("oliver and the game 3", "hackerearth") },
      { id: "grph-14", title: "Minimum time taken by each job to be completed given by a Directed Acyclic Graph", platform: "geeksforgeeks", difficulty: "Medium", url: makeUrl("Minimum time taken by each job to be completed given by a Directed Acyclic Graph", "geeksforgeeks") },
      { id: "grph-15", title: "Find Whether It Is Possible To Finish All Tasks Or Not From Given Dependencies", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Find Whether It Is Possible To Finish All Tasks Or Not From Given Dependencies", "geeksforgeeks") },
      { id: "grph-16", title: "Find the number of islands", platform: "geeksforgeeks", difficulty: "Medium", url: makeUrl("Find the number of islands", "geeksforgeeks") },
      { id: "grph-17", title: "Prims Minimum Spanning Tree Mst Greedy Algo 5", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Prims Minimum Spanning Tree Mst Greedy Algo 5", "geeksforgeeks") },
      { id: "grph-18", title: "Negative weight cycle", platform: "geeksforgeeks", difficulty: "Medium", url: makeUrl("Negative weight cycle", "geeksforgeeks") },
      { id: "grph-19", title: "Floyd Warshall", platform: "geeksforgeeks", difficulty: "Medium", url: makeUrl("Floyd Warshall", "geeksforgeeks") },
      { id: "grph-20", title: "Graph Coloring Applications", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Graph Coloring Applications", "geeksforgeeks") },
      { id: "grph-21", title: "Snakes and Ladders", platform: "leetcode", difficulty: "Medium", url: makeUrl("Snakes and Ladders", "leetcode") },
      { id: "grph-22", title: "Strongly Connected", platform: "geeksforgeeks", difficulty: "Medium", url: makeUrl("Strongly Connected", "geeksforgeeks") },
      { id: "grph-23", title: "journey to the moon", platform: "hackerrank", difficulty: "Easy", url: makeUrl("journey to the moon", "hackerrank") },
      { id: "grph-24", title: "Vertex Cover Problem Set 1 Introduction Approximate Algorithm 2", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Vertex Cover Problem Set 1 Introduction Approximate Algorithm 2", "geeksforgeeks") },
      { id: "grph-25", title: "M-Coloring Problem", platform: "geeksforgeeks", difficulty: "Medium", url: makeUrl("M-Coloring Problem", "geeksforgeeks") },
      { id: "grph-26", title: "Cheapest Flights Within K Stops", platform: "leetcode", difficulty: "Medium", url: makeUrl("Cheapest Flights Within K Stops", "leetcode") },
      { id: "grph-27", title: "Find If There Is A Path Of More Than K Length From A Source", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Find If There Is A Path Of More Than K Length From A Source", "geeksforgeeks") },
      { id: "grph-28", title: "Detect Negative Cycle Graph Bellman Ford", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Detect Negative Cycle Graph Bellman Ford", "geeksforgeeks") },
      { id: "grph-29", title: "Bipartite Graph", platform: "geeksforgeeks", difficulty: "Medium", url: makeUrl("Bipartite Graph", "geeksforgeeks") },
      { id: "grph-30", title: "Word Ladder", platform: "leetcode", difficulty: "Hard", url: makeUrl("Word Ladder", "leetcode") },
      { id: "grph-31", title: "Alien Dictionary", platform: "geeksforgeeks", difficulty: "Hard", url: makeUrl("Alien Dictionary", "geeksforgeeks") },
      { id: "grph-32", title: "Kruskals Minimum Spanning Tree Algorithm Greedy Algo 2", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Kruskals Minimum Spanning Tree Algorithm Greedy Algo 2", "geeksforgeeks") },
      { id: "grph-33", title: "Total Number Spanning Trees Graph", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Total Number Spanning Trees Graph", "geeksforgeeks") },
      { id: "grph-34", title: "Travelling Salesman Problem Set 1", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Travelling Salesman Problem Set 1", "geeksforgeeks") },
      { id: "grph-35", title: "Find Longest Path Directed Acyclic Graph", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Find Longest Path Directed Acyclic Graph", "geeksforgeeks") },
      { id: "grph-36", title: "Two Clique Problem Check Graph Can Divided Two Cliques", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Two Clique Problem Check Graph Can Divided Two Cliques", "geeksforgeeks") },
      { id: "grph-37", title: "Minimize Cash Flow Among Given Set Friends Borrowed Money", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Minimize Cash Flow Among Given Set Friends Borrowed Money", "geeksforgeeks") },
      { id: "grph-38", title: "Chinese Postman Route Inspection Set 1 Introduction", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Chinese Postman Route Inspection Set 1 Introduction", "geeksforgeeks") },
      { id: "grph-39", title: "Water Jug Problem Using Bfs", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Water Jug Problem Using Bfs", "geeksforgeeks") }
    ]
  },
  {
    id: "tries",
    title: "Tries",
    total: 4,
    problems: [
      { id: "tr-1", title: "Trie Insert And Search", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Trie Insert And Search", "geeksforgeeks") },
      { id: "tr-2", title: "Unique rows in boolean matrix", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Unique rows in boolean matrix", "geeksforgeeks") },
      { id: "tr-3", title: "Word Break Problem Trie Solution", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Word Break Problem Trie Solution", "geeksforgeeks") },
      { id: "tr-4", title: "Find All Shortest Unique Prefixes To Represent Each Word In A Given List", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Find All Shortest Unique Prefixes To Represent Each Word In A Given List", "geeksforgeeks") }
    ]
  },
  {
    id: "dp",
    title: "DP",
    total: 53,
    problems: [
      { id: "dp-1", title: "Knapsack with Duplicate Items", platform: "geeksforgeeks", difficulty: "Medium", url: makeUrl("Knapsack with Duplicate Items", "geeksforgeeks") },
      { id: "dp-2", title: "BBT counter", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("BBT counter", "geeksforgeeks") },
      { id: "dp-3", title: "Reach a given score", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Reach a given score", "geeksforgeeks") },
      { id: "dp-4", title: "Maximum difference of zeros and ones in binary string", platform: "geeksforgeeks", difficulty: "Medium", url: makeUrl("Maximum difference of zeros and ones in binary string", "geeksforgeeks") },
      { id: "dp-5", title: "Climbing Stairs", platform: "leetcode", difficulty: "Easy", url: makeUrl("Climbing Stairs", "leetcode") },
      { id: "dp-6", title: "Permutation Coefficient", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Permutation Coefficient", "geeksforgeeks") },
      { id: "dp-7", title: "Longest Repeating Subsequence", platform: "geeksforgeeks", difficulty: "Medium", url: makeUrl("Longest Repeating Subsequence", "geeksforgeeks") },
      { id: "dp-8", title: "Pairs with certain difference", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Pairs with certain difference", "geeksforgeeks") },
      { id: "dp-9", title: "Longest subsequence-1", platform: "geeksforgeeks", difficulty: "Medium", url: makeUrl("Longest subsequence-1", "geeksforgeeks") },
      { id: "dp-10", title: "Coin Change", platform: "leetcode", difficulty: "Medium", url: makeUrl("Coin Change", "leetcode") },
      { id: "dp-11", title: "Longest Increasing Subsequence", platform: "leetcode", difficulty: "Medium", url: makeUrl("Longest Increasing Subsequence", "leetcode") },
      { id: "dp-12", title: "Longest Common Subsequence", platform: "leetcode", difficulty: "Medium", url: makeUrl("Longest Common Subsequence", "leetcode") },
      { id: "dp-13", title: "Word Break", platform: "leetcode", difficulty: "Medium", url: makeUrl("Word Break", "leetcode") },
      { id: "dp-14", title: "Combination Sum IV", platform: "leetcode", difficulty: "Medium", url: makeUrl("Combination Sum IV", "leetcode") },
      { id: "dp-15", title: "House Robber", platform: "leetcode", difficulty: "Medium", url: makeUrl("House Robber", "leetcode") },
      { id: "dp-16", title: "House Robber II", platform: "leetcode", difficulty: "Medium", url: makeUrl("House Robber II", "leetcode") },
      { id: "dp-17", title: "Decode Ways", platform: "leetcode", difficulty: "Medium", url: makeUrl("Decode Ways", "leetcode") },
      { id: "dp-18", title: "Unique Paths", platform: "leetcode", difficulty: "Medium", url: makeUrl("Unique Paths", "leetcode") },
      { id: "dp-19", title: "Jump Game", platform: "leetcode", difficulty: "Medium", url: makeUrl("Jump Game", "leetcode") },
      { id: "dp-20", title: "0 - 1 Knapsack Problem", platform: "geeksforgeeks", difficulty: "Medium", url: makeUrl("0 - 1 Knapsack Problem", "geeksforgeeks") },
      { id: "dp-21", title: "nCr", platform: "geeksforgeeks", difficulty: "Medium", url: makeUrl("nCr", "geeksforgeeks") },
      { id: "dp-22", title: "Program Nth Catalan Number", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Program Nth Catalan Number", "geeksforgeeks") },
      { id: "dp-23", title: "Edit Distance", platform: "geeksforgeeks", difficulty: "Hard", url: makeUrl("Edit Distance", "geeksforgeeks") },
      { id: "dp-24", title: "Partition Equal Subset Sum", platform: "geeksforgeeks", difficulty: "Medium", url: makeUrl("Partition Equal Subset Sum", "geeksforgeeks") },
      { id: "dp-25", title: "Gold Mine Problem", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Gold Mine Problem", "geeksforgeeks") },
      { id: "dp-26", title: "Assembly Line Scheduling Dp 34", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Assembly Line Scheduling Dp 34", "geeksforgeeks") },
      { id: "dp-27", title: "Maximize The Cut Segments", platform: "geeksforgeeks", difficulty: "Medium", url: makeUrl("Maximize The Cut Segments", "geeksforgeeks") },
      { id: "dp-28", title: "Max Sum Increasing Subsequence", platform: "geeksforgeeks", difficulty: "Medium", url: makeUrl("Max Sum Increasing Subsequence", "geeksforgeeks") },
      { id: "dp-29", title: "Count Subsequences Product Less K", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Count Subsequences Product Less K", "geeksforgeeks") },
      { id: "dp-30", title: "Maximum Subsequence Sum Such That No Three Are Consecutive", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Maximum Subsequence Sum Such That No Three Are Consecutive", "geeksforgeeks") },
      { id: "dp-31", title: "Egg Dropping Puzzle", platform: "geeksforgeeks", difficulty: "Medium", url: makeUrl("Egg Dropping Puzzle", "geeksforgeeks") },
      { id: "dp-32", title: "Sum Except First and Last", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Sum Except First and Last", "geeksforgeeks") },
      { id: "dp-33", title: "Largest square formed in a matrix", platform: "geeksforgeeks", difficulty: "Medium", url: makeUrl("Largest square formed in a matrix", "geeksforgeeks") },
      { id: "dp-34", title: "Maximum path sum in matrix", platform: "geeksforgeeks", difficulty: "Medium", url: makeUrl("Maximum path sum in matrix", "geeksforgeeks") },
      { id: "dp-35", title: "Minimum Jumps", platform: "geeksforgeeks", difficulty: "Medium", url: makeUrl("Minimum Jumps", "geeksforgeeks") },
      { id: "dp-36", title: "Minimum Removals Array Make Max Min K", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Minimum Removals Array Make Max Min K", "geeksforgeeks") },
      { id: "dp-37", title: "Longest Common Substring", platform: "geeksforgeeks", difficulty: "Medium", url: makeUrl("Longest Common Substring", "geeksforgeeks") },
      { id: "dp-38", title: "Longest Palindromic Subsequence Dp 12", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Longest Palindromic Subsequence Dp 12", "geeksforgeeks") },
      { id: "dp-39", title: "Count Palindromic Subsequences", platform: "geeksforgeeks", difficulty: "Medium", url: makeUrl("Count Palindromic Subsequences", "geeksforgeeks") },
      { id: "dp-40", title: "Longest Palindromic Substring", platform: "leetcode", difficulty: "Medium", url: makeUrl("Longest Palindromic Substring", "leetcode") },
      { id: "dp-41", title: "Longest alternating subsequence", platform: "geeksforgeeks", difficulty: "Medium", url: makeUrl("Longest alternating subsequence", "geeksforgeeks") },
      { id: "dp-42", title: "Weighted Job Scheduling", platform: "geeksforgeeks", difficulty: "Medium", url: makeUrl("Weighted Job Scheduling", "geeksforgeeks") },
      { id: "dp-43", title: "Coin Game Winner Every Player Three Choices", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Coin Game Winner Every Player Three Choices", "geeksforgeeks") },
      { id: "dp-44", title: "Count Derangements Permutation Such That No Element Appears In Its Original Position", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Count Derangements Permutation Such That No Element Appears In Its Original Position", "geeksforgeeks") },
      { id: "dp-45", title: "Optimal Strategy For A Game", platform: "geeksforgeeks", difficulty: "Medium", url: makeUrl("Optimal Strategy For A Game", "geeksforgeeks") },
      { id: "dp-46", title: "Word Wrap", platform: "geeksforgeeks", difficulty: "Hard", url: makeUrl("Word Wrap", "geeksforgeeks") },
      { id: "dp-47", title: "Mobile numeric keypad", platform: "geeksforgeeks", difficulty: "Medium", url: makeUrl("Mobile numeric keypad", "geeksforgeeks") },
      { id: "dp-48", title: "Maximum Length of Pair Chain", platform: "leetcode", difficulty: "Medium", url: makeUrl("Maximum Length of Pair Chain", "leetcode") },
      { id: "dp-49", title: "Matrix Chain Multiplication Dp 8", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Matrix Chain Multiplication Dp 8", "geeksforgeeks") },
      { id: "dp-50", title: "Maximum Profit By Buying And Selling A Share At Most Twice", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Maximum Profit By Buying And Selling A Share At Most Twice", "geeksforgeeks") },
      { id: "dp-51", title: "Optimal Binary Search Tree Dp 24", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Optimal Binary Search Tree Dp 24", "geeksforgeeks") },
      { id: "dp-52", title: "Largest Rectangular Sub Matrix Whose Sum 0", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Largest Rectangular Sub Matrix Whose Sum 0", "geeksforgeeks") },
      { id: "dp-53", title: "Largest Area Rectangular Sub Matrix Equal Number 1s 0s", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Largest Area Rectangular Sub Matrix Equal Number 1s 0s", "geeksforgeeks") }
    ]
  },
  {
    id: "bit-manipulation",
    title: "Bit Manipulation",
    total: 7,
    problems: [
      { id: "bm-1", title: "Number of 1 Bits", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Number of 1 Bits", "geeksforgeeks") },
      { id: "bm-2", title: "Unique Number II", platform: "geeksforgeeks", difficulty: "Medium", url: makeUrl("Unique Number II", "geeksforgeeks") },
      { id: "bm-3", title: "Find position of set bit", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Find position of set bit", "geeksforgeeks") },
      { id: "bm-4", title: "Copy Set Bits In A Range", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Copy Set Bits In A Range", "geeksforgeeks") },
      { id: "bm-5", title: "Calculate Square Of A Number Without Using And Pow", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Calculate Square Of A Number Without Using And Pow", "geeksforgeeks") },
      { id: "bm-6", title: "Divide Two Integers Without Using Multiplication Division Mod Operator", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Divide Two Integers Without Using Multiplication Division Mod Operator", "geeksforgeeks") },
      { id: "bm-7", title: "Power Set", platform: "geeksforgeeks", difficulty: "Medium", url: makeUrl("Power Set", "geeksforgeeks") }
    ]
  },
  {
    id: "segment-trees",
    title: "Segment Trees",
    total: 5,
    problems: [
      { id: "st-1", title: "Range Sum Query - Immutable", platform: "leetcode", difficulty: "Easy", url: makeUrl("Range Sum Query - Immutable", "leetcode") },
      { id: "st-2", title: "Range Sum Query - Mutable", platform: "leetcode", difficulty: "Medium", url: makeUrl("Range Sum Query - Mutable", "leetcode") },
      { id: "st-3", title: "Create Sorted Array through Instructions", platform: "leetcode", difficulty: "Hard", url: makeUrl("Create Sorted Array through Instructions", "leetcode") },
      { id: "st-4", title: "Count of Range Sum", platform: "leetcode", difficulty: "Hard", url: makeUrl("Count of Range Sum", "leetcode") },
      { id: "st-5", title: "Count of Smaller Numbers After Self", platform: "leetcode", difficulty: "Hard", url: makeUrl("Count of Smaller Numbers After Self", "leetcode") }
    ]
  },
  {
    id: "bonus",
    title: "BONUS",
    total: 39,
    problems: [
      { id: "bn-1", title: "Nearly Sorted Algorithm", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Nearly Sorted Algorithm", "geeksforgeeks") },
      { id: "bn-2", title: "How To Efficiently Sort A Big List Dates In 20s", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("How To Efficiently Sort A Big List Dates In 20s", "geeksforgeeks") },
      { id: "bn-3", title: "Find A Repeating And A Missing Number", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Find A Repeating And A Missing Number", "geeksforgeeks") },
      { id: "bn-4", title: "Sort Array According Count Set Bits", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Sort Array According Count Set Bits", "geeksforgeeks") },
      { id: "bn-5", title: "Minimum Swaps To Make Two Array Identical", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Minimum Swaps To Make Two Array Identical", "geeksforgeeks") },
      { id: "bn-6", title: "Insert In Sorted And Non Overlapping Interval Array", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Insert In Sorted And Non Overlapping Interval Array", "geeksforgeeks") },
      { id: "bn-7", title: "3 Way Quicksort Dutch National Flag", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("3 Way Quicksort Dutch National Flag", "geeksforgeeks") },
      { id: "bn-8", title: "Find If There Is A Path Of More Than K Length From A Source", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Find If There Is A Path Of More Than K Length From A Source", "geeksforgeeks") },
      { id: "bn-9", title: "Match A Pattern And String Without Using Regular Expressions", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Match A Pattern And String Without Using Regular Expressions", "geeksforgeeks") },
      { id: "bn-10", title: "Josephus Circle Using Circular Linked List", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Josephus Circle Using Circular Linked List", "geeksforgeeks") },
      { id: "bn-11", title: "Find A Triplet From Three Linked Lists With Sum Equal To A Given Number", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Find A Triplet From Three Linked Lists With Sum Equal To A Given Number", "geeksforgeeks") },
      { id: "bn-12", title: "Find Pair Given Sum Sorted Singly Linked Without Extra Space", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Find Pair Given Sum Sorted Singly Linked Without Extra Space", "geeksforgeeks") },
      { id: "bn-13", title: "Select A Random Node From A Singly Linked List", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Select A Random Node From A Singly Linked List", "geeksforgeeks") },
      { id: "bn-14", title: "Find First Non Repeating Character Stream Characters", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Find First Non Repeating Character Stream Characters", "geeksforgeeks") },
      { id: "bn-15", title: "Implement Stack Using Priority Queue Or Heap", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Implement Stack Using Priority Queue Or Heap", "geeksforgeeks") },
      { id: "bn-16", title: "Sum Minimum Maximum Elements Subarrays Size K", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Sum Minimum Maximum Elements Subarrays Size K", "geeksforgeeks") },
      { id: "bn-17", title: "Minimum Time Required So That All Oranges Become Rotten", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Minimum Time Required So That All Oranges Become Rotten", "geeksforgeeks") },
      { id: "bn-18", title: "Efficiently Implement K Queues Single Array", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Efficiently Implement K Queues Single Array", "geeksforgeeks") },
      { id: "bn-19", title: "Maximize Array Sun After K Negation Operations", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Maximize Array Sun After K Negation Operations", "geeksforgeeks") },
      { id: "bn-20", title: "Program For Shortest Job First Or Sjf Cpu Scheduling Set 1 Non Preemptive", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Program For Shortest Job First Or Sjf Cpu Scheduling Set 1 Non Preemptive", "geeksforgeeks") },
      { id: "bn-21", title: "Check Mirror in N-ary tree", platform: "geeksforgeeks", difficulty: "Medium", url: makeUrl("Check Mirror in N-ary tree", "geeksforgeeks") },
      { id: "bn-22", title: "Maximum Sum Nodes Binary Tree No Two Adjacent", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Maximum Sum Nodes Binary Tree No Two Adjacent", "geeksforgeeks") },
      { id: "bn-23", title: "Find Sum Pairs Across Two BSTs", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Find Sum Pairs Across Two BSTs", "geeksforgeeks") },
      { id: "bn-24", title: "Find Four Elements A B C And D In An Array Such That Ab Cd", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Find Four Elements A B C And D In An Array Such That Ab Cd", "geeksforgeeks") },
      { id: "bn-25", title: "Check If An Array Can Be Divided Into Pairs Whose Sum Is Divisible By K", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Check If An Array Can Be Divided Into Pairs Whose Sum Is Divisible By K", "geeksforgeeks") },
      { id: "bn-26", title: "A Data Structure Question", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("A Data Structure Question", "geeksforgeeks") },
      { id: "bn-27", title: "Find Number Of Employees Under Every Manager", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Find Number Of Employees Under Every Manager", "geeksforgeeks") },
      { id: "bn-28", title: "A Pancake Sorting Question", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("A Pancake Sorting Question", "geeksforgeeks") },
      { id: "bn-29", title: "Bridge In A Graph", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Bridge In A Graph", "geeksforgeeks") },
      { id: "bn-30", title: "Paths Travel Nodes Using Edgeseven Bridges Konigsberg", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Paths Travel Nodes Using Edgeseven Bridges Konigsberg", "geeksforgeeks") },
      { id: "bn-31", title: "Minimum Edges Reverse Make Path Source Destination", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Minimum Edges Reverse Make Path Source Destination", "geeksforgeeks") },
      { id: "bn-32", title: "Maximum sum Rectangle", platform: "geeksforgeeks", difficulty: "Hard", url: makeUrl("Maximum sum Rectangle", "geeksforgeeks") },
      { id: "bn-33", title: "Interleaved Strings", platform: "geeksforgeeks", difficulty: "Medium", url: makeUrl("Interleaved Strings", "geeksforgeeks") },
      { id: "bn-34", title: "Painting the Fence", platform: "geeksforgeeks", difficulty: "Medium", url: makeUrl("Painting the Fence", "geeksforgeeks") },
      { id: "bn-35", title: "Largest Independent Set Problem Dp 26", platform: "geeksforgeeks", difficulty: "Easy", url: makeUrl("Largest Independent Set Problem Dp 26", "geeksforgeeks") },
      { id: "bn-36", title: "Minimum cost to fill given weight in a bag", platform: "geeksforgeeks", difficulty: "Medium", url: makeUrl("Minimum cost to fill given weight in a bag", "geeksforgeeks") },
      { id: "bn-37", title: "Boolean Parenthesization", platform: "geeksforgeeks", difficulty: "Hard", url: makeUrl("Boolean Parenthesization", "geeksforgeeks") },
      { id: "bn-38", title: "Stock Buy and Sell – Max K Transactions Allowed", platform: "geeksforgeeks", difficulty: "Hard", url: makeUrl("Stock Buy and Sell – Max K Transactions Allowed", "geeksforgeeks") },
      { id: "bn-39", title: "Palindromic Partitioning", platform: "geeksforgeeks", difficulty: "Hard", url: makeUrl("Palindromic Partitioning", "geeksforgeeks") }
    ]
  }
];

export const TOTAL_PENGUIN_PROBLEMS = PENGUIN_DSA_SHEET_CATEGORIES.reduce(
  (acc, cat) => acc + cat.problems.length,
  0
);
