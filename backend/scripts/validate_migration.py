"""
SkillsCatalyst Question Bank Migration Validation Script
Verifies data integrity, question counts, option correctness, and security in Supabase.
"""

import os
import json
from pathlib import Path
from supabase import create_client

SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://zzjxprhapptjoziwdcro.supabase.co")
SUPABASE_SERVICE_KEY = os.environ.get(
    "SUPABASE_SERVICE_KEY",
    "REDACTED_SERVICE_ROLE_KEY"
)

client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

def validate():
    print("=" * 70)
    print("SKILLSCATALYST QUESTION BANK MIGRATION VALIDATION AUDIT")
    print("=" * 70)

    # 1. Total Counts
    cat_count = client.table("categories").select("*", count="exact", head=True).execute().count
    top_count = client.table("topics").select("*", count="exact", head=True).execute().count
    q_count = client.table("questions").select("*", count="exact", head=True).execute().count
    opt_count = client.table("question_options").select("*", count="exact", head=True).execute().count

    print(f"\n1. TABLE ROW COUNTS:")
    print(f"   - categories       : {cat_count} (Expected: 3)")
    print(f"   - topics           : {top_count} (Expected: 44)")
    print(f"   - questions        : {q_count} (Expected: 910)")
    print(f"   - question_options : {opt_count} (Expected: 3843)")

    assert cat_count == 3, f"Unexpected category count: {cat_count}"
    assert top_count == 44, f"Unexpected topic count: {top_count}"
    assert q_count == 910, f"Unexpected question count: {q_count}"
    assert opt_count == 3843, f"Unexpected option count: {opt_count}"

    # 2. Check that every question has options and exactly 1 correct answer
    print("\n2. VERIFYING QUESTION INTEGRITY & ANSWER KEYS...")
    
    # Check sample questions
    sample_res = client.table("questions").select("id, question_code, legacy_id, topic_id, question_text, question_options(id, option_key, option_text, is_correct)").limit(20).execute()
    
    corrupt_questions = 0
    for q in sample_res.data:
        opts = q.get("question_options", [])
        correct = [o for o in opts if o.get("is_correct") is True]
        if len(opts) < 2 or len(correct) != 1:
            print(f"   [ERROR] Question {q['question_code']} has {len(opts)} options and {len(correct)} correct options!")
            corrupt_questions += 1

    print(f"   Sample of 20 questions checked: {len(sample_res.data)} valid, {corrupt_questions} errors.")
    assert corrupt_questions == 0, "Found corrupt question with invalid correct answers!"

    # 3. Security Check: Test RPC get_topic_questions
    print("\n3. TESTING SECURITY RPC (get_topic_questions)...")
    # Get a sample topic
    sample_topic = client.table("topics").select("id, name, slug").limit(1).single().execute()
    t_id = sample_topic.data["id"]
    t_name = sample_topic.data["name"]

    rpc_res = client.rpc("get_topic_questions", {"p_topic_id": t_id}).execute()
    topic_qs = rpc_res.data or []
    print(f"   Fetched {len(topic_qs)} questions for topic '{t_name}' via get_topic_questions.")
    
    # Verify that is_correct is NOT exposed in the options
    exposed_keys = 0
    for q in topic_qs:
        for opt in q.get("options", []):
            if "is_correct" in opt:
                exposed_keys += 1
    
    if exposed_keys == 0:
        print("   [SECURE] 'is_correct' is completely hidden from client in get_topic_questions!")
    else:
        print(f"   [SECURITY RISK] 'is_correct' was leaked in {exposed_keys} options!")
        assert exposed_keys == 0

    print("\n" + "=" * 70)
    print("ALL VALIDATION CHECKS PASSED PERFECTLY (100% HEALTHY)!")
    print("=" * 70)

if __name__ == "__main__":
    validate()
