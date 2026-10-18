import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import {
  sanitizeNextPath,
  isAllowedRedirectHost,
  classifyDeploymentEnvironment,
  validateAndNormalizeOrigin,
  resolveRedirectOrigin,
  GET,
} from '@/app/auth/callback/route';

describe('SYS-04: OAuth Callback Redirect Security Suite', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.APP_ENV;
    delete process.env.ENVIRONMENT;
    delete process.env.VERCEL_ENV;
    delete process.env.VERCEL_URL;
    delete process.env.NEXT_PUBLIC_APP_URL;
    delete process.env.APP_URL;
    delete process.env.ALLOWED_REDIRECT_HOSTS;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  describe('1. Next Path Sanitization (sanitizeNextPath)', () => {
    it('defaults to /dashboard when input is null, empty, or undefined', () => {
      assert.strictEqual(sanitizeNextPath(null), '/dashboard');
      assert.strictEqual(sanitizeNextPath(''), '/dashboard');
      assert.strictEqual(sanitizeNextPath(undefined as unknown as string), '/dashboard');
    });

    it('preserves legitimate relative paths with search and hash parameters', () => {
      assert.strictEqual(sanitizeNextPath('/settings'), '/settings');
      assert.strictEqual(sanitizeNextPath('/learning?tab=saved'), '/learning?tab=saved');
      assert.strictEqual(sanitizeNextPath('/profile#achievements'), '/profile#achievements');
      assert.strictEqual(sanitizeNextPath('/courses/python-101?view=full'), '/courses/python-101?view=full');
    });

    it('rejects protocol-relative URLs (//evil.com) and defaults to /dashboard', () => {
      assert.strictEqual(sanitizeNextPath('//evil.com'), '/dashboard');
      assert.strictEqual(sanitizeNextPath('//skillscatalyst.in'), '/dashboard');
      assert.strictEqual(sanitizeNextPath('///evil.com'), '/dashboard');
    });

    it('rejects absolute URLs with schemes (http://, https://, javascript:)', () => {
      assert.strictEqual(sanitizeNextPath('https://evil.com/dashboard'), '/dashboard');
      assert.strictEqual(sanitizeNextPath('http://evil.com'), '/dashboard');
      assert.strictEqual(sanitizeNextPath('javascript:alert(1)'), '/dashboard');
    });

    it('rejects backslashes and encoded traversal bypass attempts', () => {
      assert.strictEqual(sanitizeNextPath('/\\evil.com'), '/dashboard');
      assert.strictEqual(sanitizeNextPath('/..\\evil.com'), '/dashboard');
      assert.strictEqual(sanitizeNextPath('/%2fevil.com'), '/dashboard');
      assert.strictEqual(sanitizeNextPath('/%5cevil.com'), '/dashboard');
      assert.strictEqual(sanitizeNextPath('/path/../outside'), '/dashboard');
      assert.strictEqual(sanitizeNextPath('/path/./current'), '/dashboard');
    });
  });

  describe('2. Allowed Host Validation (isAllowedRedirectHost)', () => {
    it('accepts legitimate canonical production domains', () => {
      assert.strictEqual(isAllowedRedirectHost('skillscatalyst.in'), true);
      assert.strictEqual(isAllowedRedirectHost('www.skillscatalyst.in'), true);
      assert.strictEqual(isAllowedRedirectHost('skillscatalyst.in:443'), true);
      assert.strictEqual(isAllowedRedirectHost('www.skillscatalyst.in:443'), true);
    });

    it('accepts development hosts on standard ports', () => {
      assert.strictEqual(isAllowedRedirectHost('localhost'), true);
      assert.strictEqual(isAllowedRedirectHost('localhost:3000'), true);
      assert.strictEqual(isAllowedRedirectHost('127.0.0.1'), true);
      assert.strictEqual(isAllowedRedirectHost('127.0.0.1:3000'), true);
      assert.strictEqual(isAllowedRedirectHost('localhost:8080'), true);
    });

    it('accepts configured NEXT_PUBLIC_APP_URL host', () => {
      process.env.NEXT_PUBLIC_APP_URL = 'https://app.custom-domain.org:9000';
      assert.strictEqual(isAllowedRedirectHost('app.custom-domain.org:9000'), true);
      assert.strictEqual(isAllowedRedirectHost('app.custom-domain.org'), true);
    });

    it('accepts custom domain from ALLOWED_REDIRECT_HOSTS environment variable', () => {
      process.env.ALLOWED_REDIRECT_HOSTS = 'partner.skillscatalyst.in, staging.internal.net';
      assert.strictEqual(isAllowedRedirectHost('partner.skillscatalyst.in'), true);
      assert.strictEqual(isAllowedRedirectHost('staging.internal.net'), true);
      assert.strictEqual(isAllowedRedirectHost('unknown.internal.net'), false);
    });

    it('accepts exact configured Vercel deployment preview and production hosts', () => {
      process.env.VERCEL_URL = 'skillscatalyst-preview-abc.vercel.app';
      process.env.VERCEL_PROJECT_PRODUCTION_URL = 'skillscatalyst-production.vercel.app';
      process.env.VERCEL_ENV = 'preview';

      // Exact matches must pass
      assert.strictEqual(isAllowedRedirectHost('skillscatalyst-preview-abc.vercel.app'), true);
      assert.strictEqual(isAllowedRedirectHost('skillscatalyst-production.vercel.app'), true);

      // Arbitrary and unrelated .vercel.app domains must be strictly rejected
      assert.strictEqual(isAllowedRedirectHost('attacker.vercel.app'), false);
      assert.strictEqual(isAllowedRedirectHost('other-tenant.vercel.app'), false);
      assert.strictEqual(isAllowedRedirectHost('any-other.vercel.app'), false);

      // Hosts that merely start with skillscatalyst must NOT be trusted unless matched
      assert.strictEqual(isAllowedRedirectHost('skillscatalyst-fake.vercel.app'), false);
      assert.strictEqual(isAllowedRedirectHost('skillscatalyst.vercel.app'), false);
    });

    it('rejects unexpected external hosts', () => {
      assert.strictEqual(isAllowedRedirectHost('evil.com'), false);
      assert.strictEqual(isAllowedRedirectHost('attacker.net'), false);
      assert.strictEqual(isAllowedRedirectHost('google.com'), false);
    });

    it('rejects hosts that merely resemble approved hosts (typosquatting & subdomain smuggling)', () => {
      assert.strictEqual(isAllowedRedirectHost('skillscatalyst.in.evil.com'), false);
      assert.strictEqual(isAllowedRedirectHost('evil-skillscatalyst.in'), false);
      assert.strictEqual(isAllowedRedirectHost('skillscatalyst.in.attacker.org'), false);
      assert.strictEqual(isAllowedRedirectHost('www.skillscatalyst.in.org'), false);
      assert.strictEqual(isAllowedRedirectHost('skillscatalyst-preview-abc.vercel.app.evil.com'), false);
      assert.strictEqual(isAllowedRedirectHost('evil.skillscatalyst-preview-abc.vercel.app'), false);
    });

    it('rejects production domains with unexpected non-standard ports', () => {
      assert.strictEqual(isAllowedRedirectHost('skillscatalyst.in:8080'), false);
      assert.strictEqual(isAllowedRedirectHost('www.skillscatalyst.in:9999'), false);
      assert.strictEqual(isAllowedRedirectHost('skillscatalyst.in:22'), false);
    });

    it('rejects malformed hosts with control characters, slashes, or userInfo schemes', () => {
      assert.strictEqual(isAllowedRedirectHost('evil.com/path'), false);
      assert.strictEqual(isAllowedRedirectHost('user@skillscatalyst.in'), false);
      assert.strictEqual(isAllowedRedirectHost('skillscatalyst.in:abc'), false);
      assert.strictEqual(isAllowedRedirectHost('skillscatalyst.in:80:80'), false);
      assert.strictEqual(isAllowedRedirectHost(' evil.com '), false);
      assert.strictEqual(isAllowedRedirectHost(''), false);
      assert.strictEqual(isAllowedRedirectHost(null as unknown as string), false);
      assert.strictEqual(isAllowedRedirectHost(undefined as unknown as string), false);
    });

    it('extracts and validates only the first client host from multi-proxy header lists', () => {
      // First host is untrusted, second host is trusted -> must reject
      assert.strictEqual(isAllowedRedirectHost('evil.com, skillscatalyst.in'), false);
      // First host is trusted, second host is proxy -> must accept
      assert.strictEqual(isAllowedRedirectHost('skillscatalyst.in, cloudflare.net'), true);
    });
  });

  describe('3. Redirect Origin Resolution (resolveRedirectOrigin)', () => {
    it('uses valid x-forwarded-host with https protocol in production', () => {
      process.env.APP_ENV = 'production';
      process.env.VERCEL_ENV = 'production';
      const req = new Request('http://internal-container:3000/auth/callback?code=abc', {
        headers: {
          'x-forwarded-host': 'www.skillscatalyst.in',
          'x-forwarded-proto': 'https',
        },
      });
      const origin = resolveRedirectOrigin(req);
      assert.strictEqual(origin, 'https://www.skillscatalyst.in');
    });

    it('uses valid development host with http protocol on localhost', () => {
      process.env.APP_ENV = 'development';
      const req = new Request('http://localhost:3000/auth/callback?code=abc', {
        headers: {
          'x-forwarded-host': 'localhost:3000',
        },
      });
      const origin = resolveRedirectOrigin(req);
      assert.strictEqual(origin, 'http://localhost:3000');
    });

    it('rejects malicious x-forwarded-host and falls back to trusted application origin', () => {
      process.env.APP_ENV = 'development';
      process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
      const req = new Request('http://localhost:3000/auth/callback?code=abc', {
        headers: {
          'x-forwarded-host': 'evil-attacker.com',
          'x-forwarded-proto': 'https',
        },
      });
      const origin = resolveRedirectOrigin(req);
      // Malicious host must NOT be present in resolved origin
      assert.strictEqual(origin?.includes('evil-attacker.com'), false);
      assert.strictEqual(origin, 'http://localhost:3000');
    });

    it('handles missing x-forwarded-host safely using request url origin', () => {
      process.env.APP_ENV = 'production';
      process.env.VERCEL_ENV = 'production';
      const req = new Request('https://skillscatalyst.in/auth/callback?code=abc');
      const origin = resolveRedirectOrigin(req);
      assert.strictEqual(origin, 'https://skillscatalyst.in');
    });

    it('falls back to canonical default origin when positively identified as production', () => {
      process.env.APP_ENV = 'production';
      process.env.VERCEL_ENV = 'production';
      delete process.env.NEXT_PUBLIC_APP_URL;
      delete process.env.APP_URL;
      const req = new Request('http://untrusted-internal-box:9999/auth/callback?code=abc', {
        headers: {
          'x-forwarded-host': 'malicious-spoofed-host.com',
        },
      });
      const origin = resolveRedirectOrigin(req);
      assert.strictEqual(origin, 'https://www.skillscatalyst.in');
    });
  });

  describe('4. Staging Isolation & Pre-Resolution Safeguards', () => {
    // Scenario 1: APP_ENV=staging combined with VERCEL_ENV=production
    it('1. rejects contradictory environment flags (APP_ENV=staging + VERCEL_ENV=production) and returns null', () => {
      process.env.APP_ENV = 'staging';
      process.env.VERCEL_ENV = 'production';
      assert.strictEqual(classifyDeploymentEnvironment(), 'invalid');
      const req = new Request('http://internal:8080/auth/callback');
      assert.strictEqual(resolveRedirectOrigin(req), null);
    });

    // Scenario 2: Contradictory environment flags with an otherwise allowed forwarded host
    it('2. fails closed on contradictory environment flags even when X-Forwarded-Host matches production allowlist', () => {
      process.env.APP_ENV = 'staging';
      process.env.VERCEL_ENV = 'production';
      const req = new Request('http://internal:8080/auth/callback', {
        headers: {
          'x-forwarded-host': 'www.skillscatalyst.in',
          'x-forwarded-proto': 'https',
        },
      });
      assert.strictEqual(resolveRedirectOrigin(req), null);
    });

    // Scenario 3: Unknown explicit environment values
    it('3. rejects unknown explicit environment values and returns null', () => {
      process.env.APP_ENV = 'qa-custom-box';
      assert.strictEqual(classifyDeploymentEnvironment(), 'invalid');
      const req = new Request('http://internal:8080/auth/callback');
      assert.strictEqual(resolveRedirectOrigin(req), null);
    });

    it('3b. validateAndNormalizeOrigin directly rejects embedded credentials and subpaths', () => {
      assert.strictEqual(validateAndNormalizeOrigin('https://user:pass@skillscatalyst.in', 'production'), null);
      assert.strictEqual(validateAndNormalizeOrigin('https://skillscatalyst.in/subpath', 'production'), null);
      assert.strictEqual(validateAndNormalizeOrigin('https://skillscatalyst.in?token=123', 'production'), null);
      assert.strictEqual(validateAndNormalizeOrigin('https://skillscatalyst.in#frag', 'production'), null);
    });

    // Scenario 4: Missing environment indicators
    it('4. refuses to assume production when environment indicators are missing', () => {
      delete process.env.APP_ENV;
      delete process.env.ENVIRONMENT;
      delete process.env.VERCEL_ENV;
      delete process.env.NEXT_PUBLIC_APP_URL;
      delete process.env.APP_URL;
      assert.strictEqual(classifyDeploymentEnvironment(), 'invalid');
      const req = new Request('http://internal:8080/auth/callback');
      assert.strictEqual(resolveRedirectOrigin(req), null);
    });

    // Scenario 5: Valid explicitly configured staging origin
    it('5. resolves valid explicitly configured staging origin with HTTPS', () => {
      process.env.APP_ENV = 'staging';
      process.env.ALLOWED_REDIRECT_HOSTS = 'staging.skillscatalyst.in';
      process.env.NEXT_PUBLIC_APP_URL = 'https://staging.skillscatalyst.in';
      const req = new Request('http://internal:8080/auth/callback');
      const origin = resolveRedirectOrigin(req);
      assert.strictEqual(origin, 'https://staging.skillscatalyst.in');
    });

    // Scenario 6: HTTP staging origin rejection
    it('6. rejects plaintext HTTP staging origin configuration', () => {
      process.env.APP_ENV = 'staging';
      process.env.ALLOWED_REDIRECT_HOSTS = 'staging.skillscatalyst.in';
      process.env.NEXT_PUBLIC_APP_URL = 'http://staging.skillscatalyst.in'; // Insecure HTTP
      const req = new Request('http://internal:8080/auth/callback');
      assert.strictEqual(resolveRedirectOrigin(req), null);
    });

    // Scenario 7: HTTPS staging origin acceptance
    it('7. accepts valid HTTPS forwarded staging host matching allowlist', () => {
      process.env.APP_ENV = 'staging';
      process.env.ALLOWED_REDIRECT_HOSTS = 'staging.skillscatalyst.in';
      const req = new Request('http://internal:8080/auth/callback', {
        headers: {
          'x-forwarded-host': 'staging.skillscatalyst.in',
          'x-forwarded-proto': 'https',
        },
      });
      assert.strictEqual(resolveRedirectOrigin(req), 'https://staging.skillscatalyst.in');
    });

    // Scenario 8: Unexpected public origin port rejection
    it('8. rejects unexpected non-standard ports on public staging origins', () => {
      process.env.APP_ENV = 'staging';
      process.env.ALLOWED_REDIRECT_HOSTS = 'staging.skillscatalyst.in:8443';
      process.env.NEXT_PUBLIC_APP_URL = 'https://staging.skillscatalyst.in:8443';
      const req = new Request('http://internal:8080/auth/callback');
      assert.strictEqual(resolveRedirectOrigin(req), null);
    });

    // Scenario 9: Untrusted forwarded host rejection in staging
    it('9. rejects untrusted forwarded hosts in staging and resolves to configured staging app URL', () => {
      process.env.APP_ENV = 'staging';
      process.env.ALLOWED_REDIRECT_HOSTS = 'staging.skillscatalyst.in';
      process.env.NEXT_PUBLIC_APP_URL = 'https://staging.skillscatalyst.in';
      const req = new Request('http://internal:8080/auth/callback', {
        headers: {
          'x-forwarded-host': 'attacker.com',
          'x-forwarded-proto': 'https',
        },
      });
      const origin = resolveRedirectOrigin(req);
      assert.strictEqual(origin, 'https://staging.skillscatalyst.in');
      assert.strictEqual(origin?.includes('attacker.com'), false);
    });

    // Scenario 10: Untrusted forwarded protocol rejection
    it('10. rejects untrusted forwarded protocol (http) for public host headers', () => {
      process.env.APP_ENV = 'production';
      process.env.VERCEL_ENV = 'production';
      const req = new Request('http://internal:8080/auth/callback', {
        headers: {
          'x-forwarded-host': 'skillscatalyst.in',
          'x-forwarded-proto': 'http', // Plaintext forwarded proto on public domain
        },
      });
      // Candidate with http protocol must be rejected; falls through to production canonical
      const origin = resolveRedirectOrigin(req);
      assert.strictEqual(origin, 'https://www.skillscatalyst.in');
    });

    // Scenario 11: Arbitrary Vercel tenant rejection
    it('11. strictly rejects arbitrary Vercel tenants in preview mode', () => {
      process.env.VERCEL_ENV = 'preview';
      process.env.VERCEL_URL = 'skillscatalyst-preview-123.vercel.app';
      assert.strictEqual(isAllowedRedirectHost('attacker.vercel.app'), false);
      assert.strictEqual(isAllowedRedirectHost('other-tenant.vercel.app'), false);
      const req = new Request('http://internal:8080/auth/callback', {
        headers: {
          'x-forwarded-host': 'attacker.vercel.app',
          'x-forwarded-proto': 'https',
        },
      });
      // Resolves to configured VERCEL_URL preview, NEVER attacker
      assert.strictEqual(resolveRedirectOrigin(req), 'https://skillscatalyst-preview-123.vercel.app');
    });

    // Scenario 12: Production fallback under positively identified production configuration
    it('12. preserves canonical production fallback when environment is positively identified as production', () => {
      process.env.APP_ENV = 'production';
      process.env.VERCEL_ENV = 'production';
      delete process.env.NEXT_PUBLIC_APP_URL;
      delete process.env.APP_URL;
      const req = new Request('http://stripped-internal:8080/auth/callback');
      assert.strictEqual(resolveRedirectOrigin(req), 'https://www.skillscatalyst.in');
    });

    // Scenario 13: Controlled HTTP 500 without Location header when configuration is invalid
    it('13. returns controlled HTTP 500 response without Location header when origin cannot be verified', async () => {
      process.env.APP_ENV = 'staging';
      delete process.env.NEXT_PUBLIC_APP_URL;
      delete process.env.APP_URL;
      const req = new Request('http://internal-box:8080/auth/callback?code=synthetic_mock_code');
      const res = await GET(req);
      assert.strictEqual(res.status, 500);
      assert.strictEqual(res.headers.get('location'), null);
      const body = await res.json();
      assert.strictEqual(body.error, 'ConfigurationError');
    });

    // Scenario 14: Model B - Vercel preview hosting for staging
    it('14. accepts APP_ENV=staging with VERCEL_ENV=preview and resolves to staging', () => {
      process.env.APP_ENV = 'staging';
      process.env.VERCEL_ENV = 'preview';
      process.env.NEXT_PUBLIC_APP_URL = 'https://staging.skillscatalyst.in';
      process.env.ALLOWED_REDIRECT_HOSTS = 'staging.skillscatalyst.in';
      assert.strictEqual(classifyDeploymentEnvironment(), 'staging');
      const req = new Request('http://internal:8080/auth/callback');
      assert.strictEqual(resolveRedirectOrigin(req), 'https://staging.skillscatalyst.in');
    });

    // Scenario 15: Model B - Production host isolation under Vercel preview staging
    it('15. strictly rejects production canonical hosts when running APP_ENV=staging on VERCEL_ENV=preview', () => {
      process.env.APP_ENV = 'staging';
      process.env.VERCEL_ENV = 'preview';
      const req = new Request('http://internal:8080/auth/callback', {
        headers: {
          'x-forwarded-host': 'www.skillscatalyst.in',
          'x-forwarded-proto': 'https',
        },
      });
      // Must NOT resolve to production domain
      assert.strictEqual(resolveRedirectOrigin(req), null);
    });

    // Scenario 16: Rejection of development with preview
    it('16. rejects contradictory development and preview indicators (APP_ENV=development + VERCEL_ENV=preview)', () => {
      process.env.APP_ENV = 'development';
      process.env.VERCEL_ENV = 'preview';
      assert.strictEqual(classifyDeploymentEnvironment(), 'invalid');
      const req = new Request('http://internal:8080/auth/callback');
      assert.strictEqual(resolveRedirectOrigin(req), null);
    });
  });
});
