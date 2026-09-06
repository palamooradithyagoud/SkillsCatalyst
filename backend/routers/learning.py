"""
SkillsCatalyst - Learning Router
HTTP API Routing facade for educational search, playlists, progress, and AI roadmaps.
Phase 2.1 Modular Architecture:
All domain and business logic is decoupled into `backend.services.learning.*`.
"""

import logging
from typing import Optional

from fastapi import APIRouter, Query, Depends

from backend.services.supabase_service import get_supabase
from backend.services.auth_service import get_current_user_id, get_session_or_user_id
from backend.config import YOUTUBE_API_KEY
from backend.services.rate_limiter import enforce_rate_limit, RATE_LIMIT_SEARCH_RPM

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/learning", tags=["learning"])

# ---------------------------------------------------------------------------
# Content Guard (Extracted to backend.services.learning.content_guard)
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

# ---------------------------------------------------------------------------
# Search & Ranking (Extracted to backend.services.learning.search_service)
# ---------------------------------------------------------------------------
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

# ---------------------------------------------------------------------------
# Playlist Service (Extracted to backend.services.learning.playlist_service)
# ---------------------------------------------------------------------------
from backend.services.learning.playlist_service import (
    SavePlaylistRequest,
    SyncSavedPlaylistsRequest,
    FALLBACK_EDUCATIONAL_VIDEO_IDS,
    _generate_fallback_playlist_videos,
    _resolve_playlist_info,
    save_playlist as _save_playlist_svc,
    unsave_playlist as _unsave_playlist_svc,
    get_saved_playlists as _get_saved_playlists_svc,
    sync_saved_playlists as _sync_saved_playlists_svc,
    get_saved_playlists_jsonb as _get_saved_playlists_jsonb_svc,
    get_playlist_videos as _get_playlist_videos_svc,
)

# ---------------------------------------------------------------------------
# Progress Service (Extracted to backend.services.learning.progress_service)
# ---------------------------------------------------------------------------
from backend.services.learning.progress_service import (
    VideoProgressRequest,
    SaveProgressRequest,
    CompleteVideoRequest,
    MarkAllWatchedRequest,
    resume_progress as _resume_progress_svc,
    update_video_progress as _update_video_progress_svc,
    save_video_progress as _save_video_progress_svc,
    complete_video as _complete_video_svc,
    mark_all_watched as _mark_all_watched_svc,
)

# ---------------------------------------------------------------------------
# Roadmap Service (Extracted to backend.services.learning.roadmap_service)
# ---------------------------------------------------------------------------
from backend.services.learning.roadmap_service import (
    RoadmapRequest,
    generate_skill_roadmap as _generate_skill_roadmap_svc,
)


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
    """Save playlist to library with dual persistence (relational + JSONB fallback)."""
    return await _save_playlist_svc(req, current_user_id, sb=get_supabase())


@router.delete("/save/{playlist_id}")
async def unsave_playlist(
    playlist_id: str,
    user_id: str = Depends(get_session_or_user_id)
):
    """Remove playlist from library."""
    return await _unsave_playlist_svc(playlist_id, user_id, sb=get_supabase())


@router.get("/saved")
async def get_saved_playlists(user_id: str = Depends(get_session_or_user_id)):
    """Fetch saved playlists for user."""
    return await _get_saved_playlists_svc(user_id, sb=get_supabase())


@router.post("/sync-saved-playlists")
async def sync_saved_playlists(
    req: SyncSavedPlaylistsRequest,
    current_user_id: str = Depends(get_session_or_user_id)
):
    """Guest session to authenticated account playlist migration sync."""
    return await _sync_saved_playlists_svc(req, current_user_id, sb=get_supabase())


@router.get("/get-saved-playlists")
async def get_saved_playlists_jsonb(current_user_id: str = Depends(get_session_or_user_id)):
    """Compatibility endpoint for guest JSONB saved playlists."""
    return await _get_saved_playlists_jsonb_svc(current_user_id, sb=get_supabase())


# ── Video List ────────────────────────────────────────────────────────────────
@router.get("/playlist-videos")
async def get_playlist_videos(
    playlist_id: str = Query(..., description="YouTube playlist list= ID"),
    user_id:     str = Depends(get_session_or_user_id),
):
    """Fetch playlist videos from YouTube API + merge progress/resume data from Supabase.
    Delegates to backend.services.learning.playlist_service.
    """
    return await _get_playlist_videos_svc(playlist_id, user_id, sb=get_supabase())


# ── Video Progress Endpoints ──────────────────────────────────────────────────
@router.get("/resume-progress/{video_id}")
async def resume_progress(
    video_id: str,
    current_user_id: str = Depends(get_session_or_user_id)
):
    """
    Fetches stored playback resume position and completed state for a video.
    Delegates to backend.services.learning.progress_service.
    """
    return await _resume_progress_svc(video_id, current_user_id, sb=get_supabase())


