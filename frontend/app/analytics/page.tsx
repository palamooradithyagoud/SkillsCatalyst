"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  BarChart3, TrendingUp, TrendingDown, Zap, Clock, Award, Target,
  Flame, Brain, Code2, Trophy, ArrowUpRight, ArrowDownRight,
  Calendar, Activity, BookOpen, CheckCircle2, Star, Layers,
  GitCommit, LayoutDashboard, Database, PlayCircle, Bookmark
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { fetchDashboardData, fetchSavedPlaylists, fetchProfileData } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

// ─── Problem dataset for topic mapping ───────────────────────────────────────
interface ProblemMeta {
  id: number;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  topic: string;
}

const ALL_PROBLEMS_MAP: Record<string, ProblemMeta> = {
  "26": { id: 26, title: "Remove Duplicates from Sorted Array", difficulty: "Easy", topic: "Two Pointers" },
  "27": { id: 27, title: "Remove Element", difficulty: "Easy", topic: "Two Pointers" },
  "88": { id: 88, title: "Merge Sorted Array", difficulty: "Easy", topic: "Two Pointers" },
  "283": { id: 283, title: "Move Zeroes", difficulty: "Easy", topic: "Two Pointers" },
  "349": { id: 349, title: "Intersection of Two Arrays", difficulty: "Easy", topic: "Two Pointers" },
  "350": { id: 350, title: "Intersection of Two Arrays II", difficulty: "Easy", topic: "Two Pointers" },
  "455": { id: 455, title: "Assign Cookies", difficulty: "Easy", topic: "Two Pointers" },
  "905": { id: 905, title: "Sort Array By Parity", difficulty: "Easy", topic: "Two Pointers" },
  "922": { id: 922, title: "Sort Array By Parity II", difficulty: "Easy", topic: "Two Pointers" },
  "977": { id: 977, title: "Squares of a Sorted Array", difficulty: "Easy", topic: "Two Pointers" },
  "2460": { id: 2460, title: "Apply Operations to an Array", difficulty: "Easy", topic: "Two Pointers" },
  "11": { id: 11, title: "Container With Most Water", difficulty: "Medium", topic: "Two Pointers" },
  "15": { id: 15, title: "3Sum", difficulty: "Medium", topic: "Two Pointers" },
  "16": { id: 16, title: "3Sum Closest", difficulty: "Medium", topic: "Two Pointers" },
  "18": { id: 18, title: "4Sum", difficulty: "Medium", topic: "Two Pointers" },
  "80": { id: 80, title: "Remove Duplicates from Sorted Array II", difficulty: "Medium", topic: "Two Pointers" },
  "167": { id: 167, title: "Two Sum II – Input Array Is Sorted", difficulty: "Medium", topic: "Two Pointers" },
  "189": { id: 189, title: "Rotate Array", difficulty: "Medium", topic: "Two Pointers" },
  "611": { id: 611, title: "Valid Triangle Number", difficulty: "Medium", topic: "Two Pointers" },
  "881": { id: 881, title: "Boats to Save People", difficulty: "Medium", topic: "Two Pointers" },
  "42": { id: 42, title: "Trapping Rain Water", difficulty: "Hard", topic: "Two Pointers" },

  "643": { id: 643, title: "Maximum Average Subarray I", difficulty: "Easy", topic: "Sliding Window" },
  "209": { id: 209, title: "Minimum Size Subarray Sum", difficulty: "Medium", topic: "Sliding Window" },
  "713": { id: 713, title: "Subarray Product Less Than K", difficulty: "Medium", topic: "Sliding Window" },
  "904": { id: 904, title: "Fruit Into Baskets", difficulty: "Medium", topic: "Sliding Window" },
  "930": { id: 930, title: "Binary Subarrays With Sum", difficulty: "Medium", topic: "Sliding Window" },
  "1004": { id: 1004, title: "Max Consecutive Ones III", difficulty: "Medium", topic: "Sliding Window" },
  "1052": { id: 1052, title: "Grumpy Bookstore Owner", difficulty: "Medium", topic: "Sliding Window" },
  "1248": { id: 1248, title: "Count Number of Nice Subarrays", difficulty: "Medium", topic: "Sliding Window" },
  "1343": { id: 1343, title: "Sub-arrays of Size K", difficulty: "Medium", topic: "Sliding Window" },
  "1423": { id: 1423, title: "Maximum Points from Cards", difficulty: "Medium", topic: "Sliding Window" },
  "1493": { id: 1493, title: "Longest Subarray of 1's", difficulty: "Medium", topic: "Sliding Window" },
  "1658": { id: 1658, title: "Minimum Operations to Reduce X", difficulty: "Medium", topic: "Sliding Window" },
  "1695": { id: 1695, title: "Maximum Erasure Value", difficulty: "Medium", topic: "Sliding Window" },
  "1838": { id: 1838, title: "Frequency of Most Frequent", difficulty: "Medium", topic: "Sliding Window" },
  "2024": { id: 2024, title: "Maximize Confusion of Exam", difficulty: "Medium", topic: "Sliding Window" },
  "2958": { id: 2958, title: "Longest Subarray With K Frequency", difficulty: "Medium", topic: "Sliding Window" },
  "992": { id: 992, title: "Subarrays with K Different Integers", difficulty: "Hard", topic: "Sliding Window" },

  "1480": { id: 1480, title: "Running Sum of 1d Array", difficulty: "Easy", topic: "Prefix Sum" },
  "724": { id: 724, title: "Find Pivot Index", difficulty: "Easy", topic: "Prefix Sum" },
  "303": { id: 303, title: "Range Sum Query – Immutable", difficulty: "Easy", topic: "Prefix Sum" },
  "1732": { id: 1732, title: "Find the Highest Altitude", difficulty: "Easy", topic: "Prefix Sum" },
  "1991": { id: 1991, title: "Find the Middle Index", difficulty: "Easy", topic: "Prefix Sum" },
  "238": { id: 238, title: "Product of Array Except Self", difficulty: "Medium", topic: "Prefix Sum" },
  "560": { id: 560, title: "Subarray Sum Equals K", difficulty: "Medium", topic: "Prefix Sum" },
  "525": { id: 525, topic: "Prefix Sum", title: "Contiguous Array", difficulty: "Medium" },
  "523": { id: 523, topic: "Prefix Sum", title: "Continuous Subarray Sum", difficulty: "Medium" },

  "53": { id: 53, title: "Maximum Subarray", difficulty: "Easy", topic: "Kadane's Algo" },
  "918": { id: 918, title: "Maximum Sum Circular Subarray", difficulty: "Medium", topic: "Kadane's Algo" },
  "1749": { id: 1749, title: "Maximum Absolute Sum", difficulty: "Medium", topic: "Kadane's Algo" },
  "1191": { id: 1191, title: "K-Concatenation Maximum Sum", difficulty: "Medium", topic: "Kadane's Algo" },
  "2321": { id: 2321, title: "Maximum Score Of Spliced Array", difficulty: "Hard", topic: "Kadane's Algo" },

  "1": { id: 1, title: "Two Sum", difficulty: "Easy", topic: "Frequency Map" },
  "217": { id: 217, title: "Contains Duplicate", difficulty: "Easy", topic: "Frequency Map" },
  "219": { id: 219, title: "Contains Duplicate II", difficulty: "Easy", topic: "Frequency Map" },
  "242": { id: 242, title: "Valid Anagram", difficulty: "Easy", topic: "Frequency Map" },
  "383": { id: 383, title: "Ransom Note", difficulty: "Easy", topic: "Frequency Map" },
  "387": { id: 387, title: "First Unique Character", difficulty: "Easy", topic: "Frequency Map" },
  "389": { id: 389, title: "Find the Difference", difficulty: "Easy", topic: "Frequency Map" },
  "1207": { id: 1207, title: "Unique Number of Occurrences", difficulty: "Easy", topic: "Frequency Map" },

  "704": { id: 704, title: "Binary Search", difficulty: "Easy", topic: "Binary Search" },
  "35": { id: 35, title: "Search Insert Position", difficulty: "Easy", topic: "Binary Search" },
  "69": { id: 69, title: "Sqrt(x)", difficulty: "Easy", topic: "Binary Search" },
  "278": { id: 278, title: "First Bad Version", difficulty: "Easy", topic: "Binary Search" },
  "374": { id: 374, title: "Guess Number Higher or Lower", difficulty: "Easy", topic: "Binary Search" },
  "33": { id: 33, title: "Search in Rotated Sorted Array", difficulty: "Medium", topic: "Binary Search" },
  "34": { id: 34, title: "Find First and Last Position", difficulty: "Medium", topic: "Binary Search" },
  "74": { id: 74, title: "Search a 2D Matrix", difficulty: "Medium", topic: "Binary Search" },
  "81": { id: 81, title: "Search in Rotated Sorted Array II", difficulty: "Medium", topic: "Binary Search" },
  "153": { id: 153, title: "Find Minimum in Rotated Array", difficulty: "Medium", topic: "Binary Search" },
  "162": { id: 162, title: "Find Peak Element", difficulty: "Medium", topic: "Binary Search" },
  "875": { id: 875, title: "Koko Eating Bananas", difficulty: "Medium", topic: "Binary Search" },
  "1011": { id: 1011, title: "Capacity To Ship Packages", difficulty: "Medium", topic: "Binary Search" },
};

