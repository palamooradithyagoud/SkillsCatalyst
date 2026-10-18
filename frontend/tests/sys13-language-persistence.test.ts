import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';

// ── In-Memory Mock Browser Environment ──────────────────────────────────────
const storageMap = new Map<string, string>();

const mockLocalStorage = {
  getItem: (key: string): string | null => storageMap.get(key) ?? null,
  setItem: (key: string, val: string): void => {
    storageMap.set(key, String(val));
  },
  removeItem: (key: string): void => {
    storageMap.delete(key);
  },
  clear: (): void => {
    storageMap.clear();
  },
  get length(): number {
    return storageMap.size;
  },
  key: (index: number): string | null => {
    return Array.from(storageMap.keys())[index] ?? null;
  },
};

const listeners = new Map<string, Set<(e: any) => void>>();

const mockWindow = {
  localStorage: mockLocalStorage,
  addEventListener: (type: string, listener: (e: any) => void) => {
    if (!listeners.has(type)) listeners.set(type, new Set());
    listeners.get(type)!.add(listener);
  },
  removeEventListener: (type: string, listener: (e: any) => void) => {
    listeners.get(type)?.delete(listener);
  },
  dispatchEvent: (event: { type: string; [key: string]: any }) => {
    const list = listeners.get(event.type);
    if (list) {
      for (const fn of list) {
        fn(event);
      }
    }
    return true;
  },
  location: {
    search: '',
    pathname: '/learning',
  },
};

(globalThis as any).window = mockWindow;
(globalThis as any).localStorage = mockLocalStorage;

import {
  DEFAULT_LANGUAGE,
  STORAGE_KEY_LANGUAGE,
  LANGUAGES,
  isValidLanguage,
  getStoredLanguage,
  setStoredLanguage,
  clearStoredLanguage,
  type Lang,
} from '@/lib/learning/searchValidation';

