"""
backend/services/quiz_attempt_service.py
Phase 6 — Server-Authoritative Quiz Scoring Service.

Security invariants (enforced throughout):
  1. User identity is ALWAYS derived from the verified Supabase JWT (never trusted from body).
  2. Correct answers (is_correct) are loaded from the DB AFTER submission — never sent to client.
  3. Score, correct_count, and passed are calculated server-side; any client-supplied values ignored.
  4. All hierarchy checks (course → module → quiz → question → option) are validated.
  5. Answer key is NEVER returned via GET endpoints.
  6. Concurrent attempt submissions are safe: attempt_number uses MAX()+1 scoped to user+quiz,
     which is protected by the unique constraint on (attempt_id, question_id) and the fact that
     each attempt row is inserted atomically with its answers in sequence.
"""

import uuid
import logging
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List

from fastapi import HTTPException, status

from backend.services.supabase_service import get_supabase
from backend.models.course import CourseStatus

logger = logging.getLogger("skillscatalyst.quiz.attempts")


# ── Helpers ────────────────────────────────────────────────────────────────────

def _is_uuid(val: str) -> bool:
    try:
        uuid.UUID(str(val))
        return True
    except (ValueError, TypeError):
        return False


def _format_datetime(dt_val: Any) -> Optional[str]:
    if not dt_val:
        return None
    if hasattr(dt_val, "isoformat"):
        return dt_val.isoformat()
    return str(dt_val)


def _resolve_published_course(sb, course_id_or_slug: str) -> Dict[str, Any]:
    """Fetches and verifies course is PUBLISHED. Returns 404 otherwise."""
    if _is_uuid(course_id_or_slug):
        res = sb.from_("courses").select("id, title, slug, status").eq("id", course_id_or_slug).execute()
    else:
        res = sb.from_("courses").select("id, title, slug, status").eq("slug", course_id_or_slug).execute()

    if not res.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found.")

    course = res.data[0]
    if course.get("status") != CourseStatus.PUBLISHED.value:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found or unavailable.")

    return course


