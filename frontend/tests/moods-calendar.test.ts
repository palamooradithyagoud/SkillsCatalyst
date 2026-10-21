import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import {
  computeCalendarGrid,
  summarizeMoods,
  formatLocalDate,
} from '../lib/api/moods';
import { MoodLog } from '../types/mood';

describe('Mood Calendar Engine & Calculations', () => {
  it('computes correct calendar grid for October 2026', () => {
    // October 2026: 31 days. Starts on Thursday (Oct 1 = Thursday, index 4).
    const cells = computeCalendarGrid(2026, 10);

    // Grid must be full weeks (multiples of 7)
    assert.strictEqual(cells.length % 7, 0, 'Grid must have multiple of 7 cells');
    
    // First 4 cells are from September (leading days)
    const currentMonthCells = cells.filter((c) => c.isCurrentMonth);
    assert.strictEqual(currentMonthCells.length, 31, 'October must have exactly 31 current month cells');

    // First cell of October should be 2026-10-01
    const oct1 = cells.find((c) => c.dateStr === '2026-10-01');
    assert.ok(oct1, 'Must contain 2026-10-01');
    assert.strictEqual(oct1?.dayNumber, 1);
    assert.strictEqual(oct1?.isCurrentMonth, true);

    // Last day of October should be 2026-10-31
    const oct31 = cells.find((c) => c.dateStr === '2026-10-31');
    assert.ok(oct31, 'Must contain 2026-10-31');
    assert.strictEqual(oct31?.dayNumber, 31);
    assert.strictEqual(oct31?.isCurrentMonth, true);
  });

  it('computes correct calendar grid for November 2026 (next month)', () => {
    // November 2026: 30 days. Starts on Sunday (Nov 1 = Sunday, index 0).
    const cells = computeCalendarGrid(2026, 11);

    assert.strictEqual(cells.length % 7, 0, 'Grid must have multiple of 7 cells');
    const currentMonthCells = cells.filter((c) => c.isCurrentMonth);
    assert.strictEqual(currentMonthCells.length, 30, 'November must have 30 days');

    // Starts on Sunday, so cell 0 should be Nov 1
    assert.strictEqual(cells[0].dateStr, '2026-11-01');
    assert.strictEqual(cells[0].dayNumber, 1);
    assert.strictEqual(cells[0].isCurrentMonth, true);
  });

  it('correctly handles leap year February 2028', () => {
    const cells = computeCalendarGrid(2028, 2);
    const currentMonthCells = cells.filter((c) => c.isCurrentMonth);
    assert.strictEqual(currentMonthCells.length, 29, 'Feb 2028 must have 29 days');
  });

  it('formats local dates consistently into YYYY-MM-DD', () => {
    const dt = new Date(2026, 9, 25); // Oct 25, 2026
    const formatted = formatLocalDate(dt);
    assert.strictEqual(formatted, '2026-10-25');
  });
});

describe('Mood Aggregation & Statistical Summary', () => {
  it('identifies dominant mood correctly when happy is most frequent', () => {
    const sampleLogs: MoodLog[] = [
      { id: '1', user_id: 'u1', log_date: '2026-10-01', mood: 'happy' },
      { id: '2', user_id: 'u1', log_date: '2026-10-02', mood: 'happy' },
      { id: '3', user_id: 'u1', log_date: '2026-10-03', mood: 'sleepy' },
      { id: '4', user_id: 'u1', log_date: '2026-10-04', mood: 'calm' },
    ];

    const summary = summarizeMoods(2026, 10, sampleLogs);
    assert.strictEqual(summary.predominant_mood, 'happy');
    assert.strictEqual(summary.total_logged, 4);
    assert.strictEqual(summary.mood_counts['happy'], 2);
    assert.strictEqual(summary.mood_counts['sleepy'], 1);
    assert.strictEqual(summary.mood_counts['calm'], 1);
  });

  it('handles empty month logs without errors', () => {
    const summary = summarizeMoods(2026, 11, []);
    assert.strictEqual(summary.predominant_mood, null);
    assert.strictEqual(summary.total_logged, 0);
    assert.deepStrictEqual(summary.mood_counts, {});
  });
});

describe('Strict Zero-Emoji Rule for Mood Tracker Files', () => {
  const emojiRegex =
    /[\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}]/u;

  const targetFiles = [
    'components/dashboard/MoodCalendarWidget.tsx',
    'lib/api/moods.ts',
    'types/mood.ts',
  ];

  for (const relativePath of targetFiles) {
    it(`verifies 0 unicode emojis in ${relativePath}`, () => {
      const fullPath = path.join(process.cwd(), relativePath);
      assert.ok(fs.existsSync(fullPath), `File must exist: ${relativePath}`);

      const content = fs.readFileSync(fullPath, 'utf8');
      const matches = content.match(emojiRegex);

      assert.strictEqual(
        matches,
        null,
        `Forbidden emoji found in ${relativePath}: ${JSON.stringify(matches)}`
      );
    });
  }
});
