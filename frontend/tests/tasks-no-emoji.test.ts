import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

describe('Phase 1: Strict Zero-Emoji Rule Verification', () => {
  // Comprehensive unicode regex matching all emoji ranges
  const emojiRegex =
    /[\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}]/u;

  const targetFiles = [
    'app/tasks/page.tsx',
    'components/tasks/TaskCard.tsx',
    'components/tasks/TaskDashboardOverview.tsx',
    'components/tasks/TaskDashboardWidget.tsx',
    'components/tasks/TaskDetailDrawer.tsx',
    'components/tasks/TaskFilters.tsx',
    'components/tasks/TaskModal.tsx',
    'components/tasks/TaskViewTabs.tsx',
    'components/tasks/DeleteConfirmDialog.tsx',
    'lib/api/tasks.ts',
    'lib/tasks/validation.ts',
    'lib/tasks/dateUtils.ts',
    'types/task.ts',
  ];

  for (const relativePath of targetFiles) {
    it(`verifies 0 emojis in ${relativePath}`, () => {
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
