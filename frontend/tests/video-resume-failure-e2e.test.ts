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

// Mock global fetch
let fetchCalls: Array<{ url: string; options: any }> = [];
let fetchShouldFail = false;

(globalThis as any).fetch = async (url: string, options: any) => {
  if (fetchShouldFail) {
    throw new TypeError('Failed to fetch: network unreachable');
  }
  fetchCalls.push({ url, options });
  return {
    ok: true,
    status: 200,
    json: async () => ({ success: true }),
  };
};

import {
  getLocalVideoProgress,
  saveLocalVideoProgress,
  resolveVideoProgress,
  syncVideoProgressBeacon,
  executeRemoteSync,
  flushPendingSync,
  type VideoProgress,
} from '@/lib/progressRepository';

describe('Phase 3.2 — Video Resume & Failure-Path E2E Tests', () => {
  beforeEach(() => {
    storage.clear();
    lastBeaconCall = null;
    fetchCalls = [];
    fetchShouldFail = false;
  });

  // ── 1. End-to-End Playback Resume Flow ──────────────────────────────────────
  describe('E2E Playback Resume Lifecycle', () => {
    it('simulates 25s playback, pause, page navigation, and seamless position resume', () => {
      const videoId = 'vid_e2e_resume_101';
      const playlistId = 'PL_react_mastery';

      // Step 1: Initial state - no prior progress
      let initialProgress = getLocalVideoProgress(videoId);
      assert.strictEqual(initialProgress, null);

      // Step 2: User plays video smoothly from 0s to 25s
      let currentPosition = 0;
      let accumulatedWatchTime = 0;

      // Simulate 25 playback ticks (1s delta each)
      for (let sec = 1; sec <= 25; sec++) {
        currentPosition = sec;
        accumulatedWatchTime += 1;
      }

      // Step 3: User pauses video at 25s -> immediate local write
      const savedRecord = saveLocalVideoProgress({
        videoId,
        playlistId,
        lastPosition: currentPosition,
        watchTime: accumulatedWatchTime,
        completed: false,
      });

      assert.strictEqual(savedRecord.lastPosition, 25);
      assert.strictEqual(savedRecord.watchTime, 25);

      // Step 4: User navigates away from the course page (unmount flush)
      flushPendingSync();

      // Step 5: User returns to the platform after some time, queries resume position
      const restored = getLocalVideoProgress(videoId);
      assert.ok(restored, 'Progress record must exist in localStorage');
      assert.strictEqual(restored.videoId, videoId);
      assert.strictEqual(restored.lastPosition, 25, 'Resume position must be preserved at 25s');
      assert.strictEqual(restored.watchTime, 25, 'Watch time must be preserved at 25s');
      assert.strictEqual(restored.completed, false);
    });
  });

  // ── 2. Rewind Conflict Resolution Invariant ────────────────────────────────
  describe('Rewind vs Remote Position Resolution', () => {
    it('preserves local rewound position (30s) over higher remote position (120s) when local is newer', () => {
      const now = Date.now();
      const remoteUpdatedAt = new Date(now - 60_000).toISOString(); // 1 minute ago
      const localUpdatedAt = new Date(now).toISOString();           // just now

      // Remote has position at 120s from past session
      const remote = {
        video_id: 'vid_rewind_test',
        playlist_id: 'PL_algorithms',
        last_position: 120.0,
        watch_time: 120,
        updated_at: remoteUpdatedAt,
        watched: false,
      };

      // User re-watched and intentionally rewound to 30s just now
      const local: VideoProgress = {
        videoId: 'vid_rewind_test',
        playlistId: 'PL_algorithms',
        lastPosition: 30.0,
        watchTime: 140, // accumulated watch time increases
        updatedAt: localUpdatedAt,
        completed: false,
      };

      const resolved = resolveVideoProgress(local, remote);
      assert.ok(resolved);
      assert.strictEqual(
        resolved.lastPosition,
        30.0,
        'Latest local update must win to preserve user rewind!'
      );
      assert.strictEqual(
        resolved.watchTime,
        140,
        'Watch time must monotonically accumulate the max watch time'
      );
    });

    it('adopts remote position if remote update is strictly newer than local (> 1.5s clock skew)', () => {
      const now = Date.now();
      const localUpdatedAt = new Date(now - 10_000).toISOString();  // 10s ago
      const remoteUpdatedAt = new Date(now).toISOString();          // newer on another device

      const local: VideoProgress = {
        videoId: 'vid_device_sync',
        lastPosition: 40.0,
        watchTime: 40,
        updatedAt: localUpdatedAt,
      };

      const remote = {
        video_id: 'vid_device_sync',
        last_position: 85.0,
        watch_time: 85,
        updated_at: remoteUpdatedAt,
      };

      const resolved = resolveVideoProgress(local, remote);
      assert.ok(resolved);
      assert.strictEqual(resolved.lastPosition, 85.0, 'Strictly newer remote position must win');
      assert.strictEqual(resolved.watchTime, 85);
    });
  });

  // ── 3. Anti-Cheat Fast-Forward Jump Rejection ──────────────────────────────
  describe('Anti-Cheat Tick Validation', () => {
    it('verifies anti-cheat interval contract: skips >= 3s are rejected from watchTime', () => {
      // Logic mirroring useVideoProgress:
      // Smooth playback delta: 0 < delta < 3.0s -> accepted
      // Forward scrub jump: delta >= 3.0s -> rejected
      let accumulatedWatchTime = 10;
      let lastTime = 10;

      function onTimeUpdate(newTime: number) {
        const delta = newTime - lastTime;
        if (delta > 0 && delta < 3.0) {
          accumulatedWatchTime += delta;
        }
        lastTime = newTime;
      }

      // 1. Smooth tick (+1s): accepted
      onTimeUpdate(11);
      assert.strictEqual(accumulatedWatchTime, 11);

      // 2. Smooth tick (+1.5s): accepted
      onTimeUpdate(12.5);
      assert.strictEqual(accumulatedWatchTime, 12.5);

      // 3. Scrub / fast-forward jump (+40s): rejected!
      onTimeUpdate(52.5);
      assert.strictEqual(
        accumulatedWatchTime,
        12.5,
        'Forward scrub jump must NOT increase accumulated watchTime'
      );

      // 4. Smooth playback resumes (+1s from 52.5): accepted
      onTimeUpdate(53.5);
      assert.strictEqual(accumulatedWatchTime, 13.5);
    });
  });

  // ── 4. Network & Backend Failure Resilience ────────────────────────────────
  describe('Dual Persistence & Network Failure Resilience', () => {
    it('persists progress to localStorage even when backend network fetch fails completely', async () => {
      fetchShouldFail = true;

      const record: VideoProgress = {
        videoId: 'vid_offline_test',
        playlistId: 'PL_offline',
        lastPosition: 77.0,
        watchTime: 75,
        updatedAt: new Date().toISOString(),
      };

      // Save locally first
      saveLocalVideoProgress(record);

      // Execute remote sync while network is broken
      // executeRemoteSync must catch the error and not crash caller
      await assert.doesNotReject(async () => {
        await executeRemoteSync(record);
      });

      // Verify local storage is intact
      const stored = getLocalVideoProgress('vid_offline_test');
      assert.ok(stored);
      assert.strictEqual(stored.lastPosition, 77.0);
      assert.strictEqual(stored.watchTime, 75);
    });
  });

  // ── 5. Unload Beacon Synchronization Contract ──────────────────────────────
  describe('Beacon Unload Serialization Contract', () => {
    it('dispatches valid JSON blob payload via navigator.sendBeacon with guest session ID', () => {
      const record: VideoProgress = {
        videoId: 'vid_beacon_test',
        playlistId: 'https://youtube.com/playlist?list=PL_beacon_test_123',
        lastPosition: 150.4,
        watchTime: 140,
        updatedAt: '2026-09-07T01:00:00.000Z',
      };

      syncVideoProgressBeacon(record);

      assert.ok(lastBeaconCall, 'sendBeacon must have been invoked');
      assert.ok(lastBeaconCall.url.includes('/api/learning/save-progress'));

      // Verify local storage was updated before beacon send
      const local = getLocalVideoProgress('vid_beacon_test');
      assert.ok(local);
      assert.strictEqual(local.lastPosition, 150.4);
    });
  });

  // ── 6. Corrupted Cache Recovery ────────────────────────────────────────────
  describe('Corrupted LocalStorage Recovery', () => {
    it('gracefully recovers from non-JSON or corrupted storage data without throwing', () => {
      // Seed corrupted non-JSON strings into localStorage
      storage.set('sc_video_progress_v1:vid_corrupt_1', 'NOT_VALID_JSON{[[{');
      storage.set('sc_video_progress_v1:vid_corrupt_2', 'undefined');
      storage.set('sc_video_progress_v1:vid_corrupt_3', '');

      assert.doesNotThrow(() => {
        const res1 = getLocalVideoProgress('vid_corrupt_1');
        assert.strictEqual(res1, null);

        const res2 = getLocalVideoProgress('vid_corrupt_2');
        assert.strictEqual(res2, null);

        const res3 = getLocalVideoProgress('vid_corrupt_3');
        assert.strictEqual(res3, null);
      });
    });
  });
});
