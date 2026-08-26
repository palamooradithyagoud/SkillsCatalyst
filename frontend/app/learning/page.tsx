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
type Lang  = "all" | "english" | "hindi" | "telugu" | "tamil";

const LEVELS: { value: Level; label: string }[] = [
  { value: "all",          label: "All Levels"   },
  { value: "beginner",     label: "Beginner"      },
  { value: "intermediate", label: "Intermediate"  },
  { value: "advanced",     label: "Advanced"      },
];

const LANGUAGES: { value: Lang; label: string }[] = [
  { value: "all",     label: "All Languages" },
  { value: "english", label: "English"       },
  { value: "hindi",   label: "Hindi"         },
  { value: "telugu",  label: "Telugu"        },
  { value: "tamil",   label: "Tamil"         },
];

// ── Client-side skill-query guard ─────────────────────────────────────────────
// Zero-tolerance prohibited terms (Adult, Romance, Songs, Music, Explicit Entertainment)
const PROHIBITED_TERMS = [
  // Adult / NSFW / Porn
  "porn", "xxx", "sex", "sexy", "erotic", "erotica", "nude", "nudity", "naked",
  "boobs", "cleavage", "bikini", "18+", "nsfw", "adult", "bhabhi", "aunty",
  "hot scene", "hot video", "hot clip", "hot girl", "hot actress", "sensual", "lust",
  "strip", "onlyfans", "playboy", "hentai", "ecchi", "r18", "uncensored",
  // Romance / Dating / Kissing
  "romance", "romantic", "hot romance", "hot love", "love story", "kiss", "kissing",
  "lip lock", "bed scene", "romance scene", "dating", "hookup", "couple goals",
  "crush", "flirt", "breakup", "affair",
  // Music / Songs / Tracks
  "song", "songs", "music", "album", "albums", "audio", "track", "tracks", "lyrics",
  "singer", "singers", "band", "dj", "remix", "lofi", "lo-fi", "mashup", "gaana",
  "mp3", "soundtrack", "melody", "pop", "rap", "hiphop", "rock", "bgm", "ringtone",
  "karaoke", "dance", "choreography", "party song", "item song", "sad song",
  "official music video", "lyric video", "full song", "audio song",
  // Pranks / Roasts
  "prank", "pranks", "roast", "roasting", "comedy video", "funny video", "tiktok", "reels", "mukbang",
];

// General off-topic domains (sports, food, movies, news, politics)
const OFFTOPIC_TERMS = [
  "movie", "movies", "film", "films", "cinema", "netflix", "disney", "hotstar", "prime",
  "celebrity", "bollywood", "hollywood", "tollywood", "kollywood",
  "anime", "manga", "cartoon", "podcast", "vlog", "trailer", "teaser",
  "cricket", "ipl", "football", "soccer", "nfl", "nba", "sports", "match", "tournament",
  "recipe", "food", "cooking", "restaurant", "diet",
  "relationship", "marriage", "wedding",
  "joke", "jokes", "meme", "memes", "funny",
  "politics", "election", "president", "government",
  "astrology", "horoscope", "zodiac",
  "weather", "news", "headline", "crypto", "bitcoin", "stock market",
];

const SKILL_TERMS = [
  "python", "java", "javascript", "typescript", "react", "vue", "angular", "node",
  "django", "flask", "fastapi", "machine learning", "deep learning", "ai", "ml",
  "data science", "nlp", "llm", "dsa", "ds", "algorithm", "data structure", "leetcode",
  "system design", "cloud", "aws", "azure", "gcp", "devops", "docker", "kubernetes",
  "sql", "database", "mongodb", "postgres", "redis", "api", "rest", "graphql",
  "html", "css", "frontend", "backend", "fullstack", "git", "github", "linux",
  "bash", "c++", "cpp", "golang", "rust", "kotlin", "swift", "flutter", "dart", "php",
  "cybersecurity", "networking", "programming", "coding", "software", "developer",
  "engineer", "interview", "resume", "career", "roadmap", "tech", "tutorial", "course",
  "c language", "c programming", "web development", "next.js", "tailwind", "express",
];

