import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert";
import {
  supabase,
  createClient,
  setClientInstance,
  resetClientInstance,
} from "@/lib/supabase";
import {
  classifyDeploymentEnvironment,
  resolveRedirectOrigin,
} from "@/app/auth/callback/route";

describe("SYS-05: Test Reliability & Clean-Environment Initialization Suite", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
    resetClientInstance();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    resetClientInstance();
  });

  describe("1. Supabase Client Lazy Initialization & Error Transparency", () => {
    it("allows importing lib/supabase without requiring environment variables", () => {
      // The fact that this test is executing proves module import did not crash
      assert.ok(supabase, "supabase proxy export must exist");
    });

    it("throws intentional error when accessing client without required environment variables", () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      resetClientInstance();

      assert.throws(
        () => {
          // Accessing any property triggers lazy client initialization
          supabase.from("any_table");
        },
        {
          name: "Error",
          message: /Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables/,
        }
      );
    });

    it("supports deterministic client injection via setClientInstance", () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      const mockQueryBuilder = {
        select: () => ({ data: [{ id: "mock_123" }], error: null }),
      };
      const mockClient = {
        from: (table: string) => {
          assert.strictEqual(table, "test_table");
          return mockQueryBuilder;
        },
      } as any;

      setClientInstance(mockClient);

      // Accessing supabase must delegate to the mock client without throwing
      const builder = supabase.from("test_table");
      const res = builder.select() as any;
      assert.deepStrictEqual(res.data, [{ id: "mock_123" }]);
    });

    it("resets client instance via resetClientInstance", () => {
      setClientInstance({ mock: true } as any);
      resetClientInstance();

      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      assert.throws(() => {
        supabase.auth;
      });
    });

    it("preserves correct client receiver 'this' during method calls", () => {
      let receiverCaptured: any = null;
      const mockClient = {
        customMethod(this: any, arg: string) {
          receiverCaptured = this;
          return `handled_${arg}`;
        },
      } as any;

      setClientInstance(mockClient);

      const result = (supabase as any).customMethod("test_call");
      assert.strictEqual(result, "handled_test_call");
      assert.strictEqual(receiverCaptured, mockClient, "method must be invoked with client as this");
    });

    it("evaluates client getters with client as the receiver", () => {
      let getterReceiver: any = null;
      const mockClient = {
        get customGetter() {
          getterReceiver = this;
          return "getter_value";
        },
      } as any;

      setClientInstance(mockClient);

      const val = (supabase as any).customGetter;
      assert.strictEqual(val, "getter_value");
      assert.strictEqual(getterReceiver, mockClient, "getter must evaluate with client as receiver");
    });

    it("correctly executes chained query-builder and auth operations", async () => {
      const mockQueryBuilder = {
        select: (cols: string) => {
          assert.strictEqual(cols, "id, name");
          return {
            eq: (col: string, val: any) => {
              assert.strictEqual(col, "is_active");
              assert.strictEqual(val, true);
              return {
                order: (field: string) => {
                  assert.strictEqual(field, "display_order");
                  return Promise.resolve({ data: [{ id: "1", name: "Topic A" }], error: null });
                },
              };
            },
          };
        },
      };

      const mockAuth = {
        getSession: async () => ({ data: { session: { user: { id: "u1" } } }, error: null }),
      };

      const mockClient = {
        from: (table: string) => {
          assert.strictEqual(table, "topics");
          return mockQueryBuilder;
        },
        rpc: (fnName: string, params: any) => {
          assert.strictEqual(fnName, "get_topic_questions");
          return Promise.resolve({ data: [{ id: "q1" }], error: null });
        },
        auth: mockAuth,
      } as any;

      setClientInstance(mockClient);

      // Chained from().select().eq().order()
      const res = (await (supabase as any)
        .from("topics")
        .select("id, name")
        .eq("is_active", true)
        .order("display_order")) as any;
      assert.deepStrictEqual(res.data, [{ id: "1", name: "Topic A" }]);

      // auth.getSession()
      const authRes = await supabase.auth.getSession();
      assert.strictEqual(authRes.data?.session?.user?.id, "u1");

      // rpc()
      const rpcRes = await (supabase as any).rpc("get_topic_questions", { p_topic_id: "t1" });
      assert.deepStrictEqual(rpcRes.data, [{ id: "q1" }]);
    });

    it("createClient() returns a stable client instance when configuration is present", () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = "https://mockproject12345.supabase.co";
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSJ9.mock";
      resetClientInstance();

      const client1 = createClient();
      const client2 = createClient();
      assert.strictEqual(client1, client2, "createClient must return stable instance in test/browser environment");

      // Accessing proxy properties should access the same client instance
      const proxyFrom = supabase.from;
      assert.strictEqual(typeof proxyFrom, "function");

      // After reset, a new instance is created
      resetClientInstance();
      const client3 = createClient();
      assert.notStrictEqual(client1, client3, "resetClientInstance must clear cached instance");
    });
  });

  describe("2. Deployment Environment Variable Contract & Collision Resistance", () => {
    beforeEach(() => {
      delete process.env.APP_ENV;
      delete process.env.ENVIRONMENT;
      delete process.env.VERCEL_ENV;
    });

    it("resolves production when APP_ENV=production alone is provided", () => {
      process.env.APP_ENV = "production";
      assert.strictEqual(classifyDeploymentEnvironment(), "production");
    });

    it("resolves production when ENVIRONMENT=production alone is provided", () => {
      process.env.ENVIRONMENT = "production";
      assert.strictEqual(classifyDeploymentEnvironment(), "production");
    });

    it("resolves staging when matching APP_ENV=staging and ENVIRONMENT=staging are provided", () => {
      process.env.APP_ENV = "staging";
      process.env.ENVIRONMENT = "staging";
      assert.strictEqual(classifyDeploymentEnvironment(), "staging");
    });

    it("rejects contradictory APP_ENV=production and ENVIRONMENT=development as invalid", () => {
      process.env.APP_ENV = "production";
      process.env.ENVIRONMENT = "development";
      assert.strictEqual(classifyDeploymentEnvironment(), "invalid");
    });

    it("rejects contradictory APP_ENV=staging and ENVIRONMENT=development as invalid", () => {
      process.env.APP_ENV = "staging";
      process.env.ENVIRONMENT = "development";
      assert.strictEqual(classifyDeploymentEnvironment(), "invalid");
    });

    it("treats development synonyms (development, dev, local) as compatible without collision", () => {
      process.env.APP_ENV = "development";
      process.env.ENVIRONMENT = "local";
      assert.strictEqual(classifyDeploymentEnvironment(), "development");
    });

    it("fails closed when no deployment environment indicators are present", () => {
      assert.strictEqual(classifyDeploymentEnvironment(), "invalid");
    });
  });
});
