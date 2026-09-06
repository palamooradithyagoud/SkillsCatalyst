"""
SkillsCatalyst - Learning Playlist Service
Phase 2.1 Modular Architecture

Handles:
- Playlist metadata resolution (_resolve_playlist_info)
- Fallback educational playlist videos generation
- Dual persistence (saved_playlists table + learning_progress JSONB)
- Playlist CRUD: save, unsave, get saved, sync, and playlist items resolution
"""

import os
import re
import logging
import httpx
from typing import Optional
from fastapi import HTTPException
from pydantic import BaseModel

from backend.config import YOUTUBE_API_KEY
from backend.services.supabase_service import get_supabase
from backend.services.learning.content_guard import (
    _STRICT_PROHIBITED_TERMS,
    _is_uuid,
    _extract_youtube_ids,
    _extract_playlist_id,
)
from backend.services.learning.search_service import _parse_csv

logger = logging.getLogger(__name__)


def _get_sb():
    """Resolves Supabase client, honoring mocks on backend.routers.learning if present."""
    import sys
    learning_mod = sys.modules.get("backend.routers.learning")
    if learning_mod and hasattr(learning_mod, "get_supabase"):
        return learning_mod.get_supabase()
    return get_supabase()


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


class SyncSavedPlaylistsRequest(BaseModel):
    playlists: list[dict]


# ── Fallback Video IDs & Generator ────────────────────────────────────────────
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


def _resolve_playlist_info(clean_id: str, sb=None) -> dict:
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
    sb = sb if sb is not None else _get_sb()
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
        data_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "data", "youtube data"))
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


# ── Playlist CRUD Operations ──────────────────────────────────────────────────
async def save_playlist(
    req: SavePlaylistRequest,
    current_user_id: str,
    sb=None,
) -> dict:
    user_id = current_user_id
    sb = sb if sb is not None else _get_sb()
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


async def unsave_playlist(
    playlist_id: str,
    user_id: str,
    sb=None,
) -> dict:
    sb = sb if sb is not None else _get_sb()
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


async def get_saved_playlists(user_id: str, sb=None) -> dict:
    sb = sb if sb is not None else _get_sb()
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


async def sync_saved_playlists(
    req: SyncSavedPlaylistsRequest,
    current_user_id: str,
    sb=None,
) -> dict:
    """
    JSONB storage endpoint for saved playlists. Calculates total completion %
    and upserts into Supabase `learning_progress` keyed by (session_id, skill_name="saved_playlists").
    """
    sb = sb if sb is not None else _get_sb()
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


async def get_saved_playlists_jsonb(current_user_id: str, sb=None) -> dict:
    """
    Retrieves candidate saved playlists directly from JSONB `learning_progress`.
    """
    sb = sb if sb is not None else _get_sb()
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


async def get_playlist_videos(playlist_id: str, user_id: str, sb=None) -> dict:
    """Fetch playlist videos from YouTube API + merge progress/resume data from Supabase."""
    sb = sb if sb is not None else _get_sb()
    clean_playlist_id = _extract_playlist_id(playlist_id, playlist_id)
    info = _resolve_playlist_info(clean_playlist_id, sb=sb)
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
