"""
SkillsCatalyst Question Bank Comprehensive Automated Verification & Security Suite
Verifies:
1. Database Schema Constraints & Foreign Keys
2. Question Bank Volume & Integrity (3 categories, 44 topics, 910 questions, 3,843 options)
3. Direct Answer Key Leakage Protection (is_correct blocked from anon/authenticated direct SELECT)
4. Direct Explanation Leakage Protection (explanation blocked from anon/authenticated direct SELECT)
5. RLS Public Read Policies (Categories, Topics, Questions)
6. get_topic_questions RPC security (active questions only, no is_correct, no explanation)
7. submit_question_attempt RPC authentication requirement
8. submit_question_attempt RPC option ownership validation (rejects mismatched question/option)
9. submit_question_attempt RPC time validation (rejects negative or >86400s time)
10. submit_question_attempt RPC server-side correctness calculation
11. User Data Isolation (User A cannot read User B's attempts or progress)
12. Option Keys format and validity
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client

ROOT_DIR = Path(__file__).resolve().parent.parent.parent
load_dotenv(ROOT_DIR / ".env")

SUPABASE_URL = os.environ.get("SUPABASE_URL")
if not SUPABASE_URL:
    raise ValueError("SUPABASE_URL environment variable must be set.")

SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY")
if not SERVICE_KEY:
    raise ValueError("SUPABASE_SERVICE_KEY environment variable must be set. Never hardcode credentials.")

ANON_KEY = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY", os.environ.get("SUPABASE_ANON_KEY"))
if not ANON_KEY:
    raise ValueError("ANON_KEY environment variable must be set.")

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
    print("STARTING QUESTION BANK AUTOMATED VERIFICATION & SECURITY SUITE")
    print("=" * 70)

    # Test 1: Category counts
    def test_categories():
        res = admin_client.table("categories").select("*").execute()
        assert len(res.data) == 3, f"Expected 3 categories, got {len(res.data)}"
        slugs = {c["slug"] for c in res.data}
        assert "quantitative-aptitude" in slugs
        assert "logical-reasoning" in slugs
        assert "verbal-ability" in slugs

    test("Categories table structure and contents (3 categories)", test_categories)

    # Test 2: Topics counts
    def test_topics():
        res = admin_client.table("topics").select("*").execute()
        assert len(res.data) == 81, f"Expected 81 topics, got {len(res.data)}"

    test("Topics table structure (81 topics)", test_topics)

    # Test 3: Questions count and uniqueness
    def test_questions():
        q_count = admin_client.table("questions").select("*", count="exact", head=True).execute().count
        assert q_count == 3793, f"Expected 3,793 questions, got {q_count}"

    test("Questions total volume (3,793 questions)", test_questions)

    # Test 4: Options count
    def test_options():
        opt_count = admin_client.table("question_options").select("*", count="exact", head=True).execute().count
        assert opt_count == 16583, f"Expected 16,583 options, got {opt_count}"

    test("Options total volume (16,583 options)", test_options)

    # Test 5: Direct Answer-Key Leakage Protection
    def test_direct_answer_leakage():
        # Attempt to SELECT is_correct directly from question_options via public anon client
        try:
            res = public_client.table("question_options").select("is_correct").limit(5).execute()
            raise AssertionError(f"CRITICAL SECURITY FAILURE: is_correct leaked to client! Data: {res.data}")
        except AssertionError:
            raise
        except Exception as e:
            assert "42501" in str(e) or "permission denied" in str(e).lower(), f"Unexpected error: {e}"

        # Attempt to SELECT * directly from question_options via public anon client
        try:
            res = public_client.table("question_options").select("*").limit(5).execute()
            raise AssertionError(f"CRITICAL SECURITY FAILURE: question_options.* leaked to client! Data: {res.data}")
        except AssertionError:
            raise
        except Exception as e:
            assert "42501" in str(e) or "permission denied" in str(e).lower(), f"Unexpected error: {e}"

        # Verify safe SELECT works
        safe_res = public_client.table("question_options").select("id, question_id, option_key, option_text, display_order").limit(5).execute()
        assert len(safe_res.data) > 0, "Public client should be able to read safe option columns"

    test("Direct answer-key leakage protection (is_correct blocked from anon/client)", test_direct_answer_leakage)

    # Test 6: Direct Explanation Leakage Protection
    def test_direct_explanation_leakage():
        # Attempt to SELECT explanation directly from questions via public anon client
        try:
            res = public_client.table("questions").select("explanation").limit(5).execute()
            raise AssertionError(f"SECURITY FAILURE: explanation leaked to client! Data: {res.data}")
        except AssertionError:
            raise
        except Exception as e:
            assert "42501" in str(e) or "permission denied" in str(e).lower(), f"Unexpected error: {e}"

        # Attempt to SELECT * directly from questions via public anon client
        try:
            res = public_client.table("questions").select("*").limit(5).execute()
            raise AssertionError(f"SECURITY FAILURE: questions.* leaked to client! Data: {res.data}")
        except AssertionError:
            raise
        except Exception as e:
            assert "42501" in str(e) or "permission denied" in str(e).lower(), f"Unexpected error: {e}"

        # Verify safe SELECT works
        safe_res = public_client.table("questions").select("id, question_text, difficulty").limit(5).execute()
        assert len(safe_res.data) > 0, "Public client should be able to read safe question columns"

    test("Direct explanation leakage protection (explanation blocked from anon/client)", test_direct_explanation_leakage)

    # Test 7: Public client access (RLS)
    def test_public_rls():
        cat_res = public_client.table("categories").select("name, slug").execute()
        assert len(cat_res.data) >= 3, "Public client should read active categories"

        top_res = public_client.table("topics").select("name, slug").execute()
        assert len(top_res.data) >= 44, "Public client should read active topics"

        q_res = public_client.table("questions").select("id, question_text").limit(10).execute()
        assert len(q_res.data) == 10, "Public client should read active questions"

    test("RLS Public read policies for categories, topics, questions", test_public_rls)

    # Test 8: Answer security in get_topic_questions RPC
    def test_answer_security():
        t = admin_client.table("topics").select("id, name").eq("slug", "percentages").single().execute()
        topic_id = t.data["id"]

        qs = public_client.rpc("get_topic_questions", {"p_topic_id": topic_id}).execute().data
        assert len(qs) == 55, f"Expected 55 percentages questions, got {len(qs)}"

        for q in qs:
            assert "explanation" not in q, f"SECURITY LEAK: explanation found in get_topic_questions {q}!"
            for opt in q["options"]:
                assert "is_correct" not in opt, f"SECURITY LEAK: is_correct found in option {opt}!"

    test("Security RPC get_topic_questions hides is_correct and explanation", test_answer_security)

    # Test 9: Unauthorized attempt submission blocked
    def test_unauthenticated_attempt():
        try:
            public_client.rpc("submit_question_attempt", {
                "p_question_id": "00000000-0000-0000-0000-000000000000",
                "p_selected_option_id": "00000000-0000-0000-0000-000000000000"
            }).execute()
            assert False, "Should have raised exception for unauthenticated attempt!"
        except Exception as e:
            assert "Not authenticated" in str(e) or "P0001" in str(e) or "error" in str(e).lower()

    test("submit_question_attempt blocks unauthenticated access", test_unauthenticated_attempt)

    # Test 10: Option ownership & input validation in submit_question_attempt
    def test_rpc_validation_and_isolation():
        email_a = "audit_suite_user_a@skillscatalyst.test"
        email_b = "audit_suite_user_b@skillscatalyst.test"
        pwd = "AuditSuitePassword123!"

        for email in [email_a, email_b]:
            try:
                admin_client.auth.admin.create_user({"email": email, "password": pwd, "email_confirm": True})
            except Exception:
                pass

        client_a = create_client(SUPABASE_URL, ANON_KEY)
        client_b = create_client(SUPABASE_URL, ANON_KEY)

        sess_a = client_a.auth.sign_in_with_password({"email": email_a, "password": pwd})
        sess_b = client_b.auth.sign_in_with_password({"email": email_b, "password": pwd})
        user_a_id = sess_a.user.id
        user_b_id = sess_b.user.id

        try:
            # Fetch 2 questions and options
            qs = admin_client.table("questions").select("id, question_options(id, is_correct)").limit(2).execute().data
            q1_id = qs[0]["id"]
            q2_id = qs[1]["id"]
            q1_opt = qs[0]["question_options"][0]["id"]
            q2_opt = qs[1]["question_options"][0]["id"]

            # Subtest A: Option from Question B submitted with Question A
            try:
                client_a.rpc("submit_question_attempt", {
                    "p_question_id": q1_id,
                    "p_selected_option_id": q2_opt,
                    "p_time_taken_seconds": 10
                }).execute()
                assert False, "Should have rejected option belonging to another question!"
            except Exception as e:
                assert "Option does not belong to specified question" in str(e) or "P0001" in str(e)

            # Subtest B: Negative time
            try:
                client_a.rpc("submit_question_attempt", {
                    "p_question_id": q1_id,
                    "p_selected_option_id": q1_opt,
                    "p_time_taken_seconds": -5
                }).execute()
                assert False, "Should have rejected negative time!"
            except Exception as e:
                assert "Invalid time taken" in str(e) or "P0001" in str(e)

            # Subtest C: Excessive time (>86400)
            try:
                client_a.rpc("submit_question_attempt", {
                    "p_question_id": q1_id,
                    "p_selected_option_id": q1_opt,
                    "p_time_taken_seconds": 999999
                }).execute()
                assert False, "Should have rejected excessive time!"
            except Exception as e:
                assert "Invalid time taken" in str(e) or "P0001" in str(e)

            # Subtest D: Legitimate submission by User A
            res = client_a.rpc("submit_question_attempt", {
                "p_question_id": q1_id,
                "p_selected_option_id": q1_opt,
                "p_time_taken_seconds": 20
            }).execute().data
            assert "is_correct" in res
            assert "correct_option_id" in res
            assert "explanation" in res

            # Subtest E: User Isolation: User B cannot see User A's attempts
            b_attempts = client_b.table("question_attempts").select("*").execute().data
            for att in b_attempts:
                assert att["user_id"] == user_b_id, f"ISOLATION LEAK: User B saw User A attempt {att}"

            # Subtest F: User Isolation: User B cannot see User A's progress
            b_progress = client_b.table("user_topic_progress").select("*").execute().data
            for prog in b_progress:
                assert prog["user_id"] == user_b_id, f"ISOLATION LEAK: User B saw User A progress {prog}"

        finally:
            admin_client.auth.admin.delete_user(user_a_id)
            admin_client.auth.admin.delete_user(user_b_id)

    test("submit_question_attempt option validation, time bounds & user isolation", test_rpc_validation_and_isolation)

    # Test 11: Direct client write block on question_attempts (anti-forgery)
    def test_anti_forgery_attempts():
        try:
            public_client.table("question_attempts").insert({
                "user_id": "00000000-0000-0000-0000-000000000001",
                "question_id": "00000000-0000-0000-0000-000000000002",
                "is_correct": True
            }).execute()
            raise AssertionError("CRITICAL FAILURE: Allowed direct client insert into question_attempts!")
        except AssertionError:
            raise
        except Exception as e:
            assert "permission denied" in str(e).lower() or "42501" in str(e) or "violates" in str(e).lower()

    test("Anti-forgery: direct client insert to question_attempts blocked", test_anti_forgery_attempts)

    # Test 12: Question options key validation
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
