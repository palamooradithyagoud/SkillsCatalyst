"""
SkillsCatalyst - Learning Playlist Service
Phase 2.1 Modular Architecture

Handles:
- Playlist metadata resolution (_resolve_playlist_info)
- Fallback educational playlist videos generation
- Dual persistence (saved_playlists table + learning_progress JSONB)
- Playlist CRUD: save, unsave, get saved, sync, and playlist items resolution
"""

import asyncio
import os
import re
import logging
import httpx
from collections import defaultdict
from typing import Optional, Dict, Any, List
from fastapi import HTTPException, status
from pydantic import BaseModel

from backend.config import YOUTUBE_API_KEY
from backend.services.supabase_service import get_supabase
from backend.services.learning.content_guard import (
    _STRICT_PROHIBITED_TERMS,
    _LEARNING_SKILL,
    _is_uuid,
    _extract_youtube_ids,
    _extract_playlist_id,
)
from backend.services.learning.search_service import _parse_csv

logger = logging.getLogger(__name__)

YT_REQUEST_HEADERS = {
    "Referer": "https://www.skillscatalyst.in",
    "User-Agent": "SkillsCatalyst-Backend/1.0",
}


def _get_sb():
    """Resolves Supabase client, honoring mocks on backend.routers.learning if present."""
    import sys
    learning_mod = sys.modules.get("backend.routers.learning")
    if learning_mod and hasattr(learning_mod, "get_supabase"):
        return learning_mod.get_supabase()
    return get_supabase()


def _canonicalize_playlist_id(playlist_url: str = "", playlist_id: str = "") -> str:
    """
    Extracts the canonical YouTube playlist ID or video ID from any combination
    of playlist_url, playlist_id, or dirty URL/query strings.
    Guarantees consistent canonical ID across all representations.
    """
    for val in (playlist_url, playlist_id):
        if not val or not isinstance(val, str):
            continue
        val = val.strip()
        if not val:
            continue
        extracted = _extract_youtube_ids(val, "")
        if extracted.get("playlist_id"):
            return extracted["playlist_id"].strip()
        if extracted.get("video_id"):
            return extracted["video_id"].strip()

    raw = (playlist_id or playlist_url or "").strip()
    if raw:
        extracted = _extract_youtube_ids(raw, raw)
        return (extracted.get("id") or raw).strip()
    return ""


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


class PlaylistStatsBatchRequest(BaseModel):
    playlist_ids: Optional[list[str]] = None


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


