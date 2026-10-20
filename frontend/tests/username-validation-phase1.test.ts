import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  validateUsername,
  normalizeUsername,
  validateFullName,
  RESERVED_USERNAMES,
} from '../lib/validation';

describe('Phase 1 Frontend Validation: Username & Full Name', () => {
  describe('validateUsername', () => {
    it('accepts valid usernames', () => {
      const validCases = [
        'adithya',
        'adithya_goud',
        'alex123',
        'user_name_99',
        'dev',
        'a'.repeat(30),
      ];

      for (const username of validCases) {
        const result = validateUsername(username);
        assert.strictEqual(result.isValid, true, `Should accept valid username: "${username}"`);
        assert.strictEqual(result.error, undefined);
      }
    });

    it('rejects empty or whitespace-only usernames', () => {
      const emptyCases = ['', '   ', '\t', '\n'];
      for (const empty of emptyCases) {
        const result = validateUsername(empty);
        assert.strictEqual(result.isValid, false);
        assert.strictEqual(result.error, 'Username is required.');
      }
    });

    it('rejects usernames shorter than 3 characters', () => {
      const shortCases = ['a', 'ab', '  ab  '];
      for (const short of shortCases) {
        const result = validateUsername(short);
        assert.strictEqual(result.isValid, false);
        assert.ok(result.error?.includes('at least 3 characters'));
      }
    });

    it('rejects usernames longer than 30 characters', () => {
      const longUsername = 'a'.repeat(31);
      const result = validateUsername(longUsername);
      assert.strictEqual(result.isValid, false);
      assert.ok(result.error?.includes('cannot exceed 30 characters'));
    });

    it('rejects usernames containing spaces, hyphens, or symbols', () => {
      const invalidCases = [
        'user name',
        'user-name',
        'user@name',
        'user.name',
        'user#name',
        'user!name',
        'user$name',
        'adithya🔥',
      ];
      for (const invalid of invalidCases) {
        const result = validateUsername(invalid);
        assert.strictEqual(result.isValid, false, `Should reject invalid characters in "${invalid}"`);
        assert.ok(result.error?.includes('letters, numbers, and underscores'));
      }
    });

    it('rejects reserved system usernames case-insensitively', () => {
      const reservedCases = ['admin', 'ADMIN', 'Root', 'api', 'Settings', 'Profile', 'Auth'];
      for (const reserved of reservedCases) {
        const result = validateUsername(reserved);
        assert.strictEqual(result.isValid, false, `Should reject reserved username: "${reserved}"`);
        assert.ok(result.error?.includes('reserved'));
      }
    });

    it('normalizes username by trimming and converting to lowercase', () => {
      assert.strictEqual(normalizeUsername('  Adithya_Goud  '), 'adithya_goud');
      assert.strictEqual(normalizeUsername('Alex_99'), 'alex_99');
      assert.strictEqual(normalizeUsername(''), '');
    });
  });

  describe('validateFullName', () => {
    it('accepts valid full names', () => {
      const validNames = [
        'Palamoor Adithya Goud',
        'Alex Mercer',
        'Jane Doe',
        'Jean-Luc Picard',
        'Mary O\'Connor',
        'Renée Dupont',
      ];
      for (const name of validNames) {
        const result = validateFullName(name);
        assert.strictEqual(result.isValid, true, `Should accept valid name: "${name}"`);
      }
    });

    it('rejects empty or whitespace-only full names', () => {
      const emptyNames = ['', '   ', '\t\n'];
      for (const empty of emptyNames) {
        const result = validateFullName(empty);
        assert.strictEqual(result.isValid, false);
        assert.strictEqual(result.error, 'Full name is required.');
      }
    });

    it('rejects names shorter than 2 characters after trimming', () => {
      const result = validateFullName('A');
      assert.strictEqual(result.isValid, false);
      assert.ok(result.error?.includes('at least 2 characters'));
    });

    it('rejects names exceeding 100 characters', () => {
      const longName = 'A'.repeat(101);
      const result = validateFullName(longName);
      assert.strictEqual(result.isValid, false);
      assert.ok(result.error?.includes('cannot exceed 100 characters'));
    });
  });

  describe('RESERVED_USERNAMES set', () => {
    it('includes critical core system paths', () => {
      const requiredReserved = ['admin', 'api', 'auth', 'dashboard', 'settings', 'profile', 'login', 'signup'];
      for (const r of requiredReserved) {
        assert.ok(RESERVED_USERNAMES.has(r), `Missing reserved username: ${r}`);
      }
    });
  });
});
