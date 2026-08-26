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

# Subdirectory shortcuts
_DS_DIR  = os.path.join(DATA_DIR, "youtube data", "data structure")
_LANG_DIR = os.path.join(DATA_DIR, "youtube data", "programming languge")
_WEB_DIR  = os.path.join(DATA_DIR, "youtube data", "web development")


def _csv_abs(subdir: str, filename: str) -> str:
    """Return the absolute path for a CSV file inside a given subdirectory."""
    return os.path.join(subdir, filename)

STOP_WORDS = {
    "in", "for", "the", "a", "an", "and", "or", "to", "of", "with",
    "by", "on", "at", "from", "is", "all", "complete", "course",
    "tutorial", "tutorials", "playlist", "video", "videos"
}

# TECH_CONFIG: maps tech keys to (subdir, filename) tuples + competing-tech regexes
# Each "files" / "dsa_files" value is a list of (subdir, filename) tuples.
TECH_CONFIG = {
    "java": {
        "files":     [(_LANG_DIR, "java.csv")],
        "dsa_files": [(_DS_DIR,   "dsa_in_java.csv")],
        "competing": [
            r"\bpython\b",
            r"(?<![a-zA-Z0-9])c\+\+(?![a-zA-Z0-9])",
            r"\bcpp\b",
            r"(?<![a-zA-Z0-9\+])c programming\b",
            r"(?<![a-zA-Z0-9\+])c language\b",
            r"(?<![a-zA-Z0-9\+#])\bc\b(?![\+#a-zA-Z0-9])",
        ],
    },
    "python": {
        "files":     [(_LANG_DIR, "python.csv")],
        "dsa_files": [(_DS_DIR,   "dsa_in_python__1_.csv")],
        "competing": [
            r"\bjava\b",
            r"(?<![a-zA-Z0-9])c\+\+(?![a-zA-Z0-9])",
            r"\bcpp\b",
            r"(?<![a-zA-Z0-9\+])c programming\b",
            r"(?<![a-zA-Z0-9\+])c language\b",
            r"(?<![a-zA-Z0-9\+#])\bc\b(?![\+#a-zA-Z0-9])",
        ],
    },
    "cpp": {
        "files":     [(_LANG_DIR, "c++.csv")],
        "dsa_files": [(_DS_DIR,   "dsa_in_cpp.csv")],
        "competing": [
            r"\bjava\b",
            r"\bpython\b",
            r"(?<![a-zA-Z0-9\+])c programming\b",
            r"(?<![a-zA-Z0-9\+])c language\b",
        ],
    },
    "c": {
        "files":     [(_DS_DIR, "c_datastructures_tutorials.csv"), (_LANG_DIR, "C.csv")],
        "dsa_files": [(_DS_DIR, "c_datastructures_tutorials.csv")],
        "competing": [
            r"\bjava\b",
            r"\bpython\b",
            r"(?<![a-zA-Z0-9])c\+\+(?![a-zA-Z0-9])",
            r"\bcpp\b",
        ],
    },
    # ── Web development topics ────────────────────────────────────────────────
    "html": {
        "files":     [(_WEB_DIR, "html.csv")],
        "dsa_files": [],
        "competing": [],
    },
    "css": {
        "files":     [(_WEB_DIR, "css.csv")],
        "dsa_files": [],
        "competing": [],
    },
    "javascript": {
        "files":     [(_WEB_DIR, "js.csv")],
        "dsa_files": [],
        "competing": [],
    },
    "nodejs": {
        "files":     [(_WEB_DIR, "nodejs.csv")],
        "dsa_files": [],
        "competing": [],
    },
    "react": {
        "files":     [(_WEB_DIR, "react.csv")],
        "dsa_files": [],
        "competing": [],
    },
    "sql": {
        "files":     [(_WEB_DIR, "sql.csv")],
        "dsa_files": [],
        "competing": [],
    },
}

