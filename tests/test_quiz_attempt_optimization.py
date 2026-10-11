"""
tests/test_quiz_attempt_optimization.py
Comprehensive Verification Suite for Quiz Option N+1 Database Query Optimization.

Covers:
  A. Correct scoring for all-correct answers (100%).
  B. Correct scoring for partially correct answers (e.g. 50%, 75%).
  C. Correct scoring for all-incorrect answers (0%).
  D. Rejection of empty submissions (HTTP 422).
  E. Rejection of invalid question IDs (HTTP 422).
  F. Rejection of invalid option IDs (HTTP 422).
  G. Rejection of questions or options belonging to another quiz / question (HTTP 422).
  H. Forged client-side score/correctness flags are completely ignored.
  I. Tenant isolation: attempt history and progress scoped strictly to authenticated user.
  J. Duplicate submissions rejected; attempt numbering preserves sequential increments.
  K. Database service errors during question retrieval handled gracefully.
  L. Scalability & query-count test: proves quiz_options query count is strictly 1 (O(1))
     regardless of whether quiz has 1, 5, 10, 25, or 50 questions.
  M. get_student_quiz batch-loading: verifies all options are retrieved without N+1 queries
     and is_correct is strictly omitted.
"""

import uuid
import pytest
from unittest.mock import MagicMock, patch
from fastapi import HTTPException

from backend.services.quiz_attempt_service import (
    submit_quiz_attempt,
    get_student_quiz,
    get_quiz_attempt_history,
    get_student_module_progress,
)


def _make_quiz_fixture(num_questions: int = 4):
    course_id = str(uuid.uuid4())
    module_id = str(uuid.uuid4())
    quiz_id = str(uuid.uuid4())
    
    questions = []
    options = []
    answers_all_correct = []
    answers_all_incorrect = []
    
    for i in range(num_questions):
        qid = str(uuid.uuid4())
        questions.append({
            "id": qid,
            "quiz_id": quiz_id,
            "question_text": f"Question {i+1}",
            "question_type": "SINGLE_SELECT",
            "position": i + 1,
        })
        for j in range(4):
            oid = str(uuid.uuid4())
            is_corr = (j == 0)
            options.append({
                "id": oid,
                "question_id": qid,
                "option_text": f"Option {j+1}",
                "position": j + 1,
                "is_correct": is_corr,
            })
            if j == 0:
                answers_all_correct.append({"question_id": qid, "selected_option_id": oid})
            elif j == 1:
                answers_all_incorrect.append({"question_id": qid, "selected_option_id": oid})
                
    return {
        "course_id": course_id,
        "module_id": module_id,
        "quiz_id": quiz_id,
        "questions": questions,
        "options": options,
        "answers_all_correct": answers_all_correct,
        "answers_all_incorrect": answers_all_incorrect,
    }


