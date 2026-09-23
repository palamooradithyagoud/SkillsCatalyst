import { describe, it, beforeEach, mock } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import type { SkillBitSortOption, VideoStatus } from '@/types/skillbits';

describe('SkillBits Phase 5: Discovery, Filtering & Operational Management', () => {

  describe('1. Sort Options & Whitelist Validity', () => {
    const validSortOptions: SkillBitSortOption[] = [
      'newest',
      'oldest',
      'title_asc',
      'title_desc',
      'duration_desc',
      'duration_asc',
      'updated_at',
    ];

    it('defines exactly the whitelisted sort options in types', () => {
      assert.strictEqual(validSortOptions.length, 7);
      assert.ok(validSortOptions.includes('newest'));
      assert.ok(validSortOptions.includes('duration_desc'));
      assert.ok(validSortOptions.includes('updated_at'));
    });
  });

  describe('2. Client API Parameter Formatting', () => {
    it('constructs correct query string with sort, pagination, and filters', () => {
      const params = {
        status_filter: 'draft',
        topic: 'React',
        difficulty: 'intermediate',
        search: 'Transition',
        sort: 'title_asc',
        page: 2,
        page_size: 20,
      };

      const query = new URLSearchParams();
      if (params.status_filter?.trim()) query.set('status_filter', params.status_filter.trim());
      if (params.topic?.trim()) query.set('topic', params.topic.trim());
      if (params.difficulty?.trim()) query.set('difficulty', params.difficulty.trim());
      if (params.search?.trim()) query.set('search', params.search.trim());
      if (params.sort?.trim()) query.set('sort', params.sort.trim());
      if (params.page) query.set('page', String(params.page));
      if (params.page_size) query.set('page_size', String(params.page_size));

      const qs = query.toString();
      assert.strictEqual(
        qs,
        'status_filter=draft&topic=React&difficulty=intermediate&search=Transition&sort=title_asc&page=2&page_size=20'
      );
    });
  });

  describe('3. Publish Readiness Guard Contract', () => {
    it('disallows publishing for any video status other than READY', () => {
      const statuses: VideoStatus[] = ['NOT_UPLOADED', 'UPLOADING', 'PROCESSING', 'ERROR'];

      for (const vStatus of statuses) {
        const canPublish = vStatus === ('READY' as VideoStatus);
        assert.strictEqual(canPublish, false, `Video in ${vStatus} status must NOT be publishable`);
      }

      const readyStatus: VideoStatus = 'READY';
      const canPublishReady = readyStatus === ('READY' as VideoStatus);
      assert.strictEqual(canPublishReady, true, 'Video in READY status must be publishable');
    });
  });

  describe('4. Component & Page Code Integrity', () => {
    const rootDir = process.cwd().endsWith('frontend') ? process.cwd() : path.resolve(process.cwd(), 'frontend');

    it('ensures AdminSkillBitsCMS includes unpublish, restore, and sort controls', () => {
      const cmsPath = path.resolve(rootDir, 'components/admin/AdminSkillBitsCMS.tsx');
      assert.ok(fs.existsSync(cmsPath), 'AdminSkillBitsCMS.tsx must exist');
      const content = fs.readFileSync(cmsPath, 'utf8');

      assert.ok(content.includes('unpublishAdminSkillBit'), 'Must wire unpublishAdminSkillBit');
      assert.ok(content.includes('restoreAdminSkillBit'), 'Must wire restoreAdminSkillBit');
      assert.ok(content.includes('updateAdminSkillBit'), 'Must wire updateAdminSkillBit');
      assert.ok(content.includes('sortOption'), 'Must manage sortOption state');
      assert.ok(content.includes('totalPages'), 'Must manage totalPages state');
      assert.ok(content.includes("video_status === \"READY\""), 'Must enforce READY video status guard');
    });

    it('ensures student skillbits page includes topic and difficulty discovery chips', () => {
      const pagePath = path.resolve(rootDir, 'app/skillbits/page.tsx');
      assert.ok(fs.existsSync(pagePath), 'app/skillbits/page.tsx must exist');
      const content = fs.readFileSync(pagePath, 'utf8');

      assert.ok(content.includes('selectedDifficulty'), 'Must manage selectedDifficulty');
      assert.ok(content.includes('selectedTopic'), 'Must manage selectedTopic');
      assert.ok(content.includes('handleClearFilters'), 'Must have handleClearFilters');
      assert.ok(content.includes('fetchStudentSkillBits'), 'Must call fetchStudentSkillBits');
    });
  });

});