function validateClientSkillQuery(q: string): { isValid: boolean; error: string | null } {
  const lower = q.toLowerCase().trim();
  if (!lower || lower.length < 2) {
    return { isValid: false, error: "Please enter at least 2 characters to search for a skill (e.g. Python, React, DSA)." };
  }
  if (/^[\d\s]+$/.test(lower)) {
    return { isValid: false, error: "🚫 Numbers alone aren't a skill. Try \"Python\", \"React\", or \"DSA\"." };
  }

  // 1. Zero tolerance for adult, romance, songs, music
  const hasProhibited = PROHIBITED_TERMS.some((t) => lower.includes(t));
  if (hasProhibited) {
    return {
      isValid: false,
      error: "🚫 The Learning section is exclusively for educational & programming topics. Songs, romance, adult, and entertainment queries are strictly blocked.",
    };
  }

  // 2. Off-topic domain check
  const hasOffTopic = OFFTOPIC_TERMS.some((t) => lower.includes(t));
  const hasSkill    = SKILL_TERMS.some((t) => lower.includes(t));
  if (hasOffTopic && !hasSkill) {
    return {
      isValid: false,
      error: `🚫 "${q}" doesn't look like a tech or educational skill. Try searching for a programming language, tool, or concept — e.g. "Python", "React", "DSA", or "System Design".`,
    };
  }

  return { isValid: true, error: null };
}

function isSkillQuery(q: string): boolean {
  return validateClientSkillQuery(q).isValid;
}

function isNonSkillQuery(q: string): string | null {
  return validateClientSkillQuery(q).error;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function getLevelStyle(level: string): string {
  const l = level.toLowerCase();
  if (l.includes("beginner"))     return "text-emerald-700 bg-emerald-50 border-emerald-200/90 font-bold shadow-xs";
  if (l.includes("intermediate")) return "text-sky-700 bg-sky-50 border-sky-200/90 font-bold shadow-xs";
  if (l.includes("advanced"))     return "text-indigo-700 bg-indigo-50 border-indigo-200/90 font-bold shadow-xs";
  return "text-purple-700 bg-purple-50 border-purple-200/90 font-bold shadow-xs";
}

function extractPlaylistId(url: string): string | null {
  if (!url) return null;
  const listMatch = url.match(/[?&]list=([^&]+)/);
  if (listMatch) return listMatch[1];
  const vMatch = url.match(/[?&]v=([^&]+)/);
  if (vMatch) return vMatch[1];
  const shortMatch = url.match(/youtu\.be\/([^?&]+)/);
  if (shortMatch) return shortMatch[1];
  const embedMatch = url.match(/\/embed\/([^?&]+)/);
  if (embedMatch) return embedMatch[1];
  return null;
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
        className="appearance-none bg-slate-50 border border-slate-200/90 rounded-2xl pl-4 pr-9 py-3 text-sm font-semibold text-slate-800 cursor-pointer hover:border-emerald-400 focus:bg-white focus:border-emerald-600 transition-all shadow-xs"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-white text-slate-800">
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
    </div>
  );
}

