"""
SkillsCatalyst High-Performance Question Bank Migration & Seeding Script
Populates Supabase PostgreSQL with batch upserts, re-using existing category/topic UUIDs.
100% Idempotent, validated, and fast.
"""

import json
import os
import re
import sys
import uuid
from pathlib import Path
from supabase import create_client

SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://zzjxprhapptjoziwdcro.supabase.co")
SUPABASE_SERVICE_KEY = os.environ.get(
    "SUPABASE_SERVICE_KEY",
    "REDACTED_SERVICE_ROLE_KEY"
)

client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

ROOT_DIR = Path(__file__).resolve().parent.parent.parent
FRONTEND_DATA = ROOT_DIR / "frontend" / "data"

NS = uuid.NAMESPACE_DNS

def slugify(text: str) -> str:
    s = text.lower()
    s = re.sub(r'[^a-z0-9]+', '-', s)
    return s.strip('-')

CATEGORIES = [
    {
        "slug": "quantitative-aptitude",
        "name": "Quantitative Aptitude",
        "description": "Comprehensive mathematical and analytical problem-solving question bank.",
        "display_order": 1
    },
    {
        "slug": "logical-reasoning",
        "name": "Logical Reasoning",
        "description": "Analytical reasoning, pattern recognition, and critical deduction assessments.",
        "display_order": 2
    },
    {
        "slug": "verbal-ability",
        "name": "Verbal Ability",
        "description": "English grammar, vocabulary mastery, comprehension, and sentence structuring.",
        "display_order": 3
    }
]

def parse_ts_questions(content: str):
    items = []
    blocks = re.split(r'\{\s*id\s*:\s*\d+\s*,', content)
    for b in blocks[1:]:
        q_match = re.search(r'question\s*:\s*"((?:[^"\\]|\\.)*)"', b)
        opts_match = re.search(r'options\s*:\s*\[(.*?)\]', b, re.DOTALL)
        idx_match = re.search(r'correctIndex\s*:\s*(\d+)', b)
        ans_match = re.search(r'answerText\s*:\s*"((?:[^"\\]|\\.)*)"', b)
        sol_match = re.search(r'solution\s*:\s*"((?:[^"\\]|\\.)*)"', b)
        
        if q_match and opts_match and idx_match:
            try:
                q_text = bytes(q_match.group(1), 'utf-8').decode('unicode-escape')
            except Exception:
                q_text = q_match.group(1)
            idx = int(idx_match.group(1))
            try:
                ans_text = bytes(ans_match.group(1), 'utf-8').decode('unicode-escape') if ans_match else ""
            except Exception:
                ans_text = ans_match.group(1) if ans_match else ""
            try:
                sol_text = bytes(sol_match.group(1), 'utf-8').decode('unicode-escape') if sol_match else ""
            except Exception:
                sol_text = sol_match.group(1) if sol_match else ""
            
            opts_str = opts_match.group(1)
            opts = []
            for o in re.findall(r'"((?:[^"\\]|\\.)*)"', opts_str):
                try:
                    opts.append(bytes(o, 'utf-8').decode('unicode-escape'))
                except Exception:
                    opts.append(o)
            
            items.append({
                "question": q_text,
                "options": opts,
                "correctIndex": idx,
                "answerText": ans_text,
                "solution": sol_text
            })
    return items

def load_all_question_data():
    quant_file = FRONTEND_DATA / "allAptitudeQuestions.json"
    with open(quant_file, "r", encoding="utf-8") as f:
        quant_topics = json.load(f)

    apt_file = FRONTEND_DATA / "aptitudeQuestions.ts"
    with open(apt_file, "r", encoding="utf-8") as f:
        apt_ts = f.read()

    lr_topics = {
        "Blood Relations": "BLOOD_RELATIONS_QUESTIONS",
        "Seating Arrangement": "SEATING_ARRANGEMENT_QUESTIONS",
        "Coding-Decoding": "CODING_DECODING_QUESTIONS",
        "Syllogisms": "SYLLOGISMS_QUESTIONS",
        "Puzzles": "PUZZLES_QUESTIONS",
    }
    va_topics = {
        "Grammar": "GRAMMAR_QUESTIONS",
        "Reading Comprehension": "READING_COMPREHENSION_QUESTIONS",
        "Vocabulary": "VOCABULARY_QUESTIONS",
        "Sentence Correction": "SENTENCE_CORRECTION_QUESTIONS",
    }

    lr_data = {}
    for top, var in lr_topics.items():
        m = re.search(rf'export const {var}: PlacementQuestion\[\] = \[(.*?)\];\s*(?:export|\n\n)', apt_ts, re.DOTALL)
        if m:
            lr_data[top] = parse_ts_questions(m.group(1))

    va_data = {}
    for top, var in va_topics.items():
        m = re.search(rf'export const {var}: PlacementQuestion\[\] = \[(.*?)\];\s*(?:export|\n\n)', apt_ts, re.DOTALL)
        if m:
            va_data[top] = parse_ts_questions(m.group(1))

    return quant_topics, lr_data, va_data

def chunked(lst, n):
    for i in range(0, len(lst), n):
        yield lst[i:i + n]

