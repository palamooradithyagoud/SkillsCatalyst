export type StriverDifficulty = "Easy" | "Medium" | "Hard";

export interface StriverProblem {
  id: string;
  stepNumber: number;
  stepName: string;
  qno: number;
  title: string;
  difficulty: StriverDifficulty;
  youtube_url?: string | null;
  leetcode_url: string;
  article_url?: string;
  companies: string[];
}

export interface StriverCategory {
  id: string;
  stepNumber: number;
  title: string;
  stepRange: string;
  description: string;
  problems: StriverProblem[];
}

export const TOTAL_STRIVER_PROBLEMS = 455;
export const STRIVER_TOTAL_STEPS = 18;
export const STRIVER_EASY_COUNT = 148;
export const STRIVER_MEDIUM_COUNT = 251;
export const STRIVER_HARD_COUNT = 56;

export const STRIVER_DSA_CATEGORIES: StriverCategory[] = [
  {
    "id": "step-1",
    "stepNumber": 1,
    "title": "Step 1: Learn the basics",
    "stepRange": "Q1 - Q31",
    "description": "31 curated problems covering Learn the basics",
    "problems": [
      {
        "id": "striver-q-1",
        "stepNumber": 1,
        "stepName": "Step 1: Learn the basics",
        "qno": 1,
        "title": "User Input / Output",
        "difficulty": "Easy",
        "youtube_url": "https://youtu.be/EAR7De6Goz4?t=250",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=User+Input+/+Output",
        "article_url": "https://takeuforward.org/?s=User+Input+/+Output",
        "companies": [
          "Amazon",
          "Microsoft",
          "Meta"
        ]
      },
      {
        "id": "striver-q-2",
        "stepNumber": 1,
        "stepName": "Step 1: Learn the basics",
        "qno": 2,
        "title": "Data Types",
        "difficulty": "Easy",
        "youtube_url": "https://youtu.be/EAR7De6Goz4?t=755",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Data+Types",
        "article_url": "https://takeuforward.org/?s=Data+Types",
        "companies": [
          "Google",
          "Apple",
          "Uber"
        ]
      },
      {
        "id": "striver-q-3",
        "stepNumber": 1,
        "stepName": "Step 1: Learn the basics",
        "qno": 3,
        "title": "If Else statements",
        "difficulty": "Easy",
        "youtube_url": "https://youtu.be/EAR7De6Goz4?t=1259",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=If+Else+statements",
        "article_url": "https://takeuforward.org/?s=If+Else+statements",
        "companies": [
          "Microsoft",
          "Goldman Sachs",
          "Amazon"
        ]
      },
      {
        "id": "striver-q-4",
        "stepNumber": 1,
        "stepName": "Step 1: Learn the basics",
        "qno": 4,
        "title": "Switch Statement",
        "difficulty": "Easy",
        "youtube_url": "https://youtu.be/EAR7De6Goz4",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Switch+Statement",
        "article_url": "https://takeuforward.org/?s=Switch+Statement",
        "companies": [
          "Meta",
          "Google",
          "Bloomberg"
        ]
      },
      {
        "id": "striver-q-5",
        "stepNumber": 1,
        "stepName": "Step 1: Learn the basics",
        "qno": 5,
        "title": "For loops",
        "difficulty": "Easy",
        "youtube_url": "https://youtu.be/EAR7De6Goz4?t=3096",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=For+loops",
        "article_url": "https://takeuforward.org/?s=For+loops",
        "companies": [
          "Amazon",
          "Adobe",
          "Flipkart"
        ]
      },
      {
        "id": "striver-q-6",
        "stepNumber": 1,
        "stepName": "Step 1: Learn the basics",
        "qno": 6,
        "title": "While loops",
        "difficulty": "Easy",
        "youtube_url": "https://youtu.be/EAR7De6Goz4?t=3459",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=While+loops",
        "article_url": "https://takeuforward.org/?s=While+loops",
        "companies": [
          "Google",
          "Microsoft",
          "Uber"
        ]
      },
      {
        "id": "striver-q-7",
        "stepNumber": 1,
        "stepName": "Step 1: Learn the basics",
        "qno": 7,
        "title": "Functions (Pass by Reference and Value)",
        "difficulty": "Easy",
        "youtube_url": "https://youtu.be/EAR7De6Goz4?t=3677",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Functions",
        "article_url": "https://takeuforward.org/?s=Functions",
        "companies": [
          "Apple",
          "Amazon",
          "Netflix"
        ]
      },
      {
        "id": "striver-q-8",
        "stepNumber": 1,
        "stepName": "Step 1: Learn the basics",
        "qno": 8,
        "title": "What are arrays, strings?",
        "difficulty": "Easy",
        "youtube_url": null,
        "leetcode_url": "https://leetcode.com/problemset/all/?search=What+are+arrays,+strings?",
        "article_url": "https://takeuforward.org/?s=What+are+arrays,+strings?",
        "companies": [
          "Google",
          "Amazon",
          "Microsoft"
        ]
      },
      {
        "id": "striver-q-9",
        "stepNumber": 1,
        "stepName": "Step 1: Learn the basics",
        "qno": 9,
        "title": "Time Complexity [Learn Basics, and then analyse in next Steps]",
        "difficulty": "Easy",
        "youtube_url": null,
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Time+Complexity",
        "article_url": "https://takeuforward.org/?s=Time+Complexity",
        "companies": [
          "Amazon",
          "Microsoft",
          "Meta"
        ]
      },
      {
        "id": "striver-q-10",
        "stepNumber": 1,
        "stepName": "Step 1: Learn the basics",
        "qno": 10,
        "title": "Count Digits",
        "difficulty": "Easy",
        "youtube_url": "https://youtu.be/1xNbjMdbjug",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Count+Digits",
        "article_url": "https://takeuforward.org/?s=Count+Digits",
        "companies": [
          "Google",
          "Apple",
          "Uber"
        ]
      },
      {
        "id": "striver-q-11",
        "stepNumber": 1,
        "stepName": "Step 1: Learn the basics",
        "qno": 11,
        "title": "Reverse a Number",
        "difficulty": "Easy",
        "youtube_url": "https://youtu.be/1xNbjMdbjug?t=930",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Reverse+a+Number",
        "article_url": "https://takeuforward.org/?s=Reverse+a+Number",
        "companies": [
          "Microsoft",
          "Goldman Sachs",
          "Amazon"
        ]
      },
      {
        "id": "striver-q-12",
        "stepNumber": 1,
        "stepName": "Step 1: Learn the basics",
        "qno": 12,
        "title": "Check Palindrome",
        "difficulty": "Easy",
        "youtube_url": "https://youtu.be/1xNbjMdbjug?t=1230",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Check+Palindrome",
        "article_url": "https://takeuforward.org/?s=Check+Palindrome",
        "companies": [
          "Meta",
          "Google",
          "Bloomberg"
        ]
      },
      {
        "id": "striver-q-13",
        "stepNumber": 1,
        "stepName": "Step 1: Learn the basics",
        "qno": 13,
        "title": "GCD Or HCF",
        "difficulty": "Easy",
        "youtube_url": "https://youtu.be/1xNbjMdbjug?t=2684",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=GCD+Or+HCF",
        "article_url": "https://takeuforward.org/?s=GCD+Or+HCF",
        "companies": [
          "Amazon",
          "Adobe",
          "Flipkart"
        ]
      },
      {
        "id": "striver-q-14",
        "stepNumber": 1,
        "stepName": "Step 1: Learn the basics",
        "qno": 14,
        "title": "Armstrong Numbers",
        "difficulty": "Easy",
        "youtube_url": "https://youtu.be/1xNbjMdbjug?t=1418",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Armstrong+Numbers",
        "article_url": "https://takeuforward.org/?s=Armstrong+Numbers",
        "companies": [
          "Google",
          "Microsoft",
          "Uber"
        ]
      },
      {
        "id": "striver-q-15",
        "stepNumber": 1,
        "stepName": "Step 1: Learn the basics",
        "qno": 15,
        "title": "Print all Divisors",
        "difficulty": "Easy",
        "youtube_url": "https://youtu.be/1xNbjMdbjug?t=1580",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Print+all+Divisors",
        "article_url": "https://takeuforward.org/?s=Print+all+Divisors",
        "companies": [
          "Apple",
          "Amazon",
          "Netflix"
        ]
      },
      {
        "id": "striver-q-16",
        "stepNumber": 1,
        "stepName": "Step 1: Learn the basics",
        "qno": 16,
        "title": "Check for Prime",
        "difficulty": "Easy",
        "youtube_url": "https://youtu.be/1xNbjMdbjug?t=2381",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Check+for+Prime",
        "article_url": "https://takeuforward.org/?s=Check+for+Prime",
        "companies": [
          "Google",
          "Amazon",
          "Microsoft"
        ]
      },
      {
        "id": "striver-q-17",
        "stepNumber": 1,
        "stepName": "Step 1: Learn the basics",
        "qno": 17,
        "title": "Understand recursion by print something N times",
        "difficulty": "Easy",
        "youtube_url": "https://www.youtube.com/watch?v=yVdKa8dnKiE&list=PLgUwDviBIf0rGlzIn_7rsaR2FQ5e6ZOL9",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Understand+recursion+by+print+something+N+times",
        "article_url": "https://takeuforward.org/?s=Understand+recursion+by+print+something+N+times",
        "companies": [
          "Amazon",
          "Microsoft",
          "Meta"
        ]
      },
      {
        "id": "striver-q-18",
        "stepNumber": 1,
        "stepName": "Step 1: Learn the basics",
        "qno": 18,
        "title": "Print name N times using recursion",
        "difficulty": "Easy",
        "youtube_url": "https://www.youtube.com/watch?v=un6PLygfXrA&list=PLgUwDviBIf0rGlzIn_7rsaR2FQ5e6ZOL9&index=2",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Print+name+N+times+using+recursion",
        "article_url": "https://takeuforward.org/?s=Print+name+N+times+using+recursion",
        "companies": [
          "Google",
          "Apple",
          "Uber"
        ]
      },
      {
        "id": "striver-q-19",
        "stepNumber": 1,
        "stepName": "Step 1: Learn the basics",
        "qno": 19,
        "title": "Print 1 to N using recursion",
        "difficulty": "Easy",
        "youtube_url": "https://www.youtube.com/watch?v=un6PLygfXrA&list=PLgUwDviBIf0rGlzIn_7rsaR2FQ5e6ZOL9&index=2",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Print+1+to+N+using+recursion",
        "article_url": "https://takeuforward.org/?s=Print+1+to+N+using+recursion",
        "companies": [
          "Microsoft",
          "Goldman Sachs",
          "Amazon"
        ]
      },
      {
        "id": "striver-q-20",
        "stepNumber": 1,
        "stepName": "Step 1: Learn the basics",
        "qno": 20,
        "title": "Print N to 1 using recursion",
        "difficulty": "Easy",
        "youtube_url": "https://www.youtube.com/watch?v=un6PLygfXrA&list=PLgUwDviBIf0rGlzIn_7rsaR2FQ5e6ZOL9&index=2",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Print+N+to+1+using+recursion",
        "article_url": "https://takeuforward.org/?s=Print+N+to+1+using+recursion",
        "companies": [
          "Meta",
          "Google",
          "Bloomberg"
        ]
      },
      {
        "id": "striver-q-21",
        "stepNumber": 1,
        "stepName": "Step 1: Learn the basics",
        "qno": 21,
        "title": "Sum of first N numbers",
        "difficulty": "Easy",
        "youtube_url": "https://www.youtube.com/watch?v=69ZCDFy-OUo&list=PLgUwDviBIf0rGlzIn_7rsaR2FQ5e6ZOL9&index=3",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Sum+of+first+N+numbers",
        "article_url": "https://takeuforward.org/?s=Sum+of+first+N+numbers",
        "companies": [
          "Amazon",
          "Adobe",
          "Flipkart"
        ]
      },
      {
        "id": "striver-q-22",
        "stepNumber": 1,
        "stepName": "Step 1: Learn the basics",
        "qno": 22,
        "title": "Factorial of N numbers",
        "difficulty": "Easy",
        "youtube_url": "https://www.youtube.com/watch?v=69ZCDFy-OUo&list=PLgUwDviBIf0rGlzIn_7rsaR2FQ5e6ZOL9&index=3",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Factorial+of+N+numbers",
        "article_url": "https://takeuforward.org/?s=Factorial+of+N+numbers",
        "companies": [
          "Google",
          "Microsoft",
          "Uber"
        ]
      },
      {
        "id": "striver-q-23",
        "stepNumber": 1,
        "stepName": "Step 1: Learn the basics",
        "qno": 23,
        "title": "Reverse an array",
        "difficulty": "Easy",
        "youtube_url": "https://www.youtube.com/watch?v=twuC1F6gLI8&list=PLgUwDviBIf0rGlzIn_7rsaR2FQ5e6ZOL9&index=4",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Reverse+an+array",
        "article_url": "https://takeuforward.org/?s=Reverse+an+array",
        "companies": [
          "Apple",
          "Amazon",
          "Netflix"
        ]
      },
      {
        "id": "striver-q-24",
        "stepNumber": 1,
        "stepName": "Step 1: Learn the basics",
        "qno": 24,
        "title": "Check if a string is palindrome or not",
        "difficulty": "Easy",
        "youtube_url": "https://www.youtube.com/watch?v=twuC1F6gLI8&list=PLgUwDviBIf0rGlzIn_7rsaR2FQ5e6ZOL9&index=4",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Check+if+a+string+is+palindrome+or+not",
        "article_url": "https://takeuforward.org/?s=Check+if+a+string+is+palindrome+or+not",
        "companies": [
          "Google",
          "Amazon",
          "Microsoft"
        ]
      },
      {
        "id": "striver-q-25",
        "stepNumber": 1,
        "stepName": "Step 1: Learn the basics",
        "qno": 25,
        "title": "Fibonacci Number",
        "difficulty": "Easy",
        "youtube_url": "https://www.youtube.com/watch?v=kvRjNm4rVBE&list=PLgUwDviBIf0rGlzIn_7rsaR2FQ5e6ZOL9&index=5",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Fibonacci+Number",
        "article_url": "https://takeuforward.org/?s=Fibonacci+Number",
        "companies": [
          "Amazon",
          "Microsoft",
          "Meta"
        ]
      },
      {
        "id": "striver-q-26",
        "stepNumber": 1,
        "stepName": "Step 1: Learn the basics",
        "qno": 26,
        "title": "Counting frequencies of array elements",
        "difficulty": "Easy",
        "youtube_url": null,
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Counting+frequencies+of+array+elements",
        "article_url": "https://takeuforward.org/?s=Counting+frequencies+of+array+elements",
        "companies": [
          "Google",
          "Apple",
          "Uber"
        ]
      },
      {
        "id": "striver-q-27",
        "stepNumber": 1,
        "stepName": "Step 1: Learn the basics",
        "qno": 27,
        "title": "Find the highest/lowest frequency element",
        "difficulty": "Easy",
        "youtube_url": null,
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Find+the+highest/lowest+frequency+element",
        "article_url": "https://takeuforward.org/?s=Find+the+highest/lowest+frequency+element",
        "companies": [
          "Microsoft",
          "Goldman Sachs",
          "Amazon"
        ]
      },
      {
        "id": "striver-q-28",
        "stepNumber": 1,
        "stepName": "Step 1: Learn the basics",
        "qno": 28,
        "title": "Hashing Theory",
        "difficulty": "Easy",
        "youtube_url": null,
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Hashing+Theory",
        "article_url": "https://takeuforward.org/?s=Hashing+Theory",
        "companies": [
          "Meta",
          "Google",
          "Bloomberg"
        ]
      },
      {
        "id": "striver-q-29",
        "stepNumber": 1,
        "stepName": "Step 1: Learn the basics",
        "qno": 29,
        "title": "C++ STL",
        "difficulty": "Easy",
        "youtube_url": null,
        "leetcode_url": "https://leetcode.com/problemset/all/?search=C+++STL",
        "article_url": "https://takeuforward.org/?s=C+++STL",
        "companies": [
          "Amazon",
          "Adobe",
          "Flipkart"
        ]
      },
      {
        "id": "striver-q-30",
        "stepNumber": 1,
        "stepName": "Step 1: Learn the basics",
        "qno": 30,
        "title": "Java Collections",
        "difficulty": "Easy",
        "youtube_url": null,
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Java+Collections",
        "article_url": "https://takeuforward.org/?s=Java+Collections",
        "companies": [
          "Google",
          "Microsoft",
          "Uber"
        ]
      },
      {
        "id": "striver-q-31",
        "stepNumber": 1,
        "stepName": "Step 1: Learn the basics",
        "qno": 31,
        "title": "Patterns",
        "difficulty": "Easy",
        "youtube_url": null,
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Patterns",
        "article_url": "https://takeuforward.org/?s=Patterns",
        "companies": [
          "Apple",
          "Amazon",
          "Netflix"
        ]
      }
    ]
  },
  {
    "id": "step-2",
    "stepNumber": 2,
    "title": "Step 2: Learn Important Sorting Techniques",
    "stepRange": "Q32 - Q38",
    "description": "7 curated problems covering Learn Important Sorting Techniques",
    "problems": [
      {
        "id": "striver-q-32",
        "stepNumber": 2,
        "stepName": "Step 2: Learn Important Sorting Techniques",
        "qno": 32,
        "title": "Selection Sort",
        "difficulty": "Easy",
        "youtube_url": "https://youtu.be/HGk_ypEuS24?t=167",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Selection+Sort",
        "article_url": "https://takeuforward.org/?s=Selection+Sort",
        "companies": [
          "Google",
          "Amazon",
          "Microsoft"
        ]
      },
      {
        "id": "striver-q-33",
        "stepNumber": 2,
        "stepName": "Step 2: Learn Important Sorting Techniques",
        "qno": 33,
        "title": "Bubble Sort",
        "difficulty": "Easy",
        "youtube_url": "https://youtu.be/HGk_ypEuS24?t=1061",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Bubble+Sort",
        "article_url": "https://takeuforward.org/?s=Bubble+Sort",
        "companies": [
          "Amazon",
          "Microsoft",
          "Meta"
        ]
      },
      {
        "id": "striver-q-34",
        "stepNumber": 2,
        "stepName": "Step 2: Learn Important Sorting Techniques",
        "qno": 34,
        "title": "Insertion Sort",
        "difficulty": "Easy",
        "youtube_url": "https://youtu.be/HGk_ypEuS24?t=1900",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Insertion+Sort",
        "article_url": "https://takeuforward.org/?s=Insertion+Sort",
        "companies": [
          "Google",
          "Apple",
          "Uber"
        ]
      },
      {
        "id": "striver-q-35",
        "stepNumber": 2,
        "stepName": "Step 2: Learn Important Sorting Techniques",
        "qno": 35,
        "title": "Merge Sort",
        "difficulty": "Easy",
        "youtube_url": "https://youtu.be/ogjf7ORKfd8",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Merge+Sort",
        "article_url": "https://takeuforward.org/?s=Merge+Sort",
        "companies": [
          "Microsoft",
          "Goldman Sachs",
          "Amazon"
        ]
      },
      {
        "id": "striver-q-36",
        "stepNumber": 2,
        "stepName": "Step 2: Learn Important Sorting Techniques",
        "qno": 36,
        "title": "Recursive Bubble Sort",
        "difficulty": "Easy",
        "youtube_url": null,
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Recursive+Bubble+Sort",
        "article_url": "https://takeuforward.org/?s=Recursive+Bubble+Sort",
        "companies": [
          "Meta",
          "Google",
          "Bloomberg"
        ]
      },
      {
        "id": "striver-q-37",
        "stepNumber": 2,
        "stepName": "Step 2: Learn Important Sorting Techniques",
        "qno": 37,
        "title": "Recursive Insertion Sort",
        "difficulty": "Easy",
        "youtube_url": null,
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Recursive+Insertion+Sort",
        "article_url": "https://takeuforward.org/?s=Recursive+Insertion+Sort",
        "companies": [
          "Amazon",
          "Adobe",
          "Flipkart"
        ]
      },
      {
        "id": "striver-q-38",
        "stepNumber": 2,
        "stepName": "Step 2: Learn Important Sorting Techniques",
        "qno": 38,
        "title": "Quick Sort",
        "difficulty": "Easy",
        "youtube_url": "https://youtu.be/WIrA4YexLRQ",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Quick+Sort",
        "article_url": "https://takeuforward.org/?s=Quick+Sort",
        "companies": [
          "Google",
          "Microsoft",
          "Uber"
        ]
      }
    ]
  },
  {
    "id": "step-3",
    "stepNumber": 3,
    "title": "Step 3: Solve Problems on Arrays [Easy -> Medium -> Hard]",
    "stepRange": "Q39 - Q78",
    "description": "40 curated problems covering Solve Problems on Arrays [Easy -> Medium -> Hard]",
    "problems": [
      {
        "id": "striver-q-39",
        "stepNumber": 3,
        "stepName": "Step 3: Solve Problems on Arrays [Easy -> Medium -> Hard]",
        "qno": 39,
        "title": "Largest Element in an Array",
        "difficulty": "Easy",
        "youtube_url": "https://youtu.be/37E9ckMDdTk?t=526",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Largest+Element+in+an+Array",
        "article_url": "https://takeuforward.org/?s=Largest+Element+in+an+Array",
        "companies": [
          "Apple",
          "Amazon",
          "Netflix"
        ]
      },
      {
        "id": "striver-q-40",
        "stepNumber": 3,
        "stepName": "Step 3: Solve Problems on Arrays [Easy -> Medium -> Hard]",
        "qno": 40,
        "title": "Second Largest Element in an Array without sorting",
        "difficulty": "Easy",
        "youtube_url": "https://youtu.be/37E9ckMDdTk?t=810",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Second+Largest+Element+in+an+Array+without+sorting",
        "article_url": "https://takeuforward.org/?s=Second+Largest+Element+in+an+Array+without+sorting",
        "companies": [
          "Google",
          "Amazon",
          "Microsoft"
        ]
      },
      {
        "id": "striver-q-41",
        "stepNumber": 3,
        "stepName": "Step 3: Solve Problems on Arrays [Easy -> Medium -> Hard]",
        "qno": 41,
        "title": "Check if the array is sorted",
        "difficulty": "Easy",
        "youtube_url": "https://youtu.be/37E9ckMDdTk?t=17224",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Check+if+the+array+is+sorted",
        "article_url": "https://takeuforward.org/?s=Check+if+the+array+is+sorted",
        "companies": [
          "Amazon",
          "Microsoft",
          "Meta"
        ]
      },
      {
        "id": "striver-q-42",
        "stepNumber": 3,
        "stepName": "Step 3: Solve Problems on Arrays [Easy -> Medium -> Hard]",
        "qno": 42,
        "title": "Remove duplicates from Sorted array",
        "difficulty": "Easy",
        "youtube_url": "https://youtu.be/37E9ckMDdTk?t=1887",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Remove+duplicates+from+Sorted+array",
        "article_url": "https://takeuforward.org/?s=Remove+duplicates+from+Sorted+array",
        "companies": [
          "Google",
          "Apple",
          "Uber"
        ]
      },
      {
        "id": "striver-q-43",
        "stepNumber": 3,
        "stepName": "Step 3: Solve Problems on Arrays [Easy -> Medium -> Hard]",
        "qno": 43,
        "title": "Left Rotate an array by one place",
        "difficulty": "Easy",
        "youtube_url": "https://youtu.be/wvcQg43_V8U?t=61",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Left+Rotate+an+array+by+one+place",
        "article_url": "https://takeuforward.org/?s=Left+Rotate+an+array+by+one+place",
        "companies": [
          "Microsoft",
          "Goldman Sachs",
          "Amazon"
        ]
      },
      {
        "id": "striver-q-44",
        "stepNumber": 3,
        "stepName": "Step 3: Solve Problems on Arrays [Easy -> Medium -> Hard]",
        "qno": 44,
        "title": "Left rotate an array by D places",
        "difficulty": "Easy",
        "youtube_url": "https://youtu.be/wvcQg43_V8U?t=485",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Left+rotate+an+array+by+D+places",
        "article_url": "https://takeuforward.org/?s=Left+rotate+an+array+by+D+places",
        "companies": [
          "Meta",
          "Google",
          "Bloomberg"
        ]
      },
      {
        "id": "striver-q-45",
        "stepNumber": 3,
        "stepName": "Step 3: Solve Problems on Arrays [Easy -> Medium -> Hard]",
        "qno": 45,
        "title": "Move Zeros to end",
        "difficulty": "Easy",
        "youtube_url": "https://youtu.be/wvcQg43_V8U?t=1633",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Move+Zeros+to+end",
        "article_url": "https://takeuforward.org/?s=Move+Zeros+to+end",
        "companies": [
          "Amazon",
          "Adobe",
          "Flipkart"
        ]
      },
      {
        "id": "striver-q-46",
        "stepNumber": 3,
        "stepName": "Step 3: Solve Problems on Arrays [Easy -> Medium -> Hard]",
        "qno": 46,
        "title": "Linear Search",
        "difficulty": "Easy",
        "youtube_url": "https://youtu.be/wvcQg43_V8U?t=2465",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Linear+Search",
        "article_url": "https://takeuforward.org/?s=Linear+Search",
        "companies": [
          "Google",
          "Microsoft",
          "Uber"
        ]
      },
      {
        "id": "striver-q-47",
        "stepNumber": 3,
        "stepName": "Step 3: Solve Problems on Arrays [Easy -> Medium -> Hard]",
        "qno": 47,
        "title": "Find the Union",
        "difficulty": "Easy",
        "youtube_url": "https://youtu.be/wvcQg43_V8U?t=2584",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Find+the+Union",
        "article_url": "https://takeuforward.org/?s=Find+the+Union",
        "companies": [
          "Apple",
          "Amazon",
          "Netflix"
        ]
      },
      {
        "id": "striver-q-48",
        "stepNumber": 3,
        "stepName": "Step 3: Solve Problems on Arrays [Easy -> Medium -> Hard]",
        "qno": 48,
        "title": "Find missing number in an array",
        "difficulty": "Easy",
        "youtube_url": "https://youtu.be/bYWLJb3vCWY?t=57",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Find+missing+number+in+an+array",
        "article_url": "https://takeuforward.org/?s=Find+missing+number+in+an+array",
        "companies": [
          "Google",
          "Amazon",
          "Microsoft"
        ]
      },
      {
        "id": "striver-q-49",
        "stepNumber": 3,
        "stepName": "Step 3: Solve Problems on Arrays [Easy -> Medium -> Hard]",
        "qno": 49,
        "title": "Maximum Consecutive Ones",
        "difficulty": "Easy",
        "youtube_url": "https://youtu.be/bYWLJb3vCWY?t=1124",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Maximum+Consecutive+Ones",
        "article_url": "https://takeuforward.org/?s=Maximum+Consecutive+Ones",
        "companies": [
          "Amazon",
          "Microsoft",
          "Meta"
        ]
      },
      {
        "id": "striver-q-50",
        "stepNumber": 3,
        "stepName": "Step 3: Solve Problems on Arrays [Easy -> Medium -> Hard]",
        "qno": 50,
        "title": "Find the number that appears once, and other numbers twice.",
        "difficulty": "Easy",
        "youtube_url": "https://youtu.be/bYWLJb3vCWY?t=1369",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Find+the+number+that+appears+once,+and+other+numbers+twice.",
        "article_url": "https://takeuforward.org/?s=Find+the+number+that+appears+once,+and+other+numbers+twice.",
        "companies": [
          "Google",
          "Apple",
          "Uber"
        ]
      },
      {
        "id": "striver-q-51",
        "stepNumber": 3,
        "stepName": "Step 3: Solve Problems on Arrays [Easy -> Medium -> Hard]",
        "qno": 51,
        "title": "Longest subarray with given sum K(positives)",
        "difficulty": "Medium",
        "youtube_url": "https://www.youtube.com/watch?v=frf7qxiN2qU&feature=youtu.be",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Longest+subarray+with+given+sum+K",
        "article_url": "https://takeuforward.org/?s=Longest+subarray+with+given+sum+K",
        "companies": [
          "Microsoft",
          "Goldman Sachs",
          "Amazon"
        ]
      },
      {
        "id": "striver-q-52",
        "stepNumber": 3,
        "stepName": "Step 3: Solve Problems on Arrays [Easy -> Medium -> Hard]",
        "qno": 52,
        "title": "Longest subarray with sum K (Positives + Negatives)",
        "difficulty": "Medium",
        "youtube_url": "https://www.youtube.com/watch?v=frf7qxiN2qU",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Longest+subarray+with+sum+K",
        "article_url": "https://takeuforward.org/?s=Longest+subarray+with+sum+K",
        "companies": [
          "Meta",
          "Google",
          "Bloomberg"
        ]
      },
      {
        "id": "striver-q-53",
        "stepNumber": 3,
        "stepName": "Step 3: Solve Problems on Arrays [Easy -> Medium -> Hard]",
        "qno": 53,
        "title": "2Sum Problem",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/UXDSeD9mN-k",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=2Sum+Problem",
        "article_url": "https://takeuforward.org/?s=2Sum+Problem",
        "companies": [
          "Amazon",
          "Adobe",
          "Flipkart"
        ]
      },
      {
        "id": "striver-q-54",
        "stepNumber": 3,
        "stepName": "Step 3: Solve Problems on Arrays [Easy -> Medium -> Hard]",
        "qno": 54,
        "title": "Sort an array of 0's 1's and 2's",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/tp8JIuCXBaU",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Sort+an+array+of+0's+1's+and+2's",
        "article_url": "https://takeuforward.org/?s=Sort+an+array+of+0's+1's+and+2's",
        "companies": [
          "Google",
          "Microsoft",
          "Uber"
        ]
      },
      {
        "id": "striver-q-55",
        "stepNumber": 3,
        "stepName": "Step 3: Solve Problems on Arrays [Easy -> Medium -> Hard]",
        "qno": 55,
        "title": "Majority Element (>n/2 times)",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/nP_ns3uSh80",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Majority+Element",
        "article_url": "https://takeuforward.org/?s=Majority+Element",
        "companies": [
          "Apple",
          "Amazon",
          "Netflix"
        ]
      },
      {
        "id": "striver-q-56",
        "stepNumber": 3,
        "stepName": "Step 3: Solve Problems on Arrays [Easy -> Medium -> Hard]",
        "qno": 56,
        "title": "Kadane's Algorithm, maximum subarray sum",
        "difficulty": "Medium",
        "youtube_url": "https://www.youtube.com/watch?v=w_KEocd__20&list=PLgUwDviBIf0rPG3Ictpu74YWBQ1CaBkm2&index=5",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Kadane's+Algorithm,+maximum+subarray+sum",
        "article_url": "https://takeuforward.org/?s=Kadane's+Algorithm,+maximum+subarray+sum",
        "companies": [
          "Google",
          "Amazon",
          "Microsoft"
        ]
      },
      {
        "id": "striver-q-57",
        "stepNumber": 3,
        "stepName": "Step 3: Solve Problems on Arrays [Easy -> Medium -> Hard]",
        "qno": 57,
        "title": "Print subarray with maximum subarray sum (extended version of above problem)",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/AHZpyENo7k4",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Print+subarray+with+maximum+subarray+sum",
        "article_url": "https://takeuforward.org/?s=Print+subarray+with+maximum+subarray+sum",
        "companies": [
          "Amazon",
          "Microsoft",
          "Meta"
        ]
      },
      {
        "id": "striver-q-58",
        "stepNumber": 3,
        "stepName": "Step 3: Solve Problems on Arrays [Easy -> Medium -> Hard]",
        "qno": 58,
        "title": "Stock Buy and Sell",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/excAOvwF_Wk",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Stock+Buy+and+Sell",
        "article_url": "https://takeuforward.org/?s=Stock+Buy+and+Sell",
        "companies": [
          "Google",
          "Apple",
          "Uber"
        ]
      },
      {
        "id": "striver-q-59",
        "stepNumber": 3,
        "stepName": "Step 3: Solve Problems on Arrays [Easy -> Medium -> Hard]",
        "qno": 59,
        "title": "Rearrange the array in alternating positive and negative items",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/h4aBagy4Uok",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Rearrange+the+array+in+alternating+positive+and+negative+items",
        "article_url": "https://takeuforward.org/?s=Rearrange+the+array+in+alternating+positive+and+negative+items",
        "companies": [
          "Microsoft",
          "Goldman Sachs",
          "Amazon"
        ]
      },
      {
        "id": "striver-q-60",
        "stepNumber": 3,
        "stepName": "Step 3: Solve Problems on Arrays [Easy -> Medium -> Hard]",
        "qno": 60,
        "title": "Next Permutation",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/JDOXKqF60RQ",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Next+Permutation",
        "article_url": "https://takeuforward.org/?s=Next+Permutation",
        "companies": [
          "Meta",
          "Google",
          "Bloomberg"
        ]
      },
      {
        "id": "striver-q-61",
        "stepNumber": 3,
        "stepName": "Step 3: Solve Problems on Arrays [Easy -> Medium -> Hard]",
        "qno": 61,
        "title": "Leaders in an Array problem",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/cHrH9CQ8pmY",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Leaders+in+an+Array+problem",
        "article_url": "https://takeuforward.org/?s=Leaders+in+an+Array+problem",
        "companies": [
          "Amazon",
          "Adobe",
          "Flipkart"
        ]
      },
      {
        "id": "striver-q-62",
        "stepNumber": 3,
        "stepName": "Step 3: Solve Problems on Arrays [Easy -> Medium -> Hard]",
        "qno": 62,
        "title": "Longest Consecutive Sequence in an Array",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/oO5uLE7EUlM",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Longest+Consecutive+Sequence+in+an+Array",
        "article_url": "https://takeuforward.org/?s=Longest+Consecutive+Sequence+in+an+Array",
        "companies": [
          "Google",
          "Microsoft",
          "Uber"
        ]
      },
      {
        "id": "striver-q-63",
        "stepNumber": 3,
        "stepName": "Step 3: Solve Problems on Arrays [Easy -> Medium -> Hard]",
        "qno": 63,
        "title": "Set Matrix Zeros",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/N0MgLvceX7M",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Set+Matrix+Zeros",
        "article_url": "https://takeuforward.org/?s=Set+Matrix+Zeros",
        "companies": [
          "Apple",
          "Amazon",
          "Netflix"
        ]
      },
      {
        "id": "striver-q-64",
        "stepNumber": 3,
        "stepName": "Step 3: Solve Problems on Arrays [Easy -> Medium -> Hard]",
        "qno": 64,
        "title": "Rotate Matrix by 90 degrees",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/Z0R2u6gd3GU",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Rotate+Matrix+by+90+degrees",
        "article_url": "https://takeuforward.org/?s=Rotate+Matrix+by+90+degrees",
        "companies": [
          "Google",
          "Amazon",
          "Microsoft"
        ]
      },
      {
        "id": "striver-q-65",
        "stepNumber": 3,
        "stepName": "Step 3: Solve Problems on Arrays [Easy -> Medium -> Hard]",
        "qno": 65,
        "title": "Print the matrix in spiral manner",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/3Zv-s9UUrFM",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Print+the+matrix+in+spiral+manner",
        "article_url": "https://takeuforward.org/?s=Print+the+matrix+in+spiral+manner",
        "companies": [
          "Amazon",
          "Microsoft",
          "Meta"
        ]
      },
      {
        "id": "striver-q-66",
        "stepNumber": 3,
        "stepName": "Step 3: Solve Problems on Arrays [Easy -> Medium -> Hard]",
        "qno": 66,
        "title": "Count subarrays with given sum",
        "difficulty": "Medium",
        "youtube_url": "https://www.youtube.com/watch?v=xvNwoz-ufXA&list=PLgUwDviBIf0oF6QL8m22w1hIDC1vJ_BHz&index=32",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Count+subarrays+with+given+sum",
        "article_url": "https://takeuforward.org/?s=Count+subarrays+with+given+sum",
        "companies": [
          "Google",
          "Apple",
          "Uber"
        ]
      },
      {
        "id": "striver-q-67",
        "stepNumber": 3,
        "stepName": "Step 3: Solve Problems on Arrays [Easy -> Medium -> Hard]",
        "qno": 67,
        "title": "Pascal's Triangle",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/bR7mQgwQ_o8",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Pascal's+Triangle",
        "article_url": "https://takeuforward.org/?s=Pascal's+Triangle",
        "companies": [
          "Microsoft",
          "Goldman Sachs",
          "Amazon"
        ]
      },
      {
        "id": "striver-q-68",
        "stepNumber": 3,
        "stepName": "Step 3: Solve Problems on Arrays [Easy -> Medium -> Hard]",
        "qno": 68,
        "title": "Majority Element (n/3 times)",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/vwZj1K0e9U8",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Majority+Element",
        "article_url": "https://takeuforward.org/?s=Majority+Element",
        "companies": [
          "Meta",
          "Google",
          "Bloomberg"
        ]
      },
      {
        "id": "striver-q-69",
        "stepNumber": 3,
        "stepName": "Step 3: Solve Problems on Arrays [Easy -> Medium -> Hard]",
        "qno": 69,
        "title": "3-Sum Problem",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/DhFh8Kw7ymk",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=3-Sum+Problem",
        "article_url": "https://takeuforward.org/?s=3-Sum+Problem",
        "companies": [
          "Amazon",
          "Adobe",
          "Flipkart"
        ]
      },
      {
        "id": "striver-q-70",
        "stepNumber": 3,
        "stepName": "Step 3: Solve Problems on Arrays [Easy -> Medium -> Hard]",
        "qno": 70,
        "title": "4-Sum Problem",
        "difficulty": "Hard",
        "youtube_url": "https://youtu.be/eD95WRfh81c",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=4-Sum+Problem",
        "article_url": "https://takeuforward.org/?s=4-Sum+Problem",
        "companies": [
          "Google",
          "Microsoft",
          "Uber"
        ]
      },
      {
        "id": "striver-q-71",
        "stepNumber": 3,
        "stepName": "Step 3: Solve Problems on Arrays [Easy -> Medium -> Hard]",
        "qno": 71,
        "title": "Largest Subarray with 0 Sum",
        "difficulty": "Hard",
        "youtube_url": "https://www.youtube.com/watch?v=xmguZ6GbatA&list=PLgUwDviBIf0p4ozDR_kJJkONnb1wdx2Ma&index=23",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Largest+Subarray+with+0+Sum",
        "article_url": "https://takeuforward.org/?s=Largest+Subarray+with+0+Sum",
        "companies": [
          "Apple",
          "Amazon",
          "Netflix"
        ]
      },
      {
        "id": "striver-q-72",
        "stepNumber": 3,
        "stepName": "Step 3: Solve Problems on Arrays [Easy -> Medium -> Hard]",
        "qno": 72,
        "title": "Count number of subarrays with given xor K",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/eZr-6p0B7ME",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Count+number+of+subarrays+with+given+xor+K",
        "article_url": "https://takeuforward.org/?s=Count+number+of+subarrays+with+given+xor+K",
        "companies": [
          "Google",
          "Amazon",
          "Microsoft"
        ]
      },
      {
        "id": "striver-q-73",
        "stepNumber": 3,
        "stepName": "Step 3: Solve Problems on Arrays [Easy -> Medium -> Hard]",
        "qno": 73,
        "title": "Merge Overlapping Subintervals",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/IexN60k62jo",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Merge+Overlapping+Subintervals",
        "article_url": "https://takeuforward.org/?s=Merge+Overlapping+Subintervals",
        "companies": [
          "Amazon",
          "Microsoft",
          "Meta"
        ]
      },
      {
        "id": "striver-q-74",
        "stepNumber": 3,
        "stepName": "Step 3: Solve Problems on Arrays [Easy -> Medium -> Hard]",
        "qno": 74,
        "title": "Merge two sorted arrays without extra space",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/n7uwj04E0I4",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Merge+two+sorted+arrays+without+extra+space",
        "article_url": "https://takeuforward.org/?s=Merge+two+sorted+arrays+without+extra+space",
        "companies": [
          "Google",
          "Apple",
          "Uber"
        ]
      },
      {
        "id": "striver-q-75",
        "stepNumber": 3,
        "stepName": "Step 3: Solve Problems on Arrays [Easy -> Medium -> Hard]",
        "qno": 75,
        "title": "Find the repeating and missing number",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/2D0D8HE6uak",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Find+the+repeating+and+missing+number",
        "article_url": "https://takeuforward.org/?s=Find+the+repeating+and+missing+number",
        "companies": [
          "Microsoft",
          "Goldman Sachs",
          "Amazon"
        ]
      },
      {
        "id": "striver-q-76",
        "stepNumber": 3,
        "stepName": "Step 3: Solve Problems on Arrays [Easy -> Medium -> Hard]",
        "qno": 76,
        "title": "Count Inversions",
        "difficulty": "Hard",
        "youtube_url": "https://youtu.be/AseUmwVNaoY",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Count+Inversions",
        "article_url": "https://takeuforward.org/?s=Count+Inversions",
        "companies": [
          "Meta",
          "Google",
          "Bloomberg"
        ]
      },
      {
        "id": "striver-q-77",
        "stepNumber": 3,
        "stepName": "Step 3: Solve Problems on Arrays [Easy -> Medium -> Hard]",
        "qno": 77,
        "title": "Reverse Pairs",
        "difficulty": "Hard",
        "youtube_url": "https://youtu.be/0e4bZaP3MDI",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Reverse+Pairs",
        "article_url": "https://takeuforward.org/?s=Reverse+Pairs",
        "companies": [
          "Amazon",
          "Adobe",
          "Flipkart"
        ]
      },
      {
        "id": "striver-q-78",
        "stepNumber": 3,
        "stepName": "Step 3: Solve Problems on Arrays [Easy -> Medium -> Hard]",
        "qno": 78,
        "title": "Maximum Product Subarray",
        "difficulty": "Hard",
        "youtube_url": "https://youtu.be/hnswaLJvr6g",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Maximum+Product+Subarray",
        "article_url": "https://takeuforward.org/?s=Maximum+Product+Subarray",
        "companies": [
          "Google",
          "Microsoft",
          "Uber"
        ]
      }
    ]
  },
  {
    "id": "step-4",
    "stepNumber": 4,
    "title": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
    "stepRange": "Q79 - Q110",
    "description": "32 curated problems covering Binary Search [1D, 2D Arrays, Search Space]",
    "problems": [
      {
        "id": "striver-q-79",
        "stepNumber": 4,
        "stepName": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
        "qno": 79,
        "title": "Binary Search to find X in sorted array",
        "difficulty": "Easy",
        "youtube_url": "https://youtu.be/MHf6awe89xw",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Binary+Search+to+find+X+in+sorted+array",
        "article_url": "https://takeuforward.org/?s=Binary+Search+to+find+X+in+sorted+array",
        "companies": [
          "Apple",
          "Amazon",
          "Netflix"
        ]
      },
      {
        "id": "striver-q-80",
        "stepNumber": 4,
        "stepName": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
        "qno": 80,
        "title": "Implement Lower Bound",
        "difficulty": "Easy",
        "youtube_url": "https://youtu.be/6zhGS79oQ4k",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Implement+Lower+Bound",
        "article_url": "https://takeuforward.org/?s=Implement+Lower+Bound",
        "companies": [
          "Google",
          "Amazon",
          "Microsoft"
        ]
      },
      {
        "id": "striver-q-81",
        "stepNumber": 4,
        "stepName": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
        "qno": 81,
        "title": "Implement Upper Bound",
        "difficulty": "Easy",
        "youtube_url": "https://youtu.be/6zhGS79oQ4k",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Implement+Upper+Bound",
        "article_url": "https://takeuforward.org/?s=Implement+Upper+Bound",
        "companies": [
          "Amazon",
          "Microsoft",
          "Meta"
        ]
      },
      {
        "id": "striver-q-82",
        "stepNumber": 4,
        "stepName": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
        "qno": 82,
        "title": "Search Insert Position",
        "difficulty": "Easy",
        "youtube_url": "https://youtu.be/6zhGS79oQ4k",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Search+Insert+Position",
        "article_url": "https://takeuforward.org/?s=Search+Insert+Position",
        "companies": [
          "Google",
          "Apple",
          "Uber"
        ]
      },
      {
        "id": "striver-q-83",
        "stepNumber": 4,
        "stepName": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
        "qno": 83,
        "title": "Floor/Ceil in Sorted Array",
        "difficulty": "Easy",
        "youtube_url": "https://www.youtube.com/watch?v=6zhGS79oQ4k&list=PLgUwDviBIf0pMFMWuuvDNMAkoQFi-h0ZF&index=3",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Floor/Ceil+in+Sorted+Array",
        "article_url": "https://takeuforward.org/?s=Floor/Ceil+in+Sorted+Array",
        "companies": [
          "Microsoft",
          "Goldman Sachs",
          "Amazon"
        ]
      },
      {
        "id": "striver-q-84",
        "stepNumber": 4,
        "stepName": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
        "qno": 84,
        "title": "Find the first or last occurrence of a given number in a sorted array",
        "difficulty": "Easy",
        "youtube_url": "https://youtu.be/hjR1IYVx9lY",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Find+the+first+or+last+occurrence+of+a+given+number+in+a+sorted+array",
        "article_url": "https://takeuforward.org/?s=Find+the+first+or+last+occurrence+of+a+given+number+in+a+sorted+array",
        "companies": [
          "Meta",
          "Google",
          "Bloomberg"
        ]
      },
      {
        "id": "striver-q-85",
        "stepNumber": 4,
        "stepName": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
        "qno": 85,
        "title": "Count occurrences of a number in a sorted array with duplicates",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/hjR1IYVx9lY",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Count+occurrences+of+a+number+in+a+sorted+array+with+duplicates",
        "article_url": "https://takeuforward.org/?s=Count+occurrences+of+a+number+in+a+sorted+array+with+duplicates",
        "companies": [
          "Amazon",
          "Adobe",
          "Flipkart"
        ]
      },
      {
        "id": "striver-q-86",
        "stepNumber": 4,
        "stepName": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
        "qno": 86,
        "title": "Search in Rotated Sorted Array I",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/5qGrJbHhqFs",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Search+in+Rotated+Sorted+Array+I",
        "article_url": "https://takeuforward.org/?s=Search+in+Rotated+Sorted+Array+I",
        "companies": [
          "Google",
          "Microsoft",
          "Uber"
        ]
      },
      {
        "id": "striver-q-87",
        "stepNumber": 4,
        "stepName": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
        "qno": 87,
        "title": "Search in Rotated Sorted Array II",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/w2G2W8l__pc",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Search+in+Rotated+Sorted+Array+II",
        "article_url": "https://takeuforward.org/?s=Search+in+Rotated+Sorted+Array+II",
        "companies": [
          "Apple",
          "Amazon",
          "Netflix"
        ]
      },
      {
        "id": "striver-q-88",
        "stepNumber": 4,
        "stepName": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
        "qno": 88,
        "title": "Find minimum in Rotated Sorted Array",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/nhEMDKMB44g",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Find+minimum+in+Rotated+Sorted+Array",
        "article_url": "https://takeuforward.org/?s=Find+minimum+in+Rotated+Sorted+Array",
        "companies": [
          "Google",
          "Amazon",
          "Microsoft"
        ]
      },
      {
        "id": "striver-q-89",
        "stepNumber": 4,
        "stepName": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
        "qno": 89,
        "title": "Find out how many times has an array been rotated",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/jtSiWTPLwd0",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Find+out+how+many+times+has+an+array+been+rotated",
        "article_url": "https://takeuforward.org/?s=Find+out+how+many+times+has+an+array+been+rotated",
        "companies": [
          "Amazon",
          "Microsoft",
          "Meta"
        ]
      },
      {
        "id": "striver-q-90",
        "stepNumber": 4,
        "stepName": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
        "qno": 90,
        "title": "Single element in a Sorted Array",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/AZOmHuHadxQ",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Single+element+in+a+Sorted+Array",
        "article_url": "https://takeuforward.org/?s=Single+element+in+a+Sorted+Array",
        "companies": [
          "Google",
          "Apple",
          "Uber"
        ]
      },
      {
        "id": "striver-q-91",
        "stepNumber": 4,
        "stepName": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
        "qno": 91,
        "title": "Find peak element",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/cXxmbemS6XM",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Find+peak+element",
        "article_url": "https://takeuforward.org/?s=Find+peak+element",
        "companies": [
          "Microsoft",
          "Goldman Sachs",
          "Amazon"
        ]
      },
      {
        "id": "striver-q-92",
        "stepNumber": 4,
        "stepName": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
        "qno": 92,
        "title": "Find square root of a number in log n",
        "difficulty": "Easy",
        "youtube_url": "https://youtu.be/Bsv3FPUX_BA",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Find+square+root+of+a+number+in+log+n",
        "article_url": "https://takeuforward.org/?s=Find+square+root+of+a+number+in+log+n",
        "companies": [
          "Meta",
          "Google",
          "Bloomberg"
        ]
      },
      {
        "id": "striver-q-93",
        "stepNumber": 4,
        "stepName": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
        "qno": 93,
        "title": "Find the Nth root of a number using binary search",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/rjEJeYCasHs",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Find+the+Nth+root+of+a+number+using+binary+search",
        "article_url": "https://takeuforward.org/?s=Find+the+Nth+root+of+a+number+using+binary+search",
        "companies": [
          "Amazon",
          "Adobe",
          "Flipkart"
        ]
      },
      {
        "id": "striver-q-94",
        "stepNumber": 4,
        "stepName": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
        "qno": 94,
        "title": "Koko Eating Bananas",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/qyfekrNni90",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Koko+Eating+Bananas",
        "article_url": "https://takeuforward.org/?s=Koko+Eating+Bananas",
        "companies": [
          "Google",
          "Microsoft",
          "Uber"
        ]
      },
      {
        "id": "striver-q-95",
        "stepNumber": 4,
        "stepName": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
        "qno": 95,
        "title": "Minimum days to make M bouquets",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/TXAuxeYBTdg",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Minimum+days+to+make+M+bouquets",
        "article_url": "https://takeuforward.org/?s=Minimum+days+to+make+M+bouquets",
        "companies": [
          "Apple",
          "Amazon",
          "Netflix"
        ]
      },
      {
        "id": "striver-q-96",
        "stepNumber": 4,
        "stepName": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
        "qno": 96,
        "title": "Find the smallest Divisor",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/UvBKTVaG6U8",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Find+the+smallest+Divisor",
        "article_url": "https://takeuforward.org/?s=Find+the+smallest+Divisor",
        "companies": [
          "Google",
          "Amazon",
          "Microsoft"
        ]
      },
      {
        "id": "striver-q-97",
        "stepNumber": 4,
        "stepName": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
        "qno": 97,
        "title": "Capacity to Ship Packages within D Days",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/MG-Ac4TAvTY",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Capacity+to+Ship+Packages+within+D+Days",
        "article_url": "https://takeuforward.org/?s=Capacity+to+Ship+Packages+within+D+Days",
        "companies": [
          "Amazon",
          "Microsoft",
          "Meta"
        ]
      },
      {
        "id": "striver-q-98",
        "stepNumber": 4,
        "stepName": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
        "qno": 98,
        "title": "Kth Missing Positive Number",
        "difficulty": "Hard",
        "youtube_url": "https://youtu.be/uZ0N_hZpyps",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Kth+Missing+Positive+Number",
        "article_url": "https://takeuforward.org/?s=Kth+Missing+Positive+Number",
        "companies": [
          "Google",
          "Apple",
          "Uber"
        ]
      },
      {
        "id": "striver-q-99",
        "stepNumber": 4,
        "stepName": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
        "qno": 99,
        "title": "Aggressive Cows",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/R_Mfw4ew-Vo",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Aggressive+Cows",
        "article_url": "https://takeuforward.org/?s=Aggressive+Cows",
        "companies": [
          "Microsoft",
          "Goldman Sachs",
          "Amazon"
        ]
      },
      {
        "id": "striver-q-100",
        "stepNumber": 4,
        "stepName": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
        "qno": 100,
        "title": "Book Allocation Problem",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/Z0hwjftStI4",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Book+Allocation+Problem",
        "article_url": "https://takeuforward.org/?s=Book+Allocation+Problem",
        "companies": [
          "Meta",
          "Google",
          "Bloomberg"
        ]
      },
      {
        "id": "striver-q-101",
        "stepNumber": 4,
        "stepName": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
        "qno": 101,
        "title": "Split array - Largest Sum",
        "difficulty": "Medium",
        "youtube_url": "https://www.youtube.com/watch?v=thUd_WJn6wk&list=PLgUwDviBIf0pMFMWuuvDNMAkoQFi-h0ZF&index=20",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Split+array+-+Largest+Sum",
        "article_url": "https://takeuforward.org/?s=Split+array+-+Largest+Sum",
        "companies": [
          "Amazon",
          "Adobe",
          "Flipkart"
        ]
      },
      {
        "id": "striver-q-102",
        "stepNumber": 4,
        "stepName": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
        "qno": 102,
        "title": "Painter's partition",
        "difficulty": "Hard",
        "youtube_url": "https://www.youtube.com/watch?v=thUd_WJn6wk&list=PLgUwDviBIf0pMFMWuuvDNMAkoQFi-h0ZF&index=20",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Painter's+partition",
        "article_url": "https://takeuforward.org/?s=Painter's+partition",
        "companies": [
          "Google",
          "Microsoft",
          "Uber"
        ]
      },
      {
        "id": "striver-q-103",
        "stepNumber": 4,
        "stepName": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
        "qno": 103,
        "title": "Minimize Max Distance to Gas Station",
        "difficulty": "Hard",
        "youtube_url": "https://www.youtube.com/watch?v=kMSBvlZ-_HA&list=PLgUwDviBIf0pMFMWuuvDNMAkoQFi-h0ZF&index=21",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Minimize+Max+Distance+to+Gas+Station",
        "article_url": "https://takeuforward.org/?s=Minimize+Max+Distance+to+Gas+Station",
        "companies": [
          "Apple",
          "Amazon",
          "Netflix"
        ]
      },
      {
        "id": "striver-q-104",
        "stepNumber": 4,
        "stepName": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
        "qno": 104,
        "title": "Median of 2 sorted arrays",
        "difficulty": "Hard",
        "youtube_url": "https://youtu.be/C2rRzz-JDk8",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Median+of+2+sorted+arrays",
        "article_url": "https://takeuforward.org/?s=Median+of+2+sorted+arrays",
        "companies": [
          "Google",
          "Amazon",
          "Microsoft"
        ]
      },
      {
        "id": "striver-q-105",
        "stepNumber": 4,
        "stepName": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
        "qno": 105,
        "title": "Kth element of 2 sorted arrays",
        "difficulty": "Hard",
        "youtube_url": "https://youtu.be/D1oDwWCq50g",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Kth+element+of+2+sorted+arrays",
        "article_url": "https://takeuforward.org/?s=Kth+element+of+2+sorted+arrays",
        "companies": [
          "Amazon",
          "Microsoft",
          "Meta"
        ]
      },
      {
        "id": "striver-q-106",
        "stepNumber": 4,
        "stepName": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
        "qno": 106,
        "title": "Find the row with maximum number of 1's",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/SCz-1TtYxDI",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Find+the+row+with+maximum+number+of+1's",
        "article_url": "https://takeuforward.org/?s=Find+the+row+with+maximum+number+of+1's",
        "companies": [
          "Google",
          "Apple",
          "Uber"
        ]
      },
      {
        "id": "striver-q-107",
        "stepNumber": 4,
        "stepName": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
        "qno": 107,
        "title": "Search in a 2 D matrix",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/JXU4Akft7yk",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Search+in+a+2+D+matrix",
        "article_url": "https://takeuforward.org/?s=Search+in+a+2+D+matrix",
        "companies": [
          "Microsoft",
          "Goldman Sachs",
          "Amazon"
        ]
      },
      {
        "id": "striver-q-108",
        "stepNumber": 4,
        "stepName": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
        "qno": 108,
        "title": "Search in a row and column wise sorted matrix",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/9ZbB397jU4k",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Search+in+a+row+and+column+wise+sorted+matrix",
        "article_url": "https://takeuforward.org/?s=Search+in+a+row+and+column+wise+sorted+matrix",
        "companies": [
          "Meta",
          "Google",
          "Bloomberg"
        ]
      },
      {
        "id": "striver-q-109",
        "stepNumber": 4,
        "stepName": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
        "qno": 109,
        "title": "Find Peak Element (2D Matrix)",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/nGGp5XBzC4g?si=WCop5C6Azj5gAELH",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Find+Peak+Element",
        "article_url": "https://takeuforward.org/?s=Find+Peak+Element",
        "companies": [
          "Amazon",
          "Adobe",
          "Flipkart"
        ]
      },
      {
        "id": "striver-q-110",
        "stepNumber": 4,
        "stepName": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
        "qno": 110,
        "title": "Matrix Median",
        "difficulty": "Hard",
        "youtube_url": "https://youtu.be/Q9wXgdxJq48?si=ScI_0uzJh7yg8nrX",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Matrix+Median",
        "article_url": "https://takeuforward.org/?s=Matrix+Median",
        "companies": [
          "Google",
          "Microsoft",
          "Uber"
        ]
      }
    ]
  },
  {
    "id": "step-5",
    "stepNumber": 5,
    "title": "Step 5: Strings [Basic and Medium]",
    "stepRange": "Q111 - Q125",
    "description": "15 curated problems covering Strings [Basic and Medium]",
    "problems": [
      {
        "id": "striver-q-111",
        "stepNumber": 5,
        "stepName": "Step 5: Strings [Basic and Medium]",
        "qno": 111,
        "title": "Remove outermost Paranthesis",
        "difficulty": "Easy",
        "youtube_url": null,
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Remove+outermost+Paranthesis",
        "article_url": "https://takeuforward.org/?s=Remove+outermost+Paranthesis",
        "companies": [
          "Apple",
          "Amazon",
          "Netflix"
        ]
      },
      {
        "id": "striver-q-112",
        "stepNumber": 5,
        "stepName": "Step 5: Strings [Basic and Medium]",
        "qno": 112,
        "title": "Reverse words in a given string / Palindrome Check",
        "difficulty": "Easy",
        "youtube_url": null,
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Reverse+words+in+a+given+string+/+Palindrome+Check",
        "article_url": "https://takeuforward.org/?s=Reverse+words+in+a+given+string+/+Palindrome+Check",
        "companies": [
          "Google",
          "Amazon",
          "Microsoft"
        ]
      },
      {
        "id": "striver-q-113",
        "stepNumber": 5,
        "stepName": "Step 5: Strings [Basic and Medium]",
        "qno": 113,
        "title": "Largest odd number in a string",
        "difficulty": "Easy",
        "youtube_url": null,
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Largest+odd+number+in+a+string",
        "article_url": "https://takeuforward.org/?s=Largest+odd+number+in+a+string",
        "companies": [
          "Amazon",
          "Microsoft",
          "Meta"
        ]
      },
      {
        "id": "striver-q-114",
        "stepNumber": 5,
        "stepName": "Step 5: Strings [Basic and Medium]",
        "qno": 114,
        "title": "Longest Common Prefix",
        "difficulty": "Easy",
        "youtube_url": null,
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Longest+Common+Prefix",
        "article_url": "https://takeuforward.org/?s=Longest+Common+Prefix",
        "companies": [
          "Google",
          "Apple",
          "Uber"
        ]
      },
      {
        "id": "striver-q-115",
        "stepNumber": 5,
        "stepName": "Step 5: Strings [Basic and Medium]",
        "qno": 115,
        "title": "Isomorphic String",
        "difficulty": "Easy",
        "youtube_url": null,
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Isomorphic+String",
        "article_url": "https://takeuforward.org/?s=Isomorphic+String",
        "companies": [
          "Microsoft",
          "Goldman Sachs",
          "Amazon"
        ]
      },
      {
        "id": "striver-q-116",
        "stepNumber": 5,
        "stepName": "Step 5: Strings [Basic and Medium]",
        "qno": 116,
        "title": "check whether one string is a rotation of another",
        "difficulty": "Easy",
        "youtube_url": null,
        "leetcode_url": "https://leetcode.com/problemset/all/?search=check+whether+one+string+is+a+rotation+of+another",
        "article_url": "https://takeuforward.org/?s=check+whether+one+string+is+a+rotation+of+another",
        "companies": [
          "Meta",
          "Google",
          "Bloomberg"
        ]
      },
      {
        "id": "striver-q-117",
        "stepNumber": 5,
        "stepName": "Step 5: Strings [Basic and Medium]",
        "qno": 117,
        "title": "Check if two strings are anagram of each other",
        "difficulty": "Easy",
        "youtube_url": null,
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Check+if+two+strings+are+anagram+of+each+other",
        "article_url": "https://takeuforward.org/?s=Check+if+two+strings+are+anagram+of+each+other",
        "companies": [
          "Amazon",
          "Adobe",
          "Flipkart"
        ]
      },
      {
        "id": "striver-q-118",
        "stepNumber": 5,
        "stepName": "Step 5: Strings [Basic and Medium]",
        "qno": 118,
        "title": "Sort Characters by frequency",
        "difficulty": "Medium",
        "youtube_url": null,
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Sort+Characters+by+frequency",
        "article_url": "https://takeuforward.org/?s=Sort+Characters+by+frequency",
        "companies": [
          "Google",
          "Microsoft",
          "Uber"
        ]
      },
      {
        "id": "striver-q-119",
        "stepNumber": 5,
        "stepName": "Step 5: Strings [Basic and Medium]",
        "qno": 119,
        "title": "Maximum Nesting Depth of Paranthesis",
        "difficulty": "Easy",
        "youtube_url": null,
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Maximum+Nesting+Depth+of+Paranthesis",
        "article_url": "https://takeuforward.org/?s=Maximum+Nesting+Depth+of+Paranthesis",
        "companies": [
          "Apple",
          "Amazon",
          "Netflix"
        ]
      },
      {
        "id": "striver-q-120",
        "stepNumber": 5,
        "stepName": "Step 5: Strings [Basic and Medium]",
        "qno": 120,
        "title": "Roman Number to Integer and vice versa",
        "difficulty": "Easy",
        "youtube_url": null,
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Roman+Number+to+Integer+and+vice+versa",
        "article_url": "https://takeuforward.org/?s=Roman+Number+to+Integer+and+vice+versa",
        "companies": [
          "Google",
          "Amazon",
          "Microsoft"
        ]
      },
      {
        "id": "striver-q-121",
        "stepNumber": 5,
        "stepName": "Step 5: Strings [Basic and Medium]",
        "qno": 121,
        "title": "Implement Atoi",
        "difficulty": "Easy",
        "youtube_url": null,
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Implement+Atoi",
        "article_url": "https://takeuforward.org/?s=Implement+Atoi",
        "companies": [
          "Amazon",
          "Microsoft",
          "Meta"
        ]
      },
      {
        "id": "striver-q-122",
        "stepNumber": 5,
        "stepName": "Step 5: Strings [Basic and Medium]",
        "qno": 122,
        "title": "Count Number of Substrings",
        "difficulty": "Medium",
        "youtube_url": null,
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Count+Number+of+Substrings",
        "article_url": "https://takeuforward.org/?s=Count+Number+of+Substrings",
        "companies": [
          "Google",
          "Apple",
          "Uber"
        ]
      },
      {
        "id": "striver-q-123",
        "stepNumber": 5,
        "stepName": "Step 5: Strings [Basic and Medium]",
        "qno": 123,
        "title": "Longest Palindromic Substring[Do it without DP]",
        "difficulty": "Medium",
        "youtube_url": null,
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Longest+Palindromic+Substring",
        "article_url": "https://takeuforward.org/?s=Longest+Palindromic+Substring",
        "companies": [
          "Microsoft",
          "Goldman Sachs",
          "Amazon"
        ]
      },
      {
        "id": "striver-q-124",
        "stepNumber": 5,
        "stepName": "Step 5: Strings [Basic and Medium]",
        "qno": 124,
        "title": "Sum of Beauty of all substring",
        "difficulty": "Medium",
        "youtube_url": null,
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Sum+of+Beauty+of+all+substring",
        "article_url": "https://takeuforward.org/?s=Sum+of+Beauty+of+all+substring",
        "companies": [
          "Meta",
          "Google",
          "Bloomberg"
        ]
      },
      {
        "id": "striver-q-125",
        "stepNumber": 5,
        "stepName": "Step 5: Strings [Basic and Medium]",
        "qno": 125,
        "title": "Reverse Every Word in A String",
        "difficulty": "Medium",
        "youtube_url": null,
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Reverse+Every+Word+in+A+String",
        "article_url": "https://takeuforward.org/?s=Reverse+Every+Word+in+A+String",
        "companies": [
          "Amazon",
          "Adobe",
          "Flipkart"
        ]
      }
    ]
  },
  {
    "id": "step-6",
    "stepNumber": 6,
    "title": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
    "stepRange": "Q126 - Q156",
    "description": "31 curated problems covering Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
    "problems": [
      {
        "id": "striver-q-126",
        "stepNumber": 6,
        "stepName": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
        "qno": 126,
        "title": "Introduction to LinkedList, learn about struct, and how is node represented",
        "difficulty": "Easy",
        "youtube_url": "https://youtu.be/Nq7ok-OyEpg?si=9PR1o8OPRWil7fRA",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Introduction+to+LinkedList,+learn+about+struct,+and+how+is+node+represented",
        "article_url": "https://takeuforward.org/?s=Introduction+to+LinkedList,+learn+about+struct,+and+how+is+node+represented",
        "companies": [
          "Google",
          "Microsoft",
          "Uber"
        ]
      },
      {
        "id": "striver-q-127",
        "stepNumber": 6,
        "stepName": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
        "qno": 127,
        "title": "Inserting a node in LinkedList",
        "difficulty": "Easy",
        "youtube_url": "https://youtu.be/VaECK03Dz-g?si=vHSwdf9jhE05adKM&t=1934",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Inserting+a+node+in+LinkedList",
        "article_url": "https://takeuforward.org/?s=Inserting+a+node+in+LinkedList",
        "companies": [
          "Apple",
          "Amazon",
          "Netflix"
        ]
      },
      {
        "id": "striver-q-128",
        "stepNumber": 6,
        "stepName": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
        "qno": 128,
        "title": "Deleting a node in LinkedList",
        "difficulty": "Easy",
        "youtube_url": "https://youtu.be/VaECK03Dz-g?si=CRaBHbOo2bHFbOT5",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Deleting+a+node+in+LinkedList",
        "article_url": "https://takeuforward.org/?s=Deleting+a+node+in+LinkedList",
        "companies": [
          "Google",
          "Amazon",
          "Microsoft"
        ]
      },
      {
        "id": "striver-q-129",
        "stepNumber": 6,
        "stepName": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
        "qno": 129,
        "title": "Find the length of the linkedlist [learn traversal]",
        "difficulty": "Easy",
        "youtube_url": "https://youtu.be/Nq7ok-OyEpg?si=xqQbukLfo2oZ6C6s&t=2240",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Find+the+length+of+the+linkedlist",
        "article_url": "https://takeuforward.org/?s=Find+the+length+of+the+linkedlist",
        "companies": [
          "Amazon",
          "Microsoft",
          "Meta"
        ]
      },
      {
        "id": "striver-q-130",
        "stepNumber": 6,
        "stepName": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
        "qno": 130,
        "title": "Search an element in the LL",
        "difficulty": "Easy",
        "youtube_url": "https://youtu.be/Nq7ok-OyEpg?si=WNXcIaXZ_B6cNq0s&t=2524",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Search+an+element+in+the+LL",
        "article_url": "https://takeuforward.org/?s=Search+an+element+in+the+LL",
        "companies": [
          "Google",
          "Apple",
          "Uber"
        ]
      },
      {
        "id": "striver-q-131",
        "stepNumber": 6,
        "stepName": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
        "qno": 131,
        "title": "Introduction to DLL, learn about struct, and how is node represented",
        "difficulty": "Easy",
        "youtube_url": "https://youtu.be/0eKMU10uEDI?si=uDnoj_C5ghEpNLvP",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Introduction+to+DLL,+learn+about+struct,+and+how+is+node+represented",
        "article_url": "https://takeuforward.org/?s=Introduction+to+DLL,+learn+about+struct,+and+how+is+node+represented",
        "companies": [
          "Microsoft",
          "Goldman Sachs",
          "Amazon"
        ]
      },
      {
        "id": "striver-q-132",
        "stepNumber": 6,
        "stepName": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
        "qno": 132,
        "title": "Insert a node in DLL",
        "difficulty": "Easy",
        "youtube_url": "https://youtu.be/0eKMU10uEDI?si=J5a0pQTosimcO_aA&t=2684",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Insert+a+node+in+DLL",
        "article_url": "https://takeuforward.org/?s=Insert+a+node+in+DLL",
        "companies": [
          "Meta",
          "Google",
          "Bloomberg"
        ]
      },
      {
        "id": "striver-q-133",
        "stepNumber": 6,
        "stepName": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
        "qno": 133,
        "title": "Delete a node in DLL",
        "difficulty": "Easy",
        "youtube_url": "https://youtu.be/0eKMU10uEDI?si=sE7jqrW46lfRHVLd&t=853",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Delete+a+node+in+DLL",
        "article_url": "https://takeuforward.org/?s=Delete+a+node+in+DLL",
        "companies": [
          "Amazon",
          "Adobe",
          "Flipkart"
        ]
      },
      {
        "id": "striver-q-134",
        "stepNumber": 6,
        "stepName": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
        "qno": 134,
        "title": "Reverse a DLL",
        "difficulty": "Easy",
        "youtube_url": "https://youtu.be/u3WUW2qe6ww?si=96Wwlju72IvmzkxE",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Reverse+a+DLL",
        "article_url": "https://takeuforward.org/?s=Reverse+a+DLL",
        "companies": [
          "Google",
          "Microsoft",
          "Uber"
        ]
      },
      {
        "id": "striver-q-135",
        "stepNumber": 6,
        "stepName": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
        "qno": 135,
        "title": "Middle of a LinkedList [TortoiseHare Method]",
        "difficulty": "Easy",
        "youtube_url": "https://youtu.be/7LjQ57RqgEc?si=ir_rRDio38rhamU_",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Middle+of+a+LinkedList",
        "article_url": "https://takeuforward.org/?s=Middle+of+a+LinkedList",
        "companies": [
          "Apple",
          "Amazon",
          "Netflix"
        ]
      },
      {
        "id": "striver-q-136",
        "stepNumber": 6,
        "stepName": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
        "qno": 136,
        "title": "Reverse a LinkedList [Iterative]",
        "difficulty": "Easy",
        "youtube_url": "https://youtu.be/D2vI2DNJGd8?si=RCaLSx01qR21IBdh",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Reverse+a+LinkedList",
        "article_url": "https://takeuforward.org/?s=Reverse+a+LinkedList",
        "companies": [
          "Google",
          "Amazon",
          "Microsoft"
        ]
      },
      {
        "id": "striver-q-137",
        "stepNumber": 6,
        "stepName": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
        "qno": 137,
        "title": "Reverse a LL [Recursive]",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/D2vI2DNJGd8?si=RCaLSx01qR21IBdh",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Reverse+a+LL",
        "article_url": "https://takeuforward.org/?s=Reverse+a+LL",
        "companies": [
          "Amazon",
          "Microsoft",
          "Meta"
        ]
      },
      {
        "id": "striver-q-138",
        "stepNumber": 6,
        "stepName": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
        "qno": 138,
        "title": "Detect a loop in LL",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/wiOo4DC5GGA?si=zagt6O6tFXc4_3cx",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Detect+a+loop+in+LL",
        "article_url": "https://takeuforward.org/?s=Detect+a+loop+in+LL",
        "companies": [
          "Google",
          "Apple",
          "Uber"
        ]
      },
      {
        "id": "striver-q-139",
        "stepNumber": 6,
        "stepName": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
        "qno": 139,
        "title": "Find the starting point in LL",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/2Kd0KKmmHFc?si=7UreDPRjRvapeVB0",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Find+the+starting+point+in+LL",
        "article_url": "https://takeuforward.org/?s=Find+the+starting+point+in+LL",
        "companies": [
          "Microsoft",
          "Goldman Sachs",
          "Amazon"
        ]
      },
      {
        "id": "striver-q-140",
        "stepNumber": 6,
        "stepName": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
        "qno": 140,
        "title": "Length of Loop in LL",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/I4g1qbkTPus?si=ONktpqewvx57T8pF",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Length+of+Loop+in+LL",
        "article_url": "https://takeuforward.org/?s=Length+of+Loop+in+LL",
        "companies": [
          "Meta",
          "Google",
          "Bloomberg"
        ]
      },
      {
        "id": "striver-q-141",
        "stepNumber": 6,
        "stepName": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
        "qno": 141,
        "title": "Check if LL is palindrome or not",
        "difficulty": "Easy",
        "youtube_url": "https://youtu.be/lRY_G-u_8jk?si=BpM8hRYvXSYyjl-G",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Check+if+LL+is+palindrome+or+not",
        "article_url": "https://takeuforward.org/?s=Check+if+LL+is+palindrome+or+not",
        "companies": [
          "Amazon",
          "Adobe",
          "Flipkart"
        ]
      },
      {
        "id": "striver-q-142",
        "stepNumber": 6,
        "stepName": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
        "qno": 142,
        "title": "Segrregate odd and even nodes in LL",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/qf6qp7GzD5Q?si=JozAyXUdT8EJMSCQ",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Segrregate+odd+and+even+nodes+in+LL",
        "article_url": "https://takeuforward.org/?s=Segrregate+odd+and+even+nodes+in+LL",
        "companies": [
          "Google",
          "Microsoft",
          "Uber"
        ]
      },
      {
        "id": "striver-q-143",
        "stepNumber": 6,
        "stepName": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
        "qno": 143,
        "title": "Remove Nth node from the back of the LL",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/3kMKYQ2wNIU?si=DtFDnPU7z9HMz_GM",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Remove+Nth+node+from+the+back+of+the+LL",
        "article_url": "https://takeuforward.org/?s=Remove+Nth+node+from+the+back+of+the+LL",
        "companies": [
          "Apple",
          "Amazon",
          "Netflix"
        ]
      },
      {
        "id": "striver-q-144",
        "stepNumber": 6,
        "stepName": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
        "qno": 144,
        "title": "Delete the middle node of LL",
        "difficulty": "Easy",
        "youtube_url": "https://youtu.be/ePpV-_pfOeI?si=Au9GsZkVO57j6SiN",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Delete+the+middle+node+of+LL",
        "article_url": "https://takeuforward.org/?s=Delete+the+middle+node+of+LL",
        "companies": [
          "Google",
          "Amazon",
          "Microsoft"
        ]
      },
      {
        "id": "striver-q-145",
        "stepNumber": 6,
        "stepName": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
        "qno": 145,
        "title": "Sort LL",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/8ocB7a_c-Cc?si=Gv-Y8q8-WyARoV35",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Sort+LL",
        "article_url": "https://takeuforward.org/?s=Sort+LL",
        "companies": [
          "Amazon",
          "Microsoft",
          "Meta"
        ]
      },
      {
        "id": "striver-q-146",
        "stepNumber": 6,
        "stepName": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
        "qno": 146,
        "title": "Sort a LL of 0's 1's and 2's by changing links",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/gRII7LhdJWc?si=l3qRC7w3NhY7OAqw",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Sort+a+LL+of+0's+1's+and+2's+by+changing+links",
        "article_url": "https://takeuforward.org/?s=Sort+a+LL+of+0's+1's+and+2's+by+changing+links",
        "companies": [
          "Google",
          "Apple",
          "Uber"
        ]
      },
      {
        "id": "striver-q-147",
        "stepNumber": 6,
        "stepName": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
        "qno": 147,
        "title": "Find the intersection point of Y LL",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/0DYoPz2Tpt4?si=L-uJs5yXUxj4VJM2",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Find+the+intersection+point+of+Y+LL",
        "article_url": "https://takeuforward.org/?s=Find+the+intersection+point+of+Y+LL",
        "companies": [
          "Microsoft",
          "Goldman Sachs",
          "Amazon"
        ]
      },
      {
        "id": "striver-q-148",
        "stepNumber": 6,
        "stepName": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
        "qno": 148,
        "title": "Add 1 to a number represented by LL",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/aXQWhbvT3w0?si=uRgU9S4r5cVmnUy7",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Add+1+to+a+number+represented+by+LL",
        "article_url": "https://takeuforward.org/?s=Add+1+to+a+number+represented+by+LL",
        "companies": [
          "Meta",
          "Google",
          "Bloomberg"
        ]
      },
      {
        "id": "striver-q-149",
        "stepNumber": 6,
        "stepName": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
        "qno": 149,
        "title": "Add 2 numbers in LL",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/XmRrGzR6udg?si=VYuZYUcaVCrZCgpA",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Add+2+numbers+in+LL",
        "article_url": "https://takeuforward.org/?s=Add+2+numbers+in+LL",
        "companies": [
          "Amazon",
          "Adobe",
          "Flipkart"
        ]
      },
      {
        "id": "striver-q-150",
        "stepNumber": 6,
        "stepName": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
        "qno": 150,
        "title": "Delete all occurrences of a key in DLL",
        "difficulty": "Easy",
        "youtube_url": "https://youtu.be/Mh0NH_SD92k?si=tCYshBRi1upMqSVz",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Delete+all+occurrences+of+a+key+in+DLL",
        "article_url": "https://takeuforward.org/?s=Delete+all+occurrences+of+a+key+in+DLL",
        "companies": [
          "Google",
          "Microsoft",
          "Uber"
        ]
      },
      {
        "id": "striver-q-151",
        "stepNumber": 6,
        "stepName": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
        "qno": 151,
        "title": "Find pairs with given sum in DLL",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/YitR4dQsddE?si=iZAC259hdngV_OxC",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Find+pairs+with+given+sum+in+DLL",
        "article_url": "https://takeuforward.org/?s=Find+pairs+with+given+sum+in+DLL",
        "companies": [
          "Apple",
          "Amazon",
          "Netflix"
        ]
      },
      {
        "id": "striver-q-152",
        "stepNumber": 6,
        "stepName": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
        "qno": 152,
        "title": "Remove duplicates from sorted DLL",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/YJKVTnOJXSY?si=AsZoNUoewetsBjr0",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Remove+duplicates+from+sorted+DLL",
        "article_url": "https://takeuforward.org/?s=Remove+duplicates+from+sorted+DLL",
        "companies": [
          "Google",
          "Amazon",
          "Microsoft"
        ]
      },
      {
        "id": "striver-q-153",
        "stepNumber": 6,
        "stepName": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
        "qno": 153,
        "title": "Reverse LL in group of given size K",
        "difficulty": "Hard",
        "youtube_url": "https://youtu.be/lIar1skcQYI?si=_jFghHKX4eaK36a1",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Reverse+LL+in+group+of+given+size+K",
        "article_url": "https://takeuforward.org/?s=Reverse+LL+in+group+of+given+size+K",
        "companies": [
          "Amazon",
          "Microsoft",
          "Meta"
        ]
      },
      {
        "id": "striver-q-154",
        "stepNumber": 6,
        "stepName": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
        "qno": 154,
        "title": "Rotate a LL",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/uT7YI7XbTY8?si=ZaChW3a68c_v54Is",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Rotate+a+LL",
        "article_url": "https://takeuforward.org/?s=Rotate+a+LL",
        "companies": [
          "Google",
          "Apple",
          "Uber"
        ]
      },
      {
        "id": "striver-q-155",
        "stepNumber": 6,
        "stepName": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
        "qno": 155,
        "title": "Flattening of LL",
        "difficulty": "Hard",
        "youtube_url": "https://youtu.be/ykelywHJWLg?si=InMg9MmTHzY22NSR",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Flattening+of+LL",
        "article_url": "https://takeuforward.org/?s=Flattening+of+LL",
        "companies": [
          "Microsoft",
          "Goldman Sachs",
          "Amazon"
        ]
      },
      {
        "id": "striver-q-156",
        "stepNumber": 6,
        "stepName": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
        "qno": 156,
        "title": "Clone a Linked List with random and next pointer",
        "difficulty": "Hard",
        "youtube_url": "https://youtu.be/q570bKdrnlw?si=epZtpWvtNwuTf23o",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Clone+a+Linked+List+with+random+and+next+pointer",
        "article_url": "https://takeuforward.org/?s=Clone+a+Linked+List+with+random+and+next+pointer",
        "companies": [
          "Meta",
          "Google",
          "Bloomberg"
        ]
      }
    ]
  },
  {
    "id": "step-7",
    "stepNumber": 7,
    "title": "Step 7: Recursion [PatternWise]",
    "stepRange": "Q157 - Q181",
    "description": "25 curated problems covering Recursion [PatternWise]",
    "problems": [
      {
        "id": "striver-q-157",
        "stepNumber": 7,
        "stepName": "Step 7: Recursion [PatternWise]",
        "qno": 157,
        "title": "Recursive Implementation of atoi()",
        "difficulty": "Medium",
        "youtube_url": null,
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Recursive+Implementation+of+atoi",
        "article_url": "https://takeuforward.org/?s=Recursive+Implementation+of+atoi",
        "companies": [
          "Amazon",
          "Adobe",
          "Flipkart"
        ]
      },
      {
        "id": "striver-q-158",
        "stepNumber": 7,
        "stepName": "Step 7: Recursion [PatternWise]",
        "qno": 158,
        "title": "Pow(x, n)",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/l0YC3876qxg",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Pow",
        "article_url": "https://takeuforward.org/?s=Pow",
        "companies": [
          "Google",
          "Microsoft",
          "Uber"
        ]
      },
      {
        "id": "striver-q-159",
        "stepNumber": 7,
        "stepName": "Step 7: Recursion [PatternWise]",
        "qno": 159,
        "title": "Count Good numbers",
        "difficulty": "Easy",
        "youtube_url": null,
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Count+Good+numbers",
        "article_url": "https://takeuforward.org/?s=Count+Good+numbers",
        "companies": [
          "Apple",
          "Amazon",
          "Netflix"
        ]
      },
      {
        "id": "striver-q-160",
        "stepNumber": 7,
        "stepName": "Step 7: Recursion [PatternWise]",
        "qno": 160,
        "title": "Sort a stack using recursion",
        "difficulty": "Easy",
        "youtube_url": null,
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Sort+a+stack+using+recursion",
        "article_url": "https://takeuforward.org/?s=Sort+a+stack+using+recursion",
        "companies": [
          "Google",
          "Amazon",
          "Microsoft"
        ]
      },
      {
        "id": "striver-q-161",
        "stepNumber": 7,
        "stepName": "Step 7: Recursion [PatternWise]",
        "qno": 161,
        "title": "Reverse a stack using recursion",
        "difficulty": "Easy",
        "youtube_url": null,
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Reverse+a+stack+using+recursion",
        "article_url": "https://takeuforward.org/?s=Reverse+a+stack+using+recursion",
        "companies": [
          "Amazon",
          "Microsoft",
          "Meta"
        ]
      },
      {
        "id": "striver-q-162",
        "stepNumber": 7,
        "stepName": "Step 7: Recursion [PatternWise]",
        "qno": 162,
        "title": "Generate all binary strings",
        "difficulty": "Easy",
        "youtube_url": null,
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Generate+all+binary+strings",
        "article_url": "https://takeuforward.org/?s=Generate+all+binary+strings",
        "companies": [
          "Google",
          "Apple",
          "Uber"
        ]
      },
      {
        "id": "striver-q-163",
        "stepNumber": 7,
        "stepName": "Step 7: Recursion [PatternWise]",
        "qno": 163,
        "title": "Generate Paranthesis",
        "difficulty": "Medium",
        "youtube_url": null,
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Generate+Paranthesis",
        "article_url": "https://takeuforward.org/?s=Generate+Paranthesis",
        "companies": [
          "Microsoft",
          "Goldman Sachs",
          "Amazon"
        ]
      },
      {
        "id": "striver-q-164",
        "stepNumber": 7,
        "stepName": "Step 7: Recursion [PatternWise]",
        "qno": 164,
        "title": "Print all subsequences/Power Set",
        "difficulty": "Easy",
        "youtube_url": "https://youtu.be/b7AYbpM5YrE",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Print+all+subsequences/Power+Set",
        "article_url": "https://takeuforward.org/?s=Print+all+subsequences/Power+Set",
        "companies": [
          "Meta",
          "Google",
          "Bloomberg"
        ]
      },
      {
        "id": "striver-q-165",
        "stepNumber": 7,
        "stepName": "Step 7: Recursion [PatternWise]",
        "qno": 165,
        "title": "Learn All Patterns of Subsequences (Theory)",
        "difficulty": "Easy",
        "youtube_url": "https://www.youtube.com/watch?v=eQCS_v3bw0Q&list=PLgUwDviBIf0rGlzIn_7rsaR2FQ5e6ZOL9&index=7",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Learn+All+Patterns+of+Subsequences",
        "article_url": "https://takeuforward.org/?s=Learn+All+Patterns+of+Subsequences",
        "companies": [
          "Amazon",
          "Adobe",
          "Flipkart"
        ]
      },
      {
        "id": "striver-q-166",
        "stepNumber": 7,
        "stepName": "Step 7: Recursion [PatternWise]",
        "qno": 166,
        "title": "Count all subsequences with sum K",
        "difficulty": "Medium",
        "youtube_url": null,
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Count+all+subsequences+with+sum+K",
        "article_url": "https://takeuforward.org/?s=Count+all+subsequences+with+sum+K",
        "companies": [
          "Google",
          "Microsoft",
          "Uber"
        ]
      },
      {
        "id": "striver-q-167",
        "stepNumber": 7,
        "stepName": "Step 7: Recursion [PatternWise]",
        "qno": 167,
        "title": "Check if there exists a subsequence with sum K",
        "difficulty": "Medium",
        "youtube_url": null,
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Check+if+there+exists+a+subsequence+with+sum+K",
        "article_url": "https://takeuforward.org/?s=Check+if+there+exists+a+subsequence+with+sum+K",
        "companies": [
          "Apple",
          "Amazon",
          "Netflix"
        ]
      },
      {
        "id": "striver-q-168",
        "stepNumber": 7,
        "stepName": "Step 7: Recursion [PatternWise]",
        "qno": 168,
        "title": "Combination Sum",
        "difficulty": "Medium",
        "youtube_url": "https://www.youtube.com/watch?v=OyZFFqQtu98&list=PLgUwDviBIf0p4ozDR_kJJkONnb1wdx2Ma&index=49",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Combination+Sum",
        "article_url": "https://takeuforward.org/?s=Combination+Sum",
        "companies": [
          "Google",
          "Amazon",
          "Microsoft"
        ]
      },
      {
        "id": "striver-q-169",
        "stepNumber": 7,
        "stepName": "Step 7: Recursion [PatternWise]",
        "qno": 169,
        "title": "Combination Sum-II",
        "difficulty": "Medium",
        "youtube_url": "https://www.youtube.com/watch?v=G1fRTGRxXU8&list=PLgUwDviBIf0p4ozDR_kJJkONnb1wdx2Ma&index=50",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Combination+Sum-II",
        "article_url": "https://takeuforward.org/?s=Combination+Sum-II",
        "companies": [
          "Amazon",
          "Microsoft",
          "Meta"
        ]
      },
      {
        "id": "striver-q-170",
        "stepNumber": 7,
        "stepName": "Step 7: Recursion [PatternWise]",
        "qno": 170,
        "title": "Subset Sum-I",
        "difficulty": "Medium",
        "youtube_url": "https://www.youtube.com/watch?v=rYkfBRtMJr8&list=PLgUwDviBIf0p4ozDR_kJJkONnb1wdx2Ma&index=52",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Subset+Sum-I",
        "article_url": "https://takeuforward.org/?s=Subset+Sum-I",
        "companies": [
          "Google",
          "Apple",
          "Uber"
        ]
      },
      {
        "id": "striver-q-171",
        "stepNumber": 7,
        "stepName": "Step 7: Recursion [PatternWise]",
        "qno": 171,
        "title": "Subset Sum-II",
        "difficulty": "Medium",
        "youtube_url": "https://www.youtube.com/watch?v=RIn3gOkbhQE&list=PLgUwDviBIf0p4ozDR_kJJkONnb1wdx2Ma&index=53",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Subset+Sum-II",
        "article_url": "https://takeuforward.org/?s=Subset+Sum-II",
        "companies": [
          "Microsoft",
          "Goldman Sachs",
          "Amazon"
        ]
      },
      {
        "id": "striver-q-172",
        "stepNumber": 7,
        "stepName": "Step 7: Recursion [PatternWise]",
        "qno": 172,
        "title": "Combination Sum - III",
        "difficulty": "Medium",
        "youtube_url": null,
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Combination+Sum+-+III",
        "article_url": "https://takeuforward.org/?s=Combination+Sum+-+III",
        "companies": [
          "Meta",
          "Google",
          "Bloomberg"
        ]
      },
      {
        "id": "striver-q-173",
        "stepNumber": 7,
        "stepName": "Step 7: Recursion [PatternWise]",
        "qno": 173,
        "title": "Letter Combinations of a Phone number",
        "difficulty": "Medium",
        "youtube_url": null,
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Letter+Combinations+of+a+Phone+number",
        "article_url": "https://takeuforward.org/?s=Letter+Combinations+of+a+Phone+number",
        "companies": [
          "Amazon",
          "Adobe",
          "Flipkart"
        ]
      },
      {
        "id": "striver-q-174",
        "stepNumber": 7,
        "stepName": "Step 7: Recursion [PatternWise]",
        "qno": 174,
        "title": "Palindrome Partitioning",
        "difficulty": "Medium",
        "youtube_url": "https://www.youtube.com/watch?v=WBgsABoClE0&list=PLgUwDviBIf0p4ozDR_kJJkONnb1wdx2Ma&index=51",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Palindrome+Partitioning",
        "article_url": "https://takeuforward.org/?s=Palindrome+Partitioning",
        "companies": [
          "Google",
          "Microsoft",
          "Uber"
        ]
      },
      {
        "id": "striver-q-175",
        "stepNumber": 7,
        "stepName": "Step 7: Recursion [PatternWise]",
        "qno": 175,
        "title": "Word Search",
        "difficulty": "Hard",
        "youtube_url": null,
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Word+Search",
        "article_url": "https://takeuforward.org/?s=Word+Search",
        "companies": [
          "Apple",
          "Amazon",
          "Netflix"
        ]
      },
      {
        "id": "striver-q-176",
        "stepNumber": 7,
        "stepName": "Step 7: Recursion [PatternWise]",
        "qno": 176,
        "title": "N Queen",
        "difficulty": "Hard",
        "youtube_url": "https://www.youtube.com/watch?v=i05Ju7AftcM&list=PLgUwDviBIf0p4ozDR_kJJkONnb1wdx2Ma&index=57",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=N+Queen",
        "article_url": "https://takeuforward.org/?s=N+Queen",
        "companies": [
          "Google",
          "Amazon",
          "Microsoft"
        ]
      },
      {
        "id": "striver-q-177",
        "stepNumber": 7,
        "stepName": "Step 7: Recursion [PatternWise]",
        "qno": 177,
        "title": "Rat in a Maze",
        "difficulty": "Hard",
        "youtube_url": "https://www.youtube.com/watch?v=bLGZhJlt4y0&list=PLgUwDviBIf0p4ozDR_kJJkONnb1wdx2Ma&index=60",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Rat+in+a+Maze",
        "article_url": "https://takeuforward.org/?s=Rat+in+a+Maze",
        "companies": [
          "Amazon",
          "Microsoft",
          "Meta"
        ]
      },
      {
        "id": "striver-q-178",
        "stepNumber": 7,
        "stepName": "Step 7: Recursion [PatternWise]",
        "qno": 178,
        "title": "Word Break",
        "difficulty": "Hard",
        "youtube_url": null,
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Word+Break",
        "article_url": "https://takeuforward.org/?s=Word+Break",
        "companies": [
          "Google",
          "Apple",
          "Uber"
        ]
      },
      {
        "id": "striver-q-179",
        "stepNumber": 7,
        "stepName": "Step 7: Recursion [PatternWise]",
        "qno": 179,
        "title": "M Coloring Problem",
        "difficulty": "Hard",
        "youtube_url": "https://www.youtube.com/watch?v=wuVwUK25Rfc&list=PLgUwDviBIf0p4ozDR_kJJkONnb1wdx2Ma&index=59",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=M+Coloring+Problem",
        "article_url": "https://takeuforward.org/?s=M+Coloring+Problem",
        "companies": [
          "Microsoft",
          "Goldman Sachs",
          "Amazon"
        ]
      },
      {
        "id": "striver-q-180",
        "stepNumber": 7,
        "stepName": "Step 7: Recursion [PatternWise]",
        "qno": 180,
        "title": "Sudoko Solver",
        "difficulty": "Hard",
        "youtube_url": "https://www.youtube.com/watch?v=FWAIf_EVUKE&list=PLgUwDviBIf0p4ozDR_kJJkONnb1wdx2Ma&index=58",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Sudoko+Solver",
        "article_url": "https://takeuforward.org/?s=Sudoko+Solver",
        "companies": [
          "Meta",
          "Google",
          "Bloomberg"
        ]
      },
      {
        "id": "striver-q-181",
        "stepNumber": 7,
        "stepName": "Step 7: Recursion [PatternWise]",
        "qno": 181,
        "title": "Expression Add Operators",
        "difficulty": "Hard",
        "youtube_url": null,
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Expression+Add+Operators",
        "article_url": "https://takeuforward.org/?s=Expression+Add+Operators",
        "companies": [
          "Amazon",
          "Adobe",
          "Flipkart"
        ]
      }
    ]
  },
  {
    "id": "step-8",
    "stepNumber": 8,
    "title": "Step 8: Bit Manipulation [Concepts & Problems]",
    "stepRange": "Q182 - Q199",
    "description": "18 curated problems covering Bit Manipulation [Concepts & Problems]",
    "problems": [
      {
        "id": "striver-q-182",
        "stepNumber": 8,
        "stepName": "Step 8: Bit Manipulation [Concepts & Problems]",
        "qno": 182,
        "title": "Introduction to Bit Manipulation [Theory]",
        "difficulty": "Easy",
        "youtube_url": "https://youtu.be/qQd-ViW7bfk?si=QtdNaRhHmZb08Mr8",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Introduction+to+Bit+Manipulation",
        "article_url": "https://takeuforward.org/?s=Introduction+to+Bit+Manipulation",
        "companies": [
          "Google",
          "Microsoft",
          "Uber"
        ]
      },
      {
        "id": "striver-q-183",
        "stepNumber": 8,
        "stepName": "Step 8: Bit Manipulation [Concepts & Problems]",
        "qno": 183,
        "title": "Check if the i-th bit is set or not",
        "difficulty": "Easy",
        "youtube_url": "https://youtu.be/nttpF8kwgd4?si=x9o8PsYaA2XVZ9rV",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Check+if+the+i-th+bit+is+set+or+not",
        "article_url": "https://takeuforward.org/?s=Check+if+the+i-th+bit+is+set+or+not",
        "companies": [
          "Apple",
          "Amazon",
          "Netflix"
        ]
      },
      {
        "id": "striver-q-184",
        "stepNumber": 8,
        "stepName": "Step 8: Bit Manipulation [Concepts & Problems]",
        "qno": 184,
        "title": "Check if a number is odd or not",
        "difficulty": "Easy",
        "youtube_url": "https://youtu.be/nttpF8kwgd4?si=x9o8PsYaA2XVZ9rV",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Check+if+a+number+is+odd+or+not",
        "article_url": "https://takeuforward.org/?s=Check+if+a+number+is+odd+or+not",
        "companies": [
          "Google",
          "Amazon",
          "Microsoft"
        ]
      },
      {
        "id": "striver-q-185",
        "stepNumber": 8,
        "stepName": "Step 8: Bit Manipulation [Concepts & Problems]",
        "qno": 185,
        "title": "Check if a number is power of 2 or not",
        "difficulty": "Easy",
        "youtube_url": "https://youtu.be/nttpF8kwgd4?si=x9o8PsYaA2XVZ9rV",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Check+if+a+number+is+power+of+2+or+not",
        "article_url": "https://takeuforward.org/?s=Check+if+a+number+is+power+of+2+or+not",
        "companies": [
          "Amazon",
          "Microsoft",
          "Meta"
        ]
      },
      {
        "id": "striver-q-186",
        "stepNumber": 8,
        "stepName": "Step 8: Bit Manipulation [Concepts & Problems]",
        "qno": 186,
        "title": "Count the number of set bits",
        "difficulty": "Easy",
        "youtube_url": "https://youtu.be/nttpF8kwgd4?si=x9o8PsYaA2XVZ9rV",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Count+the+number+of+set+bits",
        "article_url": "https://takeuforward.org/?s=Count+the+number+of+set+bits",
        "companies": [
          "Google",
          "Apple",
          "Uber"
        ]
      },
      {
        "id": "striver-q-187",
        "stepNumber": 8,
        "stepName": "Step 8: Bit Manipulation [Concepts & Problems]",
        "qno": 187,
        "title": "Set/Unset the rightmost unset bit",
        "difficulty": "Easy",
        "youtube_url": "https://youtu.be/nttpF8kwgd4?si=x9o8PsYaA2XVZ9rV",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Set/Unset+the+rightmost+unset+bit",
        "article_url": "https://takeuforward.org/?s=Set/Unset+the+rightmost+unset+bit",
        "companies": [
          "Microsoft",
          "Goldman Sachs",
          "Amazon"
        ]
      },
      {
        "id": "striver-q-188",
        "stepNumber": 8,
        "stepName": "Step 8: Bit Manipulation [Concepts & Problems]",
        "qno": 188,
        "title": "Swap two numbers",
        "difficulty": "Easy",
        "youtube_url": "https://youtu.be/nttpF8kwgd4?si=x9o8PsYaA2XVZ9rV",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Swap+two+numbers",
        "article_url": "https://takeuforward.org/?s=Swap+two+numbers",
        "companies": [
          "Meta",
          "Google",
          "Bloomberg"
        ]
      },
      {
        "id": "striver-q-189",
        "stepNumber": 8,
        "stepName": "Step 8: Bit Manipulation [Concepts & Problems]",
        "qno": 189,
        "title": "Divide two integers without using multiplication, division and mod operator",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/pBD4B1tzgVc?si=G9c5pEE-RrzeU6sz",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Divide+two+integers+without+using+multiplication,+division+and+mod+operator",
        "article_url": "https://takeuforward.org/?s=Divide+two+integers+without+using+multiplication,+division+and+mod+operator",
        "companies": [
          "Amazon",
          "Adobe",
          "Flipkart"
        ]
      },
      {
        "id": "striver-q-190",
        "stepNumber": 8,
        "stepName": "Step 8: Bit Manipulation [Concepts & Problems]",
        "qno": 190,
        "title": "Count number of bits to be flipped to convert A to B",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/OOdrmcfZXd8?si=rnkRVz1UiVBKWC69",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Count+number+of+bits+to+be+flipped+to+convert+A+to+B",
        "article_url": "https://takeuforward.org/?s=Count+number+of+bits+to+be+flipped+to+convert+A+to+B",
        "companies": [
          "Google",
          "Microsoft",
          "Uber"
        ]
      },
      {
        "id": "striver-q-191",
        "stepNumber": 8,
        "stepName": "Step 8: Bit Manipulation [Concepts & Problems]",
        "qno": 191,
        "title": "Find the number that appears odd number of times",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/sFBCAl8yBfE?si=fETk-BA0cvmF02rR",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Find+the+number+that+appears+odd+number+of+times",
        "article_url": "https://takeuforward.org/?s=Find+the+number+that+appears+odd+number+of+times",
        "companies": [
          "Apple",
          "Amazon",
          "Netflix"
        ]
      },
      {
        "id": "striver-q-192",
        "stepNumber": 8,
        "stepName": "Step 8: Bit Manipulation [Concepts & Problems]",
        "qno": 192,
        "title": "Power Set",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/LqKaUv1G3_I?si=UXU_T5OsHiokPRvP",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Power+Set",
        "article_url": "https://takeuforward.org/?s=Power+Set",
        "companies": [
          "Google",
          "Amazon",
          "Microsoft"
        ]
      },
      {
        "id": "striver-q-193",
        "stepNumber": 8,
        "stepName": "Step 8: Bit Manipulation [Concepts & Problems]",
        "qno": 193,
        "title": "Find xor of numbers from L to R",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/WqGb7159h7Q?si=uGUEbNUUaIN_6Vvr",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Find+xor+of+numbers+from+L+to+R",
        "article_url": "https://takeuforward.org/?s=Find+xor+of+numbers+from+L+to+R",
        "companies": [
          "Amazon",
          "Microsoft",
          "Meta"
        ]
      },
      {
        "id": "striver-q-194",
        "stepNumber": 8,
        "stepName": "Step 8: Bit Manipulation [Concepts & Problems]",
        "qno": 194,
        "title": "Find the two numbers appearing odd number of times",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/UA5JnV1J2sI?si=VFBRJyb3boZvx_r1",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Find+the+two+numbers+appearing+odd+number+of+times",
        "article_url": "https://takeuforward.org/?s=Find+the+two+numbers+appearing+odd+number+of+times",
        "companies": [
          "Google",
          "Apple",
          "Uber"
        ]
      },
      {
        "id": "striver-q-195",
        "stepNumber": 8,
        "stepName": "Step 8: Bit Manipulation [Concepts & Problems]",
        "qno": 195,
        "title": "Print Prime Factors of a Number",
        "difficulty": "Easy",
        "youtube_url": "https://youtu.be/LT7XhVdeRyg?si=6HkjQokJRPTFai21",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Print+Prime+Factors+of+a+Number",
        "article_url": "https://takeuforward.org/?s=Print+Prime+Factors+of+a+Number",
        "companies": [
          "Microsoft",
          "Goldman Sachs",
          "Amazon"
        ]
      },
      {
        "id": "striver-q-196",
        "stepNumber": 8,
        "stepName": "Step 8: Bit Manipulation [Concepts & Problems]",
        "qno": 196,
        "title": "All Divisors of a Number",
        "difficulty": "Easy",
        "youtube_url": "https://youtu.be/Ae_Ag_saG9s?si=QQoDTW5DxyZ3Lfjg",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=All+Divisors+of+a+Number",
        "article_url": "https://takeuforward.org/?s=All+Divisors+of+a+Number",
        "companies": [
          "Meta",
          "Google",
          "Bloomberg"
        ]
      },
      {
        "id": "striver-q-197",
        "stepNumber": 8,
        "stepName": "Step 8: Bit Manipulation [Concepts & Problems]",
        "qno": 197,
        "title": "Sieve of Eratosthenes",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/g5Fuxn_AvSk?si=fv6Q-Po7wrMW0a5n",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Sieve+of+Eratosthenes",
        "article_url": "https://takeuforward.org/?s=Sieve+of+Eratosthenes",
        "companies": [
          "Amazon",
          "Adobe",
          "Flipkart"
        ]
      },
      {
        "id": "striver-q-198",
        "stepNumber": 8,
        "stepName": "Step 8: Bit Manipulation [Concepts & Problems]",
        "qno": 198,
        "title": "Find Prime Factorisation of a Number using Sieve",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/glKWkmKFlMw?si=3k5K5oq3FvKVrWLB",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Find+Prime+Factorisation+of+a+Number+using+Sieve",
        "article_url": "https://takeuforward.org/?s=Find+Prime+Factorisation+of+a+Number+using+Sieve",
        "companies": [
          "Google",
          "Microsoft",
          "Uber"
        ]
      },
      {
        "id": "striver-q-199",
        "stepNumber": 8,
        "stepName": "Step 8: Bit Manipulation [Concepts & Problems]",
        "qno": 199,
        "title": "Power(n, x)",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/hFWckDXE-K8?si=lBoOx3qYcmGo_j5b",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Power",
        "article_url": "https://takeuforward.org/?s=Power",
        "companies": [
          "Apple",
          "Amazon",
          "Netflix"
        ]
      }
    ]
  },
  {
    "id": "step-9",
    "stepNumber": 9,
    "title": "Step 9: Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]",
    "stepRange": "Q200 - Q229",
    "description": "30 curated problems covering Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]",
    "problems": [
      {
        "id": "striver-q-200",
        "stepNumber": 9,
        "stepName": "Step 9: Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]",
        "qno": 200,
        "title": "Implement Stack using Arrays",
        "difficulty": "Easy",
        "youtube_url": "https://youtu.be/tqQ5fTamIN4?si=ofLt8Zt1ZvhikZ6w",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Implement+Stack+using+Arrays",
        "article_url": "https://takeuforward.org/?s=Implement+Stack+using+Arrays",
        "companies": [
          "Google",
          "Amazon",
          "Microsoft"
        ]
      },
      {
        "id": "striver-q-201",
        "stepNumber": 9,
        "stepName": "Step 9: Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]",
        "qno": 201,
        "title": "Implement Queue using Arrays",
        "difficulty": "Easy",
        "youtube_url": "https://youtu.be/tqQ5fTamIN4?si=ofLt8Zt1ZvhikZ6w",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Implement+Queue+using+Arrays",
        "article_url": "https://takeuforward.org/?s=Implement+Queue+using+Arrays",
        "companies": [
          "Amazon",
          "Microsoft",
          "Meta"
        ]
      },
      {
        "id": "striver-q-202",
        "stepNumber": 9,
        "stepName": "Step 9: Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]",
        "qno": 202,
        "title": "Implement Stack using Queue",
        "difficulty": "Easy",
        "youtube_url": "https://youtu.be/tqQ5fTamIN4?si=ofLt8Zt1ZvhikZ6w",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Implement+Stack+using+Queue",
        "article_url": "https://takeuforward.org/?s=Implement+Stack+using+Queue",
        "companies": [
          "Google",
          "Apple",
          "Uber"
        ]
      },
      {
        "id": "striver-q-203",
        "stepNumber": 9,
        "stepName": "Step 9: Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]",
        "qno": 203,
        "title": "Implement Queue using Stack",
        "difficulty": "Easy",
        "youtube_url": "https://youtu.be/tqQ5fTamIN4?si=ofLt8Zt1ZvhikZ6w",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Implement+Queue+using+Stack",
        "article_url": "https://takeuforward.org/?s=Implement+Queue+using+Stack",
        "companies": [
          "Microsoft",
          "Goldman Sachs",
          "Amazon"
        ]
      },
      {
        "id": "striver-q-204",
        "stepNumber": 9,
        "stepName": "Step 9: Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]",
        "qno": 204,
        "title": "Implement stack using Linkedlist",
        "difficulty": "Easy",
        "youtube_url": "https://youtu.be/tqQ5fTamIN4?si=ofLt8Zt1ZvhikZ6w",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Implement+stack+using+Linkedlist",
        "article_url": "https://takeuforward.org/?s=Implement+stack+using+Linkedlist",
        "companies": [
          "Meta",
          "Google",
          "Bloomberg"
        ]
      },
      {
        "id": "striver-q-205",
        "stepNumber": 9,
        "stepName": "Step 9: Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]",
        "qno": 205,
        "title": "Implement queue using Linkedlist",
        "difficulty": "Easy",
        "youtube_url": "https://youtu.be/tqQ5fTamIN4?si=ofLt8Zt1ZvhikZ6w",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Implement+queue+using+Linkedlist",
        "article_url": "https://takeuforward.org/?s=Implement+queue+using+Linkedlist",
        "companies": [
          "Amazon",
          "Adobe",
          "Flipkart"
        ]
      },
      {
        "id": "striver-q-206",
        "stepNumber": 9,
        "stepName": "Step 9: Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]",
        "qno": 206,
        "title": "Check for balanced paranthesis",
        "difficulty": "Easy",
        "youtube_url": "https://youtu.be/xwjS0iZhw4I?si=UoyKpFn4Q3nf5h2R",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Check+for+balanced+paranthesis",
        "article_url": "https://takeuforward.org/?s=Check+for+balanced+paranthesis",
        "companies": [
          "Google",
          "Microsoft",
          "Uber"
        ]
      },
      {
        "id": "striver-q-207",
        "stepNumber": 9,
        "stepName": "Step 9: Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]",
        "qno": 207,
        "title": "Implement Min Stack",
        "difficulty": "Easy",
        "youtube_url": "https://youtu.be/NdDIaH91P0g?si=4_Jbsq5trFvfSdUY",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Implement+Min+Stack",
        "article_url": "https://takeuforward.org/?s=Implement+Min+Stack",
        "companies": [
          "Apple",
          "Amazon",
          "Netflix"
        ]
      },
      {
        "id": "striver-q-208",
        "stepNumber": 9,
        "stepName": "Step 9: Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]",
        "qno": 208,
        "title": "Infix to Postfix Conversion using Stack",
        "difficulty": "Easy",
        "youtube_url": "https://youtu.be/4pIc9UBHJtk?si=ryeVvQWpCgwbTQrh",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Infix+to+Postfix+Conversion+using+Stack",
        "article_url": "https://takeuforward.org/?s=Infix+to+Postfix+Conversion+using+Stack",
        "companies": [
          "Google",
          "Amazon",
          "Microsoft"
        ]
      },
      {
        "id": "striver-q-209",
        "stepNumber": 9,
        "stepName": "Step 9: Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]",
        "qno": 209,
        "title": "Prefix to Infix Conversion",
        "difficulty": "Easy",
        "youtube_url": "https://youtu.be/4pIc9UBHJtk?si=ryeVvQWpCgwbTQrh",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Prefix+to+Infix+Conversion",
        "article_url": "https://takeuforward.org/?s=Prefix+to+Infix+Conversion",
        "companies": [
          "Amazon",
          "Microsoft",
          "Meta"
        ]
      },
      {
        "id": "striver-q-210",
        "stepNumber": 9,
        "stepName": "Step 9: Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]",
        "qno": 210,
        "title": "Prefix to Postfix Conversion",
        "difficulty": "Easy",
        "youtube_url": "https://youtu.be/4pIc9UBHJtk?si=0pWtyDC1GhbiYP3P",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Prefix+to+Postfix+Conversion",
        "article_url": "https://takeuforward.org/?s=Prefix+to+Postfix+Conversion",
        "companies": [
          "Google",
          "Apple",
          "Uber"
        ]
      },
      {
        "id": "striver-q-211",
        "stepNumber": 9,
        "stepName": "Step 9: Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]",
        "qno": 211,
        "title": "Postfix to Prefix Conversion",
        "difficulty": "Easy",
        "youtube_url": "https://youtu.be/4pIc9UBHJtk?si=0pWtyDC1GhbiYP3P",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Postfix+to+Prefix+Conversion",
        "article_url": "https://takeuforward.org/?s=Postfix+to+Prefix+Conversion",
        "companies": [
          "Microsoft",
          "Goldman Sachs",
          "Amazon"
        ]
      },
      {
        "id": "striver-q-212",
        "stepNumber": 9,
        "stepName": "Step 9: Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]",
        "qno": 212,
        "title": "Postfix to Infix",
        "difficulty": "Easy",
        "youtube_url": "https://youtu.be/4pIc9UBHJtk?si=0pWtyDC1GhbiYP3P",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Postfix+to+Infix",
        "article_url": "https://takeuforward.org/?s=Postfix+to+Infix",
        "companies": [
          "Meta",
          "Google",
          "Bloomberg"
        ]
      },
      {
        "id": "striver-q-213",
        "stepNumber": 9,
        "stepName": "Step 9: Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]",
        "qno": 213,
        "title": "Convert Infix To Prefix Notation",
        "difficulty": "Easy",
        "youtube_url": "https://youtu.be/4pIc9UBHJtk?si=0pWtyDC1GhbiYP3P",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Convert+Infix+To+Prefix+Notation",
        "article_url": "https://takeuforward.org/?s=Convert+Infix+To+Prefix+Notation",
        "companies": [
          "Amazon",
          "Adobe",
          "Flipkart"
        ]
      },
      {
        "id": "striver-q-214",
        "stepNumber": 9,
        "stepName": "Step 9: Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]",
        "qno": 214,
        "title": "Next Greater Element",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/e7XQLtOQM3I?si=QdcHpTtx6gAHsext",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Next+Greater+Element",
        "article_url": "https://takeuforward.org/?s=Next+Greater+Element",
        "companies": [
          "Google",
          "Microsoft",
          "Uber"
        ]
      },
      {
        "id": "striver-q-215",
        "stepNumber": 9,
        "stepName": "Step 9: Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]",
        "qno": 215,
        "title": "Next Greater Element 2",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/7PrncD7v9YQ?si=UkBc7eVy9HGlBpeW",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Next+Greater+Element+2",
        "article_url": "https://takeuforward.org/?s=Next+Greater+Element+2",
        "companies": [
          "Apple",
          "Amazon",
          "Netflix"
        ]
      },
      {
        "id": "striver-q-216",
        "stepNumber": 9,
        "stepName": "Step 9: Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]",
        "qno": 216,
        "title": "Next Smaller Element",
        "difficulty": "Easy",
        "youtube_url": null,
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Next+Smaller+Element",
        "article_url": "https://takeuforward.org/?s=Next+Smaller+Element",
        "companies": [
          "Google",
          "Amazon",
          "Microsoft"
        ]
      },
      {
        "id": "striver-q-217",
        "stepNumber": 9,
        "stepName": "Step 9: Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]",
        "qno": 217,
        "title": "Number of NGEs to the right",
        "difficulty": "Easy",
        "youtube_url": null,
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Number+of+NGEs+to+the+right",
        "article_url": "https://takeuforward.org/?s=Number+of+NGEs+to+the+right",
        "companies": [
          "Amazon",
          "Microsoft",
          "Meta"
        ]
      },
      {
        "id": "striver-q-218",
        "stepNumber": 9,
        "stepName": "Step 9: Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]",
        "qno": 218,
        "title": "Trapping Rainwater",
        "difficulty": "Hard",
        "youtube_url": "https://youtu.be/1_5VuquLbXg?si=NFG6df318_6OtGvg",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Trapping+Rainwater",
        "article_url": "https://takeuforward.org/?s=Trapping+Rainwater",
        "companies": [
          "Google",
          "Apple",
          "Uber"
        ]
      },
      {
        "id": "striver-q-219",
        "stepNumber": 9,
        "stepName": "Step 9: Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]",
        "qno": 219,
        "title": "Sum of subarray minimum",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/v0e8p9JCgRc?si=XAU7ekECgS5nboRw",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Sum+of+subarray+minimum",
        "article_url": "https://takeuforward.org/?s=Sum+of+subarray+minimum",
        "companies": [
          "Microsoft",
          "Goldman Sachs",
          "Amazon"
        ]
      },
      {
        "id": "striver-q-220",
        "stepNumber": 9,
        "stepName": "Step 9: Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]",
        "qno": 220,
        "title": "Asteroid Collision",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/_eYGqw_VDR4?si=YyxibcHq800RqgIQ",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Asteroid+Collision",
        "article_url": "https://takeuforward.org/?s=Asteroid+Collision",
        "companies": [
          "Meta",
          "Google",
          "Bloomberg"
        ]
      },
      {
        "id": "striver-q-221",
        "stepNumber": 9,
        "stepName": "Step 9: Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]",
        "qno": 221,
        "title": "Sum of subarray ranges",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/gIrMptNPf5M?si=Q_GHuBvzZVs27X_U",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Sum+of+subarray+ranges",
        "article_url": "https://takeuforward.org/?s=Sum+of+subarray+ranges",
        "companies": [
          "Amazon",
          "Adobe",
          "Flipkart"
        ]
      },
      {
        "id": "striver-q-222",
        "stepNumber": 9,
        "stepName": "Step 9: Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]",
        "qno": 222,
        "title": "Remove k Digits",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/jmbuRzYPGrg?si=WN387gwQ7aXWkUao",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Remove+k+Digits",
        "article_url": "https://takeuforward.org/?s=Remove+k+Digits",
        "companies": [
          "Google",
          "Microsoft",
          "Uber"
        ]
      },
      {
        "id": "striver-q-223",
        "stepNumber": 9,
        "stepName": "Step 9: Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]",
        "qno": 223,
        "title": "Largest rectangle in a histogram",
        "difficulty": "Hard",
        "youtube_url": "https://youtu.be/Bzat9vgD0fs?si=DiBlLejXcr6EJoyB",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Largest+rectangle+in+a+histogram",
        "article_url": "https://takeuforward.org/?s=Largest+rectangle+in+a+histogram",
        "companies": [
          "Apple",
          "Amazon",
          "Netflix"
        ]
      },
      {
        "id": "striver-q-224",
        "stepNumber": 9,
        "stepName": "Step 9: Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]",
        "qno": 224,
        "title": "Maximal Rectangles",
        "difficulty": "Hard",
        "youtube_url": "https://youtu.be/ttVu6G7Ayik?si=RhyeKepNwjRUYp7A",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Maximal+Rectangles",
        "article_url": "https://takeuforward.org/?s=Maximal+Rectangles",
        "companies": [
          "Google",
          "Amazon",
          "Microsoft"
        ]
      },
      {
        "id": "striver-q-225",
        "stepNumber": 9,
        "stepName": "Step 9: Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]",
        "qno": 225,
        "title": "Sliding Window maximum",
        "difficulty": "Hard",
        "youtube_url": "https://youtu.be/NwBvene4Imo?si=eU1PY-bcQfk5wdog",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Sliding+Window+maximum",
        "article_url": "https://takeuforward.org/?s=Sliding+Window+maximum",
        "companies": [
          "Amazon",
          "Microsoft",
          "Meta"
        ]
      },
      {
        "id": "striver-q-226",
        "stepNumber": 9,
        "stepName": "Step 9: Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]",
        "qno": 226,
        "title": "Stock span problem",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/eay-zoSRkVc?si=deNNe5i38BOAntha",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Stock+span+problem",
        "article_url": "https://takeuforward.org/?s=Stock+span+problem",
        "companies": [
          "Google",
          "Apple",
          "Uber"
        ]
      },
      {
        "id": "striver-q-227",
        "stepNumber": 9,
        "stepName": "Step 9: Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]",
        "qno": 227,
        "title": "The Celebrity Problem",
        "difficulty": "Hard",
        "youtube_url": "https://youtu.be/cEadsbTeze4?si=olXYfOs7l-SEn2zl",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=The+Celebrity+Problem",
        "article_url": "https://takeuforward.org/?s=The+Celebrity+Problem",
        "companies": [
          "Microsoft",
          "Goldman Sachs",
          "Amazon"
        ]
      },
      {
        "id": "striver-q-228",
        "stepNumber": 9,
        "stepName": "Step 9: Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]",
        "qno": 228,
        "title": "LRU cache (IMPORTANT)",
        "difficulty": "Hard",
        "youtube_url": "https://youtu.be/z9bJUPxzFOw?si=IUo_d35rXBD0CBAF",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=LRU+cache",
        "article_url": "https://takeuforward.org/?s=LRU+cache",
        "companies": [
          "Meta",
          "Google",
          "Bloomberg"
        ]
      },
      {
        "id": "striver-q-229",
        "stepNumber": 9,
        "stepName": "Step 9: Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]",
        "qno": 229,
        "title": "LFU cache",
        "difficulty": "Hard",
        "youtube_url": "https://www.youtube.com/watch?v=0PSB9y8ehbk&list=PLgUwDviBIf0p4ozDR_kJJkONnb1wdx2Ma&index=79",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=LFU+cache",
        "article_url": "https://takeuforward.org/?s=LFU+cache",
        "companies": [
          "Amazon",
          "Adobe",
          "Flipkart"
        ]
      }
    ]
  },
  {
    "id": "step-10",
    "stepNumber": 10,
    "title": "Step 10: Sliding Window & Two Pointer Combined Problems",
    "stepRange": "Q230 - Q241",
    "description": "12 curated problems covering Sliding Window & Two Pointer Combined Problems",
    "problems": [
      {
        "id": "striver-q-230",
        "stepNumber": 10,
        "stepName": "Step 10: Sliding Window & Two Pointer Combined Problems",
        "qno": 230,
        "title": "Longest Substring Without Repeating Characters",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/-zSxTJkcdAo?si=I2zfR-vlDMg0zU9z",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Longest+Substring+Without+Repeating+Characters",
        "article_url": "https://takeuforward.org/?s=Longest+Substring+Without+Repeating+Characters",
        "companies": [
          "Google",
          "Microsoft",
          "Uber"
        ]
      },
      {
        "id": "striver-q-231",
        "stepNumber": 10,
        "stepName": "Step 10: Sliding Window & Two Pointer Combined Problems",
        "qno": 231,
        "title": "Max Consecutive Ones III",
        "difficulty": "Easy",
        "youtube_url": "https://youtu.be/3E4JBHSLpYk?si=SoOW64pP6otEKxBw",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Max+Consecutive+Ones+III",
        "article_url": "https://takeuforward.org/?s=Max+Consecutive+Ones+III",
        "companies": [
          "Apple",
          "Amazon",
          "Netflix"
        ]
      },
      {
        "id": "striver-q-232",
        "stepNumber": 10,
        "stepName": "Step 10: Sliding Window & Two Pointer Combined Problems",
        "qno": 232,
        "title": "Fruit Into Baskets",
        "difficulty": "Easy",
        "youtube_url": "https://youtu.be/e3bs0uA1NhQ?si=gR8pO62u-nJeFAXk",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Fruit+Into+Baskets",
        "article_url": "https://takeuforward.org/?s=Fruit+Into+Baskets",
        "companies": [
          "Google",
          "Amazon",
          "Microsoft"
        ]
      },
      {
        "id": "striver-q-233",
        "stepNumber": 10,
        "stepName": "Step 10: Sliding Window & Two Pointer Combined Problems",
        "qno": 233,
        "title": "longest repeating character replacement",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/_eNhaDCr6P0?si=pBWcEjozF5poom0p",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=longest+repeating+character+replacement",
        "article_url": "https://takeuforward.org/?s=longest+repeating+character+replacement",
        "companies": [
          "Amazon",
          "Microsoft",
          "Meta"
        ]
      },
      {
        "id": "striver-q-234",
        "stepNumber": 10,
        "stepName": "Step 10: Sliding Window & Two Pointer Combined Problems",
        "qno": 234,
        "title": "Binary subarray with sum",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/XnMdNUkX6VM?si=Nyt8EveeLUg8lmty",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Binary+subarray+with+sum",
        "article_url": "https://takeuforward.org/?s=Binary+subarray+with+sum",
        "companies": [
          "Google",
          "Apple",
          "Uber"
        ]
      },
      {
        "id": "striver-q-235",
        "stepNumber": 10,
        "stepName": "Step 10: Sliding Window & Two Pointer Combined Problems",
        "qno": 235,
        "title": "Count number of nice subarrays",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/j_QOv9OT9Og?si=Oq5-5hyFkzVSOZpP",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Count+number+of+nice+subarrays",
        "article_url": "https://takeuforward.org/?s=Count+number+of+nice+subarrays",
        "companies": [
          "Microsoft",
          "Goldman Sachs",
          "Amazon"
        ]
      },
      {
        "id": "striver-q-236",
        "stepNumber": 10,
        "stepName": "Step 10: Sliding Window & Two Pointer Combined Problems",
        "qno": 236,
        "title": "Number of substring containing all three characters",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/xtqN4qlgr8s?si=kuaLHVOLXhh5Z2tW",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Number+of+substring+containing+all+three+characters",
        "article_url": "https://takeuforward.org/?s=Number+of+substring+containing+all+three+characters",
        "companies": [
          "Meta",
          "Google",
          "Bloomberg"
        ]
      },
      {
        "id": "striver-q-237",
        "stepNumber": 10,
        "stepName": "Step 10: Sliding Window & Two Pointer Combined Problems",
        "qno": 237,
        "title": "Maximum point you can obtain from cards",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/pBWCOCS636U?si=-X64rY67noxvOwrG",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Maximum+point+you+can+obtain+from+cards",
        "article_url": "https://takeuforward.org/?s=Maximum+point+you+can+obtain+from+cards",
        "companies": [
          "Amazon",
          "Adobe",
          "Flipkart"
        ]
      },
      {
        "id": "striver-q-238",
        "stepNumber": 10,
        "stepName": "Step 10: Sliding Window & Two Pointer Combined Problems",
        "qno": 238,
        "title": "Longest Substring with At Most K Distinct Characters",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/teM9ZsVRQyc?si=Kh0_u6aCkkBU3Q33",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Longest+Substring+with+At+Most+K+Distinct+Characters",
        "article_url": "https://takeuforward.org/?s=Longest+Substring+with+At+Most+K+Distinct+Characters",
        "companies": [
          "Google",
          "Microsoft",
          "Uber"
        ]
      },
      {
        "id": "striver-q-239",
        "stepNumber": 10,
        "stepName": "Step 10: Sliding Window & Two Pointer Combined Problems",
        "qno": 239,
        "title": "Subarray with k different integers",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/7wYGbV_LsX4?si=KWa48RgLDCvdNqRb",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Subarray+with+k+different+integers",
        "article_url": "https://takeuforward.org/?s=Subarray+with+k+different+integers",
        "companies": [
          "Apple",
          "Amazon",
          "Netflix"
        ]
      },
      {
        "id": "striver-q-240",
        "stepNumber": 10,
        "stepName": "Step 10: Sliding Window & Two Pointer Combined Problems",
        "qno": 240,
        "title": "Minimum Window Substring",
        "difficulty": "Hard",
        "youtube_url": "https://youtu.be/WJaij9ffOIY?si=-xnsWIH84zWU0ICd",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Minimum+Window+Substring",
        "article_url": "https://takeuforward.org/?s=Minimum+Window+Substring",
        "companies": [
          "Google",
          "Amazon",
          "Microsoft"
        ]
      },
      {
        "id": "striver-q-241",
        "stepNumber": 10,
        "stepName": "Step 10: Sliding Window & Two Pointer Combined Problems",
        "qno": 241,
        "title": "Minimum Window Subsequence",
        "difficulty": "Hard",
        "youtube_url": null,
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Minimum+Window+Subsequence",
        "article_url": "https://takeuforward.org/?s=Minimum+Window+Subsequence",
        "companies": [
          "Amazon",
          "Microsoft",
          "Meta"
        ]
      }
    ]
  },
  {
    "id": "step-11",
    "stepNumber": 11,
    "title": "Step 11: Heaps [Learning, Medium, Hard Problems]",
    "stepRange": "Q242 - Q258",
    "description": "17 curated problems covering Heaps [Learning, Medium, Hard Problems]",
    "problems": [
      {
        "id": "striver-q-242",
        "stepNumber": 11,
        "stepName": "Step 11: Heaps [Learning, Medium, Hard Problems]",
        "qno": 242,
        "title": "Introduction to Priority Queues using Binary Heaps",
        "difficulty": "Easy",
        "youtube_url": null,
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Introduction+to+Priority+Queues+using+Binary+Heaps",
        "article_url": "https://takeuforward.org/?s=Introduction+to+Priority+Queues+using+Binary+Heaps",
        "companies": [
          "Google",
          "Apple",
          "Uber"
        ]
      },
      {
        "id": "striver-q-243",
        "stepNumber": 11,
        "stepName": "Step 11: Heaps [Learning, Medium, Hard Problems]",
        "qno": 243,
        "title": "Min Heap and Max Heap Implementation",
        "difficulty": "Easy",
        "youtube_url": null,
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Min+Heap+and+Max+Heap+Implementation",
        "article_url": "https://takeuforward.org/?s=Min+Heap+and+Max+Heap+Implementation",
        "companies": [
          "Microsoft",
          "Goldman Sachs",
          "Amazon"
        ]
      },
      {
        "id": "striver-q-244",
        "stepNumber": 11,
        "stepName": "Step 11: Heaps [Learning, Medium, Hard Problems]",
        "qno": 244,
        "title": "Check if an array represents a min-heap or not",
        "difficulty": "Easy",
        "youtube_url": null,
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Check+if+an+array+represents+a+min-heap+or+not",
        "article_url": "https://takeuforward.org/?s=Check+if+an+array+represents+a+min-heap+or+not",
        "companies": [
          "Meta",
          "Google",
          "Bloomberg"
        ]
      },
      {
        "id": "striver-q-245",
        "stepNumber": 11,
        "stepName": "Step 11: Heaps [Learning, Medium, Hard Problems]",
        "qno": 245,
        "title": "Convert min Heap to max Heap",
        "difficulty": "Medium",
        "youtube_url": null,
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Convert+min+Heap+to+max+Heap",
        "article_url": "https://takeuforward.org/?s=Convert+min+Heap+to+max+Heap",
        "companies": [
          "Amazon",
          "Adobe",
          "Flipkart"
        ]
      },
      {
        "id": "striver-q-246",
        "stepNumber": 11,
        "stepName": "Step 11: Heaps [Learning, Medium, Hard Problems]",
        "qno": 246,
        "title": "Kth largest element in an array [use priority queue]",
        "difficulty": "Medium",
        "youtube_url": null,
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Kth+largest+element+in+an+array",
        "article_url": "https://takeuforward.org/?s=Kth+largest+element+in+an+array",
        "companies": [
          "Google",
          "Microsoft",
          "Uber"
        ]
      },
      {
        "id": "striver-q-247",
        "stepNumber": 11,
        "stepName": "Step 11: Heaps [Learning, Medium, Hard Problems]",
        "qno": 247,
        "title": "Kth smallest element in an array [use priority queue]",
        "difficulty": "Medium",
        "youtube_url": null,
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Kth+smallest+element+in+an+array",
        "article_url": "https://takeuforward.org/?s=Kth+smallest+element+in+an+array",
        "companies": [
          "Apple",
          "Amazon",
          "Netflix"
        ]
      },
      {
        "id": "striver-q-248",
        "stepNumber": 11,
        "stepName": "Step 11: Heaps [Learning, Medium, Hard Problems]",
        "qno": 248,
        "title": "Sort K sorted array",
        "difficulty": "Medium",
        "youtube_url": null,
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Sort+K+sorted+array",
        "article_url": "https://takeuforward.org/?s=Sort+K+sorted+array",
        "companies": [
          "Google",
          "Amazon",
          "Microsoft"
        ]
      },
      {
        "id": "striver-q-249",
        "stepNumber": 11,
        "stepName": "Step 11: Heaps [Learning, Medium, Hard Problems]",
        "qno": 249,
        "title": "Merge M sorted Lists",
        "difficulty": "Medium",
        "youtube_url": null,
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Merge+M+sorted+Lists",
        "article_url": "https://takeuforward.org/?s=Merge+M+sorted+Lists",
        "companies": [
          "Amazon",
          "Microsoft",
          "Meta"
        ]
      },
      {
        "id": "striver-q-250",
        "stepNumber": 11,
        "stepName": "Step 11: Heaps [Learning, Medium, Hard Problems]",
        "qno": 250,
        "title": "Replace each array element by its corresponding rank",
        "difficulty": "Medium",
        "youtube_url": null,
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Replace+each+array+element+by+its+corresponding+rank",
        "article_url": "https://takeuforward.org/?s=Replace+each+array+element+by+its+corresponding+rank",
        "companies": [
          "Google",
          "Apple",
          "Uber"
        ]
      },
      {
        "id": "striver-q-251",
        "stepNumber": 11,
        "stepName": "Step 11: Heaps [Learning, Medium, Hard Problems]",
        "qno": 251,
        "title": "Task Scheduler",
        "difficulty": "Medium",
        "youtube_url": null,
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Task+Scheduler",
        "article_url": "https://takeuforward.org/?s=Task+Scheduler",
        "companies": [
          "Microsoft",
          "Goldman Sachs",
          "Amazon"
        ]
      },
      {
        "id": "striver-q-252",
        "stepNumber": 11,
        "stepName": "Step 11: Heaps [Learning, Medium, Hard Problems]",
        "qno": 252,
        "title": "Hands of Straights",
        "difficulty": "Medium",
        "youtube_url": null,
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Hands+of+Straights",
        "article_url": "https://takeuforward.org/?s=Hands+of+Straights",
        "companies": [
          "Meta",
          "Google",
          "Bloomberg"
        ]
      },
      {
        "id": "striver-q-253",
        "stepNumber": 11,
        "stepName": "Step 11: Heaps [Learning, Medium, Hard Problems]",
        "qno": 253,
        "title": "Design twitter",
        "difficulty": "Medium",
        "youtube_url": null,
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Design+twitter",
        "article_url": "https://takeuforward.org/?s=Design+twitter",
        "companies": [
          "Amazon",
          "Adobe",
          "Flipkart"
        ]
      },
      {
        "id": "striver-q-254",
        "stepNumber": 11,
        "stepName": "Step 11: Heaps [Learning, Medium, Hard Problems]",
        "qno": 254,
        "title": "Connect `n` ropes with minimal cost",
        "difficulty": "Hard",
        "youtube_url": null,
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Connect+`n`+ropes+with+minimal+cost",
        "article_url": "https://takeuforward.org/?s=Connect+`n`+ropes+with+minimal+cost",
        "companies": [
          "Google",
          "Microsoft",
          "Uber"
        ]
      },
      {
        "id": "striver-q-255",
        "stepNumber": 11,
        "stepName": "Step 11: Heaps [Learning, Medium, Hard Problems]",
        "qno": 255,
        "title": "Kth largest element in a stream of running integers",
        "difficulty": "Medium",
        "youtube_url": null,
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Kth+largest+element+in+a+stream+of+running+integers",
        "article_url": "https://takeuforward.org/?s=Kth+largest+element+in+a+stream+of+running+integers",
        "companies": [
          "Apple",
          "Amazon",
          "Netflix"
        ]
      },
      {
        "id": "striver-q-256",
        "stepNumber": 11,
        "stepName": "Step 11: Heaps [Learning, Medium, Hard Problems]",
        "qno": 256,
        "title": "Maximum Sum Combination",
        "difficulty": "Hard",
        "youtube_url": null,
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Maximum+Sum+Combination",
        "article_url": "https://takeuforward.org/?s=Maximum+Sum+Combination",
        "companies": [
          "Google",
          "Amazon",
          "Microsoft"
        ]
      },
      {
        "id": "striver-q-257",
        "stepNumber": 11,
        "stepName": "Step 11: Heaps [Learning, Medium, Hard Problems]",
        "qno": 257,
        "title": "Find Median from Data Stream",
        "difficulty": "Hard",
        "youtube_url": null,
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Find+Median+from+Data+Stream",
        "article_url": "https://takeuforward.org/?s=Find+Median+from+Data+Stream",
        "companies": [
          "Amazon",
          "Microsoft",
          "Meta"
        ]
      },
      {
        "id": "striver-q-258",
        "stepNumber": 11,
        "stepName": "Step 11: Heaps [Learning, Medium, Hard Problems]",
        "qno": 258,
        "title": "K most frequent elements",
        "difficulty": "Medium",
        "youtube_url": null,
        "leetcode_url": "https://leetcode.com/problemset/all/?search=K+most+frequent+elements",
        "article_url": "https://takeuforward.org/?s=K+most+frequent+elements",
        "companies": [
          "Google",
          "Apple",
          "Uber"
        ]
      }
    ]
  },
  {
    "id": "step-12",
    "stepNumber": 12,
    "title": "Step 12: Greedy Algorithms [Easy, Medium/Hard]",
    "stepRange": "Q259 - Q274",
    "description": "16 curated problems covering Greedy Algorithms [Easy, Medium/Hard]",
    "problems": [
      {
        "id": "striver-q-259",
        "stepNumber": 12,
        "stepName": "Step 12: Greedy Algorithms [Easy, Medium/Hard]",
        "qno": 259,
        "title": "Assign Cookies",
        "difficulty": "Easy",
        "youtube_url": "https://youtu.be/DIX2p7vb9co?si=GofAIDimue-Av0Fi",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Assign+Cookies",
        "article_url": "https://takeuforward.org/?s=Assign+Cookies",
        "companies": [
          "Microsoft",
          "Goldman Sachs",
          "Amazon"
        ]
      },
      {
        "id": "striver-q-260",
        "stepNumber": 12,
        "stepName": "Step 12: Greedy Algorithms [Easy, Medium/Hard]",
        "qno": 260,
        "title": "Fractional Knapsack Problem",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/1ibsQrnuEEg?si=8R2By3wpHo0zZVHE",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Fractional+Knapsack+Problem",
        "article_url": "https://takeuforward.org/?s=Fractional+Knapsack+Problem",
        "companies": [
          "Meta",
          "Google",
          "Bloomberg"
        ]
      },
      {
        "id": "striver-q-261",
        "stepNumber": 12,
        "stepName": "Step 12: Greedy Algorithms [Easy, Medium/Hard]",
        "qno": 261,
        "title": "Greedy algorithm to find minimum number of coins",
        "difficulty": "Medium",
        "youtube_url": "https://www.youtube.com/watch?v=mVg9CfJvayM&list=PLgUwDviBIf0p4ozDR_kJJkONnb1wdx2Ma&index=48",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Greedy+algorithm+to+find+minimum+number+of+coins",
        "article_url": "https://takeuforward.org/?s=Greedy+algorithm+to+find+minimum+number+of+coins",
        "companies": [
          "Amazon",
          "Adobe",
          "Flipkart"
        ]
      },
      {
        "id": "striver-q-262",
        "stepNumber": 12,
        "stepName": "Step 12: Greedy Algorithms [Easy, Medium/Hard]",
        "qno": 262,
        "title": "Lemonade Change",
        "difficulty": "Easy",
        "youtube_url": "https://youtu.be/n_tmibEhO6Q?si=q1NW8MfPy0QU6fIl",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Lemonade+Change",
        "article_url": "https://takeuforward.org/?s=Lemonade+Change",
        "companies": [
          "Google",
          "Microsoft",
          "Uber"
        ]
      },
      {
        "id": "striver-q-263",
        "stepNumber": 12,
        "stepName": "Step 12: Greedy Algorithms [Easy, Medium/Hard]",
        "qno": 263,
        "title": "Valid Paranthesis Checker",
        "difficulty": "Easy",
        "youtube_url": "https://youtu.be/cHT6sG_hUZI?si=XRHeyh7jOaLaTy3g",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Valid+Paranthesis+Checker",
        "article_url": "https://takeuforward.org/?s=Valid+Paranthesis+Checker",
        "companies": [
          "Apple",
          "Amazon",
          "Netflix"
        ]
      },
      {
        "id": "striver-q-264",
        "stepNumber": 12,
        "stepName": "Step 12: Greedy Algorithms [Easy, Medium/Hard]",
        "qno": 264,
        "title": "N meetings in one room",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/mKfhTotEguk?si=2RELeq18mpmIIN3Q",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=N+meetings+in+one+room",
        "article_url": "https://takeuforward.org/?s=N+meetings+in+one+room",
        "companies": [
          "Google",
          "Amazon",
          "Microsoft"
        ]
      },
      {
        "id": "striver-q-265",
        "stepNumber": 12,
        "stepName": "Step 12: Greedy Algorithms [Easy, Medium/Hard]",
        "qno": 265,
        "title": "Jump Game",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/tZAa_jJ3SwQ?si=voKd7n9VTLDRRNzJ",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Jump+Game",
        "article_url": "https://takeuforward.org/?s=Jump+Game",
        "companies": [
          "Amazon",
          "Microsoft",
          "Meta"
        ]
      },
      {
        "id": "striver-q-266",
        "stepNumber": 12,
        "stepName": "Step 12: Greedy Algorithms [Easy, Medium/Hard]",
        "qno": 266,
        "title": "Jump Game 2",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/7SBVnw7GSTk?si=9uUouBELh9K3m2jZ",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Jump+Game+2",
        "article_url": "https://takeuforward.org/?s=Jump+Game+2",
        "companies": [
          "Google",
          "Apple",
          "Uber"
        ]
      },
      {
        "id": "striver-q-267",
        "stepNumber": 12,
        "stepName": "Step 12: Greedy Algorithms [Easy, Medium/Hard]",
        "qno": 267,
        "title": "Minimum number of platforms required for a railway",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/AsGzwR_FWok?si=165acXU_dtqOHuo9",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Minimum+number+of+platforms+required+for+a+railway",
        "article_url": "https://takeuforward.org/?s=Minimum+number+of+platforms+required+for+a+railway",
        "companies": [
          "Microsoft",
          "Goldman Sachs",
          "Amazon"
        ]
      },
      {
        "id": "striver-q-268",
        "stepNumber": 12,
        "stepName": "Step 12: Greedy Algorithms [Easy, Medium/Hard]",
        "qno": 268,
        "title": "Job sequencing Problem",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/QbwltemZbRg?si=wvcemJ5BLPlTRmkG",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Job+sequencing+Problem",
        "article_url": "https://takeuforward.org/?s=Job+sequencing+Problem",
        "companies": [
          "Meta",
          "Google",
          "Bloomberg"
        ]
      },
      {
        "id": "striver-q-269",
        "stepNumber": 12,
        "stepName": "Step 12: Greedy Algorithms [Easy, Medium/Hard]",
        "qno": 269,
        "title": "Candy",
        "difficulty": "Hard",
        "youtube_url": "https://youtu.be/IIqVFvKE6RY?si=EjmuXZJNLQLUkEd7",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Candy",
        "article_url": "https://takeuforward.org/?s=Candy",
        "companies": [
          "Amazon",
          "Adobe",
          "Flipkart"
        ]
      },
      {
        "id": "striver-q-270",
        "stepNumber": 12,
        "stepName": "Step 12: Greedy Algorithms [Easy, Medium/Hard]",
        "qno": 270,
        "title": "Program for Shortest Job First (or SJF) CPU Scheduling",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/3-QbX1iDbXs?si=IH8QZUblr01F7UoQ",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Program+for+Shortest+Job+First++CPU+Scheduling",
        "article_url": "https://takeuforward.org/?s=Program+for+Shortest+Job+First++CPU+Scheduling",
        "companies": [
          "Google",
          "Microsoft",
          "Uber"
        ]
      },
      {
        "id": "striver-q-271",
        "stepNumber": 12,
        "stepName": "Step 12: Greedy Algorithms [Easy, Medium/Hard]",
        "qno": 271,
        "title": "Program for Least Recently Used (LRU) Page Replacement Algorithm",
        "difficulty": "Medium",
        "youtube_url": null,
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Program+for+Least+Recently+Used++Page+Replacement+Algorithm",
        "article_url": "https://takeuforward.org/?s=Program+for+Least+Recently+Used++Page+Replacement+Algorithm",
        "companies": [
          "Apple",
          "Amazon",
          "Netflix"
        ]
      },
      {
        "id": "striver-q-272",
        "stepNumber": 12,
        "stepName": "Step 12: Greedy Algorithms [Easy, Medium/Hard]",
        "qno": 272,
        "title": "Insert Interval",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/xxRE-46OCC8?si=a7aPuIw16zDx2lAa",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Insert+Interval",
        "article_url": "https://takeuforward.org/?s=Insert+Interval",
        "companies": [
          "Google",
          "Amazon",
          "Microsoft"
        ]
      },
      {
        "id": "striver-q-273",
        "stepNumber": 12,
        "stepName": "Step 12: Greedy Algorithms [Easy, Medium/Hard]",
        "qno": 273,
        "title": "Merge Intervals",
        "difficulty": "Medium",
        "youtube_url": "https://www.youtube.com/watch?v=2JzRBPFYbKE&list=PLgUwDviBIf0rPG3Ictpu74YWBQ1CaBkm2&index=6",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Merge+Intervals",
        "article_url": "https://takeuforward.org/?s=Merge+Intervals",
        "companies": [
          "Amazon",
          "Microsoft",
          "Meta"
        ]
      },
      {
        "id": "striver-q-274",
        "stepNumber": 12,
        "stepName": "Step 12: Greedy Algorithms [Easy, Medium/Hard]",
        "qno": 274,
        "title": "Non-overlapping Intervals",
        "difficulty": "Hard",
        "youtube_url": "https://youtu.be/HDHQ8lAWakY?si=JVtLqboGdpUTOVjf",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Non-overlapping+Intervals",
        "article_url": "https://takeuforward.org/?s=Non-overlapping+Intervals",
        "companies": [
          "Google",
          "Apple",
          "Uber"
        ]
      }
    ]
  },
  {
    "id": "step-13",
    "stepNumber": 13,
    "title": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
    "stepRange": "Q275 - Q313",
    "description": "39 curated problems covering Binary Trees [Traversals, Medium and Hard Problems]",
    "problems": [
      {
        "id": "striver-q-275",
        "stepNumber": 13,
        "stepName": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
        "qno": 275,
        "title": "Introduction to Trees",
        "difficulty": "Easy",
        "youtube_url": "https://youtu.be/_ANrF3FJm7I",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Introduction+to+Trees",
        "article_url": "https://takeuforward.org/?s=Introduction+to+Trees",
        "companies": [
          "Microsoft",
          "Goldman Sachs",
          "Amazon"
        ]
      },
      {
        "id": "striver-q-276",
        "stepNumber": 13,
        "stepName": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
        "qno": 276,
        "title": "Binary Tree Representation in C++",
        "difficulty": "Easy",
        "youtube_url": "https://youtu.be/ctCpP0RFDFc",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Binary+Tree+Representation+in+C++",
        "article_url": "https://takeuforward.org/?s=Binary+Tree+Representation+in+C++",
        "companies": [
          "Meta",
          "Google",
          "Bloomberg"
        ]
      },
      {
        "id": "striver-q-277",
        "stepNumber": 13,
        "stepName": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
        "qno": 277,
        "title": "Binary Tree Representation in Java",
        "difficulty": "Easy",
        "youtube_url": "https://youtu.be/hyLyW7rP24I",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Binary+Tree+Representation+in+Java",
        "article_url": "https://takeuforward.org/?s=Binary+Tree+Representation+in+Java",
        "companies": [
          "Amazon",
          "Adobe",
          "Flipkart"
        ]
      },
      {
        "id": "striver-q-278",
        "stepNumber": 13,
        "stepName": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
        "qno": 278,
        "title": "Binary Tree Traversals in Binary Tree",
        "difficulty": "Easy",
        "youtube_url": "https://youtu.be/jmy0LaGET1I",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Binary+Tree+Traversals+in+Binary+Tree",
        "article_url": "https://takeuforward.org/?s=Binary+Tree+Traversals+in+Binary+Tree",
        "companies": [
          "Google",
          "Microsoft",
          "Uber"
        ]
      },
      {
        "id": "striver-q-279",
        "stepNumber": 13,
        "stepName": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
        "qno": 279,
        "title": "Preorder Traversal of Binary Tree",
        "difficulty": "Easy",
        "youtube_url": "https://youtu.be/RlUu72JrOCQ",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Preorder+Traversal+of+Binary+Tree",
        "article_url": "https://takeuforward.org/?s=Preorder+Traversal+of+Binary+Tree",
        "companies": [
          "Apple",
          "Amazon",
          "Netflix"
        ]
      },
      {
        "id": "striver-q-280",
        "stepNumber": 13,
        "stepName": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
        "qno": 280,
        "title": "Inorder Traversal of Binary Tree",
        "difficulty": "Easy",
        "youtube_url": "https://youtu.be/Z_NEgBgbRVI",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Inorder+Traversal+of+Binary+Tree",
        "article_url": "https://takeuforward.org/?s=Inorder+Traversal+of+Binary+Tree",
        "companies": [
          "Google",
          "Amazon",
          "Microsoft"
        ]
      },
      {
        "id": "striver-q-281",
        "stepNumber": 13,
        "stepName": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
        "qno": 281,
        "title": "Post-order Traversal of Binary Tree",
        "difficulty": "Easy",
        "youtube_url": "https://youtu.be/COQOU6klsBg",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Post-order+Traversal+of+Binary+Tree",
        "article_url": "https://takeuforward.org/?s=Post-order+Traversal+of+Binary+Tree",
        "companies": [
          "Amazon",
          "Microsoft",
          "Meta"
        ]
      },
      {
        "id": "striver-q-282",
        "stepNumber": 13,
        "stepName": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
        "qno": 282,
        "title": "Level order Traversal / Level order traversal in spiral form",
        "difficulty": "Easy",
        "youtube_url": "https://youtu.be/EoAsWbO7sqg",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Level+order+Traversal+/+Level+order+traversal+in+spiral+form",
        "article_url": "https://takeuforward.org/?s=Level+order+Traversal+/+Level+order+traversal+in+spiral+form",
        "companies": [
          "Google",
          "Apple",
          "Uber"
        ]
      },
      {
        "id": "striver-q-283",
        "stepNumber": 13,
        "stepName": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
        "qno": 283,
        "title": "Iterative Preorder Traversal of Binary Tree",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/Bfqd8BsPVuw",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Iterative+Preorder+Traversal+of+Binary+Tree",
        "article_url": "https://takeuforward.org/?s=Iterative+Preorder+Traversal+of+Binary+Tree",
        "companies": [
          "Microsoft",
          "Goldman Sachs",
          "Amazon"
        ]
      },
      {
        "id": "striver-q-284",
        "stepNumber": 13,
        "stepName": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
        "qno": 284,
        "title": "Iterative Inorder Traversal of Binary Tree",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/lxTGsVXjwvM",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Iterative+Inorder+Traversal+of+Binary+Tree",
        "article_url": "https://takeuforward.org/?s=Iterative+Inorder+Traversal+of+Binary+Tree",
        "companies": [
          "Meta",
          "Google",
          "Bloomberg"
        ]
      },
      {
        "id": "striver-q-285",
        "stepNumber": 13,
        "stepName": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
        "qno": 285,
        "title": "Post-order Traversal of Binary Tree using 2 stack",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/2YBhNLodD8Q",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Post-order+Traversal+of+Binary+Tree+using+2+stack",
        "article_url": "https://takeuforward.org/?s=Post-order+Traversal+of+Binary+Tree+using+2+stack",
        "companies": [
          "Amazon",
          "Adobe",
          "Flipkart"
        ]
      },
      {
        "id": "striver-q-286",
        "stepNumber": 13,
        "stepName": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
        "qno": 286,
        "title": "Post-order Traversal of Binary Tree using 1 stack",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/NzIGLLwZBS8",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Post-order+Traversal+of+Binary+Tree+using+1+stack",
        "article_url": "https://takeuforward.org/?s=Post-order+Traversal+of+Binary+Tree+using+1+stack",
        "companies": [
          "Google",
          "Microsoft",
          "Uber"
        ]
      },
      {
        "id": "striver-q-287",
        "stepNumber": 13,
        "stepName": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
        "qno": 287,
        "title": "Preorder, Inorder, and Postorder Traversal in one Traversal",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/ySp2epYvgTE",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Preorder,+Inorder,+and+Postorder+Traversal+in+one+Traversal",
        "article_url": "https://takeuforward.org/?s=Preorder,+Inorder,+and+Postorder+Traversal+in+one+Traversal",
        "companies": [
          "Apple",
          "Amazon",
          "Netflix"
        ]
      },
      {
        "id": "striver-q-288",
        "stepNumber": 13,
        "stepName": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
        "qno": 288,
        "title": "Height of a Binary Tree",
        "difficulty": "Easy",
        "youtube_url": "https://youtu.be/eD3tmO66aBA",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Height+of+a+Binary+Tree",
        "article_url": "https://takeuforward.org/?s=Height+of+a+Binary+Tree",
        "companies": [
          "Google",
          "Amazon",
          "Microsoft"
        ]
      },
      {
        "id": "striver-q-289",
        "stepNumber": 13,
        "stepName": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
        "qno": 289,
        "title": "Check if the Binary tree is height-balanced or not",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/Yt50Jfbd8Po",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Check+if+the+Binary+tree+is+height-balanced+or+not",
        "article_url": "https://takeuforward.org/?s=Check+if+the+Binary+tree+is+height-balanced+or+not",
        "companies": [
          "Amazon",
          "Microsoft",
          "Meta"
        ]
      },
      {
        "id": "striver-q-290",
        "stepNumber": 13,
        "stepName": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
        "qno": 290,
        "title": "Diameter of Binary Tree",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/Rezetez59Nk",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Diameter+of+Binary+Tree",
        "article_url": "https://takeuforward.org/?s=Diameter+of+Binary+Tree",
        "companies": [
          "Google",
          "Apple",
          "Uber"
        ]
      },
      {
        "id": "striver-q-291",
        "stepNumber": 13,
        "stepName": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
        "qno": 291,
        "title": "Maximum path sum",
        "difficulty": "Hard",
        "youtube_url": "https://youtu.be/WszrfSwMz58",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Maximum+path+sum",
        "article_url": "https://takeuforward.org/?s=Maximum+path+sum",
        "companies": [
          "Microsoft",
          "Goldman Sachs",
          "Amazon"
        ]
      },
      {
        "id": "striver-q-292",
        "stepNumber": 13,
        "stepName": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
        "qno": 292,
        "title": "Check if two trees are identical or not",
        "difficulty": "Easy",
        "youtube_url": "https://youtu.be/BhuvF_-PWS0",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Check+if+two+trees+are+identical+or+not",
        "article_url": "https://takeuforward.org/?s=Check+if+two+trees+are+identical+or+not",
        "companies": [
          "Meta",
          "Google",
          "Bloomberg"
        ]
      },
      {
        "id": "striver-q-293",
        "stepNumber": 13,
        "stepName": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
        "qno": 293,
        "title": "Zig Zag Traversal of Binary Tree",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/3OXWEdlIGl4",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Zig+Zag+Traversal+of+Binary+Tree",
        "article_url": "https://takeuforward.org/?s=Zig+Zag+Traversal+of+Binary+Tree",
        "companies": [
          "Amazon",
          "Adobe",
          "Flipkart"
        ]
      },
      {
        "id": "striver-q-294",
        "stepNumber": 13,
        "stepName": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
        "qno": 294,
        "title": "Boundary Traversal of Binary Tree",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/0ca1nvR0be4",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Boundary+Traversal+of+Binary+Tree",
        "article_url": "https://takeuforward.org/?s=Boundary+Traversal+of+Binary+Tree",
        "companies": [
          "Google",
          "Microsoft",
          "Uber"
        ]
      },
      {
        "id": "striver-q-295",
        "stepNumber": 13,
        "stepName": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
        "qno": 295,
        "title": "Vertical Order Traversal of Binary Tree",
        "difficulty": "Hard",
        "youtube_url": "https://youtu.be/q_a6lpbKJdw",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Vertical+Order+Traversal+of+Binary+Tree",
        "article_url": "https://takeuforward.org/?s=Vertical+Order+Traversal+of+Binary+Tree",
        "companies": [
          "Apple",
          "Amazon",
          "Netflix"
        ]
      },
      {
        "id": "striver-q-296",
        "stepNumber": 13,
        "stepName": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
        "qno": 296,
        "title": "Top View of Binary Tree",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/Et9OCDNvJ78",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Top+View+of+Binary+Tree",
        "article_url": "https://takeuforward.org/?s=Top+View+of+Binary+Tree",
        "companies": [
          "Google",
          "Amazon",
          "Microsoft"
        ]
      },
      {
        "id": "striver-q-297",
        "stepNumber": 13,
        "stepName": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
        "qno": 297,
        "title": "Bottom View of Binary Tree",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/0FtVY6I4pB8",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Bottom+View+of+Binary+Tree",
        "article_url": "https://takeuforward.org/?s=Bottom+View+of+Binary+Tree",
        "companies": [
          "Amazon",
          "Microsoft",
          "Meta"
        ]
      },
      {
        "id": "striver-q-298",
        "stepNumber": 13,
        "stepName": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
        "qno": 298,
        "title": "Right/Left View of Binary Tree",
        "difficulty": "Easy",
        "youtube_url": "https://youtu.be/KV4mRzTjlAk",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Right/Left+View+of+Binary+Tree",
        "article_url": "https://takeuforward.org/?s=Right/Left+View+of+Binary+Tree",
        "companies": [
          "Google",
          "Apple",
          "Uber"
        ]
      },
      {
        "id": "striver-q-299",
        "stepNumber": 13,
        "stepName": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
        "qno": 299,
        "title": "Symmetric Binary Tree",
        "difficulty": "Easy",
        "youtube_url": "https://youtu.be/nKggiEpBE",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Symmetric+Binary+Tree",
        "article_url": "https://takeuforward.org/?s=Symmetric+Binary+Tree",
        "companies": [
          "Microsoft",
          "Goldman Sachs",
          "Amazon"
        ]
      },
      {
        "id": "striver-q-300",
        "stepNumber": 13,
        "stepName": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
        "qno": 300,
        "title": "Root to Node Path in Binary Tree",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/fmflMqVOC7k",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Root+to+Node+Path+in+Binary+Tree",
        "article_url": "https://takeuforward.org/?s=Root+to+Node+Path+in+Binary+Tree",
        "companies": [
          "Meta",
          "Google",
          "Bloomberg"
        ]
      },
      {
        "id": "striver-q-301",
        "stepNumber": 13,
        "stepName": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
        "qno": 301,
        "title": "LCA in Binary Tree",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/_-QHfMDde90",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=LCA+in+Binary+Tree",
        "article_url": "https://takeuforward.org/?s=LCA+in+Binary+Tree",
        "companies": [
          "Amazon",
          "Adobe",
          "Flipkart"
        ]
      },
      {
        "id": "striver-q-302",
        "stepNumber": 13,
        "stepName": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
        "qno": 302,
        "title": "Maximum width of a Binary Tree",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/ZbybYvcVLks",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Maximum+width+of+a+Binary+Tree",
        "article_url": "https://takeuforward.org/?s=Maximum+width+of+a+Binary+Tree",
        "companies": [
          "Google",
          "Microsoft",
          "Uber"
        ]
      },
      {
        "id": "striver-q-303",
        "stepNumber": 13,
        "stepName": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
        "qno": 303,
        "title": "Check for Children Sum Property",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/fnmisPM6cVo",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Check+for+Children+Sum+Property",
        "article_url": "https://takeuforward.org/?s=Check+for+Children+Sum+Property",
        "companies": [
          "Apple",
          "Amazon",
          "Netflix"
        ]
      },
      {
        "id": "striver-q-304",
        "stepNumber": 13,
        "stepName": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
        "qno": 304,
        "title": "Print all the Nodes at a distance of K in a Binary Tree",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/i9ORlEy6EsI",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Print+all+the+Nodes+at+a+distance+of+K+in+a+Binary+Tree",
        "article_url": "https://takeuforward.org/?s=Print+all+the+Nodes+at+a+distance+of+K+in+a+Binary+Tree",
        "companies": [
          "Google",
          "Amazon",
          "Microsoft"
        ]
      },
      {
        "id": "striver-q-305",
        "stepNumber": 13,
        "stepName": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
        "qno": 305,
        "title": "Minimum time taken to BURN the Binary Tree from a Node",
        "difficulty": "Hard",
        "youtube_url": "https://youtu.be/2r5wLmQfD6g",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Minimum+time+taken+to+BURN+the+Binary+Tree+from+a+Node",
        "article_url": "https://takeuforward.org/?s=Minimum+time+taken+to+BURN+the+Binary+Tree+from+a+Node",
        "companies": [
          "Amazon",
          "Microsoft",
          "Meta"
        ]
      },
      {
        "id": "striver-q-306",
        "stepNumber": 13,
        "stepName": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
        "qno": 306,
        "title": "Count total Nodes in a COMPLETE Binary Tree",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/u-yWemKGWO0",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Count+total+Nodes+in+a+COMPLETE+Binary+Tree",
        "article_url": "https://takeuforward.org/?s=Count+total+Nodes+in+a+COMPLETE+Binary+Tree",
        "companies": [
          "Google",
          "Apple",
          "Uber"
        ]
      },
      {
        "id": "striver-q-307",
        "stepNumber": 13,
        "stepName": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
        "qno": 307,
        "title": "Requirements needed to construct a Unique Binary Tree | Theory",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/9GMECGQgWrQ",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Requirements+needed+to+construct+a+Unique+Binary+Tree",
        "article_url": "https://takeuforward.org/?s=Requirements+needed+to+construct+a+Unique+Binary+Tree",
        "companies": [
          "Microsoft",
          "Goldman Sachs",
          "Amazon"
        ]
      },
      {
        "id": "striver-q-308",
        "stepNumber": 13,
        "stepName": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
        "qno": 308,
        "title": "Construct Binary Tree from inorder and preorder",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/aZNaLrVebKQ",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Construct+Binary+Tree+from+inorder+and+preorder",
        "article_url": "https://takeuforward.org/?s=Construct+Binary+Tree+from+inorder+and+preorder",
        "companies": [
          "Meta",
          "Google",
          "Bloomberg"
        ]
      },
      {
        "id": "striver-q-309",
        "stepNumber": 13,
        "stepName": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
        "qno": 309,
        "title": "Construct the Binary Tree from Postorder and Inorder Traversal",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/LgLRTaEMRVc",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Construct+the+Binary+Tree+from+Postorder+and+Inorder+Traversal",
        "article_url": "https://takeuforward.org/?s=Construct+the+Binary+Tree+from+Postorder+and+Inorder+Traversal",
        "companies": [
          "Amazon",
          "Adobe",
          "Flipkart"
        ]
      },
      {
        "id": "striver-q-310",
        "stepNumber": 13,
        "stepName": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
        "qno": 310,
        "title": "Serialize and deserialize Binary Tree",
        "difficulty": "Hard",
        "youtube_url": "https://youtu.be/-YbXySKJsX8",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Serialize+and+deserialize+Binary+Tree",
        "article_url": "https://takeuforward.org/?s=Serialize+and+deserialize+Binary+Tree",
        "companies": [
          "Google",
          "Microsoft",
          "Uber"
        ]
      },
      {
        "id": "striver-q-311",
        "stepNumber": 13,
        "stepName": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
        "qno": 311,
        "title": "Morris Preorder Traversal of a Binary Tree",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/80Zug6D1_r4",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Morris+Preorder+Traversal+of+a+Binary+Tree",
        "article_url": "https://takeuforward.org/?s=Morris+Preorder+Traversal+of+a+Binary+Tree",
        "companies": [
          "Apple",
          "Amazon",
          "Netflix"
        ]
      },
      {
        "id": "striver-q-312",
        "stepNumber": 13,
        "stepName": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
        "qno": 312,
        "title": "Morris Inorder Traversal of a Binary Tree",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/80Zug6D1_r4",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Morris+Inorder+Traversal+of+a+Binary+Tree",
        "article_url": "https://takeuforward.org/?s=Morris+Inorder+Traversal+of+a+Binary+Tree",
        "companies": [
          "Google",
          "Amazon",
          "Microsoft"
        ]
      },
      {
        "id": "striver-q-313",
        "stepNumber": 13,
        "stepName": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
        "qno": 313,
        "title": "Flatten Binary Tree to LinkedList",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/sWf7k1x9XR4",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Flatten+Binary+Tree+to+LinkedList",
        "article_url": "https://takeuforward.org/?s=Flatten+Binary+Tree+to+LinkedList",
        "companies": [
          "Amazon",
          "Microsoft",
          "Meta"
        ]
      }
    ]
  },
  {
    "id": "step-14",
    "stepNumber": 14,
    "title": "Step 14: Binary Search Trees [Concept and Problems]",
    "stepRange": "Q314 - Q329",
    "description": "16 curated problems covering Binary Search Trees [Concept and Problems]",
    "problems": [
      {
        "id": "striver-q-314",
        "stepNumber": 14,
        "stepName": "Step 14: Binary Search Trees [Concept and Problems]",
        "qno": 314,
        "title": "Introduction to Binary Search Tree",
        "difficulty": "Easy",
        "youtube_url": "https://youtu.be/p7-9UvDQZ3w",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Introduction+to+Binary+Search+Tree",
        "article_url": "https://takeuforward.org/?s=Introduction+to+Binary+Search+Tree",
        "companies": [
          "Google",
          "Apple",
          "Uber"
        ]
      },
      {
        "id": "striver-q-315",
        "stepNumber": 14,
        "stepName": "Step 14: Binary Search Trees [Concept and Problems]",
        "qno": 315,
        "title": "Search in a Binary Search Tree",
        "difficulty": "Easy",
        "youtube_url": "https://youtu.be/KcNt6v_56cc",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Search+in+a+Binary+Search+Tree",
        "article_url": "https://takeuforward.org/?s=Search+in+a+Binary+Search+Tree",
        "companies": [
          "Microsoft",
          "Goldman Sachs",
          "Amazon"
        ]
      },
      {
        "id": "striver-q-316",
        "stepNumber": 14,
        "stepName": "Step 14: Binary Search Trees [Concept and Problems]",
        "qno": 316,
        "title": "Find Min/Max in BST",
        "difficulty": "Easy",
        "youtube_url": null,
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Find+Min/Max+in+BST",
        "article_url": "https://takeuforward.org/?s=Find+Min/Max+in+BST",
        "companies": [
          "Meta",
          "Google",
          "Bloomberg"
        ]
      },
      {
        "id": "striver-q-317",
        "stepNumber": 14,
        "stepName": "Step 14: Binary Search Trees [Concept and Problems]",
        "qno": 317,
        "title": "Ceil in a Binary Search Tree",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/KSsk8AhdOZA",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Ceil+in+a+Binary+Search+Tree",
        "article_url": "https://takeuforward.org/?s=Ceil+in+a+Binary+Search+Tree",
        "companies": [
          "Amazon",
          "Adobe",
          "Flipkart"
        ]
      },
      {
        "id": "striver-q-318",
        "stepNumber": 14,
        "stepName": "Step 14: Binary Search Trees [Concept and Problems]",
        "qno": 318,
        "title": "Floor in a Binary Search Tree",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/xm_W1ub-K-w",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Floor+in+a+Binary+Search+Tree",
        "article_url": "https://takeuforward.org/?s=Floor+in+a+Binary+Search+Tree",
        "companies": [
          "Google",
          "Microsoft",
          "Uber"
        ]
      },
      {
        "id": "striver-q-319",
        "stepNumber": 14,
        "stepName": "Step 14: Binary Search Trees [Concept and Problems]",
        "qno": 319,
        "title": "Insert a given Node in Binary Search Tree",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/FiFiNvM29ps",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Insert+a+given+Node+in+Binary+Search+Tree",
        "article_url": "https://takeuforward.org/?s=Insert+a+given+Node+in+Binary+Search+Tree",
        "companies": [
          "Apple",
          "Amazon",
          "Netflix"
        ]
      },
      {
        "id": "striver-q-320",
        "stepNumber": 14,
        "stepName": "Step 14: Binary Search Trees [Concept and Problems]",
        "qno": 320,
        "title": "Delete a Node in Binary Search Tree",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/kouxiP_H5WE",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Delete+a+Node+in+Binary+Search+Tree",
        "article_url": "https://takeuforward.org/?s=Delete+a+Node+in+Binary+Search+Tree",
        "companies": [
          "Google",
          "Amazon",
          "Microsoft"
        ]
      },
      {
        "id": "striver-q-321",
        "stepNumber": 14,
        "stepName": "Step 14: Binary Search Trees [Concept and Problems]",
        "qno": 321,
        "title": "Find K-th smallest/largest element in BST",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/9TJYWh0adfk",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Find+K-th+smallest/largest+element+in+BST",
        "article_url": "https://takeuforward.org/?s=Find+K-th+smallest/largest+element+in+BST",
        "companies": [
          "Amazon",
          "Microsoft",
          "Meta"
        ]
      },
      {
        "id": "striver-q-322",
        "stepNumber": 14,
        "stepName": "Step 14: Binary Search Trees [Concept and Problems]",
        "qno": 322,
        "title": "Check if a tree is a BST or BT",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/f-sj7I5oXEI",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Check+if+a+tree+is+a+BST+or+BT",
        "article_url": "https://takeuforward.org/?s=Check+if+a+tree+is+a+BST+or+BT",
        "companies": [
          "Google",
          "Apple",
          "Uber"
        ]
      },
      {
        "id": "striver-q-323",
        "stepNumber": 14,
        "stepName": "Step 14: Binary Search Trees [Concept and Problems]",
        "qno": 323,
        "title": "LCA in Binary Search Tree",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/cX_kPV_foZc",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=LCA+in+Binary+Search+Tree",
        "article_url": "https://takeuforward.org/?s=LCA+in+Binary+Search+Tree",
        "companies": [
          "Microsoft",
          "Goldman Sachs",
          "Amazon"
        ]
      },
      {
        "id": "striver-q-324",
        "stepNumber": 14,
        "stepName": "Step 14: Binary Search Trees [Concept and Problems]",
        "qno": 324,
        "title": "Construct a BST from a preorder traversal",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/UmJT3j26t1I",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Construct+a+BST+from+a+preorder+traversal",
        "article_url": "https://takeuforward.org/?s=Construct+a+BST+from+a+preorder+traversal",
        "companies": [
          "Meta",
          "Google",
          "Bloomberg"
        ]
      },
      {
        "id": "striver-q-325",
        "stepNumber": 14,
        "stepName": "Step 14: Binary Search Trees [Concept and Problems]",
        "qno": 325,
        "title": "Inorder Successor/Predecessor in BST",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/SXKAD2svfmI",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Inorder+Successor/Predecessor+in+BST",
        "article_url": "https://takeuforward.org/?s=Inorder+Successor/Predecessor+in+BST",
        "companies": [
          "Amazon",
          "Adobe",
          "Flipkart"
        ]
      },
      {
        "id": "striver-q-326",
        "stepNumber": 14,
        "stepName": "Step 14: Binary Search Trees [Concept and Problems]",
        "qno": 326,
        "title": "Merge 2 BST's",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/D2jMcmxU4bs",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Merge+2+BST's",
        "article_url": "https://takeuforward.org/?s=Merge+2+BST's",
        "companies": [
          "Google",
          "Microsoft",
          "Uber"
        ]
      },
      {
        "id": "striver-q-327",
        "stepNumber": 14,
        "stepName": "Step 14: Binary Search Trees [Concept and Problems]",
        "qno": 327,
        "title": "Two Sum In BST | Check if there exists a pair with Sum K",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/ssL3sHwPeb4",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Two+Sum+In+BST",
        "article_url": "https://takeuforward.org/?s=Two+Sum+In+BST",
        "companies": [
          "Apple",
          "Amazon",
          "Netflix"
        ]
      },
      {
        "id": "striver-q-328",
        "stepNumber": 14,
        "stepName": "Step 14: Binary Search Trees [Concept and Problems]",
        "qno": 328,
        "title": "Recover BST | Correct BST with two nodes swapped",
        "difficulty": "Hard",
        "youtube_url": "https://youtu.be/ZWGW7FminDM",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Recover+BST",
        "article_url": "https://takeuforward.org/?s=Recover+BST",
        "companies": [
          "Google",
          "Amazon",
          "Microsoft"
        ]
      },
      {
        "id": "striver-q-329",
        "stepNumber": 14,
        "stepName": "Step 14: Binary Search Trees [Concept and Problems]",
        "qno": 329,
        "title": "Largest BST in Binary Tree",
        "difficulty": "Hard",
        "youtube_url": "https://youtu.be/X0oXMdtUDwo",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Largest+BST+in+Binary+Tree",
        "article_url": "https://takeuforward.org/?s=Largest+BST+in+Binary+Tree",
        "companies": [
          "Amazon",
          "Microsoft",
          "Meta"
        ]
      }
    ]
  },
  {
    "id": "step-15",
    "stepNumber": 15,
    "title": "Step 15: Graphs [Concepts & Problems]",
    "stepRange": "Q330 - Q383",
    "description": "54 curated problems covering Graphs [Concepts & Problems]",
    "problems": [
      {
        "id": "striver-q-330",
        "stepNumber": 15,
        "stepName": "Step 15: Graphs [Concepts & Problems]",
        "qno": 330,
        "title": "Graph and Types",
        "difficulty": "Easy",
        "youtube_url": "https://youtu.be/M3_pLsDdeuU",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Graph+and+Types",
        "article_url": "https://takeuforward.org/?s=Graph+and+Types",
        "companies": [
          "Google",
          "Apple",
          "Uber"
        ]
      },
      {
        "id": "striver-q-331",
        "stepNumber": 15,
        "stepName": "Step 15: Graphs [Concepts & Problems]",
        "qno": 331,
        "title": "Graph Representation | C++",
        "difficulty": "Easy",
        "youtube_url": "https://youtu.be/3oI-34aPMWM",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Graph+Representation",
        "article_url": "https://takeuforward.org/?s=Graph+Representation",
        "companies": [
          "Microsoft",
          "Goldman Sachs",
          "Amazon"
        ]
      },
      {
        "id": "striver-q-332",
        "stepNumber": 15,
        "stepName": "Step 15: Graphs [Concepts & Problems]",
        "qno": 332,
        "title": "Graph Representation | Java",
        "difficulty": "Easy",
        "youtube_url": "https://youtu.be/3oI-34aPMWM",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Graph+Representation",
        "article_url": "https://takeuforward.org/?s=Graph+Representation",
        "companies": [
          "Meta",
          "Google",
          "Bloomberg"
        ]
      },
      {
        "id": "striver-q-333",
        "stepNumber": 15,
        "stepName": "Step 15: Graphs [Concepts & Problems]",
        "qno": 333,
        "title": "Connected Components | Logic Explanation",
        "difficulty": "Easy",
        "youtube_url": "https://youtu.be/lea-Wl_uWXY",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Connected+Components",
        "article_url": "https://takeuforward.org/?s=Connected+Components",
        "companies": [
          "Amazon",
          "Adobe",
          "Flipkart"
        ]
      },
      {
        "id": "striver-q-334",
        "stepNumber": 15,
        "stepName": "Step 15: Graphs [Concepts & Problems]",
        "qno": 334,
        "title": "BFS",
        "difficulty": "Easy",
        "youtube_url": "https://youtu.be/-tgVpUgsQ5k",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=BFS",
        "article_url": "https://takeuforward.org/?s=BFS",
        "companies": [
          "Google",
          "Microsoft",
          "Uber"
        ]
      },
      {
        "id": "striver-q-335",
        "stepNumber": 15,
        "stepName": "Step 15: Graphs [Concepts & Problems]",
        "qno": 335,
        "title": "DFS",
        "difficulty": "Easy",
        "youtube_url": "https://youtu.be/Qzf1a--rhp8",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=DFS",
        "article_url": "https://takeuforward.org/?s=DFS",
        "companies": [
          "Apple",
          "Amazon",
          "Netflix"
        ]
      },
      {
        "id": "striver-q-336",
        "stepNumber": 15,
        "stepName": "Step 15: Graphs [Concepts & Problems]",
        "qno": 336,
        "title": "Number of provinces (leetcode)",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/ACzkVtewUYA",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Number+of+provinces",
        "article_url": "https://takeuforward.org/?s=Number+of+provinces",
        "companies": [
          "Google",
          "Amazon",
          "Microsoft"
        ]
      },
      {
        "id": "striver-q-337",
        "stepNumber": 15,
        "stepName": "Step 15: Graphs [Concepts & Problems]",
        "qno": 337,
        "title": "Connected Components Problem in Matrix",
        "difficulty": "Medium",
        "youtube_url": null,
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Connected+Components+Problem+in+Matrix",
        "article_url": "https://takeuforward.org/?s=Connected+Components+Problem+in+Matrix",
        "companies": [
          "Amazon",
          "Microsoft",
          "Meta"
        ]
      },
      {
        "id": "striver-q-338",
        "stepNumber": 15,
        "stepName": "Step 15: Graphs [Concepts & Problems]",
        "qno": 338,
        "title": "Rotten Oranges",
        "difficulty": "Medium",
        "youtube_url": "https://www.youtube.com/watch?v=yf3oUhkvqA0",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Rotten+Oranges",
        "article_url": "https://takeuforward.org/?s=Rotten+Oranges",
        "companies": [
          "Google",
          "Apple",
          "Uber"
        ]
      },
      {
        "id": "striver-q-339",
        "stepNumber": 15,
        "stepName": "Step 15: Graphs [Concepts & Problems]",
        "qno": 339,
        "title": "Flood fill",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/C-2_uSRli8o",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Flood+fill",
        "article_url": "https://takeuforward.org/?s=Flood+fill",
        "companies": [
          "Microsoft",
          "Goldman Sachs",
          "Amazon"
        ]
      },
      {
        "id": "striver-q-340",
        "stepNumber": 15,
        "stepName": "Step 15: Graphs [Concepts & Problems]",
        "qno": 340,
        "title": "Cycle Detection in unirected Graph (bfs)",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/BPlrALf1LDU",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Cycle+Detection+in+unirected+Graph",
        "article_url": "https://takeuforward.org/?s=Cycle+Detection+in+unirected+Graph",
        "companies": [
          "Meta",
          "Google",
          "Bloomberg"
        ]
      },
      {
        "id": "striver-q-341",
        "stepNumber": 15,
        "stepName": "Step 15: Graphs [Concepts & Problems]",
        "qno": 341,
        "title": "Cycle Detection in undirected Graph (dfs)",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/zQ3zgFypzX4",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Cycle+Detection+in+undirected+Graph",
        "article_url": "https://takeuforward.org/?s=Cycle+Detection+in+undirected+Graph",
        "companies": [
          "Amazon",
          "Adobe",
          "Flipkart"
        ]
      },
      {
        "id": "striver-q-342",
        "stepNumber": 15,
        "stepName": "Step 15: Graphs [Concepts & Problems]",
        "qno": 342,
        "title": "0/1 Matrix (Bfs Problem)",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/edXdVwkYHF8",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=0/1+Matrix",
        "article_url": "https://takeuforward.org/?s=0/1+Matrix",
        "companies": [
          "Google",
          "Microsoft",
          "Uber"
        ]
      },
      {
        "id": "striver-q-343",
        "stepNumber": 15,
        "stepName": "Step 15: Graphs [Concepts & Problems]",
        "qno": 343,
        "title": "Surrounded Regions (dfs)",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/BtdgAys4yMk",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Surrounded+Regions",
        "article_url": "https://takeuforward.org/?s=Surrounded+Regions",
        "companies": [
          "Apple",
          "Amazon",
          "Netflix"
        ]
      },
      {
        "id": "striver-q-344",
        "stepNumber": 15,
        "stepName": "Step 15: Graphs [Concepts & Problems]",
        "qno": 344,
        "title": "Number of Enclaves [flood fill implementation - multisource]",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/rxKcepXQgU4",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Number+of+Enclaves",
        "article_url": "https://takeuforward.org/?s=Number+of+Enclaves",
        "companies": [
          "Google",
          "Amazon",
          "Microsoft"
        ]
      },
      {
        "id": "striver-q-345",
        "stepNumber": 15,
        "stepName": "Step 15: Graphs [Concepts & Problems]",
        "qno": 345,
        "title": "Word ladder - 1",
        "difficulty": "Hard",
        "youtube_url": "https://youtu.be/tRPda0rcf8E",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Word+ladder+-+1",
        "article_url": "https://takeuforward.org/?s=Word+ladder+-+1",
        "companies": [
          "Amazon",
          "Microsoft",
          "Meta"
        ]
      },
      {
        "id": "striver-q-346",
        "stepNumber": 15,
        "stepName": "Step 15: Graphs [Concepts & Problems]",
        "qno": 346,
        "title": "Word ladder - 2",
        "difficulty": "Hard",
        "youtube_url": "https://youtu.be/tRPda0rcf8E",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Word+ladder+-+2",
        "article_url": "https://takeuforward.org/?s=Word+ladder+-+2",
        "companies": [
          "Google",
          "Apple",
          "Uber"
        ]
      },
      {
        "id": "striver-q-347",
        "stepNumber": 15,
        "stepName": "Step 15: Graphs [Concepts & Problems]",
        "qno": 347,
        "title": "Number of Distinct Islands [dfs multisource]",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/muncqlKJrH0",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Number+of+Distinct+Islands",
        "article_url": "https://takeuforward.org/?s=Number+of+Distinct+Islands",
        "companies": [
          "Microsoft",
          "Goldman Sachs",
          "Amazon"
        ]
      },
      {
        "id": "striver-q-348",
        "stepNumber": 15,
        "stepName": "Step 15: Graphs [Concepts & Problems]",
        "qno": 348,
        "title": "Bipartite Graph (DFS)",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/KG5YFfR0j8A",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Bipartite+Graph",
        "article_url": "https://takeuforward.org/?s=Bipartite+Graph",
        "companies": [
          "Meta",
          "Google",
          "Bloomberg"
        ]
      },
      {
        "id": "striver-q-349",
        "stepNumber": 15,
        "stepName": "Step 15: Graphs [Concepts & Problems]",
        "qno": 349,
        "title": "Cycle Detection in Directed Graph (DFS)",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/9twcmtQj4DU",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Cycle+Detection+in+Directed+Graph",
        "article_url": "https://takeuforward.org/?s=Cycle+Detection+in+Directed+Graph",
        "companies": [
          "Amazon",
          "Adobe",
          "Flipkart"
        ]
      },
      {
        "id": "striver-q-350",
        "stepNumber": 15,
        "stepName": "Step 15: Graphs [Concepts & Problems]",
        "qno": 350,
        "title": "Topo Sort",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/5lZ0iJMrUMk",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Topo+Sort",
        "article_url": "https://takeuforward.org/?s=Topo+Sort",
        "companies": [
          "Google",
          "Microsoft",
          "Uber"
        ]
      },
      {
        "id": "striver-q-351",
        "stepNumber": 15,
        "stepName": "Step 15: Graphs [Concepts & Problems]",
        "qno": 351,
        "title": "Kahn's Algorithm",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/73sneFXuTEg",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Kahn's+Algorithm",
        "article_url": "https://takeuforward.org/?s=Kahn's+Algorithm",
        "companies": [
          "Apple",
          "Amazon",
          "Netflix"
        ]
      },
      {
        "id": "striver-q-352",
        "stepNumber": 15,
        "stepName": "Step 15: Graphs [Concepts & Problems]",
        "qno": 352,
        "title": "Cycle Detection in Directed Graph (BFS)",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/iTBaI90lpDQ",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Cycle+Detection+in+Directed+Graph",
        "article_url": "https://takeuforward.org/?s=Cycle+Detection+in+Directed+Graph",
        "companies": [
          "Google",
          "Amazon",
          "Microsoft"
        ]
      },
      {
        "id": "striver-q-353",
        "stepNumber": 15,
        "stepName": "Step 15: Graphs [Concepts & Problems]",
        "qno": 353,
        "title": "Course Schedule - I",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/WAOfKpxYHR8",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Course+Schedule+-+I",
        "article_url": "https://takeuforward.org/?s=Course+Schedule+-+I",
        "companies": [
          "Amazon",
          "Microsoft",
          "Meta"
        ]
      },
      {
        "id": "striver-q-354",
        "stepNumber": 15,
        "stepName": "Step 15: Graphs [Concepts & Problems]",
        "qno": 354,
        "title": "Course Schedule - II",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/WAOfKpxYHR8",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Course+Schedule+-+II",
        "article_url": "https://takeuforward.org/?s=Course+Schedule+-+II",
        "companies": [
          "Google",
          "Apple",
          "Uber"
        ]
      },
      {
        "id": "striver-q-355",
        "stepNumber": 15,
        "stepName": "Step 15: Graphs [Concepts & Problems]",
        "qno": 355,
        "title": "Find eventual safe states",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/2gtg3VsDGyc",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Find+eventual+safe+states",
        "article_url": "https://takeuforward.org/?s=Find+eventual+safe+states",
        "companies": [
          "Microsoft",
          "Goldman Sachs",
          "Amazon"
        ]
      },
      {
        "id": "striver-q-356",
        "stepNumber": 15,
        "stepName": "Step 15: Graphs [Concepts & Problems]",
        "qno": 356,
        "title": "Alien dictionary",
        "difficulty": "Hard",
        "youtube_url": "https://youtu.be/U3N_je7tWAs",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Alien+dictionary",
        "article_url": "https://takeuforward.org/?s=Alien+dictionary",
        "companies": [
          "Meta",
          "Google",
          "Bloomberg"
        ]
      },
      {
        "id": "striver-q-357",
        "stepNumber": 15,
        "stepName": "Step 15: Graphs [Concepts & Problems]",
        "qno": 357,
        "title": "Shortest Path in UG with unit weights",
        "difficulty": "Medium",
        "youtube_url": "https://www.youtube.com/watch?v=C4gxoTaI71U&list=PLgUwDviBIf0oE3gA41TKO2H5bHpPd7fzn&index=28",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Shortest+Path+in+UG+with+unit+weights",
        "article_url": "https://takeuforward.org/?s=Shortest+Path+in+UG+with+unit+weights",
        "companies": [
          "Amazon",
          "Adobe",
          "Flipkart"
        ]
      },
      {
        "id": "striver-q-358",
        "stepNumber": 15,
        "stepName": "Step 15: Graphs [Concepts & Problems]",
        "qno": 358,
        "title": "Shortest Path in DAG",
        "difficulty": "Medium",
        "youtube_url": "https://www.youtube.com/watch?v=ZUFQfFaU-8U&list=PLgUwDviBIf0oE3gA41TKO2H5bHpPd7fzn&index=27",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Shortest+Path+in+DAG",
        "article_url": "https://takeuforward.org/?s=Shortest+Path+in+DAG",
        "companies": [
          "Google",
          "Microsoft",
          "Uber"
        ]
      },
      {
        "id": "striver-q-359",
        "stepNumber": 15,
        "stepName": "Step 15: Graphs [Concepts & Problems]",
        "qno": 359,
        "title": "Djisktra's Algorithm",
        "difficulty": "Medium",
        "youtube_url": "https://www.youtube.com/watch?v=rp1SMw7HSO8&list=PLgUwDviBIf0oE3gA41TKO2H5bHpPd7fzn&index=35",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Djisktra's+Algorithm",
        "article_url": "https://takeuforward.org/?s=Djisktra's+Algorithm",
        "companies": [
          "Apple",
          "Amazon",
          "Netflix"
        ]
      },
      {
        "id": "striver-q-360",
        "stepNumber": 15,
        "stepName": "Step 15: Graphs [Concepts & Problems]",
        "qno": 360,
        "title": "Why priority Queue is used in Djisktra's Algorithm",
        "difficulty": "Medium",
        "youtube_url": "https://www.youtube.com/watch?v=rp1SMw7HSO8&list=PLgUwDviBIf0oE3gA41TKO2H5bHpPd7fzn&index=35",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Why+priority+Queue+is+used+in+Djisktra's+Algorithm",
        "article_url": "https://takeuforward.org/?s=Why+priority+Queue+is+used+in+Djisktra's+Algorithm",
        "companies": [
          "Google",
          "Amazon",
          "Microsoft"
        ]
      },
      {
        "id": "striver-q-361",
        "stepNumber": 15,
        "stepName": "Step 15: Graphs [Concepts & Problems]",
        "qno": 361,
        "title": "Shortest path in a binary maze",
        "difficulty": "Hard",
        "youtube_url": "https://www.youtube.com/watch?v=U5Mw4eyUmw4&list=PLgUwDviBIf0oE3gA41TKO2H5bHpPd7fzn&index=36",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Shortest+path+in+a+binary+maze",
        "article_url": "https://takeuforward.org/?s=Shortest+path+in+a+binary+maze",
        "companies": [
          "Amazon",
          "Microsoft",
          "Meta"
        ]
      },
      {
        "id": "striver-q-362",
        "stepNumber": 15,
        "stepName": "Step 15: Graphs [Concepts & Problems]",
        "qno": 362,
        "title": "Path with minimum effort",
        "difficulty": "Hard",
        "youtube_url": "https://youtu.be/0ytpZyiZFhA",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Path+with+minimum+effort",
        "article_url": "https://takeuforward.org/?s=Path+with+minimum+effort",
        "companies": [
          "Google",
          "Apple",
          "Uber"
        ]
      },
      {
        "id": "striver-q-363",
        "stepNumber": 15,
        "stepName": "Step 15: Graphs [Concepts & Problems]",
        "qno": 363,
        "title": "Cheapest flights within k stops",
        "difficulty": "Hard",
        "youtube_url": "https://youtu.be/9XybHVqTHcQ",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Cheapest+flights+within+k+stops",
        "article_url": "https://takeuforward.org/?s=Cheapest+flights+within+k+stops",
        "companies": [
          "Microsoft",
          "Goldman Sachs",
          "Amazon"
        ]
      },
      {
        "id": "striver-q-364",
        "stepNumber": 15,
        "stepName": "Step 15: Graphs [Concepts & Problems]",
        "qno": 364,
        "title": "Network Delay time",
        "difficulty": "Medium",
        "youtube_url": null,
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Network+Delay+time",
        "article_url": "https://takeuforward.org/?s=Network+Delay+time",
        "companies": [
          "Meta",
          "Google",
          "Bloomberg"
        ]
      },
      {
        "id": "striver-q-365",
        "stepNumber": 15,
        "stepName": "Step 15: Graphs [Concepts & Problems]",
        "qno": 365,
        "title": "Number of ways to arrive at destination",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/_-0mx0SmYxA",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Number+of+ways+to+arrive+at+destination",
        "article_url": "https://takeuforward.org/?s=Number+of+ways+to+arrive+at+destination",
        "companies": [
          "Amazon",
          "Adobe",
          "Flipkart"
        ]
      },
      {
        "id": "striver-q-366",
        "stepNumber": 15,
        "stepName": "Step 15: Graphs [Concepts & Problems]",
        "qno": 366,
        "title": "Minimum steps to reach end from start by performing multiplication and mod operations with array elements",
        "difficulty": "Medium",
        "youtube_url": "https://www.youtube.com/watch?v=_BvEJ3VIDWw&list=PLgUwDviBIf0oE3gA41TKO2H5bHpPd7fzn&index=39",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Minimum+steps+to+reach+end+from+start+by+performing+multiplication+and+mod+operations+with+array+elements",
        "article_url": "https://takeuforward.org/?s=Minimum+steps+to+reach+end+from+start+by+performing+multiplication+and+mod+operations+with+array+elements",
        "companies": [
          "Google",
          "Microsoft",
          "Uber"
        ]
      },
      {
        "id": "striver-q-367",
        "stepNumber": 15,
        "stepName": "Step 15: Graphs [Concepts & Problems]",
        "qno": 367,
        "title": "Bellman Ford Algorithm",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/0vVofAhAYjc",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Bellman+Ford+Algorithm",
        "article_url": "https://takeuforward.org/?s=Bellman+Ford+Algorithm",
        "companies": [
          "Apple",
          "Amazon",
          "Netflix"
        ]
      },
      {
        "id": "striver-q-368",
        "stepNumber": 15,
        "stepName": "Step 15: Graphs [Concepts & Problems]",
        "qno": 368,
        "title": "Floyd Warshal Algorithm",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/YbY8cVwWAvw",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Floyd+Warshal+Algorithm",
        "article_url": "https://takeuforward.org/?s=Floyd+Warshal+Algorithm",
        "companies": [
          "Google",
          "Amazon",
          "Microsoft"
        ]
      },
      {
        "id": "striver-q-369",
        "stepNumber": 15,
        "stepName": "Step 15: Graphs [Concepts & Problems]",
        "qno": 369,
        "title": "Find the city with the smallest number of neighbors in a threshold distance",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/9XybHVqTHcQ",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Find+the+city+with+the+smallest+number+of+neighbors+in+a+threshold+distance",
        "article_url": "https://takeuforward.org/?s=Find+the+city+with+the+smallest+number+of+neighbors+in+a+threshold+distance",
        "companies": [
          "Amazon",
          "Microsoft",
          "Meta"
        ]
      },
      {
        "id": "striver-q-370",
        "stepNumber": 15,
        "stepName": "Step 15: Graphs [Concepts & Problems]",
        "qno": 370,
        "title": "Minimum Spanning Tree",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/ZSPjZuZWCME",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Minimum+Spanning+Tree",
        "article_url": "https://takeuforward.org/?s=Minimum+Spanning+Tree",
        "companies": [
          "Google",
          "Apple",
          "Uber"
        ]
      },
      {
        "id": "striver-q-371",
        "stepNumber": 15,
        "stepName": "Step 15: Graphs [Concepts & Problems]",
        "qno": 371,
        "title": "Prim's Algorithm",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/mJcZjjKzeqk",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Prim's+Algorithm",
        "article_url": "https://takeuforward.org/?s=Prim's+Algorithm",
        "companies": [
          "Microsoft",
          "Goldman Sachs",
          "Amazon"
        ]
      },
      {
        "id": "striver-q-372",
        "stepNumber": 15,
        "stepName": "Step 15: Graphs [Concepts & Problems]",
        "qno": 372,
        "title": "Disjoint Set [Union by Rank]",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/aBxjDBC4M1U",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Disjoint+Set",
        "article_url": "https://takeuforward.org/?s=Disjoint+Set",
        "companies": [
          "Meta",
          "Google",
          "Bloomberg"
        ]
      },
      {
        "id": "striver-q-373",
        "stepNumber": 15,
        "stepName": "Step 15: Graphs [Concepts & Problems]",
        "qno": 373,
        "title": "Disjoint Set [Union by Size]",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/aBxjDBC4M1U",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Disjoint+Set",
        "article_url": "https://takeuforward.org/?s=Disjoint+Set",
        "companies": [
          "Amazon",
          "Adobe",
          "Flipkart"
        ]
      },
      {
        "id": "striver-q-374",
        "stepNumber": 15,
        "stepName": "Step 15: Graphs [Concepts & Problems]",
        "qno": 374,
        "title": "Kruskal's Algorithm",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/DMnDM_sxVig",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Kruskal's+Algorithm",
        "article_url": "https://takeuforward.org/?s=Kruskal's+Algorithm",
        "companies": [
          "Google",
          "Microsoft",
          "Uber"
        ]
      },
      {
        "id": "striver-q-375",
        "stepNumber": 15,
        "stepName": "Step 15: Graphs [Concepts & Problems]",
        "qno": 375,
        "title": "Number of operations to make network connected",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/FYrl7iz9_ZU",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Number+of+operations+to+make+network+connected",
        "article_url": "https://takeuforward.org/?s=Number+of+operations+to+make+network+connected",
        "companies": [
          "Apple",
          "Amazon",
          "Netflix"
        ]
      },
      {
        "id": "striver-q-376",
        "stepNumber": 15,
        "stepName": "Step 15: Graphs [Concepts & Problems]",
        "qno": 376,
        "title": "Most stones removed with same rows or columns",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/OwMNX8SPavM",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Most+stones+removed+with+same+rows+or+columns",
        "article_url": "https://takeuforward.org/?s=Most+stones+removed+with+same+rows+or+columns",
        "companies": [
          "Google",
          "Amazon",
          "Microsoft"
        ]
      },
      {
        "id": "striver-q-377",
        "stepNumber": 15,
        "stepName": "Step 15: Graphs [Concepts & Problems]",
        "qno": 377,
        "title": "Accounts merge",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/FMwpt_aQOGw",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Accounts+merge",
        "article_url": "https://takeuforward.org/?s=Accounts+merge",
        "companies": [
          "Amazon",
          "Microsoft",
          "Meta"
        ]
      },
      {
        "id": "striver-q-378",
        "stepNumber": 15,
        "stepName": "Step 15: Graphs [Concepts & Problems]",
        "qno": 378,
        "title": "Number of island II",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/Rn6B-Q4SNyA",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Number+of+island+II",
        "article_url": "https://takeuforward.org/?s=Number+of+island+II",
        "companies": [
          "Google",
          "Apple",
          "Uber"
        ]
      },
      {
        "id": "striver-q-379",
        "stepNumber": 15,
        "stepName": "Step 15: Graphs [Concepts & Problems]",
        "qno": 379,
        "title": "Making a Large Island",
        "difficulty": "Hard",
        "youtube_url": "https://youtu.be/lgiz0Oup6gM",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Making+a+Large+Island",
        "article_url": "https://takeuforward.org/?s=Making+a+Large+Island",
        "companies": [
          "Microsoft",
          "Goldman Sachs",
          "Amazon"
        ]
      },
      {
        "id": "striver-q-380",
        "stepNumber": 15,
        "stepName": "Step 15: Graphs [Concepts & Problems]",
        "qno": 380,
        "title": "Swim in rising water",
        "difficulty": "Hard",
        "youtube_url": null,
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Swim+in+rising+water",
        "article_url": "https://takeuforward.org/?s=Swim+in+rising+water",
        "companies": [
          "Meta",
          "Google",
          "Bloomberg"
        ]
      },
      {
        "id": "striver-q-381",
        "stepNumber": 15,
        "stepName": "Step 15: Graphs [Concepts & Problems]",
        "qno": 381,
        "title": "Bridges in Graph",
        "difficulty": "Hard",
        "youtube_url": "https://youtu.be/qrAub5z8FeA",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Bridges+in+Graph",
        "article_url": "https://takeuforward.org/?s=Bridges+in+Graph",
        "companies": [
          "Amazon",
          "Adobe",
          "Flipkart"
        ]
      },
      {
        "id": "striver-q-382",
        "stepNumber": 15,
        "stepName": "Step 15: Graphs [Concepts & Problems]",
        "qno": 382,
        "title": "Articulation Point",
        "difficulty": "Hard",
        "youtube_url": "https://youtu.be/j1QDfU21iZk",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Articulation+Point",
        "article_url": "https://takeuforward.org/?s=Articulation+Point",
        "companies": [
          "Google",
          "Microsoft",
          "Uber"
        ]
      },
      {
        "id": "striver-q-383",
        "stepNumber": 15,
        "stepName": "Step 15: Graphs [Concepts & Problems]",
        "qno": 383,
        "title": "Kosaraju's Algorithm",
        "difficulty": "Hard",
        "youtube_url": "https://youtu.be/R6uoSjZ2imo",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Kosaraju's+Algorithm",
        "article_url": "https://takeuforward.org/?s=Kosaraju's+Algorithm",
        "companies": [
          "Apple",
          "Amazon",
          "Netflix"
        ]
      }
    ]
  },
  {
    "id": "step-16",
    "stepNumber": 16,
    "title": "Step 16: Dynamic Programming [Patterns and Problems]",
    "stepRange": "Q384 - Q439",
    "description": "56 curated problems covering Dynamic Programming [Patterns and Problems]",
    "problems": [
      {
        "id": "striver-q-384",
        "stepNumber": 16,
        "stepName": "Step 16: Dynamic Programming [Patterns and Problems]",
        "qno": 384,
        "title": "Dynamic Programming Introduction",
        "difficulty": "Easy",
        "youtube_url": "https://youtu.be/tyB0ztf0DNY",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Dynamic+Programming+Introduction",
        "article_url": "https://takeuforward.org/?s=Dynamic+Programming+Introduction",
        "companies": [
          "Google",
          "Amazon",
          "Microsoft"
        ]
      },
      {
        "id": "striver-q-385",
        "stepNumber": 16,
        "stepName": "Step 16: Dynamic Programming [Patterns and Problems]",
        "qno": 385,
        "title": "Climbing Stars",
        "difficulty": "Easy",
        "youtube_url": "https://youtu.be/mLfjzJsN8us",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Climbing+Stars",
        "article_url": "https://takeuforward.org/?s=Climbing+Stars",
        "companies": [
          "Amazon",
          "Microsoft",
          "Meta"
        ]
      },
      {
        "id": "striver-q-386",
        "stepNumber": 16,
        "stepName": "Step 16: Dynamic Programming [Patterns and Problems]",
        "qno": 386,
        "title": "Frog Jump(DP-3)",
        "difficulty": "Easy",
        "youtube_url": "https://www.youtube.com/watch?v=EgG3jsGoPvQ",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Frog+Jump",
        "article_url": "https://takeuforward.org/?s=Frog+Jump",
        "companies": [
          "Google",
          "Apple",
          "Uber"
        ]
      },
      {
        "id": "striver-q-387",
        "stepNumber": 16,
        "stepName": "Step 16: Dynamic Programming [Patterns and Problems]",
        "qno": 387,
        "title": "Frog Jump with k distances(DP-4)",
        "difficulty": "Easy",
        "youtube_url": "https://www.youtube.com/watch?v=Kmh3rhyEtB8",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Frog+Jump+with+k+distances",
        "article_url": "https://takeuforward.org/?s=Frog+Jump+with+k+distances",
        "companies": [
          "Microsoft",
          "Goldman Sachs",
          "Amazon"
        ]
      },
      {
        "id": "striver-q-388",
        "stepNumber": 16,
        "stepName": "Step 16: Dynamic Programming [Patterns and Problems]",
        "qno": 388,
        "title": "Maximum sum of non-adjacent elements (DP 5)",
        "difficulty": "Medium",
        "youtube_url": "https://www.youtube.com/watch?v=GrMBfJNk_NY",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Maximum+sum+of+non-adjacent+elements",
        "article_url": "https://takeuforward.org/?s=Maximum+sum+of+non-adjacent+elements",
        "companies": [
          "Meta",
          "Google",
          "Bloomberg"
        ]
      },
      {
        "id": "striver-q-389",
        "stepNumber": 16,
        "stepName": "Step 16: Dynamic Programming [Patterns and Problems]",
        "qno": 389,
        "title": "House Robber (DP 6)",
        "difficulty": "Medium",
        "youtube_url": "https://www.youtube.com/watch?v=3WaxQMELSkw",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=House+Robber",
        "article_url": "https://takeuforward.org/?s=House+Robber",
        "companies": [
          "Amazon",
          "Adobe",
          "Flipkart"
        ]
      },
      {
        "id": "striver-q-390",
        "stepNumber": 16,
        "stepName": "Step 16: Dynamic Programming [Patterns and Problems]",
        "qno": 390,
        "title": "Ninja's Training (DP 7)",
        "difficulty": "Medium",
        "youtube_url": "https://www.youtube.com/watch?v=AE39gJYuRog",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Ninja's+Training",
        "article_url": "https://takeuforward.org/?s=Ninja's+Training",
        "companies": [
          "Google",
          "Microsoft",
          "Uber"
        ]
      },
      {
        "id": "striver-q-391",
        "stepNumber": 16,
        "stepName": "Step 16: Dynamic Programming [Patterns and Problems]",
        "qno": 391,
        "title": "Grid Unique Paths : DP on Grids (DP8)",
        "difficulty": "Medium",
        "youtube_url": "https://www.youtube.com/watch?v=sdE0A2Oxofw",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Grid+Unique+Paths+:+DP+on+Grids",
        "article_url": "https://takeuforward.org/?s=Grid+Unique+Paths+:+DP+on+Grids",
        "companies": [
          "Apple",
          "Amazon",
          "Netflix"
        ]
      },
      {
        "id": "striver-q-392",
        "stepNumber": 16,
        "stepName": "Step 16: Dynamic Programming [Patterns and Problems]",
        "qno": 392,
        "title": "Grid Unique Paths 2 (DP 9)",
        "difficulty": "Medium",
        "youtube_url": "https://www.youtube.com/watch?v=TmhpgXScLyY",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Grid+Unique+Paths+2",
        "article_url": "https://takeuforward.org/?s=Grid+Unique+Paths+2",
        "companies": [
          "Google",
          "Amazon",
          "Microsoft"
        ]
      },
      {
        "id": "striver-q-393",
        "stepNumber": 16,
        "stepName": "Step 16: Dynamic Programming [Patterns and Problems]",
        "qno": 393,
        "title": "Minimum path sum in Grid (DP 10)",
        "difficulty": "Medium",
        "youtube_url": "https://www.youtube.com/watch?v=_rgTlyky1uQ",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Minimum+path+sum+in+Grid",
        "article_url": "https://takeuforward.org/?s=Minimum+path+sum+in+Grid",
        "companies": [
          "Amazon",
          "Microsoft",
          "Meta"
        ]
      },
      {
        "id": "striver-q-394",
        "stepNumber": 16,
        "stepName": "Step 16: Dynamic Programming [Patterns and Problems]",
        "qno": 394,
        "title": "Minimum path sum in Triangular Grid (DP 11)",
        "difficulty": "Medium",
        "youtube_url": "https://www.youtube.com/watch?v=SrP-PiLSYC0",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Minimum+path+sum+in+Triangular+Grid",
        "article_url": "https://takeuforward.org/?s=Minimum+path+sum+in+Triangular+Grid",
        "companies": [
          "Google",
          "Apple",
          "Uber"
        ]
      },
      {
        "id": "striver-q-395",
        "stepNumber": 16,
        "stepName": "Step 16: Dynamic Programming [Patterns and Problems]",
        "qno": 395,
        "title": "Minimum/Maximum Falling Path Sum (DP-12)",
        "difficulty": "Medium",
        "youtube_url": "https://www.youtube.com/watch?v=N_aJ5qQbYA0",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Minimum/Maximum+Falling+Path+Sum",
        "article_url": "https://takeuforward.org/?s=Minimum/Maximum+Falling+Path+Sum",
        "companies": [
          "Microsoft",
          "Goldman Sachs",
          "Amazon"
        ]
      },
      {
        "id": "striver-q-396",
        "stepNumber": 16,
        "stepName": "Step 16: Dynamic Programming [Patterns and Problems]",
        "qno": 396,
        "title": "3-d DP : Ninja and his friends (DP-13)",
        "difficulty": "Medium",
        "youtube_url": "https://www.youtube.com/watch?v=QGfn7JeXK54",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=3-d+DP+:+Ninja+and+his+friends",
        "article_url": "https://takeuforward.org/?s=3-d+DP+:+Ninja+and+his+friends",
        "companies": [
          "Meta",
          "Google",
          "Bloomberg"
        ]
      },
      {
        "id": "striver-q-397",
        "stepNumber": 16,
        "stepName": "Step 16: Dynamic Programming [Patterns and Problems]",
        "qno": 397,
        "title": "Subset sum equal to target (DP- 14)",
        "difficulty": "Medium",
        "youtube_url": "https://www.youtube.com/watch?v=fWX9xDmIzRI",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Subset+sum+equal+to+target",
        "article_url": "https://takeuforward.org/?s=Subset+sum+equal+to+target",
        "companies": [
          "Amazon",
          "Adobe",
          "Flipkart"
        ]
      },
      {
        "id": "striver-q-398",
        "stepNumber": 16,
        "stepName": "Step 16: Dynamic Programming [Patterns and Problems]",
        "qno": 398,
        "title": "Partition Equal Subset Sum (DP- 15)",
        "difficulty": "Medium",
        "youtube_url": "https://www.youtube.com/watch?v=7win3dcgo3k",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Partition+Equal+Subset+Sum",
        "article_url": "https://takeuforward.org/?s=Partition+Equal+Subset+Sum",
        "companies": [
          "Google",
          "Microsoft",
          "Uber"
        ]
      },
      {
        "id": "striver-q-399",
        "stepNumber": 16,
        "stepName": "Step 16: Dynamic Programming [Patterns and Problems]",
        "qno": 399,
        "title": "Partition Set Into 2 Subsets With Min Absolute Sum Diff (DP- 16)",
        "difficulty": "Medium",
        "youtube_url": "https://www.youtube.com/watch?v=GS_OqZb2CWc",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Partition+Set+Into+2+Subsets+With+Min+Absolute+Sum+Diff",
        "article_url": "https://takeuforward.org/?s=Partition+Set+Into+2+Subsets+With+Min+Absolute+Sum+Diff",
        "companies": [
          "Apple",
          "Amazon",
          "Netflix"
        ]
      },
      {
        "id": "striver-q-400",
        "stepNumber": 16,
        "stepName": "Step 16: Dynamic Programming [Patterns and Problems]",
        "qno": 400,
        "title": "Count Subsets with Sum K (DP - 17)",
        "difficulty": "Medium",
        "youtube_url": "https://www.youtube.com/watch?v=ZHyb-A2Mte4",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Count+Subsets+with+Sum+K",
        "article_url": "https://takeuforward.org/?s=Count+Subsets+with+Sum+K",
        "companies": [
          "Google",
          "Amazon",
          "Microsoft"
        ]
      },
      {
        "id": "striver-q-401",
        "stepNumber": 16,
        "stepName": "Step 16: Dynamic Programming [Patterns and Problems]",
        "qno": 401,
        "title": "Count Partitions with Given Difference (DP - 18)",
        "difficulty": "Medium",
        "youtube_url": "https://www.youtube.com/watch?v=zoilQD1kYSg",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Count+Partitions+with+Given+Difference",
        "article_url": "https://takeuforward.org/?s=Count+Partitions+with+Given+Difference",
        "companies": [
          "Amazon",
          "Microsoft",
          "Meta"
        ]
      },
      {
        "id": "striver-q-402",
        "stepNumber": 16,
        "stepName": "Step 16: Dynamic Programming [Patterns and Problems]",
        "qno": 402,
        "title": "Assign Cookies",
        "difficulty": "Easy",
        "youtube_url": "https://youtu.be/DIX2p7vb9co?si=6G7JzMZ2TSP_LWSG",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Assign+Cookies",
        "article_url": "https://takeuforward.org/?s=Assign+Cookies",
        "companies": [
          "Google",
          "Apple",
          "Uber"
        ]
      },
      {
        "id": "striver-q-403",
        "stepNumber": 16,
        "stepName": "Step 16: Dynamic Programming [Patterns and Problems]",
        "qno": 403,
        "title": "Minimum Coins (DP - 20)",
        "difficulty": "Medium",
        "youtube_url": "https://www.youtube.com/watch?v=myPeWb3Y68A",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Minimum+Coins",
        "article_url": "https://takeuforward.org/?s=Minimum+Coins",
        "companies": [
          "Microsoft",
          "Goldman Sachs",
          "Amazon"
        ]
      },
      {
        "id": "striver-q-404",
        "stepNumber": 16,
        "stepName": "Step 16: Dynamic Programming [Patterns and Problems]",
        "qno": 404,
        "title": "Target Sum (DP - 21)",
        "difficulty": "Medium",
        "youtube_url": "https://www.youtube.com/watch?v=b3GD8263-PQ",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Target+Sum",
        "article_url": "https://takeuforward.org/?s=Target+Sum",
        "companies": [
          "Meta",
          "Google",
          "Bloomberg"
        ]
      },
      {
        "id": "striver-q-405",
        "stepNumber": 16,
        "stepName": "Step 16: Dynamic Programming [Patterns and Problems]",
        "qno": 405,
        "title": "Coin Change 2 (DP - 22)",
        "difficulty": "Medium",
        "youtube_url": "https://www.youtube.com/watch?v=HgyouUi11zk",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Coin+Change+2",
        "article_url": "https://takeuforward.org/?s=Coin+Change+2",
        "companies": [
          "Amazon",
          "Adobe",
          "Flipkart"
        ]
      },
      {
        "id": "striver-q-406",
        "stepNumber": 16,
        "stepName": "Step 16: Dynamic Programming [Patterns and Problems]",
        "qno": 406,
        "title": "Unbounded Knapsack (DP - 23)",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/OgvOZ6OrJoY",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Unbounded+Knapsack",
        "article_url": "https://takeuforward.org/?s=Unbounded+Knapsack",
        "companies": [
          "Google",
          "Microsoft",
          "Uber"
        ]
      },
      {
        "id": "striver-q-407",
        "stepNumber": 16,
        "stepName": "Step 16: Dynamic Programming [Patterns and Problems]",
        "qno": 407,
        "title": "Rod Cutting Problem | (DP - 24)",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/mO8XpGoJwuo",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Rod+Cutting+Problem",
        "article_url": "https://takeuforward.org/?s=Rod+Cutting+Problem",
        "companies": [
          "Apple",
          "Amazon",
          "Netflix"
        ]
      },
      {
        "id": "striver-q-408",
        "stepNumber": 16,
        "stepName": "Step 16: Dynamic Programming [Patterns and Problems]",
        "qno": 408,
        "title": "Longest Common Subsequence | (DP - 25)",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/NPZn9jBrX8U",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Longest+Common+Subsequence",
        "article_url": "https://takeuforward.org/?s=Longest+Common+Subsequence",
        "companies": [
          "Google",
          "Amazon",
          "Microsoft"
        ]
      },
      {
        "id": "striver-q-409",
        "stepNumber": 16,
        "stepName": "Step 16: Dynamic Programming [Patterns and Problems]",
        "qno": 409,
        "title": "Print Longest Common Subsequence | (DP - 26)",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/-zI4mrF2Pb4",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Print+Longest+Common+Subsequence",
        "article_url": "https://takeuforward.org/?s=Print+Longest+Common+Subsequence",
        "companies": [
          "Amazon",
          "Microsoft",
          "Meta"
        ]
      },
      {
        "id": "striver-q-410",
        "stepNumber": 16,
        "stepName": "Step 16: Dynamic Programming [Patterns and Problems]",
        "qno": 410,
        "title": "Longest Common Substring | (DP - 27)",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/_wP9mWNPL5w",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Longest+Common+Substring",
        "article_url": "https://takeuforward.org/?s=Longest+Common+Substring",
        "companies": [
          "Google",
          "Apple",
          "Uber"
        ]
      },
      {
        "id": "striver-q-411",
        "stepNumber": 16,
        "stepName": "Step 16: Dynamic Programming [Patterns and Problems]",
        "qno": 411,
        "title": "Longest Palindromic Subsequence | (DP-28)",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/6i_T5kkfv4A",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Longest+Palindromic+Subsequence",
        "article_url": "https://takeuforward.org/?s=Longest+Palindromic+Subsequence",
        "companies": [
          "Microsoft",
          "Goldman Sachs",
          "Amazon"
        ]
      },
      {
        "id": "striver-q-412",
        "stepNumber": 16,
        "stepName": "Step 16: Dynamic Programming [Patterns and Problems]",
        "qno": 412,
        "title": "Minimum insertions to make string palindrome | DP-29",
        "difficulty": "Medium",
        "youtube_url": "https://www.youtube.com/watch?v=xPBLEj41rFU",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Minimum+insertions+to+make+string+palindrome",
        "article_url": "https://takeuforward.org/?s=Minimum+insertions+to+make+string+palindrome",
        "companies": [
          "Meta",
          "Google",
          "Bloomberg"
        ]
      },
      {
        "id": "striver-q-413",
        "stepNumber": 16,
        "stepName": "Step 16: Dynamic Programming [Patterns and Problems]",
        "qno": 413,
        "title": "Minimum Insertions/Deletions to Convert String | (DP- 30)",
        "difficulty": "Medium",
        "youtube_url": "https://www.youtube.com/watch?v=yMnH0jrir0Q",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Minimum+Insertions/Deletions+to+Convert+String",
        "article_url": "https://takeuforward.org/?s=Minimum+Insertions/Deletions+to+Convert+String",
        "companies": [
          "Amazon",
          "Adobe",
          "Flipkart"
        ]
      },
      {
        "id": "striver-q-414",
        "stepNumber": 16,
        "stepName": "Step 16: Dynamic Programming [Patterns and Problems]",
        "qno": 414,
        "title": "Shortest Common Supersequence | (DP - 31)",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/xElxAuBcvsU",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Shortest+Common+Supersequence",
        "article_url": "https://takeuforward.org/?s=Shortest+Common+Supersequence",
        "companies": [
          "Google",
          "Microsoft",
          "Uber"
        ]
      },
      {
        "id": "striver-q-415",
        "stepNumber": 16,
        "stepName": "Step 16: Dynamic Programming [Patterns and Problems]",
        "qno": 415,
        "title": "Distinct Subsequences| (DP-32)",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/nVG7eTiD2bY",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Distinct+Subsequences",
        "article_url": "https://takeuforward.org/?s=Distinct+Subsequences",
        "companies": [
          "Apple",
          "Amazon",
          "Netflix"
        ]
      },
      {
        "id": "striver-q-416",
        "stepNumber": 16,
        "stepName": "Step 16: Dynamic Programming [Patterns and Problems]",
        "qno": 416,
        "title": "Edit Distance | (DP-33)",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/fJaKO8FbDdo",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Edit+Distance",
        "article_url": "https://takeuforward.org/?s=Edit+Distance",
        "companies": [
          "Google",
          "Amazon",
          "Microsoft"
        ]
      },
      {
        "id": "striver-q-417",
        "stepNumber": 16,
        "stepName": "Step 16: Dynamic Programming [Patterns and Problems]",
        "qno": 417,
        "title": "Wildcard Matching | (DP-34)",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/ZmlQ3vgAOMo",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Wildcard+Matching",
        "article_url": "https://takeuforward.org/?s=Wildcard+Matching",
        "companies": [
          "Amazon",
          "Microsoft",
          "Meta"
        ]
      },
      {
        "id": "striver-q-418",
        "stepNumber": 16,
        "stepName": "Step 16: Dynamic Programming [Patterns and Problems]",
        "qno": 418,
        "title": "Best Time to Buy and Sell Stock |(DP-35)",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/excAOvwF_Wk",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Best+Time+to+Buy+and+Sell+Stock",
        "article_url": "https://takeuforward.org/?s=Best+Time+to+Buy+and+Sell+Stock",
        "companies": [
          "Google",
          "Apple",
          "Uber"
        ]
      },
      {
        "id": "striver-q-419",
        "stepNumber": 16,
        "stepName": "Step 16: Dynamic Programming [Patterns and Problems]",
        "qno": 419,
        "title": "Buy and Sell Stock - II|(DP-36)",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/nGJmxkUJQGs",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Buy+and+Sell+Stock+-+II",
        "article_url": "https://takeuforward.org/?s=Buy+and+Sell+Stock+-+II",
        "companies": [
          "Microsoft",
          "Goldman Sachs",
          "Amazon"
        ]
      },
      {
        "id": "striver-q-420",
        "stepNumber": 16,
        "stepName": "Step 16: Dynamic Programming [Patterns and Problems]",
        "qno": 420,
        "title": "Buy and Sell Stocks III|(DP-37)",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/-uQGzhYj8BQ",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Buy+and+Sell+Stocks+III",
        "article_url": "https://takeuforward.org/?s=Buy+and+Sell+Stocks+III",
        "companies": [
          "Meta",
          "Google",
          "Bloomberg"
        ]
      },
      {
        "id": "striver-q-421",
        "stepNumber": 16,
        "stepName": "Step 16: Dynamic Programming [Patterns and Problems]",
        "qno": 421,
        "title": "Buy and Stock Sell IV |(DP-38)",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/IV1dHbk5CDc",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Buy+and+Stock+Sell+IV",
        "article_url": "https://takeuforward.org/?s=Buy+and+Stock+Sell+IV",
        "companies": [
          "Amazon",
          "Adobe",
          "Flipkart"
        ]
      },
      {
        "id": "striver-q-422",
        "stepNumber": 16,
        "stepName": "Step 16: Dynamic Programming [Patterns and Problems]",
        "qno": 422,
        "title": "Buy and Sell Stocks With Cooldown|(DP-39)",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/IGIe46xw3YY",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Buy+and+Sell+Stocks+With+Cooldown",
        "article_url": "https://takeuforward.org/?s=Buy+and+Sell+Stocks+With+Cooldown",
        "companies": [
          "Google",
          "Microsoft",
          "Uber"
        ]
      },
      {
        "id": "striver-q-423",
        "stepNumber": 16,
        "stepName": "Step 16: Dynamic Programming [Patterns and Problems]",
        "qno": 423,
        "title": "Buy and Sell Stocks With Transaction Fee|(DP-40)",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/k4eK-vEmnKg",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Buy+and+Sell+Stocks+With+Transaction+Fee",
        "article_url": "https://takeuforward.org/?s=Buy+and+Sell+Stocks+With+Transaction+Fee",
        "companies": [
          "Apple",
          "Amazon",
          "Netflix"
        ]
      },
      {
        "id": "striver-q-424",
        "stepNumber": 16,
        "stepName": "Step 16: Dynamic Programming [Patterns and Problems]",
        "qno": 424,
        "title": "Longest Increasing Subsequence |(DP-41)",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/ekcwMsSIzVc",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Longest+Increasing+Subsequence",
        "article_url": "https://takeuforward.org/?s=Longest+Increasing+Subsequence",
        "companies": [
          "Google",
          "Amazon",
          "Microsoft"
        ]
      },
      {
        "id": "striver-q-425",
        "stepNumber": 16,
        "stepName": "Step 16: Dynamic Programming [Patterns and Problems]",
        "qno": 425,
        "title": "Printing Longest Increasing Subsequence|(DP-42)",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/IFfYfonAFGc",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Printing+Longest+Increasing+Subsequence",
        "article_url": "https://takeuforward.org/?s=Printing+Longest+Increasing+Subsequence",
        "companies": [
          "Amazon",
          "Microsoft",
          "Meta"
        ]
      },
      {
        "id": "striver-q-426",
        "stepNumber": 16,
        "stepName": "Step 16: Dynamic Programming [Patterns and Problems]",
        "qno": 426,
        "title": "Longest Increasing Subsequence |(DP-43)",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/on2hvxBXJH4",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Longest+Increasing+Subsequence",
        "article_url": "https://takeuforward.org/?s=Longest+Increasing+Subsequence",
        "companies": [
          "Google",
          "Apple",
          "Uber"
        ]
      },
      {
        "id": "striver-q-427",
        "stepNumber": 16,
        "stepName": "Step 16: Dynamic Programming [Patterns and Problems]",
        "qno": 427,
        "title": "Largest Divisible Subset|(DP-44)",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/gDuZwBW9VvM",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Largest+Divisible+Subset",
        "article_url": "https://takeuforward.org/?s=Largest+Divisible+Subset",
        "companies": [
          "Microsoft",
          "Goldman Sachs",
          "Amazon"
        ]
      },
      {
        "id": "striver-q-428",
        "stepNumber": 16,
        "stepName": "Step 16: Dynamic Programming [Patterns and Problems]",
        "qno": 428,
        "title": "Longest String Chain|(DP-45)",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/YY8iBaYcc4g",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Longest+String+Chain",
        "article_url": "https://takeuforward.org/?s=Longest+String+Chain",
        "companies": [
          "Meta",
          "Google",
          "Bloomberg"
        ]
      },
      {
        "id": "striver-q-429",
        "stepNumber": 16,
        "stepName": "Step 16: Dynamic Programming [Patterns and Problems]",
        "qno": 429,
        "title": "Longest Bitonic Subsequence |(DP-46)",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/y4vN0WNdrlg",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Longest+Bitonic+Subsequence",
        "article_url": "https://takeuforward.org/?s=Longest+Bitonic+Subsequence",
        "companies": [
          "Amazon",
          "Adobe",
          "Flipkart"
        ]
      },
      {
        "id": "striver-q-430",
        "stepNumber": 16,
        "stepName": "Step 16: Dynamic Programming [Patterns and Problems]",
        "qno": 430,
        "title": "Number of Longest Increasing Subsequences|(DP-47)",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/cKVl1TFdNXg",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Number+of+Longest+Increasing+Subsequences",
        "article_url": "https://takeuforward.org/?s=Number+of+Longest+Increasing+Subsequences",
        "companies": [
          "Google",
          "Microsoft",
          "Uber"
        ]
      },
      {
        "id": "striver-q-431",
        "stepNumber": 16,
        "stepName": "Step 16: Dynamic Programming [Patterns and Problems]",
        "qno": 431,
        "title": "Matrix Chain Multiplication|(DP-48)",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/vRVfmbCFW7Y",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Matrix+Chain+Multiplication",
        "article_url": "https://takeuforward.org/?s=Matrix+Chain+Multiplication",
        "companies": [
          "Apple",
          "Amazon",
          "Netflix"
        ]
      },
      {
        "id": "striver-q-432",
        "stepNumber": 16,
        "stepName": "Step 16: Dynamic Programming [Patterns and Problems]",
        "qno": 432,
        "title": "Matrix Chain Multiplication | Bottom-Up|(DP-49)",
        "difficulty": "Hard",
        "youtube_url": "https://youtu.be/pDCXsbAw5Cg",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Matrix+Chain+Multiplication",
        "article_url": "https://takeuforward.org/?s=Matrix+Chain+Multiplication",
        "companies": [
          "Google",
          "Amazon",
          "Microsoft"
        ]
      },
      {
        "id": "striver-q-433",
        "stepNumber": 16,
        "stepName": "Step 16: Dynamic Programming [Patterns and Problems]",
        "qno": 433,
        "title": "Minimum Cost to Cut the Stick|(DP-50)",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/xwomavsC86c",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Minimum+Cost+to+Cut+the+Stick",
        "article_url": "https://takeuforward.org/?s=Minimum+Cost+to+Cut+the+Stick",
        "companies": [
          "Amazon",
          "Microsoft",
          "Meta"
        ]
      },
      {
        "id": "striver-q-434",
        "stepNumber": 16,
        "stepName": "Step 16: Dynamic Programming [Patterns and Problems]",
        "qno": 434,
        "title": "Burst Balloons|(DP-51)",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/Yz4LlDSlkns",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Burst+Balloons",
        "article_url": "https://takeuforward.org/?s=Burst+Balloons",
        "companies": [
          "Google",
          "Apple",
          "Uber"
        ]
      },
      {
        "id": "striver-q-435",
        "stepNumber": 16,
        "stepName": "Step 16: Dynamic Programming [Patterns and Problems]",
        "qno": 435,
        "title": "Evaluate Boolean Expression to True|(DP-52)",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/MM7fXopgyjw",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Evaluate+Boolean+Expression+to+True",
        "article_url": "https://takeuforward.org/?s=Evaluate+Boolean+Expression+to+True",
        "companies": [
          "Microsoft",
          "Goldman Sachs",
          "Amazon"
        ]
      },
      {
        "id": "striver-q-436",
        "stepNumber": 16,
        "stepName": "Step 16: Dynamic Programming [Patterns and Problems]",
        "qno": 436,
        "title": "Palindrome Partitioning - II|(DP-53)",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/_H8V5hJUGd0",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Palindrome+Partitioning+-+II",
        "article_url": "https://takeuforward.org/?s=Palindrome+Partitioning+-+II",
        "companies": [
          "Meta",
          "Google",
          "Bloomberg"
        ]
      },
      {
        "id": "striver-q-437",
        "stepNumber": 16,
        "stepName": "Step 16: Dynamic Programming [Patterns and Problems]",
        "qno": 437,
        "title": "Partition Array for Maximum Sum|(DP-54)",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/PhWWJmaKfMc",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Partition+Array+for+Maximum+Sum",
        "article_url": "https://takeuforward.org/?s=Partition+Array+for+Maximum+Sum",
        "companies": [
          "Amazon",
          "Adobe",
          "Flipkart"
        ]
      },
      {
        "id": "striver-q-438",
        "stepNumber": 16,
        "stepName": "Step 16: Dynamic Programming [Patterns and Problems]",
        "qno": 438,
        "title": "Maximum Rectangle Area with all 1's|(DP-55)",
        "difficulty": "Medium",
        "youtube_url": "https://youtu.be/tOylVCugy9k",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Maximum+Rectangle+Area+with+all+1's",
        "article_url": "https://takeuforward.org/?s=Maximum+Rectangle+Area+with+all+1's",
        "companies": [
          "Google",
          "Microsoft",
          "Uber"
        ]
      },
      {
        "id": "striver-q-439",
        "stepNumber": 16,
        "stepName": "Step 16: Dynamic Programming [Patterns and Problems]",
        "qno": 439,
        "title": "Count Square Submatrices with All Ones|(DP-56)",
        "difficulty": "Hard",
        "youtube_url": "https://youtu.be/auS1fynpnjo",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Count+Square+Submatrices+with+All+Ones",
        "article_url": "https://takeuforward.org/?s=Count+Square+Submatrices+with+All+Ones",
        "companies": [
          "Apple",
          "Amazon",
          "Netflix"
        ]
      }
    ]
  },
  {
    "id": "step-17",
    "stepNumber": 17,
    "title": "Step 17: Tries",
    "stepRange": "Q440 - Q446",
    "description": "7 curated problems covering Tries",
    "problems": [
      {
        "id": "striver-q-440",
        "stepNumber": 17,
        "stepName": "Step 17: Tries",
        "qno": 440,
        "title": "Implement TRIE | INSERT | SEARCH | STARTSWITH",
        "difficulty": "Easy",
        "youtube_url": "https://www.youtube.com/watch?v=dBGUmUQhjaM&list=PLgUwDviBIf0pcIDCZnxhv0LkHf5KzG9zp",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Implement+TRIE",
        "article_url": "https://takeuforward.org/?s=Implement+TRIE",
        "companies": [
          "Google",
          "Amazon",
          "Microsoft"
        ]
      },
      {
        "id": "striver-q-441",
        "stepNumber": 17,
        "stepName": "Step 17: Tries",
        "qno": 441,
        "title": "Implement Trie - 2 (Prefix Tree)",
        "difficulty": "Medium",
        "youtube_url": null,
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Implement+Trie+-+2",
        "article_url": "https://takeuforward.org/?s=Implement+Trie+-+2",
        "companies": [
          "Amazon",
          "Microsoft",
          "Meta"
        ]
      },
      {
        "id": "striver-q-442",
        "stepNumber": 17,
        "stepName": "Step 17: Tries",
        "qno": 442,
        "title": "Longest String with All Prefixes",
        "difficulty": "Medium",
        "youtube_url": "https://www.youtube.com/watch?v=AWnBa91lThI&list=PLgUwDviBIf0pcIDCZnxhv0LkHf5KzG9zp&index=3",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Longest+String+with+All+Prefixes",
        "article_url": "https://takeuforward.org/?s=Longest+String+with+All+Prefixes",
        "companies": [
          "Google",
          "Apple",
          "Uber"
        ]
      },
      {
        "id": "striver-q-443",
        "stepNumber": 17,
        "stepName": "Step 17: Tries",
        "qno": 443,
        "title": "Number of Distinct Substrings in a String",
        "difficulty": "Medium",
        "youtube_url": "https://www.youtube.com/watch?v=RV0QeTyHZxo&list=PLgUwDviBIf0pcIDCZnxhv0LkHf5KzG9zp&index=4",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Number+of+Distinct+Substrings+in+a+String",
        "article_url": "https://takeuforward.org/?s=Number+of+Distinct+Substrings+in+a+String",
        "companies": [
          "Microsoft",
          "Goldman Sachs",
          "Amazon"
        ]
      },
      {
        "id": "striver-q-444",
        "stepNumber": 17,
        "stepName": "Step 17: Tries",
        "qno": 444,
        "title": "Bit PreRequisites for TRIE Problems",
        "difficulty": "Easy",
        "youtube_url": "https://youtu.be/5iyuU4hQFrw",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Bit+PreRequisites+for+TRIE+Problems",
        "article_url": "https://takeuforward.org/?s=Bit+PreRequisites+for+TRIE+Problems",
        "companies": [
          "Meta",
          "Google",
          "Bloomberg"
        ]
      },
      {
        "id": "striver-q-445",
        "stepNumber": 17,
        "stepName": "Step 17: Tries",
        "qno": 445,
        "title": "Maximum XOR of two numbers in an array",
        "difficulty": "Medium",
        "youtube_url": "https://www.youtube.com/watch?v=EIhAwfHubE8&list=PLgUwDviBIf0pcIDCZnxhv0LkHf5KzG9zp&index=6",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Maximum+XOR+of+two+numbers+in+an+array",
        "article_url": "https://takeuforward.org/?s=Maximum+XOR+of+two+numbers+in+an+array",
        "companies": [
          "Amazon",
          "Adobe",
          "Flipkart"
        ]
      },
      {
        "id": "striver-q-446",
        "stepNumber": 17,
        "stepName": "Step 17: Tries",
        "qno": 446,
        "title": "Maximum XOR With an Element From Array",
        "difficulty": "Hard",
        "youtube_url": "https://www.youtube.com/watch?v=Q8LhG9Pi5KM&list=PLgUwDviBIf0pcIDCZnxhv0LkHf5KzG9zp&index=7",
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Maximum+XOR+With+an+Element+From+Array",
        "article_url": "https://takeuforward.org/?s=Maximum+XOR+With+an+Element+From+Array",
        "companies": [
          "Google",
          "Microsoft",
          "Uber"
        ]
      }
    ]
  },
  {
    "id": "step-18",
    "stepNumber": 18,
    "title": "Step 18: Strings",
    "stepRange": "Q447 - Q455",
    "description": "9 curated problems covering Strings",
    "problems": [
      {
        "id": "striver-q-447",
        "stepNumber": 18,
        "stepName": "Step 18: Strings",
        "qno": 447,
        "title": "Minimum number of bracket reversals needed to make an expression balanced",
        "difficulty": "Medium",
        "youtube_url": null,
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Minimum+number+of+bracket+reversals+needed+to+make+an+expression+balanced",
        "article_url": "https://takeuforward.org/?s=Minimum+number+of+bracket+reversals+needed+to+make+an+expression+balanced",
        "companies": [
          "Apple",
          "Amazon",
          "Netflix"
        ]
      },
      {
        "id": "striver-q-448",
        "stepNumber": 18,
        "stepName": "Step 18: Strings",
        "qno": 448,
        "title": "Count and say",
        "difficulty": "Medium",
        "youtube_url": null,
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Count+and+say",
        "article_url": "https://takeuforward.org/?s=Count+and+say",
        "companies": [
          "Google",
          "Amazon",
          "Microsoft"
        ]
      },
      {
        "id": "striver-q-449",
        "stepNumber": 18,
        "stepName": "Step 18: Strings",
        "qno": 449,
        "title": "Hashing In Strings | Theory",
        "difficulty": "Medium",
        "youtube_url": null,
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Hashing+In+Strings",
        "article_url": "https://takeuforward.org/?s=Hashing+In+Strings",
        "companies": [
          "Amazon",
          "Microsoft",
          "Meta"
        ]
      },
      {
        "id": "striver-q-450",
        "stepNumber": 18,
        "stepName": "Step 18: Strings",
        "qno": 450,
        "title": "Rabin Karp",
        "difficulty": "Medium",
        "youtube_url": null,
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Rabin+Karp",
        "article_url": "https://takeuforward.org/?s=Rabin+Karp",
        "companies": [
          "Google",
          "Apple",
          "Uber"
        ]
      },
      {
        "id": "striver-q-451",
        "stepNumber": 18,
        "stepName": "Step 18: Strings",
        "qno": 451,
        "title": "Z-Function",
        "difficulty": "Medium",
        "youtube_url": null,
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Z-Function",
        "article_url": "https://takeuforward.org/?s=Z-Function",
        "companies": [
          "Microsoft",
          "Goldman Sachs",
          "Amazon"
        ]
      },
      {
        "id": "striver-q-452",
        "stepNumber": 18,
        "stepName": "Step 18: Strings",
        "qno": 452,
        "title": "KMP algo / LPS(pi) array",
        "difficulty": "Medium",
        "youtube_url": null,
        "leetcode_url": "https://leetcode.com/problemset/all/?search=KMP+algo+/+LPS+array",
        "article_url": "https://takeuforward.org/?s=KMP+algo+/+LPS+array",
        "companies": [
          "Meta",
          "Google",
          "Bloomberg"
        ]
      },
      {
        "id": "striver-q-453",
        "stepNumber": 18,
        "stepName": "Step 18: Strings",
        "qno": 453,
        "title": "Shortest Palindrome",
        "difficulty": "Medium",
        "youtube_url": null,
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Shortest+Palindrome",
        "article_url": "https://takeuforward.org/?s=Shortest+Palindrome",
        "companies": [
          "Amazon",
          "Adobe",
          "Flipkart"
        ]
      },
      {
        "id": "striver-q-454",
        "stepNumber": 18,
        "stepName": "Step 18: Strings",
        "qno": 454,
        "title": "Longest happy prefix",
        "difficulty": "Medium",
        "youtube_url": null,
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Longest+happy+prefix",
        "article_url": "https://takeuforward.org/?s=Longest+happy+prefix",
        "companies": [
          "Google",
          "Microsoft",
          "Uber"
        ]
      },
      {
        "id": "striver-q-455",
        "stepNumber": 18,
        "stepName": "Step 18: Strings",
        "qno": 455,
        "title": "Count palindromic subsequence in given string",
        "difficulty": "Hard",
        "youtube_url": null,
        "leetcode_url": "https://leetcode.com/problemset/all/?search=Count+palindromic+subsequence+in+given+string",
        "article_url": "https://takeuforward.org/?s=Count+palindromic+subsequence+in+given+string",
        "companies": [
          "Apple",
          "Amazon",
          "Netflix"
        ]
      }
    ]
  }
];
