import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  validateTaskTitle,
  validateTaskDescription,
  validateTaskStatus,
  validateTaskPriority,
  validateTaskCategory,
  validateTaskDueAt,
  validateTaskEstimatedMinutes,
  validateSubtaskTitle,
  validateTaskForm,
} from '../lib/tasks/validation';

describe('Phase 1: Task Validation Test Suite', () => {
  describe('validateTaskTitle', () => {
    it('accepts valid task titles', () => {
      const validTitles = [
        'Complete React Roadmap',
        'Solve 5 LeetCode DP Problems',
        'Submit hackathon project draft',
        'A',
        'T'.repeat(255),
      ];

      for (const title of validTitles) {
        const res = validateTaskTitle(title);
        assert.strictEqual(res.isValid, true, `Should accept valid title: "${title}"`);
        assert.strictEqual(res.error, undefined);
      }
    });

    it('rejects empty, null, or whitespace-only titles', () => {
      const invalidTitles = [null, undefined, '', '   ', '\t', '\n'];
      for (const title of invalidTitles) {
        const res = validateTaskTitle(title);
        assert.strictEqual(res.isValid, false);
        assert.ok(res.error && res.error.length > 0);
      }
    });

    it('rejects titles exceeding 255 characters', () => {
      const longTitle = 'A'.repeat(256);
      const res = validateTaskTitle(longTitle);
      assert.strictEqual(res.isValid, false);
      assert.ok(res.error?.includes('cannot exceed 255 characters'));
    });
  });

  describe('validateTaskDescription', () => {
    it('accepts optional and empty descriptions', () => {
      assert.strictEqual(validateTaskDescription(null).isValid, true);
      assert.strictEqual(validateTaskDescription(undefined).isValid, true);
      assert.strictEqual(validateTaskDescription('').isValid, true);
      assert.strictEqual(validateTaskDescription('Short note on problem constraints.').isValid, true);
    });

    it('accepts descriptions up to 4000 characters', () => {
      const maxDesc = 'A'.repeat(4000);
      assert.strictEqual(validateTaskDescription(maxDesc).isValid, true);
    });

    it('rejects descriptions exceeding 4000 characters', () => {
      const longDesc = 'A'.repeat(4001);
      const res = validateTaskDescription(longDesc);
      assert.strictEqual(res.isValid, false);
      assert.ok(res.error?.includes('cannot exceed 4000 characters'));
    });
  });

  describe('validateTaskStatus', () => {
    it('accepts valid statuses', () => {
      for (const st of ['todo', 'in_progress', 'completed']) {
        assert.strictEqual(validateTaskStatus(st).isValid, true);
      }
    });

    it('accepts optional / undefined status (defaults handled separately)', () => {
      assert.strictEqual(validateTaskStatus(null).isValid, true);
      assert.strictEqual(validateTaskStatus(undefined).isValid, true);
    });

    it('rejects invalid statuses', () => {
      const invalid = ['done', 'archived', 'pending', 'in-progress', '123'];
      for (const st of invalid) {
        const res = validateTaskStatus(st);
        assert.strictEqual(res.isValid, false);
        assert.ok(res.error?.includes('Invalid status'));
      }
    });
  });

  describe('validateTaskPriority', () => {
    it('accepts valid priorities', () => {
      for (const pr of ['low', 'medium', 'high']) {
        assert.strictEqual(validateTaskPriority(pr).isValid, true);
      }
    });

    it('rejects invalid priorities', () => {
      const invalid = ['urgent', 'critical', 'normal', '1', 'HIGH'];
      for (const pr of invalid) {
        const res = validateTaskPriority(pr);
        assert.strictEqual(res.isValid, false);
        assert.ok(res.error?.includes('Invalid priority'));
      }
    });
  });

  describe('validateTaskCategory', () => {
    it('accepts all allowed student categories', () => {
      const categories = [
        'Study',
        'Assignments',
        'Projects',
        'Hackathons',
        'Career',
        'Personal',
        'Other',
      ];
      for (const cat of categories) {
        assert.strictEqual(validateTaskCategory(cat).isValid, true);
      }
    });

    it('rejects invalid categories', () => {
      const invalid = ['Work', 'Entertainment', 'Gaming', 'Random'];
      for (const cat of invalid) {
        const res = validateTaskCategory(cat);
        assert.strictEqual(res.isValid, false);
        assert.ok(res.error?.includes('Invalid category'));
      }
    });
  });

  describe('validateTaskDueAt', () => {
    it('accepts optional and empty deadlines', () => {
      assert.strictEqual(validateTaskDueAt(null).isValid, true);
      assert.strictEqual(validateTaskDueAt(undefined).isValid, true);
      assert.strictEqual(validateTaskDueAt('').isValid, true);
      assert.strictEqual(validateTaskDueAt('   ').isValid, true);
    });

    it('accepts valid ISO date and datetime-local strings', () => {
      const valid = [
        '2026-10-25T18:30:00.000Z',
        '2026-12-31T23:59',
        '2026-11-01',
      ];
      for (const d of valid) {
        assert.strictEqual(validateTaskDueAt(d).isValid, true, `Should accept: ${d}`);
      }
    });

    it('rejects malformed date strings', () => {
      const invalid = ['not-a-date', '2026-99-99', 'invalid', 'abc/def/ghi'];
      for (const d of invalid) {
        const res = validateTaskDueAt(d);
        assert.strictEqual(res.isValid, false);
        assert.ok(res.error?.includes('valid deadline'));
      }
    });

    it('rejects absurd out-of-range years', () => {
      assert.strictEqual(validateTaskDueAt('1850-01-01T00:00').isValid, false);
      assert.strictEqual(validateTaskDueAt('2999-01-01T00:00').isValid, false);
    });
  });

  describe('validateTaskEstimatedMinutes', () => {
    it('accepts optional and empty duration values', () => {
      assert.strictEqual(validateTaskEstimatedMinutes(null).isValid, true);
      assert.strictEqual(validateTaskEstimatedMinutes(undefined).isValid, true);
      assert.strictEqual(validateTaskEstimatedMinutes('').isValid, true);
    });

    it('accepts valid positive integers up to 10080 minutes (7 days)', () => {
      const validValues = [0, 15, 30, 60, 120, '45', '120', 10080];
      for (const v of validValues) {
        assert.strictEqual(validateTaskEstimatedMinutes(v).isValid, true, `Should accept: ${v}`);
      }
    });

    it('rejects negative numbers', () => {
      const res = validateTaskEstimatedMinutes(-10);
      assert.strictEqual(res.isValid, false);
      assert.ok(res.error?.includes('cannot be negative'));
    });

    it('rejects decimal / non-integer values', () => {
      const res = validateTaskEstimatedMinutes(15.5);
      assert.strictEqual(res.isValid, false);
      assert.ok(res.error?.includes('whole number'));
    });

    it('rejects durations exceeding 10080 minutes', () => {
      const res = validateTaskEstimatedMinutes(10081);
      assert.strictEqual(res.isValid, false);
      assert.ok(res.error?.includes('cannot exceed 7 days'));
    });
  });

  describe('validateSubtaskTitle', () => {
    it('accepts valid subtask titles', () => {
      assert.strictEqual(validateSubtaskTitle('Read Chapter 3').isValid, true);
      assert.strictEqual(validateSubtaskTitle('A').isValid, true);
      assert.strictEqual(validateSubtaskTitle('S'.repeat(255)).isValid, true);
    });

    it('rejects empty or whitespace-only subtask titles', () => {
      assert.strictEqual(validateSubtaskTitle('').isValid, false);
      assert.strictEqual(validateSubtaskTitle('   ').isValid, false);
      assert.strictEqual(validateSubtaskTitle(null).isValid, false);
      assert.strictEqual(validateSubtaskTitle(undefined).isValid, false);
    });

    it('rejects excessively long subtask titles', () => {
      assert.strictEqual(validateSubtaskTitle('S'.repeat(256)).isValid, false);
    });
  });

  describe('validateTaskForm composite validator', () => {
    it('validates a complete valid payload with zero errors', () => {
      const res = validateTaskForm({
        title: 'Review System Design Concepts',
        description: 'Focus on distributed caching and load balancing.',
        status: 'todo',
        priority: 'high',
        category: 'Study',
        due_at: '2026-10-30T10:00:00Z',
        estimated_minutes: 60,
      });

      assert.strictEqual(res.isValid, true);
      assert.strictEqual(Object.keys(res.errors).length, 0);
    });

    it('collects field-specific errors for multiple invalid fields', () => {
      const res = validateTaskForm({
        title: '   ',
        description: 'A'.repeat(4005),
        status: 'invalid_status' as any,
        priority: 'invalid_priority' as any,
        estimated_minutes: -5,
      });

      assert.strictEqual(res.isValid, false);
      assert.ok(res.errors.title);
      assert.ok(res.errors.description);
      assert.ok(res.errors.status);
      assert.ok(res.errors.priority);
      assert.ok(res.errors.estimated_minutes);
    });
  });
});