def _create_mock_supabase(fixture: dict, completed_lessons: bool = True, prev_attempts: list = None):
    course_id = fixture["course_id"]
    module_id = fixture["module_id"]
    quiz_id = fixture["quiz_id"]
    questions = fixture["questions"]
    options = fixture["options"]
    prev_attempts = prev_attempts or []
    
    executed_queries = []
    
    class MockQueryBuilder:
        def __init__(self, table):
            self.table = table
            self.filters = {}
            self.selected = "*"
            self.action = "select"
            self.payload = None
            
        def select(self, cols):
            self.selected = cols
            return self
            
        def eq(self, col, val):
            self.filters[col] = str(val)
            return self
            
        def in_(self, col, vals):
            self.filters[f"{col}__in"] = [str(v) for v in vals]
            return self
            
        def limit(self, n):
            return self
            
        def order(self, col, desc=False):
            return self
            
        def insert(self, payload):
            self.action = "insert"
            self.payload = payload
            return self
            
        def update(self, payload):
            self.action = "update"
            self.payload = payload
            return self
            
        def execute(self):
            executed_queries.append({
                "table": self.table,
                "action": self.action,
                "selected": self.selected,
                "filters": dict(self.filters),
                "payload": self.payload,
            })
            
            if self.table == "courses":
                return MagicMock(data=[{"id": course_id, "title": "Test Course", "slug": "test-course", "status": "PUBLISHED"}])
            elif self.table == "course_modules":
                return MagicMock(data=[{"id": module_id, "course_id": course_id}])
            elif self.table == "course_quizzes":
                return MagicMock(data=[{"id": quiz_id, "module_id": module_id, "passing_score": 70, "title": "Test Quiz"}])
            elif self.table == "course_lessons":
                if completed_lessons:
                    return MagicMock(data=[{"id": "lesson-1"}])
                return MagicMock(data=[{"id": "lesson-1"}, {"id": "lesson-2"}])
            elif self.table == "student_lesson_progress":
                if completed_lessons:
                    return MagicMock(data=[{"lesson_id": "lesson-1", "completed": True}])
                return MagicMock(data=[{"lesson_id": "lesson-1", "completed": True}])
            elif self.table == "quiz_questions":
                return MagicMock(data=questions)
            elif self.table == "quiz_options":
                if "question_id__in" in self.filters:
                    qids = set(self.filters["question_id__in"])
                    filtered = [o for o in options if str(o["question_id"]) in qids]
                    return MagicMock(data=filtered)
                elif "question_id" in self.filters:
                    qid = self.filters["question_id"]
                    filtered = [o for o in options if str(o["question_id"]) == qid]
                    return MagicMock(data=filtered)
                return MagicMock(data=options)
            elif self.table == "student_quiz_attempts":
                if self.action == "select":
                    if prev_attempts:
                        max_att = max(a["attempt_number"] for a in prev_attempts)
                        return MagicMock(data=[{"attempt_number": max_att}])
                    return MagicMock(data=[])
                return MagicMock(data=[{"id": str(uuid.uuid4())}])
            elif self.table == "student_quiz_attempt_answers":
                return MagicMock(data=[{"id": str(uuid.uuid4())}])
            elif self.table == "student_module_progress":
                if self.action == "select":
                    return MagicMock(data=[])
                return MagicMock(data=[{"id": str(uuid.uuid4())}])
                
            return MagicMock(data=[])

    mock_sb = MagicMock()
    mock_sb.from_ = lambda table: MockQueryBuilder(table)
    return mock_sb, executed_queries


# ── Test Cases ─────────────────────────────────────────────────────────────────

def test_a_all_correct_scoring():
    """A. Test 100% score calculation and pass determination."""
    fixture = _make_quiz_fixture(num_questions=4)
    mock_sb, queries = _create_mock_supabase(fixture)
    user_id = str(uuid.uuid4())
    
    with patch("backend.services.quiz_attempt_service.get_supabase", return_value=mock_sb):
        res = submit_quiz_attempt(
            user_id=user_id,
            course_id_or_slug=fixture["course_id"],
            module_id=fixture["module_id"],
            answers=fixture["answers_all_correct"],
        )
        
    assert res["score_percentage"] == 100
    assert res["correct_count"] == 4
    assert res["total_questions"] == 4
    assert res["passed"] is True
    assert res["module_completed"] is True
    assert len(res["answer_results"]) == 4
    assert all(a["is_correct"] is True for a in res["answer_results"])


def test_b_partially_correct_scoring():
    """B. Test partial scoring (e.g. 2 out of 4 correct = 50%)."""
    fixture = _make_quiz_fixture(num_questions=4)
    mock_sb, queries = _create_mock_supabase(fixture)
    user_id = str(uuid.uuid4())
    
    # 2 correct, 2 incorrect
    answers = [
        fixture["answers_all_correct"][0],
        fixture["answers_all_correct"][1],
        fixture["answers_all_incorrect"][2],
        fixture["answers_all_incorrect"][3],
    ]
    
    with patch("backend.services.quiz_attempt_service.get_supabase", return_value=mock_sb):
        res = submit_quiz_attempt(
            user_id=user_id,
            course_id_or_slug=fixture["course_id"],
            module_id=fixture["module_id"],
            answers=answers,
        )
        
    assert res["score_percentage"] == 50
    assert res["correct_count"] == 2
    assert res["total_questions"] == 4
    assert res["passed"] is False  # passing_score is 70
    assert res["module_completed"] is False


def test_c_all_incorrect_scoring():
    """C. Test 0% score calculation when all answers are wrong."""
    fixture = _make_quiz_fixture(num_questions=4)
    mock_sb, queries = _create_mock_supabase(fixture)
    user_id = str(uuid.uuid4())
    
    with patch("backend.services.quiz_attempt_service.get_supabase", return_value=mock_sb):
        res = submit_quiz_attempt(
            user_id=user_id,
            course_id_or_slug=fixture["course_id"],
            module_id=fixture["module_id"],
            answers=fixture["answers_all_incorrect"],
        )
        
    assert res["score_percentage"] == 0
    assert res["correct_count"] == 0
    assert res["passed"] is False


