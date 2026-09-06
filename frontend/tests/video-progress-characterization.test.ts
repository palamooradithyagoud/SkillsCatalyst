import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';

// ── Mock Browser Environment ──────────────────────────────────────────────────
const storage = new Map<string, string>();
const localStorageMock = {
  getItem: (k: string) => storage.get(k) ?? null,
  setItem: (k: string, v: string) => storage.set(k, String(v)),
  removeItem: (k: string) => storage.delete(k),
  clear: () => storage.clear(),
  get length() { return storage.size; },
  key: (i: number) => Array.from(storage.keys())[i] ?? null,
};

let lastBeaconCall: { url: string; data: any } | null = null;

(globalThis as any).window = globalThis;
(globalThis as any).localStorage = localStorageMock;

if (typeof (globalThis as any).navigator !== 'undefined') {
  Object.defineProperty(globalThis.navigator, 'sendBeacon', {
    value: (url: string, data: any) => {
      lastBeaconCall = { url, data };
      return true;
    },
    configurable: true,
    writable: true,
  });
} else {
  (globalThis as any).navigator = {
    sendBeacon: (url: string, data: any) => {
      lastBeaconCall = { url, data };
      return true;
    },
  };
}

import {
  getLocalVideoProgress,
  saveLocalVideoProgress,
  resolveVideoProgress,
  resolveActiveLessonIndex,
  getLocalPlaylistActiveLesson,
  saveLocalPlaylistActiveLesson,
  syncVideoProgressBeacon,
  type VideoProgress,
} from '@/lib/progressRepository';

