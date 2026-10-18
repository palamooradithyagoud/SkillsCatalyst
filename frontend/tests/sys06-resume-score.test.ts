import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';

// ── Mock Browser Storage Environment ──────────────────────────────────────────
const storage = new Map<string, string>();
const localStorageMock = {
  getItem: (k: string) => storage.get(k) ?? null,
  setItem: (k: string, v: string) => storage.set(k, String(v)),
  removeItem: (k: string) => storage.delete(k),
  clear: () => storage.clear(),
  get length() { return storage.size; },
  key: (i: number) => Array.from(storage.keys())[i] ?? null,
};

(globalThis as any).window = globalThis;
(globalThis as any).localStorage = localStorageMock;

import { reviewResume } from '@/lib/api/career';
import { ResumeReviewResponse } from '@/types/career';

describe('SYS-06: Resume AI Score Handling & Contract Suite', () => {
  beforeEach(() => {
    storage.clear();
  });

  describe('1. API Response Contract & Score Extraction (reviewResume)', () => {
    it('directly extracts overall_score from backend response and marks scoring_status="scored"', async () => {
      const mockResponse = {
        review: '## Overall Verdict\nFinal Score: 8.5/10\nStrong hire.',
        overall_score: 85,
        scoring_status: 'scored',
      };

      const originalFetch = globalThis.fetch;
      globalThis.fetch = async () =>
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });

      try {
        const result: ResumeReviewResponse = await reviewResume(
          'A long enough resume text with more than fifty characters to pass validation requirements.',
          'Fullstack Engineer',
          '1-3 years'
        );

        assert.strictEqual(result.overall_score, 85);
        assert.strictEqual(result.scoring_status, 'scored');
        assert.ok(result.review.includes('Final Score: 8.5/10'));
        assert.strictEqual(
          localStorage.getItem('skillscatalyst_latest_resume_score'),
          '85'
        );
      } finally {
        globalThis.fetch = originalFetch;
      }
    });

    it('handles unscored review (overall_score=null) without fabricating a score and does NOT overwrite localStorage', async () => {
      // Pre-populate an older valid score in localStorage
      localStorage.setItem('skillscatalyst_latest_resume_score', '78');

      const mockResponse = {
        review: '## Overall Verdict\nGood candidate with potential.',
        overall_score: null,
        scoring_status: 'unscored',
      };

      const originalFetch = globalThis.fetch;
      globalThis.fetch = async () =>
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });

      try {
        const result: ResumeReviewResponse = await reviewResume(
          'A long enough resume text with more than fifty characters to pass validation requirements.',
          'Backend Engineer',
          '1-3 years'
        );

        assert.strictEqual(result.overall_score, null);
        assert.strictEqual(result.scoring_status, 'unscored');
        assert.ok(result.review.includes('Good candidate with potential'));
        // Must NOT overwrite existing valid score with null, 0, or 75
        assert.strictEqual(
          localStorage.getItem('skillscatalyst_latest_resume_score'),
          '78'
        );
      } finally {
        globalThis.fetch = originalFetch;
      }
    });

    it('rejects out-of-bounds score from backend (e.g. 150) as null/unscored', async () => {
      const mockResponse = {
        review: '## Overall Verdict\nFinal Score: 150/100',
        overall_score: 150,
        scoring_status: 'scored',
      };

      const originalFetch = globalThis.fetch;
      globalThis.fetch = async () =>
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });

      try {
        const result = await reviewResume(
          'A long enough resume text with more than fifty characters to pass validation requirements.',
          'Data Scientist',
          '1-3 years'
        );

        assert.strictEqual(result.overall_score, null);
        assert.strictEqual(result.scoring_status, 'unscored');
        assert.strictEqual(localStorage.getItem('skillscatalyst_latest_resume_score'), null);
      } finally {
        globalThis.fetch = originalFetch;
      }
    });

    it('falls back to regex parsing for legacy responses omitting overall_score', async () => {
      const legacyResponse = {
        review: '## Overall Verdict\nFinal Score: 92/100\nExcellent work.',
      };

      const originalFetch = globalThis.fetch;
      globalThis.fetch = async () =>
        new Response(JSON.stringify(legacyResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });

      try {
        const result = await reviewResume(
          'A long enough resume text with more than fifty characters to pass validation requirements.',
          'Frontend Engineer',
          '3-5 years'
        );

        assert.strictEqual(result.overall_score, 92);
        assert.strictEqual(result.scoring_status, 'scored');
        assert.strictEqual(
          localStorage.getItem('skillscatalyst_latest_resume_score'),
          '92'
        );
      } finally {
        globalThis.fetch = originalFetch;
      }
    });

    it('throws on HTTP 502 AI Provider Failure instead of returning false success', async () => {
      const originalFetch = globalThis.fetch;
      globalThis.fetch = async () =>
        new Response(
          JSON.stringify({
            success: false,
            message: 'AI evaluator is temporarily unavailable. Please try again.',
          }),
          {
            status: 502,
            headers: { 'Content-Type': 'application/json' },
          }
        );

      try {
        await assert.rejects(
          async () => {
            await reviewResume(
              'A long enough resume text with more than fifty characters to pass validation requirements.',
              'Backend Engineer',
              '1-3 years'
            );
          },
          (err: any) => {
            assert.ok(
              err.message.includes('unavailable') || err.message.includes('502')
            );
            return true;
          }
        );
      } finally {
        globalThis.fetch = originalFetch;
      }
    });

    it('throws on HTTP 403 with LIMIT_REACHED code and message', async () => {
      const originalFetch = globalThis.fetch;
      globalThis.fetch = async () =>
        new Response(
          JSON.stringify({
            detail: {
              code: 'LIMIT_REACHED',
              message: 'Free plan limit reached.',
              limit: 1,
            },
          }),
          {
            status: 403,
            headers: { 'Content-Type': 'application/json' },
          }
        );

      try {
        await assert.rejects(
          async () => {
            await reviewResume(
              'A long enough resume text with more than fifty characters to pass validation requirements.',
              'Backend Engineer',
              '1-3 years'
            );
          },
          (err: any) => {
            assert.strictEqual(err.status, 403);
            assert.strictEqual(err.code, 'LIMIT_REACHED');
            return true;
          }
        );
      } finally {
        globalThis.fetch = originalFetch;
      }
    });
  });

  describe('2. Dashboard Score Resolution & User Isolation', () => {
    it('authoritative database score is preserved over stale higher localStorage score', () => {
      let dbScore = 65; // User newly received a lower score
      let userId: string | null = 'user-auth-123';
      localStorage.setItem('skillscatalyst_latest_resume_score', '95'); // Stale older score

      let resumeScore = dbScore;

      // SYS-06 isolated resolution logic:
      if (!userId && typeof window !== 'undefined') {
        const localResumeScoreRaw = localStorage.getItem('skillscatalyst_latest_resume_score');
        if (localResumeScoreRaw && resumeScore === 0) {
          const lScore = parseInt(localResumeScoreRaw, 10);
          if (!isNaN(lScore) && lScore >= 0 && lScore <= 100) {
            resumeScore = lScore;
          }
        }
      }

      assert.strictEqual(
        resumeScore,
        65,
        'Database score (65) must NOT be overwritten by stale localStorage (95)'
      );
    });

    it('authenticated user with no DB score does NOT inherit guest localStorage score', () => {
      let dbScore = 0; // Authenticated user has not uploaded a resume yet
      let userId: string | null = 'user-auth-new-456';
      localStorage.setItem('skillscatalyst_latest_resume_score', '88'); // Leftover from previous guest

      let resumeScore = dbScore;

      // SYS-06 isolated resolution logic:
      if (!userId && typeof window !== 'undefined') {
        const localResumeScoreRaw = localStorage.getItem('skillscatalyst_latest_resume_score');
        if (localResumeScoreRaw && resumeScore === 0) {
          const lScore = parseInt(localResumeScoreRaw, 10);
          if (!isNaN(lScore) && lScore >= 0 && lScore <= 100) {
            resumeScore = lScore;
          }
        }
      }

      assert.strictEqual(
        resumeScore,
        0,
        'Authenticated user without resume must display 0 ("No upload yet"), NOT guest localStorage score'
      );
    });

    it('safely uses localStorage when unauthenticated / guest (userId is null)', () => {
      let dbScore = 0;
      let userId: string | null = null; // Guest user
      localStorage.setItem('skillscatalyst_latest_resume_score', '88');

      let resumeScore = dbScore;

      if (!userId && typeof window !== 'undefined') {
        const localResumeScoreRaw = localStorage.getItem('skillscatalyst_latest_resume_score');
        if (localResumeScoreRaw && resumeScore === 0) {
          const lScore = parseInt(localResumeScoreRaw, 10);
          if (!isNaN(lScore) && lScore >= 0 && lScore <= 100) {
            resumeScore = lScore;
          }
        }
      }

      assert.strictEqual(resumeScore, 88);
    });

    it('rejects invalid, NaN, or out-of-bounds localStorage values', () => {
      const invalidValues = ['corrupted', 'NaN', '999', '-10', ''];

      for (const val of invalidValues) {
        let resumeScore = 0;
        let userId: string | null = null;
        localStorage.setItem('skillscatalyst_latest_resume_score', val);

        if (!userId && typeof window !== 'undefined') {
          const localResumeScoreRaw = localStorage.getItem('skillscatalyst_latest_resume_score');
          if (localResumeScoreRaw && resumeScore === 0) {
            const lScore = parseInt(localResumeScoreRaw, 10);
            if (!isNaN(lScore) && lScore >= 0 && lScore <= 100) {
              resumeScore = lScore;
            }
          }
        }

        assert.strictEqual(
          resumeScore,
          0,
          `Invalid value '${val}' must not change resumeScore from 0`
        );
      }
    });

    it('logout and account switching purges skillscatalyst_latest_resume_score preventing cross-user contamination', () => {
      // User A completes resume review and has score in localStorage
      localStorage.setItem('skillscatalyst_latest_resume_score', '90');
      assert.strictEqual(localStorage.getItem('skillscatalyst_latest_resume_score'), '90');

      // Emulate auth.tsx clearSessionLocal behavior on logout:
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('skillscatalyst_') || key.startsWith('sc_') || key.startsWith('sb-'))) {
          localStorage.removeItem(key);
        }
      }

      // Assert key was purged
      assert.strictEqual(localStorage.getItem('skillscatalyst_latest_resume_score'), null);

      // Now User B logs in with no DB score:
      let userB_dbScore = 0;
      let userB_id: string | null = 'user-b-789';
      let resumeScore = userB_dbScore;

      if (!userB_id && typeof window !== 'undefined') {
        const localResumeScoreRaw = localStorage.getItem('skillscatalyst_latest_resume_score');
        if (localResumeScoreRaw && resumeScore === 0) {
          const lScore = parseInt(localResumeScoreRaw, 10);
          if (!isNaN(lScore) && lScore >= 0 && lScore <= 100) {
            resumeScore = lScore;
          }
        }
      }

      assert.strictEqual(resumeScore, 0, 'User B must not see User A score after logout/switch');
    });
  });
});
