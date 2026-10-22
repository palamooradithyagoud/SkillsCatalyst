/**
 * frontend/tests/ai-mentor-smart-planner.test.ts
 * Frontend tests for Phase 2B: AI-Powered Smart Task Planning.
 * Tests:
 * 1. SchedulePlanData and ScheduledPlanItem contract validity.
 * 2. Schedule conflict indicators and warning formats.
 * 3. Zero-emoji verification on all smart planning UI labels, headers, and notices.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import type {
  SchedulePlanData,
  ScheduledPlanItem,
  TaskActionProposal,
} from '../types/ai-mentor-tasks.js';

describe('Phase 2B: AI Smart Task Planning Frontend Contracts', () => {
  const emojiRegex =
    /[\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}]/u;

  it('structures valid daily schedule plan proposal correctly', () => {
    const item1: ScheduledPlanItem = {
      task_id: '11111111-1111-4111-8111-111111111111',
      title: 'DSA Binary Trees Review',
      start_time: '2026-10-23T09:00:00+05:30',
      end_time: '2026-10-23T10:30:00+05:30',
      time_range: '09:00 AM - 10:30 AM',
      due_at: '2026-10-23T23:59:00+05:30',
      priority: 'high',
      estimated_minutes: 90,
      reason: 'Urgent priority, due today.',
      warnings: [],
      is_conflict: false,
    };

    const item2: ScheduledPlanItem = {
      task_id: '22222222-2222-4222-8222-222222222222',
      title: 'System Design Notes',
      start_time: '2026-10-23T10:45:00+05:30',
      end_time: '2026-10-23T11:45:00+05:30',
      time_range: '10:45 AM - 11:45 AM',
      due_at: '2026-10-24T18:00:00+05:30',
      priority: 'medium',
      estimated_minutes: 60,
      reason: 'Scheduled sequentially after morning break.',
      warnings: [],
      is_conflict: false,
    };

    const plan: SchedulePlanData = {
      plan_period: 'daily',
      target_date: '2026-10-23',
      total_allocated_minutes: 150,
      conflicts_detected: false,
      warnings: [],
      items: [item1, item2],
      overload_warning: null,
    };

    const proposal: TaskActionProposal = {
      action_id: 'action-uuid-1234',
      action_type: 'apply_schedule_plan',
      schedule_plan: plan,
      approval_token: 'valid.hmac.token',
      expires_at: '2026-10-23T01:00:00Z',
      status: 'pending',
      description: 'Apply daily schedule plan (2 tasks)',
    };

    assert.strictEqual(proposal.action_type, 'apply_schedule_plan');
    assert.strictEqual(proposal.schedule_plan?.items.length, 2);
    assert.strictEqual(proposal.schedule_plan?.total_allocated_minutes, 150);
    assert.strictEqual(proposal.schedule_plan?.conflicts_detected, false);
  });

  it('correctly models schedule conflicts and overload advisories', () => {
    const conflictingItem: ScheduledPlanItem = {
      task_id: '33333333-3333-4333-8333-333333333333',
      title: 'Late Night Hackathon Prep',
      start_time: '2026-10-23T20:00:00+05:30',
      end_time: '2026-10-23T22:00:00+05:30',
      time_range: '08:00 PM - 10:00 PM',
      due_at: '2026-10-23T19:00:00+05:30',
      priority: 'high',
      estimated_minutes: 120,
      reason: 'Scheduled task',
      warnings: ['Scheduled block ends after deadline (19:00)'],
      is_conflict: true,
    };

    const plan: SchedulePlanData = {
      plan_period: 'daily',
      target_date: '2026-10-23',
      total_allocated_minutes: 360,
      conflicts_detected: true,
      warnings: ['1 schedule conflict detected.'],
      items: [conflictingItem],
      overload_warning: 'Total estimated duration exceeds stated availability of 180 minutes.',
    };

    assert.strictEqual(plan.conflicts_detected, true);
    assert.strictEqual(plan.items[0].is_conflict, true);
    assert.ok(plan.items[0].warnings && plan.items[0].warnings.length > 0);
    assert.ok(plan.overload_warning?.includes('exceeds stated availability'));
  });

  it('verifies strict zero emoji in smart planner UI copy and labels', () => {
    const plannerStrings = [
      'Proposed Schedule (2 Tasks)',
      'Confirm Schedule (2)',
      'Planned Time Blocks',
      'Daily Plan',
      'Multi-day Schedule',
      'Weekly Plan',
      'Workload Advisory:',
      'Schedule Notes:',
      'Total estimated duration exceeds stated availability.',
      'Scheduled block ends after deadline',
      'Time slot overlaps with another scheduled task',
      'Task deadline has already elapsed; scheduled as overdue recovery.',
      'mins allocated',
      'Apply daily schedule plan',
    ];

    for (const text of plannerStrings) {
      assert.strictEqual(
        emojiRegex.test(text),
        false,
        `Forbidden emoji found in planner copy: ${text}`
      );
    }
  });
});
