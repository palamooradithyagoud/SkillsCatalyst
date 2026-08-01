"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, BookOpen, Bookmark, BookmarkCheck, Play,
  Loader2, ChevronDown, Globe, Database,
  Sparkles, CheckCircle, Trash2, X,
  ChevronLeft, ChevronRight, ShieldAlert,
} from "lucide-react";
import MagnifierIcon from "@/components/icons/MagnifierIcon";
import SaveIcon from "@/components/icons/SaveIcon";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  searchSkill, savePlaylist, unsavePlaylist,
  fetchSavedPlaylists, fetchPlaylistVideos, markVideoWatched,
  completeVideo, markAllVideosWatched,
  Playlist,
} from "@/lib/api";
import { useYouTubePlayer } from "@/lib/useYouTubePlayer";
import { useAuth } from "@/lib/auth";

// ── Types ─────────────────────────────────────────────────────────────────────
type ActiveCard = "explore" | "saved";
type Level = "all" | "beginner" | "intermediate" | "advanced";
type Lang  = "english" | "hindi" | "tamil" | "telugu";

const LEVELS: { value: Level; label: string }[] = [
  { value: "all",          label: "All Levels"   },
  { value: "beginner",     label: "Beginner"      },
  { value: "intermediate", label: "Intermediate"  },
  { value: "advanced",     label: "Advanced"      },
];

const LANGUAGES: { value: Lang; label: string }[] = [
  { value: "english", label: "English" },
  { value: "hindi",   label: "Hindi"   },
  { value: "tamil",   label: "Tamil"   },
  { value: "telugu",  label: "Telugu"  },
];

// ── Client-side skill-query guard ─────────────────────────────────────────────
// Lightweight blocklist mirrors backend _LEARNING_OFFTOPIC for fast UX feedback.
const OFFTOPIC_TERMS = [
  "movie", "movies", "film", "films", "cinema", "netflix", "disney", "hotstar",
  "song", "songs", "music", "album", "singer", "celebrity", "bollywood", "hollywood",
  "anime", "manga", "cartoon", "podcast", "vlog",
  "cricket", "ipl", "football", "soccer", "nfl", "nba", "sports", "match",
  "recipe", "food", "cooking", "restaurant", "diet",
  "girlfriend", "boyfriend", "relationship", "marriage", "wedding", "dating",
  "joke", "jokes", "meme", "memes", "funny",
  "politics", "election", "president", "government",
  "astrology", "horoscope", "zodiac",
  "weather", "news", "headline",
];

const SKILL_TERMS = [
  "python", "java", "javascript", "typescript", "react", "vue", "angular", "node",
  "django", "flask", "fastapi", "machine learning", "deep learning", "ai", "ml",
  "data science", "nlp", "llm", "dsa", "algorithm", "data structure", "leetcode",
  "system design", "cloud", "aws", "azure", "gcp", "devops", "docker", "kubernetes",
  "sql", "database", "mongodb", "postgres", "api", "rest", "graphql",
  "html", "css", "frontend", "backend", "fullstack", "git", "github", "linux",
  "bash", "c++", "golang", "rust", "kotlin", "swift", "flutter", "dart", "php",
  "cybersecurity", "networking", "programming", "coding", "software", "developer",
  "engineer", "interview", "resume", "career", "roadmap", "tech", "tutorial", "course",
];

function isSkillQuery(q: string): boolean {
  const lower = q.toLowerCase().trim();
  if (!lower || lower.length < 2) return false;
  if (/^\d+$/.test(lower)) return false; // numbers-only
  const hasOffTopic = OFFTOPIC_TERMS.some((t) => lower.includes(t));
  if (!hasOffTopic) return true;
  // Off-topic keyword present — only valid if a skill keyword is also present
  return SKILL_TERMS.some((t) => lower.includes(t));
}

// ── Client-side skill guard ───────────────────────────────────────────────────
const _CS_NON_SKILL = [
  "movie", "movies", "film", "films", "song", "songs", "music", "album",
  "cricket", "ipl", "football", "soccer", "sports", "match",
  "recipe", "food", "cooking", "restaurant",
  "joke", "meme", "funny", "prank",
  "netflix", "hotstar", "bollywood", "hollywood", "anime", "manga",
  "relationship", "girlfriend", "boyfriend",
  "astrology", "horoscope", "zodiac",
  "news", "politics", "election", "celebrity", "actor", "actress",
];
const _CS_SKILL = [
  "python", "java", "javascript", "typescript", "react", "vue", "angular",
  "node", "django", "flask", "fastapi", "dsa", "algorithm", "data structure",
  "machine learning", "deep learning", "ai", "ml", "data science", "nlp",
  "system design", "cloud", "aws", "azure", "gcp", "devops", "docker",
  "kubernetes", "sql", "database", "mongodb", "redis", "html", "css",
  "frontend", "backend", "fullstack", "api", "graphql", "git", "github",
  "linux", "bash", "c++", "golang", "rust", "kotlin", "swift", "flutter",
  "cybersecurity", "networking", "programming", "coding", "developer",
  "software", "engineer", "tutorial", "course", "bootcamp", "leetcode",
  "competitive", "interview", "career", "resume", "roadmap",
];

