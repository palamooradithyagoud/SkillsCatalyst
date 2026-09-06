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

import {
  getLocalVideoProgress,
  saveLocalVideoProgress,
  resolveVideoProgress,
  resolveActiveLessonIndex,
  getLocalPlaylistActiveLesson,
  saveLocalPlaylistActiveLesson,
  type VideoProgress,
} from '@/lib/progressRepository';

describe('ProgressRepository — Local Storage & Conflict Resolution', () => {
  beforeEach(() => {
    storage.clear();
  });

  describe('Local Storage Persistence', () => {
    it('saves and parses valid local video progress with proper rounding', () => {
      const record = saveLocalVideoProgress({
        videoId: 'video_abc',
        playlistId: 'playlist_xyz',
        lastPosition: 145.678,
        watchTime: 89.9,
        completed: false,
      });

      assert.strictEqual(record.videoId, 'video_abc');
      assert.strictEqual(record.lastPosition, 145.7, 'Position should be rounded to 1 decimal place');
      assert.strictEqual(record.watchTime, 90, 'Watch time should be rounded to nearest integer');
      assert.strictEqual(record.completed, false);
      assert.ok(record.updatedAt, 'updatedAt ISO string must be generated');

      const loaded = getLocalVideoProgress('video_abc');
      assert.ok(loaded);
      assert.strictEqual(loaded.videoId, 'video_abc');
      assert.strictEqual(loaded.lastPosition, 145.7);
      assert.strictEqual(loaded.watchTime, 90);
    });

    it('returns null for missing video IDs', () => {
      assert.strictEqual(getLocalVideoProgress('non_existent'), null);
      assert.strictEqual(getLocalVideoProgress(''), null);
    });

    it('clamps negative position and watchTime to 0', () => {
      const record = saveLocalVideoProgress({
        videoId: 'vid_neg',
        lastPosition: -50,
        watchTime: -20,
      });
      assert.strictEqual(record.lastPosition, 0);
      assert.strictEqual(record.watchTime, 0);
    });

    it('gracefully handles corrupted JSON in LocalStorage without throwing', () => {
      storage.set('sc_prog_vid_corrupted', '{bad-json');
      const loaded = getLocalVideoProgress('corrupted');
      assert.strictEqual(loaded, null);
    });

    it('saves and retrieves active playlist lesson index', () => {
      saveLocalPlaylistActiveLesson('pl_clean123', 4, 'video_step4');
      const active = getLocalPlaylistActiveLesson('pl_clean123');

      assert.ok(active);
      assert.strictEqual(active.playlistId, 'pl_clean123');
      assert.strictEqual(active.videoIndex, 4);
      assert.strictEqual(active.videoId, 'video_step4');
    });
  });

  describe('Deterministic Conflict Resolution (Latest Valid Update Wins)', () => {
    it('preserves local position when user rewinds (local timestamp is newer)', () => {
      const local: VideoProgress = {
        videoId: 'vid1',
        lastPosition: 15, // user intentionally rewound to 15s
        watchTime: 120,
        updatedAt: '2026-09-06T12:00:10.000Z',
        completed: false,
      };
      const remote = {
        video_id: 'vid1',
        last_position: 110, // server has older higher position
        watch_time: 100,
        updated_at: '2026-09-06T12:00:05.000Z',
        watched: false,
      };

      const resolved = resolveVideoProgress(local, remote as any);
      assert.ok(resolved);
      assert.strictEqual(resolved.lastPosition, 15, 'Rewound position must not be overwritten by higher position');
      assert.strictEqual(resolved.watchTime, 120, 'watchTime preserves maximum accumulated');
    });

    it('accepts remote position when remote is strictly newer by > 1.5s', () => {
      const local: VideoProgress = {
        videoId: 'vid1',
        lastPosition: 10,
        watchTime: 40,
        updatedAt: '2026-09-06T12:00:00.000Z',
      };
      const remote = {
        videoId: 'vid1',
        lastPosition: 95,
        watchTime: 85,
        updatedAt: '2026-09-06T12:00:03.000Z', // 3.0s newer (exceeds 1.5s skew threshold)
      };

      const resolved = resolveVideoProgress(local, remote);
      assert.ok(resolved);
      assert.strictEqual(resolved.lastPosition, 95);
      assert.strictEqual(resolved.watchTime, 85);
    });

    it('accumulates watchTime across local and remote instances', () => {
      const local: VideoProgress = {
        videoId: 'vid1',
        lastPosition: 50,
        watchTime: 200, // local watched longer
        updatedAt: '2026-09-06T12:00:10.000Z',
      };
      const remote = {
        videoId: 'vid1',
        lastPosition: 75,
        watchTime: 150,
        updatedAt: '2026-09-06T12:00:15.000Z', // newer
      };

      const resolved = resolveVideoProgress(local, remote);
      assert.ok(resolved);
      assert.strictEqual(resolved.watchTime, 200, 'Must keep higher watchTime');
    });

    it('preserves completed status if either local or remote is marked completed', () => {
      const local: VideoProgress = {
        videoId: 'vid1',
        lastPosition: 0,
        watchTime: 300,
        completed: true,
        updatedAt: '2026-09-06T12:00:00.000Z',
      };
      const remote = {
        videoId: 'vid1',
        lastPosition: 100,
        watchTime: 100,
        completed: false,
        updatedAt: '2026-09-06T12:00:10.000Z',
      };

      const resolved = resolveVideoProgress(local, remote);
      assert.ok(resolved);
      assert.strictEqual(resolved.completed, true);
    });

    it('handles null and undefined values safely', () => {
      assert.strictEqual(resolveVideoProgress(null, null), null);
      assert.strictEqual(resolveVideoProgress(undefined, undefined), null);

      const local: VideoProgress = {
        videoId: 'vid1',
        lastPosition: 10,
        watchTime: 10,
        updatedAt: '2026-09-06T12:00:00.000Z',
      };
      assert.strictEqual(resolveVideoProgress(local, null)?.lastPosition, local.lastPosition);
      assert.strictEqual(resolveVideoProgress(null, local)?.lastPosition, local.lastPosition);
      assert.strictEqual(resolveVideoProgress(null, local)?.completed, false);
    });
  });

  describe('Active Lesson Index Resolution', () => {
    const sampleVideos = [
      { videoId: 'v1', watched: true },
      { videoId: 'v2', watched: true },
      { videoId: 'v3', watched: false },
      { videoId: 'v4', watched: false },
    ];

    it('prioritizes explicitIndex when within valid bounds', () => {
      saveLocalPlaylistActiveLesson('pl_test', 0);
      const idx = resolveActiveLessonIndex('pl_test', sampleVideos, 3);
      assert.strictEqual(idx, 3);
    });

    it('falls back to saved active lesson from local storage when explicitIndex omitted', () => {
      saveLocalPlaylistActiveLesson('pl_saved', 2);
      const idx = resolveActiveLessonIndex('pl_saved', sampleVideos);
      assert.strictEqual(idx, 2);
    });

    it('falls back to first incomplete lesson when no saved active index exists', () => {
      const idx = resolveActiveLessonIndex('pl_fresh', sampleVideos);
      assert.strictEqual(idx, 2, 'Index 2 is the first with watched=false');
    });

    it('defaults to 0 for empty video list', () => {
      assert.strictEqual(resolveActiveLessonIndex('pl_empty', []), 0);
    });
  });
});