# ── CSV keyword → file mapping ────────────────────────────────────────────────
# STRICT RULE:
#   Language keywords  (java/python/cpp/c++) → tutorials CSVs ONLY
#   DSA keywords (dsa/ds/data structures)    → dsa_ CSVs ONLY
#   They must NEVER be mixed.
# Each value is a list of (subdir, filename) tuples.
CSV_TOPIC_MAP = {
    # ── Language tutorials (no DSA) ──────────────────────────────────────────
    "python":            [(_LANG_DIR, "python.csv")],
    "java":              [(_LANG_DIR, "java.csv")],
    "cpp":               [(_LANG_DIR, "c++.csv")],
    "c++":               [(_LANG_DIR, "c++.csv")],
    # "c" alone: word-boundary matched in search loop (len <= 2 path)
    "c":                 [(_DS_DIR, "c_datastructures_tutorials.csv"), (_LANG_DIR, "C.csv")],

    # ── DSA / Data Structures (no language tutorials) ────────────────────────
    "dsa":               [(_DS_DIR, "dsa_in_java.csv"), (_DS_DIR, "dsa_in_cpp.csv"), (_DS_DIR, "dsa_in_python__1_.csv")],
    "data structure":    [(_DS_DIR, "dsa_in_java.csv"), (_DS_DIR, "dsa_in_cpp.csv"), (_DS_DIR, "dsa_in_python__1_.csv")],
    "data structures":   [(_DS_DIR, "dsa_in_java.csv"), (_DS_DIR, "dsa_in_cpp.csv"), (_DS_DIR, "dsa_in_python__1_.csv")],
    "algorithm":         [(_DS_DIR, "dsa_in_java.csv"), (_DS_DIR, "dsa_in_cpp.csv"), (_DS_DIR, "dsa_in_python__1_.csv")],
    "algorithms":        [(_DS_DIR, "dsa_in_java.csv"), (_DS_DIR, "dsa_in_cpp.csv"), (_DS_DIR, "dsa_in_python__1_.csv")],

    # ── Language-specific DSA ────────────────────────────────────────────────
    "dsa java":          [(_DS_DIR, "dsa_in_java.csv")],
    "dsa python":        [(_DS_DIR, "dsa_in_python__1_.csv")],
    "dsa cpp":           [(_DS_DIR, "dsa_in_cpp.csv")],
    "dsa c":             [(_DS_DIR, "c_datastructures_tutorials.csv")],
    "ds java":           [(_DS_DIR, "dsa_in_java.csv")],
    "ds python":         [(_DS_DIR, "dsa_in_python__1_.csv")],
    "ds cpp":            [(_DS_DIR, "dsa_in_cpp.csv")],
    "ds c":              [(_DS_DIR, "c_datastructures_tutorials.csv")],
    "data structures c": [(_DS_DIR, "c_datastructures_tutorials.csv")],

    # ── Web Development ──────────────────────────────────────────────────────
    "html":              [(_WEB_DIR, "html.csv")],
    "css":               [(_WEB_DIR, "css.csv")],
    "javascript":        [(_WEB_DIR, "js.csv")],
    "js":                [(_WEB_DIR, "js.csv")],
    "node":              [(_WEB_DIR, "nodejs.csv")],
    "nodejs":            [(_WEB_DIR, "nodejs.csv")],
    "node.js":           [(_WEB_DIR, "nodejs.csv")],
    "react":             [(_WEB_DIR, "react.csv")],
    "reactjs":           [(_WEB_DIR, "react.csv")],
    "sql":               [(_WEB_DIR, "sql.csv")],
    "mysql":             [(_WEB_DIR, "sql.csv")],
    "postgresql":        [(_WEB_DIR, "sql.csv")],
}




LEVEL_MAP = {
    "beginner":     ["Beginner", "Beginner-Intermediate", "Beginner-Advanced", "Beginner to Intermediate", "Beginner to Advanced"],
    "intermediate": ["Intermediate", "Intermediate-Advanced", "Beginner-Intermediate", "Beginner to Intermediate", "Intermediate to Advanced", "Beginner-Advanced", "Beginner to Advanced"],
    "advanced":     ["Advanced", "Intermediate-Advanced", "Beginner-Advanced", "Intermediate to Advanced", "Beginner to Advanced"],
    "all":          None,
}


# Queries that contain these patterns should skip CSV lookup entirely and go to YouTube API.
# This covers frameworks/tools that don't have a dedicated CSV file.
# NOTE: use .? between words to match both spaced ('fast api') and unspaced ('fastapi') variants.
# YouTube-ONLY patterns: queries that have NO local CSV and must always hit the YouTube API.
# NOTE: html, css, javascript, sql, node.js, react are now served by local CSVs;
#       they have been removed from this list.
_YOUTUBE_ONLY_PATTERNS = re.compile(
    r"\bspring.?boot\b|\bspring\b|\bhibernate\b|\bmicroservice\b|\bmicroservices\b"
    r"|\bdjango\b|\bflask\b|fast.?api|\bexpress\b|\bexpress.?js\b"
    r"|nest.?js"
    r"|\bkubernetes\b|\bdocker\b|\bdevops\b|\bansible\b|\bterraform\b"
    r"|\bangular\b|\bvue\b|\bsvelte\b|next.?js"
    r"|machine.?learning|deep.?learning|\bpytorch\b|\btensorflow\b|\bscikit\b"
    r"|\bgolang\b|\bgo.?lang\b|\brust\b|\bkotlin\b|\bswift\b"
    r"|\bflutter\b|\bdart\b|\bphp\b|\bruby\b|\bscala\b|\bperl\b"
    r"|\bcybersecurity\b|ethical.?hacking|\bpentesting\b"
    r"|\baws\b|\bazure\b|\bgcp\b|\bcloud\b"
    r"|system.?design|\bmongodb\b|\bpostgres\b|\bredis\b"
    r"|\bgit\b|\bgithub\b|\blinux\b|\bbash\b|\bshell\b"
    r"|\bblockchain\b|\bweb3\b|\bgraphql\b|\brest.?api\b|\bapi\b"
    r"|\btypescript\b"
    r"|\bopencv\b|\bcomputer.?vision\b|\bnlp\b|\bllm\b",
    re.IGNORECASE,
)


