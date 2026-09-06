"""
SkillsCatalyst - Learning Progress Service
Playback progress tracking, verification, resume, and dual persistence.
Phase 2.1 Modular Architecture
"""

import logging
from datetime import datetime, timezone
from typing import Optional, Dict, Any
from fastapi import HTTPException
from pydantic import BaseModel

from backend.services.learning.content_guard import _is_uuid, _extract_playlist_id

logger = logging.getLogger(__name__)


def _get_sb():
    """Retrieve Supabase client, respecting test patches on backend.routers.learning."""
    import sys
    lr = sys.modules.get("backend.routers.learning")
    if lr and hasattr(lr, "get_supabase"):
        try:
            return lr.get_supabase()
        except Exception:
            pass
    from backend.services.supabase_service import get_supabase
    return get_supabase()


# ── Pydantic Models ───────────────────────────────────────────────────────────
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
    """Fired when player detects >=75% of a video has been genuinely watched."""
    # user_id intentionally excluded — derived from JWT only
    playlist_id:   str
    video_id:      str
    watch_time:    int       # seconds actually watched (server-side validation)
    completed:     bool = True
    last_position: Optional[float] = 0.0


class MarkAllWatchedRequest(BaseModel):
    playlist_id: str
    watched:     bool = True


# ── Progress Business Logic ───────────────────────────────────────────────────

async def resume_progress(
    video_id: str,
    current_user_id: str,
    sb=None,
) -> Dict[str, Any]:
    """
    Fetches stored playback resume position and completed state for a video.
    """
    if sb is None:
        sb = _get_sb()
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


async def update_video_progress(
    req: VideoProgressRequest,
    current_user_id: str,
    sb=None,
) -> Dict[str, Any]:
    """Manual mark-as-watched/unwatched. Optionally saves position & watch_time."""
    user_id = current_user_id
    if not user_id:
        return {"success": True}
    if sb is None:
        sb = _get_sb()
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


async def save_video_progress(
    req: SaveProgressRequest,
    current_user_id: str,
    sb=None,
) -> Dict[str, Any]:
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

    if sb is None:
        sb = _get_sb()
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


async def complete_video(
    req: CompleteVideoRequest,
    current_user_id: str,
    sb=None,
) -> Dict[str, Any]:
    """
    Playback Progress Verification — auto-completion endpoint.
    Fired when player verifies >=75% of a video has been watched.
    """
    user_id = current_user_id
    if not user_id:
        return {"success": True, "playlist_stats": {"completed_videos": 0}}

    # Playback Progress Verification bounds check
    if req.watch_time < 0 or (req.last_position is not None and req.last_position < 0):
        raise HTTPException(status_code=400, detail="Invalid watch_time or last_position: must be >= 0")

    if sb is None:
        sb = _get_sb()
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


def _get_playlist_videos_fn():
    """Retrieve get_playlist_videos, respecting test patches on backend.routers.learning."""
    import sys
    lr = sys.modules.get("backend.routers.learning")
    if lr and hasattr(lr, "get_playlist_videos"):
        return lr.get_playlist_videos
    from backend.services.learning.playlist_service import get_playlist_videos
    return get_playlist_videos


async def mark_all_watched(
    req: MarkAllWatchedRequest,
    current_user_id: str,
    sb=None,
) -> Dict[str, Any]:
    """Mark all videos in a playlist as watched or unwatched in 1 click."""
    user_id = current_user_id
    if not user_id:
        return {"success": True, "count": 0}
    if sb is None:
        sb = _get_sb()
    if not sb:
        raise HTTPException(status_code=500, detail="Supabase not configured")

    clean_playlist_id = _extract_playlist_id(req.playlist_id, req.playlist_id)

    fetch_fn = _get_playlist_videos_fn()
    try:
        videos_res = await fetch_fn(playlist_id=clean_playlist_id, user_id=user_id, sb=sb)
    except TypeError:
        videos_res = await fetch_fn(playlist_id=clean_playlist_id, user_id=user_id)

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