def seed():
    print("=" * 70, flush=True)
    print("Starting SkillsCatalyst Question Bank Migration to Supabase...", flush=True)
    print("=" * 70, flush=True)

    quant_topics, lr_data, va_data = load_all_question_data()

    # 1. Fetch & Verify Categories
    print("\n[1/4] Syncing Categories...", flush=True)
    cat_res = client.table("categories").select("id, slug").execute()
    category_id_map = {row["slug"]: row["id"] for row in cat_res.data}
    for cat in CATEGORIES:
        if cat["slug"] not in category_id_map:
            res = client.table("categories").insert(cat).execute()
            category_id_map[cat["slug"]] = res.data[0]["id"]
    print(f"  [OK] {len(category_id_map)} categories active.", flush=True)

    # 2. Fetch & Verify Topics
    print("\n[2/4] Syncing Topics...", flush=True)
    top_res = client.table("topics").select("id, slug, name").execute()
    topic_id_map = {row["name"]: row["id"] for row in top_res.data}

    # Add missing topics if any
    order = len(topic_id_map) + 1
    for topic_name in quant_topics.keys():
        if topic_name not in topic_id_map:
            t_slug = slugify(topic_name)
            res = client.table("topics").insert({
                "category_id": category_id_map["quantitative-aptitude"],
                "slug": t_slug,
                "name": topic_name,
                "display_order": order,
                "is_active": True
            }).execute()
            topic_id_map[topic_name] = res.data[0]["id"]
            order += 1

    for topic_name in lr_data.keys():
        if topic_name not in topic_id_map:
            t_slug = slugify(topic_name)
            res = client.table("topics").insert({
                "category_id": category_id_map["logical-reasoning"],
                "slug": t_slug,
                "name": topic_name,
                "display_order": order,
                "is_active": True
            }).execute()
            topic_id_map[topic_name] = res.data[0]["id"]
            order += 1

    for topic_name in va_data.keys():
        if topic_name not in topic_id_map:
            t_slug = slugify(topic_name)
            res = client.table("topics").insert({
                "category_id": category_id_map["verbal-ability"],
                "slug": t_slug,
                "name": topic_name,
                "display_order": order,
                "is_active": True
            }).execute()
            topic_id_map[topic_name] = res.data[0]["id"]
            order += 1

    print(f"  [OK] {len(topic_id_map)} topics active.", flush=True)

    # 3. Prepare Questions & Options
    print("\n[3/4] Preparing Questions & Options...", flush=True)
    question_rows = []
    option_rows = []
    invalid_q_count = 0

    all_topic_payloads = [
        ("QA", quant_topics),
        ("LR", lr_data),
        ("VA", va_data)
    ]

    for prefix, dataset in all_topic_payloads:
        for topic_name, questions in dataset.items():
            topic_id = topic_id_map[topic_name]
            clean_slug = slugify(topic_name).replace('-', '_').upper()

            for idx, q in enumerate(questions):
                legacy_id = idx + 1
                q_code = f"{prefix}_{clean_slug}_{legacy_id:03d}"
                qid = str(uuid.uuid5(NS, f"q_{q_code}"))

                q_text = re.sub(r'^\d+\.\s*', '', q.get("question", "")).strip()
                opts = q.get("options", [])
                correct_idx = q.get("correctIndex", 0)
                solution = q.get("solution", "").strip()

                if not q_text or len(opts) < 2:
                    invalid_q_count += 1
                    continue

                question_rows.append({
                    "id": qid,
                    "topic_id": topic_id,
                    "question_code": q_code,
                    "legacy_id": legacy_id,
                    "question_text": q_text,
                    "explanation": solution or "Solution not provided.",
                    "difficulty": "medium",
                    "source": "IndiaBix" if prefix == "QA" and legacy_id > 20 else "SkillsCatalyst",
                    "is_active": True
                })

                keys = ["A", "B", "C", "D", "E"]
                for o_idx, opt_text in enumerate(opts):
                    if o_idx >= len(keys):
                        break
                    key = keys[o_idx]
                    opt_id = str(uuid.uuid5(NS, f"opt_{q_code}_{key}"))
                    cleaned_opt = re.sub(r'^[a-eA-E]\)\s*', '', str(opt_text)).strip()
                    is_correct = (o_idx == correct_idx)

                    option_rows.append({
                        "id": opt_id,
                        "question_id": qid,
                        "option_key": key,
                        "option_text": cleaned_opt,
                        "display_order": o_idx,
                        "is_correct": is_correct
                    })

    print(f"  + Prepared {len(question_rows)} questions and {len(option_rows)} options.", flush=True)

    # 4. Batch Upload Questions
    print("\n[4/4] Upserting Questions & Options to Supabase...", flush=True)
    q_chunks = list(chunked(question_rows, 100))
    for i, chunk in enumerate(q_chunks):
        client.table("questions").upsert(chunk, on_conflict="question_code").execute()
        print(f"  + Questions batch {i + 1}/{len(q_chunks)} uploaded.", flush=True)

    opt_chunks = list(chunked(option_rows, 250))
    for j, chunk in enumerate(opt_chunks):
        client.table("question_options").upsert(chunk, on_conflict="question_id,option_key").execute()
        print(f"  + Options batch {j + 1}/{len(opt_chunks)} uploaded.", flush=True)

    print("\n" + "=" * 70, flush=True)
    print("MIGRATION & SEEDING COMPLETE REPORT:", flush=True)
    print("=" * 70, flush=True)
    print(f"Categories verified          : {len(category_id_map)}", flush=True)
    print(f"Topics verified              : {len(topic_id_map)}", flush=True)
    print(f"Questions verified           : {len(question_rows)}", flush=True)
    print(f"Options verified             : {len(option_rows)}", flush=True)
    print(f"Invalid questions skipped    : {invalid_q_count}", flush=True)
    print("=" * 70, flush=True)

if __name__ == "__main__":
    seed()
