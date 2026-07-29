import httpx
from backend.config import YOUTUBE_API_KEY

YOUTUBE_API_URL = "https://www.googleapis.com/youtube/v3"

async def fetch_playlist_videos(playlist_id: str, max_results: int = 10):
    if not YOUTUBE_API_KEY:
        return {"error": "YouTube API key not configured"}
    
    url = f"{YOUTUBE_API_URL}/playlistItems"
    params = {
        "part": "snippet,contentDetails",
        "playlistId": playlist_id,
        "maxResults": max_results,
        "key": YOUTUBE_API_KEY
    }
    async with httpx.AsyncClient() as client:
        try:
            res = await client.get(url, params=params)
            res.raise_for_status()
            return res.json()
        except Exception as e:
            return {"error": str(e)}

async def search_youtube_videos(query: str, max_results: int = 25):
    if not YOUTUBE_API_KEY:
        return {"error": "YouTube API key not configured"}
    
    url = f"{YOUTUBE_API_URL}/search"
    params = {
        "part": "snippet",
        "q": query,
        "type": "video",
        "maxResults": max_results,
        "key": YOUTUBE_API_KEY
    }
    async with httpx.AsyncClient() as client:
        try:
            res = await client.get(url, params=params)
            res.raise_for_status()
            return res.json()
        except Exception as e:
            return {"error": str(e)}
