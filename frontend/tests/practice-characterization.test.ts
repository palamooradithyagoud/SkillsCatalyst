import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  formatCompanyName,
  getLeetCodeUrl,
  calculateNodeProgress,
  calculateCompanySolvedCount,
  calculateCompanyProgressPercent,
  filterQuestionsByStatus,
  filterCompaniesList,
} from '@/lib/practice/practiceHelpers';
import {
  TOP_COMPANIES,
  PERIODS,
  DIFFICULTIES,
  STATUS_OPTIONS,
} from '@/data/practice/constants';
import {
  BEGINNER_TREE_DATA,
  NODE_PROBLEM_IDS,
} from '@/data/practice/dsaTreeData';

describe('Practice Module Characterization Suite', () => {
  describe('Company Name Normalization (formatCompanyName)', () => {
    it('correctly maps all known special acronyms and stylized company names', () => {
      assert.strictEqual(formatCompanyName('at-t'), 'AT&T');
      assert.strictEqual(formatCompanyName('bookingcom'), 'Booking.com');
      assert.strictEqual(formatCompanyName('c3-ai'), 'C3 AI');
      assert.strictEqual(formatCompanyName('ibm'), 'IBM');
      assert.strictEqual(formatCompanyName('nvidia'), 'NVIDIA');
      assert.strictEqual(formatCompanyName('pwc'), 'PwC');
      assert.strictEqual(formatCompanyName('sig'), 'SIG');
      assert.strictEqual(formatCompanyName('tcs'), 'TCS');
      assert.strictEqual(formatCompanyName('jpmorgan'), 'JPMorgan');
    });

    it('capitalizes multi-word hyphenated company slugs', () => {
      assert.strictEqual(formatCompanyName('goldman-sachs'), 'Goldman Sachs');
      assert.strictEqual(formatCompanyName('morgan-stanley'), 'Morgan Stanley');
    });

    it('capitalizes standard single-word company slugs', () => {
      assert.strictEqual(formatCompanyName('google'), 'Google');
      assert.strictEqual(formatCompanyName('amazon'), 'Amazon');
      assert.strictEqual(formatCompanyName('netflix'), 'Netflix');
    });

    it('returns empty string for empty or falsy inputs', () => {
      assert.strictEqual(formatCompanyName(''), '');
      assert.strictEqual(formatCompanyName(null as any), '');
    });
  });

  describe('LeetCode URL Generation (getLeetCodeUrl)', () => {
    it('returns existing absolute HTTP/HTTPS URLs without modification', () => {
      const q = { url: 'https://leetcode.com/problems/two-sum', title: 'Two Sum' };
      assert.strictEqual(getLeetCodeUrl(q), 'https://leetcode.com/problems/two-sum');
    });

    it('generates correct LeetCode problem URL from question title', () => {
      const q = { title: 'Two Sum' };
      assert.strictEqual(getLeetCodeUrl(q), 'https://leetcode.com/problems/two-sum');
    });

    it('handles titles with punctuation, numbers, and multiple spaces', () => {
      const q = { title: '3Sum Closest (Special Edition!)' };
      assert.strictEqual(getLeetCodeUrl(q), 'https://leetcode.com/problems/3sum-closest-special-edition');
    });
  });

  describe('DSA Tree Progress Calculation (calculateNodeProgress)', () => {
    it('calculates 100% progress when all problem IDs in node are solved', () => {
      // Two-pointers has 21 problem IDs
      const twoPointerIds = NODE_PROBLEM_IDS['two-pointers'];
      const drawerSolved: Record<number, boolean> = {};
      twoPointerIds.forEach((id) => {
        drawerSolved[id] = true;
      });

      const res = calculateNodeProgress('two-pointers', drawerSolved);
      assert.strictEqual(res.total, twoPointerIds.length);
      assert.strictEqual(res.solved, twoPointerIds.length);
      assert.strictEqual(res.pct, 100);
    });

    it('calculates partial progress and rounds to nearest integer', () => {
      // kadanes has 5 problem IDs: [53, 918, 1749, 1191, 2321]
      const drawerSolved: Record<number, boolean> = {
        53: true,
        918: true, // 2 out of 5 = 40%
      };

      const res = calculateNodeProgress('kadanes', drawerSolved);
      assert.strictEqual(res.total, 5);
      assert.strictEqual(res.solved, 2);
      assert.strictEqual(res.pct, 40);
    });

    it('returns 0% progress when no problems in node are solved', () => {
      const res = calculateNodeProgress('kadanes', {});
      assert.strictEqual(res.total, 5);
      assert.strictEqual(res.solved, 0);
      assert.strictEqual(res.pct, 0);
    });

    it('returns zero defaults for unknown node IDs', () => {
      const res = calculateNodeProgress('unknown_node_xyz', {});
      assert.strictEqual(res.total, 0);
      assert.strictEqual(res.solved, 0);
      assert.strictEqual(res.pct, 0);
    });
  });

  describe('Company Question Solved Counts & Status Filtering', () => {
    const questions = [
      { id: 1, title: 'Two Sum' },
      { id: 2, title: 'Add Two Numbers' },
      { id: 3, title: 'Longest Substring Without Repeating Characters' },
    ];

    it('counts solved questions using both key formats', () => {
      const solvedState = {
        'q_google_1_Two Sum': true, // format 1: scoped key
        '2': true,                  // format 2: id key
      };

      const solvedCount = calculateCompanySolvedCount(questions, solvedState, 'google');
      assert.strictEqual(solvedCount, 2);

      const pct = calculateCompanyProgressPercent(solvedCount, questions.length);
      assert.strictEqual(pct, 67); // 2/3 = 66.66% -> 67%
    });

    it('calculates 0% for empty question list', () => {
      assert.strictEqual(calculateCompanyProgressPercent(0, 0), 0);
    });

    it('filterQuestionsByStatus handles All, Unsolved, and Completed filters correctly', () => {
      const solvedState = {
        'q_meta_1_Two Sum': true,
      };

      const all = filterQuestionsByStatus(questions, 'All', solvedState, 'meta');
      assert.strictEqual(all.length, 3);

      const unsolved = filterQuestionsByStatus(questions, 'Unsolved', solvedState, 'meta');
      assert.strictEqual(unsolved.length, 2);
      assert.deepStrictEqual(unsolved.map((q) => q.id), [2, 3]);

      const completed = filterQuestionsByStatus(questions, 'Completed', solvedState, 'meta');
      assert.strictEqual(completed.length, 1);
      assert.strictEqual(completed[0].id, 1);
    });
  });

  describe('Company List Filtering (filterCompaniesList)', () => {
    const list = ['google', 'amazon', 'goldman-sachs', 'at-t', 'pwc'];

    it('returns full list when search query is empty', () => {
      assert.deepStrictEqual(filterCompaniesList(list, ''), list);
      assert.deepStrictEqual(filterCompaniesList(list, '   '), list);
    });

    it('filters by raw slug substring match', () => {
      const res = filterCompaniesList(list, 'gold');
      assert.deepStrictEqual(res, ['goldman-sachs']);
    });

    it('filters by formatted display name (e.g. PwC or AT&T)', () => {
      const res1 = filterCompaniesList(list, 'AT&T');
      assert.deepStrictEqual(res1, ['at-t']);

      const res2 = filterCompaniesList(list, 'PwC');
      assert.deepStrictEqual(res2, ['pwc']);
    });
  });

  describe('Static Practice Tree Data & Constants Integrity', () => {
    it('contains all 4 core DSA categories in BEGINNER_TREE_DATA', () => {
      assert.strictEqual(BEGINNER_TREE_DATA.length, 4);
      const catIds = BEGINNER_TREE_DATA.map((c) => c.id);
      assert.deepStrictEqual(catIds, ['arrays', 'strings', 'hashmap', 'binary-search']);
    });

    it('every node in BEGINNER_TREE_DATA maps to valid problem IDs in NODE_PROBLEM_IDS', () => {
      for (const cat of BEGINNER_TREE_DATA) {
        assert.ok(cat.nodes.length > 0, `Category ${cat.id} has nodes`);
        for (const node of cat.nodes) {
          assert.ok(node.id, `Node in ${cat.id} has an id`);
          assert.ok(
            NODE_PROBLEM_IDS[node.id] && NODE_PROBLEM_IDS[node.id].length > 0,
            `Node ${node.id} has valid problem IDs mapped`
          );
        }
      }
    });

    it('TOP_COMPANIES contains 15 curated company slugs', () => {
      assert.strictEqual(TOP_COMPANIES.length, 15);
      assert.ok(TOP_COMPANIES.includes('google'));
      assert.ok(TOP_COMPANIES.includes('amazon'));
      assert.ok(TOP_COMPANIES.includes('meta'));
    });

    it('PERIODS, DIFFICULTIES, and STATUS_OPTIONS contain required values', () => {
      assert.strictEqual(PERIODS.length, 5);
      assert.strictEqual(DIFFICULTIES.length, 4);
      assert.strictEqual(STATUS_OPTIONS.length, 3);
    });
  });
});