def _detect_primary_tech(query: str) -> Optional[str]:
    """Detects explicit programming language / tech domain from query.
    Returns None for any query that should go to YouTube (no CSV exists).
    Only returns a tech key when a dedicated curated CSV file is available.
    """
    q = query.lower()

    # Queries with no local CSV → use YouTube API
    if _YOUTUBE_ONLY_PATTERNS.search(q):
        return None

    # ── Web development topics (served by local CSVs) ────────────────────────
    if re.search(r"\bnode\.?js\b|\bnodejs\b", q):
        return "nodejs"
    if re.search(r"\breact\.?js\b|\breactjs\b|\breact\b", q):
        return "react"
    if re.search(r"\bhtml\b", q):
        return "html"
    if re.search(r"\bcss\b", q):
        return "css"
    if re.search(r"\bjavascript\b|\bjs\b", q):
        return "javascript"
    if re.search(r"\bsql\b|\bmysql\b|\bpostgresql\b", q):
        return "sql"

    # ── Programming languages ─────────────────────────────────────────────────
    if re.search(r"\bjava\b", q):
        return "java"
    if re.search(r"\bpython\b|\bpy\b", q):
        return "python"
    if re.search(r"(?<![a-zA-Z0-9])c\+\+(?![a-zA-Z0-9])|\bcpp\b", q):
        return "cpp"
    # C language: must be explicit — "c", "c programming", "c language"
    if re.search(
        r"(?<![a-zA-Z0-9\+#])c programming\b"
        r"|(?<![a-zA-Z0-9\+#])c language\b"
        r"|(?<![a-zA-Z0-9\+#])\bc\b(?![\+#a-zA-Z0-9])",
        q
    ):
        return "c"
    return None


def _extract_youtube_ids(url: str, fallback: str = "") -> dict:
    """Extract playlist_id and video_id from any YouTube URL format or raw ID."""
    if not url:
        return {"playlist_id": None, "video_id": None, "id": fallback, "is_playlist": False}

    clean = str(url).strip()
    playlist_id = None
    video_id = None

    # 1. Extract playlist ID from URL query param
    if "list=" in clean:
        try:
            playlist_id = clean.split("list=")[1].split("&")[0].split("#")[0].strip()
        except Exception:
            playlist_id = None

    # 2. Extract video ID from URL
    if "watch?v=" in clean:
        try:
            video_id = clean.split("watch?v=")[1].split("&")[0].split("#")[0].strip()
        except Exception:
            video_id = None
    elif "youtu.be/" in clean:
        try:
            video_id = clean.split("youtu.be/")[1].split("?")[0].split("#")[0].strip()
        except Exception:
            video_id = None
    elif "/embed/" in clean:
        try:
            video_id = clean.split("/embed/")[1].split("?")[0].split("#")[0].strip()
        except Exception:
            video_id = None

    # 3. Handle raw IDs without full URL
    if not playlist_id and not video_id:
        if clean.startswith(("PL", "UU", "FL", "RD", "OLAK5uy_")) or (len(clean) >= 16 and not clean.startswith("http")):
            playlist_id = clean
        elif len(clean) == 11 and re.match(r"^[a-zA-Z0-9_-]{11}$", clean):
            video_id = clean

    if playlist_id:
        return {
            "playlist_id": playlist_id,
            "video_id": video_id,
            "id": playlist_id,
            "is_playlist": True,
        }
    elif video_id:
        return {
            "playlist_id": None,
            "video_id": video_id,
            "id": video_id,
            "is_playlist": False,
        }
    return {
        "playlist_id": None,
        "video_id": None,
        "id": fallback or clean,
        "is_playlist": False,
    }


def _extract_playlist_id(url: str, fallback: str = "") -> str:
    ids = _extract_youtube_ids(url, fallback)
    return ids["id"]


