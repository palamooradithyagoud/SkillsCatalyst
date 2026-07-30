import httpx
import re
import json

def test_gfg_all():
    handles = ["sandeep_jain", "adithyagoud", "tourist", "geeks"]
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    }
    
    with httpx.Client(headers=headers, follow_redirects=True, timeout=8.0) as client:
        for h in handles:
            print(f"\n--- Testing handle: {h} ---")
            # 1. GFG Practice API
            r1 = client.get(f"https://practiceapi.geeksforgeeks.org/api/v1/user/problems/user_profile/?handle={h}")
            print("GFG Practice API status:", r1.status_code)
            if r1.status_code == 200:
                print("Practice API response:", r1.text[:200])
                
            # 2. GFG Auth API
            r2 = client.get(f"https://authapi.geeksforgeeks.org/api/v1/users/{h}")
            print("GFG Auth API status:", r2.status_code)
            if r2.status_code == 200:
                print("Auth API response:", r2.text[:200])
                
            # 3. GFG HTML fetch
            r3 = client.get(f"https://www.geeksforgeeks.org/user/{h}/")
            print("GFG HTML status:", r3.status_code, "URL:", r3.url)
            # Search for numbers in HTML
            scores = re.findall(r'(\d+)\s*(?:Overall Coding Score|Problems Solved|Score|Solved)', r3.text, re.I)
            print("HTML scores found:", scores)

if __name__ == "__main__":
    test_gfg_all()
