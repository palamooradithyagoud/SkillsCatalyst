"""
SkillsCatalyst - Full Verbal Ability Question Bank Migration & Seeding
Ingests all 1,687 questions across 19 topics from indiabix_verbal_ability_complete.json
into Supabase PostgreSQL with batch upserts, deterministic UUIDs, and full security compliance.
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

SOURCE_JSON_PATH = Path(r"c:\STARTUP\aptitude question\indiabix_verbal_ability_complete.json")

def slugify(text: str) -> str:
    s = text.lower()
    s = re.sub(r'[^a-z0-9]+', '-', s)
    return s.strip('-')

def chunked(lst, n):
    for i in range(0, len(lst), n):
        yield lst[i:i + n]

def clean_all_verbal_questions(raw_data):
    cleaned = []
    for idx, item in enumerate(raw_data):
        topic = item.get("topic", "").strip()
        q_text = item.get("question", "").strip()

        # Handle placeholder instructions
        if not q_text or "(solve as per the direction given above)" in q_text.lower():
            if topic == "Spotting Errors":
                q_text = "Find the part of the sentence that contains an error. If there is no error, select 'No error'."
            elif topic == "Spellings":
                q_text = "Find the correctly spelt word:"
            elif topic == "Closet Test":
                q_text = "In the passage, choose the word that correctly fits the blank."
            else:
                q_text = f"Select the correct option for {topic}:"

        explanation = item.get("explanation", "").strip()
        if explanation.startswith("xplanation:"):
            explanation = "Explanation:" + explanation[len("xplanation:"):]
        elif not explanation.startswith("Explanation:") and explanation:
            explanation = f"Explanation: {explanation}"

        cleaned_item = {
            "id": idx + 1,
            "category": "Verbal Ability",
            "topic": topic,
            "exercise": item.get("exercise", "").strip(),
            "exercise_code": item.get("exercise_code", "").strip(),
            "question": q_text,
            "option_a": item.get("option_a", "").strip(),
            "option_b": item.get("option_b", "").strip(),
            "option_c": item.get("option_c", "").strip(),
            "option_d": item.get("option_d", "").strip(),
            "option_e": item.get("option_e", "").strip(),
            "correct_answer": item.get("correct_answer", "").strip().upper(),
            "explanation": explanation or "Explanation not provided.",
            "source_url": item.get("source_url", "").strip()
        }
        cleaned.append(cleaned_item)
    return cleaned

def generate_ts_file(questions_by_topic):
    ts_lines = [
        '// SkillsCatalyst - Complete Verbal Ability Question Bank (1,687 Questions Offline Fallback)',
        'import { PlacementQuestion } from "./aptitudeQuestions";',
        ''
    ]

    var_name_map = {}
    for t_name, q_list in questions_by_topic.items():
        clean_var = "VA_" + re.sub(r'[^A-Z0-9]+', '_', t_name.upper()).strip('_') + '_QUESTIONS'
        var_name_map[t_name] = clean_var

        ts_lines.append(f'export const {clean_var}: PlacementQuestion[] = [')
        for idx, q in enumerate(q_list):
            qid = idx + 1
            q_text = json.dumps(f"{qid}. {q['question']}")

            opts = []
            for key in ['a', 'b', 'c', 'd', 'e']:
                val = q.get(f'option_{key}')
                if val:
                    opts.append(f"{key}) {val}")

            ans_letter = q.get('correct_answer', 'A').upper()
            letter_to_idx = {'A': 0, 'B': 1, 'C': 2, 'D': 3, 'E': 4}
            correct_idx = letter_to_idx.get(ans_letter, 0)

            ans_text = json.dumps(opts[correct_idx] if correct_idx < len(opts) else "")
            solution = json.dumps(q.get('explanation', ''))
            opts_json = json.dumps(opts)

            ts_lines.append('  {')
            ts_lines.append(f'    id: {qid},')
            ts_lines.append(f'    question: {q_text},')
            ts_lines.append(f'    options: {opts_json},')
            ts_lines.append(f'    correctIndex: {correct_idx},')
            ts_lines.append(f'    answerText: {ans_text},')
            ts_lines.append(f'    solution: {solution}')
            ts_lines.append('  },')
        ts_lines.append('];\n')

    ts_lines.append('export const VERBAL_ABILITY_MAP: Record<string, PlacementQuestion[]> = {')
    for t_name, var_name in var_name_map.items():
        ts_lines.append(f'  {json.dumps(t_name)}: {var_name},')
    ts_lines.append('};\n')

    out_ts = ROOT_DIR / "frontend" / "data" / "verbalAbilityQuestions.ts"
    with open(out_ts, "w", encoding="utf-8") as f:
        f.write("\n".join(ts_lines))
    print(f"  + Generated {out_ts.name} with {len(var_name_map)} topics.")

def run_migration():
    print("=" * 70)
    print("MIGRATING COMPLETE VERBAL ABILITY QUESTION BANK (1,687 QUESTIONS)")
    print("=" * 70)

    # 1. Load raw file
    with open(SOURCE_JSON_PATH, "r", encoding="utf-8") as f:
        raw_data = json.load(f)
    print(f"[1/5] Loaded raw file with {len(raw_data)} questions.")

    # 2. Clean questions
    cleaned_questions = clean_all_verbal_questions(raw_data)
    print(f"[2/5] Cleaned {len(cleaned_questions)} questions.")

    # Save cleaned JSON files
    backend_json = ROOT_DIR / "backend" / "data" / "verbal_ability_questions.json"
    frontend_json = ROOT_DIR / "frontend" / "data" / "verbalAbilityQuestions.json"
    with open(backend_json, "w", encoding="utf-8") as f:
        json.dump(cleaned_questions, f, indent=2, ensure_ascii=False)
    with open(frontend_json, "w", encoding="utf-8") as f:
        json.dump(cleaned_questions, f, indent=2, ensure_ascii=False)
    print(f"  + Saved cleaned JSON to {backend_json.name} & {frontend_json.name}")

    # Group by topic (preserving order)
    topics_grouped = {}
    for q in cleaned_questions:
        t = q["topic"]
        topics_grouped.setdefault(t, []).append(q)

    # Generate frontend TS fallback
    generate_ts_file(topics_grouped)

    # 3. Ensure category & topics in Supabase
    print("\n[3/5] Syncing Topics in Supabase...")
    cat_res = client.table("categories").select("id").eq("slug", "verbal-ability").single().execute()
    category_id = cat_res.data["id"]

    top_res = client.table("topics").select("id, name, slug, display_order").execute()
    existing_topics = {row["name"]: row["id"] for row in top_res.data}
    max_order = max((row.get("display_order") or 0) for row in top_res.data) if top_res.data else 0

    topic_id_map = dict(existing_topics)
    current_order = max_order + 1

    for t_name in topics_grouped.keys():
        if t_name not in topic_id_map:
            t_slug = slugify(t_name)
            topic_uuid = str(uuid.uuid5(NS, f"topic_va_{t_slug}"))
            res = client.table("topics").upsert({
                "id": topic_uuid,
                "category_id": category_id,
                "slug": t_slug,
                "name": t_name,
                "display_order": current_order,
                "is_active": True
            }, on_conflict="slug").execute()
            topic_id_map[t_name] = res.data[0]["id"]
            print(f"  + Added Topic: {t_name} (slug: {t_slug}, order: {current_order})")
            current_order += 1
        else:
            print(f"  * Verified Topic: {t_name}")

    # 4. Prepare Question & Option rows
    print("\n[4/5] Preparing Question & Option Rows...")
    question_rows = []
    option_rows = []

    for t_name, q_list in topics_grouped.items():
        topic_id = topic_id_map[t_name]
        clean_slug = slugify(t_name).replace('-', '_').upper()

        for idx, q in enumerate(q_list):
            legacy_id = idx + 1
            q_code = f"VA_{clean_slug}_{legacy_id:03d}"
            qid = str(uuid.uuid5(NS, f"q_{q_code}"))

            q_text = q.get("question", "").strip()
            correct_letter = q.get("correct_answer", "").strip().upper()
            explanation = q.get("explanation", "").strip()
            source_url = q.get("source_url", "")

            options = []
            for key_letter in ["A", "B", "C", "D", "E"]:
                opt_val = q.get(f"option_{key_letter.lower()}", "").strip()
                if opt_val:
                    options.append((key_letter, opt_val))

            if not q_text or len(options) < 2:
                print(f"  ! Warning: Skipping invalid question {q_code}")
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
    print("\n[5/5] Upserting to Supabase PostgreSQL...")
    q_chunks = list(chunked(question_rows, 100))
    for i, chunk in enumerate(q_chunks):
        client.table("questions").upsert(chunk, on_conflict="question_code").execute()
        if (i + 1) % 4 == 0 or (i + 1) == len(q_chunks):
            print(f"  + Questions progress: {i + 1}/{len(q_chunks)} batches ({(i + 1)*100} Qs)...")

    opt_chunks = list(chunked(option_rows, 250))
    for j, chunk in enumerate(opt_chunks):
        client.table("question_options").upsert(chunk, on_conflict="question_id,option_key").execute()
        if (j + 1) % 6 == 0 or (j + 1) == len(opt_chunks):
            print(f"  + Options progress: {j + 1}/{len(opt_chunks)} batches ({(j + 1)*250} Opts)...")

    print("\n" + "=" * 70)
    print("MIGRATION FINISHED SUCCESSFULLY!")
    print("=" * 70)

    # Verification report
    print("\nSupabase Verification Report:")
    for t_name in topics_grouped.keys():
        t_id = topic_id_map[t_name]
        cnt = client.table("questions").select("id", count="exact").eq("topic_id", t_id).execute().count
        print(f"  Topic: {t_name:<35} -> {cnt:>4} questions")

if __name__ == "__main__":
    run_migration()
