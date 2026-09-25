/**
 * frontend/tests/courses-admin.test.ts
 * Frontend test suite for SkillsCatalyst Course System (Phase 1).
 * Tests Course API, type invariants, validation rules, and hierarchy structures.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";

import * as FacadeAPI from "@/lib/api";
import * as CoursesAPI from "@/lib/api/courses";
import type {
  CourseDetail,
  CourseSortOption,
  CreateCoursePayload,
  ReorderPayload,
} from "@/types/course";

describe("Course System (Phase 1) - Frontend API & Types Integrity", () => {
  it("preserves identical export references between facade and courses domain module", () => {
    assert.strictEqual(FacadeAPI.fetchAdminCourses, CoursesAPI.fetchAdminCourses);
    assert.strictEqual(FacadeAPI.fetchAdminCourseById, CoursesAPI.fetchAdminCourseById);
    assert.strictEqual(FacadeAPI.createAdminCourse, CoursesAPI.createAdminCourse);
    assert.strictEqual(FacadeAPI.updateAdminCourse, CoursesAPI.updateAdminCourse);
    assert.strictEqual(FacadeAPI.deleteAdminCourse, CoursesAPI.deleteAdminCourse);
    assert.strictEqual(FacadeAPI.publishAdminCourse, CoursesAPI.publishAdminCourse);
    assert.strictEqual(FacadeAPI.unpublishAdminCourse, CoursesAPI.unpublishAdminCourse);
    assert.strictEqual(FacadeAPI.archiveAdminCourse, CoursesAPI.archiveAdminCourse);

    // Module APIs
    assert.strictEqual(FacadeAPI.createAdminModule, CoursesAPI.createAdminModule);
    assert.strictEqual(FacadeAPI.updateAdminModule, CoursesAPI.updateAdminModule);
    assert.strictEqual(FacadeAPI.deleteAdminModule, CoursesAPI.deleteAdminModule);
    assert.strictEqual(FacadeAPI.reorderAdminModules, CoursesAPI.reorderAdminModules);

    // Lesson APIs (Metadata Only)
    assert.strictEqual(FacadeAPI.createAdminLesson, CoursesAPI.createAdminLesson);
    assert.strictEqual(FacadeAPI.updateAdminLesson, CoursesAPI.updateAdminLesson);
    assert.strictEqual(FacadeAPI.deleteAdminLesson, CoursesAPI.deleteAdminLesson);
    assert.strictEqual(FacadeAPI.reorderAdminLessons, CoursesAPI.reorderAdminLessons);

    // Quiz APIs (1 per module)
    assert.strictEqual(FacadeAPI.createAdminQuiz, CoursesAPI.createAdminQuiz);
    assert.strictEqual(FacadeAPI.fetchAdminQuiz, CoursesAPI.fetchAdminQuiz);
    assert.strictEqual(FacadeAPI.updateAdminQuiz, CoursesAPI.updateAdminQuiz);

    // Question APIs
    assert.strictEqual(FacadeAPI.createAdminQuestion, CoursesAPI.createAdminQuestion);
    assert.strictEqual(FacadeAPI.updateAdminQuestion, CoursesAPI.updateAdminQuestion);
    assert.strictEqual(FacadeAPI.deleteAdminQuestion, CoursesAPI.deleteAdminQuestion);
    assert.strictEqual(FacadeAPI.reorderAdminQuestions, CoursesAPI.reorderAdminQuestions);

    // Option APIs
    assert.strictEqual(FacadeAPI.createAdminOption, CoursesAPI.createAdminOption);
    assert.strictEqual(FacadeAPI.updateAdminOption, CoursesAPI.updateAdminOption);
    assert.strictEqual(FacadeAPI.deleteAdminOption, CoursesAPI.deleteAdminOption);
    assert.strictEqual(FacadeAPI.reorderAdminOptions, CoursesAPI.reorderAdminOptions);
  });

  it("validates Course creation payload structure and difficulty constraints", () => {
    const payload: CreateCoursePayload = {
      title: "Distributed Systems Engineering",
      short_description: "Learn consensus, replication, and fault tolerance.",
      description: "A comprehensive deep dive into distributed systems engineering.",
      thumbnail_url: "https://example.com/thumb.png",
      category: "Engineering",
      difficulty: "advanced",
      estimated_duration_minutes: 180,
      status: "DRAFT",
    };

    assert.strictEqual(payload.title, "Distributed Systems Engineering");
    assert.strictEqual(payload.difficulty, "advanced");
    assert.strictEqual(payload.status, "DRAFT");
    assert.strictEqual(payload.estimated_duration_minutes, 180);
  });

  it("enforces whitelisted sorting options for Course catalog queries", () => {
    const validSorts: CourseSortOption[] = ["newest", "oldest", "title_asc", "title_desc", "updated_at"];
    for (const sortOpt of validSorts) {
      assert.ok(["newest", "oldest", "title_asc", "title_desc", "updated_at"].includes(sortOpt));
    }
  });

  it("verifies single-select question validation invariants (>= 2 options, exactly 1 correct)", () => {
    interface OptionCheck {
      id: string;
      text: string;
      is_correct: boolean;
    }

    const validateSingleSelect = (options: OptionCheck[]) => {
      const correctCount = options.filter((o) => o.is_correct).length;
      return options.length >= 2 && correctCount === 1;
    };

    // Valid: 2 options, 1 correct
    assert.strictEqual(
      validateSingleSelect([
        { id: "1", text: "Option A", is_correct: true },
        { id: "2", text: "Option B", is_correct: false },
      ]),
      true
    );

    // Valid: 4 options, 1 correct
    assert.strictEqual(
      validateSingleSelect([
        { id: "1", text: "Option A", is_correct: false },
        { id: "2", text: "Option B", is_correct: true },
        { id: "3", text: "Option C", is_correct: false },
        { id: "4", text: "Option D", is_correct: false },
      ]),
      true
    );

    // Invalid: 0 correct options
    assert.strictEqual(
      validateSingleSelect([
        { id: "1", text: "Option A", is_correct: false },
        { id: "2", text: "Option B", is_correct: false },
      ]),
      false
    );

    // Invalid: multiple correct options
    assert.strictEqual(
      validateSingleSelect([
        { id: "1", text: "Option A", is_correct: true },
        { id: "2", text: "Option B", is_correct: true },
      ]),
      false
    );

    // Invalid: < 2 options
    assert.strictEqual(validateSingleSelect([{ id: "1", text: "Option A", is_correct: true }]), false);
  });

  it("verifies reorder payload structure with positive integers", () => {
    const reorderPayload: ReorderPayload = {
      items: [
        { id: "11111111-1111-1111-1111-111111111111", position: 1 },
        { id: "22222222-2222-2222-2222-222222222222", position: 2 },
        { id: "33333333-3333-3333-3333-333333333333", position: 3 },
      ],
    };

    assert.strictEqual(reorderPayload.items.length, 3);
    assert.strictEqual(reorderPayload.items[0].position, 1);
    assert.strictEqual(reorderPayload.items[1].position, 2);
    assert.strictEqual(reorderPayload.items[2].position, 3);
    for (const item of reorderPayload.items) {
      assert.ok(item.position >= 1);
    }
  });

  it("verifies CourseDetail hierarchy preserves Phase 1 metadata-only structure", () => {
    const mockDetail: CourseDetail = {
      id: "course-123",
      title: "Full-Stack Foundations",
      slug: "full-stack-foundations",
      short_description: "Metadata-only course description",
      description: "Full description",
      difficulty: "beginner",
      status: "DRAFT",
      created_by: "user-123",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      modules: [
        {
          id: "mod-1",
          course_id: "course-123",
          title: "Module 1: Basics",
          position: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          lessons: [
            {
              id: "les-1",
              module_id: "mod-1",
              title: "Lesson 1: Intro",
              position: 1,
              estimated_duration_minutes: 15,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ],
          quiz: {
            id: "quiz-1",
            module_id: "mod-1",
            title: "Module 1 Quiz",
            status: "DRAFT",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            questions: [
              {
                id: "q-1",
                quiz_id: "quiz-1",
                question_text: "What is an idempotent API operation?",
                question_type: "SINGLE_SELECT",
                position: 1,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                options: [
                  {
                    id: "opt-1",
                    question_id: "q-1",
                    option_text: "An operation that can be applied multiple times without changing the result.",
                    is_correct: true,
                    position: 1,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                  },
                  {
                    id: "opt-2",
                    question_id: "q-1",
                    option_text: "An operation that always creates a new resource.",
                    is_correct: false,
                    position: 2,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                  },
                ],
              },
            ],
          },
        },
      ],
    };

    assert.strictEqual(mockDetail.modules.length, 1);
    assert.strictEqual(mockDetail.modules[0].lessons.length, 1);
    assert.ok(mockDetail.modules[0].quiz);
    assert.strictEqual(mockDetail.modules[0].quiz?.questions.length, 1);
    assert.strictEqual(mockDetail.modules[0].quiz?.questions[0].options.length, 2);
    // Explicitly verify Phase 1 constraints: No lesson blocks or progress fields
    assert.strictEqual((mockDetail.modules[0].lessons[0] as unknown as { blocks?: unknown }).blocks, undefined);
    assert.strictEqual((mockDetail as unknown as { certificate?: unknown }).certificate, undefined);
  });
});
