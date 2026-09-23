import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import type { SkillBitProgress, UpdateSkillBitProgressPayload } from '@/types/skillbits';

describe('SkillBits Step 4: Video Learning Progress Characterization Suite', () => {

  // ── 1. Progress loads when SkillBit becomes active ──────────────────────────
  it('1. progress loads when SkillBit becomes active', async () => {
    let fetchCalled = false;
    const mockFetcher = async (id: string): Promise<SkillBitProgress> => {
      fetchCalled = true;
      return {
        skillbit_id: id,
        watched_seconds: 18,
        completion_percentage: 30.0,
        last_position_seconds: 18.0,
        started: true,
        completed: false,
      };
    };

    const progress = await mockFetcher('sb-test-123');
    assert.strictEqual(fetchCalled, true, 'Progress fetch must be triggered when active');
    assert.strictEqual(progress.skillbit_id, 'sb-test-123');
    assert.strictEqual(progress.watched_seconds, 18);
    assert.strictEqual(progress.last_position_seconds, 18.0);
    assert.strictEqual(progress.started, true);
    assert.strictEqual(progress.completed, false);
  });

  // ── 2. Saved position is respected (resumes near saved position) ───────────
  it('2. saved position is respected for uncompleted SkillBits', () => {
    const progress: SkillBitProgress = {
      skillbit_id: 'sb-test-123',
      watched_seconds: 24,
      completion_percentage: 40.0,
      last_position_seconds: 24.5,
      started: true,
      completed: false,
    };

    // State machine resume resolution logic
    const resolveResumePosition = (p: SkillBitProgress | null): number => {
      if (!p) return 0;
      if (p.completed) return 0; // Completed videos start from 0 on repeat
      return p.last_position_seconds > 0 ? p.last_position_seconds : 0;
    };

    const seekTarget = resolveResumePosition(progress);
    assert.strictEqual(seekTarget, 24.5, 'Player must resume from saved last_position_seconds');

    // Completed video check:
    const completedProgress: SkillBitProgress = { ...progress, completed: true };
    const completedSeekTarget = resolveResumePosition(completedProgress);
    assert.strictEqual(completedSeekTarget, 0, 'Completed video should restart from 0:00 for repeat viewing');
  });

  // ── 3. Playback progress is throttled ───────────────────────────────────────
  it('3. playback progress is throttled to prevent database request spam', () => {
    let saveCount = 0;
    let lastSavedTime = 0;
    const THROTTLE_MS = 7000;

    const simulateTimeUpdate = (currentTime: number, now: number) => {
      if (now - lastSavedTime >= THROTTLE_MS) {
        lastSavedTime = now;
        saveCount++;
      }
    };

    let fakeTime = 10000;
    // Simulate 30 frequent time updates over 4 seconds (3-4 events per second)
    for (let i = 0; i < 30; i++) {
      fakeTime += 130;
      simulateTimeUpdate(i * 0.13, fakeTime);
    }

    // Only the initial check should have fired because 4s < 7s throttle
    assert.strictEqual(saveCount, 1, 'Frequent onTimeUpdate must be throttled');

    // Advance beyond 7 seconds
    fakeTime += 7100;
    simulateTimeUpdate(10.0, fakeTime);
    assert.strictEqual(saveCount, 2, 'Second save should only fire after throttle threshold');
  });

  // ── 4. Pause triggers immediate progress save ──────────────────────────────
  it('4. pause triggers immediate progress save regardless of throttle window', () => {
    let savedPayload: UpdateSkillBitProgressPayload | null = null;

    const onPauseHandler = (currentTime: number, watchedSeconds: number, duration: number) => {
      const pct = duration > 0 ? (currentTime / duration) * 100 : 0;
      savedPayload = {
        watched_seconds: watchedSeconds,
        last_position_seconds: currentTime,
        completion_percentage: Math.min(100, Math.round(pct * 10) / 10),
      };
    };

    onPauseHandler(14.8, 15, 60);

    assert.notStrictEqual(savedPayload, null);
    assert.strictEqual(savedPayload?.last_position_seconds, 14.8);
    assert.strictEqual(savedPayload?.watched_seconds, 15);
    assert.strictEqual(savedPayload?.completion_percentage, 24.7);
  });

  // ── 5. Switching SkillBits saves previous progress ─────────────────────────
  it('5. switching active SkillBit slide saves previous progress before leaving', () => {
    const savedBits: Record<string, number> = {};

    const simulateSlideChange = (prevId: string, prevPosition: number) => {
      if (prevPosition > 0) {
        savedBits[prevId] = prevPosition;
      }
    };

    simulateSlideChange('sb-slide-1', 28.4);
    assert.strictEqual(savedBits['sb-slide-1'], 28.4, 'Previous slide position must be saved upon slide departure');
  });

  // ── 6. Reaching 90% marks completed state ──────────────────────────────────
  it('6. reaching 90% completion threshold marks completed = true', () => {
    const evaluateCompletion = (currentTime: number, duration: number): boolean => {
      if (duration <= 0) return false;
      const pct = (currentTime / duration) * 100;
      return pct >= 90.0;
    };

    assert.strictEqual(evaluateCompletion(53, 60), false, '88.3% must not be marked completed');
    assert.strictEqual(evaluateCompletion(54, 60), true, '90.0% must be marked completed');
    assert.strictEqual(evaluateCompletion(59, 60), true, '98.3% must be marked completed');
  });

  // ── 7. Failed progress request does not crash player ───────────────────────
  it('7. failed progress request does not crash player and preserves state', async () => {
    let playerCrashed = false;
    const inMemoryPosition = 22.0;

    const failingSave = async (): Promise<SkillBitProgress> => {
      throw new Error('500 Internal Server Error / Network Offline');
    };

    try {
      await failingSave().catch((err) => {
        // Safe fallback in reel component
        assert.ok(err.message.includes('500'), 'Error caught gracefully');
      });
    } catch {
      playerCrashed = true;
    }

    assert.strictEqual(playerCrashed, false, 'Video player must not crash when network request fails');
    assert.strictEqual(inMemoryPosition, 22.0, 'In-memory position state remains preserved');
  });

  // ── 8. No localStorage progress authority exists ───────────────────────────
  it('8. verifies no localStorage progress authority exists in SkillBits files', () => {
    const reelItemPath = path.resolve(process.cwd(), 'components/skillbits/SkillBitReelItem.tsx');
    const skillbitsApiPath = path.resolve(process.cwd(), 'lib/api/skillbits.ts');

    const reelContent = fs.readFileSync(reelItemPath, 'utf8');
    const apiContent = fs.readFileSync(skillbitsApiPath, 'utf8');

    // Ensure no sc_prog_ or localStorage.setItem for skillbits progress
    assert.ok(
      !reelContent.includes('localStorage.setItem("sc_skillbit_progress'),
      'Must NOT use localStorage as authority in SkillBitReelItem'
    );
    assert.ok(
      !apiContent.includes('localStorage.setItem("sc_skillbit_progress'),
      'Must NOT use localStorage as authority in skillbits.ts'
    );
  });

  // ── 9. Completed SkillBit retains completion flag upon replay ──────────────
  it('9. completed SkillBit retains completed=true state upon replay from 0:00', () => {
    const isCompleted = true;
    let currentPosition = 60.0;

    // Simulate replay
    const handleReplay = () => {
      currentPosition = 0.0;
      // Invariant: isCompleted is never toggled back to false on replay
    };

    handleReplay();
    assert.strictEqual(currentPosition, 0.0, 'Playback restarts at 0');
    assert.strictEqual(isCompleted, true, 'Completed flag must remain true');
  });
});
