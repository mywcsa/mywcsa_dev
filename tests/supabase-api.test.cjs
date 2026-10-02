const { test } = require("node:test");
const assert = require("node:assert/strict");
const loader = require("./load-typescript.cjs");
const tenant = "11111111-1111-4111-8111-111111111111";
const identity = { user: { email: "Registry@Example.org" } };
test("Supabase adapter and staff API authorization", async (t) => {
  const env = { ...process.env };
  const originalFetch = global.fetch;
  try {
    Object.assign(process.env, {
      SUPABASE_URL: "https://fixture.supabase.co",
      SUPABASE_SECRET_KEY: "sb_secret_fixture",
      PAYSTACK_MODE: "test",
      PAYSTACK_SECRET_KEY: "sk_test_fixture",
      MEMBERSHIP_PUBLIC_ORIGIN: "https://govapps.wcsports.co.za",
      AUTH_MICROSOFT_ENTRA_ID_ISSUER: `https://login.microsoftonline.com/${tenant}/v2.0`,
    });
    delete process.env.WCSA_AMS_API_URL;
    delete process.env.WCSA_AMS_API_KEY;
    let session = identity;
    let calls = [];
    let fixtures = {};
    global.fetch = async (url, options) => {
      calls.push({ url, options });
      const name = url.split("/").at(-1);
      const item = fixtures[name] ?? { status: 200, body: [] };
      return { ok: item.status === 200, json: async () => item.body };
    };
    const load = loader({ "@/auth": { auth: async () => session } });
    const api = load("app/api/ams/membership-invoices/route.ts");
    const db = load("lib/ams/supabase.ts");
    const payments = load("lib/payments/paystack.ts");
    const request = (body, origin = "https://govapps.wcsports.co.za") =>
      new Request(
        "https://govapps.wcsports.co.za/api/ams/membership-invoices",
        {
          method: "POST",
          headers: { origin, "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
      );
    const valid = {
      organisationName: "School",
      emis: "0108470716",
      email: "payer@example.org",
      reviewReference: "REF-001",
      reviewNotes: "Documents and authority checked",
      reviewConfirmed: true,
    };
    await t.test(
      "anonymous staff API access is rejected before database access",
      async () => {
        session = null;
        calls = [];
        assert.equal((await api.GET()).status, 401);
        assert.equal((await api.POST(request(valid))).status, 401);
        assert.equal(calls.length, 0);
        session = identity;
      },
    );
    await t.test(
      "common Microsoft issuer is refused for Registry operations",
      async () => {
        process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER =
          "https://login.microsoftonline.com/common/v2.0";
        calls = [];
        assert.equal((await api.GET()).status, 503);
        assert.equal(calls.length, 0);
        process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER = `https://login.microsoftonline.com/${tenant}/v2.0`;
      },
    );
    await t.test(
      "CSRF and incomplete review never reach the database",
      async () => {
        calls = [];
        assert.equal(
          (await api.POST(request(valid, "https://evil.example"))).status,
          403,
        );
        assert.equal(
          (await api.POST(request({ ...valid, reviewConfirmed: false })))
            .status,
          400,
        );
        assert.equal(calls.length, 0);
      },
    );
    await t.test(
      "Registry denial remains 403, not an apparent approval",
      async () => {
        fixtures = {
          wcsa_registry_issue_invoice: { status: 403, body: { code: "42501" } },
        };
        const response = await api.POST(request(valid));
        assert.equal(response.status, 403);
        assert.equal((await response.json()).paymentCode, undefined);
      },
    );
    await t.test(
      "only hash is persisted and actor/mode are server controlled",
      async () => {
        calls = [];
        fixtures = {
          wcsa_registry_issue_invoice: {
            status: 200,
            body: { reference: "wcsa-fixture-reference-001" },
          },
        };
        const response = await api.POST(
          request({
            ...valid,
            actor: "attacker",
            mode: "live",
            amount: 1,
            status: "paid",
          }),
        );
        const result = await response.json();
        assert.equal(response.status, 201);
        assert.equal(result.paymentCode.length, 43);
        const body = JSON.parse(calls[0].options.body);
        assert.equal(body.p_actor, "registry@example.org");
        assert.equal(body.p_tenant, tenant);
        assert.equal(body.p_mode, "test");
        assert.equal(body.p_token_hash, db.tokenHash(result.paymentCode));
        assert(!calls[0].options.body.includes(result.paymentCode));
        assert.equal(calls[0].options.headers.apikey, "sb_secret_fixture");
        assert.equal(calls[0].options.headers.Authorization, undefined);
      },
    );
    await t.test(
      "project credentials never go to another host or URL path",
      async () => {
        calls = [];
        process.env.SUPABASE_URL = "https://evil.example";
        await assert.rejects(
          db.rpc("wcsa_setup_status"),
          (e) => e.status === 503,
        );
        process.env.SUPABASE_URL = "https://fixture.supabase.co/rest/v1";
        await assert.rejects(
          db.rpc("wcsa_setup_status"),
          (e) => e.status === 503,
        );
        assert.equal(calls.length, 0);
        process.env.SUPABASE_URL = "https://fixture.supabase.co";
      },
    );
    const bill = {
      reference: "wcsa-550e8400-e29b-41d4-a716-446655440000",
      status: "approved_for_payment",
      initiative: "WCSSA",
      category: "School",
      year: "2027",
      amount: 35000,
      currency: "ZAR",
      email: "payer@example.org",
      organisationName: "School",
      expiresAt: "2099-01-01T00:00:00Z",
      mode: "test",
      checkoutUrl: "https://checkout.paystack.com/fixture",
    };
    await t.test(
      "saved checkout avoids duplicate Paystack initialization",
      async () => {
        calls = [];
        fixtures = {
          wcsa_payment_rate_limit: { status: 200, body: true },
          wcsa_claim_invoice: { status: 200, body: bill },
        };
        assert.deepEqual(
          await payments.checkout(
            "a".repeat(43),
            "https://govapps.wcsports.co.za",
          ),
          { url: bill.checkoutUrl },
        );
        assert.equal(calls.length, 2);
        assert(
          calls.every((c) => c.url.startsWith("https://fixture.supabase.co/")),
        );
      },
    );
    await t.test(
      "rate limit and initialization lease stop concurrent attempts",
      async () => {
        fixtures.wcsa_payment_rate_limit.body = false;
        calls = [];
        await assert.rejects(
          payments.checkout("a".repeat(43), "https://govapps.wcsports.co.za"),
          (e) => e.status === 429,
        );
        assert.equal(calls.length, 1);
        fixtures.wcsa_payment_rate_limit.body = true;
        fixtures.wcsa_claim_invoice.body = {
          ...bill,
          checkoutUrl: null,
          checkoutPending: true,
        };
        calls = [];
        await assert.rejects(
          payments.checkout("a".repeat(43), "https://govapps.wcsports.co.za"),
          (e) => e.status === 409,
        );
        assert.equal(calls.length, 2);
      },
    );
  } finally {
    global.fetch = originalFetch;
    for (const key of Object.keys(process.env))
      if (!(key in env)) delete process.env[key];
    Object.assign(process.env, env);
  }
});
