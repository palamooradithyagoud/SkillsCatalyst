import os
import csv
import httpx
import re
import time
import logging
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Query, Depends
from pydantic import BaseModel
from typing import Optional
from backend.services.supabase_service import get_supabase
from backend.services.auth_service import get_current_user_id, get_session_or_user_id
from backend.config import YOUTUBE_API_KEY
from backend.services.rate_limiter import enforce_rate_limit, RATE_LIMIT_SEARCH_RPM
from backend.services.cache_service import get_cached_youtube_search, cache_youtube_search
from backend.services.observability import record_youtube_call, record_learning_search

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/learning", tags=["learning"])

# ---------------------------------------------------------------------------
# Strict Educational Content Guard & Extraction (Extracted to backend.services.learning)
# ---------------------------------------------------------------------------
from backend.services.learning.content_guard import (
    _STRICT_PROHIBITED_TERMS,
    _LEARNING_OFFTOPIC,
    _LEARNING_SKILL,
    _ENTERTAINMENT_TITLE_BLOCKLIST,
    _validate_skill_query,
    _is_skill_query,
    _is_uuid,
    _filter_skill_playlists,
    _extract_youtube_ids,
    _extract_playlist_id,
)



# ── Search & Ranking (Extracted to backend.services.learning.search_service) ───
from backend.services.learning.search_service import (
    DATA_DIR,
    TECH_CONFIG,
    CSV_TOPIC_MAP,
    LEVEL_MAP,
    REPUTABLE_CHANNELS,
    QUALITY_KEYWORDS,
    SCORE_CSV_SOURCE_BOOST,
    SCORE_EXACT_TECH_MATCH,
    SCORE_COMPETING_TECH_PENALTY,
    SCORE_DSA_BOOST,
    SCORE_EXACT_LANG_MATCH,
    SCORE_HINGLISH_LANG_MATCH,
    SCORE_ENGLISH_MIX_MATCH,
    SCORE_LANG_MISMATCH_PENALTY,
    SCORE_EXACT_TITLE_RELEVANCE,
    SCORE_ALL_WORDS_MATCH,
    SCORE_ANY_WORD_MATCH,
    SCORE_REPUTABLE_CHANNEL,
    SCORE_QUALITY_KEYWORD_TITLE,
    SCORE_QUALITY_KEYWORD_DESC,
    _first,
    _parse_csv,
    _detect_query_language,
    _detect_primary_tech,
    _filter_by_language,
    _search_csv_playlists,
    _search_youtube,
    _score_and_rank_playlists,
    search_learning_content,
)



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
    updated_at:    Optional[str] = None


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



