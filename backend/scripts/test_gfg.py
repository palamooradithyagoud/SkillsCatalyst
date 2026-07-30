import httpx
import re

def inspect_gfg_profile(handle):
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    }
    url = f"https://www.geeksforgeeks.org/profile/{handle}"
    with httpx.Client(headers=headers, follow_redirects=True, timeout=10.0) as client:
        resp = client.get(url)
        html = resp.text
        print(f"URL: {resp.url}, Length: {len(html)}")
        
        # Search for stats patterns
        stats = re.findall(r'([A-Za-z\s]+)\s*:\s*(\d+)', html)
        print("Sample stats found:", stats[:10])
        
        # Search for problem solved matches
        solved_matches = re.findall(r'(\d+)\s*(?:Problems|Solved|Coding)', html, re.IGNORECASE)
        print("Solved matches:", solved_matches[:10])
        
        # Print a snippet around any div with numbers
        divs = re.findall(r'<div[^>]*>([^<]*?\d+[^<]*?)</div>', html)
        print("Div text with numbers:", divs[:10])

if __name__ == "__main__":
    inspect_gfg_profile("adithyagoud")
