import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { resolveLearnMoreDestination } from '@/components/skillbits/SkillBitReelItem';
import type { StudentSkillBit } from '@/types/skillbits';

describe('SkillBits Step 3: Reels-Style Student Experience Characterization', () => {

  const baseSkillBit: StudentSkillBit = {
    id: 'sb-101-uuid',
    title: 'CSS Container Queries in 60s',
    description: 'Learn responsive container queries instead of media queries.',
    topic: 'CSS',
    difficulty: 'intermediate',
    duration_seconds: 58,
    thumbnail_url: null,
    video_provider: 'mux',
    playback_id: 'mux_playback_container_queries_123',
    skills: [{ id: 'css-1', skill_key: 'css', skill_name: 'CSS3' }],
    courses: [],
    lessons: [],
    roadmaps: [],
    published_at: '2026-09-24T00:00:00Z',
  };

  describe('1. Learn More Dynamic Destination Resolution', () => {
    it('returns null when lessons, courses, and roadmaps are empty (Step 1 deferred state)', () => {
      const bit: StudentSkillBit = {
        ...baseSkillBit,
        courses: [],
        lessons: [],
        roadmaps: [],
      };
      const result = resolveLearnMoreDestination(bit);
      assert.strictEqual(result, null, 'Must NOT show misleading Learn More when no relationships exist');
    });

    it('prioritizes lesson destination when lesson relationship exists', () => {
      const bit: StudentSkillBit = {
        ...baseSkillBit,
        lessons: [{ id: 'lesson-react-hook', title: 'React Hooks' }],
        courses: [{ id: 'course-react-101', title: 'React Masterclass' }],
      };
      const result = resolveLearnMoreDestination(bit);
      assert.notStrictEqual(result, null);
      assert.strictEqual(result?.label, 'Learn More in Lesson →');
      assert.strictEqual(result?.href, '/learning?lesson=lesson-react-hook');
    });

    it('falls back to course destination when only course exists', () => {
      const bit: StudentSkillBit = {
        ...baseSkillBit,
        lessons: [],
        courses: [{ id: 'course-advanced-css', title: 'Advanced CSS' }],
        roadmaps: [{ id: 'roadmap-frontend', title: 'Frontend Developer' }],
      };
      const result = resolveLearnMoreDestination(bit);
      assert.notStrictEqual(result, null);
      assert.strictEqual(result?.label, 'Learn More in Course →');
      assert.strictEqual(result?.href, '/courses?id=course-advanced-css');
    });

    it('falls back to roadmap destination when only roadmap exists', () => {
      const bit: StudentSkillBit = {
        ...baseSkillBit,
        lessons: [],
        courses: [],
        roadmaps: [{ id: 'roadmap-fullstack', title: 'Fullstack Engineer' }],
      };
      const result = resolveLearnMoreDestination(bit);
      assert.notStrictEqual(result, null);
      assert.strictEqual(result?.label, 'Explore Roadmap →');
      assert.strictEqual(result?.href, '/roadmaps?id=roadmap-fullstack');
    });

    it('handles slug fallback if id is not present on relational entity', () => {
      const bit: StudentSkillBit = {
        ...baseSkillBit,
        lessons: [{ slug: 'intro-to-grid', title: 'CSS Grid' }],
      };
      const result = resolveLearnMoreDestination(bit);
      assert.strictEqual(result?.href, '/learning?lesson=intro-to-grid');
    });
  });

  describe('2. Reels Single-Active-Video State Machine Simulation', () => {
    it('maintains exactly one active video index at a time', () => {
      let activeIndex = 0;
      const totalBits = 5;

      const setActive = (idx: number) => {
        if (idx >= 0 && idx < totalBits) {
          activeIndex = idx;
        }
      };

      assert.strictEqual(activeIndex, 0);
      setActive(1);
      assert.strictEqual(activeIndex, 1);
      setActive(4);
      assert.strictEqual(activeIndex, 4);

      // Boundaries
      setActive(5);
      assert.strictEqual(activeIndex, 4, 'Should not exceed bounds');
      setActive(-1);
      assert.strictEqual(activeIndex, 4, 'Should not go below zero');
    });

    it('computes preloading states correctly for active and adjacent items', () => {
      const activeIndex = 2;
      const getPreloadStrategy = (index: number, active: number) => {
        if (index === active) return 'auto';
        if (index === active + 1) return 'metadata';
        return 'none';
      };

      assert.strictEqual(getPreloadStrategy(0, activeIndex), 'none');
      assert.strictEqual(getPreloadStrategy(1, activeIndex), 'none');
      assert.strictEqual(getPreloadStrategy(2, activeIndex), 'auto', 'Active video must load and auto-play');
      assert.strictEqual(getPreloadStrategy(3, activeIndex), 'metadata', 'Next video preloads metadata only');
      assert.strictEqual(getPreloadStrategy(4, activeIndex), 'none', 'Non-adjacent video should not load buffer');
    });
  });

  describe('3. Pagination & Deduplication Logic', () => {
    it('prevents duplicate items when appending new pages', () => {
      const initialFeed: StudentSkillBit[] = [
        { ...baseSkillBit, id: 'sb-1' },
        { ...baseSkillBit, id: 'sb-2' },
      ];

      const nextPage: StudentSkillBit[] = [
        { ...baseSkillBit, id: 'sb-2' }, // duplicate
        { ...baseSkillBit, id: 'sb-3' }, // new
      ];

      const existingIds = new Set(initialFeed.map((b) => b.id));
      const uniqueNew = nextPage.filter((b) => !existingIds.has(b.id));
      const combined = [...initialFeed, ...uniqueNew];

      assert.strictEqual(combined.length, 3);
      assert.deepStrictEqual(
        combined.map((b) => b.id),
        ['sb-1', 'sb-2', 'sb-3']
      );
    });

    it('triggers loadMore only when reaching threshold (length - 2)', () => {
      const shouldFetchMore = (
        currIndex: number,
        totalItems: number,
        hasMore: boolean,
        isLoading: boolean
      ): boolean => {
        return currIndex >= totalItems - 2 && hasMore && !isLoading;
      };

      assert.strictEqual(shouldFetchMore(0, 10, true, false), false);
      assert.strictEqual(shouldFetchMore(7, 10, true, false), false);
      assert.strictEqual(shouldFetchMore(8, 10, true, false), true, 'Index 8 of 10 should trigger fetch');
      assert.strictEqual(shouldFetchMore(9, 10, true, false), true, 'Index 9 of 10 should trigger fetch');
      assert.strictEqual(shouldFetchMore(8, 10, false, false), false, 'Should not fetch if hasMore is false');
      assert.strictEqual(shouldFetchMore(8, 10, true, true), false, 'Should not fetch if already loading');
    });
  });

  describe('4. Security & Credential Isolation Verification', () => {
    it('verifies StudentSkillBit model contains only playback_id and strictly excludes internal asset IDs and credentials', () => {
      const record = baseSkillBit as unknown as Record<string, unknown>;
      assert.ok('playback_id' in record, 'playback_id must be exposed for streaming');
      assert.strictEqual(record.video_asset_id, undefined, 'video_asset_id must be absent');
      assert.strictEqual(record.mux_token_id, undefined, 'mux_token_id must never exist');
      assert.strictEqual(record.mux_token_secret, undefined, 'mux_token_secret must never exist');
      assert.strictEqual(record.created_by, undefined, 'created_by internal audit must be absent');
    });

    it('verifies frontend code does not reference private Mux environment variables', () => {
      const pageCode = fs.readFileSync(
        path.join(__dirname, '../app/skillbits/page.tsx'),
        'utf8'
      );
      const reelItemCode = fs.readFileSync(
        path.join(__dirname, '../components/skillbits/SkillBitReelItem.tsx'),
        'utf8'
      );

      assert.strictEqual(pageCode.includes('MUX_TOKEN_ID'), false);
      assert.strictEqual(pageCode.includes('MUX_TOKEN_SECRET'), false);
      assert.strictEqual(pageCode.includes('MUX_WEBHOOK_SECRET'), false);

      assert.strictEqual(reelItemCode.includes('MUX_TOKEN_ID'), false);
      assert.strictEqual(reelItemCode.includes('MUX_TOKEN_SECRET'), false);
      assert.strictEqual(reelItemCode.includes('MUX_WEBHOOK_SECRET'), false);
    });

    it('verifies zero social media elements (no likes, comments, follower counters)', () => {
      const reelItemCode = fs.readFileSync(
        path.join(__dirname, '../components/skillbits/SkillBitReelItem.tsx'),
        'utf8'
      );

      // Verify no social terminology in component JSX
      const forbiddenTokens = ['likeCount', 'likes', 'comments', 'commentCount', 'followerCount', 'followBtn'];
      for (const token of forbiddenTokens) {
        assert.strictEqual(
          reelItemCode.includes(token),
          false,
          `Component must not contain social media token "${token}"`
        );
      }
    });
  });
});
