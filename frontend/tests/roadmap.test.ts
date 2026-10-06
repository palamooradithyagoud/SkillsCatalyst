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

  it('strictly preserves the 13 Python roadmap stations and modules', () => {
    const pythonRoadmap = SKILL_ROADMAPS.find((r) => r.id === 'python-mastery');
    assert.ok(pythonRoadmap, 'python-mastery roadmap must exist');
    assert.strictEqual(pythonRoadmap.sections.length, 13);

    const expectedTitles = [
      '1. Introduction',
      '2. Strings',
      '3. Data Structures',
      '4. Variables & Data Types',
      '5. Conditional Statements',
      '6. Loops',
      '7. Arrays',
      '8. Functions',
      '9. Decorators',
      '10. Modules & Packages',
      '11. Object-Oriented Programming',
      '12. Exception Handling',
      '13. Multithreading',
    ];

    expectedTitles.forEach((expectedTitle, idx) => {
      assert.strictEqual(
        pythonRoadmap.sections[idx].title,
        expectedTitle,
        `Section ${idx + 1} title matches`
      );
    });
  });
});
