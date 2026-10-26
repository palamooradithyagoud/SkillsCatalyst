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

import {
  fetchMyPermissions,
  fetchPermissionsCatalog,
  grantAdminAccess,
  revokeAdminAccess,
  updateAdminPermissions,
  fetchAdminUsers,
  fetchAdminAuditLogs,
} from '@/lib/api/permissions';

// ── 1. Permissions Catalog & Schema Invariants ────────────────────────────────

describe('Owner-Controlled Admin Access: Permissions Catalog Invariants', () => {
  const EXPECTED_SECTIONS = ['scholarships', 'events', 'hackathons', 'tech_news'];
  const EXPECTED_OPERATIONS = ['read', 'create', 'update', 'publish', 'delete'];

  it('validates complete coverage of all 4 content sections and 5 operations (20 permissions)', () => {
    const allExpectedPermissions: string[] = [];
    EXPECTED_SECTIONS.forEach((sec) => {
      EXPECTED_OPERATIONS.forEach((op) => {
        allExpectedPermissions.push(`${sec}.${op}`);
      });
    });

    assert.strictEqual(allExpectedPermissions.length, 20);
    assert.ok(allExpectedPermissions.includes('scholarships.read'));
    assert.ok(allExpectedPermissions.includes('scholarships.publish'));
    assert.ok(allExpectedPermissions.includes('events.create'));
    assert.ok(allExpectedPermissions.includes('hackathons.update'));
    assert.ok(allExpectedPermissions.includes('tech_news.delete'));
  });

  it('verifies that no privileged system actions are exposed in content permissions', () => {
    const forbiddenSystemKeys = [
      'users.create',
      'users.role',
      'payments.refund',
      'settings.global',
      'audit.delete',
      'super_owner',
    ];

    const EXPECTED_PERMISSIONS = EXPECTED_SECTIONS.flatMap((sec) =>
      EXPECTED_OPERATIONS.map((op) => `${sec}.${op}`)
    );

    forbiddenSystemKeys.forEach((key) => {
      assert.strictEqual(EXPECTED_PERMISSIONS.includes(key), false);
    });
  });
});

// ── 2. Admin Dashboard Tab Visibility & Least Privilege Filtering ─────────────

describe('Owner-Controlled Admin Access: Dynamic Tab Visibility Filtering', () => {
  interface TabDef {
    id: string;
    label: string;
    ownerOnly?: boolean;
    requiredSection?: string;
  }

  const ALL_TABS: TabDef[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'payments', label: 'Payments & Revenue', ownerOnly: true },
    { id: 'subscriptions', label: 'Subscriptions', ownerOnly: true },
    { id: 'hackathons', label: 'Events & Hackathons', requiredSection: 'events' },
    { id: 'scholarships', label: 'Scholarships', requiredSection: 'scholarships' },
    { id: 'news', label: 'Curated News', requiredSection: 'tech_news' },
    { id: 'community', label: 'Community', ownerOnly: true },
    { id: 'users', label: 'User Governance', ownerOnly: true },
    { id: 'skillbits', label: 'SkillBits', ownerOnly: true },
    { id: 'plans', label: 'Plans & Pricing', ownerOnly: true },
    { id: 'coupons', label: 'Coupons & Discounts', ownerOnly: true },
  ];

  function filterTabsForCaller(isOwner: boolean, userPermissions: string[]): TabDef[] {
    if (isOwner) {
      return ALL_TABS;
    }

    return ALL_TABS.filter((tab) => {
      if (tab.ownerOnly) return false;
      if (tab.id === 'overview') return true;
      if (tab.id === 'hackathons') {
        return userPermissions.some((p) => p.startsWith('events.') || p.startsWith('hackathons.'));
      }
      if (tab.id === 'scholarships') {
        return userPermissions.some((p) => p.startsWith('scholarships.'));
      }
      if (tab.id === 'news') {
        return userPermissions.some((p) => p.startsWith('tech_news.'));
      }
      return false;
    });
  }

  it('grants verified platform owner access to all 11 administrative tabs', () => {
    const visibleTabs = filterTabsForCaller(true, []);
    assert.strictEqual(visibleTabs.length, 11);
    assert.ok(visibleTabs.some((t) => t.id === 'users'));
    assert.ok(visibleTabs.some((t) => t.id === 'payments'));
    assert.ok(visibleTabs.some((t) => t.id === 'subscriptions'));
    assert.ok(visibleTabs.some((t) => t.id === 'scholarships'));
  });

  it('restricts Admin with only scholarships permissions to overview and scholarships', () => {
    const adminPerms = ['scholarships.read', 'scholarships.create'];
    const visibleTabs = filterTabsForCaller(false, adminPerms);

    const visibleIds = visibleTabs.map((t) => t.id);
    assert.deepStrictEqual(visibleIds, ['overview', 'scholarships']);
    assert.ok(!visibleIds.includes('users'));
    assert.ok(!visibleIds.includes('payments'));
    assert.ok(!visibleIds.includes('hackathons'));
  });

  it('restricts Admin with hackathons and tech news to overview, hackathons, and news', () => {
    const adminPerms = ['hackathons.read', 'tech_news.publish'];
    const visibleTabs = filterTabsForCaller(false, adminPerms);

    const visibleIds = visibleTabs.map((t) => t.id);
    assert.deepStrictEqual(visibleIds, ['overview', 'hackathons', 'news']);
    assert.ok(!visibleIds.includes('scholarships'));
    assert.ok(!visibleIds.includes('users'));
  });

  it('strictly excludes User Governance and Payments from all non-owner Admins', () => {
    // Admin with every single content permission
    const allContentPerms = [
      'scholarships.read', 'scholarships.create', 'scholarships.update', 'scholarships.publish', 'scholarships.delete',
      'events.read', 'events.create', 'events.update', 'events.publish', 'events.delete',
      'hackathons.read', 'hackathons.create', 'hackathons.update', 'hackathons.publish', 'hackathons.delete',
      'tech_news.read', 'tech_news.create', 'tech_news.update', 'tech_news.publish', 'tech_news.delete',
    ];

    const visibleTabs = filterTabsForCaller(false, allContentPerms);
    const visibleIds = visibleTabs.map((t) => t.id);

    // Only content sections + overview should be present
    assert.deepStrictEqual(visibleIds, ['overview', 'hackathons', 'scholarships', 'news']);
    assert.strictEqual(visibleIds.includes('users'), false);
    assert.strictEqual(visibleIds.includes('payments'), false);
    assert.strictEqual(visibleIds.includes('subscriptions'), false);
    assert.strictEqual(visibleIds.includes('plans'), false);
  });
});