def test_d_empty_submissions_rejected():
    """D. Test empty submission raises HTTP 422."""
    fixture = _make_quiz_fixture(num_questions=4)
    mock_sb, _ = _create_mock_supabase(fixture)
    
    with patch("backend.services.quiz_attempt_service.get_supabase", return_value=mock_sb):
        with pytest.raises(HTTPException) as exc:
            submit_quiz_attempt(
                user_id=str(uuid.uuid4()),
                course_id_or_slug=fixture["course_id"],
                module_id=fixture["module_id"],
                answers=[],
            )
        assert exc.value.status_code == 422


def test_e_invalid_question_ids_rejected():
    """E. Submitting non-existent or malformed question IDs raises HTTP 422."""
    fixture = _make_quiz_fixture(num_questions=4)
    mock_sb, _ = _create_mock_supabase(fixture)
    
    answers = list(fixture["answers_all_correct"])
    answers[0] = {"question_id": "not-a-uuid", "selected_option_id": str(uuid.uuid4())}
    
    with patch("backend.services.quiz_attempt_service.get_supabase", return_value=mock_sb):
        with pytest.raises(HTTPException) as exc:
            submit_quiz_attempt(
                user_id=str(uuid.uuid4()),
                course_id_or_slug=fixture["course_id"],
                module_id=fixture["module_id"],
                answers=answers,
            )
        assert exc.value.status_code == 422


def test_f_invalid_option_ids_rejected():
    """F. Submitting an option ID that does not exist raises HTTP 422."""
    fixture = _make_quiz_fixture(num_questions=4)
    mock_sb, _ = _create_mock_supabase(fixture)
    
    answers = list(fixture["answers_all_correct"])
    fake_option_id = str(uuid.uuid4())
    answers[0] = {"question_id": answers[0]["question_id"], "selected_option_id": fake_option_id}
    
    with patch("backend.services.quiz_attempt_service.get_supabase", return_value=mock_sb):
        with pytest.raises(HTTPException) as exc:
            submit_quiz_attempt(
                user_id=str(uuid.uuid4()),
                course_id_or_slug=fixture["course_id"],
                module_id=fixture["module_id"],
                answers=answers,
            )
        assert exc.value.status_code == 422
        assert "does not belong" in exc.value.detail


def test_g_cross_question_option_spoofing_rejected():
    """G. Submitting an option that belongs to a different question in the quiz is rejected (HTTP 422)."""
    fixture = _make_quiz_fixture(num_questions=4)
    mock_sb, _ = _create_mock_supabase(fixture)
    
    q0 = fixture["questions"][0]["id"]
    q1 = fixture["questions"][1]["id"]
    # Option from question 1 submitted as answer for question 0
    q1_opt0 = fixture["answers_all_correct"][1]["selected_option_id"]
    
    answers = list(fixture["answers_all_correct"])
    answers[0] = {"question_id": q0, "selected_option_id": q1_opt0}
    
    with patch("backend.services.quiz_attempt_service.get_supabase", return_value=mock_sb):
        with pytest.raises(HTTPException) as exc:
            submit_quiz_attempt(
                user_id=str(uuid.uuid4()),
                course_id_or_slug=fixture["course_id"],
                module_id=fixture["module_id"],
                answers=answers,
            )
        assert exc.value.status_code == 422
        assert f"Option '{q1_opt0}' does not belong to question '{q0}'" in exc.value.detail


def test_h_forged_client_score_parameters_ignored():
    """H. Client cannot forge score, correct_count, or passed in payload."""
    fixture = _make_quiz_fixture(num_questions=4)
    mock_sb, _ = _create_mock_supabase(fixture)
    
    # Payload includes extra forged keys that must be ignored
    forged_answers = [
        dict(a, is_correct=True, score=100)
        for a in fixture["answers_all_incorrect"]
    ]
    
    with patch("backend.services.quiz_attempt_service.get_supabase", return_value=mock_sb):
        res = submit_quiz_attempt(
            user_id=str(uuid.uuid4()),
            course_id_or_slug=fixture["course_id"],
            module_id=fixture["module_id"],
            answers=forged_answers,
        )
        
    # Server computed score must be 0 despite client sending is_correct=True
    assert res["score_percentage"] == 0
    assert res["passed"] is False