const TOPIC_TOTALS: Record<string, number> = {
  "Two Pointers": 21,
  "Sliding Window": 17,
  "Prefix Sum": 16,
  "Kadane's Algo": 5,
  "Frequency Map": 19,
  "Binary Search": 18,
};

const TIME_RANGES = ["7D", "30D", "90D", "1Y"];

// Color scheme
const C = {
  blue: "#3b82f6",
  cyan: "#06b6d4",
  green: "#10b981",
  purple: "#8b5cf6",
  amber: "#f59e0b",
  rose: "#f43f5e",
  indigo: "#6366f1",
};

/** SVG Radar Chart */
function RadarChart({ data }: { data: { label: string; score: number }[] }) {
  const size = 220;
  const cx = size / 2, cy = size / 2, r = 80;
  const n = data.length;
  const angleStep = (2 * Math.PI) / n;
  const angle = (i: number) => -Math.PI / 2 + i * angleStep;

  const scaleR = (score: number) => (Math.min(score, 100) / 100) * r;
  const gridLevels = [20, 40, 60, 80, 100];

  const polygon = (scores: number[]) =>
    scores.map((s, i) => {
      const a = angle(i);
      const ra = scaleR(s);
      return `${cx + ra * Math.cos(a)},${cy + ra * Math.sin(a)}`;
    }).join(" ");

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto">
      {gridLevels.map((level) => (
        <polygon
          key={level}
          points={Array.from({ length: n }, (_, i) => {
            const a = angle(i);
            const ra = (level / 100) * r;
            return `${cx + ra * Math.cos(a)},${cy + ra * Math.sin(a)}`;
          }).join(" ")}
          fill="none"
          stroke="#cbd5e1"
          strokeWidth="1"
        />
      ))}
      {data.map((_, i) => (
        <line
          key={i}
          x1={cx} y1={cy}
          x2={cx + r * Math.cos(angle(i))}
          y2={cy + r * Math.sin(angle(i))}
          stroke="#cbd5e1"
          strokeWidth="1"
        />
      ))}
      <polygon
        points={polygon(data.map((d) => d.score))}
        fill="rgba(99,102,241,0.2)"
        stroke="#4f46e5"
        strokeWidth="2.5"
      />
      {data.map((d, i) => {
        const a = angle(i);
        const ra = scaleR(d.score);
        return (
          <circle
            key={i}
            cx={cx + ra * Math.cos(a)}
            cy={cy + ra * Math.sin(a)}
            r={4.5}
            fill="#4f46e5"
            stroke="#ffffff"
            strokeWidth="2"
          />
        );
      })}
      {data.map((d, i) => {
        const a = angle(i);
        const labelR = r + 20;
        const x = cx + labelR * Math.cos(a);
        const y = cy + labelR * Math.sin(a);
        return (
          <text
            key={i}
            x={x} y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="10"
            fontWeight="800"
            fill="#334155"
            fontFamily="Inter, sans-serif"
          >
            {d.label}
          </text>
        );
      })}
    </svg>
  );
}