describe('Video Progress & Playback Characterization Suite', () => {
  beforeEach(() => {
    storage.clear();
    lastBeaconCall = null;
  });

  describe('Resume & Conflict Resolution Invariants', () => {
    it('returns null when neither local nor remote progress exists', () => {
      assert.strictEqual(resolveVideoProgress(null, null), null);
      assert.strictEqual(resolveVideoProgress(undefined, undefined), null);
    });

    it('returns local record when remote does not exist', () => {
      const local: VideoProgress = {
        videoId: 'vid1',
        lastPosition: 42,
        watchTime: 40,
        updatedAt: '2026-09-06T12:00:00.000Z',
      };
      const res = resolveVideoProgress(local, null);
      assert.ok(res);
      assert.strictEqual(res.videoId, 'vid1');
      assert.strictEqual(res.lastPosition, 42);
      assert.strictEqual(res.watchTime, 40);
    });

    it('normalizes snake_case remote progress when local does not exist', () => {
      const remote = {
        video_id: 'vid_snake',
        playlist_id: 'pl_snake',
        last_position: 120.5,
        watch_time: 110,
        updated_at: '2026-09-06T12:00:00.000Z',
        watched: true,
      };
      const res = resolveVideoProgress(null, remote as any);
      assert.ok(res);
      assert.strictEqual(res.videoId, 'vid_snake');
      assert.strictEqual(res.playlistId, 'pl_snake');
      assert.strictEqual(res.lastPosition, 120.5);
      assert.strictEqual(res.watchTime, 110);
      assert.strictEqual(res.completed, true);
    });

    it('prefers remote position when remote timestamp is strictly newer by > 1.5s', () => {
      const local: VideoProgress = {
        videoId: 'v1',
        lastPosition: 10,
        watchTime: 10,
        updatedAt: '2026-09-06T10:00:00.000Z',
      };
      const remote: VideoProgress = {
        videoId: 'v1',
        lastPosition: 85,
        watchTime: 80,
        updatedAt: '2026-09-06T10:00:01.600Z', // 1.6s newer (> 1.5s skew tolerance)
      };
      const res = resolveVideoProgress(local, remote);
      assert.strictEqual(res?.lastPosition, 85);
      assert.strictEqual(res?.watchTime, 80);
    });

    it('preserves local rewound position when remote is older or within clock skew (<= 1.5s)', () => {
      const local: VideoProgress = {
        videoId: 'v1',
        lastPosition: 5, // user rewound to beginning
        watchTime: 90,
        updatedAt: '2026-09-06T10:00:01.000Z',
      };
      const remote: VideoProgress = {
        videoId: 'v1',
        lastPosition: 80,
        watchTime: 70,
        updatedAt: '2026-09-06T10:00:00.000Z', // remote is older
      };
      const res = resolveVideoProgress(local, remote);
      assert.strictEqual(res?.lastPosition, 5, 'Rewound position must be retained');
      assert.strictEqual(res?.watchTime, 90, 'Highest watchTime retained');
    });

    it('handles zero position cleanly without treating it as falsy/missing', () => {
      const local: VideoProgress = {
        videoId: 'v_zero',
        lastPosition: 0,
        watchTime: 0,
        updatedAt: '2026-09-06T10:00:00.000Z',
      };
      const res = resolveVideoProgress(local, null);
      assert.strictEqual(res?.lastPosition, 0);
      assert.strictEqual(res?.watchTime, 0);
    });

    it('clamps negative positions and watchTime in remote and local objects', () => {
      const remote = {
        videoId: 'v_neg',
        lastPosition: -99,
        watchTime: -50,
        updatedAt: '2026-09-06T10:00:00.000Z',
      };
      const res = resolveVideoProgress(null, remote);
      assert.strictEqual(res?.lastPosition, 0);
      assert.strictEqual(res?.watchTime, 0);
    });
  });

  describe('Anti-Cheat & Watch-Time Calculation Invariants', () => {
    // Pure function representation of useVideoProgress tick logic
    function calculateTickDelta(currentTime: number, lastTime: number): number {
      if (lastTime < 0) return 0;
      const delta = currentTime - lastTime;
      // Exact anti-cheat rule: smooth forward playback only (0 < delta < 3s)
      if (delta > 0 && delta < 3) {
        return delta;
      }
      return 0;
    }

    it('accumulates valid forward playback intervals (0 < delta < 3)', () => {
      let watchTime = 0;
      let lastTime = 0;

      // Tick 1: advanced by 0.5s
      const cur1 = 0.5;
      watchTime += calculateTickDelta(cur1, lastTime);
      assert.strictEqual(watchTime, 0.5);
      lastTime = cur1;

      // Tick 2: advanced by 0.5s
      const cur2 = 1.0;
      watchTime += calculateTickDelta(cur2, lastTime);
      assert.strictEqual(watchTime, 1.0);
    });

    it('rejects forward seek jumps >= 3s (anti-cheat)', () => {
      const lastTime = 10;
      const curSkip = 60; // User skipped ahead by 50s
      const delta = calculateTickDelta(curSkip, lastTime);
      assert.strictEqual(delta, 0, 'Seek skips must not contribute to watch time');
    });

    it('rejects rewind jumps (delta <= 0)', () => {
      const lastTime = 45;
      const curRewind = 15; // User rewound
      const delta = calculateTickDelta(curRewind, lastTime);
      assert.strictEqual(delta, 0, 'Rewinds must not contribute to watch time');
    });

    it('rejects identical timestamps on paused player (delta == 0)', () => {
      const lastTime = 25;
      const delta = calculateTickDelta(25, lastTime);
      assert.strictEqual(delta, 0, 'Identical ticks must not contribute to watch time');
    });

    it('accurately evaluates 75% completion threshold', () => {
      const duration = 200;
      const thresholdPct = 75;

      const under = Math.min(100, (149 / duration) * 100);
      assert.strictEqual(under < thresholdPct, true, '149s / 200s is 74.5% (< 75%)');

      const reached = Math.min(100, (150 / duration) * 100);
      assert.strictEqual(reached >= thresholdPct, true, '150s / 200s is 75% (>= 75%)');
      assert.strictEqual(reached, 75);

      const over = Math.min(100, (250 / duration) * 100);
      assert.strictEqual(over, 100, 'Percentages above 100 are clamped to 100%');
    });
  });

  describe('LocalStorage Persistence Keys & Schemas', () => {
    it('uses exact key format sc_prog_vid_<videoId>', () => {
      saveLocalVideoProgress({
        videoId: 'abc123xyz',
        lastPosition: 30,
        watchTime: 25,
      });

      assert.ok(storage.has('sc_prog_vid_abc123xyz'));
      const raw = JSON.parse(storage.get('sc_prog_vid_abc123xyz')!);
      assert.strictEqual(raw.videoId, 'abc123xyz');
      assert.strictEqual(raw.lastPosition, 30);
      assert.strictEqual(raw.watchTime, 25);
    });

    it('uses exact key format sc_pl_active_<playlistId>', () => {
      saveLocalPlaylistActiveLesson('PL_my_playlist', 3, 'vid_lesson_4');

      assert.ok(storage.has('sc_pl_active_PL_my_playlist'));
      const active = getLocalPlaylistActiveLesson('PL_my_playlist');
      assert.strictEqual(active?.playlistId, 'PL_my_playlist');
      assert.strictEqual(active?.videoIndex, 3);
      assert.strictEqual(active?.videoId, 'vid_lesson_4');
    });

    it('handles corrupted and empty string JSON without throwing', () => {
      storage.set('sc_prog_vid_empty', '');
      storage.set('sc_prog_vid_malformed', '{"incomplete');
      storage.set('sc_prog_vid_wrong_type', '12345');

      assert.strictEqual(getLocalVideoProgress('empty'), null);
      assert.strictEqual(getLocalVideoProgress('malformed'), null);
      assert.strictEqual(getLocalVideoProgress('wrong_type'), null);
    });
  });

  describe('Active Lesson Resolution Priority', () => {
    const videos = [
      { videoId: 'v0', watched: true },
      { videoId: 'v1', watched: true },
      { videoId: 'v2', watched: false },
      { videoId: 'v3', watched: false },
    ];

    it('priority 1: explicitIndex within bounds wins', () => {
      saveLocalPlaylistActiveLesson('pl1', 0);
      const res = resolveActiveLessonIndex('pl1', videos, 3);
      assert.strictEqual(res, 3);
    });

    it('priority 2: saved active lesson from localStorage wins when explicitIndex omitted', () => {
      saveLocalPlaylistActiveLesson('pl2', 1);
      const res = resolveActiveLessonIndex('pl2', videos);
      assert.strictEqual(res, 1);
    });

    it('priority 3: first unwatched lesson wins when no saved index exists', () => {
      const res = resolveActiveLessonIndex('pl_fresh', videos);
      assert.strictEqual(res, 2);
    });

    it('falls back to first unwatched when saved index is out of bounds', () => {
      saveLocalPlaylistActiveLesson('pl_oob', 99); // index 99 is invalid for 4 videos
      const res = resolveActiveLessonIndex('pl_oob', videos);
      assert.strictEqual(res, 2, 'Should fall back to first unwatched');
    });

    it('falls back to 0 if all lessons completed and no saved index', () => {
      const allWatched = [
        { videoId: 'a', watched: true },
        { videoId: 'b', watched: true },
      ];
      const res = resolveActiveLessonIndex('pl_done', allWatched);
      assert.strictEqual(res, 0);
    });
  });

  describe('Beacon Payload & Unload Serialization', () => {
    it('dispatches properly formatted Beacon payload to /api/learning/save-progress', () => {
      const record: VideoProgress = {
        videoId: 'vid_beacon',
        playlistId: 'pl_beacon',
        lastPosition: 125.4,
        watchTime: 120,
        updatedAt: '2026-09-06T15:30:00.000Z',
        completed: true,
      };

      syncVideoProgressBeacon(record);

      assert.ok(lastBeaconCall, 'sendBeacon should have been called');
      assert.ok(lastBeaconCall.url.includes('/api/learning/save-progress'));

      // Also verifies LocalStorage was updated synchronously
      const local = getLocalVideoProgress('vid_beacon');
      assert.ok(local);
      assert.strictEqual(local.lastPosition, 125.4);
      assert.strictEqual(local.watchTime, 120);
      assert.strictEqual(local.completed, true);
    });
  });
});
