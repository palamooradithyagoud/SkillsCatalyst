"use client";

/**
 * frontend/app/courses/[courseId]/modules/[moduleId]/quiz/page.tsx
 * Phase 6 — Student Quiz Page.
 *
 * Security contract:
 *   - Quiz data fetched from server NEVER contains is_correct.
 *   - Selected answers are kept in local state only until submission.
 *   - The client submits only option IDs — scoring is entirely server-side.
 *   - Double-submission is prevented via `submitting` flag.
 */

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Trophy,
  RotateCcw,
  BookOpen,
  HelpCircle,
  Loader2,
  Lock,
  ClipboardList,
} from "lucide-react";

import { useAuth } from "@/lib/auth";
import {
  fetchModuleQuiz,
  submitModuleQuiz,
  fetchQuizAttempts,
  fetchModuleProgress,
} from "@/lib/api/courses";
import type {
  StudentQuizData,
  StudentQuizQuestion,
  QuizAttemptResult,
  QuizAttemptHistory,
  StudentModuleProgress,
} from "@/types/quiz-attempt";

// ── Local State Types ──────────────────────────────────────────────────────────
type AnswerMap = Record<string, string>; // question_id → selected_option_id
type ViewState = "loading" | "locked" | "quiz" | "submitting" | "result" | "error";

