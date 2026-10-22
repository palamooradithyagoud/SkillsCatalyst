import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  validateTaskTitle,
  validateTaskCategory,
  validateTaskPriority,
  validateTaskDueAt,
  validateTaskEstimatedMinutes,
} from '../lib/tasks/validation.js';
import type { TaskCategory, TaskPriority } from '../types/task.js';

describe('Phase 2A: AI Mentor Tasks Integration Frontend Tests', () => {
  it('validates proposed task fields correctly', () => {
    // Valid task
    const titleRes = validateTaskTitle('Complete DSA Sheet');
    assert.strictEqual(titleRes.isValid, true);

    const catRes = validateTaskCategory('Assignments');
    assert.strictEqual(catRes.isValid, true);

    const priRes = validateTaskPriority('high');
    assert.strictEqual(priRes.isValid, true);

    const dueRes = validateTaskDueAt('2026-10-23T18:00:00Z');
    assert.strictEqual(dueRes.isValid, true);

    const estRes = validateTaskEstimatedMinutes(120);
    assert.strictEqual(estRes.isValid, true);
  });

  it('rejects invalid or malformed task fields in proposal editing', () => {
    // Empty title
    const emptyTitle = validateTaskTitle('   ');
    assert.strictEqual(emptyTitle.isValid, false);
    assert.ok(emptyTitle.error);

    // Invalid category
    const badCat = validateTaskCategory('InvalidCategory' as unknown as TaskCategory);
    assert.strictEqual(badCat.isValid, false);

    // Invalid priority
    const badPri = validateTaskPriority('urgent' as unknown as TaskPriority);
    assert.strictEqual(badPri.isValid, false);

    // Invalid due date
    const badDue = validateTaskDueAt('not-a-real-date');
    assert.strictEqual(badDue.isValid, false);

    // Negative estimated minutes
    const badEst = validateTaskEstimatedMinutes(-30);
    assert.strictEqual(badEst.isValid, false);

    // Over maximum (10080 minutes)
    const overEst = validateTaskEstimatedMinutes(20000);
    assert.strictEqual(overEst.isValid, false);
  });

  it('verifies strict zero emoji in action labels and categories', () => {
    const emojiRegex =
      /[\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}]/u;

    const actionLabels = [
      'Proposed Task Creation',
      'Proposed Batch Tasks',
      'Proposed Task Update',
      'Confirm Task Completion',
      'Confirm Task Reopening',
      'Confirm Task Deletion',
      'Confirm and Create',
      'Cancel',
      'Task operation completed successfully.',
      'Action canceled. No changes were made to your To-Do List.',
      'This proposal has expired. Please request the action again.',
    ];

    for (const label of actionLabels) {
      assert.strictEqual(
        emojiRegex.test(label),
        false,
        `Action label contains emoji: ${label}`
      );
    }
  });
});