# ── Column name aliases ───────────────────────────────────────────────────────
_TITLE_KEYS    = ("playlist_title", "title")
_CHANNEL_KEYS  = ("channel_name", "channel")
_VIDEOS_KEYS   = ("video_count", "videos")
_DURATION_KEYS = ("duration_hours", "duration")
_URL_KEYS      = ("playlist_url", "content_url")
_CH_URL_KEYS   = ("channel_url",)
_LANG_KEYS     = ("language",)


def _first(row: dict, keys: tuple) -> str:
    """Return the first non-empty value from a dict using a sequence of key candidates."""
    for k in keys:
        v = row.get(k, "").strip()
        if v:
            return v
    return ""


def _parse_csv(abs_path: str) -> list[dict]:
    """Parse any of the CSV files into a normalised list of playlist dicts with language support."""
    if not os.path.exists(abs_path):
        logger.warning(f"CSV not found: {abs_path}")
        return []

    results = []
    clean_fname = os.path.splitext(os.path.basename(abs_path))[0]

    try:
        with open(abs_path, newline="", encoding="utf-8", errors="ignore") as f:
            first_line = f.readline().strip()
            f.seek(0)

            first_cell = first_line.split(",")[0].strip().strip('"')
            has_header = not re.fullmatch(r"\d+", first_cell)

            if has_header:
                reader = csv.DictReader(f)
                for row in reader:
                    title = _first(row, _TITLE_KEYS)
                    if not title:
                        continue
                    pl_url   = _first(row, _URL_KEYS)
                    ch_url   = _first(row, _CH_URL_KEYS)
                    rank_val = row.get("rank", "0")
                    ids      = _extract_youtube_ids(pl_url, f"{clean_fname}_{rank_val}")
                    pl_id    = ids["id"]
                    dur_raw  = _first(row, _DURATION_KEYS)
                    duration = f"{dur_raw} hrs" if dur_raw and dur_raw.lower() not in ("unknown", "?", "", "n/a") else "?"
                    raw_lang = _first(row, _LANG_KEYS)
                    if raw_lang.upper() in ("HTML/CSS", "CSS", "VIDEO") or not raw_lang:
                        lang_val = "English"
                    else:
                        lang_val = raw_lang.strip()

                    vid_for_thumb = ids.get("video_id")
                    thumb_url = f"https://img.youtube.com/vi/{vid_for_thumb}/hqdefault.jpg" if vid_for_thumb else "https://img.youtube.com/vi/rfscVS0vtbw/hqdefault.jpg"

                    results.append({
                        "id":           pl_id,
                        "title":        title,
                        "channel":      _first(row, _CHANNEL_KEYS),
                        "language":     lang_val,
                        "description":  row.get("description", "").strip(),
                        "level":        row.get("level", "").strip(),
                        "video_count":  _first(row, _VIDEOS_KEYS) or "?",
                        "duration":     duration,
                        "playlist_url": pl_url,
                        "channel_url":  ch_url,
                        "source":       "csv",
                        "thumbnail":    thumb_url,
                    })
            else:
                # No-header CSVs: positional columns
                # rank, channel, title, type, language, level, videos, duration, description, channel_url, playlist_url
                reader = csv.reader(f)
                for cols in reader:
                    if not cols or not cols[0].strip().isdigit():
                        continue
                    if len(cols) < 5:
                        continue
                    rank_val = cols[0].strip()
                    channel  = cols[1].strip() if len(cols) > 1 else ""
                    title    = cols[2].strip() if len(cols) > 2 else ""
                    if not title:
                        continue
                    item_type = cols[3].strip() if len(cols) > 3 else ""
                    raw_lang  = cols[4].strip() if len(cols) > 4 else "English"
                    level     = cols[5].strip() if len(cols) > 5 else "Beginner"
                    video_cnt = cols[6].strip() if len(cols) > 6 else "?"
                    dur_raw   = cols[7].strip() if len(cols) > 7 else ""
                    duration  = f"{dur_raw} hrs" if dur_raw and dur_raw.lower() not in ("unknown", "?", "", "n/a", "none") else "?"

                    # Dynamically extract URLs from the end of the row
                    urls = [c.strip() for c in cols if c.strip().startswith(("http://", "https://"))]
                    if len(urls) >= 2:
                        pl_url = urls[-1]
                        ch_url = urls[-2]
                    elif len(urls) == 1:
                        pl_url = urls[0]
                        ch_url = ""
                    else:
                        pl_url = cols[-1].strip() if len(cols) > 10 else ""
                        ch_url = cols[-2].strip() if len(cols) > 10 else ""

                    # Extract description from between column 8 and the first URL column
                    url_indices = [i for i, c in enumerate(cols) if c.strip().startswith(("http://", "https://"))]
                    if url_indices and len(cols) > 8:
                        first_url_idx = url_indices[0]
                        desc = ", ".join(c.strip() for c in cols[8:first_url_idx] if c.strip()).strip()
                    elif len(cols) > 8:
                        desc = cols[8].strip()
                    else:
                        desc = ""

                    ids      = _extract_youtube_ids(pl_url, f"{clean_fname}_{rank_val}")
                    pl_id    = ids["id"]

                    if raw_lang.upper() in ("HTML/CSS", "CSS", "VIDEO") or not raw_lang:
                        lang_val = "English"
                    else:
                        lang_val = raw_lang.strip()

                    vid_for_thumb = ids.get("video_id")
                    thumb_url = f"https://img.youtube.com/vi/{vid_for_thumb}/hqdefault.jpg" if vid_for_thumb else "https://img.youtube.com/vi/rfscVS0vtbw/hqdefault.jpg"

                    results.append({
                        "id":           pl_id,
                        "title":        title,
                        "channel":      channel,
                        "language":     lang_val,
                        "description":  desc,
                        "level":        level,
                        "video_count":  video_cnt or "?",
                        "duration":     duration,
                        "playlist_url": pl_url,
                        "channel_url":  ch_url,
                        "source":       "csv",
                        "thumbnail":    thumb_url,
                    })
    except Exception as e:
        logger.error(f"Error parsing CSV {abs_path}: {e}", exc_info=True)

    return results