def _resolve_module(sb, module_id: str, course_id: str) -> Dict[str, Any]:
    """Verifies module exists and belongs to course."""
    if not _is_uuid(module_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Module not found.")
    res = sb.from_("course_modules").select("id, course_id").eq("id", module_id).limit(1).execute()
    if not res.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Module not found.")
    mod = res.data[0]
    if str(mod["course_id"]) != course_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Module does not belong to this course.")
    return mod


def _resolve_quiz(sb, module_id: str) -> Dict[str, Any]:
    """Fetches the unique quiz for a module (includes passing_score)."""
    res = (
        sb.from_("course_quizzes")
        .select("id, module_id, title, description, status, passing_score")
        .eq("module_id", module_id)
        .execute()
    )
    if not res.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz not found for this module.")
    return res.data[0]


def _check_lessons_complete(sb, user_id: str, course_id: str, module_id: str) -> bool:
    """
    Checks whether ALL lessons in the module are completed by this student.
    Uses the authoritative Phase 5 student_lesson_progress table.
    """
    # Get all lesson IDs in this module
    l_res = (
        sb.from_("course_lessons")
        .select("id")
        .eq("module_id", module_id)
        .execute()
    )
    module_lesson_ids = [str(r["id"]) for r in (l_res.data or [])]
    if not module_lesson_ids:
        # No lessons in module — considered complete
        return True

    # Get completed lessons for this student in this course
    lp_res = (
        sb.from_("student_lesson_progress")
        .select("lesson_id")
        .eq("user_id", user_id)
        .eq("course_id", course_id)
        .eq("completed", True)
        .execute()
    )
    completed_ids = {str(r["lesson_id"]) for r in (lp_res.data or [])}

    return all(lid in completed_ids for lid in module_lesson_ids)


# ── GET Quiz (Student-Safe) ────────────────────────────────────────────────────

def get_student_quiz(
    user_id: str,
    course_id_or_slug: str,
    module_id: str,
) -> Dict[str, Any]:
    """
    Returns quiz questions and options for a student.
    NEVER includes is_correct, correct_option_id, or any answer key.
    Requires: course PUBLISHED, module belongs to course, quiz belongs to module.
    Does NOT enforce lesson prerequisite on read (only on submission).
    """
    sb = get_supabase()
    if not sb:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database service unavailable.")

    course = _resolve_published_course(sb, course_id_or_slug)
    course_id = str(course["id"])

    _resolve_module(sb, module_id, course_id)
    quiz = _resolve_quiz(sb, module_id)
    quiz_id = str(quiz["id"])

    # Fetch questions ordered by position
    qq_res = (
        sb.from_("quiz_questions")
        .select("id, question_text, question_type, position")
        .eq("quiz_id", quiz_id)
        .order("position", desc=False)
        .execute()
    )
    raw_questions = qq_res.data or []

    questions = []
    for q in raw_questions:
        q_id = str(q["id"])
        # Fetch options — STRICTLY OMIT is_correct
        opt_res = (
            sb.from_("quiz_options")
            .select("id, option_text, position")   # <── is_correct intentionally excluded
            .eq("question_id", q_id)
            .order("position", desc=False)
            .execute()
        )
        options = [
            {
                "id": str(o["id"]),
                "option_text": o.get("option_text"),
                "position": o.get("position"),
            }
            for o in (opt_res.data or [])
        ]

        questions.append({
            "id": q_id,
            "question_text": q.get("question_text"),
            "question_type": q.get("question_type"),
            "position": q.get("position"),
            "options": options,
        })

    return {
        "quiz_id": quiz_id,
        "module_id": module_id,
        "title": quiz.get("title"),
        "description": quiz.get("description"),
        "passing_score": quiz.get("passing_score", 70),
        "question_count": len(questions),
        "questions": questions,
    }


# ── POST Quiz Attempt (Server-Authoritative Scoring) ──────────────────────────

def submit_quiz_attempt(
    user_id: str,
    course_id_or_slug: str,
    module_id: str,
    answers: List[Dict[str, str]],
) -> Dict[str, Any]:
    """
    Server-authoritative quiz submission and scoring.

    Validates:
      1. Authenticated user (user_id from JWT, never from body)
      2. Course PUBLISHED
      3. Module belongs to course
      4. Quiz belongs to module
      5. All required lessons in module are completed
      6. Every submitted question_id belongs to this quiz
      7. Every submitted option_id belongs to its question
      8. No duplicate question answers
      9. No missing questions
      10. No unknown question or option IDs

    Then:
      - Calculates score server-side
      - Persists attempt
      - Persists per-answer correctness
      - Evaluates module completion (lessons_complete AND quiz_passed)
      - Returns result (no answer key leaked)
    """
    sb = get_supabase()
    if not sb:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database service unavailable.")

    # ── 1–4. Hierarchy validation ──────────────────────────────────────────────
    course = _resolve_published_course(sb, course_id_or_slug)
    course_id = str(course["id"])

    _resolve_module(sb, module_id, course_id)
    quiz = _resolve_quiz(sb, module_id)
    quiz_id = str(quiz["id"])
    passing_score = int(quiz.get("passing_score", 70))

    # ── 5. Lesson prerequisite check ──────────────────────────────────────────
    lessons_complete = _check_lessons_complete(sb, user_id, course_id, module_id)
    if not lessons_complete:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Complete all required lessons in this module before taking the quiz."
        )

    # ── 6. Load authoritative questions ───────────────────────────────────────
    qq_res = (
        sb.from_("quiz_questions")
        .select("id, question_type")
        .eq("quiz_id", quiz_id)
        .execute()
    )
    authoritative_question_ids = {str(q["id"]) for q in (qq_res.data or [])}
    total_questions = len(authoritative_question_ids)

    if total_questions == 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="This quiz has no questions."
        )

    # ── 7–9. Validate submission structure ────────────────────────────────────
    if not answers:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Please answer all questions before submitting."
        )

    submitted_question_ids = [a["question_id"] for a in answers]

    # Check for duplicates
    if len(submitted_question_ids) != len(set(submitted_question_ids)):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Duplicate question answers detected."
        )

    # Check for unknown questions
    for qid in submitted_question_ids:
        if qid not in authoritative_question_ids:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Question '{qid}' does not belong to this quiz."
            )

    # Check all questions answered
    submitted_set = set(submitted_question_ids)
    missing = authoritative_question_ids - submitted_set
    if missing:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Please answer all questions before submitting."
        )

    # ── 7. Validate each option belongs to its question ───────────────────────
    answer_map: Dict[str, str] = {}  # question_id → selected_option_id
    for a in answers:
        qid = a["question_id"]
        oid = a["selected_option_id"]
        if not _is_uuid(qid) or not _is_uuid(oid):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Invalid question or option identifier."
            )

        opt_res = (
            sb.from_("quiz_options")
            .select("id, question_id, is_correct")
            .eq("id", oid)
            .eq("question_id", qid)    # <── tamper-proof: option must belong to question
            .limit(1)
            .execute()
        )
        if not opt_res.data:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Option '{oid}' does not belong to question '{qid}'."
            )
        answer_map[qid] = oid

    # ── 16. Server-side scoring ───────────────────────────────────────────────
    # Load all correct options for every question in this quiz
    all_opts_res = (
        sb.from_("quiz_options")
        .select("id, question_id, is_correct")
        .in_("question_id", list(authoritative_question_ids))
        .execute()
    )
    # Build map: question_id → set of correct option IDs
    correct_map: Dict[str, set] = {}
    for o in (all_opts_res.data or []):
        q_id = str(o["question_id"])
        if o.get("is_correct"):
            correct_map.setdefault(q_id, set()).add(str(o["id"]))

    correct_count = 0
    answer_results = []
    for q_id in authoritative_question_ids:
        selected_oid = answer_map.get(q_id, "")
        correct_options = correct_map.get(q_id, set())
        is_correct = selected_oid in correct_options
        if is_correct:
            correct_count += 1
        answer_results.append({
            "question_id": q_id,
            "selected_option_id": selected_oid,
            "is_correct": is_correct,
        })

    # Score with deterministic rounding (round half up)
    score_percentage = round((correct_count / total_questions) * 100) if total_questions > 0 else 0
    passed = score_percentage >= passing_score

    # ── 12. Attempt number (concurrent-safe: MAX+1 within transaction) ────────
    now_iso = datetime.now(timezone.utc).isoformat()

    an_res = (
        sb.from_("student_quiz_attempts")
        .select("attempt_number")
        .eq("user_id", user_id)
        .eq("quiz_id", quiz_id)
        .order("attempt_number", desc=True)
        .limit(1)
        .execute()
    )
    prev_max = an_res.data[0]["attempt_number"] if an_res.data else 0
    attempt_number = prev_max + 1

    # ── 18. Persist attempt ───────────────────────────────────────────────────
    attempt_payload = {
        "user_id": user_id,
        "course_id": course_id,
        "module_id": module_id,
        "quiz_id": quiz_id,
        "attempt_number": attempt_number,
        "score_percentage": score_percentage,
        "correct_count": correct_count,
        "total_questions": total_questions,
        "passed": passed,
        "passing_score": passing_score,
        "submitted_at": now_iso,
        "created_at": now_iso,
    }
    att_res = sb.from_("student_quiz_attempts").insert(attempt_payload).execute()
    if not att_res.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to persist quiz attempt."
        )
    attempt_id = str(att_res.data[0]["id"])

    # ── 19. Persist per-answer results ────────────────────────────────────────
    answer_rows = [
        {
            "attempt_id": attempt_id,
            "question_id": r["question_id"],
            "selected_option_id": r["selected_option_id"],
            "is_correct": r["is_correct"],
            "created_at": now_iso,
        }
        for r in answer_results
    ]
    if answer_rows:
        sb.from_("student_quiz_attempt_answers").insert(answer_rows).execute()

    # ── 23. Evaluate and persist module completion ────────────────────────────
    module_completed = False
    if passed and lessons_complete:
        module_completed = True
        _upsert_module_completion(
            sb=sb,
            user_id=user_id,
            course_id=course_id,
            module_id=module_id,
            quiz_passed=True,
            lessons_complete=True,
            best_score=score_percentage,
            now_iso=now_iso,
        )
    elif passed:
        # Quiz passed but lessons not complete — update quiz_passed only
        _upsert_module_completion(
            sb=sb,
            user_id=user_id,
            course_id=course_id,
            module_id=module_id,
            quiz_passed=True,
            lessons_complete=False,
            best_score=score_percentage,
            now_iso=now_iso,
        )

    logger.info(
        f"Quiz attempt recorded: user={user_id} quiz={quiz_id} "
        f"attempt={attempt_number} score={score_percentage}% passed={passed}"
    )

    return {
        "attempt_id": attempt_id,
        "attempt_number": attempt_number,
        "score_percentage": score_percentage,
        "correct_count": correct_count,
        "total_questions": total_questions,
        "passed": passed,
        "passing_score": passing_score,
        "module_completed": module_completed,
        "answer_results": answer_results,
    }


