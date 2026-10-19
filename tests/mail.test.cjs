const { test } = require("node:test");
const assert = require("node:assert/strict");
const load = require("./load-typescript.cjs")();
const { sendGovAppsNotice, isGovAppsMailConfigured } = load("lib/mail/govapps.ts");

const notice = {
  kind: "invoice_issued",
  to: "member@example.org",
  reference: "INV-2026-0001",
  organisation: "A & B <School>",
};

function configure() {
  Object.assign(process.env, {
    WCSA_MAIL_TENANT_ID: "11111111-1111-4111-8111-111111111111",
    WCSA_MAIL_CLIENT_ID: "22222222-2222-4222-8222-222222222222",
    WCSA_MAIL_CLIENT_SECRET: "unit-test-secret",
    WCSA_MAIL_SENDER: "govapps@wcsports.co.za",
  });
}

test("GovApps Microsoft 365 email integration fails closed and uses fixed routing", async () => {
  const originalEnv = { ...process.env };
  const originalFetch = global.fetch;
  try {
    for (const key of Object.keys(process.env))
      if (key.startsWith("WCSA_MAIL_")) delete process.env[key];
    let calls = [];
    global.fetch = async (...args) => { calls.push(args); throw new Error("Network must not be called"); };
    assert.equal(isGovAppsMailConfigured(), false);
    assert.equal(await sendGovAppsNotice(notice), "not_configured");
    assert.equal(calls.length, 0);

    configure();
    assert.equal(isGovAppsMailConfigured(), true);
    calls = [];
    global.fetch = async (url, options) => {
      calls.push({ url: String(url), options });
      return calls.length === 1
        ? { ok: true, json: async () => ({ access_token: "opaque-fixture" }) }
        : { status: 202 };
    };
    assert.equal(await sendGovAppsNotice(notice), "accepted");
    assert.equal(calls.length, 2);
    assert.match(calls[0].url, /^https:\/\/login\.microsoftonline\.com\//);
    assert.match(calls[1].url, /^https:\/\/graph\.microsoft\.com\/v1\.0\/users\/govapps%40wcsports\.co\.za\/sendMail$/);
    assert.equal(calls[1].options.headers.Authorization, "Bearer opaque-fixture");
    const body = JSON.parse(calls[1].options.body);
    assert.equal(body.message.toRecipients[0].emailAddress.address, "member@example.org");
    assert.equal(body.message.replyTo[0].emailAddress.address, "Finances@wcsports.co.za");
    assert.match(body.message.body.content, /A &amp; B &lt;School&gt;/);
    assert.doesNotMatch(body.message.body.content, /A & B <School>/);

    calls = [];
    global.fetch = async () => { calls.push(1); return { ok: false, status: 401 }; };
    assert.equal(await sendGovAppsNotice(notice), "failed");
    assert.equal(calls.length, 1);

    process.env.WCSA_MAIL_SENDER = "stranger@another-domain.org";
    calls = [];
    assert.equal(await sendGovAppsNotice(notice), "not_configured");
    assert.equal(calls.length, 0);

    process.env.WCSA_MAIL_SENDER = "govapps@wcsports.co.za";
    calls = [];
    assert.equal(await sendGovAppsNotice({ ...notice, to: "not an email" }), "failed");
    assert.equal(calls.length, 0);
  } finally {
    global.fetch = originalFetch;
    for (const key of Object.keys(process.env))
      if (!(key in originalEnv)) delete process.env[key];
    Object.assign(process.env, originalEnv);
  }
});
