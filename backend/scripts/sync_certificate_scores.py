"""
backend/scripts/sync_certificate_scores.py
Migration script to recalculate and synchronize past issued certificate scores
with each student's authoritative quiz scores from student_module_progress.
"""
import sys
from pathlib import Path
from dotenv import load_dotenv

root_dir = Path(__file__).resolve().parent.parent.parent
load_dotenv(root_dir / ".env")
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from backend.services.supabase_service import get_supabase
from backend.services.certificate_service import check_course_completion_and_eligibility


def sync_certificate_scores():
    print("=" * 70)
    print("SKILLSCATALYST CERTIFICATE SCORE SYNCHRONIZATION")
    print("=" * 70)

    sb = get_supabase()
    if not sb:
        print("[ERROR] Supabase client could not be initialized.")
        sys.exit(1)

    # 1. Update any DRAFT quizzes for published courses to PUBLISHED
    print("\n[Step 1] Ensuring module quizzes for published courses are PUBLISHED...")
    pub_courses = sb.from_("courses").select("id, title").eq("status", "PUBLISHED").execute().data or []
    for c in pub_courses:
        c_id = c["id"]
        mods = sb.from_("course_modules").select("id").eq("course_id", c_id).execute().data or []
        mod_ids = [str(m["id"]) for m in mods]
        if mod_ids:
            draft_quizzes = sb.from_("course_quizzes").select("id, title, status").in_("module_id", mod_ids).eq("status", "DRAFT").execute().data or []
            if draft_quizzes:
                for dq in draft_quizzes:
                    print(f"  --> Publishing quiz '{dq.get('title')}' (id: {dq['id']})")
                    sb.from_("course_quizzes").update({"status": "PUBLISHED"}).eq("id", dq["id"]).execute()
            else:
                print(f"  --> All quizzes for course '{c['title']}' are already PUBLISHED.")

    # 2. Fetch all issued certificates
    print("\n[Step 2] Inspecting issued certificates...")
    certs_res = sb.from_("certificates").select("*").eq("status", "issued").execute()
    certificates = certs_res.data or []
    print(f"Found {len(certificates)} issued certificates.\n")

    updated_count = 0
    unchanged_count = 0

    print(f"{'Student Name':<26} | {'Prev Score':<10} | {'Actual Score':<12} | {'Action':<15}")
    print("-" * 70)

    for cert in certificates:
        cert_id = cert["id"]
        user_id = str(cert["user_id"])
        course_id = str(cert["course_id"])
        current_score = cert["score_snapshot"]
        student_name = cert.get("student_name_snapshot", "Unknown")

        # Calculate authoritative eligibility and score
        try:
            eligibility = check_course_completion_and_eligibility(user_id, course_id)
            actual_score = eligibility.get("course_score")
        except Exception as e:
            print(f"  [WARN] Could not calculate eligibility for user {user_id}: {e}")
            actual_score = None

        # Fallback to direct student_module_progress if needed
        if actual_score is None:
            mods = sb.from_("course_modules").select("id").eq("course_id", course_id).execute().data or []
            mod_ids = [str(m["id"]) for m in mods]
            mp_res = sb.from_("student_module_progress").select("best_score").eq("user_id", user_id).in_("module_id", mod_ids).execute()
            scores = [int(r["best_score"]) for r in (mp_res.data or []) if r.get("best_score") is not None]
            if scores:
                actual_score = round(sum(scores) / len(scores))
            else:
                actual_score = current_score

        if actual_score != current_score:
            # Atomic update via delete + reinsert to preserve id, timestamps, verification_id, number
            updated_cert_payload = dict(cert)
            updated_cert_payload["score_snapshot"] = actual_score

            # Execute atomic replacement
            sb.from_("certificates").delete().eq("id", cert_id).execute()
            sb.from_("certificates").insert(updated_cert_payload).execute()

            print(f"{student_name:<26} | {current_score:>8}% | {actual_score:>10}% | UPDATED")
            updated_count += 1
        else:
            print(f"{student_name:<26} | {current_score:>8}% | {actual_score:>10}% | NO CHANGE")
            unchanged_count += 1

    print("-" * 70)
    print(f"Summary: {updated_count} certificates updated, {unchanged_count} unchanged.")

    # 3. Verification check
    print("\n[Step 3] Post-migration verification:")
    verify_res = sb.from_("certificates").select("student_name_snapshot, course_title_snapshot, score_snapshot").execute()
    for row in (verify_res.data or []):
        print(f"  • {row['student_name_snapshot']:<26} | Course: {row['course_title_snapshot']} | Score: {row['score_snapshot']}%")

    print("\nSynchronization completed successfully.")


if __name__ == "__main__":
    sync_certificate_scores()