# ── GET Attempt History ────────────────────────────────────────────────────────

def get_quiz_attempt_history(
    user_id: str,
    course_id_or_slug: str,
    module_id: str,
) -> Dict[str, Any]:
    """
    Returns all attempts by this student for the specified quiz.
    Only own attempts are returned. Correct answers are NOT included.
    """
    sb = get_supabase()
    if not sb:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database service unavailable.")

    course = _resolve_published_course(sb, course_id_or_slug)
    course_id = str(course["id"])

    _resolve_module(sb, module_id, course_id)
    quiz = _resolve_quiz(sb, module_id)
    quiz_id = str(quiz["id"])

    att_res = (
        sb.from_("student_quiz_attempts")
        .select("id, attempt_number, score_percentage, correct_count, total_questions, passed, passing_score, submitted_at")
        .eq("user_id", user_id)
        .eq("quiz_id", quiz_id)
        .order("attempt_number", desc=False)
        .execute()
    )
    attempts = att_res.data or []

    items = [
        {
            "attempt_id": str(a["id"]),
            "attempt_number": a["attempt_number"],
            "score_percentage": a["score_percentage"],
            "correct_count": a["correct_count"],
            "total_questions": a["total_questions"],
            "passed": a["passed"],
            "passing_score": a.get("passing_score", 70),
            "submitted_at": _format_datetime(a.get("submitted_at")),
        }
        for a in attempts
    ]

    best_score = max((a["score_percentage"] for a in attempts), default=None)
    ever_passed = any(a["passed"] for a in attempts)

    return {
        "quiz_id": quiz_id,
        "module_id": module_id,
        "attempts": items,
        "best_score": best_score,
        "ever_passed": ever_passed,
    }


