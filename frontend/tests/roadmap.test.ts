import { describe, it } from 'node:test';
import assert from 'node:assert';
import { SKILL_ROADMAPS, CAREER_ROADMAPS } from '@/data/roadmaps';

describe('Roadmap Data Integrity', () => {
  it('loads 7 skill roadmaps with required fields', () => {
    assert.strictEqual(SKILL_ROADMAPS.length, 7);
    for (const r of SKILL_ROADMAPS) {
      assert.ok(r.id, 'id is required');
      assert.ok(r.title, 'title is required');
      assert.strictEqual(r.category, 'skill');
      assert.ok(r.sections.length > 0, 'sections should not be empty');
    }
  });

  it('loads 7 career roadmaps with required fields', () => {
    assert.strictEqual(CAREER_ROADMAPS.length, 7);
    for (const r of CAREER_ROADMAPS) {
      assert.ok(r.id, 'id is required');
      assert.ok(r.title, 'title is required');
      assert.strictEqual(r.category, 'career');
      assert.ok(r.sections.length > 0, 'sections should not be empty');
    }
  });
});
