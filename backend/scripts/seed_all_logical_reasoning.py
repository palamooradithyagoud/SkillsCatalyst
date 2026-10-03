"""
SkillsCatalyst - Full Logical Reasoning Question Bank Migration & Seeding
Ingests all 1,197 questions across 19 topics from indiabix_logical_reasoning_complete.json
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

SOURCE_JSON_PATH = Path(r"c:\STARTUP\aptitude question\indiabix_logical_reasoning_complete.json")

def slugify(text: str) -> str:
    s = text.lower()
    s = re.sub(r'[^a-z0-9]+', '-', s)
    return s.strip('-')

def chunked(lst, n):
    for i in range(0, len(lst), n):
        yield lst[i:i + n]

# Fallback text descriptions for the 11 image-based questions from IndiaBIX
IMAGE_Q_TEXT_MAP = {
    "006001": "Look at the pattern: In the first segment, the letter 'E' faces right, then down, then right. In the second segment, all letters face down. Following this alternating pattern, what direction must the letters face in the fourth segment?",
    "006002": "Look for the rule of opposites in this series of figures: The first and second segments are opposites of each other. The same applies for the third and fourth segments. Which figure correctly completes the pattern?",
    "006003": "In each segment of this series, the figures alternate between one-half and one-fourth shaded. Which figure follows this shading pattern next?",
    "013001": "Complete the analogy: Hand is to ring as head is to",
    "013002": "Complete the analogy: A can of paint is to a paintbrush as a spool of thread is to a",
    "013003": "Complete the analogy: A snow-capped mountain is to a crocodile as a cactus is to a",
    "013004": "Complete the analogy: A palm tree is to a pine tree as a bathing suit is to a",
    "014001": "Complete the analogy: A T-shirt is to a pair of shoes as a chest of drawers is to a",
    "014002": "Complete the analogy: A hose is to a firefighter as a needle is to a",
    "014003": "Complete the analogy: A pyramid is to a triangle as a cube is to a",
    "014004": "Complete the analogy: A tree is to a leaf as a bird is to a"
}

IMAGE_Q_OPTS_MAP = {
    "013001": {"option_a": "cap", "option_b": "necklace", "option_c": "earring", "option_d": "glove"},
    "013002": {"option_a": "cloth", "option_b": "scissors", "option_c": "thimble", "option_d": "sewing needle"},
    "013003": {"option_a": "starfish", "option_b": "camel", "option_c": "scorpion", "option_d": "lizard"},
    "013004": {"option_a": "jacket", "option_b": "parka", "option_c": "sweater", "option_d": "scarf"},
    "014001": {"option_a": "table", "option_b": "couch", "option_c": "bed", "option_d": "lamp"},
    "014002": {"option_a": "hospital", "option_b": "medicine", "option_c": "syringe", "option_d": "nurse"},
    "014003": {"option_a": "square", "option_b": "circle", "option_c": "polygon", "option_d": "sphere"},
    "014004": {"option_a": "nest", "option_b": "wing", "option_c": "beak", "option_d": "feather"},
    "006001": {"option_a": "Faces right", "option_b": "Faces down", "option_c": "Faces up", "option_d": "Faces left"},
    "006002": {"option_a": "Identical figure", "option_b": "Rotated 90 degrees", "option_c": "Inverted shape", "option_d": "Opposite figure"},
    "006003": {"option_a": "Fully shaded", "option_b": "Unshaded", "option_c": "One-third shaded", "option_d": "One-fourth shaded"}
}

def clean_all_questions(raw_data):
    cleaned = []
    for idx, item in enumerate(raw_data):
        url = item.get("source_url", "")
        code_match = re.search(r'/(\d+)$', url)
        code = code_match.group(1) if code_match else f"{idx:06d}"

        q_text = item.get("question", "").strip()
        if not q_text and code in IMAGE_Q_TEXT_MAP:
            q_text = IMAGE_Q_TEXT_MAP[code]

        if code in IMAGE_Q_OPTS_MAP:
            for k, val in IMAGE_Q_OPTS_MAP[code].items():
                item[k] = val

        explanation = item.get("explanation", "").strip()
        if explanation.startswith("xplanation:"):
            explanation = "Explanation:" + explanation[len("xplanation:"):]
        elif not explanation.startswith("Explanation:") and explanation:
            explanation = f"Explanation: {explanation}"

        cleaned_item = {
            "id": idx + 1,
            "category": "Logical Reasoning",
            "topic": item.get("topic", "").strip(),
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
            "source_url": url
        }
        cleaned.append(cleaned_item)
    return cleaned

def generate_ts_file(questions_by_topic):
    ts_lines = [
        '// SkillsCatalyst - Complete Logical Reasoning Question Bank (1,197 Questions Offline Fallback)',
        'import { PlacementQuestion } from "./aptitudeQuestions";',
        ''
    ]

    var_name_map = {}
    for t_name, q_list in questions_by_topic.items():
        clean_var = re.sub(r'[^A-Z0-9]+', '_', t_name.upper()).strip('_') + '_QUESTIONS'
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

    ts_lines.append('export const LOGICAL_REASONING_MAP: Record<string, PlacementQuestion[]> = {')
    for t_name, var_name in var_name_map.items():
        ts_lines.append(f'  {json.dumps(t_name)}: {var_name},')
    ts_lines.append('};\n')

    out_ts = ROOT_DIR / "frontend" / "data" / "logicalReasoningQuestions.ts"
    with open(out_ts, "w", encoding="utf-8") as f:
        f.write("\n".join(ts_lines))
    print(f"  + Generated {out_ts.name} with {len(var_name_map)} topics.")

def run_migration():
    print("=" * 70)
    print("MIGRATING COMPLETE LOGICAL REASONING QUESTION BANK (1,197 QUESTIONS)")
    print("=" * 70)

    # 1. Load raw file
    with open(SOURCE_JSON_PATH, "r", encoding="utf-8") as f:
        raw_data = json.load(f)
    print(f"[1/5] Loaded raw file with {len(raw_data)} questions.")

    # 2. Clean questions
    cleaned_questions = clean_all_questions(raw_data)
    print(f"[2/5] Cleaned {len(cleaned_questions)} questions.")

    # Save cleaned JSON files
    backend_json = ROOT_DIR / "backend" / "data" / "logical_reasoning_questions.json"
    frontend_json = ROOT_DIR / "frontend" / "data" / "logicalReasoningQuestions.json"
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
    cat_res = client.table("categories").select("id").eq("slug", "logical-reasoning").single().execute()
    category_id = cat_res.data["id"]

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
            q_code = f"LR_{clean_slug}_{legacy_id:03d}"
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
        if (i + 1) % 3 == 0 or (i + 1) == len(q_chunks):
            print(f"  + Questions progress: {i + 1}/{len(q_chunks)} batches ({(i + 1)*100} Qs)...")

    opt_chunks = list(chunked(option_rows, 250))
    for j, chunk in enumerate(opt_chunks):
        client.table("question_options").upsert(chunk, on_conflict="question_id,option_key").execute()
        if (j + 1) % 5 == 0 or (j + 1) == len(opt_chunks):
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