@router.post("/video-progress")
async def update_video_progress(
    req: VideoProgressRequest,
    current_user_id: str = Depends(get_session_or_user_id)
):
    """Manual mark-as-watched/unwatched. Optionally saves position & watch_time.
    Delegates to backend.services.learning.progress_service.
    """
    return await _update_video_progress_svc(req, current_user_id, sb=get_supabase())


@router.post("/save-progress")
async def save_video_progress(
    req: SaveProgressRequest,
    current_user_id: str = Depends(get_session_or_user_id)
):
    """
    Playback Progress Verification — periodic resume save (every 10s).
    Validates position sanity & watch_time without touching `watched` status.
    Supports authenticated users (video_progress table) and guests (learning_progress JSONB).
    Delegates to backend.services.learning.progress_service.
    """
    return await _save_video_progress_svc(req, current_user_id, sb=get_supabase())


@router.post("/complete-video")
@router.post("/mark-video-complete")
async def complete_video(
    req: CompleteVideoRequest,
    current_user_id: str = Depends(get_session_or_user_id)
):
    """
    Playback Progress Verification — auto-completion endpoint.
    Fired when player verifies >=75% of a video has been watched.
    Delegates to backend.services.learning.progress_service.
    """
    return await _complete_video_svc(req, current_user_id, sb=get_supabase())


@router.post("/mark-all-watched")
async def mark_all_watched(
    req: MarkAllWatchedRequest,
    current_user_id: str = Depends(get_session_or_user_id)
):
    """Mark all videos in a playlist as watched or unwatched in 1 click.
    Delegates to backend.services.learning.progress_service.
    """
    return await _mark_all_watched_svc(req, current_user_id, sb=get_supabase())


# ── AI LLM Roadmap Generation ──────────────────────────────────────────────────
@router.post("/roadmap")
async def generate_skill_roadmap(req: RoadmapRequest):
    """
    Tier 3 Resolution: Generate a 5-tier structured skill roadmap via Groq AI (Llama-3.3 70B).
    Delegates to backend.services.learning.roadmap_service.
    """
    return await _generate_skill_roadmap_svc(req)


# ── Explicit Public Exports (100% Backward Compatibility) ─────────────────────
__all__ = [
    # Router
    "router",
    # Service client & auth re-exports
    "get_supabase",
    "get_current_user_id",
    "get_session_or_user_id",
    "YOUTUBE_API_KEY",
    # Content guard
    "_STRICT_PROHIBITED_TERMS",
    "_LEARNING_OFFTOPIC",
    "_LEARNING_SKILL",
    "_ENTERTAINMENT_TITLE_BLOCKLIST",
    "_validate_skill_query",
    "_is_skill_query",
    "_is_uuid",
    "_filter_skill_playlists",
    "_extract_youtube_ids",
    "_extract_playlist_id",
    # Search & ranking
    "DATA_DIR",
    "TECH_CONFIG",
    "CSV_TOPIC_MAP",
    "LEVEL_MAP",
    "REPUTABLE_CHANNELS",
    "QUALITY_KEYWORDS",
    "SCORE_CSV_SOURCE_BOOST",
    "SCORE_EXACT_TECH_MATCH",
    "SCORE_COMPETING_TECH_PENALTY",
    "SCORE_DSA_BOOST",
    "SCORE_EXACT_LANG_MATCH",
    "SCORE_HINGLISH_LANG_MATCH",
    "SCORE_ENGLISH_MIX_MATCH",
    "SCORE_LANG_MISMATCH_PENALTY",
    "SCORE_EXACT_TITLE_RELEVANCE",
    "SCORE_ALL_WORDS_MATCH",
    "SCORE_ANY_WORD_MATCH",
    "SCORE_REPUTABLE_CHANNEL",
    "SCORE_QUALITY_KEYWORD_TITLE",
    "SCORE_QUALITY_KEYWORD_DESC",
    "_first",
    "_parse_csv",
    "_detect_query_language",
    "_detect_primary_tech",
    "_filter_by_language",
    "_search_csv_playlists",
    "_search_youtube",
    "_score_and_rank_playlists",
    "search_learning_content",
    "search_skill",
    # Playlist service
    "SavePlaylistRequest",
    "SyncSavedPlaylistsRequest",
    "FALLBACK_EDUCATIONAL_VIDEO_IDS",
    "_generate_fallback_playlist_videos",
    "_resolve_playlist_info",
    "save_playlist",
    "unsave_playlist",
    "get_saved_playlists",
    "sync_saved_playlists",
    "get_saved_playlists_jsonb",
    "get_playlist_videos",
    # Progress service
    "VideoProgressRequest",
    "SaveProgressRequest",
    "CompleteVideoRequest",
    "MarkAllWatchedRequest",
    "resume_progress",
    "update_video_progress",
    "save_video_progress",
    "complete_video",
    "mark_all_watched",
    # Roadmap service
    "RoadmapRequest",
    "generate_skill_roadmap",
]
