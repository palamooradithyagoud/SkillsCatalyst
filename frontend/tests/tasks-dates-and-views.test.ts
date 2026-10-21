import { describe, it } from 'node:test';
import assert from 'node:assert';
import { Task } from '../types/task';
import {
  isDueToday,
  isOverdue,
  isUpcoming,
  formatDueDate,
  calculateTaskMetrics,
  filterAndSortTasks,
} from '../lib/tasks/dateUtils';

describe('Phase 1: Task Dates, Views, and Metrics Test Suite', () => {
  // Use a fixed reference date for deterministic testing: 2026-10-21 14:00:00 Local
  const refDate = new Date(2026, 9, 21, 14, 0, 0); // October 21, 2026

  const mockTasks: Task[] = [
    {
      id: 'task-1',
      user_id: 'user-123',
      title: 'Task due today afternoon',
      description: 'Finish slides',
      status: 'in_progress',
      priority: 'high',
      category: 'Assignments',
      due_at: new Date(2026, 9, 21, 16, 0, 0).toISOString(),
      estimated_minutes: 60,
      completed_at: null,
      created_at: new Date(2026, 9, 10, 10, 0, 0).toISOString(),
      updated_at: new Date(2026, 9, 10, 10, 0, 0).toISOString(),
    },
    {
      id: 'task-2',
      user_id: 'user-123',
      title: 'Task overdue yesterday',
      description: 'Submit report',
      status: 'todo',
      priority: 'medium',
      category: 'Projects',
      due_at: new Date(2026, 9, 20, 18, 0, 0).toISOString(),
      estimated_minutes: 30,
      completed_at: null,
      created_at: new Date(2026, 9, 12, 10, 0, 0).toISOString(),
      updated_at: new Date(2026, 9, 12, 10, 0, 0).toISOString(),
    },
    {
      id: 'task-3',
      user_id: 'user-123',
      title: 'Task upcoming next week',
      description: 'Prepare for contest',
      status: 'todo',
      priority: 'low',
      category: 'Hackathons',
      due_at: new Date(2026, 9, 28, 12, 0, 0).toISOString(),
      estimated_minutes: 120,
      completed_at: null,
      created_at: new Date(2026, 9, 14, 10, 0, 0).toISOString(),
      updated_at: new Date(2026, 9, 14, 10, 0, 0).toISOString(),
    },
    {
      id: 'task-4',
      user_id: 'user-123',
      title: 'Task completed earlier',
      description: 'Already done',
      status: 'completed',
      priority: 'high',
      category: 'Study',
      due_at: new Date(2026, 9, 19, 10, 0, 0).toISOString(),
      estimated_minutes: 45,
      completed_at: new Date(2026, 9, 19, 9, 30, 0).toISOString(),
      created_at: new Date(2026, 9, 15, 10, 0, 0).toISOString(),
      updated_at: new Date(2026, 9, 19, 9, 30, 0).toISOString(),
    },
    {
      id: 'task-5',
      user_id: 'user-123',
      title: 'Task without deadline',
      description: 'Read articles',
      status: 'todo',
      priority: 'medium',
      category: 'Personal',
      due_at: null,
      estimated_minutes: null,
      completed_at: null,
      created_at: new Date(2026, 9, 16, 10, 0, 0).toISOString(),
      updated_at: new Date(2026, 9, 16, 10, 0, 0).toISOString(),
    },
  ];

  describe('isDueToday', () => {
    it('identifies tasks due on current local day', () => {
      const todayISO = new Date(2026, 9, 21, 18, 0, 0).toISOString();
      assert.strictEqual(isDueToday(todayISO, refDate), true);
    });

    it('returns false for dates on previous or future days', () => {
      const yesterdayISO = new Date(2026, 9, 20, 23, 59, 59).toISOString();
      const tomorrowISO = new Date(2026, 9, 22, 0, 0, 1).toISOString();
      assert.strictEqual(isDueToday(yesterdayISO, refDate), false);
      assert.strictEqual(isDueToday(tomorrowISO, refDate), false);
    });

    it('returns false for null or undefined deadlines', () => {
      assert.strictEqual(isDueToday(null, refDate), false);
      assert.strictEqual(isDueToday(undefined, refDate), false);
    });
  });

  describe('isOverdue', () => {
    it('identifies incomplete tasks with past deadlines as overdue', () => {
      const pastISO = new Date(2026, 9, 20, 10, 0, 0).toISOString();
      assert.strictEqual(isOverdue(pastISO, 'todo', refDate), true);
      assert.strictEqual(isOverdue(pastISO, 'in_progress', refDate), true);
    });

    it('never marks completed tasks as overdue', () => {
      const pastISO = new Date(2026, 9, 20, 10, 0, 0).toISOString();
      assert.strictEqual(isOverdue(pastISO, 'completed', refDate), false);
    });

    it('returns false for future deadlines and null deadlines', () => {
      const futureISO = new Date(2026, 9, 22, 10, 0, 0).toISOString();
      assert.strictEqual(isOverdue(futureISO, 'todo', refDate), false);
      assert.strictEqual(isOverdue(null, 'todo', refDate), false);
    });
  });

  describe('isUpcoming', () => {
    it('identifies tasks due strictly after the current local day', () => {
      const tomorrowISO = new Date(2026, 9, 22, 10, 0, 0).toISOString();
      const nextWeekISO = new Date(2026, 9, 28, 10, 0, 0).toISOString();
      assert.strictEqual(isUpcoming(tomorrowISO, refDate), true);
      assert.strictEqual(isUpcoming(nextWeekISO, refDate), true);
    });

    it('returns false for tasks due today or in the past', () => {
      const todayISO = new Date(2026, 9, 21, 23, 0, 0).toISOString();
      const pastISO = new Date(2026, 9, 20, 10, 0, 0).toISOString();
      assert.strictEqual(isUpcoming(todayISO, refDate), false);
      assert.strictEqual(isUpcoming(pastISO, refDate), false);
      assert.strictEqual(isUpcoming(null, refDate), false);
    });
  });

  describe('calculateTaskMetrics', () => {
    it('calculates metrics from actual task records without division-by-zero', () => {
      const metrics = calculateTaskMetrics(mockTasks, refDate);

      assert.strictEqual(metrics.totalCount, 5);
      assert.strictEqual(metrics.completedCount, 1);
      assert.strictEqual(metrics.inProgressCount, 1);
      assert.strictEqual(metrics.dueTodayCount, 1); // task-1
      assert.strictEqual(metrics.overdueCount, 1); // task-2
      assert.strictEqual(metrics.completionPercentage, 20); // 1 / 5 = 20%
    });

    it('safely handles empty task list with 0% and no division-by-zero', () => {
      const emptyMetrics = calculateTaskMetrics([], refDate);
      assert.strictEqual(emptyMetrics.totalCount, 0);
      assert.strictEqual(emptyMetrics.completedCount, 0);
      assert.strictEqual(emptyMetrics.completionPercentage, 0);
    });

    it('accurately reports 100% when all tasks completed', () => {
      const allCompleted: Task[] = [
        { ...mockTasks[0], status: 'completed' },
        { ...mockTasks[1], status: 'completed' },
      ];
      const metrics = calculateTaskMetrics(allCompleted, refDate);
      assert.strictEqual(metrics.completionPercentage, 100);
    });
  });

  describe('filterAndSortTasks', () => {
    it('filters by view: "today"', () => {
      const filtered = filterAndSortTasks(mockTasks, { view: 'today' }, refDate);
      assert.strictEqual(filtered.length, 1);
      assert.strictEqual(filtered[0].id, 'task-1');
    });

    it('filters by view: "upcoming"', () => {
      const filtered = filterAndSortTasks(mockTasks, { view: 'upcoming' }, refDate);
      assert.strictEqual(filtered.length, 1);
      assert.strictEqual(filtered[0].id, 'task-3');
    });

    it('filters by view: "in_progress"', () => {
      const filtered = filterAndSortTasks(mockTasks, { view: 'in_progress' }, refDate);
      assert.strictEqual(filtered.length, 1);
      assert.strictEqual(filtered[0].id, 'task-1');
    });

    it('filters by view: "completed"', () => {
      const filtered = filterAndSortTasks(mockTasks, { view: 'completed' }, refDate);
      assert.strictEqual(filtered.length, 1);
      assert.strictEqual(filtered[0].id, 'task-4');
    });

    it('filters by view: "past_due"', () => {
      const filtered = filterAndSortTasks(mockTasks, { view: 'past_due' }, refDate);
      assert.strictEqual(filtered.length, 1);
      assert.strictEqual(filtered[0].id, 'task-2');
    });

    it('filters by search title case-insensitively', () => {
      const filtered = filterAndSortTasks(mockTasks, { search: 'overdue' }, refDate);
      assert.strictEqual(filtered.length, 1);
      assert.strictEqual(filtered[0].id, 'task-2');
    });

    it('combines category and priority filters', () => {
      const filtered = filterAndSortTasks(
        mockTasks,
        { category: 'Assignments', priority: 'high' },
        refDate
      );
      assert.strictEqual(filtered.length, 1);
      assert.strictEqual(filtered[0].id, 'task-1');
    });

    it('sorts by priority descending (high > medium > low)', () => {
      const sorted = filterAndSortTasks(mockTasks, { sortBy: 'priority', sortOrder: 'desc' }, refDate);
      assert.strictEqual(sorted[0].priority, 'high');
      assert.strictEqual(sorted[sorted.length - 1].priority, 'low');
    });

    it('sorts by due date placing null deadlines at the end', () => {
      const sorted = filterAndSortTasks(mockTasks, { sortBy: 'due_date', sortOrder: 'asc' }, refDate);
      // Last task must be task-5 which has no deadline
      assert.strictEqual(sorted[sorted.length - 1].id, 'task-5');
      assert.strictEqual(sorted[0].id, 'task-4'); // Earliest deadline: Oct 19
    });
  });
});