def _detect_query_language(query: str) -> Optional[str]:
    """Extract explicit language intent from query if mentioned (e.g. 'python in telugu')."""
    q = query.lower()
    if re.search(r"\btelugu\b", q):
        return "telugu"
    if re.search(r"\bhindi\b|\bhinglish\b", q):
        return "hindi"
    if re.search(r"\benglish\b", q):
        return "english"
    return None


def _filter_by_language(rows: list[dict], language: str) -> list[dict]:
    """Filters results by language preference: english, telugu, or hindi."""
    if not language or language.lower() in ("all", "any"):
        return rows
    lang_lower = language.lower().strip()
    if lang_lower not in ("english", "telugu", "hindi"):
        lang_lower = "english"
    filtered = []
    for r in rows:
        r_lang = r.get("language", "").lower()
        if not r_lang:
            continue
        if lang_lower in r_lang:
            filtered.append(r)
        elif lang_lower == "hindi" and any(h in r_lang for h in ("hinglish", "hindi/english", "english/hindi")):
            filtered.append(r)
        elif lang_lower == "english" and any(e in r_lang for e in ("hindi/english", "english/hindi", "html/css", "css")):
            filtered.append(r)
    return filtered


def _search_csv_playlists(query: str, level: str = "all", language: str = "english") -> list[dict]:
    q_lower = query.lower().strip()
    if not q_lower:
        return []

    # If the query matches a YouTube-only pattern (no CSV file exists for it),
    # return empty immediately so the caller falls back to the YouTube API.
    if _YOUTUBE_ONLY_PATTERNS.search(q_lower):
        return []

    query_lang = _detect_query_language(q_lower)
    effective_lang = query_lang if query_lang else language

    tech = _detect_primary_tech(q_lower)
    is_dsa = bool(re.search(r"\b(dsa|ds|data structure|data structures|algorithm|algorithms)\b", q_lower))

    # Each target entry is a (subdir, filename) tuple
    if tech:
        target_files: list[tuple[str, str]] = TECH_CONFIG[tech]["dsa_files"] if is_dsa else TECH_CONFIG[tech]["files"]
    elif is_dsa:
        # No language specified: default to Java/C++/Python DSA only.
        target_files = [
            (_DS_DIR, "dsa_in_java.csv"),
            (_DS_DIR, "dsa_in_cpp.csv"),
            (_DS_DIR, "dsa_in_python__1_.csv"),
        ]
    else:
        matched: set[tuple[str, str]] = set()
        for keyword, entries in CSV_TOPIC_MAP.items():
            if len(keyword) <= 2:
                if re.search(r"\b" + re.escape(keyword) + r"\b", q_lower):
                    for entry in entries:
                        matched.add(entry)
            else:
                if keyword in q_lower:
                    for entry in entries:
                        matched.add(entry)
        if not matched:
            return []
        target_files = list(matched)

    results = []
    seen: set[str] = set()
    for subdir, fn in target_files:
        abs_path = _csv_abs(subdir, fn)
        for r in _parse_csv(abs_path):
            # Strict language scoping: exclude competing technologies
            if tech and TECH_CONFIG[tech]["competing"]:
                competing = TECH_CONFIG[tech]["competing"]
                title_lower = r["title"].lower()
                if any(re.search(pat, title_lower) for pat in competing):
                    continue

            key = r.get("playlist_url") or r.get("title")
            if key not in seen:
                seen.add(key)
                results.append(r)

    return _filter_by_language(results, effective_lang)


