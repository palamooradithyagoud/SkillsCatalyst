"""
SkillsCatalyst - Ingest Logical Reasoning Questions into Supabase PostgreSQL
Batched, idempotent, strictly typed with deterministic UUIDs.
"""

import json
import os
import re
import uuid
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client

ROOT_DIR = Path(__file__).resolve().parent.parent.parent
load_dotenv(ROOT_DIR / ".env")

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    raise ValueError("Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in environment.")

client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
NS = uuid.NAMESPACE_DNS

def slugify(text: str) -> str:
    s = text.lower()
    s = re.sub(r'[^a-z0-9]+', '-', s)
    return s.strip('-')

def chunked(lst, n):
    for i in range(0, len(lst), n):
        yield lst[i:i + n]

def seed_logical_reasoning():
    print("=" * 70)
    print("Starting SkillsCatalyst Logical Reasoning Seeding into Supabase...")
    print("=" * 70)

    # 1. Fetch category ID for logical-reasoning
    cat_res = client.table("categories").select("id").eq("slug", "logical-reasoning").single().execute()
    if not cat_res.data:
        raise ValueError("Category 'logical-reasoning' not found in database.")
    category_id = cat_res.data["id"]
    print(f"[1/4] Found Logical Reasoning Category ID: {category_id}")

    # 2. Load cleaned questions JSON
    json_path = ROOT_DIR / "backend" / "data" / "logical_reasoning_questions.json"
    with open(json_path, "r", encoding="utf-8") as f:
        questions_data = json.load(f)

    print(f"Loaded {len(questions_data)} questions from {json_path.name}")

    # Group by topic
    topics_grouped = {}
    for q in questions_data:
        t_name = q["topic"]
        topics_grouped.setdefault(t_name, []).append(q)

    # 3. Ensure Topics exist in Supabase
    print("\n[2/4] Syncing Topics...")
    top_res = client.table("topics").select("id, name, slug, display_order").execute()
    existing_topics = {row["name"]: row["id"] for row in top_res.data}
    max_order = max((row.get("display_order") or 0) for row in top_res.data) if top_res.data else 0

    topic_id_map = dict(existing_topics)
    current_order = max_order + 1

    for t_name in topics_grouped.keys():
        if t_name not in topic_id_map:
            t_slug = slugify(t_name)
            topic_uuid = str(uuid.uuid5(NS, f"topic_lr_{t_slug}"))
            res = client.table("topics").upsert({
                "id": topic_uuid,
                "category_id": category_id,
                "slug": t_slug,
                "name": t_name,
                "display_order": current_order,
                "is_active": True
            }, on_conflict="slug").execute()
            topic_id_map[t_name] = res.data[0]["id"]
            print(f"  + Added Topic: {t_name} (order: {current_order}, slug: {t_slug})")
            current_order += 1
        else:
            print(f"  * Existing Topic: {t_name}")

    # 4. Prepare Questions and Options
    print("\n[3/4] Preparing Questions & Options for Upsert...")
    question_rows = []
    option_rows = []

    for t_name, q_list in topics_grouped.items():
        topic_id = topic_id_map[t_name]
        clean_slug = slugify(t_name).replace('-', '_').upper()

        for idx, q in enumerate(q_list):
            legacy_id = idx + 1
            q_code = f"LR_{clean_slug}_{legacy_id:03d}"
            qid = str(uuid.uuid5(NS, f"q_{q_code}"))

            q_text = q.get("question", "").strip()
            correct_letter = q.get("correct_answer", "").strip().upper()
            explanation = q.get("explanation", "").strip()
            source_url = q.get("source_url", "")

            # Build options list
            options = []
            for key_letter in ["A", "B", "C", "D", "E"]:
                opt_val = q.get(f"option_{key_letter.lower()}", "").strip()
                if opt_val:
                    options.append((key_letter, opt_val))

            if not q_text or len(options) < 2:
                print(f"  ! Warning: Skipping invalid question {q_code}: text='{q_text[:30]}', opts={len(options)}")
                continue

            question_rows.append({
                "id": qid,
                "topic_id": topic_id,
                "question_code": q_code,
                "legacy_id": legacy_id,
                "question_text": q_text,
                "explanation": explanation or "Explanation not provided.",
                "difficulty": "medium",
                "source": "IndiaBix",
                "source_url": source_url,
                "is_active": True
            })

            for o_idx, (key, opt_text) in enumerate(options):
                opt_id = str(uuid.uuid5(NS, f"opt_{q_code}_{key}"))
                is_correct = (key == correct_letter)

                option_rows.append({
                    "id": opt_id,
                    "question_id": qid,
                    "option_key": key,
                    "option_text": opt_text,
                    "display_order": o_idx,
                    "is_correct": is_correct
                })

    print(f"  + Prepared {len(question_rows)} question rows.")
    print(f"  + Prepared {len(option_rows)} option rows.")

    # 5. Batch Upsert to Supabase
    print("\n[4/4] Upserting Questions & Options to Supabase...")
    q_chunks = list(chunked(question_rows, 100))
    for i, chunk in enumerate(q_chunks):
        client.table("questions").upsert(chunk, on_conflict="question_code").execute()
        print(f"  + Questions batch {i + 1}/{len(q_chunks)} upserted ({len(chunk)} items).")

    opt_chunks = list(chunked(option_rows, 250))
    for j, chunk in enumerate(opt_chunks):
        client.table("question_options").upsert(chunk, on_conflict="question_id,option_key").execute()
        print(f"  + Options batch {j + 1}/{len(opt_chunks)} upserted ({len(chunk)} items).")

    print("\n" + "=" * 70)
    print("SEEDING COMPLETE!")
    print("=" * 70)

    # Verification queries
    print("Verification Summary:")
    for t_name in topics_grouped.keys():
        t_id = topic_id_map[t_name]
        cnt = client.table("questions").select("id", count="exact").eq("topic_id", t_id).execute().count
        print(f"  Topic: {t_name:<30} -> {cnt} questions in DB")

if __name__ == "__main__":
    seed_logical_reasoning()
