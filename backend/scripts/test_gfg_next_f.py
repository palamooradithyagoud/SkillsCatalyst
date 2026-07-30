import httpx
import re
import json

def parse_gfg_next_f(handle):
    url = f"https://www.geeksforgeeks.org/profile/{handle}"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    }
    r = httpx.get(url, headers=headers, follow_redirects=True)
    html = r.text
    print(f"Parsing GFG for @{handle}...")
    
    # Find all self.__next_f.push calls
    pushes = re.findall(r'self\.__next_f\.push\((.*?)\)</script>', html, re.DOTALL)
    print(f"Found {len(pushes)} next_f.push scripts.")
    
    full_str = "".join(pushes)
    
    # Search for stats patterns in the full_str
    # Search for numbers after keys like score, solved, total_problems_solved, coding_score
    solved_match = re.search(r'total_problems_solved["\']?\s*:\s*(\d+)', full_str, re.I) or \
                   re.search(r'problems_solved["\']?\s*:\s*(\d+)', full_str, re.I) or \
                   re.search(r'problemsSolved["\']?\s*:\s*(\d+)', full_str, re.I) or \
                   re.search(r'solved["\']?\s*:\s*(\d+)', full_str, re.I)
                   
    score_match = re.search(r'coding_score["\']?\s*:\s*(\d+)', full_str, re.I) or \
                  re.search(r'overall_coding_score["\']?\s*:\s*(\d+)', full_str, re.I) or \
                  re.search(r'score["\']?\s*:\s*(\d+)', full_str, re.I)
                  
    rank_match = re.search(r'institute_rank["\']?\s*:\s*["\']?(\d+)', full_str, re.I) or \
                 re.search(r'rank["\']?\s*:\s*["\']?(\d+)', full_str, re.I)

    print("Result -> Solved:", solved_match.group(1) if solved_match else None)
    print("Result -> Score:", score_match.group(1) if score_match else None)
    print("Result -> Rank:", rank_match.group(1) if rank_match else None)

    # Print any key-value pairs matching integers
    pairs = re.findall(r'"([a-zA-Z0-9_]*score[a-zA-Z0-9_]*)"\s*:\s*(\d+)', full_str, re.I)
    print("All score pairs:", pairs)
    
    pairs_solved = re.findall(r'"([a-zA-Z0-9_]*solved[a-zA-Z0-9_]*)"\s*:\s*(\d+)', full_str, re.I)
    print("All solved pairs:", pairs_solved)

if __name__ == "__main__":
    parse_gfg_next_f("sandeep_jain")
    parse_gfg_next_f("adithyagoud")