async def _search_youtube(
    query: str, level: str = "all", language: str = "english", max_results: int = 25
) -> list[dict]:
    """Search YouTube Data API v3 for playlists/videos with strict educational parameters."""
    if not YOUTUBE_API_KEY:
        return []
    lang_clean = language.lower().strip() if language and language.lower().strip() in ("telugu", "hindi") else "english"
    yt_query = (
        f"{query} course tutorial playlist programming educational "
        f"{lang_clean if lang_clean != 'english' else ''}"
    ).strip()
    relevance_lang = "te" if lang_clean == "telugu" else ("hi" if lang_clean == "hindi" else "en")
    params = {
        "part":              "snippet",
        "q":                 yt_query,
        "type":              "playlist,video",
        "maxResults":        max_results,
        "safeSearch":        "strict",
        "key":               YOUTUBE_API_KEY,
        "relevanceLanguage": relevance_lang,
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
        id_obj  = item.get("id", {})
        pl_id   = id_obj.get("playlistId", "")
        vid_id  = id_obj.get("videoId", "")
        if not pl_id and not vid_id:
            continue

        pl_url  = f"https://www.youtube.com/playlist?list={pl_id}" if pl_id else f"https://www.youtube.com/watch?v={vid_id}"
        item_id = pl_id if pl_id else vid_id

        thumbnail = (
            snippet.get("thumbnails", {}).get("medium", {}).get("url")
            or snippet.get("thumbnails", {}).get("default", {}).get("url")
            or (f"https://img.youtube.com/vi/{vid_id}/mqdefault.jpg" if vid_id else "")
        )
        results.append({
            "id":           item_id,
            "title":        snippet.get("title", "Untitled"),
            "channel":      snippet.get("channelTitle", ""),
            "language":     language.capitalize() if language != "all" else "English",
            "description":  snippet.get("description", ""),
            "level":        level.capitalize() if level != "all" else "All Levels",
            "video_count":  "?" if pl_id else "1",
            "duration":     "?",
            "playlist_url": pl_url,
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

def _score_and_rank_playlists(results: list[dict], query: str, level: str = "all", language: str = "english") -> list[dict]:
    q_lower = query.lower().strip()
    query_lang = _detect_query_language(q_lower)
    effective_lang = (query_lang if query_lang else language).lower().strip()

    tech = _detect_primary_tech(q_lower)
    is_dsa = bool(re.search(r"\b(dsa|ds|data structure|data structures|algorithm|algorithms)\b", q_lower))
    q_words = set(w for w in re.split(r"\s+|-|_", q_lower) if len(w) > 1 and w not in STOP_WORDS)

    def calculate_score(p: dict) -> float:
        score = 0.0
        title_lower = p.get("title", "").lower()
        desc_lower = p.get("description", "").lower()
        channel_lower = p.get("channel", "").lower()
        item_lang = p.get("language", "").lower()

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

        # 4. Language match boost (English, Telugu, Hindi)
        if effective_lang and effective_lang != "all":
            if effective_lang in item_lang:
                score += 50.0
            elif effective_lang == "hindi" and any(h in item_lang for h in ("hinglish", "hindi/english", "english/hindi")):
                score += 35.0
            elif effective_lang == "english" and any(e in item_lang for e in ("hindi/english", "english/hindi")):
                score += 25.0
            else:
                score -= 30.0

        # 5. Title relevance
        if q_lower in title_lower:
            score += 40.0
        elif q_words and all(w in title_lower for w in q_words):
            score += 30.0
        elif q_words and any(w in title_lower for w in q_words):
            score += 15.0

        # 6. Reputable Channel Boost
        if any(ch in channel_lower for ch in REPUTABLE_CHANNELS):
            score += 25.0

        # 7. Course / Quality Keyword Boost
        if any(kw in title_lower for kw in QUALITY_KEYWORDS):
            score += 15.0
        if any(kw in desc_lower for kw in QUALITY_KEYWORDS):
            score += 5.0

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
    language:    str = Query("english", description="english | telugu | hindi"),
    level:       Optional[str] = Query("all", description="Legacy parameter (all levels returned)"),
    max_results: Optional[int] = Query(10, description="Max results limit (default 10, max 10)"),
):
    """
    Search playlists with quality ranking & limit strictly to TOP 10 best playlists.
    Strict CSV-first precedence: returns curated CSV results if found, otherwise falls back to YouTube API.
    Filters and ranks according to language category (English, Telugu, Hindi).
    """
    if not isinstance(language, str):
        language = getattr(language, "default", "english") or "english"

    lang_clean = language.lower().strip()
    if lang_clean not in ("english", "telugu", "hindi"):
        lang_clean = "english"

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

    # Detect language intent from query text or explicit parameter
    query_lang = _detect_query_language(sanitised)
    effective_lang = query_lang if query_lang else lang_clean

    # Search local CSV database first (all levels)
    csv_rows = _search_csv_playlists(sanitised, "all", effective_lang)

    if csv_rows:
        source_used = "csv"
        ranked = _score_and_rank_playlists(csv_rows, sanitised, "all", effective_lang)
        top_10 = ranked[:limit]
    else:
        source_used = "youtube"
        yt_rows = await _search_youtube(sanitised, "all", effective_lang, max_results=20)
        yt_rows = _filter_skill_playlists(yt_rows)
        ranked = _score_and_rank_playlists(yt_rows, sanitised, "all", effective_lang)
        top_10 = ranked[:limit]

    logger.info(
        f"Search '{sanitised}' → {len(top_10)} results "
        f"(source={source_used}, lang={effective_lang})."
    )

    return {
        "query": sanitised,
        "language": effective_lang,
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



FALLBACK_EDUCATIONAL_VIDEO_IDS = [
    "rfscVS0vtbw",  # Intro & Environment Setup
    "zOjov-2OZ0E",  # Variables & Data Types
    "On03HWe2tZM",  # Control Flow & Loops
    "p-ss2JNynmw",  # Functions & Scope
    "pVS3yhlzRLQ",  # Data Structures & Collections
    "AHZpyENo7k4",  # Object-Oriented Programming
    "KLlXCFG5TnA",  # Modules & Packages
    "s4DPM8ct1pI",  # Error Handling & Debugging
    "CZwAgf3f8CM",  # Real-World Capstone Project
    "HEBvdSI0wGQ",  # Final Review & Testing
]


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
        vid = FALLBACK_EDUCATIONAL_VIDEO_IDS[idx % len(FALLBACK_EDUCATIONAL_VIDEO_IDS)]
        videos.append({
            "videoId": vid,
            "title": f"Lesson {idx+1}: {topic}",
            "position": idx,
            "thumbnail": f"https://img.youtube.com/vi/{vid}/mqdefault.jpg",
            "watched": False,
            "last_position": 0.0,
            "watch_time": 0,
            "completed_at": None,
        })
    return videos


def _resolve_playlist_info(clean_id: str) -> dict:
    info = {"title": "", "channel": "", "playlist_url": "", "real_yt_id": "", "video_id": ""}
    if not clean_id:
        return info

    # 1. Direct check: is clean_id already a YouTube playlist ID (starts with PL, UU, FL, RD, OLAK5uy_)?
    if clean_id.startswith(("PL", "UU", "FL", "RD", "OLAK5uy_")):
        info["real_yt_id"] = clean_id
        return info

    if re.match(r"^[a-zA-Z0-9_-]{11}$", clean_id):
        info["video_id"] = clean_id

    # 2. Check Supabase saved_playlists table
    sb = get_supabase()
    if sb:
        try:
            res = sb.table("saved_playlists").select("title,channel,playlist_url").eq("playlist_id", clean_id).execute()
            if res.data and len(res.data) > 0:
                row = res.data[0]
                info["title"] = row.get("title", "")
                info["channel"] = row.get("channel", "")
                info["playlist_url"] = row.get("playlist_url", "")
                extracted = _extract_youtube_ids(info["playlist_url"], "")
                if extracted.get("playlist_id") and extracted["playlist_id"].startswith(("PL", "UU", "FL", "RD", "OLAK5uy_")):
                    info["real_yt_id"] = extracted["playlist_id"]
                if extracted.get("video_id"):
                    info["video_id"] = extracted["video_id"]
                return info
        except Exception:
            pass

    # 3. Check CSV files across data directory
    try:
        data_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "data", "youtube data"))
        if os.path.exists(data_dir):
            for root, _, files in os.walk(data_dir):
                for f in files:
                    if f.endswith(".csv"):
                        csv_path = os.path.join(root, f)
                        csv_items = _parse_csv(csv_path)
                        for item in csv_items:
                            extracted = _extract_youtube_ids(item.get("playlist_url", ""), "")
                            if (
                                item.get("id") == clean_id 
                                or item.get("playlist_id") == clean_id
                                or extracted.get("id") == clean_id
                                or extracted.get("playlist_id") == clean_id
                                or extracted.get("video_id") == clean_id
                            ):
                                info["title"] = item.get("title", "")
                                info["channel"] = item.get("channel", "")
                                info["playlist_url"] = item.get("playlist_url", "")
                                if extracted.get("playlist_id") and extracted["playlist_id"].startswith(("PL", "UU", "FL", "RD", "OLAK5uy_")):
                                    info["real_yt_id"] = extracted["playlist_id"]
                                if extracted.get("video_id"):
                                    info["video_id"] = extracted["video_id"]
                                return info
    except Exception as e:
        logger.warning(f"CSV lookup in _resolve_playlist_info failed: {e}")

    return info


# ── Video List ────────────────────────────────────────────────────────────────
@router.get("/playlist-videos")
async def get_playlist_videos(
    playlist_id: str = Query(..., description="YouTube playlist list= ID"),
    user_id:     str = Depends(get_session_or_user_id),
):
    """Fetch playlist videos from YouTube API + merge progress/resume data from Supabase."""
    clean_playlist_id = _extract_playlist_id(playlist_id, playlist_id)
    info = _resolve_playlist_info(clean_playlist_id)
    target_yt_id = info.get("real_yt_id") or (clean_playlist_id if clean_playlist_id.startswith(("PL", "UU", "FL", "RD", "OLAK5uy_")) else "")
    target_vid_id = info.get("video_id") or (clean_playlist_id if re.match(r"^[a-zA-Z0-9_-]{11}$", clean_playlist_id) else "")

    videos = []
    page_token = None

    # Case A: YouTube Playlist Items
    if YOUTUBE_API_KEY and target_yt_id and target_yt_id.startswith(("PL", "UU", "FL", "RD", "OLAK5uy_")):
        async with httpx.AsyncClient(timeout=20) as client:
            max_pages = 20
            page_count = 0
            while page_count < max_pages:
                page_count += 1
                params: dict = {
                    "part":       "snippet",
                    "playlistId": target_yt_id,
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

    # Case B: Standalone single-video course
    if not videos and target_vid_id and re.match(r"^[a-zA-Z0-9_-]{11}$", target_vid_id):
        v_title = info.get("title") or "Full Course"
        thumb = f"https://img.youtube.com/vi/{target_vid_id}/mqdefault.jpg"
        if YOUTUBE_API_KEY:
            try:
                async with httpx.AsyncClient(timeout=10) as client:
                    v_res = await client.get(
                        "https://www.googleapis.com/youtube/v3/videos",
                        params={"part": "snippet", "id": target_vid_id, "key": YOUTUBE_API_KEY}
                    )
                    if v_res.is_success:
                        v_data = v_res.json()
                        v_items = v_data.get("items", [])
                        if v_items:
                            snip = v_items[0].get("snippet", {})
                            v_title = snip.get("title") or v_title
                            thumb = snip.get("thumbnails", {}).get("medium", {}).get("url") or thumb
            except Exception as e:
                logger.warning(f"Single video fetch failed: {e}")

        videos.append({
            "videoId":       target_vid_id,
            "title":         v_title,
            "position":      0,
            "thumbnail":     thumb,
            "watched":       False,
            "last_position": 0.0,
            "watch_time":    0,
            "completed_at":  None,
        })

    # Case C: Fallback search if playlist was empty and not a standalone video
    if YOUTUBE_API_KEY and not videos and not target_vid_id:
        try:
            meta_title = info.get("title", "")
            meta_channel = info.get("channel", "")
            if meta_title or meta_channel:
                search_q = f"{meta_title} {meta_channel}".strip()
            else:
                search_q = clean_playlist_id.replace("csv_", "").replace("_", " ").strip()

            async with httpx.AsyncClient(timeout=10) as client:
                s_res = await client.get(
                    "https://www.googleapis.com/youtube/v3/search",
                    params={
                        "part": "snippet",
                        "q": f"{search_q} tutorial course",
                        "type": "video",
                        "maxResults": 15,
                        "key": YOUTUBE_API_KEY,
                    }
                )
                if s_res.is_success:
                    s_data = s_res.json()
                    for item in s_data.get("items", []):
                        v_id = item.get("id", {}).get("videoId")
                        if not v_id or not re.match(r"^[a-zA-Z0-9_-]{11}$", v_id):
                            continue
                        snip = item.get("snippet", {})
                        v_t = snip.get("title", f"Lesson {len(videos)+1}")
                        v_ch = snip.get("channelTitle", "")
                        if _STRICT_PROHIBITED_TERMS.search(f"{v_t} {v_ch}"):
                            continue
                        videos.append({
                            "videoId": v_id,
                            "title": v_t,
                            "position": len(videos),
                            "thumbnail": snip.get("thumbnails", {}).get("medium", {}).get("url") or f"https://img.youtube.com/vi/{v_id}/mqdefault.jpg",
                            "watched": False,
                            "last_position": 0.0,
                            "watch_time": 0,
                            "completed_at": None,
                        })
        except Exception as search_err:
            logger.warning(f"Fallback video search failed: {search_err}")

    # Fallback to structured lesson topic generator if still no videos returned
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
