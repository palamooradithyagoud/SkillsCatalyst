"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  BookOpen,
  Plus,
  Search,
  RefreshCw,
  Edit3,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  Layers,
  FileText,
  Check,
  X,
  Send,
  Archive,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import type {
  CourseItem,
  CourseDetail,
  CourseStatus,
  CourseDifficulty,
  CourseSortOption,
  CourseModuleItem,
  CourseLessonItem,
  CourseQuizItem,
  QuizQuestionItem,
  QuizOptionItem,
  CreateCoursePayload,
  UpdateCoursePayload,
  CreateModulePayload,
  UpdateModulePayload,
  CreateLessonPayload,
  UpdateLessonPayload,
  CreateQuizPayload,
  UpdateQuizPayload,
  CreateQuestionPayload,
  UpdateQuestionPayload,
  CreateOptionPayload,
  UpdateOptionPayload,
} from "@/types/course";
import {
  fetchAdminCourses,
  fetchAdminCourseById,
  createAdminCourse,
  updateAdminCourse,
  deleteAdminCourse,
  publishAdminCourse,
  unpublishAdminCourse,
  archiveAdminCourse,
  createAdminModule,
  updateAdminModule,
  deleteAdminModule,
  reorderAdminModules,
  createAdminLesson,
  updateAdminLesson,
  deleteAdminLesson,
  reorderAdminLessons,
  createAdminQuiz,
  updateAdminQuiz,
  createAdminQuestion,
  updateAdminQuestion,
  deleteAdminQuestion,
  reorderAdminQuestions,
  createAdminOption,
  updateAdminOption,
  deleteAdminOption,
  reorderAdminOptions,
} from "@/lib/api/courses";

