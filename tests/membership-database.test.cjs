const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const { PGlite } = require("@electric-sql/pglite");
const tenant = "11111111-1111-4111-8111-111111111111";
const actor = "registry@example.org";
const hash = "a".repeat(64);
test("actual PostgreSQL migration, privileges and atomic membership ledger", async (t) => {
  const db = new PGlite();
  try {
    await db.exec(
      "create role anon; create role authenticated; create role service_role bypassrls;",
    );
    const migration = fs.readFileSync(
      "supabase/migrations/20261002_001_membership_invoices.sql",
      "utf8",
    );
    await db.exec(migration);
    await db.exec(migration);
    await db.query(
      "insert into public.wcsa_registry_staff(tenant_id,email) values($1,$2)",
      [tenant, actor],
    );
    const query = async (sql, args = []) => (await db.query(sql, args)).rows;
    let bill;
    await t.test(
      "anonymous and authenticated callers cannot read finance tables or execute functions",
      async () => {
        for (const role of ["anon", "authenticated"]) {
          await db.exec(`set role ${role}`);
          try {
            await assert.rejects(
              query("select * from public.wcsa_membership_invoices"),
              (e) => e.code === "42501",
            );
            await assert.rejects(
              query("select public.wcsa_claim_invoice($1,$2)", [hash, "test"]),
              (e) => e.code === "42501",
            );
          } finally {
            await db.exec("reset role");
          }
        }
      },
    );
    await db.exec("set role service_role");
    await t.test("service role has no direct write privileges", async () => {
      await assert.rejects(
        query(
          "insert into public.wcsa_membership_organisations(name,emis) values($1,$2)",
          ["Forged", "0108470716"],
        ),
        (e) => e.code === "42501",
      );
    });
    const issue = (
      email = actor,
      emis = "0108470716",
      review = "REVIEW-001",
      token = hash,
      tid = tenant,
    ) =>
      query(
        "select public.wcsa_registry_issue_invoice($1,$2,$3,$4,$5,$6,$7,$8,$9) bill",
        [
          tid,
          email,
          "School",
          emis,
          "payer@example.org",
          review,
          "Authority and required documents checked",
          token,
          "test",
        ],
      );
    await t.test(
      "unauthorised staff and wrong tenants cannot issue invoices",
      async () => {
        await assert.rejects(
          issue("unapproved@example.org"),
          (e) => e.code === "42501",
        );
        await assert.rejects(
          issue(
            actor,
            "0108470716",
            "REVIEW-001",
            hash,
            "22222222-2222-4222-8222-222222222222",
          ),
          (e) => e.code === "42501",
        );
        assert.equal(
          (
            await query(
              "select count(*)::int n from public.wcsa_membership_invoices",
            )
          )[0].n,
          0,
        );
      },
    );
    await t.test(
      "approval creates a fixed R350 invoice and persistent membership state",
      async () => {
        bill = (await issue())[0].bill;
        assert.equal(bill.amount, 35000);
        assert.equal(bill.currency, "ZAR");
        assert.equal(bill.year, "2027");
        assert.equal(bill.status, "approved_for_payment");
        assert.match(bill.reference, /^wcsa-/);
        assert.equal(
          (await query("select status from public.wcsa_membership_states"))[0]
            .status,
          "approved_for_payment",
        );
      },
    );
    await t.test(
      "duplicate school/year and review cannot create another charge",
      async () => {
        await assert.rejects(
          issue(actor, "0108470716", "REVIEW-OTHER", "b".repeat(64)),
          (e) => e.code === "23505",
        );
        assert.equal(
          (
            await query(
              "select count(*)::int n from public.wcsa_membership_invoices",
            )
          )[0].n,
          1,
        );
      },
    );
    await t.test(
      "checkout lease prevents concurrent initialization; saved checkout is reused",
      async () => {
        const first = (
          await query("select public.wcsa_claim_invoice($1,$2) bill", [
            hash,
            "test",
          ])
        )[0].bill;
        const second = (
          await query("select public.wcsa_claim_invoice($1,$2) bill", [
            hash,
            "test",
          ])
        )[0].bill;
        assert.equal(first.checkoutPending, false);
        assert.equal(second.checkoutPending, true);
        assert.equal(first.reference, second.reference);
        await query("select public.wcsa_save_checkout($1,$2,$3)", [
          bill.reference,
          "https://checkout.paystack.com/fixture",
          "test",
        ]);
        const third = (
          await query("select public.wcsa_claim_invoice($1,$2) bill", [
            hash,
            "test",
          ])
        )[0].bill;
        assert.equal(
          third.checkoutUrl,
          "https://checkout.paystack.com/fixture",
        );
        assert.equal(third.checkoutPending, false);
      },
    );
    await t.test(
      "invalid codes and cross-mode invoices are unavailable",
      async () => {
        await assert.rejects(
          query("select public.wcsa_claim_invoice($1,$2)", [
            "b".repeat(64),
            "test",
          ]),
          (e) => e.code === "22023",
        );
        await assert.rejects(
          query("select public.wcsa_claim_invoice($1,$2)", [hash, "live"]),
          (e) => e.code === "22023",
        );
      },
    );
    const settle = (ref = bill.reference, amount = 35000, id = "123") =>
      query("select public.wcsa_settle_invoice($1,$2,$3,$4,$5,$6) result", [
        ref,
        id,
        amount,
        "ZAR",
        "test",
        "2026-10-02T12:00:00Z",
      ]);
    await t.test(
      "mismatched payment rolls back without receipt or activation",
      async () => {
        await assert.rejects(
          settle(bill.reference, 1),
          (e) => e.code === "22023",
        );
        assert.equal(
          (
            await query(
              "select count(*)::int n from public.wcsa_membership_receipts",
            )
          )[0].n,
          0,
        );
        assert.equal(
          (await query("select status from public.wcsa_membership_states"))[0]
            .status,
          "approved_for_payment",
        );
      },
    );
    await t.test(
      "duplicate successful events have one payment, receipt and activation",
      async () => {
        const a = (await settle())[0].result;
        const b = (await settle())[0].result;
        assert.equal(a.receiptNumber, b.receiptNumber);
        for (const table of ["payments", "receipts"])
          assert.equal(
            (
              await query(
                `select count(*)::int n from public.wcsa_membership_${table}`,
              )
            )[0].n,
            1,
          );
        assert.equal(
          (await query("select status from public.wcsa_membership_states"))[0]
            .status,
          "active",
        );
        assert.equal(
          (
            await query(
              "select count(*)::int n from public.wcsa_membership_events",
            )
          )[0].n,
          2,
        );
      },
    );
    await t.test(
      "conflicting success and reused provider transaction ID do not settle",
      async () => {
        await assert.rejects(
          settle(bill.reference, 35000, "456"),
          (e) => e.code === "22023",
        );
        const other = (
          await issue(actor, "0108470717", "REVIEW-002", "c".repeat(64))
        )[0].bill;
        await assert.rejects(
          settle(other.reference),
          (e) => e.code === "23505",
        );
        assert.equal(
          (
            await query(
              "select status from public.wcsa_membership_invoices where reference=$1",
              [other.reference],
            )
          )[0].status,
          "approved_for_payment",
        );
      },
    );
    await t.test(
      "rate limit persists independent of failed invoice claims",
      async () => {
        for (let i = 0; i < 20; i++)
          assert.equal(
            (
              await query("select public.wcsa_payment_rate_limit($1) allowed", [
                "d".repeat(64),
              ])
            )[0].allowed,
            true,
          );
        assert.equal(
          (
            await query("select public.wcsa_payment_rate_limit($1) allowed", [
              "d".repeat(64),
            ])
          )[0].allowed,
          false,
        );
      },
    );
    await db.exec("reset role");
    await t.test(
      "expired codes cannot initialize, but an already-made payment can be reconciled",
      async () => {
        const expired = (
          await query(
            "select reference from public.wcsa_membership_invoices where token_hash=$1",
            ["c".repeat(64)],
          )
        )[0].reference;
        await query(
          "update public.wcsa_membership_invoices set expires_at=now()-interval '1 day' where reference=$1",
          [expired],
        );
        await db.exec("set role service_role");
        await assert.rejects(
          query("select public.wcsa_claim_invoice($1,$2)", [
            "c".repeat(64),
            "test",
          ]),
          (e) => e.code === "22023",
        );
        assert.equal(
          (await settle(expired, 35000, "789"))[0].result.status,
          "paid",
        );
        await db.exec("reset role");
      },
    );
  } finally {
    await db.close();
  }
});
