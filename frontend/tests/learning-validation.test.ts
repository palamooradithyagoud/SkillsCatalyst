import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  validateClientSkillQuery,
  isSkillQuery,
  isNonSkillQuery,
  getLevelStyle,
  extractPlaylistId,
  PROHIBITED_TERMS,
  OFFTOPIC_TERMS,
  SKILL_TERMS,
  LANGUAGES,
} from '@/lib/learning/searchValidation';

describe('Learning Search Validation & Helpers', () => {
  describe('validateClientSkillQuery', () => {
    it('rejects empty, whitespace-only, or single-character strings', () => {
      const empty = validateClientSkillQuery('');
      assert.strictEqual(empty.isValid, false);
      assert.ok(empty.error?.includes('at least 2 characters'));

      const whitespace = validateClientSkillQuery('   ');
      assert.strictEqual(whitespace.isValid, false);
      assert.ok(whitespace.error?.includes('at least 2 characters'));

      const singleChar = validateClientSkillQuery('a');
      assert.strictEqual(singleChar.isValid, false);
      assert.ok(singleChar.error?.includes('at least 2 characters'));
    });

    it('rejects numbers-only queries', () => {
      const numbers = validateClientSkillQuery('12345');
      assert.strictEqual(numbers.isValid, false);
      assert.ok(numbers.error?.includes("Numbers alone aren't a skill"));

      const numbersWithSpace = validateClientSkillQuery('  999 888  ');
      assert.strictEqual(numbersWithSpace.isValid, false);
      assert.ok(numbersWithSpace.error?.includes("Numbers alone aren't a skill"));
    });

    it('rejects prohibited terms with zero-tolerance policy', () => {
      const prohibitedSamples = ['xxx', 'adult movies', 'love songs', 'funny pranks', 'hot scene', 'dance remix'];
      for (const sample of prohibitedSamples) {
        const result = validateClientSkillQuery(sample);
        assert.strictEqual(result.isValid, false, `Expected "${sample}" to be invalid`);
        assert.ok(
          result.error?.includes('educational & programming topics'),
          `Expected educational error for "${sample}"`
        );
      }
    });

    it('rejects off-topic queries that do not contain skill keywords', () => {
      const offTopicSamples = ['cricket highlights', 'latest movie reviews', 'cake recipe', 'today weather news'];
      for (const sample of offTopicSamples) {
        const result = validateClientSkillQuery(sample);
        assert.strictEqual(result.isValid, false, `Expected "${sample}" to be invalid`);
        assert.ok(
          result.error?.includes("doesn't look like a tech or educational skill"),
          `Expected off-topic error for "${sample}"`
        );
      }
    });

    it('accepts legitimate technical and educational skills', () => {
      const validSkills = [
        'Python',
        'react hooks',
        'dsa in java',
        'machine learning',
        'Next.js 14 tutorial',
        'Docker & Kubernetes',
        'system design roadmap',
        'TypeScript',
      ];
      for (const skill of validSkills) {
        const result = validateClientSkillQuery(skill);
        assert.strictEqual(result.isValid, true, `Expected "${skill}" to be valid. Got: ${result.error}`);
        assert.strictEqual(result.error, null);
      }
    });

    it('isSkillQuery and isNonSkillQuery provide accurate boolean/string reflections', () => {
      assert.strictEqual(isSkillQuery('React Native'), true);
      assert.strictEqual(isNonSkillQuery('React Native'), null);

      assert.strictEqual(isSkillQuery('pop songs'), false);
      assert.ok(typeof isNonSkillQuery('pop songs') === 'string');
    });
  });

  describe('extractPlaylistId', () => {
    it('extracts list query parameter from standard playlist URLs', () => {
      assert.strictEqual(
        extractPlaylistId('https://www.youtube.com/playlist?list=PL4cUxeGkcC9gUxtnzUX737g0364656543'),
        'PL4cUxeGkcC9gUxtnzUX737g0364656543'
      );
      assert.strictEqual(
        extractPlaylistId('https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=PLr6-SnbS9Z70kE9Uo-'),
        'PLr6-SnbS9Z70kE9Uo-'
      );
    });

    it('extracts v query parameter as fallback from watch URLs', () => {
      assert.strictEqual(
        extractPlaylistId('https://www.youtube.com/watch?v=dQw4w9WgXcQ'),
        'dQw4w9WgXcQ'
      );
    });

    it('extracts ID from youtu.be shortlinks', () => {
      assert.strictEqual(
        extractPlaylistId('https://youtu.be/dQw4w9WgXcQ?si=abcdef'),
        'dQw4w9WgXcQ'
      );
    });

    it('extracts ID from embed URLs', () => {
      assert.strictEqual(
        extractPlaylistId('https://www.youtube.com/embed/dQw4w9WgXcQ'),
        'dQw4w9WgXcQ'
      );
    });

    it('returns null for empty or non-matching URLs', () => {
      assert.strictEqual(extractPlaylistId(''), null);
      assert.strictEqual(extractPlaylistId('https://example.com/hello'), null);
    });
  });

  describe('getLevelStyle', () => {
    it('returns emerald style for beginner level', () => {
      assert.ok(getLevelStyle('Beginner').includes('text-emerald-700'));
      assert.ok(getLevelStyle('beginner friendly').includes('bg-emerald-50'));
    });

    it('returns sky style for intermediate level', () => {
      assert.ok(getLevelStyle('Intermediate').includes('text-sky-700'));
      assert.ok(getLevelStyle('intermediate').includes('bg-sky-50'));
    });

    it('returns indigo style for advanced level', () => {
      assert.ok(getLevelStyle('Advanced').includes('text-indigo-700'));
      assert.ok(getLevelStyle('advanced topics').includes('bg-indigo-50'));
    });

    it('returns purple style for unknown or all-level fallback', () => {
      assert.ok(getLevelStyle('All Levels').includes('text-purple-700'));
      assert.ok(getLevelStyle('Expert').includes('text-purple-700'));
    });
  });

  describe('Constants Integrity', () => {
    it('exports LANGUAGES with required values', () => {
      assert.strictEqual(LANGUAGES.length, 3);
      assert.deepStrictEqual(
        LANGUAGES.map((l) => l.value),
        ['english', 'telugu', 'hindi']
      );
    });

    it('exports non-empty PROHIBITED_TERMS, OFFTOPIC_TERMS, and SKILL_TERMS', () => {
      assert.ok(PROHIBITED_TERMS.length > 20);
      assert.ok(OFFTOPIC_TERMS.length > 20);
      assert.ok(SKILL_TERMS.length > 20);
    });
  });
});