function isNonSkillQuery(q: string): string | null {
  const lower = q.toLowerCase().trim();
  if (!lower || lower.length < 2) return "Please enter a skill to search for (e.g. Python, React, DSA).";
  if (/^[\d\s]+$/.test(lower)) return "Please search for a skill or technology, not a number.";
  const hasNonSkill = _CS_NON_SKILL.some((kw) => lower.includes(kw));
  const hasSkill    = _CS_SKILL.some((kw) => lower.includes(kw));
  if (hasNonSkill && !hasSkill) {
    return `"${q}" doesn't look like a skill. Try searching for programming languages, frameworks, or tools like "Python", "React", or "DSA".`;
  }
  return null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function getLevelStyle(level: string): string {
  const l = level.toLowerCase();
  if (l.includes("beginner"))     return "text-slate-300 bg-slate-700/60 border-slate-600/50";
  if (l.includes("intermediate")) return "text-amber-300 bg-amber-900/30 border-amber-700/40";
  if (l.includes("advanced"))     return "text-rose-300  bg-rose-900/30  border-rose-700/40";
  return "text-blue-300 bg-blue-900/30 border-blue-700/40";
}

function extractPlaylistId(url: string): string | null {
  if (!url) return null;
  const m = url.match(/[?&]list=([^&]+)/);
  return m?.[1] ?? null;
}

// ── SelectDropdown ────────────────────────────────────────────────────────────
function SelectDropdown<T extends string>({
  value, options, onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="appearance-none input-glass pl-4 pr-9 py-2.5 text-sm font-medium text-slate-200 cursor-pointer"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-[#0d1424] text-slate-200">
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
    </div>
  );
}

// ── PlaylistCard (Explore section only) ───────────────────────────────────────
function PlaylistCard({
  pl, rank, savedIds, onSave, onUnsave, onWatch, delay = 0,
}: {
  pl: Playlist;
  rank: number;
  savedIds: Set<string>;
  onSave?: (pl: Playlist) => void;
  onUnsave?: (id: string) => void;
  onWatch: (pl: Playlist) => void;
  delay?: number;
}) {
  const isSaved = savedIds.has(pl.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: "easeOut" }}
      className="rounded-2xl flex flex-col relative overflow-hidden"
      style={{
        background: "rgba(14, 22, 44, 0.85)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {/* ── Meta Row */}
      <div className="flex items-center gap-2 px-5 pt-5 pb-3 flex-wrap">
        <span className="text-xs font-bold text-slate-400 bg-slate-800/60 border border-slate-700/50 px-2 py-0.5 rounded-lg">
          #{rank}
        </span>
        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-lg border ${getLevelStyle(pl.level)}`}>
          {pl.level || "All Levels"}
        </span>
        {pl.duration && pl.duration !== "?" && (
          <span className="text-xs font-semibold text-slate-400 bg-slate-800/60 border border-slate-700/50 px-2 py-0.5 rounded-lg">
            {pl.duration}
          </span>
        )}
        {pl.source === "csv" ? (
          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-900/25 border border-emerald-700/30 px-2.5 py-0.5 rounded-lg ml-auto">
            <CheckCircle className="w-3 h-3" /> Verified via CSV
          </span>
        ) : (
          <span className="flex items-center gap-1 text-[11px] font-bold text-red-400 bg-red-900/20 border border-red-700/25 px-2.5 py-0.5 rounded-lg ml-auto">
            <Database className="w-3 h-3" /> YouTube API
          </span>
        )}
      </div>

      {/* ── Body */}
      <div className="px-5 flex flex-col flex-1">
        <h3 className="text-xl font-bold text-white leading-snug mb-1.5 line-clamp-2">
          {pl.title}
        </h3>
        <p className="text-sm font-medium text-slate-400 mb-3">{pl.channel}</p>
        <p className="text-sm text-slate-500 leading-relaxed line-clamp-3 flex-1">
          {pl.description || "No description available."}
        </p>
      </div>

      {/* ── Footer Buttons */}
      <div className="flex items-center gap-3 px-5 pb-5 pt-4 mt-2 border-t border-white/[0.05]">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onWatch(pl)}
          className="flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm font-bold text-white"
          style={{
            background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
            boxShadow: "0 4px 14px rgba(79,70,229,0.35)",
          }}
        >
          <Play className="w-4 h-4 fill-white" /> Watch Playlist
        </motion.button>

        {onSave && onUnsave && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => isSaved ? onUnsave(pl.id) : onSave(pl)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all ${
              isSaved
                ? "text-emerald-400 border-emerald-500/50 bg-emerald-500/[0.08] hover:bg-rose-500/10 hover:border-rose-500/50 hover:text-rose-400"
                : "text-slate-300 border-slate-600/60 bg-transparent hover:border-blue-500/50 hover:text-blue-300"
            }`}
          >
            {isSaved ? "Saved ✓" : "Save"}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

// ── SavedPlaylistRow ──────────────────────────────────────────────────────────
function SavedPlaylistRow({
  pl,
  onWatch,
  onDelete,
  onWatchVideo,
  delay = 0,
}: {
  pl: Playlist;
  onWatch: (pl: Playlist) => void;
  onDelete: (id: string) => void;
  onWatchVideo: (pl: Playlist, idx: number) => void;
  delay?: number;
}) {
  const { session } = useAuth();
  const userId = session?.user_id;
  const qc = useQueryClient();
  const [expanded, setExpanded] = useState(false);

  // Use the actual YouTube playlist ID from the URL, not the row rank
  const ytPlaylistId = extractPlaylistId(pl.playlist_url ?? "") ?? pl.id;

  const { data: videoData, isLoading: loadingVideos } = useQuery({
    queryKey: ["playlist-videos", ytPlaylistId, userId],
    queryFn: () => fetchPlaylistVideos(ytPlaylistId),
    enabled: !!ytPlaylistId,
    staleTime: 5 * 60 * 1000,
  });

  const hasLoaded = !!videoData;
  const videos = videoData?.videos ?? [];
  const storedCount = parseInt(pl.video_count ?? "0") || 0;
  const displayCount = videos.length > 0 ? videos.length : storedCount;
  const watchedCount = videos.filter((v) => v.watched).length;
  const pct = videos.length > 0 ? Math.round((watchedCount / videos.length) * 100) : 0;

  const markMut = useMutation({
    mutationFn: ({ videoId, watched }: { videoId: string; watched: boolean }) =>
      markVideoWatched(ytPlaylistId, videoId, watched),
    onMutate: async ({ videoId, watched }) => {
      qc.setQueryData(
        ["playlist-videos", ytPlaylistId, userId],
        (old: { videos: any[]; count: number } | undefined) => {
          if (!old) return old;
          return {
            ...old,
            videos: old.videos.map((v) =>
              v.videoId === videoId ? { ...v, watched } : v
            ),
          };
        }
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["playlist-videos", ytPlaylistId, userId] });
      qc.invalidateQueries({ queryKey: ["dashboard", userId] });
    },
  });

  const status = !hasLoaded
    ? "Syncing"
    : pct === 100
    ? "Completed"
    : pct > 0
    ? "In Progress"
    : "Not Started";

  const statusStyle = !hasLoaded
    ? "text-slate-400 bg-slate-800/60 border-slate-700/50"
    : pct === 100
    ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
    : pct > 0
    ? "text-amber-400 bg-amber-500/10 border-amber-500/30"
    : "text-slate-400 bg-slate-700/40 border-slate-600/50";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      className="rounded-2xl overflow-hidden"
      style={{
        background: "rgba(14,22,44,0.85)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {/* ── Row Header */}
      <div className="flex items-center gap-4 px-5 pt-4 pb-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-white truncate">{pl.title}</h3>
          <p className="text-sm text-slate-500 mt-0.5">
            {[pl.channel, pl.skill_query, pl.level].filter(Boolean).join(" | ")}
          </p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${statusStyle}`}>
            {!hasLoaded ? (
              <span className="flex items-center gap-1.5">
                <Loader2 className="w-3 h-3 animate-spin text-slate-400" />
                Syncing
              </span>
            ) : (
              status
            )}
          </span>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onWatch(pl)}
            className="px-4 py-1.5 rounded-lg text-sm font-bold text-white"
            style={{
              background: "linear-gradient(135deg, #4f46e5, #6366f1)",
              boxShadow: "0 2px 10px rgba(79,70,229,0.4)",
            }}
          >
            Watch
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onDelete(pl.id)}
            className="px-3 py-1.5 rounded-lg text-sm font-bold text-rose-400 border border-rose-500/30 bg-rose-500/[0.08] hover:bg-rose-500/15 transition-colors"
          >
            Delete
          </motion.button>
        </div>
      </div>

      {/* ── Progress line */}
      <div className="flex items-center justify-between px-5 pb-3 mt-1">
        {!hasLoaded ? (
          <span className="flex items-center gap-2 text-sm text-slate-400">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
            <span>Syncing video progress...</span>
          </span>
        ) : (
          <span className="text-sm text-slate-400">
            {watchedCount} of {displayCount} videos verified ({pct}%)
          </span>
        )}
        <button
          onClick={() => setExpanded((e) => !e)}
          className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          {expanded
            ? "Hide Videos"
            : hasLoaded
            ? `Show Videos (${displayCount})`
            : "Show Videos"}
        </button>
      </div>

      {/* ── Progress bar (only shown when progress > 0) */}
      {pct > 0 && (
        <div
          className="mx-5 mb-3 h-1.5 rounded-full overflow-hidden"
          style={{ background: "rgba(255,255,255,0.06)" }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
          />
        </div>
      )}

      {/* ── Expandable video list */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
            style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
          >
            {loadingVideos ? (
              <div className="flex items-center justify-center gap-3 py-8 text-slate-400">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">Loading videos...</span>
              </div>
            ) : videos.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-500">
                No videos found. YouTube API may not be configured.
              </div>
            ) : (
              <div className="py-2">
                {videos.map((v, i) => (
                  <div
                    key={v.videoId}
                    className="flex items-center gap-4 px-5 py-2.5 hover:bg-white/[0.03] transition-colors"
                  >
                    {/* Circle checkbox */}
                    <button
                      onClick={() =>
                        markMut.mutate({ videoId: v.videoId, watched: !v.watched })
                      }
                      className="shrink-0 w-5 h-5 flex items-center justify-center"
                    >
                      {v.watched ? (
                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <div
                          className="w-4 h-4 rounded-full border-2 border-slate-600 hover:border-slate-400 transition-colors"
                        />
                      )}
                    </button>

                    {/* Video title */}
                    <span
                      className={`flex-1 text-sm ${
                        v.watched ? "text-slate-500 line-through" : "text-slate-300"
                      }`}
                    >
                      {i + 1}. {v.title}
                    </span>

                    {/* Play button */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onWatchVideo(pl, i)}
                      className="px-3 py-1 rounded-lg text-xs font-bold text-white shrink-0"
                      style={{ background: "linear-gradient(135deg, #4f46e5, #6366f1)" }}
                    >
                      Play
                    </motion.button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function VideoPlayerContainer({
  videoId,
  startAt,
  playlistId,
  onProgressUpdate,
  onComplete,
}: {
  videoId: string;
  startAt: number;
  playlistId: string;
  onProgressUpdate: (pct: number) => void;
  onComplete: (watchedSeconds: number) => void;
}) {
  const containerId = `yt-player-${videoId}`;
  useYouTubePlayer({
    containerId,
    videoId,
    startAt,
    playlistId,
    onProgressUpdate,
    onComplete,
  });
  return (
    <div className="w-full relative" style={{ height: 420 }}>
      <div
        id={containerId}
        className="w-full h-full"
      />
    </div>
  );
}

// ── FullPlayerView ─────────────────────────────────────────────────────────────
function FullPlayerView({
  pl,
  initialVideoIndex = 0,
  onBack,
}: {
  pl: Playlist;
  initialVideoIndex?: number;
  onBack: () => void;
}) {
  const qc = useQueryClient();
  const [currentIdx, setCurrentIdx] = useState(initialVideoIndex);

  // ── Auto-completion UI state
  const [completedVideoIds, setCompletedVideoIds] = useState<Set<string>>(new Set());
  const [showCompletionBanner, setShowCompletionBanner] = useState(false);
  const [watchedPct, setWatchedPct] = useState(0);   // live 0-100
  const bannerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const ytPlaylistId = extractPlaylistId(pl.playlist_url ?? "") ?? pl.id;

  const { session } = useAuth();
  const userId = session?.user_id;

  const { data: videoData, isLoading: loadingVideos } = useQuery({
    queryKey: ["playlist-videos", ytPlaylistId, userId],
    queryFn: () => fetchPlaylistVideos(ytPlaylistId),
    enabled: !!ytPlaylistId,
    staleTime: 5 * 60 * 1000,
  });

  const videos = videoData?.videos ?? [];
  const currentVideo = videos[currentIdx] ?? null;

  // Watched count = DB rows + optimistic local set
  const watchedCount = videos.filter(
    (v) => v.watched || completedVideoIds.has(v.videoId)
  ).length;
  const pct = videos.length > 0 ? Math.round((watchedCount / videos.length) * 100) : 0;

  const markMut = useMutation({
    mutationFn: ({ videoId, watched }: { videoId: string; watched: boolean }) =>
      markVideoWatched(ytPlaylistId, videoId, watched),
    onMutate: async ({ videoId, watched }) => {
      setCompletedVideoIds((prev) => {
        const next = new Set(prev);
        if (watched) {
          next.add(videoId);
        } else {
          next.delete(videoId);
        }
        return next;
      });

      qc.setQueryData(
        ["playlist-videos", ytPlaylistId, userId],
        (old: { videos: any[]; count: number } | undefined) => {
          if (!old) return old;
          return {
            ...old,
            videos: old.videos.map((v) =>
              v.videoId === videoId ? { ...v, watched } : v
            ),
          };
        }
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["playlist-videos", ytPlaylistId, userId] });
      qc.invalidateQueries({ queryKey: ["dashboard", userId] });
    },
  });

  const completeMut = useMutation({
    mutationFn: ({ videoId, watchTime }: { videoId: string; watchTime: number }) =>
      completeVideo(ytPlaylistId, videoId, watchTime),
    onSuccess: () => {
      // Refresh sidebar checkmarks & dashboard KPI
      qc.invalidateQueries({ queryKey: ["playlist-videos", ytPlaylistId, userId] });
      qc.invalidateQueries({ queryKey: ["dashboard", userId] });
    },
  });

  const markAllMut = useMutation({
    mutationFn: ({ watched }: { watched: boolean }) =>
      markAllVideosWatched(ytPlaylistId, watched),
    onMutate: async ({ watched }) => {
      setCompletedVideoIds((prev) => {
        if (!watched) return new Set();
        return new Set(videos.map((v) => v.videoId));
      });
      qc.setQueryData(
        ["playlist-videos", ytPlaylistId, userId],
        (old: { videos: any[]; count: number } | undefined) => {
          if (!old) return old;
          return {
            ...old,
            videos: old.videos.map((v) => ({ ...v, watched })),
          };
        }
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["playlist-videos", ytPlaylistId, userId] });
      qc.invalidateQueries({ queryKey: ["dashboard", userId] });
    },
  });

  // Reset live progress when video changes
  useEffect(() => {
    setWatchedPct(0);
    setShowCompletionBanner(false);
    if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current);
    if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
  }, [currentIdx]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current);
      if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    };
  }, []);

  /** Called by the hook when >= 75% genuinely watched */
  const handleVideoComplete = useCallback((watchedSeconds: number) => {
    if (!currentVideo) return;
    const vid = currentVideo.videoId;

    // 1. Optimistic local update — instant sidebar checkmark
    setCompletedVideoIds((prev) => new Set([...prev, vid]));

    // 2. Show completion banner
    setShowCompletionBanner(true);
    bannerTimerRef.current = setTimeout(() => setShowCompletionBanner(false), 3500);

    // 3. Persist to backend
    completeMut.mutate({ videoId: vid, watchTime: Math.round(watchedSeconds) });

    // 4. Auto-scroll sidebar to completed lesson
    setTimeout(() => {
      const nextBtn = sidebarRef.current?.querySelector(
        `[data-idx="${currentIdx}"]`
      ) as HTMLElement | null;
      nextBtn?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 400);
  }, [currentVideo, currentIdx, completeMut]);

  const goNext = () => setCurrentIdx((i) => Math.min(i + 1, videos.length - 1));
  const goPrev = () => setCurrentIdx((i) => Math.max(i - 1, 0));

  const isCompleted = (vid: string) =>
    completedVideoIds.has(vid) || (videos.find((v) => v.videoId === vid)?.watched ?? false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-7xl mx-auto pb-8"
    >
      {/* ── Completion Banner */}
      <AnimatePresence>
        {showCompletionBanner && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className="fixed top-5 right-5 z-[70] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl backdrop-blur-xl"
            style={{
              background: "linear-gradient(135deg, rgba(16,185,129,0.9) 0%, rgba(5,150,105,0.9) 100%)",
              border: "1px solid rgba(52,211,153,0.4)",
              boxShadow: "0 8px 32px rgba(16,185,129,0.4)",
            }}
          >
            <motion.div
              initial={{ rotate: -20, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 500 }}
              className="text-xl"
            >
              🎉
            </motion.div>
            <div>
              <div className="font-bold text-white text-sm">Lesson Completed!</div>
              <div className="text-emerald-100 text-xs">75% threshold reached ✓</div>
            </div>
            <CheckCircle className="w-5 h-5 text-emerald-200" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors px-4 py-2 glass rounded-xl shrink-0 mt-1"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Saved Playlists
          </motion.button>
          <div>
            <h1 className="text-2xl font-bold text-white">{pl.title}</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              {[pl.channel, pl.skill_query, pl.level].filter(Boolean).join(" • ")}
            </p>
          </div>
        </div>
        <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
          <motion.div
            key={pct}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold text-indigo-400"
          >
            {pct}% Completed
          </motion.div>
          <div className="text-sm text-slate-400">
            {watchedCount} of {videos.length} videos
          </div>
          {videos.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => markAllMut.mutate({ watched: pct < 100 })}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border transition-colors bg-indigo-500/10 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20 mt-1"
            >
              <CheckCircle className="w-3.5 h-3.5 text-indigo-400" />
              {pct === 100 ? "Unmark All" : "Mark All as Watched"}
            </motion.button>
          )}
        </div>
      </div>

      {/* ── Content */}
      {loadingVideos ? (
        <div className="flex items-center justify-center h-96 gap-3 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
          <span>Loading playlist videos...</span>
        </div>
      ) : videos.length === 0 ? (
        // Fallback: embed entire playlist (no tracking)
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: "rgba(14,22,44,0.9)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          {ytPlaylistId ? (
            <iframe
              src={`https://www.youtube.com/embed/videoseries?list=${ytPlaylistId}&autoplay=1&rel=0&modestbranding=1`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-full"
              style={{ height: 520 }}
            />
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-500">
              This playlist cannot be embedded.
            </div>
          )}
        </div>
      ) : (
        <div className="grid gap-5" style={{ gridTemplateColumns: "1fr 360px" }}>
          {/* ── Left: Video + Controls */}
          <div className="flex flex-col gap-4">
            {/* YouTube Player */}
            <div className="rounded-2xl overflow-hidden bg-black relative">
              {currentVideo ? (
                <VideoPlayerContainer
                  key={currentVideo.videoId}
                  videoId={currentVideo.videoId}
                  startAt={currentVideo.last_position ?? 0}
                  playlistId={ytPlaylistId}
                  onProgressUpdate={setWatchedPct}
                  onComplete={handleVideoComplete}
                />
              ) : (
                <div className="h-[420px] flex items-center justify-center text-slate-500">
                  Select a video
                </div>
              )}
            </div>

            {/* Live progress bar */}
            <div
              className="relative h-1.5 rounded-full overflow-hidden"
              style={{ background: "rgba(255,255,255,0.06)" }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{
                  width: `${watchedPct}%`,
                  background: watchedPct >= 75
                    ? "linear-gradient(90deg, #10b981, #34d399)"
                    : "linear-gradient(90deg, #4f46e5, #818cf8)",
                }}
                transition={{ ease: "linear", duration: 0.25 }}
              />
              {watchedPct > 5 && (
                <div
                  className="absolute right-0 top-0 h-full w-0.5 rounded-full bg-white/30"
                  style={{ right: `${100 - watchedPct}%` }}
                />
              )}
            </div>
            <div className="flex items-center justify-between -mt-2">
              <span className="text-[11px] text-slate-600 font-medium">
                {watchedPct < 75 ? `${Math.round(watchedPct)}% watched (75% threshold)` : "✓ Threshold reached"}
              </span>
              {watchedPct >= 75 && (
                <span className="text-[11px] text-emerald-400 font-bold">Lesson Completed!</span>
              )}
            </div>

            {/* Prev / Next */}
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={goPrev}
                disabled={currentIdx === 0}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border border-slate-600/60 text-slate-300 hover:border-indigo-500/50 hover:text-white disabled:opacity-35 disabled:cursor-not-allowed transition-all glass"
              >
                <ChevronLeft className="w-4 h-4" /> Previous Video
              </motion.button>
              <div className="flex-1 text-center text-sm text-slate-500 font-medium">
                {currentIdx + 1} / {videos.length}
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={goNext}
                disabled={currentIdx >= videos.length - 1}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-35 disabled:cursor-not-allowed transition-all"
                style={{
                  background: "linear-gradient(135deg, #4f46e5, #6366f1)",
                  boxShadow: "0 4px 14px rgba(79,70,229,0.35)",
                }}
              >
                Next Video <ChevronRight className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Current video info */}
            {currentVideo && (
              <div
                className="rounded-xl px-5 py-4"
                style={{
                  background: "rgba(14,22,44,0.8)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-slate-500 mb-1">{currentIdx + 1}.</div>
                    <div className="text-base font-bold text-white leading-snug">
                      {currentVideo.title}
                    </div>
                    {currentVideo.last_position != null && currentVideo.last_position > 5 && !isCompleted(currentVideo.videoId) && (
                      <div className="text-[11px] text-indigo-400 mt-1">
                        ▶ Resuming from {Math.floor(currentVideo.last_position / 60)}m {Math.floor(currentVideo.last_position % 60)}s
                      </div>
                    )}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() =>
                      markMut.mutate({
                        videoId: currentVideo.videoId,
                        watched: !isCompleted(currentVideo.videoId),
                      })
                    }
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all shrink-0 ${
                      isCompleted(currentVideo.videoId)
                        ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
                        : "bg-transparent border-slate-600/60 text-slate-400 hover:border-indigo-500/50 hover:text-indigo-300"
                    }`}
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    {isCompleted(currentVideo.videoId) ? "Watched" : "Mark Watched"}
                  </motion.button>
                </div>
              </div>
            )}
          </div>

          {/* ── Right: Course Content Sidebar */}
          <div
            ref={sidebarRef}
            className="rounded-2xl overflow-hidden flex flex-col"
            style={{
              background: "rgba(14,22,44,0.9)",
              border: "1px solid rgba(255,255,255,0.07)",
              maxHeight: 560,
            }}
          >
            {/* Sidebar header */}
            <div
              className="flex items-center justify-between px-5 py-4 shrink-0"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
            >
              <span className="font-bold text-white text-sm">Course Content</span>
              <span
                className="text-xs font-bold text-indigo-400 px-2.5 py-1 rounded-full"
                style={{
                  background: "rgba(99,102,241,0.12)",
                  border: "1px solid rgba(99,102,241,0.25)",
                }}
              >
                {videos.length} Videos
              </span>
            </div>

            {/* Scrollable video list */}
            <div className="overflow-y-auto flex-1">
              {videos.map((v, i) => {
                const done = isCompleted(v.videoId);
                const isNext = i === currentIdx + 1 && isCompleted(videos[currentIdx]?.videoId ?? "");
                return (
                  <button
                    key={v.videoId}
                    data-idx={i}
                    onClick={() => setCurrentIdx(i)}
                    className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-all hover:bg-white/[0.04] border-l-2 ${
                      i === currentIdx
                        ? "bg-indigo-500/[0.12] border-indigo-400"
                        : "border-transparent"
                    }`}
                  >
                    <span
                      className={`text-[11px] font-bold shrink-0 mt-0.5 w-5 text-right ${
                        i === currentIdx ? "text-indigo-400" : "text-slate-600"
                      }`}
                    >
                      #{i + 1}
                    </span>
                    <span
                      className={`text-sm leading-snug line-clamp-2 flex-1 ${
                        done
                          ? "text-slate-500 line-through"
                          : i === currentIdx
                          ? "text-white font-semibold"
                          : "text-slate-400"
                      }`}
                    >
                      {v.title}
                    </span>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      {done && (
                        <motion.div
                          initial={{ scale: 0, rotate: -20 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: "spring", stiffness: 500 }}
                        >
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                        </motion.div>
                      )}
                      {isNext && !done && (
                        <motion.span
                          animate={{ opacity: [1, 0.5, 1] }}
                          transition={{ repeat: Infinity, duration: 1.2 }}
                          className="text-[9px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.5 rounded-full whitespace-nowrap"
                        >
                          ▶ Up Next
                        </motion.span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function LearningPage() {
  const { session } = useAuth();
  const userId = session?.user_id;
  const qc = useQueryClient();

  const [activeCard, setActiveCard]     = useState<ActiveCard>("explore");
  const [query, setQuery]               = useState("");
  const [level, setLevel]               = useState<Level>("all");
  const [language, setLanguage]         = useState<Lang>("english");
  const [searchTerm, setSearchTerm]     = useState("");
  const [hasSearched, setHasSearched]   = useState(false);
  const [notification, setNotification] = useState<{ msg: string; type: "success" | "error"; actionText?: string; onAction?: () => void } | null>(null);
  const [queryError, setQueryError]     = useState<string | null>(null);

  // ── Player state
  const [playerPlaylist, setPlayerPlaylist]   = useState<Playlist | null>(null);
  const [playerVideoIndex, setPlayerVideoIndex] = useState(0);

  // ── Helpers
  const showNotif = useCallback((msg: string, type: "success" | "error", actionText?: string, onAction?: () => void) => {
    setNotification({ msg, type, actionText, onAction });
    setTimeout(() => setNotification(null), 4000);
  }, []);

  // ── Queries
  const {
    data: searchData,
    isFetching: searching,
    refetch: doSearch,
  } = useQuery({
    queryKey: ["learning-search", searchTerm, level, language],
    queryFn:  () => searchSkill(searchTerm, level, language),
    enabled:  !!searchTerm,
    staleTime: 5 * 60 * 1000,
  });

  const { data: savedData, isFetching: loadingSaved } = useQuery({
    queryKey: ["saved-playlists", userId],
    queryFn:  () => fetchSavedPlaylists(),
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const savedIds = new Set(savedData?.saved?.map((p: Playlist) => p.id) ?? []);

  // ── Mutations
  const saveMut = useMutation({
    mutationFn: (pl: Playlist) => savePlaylist(pl, searchTerm),
    onSuccess: (_, pl) => {
      showNotif(
        `"${pl.title.slice(0, 35)}..." saved to Supabase!`,
        "success",
        "View Saved →",
        () => setActiveCard("saved")
      );

      // Refetch from Supabase database tables immediately
      qc.invalidateQueries({ queryKey: ["saved-playlists"] });
      qc.refetchQueries({ queryKey: ["saved-playlists"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: () => showNotif("Failed to save. Check backend connection.", "error"),
  });

  const unsaveMut = useMutation({
    mutationFn: (id: string) => unsavePlaylist(id),
    onSuccess: () => {
      showNotif("Removed from Supabase saved playlists.", "success");
      qc.invalidateQueries({ queryKey: ["saved-playlists"] });
      qc.refetchQueries({ queryKey: ["saved-playlists"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: () => showNotif("Failed to remove.", "error"),
  });


  const handleSearch = () => {
    const trimmed = query.trim();
    if (!trimmed) return;

    // Client-side numbers-only guard
    if (/^\d+$/.test(trimmed)) {
      setQueryError("🚫 Numbers alone aren't a skill. Try \"Python\", \"React\", or \"DSA\".");
      return;
    }

    // Client-side skill-query guard — fast path before hitting backend
    if (!isSkillQuery(trimmed)) {
      setQueryError(
        `🚫 "${trimmed}" doesn't look like a skill search. Try a programming language, tool, or concept — e.g. "Python", "React", "DSA", or "System Design".`
      );
      return;
    }

    setQueryError(null);
    setSearchTerm(trimmed);
    setHasSearched(true);
    doSearch();
  };

  const handleOpenPlayer = useCallback((pl: Playlist, idx = 0) => {
    setPlayerVideoIndex(idx);
    setPlayerPlaylist(pl);
  }, []);

  const results: Playlist[]   = searchData?.results ?? [];
  const savedList: Playlist[] = savedData?.saved ?? [];

  // ── Full Player Mode — replaces entire page
  if (playerPlaylist) {
    return (
      <FullPlayerView
        pl={playerPlaylist}
        initialVideoIndex={playerVideoIndex}
        onBack={() => setPlayerPlaylist(null)}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto space-y-6"
    >
      {/* ── Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-5 right-5 z-[60] px-5 py-3 rounded-2xl flex items-center gap-3 shadow-2xl text-sm font-semibold border backdrop-blur-xl ${
              notification.type === "success"
                ? "bg-emerald-900/85 border-emerald-500/30 text-emerald-200"
                : "bg-rose-900/85 border-rose-500/30 text-rose-200"
            }`}
          >
            {notification.type === "success"
              ? <CheckCircle className="w-4 h-4 text-emerald-400" />
              : <X className="w-4 h-4 text-rose-400" />
            }
            <span>{notification.msg}</span>
            {notification.actionText && notification.onAction && (
              <button
                onClick={notification.onAction}
                className="ml-2 px-3 py-1 rounded-lg text-xs font-bold text-white bg-indigo-600/80 hover:bg-indigo-500 border border-indigo-400/40 transition-colors"
              >
                {notification.actionText}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Top Two Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card 1 — Explore */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.4, ease: "easeOut" }}
          onClick={() => setActiveCard("explore")}
          className="relative rounded-2xl p-6 cursor-pointer transition-all overflow-hidden"
          style={{
            background: activeCard === "explore"
              ? "linear-gradient(135deg, rgba(79,70,229,0.15) 0%, rgba(14,22,44,0.9) 100%)"
              : "rgba(14,22,44,0.7)",
            border: "1px solid",
            borderColor: activeCard === "explore" ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.07)",
            boxShadow: activeCard === "explore" ? "0 0 30px rgba(79,70,229,0.18)" : "none",
          }}
        >
          <div className="text-[10px] font-bold text-indigo-400 tracking-widest uppercase mb-3">CARD 1</div>
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-indigo-500/15 border border-indigo-500/25 shrink-0">
              <MagnifierIcon size={24} className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Explore Skills &amp; Courses</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Search any skill to get AI-curated video playlists, certifications &amp; custom career roadmaps.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Card 2 — Saved */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4, ease: "easeOut" }}
          onClick={() => setActiveCard("saved")}
          className="relative rounded-2xl p-6 cursor-pointer transition-all overflow-hidden"
          style={{
            background: activeCard === "saved"
              ? "linear-gradient(135deg, rgba(139,92,246,0.12) 0%, rgba(14,22,44,0.9) 100%)"
              : "rgba(14,22,44,0.7)",
            border: "1px solid",
            borderColor: activeCard === "saved" ? "rgba(139,92,246,0.45)" : "rgba(255,255,255,0.07)",
            boxShadow: activeCard === "saved" ? "0 0 30px rgba(139,92,246,0.15)" : "none",
          }}
        >
          {/* Saved count badge */}
          <div
            className="absolute top-4 right-4 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
            style={{ background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.25)", color: "#93c5fd" }}
          >
            <SaveIcon size={14} className="w-3.5 h-3.5" />
            {savedData?.count ?? 0} Saved
          </div>
          <div className="text-[10px] font-bold text-purple-400 tracking-widest uppercase mb-3">CARD 2</div>
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-purple-500/[0.12] border border-purple-500/[0.22] shrink-0">
              <SaveIcon size={24} className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Saved Playlists &amp; Player</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Access saved course playlists, track video progress, and watch interactive video lessons.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── EXPLORE Content */}
      <AnimatePresence mode="wait">
        {activeCard === "explore" && (
          <motion.div
            key="explore"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            {/* Search bar */}
            <div
              className="rounded-2xl p-5"
              style={{ background: "rgba(14,22,44,0.7)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <MagnifierIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); setQueryError(null); }}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder="Search a programming skill, tool, or technology (e.g. Python, React, DSA)"
                    className={`input-glass w-full pl-11 pr-4 py-3 text-sm ${
                      queryError ? "border-rose-500/60" : ""
                    }`}
                  />
                </div>
                <SelectDropdown value={level}    options={LEVELS}    onChange={setLevel}    />
                <SelectDropdown value={language} options={LANGUAGES} onChange={setLanguage} />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSearch}
                  disabled={searching || !query.trim()}
                  className="px-7 py-3 rounded-xl text-white font-bold text-sm flex items-center gap-2 whitespace-nowrap disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)", boxShadow: "0 4px 15px rgba(79,70,229,0.4)" }}
                >
                  {searching
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Searching...</>
                    : <><Sparkles className="w-4 h-4" /> Find Resources</>
                  }
                </motion.button>
              </div>

              {/* Inline query error */}
              <AnimatePresence>
                {queryError && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="flex items-start gap-2 mt-1 px-4 py-3 rounded-xl text-sm text-rose-300 bg-rose-500/10 border border-rose-500/25"
                  >
                    <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                    <span>{queryError}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Results */}
            <AnimatePresence mode="wait">
              {searching && (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex flex-col items-center py-24 gap-4">
                  <Loader2 className="w-10 h-10 animate-spin text-indigo-400" />
                  <div className="text-slate-400 text-sm font-medium">
                    Searching CSV database &amp; YouTube API for{" "}
                    <span className="text-white font-bold">"{query}"</span>...
                  </div>
                </motion.div>
              )}

              {!searching && hasSearched && results.length === 0 && (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex flex-col items-center py-20 gap-3 text-center">
                  <Globe className="w-12 h-12 text-slate-600" />
                  <div className="text-slate-400 text-sm font-medium">
                    No results found for "<span className="text-white">{searchTerm}</span>"
                  </div>
                  <div className="text-slate-600 text-xs">Try a broader term like "Python", "Java", or "DSA"</div>
                </motion.div>
              )}

              {!searching && results.length > 0 && (
                <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="flex items-center gap-3 mb-5">
                    <h2 className="text-lg font-bold text-white">
                      {results.length} Playlist{results.length !== 1 ? "s" : ""} for
                      <span className="text-indigo-400 ml-2">"{searchTerm}"</span>
                    </h2>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border flex items-center gap-1.5 ${
                      searchData?.source === "csv"
                        ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"
                        : "bg-red-500/10 border-red-500/25 text-red-400"
                    }`}>
                      {searchData?.source === "csv"
                        ? <><CheckCircle className="w-3 h-3" /> From local CSV database</>
                        : <><Database className="w-3 h-3" /> Fetched from YouTube API</>
                      }
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {results.map((pl, i) => (
                      <PlaylistCard
                        key={pl.id + i}
                        pl={pl}
                        rank={i + 1}
                        savedIds={savedIds}
                        onSave={(p) => saveMut.mutate(p)}
                        onUnsave={(id) => unsaveMut.mutate(id)}
                        onWatch={(p) => handleOpenPlayer(p)}
                        delay={i * 0.06}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              {!hasSearched && !queryError && (
                <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex flex-col items-center py-20 gap-3 text-center">
                  <div className="w-16 h-16 rounded-2xl glass flex items-center justify-center mb-2">
                    <Search className="w-8 h-8 text-slate-500" />
                  </div>
                  <div className="text-slate-300 font-semibold text-base">
                    Search for a programming skill or technology to get started.
                  </div>
                  <div className="text-slate-500 text-xs mt-0.5 mb-2">
                    Only skills, frameworks, and tools — no movies or entertainment.
                  </div>
                  <div className="text-slate-500 text-sm flex items-center gap-2 flex-wrap justify-center">
                    Try:{" "}
                    {["Python", "Java", "C++", "DSA", "React", "System Design", "Machine Learning", "SQL"].map((s) => (
                      <button
                        key={s}
                        onClick={() => { setQuery(s); setQueryError(null); }}
                        className="text-indigo-400 hover:text-indigo-300 underline-offset-2 hover:underline transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ── SAVED Content */}
        {activeCard === "saved" && (
          <motion.div
            key="saved"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            {/* ── Stats header */}
            <div
              className="rounded-2xl p-5"
              style={{ background: "rgba(14,22,44,0.8)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2.5 mb-1">
                    <SaveIcon size={20} className="w-5 h-5 text-purple-400" />
                    <h2 className="text-base font-bold text-white">Saved Playlists &amp; Progress</h2>
                    {loadingSaved && <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-500" />}
                  </div>
                  <p className="text-sm text-slate-500">
                    Watch your saved video playlists, track video completions, and continue learning.
                  </p>
                </div>
                {/* Stats counters */}
                <div className="flex items-stretch gap-3 shrink-0">
                  <div
                    className="text-center px-6 py-3 rounded-xl"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">SAVED</div>
                    <div className="text-2xl font-bold text-white">{savedList.length}</div>
                  </div>
                  <div
                    className="text-center px-6 py-3 rounded-xl"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">COMPLETED</div>
                    <div className="text-2xl font-bold text-emerald-400">0</div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Playlist rows */}
            {savedList.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-2xl py-24 flex flex-col items-center gap-4 text-center"
                style={{ background: "rgba(14,22,44,0.7)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <Bookmark className="w-14 h-14 text-slate-700" />
                <div className="text-slate-400 font-semibold">No saved playlists yet.</div>
                <div className="text-slate-600 text-sm">
                  Search for a skill in Card 1 and click the{" "}
                  <strong className="text-slate-400">Save</strong> button.
                </div>
                <button
                  onClick={() => setActiveCard("explore")}
                  className="mt-2 px-5 py-2.5 rounded-xl text-sm text-white font-bold flex items-center gap-2"
                  style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)" }}
                >
                  <Search className="w-4 h-4" /> Explore Skills
                </button>
              </motion.div>
            ) : (
              <div className="space-y-3">
                {savedList.map((pl, i) => (
                  <SavedPlaylistRow
                    key={pl.id}
                    pl={pl}
                    onWatch={(p) => handleOpenPlayer(p, 0)}
                    onDelete={(id) => unsaveMut.mutate(id)}
                    onWatchVideo={(p, idx) => handleOpenPlayer(p, idx)}
                    delay={i * 0.05}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
