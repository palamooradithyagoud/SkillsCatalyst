import { describe, it, beforeEach, afterEach } from 'node:test';
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

import { apiFetch } from '@/lib/api';

describe('apiFetch & Error Handling Characterization', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    storage.clear();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('preserves storage and extracts guest token on successful 200 OK response', async () => {
    storage.set('skillscatalyst_user_session', 'active_session');

    globalThis.fetch = async () => {
      const headers = new Headers();
      headers.set('X-Guest-Session-Token', 'guest_server_assigned_token.sig');
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers,
      });
    };

    const res = await apiFetch('https://api.example.com/test');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(storage.get('skillscatalyst_user_session'), 'active_session');
    assert.strictEqual(storage.get('skillscatalyst_guest_session_id'), 'guest_server_assigned_token.sig');
  });

  it('purges auth session and sc_* / sb-* tokens upon receiving 401 Unauthorized', async () => {
    storage.set('skillscatalyst_user_session', 'stale_auth_session');
    storage.set('sc_prog_vid_123', 'progress_state');
    storage.set('sb-auth-token', 'supabase_cookie');
    storage.set('other_unrelated_setting', 'preserve_me');

    globalThis.fetch = async () => {
      return new Response(JSON.stringify({ detail: 'Token expired' }), {
        status: 401,
      });
    };

    const res = await apiFetch('https://api.example.com/protected');
    assert.strictEqual(res.status, 401);
    assert.strictEqual(storage.has('skillscatalyst_user_session'), false, 'user_session must be purged');
    assert.strictEqual(storage.has('sc_prog_vid_123'), false, 'sc_* items must be purged');
    assert.strictEqual(storage.has('sb-auth-token'), false, 'sb-* items must be purged');
    assert.strictEqual(storage.get('other_unrelated_setting'), 'preserve_me', 'unrelated settings preserved');
  });

  it('purges auth session upon receiving 403 Forbidden', async () => {
    storage.set('skillscatalyst_user_session', 'forbidden_session');
    storage.set('sc_pl_active_abc', 'active_lesson');

    globalThis.fetch = async () => {
      return new Response(JSON.stringify({ detail: 'Access denied' }), {
        status: 403,
      });
    };

    const res = await apiFetch('https://api.example.com/admin');
    assert.strictEqual(res.status, 403);
    assert.strictEqual(storage.has('skillscatalyst_user_session'), false);
    assert.strictEqual(storage.has('sc_pl_active_abc'), false);
  });

  it('does NOT purge auth session on 500 Internal Server Error', async () => {
    storage.set('skillscatalyst_user_session', 'valid_session');

    globalThis.fetch = async () => {
      return new Response(JSON.stringify({ detail: 'Server crash' }), {
        status: 500,
      });
    };

    const res = await apiFetch('https://api.example.com/failing');
    assert.strictEqual(res.status, 500);
    assert.strictEqual(storage.get('skillscatalyst_user_session'), 'valid_session');
  });
});