# ── Search Endpoint ───────────────────────────────────────────────────────────
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
    Delegates to backend.services.learning.search_service.
    """
    return await search_learning_content(
        query=query,
        language=language,
        level=level,
        max_results=max_results,
    )




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
                logger.warning(f"Error fetching exact video count on save: {type(yt_err).__name__}")

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
                        err_msg = data.get("error", {}).get("message", "unknown") if isinstance(data, dict) else "unknown"
                        logger.warning(f"YouTube playlist items API error: {err_msg}")
                        break
                except Exception as e:
                    logger.warning(f"YouTube playlist fetch error: {type(e).__name__}")
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
                    .select("video_id,watched,last_position,watch_time,completed_at,updated_at")
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
                        v["updated_at"]    = prog.get("updated_at")
            except Exception as e:
                logger.error(f"Video progress merge error: {type(e).__name__}")

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
                            lp_pos = lp_v.get("last_position") if lp_v.get("last_position") is not None else lp_v.get("lastPosition")
                            lp_watch = lp_v.get("watch_time") if lp_v.get("watch_time") is not None else lp_v.get("watchTime")
                            lp_updated = lp_v.get("updated_at")
                            if not v.get("last_position") or (lp_updated and lp_updated > (v.get("updated_at") or "")):
                                if lp_pos is not None:
                                    v["last_position"] = float(lp_pos)
                                if lp_watch is not None:
                                    v["watch_time"] = int(lp_watch)
                                if lp_updated:
                                    v["updated_at"] = lp_updated
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
                data["last_position"] = int(round(req.last_position))
            if req.watch_time is not None:
                data["watch_time"] = int(round(req.watch_time))

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
    Playback Progress Verification — periodic resume save (every 10s).
    Validates position sanity & watch_time without touching `watched` status.
    Supports authenticated users (video_progress table) and guests (learning_progress JSONB).
    """
    user_id = current_user_id
    if not user_id:
        return {"success": True}

    # Playback Progress Verification: sanitize position & watch_time
    if req.last_position < 0 or req.watch_time < 0 or req.last_position > 86400:
        return {"success": False, "reason": "Invalid position or watch time bounds"}

    sb = get_supabase()
    if not sb:
        return {"success": False, "reason": "Supabase not configured"}

    clean_playlist_id = _extract_playlist_id(req.playlist_id, req.playlist_id)
    int_pos = int(round(req.last_position))
    int_watch = int(round(req.watch_time))
    now_iso = req.updated_at or datetime.now(timezone.utc).isoformat()

    try:
        if _is_uuid(user_id):
            res = (
                sb.table("video_progress")
                .update({"last_position": int_pos, "watch_time": int_watch, "updated_at": now_iso})
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
                    "last_position": int_pos,
                    "watch_time":    int_watch,
                    "updated_at":    now_iso,
                }).execute()
            return {"success": True, "updated_at": now_iso}
        else:
            # Guest session: persist to learning_progress JSONB
            try:
                res_lp = sb.table("learning_progress").select("id, completed_steps").eq("session_id", user_id).eq("skill_name", "saved_playlists").limit(1).execute()
                if res_lp.data and len(res_lp.data) > 0:
                    row_id = res_lp.data[0]["id"]
                    playlists = res_lp.data[0].get("completed_steps") or []
                    pl_idx = next((i for i, p in enumerate(playlists) if p.get("id") == clean_playlist_id or p.get("playlist_id") == clean_playlist_id or p.get("id") == req.playlist_id), -1)
                    if pl_idx != -1:
                        videos = playlists[pl_idx].get("videos") or []
                        v_idx = next((i for i, v in enumerate(videos) if (v.get("videoId") or v.get("id")) == req.video_id), -1)
                        vid_entry = {
                            "videoId": req.video_id,
                            "id": req.video_id,
                            "last_position": int_pos,
                            "lastPosition": int_pos,
                            "watch_time": int_watch,
                            "watchTime": int_watch,
                            "updated_at": now_iso,
                        }
                        if v_idx != -1:
                            videos[v_idx].update(vid_entry)
                        else:
                            vid_entry["watched"] = False
                            videos.append(vid_entry)
                        playlists[pl_idx]["videos"] = videos
                        sb.table("learning_progress").update({
                            "completed_steps": playlists,
                            "updated_at": now_iso,
                        }).eq("id", row_id).execute()
                    else:
                        playlists.append({
                            "id": clean_playlist_id,
                            "playlist_id": clean_playlist_id,
                            "videos": [{
                                "videoId": req.video_id,
                                "id": req.video_id,
                                "last_position": int_pos,
                                "lastPosition": int_pos,
                                "watch_time": int_watch,
                                "watchTime": int_watch,
                                "watched": False,
                                "updated_at": now_iso,
                            }]
                        })
                        sb.table("learning_progress").update({
                            "completed_steps": playlists,
                            "updated_at": now_iso,
                        }).eq("id", row_id).execute()
                else:
                    sb.table("learning_progress").insert({
                        "session_id": user_id,
                        "skill_name": "saved_playlists",
                        "completed_steps": [{
                            "id": clean_playlist_id,
                            "playlist_id": clean_playlist_id,
                            "videos": [{
                                "videoId": req.video_id,
                                "id": req.video_id,
                                "last_position": int_pos,
                                "lastPosition": int_pos,
                                "watch_time": int_watch,
                                "watchTime": int_watch,
                                "watched": False,
                                "updated_at": now_iso,
                            }]
                        }],
                        "updated_at": now_iso,
                    }).execute()
                return {"success": True, "updated_at": now_iso}
            except Exception as lp_err:
                logger.warning(f"Guest save-progress learning_progress error: {lp_err}")
                return {"success": True}
    except Exception as e:
        logger.warning(f"save-progress database error: {type(e).__name__}")
        return {"success": False}


@router.post("/complete-video")
@router.post("/mark-video-complete")
async def complete_video(
    req: CompleteVideoRequest,
    current_user_id: str = Depends(get_session_or_user_id)
):
    """
    Playback Progress Verification — auto-completion endpoint.
    Fired when player verifies ≥75% of a video has been watched.
    """
    user_id = current_user_id
    if not user_id:
        return {"success": True, "playlist_stats": {"completed_videos": 0}}

    # Playback Progress Verification bounds check
    if req.watch_time < 0 or (req.last_position is not None and req.last_position < 0):
        raise HTTPException(status_code=400, detail="Invalid watch_time or last_position: must be >= 0")

    sb = get_supabase()
    if not sb:
        raise HTTPException(status_code=500, detail="Supabase not configured")

    try:
        clean_playlist_id = _extract_playlist_id(req.playlist_id, req.playlist_id)
        now = datetime.now(timezone.utc).isoformat()
        int_pos = int(round(req.last_position)) if req.last_position is not None else 0
        int_watch = int(round(req.watch_time))

        # 1. Upsert completion record in video_progress if UUID user
        if _is_uuid(user_id):
            complete_data: dict = {
                "user_id":       user_id,
                "playlist_id":   clean_playlist_id,
                "video_id":      req.video_id,
                "watched":       req.completed,
                "watch_time":    int_watch,
                "completed_at":  now if req.completed else None,
                "last_position": int_pos,
            }

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
from backend.services.learning.roadmap_service import (
    RoadmapRequest,
    generate_skill_roadmap as _generate_skill_roadmap_svc,
)


@router.post("/roadmap")
async def generate_skill_roadmap(req: RoadmapRequest):
    """
    Tier 3 Resolution: Generate a 5-tier structured skill roadmap via Groq AI (Llama-3.3 70B).
    Delegates to backend.services.learning.roadmap_service.
    """
    return await _generate_skill_roadmap_svc(req)

