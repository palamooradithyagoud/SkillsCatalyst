export type Difficulty = "Easy" | "Medium" | "Hard";

export interface ShradhaRawQuestion {
  qno: number;
  title: string;
  difficulty: Difficulty;
  article_url?: string;
  youtube_url?: string;
  leetcode_url: string;
  companies: string[];
}

export interface ShradhaDaySection {
  day: number;
  section: string;
  questions: ShradhaRawQuestion[];
}

export interface ShradhaProblem {
  id: string;
  qno: number;
  title: string;
  difficulty: Difficulty;
  article_url?: string;
  youtube_url?: string;
  leetcode_url: string;
  url: string;
  companies: string[];
  day: number;
  section: string;
}

export interface ShradhaCategory {
  id: string;
  day: number;
  title: string;
  dayRange: string;
  description: string;
  problems: ShradhaProblem[];
}

export const SHRADHA_SHEET_RAW_DATA: ShradhaDaySection[] = [
  {
    day: 1,
    section: "Array Part 1",
    questions: [
      {
        qno: 1,
        title: "Repeat & Missing Number",
        difficulty: "Easy",
        article_url: "https://www.geeksforgeeks.org/find-a-repeating-and-a-missing-number/",
        youtube_url: "https://www.youtube.com/watch?v=0Fxc_jKj2vo&t=1321s",
        leetcode_url: "https://leetcode.com/problems/find-missing-and-repeated-values/description/",
        companies: ["Amazon"],
      },
      {
        qno: 2,
        title: "Merge 2 Sorted Arrays Without Extra Space",
        difficulty: "Easy",
        article_url: "https://www.geeksforgeeks.org/merge-two-sorted-arrays-o1-extra-space/",
        youtube_url: "https://www.youtube.com/watch?v=-1cLK6PaLsQ&t=30s",
        leetcode_url: "https://leetcode.com/problems/merge-sorted-array/description/",
        companies: [
          "Adobe",
          "Zoho",
          "Synopsys",
          "Snapdeal",
          "Quikr",
          "Microsoft",
          "LinkedIn",
          "Networks",
          "Juniper",
          "Goldman Sachs",
          "Brocade",
          "Amdocs",
        ],
      },
      {
        qno: 3,
        title: "Majority Element",
        difficulty: "Easy",
        article_url: "https://www.geeksforgeeks.org/majority-element/",
        youtube_url: "https://www.youtube.com/watch?v=_xqIp2rj8bo&t=882s",
        leetcode_url: "https://leetcode.com/problems/majority-element/description/",
        companies: ["Amazon", "Google"],
      },
      {
        qno: 4,
        title: "Single Number",
        difficulty: "Easy",
        article_url: "https://www.geeksforgeeks.org/find-the-number-occurring-odd-number-of-times/",
        youtube_url: "https://www.youtube.com/watch?v=qsbCBduIs40&t=19s",
        leetcode_url: "https://leetcode.com/problems/single-number/description/",
        companies: [
          "Zoho",
          "Airbnb",
          "Qualcomm",
          "Meta",
          "Microsoft",
          "Google",
          "Uber",
          "Amazon",
          "Apple",
          "Adobe",
          "TCS",
        ],
      },
      {
        qno: 5,
        title: "Stock Buy & Sell",
        difficulty: "Easy",
        article_url: "https://www.geeksforgeeks.org/best-time-to-buy-and-sell-stock/",
        youtube_url: "https://www.youtube.com/watch?v=WBzZCm46mFo&t=835s",
        leetcode_url: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/description/",
        companies: [
          "Goldman Sachs",
          "Media.Net",
          "Walmart",
          "Oracle",
          "Ola",
          "Amazon",
          "Microsoft",
          "Paytm",
          "Pubmatic",
          "MakeMyTrip",
          "Swiggy",
          "DE Shaw",
          "Directi",
          "Intuit",
          "Flipkart",
          "Google",
          "Salesforce",
          "Quikr",
        ],
      },
      {
        qno: 6,
        title: "Pow (xⁿ)",
        difficulty: "Medium",
        article_url: "https://www.geeksforgeeks.org/write-a-c-program-to-calculate-powx-n/",
        youtube_url: "https://www.youtube.com/watch?v=WBzZCm46mFo&t=21s",
        leetcode_url: "https://leetcode.com/problems/powx-n/description/",
        companies: [
          "Citadel",
          "Salesforce",
          "Microsoft",
          "Oracle",
          "LinkedIn",
          "Meta",
          "Amazon",
          "Google",
          "JP Morgan",
        ],
      },
    ],
  },
];

export const SHRADHA_DSA_CATEGORIES: ShradhaCategory[] = SHRADHA_SHEET_RAW_DATA.map((dayData) => ({
  id: `day-${dayData.day}`,
  day: dayData.day,
  title: dayData.section,
  dayRange: `Day ${dayData.day}`,
  description: `Master high-frequency ${dayData.section.toLowerCase()} interview problems asked by top tech giants.`,
  problems: dayData.questions.map((q) => ({
    id: `day${dayData.day}-q${q.qno}`,
    qno: q.qno,
    title: q.title,
    difficulty: q.difficulty,
    article_url: q.article_url,
    youtube_url: q.youtube_url,
    leetcode_url: q.leetcode_url,
    url: q.leetcode_url,
    companies: q.companies,
    day: dayData.day,
    section: dayData.section,
  })),
}));

export const TOTAL_SHRADHA_PROBLEMS = SHRADHA_DSA_CATEGORIES.reduce(
  (acc, cat) => acc + cat.problems.length,
  0
);