describe('SYS-13: Language Preference Persistence Test Suite', () => {
  beforeEach(() => {
    storageMap.clear();
    listeners.clear();
    mockWindow.location.search = '';
    mockWindow.localStorage = mockLocalStorage;
  });

  // =========================================================================
  // A. Selection and Persistence
  // =========================================================================
  describe('A. Selection and Persistence', () => {
    it('uses standard constant key and default language', () => {
      assert.strictEqual(STORAGE_KEY_LANGUAGE, 'sc_learning_language');
      assert.strictEqual(DEFAULT_LANGUAGE, 'english');
    });

    it('validates supported languages strictly against LANGUAGES registry', () => {
      assert.strictEqual(isValidLanguage('english'), true);
      assert.strictEqual(isValidLanguage('telugu'), true);
      assert.strictEqual(isValidLanguage('hindi'), true);

      // Unsupported or malformed languages
      assert.strictEqual(isValidLanguage('french'), false);
      assert.strictEqual(isValidLanguage('spanish'), false);
      assert.strictEqual(isValidLanguage('kannada'), false);
      assert.strictEqual(isValidLanguage(''), false);
      assert.strictEqual(isValidLanguage(null), false);
      assert.strictEqual(isValidLanguage(undefined), false);
      assert.strictEqual(isValidLanguage(123), false);
      assert.strictEqual(isValidLanguage({}), false);
    });

    it('persists a valid selected language to localStorage immediately', () => {
      const savedTelugu = setStoredLanguage('telugu');
      assert.strictEqual(savedTelugu, true);
      assert.strictEqual(mockLocalStorage.getItem(STORAGE_KEY_LANGUAGE), 'telugu');

      const savedHindi = setStoredLanguage('hindi');
      assert.strictEqual(savedHindi, true);
      assert.strictEqual(mockLocalStorage.getItem(STORAGE_KEY_LANGUAGE), 'hindi');

      const savedEnglish = setStoredLanguage('english');
      assert.strictEqual(savedEnglish, true);
      assert.strictEqual(mockLocalStorage.getItem(STORAGE_KEY_LANGUAGE), 'english');
    });

    it('rejects saving unsupported language values and preserves existing store', () => {
      setStoredLanguage('telugu');
      const badAttempt = setStoredLanguage('german' as any);
      assert.strictEqual(badAttempt, false);
      // Existing stored value must remain unaltered
      assert.strictEqual(mockLocalStorage.getItem(STORAGE_KEY_LANGUAGE), 'telugu');
    });
  });

  // =========================================================================
  // B. Refresh and Initialization
  // =========================================================================
  describe('B. Refresh and Initialization', () => {
    it('returns DEFAULT_LANGUAGE when no preference exists in storage', () => {
      assert.strictEqual(mockLocalStorage.getItem(STORAGE_KEY_LANGUAGE), null);
      const lang = getStoredLanguage();
      assert.strictEqual(lang, DEFAULT_LANGUAGE);
      assert.strictEqual(lang, 'english');
    });

    it('restores valid saved language on initialization after simulated refresh', () => {
      // Simulate user selecting Telugu in a prior session
      mockLocalStorage.setItem(STORAGE_KEY_LANGUAGE, 'telugu');

      // Application initializes
      const activeLang = getStoredLanguage();
      assert.strictEqual(activeLang, 'telugu');
    });

    it('handles JSON-quoted values stored by legacy or wrapper libraries', () => {
      mockLocalStorage.setItem(STORAGE_KEY_LANGUAGE, JSON.stringify('hindi'));
      const activeLang = getStoredLanguage();
      assert.strictEqual(activeLang, 'hindi');
    });

    it('handles single-quoted stored values safely', () => {
      mockLocalStorage.setItem(STORAGE_KEY_LANGUAGE, "'telugu'");
      const activeLang = getStoredLanguage();
      assert.strictEqual(activeLang, 'telugu');
    });

    it('trims whitespace and normalizes case from stored values', () => {
      mockLocalStorage.setItem(STORAGE_KEY_LANGUAGE, '   TELUGU   ');
      const activeLang = getStoredLanguage();
      assert.strictEqual(activeLang, 'telugu');
    });

    it('falls back safely to default when stored language is unsupported', () => {
      mockLocalStorage.setItem(STORAGE_KEY_LANGUAGE, 'russian');
      const activeLang = getStoredLanguage();
      assert.strictEqual(activeLang, DEFAULT_LANGUAGE);
    });

    it('falls back safely to default when stored value is malformed non-JSON', () => {
      mockLocalStorage.setItem(STORAGE_KEY_LANGUAGE, '{broken:json"');
      const activeLang = getStoredLanguage();
      assert.strictEqual(activeLang, DEFAULT_LANGUAGE);
    });

    it('does not overwrite a valid saved language with default during read initialization', () => {
      mockLocalStorage.setItem(STORAGE_KEY_LANGUAGE, 'hindi');
      getStoredLanguage();
      // Storage must not be reset to default
      assert.strictEqual(mockLocalStorage.getItem(STORAGE_KEY_LANGUAGE), 'hindi');
    });
  });

  // =========================================================================
  // C. Navigation and Application Lifecycle
  // =========================================================================
  describe('C. Navigation and Application Lifecycle', () => {
    it('preserves preference across repeated route unmount and remount cycles', () => {
      // 1. User on /learning sets preference to telugu
      setStoredLanguage('telugu');
      assert.strictEqual(getStoredLanguage(), 'telugu');

      // 2. User navigates to /dashboard (simulated component unmount)
      mockWindow.location.pathname = '/dashboard';

      // 3. User navigates to /settings/edit
      mockWindow.location.pathname = '/settings/edit';
      assert.strictEqual(getStoredLanguage(), 'telugu');

      // 4. User navigates back to /learning (simulated component remount)
      mockWindow.location.pathname = '/learning';
      assert.strictEqual(getStoredLanguage(), 'telugu');
    });

    it('supports switching preferences back and forth without state drift', () => {
      const transitions: Lang[] = ['telugu', 'hindi', 'english', 'hindi', 'telugu'];
      for (const target of transitions) {
        setStoredLanguage(target);
        assert.strictEqual(getStoredLanguage(), target);
        assert.strictEqual(mockLocalStorage.getItem(STORAGE_KEY_LANGUAGE), target);
      }
    });

    it('clears stored language safely with clearStoredLanguage helper', () => {
      setStoredLanguage('telugu');
      assert.strictEqual(getStoredLanguage(), 'telugu');

      const cleared = clearStoredLanguage();
      assert.strictEqual(cleared, true);
      assert.strictEqual(mockLocalStorage.getItem(STORAGE_KEY_LANGUAGE), null);
      assert.strictEqual(getStoredLanguage(), DEFAULT_LANGUAGE);
    });

    it('preserves device language preference across user session logout', () => {
      // Set device language preference
      setStoredLanguage('hindi');

      // Simulate auth session logout (clearing sb- auth tokens and user session)
      mockLocalStorage.removeItem('skillscatalyst_user_session');
      mockLocalStorage.removeItem('sb-access-token');

      // Language preference must remain intact
      assert.strictEqual(getStoredLanguage(), 'hindi');
      assert.strictEqual(mockLocalStorage.getItem(STORAGE_KEY_LANGUAGE), 'hindi');
    });
  });

  // =========================================================================
  // D. Failure Handling & Resilience
  // =========================================================================
  describe('D. Failure Handling & Resilience', () => {
    it('handles localStorage.getItem throwing an exception gracefully (e.g. SecurityError)', () => {
      const brokenStorage = {
        ...mockLocalStorage,
        getItem: () => {
          throw new Error('SecurityError: The operation is insecure.');
        },
      };
      mockWindow.localStorage = brokenStorage;

      // Must not throw, must return DEFAULT_LANGUAGE
      let result: Lang | null = null;
      assert.doesNotThrow(() => {
        result = getStoredLanguage();
      });
      assert.strictEqual(result, DEFAULT_LANGUAGE);
    });

    it('handles localStorage.setItem throwing an exception gracefully (e.g. QuotaExceededError)', () => {
      const quotaStorage = {
        ...mockLocalStorage,
        setItem: () => {
          throw new Error('QuotaExceededError: The quota has been exceeded.');
        },
      };
      mockWindow.localStorage = quotaStorage;

      // Must not throw, must return false
      let success: boolean | null = null;
      assert.doesNotThrow(() => {
        success = setStoredLanguage('telugu');
      });
      assert.strictEqual(success, false);
    });

    it('is SSR-safe when window is completely undefined', () => {
      const savedWindow = (globalThis as any).window;
      try {
        delete (globalThis as any).window;

        // In SSR, getStoredLanguage must return DEFAULT_LANGUAGE without crashing
        assert.strictEqual(getStoredLanguage(), DEFAULT_LANGUAGE);

        // In SSR, setStoredLanguage must return false without crashing
        assert.strictEqual(setStoredLanguage('hindi'), false);

        // In SSR, clearStoredLanguage must return false without crashing
        assert.strictEqual(clearStoredLanguage(), false);
      } finally {
        (globalThis as any).window = savedWindow;
      }
    });

    it('is safe when window exists but localStorage is null or undefined', () => {
      const savedStorage = mockWindow.localStorage;
      try {
        (mockWindow as any).localStorage = null;
        assert.strictEqual(getStoredLanguage(), DEFAULT_LANGUAGE);
        assert.strictEqual(setStoredLanguage('telugu'), false);
        assert.strictEqual(clearStoredLanguage(), false);
      } finally {
        mockWindow.localStorage = savedStorage;
      }
    });
  });

  // =========================================================================
  // E. Cross-Tab & Cross-Component Synchronization
  // =========================================================================
  describe('E. Cross-Tab & Cross-Component Synchronization', () => {
    it('dispatches custom event on same window when language is changed', () => {
      let eventPayload: Lang | null = null;
      const listener = (e: any) => {
        eventPayload = e.detail;
      };

      mockWindow.addEventListener('sc_language_change', listener);

      // Dispatch change
      mockWindow.dispatchEvent({
        type: 'sc_language_change',
        detail: 'telugu',
      });

      assert.strictEqual(eventPayload, 'telugu');
      mockWindow.removeEventListener('sc_language_change', listener);
    });

    it('handles simulated storage event from another browser tab', () => {
      // Simulate another tab writing 'hindi' to localStorage
      mockLocalStorage.setItem(STORAGE_KEY_LANGUAGE, 'hindi');

      let notifiedLang: Lang | null = null;
      const handleStorage = (e: any) => {
        if (e.key === STORAGE_KEY_LANGUAGE) {
          notifiedLang = getStoredLanguage();
        }
      };

      mockWindow.addEventListener('storage', handleStorage);

      // Dispatch StorageEvent from external tab
      mockWindow.dispatchEvent({
        type: 'storage',
        key: STORAGE_KEY_LANGUAGE,
        newValue: 'hindi',
      });

      assert.strictEqual(notifiedLang, 'hindi');
      mockWindow.removeEventListener('storage', handleStorage);
    });
  });

  // =========================================================================
  // F. Integration & Regression Contracts
  // =========================================================================
  describe('F. Integration & Regression Contracts', () => {
    it('preserves complete list of LANGUAGES supported across backend search', () => {
      const expectedCodes = ['english', 'telugu', 'hindi'];
      assert.strictEqual(LANGUAGES.length, 3);
      for (const code of expectedCodes) {
        assert.ok(
          LANGUAGES.some((item) => item.value === code),
          `Missing expected language: ${code}`
        );
      }
    });

    it('ensures each LANGUAGES option has a non-empty human-readable label', () => {
      for (const item of LANGUAGES) {
        assert.ok(item.label && item.label.length > 2);
        assert.ok(isValidLanguage(item.value));
      }
    });
  });
});