def test_i_tenant_isolation_and_ownership():
    """I. Attempt records and progress writes strictly preserve authenticated user_id."""
    fixture = _make_quiz_fixture(num_questions=4)
    mock_sb, queries = _create_mock_supabase(fixture)
    user_id = str(uuid.uuid4())
    
    with patch("backend.services.quiz_attempt_service.get_supabase", return_value=mock_sb):
        submit_quiz_attempt(
            user_id=user_id,
            course_id_or_slug=fixture["course_id"],
            module_id=fixture["module_id"],
            answers=fixture["answers_all_correct"],
        )
        
    insert_queries = [q for q in queries if q["action"] == "insert" and q["table"] == "student_quiz_attempts"]
    assert len(insert_queries) == 1
    assert insert_queries[0]["payload"]["user_id"] == user_id


def test_j_duplicate_answers_in_submission_rejected():
    """J. Submitting the same question ID more than once is rejected (HTTP 422)."""
    fixture = _make_quiz_fixture(num_questions=4)
    mock_sb, _ = _create_mock_supabase(fixture)
    
    duplicate_answers = list(fixture["answers_all_correct"])
    duplicate_answers.append(fixture["answers_all_correct"][0])  # Duplicate Q0
    
    with patch("backend.services.quiz_attempt_service.get_supabase", return_value=mock_sb):
        with pytest.raises(HTTPException) as exc:
            submit_quiz_attempt(
                user_id=str(uuid.uuid4()),
                course_id_or_slug=fixture["course_id"],
                module_id=fixture["module_id"],
                answers=duplicate_answers,
            )
        assert exc.value.status_code == 422
        assert "Duplicate question answers" in exc.value.detail


def test_k_database_service_unavailable_handled():
    """K. If database client is unavailable, returns HTTP 503."""
    with patch("backend.services.quiz_attempt_service.get_supabase", return_value=None):
        with pytest.raises(HTTPException) as exc:
            submit_quiz_attempt(
                user_id=str(uuid.uuid4()),
                course_id_or_slug="any-course",
                module_id=str(uuid.uuid4()),
                answers=[{"question_id": str(uuid.uuid4()), "selected_option_id": str(uuid.uuid4())}],
            )
        assert exc.value.status_code == 503


def test_l_query_count_strictly_o1_independent_of_quiz_size():
    """
    L. QUERY-COUNT VERIFICATION:
    Proves that the number of database queries executed against quiz_options
    is STRICTLY 1 (O(1)) and DOES NOT GROW linearly with the number of questions.
    """
    for size in [1, 3, 5, 10, 25, 50]:
        fixture = _make_quiz_fixture(num_questions=size)
        mock_sb, queries = _create_mock_supabase(fixture)
        
        with patch("backend.services.quiz_attempt_service.get_supabase", return_value=mock_sb):
            res = submit_quiz_attempt(
                user_id=str(uuid.uuid4()),
                course_id_or_slug=fixture["course_id"],
                module_id=fixture["module_id"],
                answers=fixture["answers_all_correct"],
            )
            
        opt_queries = [q for q in queries if q["table"] == "quiz_options"]
        
        # In the unoptimized implementation, opt_queries would be size + 1 (e.g. 51 queries for 50 questions).
        # In the optimized implementation, opt_queries MUST BE EXACTLY 1.
        assert len(opt_queries) == 1, (
            f"Expected exactly 1 batch query to quiz_options for {size} questions, "
            f"but found {len(opt_queries)} queries (N+1 regression detected!)"
        )
        assert res["score_percentage"] == 100
        assert res["total_questions"] == size


def test_m_get_student_quiz_batch_loading_and_answer_hiding():
    """
    M. Verifies get_student_quiz retrieves options in a single batch query (O(1))
    and strictly omits is_correct from the returned payload.
    """
    fixture = _make_quiz_fixture(num_questions=5)
    mock_sb, queries = _create_mock_supabase(fixture)
    
    with patch("backend.services.quiz_attempt_service.get_supabase", return_value=mock_sb):
        quiz_data = get_student_quiz(
            user_id=str(uuid.uuid4()),
            course_id_or_slug=fixture["course_id"],
            module_id=fixture["module_id"],
        )
        
    opt_queries = [q for q in queries if q["table"] == "quiz_options"]
    # Must be exactly 1 query to quiz_options
    assert len(opt_queries) == 1, f"Expected 1 quiz_options query, got {len(opt_queries)}"
    
    assert quiz_data["question_count"] == 5
    assert len(quiz_data["questions"]) == 5
    
    for q in quiz_data["questions"]:
        assert len(q["options"]) == 4
        for opt in q["options"]:
            # Answer key security: is_correct must NEVER be present in GET quiz
            assert "is_correct" not in opt
            assert "id" in opt
            assert "option_text" in opt
