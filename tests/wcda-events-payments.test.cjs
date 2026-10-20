const { test } = require("node:test");
const assert = require("node:assert/strict");
const load = require("./load-typescript.cjs");

class TestEmsError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const reference = "wcda-" + "a".repeat(32);
const invoice = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  event_id: "550e8400-e29b-41d4-a716-446655440001",
  reference,
  currency: "ZAR",
  amount_cents: 35000,
  customer_email: "organiser@example.org",
  payment_mode: "test",
  status: "checkout_pending",
};
const payment = {
  status: "success",
  id: 123456,
  amount: invoice.amount_cents,
  currency: "ZAR",
  reference,
  domain: "test",
  customer: { email: invoice.customer_email },
  paid_at: "2026-10-19T16:00:00Z",
};

const calls = { db: [], provider: [] };
let currentInvoice = { ...invoice };
let currentPayment = { ...payment };
let settled = { status: "paid", receiptReference: "WCDA-RCT-TEST" };

const { checkoutConfig, gatewayConfig, initializeEventCheckout, eventPaymentReference,
  settleEms, verifiedCheckoutUrl } = load({
  "./server": {
    EmsError: TestEmsError,
    emsDatabase: async (path, options = {}) => {
      calls.db.push({ path, options });
      if (path.startsWith("wcda_ems_invoices?")) return [{ ...currentInvoice }];
      if (path === "rpc/wcda_ems_invoice_action") return settled;
      throw new Error("Unexpected database operation: " + path);
    },
  },
})("lib/ems/payments.ts");

function config(mode = "test", flag = "false") {
  process.env.PAYSTACK_MODE = mode;
  process.env.PAYSTACK_SECRET_KEY = mode === "live" ? "sk_live_ems_test_fixture" : "sk_test_ems_test_fixture";
  process.env.MEMBERSHIP_PUBLIC_ORIGIN = "https://govapps.wcsports.co.za";
  process.env.WCDA_EVENTS_LIVE_PAYMENTS_ENABLED = flag;
  process.env.WCDA_EVENTS_CHECKOUT_ENABLED = "true";
}
function resetCalls() {
  calls.db.length = 0;
  calls.provider.length = 0;
  currentInvoice = { ...invoice };
  currentPayment = { ...payment };
  settled = { status: "paid", receiptReference: "WCDA-RCT-TEST" };
}
function providerMock() {
  global.fetch = async (url, opts) => {
    calls.provider.push({ url: String(url), opts });
    return {
      ok: true,
      json: async () => ({
        status: true,
        data: String(url).includes("/initialize")
          ? { authorization_url: "https://checkout.paystack.com/test-id" }
          : { ...currentPayment },
      }),
    };
  };
}

