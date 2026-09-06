"""
SkillsCatalyst - Learning Content Guard & URL Extraction
Phase 2.1 Modular Architecture

Zero-tolerance filters and validation for educational queries,
plus YouTube ID parsing and UUID helpers.
"""

import re
import uuid
import logging

logger = logging.getLogger(__name__)

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
