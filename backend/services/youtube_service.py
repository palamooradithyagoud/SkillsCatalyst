import httpx
import re
from backend.config import YOUTUBE_API_KEY

YOUTUBE_API_URL = "https://www.googleapis.com/youtube/v3"

# Explicit adult/NSFW/romance/songs/entertainment filter for video queries and results
_BLOCKED_TERMS = re.compile(
    r"\b("
    # Adult / NSFW / Porn / Erotic
    r"porn|xxx|sex|sexy|erotic|erotica|nude|nudity|naked|boobs|cleavage|bikini|18\+|nsfw|adult|"
    r"bhabhi|aunty|hot.?scene|hot.?video|hot.?clip|hot.?girl|hot.?actress|sensual|lust|lusty|"
    r"strip|cam|onlyfans|playboy|hentai|ecchi|r18|uncensored|leaked.?video|mms|"
    # Romance / Dating / Sensual
    r"romance|romantic|hot.?romance|hot.?love|love.?story|kiss|kissing|lip.?lock|bed.?scene|"
    r"romance.?scene|dating|hookup|couple.?goals|crush|flirt|breakup|affair|girlfriend|boyfriend|"
    # Music / Songs / Tracks
    r"song|songs|music|album|albums|audio|track|tracks|lyrics|singer|singers|band|dj|remix|"
    r"lofi|lo-fi|mashup|gaana|mp3|soundtrack|official.?song|melody|pop|rap|hiphop|rock|bgm|"
    r"ringtone|tune|karaoke|dance|choreography|party.?song|item.?song|sad.?song|"
    r"official.?music.?video|lyric.?video|full.?song|audio.?song|"
    # Entertainment / Vlogs / Shows
    r"movie|movies|film|films|cinema|series|web.?series|netflix|amazon.?prime|disney|hotstar|ott|"
    r"trailer|teaser|comedy|prank|vlog|vlogs|vlogger|reality.?show|roast|gaming|mukbang|reaction"
    r")\b",
    re.IGNORECASE,
)

async def fetch_playlist_videos(playlist_id: str, max_results: int = 50):
    if not YOUTUBE_API_KEY:
        return {"error": "YouTube API key not configured"}
    
    url = f"{YOUTUBE_API_URL}/playlistItems"
    params = {
        "part": "snippet,contentDetails",
        "playlistId": playlist_id,
        "maxResults": max_results,
        "key": YOUTUBE_API_KEY,
    }
    async with httpx.AsyncClient() as client:
        try:
            res = await client.get(url, params=params)
            res.raise_for_status()
            data = res.json()
            # Post-filter playlist videos for educational safety
            items = data.get("items", [])
            clean_items = []
            for item in items:
                snippet = item.get("snippet", {})
                title = snippet.get("title", "")
                desc = snippet.get("description", "")
                # Skip private / deleted videos
                if title in ("Private video", "Deleted video"):
                    continue
                combined_text = f"{title} {desc}".lower()
                if not _BLOCKED_TERMS.search(combined_text):
                    clean_items.append(item)
            data["items"] = clean_items
            return data
        except Exception as e:
            return {"error": str(e)}

async def search_youtube_videos(query: str, max_results: int = 25):
    if not YOUTUBE_API_KEY:
        return {"error": "YouTube API key not configured"}
    
    # Strictly enforce educational query context
    if _BLOCKED_TERMS.search(query):
        return {"items": [], "pageInfo": {"totalResults": 0}}

    url = f"{YOUTUBE_API_URL}/search"
    params = {
        "part": "snippet",
        "q": f"{query} tutorial coding course programming educational",
        "type": "video",
        "maxResults": max_results,
        "safeSearch": "strict",
        "key": YOUTUBE_API_KEY
    }
    async with httpx.AsyncClient() as client:
        try:
            res = await client.get(url, params=params)
            res.raise_for_status()
            data = res.json()
            # Post-filter items
            items = data.get("items", [])
            clean_items = []
            for item in items:
                snippet = item.get("snippet", {})
                title = snippet.get("title", "")
                desc = snippet.get("description", "")
                if title in ("Private video", "Deleted video"):
                    continue
                combined_text = f"{title} {desc}".lower()
                if not _BLOCKED_TERMS.search(combined_text):
                    clean_items.append(item)
            data["items"] = clean_items
            return data
        except Exception as e:
            return {"error": str(e)}
