import os
import csv
import httpx
import re
import logging
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Query, Depends
from pydantic import BaseModel
from typing import Optional
from backend.services.supabase_service import get_supabase
from backend.services.auth_service import get_current_user_id, get_session_or_user_id
from backend.config import YOUTUBE_API_KEY
from backend.services.rate_limiter import enforce_rate_limit, RATE_LIMIT_SEARCH_RPM

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/learning", tags=["learning"])

# ---------------------------------------------------------------------------
# Strict Educational Content Guard — zero-tolerance filters
# ---------------------------------------------------------------------------

# Absolutely prohibited terms: Adult / NSFW / Porn, Romance / Dating / Kissing, Songs / Music / Tracks, Pure Entertainment
_STRICT_PROHIBITED_TERMS = re.compile(
    r"\b("
    # Adult / NSFW / Porn / Erotic / Nude
    r"porn|xxx|sex|sexy|erotic|erotica|nude|nudity|naked|boobs|cleavage|bikini|18\+|nsfw|adult|"
    r"bhabhi|aunty|hot.?scene|hot.?video|hot.?clip|hot.?girl|hot.?actress|sensual|lust|lusty|"
    r"strip|cam|onlyfans|playboy|hentai|ecchi|r18|uncensored|leaked.?video|mms|"
    # Romance / Dating / Sensual / Kiss
    r"romance|romantic|hot.?romance|hot.?love|love.?story|kiss|kissing|lip.?lock|bed.?scene|"
    r"romance.?scene|dating|hookup|couple.?goals|crush|flirt|breakup|affair|girlfriend|boyfriend|"
    # Music / Songs / Tracks / Audio
    r"song|songs|music|album|albums|audio|track|tracks|lyrics|singer|singers|band|dj|remix|"
    r"lofi|lo-fi|mashup|gaana|mp3|soundtrack|official.?song|melody|pop|rap|hiphop|rock|bgm|"
    r"ringtone|tune|karaoke|dance|choreography|party.?song|item.?song|sad.?song|"
    r"official.?music.?video|lyric.?video|full.?song|audio.?song|"
    # Junk Entertainment / Pranks / Roasts
    r"prank|pranks|roast|roasting|comedy.?video|funny.?video|meme.?video|tiktok|reels|"
    r"shorts.?dance|reaction.?video|mukbang"
    r")\b",
    re.IGNORECASE,
)

# Blocklist: general domains outside tech/coding/career (sports, food, movies, news, politics, etc.)
_LEARNING_OFFTOPIC = re.compile(
    r"\b("
    # Entertainment & media
    r"movie|movies|film|films|cinema|series|web.?series|netflix|amazon.?prime|disney|hotstar|ott|"
    r"actor|actress|celebrity|bollywood|hollywood|tollywood|kollywood|anime|manga|cartoon|"
    r"podcast|vlog|vlogger|reality.?show|trailer|teaser|"
    # Sports
    r"cricket|ipl|football|soccer|nfl|nba|sports|match|tournament|stadium|player|scorer|"
    # Food / lifestyle
    r"recipe|food|cook|cooking|restaurant|dish|eat|meal|diet|fitness.?workout|"
    # Personal / relationships
    r"marriage|wedding|love|dating|breakup|joke|meme|funny|prank|entertainment|"
    # News / politics
    r"politics|election|president|prime.?minister|government|modi|trump|biden|parliament|"
    r"news|headline|current.?affairs|weather|forecast|"
    # Other off-topic
    r"astrology|horoscope|zodiac|religion|god|prayer|"
    r"stock|crypto|bitcoin|forex"
    r")\b",
    re.IGNORECASE,
)

# Allowlist: if any of these skill/career terms appear, permit even if an off-topic
# keyword also matched (e.g. "cricket data analysis in Python" is valid)
_LEARNING_SKILL = re.compile(
    r"\b("
    r"python|java|javascript|typescript|react|vue|angular|node|django|flask|fastapi|"
    r"machine.?learning|deep.?learning|ai|ml|data.?science|nlp|llm|neural|tensorflow|pytorch|"
    r"dsa|ds|algorithm|data.?structure|leetcode|competitive.?programming|sorting|searching|"
    r"system.?design|cloud|aws|azure|gcp|devops|docker|kubernetes|terraform|"
    r"sql|database|mongodb|postgres|redis|mysql|sqlite|"
    r"interview|resume|career|job|internship|salary|roadmap|skill|course|tutorial|playlist|"
    r"html|css|frontend|backend|fullstack|api|rest|graphql|web.?dev|"
    r"git|github|ci.?cd|linux|bash|shell|terminal|"
    r"c\+\+|cpp|golang|rust|kotlin|swift|flutter|dart|php|ruby|"
    r"c.?programming|c.?language|"
    r"cybersecurity|networking|os|operating.?system|computer.?science|"
    r"project|portfolio|startup|tech|software|engineer|developer|programmer|coding|programming"
    r")\b",
    re.IGNORECASE,
)

# Keywords in YT result titles/descriptions that signal non-skill content
_ENTERTAINMENT_TITLE_BLOCKLIST = [
    "podcast", "vlog", "daily vlog", "comedy", "funny", "reaction",
    "movie review", "film review", "music video", "music playlist",
    "cooking", "recipe", "food", "sports highlights", "cricket highlights",
    "ipl highlights", "match recap", "songs playlist", "top 10 songs",
    "best movies", "series review", "web series", "official music video",
    "dance video", "party songs", "dj remix", "lofi remix",
]


def _validate_skill_query(query: str) -> tuple[bool, str]:
    """
    Validates if the search query is strictly an educational / technical / career skill.
    Returns (is_valid, error_message).
    """
    stripped = query.strip()
    if not stripped:
        return False, "Search query cannot be empty."
    if len(stripped) < 2:
        return False, "Please enter at least 2 characters to search."
    if re.fullmatch(r"[\d\s]+", stripped):
        return False, "Numbers alone aren't a skill query. Try \"Python\", \"React\", or \"DSA\"."

    # 1. Zero-tolerance check: adult, romance, songs, music, explicit entertainment
    if _STRICT_PROHIBITED_TERMS.search(stripped):
        return False, "Search rejected. The Learning section is exclusively for educational & technical topics (songs, romance, adult, and entertainment queries are strictly prohibited)."

    # 2. General off-topic check (sports, movies, cooking, etc.)
    if _LEARNING_OFFTOPIC.search(stripped):
        # Only permit if a recognized tech/coding skill is explicitly present (e.g. "cricket data analysis with python")
        if not _LEARNING_SKILL.search(stripped):
            return False, f"\"{stripped}\" doesn't look like a technical or educational skill. Try searching for \"Python\", \"React\", \"DSA\", or \"System Design\"."

    return True, ""


def _is_skill_query(query: str) -> bool:
    """Backward compatibility wrapper returning boolean."""
    is_valid, _ = _validate_skill_query(query)
    return is_valid
import uuid


def _is_uuid(val: str) -> bool:
    if not val:
        return False
    try:
        uuid.UUID(str(val))
        return True
    except Exception:
        return False


