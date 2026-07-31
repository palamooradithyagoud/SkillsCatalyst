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
from backend.services.auth_service import get_current_user_id
from backend.config import YOUTUBE_API_KEY

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/learning", tags=["learning"])

# ---------------------------------------------------------------------------
# Skills-only guard — keeps the search strictly on tech/career topics
# ---------------------------------------------------------------------------

# Blocklist: domains clearly outside skills/tech/career
_LEARNING_OFFTOPIC = re.compile(
    r"\b("
    # Entertainment
    r"movie|movies|film|films|cinema|series|web.?series|netflix|amazon.?prime|disney|hotstar|ott|"
    r"song|songs|music|album|band|singer|singer|actor|actress|celebrity|bollywood|hollywood|"
    r"anime|manga|cartoon|podcast|vlog|vlogger|reality.?show|"
    # Sports
    r"cricket|ipl|football|soccer|nfl|nba|sports|match|tournament|stadium|player|scorer|"
    # Food / lifestyle
    r"recipe|food|cook|cooking|restaurant|dish|eat|meal|diet|fitness.?workout|"
    # Personal / relationships
    r"girlfriend|boyfriend|relationship|marriage|wedding|love|dating|breakup|"
    r"joke|meme|funny|prank|entertainment|"
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
    r"dsa|algorithm|data.?structure|leetcode|competitive.?programming|sorting|searching|"
    r"system.?design|cloud|aws|azure|gcp|devops|docker|kubernetes|terraform|"
    r"sql|database|mongodb|postgres|redis|mysql|sqlite|"
    r"interview|resume|career|job|internship|salary|roadmap|skill|course|tutorial|playlist|"
    r"html|css|frontend|backend|fullstack|api|rest|graphql|web.?dev|"
    r"git|github|ci.?cd|linux|bash|shell|terminal|"
    r"c\+\+|golang|rust|kotlin|swift|flutter|dart|php|ruby|"
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
    "best movies", "series review", "web series",
]


def _is_skill_query(query: str) -> bool:
    """
    Returns True if the query is a valid skill/tech/career search.
    A query is invalid (non-skill) when:
      - It matches the off-topic domain blocklist, AND
      - It does NOT contain any recognised skill/career keyword.
    """
    stripped = query.strip()
    if not stripped:
        return False
    if _LEARNING_OFFTOPIC.search(stripped):
        # Only allow if user also mentioned a skill (e.g. "cricket data analysis in Python")
        return bool(_LEARNING_SKILL.search(stripped))
    return True


def _filter_skill_playlists(results: list[dict]) -> list[dict]:
    """
    Post-filter YouTube results: remove playlists whose title or description
    contain entertainment blocklist keywords (reduces noise from YouTube API).
    CSV-sourced results are always trusted and pass through unchanged.
    """
    filtered = []
    for pl in results:
        # Always keep curated CSV-sourced playlists
        if pl.get("source") == "csv":
            filtered.append(pl)
            continue
        title_desc = f"{pl.get('title', '')} {pl.get('description', '')}".lower()
        if any(kw in title_desc for kw in _ENTERTAINMENT_TITLE_BLOCKLIST):
            logger.debug(f"Filtered out non-skill YT playlist: '{pl.get('title', '')}'")
            continue
        filtered.append(pl)
    return filtered


# ── Path to the data directory ──────────────────────────────────────────────
DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "data")

# ── CSV keyword → file mapping ───────────────────────────────────────────────
CSV_TOPIC_MAP = {
    "python":           ["python_tutorials.csv", "dsa_in_python__1_.csv"],
    "java":             ["java_tutorials.csv", "dsa_in_java.csv"],
    "cpp":              ["cpp_tutorials.csv", "dsa_in_cpp.csv"],
    "c++":              ["cpp_tutorials.csv", "dsa_in_cpp.csv"],
    "c":                ["c_datastructures_tutorials.csv"],
    "dsa":              ["dsa_in_python__1_.csv", "dsa_in_cpp.csv", "dsa_in_java.csv", "c_datastructures_tutorials.csv"],
    "data structure":   ["dsa_in_python__1_.csv", "dsa_in_cpp.csv", "dsa_in_java.csv", "c_datastructures_tutorials.csv"],
    "data structures":  ["dsa_in_python__1_.csv", "dsa_in_cpp.csv", "dsa_in_java.csv", "c_datastructures_tutorials.csv"],
    "algorithm":        ["dsa_in_python__1_.csv", "dsa_in_cpp.csv", "dsa_in_java.csv", "c_datastructures_tutorials.csv"],
    "algorithms":       ["dsa_in_python__1_.csv", "dsa_in_cpp.csv", "dsa_in_java.csv", "c_datastructures_tutorials.csv"],
    "dsa cpp":          ["dsa_in_cpp.csv"],
    "dsa java":         ["dsa_in_java.csv"],
    "dsa python":       ["dsa_in_python__1_.csv"],
}

