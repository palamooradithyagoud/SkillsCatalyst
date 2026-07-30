import httpx
import re
import json

def find_gfg_json():
    url = "https://www.geeksforgeeks.org/user/sandeep_jain/"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    }
    r = httpx.get(url, headers=headers, follow_redirects=True)
    html = r.text
    print("Final URL:", r.url)
    print("Length:", len(html))
    
    # Search for all JSON object strings containing keys like score, solved, rank, rating
    json_objects = re.findall(r'(\{[^{}]*?"score"[^{}]*?\})', html, re.I)
    print("JSON objects with 'score':", json_objects[:5])
    
    json_objects_2 = re.findall(r'(\{[^{}]*?"solved"[^{}]*?\})', html, re.I)
    print("JSON objects with 'solved':", json_objects_2[:5])

    # Search for any JSON scripts
    scripts = re.findall(r'<script[^>]*>(.*?)</script>', html, re.DOTALL)
    for i, s in enumerate(scripts):
        if "sandeep_jain" in s or "score" in s.lower() or "solved" in s.lower():
            print(f"Script #{i} contains keywords! Length: {len(s)}")
            print(s[:300])

if __name__ == "__main__":
    find_gfg_json()