def _filter_skill_playlists(results: list[dict]) -> list[dict]:
    """
    Post-filter YouTube results: remove playlists whose title or description
    contain prohibited or entertainment blocklist keywords (eliminates adult, romance,
    songs, music, and entertainment contamination from YouTube API).
    CSV-sourced results are always verified and pass through.
    """
    filtered = []
    for pl in results:
        # Always keep curated CSV-sourced playlists
        if pl.get("source") == "csv":
            filtered.append(pl)
            continue
        title = pl.get("title", "")
        desc = pl.get("description", "")
        channel = pl.get("channel", "")
        combined_text = f"{title} {desc} {channel}".lower()

        # Zero-tolerance check for adult/romance/songs
        if _STRICT_PROHIBITED_TERMS.search(combined_text):
            logger.info(f"Filtered out prohibited YT playlist: '{title}'")
            continue

        # Entertainment noise check
        if any(kw in combined_text for kw in _ENTERTAINMENT_TITLE_BLOCKLIST):
            logger.debug(f"Filtered out non-skill YT playlist: '{title}'")
            continue

        filtered.append(pl)
    return filtered


# ── Path to the data directory ──────────────────────────────────────────────
DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "data")

STOP_WORDS = {
    "in", "for", "the", "a", "an", "and", "or", "to", "of", "with",
    "by", "on", "at", "from", "is", "all", "complete", "course",
    "tutorial", "tutorials", "playlist", "video", "videos"
}

TECH_CONFIG = {
    "java": {
        # Language-only search (e.g. "java", "java tutorials") → tutorials CSV only
        "files": ["java_tutorials.csv"],
        # DSA search (e.g. "dsa in java", "data structures java") → DSA CSV only
        "dsa_files": ["dsa_in_java.csv"],
        "competing": [
            r"\bpython\b",
            r"(?<![a-zA-Z0-9])c\+\+(?![a-zA-Z0-9])",
            r"\bcpp\b",
            r"(?<![a-zA-Z0-9\+])c programming\b",
            r"(?<![a-zA-Z0-9\+])c language\b",
            # Bare standalone C (e.g. "Data Structures in C") but not C++/C#
            r"(?<![a-zA-Z0-9\+#])\bc\b(?![\+#a-zA-Z0-9])",
        ],
    },
    "python": {
        # Language-only search → tutorials CSV only
        "files": ["python_tutorials.csv"],
        # DSA search → DSA CSV only
        "dsa_files": ["dsa_in_python__1_.csv"],
        "competing": [
            r"\bjava\b",
            r"(?<![a-zA-Z0-9])c\+\+(?![a-zA-Z0-9])",
            r"\bcpp\b",
            r"(?<![a-zA-Z0-9\+])c programming\b",
            r"(?<![a-zA-Z0-9\+])c language\b",
            # Bare standalone C but not C++/C#
            r"(?<![a-zA-Z0-9\+#])\bc\b(?![\+#a-zA-Z0-9])",
        ],
    },
    "cpp": {
        # Language-only search → tutorials CSV only
        "files": ["cpp_tutorials.csv"],
        # DSA search → DSA CSV only
        "dsa_files": ["dsa_in_cpp.csv"],
        "competing": [
            r"\bjava\b",
            r"\bpython\b",
            r"(?<![a-zA-Z0-9\+])c programming\b",
            r"(?<![a-zA-Z0-9\+])c language\b",
        ],
    },
    "c": {
        # C only has one CSV (data structures / tutorials merged)
        "files": ["c_datastructures_tutorials.csv"],
        "dsa_files": ["c_datastructures_tutorials.csv"],
        "competing": [
            r"\bjava\b",
            r"\bpython\b",
            r"(?<![a-zA-Z0-9])c\+\+(?![a-zA-Z0-9])",
            r"\bcpp\b",
        ],
    },
}

# ── CSV keyword → file mapping ────────────────────────────────────────────────
# STRICT RULE:
#   Language keywords  (java/python/cpp/c++) → tutorials CSVs ONLY
#   DSA keywords (dsa/ds/data structures)    → dsa_ CSVs ONLY
#   They must NEVER be mixed.
CSV_TOPIC_MAP = {
    # ── Language tutorials (no DSA) ──────────────────────────────────────────
    "python":           ["python_tutorials.csv"],
    "java":             ["java_tutorials.csv"],
    "cpp":              ["cpp_tutorials.csv"],
    "c++":              ["cpp_tutorials.csv"],
    # \"c\" alone: word-boundary matched in search loop (len <= 2 path)
    "c":                ["c_datastructures_tutorials.csv"],

    # ── DSA / Data Structures (no language tutorials) ────────────────────────
    # Generic DSA: Java + C++ + Python DSA CSVs (C excluded unless explicit)
    "dsa":              ["dsa_in_java.csv", "dsa_in_cpp.csv", "dsa_in_python__1_.csv"],
    "data structure":   ["dsa_in_java.csv", "dsa_in_cpp.csv", "dsa_in_python__1_.csv"],
    "data structures":  ["dsa_in_java.csv", "dsa_in_cpp.csv", "dsa_in_python__1_.csv"],
    "algorithm":        ["dsa_in_java.csv", "dsa_in_cpp.csv", "dsa_in_python__1_.csv"],
    "algorithms":       ["dsa_in_java.csv", "dsa_in_cpp.csv", "dsa_in_python__1_.csv"],

    # ── Language-specific DSA ────────────────────────────────────────────────
    "dsa java":         ["dsa_in_java.csv"],
    "dsa python":       ["dsa_in_python__1_.csv"],
    "dsa cpp":          ["dsa_in_cpp.csv"],
    "dsa c":            ["c_datastructures_tutorials.csv"],
    "ds java":          ["dsa_in_java.csv"],
    "ds python":        ["dsa_in_python__1_.csv"],
    "ds cpp":           ["dsa_in_cpp.csv"],
    "ds c":             ["c_datastructures_tutorials.csv"],
    "data structures c": ["c_datastructures_tutorials.csv"],
}




LEVEL_MAP = {
    "beginner":     ["Beginner", "Beginner-Intermediate", "Beginner-Advanced", "Beginner to Intermediate", "Beginner to Advanced"],
    "intermediate": ["Intermediate", "Intermediate-Advanced", "Beginner-Intermediate", "Beginner to Intermediate", "Intermediate to Advanced", "Beginner-Advanced", "Beginner to Advanced"],
    "advanced":     ["Advanced", "Intermediate-Advanced", "Beginner-Advanced", "Intermediate to Advanced", "Beginner to Advanced"],
    "all":          None,
}


# Queries that contain these patterns should skip CSV lookup entirely and go to YouTube API.
# This covers frameworks/tools that don't have a dedicated CSV file.
_YOUTUBE_ONLY_PATTERNS = re.compile(
    r"\bspring.?boot\b|\bspring\b|\bhibernate\b|\bmicroservice\b|\bmicroservices\b"
    r"|\bdjango\b|\bflask\b|\bfastapi\b|\bexpress\b|\bnest\.?js\b"
    r"|\bkubernetes\b|\bdocker\b|\bdevops\b|\bansible\b|\bterraform\b"
    r"|\bangular\b|\bvue\b|\bsvelte\b|\bnext\.?js\b|\breact\b"
    r"|\bmachine.?learning\b|\bdeep.?learning\b|\bpytorch\b|\btensorflow\b"
    r"|\bgolang\b|\brust\b|\bkotlin\b|\bswift\b|\bflutter\b|\bdart\b|\bphp\b|\bruby\b"
    r"|\bcybersecurity\b|\bethical.?hacking\b|\baws\b|\bazure\b|\bgcp\b"
    r"|\bsystem.?design\b|\bsql\b|\bmongodb\b|\bpostgres\b|\bredis\b",
    re.IGNORECASE,
)


