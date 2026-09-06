"""
SkillsCatalyst - Learning Search & Ranking Service
Phase 2.1 Modular Architecture

Handles:
- Curated CSV repository lookup & parsing
- Multi-language detection & filtering (English, Telugu, Hindi)
- Competing technology penalties & quality-weighted scoring
- YouTube Data API v3 integration with observability & Redis caching
"""

import os
import csv
import re
import time
import httpx
import logging
from typing import Optional
from fastapi import HTTPException

from backend.config import YOUTUBE_API_KEY
from backend.services.cache_service import get_cached_youtube_search, cache_youtube_search
from backend.services.observability import record_youtube_call, record_learning_search
from backend.services.learning.content_guard import (
    _extract_youtube_ids,
    _extract_playlist_id,
    _validate_skill_query,
    _filter_skill_playlists,
)

logger = logging.getLogger(__name__)

# ── Path to the data directory ──────────────────────────────────────────────
DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "..", "data")

# Subdirectory shortcuts
_DS_DIR   = os.path.join(DATA_DIR, "youtube data", "data structure")
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

CSV_TOPIC_MAP = {
    # ── Language tutorials (no DSA) ──────────────────────────────────────────
    "python":            [(_LANG_DIR, "python.csv")],
    "java":              [(_LANG_DIR, "java.csv")],
    "cpp":               [(_LANG_DIR, "c++.csv")],
    "c++":               [(_LANG_DIR, "c++.csv")],
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
    """Detects explicit programming language / tech domain from query."""
    q = query.lower()

    if _YOUTUBE_ONLY_PATTERNS.search(q):
        return None

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

    if re.search(r"\bjava\b", q):
        return "java"
    if re.search(r"\bpython\b|\bpy\b", q):
        return "python"
    if re.search(r"(?<![a-zA-Z0-9])c\+\+(?![a-zA-Z0-9])|\bcpp\b", q):
        return "cpp"
    if re.search(
        r"(?<![a-zA-Z0-9\+#])c programming\b"
        r"|(?<![a-zA-Z0-9\+#])c language\b"
        r"|(?<![a-zA-Z0-9\+#])\bc\b(?![\+#a-zA-Z0-9])",
        q
    ):
        return "c"
    return None


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
                    raw_lang  = cols[4].strip() if len(cols) > 4 else "English"
                    level     = cols[5].strip() if len(cols) > 5 else "Beginner"
                    video_cnt = cols[6].strip() if len(cols) > 6 else "?"
                    dur_raw   = cols[7].strip() if len(cols) > 7 else ""
                    duration  = f"{dur_raw} hrs" if dur_raw and dur_raw.lower() not in ("unknown", "?", "", "n/a", "none") else "?"

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

    if _YOUTUBE_ONLY_PATTERNS.search(q_lower):
        return []

    query_lang = _detect_query_language(q_lower)
    effective_lang = query_lang if query_lang else language

    tech = _detect_primary_tech(q_lower)
    is_dsa = bool(re.search(r"\b(dsa|ds|data structure|data structures|algorithm|algorithms)\b", q_lower))

    if tech:
        target_files: list[tuple[str, str]] = TECH_CONFIG[tech]["dsa_files"] if is_dsa else TECH_CONFIG[tech]["files"]
    elif is_dsa:
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
    async with httpx.AsyncClient(timeout=8.0) as client:
        try:
            resp = await client.get("https://www.googleapis.com/youtube/v3/search", params=params)
            if resp.status_code in (403, 429):
                logger.warning(f"YouTube API rate limit / quota exceeded response [{resp.status_code}]")
                record_youtube_call(success=False)
                return []
            resp.raise_for_status()
            data = resp.json()
            record_youtube_call(success=True)
        except Exception as e:
            record_youtube_call(success=False)
            logger.warning(f"YouTube API query error: {type(e).__name__}")
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

# ── Centralized Scoring & Ranking Weights ─────────────────────────────────────
SCORE_CSV_SOURCE_BOOST       = 50.0
SCORE_EXACT_TECH_MATCH       = 50.0
SCORE_COMPETING_TECH_PENALTY = -500.0
SCORE_DSA_BOOST              = 40.0
SCORE_EXACT_LANG_MATCH       = 50.0
SCORE_HINGLISH_LANG_MATCH    = 35.0
SCORE_ENGLISH_MIX_MATCH      = 25.0
SCORE_LANG_MISMATCH_PENALTY  = -30.0
SCORE_EXACT_TITLE_RELEVANCE  = 40.0
SCORE_ALL_WORDS_MATCH        = 30.0
SCORE_ANY_WORD_MATCH         = 15.0
SCORE_REPUTABLE_CHANNEL      = 25.0
SCORE_QUALITY_KEYWORD_TITLE  = 15.0
SCORE_QUALITY_KEYWORD_DESC   = 5.0


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

        # 1. Curated CSV source boost
        if p.get("source") == "csv":
            score += SCORE_CSV_SOURCE_BOOST

        # 2. Strict technology match & penalty for competing tech
        if tech:
            if re.search(r"\b" + re.escape(tech) + r"\b", title_lower):
                score += SCORE_EXACT_TECH_MATCH
            if any(re.search(pat, title_lower) for pat in TECH_CONFIG[tech]["competing"]):
                score += SCORE_COMPETING_TECH_PENALTY

        # 3. DSA/DS specific boost
        if is_dsa and any(w in title_lower for w in ["dsa", "data structure", "data structures", "algorithm", "algorithms", "bootcamp"]):
            score += SCORE_DSA_BOOST

        # 4. Language match boost (English, Telugu, Hindi)
        if effective_lang and effective_lang != "all":
            if effective_lang in item_lang:
                score += SCORE_EXACT_LANG_MATCH
            elif effective_lang == "hindi" and any(h in item_lang for h in ("hinglish", "hindi/english", "english/hindi")):
                score += SCORE_HINGLISH_LANG_MATCH
            elif effective_lang == "english" and any(e in item_lang for e in ("hindi/english", "english/hindi")):
                score += SCORE_ENGLISH_MIX_MATCH
            else:
                score += SCORE_LANG_MISMATCH_PENALTY

        # 5. Title relevance
        if q_lower in title_lower:
            score += SCORE_EXACT_TITLE_RELEVANCE
        elif q_words and all(w in title_lower for w in q_words):
            score += SCORE_ALL_WORDS_MATCH
        elif q_words and any(w in title_lower for w in q_words):
            score += SCORE_ANY_WORD_MATCH

        # 6. Reputable Channel Boost
        if any(ch in channel_lower for ch in REPUTABLE_CHANNELS):
            score += SCORE_REPUTABLE_CHANNEL

        # 7. Course / Quality Keyword Boost
        if any(kw in title_lower for kw in QUALITY_KEYWORDS):
            score += SCORE_QUALITY_KEYWORD_TITLE
        if any(kw in desc_lower for kw in QUALITY_KEYWORDS):
            score += SCORE_QUALITY_KEYWORD_DESC

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


async def search_learning_content(
    query: str,
    language: str = "english",
    level: Optional[str] = "all",
    max_results: Optional[int] = 10,
) -> dict:
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
    search_start = time.time()

    # Detect language intent from query text or explicit parameter
    query_lang = _detect_query_language(sanitised)
    effective_lang = query_lang if query_lang else lang_clean
    cache_hit = False

    # Search local CSV database first (all levels)
    csv_rows = _search_csv_playlists(sanitised, "all", effective_lang)

    if csv_rows:
        source_used = "csv"
        ranked = _score_and_rank_playlists(csv_rows, sanitised, "all", effective_lang)
        top_10 = ranked[:limit]
    else:
        source_used = "youtube"
        # Check Redis cache first to save YouTube Data API quota
        cached_yt = get_cached_youtube_search(sanitised, effective_lang)
        if cached_yt:
            cache_hit = True
            logger.info(f"YouTube search cache HIT for '{sanitised}' ({effective_lang})")
            top_10 = cached_yt[:limit]
        else:
            yt_rows = await _search_youtube(sanitised, "all", effective_lang, max_results=20)
            yt_rows = _filter_skill_playlists(yt_rows)
            ranked = _score_and_rank_playlists(yt_rows, sanitised, "all", effective_lang)
            top_10 = ranked[:limit]
            if top_10:
                cache_youtube_search(sanitised, effective_lang, top_10)

    elapsed_ms = round((time.time() - search_start) * 1000, 2)
    record_learning_search(source=source_used, language=effective_lang, cache_hit=cache_hit, latency_ms=elapsed_ms)

    logger.info(
        f"Search '{sanitised}' → {len(top_10)} results "
        f"(source={source_used}, lang={effective_lang}, cached={cache_hit}, latency={elapsed_ms}ms)."
    )

    return {
        "query": sanitised,
        "language": effective_lang,
        "source": source_used,
        "count": len(top_10),
        "results": top_10,
    }