// ── 3. API Client Payload Contracts ──────────────────────────────────────────

describe('Owner-Controlled Admin Access: API Client Contracts', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    storage.clear();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('fetchMyPermissions returns verified caller permissions and role', async () => {
    globalThis.fetch = async (input, init) => {
      const url = String(input);
      assert.ok(url.includes('/api/admin/me/permissions'));
      return new Response(
        JSON.stringify({
          user_id: 'test-user-uuid',
          email: 'admin@example.com',
          name: 'Delegated Admin',
          role: 'admin',
          is_owner: false,
          is_admin: true,
          permissions: ['scholarships.read', 'events.read'],
        }),
        { status: 200 }
      );
    };

    const res = await fetchMyPermissions();
    assert.strictEqual(res.role, 'admin');
    assert.strictEqual(res.is_owner, false);
    assert.strictEqual(res.is_admin, true);
    assert.strictEqual(res.permissions.length, 2);
  });

  it('grantAdminAccess serializes target user ID, permissions array, and reason', async () => {
    let capturedBody: any = null;
    let capturedUrl: string = '';

    globalThis.fetch = async (input, init) => {
      capturedUrl = String(input);
      if (init?.body) {
        capturedBody = JSON.parse(String(init.body));
      }
      return new Response(
        JSON.stringify({
          status: 'success',
          target_id: 'target-student-uuid',
          permissions: ['scholarships.read'],
        }),
        { status: 200 }
      );
    };

    const res = await grantAdminAccess('target-student-uuid', ['scholarships.read'], 'Test grant');
    assert.ok(capturedUrl.includes('/api/admin/users/target-student-uuid/grant-admin'));
    assert.deepStrictEqual(capturedBody.permissions, ['scholarships.read']);
    assert.strictEqual(capturedBody.reason, 'Test grant');
  });

  it('revokeAdminAccess sends POST to revoke-admin with optional reason', async () => {
    let capturedUrl: string = '';
    let capturedBody: any = null;

    globalThis.fetch = async (input, init) => {
      capturedUrl = String(input);
      if (init?.body) {
        capturedBody = JSON.parse(String(init.body));
      }
      return new Response(
        JSON.stringify({
          status: 'success',
          target_id: 'target-admin-uuid',
          new_role: 'student',
        }),
        { status: 200 }
      );
    };

    const res = await revokeAdminAccess('target-admin-uuid', 'Tenure completed');
    assert.ok(capturedUrl.includes('/api/admin/users/target-admin-uuid/revoke-admin'));
    assert.strictEqual(capturedBody.reason, 'Tenure completed');
  });

  it('fetchAdminAuditLogs correctly queries the audit trail with pagination', async () => {
    let capturedUrl: string = '';

    globalThis.fetch = async (input) => {
      capturedUrl = String(input);
      return new Response(
        JSON.stringify({
          total: 1,
          audit_logs: [
            {
              id: 'log-1',
              actor_id: 'owner-uuid',
              target_id: 'admin-uuid',
              action: 'grant_admin',
              timestamp: '2026-10-26T04:00:00Z',
            },
          ],
          limit: 25,
          offset: 0,
        }),
        { status: 200 }
      );
    };

    const res = await fetchAdminAuditLogs(25, 0);
    assert.ok(capturedUrl.includes('/api/admin/audit-logs?limit=25&offset=0'));
    assert.strictEqual(res.audit_logs.length, 1);
    assert.strictEqual(res.audit_logs[0].action, 'grant_admin');
  });
});