LEVEL_MAP = {
    "beginner":     ["Beginner", "Beginner-Intermediate", "Beginner-Advanced", "Beginner to Intermediate", "Beginner to Advanced"],
    "intermediate": ["Intermediate", "Intermediate-Advanced", "Beginner-Intermediate", "Beginner to Intermediate", "Intermediate to Advanced", "Beginner-Advanced", "Beginner to Advanced"],
    "advanced":     ["Advanced", "Intermediate-Advanced", "Beginner-Advanced", "Intermediate to Advanced", "Beginner to Advanced"],
    "all":          None,
}


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

    all_csv_files = [f for f in os.listdir(DATA_DIR) if f.endswith(".csv")]

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

    results = []
    seen_urls = set()
    seen_titles = set()

    def add_row(row):
        title_key = row["title"].lower().strip()
        url_key = row.get("playlist_url", "").strip()
        if title_key in seen_titles or (url_key and url_key in seen_urls):
            return
        if url_key:
            seen_urls.add(url_key)
        seen_titles.add(title_key)
        results.append(row)

    # 1. Load from topic-matched files first
    for fname in matched_files:
        for row in _parse_csv(fname):
            add_row(row)

    # 2. Search all CSV files for any title / description / channel keyword match
    q_words = [w for w in re.split(r"\s+|-|_", q_lower) if len(w) > 0]
    for fname in all_csv_files:
        for row in _parse_csv(fname):
            title_desc = f"{row['title']} {row['description']} {row['channel']} {row['level']}".lower()

            full_match = False
            if len(q_lower) <= 2:
                full_match = bool(re.search(r"\b" + re.escape(q_lower) + r"\b", title_desc))
            else:
                full_match = q_lower in title_desc

            word_match = False
            for w in q_words:
                if len(w) <= 2:
                    if re.search(r"\b" + re.escape(w) + r"\b", title_desc):
                        word_match = True
                        break
                else:
                    if w in title_desc:
                        word_match = True
                        break

            if full_match or word_match:
                add_row(row)

    return _filter_by_level(results, level)


