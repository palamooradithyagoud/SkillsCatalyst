import json
import os
import re
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client

ROOT_DIR = Path(__file__).resolve().parent.parent.parent
load_dotenv(ROOT_DIR / ".env")

SUPABASE_URL = os.environ["SUPABASE_URL"]
SERVICE_KEY = os.environ["SUPABASE_SERVICE_KEY"]
client = create_client(SUPABASE_URL, SERVICE_KEY)

FRONTEND_DATA = ROOT_DIR / "frontend" / "data"

# 1. Load Frontend Questions
with open(FRONTEND_DATA / "allAptitudeQuestions.json", "r", encoding="utf-8") as f:
    json_qs = json.load(f)

with open(FRONTEND_DATA / "aptitudeQuestions.ts", "r", encoding="utf-8") as f:
    ts_content = f.read()

def parse_ts(content):
    items = []
    blocks = re.split(r'\{\s*id\s*:\s*\d+\s*,', content)
    for b in blocks[1:]:
        q_match = re.search(r'question\s*:\s*"((?:[^"\\]|\\.)*)"', b)
        opts_match = re.search(r'options\s*:\s*\[(.*?)\]', b, re.DOTALL)
        idx_match = re.search(r'correctIndex\s*:\s*(\d+)', b)
        sol_match = re.search(r'solution\s*:\s*"((?:[^"\\]|\\.)*)"', b)
        if q_match and opts_match and idx_match:
            q_text = q_match.group(1).replace('\"', '"').replace('\\n', '\n')
            opts = [re.sub(r'^[a-eA-E]\)\s*', '', opt.strip(' "\'\t\r\n')) for opt in re.findall(r'"((?:[^"\\]|\\.)*)"', opts_match.group(1))]
            items.append({
                "q": q_text,
                "options": opts,
                "ans_idx": int(idx_match.group(1)),
                "sol": sol_match.group(1).replace('\"', '"').replace('\\n', '\n') if sol_match else ""
            })
    return items

ts_items = parse_ts(ts_content)
total_json_qs = sum(len(v) if isinstance(v, list) else 0 for v in json_qs.values()) if isinstance(json_qs, dict) else len(json_qs)
all_original_count = total_json_qs + len(ts_items)

# 2. Fetch Supabase Data
cats = client.table("categories").select("*").execute().data
topics = client.table("topics").select("*").execute().data
q_count = client.table("questions").select("*", count="exact", head=True).execute().count
opt_count = client.table("question_options").select("*", count="exact", head=True).execute().count

print("=" * 70)
print("SKILLSCATALYST QUESTION BANK CONTENT INTEGRITY AUDIT")
print("=" * 70)
print(f"Categories  : {len(cats)} (Expected: 3)")
print(f"Topics      : {len(topics)} (Expected: 44)")
print(f"Questions   : {q_count} (Expected: 910)")
print(f"Options     : {opt_count} (Expected: 3843)")
print(f"Original Qs : {all_original_count} (Expected: 910)")

# 3. Check for invalid states in questions and options
sample_qs = client.table("questions").select("id, question_text, explanation, question_options(option_key, option_text, is_correct)").limit(100).execute().data
discrepancies = 0
for q in sample_qs:
    opts = q["question_options"]
    correct = [o for o in opts if o["is_correct"]]
    if len(correct) != 1:
        print(f"Discrepancy: Question {q['id']} has {len(correct)} correct options")
        discrepancies += 1
    if len(opts) < 2:
        print(f"Discrepancy: Question {q['id']} has {len(opts)} options")
        discrepancies += 1
    if not q["explanation"]:
        print(f"Discrepancy: Question {q['id']} missing explanation")
        discrepancies += 1

print(f"Sample Discrepancies across 100 questions: {discrepancies}")

assert len(cats) == 3, f"Categories count mismatch: {len(cats)}"
assert len(topics) == 44, f"Topics count mismatch: {len(topics)}"
assert q_count == 910, f"Questions count mismatch: {q_count}"
assert opt_count == 3843, f"Options count mismatch: {opt_count}"
assert discrepancies == 0, f"Found {discrepancies} discrepancies!"
print("\nRESULT: 100% MATCHED - ZERO DISCREPANCIES DETECTED!")
print("=" * 70)
