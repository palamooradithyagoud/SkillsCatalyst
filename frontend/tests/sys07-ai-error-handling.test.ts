import { describe, it } from 'node:test';
import assert from 'node:assert';

// Mock global window & localStorage
(globalThis as any).window = globalThis;
(globalThis as any).localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {},
};

import { sendMentorMessage, reviewResume, AIMentorError } from '@/lib/api/career';

describe('SYS-07 Frontend AI Error Handling', () => {
  const originalFetch = globalThis.fetch;

  // -------------------------------------------------------------------------
  // Scenario 1: Provider Quota Exhaustion (HTTP 503)
  // -------------------------------------------------------------------------
  it('correctly raises AIMentorError on 503 Quota Exhaustion instead of offline message', async () => {
    globalThis.fetch = async () =>
      new Response(
        JSON.stringify({
          detail: {
            code: 'AI_QUOTA_EXHAUSTED',
            message: 'AI service quota is currently exhausted. Please try again later.',
          },
        }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );

    try {
      await assert.rejects(
        async () => {
          await sendMentorMessage('Help me prepare for system design');
        },
        (err: any) => {
          assert(err instanceof AIMentorError);
          assert.strictEqual(err.status, 503);
          assert.strictEqual(err.code, 'AI_QUOTA_EXHAUSTED');
          assert(err.message.includes('quota is currently exhausted'));
          assert(!err.message.includes('FastAPI backend'));
          return true;
        }
      );
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  // -------------------------------------------------------------------------
  // Scenario 1b: User Plan Quota Exhaustion (HTTP 403)
  // -------------------------------------------------------------------------
  it('correctly raises AIMentorError on 403 Plan Limit Reached', async () => {
    globalThis.fetch = async () =>
      new Response(
        JSON.stringify({
          detail: {
            code: 'LIMIT_REACHED',
            message: 'Free plan limit reached. Upgrade to Pro for unlimited AI Mentor access.',
          },
        }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );

    try {
      await assert.rejects(
        async () => {
          await sendMentorMessage('Help me prepare for system design');
        },
        (err: any) => {
          assert.strictEqual(err.status, 403);
          assert.strictEqual(err.code, 'LIMIT_REACHED');
          assert(err.message.includes('Free plan limit reached'));
          assert(!err.message.includes('FastAPI backend'));
          return true;
        }
      );
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  // -------------------------------------------------------------------------
  // Scenario 2: Provider Rate Limit (HTTP 429)
  // -------------------------------------------------------------------------
  it('correctly raises AIMentorError on 429 Rate Limit with Retry-After', async () => {
    globalThis.fetch = async () =>
      new Response(
        JSON.stringify({
          detail: {
            code: 'AI_RATE_LIMIT_EXCEEDED',
            message: 'AI service rate limit reached. Please wait 15s before trying again.',
          },
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '15',
          },
        }
      );

    try {
      await assert.rejects(
        async () => {
          await sendMentorMessage('Help me prepare for system design');
        },
        (err: any) => {
          assert.strictEqual(err.status, 429);
          assert.strictEqual(err.code, 'AI_RATE_LIMIT_EXCEEDED');
          assert.strictEqual(err.retryAfter, 15);
          assert(err.message.includes('rate limit reached'));
          assert(!err.message.includes('FastAPI backend'));
          return true;
        }
      );
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  // -------------------------------------------------------------------------
  // Scenario 3: Provider Auth Error (HTTP 502)
  // -------------------------------------------------------------------------
  it('correctly raises AIMentorError on 502 Provider Auth Error without leaking keys', async () => {
    globalThis.fetch = async () =>
      new Response(
        JSON.stringify({
          detail: {
            code: 'AI_PROVIDER_AUTH_ERROR',
            message: 'AI service configuration error. Please contact support.',
          },
        }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      );

    try {
      await assert.rejects(
        async () => {
          await sendMentorMessage('Help me prepare for system design');
        },
        (err: any) => {
          assert.strictEqual(err.status, 502);
          assert.strictEqual(err.code, 'AI_PROVIDER_AUTH_ERROR');
          assert(err.message.includes('configuration error'));
          assert(!err.message.includes('FastAPI backend'));
          assert(!err.message.includes('gsk_'));
          return true;
        }
      );
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  // -------------------------------------------------------------------------
  // Scenario 4: Provider Unavailable (HTTP 502)
  // -------------------------------------------------------------------------
  it('correctly raises AIMentorError on 502 Provider Unavailable', async () => {
    globalThis.fetch = async () =>
      new Response(
        JSON.stringify({
          detail: {
            code: 'AI_PROVIDER_UNAVAILABLE',
            message: 'AI provider service is temporarily unavailable. Please try again shortly.',
          },
        }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      );

    try {
      await assert.rejects(
        async () => {
          await sendMentorMessage('Help me prepare for system design');
        },
        (err: any) => {
          assert.strictEqual(err.status, 502);
          assert.strictEqual(err.code, 'AI_PROVIDER_UNAVAILABLE');
          assert(err.message.includes('temporarily unavailable'));
          assert(!err.message.includes('FastAPI backend'));
          return true;
        }
      );
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  // -------------------------------------------------------------------------
  // Scenario 5: Timeout (HTTP 504)
  // -------------------------------------------------------------------------
  it('correctly raises AIMentorError on 504 Timeout', async () => {
    globalThis.fetch = async () =>
      new Response(
        JSON.stringify({
          detail: {
            code: 'AI_TIMEOUT',
            message: 'AI service request timed out. Please try again.',
          },
        }),
        { status: 504, headers: { 'Content-Type': 'application/json' } }
      );

    try {
      await assert.rejects(
        async () => {
          await sendMentorMessage('Help me prepare for system design');
        },
        (err: any) => {
          assert.strictEqual(err.status, 504);
          assert.strictEqual(err.code, 'AI_TIMEOUT');
          assert(err.message.includes('timed out'));
          assert(!err.message.includes('FastAPI backend'));
          return true;
        }
      );
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  // -------------------------------------------------------------------------
  // Scenario 6: Genuine Network Failure (Fetch throws TypeError)
  // -------------------------------------------------------------------------
  it('correctly classifies genuine network failure as NETWORK_ERROR with status 0', async () => {
    globalThis.fetch = async () => {
      throw new TypeError('Failed to fetch');
    };

    try {
      await assert.rejects(
        async () => {
          await sendMentorMessage('Help me prepare for system design');
        },
        (err: any) => {
          assert.strictEqual(err.status, 0);
          assert.strictEqual(err.code, 'NETWORK_ERROR');
          assert(err.message.includes('Unable to connect to SkillsCatalyst server'));
          return true;
        }
      );
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  // -------------------------------------------------------------------------
  // Scenario 8: Successful AI Request
  // -------------------------------------------------------------------------
  it('returns valid response object on HTTP 200', async () => {
    globalThis.fetch = async () =>
      new Response(
        JSON.stringify({
          reply: 'Here is your system design study plan...',
          conversation_id: 'conv-123',
          message_id: 'msg-456',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );

    try {
      const res = await sendMentorMessage('Help me prepare for system design');
      assert.strictEqual(res.reply, 'Here is your system design study plan...');
      assert.strictEqual(res.conversation_id, 'conv-123');
      assert.strictEqual(res.message_id, 'msg-456');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  // -------------------------------------------------------------------------
  // Resume Review Structured Error Handling
  // -------------------------------------------------------------------------
  it('reviewResume preserves status and code on HTTP 429', async () => {
    globalThis.fetch = async () =>
      new Response(
        JSON.stringify({
          detail: {
            code: 'AI_RATE_LIMIT_EXCEEDED',
            message: 'AI service rate limit reached. Please wait 10s before trying again.',
          },
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '10',
          },
        }
      );

    try {
      await assert.rejects(
        async () => {
          await reviewResume('Resume content...', 'Software Engineer', '2 years');
        },
        (err: any) => {
          assert.strictEqual(err.status, 429);
          assert.strictEqual(err.code, 'AI_RATE_LIMIT_EXCEEDED');
          assert.strictEqual(err.retryAfter, 10);
          return true;
        }
      );
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('reviewResume classifies network failure as NETWORK_ERROR with status 0', async () => {
    globalThis.fetch = async () => {
      throw new TypeError('Failed to fetch');
    };

    try {
      await assert.rejects(
        async () => {
          await reviewResume('Resume content...', 'Software Engineer', '2 years');
        },
        (err: any) => {
          assert.strictEqual(err.status, 0);
          assert.strictEqual(err.code, 'NETWORK_ERROR');
          assert(err.message.includes('Unable to connect to SkillsCatalyst server'));
          return true;
        }
      );
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