async def _search_youtube(
    query: str, level: str = "all", language: str = "english", max_results: int = 25
) -> list[dict]:
    """Search YouTube Data API v3 for playlists."""
    if not YOUTUBE_API_KEY:
        return []
    yt_query = (
        f"{query} tutorial playlist "
        f"{level if level != 'all' else ''} "
        f"{language if language.lower() != 'english' else ''}"
    ).strip()
    params = {
        "part":              "snippet",
        "q":                 yt_query,
        "type":              "playlist",
        "maxResults":        max_results,
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
    channel:      str
    description:  Optional[str] = ""
    level:        Optional[str] = ""
    video_count:  Optional[str] = "?"
    duration:     Optional[str] = "?"
    playlist_url: str
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
    """Fired when player detects ≥95% of a video has been genuinely watched."""
    # user_id intentionally excluded — derived from JWT only
    playlist_id: str
    video_id:    str
    watch_time:  int       # seconds actually watched (server-side validation)
    completed:   bool = True


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
    q_words = set(re.findall(r"\w+", q_lower))

    def calculate_score(p: dict) -> float:
        score = 0.0
        title_lower = p.get("title", "").lower()
        desc_lower = p.get("description", "").lower()
        channel_lower = p.get("channel", "").lower()
        level_str = p.get("level", "").lower()

        # 1. Curated CSV source boost (verified high-quality playlists)
        if p.get("source") == "csv":
            score += 50.0

        # 2. Title relevance
        if q_lower in title_lower:
            score += 40.0
        elif q_words and all(w in title_lower for w in q_words):
            score += 30.0
        elif q_words and any(w in title_lower for w in q_words):
            score += 15.0

        # 3. Reputable Channel Boost
        if any(ch in channel_lower for ch in REPUTABLE_CHANNELS):
            score += 25.0

        # 4. Course / Quality Keyword Boost
        if any(kw in title_lower for kw in QUALITY_KEYWORDS):
            score += 15.0
        if any(kw in desc_lower for kw in QUALITY_KEYWORDS):
            score += 5.0

        # 5. Level Match
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
@router.get("/search")
async def search_skill(
    query:       str = Query(..., description="Skill keyword e.g. Python, React, DSA"),
    level:       str = Query("all",     description="beginner | intermediate | advanced | all"),
    language:    str = Query("english", description="Language preference"),
    max_results: Optional[int] = Query(10, description="Max results limit (default 10, max 10)"),
):
    """
    Search playlists with quality ranking & limit strictly to TOP 10 best playlists.
    Guards against non-skill queries before hitting YouTube API.
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

    # ── Skill-only guard: block entertainment / off-topic queries
    if not _is_skill_query(sanitised):
        logger.info(f"Non-skill search blocked: '{sanitised[:80]}'")
        raise HTTPException(
            status_code=400,
            detail={
                "error": "not_skill",
                "message": (
                    f"\"{ sanitised }\" doesn't look like a skill or tech topic. "
                    "Try searching for a programming language, tool, or concept — "
                    "e.g. \"Python\", \"React\", \"System Design\", or \"DSA\"."
                ),
            },
        )

    # Enforce top 10 limit
    limit = 10 if (max_results is None or max_results <= 0) else min(max_results, 10)

    csv_rows = _search_csv_playlists(sanitised, level)
    source_used = "csv" if csv_rows else "youtube"

    yt_rows: list[dict] = []
    if len(csv_rows) < 10:
        yt_rows = await _search_youtube(sanitised, level, language, max_results=20)
        # Post-filter: remove entertainment results that slipped through YouTube API
        yt_rows = _filter_skill_playlists(yt_rows)

    combined = csv_rows + yt_rows
    ranked = _score_and_rank_playlists(combined, sanitised, level)
    top_10 = ranked[:limit]

    logger.info(
        f"Search '{sanitised}' → {len(top_10)} results "
        f"(csv={len(csv_rows)}, yt={len(yt_rows)}, level={level})."
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
    current_user_id: str = Depends(get_current_user_id)
):
    user_id = current_user_id  # always from verified JWT
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

        data = {
            "playlist_id":  req.playlist_id,
            "title":        req.title,
            "channel":      req.channel,
            "description":  req.description,
            "level":        req.level,
            "video_count":  video_count,
            "duration":     req.duration,
            "playlist_url": req.playlist_url,
            "thumbnail":    req.thumbnail,
            "source":       req.source,
            "skill_query":  req.skill_query,
            "user_id":      user_id,
        }
        result = sb.table("saved_playlists").upsert(data, on_conflict="playlist_id,user_id").execute()
        return {"success": True, "data": result.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/save/{playlist_id}")
async def unsave_playlist(
    playlist_id: str,
    user_id: str = Depends(get_current_user_id)
):
    sb = get_supabase()
    if not sb:
        raise HTTPException(status_code=500, detail="Supabase not configured")
    try:
        sb.table("saved_playlists").delete().eq("playlist_id", playlist_id).eq("user_id", user_id).execute()
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/saved")
async def get_saved_playlists(user_id: str = Depends(get_current_user_id)):
    sb = get_supabase()
    if not sb:
        return {"saved": [], "count": 0}
    try:
        result = (
            sb.table("saved_playlists")
            .select("*")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .execute()
        )
        remapped = []
        for row in result.data:
            remapped.append({
                "id":           row.get("playlist_id", row.get("id", "")),
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
        return {"saved": remapped, "count": len(remapped)}
    except Exception as e:
        print(f"Error fetching saved playlists: {e}")
        return {"saved": [], "count": 0}


# ── Video List ────────────────────────────────────────────────────────────────
@router.get("/playlist-videos")
async def get_playlist_videos(
    playlist_id: str = Query(..., description="YouTube playlist list= ID"),
    user_id:     str = Depends(get_current_user_id),
):
    """Fetch playlist videos from YouTube API + merge progress/resume data from Supabase."""
    if not YOUTUBE_API_KEY:
        return {"videos": [], "count": 0, "error": "YouTube API key not configured"}

    videos = []
    page_token = None

    async with httpx.AsyncClient(timeout=20) as client:
        while True:
            params: dict = {
                "part":       "snippet",
                "playlistId": playlist_id,
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
                thumbnail = (
                    snippet.get("thumbnails", {}).get("medium", {}).get("url")
                    or f"https://img.youtube.com/vi/{vid}/mqdefault.jpg"
                )
                videos.append({
                    "videoId":       vid,
                    "title":         snippet.get("title", "Untitled"),
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

    # Merge progress data from Supabase & sync accurate video_count
    sb = get_supabase()
    if sb and videos and user_id != "default_user":
        try:
            # Sync verified YouTube video count back to saved_playlists table
            sb.table("saved_playlists").update({"video_count": str(len(videos))}).eq("playlist_id", playlist_id).eq("user_id", user_id).execute()
        except Exception:
            pass

        try:
            res = (
                sb.table("video_progress")
                .select("video_id,watched,last_position,watch_time,completed_at")
                .eq("user_id", user_id)
                .eq("playlist_id", playlist_id)
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

    return {"videos": videos, "count": len(videos)}


# ── Video Progress Endpoints ──────────────────────────────────────────────────
@router.post("/video-progress")
async def update_video_progress(
    req: VideoProgressRequest,
    current_user_id: str = Depends(get_current_user_id)
):
    """Manual mark-as-watched/unwatched. Optionally saves position & watch_time."""
    user_id = current_user_id  # always from verified JWT
    if not user_id:
        return {"success": True}
    sb = get_supabase()
    if not sb:
        raise HTTPException(status_code=500, detail="Supabase not configured")
    try:
        data: dict = {
            "user_id":     user_id,
            "playlist_id": req.playlist_id,
            "video_id":    req.video_id,
            "watched":     req.watched,
        }
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
    current_user_id: str = Depends(get_current_user_id)
):
    """
    Periodic resume save (every 10 s) — updates last_position & watch_time
    WITHOUT touching the `watched` flag (prevents anti-cheat bypass).
    """
    user_id = current_user_id  # always from verified JWT
    if not user_id:
        return {"success": True}
    sb = get_supabase()
    if not sb:
        return {"success": False, "reason": "Supabase not configured"}
    try:
        # Try UPDATE first (preserves watched status)
        res = (
            sb.table("video_progress")
            .update({"last_position": req.last_position, "watch_time": req.watch_time})
            .eq("user_id", user_id)
            .eq("playlist_id", req.playlist_id)
            .eq("video_id", req.video_id)
            .execute()
        )
        # If no row existed, INSERT it (without setting watched=true)
        if not res.data:
            sb.table("video_progress").insert({
                "user_id":       user_id,
                "playlist_id":   req.playlist_id,
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
async def complete_video(
    req: CompleteVideoRequest,
    current_user_id: str = Depends(get_current_user_id)
):
    """
    Auto-completion endpoint. Called when ≥95% of a video is genuinely watched.
    Server validates watch_time > 0 before recording completion.
    Returns updated playlist stats for instant UI update.
    """
    user_id = current_user_id  # always from verified JWT
    if not user_id:
        return {"success": True, "playlist_stats": {"completed_videos": 0}}
    sb = get_supabase()
    if not sb:
        raise HTTPException(status_code=500, detail="Supabase not configured")

    if req.watch_time <= 0:
        raise HTTPException(status_code=400, detail="Invalid watch_time: must be > 0 seconds")

    try:
        now = datetime.now(timezone.utc).isoformat()

        # Upsert completion record
        complete_data: dict = {
            "user_id":      user_id,
            "playlist_id":  req.playlist_id,
            "video_id":     req.video_id,
            "watched":      True,
            "watch_time":   req.watch_time,
            "last_position": 0.0,   # reset so next open starts from beginning
            "completed_at": now,
        }
        try:
            # Try with extended columns first
            complete_data["progress_pct"] = 100.0
            sb.table("video_progress").upsert(
                complete_data, on_conflict="user_id,playlist_id,video_id"
            ).execute()
        except Exception:
            # Fallback: columns may not exist yet — save basics only
            complete_data.pop("progress_pct", None)
            sb.table("video_progress").upsert(
                complete_data, on_conflict="user_id,playlist_id,video_id"
            ).execute()

        # Return updated playlist completion stats
        res = (
            sb.table("video_progress")
            .select("video_id,watched")
            .eq("user_id", user_id)
            .eq("playlist_id", req.playlist_id)
            .execute()
        )
        completed_count = sum(1 for r in (res.data or []) if r.get("watched"))

        return {
            "success":      True,
            "completed_at": now,
            "playlist_stats": {
                "completed_videos": completed_count,
            },
        }
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
