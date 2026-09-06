// ── Types ─────────────────────────────────────────────────────────────────────
export type ActiveCard = "explore" | "saved";
export type Lang = "english" | "telugu" | "hindi";

export const LANGUAGES: { value: Lang; label: string }[] = [
  { value: "english", label: "English" },
  { value: "telugu",  label: "Telugu"  },
  { value: "hindi",   label: "Hindi"   },
];

// ── Client-side skill-query guard ─────────────────────────────────────────────
// Zero-tolerance prohibited terms (Adult, Romance, Songs, Music, Explicit Entertainment)
export const PROHIBITED_TERMS = [
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
export const OFFTOPIC_TERMS = [
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

export const SKILL_TERMS = [
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

export function validateClientSkillQuery(q: string): { isValid: boolean; error: string | null } {
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

export function isSkillQuery(q: string): boolean {
  return validateClientSkillQuery(q).isValid;
}

export function isNonSkillQuery(q: string): string | null {
  return validateClientSkillQuery(q).error;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
export function getLevelStyle(level: string): string {
  const l = level.toLowerCase();
  if (l.includes("beginner"))     return "text-emerald-700 bg-emerald-50 border-emerald-200/90 font-bold shadow-xs";
  if (l.includes("intermediate")) return "text-sky-700 bg-sky-50 border-sky-200/90 font-bold shadow-xs";
  if (l.includes("advanced"))     return "text-indigo-700 bg-indigo-50 border-indigo-200/90 font-bold shadow-xs";
  return "text-purple-700 bg-purple-50 border-purple-200/90 font-bold shadow-xs";
}

export function extractPlaylistId(url: string): string | null {
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