/** Animated ring progress */
function RingProgress({ pct: p, color, size = 80, stroke = 8 }: { pct: number; color: string; size?: number; stroke?: number }) {
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const safePct = Math.min(Math.max(p, 0), 100);
  const offset = circ - (safePct / 100) * circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#e2e8f0" strokeWidth={stroke} />
      <motion.circle
        cx={size/2} cy={size/2} r={radius}
        fill="none" stroke={color} strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />
    </svg>
  );
}

function formatCompanyName(slug: string): string {
  if (!slug) return "";
  const specialMap: Record<string, string> = {
    "at-t": "AT&T",
    "bookingcom": "Booking.com",
    "c3-ai": "C3 AI",
    "f5-networks": "F5 Networks",
    "ge-digital": "GE Digital",
    "ge-healthcare": "GE Healthcare",
    "hp": "HP",
    "hpe": "HPE",
    "hrt": "HRT",
    "hsbc": "HSBC",
    "htc": "HTC",
    "ibm": "IBM",
    "imc": "IMC",
    "ivp": "IVP",
    "ixl": "IXL",
    "jd": "JD.com",
    "jpmorgan": "JPMorgan",
    "jtg": "JTG",
    "kla": "KLA",
    "kpit": "KPIT",
    "kpmg": "KPMG",
    "lti": "LTI",
    "maq-software": "MAQ Software",
    "msci": "MSCI",
    "nasdaq": "NASDAQ",
    "ncr": "NCR",
    "npci": "NPCI",
    "nvidia": "NVIDIA",
    "okx": "OKX",
    "olx": "OLX",
    "pwc": "PwC",
    "rbc": "RBC",
    "sap": "SAP",
    "sig": "SIG",
    "tcs": "TCS",
    "ubs": "UBS",
    "ukg": "UKG",
    "ust": "UST",
    "vk": "VK",
  };
  const lower = slug.toLowerCase().trim();
  if (specialMap[lower]) return specialMap[lower];
  return lower
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function AnalyticsPage() {
  const { session } = useAuth();
  const userId = session?.user_id;

  const [timeRange, setTimeRange] = useState("30D");
  const [solvedKeys, setSolvedKeys] = useState<string[]>([]);
  const [dbLeetcodeProgress, setDbLeetcodeProgress] = useState<any[]>([]);

  // Query Dashboard API
  const { data: dashboardData } = useQuery({
    queryKey: ["dashboard", userId],
    queryFn: () => fetchDashboardData(),
    enabled: !!session?.user_id,
  });

  // Query Saved Playlists API
  const { data: savedPlaylistsData } = useQuery({
    queryKey: ["saved-playlists", userId],
    queryFn: () => fetchSavedPlaylists(),
    enabled: !!session?.user_id,
  });

  // Query User Profile API (contains extracted LeetCode/GitHub stats)
  const { data: profileData } = useQuery({
    queryKey: ["profile-summary", userId],
    queryFn: () => fetchProfileData(),
    enabled: !!session?.user_id,
  });

  // Load local solved state for fallback/activity feed
  useEffect(() => {
    if (!userId) {
      setSolvedKeys([]);
      setDbLeetcodeProgress([]);
      return;
    }


    try {
      const saved = localStorage.getItem(`skillscatalyst_solved_questions_${userId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        const active = Object.keys(parsed).filter((k) => !!parsed[k]);
        setSolvedKeys(active);
      }
    } catch (e) {
      console.warn("Failed to load solved questions from localStorage", e);
    }

    async function loadSupabaseProgress() {
      try {
        const { data: lc } = await supabase
          .from("leetcode_progress")
          .select("*")
          .eq("user_id", userId);
        if (lc) setDbLeetcodeProgress(lc);
      } catch (err) {
        console.warn("Supabase progress load notice:", err);
      }
    }

    loadSupabaseProgress();
  }, [userId]);

  // Compute EXACT statistics strictly from connected coding profile data
  const stats = useMemo(() => {
    const lcStats = profileData?.coding_stats?.leetcode;
    const gfgStats = profileData?.coding_stats?.geeksforgeeks;

    const hasExternalLeetcode = lcStats && lcStats.configured && typeof lcStats.total_solved === "number" && lcStats.total_solved > 0;
    const hasExternalGfg = gfgStats && gfgStats.configured && typeof gfgStats.total_solved === "number" && gfgStats.total_solved > 0;

    let totalProblemsSolved = 0;
    let easyCount = 0;
    let mediumCount = 0;
    let hardCount = 0;

    if (hasExternalLeetcode) {
      // STRICTLY use connected LeetCode profile data (no foundation or company-wise ticked added)
      easyCount = lcStats.easy_solved || 0;
      mediumCount = lcStats.medium_solved || 0;
      hardCount = lcStats.hard_solved || 0;
      totalProblemsSolved = lcStats.total_solved || (easyCount + mediumCount + hardCount);
    } else if (hasExternalGfg) {
      easyCount = gfgStats.total_solved || 0;
      totalProblemsSolved = easyCount;
    } else {
      // Fallback: strictly if NO external coding profile is linked yet
      const allSolvedSet = new Set<string>();
      solvedKeys.forEach((k) => allSolvedSet.add(k));
      dbLeetcodeProgress.forEach((item) => {
        if (item.status === "solved") {
          if (item.question_id) allSolvedSet.add(item.question_id.toString());
        }
      });

      allSolvedSet.forEach((key) => {
        const meta = ALL_PROBLEMS_MAP[key];
        if (meta) {
          if (meta.difficulty === "Easy") easyCount++;
          else if (meta.difficulty === "Medium") mediumCount++;
          else if (meta.difficulty === "Hard") hardCount++;
        } else {
          easyCount++;
        }
      });
      totalProblemsSolved = easyCount + mediumCount + hardCount;
    }

    // Exact difficulty percentages calculated strictly against totalProblemsSolved
    const easyPct = totalProblemsSolved > 0 ? Math.round((easyCount / totalProblemsSolved) * 100) : 0;
    const mediumPct = totalProblemsSolved > 0 ? Math.round((mediumCount / totalProblemsSolved) * 100) : 0;
    const hardPct = totalProblemsSolved > 0 ? Math.max(0, 100 - easyPct - mediumPct) : 0;

    // Collect deduplicated set of solved problem IDs from localStorage drawer solved & Supabase
    const solvedDrawerIds = new Set<number>();
    const companySolvedMap: Record<string, Set<string>> = {};

    // 1. Process dbLeetcodeProgress from Supabase
    dbLeetcodeProgress.forEach((item) => {
      if (item.status === "solved" || item.status === "completed" || item.completed === true) {
        if (item.question_id) {
          const num = Number(item.question_id);
          if (!isNaN(num)) solvedDrawerIds.add(num);
        }

        const comp = (item.company_slug || "").toLowerCase().trim();
        if (comp && comp !== "foundation") {
          const qid = item.question_id ? String(item.question_id) : (item.question_title || "");
          if (qid) {
            if (!companySolvedMap[comp]) companySolvedMap[comp] = new Set();
            companySolvedMap[comp].add(qid);
          }
        }
      }
    });

    // 2. Process localStorage drawer solved & solvedKeys
    if (typeof window !== "undefined" && userId) {
      try {
        const rawDrawer = localStorage.getItem(`skillscatalyst_drawer_solved_${userId}`);
        if (rawDrawer) {
          const parsed = JSON.parse(rawDrawer);
          Object.keys(parsed).forEach((pidStr) => {
            if (parsed[pidStr]) {
              const num = Number(pidStr);
              if (!isNaN(num)) solvedDrawerIds.add(num);
            }
          });
        }
      } catch (e) {}
    }

    solvedKeys.forEach((key) => {
      const match = key.match(/^q_([a-z0-9-]+)_(\d+)_(.+)$/i);
      if (match) {
        const comp = match[1].toLowerCase().trim();
        const qid = match[2];
        if (comp && comp !== "foundation") {
          if (!companySolvedMap[comp]) companySolvedMap[comp] = new Set();
          companySolvedMap[comp].add(qid);
        }
      } else {
        const num = Number(key.replace(/^q_/, ""));
        if (!isNaN(num)) solvedDrawerIds.add(num);
      }
    });

    // 3. Exact 12 tree node specifications matching Beginner Tree Data from Practice page
    const NODE_SPECS = [
      { id: "two-pointers", label: "Two Pointers (Arrays)", total: 21, ids: [26,27,88,283,349,350,455,905,922,977,2460,11,15,16,18,80,167,189,611,881,42] },
      { id: "sliding-window-arr", label: "Sliding Window (Arrays)", total: 17, ids: [643,209,713,904,930,1004,1052,1248,1343,1423,1493,1658,1695,1838,2024,2958,992] },
      { id: "prefix-sum", label: "Prefix Sum", total: 16, ids: [1480,724,303,1732,1991,238,560,525,523,930,974,1248,1314,1352,304,327] },
      { id: "kadanes", label: "Kadane's Algorithm", total: 5, ids: [53,918,1749,1191,2321] },
      { id: "two-pointers-str", label: "Two Pointer (Strings)", total: 12, ids: [125,344,345,392,1768,28,151,443,680,165,2109,408] },
      { id: "sliding-window-str", label: "Sliding Window (Strings)", total: 9, ids: [1456,2379,3090,3,424,438,567,2516,76] },
      { id: "frequency-map", label: "Frequency Map", total: 19, ids: [1,217,219,242,383,387,389,1207,1512,169,1748,350,49,347,451,560,659,692,1636] },
      { id: "prefix-hashmap", label: "Prefix Sum + HashMap", total: 10, ids: [560,525,523,974,930,1248,1590,2845,325,437] },
      { id: "classic-bs", label: "Classic Binary Search", total: 18, ids: [704,35,69,278,374,1539,33,34,74,81,153,162,540,875,1011,1283,2226,410] },
      { id: "lower-upper-bound", label: "Lower / Upper Bound", total: 3, ids: [35,744,34] },
      { id: "bs-on-answers", label: "Binary Search on Answers", total: 13, ids: [69,367,875,1011,1283,1482,1552,1760,1870,2187,2226,2251,410] },
      { id: "search-2d-matrix", label: "Search in 2D Matrix", total: 5, ids: [240,74,1901,1428,302] },
    ];

    const topicRadarData = NODE_SPECS.map((spec) => {
      const solved = spec.ids.filter((id) => solvedDrawerIds.has(id)).length;
      const score = spec.total > 0 ? Math.min(100, Math.round((solved / spec.total) * 100)) : 0;
      return { label: spec.label, score, solved, total: spec.total };
    });

    // Company list with exact deduplicated solved counts
    const companyList = [
      "amazon", "google", "meta", "microsoft", "apple", "netflix",
      "uber", "tcs", "infosys", "accenture", "wipro", "flipkart",
      "adobe", "goldman-sachs", "deloitte"
    ].map((slug) => {
      const count = companySolvedMap[slug] ? companySolvedMap[slug].size : 0;
      const name = formatCompanyName(slug);
      return { slug, name, count };
    });

    // Real video learning metrics from dashboard API
    const completedVideos = dashboardData?.metrics?.learningProgress?.completedVideos || 0;
    const totalVideos = dashboardData?.metrics?.learningProgress?.totalVideos || 0;
    const learningPct = dashboardData?.metrics?.learningProgress?.percentage || 0;
    const savedPlaylistsCount = savedPlaylistsData?.count || savedPlaylistsData?.saved?.length || 0;

    // Streak and AI Career Health score
    const streakDays = dashboardData?.user?.streakDays || 0;
    const aiCareerHealth = dashboardData?.metrics?.aiCareerHealth?.percentage || 0;
    const successRate = dashboardData?.practiceOverview?.successRate || 0;

    return {
      problemsSolved: totalProblemsSolved,
      easyCount,
      mediumCount,
      hardCount,
      easyPct,
      mediumPct,
      hardPct,
      topicRadarData,
      companyList,
      completedVideos,
      totalVideos,
      learningPct,
      savedPlaylistsCount,
      streakDays,
      aiCareerHealth,
      successRate,
      leetcodeHandle: lcStats?.username || "",
      isProfileConnected: hasExternalLeetcode || hasExternalGfg,
    };
  }, [solvedKeys, dbLeetcodeProgress, dashboardData, savedPlaylistsData, profileData]);

  // Real recent activity events
  const realRecentActivity = useMemo(() => {
    const events: { icon: any; color: string; text: string; time: string; tag: string }[] = [];

    if (stats.leetcodeHandle) {
      events.push({
        icon: Code2,
        color: C.blue,
        text: `Connected LeetCode profile @${stats.leetcodeHandle} (${stats.problemsSolved} solved)`,
        time: "Live Sync",
        tag: "LeetCode",
      });
    }

    if (savedPlaylistsData?.saved && savedPlaylistsData.saved.length > 0) {
      savedPlaylistsData.saved.slice(-2).reverse().forEach((pl) => {
        events.push({
          icon: Bookmark,
          color: C.purple,
          text: `Saved course playlist: "${pl.title.slice(0, 35)}..."`,
          time: "Saved",
          tag: "Learning",
        });
      });
    }

    if (stats.completedVideos > 0) {
      events.push({
        icon: PlayCircle,
        color: C.green,
        text: `Completed ${stats.completedVideos} video modules in learning playlists`,
        time: "Progress",
        tag: "Videos",
      });
    }

    if (events.length === 0) {
      events.push(
        { icon: Code2, color: C.blue, text: "Linked coding platform stats in Settings", time: "Today", tag: "Profiles" },
        { icon: BookOpen, color: C.purple, text: "Explored Learning playlist repository", time: "Recently", tag: "Learning" }
      );
    }

    return events;
  }, [stats, savedPlaylistsData]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto space-y-7 pb-16 select-none"
    >
      {/* ── HEADER ────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative overflow-hidden"
      >
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/30 shrink-0">
            <LayoutDashboard className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Performance Analytics</h1>
            <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-0.5">
              Live metrics aggregated directly from your connected coding profile stats
            </p>
          </div>
        </div>

        {/* Time-range selector */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-100 border border-slate-200/90 shrink-0 z-10">
          {TIME_RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                timeRange === r
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/25"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </motion.div>

      {/* ── REAL KPI CARDS GRID ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Metric 1: Problems Solved */}
        <motion.div
          whileHover={{ y: -4 }}
          className="rounded-3xl p-5 relative overflow-hidden bg-white border border-slate-200/90 shadow-md hover:shadow-xl transition-all flex flex-col justify-between"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 font-black flex items-center justify-center mb-3 shadow-2xs">
            <Code2 className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tabular-nums leading-none mb-1">
              {stats.problemsSolved}
            </div>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Total Solved</div>
            <div className="flex items-center gap-1 text-[11px] font-extrabold text-emerald-700 bg-emerald-100/90 px-2 py-0.5 rounded-full w-max">
              <ArrowUpRight className="w-3 h-3 text-emerald-700" /> {stats.isProfileConnected ? "Coding Profile" : "Live Data"}
            </div>
          </div>
        </motion.div>

        {/* Metric 2: Videos Completed */}
        <motion.div
          whileHover={{ y: -4 }}
          className="rounded-3xl p-5 relative overflow-hidden bg-white border border-slate-200/90 shadow-md hover:shadow-xl transition-all flex flex-col justify-between"
        >
          <div className="w-9 h-9 rounded-xl bg-cyan-100 text-cyan-700 font-black flex items-center justify-center mb-3 shadow-2xs">
            <PlayCircle className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tabular-nums leading-none mb-1">
              {stats.completedVideos}
              <span className="text-xs font-semibold text-slate-400">/{stats.totalVideos}</span>
            </div>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Videos Watched</div>
            <div className="flex items-center gap-1 text-[11px] font-extrabold text-cyan-700 bg-cyan-100/90 px-2 py-0.5 rounded-full w-max">
              {stats.learningPct}% Complete
            </div>
          </div>
        </motion.div>

        {/* Metric 3: Saved Playlists */}
        <motion.div
          whileHover={{ y: -4 }}
          className="rounded-3xl p-5 relative overflow-hidden bg-white border border-slate-200/90 shadow-md hover:shadow-xl transition-all flex flex-col justify-between"
        >
          <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 font-black flex items-center justify-center mb-3 shadow-2xs">
            <Bookmark className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tabular-nums leading-none mb-1">
              {stats.savedPlaylistsCount}
            </div>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Saved Playlists</div>
            <div className="flex items-center gap-1 text-[11px] font-extrabold text-purple-700 bg-purple-100/90 px-2 py-0.5 rounded-full w-max">
              Courses Library
            </div>
          </div>
        </motion.div>

        {/* Metric 4: Success Rate */}
        <motion.div
          whileHover={{ y: -4 }}
          className="rounded-3xl p-5 relative overflow-hidden bg-white border border-slate-200/90 shadow-md hover:shadow-xl transition-all flex flex-col justify-between"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 font-black flex items-center justify-center mb-3 shadow-2xs">
            <Target className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tabular-nums leading-none mb-1">
              {stats.successRate}%
            </div>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Accuracy Rate</div>
            <div className="flex items-center gap-1 text-[11px] font-extrabold text-emerald-700 bg-emerald-100/90 px-2 py-0.5 rounded-full w-max">
              Submission Rate
            </div>
          </div>
        </motion.div>

        {/* Metric 5: Streak Days */}
        <motion.div
          whileHover={{ y: -4 }}
          className="rounded-3xl p-5 relative overflow-hidden bg-white border border-slate-200/90 shadow-md hover:shadow-xl transition-all flex flex-col justify-between"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 font-black flex items-center justify-center mb-3 shadow-2xs">
            <Flame className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tabular-nums leading-none mb-1">
              {stats.streakDays} <span className="text-xs font-semibold text-slate-400">days</span>
            </div>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Active Streak</div>
            <div className="flex items-center gap-1 text-[11px] font-extrabold text-amber-800 bg-amber-100/90 px-2 py-0.5 rounded-full w-max">
              Daily Practice
            </div>
          </div>
        </motion.div>

        {/* Metric 6: AI Career Score */}
        <motion.div
          whileHover={{ y: -4 }}
          className="rounded-3xl p-5 relative overflow-hidden bg-white border border-slate-200/90 shadow-md hover:shadow-xl transition-all flex flex-col justify-between"
        >
          <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 font-black flex items-center justify-center mb-3 shadow-2xs">
            <Brain className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tabular-nums leading-none mb-1">
              {stats.aiCareerHealth}<span className="text-xs font-semibold text-slate-400">/100</span>
            </div>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">AI Career Health</div>
            <div className="flex items-center gap-1 text-[11px] font-extrabold text-indigo-700 bg-indigo-100/90 px-2 py-0.5 rounded-full w-max">
              Progress Score
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── ROW 2: REAL TOPIC MASTERY & DIFFICULTY SPLIT ──────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Real Skill Radar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl p-6 bg-white border border-slate-200/90 shadow-md space-y-3"
        >
          <div>
            <h3 className="text-base font-black text-slate-900 mb-0.5">Pattern Radar</h3>
            <p className="text-xs text-slate-500 font-semibold">Topic distribution</p>
          </div>
          <RadarChart data={stats.topicRadarData} />
          <div className="grid grid-cols-2 gap-2 mt-4">
            {stats.topicRadarData.filter((t) => t.solved > 0).length > 0 ? (
              stats.topicRadarData.filter((t) => t.solved > 0).map((s) => (
                <div key={s.label} className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-bold">{s.label}</span>
                  <span className="font-black text-indigo-600 tabular-nums">{s.score}%</span>
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center text-xs text-slate-400 font-bold py-2">
                0% Active Coverage
              </div>
            )}
          </div>
        </motion.div>

        {/* Real Coding Profile Difficulty Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-3xl p-6 bg-white border border-slate-200/90 shadow-md space-y-4"
        >
          <div className="flex items-center justify-between mb-1">
            <div>
              <h3 className="text-base font-black text-slate-900">Difficulty Breakdown</h3>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">{stats.problemsSolved} total problems solved on profile</p>
            </div>
            {stats.leetcodeHandle && (
              <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
                @{stats.leetcodeHandle}
              </span>
            )}
          </div>

          <div className="flex justify-around py-2">
            {/* Easy */}
            <div className="flex flex-col items-center gap-2">
              <div className="relative">
                <RingProgress pct={stats.easyPct} color="#10b981" size={76} stroke={7} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-black text-slate-900">{stats.easyPct}%</span>
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-black text-slate-900">{stats.easyCount}</div>
                <div className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">Easy</div>
              </div>
            </div>

            {/* Medium */}
            <div className="flex flex-col items-center gap-2">
              <div className="relative">
                <RingProgress pct={stats.mediumPct} color="#f59e0b" size={76} stroke={7} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-black text-slate-900">{stats.mediumPct}%</span>
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-black text-slate-900">{stats.mediumCount}</div>
                <div className="text-[10px] font-black text-amber-600 uppercase tracking-wider">Medium</div>
              </div>
            </div>

            {/* Hard */}
            <div className="flex flex-col items-center gap-2">
              <div className="relative">
                <RingProgress pct={stats.hardPct} color="#f43f5e" size={76} stroke={7} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-black text-slate-900">{stats.hardPct}%</span>
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-black text-slate-900">{stats.hardCount}</div>
                <div className="text-[10px] font-black text-rose-600 uppercase tracking-wider">Hard</div>
              </div>
            </div>
          </div>

          {/* Stacked bar */}
          <div className="h-3 rounded-full overflow-hidden flex gap-0.5 bg-slate-100 border border-slate-200/80">
            <div style={{ width: `${stats.easyPct}%`, background: "#10b981" }} className="h-full" />
            <div style={{ width: `${stats.mediumPct}%`, background: "#f59e0b" }} className="h-full" />
            <div style={{ width: `${stats.hardPct}%`, background: "#f43f5e" }} className="h-full" />
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 font-extrabold pt-1">
            <span className="text-emerald-700">Easy ({stats.easyCount})</span>
            <span className="text-amber-700">Medium ({stats.mediumCount})</span>
            <span className="text-rose-700">Hard ({stats.hardCount})</span>
          </div>
        </motion.div>

        {/* Topic Progress Bars */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-3xl p-6 bg-white border border-slate-200/90 shadow-md space-y-4"
        >
          <div>
            <h3 className="text-base font-black text-slate-900 mb-0.5">Topic Completion</h3>
            <p className="text-xs text-slate-500 font-semibold">Practice pattern coverage</p>
          </div>

          <div className="space-y-4">
            {stats.topicRadarData.filter((t) => t.solved > 0).length > 0 ? (
              stats.topicRadarData.filter((t) => t.solved > 0).map((t) => (
                <div key={t.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-700">{t.label}</span>
                    <span className="text-xs font-black tabular-nums text-indigo-600">
                      {t.solved}/{t.total} ({t.score}%)
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full overflow-hidden bg-slate-100 border border-slate-200/60">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${t.score}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="h-full rounded-full bg-gradient-to-r from-purple-600 to-indigo-600"
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-slate-400 font-bold">
                No active topic progress yet. Solve practice problems to unlock pattern metrics!
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* ── ROW 3: COMPANY TARGET SOLVED OVERVIEW ──────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="rounded-3xl p-6 bg-white border border-slate-200/90 shadow-md space-y-4"
      >
        <div className="flex items-center justify-between gap-3 pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <span>Company Target Solved Overview</span>
            </h3>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Real-time solved problem counts aggregated per target company track
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {stats.companyList.map((comp) => (
            <div
              key={comp.slug}
              className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${
                comp.count > 0
                  ? "bg-indigo-50/80 border-indigo-200 text-indigo-900 shadow-2xs"
                  : "bg-slate-50 border-slate-200/80 text-slate-700"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black truncate">{comp.name}</span>
                {comp.count > 0 ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                )}
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-slate-500 font-bold">Solved</span>
                <span className={`text-sm font-black tabular-nums ${comp.count > 0 ? "text-emerald-700" : "text-slate-400"}`}>
                  {comp.count}
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── ROW 3: REAL RECENT ACTIVITY & AI CAREER HEALTH SUMMARY ───────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* AI Career Readiness Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 rounded-3xl p-6 bg-gradient-to-br from-indigo-50 via-purple-50 to-white border border-indigo-200/90 shadow-md flex flex-col justify-between space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-purple-600 text-white shadow-md shadow-purple-600/25">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-base font-black text-slate-900">AI Career Health Index</div>
              <div className="text-xs text-slate-500 font-semibold">Live platform score</div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-3 py-2">
            <div className="relative">
              <RingProgress pct={stats.aiCareerHealth} color="#7c3aed" size={130} stroke={10} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-slate-900">{stats.aiCareerHealth}</span>
                <span className="text-[10px] text-slate-500 font-bold">/100</span>
              </div>
            </div>

            <div className="text-center">
              <div className="text-sm font-black text-purple-700 mb-0.5">Live Readiness Rating</div>
              <div className="text-xs text-slate-500 font-semibold">Based on your practice &amp; profile metrics</div>
            </div>
          </div>
        </motion.div>

        {/* Real Activity Stream */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-3 rounded-3xl p-6 bg-white border border-slate-200/90 shadow-md space-y-4"
        >
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-black text-slate-900">Real Activity Stream</h3>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">Your actual recent actions across SkillsCatalyst</p>
          </div>

          <div className="space-y-3">
            {realRecentActivity.map((a, i) => {
              const Icon = a.icon;
              return (
                <div
                  key={i}
                  className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-2xs"
                >
                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5 font-black shadow-2xs">
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-slate-800 font-bold leading-snug truncate">{a.text}</p>
                    <p className="text-[11px] text-slate-400 font-semibold mt-0.5">{a.time}</p>
                  </div>
                  <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200 shrink-0">
                    {a.tag}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
