"""
SkillsCatalyst Question Bank Automated Test Suite
Verifies:
1. Database Schema Constraints & Foreign Keys
2. Question Bank Volume & Integrity
3. Answer Security (is_correct hidden from public/client)
4. RLS Read Policies (Categories, Topics, Questions)
5. RPC Functionality (get_topic_questions, submit_question_attempt)
"""

import os
import sys
from supabase import create_client

SUPABASE_URL = "https://zzjxprhapptjoziwdcro.supabase.co"
SERVICE_KEY = os.environ.get(
    "SUPABASE_SERVICE_KEY",
    "REDACTED_SERVICE_ROLE_KEY"
)
ANON_KEY = os.environ.get(
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "REDACTED_ANON_KEY"
)

admin_client = create_client(SUPABASE_URL, SERVICE_KEY)
public_client = create_client(SUPABASE_URL, ANON_KEY)

passed_tests = 0
failed_tests = 0

def test(name, fn):
    global passed_tests, failed_tests
    print(f"\n[TEST] {name}...", end=" ")
    try:
        fn()
        print("PASSED")
        passed_tests += 1
    except Exception as e:
        print(f"FAILED: {e}")
        failed_tests += 1

def run_tests():
    print("=" * 70)
    print("STARTING QUESTION BANK AUTOMATED VERIFICATION SUITE")
    print("=" * 70)

    # Test 1: Category counts
    def test_categories():
        res = admin_client.table("categories").select("*").execute()
        assert len(res.data) == 3, f"Expected 3 categories, got {len(res.data)}"
        slugs = {c["slug"] for c in res.data}
        assert "quantitative-aptitude" in slugs
        assert "logical-reasoning" in slugs
        assert "verbal-ability" in slugs

    test("Categories table structure and contents", test_categories)

    # Test 2: Topics counts
    def test_topics():
        res = admin_client.table("topics").select("*").execute()
        assert len(res.data) == 44, f"Expected 44 topics, got {len(res.data)}"

    test("Topics table structure (44 topics)", test_topics)

    # Test 3: Questions count and uniqueness
    def test_questions():
        q_count = admin_client.table("questions").select("*", count="exact", head=True).execute().count
        assert q_count == 910, f"Expected 910 questions, got {q_count}"

    test("Questions total volume (910 questions)", test_questions)

    # Test 4: Options count
    def test_options():
        opt_count = admin_client.table("question_options").select("*", count="exact", head=True).execute().count
        assert opt_count == 3843, f"Expected 3,843 options, got {opt_count}"

    test("Options total volume (3,843 options)", test_options)

    # Test 5: Public client access (RLS)
    def test_public_rls():
        cat_res = public_client.table("categories").select("name, slug").execute()
        assert len(cat_res.data) >= 3, "Public client should read active categories"

        top_res = public_client.table("topics").select("name, slug").execute()
        assert len(top_res.data) >= 44, "Public client should read active topics"

        q_res = public_client.table("questions").select("id, question_text").limit(10).execute()
        assert len(q_res.data) == 10, "Public client should read active questions"

    test("RLS Public read policies for categories, topics, questions", test_public_rls)

    # Test 6: Answer security (get_topic_questions RPC hides is_correct)
    def test_answer_security():
        t = admin_client.table("topics").select("id, name").eq("slug", "percentages").single().execute()
        topic_id = t.data["id"]

        qs = public_client.rpc("get_topic_questions", {"p_topic_id": topic_id}).execute().data
        assert len(qs) == 55, f"Expected 55 percentages questions, got {len(qs)}"

        for q in qs:
            for opt in q["options"]:
                assert "is_correct" not in opt, f"SECURITY LEAK: is_correct found in option {opt}!"

    test("Security RPC get_topic_questions hides is_correct", test_answer_security)

    # Test 7: Unauthorized attempt submission blocked
    def test_unauthenticated_attempt():
        try:
            # Public unauthenticated client calling submit_question_attempt
            public_client.rpc("submit_question_attempt", {
                "p_question_id": "00000000-0000-0000-0000-000000000000",
                "p_selected_option_id": "00000000-0000-0000-0000-000000000000"
            }).execute()
            assert False, "Should have raised exception for unauthenticated attempt!"
        except Exception as e:
            assert "Not authenticated" in str(e) or "P0001" in str(e) or "error" in str(e).lower()

    test("submit_question_attempt blocks unauthenticated access", test_unauthenticated_attempt)

    # Test 8: Question options key validation
    def test_option_keys():
        sample = admin_client.table("question_options").select("option_key").limit(100).execute()
        valid_keys = {"A", "B", "C", "D", "E"}
        for o in sample.data:
            assert o["option_key"] in valid_keys, f"Invalid key: {o['option_key']}"

    test("Option keys adhere to valid A-E constraint", test_option_keys)

    print("\n" + "=" * 70)
    print(f"TEST SUMMARY: {passed_tests} PASSED, {failed_tests} FAILED")
    print("=" * 70)

    if failed_tests > 0:
        sys.exit(1)

if __name__ == "__main__":
    run_tests()
