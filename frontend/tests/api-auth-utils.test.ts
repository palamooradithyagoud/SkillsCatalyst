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
  getApiBaseUrl,
  getGuestSessionId,
  getRawGuestSessionId,
  storeGuestSessionToken,
  handleGuestTokenFromResponse,
  cleanPlaylistId,
} from '@/lib/api';

describe('API & Auth Utilities Characterization', () => {
  beforeEach(() => {
    storage.clear();
  });

  describe('API Base URL Normalization', () => {
    it('returns default or configured API URL without trailing slashes', () => {
      const url = getApiBaseUrl();
      assert.ok(url.startsWith('http://') || url.startsWith('https://'));
      assert.strictEqual(url.endsWith('/'), false, 'URL should not have trailing slashes');
    });
  });

  describe('Guest Session Management', () => {
    it('generates a new guest session ID if none exists and persists it in localStorage', () => {
      const sid = getGuestSessionId();
      assert.ok(sid.startsWith('guest_'), 'Generated guest ID must start with guest_');
      assert.strictEqual(storage.get('skillscatalyst_guest_session_id'), sid);
    });

    it('reuses existing guest session ID from localStorage', () => {
      storage.set('skillscatalyst_guest_session_id', 'guest_custom_existing_123');
      const sid = getGuestSessionId();
      assert.strictEqual(sid, 'guest_custom_existing_123');
    });

    it('extracts raw guest ID before HMAC signature dot', () => {
      storage.set('skillscatalyst_guest_session_id', 'guest_abc123.hmac_signature_xyz');
      const raw = getRawGuestSessionId();
      assert.strictEqual(raw, 'guest_abc123');
    });

    it('returns unaltered ID if no signature dot exists', () => {
      storage.set('skillscatalyst_guest_session_id', 'guest_unsigned');
      const raw = getRawGuestSessionId();
      assert.strictEqual(raw, 'guest_unsigned');
    });

    it('stores valid signed guest session tokens', () => {
      storeGuestSessionToken('guest_token_valid.signature');
      assert.strictEqual(storage.get('skillscatalyst_guest_session_id'), 'guest_token_valid.signature');
    });

    it('ignores invalid or placeholder tokens in storeGuestSessionToken', () => {
      storage.set('skillscatalyst_guest_session_id', 'guest_keep_this');
      storeGuestSessionToken(null);
      storeGuestSessionToken(undefined);
      storeGuestSessionToken('null');
      storeGuestSessionToken('undefined');
      storeGuestSessionToken('guest_session_default');
      assert.strictEqual(storage.get('skillscatalyst_guest_session_id'), 'guest_keep_this');
    });

    it('extracts X-Guest-Session-Token from response headers', () => {
      const headers = new Headers();
      headers.set('X-Guest-Session-Token', 'guest_extracted.sig');
      const response = new Response(null, { headers });

      handleGuestTokenFromResponse(response);
      assert.strictEqual(storage.get('skillscatalyst_guest_session_id'), 'guest_extracted.sig');
    });
  });

  describe('Playlist ID Sanitization', () => {
    it('extracts list= ID from full YouTube playlist URLs', () => {
      const url = 'https://www.youtube.com/playlist?list=PLr6-GrHUlh_h123456';
      assert.strictEqual(cleanPlaylistId(url), 'PLr6-GrHUlh_h123456');
    });

    it('extracts list= ID from watch URLs containing playlist query parameter', () => {
      const url = 'https://www.youtube.com/watch?v=vid123&list=PLwatch123&index=2';
      assert.strictEqual(cleanPlaylistId(url), 'PLwatch123');
    });

    it('falls back to v= video ID if list parameter is absent', () => {
      const url = 'https://www.youtube.com/watch?v=standalone_vid_99';
      assert.strictEqual(cleanPlaylistId(url), 'standalone_vid_99');
    });

    it('returns already clean playlist IDs trimmed', () => {
      assert.strictEqual(cleanPlaylistId('  PLplain_id_456  '), 'PLplain_id_456');
    });
  });
});