import SpotlightCard from "@/components/SpotlightCard";

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
      className="h-full"
    >
      <SpotlightCard
        spotlightColor="rgba(16, 185, 129, 0.2)"
        className="rounded-[20px] sm:rounded-[24px] border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-emerald-300/80 transition-all duration-300 p-3.5 sm:p-6 flex flex-col justify-between group h-full"
      >
        <div>
          {/* ── Meta Row */}
          <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3.5 flex-wrap">
            <span className="text-[10px] sm:text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200/80 px-2 py-0.5 rounded-full shadow-xs">
              #{rank}
            </span>
            <span className={`text-[10px] sm:text-xs px-2 py-0.5 rounded-full border ${getLevelStyle(pl.level)}`}>
              {pl.level || "All Levels"}
            </span>
            {pl.language && (
              <span className="text-[10px] sm:text-xs font-bold text-violet-700 bg-violet-50 border border-violet-200/90 px-2 py-0.5 rounded-full shadow-xs">
                {pl.language}
              </span>
            )}
            {pl.source === "csv" ? (
              <span className="flex items-center gap-1 text-[9px] sm:text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/90 px-2 py-0.5 rounded-full ml-auto shadow-xs">
                <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-600" /> CSV
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[9px] sm:text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/90 px-2 py-0.5 rounded-full ml-auto shadow-xs">
                <Database className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-indigo-600" /> YouTube
              </span>
            )}
          </div>

          {/* ── Body */}
          <div className="space-y-1">
            <h3 className="text-xs sm:text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors leading-snug line-clamp-2">
              {pl.title}
            </h3>
            <p className="text-[10px] sm:text-xs font-semibold text-slate-500 truncate">{pl.channel}</p>
            <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed line-clamp-2 sm:line-clamp-3 mt-1 sm:mt-2 font-normal hidden sm:block">
              {pl.description || "No description available."}
            </p>
          </div>
        </div>

        {/* ── Footer Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5 sm:gap-3 pt-3 sm:pt-5 mt-3 sm:mt-4 border-t border-slate-100">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onWatch(pl)}
            className="w-full sm:flex-1 py-2 sm:py-2.5 rounded-full flex items-center justify-center gap-1.5 text-[11px] sm:text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-white" /> Watch
          </motion.button>

          {onSave && onUnsave && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => isSaved ? onUnsave(pl.id) : onSave(pl)}
              className={`w-full sm:flex-1 py-2 sm:py-2.5 rounded-full text-[11px] sm:text-xs font-bold border transition-all cursor-pointer ${
                isSaved
                  ? "text-emerald-800 border-emerald-300 bg-emerald-50 hover:bg-rose-50 hover:border-rose-300 hover:text-rose-700 shadow-xs"
                  : "text-slate-700 border-slate-200/90 bg-slate-100/80 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 shadow-xs"
              }`}
            >
              {isSaved ? "Saved ✓" : "Save"}
            </motion.button>
          )}
        </div>
      </SpotlightCard>
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
    ? "text-slate-500 bg-slate-100 border-slate-200"
    : pct === 100
    ? "text-emerald-800 bg-emerald-100 border-emerald-200 font-bold"
    : pct > 0
    ? "text-amber-900 bg-amber-100 border-amber-200 font-bold"
    : "text-slate-600 bg-slate-100 border-slate-200 font-semibold";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      className="course-card card-morph bg-white rounded-[24px] border border-slate-100 shadow-xs hover:shadow-md overflow-hidden"
    >
      {/* ── Row Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 pt-5 pb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-slate-900 truncate">{pl.title}</h3>
          <p className="text-xs font-semibold text-slate-400 mt-0.5">
            {[pl.channel, pl.language, pl.skill_query, pl.level].filter(Boolean).join(" • ")}
          </p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <span className={`text-xs px-3 py-1 rounded-full border ${statusStyle}`}>
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
            className="px-5 py-2 rounded-full text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-600/20 cursor-pointer"
          >
            Watch Track
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onDelete(pl.id)}
            className="px-3.5 py-2 rounded-full text-xs font-bold text-rose-600 bg-rose-50 border border-rose-100 hover:bg-rose-100 transition-colors cursor-pointer"
          >
            Delete
          </motion.button>
        </div>
      </div>

      {/* ── Progress line */}
      <div className="flex items-center justify-between px-6 pb-3 mt-1">
        {!hasLoaded ? (
          <span className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
            <span>Syncing video progress...</span>
          </span>
        ) : (
          <span className="text-xs font-semibold text-slate-600">
            {watchedCount} of {displayCount} videos completed ({pct}%)
          </span>
        )}
        <button
          onClick={() => setExpanded((e) => !e)}
          className="text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors cursor-pointer"
        >
          {expanded
            ? "Hide Lessons ▲"
            : hasLoaded
            ? `Show Lessons (${displayCount}) ▼`
            : "Show Lessons ▼"}
        </button>
      </div>

      {/* ── Progress bar */}
      {pct > 0 && (
        <div className="mx-6 mb-4 h-2 rounded-full overflow-hidden bg-slate-100 p-0.5 border border-slate-200/60">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full rounded-full bg-gradient-to-r from-amber-400 via-emerald-500 to-teal-500"
          />
        </div>
      )}

      {/* ── Expandable video list (Matches Image 2) */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-slate-100"
          >
            {loadingVideos ? (
              <div className="flex items-center justify-center gap-3 py-8 text-slate-500">
                <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
                <span className="text-xs font-semibold">Loading course lessons...</span>
              </div>
            ) : videos.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No videos found for this track.
              </div>
            ) : (
              <div className="p-4 space-y-2.5 bg-slate-50/70">
                {videos.map((v, i) => {
                  const done = v.watched;

                  return (
                    <div
                      key={v.videoId}
                      onClick={() => onWatchVideo(pl, i)}
                      className={`w-full flex items-center justify-between p-4 rounded-[20px] border text-left transition-all cursor-pointer ${
                        done
                          ? "bg-amber-400 border-amber-400 text-slate-900 shadow-sm font-extrabold"
                          : "bg-white border-slate-200/90 text-slate-900 font-bold hover:border-slate-300 hover:shadow-xs"
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0 pr-2 flex-1">
                        {/* Circular badge icon matching Image 2 */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markMut.mutate({ videoId: v.videoId, watched: !v.watched });
                          }}
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-xs shrink-0 transition-transform active:scale-95 ${
                            done
                              ? "bg-slate-900/15 border border-slate-900/20 text-slate-900"
                              : "bg-slate-100 text-slate-700 hover:bg-emerald-100 hover:text-emerald-800"
                          }`}
                        >
                          {done ? (
                            <CheckCircle className="w-5 h-5 text-slate-900" />
                          ) : (
                            <span>{i + 1}</span>
                          )}
                        </button>

                        {/* Lesson title matching Image 2 */}
                        <span className="text-xs sm:text-sm font-bold leading-snug line-clamp-2">
                          {v.title}
                        </span>
                      </div>
                    </div>
                  );
                })}
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
  const isValidYTId = typeof videoId === "string" && /^[a-zA-Z0-9_-]{11}$/.test(videoId);
  const safeVideoId = isValidYTId ? videoId : "rfscVS0vtbw";
  const containerId = `yt-player-${safeVideoId}`;
  useYouTubePlayer({
    containerId,
    videoId: safeVideoId,
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
  const [activeTab, setActiveTab] = useState<"Overview" | "Notes" | "Instructor" | "FAQ">("Overview");

  // Sync active player view state to document body attribute for MobileNav detection
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.body.setAttribute("data-learning-player", "true");
    }
    return () => {
      if (typeof document !== "undefined") {
        document.body.removeAttribute("data-learning-player");
      }
    };
  }, []);

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

    setCompletedVideoIds((prev) => new Set([...prev, vid]));
    setShowCompletionBanner(true);
    bannerTimerRef.current = setTimeout(() => setShowCompletionBanner(false), 3500);

    completeMut.mutate({ videoId: vid, watchTime: Math.round(watchedSeconds) });

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
      className="max-w-7xl mx-auto pb-12 space-y-6"
    >
      {/* ── Completion Banner Toast */}
      <AnimatePresence>
        {showCompletionBanner && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className="fixed top-5 right-5 z-[70] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl backdrop-blur-xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white border border-emerald-400/40"
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

      {/* ── Course Header Banner (Matches Screenshot) */}
      <div className="relative overflow-hidden rounded-[20px] sm:rounded-[28px] bg-gradient-to-r from-[#173e32] via-[#12362b] to-[#0d2a21] p-3.5 sm:p-8 text-white shadow-md">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-25 pointer-events-none hidden md:block">
          <div className="w-36 h-36 rounded-full bg-gradient-to-tr from-pink-400 to-amber-300 blur-2xl" />
        </div>

        <div className="relative z-10 max-w-3xl space-y-3">
          {/* Breadcrumb + Back Button */}
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-200/80">
            <button
              onClick={onBack}
              className="hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> My courses
            </button>
            <span>&gt;</span>
            <span className="text-white font-bold">{pl.title}</span>
          </div>

          {/* Big Course Title */}
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            {pl.title}
          </h1>

          {/* Course description */}
          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-normal line-clamp-2">
            {pl.description || `This course will help you quickly get started with ${pl.skill_query || "this topic"}: setting up the environment, project structure, syntax, data types, functions, DOM, and basic debugging.`}
          </p>

          {/* Progress & Lessons Info */}
          <div className="flex items-center gap-6 pt-2 flex-wrap text-xs sm:text-sm font-semibold text-emerald-100">
            <div className="flex items-center gap-3">
              <div className="w-40 h-2.5 rounded-full bg-black/40 overflow-hidden p-0.5 border border-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 via-emerald-400 to-teal-300 transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span>{pct}% complete</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-200">
              <BookOpen className="w-4 h-4 text-amber-300" />
              <span>{videos.length - watchedCount} videos left</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Player Grid (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
        {/* LEFT COLUMN: Player + Tab Controls + About */}
        <div className="space-y-6">
          {/* Embedded Video Card */}
          <div className="bg-white rounded-[28px] border border-slate-200/90 shadow-sm p-4 space-y-4 overflow-hidden">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-base font-bold text-slate-900 line-clamp-1">
                {currentVideo ? `${currentIdx + 1}. ${currentVideo.title}` : pl.title}
              </h2>
              <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200/80">
                {currentIdx + 1} of {videos.length}
              </span>
            </div>

            {/* Video Player */}
            <div className="rounded-2xl overflow-hidden bg-slate-950 relative shadow-inner">
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
                <div className="h-[400px] flex items-center justify-center text-slate-400">
                  Select a video to start learning
                </div>
              )}
            </div>

            {/* Prev / Next / Complete */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={goPrev}
                  disabled={currentIdx === 0}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200/80 disabled:opacity-40 transition-all cursor-pointer flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>
                <button
                  onClick={goNext}
                  disabled={currentIdx >= videos.length - 1}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-sm shadow-emerald-600/20 disabled:opacity-40 transition-all cursor-pointer flex items-center gap-1"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {currentVideo && (
                <button
                  onClick={() => markMut.mutate({ videoId: currentVideo.videoId, watched: !isCompleted(currentVideo.videoId) })}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                    isCompleted(currentVideo.videoId)
                      ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                      : "bg-slate-100 text-slate-700 border-slate-200/80 hover:bg-emerald-50 hover:text-emerald-700"
                  }`}
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  {isCompleted(currentVideo.videoId) ? "Completed ✓" : "Mark Complete"}
                </button>
              )}
            </div>
          </div>

          {/* Navigation Pills below Video */}
          <div className="bg-white rounded-[28px] border border-slate-200/90 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
              {(["Overview", "Notes", "Instructor", "FAQ"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    activeTab === tab
                      ? "bg-amber-400 text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Details */}
            {activeTab === "Overview" && (
              <div className="space-y-3 pt-1">
                <h3 className="text-base font-bold text-slate-900">About this Course</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {pl.description || `This module shows how to apply ${pl.skill_query || "concepts"} in real-world tasks: setting up the environment, organizing project structure, writing and debugging code. After viewing it, you will be able to create simple interactivity without frameworks.`}
                </p>
                <div className="flex items-center gap-4 pt-3 text-xs text-slate-500 flex-wrap">
                  <span>Instructor: <strong className="text-slate-800">{pl.channel || "Verified Top Educator"}</strong></span>
                  <span>•</span>
                  <span>Category: <strong className="text-slate-800">{pl.skill_query || "General"}</strong></span>
                  <span>•</span>
                  <span>Level: <strong className="text-slate-800">{pl.level || "All Levels"}</strong></span>
                </div>
              </div>
            )}

            {activeTab === "Notes" && (
              <div className="space-y-3 pt-1">
                <h3 className="text-base font-bold text-slate-900">Key Timestamps</h3>
                <div className="space-y-2">
                  {[
                    { time: "2:10", text: "Arrays: map, filter, reduce — short examples." },
                    { time: "3:10", text: "Functions: declarations and expressions; default parameters." },
                    { time: "5:14", text: "Primitives vs objects; type conversion." },
                    { time: "6:12", text: "Variables let/const; when not to use var." },
                  ].map((n, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                      <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-lg font-mono">{n.time}</span>
                      <span className="text-xs text-slate-700 font-medium">{n.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "Instructor" && (
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 pt-1">
                <div className="w-12 h-12 rounded-full bg-emerald-600 text-white font-black flex items-center justify-center text-base shadow-sm">
                  {pl.channel ? pl.channel.slice(0, 2).toUpperCase() : "IN"}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{pl.channel || "Expert Instructor"}</h4>
                  <p className="text-xs text-slate-500 font-medium">Curated Top Educator on YouTube</p>
                </div>
              </div>
            )}

            {activeTab === "FAQ" && (
              <div className="space-y-3 text-xs text-slate-600 pt-1">
                <p><strong>Q: How is my learning progress tracked?</strong><br />Progress marks complete automatically when watching over 75% of a lesson video.</p>
                <p><strong>Q: Can I rewatch videos anytime?</strong><br />Yes, saved playlists remain available indefinitely in your account.</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Course Content Playlist */}
        <div>
          {/* Course Content Playlist */}
          <div className="bg-white rounded-[28px] border border-slate-200/90 p-5 shadow-sm space-y-4 flex flex-col max-h-[680px]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Course content</h3>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full">
                {videos.length} Videos
              </span>
            </div>

            {/* Videos List */}
            <div ref={sidebarRef} className="overflow-y-auto space-y-2.5 pr-1 flex-1">
              {videos.map((v, i) => {
                const done = isCompleted(v.videoId);
                const isCurrent = i === currentIdx;

                return (
                  <button
                    key={v.videoId}
                    data-idx={i}
                    onClick={() => setCurrentIdx(i)}
                    className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      isCurrent
                        ? "bg-amber-400 border-amber-400 text-slate-900 shadow-md font-bold"
                        : done
                        ? "bg-slate-50 border-slate-200/80 text-slate-500 hover:bg-slate-100"
                        : "bg-white border-slate-200/90 text-slate-800 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        isCurrent
                          ? "border border-slate-900 text-slate-900 bg-amber-300"
                          : done
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-100 text-slate-600"
                      }`}>
                        {done ? "✓" : i + 1}
                      </span>
                      <span className="text-xs font-semibold line-clamp-2 leading-snug">
                        {v.title}
                      </span>
                    </div>

                    {done && !isCurrent && (
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
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
  const [language, setLanguage]         = useState<Lang>("all");
  const [searchTerm, setSearchTerm]     = useState("");
  const [hasSearched, setHasSearched]   = useState(false);
  const [notification, setNotification] = useState<{ msg: string; type: "success" | "error"; actionText?: string; onAction?: () => void } | null>(null);
  const [queryError, setQueryError]     = useState<string | null>(null);

  // ── Player state
  const [playerPlaylist, setPlayerPlaylist]   = useState<Playlist | null>(null);
  const [playerVideoIndex, setPlayerVideoIndex] = useState(0);

  // ── Auto-search from URL query param (e.g. /learning?query=Python)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const qParam = params.get("query") || params.get("topic") || params.get("q");
      if (qParam && qParam.trim()) {
        const cleanQ = qParam.trim();
        setQuery(cleanQ);
        setSearchTerm(cleanQ);
        setHasSearched(true);
      }
    }
  }, []);

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

    const validation = validateClientSkillQuery(trimmed);
    if (!validation.isValid) {
      setQueryError(validation.error || "Please enter a valid skill query.");
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

      {/* ── Top Two Cards (Side-by-Side on Mobile Grid) */}
      <div className="grid grid-cols-2 gap-3 sm:gap-5">
        {/* Card 1 — Explore */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.4, ease: "easeOut" }}
          onClick={() => setActiveCard("explore")}
          className={`relative rounded-[20px] sm:rounded-[28px] p-3.5 sm:p-6 cursor-pointer transition-all overflow-hidden bg-white border ${
            activeCard === "explore"
              ? "border-2 border-emerald-600 bg-gradient-to-br from-emerald-50/70 via-emerald-50/20 to-transparent shadow-md shadow-emerald-600/10"
              : "border-slate-200/80 shadow-xs hover:border-slate-300 hover:shadow-md"
          }`}
        >
          <div className="text-[9px] sm:text-[10px] font-extrabold text-emerald-700 tracking-widest uppercase mb-2">CARD 1</div>
          <div className="flex flex-col sm:flex-row items-start gap-2.5 sm:gap-4">
            <div className="p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-emerald-600 text-white shrink-0 shadow-sm shadow-emerald-600/30">
              <MagnifierIcon size={20} className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xs sm:text-lg font-bold text-slate-900 mb-0.5 sm:mb-1 leading-snug">Explore Skills</h3>
              <p className="text-[11px] sm:text-sm text-slate-500 font-medium leading-normal line-clamp-2 sm:line-clamp-none">
                AI-curated video playlists &amp; roadmaps.
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
          className={`relative rounded-[20px] sm:rounded-[28px] p-3.5 sm:p-6 cursor-pointer transition-all overflow-hidden bg-white border ${
            activeCard === "saved"
              ? "border-2 border-emerald-600 bg-gradient-to-br from-emerald-50/70 via-emerald-50/20 to-transparent shadow-md shadow-emerald-600/10"
              : "border-slate-200/80 shadow-xs hover:border-slate-300 hover:shadow-md"
          }`}
        >
          {/* Saved count badge */}
          <div
            className="absolute top-2.5 right-2.5 sm:top-4 sm:right-4 flex items-center gap-1 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold bg-emerald-100/90 text-emerald-800 border border-emerald-200 shadow-xs"
          >
            <SaveIcon size={12} className="w-3 h-3 text-emerald-700" />
            <span>{savedData?.count ?? 0} Saved</span>
          </div>
          <div className="text-[9px] sm:text-[10px] font-extrabold text-emerald-700 tracking-widest uppercase mb-2">CARD 2</div>
          <div className="flex flex-col sm:flex-row items-start gap-2.5 sm:gap-4">
            <div className="p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-emerald-600 text-white shrink-0 shadow-sm shadow-emerald-600/30">
              <SaveIcon size={20} className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xs sm:text-lg font-bold text-slate-900 mb-0.5 sm:mb-1 leading-snug">Saved Playlists</h3>
              <p className="text-[11px] sm:text-sm text-slate-500 font-medium leading-normal line-clamp-2 sm:line-clamp-none">
                Access saved tracks &amp; video progress.
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
            <div className="bg-white rounded-[28px] p-6 border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <MagnifierIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); setQueryError(null); }}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder="Search a programming skill, tool, or technology (e.g. Python, React, DSA)"
                    className={`w-full pl-11 pr-4 py-3 text-sm font-semibold bg-slate-50 border border-slate-200/90 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-emerald-600 transition-all shadow-xs ${
                      queryError ? "border-rose-500" : ""
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
                  className="px-7 py-3 rounded-full text-white font-bold text-sm flex items-center justify-center gap-2 whitespace-nowrap bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {searching
                    ? <><Loader2 className="w-4 h-4 animate-spin text-white" /> Searching...</>
                    : <><Sparkles className="w-4 h-4 text-emerald-200" /> Find Resources</>
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
                    className="flex items-start gap-2 mt-1 px-4 py-3 rounded-xl text-sm text-rose-700 bg-rose-50 border border-rose-200"
                  >
                    <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
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
                  <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
                  <div className="text-slate-600 text-sm font-medium">
                    Searching CSV database &amp; YouTube API for{" "}
                    <span className="text-slate-900 font-bold">"{query}"</span>...
                  </div>
                </motion.div>
              )}

              {!searching && hasSearched && results.length === 0 && (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex flex-col items-center py-20 gap-3 text-center">
                  <Globe className="w-12 h-12 text-slate-400" />
                  <div className="text-slate-600 text-sm font-medium">
                    No results found for "<span className="text-slate-900 font-bold">{searchTerm}</span>"
                  </div>
                  <div className="text-slate-500 text-xs">Try a broader term like "Python", "Java", or "DSA"</div>
                </motion.div>
              )}

              {!searching && results.length > 0 && (
                <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="flex items-center gap-3 mb-5">
                    <h2 className="text-lg font-bold text-slate-900">
                      {results.length} Playlist{results.length !== 1 ? "s" : ""} for
                      <span className="text-emerald-700 font-extrabold ml-2">"{searchTerm}"</span>
                    </h2>
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border flex items-center gap-1.5 shadow-xs ${
                      searchData?.source === "csv"
                        ? "bg-emerald-50 border-emerald-200/90 text-emerald-700"
                        : "bg-indigo-50 border-indigo-200/90 text-indigo-700"
                    }`}>
                      {searchData?.source === "csv"
                        ? <><CheckCircle className="w-3 h-3 text-emerald-600" /> From local CSV database</>
                        : <><Database className="w-3 h-3 text-indigo-600" /> Fetched from YouTube API</>
                      }
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
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
                  <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-2 shadow-sm">
                    <Search className="w-8 h-8 text-emerald-600" />
                  </div>
                  <div className="text-slate-800 font-bold text-base">
                    Search for a programming skill or technology to get started.
                  </div>
                  <div className="text-slate-500 text-xs mt-0.5 mb-2 font-medium">
                    Only skills, frameworks, and tools — no movies or entertainment.
                  </div>
                  <div className="text-slate-600 text-sm flex items-center gap-2 flex-wrap justify-center font-medium">
                    Try:{" "}
                    {["Python", "Java", "C++", "DSA", "React", "System Design", "Machine Learning", "SQL"].map((s) => (
                      <button
                        key={s}
                        onClick={() => { setQuery(s); setQueryError(null); }}
                        className="text-emerald-700 font-semibold hover:text-emerald-800 hover:underline underline-offset-2 transition-colors px-2 py-0.5 rounded-md bg-emerald-50/60 border border-emerald-200/60"
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
            <div className="relative overflow-hidden rounded-[20px] sm:rounded-[28px] bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 p-3.5 sm:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 shadow-md shadow-emerald-900/10">
              <div className="space-y-1 sm:space-y-2 max-w-md text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] sm:text-[10px] font-extrabold tracking-widest uppercase shadow-xs">
                    LEARNING TRACKS
                  </span>
                  {loadingSaved && <Loader2 className="w-3 h-3 animate-spin text-emerald-200" />}
                </div>
                <h2 className="text-base sm:text-3xl font-extrabold tracking-tight">Saved Playlists &amp; Progress</h2>
                <p className="text-[11px] sm:text-sm text-emerald-100/90 font-medium leading-snug sm:leading-relaxed line-clamp-2 sm:line-clamp-none">
                  Watch your saved video playlists, track real video completion progress, and resume learning anytime.
                </p>
              </div>

              {/* Stats Counters */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-center px-4 py-2 sm:px-6 sm:py-3.5 rounded-xl sm:rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md shadow-inner">
                  <div className="text-[9px] sm:text-[10px] font-extrabold text-emerald-100 uppercase tracking-wider mb-0.5">SAVED TRACKS</div>
                  <div className="text-lg sm:text-2xl font-black text-white">{savedList.length}</div>
                </div>
                <div className="text-center px-4 py-2 sm:px-6 sm:py-3.5 rounded-xl sm:rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md shadow-inner">
                  <div className="text-[9px] sm:text-[10px] font-extrabold text-emerald-100 uppercase tracking-wider mb-0.5">COMPLETED</div>
                  <div className="text-lg sm:text-2xl font-black text-emerald-300">0</div>
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