export default function AdminCoursesCMS() {
  // Navigation / View State
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  // ── List View State ──────────────────────────────────────────────────────────
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [sortOption, setSortOption] = useState<CourseSortOption>("newest");
  const [page, setPage] = useState(1);
  const pageSize = 15;
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // ── Detail View State ────────────────────────────────────────────────────────
  const [courseDetail, setCourseDetail] = useState<CourseDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [publishErrors, setPublishErrors] = useState<string[]>([]);
  const [publishSuccessMsg, setPublishSuccessMsg] = useState<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState(false);

  // ── Modal States ─────────────────────────────────────────────────────────────
  // Course Modals
  const [isCreateCourseOpen, setIsCreateCourseOpen] = useState(false);
  const [isEditCourseOpen, setIsEditCourseOpen] = useState(false);
  const [courseFormSubmitting, setCourseFormSubmitting] = useState(false);
  const [courseForm, setCourseForm] = useState<{
    title: string;
    slug: string;
    short_description: string;
    description: string;
    category: string;
    difficulty: CourseDifficulty;
    estimated_duration_minutes: string;
    thumbnail_url: string;
  }>({
    title: "",
    slug: "",
    short_description: "",
    description: "",
    category: "Engineering",
    difficulty: "beginner",
    estimated_duration_minutes: "60",
    thumbnail_url: "",
  });

  // Module Modal
  const [moduleModal, setModuleModal] = useState<{
    isOpen: boolean;
    mode: "create" | "edit";
    moduleId?: string;
    title: string;
    description: string;
  }>({
    isOpen: false,
    mode: "create",
    title: "",
    description: "",
  });

  // Lesson Modal
  const [lessonModal, setLessonModal] = useState<{
    isOpen: boolean;
    mode: "create" | "edit";
    moduleId: string;
    lessonId?: string;
    title: string;
    slug: string;
    short_description: string;
    estimated_duration_minutes: string;
  }>({
    isOpen: false,
    mode: "create",
    moduleId: "",
    title: "",
    slug: "",
    short_description: "",
    estimated_duration_minutes: "15",
  });

  // Quiz Modal
  const [quizModal, setQuizModal] = useState<{
    isOpen: boolean;
    mode: "create" | "edit";
    moduleId: string;
    quizId?: string;
    title: string;
    description: string;
  }>({
    isOpen: false,
    mode: "create",
    moduleId: "",
    title: "",
    description: "",
  });

  // Question Modal
  const [questionModal, setQuestionModal] = useState<{
    isOpen: boolean;
    mode: "create" | "edit";
    quizId: string;
    questionId?: string;
    question_text: string;
    explanation: string;
  }>({
    isOpen: false,
    mode: "create",
    quizId: "",
    question_text: "",
    explanation: "",
  });

  // Option Modal
  const [optionModal, setOptionModal] = useState<{
    isOpen: boolean;
    mode: "create" | "edit";
    questionId: string;
    optionId?: string;
    option_text: string;
    is_correct: boolean;
  }>({
    isOpen: false,
    mode: "create",
    questionId: "",
    option_text: "",
    is_correct: false,
  });

  // Delete Confirm Modal
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    type: "course" | "module" | "lesson" | "question" | "option";
    id: string;
    name: string;
    parentId?: string;
  }>({
    isOpen: false,
    type: "course",
    id: "",
    name: "",
  });

  // ── Fetch Courses (List View) ────────────────────────────────────────────────
  const loadCourses = useCallback(async () => {
    try {
      setListLoading(true);
      setListError(null);
      const res = await fetchAdminCourses({
        search,
        status_filter: statusFilter,
        difficulty: difficultyFilter,
        category: categoryFilter,
        sort: sortOption,
        page,
        page_size: pageSize,
      });
      setCourses(res.items);
      setTotalCount(res.total);
      setTotalPages(res.total_pages);
    } catch (err: unknown) {
      setListError(err instanceof Error ? err.message : "Failed to load courses");
    } finally {
      setListLoading(false);
    }
  }, [search, statusFilter, difficultyFilter, categoryFilter, sortOption, page]);

  useEffect(() => {
    let ignore = false;
    if (!selectedCourseId) {
      fetchAdminCourses({
        search,
        status_filter: statusFilter,
        difficulty: difficultyFilter,
        category: categoryFilter,
        sort: sortOption,
        page,
        page_size: pageSize,
      })
        .then((res) => {
          if (!ignore) {
            setCourses(res.items);
            setTotalCount(res.total);
            setTotalPages(res.total_pages);
            setListLoading(false);
          }
        })
        .catch((err: unknown) => {
          if (!ignore) {
            setListError(err instanceof Error ? err.message : "Failed to load courses");
            setListLoading(false);
          }
        });
    }
    return () => {
      ignore = true;
    };
  }, [search, statusFilter, difficultyFilter, categoryFilter, sortOption, page, selectedCourseId]);

  // ── Fetch Single Course Detail ───────────────────────────────────────────────
  const loadCourseDetail = useCallback(async (courseId: string) => {
    try {
      setDetailLoading(true);
      setDetailError(null);
      setPublishErrors([]);
      setPublishSuccessMsg(null);
      const data = await fetchAdminCourseById(courseId);
      setCourseDetail(data);
    } catch (err: unknown) {
      setDetailError(err instanceof Error ? err.message : "Failed to load course details");
    } finally {
      setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    if (selectedCourseId) {
      fetchAdminCourseById(selectedCourseId)
        .then((data) => {
          if (!ignore) {
            setCourseDetail(data);
            setDetailLoading(false);
          }
        })
        .catch((err: unknown) => {
          if (!ignore) {
            setDetailError(err instanceof Error ? err.message : "Failed to load course details");
            setDetailLoading(false);
          }
        });
    }
    return () => {
      ignore = true;
    };
  }, [selectedCourseId]);

  // ── Course Handlers ──────────────────────────────────────────────────────────
  const handleOpenCreateCourse = () => {
    setCourseForm({
      title: "",
      slug: "",
      short_description: "",
      description: "",
      category: "Engineering",
      difficulty: "beginner",
      estimated_duration_minutes: "60",
      thumbnail_url: "",
    });
    setIsCreateCourseOpen(true);
  };

  const handleOpenEditCourse = (course: CourseItem | CourseDetail) => {
    setCourseForm({
      title: course.title,
      slug: course.slug,
      short_description: course.short_description || "",
      description: course.description || "",
      category: course.category || "Engineering",
      difficulty: (course.difficulty as CourseDifficulty) || "beginner",
      estimated_duration_minutes: course.estimated_duration_minutes ? String(course.estimated_duration_minutes) : "60",
      thumbnail_url: course.thumbnail_url || "",
    });
    setIsEditCourseOpen(true);
  };

  const handleCreateCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseForm.title.trim()) return;

    try {
      setCourseFormSubmitting(true);
      const payload: CreateCoursePayload = {
        title: courseForm.title.trim(),
        short_description: courseForm.short_description.trim() || undefined,
        description: courseForm.description.trim() || undefined,
        category: courseForm.category.trim() || undefined,
        difficulty: courseForm.difficulty,
        estimated_duration_minutes: courseForm.estimated_duration_minutes
          ? parseInt(courseForm.estimated_duration_minutes, 10)
          : undefined,
        thumbnail_url: courseForm.thumbnail_url.trim() || undefined,
      };
      const created = await createAdminCourse(payload);
      setIsCreateCourseOpen(false);
      setSelectedCourseId(created.id);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to create course");
    } finally {
      setCourseFormSubmitting(false);
    }
  };

  const handleEditCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const activeId = courseDetail?.id || selectedCourseId;
    if (!activeId || !courseForm.title.trim()) return;

    try {
      setCourseFormSubmitting(true);
      const payload: UpdateCoursePayload = {
        title: courseForm.title.trim(),
        short_description: courseForm.short_description.trim() || undefined,
        description: courseForm.description.trim() || undefined,
        category: courseForm.category.trim() || undefined,
        difficulty: courseForm.difficulty,
        estimated_duration_minutes: courseForm.estimated_duration_minutes
          ? parseInt(courseForm.estimated_duration_minutes, 10)
          : undefined,
        thumbnail_url: courseForm.thumbnail_url.trim() || undefined,
      };
      await updateAdminCourse(activeId, payload);
      setIsEditCourseOpen(false);
      if (courseDetail) {
        await loadCourseDetail(courseDetail.id);
      } else {
        await loadCourses();
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to update course");
    } finally {
      setCourseFormSubmitting(false);
    }
  };

  const handlePublishCourse = async () => {
    if (!courseDetail) return;
    setPublishErrors([]);
    setPublishSuccessMsg(null);
    try {
      setActionInProgress(true);
      const updated = await publishAdminCourse(courseDetail.id);
      setCourseDetail(updated);
      setPublishSuccessMsg("Course published successfully! All validation requirements passed.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to publish course";
      if (msg.includes("Course is not ready for publishing:")) {
        const errorPart = msg.replace(/^.*?Course is not ready for publishing:\s*/, "");
        const parsedErrors = errorPart.split(";").map((s) => s.trim()).filter(Boolean);
        setPublishErrors(parsedErrors.length > 0 ? parsedErrors : [errorPart]);
      } else {
        setPublishErrors([msg]);
      }
    } finally {
      setActionInProgress(false);
    }
  };

  const handleUnpublishCourse = async () => {
    if (!courseDetail) return;
    try {
      setActionInProgress(true);
      const updated = await unpublishAdminCourse(courseDetail.id);
      setCourseDetail(updated);
      setPublishSuccessMsg("Course returned to DRAFT state.");
      setPublishErrors([]);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to unpublish course");
    } finally {
      setActionInProgress(false);
    }
  };

  const handleArchiveCourse = async () => {
    if (!courseDetail) return;
    try {
      setActionInProgress(true);
      const updated = await archiveAdminCourse(courseDetail.id);
      setCourseDetail(updated);
      setPublishSuccessMsg("Course archived.");
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to archive course");
    } finally {
      setActionInProgress(false);
    }
  };

  // ── Module Handlers ──────────────────────────────────────────────────────────
  const handleOpenModuleModal = (mode: "create" | "edit", mod?: CourseModuleItem) => {
    setModuleModal({
      isOpen: true,
      mode,
      moduleId: mod?.id,
      title: mod?.title || "",
      description: mod?.description || "",
    });
  };

  const handleModuleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseDetail || !moduleModal.title.trim()) return;

    try {
      setActionInProgress(true);
      if (moduleModal.mode === "create") {
        const payload: CreateModulePayload = {
          title: moduleModal.title.trim(),
          description: moduleModal.description.trim() || undefined,
        };
        await createAdminModule(courseDetail.id, payload);
      } else if (moduleModal.moduleId) {
        const payload: UpdateModulePayload = {
          title: moduleModal.title.trim(),
          description: moduleModal.description.trim() || undefined,
        };
        await updateAdminModule(moduleModal.moduleId, payload);
      }
      setModuleModal({ isOpen: false, mode: "create", title: "", description: "" });
      await loadCourseDetail(courseDetail.id);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to save module");
    } finally {
      setActionInProgress(false);
    }
  };

  const handleReorderModules = async (direction: "up" | "down", index: number) => {
    if (!courseDetail || !courseDetail.modules) return;
    const items = [...courseDetail.modules];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    // Swap
    const temp = items[index];
    items[index] = items[targetIndex];
    items[targetIndex] = temp;

    const payload = {
      items: items.map((m, idx) => ({ id: m.id, position: idx + 1 })),
    };

    try {
      setActionInProgress(true);
      await reorderAdminModules(courseDetail.id, payload);
      await loadCourseDetail(courseDetail.id);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to reorder modules");
    } finally {
      setActionInProgress(false);
    }
  };

  // ── Lesson Handlers ──────────────────────────────────────────────────────────
  const handleOpenLessonModal = (mode: "create" | "edit", moduleId: string, les?: CourseLessonItem) => {
    setLessonModal({
      isOpen: true,
      mode,
      moduleId,
      lessonId: les?.id,
      title: les?.title || "",
      slug: les?.slug || "",
      short_description: les?.short_description || "",
      estimated_duration_minutes: les?.estimated_duration_minutes ? String(les.estimated_duration_minutes) : "15",
    });
  };

  const handleLessonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseDetail || !lessonModal.title.trim()) return;

    try {
      setActionInProgress(true);
      if (lessonModal.mode === "create") {
        const payload: CreateLessonPayload = {
          title: lessonModal.title.trim(),
          slug: lessonModal.slug.trim() || undefined,
          short_description: lessonModal.short_description.trim() || undefined,
          estimated_duration_minutes: lessonModal.estimated_duration_minutes
            ? parseInt(lessonModal.estimated_duration_minutes, 10)
            : undefined,
        };
        await createAdminLesson(lessonModal.moduleId, payload);
      } else if (lessonModal.lessonId) {
        const payload: UpdateLessonPayload = {
          title: lessonModal.title.trim(),
          slug: lessonModal.slug.trim() || undefined,
          short_description: lessonModal.short_description.trim() || undefined,
          estimated_duration_minutes: lessonModal.estimated_duration_minutes
            ? parseInt(lessonModal.estimated_duration_minutes, 10)
            : undefined,
        };
        await updateAdminLesson(lessonModal.lessonId, payload);
      }
      setLessonModal({
        isOpen: false,
        mode: "create",
        moduleId: "",
        title: "",
        slug: "",
        short_description: "",
        estimated_duration_minutes: "15",
      });
      await loadCourseDetail(courseDetail.id);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to save lesson");
    } finally {
      setActionInProgress(false);
    }
  };

  const handleReorderLessons = async (moduleId: string, direction: "up" | "down", index: number) => {
    if (!courseDetail) return;
    const mod = courseDetail.modules.find((m) => m.id === moduleId);
    if (!mod || !mod.lessons) return;

    const items = [...mod.lessons];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const temp = items[index];
    items[index] = items[targetIndex];
    items[targetIndex] = temp;

    const payload = {
      items: items.map((l, idx) => ({ id: l.id, position: idx + 1 })),
    };

    try {
      setActionInProgress(true);
      await reorderAdminLessons(moduleId, payload);
      await loadCourseDetail(courseDetail.id);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to reorder lessons");
    } finally {
      setActionInProgress(false);
    }
  };

  // ── Quiz Handlers ────────────────────────────────────────────────────────────
  const handleOpenQuizModal = (mode: "create" | "edit", moduleId: string, quiz?: CourseQuizItem | null) => {
    setQuizModal({
      isOpen: true,
      mode,
      moduleId,
      quizId: quiz?.id,
      title: quiz?.title || "Module Quiz",
      description: quiz?.description || "",
    });
  };

  const handleQuizSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseDetail || !quizModal.title.trim()) return;

    try {
      setActionInProgress(true);
      if (quizModal.mode === "create") {
        const payload: CreateQuizPayload = {
          title: quizModal.title.trim(),
          description: quizModal.description.trim() || undefined,
        };
        await createAdminQuiz(quizModal.moduleId, payload);
      } else if (quizModal.quizId) {
        const payload: UpdateQuizPayload = {
          title: quizModal.title.trim(),
          description: quizModal.description.trim() || undefined,
        };
        await updateAdminQuiz(quizModal.quizId, payload);
      }
      setQuizModal({ isOpen: false, mode: "create", moduleId: "", title: "", description: "" });
      await loadCourseDetail(courseDetail.id);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to save quiz");
    } finally {
      setActionInProgress(false);
    }
  };

  // ── Question Handlers ────────────────────────────────────────────────────────
  const handleOpenQuestionModal = (mode: "create" | "edit", quizId: string, q?: QuizQuestionItem) => {
    setQuestionModal({
      isOpen: true,
      mode,
      quizId,
      questionId: q?.id,
      question_text: q?.question_text || "",
      explanation: q?.explanation || "",
    });
  };

  const handleQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseDetail || !questionModal.question_text.trim()) return;

    try {
      setActionInProgress(true);
      if (questionModal.mode === "create") {
        const payload: CreateQuestionPayload = {
          question_text: questionModal.question_text.trim(),
          explanation: questionModal.explanation.trim() || undefined,
        };
        await createAdminQuestion(questionModal.quizId, payload);
      } else if (questionModal.questionId) {
        const payload: UpdateQuestionPayload = {
          question_text: questionModal.question_text.trim(),
          explanation: questionModal.explanation.trim() || undefined,
        };
        await updateAdminQuestion(questionModal.questionId, payload);
      }
      setQuestionModal({
        isOpen: false,
        mode: "create",
        quizId: "",
        question_text: "",
        explanation: "",
      });
      await loadCourseDetail(courseDetail.id);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to save question");
    } finally {
      setActionInProgress(false);
    }
  };

  const handleReorderQuestions = async (quizId: string, direction: "up" | "down", index: number) => {
    if (!courseDetail) return;
    let quiz: CourseQuizItem | null = null;
    for (const mod of courseDetail.modules) {
      if (mod.quiz && mod.quiz.id === quizId) {
        quiz = mod.quiz;
        break;
      }
    }
    if (!quiz || !quiz.questions) return;

    const items = [...quiz.questions];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const temp = items[index];
    items[index] = items[targetIndex];
    items[targetIndex] = temp;

    const payload = {
      items: items.map((q, idx) => ({ id: q.id, position: idx + 1 })),
    };

    try {
      setActionInProgress(true);
      await reorderAdminQuestions(quizId, payload);
      await loadCourseDetail(courseDetail.id);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to reorder questions");
    } finally {
      setActionInProgress(false);
    }
  };

  // ── Option Handlers ──────────────────────────────────────────────────────────
  const handleOpenOptionModal = (mode: "create" | "edit", questionId: string, opt?: QuizOptionItem) => {
    setOptionModal({
      isOpen: true,
      mode,
      questionId,
      optionId: opt?.id,
      option_text: opt?.option_text || "",
      is_correct: opt?.is_correct || false,
    });
  };

  const handleOptionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseDetail || !optionModal.option_text.trim()) return;

    try {
      setActionInProgress(true);
      if (optionModal.mode === "create") {
        const payload: CreateOptionPayload = {
          option_text: optionModal.option_text.trim(),
          is_correct: optionModal.is_correct,
        };
        await createAdminOption(optionModal.questionId, payload);
      } else if (optionModal.optionId) {
        const payload: UpdateOptionPayload = {
          option_text: optionModal.option_text.trim(),
          is_correct: optionModal.is_correct,
        };
        await updateAdminOption(optionModal.optionId, payload);
      }
      setOptionModal({
        isOpen: false,
        mode: "create",
        questionId: "",
        option_text: "",
        is_correct: false,
      });
      await loadCourseDetail(courseDetail.id);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to save option");
    } finally {
      setActionInProgress(false);
    }
  };

  const handleSetCorrectOption = async (questionId: string, optionId: string) => {
    if (!courseDetail) return;
    try {
      setActionInProgress(true);
      // Backend automatically sets other options to false for SINGLE_SELECT questions
      await updateAdminOption(optionId, { is_correct: true });
      await loadCourseDetail(courseDetail.id);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to set correct option");
    } finally {
      setActionInProgress(false);
    }
  };

  const handleReorderOptions = async (questionId: string, direction: "up" | "down", index: number) => {
    if (!courseDetail) return;
    let targetQuestion: QuizQuestionItem | null = null;
    for (const mod of courseDetail.modules) {
      if (mod.quiz && mod.quiz.questions) {
        for (const q of mod.quiz.questions) {
          if (q.id === questionId) {
            targetQuestion = q;
            break;
          }
        }
      }
    }
    if (!targetQuestion || !targetQuestion.options) return;

    const items = [...targetQuestion.options];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const temp = items[index];
    items[index] = items[targetIndex];
    items[targetIndex] = temp;

    const payload = {
      items: items.map((o, idx) => ({ id: o.id, position: idx + 1 })),
    };

    try {
      setActionInProgress(true);
      await reorderAdminOptions(questionId, payload);
      await loadCourseDetail(courseDetail.id);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to reorder options");
    } finally {
      setActionInProgress(false);
    }
  };

  // ── Deletion Handler ─────────────────────────────────────────────────────────
  const handleConfirmDelete = async () => {
    if (!deleteConfirm.id) return;
    try {
      setActionInProgress(true);
      switch (deleteConfirm.type) {
        case "course":
          await deleteAdminCourse(deleteConfirm.id);
          setDeleteConfirm({ isOpen: false, type: "course", id: "", name: "" });
          setSelectedCourseId(null);
          await loadCourses();
          break;
        case "module":
          await deleteAdminModule(deleteConfirm.id);
          setDeleteConfirm({ isOpen: false, type: "module", id: "", name: "" });
          if (courseDetail) await loadCourseDetail(courseDetail.id);
          break;
        case "lesson":
          await deleteAdminLesson(deleteConfirm.id);
          setDeleteConfirm({ isOpen: false, type: "lesson", id: "", name: "" });
          if (courseDetail) await loadCourseDetail(courseDetail.id);
          break;
        case "question":
          await deleteAdminQuestion(deleteConfirm.id);
          setDeleteConfirm({ isOpen: false, type: "question", id: "", name: "" });
          if (courseDetail) await loadCourseDetail(courseDetail.id);
          break;
        case "option":
          await deleteAdminOption(deleteConfirm.id);
          setDeleteConfirm({ isOpen: false, type: "option", id: "", name: "" });
          if (courseDetail) await loadCourseDetail(courseDetail.id);
          break;
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete item");
    } finally {
      setActionInProgress(false);
    }
  };

  // ── Helper Badge Renderers ───────────────────────────────────────────────────
  const renderStatusBadge = (status: CourseStatus) => {
    switch (status) {
      case "PUBLISHED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> PUBLISHED
          </span>
        );
      case "IN_REVIEW":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <Clock className="w-3 h-3 text-amber-400" /> IN REVIEW
          </span>
        );
      case "ARCHIVED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
            <Archive className="w-3 h-3 text-slate-400" /> ARCHIVED
          </span>
        );
      case "DRAFT":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
            <Sparkles className="w-3 h-3 text-purple-400" /> DRAFT
          </span>
        );
    }
  };

  const renderDifficultyBadge = (difficulty: CourseDifficulty | string) => {
    const diff = String(difficulty || "").toLowerCase();
    switch (diff) {
      case "beginner":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-teal-500/10 text-teal-400 border border-teal-500/20">
            Beginner
          </span>
        );
      case "intermediate":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
            Intermediate
          </span>
        );
      case "advanced":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
            Advanced
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
            {difficulty}
          </span>
        );
    }
  };

  // ═════════════════════════════════════════════════════════════════════════════
  // DETAIL VIEW
  // ═════════════════════════════════════════════════════════════════════════════
  if (selectedCourseId) {
    if (detailLoading && !courseDetail) {
      return (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-purple-400" />
          <p className="text-sm">Loading course hierarchy...</p>
        </div>
      );
    }

    if (detailError || !courseDetail) {
      return (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-8 space-y-4">
          <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/40 text-rose-300 text-sm flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{detailError || "Course not found"}</span>
          </div>
          <button
            onClick={() => setSelectedCourseId(null)}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold cursor-pointer"
          >
            ← Return to Courses
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-6 animate-in fade-in duration-150">
        {/* Detail Header & Action Bar */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <button
                onClick={() => {
                  setSelectedCourseId(null);
                  void loadCourses();
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors mb-1 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back to Courses List</span>
              </button>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">{courseDetail.title}</h1>
                {renderStatusBadge(courseDetail.status)}
                {renderDifficultyBadge(courseDetail.difficulty)}
                {courseDetail.category && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                    {courseDetail.category}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-mono">
                slug: <span className="text-purple-300">{courseDetail.slug}</span> &bull; {courseDetail.estimated_duration_minutes || 0} min estimated
              </p>
            </div>

            {/* Header Lifecycle Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleOpenEditCourse(courseDetail)}
                disabled={actionInProgress}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                <span>Edit Metadata</span>
              </button>

              {courseDetail.status !== "PUBLISHED" ? (
                <button
                  onClick={handlePublishCourse}
                  disabled={actionInProgress}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Publish Course</span>
                </button>
              ) : (
                <button
                  onClick={handleUnpublishCourse}
                  disabled={actionInProgress}
                  className="px-3 py-2 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Revert to Draft</span>
                </button>
              )}

              {courseDetail.status !== "ARCHIVED" && (
                <button
                  onClick={handleArchiveCourse}
                  disabled={actionInProgress}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-rose-950/40 text-slate-300 hover:text-rose-300 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Archive className="w-3.5 h-3.5" />
                  <span>Archive</span>
                </button>
              )}
            </div>
          </div>

          {/* Publish Success Feedback Banner */}
          {publishSuccessMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 text-xs flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{publishSuccessMsg}</span>
              </div>
              <button
                onClick={() => setPublishSuccessMsg(null)}
                className="p-1 text-emerald-400 hover:text-emerald-200 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Server-Side Publish Validation Errors Banner */}
          {publishErrors.length > 0 && (
            <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-800/50 text-rose-300 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-rose-200">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>Publication Blocked — Server-Side Validation Incomplete</span>
                </div>
                <button
                  onClick={() => setPublishErrors([])}
                  className="p-1 text-rose-400 hover:text-rose-200 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[11px] text-rose-300">
                SkillsCatalyst enforces strict relational publishing invariants. Please resolve all of the following requirements before publishing:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-[11px] text-rose-200 font-mono">
                {publishErrors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Course Hierarchy Canvas */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" />
                <span>Course Modules &amp; Quizzes</span>
              </h2>
              <p className="text-xs text-slate-400">
                Unlimited modules &bull; unlimited lessons (metadata) &bull; exactly one quiz per module
              </p>
            </div>
            <button
              onClick={() => handleOpenModuleModal("create")}
              disabled={actionInProgress}
              className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/20 inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>Add Module</span>
            </button>
          </div>

          {/* Modules List */}
          {courseDetail.modules && courseDetail.modules.length > 0 ? (
            <div className="space-y-6">
              {courseDetail.modules.map((mod, modIdx) => (
                <div
                  key={mod.id}
                  className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-4 sm:p-5 space-y-5"
                >
                  {/* Module Header Bar */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800/60">
                    <div className="flex items-start sm:items-center gap-2.5">
                      <span className="px-2 py-1 rounded-md bg-purple-500/20 text-purple-300 font-mono text-[11px] font-bold shrink-0">
                        Module {mod.position}
                      </span>
                      <div>
                        <h3 className="text-sm sm:text-base font-bold text-white">{mod.title}</h3>
                        {mod.description && (
                          <p className="text-xs text-slate-400 mt-0.5">{mod.description}</p>
                        )}
                      </div>
                    </div>

                    {/* Module Order & Edit Controls */}
                    <div className="flex items-center gap-1 shrink-0 self-end sm:self-auto">
                      <button
                        onClick={() => handleReorderModules("up", modIdx)}
                        disabled={modIdx === 0 || actionInProgress}
                        title="Move Module Up"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleReorderModules("down", modIdx)}
                        disabled={modIdx === courseDetail.modules.length - 1 || actionInProgress}
                        title="Move Module Down"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenModuleModal("edit", mod)}
                        disabled={actionInProgress}
                        title="Edit Module"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() =>
                          setDeleteConfirm({
                            isOpen: true,
                            type: "module",
                            id: mod.id,
                            name: `Module: ${mod.title}`,
                          })
                        }
                        disabled={actionInProgress}
                        title="Delete Module"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* ── Sub-level: Lessons Metadata (Phase 1) ── */}
                  <div className="space-y-3 pl-1 sm:pl-3 border-l-2 border-slate-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-sky-400" />
                        <span className="text-xs font-bold text-slate-200">
                          Lessons Metadata ({mod.lessons?.length || 0})
                        </span>
                        <span className="text-[10px] text-slate-400 hidden sm:inline">
                          (Phase 1: Metadata only &bull; Content blocks in Phase 2)
                        </span>
                      </div>
                      <button
                        onClick={() => handleOpenLessonModal("create", mod.id)}
                        disabled={actionInProgress}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Lesson</span>
                      </button>
                    </div>

                    {mod.lessons && mod.lessons.length > 0 ? (
                      <div className="grid grid-cols-1 gap-2">
                        {mod.lessons.map((les, lesIdx) => (
                          <div
                            key={les.id}
                            className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                          >
                            <div className="flex items-start sm:items-center gap-2">
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                                L{les.position}
                              </span>
                              <div>
                                <span className="text-xs font-semibold text-white">{les.title}</span>
                                {les.estimated_duration_minutes && (
                                  <span className="text-[10px] text-slate-400 ml-2">
                                    &bull; {les.estimated_duration_minutes} min
                                  </span>
                                )}
                                {les.short_description && (
                                  <p className="text-[11px] text-slate-400 mt-0.5">{les.short_description}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1 self-end sm:self-auto shrink-0">
                              <button
                                onClick={() => handleReorderLessons(mod.id, "up", lesIdx)}
                                disabled={lesIdx === 0 || actionInProgress}
                                title="Move Lesson Up"
                                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 cursor-pointer"
                              >
                                <ArrowUp className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleReorderLessons(mod.id, "down", lesIdx)}
                                disabled={lesIdx === mod.lessons.length - 1 || actionInProgress}
                                title="Move Lesson Down"
                                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 cursor-pointer"
                              >
                                <ArrowDown className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleOpenLessonModal("edit", mod.id, les)}
                                disabled={actionInProgress}
                                title="Edit Lesson"
                                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() =>
                                  setDeleteConfirm({
                                    isOpen: true,
                                    type: "lesson",
                                    id: les.id,
                                    name: `Lesson: ${les.title}`,
                                  })
                                }
                                disabled={actionInProgress}
                                title="Delete Lesson"
                                className="p-1 rounded bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-slate-900/40 border border-dashed border-slate-800 text-center text-xs text-slate-500">
                        No lessons added yet for this module.
                      </div>
                    )}
                  </div>

                  {/* ── Sub-level: Module Quiz (Strictly 1 Quiz per Module) ── */}
                  <div className="space-y-3 pl-1 sm:pl-3 border-l-2 border-purple-800/40">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <HelpCircle className="w-4 h-4 text-purple-400" />
                        <span className="text-xs font-bold text-purple-200">Module Quiz</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 font-mono">
                          1 Quiz Max
                        </span>
                      </div>
                    </div>

                    {!mod.quiz ? (
                      <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="text-xs font-semibold text-purple-200">No Quiz Created Yet</div>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Every module requires exactly one quiz with at least one validated question to allow course publication.
                          </p>
                        </div>
                        <button
                          onClick={() => handleOpenQuizModal("create", mod.id)}
                          disabled={actionInProgress}
                          className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shrink-0 inline-flex items-center gap-1.5 cursor-pointer shadow-sm shadow-purple-600/30"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Create Module Quiz</span>
                        </button>
                      </div>
                    ) : (
                      <div className="bg-slate-900/90 border border-purple-900/40 rounded-xl p-3 sm:p-4 space-y-4">
                        {/* Quiz Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
                          <div>
                            <span className="text-xs font-bold text-white">{mod.quiz.title}</span>
                            {mod.quiz.description && (
                              <p className="text-[11px] text-slate-400">{mod.quiz.description}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleOpenQuizModal("edit", mod.id, mod.quiz)}
                              disabled={actionInProgress}
                              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Edit Quiz</span>
                            </button>
                            <button
                              onClick={() => handleOpenQuestionModal("create", mod.quiz!.id)}
                              disabled={actionInProgress}
                              className="px-2.5 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold inline-flex items-center gap-1 cursor-pointer shadow-sm"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Add Question</span>
                            </button>
                          </div>
                        </div>

                        {/* Quiz Questions List */}
                        {mod.quiz.questions && mod.quiz.questions.length > 0 ? (
                          <div className="space-y-3">
                            {mod.quiz.questions.map((q, qIdx) => {
                              const correctCount = (q.options || []).filter((o) => o.is_correct).length;
                              const isSingleSelectValid = (q.options || []).length >= 2 && correctCount === 1;

                              return (
                                <div
                                  key={q.id}
                                  className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 sm:p-4 space-y-3"
                                >
                                  {/* Question Title & Actions */}
                                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-2">
                                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-purple-900/40 text-purple-300 border border-purple-700/40">
                                          Q{q.position}
                                        </span>
                                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300">
                                          {q.question_type}
                                        </span>
                                        {!isSingleSelectValid && (
                                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                            Invalid ({correctCount} correct, {q.options?.length || 0} options)
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-xs font-semibold text-white whitespace-pre-line">
                                        {q.question_text}
                                      </p>
                                      {q.explanation && (
                                        <p className="text-[11px] text-slate-400 italic">
                                          Explanation: {q.explanation}
                                        </p>
                                      )}
                                    </div>

                                    <div className="flex items-center gap-1 self-end sm:self-auto shrink-0">
                                      <button
                                        onClick={() => handleReorderQuestions(mod.quiz!.id, "up", qIdx)}
                                        disabled={qIdx === 0 || actionInProgress}
                                        title="Move Question Up"
                                        className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 cursor-pointer"
                                      >
                                        <ArrowUp className="w-3 h-3" />
                                      </button>
                                      <button
                                        onClick={() => handleReorderQuestions(mod.quiz!.id, "down", qIdx)}
                                        disabled={qIdx === mod.quiz!.questions.length - 1 || actionInProgress}
                                        title="Move Question Down"
                                        className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 cursor-pointer"
                                      >
                                        <ArrowDown className="w-3 h-3" />
                                      </button>
                                      <button
                                        onClick={() => handleOpenQuestionModal("edit", mod.quiz!.id, q)}
                                        disabled={actionInProgress}
                                        title="Edit Question"
                                        className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                                      >
                                        <Edit3 className="w-3 h-3" />
                                      </button>
                                      <button
                                        onClick={() =>
                                          setDeleteConfirm({
                                            isOpen: true,
                                            type: "question",
                                            id: q.id,
                                            name: `Question: ${q.question_text.slice(0, 35)}...`,
                                          })
                                        }
                                        disabled={actionInProgress}
                                        title="Delete Question"
                                        className="p-1 rounded bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 cursor-pointer"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>

                                  {/* Options List */}
                                  <div className="space-y-2 pt-2 border-t border-slate-800/80">
                                    <div className="flex items-center justify-between text-[11px]">
                                      <span className="text-slate-400 font-semibold">
                                        Options ({q.options?.length || 0}) &bull; Mark radio button for correct answer
                                      </span>
                                      <button
                                        onClick={() => handleOpenOptionModal("create", q.id)}
                                        disabled={actionInProgress}
                                        className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-purple-300 font-semibold inline-flex items-center gap-1 cursor-pointer"
                                      >
                                        <Plus className="w-3 h-3" />
                                        <span>Add Option</span>
                                      </button>
                                    </div>

                                    {q.options && q.options.length > 0 ? (
                                      <div className="grid grid-cols-1 gap-1.5">
                                        {q.options.map((opt, optIdx) => (
                                          <div
                                            key={opt.id}
                                            className={`p-2 rounded-lg border flex items-center justify-between gap-2 text-xs transition-colors ${
                                              opt.is_correct
                                                ? "bg-emerald-950/30 border-emerald-800/60 text-emerald-200"
                                                : "bg-slate-900 border-slate-800 text-slate-300"
                                            }`}
                                          >
                                            <div className="flex items-center gap-2.5 min-w-0">
                                              <button
                                                type="button"
                                                onClick={() => handleSetCorrectOption(q.id, opt.id)}
                                                disabled={actionInProgress}
                                                title={opt.is_correct ? "Correct Option" : "Click to mark as Correct"}
                                                className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
                                                  opt.is_correct
                                                    ? "bg-emerald-500 border-emerald-400 text-slate-950 shadow-sm"
                                                    : "border-slate-600 hover:border-emerald-400"
                                                }`}
                                              >
                                                {opt.is_correct && <Check className="w-3 h-3 stroke-[3]" />}
                                              </button>
                                              <span className="truncate">{opt.option_text}</span>
                                              {opt.is_correct && (
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                                                  (Correct)
                                                </span>
                                              )}
                                            </div>

                                            <div className="flex items-center gap-1 shrink-0">
                                              <button
                                                onClick={() => handleReorderOptions(q.id, "up", optIdx)}
                                                disabled={optIdx === 0 || actionInProgress}
                                                title="Move Option Up"
                                                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 cursor-pointer"
                                              >
                                                <ArrowUp className="w-3 h-3" />
                                              </button>
                                              <button
                                                onClick={() => handleReorderOptions(q.id, "down", optIdx)}
                                                disabled={optIdx === q.options.length - 1 || actionInProgress}
                                                title="Move Option Down"
                                                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 cursor-pointer"
                                              >
                                                <ArrowDown className="w-3 h-3" />
                                              </button>
                                              <button
                                                onClick={() => handleOpenOptionModal("edit", q.id, opt)}
                                                disabled={actionInProgress}
                                                title="Edit Option"
                                                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                                              >
                                                <Edit3 className="w-3 h-3" />
                                              </button>
                                              <button
                                                onClick={() =>
                                                  setDeleteConfirm({
                                                    isOpen: true,
                                                    type: "option",
                                                    id: opt.id,
                                                    name: `Option: ${opt.option_text}`,
                                                  })
                                                }
                                                disabled={actionInProgress}
                                                title="Delete Option"
                                                className="p-1 rounded bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 cursor-pointer"
                                              >
                                                <Trash2 className="w-3 h-3" />
                                              </button>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <div className="p-2.5 rounded-lg bg-slate-900/40 border border-dashed border-slate-800 text-center text-[11px] text-slate-500">
                                        No options added yet. At least 2 options are required.
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="p-4 rounded-lg bg-slate-950/40 border border-dashed border-slate-800 text-center text-xs text-slate-400">
                            No questions added to this quiz yet. Add questions with options before publishing.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-slate-950/40 border border-dashed border-slate-800 text-center space-y-3">
              <Layers className="w-8 h-8 text-slate-600 mx-auto" />
              <div className="text-sm font-semibold text-slate-300">No Modules Created</div>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Courses require at least one module with lessons and a quiz to satisfy publishing readiness validation.
              </p>
              <button
                onClick={() => handleOpenModuleModal("create")}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-md shadow-purple-600/20"
              >
                <Plus className="w-4 h-4" />
                <span>Create First Module</span>
              </button>
            </div>
          )}
        </div>

        {/* ── MODALS CONTAINER (DETAIL VIEW) ── */}
        {renderModals()}
      </div>
    );
  }

  // ═════════════════════════════════════════════════════════════════════════════
  // LIST VIEW
  // ═════════════════════════════════════════════════════════════════════════════

  // Metric calculation from loaded courses
  const publishedCount = courses.filter((c) => c.status === "PUBLISHED").length;
  const draftCount = courses.filter((c) => c.status === "DRAFT").length;
  const reviewCount = courses.filter((c) => c.status === "IN_REVIEW").length;

  return (
    <div className="space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{totalCount}</div>
            <div className="text-xs text-slate-400">Total Courses</div>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{publishedCount}</div>
            <div className="text-xs text-slate-400">Published (Current Page)</div>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{reviewCount}</div>
            <div className="text-xs text-slate-400">In Review (Current Page)</div>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{draftCount}</div>
            <div className="text-xs text-slate-400">Drafts (Current Page)</div>
          </div>
        </div>
      </div>

      {/* Main CMS Container */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-6">
        {/* Controls: Search, Filters, Sort, Create */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search courses by title..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-purple-500 transition-colors"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-hidden focus:border-purple-500 cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="IN_REVIEW">In Review</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>

            {/* Difficulty Filter */}
            <select
              value={difficultyFilter}
              onChange={(e) => {
                setDifficultyFilter(e.target.value);
                setPage(1);
              }}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-hidden focus:border-purple-500 cursor-pointer"
            >
              <option value="">All Difficulties</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-hidden focus:border-purple-500 cursor-pointer"
            >
              <option value="">All Categories</option>
              <option value="Engineering">Engineering</option>
              <option value="Design">Design</option>
              <option value="Product">Product</option>
              <option value="Data & AI">Data &amp; AI</option>
              <option value="Career">Career</option>
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortOption}
              onChange={(e) => {
                setSortOption(e.target.value as CourseSortOption);
                setPage(1);
              }}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-hidden focus:border-purple-500 cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title_asc">Title (A-Z)</option>
              <option value="title_desc">Title (Z-A)</option>
              <option value="updated_at">Recently Updated</option>
            </select>

            {/* Refresh */}
            <button
              onClick={() => void loadCourses()}
              title="Refresh Courses"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${listLoading ? "animate-spin text-purple-400" : ""}`} />
            </button>
          </div>

          {/* Create Button */}
          <button
            onClick={handleOpenCreateCourse}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/25 inline-flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create Course</span>
          </button>
        </div>

        {/* Error Feedback */}
        {listError && (
          <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/40 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{listError}</span>
          </div>
        )}

        {/* Course Cards / Table */}
        {listLoading ? (
          <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-purple-400" />
            <p className="text-xs">Loading course catalog...</p>
          </div>
        ) : courses.length > 0 ? (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/80 text-slate-400 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4 rounded-l-xl">Course Title &amp; Slug</th>
                    <th className="py-3 px-4">Category &amp; Difficulty</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Duration</th>
                    <th className="py-3 px-4">Created</th>
                    <th className="py-3 px-4 rounded-r-xl text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {courses.map((course) => (
                    <tr key={course.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white text-sm">{course.title}</div>
                        <div className="font-mono text-[11px] text-purple-300/80">{course.slug}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          {renderDifficultyBadge(course.difficulty)}
                          {course.category && (
                            <span className="text-[11px] text-slate-400 font-medium">
                              {course.category}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">{renderStatusBadge(course.status)}</td>
                      <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                        {course.estimated_duration_minutes ? `${course.estimated_duration_minutes} min` : "--"}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                        {new Date(course.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => setSelectedCourseId(course.id)}
                            className="px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-bold transition-colors cursor-pointer"
                          >
                            Manage Content
                          </button>
                          <button
                            onClick={() => handleOpenEditCourse(course)}
                            title="Edit Course Metadata"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() =>
                              setDeleteConfirm({
                                isOpen: true,
                                type: "course",
                                id: course.id,
                                name: course.title,
                              })
                            }
                            title="Delete Course"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View (<= 768px, tested at 320px, 375px, 390px, 430px) */}
            <div className="grid grid-cols-1 gap-3 md:hidden">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="font-bold text-white text-sm leading-snug">{course.title}</div>
                      <div className="font-mono text-[10px] text-purple-300">{course.slug}</div>
                    </div>
                    {renderStatusBadge(course.status)}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                    {renderDifficultyBadge(course.difficulty)}
                    {course.category && <span>{course.category}</span>}
                    {course.estimated_duration_minutes && (
                      <span>&bull; {course.estimated_duration_minutes} min</span>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setSelectedCourseId(course.id)}
                      className="flex-1 py-2 px-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs text-center cursor-pointer shadow-sm"
                    >
                      Manage Content
                    </button>
                    <button
                      onClick={() => handleOpenEditCourse(course)}
                      className="p-2 rounded-lg bg-slate-800 text-slate-300 cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() =>
                        setDeleteConfirm({
                          isOpen: true,
                          type: "course",
                          id: course.id,
                          name: course.title,
                        })
                      }
                      className="p-2 rounded-lg bg-slate-800 text-rose-400 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Server-Side Pagination Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-800 text-xs text-slate-400">
              <div>
                Showing <span className="font-bold text-white">{courses.length}</span> of{" "}
                <span className="font-bold text-white">{totalCount}</span> total courses (Page {page} of {totalPages})
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer inline-flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Prev</span>
                </button>
                <span className="px-2 font-mono text-slate-300">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer inline-flex items-center gap-1"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="py-16 text-center text-slate-500 space-y-3">
            <BookOpen className="w-8 h-8 mx-auto text-slate-600" />
            <p className="text-sm font-semibold text-slate-400">No courses match your filter criteria</p>
            <p className="text-xs">Adjust your search or click &quot;Create Course&quot; to build a new curriculum.</p>
          </div>
        )}
      </div>

      {/* ── MODALS CONTAINER (LIST VIEW) ── */}
      {renderModals()}
    </div>
  );

  // ═════════════════════════════════════════════════════════════════════════════
  // MODALS RENDERER
  // ═════════════════════════════════════════════════════════════════════════════
  function renderModals() {
    return (
      <>
        {/* Create / Edit Course Modal */}
        {(isCreateCourseOpen || isEditCourseOpen) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xs">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl">
              <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
                <h3 className="text-sm sm:text-base font-bold text-white">
                  {isCreateCourseOpen ? "Create New Course" : "Edit Course Metadata"}
                </h3>
                <button
                  onClick={() => {
                    setIsCreateCourseOpen(false);
                    setIsEditCourseOpen(false);
                  }}
                  className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form
                onSubmit={isCreateCourseOpen ? handleCreateCourseSubmit : handleEditCourseSubmit}
                className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs"
              >
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Course Title <span className="text-purple-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={courseForm.title}
                    onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                    placeholder="e.g. Full-Stack Systems Engineering"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-hidden focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Custom Slug <span className="text-slate-500">(Optional — auto-generated from title)</span>
                  </label>
                  <input
                    type="text"
                    value={courseForm.slug}
                    onChange={(e) => setCourseForm({ ...courseForm, slug: e.target.value })}
                    placeholder="e.g. full-stack-systems"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-hidden focus:border-purple-500 font-mono text-[11px]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Category</label>
                    <select
                      value={courseForm.category}
                      onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-purple-500"
                    >
                      <option value="Engineering">Engineering</option>
                      <option value="Design">Design</option>
                      <option value="Product">Product</option>
                      <option value="Data & AI">Data &amp; AI</option>
                      <option value="Career">Career</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Difficulty</label>
                    <select
                      value={courseForm.difficulty}
                      onChange={(e) =>
                        setCourseForm({ ...courseForm, difficulty: e.target.value as CourseDifficulty })
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-purple-500"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Estimated Duration (Minutes)</label>
                  <input
                    type="number"
                    min="1"
                    value={courseForm.estimated_duration_minutes}
                    onChange={(e) => setCourseForm({ ...courseForm, estimated_duration_minutes: e.target.value })}
                    placeholder="60"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-hidden focus:border-purple-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Short Description</label>
                  <input
                    type="text"
                    value={courseForm.short_description}
                    onChange={(e) => setCourseForm({ ...courseForm, short_description: e.target.value })}
                    placeholder="Brief 1-line summary for cards"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-hidden focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Full Course Description</label>
                  <textarea
                    rows={3}
                    value={courseForm.description}
                    onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                    placeholder="Comprehensive overview of curriculum and learning objectives..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-hidden focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Thumbnail URL</label>
                  <input
                    type="url"
                    value={courseForm.thumbnail_url}
                    onChange={(e) => setCourseForm({ ...courseForm, thumbnail_url: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-hidden focus:border-purple-500 font-mono text-[11px]"
                  />
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreateCourseOpen(false);
                      setIsEditCourseOpen(false);
                    }}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={courseFormSubmitting}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold cursor-pointer disabled:opacity-50"
                  >
                    {courseFormSubmitting ? "Saving..." : isCreateCourseOpen ? "Create Course" : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Create / Edit Module Modal */}
        {moduleModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xs">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col shadow-2xl">
              <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
                <h3 className="text-sm sm:text-base font-bold text-white">
                  {moduleModal.mode === "create" ? "Add Module" : "Edit Module"}
                </h3>
                <button
                  onClick={() => setModuleModal({ ...moduleModal, isOpen: false })}
                  className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleModuleSubmit} className="p-4 sm:p-6 space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Module Title <span className="text-purple-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={moduleModal.title}
                    onChange={(e) => setModuleModal({ ...moduleModal, title: e.target.value })}
                    placeholder="e.g. Core Architecture Patterns"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-hidden focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Description (Optional)</label>
                  <textarea
                    rows={2}
                    value={moduleModal.description}
                    onChange={(e) => setModuleModal({ ...moduleModal, description: e.target.value })}
                    placeholder="Brief description of topics covered..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-hidden focus:border-purple-500"
                  />
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setModuleModal({ ...moduleModal, isOpen: false })}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionInProgress}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold cursor-pointer disabled:opacity-50"
                  >
                    {actionInProgress ? "Saving..." : "Save Module"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Create / Edit Lesson Modal (Metadata Only) */}
        {lessonModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xs">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col shadow-2xl">
              <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
                <h3 className="text-sm sm:text-base font-bold text-white">
                  {lessonModal.mode === "create" ? "Add Lesson Metadata" : "Edit Lesson Metadata"}
                </h3>
                <button
                  onClick={() => setLessonModal({ ...lessonModal, isOpen: false })}
                  className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleLessonSubmit} className="p-4 sm:p-6 space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Lesson Title <span className="text-purple-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={lessonModal.title}
                    onChange={(e) => setLessonModal({ ...lessonModal, title: e.target.value })}
                    placeholder="e.g. Distributed Database Consistency"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-hidden focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Slug <span className="text-slate-500">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={lessonModal.slug}
                    onChange={(e) => setLessonModal({ ...lessonModal, slug: e.target.value })}
                    placeholder="e.g. distributed-consistency"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-hidden focus:border-purple-500 font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Estimated Duration (Minutes)</label>
                  <input
                    type="number"
                    min="1"
                    value={lessonModal.estimated_duration_minutes}
                    onChange={(e) =>
                      setLessonModal({ ...lessonModal, estimated_duration_minutes: e.target.value })
                    }
                    placeholder="15"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-hidden focus:border-purple-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Short Description</label>
                  <textarea
                    rows={2}
                    value={lessonModal.short_description}
                    onChange={(e) => setLessonModal({ ...lessonModal, short_description: e.target.value })}
                    placeholder="Brief overview of lesson topic..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-hidden focus:border-purple-500"
                  />
                </div>

                <div className="p-2.5 rounded-lg bg-sky-950/30 border border-sky-800/30 text-[11px] text-sky-300">
                  Phase 1 establishes lesson metadata only. Content blocks and interactive media will be supported in Phase 2.
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setLessonModal({ ...lessonModal, isOpen: false })}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionInProgress}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold cursor-pointer disabled:opacity-50"
                  >
                    {actionInProgress ? "Saving..." : "Save Lesson"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Create / Edit Quiz Modal */}
        {quizModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xs">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col shadow-2xl">
              <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
                <h3 className="text-sm sm:text-base font-bold text-white">
                  {quizModal.mode === "create" ? "Create Module Quiz" : "Edit Quiz Info"}
                </h3>
                <button
                  onClick={() => setQuizModal({ ...quizModal, isOpen: false })}
                  className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleQuizSubmit} className="p-4 sm:p-6 space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Quiz Title <span className="text-purple-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={quizModal.title}
                    onChange={(e) => setQuizModal({ ...quizModal, title: e.target.value })}
                    placeholder="e.g. Module 1 Mastery Quiz"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-hidden focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Quiz Instructions / Description</label>
                  <textarea
                    rows={2}
                    value={quizModal.description}
                    onChange={(e) => setQuizModal({ ...quizModal, description: e.target.value })}
                    placeholder="Test your understanding of the module concepts..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-hidden focus:border-purple-500"
                  />
                </div>

                <div className="p-2.5 rounded-lg bg-purple-950/30 border border-purple-800/30 text-[11px] text-purple-300">
                  Exactly one quiz is allowed per module (enforced by UNIQUE database constraint).
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setQuizModal({ ...quizModal, isOpen: false })}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionInProgress}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold cursor-pointer disabled:opacity-50"
                  >
                    {actionInProgress ? "Saving..." : "Save Quiz"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Create / Edit Question Modal */}
        {questionModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xs">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col shadow-2xl">
              <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
                <h3 className="text-sm sm:text-base font-bold text-white">
                  {questionModal.mode === "create" ? "Add Question" : "Edit Question"}
                </h3>
                <button
                  onClick={() => setQuestionModal({ ...questionModal, isOpen: false })}
                  className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleQuestionSubmit} className="p-4 sm:p-6 space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Question Text <span className="text-purple-400">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={questionModal.question_text}
                    onChange={(e) => setQuestionModal({ ...questionModal, question_text: e.target.value })}
                    placeholder="e.g. Which concurrency primitive provides mutual exclusion?"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-hidden focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Explanation (Optional)</label>
                  <textarea
                    rows={2}
                    value={questionModal.explanation}
                    onChange={(e) => setQuestionModal({ ...questionModal, explanation: e.target.value })}
                    placeholder="Explanation displayed to learners during review..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-hidden focus:border-purple-500"
                  />
                </div>

                <div className="p-2.5 rounded-lg bg-slate-800 text-[11px] text-slate-300">
                  Question Type: <span className="font-mono text-purple-300 font-bold">SINGLE_SELECT</span>
                  <br />
                  Requires at least 2 options and exactly 1 correct answer to pass publishing validation.
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setQuestionModal({ ...questionModal, isOpen: false })}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionInProgress}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold cursor-pointer disabled:opacity-50"
                  >
                    {actionInProgress ? "Saving..." : "Save Question"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Create / Edit Option Modal */}
        {optionModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xs">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col shadow-2xl">
              <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
                <h3 className="text-sm sm:text-base font-bold text-white">
                  {optionModal.mode === "create" ? "Add Option" : "Edit Option"}
                </h3>
                <button
                  onClick={() => setOptionModal({ ...optionModal, isOpen: false })}
                  className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleOptionSubmit} className="p-4 sm:p-6 space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Option Text <span className="text-purple-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={optionModal.option_text}
                    onChange={(e) => setOptionModal({ ...optionModal, option_text: e.target.value })}
                    placeholder="e.g. Mutex"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-hidden focus:border-purple-500"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="isCorrectCheckbox"
                    checked={optionModal.is_correct}
                    onChange={(e) => setOptionModal({ ...optionModal, is_correct: e.target.checked })}
                    className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 bg-slate-950 border-slate-800 cursor-pointer"
                  />
                  <label htmlFor="isCorrectCheckbox" className="text-slate-200 font-medium cursor-pointer">
                    Mark as correct answer
                  </label>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setOptionModal({ ...optionModal, isOpen: false })}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionInProgress}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold cursor-pointer disabled:opacity-50"
                  >
                    {actionInProgress ? "Saving..." : "Save Option"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xs">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-5 space-y-4 shadow-2xl">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="text-center space-y-1">
                <h4 className="text-sm font-bold text-white">Delete Confirmation</h4>
                <p className="text-xs text-slate-400">
                  Are you sure you want to permanently delete{" "}
                  <span className="font-semibold text-rose-300">&quot;{deleteConfirm.name}&quot;</span>?
                  This action cascades safely according to system architecture.
                </p>
              </div>

              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteConfirm({ isOpen: false, type: "course", id: "", name: "" })}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={actionInProgress}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer disabled:opacity-50"
                >
                  {actionInProgress ? "Deleting..." : "Confirm Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }
}
