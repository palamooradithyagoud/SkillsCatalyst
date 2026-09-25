"""
backend/models/quiz_attempt.py
Pydantic schemas for Phase 6 — Student Quiz Attempts, Scoring, and Module Completion.

Security contract:
  - No `is_correct` or `correct_option_id` fields appear in GET quiz response models.
  - The backend calculates all scores; the frontend submits only option IDs.
  - `passed` and `score_percentage` are NEVER accepted from the client.
"""

from typing import List, Optional
from pydantic import BaseModel, Field


# ── Student-safe Quiz Read ─────────────────────────────────────────────────────

class StudentQuizOption(BaseModel):
    """Option exposed to students. NEVER includes is_correct."""
    id: str = Field(..., description="UUID of the option")
    option_text: str = Field(..., description="Display text of the option")
    position: int = Field(..., description="Display order")


class StudentQuizQuestion(BaseModel):
    """Question exposed to students. NEVER includes correct answer data."""
    id: str = Field(..., description="UUID of the question")
    question_text: str = Field(..., description="The question text")
    question_type: str = Field(..., description="SINGLE_SELECT | MULTI_SELECT | TRUE_FALSE")
    position: int = Field(..., description="Display order")
    options: List[StudentQuizOption] = Field(default_factory=list)


class StudentQuizResponse(BaseModel):
    """
    Full quiz payload returned to a student.
    Contains NO is_correct, NO correct_option_id, NO answer keys.
    """
    quiz_id: str = Field(..., description="UUID of the quiz")
    module_id: str = Field(..., description="UUID of the module")
    title: str = Field(..., description="Quiz title")
    description: Optional[str] = Field(None, description="Quiz instructions")
    passing_score: int = Field(..., description="Minimum % to pass (e.g. 70)")
    question_count: int = Field(..., description="Total number of questions")
    questions: List[StudentQuizQuestion] = Field(default_factory=list)


# ── Submission ─────────────────────────────────────────────────────────────────

class QuizAnswerItem(BaseModel):
    """Single answer submitted by the student."""
    question_id: str = Field(..., description="UUID of the question being answered")
    selected_option_id: str = Field(..., description="UUID of the selected option")


class QuizSubmissionPayload(BaseModel):
    """
    What the student submits.
    The client MUST NOT send score, passed, correct_count, or is_correct.
    Those are calculated server-side and any such fields in the body are ignored.
    """
    answers: List[QuizAnswerItem] = Field(
        ...,
        min_length=1,
        description="One answer per question. All questions must be answered."
    )


# ── Result ─────────────────────────────────────────────────────────────────────

class QuizAttemptAnswerResult(BaseModel):
    """Per-question result returned after submission."""
    question_id: str
    selected_option_id: str
    is_correct: bool


class QuizAttemptResult(BaseModel):
    """
    Server-authoritative result returned after scoring.
    Contains no answer key — only per-question correctness for this specific attempt.
    """
    attempt_id: str = Field(..., description="UUID of the created attempt")
    attempt_number: int = Field(..., description="1-indexed attempt number")
    score_percentage: int = Field(..., description="Server-calculated score 0-100")
    correct_count: int = Field(..., description="Number of correct answers")
    total_questions: int = Field(..., description="Total questions scored")
    passed: bool = Field(..., description="True if score_percentage >= passing_score")
    passing_score: int = Field(..., description="Threshold required to pass")
    module_completed: bool = Field(
        ...,
        description="True if this pass + lesson completion triggered module completion"
    )
    answer_results: List[QuizAttemptAnswerResult] = Field(
        default_factory=list,
        description="Per-question correctness (does not reveal what the correct answer was)"
    )


# ── Attempt History ────────────────────────────────────────────────────────────

class QuizAttemptHistoryItem(BaseModel):
    """Summary of a single attempt for the history list."""
    attempt_id: str
    attempt_number: int
    score_percentage: int
    correct_count: int
    total_questions: int
    passed: bool
    passing_score: int
    submitted_at: Optional[str] = None


class QuizAttemptHistoryResponse(BaseModel):
    quiz_id: str
    module_id: str
    attempts: List[QuizAttemptHistoryItem] = Field(default_factory=list)
    best_score: Optional[int] = None
    ever_passed: bool = False


# ── Module Completion ──────────────────────────────────────────────────────────

class StudentModuleProgressResponse(BaseModel):
    """Module-level completion state."""
    module_id: str
    lessons_complete: bool
    quiz_passed: bool
    best_score: Optional[int] = None
    completed: bool
    completed_at: Optional[str] = None