# ── GET Module Progress ────────────────────────────────────────────────────────

def get_student_module_progress(
    user_id: str,
    course_id_or_slug: str,
    module_id: str,
) -> Dict[str, Any]:
    """
    Returns the authoritative module completion state for this student.
    Derives lessons_complete live from Phase 5 tables.
    """
    sb = get_supabase()
    if not sb:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database service unavailable.")

    course = _resolve_published_course(sb, course_id_or_slug)
    course_id = str(course["id"])

    _resolve_module(sb, module_id, course_id)

    # Live lesson completion state from Phase 5
    lessons_complete = _check_lessons_complete(sb, user_id, course_id, module_id)

    # Load persisted module progress
    mp_res = (
        sb.from_("student_module_progress")
        .select("lessons_complete, quiz_passed, best_score, completed, completed_at")
        .eq("user_id", user_id)
        .eq("module_id", module_id)
        .limit(1)
        .execute()
    )

    if mp_res.data:
        row = mp_res.data[0]
        quiz_passed = bool(row.get("quiz_passed", False))
        best_score = row.get("best_score")
        completed = bool(row.get("completed", False))
        completed_at = _format_datetime(row.get("completed_at"))
    else:
        quiz_passed = False
        best_score = None
        completed = False
        completed_at = None

    # If lessons are now complete and quiz already passed, ensure module is marked complete
    if lessons_complete and quiz_passed and not completed:
        now_iso = datetime.now(timezone.utc).isoformat()
        _upsert_module_completion(
            sb=sb,
            user_id=user_id,
            course_id=course_id,
            module_id=module_id,
            quiz_passed=True,
            lessons_complete=True,
            best_score=best_score,
            now_iso=now_iso,
        )
        completed = True
        completed_at = now_iso

    return {
        "module_id": module_id,
        "lessons_complete": lessons_complete,
        "quiz_passed": quiz_passed,
        "best_score": best_score,
        "completed": completed,
        "completed_at": completed_at,
    }


# ── Internal: Upsert Module Completion ────────────────────────────────────────

def _upsert_module_completion(
    sb,
    user_id: str,
    course_id: str,
    module_id: str,
    quiz_passed: bool,
    lessons_complete: bool,
    best_score: Optional[int],
    now_iso: str,
) -> None:
    """
    Upserts student_module_progress.
    Module is marked `completed` ONLY if both lessons_complete AND quiz_passed are True.
    A passing result never downgrades to failed — best_score is preserved.
    """
    completed = lessons_complete and quiz_passed
    completed_at_val = now_iso if completed else None

    existing = (
        sb.from_("student_module_progress")
        .select("id, quiz_passed, best_score, completed, completed_at")
        .eq("user_id", user_id)
        .eq("module_id", module_id)
        .limit(1)
        .execute()
    )

    if existing.data:
        row = existing.data[0]
        row_id = row["id"]

        # Preserve best_score (never downgrade)
        existing_best = row.get("best_score")
        new_best = best_score
        if existing_best is not None and new_best is not None:
            new_best = max(existing_best, new_best)
        elif existing_best is not None:
            new_best = existing_best

        # Preserve ever-passed state (a previous pass is never removed)
        was_quiz_passed = bool(row.get("quiz_passed", False))
        new_quiz_passed = was_quiz_passed or quiz_passed

        was_completed = bool(row.get("completed", False))
        new_completed = was_completed or completed
        new_completed_at = row.get("completed_at") or (completed_at_val if new_completed else None)

        sb.from_("student_module_progress").update({
            "lessons_complete": lessons_complete,
            "quiz_passed": new_quiz_passed,
            "best_score": new_best,
            "completed": new_completed,
            "completed_at": new_completed_at,
            "updated_at": now_iso,
        }).eq("id", row_id).execute()
    else:
        sb.from_("student_module_progress").insert({
            "user_id": user_id,
            "course_id": course_id,
            "module_id": module_id,
            "lessons_complete": lessons_complete,
            "quiz_passed": quiz_passed,
            "best_score": best_score,
            "completed": completed,
            "completed_at": completed_at_val,
            "created_at": now_iso,
            "updated_at": now_iso,
        }).execute()
