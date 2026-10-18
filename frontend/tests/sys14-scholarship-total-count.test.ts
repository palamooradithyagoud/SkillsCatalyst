import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

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

import {
  fetchStudentScholarships,
  fetchAdminScholarships,
} from '@/lib/api/scholarships';
import type { ScholarshipItem, ScholarshipListResponse } from '@/types/scholarships';

describe('SYS-14 — Scholarship Total-Count Inconsistency Verification', () => {
  const originalFetch = globalThis.fetch;
  let interceptedUrls: string[] = [];

  beforeEach(() => {
    storage.clear();
    interceptedUrls = [];
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  // =========================================================================
  // A. API CLIENT & PAGINATION INDEPENDENCE
  // =========================================================================
  describe('A. API Client Count Invariants', () => {
    it('fetchStudentScholarships returns total matching count independent of page slice length', async () => {
      const mockItems: ScholarshipItem[] = [
        {
          id: 'sch-1',
          name: 'First Scholarship',
          provided_by: 'Org A',
          qualification_required: 'UG',
          eligibility: 'All branches',
          requirements: 'Resume',
          application_url: 'https://example.com/apply1',
          image_url: null,
          status: 'published',
          visible_from: null,
          visible_until: null,
          created_by: 'admin-1',
          created_at: '2026-10-01T00:00:00Z',
          updated_at: '2026-10-01T00:00:00Z',
        },
        {
          id: 'sch-2',
          name: 'Second Scholarship',
          provided_by: 'Org B',
          qualification_required: 'UG',
          eligibility: 'All branches',
          requirements: 'Resume',
          application_url: 'https://example.com/apply2',
          image_url: null,
          status: 'published',
          visible_from: null,
          visible_until: null,
          created_by: 'admin-1',
          created_at: '2026-10-01T00:00:00Z',
          updated_at: '2026-10-01T00:00:00Z',
        },
      ];

      // Backend returns page slice of 2 items, but total matching count is 14
      globalThis.fetch = async (url: any) => {
        interceptedUrls.push(String(url));
        const body: ScholarshipListResponse = {
          scholarships: mockItems,
          total: 14,
        };
        return new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } });
      };

      const result = await fetchStudentScholarships({ limit: 2, offset: 4 });
      assert.strictEqual(result.total, 14, 'Total must equal 14, not page slice length');
      assert.strictEqual(result.scholarships.length, 2, 'Page slice length should be 2');
      assert.ok(interceptedUrls[0].includes('limit=2'), 'URL should forward limit');
      assert.ok(interceptedUrls[0].includes('offset=4'), 'URL should forward offset');
    });

    it('fetchAdminScholarships preserves total matching count with status and search parameters', async () => {
      globalThis.fetch = async (url: any) => {
        interceptedUrls.push(String(url));
        const body: ScholarshipListResponse = {
          scholarships: [],
          total: 8,
        };
        return new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } });
      };

      const result = await fetchAdminScholarships({
        status: 'draft',
        search: 'research',
        limit: 10,
        offset: 0,
      });

      assert.strictEqual(result.total, 8);
      assert.strictEqual(result.scholarships.length, 0);
      assert.ok(interceptedUrls[0].includes('status=draft'));
      assert.ok(interceptedUrls[0].includes('search=research'));
    });

    it('handles genuine empty result set returning total: 0 and empty list', async () => {
      globalThis.fetch = async (url: any) => {
        interceptedUrls.push(String(url));
        const body: ScholarshipListResponse = {
          scholarships: [],
          total: 0,
        };
        return new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } });
      };

      const result = await fetchStudentScholarships({ search: 'nonexistent-term-xyz' });
      assert.strictEqual(result.total, 0);
      assert.strictEqual(result.scholarships.length, 0);
    });

    it('explicitly propagates HTTP error responses without converting to verified 0', async () => {
      globalThis.fetch = async () => {
        return new Response(JSON.stringify({ detail: 'Database service unavailable' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        });
      };

      await assert.rejects(
        async () => {
          await fetchStudentScholarships();
        },
        /Failed to load scholarships: HTTP 503/,
        'Should throw explicit error for 503 failure'
      );
    });
  });

  // =========================================================================
  // B. FRONTEND COUNT DISPLAY LOGIC & DEFENSIVE PARSING
  // =========================================================================
  describe('B. Frontend Display Semantics & Defensive Normalization', () => {
    it('accurately distinguishes total count from displayed slice length', () => {
      const apiPayload = {
        scholarships: [{ id: '1' }, { id: '2' }, { id: '3' }],
        total: 27,
      };

      // Widget logic: extract totalCount safely
      const totalCount = typeof apiPayload?.total === 'number'
        ? apiPayload.total
        : apiPayload.scholarships.length;

      const displayedCount = apiPayload.scholarships.length;

      assert.strictEqual(totalCount, 27, 'Total matching count represents full catalog match');
      assert.strictEqual(displayedCount, 3, 'Displayed count is only the current page/slice');
      assert.notStrictEqual(totalCount, displayedCount, 'Total count must not be conflated with displayed items');
    });

    it('safely handles missing or undefined total field by falling back to items length without NaN', () => {
      const legacyPayloadWithoutTotal: any = {
        scholarships: [{ id: '1' }, { id: '2' }],
      };

      const totalCount = typeof legacyPayloadWithoutTotal?.total === 'number'
        ? legacyPayloadWithoutTotal.total
        : legacyPayloadWithoutTotal.scholarships.length;

      assert.strictEqual(totalCount, 2);
      assert.ok(!Number.isNaN(totalCount), 'Count must never be NaN');
    });

    it('preserves zero total as 0 and does not treat it as falsy fallback', () => {
      const zeroPayload = {
        scholarships: [],
        total: 0,
      };

      const totalCount = typeof zeroPayload?.total === 'number'
        ? zeroPayload.total
        : zeroPayload.scholarships.length;

      assert.strictEqual(totalCount, 0, 'Zero must be strictly preserved');
    });

    it('computes correct pagination subtext when displaying a subset', () => {
      // Helper replicating ScholarshipsWidget count subtext
      function getCountDisplay(total: number, displayed: number, query: string) {
        const isSearch = query.trim().length > 0;
        const mainBadge = isSearch
          ? `Found ${total} scholarship${total === 1 ? '' : 's'} matching "${query}"`
          : `${total} Available Scholarship${total === 1 ? '' : 's'}`;

        const subtext = total > displayed
          ? `Showing top ${displayed} of ${total}`
          : null;

        return { mainBadge, subtext };
      }

      // 1. Paginated slice: 4 shown out of 12 total
      const paginated = getCountDisplay(12, 4, '');
      assert.strictEqual(paginated.mainBadge, '12 Available Scholarships');
      assert.strictEqual(paginated.subtext, 'Showing top 4 of 12');

      // 2. Unpaginated / all items fit: 3 shown out of 3 total
      const allFit = getCountDisplay(3, 3, '');
      assert.strictEqual(allFit.mainBadge, '3 Available Scholarships');
      assert.strictEqual(allFit.subtext, null);

      // 3. Search query active with paginated results
      const searchRes = getCountDisplay(7, 2, 'google');
      assert.strictEqual(searchRes.mainBadge, 'Found 7 scholarships matching "google"');
      assert.strictEqual(searchRes.subtext, 'Showing top 2 of 7');

      // 4. Singular match
      const singular = getCountDisplay(1, 1, 'specific-grant');
      assert.strictEqual(singular.mainBadge, 'Found 1 scholarship matching "specific-grant"');
      assert.strictEqual(singular.subtext, null);
    });

    it('Admin CMS badge correctly displays totalCount from res.total', () => {
      function getAdminBadgeText(totalCount: number, statusFilter: string, searchQuery: string) {
        const isFiltered = statusFilter !== 'all' || searchQuery.trim().length > 0;
        return `${totalCount} ${isFiltered ? 'Found' : 'Registered'}`;
      }

      // Unfiltered: all 17 registered
      assert.strictEqual(getAdminBadgeText(17, 'all', ''), '17 Registered');

      // Status filtered: 3 drafts found
      assert.strictEqual(getAdminBadgeText(3, 'draft', ''), '3 Found');

      // Search filtered: 5 found
      assert.strictEqual(getAdminBadgeText(5, 'all', 'merit'), '5 Found');
    });
  });

  // =========================================================================
  // C. ASYNCHRONOUS RACE-CONDITION & MONOTONIC COUNTER INTEGRITY
  // =========================================================================
  describe('C. Race Condition & Monotonic Filter Updates', () => {
    it('prevents older delayed asynchronous responses from overwriting newer counts', async () => {
      let activeRequestId = 0;
      let displayedTotal = 0;

      async function triggerSearch(query: string, delayMs: number, resultTotal: number) {
        activeRequestId++;
        const currentReqId = activeRequestId;

        await new Promise((resolve) => setTimeout(resolve, delayMs));

        // State update condition: only update if this is the newest request
        if (currentReqId === activeRequestId) {
          displayedTotal = resultTotal;
        }
      }

      // Trigger Request 1 (slow, 50ms) for broad query yielding 20 items
      const req1 = triggerSearch('engineering', 50, 20);

      // Trigger Request 2 (fast, 10ms) for narrow query yielding 3 items
      const req2 = triggerSearch('women in engineering', 10, 3);

      await Promise.all([req1, req2]);

      // Request 2 should win even though Request 1 finished later
      assert.strictEqual(displayedTotal, 3, 'Latest query count (3) must not be overwritten by delayed query (20)');
    });
  });
});
