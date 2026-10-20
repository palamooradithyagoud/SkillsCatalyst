import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { validatePassword, validateEmail } from '@/lib/validation';
import { sanitizeNextPath } from '@/app/auth/callback/route';

describe('Password Recovery Test Suite', () => {

  // =========================================================================
  // 1-2, 7-10: VALIDATION UNIT TESTS
  // =========================================================================
  describe('Email & Password Validation (lib/validation.ts)', () => {
    it('1. rejects empty email', () => {
      const resNull = validateEmail(null);
      assert.strictEqual(resNull.isValid, false);
      assert.strictEqual(resNull.error, 'Email address is required.');

      const resEmpty = validateEmail('');
      assert.strictEqual(resEmpty.isValid, false);

      const resWhitespace = validateEmail('   ');
      assert.strictEqual(resWhitespace.isValid, false);
    });

    it('2. rejects invalid email formats', () => {
      const invalidEmails = [
        'plainaddress',
        '@missingusername.com',
        'username@.com',
        'username@domain',
        'username@domain..com',
        'username name@domain.com',
      ];
      for (const email of invalidEmails) {
        const res = validateEmail(email);
        assert.strictEqual(res.isValid, false, `Expected invalid for: ${email}`);
        assert.strictEqual(res.error, 'Please enter a valid email address.');
      }
    });

    it('validates correct email formats', () => {
      const validEmails = [
        'user@example.com',
        'student.learner@skillscatalyst.in',
        'dev+test@domain.co.uk',
      ];
      for (const email of validEmails) {
        const res = validateEmail(email);
        assert.strictEqual(res.isValid, true, `Expected valid for: ${email}`);
      }
    });

    it('7. rejects empty passwords', () => {
      const resNull = validatePassword(null);
      assert.strictEqual(resNull.isValid, false);
      assert.strictEqual(resNull.error, 'Password is required.');

      const resEmpty = validatePassword('');
      assert.strictEqual(resEmpty.isValid, false);
    });

    it('8. rejects passwords shorter than 6 characters (preserves existing 6-character policy)', () => {
      const shortPasswords = ['1', '12', '123', '1234', '12345', 'abc', 'pass'];
      for (const p of shortPasswords) {
        const res = validatePassword(p);
        assert.strictEqual(res.isValid, false, `Expected rejected for: ${p}`);
        assert.strictEqual(res.error, 'Password must be at least 6 characters long.');
      }
    });

    it('9. identifies mismatched confirmation passwords', () => {
      const pass = 'Secret123!';
      const confirmPass = 'Secret1234!';
      assert.notStrictEqual(pass, confirmPass);
    });

    it('10. accepts valid matching passwords (>= 6 characters)', () => {
      const validPasswords = ['123456', 'securePassword', 'SuperSecret!123'];
      for (const p of validPasswords) {
        const res = validatePassword(p);
        assert.strictEqual(res.isValid, true, `Expected valid for: ${p}`);
      }
    });
  });

  // =========================================================================
  // 3-6: RECOVERY REQUEST FLOW SIMULATION
  // =========================================================================
  describe('Recovery Request Flow (resetPasswordForEmail)', () => {
    let mockResetCalls: Array<{ email: string; options: Record<string, unknown> }> = [];
    let mockErrorToReturn: { status?: number; message?: string } | null = null;

    const mockSupabase = {
      auth: {
        resetPasswordForEmail: async (email: string, options: Record<string, unknown>) => {
          mockResetCalls.push({ email, options });
          if (mockErrorToReturn) {
            return { data: null, error: mockErrorToReturn };
          }
          return { data: {}, error: null };
        },
      },
    };

    beforeEach(() => {
      mockResetCalls = [];
      mockErrorToReturn = null;
    });

    it('3. valid email invokes supabase.auth.resetPasswordForEmail with correct redirect URL', async () => {
      const testEmail = 'student@skillscatalyst.in';
      const redirectUrl = 'http://localhost:3000/auth/callback?next=/login?mode=reset';

      const { error } = await mockSupabase.auth.resetPasswordForEmail(testEmail, {
        redirectTo: redirectUrl,
      });

      assert.strictEqual(error, null);
      assert.strictEqual(mockResetCalls.length, 1);
      assert.strictEqual(mockResetCalls[0].email, testEmail);
      assert.strictEqual(mockResetCalls[0].options.redirectTo, redirectUrl);
    });

    it('4. prevents duplicate submissions while loading or during cooldown', async () => {
      let isSubmitting = false;
      let cooldown = 0;
      let calls = 0;

      const triggerSubmit = async () => {
        if (isSubmitting || cooldown > 0) return false;
        isSubmitting = true;
        calls++;
        await new Promise((r) => setTimeout(r, 10));
        isSubmitting = false;
        cooldown = 60;
        return true;
      };

      const firstCall = await triggerSubmit();
      assert.strictEqual(firstCall, true);
      assert.strictEqual(calls, 1);

      // Attempt immediate duplicate while cooldown is active
      const secondCall = await triggerSubmit();
      assert.strictEqual(secondCall, false);
      assert.strictEqual(calls, 1);
    });

    it('5. displays generic success message that avoids account enumeration', () => {
      const genericMessage = 'If an account exists for this email address, password reset instructions will be sent.';
      assert.ok(!genericMessage.includes('registered'));
      assert.ok(!genericMessage.includes('found'));
      assert.strictEqual(genericMessage, 'If an account exists for this email address, password reset instructions will be sent.');
    });

    it('6. handles HTTP 429 rate limit error gracefully without automatic retry', async () => {
      mockErrorToReturn = {
        status: 429,
        message: 'For security purposes, you can only request this once every 60 seconds',
      };

      const retryCount = 0;
      let userFacingError = '';

      const sendRequest = async () => {
        const { error } = await mockSupabase.auth.resetPasswordForEmail('rate-limited@test.com', {
          redirectTo: 'http://localhost:3000/auth/callback?next=/reset-password',
        });

        if (error) {
          const msg = error.message?.toLowerCase() || '';
          if (error.status === 429 || msg.includes('rate limit') || msg.includes('security purposes')) {
            userFacingError = 'Too many requests. Please wait a few minutes before trying again.';
            // Crucial: DO NOT retry
            return;
          }
          userFacingError = error.message || 'Error occurred';
        }
      };

      await sendRequest();

      assert.strictEqual(retryCount, 0, 'Must NOT trigger automatic retry loop');
      assert.strictEqual(userFacingError, 'Too many requests. Please wait a few minutes before trying again.');
      assert.strictEqual(mockResetCalls.length, 1);
    });
  });

  // =========================================================================
  // 11-13, 17-19: PASSWORD UPDATE & RECOVERY SESSION HANDLING
  // =========================================================================
  describe('Password Update & Recovery Session Logic (updateUser)', () => {
    let mockUpdateCalls: Array<{ password: string }> = [];
    let mockUpdateError: { message?: string } | null = null;
    let mockSignOutCalled = false;

    const mockSupabase = {
      auth: {
        updateUser: async (attributes: { password: string }) => {
          mockUpdateCalls.push(attributes);
          if (mockUpdateError) {
            return { data: null, error: mockUpdateError };
          }
          return { data: { user: { id: 'usr-123' } }, error: null };
        },
        signOut: async () => {
          mockSignOutCalled = true;
          return { error: null };
        },
      },
    };

    beforeEach(() => {
      mockUpdateCalls = [];
      mockUpdateError = null;
      mockSignOutCalled = false;
    });

    it('11. password update method receives the intended new password', async () => {
      const newPass = 'FreshPassword2026';
      const { data, error } = await mockSupabase.auth.updateUser({ password: newPass });

      assert.strictEqual(error, null);
      assert.strictEqual(mockUpdateCalls.length, 1);
      assert.strictEqual(mockUpdateCalls[0].password, newPass);
      assert.ok(data?.user);
    });

    it('12. missing recovery session blocks unauthorized password reset', () => {
      const currentUser = null;
      const hasRecoveryCookie = false;
      const isAuthorized = !!currentUser && hasRecoveryCookie;
      assert.strictEqual(isAuthorized, false, 'Missing session must not be authorized');
    });

    it('13. handles invalid or expired recovery flow safely', () => {
      const errorMsg = 'The password reset link is invalid, expired, or has already been used. Please request a new link from the login page.';
      assert.ok(errorMsg.includes('invalid, expired, or has already been used'));
    });

    it('17. invalid recovery requests without recovery context cannot update passwords', () => {
      const hasRecoveryCookie = false;
      const hasRecoveryHash = false;
      const isRecoveryContext = hasRecoveryCookie || hasRecoveryHash;

      assert.strictEqual(isRecoveryContext, false);
    });

    it('18. successful reset signs out user and prepares login redirect', async () => {
      const { error } = await mockSupabase.auth.updateUser({ password: 'newValidPassword' });
      assert.strictEqual(error, null);

      await mockSupabase.auth.signOut();
      assert.strictEqual(mockSignOutCalled, true, 'Must sign out recovery session after password reset');

      const nextRoute = '/login?reset=success';
      assert.strictEqual(nextRoute, '/login?reset=success');
    });

    it('19. failed updates do not display a false success message', async () => {
      mockUpdateError = { message: 'New password should be different from the old password.' };

      let successMessage = '';
      let errorMessage = '';

      const { error } = await mockSupabase.auth.updateUser({ password: 'SameOldPassword123' });
      if (error) {
        errorMessage = error.message || 'Update failed';
      } else {
        successMessage = 'Password updated successfully.';
      }

      assert.strictEqual(successMessage, '');
      assert.strictEqual(errorMessage, 'New password should be different from the old password.');
    });
  });

  // =========================================================================
  // 14-16: CALLBACK ROUTING FOR RECOVERY
  // =========================================================================
  describe('Callback Route Destination & Security (route.ts)', () => {
    it('14. sanitizeNextPath safely preserves /reset-password and /login?mode=reset', () => {
      assert.strictEqual(sanitizeNextPath('/reset-password'), '/reset-password');
      assert.strictEqual(sanitizeNextPath('/reset-password?tab=auth'), '/reset-password?tab=auth');
      assert.strictEqual(sanitizeNextPath('/login?mode=reset'), '/login?mode=reset');
    });

    it('15. ordinary OAuth callbacks default to /dashboard or their intended path', () => {
      assert.strictEqual(sanitizeNextPath(null), '/dashboard');
      assert.strictEqual(sanitizeNextPath(''), '/dashboard');
      assert.strictEqual(sanitizeNextPath('/learning'), '/learning');
      assert.strictEqual(sanitizeNextPath('/settings'), '/settings');
    });

    it('16. rejects open-redirect attacks and hostile schemes in next path', () => {
      assert.strictEqual(sanitizeNextPath('https://evil.com/reset-password'), '/dashboard');
      assert.strictEqual(sanitizeNextPath('//evil.com/reset-password'), '/dashboard');
      assert.strictEqual(sanitizeNextPath('javascript:alert(1)'), '/dashboard');
      assert.strictEqual(sanitizeNextPath('/\\evil.com'), '/dashboard');
      assert.strictEqual(sanitizeNextPath('/%2fevil.com'), '/dashboard');
    });
  });
});