test("WCDA Events payment protection and provider settlement regression", async (t) => {
  const env = { ...process.env };
  const fetchBackup = global.fetch;
  try {
    config();
    providerMock();

    await t.test("only properly formatted WCDA references are accepted", () => {
      assert.equal(eventPaymentReference(reference), true);
      assert.equal(eventPaymentReference("wcsa-" + "a".repeat(32)), false);
      assert.equal(eventPaymentReference("wcda-" + "b".repeat(31)), false);
      assert.equal(eventPaymentReference("wcda-" + "G".repeat(32)), false);
    });

    await t.test("live checkout remains blocked without WCDA-specific release switch", () => {
      resetCalls(); config("live", "false");
      assert.throws(() => checkoutConfig(), e => e.status === 503);
      assert.equal(calls.provider.length, 0);
      assert.equal(calls.db.length, 0);
      config("live", "");
      assert.throws(() => checkoutConfig(), e => e.status === 503);
      config("live", "true");
      assert.equal(checkoutConfig().mode, "live");
      process.env.MEMBERSHIP_PUBLIC_ORIGIN = "https://other.wcsports.co.za";
      assert.throws(() => checkoutConfig(), e => e.status === 503);
    });

    await t.test("R1 internal test requires an explicit pilot switch and cannot enable ordinary invoices", async () => {
      const pilot={ ...invoice, is_pilot_test: true, amount_cents: 100, customer_email: "ebranch@wcsports.co.za" };
      resetCalls();config("live","false");providerMock();
      process.env.WCDA_EVENTS_CHECKOUT_ENABLED="false";
      process.env.WCDA_EVENTS_LIVE_PAYMENTS_ENABLED="false";
      process.env.WCDA_EVENTS_R1_PILOT_ENABLED="false";
      assert.throws(()=>checkoutConfig(pilot),e=>e.status===503);
      process.env.WCDA_EVENTS_R1_PILOT_ENABLED="true";
      assert.equal(checkoutConfig(pilot).mode,"live");
      assert.throws(()=>checkoutConfig(invoice),e=>e.status===503);
      assert.throws(()=>checkoutConfig({...pilot,amount_cents:200}),e=>e.status===503);
      assert.throws(()=>checkoutConfig({...pilot,customer_email:"organiser@example.org"}),e=>e.status===503);
      const url=await initializeEventCheckout(pilot);
      assert.equal(url,"https://checkout.paystack.com/test-id");
      const providerData=JSON.parse(calls.provider[0].opts.body);
      assert.equal(providerData.amount,100);
      assert.equal(providerData.email,"ebranch@wcsports.co.za");
      assert.equal(providerData.currency,"ZAR");
      assert.equal(calls.provider.length,1);
    });

    await t.test("global EMS checkout gate blocks both test and live modes", async () => {
      for (const mode of ["test", "live"]) {
        resetCalls(); config(mode, "true"); providerMock();
        process.env.WCDA_EVENTS_CHECKOUT_ENABLED = "false";
        assert.throws(() => checkoutConfig(), e => e.status === 503);
        await assert.rejects(initializeEventCheckout(invoice), e => e.status === 503);
        assert.equal(calls.provider.length, 0);
        assert.equal(calls.db.length, 0);
      }
    });

    await t.test("test mode can be used for controlled no-money testing", () => {
      resetCalls(); config("test", "false");
      assert.equal(checkoutConfig().mode, "test");
      assert.equal(gatewayConfig().mode, "test");
    });

    await t.test("gateway rejects mismatched keys and unsafe origins", () => {
      resetCalls(); config("live", "true");
      process.env.PAYSTACK_SECRET_KEY = "sk_test_wrong_mode";
      assert.throws(() => gatewayConfig(), e => e.status === 503);
      config();
      process.env.MEMBERSHIP_PUBLIC_ORIGIN = "http://govapps.wcsports.co.za";
      assert.throws(() => gatewayConfig(), e => e.status === 503);
      config();
      process.env.MEMBERSHIP_PUBLIC_ORIGIN = "https://govapps.wcsports.co.za/untrusted";
      assert.throws(() => gatewayConfig(), e => e.status === 503);
    });

    await t.test("untrusted checkout URLs cannot be sent to organisers", () => {
      for (const url of [
        "http://checkout.paystack.com/test",
        "https://checkout.paystack.com.evil.com/",
        "https://evil.example/",
        "https://username@checkout.paystack.com/",
        "https://checkout.paystack.com:8443/",
      ]) assert.throws(() => verifiedCheckoutUrl(url), e => e.status === 502);
      assert.equal(verifiedCheckoutUrl("https://checkout.paystack.com/test"), "https://checkout.paystack.com/test");
    });

    await t.test("official invoice details, not browser amounts, start test checkout", async () => {
      resetCalls(); config("test", "false"); providerMock();
      const url = await initializeEventCheckout(invoice);
      assert.equal(url, "https://checkout.paystack.com/test-id");
      assert.equal(calls.provider.length, 1);
      const args = JSON.parse(calls.provider[0].opts.body);
      assert.equal(args.amount, 35000);
      assert.equal(args.currency, "ZAR");
      assert.equal(args.email, invoice.customer_email);
      assert.equal(args.reference, reference);
      assert.equal(args.callback_url, "https://govapps.wcsports.co.za/WCDA-Events/payments/return");
    });

    await t.test("disabled live switch prevents calls to Paystack initialize", async () => {
      resetCalls(); config("live", "false"); providerMock();
      await assert.rejects(initializeEventCheckout(invoice), e => e.status === 503);
      assert.equal(calls.provider.length, 0);
    });

    await t.test("successful server verification settles only the matching official invoice", async () => {
      resetCalls(); config(); providerMock();
      const result = await settleEms(reference);
      assert.deepEqual(result, { paid: true, receiptReference: "WCDA-RCT-TEST" });
      assert.equal(calls.provider.length, 1);
      assert.ok(calls.provider[0].url.endsWith("/verify/" + reference));
      assert.equal(calls.db.length, 2);
      const settlement = JSON.parse(calls.db[1].options.body);
      assert.equal(settlement.p_action, "settle");
      assert.equal(settlement.p_data.amountCents, invoice.amount_cents);
      assert.equal(settlement.p_data.mode, "test");
      assert.equal(settlement.p_data.transactionId, "123456");
    });

    await t.test("pending payments are never marked paid", async () => {
      resetCalls(); config(); providerMock();
      currentPayment.status = "pending";
      assert.deepEqual(await settleEms(reference), { paid: false });
      assert.equal(calls.db.length, 1);
    });

    await t.test("payment tampering never reaches durable settlement", async () => {
      config(); providerMock();
      for (const mismatch of [
        { amount: 100 }, { currency: "USD" }, { domain: "live" },
        { reference: "wcda-" + "b".repeat(32) }, { customer: { email: "other@example.org" } },
        { id: "123456" }, { paid_at: "garbage" },
      ]) {
        resetCalls();
        currentPayment = { ...payment, ...mismatch };
        await assert.rejects(settleEms(reference), e => e.status === 403);
        assert.equal(calls.db.length, 1);
      }
    });

    await t.test("the verify/settle path stays available when live checkout is turned off", async () => {
      resetCalls(); config("live", "false"); providerMock();
      currentInvoice.payment_mode = "live";
      currentPayment.domain = "live";
      const result = await settleEms(reference);
      assert.equal(result.paid, true);
    });

    await t.test("failed durable settlement is not misrepresented as paid", async () => {
      resetCalls(); config(); providerMock();
      settled = { status: "pending" };
      await assert.rejects(settleEms(reference), e => e.status === 502);
    });
  } finally {
    global.fetch = fetchBackup;
    for (const key of Object.keys(process.env))
      if (!(key in env)) delete process.env[key];
    Object.assign(process.env, env);
  }
});