def _detect_primary_tech(query: str) -> Optional[str]:
    """Detects explicit programming language / tech domain from query.
    Returns None for any query that should go to YouTube (no CSV exists).
    Only returns a tech key when a dedicated curated CSV file is available.
    """
    q = query.lower()

    # Queries containing Spring / Spring Boot / frameworks → no CSV, use YouTube API
    if _YOUTUBE_ONLY_PATTERNS.search(q):
        return None

    # Pure Java (no framework terms) → java_tutorials.csv
    if re.search(r"\bjava\b", q):
        return "java"
    if re.search(r"\bpython\b|\bpy\b", q):
        return "python"
    if re.search(r"(?<![a-zA-Z0-9])c\+\+(?![a-zA-Z0-9])|\bcpp\b", q):
        return "cpp"
    # C language: must be explicit — "c", "c programming", "c language"
    # Negative lookbehind/ahead avoids matching "C" in acronyms like "C++", "C#", "science", "ReactC"
    if re.search(
        r"(?<![a-zA-Z0-9\+#])c programming\b"
        r"|(?<![a-zA-Z0-9\+#])c language\b"
        r"|(?<![a-zA-Z0-9\+#])\bc\b(?![\+#a-zA-Z0-9])",
        q
    ):
        return "c"
    return None


def _extract_playlist_id(url: str, fallback: str) -> str:
    if url and "list=" in url:
        return url.split("list=")[1].split("&")[0]
    return fallback