export default function StudentQuizPage() {
  const params = useParams();
  const router = useRouter();
  const { session } = useAuth();

  const courseIdOrSlug = params?.courseId as string;
  const moduleId = params?.moduleId as string;

  // ── State ──────────────────────────────────────────────────────────────────
  const [viewState, setViewState] = useState<ViewState>("loading");
  const [quiz, setQuiz] = useState<StudentQuizData | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [result, setResult] = useState<QuizAttemptResult | null>(null);
  const [history, setHistory] = useState<QuizAttemptHistory | null>(null);
  const [moduleProgress, setModuleProgress] = useState<StudentModuleProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // ── Load quiz + prerequisite state ────────────────────────────────────────
  useEffect(() => {
    let mounted = true;
    if (!courseIdOrSlug || !moduleId) return;

    async function load() {
      setViewState("loading");
      setError(null);

      if (!session?.user_id) {
        setError("Sign in to take this quiz.");
        setViewState("error");
        return;
      }

      try {
        // Load module progress to check if locked / already passed
        const [modProg, hist] = await Promise.all([
          fetchModuleProgress(courseIdOrSlug, moduleId).catch(() => null),
          fetchQuizAttempts(courseIdOrSlug, moduleId).catch(() => null),
        ]);

        if (!mounted) return;

        setModuleProgress(modProg);
        setHistory(hist);

        // Check if lessons are complete (required to unlock quiz)
        // The server will enforce this — but we also check client-side for UX
        if (modProg && !modProg.lessons_complete) {
          setViewState("locked");
          return;
        }

        // Load quiz questions (no is_correct in response)
        const quizData = await fetchModuleQuiz(courseIdOrSlug, moduleId);
        if (!mounted) return;
        setQuiz(quizData);
        setViewState("quiz");
      } catch (err: unknown) {
        if (!mounted) return;
        const msg = err instanceof Error ? err.message : "Failed to load quiz.";
        if (msg.toLowerCase().includes("lesson") || msg.toLowerCase().includes("complete")) {
          setViewState("locked");
        } else {
          setError(msg);
          setViewState("error");
        }
      }
    }

    load();
    return () => { mounted = false; };
  }, [courseIdOrSlug, moduleId, session]);

  // ── Answer selection ───────────────────────────────────────────────────────
  const handleSelectOption = useCallback((questionId: string, optionId: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionId }));
    setValidationError(null);
  }, []);

  // ── Navigation ─────────────────────────────────────────────────────────────
  const handlePrev = () => setCurrentIndex(i => Math.max(0, i - 1));
  const handleNext = () => {
    if (!quiz) return;
    setCurrentIndex(i => Math.min(quiz.questions.length - 1, i + 1));
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    if (!quiz || submitting) return;

    // Validate all questions answered
    const unanswered = quiz.questions.filter(q => !answers[q.id]);
    if (unanswered.length > 0) {
      setValidationError(
        `Please answer all questions before submitting. (${unanswered.length} unanswered)`
      );
      // Navigate to first unanswered question
      const firstUnansweredIdx = quiz.questions.findIndex(q => !answers[q.id]);
      setCurrentIndex(firstUnansweredIdx);
      return;
    }

    setSubmitting(true);
    setViewState("submitting");
    setValidationError(null);

    try {
      const submissionAnswers = quiz.questions.map(q => ({
        question_id: q.id,
        selected_option_id: answers[q.id],
      }));

      const attemptResult = await submitModuleQuiz(courseIdOrSlug, moduleId, {
        answers: submissionAnswers,
      });

      // Refresh history after submission
      const [updatedHist, updatedModProg] = await Promise.all([
        fetchQuizAttempts(courseIdOrSlug, moduleId).catch(() => null),
        fetchModuleProgress(courseIdOrSlug, moduleId).catch(() => null),
      ]);

      setResult(attemptResult);
      if (updatedHist) setHistory(updatedHist);
      if (updatedModProg) setModuleProgress(updatedModProg);
      setViewState("result");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Submission failed. Please try again.";
      setError(msg);
      setViewState("quiz"); // Return to quiz on error — preserve answers
      setValidationError(msg);
    } finally {
      setSubmitting(false);
    }
  }, [quiz, answers, submitting, courseIdOrSlug, moduleId]);

  // ── Retry ──────────────────────────────────────────────────────────────────
  const handleRetry = async () => {
    setResult(null);
    setAnswers({});
    setCurrentIndex(0);
    setValidationError(null);
    setError(null);
    setViewState("loading");

    try {
      const quizData = await fetchModuleQuiz(courseIdOrSlug, moduleId);
      setQuiz(quizData);
      setViewState("quiz");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to reload quiz.";
      setError(msg);
      setViewState("error");
    }
  };

  // ── Common header ──────────────────────────────────────────────────────────
  const Header = () => (
    <header className="sticky top-0 z-20 h-14 border-b border-white/10 bg-slate-900/90 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between shadow-sm">
      <Link
        href={`/courses/${courseIdOrSlug}`}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors"
        id="quiz-back-to-course"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Back to Course</span>
      </Link>
      <div className="flex items-center gap-2 text-xs font-semibold text-purple-300 px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20">
        <HelpCircle className="w-3.5 h-3.5" />
        Module Quiz
      </div>
    </header>
  );

  // ── Loading ────────────────────────────────────────────────────────────────
  if (viewState === "loading" || viewState === "submitting") {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4">
          <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20">
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
          </div>
          <p className="text-slate-400 text-sm font-medium">
            {viewState === "submitting" ? "Scoring your answers…" : "Loading quiz…"}
          </p>
          {viewState === "loading" && (
            <div className="w-full max-w-lg space-y-3 mt-4 animate-pulse">
              <div className="h-4 w-1/2 bg-white/10 rounded-lg mx-auto" />
              <div className="h-20 bg-white/5 rounded-2xl" />
              <div className="h-12 bg-white/5 rounded-xl" />
              <div className="h-12 bg-white/5 rounded-xl" />
              <div className="h-12 bg-white/5 rounded-xl" />
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (viewState === "error") {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center max-w-sm mx-auto">
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Quiz Unavailable</h1>
          <p className="text-sm text-slate-400 mb-6 leading-relaxed">
            {error || "The quiz could not be loaded. Please try again."}
          </p>
          <div className="flex gap-3 flex-wrap justify-center">
            <Link
              href={`/courses/${courseIdOrSlug}`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-sm transition-all border border-white/10"
              id="quiz-error-back"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Course
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Locked ─────────────────────────────────────────────────────────────────
  if (viewState === "locked") {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center max-w-sm mx-auto">
          <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-5">
            <Lock className="w-10 h-10" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Quiz Locked</h1>
          <p className="text-sm text-slate-400 mb-6 leading-relaxed">
            Complete all lessons in this module before taking the quiz.
          </p>
          <Link
            href={`/courses/${courseIdOrSlug}`}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm shadow-lg shadow-purple-600/30 transition-all"
            id="quiz-locked-back"
          >
            <BookOpen className="w-4 h-4" />
            Go to Lessons
          </Link>
        </div>
      </div>
    );
  }

  // ── Result ─────────────────────────────────────────────────────────────────
  if (viewState === "result" && result) {
    const passed = result.passed;
    const moduleComplete = result.module_completed;

    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
          <div className="w-full max-w-lg space-y-6">

            {/* Score Card */}
            <div
              id="quiz-result-card"
              className={`rounded-3xl border p-8 text-center shadow-2xl ${
                passed
                  ? "bg-gradient-to-br from-emerald-950/60 to-slate-900 border-emerald-500/30"
                  : "bg-gradient-to-br from-rose-950/60 to-slate-900 border-rose-500/30"
              }`}
            >
              {/* Icon */}
              <div className={`inline-flex p-4 rounded-2xl mb-4 ${
                passed ? "bg-emerald-500/20" : "bg-rose-500/20"
              }`}>
                {passed
                  ? <Trophy className="w-10 h-10 text-emerald-400" />
                  : <XCircle className="w-10 h-10 text-rose-400" />
                }
              </div>

              {/* Verdict */}
              <h1 className={`text-3xl font-black mb-1 ${passed ? "text-emerald-300" : "text-rose-300"}`}
                id="quiz-result-verdict">
                {passed ? "Quiz Passed!" : "Quiz Failed"}
              </h1>
              <p className="text-slate-400 text-sm mb-6">
                Attempt #{result.attempt_number}
              </p>

              {/* Score display */}
              <div className="flex items-center justify-center gap-6 mb-6">
                <div className="text-center">
                  <div className={`text-5xl font-black mb-1 ${passed ? "text-emerald-300" : "text-rose-300"}`}
                    id="quiz-result-score">
                    {result.score_percentage}%
                  </div>
                  <div className="text-xs text-slate-500 font-medium">Your Score</div>
                </div>
                <div className="w-px h-12 bg-white/10" />
                <div className="text-center">
                  <div className="text-3xl font-bold text-slate-300" id="quiz-result-passing-score">
                    {result.passing_score}%
                  </div>
                  <div className="text-xs text-slate-500 font-medium">Passing Score</div>
                </div>
              </div>

              {/* Correct count */}
              <div className="text-sm text-slate-400 mb-4" id="quiz-result-counts">
                {result.correct_count} of {result.total_questions} questions correct
              </div>

              {/* Progress bar */}
              <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden mb-6">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    passed ? "bg-gradient-to-r from-emerald-500 to-teal-400" : "bg-gradient-to-r from-rose-500 to-orange-400"
                  }`}
                  style={{ width: `${result.score_percentage}%` }}
                />
              </div>

              {/* Passing score marker line */}
              <div className="relative h-1 bg-transparent -mt-5 mb-5">
                <div
                  className="absolute top-0 w-0.5 h-4 bg-yellow-400/60 rounded"
                  style={{ left: `${result.passing_score}%` }}
                  title={`Passing: ${result.passing_score}%`}
                />
              </div>

              {/* Module complete banner */}
              {moduleComplete && (
                <div className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold text-sm mb-4"
                  id="quiz-module-complete-banner">
                  <CheckCircle2 className="w-4 h-4" />
                  Module Complete!
                </div>
              )}

              {/* Per-question results */}
              {result.answer_results.length > 0 && quiz && (
                <div className="mt-2 space-y-2 text-left" id="quiz-answer-results">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Per-Question Results</h3>
                  {result.answer_results.map((ar, idx) => {
                    const q = quiz.questions.find(q => q.id === ar.question_id);
                    return (
                      <div key={ar.question_id}
                        className={`flex items-start gap-3 p-3 rounded-xl border ${
                          ar.is_correct
                            ? "bg-emerald-500/10 border-emerald-500/20"
                            : "bg-rose-500/10 border-rose-500/20"
                        }`}
                      >
                        {ar.is_correct
                          ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          : <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                        }
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-slate-300 truncate">
                            Q{idx + 1}. {q?.question_text || "Question"}
                          </p>
                          <p className={`text-[11px] mt-0.5 ${ar.is_correct ? "text-emerald-400" : "text-rose-400"}`}>
                            {ar.is_correct ? "Correct" : "Incorrect"}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              {!passed && (
                <button
                  type="button"
                  onClick={handleRetry}
                  id="quiz-retry-button"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-lg shadow-purple-600/30 transition-all hover:scale-[1.02]"
                >
                  <RotateCcw className="w-4 h-4" />
                  Retry Quiz
                </button>
              )}
              <Link
                href={`/courses/${courseIdOrSlug}`}
                id="quiz-result-back-to-course"
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm border border-white/10 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                {moduleComplete ? "Continue Course" : "Back to Course"}
              </Link>
            </div>

            {/* Attempt History */}
            {history && history.attempts.length > 0 && (
              <AttemptHistoryPanel history={history} />
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Quiz Taking ────────────────────────────────────────────────────────────
  if (!quiz || viewState !== "quiz") return null;

  const currentQuestion: StudentQuizQuestion = quiz.questions[currentIndex];
  const totalQuestions = quiz.questions.length;
  const answeredCount = quiz.questions.filter(q => answers[q.id]).length;
  const isLastQuestion = currentIndex === totalQuestions - 1;
  const allAnswered = answeredCount === totalQuestions;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Header />

      <div className="flex-1 flex flex-col items-center px-4 py-6 sm:py-10">
        <div className="w-full max-w-2xl space-y-6">

          {/* Quiz Title */}
          <div className="text-center">
            <h1 className="text-xl sm:text-2xl font-black text-white" id="quiz-title">
              {quiz.title}
            </h1>
            {quiz.description && (
              <p className="text-sm text-slate-400 mt-1">{quiz.description}</p>
            )}
            <div className="flex items-center justify-center gap-4 mt-3 text-xs text-slate-500 font-medium">
              <span>Passing score: <span className="text-slate-300 font-bold">{quiz.passing_score}%</span></span>
              <span>•</span>
              <span id="quiz-answered-count">{answeredCount}/{totalQuestions} answered</span>
            </div>
          </div>

          {/* Question Progress Dots */}
          <div className="flex items-center gap-1.5 flex-wrap justify-center" role="navigation" aria-label="Question navigation">
            {quiz.questions.map((q, idx) => (
              <button
                key={q.id}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Question ${idx + 1}${answers[q.id] ? " (answered)" : ""}`}
                aria-current={idx === currentIndex ? "true" : undefined}
                className={`w-7 h-7 rounded-lg text-[11px] font-bold transition-all ${
                  idx === currentIndex
                    ? "bg-purple-600 text-white scale-110 shadow-lg shadow-purple-600/30"
                    : answers[q.id]
                      ? "bg-emerald-500/30 text-emerald-300 border border-emerald-500/30"
                      : "bg-white/10 text-slate-400 hover:bg-white/15 border border-white/5"
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          {/* Question Card */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-sm p-6 sm:p-8 shadow-xl">
            {/* Question counter */}
            <div className="flex items-center justify-between mb-5">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-md border border-purple-500/20"
                id="quiz-question-counter">
                Question {currentIndex + 1} of {totalQuestions}
              </span>
              {answers[currentQuestion.id] && (
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Answered
                </span>
              )}
            </div>

            {/* Question text */}
            <h2 className="text-base sm:text-lg font-semibold text-white leading-relaxed mb-6"
              id={`question-text-${currentQuestion.id}`}>
              {currentQuestion.question_text}
            </h2>

            {/* Options */}
            <fieldset aria-labelledby={`question-text-${currentQuestion.id}`}>
              <legend className="sr-only">Select an answer for Question {currentIndex + 1}</legend>
              <div className="space-y-3" role="radiogroup">
                {currentQuestion.options.map((option) => {
                  const isSelected = answers[currentQuestion.id] === option.id;
                  return (
                    <label
                      key={option.id}
                      id={`option-${option.id}`}
                      className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all hover:scale-[1.01] ${
                        isSelected
                          ? "bg-purple-600/20 border-purple-500/60 shadow-md shadow-purple-500/10"
                          : "bg-white/[0.03] border-white/10 hover:bg-white/[0.06] hover:border-white/20"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${currentQuestion.id}`}
                        value={option.id}
                        checked={isSelected}
                        onChange={() => handleSelectOption(currentQuestion.id, option.id)}
                        className="sr-only"
                        aria-label={option.option_text}
                      />
                      {/* Custom radio indicator */}
                      <div className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${
                        isSelected
                          ? "border-purple-400 bg-purple-400"
                          : "border-slate-500"
                      }`}>
                        {isSelected && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                      <span className={`text-sm font-medium leading-relaxed ${
                        isSelected ? "text-white" : "text-slate-300"
                      }`}>
                        {option.option_text}
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          </div>

          {/* Validation Error */}
          {validationError && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm"
              role="alert" aria-live="polite" id="quiz-validation-error">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              id="quiz-prev-button"
              aria-label="Previous question"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm border border-white/10 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Previous</span>
            </button>

            {/* Center: answered progress */}
            <span className="text-xs text-slate-400 font-medium">
              {answeredCount}/{totalQuestions} answered
            </span>

            {isLastQuestion ? (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || !allAnswered}
                id="quiz-submit-button"
                aria-label="Submit quiz"
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg transition-all hover:scale-[1.02] ${
                  allAnswered && !submitting
                    ? "bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/30"
                    : "bg-white/10 text-slate-400 border border-white/10 cursor-not-allowed"
                }`}
              >
                {submitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Scoring…</>
                ) : (
                  <><ClipboardList className="w-4 h-4" /> Submit Quiz</>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                id="quiz-next-button"
                aria-label="Next question"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm shadow-lg shadow-purple-600/20 transition-all hover:scale-[1.01]"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Inline attempt history */}
          {history && history.attempts.length > 0 && (
            <AttemptHistoryPanel history={history} />
          )}
        </div>
      </div>
    </div>
  );
}


// ── Attempt History Panel ──────────────────────────────────────────────────────
function AttemptHistoryPanel({ history }: { history: QuizAttemptHistory }) {
  if (history.attempts.length === 0) return null;

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-5" id="quiz-attempt-history">
      <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
        <ClipboardList className="w-4 h-4 text-purple-400" />
        Attempt History
      </h3>
      <div className="space-y-2">
        {[...history.attempts].reverse().map((attempt) => (
          <div
            key={attempt.attempt_id}
            className={`flex items-center justify-between px-4 py-3 rounded-xl border ${
              attempt.passed
                ? "bg-emerald-500/10 border-emerald-500/20"
                : "bg-white/[0.03] border-white/10"
            }`}
          >
            <div className="flex items-center gap-3">
              {attempt.passed
                ? <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                : <XCircle className="w-4 h-4 text-rose-400" />
              }
              <div>
                <span className="text-sm font-semibold text-slate-200">
                  Attempt {attempt.attempt_number}
                </span>
                {attempt.submitted_at && (
                  <p className="text-[11px] text-slate-500">
                    {new Date(attempt.submitted_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
            <div className="text-right">
              <span className={`text-sm font-bold ${attempt.passed ? "text-emerald-300" : "text-slate-300"}`}>
                {attempt.score_percentage}%
              </span>
              <p className={`text-[11px] font-semibold ${attempt.passed ? "text-emerald-400" : "text-rose-400"}`}>
                {attempt.passed ? "Passed" : "Failed"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