def _resolve_playlist_info(clean_id: str, sb=None, user_id: str = "") -> dict:
    info = {"title": "", "channel": "", "playlist_url": "", "video_count": "", "real_yt_id": "", "video_id": ""}
    if not clean_id:
        return info

    # 1. Direct check: is clean_id already a YouTube playlist ID?
    if clean_id.startswith(("PL", "UU", "FL", "RD", "OLAK5uy_")):
        info["real_yt_id"] = clean_id

    if re.match(r"^[a-zA-Z0-9_-]{11}$", clean_id):
        info["video_id"] = clean_id

    # 2. Check Supabase saved_playlists table for existing metadata & video_count
    sb = sb if sb is not None else _get_sb()
    if sb:
        try:
            query = sb.table("saved_playlists").select("title,channel,playlist_url,video_count").eq("playlist_id", clean_id)
            if user_id and _is_uuid(user_id):
                res = query.eq("user_id", user_id).execute()
                if not res.data:
                    res = sb.table("saved_playlists").select("title,channel,playlist_url,video_count").eq("playlist_id", clean_id).execute()
            else:
                res = query.execute()

            if res.data and len(res.data) > 0:
                row = res.data[0]
                info["title"] = row.get("title", "")
                info["channel"] = row.get("channel", "")
                info["playlist_url"] = row.get("playlist_url", "")
                info["video_count"] = row.get("video_count", "")
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
        clean_pid = _canonicalize_playlist_id(req.playlist_url, req.playlist_id)
        if not clean_pid:
            clean_pid = req.playlist_id.strip()

        yt_pid = clean_pid
        if yt_pid:
            if not yt_pid.startswith(("PL", "UU", "FL", "RD", "OLAK5uy_")) and re.match(r"^[a-zA-Z0-9_-]{11}$", yt_pid):
                video_count = "1"
            elif YOUTUBE_API_KEY and yt_pid.startswith(("PL", "UU", "FL", "RD", "OLAK5uy_")):
                try:
                    async with httpx.AsyncClient(timeout=5, headers=YT_REQUEST_HEADERS) as client:
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

        # Phase 3 Entitlement Enforcement for saved_videos
        from backend.services.subscription_service import SubscriptionService
        _, is_premium = SubscriptionService.get_effective_plan(user_id)
        if not is_premium:
            is_already_saved = False
            saved_count = 0
            if sb:
                try:
                    if _is_uuid(user_id):
                        existing_check = await asyncio.to_thread(
                            lambda: sb.table("saved_playlists").select("id").eq("user_id", user_id).eq("playlist_id", clean_pid).execute()
                        )
                        if existing_check.data and len(existing_check.data) > 0:
                            is_already_saved = True
                        elif req.playlist_id != clean_pid:
                            existing_check_raw = await asyncio.to_thread(
                                lambda: sb.table("saved_playlists").select("id").eq("user_id", user_id).eq("playlist_id", req.playlist_id).execute()
                            )
                            if existing_check_raw.data and len(existing_check_raw.data) > 0:
                                is_already_saved = True
                        count_res = await asyncio.to_thread(
                            lambda: sb.table("saved_playlists").select("id").eq("user_id", user_id).execute()
                        )
                        saved_count = len(count_res.data or [])
                    else:
                        res_lp = await asyncio.to_thread(
                            lambda: sb.table("learning_progress").select("completed_steps").eq("session_id", user_id).eq("skill_name", "saved_playlists").limit(1).execute()
                        )
                        if res_lp.data and len(res_lp.data) > 0:
                            existing_lp = res_lp.data[0].get("completed_steps", [])
                            for p in existing_lp:
                                p_id = p.get("id") or p.get("playlist_id") or ""
                                p_clean = _canonicalize_playlist_id(p.get("playlist_url", ""), p_id) or p_id
                                if p_clean in (clean_pid, req.playlist_id) or p_id in (clean_pid, req.playlist_id):
                                    is_already_saved = True
                                    break
                            saved_count = len(existing_lp)
                except Exception as count_err:
                    logger.warning(f"Error checking saved playlists count: {count_err}")

            if not is_already_saved:
                limit = SubscriptionService.get_feature_limit(user_id, "saved_videos") or 1
                if saved_count >= limit:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail={
                            "code": "LIMIT_REACHED",
                            "feature": "saved_videos",
                            "limit": limit,
                        },
                    )

        res_data = None
        if _is_uuid(user_id):
            data = {
                "playlist_id":  clean_pid,
                "title":        req.title,
                "channel":      req.channel or "",
                "description":  req.description or "",
                "level":        req.level or "",
                "video_count":  video_count or "?",
                "duration":     req.duration or "?",
                "playlist_url": req.playlist_url or f"https://www.youtube.com/playlist?list={clean_pid}",
                "thumbnail":    req.thumbnail or "",
                "source":       req.source or "youtube",
                "skill_query":  req.skill_query or "",
                "user_id":      user_id,
            }
            try:
                result = await asyncio.to_thread(
                    lambda: sb.table("saved_playlists").upsert(data, on_conflict="playlist_id,user_id").execute()
                )
                res_data = result.data
            except Exception as upsert_err:
                logger.warning(f"Upsert failed, falling back to manual select/insert: {upsert_err}")
                existing = await asyncio.to_thread(
                    lambda: sb.table("saved_playlists").select("id").eq("playlist_id", clean_pid).eq("user_id", user_id).execute()
                )
                if not (existing.data and len(existing.data) > 0) and req.playlist_id != clean_pid:
                    existing = await asyncio.to_thread(
                        lambda: sb.table("saved_playlists").select("id").eq("playlist_id", req.playlist_id).eq("user_id", user_id).execute()
                    )
                if existing.data and len(existing.data) > 0:
                    row_id = existing.data[0].get("id")
                    res_upd = await asyncio.to_thread(
                        lambda: sb.table("saved_playlists").update(data).eq("id", row_id).execute()
                    )
                    res_data = res_upd.data
                else:
                    res_ins = await asyncio.to_thread(
                        lambda: sb.table("saved_playlists").insert(data).execute()
                    )
                    res_data = res_ins.data

        # Also sync to learning_progress JSONB column (supports both guest sessions & auth UUIDs)
        try:
            res_lp = await asyncio.to_thread(
                lambda: sb.table("learning_progress").select("id, completed_steps").eq("session_id", user_id).eq("skill_name", "saved_playlists").limit(1).execute()
            )
            has_existing = bool(res_lp.data and len(res_lp.data) > 0)
            existing_lp = res_lp.data[0].get("completed_steps", []) if has_existing else []
            pl_entry = {
                "id": clean_pid,
                "playlist_id": clean_pid,
                "title": req.title,
                "channel": req.channel or "",
                "description": req.description or "",
                "level": req.level or "",
                "video_count": video_count or "?",
                "duration": req.duration or "?",
                "playlist_url": req.playlist_url or f"https://www.youtube.com/playlist?list={clean_pid}",
                "thumbnail": req.thumbnail or "",
                "source": req.source or "youtube",
                "skill_query": req.skill_query or "",
                "completed": False,
                "videos": []
            }
            found_idx = -1
            for idx, p in enumerate(existing_lp):
                p_id = p.get("id") or p.get("playlist_id") or ""
                p_clean = _canonicalize_playlist_id(p.get("playlist_url", ""), p_id) or p_id
                if p_clean in (clean_pid, req.playlist_id) or p_id in (clean_pid, req.playlist_id):
                    found_idx = idx
                    break

            if found_idx >= 0:
                existing_entry = existing_lp[found_idx]
                pl_entry["completed"] = existing_entry.get("completed", False)
                pl_entry["videos"] = existing_entry.get("videos", [])
                existing_lp[found_idx] = pl_entry
            else:
                existing_lp.append(pl_entry)

            lp_row = {
                "session_id": user_id,
                "skill_name": "saved_playlists",
                "completed_steps": existing_lp,
            }
            if _is_uuid(user_id):
                lp_row["user_id"] = user_id
            if has_existing:
                await asyncio.to_thread(
                    lambda: sb.table("learning_progress").update(lp_row).eq("session_id", user_id).eq("skill_name", "saved_playlists").execute()
                )
            else:
                await asyncio.to_thread(
                    lambda: sb.table("learning_progress").insert(lp_row).execute()
                )
        except Exception as jsonb_sync_err:
            logger.warning(f"Error syncing saved playlist to learning_progress: {jsonb_sync_err}")

        # Log event to user_feedback analytics
        try:
            await asyncio.to_thread(
                lambda: sb.table("user_feedback").insert({
                    "user_id": user_id,
                    "action": "save",
                    "resource_url": req.playlist_url or f"https://www.youtube.com/playlist?list={clean_pid}",
                    "resource_title": req.title or "",
                    "skill_name": req.skill_query or "playlist",
                }).execute()
            )
        except Exception:
            pass

        return {"success": True, "data": res_data}
    except HTTPException:
        raise
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
        clean_pid = _canonicalize_playlist_id("", playlist_id) or playlist_id.strip()
        if _is_uuid(user_id):
            await asyncio.to_thread(
                lambda: sb.table("saved_playlists").delete().eq("user_id", user_id).in_("playlist_id", [playlist_id, clean_pid]).execute()
            )

        # Also remove from learning_progress JSONB
        try:
            res_lp = await asyncio.to_thread(
                lambda: sb.table("learning_progress").select("completed_steps").eq("session_id", user_id).eq("skill_name", "saved_playlists").limit(1).execute()
            )
            if res_lp.data and len(res_lp.data) > 0:
                existing_lp = res_lp.data[0].get("completed_steps", [])
                filtered = [
                    p for p in existing_lp
                    if (_canonicalize_playlist_id(p.get("playlist_url", ""), p.get("id") or p.get("playlist_id") or "") not in (clean_pid, playlist_id))
                    and (p.get("id") not in (clean_pid, playlist_id))
                    and (p.get("playlist_id") not in (clean_pid, playlist_id))
                ]
                lp_row = {
                    "session_id": user_id,
                    "skill_name": "saved_playlists",
                    "completed_steps": filtered,
                }
                if _is_uuid(user_id):
                    lp_row["user_id"] = user_id
                await asyncio.to_thread(
                    lambda: sb.table("learning_progress").update(lp_row).eq("session_id", user_id).eq("skill_name", "saved_playlists").execute()
                )
        except Exception as jsonb_err:
            logger.warning(f"Error removing playlist from learning_progress: {jsonb_err}")

        return {"success": True}
    except HTTPException:
        raise
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
                result = await asyncio.to_thread(
                    lambda: (
                        sb.table("saved_playlists")
                        .select("*")
                        .eq("user_id", user_id)
                        .order("created_at", desc=True)
                        .execute()
                    )
                )
                for row in (result.data or []):
                    raw_pid = row.get("playlist_id", row.get("id", ""))
                    clean_id = _canonicalize_playlist_id(row.get("playlist_url", ""), raw_pid) or raw_pid
                    if clean_id and clean_id not in seen_ids and raw_pid not in seen_ids:
                        seen_ids.add(clean_id)
                        if raw_pid:
                            seen_ids.add(raw_pid)
                        remapped.append({
                            "id":           clean_id,
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
            res_lp = await asyncio.to_thread(
                lambda: (
                    sb.table("learning_progress")
                    .select("completed_steps")
                    .eq("session_id", user_id)
                    .eq("skill_name", "saved_playlists")
                    .limit(1)
                    .execute()
                )
            )
            if res_lp.data and len(res_lp.data) > 0:
                jsonb_items = res_lp.data[0].get("completed_steps", [])
                for item in jsonb_items:
                    raw_item_id = item.get("id") or item.get("playlist_id") or ""
                    clean_item_id = _canonicalize_playlist_id(item.get("playlist_url", ""), raw_item_id) or raw_item_id
                    if clean_item_id and clean_item_id not in seen_ids and raw_item_id not in seen_ids:
                        seen_ids.add(clean_item_id)
                        if raw_item_id:
                            seen_ids.add(raw_item_id)
                        remapped.append({
                            "id":           clean_item_id,
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

        # Batch resolve statistics (completed_videos, total_videos, progress_pct) in 1 query
        all_pids = [p["id"] for p in remapped if isinstance(p, dict) and p.get("id")]
        if all_pids:
            try:
                stats_map = await get_batch_playlist_stats_internal(all_pids, user_id, sb=sb)
                for p in remapped:
                    if isinstance(p, dict):
                        pid = p.get("id")
                        clean = _canonicalize_playlist_id(p.get("playlist_url", ""), pid) or pid
                        st = stats_map.get(clean) or stats_map.get(pid) or {}
                        st_status = st.get("status")

                        vc_raw = p.get("video_count")
                        m = re.search(r'\d+', str(vc_raw or ""))
                        vc_int = int(m.group()) if m else None

                        p["stats_status"] = st_status or "missing"
                        if st_status in ("unavailable", "partial"):
                            p["completed_videos"] = None
                            p["total_videos"] = st.get("total_videos") or vc_int
                            p["progress_pct"] = None
                        elif st_status == "available":
                            p["completed_videos"] = st.get("completed_videos", 0)
                            p["total_videos"] = st.get("total_videos") or vc_int or 0
                            p["progress_pct"] = st.get("progress_pct", 0)
                        else:  # missing or unstarted
                            p["completed_videos"] = 0
                            p["total_videos"] = st.get("total_videos") or vc_int or 0
                            p["progress_pct"] = 0
                            p["stats_status"] = "missing"
                        p["last_watched_at"] = st.get("last_watched_at")
            except Exception as stats_err:
                logger.warning(f"Error enriching saved playlists with stats: {stats_err}")
                for p in remapped:
                    if isinstance(p, dict):
                        vc_raw = p.get("video_count")
                        m = re.search(r'\d+', str(vc_raw or ""))
                        p["stats_status"] = "unavailable"
                        p["completed_videos"] = None
                        p["total_videos"] = int(m.group()) if m else None
                        p["progress_pct"] = None
                        p["last_watched_at"] = None

        return {"saved": remapped, "count": len(remapped)}
    except Exception as e:
        logger.error(f"Error fetching saved playlists: {e}")
        return {"saved": [], "count": 0}


async def get_batch_playlist_stats_internal(
    playlist_ids: Optional[list[str]],
    user_id: str,
    sb=None,
) -> Dict[str, dict]:
    """
    Core set-based query resolving statistics for target playlist IDs in 1-3 set queries
    instead of N+1 waterfalls.
    Explicitly distinguishes:
    1. available (genuine progress or genuine zero progress)
    2. missing (playlist not found in user's saved list or progress records)
    3. unavailable (database failure on progress/metadata queries)
    4. partial (metadata retrieved, but progress query failed)
    """
    sb = sb if sb is not None else _get_sb()
    if not user_id:
        return {}

    clean_to_raw: Dict[str, str] = {}
    clean_pids: list[str] = []

    if playlist_ids is not None:
        for raw_pid in playlist_ids:
            if not raw_pid or not isinstance(raw_pid, str):
                continue
            clean = _canonicalize_playlist_id("", raw_pid) or raw_pid.strip()
            if clean and clean not in clean_to_raw:
                clean_to_raw[clean] = raw_pid
                clean_pids.append(clean)
    else:
        # Fetch all saved playlist IDs for this user
        if _is_uuid(user_id) and sb:
            try:
                res_saved = await asyncio.to_thread(
                    lambda: sb.table("saved_playlists").select("playlist_id, video_count").eq("user_id", user_id).execute()
                )
                if res_saved.data and isinstance(res_saved.data, list):
                    for row in res_saved.data:
                        if isinstance(row, dict):
                            pid = row.get("playlist_id")
                            if pid:
                                clean = _canonicalize_playlist_id("", pid) or pid.strip()
                                if clean and clean not in clean_to_raw:
                                    clean_to_raw[clean] = pid
                                    clean_pids.append(clean)
            except Exception as e:
                logger.warning(f"Error querying saved_playlists in batch stats: {e}")

        # Also merge IDs from learning_progress JSONB
        if sb:
            try:
                res_lp = await asyncio.to_thread(
                    lambda: sb.table("learning_progress").select("completed_steps").eq("session_id", user_id).eq("skill_name", "saved_playlists").limit(1).execute()
                )
                if res_lp.data and isinstance(res_lp.data, list) and len(res_lp.data) > 0:
                    first_row = res_lp.data[0]
                    if isinstance(first_row, dict):
                        for pl in first_row.get("completed_steps", []):
                            if isinstance(pl, dict):
                                raw_id = pl.get("id") or pl.get("playlist_id") or ""
                                if raw_id:
                                    clean = _canonicalize_playlist_id(pl.get("playlist_url", ""), raw_id) or raw_id.strip()
                                    if clean and clean not in clean_to_raw:
                                        clean_to_raw[clean] = raw_id
                                        clean_pids.append(clean)
            except Exception as lp_err:
                logger.warning(f"Error reading JSONB in batch stats: {lp_err}")

    if not clean_pids:
        return {}

    # If database is unavailable, return explicit unavailable status
    if not sb:
        stats: Dict[str, dict] = {}
        for pid in clean_pids:
            stat_item = {
                "playlist_id": pid,
                "total_videos": None,
                "completed_videos": None,
                "progress_pct": None,
                "last_watched_at": None,
                "status": "unavailable",
            }
            stats[pid] = stat_item
            raw = clean_to_raw.get(pid)
            if raw and raw != pid:
                stats[raw] = stat_item
        return stats

    total_map: Dict[str, int] = {}
    found_in_saved: set[str] = set()
    vc_error = False

    # Query 1: Fetch stored video counts for all target clean_pids in ONE set-based IN query
    if _is_uuid(user_id):
        try:
            res_vc = await asyncio.to_thread(
                lambda: sb.table("saved_playlists").select("playlist_id, video_count").eq("user_id", user_id).in_("playlist_id", clean_pids).execute()
            )
            if res_vc.data and isinstance(res_vc.data, list):
                for row in res_vc.data:
                    if isinstance(row, dict):
                        pid = _canonicalize_playlist_id("", row.get("playlist_id")) or row.get("playlist_id")
                        found_in_saved.add(pid)
                        vc_str = str(row.get("video_count") or "")
                        m = re.search(r'\d+', vc_str)
                        if m:
                            total_map[pid] = int(m.group())
        except Exception as vc_err:
            logger.warning(f"Error fetching video_count in batch stats: {vc_err}")
            vc_error = True

    # Query 2: Fetch watched progress for all target clean_pids in ONE set-based IN query
    watched_counts: Dict[str, int] = defaultdict(int)
    found_in_progress: set[str] = set()
    last_watched_map: Dict[str, Optional[str]] = {}
    prog_error = False

    if _is_uuid(user_id):
        try:
            res_prog = await asyncio.to_thread(
                lambda: (
                    sb.table("video_progress")
                    .select("playlist_id, video_id, watched, completed_at, updated_at")
                    .eq("user_id", user_id)
                    .in_("playlist_id", clean_pids)
                    .execute()
                )
            )
            if res_prog.data and isinstance(res_prog.data, list):
                for row in res_prog.data:
                    if isinstance(row, dict):
                        pid = _canonicalize_playlist_id("", row.get("playlist_id")) or row.get("playlist_id")
                        found_in_progress.add(pid)
                        if row.get("watched") or row.get("completed_at"):
                            watched_counts[pid] += 1
                        upd = row.get("completed_at") or row.get("updated_at")
                        if upd and (pid not in last_watched_map or (last_watched_map[pid] and upd > last_watched_map[pid])):
                            last_watched_map[pid] = upd
        except Exception as prog_err:
            logger.warning(f"Error querying video_progress in batch stats: {prog_err}")
            prog_error = True

    # Query 3: Merge progress from learning_progress JSONB table (guests & dual persistence) in ONE query
    lp_error = False
    try:
        res_lp = await asyncio.to_thread(
            lambda: sb.table("learning_progress").select("completed_steps").eq("session_id", user_id).eq("skill_name", "saved_playlists").limit(1).execute()
        )
        if res_lp.data and isinstance(res_lp.data, list) and len(res_lp.data) > 0:
            first_row = res_lp.data[0]
            if isinstance(first_row, dict):
                for pl in first_row.get("completed_steps", []):
                    if isinstance(pl, dict):
                        raw_id = pl.get("id") or pl.get("playlist_id") or ""
                        clean = _canonicalize_playlist_id(pl.get("playlist_url", ""), raw_id) or raw_id
                        target_id = None
                        if clean in clean_to_raw:
                            target_id = clean
                        elif raw_id in clean_to_raw:
                            target_id = raw_id

                        if target_id:
                            found_in_saved.add(target_id)
                            videos = pl.get("videos", [])
                            if videos and isinstance(videos, list):
                                if target_id not in total_map or total_map[target_id] == 0:
                                    total_map[target_id] = len(videos)
                                jsonb_watched = sum(1 for v in videos if isinstance(v, dict) and (v.get("watched") or v.get("completed") or v.get("completed_at")))
                                watched_counts[target_id] = max(watched_counts[target_id], jsonb_watched)
                                if jsonb_watched > 0:
                                    found_in_progress.add(target_id)
                            elif pl.get("video_count") and (target_id not in total_map or total_map[target_id] == 0):
                                vc_str = str(pl.get("video_count"))
                                m = re.search(r'\d+', vc_str)
                                if m:
                                    total_map[target_id] = int(m.group())
    except Exception as lp_err:
        logger.warning(f"Error querying learning_progress in batch stats: {lp_err}")
        lp_error = True

    # Final assembly of stats dictionary distinguishing:
    # 1. available (genuine progress or genuine zero progress)
    # 2. missing (playlist not found in user's saved list or progress records)
    # 3. unavailable (database failure on progress/metadata queries)
    # 4. partial (metadata retrieved, but progress query failed)
    stats: Dict[str, dict] = {}
    for pid in clean_pids:
        # Check if progress could not be fetched due to DB error
        if prog_error:
            if pid in total_map:
                item_status = "partial"
                total = total_map[pid]
            else:
                item_status = "unavailable"
                total = None
            completed = None
            pct = None
            last_watched = None
        else:
            is_known = (pid in found_in_saved) or (pid in found_in_progress) or (pid in total_map)
            if is_known:
                total = total_map.get(pid, 0)
                completed = watched_counts.get(pid, 0)
                if completed > total and total > 0:
                    total = completed
                pct = round((completed / total) * 100) if total > 0 else 0
                item_status = "available"
                last_watched = last_watched_map.get(pid)
            else:
                total = 0
                completed = 0
                pct = 0
                item_status = "missing"
                last_watched = None

        stat_item = {
            "playlist_id": pid,
            "total_videos": total,
            "completed_videos": completed,
            "progress_pct": min(100, max(0, pct)) if pct is not None else None,
            "last_watched_at": last_watched,
            "status": item_status,
        }
        stats[pid] = stat_item
        raw = clean_to_raw.get(pid)
        if raw and raw != pid:
            stats[raw] = stat_item

    return stats


async def get_batch_playlist_stats(
    playlist_ids: Optional[list[str]],
    user_id: str,
    sb=None,
) -> dict:
    """
    SYS-11: Batch retrieve statistics (total_videos, completed_videos, progress_pct, last_watched_at)
    for multiple playlists in a single set-based query without N+1 query waterfalls.
    """
    sb = sb if sb is not None else _get_sb()
    if not sb or not user_id:
        return {"stats": {}, "count": 0, "status": "unavailable"}

    stats = await get_batch_playlist_stats_internal(playlist_ids, user_id, sb=sb)

    if not stats:
        batch_status = "available" if (playlist_ids is not None and len(playlist_ids) == 0) else "missing"
    else:
        statuses = {v.get("status") for v in stats.values()}
        if statuses == {"unavailable"}:
            batch_status = "unavailable"
        elif "unavailable" in statuses or "partial" in statuses:
            batch_status = "partial"
        else:
            batch_status = "available"

    return {"stats": stats, "count": len(stats), "status": batch_status}


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
    seen_sync = set()
    deduped_playlists = []
    for p in playlists_list:
        raw_id = p.get("id") or p.get("playlist_id") or ""
        clean_id = _canonicalize_playlist_id(p.get("playlist_url", ""), raw_id) or raw_id
        if clean_id and clean_id in seen_sync:
            continue
        if raw_id and raw_id in seen_sync:
            continue
        if clean_id:
            seen_sync.add(clean_id)
        if raw_id:
            seen_sync.add(raw_id)
        if clean_id:
            p["id"] = clean_id
            p["playlist_id"] = clean_id
        deduped_playlists.append(p)
    playlists_list = deduped_playlists

    # Phase 3 Entitlement Enforcement for sync_saved_playlists (prevent alternate route bypass)
    from backend.services.subscription_service import SubscriptionService
    _, is_premium = SubscriptionService.get_effective_plan(current_user_id)
    if not is_premium:
        limit = SubscriptionService.get_feature_limit(current_user_id, "saved_videos")
        if limit is not None and len(playlists_list) > limit:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={
                    "code": "LIMIT_REACHED",
                    "feature": "saved_videos",
                    "limit": limit,
                },
            )

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

            existing_lp = await asyncio.to_thread(
                lambda: sb.table("learning_progress").select("id").eq("session_id", current_user_id).eq("skill_name", "saved_playlists").limit(1).execute()
            )
            if existing_lp.data and len(existing_lp.data) > 0:
                await asyncio.to_thread(
                    lambda: sb.table("learning_progress").update(lp_row).eq("session_id", current_user_id).eq("skill_name", "saved_playlists").execute()
                )
            else:
                await asyncio.to_thread(
                    lambda: sb.table("learning_progress").insert(lp_row).execute()
                )

            # Record event in user_feedback analytics table
            try:
                await asyncio.to_thread(
                    lambda: sb.table("user_feedback").insert({
                        "user_id": current_user_id,
                        "action": "unsave",
                        "resource_title": f"{len(playlists_list)} playlists ({pct}% complete)",
                        "skill_name": "saved_playlists",
                    }).execute()
                )
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
        res = await asyncio.to_thread(
            lambda: (
                sb.table("learning_progress")
                .select("completed_steps, completion_pct")
                .eq("session_id", current_user_id)
                .eq("skill_name", "saved_playlists")
                .limit(1)
                .execute()
            )
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
    clean_playlist_id = _canonicalize_playlist_id("", playlist_id) or playlist_id.strip()
    info = await asyncio.to_thread(_resolve_playlist_info, clean_playlist_id, sb, user_id)
    target_yt_id = info.get("real_yt_id") or (clean_playlist_id if clean_playlist_id.startswith(("PL", "UU", "FL", "RD", "OLAK5uy_")) else "")
    target_vid_id = info.get("video_id") or (clean_playlist_id if re.match(r"^[a-zA-Z0-9_-]{11}$", clean_playlist_id) else "")

    videos = []
    page_token = None

    # Case A: YouTube Playlist Items
    if YOUTUBE_API_KEY and target_yt_id and target_yt_id.startswith(("PL", "UU", "FL", "RD", "OLAK5uy_")):
        async with httpx.AsyncClient(timeout=20, headers=YT_REQUEST_HEADERS) as client:
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

                    # Allowlist check: If video title clearly indicates technical/educational skill content, never filter
                    is_educational = bool(_LEARNING_SKILL.search(v_title))
                    if not is_educational:
                        is_prohibited = bool(_STRICT_PROHIBITED_TERMS.search(v_title))
                        if not is_prohibited and v_desc:
                            is_prohibited = bool(_STRICT_PROHIBITED_TERMS.search(v_desc[:400]))
                        if is_prohibited:
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
                async with httpx.AsyncClient(timeout=10, headers=YT_REQUEST_HEADERS) as client:
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

            async with httpx.AsyncClient(timeout=10, headers=YT_REQUEST_HEADERS) as client:
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
            existing_vc = str(info.get("video_count") or "").strip()
            current_vc = str(len(videos))
            # Idempotency guard: Only write to DB if video_count is missing or placeholder ("?", "0", "")
            # Never overwrite an existing positive count during a read request!
            if existing_vc in ("", "0", "?", "None"):
                try:
                    await asyncio.to_thread(
                        lambda: sb.table("saved_playlists").update({"video_count": current_vc}).eq("playlist_id", clean_playlist_id).eq("user_id", user_id).execute()
                    )
                except Exception:
                    pass

            try:
                res = await asyncio.to_thread(
                    lambda: (
                        sb.table("video_progress")
                        .select("video_id,watched,last_position,watch_time,completed_at,updated_at")
                        .eq("user_id", user_id)
                        .eq("playlist_id", clean_playlist_id)
                        .execute()
                    )
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
            res_lp = await asyncio.to_thread(
                lambda: sb.table("learning_progress").select("completed_steps").eq("session_id", user_id).eq("skill_name", "saved_playlists").limit(1).execute()
            )
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
