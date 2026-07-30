import re
import httpx
import asyncio

def extract_username(url_or_handle: str, platform: str) -> str:
    """Extract clean username from full URL or handle string."""
    if not url_or_handle:
        return ""
    text = url_or_handle.strip().rstrip("/")
    if "://" in text:
        parts = text.split("/")
        return parts[-1]
    return text

async def fetch_leetcode_stats(handle_or_url: str) -> dict:
    username = extract_username(handle_or_url, "leetcode")
    if not username:
        return {"configured": False}
    
    url = "https://leetcode.com/graphql"
    query = """
    query getUserProfile($username: String!) {
      matchedUser(username: $username) {
        username
        submitStats: submitStatsGlobal {
          acSubmissionNum {
            difficulty
            count
          }
        }
        profile {
          ranking
          reputation
        }
      }
    }
    """
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.post(
                url,
                json={"query": query, "variables": {"username": username}},
                headers={
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                    "Content-Type": "application/json",
                    "Referer": f"https://leetcode.com/{username}/"
                }
            )
            if resp.status_code == 200:
                data = resp.json().get("data", {}).get("matchedUser")
                if data:
                    stats = data.get("submitStats", {}).get("acSubmissionNum", [])
                    total_solved = 0
                    easy_solved = 0
                    medium_solved = 0
                    hard_solved = 0
                    for s in stats:
                        diff = s.get("difficulty")
                        cnt = s.get("count", 0)
                        if diff == "All":
                            total_solved = cnt
                        elif diff == "Easy":
                            easy_solved = cnt
                        elif diff == "Medium":
                            medium_solved = cnt
                        elif diff == "Hard":
                            hard_solved = cnt
                    
                    ranking = data.get("profile", {}).get("ranking", 0)
                    return {
                        "configured": True,
                        "username": username,
                        "url": f"https://leetcode.com/{username}",
                        "total_solved": total_solved,
                        "easy_solved": easy_solved,
                        "medium_solved": medium_solved,
                        "hard_solved": hard_solved,
                        "ranking": ranking,
                        "badge": f"{total_solved} Solved",
                        "summary": f"{total_solved} Solved | Easy: {easy_solved}, Med: {medium_solved}, Hard: {hard_solved}"
                    }
    except Exception as e:
        print(f"LeetCode error: {e}")
    
    return {"configured": True, "username": username, "url": f"https://leetcode.com/{username}", "summary": f"User: {username}"}

async def fetch_github_stats(handle_or_url: str) -> dict:
    username = extract_username(handle_or_url, "github")
    if not username:
        return {"configured": False}
    
    url = f"https://api.github.com/users/{username}"
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.get(url, headers={"User-Agent": "Mozilla/5.0"})
            if resp.status_code == 200:
                data = resp.json()
                repos = data.get("public_repos", 0)
                followers = data.get("followers", 0)
                
                # Fetch repos stars
                stars = 0
                repos_resp = await client.get(f"https://api.github.com/users/{username}/repos?per_page=100", headers={"User-Agent": "Mozilla/5.0"})
                if repos_resp.status_code == 200:
                    repos_list = repos_resp.json()
                    if isinstance(repos_list, list):
                        stars = sum(r.get("stargazers_count", 0) for r in repos_list)
                
                return {
                    "configured": True,
                    "username": username,
                    "url": f"https://github.com/{username}",
                    "public_repos": repos,
                    "followers": followers,
                    "total_stars": stars,
                    "badge": f"{repos} Repos",
                    "summary": f"{repos} Public Repos | {stars} Stars | {followers} Followers"
                }
    except Exception as e:
        print(f"GitHub error: {e}")
    
    return {"configured": True, "username": username, "url": f"https://github.com/{username}", "summary": f"User: {username}"}

async def fetch_codeforces_stats(handle_or_url: str) -> dict:
    username = extract_username(handle_or_url, "codeforces")
    if not username:
        return {"configured": False}
    
    url = f"https://codeforces.com/api/user.info?handles={username}"
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.get(url, headers={"User-Agent": "Mozilla/5.0"})
            if resp.status_code == 200:
                result = resp.json().get("result", [])
                if result:
                    user_data = result[0]
                    rating = user_data.get("rating", 0)
                    max_rating = user_data.get("maxRating", 0)
                    rank = user_data.get("rank", "unrated")
                    
                    return {
                        "configured": True,
                        "username": username,
                        "url": f"https://codeforces.com/profile/{username}",
                        "rating": rating,
                        "max_rating": max_rating,
                        "rank": rank,
                        "badge": f"{rating} Rating",
                        "summary": f"Rating: {rating} ({rank.capitalize()}) | Max: {max_rating}"
                    }
    except Exception as e:
        print(f"Codeforces error: {e}")
    
    return {"configured": True, "username": username, "url": f"https://codeforces.com/profile/{username}", "summary": f"Handle: {username}"}

async def fetch_codechef_stats(handle_or_url: str) -> dict:
    username = extract_username(handle_or_url, "codechef")
    if not username:
        return {"configured": False}
    
    url = f"https://codechef-api.vercel.app/handle/{username}"
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.get(url, headers={"User-Agent": "Mozilla/5.0"})
            if resp.status_code == 200:
                data = resp.json()
                if data.get("success"):
                    rating = data.get("currentRating", 0)
                    stars = data.get("stars", "1★")
                    global_rank = data.get("globalRank", 0)
                    return {
                        "configured": True,
                        "username": username,
                        "url": f"https://www.codechef.com/users/{username}",
                        "rating": rating,
                        "stars": stars,
                        "global_rank": global_rank,
                        "badge": f"{stars} ({rating})",
                        "summary": f"Rating: {rating} ({stars}) | Global Rank: #{global_rank}"
                    }
    except Exception as e:
        print(f"CodeChef error: {e}")
    
    return {"configured": True, "username": username, "url": f"https://www.codechef.com/users/{username}", "summary": f"User: {username}"}

async def fetch_gfg_stats(handle_or_url: str) -> dict:
    username = extract_username(handle_or_url, "geeksforgeeks")
    if not username:
        return {"configured": False}
    
    url = f"https://geeks-for-geeks-api.vercel.app/user/{username}"
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.get(url, headers={"User-Agent": "Mozilla/5.0"})
            if resp.status_code == 200:
                data = resp.json()
                score = data.get("overall_coding_score", 0)
                solved = data.get("total_problems_solved", 0)
                return {
                    "configured": True,
                    "username": username,
                    "url": f"https://www.geeksforgeeks.org/user/{username}/",
                    "coding_score": score,
                    "total_solved": solved,
                    "badge": f"{solved} Solved",
                    "summary": f"{solved} Solved | Score: {score}"
                }
    except Exception as e:
        print(f"GFG error: {e}")
    
    return {"configured": True, "username": username, "url": f"https://www.geeksforgeeks.org/user/{username}/", "summary": f"User: {username}"}

async def fetch_hackerrank_stats(handle_or_url: str) -> dict:
    username = extract_username(handle_or_url, "hackerrank")
    if not username:
        return {"configured": False}
    
    return {
        "configured": True,
        "username": username,
        "url": f"https://www.hackerrank.com/profile/{username}",
        "badge": "Active Hacker",
        "summary": f"Profile Linked: @{username}"
    }

async def main():
    lc = await fetch_leetcode_stats("https://leetcode.com/adithya")
    print("LeetCode Result:", lc)
    gh = await fetch_github_stats("octocat")
    print("GitHub Result:", gh)
    cf = await fetch_codeforces_stats("tourist")
    print("Codeforces Result:", cf)

if __name__ == "__main__":
    asyncio.run(main())