def _parse_csv(filename: str) -> list[dict]:
    path = os.path.join(DATA_DIR, filename)
    if not os.path.exists(path):
        return []
    results = []
    clean_fname = os.path.splitext(filename)[0]
    with open(path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row.get("playlist_title"):
                pl_url = row.get("playlist_url", "")
                pl_id = _extract_playlist_id(pl_url, f"{clean_fname}_{row.get('rank', '0')}")
                results.append({
                    "id":           pl_id,
                    "title":        row.get("playlist_title", ""),
                    "channel":      row.get("channel_name", ""),
                    "description":  row.get("description", ""),
                    "level":        row.get("level", ""),
                    "video_count":  row.get("video_count", "?"),
                    "duration":     f"{row.get('duration_hours', '?')} hrs",
                    "playlist_url": pl_url,
                    "channel_url":  row.get("channel_url", ""),
                    "source":       "csv",
                    "thumbnail":    "https://img.youtube.com/vi/default/hqdefault.jpg",
                })
    return results


def _filter_by_level(rows: list[dict], level: str) -> list[dict]:
    allowed = LEVEL_MAP.get(level.lower())
    if not allowed:
        return rows
    return [r for r in rows if any(a.lower() in r["level"].lower() for a in allowed)]


def _search_csv_playlists(query: str, level: str = "all") -> list[dict]:
    q_lower = query.lower().strip()
    if not q_lower:
        return []

    if not os.path.exists(DATA_DIR):
        return []

    # If the query matches a YouTube-only pattern (no CSV file exists for it),
    # return empty immediately so the caller falls back to the YouTube API.
    if _YOUTUBE_ONLY_PATTERNS.search(q_lower):
        return []

    tech = _detect_primary_tech(q_lower)
    is_dsa = bool(re.search(r"\b(dsa|ds|data structure|data structures|algorithm|algorithms)\b", q_lower))

    if tech:
        target_files = TECH_CONFIG[tech]["dsa_files"] if is_dsa else TECH_CONFIG[tech]["files"]
    elif is_dsa:
        # No language specified: default to Java/C++/Python DSA only.
        # C (c_datastructures_tutorials.csv) is only included when the user
        # explicitly mentions "c", "c language", or "c programming" in their query.
        target_files = ["dsa_in_java.csv", "dsa_in_cpp.csv", "dsa_in_python__1_.csv"]
    else:
        matched_files = set()
        for keyword, fnames in CSV_TOPIC_MAP.items():
            if len(keyword) <= 2:
                if re.search(r"\b" + re.escape(keyword) + r"\b", q_lower):
                    for fn in fnames:
                        matched_files.add(fn)
            else:
                if keyword in q_lower:
                    for fn in fnames:
                        matched_files.add(fn)
        target_files = list(matched_files) if matched_files else [f for f in os.listdir(DATA_DIR) if f.endswith(".csv")]

    results = []
    seen = set()
    for fn in target_files:
        for r in _parse_csv(fn):
            # Strict language scoping: when a specific tech like Java is requested, exclude competing technologies
            if tech:
                competing = TECH_CONFIG[tech]["competing"]
                title_lower = r["title"].lower()
                if any(re.search(pat, title_lower) for pat in competing):
                    continue

            key = r.get("playlist_url") or r.get("title")
            if key not in seen:
                seen.add(key)
                results.append(r)

    return _filter_by_level(results, level)


async def _search_youtube(
    query: str, level: str = "all", language: str = "english", max_results: int = 25
) -> list[dict]:
    """Search YouTube Data API v3 for playlists with strict educational parameters."""
    if not YOUTUBE_API_KEY:
        return []
    yt_query = (
        f"{query} course tutorial playlist programming educational "
        f"{level if level != 'all' else ''} "
        f"{language if language.lower() != 'english' else ''}"
    ).strip()
    params = {
        "part":              "snippet",
        "q":                 yt_query,
        "type":              "playlist",
        "maxResults":        max_results,
        "safeSearch":        "strict",
        "key":               YOUTUBE_API_KEY,
        "relevanceLanguage": language[:2].lower() if language else "en",
    }
    async with httpx.AsyncClient(timeout=10) as client:
        try:
            resp = await client.get("https://www.googleapis.com/youtube/v3/search", params=params)
            resp.raise_for_status()
            data = resp.json()
        except Exception as e:
            print(f"YouTube API error: {e}")
            return []

    results = []
    for i, item in enumerate(data.get("items", [])):
        snippet = item.get("snippet", {})
        pl_id   = item.get("id", {}).get("playlistId", "")
        thumbnail = (
            snippet.get("thumbnails", {}).get("medium", {}).get("url")
            or snippet.get("thumbnails", {}).get("default", {}).get("url")
            or ""
        )
        results.append({
            "id":           pl_id or str(i),
            "title":        snippet.get("title", "Untitled"),
            "channel":      snippet.get("channelTitle", ""),
            "description":  snippet.get("description", ""),
            "level":        level.capitalize() if level != "all" else "All Levels",
            "video_count":  "?",
            "duration":     "?",
            "playlist_url": f"https://www.youtube.com/playlist?list={pl_id}" if pl_id else "",
            "channel_url":  f"https://www.youtube.com/channel/{snippet.get('channelId', '')}",
            "source":       "youtube",
            "thumbnail":    thumbnail,
        })
    return results


# ── Pydantic Models ───────────────────────────────────────────────────────────
class SavePlaylistRequest(BaseModel):
    playlist_id:  str
    title:        str
    channel:      Optional[str] = ""
    description:  Optional[str] = ""
    level:        Optional[str] = ""
    video_count:  Optional[str] = "?"
    duration:     Optional[str] = "?"
    playlist_url: Optional[str] = ""
    thumbnail:    Optional[str] = ""
    source:       Optional[str] = "youtube"
    skill_query:  Optional[str] = ""
    # user_id intentionally excluded — derived from JWT only


class VideoProgressRequest(BaseModel):
    # user_id intentionally excluded — derived from JWT only
    playlist_id:   str
    video_id:      str
    watched:       bool  = True
    last_position: Optional[float] = None   # resume timestamp (seconds)
    watch_time:    Optional[int]   = None   # total seconds actually watched


class SaveProgressRequest(BaseModel):
    """Periodic progress save — updates position without overwriting watched status."""
    # user_id intentionally excluded — derived from JWT only
    playlist_id:   str
    video_id:      str
    last_position: float  # current playback position in seconds
    watch_time:    int    # cumulative seconds actually watched (anti-cheat tracked)


class CompleteVideoRequest(BaseModel):
    """Fired when player detects ≥75% of a video has been genuinely watched."""
    # user_id intentionally excluded — derived from JWT only
    playlist_id: str
    video_id:    str
    watch_time:  int       # seconds actually watched (server-side validation)
    completed:   bool = True
    last_position: Optional[float] = 0.0


class SyncSavedPlaylistsRequest(BaseModel):
    playlists: list[dict]



REPUTABLE_CHANNELS = {
    "freecodecamp", "code with harry", "codewithharry", "striver", "take u forward",
    "abdul bari", "traversy media", "fireship", "cs dojo", "tech with tim",
    "neso academy", "jenny's lectures", "gate smashers", "kunal kushwaha",
    "mycodeschool", "love babbar", "programming with mosh", "mosh", "academind",
    "edureka", "simplilearn", "geeksforgeeks", "gfg", "apna college", "chai aur code",
    "hitesh choudhary", "clever programmer", "telusko", "free code camp"
}

QUALITY_KEYWORDS = {
    "full course", "complete", "masterclass", "bootcamp", "tutorial",
    "playlist", "series", "zero to hero", "beginner to advanced", "one shot"
}

def _score_and_rank_playlists(results: list[dict], query: str, level: str = "all") -> list[dict]:
    q_lower = query.lower().strip()
    tech = _detect_primary_tech(q_lower)
    is_dsa = bool(re.search(r"\b(dsa|ds|data structure|data structures|algorithm|algorithms)\b", q_lower))
    q_words = set(w for w in re.split(r"\s+|-|_", q_lower) if len(w) > 1 and w not in STOP_WORDS)

    def calculate_score(p: dict) -> float:
        score = 0.0
        title_lower = p.get("title", "").lower()
        desc_lower = p.get("description", "").lower()
        channel_lower = p.get("channel", "").lower()
        level_str = p.get("level", "").lower()

        # 1. Curated CSV source boost (verified high-quality playlists)
        if p.get("source") == "csv":
            score += 50.0

        # 2. Strict technology match & penalty for competing tech
        if tech:
            if re.search(r"\b" + re.escape(tech) + r"\b", title_lower):
                score += 50.0
            if any(re.search(pat, title_lower) for pat in TECH_CONFIG[tech]["competing"]):
                score -= 500.0

        # 3. DSA/DS specific boost
        if is_dsa and any(w in title_lower for w in ["dsa", "data structure", "data structures", "algorithm", "algorithms", "bootcamp"]):
            score += 40.0

        # 4. Title relevance
        if q_lower in title_lower:
            score += 40.0
        elif q_words and all(w in title_lower for w in q_words):
            score += 30.0
        elif q_words and any(w in title_lower for w in q_words):
            score += 15.0

        # 5. Reputable Channel Boost
        if any(ch in channel_lower for ch in REPUTABLE_CHANNELS):
            score += 25.0

        # 6. Course / Quality Keyword Boost
        if any(kw in title_lower for kw in QUALITY_KEYWORDS):
            score += 15.0
        if any(kw in desc_lower for kw in QUALITY_KEYWORDS):
            score += 5.0

        # 7. Level Match
        if level != "all" and level.lower() in level_str:
            score += 10.0

        return score

    seen_ids = set()
    deduped = []
    for r in results:
        rid = r.get("id") or r.get("playlist_url") or r.get("title", "").lower().strip()
        if rid not in seen_ids:
            seen_ids.add(rid)
            deduped.append(r)

    deduped.sort(key=calculate_score, reverse=True)
    return deduped


# ── Search ────────────────────────────────────────────────────────────────────
@router.get("/search", dependencies=[Depends(enforce_rate_limit(max_requests=RATE_LIMIT_SEARCH_RPM))])
async def search_skill(
    query:       str = Query(..., description="Skill keyword e.g. Python, React, DSA"),
    level:       str = Query("all",     description="beginner | intermediate | advanced | all"),
    language:    str = Query("english", description="Language preference"),
    max_results: Optional[int] = Query(10, description="Max results limit (default 10, max 10)"),
):
    """
    Search playlists with quality ranking & limit strictly to TOP 10 best playlists.
    Strict CSV-first precedence: returns curated CSV results if found, otherwise falls back to YouTube API.
    """
    if not isinstance(level, str):
        level = getattr(level, "default", "all") or "all"
    if not isinstance(language, str):
        language = getattr(language, "default", "english") or "english"

    # ── Input sanitisation: strip HTML tags (XSS / injection guard)
    sanitised = re.sub(r"<[^>]+>", "", query).strip()

    # ── Validate: empty / whitespace
    if not sanitised:
        raise HTTPException(
            status_code=400,
            detail={"error": "empty_query", "message": "Search query cannot be empty."},
        )

    # ── Validate: too short (< 2 meaningful chars)
    if len(sanitised) < 2:
        raise HTTPException(
            status_code=400,
            detail={
                "error": "query_too_short",
                "message": "Please enter at least 2 characters to search.",
            },
        )

    # ── Validate: numbers-only query (e.g. "123", "99")
    if re.fullmatch(r"[\d\s]+", sanitised):
        raise HTTPException(
            status_code=400,
            detail={
                "error": "not_skill",
                "message": "Numbers alone aren't a skill query. Try \"Python\", \"React\", or \"DSA\".",
            },
        )

    # ── Educational & Skill-only guard: block prohibited and off-topic queries
    is_valid, error_msg = _validate_skill_query(sanitised)
    if not is_valid:
        logger.info(f"Non-skill / prohibited search blocked: '{sanitised[:80]}'")
        raise HTTPException(
            status_code=400,
            detail={
                "error": "not_skill",
                "message": error_msg,
            },
        )

    # Enforce top 10 limit
    limit = 10 if (max_results is None or max_results <= 0) else min(max_results, 10)

    # Search local CSV database first
    csv_rows = _search_csv_playlists(sanitised, level)

    if csv_rows:
        source_used = "csv"
        ranked = _score_and_rank_playlists(csv_rows, sanitised, level)
        top_10 = ranked[:limit]
    else:
        source_used = "youtube"
        yt_rows = await _search_youtube(sanitised, level, language, max_results=20)
        yt_rows = _filter_skill_playlists(yt_rows)
        ranked = _score_and_rank_playlists(yt_rows, sanitised, level)
        top_10 = ranked[:limit]

    logger.info(
        f"Search '{sanitised}' → {len(top_10)} results "
        f"(source={source_used}, level={level}, lang={language})."
    )

    return {
        "query": sanitised,
        "level": level,
        "language": language,
        "source": source_used,
        "count": len(top_10),
        "results": top_10,
    }



# ── Playlist CRUD ─────────────────────────────────────────────────────────────
@router.post("/save")
async def save_playlist(
    req: SavePlaylistRequest,
    current_user_id: str = Depends(get_session_or_user_id)
):
    user_id = current_user_id
    sb = get_supabase()
    if not sb:
        raise HTTPException(status_code=500, detail="Supabase not configured")
    try:
        video_count = req.video_count
        yt_pid = _extract_playlist_id(req.playlist_url, req.playlist_id)
        if YOUTUBE_API_KEY and yt_pid:
            try:
                async with httpx.AsyncClient(timeout=5) as client:
                    resp = await client.get(
                        "https://www.googleapis.com/youtube/v3/playlistItems",
                        params={"part": "id", "playlistId": yt_pid, "maxResults": 1, "key": YOUTUBE_API_KEY}
                    )
                    if resp.is_success:
                        data_json = resp.json()
                        total_res = data_json.get("pageInfo", {}).get("totalResults")
                        if total_res and total_res > 0:
                            video_count = str(total_res)
            except Exception as yt_err:
                print(f"Error fetching exact video count on save: {yt_err}")

        res_data = None
        if _is_uuid(user_id):
            data = {
                "playlist_id":  req.playlist_id,
                "title":        req.title,
                "channel":      req.channel or "",
                "description":  req.description or "",
                "level":        req.level or "",
                "video_count":  video_count or "?",
                "duration":     req.duration or "?",
                "playlist_url": req.playlist_url or "",
                "thumbnail":    req.thumbnail or "",
                "source":       req.source or "youtube",
                "skill_query":  req.skill_query or "",
                "user_id":      user_id,
            }
            try:
                result = sb.table("saved_playlists").upsert(data, on_conflict="playlist_id,user_id").execute()
                res_data = result.data
            except Exception as upsert_err:
                logger.warning(f"Upsert failed, falling back to manual select/insert: {upsert_err}")
                existing = sb.table("saved_playlists").select("id").eq("playlist_id", req.playlist_id).eq("user_id", user_id).execute()
                if existing.data and len(existing.data) > 0:
                    res_upd = sb.table("saved_playlists").update(data).eq("playlist_id", req.playlist_id).eq("user_id", user_id).execute()
                    res_data = res_upd.data
                else:
                    res_ins = sb.table("saved_playlists").insert(data).execute()
                    res_data = res_ins.data

        # Also sync to learning_progress JSONB column (supports both guest sessions & auth UUIDs)
        try:
            res_lp = sb.table("learning_progress").select("completed_steps").eq("session_id", user_id).eq("skill_name", "saved_playlists").limit(1).execute()
            existing_lp = res_lp.data[0].get("completed_steps", []) if (res_lp.data and len(res_lp.data) > 0) else []
            pl_entry = {
                "id": req.playlist_id,
                "title": req.title,
                "channel": req.channel or "",
                "description": req.description or "",
                "level": req.level or "",
                "video_count": video_count or "?",
                "duration": req.duration or "?",
                "playlist_url": req.playlist_url or "",
                "thumbnail": req.thumbnail or "",
                "source": req.source or "youtube",
                "skill_query": req.skill_query or "",
                "completed": False,
                "videos": []
            }
            if not any(p.get("id") == req.playlist_id or p.get("playlist_id") == req.playlist_id for p in existing_lp):
                existing_lp.append(pl_entry)
                lp_row = {
                    "session_id": user_id,
                    "skill_name": "saved_playlists",
                    "completed_steps": existing_lp,
                }
                if _is_uuid(user_id):
                    lp_row["user_id"] = user_id
                sb.table("learning_progress").upsert(lp_row, on_conflict="session_id, skill_name").execute()
        except Exception as jsonb_sync_err:
            logger.warning(f"Error syncing saved playlist to learning_progress: {jsonb_sync_err}")

        # Log event to user_feedback analytics
        try:
            sb.table("user_feedback").insert({
                "user_id": user_id,
                "action": "save",
                "resource_url": req.playlist_url or f"https://www.youtube.com/playlist?list={req.playlist_id}",
                "metadata": {"playlist_id": req.playlist_id, "title": req.title}
            }).execute()
        except Exception:
            pass

        return {"success": True, "data": res_data}
    except Exception as e:
        logger.error(f"Error saving playlist: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/save/{playlist_id}")
async def unsave_playlist(
    playlist_id: str,
    user_id: str = Depends(get_session_or_user_id)
):
    sb = get_supabase()
    if not sb:
        raise HTTPException(status_code=500, detail="Supabase not configured")
    try:
        clean_pid = _extract_playlist_id(playlist_id, playlist_id)
        if _is_uuid(user_id):
            sb.table("saved_playlists").delete().eq("user_id", user_id).in_("playlist_id", [playlist_id, clean_pid]).execute()

        # Also remove from learning_progress JSONB
        try:
            res_lp = sb.table("learning_progress").select("completed_steps").eq("session_id", user_id).eq("skill_name", "saved_playlists").limit(1).execute()
            if res_lp.data and len(res_lp.data) > 0:
                existing_lp = res_lp.data[0].get("completed_steps", [])
                filtered = [p for p in existing_lp if p.get("id") != playlist_id and p.get("id") != clean_pid and p.get("playlist_id") != playlist_id and p.get("playlist_id") != clean_pid]
                lp_row = {
                    "session_id": user_id,
                    "skill_name": "saved_playlists",
                    "completed_steps": filtered,
                }
                if _is_uuid(user_id):
                    lp_row["user_id"] = user_id
                sb.table("learning_progress").upsert(lp_row, on_conflict="session_id, skill_name").execute()
        except Exception as jsonb_err:
            logger.warning(f"Error removing playlist from learning_progress: {jsonb_err}")

        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/saved")
async def get_saved_playlists(user_id: str = Depends(get_session_or_user_id)):
    sb = get_supabase()
    if not sb:
        return {"saved": [], "count": 0}
    try:
        remapped = []
        seen_ids = set()

        # 1. Query relational saved_playlists table
        try:
            if _is_uuid(user_id):
                result = (
                    sb.table("saved_playlists")
                    .select("*")
                    .eq("user_id", user_id)
                    .order("created_at", desc=True)
                    .execute()
                )
                for row in (result.data or []):
                    pid = row.get("playlist_id", row.get("id", ""))
                    if pid and pid not in seen_ids:
                        seen_ids.add(pid)
                        remapped.append({
                            "id":           pid,
                            "title":        row.get("title", ""),
                            "channel":      row.get("channel", ""),
                            "description":  row.get("description", ""),
                            "level":        row.get("level", ""),
                            "video_count":  row.get("video_count", "?"),
                            "duration":     row.get("duration", "?"),
                            "playlist_url": row.get("playlist_url", ""),
                            "thumbnail":    row.get("thumbnail", ""),
                            "source":       row.get("source", "youtube"),
                            "skill_query":  row.get("skill_query", ""),
                            "created_at":   row.get("created_at", ""),
                        })
        except Exception as err:
            logger.warning(f"Error querying saved_playlists table in /saved: {err}")

        # 2. Query JSONB learning_progress table (supports session_id & guest users)
        try:
            res_lp = (
                sb.table("learning_progress")
                .select("completed_steps")
                .eq("session_id", user_id)
                .eq("skill_name", "saved_playlists")
                .limit(1)
                .execute()
            )
            if res_lp.data and len(res_lp.data) > 0:
                jsonb_items = res_lp.data[0].get("completed_steps", [])
                for item in jsonb_items:
                    item_id = item.get("id") or item.get("playlist_id")
                    if item_id and item_id not in seen_ids:
                        seen_ids.add(item_id)
                        remapped.append({
                            "id":           item_id,
                            "title":        item.get("title", "Untitled Playlist"),
                            "channel":      item.get("channel", ""),
                            "description":  item.get("description", ""),
                            "level":        item.get("level", "all"),
                            "video_count":  item.get("video_count", "?"),
                            "duration":     item.get("duration", "?"),
                            "playlist_url": item.get("playlist_url", ""),
                            "thumbnail":    item.get("thumbnail", ""),
                            "source":       item.get("source", "youtube"),
                            "skill_query":  item.get("skill_query", ""),
                            "created_at":   item.get("created_at", ""),
                        })
        except Exception as jsonb_fetch_err:
            logger.warning(f"Error fetching JSONB playlists in /saved: {jsonb_fetch_err}")

        return {"saved": remapped, "count": len(remapped)}
    except Exception as e:
        logger.error(f"Error fetching saved playlists: {e}")
        return {"saved": [], "count": 0}



@router.post("/sync-saved-playlists")
async def sync_saved_playlists(
    req: SyncSavedPlaylistsRequest,
    current_user_id: str = Depends(get_session_or_user_id)
):
    """
    JSONB storage endpoint for saved playlists. Calculates total completion %
    and upserts into Supabase `learning_progress` keyed by (session_id, skill_name="saved_playlists").
    """
    sb = get_supabase()
    playlists_list = req.playlists
    total_videos = sum(len(p.get("videos", [])) for p in playlists_list)
    completed_videos = sum(len([v for v in p.get("videos", []) if v.get("completed") or v.get("watched")]) for p in playlists_list)
    pct = round((completed_videos / total_videos) * 100.0, 2) if total_videos > 0 else 0.0

    if sb:
        try:
            lp_row = {
                "session_id": current_user_id,
                "skill_name": "saved_playlists",
                "completed_steps": playlists_list,
                "completion_pct": pct
            }
            if _is_uuid(current_user_id):
                lp_row["user_id"] = current_user_id
            sb.table("learning_progress").upsert(lp_row, on_conflict="session_id, skill_name").execute()

            # Record event in user_feedback analytics table
            try:
                sb.table("user_feedback").insert({
                    "user_id": current_user_id,
                    "action": "save",
                    "metadata": {"count": len(playlists_list), "completion_pct": pct}
                }).execute()
            except Exception:
                pass
        except Exception as e:
            logger.error(f"Error upserting learning_progress JSONB: {e}")
    return {"success": True, "count": len(playlists_list), "completion_pct": pct}


@router.get("/get-saved-playlists")
async def get_saved_playlists_jsonb(current_user_id: str = Depends(get_session_or_user_id)):
    """
    Retrieves candidate saved playlists directly from JSONB `learning_progress`.
    """
    sb = get_supabase()
    if not sb:
        return {"success": True, "playlists": [], "completion_pct": 0.0}
    try:
        res = (
            sb.table("learning_progress")
            .select("completed_steps, completion_pct")
            .eq("session_id", current_user_id)
            .eq("skill_name", "saved_playlists")
            .limit(1)
            .execute()
        )
        if res.data and len(res.data) > 0:
            playlists = res.data[0].get("completed_steps", [])
            pct = res.data[0].get("completion_pct", 0.0)
            return {"success": True, "playlists": playlists, "completion_pct": pct}
    except Exception as e:
        logger.error(f"Error reading learning_progress JSONB: {e}")
    return {"success": True, "playlists": [], "completion_pct": 0.0}


@router.get("/resume-progress/{video_id}")
async def resume_progress(
    video_id: str,
    current_user_id: str = Depends(get_session_or_user_id)
):
    """
    Fetches stored playback resume position and completed state for a video.
    """
    sb = get_supabase()
    if not sb or not _is_uuid(current_user_id):
        return {"last_position": 0.0, "completed": False}
    try:
        res = (
            sb.table("video_progress")
            .select("last_position, watched")
            .eq("user_id", current_user_id)
            .eq("video_id", video_id)
            .limit(1)
            .execute()
        )
        if res.data and len(res.data) > 0:
            return {
                "last_position": res.data[0].get("last_position", 0.0),
                "completed": res.data[0].get("watched", False)
            }
    except Exception as e:
        logger.error(f"Error fetching resume progress: {e}")
    return {"last_position": 0.0, "completed": False}



def _generate_fallback_playlist_videos(clean_pid: str) -> list[dict]:
    topics = [
        "Introduction & Environment Setup",
        "Variables, Constants & Data Types",
        "Control Flow, Conditionals & Loops",
        "Functions, Scope & Parameters",
        "Core Data Structures & Collections",
        "Object-Oriented Programming Principles",
        "Modules, Packages & Dependencies",
        "Error Handling & Debugging Techniques",
        "Real-World Hands-On Capstone Implementation",
        "Final Review, Testing & Next Steps"
    ]
    videos = []
    for idx, topic in enumerate(topics):
        videos.append({
            "videoId": f"v_{clean_pid[:8]}_{idx+1}",
            "title": f"Lesson {idx+1}: {topic}",
            "position": idx,
            "thumbnail": "https://img.youtube.com/vi/rfscVS0vtbw/mqdefault.jpg",
            "watched": False,
            "last_position": 0.0,
            "watch_time": 0,
            "completed_at": None,
        })
    return videos


# ── Video List ────────────────────────────────────────────────────────────────
@router.get("/playlist-videos")
async def get_playlist_videos(
    playlist_id: str = Query(..., description="YouTube playlist list= ID"),
    user_id:     str = Depends(get_session_or_user_id),
):
    """Fetch playlist videos from YouTube API + merge progress/resume data from Supabase."""
    clean_playlist_id = _extract_playlist_id(playlist_id, playlist_id)
    videos = []
    page_token = None

    if YOUTUBE_API_KEY:
        async with httpx.AsyncClient(timeout=20) as client:
            max_pages = 20
            page_count = 0
            while page_count < max_pages:
                page_count += 1
                params: dict = {
                    "part":       "snippet",
                    "playlistId": clean_playlist_id,
                    "maxResults": 50,
                    "key":        YOUTUBE_API_KEY,
                }
                if page_token:
                    params["pageToken"] = page_token
                try:
                    r = await client.get(
                        "https://www.googleapis.com/youtube/v3/playlistItems", params=params
                    )
                    data = r.json()
                    if not r.is_success:
                        print(f"YouTube playlist items error: {data}")
                        break
                except Exception as e:
                    print(f"YouTube playlist fetch error: {e}")
                    break

                for item in data.get("items", []):
                    snippet = item.get("snippet", {})
                    vid = snippet.get("resourceId", {}).get("videoId", "")
                    if not vid:
                        continue
                    v_title = snippet.get("title", "Untitled")
                    v_desc = snippet.get("description", "")
                    # Filter private / deleted videos
                    if v_title in ("Private video", "Deleted video"):
                        continue
                    # Filter any adult, romance, song, or prohibited videos inside playlists
                    if _STRICT_PROHIBITED_TERMS.search(f"{v_title} {v_desc}"):
                        logger.info(f"Filtered out non-educational video in playlist: '{v_title}'")
                        continue

                    thumbnail = (
                        snippet.get("thumbnails", {}).get("medium", {}).get("url")
                        or f"https://img.youtube.com/vi/{vid}/mqdefault.jpg"
                    )
                    videos.append({
                        "videoId":       vid,
                        "title":         v_title,
                        "position":      snippet.get("position", len(videos)),
                        "thumbnail":     thumbnail,
                        "watched":       False,
                        "last_position": 0.0,     # resume timestamp
                        "watch_time":    0,        # seconds watched (anti-cheat)
                        "completed_at":  None,
                    })

                page_token = data.get("nextPageToken")
                if not page_token:
                    break

    # Fallback to structured lesson topic generator if no videos returned
    if not videos:
        videos = _generate_fallback_playlist_videos(clean_playlist_id)

    # Merge progress data from Supabase & sync accurate video_count
    sb = get_supabase()
    if sb and videos and user_id:
        if _is_uuid(user_id):
            try:
                sb.table("saved_playlists").update({"video_count": str(len(videos))}).eq("playlist_id", clean_playlist_id).eq("user_id", user_id).execute()
            except Exception:
                pass

            try:
                res = (
                    sb.table("video_progress")
                    .select("video_id,watched,last_position,watch_time,completed_at")
                    .eq("user_id", user_id)
                    .eq("playlist_id", clean_playlist_id)
                    .execute()
                )
                prog_map = {r["video_id"]: r for r in (res.data or [])}
                for v in videos:
                    prog = prog_map.get(v["videoId"])
                    if prog:
                        v["watched"]       = prog.get("watched", False)
                        v["last_position"] = prog.get("last_position") or 0.0
                        v["watch_time"]    = prog.get("watch_time") or 0
                        v["completed_at"]  = prog.get("completed_at")
            except Exception as e:
                print(f"Video progress merge error: {e}")

        # Also merge video watch status from learning_progress JSONB table (session_id & guests)
        try:
            res_lp = sb.table("learning_progress").select("completed_steps").eq("session_id", user_id).eq("skill_name", "saved_playlists").limit(1).execute()
            if res_lp.data and len(res_lp.data) > 0:
                steps = res_lp.data[0].get("completed_steps", [])
                match_pl = next((p for p in steps if (p.get("id") == clean_playlist_id or p.get("playlist_id") == clean_playlist_id or p.get("id") == playlist_id)), None)
                if match_pl and match_pl.get("videos"):
                    lp_prog_map = { (v.get("videoId") or v.get("id")): v for v in match_pl.get("videos") }
                    for v in videos:
                        lp_v = lp_prog_map.get(v["videoId"])
                        if lp_v:
                            v["watched"] = v["watched"] or bool(lp_v.get("watched") or lp_v.get("completed"))
        except Exception as lp_err:
            logger.warning(f"Error merging JSONB progress in get_playlist_videos: {lp_err}")

    return {"videos": videos, "count": len(videos)}


# ── Video Progress Endpoints ──────────────────────────────────────────────────
@router.post("/video-progress")
async def update_video_progress(
    req: VideoProgressRequest,
    current_user_id: str = Depends(get_session_or_user_id)
):
    """Manual mark-as-watched/unwatched. Optionally saves position & watch_time."""
    user_id = current_user_id
    if not user_id:
        return {"success": True}
    sb = get_supabase()
    if not sb:
        raise HTTPException(status_code=500, detail="Supabase not configured")
    try:
        clean_playlist_id = _extract_playlist_id(req.playlist_id, req.playlist_id)
        if _is_uuid(user_id):
            data: dict = {
                "user_id":     user_id,
                "playlist_id": clean_playlist_id,
                "video_id":    req.video_id,
                "watched":     req.watched,
            }
            if req.watched:
                data["completed_at"] = datetime.now(timezone.utc).isoformat()
            else:
                data["completed_at"] = None

            if req.last_position is not None:
                data["last_position"] = req.last_position
            if req.watch_time is not None:
                data["watch_time"] = req.watch_time

            sb.table("video_progress").upsert(
                data, on_conflict="user_id,playlist_id,video_id"
            ).execute()
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/save-progress")
async def save_video_progress(
    req: SaveProgressRequest,
    current_user_id: str = Depends(get_session_or_user_id)
):
    """
    Periodic resume save (every 10 s) — updates last_position & watch_time
    WITHOUT touching the `watched` flag (prevents anti-cheat bypass).
    """
    user_id = current_user_id
    if not user_id or not _is_uuid(user_id):
        return {"success": True}
    sb = get_supabase()
    if not sb:
        return {"success": False, "reason": "Supabase not configured"}
    try:
        clean_playlist_id = _extract_playlist_id(req.playlist_id, req.playlist_id)
        res = (
            sb.table("video_progress")
            .update({"last_position": req.last_position, "watch_time": req.watch_time})
            .eq("user_id", user_id)
            .eq("playlist_id", clean_playlist_id)
            .eq("video_id", req.video_id)
            .execute()
        )
        if not res.data:
            sb.table("video_progress").insert({
                "user_id":       user_id,
                "playlist_id":   clean_playlist_id,
                "video_id":      req.video_id,
                "watched":       False,
                "last_position": req.last_position,
                "watch_time":    req.watch_time,
            }).execute()
        return {"success": True}
    except Exception as e:
        print(f"save-progress error: {e}")
        return {"success": False}


@router.post("/complete-video")
@router.post("/mark-video-complete")
async def complete_video(
    req: CompleteVideoRequest,
    current_user_id: str = Depends(get_session_or_user_id)
):
    """
    Auto-completion endpoint. Called when ≥75% of a video is genuinely watched.
    Updates relational `video_progress`, syncs JSONB `learning_progress`, and logs event in `user_feedback`.
    """
    user_id = current_user_id
    if not user_id:
        return {"success": True, "playlist_stats": {"completed_videos": 0}}
    sb = get_supabase()
    if not sb:
        raise HTTPException(status_code=500, detail="Supabase not configured")

    if req.watch_time < 0:
        raise HTTPException(status_code=400, detail="Invalid watch_time: must be >= 0 seconds")

    try:
        clean_playlist_id = _extract_playlist_id(req.playlist_id, req.playlist_id)
        now = datetime.now(timezone.utc).isoformat()

        # 1. Upsert completion record in video_progress if UUID user
        if _is_uuid(user_id):
            complete_data: dict = {
                "user_id":       user_id,
                "playlist_id":   clean_playlist_id,
                "video_id":      req.video_id,
                "watched":       req.completed,
                "watch_time":    req.watch_time,
                "completed_at":  now if req.completed else None,
            }
            if req.last_position:
                complete_data["last_position"] = req.last_position

            try:
                sb.table("video_progress").upsert(
                    complete_data, on_conflict="user_id,playlist_id,video_id"
                ).execute()
            except Exception as err:
                logger.warning(f"Error upserting video_progress: {err}")

        # 2. Sync JSONB completed_steps in learning_progress
        try:
            lp_res = (
                sb.table("learning_progress")
                .select("completed_steps")
                .eq("session_id", user_id)
                .eq("skill_name", "saved_playlists")
                .limit(1)
                .execute()
            )
            if lp_res.data and len(lp_res.data) > 0:
                playlists = lp_res.data[0].get("completed_steps", [])
                updated = False
                for p in playlists:
                    p_id = p.get("id") or p.get("playlist_id")
                    if p_id == clean_playlist_id or p_id == req.playlist_id:
                        for v in p.get("videos", []):
                            if v.get("videoId") == req.video_id:
                                v["completed"] = req.completed
                                v["completedAt"] = now if req.completed else None
                                if req.last_position:
                                    v["lastPosition"] = req.last_position
                                updated = True
                                break
                if updated:
                    total_v = sum(len(p.get("videos", [])) for p in playlists)
                    comp_v = sum(len([v for v in p.get("videos", []) if v.get("completed")]) for p in playlists)
                    pct = round((comp_v / total_v) * 100.0, 2) if total_v > 0 else 0.0
                    lp_upd = {
                        "session_id": user_id,
                        "skill_name": "saved_playlists",
                        "completed_steps": playlists,
                        "completion_pct": pct
                    }
                    if _is_uuid(user_id):
                        lp_upd["user_id"] = user_id
                    sb.table("learning_progress").upsert(lp_upd, on_conflict="session_id, skill_name").execute()
        except Exception as jsonb_err:
            logger.warning(f"Error updating learning_progress JSONB: {jsonb_err}")

        # 3. Log event into user_feedback
        try:
            sb.table("user_feedback").insert({
                "user_id": user_id,
                "action": "complete" if req.completed else "uncomplete",
                "resource_url": f"https://www.youtube.com/watch?v={req.video_id}",
                "metadata": {"playlist_id": clean_playlist_id, "video_id": req.video_id}
            }).execute()
        except Exception:
            pass

        return {
            "success":      True,
            "completed_at": now,
            "playlist_stats": {
                "completed_videos": 1 if req.completed else 0,
            },
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class MarkAllWatchedRequest(BaseModel):
    playlist_id: str
    watched: bool = True


@router.post("/mark-all-watched")
async def mark_all_watched(
    req: MarkAllWatchedRequest,
    current_user_id: str = Depends(get_session_or_user_id)
):
    """Mark all videos in a playlist as watched or unwatched in 1 click."""
    user_id = current_user_id
    if not user_id:
        return {"success": True, "count": 0}
    sb = get_supabase()
    if not sb:
        raise HTTPException(status_code=500, detail="Supabase not configured")

    clean_playlist_id = _extract_playlist_id(req.playlist_id, req.playlist_id)

    videos_res = await get_playlist_videos(playlist_id=clean_playlist_id, user_id=user_id)
    videos = videos_res.get("videos", [])

    if not videos:
        return {"success": True, "count": 0}

    now = datetime.now(timezone.utc).isoformat()
    rows = []
    for v in videos:
        rows.append({
            "user_id": user_id,
            "playlist_id": clean_playlist_id,
            "video_id": v["videoId"],
            "watched": req.watched,
            "completed_at": now if req.watched else None,
            "updated_at": now,
        })

    try:
        sb.table("video_progress").upsert(
            rows, on_conflict="user_id,playlist_id,video_id"
        ).execute()
        return {"success": True, "count": len(rows)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Tier 3: Groq AI LLM Roadmap Generation ──────────────────────────────────────
class RoadmapRequest(BaseModel):
    skill: str
    # user_id intentionally excluded — roadmap generation is not user-specific


@router.post("/roadmap")
async def generate_skill_roadmap(req: RoadmapRequest):
    """
    Tier 3 Resolution: Generate a 5-tier structured skill roadmap via Groq AI (Llama-3.3 70B).
    Tiers:
    1. Primary Foundation
    2. Fast Track Acceleration
    3. Interview Preparation
    4. Applied Capstone Project
    5. Advanced Architecture
    """
    skill = req.skill.strip()
    if not skill:
        raise HTTPException(status_code=400, detail="Skill prompt cannot be empty")

    is_valid, err_msg = _validate_skill_query(skill)
    if not is_valid:
        raise HTTPException(
            status_code=400,
            detail={"error": "not_skill", "message": err_msg}
        )

    prompt = f"""
Generate a structured 5-tier learning & career roadmap for the topic/skill: "{skill}".

Respond ONLY with valid JSON in this exact structure:
{{
  "title": "{skill} Career Roadmap",
  "tiers": [
    {{
      "tier": 1,
      "name": "Primary Foundation",
      "description": "Core concepts and fundamental syntax/principles.",
      "nodes": ["Concept 1", "Concept 2", "Concept 3"]
    }},
    {{
      "tier": 2,
      "name": "Fast Track Acceleration",
      "description": "Intermediate techniques, libraries, and practical implementation.",
      "nodes": ["Topic 1", "Topic 2", "Topic 3"]
    }},
    {{
      "tier": 3,
      "name": "Interview Preparation",
      "description": "Common interview questions, problem solving, and system design patterns.",
      "nodes": ["Pattern 1", "Pattern 2", "Pattern 3"]
    }},
    {{
      "tier": 4,
      "name": "Applied Capstone Project",
      "description": "Real-world portfolio projects and production deployments.",
      "nodes": ["Project 1", "Project 2"]
    }},
    {{
      "tier": 5,
      "name": "Advanced Architecture",
      "description": "Deep performance optimization, internal mechanics, and enterprise architecture.",
      "nodes": ["Advanced 1", "Advanced 2"]
    }}
  ]
}}
"""
    sys_prompt = "You are SkillsCatalyst AI, an expert tech curriculum generator. Output JSON ONLY, no markdown ticks or extra text."

    try:
        from backend.services.groq_service import chat_with_groq
        raw_reply = chat_with_groq(prompt, system_prompt=sys_prompt)

        clean_json = raw_reply.strip()
        if clean_json.startswith("```"):
            lines = clean_json.split("\n")
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].startswith("```"):
                lines = lines[:-1]
            clean_json = "\n".join(lines).strip()

        import json
        data = json.loads(clean_json)
        return {"success": True, "roadmap": data}
    except Exception as e:
        print(f"Roadmap generation fallback: {e}")
        return {
            "success": True,
            "roadmap": {
                "title": f"{skill} Learning Path",
                "tiers": [
                    {"tier": 1, "name": "Primary Foundation", "description": "Core concepts and fundamentals.", "nodes": [f"{skill} Basics", "Environment Setup", "Core Syntax"]},
                    {"tier": 2, "name": "Fast Track Acceleration", "description": "Practical implementation.", "nodes": ["Data Handling", "Modular Design", "Best Practices"]},
                    {"tier": 3, "name": "Interview Preparation", "description": "Interview problem solving.", "nodes": ["Coding Challenges", "System Patterns", "Mock Questions"]},
                    {"tier": 4, "name": "Applied Capstone Project", "description": "Portfolio projects.", "nodes": ["End-to-End App", "API Integration", "Deployment"]},
                    {"tier": 5, "name": "Advanced Architecture", "description": "Performance & scaling.", "nodes": ["Optimization", "Security", "Scalability"]}
                ]
            }
        }
